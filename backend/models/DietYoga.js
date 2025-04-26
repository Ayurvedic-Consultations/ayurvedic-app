// models/DietYoga.js
const mongoose = require("mongoose");

const dietYogaSchema = new mongoose.Schema({
  patientEmail: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  doctorEmail: {
    type: String,
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  // Diet recommendations
  diet: {
    daily: {
      breakfast: {
        type: String,
        default: "Default breakfast recommendation",
      },
      lunch: {
        type: String,
        default: "Default lunch recommendation",
      },
      dinner: {
        type: String,
        default: "Default dinner recommendation",
      },
      juices: {
        type: String,
        default: "Default juice recommendation",
      }
    },
    weekly: {
      monday: {
        breakfast: { type: String, default: "Default breakfast" },
        lunch: { type: String, default: "Default lunch" },
        dinner: { type: String, default: "Default dinner" },
        juices: { type: String, default: "Default juices" }
      },
      tuesday: {
        breakfast: { type: String, default: "Default breakfast" },
        lunch: { type: String, default: "Default lunch" },
        dinner: { type: String, default: "Default dinner" },
        juices: { type: String, default: "Default juices" }
      },
      wednesday: {
        breakfast: { type: String, default: "Default breakfast" },
        lunch: { type: String, default: "Default lunch" },
        dinner: { type: String, default: "Default dinner" },
        juices: { type: String, default: "Default juices" }
      },
      thursday: {
        breakfast: { type: String, default: "Default breakfast" },
        lunch: { type: String, default: "Default lunch" },
        dinner: { type: String, default: "Default dinner" },
        juices: { type: String, default: "Default juices" }
      },
      friday: {
        breakfast: { type: String, default: "Default breakfast" },
        lunch: { type: String, default: "Default lunch" },
        dinner: { type: String, default: "Default dinner" },
        juices: { type: String, default: "Default juices" }
      },
      saturday: {
        breakfast: { type: String, default: "Default breakfast" },
        lunch: { type: String, default: "Default lunch" },
        dinner: { type: String, default: "Default dinner" },
        juices: { type: String, default: "Default juices" }
      },
      sunday: {
        breakfast: { type: String, default: "Default breakfast" },
        lunch: { type: String, default: "Default lunch" },
        dinner: { type: String, default: "Default dinner" },
        juices: { type: String, default: "Default juices" }
      }
    },
    herbs: [String]
  },
  // Yoga recommendations
  yoga: {
    morningPlan: {
      type: String,
      default: "Default morning yoga plan",
    },
    eveningPlan: {
      type: String,
      default: "Default evening yoga plan",
    }
  },
  // Link to the original booking
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const DietYoga = mongoose.model("DietYoga", dietYogaSchema);
module.exports = DietYoga;
