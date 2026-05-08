const ParkingLot = require("../models/ParkingLot");

exports.addParking = async (req, res) => {
  const lot = await ParkingLot.create(req.body);
  res.json(lot);
};

exports.getParking = async (req, res) => {
  try {
    let { district } = req.query;
    
    // Normalize District Names (canonicalize Trichy/Tiruchy to Tiruchirappalli)
    const aliases = {
        "trichy": "Tiruchirappalli",
        "tiruchy": "Tiruchirappalli"
    };
    
    if (district && aliases[district.toLowerCase()]) {
        district = aliases[district.toLowerCase()];
    }

    const matchStage = district 
        ? { $match: { district: { $regex: new RegExp(`^${district}$`, 'i') } } } 
        : { $match: {} };

    const lots = await ParkingLot.aggregate([
      matchStage,
      {
        $lookup: {
          from: "slots",
          localField: "_id",
          foreignField: "parkingLotId",
          as: "slotsData"
        }
      },
      {
        $addFields: {
          totalSlots: { $size: "$slotsData" },
          bookedSlots: {
            $size: {
              $filter: {
                input: "$slotsData",
                as: "slot",
                cond: { $eq: ["$$slot.isBooked", true] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          availableSlots: { $subtract: ["$totalSlots", "$bookedSlots"] }
        }
      },
      {
        $project: {
          slotsData: 0
        }
      }
    ]);
    res.json(lots);
  } catch (error) {
    console.error("Error in getParking aggregation:", error);
    res.status(500).json({ error: "Failed to fetch parking lots" });
  }
};
