const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
const Slot = require("./models/Slot");
require("dotenv").config();

async function reseed() {
    console.log("Starting FORCE RESEED (Varied Layouts)...");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        console.log("Clearing all collections...");
        await ParkingLot.deleteMany({});
        await Slot.deleteMany({});
        console.log("All data cleared.");

        const lotsData = [
            { name: "Thillai Nagar Parking", location: "Thillai Nagar, Tiruchirappalli", type: "large" },
            { name: "Gandhi Market Parking", location: "Gandhi Market, Tiruchirappalli", type: "medium" },
            { name: "Chathiram Bus Stand Parking", location: "Chathiram Bus Stand, Tiruchirappalli", type: "extra-large" },
            { name: "Trichy Junction Parking", location: "Trichy Junction, Tiruchirappalli", type: "large" },
            { name: "Airport Parking", location: "Tiruchirappalli International Airport", type: "medium" },
            { name: "Srirangam Temple Parking", location: "Srirangam, Tiruchirappalli", type: "small" },
            { name: "Samayapuram Temple Parking", location: "Samayapuram, Tiruchirappalli", type: "medium" },
            { name: "NSB Road Parking", location: "NSB Road, Tiruchirappalli", type: "medium" },
            { name: "Main Guard Gate Parking", location: "Main Guard Gate, Tiruchirappalli", type: "large" },
            { name: "Bishop Heber College Area Parking", location: "Puthur / Teppakulam, Tiruchirappalli", type: "medium" }
        ];

        console.log(`Inserting ${lotsData.length} Parking Lots...`);
        const lots = await ParkingLot.insertMany(lotsData.map(l => ({ name: l.name, location: l.location, district: "Tiruchirappalli" })));
        console.log("Lots inserted.");

        const slots = [];
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        console.log("Generating varied slots per lot...");
        for (let i = 0; i < lots.length; i++) {
            const lot = lots[i];
            const type = lotsData[i].type;

            // 1. CUSTOM LAYOUT: University Campus (U-Shape)
            if (lot.name === "Bishop Heber College Area Parking") {
                for (let s = 1; s <= 20; s++) slots.push({ slotNumber: `Top-${s}`, parkingLotId: lot._id, isBooked: false });
                for (let s = 1; s <= 10; s++) slots.push({ slotNumber: `Left-${s}`, parkingLotId: lot._id, isBooked: false });
                for (let s = 1; s <= 10; s++) slots.push({ slotNumber: `Right-${s}`, parkingLotId: lot._id, isBooked: false });
                for (let s = 1; s <= 10; s++) slots.push({ slotNumber: `CenterA-${s}`, parkingLotId: lot._id, isBooked: false });
                for (let s = 1; s <= 10; s++) slots.push({ slotNumber: `CenterB-${s}`, parkingLotId: lot._id, isBooked: false });
                continue;
            }

            // 2. AIRPORT LAYOUT (Terminals - MASSIVE CAPACITY)
            if (lot.name.includes("Airport")) {
                // Terminal 1 (Rows A-L)
                const rows = "ABCDEFGHIJKL".split("");
                for (const row of rows) {
                    for (let s = 1; s <= 15; s++) slots.push({ slotNumber: `T1-${row}-${s}`, parkingLotId: lot._id, isBooked: false });
                }
                // Terminal 2 (Rows A-L)
                for (const row of rows) {
                    for (let s = 1; s <= 15; s++) slots.push({ slotNumber: `T2-${row}-${s}`, parkingLotId: lot._id, isBooked: false });
                }
                continue;
            }

            // 3. MALL LAYOUT (Multi-Level)
            if (lot.name === "Thillai Nagar Parking") {
                // Level 1, 2, 3
                const levels = ["P1", "P2", "P3"];
                const rows = ["A", "B", "C", "D"];
                for (const level of levels) {
                    for (const row of rows) {
                        for (let s = 1; s <= 12; s++) slots.push({ slotNumber: `${level}-${row}-${s}`, parkingLotId: lot._id, isBooked: false });
                    }
                }
                continue;
            }

            // 4. STADIUM LAYOUT (Gates)
            if (lot.name === "Chathiram Bus Stand Parking") {
                const gates = ["North", "South", "East", "West"];
                const rows = ["A", "B", "C"];
                for (const gate of gates) {
                    for (const row of rows) {
                        for (let s = 1; s <= 12; s++) slots.push({ slotNumber: `${gate}-${row}-${s}`, parkingLotId: lot._id, isBooked: false });
                    }
                }
                continue;
            }

            // 5. HOSPITAL LAYOUT (Zones)
            if (lot.name === "Main Guard Gate Parking") {
                // Emergency (Priority)
                for (let s = 1; s <= 10; s++) slots.push({ slotNumber: `Emerg-${s}`, parkingLotId: lot._id, isBooked: false });
                // Staff (Restricted)
                const staffRows = ["A", "B"];
                for (const row of staffRows) {
                    for (let s = 1; s <= 10; s++) slots.push({ slotNumber: `Staff-${row}-${s}`, parkingLotId: lot._id, isBooked: false });
                }
                // Visitor (General)
                const visitorRows = "ABCDEF".split("");
                for (const row of visitorRows) {
                    for (let s = 1; s <= 10; s++) slots.push({ slotNumber: `Visitor-${row}-${s}`, parkingLotId: lot._id, isBooked: false });
                }
                continue;
            }

            // DEFAULT / STANDARD LAYOUT (For anything else)
            let rowCount = 4;
            if (type === "medium") rowCount = 6;
            if (type === "large") rowCount = 8;

            for (let r = 0; r < rowCount; r++) {
                const rowLetter = alphabet[r];
                for (let s = 1; s <= 10; s++) {
                    slots.push({
                        slotNumber: `${rowLetter}-${s}`,
                        parkingLotId: lot._id,
                        isBooked: false
                    });
                }
            }
        }

        console.log(`Inserting ${slots.length} Slots...`);
        await Slot.insertMany(slots);
        console.log("Slots inserted.");

        console.log("RESEED COMPLETE. Exiting...");
        process.exit(0);
    } catch (err) {
        console.error("RESEED FAILED:", err);
        process.exit(1);
    }
}

reseed();
