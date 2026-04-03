const mongoose = require('mongoose');

const RetailerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  BusinessName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  licenseNumber: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  zipCode: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  role: { type: String, default: 'retailer' },
  razorpayAccountId: {
    type: String,
    default: null
  },
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordOTPExpires: {
    type: Date,
    default: null
  },
  isOTPVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Retailer', RetailerSchema);
