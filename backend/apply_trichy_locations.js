const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
const Slot = require("./models/Slot");
const Booking = require("./models/Booking");
require("dotenv").config();

const newLocations = [
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

async function updateLocations() {
    console.log("Starting Trichy Location Update Script...");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const lots = await ParkingLot.find().sort({ _id: 1 });
        
        if (lots.length < 10) {
            console.error(`Not enough parking lots in database (${lots.length}). Expected at least 10.`);
            process.exit(1);
        }

        console.log(`Found ${lots.length} parking lots. Updating the first 10...`);
        
        for (let i = 0; i < 10; i++) {
            const lot = lots[i];
            const newLoc = newLocations[i];
            lot.name = newLoc.name;
            lot.location = newLoc.location;
            lot.district = "Tiruchirappalli";
            await lot.save();
            console.log(`Updated [${i+1}/10]: ${lot.name}`);
        }

        if (lots.length > 10) {
            console.log(`Found ${lots.length - 10} extra parking lots. Removing them...`);
            for (let i = 10; i < lots.length; i++) {
                const extraLot = lots[i];
                console.log(`Deleting extra lot: ${extraLot.name}`);
                
                // Find all slots associated with this lot
                const slots = await Slot.find({ parkingLotId: extraLot._id });
                const slotIds = slots.map(s => s._id);
                
                // Delete bookings for these slots
                const deletedBookings = await Booking.deleteMany({ slotId: { $in: slotIds } });
                console.log(`  -> Deleted ${deletedBookings.deletedCount} orphaned bookings.`);
                
                // Delete slots
                const deletedSlots = await Slot.deleteMany({ parkingLotId: extraLot._id });
                console.log(`  -> Deleted ${deletedSlots.deletedCount} slots.`);
                
                // Delete the lot itself
                await ParkingLot.deleteOne({ _id: extraLot._id });
            }
        }

        console.log("Trichy Location Update Complete!");
        process.exit(0);

    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

updateLocations();
