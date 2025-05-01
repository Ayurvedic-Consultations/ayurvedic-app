import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./AdminBlogs.css";
import { AuthContext } from "../../context/AuthContext";
import moment from "moment";

const formatDate = (isoString) => moment(isoString).format("DD MMM YYYY");

const AdminBlogs = () => {
  const { auth } = useContext(AuthContext);
  const adminId = auth.user ? auth.user.id : null;
  // console.log("Auth User:", auth.user);

  // State management
  const [activeTab, setActiveTab] = useState("view"); // Default to view tab
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: "",
    description: "",
    category: "",
    image: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);

  // Fetch all blogs from API
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/blogs");
      console.log("Fetched blogs:", response.data);

      // Sort blogs by date (newest first)
      const sortedBlogs = response.data.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

      setBlogs(sortedBlogs);
      setError(null);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError("Failed to fetch blogs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    setNewBlog({ ...newBlog, [e.target.name]: e.target.value });
  };

  // Add a new blog post
  const addBlog = async () => {
    if (!newBlog.title || !newBlog.description) {
      setError("Please fill required fields (title and description)!");
      return;
    }

    console.log("Auth User Before Submitting:", auth.user); // Debugging

    // Ensure author details exist before setting
    const authorFirstName = auth.user?.firstName || "Unknown";
    const authorLastName = auth.user?.lastName || "Admin";
    const fullAuthorName = `${authorFirstName} ${authorLastName}`.trim();

    const dataToSubmit = {
      ...newBlog,
      authorType: "admin",
      authorId: auth.user?.id || "Unknown ID",
      authorName: fullAuthorName,
    };

    console.log("Data to Submit:", dataToSubmit); // Debugging

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/blogs", dataToSubmit);

      // Refresh the blog list to include the new blog
      await fetchBlogs();

      // Reset form
      setNewBlog({ title: "", description: "", category: "", image: "" });

      // Show success alert
      setSuccessAlert("Blog post added successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessAlert(null);
      }, 3000);

      setError(null);
    } catch (error) {
      console.error("Error adding blog:", error);
      setError("Failed to create blog. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a blog post
  const deleteBlog = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      setIsLoading(true);
      try {
        await axios.delete(`http://localhost:8080/api/blogs/${id}`);
        setBlogs(blogs.filter((blog) => blog._id !== id));
        setSuccessAlert("Blog deleted successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessAlert(null);
        }, 3000);

        setError(null);
      } catch (error) {
        console.error("Error deleting blog:", error);
        setError("Failed to delete blog. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="admin-blogs">
      <h1>Admin Blog Management</h1>

      {/* Tab Navigation */}
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
      </div>

      {/* Error and Success Alerts */}
      {error && <div className="error-alert">{error}</div>}
      {successAlert && <div className="success-alert">{successAlert}</div>}

      {/* View Blogs Tab */}
      {activeTab === "view" && (
        <div className="blog-list">
          <h2>All Blogs</h2>
          {isLoading && <p className="loading-text">Loading blogs...</p>}
          {!isLoading && blogs.length === 0 && <p>No blogs available.</p>}
          {blogs.length > 0 && (
            <div className="blogs-container">
              {blogs.map((blog) => (
                <div key={blog._id} className="blog-item">
                  <h3>{blog.title}</h3>
                  <p className="blog-meta">
                  <p>By: {blog.authorName} | {formatDate(blog.date)}</p>
                    {blog.category && <span className="blog-category">{blog.category}</span>}
                  </p>
                  <p className="blog-excerpt">{blog.description.substring(0, 150)}
                    {blog.description.length > 150 ? "..." : ""}
                  </p>
                  {blog.image && (
                    <div className="blog-image">
                      <img src={blog.image} alt={blog.title} />
                    </div>
                  )}
                  <div className="blog-actions">
                    <button
                      onClick={() => deleteBlog(blog._id)}
                      className="delete-btn"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Blog Tab */}
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
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={newBlog.category}
              onChange={handleChange}
              placeholder="E.g., Health, Wellness, Nutrition"
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
    </div>
  );
};

export default AdminBlogs;