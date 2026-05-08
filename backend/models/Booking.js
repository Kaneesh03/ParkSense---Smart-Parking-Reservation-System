const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot" },
  bookingDate: { type: Date, default: Date.now },
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String, enum: ["Two-wheeler", "Four-wheeler"], required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ["Active", "Completed", "Cancelled"], default: "Active" },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  amount: { type: Number, required: true },
  transactionId: { type: String },
  qrCode: { type: String } // Base64 or Data URL
});

module.exports = mongoose.model("Booking", bookingSchema);
