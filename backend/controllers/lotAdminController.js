const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const ParkingLot = require("../models/ParkingLot");

// Get stats for the assigned lot
exports.getLotStats = async (req, res) => {
    try {
        const lot = await ParkingLot.findOne({ parkingLotAdminId: req.user.id });
        if (!lot) return res.status(404).json({ message: "No lot assigned to this admin" });

        const totalSlots = await Slot.countDocuments({ parkingLotId: lot._id });
        const occupiedSlots = await Slot.countDocuments({ parkingLotId: lot._id, isBooked: true });
        
        // Active bookings for this lot
        const activeBookings = await Booking.countDocuments({ 
            "slotId": { $in: await Slot.find({ parkingLotId: lot._id }).select("_id") },
            status: "Active"
        });

        res.json({
            lotName: lot.name,
            totalSlots,
            occupiedSlots,
            availableSlots: totalSlots - occupiedSlots,
            activeBookings
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error", details: err.message });
    }
};

// Get slots for the assigned lot
exports.getLotSlots = async (req, res) => {
    try {
        const lot = await ParkingLot.findOne({ parkingLotAdminId: req.user.id });
        if (!lot) return res.status(404).json({ message: "No lot assigned" });

        const slots = await Slot.find({ parkingLotId: lot._id });
        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get active bookings for the assigned lot
exports.getLotBookings = async (req, res) => {
    try {
        const lot = await ParkingLot.findOne({ parkingLotAdminId: req.user.id });
        if (!lot) return res.status(404).json({ message: "No lot assigned" });

        const slotIds = await Slot.find({ parkingLotId: lot._id }).select("_id");
        const bookings = await Booking.find({ slotId: { $in: slotIds } })
            .populate("userId", "name email")
            .populate("slotId", "slotNumber")
            .sort({ startTime: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Mark vehicle entry
exports.markEntry = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findByIdAndUpdate(bookingId, { status: "Active" }, { new: true });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Mark vehicle exit
exports.markExit = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.status = "Completed";
        await booking.save();

        // Release the slot
        await Slot.findByIdAndUpdate(booking.slotId, { isBooked: false });

        res.json({ message: "Exit marked and slot released", booking });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};
