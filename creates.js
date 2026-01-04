/**
 * Zapier Creates (Actions) for Cloudbeds
 * These perform actions in Cloudbeds
 */

const CloudbedsClient = require('./lib/cloudbeds-client');
const helpers = require('./lib/helpers');
const { formatDate, validateReservationData } = helpers;

/**
 * Create Reservation Action
 */
const createReservation = {
  key: 'createReservation',
  noun: 'Reservation',
  display: {
    label: 'Create Reservation',
    description: 'Creates a new reservation in Cloudbeds.'
  },
  operation: {
    inputFields: [
      {
        key: 'property_id',
        label: 'Property',
        required: true,
        type: 'string',
        dynamic: helpers.getPropertiesList.id,
        helpText: 'Select the property for this reservation'
      },
      {
        key: 'room_type_id',
        label: 'Room Type',
        required: true,
        type: 'string',
        dynamic: helpers.getRoomTypesList.id,
        helpText: 'Select the room type',
        dependsOn: ['property_id']
      },
      {
        key: 'check_in',
        label: 'Check-In Date',
        required: true,
        type: 'datetime',
        helpText: 'Check-in date (YYYY-MM-DD)'
      },
      {
        key: 'check_out',
        label: 'Check-Out Date',
        required: true,
        type: 'datetime',
        helpText: 'Check-out date (YYYY-MM-DD)'
      },
      {
        key: 'guest_first_name',
        label: 'Guest First Name',
        required: true,
        type: 'string'
      },
      {
        key: 'guest_last_name',
        label: 'Guest Last Name',
        required: true,
        type: 'string'
      },
      {
        key: 'guest_email',
        label: 'Guest Email',
        required: false,
        type: 'string'
      },
      {
        key: 'guest_phone',
        label: 'Guest Phone',
        required: false,
        type: 'string'
      },
      {
        key: 'adults',
        label: 'Number of Adults',
        required: false,
        type: 'integer',
        default: 1
      },
      {
        key: 'children',
        label: 'Number of Children',
        required: false,
        type: 'integer',
        default: 0
      },
      {
        key: 'notes',
        label: 'Notes',
        required: false,
        type: 'text'
      }
    ],
    perform: async (z, bundle) => {
      const client = new CloudbedsClient(z, bundle.authData.access_token);
      
      // Format dates
      const checkIn = formatDate(bundle.inputData.check_in);
      const checkOut = formatDate(bundle.inputData.check_out);
      
      const reservationData = {
        property_id: bundle.inputData.property_id,
        room_type_id: bundle.inputData.room_type_id,
        check_in: checkIn,
        check_out: checkOut,
        guest: {
          first_name: bundle.inputData.guest_first_name,
          last_name: bundle.inputData.guest_last_name,
          email: bundle.inputData.guest_email,
          phone: bundle.inputData.guest_phone
        },
        adults: bundle.inputData.adults || 1,
        children: bundle.inputData.children || 0,
        notes: bundle.inputData.notes
      };

      // Validate data
      const validationErrors = validateReservationData({
        check_in: checkIn,
        check_out: checkOut,
        guest_first_name: bundle.inputData.guest_first_name,
        guest_last_name: bundle.inputData.guest_last_name,
        guest_email: bundle.inputData.guest_email
      });

      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }

      try {
        return await client.createReservation(reservationData);
      } catch (error) {
        throw new Error(`Failed to create reservation: ${error.message}`);
      }
    }
  }
};

/**
 * Update Reservation Action
 */
