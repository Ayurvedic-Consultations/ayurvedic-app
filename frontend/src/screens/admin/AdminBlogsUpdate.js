import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminBlogsUpdate.css';

export default function AdminBlogUpdate() {
    const location = useLocation();
    const navigate = useNavigate();
    const { initialBlog } = location.state;
    console.log("Received Initial Blog Data:", initialBlog);
    const [blog, setBlog] = useState({
        _id: initialBlog._id || '',
        title: initialBlog.title || '',
        url: initialBlog.url || '',
        tags: initialBlog.tags?.join(', ') || '',
        content: initialBlog.content?.text || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBlog({
            ...blog,
            [name]: value,
        });
    };

    const handleUpdate = async () => {
        const updatedData = {
            ...blog,
            tags: blog.tags.split(',').map(tag => tag.trim()),
            content: {
                text: blog.content,
            }
        };

        console.log("Updated Blog Data (Ready to send to backend):", updatedData);

        const apiUrl = `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/webhook/updateBlog/${updatedData._id}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // You might need an Authorization header for an admin endpoint
                    // 'Authorization': `Bearer YOUR_AUTH_TOKEN`,
                },
                body: JSON.stringify(updatedData),
            });

       
            if (response.ok) {
                const result = await response.json();
                console.log("Blog updated successfully:", result);
                navigate('/admin/blogs');
            } else {
                const errorData = await response.json();
                console.error("Failed to update blog:", response.status, errorData);
            }
        } catch (error) {
            console.error("An error occurred during the fetch call:", error);
        }
    };


    return (
        <div className="blog-container">
            <div className="blog-card">
                <h1 className="title-heading">Edit Blog Post</h1>

                {/* Form Fields */}
                <div className="form-fields">
                    <div className="form-field-group">
                        <label htmlFor="title" className="label">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={blog.title}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div className="form-field-group">
                        <label htmlFor="url" className="label">
                            URL
                        </label>
                        <input
                            type="text"
                            name="url"
                            id="url"
                            value={blog.url}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div className="form-field-group">
                        <label htmlFor="tags" className="label">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            name="tags"
                            id="tags"
                            value={blog.tags}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div className="form-field-group">
                        <label htmlFor="content" className="label">
                            Content
                        </label>
                        <label htmlFor="content" className="label">
                            <strong>**Please use Markdown syntax for formatting.** </strong>
                        </label>
                        <textarea
                            name="content"
                            id="content"
                            rows="15"
                            value={blog.content}
                            onChange={handleChange}
                            className="textarea"
                        />
                    </div>
                </div>

                {/* Update Button */}
                <div className="update-button-wrapper">
                    <button
                        onClick={handleUpdate}
                        className="update-button"
                    >
                        Update Blog
                    </button>
                </div>
            </div>
        </div>
    );
}
