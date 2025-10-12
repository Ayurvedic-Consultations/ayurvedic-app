import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./HealthBlogs.css";
import { AuthContext } from "../../context/AuthContext";
import downArrow from "../../media/downArrow.png";
import RichTextEditor from "../../components/RichTextEditor";

function HealthBlogs() {
	const { auth } = useContext(AuthContext);
	const doctorId = auth.user ? auth.user.id : null;
	const [showBlog, setShowBlog] = useState(false);
	const handleShowBlog = () => {
		setShowBlog(!showBlog);
	};

	const [activeTab, setActiveTab] = useState("recent");
	const [blogs, setBlogs] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		category: "",
		image: "",
	});


	// Fetch blogs that belong to the specific doctor
	useEffect(() => {
		if (doctorId) {
			const fetchBlogs = async () => {
				setIsLoading(true);
				try {
					// Use the new endpoint format
					const response = await axios.get(
						`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/blogs/author/doctor/${doctorId}`
					);
					setBlogs(response.data);
					setError(null);
				} catch (error) {
					console.error("Error fetching blogs:", error);
					setError("Failed to fetch your blogs. Please try again.");
				} finally {
					setIsLoading(false);
				}
			};
			fetchBlogs();
		}
	}, [doctorId]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!doctorId) {
			setError("Doctor ID is missing. Please ensure you are logged in.");
			return;
		}

		// Create data object with the new authorType field
		const dataToSubmit = {
			...formData,
			authorType: "doctor", // Specify author type as doctor
			authorId: doctorId, // Use authorId instead of doctorId
			date: new Date(), // Use current date
		};

		console.log("Submitting blog data:", formData);

		setIsLoading(true);
		try {
			const response = await axios.post(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/blogs`,
				dataToSubmit
			);
			setBlogs([response.data, ...blogs]); // Add the new blog to the current list
			setActiveTab("recent"); // Switch to recent blogs tab

			// Reset form
			setFormData({
				title: "",
				description: "",
				category: "",
				image: "",
			});

			setError(null);
		} catch (error) {
			console.error("Error publishing blog:", error);
			setError("Failed to publish blog. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="health-blogs-container">
			<div className="header">
				<h1>My Health Blogs</h1>
				<div className="button-group">
					<button
						className={`action-button ${activeTab === "write" ? "active" : ""}`}
						onClick={() => setActiveTab("write")}
					>
						Write a Blog
					</button>
					<button
						className={`action-button ${activeTab === "recent" ? "active" : ""
							}`}
						onClick={() => setActiveTab("recent")}
					>
						Recent Blogs
					</button>
				</div>
			</div>

			{error && <div className="error-message">{error}</div>}

			{activeTab === "recent" && (
				<div
					className="blogs-grid"
					style={{
						display: "grid",
					}}
				>
					{isLoading && (
						<p className="loading-message">Loading your blogs...</p>
					)}
					{!isLoading && blogs.length === 0 && (
						<p className="empty-message">
							You haven't published any blogs yet.
						</p>
					)}
					{blogs.map((blog, index) => (
						<div
							key={blog._id || index}
							className="blog-card"
							style={{ position: "relative" }}
						>
							<h2>{blog.title}</h2>
							{blog.category && (
								<div className="blog-category">{blog.category}</div>
							)}
							<img
								src={downArrow}
								alt="arrow"
								className="blog-card-arrow"
								onClick={handleShowBlog}
								style={{
									height: "20px",
									width: "20px",
									position: "absolute",
									top: "10px",
									right: "10px",
								}}
							/>
							{showBlog && (
								<div className="blog-card-hidden">
									<div
										className="blog-description"
										dangerouslySetInnerHTML={{ __html: blog.description }}
									/>
									{blog.image && (
										<div className="blog-image">
											<img src={blog.image} alt={blog.title} />
										</div>
									)}
									<p className="blog-date">
										<strong>
											Published: {new Date(blog.date).toLocaleDateString()}
										</strong>
									</p>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{activeTab === "write" && (
				<div className="write-blog-form">
					<h2>Write a New Blog</h2>
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label>
								Title: <span className="required">*</span>
							</label>
							<input
								type="text"
								name="title"
								placeholder="Enter blog title"
								value={formData.title}
								onChange={handleInputChange}
								required
							/>
						</div>

						<div className="form-group">
							<label>
								Description: <span className="required">*</span>
							</label>
							<RichTextEditor
								content={formData.description}
								onChange={(html) =>
									setFormData((prev) => ({ ...prev, description: html }))
								}
							/>
						</div>

						<div className="form-group">
							<label>Category:</label>
							<input
								type="text"
								name="category"
								placeholder="E.g., Nutrition, Mental Health, Fitness"
								value={formData.category}
								onChange={handleInputChange}
								required
							/>
						</div>
						<div className="form-group">
							<label>Image URL:</label>
							<input
								type="text"
								name="image"
								placeholder="Enter image URL (optional)"
								value={formData.image}
								onChange={handleInputChange}
							/>
						</div>
						<button
							type="submit"
							className="submit-button"
							disabled={isLoading}
						>
							{isLoading ? "Publishing..." : "Publish Blog"}
						</button>
					</form>
				</div>
			)}
		</div>
	);
}

export default HealthBlogs;