const updateReservation = {
  key: 'updateReservation',
  noun: 'Reservation',
  display: {
    label: 'Update Reservation',
    description: 'Updates an existing reservation in Cloudbeds.'
  },
  operation: {
    inputFields: [
      {
        key: 'reservation_id',
        label: 'Reservation ID',
        required: true,
        type: 'string',
        helpText: 'The ID of the reservation to update'
      },
      {
        key: 'check_in',
        label: 'Check-In Date',
        required: false,
        type: 'datetime',
        helpText: 'New check-in date (YYYY-MM-DD)'
      },
      {
        key: 'check_out',
        label: 'Check-Out Date',
        required: false,
        type: 'datetime',
        helpText: 'New check-out date (YYYY-MM-DD)'
      },
      {
        key: 'guest_first_name',
        label: 'Guest First Name',
        required: false,
        type: 'string'
      },
      {
        key: 'guest_last_name',
        label: 'Guest Last Name',
        required: false,
        type: 'string'
      },
      {
        key: 'guest_email',
        label: 'Guest Email',
        required: false,
        type: 'string'
      },
      {
        key: 'guest_phone',
        label: 'Guest Phone',
        required: false,
        type: 'string'
      },
      {
        key: 'notes',
        label: 'Notes',
        required: false,
        type: 'text'
      }
    ],
    perform: async (z, bundle) => {
      const client = new CloudbedsClient(z, bundle.authData.access_token);
      
      const updateData = {};
      
      if (bundle.inputData.check_in) updateData.check_in = formatDate(bundle.inputData.check_in);
      if (bundle.inputData.check_out) updateData.check_out = formatDate(bundle.inputData.check_out);
      if (bundle.inputData.notes) updateData.notes = bundle.inputData.notes;
      
      if (bundle.inputData.guest_first_name || bundle.inputData.guest_last_name || 
          bundle.inputData.guest_email || bundle.inputData.guest_phone) {
        updateData.guest = {};
        if (bundle.inputData.guest_first_name) updateData.guest.first_name = bundle.inputData.guest_first_name;
        if (bundle.inputData.guest_last_name) updateData.guest.last_name = bundle.inputData.guest_last_name;
        if (bundle.inputData.guest_email) updateData.guest.email = bundle.inputData.guest_email;
        if (bundle.inputData.guest_phone) updateData.guest.phone = bundle.inputData.guest_phone;
      }

      try {
        return await client.updateReservation(bundle.inputData.reservation_id, updateData);
      } catch (error) {
        throw new Error(`Failed to update reservation: ${error.message}`);
      }
    }
  }
};

/**
 * Cancel Reservation Action
 */
const cancelReservation = {
  key: 'cancelReservation',
  noun: 'Reservation',
  display: {
    label: 'Cancel Reservation',
    description: 'Cancels a reservation in Cloudbeds.'
  },
  operation: {
    inputFields: [
      {
        key: 'reservation_id',
        label: 'Reservation ID',
        required: true,
        type: 'string',
        helpText: 'The ID of the reservation to cancel'
      },
      {
        key: 'cancellation_reason',
        label: 'Cancellation Reason',
        required: false,
        type: 'string',
        helpText: 'Reason for cancellation'
      }
    ],
    perform: async (z, bundle) => {
      const client = new CloudbedsClient(z, bundle.authData.access_token);
      
      const cancellationData = {};
      if (bundle.inputData.cancellation_reason) {
        cancellationData.reason = bundle.inputData.cancellation_reason;
      }

      try {
        return await client.cancelReservation(bundle.inputData.reservation_id, cancellationData);
      } catch (error) {
        throw new Error(`Failed to cancel reservation: ${error.message}`);
      }
    }
  }
};

/**
 * Create Guest Action
 */
const createGuest = {
  key: 'createGuest',
  noun: 'Guest',
  display: {
    label: 'Create Guest',
    description: 'Creates a new guest profile in Cloudbeds.'
  },
  operation: {
    inputFields: [
      {
        key: 'first_name',
        label: 'First Name',
        required: true,
        type: 'string'
      },
      {
        key: 'last_name',
        label: 'Last Name',
        required: true,
        type: 'string'
      },
      {
        key: 'email',
        label: 'Email',
        required: false,
        type: 'string'
      },
      {
        key: 'phone',
        label: 'Phone',
        required: false,
        type: 'string'
      },
      {
        key: 'address',
        label: 'Address',
        required: false,
        type: 'text'
      },
      {
        key: 'city',
        label: 'City',
        required: false,
        type: 'string'
      },
      {
        key: 'state',
        label: 'State/Province',
        required: false,
        type: 'string'
      },
      {
        key: 'zip',
        label: 'ZIP/Postal Code',
        required: false,
        type: 'string'
      },
      {
        key: 'country',
        label: 'Country',
        required: false,
        type: 'string'
      }
    ],
    perform: async (z, bundle) => {
      const client = new CloudbedsClient(z, bundle.authData.access_token);
      
      const guestData = {
        first_name: bundle.inputData.first_name,
        last_name: bundle.inputData.last_name,
        email: bundle.inputData.email,
        phone: bundle.inputData.phone,
        address: bundle.inputData.address,
        city: bundle.inputData.city,
        state: bundle.inputData.state,
        zip: bundle.inputData.zip,
        country: bundle.inputData.country
      };

      // Validate required fields
      if (!guestData.first_name || !guestData.last_name) {
        throw new Error('First name and last name are required');
      }

      // Validate email if provided
      if (guestData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) {
        throw new Error('Invalid email format');
      }

      try {
        return await client.createGuest(guestData);
      } catch (error) {
        throw new Error(`Failed to create guest: ${error.message}`);
      }
    }
  }
};

module.exports = {
  createReservation,
  updateReservation,
  cancelReservation,
  createGuest
};

