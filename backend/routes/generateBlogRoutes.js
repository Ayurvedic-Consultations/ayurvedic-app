const express = require('express');
const router = express.Router();
const {
    generateBlogs,
    getAllBlogs,
    deleteBlog
} = require('../controllers/generateBlogsController');

// Create a new blog
router.post('/generateBlogs', generateBlogs);
router.get('/getAllBlogs', getAllBlogs);
router.delete('/deleteBlog/:id', deleteBlog);

module.exports = router;