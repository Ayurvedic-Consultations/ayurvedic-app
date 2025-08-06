const Doctor = require("../models/Doctor");

// Get All Doctors (Public)
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();

    const doctorsWithQrUrls = doctors.map((doc) => {
      return {
        ...doc._doc,
        qrCode: doc.qrCode
          ? `${process.env.BASE_URL || "http://localhost:5000"}/${doc.qrCode}`
          : null,
      };
    });

    res.status(200).json(doctorsWithQrUrls);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch Doctors",
      error: error.message,
    });
  }
};
