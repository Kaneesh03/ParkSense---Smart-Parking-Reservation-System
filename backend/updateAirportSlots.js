const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
const Slot = require("./models/Slot");
require("dotenv").config({ path: "c:/Users/kanee/Desktop/ParkSense/backend/.env" });

async function updateAirport() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const airportLot = await ParkingLot.findOne({ name: "Airport Parking" });
        
        if (!airportLot) {
            console.log("Airport Parking not found. Seeding first...");
            process.exit(1);
        }

        console.log("Deleting old airport slots...");
        await Slot.deleteMany({ parkingLotId: airportLot._id });

        const generateNames = (blockLetter) => {
            const arr = [];
            for (let i = 1; i <= 8; i++) arr.push(`${blockLetter}-P${i}`);
            for (let i = 1; i <= 8; i++) arr.push(`${blockLetter}-S${i}`);
            return arr;
        };

        const newNames = [
            ...generateNames("A"),
            ...generateNames("B"),
            ...generateNames("C")
        ];

        console.log(`Inserting ${newNames.length} new structural airport slots...`);
        const slotsToInsert = newNames.map(name => ({
            slotNumber: name,
            parkingLotId: airportLot._id,
            isBooked: false
        }));

        await Slot.insertMany(slotsToInsert);
        console.log("Successfully updated Airport slot naming consistency!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

updateAirport();
