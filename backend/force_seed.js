const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
const Slot = require("./models/Slot");
require("dotenv").config();

async function seed() {
    console.log("SEED SCRIPT START");
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected Successfully");

        console.log("Removing all old data...");
        await ParkingLot.deleteMany({});
        await Slot.deleteMany({});
        console.log("Old data removed.");

        const lotsData = [
            { name: "Thillai Nagar Parking", location: "Thillai Nagar, Tiruchirappalli" },
            { name: "Gandhi Market Parking", location: "Gandhi Market, Tiruchirappalli" },
            { name: "Chathiram Bus Stand Parking", location: "Chathiram Bus Stand, Tiruchirappalli" },
            { name: "Trichy Junction Parking", location: "Trichy Junction, Tiruchirappalli" },
            { name: "Airport Parking", location: "Tiruchirappalli International Airport" },
            { name: "Srirangam Temple Parking", location: "Srirangam, Tiruchirappalli" },
            { name: "Samayapuram Temple Parking", location: "Samayapuram, Tiruchirappalli" },
            { name: "NSB Road Parking", location: "NSB Road, Tiruchirappalli" },
            { name: "Main Guard Gate Parking", location: "Main Guard Gate, Tiruchirappalli" },
            { name: "Bishop Heber College Area Parking", location: "Puthur / Teppakulam, Tiruchirappalli" }
        ];

        console.log(`Inserting ${lotsData.length} lots...`);
        const lots = await ParkingLot.insertMany(lotsData.map(l => ({ name: l.name, location: l.location, district: "Tiruchirappalli" })));
        console.log(`Inserted ${lots.length} lots.`);

        const slots = [];
        for (const lot of lots) {
            for (let i = 1; i <= 10; i++) {
                slots.push({
                    slotNumber: `S-${i}`,
                    parkingLotId: lot._id,
                    isBooked: false
                });
            }
        }

        console.log(`Inserting ${slots.length} slots...`);
        await Slot.insertMany(slots);
        console.log("Slots inserted.");

        const finalCount = await ParkingLot.countDocuments();
        console.log(`FINAL VERIFICATION - LOT COUNT: ${finalCount}`);

        console.log("SEED SUCCESSFUL");
        setTimeout(() => process.exit(0), 1000);
    } catch (err) {
        console.error("FATAL SEED ERROR:", err);
        process.exit(1);
    }
}

seed();
