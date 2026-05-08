const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: String,
  parkingLotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingLot"
  },
  isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model("Slot", slotSchema);
