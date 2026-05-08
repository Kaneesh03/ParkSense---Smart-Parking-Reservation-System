const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  phone: { type: String, default: "" },
  vehicleNumber: { type: String, default: "" },
  preferredVehicleType: { type: String, enum: ["Two-wheeler", "Four-wheeler"], default: "Four-wheeler" },
  preferences: {
    bookingNotifications: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    cancellations: { type: Boolean, default: true },
    preferredDistrict: { type: String, default: "Tiruchirappalli" },
    defaultReservationDuration: { type: Number, default: 1 } // Hours
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
