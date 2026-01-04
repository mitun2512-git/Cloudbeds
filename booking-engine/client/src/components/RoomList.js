import React from 'react';
import { format, differenceInDays } from 'date-fns';
import './RoomList.css';

const RoomList = ({ rooms, checkIn, checkOut, onRoomSelect, onBack }) => {
  const nights = differenceInDays(new Date(checkOut), new Date(checkIn));

  if (rooms.length === 0) {
    return (
      <div className="room-list">
        <div className="no-rooms">
          <h2>No rooms available</h2>
          <p>Sorry, there are no rooms available for the selected dates.</p>
          <button onClick={onBack} className="btn-secondary">Change Dates</button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h2>Available Rooms</h2>
        <p>
          {format(new Date(checkIn), 'MMM d')} - {format(new Date(checkOut), 'MMM d, yyyy')} 
          ({nights} {nights === 1 ? 'night' : 'nights'})
        </p>
        <button onClick={onBack} className="btn-link">Change Dates</button>
      </div>

      <div className="rooms-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            {room.images && room.images.length > 0 && (
              <div className="room-image">
                <img src={room.images[0]} alt={room.name} />
              </div>
            )}
            
            <div className="room-content">
              <h3>{room.name}</h3>
              <p className="room-description">{room.description}</p>
              
              <div className="room-details">
                <div className="room-info">
                  <span>👥 Max {room.max_occupancy} guests</span>
                  {room.beds && room.beds.length > 0 && (
                    <span>🛏️ {room.beds.map(b => b.type).join(', ')}</span>
                  )}
                  {room.available !== undefined && (
                    <span className={room.available > 0 ? 'available' : 'unavailable'}>
                      {room.available > 0 ? `✓ ${room.available} available` : '✗ Unavailable'}
                    </span>
                  )}
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="room-amenities">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="room-footer">
                <div className="room-price">
                  {room.price ? (
                    <>
                      <span className="price-amount">${room.price}</span>
                      <span className="price-period">/night</span>
                      <span className="price-total">${(room.price * nights).toFixed(2)} total</span>
                    </>
                  ) : (
                    <span className="price-contact">Contact for pricing</span>
                  )}
                </div>
                
                <button
                  onClick={() => onRoomSelect(room)}
                  className="btn-select"
                  disabled={room.available === 0}
                >
                  {room.available === 0 ? 'Unavailable' : 'Select Room'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;


