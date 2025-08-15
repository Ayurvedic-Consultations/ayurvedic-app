// src/Blogs.jsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export default function BlogsTesting() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Fetching blogs...");
        fetch("http://localhost:8080/api/webhook/getAllBlogs/")
            .then((res) => res.json())
            .then((data) => {
                if (data.blogs) {
                    setBlogs(data.blogs);
                    console.log("Blogs fetched successfully:", data.blogs);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching blogs:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading blogs...</p>;

    return (
        <div style={{ maxWidth: "800px", margin: "auto" }}>
            <h1>AI Blogs</h1>
            {blogs.length === 0 ? (
                <p>No blogs found.</p>
            ) : (
                blogs.map((blog) => (
                    <div
                        key={blog._id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "1rem",
                            marginBottom: "2rem",
                            borderRadius: "8px",
                            background: "#fafafa",
                        }}
                    >
                        <h2>{blog.title}</h2>
                        <small>{new Date(blog.timestamp).toLocaleString()}</small>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                img: ({ node, ...props }) => (
                                    <img
                                        {...props}
                                        style={{
                                            display: "block",
                                            maxWidth: "90%",
                                            height: "auto",
                                            margin: "1rem 0",
                                            borderRadius: "6px",
                                        }}
                                        alt={props.alt || ""}
                                    />
                                ),
                                a: ({ node, href, children, ...props }) => {
                                    const youtubeMatch = href?.match(
                                        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
                                    );
                                    if (youtubeMatch) {
                                        const videoId = youtubeMatch[1];
                                        return (
                                            <div style={{ margin: "1rem 0" }}>
                                                <iframe
                                                    width="100%"
                                                    height="400"
                                                    src={`https://www.youtube.com/embed/${videoId}`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    style={{ borderRadius: "8px" }}
                                                ></iframe>
                                            </div>
                                        );
                                    }
                                    return (
                                        <a href={href} {...props} target="_blank" rel="noopener noreferrer">
                                            {children}
                                        </a>
                                    );
                                },
                            }}
                        >
                            {blog.content.text}
                        </ReactMarkdown>


                        {/* Render images if any */}
                        {blog.content.images && blog.content.images.length > 0 && (
                            blog.content.images.map((img, i) => (
                                <div key={i} style={{ marginTop: "1rem" }}>
                                    <img
                                        src={img.url}
                                        alt={img.caption || ""}
                                        style={{ maxWidth: "100%", borderRadius: "6px" }}
                                    />
                                    {img.caption && <p><em>{img.caption}</em></p>}
                                </div>
                            ))
                        )}

                    </div>
                ))
            )}
        </div>
    );
}
