import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Homepage.css';

const Homepage = ({ onNavigate }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // API Base URL - uses environment variable in production
  const API_BASE = process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api`
    : '/api';

  // Welcome message
  const welcomeMessage = {
    role: 'assistant',
    content: `Welcome to Hennessey Estate! I'm your AI concierge powered by **Gemini 3 Pro**.

I can help you with:
• **Check Availability** — Find rooms for your dates with real-time pricing
• **View Reservations** — Look up guest bookings and check-in status
• **Property Insights** — Occupancy reports, revenue analytics, and trends
• **Guest Services** — Special requests, breakfast, and housekeeping needs

What would you like to know?`
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }, []);

  // Send message to API
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const currentSessionId = sessionId || generateSessionId();
    if (!sessionId) setSessionId(currentSessionId);

    // Add user message
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId: currentSessionId })
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          liveData: data.liveDataFetched
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I apologize, but I encountered an issue. Please try again.',
          error: true
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please check your network and try again.',
        error: true
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (action) => {
    const actions = {
      'availability': 'What rooms are available this weekend with pricing?',
      'reservations': 'Show me today\'s arrivals and departures',
      'insights': 'Give me a property performance overview',
      'services': 'What special requests do we have for guests today?'
    };
    sendMessage(actions[action] || action);
  };

  // Format message with markdown-like syntax
  const formatMessage = (content) => {
    if (!content) return null;
    
    return content.split('\n').map((line, i) => {
      // Bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.startsWith('•')) {
        return <li key={i} dangerouslySetInnerHTML={{ __html: line.substring(1).trim() }} />;
      }
      // Regular line
      return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  const features = [
    {
      id: 'reservations',
      icon: '📋',
      title: 'Daily Reservations',
      description: 'Real-time view of arrivals, departures, and in-house guests with detailed booking information.',
      action: () => onNavigate('reservations')
    },
    {
      id: 'availability',
      icon: '🏨',
      title: 'Availability & Pricing',
      description: 'Check room availability, manage rates, and view pricing across all room types instantly.',
      action: () => onNavigate('availability')
    },
    {
      id: 'email',
      icon: '✉️',
      title: 'Email Marketing',
      description: 'Create and send targeted campaigns to guests with personalized messaging.',
      action: () => onNavigate('email')
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>Powered by Gemini 3 Pro AI</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">Your Intelligent</span>
            <span className="title-line accent">Property Management Concierge</span>
          </h1>
          
          <p className="hero-subtitle">
            Ask anything about your property. Get instant answers with real-time data from Cloudbeds.
          </p>
        </div>
      </section>

      {/* Main Chat Section */}
      <section className="chat-section">
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-avatar">
              <div className="avatar-ring"></div>
              <span>H</span>
            </div>
            <div className="chat-header-info">
              <h2>Hennessey Management AI</h2>
              <div className="status-indicator">
                <span className="status-dot"></span>
                <span>Online • Ready to assist</span>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role} ${msg.error ? 'error' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="message-avatar">
                    <span>H</span>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">
                    {formatMessage(msg.content)}
                  </div>
                  {msg.liveData && (
                    <div className="live-badge">
                      <span className="live-icon">⚡</span>
                      <span>Live data from Cloudbeds</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message assistant typing">
                <div className="message-avatar">
                  <span>H</span>
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
          <div className="quick-actions">
            <button onClick={() => handleQuickAction('availability')}>
              <span className="action-icon">🗓️</span>
              <span>Check Availability</span>
            </button>
            <button onClick={() => handleQuickAction('reservations')}>
              <span className="action-icon">👥</span>
              <span>Today's Guests</span>
            </button>
            <button onClick={() => handleQuickAction('insights')}>
              <span className="action-icon">📊</span>
              <span>Property Stats</span>
            </button>
            <button onClick={() => handleQuickAction('services')}>
              <span className="action-icon">🛎️</span>
              <span>Guest Requests</span>
            </button>
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about reservations, availability, guests..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Property Management Tools</h2>
          <p>Everything you need to manage your hotel, all in one place</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card" onClick={feature.action}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-link">
                <span>Open</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-info">
              <span className="stat-value">Gemini 3</span>
              <span className="stat-label">Pro Preview AI</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <span className="stat-value">Real-time</span>
              <span className="stat-label">Cloudbeds Sync</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-info">
              <span className="stat-value">Secure</span>
              <span className="stat-label">API Connection</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏨</div>
            <div className="stat-info">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Always Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <p>Powered by Cloudbeds PMS & Google Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
