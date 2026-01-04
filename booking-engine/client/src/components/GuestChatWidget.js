import React, { useState, useRef, useEffect, useCallback } from 'react';
import './GuestChatWidget.css';

// API Base URL - uses environment variable in production
const API_BASE = process.env.REACT_APP_API_URL || '';

// Phrases that indicate user wants to speak to a human
const TRANSFER_TRIGGERS = [
  'speak to someone', 'speak to a person', 'speak to human', 'talk to someone',
  'talk to a person', 'talk to human', 'real person', 'human agent', 'live agent',
  'customer service', 'support agent', 'transfer me', 'connect me', 'representative',
  'speak with someone', 'talk with someone', 'live chat', 'real agent',
  'can\'t help', 'not helpful', 'frustrated', 'need help', 'make a complaint',
  'complaint', 'manager', 'supervisor'
];

// Topics the AI may not be able to handle well
const COMPLEX_TOPICS = [
  'cancel', 'refund', 'problem with', 'issue with', 'modify reservation',
  'change booking', 'special request', 'accessibility', 'ada', 'wheelchair',
  'medical', 'emergency', 'complaint', 'unhappy', 'disappointed'
];

const GuestChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);
  const [guestForm, setGuestForm] = useState({ name: '', email: '', phone: '' });
  const [showGuestForm, setShowGuestForm] = useState(true);
  const [interactionId, setInteractionId] = useState(null);
  const [formError, setFormError] = useState('');
  const [showTransferOption, setShowTransferOption] = useState(false);
  const [transferReason, setTransferReason] = useState('');
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0 && guestInfo) {
      setMessages([{
        role: 'assistant',
        content: `Hi ${guestInfo.name.split(' ')[0]}! 👋 Welcome to Hennessey Estate. I'm here to help you learn about our historic Victorian bed and breakfast in Napa Valley.\n\nHow can I assist you today? I can tell you about:\n• Our rooms and amenities\n• What's included with your stay\n• Location and nearby attractions\n• Policies and booking information`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, guestInfo, messages.length]);

  // Check if message requires transfer to live agent
  const shouldOfferTransfer = useCallback((message) => {
    const lowerMsg = message.toLowerCase();
    
    // Direct transfer requests
    if (TRANSFER_TRIGGERS.some(trigger => lowerMsg.includes(trigger))) {
      return { should: true, reason: 'User requested to speak with a live agent' };
    }
    
    // Complex topics that might need human help
    if (COMPLEX_TOPICS.some(topic => lowerMsg.includes(topic))) {
      return { should: true, reason: 'Complex request that may require staff assistance' };
    }
    
    return { should: false, reason: '' };
  }, []);

  // Generate chat summary for transfer
  const generateChatSummary = useCallback(() => {
    const recentMessages = messages.slice(-10);
    let summary = `Chat Summary for ${guestInfo?.name || 'Guest'} (${guestInfo?.email || 'No email'}):\n\n`;
    
    recentMessages.forEach(msg => {
      const role = msg.role === 'assistant' ? 'AI Concierge' : 'Guest';
      const content = msg.content.length > 300 ? msg.content.substring(0, 300) + '...' : msg.content;
      summary += `${role}: ${content}\n\n`;
    });
    
    return summary;
  }, [messages, guestInfo]);

  // Transfer to Whistle live chat
  const handleTransferToLiveAgent = useCallback((reason) => {
    const summary = generateChatSummary();
    
    // Add transfer message to chat
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `I'm connecting you with a live agent now. They'll have the context of our conversation and will be able to help you with ${reason || 'your request'}.\n\nThe live chat window will open shortly...`,
      timestamp: new Date().toISOString(),
      isTransfer: true
    }]);

    // Push summary to backend for logging
    if (window.pushChatSummaryToWhistle) {
      window.pushChatSummaryToWhistle(guestInfo, messages, reason);
    }

    // Transfer to Whistle after a brief delay to let user read the message
    setTimeout(() => {
      // Close the AI chat first
      setIsOpen(false);
      setShowTransferOption(false);
      
      // Then open Whistle chat with context
      setTimeout(() => {
        if (window.transferToWhistle) {
          window.transferToWhistle(guestInfo, summary);
        }
      }, 300);
    }, 2000);
  }, [generateChatSummary, guestInfo, messages]);

  // Push chat summary when chat is closed (without transfer)
  const handleCloseChat = useCallback(() => {
    if (messages.length > 1 && guestInfo) {
      // Push summary for follow-up
      if (window.pushChatSummaryToWhistle) {
        window.pushChatSummaryToWhistle(guestInfo, messages, 'Chat session ended');
      }
    }
    setIsOpen(false);
  }, [messages, guestInfo]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleGuestFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!guestForm.name.trim()) {
      setFormError('Please enter your name');
      return;
    }
    if (!guestForm.email.trim()) {
      setFormError('Please enter your email');
      return;
    }
    if (!validateEmail(guestForm.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    setGuestInfo({
      name: guestForm.name.trim(),
      email: guestForm.email.trim().toLowerCase(),
      phone: guestForm.phone.trim() || null
    });
    setShowGuestForm(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Check if user wants to transfer to live agent
    const transferCheck = shouldOfferTransfer(userMessage);
    if (transferCheck.should) {
      setTransferReason(transferCheck.reason);
      setShowTransferOption(true);
    }
    
    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/guest-chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          guestInfo,
          conversationHistory: messages,
          interactionId
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setConsecutiveErrors(0);
        
        if (data.interactionId) {
          setInteractionId(data.interactionId);
        }
        
        // Check if AI response suggests need for human help
        const aiResponse = data.response.toLowerCase();
        if (aiResponse.includes('contact us directly') || 
            aiResponse.includes('staff can assist') ||
            aiResponse.includes('reach out to our team') ||
            aiResponse.includes('please call') ||
            aiResponse.includes('please email')) {
          setShowTransferOption(true);
          setTransferReason('AI suggested contacting staff');
        }
      } else {
        const errorMessage = {
          role: 'assistant',
          content: data.error || 'Sorry, I encountered an issue. Please try again or contact us at info@hennesseyestate.com',
          timestamp: new Date().toISOString(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        
        // Track consecutive errors
        const newErrorCount = consecutiveErrors + 1;
        setConsecutiveErrors(newErrorCount);
        
        // Offer transfer after 2 consecutive errors
        if (newErrorCount >= 2) {
          setShowTransferOption(true);
          setTransferReason('Multiple errors encountered');
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again or email us at info@hennesseyestate.com',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Track consecutive errors
      const newErrorCount = consecutiveErrors + 1;
      setConsecutiveErrors(newErrorCount);
      
      // Offer transfer after 2 consecutive errors
      if (newErrorCount >= 2) {
        setShowTransferOption(true);
        setTransferReason('Connection issues');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content) => {
    // Convert markdown-style formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Handle bullet points
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <li key={i}>{line.substring(2)}</li>;
        }
        // Handle bold text
        const parts = line.split(/\*\*(.*?)\*\*/g);
        if (parts.length > 1) {
          return (
            <p key={i}>
              {parts.map((part, j) => 
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </p>
          );
        }
        return line ? <p key={i}>{line}</p> : <br key={i} />;
      });
  };

  return (
    <div className={`guest-chat-widget ${isOpen ? 'open' : ''}`}>
      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
        {!isOpen && <span className="chat-badge">Concierge</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h4>Hennessey Concierge</h4>
                <span className="status-indicator">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <button 
              className="close-btn"
              onClick={handleCloseChat}
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Transfer to Live Agent Banner */}
          {showTransferOption && !showGuestForm && (
            <div className="transfer-banner">
              <div className="transfer-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transfer-icon">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                  <path d="M16 11l2 2 4-4" />
                </svg>
                <span>Need to speak with our team?</span>
              </div>
              <button 
                className="transfer-btn"
                onClick={() => handleTransferToLiveAgent(transferReason)}
              >
                Connect Now
              </button>
              <button 
                className="dismiss-transfer-btn"
                onClick={() => setShowTransferOption(false)}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* Guest Info Form or Chat Messages */}
          {showGuestForm ? (
            <div className="guest-form-container">
              <div className="guest-form-header">
                <h3>Welcome to Hennessey Estate</h3>
                <p>Please share your details so we can assist you better.</p>
              </div>
              <form onSubmit={handleGuestFormSubmit} className="guest-form">
                <div className="form-group">
                  <label htmlFor="guest-name">Name *</label>
                  <input
                    id="guest-name"
                    type="text"
                    placeholder="Your name"
                    value={guestForm.name}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, name: e.target.value }))}
                    autoComplete="name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="guest-email">Email *</label>
                  <input
                    id="guest-email"
                    type="email"
                    placeholder="your@email.com"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, email: e.target.value }))}
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="guest-phone">Phone (optional)</label>
                  <input
                    id="guest-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))}
                    autoComplete="tel"
                  />
                </div>
                {formError && <div className="form-error">{formError}</div>}
                <button type="submit" className="start-chat-btn">
                  Start Chatting
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
              <p className="privacy-note">
                Your information is kept private and only used to assist with your inquiry.
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="message-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                    <div className="message-content">
                      {formatMessage(msg.content)}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant loading">
                    <div className="message-avatar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input-container">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about rooms, amenities, or your stay..."
                  rows="1"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="send-btn"
                  aria-label="Send message"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestChatWidget;

