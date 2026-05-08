console.log("Starting Server...");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const seed = require("./seed");

const start = async () => {
  await connectDB();
  await seed();
};

start();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/parking", require("./routes/parkingRoutes"));
app.use("/api/slots", require("./routes/slotRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/lot-admin", require("./routes/lotAdminRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/districts", require("./routes/districtRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
