import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { format, addMonths, differenceInDays, parseISO } from 'date-fns';
import { getAvailability, createReservation } from '../services/api';
import './GuestBookingApp.css';

// Stripe Publishable Key (Test Mode)
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SGbzeK8c0fspdPZ8LUOXraAs2qj2uqSWKrs4xRGyPqKO4LydYqu5xyQDgJMgux9GV8H7HfIyJ2pbs14mLV7G48Y00vurWird0';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// ============================================================================
// PROPERTY INFORMATION (from Cloudbeds)
// ============================================================================
const PROPERTY_INFO = {
  name: 'Hennessey Estate',
  tagline: 'A Victorian Sanctuary in the Heart of Napa Valley',
  description: `A timeless blend of historic charm and modern elegance, Hennessey House is a fully remodeled Victorian estate set in the heart of downtown Napa. Originally built in the late 19th century, this Stick-Eastlake architectural gem has been thoughtfully restored in 2025 to preserve its rich heritage while offering a sophisticated, contemporary retreat for today's travelers.

Step inside to discover a world of understated luxury, where minimalist-chic interiors complement the home's ornate Victorian craftsmanship. The estate's gracefully detailed façade, wrap-around porch, and hand-painted pressed tin ceiling offer a glimpse into Napa's storied past, while carefully curated modern touches ensure a seamless, elevated experience.

With ten refined guest rooms, including a separate Carriage House with high ceilings and fireplaces, Hennessey House provides an intimate escape designed exclusively for couples. Plush California king beds, spa-inspired baths, and a tranquil ambiance create the perfect setting for relaxation between wine tastings and Napa's world-class dining.

Nestled just three blocks from the vibrant energy of downtown, guests can easily explore renowned restaurants, boutique shopping, and live music, all within walking distance.`,
  address: {
    street: '1727 Main St',
    city: 'Napa',
    state: 'California',
    zip: '94559',
    country: 'US'
  },
  contact: {
    email: 'info@hennesseyestate.com'
  },
  policies: {
    checkIn: '4:00 PM',
    checkOut: '11:00 AM',
    cancellation: {
      individual: 'No refund if canceled within 5 days of arrival.',
      buyout: 'No refund if canceled within 30 days of arrival.'
    },
    deposit: 'At time of booking, Hennessey Estate requires 1 night equivalent payment as deposit.',
    quietHours: '10:00 PM to 7:00 AM',
    poolHours: '8:00 AM to 9:00 PM',
    breakfast: '8:00 AM to 9:30 AM daily'
  },
  amenities: [
    { name: 'Swimming Pool', icon: '🏊' },
    { name: 'Complimentary Breakfast', icon: '🍳' },
    { name: 'Free Parking', icon: '🅿️' },
    { name: 'Concierge Service', icon: '🛎️' },
    { name: 'Air Conditioning', icon: '❄️' },
    { name: 'Welcome Drink', icon: '🥂' },
    { name: 'Lounge', icon: '🛋️' },
    { name: '24-Hour Check-in', icon: '🔑' },
    { name: 'Contactless Check-in', icon: '📱' },
    { name: 'Baggage Storage', icon: '🧳' },
    { name: 'Bottled Water', icon: '💧' },
    { name: 'Spa & Wellness', icon: '💆' }
  ],
  highlights: [
    'Historic 1890s Victorian Estate',
    'Award-winning restoration (2025)',
    '3 blocks from Downtown Napa',
    'Couples-focused intimate retreat',
    'California King beds throughout',
    'Spa-inspired bathrooms'
  ]
};

// Utility function to clean HTML from room descriptions
const cleanHtmlText = (html) => {
  if (!html) return '';
  // Replace &nbsp; with space
  let text = html.replace(/&nbsp;/g, ' ');
  // Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');
  // Clean up multiple spaces
  text = text.replace(/\s+/g, ' ').trim();
  return text;
};

// Booking Types
const BOOKING_TYPES = {
  INDIVIDUAL: 'individual',
  BUYOUT: 'buyout'
};

// Estate Buyout Configuration
const ESTATE_CONFIG = {
  totalRooms: 10,
  maxGuests: 20,
  minNights: 2,
  baseNightlyRate: 4500,
  depositPercent: 50,
  taxRate: 0.15,
};

// Booking Steps
const STEPS = {
  DATES: 0,
  ROOMS: 1,
  ADDONS: 2,
  GUEST: 3,
  PAYMENT: 4,
  CONFIRMATION: 5
};

// Get visible steps based on booking type
const getStepsForType = (bookingType) => {
  if (bookingType === BOOKING_TYPES.BUYOUT) {
    return ['Dates', 'Details', 'Payment', 'Confirmed'];
  }
  return ['Dates', 'Room', 'Extras', 'Details', 'Payment', 'Confirmed'];
};

// Map logical step index to display index for progress bar
const getDisplayStepIndex = (step, bookingType) => {
  if (bookingType === BOOKING_TYPES.BUYOUT) {
    // Buyout: DATES(0)->0, GUEST(3)->1, PAYMENT(4)->2, CONFIRMATION(5)->3
    if (step === STEPS.DATES) return 0;
    if (step === STEPS.GUEST) return 1;
    if (step === STEPS.PAYMENT) return 2;
    if (step === STEPS.CONFIRMATION) return 3;
    return 0;
  }
  return step;
};

