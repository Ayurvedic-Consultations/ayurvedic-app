const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    authorType: {
        type: String,
        enum: ['doctor', 'admin'],
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'authorType',
        required: true,
    },
    authorName: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'General'
    }
});

module.exports = mongoose.model('Blog', blogSchema);