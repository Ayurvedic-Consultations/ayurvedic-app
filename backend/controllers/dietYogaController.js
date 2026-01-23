// controllers/dietYogaController.js
const DietYoga = require("../models/DietYoga");
const Booking = require("../models/Booking");

// Create new diet recommendation
exports.prescribeDiet = async (req, res) => {
	const {
		bookingId,
		patientId,
		doctorId,
		dietPlan
	} = req.body;

	try {
		console.log("Prescribe diet Controller Called");
		// 1. Check if the booking exists
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		// 2. Check if diet yoga recommendation already exists for this booking
		let dietYoga = await DietYoga.findOne({ bookingId: bookingId });

		if (dietYoga) {
			dietYoga.diet = dietPlan;
			dietYoga.doctor = doctorId;
			dietYoga.patient = patientId;
			dietYoga.updatedAt = Date.now();

			await dietYoga.save();
			return res.status(200).json({
				message: "Diet recommendations updated successfully",
				dietYoga
			});

		} else {
			// --- CREATE NEW RECORD ---
			console.log("Prescribe diet Controller Called - new record");

			dietYoga = new DietYoga({
				bookingId: bookingId,
				patient: patientId,
				doctor: doctorId,
				diet: dietPlan
			});

			await dietYoga.save();
			return res.status(201).json({
				message: "Diet recommendations created successfully",
				dietYoga
			});
		}

	} catch (error) {
		console.error("Error creating/updating diet:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Create new yoga recommendation
exports.prescribeYoga = async (req, res) => {
	const {
		bookingId,
		patientId,
		doctorId,
		yogaPlan 
	} = req.body;

	try {
		// 1. Validation
		if (!bookingId || !yogaPlan) {
			return res.status(400).json({ error: "Booking ID and Yoga Plan are required" });
		}

		// 2. Check if the booking exists
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		// 3. Find and Update
		const dietYoga = await DietYoga.findOneAndUpdate(
			{ bookingId: bookingId },
			{
				$set: {
					patient: patientId, 
					doctor: doctorId,
					yoga: yogaPlan,
					updatedAt: Date.now()
				}
			},
			{
				new: true,
				upsert: true,
				setDefaultsOnInsert: true
			}
		);

		return res.status(200).json({
			message: "Yoga recommendations saved successfully",
			dietYoga
		});

	} catch (error) {
		console.error("Error prescribing yoga:", error);
		return res.status(500).json({ error: "Server error", details: error.message });
	}
};

// Get diet and yoga recommendation by booking ID
exports.getDietYogaByBooking = async (req, res) => {
	const { bookingId } = req.params;

	try {
		const dietYoga = await DietYoga.findOne({ bookingId });

		if (!dietYoga) {
			return res.status(404).json({ message: "No diet and yoga recommendations found for this booking" });
		}

		return res.status(200).json({
			message: "Diet and yoga recommendations retrieved successfully",
			dietYoga
		});
	} catch (error) {
		console.error("Error fetching diet yoga:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Update diet recommendation
exports.updateDiet = async (req, res) => {
	const { id } = req.params;
	const { diet } = req.body;

	try {
		const dietYoga = await DietYoga.findById(id);

		if (!dietYoga) {
			return res.status(404).json({ error: "Diet and yoga recommendation not found" });
		}

		dietYoga.diet = diet;
		dietYoga.updatedAt = Date.now();

		await dietYoga.save();

		return res.status(200).json({
			message: "Diet recommendations updated successfully",
			dietYoga
		});
	} catch (error) {
		console.error("Error updating diet:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Update yoga recommendation
exports.updateYoga = async (req, res) => {
	const { id } = req.params;
	const { yoga } = req.body;

	try {
		const dietYoga = await DietYoga.findById(id);

		if (!dietYoga) {
			return res.status(404).json({ error: "Diet and yoga recommendation not found" });
		}

		dietYoga.yoga = yoga;
		dietYoga.updatedAt = Date.now();

		await dietYoga.save();

		return res.status(200).json({
			message: "Yoga recommendations updated successfully",
			dietYoga
		});
	} catch (error) {
		console.error("Error updating yoga:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Add this new function to fetch diet and yoga by patient email
exports.getDietYogaByPatientEmail = async (req, res) => {
	const { patientEmail } = req.params;

	try {
		const dietYoga = await DietYoga.findOne({ patientEmail });
		if (!dietYoga) {
			return res.status(404).json({ message: "No diet and yoga recommendations found for this patient." });
		}

		return res.status(200).json({ diet: dietYoga.diet, yoga: dietYoga.yoga });
	} catch (error) {
		console.error("Error fetching diet and yoga by patient email:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Delete diet and yoga recommendation
exports.deleteDietYoga = async (req, res) => {
	const { id } = req.params;

	try {
		const deletedDietYoga = await DietYoga.findByIdAndDelete(id);

		if (!deletedDietYoga) {
			return res.status(404).json({ error: "Diet and yoga recommendation not found" });
		}

		return res.status(200).json({ message: "Diet and yoga recommendation deleted successfully" });
	} catch (error) {
		console.error("Error deleting diet yoga:", error);
		return res.status(500).json({ error: "Server error" });
	}
};
