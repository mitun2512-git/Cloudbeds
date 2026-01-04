import React, { useState, useEffect, useCallback } from 'react';
import { getDailyReservations, getOutstandingBalanceReservations, getReservationsWithServices } from '../services/api';
import './DailyReservations.css';

const DailyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
  // Action panel state
  const [activePanel, setActivePanel] = useState(null);
  const [outstandingData, setOutstandingData] = useState({ reservations: [], loading: false, count: 0 });
  const [servicesData, setServicesData] = useState({ breakfast: [], cleaning: [], dailyCleaning: [], checkoutCleaning: [], loading: false });

  useEffect(() => {
    fetchReservations();
    fetchOutstandingBalance();
    fetchServicesData();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await getDailyReservations();
      const list = data.data || data || [];
      setReservations(Array.isArray(list) ? list : []);
    } catch (err) {
      setError('Failed to fetch reservations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutstandingBalance = useCallback(async () => {
    try {
      setOutstandingData(prev => ({ ...prev, loading: true }));
      const result = await getOutstandingBalanceReservations();
      setOutstandingData({
        reservations: result.data || [],
        loading: false,
        count: result.count || 0,
        dateRange: result.dateRange
      });
    } catch (err) {
      console.error('Failed to fetch outstanding balance:', err);
      setOutstandingData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchServicesData = useCallback(async () => {
    try {
      setServicesData(prev => ({ ...prev, loading: true }));
      const result = await getReservationsWithServices();
      setServicesData({
        breakfast: result.data?.breakfast || [],
        cleaning: result.data?.cleaning || [],
        dailyCleaning: result.data?.dailyCleaning || [],
        checkoutCleaning: result.data?.checkoutCleaning || [],
        loading: false,
        stats: result.stats
      });
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setServicesData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed') return 'status-confirmed';
    if (s === 'checked_in' || s === 'in_house') return 'status-checked-in';
    if (s === 'checked_out') return 'status-checked-out';
    if (s === 'canceled' || s === 'cancelled') return 'status-canceled';
    if (s === 'no_show') return 'status-no-show';
    return 'status-default';
  };

  const getStatusLabel = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed') return 'Confirmed';
    if (s === 'checked_in') return 'Checked In';
    if (s === 'checked_out') return 'Checked Out';
    if (s === 'canceled' || s === 'cancelled') return 'Canceled';
    if (s === 'no_show') return 'No Show';
    return status || 'Unknown';
  };

  // Get stats
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const checkedInCount = reservations.filter(r => r.status === 'checked_in').length;
  const checkedOutCount = reservations.filter(r => r.status === 'checked_out').length;
  const canceledCount = reservations.filter(r => r.status === 'canceled' || r.status === 'cancelled').length;
  const noShowCount = reservations.filter(r => r.status === 'no_show').length;

  if (loading) {
    return (
      <div className="daily-reservations">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading reservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-reservations">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchReservations}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-reservations">
      {/* Quick Actions Bar */}
      <div className="quick-actions">
        <button 
          className={`quick-action ${activePanel === 'outstanding' ? 'active' : ''} ${outstandingData.count > 0 ? 'has-items' : ''}`}
          onClick={() => setActivePanel(activePanel === 'outstanding' ? null : 'outstanding')}
        >
          <span className="qa-icon">$</span>
          <span className="qa-count">{outstandingData.loading ? '-' : outstandingData.count}</span>
          <span className="qa-label">Outstanding</span>
        </button>
        
        <button 
          className={`quick-action ${activePanel === 'breakfast' ? 'active' : ''} ${servicesData.breakfast.length > 0 ? 'has-items' : ''}`}
          onClick={() => setActivePanel(activePanel === 'breakfast' ? null : 'breakfast')}
        >
          <span className="qa-icon">☕</span>
          <span className="qa-count">{servicesData.loading ? '-' : servicesData.breakfast.length}</span>
          <span className="qa-label">Breakfast</span>
        </button>
        
        <button 
          className={`quick-action ${activePanel === 'cleaning' ? 'active' : ''} ${servicesData.cleaning.length > 0 ? 'has-items' : ''}`}
          onClick={() => setActivePanel(activePanel === 'cleaning' ? null : 'cleaning')}
        >
          <span className="qa-icon">🧹</span>
          <span className="qa-count">{servicesData.loading ? '-' : servicesData.cleaning.length}</span>
          <span className="qa-label">Cleaning</span>
        </button>
      </div>

      {/* Expandable Panel */}
      {activePanel && (
        <div className="action-panel">
          <div className="panel-header">
            <h3>
              {activePanel === 'outstanding' && '💰 Outstanding Balance (Last 3 Days Check-ins)'}
              {activePanel === 'breakfast' && '☕ Breakfast Requests (Today)'}
              {activePanel === 'cleaning' && '🧹 Rooms Needing Cleaning (Today)'}
            </h3>
            <button className="close-btn" onClick={() => setActivePanel(null)}>×</button>
          </div>
          <div className="panel-content">
            {activePanel === 'outstanding' && (
              outstandingData.count === 0 ? (
                <p className="empty-msg">No outstanding balances from check-ins in the last 3 days.</p>
              ) : (
                <div className="panel-list">
                  {outstandingData.reservations.map(r => (
                    <div key={r.reservationID} className="panel-item">
                      <div className="item-main">
                        <span className="item-name">{r.guestName}</span>
                        <span className="item-room">{r.roomTypeName || 'N/A'}</span>
                      </div>
                      <div className="item-details">
                        <span className="item-date">Check-in: {formatDate(r.startDate)}</span>
                        <span className="item-balance">${parseFloat(r.balance || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {activePanel === 'breakfast' && (
              servicesData.breakfast.length === 0 ? (
                <p className="empty-msg">No breakfast requests for today's checked-in guests.</p>
              ) : (
                <div className="panel-list">
                  {servicesData.breakfast.map(r => (
                    <div key={r.reservationID} className="panel-item">
                      <div className="item-main">
                        <span className="item-name">{r.guestName}</span>
                        <span className="item-room">{r.roomNumber}</span>
                      </div>
                      <div className="item-details">
                        <span className="item-note">{r.customFieldValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {activePanel === 'cleaning' && (
              servicesData.cleaning.length === 0 ? (
                <p className="empty-msg">No rooms need cleaning today.</p>
              ) : (
                <div className="cleaning-panel">
                  <div className="cleaning-summary">
                    <div className="cleaning-stat">
                      <span className="cleaning-count">{servicesData.dailyCleaning.length}</span>
                      <span className="cleaning-label">Daily Cleaning Requests</span>
                    </div>
                    <div className="cleaning-stat">
                      <span className="cleaning-count">{servicesData.checkoutCleaning.length}</span>
                      <span className="cleaning-label">Checkout Turnovers</span>
                    </div>
                  </div>
                  
                  {servicesData.dailyCleaning.length > 0 && (
                    <div className="cleaning-category">
                      <h4 className="category-title">🧹 Daily Cleaning Requests</h4>
                      <div className="panel-list">
                        {servicesData.dailyCleaning.map(r => (
                          <div key={`daily-${r.reservationID}`} className="panel-item cleaning-daily">
                            <div className="item-main">
                              <span className="item-name">{r.guestName}</span>
                              <span className="item-room">{r.roomNumber}</span>
                            </div>
                            <div className="item-details">
                              <span className="item-badge daily">Daily Request</span>
                              <span className="item-note">{r.customFieldValue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {servicesData.checkoutCleaning.length > 0 && (
                    <div className="cleaning-category">
                      <h4 className="category-title">🚪 Checkout Turnovers</h4>
                      <div className="panel-list">
                        {servicesData.checkoutCleaning.map(r => (
                          <div key={`checkout-${r.reservationID}`} className="panel-item cleaning-checkout">
                            <div className="item-main">
                              <span className="item-name">{r.guestName}</span>
                              <span className="item-room">{r.roomNumber}</span>
                            </div>
                            <div className="item-details">
                              <span className="item-badge checkout">Checkout</span>
                              <span className="item-note">Room turnover needed</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="stats-row">
        <div className="stat">
          <span className="stat-number">{checkedInCount}</span>
          <span className="stat-label">In House</span>
        </div>
        <div className="stat">
          <span className="stat-number">{confirmedCount}</span>
          <span className="stat-label">Confirmed</span>
        </div>
        <div className="stat">
          <span className="stat-number">{checkedOutCount}</span>
          <span className="stat-label">Checked Out</span>
        </div>
        <div className="stat">
          <span className="stat-number">{canceledCount}</span>
          <span className="stat-label">Canceled</span>
        </div>
        {noShowCount > 0 && (
          <div className="stat">
            <span className="stat-number">{noShowCount}</span>
            <span className="stat-label">No Show</span>
          </div>
        )}
      </div>

      {/* Reservations Table */}
      <div className="reservations-section">
        <div className="section-header">
          <h2>All Reservations</h2>
          <span className="count-badge">{reservations.length}</span>
          <button className="refresh-btn" onClick={fetchReservations}>
            ↻ Refresh
          </button>
        </div>

        {reservations.length === 0 ? (
          <div className="empty-state">
            <p>No reservations found.</p>
          </div>
        ) : (
          <div className="reservations-table">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Dates</th>
                  <th>Room</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => {
                  const resId = res.reservationID || res.reservation_id || res.id;
                  const guestName = res.guestName || 
                    `${res.guestFirstName || ''} ${res.guestLastName || ''}`.trim() || 
                    'Guest';
                  const checkIn = res.startDate || res.checkIn;
                  const checkOut = res.endDate || res.checkOut;
                  const roomName = res.roomTypeName || res.roomName || '-';
                  const total = res.total || res.grandTotal || res.balance;
                  const currency = res.currency || 'USD';
                  const isExpanded = expandedId === resId;

                  return (
                    <React.Fragment key={resId}>
                      <tr 
                        className={isExpanded ? 'expanded' : ''}
                        onClick={() => setExpandedId(isExpanded ? null : resId)}
                      >
                        <td>
                          <div className="guest-cell">
                            <span className="guest-name">{guestName}</span>
                            <span className="res-id">{resId}</span>
                          </div>
                        </td>
                        <td>
                          <span className="date-range">
                            {formatDate(checkIn)} → {formatDate(checkOut)}
                          </span>
                        </td>
                        <td>
                          <span className="room-name">{roomName}</span>
                        </td>
                        <td>
                          <span className="total-amount">{formatCurrency(total, currency)}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(res.status)}`}>
                            {getStatusLabel(res.status)}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="expanded-row">
                          <td colSpan="5">
                            <div className="expanded-content">
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <label>Email</label>
                                  <span>{res.guestEmail || '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <label>Phone</label>
                                  <span>{res.guestPhone || '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <label>Source</label>
                                  <span>{res.source || 'Direct'}</span>
                                </div>
                                <div className="detail-item">
                                  <label>Balance</label>
                                  <span className={parseFloat(res.balance) > 0 ? 'has-balance' : ''}>
                                    {formatCurrency(res.balance, currency)}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <label>Adults</label>
                                  <span>{res.adults || 1}</span>
                                </div>
                                <div className="detail-item">
                                  <label>Children</label>
                                  <span>{res.children || 0}</span>
                                </div>
                              </div>
                              {res.notes && (
                                <div className="notes-section">
                                  <label>Notes</label>
                                  <p>{res.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReservations;
