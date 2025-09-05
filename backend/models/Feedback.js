import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    fromType: { type: String, enum: ["Patient", "Doctor"], required: true },
    from: { type: mongoose.Schema.Types.ObjectId, refPath: "fromType", required: true },
    toType: { type: String, enum: ["Doctor", "Retailer"], required: true },
    to: { type: mongoose.Schema.Types.ObjectId, refPath: "toType", required: true },
    text: { type: String, required: true },
    stars: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    relatedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: false },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);