const Booking = require("../models/Booking");
const Slot = require("../models/Slot");

exports.bookSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.body.slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // Check user booking limit in this lot
    const userBookingsInLot = await Booking.find({ 
      userId: req.user.id,
      status: "Active"
    }).populate("slotId");
    const count = userBookingsInLot.filter(b =>
      b.slotId && b.slotId.parkingLotId.toString() === slot.parkingLotId.toString()
    ).length;

    if (count >= 2) {
      return res.status(400).json({ message: "A user can book only 2 slots in a lot" });
    }

    // Validate Inputs
    const { vehicleNumber, vehicleType, startTime, endTime } = req.body;
    if (!vehicleNumber || !vehicleType || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    // Conflict Detection
    const conflict = await Booking.findOne({
      slotId: slot._id,
      status: { $ne: "Cancelled" },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: "Slot is already booked for this time range." });
    }

    // Calculate Amount ($10/hr)
    const durationHours = (end - start) / (1000 * 60 * 60);
    const amount = Math.ceil(durationHours * 10);

    // Create Pending Booking
    const booking = await Booking.create({
      userId: req.user.id,
      slotId: slot._id,
      vehicleNumber,
      vehicleType,
      startTime: start,
      endTime: end,
      status: "Active",
      paymentStatus: "Pending",
      amount
    });

    res.json({
      message: "Booking initialized",
      bookingId: booking._id,
      amount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId, paymentDetails, qrCode } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "Paid";
    booking.transactionId = paymentDetails.transactionId;
    booking.qrCode = qrCode;

    await booking.save();

    res.json({ message: "Payment successful", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment confirmation failed" });
  }
};

exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id }).populate("slotId");

  // Auto-expire past bookings
  const now = new Date();
  const updatedBookings = [];

  for (let booking of bookings) {
    if (booking.status === "Active" && new Date(booking.endTime) < now) {
      booking.status = "Completed";
      await booking.save();
    }
    updatedBookings.push(booking);
  }

  res.json(updatedBookings);
};

exports.allBookings = async (req, res) => {
  const bookings = await Booking.find().populate("slotId userId");
  res.json(bookings);
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "name email")
      .populate({
        path: "slotId",
        populate: { path: "parkingLotId" }
      });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Access Control: Admin OR Owner
    if (req.user.role !== "admin" && booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access Denied" });
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  await Slot.findByIdAndUpdate(booking.slotId, { isBooked: false });
  await booking.deleteOne();
  res.json({ message: "Cancelled" });
};
