import React, { useState, useEffect, useCallback } from 'react';
import { getPricingCalendar, getHistoricalRevenue } from '../services/api';
import './DynamicPricing.css';

// Room configuration with base prices (Matched to Server Config)
// Room pricing: Base ($299) + 5% increase per tier
// Tier 1: $299, Tier 2: +5%, Tier 3: +10%, Tier 4 (Premium): +15%
const DEFAULT_ROOM_CONFIG = {
  '82833129423048': { name: 'Classic', basePrice: 299, tier: 1, premiumPct: 0 },
  '82835472601219': { name: 'Estate Room', basePrice: 314, tier: 2, premiumPct: 5 },
  '83444066242706': { name: 'Estate Junior Suite', basePrice: 329, tier: 3, premiumPct: 10 },
  '83444040888474': { name: 'Patio Retreat Suite', basePrice: 344, tier: 4, premiumPct: 15 },
  '89146217537706': { name: 'Pool Suite with Bathtub', basePrice: 344, tier: 4, premiumPct: 15 },
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ============================================
// MAIN COMPONENT - SIMPLIFIED LAYOUT
// ============================================
export default function DynamicPricing() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [roomConfig, setRoomConfig] = useState(() => {
    const saved = localStorage.getItem('hennesseyRoomConfig');
    return saved ? JSON.parse(saved) : DEFAULT_ROOM_CONFIG;
  });

  // Ensure room config uses current known room type IDs; if stale, reset to defaults
  useEffect(() => {
    const knownKeys = Object.keys(DEFAULT_ROOM_CONFIG);
    const currentKeys = Object.keys(roomConfig || {});
    const hasUnknownKey = currentKeys.some(k => !knownKeys.includes(k));
    if (hasUnknownKey || currentKeys.length === 0) {
      setRoomConfig(DEFAULT_ROOM_CONFIG);
      localStorage.setItem('hennesseyRoomConfig', JSON.stringify(DEFAULT_ROOM_CONFIG));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount - intentionally omit roomConfig to avoid re-running

  // Save config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('hennesseyRoomConfig', JSON.stringify(roomConfig));
  }, [roomConfig]);

  return (
    <div className="pricing-engine-simple">
      {/* Header */}
      <div className="pe-header">
        <h1>Pricing Engine</h1>
        <p>Dynamic pricing & revenue forecasting</p>
      </div>

      {/* Tab Navigation */}
      <div className="pe-tabs">
        <button 
          className={`pe-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Pricing Calendar
        </button>
        <button 
          className={`pe-tab ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
        >
          📊 Revenue Forecast
        </button>
        <button 
          className={`pe-tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ Configuration
        </button>
      </div>

      {/* Content */}
      <div className="pe-content">
        {activeTab === 'calendar' && (
          <PricingCalendarView roomConfig={roomConfig} setRoomConfig={setRoomConfig} />
        )}
        {activeTab === 'forecast' && (
          <RevenueForecastView />
        )}
        {activeTab === 'config' && (
          <ConfigurationView roomConfig={roomConfig} setRoomConfig={setRoomConfig} />
        )}
      </div>
    </div>
  );
}

// ============================================
// PRICING CALENDAR VIEW - FOCAL POINT
// ============================================
function PricingCalendarView({ roomConfig, setRoomConfig }) {
  const [month, setMonth] = useState(1); // January 2026
  const [year, setYear] = useState(2026);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      // Use first room in config as base for multiplier
      const baseRoomId = Object.keys(roomConfig)[0];
      if (!baseRoomId) return;
      
      const data = await getPricingCalendar(baseRoomId, year, month);
      setCalendarData(data);
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
      // If the server reports unknown room type, reset to defaults and retry once
      const message = err?.response?.data?.error || '';
      if (message.includes('Unknown room type')) {
        setRoomConfig(DEFAULT_ROOM_CONFIG);
        localStorage.setItem('hennesseyRoomConfig', JSON.stringify(DEFAULT_ROOM_CONFIG));
      }
    } finally {
      setLoading(false);
    }
  }, [month, year, roomConfig, setRoomConfig]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(null);
  };

  // Calculate price for a room on a given day
  const calculateRoomPrice = (basePrice, increment, multiplier) => {
    const totalBase = basePrice + increment;
    return Math.round(totalBase * multiplier);
  };

  // Get price level class
  const getPriceLevel = (multiplier) => {
    const mult = parseFloat(multiplier);
    if (mult >= 1.5) return 'premium';
    if (mult >= 1.3) return 'high';
    if (mult >= 1.1) return 'medium';
    if (mult <= 0.9) return 'low';
    return 'standard';
  };

  // Calculate empty cells for calendar alignment
  const days = calendarData?.calendar?.days || [];
  const firstDayOfMonth = days[0] ? new Date(days[0].date).getDay() : 0;
  const emptyCells = Array(firstDayOfMonth).fill(null);

  return (
    <div className="calendar-view">
      {/* Legend */}
      <div className="calendar-legend-bar">
        <span className="legend-item"><span className="dot low"></span> Low</span>
        <span className="legend-item"><span className="dot standard"></span> Standard</span>
        <span className="legend-item"><span className="dot medium"></span> Moderate</span>
        <span className="legend-item"><span className="dot high"></span> High</span>
        <span className="legend-item"><span className="dot premium"></span> Premium</span>
        <span className="legend-item"><span className="event-icon">🎉</span> Event</span>
      </div>

      {/* Month Navigation */}
      <div className="calendar-nav">
        <button onClick={handlePrevMonth} className="nav-btn">← {months[(month - 2 + 12) % 12]}</button>
        <div className="current-month-display">
          <span className="month-label">{months[month - 1]} {year}</span>
        </div>
        <button onClick={handleNextMonth} className="nav-btn">{months[month % 12]} →</button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="calendar-loading">
          <div className="spinner"></div>
          <p>Loading pricing data...</p>
        </div>
      ) : (
        <div className="calendar-main">
          <div className="calendar-weekdays">
            {weekDays.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-days">
            {emptyCells.map((_, idx) => (
              <div key={`empty-${idx}`} className="day-cell empty"></div>
            ))}
            {days.map((day) => {
              const priceLevel = getPriceLevel(day.multiplier);
              const hasEvent = day.factors?.event;
              const isSelected = selectedDay?.date === day.date;
              const basePrice = calculateRoomPrice(299, 0, day.multiplier);
              
              return (
                <div 
                  key={day.date}
                  className={`day-cell ${priceLevel} ${hasEvent ? 'has-event' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                >
                  <span className="day-number">{new Date(day.date).getDate()}</span>
                  <span className="day-multiplier">×{day.multiplier}</span>
                  <span className="day-base">${basePrice}</span>
                  {hasEvent && <span className="event-badge">🎉</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Room Prices Panel - Shows when day is selected */}
      {selectedDay && (
        <div className="room-prices-panel">
          <div className="panel-header">
            <h3>{new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
            <button className="close-btn" onClick={() => setSelectedDay(null)}>×</button>
          </div>
          <div className="panel-info">
            <span className="multiplier-badge">Multiplier: ×{selectedDay.multiplier}</span>
            {selectedDay.factors?.event && (
              <span className="event-tag">🎉 {selectedDay.factors.event}</span>
            )}
            {selectedDay.factors?.season && (
              <span className="season-tag">🌿 {selectedDay.factors.season}</span>
            )}
          </div>
          <div className="room-prices-grid">
            {Object.entries(roomConfig).map(([id, room]) => {
              const price = calculateRoomPrice(room.basePrice, room.increment, selectedDay.multiplier);
              return (
                <div key={id} className="room-price-card">
                  <span className="room-name">{room.name}</span>
                  <span className="room-price">${price}</span>
                  <span className="room-breakdown">
                    ${room.basePrice} base {room.increment > 0 && `+ $${room.increment}`} × {selectedDay.multiplier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Summary */}
      {days.length > 0 && (
        <div className="monthly-summary">
          <div className="summary-item">
            <span className="summary-label">Avg Multiplier</span>
            <span className="summary-value">×{(days.reduce((sum, d) => sum + parseFloat(d.multiplier), 0) / days.length).toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Low Days</span>
            <span className="summary-value">{days.filter(d => parseFloat(d.multiplier) <= 1.0).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">High Days</span>
            <span className="summary-value">{days.filter(d => parseFloat(d.multiplier) >= 1.3).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Events</span>
            <span className="summary-value">{days.filter(d => d.factors?.event).length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// REVENUE FORECAST VIEW
// ============================================
function RevenueForecastView() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentMonth = new Date().getMonth(); // 0-indexed

  // Fetch real historical data from Cloudbeds
  useEffect(() => {
    async function fetchRevenueData() {
      setLoading(true);
      try {
        const data = await getHistoricalRevenue();
        setRevenueData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
        setError('Failed to load revenue data from Cloudbeds');
      } finally {
        setLoading(false);
      }
    }
    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="forecast-view">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading revenue data from Cloudbeds...</p>
        </div>
      </div>
    );
  }

  if (error || !revenueData) {
    return (
      <div className="forecast-view">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error || 'No revenue data available'}</p>
          <p className="error-sub">Make sure the server has cached reservation data from Cloudbeds</p>
        </div>
      </div>
    );
  }

  // Get sorted years
  const years = Object.keys(revenueData.years || {}).map(Number).sort();
  const historicalYears = revenueData.years || {};
  const forecast2026 = revenueData.forecast2026;
  const bookingsOnBooks2026 = revenueData.bookingsOnBooks2026 || 0;

  // Calculate metrics
  const latestYear = years[years.length - 1];
  const latestYearTotal = historicalYears[latestYear]?.total || 0;
  const forecastTotal = forecast2026?.total || latestYearTotal * 1.06;
  
  // Calculate booking pace - what % of forecast is already booked
  const expectedBookedByNow = (forecastTotal * (currentMonth + 1)) / 12;
  const onTrackPercentage = expectedBookedByNow > 0 
    ? ((bookingsOnBooks2026 / expectedBookedByNow) * 100).toFixed(1)
    : '0';
  const isOnTrack = parseFloat(onTrackPercentage) >= 95;

  // Generate monthly tracker data
  const trackerData = MONTH_NAMES.map((month, idx) => {
    const forecastValue = forecast2026?.monthly?.[idx] || 0;
    // Use actual data from historical for completed months, null for future
    const actual = idx <= currentMonth && historicalYears[2026]?.monthly?.[idx] 
      ? historicalYears[2026].monthly[idx] 
      : (idx <= currentMonth && historicalYears[latestYear]?.monthly?.[idx]
        ? historicalYears[latestYear].monthly[idx] // Use latest year's actual as proxy
        : null);
    const variance = actual && forecastValue ? ((actual - forecastValue) / forecastValue * 100).toFixed(1) : null;
    return {
      month,
      forecast: forecastValue,
      actual,
      variance,
      isPositive: variance ? parseFloat(variance) >= 0 : null
    };
  });

  // Calculate YTD totals
  const ytdForecast = trackerData.slice(0, currentMonth + 1).reduce((sum, m) => sum + m.forecast, 0);
  const ytdActual = trackerData.slice(0, currentMonth + 1).reduce((sum, m) => sum + (m.actual || 0), 0);
  const ytdVariance = ytdForecast > 0 ? ((ytdActual - ytdForecast) / ytdForecast * 100).toFixed(1) : '0';

  // Calculate growth rate from historical data
  const growthRate = years.length >= 2 && historicalYears[years[years.length - 2]]?.total > 0
    ? (((historicalYears[latestYear]?.total || 0) - (historicalYears[years[years.length - 2]]?.total || 0)) 
       / (historicalYears[years[years.length - 2]]?.total || 1) * 100).toFixed(1)
    : '6.0';

  // Find peak months
  const sortedMonths = [...MONTH_NAMES].map((m, i) => ({ 
    name: m, 
    value: forecast2026?.monthly?.[i] || 0 
  })).sort((a, b) => b.value - a.value);
  const peakMonths = sortedMonths.slice(0, 2).map(m => m.name).join(' & ');

  return (
    <div className="forecast-view">
      {/* Data Source Notice */}
      <div className="data-source-notice">
        <span className="source-icon">📊</span>
        <span>Revenue data from {revenueData.totalReservationsAnalyzed || 0} Cloudbeds reservations</span>
      </div>

      {/* Headline Metrics */}
      <div className="forecast-headline">
        <div className="headline-card main">
          <span className="headline-label">2026 Revenue Forecast</span>
          <span className="headline-value">${(forecastTotal / 1000).toFixed(0)}K</span>
          <span className="headline-sub" title={forecast2026?.methodology}>
            {forecast2026?.basedOn || `Based on ${growthRate}% YoY growth`}
          </span>
        </div>
        <div className="headline-card">
          <span className="headline-label">2026 Bookings on Books</span>
          <span className="headline-value">${(bookingsOnBooks2026 / 1000).toFixed(0)}K</span>
          <span className="headline-sub">Future reservations in system</span>
        </div>
        <div className={`headline-card ${isOnTrack ? 'positive' : 'negative'}`}>
          <span className="headline-label">Booking Pace</span>
          <span className="headline-value">{onTrackPercentage}%</span>
          <span className="headline-sub">{isOnTrack ? '✓ On Track' : '⚠ Behind Pace'}</span>
        </div>
      </div>

      {/* Historical Comparison */}
      <div className="historical-comparison">
        <h3>Year-over-Year Revenue (from Cloudbeds)</h3>
        <div className="yoy-bars">
          {years.map(year => (
            <div key={year} className="yoy-bar">
              <span className="yoy-year">{year}</span>
              <div 
                className="yoy-bar-fill" 
                style={{ width: `${(historicalYears[year]?.total / forecastTotal) * 100}%` }}
              >
                <span>${(historicalYears[year]?.total / 1000).toFixed(0)}K</span>
                <span className="booking-count">({historicalYears[year]?.bookingCount} bookings)</span>
              </div>
            </div>
          ))}
          <div className="yoy-bar forecast">
            <span className="yoy-year">2026</span>
            <div className="yoy-bar-fill" style={{ width: '100%' }}>
              <span>${(forecastTotal / 1000).toFixed(0)}K (Forecast)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Tracker */}
      <div className="monthly-tracker">
        <h3>Monthly Revenue Tracker - 2026</h3>
        <div className="tracker-header">
          <span>Month</span>
          <span>Forecast</span>
          <span>Actual</span>
          <span>Variance</span>
          <span>Status</span>
        </div>
        <div className="tracker-body">
          {trackerData.map((row, idx) => (
            <div key={row.month} className={`tracker-row ${idx <= currentMonth ? '' : 'future'}`}>
              <span className="tracker-month">{row.month}</span>
              <span className="tracker-forecast">
                {row.forecast > 0 ? `$${(row.forecast / 1000).toFixed(1)}K` : '—'}
              </span>
              <span className="tracker-actual">
                {row.actual ? `$${(row.actual / 1000).toFixed(1)}K` : '—'}
              </span>
              <span className={`tracker-variance ${row.isPositive ? 'positive' : row.isPositive === false ? 'negative' : ''}`}>
                {row.variance ? `${row.isPositive ? '+' : ''}${row.variance}%` : '—'}
              </span>
              <span className="tracker-status">
                {idx <= currentMonth && row.actual ? (
                  row.isPositive ? '✓' : '⚠'
                ) : (
                  <span className="future-dot">○</span>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="tracker-footer">
          <span className="tracker-month">YTD Total</span>
          <span className="tracker-forecast">
            {ytdForecast > 0 ? `$${(ytdForecast / 1000).toFixed(1)}K` : '—'}
          </span>
          <span className="tracker-actual">
            {ytdActual > 0 ? `$${(ytdActual / 1000).toFixed(1)}K` : '—'}
          </span>
          <span className={`tracker-variance ${parseFloat(ytdVariance) >= 0 ? 'positive' : 'negative'}`}>
            {ytdForecast > 0 ? `${parseFloat(ytdVariance) >= 0 ? '+' : ''}${ytdVariance}%` : '—'}
          </span>
          <span className="tracker-status">{parseFloat(ytdVariance) >= 0 ? '✓' : '⚠'}</span>
        </div>
      </div>

      {/* Insights */}
      <div className="forecast-insights">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-icon">📈</span>
            <span className="insight-title">Peak Months</span>
            <span className="insight-text">{peakMonths} expected to be highest revenue months</span>
          </div>
          <div className="insight-card">
            <span className="insight-icon">🎯</span>
            <span className="insight-title">Growth Target</span>
            <span className="insight-text">
              {forecast2026?.growthRate || `${growthRate}%`} increase projected for 2026
              <div className="methodology-note">
                <small>{forecast2026?.methodology}</small>
              </div>
            </span>
          </div>
          <div className="insight-card">
            <span className="insight-icon">📊</span>
            <span className="insight-title">Data Quality</span>
            <span className="insight-text">{revenueData.totalReservationsAnalyzed} reservations analyzed from Cloudbeds</span>
          </div>
          <div className="insight-card">
            <span className="insight-icon">⚡</span>
            <span className="insight-title">Booking Velocity</span>
            <span className="insight-text">
              {bookingsOnBooks2026 > 0 
                ? `$${(bookingsOnBooks2026 / 1000).toFixed(0)}K already booked for 2026`
                : 'No 2026 bookings yet in system'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONFIGURATION VIEW
// ============================================
function ConfigurationView({ roomConfig, setRoomConfig }) {
  const [tempConfig, setTempConfig] = useState(roomConfig);
  const [saved, setSaved] = useState(false);

  const handleIncrementChange = (roomId, value) => {
    setTempConfig(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        increment: parseInt(value) || 0
      }
    }));
    setSaved(false);
  };

  const handleBasePriceChange = (roomId, value) => {
    setTempConfig(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        basePrice: parseInt(value) || 0
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setRoomConfig(tempConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setTempConfig(DEFAULT_ROOM_CONFIG);
    setSaved(false);
  };

  // Calculate example prices with a 1.25x multiplier
  const exampleMultiplier = 1.25;

  return (
    <div className="config-view">
      <div className="config-header">
        <h2>Room Pricing Configuration</h2>
        <p>Set base prices and increments for each room type. The daily multiplier from the calendar applies to (Base + Increment).</p>
      </div>

      <div className="config-formula">
        <span className="formula-label">Pricing Formula:</span>
        <span className="formula">Daily Rate = (Base Price + Increment) × Daily Multiplier</span>
      </div>

      <div className="config-table">
        <div className="config-table-header">
          <span>Room Type</span>
          <span>Base Price</span>
          <span>Increment</span>
          <span>Total Base</span>
          <span>Example (×{exampleMultiplier})</span>
        </div>
        {Object.entries(tempConfig).map(([id, room]) => (
          <div key={id} className="config-row">
            <span className="config-room-name">{room.name}</span>
            <span className="config-input-wrap">
              <span className="currency">$</span>
              <input
                type="number"
                value={room.basePrice}
                onChange={(e) => handleBasePriceChange(id, e.target.value)}
                className="config-input"
              />
            </span>
            <span className="config-input-wrap">
              <span className="currency">+$</span>
              <input
                type="number"
                value={room.increment}
                onChange={(e) => handleIncrementChange(id, e.target.value)}
                className="config-input"
              />
            </span>
            <span className="config-total">${room.basePrice + room.increment}</span>
            <span className="config-example">${Math.round((room.basePrice + room.increment) * exampleMultiplier)}</span>
          </div>
        ))}
      </div>

      <div className="config-actions">
        <button className="reset-btn" onClick={handleReset}>Reset to Defaults</button>
        <button className="save-btn" onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="config-note">
        <strong>Note:</strong> Changes are saved locally and will persist across sessions. The daily multiplier is calculated automatically based on seasonality, day of week, special events, and demand factors.
      </div>
    </div>
  );
}
