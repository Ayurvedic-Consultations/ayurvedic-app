const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Add or update rating and review
exports.updateRatingAndReview = async (req, res) => {
	const { id } = req.params;
	const { rating, review } = req.body;

	try {
		if (rating && (rating < 1 || rating > 5)) {
			return res.status(400).json({ error: "Rating must be between 1 and 5" });
		}

		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{ rating, review },
			{ new: true }
		);

		if (!updatedBooking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		return res.status(200).json({
			message: "Rating and review updated successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		console.error("Error updating rating and review:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Get rating and review for a booking
exports.getRatingAndReview = async (req, res) => {
	const { id } = req.params;

	try {
		const booking = await Booking.findById(id);

		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		return res.status(200).json({
			message: "Rating and review retrieved successfully",
			rating: booking.rating,
			review: booking.review,
		});
	} catch (error) {
		console.error("Error retrieving rating and review:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Controller function to handle booking creation
exports.createBooking = async (req, res) => {
	const {
		doctorName,
		doctorId,
		doctorEmail,
		patientId,
		timeSlot,
		dateOfAppointment,
		email,
		patientName,
		patientGender,
		patientAge,
		patientIllness,
		meetLink,
	} = req.body; // Destructure the request body

	if (!doctorName) {
		return res.status(400).json({ error: "Doctor name are required" });
	} else if (!timeSlot) {
		return res.status(400).json({ error: "Time slot is required" });
	} else if (!email) {
		return res.status(400).json({ error: "Patient email is required" });
	}

	try {
		const doctor = await Doctor.findOne({ email: doctorEmail });
		if (!doctor) {
			return res.status(404).json({ error: "Doctor not found" });
		}
		// Check if a booking already exists for the doctor and time slot
		const existingBooking = await Booking.findOne({
			doctorName,
			timeSlot,
			dateOfAppointment,
		});
		if (existingBooking) {
			return res.status(400).json({
				error:
					"This time slot is already booked for the selected doctor. Please Choose a different date or time slot.",
			});
		}

		// Create a new booking
		const newBooking = new Booking({
			doctorId: doctor._id,
			doctorName,
			doctorEmail,
			timeSlot,
			patientId,
			dateOfAppointment,
			patientEmail: email,
			patientName,
			patientGender,
			patientAge,
			patientIllness,
			meetLink,
			amountPaid: doctor.price,
		});

		// Save the booking to the database
		await newBooking.save();

		return res.status(201).json({
			message: "Appointment booked successfully",
			booking: newBooking,
		});
	} catch (error) {
		console.error("Error creating booking:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Controller function to get all bookings
exports.getAllBookings = async (req, res) => {
	try {
		// Fetch all bookings from the database
		const bookings = await Booking.find();

		// Check if any bookings exist
		if (bookings.length === 0) {
			return res.status(404).json({ message: "No bookings found" });
		}

		// Return all bookings in the response
		return res.status(200).json({
			message: "Bookings retrieved successfully",
			bookings,
		});
	} catch (error) {
		console.error("Error fetching bookings:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

const upload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, "uploads/payments/");
		},
		filename: function (req, file, cb) {
			cb(null, Date.now() + path.extname(file.originalname)); // Ensures unique filenames
		},
	}),
	fileFilter: (req, file, cb) => {
		const fileTypes = /jpeg|jpg|png|gif/;
		const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = fileTypes.test(file.mimetype);

		if (extname && mimetype) {
			return cb(null, true);
		} else {
			cb(new Error("Invalid file type. Only image files are allowed."));
		}
	},
}).single("paymentScreenshot");

exports.uploadPaymentScreenshot = (req, res) => {
	upload(req, res, async function (err) {
		if (err instanceof multer.MulterError) {
			return res.status(400).json({ error: err.message });
		} else if (err) {
			return res.status(400).json({ error: err.message });
		}

		console.log("🟡 Uploading payment screenshot...");
		console.log(req.file);

		const { id } = req.params;
		const { paymentStatus, amountPaid } = req.body;

		if (!req.file) {
			return res.status(400).json({ error: "Payment screenshot is required" });
		}

		try {
			const booking = await Booking.findById(id);
			if (!booking) {
				return res.status(404).json({ error: "Booking not found" });
			}

			booking.paymentScreenshot = req.file.path;
			booking.paymentStatus = paymentStatus || "Completed";
			booking.amountPaid = amountPaid || booking.amountPaid;

			await booking.save();

			return res.status(200).json({
				message: "Payment screenshot uploaded and booking updated",
				booking,
			});
		} catch (error) {
			console.error("❌ Error uploading payment screenshot:", error);
			return res.status(500).json({ error: "Server error" });
		}
	});
};

exports.getNotifications = async (req, res) => {
	const { email } = req.query;
	console.log(email);
	if (!email) {
		return res.status(400).json({ error: "User email is required" });
	}

	try {
		// Fetch bookings for the specified user email
		const bookings = await Booking.find({ patientEmail: email }).sort({
			createdAt: -1,
		});

		// Map bookings to notification-like format
		const notifications = bookings.map((booking) => ({
			message: `Your appointment with Dr. ${booking.doctorName} is confirmed for ${booking.timeSlot}.`,
			date: booking.createdAt,
		}));

		return res.status(200).json({
			message: "Notifications retrieved successfully",
			notifications,
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// New controller function to update booking requestAccept status
exports.updateBookingStatus = async (req, res) => {
	const { id } = req.params; // Get booking ID from the URL params
	const { requestAccept, doctorsMessage } = req.body; // Get the new requestAccept value and doctors message from the request body

	try {
		// Find the booking by ID and update the requestAccept and doctorsMessage field
		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{ requestAccept, doctorsMessage },
			{ new: true }
		);

		if (!updatedBooking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		return res.status(200).json({
			message: `Booking ${requestAccept === "y" ? "accepted" : "denied"
				} successfully`,
			booking: updatedBooking,
		});
	} catch (error) {
		console.error("Error updating booking:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// New controller function to update the meetLink
exports.updateMeetLink = async (req, res) => {
	const { id } = req.params; // Get booking ID from the URL params
	const { meetLink } = req.body; // Get the meetLink from the request body
	console.log(meetLink);
	if (!meetLink || meetLink.trim() === "") {
		return res.status(400).json({ error: "Meet link is required" });
	}

	try {
		// Find the booking by ID and update the meetLink field
		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{ meetLink },
			{ new: true }
		);

		if (!updatedBooking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		return res.status(200).json({
			message: "Meet link updated successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		console.error("Error updating meet link:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// New controller function to delete a booking
exports.deleteBooking = async (req, res) => {
	const { id } = req.params;

	try {
		// Find the booking by ID and delete it
		const deletedBooking = await Booking.findByIdAndDelete(id);

		if (!deletedBooking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		return res.status(200).json({ message: "Booking deleted successfully" });
	} catch (error) {
		console.error("Error deleting booking:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Add or update recommended supplements
exports.updateRecommendedSupplements = async (req, res) => {
	const { id } = req.params;
	const { supplements } = req.body;

	try {
		// Validate input
		if (!supplements || !Array.isArray(supplements)) {
			return res.status(400).json({ error: "Valid supplements array is required" });
		}

		// Find the booking by ID and update the supplements
		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{ recommendedSupplements: supplements },
			{ new: true }
		);

		if (!updatedBooking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		return res.status(200).json({
			message: "Recommended supplements updated successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		console.error("Error updating supplements:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Get all supplements for a booking
exports.getRecommendedSupplements = async (req, res) => {
	const { id } = req.params;

	try {
		const booking = await Booking.findById(id);

		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		return res.status(200).json({
			message: "Recommended supplements retrieved successfully",
			supplements: booking.recommendedSupplements,
		});
	} catch (error) {
		console.error("Error retrieving supplements:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// 🔹 Temporary uploader (to push dummy JSON from Postman)
exports.addTempBooking = async (req, res) => {
	try {
		const data = req.body;

		// Basic required fields check
		const requiredFields = [
			"doctorId",
			"doctorName",
			"doctorEmail",
			"timeSlot",
			"dateOfAppointment",
			"patientId",
			"patientEmail",
			"patientName",
			"patientGender",
			"patientAge",
			"patientIllness",
			"requestAccept",
			"meetLink",
			"amountPaid"
		];

		const missing = requiredFields.filter((field) => !data[field]);
		if (missing.length > 0) {
			return res.status(400).json({
				message: "Missing required fields",
				missingFields: missing
			});
		}

		// 🔹 Validate recommendedSupplements if provided
		if (data.recommendedSupplements && Array.isArray(data.recommendedSupplements)) {
			const invalidSupplements = data.recommendedSupplements.filter((supp) => {
				return !supp.medicineName || !supp.forIllness || !supp.dosage || !supp.instructions || !supp.duration;
			});

			if (invalidSupplements.length > 0) {
				return res.status(400).json({
					message: "Each recommendedSupplement must include medicineName, forIllness, dosage, instructions, and duration",
					invalidSupplements
				});
			}
		}

		// Create booking
		const newBooking = new Booking(data);
		await newBooking.save();

		res.status(201).json({
			message: "Booking added successfully",
			booking: newBooking,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to add booking",
			error: error.message,
		});
	}
};

// ✅ Get bookings by patientId
exports.getBookingsByPatientId = async (req, res) => {
	const { patientId } = req.params;

	if (!patientId) {
		return res.status(400).json({ error: "Patient ID is required" });
	}

	try {
		const bookings = await Booking.find({ patientId }).sort({ createdAt: -1 });

		if (!bookings || bookings.length === 0) {
			return res.status(404).json({ message: "No bookings found for this patient" });
		}

		return res.status(200).json({
			message: "Bookings retrieved successfully for patient",
			bookings,
		});
	} catch (error) {
		console.error("❌ Error fetching bookings by patient ID:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// ✅ Get bookings by doctorId
exports.getBookingsByDoctorId = async (req, res) => {
	const { doctorId } = req.params;

	if (!doctorId) {
		return res.status(400).json({ error: "Doctor ID is required" });
	}

	try {
		const bookings = await Booking.find({ doctorId }).sort({ createdAt: -1 });

		if (!bookings || bookings.length === 0) {
			return res.status(404).json({ message: "No bookings found for this doctor" });
		}

		return res.status(200).json({
			message: "Bookings retrieved successfully for doctor",
			bookings,
		});
	} catch (error) {
		console.error("❌ Error fetching bookings by doctor ID:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// ✅ Get reviewed bookings by patientId
exports.getReviewedBookingsByPatientId = async (req, res) => {
	const { patientId } = req.params;

	if (!patientId) {
		return res.status(400).json({ error: "Patient ID is required" });
	}

	try {
		const bookings = await Booking.find({
			patientId,
			review: { $exists: true, $ne: null, $ne: "" },
		}).sort({ createdAt: -1 });

		if (!bookings || bookings.length === 0) {
			return res.status(404).json({
				message: "No reviewed bookings found for this patient",
			});
		}

		return res.status(200).json({
			message: "Reviewed bookings retrieved successfully for patient",
			bookings,
		});

	} catch (error) {
		console.error("❌ Error fetching reviewed bookings by patient ID:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// ✅ Get reviewed bookings by doctorId
exports.getReviewedBookingsForDoctorId = async (req, res) => {
	const { doctorId } = req.params;

	if (!doctorId) {
		return res.status(400).json({ error: "Doctor ID is required" });
	}

	try {
		const bookings = await Booking.find({
			doctorId,
			review: { $exists: true, $ne: null, $ne: "" },
		}).sort({ createdAt: -1 });

		if (!bookings || bookings.length === 0) {
			return res.status(404).json({
				message: "No reviewed bookings found for this doctor",
			});
		}

		return res.status(200).json({
			message: "Reviewed bookings retrieved successfully for doctor",
			bookings,
		});
	} catch (error) {
		console.error("❌ Error fetching reviewed bookings by doctor ID:", error);
		return res.status(500).json({ error: "Server error" });
	}
};