// Add-ons available at Hennessey Estate
const AVAILABLE_ADDONS = [
  {
    id: 'breakfast',
    name: 'Daily Gourmet Breakfast',
    description: 'Farm-to-table breakfast served in our sunlit dining room',
    price: 45,
    priceType: 'per_person_per_day',
    icon: '🍳'
  },
  {
    id: 'cleaning',
    name: 'Daily Housekeeping',
    description: 'Full room refresh with fresh linens and amenities',
    price: 75,
    priceType: 'per_day',
    icon: '🧹'
  },
  {
    id: 'wine_tasting',
    name: 'Private Wine Tasting',
    description: 'Curated tasting of Napa Valley\'s finest wines',
    price: 150,
    priceType: 'per_person',
    icon: '🍷'
  },
  {
    id: 'spa',
    name: 'In-Room Spa Treatment',
    description: 'Relaxing massage or facial in the comfort of your suite',
    price: 200,
    priceType: 'per_session',
    icon: '💆'
  },
  {
    id: 'airport_transfer',
    name: 'Airport Transfer',
    description: 'Luxury vehicle pickup from SFO or OAK',
    price: 250,
    priceType: 'one_time',
    icon: '🚗'
  },
  {
    id: 'romance',
    name: 'Romance Package',
    description: 'Rose petals, champagne, and chocolate-covered strawberries',
    price: 175,
    priceType: 'one_time',
    icon: '💕'
  }
];

