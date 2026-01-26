// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true
  },
  role: {
    type: String,
    enum: ['doctor', 'admin', 'patient', 'retailer'],
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'payment', 'delivery', 'system'],
    default: 'system'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);