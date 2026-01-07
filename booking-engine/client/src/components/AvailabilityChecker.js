import React, { useState } from 'react';
import { format, startOfToday, addDays, differenceInDays } from 'date-fns';
import { getAvailability } from '../services/api';
import './AvailabilityChecker.css';

const AvailabilityChecker = ({ propertyId }) => {
  const [startDate, setStartDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(startOfToday(), 1), 'yyyy-MM-dd'));
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheckedDates, setLastCheckedDates] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getAvailability(startDate, endDate, propertyId);
      const availList = result.availability || [];
      
      setAvailability(availList);
      setLastCheckedDates({ start: startDate, end: endDate });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unable to load availability.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle start date change - ensure end date is always after start date
  const handleStartDateChange = (newStartDate) => {
    setStartDate(newStartDate);
    // If end date is before or equal to new start date, update it
    if (newStartDate >= endDate) {
      const nextDay = format(addDays(new Date(newStartDate), 1), 'yyyy-MM-dd');
      setEndDate(nextDay);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group availability by room type and only keep the standard rate (base rate without ratePlanId)
  const groupedByRoomType = availability.reduce((acc, item) => {
    const roomTypeId = item.roomTypeId || 'unknown';
    
    // Only include the standard rate (no ratePlanId means it's the base rate)
    const isStandardRate = !item.ratePlanId || item.ratePlanName === 'Standard Rate';
    if (!isStandardRate) return acc;
    
    if (!acc[roomTypeId]) {
      acc[roomTypeId] = {
        roomTypeId,
        roomTypeName: item.roomTypeName || 'Room Type',
        roomsAvailable: item.roomsAvailable || 0,
        roomRate: item.roomRate,
        currency: item.currency || 'USD'
      };
    }
    return acc;
  }, {});

  // Filter out room types that have zero availability
  const roomTypeGroups = Object.values(groupedByRoomType).filter(room => room.roomsAvailable > 0);

  // Calculate nights for display
  const getNights = () => {
    if (!lastCheckedDates) return 0;
    return differenceInDays(new Date(lastCheckedDates.end), new Date(lastCheckedDates.start));
  };

  return (
    <div className="availability-container">
      {/* Date Selector Card */}
      <div className="card date-selector-card">
        <form className="date-form" onSubmit={handleSubmit}>
          <div className="date-form-content">
            <div className="form-group">
              <label className="form-label" htmlFor="start-date">Check-in Date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                min={format(startOfToday(), 'yyyy-MM-dd')}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="end-date">Check-out Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                min={format(addDays(new Date(startDate), 1), 'yyyy-MM-dd')}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, marginRight: 8 }}></div>
                  Checking...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  Check Availability
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {lastCheckedDates && !loading && (
        <div className="results-section">
          <div className="results-header">
            <div className="results-title">
              <h3>Availability for {formatDate(lastCheckedDates.start)}</h3>
              <span className="date-range-info">
                {getNights()} night{getNights() !== 1 ? 's' : ''} · Check-out: {formatDate(lastCheckedDates.end)}
              </span>
            </div>
            <span className="results-count">
              {roomTypeGroups.length} room{roomTypeGroups.length !== 1 ? 's' : ''} available
            </span>
          </div>

          {roomTypeGroups.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <p>No rooms available for these dates.</p>
                <p className="text-sm text-muted">All rooms are booked for this period. Try different dates.</p>
              </div>
            </div>
          ) : (
            <div className="room-cards">
              {roomTypeGroups.map((room) => {
                const price = formatCurrency(room.roomRate, room.currency);
                return (
                  <div key={room.roomTypeId} className="room-card card">
                    <div className="room-card-content">
                      <div className="room-info">
                        <h4 className="room-name">{room.roomTypeName}</h4>
                      </div>
                      <div className="room-availability">
                        <span className="availability-count available">
                          {room.roomsAvailable}
                        </span>
                        <span className="text-xs text-muted">
                          room{room.roomsAvailable !== 1 ? 's' : ''} available
                        </span>
                      </div>
                      <div className="room-price">
                        {price ? (
                          <span className="price">{price}</span>
                        ) : (
                          <span className="text-muted">Contact for pricing</span>
                        )}
                        <span className="text-xs text-muted">per night</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!lastCheckedDates && !loading && (
        <div className="card">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p>Select dates to check room availability and pricing</p>
            <p className="text-sm text-muted">Choose your check-in and check-out dates above</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityChecker;
