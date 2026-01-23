// models/DietYoga.js
const mongoose = require("mongoose");

const dietYogaSchema = new mongoose.Schema({
	patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
	doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
	
	diet: {
		weekly: {
			monday: {
				breakfast: { type: String},
				lunch: { type: String},
				dinner: { type: String},
				juices: { type: String}
			},	
			tuesday: {
				breakfast: { type: String},
				lunch: { type: String},
				dinner: { type: String},
				juices: { type: String}
			},
			wednesday: {
				breakfast: { type: String},
				lunch: { type: String},
				dinner: { type: String},
				juices: { type: String}
			},
			thursday: {
				breakfast: { type: String},
				lunch: { type: String},
				dinner: { type: String},
				juices: { type: String}
			},
			friday: {
				breakfast: { type: String},
				lunch: { type: String},
				dinner: { type: String},
				juices: { type: String}
			},
			saturday: {
				breakfast: { type: String},
				lunch: { type: String},
				dinner: { type: String},
				juices: { type: String}
			},
			sunday: {
				breakfast: { type: String},
				lunch: { type: String},
				dinner: { type: String},
				juices: { type: String}
			}
		},
		herbs: [String]
	},
	// Yoga recommendations
    yoga: {
        morning: [{
            name: { type: String, required: true },
            link: { type: String, default: "" } 
        }],
        evening: [{
            name: { type: String, required: true },
            link: { type: String, default: "" }
        }]
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
