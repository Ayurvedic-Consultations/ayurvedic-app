// generateBlogsController.js

const AIBlog = require('../models/AIBlog');
const Blogs = require('../models/Blog'); // Assuming Blogs is the old model
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Helper function
const convertMarkdownToHtml = async (markdownText) => {
    // Dynamically import 'marked'
    const { marked } = await import('marked');

    marked.setOptions({
        gfm: true,
        breaks: true,
    });

    // 1. Convert Markdown to HTML
    const rawHtml = marked(markdownText);

    // 2. Sanitize the HTML for security
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
        ADD_TAGS: ['iframe', 'video', 'style'],
        ADD_ATTR: ['allowfullscreen', 'frameborder', 'style', 'data-youtube-video', 'width', 'height', 'src'],
    });

    return cleanHtml;
};

// Webhook endpoint
exports.generateBlogs = async (req, res) => {
    try {
        console.log("Incoming blog:", req.body);

        // Ensure we still require content.text for the incoming Markdown
        const { title, url, content, tags, user, timestamp } = req.body;

        if (!title || !url || !content?.text || !user?.userId || !user?.name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // --- CONVERSION & SANITIZATION STEP ---
        const cleanHtml = await convertMarkdownToHtml(content.text);

        // 3. Prepare the content object to match the schema { html: '...' }
        const updatedContent = {
            // Spread to keep images, videos, links, embeds arrays
            ...content,
            // FIX: Use 'html' to match the schema
            html: cleanHtml,
            // Optional: Delete 'text' to prevent it from being saved, 
            // as it's no longer defined in the schema.
            text: undefined
        };

        // 4. Save the document
        await AIBlog.create({
            title,
            url,
            content: updatedContent,
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

// GET all blogs (both AI and normal)
exports.getAllBlogs = async (req, res) => {
    try {
        console.log("Fetching all blogs...>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        const aiBlogsPromise = AIBlog.find({})
            .sort({ timestamp: -1 })
            .lean();

        const normalBlogsPromise = Blogs.find({})
            .sort({ date: -1 })
            .lean();

        const [aiBlogs, normalBlogs] = await Promise.all([aiBlogsPromise, normalBlogsPromise]);

        const normalizedNormalBlogs = normalBlogs.map(blog => ({
            _id: blog._id,
            title: blog.title,
            description: blog.description, // <-- Normal Tiptap HTML content
            date: blog.date,
            authorName: blog.authorName,
            category: blog.category,
            type: 'normal',
            // Add image for frontend consistency (if available)
            image: blog.image || null,
        }));

        const normalizedAIBlogs = aiBlogs.map(blog => ({
            _id: blog._id,
            title: blog.title,
            // --- FIX IS HERE: Change 'content.text' to 'content.html' ---
            description: blog.content.html,
            // -----------------------------------------------------------
            date: blog.timestamp,
            authorName: blog.user.name,
            category: blog.tags.join(', '),
            type: 'ai',
            // Since AI schema doesn't have a top-level 'image', handle it if you need one later
            image: blog.content.images?.[0]?.url || null,
        }));

        const allBlogs = [...normalizedAIBlogs, ...normalizedNormalBlogs];

        // Ensure date field is consistently a Date object for safe sorting
        allBlogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


        res.status(200).json({
            success: true,
            count: allBlogs.length,
            blogs: allBlogs
        });

    } catch (err) {
        console.error("Error fetching All Blogs:", err);
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
