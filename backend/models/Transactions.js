const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  payerType: { type: String, required: true, enum: ["Patient", "Doctor", "Retailer"] },
  payer: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "payerType" },

  receiverType: { type: String, required: true, enum: ["Patient", "Doctor", "Retailer"] },
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "receiverType" },

  type: { type: String, required: true, enum: ["Consultation", "Medicine Purchase", "Diet/Yoga Plan"] },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  details: { type: String },

  // 🛒 Only for medicine purchases
  medicineStatus: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: false },
    type: String,
    enum: ["Pending", "Received", "Shipped"],
    default: null
  }
}, { timestamps: true });


module.exports = mongoose.model("Transaction", TransactionSchema);