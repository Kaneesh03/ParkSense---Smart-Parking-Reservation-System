const mongoose = require("mongoose");

const parkingOwnerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  businessName: { type: String, required: true },
  contactDetails: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "suspended"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("ParkingOwner", parkingOwnerSchema);
