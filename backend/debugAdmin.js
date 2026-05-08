const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const debugAdmin = async () => {
    console.log("1. Starting Debug Script");
    try {
        console.log("2. Connecting to MongoDB...", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("3. MongoDB Connected");

        const email = "admin@parksense.com";

        console.log("4. Finding user...");
        const user = await User.findOne({ email });
        console.log("5. User found?", user ? "YES" : "NO");

        if (user) {
            console.log("6. Deleting existing user...");
            await User.deleteOne({ email });
            console.log("7. User Deleted");
        }

        console.log("8. Hashing password...");
        const hashed = await bcrypt.hash("admin123", 10);

        console.log("9. Creating Admin...");
        await User.create({
            name: "Super Admin",
            email: email,
            password: hashed,
            role: "admin",
        });

        console.log("10. Admin Created Successfully");
        process.exit(0);
    } catch (error) {
        console.error("ERROR:", error);
        process.exit(1);
    }
};

debugAdmin();