// ============================================================================
// DATE RANGE CALENDAR COMPONENT
// ============================================================================
const DateRangeCalendar = ({ checkIn, checkOut, onDateSelect, selectionMode }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate calendar days for a month
  const generateCalendarDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];
    
    // Add empty cells for padding
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const checkInDate = checkIn ? parseISO(checkIn) : null;
  const checkOutDate = checkOut ? parseISO(checkOut) : null;
  
  const isDateInRange = (date) => {
    if (!date || !checkInDate) return false;
    
    if (checkOutDate) {
      return date > checkInDate && date < checkOutDate;
    }
    
    // Show hover range when selecting check-out
    if (selectionMode === 'checkOut' && hoverDate && date > checkInDate && date <= hoverDate) {
      return true;
    }
    
    return false;
  };
  
  const isDateDisabled = (date) => {
    if (!date) return true;
    if (date < today) return true;
    if (selectionMode === 'checkOut' && checkInDate && date <= checkInDate) return true;
    return false;
  };
  
  const isCheckIn = (date) => {
    if (!date || !checkInDate) return false;
    return date.toDateString() === checkInDate.toDateString();
  };
  
  const isCheckOut = (date) => {
    if (!date || !checkOutDate) return false;
    return date.toDateString() === checkOutDate.toDateString();
  };
  
  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    onDateSelect(format(date, 'yyyy-MM-dd'));
  };
  
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const renderMonth = (monthDate) => {
    const days = generateCalendarDays(monthDate);
    
    return (
      <div className="calendar-month">
        <div className="calendar-month-header">
          {format(monthDate, 'MMMM yyyy')}
        </div>
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="calendar-day empty" />;
            }
            
            const disabled = isDateDisabled(date);
            const isStart = isCheckIn(date);
            const isEnd = isCheckOut(date);
            const inRange = isDateInRange(date);
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <div
                key={date.toISOString()}
                className={`calendar-day ${disabled ? 'disabled' : ''} ${isStart ? 'check-in' : ''} ${isEnd ? 'check-out' : ''} ${inRange ? 'in-range' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => !disabled && handleDateClick(date)}
                onMouseEnter={() => !disabled && selectionMode === 'checkOut' && setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
              >
                <span>{date.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="date-range-calendar">
      <div className="calendar-navigation">
        <button 
          className="nav-btn prev" 
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          disabled={currentMonth <= today}
        >
          ‹
        </button>
        <button 
          className="nav-btn next" 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          ›
        </button>
      </div>
      <div className="calendar-months single">
        {renderMonth(currentMonth)}
      </div>
    </div>
  );
};

// ============================================================================
// STEP 1: Date Selection + Booking Type
// ============================================================================
const DateSelection = ({ dates, setDates, bookingType, setBookingType, onNext }) => {
  const [selectionMode, setSelectionMode] = useState('checkIn');
  const [calendarVisible, setCalendarVisible] = useState(false);
  
  const handleDateSelect = (dateStr) => {
    if (selectionMode === 'checkIn') {
      setDates(prev => ({
        ...prev,
        checkIn: dateStr,
        checkOut: prev.checkOut <= dateStr ? '' : prev.checkOut
      }));
      setSelectionMode('checkOut');
    } else {
      setDates(prev => ({
        ...prev,
        checkOut: dateStr
      }));
      setSelectionMode('checkIn');
      // Hide calendar after selecting check-out
      setCalendarVisible(false);
    }
  };
  
  const handleDateBoxClick = (mode) => {
    setSelectionMode(mode);
    setCalendarVisible(true);
  };
  
  const clearDates = () => {
    setDates(prev => ({
      ...prev,
      checkIn: '',
      checkOut: ''
    }));
    setSelectionMode('checkIn');
    setCalendarVisible(true);
  };

  const isValid = dates.checkIn && dates.checkOut && dates.checkIn < dates.checkOut;
  const nights = isValid ? differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn)) : 0;

  return (
    <div className="booking-step date-selection">
      <div className="step-header">
        <h2>When would you like to stay?</h2>
        <p>Select your dates on the calendar below</p>
      </div>

      {/* Date Display Boxes */}
      <div className="date-display-row">
        <div 
          className={`date-display-box ${selectionMode === 'checkIn' ? 'active' : ''} ${dates.checkIn ? 'has-date' : ''}`}
          onClick={() => handleDateBoxClick('checkIn')}
        >
          <span className="date-label">Check-in</span>
          <span className="date-value">
            {dates.checkIn ? format(parseISO(dates.checkIn), 'EEE, MMM d') : 'Select date'}
          </span>
        </div>
        <div className="date-display-arrow">
          {nights > 0 && <span className="nights-badge">{nights} night{nights !== 1 ? 's' : ''}</span>}
          <span className="arrow">→</span>
        </div>
        <div 
          className={`date-display-box ${selectionMode === 'checkOut' ? 'active' : ''} ${dates.checkOut ? 'has-date' : ''}`}
          onClick={() => handleDateBoxClick('checkOut')}
        >
          <span className="date-label">Check-out</span>
          <span className="date-value">
            {dates.checkOut ? format(parseISO(dates.checkOut), 'EEE, MMM d') : 'Select date'}
          </span>
        </div>
        {(dates.checkIn || dates.checkOut) && (
          <button className="clear-dates-btn" onClick={clearDates} title="Clear dates">×</button>
        )}
      </div>

      {/* Calendar */}
      {calendarVisible && (
        <DateRangeCalendar
          checkIn={dates.checkIn}
          checkOut={dates.checkOut}
          onDateSelect={handleDateSelect}
          selectionMode={selectionMode}
        />
      )}

      {/* Booking Type Selection */}
      <div className="booking-type-selector">
        <span className="booking-type-label">Select Your Experience</span>
        <div className="booking-type-options">
          <div 
            className={`booking-type-option ${bookingType === BOOKING_TYPES.INDIVIDUAL ? 'selected' : ''}`}
            onClick={() => setBookingType(BOOKING_TYPES.INDIVIDUAL)}
          >
            <span className="option-title">Individual Room</span>
            <span className="option-desc">Reserve one or more rooms for your stay</span>
          </div>
          <div 
            className={`booking-type-option ${bookingType === BOOKING_TYPES.BUYOUT ? 'selected' : ''}`}
            onClick={() => setBookingType(BOOKING_TYPES.BUYOUT)}
          >
            <span className="option-title">Full Estate Buyout</span>
            <span className="option-desc">Exclusive access · {ESTATE_CONFIG.totalRooms} rooms · Up to {ESTATE_CONFIG.maxGuests} guests</span>
          </div>
        </div>
      </div>

      {/* Guest Count - Different for each booking type */}
      {bookingType === BOOKING_TYPES.INDIVIDUAL ? (
        <div className="guest-count">
          <div className="count-field">
            <label>Adults</label>
            <select 
              value={dates.adults} 
              onChange={(e) => setDates(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="count-field">
            <label>Children</label>
            <select 
              value={dates.children} 
              onChange={(e) => setDates(prev => ({ ...prev, children: parseInt(e.target.value) }))}
            >
              {[0, 1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="guest-count buyout-guests">
          <div className="count-field">
            <label>Total Guests</label>
            <select 
              value={dates.adults} 
              onChange={(e) => setDates(prev => ({ ...prev, adults: parseInt(e.target.value), children: 0 }))}
            >
              {Array.from({ length: ESTATE_CONFIG.maxGuests - 1 }, (_, i) => i + 2).map(n => (
                <option key={n} value={n}>{n} guests</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Buyout Pricing Preview */}
      {bookingType === BOOKING_TYPES.BUYOUT && nights >= ESTATE_CONFIG.minNights && (
        <div className="buyout-pricing-preview">
          <div className="pricing-row">
            <span>Estate ({nights} nights × ${ESTATE_CONFIG.baseNightlyRate.toLocaleString()})</span>
            <span>${(ESTATE_CONFIG.baseNightlyRate * nights).toLocaleString()}</span>
          </div>
          <div className="pricing-row total">
            <span>Estimated Total (incl. 15% tax)</span>
            <span>${Math.round(ESTATE_CONFIG.baseNightlyRate * nights * 1.15).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Minimum nights warning for buyout */}
      {bookingType === BOOKING_TYPES.BUYOUT && nights > 0 && nights < ESTATE_CONFIG.minNights && (
        <div className="buyout-warning">
          Full Estate Buyout requires a minimum of {ESTATE_CONFIG.minNights} nights
        </div>
      )}

      <button 
        className="btn-next" 
        onClick={onNext}
        disabled={bookingType === BOOKING_TYPES.BUYOUT ? nights < ESTATE_CONFIG.minNights : !isValid}
      >
        {bookingType === BOOKING_TYPES.BUYOUT ? 'Continue' : 'Search Available Rooms'}
      </button>

      {/* Property Info Section */}
      <div className="property-info-section">
        <div className="property-hero">
          <img 
            src="/logo.png" 
            alt="Hennessey Estate - Est. 1889" 
            className="property-hero-logo"
          />
          <h3>{PROPERTY_INFO.tagline}</h3>
        </div>
        
        <div className="property-description">
          <p>{PROPERTY_INFO.description.split('\n\n')[0]}</p>
        </div>

        <div className="property-highlights">
          <h4>Highlights</h4>
          <div className="highlights-grid">
            {PROPERTY_INFO.highlights.map((highlight, idx) => (
              <span key={idx} className="highlight-tag">✓ {highlight}</span>
            ))}
          </div>
        </div>

        <div className="property-amenities">
          <h4>Amenities</h4>
          <div className="amenities-grid">
            {PROPERTY_INFO.amenities.map((amenity, idx) => (
              <span key={idx} className="amenity-tag">
                <span className="amenity-icon">{amenity.icon}</span>
                {amenity.name}
              </span>
            ))}
          </div>
        </div>

        <div className="property-policies">
          <h4>Policies</h4>
          <div className="policies-grid">
            <div className="policy-item">
              <span className="policy-label">Check-in</span>
              <span className="policy-value">{PROPERTY_INFO.policies.checkIn}</span>
            </div>
            <div className="policy-item">
              <span className="policy-label">Check-out</span>
              <span className="policy-value">{PROPERTY_INFO.policies.checkOut}</span>
            </div>
            <div className="policy-item">
              <span className="policy-label">Breakfast</span>
              <span className="policy-value">{PROPERTY_INFO.policies.breakfast}</span>
            </div>
            <div className="policy-item">
              <span className="policy-label">Pool Hours</span>
              <span className="policy-value">{PROPERTY_INFO.policies.poolHours}</span>
            </div>
          </div>
          <div className="cancellation-policy">
            <h5>Cancellation Policy</h5>
            <p><strong>Individual Rooms:</strong> {PROPERTY_INFO.policies.cancellation.individual}</p>
            <p><strong>Full Property Buyout:</strong> {PROPERTY_INFO.policies.cancellation.buyout}</p>
          </div>
        </div>

        <div className="property-contact">
          <h4>Contact & Location</h4>
          <p className="address">
            {PROPERTY_INFO.address.street}<br />
            {PROPERTY_INFO.address.city}, {PROPERTY_INFO.address.state} {PROPERTY_INFO.address.zip}
          </p>
          <p className="contact-links">
            <a href={`mailto:${PROPERTY_INFO.contact.email}`}>{PROPERTY_INFO.contact.email}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 2: Room Selection (with Total Buyout support)
// ============================================================================
const TOTAL_BUYOUT_KEYWORDS = ['total buyout', 'entire property', 'full property'];

const isTotalBuyoutRoom = (room) => {
  const name = (room.roomTypeName || '').toLowerCase();
  return TOTAL_BUYOUT_KEYWORDS.some(kw => name.includes(kw));
};

const RoomSelection = ({ dates, rooms, loading, selectedRoom, setSelectedRoom, onNext, onBack, totalBuyoutStatus }) => {
  const nights = differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn));

  if (loading) {
    return (
      <div className="booking-step room-selection">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Finding available rooms...</p>
        </div>
      </div>
    );
  }

  // Separate Total Buyout from individual rooms
  const totalBuyoutRoom = rooms.find(r => isTotalBuyoutRoom(r) && r.roomsAvailable > 0);
  const individualRooms = rooms.filter(r => !isTotalBuyoutRoom(r) && r.roomsAvailable > 0);
  const allAvailableRooms = rooms.filter(r => r.roomsAvailable > 0);
  
  // Check if selected room is Total Buyout
  const selectedIsTotalBuyout = selectedRoom && isTotalBuyoutRoom(selectedRoom);

  return (
    <div className="booking-step room-selection">
      <div className="step-header">
        <h2>Choose Your Room</h2>
        <p>{allAvailableRooms.length} option{allAvailableRooms.length !== 1 ? 's' : ''} available for {nights} night{nights !== 1 ? 's' : ''}</p>
        <button className="btn-link" onClick={onBack}>← Change dates</button>
      </div>

      {/* Total Buyout Status Message */}
      {totalBuyoutStatus?.totalBuyoutBooked && (
        <div className="buyout-notice buyout-active">
          <span className="notice-icon">🏠</span>
          <div>
            <strong>Property Exclusively Booked</strong>
            <p>The entire property is reserved for a private event during these dates.</p>
          </div>
        </div>
      )}

      {allAvailableRooms.length === 0 ? (
        <div className="no-rooms">
          <p>No rooms available for these dates. Please try different dates.</p>
          <button className="btn-secondary" onClick={onBack}>Change Dates</button>
        </div>
      ) : (
        <>
          {/* Total Buyout Option (if available) */}
          {totalBuyoutRoom && (
            <div className="buyout-section">
              <div className="section-title">
                <span className="icon">🏠</span>
                <span>Exclusive Experience</span>
              </div>
              <div 
                className={`room-card buyout-card ${selectedRoom?.roomTypeId === totalBuyoutRoom.roomTypeId ? 'selected' : ''}`}
                onClick={() => setSelectedRoom(totalBuyoutRoom)}
              >
                <div className="room-header">
                  <h3>{totalBuyoutRoom.roomTypeName}</h3>
                  <span className="exclusive-badge">Private Estate</span>
                </div>
                
                <p className="room-description">
                  {cleanHtmlText(totalBuyoutRoom.roomTypeDescription) || 
                   'Reserve the entire Hennessey Estate exclusively for your group. All rooms, amenities, and grounds are yours alone for an unforgettable private experience.'}
                </p>
                
                <div className="buyout-features">
                  <span>✓ All rooms included</span>
                  <span>✓ Private pool & grounds</span>
                  <span>✓ Dedicated staff</span>
                  <span>✓ Perfect for events</span>
                </div>

                <div className="room-pricing">
                  <span className="price">${Math.round(totalBuyoutRoom.roomRate / nights).toLocaleString()}</span>
                  <span className="per-night">/ night</span>
                  <span className="total">${totalBuyoutRoom.roomRate?.toLocaleString()} total</span>
                </div>

                <button 
                  className={`btn-select ${selectedRoom?.roomTypeId === totalBuyoutRoom.roomTypeId ? 'selected' : ''}`}
                >
                  {selectedRoom?.roomTypeId === totalBuyoutRoom.roomTypeId ? '✓ Selected' : 'Reserve Entire Property'}
                </button>
              </div>
              
              {selectedIsTotalBuyout && (
                <div className="buyout-notice">
                  <span className="notice-icon">ℹ️</span>
                  <p>Total Buyout includes all rooms on the property. Your group will have exclusive access to the entire estate.</p>
                </div>
              )}
            </div>
          )}

          {/* Divider if both options available */}
          {totalBuyoutRoom && individualRooms.length > 0 && (
            <div className="room-divider">
              <span>or choose an individual room</span>
            </div>
          )}

          {/* Individual Rooms */}
          {individualRooms.length > 0 && (
            <div className="rooms-grid">
              {individualRooms.map(room => (
                <div 
                  key={room.roomTypeId} 
                  className={`room-card ${selectedRoom?.roomTypeId === room.roomTypeId ? 'selected' : ''}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="room-header">
                    <h3>{room.roomTypeName}</h3>
                    {room.roomsAvailable <= 2 && (
                      <span className="low-availability">Only {room.roomsAvailable} left!</span>
                    )}
                  </div>
                  
                  {room.roomTypeDescription && (
                    <p className="room-description">{cleanHtmlText(room.roomTypeDescription)}</p>
                  )}
                  
                  <div className="room-details">
                    {room.maxGuests && (
                      <span className="detail">👥 Up to {room.maxGuests} guests</span>
                    )}
                  </div>

                  <div className="room-pricing">
                    {room.roomRate ? (
                      <>
                        <span className="price">${Math.round(room.roomRate / nights).toLocaleString()}</span>
                        <span className="per-night">/ night</span>
                        <span className="total">${room.roomRate.toLocaleString()} total</span>
                      </>
                    ) : (
                      <span className="price-contact">Contact for pricing</span>
                    )}
                  </div>

                  <button 
                    className={`btn-select ${selectedRoom?.roomTypeId === room.roomTypeId ? 'selected' : ''}`}
                  >
                    {selectedRoom?.roomTypeId === room.roomTypeId ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedRoom && (
        <div className="selection-footer">
          <div className="selected-summary">
            <strong>{selectedRoom.roomTypeName}</strong>
            <span>${selectedRoom.roomRate?.toLocaleString()} for {nights} nights</span>
            {selectedIsTotalBuyout && <span className="buyout-tag">Exclusive</span>}
          </div>
          <button className="btn-next" onClick={onNext}>
            Continue to Add-ons
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STEP 3: Add-ons Selection
// ============================================================================
const AddonsSelection = ({ dates, selectedRoom, addons, setAddons, onNext, onBack }) => {
  const nights = differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn));
  const totalGuests = dates.adults + dates.children;

  const toggleAddon = (addonId) => {
    setAddons(prev => ({
      ...prev,
      [addonId]: !prev[addonId]
    }));
  };

  const calculateAddonPrice = (addon) => {
    switch (addon.priceType) {
      case 'per_person_per_day':
        return addon.price * totalGuests * nights;
      case 'per_day':
        return addon.price * nights;
      case 'per_person':
        return addon.price * totalGuests;
      default:
        return addon.price;
    }
  };

  const selectedAddons = AVAILABLE_ADDONS.filter(a => addons[a.id]);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + calculateAddonPrice(a), 0);
  const roomTotal = selectedRoom.roomRate; // roomRate from Cloudbeds is already total for the stay

  return (
    <div className="booking-step addons-selection">
      <div className="step-header">
        <h2>Enhance Your Stay</h2>
        <p>Add special experiences to make your visit unforgettable</p>
        <button className="btn-link" onClick={onBack}>← Back to rooms</button>
      </div>

      <div className="addons-grid">
        {AVAILABLE_ADDONS.map(addon => {
          const price = calculateAddonPrice(addon);
          const isSelected = addons[addon.id];
          
          return (
            <div 
              key={addon.id}
              className={`addon-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleAddon(addon.id)}
            >
              <div className="addon-icon">{addon.icon}</div>
              <div className="addon-content">
                <h4>{addon.name}</h4>
                <p>{addon.description}</p>
                <div className="addon-price">
                  <span className="price">${price}</span>
                  <span className="price-note">
                    {addon.priceType === 'per_person_per_day' && `($${addon.price}/person/day)`}
                    {addon.priceType === 'per_day' && `($${addon.price}/day)`}
                    {addon.priceType === 'per_person' && `($${addon.price}/person)`}
                    {addon.priceType === 'per_session' && '(per session)'}
                    {addon.priceType === 'one_time' && '(one-time)'}
                  </span>
                </div>
              </div>
              <div className="addon-checkbox">
                {isSelected ? '✓' : '+'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="addons-summary">
        <div className="summary-line">
          <span>Room ({nights} nights)</span>
          <span>${roomTotal.toLocaleString()}</span>
        </div>
        {selectedAddons.length > 0 && (
          <>
            <div className="summary-divider"></div>
            {selectedAddons.map(addon => (
              <div key={addon.id} className="summary-line addon-line">
                <span>{addon.name}</span>
                <span>${calculateAddonPrice(addon).toLocaleString()}</span>
              </div>
            ))}
          </>
        )}
        <div className="summary-divider"></div>
        <div className="summary-line total">
          <span>Subtotal</span>
          <span>${(roomTotal + addonsTotal).toLocaleString()}</span>
        </div>
      </div>

      <button className="btn-next" onClick={onNext}>
        Continue to Guest Details
      </button>

      <button className="btn-skip" onClick={onNext}>
        Skip add-ons →
      </button>
    </div>
  );
};

// ============================================================================
// STEP 4: Guest Details
// ============================================================================
const GuestDetails = ({ guest, setGuest, onNext, onBack, bookingType }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setGuest(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!guest.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!guest.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!guest.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) newErrors.email = 'Invalid email format';
    if (!guest.phone?.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="booking-step guest-details">
      <div className="step-header">
        <h2>Guest Information</h2>
        <p>Please provide your contact details</p>
        <button className="btn-link" onClick={onBack}>
          ← {bookingType === BOOKING_TYPES.BUYOUT ? 'Back to dates' : 'Back to add-ons'}
        </button>
      </div>

      <form className="guest-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
        <div className="form-row">
          <div className="form-field">
            <label>First Name *</label>
            <input
              type="text"
              value={guest.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
          </div>
          <div className="form-field">
            <label>Last Name *</label>
            <input
              type="text"
              value={guest.lastName || ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Email *</label>
            <input
              type="email"
              value={guest.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>
          <div className="form-field">
            <label>Phone *</label>
            <input
              type="tel"
              value={guest.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-section-title">Address (Optional)</div>

        <div className="form-field full-width">
          <label>Street Address</label>
          <input
            type="text"
            value={guest.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>City</label>
            <input
              type="text"
              value={guest.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>
          <div className="form-field small">
            <label>State</label>
            <input
              type="text"
              value={guest.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
            />
          </div>
          <div className="form-field small">
            <label>ZIP</label>
            <input
              type="text"
              value={guest.zip || ''}
              onChange={(e) => handleChange('zip', e.target.value)}
            />
          </div>
        </div>

        <div className="form-field full-width">
          <label>Special Requests</label>
          <textarea
            value={guest.specialRequests || ''}
            onChange={(e) => handleChange('specialRequests', e.target.value)}
            placeholder="Any special requests or notes for your stay..."
            rows={3}
          />
        </div>

        <button type="submit" className="btn-next">
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// STEP 5: Payment (Stripe Elements)
// ============================================================================
const PaymentFormInner = ({ 
  dates, 
  selectedRoom, 
  addons, 
  guest, 
  bookingType,
  onSuccess, 
  onBack,
  setIsProcessing 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const nights = differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn));
  const totalGuests = dates.adults + dates.children;
  const isBuyout = bookingType === BOOKING_TYPES.BUYOUT;

  const calculateAddonPrice = (addon) => {
    switch (addon.priceType) {
      case 'per_person_per_day':
        return addon.price * totalGuests * nights;
      case 'per_day':
        return addon.price * nights;
      case 'per_person':
        return addon.price * totalGuests;
      default:
        return addon.price;
    }
  };

  const selectedAddons = isBuyout ? [] : AVAILABLE_ADDONS.filter(a => addons[a.id]);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + calculateAddonPrice(a), 0);
  
  // Calculate room total based on booking type
  const roomTotal = isBuyout 
    ? ESTATE_CONFIG.baseNightlyRate * nights 
    : (selectedRoom?.roomRate || 0);
  
  const subtotal = roomTotal + addonsTotal;
  const taxes = subtotal * (isBuyout ? ESTATE_CONFIG.taxRate : 0.15);
  const total = subtotal + taxes;
  const deposit = isBuyout ? total * (ESTATE_CONFIG.depositPercent / 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setIsProcessing(true);
    setError(null);

    try {
      // Create a token from the card element
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, token } = await stripe.createToken(cardElement);

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        setIsProcessing(false);
        return;
      }

      // Send reservation with card token to backend
      const reservationData = {
        property_id: process.env.REACT_APP_PROPERTY_ID || '49705993547975',
        room_type_id: isBuyout ? 'ESTATE_BUYOUT' : selectedRoom.roomTypeId,
        check_in: dates.checkIn,
        check_out: dates.checkOut,
        guest: {
          first_name: guest.firstName,
          last_name: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          address: guest.address || '',
          city: guest.city || '',
          state: guest.state || '',
          zip: guest.zip || '',
          country: guest.country || 'US'
        },
        adults: dates.adults,
        children: isBuyout ? 0 : dates.children,
        notes: isBuyout 
          ? `Full Estate Buyout for ${dates.adults} guests. ${guest.specialRequests || ''}`
          : (guest.specialRequests || ''),
        // Stripe token for Cloudbeds vault
        cardToken: token.id,
        // Add-ons for custom fields
        addons: selectedAddons.map(a => ({
          id: a.id,
          name: a.name,
          price: calculateAddonPrice(a)
        })),
        // Booking type
        bookingType: bookingType,
        // Totals for reference
        totals: {
          room: roomTotal,
          addons: addonsTotal,
          taxes,
          total
        }
      };

      const result = await createReservation(reservationData);

      if (result.success || result.reservation) {
        onSuccess(result.reservation || result);
      } else {
        throw new Error(result.error || 'Failed to create reservation');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setProcessing(false);
      setIsProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#2d2d2d',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        '::placeholder': {
          color: '#999'
        }
      },
      invalid: {
        color: '#c23d4b'
      }
    }
  };

        return (
    <div className="booking-step payment-step">
      <div className="step-header">
        <h2>Secure Payment</h2>
        <p>
          {isBuyout 
            ? `${ESTATE_CONFIG.depositPercent}% deposit required. Balance due 14 days before arrival.`
            : 'Your card will be saved for check-in. You won\'t be charged now.'}
        </p>
        <button className="btn-link" onClick={onBack} disabled={processing}>← Back to guest details</button>
      </div>

      <div className="payment-layout">
        <div className="payment-form-container">
          <form onSubmit={handleSubmit}>
            <div className="card-element-wrapper">
              <label>Card Details</label>
              <div className="card-element">
                <CardElement options={cardStyle} />
              </div>
              <p className="card-hint">
                🔒 Your card information is encrypted and sent directly to Stripe. 
                We never see your full card number.
              </p>
            </div>

            {error && (
              <div className="error-banner">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="payment-note">
              {isBuyout ? (
                <>
                  <strong>Estate Buyout Deposit:</strong> You will be charged ${deposit.toLocaleString()} ({ESTATE_CONFIG.depositPercent}%) today. 
                  The remaining balance of ${(total - deposit).toLocaleString()} is due 14 days before arrival.
                </>
              ) : (
                <>
                  <strong>Note:</strong> Your card will be securely saved for your reservation. 
                  Payment will be processed at check-in by our staff.
                </>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-book"
              disabled={!stripe || processing}
            >
              {processing ? (
                <>
                  <span className="spinner-small"></span>
                  Processing...
                </>
              ) : (
                isBuyout ? `Pay $${deposit.toLocaleString()} Deposit` : 'Complete Booking'
              )}
                    </button>
          </form>
        </div>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          
          <div className="summary-section">
            <div className="summary-room">
              <strong>{isBuyout ? 'Full Estate Buyout' : selectedRoom?.roomTypeName}</strong>
              <span>{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
            <div className="summary-dates">
              {format(parseISO(dates.checkIn), 'MMM d')} - {format(parseISO(dates.checkOut), 'MMM d, yyyy')}
            </div>
            <div className="summary-guests">
              {isBuyout 
                ? `${dates.adults} guests · All ${ESTATE_CONFIG.totalRooms} rooms`
                : `${dates.adults} adult${dates.adults !== 1 ? 's' : ''}${dates.children > 0 ? `, ${dates.children} child${dates.children !== 1 ? 'ren' : ''}` : ''}`
              }
            </div>
          </div>

          <div className="summary-breakdown">
            <div className="breakdown-line">
              <span>{isBuyout ? `Estate (${nights} nights)` : 'Room'}</span>
              <span>${roomTotal.toLocaleString()}</span>
            </div>
            {selectedAddons.map(addon => (
              <div key={addon.id} className="breakdown-line addon">
                <span>{addon.name}</span>
                <span>${calculateAddonPrice(addon).toLocaleString()}</span>
              </div>
            ))}
            <div className="breakdown-line">
              <span>Taxes & Fees ({isBuyout ? '15%' : '15%'})</span>
              <span>${Math.round(taxes).toLocaleString()}</span>
            </div>
            <div className="breakdown-line total">
              <span>Total</span>
              <span>${Math.round(total).toLocaleString()}</span>
            </div>
            {isBuyout && (
              <>
                <div className="breakdown-line deposit">
                  <span>Due Today ({ESTATE_CONFIG.depositPercent}%)</span>
                  <span>${deposit.toLocaleString()}</span>
                </div>
                <div className="breakdown-line balance">
                  <span>Balance Due Later</span>
                  <span>${(total - deposit).toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="guest-summary">
            <strong>{guest.firstName} {guest.lastName}</strong>
            <span>{guest.email}</span>
            <span>{guest.phone}</span>
          </div>
        </div>
                </div>
            </div>
        );
};

const PaymentForm = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentFormInner {...props} />
  </Elements>
);

// ============================================================================
// STEP 6: Confirmation
// ============================================================================
const Confirmation = ({ reservation, dates, selectedRoom, guest, bookingType, onNewBooking }) => {
  const nights = differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn));
  const isBuyout = bookingType === BOOKING_TYPES.BUYOUT;

        return (
    <div className="booking-step confirmation">
      <div className="confirmation-header">
        <img 
          src="/logo.png" 
          alt="Hennessey Estate" 
          className="confirmation-logo"
        />
        <div className="success-icon">✓</div>
        <h2>{isBuyout ? 'Estate Buyout Confirmed!' : 'Booking Confirmed!'}</h2>
        <p>Thank you for choosing Hennessey Estate</p>
      </div>

      <div className="confirmation-card">
        <div className="confirmation-number">
          <label>Confirmation Number</label>
          <strong>{reservation?.reservationID || reservation?.reservation_id || 'HE-' + Date.now()}</strong>
        </div>

        <div className="confirmation-details">
          <div className="detail-row">
            <span className="label">Guest</span>
            <span className="value">{guest.firstName} {guest.lastName}</span>
          </div>
          <div className="detail-row">
            <span className="label">{isBuyout ? 'Booking' : 'Room'}</span>
            <span className="value">{isBuyout ? `Full Estate (${ESTATE_CONFIG.totalRooms} rooms)` : selectedRoom?.roomTypeName}</span>
          </div>
          {isBuyout && (
            <div className="detail-row">
              <span className="label">Guests</span>
              <span className="value">{dates.adults} guests</span>
            </div>
          )}
          <div className="detail-row">
            <span className="label">Check-in</span>
            <span className="value">{format(parseISO(dates.checkIn), 'EEEE, MMMM d, yyyy')} after {PROPERTY_INFO.policies.checkIn}</span>
          </div>
          <div className="detail-row">
            <span className="label">Check-out</span>
            <span className="value">{format(parseISO(dates.checkOut), 'EEEE, MMMM d, yyyy')} by {PROPERTY_INFO.policies.checkOut}</span>
          </div>
          <div className="detail-row">
            <span className="label">Duration</span>
            <span className="value">{nights} night{nights !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="confirmation-message">
          <p>
            A confirmation email has been sent to <strong>{guest.email}</strong>.
          </p>
          <p>
            {isBuyout 
              ? 'Your deposit has been processed. Our estate coordinator will contact you within 24 hours to discuss your event details.'
              : 'Your credit card has been securely saved. Payment will be processed at check-in.'
            }
          </p>
        </div>

        <div className="confirmation-contact">
          <p>Questions? Contact us:</p>
          <a href={`mailto:${PROPERTY_INFO.contact.email}`}>{PROPERTY_INFO.contact.email}</a>
        </div>

        <div className="confirmation-address">
          <p><strong>{PROPERTY_INFO.name}</strong></p>
          <p>{PROPERTY_INFO.address.street}</p>
          <p>{PROPERTY_INFO.address.city}, {PROPERTY_INFO.address.state} {PROPERTY_INFO.address.zip}</p>
        </div>
      </div>

      <button className="btn-new-booking" onClick={onNewBooking}>
        Book Another Stay
                </button>
            </div>
        );
};

// ============================================================================
// MAIN BOOKING APP
// ============================================================================
const GuestBookingApp = () => {
  const [step, setStep] = useState(STEPS.DATES);
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  const calendarRef = useRef(null);
  
  // Booking type state
  const [bookingType, setBookingType] = useState(BOOKING_TYPES.INDIVIDUAL);
  
  // Booking state
  const [dates, setDates] = useState({
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0
  });
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [addons, setAddons] = useState({});
  const [guest, setGuest] = useState({});
  const [reservation, setReservation] = useState(null);
  const [totalBuyoutStatus, setTotalBuyoutStatus] = useState(null);

  // Handle URL parameters for booking type
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    if (typeParam === 'buyout') {
      setBookingType(BOOKING_TYPES.BUYOUT);
      setDates(prev => ({ ...prev, adults: 10 })); // Default 10 guests for buyout
    }
    // Legacy support for old parameter
    if (params.get('buyout') === 'true') {
      setBookingType(BOOKING_TYPES.BUYOUT);
      setDates(prev => ({ ...prev, adults: 10 }));
    }
  }, [location.search]);

  // Set page title for SEO
  useEffect(() => {
    document.title = 'Book Your Stay | Hennessey Estate - Napa Valley B&B';
    
    // Update meta description for booking page
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Book your luxury stay at Hennessey Estate in downtown Napa Valley. Choose from 10 ensuite rooms with pool, spa, sauna access and chef-prepared breakfast included.');
    }
  }, []);

  // Fetch rooms when moving to room selection
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const result = await getAvailability(dates.checkIn, dates.checkOut);
      
      // Store Total Buyout status from API
      setTotalBuyoutStatus(result.totalBuyoutStatus || null);
      
      // Filter to unique room types with standard rates
      const uniqueRooms = [];
      const seen = new Set();
      for (const room of (result.availability || [])) {
        if (!seen.has(room.roomTypeId) && room.roomRate) {
          seen.add(room.roomTypeId);
          uniqueRooms.push(room);
        }
      }
      setRooms(uniqueRooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Handle step navigation
  const goToStep = (newStep) => {
    if (newStep === STEPS.ROOMS && step === STEPS.DATES) {
      fetchRooms();
    }
    setStep(newStep);
    window.scrollTo(0, 0);
  };

  // Get next step based on booking type
  const getNextStep = (currentStep) => {
    if (bookingType === BOOKING_TYPES.BUYOUT) {
      // Buyout flow: DATES -> GUEST -> PAYMENT -> CONFIRMATION
      if (currentStep === STEPS.DATES) return STEPS.GUEST;
      if (currentStep === STEPS.GUEST) return STEPS.PAYMENT;
      if (currentStep === STEPS.PAYMENT) return STEPS.CONFIRMATION;
    }
    // Individual flow: normal progression
    return currentStep + 1;
  };

  // Get previous step based on booking type
  const getPrevStep = (currentStep) => {
    if (bookingType === BOOKING_TYPES.BUYOUT) {
      // Buyout flow: DATES <- GUEST <- PAYMENT
      if (currentStep === STEPS.GUEST) return STEPS.DATES;
      if (currentStep === STEPS.PAYMENT) return STEPS.GUEST;
    }
    // Individual flow: normal progression
    return currentStep - 1;
  };

  // Reset booking
  const resetBooking = () => {
    setStep(STEPS.DATES);
    setBookingType(BOOKING_TYPES.INDIVIDUAL);
    setDates({
      checkIn: '',
      checkOut: '',
      adults: 2,
      children: 0
    });
    setRooms([]);
    setSelectedRoom(null);
    setAddons({});
    setGuest({});
    setReservation(null);
  };

  // Get steps for current booking type
  const visibleSteps = getStepsForType(bookingType);
  const displayStepIndex = getDisplayStepIndex(step, bookingType);

  return (
    <div className="guest-booking-app">
      {/* Header */}
        <header className="booking-header">
        <div className="header-content">
          <div className="logo" onClick={resetBooking}>
            <img 
              src="/logo.png" 
              alt="Hennessey Estate - Est. 1889" 
              className="logo-image"
            />
          </div>
          <div className="header-contact">
            <a href={`mailto:${PROPERTY_INFO.contact.email}`}>{PROPERTY_INFO.contact.email}</a>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {step < STEPS.CONFIRMATION && (
        <div className="progress-bar">
          {visibleSteps.slice(0, -1).map((label, idx) => (
            <div 
              key={label}
              className={`progress-step ${idx === displayStepIndex ? 'active' : ''} ${idx < displayStepIndex ? 'completed' : ''}`}
            >
            <div className="step-indicator">
                {idx < displayStepIndex ? '✓' : idx + 1}
              </div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="booking-main">
        {step === STEPS.DATES && (
          <div ref={calendarRef}>
            <DateSelection 
              dates={dates} 
              setDates={setDates}
              bookingType={bookingType}
              setBookingType={setBookingType}
              onNext={() => goToStep(getNextStep(STEPS.DATES))} 
            />
          </div>
        )}

        {step === STEPS.ROOMS && bookingType === BOOKING_TYPES.INDIVIDUAL && (
          <RoomSelection
            dates={dates}
            rooms={rooms}
            loading={loadingRooms}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            onNext={() => goToStep(STEPS.ADDONS)}
            onBack={() => goToStep(STEPS.DATES)}
            totalBuyoutStatus={totalBuyoutStatus}
          />
        )}

        {step === STEPS.ADDONS && bookingType === BOOKING_TYPES.INDIVIDUAL && (
          <AddonsSelection
            dates={dates}
            selectedRoom={selectedRoom}
            addons={addons}
            setAddons={setAddons}
            onNext={() => goToStep(STEPS.GUEST)}
            onBack={() => goToStep(STEPS.ROOMS)}
          />
        )}

        {step === STEPS.GUEST && (
          <GuestDetails
            guest={guest}
            setGuest={setGuest}
            onNext={() => goToStep(STEPS.PAYMENT)}
            onBack={() => goToStep(getPrevStep(STEPS.GUEST))}
            bookingType={bookingType}
          />
        )}

        {step === STEPS.PAYMENT && (
          <PaymentForm
            dates={dates}
            selectedRoom={selectedRoom}
            addons={addons}
            guest={guest}
            bookingType={bookingType}
            onSuccess={(res) => {
              setReservation(res);
              goToStep(STEPS.CONFIRMATION);
            }}
            onBack={() => goToStep(getPrevStep(STEPS.PAYMENT))}
            setIsProcessing={setIsProcessing}
          />
        )}

        {step === STEPS.CONFIRMATION && (
          <Confirmation
            reservation={reservation}
            dates={dates}
            selectedRoom={selectedRoom}
            guest={guest}
            bookingType={bookingType}
            onNewBooking={resetBooking}
          />
        )}
        </main>

      {/* Footer */}
      <footer className="booking-footer">
        <p>© 2026 Hennessey Estate · Napa Valley, California</p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </footer>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="spinner-large"></div>
            <p>Securing your reservation...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestBookingApp;
