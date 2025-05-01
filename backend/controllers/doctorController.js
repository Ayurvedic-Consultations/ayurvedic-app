const Doctor = require("../models/Doctor");

// Get All Doctors (Public)
exports.getAllDoctors = async (req, res) => {
  try {
    const Doctors = await Doctor.find();
    res.status(200).json(Doctors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch Doctors", error: error.message });
  }
};
