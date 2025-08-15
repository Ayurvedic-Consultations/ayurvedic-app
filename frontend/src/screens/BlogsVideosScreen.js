import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./BlogsVideosScreen.css";
import logo from "../media/logo.png"; // Placeholder image if needed

import BlogsTesting from "./BlogsTesting";

function BlogsVideosScreen() {
	const navigate = useNavigate();
	const [blogs, setBlogs] = useState([]);

	useEffect(() => {
		const fetchBlogs = async () => {
			try {
				const response = await axios.get(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/blogs`);
				setBlogs(response.data);
			} catch (error) {
				console.error("Error fetching blogs:", error);
			}
		};
		fetchBlogs();
	}, []);

	const handleBlogClick = (blog) => {
		navigate("/blogs", { state: { blog } });
	};

	return (
		<div className="blogs-videos">
			<div className="container">
				<h1>Blogs and Videos</h1>
				<BlogsTesting />
				<div className="section">
					<h2>Blogs</h2>
					<div className="blogs">
						{blogs.map((blog, index) => (
							<div
								key={index}
								className="blog-card"
								onClick={() => handleBlogClick(blog)}
							>
								{/*<img src={blog.image || logo} alt={blog.title} />*/}
								<div className="blog-content">
									<h3>{blog.title}</h3>
									<p>{blog.description.substring(0, 100)}...</p>{" "}
									{/* Short preview */}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default BlogsVideosScreen;
