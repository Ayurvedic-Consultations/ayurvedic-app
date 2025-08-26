import React, { useState } from "react";
import { Search, ArrowDown, BookOpen, Play, Filter } from "lucide-react";
import "./BlogsVideosScreen.css";
import blogVideoData from "./blogVideoData";

function BlogsVideosScreen() {
  const [expanded, setExpanded] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredData = blogVideoData.filter((item) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "blog" && item.type === "Blog") ||
      (activeTab === "video" && item.type === "Video");

    const matchesCategory =
      category === "all" || item.tags?.includes(category.toLowerCase());

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <section className="blogs-videos-screen">
      {/* Hero Section */}
      <div className="hero-section">

        <img src="/images/blog_bg.jpg" alt="Hero" className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">

          <h1 className="hero-title">
            <span className="hero-title1">Welcome to Our <br/></span>
            <span lassName="hero-title2">Wellness Library</span>
          </h1>
          <p className="hero-subtext">
            Explore expert articles and videos on Ayurveda,<br/> wellness, and natural living.
          </p>
          <div className="hero-buttons">
            <button className="hero-btn article" onClick={scrollToContent}>
              <BookOpen /> <p1>Explore Articles</p1>
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
          //  <div className="card" key={index}>
          <div className={`card ${item.type === 'Video' ? 'card--video' : ''}`} key={index}>
              <div className="card-header">
                <img src={item.image} alt={item.title} />
                <span className="card-type">{item.type}</span>
              </div>
              <div className="card-body">
                <p className="card-meta">
                  {item.date} • {item.time}
                </p>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.description}</p>

                {item.type === "Blog" && expanded[index] && (
                  <div className="card-extended">{item.extendedContent}</div>
                )}

                <p className="card-author">👤 {item.author}</p>
                <div className="card-tags">
                  {item.tags.map((tag, idx) => (
                    <span key={idx}>#{tag}</span>
                  ))}
                </div>

                {item.type === "Video" ? (
                  <a href={item.link} className="card-action" target="_blank" rel="noreferrer">
                    {item.ctaText}
                  </a>
                ) : (
                  <button className="card-action" onClick={() => toggleContent(index)}>
                    {expanded[index] ? "Read Less" : "Read Article"}
                  </button>
                )}
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
