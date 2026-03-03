const mongoose = require("mongoose");

const whatsAppSessionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    whatsappNumber: {
        type: String,
        required: true,
        unique: true,
    },
    linkedAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    preferredLanguage: {
        type: String,
        enum: ["en", "hi", "bn", "ta", "te"],
        default: "en",
    },
    conversationState: {
        type: String,
        enum: ["idle", "booking_flow", "awaiting_doctor", "awaiting_date", "awaiting_time", "awaiting_illness", "awaiting_confirm", "set_language"],
        default: "idle",
    },
    bookingDraft: {
        type: Object,
        default: {},
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
});

whatsAppSessionSchema.index({ patientId: 1 });

module.exports = mongoose.model("WhatsAppSession", whatsAppSessionSchema);
