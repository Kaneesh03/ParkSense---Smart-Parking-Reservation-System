const District = require("../models/District");

exports.getDistricts = async (req, res) => {
  try {
    const districts = await District.find({ isActive: true });
    res.json(districts);
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
};
