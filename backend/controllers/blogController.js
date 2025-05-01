const Blog = require('../models/Blog');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin'); // You'll need to create this model if it doesn't exist

// Create a new blog
exports.createBlog = async (req, res) => {
    try {
        const { title, description, authorType, authorId, category, image } = req.body;
        let authorName;

        // Find the author based on type to get the name
        if (authorType === 'doctor') {
            const doctor = await Doctor.findById(authorId);
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
            authorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
        } else if (authorType === 'admin') {
            const admin = await Admin.findById(authorId);
            if (!admin) {
                return res.status(404).json({ error: 'Admin not found' });
            }
            authorName = `${admin.firstName} ${admin.lastName}`;
        } else {
            return res.status(400).json({ error: 'Invalid author type' });
        }

        // Create the new blog
        const newBlog = new Blog({
            title,
            description,
            date: new Date(),
            authorType,
            authorId,
            authorName,
            category: category || 'General',
            image: image || ''
        });

        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all blogs (for public view)
exports.getallBlog = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get blogs by author
exports.getBlogsByAuthor = async (req, res) => {
    try {
        const { authorType, authorId } = req.params;
        const blogs = await Blog.find({ authorType, authorId }).sort({ date: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single blog by ID
exports.getOneBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
    try {
        const result = await Blog.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};