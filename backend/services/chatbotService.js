const ParkingLot = require("../models/ParkingLot");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const promptBuilder = require("./promptBuilder");
const geminiService = require("./geminiService");

const HOURLY_RATE = 10;

// Dynamic Helper: Calculate Surge Pricing
const calculateDynamicPrice = (freeSlots, totalSlots) => {
  if (totalSlots === 0) return HOURLY_RATE;
  const bookedPercentage = ((totalSlots - freeSlots) / totalSlots) * 100;
  
  if (bookedPercentage > 90) return 25; // Critical surge
  if (bookedPercentage > 75) return 20; // High surge
  if (bookedPercentage > 50) return 15; // Moderate surge
  return HOURLY_RATE; // Low demand
};

// Dynamic Helper: Entity Extractor directly against real DB payloads
const extractEntitiesFromDB = (queryStr, lots, districts) => {
  const norm = queryStr.toLowerCase();
  
  // Try precise Lot Match
  for (const lot of lots) {
      let nameNorm = lot.name.toLowerCase();
      let coreName = nameNorm.replace(/parking/g, "").trim();
      
      if (norm.includes(coreName)) return { lot, district: lot.district };
      
      // Known Location Variants mapping directly to DB lots
      if (nameNorm.includes("chepauk") && norm.includes("chepauk")) return { lot, district: lot.district };
      if (nameNorm.includes("tnagar") && (norm.includes("t nagar") || norm.includes("tnagar"))) return { lot, district: lot.district };
      if (nameNorm.includes("kilambakkam") && norm.includes("kilambakkam")) return { lot, district: lot.district };
      if (nameNorm.includes("phoenix") && norm.includes("phoenix")) return { lot, district: lot.district };
      if (nameNorm.includes("express avenue") && norm.includes("express avenue")) return { lot, district: lot.district };
      if (nameNorm.includes("kapaleeshwarar") && norm.includes("kapaleeshwarar")) return { lot, district: lot.district };
      if (nameNorm.includes("anjaneyar") && norm.includes("anjaneyar")) return { lot, district: lot.district };
      if (nameNorm.includes("agaya gangai") && norm.includes("agaya gangai")) return { lot, district: lot.district };
      
      // Original variations
      if (nameNorm.includes("thillai") && norm.includes("thillai")) return { lot, district: lot.district };
      if (nameNorm.includes("gandhi") && norm.includes("gandhi")) return { lot, district: lot.district };
      if (nameNorm.includes("chathiram") && norm.includes("chathiram")) return { lot, district: lot.district };
      if (nameNorm.includes("junction") && norm.includes("junction")) return { lot, district: lot.district };
      if (nameNorm.includes("srirangam") && norm.includes("srirangam")) return { lot, district: lot.district };
      if (nameNorm.includes("samayapuram") && norm.includes("samayapuram")) return { lot, district: lot.district };
      if (nameNorm.includes("marina") && norm.includes("marina")) return { lot, district: lot.district };
      if (nameNorm.includes("bus stand") && norm.includes("bus stand") && norm.includes("namakkal") && lot.district === "Namakkal") return { lot, district: lot.district };
  }
  
  // Specific fallbacks to prevent collisions
  if (norm.includes("airport")) {
      if (norm.includes("chennai")) return { lot: lots.find(l => l.name.toLowerCase().includes("chennai airport")), district: "Chennai" };
      return { lot: lots.find(l => l.name.toLowerCase().includes("airport") && l.district === "Tiruchirappalli"), district: "Tiruchirappalli" }; 
  }

  // Detect District Level (If no specific lot match)
  for (const dist of districts) {
    if (norm.includes(dist.toLowerCase()) || (dist === "Namakkal" && norm.includes("nammakal"))) {
        return { lot: null, district: dist };
    }
  }

  return { lot: null, district: null };
};

