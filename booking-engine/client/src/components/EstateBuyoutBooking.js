import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, addMonths, differenceInDays, parseISO } from 'date-fns';
import './GuestBookingApp.css';
import './EstateBuyoutBooking.css';

// ============================================================================
// ESTATE BUYOUT CONFIGURATION
// ============================================================================
const ESTATE_CONFIG = {
  totalRooms: 10,
  maxGuests: 20,
  minNights: 2,
  baseNightlyRate: 4500,
  depositPercent: 50,
  taxRate: 0.15,
};

const STEPS = { DATES: 0, GUEST: 1, PAYMENT: 2, CONFIRMATION: 3 };
const STEP_LABELS = ['Dates', 'Details', 'Payment', 'Confirmed'];

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
  
  const nextMonth = addMonths(currentMonth, 1);
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
      <div className="calendar-months">
        {renderMonth(currentMonth)}
        {renderMonth(nextMonth)}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const EstateBuyoutBooking = () => {
  const [step, setStep] = useState(STEPS.DATES);
  const [dates, setDates] = useState({
    checkIn: '',
    checkOut: '',
  });
  const [guests, setGuests] = useState(10);
  const [guest, setGuest] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectionMode, setSelectionMode] = useState('checkIn');
  const [calendarVisible, setCalendarVisible] = useState(true);

  useEffect(() => {
    document.title = 'Full Estate Buyout | Hennessey Estate';
    window.scrollTo(0, 0);
  }, [step]);

  const nights = dates.checkIn && dates.checkOut 
    ? differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn)) 
    : 0;

  // Calculate pricing
  const calculateTotal = () => {
    const roomTotal = ESTATE_CONFIG.baseNightlyRate * nights;
    const subtotal = roomTotal;
    const taxes = subtotal * ESTATE_CONFIG.taxRate;
    const total = subtotal + taxes;
    const deposit = total * ESTATE_CONFIG.depositPercent / 100;
    return { roomTotal, subtotal, taxes, total, deposit };
  };

  const pricing = calculateTotal();

  const goToStep = (newStep) => {
    setStep(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      setCalendarVisible(false);
    }
  };

  const handleDateBoxClick = (mode) => {
    setSelectionMode(mode);
    setCalendarVisible(true);
  };

  const clearDates = () => {
    setDates({ checkIn: '', checkOut: '' });
    setSelectionMode('checkIn');
    setCalendarVisible(true);
  };

  const validateGuest = () => {
    const newErrors = {};
    if (!guest.firstName?.trim()) newErrors.firstName = 'Required';
    if (!guest.lastName?.trim()) newErrors.lastName = 'Required';
    if (!guest.email?.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) newErrors.email = 'Invalid email';
    if (!guest.phone?.trim()) newErrors.phone = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setConfirmation({
        confirmationNumber: 'HE-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        ...pricing
      });
      goToStep(STEPS.CONFIRMATION);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="guest-booking-app">
      {/* Header */}
      <header className="booking-header">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="Hennessey Estate" className="logo-image" />
          </Link>
          <div className="header-contact">
            <span className="buyout-badge">Full Estate Buyout</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {step !== STEPS.CONFIRMATION && (
        <div className="progress-bar">
          {STEP_LABELS.slice(0, -1).map((label, idx) => (
            <div key={idx} className={`progress-step ${idx === step ? 'active' : ''} ${idx < step ? 'completed' : ''}`}>
              <span className="step-indicator">{idx < step ? '✓' : idx + 1}</span>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="booking-main">
        
        {/* STEP 1: Dates & Guests */}
        {step === STEPS.DATES && (
          <div className="booking-step date-selection">
            <div className="step-header">
              <h2>When would you like to stay?</h2>
              <p>Select your dates for a full estate buyout ({ESTATE_CONFIG.minNights} night minimum)</p>
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
            {calendarVisible ? (
              <DateRangeCalendar
                checkIn={dates.checkIn}
                checkOut={dates.checkOut}
                onDateSelect={handleDateSelect}
                selectionMode={selectionMode}
              />
            ) : (
              <button 
                className="btn-edit-dates"
                onClick={() => setCalendarVisible(true)}
              >
                Edit dates
              </button>
            )}

            <div className="guest-count">
              <div className="count-field">
                <label>Guests</label>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                  {Array.from({ length: ESTATE_CONFIG.maxGuests - 1 }, (_, i) => i + 2).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="estate-note">
              All {ESTATE_CONFIG.totalRooms} rooms included · Up to {ESTATE_CONFIG.maxGuests} guests
            </p>

            {nights >= ESTATE_CONFIG.minNights && (
              <div className="buyout-pricing-preview">
                <div className="pricing-row">
                  <span>Estate Buyout ({nights} nights × ${ESTATE_CONFIG.baseNightlyRate.toLocaleString()})</span>
                  <span>${pricing.roomTotal.toLocaleString()}</span>
                </div>
                <div className="pricing-row total">
                  <span>Estimated Total (incl. taxes)</span>
                  <span>${pricing.total.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button 
              className="btn-next" 
              onClick={() => goToStep(STEPS.GUEST)}
              disabled={nights < ESTATE_CONFIG.minNights}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2: Guest Details */}
        {step === STEPS.GUEST && (
          <div className="booking-step">
            <div className="step-header">
              <h2>Your Details</h2>
              <p>Tell us who's organizing this special occasion</p>
            </div>

            <div className="guest-form">
              <div className="form-row">
                <div className="form-field">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={guest.firstName || ''}
                    onChange={(e) => setGuest({ ...guest, firstName: e.target.value })}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                </div>
                <div className="form-field">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={guest.lastName || ''}
                    onChange={(e) => setGuest({ ...guest, lastName: e.target.value })}
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
                    onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>
                <div className="form-field">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={guest.phone || ''}
                    onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-msg">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-field full-width">
                <label>Special Requests</label>
                <textarea
                  value={guest.notes || ''}
                  onChange={(e) => setGuest({ ...guest, notes: e.target.value })}
                  placeholder="Dietary restrictions, accessibility needs, celebration details..."
                  rows={3}
                />
              </div>
            </div>

            <div className="buyout-policy-note">
              <strong>Cancellation Policy</strong>
              <p>50% deposit required. Full refund if cancelled 30+ days before arrival. No refund within 14 days of arrival.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-secondary" onClick={() => goToStep(STEPS.DATES)}>Back</button>
              <button 
                className="btn-next" 
                onClick={() => validateGuest() && goToStep(STEPS.PAYMENT)}
                style={{ flex: 1 }}
              >
                Review Booking
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment */}
        {step === STEPS.PAYMENT && (
          <div className="booking-step">
            <div className="step-header">
              <h2>Review & Pay</h2>
              <p>Confirm your estate buyout details</p>
            </div>

            <div className="payment-layout">
              <div className="payment-form-container">
                <h3 className="form-section-title">Booking Summary</h3>
                
                <div className="summary-section">
                  <div className="detail-row">
                    <span className="label">Dates</span>
                    <span className="value">
                      {format(parseISO(dates.checkIn), 'MMM d')} – {format(parseISO(dates.checkOut), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration</span>
                    <span className="value">{nights} nights</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Guests</span>
                    <span className="value">{guests} guests · {ESTATE_CONFIG.totalRooms} rooms</span>
                  </div>
                </div>

                <div className="payment-note">
                  <strong>50% Deposit Required</strong><br />
                  Pay ${pricing.deposit.toLocaleString()} today. Remaining balance of ${(pricing.total - pricing.deposit).toLocaleString()} due 14 days before arrival.
                </div>

                <button 
                  className="btn-book"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <><span className="spinner-small"></span> Processing...</>
                  ) : (
                    `Pay $${pricing.deposit.toLocaleString()} Deposit`
                  )}
                </button>
              </div>

              <div className="booking-summary">
                <h3>Price Breakdown</h3>
                <div className="summary-breakdown">
                  <div className="breakdown-line">
                    <span>Estate ({nights} nights)</span>
                    <span>${pricing.roomTotal.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-line">
                    <span>Taxes & fees (15%)</span>
                    <span>${pricing.taxes.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-line total">
                    <span>Total</span>
                    <span>${pricing.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="guest-summary">
                  <strong>{guest.firstName} {guest.lastName}</strong>
                  <span>{guest.email}</span>
                </div>
              </div>
            </div>

            <button className="btn-secondary" onClick={() => goToStep(STEPS.GUEST)} style={{ marginTop: '1.5rem' }}>
              ← Back
            </button>
          </div>
        )}

        {/* STEP 4: Confirmation */}
        {step === STEPS.CONFIRMATION && confirmation && (
          <div className="booking-step confirmation">
            <div className="confirmation-header">
              <img src="/logo.png" alt="Hennessey Estate" className="confirmation-logo" />
              <div className="success-icon">✓</div>
              <h2>Estate Buyout Confirmed!</h2>
            </div>

            <div className="confirmation-card">
              <div className="confirmation-number">
                <label>Confirmation Number</label>
                <strong>{confirmation.confirmationNumber}</strong>
              </div>

              <div className="confirmation-details">
                <div className="detail-row">
                  <span className="label">Check-in</span>
                  <span className="value">{format(parseISO(dates.checkIn), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Check-out</span>
                  <span className="value">{format(parseISO(dates.checkOut), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Guests</span>
                  <span className="value">{guests} guests · All 10 rooms</span>
                </div>
                <div className="detail-row">
                  <span className="label">Deposit Paid</span>
                  <span className="value">${confirmation.deposit?.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Balance Due</span>
                  <span className="value">${(confirmation.total - confirmation.deposit)?.toLocaleString()}</span>
                </div>
              </div>

              <div className="confirmation-message">
                <p>A confirmation email has been sent to <strong>{guest.email}</strong></p>
                <p>Our estate coordinator will contact you within 24 hours to discuss your event details.</p>
              </div>

              <div className="confirmation-contact">
                <p>Questions?</p>
                <a href="mailto:events@hennesseyestate.com">events@hennesseyestate.com</a>
              </div>
            </div>

            <Link to="/" className="btn-new-booking">
              Return to Hennessey Estate
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="booking-footer">
        <p>© 2026 Hennessey Estate. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="spinner-large"></div>
            <p>Confirming your estate buyout...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstateBuyoutBooking;
