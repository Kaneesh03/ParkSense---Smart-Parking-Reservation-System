const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const email = "admin@parksense.com";
        const password = "admin123";
        const name = "Super Admin";

        // Check if admin exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit();
        }

        const hashed = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password: hashed,
            role: "admin",
        });

        console.log("Admin Created: admin@parksense.com / admin123");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
