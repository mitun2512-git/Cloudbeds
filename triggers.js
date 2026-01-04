/**
 * Zapier Triggers for Cloudbeds
 * These trigger when events happen in Cloudbeds
 */

const CloudbedsClient = require('./lib/cloudbeds-client');
const { parseResponse } = require('./lib/helpers');

/**
 * New Reservation Trigger
 */
const newReservation = {
  key: 'newReservation',
  noun: 'Reservation',
  display: {
    label: 'New Reservation',
    description: 'Triggers when a new reservation is created in Cloudbeds.'
  },
  operation: {
    perform: async (z, bundle) => {
      try {
        const client = new CloudbedsClient(z, bundle.authData.access_token);
        
        // Get recent reservations
        const response = await client.getReservations({
          limit: 100,
          sort: 'created_date',
          sort_order: 'desc'
        });

        // Parse response
        const reservations = parseResponse(response);
        
        // If this is the first poll, return empty array to avoid triggering on old data
        if (!bundle.meta.page) {
          return [];
        }

        // Return reservations sorted by creation date (newest first)
        return reservations.slice(0, 50);
      } catch (error) {
        z.console.error('Error fetching new reservations:', error);
        throw new Error(`Failed to fetch reservations: ${error.message}`);
      }
    },
    canPaginate: true,
    sample: {
      reservation_id: '12345',
      property_id: '67890',
      property_name: 'Sample Hotel',
      guest_first_name: 'John',
      guest_last_name: 'Doe',
      guest_email: 'john.doe@example.com',
      guest_phone: '+1234567890',
      check_in: '2024-01-15',
      check_out: '2024-01-17',
      status: 'confirmed',
      adults: 2,
      children: 0,
      created_date: '2024-01-10T10:00:00Z'
    }
  }
};

/**
 * New In-House Guest Trigger
 */
const newInHouseGuest = {
  key: 'newInHouseGuest',
  noun: 'Guest',
  display: {
    label: 'New In-House Guest',
    description: 'Triggers when a guest checks in.'
  },
  operation: {
    perform: async (z, bundle) => {
      try {
        const client = new CloudbedsClient(z, bundle.authData.access_token);
        
        const response = await client.getReservations({
          status: 'in_house',
          limit: 100,
          sort: 'check_in_date',
          sort_order: 'desc'
        });

        const reservations = parseResponse(response);
        return reservations.slice(0, 50);
      } catch (error) {
        z.console.error('Error fetching in-house guests:', error);
        throw new Error(`Failed to fetch in-house guests: ${error.message}`);
      }
    },
    canPaginate: true,
    sample: {
      reservation_id: '12345',
      property_id: '67890',
      property_name: 'Sample Hotel',
      guest_first_name: 'Jane',
      guest_last_name: 'Smith',
      guest_email: 'jane.smith@example.com',
      check_in: '2024-01-15',
      check_out: '2024-01-17',
      status: 'in_house',
      adults: 2,
      children: 1
    }
  }
};

/**
 * New Checked-Out Guest Trigger
 */
const newCheckedOutGuest = {
  key: 'newCheckedOutGuest',
  noun: 'Guest',
  display: {
    label: 'New Checked-Out Guest',
    description: 'Triggers when a guest checks out.'
  },
  operation: {
    perform: async (z, bundle) => {
      try {
        const client = new CloudbedsClient(z, bundle.authData.access_token);
        
        const response = await client.getReservations({
          status: 'checked_out',
          limit: 100,
          sort: 'check_out_date',
          sort_order: 'desc'
        });

        const reservations = parseResponse(response);
        return reservations.slice(0, 50);
      } catch (error) {
        z.console.error('Error fetching checked-out guests:', error);
        throw new Error(`Failed to fetch checked-out guests: ${error.message}`);
      }
    },
    canPaginate: true,
    sample: {
      reservation_id: '12345',
      property_id: '67890',
      property_name: 'Sample Hotel',
      guest_first_name: 'Bob',
      guest_last_name: 'Johnson',
      guest_email: 'bob.johnson@example.com',
      check_in: '2024-01-10',
      check_out: '2024-01-12',
      status: 'checked_out',
      adults: 1,
      children: 0
    }
  }
};

/**
 * New Cancellation Trigger
 */
const newCancellation = {
  key: 'newCancellation',
  noun: 'Cancellation',
  display: {
    label: 'New Cancellation',
    description: 'Triggers when a reservation is canceled.'
  },
  operation: {
    perform: async (z, bundle) => {
      try {
        const client = new CloudbedsClient(z, bundle.authData.access_token);
        
        const response = await client.getReservations({
          status: 'cancelled',
          limit: 100,
          sort: 'cancelled_date',
          sort_order: 'desc'
        });

        const reservations = parseResponse(response);
        return reservations.slice(0, 50);
      } catch (error) {
        z.console.error('Error fetching cancellations:', error);
        throw new Error(`Failed to fetch cancellations: ${error.message}`);
      }
    },
    canPaginate: true,
    sample: {
      reservation_id: '12345',
      property_id: '67890',
      property_name: 'Sample Hotel',
      guest_first_name: 'Alice',
      guest_last_name: 'Williams',
      guest_email: 'alice.williams@example.com',
      check_in: '2024-01-20',
      check_out: '2024-01-22',
      status: 'cancelled',
      cancelled_date: '2024-01-15T14:30:00Z',
      cancellation_reason: 'Guest request'
    }
  }
};

/**
 * New Guest Trigger
 */
const newGuest = {
  key: 'newGuest',
  noun: 'Guest',
  display: {
    label: 'New Guest',
    description: 'Triggers when a new guest profile is created.'
  },
  operation: {
    perform: async (z, bundle) => {
      try {
        const client = new CloudbedsClient(z, bundle.authData.access_token);
        
        const response = await client.getGuests({
          limit: 100,
          sort: 'created_date',
          sort_order: 'desc'
        });

        const guests = parseResponse(response);
        return guests.slice(0, 50);
      } catch (error) {
        z.console.error('Error fetching new guests:', error);
        throw new Error(`Failed to fetch guests: ${error.message}`);
      }
    },
    canPaginate: true,
    sample: {
      guest_id: '98765',
      first_name: 'Charlie',
      last_name: 'Brown',
      email: 'charlie.brown@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      created_date: '2024-01-10T12:00:00Z'
    }
  }
};

module.exports = {
  newReservation,
  newInHouseGuest,
  newCheckedOutGuest,
  newCancellation,
  newGuest
};

