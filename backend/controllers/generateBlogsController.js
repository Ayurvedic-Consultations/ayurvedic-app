const AIBlog = require('../models/AIBlog'); // Import the model you just made

// Webhook endpoint
exports.generateBlogs = async (req, res) => {
    try {
        console.log("Incoming blog:", req.body);

        const { title, url, content, tags, user, timestamp } = req.body;

        // Basic validation
        if (!title || !url || !content?.text || !user?.userId || !user?.name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Create the blog in Mongo
        await AIBlog.create({
            title,
            url,
            content,
            tags: tags || [],
            user,
            timestamp: timestamp ? new Date(timestamp) : Date.now()
        });

        res.status(201).json({ message: "AI Blog saved successfully!" });
    } catch (err) {
        console.error("Error saving AI Blog:", err);
        res.status(500).json({ error: "Server error while saving blog" });
    }
};


// GET all AI blogs
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await AIBlog.find({})
            .sort({ timestamp: -1 }); 

        res.status(200).json({
            success: true,
            count: blogs.length,
            blogs
        });
    } catch (err) {
        console.error("Error fetching AI Blogs:", err);
        res.status(500).json({ error: "Server error while fetching blogs" });
    }
};
