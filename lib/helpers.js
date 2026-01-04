/**
 * Helper functions for Zapier integration
 */

const CloudbedsClient = require('./cloudbeds-client');

/**
 * Get properties as a dropdown list
 * Used as a dynamic field in Zapier
 */
const getPropertiesList = async (z, bundle) => {
  const client = new CloudbedsClient(z, bundle.authData.access_token);
  
  try {
    const response = await client.getProperties();
    const properties = response.data || response.properties || [];
    
    return properties.map(property => ({
      id: property.property_id || property.id,
      label: property.name || property.property_name || `Property ${property.property_id || property.id}`
    }));
  } catch (error) {
    return [{ id: 'error', label: 'Error loading properties' }];
  }
};

/**
 * Get room types for a property as a dropdown list
 * Used as a dynamic field in Zapier
 */
const getRoomTypesList = async (z, bundle) => {
  const propertyId = bundle.inputData.property_id;
  
  if (!propertyId) {
    return [{ id: '', label: 'Please select a property first' }];
  }
  
  const client = new CloudbedsClient(z, bundle.authData.access_token);
  
  try {
    const response = await client.getRooms(propertyId);
    const rooms = response.data || response.rooms || [];
    
    // Group by room type
    const roomTypesMap = new Map();
    rooms.forEach(room => {
      const typeId = room.room_type_id || room.type_id;
      const typeName = room.room_type_name || room.type_name || `Room Type ${typeId}`;
      if (typeId && !roomTypesMap.has(typeId)) {
        roomTypesMap.set(typeId, {
          id: typeId,
          label: typeName
        });
      }
    });
    
    return Array.from(roomTypesMap.values());
  } catch (error) {
    return [{ id: 'error', label: 'Error loading room types' }];
  }
};

// Attach the id property for Zapier dynamic fields
getPropertiesList.id = getPropertiesList;
getRoomTypesList.id = getRoomTypesList;

/**
 * Format date for Cloudbeds API (YYYY-MM-DD)
 */
const formatDate = (date) => {
  if (!date) return null;
  
  if (typeof date === 'string') {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
      return date.split('T')[0];
    }
    // Try to parse and format
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
  
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  return date;
};

/**
 * Validate reservation data
 */
const validateReservationData = (data) => {
  const errors = [];
  
  if (!data.check_in) {
    errors.push('Check-in date is required');
  }
  
  if (!data.check_out) {
    errors.push('Check-out date is required');
  }
  
  if (data.check_in && data.check_out) {
    const checkIn = new Date(data.check_in);
    const checkOut = new Date(data.check_out);
    
    if (checkOut <= checkIn) {
      errors.push('Check-out date must be after check-in date');
    }
  }
  
  if (!data.guest_first_name) {
    errors.push('Guest first name is required');
  }
  
  if (!data.guest_last_name) {
    errors.push('Guest last name is required');
  }
  
  if (data.guest_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.guest_email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
};

/**
 * Parse API response to standard format
 */
const parseResponse = (response) => {
  // Handle different response formats
  if (response.data) {
    return response.data;
  }
  if (response.reservations) {
    return response.reservations;
  }
  if (response.guests) {
    return response.guests;
  }
  return response;
};

module.exports = {
  getPropertiesList,
  getRoomTypesList,
  formatDate,
  validateReservationData,
  parseResponse
};
