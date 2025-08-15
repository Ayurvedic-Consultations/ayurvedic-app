const express = require('express');
const router = express.Router();
const {
    generateBlogs,
    getAllBlogs
} = require('../controllers/generateBlogsController');


// Create a new blog
router.post('/generateBlogs', generateBlogs);
router.get('/getAllBlogs', getAllBlogs);

module.exports = router;