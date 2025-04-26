require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const orderRoutes = require("./routes/orderRoutes")
const blogRoutes = require("./routes/blogRoutes")
const prakritiRoutes = require("./routes/prakritiRoutes");
const dietYogaRoutes = require("./routes/dietYogaRoutes");

mongoose.set('debug', true);
const app = express();
const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose
  .connect(process.env.MDB)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); // Serve images from the uploads folder

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/orders" , orderRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/prakriti", prakritiRoutes)
app.use("/api/diet-yoga", dietYogaRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
