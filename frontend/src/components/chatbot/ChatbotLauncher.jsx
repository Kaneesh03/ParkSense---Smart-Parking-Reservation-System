import React, { useState } from 'react';
import ChatbotWindow from './ChatbotWindow';
import './chatbot.css';

const ChatbotLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {isOpen && <ChatbotWindow onClose={() => setIsOpen(false)} />}
      {!isOpen && (
        <button 
          className="ps-chatbot-launcher" 
          onClick={toggleChat}
          aria-label="Open AI Parking Assistant"
        >
          <i className="fa-solid fa-message"></i>
        </button>
      )}
    </>
  );
};

export default ChatbotLauncher;
