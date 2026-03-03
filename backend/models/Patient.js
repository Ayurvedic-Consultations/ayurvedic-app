const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  zipCode: { type: String, required: true },
  address: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'patient' },
  whatsappNumber: { type: String, default: null },
  whatsappLinked: { type: Boolean, default: false },
  preferredLanguage: { type: String, enum: ['en', 'hi', 'bn', 'ta', 'te'], default: 'en' }
});

module.exports = mongoose.model('Patient', PatientSchema);