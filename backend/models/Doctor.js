// const mongoose = require("mongoose");

// const doctorSchema = new mongoose.Schema({
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     registrationNumber: { type: String, required: true, unique: true },
//     email: { type: String, required: true, unique: true },
//     phone: { type: Number, required: true },
//     age: { type: Number, required: true },
//     gender: { type: String, required: true },
//     zipCode: { type: Number, required: true },
//     address: { type: String, required: true },
//     designation: { type: String, required: true },
//     specialization: { type: [String], required: true },
//     experience: { type: Number, required: true },
//     certificate: { type: String, required: true },
//     password: { type: String, required: true },
//     price: { type: Number, required: true },
//     education: { type: String, required: true },
//     dob: { type: Date, required: true },
//     qrCode: { type: String },
//     role: { type: String, default: 'doctor' },
//     razorpayAccountId: {
//         type: String,
//         default: null 
//     },
// });

// module.exports = mongoose.model("Doctor", doctorSchema);

const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: false },
    age: { type: Number, required: false },
    gender: { type: String, required: false },
    zipCode: { type: Number, required: false },
    address: { type: String, required: false },
    designation: { type: String, required: true },
    specialization: { type: [String], required: true },
    experience: { type: Number, required: false },
    certificate: { type: String, required: false },
    password: { type: String, required: true },
    price: { type: Number, required: true },
    education: { type: String, required: false },
    dob: { type: Date, required: false },
    qrCode: { type: String },
    role: { type: String, default: 'doctor' },
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

module.exports = mongoose.model("Doctor", doctorSchema);