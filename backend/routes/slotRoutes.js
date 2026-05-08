const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { addSlot, getSlots } = require("../controllers/slotController");

router.post("/", auth, admin, addSlot);
router.get("/:id", auth, getSlots);

module.exports = router;
