/**
 * Cloudbeds API Client
 * Handles all API interactions with Cloudbeds
 * Uses Zapier's request method for compatibility
 */

class CloudbedsClient {
  constructor(z, accessToken, baseURL = 'https://hotels.cloudbeds.com/api/v1.2') {
    this.z = z;
    this.accessToken = accessToken;
    this.baseURL = baseURL;
  }

  /**
   * Make an authenticated request to Cloudbeds API
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json'
      }
    };

    // For POST requests, Cloudbeds API may require form-urlencoded for some endpoints
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      // Check if endpoint requires form-urlencoded (like getRoomsAvailability)
      if (endpoint.includes('getRoomsAvailability') || endpoint.includes('Availability')) {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        // Convert data object to URL-encoded string
        const formData = new URLSearchParams();
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        });
        options.body = formData.toString();
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = data;
      }
    } else {
      options.headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await this.z.request(options);
      // Zapier's request returns parsed JSON automatically
      // If it's already an object, return it; otherwise parse
      if (typeof response === 'string') {
        return JSON.parse(response);
      }
      return response;
    } catch (error) {
      // Handle Zapier HTTP errors
      if (error.status) {
        const errorMessage = error.content || error.message || 'Unknown error';
        throw new Error(`Cloudbeds API Error (${error.status}): ${errorMessage}`);
      }
      throw new Error(`Cloudbeds API Error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get reservations
   */
  async getReservations(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/getReservations${queryParams ? `?${queryParams}` : ''}`;
    return this.request('GET', endpoint);
  }

  /**
   * Get a specific reservation by ID
   */
  async getReservation(reservationId) {
    return this.request('GET', `/getReservation/${reservationId}`);
  }

  /**
   * Create a new reservation
   */
  async createReservation(reservationData) {
    return this.request('POST', '/postReservation', reservationData);
  }

  /**
   * Update a reservation
   */
  async updateReservation(reservationId, reservationData) {
    return this.request('PUT', `/putReservation/${reservationId}`, reservationData);
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId, cancellationData = {}) {
    return this.request('POST', `/postReservationCancel/${reservationId}`, cancellationData);
  }

  /**
   * Get guests
   */
  async getGuests(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/getGuests${queryParams ? `?${queryParams}` : ''}`;
    return this.request('GET', endpoint);
  }

  /**
   * Get a specific guest by ID
   */
  async getGuest(guestId) {
    return this.request('GET', `/getGuest/${guestId}`);
  }

  /**
   * Create a new guest
   */
  async createGuest(guestData) {
    return this.request('POST', '/postGuest', guestData);
  }

  /**
   * Update a guest
   */
  async updateGuest(guestId, guestData) {
    return this.request('PUT', `/putGuest/${guestId}`, guestData);
  }

  /**
   * Get properties
   */
  async getProperties() {
    return this.request('GET', '/getProperties');
  }

  /**
   * Get rooms
   */
  async getRooms(propertyId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/getRooms/${propertyId}${queryParams ? `?${queryParams}` : ''}`;
    return this.request('GET', endpoint);
  }

  /**
   * Get availability
   * Uses getRoomsAvailability endpoint (v1.2) with POST method
   */
  async getAvailability(propertyId, params = {}) {
    // Cloudbeds API v1.2 uses POST to /getRoomsAvailability
    // Parameters: propertyID, startDate, endDate
    const requestData = {
      propertyID: propertyId,
      startDate: params.start_date || params.startDate,
      endDate: params.end_date || params.endDate
    };
    return this.request('POST', '/getRoomsAvailability', requestData);
  }

  /**
   * Get transactions
   */
  async getTransactions(propertyId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/getTransactions/${propertyId}${queryParams ? `?${queryParams}` : ''}`;
    return this.request('GET', endpoint);
  }
}

module.exports = CloudbedsClient;

