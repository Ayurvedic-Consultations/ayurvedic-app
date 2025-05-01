import React from 'react';
import { useLocation } from 'react-router-dom';
import './Blogscss.css'; // Create a new CSS file for this page

function BlogScreen() {
  const location = useLocation();
  const { blog } = location.state || {};

  if (!blog) {
    return <p>No blog selected</p>;
  }

  return (
    <div className="blog-page">
      <div className="blog-container">
        <h1>{blog.title}</h1>
        {blog.image && (
          <img src={blog.image} alt={blog.title} className="blog-image" />
        )}
        <p>{blog.description}</p>
        <p><strong>Date Published: {new Date(blog.date).toLocaleDateString()}</strong></p>
      </div>
    </div>
  );
}

export default BlogScreen;
