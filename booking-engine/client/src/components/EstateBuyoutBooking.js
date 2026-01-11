import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, addDays, addMonths, differenceInDays, parseISO } from 'date-fns';
import './EstateBuyoutBooking.css';

// ============================================================================
// ESTATE BUYOUT CONFIGURATION
// ============================================================================
const ESTATE_CONFIG = {
  totalRooms: 10,
  maxGuests: 20,
  minNights: 2,
  baseNightlyRate: 4500, // Base rate for all 10 rooms
  weekendSurcharge: 500, // Friday & Saturday premium
  peakSeasonMultiplier: 1.25, // Harvest season (Sept-Nov)
  depositPercent: 50,
  taxRate: 0.15, // 15% TOT in Napa
};

// Event types for buyouts
const EVENT_TYPES = [
  { id: 'celebration', label: 'Birthday / Anniversary', icon: '🎂', description: 'Milestone celebrations with your closest friends and family' },
  { id: 'reunion', label: 'Family / Friends Reunion', icon: '👨‍👩‍👧‍👦', description: 'Reconnect with loved ones in an intimate setting' },
  { id: 'corporate', label: 'Corporate Retreat', icon: '💼', description: 'Team building and strategic planning in wine country' },
  { id: 'wedding', label: 'Wedding / Elopement', icon: '💒', description: 'Intimate ceremonies and wedding weekends' },
  { id: 'wellness', label: 'Wellness Retreat', icon: '🧘', description: 'Yoga, meditation, and rejuvenation' },
  { id: 'other', label: 'Other Special Occasion', icon: '✨', description: 'Tell us about your unique celebration' },
];

// Buyout-specific services and add-ons
const BUYOUT_SERVICES = [
  {
    id: 'private_chef_dinner',
    name: 'Private Chef Dinner',
    description: 'Multi-course gourmet dinner prepared in our historic dining room',
    price: 175,
    priceType: 'per_person',
    icon: '👨‍🍳',
    popular: true,
  },
  {
    id: 'wine_concierge',
    name: 'Wine Concierge Service',
    description: 'Curated winery appointments and private tastings arranged for your group',
    price: 500,
    priceType: 'flat',
    icon: '🍷',
    popular: true,
  },
  {
    id: 'packed_lunches',
    name: 'Packed Vineyard Lunches',
    description: 'Gourmet picnic boxes for your wine country adventures',
    price: 65,
    priceType: 'per_person_per_day',
    icon: '🧺',
  },
  {
    id: 'spa_day',
    name: 'Group Spa Experience',
    description: 'In-house massage therapists and wellness treatments',
    price: 200,
    priceType: 'per_person',
    icon: '💆',
  },
  {
    id: 'photography',
    name: 'Professional Photography',
    description: '2-hour session capturing your group memories',
    price: 750,
    priceType: 'flat',
    icon: '📸',
  },
  {
    id: 'airport_shuttle',
    name: 'Group Airport Transfers',
    description: 'Luxury van service from SFO or OAK (up to 14 passengers)',
    price: 450,
    priceType: 'per_trip',
    icon: '🚐',
  },
  {
    id: 'welcome_reception',
    name: 'Welcome Wine Reception',
    description: 'Evening gathering with local wines and artisan cheese',
    price: 85,
    priceType: 'per_person',
    icon: '🥂',
  },
  {
    id: 'yoga_session',
    name: 'Private Yoga Sessions',
    description: 'Morning yoga in the gardens with a certified instructor',
    price: 300,
    priceType: 'per_session',
    icon: '🧘',
  },
];

// Booking Steps
const STEPS = {
  EVENT: 0,
  DATES: 1,
  SERVICES: 2,
  DETAILS: 3,
  REVIEW: 4,
  CONFIRMATION: 5,
};

const STEP_LABELS = ['Event Type', 'Dates & Guests', 'Services', 'Your Details', 'Review & Pay', 'Confirmed'];

