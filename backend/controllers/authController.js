const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role, businessName, contactDetails } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    res.json(user);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration", details: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({ token, role: user.role });
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  // Basic validation on backend (frontend does strict)
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Password too short" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User with this email not found" });

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  res.json({ message: "Password updated successfully" });
};
