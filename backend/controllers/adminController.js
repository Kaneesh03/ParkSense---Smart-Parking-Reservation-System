const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const User = require("../models/User");
const ParkingLot = require("../models/ParkingLot");
const bcrypt = require("bcryptjs");

exports.getStats = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const activeBookings = await Booking.countDocuments({ status: "Active" });
        const totalSlots = await Slot.countDocuments();
        const totalUsers = await User.countDocuments({ role: "user" });

        // Calculate Revenue (assuming a fixed rate or summing up if cost exists)
        // For now, just count.

        res.json({
            totalBookings,
            activeBookings,
            totalSlots,
            totalUsers,
            revenue: totalBookings * 10 // Mock revenue: $10 per booking
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("userId", "name email")
            .populate({
                path: "slotId",
                populate: { path: "parkingLotId", select: "name" }
            })
            .sort({ startTime: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- LOT ADMIN MANAGEMENT ---

// Create a new Parking Lot Admin
exports.createLotAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed, role: "parkingLotAdmin" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error creating Lot Admin", details: err.message });
    }
};

// Get all Lot Admins
exports.getAllLotAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: "parkingLotAdmin" }).select("-password");
        res.json(admins);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Assign a Lot Admin to a Parking Lot
exports.assignLotToAdmin = async (req, res) => {
    const { lotId, adminId } = req.body;
    try {
        const lot = await ParkingLot.findByIdAndUpdate(lotId, { parkingLotAdminId: adminId }, { new: true });
        res.json(lot);
    } catch (err) {
        res.status(500).json({ message: "Error assigning admin", details: err.message });
    }
};

// Get all Parking Lots (for assignment)
exports.getAllLots = async (req, res) => {
    try {
        const lots = await ParkingLot.find().populate("parkingLotAdminId", "name email");
        res.json(lots);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};
