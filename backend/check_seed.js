const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
const Slot = require("./models/Slot");
require("dotenv").config();

const check = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const lotCount = await ParkingLot.countDocuments();
    const slotCount = await Slot.countDocuments();
    console.log(`Lots: ${lotCount}, Slots: ${slotCount}`);
    process.exit();
}
check();
