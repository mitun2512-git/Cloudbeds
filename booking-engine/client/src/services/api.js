import axios from 'axios';

// API Base URL - uses environment variable in production, falls back to localhost for development
// In production, set REACT_APP_API_URL to your backend URL (e.g., https://api.hennesseyestate.com)
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api'; // Uses proxy in development (see package.json)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Get room types with availability and pricing
 */
export const getRoomTypes = async (startDate, endDate, propertyId = null) => {
  console.log('getRoomTypes called:', { startDate, endDate, propertyId });
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate
  });
  
  if (propertyId) {
    params.append('property_id', propertyId);
  }

  const url = `/room-types?${params}`;
  console.log('Making API request to:', url);
  try {
    const response = await api.get(url);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

/**
 * Get availability for dates
 */
export const getAvailability = async (startDate, endDate = null, propertyId = null) => {
  const start = startDate;
  const end = endDate || startDate;

  const params = new URLSearchParams({
    start_date: start,
    end_date: end
  });
  
  if (propertyId) {
    params.append('property_id', propertyId);
  }

  const response = await api.get(`/availability?${params}`);
  const payload = response.data || {};
  const availabilityData = payload.availability || payload.data || payload || [];

  // Ensure the client always receives an array
  const availability = Array.isArray(availabilityData)
    ? availabilityData
    : availabilityData && typeof availabilityData === 'object'
      ? Object.values(availabilityData)
      : [];

  return { availability, raw: payload };
};

/**
 * Create a reservation
 * Supports Stripe cardToken for secure card vaulting
 * 
 * @param {Object} reservationData
 * @param {string} reservationData.property_id
 * @param {string} reservationData.room_type_id
 * @param {string} reservationData.check_in - YYYY-MM-DD
 * @param {string} reservationData.check_out - YYYY-MM-DD
 * @param {Object} reservationData.guest - Guest details
 * @param {number} reservationData.adults
 * @param {number} reservationData.children
 * @param {string} [reservationData.cardToken] - Stripe token for card vaulting
 * @param {Array} [reservationData.addons] - Selected add-ons
 * @param {Object} [reservationData.totals] - Price breakdown
 */
export const createReservation = async (reservationData) => {
  const response = await api.post('/reservations', reservationData);
  return response.data;
};

/**
 * Get reservation details
 */
export const getReservation = async (reservationId) => {
  const response = await api.get(`/reservations/${reservationId}`);
  return response.data;
};

/**
 * Get properties
 */
export const getProperties = async () => {
  const response = await api.get('/properties');
  return response.data;
};

/**
 * Get daily reservations
 */
export const getDailyReservations = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const response = await api.get(`/reservations/daily?${params}`);
  return response.data;
};

/**
 * Get reservations enriched with guest emails from Cloudbeds getGuestList API
 * https://developers.cloudbeds.com/reference/get_getguestlist-2
 * @param {string|null} startDate - Start date filter (optional)
 * @param {string|null} endDate - End date filter (optional)  
 * @param {boolean} fetchAll - If true, fetches ALL reservations (ignores date filters)
 */
export const getEnrichedReservations = async (startDate = null, endDate = null, fetchAll = false) => {
  const params = new URLSearchParams();
  if (fetchAll) {
    params.append('all', 'true');
  } else {
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
  }
  
  const response = await api.get(`/reservations/enriched?${params}`);
  return response.data;
};

/**
 * Get guest list with emails
 */
export const getGuests = async () => {
  const response = await api.get('/guests');
  return response.data;
};

/**
 * Get room pricing for campaign validation
 * Returns room types sorted by price with upgrade options
 * @param {string|null} startDate - Start date for pricing (optional)
 * @param {string|null} endDate - End date for pricing (optional)
 */
export const getRoomPricing = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const response = await api.get(`/room-pricing?${params}`);
  return response.data;
};

/**
 * Get reservations with outstanding balance from past 3 days
 */
export const getOutstandingBalanceReservations = async () => {
  const response = await api.get('/reservations/outstanding-balance');
  return response.data;
};

/**
 * Get reservations with service requests (breakfast, cleaning)
 */
export const getReservationsWithServices = async () => {
  const response = await api.get('/reservations/with-services');
  return response.data;
};

/**
 * Get detailed reservation info
 */
export const getReservationDetails = async (reservationId) => {
  const response = await api.get(`/reservation/${reservationId}`);
  return response.data;
};

/**
 * AI Chatbot - Send message
 */
export const sendChatMessage = async (message, sessionId = null) => {
  const response = await api.post('/chatbot/message', { message, sessionId });
  return response.data;
};

/**
 * AI Chatbot - Clear session
 */
