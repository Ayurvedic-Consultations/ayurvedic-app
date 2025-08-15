const express = require('express');
const router = express.Router();
const {
    generateBlogs
} = require('../controllers/generateBlogsController');


// Create a new blog
router.post('/generateBlogs', generateBlogs);

module.exports = router;