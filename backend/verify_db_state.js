const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
const Slot = require("./models/Slot");
require("dotenv").config();

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const lotCount = await ParkingLot.countDocuments();
        const slotCount = await Slot.countDocuments();

        console.log("--------------------------------");
        console.log(`CURRENT DB STATE:`);
        console.log(`Lots: ${lotCount} (Expected: 17)`);
        console.log(`Slots: ${slotCount} (Expected: ~1020)`);
        console.log("--------------------------------");

        if (lotCount > 0) {
            const sampleLot = await ParkingLot.findOne();
            console.log("Sample Lot:", sampleLot.name);
            console.log("Lot Images:", sampleLot.images);
            const slotsForLot = await Slot.find({ parkingLotId: sampleLot._id });
            console.log(`Slots for '${sampleLot.name}': ${slotsForLot.length}`);
            console.log("Sample Slot Numbers:", slotsForLot.slice(0, 5).map(s => s.slotNumber));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
