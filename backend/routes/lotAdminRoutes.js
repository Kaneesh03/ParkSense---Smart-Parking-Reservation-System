const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const lotAdminController = require("../controllers/lotAdminController");

// Middleware to ensure role is parkingLotAdmin
const isLotAdmin = (req, res, next) => {
    if (req.user.role !== "parkingLotAdmin") {
        return res.status(403).json({ message: "Access Denied: Parking Lot Admins Only" });
    }
    next();
};

router.use(authMiddleware);
router.use(isLotAdmin);

router.get("/stats", lotAdminController.getLotStats);
router.get("/slots", lotAdminController.getLotSlots);
router.get("/bookings", lotAdminController.getLotBookings);
router.put("/bookings/:bookingId/entry", lotAdminController.markEntry);
router.put("/bookings/:bookingId/exit", lotAdminController.markExit);

module.exports = router;
