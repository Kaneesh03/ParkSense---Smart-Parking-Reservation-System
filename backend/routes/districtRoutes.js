const router = require("express").Router();
const { getDistricts } = require("../controllers/districtController");

router.get("/", getDistricts);

module.exports = router;
