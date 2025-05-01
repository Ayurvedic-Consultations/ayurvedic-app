const express = require("express");
const multer = require("multer");
const router = express.Router();
const XLSX = require("xlsx");
const Doctor = require("../models/Doctor"); // Import Doctor model

const { getAllDoctors } = require("../controllers/doctorController");

// Public Routes
router.get("/", getAllDoctors); // Public route to view all Doctors

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        console.log("File received:", req.file.originalname);

        // Process Excel file
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const doctorsData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("Parsed Data:", doctorsData);

        // Insert into MongoDB
        await Doctor.insertMany(doctorsData);

        res.status(200).json({ message: "Doctors uploaded successfully" });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ message: "Server error while uploading doctors" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
        console.error("Error deleting doctor:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
