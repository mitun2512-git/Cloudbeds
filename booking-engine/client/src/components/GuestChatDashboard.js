import React, { useState, useEffect, useCallback } from 'react';
import './GuestChatDashboard.css';

// API Base URL - uses environment variable in production
const API_BASE = process.env.REACT_APP_API_URL || '';

const GuestChatDashboard = () => {
  const [stats, setStats] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    email: '',
    name: '',
    startDate: '',
    endDate: ''
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/guest-chat/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchInteractions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.email && { email: filters.email }),
        ...(filters.name && { name: filters.name }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`${API_BASE}/api/guest-chat/interactions?${params}`);
      const data = await response.json();
      
      setInteractions(data.interactions || []);
      setTotalPages(Math.ceil((data.total || 0) / 20));
    } catch (error) {
      console.error('Failed to fetch interactions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchStats();
    fetchInteractions();
  }, [fetchStats, fetchInteractions]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(isoString);
  };

  return (
    <div className="guest-chat-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>Guest Chat Interactions</h2>
          <p>Monitor and review conversations with prospective guests</p>
        </div>
        <button className="refresh-btn" onClick={() => { fetchStats(); fetchInteractions(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Chats</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.thisWeek}</div>
            <div className="stat-label">This Week</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.uniqueGuests}</div>
            <div className="stat-label">Unique Guests</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.avgMessagesPerChat}</div>
            <div className="stat-label">Avg Messages</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={filters.name}
          onChange={(e) => handleFilterChange('name', e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by email..."
          value={filters.email}
          onChange={(e) => handleFilterChange('email', e.target.value)}
        />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />
        {(filters.name || filters.email || filters.startDate || filters.endDate) && (
          <button 
            className="clear-filters-btn"
            onClick={() => setFilters({ email: '', name: '', startDate: '', endDate: '' })}
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="content-grid">
        {/* Interactions List */}
        <div className="interactions-list">
          <h3>Recent Conversations</h3>
          
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : interactions.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <p>No chat interactions yet</p>
              <span>Conversations with guests will appear here</span>
            </div>
          ) : (
            <>
              <div className="interactions-items">
                {interactions.map(interaction => (
                  <div 
                    key={interaction.id}
                    className={`interaction-item ${selectedInteraction?.id === interaction.id ? 'selected' : ''}`}
                    onClick={() => setSelectedInteraction(interaction)}
                  >
                    <div className="interaction-header">
                      <span className="guest-name">{interaction.guestInfo?.name || 'Unknown'}</span>
                      <span className="time">{formatRelativeTime(interaction.lastMessageAt)}</span>
                    </div>
                    <div className="guest-email">{interaction.guestInfo?.email}</div>
                    <div className="interaction-meta">
                      <span className="message-count">{interaction.messageCount} messages</span>
                      {interaction.guestInfo?.phone && (
                        <span className="has-phone">📱</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Prev
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Conversation Detail */}
        <div className="conversation-detail">
          {selectedInteraction ? (
            <>
              <div className="detail-header">
                <div className="guest-info">
                  <h3>{selectedInteraction.guestInfo?.name}</h3>
                  <a href={`mailto:${selectedInteraction.guestInfo?.email}`}>
                    {selectedInteraction.guestInfo?.email}
                  </a>
                  {selectedInteraction.guestInfo?.phone && (
                    <a href={`tel:${selectedInteraction.guestInfo.phone}`}>
                      {selectedInteraction.guestInfo.phone}
                    </a>
                  )}
                </div>
                <div className="conversation-meta">
                  <span>Started: {formatDate(selectedInteraction.startedAt)}</span>
                  <span>Last message: {formatDate(selectedInteraction.lastMessageAt)}</span>
                </div>
              </div>

              <div className="messages-list">
                {selectedInteraction.messages?.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <div className="message-header">
                      <span className="role">
                        {msg.role === 'user' ? selectedInteraction.guestInfo?.name?.split(' ')[0] : 'AI Concierge'}
                      </span>
                      <span className="timestamp">{formatDate(msg.timestamp)}</span>
                    </div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))}
              </div>

              <div className="action-buttons">
                <a 
                  href={`mailto:${selectedInteraction.guestInfo?.email}?subject=Following up on your inquiry about Hennessey Estate`}
                  className="action-btn primary"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Send Email
                </a>
                {selectedInteraction.guestInfo?.phone && (
                  <a 
                    href={`tel:${selectedInteraction.guestInfo.phone}`}
                    className="action-btn"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    Call
                  </a>
                )}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <p>Select a conversation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestChatDashboard;

