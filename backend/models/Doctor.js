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
    experience: { type: Number, required: true },
    certificate: { type: String, required: true },
    password: { type: String, required: true },   // Required field
    price: { type: Number, required: true },      // Required field
    education: { type: String, required: true },  // Required field
    dob: { type: Date, required: true }           // Required field
});

module.exports = mongoose.model("Doctor", doctorSchema);
