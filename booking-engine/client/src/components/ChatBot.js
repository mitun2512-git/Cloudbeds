import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // API Base URL - uses environment variable in production
  const API_BASE = process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api`
    : '/api';

  // Welcome message
  const welcomeMessage = {
    role: 'assistant',
    content: `Welcome to Hennessey Estate! I'm your AI concierge, here to assist with:

• **Reservations** – Check arrivals, departures, and booking details
• **Room Availability** – View rates and availability for any dates
• **Guest Services** – Track service requests and special needs
• **Property Insights** – Occupancy stats, outstanding balances, and more

How may I assist you today?`
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [isOpen]);

  // Send message to API
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        const assistantMessage = { 
          role: 'assistant', 
          content: data.response,
          functionsCalled: data.functionsCalled
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (!isOpen) {
          setHasUnread(true);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I apologize, but I encountered an issue processing your request. Please try again.',
          isError: true
        }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Unable to connect to the assistant. Please check your connection and try again.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, sessionId, isLoading, isOpen]);

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle clear chat
  const handleClear = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE}/chatbot/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
    setSessionId(null);
    setMessages([welcomeMessage]);
  };

  // Quick actions
  const quickActions = [
    { label: "Today's arrivals", query: "Who is arriving today?" },
    { label: "Room availability", query: "What rooms are available this weekend?" },
    { label: "Outstanding balances", query: "Are there any guests with outstanding balances?" },
    { label: "Service requests", query: "Show me today's service requests" }
  ];

  // Format message content with markdown-like formatting
  const formatContent = (content) => {
    if (!content) return '';
    
    // Split by newlines
    const lines = content.split('\n');
    
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('## ')) {
        return <h4 key={i} className="chat-heading">{line.slice(3)}</h4>;
      }
      if (line.startsWith('### ')) {
        return <h5 key={i} className="chat-subheading">{line.slice(4)}</h5>;
      }
      
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.slice(2);
        return (
          <div key={i} className="chat-bullet">
            <span className="bullet">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
          </div>
        );
      }
      
      // Numbered lists
      const numberMatch = line.match(/^(\d+)\.\s/);
      if (numberMatch) {
        const content = line.slice(numberMatch[0].length);
        return (
          <div key={i} className="chat-numbered">
            <span className="number">{numberMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
          </div>
        );
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={i} className="chat-spacer" />;
      }
      
      // Regular paragraphs
      return (
        <p key={i} className="chat-paragraph" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    });
  };

  // Format inline content (bold, code, etc.)
  const formatInline = (text) => {
    return text
      // Bold: **text**
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Code: `text`
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Money formatting
      .replace(/\$(\d+(?:\.\d{2})?)/g, '<span class="chat-money">$$$1</span>');
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''} ${hasUnread ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.178 1.196 4.136 3.096 5.463-.186 1.459-.887 2.811-2.096 3.922 2.048 0 3.91-.724 5.304-1.912.55.085 1.116.127 1.696.127 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
            <circle cx="8" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="16" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
        {hasUnread && !isOpen && <span className="unread-badge" />}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <text x="40" y="50" textAnchor="middle" fontFamily="serif" fontSize="32" fontWeight="500" fill="currentColor">H</text>
              </svg>
            </div>
            <div className="chatbot-header-text">
              <h3>Hennessey Management AI</h3>
              <span className="chatbot-status">
                <span className="status-dot" />
                AI-powered by Gemini
              </span>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button 
              className="chatbot-action-btn" 
              onClick={handleClear}
              title="Clear conversation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
              </svg>
            </button>
            <button 
              className="chatbot-action-btn chatbot-close-btn" 
              onClick={() => setIsOpen(false)}
              title="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`chat-message ${msg.role} ${msg.isError ? 'error' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="message-avatar">
                  <svg viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1" fill="none"/>
                    <text x="20" y="25" textAnchor="middle" fontFamily="serif" fontSize="16" fontWeight="500" fill="currentColor">H</text>
                  </svg>
                </div>
              )}
              <div className="message-content">
                {formatContent(msg.content)}
                {msg.functionsCalled && (
                  <div className="function-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                    <span>Live data fetched</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="chat-message assistant loading">
              <div className="message-avatar">
                <svg viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <text x="20" y="25" textAnchor="middle" fontFamily="serif" fontSize="16" fontWeight="500" fill="currentColor">H</text>
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

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="chatbot-quick-actions">
            {quickActions.map((action, idx) => (
              <button 
                key={idx}
                className="quick-action-btn"
                onClick={() => sendMessage(action.query)}
                disabled={isLoading}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form className="chatbot-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder="Ask about reservations, availability, guests..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="chatbot-send-btn"
            disabled={!inputValue.trim() || isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
        
        <div className="chatbot-footer">
          Powered by Cloudbeds & Gemini AI
        </div>
      </div>
    </>
  );
};

export default ChatBot;

