// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Array of medicine items instead of a single medicine
  items: [{
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true },
    subTotal: { type: Number, required: true }
  }],
  totalPrice: Number,
  buyer: {
    firstName: String,
    lastName: String,
    type: { type: String, enum: ['Patient', 'Doctor'], required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, refPath: 'buyer.type', required: true }
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
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
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