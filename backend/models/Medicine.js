const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  prescription: { type: Boolean, required: true },
  image: { type: String }, // Image path for the medicine
  retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true }, // The retailer who added this medicine
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);
