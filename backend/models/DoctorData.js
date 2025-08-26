const mongoose = require("mongoose");

const doctorDataSchema = new mongoose.Schema({
    firstname: { type: String},
    lastname: { type: String},
    imageLink: { type: String },

    gender: { type: String},
    email: { type: String, unique: true },
    whatsapp: { type: String}, // stored as string to preserve formatting
    dob: { type: String}, // stored as string in dd/mm/yyyy

    experience: { type: Number},

    location: {
        pincode: { type: String},
        specific: { type: String},
    },

    education: {
        degree: { type: String},
        college: { type: String},
    },

    fee: { type: Number},
    certificateLink: { type: String},

    specialization: [{ type: String}],
    introduction: { type: String},
    languages: [{ type: String}],
    timings: { type: String},

    paymentMethods: [{ type: String}],
});

module.exports = mongoose.model("DoctorData", doctorDataSchema);
