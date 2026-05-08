const mongoose = require("mongoose");
const ParkingLot = require("./models/ParkingLot");
require("dotenv").config({ path: "c:/Users/kanee/Desktop/ParkSense/backend/.env" });

async function seedMapData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Tiruchirappalli coordinates reference
        const coordinatesMap = {
            "Thillai Nagar Parking": { lat: 10.8285, lng: 78.6835 },
            "Gandhi Market Parking": { lat: 10.8166, lng: 78.6947 },
            "Chathiram Bus Stand Parking": { lat: 10.8267, lng: 78.6974 },
            "Trichy Junction Parking": { lat: 10.7963, lng: 78.6826 },
            "Airport Parking": { lat: 10.7656, lng: 78.7186 },
            "Srirangam Temple Parking": { lat: 10.8655, lng: 78.6811 },
            "Samayapuram Temple Parking": { lat: 10.9238, lng: 78.7303 },
            "NSB Road Parking": { lat: 10.8242, lng: 78.6943 },
            "Main Guard Gate Parking": { lat: 10.8277, lng: 78.6961 },
            "Bishop Heber College Area Parking": { lat: 10.8175, lng: 78.6820 }
        };

        const lots = await ParkingLot.find();
        for (const lot of lots) {
            if (coordinatesMap[lot.name]) {
                lot.lat = coordinatesMap[lot.name].lat;
                lot.lng = coordinatesMap[lot.name].lng;
                await lot.save();
                console.log(`Updated coordinates for ${lot.name}`);
            } else {
                // Fallback roughly near Trichy center
                lot.lat = 10.8050 + (Math.random() * 0.05);
                lot.lng = 78.6856 + (Math.random() * 0.05);
                await lot.save();
                console.log(`Generated fallback coordinates for ${lot.name}`);
            }
        }

        console.log("Coordinate seeding complete.");
        process.exit(0);

    } catch (e) {
        console.error("Error seeding map data:", e);
        process.exit(1);
    }
}

seedMapData();
