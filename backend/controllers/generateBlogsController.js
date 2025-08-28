const AIBlog = require('../models/AIBlog');

// Webhook endpoint
exports.generateBlogs = async (req, res) => {
    try {
        console.log("Incoming blog:", req.body);

        const { title, url, content, tags, user, timestamp } = req.body;

        if (!title || !url || !content?.text || !user?.userId || !user?.name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

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


// DELETE a blog by ID
exports.deleteBlog = async (req, res) => {
    try {
        const result = await AIBlog.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error deleting AI Blog:", error);
        res.status(500).json({ error: "Server error while deleting blog" });
    }
};


// UPDATE a blog by ID
exports.updateBlog = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedBlog = await AIBlog.findByIdAndUpdate(id, updateData, {
            new: true, 
            runValidators: true, 
        });

        if (!updatedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }
   
        res.status(200).json({
            success: true,
            message: "Blog updated successfully!",
            blog: updatedBlog
        });

    } catch (error) {
        console.error("Error updating AI Blog:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating blog.",
            error: error.message
        });
    }
};
