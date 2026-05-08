const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const User = require("../models/User");
const { bookSlot, confirmPayment } = require("../controllers/bookingController");

// Mocking Express Request/Response
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

async function testPaymentPersistence() {
    console.log("🚀 Starting Persistence Check...");

    // 1. Connect to DB
    await mongoose.connect("mongodb://127.0.0.1:27017/parksense");
    console.log("✅ Database Connected");

    try {
        // 2. Setup Data (User & Slot)
        const user = await User.create({
            name: "Test User",
            email: `test${Date.now()}@test.com`,
            password: "password123",
            role: "user"
        });

        // Find or Create a Slot
        let slot = await Slot.findOne();
        if (!slot) {
            const ParkingLot = require("../models/ParkingLot");
            const lot = await ParkingLot.create({ name: "Test Lot", capacity: 10, location: { lat: 0, lng: 0 } });
            slot = await Slot.create({ parkingLotId: lot._id, slotNumber: "A-1", isBooked: false });
        }

        console.log(`ℹ️ User ID: ${user._id}`);
        console.log(`ℹ️ Slot ID: ${slot._id}`);

        // 3. Simulate "Book Slot"
        const bookReq = {
            body: {
                slotId: slot._id,
                vehicleNumber: "TEST-01",
                vehicleType: "Four-wheeler",
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000) // 1 hour later
            },
            user: { id: user._id }
        };
        const bookRes = mockRes();

        console.log("⏳ Executing bookSlot...");
        await bookSlot(bookReq, bookRes);

        if (bookRes.statusCode === 400 || bookRes.statusCode === 404) {
            console.error("❌ Booking Failed:", bookRes.body);
            return;
        }

        const bookingId = bookRes.body.bookingId;
        console.log(`✅ Booking Created! ID: ${bookingId}`);
        console.log(`   Initial Amount: ${bookRes.body.amount}`);

        // 4. Simulate "Confirm Payment"
        const txnId = "TXN_TEST_" + Date.now();
        const qrData = "VERIFY_URL_TEST";

        const payReq = {
            body: {
                bookingId: bookingId,
                paymentDetails: { transactionId: txnId },
                qrCode: qrData
            }
        };
        const payRes = mockRes();

        console.log("⏳ Executing confirmPayment...");
        await confirmPayment(payReq, payRes);

        if (payRes.statusCode === 500 || payRes.statusCode === 404) {
            console.error("❌ Payment Failed:", payRes.body);
            return;
        }

        console.log("✅ Payment Controller Success.");

        // 5. DIRECT DB VERIFICATION
        console.log("🔍 Querying Database for verification...");
        const finalBooking = await Booking.findById(bookingId);

        console.log("-------------------------------------------------");
        console.log("📝 DB RECORD DUMP:");
        console.log(`   - ID: ${finalBooking._id}`);
        console.log(`   - Status: ${finalBooking.status}`);
        console.log(`   - PaymentStatus: ${finalBooking.paymentStatus}`);
        console.log(`   - TransactionId: ${finalBooking.transactionId}`);
        console.log(`   - QRCode: ${finalBooking.qrCode}`);
        console.log("-------------------------------------------------");

        // Assertions
        if (finalBooking.paymentStatus === "Paid" &&
            finalBooking.transactionId === txnId &&
            finalBooking.qrCode === qrData) {
            console.log("🎉 SUCCESS: All payment details are correctly stored in the DB!");
        } else {
            console.error("❌ FAILURE: DB Record does not match expected data.");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("👋 Connection Closed");
    }
}

testPaymentPersistence();