// ============================================================================
// STEP 1: EVENT TYPE SELECTION
// ============================================================================
const EventTypeSelection = ({ eventType, setEventType, customEventDescription, setCustomEventDescription, onNext }) => {
  return (
    <div className="buyout-step event-step">
      <div className="step-header">
        <h2>What's the Occasion?</h2>
        <p>Tell us about your celebration so we can help create an unforgettable experience</p>
      </div>

      <div className="event-types-grid">
        {EVENT_TYPES.map((event) => (
          <button
            key={event.id}
            className={`event-type-card ${eventType === event.id ? 'selected' : ''}`}
            onClick={() => setEventType(event.id)}
          >
            <span className="event-icon">{event.icon}</span>
            <span className="event-label">{event.label}</span>
            <span className="event-description">{event.description}</span>
            {eventType === event.id && <span className="checkmark">✓</span>}
          </button>
        ))}
      </div>

      {eventType === 'other' && (
        <div className="custom-event-input">
          <label>Tell us about your occasion</label>
          <textarea
            value={customEventDescription}
            onChange={(e) => setCustomEventDescription(e.target.value)}
            placeholder="Describe your special event..."
            rows={3}
          />
        </div>
      )}

      <div className="step-actions">
        <Link to="/" className="btn-secondary">← Back to Home</Link>
        <button 
          className="btn-primary" 
          onClick={onNext}
          disabled={!eventType}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 2: DATES & GUESTS
// ============================================================================
const DatesGuestsSelection = ({ dates, setDates, guests, setGuests, onNext, onBack }) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  const nights = differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn));
  const isValidSelection = nights >= ESTATE_CONFIG.minNights && guests >= 2 && guests <= ESTATE_CONFIG.maxGuests;

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];

    // Previous month padding
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, disabled: true });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      const isCheckIn = dateStr === dates.checkIn;
      const isCheckOut = dateStr === dates.checkOut;
      const isInRange = dateStr > dates.checkIn && dateStr < dates.checkOut;

      days.push({
        date: dateStr,
        day: d,
        disabled: isPast,
        isCheckIn,
        isCheckOut,
        isInRange,
        isWeekend: date.getDay() === 0 || date.getDay() === 5 || date.getDay() === 6,
      });
    }

    return days;
  };

  const handleDateClick = (dateStr) => {
    if (!dateStr) return;
    
    if (!dates.checkIn || (dates.checkIn && dates.checkOut)) {
      // Start new selection
      setDates({ checkIn: dateStr, checkOut: '' });
    } else if (dateStr > dates.checkIn) {
      // Complete selection
      setDates({ ...dates, checkOut: dateStr });
    } else {
      // Clicked before check-in, start over
      setDates({ checkIn: dateStr, checkOut: '' });
    }
  };

  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));

  return (
    <div className="buyout-step dates-step">
      <div className="step-header">
        <h2>When & How Many?</h2>
        <p>Select your dates and group size for the full estate experience</p>
      </div>

      <div className="dates-guests-container">
        <div className="calendar-section">
          <div className="calendar-header">
            <button onClick={prevMonth} className="month-nav">←</button>
            <span className="month-label">{format(calendarMonth, 'MMMM yyyy')}</span>
            <button onClick={nextMonth} className="month-nav">→</button>
          </div>
          
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          
          <div className="calendar-days">
            {generateCalendarDays().map((day, idx) => (
              <button
                key={idx}
                className={`calendar-day ${day.disabled ? 'disabled' : ''} ${day.isCheckIn ? 'check-in' : ''} ${day.isCheckOut ? 'check-out' : ''} ${day.isInRange ? 'in-range' : ''} ${day.isWeekend ? 'weekend' : ''}`}
                onClick={() => !day.disabled && handleDateClick(day.date)}
                disabled={day.disabled}
              >
                {day.day}
              </button>
            ))}
          </div>

          <div className="calendar-legend">
            <span className="legend-item"><span className="dot check-in"></span> Check-in</span>
            <span className="legend-item"><span className="dot check-out"></span> Check-out</span>
            <span className="legend-item"><span className="dot weekend"></span> Weekend rate</span>
          </div>
        </div>

        <div className="selection-summary">
          <div className="date-display">
            <div className="date-box">
              <label>Check-in</label>
              <span className="date-value">{dates.checkIn ? format(parseISO(dates.checkIn), 'EEE, MMM d, yyyy') : 'Select date'}</span>
              <span className="time">After 3:00 PM</span>
            </div>
            <div className="date-arrow">→</div>
            <div className="date-box">
              <label>Check-out</label>
              <span className="date-value">{dates.checkOut ? format(parseISO(dates.checkOut), 'EEE, MMM d, yyyy') : 'Select date'}</span>
              <span className="time">Before 11:00 AM</span>
            </div>
          </div>

          {nights > 0 && (
            <div className="nights-display">
              <span className="nights-count">{nights}</span>
              <span className="nights-label">{nights === 1 ? 'Night' : 'Nights'}</span>
              {nights < ESTATE_CONFIG.minNights && (
                <span className="min-nights-warning">Minimum {ESTATE_CONFIG.minNights} nights required</span>
              )}
            </div>
          )}

          <div className="guests-selector">
            <label>Number of Guests</label>
            <p className="guests-hint">The estate accommodates up to {ESTATE_CONFIG.maxGuests} guests in {ESTATE_CONFIG.totalRooms} private rooms</p>
            <div className="guests-input">
              <button 
                className="guests-btn" 
                onClick={() => setGuests(Math.max(2, guests - 1))}
                disabled={guests <= 2}
              >
                −
              </button>
              <span className="guests-count">{guests}</span>
              <button 
                className="guests-btn" 
                onClick={() => setGuests(Math.min(ESTATE_CONFIG.maxGuests, guests + 1))}
                disabled={guests >= ESTATE_CONFIG.maxGuests}
              >
                +
              </button>
            </div>
            <span className="guests-rooms">{Math.ceil(guests / 2)} rooms will be assigned</span>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button 
          className="btn-primary" 
          onClick={onNext}
          disabled={!isValidSelection}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 3: SERVICES SELECTION
// ============================================================================
const ServicesSelection = ({ services, setServices, guests, nights, onNext, onBack }) => {
  const toggleService = (serviceId) => {
    setServices(prev => ({
      ...prev,
      [serviceId]: prev[serviceId] ? undefined : { quantity: 1 }
    }));
  };

  const updateQuantity = (serviceId, quantity) => {
    setServices(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], quantity }
    }));
  };

  const calculateServicePrice = (service) => {
    const selection = services[service.id];
    if (!selection) return 0;

    switch (service.priceType) {
      case 'per_person':
        return service.price * guests;
      case 'per_person_per_day':
        return service.price * guests * nights;
      case 'per_session':
      case 'per_trip':
        return service.price * (selection.quantity || 1);
      case 'flat':
      default:
        return service.price;
    }
  };

  const totalServicesPrice = BUYOUT_SERVICES.reduce((sum, service) => {
    return sum + (services[service.id] ? calculateServicePrice(service) : 0);
  }, 0);

  return (
    <div className="buyout-step services-step">
      <div className="step-header">
        <h2>Enhance Your Stay</h2>
        <p>Optional services to make your estate experience extraordinary</p>
      </div>

      <div className="services-grid">
        {BUYOUT_SERVICES.map((service) => {
          const isSelected = !!services[service.id];
          const price = calculateServicePrice(service);

          return (
            <div 
              key={service.id}
              className={`service-card ${isSelected ? 'selected' : ''} ${service.popular ? 'popular' : ''}`}
              onClick={() => toggleService(service.id)}
            >
              {service.popular && <span className="popular-badge">Popular</span>}
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-pricing">
                <span className="service-price">${service.price}</span>
                <span className="price-type">
                  {service.priceType === 'per_person' && '/person'}
                  {service.priceType === 'per_person_per_day' && '/person/day'}
                  {service.priceType === 'per_session' && '/session'}
                  {service.priceType === 'per_trip' && '/trip'}
                  {service.priceType === 'flat' && ' total'}
                </span>
              </div>
              
              {isSelected && (
                <div className="service-selected-info" onClick={(e) => e.stopPropagation()}>
                  {(service.priceType === 'per_session' || service.priceType === 'per_trip') && (
                    <div className="quantity-selector">
                      <button onClick={() => updateQuantity(service.id, Math.max(1, (services[service.id]?.quantity || 1) - 1))}>−</button>
                      <span>{services[service.id]?.quantity || 1}</span>
                      <button onClick={() => updateQuantity(service.id, (services[service.id]?.quantity || 1) + 1)}>+</button>
                    </div>
                  )}
                  <span className="estimated-total">Est. ${price.toLocaleString()}</span>
                </div>
              )}
              
              <div className="selection-indicator">
                {isSelected ? '✓ Selected' : 'Click to add'}
              </div>
            </div>
          );
        })}
      </div>

      {totalServicesPrice > 0 && (
        <div className="services-total">
          <span>Selected services total:</span>
          <span className="total-amount">${totalServicesPrice.toLocaleString()}</span>
        </div>
      )}

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext}>
          {Object.keys(services).filter(k => services[k]).length > 0 ? 'Continue →' : 'Skip & Continue →'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 4: GUEST DETAILS
// ============================================================================
const GuestDetailsForm = ({ guest, setGuest, onNext, onBack }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setGuest(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!guest.firstName?.trim()) newErrors.firstName = 'Required';
    if (!guest.lastName?.trim()) newErrors.lastName = 'Required';
    if (!guest.email?.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) newErrors.email = 'Invalid email';
    if (!guest.phone?.trim()) newErrors.phone = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="buyout-step details-step">
      <div className="step-header">
        <h2>Your Details</h2>
        <p>Tell us who's organizing this special occasion</p>
      </div>

      <div className="details-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              value={guest.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              value={guest.lastName || ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={guest.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={guest.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label>Company / Organization (if applicable)</label>
          <input
            type="text"
            value={guest.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label>Special Requests or Notes</label>
          <textarea
            value={guest.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Dietary restrictions, accessibility needs, celebration details, etc."
            rows={4}
          />
        </div>

        <div className="form-group full-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={guest.agreeToTerms || false}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
            />
            <span>I agree to the <a href="/terms" target="_blank">Terms of Service</a> and understand the <a href="#cancellation">cancellation policy</a> for full estate buyouts</span>
          </label>
        </div>

        <div className="cancellation-policy" id="cancellation">
          <h4>Cancellation Policy - Full Estate Buyout</h4>
          <ul>
            <li>50% deposit required at time of booking</li>
            <li>Full refund if cancelled 30+ days before arrival</li>
            <li>50% refund if cancelled 14-29 days before arrival</li>
            <li>No refund if cancelled less than 14 days before arrival</li>
          </ul>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button 
          className="btn-primary" 
          onClick={handleNext}
          disabled={!guest.agreeToTerms}
        >
          Review Booking →
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 5: REVIEW & PAYMENT
// ============================================================================
const ReviewAndPay = ({ eventType, customEventDescription, dates, guests, services, guest, onBack, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nights = differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn));
  
  // Calculate pricing
  const calculateTotal = () => {
    let baseRate = ESTATE_CONFIG.baseNightlyRate * nights;
    
    // Weekend surcharge
    let current = parseISO(dates.checkIn);
    const end = parseISO(dates.checkOut);
    let weekendNights = 0;
    while (current < end) {
      const day = current.getDay();
      if (day === 5 || day === 6) weekendNights++;
      current = addDays(current, 1);
    }
    const weekendSurcharge = weekendNights * ESTATE_CONFIG.weekendSurcharge;

    // Peak season (Sept-Nov)
    const checkInMonth = parseISO(dates.checkIn).getMonth();
    const isPeakSeason = checkInMonth >= 8 && checkInMonth <= 10;
    if (isPeakSeason) {
      baseRate *= ESTATE_CONFIG.peakSeasonMultiplier;
    }

    // Services
    const servicesTotal = BUYOUT_SERVICES.reduce((sum, service) => {
      const selection = services[service.id];
      if (!selection) return sum;

      switch (service.priceType) {
        case 'per_person':
          return sum + service.price * guests;
        case 'per_person_per_day':
          return sum + service.price * guests * nights;
        case 'per_session':
        case 'per_trip':
          return sum + service.price * (selection.quantity || 1);
        case 'flat':
        default:
          return sum + service.price;
      }
    }, 0);

    const subtotal = baseRate + weekendSurcharge + servicesTotal;
    const taxes = subtotal * ESTATE_CONFIG.taxRate;
    const total = subtotal + taxes;
    const deposit = total * ESTATE_CONFIG.depositPercent / 100;

    return { baseRate, weekendSurcharge, weekendNights, servicesTotal, subtotal, taxes, total, deposit, isPeakSeason };
  };

  const pricing = calculateTotal();
  const eventInfo = EVENT_TYPES.find(e => e.id === eventType);
  const selectedServices = BUYOUT_SERVICES.filter(s => services[s.id]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call - in production, this would call your backend
    setTimeout(() => {
      onSubmit({
        confirmationNumber: 'HE-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        ...pricing
      });
    }, 2000);
  };

  return (
    <div className="buyout-step review-step">
      <div className="step-header">
        <h2>Review Your Booking</h2>
        <p>Please review all details before confirming your estate buyout</p>
      </div>

      <div className="review-container">
        <div className="review-details">
          <section className="review-section">
            <h3>Event Details</h3>
            <div className="review-item">
              <span className="label">Occasion:</span>
              <span className="value">{eventInfo?.icon} {eventInfo?.label}</span>
            </div>
            {customEventDescription && (
              <div className="review-item">
                <span className="label">Details:</span>
                <span className="value">{customEventDescription}</span>
              </div>
            )}
          </section>

          <section className="review-section">
            <h3>Stay Details</h3>
            <div className="review-item">
              <span className="label">Check-in:</span>
              <span className="value">{format(parseISO(dates.checkIn), 'EEEE, MMMM d, yyyy')} (after 3 PM)</span>
            </div>
            <div className="review-item">
              <span className="label">Check-out:</span>
              <span className="value">{format(parseISO(dates.checkOut), 'EEEE, MMMM d, yyyy')} (before 11 AM)</span>
            </div>
            <div className="review-item">
              <span className="label">Duration:</span>
              <span className="value">{nights} nights</span>
            </div>
            <div className="review-item">
              <span className="label">Guests:</span>
              <span className="value">{guests} guests ({ESTATE_CONFIG.totalRooms} private rooms)</span>
            </div>
          </section>

          {selectedServices.length > 0 && (
            <section className="review-section">
              <h3>Added Services</h3>
              {selectedServices.map(service => (
                <div key={service.id} className="review-item">
                  <span className="label">{service.icon} {service.name}</span>
                  <span className="value">
                    {services[service.id]?.quantity > 1 && `${services[service.id].quantity}x `}
                    Included
                  </span>
                </div>
              ))}
            </section>
          )}

          <section className="review-section">
            <h3>Contact Information</h3>
            <div className="review-item">
              <span className="label">Name:</span>
              <span className="value">{guest.firstName} {guest.lastName}</span>
            </div>
            <div className="review-item">
              <span className="label">Email:</span>
              <span className="value">{guest.email}</span>
            </div>
            <div className="review-item">
              <span className="label">Phone:</span>
              <span className="value">{guest.phone}</span>
            </div>
            {guest.company && (
              <div className="review-item">
                <span className="label">Company:</span>
                <span className="value">{guest.company}</span>
              </div>
            )}
          </section>
        </div>

        <div className="review-pricing">
          <div className="pricing-card">
            <h3>Price Summary</h3>
            
            <div className="pricing-line">
              <span>Estate Buyout ({nights} nights × ${ESTATE_CONFIG.baseNightlyRate.toLocaleString()})</span>
              <span>${pricing.baseRate.toLocaleString()}</span>
            </div>
            
            {pricing.weekendNights > 0 && (
              <div className="pricing-line">
                <span>Weekend surcharge ({pricing.weekendNights} nights)</span>
                <span>${pricing.weekendSurcharge.toLocaleString()}</span>
              </div>
            )}
            
            {pricing.isPeakSeason && (
              <div className="pricing-line peak-season">
                <span>Harvest Season (25% premium)</span>
                <span>Included above</span>
              </div>
            )}
            
            {pricing.servicesTotal > 0 && (
              <div className="pricing-line">
                <span>Additional Services</span>
                <span>${pricing.servicesTotal.toLocaleString()}</span>
              </div>
            )}
            
            <div className="pricing-line subtotal">
              <span>Subtotal</span>
              <span>${pricing.subtotal.toLocaleString()}</span>
            </div>
            
            <div className="pricing-line">
              <span>Taxes & Fees (15%)</span>
              <span>${pricing.taxes.toLocaleString()}</span>
            </div>
            
            <div className="pricing-line total">
              <span>Total</span>
              <span>${pricing.total.toLocaleString()}</span>
            </div>

            <div className="deposit-info">
              <div className="deposit-amount">
                <span>Deposit Due Today (50%)</span>
                <span className="deposit-value">${pricing.deposit.toLocaleString()}</span>
              </div>
              <p className="deposit-note">Remaining balance due 14 days before arrival</p>
            </div>

            <button 
              className="btn-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>Confirm & Pay ${pricing.deposit.toLocaleString()} Deposit</>
              )}
            </button>

            <p className="secure-note">🔒 Secure payment powered by Stripe</p>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack} disabled={isSubmitting}>← Back</button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 6: CONFIRMATION
// ============================================================================
const Confirmation = ({ confirmation, eventType, dates, guests, guest }) => {
  const nights = differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn));
  const eventInfo = EVENT_TYPES.find(e => e.id === eventType);

  return (
    <div className="buyout-step confirmation-step">
      <div className="confirmation-content">
        <div className="success-icon">✓</div>
        <h1>Your Estate Buyout is Confirmed!</h1>
        <p className="confirmation-number">Confirmation #{confirmation.confirmationNumber}</p>

        <div className="confirmation-details">
          <div className="detail-card">
            <h3>{eventInfo?.icon} {eventInfo?.label}</h3>
            <p>{nights} nights · {guests} guests · All 10 rooms</p>
            <p className="dates">
              {format(parseISO(dates.checkIn), 'MMM d')} – {format(parseISO(dates.checkOut), 'MMM d, yyyy')}
            </p>
          </div>

          <div className="detail-card payment">
            <h3>Payment Summary</h3>
            <div className="payment-line">
              <span>Deposit Paid</span>
              <span>${confirmation.deposit?.toLocaleString()}</span>
            </div>
            <div className="payment-line">
              <span>Remaining Balance</span>
              <span>${(confirmation.total - confirmation.deposit)?.toLocaleString()}</span>
            </div>
            <p className="balance-note">Due 14 days before arrival</p>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>📧 Confirmation email sent to <strong>{guest.email}</strong></li>
            <li>📞 Our concierge will contact you within 24 hours to discuss your event</li>
            <li>📋 Room assignments and itinerary sent 7 days before arrival</li>
            <li>🍷 Pre-arrival questionnaire for wine and dining preferences</li>
          </ul>
        </div>

        <div className="contact-info">
          <p>Questions? Contact our Estate Coordinator</p>
          <a href="mailto:events@hennesseyestate.com" className="contact-link">
            events@hennesseyestate.com
          </a>
        </div>

        <Link to="/" className="btn-home">
          ← Return to Hennessey Estate
        </Link>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN BUYOUT BOOKING COMPONENT
// ============================================================================
const EstateBuyoutBooking = () => {
  const [step, setStep] = useState(STEPS.EVENT);
  
  // Booking state
  const [eventType, setEventType] = useState('');
  const [customEventDescription, setCustomEventDescription] = useState('');
  const [dates, setDates] = useState({
    checkIn: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 33), 'yyyy-MM-dd'),
  });
  const [guests, setGuests] = useState(10);
  const [services, setServices] = useState({});
  const [guest, setGuest] = useState({});
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    document.title = 'Full Estate Buyout | Hennessey Estate';
    window.scrollTo(0, 0);
  }, [step]);

  const goToStep = (newStep) => {
    setStep(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="estate-buyout-booking">
      {/* Header */}
      <header className="buyout-header">
        <Link to="/" className="buyout-logo">
          <img src="/logo-white.png" alt="Hennessey Estate" />
        </Link>
        <div className="header-title">
          <span className="badge">FULL ESTATE BUYOUT</span>
          <h1>Your Private Victorian Retreat</h1>
        </div>
      </header>

      {/* Progress Steps */}
      {step !== STEPS.CONFIRMATION && (
        <div className="progress-bar">
          {STEP_LABELS.slice(0, -1).map((label, idx) => (
            <div
              key={idx}
              className={`progress-step ${idx === step ? 'active' : ''} ${idx < step ? 'completed' : ''}`}
            >
              <div className="step-number">{idx < step ? '✓' : idx + 1}</div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="buyout-main">
        {step === STEPS.EVENT && (
          <EventTypeSelection
            eventType={eventType}
            setEventType={setEventType}
            customEventDescription={customEventDescription}
            setCustomEventDescription={setCustomEventDescription}
            onNext={() => goToStep(STEPS.DATES)}
          />
        )}

        {step === STEPS.DATES && (
          <DatesGuestsSelection
            dates={dates}
            setDates={setDates}
            guests={guests}
            setGuests={setGuests}
            onNext={() => goToStep(STEPS.SERVICES)}
            onBack={() => goToStep(STEPS.EVENT)}
          />
        )}

        {step === STEPS.SERVICES && (
          <ServicesSelection
            services={services}
            setServices={setServices}
            guests={guests}
            nights={differenceInDays(parseISO(dates.checkOut), parseISO(dates.checkIn))}
            onNext={() => goToStep(STEPS.DETAILS)}
            onBack={() => goToStep(STEPS.DATES)}
          />
        )}

        {step === STEPS.DETAILS && (
          <GuestDetailsForm
            guest={guest}
            setGuest={setGuest}
            onNext={() => goToStep(STEPS.REVIEW)}
            onBack={() => goToStep(STEPS.SERVICES)}
          />
        )}

        {step === STEPS.REVIEW && (
          <ReviewAndPay
            eventType={eventType}
            customEventDescription={customEventDescription}
            dates={dates}
            guests={guests}
            services={services}
            guest={guest}
            onBack={() => goToStep(STEPS.DETAILS)}
            onSubmit={(conf) => {
              setConfirmation(conf);
              goToStep(STEPS.CONFIRMATION);
            }}
          />
        )}

        {step === STEPS.CONFIRMATION && (
          <Confirmation
            confirmation={confirmation}
            eventType={eventType}
            dates={dates}
            guests={guests}
            guest={guest}
          />
        )}
      </main>

      {/* Footer */}
      {step !== STEPS.CONFIRMATION && (
        <footer className="buyout-footer">
          <div className="footer-content">
            <div className="estate-highlights">
              <span>🏛️ 10 Private Rooms</span>
              <span>🏊 Heated Pool & Spa</span>
              <span>🍳 Chef's Breakfast</span>
              <span>🍷 Historic Tasting Room</span>
            </div>
            <p className="footer-contact">
              Questions? <a href="mailto:events@hennesseyestate.com">events@hennesseyestate.com</a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default EstateBuyoutBooking;
