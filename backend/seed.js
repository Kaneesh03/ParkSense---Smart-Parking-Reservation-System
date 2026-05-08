const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
const Slot = require("./models/Slot");
require("dotenv").config();
const fs = require("fs");

const seed = async () => {
    let log = "SEED START\n";
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        log += "Connected to MongoDB\n";

        // Check if data already exists to avoid duplicate seeding if called automatically
        const countBefore = await ParkingLot.countDocuments();
        if (countBefore >= 25 && false) {
            log += "Data already exists (25+ lots). Skipping seed.\n";
            console.log(log);
            return;
        }

        log += `Found only ${countBefore} lots. Re-seeding with expanded dataset...\n`;

        // Clear existing data before re-seeding to ensure clean state
        await ParkingLot.deleteMany({});
        await Slot.deleteMany({});
        log += "Cleared old data.\n";

        log += `Count Before: ${countBefore}\n`;

        // Create Parking Lots with Types
        const lotsData = [
            // Tiruchirappalli (10 lots)
            { name: "Thillai Nagar Parking", location: "Thillai Nagar, Tiruchirappalli", type: "large", district: "Tiruchirappalli", images: ["/Thillai Nagar Parking.png"] },
            { name: "Gandhi Market Parking", location: "Gandhi Market, Tiruchirappalli", type: "medium", district: "Tiruchirappalli", images: ["/Gandhi Market Parking.png"] },
            { name: "Chathiram Bus Stand Parking", location: "Chathiram Bus Stand, Tiruchirappalli", type: "extra-large", district: "Tiruchirappalli", images: ["/Chathiram Bus Stand Parking.png"] },
            { name: "Trichy Junction Parking", location: "Trichy Junction, Tiruchirappalli", type: "large", district: "Tiruchirappalli", images: ["/Trichy Junction Parking.png"] },
            { name: "Airport Parking", location: "Tiruchirappalli International Airport", type: "medium", district: "Tiruchirappalli", images: ["/Airport Parking.webp"] },
            { name: "Srirangam Temple Parking", location: "Srirangam, Tiruchirappalli", type: "temple", district: "Tiruchirappalli", images: ["/Srirangam Temple Parking.webp"] },
            { name: "Samayapuram Temple Parking", location: "Samayapuram, Tiruchirappalli", type: "temple", district: "Tiruchirappalli", images: ["/Samayapuram Temple Parking.webp"] },
            { name: "NSB Road Parking", location: "NSB Road, Tiruchirappalli", type: "medium", district: "Tiruchirappalli", images: ["/NSB Road Parking.webp"] },
            { name: "Main Guard Gate Parking", location: "Main Guard Gate, Tiruchirappalli", type: "large", district: "Tiruchirappalli", images: ["/Main Guard Gate Parking.webp"] },
            { name: "Bishop Heber College Area Parking", location: "Puthur / Teppakulam, Tiruchirappalli", type: "medium", district: "Tiruchirappalli", images: ["/Bishop Heber College Area Parking.jpg"] },

            // Chennai (10 lots)
            { name: "Chennai Central Parking", location: "Dr. M.G. Ramachandran Central Railway Station, Chennai", type: "large", district: "Chennai", images: ["/Chennai Central Parking.jpg"] },
            { name: "Marina Beach Parking", location: "Marina Beach, Chennai", type: "extra-large", district: "Chennai", images: ["/Marina Beach Parking.jpg"] },
            { name: "Chennai Airport Parking", location: "Chennai International Airport", type: "extra-large", district: "Chennai", images: ["/Chennai Airport Parking.jpg"] },
            { name: "Chepauk Stadium Parking", location: "M. A. Chidambaram Stadium, Chepauk, Chennai", type: "large", district: "Chennai", images: ["/Chepauk Stadium Parking.jpg"] },
            { name: "TNagar Commercial Parking", location: "T. Nagar Commercial Streets, Chennai", type: "large", district: "Chennai", images: ["/Logo.png"] },
            { name: "Parrys Corner Parking", location: "Parrys Corner, Chennai", type: "medium", district: "Chennai", images: ["/Logo.png"] },
            { name: "Phoenix Marketcity Parking", location: "Phoenix Marketcity, Chennai", type: "large", district: "Chennai", images: ["/Logo.png"] },
            { name: "Express Avenue Parking", location: "Express Avenue, Chennai", type: "large", district: "Chennai", images: ["/Logo.png"] },
            { name: "Kapaleeshwarar Temple Parking", location: "Kapaleeshwarar Temple, Chennai", type: "temple", district: "Chennai", images: ["/Logo.png"] },
            { name: "Kilambakkam Bus Terminus Parking", location: "Kalaignar Centenary Bus Terminus, Kilambakkam", type: "extra-large", district: "Chennai", images: ["/Logo.png"] },

            // Namakkal (5 lots)
            { name: "Namakkal Bazaar Parking", location: "Namakkal Bazaar Area, Namakkal", type: "medium", district: "Namakkal", images: ["/Logo.png"] },
            { name: "Anjaneyar Temple Parking", location: "Namakkal Anjaneyar Temple, Namakkal", type: "temple", district: "Namakkal", images: ["/Logo.png"] },
            { name: "New Bus Stand Parking", location: "New Bus Stand, Namakkal", type: "large", district: "Namakkal", images: ["/Logo.png"] },
            { name: "Salem Road Parking", location: "Salem Road Commercial Area, Namakkal", type: "medium", district: "Namakkal", images: ["/Logo.png"] },
            { name: "Agaya Gangai Falls Parking", location: "Agaya Gangai Falls, Namakkal", type: "small", district: "Namakkal", images: ["/Logo.png"] }
        ];

        const lots = await ParkingLot.insertMany(lotsData.map(l => ({ 
            name: l.name, 
            location: l.location, 
            district: l.district,
            images: l.images 
        })));
        log += `Created ${lots.length} Parking Lots\n`;

        // Create Slots based on Type
        const slots = [];
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        
        // TEMPLE LAYOUT CONFIGURATIONS
        const TEMPLE_CONFIGS = {
            "Srirangam Temple Parking": { twCount: 40, carCount: 16, vipCount: 2, accCount: 2 },
            "Samayapuram Temple Parking": { twCount: 50, carCount: 20, vipCount: 4, accCount: 2 },
            "Kapaleeshwarar Temple Parking": { twCount: 30, carCount: 12, vipCount: 2, accCount: 1 },
            "Anjaneyar Temple Parking": { twCount: 40, carCount: 14, vipCount: 2, accCount: 2 }
        };

        for (let i = 0; i < lots.length; i++) {
            const lot = lots[i];
            const type = lotsData[i].type;
            
            if (lot.name === "Trichy Junction Parking") {
                // Custom layout for Trichy Junction
                const tjSlots = [
                    // Top Row Car
                    "TJ-TR-S1", "TJ-TR-S2", "TJ-TR-S3", "TJ-TR-S4", "TJ-TR-S5", "TJ-TR-S6", "TJ-TR-S7", "TJ-TR-S8", "TJ-TR-S1L", "TJ-TR-S11", "TJ-TR-S10",
                    // Top Row 2-Wheeler
                    "TJ-TR-T1", "TJ-TR-T2", "TJ-TR-T3", "TJ-TR-T4", "TJ-TR-T5", "TJ-TR-T6", "TJ-TR-T11", "TJ-TR-T10", "TJ-TR-T9", "TJ-TR-T8A", "TJ-TR-T7", "TJ-TR-T8B", "TJ-TR-T20",
                    // Left Vertical 2-Wheeler Stack
                    "TJ-LV-T1", "TJ-LV-T2", "TJ-LV-T3", "TJ-LV-T4",
                    // Center Left Block - Top
                    "TJ-CLT-S1", "TJ-CLT-S2", "TJ-CLT-S3", "TJ-CLT-S4", "TJ-CLT-S5", "TJ-CLT-S6", "TJ-CLT-S7", "TJ-CLT-S8", "TJ-CLT-S90",
                    // Center Left Block - Bottom
                    "TJ-CLB-S1", "TJ-CLB-S2", "TJ-CLB-S3", "TJ-CLB-S4", "TJ-CLB-S5", "TJ-CLB-S6", "TJ-CLB-S7", "TJ-CLB-S8", "TJ-CLB-SUV",
                    // Bottom Left Row
                    "TJ-BL-S1", "TJ-BL-S2", "TJ-BL-S3", "TJ-BL-S4", "TJ-BL-S5", "TJ-BL-S6", "TJ-BL-S7", "TJ-BL-S8", "TJ-BL-SUV",
                    // Center Right Block - Top
                    "TJ-CRT-S48", "TJ-CRT-S25", "TJ-CRT-S26", "TJ-CRT-S37", "TJ-CRT-S38", "TJ-CRT-S39", "TJ-CRT-S40", "TJ-CRT-S41", "TJ-CRT-S52",
                    // Center Right Block - Bottom
                    "TJ-CRB-S33", "TJ-CRB-S34", "TJ-CRB-S35", "TJ-CRB-S36", "TJ-CRB-S37", "TJ-CRB-S38", "TJ-CRB-S49", "TJ-CRB-S40", "TJ-CRB-SUV",
                    // Right Stack Top
                    "TJ-RV-T20", "TJ-RV-T19", "TJ-RV-T18", "TJ-RV-T17", "TJ-RV-T15", "TJ-RV-T10A",
                    // Right Stack Bottom
                    "TJ-RV-T10B", "TJ-RV-T19B", "TJ-RV-T18B", "TJ-RV-T17B", "TJ-RV-T16", "TJ-RV-T19C", "TJ-RV-T20B",
                    // Accessible
                    "TJ-ACC-A1", "TJ-ACC-A2", "TJ-ACC-A3", "TJ-ACC-A4",
                    // VIP / Reserved
                    "TJ-VIP-V1", "TJ-VIP-V2", "TJ-VIP-V3", "TJ-VIP-V4"
                ];
                
                tjSlots.forEach(s => {
                    slots.push({
                        slotNumber: s,
                        parkingLotId: lot._id,
                        // Make S5 occupied to match "One highlighted slot (S5 occupied)"
                        isBooked: s === "TJ-CLT-S5"
                    });
                });
                continue;
            }
            
            // Scalable Temple Template Slot Generation
            if (type === "temple") {
                const config = TEMPLE_CONFIGS[lot.name] || { twCount: 30, carCount: 10, vipCount: 2, accCount: 2 };
                
                for(let i=1; i<=config.twCount; i++) slots.push({ slotNumber: `T-BIKE-${i}`, parkingLotId: lot._id, isBooked: false });
                for(let i=1; i<=config.carCount; i++) slots.push({ slotNumber: `T-CAR-${i}`, parkingLotId: lot._id, isBooked: false });
                for(let i=1; i<=config.vipCount; i++) slots.push({ slotNumber: `T-VIP-${i}`, parkingLotId: lot._id, isBooked: false });
                for(let i=1; i<=config.accCount; i++) slots.push({ slotNumber: `T-ACC-${i}`, parkingLotId: lot._id, isBooked: false });
                
                continue;
            }

            let rowCount = 4; // Default small (Rows A-D)

            if (type === "medium") rowCount = 6; // Rows A-F
            if (type === "large") rowCount = 8; // Rows A-H
            if (type === "extra-large") rowCount = 12; // Rows A-L

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

        await Slot.insertMany(slots);
        log += `Created ${slots.length} Slots (Varied counts per lot)\n`;

        log += "SEED SUCCESS";
        console.log(log);
        fs.writeFileSync("seed_debug_final.txt", log);
    } catch (err) {
        log += `ERROR: ${err.message}\n`;
        console.error(err);
        fs.writeFileSync("seed_debug_final.txt", log);
        if (require.main === module) process.exit(1);
    }
};

module.exports = seed;

if (require.main === module) {
    seed().then(() => process.exit(0));
}
