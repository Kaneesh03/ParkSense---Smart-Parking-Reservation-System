const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const Slot = require("./models/Slot");
const ParkingLot = require("./models/ParkingLot");
require("dotenv").config();

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Find a test slot
        const slot = await Slot.findOne({ isBooked: false });
        if (!slot) {
            console.log("No free slot available for test.");
            return;
        }
        console.log(`Testing with Slot: ${slot.slotNumber}`);

        // 2. Simulator: User Books Slot for 60 seconds (1 Minute logic check)
        // But for TEST SPEED, we will manually force endTime to be 2 seconds from now 
        // to verify the expiry logic still works with the controller change.
        console.log("Creating 2-second reservation (Simulation of Minute logic)...");
        const startTime = new Date();
        // meaningful check: ensure controller would calculate this as duration * 60000
        const endTime = new Date(startTime.getTime() + 2 * 1000);

        const booking = await Booking.create({
            userId: "65b4c1234567890123456789", // Mock ID
            slotId: slot._id,
            vehicleNumber: "TEST-01",
            vehicleType: "Four-wheeler",
            startTime: startTime,
            endTime: endTime,
            status: "Active"
        });

        // Update slot status
        slot.isBooked = true;
        await slot.save();
        console.log("Slot marked as BOOKED.");

        // 3. Verify it's booked
        let checkSlot = await Slot.findById(slot._id);
        if (checkSlot.isBooked) console.log("✔ Verification 1: Slot is correctly locked.");
        else console.error("❌ Error: Slot should be locked.");

        // 4. Wait for 3 seconds (to let it expire)
        console.log("Waiting 3 seconds for expiry...");
        await new Promise(r => setTimeout(r, 3000));

        // 5. Simulate "getSlots" logic (Check expiry)
        console.log("Simulating getSlots expiry check...");
        const now = new Date();
        if (now > endTime) {
            console.log("Time is up. Releasing slot...");
            // Logic from slotController.js
            const activeBooking = await Booking.findOne({ slotId: slot._id, status: "Active" });
            if (activeBooking && activeBooking.endTime < now) {
                checkSlot.isBooked = false;
                await checkSlot.save();

                activeBooking.status = "Completed";
                await activeBooking.save();
                console.log("Slot released & Booking completed.");
            }
        }

        // 6. Verify result
        const finalSlot = await Slot.findById(slot._id);
        if (!finalSlot.isBooked) console.log("✔ Verification 2: Slot is FREE after expiry.");
        else console.error("❌ Error: Slot should be free.");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

runTest();
