const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) return res.status(401).json({ message: "Access Denied" });

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;

        const user = await User.findById(req.user.id);
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access Denied: Admins Only" });
        }

        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};
