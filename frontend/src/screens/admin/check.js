import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./AdminBlogs.css";
import { AuthContext } from "../../context/AuthContext";

const AdminBlogs = () => {
  const { auth } = useContext(AuthContext);
  const adminId = auth.user ? auth.user.id : null;

  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: "",
    description: "", // Changed from content to match your backend
    category: "",
    image: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/blogs`);
        console.log("Fetched blogs:", response.data);
        setBlogs(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Failed to fetch blogs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setNewBlog({ ...newBlog, [e.target.name]: e.target.value });
  };

  // Add a new blog post
  const addBlog = async () => {
    if (!newBlog.title || !newBlog.description) {
      alert("Please fill required fields (title and description)!");
      return;
    }

    const dataToSubmit = {
      ...newBlog,
      authorType: "admin",
      authorId: adminId,
    };

    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/blogs`, dataToSubmit);
      setBlogs([response.data, ...blogs]);
      setNewBlog({ title: "", description: "", category: "", image: "" });
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
        await axios.delete(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/blogs/${id}`);
        setBlogs(blogs.filter((blog) => blog._id !== id));
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

      {error && <div className="error-message">{error}</div>}

      {/* Blog Form */}
      <div className="blog-form">
        <input
          type="text"
          name="title"
          value={newBlog.title}
          onChange={handleChange}
          placeholder="Blog Title *"
          required
        />
        <textarea
          name="description" // Changed from content to description
          value={newBlog.description}
          onChange={handleChange}
          placeholder="Blog Content *"
          required
        />
        <input
          type="text"
          name="category"
          value={newBlog.category}
          onChange={handleChange}
          placeholder="Category (optional)"
        />
        <input
          type="text"
          name="image"
          value={newBlog.image}
          onChange={handleChange}
          placeholder="Image URL (optional)"
        />
        <button onClick={addBlog} disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Blog"}
        </button>
      </div>

      {/* Blog List */}
      <div className="blog-list">
        <h2>Existing Blogs</h2>
        {isLoading && <p>Loading blogs...</p>}
        {!isLoading && blogs.length === 0 && <p>No blogs available.</p>}
        {blogs.length > 0 && (
          <div className="blogs-container">
            {blogs.map((blog) => (
              <div key={blog._id} className="blog-item">
                <h3>{blog.title}</h3>
                <p className="blog-meta">
                  By: {blog.authorName} | {new Date(blog.date).toLocaleDateString()}
                </p>
                <p>{blog.description.substring(0, 150)}...</p>
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
    </div>
  );
};

export default AdminBlogs;