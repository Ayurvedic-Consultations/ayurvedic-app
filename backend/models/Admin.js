const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

module.exports = mongoose.model('Admin', adminSchema);
