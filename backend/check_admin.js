const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ email: "admin@parksense.com" });
        if (admin) {
            console.log("ADMIN FOUND:");
            console.log("Email:", admin.email);
            console.log("Role:", admin.role);
        } else {
            console.log("ADMIN NOT FOUND!");
        }
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        mongoose.disconnect();
    }
}

checkAdmin();
