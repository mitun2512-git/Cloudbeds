import React, { useState } from 'react';
import { differenceInDays } from 'date-fns';
import './PaymentForm.css';

const PaymentForm = ({ selectedRoom, guestInfo, checkIn, checkOut, onSubmit, onBack, loading }) => {
  const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
  const pricePerNight = selectedRoom.price || 0;
  const subtotal = pricePerNight * nights;
  const tax = subtotal * 0.1; // 10% tax (adjust as needed)
  const total = subtotal + tax;

  const [paymentData, setPaymentData] = useState({
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    cardholder_name: `${guestInfo.first_name} ${guestInfo.last_name}`,
    amount: total.toFixed(2),
    payment_method: 'credit_card',
    currency: 'USD'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number (add spaces every 4 digits)
    if (name === 'card_number') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }

    // Format expiry (MM/YY)
    if (name === 'card_expiry') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }

    // Format CVV (3-4 digits only)
    if (name === 'card_cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate card number (remove spaces for validation)
    const cardNumber = paymentData.card_number.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.card_number = 'Invalid card number';
    }

    // Validate expiry
    const expiry = paymentData.card_expiry.replace(/\D/g, '');
    if (!expiry || expiry.length !== 4) {
      newErrors.card_expiry = 'Invalid expiry date (MM/YY)';
    } else {
      const month = parseInt(expiry.slice(0, 2));
      if (month < 1 || month > 12) {
        newErrors.card_expiry = 'Invalid month';
      }
    }

    // Validate CVV
    if (!paymentData.card_cvv || paymentData.card_cvv.length < 3) {
      newErrors.card_cvv = 'Invalid CVV';
    }

    // Validate cardholder name
    if (!paymentData.cardholder_name.trim()) {
      newErrors.cardholder_name = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Remove spaces from card number before submitting
      const cleanPaymentData = {
        ...paymentData,
        card_number: paymentData.card_number.replace(/\s/g, '')
      };
      onSubmit(cleanPaymentData);
    }
  };

  return (
    <div className="payment-form">
      <div className="payment-summary">
        <h2>Booking Summary</h2>
        <div className="summary-room">
          <h3>{selectedRoom.name}</h3>
          <p>
            {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
            <br />
            {nights} {nights === 1 ? 'night' : 'nights'}
          </p>
        </div>
        <div className="summary-breakdown">
          <div className="summary-line">
            <span>Room ({nights} nights × ${pricePerNight.toFixed(2)})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-details">
        <h2>Payment Information</h2>
        
        <div className="form-group">
          <label htmlFor="cardholder_name">Cardholder Name *</label>
          <input
            type="text"
            id="cardholder_name"
            name="cardholder_name"
            value={paymentData.cardholder_name}
            onChange={handleChange}
            required
            className={errors.cardholder_name ? 'error' : ''}
          />
          {errors.cardholder_name && <span className="error-text">{errors.cardholder_name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="card_number">Card Number *</label>
          <input
            type="text"
            id="card_number"
            name="card_number"
            value={paymentData.card_number}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            maxLength="19"
            required
            className={errors.card_number ? 'error' : ''}
          />
          {errors.card_number && <span className="error-text">{errors.card_number}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="card_expiry">Expiry Date (MM/YY) *</label>
            <input
              type="text"
              id="card_expiry"
              name="card_expiry"
              value={paymentData.card_expiry}
              onChange={handleChange}
              placeholder="12/25"
              maxLength="5"
              required
              className={errors.card_expiry ? 'error' : ''}
            />
            {errors.card_expiry && <span className="error-text">{errors.card_expiry}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="card_cvv">CVV *</label>
            <input
              type="text"
              id="card_cvv"
              name="card_cvv"
              value={paymentData.card_cvv}
              onChange={handleChange}
              placeholder="123"
              maxLength="4"
              required
              className={errors.card_cvv ? 'error' : ''}
            />
            {errors.card_cvv && <span className="error-text">{errors.card_cvv}</span>}
          </div>
        </div>

        <div className="security-note">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary" disabled={loading}>
            Back
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;


