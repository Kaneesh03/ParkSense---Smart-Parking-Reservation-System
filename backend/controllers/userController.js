const User = require("../models/User");

// Get logged in user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error retrieving profile" });
  }
};

// Update logged in user profile details
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, vehicleNumber, preferredVehicleType } = req.body;
    
    // We explicitly DO NOT allow email updates without a verify workflow, keeping it read-only
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, phone, vehicleNumber, preferredVehicleType } },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// Get user preferences
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Fallback initializing preferences if missing in legacy users
    const preferences = user.preferences || {
      bookingNotifications: true,
      reminders: true,
      cancellations: true,
      preferredDistrict: "Tiruchirappalli",
      defaultReservationDuration: 1
    };
    
    res.json(preferences);
  } catch (error) {
    console.error("Get Preferences Error:", error);
    res.status(500).json({ message: "Server error retrieving preferences" });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.preferences = { ...user.preferences, ...req.body };
    await user.save();
    
    res.json(user.preferences);
  } catch (error) {
    console.error("Update Preferences Error:", error);
    res.status(500).json({ message: "Server error updating preferences" });
  }
};
