const express = require('express');
const router = express.Router();
const {
    generateBlogs,
    getAllBlogs,
    deleteBlog,
    updateBlog
} = require('../controllers/generateBlogsController');

// Create a new blog
router.post('/generateBlogs', generateBlogs);
router.get('/getAllBlogs', getAllBlogs);
router.delete('/deleteBlog/:id', deleteBlog);
router.put('/updateBlog/:id', updateBlog);

module.exports = router;