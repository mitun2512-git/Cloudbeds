import React from 'react';
import './Confirmation.css';

const Confirmation = ({ reservation, onNewBooking }) => {
  const reservationData = reservation?.reservation || reservation;

  return (
    <div className="confirmation">
      <div className="confirmation-icon">✓</div>
      <h1>Booking Confirmed!</h1>
      <p className="confirmation-message">
        Your reservation has been successfully created and confirmed.
      </p>

      {reservationData && (
        <div className="confirmation-details">
          <div className="detail-card">
            <h2>Reservation Details</h2>
            <div className="detail-item">
              <span className="detail-label">Reservation ID:</span>
              <span className="detail-value">{reservationData.reservation_id || reservationData.id}</span>
            </div>
            {reservationData.guest && (
              <>
                <div className="detail-item">
                  <span className="detail-label">Guest Name:</span>
                  <span className="detail-value">
                    {reservationData.guest.first_name} {reservationData.guest.last_name}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{reservationData.guest.email}</span>
                </div>
              </>
            )}
            {reservationData.check_in && (
              <div className="detail-item">
                <span className="detail-label">Check-In:</span>
                <span className="detail-value">
                  {new Date(reservationData.check_in).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {reservationData.check_out && (
              <div className="detail-item">
                <span className="detail-label">Check-Out:</span>
                <span className="detail-value">
                  {new Date(reservationData.check_out).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {reservationData.status && (
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status ${reservationData.status}`}>
                  {reservationData.status.charAt(0).toUpperCase() + reservationData.status.slice(1)}
                </span>
              </div>
            )}
          </div>

          {reservation.confirmed && (
            <div className="confirmation-note">
              <p>✓ Your reservation has been confirmed</p>
            </div>
          )}

          {reservation.payment && (
            <div className="payment-note">
              {reservation.payment.success ? (
                <p>✓ Payment processed successfully</p>
              ) : (
                <p className="warning">
                  ⚠ Payment processing encountered an issue. Please contact support.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="confirmation-actions">
        <p className="confirmation-info">
          A confirmation email has been sent to your email address.
        </p>
        <button onClick={onNewBooking} className="btn-primary">
          Make Another Booking
        </button>
      </div>
    </div>
  );
};

export default Confirmation;


