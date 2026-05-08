const chatbotService = require("../services/chatbotService");

exports.handleQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: "Query string is required" });
    }

    const responseText = await chatbotService.processQuery(query);
    
    res.json({ answer: responseText });
  } catch (err) {
    console.error("Chatbot Controller Error:", err);
    res.status(500).json({ answer: "Sorry, I am facing a technical issue right now. Please try again later." });
  }
};
