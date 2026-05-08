const Slot = require("../models/Slot");

exports.addSlot = async (req, res) => {
  const slot = await Slot.create(req.body);
  res.json(slot);
};

exports.getSlots = async (req, res) => {
  const Booking = require("../models/Booking");
  const slots = await Slot.find({ parkingLotId: req.params.id });

  // REAL-TIME CHECK:
  // Instead of relying on static 'isBooked' flag which might be stale,
  // we check if there is an ACTIVE booking taking place RIGHT NOW.
  const now = new Date();

  // Find all bookings that are happening currently
  const activeBookings = await Booking.find({
    slotId: { $in: slots.map(s => s._id) }, // Only for these slots
    status: { $ne: "Cancelled" },
    startTime: { $lte: now },
    endTime: { $gte: now }
  });

  // Create a Set of occupied slot IDs for O(1) lookup
  const occupiedSlotIds = new Set(activeBookings.map(b => b.slotId.toString()));

  // Map slots to set isBooked dynamically
  const dynamicSlots = slots.map(slot => {
    // Convert to plain object to modify
    const s = slot.toObject();

    // If ID is found in active bookings, it IS booked.
    if (occupiedSlotIds.has(s._id.toString())) {
      s.isBooked = true;
    } else {
      // If not in active bookings, it is FREE (even if DB said true previously, we trust the time check)
      s.isBooked = false;
    }
    return s;
  });

  res.json(dynamicSlots);
};
