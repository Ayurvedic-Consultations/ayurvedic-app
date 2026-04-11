const mongoose = require('mongoose');

const webChatSessionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    isRegistered: {
        type: Boolean,
        default: false
    },
    currentFlow: {
        type: String,
        default: 'idle'
    },
    profile: {
        firstName: String,
        lastName: String,
        email: String
    },
    healthData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    conversationHistory: [{
        role: { type: String, enum: ['user', 'assistant'] },
        content: String,
        metadata: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now }
    }],
    totalMessages: {
        type: Number,
        default: 0
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WebChatSession', webChatSessionSchema);
