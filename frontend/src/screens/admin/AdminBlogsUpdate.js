import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminBlogsUpdate.css';
import RichTextEditor from '../../components/RichTextEditor';

export default function AdminBlogUpdate() {
    const location = useLocation();
    const navigate = useNavigate();
    // Assuming initialBlog.content.text is the HTML string content.
    const { initialBlog } = location.state;

    const [blog, setBlog] = useState({
        _id: initialBlog._id || '',
        title: initialBlog.title || '',
        url: initialBlog.url || '',
        tags: initialBlog.tags?.join(', ') || '',
        content: initialBlog.description || '',
    });

    // FIX: Update handleChange to handle both standard inputs (e.target.value) 
    // AND the RichTextEditor's direct HTML string output.
    const handleChange = (eOrHtmlString) => {
        // Check if the argument is a standard synthetic event (from input fields)
        if (eOrHtmlString && eOrHtmlString.target) {
            const { name, value } = eOrHtmlString.target;
            setBlog({
                ...blog,
                [name]: value,
            });
        }
        // Otherwise, assume it's the HTML string from the RichTextEditor
        else {
            setBlog((prevBlog) => ({
                ...prevBlog,
                content: eOrHtmlString,
            }));
        }
    };

    const handleUpdate = async () => {
        const updatedData = {
            ...blog,
            // Tags conversion is correct
            tags: blog.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            // Content wrapping is correct
            content: {
                html: blog.content,
            }
        };

        console.log("Updated Blog Data (Ready to send to backend):", updatedData);

        const apiUrl = `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/webhook/updateBlog/${updatedData._id}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
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
        <div className="blog-containerr">
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
                        {/* FIX: Simplified props for RichTextEditor */}
                        <RichTextEditor
                            content={blog.content} // Passes the HTML content for initialization
                            onChange={handleChange} // Passes the unified handler
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