// Core Flow Calculation
const computeData = async (query) => {
  const q = query.toLowerCase().trim();
  
  // Dynamically load active states
  const dbLots = await ParkingLot.find({});
  const dbDistricts = [...new Set(dbLots.map(l => l.district))];
  
  const { lot: targetLot, district: targetDistrict } = extractEntitiesFromDB(q, dbLots, dbDistricts);

  let fallbackResponse = "";
  let contextData = { "Active Supported Districts": dbDistricts.join(", ") };
  
  // Dynamic Pricing Data Appender
  const getTrafficAndPrice = async (lotToCheck) => {
      const [totalSlots, freeSlots] = await Promise.all([
          Slot.countDocuments({ parkingLotId: lotToCheck._id }),
          Slot.countDocuments({ parkingLotId: lotToCheck._id, isBooked: false })
      ]);
      const currentPrice = calculateDynamicPrice(freeSlots, totalSlots);
      return { totalSlots, freeSlots, currentPrice };
  };

  // 0. General Support/Coverage Queries
  if (q.includes("support") || q.includes("available districts") || q.match(/which (districts|cities)/)) {
     if (targetDistrict) {
         fallbackResponse = `Yes, ${targetDistrict} is fully supported in ParkSense! We have active parking locations there.`;
         contextData["Queried District Support"] = targetDistrict + " IS Supported";
         return { fallbackResponse, contextData };
     } else if (q.match(/in ([\w\s]+)/) && !q.includes("tamil nadu")) { 
         fallbackResponse = `I currently only support ${dbDistricts.join(", ")}. We are expanding to other districts soon!`;
         contextData["Support Status"] = "Unsupported District Detected";
         return { fallbackResponse, contextData };
     }
     
     fallbackResponse = `We proudly support the following districts: ${dbDistricts.join(", ")}.`;
     return { fallbackResponse, contextData };
  }

  // 1. Slot Suggestion
  if (q.includes("suggest") && (q.includes("slot") || q.includes("wheeler") || q.includes("vehicle"))) {
    fallbackResponse = "Our system assigns precise slot dimensions upon booking based on your vehicle profile.";
    contextData["Slot Logic"] = fallbackResponse;
    return { fallbackResponse, contextData };
  }

  // 2. Recommendation
  if ((q.includes("suggest") || q.includes("recommend") || q.includes("best")) && !q.includes("slot")) {
    let lot = targetLot;
    if (!lot) {
      const matchQuery = { isBooked: false };
      const leastTraffic = await Slot.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$parkingLotId", freeCount: { $sum: 1 } } },
        { $sort: { freeCount: -1 } }
      ]);
      
      let candidateLotId = leastTraffic.length > 0 ? leastTraffic[0]._id : null;
      if (targetDistrict) {
         const districtLots = dbLots.filter(l => l.district === targetDistrict).map(l => l._id.toString());
         const bestInDistrict = leastTraffic.find(agg => districtLots.includes(agg._id.toString()));
         if (bestInDistrict) candidateLotId = bestInDistrict._id;
         else candidateLotId = null;
      }
      
      if (candidateLotId) lot = dbLots.find(l => l._id.toString() === candidateLotId.toString());
      else lot = targetDistrict ? dbLots.find(l => l.district === targetDistrict) : dbLots[0];
    }
    
    if (!lot) {
      fallbackResponse = "I cannot find any operational parking lots at the moment.";
      return { fallbackResponse, contextData };
    }

    const freeCount = await Slot.countDocuments({ parkingLotId: lot._id, isBooked: false });
    fallbackResponse = `I highly recommend ${lot.name}. It currently has excellent availability with ${freeCount} free slots.`;
    contextData["Recommended Location"] = lot.name;
    contextData["Free Slots"] = freeCount;
    if (targetDistrict && !targetLot) {
         const allNames = dbLots.filter(l => l.district === targetDistrict).map(l => l.name);
         contextData[`Other Locations in ${targetDistrict}`] = allNames.join(", ");
    }
    return { fallbackResponse, contextData };
  }

  // 3. Price Query & Cheapest Query
  if (q.match(/price|cost|fee|cheapest|affordable/)) {
    if (q.includes("cheapest") || q.includes("affordable")) {
      fallbackResponse = `Our base rate is ₹10/hour, but prices scale dynamically up to ₹25/hour based on surge demand. Choose locations with high availability for the best price!`;
      contextData["Dynamic Pricing Info"] = `Base Rate: ₹10/hr. Surge up to ₹25/hr depending on availability.`;
      
      if (targetLot) {
          const stats = await getTrafficAndPrice(targetLot);
          fallbackResponse = `The current live dynamic price at ${targetLot.name} is ₹${stats.currentPrice}/hour based on ${stats.freeSlots} available slots.`;
          contextData["Target Location"] = targetLot.name;
          contextData["Live Rate"] = `₹${stats.currentPrice}/hr`;
      } else if (targetDistrict) {
          const dLots = dbLots.filter(l => l.district === targetDistrict);
          let cheapestOpts = [];
          for (let l of dLots) {
               const stats = await getTrafficAndPrice(l);
               cheapestOpts.push({ name: l.name, price: stats.currentPrice, free: stats.freeSlots });
          }
          cheapestOpts.sort((a,b) => a.price - b.price || b.free - a.free);
          const best = cheapestOpts[0];
          
          if (best) {
              contextData["Cheapest Location Recommended"] = `${best.name} (₹${best.price}/hr, ${best.free} free slots out of total)`;
          }
          contextData["Available Lots in " + targetDistrict] = dLots.map(l => l.name).join(", ");
          contextData["District Insight"] = `Provide user with cheap locations in ${targetDistrict}. If the user asked about ${targetDistrict}, ensure you state clearly that it IS supported.`;
      }
      return { fallbackResponse, contextData };
    }
    
    const hoursMatch = q.match(/(\d+)\s*hours?/);
    let calculatedHours = hoursMatch ? parseInt(hoursMatch[1], 10) : 1;
    
    if (!targetLot) {
      fallbackResponse = "Please mention a recognizable parking location to estimate the live surge price properly.";
      return { fallbackResponse, contextData: { "System Requirement": fallbackResponse } };
    }
    
    const stats = await getTrafficAndPrice(targetLot);
    let totalCost = calculatedHours * stats.currentPrice;
    
    fallbackResponse = `The current estimated dynamic cost for ${calculatedHours} hour(s) is ₹${totalCost} at ${targetLot.name} (live rate: ₹${stats.currentPrice}/hr).`;
    contextData["Estimated Duration"] = `${calculatedHours} hour(s)`;
    contextData["Total Cost Calculation"] = `₹${totalCost}`;
    contextData["Location"] = targetLot.name;
    contextData["Live Dynamic Rate"] = `₹${stats.currentPrice}/hr`;
    return { fallbackResponse, contextData };
  }

  // 4. Peak Hour Query
  if (q.match(/peak|rush/)) {
    let lot = targetLot;
    if (!lot && targetDistrict) lot = dbLots.find(l => l.district === targetDistrict);
    
    if (!lot) {
      fallbackResponse = "Please mention a specific location or district to check peak hour activity.";
      return { fallbackResponse, contextData: { "Requirement": fallbackResponse } };
    }
    
    const slots = await Slot.find({ parkingLotId: lot._id });
    const peakStats = await Booking.aggregate([
      { $match: { slotId: { $in: slots.map(s => s._id) } } },
      { $group: { _id: { $hour: "$bookingDate" }, traffic: { $sum: 1 } } },
      { $sort: { traffic: -1 } },
      { $limit: 1 }
    ]);
    
    if (peakStats.length > 0 && peakStats[0]._id !== null) {
      let hourFormat = peakStats[0]._id;
      let suffix = hourFormat >= 12 ? "PM" : "AM";
      let displayHour = hourFormat % 12 === 0 ? 12 : hourFormat % 12;
      fallbackResponse = `${lot.name} is most crowded around ${displayHour} ${suffix} based on historical records.`;
      contextData["Location"] = lot.name;
      contextData["Peak Traffic Hour"] = `${displayHour} ${suffix}`;
    } else {
      fallbackResponse = `${lot.name} typically experiences highest demand between 9 AM - 11 AM, and 5 PM - 8 PM.`;
      contextData["Location"] = lot.name;
      contextData["General High Demand Hours"] = "9 AM - 11 AM, 5 PM - 8 PM";
    }
    return { fallbackResponse, contextData };
  }

  // 5. Traffic / Demand Query
  if (q.match(/traffic|busy|demand|crowded/)) {
    if (q.includes("low traffic")) {
       fallbackResponse = "You can find low traffic spots by focusing on locations outside major commercial zones.";
       contextData["System Prompt"] = "Provide general low traffic advice.";
       return { fallbackResponse, contextData };
    }

    if (!targetLot && targetDistrict) {
        fallbackResponse = `Traffic fluctuates heavily in ${targetDistrict}. Let me know a specific location for live tracking!`;
        contextData["Target District Response"] = fallbackResponse;
        return { fallbackResponse, contextData };
    } else if (!targetLot) {
        fallbackResponse = "Please mention a specific location to evaluate live demand.";
        return { fallbackResponse, contextData };
    }
    
    const stats = await getTrafficAndPrice(targetLot);
    const bookedPercentage = stats.totalSlots === 0 ? 0 : ((stats.totalSlots - stats.freeSlots) / stats.totalSlots) * 100;
    
    if (bookedPercentage > 85) {
      fallbackResponse = `${targetLot.name} is highly crowded! Only ${stats.freeSlots} slots left. Live price is ₹${stats.currentPrice}/hr due to surge.`;
      contextData["Traffic Status"] = "Extremely Heavy";
    } else if (bookedPercentage > 50) {
      fallbackResponse = `${targetLot.name} is experiencing moderate traffic. ${stats.freeSlots} spots available at ₹${stats.currentPrice}/hr.`;
      contextData["Traffic Status"] = "Moderate";
    } else {
      fallbackResponse = `${targetLot.name} has low traffic right now with ${stats.freeSlots} available slots. Standard rate of ₹10/hr applies.`;
      contextData["Traffic Status"] = "Low Traffic";
    }
    contextData["Location"] = targetLot.name;
    contextData["Remaining Slots"] = stats.freeSlots;
    return { fallbackResponse, contextData };
  }

  // 6. Availability Query
  if (q.match(/available|free slots|space|parking in/)) {
    if (targetLot) {
      const freeSlots = await Slot.countDocuments({ parkingLotId: targetLot._id, isBooked: false });
      fallbackResponse = freeSlots === 0 ? `No available slots at the moment for ${targetLot.name}.` : `${freeSlots} slots are currently available at ${targetLot.name}.`;
      contextData["Location"] = targetLot.name;
      contextData["Available Free Slots"] = freeSlots;
      return { fallbackResponse, contextData };
    }
    
    if (targetDistrict) {
      const districtLots = dbLots.filter(l => l.district === targetDistrict);
      const districtLotIds = districtLots.map(l => l._id);
      const freeSlots = await Slot.countDocuments({ parkingLotId: { $in: districtLotIds }, isBooked: false });
      
      fallbackResponse = `We currently have ${freeSlots} free parking slots across ${targetDistrict}! Mention a specific location if you'd like targeted availability.`;
      contextData["Queried District"] = targetDistrict;
      contextData[`Total Free Slots in ${targetDistrict}`] = freeSlots;
      contextData[`Supported Parking Lots in ${targetDistrict}`] = districtLots.map(l => l.name).join(", ");
      return { fallbackResponse, contextData };
    }
    
    const totalAvailable = await Slot.countDocuments({ isBooked: false });
    fallbackResponse = `We currently have ${totalAvailable} free parking slots globally across our platform!`;
    contextData["Total Global Free Slots"] = totalAvailable;
    return { fallbackResponse, contextData };
  }

  // Fallback
  fallbackResponse = `I can help you find parking availability, check dynamic surge prices, recommend locations, or evaluate live traffic demand in ${dbDistricts.join(", ")}. How can I assist you today?`;
  contextData["Insight"] = "Greeting or unrecognized intent. Offer help.";
  return { fallbackResponse, contextData };
};

exports.processQuery = async (query) => {
  try {
    const { fallbackResponse, contextData } = await computeData(query);

    try {
      const prompt = promptBuilder.buildPrompt(query, contextData);
      const aiResponseText = await geminiService.generateResponse(prompt);
      return aiResponseText;
    } catch (aiError) {
      console.warn("Gemini AI API failure, gracefully rebounding to mathematically exact rule fallback:", aiError.message);
      return fallbackResponse;
    }
  } catch (error) {
    console.error("Chatbot Core Logic Processing Error Details:", error);
    return "I hit a technical snag while calculating the data. Please try again later.";
  }
};
