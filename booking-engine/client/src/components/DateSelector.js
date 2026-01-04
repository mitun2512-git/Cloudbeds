import React, { useState } from 'react';
import { format, addDays, isAfter, isBefore, startOfToday } from 'date-fns';
import './DateSelector.css';

const DateSelector = ({ onDateSelect }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [error, setError] = useState('');

  const today = format(startOfToday(), 'yyyy-MM-dd');
  const minCheckOut = checkIn ? format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd') : today;

  const handleCheckInChange = (e) => {
    const date = e.target.value;
    setCheckIn(date);
    
    // Reset check-out if it's before or equal to check-in
    if (checkOut && (checkOut <= date)) {
      setCheckOut('');
    }
    setError('');
  };

  const handleCheckOutChange = (e) => {
    setCheckOut(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('DateSelector handleSubmit called', { checkIn, checkOut });
    
    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return;
    }

    console.log('Calling onDateSelect with:', { checkIn, checkOut });
    onDateSelect(checkIn, checkOut);
  };

  return (
    <div className="date-selector">
      <h2>Select Your Dates</h2>
      <form onSubmit={handleSubmit} className="date-form">
        <div className="date-inputs">
          <div className="date-input-group">
            <label htmlFor="check-in">Check-In</label>
            <input
              type="date"
              id="check-in"
              value={checkIn}
              onChange={handleCheckInChange}
              min={today}
              required
            />
          </div>
          
          <div className="date-input-group">
            <label htmlFor="check-out">Check-Out</label>
            <input
              type="date"
              id="check-out"
              value={checkOut}
              onChange={handleCheckOutChange}
              min={minCheckOut}
              disabled={!checkIn}
              required
            />
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn-primary" disabled={!checkIn || !checkOut}>
          Search Rooms
        </button>
      </form>
    </div>
  );
};

export default DateSelector;


