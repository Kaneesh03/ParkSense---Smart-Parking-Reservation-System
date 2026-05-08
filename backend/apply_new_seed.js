const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
const Slot = require("./models/Slot");
const seed = require("./seed");
require("dotenv").config();

const applyKey = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Force Update");

        console.log("Creating/Clearing database for new layout...");
        await ParkingLot.deleteMany({});
        await Slot.deleteMany({});
        console.log("Database cleared.");

        console.log("Running new Seed...");
        await seed();

        console.log("Force Update Complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

applyKey();
