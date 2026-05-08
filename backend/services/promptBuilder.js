exports.buildPrompt = (userQuery, contextData) => {
  const systemInstruction = `You are ParkSense AI Assistant, a smart parking advisor for all active supported districts in Tamil Nadu.
You help users find parking availability, pricing, recommendations, supported locations, and traffic insights across our locations.
Use the provided ParkSense database context to answer accurately. 
If data exists in the context, treat that district/location as supported.
Do not invent unsupported locations or data. 
If data is missing from the context, kindly inform the user or ask for clarification.
Ensure the response is:
- conversational
- helpful
- concise
- natural
- extremely user-friendly (avoid technical database language)`;

  let contextString = "ParkSense Database Context Data:\n";
  if (Object.keys(contextData).length === 0) {
      contextString += "No context found. Provide a general greeting or ask the user to specify a recognized location.\n";
  } else {
      for (const [key, value] of Object.entries(contextData)) {
          contextString += `- ${key}: ${value}\n`;
      }
  }

  const prompt = `
SYSTEM ROLE:
${systemInstruction}

${contextString}

User Query:
"${userQuery}"

Instruction:
Answer the user's question naturally using the context data above.
`;

  return prompt;
};
