// models/booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true,
  },
  doctorEmail: {
    type: String,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  dateOfAppointment: {
    type: Date,
    required: true,
  },
  patientEmail: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientGender: {
    type: String,
    required: true,
  },
  patientAge: {
    type: Number,
    required: true,
  },
  patientIllness: {
    type: String,
    required: true,
  },
  requestAccept: {
    type: String,
    required: true,
  },
  doctorsMessage: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  meetLink: {
    type: String,
    required: true,
    default: "no",
  },
  recommendedSupplements: [
    {
      medicineName: {
        type: String,
        required: true
      },
      forIllness: {
        type: String,
        required: true
      }
    }
  ],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  review: {
    type: String,
    default: "",
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
