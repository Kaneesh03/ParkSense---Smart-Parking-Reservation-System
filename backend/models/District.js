const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: false } // Only Tiruchirappalli will be true initially
});

module.exports = mongoose.model("District", districtSchema);
