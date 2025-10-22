// src/AdminBlogs.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./AdminBlogs.css";
import { AuthContext } from "../../context/AuthContext";
import moment from "moment";

const formatDate = (isoString) => moment(isoString).format("DD MMM YYYY");

const AdminBlogs = () => {
	const { auth } = useContext(AuthContext);
	const navigate = useNavigate();

	// State management
	const [activeTab, setActiveTab] = useState("view");
	const [blogs, setBlogs] = useState([]);
	const [newBlog, setNewBlog] = useState({
		title: "",
		description: "",     // maps to content.text
		image: "",           // maps to content.images[0].url
		type: "Blog",        // "Blog" | "Video"
		tags: "",            // comma-separated -> array
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [successAlert, setSuccessAlert] = useState(null);

	// Fetch all blogs from webhook API (matches BlogsVideosScreen)
	useEffect(() => {
		fetchBlogs();
	}, []);

	const fetchBlogs = async () => {
		setIsLoading(true);
		try {
			const res = await axios.get(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/webhook/getAllBlogs/`);
			// expected shape: { blogs: [...] }
			const items = Array.isArray(res.data?.blogs) ? res.data.blogs : [];
			// sort by timestamp desc (matches screen)
			const sorted = items.sort(
				(a, b) => new Date(b.timestamp) - new Date(a.timestamp)
			);
			setBlogs(sorted);
			setError(null);
		} catch (err) {
			console.error("Error fetching blogs:", err);
			setError("Failed to fetch blogs. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle form input change
	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewBlog((prev) => ({ ...prev, [name]: value }));
	};

	// Add a new blog post to webhook API with the structure the screen expects
	const addBlog = async () => {
		if (!newBlog.title || !newBlog.description) {
			setError("Please fill required fields (title and content)!");
			return;
		}

		const authorFirstName = auth.user?.firstName || "Unknown";
		const authorLastName = auth.user?.lastName || "Admin";
		const fullAuthorName = `${authorFirstName} ${authorLastName}`.trim();

		const tagsArray = newBlog.tags
			? newBlog.tags.split(",").map((t) => t.trim()).filter(Boolean)
			: [];

		// Payload matching BlogsVideosScreen
		const payload = {
			title: newBlog.title,
			type: newBlog.type || "Blog",
			author: fullAuthorName,
			tags: tagsArray,
			content: {
				text: newBlog.description,
				images: newBlog.image ? [{ url: newBlog.image }] : [],
			},
			timestamp: new Date().toISOString(),
		};

		setIsLoading(true);
		try {
			await axios.post(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/webhook/createBlog`, payload);
			await fetchBlogs();

			setNewBlog({
				title: "",
				description: "",
				image: "",
				type: "Blog",
				tags: "",
			});

			setSuccessAlert("Blog post added successfully!");
			setTimeout(() => setSuccessAlert(null), 3000);
			setError(null);
		} catch (err) {
			console.error("Error adding blog:", err);
			setError("Failed to create blog. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Delete a blog post via webhook API
	const deleteBlog = async (id) => {
		if (!window.confirm("Are you sure you want to delete this blog post?")) return;

		setIsLoading(true);
		try {
			await axios.delete(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/webhook/deleteBlog/${id}`);
			setBlogs((prev) => prev.filter((b) => b._id !== id));
			setSuccessAlert("Blog deleted successfully!");
			setTimeout(() => setSuccessAlert(null), 3000);
			setError(null);
		} catch (err) {
			console.error("Error deleting blog:", err);
			setError("Failed to delete blog. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateClick = (blog) => {
		navigate(`/admin/blogs/update/${blog._id}`, { state: { initialBlog: blog } });
	};

	return (
		<div className="admin-blogs">
			<h1>Admin Blog Management</h1>

			{/* Tabs */}
			<div className="blog-tabs">
				<button
					className={`tab-button ${activeTab === "view" ? "active" : ""}`}
					onClick={() => setActiveTab("view")}
				>
					View All Blogs
				</button>
				<button
					className={`tab-button ${activeTab === "add" ? "active" : ""}`}
					onClick={() => setActiveTab("add")}
				>
					Add New Blog
				</button>
				<button
					className={`tab-button ${activeTab === "generate" ? "active" : ""}`}
					onClick={() => setActiveTab("generate")}
				>
					Generate Content
				</button>
			</div>

			{/* Alerts */}
			{error && <div className="error-alert">{error}</div>}
			{successAlert && <div className="success-alert">{successAlert}</div>}

			{/* View */}
			{activeTab === "view" && (
				<div className="blog-list">
					<h2>All Blogs</h2>
					{isLoading && <p className="loading-text">Loading blogs...</p>}
					{!isLoading && blogs.length === 0 && <p>No blogs available.</p>}
					{blogs.length > 0 && (
						<div className="blogs-container">
							{blogs.map((blog) => {
								const img =
									blog?.content?.images?.length ? blog.content.images[0].url : "";
								const desc = blog?.content?.text || "";
								return (
									<div key={blog._id} className="blog-item">
										<h3>{blog.title}</h3>
										<p className="blog-meta">
											<span>By: {blog.author || "Anonymous"} | {formatDate(blog.timestamp)}</span>
											{blog.type && <span className="blog-category">{blog.type}</span>}
										</p>
										<p className="blog-excerpt">
											{desc.substring(0, 150)}
											{desc.length > 150 ? "..." : ""}
										</p>
										{img && (
											<div className="blog-image">
												<img src={img} alt={blog.title} />
											</div>
										)}
										{Array.isArray(blog.tags) && blog.tags.length > 0 && (
											<div className="blog-tags">
												{blog.tags.map((t, i) => (
													<span key={i} className="tag">#{t}</span>
												))}
											</div>
										)}
										<div className="blog-actions">
											<button
												onClick={() => handleUpdateClick(blog)}
												className="delete-btn"
												disabled={isLoading}
											>
												Update
											</button>
											<button
												onClick={() => deleteBlog(blog._id)}
												className="delete-btn"
												disabled={isLoading}
											>
												Delete
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* Add */}
			{activeTab === "add" && (
				<div className="blog-form">
					<h2>Add New Blog</h2>

					<div className="form-group">
						<label htmlFor="title">Blog Title <span className="required">*</span></label>
						<input
							type="text"
							id="title"
							name="title"
							value={newBlog.title}
							onChange={handleChange}
							placeholder="Enter blog title"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="description">Blog Content <span className="required">*</span></label>
						<textarea
							id="description"
							name="description"
							value={newBlog.description}
							onChange={handleChange}
							placeholder="Enter blog content"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="type">Type</label>
						<select
							id="type"
							name="type"
							value={newBlog.type}
							onChange={handleChange}
						>
							<option value="Blog">Blog</option>
							<option value="Video">Video</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="tags">Tags (comma separated)</label>
						<input
							type="text"
							id="tags"
							name="tags"
							value={newBlog.tags}
							onChange={handleChange}
							placeholder="e.g., health, herbs, diet"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="image">Image URL</label>
						<input
							type="text"
							id="image"
							name="image"
							value={newBlog.image}
							onChange={handleChange}
							placeholder="Enter image URL (optional)"
						/>
						{newBlog.image && (
							<div className="image-preview">
								<img src={newBlog.image} alt="Preview" />
							</div>
						)}
					</div>

					<button
						onClick={addBlog}
						disabled={isLoading}
						className="submit-btn"
					>
						{isLoading ? "Adding..." : "Add Blog"}
					</button>
				</div>
			)}

			{/* Generate */}
			{activeTab === "generate" && (
				<div className="generate-blog">
					<h2>Generate Blog Content</h2>
					<p>
						This feature currently works via an external tool. Clicking the button below will open{" "}
						<a href="https://agiagentworld.com/" target="_blank" rel="noopener noreferrer">
							AGI Agent World
						</a>{" "}
						in a new tab.
					</p>
					<p>
						Once your content is ready, copy it back here and add it using the "Add New Blog" tab.
					</p>
					<p>Happy creating! 🚀</p>

					<button
						onClick={() =>
							window.open("https://agiagentworld.com/", "_blank", "noopener,noreferrer")
						}
					>
						Go to AGI Agent World
					</button>
				</div>
			)}
		</div>
	);
};

export default AdminBlogs;
