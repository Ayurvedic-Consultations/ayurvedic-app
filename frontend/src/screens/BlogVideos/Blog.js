// src/Blogs.jsx
import React from "react";
import { useLocation, useParams } from "react-router-dom";
// styles
import "./Blog.css";

export default function Blog() {
    const { state } = useLocation();
    const { id } = useParams();
    const blog = state?.blog;

    const fullHtmlContent = blog?.description || '<h2>Error: Content not found.</h2>';

    const displayDate = blog?.date ? new Date(blog.date).toLocaleString() : 'Date Unavailable';

    const mainImageUrl = blog?.image || blog?.content?.images?.[0]?.url;

    if (!blog) {
        return <p>No blog data found for ID: {id}. Maybe refresh?</p>;
    }

    return (
        <div className="blog-page-container" style={{ maxWidth: "1000px", margin: "auto", paddingTop: "12rem" }}>
            <div
                key={blog._id}
                className="blog-content-wrapper"
                style={{
                    border: "1px solid #ddd",
                    padding: "1rem",
                    marginBottom: "2rem",
                    borderRadius: "8px",
                    background: "#fafafa",
                }}
            >
                {/* Header Image (Optional) */}
                {mainImageUrl && (
                    <img
                        src={mainImageUrl}
                        alt={blog.title || "Blog Header"}
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '1rem' }}
                    />
                )}

                {/* Title and Metadata */}
                {/* <h1 style={{ marginBottom: '0.5rem' }}>{blog.title}</h1> */}
                <small style={{ display: 'block', marginBottom: '1rem', color: '#666' }}>
                    By: {blog.authorName || 'Unknown Author'} | Published: {displayDate}
                </small>

                <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />

                <div
                    className="full-blog-description"
                    dangerouslySetInnerHTML={{ __html: fullHtmlContent }}
                    style={{
                        paddingTop: '1rem',
                        lineHeight: '1.7'
                    }}
                />

            </div>
        </div>
    );
}