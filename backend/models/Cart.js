const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    patientId:{type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true},
    doctorId:{type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true},
    items: [{
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Cart', cartSchema)