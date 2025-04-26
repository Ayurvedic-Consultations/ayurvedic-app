// controllers/dietYogaController.js
const DietYoga = require("../models/DietYoga");
const Booking = require("../models/Booking");

// Create new diet and yoga recommendation
exports.createDietYoga = async (req, res) => {
  const {
    bookingId,
    patientEmail,
    patientName,
    doctorEmail,
    doctorName,
    diet,
    yoga
  } = req.body;

  try {
    // Check if the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if diet yoga recommendation already exists for this booking
    let dietYoga = await DietYoga.findOne({ bookingId });
    
    if (dietYoga) {
      // Update existing record
      dietYoga.diet = diet || dietYoga.diet;
      dietYoga.yoga = yoga || dietYoga.yoga;
      dietYoga.updatedAt = Date.now();
      
      await dietYoga.save();
      return res.status(200).json({
        message: "Diet and yoga recommendations updated successfully",
        dietYoga
      });
    } else {
      // Create new record
      dietYoga = new DietYoga({
        bookingId,
        patientEmail: patientEmail || booking.patientEmail,
        patientName: patientName || booking.patientName,
        doctorEmail: doctorEmail || booking.doctorEmail,
        doctorName: doctorName || booking.doctorName,
        diet,
        yoga
      });

      await dietYoga.save();
      return res.status(201).json({
        message: "Diet and yoga recommendations created successfully",
        dietYoga
      });
    }
  } catch (error) {
    console.error("Error creating/updating diet yoga:", error);
    return res.status(500).json({ error: "Server error" });
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

// Get diet and yoga recommendations for a patient
exports.getDietYogaByPatient = async (req, res) => {
  const { patientEmail } = req.params;

  try {
    const dietYogas = await DietYoga.find({ patientEmail });
    
    if (dietYogas.length === 0) {
      return res.status(404).json({ message: "No diet and yoga recommendations found for this patient" });
    }

    return res.status(200).json({
      message: "Diet and yoga recommendations retrieved successfully",
      dietYogas
    });
  } catch (error) {
    console.error("Error fetching diet yoga for patient:", error);
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
