const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
const fs = require("fs");
require("dotenv").config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await ParkingLot.countDocuments();
        const lots = await ParkingLot.find({});
        console.log(`ParkingLots Count: ${count}`);
        lots.forEach(l => console.log(`- ${l.name}`));
        process.exit();
    } catch (e) {
        fs.writeFileSync("diagnosis.txt", `Error: ${e.message}`);
        process.exit(1);
    }
};
run();
