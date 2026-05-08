const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
require("dotenv").config();
const fs = require("fs");

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await ParkingLot.countDocuments();
        const lots = await ParkingLot.find({});

        let output = `Count: ${count}\n`;
        lots.forEach(l => output += `- ${l.name}\n`);

        fs.writeFileSync("debug_out.txt", output);
        console.log("Written to debug_out.txt");
        process.exit();
    } catch (e) {
        fs.writeFileSync("debug_out.txt", "ERROR: " + e.message);
        process.exit(1);
    }
}

run();
