/**
 * Zapier Searches for Cloudbeds
 * These allow searching for resources in Cloudbeds
 */

const CloudbedsClient = require('./lib/cloudbeds-client');

/**
 * Find Reservation Search
 */
const findReservation = {
  key: 'findReservation',
  noun: 'Reservation',
  display: {
    label: 'Find Reservation',
    description: 'Searches for a reservation by ID or guest information.'
  },
  operation: {
    inputFields: [
      {
        key: 'reservation_id',
        label: 'Reservation ID',
        required: false,
        type: 'string',
        helpText: 'Search by reservation ID'
      },
      {
        key: 'guest_email',
        label: 'Guest Email',
        required: false,
        type: 'string',
        helpText: 'Search by guest email'
      },
      {
        key: 'guest_name',
        label: 'Guest Name',
        required: false,
        type: 'string',
        helpText: 'Search by guest name'
      }
    ],
    perform: async (z, bundle) => {
      const client = new CloudbedsClient(z, bundle.authData.access_token);
      
      // If reservation ID is provided, get specific reservation
      if (bundle.inputData.reservation_id) {
        try {
          const reservation = await client.getReservation(bundle.inputData.reservation_id);
          return [reservation];
        } catch (error) {
          return [];
        }
      }

      // Otherwise, search through reservations
      const params = {};
      if (bundle.inputData.guest_email) {
        params.email = bundle.inputData.guest_email;
      }
      if (bundle.inputData.guest_name) {
        params.name = bundle.inputData.guest_name;
      }

      const response = await client.getReservations(params);
      const reservations = response.data || response.reservations || [];
      return reservations;
    }
  }
};

/**
 * Find Guest Search
 */
const findGuest = {
  key: 'findGuest',
  noun: 'Guest',
  display: {
    label: 'Find Guest',
    description: 'Searches for a guest by ID, email, or name.'
  },
  operation: {
    inputFields: [
      {
        key: 'guest_id',
        label: 'Guest ID',
        required: false,
        type: 'string',
        helpText: 'Search by guest ID'
      },
      {
        key: 'email',
        label: 'Email',
        required: false,
        type: 'string',
        helpText: 'Search by email'
      },
      {
        key: 'name',
        label: 'Name',
        required: false,
        type: 'string',
        helpText: 'Search by name'
      }
    ],
    perform: async (z, bundle) => {
      const client = new CloudbedsClient(z, bundle.authData.access_token);
      
      // If guest ID is provided, get specific guest
      if (bundle.inputData.guest_id) {
        try {
          const guest = await client.getGuest(bundle.inputData.guest_id);
          return [guest];
        } catch (error) {
          return [];
        }
      }

      // Otherwise, search through guests
      const params = {};
      if (bundle.inputData.email) {
        params.email = bundle.inputData.email;
      }
      if (bundle.inputData.name) {
        params.name = bundle.inputData.name;
      }

      const response = await client.getGuests(params);
      const guests = response.data || response.guests || [];
      return guests;
    }
  }
};

module.exports = {
  findReservation,
  findGuest
};

