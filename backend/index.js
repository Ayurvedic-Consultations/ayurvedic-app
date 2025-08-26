require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const orderRoutes = require("./routes/orderRoutes")
const blogRoutes = require("./routes/blogRoutes")
const prakritiRoutes = require("./routes/prakritiRoutes");
const dietYogaRoutes = require("./routes/dietYogaRoutes");
const searchRoutes = require("./routes/searchRoutes");

const uploadRoutes = require("./routes/uploadRoutes");
const generateBlogRoutes = require("./routes/generateBlogRoutes");


mongoose.set('debug', true);
const app = express();
const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose
  .connect(process.env.MDB)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors({
  origin: "*", // or ["https://your-ai-generator-site.com"]
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); // Serve images from the uploads folder

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/orders", orderRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/prakriti", prakritiRoutes)
app.use("/api/diet-yoga", dietYogaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/search", searchRoutes);

app.use("/api/upload", uploadRoutes);
app.use("/api/webhook", generateBlogRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});