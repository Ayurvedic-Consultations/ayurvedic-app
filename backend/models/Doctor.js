const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    zipCode: { type: Number, required: true },
    designation: { type: String, required: true },
    specialization: { type: [String], required: true },
    experience: { type: Number, required: true }, 
    certificate: { type: String, required: true },
    password: { type: String, required: true },
    price: { type: Number, required: true },
    education: { type: String, required: true },
    dob: { type: Date, required: true },
    qrCode: { type: String },
    role: { type: String, default: 'doctor' }
});

module.exports = mongoose.model("Doctor", doctorSchema);