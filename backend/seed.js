const mongoose = require("mongoose");
const { Medicine } = require("./Models/db"); // Import Medicine model

// MongoDB URI from environment variables for security
const mongoURI =
  "mongodb+srv://hello:123@cluster0.bex5s.mongodb.net/medicine?retryWrites=true&w=majority&appName=Cluster0";

// Sample data
const sampleMedicines = [
  {
    name: "Aspirin",
    photo: "http://example.com/aspirin.jpg",
    provider: "PharmaCo",
    rating: 4.5,
    price: 10.99,
    prescriptionRequired: false,
    description: "Used to reduce fever and relieve pain.",
    howToUse: "Take one tablet every 4-6 hours as needed.",
    ingredients: ["Acetylsalicylic Acid"],
    customerReviews: [
      {
        username: "john_doe",
        rating: 5,
        comment: "Excellent for headaches!",
      },
      {
        username: "jane_doe",
        rating: 4,
        comment: "Good, but a bit pricey.",
      },
    ],
  },
  {
    name: "Ibuprofen",
    photo: "http://example.com/ibuprofen.jpg",
    provider: "MediCorp",
    rating: 4.7,
    price: 12.99,
    prescriptionRequired: false,
    description:
      "Anti-inflammatory used to relieve pain, reduce inflammation, and lower fever.",
    howToUse: "Take one tablet every 6-8 hours as needed.",
    ingredients: ["Ibuprofen"],
    customerReviews: [
      {
        username: "alice_smith",
        rating: 5,
        comment: "Very effective for joint pain.",
      },
    ],
  },
];

// Function to seed the database
const seedDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected");

    // Clear existing data
    await Medicine.deleteMany({});

    // Insert sample data
    await Medicine.insertMany(sampleMedicines);
    console.log("Sample data inserted");

    // Close the connection
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err.message);
    process.exit(1);
  }
};

// Run the seeding function
seedDB();
