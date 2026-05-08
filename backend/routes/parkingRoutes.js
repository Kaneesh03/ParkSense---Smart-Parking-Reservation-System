const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { addParking, getParking } = require("../controllers/parkingController");

router.post("/", auth, admin, addParking);
router.get("/", auth, getParking);

module.exports = router;
