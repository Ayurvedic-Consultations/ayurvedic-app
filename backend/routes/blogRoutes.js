const express = require('express');
const router = express.Router();
const {
    getOneBlog,
    getBlogsByAuthor,
    getallBlog,
    createBlog,
    deleteBlog
} = require("../controllers/blogController");


// Create a new blog
router.post('/', createBlog);

// Get all blogs (for public view)
router.get('/', getallBlog);

// Get blogs by author (doctor or admin)
router.get('/author/:authorType/:authorId', getBlogsByAuthor);

// Get blogs by doctor ID (for backward compatibility)
router.get('/doctor/:doctorId', (req, res) => {
    req.params.authorType = 'doctor';
    req.params.authorId = req.params.doctorId;
    getBlogsByAuthor(req, res);
});

// Get a single blog by ID
router.get('/:id', getOneBlog);

// Delete a blog
router.delete('/:id', deleteBlog);

module.exports = router;