const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

router.get("/stats", adminAuth, adminController.getStats);
router.get("/bookings", adminAuth, adminController.getAllBookings);

// Lot Admin Management
router.post("/lot-admins", adminAuth, adminController.createLotAdmin);
router.get("/lot-admins", adminAuth, adminController.getAllLotAdmins);
router.get("/lots", adminAuth, adminController.getAllLots);
router.post("/assign-admin", adminAuth, adminController.assignLotToAdmin);

module.exports = router;
