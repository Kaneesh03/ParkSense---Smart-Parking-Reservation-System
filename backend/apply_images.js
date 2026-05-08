const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
require("dotenv").config();

const updateImages = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/parksense');
        const lots = await ParkingLot.find({});
        let updatedCount = 0;
        for (let lot of lots) {
            let imagePath = "/Logo.png";
            
            // Map exact file names
            if (lot.name === "Airport Parking") imagePath = "/Airport Parking.webp";
            else if (lot.name === "Bishop Heber College Area Parking") imagePath = "/Bishop Heber College Area Parking.jpg";
            else if (lot.name === "Chathiram Bus Stand Parking") imagePath = "/Chathiram Bus Stand Parking.png";
            else if (lot.name === "Chennai Airport Parking") imagePath = "/Chennai Airport Parking.jpg";
            else if (lot.name === "Chennai Central Parking") imagePath = "/Chennai Central Parking.jpg";
            else if (lot.name === "Chepauk Stadium Parking") imagePath = "/Chepauk Stadium Parking.jpg";
            else if (lot.name === "Gandhi Market Parking") imagePath = "/Gandhi Market Parking.png";
            else if (lot.name === "Main Guard Gate Parking") imagePath = "/Main Guard Gate Parking.webp";
            else if (lot.name === "Marina Beach Parking") imagePath = "/Marina Beach Parking.jpg";
            else if (lot.name === "NSB Road Parking") imagePath = "/NSB Road Parking.webp";
            else if (lot.name === "Samayapuram Temple Parking") imagePath = "/Samayapuram Temple Parking.webp";
            else if (lot.name === "Srirangam Temple Parking") imagePath = "/Srirangam Temple Parking.webp";
            else if (lot.name === "Thillai Nagar Parking") imagePath = "/Thillai Nagar Parking.png";
            else if (lot.name === "Trichy Junction Parking") imagePath = "/Trichy Junction Parking.png";
            
            await ParkingLot.updateOne({ _id: lot._id }, { $set: { images: [imagePath] } });
            updatedCount++;
        }
        console.log(`Images successfully updated for ${updatedCount} locations in the database!`);
        process.exit(0);
    } catch (e) {
        console.error("Error updating images:", e);
        process.exit(1);
    }
};

updateImages();
