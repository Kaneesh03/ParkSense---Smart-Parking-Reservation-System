const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
  bookSlot,
  confirmPayment,
  myBookings,
  getBookingById,
  allBookings,
  cancelBooking
} = require("../controllers/bookingController");

router.post("/", auth, bookSlot);
router.post("/confirm-payment", auth, confirmPayment);
router.get("/my", auth, myBookings);
router.get("/:id", auth, getBookingById);
router.get("/", auth, admin, allBookings);
router.delete("/:id", auth, cancelBooking);

module.exports = router;
