import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';

const ChatbotWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Quick suggestions based on user request
  const quickSuggestions = [
    "Find parking near me",
    "Cheapest parking",
    "Low traffic parking",
    "Peak hours info"
  ];

  useEffect(() => {
    // Show welcoming message on first load
    setMessages([
      { 
        id: 1, 
        text: "Hi 👋 I’m ParkSense AI Assistant. I can help you find parking, check availability, and suggest the best options.", 
        sender: "bot" 
      }
    ]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of messages when new messages appear or loading starts
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage = { id: Date.now(), text: textToSend, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await axios.post('/chatbot/query', { query: textToSend });
      const botMessage = { id: Date.now() + 1, text: res.data.answer, sender: "bot" };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { id: Date.now() + 1, text: "Sorry, I am having trouble connecting right now.", sender: "bot" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="ps-chatbot-window">
      <div className="ps-chatbot-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-sparkles" style={{ color: '#fbbf24' }}></i> ParkSense AI
        </div>
        <button onClick={onClose} className="ps-chatbot-close" aria-label="Close Chat">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="ps-chatbot-messages" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`ps-message ${msg.sender === "user" ? "ps-message-user" : "ps-message-bot"}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="ps-message-typing">
            <span style={{ marginRight: '6px' }}>Thinking</span>
            <div className="ps-typing-dot"></div>
            <div className="ps-typing-dot"></div>
            <div className="ps-typing-dot"></div>
          </div>
        )}
      </div>

      {messages.length === 1 && !isLoading && (
        <div className="ps-chatbot-suggestions">
          {quickSuggestions.map((suggestion, idx) => (
            <button 
              key={idx} 
              className="ps-chatbot-suggestion-btn"
              style={{ animationDelay: `${idx * 0.1}s` }}
              onClick={() => handleSend(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="ps-chatbot-input-area">
        <input 
          type="text" 
          className="ps-chatbot-input" 
          placeholder="Ask me anything..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button 
          className="ps-chatbot-send" 
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || isLoading}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatbotWindow;
