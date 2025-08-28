// src/BlogsVideosScreen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Play, Filter } from "lucide-react";
import "./BlogsVideosScreen.css";

function BlogsVideosScreen() {
    const [expanded, setExpanded] = useState({});
    const [activeTab, setActiveTab] = useState("all");
    const [category, setCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const toggleContent = (index) => {
        setExpanded((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const scrollToContent = () => {
        const contentSection = document.getElementById("content-section");
        contentSection?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch blogs from backend
    useEffect(() => {
        fetch("http://localhost:8080/api/webhook/getAllBlogs/")
            .then((res) => res.json())
            .then((data) => {
                if (data.blogs) {
                    setBlogs(data.blogs);
                    console.log(data.blogs);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching blogs:", err);
                setLoading(false);
            });
    }, []);

    // Filtering
    const filteredData = blogs.filter((item) => {
        const matchesTab =
            activeTab === "all" ||
            (activeTab === "blog" && item.type === "Blog") ||
            (activeTab === "video" && item.type === "Video");

        const matchesCategory =
            category === "all" ||
            item.tags?.some((tag) => tag.toLowerCase() === category.toLowerCase());

        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content?.text?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesCategory && matchesSearch;
    });

    if (loading) return <p className="loading">Loading blogs...</p>;

    return (
        <section className="blogs-videos-screen">
            {/* Hero Section */}
            <div className="hero-section">
                <img src="/images/blog_bg.jpg" alt="Hero" className="hero-bg" />
                <div className="hero-overlay" />
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="hero-title1">Welcome to Our <br /></span>
                        <span className="hero-title2">Wellness Library</span>
                    </h1>
                    <p className="hero-subtext">
                        Explore expert articles and videos on Ayurveda,<br /> wellness, and natural living.
                    </p>
                    <div className="hero-buttons">
                        <button className="hero-btn article" onClick={scrollToContent}>
                            <BookOpen /> <span>Explore Articles</span>
                        </button>
                        <button className="hero-btn video" onClick={scrollToContent}>
                            <Play /> Watch Videos
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section" id="content-section">
                <div className="filter-bar">
                    <div className="search-box">
                        <Search />
                        <input
                            type="text"
                            placeholder="Search blogs and videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="dropdown-box">
                        <Filter />
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="all">All Categories</option>
                            <option value="health">Health Tips</option>
                            <option value="herbs">Herbs & Remedies</option>
                            <option value="diet">Diet & Nutrition</option>
                            <option value="yoga">Yoga & Meditation</option>
                            <option value="lifestyle">Lifestyle</option>
                        </select>
                    </div>

                    <div className="tab-buttons">
                        <button
                            className={`tab ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            All
                        </button>
                        <button
                            className={`tab ${activeTab === "blog" ? "active" : ""}`}
                            onClick={() => setActiveTab("blog")}
                        >
                            <BookOpen /> Blogs
                        </button>
                        <button
                            className={`tab ${activeTab === "video" ? "active" : ""}`}
                            onClick={() => setActiveTab("video")}
                        >
                            <Play /> Videos
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards */}
            <div className="card-grid">
                {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                        <div className="card" key={item._id || index}>
                            <div className="card-header">
                                {item.content.images && item.content.images.length > 0 ? (
                                    <img src={item.content.images[0].url} alt={item.title} />
                                ) : (
                                    <img src="/images/blog_img.jpg" alt={item.title} />
                                )}
                                <span className="card-type">{item.type || "Blog"}</span>
                            </div>

                            <div className="card-body">
                                <p className="card-meta">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                                <h3 className="card-title">{item.title}</h3>
                                <p className="card-description">
                                    {item.content.text.slice(0, 120)}...
                                </p>

                                <p className="card-author">👤 {item.author || "Anonymous"}</p>
                                <div className="card-tags">
                                    {item.tags?.map((tag, idx) => (
                                        <span key={idx}>#{tag}</span>
                                    ))}
                                </div>

                                <button
                                    className="card-action"
                                    onClick={() => navigate(`/blog/${item._id}`, { state: { blog: item } })}
                                >
                                    {expanded[index] ? "Read Less" : "Read Article"}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-content">No content found for selected filters.</p>
                )}
            </div>
        </section>
    );
}

export default BlogsVideosScreen;
