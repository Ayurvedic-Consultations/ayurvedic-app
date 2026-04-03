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
		fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/webhook/getAllBlogs/`)
			.then((res) => res.json())
			.then((data) => {
				if (data.blogs) {
					setBlogs(data.blogs);
					console.log("Fetched blogs:", data.blogs);
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
			(activeTab === "blog" && (item.type === "normal" || item.type === "ai")) ||
			(activeTab === "video" && item.type === "Video");

		const contentText = item.description;
		const itemTags =
			item.type === "normal"
				? item.category
					? [item.category]
					: []
				: item.tags;

		const matchesCategory =
			category === "all" ||
			itemTags?.some((tag) => tag.toLowerCase() === category.toLowerCase());

		const matchesSearch =
			item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			contentText?.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesTab && matchesCategory && matchesSearch;
	});

	if (loading) return <p className="bvs-loading">Loading blogs...</p>;

	return (
		<section className="bvs-blogs-videos-screen">
			{/* Hero Section */}
			<div className="bvs-hero-section">
				<img src="/images/blog_bg.jpg" alt="Hero" className="bvs-hero-bg" />
				<div className="bvs-hero-overlay" />
				<div className="bvs-hero-content">
					<h1 className="bvs-hero-title">
						<span className="bvs-hero-title1">
							Welcome to Our <br />
						</span>
						<span className="bvs-hero-title2">Ayurveda Guide</span>
					</h1>
					<p className="bvs-hero-subtext">
						Explore expert articles and videos on Ayurveda,
						<br /> wellness, and natural living.
					</p>
					<div className="bvs-hero-buttons">
						<button className="bvs-hero-btn bvs-article" onClick={scrollToContent}>
							<BookOpen /> <span>Explore Articles</span>
						</button>
						<button className="bvs-hero-btn bvs-video" onClick={scrollToContent}>
							<Play /> Watch Videos
						</button>
					</div>
				</div>
			</div>

			{/* Filter Section */}
			<div className="bvs-filter-section" id="content-section">
				<div className="bvs-filter-bar">
					<div className="bvs-search-box">
						<Search />
						<input
							type="text"
							placeholder="Search blogs and videos..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<div className="bvs-dropdown-box">
						<Filter />
						<select value={category} onChange={(e) => setCategory(e.target.value)}>
							<option value="all">All Categories</option>
							<option value="health">Health Tips</option>
							<option value="herbs">Herbs & Remedies</option>
							<option value="diet">Diet & Nutrition</option>
							<option value="yoga">Yoga & Meditation</option>
							<option value="lifestyle">Lifestyle</option>
							<option value="disease management">Disease Management</option>
							<option value="wellness">Wellness</option>
							<option value="ayurveda basics">Ayurveda Basics</option>
							<option value="ayurveda-basics">Ayurveda Basics</option>
							<option value="seasonal-care">Seasonal Care (Ritucharya)</option>
							<option value="daily-routine">
								Ayurvedic Daily Routine (Dinacharya)
							</option>
							<option value="skin-hair">Ayurveda for Skin & Hair</option>
							<option value="home-remedies">Ayurvedic Home Remedies</option>
							<option value="detox-panchakarma">Detox & Panchakarma</option>
							<option value="mental-wellness">Stress & Mental Wellness</option>
							<option value="herbs-spices">Ayurvedic Herbs & Spices</option>
							<option value="womens-health">Women’s Health in Ayurveda</option>
							<option value="immunity">Ayurvedic Immunity Boosters</option>
							<option value="digestion">Ayurveda for Digestion</option>
							<option value="sleep-relaxation">
								Ayurvedic Sleep & Relaxation
							</option>
							<option value="kids-family">
								Ayurveda for Kids & Family Care
							</option>
							<option value="massage-oils">
								Ayurvedic Oils & Massage (Abhyanga)
							</option>
							<option value="beauty-skincare">
								Ayurvedic Beauty & Skincare
							</option>
							<option value="chronic-conditions">
								Ayurveda for Chronic Conditions
							</option>
						</select>
					</div>

					<div className="bvs-tab-buttons">
						<button
							className={`bvs-tab ${activeTab === "all" ? "bvs-active" : ""}`}
							onClick={() => setActiveTab("all")}
						>
							All
						</button>
						<button
							className={`bvs-tab ${activeTab === "blog" ? "bvs-active" : ""}`}
							onClick={() => setActiveTab("blog")}
						>
							<BookOpen /> Blogs
						</button>
						<button
							className={`bvs-tab ${activeTab === "video" ? "bvs-active" : ""}`}
							onClick={() => setActiveTab("video")}
						>
							<Play /> Videos
						</button>
					</div>
				</div>
			</div>

			{/* Cards */}
			<div className="bvs-card-grid">
				{filteredData.length > 0 ? (
					filteredData.map((item, index) => {
						const isNormalBlog = item.type === "normal";

						const rawHtmlContent = item.description;
						const previewText = rawHtmlContent
							? rawHtmlContent.replace(/<[^>]*>/g, "").slice(0, 120)
							: "No content available...";

						// Image URL
						const imageUrl = item.url || item.content?.images?.[0]?.url || null;

						const itemTags = isNormalBlog
							? item.category
								? [item.category]
								: []
							: item.tags || [];

						const itemAuthor =
							item.authorName ||
							(item.user ? item.user.name : "Anonymous");

						return (
							<div className="bvs-card" key={item._id || index}>
								<div className="bvs-card-header">
									{imageUrl ? (
										<img src={imageUrl} alt={item.title} />
									) : (
										<img src="/images/blog_img.jpg" alt={item.title} />
									)}
									{item.type === "ai" ? (
										<span className="bvs-card-type">AI</span>
									) : null}
								</div>

								<div className="bvs-card-body">
									<p className="bvs-card-meta">
										{new Date(item.date).toLocaleDateString()}
									</p>
									<h3 className="bvs-card-title">{item.title}</h3>

									<p className="bvs-card-description">
										{previewText}...
									</p>

									<p className="bvs-card-author">👤 {itemAuthor}</p>

									<div className="bvs-card-tags">
										{itemTags.map((tag, idx) => (
											<span key={idx}>#{tag}</span>
										))}
									</div>

									<button
										className="bvs-card-action"
										onClick={() =>
											navigate(`/blog/${item._id}`, {
												state: { blog: item },
											})
										}
									>
										Read Article
									</button>
								</div>
							</div>
						);
					})
				) : (
					<p className="bvs-no-content">
						No content found for selected filters.
					</p>
				)}
			</div>
		</section>
	);
}

export default BlogsVideosScreen;
