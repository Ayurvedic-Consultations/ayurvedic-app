const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  prescription: { type: Boolean, required: true },
  image: { type: String }, 
  retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true }, 
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema); 