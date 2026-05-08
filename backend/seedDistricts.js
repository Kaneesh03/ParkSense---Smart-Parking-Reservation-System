const mongoose = require("mongoose");
const dotenv = require("dotenv");
const District = require("./models/District");

dotenv.config();

const tamilNaduDistricts = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivagangai", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

async function seedDistricts() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to DB...");

    const existingCount = await District.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} districts already in DB. Clearing existing...`);
      await District.deleteMany({});
    }

    const districtsToInsert = tamilNaduDistricts.map(name => ({
      name,
      isActive: name === "Tiruchirappalli" // Only Trichy is active initially
    }));

    await District.insertMany(districtsToInsert);
    console.log(`Successfully seeded ${districtsToInsert.length} districts.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding districts:", error);
    process.exit(1);
  }
}

seedDistricts();
