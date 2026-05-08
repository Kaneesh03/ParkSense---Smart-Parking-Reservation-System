const mongoose = require("mongoose");

const parkingLotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  district: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  parkingLotAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to User with 'parkingLotAdmin' role
  vehicleTypes: [{ type: String }],
  images: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("ParkingLot", parkingLotSchema);
