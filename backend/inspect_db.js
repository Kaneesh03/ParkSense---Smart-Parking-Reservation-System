const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const fs = require('fs');

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        let output = "Connected to MongoDB!\n";

        const collections = await mongoose.connection.db.collections();
        output += "\nCollections found:\n";
        for (let collection of collections) {
            output += ` - ${collection.collectionName}\n`;
        }

        // List Users
        const users = await User.find({});
        output += `\nUsers found (${users.length}):\n`;
        users.forEach(u => output += ` - ${u.name} (${u.email}) [Role: ${u.role}]\n`);

        fs.writeFileSync('db_view.txt', output);
        console.log("Written to db_view.txt");
        process.exit();
    } catch (err) {
        fs.writeFileSync('db_view_error.txt', err.toString());
        process.exit(1);
    }
};

inspect();
