const express = require("express");
const multer = require("multer");
const router = express.Router();
const XLSX = require("xlsx");
const Doctor = require("../models/Doctor"); // Import Doctor model
const QRCode = require("qrcode"); // Import the qrcode library
const path = require("path"); // Import path module
const fs = require("fs");

const { getAllDoctors } = require("../controllers/doctorController");

// Public Routes
router.get("/", getAllDoctors); // Public route to view all Doctors

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadDirectory = path.join(__dirname, "../uploads/doctos");

const generateQRCode = async (doctorId) => {
    const qrData = `doctor:${doctorId}`;
    const qrCodeFileName = `${Date.now()}-${doctorId}-qr.png`;
    const qrCodePath = path.join(__dirname, "../uploads/doctors", qrCodeFileName);

    console.log("Generating QR Code for doctor:", doctorId);
    console.log("Saving QR Code to:", qrCodePath); // Log QR code path

    await QRCode.toFile(qrCodePath, qrData);
    console.log("QR Code saved successfully");

    return `uploads/doctors/${qrCodeFileName}`; // Return relative path
};

// Endpoint to get QR Code for doctor
router.get("/:id/qr-code", async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        console.log("Doctor fetched from DB:", doctor); // Log doctor data

        if (!doctor) {
            console.log("No doctor found with ID:", req.params.id);
            return res.status(404).json({ message: "Doctor not found" });
        }

        if (!doctor.qrCode) {
            console.log("No QR code associated with doctor ID:", req.params.id);
            return res.status(404).json({ message: "QR Code not found for this doctor" });
        }

        // Normalize the QR code path (remove extra parts if any)
        let qrCodePath = doctor.qrCode.replace(/\\/g, "/");  // Normalize backslashes to forward slashes

        // Check if the path starts with 'uploads/doctors' (if not, add it)
        if (!qrCodePath.startsWith('uploads/doctors/')) {
            qrCodePath = 'uploads/doctors/' + qrCodePath;
        }

        console.log("Normalized QR Code path:", qrCodePath);  // Log normalized path

        // Check if file exists at the QR code path
        const fullPath = path.join(__dirname, "../", qrCodePath);
        console.log("Full path to QR code:", fullPath); // Log full path to verify it

        if (!fs.existsSync(fullPath)) {
            console.log("QR Code file not found at:", fullPath);
            return res.status(404).json({ message: "QR Code file not found" });
        }

        res.json({ qrCode: qrCodePath });

    } catch (err) {
        console.error("Error fetching QR code:", err);
        res.status(500).json({ message: "Server error" });
    }
});

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
