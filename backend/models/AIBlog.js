const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    url: { type: String, required: true },
    caption: { type: String, default: '' }
}, { _id: false });

const linkSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    url: { type: String, required: true }
}, { _id: false });

const embedSchema = new mongoose.Schema({
    type: { type: String, default: '' }, // e.g. 'youtube', 'tweet', etc.
    embedCode: { type: String, default: '' }
}, { _id: false });

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    content: {
        html: { type: String, required: true },
        images: [mediaSchema],
        videos: [mediaSchema],
        links: [linkSchema],
        embeds: [embedSchema]
    },
    tags: {
        type: [String],
        default: []
    },
    user: {
        userId: { type: "String", required: true },
        name: { type: String, required: true }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AIBlog', blogSchema);