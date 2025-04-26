// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Array of medicine items instead of a single medicine
  items: [{
    name: String,
    price: Number,
    image: String,
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quantity: Number,
    subtotal: Number
  }],
  totalPrice: Number,
  buyer: {
    firstName: String,
    lastName: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['cashOnDelivery', 'onlinePayment'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentProof: {
    type: String, // Path to the uploaded payment screenshot
    required: false
  },
  paymentQR: {
    type: String, // Path to the QR code image
    required: false
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  retailerStatus: {
    type: String,
    enum: ['received', 'accepted', 'rejected', 'shipped'],
    default: 'received'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Order', orderSchema);