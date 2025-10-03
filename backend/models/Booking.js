// models/booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
	doctorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Doctor",
		required: true,
	},
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
	patientId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Patient",
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
		enum: ["pending", "accepted", "denied"],
		default: "pending",
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
			},
			dosage: { type: String, required: true },
			instructions: { type: String, required: true },
			duration: { type: String, required: true },
			startDate: { type: Date, required: true },
			endDate: { type: Date, required: true }
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
	amountPaid: {
		type: Number,
		required: true,
	},
	paymentScreenshot: {
		type: String, // Path to the uploaded screenshot
		required: false, // This is optional initially, as the user will upload it after making the payment
	},
	paymentStatus: {
		type: String,
		enum: ['Pending', 'Completed'], // Can either be Pending or Completed
		default: 'Pending',
	},
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