export const clearChatSession = async (sessionId) => {
  const response = await api.post('/chatbot/clear', { sessionId });
  return response.data;
};

/**
 * AI Chatbot - Get history
 */
export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/chatbot/history/${sessionId}`);
  return response.data;
};

/**
 * AI Chatbot - Refresh context cache
 */
export const refreshChatbotCache = async () => {
  const response = await api.post('/chatbot/refresh-cache');
  return response.data;
};

/**
 * Revenue Audit - bookings breakdown for a given month/year
 */
export const getRevenueAudit = async (year, month) => {
  const params = new URLSearchParams();
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  const response = await api.get(`/revenue/audit?${params.toString()}`);
  return response.data;
};

/**
 * Get data cache status (last refresh time, etc.)
 */
export const getCacheStatus = async () => {
  const response = await api.get('/cache/status');
  return response.data;
};

/**
 * Trigger manual cache refresh
 */
export const triggerCacheRefresh = async () => {
  const response = await api.post('/cache/refresh');
  return response.data;
};

// ========================================
// Email Marketing API
// ========================================

/**
 * Save or update email draft
 */
export const saveEmailDraft = async (draftData) => {
  const response = await api.post('/email/drafts', draftData);
  return response.data;
};

/**
 * Get all email drafts
 */
export const getEmailDrafts = async () => {
  const response = await api.get('/email/drafts');
  return response.data;
};

/**
 * Get email draft by ID
 */
export const getEmailDraft = async (draftId) => {
  const response = await api.get(`/email/drafts/${draftId}`);
  return response.data;
};

/**
 * Delete email draft
 */
export const deleteEmailDraft = async (draftId) => {
  const response = await api.delete(`/email/drafts/${draftId}`);
  return response.data;
};

/**
 * Create campaign from draft
 */
export const createEmailCampaign = async (campaignData) => {
  const response = await api.post('/email/campaigns', campaignData);
  return response.data;
};

/**
 * Get all email campaigns
 */
export const getEmailCampaigns = async () => {
  const response = await api.get('/email/campaigns');
  return response.data;
};

/**
 * Get email campaign by ID
 */
export const getEmailCampaign = async (campaignId) => {
  const response = await api.get(`/email/campaigns/${campaignId}`);
  return response.data;
};

/**
 * Send email campaign
 */
export const sendEmailCampaign = async (campaignId, recipients = null) => {
  const response = await api.post(`/email/campaigns/${campaignId}/send`, { recipients });
  return response.data;
};

/**
 * Send a test email for a campaign
 */
export const sendTestEmail = async (campaignId, testEmail) => {
  const response = await api.post(`/email/campaigns/${campaignId}/send-test`, { testEmail });
  return response.data;
};

/**
 * Get campaign tracking/analytics
 */
export const getCampaignTracking = async (campaignId) => {
  const response = await api.get(`/email/campaigns/${campaignId}/tracking`);
  return response.data;
};

// ========================================
// Dynamic Pricing API
// ========================================

/**
 * Calculate dynamic price for a room type
 */
export const calculatePrice = async (roomTypeId, checkIn, checkOut, occupancy = 50) => {
  const params = new URLSearchParams({
    room_type_id: roomTypeId,
    check_in: checkIn,
    check_out: checkOut,
    occupancy: occupancy.toString()
  });
  const response = await api.get(`/pricing/calculate?${params}`);
  return response.data;
};

/**
 * Get dynamic prices for all room types
 */
export const getAllRoomPrices = async (checkIn, checkOut, occupancy = 50) => {
  const params = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    occupancy: occupancy.toString()
  });
  const response = await api.get(`/pricing/all-rooms?${params}`);
  return response.data;
};

/**
 * Get pricing calendar for a month
 */
export const getPricingCalendar = async (roomTypeId, year, month) => {
  const params = new URLSearchParams({
    room_type_id: roomTypeId,
    year: year.toString(),
    month: month.toString()
  });
  const response = await api.get(`/pricing/calendar?${params}`);
  return response.data;
};

/**
 * Get pricing recommendations for a date
 */
export const getPricingRecommendations = async (checkIn, occupancy = 50) => {
  const params = new URLSearchParams({
    check_in: checkIn,
    occupancy: occupancy.toString()
  });
  const response = await api.get(`/pricing/recommendations?${params}`);
  return response.data;
};

/**
 * Get pricing engine configuration
 */
export const getPricingConfig = async () => {
  const response = await api.get('/pricing/config');
  return response.data;
};

/**
 * Update base rate for a room type
 */
export const updateBaseRate = async (roomTypeId, baseRate) => {
  const response = await api.post('/pricing/update-rate', {
    room_type_id: roomTypeId,
    base_rate: baseRate
  });
  return response.data;
};

/**
 * Update pricing engine configuration
 */
export const updatePricingConfig = async (config) => {
  const response = await api.post('/pricing/update-config', config);
  return response.data;
};

/**
 * Get historical revenue data from Cloudbeds reservations
 * Returns actual revenue by year/month and 2026 forecast
 */
export const getHistoricalRevenue = async () => {
  const response = await api.get('/revenue/historical');
  return response.data;
};

/**
 * Get comprehensive revenue dashboard data (Diamo-style)
 */
export const getRevenueDashboard = async (year = new Date().getFullYear()) => {
  const response = await api.get(`/revenue/dashboard?year=${year}`);
  return response.data;
};

/**
 * Get pickup report - recent booking activity
 */
export const getPickupReport = async (lookback = 7, forward = 7) => {
  const response = await api.get(`/revenue/pickup?lookback=${lookback}&forward=${forward}`);
  return response.data;
};

/**
 * Get optimal pricing with allocation recommendation
 */
export const getOptimalPricing = async (checkIn, checkOut, occupancy = 50) => {
  const params = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    occupancy: occupancy.toString()
  });
  const response = await api.get(`/pricing/optimal?${params}`);
  return response.data;
};

// ========================================
// Availability Allocation API
// ========================================

/**
 * Get revenue potential comparison: buyout vs individual rooms
 */
export const getRevenuePotential = async (checkIn, checkOut, occupancy = 50) => {
  const params = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    occupancy: occupancy.toString()
  });
  const response = await api.get(`/allocation/revenue-potential?${params}`);
  return response.data;
};

/**
 * Get allocation priority for dates
 */
export const getAllocationPriority = async (checkIn, checkOut, occupancy = 50) => {
  const params = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    occupancy: occupancy.toString()
  });
  const response = await api.get(`/allocation/priority?${params}`);
  return response.data;
};

/**
 * Get allocation decision (what should be available)
 */
export const getAllocationDecision = async (checkIn, checkOut, occupancy = 50) => {
  const params = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    occupancy: occupancy.toString()
  });
  const response = await api.get(`/allocation/decision?${params}`);
  return response.data;
};

/**
 * Get allocation calendar for a date range
 */
export const getAllocationCalendar = async (startDate, endDate, occupancy = 50) => {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    occupancy: occupancy.toString()
  });
  const response = await api.get(`/allocation/calendar?${params}`);
  return response.data;
};

/**
 * Get allocation analytics
 */
export const getAllocationAnalytics = async () => {
  const response = await api.get('/allocation/analytics');
  return response.data;
};

/**
 * Get allocation engine configuration
 */
export const getAllocationConfig = async () => {
  const response = await api.get('/allocation/config');
  return response.data;
};

// ========================================
// Gemini AI Email Creative Assistant
// ========================================

/**
 * Generate high-conversion email creative using Gemini AI
 * @param {Object} params - Generation parameters
 * @param {string} params.strategyType - Type of email strategy (pre_arrival, post_stay, etc.)
 * @param {string} params.strategyTitle - Title of the campaign
 * @param {string} params.strategyDescription - Description of the campaign purpose
 * @param {string} params.targetAudience - Description of target audience
 * @param {string} params.tone - Tone of voice (professional, warm, urgent, luxurious, playful)
 * @param {string[]} params.focusPoints - Key points to emphasize
 * @param {string} params.customInstructions - Additional custom instructions
 * @param {Object} params.existingContent - Existing content to improve (optional)
 */
export const generateEmailCreative = async (params) => {
  const response = await api.post('/email/generate-creative', params);
  return response.data;
};

/**
 * Generate multiple subject line variations using Gemini AI
 * @param {Object} params - Generation parameters
 * @param {string} params.strategyType - Type of email strategy
 * @param {string} params.targetAudience - Target audience description
 * @param {string} params.tone - Tone of voice
 * @param {number} params.count - Number of variations to generate (default 5)
 * @param {string} params.existingSubject - Existing subject to improve (optional)
 */
export const generateSubjectLines = async (params) => {
  const response = await api.post('/email/generate-subjects', params);
  return response.data;
};

/**
 * Improve existing email content using Gemini AI
 * @param {Object} params - Improvement parameters
 * @param {Object} params.content - Existing email content to improve
 * @param {string} params.improvementType - Type of improvement (persuasion, clarity, urgency, personalization, brevity, luxury)
 * @param {string} params.additionalInstructions - Additional instructions (optional)
 */
export const improveEmailContent = async (params) => {
  const response = await api.post('/email/improve-content', params);
  return response.data;
};

export default api;
