/**
 * Cloudbeds Booking Engine - Backend API Server
 * Handles Cloudbeds API integration for room availability, pricing, and reservations
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const https = require('https');
require('dotenv').config();

const geminiService = require('./gemini-service');
const revenueService = require('./revenue-service');
const { sendToGemini, refreshReservationCache, shouldRefreshCache } = geminiService;
const { getRevenueReport } = revenueService;
const { generateRevenueAudit } = require('./revenue-service');
const emailMarketing = require('./email-marketing-service');
const guestChatService = require('./guest-chat-service');

// Dynamic Pricing & Availability Allocation
const { pricingEngine, DynamicPricingEngine } = require('./dynamic-pricing-engine');
const { availabilityAllocator, AvailabilityAllocator } = require('./availability-allocator');

// Database services
const db = require('./database/db');
const dbSyncService = require('./database/sync-service');

// Export function to get cached reservations for Gemini service
function getCachedReservations() {
  return dataCache.reservations || [];
}

// Make it available to gemini-service
geminiService.setCachedReservationsGetter(getCachedReservations);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cloudbeds API Configuration (direct access)
const CLOUDBEDS_BASE_URL = 'https://hotels.cloudbeds.com/api/v1.2';
const CLOUDBEDS_ACCESS_TOKEN = process.env.CLOUDBEDS_ACCESS_TOKEN;
const CLOUDBEDS_PROPERTY_ID = process.env.CLOUDBEDS_PROPERTY_ID;

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  if (!CLOUDBEDS_ACCESS_TOKEN) {
    console.error('ERROR: CLOUDBEDS_ACCESS_TOKEN environment variable is required');
    process.exit(1);
  }
  if (!CLOUDBEDS_PROPERTY_ID) {
    console.error('ERROR: CLOUDBEDS_PROPERTY_ID environment variable is required');
    process.exit(1);
  }
}

const hasValidToken = CLOUDBEDS_ACCESS_TOKEN && CLOUDBEDS_ACCESS_TOKEN !== 'your_access_token_here';
const hasValidProperty = CLOUDBEDS_PROPERTY_ID && CLOUDBEDS_PROPERTY_ID !== 'your_property_id_here';

  if (!hasValidToken) {
  console.warn('⚠️  WARNING: CLOUDBEDS_ACCESS_TOKEN not configured. Set it in server/.env for direct API access.');
}

if (!hasValidProperty) {
  console.warn('⚠️  WARNING: CLOUDBEDS_PROPERTY_ID not configured. Some endpoints may not work without a property ID.');
}

// ============================================================================
// DATA CACHE - Refreshed every hour to minimize API calls
// ============================================================================
const dataCache = {
  reservations: [],
  guests: [],
  roomTypes: [],
  lastRefresh: null,
  isRefreshing: false,
  refreshError: null
};

const CACHE_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// ============================================================================
// TOTAL BUYOUT LOGIC
// When Total Buyout is booked, all individual rooms are blocked
// When individual rooms are booked, Total Buyout is blocked
// ============================================================================
const TOTAL_BUYOUT_ROOM_TYPE_ID = '88798581989504';
const TOTAL_BUYOUT_ROOM_TYPE_NAME = 'Total Buyout';

/**
 * Check for Total Buyout conflicts for given dates
 * Returns: { totalBuyoutBooked: boolean, individualRoomsBooked: boolean, blockedRoomTypeIds: string[] }
 */
function checkTotalBuyoutConflicts(startDate, endDate, reservations = []) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let totalBuyoutBooked = false;
  let individualRoomsBooked = false;
  const blockedRoomTypeIds = new Set();
  
  for (const res of reservations) {
    // Skip cancelled reservations
    if (res.status === 'canceled' || res.status === 'cancelled' || res.status === 'no_show') {
      continue;
    }
    
    const resStart = new Date(res.startDate || res.checkIn);
    const resEnd = new Date(res.endDate || res.checkOut);
    
    // Check if dates overlap
    const overlaps = start < resEnd && end > resStart;
    
    if (overlaps) {
      const roomTypeId = res.roomTypeID || res.room_type_id;
      
      if (roomTypeId === TOTAL_BUYOUT_ROOM_TYPE_ID) {
        totalBuyoutBooked = true;
        console.log(`[Total Buyout] Found overlapping Total Buyout reservation: ${res.reservationID}`);
      } else {
        individualRoomsBooked = true;
        blockedRoomTypeIds.add(roomTypeId);
      }
    }
  }
  
  return { totalBuyoutBooked, individualRoomsBooked, blockedRoomTypeIds: Array.from(blockedRoomTypeIds) };
}

/**
 * Apply Total Buyout blocking logic to availability data
 * - If Total Buyout is booked: mark all individual rooms as unavailable
 * - If any individual room is booked: mark Total Buyout as unavailable
 */
function applyTotalBuyoutLogic(availability, conflicts) {
  const { totalBuyoutBooked, individualRoomsBooked } = conflicts;
  
  return availability.map(room => {
    const isTotalBuyout = room.roomTypeId === TOTAL_BUYOUT_ROOM_TYPE_ID || 
                          (room.roomTypeName || '').toLowerCase().includes('total buyout');
    
    if (totalBuyoutBooked && !isTotalBuyout) {
      // Total Buyout is booked - block all individual rooms
      return {
        ...room,
        roomsAvailable: 0,
        blockedReason: 'Property is exclusively booked (Total Buyout)',
        isTotalBuyoutBlocked: true
      };
    }
    
    if (individualRoomsBooked && isTotalBuyout) {
      // Individual rooms are booked - block Total Buyout
      return {
        ...room,
        roomsAvailable: 0,
        blockedReason: 'Individual rooms are already booked for these dates',
        isTotalBuyoutBlocked: true
      };
    }
    
    return room;
  });
}

// Helper function to make Cloudbeds API requests (direct access only)
async function cloudbedsRequest(method, endpoint, data = null, queryParams = {}) {
  if (!hasValidToken) {
    return {
      success: false,
      error: 'CLOUDBEDS_ACCESS_TOKEN missing. Add it to server/.env.',
      status: 500
    };
  }

        try {
          console.log(`[Direct API] Requesting: ${method} ${endpoint}`);
          
          // Bypass SSL validation for dev environment
          const agent = new https.Agent({  
            rejectUnauthorized: false
          });

          const config = {
            method,
            url: `${CLOUDBEDS_BASE_URL}${endpoint}`,
            headers: {
              'Authorization': `Bearer ${CLOUDBEDS_ACCESS_TOKEN}`,
              'Accept': 'application/json'
            },
            httpsAgent: agent
          };

          // For getRoomsAvailability, use form-urlencoded
          if (endpoint.includes('getRoomsAvailability') || endpoint.includes('Availability')) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
              const formData = new URLSearchParams();
              Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                  formData.append(key, data[key]);
                }
              });
              config.data = formData.toString();
            }
          } else {
            config.headers['Content-Type'] = 'application/json';
            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
              config.data = data;
            }
          }

          if (queryParams && Object.keys(queryParams).length > 0) {
            config.params = queryParams;
          }

          const response = await axios(config);
          
          // Check if response is HTML (indicates rate limiting or error page)
          const responseData = response.data;
          if (typeof responseData === 'string' && responseData.includes('<!DOCTYPE html')) {
            console.error('Cloudbeds API returned HTML (likely rate limited)');
            return {
              success: false,
              error: 'API rate limit reached. Please wait a moment and try again.',
              status: 429,
              rateLimited: true
            };
          }
          
          return { success: true, data: responseData };
        } catch (error) {
          // Check if error response is HTML
          const errorData = error.response?.data;
          if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE html')) {
            console.error('Cloudbeds API Error: Rate limited (HTML response)');
          return {
            success: false,
              error: 'API rate limit reached. Please wait a moment and try again.',
              status: 429,
              rateLimited: true
          };
      }

          console.error('Cloudbeds API Error:', errorData || error.message);
  return {
    success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status
  };
        }
}

// API Routes

/**
 * Get daily reservation details for a date range
 * Default: Next 7 days
 * NOW POWERED BY DATABASE
 */
app.get('/api/reservations/daily', async (req, res) => {
  const { fresh } = req.query;
  
  try {
    // Primary: Use database
    await db.initDatabase();
    let reservations = [];
    try {
      reservations = db.getDailyReservations({ limit: 500 });
      console.log(`[Daily] Database query returned ${reservations.length} reservations`);
    } catch (dbErr) {
      console.error(`[Daily] Database query failed:`, dbErr.message);
    }
    
    if (reservations && reservations.length > 0) {
      const stats = db.getReservationStats();
      const lastSync = db.getLastSync();
      
      console.log(`[Daily] Serving ${reservations.length} reservations from DATABASE`);
      return res.json({ 
        data: reservations.map(r => ({
          reservationID: r.reservation_id,
          guestName: r.guest_name,
          guestEmail: r.guest_email || r.guest_email_from_guests,
          startDate: r.start_date,
          endDate: r.end_date,
          status: r.status,
          balance: r.balance,
          total: r.total,
          source: r.source,
          origin: r.origin,
          roomTypeName: r.room_type_name || 'N/A',
          roomName: r.room_name || 'TBD',
          breakfastRequested: r.breakfast_requested,
          cleaningRequested: r.daily_cleaning_requested,
          guestPhone: r.phone || r.cell_phone
        })),
        total: stats.total_reservations || reservations.length,
        lastRefresh: lastSync?.completed_at || dataCache.lastRefresh,
        source: 'database',
        stats
      });
    }
    
    // Fallback: Use cache if database is empty
    if (dataCache.reservations.length > 0 && fresh !== 'true') {
      console.log(`[Daily] Database empty, using cache (${dataCache.reservations.length} reservations)`);
      return res.json({ 
        data: dataCache.reservations, 
        total: dataCache.reservations.length,
        lastRefresh: dataCache.lastRefresh,
        source: 'cache'
      });
    }

    // Last resort: Fetch from API
    console.log(`[Daily] Database and cache empty, fetching from API...`);
    let reservationsFromApi = await fetchAllPages('/getReservations', {
      property_id: CLOUDBEDS_PROPERTY_ID
    }, 'data');
    console.log(`[Daily] Found ${reservationsFromApi.length} total reservations from API`);
    
    res.json({ 
      data: reservations, 
      total: reservations.length,
      lastRefresh: new Date().toISOString(),
      source: 'fresh'
    });
  } catch (err) {
    console.error('[Daily] Error fetching reservations:', err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

/**
 * Get all guests with email addresses using getGuestList endpoint
 * https://developers.cloudbeds.com/reference/get_getguestlist-2
 */
app.get('/api/guests', async (req, res) => {
  console.log('[API] Fetching guests list via getGuestList');
  
  const queryParams = {
    propertyID: CLOUDBEDS_PROPERTY_ID,
    pageSize: 100
  };
  
  const result = await cloudbedsRequest('GET', '/getGuestList', null, queryParams);
  
  if (result.success) {
    const guests = result.data?.data || result.data || [];
    if (guests.length > 0) {
      console.log('[Guests] Sample guest keys:', Object.keys(guests[0]));
      console.log('[Guests] Sample guest email fields:', {
        email: guests[0].email,
        guestEmail: guests[0].guestEmail,
        emailAddress: guests[0].emailAddress
      });
    }
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

/**
 * Helper function to fetch all pages of a paginated Cloudbeds API endpoint
 */
async function fetchAllPages(endpoint, baseParams, dataKey = 'data') {
  let allData = [];
  let page = 1;
  let hasMore = true;
  const pageSize = 100;

  while (hasMore) {
    const params = { ...baseParams, pageNumber: page, pageSize };
    console.log(`[Pagination] Fetching ${endpoint} page ${page}...`);
    
    const result = await cloudbedsRequest('GET', endpoint, null, params);
    
    if (!result.success) {
      console.error(`[Pagination] Error fetching page ${page}:`, result.error);
      break;
    }

    const pageData = result.data?.[dataKey] || result.data || [];
    const dataArray = Array.isArray(pageData) ? pageData : [];
    allData = allData.concat(dataArray);

    const total = result.data?.total || 0;
    const count = result.data?.count || dataArray.length;
    
    console.log(`[Pagination] Page ${page}: got ${dataArray.length} items (${allData.length}/${total} total)`);

    // Check if there are more pages
    hasMore = allData.length < total && dataArray.length === pageSize;
    page++;

    // Safety limit to prevent infinite loops
    if (page > 50) {
      console.warn('[Pagination] Reached page limit (50), stopping');
      break;
    }
  }

  // Deduplicate results (safety check against pagination issues)
  if (allData.length > 0 && typeof allData[0] === 'object') {
    // Determine key property
    const keyProp = allData[0].reservationID ? 'reservationID' : 
                   (allData[0].guestID ? 'guestID' : 
                   (allData[0].guest_id ? 'guest_id' : 
                   (allData[0].id ? 'id' : null)));
                   
    if (keyProp) {
      const uniqueMap = new Map();
      allData.forEach(item => {
        if (item[keyProp]) uniqueMap.set(String(item[keyProp]), item);
      });
      
      if (uniqueMap.size < allData.length) {
        console.log(`[Pagination] Deduplicated ${allData.length} items to ${uniqueMap.size} unique items`);
        allData = Array.from(uniqueMap.values());
      }
    }
  }

  return allData;
}

// ============================================================================
// CACHE REFRESH FUNCTION - Fetches ALL data with pagination
// ============================================================================
async function refreshDataCache() {
  if (dataCache.isRefreshing) {
    console.log('[Cache] Refresh already in progress, skipping...');
    return;
  }

  console.log('[Cache] Starting hourly data refresh...');
  dataCache.isRefreshing = true;
  dataCache.refreshError = null;
  const startTime = Date.now();

  try {
    // Fetch ALL reservations from the start of the current year (or last year to be safe)
    // This ensures we have past data for revenue reports
    const startOfYear = new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0]; // Jan 1st of last year
    console.log(`[Cache] Fetching all reservations since ${startOfYear}...`);
    const reservations = await fetchAllPages('/getReservations', {
      property_id: CLOUDBEDS_PROPERTY_ID,
      checkin_from: startOfYear
    }, 'data');
    console.log(`[Cache] Fetched ${reservations.length} reservations`);

    // Fetch ALL guests (all pages)
    console.log('[Cache] Fetching all guests...');
    const guests = await fetchAllPages('/getGuestList', {
      propertyID: CLOUDBEDS_PROPERTY_ID
    }, 'data');
    console.log(`[Cache] Fetched ${guests.length} guests`);

    // Fetch room types (single request)
    console.log('[Cache] Fetching room types...');
    const roomTypesResult = await cloudbedsRequest('GET', '/getRoomTypes', null, {
      propertyID: CLOUDBEDS_PROPERTY_ID
    });
    const roomTypes = roomTypesResult.success ? (roomTypesResult.data?.data || []) : [];
    console.log(`[Cache] Fetched ${roomTypes.length} room types`);

    // Enrich reservations with room data (first 50 for performance)
    console.log('[Cache] Enriching top 50 reservations with room data...');
    const enrichLimit = 50;
    for (let i = 0; i < Math.min(reservations.length, enrichLimit); i++) {
      const reservation = reservations[i];
      try {
        const detailResult = await cloudbedsRequest('GET', '/getReservation', null, {
          reservationID: reservation.reservationID,
          propertyID: CLOUDBEDS_PROPERTY_ID
        });
        
        if (detailResult.success) {
          const detail = detailResult.data?.data || detailResult.data || {};
          const assignedRoom = detail.assigned?.[0] || {};
          
          reservations[i] = {
            ...reservation,
            roomTypeName: assignedRoom.roomTypeName || null,
            roomName: assignedRoom.roomName || null,
            roomID: assignedRoom.roomID,
            total: detail.total || reservation.balance,
            guestEmail: detail.guestEmail || reservation.guestEmail,
            guestPhone: detail.guestList ? Object.values(detail.guestList)[0]?.guestPhone : null
          };
        }
        
        // Small delay to avoid rate limiting
        if (i < enrichLimit - 1 && i % 10 === 9) {
          await new Promise(r => setTimeout(r, 500));
        }
      } catch (err) {
        console.error(`[Cache] Error enriching ${reservation.reservationID}:`, err.message);
      }
    }

    // Merge guest emails into reservations
    const guestMap = new Map();
    guests.forEach(guest => {
      const guestId = guest.guestID || guest.guest_id;
      if (guestId && guest.email) {
        guestMap.set(String(guestId), guest.email);
      }
    });

    reservations.forEach((res, idx) => {
      const guestId = res.guestID || res.guest_id;
      if (guestId && guestMap.has(String(guestId))) {
        reservations[idx].guestEmail = guestMap.get(String(guestId));
      }
    });

    // Update in-memory cache
    dataCache.reservations = reservations;
    dataCache.guests = guests;
    dataCache.roomTypes = roomTypes;
    dataCache.lastRefresh = new Date().toISOString();
    dataCache.isRefreshing = false;

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Cache] ✅ In-memory refresh complete in ${duration}s`);
    console.log(`[Cache] Stats: ${reservations.length} reservations, ${guests.length} guests, ${roomTypes.length} room types`);
    console.log(`[Cache] Last refresh: ${dataCache.lastRefresh}`);
    
    // Sync to SQLite database (async, non-blocking)
    syncToDatabase(reservations, guests, roomTypes).catch(err => {
      console.error('[Database] Sync error (non-critical):', err.message);
    });

  } catch (err) {
    console.error('[Cache] ❌ Refresh failed:', err.message);
    dataCache.refreshError = err.message;
    dataCache.isRefreshing = false;
  }
}

// ============================================================================
// DATABASE SYNC FUNCTION - Persists data to SQLite
// ============================================================================
async function syncToDatabase(reservations, guests, roomTypes) {
  console.log('[Database] Starting sync to SQLite...');
  const startTime = Date.now();
  
  try {
    // Initialize database if needed
    await db.initDatabase();
    
    const syncLogId = db.startSyncLog('hourly');
    const stats = { processed: 0, created: 0, updated: 0, errors: 0 };
    
    // Sync room types
    for (const rt of roomTypes) {
      if (!rt.roomTypeID) continue;
      try {
        db.execute(`
          INSERT INTO room_types (room_type_id, property_id, room_type_name, room_type_name_short, room_type_description, max_guests, is_virtual, last_synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(room_type_id) DO UPDATE SET
            room_type_name = excluded.room_type_name,
            last_synced_at = datetime('now')
        `, [
          rt.roomTypeID,
          CLOUDBEDS_PROPERTY_ID,
          rt.roomTypeName || null,
          rt.roomTypeNameShort || null,
          rt.roomTypeDescription || null,
          rt.maxGuests || null,
          rt.isVirtual ? 1 : 0
        ]);
      } catch (e) {
        stats.errors++;
      }
    }
    
    // Sync reservations
    for (const res of reservations) {
      stats.processed++;
      try {
        const result = db.upsertReservation({
          reservationID: res.reservationID,
          propertyID: res.propertyID || CLOUDBEDS_PROPERTY_ID,
          guestName: res.guestName,
          guestEmail: res.guestEmail,
          startDate: res.startDate,
          endDate: res.endDate,
          status: res.status,
          total: res.total || res.balance,
          balance: res.balance,
          source: res.source,
          dateCreated: res.dateCreated,
          dateModified: res.dateModified,
          customFields: res.customFields || []
        });
        
        if (result.success) {
          result.changes > 0 ? stats.updated++ : stats.created++;
        }
      } catch (e) {
        stats.errors++;
      }
      
      // Save every 100 records
      if (stats.processed % 100 === 0) {
        db.saveDatabase();
      }
    }
    
    // Sync guests
    for (const guest of guests) {
      try {
        db.upsertGuest({
          guestID: guest.guestID,
          firstName: guest.guestFirstName,
          lastName: guest.guestLastName,
          email: guest.guestEmail || guest.email,
          phone: guest.guestPhone,
          cellPhone: guest.guestCellPhone,
          country: guest.guestCountry,
          city: guest.guestCity,
          state: guest.guestState
        }, guest.reservationID);
      } catch (e) {
        // Ignore guest sync errors
      }
    }
    
    // Final save
    db.saveDatabase();
    db.completeSyncLog(syncLogId, stats);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Database] ✅ Sync complete in ${duration}s - ${stats.processed} reservations, ${stats.updated} updated, ${stats.errors} errors`);
    
  } catch (err) {
    console.error('[Database] ❌ Sync failed:', err.message);
  }
}

// API endpoint to get cache status
app.get('/api/cache/status', async (req, res) => {
  // Get database stats
  let dbStats = null;
  try {
    await db.initDatabase();
    dbStats = db.getReservationStats();
  } catch (e) {
    dbStats = { error: e.message };
  }
  
  res.json({
    lastRefresh: dataCache.lastRefresh,
    isRefreshing: dataCache.isRefreshing,
    refreshError: dataCache.refreshError,
    stats: {
      reservations: dataCache.reservations.length,
      guests: dataCache.guests.length,
      roomTypes: dataCache.roomTypes.length
    },
    database: dbStats,
    nextRefresh: dataCache.lastRefresh 
      ? new Date(new Date(dataCache.lastRefresh).getTime() + CACHE_REFRESH_INTERVAL).toISOString()
      : null
  });
});

// API endpoint to get database-specific status
app.get('/api/database/status', async (req, res) => {
  try {
    await db.initDatabase();
    const stats = db.getReservationStats();
    const lastSync = db.getLastSync();
    
    res.json({
      success: true,
      stats,
      lastSync: lastSync ? {
        type: lastSync.sync_type,
        completedAt: lastSync.completed_at,
        recordsProcessed: lastSync.records_processed
      } : null,
      dbPath: db.DB_PATH
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API endpoint to query reservations from database
app.get('/api/database/reservations', async (req, res) => {
  try {
    await db.initDatabase();
    const { status, startDate, endDate, limit } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (limit) filters.limit = parseInt(limit);
    
    const reservations = db.getReservations(filters);
    res.json({ success: true, data: reservations, total: reservations.length });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API endpoint to manually trigger refresh
app.post('/api/cache/refresh', async (req, res) => {
  if (dataCache.isRefreshing) {
    return res.json({ success: false, message: 'Refresh already in progress' });
  }
  
  refreshDataCache();
  res.json({ success: true, message: 'Refresh started' });
});

/**
 * Get reservations enriched with guest email addresses
 * Fetches ALL reservations (with pagination) and guest list, then merges guest emails
 */
app.get('/api/reservations/enriched', async (req, res) => {
  const { start_date, end_date, all } = req.query;
  
  // Default to next 7 days if not provided, unless 'all' is specified
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  // If 'all' param is true, don't filter by date (get all reservations)
  const fetchAll = all === 'true' || all === '1';
  const checkInFrom = fetchAll ? null : (start_date || today);
  const checkInTo = fetchAll ? null : (end_date || nextWeekStr);

  console.log(`[API] Fetching enriched reservations ${fetchAll ? '(ALL)' : `from ${checkInFrom} to ${checkInTo}`}`);

  // Build reservation query params
  const reservationParams = { property_id: CLOUDBEDS_PROPERTY_ID };
  if (!fetchAll) {
    reservationParams.checkin_from = checkInFrom;
    reservationParams.checkin_to = checkInTo;
  }

  // Fetch all pages of reservations and guests in parallel
  const [allReservations, guestsResult] = await Promise.all([
    fetchAllPages('/getReservations', reservationParams, 'data'),
    cloudbedsRequest('GET', '/getGuestList', null, {
      propertyID: CLOUDBEDS_PROPERTY_ID,
      pageSize: 500
    })
  ]);

  console.log(`[Enriched] Fetched ${allReservations.length} total reservations`);

  // Build a map of guestID to guest data (including email)
  const guestMap = new Map();
  if (guestsResult.success) {
    const guests = guestsResult.data?.data || guestsResult.data || [];
    console.log(`[Enriched] Found ${guests.length} guests`);
    
    guests.forEach(guest => {
      const guestId = guest.guestID || guest.guest_id || guest.id;
      if (guestId) {
        guestMap.set(String(guestId), {
          email: guest.email || guest.guestEmail || guest.emailAddress,
          phone: guest.phone || guest.guestPhone || guest.cellPhone,
          firstName: guest.firstName || guest.guestFirstName,
          lastName: guest.lastName || guest.guestLastName
        });
      }
    });
    console.log(`[Enriched] Guest map size: ${guestMap.size}`);
  }

  // Enrich reservations with guest email data
  const enrichedReservations = allReservations.map(reservation => {
    const guestId = reservation.guestID || reservation.guest_id;
    const guestData = guestMap.get(String(guestId));
    
    return {
      ...reservation,
      guestEmail: guestData?.email || reservation.guestEmail || null,
      guestPhone: guestData?.phone || reservation.guestPhone || null,
      // Mark if email came from guest list
      emailSource: guestData?.email ? 'guestList' : (reservation.guestEmail ? 'reservation' : null)
    };
  });

  // Log enrichment stats
  const withEmail = enrichedReservations.filter(r => r.guestEmail).length;
  console.log(`[Enriched] ${withEmail}/${enrichedReservations.length} reservations have email addresses`);

  res.json({
    success: true,
    data: enrichedReservations,
    count: enrichedReservations.length,
    emailStats: {
      withEmail,
      withoutEmail: enrichedReservations.length - withEmail
    }
  });
});

/**
 * Get detailed reservation info (includes custom fields, room info, etc.)
 */
app.get('/api/reservation/:reservationId', async (req, res) => {
  const { reservationId } = req.params;
  console.log(`[API] Fetching detailed reservation: ${reservationId}`);
  
  const result = await cloudbedsRequest('GET', '/getReservation', null, {
    reservationID: reservationId,
    propertyID: CLOUDBEDS_PROPERTY_ID
  });

  if (result.success) {
    console.log('[Reservation Detail] Keys:', Object.keys(result.data?.data || result.data || {}));
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

/**
 * Get reservations with outstanding balance - checked-in in past 3 days (excluding today)
 * Only includes guests who have actually checked in (status: checked_in or checked_out)
 */
app.get('/api/reservations/outstanding-balance', async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Past 3 days (excluding today): from 3 days ago to yesterday
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const startDate = threeDaysAgo.toISOString().split('T')[0];
  const endDate = yesterday.toISOString().split('T')[0];
  
  console.log(`[API] Fetching reservations with outstanding balance (checked-in from ${startDate} to ${endDate})`);
  
  try {
    // Primary: Use database
    await db.initDatabase();
    const dbReservations = db.getOutstandingBalancePast3Days();
    
    if (dbReservations.length > 0 || db.getReservationStats().total_reservations > 0) {
      console.log(`[Outstanding Balance] Serving ${dbReservations.length} from DATABASE`);
      
      const outstandingReservations = dbReservations.map(r => ({
        reservationID: r.reservation_id,
        guestName: r.guest_name,
        guestEmail: r.guest_email,
        startDate: r.start_date,
        endDate: r.end_date,
        status: r.status,
        balance: r.balance,
        total: r.total,
        source: r.source,
        roomTypeName: r.room_type_name || 'N/A',
        roomName: r.room_name || 'TBD',
        phone: r.phone,
        cellPhone: r.cell_phone
      }));
      
      return res.json({
        success: true,
        data: outstandingReservations,
        count: outstandingReservations.length,
        dateRange: { startDate, endDate },
        filterType: 'checkin',
        source: 'database'
      });
    }
    
    // Fallback: Use Cloudbeds API
    console.log(`[Outstanding Balance] Database empty, fetching from API...`);
    const result = await cloudbedsRequest('GET', '/getReservations', null, {
      property_id: CLOUDBEDS_PROPERTY_ID,
      checkin_from: startDate,
      checkin_to: endDate,
      status: 'checked_in,checked_out'
    });
    
    if (result.success) {
      const reservations = result.data?.data || result.data || [];
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      
      const outstandingReservations = reservations.filter(r => {
        const balance = parseFloat(r.balance) || 0;
        const checkInDate = new Date(r.startDate);
        const isInDateRange = checkInDate >= startDateObj && checkInDate < endDateObj;
        return balance > 0 && isInDateRange;
      });
      
      console.log(`[Outstanding Balance] Found ${outstandingReservations.length}/${reservations.length} from API`);
      
      res.json({
        success: true,
        data: outstandingReservations,
        count: outstandingReservations.length,
        dateRange: { startDate, endDate },
        filterType: 'checkin',
        source: 'api'
      });
    } else {
      res.status(result.status || 500).json({ error: result.error });
    }
  } catch (error) {
    console.error('[Outstanding Balance] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper to get custom field value from Cloudbeds custom fields array
 * Custom fields are stored as: [{ customFieldName: 'Name', customFieldValue: 'Value' }, ...]
 */
function getCustomFieldValue(customFields, fieldNamePattern) {
  if (!Array.isArray(customFields)) return null;
  
  const field = customFields.find(cf => 
    cf.customFieldName && cf.customFieldName.toLowerCase().includes(fieldNamePattern.toLowerCase())
  );
  
  return field ? field.customFieldValue : null;
}

/**
 * Check if a custom field value indicates "yes"
 */
function isYesValue(value) {
  if (!value) return false;
  const normalizedValue = String(value).toLowerCase().trim();
  return normalizedValue.startsWith('yes') || normalizedValue === 'true' || normalizedValue === '1';
}

/**
 * Get reservations with custom field requests (breakfast, cleaning, etc.)
 * Shows guests staying TODAY based on checkout date (checkout >= today)
 * Custom fields in Cloudbeds:
 *   - "Breakfast (Yes or Decline)" 
 *   - "Daily Cleaning (Yes or Decline)"
 * NOW POWERED BY DATABASE
 */
app.get('/api/reservations/with-services', async (req, res) => {
  console.log('[API] Fetching reservations for today based on checkout date');
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  try {
    // Primary: Use database
    await db.initDatabase();
    const services = db.getServicesForToday();
    const stats = db.getReservationStats();
    
    if (stats.total_reservations > 0) {
      console.log(`[Services] Serving from DATABASE - Breakfast: ${services.breakfast.length}, Daily Cleaning: ${services.dailyCleaning.length}, Checkout Cleaning: ${services.checkoutCleaning.length}`);
      
      return res.json({
        success: true,
        data: {
          reservations: [],
          breakfast: services.breakfast.map(r => ({
            reservationID: r.reservation_id,
            guestName: r.guest_name,
            roomNumber: r.room_name,
            roomType: r.room_type_name,
            customFieldValue: r.custom_field_value,
            checkIn: r.start_date,
            checkOut: r.end_date,
            status: r.status
          })),
          cleaning: services.cleaning.map(r => ({
            reservationID: r.reservation_id,
            guestName: r.guest_name,
            roomNumber: r.room_name,
            roomType: r.room_type_name,
            customFieldValue: r.custom_field_value,
            checkIn: r.start_date,
            checkOut: r.end_date,
            status: r.status
          })),
          dailyCleaning: services.dailyCleaning.map(r => ({
            reservationID: r.reservation_id,
            guestName: r.guest_name,
            roomNumber: r.room_name,
            roomType: r.room_type_name,
            customFieldValue: r.custom_field_value,
            checkIn: r.start_date,
            checkOut: r.end_date,
            status: r.status
          })),
          checkoutCleaning: services.checkoutCleaning.map(r => ({
            reservationID: r.reservation_id,
            guestName: r.guest_name,
            roomNumber: r.room_name,
            roomType: r.room_type_name,
            customFieldValue: 'Checkout Turnover',
            checkIn: r.start_date,
            checkOut: r.end_date,
            status: r.status
          }))
        },
        stats: {
          total: 0,
          breakfastCount: services.breakfast.length,
          cleaningCount: services.cleaning.length
        },
        source: 'database'
      });
    }
    
    // Fallback: Use Cloudbeds API
    console.log(`[Services] Database empty, fetching guests staying today (checkout >= ${today})`);
    
    const listResult = await cloudbedsRequest('GET', '/getReservations', null, {
      property_id: CLOUDBEDS_PROPERTY_ID,
      checkout_from: today
    });
    
    if (!listResult.success) {
      return res.status(listResult.status || 500).json({ error: listResult.error });
    }
    
    const allReservations = listResult.data?.data || [];
    // Continue with existing API-based logic below...
  
  // Filter: only include guests who have already checked in (check-in date <= today)
  // AND checkout date >= today (still staying)
  const todayDate = new Date(today);
  const reservations = allReservations.filter(r => {
    const checkIn = new Date(r.startDate);
    const checkOut = new Date(r.endDate);
    const isCheckedIn = checkIn <= todayDate;  // Already arrived
    const isStillStaying = checkOut >= todayDate;  // Hasn't left yet
    return isCheckedIn && isStillStaying;
  });
  
  console.log(`[Services] Found ${reservations.length}/${allReservations.length} guests staying today (checkin <= ${today} AND checkout >= ${today})`);
  
  // Identify checkouts today (for checkout cleaning)
  const checkoutsToday = reservations.filter(r => {
    const checkOut = new Date(r.endDate);
    return checkOut.toISOString().split('T')[0] === today;
  });
  
  console.log(`[Services] Found ${checkoutsToday.length} checkouts today requiring room cleaning`);
  
  // For each reservation, get detailed info to check custom fields
  // Limit to first 50 to avoid too many API calls
  const detailedReservations = [];
  const breakfastRequests = [];
  const dailyCleaningRequests = [];
  const checkoutCleaningRequests = [];
  
  for (const reservation of reservations.slice(0, 50)) {
    const detailResult = await cloudbedsRequest('GET', '/getReservation', null, {
      reservationID: reservation.reservationID,
      propertyID: CLOUDBEDS_PROPERTY_ID
    });
    
    if (detailResult.success) {
      const detail = detailResult.data?.data || detailResult.data || {};
      
      // Custom fields are an array: [{ customFieldName: 'Name', customFieldValue: 'Value' }]
      const customFieldsArray = Array.isArray(detail.customFields) ? detail.customFields : [];
      
      // Get assigned room info
      const assignedRoom = detail.assigned?.[0] || {};
      const roomName = assignedRoom.roomName || 'TBD';
      const roomTypeName = assignedRoom.roomTypeName || reservation.roomTypeName || 'N/A';
      
      // Extract custom field values
      const breakfastValue = getCustomFieldValue(customFieldsArray, 'breakfast');
      const cleaningValue = getCustomFieldValue(customFieldsArray, 'cleaning');
      
      const hasBreakfast = isYesValue(breakfastValue);
      const hasCleaning = isYesValue(cleaningValue);
      
      console.log(`[Services] ${reservation.reservationID}: Breakfast="${breakfastValue}" (${hasBreakfast}), Cleaning="${cleaningValue}" (${hasCleaning})`);
      
      detailedReservations.push({
        ...reservation,
        customFields: customFieldsArray,
        roomName: roomName,
        roomTypeName: roomTypeName,
        breakfastRequested: hasBreakfast,
        cleaningRequested: hasCleaning
      });
      
      // Check for breakfast request
      if (hasBreakfast) {
        breakfastRequests.push({
          reservationID: reservation.reservationID,
          guestName: reservation.guestName || detail.guestName,
          roomNumber: roomName,
          roomType: roomTypeName,
          checkIn: reservation.startDate,
          checkOut: reservation.endDate,
          status: reservation.status,
          customFieldValue: breakfastValue
        });
      }
      
      // Check for daily cleaning request (from custom field)
      if (hasCleaning) {
        dailyCleaningRequests.push({
          reservationID: reservation.reservationID,
          guestName: reservation.guestName || detail.guestName,
          roomNumber: roomName,
          roomType: roomTypeName,
          checkIn: reservation.startDate,
          checkOut: reservation.endDate,
          status: reservation.status,
          customFieldValue: cleaningValue,
          cleaningType: 'daily'
        });
      }
      
      // Check if this is a checkout today (needs checkout cleaning)
      const checkOutDate = new Date(reservation.endDate);
      const isCheckoutToday = checkOutDate.toISOString().split('T')[0] === today;
      if (isCheckoutToday) {
        checkoutCleaningRequests.push({
          reservationID: reservation.reservationID,
          guestName: reservation.guestName || detail.guestName,
          roomNumber: roomName,
          roomType: roomTypeName,
          checkIn: reservation.startDate,
          checkOut: reservation.endDate,
          status: reservation.status,
          customFieldValue: 'Checkout today',
          cleaningType: 'checkout'
        });
      }
    }
  }
  
  // Combine all cleaning requests for total count
  const allCleaningRequests = [...dailyCleaningRequests, ...checkoutCleaningRequests];
  
  console.log(`[Services] Current day (${today}): Breakfast=${breakfastRequests.length}, DailyCleaning=${dailyCleaningRequests.length}, CheckoutCleaning=${checkoutCleaningRequests.length}`);
  
    res.json({
      success: true,
      data: {
        reservations: detailedReservations,
        breakfast: breakfastRequests,
        cleaning: allCleaningRequests,
        dailyCleaning: dailyCleaningRequests,
        checkoutCleaning: checkoutCleaningRequests
      },
      stats: {
        total: detailedReservations.length,
        breakfastCount: breakfastRequests.length,
        cleaningCount: allCleaningRequests.length,
        dailyCleaningCount: dailyCleaningRequests.length,
        checkoutCleaningCount: checkoutCleaningRequests.length
      },
      date: today,
      filterType: 'checked_in_today',
      customFieldsAvailable: [
        'Breakfast (Yes or Decline)',
        'Daily Cleaning (Yes or Decline)'
      ],
      source: 'api'
    });
  } catch (error) {
    console.error('[Services] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get properties
 */
app.get('/api/properties', async (req, res) => {
  const USE_MOCK_MODE = process.env.USE_MOCK_MODE === 'true';
  
  // Mock mode: Return mock property for testing
  if (USE_MOCK_MODE) {
    console.log('[MOCK MODE] Returning mock properties data');
    return res.json({ 
      data: [
        {
          property_id: 'mock_property_1',
          property_name: 'Demo Hotel',
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA'
        }
      ],
      mock: true
    });
  }
  
  const result = await cloudbedsRequest('GET', '/getProperties');
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ 
      error: result.error || 'Failed to fetch properties',
      message: 'Cloudbeds API request failed. Set USE_MOCK_MODE=true in .env for testing.',
      details: result.error
    });
  }
});

/**
 * Get rooms for a property
 */
app.get('/api/rooms', async (req, res) => {
  const propertyId = req.query.property_id || CLOUDBEDS_PROPERTY_ID;
  const queryParams = propertyId ? { property_id: propertyId } : {};
  
  // Use getRoomTypes instead of getRooms
  const result = await cloudbedsRequest('GET', '/getRoomTypes', null, queryParams);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

/**
 * Get availability and pricing for dates or a single day
 * Also fetches room types to provide proper room names
 * Query params:
 *   - date: single date (yyyy-mm-dd)
 *   - start_date / end_date: range (defaults to single day if only start provided)
 */
app.get('/api/availability', async (req, res) => {
  const { property_id, start_date, end_date, date } = req.query;
  const propertyId = property_id || CLOUDBEDS_PROPERTY_ID;

  // Support single-date queries
  // Cloudbeds API requires endDate > startDate, so we add one day if same date
  const resolvedStart = date || start_date;
  let resolvedEnd = end_date || date || start_date;
  
  // If start and end are the same, add one day to end date for Cloudbeds API
  if (resolvedStart === resolvedEnd) {
    const endDateObj = new Date(resolvedEnd);
    endDateObj.setDate(endDateObj.getDate() + 1);
    resolvedEnd = endDateObj.toISOString().split('T')[0];
  }

  if (!resolvedStart) {
    return res.status(400).json({ 
      error: 'Provide date or start_date (end_date optional)',
      message: 'Example: /api/availability?date=2024-12-28'
    });
  }

  try {
    console.log('[Availability] Fetching availability for dates:', resolvedStart, 'to', resolvedEnd);
    
    // Try multiple Cloudbeds API endpoints to get availability and pricing
    // 1. getRoomTypes - gets basic room type info
    // 2. getAvailableRoomTypes - should return available rooms with pricing
    // 3. getRoomsAvailability - room availability calendar
    
    const roomTypesResult = await cloudbedsRequest('GET', '/getRoomTypes', null, { 
      propertyID: propertyId 
    });
    
    // Try getAvailableRoomTypes with the dates
    const availableRoomsResult = await cloudbedsRequest('GET', '/getAvailableRoomTypes', null, {
      propertyID: propertyId,
      startDate: resolvedStart,
      endDate: resolvedEnd,
      adults: 2,
      children: 0,
      rooms: 1
    });
    
    console.log('[Availability] getAvailableRoomTypes success:', availableRoomsResult.success);
    if (availableRoomsResult.data) {
      console.log('[Availability] getAvailableRoomTypes response:', JSON.stringify(availableRoomsResult.data, null, 2).slice(0, 1000));
    }
    
    // Also try to get rate plans for pricing info (requires startDate)
    const ratePlansData = await cloudbedsRequest('GET', '/getRatePlans', null, {
      propertyID: propertyId,
      startDate: resolvedStart,
      endDate: resolvedEnd
    });
    console.log('[Availability] getRatePlans success:', ratePlansData.success);
    if (ratePlansData.data) {
      console.log('[Availability] getRatePlans response:', JSON.stringify(ratePlansData.data, null, 2).slice(0, 2000));
    }
    
    // Use getRatePlans data which has pricing info
    // cloudbedsRequest returns: { success: true, data: { API response } }
    // API response structure: { success: true, data: [...rates...] }
    console.log('[Availability] ratePlansData structure:', {
      outerSuccess: ratePlansData.success,
      dataType: typeof ratePlansData.data,
      innerSuccess: ratePlansData.data?.success,
      innerDataType: Array.isArray(ratePlansData.data?.data) ? 'array' : typeof ratePlansData.data?.data,
      innerDataLength: ratePlansData.data?.data?.length
    });
    
    // Extract the actual rate plans array
    const ratePlansArray = ratePlansData.data?.data;
    const hasRatePlans = ratePlansData.success && Array.isArray(ratePlansArray) && ratePlansArray.length > 0;
    
    // Create a synthetic result that uses the rate plans data
    let ratePlansResult;
    if (hasRatePlans) {
      console.log('[Availability] Using getRatePlans data with', ratePlansArray.length, 'rate plans');
      ratePlansResult = {
        success: true,
        data: { data: ratePlansArray }
      };
  } else {
      console.log('[Availability] Falling back to getAvailableRoomTypes data');
      ratePlansResult = availableRoomsResult;
    }

    // Build room type lookup map
    const roomTypeMap = {};
    console.log('[Availability] getRoomTypes success:', roomTypesResult.success);
    console.log('[Availability] getRoomTypes data keys:', roomTypesResult.data ? Object.keys(roomTypesResult.data) : 'null');
    
    if (roomTypesResult.success) {
      let roomTypesData = roomTypesResult.data?.data || roomTypesResult.data || [];
      
      // Log the actual data structure
      console.log('[Availability] Room types data type:', Array.isArray(roomTypesData) ? 'array' : typeof roomTypesData);
      if (!Array.isArray(roomTypesData) && roomTypesData && typeof roomTypesData === 'object') {
        console.log('[Availability] Room types data keys:', Object.keys(roomTypesData).slice(0, 5));
      }
      
      // Filter out metadata keys if it's an object
      if (!Array.isArray(roomTypesData) && roomTypesData && typeof roomTypesData === 'object') {
        const metadataKeys = ['success', 'message', 'count', 'total', 'error'];
        const dataValues = Object.entries(roomTypesData)
          .filter(([key]) => !metadataKeys.includes(key.toLowerCase()))
          .map(([key, value]) => value)
          .filter(v => v && typeof v === 'object');
        roomTypesData = dataValues.length > 0 ? dataValues : [];
      }
      
      const roomTypesList = Array.isArray(roomTypesData) ? roomTypesData : Object.values(roomTypesData);
      console.log('[Availability] Room types list length:', roomTypesList.length);
      
      roomTypesList.forEach(rt => {
        const id = rt.roomTypeID || rt.room_type_id || rt.id;
        if (id) {
          roomTypeMap[id] = {
            name: rt.roomTypeName || rt.room_type_name || rt.name,
            description: rt.roomTypeDescription || rt.description,
            maxGuests: rt.maxGuests || rt.max_guests,
            roomsToSell: rt.roomsToSell || rt.rooms_to_sell,
            photos: rt.roomTypePhotos || rt.photos || []
          };
        }
      });
      
      console.log('[Availability] Room type map size:', Object.keys(roomTypeMap).length);
    }

    // Process rate plans with room type names
    let availability = [];
    if (ratePlansResult.success) {
      // Log the full response structure for debugging
      console.log('[Availability] Full ratePlansResult.data keys:', 
        ratePlansResult.data ? Object.keys(ratePlansResult.data) : 'null');
      
      // Extract the actual data array from the response
      // Cloudbeds API returns: { success: true, data: [...], count: N }
      let rawData = ratePlansResult.data;
      
      // If response has a nested data property, use that
      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
        if (rawData.data && (Array.isArray(rawData.data) || typeof rawData.data === 'object')) {
          console.log('[Availability] Using nested data property, type:', 
            Array.isArray(rawData.data) ? 'array' : typeof rawData.data);
          rawData = rawData.data;
        }
      }
      
      console.log('[Availability] Raw rate plans data type:', Array.isArray(rawData) ? 'array' : typeof rawData);
      if (!Array.isArray(rawData) && rawData) {
        console.log('[Availability] Raw data keys:', Object.keys(rawData).slice(0, 10));
      }
      
      let items = [];
      if (Array.isArray(rawData)) {
        items = rawData;
      } else if (rawData && typeof rawData === 'object') {
        // Convert object to array, filtering out metadata keys
        const metadataKeys = ['success', 'message', 'count', 'total', 'error'];
        items = Object.entries(rawData)
          .filter(([key]) => !metadataKeys.includes(key.toLowerCase()))
          .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              return { key, ...value };
            }
            return null;
          })
          .filter(Boolean);
      }

      console.log('[Availability] Processed items count:', items.length);

      // Process each item - handle nested rate plans if present
      for (const item of items) {
        // Skip items that don't look like room type data
        if (!item || typeof item !== 'object') continue;
        
        const roomTypeId = item.roomTypeID || item.room_type_id || item.roomTypeId || item.id || item.key;
        const roomTypeName = item.roomTypeName || item.room_type_name || item.name || roomTypeMap[roomTypeId]?.name || 'Room Type';
        const roomTypeInfo = roomTypeMap[roomTypeId] || {};
        
        // Check if this item has nested rate plans
        const ratePlans = item.ratePlans || item.rate_plans || [];
        
        if (Array.isArray(ratePlans) && ratePlans.length > 0) {
          // Expand nested rate plans into separate entries
          for (const rp of ratePlans) {
            availability.push({
              roomTypeId,
              roomTypeName,
              roomTypeDescription: roomTypeInfo.description || item.roomTypeDescription,
              maxGuests: roomTypeInfo.maxGuests || item.maxGuests,
              ratePlanId: rp.ratePlanID || rp.rate_plan_id || rp.ratePlanId || rp.id,
              ratePlanName: rp.ratePlanName || rp.rate_plan_name || rp.name || 'Standard Rate',
              roomsAvailable: rp.roomsAvailable ?? rp.available ?? item.roomsAvailable ?? item.available ?? 0,
              roomRate: rp.roomRate ?? rp.totalRate ?? rp.rate ?? rp.price ?? item.roomRate ?? null,
              currency: rp.currency || item.currency || 'USD',
              startDate: resolvedStart,
              endDate: resolvedEnd
            });
          }
  } else {
          // No nested rate plans, use the item directly
          availability.push({
            roomTypeId,
            roomTypeName,
            roomTypeDescription: roomTypeInfo.description || item.roomTypeDescription,
            maxGuests: roomTypeInfo.maxGuests || item.maxGuests,
            ratePlanId: item.ratePlanID || item.rate_plan_id || item.ratePlanId,
            ratePlanName: item.ratePlanName || item.rate_plan_name || 'Standard Rate',
            roomsAvailable: item.roomsAvailable ?? item.available ?? item.availability ?? item.quantity ?? 0,
            roomRate: item.roomRate ?? item.totalRate ?? item.rate ?? item.price ?? null,
            currency: item.currency || item.rateCurrency || 'USD',
            startDate: resolvedStart,
            endDate: resolvedEnd
          });
        }
      }
      
      console.log('[Availability] Final availability count:', availability.length);
    }

    // Return room types list as well for reference
    const roomTypes = Object.entries(roomTypeMap).map(([id, info]) => ({
      id,
      ...info
    }));
    
    // If no availability data but we have room types, use room types as fallback
    if (availability.length === 0 && Object.keys(roomTypeMap).length > 0) {
      console.log('[Availability] Using room types as fallback');
      availability = Object.entries(roomTypeMap).map(([id, info]) => ({
        roomTypeId: id,
        roomTypeName: info.name || 'Room Type',
        roomTypeDescription: info.description,
        maxGuests: info.maxGuests,
        ratePlanId: null,
        ratePlanName: 'Standard Rate',
        roomsAvailable: info.roomsToSell ?? null, // null means unknown
        roomRate: null, // No rate data available
        currency: 'USD',
        startDate: resolvedStart,
        endDate: resolvedEnd
      }));
    }

    // ========================================================================
    // APPLY TOTAL BUYOUT LOGIC
    // Check cached reservations for conflicts and apply blocking
    // ========================================================================
    const conflicts = checkTotalBuyoutConflicts(resolvedStart, resolvedEnd, dataCache.reservations);
    console.log('[Availability] Total Buyout conflict check:', {
      totalBuyoutBooked: conflicts.totalBuyoutBooked,
      individualRoomsBooked: conflicts.individualRoomsBooked,
      blockedRoomTypeIds: conflicts.blockedRoomTypeIds.length
    });
    
    // Apply blocking logic
    availability = applyTotalBuyoutLogic(availability, conflicts);

    res.json({
      availability,
      roomTypes,
      property_id: propertyId,
      start_date: resolvedStart,
      end_date: resolvedEnd,
      // Include conflict info for frontend
      totalBuyoutStatus: {
        totalBuyoutBooked: conflicts.totalBuyoutBooked,
        individualRoomsBooked: conflicts.individualRoomsBooked,
        message: conflicts.totalBuyoutBooked 
          ? 'Property is exclusively booked' 
          : conflicts.individualRoomsBooked 
            ? 'Individual rooms are booked - Total Buyout unavailable'
            : null
      }
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability data' });
  }
});

/**
 * Get room types with pricing
 */
app.get('/api/room-types', async (req, res) => {
  const { property_id, start_date, end_date } = req.query;
  let propertyId = property_id || CLOUDBEDS_PROPERTY_ID;

  // Validate dates
  if (!start_date || !end_date) {
    return res.status(400).json({ 
      error: 'start_date and end_date are required',
      message: 'Please provide check-in and check-out dates'
    });
  }

  // Mock mode: Return mock data for testing
  const USE_MOCK_MODE = process.env.USE_MOCK_MODE === 'true';
  if (USE_MOCK_MODE) {
    // ... (keep mock logic)
    const mockRooms = [
      {
        id: 'room_1',
        name: 'Deluxe Room',
        type: 'Deluxe',
        max_occupancy: 2,
        price: 150.00,
        available: true,
        description: 'Spacious room with city view'
      },
      {
        id: 'room_2',
        name: 'Suite',
        type: 'Suite',
        max_occupancy: 4,
        price: 250.00,
        available: true,
        description: 'Luxurious suite with living area'
      },
      {
        id: 'room_3',
        name: 'Standard Room',
        type: 'Standard',
        max_occupancy: 2,
        price: 100.00,
        available: true,
        description: 'Comfortable standard room'
      }
    ];
    return res.json({ room_types: mockRooms, mock: true });
  }

  try {
    // Get room types (basic info)
    const roomsResult = await cloudbedsRequest('GET', '/getRoomTypes', null, propertyId ? { property_id: propertyId } : {});
    
    if (!roomsResult.success) {
      const errorMsg = roomsResult.error || 'Failed to fetch rooms from Cloudbeds API';
      console.error('Cloudbeds API Error:', errorMsg);
      return res.status(roomsResult.status || 500).json({ 
        error: errorMsg,
        details: roomsResult.status === 401 ? 'Invalid or missing access token. Please check your CLOUDBEDS_ACCESS_TOKEN in server/.env' : 
                roomsResult.status === 404 ? 'Property not found or endpoint invalid.' :
                'Check server logs for more details'
      });
    }

    // Get availability and pricing using getRatePlans
    const availabilityResult = await cloudbedsRequest('GET', '/getRatePlans', null, {
      startDate: start_date,
      endDate: end_date
    });
    
    if (!availabilityResult.success) {
      console.warn('Failed to fetch availability:', availabilityResult.error);
      // Continue with just room info if availability fails? Or error out?
      // Let's return error for now as pricing is required
      return res.status(availabilityResult.status || 500).json({ error: availabilityResult.error });
    }

    // Combine room types with availability and pricing
    const rooms = roomsResult.data?.data || roomsResult.data || [];
    const ratesData = availabilityResult.data?.data || availabilityResult.data || [];
    
    // Group rates by room type
    // ratesData is array of rate plans
    const ratesByRoomType = {};
    if (Array.isArray(ratesData)) {
      ratesData.forEach(rate => {
        const typeId = rate.roomTypeID || rate.room_type_id;
        if (typeId) {
          // Store the best rate/availability? Or all?
          // For simplicity, let's take the first one or the one with availability
          if (!ratesByRoomType[typeId] || (rate.roomsAvailable > 0 && ratesByRoomType[typeId].roomsAvailable === 0)) {
            ratesByRoomType[typeId] = {
              available: rate.roomsAvailable,
              price: rate.roomRate || rate.totalRate,
              currency: 'USD' // Default, API doesn't seem to return currency in getRatePlans?
            };
          }
        }
      });
    }

    // Map rooms to output format
    const roomTypes = rooms.map(room => {
      const typeId = room.roomTypeID || room.room_type_id || room.id;
      const rateInfo = ratesByRoomType[typeId] || { available: 0, price: null, currency: 'USD' };

      return {
        id: typeId,
        name: room.roomTypeName || room.room_type_name || room.name,
        description: room.roomTypeDescription || room.description || '',
        max_occupancy: room.maxGuests || room.max_occupancy || 2,
        beds: room.beds || [],
        amenities: room.amenities || [],
        images: room.images || [],
        available: rateInfo.available,
        price: rateInfo.price,
        currency: rateInfo.currency
      };
    });

    res.json({ room_types: roomTypes });
  } catch (error) {
    console.error('Error getting room types:', error);
    res.status(500).json({ error: 'Failed to get room types' });
  }
});

/**
 * Get room pricing for validation (sorted by price)
 * Used for upsell campaign validation - checks if upgrade rooms are available
 */
app.get('/api/room-pricing', async (req, res) => {
  const { start_date, end_date } = req.query;
  
  // Default to next weekend if not provided
  const now = new Date();
  const defaultStart = start_date || now.toISOString().split('T')[0];
  const nextDay = new Date(now);
  nextDay.setDate(now.getDate() + 1);
  const defaultEnd = end_date || nextDay.toISOString().split('T')[0];

  console.log(`[API] Fetching room pricing from ${defaultStart} to ${defaultEnd}`);

  try {
    // Get both room types and rate plans
    const [roomTypesResult, ratePlansResult] = await Promise.all([
      cloudbedsRequest('GET', '/getRoomTypes', null, { property_id: CLOUDBEDS_PROPERTY_ID }),
      cloudbedsRequest('GET', '/getRatePlans', null, {
        propertyID: CLOUDBEDS_PROPERTY_ID,
        startDate: defaultStart,
        endDate: defaultEnd
      })
    ]);

    const roomTypes = roomTypesResult.data?.data || [];
    const ratePlans = ratePlansResult.data?.data || [];

    // Create a map of room type names
    const roomTypeMap = {};
    roomTypes.forEach(rt => {
      roomTypeMap[rt.roomTypeID] = {
        id: rt.roomTypeID,
        name: rt.roomTypeName,
        description: rt.roomTypeDescription,
        maxGuests: rt.maxGuests
      };
    });

    // Process rate plans to get pricing per room type (standard rates only)
    const roomPricing = {};
    ratePlans.forEach(rp => {
      const isDerived = rp.isDerived || rp.is_derived;
      const isStandard = (rp.ratePlanName || '').toLowerCase().includes('standard') || 
                        (rp.ratePlanNamePublic || '').toLowerCase().includes('standard');
      
      // Prefer standard rates, but take any non-derived rate
      if (!isDerived && (isStandard || !roomPricing[rp.roomTypeID])) {
        roomPricing[rp.roomTypeID] = {
          id: rp.roomTypeID,
          name: rp.roomTypeName || roomTypeMap[rp.roomTypeID]?.name || 'Unknown',
          price: parseFloat(rp.roomRate || rp.totalRate || 0),
          available: rp.roomsAvailable || 0,
          ratePlanId: rp.ratePlanID,
          ratePlanName: rp.ratePlanName || 'Standard Rate'
        };
      }
    });

    // Convert to array and sort by price
    const pricingArray = Object.values(roomPricing)
      .filter(r => r.price > 0)
      .sort((a, b) => a.price - b.price);

    // Add upgrade possibilities
    const withUpgrades = pricingArray.map((room, idx) => ({
      ...room,
      upgradeOptions: pricingArray.slice(idx + 1).map(upgrade => ({
        id: upgrade.id,
        name: upgrade.name,
        price: upgrade.price,
        priceDifference: upgrade.price - room.price,
        available: upgrade.available > 0
      }))
    }));

    res.json({
      success: true,
      data: withUpgrades,
      dateRange: { start: defaultStart, end: defaultEnd },
      totalRoomTypes: withUpgrades.length,
      upgradesAvailable: withUpgrades.some(r => r.upgradeOptions.some(u => u.available))
    });
  } catch (error) {
    console.error('Error getting room pricing:', error);
    res.status(500).json({ success: false, error: 'Failed to get room pricing' });
  }
});

/**
 * Create a reservation
 * Supports Stripe token for secure card vaulting in Cloudbeds
 * 
 * Body params:
 *   - cardToken: Stripe token (tok_xxx) for secure card storage
 *   - addons: Array of selected add-ons
 *   - totals: Price breakdown
 */
app.post('/api/reservations', async (req, res) => {
  const {
    property_id,
    room_type_id,
    check_in,
    check_out,
    guest,
    adults,
    children,
    payment_data,
    notes,
    cardToken,  // Stripe token for card vaulting
    addons,     // Selected add-ons
    totals      // Price breakdown
  } = req.body;

  const propertyId = property_id || CLOUDBEDS_PROPERTY_ID;

  // Mock mode: Return mock reservation
  const USE_MOCK_MODE = process.env.USE_MOCK_MODE === 'true';
  if (USE_MOCK_MODE) {
    console.log('[MOCK MODE] Creating mock reservation');
    if (!propertyId || !room_type_id || !check_in || !check_out || !guest) {
      return res.status(400).json({ 
        error: 'Missing required fields: property_id, room_type_id, check_in, check_out, guest',
        received: {
          property_id: !!propertyId,
          room_type_id: !!room_type_id,
          check_in: !!check_in,
          check_out: !!check_out,
          guest: !!guest
        }
      });
    }
    const mockReservation = {
      reservationID: `HE-${Date.now()}`,
      property_id: propertyId,
      room_type_id,
      check_in,
      check_out,
      guest,
      adults: adults || 1,
      children: children || 0,
      status: 'confirmed',
      total_amount: totals?.total || 330.00,
      cardOnFile: !!cardToken,
      mock: true
    };
    return res.json({ success: true, reservation: mockReservation });
  }

  if (!propertyId || !room_type_id || !check_in || !check_out || !guest) {
    return res.status(400).json({ 
      error: 'Missing required fields: property_id, room_type_id, check_in, check_out, guest' 
    });
  }

  console.log('[Reservation] Creating reservation with Stripe token:', cardToken ? 'Yes' : 'No');

  // Prepare reservation data for Cloudbeds API
  // See: https://developers.cloudbeds.com/docs/pass-stripe-tokens-to-cloudbeds
  const reservationData = {
    propertyID: propertyId,
    roomTypeID: room_type_id,
    startDate: check_in,
    endDate: check_out,
    guestFirstName: guest.first_name,
    guestLastName: guest.last_name,
    guestEmail: guest.email,
    guestPhone: guest.phone,
    guestAddress: guest.address || '',
    guestCity: guest.city || '',
    guestState: guest.state || '',
    guestZip: guest.zip || '',
    guestCountry: guest.country || 'US',
    adults: adults || 1,
    children: children || 0,
    source: 'Direct Booking Engine'
  };

  // Add Stripe card token if provided (for Cloudbeds vault)
  if (cardToken) {
    reservationData.cardToken = cardToken;
    console.log('[Reservation] Card token included for vaulting');
  }

  // Build notes with add-ons info
  let reservationNotes = notes || '';
  if (addons && addons.length > 0) {
    const addonsList = addons.map(a => `- ${a.name}: $${a.price}`).join('\n');
    reservationNotes += `\n\nSelected Add-ons:\n${addonsList}`;
  }
  if (totals) {
    reservationNotes += `\n\nPrice Breakdown:\n- Room: $${totals.room}\n- Add-ons: $${totals.addons}\n- Taxes: $${totals.taxes?.toFixed(2)}\n- Total: $${totals.total?.toFixed(2)}`;
  }
  if (reservationNotes.trim()) {
    reservationData.guestNotes = reservationNotes.trim();
  }

  // Create reservation via Cloudbeds API
  const result = await cloudbedsRequest('POST', '/postReservation', reservationData);

  if (result.success) {
    const reservation = result.data?.data || result.data;
    const reservationId = reservation.reservationID || reservation.reservation_id || reservation.id;

    console.log('[Reservation] Created successfully:', reservationId);

    // Legacy: Process payment if provided (old flow - kept for backward compat)
    if (payment_data && reservationId && !cardToken) {
      const paymentResult = await processPayment(reservationId, payment_data);
      if (!paymentResult.success) {
        return res.status(200).json({
          success: true,
          reservation,
          payment: { success: false, error: paymentResult.error },
          message: 'Reservation created but payment failed. Please contact support.'
        });
      }
    }

    res.json({
      success: true,
      reservation: {
        ...reservation,
        reservationID: reservationId,
        cardOnFile: !!cardToken
      }
    });
  } else {
    console.error('[Reservation] Failed:', result.error);
    res.status(result.status || 500).json({ 
      success: false,
      error: result.error 
    });
  }
});

/**
 * Process payment for a reservation
 */
async function processPayment(reservationId, paymentData) {
  // Cloudbeds payment processing endpoint
  // Note: Actual payment processing may vary based on Cloudbeds API version
  const paymentEndpoint = `/postReservationPayment/${reservationId}`;
  
  const paymentPayload = {
    amount: paymentData.amount,
    payment_method: paymentData.payment_method || 'credit_card',
    card_number: paymentData.card_number,
    card_expiry: paymentData.card_expiry,
    card_cvv: paymentData.card_cvv,
    cardholder_name: paymentData.cardholder_name,
    currency: paymentData.currency || 'USD'
  };

  return await cloudbedsRequest('POST', paymentEndpoint, paymentPayload);
}

/**
 * Confirm a reservation
 */
async function confirmReservation(reservationId) {
  // Update reservation status to confirmed
  const updateData = {
    status: 'confirmed'
  };

  return await cloudbedsRequest('PUT', `/putReservation/${reservationId}`, updateData);
}

/**
 * Get reservation details
 */
app.get('/api/reservations/:id', async (req, res) => {
  const { id } = req.params;
  
  const result = await cloudbedsRequest('GET', `/getReservation/${id}`);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

// ========================================
// Gemini AI Chatbot Endpoints
// ========================================

// Store conversation history per session
const chatSessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of chatSessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      chatSessions.delete(sessionId);
      console.log(`[Chatbot] Cleaned up session: ${sessionId}`);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

/**
 * Send message to AI chatbot
 */
app.post('/api/chatbot/message', async (req, res) => {
  const { message, sessionId } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  const sid = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Get or create session
  let session = chatSessions.get(sid);
  if (!session) {
    session = {
      messages: [],
      lastActivity: Date.now(),
      created: Date.now()
    };
    chatSessions.set(sid, session);
    console.log(`[Chatbot] New session created: ${sid}`);
  }
  
  session.lastActivity = Date.now();
  
  // Add user message to history
  session.messages.push({
    role: 'user',
    content: message
  });
  
  // Keep only last 20 messages for context
  if (session.messages.length > 20) {
    session.messages = session.messages.slice(-20);
  }
  
  // Check if we should refresh the reservation cache
  if (shouldRefreshCache()) {
    await refreshReservationCache(cloudbedsRequest);
  }
  
  console.log(`[Chatbot] Processing message for session ${sid}: "${message.substring(0, 50)}..."`);
  
  // Send to Gemini
  const result = await sendToGemini(session.messages, cloudbedsRequest);
  
  if (result.success) {
    // Add assistant response to history
    session.messages.push({
      role: 'assistant',
      content: result.response
    });
    
    res.json({
      success: true,
      response: result.response,
      sessionId: sid,
      functionsCalled: result.functionsCalled,
      liveDataFetched: result.functionsCalled // If functions were called, live data was fetched
    });
  } else {
    // Check if this was a rate limit or other API issue
    const statusCode = result.rateLimited ? 429 : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error || 'Failed to get response from AI',
      sessionId: sid,
      rateLimited: result.rateLimited || false
    });
  }
});

/**
 * Clear chat session
 */
app.post('/api/chatbot/clear', (req, res) => {
  const { sessionId } = req.body;
  
  if (sessionId && chatSessions.has(sessionId)) {
    chatSessions.delete(sessionId);
    console.log(`[Chatbot] Session cleared: ${sessionId}`);
  }
  
  res.json({ success: true, message: 'Session cleared' });
});

/**
 * Get chat session history
 */
app.get('/api/chatbot/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  const session = chatSessions.get(sessionId);
  
  if (session) {
    res.json({
      success: true,
      messages: session.messages,
      created: session.created
    });
  } else {
    res.json({
      success: true,
      messages: [],
      created: null
    });
  }
});

/**
 * Refresh reservation cache for chatbot context
 */
app.post('/api/chatbot/refresh-cache', async (req, res) => {
  const refreshed = await refreshReservationCache(cloudbedsRequest);
  
  res.json({
    success: refreshed,
    message: refreshed ? 'Cache refreshed successfully' : 'Failed to refresh cache'
  });
});

// ============================================================================
// GUEST CHAT API ENDPOINTS - For prospective guests on the public website
// ============================================================================

/**
 * Send message to guest chat AI
 * Requires guest info (name, email) before responding
 */
app.post('/api/guest-chat/message', async (req, res) => {
  const { message, guestInfo, conversationHistory, interactionId } = req.body;
  
  // Validate guest info
  if (!guestInfo || !guestInfo.name || !guestInfo.email) {
    return res.status(400).json({ 
      error: 'Guest information required',
      requiresGuestInfo: true,
      message: 'Please provide your name and email to start chatting with us.'
    });
  }
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  console.log(`[GuestChat] Message from ${guestInfo.name} (${guestInfo.email}): ${message.substring(0, 100)}...`);
  
  try {
    // Send to AI
    const result = await guestChatService.sendGuestMessage(message, conversationHistory || []);
    
    if (result.success) {
      // Build messages array for storage
      const messages = [
        ...(conversationHistory || []),
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: result.response, timestamp: new Date().toISOString() }
      ];
      
      // Save or update interaction
      let interaction;
      if (interactionId) {
        interaction = guestChatService.updateGuestInteraction(interactionId, [
          { role: 'user', content: message },
          { role: 'assistant', content: result.response }
        ]);
      } else {
        interaction = guestChatService.saveGuestInteraction(guestInfo, messages, {
          startedAt: new Date().toISOString(),
          userAgent: req.headers['user-agent'],
          referrer: req.headers['referer'],
          ipAddress: req.ip
        });
      }
      
      res.json({
        success: true,
        response: result.response,
        interactionId: interaction?.id || interactionId
      });
    } else {
      res.json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('[GuestChat] Error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: 'We apologize for the inconvenience. Please try again or contact us directly at info@hennesseyestate.com'
    });
  }
});

/**
 * Get all guest chat interactions (for dashboard)
 */
app.get('/api/guest-chat/interactions', (req, res) => {
  const { page, limit, startDate, endDate, email, name } = req.query;
  
  const result = guestChatService.getGuestInteractions({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50,
    startDate,
    endDate,
    email,
    name
  });
  
  res.json(result);
});

/**
 * Get a single guest chat interaction
 */
app.get('/api/guest-chat/interactions/:interactionId', (req, res) => {
  const { interactionId } = req.params;
  
  const interaction = guestChatService.getGuestInteraction(interactionId);
  
  if (interaction) {
    res.json({ success: true, interaction });
  } else {
    res.status(404).json({ error: 'Interaction not found' });
  }
});

/**
 * Get guest chat statistics
 */
app.get('/api/guest-chat/stats', (req, res) => {
  const stats = guestChatService.getChatStats();
  res.json(stats);
});

/**
 * Push chat summary to Whistle (Cloudbeds Guest Experience)
 * This creates a guest note/message in Whistle for staff follow-up
 */
app.post('/api/whistle/push-summary', async (req, res) => {
  const { guestInfo, summary, messages, reason } = req.body;
  
  if (!guestInfo || !guestInfo.email) {
    return res.status(400).json({ error: 'Guest info required' });
  }
  
  console.log(`[Whistle] Pushing chat summary for ${guestInfo.name} (${guestInfo.email})`);
  console.log(`[Whistle] Reason: ${reason}`);
  
  try {
    // Build a detailed summary for the staff
    let staffNote = `🤖 AI Concierge Chat Summary\n`;
    staffNote += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    staffNote += `Guest: ${guestInfo.name}\n`;
    staffNote += `Email: ${guestInfo.email}\n`;
    if (guestInfo.phone) staffNote += `Phone: ${guestInfo.phone}\n`;
    staffNote += `Time: ${new Date().toLocaleString()}\n`;
    staffNote += `Transfer Reason: ${reason || 'Chat session ended'}\n`;
    staffNote += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Add recent conversation (last 8 messages)
    const recentMessages = (messages || []).slice(-8);
    if (recentMessages.length > 0) {
      staffNote += `📝 Recent Conversation:\n\n`;
      recentMessages.forEach(msg => {
        const role = msg.role === 'assistant' ? '🤖 AI' : '👤 Guest';
        const content = msg.content.length > 250 ? msg.content.substring(0, 250) + '...' : msg.content;
        staffNote += `${role}: ${content}\n\n`;
      });
    }
    
    // Store the summary locally for staff review
    const chatSummary = {
      id: `whistle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      guestInfo,
      reason,
      summary: staffNote,
      messageCount: messages?.length || 0,
      timestamp: new Date().toISOString(),
      status: 'pending_review'
    };
    
    // Store in memory (in production, save to database)
    if (!global.whistleSummaries) {
      global.whistleSummaries = [];
    }
    global.whistleSummaries.unshift(chatSummary);
    
    // Keep only last 500 summaries in memory
    if (global.whistleSummaries.length > 500) {
      global.whistleSummaries = global.whistleSummaries.slice(0, 500);
    }
    
    // Try to push to Cloudbeds Whistle API if available
    // Note: Whistle API integration would require specific endpoints
    // For now, we store locally and could integrate with email notification
    
    // Optional: Send email notification to staff
    if (reason && reason !== 'Chat session ended') {
      console.log(`[Whistle] Transfer request - would notify staff for: ${guestInfo.email}`);
      // Could integrate with email service here:
      // await sendStaffNotification(chatSummary);
    }
    
    res.json({ 
      success: true, 
      summaryId: chatSummary.id,
      message: 'Chat summary stored for staff review'
    });
    
  } catch (error) {
    console.error('[Whistle] Error pushing summary:', error);
    res.status(500).json({ error: 'Failed to push summary' });
  }
});

/**
 * Get Whistle chat summaries (for staff dashboard)
 */
app.get('/api/whistle/summaries', (req, res) => {
  const summaries = global.whistleSummaries || [];
  const { status, limit } = req.query;
  
  let filtered = summaries;
  if (status) {
    filtered = summaries.filter(s => s.status === status);
  }
  
  res.json({
    total: filtered.length,
    summaries: filtered.slice(0, parseInt(limit) || 50)
  });
});

/**
 * Update Whistle summary status
 */
app.patch('/api/whistle/summaries/:summaryId', (req, res) => {
  const { summaryId } = req.params;
  const { status, note } = req.body;
  
  const summaries = global.whistleSummaries || [];
  const summary = summaries.find(s => s.id === summaryId);
  
  if (!summary) {
    return res.status(404).json({ error: 'Summary not found' });
  }
  
  if (status) summary.status = status;
  if (note) summary.staffNote = note;
  summary.updatedAt = new Date().toISOString();
  
  res.json({ success: true, summary });
});

/**
 * Enrich reservations with detailed room/tax/fees info from balanceDetailed
 * Uses Cloudbeds balanceDetailed for accurate breakdown:
 *   - subTotal: room revenue
 *   - additionalItems: fees
 *   - taxesFees: taxes
 */
async function enrichReservationsWithDetail(reservations) {
  const batchSize = 5;
  for (let i = 0; i < reservations.length; i += batchSize) {
    const batch = reservations.slice(i, i + batchSize);
    await Promise.all(batch.map(async (r) => {
      // Skip if already enriched with proper breakdown
      if (r._enriched) return;
      try {
        const detailResult = await cloudbedsRequest('GET', '/getReservation', null, {
          reservationID: r.reservationID,
          propertyID: CLOUDBEDS_PROPERTY_ID
        });
        if (detailResult.success) {
          const detail = detailResult.data?.data || detailResult.data || {};
          const balanceDetailed = detail.balanceDetailed || {};
          
          // Use balanceDetailed for accurate breakdown
          r.roomRevenue = parseFloat(balanceDetailed.subTotal || 0);
          r.fees = parseFloat(balanceDetailed.additionalItems || 0);
          r.tax = parseFloat(balanceDetailed.taxesFees || 0);
          r.total = parseFloat(balanceDetailed.grandTotal || detail.total || 0);
          
          // Fallback to room totals if subTotal is 0
          if (r.roomRevenue === 0) {
            const assigned = Array.isArray(detail.assigned) ? detail.assigned : [];
            r.roomRevenue = assigned.reduce((sum, room) => sum + parseFloat(room.roomTotal || 0), 0);
          }
          
          r._enriched = true;
        }
      } catch (err) {
        console.error(`[Revenue Audit] Failed to enrich ${r.reservationID}:`, err.message);
      }
    }));
    if (i + batchSize < reservations.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  return reservations;
}

/**
 * Get detailed revenue audit report
 */
app.get('/api/revenue/report', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ 
        success: false, 
        error: 'Start date and end date are required' 
      });
    }

    const report = await getRevenueReport(start, end, {}, {
      cloudbedsRequest,
      getCachedReservations: () => dataCache.reservations
    });
    
    res.json(report);
  } catch (error) {
    console.error('[Revenue] Error generating report:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Revenue Audit endpoint
 * GET /api/revenue/audit?year=2025&month=11
 * Returns per-booking breakdown (room rate, tax, fees, total) for the given month.
 */
app.get('/api/revenue/audit', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || 11; // default to November

    if (!year || month < 1 || month > 12) {
      return res.status(400).json({ success: false, error: 'Invalid year or month' });
    }

    // Use string comparison for reliable date filtering (YYYY-MM-DD format)
    const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
    const endStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    console.log(`[Revenue Audit] Filtering for ${startStr} to ${endStr}`);

    const all = getCachedReservations();
    
    // Debug: look for the Oct 31 reservation specifically
    const oct31Res = all.find(r => r.startDate && r.startDate.includes('2025-10-31'));
    if (oct31Res) {
      console.log(`[Revenue Audit] DEBUG: Found Oct 31 reservation:`, {
        id: oct31Res.reservationID,
        startDate: oct31Res.startDate,
        status: oct31Res.status,
        substring: (oct31Res.startDate || '').substring(0, 10)
      });
    }
    
    const inMonth = all.filter(r => {
      // Extract just the date portion (YYYY-MM-DD) from startDate
      const checkIn = (r.startDate || '').substring(0, 10);
      const inRange = checkIn >= startStr && checkIn <= endStr && r.status !== 'canceled';
      
      // Debug: log any dates at boundary
      if (checkIn && (checkIn.startsWith('2025-10') || checkIn.startsWith('2025-12'))) {
        console.log(`[Revenue Audit] Boundary check: ${r.reservationID} checkIn=${checkIn}, inRange=${inRange}`);
      }
      
      return inRange;
    });
    
    console.log(`[Revenue Audit] Found ${inMonth.length} reservations in range`);

    await enrichReservationsWithDetail(inMonth);

    // Map enriched data to rows - data comes from Cloudbeds balanceDetailed
    const rows = inMonth.map(r => {
      const roomRate = parseFloat(r.roomRevenue || 0);
      const tax = parseFloat(r.tax || 0);
      const fees = parseFloat(r.fees || 0);
      const total = parseFloat(r.total || 0);

      return {
        reservationID: r.reservationID,
        guestName: r.guestName || (r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : 'Unknown Guest'),
        checkIn: r.startDate,
        checkOut: r.endDate,
        roomType: r.roomTypeName || 'Unknown',
        roomRate: Number.isFinite(roomRate) ? Number(roomRate.toFixed(2)) : 0,
        tax: Number.isFinite(tax) ? Number(tax.toFixed(2)) : 0,
        fees: Number.isFinite(fees) ? Number(fees.toFixed(2)) : 0,
        total: Number.isFinite(total) ? Number(total.toFixed(2)) : 0
      };
    });

    const totals = rows.reduce((acc, r) => {
      acc.roomRate += r.roomRate;
      acc.tax += r.tax;
      acc.fees += r.fees;
      acc.total += r.total;
      return acc;
    }, { roomRate: 0, tax: 0, fees: 0, total: 0 });

    res.json({
      success: true,
      month,
      year,
      count: rows.length,
      totals: {
        roomRate: Number(totals.roomRate.toFixed(2)),
        tax: Number(totals.tax.toFixed(2)),
        fees: Number(totals.fees.toFixed(2)),
        total: Number(totals.total.toFixed(2))
      },
      bookings: rows.sort((a, b) => b.roomRate - a.roomRate)
    });
  } catch (error) {
    console.error('[Revenue Audit] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Revenue Dashboard Endpoints (Diamo-style)
// ========================================

/**
 * Get comprehensive revenue dashboard data
 * Replicates Diamo.ai functionality
 * FIXED: Uses reservation_rooms.room_total for accurate revenue data
 */
app.get('/api/revenue/dashboard', async (req, res) => {
  try {
    await db.initDatabase();
    
    const { year = new Date().getFullYear() } = req.query;
    const currentYear = parseInt(year);
    const lastYear = currentYear - 1;
    const currentMonth = new Date().getMonth() + 1;
    const TOTAL_ROOMS = 6;
    const TOTAL_AVAILABLE_ROOM_NIGHTS = TOTAL_ROOMS * 365;
    
    // 1. Get YTD metrics for current year
    // Revenue from reservation_rooms.room_total (accurate data)
    // Room nights = count of room records (each represents a room assignment)
    const ytdQuery = `
      SELECT 
        COUNT(DISTINCT r.reservation_id) as bookings,
        COALESCE(SUM(rr.room_total), 0) as revenue,
        COUNT(rr.id) as room_records,
        SUM(CAST(julianday(COALESCE(rr.end_date, r.end_date)) - julianday(COALESCE(rr.start_date, r.start_date)) AS INTEGER)) as room_nights
      FROM reservations r
      LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
      WHERE r.status NOT IN ('canceled', 'no_show')
      AND strftime('%Y', r.start_date) = ?
    `;
    
    const currentYearData = db.query(ytdQuery, [currentYear.toString()])?.[0] || {};
    const lastYearData = db.query(ytdQuery, [lastYear.toString()])?.[0] || {};
    
    // Calculate metrics
    const roomsSold = parseInt(currentYearData.room_nights) || 0;
    const roomsSoldLY = parseInt(lastYearData.room_nights) || 0;
    const revenue = parseFloat(currentYearData.revenue) || 0;
    const revenueLY = parseFloat(lastYearData.revenue) || 0;
    const adr = roomsSold > 0 ? revenue / roomsSold : 0;
    const adrLY = roomsSoldLY > 0 ? revenueLY / roomsSoldLY : 0;
    const occupancy = (roomsSold / TOTAL_AVAILABLE_ROOM_NIGHTS) * 100;
    const occupancyLY = (roomsSoldLY / TOTAL_AVAILABLE_ROOM_NIGHTS) * 100;
    const revpar = revenue / TOTAL_AVAILABLE_ROOM_NIGHTS;
    const revparLY = revenueLY / TOTAL_AVAILABLE_ROOM_NIGHTS;
    
    // Calculate YoY changes
    const calcChange = (current, last) => last > 0 ? ((current - last) / last * 100).toFixed(1) : null;
    
    // 2. Get monthly breakdown
    // Revenue from reservation_rooms.room_total
    const monthlyQuery = `
      SELECT 
        strftime('%m', r.start_date) as month,
        COUNT(DISTINCT r.reservation_id) as bookings,
        COALESCE(SUM(rr.room_total), 0) as revenue,
        COUNT(rr.id) as room_records,
        SUM(CAST(julianday(COALESCE(rr.end_date, r.end_date)) - julianday(COALESCE(rr.start_date, r.start_date)) AS INTEGER)) as room_nights
      FROM reservations r
      LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
      WHERE r.status NOT IN ('canceled', 'no_show')
      AND strftime('%Y', r.start_date) = ?
      GROUP BY strftime('%m', r.start_date)
      ORDER BY month
    `;
    
    const monthlyDataCY = db.query(monthlyQuery, [currentYear.toString()]) || [];
    const monthlyDataLY = db.query(monthlyQuery, [lastYear.toString()]) || [];
    
    // Build monthly arrays
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    const monthlyRevenue = Array(12).fill(0);
    const monthlyADR = Array(12).fill(0);
    const monthlyOcc = Array(12).fill(0);
    const monthlyRevPAR = Array(12).fill(0);
    const monthlyRoomNights = Array(12).fill(0);
    const monthlyRevenueLY = Array(12).fill(0);
    
    monthlyDataCY.forEach(row => {
      const idx = parseInt(row.month) - 1;
      const rev = parseFloat(row.revenue) || 0;
      const nights = parseInt(row.room_nights) || 0;
      const availableNights = TOTAL_ROOMS * DAYS_IN_MONTH[idx];
      
      monthlyRevenue[idx] = Math.round(rev);
      monthlyRoomNights[idx] = nights;
      monthlyADR[idx] = nights > 0 ? Math.round(rev / nights) : 0;
      monthlyOcc[idx] = Math.round((nights / availableNights) * 100);
      monthlyRevPAR[idx] = Math.round(rev / availableNights);
    });
    
    monthlyDataLY.forEach(row => {
      const idx = parseInt(row.month) - 1;
      monthlyRevenueLY[idx] = Math.round(parseFloat(row.revenue) || 0);
    });
    
    // 3. Get current month detailed metrics
    const currentMonthStr = currentMonth.toString().padStart(2, '0');
    const currentMonthMetrics = monthlyDataCY.find(m => m.month === currentMonthStr) || {};
    const currentMonthRevenue = parseFloat(currentMonthMetrics.revenue) || 0;
    const currentMonthNights = parseInt(currentMonthMetrics.room_nights) || 0;
    const availableNightsThisMonth = TOTAL_ROOMS * DAYS_IN_MONTH[currentMonth - 1];
    
    // 4. Get distribution by source (using reservation_rooms for accurate revenue)
    const distributionQuery = `
      SELECT 
        COALESCE(r.source, 'Direct') as source,
        COUNT(DISTINCT r.reservation_id) as count,
        COALESCE(SUM(rr.room_total), 0) as revenue,
        COUNT(rr.id) as room_nights
      FROM reservations r
      LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
      WHERE r.status NOT IN ('canceled', 'no_show')
      AND strftime('%Y', r.start_date) = ?
      GROUP BY COALESCE(r.source, 'Direct')
      ORDER BY revenue DESC
    `;
    
    const distributionData = db.query(distributionQuery, [currentYear.toString()]) || [];
    const totalDistRevenue = distributionData.reduce((sum, d) => sum + (parseFloat(d.revenue) || 0), 0);
    
    const distribution = distributionData.map(d => ({
      source: d.source || 'Direct',
      count: parseInt(d.count) || 0,
      revenue: parseFloat(d.revenue) || 0,
      roomNights: parseInt(d.room_nights) || 0,
      percentage: totalDistRevenue > 0 ? Math.round((parseFloat(d.revenue) / totalDistRevenue) * 100) : 0
    }));
    
    // 5. Competitor data (from scraped data)
    let competitors = [];
    try {
      const competitorRates = require('../data/competitor-rates-v2.json');
      const competitorMap = {};
      competitorRates.forEach(c => {
        if (!competitorMap[c.competitor]) {
          competitorMap[c.competitor] = { name: c.competitor, rates: [] };
        }
        if (c.rate) competitorMap[c.competitor].rates.push(c.rate);
      });
      
      competitors = Object.values(competitorMap)
        .map(c => ({
          name: c.name,
          avgRate: c.rates.length > 0 ? Math.round(c.rates.reduce((a, b) => a + b, 0) / c.rates.length) : 0
        }))
        .filter(c => c.avgRate > 0)
        .sort((a, b) => a.avgRate - b.avgRate)
        .slice(0, 5);
    } catch (e) {
      console.log('[Dashboard] No competitor data available');
    }
    
    res.json({
      success: true,
      year: currentYear,
      overview: {
        roomsSold: { value: roomsSold, lastYear: roomsSoldLY, change: calcChange(roomsSold, roomsSoldLY) },
        adr: { value: Math.round(adr), lastYear: Math.round(adrLY), change: calcChange(adr, adrLY) },
        occupancy: { value: Math.round(occupancy), lastYear: Math.round(occupancyLY), change: calcChange(occupancy, occupancyLY) },
        revpar: { value: Math.round(revpar), lastYear: Math.round(revparLY), change: calcChange(revpar, revparLY) },
        revenue: { value: Math.round(revenue), lastYear: Math.round(revenueLY), change: calcChange(revenue, revenueLY) }
      },
      monthly: {
        labels: MONTH_NAMES,
        revenue: monthlyRevenue,
        revenueLY: monthlyRevenueLY,
        adr: monthlyADR,
        occupancy: monthlyOcc,
        revpar: monthlyRevPAR,
        roomNights: monthlyRoomNights
      },
      currentMonth: {
        name: MONTH_NAMES[currentMonth - 1],
        year: currentYear,
        roomsSold: currentMonthNights,
        occupancy: Math.round((currentMonthNights / availableNightsThisMonth) * 100),
        adr: currentMonthNights > 0 ? Math.round(currentMonthRevenue / currentMonthNights) : 0,
        revpar: Math.round(currentMonthRevenue / availableNightsThisMonth),
        revenue: Math.round(currentMonthRevenue)
      },
      distribution,
      competitors
    });
    
  } catch (error) {
    console.error('[Revenue Dashboard] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get pickup report - recent booking activity
 */
app.get('/api/revenue/pickup', async (req, res) => {
  try {
    await db.initDatabase();
    
    const { lookback = 7, forward = 7 } = req.query;
    const lookbackDays = parseInt(lookback);
    const forwardDays = parseInt(forward);
    
    const today = new Date().toISOString().split('T')[0];
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);
    const lookbackStr = lookbackDate.toISOString().split('T')[0];
    
    const forwardDate = new Date();
    forwardDate.setDate(forwardDate.getDate() + forwardDays);
    const forwardStr = forwardDate.toISOString().split('T')[0];
    
    // Get reservations created in lookback period for forward dates
    const pickupQuery = `
      SELECT 
        date(r.date_created) as created_date,
        r.start_date,
        COUNT(DISTINCT r.reservation_id) as bookings,
        COALESCE(SUM(rr.room_total), SUM(r.total), 0) as revenue,
        COUNT(DISTINCT rr.id) as room_nights
      FROM reservations r
      LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
      WHERE r.status NOT IN ('canceled', 'no_show')
      AND date(r.date_created) >= ?
      AND date(r.date_created) <= ?
      AND r.start_date >= ?
      AND r.start_date <= ?
      GROUP BY date(r.date_created)
      ORDER BY created_date
    `;
    
    const pickupData = db.query(pickupQuery, [lookbackStr, today, today, forwardStr]) || [];
    
    // Calculate totals
    const totalRevenue = pickupData.reduce((sum, d) => sum + (parseFloat(d.revenue) || 0), 0);
    const totalNights = pickupData.reduce((sum, d) => sum + (parseInt(d.room_nights) || 0), 0);
    const adr = totalNights > 0 ? totalRevenue / totalNights : 0;
    
    // Build daily breakdown for chart
    const dailyPickup = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = lookbackDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = pickupData.find(p => p.created_date === dateStr);
      
      dailyPickup.push({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        revenue: Math.round(parseFloat(dayData?.revenue) || 0),
        nights: parseInt(dayData?.room_nights) || 0
      });
    }
    
    res.json({
      success: true,
      lookbackDays,
      forwardDays,
      summary: {
        roomsSold: totalNights,
        adr: Math.round(adr),
        revenue: Math.round(totalRevenue)
      },
      daily: dailyPickup
    });
    
  } catch (error) {
    console.error('[Pickup Report] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Revenue Forecast Endpoints
// ========================================

/**
 * Get historical revenue by year for forecasting
 * Queries SQLite database for accurate revenue data with room totals
 * USES SEASONALITY-NORMALIZED FORECASTING for partial years
 */
app.get('/api/revenue/historical', async (req, res) => {
  try {
    await db.initDatabase();
    
    // Query revenue by year and month from database
    const revenueQuery = `
      SELECT 
        strftime('%Y', r.start_date) as year,
        strftime('%m', r.start_date) as month,
        COUNT(DISTINCT r.reservation_id) as booking_count,
        COALESCE(SUM(r.total), 0) as reservation_total,
        COALESCE(SUM(rr.room_total), 0) as room_total
      FROM reservations r
      LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
      WHERE r.status NOT IN ('canceled', 'no_show')
      AND r.start_date IS NOT NULL
      GROUP BY strftime('%Y', r.start_date), strftime('%m', r.start_date)
      ORDER BY year, month
    `;
    
    const result = db.query(revenueQuery);
    
    if (!result || result.length === 0) {
      return res.json({
        success: true,
        message: 'No revenue data in database',
        years: {},
        dataSource: 'SQLite database'
      });
    }

    // Napa Valley Seasonality Weights (from dynamic-pricing-engine.js)
    // 0=Jan, 1=Feb, 2=Mar (Winter Low: 0.85)
    // 3=Apr, 4=May (Spring Wine: 1.20)
    // 5=Jun, 6=Jul, 7=Aug (Summer Peak: 1.30)
    // 8=Sep, 9=Oct (Harvest: 1.45)
    // 10=Nov, 11=Dec (Holiday: 1.25)
    const SEASONALITY_WEIGHTS = [
      0.85, 0.85, 0.85, // Jan-Mar
      1.20, 1.20,       // Apr-May
      1.30, 1.30, 1.30, // Jun-Aug
      1.45, 1.45,       // Sep-Oct
      1.25, 1.25        // Nov-Dec
    ];

    // Group by year
    const revenueByYear = {};
    
    result.forEach(row => {
      const year = parseInt(row.year);
      const monthIdx = parseInt(row.month) - 1; // Convert 1-12 to 0-11
      
      const revenue = Math.max(
        parseFloat(row.reservation_total) || 0,
        parseFloat(row.room_total) || 0
      );
      
      if (!revenueByYear[year]) {
        revenueByYear[year] = {
          total: 0,
          monthly: Array(12).fill(0),
          bookingCount: 0,
          monthlyBookings: Array(12).fill(0),
          activeMonths: [] // Track which months have data
        };
      }
      
      revenueByYear[year].monthly[monthIdx] = Math.round(revenue);
      revenueByYear[year].monthlyBookings[monthIdx] = parseInt(row.booking_count) || 0;
      
      if (revenue > 0) {
        revenueByYear[year].activeMonths.push(monthIdx);
      }
    });

    // Calculate totals
    Object.keys(revenueByYear).forEach(year => {
      revenueByYear[year].total = revenueByYear[year].monthly.reduce((a, b) => a + b, 0);
      revenueByYear[year].bookingCount = revenueByYear[year].monthlyBookings.reduce((a, b) => a + b, 0);
    });

    // ---------------------------------------------------------
    // SOPHISTICATED FORECASTING LOGIC
    // ---------------------------------------------------------
    const currentYear = new Date().getFullYear();
    const forecastYear = 2026;
    let forecast2026 = null;
    const growthTarget = 0.06; // 6% YoY growth target
    
    // Determine baseline year (prefer 2025)
    const baselineYear = revenueByYear[2025] ? 2025 : (Object.keys(revenueByYear).sort().pop() || currentYear - 1);
    const baselineData = revenueByYear[baselineYear];

    if (baselineData && baselineData.activeMonths.length > 0) {
      // 1. Calculate "Normalized Base Monthly Revenue" from active months
      // This represents what an "average" month (weight 1.0) would earn
      let weightedRevenueSum = 0;
      let weightsSum = 0;

      baselineData.activeMonths.forEach(monthIdx => {
        weightedRevenueSum += baselineData.monthly[monthIdx]; // Actual revenue
        weightsSum += SEASONALITY_WEIGHTS[monthIdx];          // Weight for that month
      });

      // Normalized Base = Total Active Revenue / Sum of Active Weights
      // e.g., if we only have high season, this correctly lowers the base.
      const normalizedBaseRevenue = weightedRevenueSum / weightsSum;

      // 2. Reconstruct a "Full Theoretical 2025"
      // Apply seasonality weights to the normalized base for ALL months
      const theoreticalMonthly2025 = SEASONALITY_WEIGHTS.map(weight => 
        Math.round(normalizedBaseRevenue * weight)
      );

      // 3. Apply Growth Target to get 2026 Forecast
      const forecastMonthly = theoreticalMonthly2025.map(val => Math.round(val * (1 + growthTarget)));
      const forecastTotal = forecastMonthly.reduce((a, b) => a + b, 0);

      forecast2026 = {
        total: forecastTotal,
        monthly: forecastMonthly,
        growthRate: `${(growthTarget * 100).toFixed(1)}%`,
        basedOn: `Normalized seasonality model (Base year: ${baselineYear})`,
        methodology: "Seasonality-adjusted reconstruction from partial year data"
      };

    } else {
      // Fallback if no data
      forecast2026 = {
        total: 0,
        monthly: Array(12).fill(0),
        growthRate: '0%',
        basedOn: 'Insufficient historical data'
      };
    }

    // Calculate future bookings on books for 2026
    const today = new Date().toISOString().split('T')[0];
    const bookingsOnBooksQuery = `
      SELECT COALESCE(SUM(r.total), 0) + COALESCE(SUM(rr.room_total), 0) as future_revenue
      FROM reservations r
      LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
      WHERE r.status NOT IN ('canceled', 'no_show')
      AND strftime('%Y', r.start_date) = '2026'
      AND r.start_date >= ?
    `;
    
    const bookingsResult = db.query(bookingsOnBooksQuery, [today]);
    const bookingsOnBooks2026 = bookingsResult?.[0]?.future_revenue || 0;

    // Get total reservation count from database
    const countResult = db.query('SELECT COUNT(*) as count FROM reservations WHERE status NOT IN ("canceled", "no_show")');
    const totalReservations = countResult?.[0]?.count || 0;

    res.json({
      success: true,
      years: revenueByYear,
      forecast2026,
      bookingsOnBooks2026: Math.round(parseFloat(bookingsOnBooks2026) || 0),
      dataSource: 'SQLite database (synced from Cloudbeds)',
      totalReservationsAnalyzed: totalReservations
    });
    
  } catch (error) {
    console.error('[Revenue Historical] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Email Marketing Endpoints
// ========================================

/**
 * Save or update email draft
 * POST /api/email/drafts
 * Body: { id?, strategyType, strategyId, subject, preheader, greeting, body, cta, ctaUrl, footer, targetGuests }
 */
app.post('/api/email/drafts', async (req, res) => {
  try {
    // Ensure database is initialized
    await db.initDatabase();
    emailMarketing.initWithDatabase(db);
    
    const draft = await emailMarketing.saveDraft(req.body);
    
    if (!draft || !draft.id) {
      console.error('[Email API] Draft save returned invalid result:', draft);
      // Try to get the draft by querying the database directly
      const allDrafts = await emailMarketing.getAllDrafts();
      const latestDraft = allDrafts && allDrafts.length > 0 ? allDrafts[0] : null;
      if (latestDraft && latestDraft.id) {
        console.log('[Email API] Using latest draft as fallback:', latestDraft.id);
        return res.json({ success: true, draft: latestDraft });
      }
      return res.status(500).json({ success: false, error: 'Failed to save draft - invalid response from saveDraft' });
    }
    
    // Ensure draft is properly serializable
    const draftResponse = {
      id: draft.id,
      strategyType: draft.strategyType,
      strategyId: draft.strategyId,
      subject: draft.subject,
      preheader: draft.preheader,
      greeting: draft.greeting,
      body: draft.body,
      cta: draft.cta,
      ctaUrl: draft.ctaUrl,
      footer: draft.footer,
      targetGuestFilter: draft.targetGuestFilter || {},
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy
    };
    
    res.json({ success: true, draft: draftResponse });
  } catch (error) {
    console.error('[Email] Error saving draft:', error);
    console.error('[Email] Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get all drafts
 * GET /api/email/drafts
 */
app.get('/api/email/drafts', async (req, res) => {
  try {
    const drafts = await emailMarketing.getAllDrafts();
    res.json({ success: true, drafts });
  } catch (error) {
    console.error('[Email] Error getting drafts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get draft by ID
 * GET /api/email/drafts/:id
 */
app.get('/api/email/drafts/:id', async (req, res) => {
  try {
    const draft = await emailMarketing.getDraft(req.params.id);
    if (!draft) {
      return res.status(404).json({ success: false, error: 'Draft not found' });
    }
    res.json({ success: true, draft });
  } catch (error) {
    console.error('[Email] Error getting draft:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete draft
 * DELETE /api/email/drafts/:id
 */
app.delete('/api/email/drafts/:id', async (req, res) => {
  try {
    const deleted = await emailMarketing.deleteDraft(req.params.id);
    res.json({ success: deleted, message: deleted ? 'Draft deleted' : 'Draft not found' });
  } catch (error) {
    console.error('[Email] Error deleting draft:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create campaign from draft
 * POST /api/email/campaigns
 * Body: { draftId, name?, recipients, scheduledFor? }
 * Recipients can be provided or will be fetched from database based on draft's targetGuestFilter
 */
app.post('/api/email/campaigns', async (req, res) => {
  try {
    // If recipients not provided, fetch from database based on draft filter
    let recipients = req.body.recipients;
    if (!recipients || recipients.length === 0) {
      const draft = await emailMarketing.getDraft(req.body.draftId);
      if (draft && draft.targetGuestFilter) {
        // Query database for matching guests
        const filters = draft.targetGuestFilter;
        const reservations = db.getReservations(filters);
        
        // Get guests with emails from database
        recipients = [];
        for (const reservation of reservations) {
          if (reservation.guest_email) {
            recipients.push({
              email: reservation.guest_email,
              guestName: reservation.guest_name,
              guestID: reservation.guest_id,
              startDate: reservation.start_date,
              endDate: reservation.end_date,
              roomTypeName: reservation.room_type_name || null
            });
          }
        }
      }
    }
    
    const campaign = await emailMarketing.createCampaign(req.body.draftId, {
      ...req.body,
      recipients: recipients || []
    });
    res.json({ success: true, campaign });
  } catch (error) {
    console.error('[Email] Error creating campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get all campaigns
 * GET /api/email/campaigns
 */
app.get('/api/email/campaigns', async (req, res) => {
  try {
    const campaigns = await emailMarketing.getAllCampaigns();
    res.json({ success: true, campaigns });
  } catch (error) {
    console.error('[Email] Error getting campaigns:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get campaign by ID
 * GET /api/email/campaigns/:id
 */
app.get('/api/email/campaigns/:id', async (req, res) => {
  try {
    const campaign = await emailMarketing.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    res.json({ success: true, campaign });
  } catch (error) {
    console.error('[Email] Error getting campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Send test email for a campaign or draft
 * POST /api/email/campaigns/:id/send-test
 * POST /api/email/drafts/:id/send-test
 * Body: { testEmail } - email address to send test to
 */
app.post('/api/email/campaigns/:id/send-test', async (req, res) => {
  try {
    const { testEmail } = req.body;
    if (!testEmail || !testEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid test email address is required' });
    }
    
    // Try to get campaign first
    let campaign = null;
    try {
      campaign = await emailMarketing.getCampaign(req.params.id);
    } catch (err) {
      console.log('[Test Email] Campaign not found, trying draft:', err.message);
    }
    
    // If campaign not found, try to get it from draft
    if (!campaign) {
      try {
        const draft = await emailMarketing.getDraft(req.params.id);
        if (draft) {
          console.log('[Test Email] Using draft:', draft.id);
          // Create a temporary campaign object from draft
          campaign = {
            id: draft.id,
            subject: draft.subject || 'Test Email',
            preheader: draft.preheader || '',
            greeting: draft.greeting || '',
            body: draft.body || [],
            cta: draft.cta || '',
            ctaUrl: draft.ctaUrl || '#',
            footer: draft.footer || ''
          };
        } else {
          console.error('[Test Email] Draft not found:', req.params.id);
          return res.status(404).json({ success: false, error: 'Campaign or draft not found. Please save the draft first.' });
        }
      } catch (draftErr) {
        console.error('[Test Email] Error fetching draft:', draftErr);
        return res.status(404).json({ success: false, error: 'Campaign or draft not found. Please save the draft first.' });
      }
    }
    
    if (!campaign || !campaign.subject) {
      return res.status(400).json({ success: false, error: 'Invalid campaign or draft data' });
    }
    
    // Generate base URL for tracking
    const baseUrl = req.protocol + '://' + req.get('host');
    
    // Create sample recipient data for testing template variables
    const sampleRecipient = {
      email: testEmail,
      guestName: 'John Smith',
      guest_name: 'John Smith',
      firstName: 'John',
      first_name: 'John',
      lastName: 'Smith',
      last_name: 'Smith',
      startDate: '2025-12-30',
      checkInDate: '2025-12-30',
      endDate: '2026-01-02',
      checkOutDate: '2026-01-02',
      roomType: 'Deluxe Suite',
      roomTypeName: 'Deluxe Suite',
      room_type_name: 'Deluxe Suite',
      roomName: 'Suite 201',
      room_name: 'Suite 201',
      reservationId: 'TEST-12345',
      propertyName: 'Hennessey Estate'
    };
    
    // Generate test tracking token (won't be tracked in real campaign)
    const testTrackingToken = emailMarketing.generateTrackingToken('test-' + req.params.id, testEmail);
    
    // Generate email HTML with sample data
    const emailHTML = emailMarketing.generateEmailHTML(campaign, sampleRecipient, testTrackingToken, baseUrl);
    
    // Send test email via Resend
    if (emailMarketing.emailService) {
      try {
        const fromAddress = process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev';
        
        // Resend free tier restriction: can only send to verified email when using onboarding@resend.dev
        // If sending to a different email, we need to use the verified email or verify a domain
        const verifiedEmail = process.env.RESEND_VERIFIED_EMAIL || 'mitun2512@icloud.com';
        const actualRecipient = fromAddress === 'onboarding@resend.dev' ? verifiedEmail : testEmail;
        
        // Generate personalized subject with sample data
        const personalizedSubject = emailMarketing.replaceTemplateVariables(campaign.subject, sampleRecipient);
        
        // Add [TEST] prefix to subject
        const testSubject = `[TEST] ${personalizedSubject}`;
        
        const emailResult = await emailMarketing.emailService.emails.send({
          from: fromAddress,
          to: actualRecipient,
          subject: testSubject,
          html: emailHTML,
          // Enable Resend's built-in tracking for test emails too
          open_tracking: true,
          click_tracking: true
        });
        
        console.log(`[Email] Test email sent to ${actualRecipient}:`, emailResult.id || emailResult.data?.id);
        
        // Check for Resend API errors
        if (emailResult.error) {
          throw new Error(emailResult.error.message || 'Resend API error');
        }
        
        res.json({
          success: true,
          message: actualRecipient !== testEmail 
            ? `Test email sent to ${actualRecipient} (Resend free tier: can only send to verified email). Original request: ${testEmail}`
            : `Test email sent to ${testEmail}`,
          emailId: emailResult.id || emailResult.data?.id,
          testRecipient: sampleRecipient,
          actualRecipient: actualRecipient,
          note: actualRecipient !== testEmail ? 'Resend free tier restriction: emails sent to verified address only. Verify a domain to send to any address.' : null
        });
      } catch (emailError) {
        console.error(`[Email] Resend error for test email to ${testEmail}:`, emailError.message);
        const errorMessage = emailError.response?.data?.error?.message || emailError.message || 'Unknown error';
        res.status(500).json({ 
          success: false, 
          error: `Failed to send test email: ${errorMessage}`,
          hint: 'Resend free tier only allows sending to your verified email address. Verify a domain at resend.com/domains to send to any address.'
        });
      }
    } else {
      // Fallback: log test email (for development/testing)
      console.log(`[Email] Would send TEST email to ${testEmail}:`);
      console.log(`[Email] Subject: [TEST] ${campaign.subject}`);
      console.log(`[Email] Sample Recipient:`, sampleRecipient);
      
      res.json({
        success: true,
        message: `Test email logged (Resend not configured)`,
        testRecipient: sampleRecipient,
        note: 'Install Resend and add RESEND_API_KEY to .env to send actual test emails'
      });
    }
  } catch (error) {
    console.error('[Email] Error sending test email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Send email campaign
 * POST /api/email/campaigns/:id/send
 * Body: { recipients? } - optional, uses campaign recipients if not provided
 */
app.post('/api/email/campaigns/:id/send', async (req, res) => {
  try {
    const campaign = await emailMarketing.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    
    const recipients = req.body.recipients || campaign.recipients || [];
    if (recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'No recipients specified' });
    }
    
    // Update campaign status
    await emailMarketing.updateCampaignStatus(req.params.id, 'sending');
    
    // Generate base URL for tracking
    const baseUrl = req.protocol + '://' + req.get('host');
    
    // For now, we'll simulate sending (in production, integrate with SendGrid, Mailgun, etc.)
    const sentEmails = [];
    const errors = [];
    
    for (const recipient of recipients) {
      try {
        const trackingToken = emailMarketing.generateTrackingToken(req.params.id, recipient.email || recipient.guestEmail);
        
        // Generate email HTML
        const emailHTML = emailMarketing.generateEmailHTML(campaign, recipient, trackingToken, baseUrl);
        
        // Send email via Resend (if configured) or log for now
        const recipientEmail = recipient.email || recipient.guestEmail;
        let resendEmailId = null;
        
        if (emailMarketing.emailService) {
          // Use Resend to send actual email
          try {
            // Use Resend's test domain for free tier (no domain verification needed)
            // For production, verify your domain and use: 'Hennessey Estate <hello@yourdomain.com>'
            const fromAddress = process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev';
            
            // Generate personalized subject (with template variables replaced)
            const personalizedSubject = emailMarketing.replaceTemplateVariables(campaign.subject, recipient);
            
            // Enable Resend's built-in tracking
            const emailResult = await emailMarketing.emailService.emails.send({
              from: fromAddress,
              to: recipientEmail,
              subject: personalizedSubject,
              html: emailHTML,
              // Enable Resend's built-in tracking
              open_tracking: true,
              click_tracking: true
            });
            
            // Extract Resend email ID from response
            resendEmailId = emailResult.id || emailResult.data?.id || null;
            
            console.log(`[Email] Sent via Resend to ${recipientEmail}:`, resendEmailId);
          } catch (emailError) {
            console.error(`[Email] Resend error for ${recipientEmail}:`, emailError.message);
            throw emailError;
          }
        } else {
          // Fallback: log email (for development/testing)
          console.log(`[Email] Would send email to ${recipientEmail}:`);
          console.log(`[Email] Subject: ${campaign.subject}`);
          console.log(`[Email] Tracking Token: ${trackingToken}`);
          console.log(`[Email] To enable actual sending, install Resend: npm install resend`);
          console.log(`[Email] Then add RESEND_API_KEY to .env`);
        }
        
        // Store tracking record with Resend email ID
        await emailMarketing.upsertTrackingRecord(
          trackingToken,
          req.params.id,
          recipientEmail,
          recipient.guestName || recipient.guest_name || null,
          resendEmailId
        );
        
        sentEmails.push({
          email: recipient.email || recipient.guestEmail,
          trackingToken,
          resendEmailId,
          sentAt: new Date().toISOString()
        });
      } catch (err) {
        console.error(`[Email] Error sending to ${recipient.email || recipient.guestEmail}:`, err);
        errors.push({
          email: recipient.email || recipient.guestEmail,
          error: err.message
        });
      }
    }
    
    // Update campaign status
    await emailMarketing.updateCampaignStatus(req.params.id, 'sent');
    
    res.json({
      success: true,
      campaignId: req.params.id,
      sent: sentEmails.length,
      failed: errors.length,
      sentEmails,
      errors
    });
  } catch (error) {
    console.error('[Email] Error sending campaign:', error);
    await emailMarketing.updateCampaignStatus(req.params.id, 'error');
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get campaign tracking/analytics
 * GET /api/email/campaigns/:id/tracking
 */
app.get('/api/email/campaigns/:id/tracking', async (req, res) => {
  try {
    const tracking = await emailMarketing.getCampaignTracking(req.params.id);
    res.json({ success: true, ...tracking });
  } catch (error) {
    console.error('[Email] Error getting tracking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Track email open (tracking pixel)
 * GET /api/email/track/open?token=...
 */
app.get('/api/email/track/open', (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send('Missing token');
    }
    
    // Track the open event
    emailMarketing.trackEvent(token, 'open', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('[Email] Error tracking open:', err));
    
    // Return 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.send(pixel);
  } catch (error) {
    console.error('[Email] Error tracking open:', error);
    // Still return pixel even on error
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.send(pixel);
  }
});

/**
 * Track email click
 * GET /api/email/track/click?token=...&url=...
 */
app.get('/api/email/track/click', (req, res) => {
  try {
    const { token, url } = req.query;
    if (!token || !url) {
      return res.status(400).send('Missing token or url');
    }
    
    // Track the click event
    emailMarketing.trackEvent(token, 'click', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      clickedUrl: url
    }).catch(err => console.error('[Email] Error tracking click:', err));
    
    // Redirect to the actual URL
    res.redirect(decodeURIComponent(url));
  } catch (error) {
    console.error('[Email] Error tracking click:', error);
    // Still redirect even on error
    const url = req.query.url || '#';
    res.redirect(decodeURIComponent(url));
  }
});

/**
 * Unsubscribe endpoint
 * GET /api/email/unsubscribe?token=...
 */
app.get('/api/email/unsubscribe', (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send('Missing token');
    }
    
    // Track unsubscribe event
    emailMarketing.trackEvent(token, 'unsubscribe', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('[Email] Error tracking unsubscribe:', err));
    
    // Return unsubscribe confirmation page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 500px; margin: 0 auto; }
          h1 { color: #8b7355; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>You've been unsubscribed</h1>
          <p>You have successfully been unsubscribed from our email list.</p>
          <p>We're sorry to see you go. If you change your mind, you can always resubscribe by contacting us.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('[Email] Error processing unsubscribe:', error);
    res.status(500).send('Error processing unsubscribe');
  }
});

// ============================================================================
// GEMINI EMAIL CREATIVE ASSISTANT
// ============================================================================

// Gemini API Configuration for Email Creatives
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Generate high-conversion email creative using Gemini AI
 * POST /api/email/generate-creative
 * Body: { 
 *   strategyType: string,
 *   strategyTitle: string,
 *   strategyDescription: string,
 *   targetAudience: string,
 *   tone: 'professional' | 'warm' | 'urgent' | 'luxurious' | 'playful',
 *   focusPoints: string[],
 *   customInstructions: string,
 *   propertyName: string,
 *   existingContent: { subject, preheader, body, cta } (optional - for refinement)
 * }
 */
app.post('/api/email/generate-creative', async (req, res) => {
  try {
    const {
      strategyType,
      strategyTitle,
      strategyDescription,
      targetAudience,
      tone = 'luxurious',
      focusPoints = [],
      customInstructions = '',
      propertyName = 'Hennessey Estate',
      existingContent = null
    } = req.body;

    if (!strategyType || !strategyTitle) {
      return res.status(400).json({ 
        success: false, 
        error: 'Strategy type and title are required' 
      });
    }

    // Build the prompt for Gemini
    const systemPrompt = buildEmailCreativeSystemPrompt();
    const userPrompt = buildEmailCreativeUserPrompt({
      strategyType,
      strategyTitle,
      strategyDescription,
      targetAudience,
      tone,
      focusPoints,
      customInstructions,
      propertyName,
      existingContent
    });

    console.log('[Gemini Creative] Generating email for:', strategyType, strategyTitle);

    // Call Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          role: 'user',
          parts: [{ text: userPrompt }]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.8,
          topK: 64,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const candidate = response.data.candidates?.[0];
    if (!candidate) {
      throw new Error('No response from Gemini');
    }

    const textPart = candidate.content?.parts?.find(p => p.text);
    if (!textPart) {
      throw new Error('No text response from Gemini');
    }

    // Parse the JSON response
    let emailCreative;
    try {
      emailCreative = JSON.parse(textPart.text);
    } catch (parseError) {
      console.error('[Gemini Creative] JSON parse error:', parseError);
      // Try to extract JSON from the response
      const jsonMatch = textPart.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emailCreative = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse email creative response');
      }
    }

    // Post-process: Convert plain body format to rich bodyBlocks if not present
    if (!emailCreative.bodyBlocks && emailCreative.body && Array.isArray(emailCreative.body)) {
      emailCreative.bodyBlocks = convertToRichBlocks(emailCreative.body, strategyType, tone, focusPoints);
      // Create hero section if not present
      if (!emailCreative.heroSection) {
        emailCreative.heroSection = {
          headline: emailCreative.subject?.replace(/^[^:]+:\s*/, '') || 'Your Exclusive Invitation',
          subheadline: emailCreative.preheader || 'A special experience awaits you at Hennessey Estate'
        };
      }
    }

    console.log('[Gemini Creative] Generated successfully:', emailCreative.subject);

    res.json({
      success: true,
      creative: emailCreative,
      metadata: {
        strategyType,
        tone,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Gemini Creative] Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate email creative'
    });
  }
});

/**
 * Generate subject line variations using Gemini AI
 * POST /api/email/generate-subjects
 */
app.post('/api/email/generate-subjects', async (req, res) => {
  try {
    const {
      strategyType,
      targetAudience,
      tone = 'luxurious',
      count = 5,
      existingSubject = ''
    } = req.body;

    const prompt = `Generate ${count} high-converting email subject lines for a luxury boutique hotel (Hennessey Estate in Napa Valley).

Campaign Type: ${strategyType}
Target Audience: ${targetAudience}
Tone: ${tone}
${existingSubject ? `Improve on this subject: "${existingSubject}"` : ''}

Requirements:
- Maximum 50 characters per subject line (optimal for mobile)
- Create urgency or curiosity
- Use power words that drive opens
- Personalization tokens like {guest_name} where appropriate
- Avoid spam trigger words

Return a JSON array of objects with format:
[
  { "subject": "...", "preheader": "...", "strategy": "why this works" }
]`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const textPart = response.data.candidates?.[0]?.content?.parts?.find(p => p.text);
    const subjects = JSON.parse(textPart.text);

    res.json({ success: true, subjects });

  } catch (error) {
    console.error('[Gemini Subjects] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Improve/refine existing email content using Gemini AI
 * POST /api/email/improve-content
 */
app.post('/api/email/improve-content', async (req, res) => {
  try {
    const {
      content,
      improvementType, // 'persuasion', 'clarity', 'urgency', 'personalization', 'brevity'
      additionalInstructions = ''
    } = req.body;

    if (!content || !improvementType) {
      return res.status(400).json({
        success: false,
        error: 'Content and improvement type are required'
      });
    }

    const improvementPrompts = {
      persuasion: 'Make this more persuasive and compelling. Add social proof, benefits-focused language, and stronger calls to action.',
      clarity: 'Improve clarity and readability. Simplify complex sentences, use bullet points where appropriate, and ensure the main message is crystal clear.',
      urgency: 'Add urgency and scarcity elements. Create FOMO (fear of missing out) while remaining authentic and not pushy.',
      personalization: 'Add more personalization opportunities. Include merge tags where appropriate ({guest_name}, {check_in_date}, etc.) and make the tone more intimate.',
      brevity: 'Make this more concise without losing impact. Remove fluff, tighten sentences, and ensure every word earns its place.',
      luxury: 'Elevate the language to feel more luxurious and exclusive. Use sophisticated vocabulary and imagery that appeals to discerning travelers.'
    };

    const prompt = `You are an expert email copywriter for luxury hospitality brands.

${improvementPrompts[improvementType] || improvementPrompts.persuasion}

${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}

Original content:
${JSON.stringify(content, null, 2)}

Return the improved content in the same JSON structure as the input, plus add an "improvements" array describing what you changed and why.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const textPart = response.data.candidates?.[0]?.content?.parts?.find(p => p.text);
    const improved = JSON.parse(textPart.text);

    res.json({ success: true, improved });

  } catch (error) {
    console.error('[Gemini Improve] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Build system prompt for email creative generation
 */
/**
 * Convert plain body array into rich visual bodyBlocks
 */
function convertToRichBlocks(bodyArray, strategyType, tone, focusPoints = []) {
  const blocks = [];
  
  // Strategy-specific feature icons
  const strategyIcons = {
    vip_loyalty: { icons: ['👑', '🍷', '🌟', '💎'], features: ['Exclusive Benefits', 'Wine Credits', 'Priority Access', 'Personal Concierge'] },
    cancellation_recovery: { icons: ['💕', '🔄', '🎁', '⏰'], features: ['Easy Rebooking', 'Rate Guarantee', 'Special Offer', 'No Penalties'] },
    pre_arrival: { icons: ['✨', '🍳', '🏊', '🍷'], features: ['Complimentary Breakfast', 'Pool & Spa Access', 'Wine Hour', 'Concierge Service'] },
    room_upgrade: { icons: ['⬆️', '🛏️', '🌅', '🥂'], features: ['Premium Room', 'Luxury Bedding', 'Garden Views', 'Welcome Amenities'] },
    post_stay: { icons: ['⭐', '📝', '🎁', '💝'], features: ['Share Your Story', 'Earn Rewards', 'Future Savings', 'Exclusive Perks'] },
    seasonal: { icons: ['🍷', '🍂', '🌸', '☀️'], features: ['Wine Country Magic', 'Seasonal Events', 'Local Experiences', 'Chef Specials'] },
    referral: { icons: ['🤝', '💰', '🎁', '❤️'], features: ['Share & Earn', 'Friend Discount', 'Your Bonus', 'Double Rewards'] },
    default: { icons: ['✨', '🏨', '🍷', '⭐'], features: ['Exceptional Stay', 'Premium Service', 'Wine Country', 'Five-Star Reviews'] }
  };
  
  // Get strategy config
  const strategyKey = Object.keys(strategyIcons).find(k => strategyType.toLowerCase().includes(k)) || 'default';
  const strategyConfig = strategyIcons[strategyKey];
  
  // Tone-specific styles
  const toneStyles = {
    luxurious: 'gold',
    urgent: 'accent',
    professional: 'subtle',
    warm: 'gold',
    playful: 'accent'
  };
  const highlightStyle = toneStyles[tone] || 'gold';
  
  // Process body paragraphs
  bodyArray.forEach((paragraph, index) => {
    if (index === 0) {
      // First paragraph is always text (opening hook)
      blocks.push({ type: 'text', content: paragraph });
    } else if (paragraph.includes('•') || paragraph.includes('- ') || paragraph.includes('✓') || paragraph.includes(':')) {
      // If paragraph contains bullet points or list-like content, extract features
      const listMatch = paragraph.match(/[•\-✓]\s*([^•\-✓\n]+)/g);
      if (listMatch && listMatch.length >= 2) {
        // Create features block from bullet points
        const featureItems = listMatch.slice(0, 4).map((item, i) => {
          const cleanItem = item.replace(/^[•\-✓]\s*/, '').trim();
          const colonIndex = cleanItem.indexOf(':');
          if (colonIndex > 0) {
            return {
              icon: strategyConfig.icons[i % strategyConfig.icons.length],
              title: cleanItem.substring(0, colonIndex).trim(),
              description: cleanItem.substring(colonIndex + 1).trim()
            };
          }
          return {
            icon: strategyConfig.icons[i % strategyConfig.icons.length],
            title: cleanItem.split(' ').slice(0, 3).join(' '),
            description: cleanItem
          };
        });
        
        blocks.push({
          type: 'features',
          title: 'Your Exclusive Benefits',
          items: featureItems
        });
      } else {
        // Treat as checklist
        const items = paragraph.split(/[•\-✓]/g)
          .map(item => item.trim())
          .filter(item => item.length > 0);
        if (items.length >= 2) {
          blocks.push({
            type: 'checklist',
            title: 'What\'s Included',
            items: items.slice(0, 6)
          });
        } else {
          blocks.push({ type: 'text', content: paragraph });
        }
      }
    } else if (index === bodyArray.length - 1) {
      // Last paragraph - add urgency block if applicable, then closing text
      if (tone === 'urgent' || paragraph.toLowerCase().includes('limited') || paragraph.toLowerCase().includes('hurry') || paragraph.toLowerCase().includes('book now')) {
        blocks.push({
          type: 'urgency',
          icon: '⏰',
          content: paragraph
        });
      } else {
        blocks.push({ type: 'text', content: paragraph });
      }
    } else if (index === Math.floor(bodyArray.length / 2)) {
      // Middle paragraph - create highlight block
      blocks.push({
        type: 'highlight',
        icon: strategyConfig.icons[0],
        title: focusPoints[0] || 'Special Offer',
        content: paragraph,
        style: highlightStyle
      });
    } else {
      // Regular text paragraph
      blocks.push({ type: 'text', content: paragraph });
    }
  });
  
  // Add stats block for certain strategies
  if (['vip_loyalty', 'post_stay', 'seasonal'].some(k => strategyType.toLowerCase().includes(k))) {
    blocks.splice(Math.min(2, blocks.length), 0, {
      type: 'stats',
      items: [
        { value: '130+', label: 'Years of Heritage' },
        { value: '4.9★', label: 'Guest Rating' },
        { value: '97', label: 'Five-Star Reviews' }
      ]
    });
  }
  
  // Add a testimonial quote for certain strategies
  if (['post_stay', 'referral', 'vip_loyalty'].some(k => strategyType.toLowerCase().includes(k))) {
    blocks.push({
      type: 'quote',
      content: 'Our stay at Hennessey Estate was absolutely magical. The attention to detail, the beautiful gardens, and the warm hospitality made it an unforgettable experience.',
      author: 'Recent Guest',
      rating: 5
    });
  }
  
  return blocks;
}

function buildEmailCreativeSystemPrompt() {
  return `You are an elite email marketing strategist specializing in luxury hospitality and boutique hotels. You have deep expertise in:

1. **High-Converting Email Copywriting**: You write emails that achieve 40%+ open rates and 15%+ click rates.
2. **Hospitality Industry**: You understand the guest journey from dreaming to booking to post-stay.
3. **Luxury Brand Voice**: You craft messages that feel exclusive, warm, and aspirational.
4. **Conversion Psychology**: You leverage scarcity, social proof, reciprocity, and emotional triggers ethically.
5. **Email Best Practices**: Optimal subject line length (30-50 chars), preheader text, mobile optimization, CTA placement.
6. **Visual Email Design**: You create visually stunning emails with rich formatting, icons, and structured content blocks.

Your responses must be in valid JSON format with VISUALLY RICH content blocks:
{
  "subject": "Email subject line (max 50 chars)",
  "subjectVariants": ["Alternative subject 1", "Alternative subject 2"],
  "preheader": "Preview text that complements the subject (max 100 chars)",
  "greeting": "Personalized greeting using {guest_name}",
  "heroSection": {
    "headline": "Bold attention-grabbing headline",
    "subheadline": "Supporting text that expands on the headline",
    "imageUrl": "https://images.unsplash.com/photo-[suggested-image-id]?w=600&h=300&fit=crop"
  },
  "bodyBlocks": [
    {
      "type": "text",
      "content": "Opening paragraph that hooks the reader with emotional appeal"
    },
    {
      "type": "features",
      "title": "What's Included" or "Your Benefits" or similar,
      "items": [
        { "icon": "✨", "title": "Feature name", "description": "Brief benefit description" },
        { "icon": "🍷", "title": "Feature name", "description": "Brief benefit description" },
        { "icon": "🌅", "title": "Feature name", "description": "Brief benefit description" }
      ]
    },
    {
      "type": "highlight",
      "icon": "🎁",
      "title": "Special Offer or Key Message",
      "content": "Details about the special offer with urgency",
      "style": "gold" or "accent" or "subtle"
    },
    {
      "type": "quote",
      "content": "A testimonial or inspiring quote",
      "author": "Guest Name or attribution",
      "rating": 5
    },
    {
      "type": "stats",
      "items": [
        { "value": "130+", "label": "Years of Heritage" },
        { "value": "4.9★", "label": "Guest Rating" },
        { "value": "48hr", "label": "Limited Availability" }
      ]
    },
    {
      "type": "checklist",
      "title": "What to Expect",
      "items": ["Complimentary breakfast", "Wine tasting credit", "Late checkout"]
    },
    {
      "type": "urgency",
      "icon": "⏰",
      "content": "Time-sensitive message creating FOMO"
    },
    {
      "type": "text",
      "content": "Closing paragraph with warm, personal touch"
    }
  ],
  "cta": "Primary call-to-action button text",
  "ctaSecondary": "Optional secondary CTA",
  "ctaStyle": "gold" or "outline" or "dark",
  "footer": "Warm closing message with signature",
  "designNotes": "Visual design suggestions",
  "conversionTips": ["Tip 1 for improving conversion", "Tip 2"],
  "suggestedImages": [
    { "placement": "hero", "description": "Luxurious hotel bedroom or wine country vista", "unsplashKeywords": "napa valley vineyard sunset" },
    { "placement": "body", "description": "Wine glasses or spa treatment", "unsplashKeywords": "wine tasting luxury" }
  ]
}

BLOCK TYPE GUIDELINES:
- "text": Standard paragraph, can include <strong>, <em>, and line breaks
- "features": 2-4 feature cards with icons and descriptions
- "highlight": Important callout box (offers, announcements, key messages)
- "quote": Guest testimonial or inspiring quote with attribution
- "stats": 2-4 impressive statistics or numbers
- "checklist": List of included items or benefits with checkmarks
- "urgency": Time-sensitive message to create action
- "divider": Visual separator (use sparingly)

ICON SUGGESTIONS BY CATEGORY:
- Accommodations: 🏨 🛏️ 🌙 ✨ 🌟
- Wine/Dining: 🍷 🥂 🍽️ 🍾 🧀
- Wellness: 🧖‍♀️ 💆 🌿 🛁 🌸
- Activities: 🚴 🥾 🎨 📸 🎭
- Time/Urgency: ⏰ 📅 🔥 ⚡ 💨
- Value/Offers: 🎁 💎 👑 🏆 💰
- Nature: 🌅 🌄 🍂 🌺 🌳
- Romance: 💕 💝 🌹 🥰 ❤️

Property Context:
- **Hennessey Estate**: A historic luxury boutique hotel in Napa Valley wine country
- **Established**: 1889 (over 130 years of heritage)
- **Location**: 1727 Main Street, Napa, CA 94559
- **Vibe**: Intimate, romantic, sophisticated yet approachable
- **Amenities**: Pool, spa services, wine tastings, gourmet breakfast
- **Target Guest**: Affluent travelers seeking authentic wine country experiences`;
}

/**
 * Build user prompt for email creative generation
 */
function buildEmailCreativeUserPrompt(params) {
  const {
    strategyType,
    strategyTitle,
    strategyDescription,
    targetAudience,
    tone,
    focusPoints,
    customInstructions,
    propertyName,
    existingContent
  } = params;

  const toneGuides = {
    professional: 'Maintain a polished, businesslike tone while remaining warm',
    warm: 'Be friendly, conversational, and genuinely caring',
    urgent: 'Create time-sensitive pressure without being pushy',
    luxurious: 'Use sophisticated, aspirational language that evokes exclusivity',
    playful: 'Be light-hearted and fun while maintaining brand prestige'
  };

  let prompt = `Create a high-conversion email creative for the following campaign:

**Campaign Type**: ${strategyType}
**Campaign Name**: ${strategyTitle}
${strategyDescription ? `**Description**: ${strategyDescription}` : ''}
**Target Audience**: ${targetAudience || 'Hotel guests and prospects'}
**Tone**: ${tone} - ${toneGuides[tone] || toneGuides.luxurious}
**Property**: ${propertyName}

`;

  if (focusPoints && focusPoints.length > 0) {
    prompt += `**Key Points to Emphasize**:\n${focusPoints.map(p => `- ${p}`).join('\n')}\n\n`;
  }

  if (customInstructions) {
    prompt += `**Special Instructions**: ${customInstructions}\n\n`;
  }

  if (existingContent) {
    prompt += `**Existing Content to Improve/Build Upon**:
Subject: ${existingContent.subject || 'N/A'}
Body: ${JSON.stringify(existingContent.body || [])}
CTA: ${existingContent.cta || 'N/A'}

Enhance this content while maintaining its core message.\n\n`;
  }

  prompt += `Generate a VISUALLY STUNNING email creative following the JSON structure specified. 

CRITICAL REQUIREMENTS:
1. Subject line creates curiosity or urgency (max 50 characters)
2. Preheader complements the subject (max 100 characters)
3. heroSection: Create an impactful hero with compelling headline and subheadline
4. bodyBlocks: Use a MIX of different block types for visual variety:
   - Start with a "text" block for the opening hook
   - Include a "features" block with 3-4 benefits using appropriate icons
   - Add a "highlight" block for any special offer or key message
   - Consider a "quote" block with a guest testimonial if relevant
   - Use a "stats" block if there are impressive numbers to share
   - Include a "checklist" for included items/benefits
   - End with an "urgency" block if time-sensitive, then a warm closing "text" block
5. Use at least 4-6 different bodyBlocks for visual richness
6. CTA should be action-oriented and specific
7. Include personalization tokens: {guest_name}, {check_in_date}, {room_type}
8. Select relevant emoji icons that match the luxury hospitality theme
9. Make the content feel like a beautifully designed email, not a plain text message

The goal is to create an email that is VISUALLY ENGAGING with varied content blocks, not boring walls of text.`;

  return prompt;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// DYNAMIC PRICING ENGINE API ENDPOINTS
// ============================================================================

/**
 * Get dynamic price calculation for a room type
 * Query params: room_type_id, check_in, check_out, occupancy (optional)
 */
app.get('/api/pricing/calculate', async (req, res) => {
  try {
    const { room_type_id, check_in, check_out, occupancy } = req.query;
    
    if (!room_type_id || !check_in || !check_out) {
      return res.status(400).json({
        error: 'Missing required parameters: room_type_id, check_in, check_out'
      });
    }
    
    const result = pricingEngine.calculatePrice(
      room_type_id,
      check_in,
      check_out,
      { currentOccupancy: parseInt(occupancy) || 50 }
    );
    
    res.json({ success: true, pricing: result });
  } catch (error) {
    console.error('[Pricing] Calculate error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get dynamic prices for all room types
 * Query params: check_in, check_out, occupancy (optional)
 */
app.get('/api/pricing/all-rooms', async (req, res) => {
  try {
    const { check_in, check_out, occupancy } = req.query;
    
    if (!check_in || !check_out) {
      return res.status(400).json({
        error: 'Missing required parameters: check_in, check_out'
      });
    }
    
    const result = pricingEngine.calculateAllRoomPrices(
      check_in,
      check_out,
      { currentOccupancy: parseInt(occupancy) || 50 }
    );
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Pricing] All rooms error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper function: Get daily occupancy for a month
 * Reusable across pricing calendar and buyout allocation
 */
async function getDailyOccupancy(year, month) {
  await db.initDatabase();
  
  const TOTAL_ROOMS = 6;
  const startStr = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const endStr = endDate.toISOString().split('T')[0];

  const occupancyQuery = `
    SELECT 
      date(r.start_date, '+' || (t.i) || ' days') as date,
      COUNT(*) as occupied_rooms
    FROM reservations r
    JOIN (SELECT 0 AS i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
          UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
          UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14
          UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19
          UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24
          UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
          UNION ALL SELECT 30) t
    WHERE r.status IN ('confirmed', 'checked_in')
    AND date(r.start_date, '+' || (t.i) || ' days') < r.end_date
    AND date(r.start_date, '+' || (t.i) || ' days') BETWEEN ? AND ?
    GROUP BY date
  `;
  
  const occupancyResult = db.query(occupancyQuery, [startStr, endStr]);
  
  const occupancyData = {};
  if (occupancyResult) {
    occupancyResult.forEach(row => {
      const occupied = parseInt(row.occupied_rooms);
      const percentage = Math.round((occupied / TOTAL_ROOMS) * 100);
      occupancyData[row.date] = Math.min(percentage, 100);
    });
  }
  
  return occupancyData;
}

/**
 * Get pricing calendar for a month
 * Query params: room_type_id, year, month
 * Uses LOCAL DATABASE for occupancy data to drive dynamic pricing
 */
app.get('/api/pricing/calendar', async (req, res) => {
  try {
    const { room_type_id, year, month } = req.query;
    
    if (!room_type_id || !year || !month) {
      return res.status(400).json({
        error: 'Missing required parameters: room_type_id, year, month'
      });
    }

    // Get occupancy data using the helper function
    const occupancyData = await getDailyOccupancy(parseInt(year), parseInt(month));

    // Generate Pricing with Real Occupancy Data
    const result = pricingEngine.getPricingCalendar(
      room_type_id,
      parseInt(year),
      parseInt(month),
      occupancyData
    );
    
    // Add occupancy info to response for debugging/UI
    result.occupancyData = occupancyData;
    
    res.json({ success: true, calendar: result });
  } catch (error) {
    console.error('[Pricing] Calendar error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get pricing recommendations for a date
 * Query params: check_in, occupancy (optional)
 */
app.get('/api/pricing/recommendations', async (req, res) => {
  try {
    const { check_in, occupancy } = req.query;
    
    if (!check_in) {
      return res.status(400).json({
        error: 'Missing required parameter: check_in'
      });
    }
    
    const result = pricingEngine.getPricingRecommendations(
      check_in,
      parseInt(occupancy) || 50
    );
    
    res.json({ success: true, recommendations: result });
  } catch (error) {
    console.error('[Pricing] Recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Napa Valley events and holidays calendar
 * Returns all special events and holidays that affect pricing
 */
app.get('/api/pricing/events', async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    
    if (month) {
      // Get events for a specific month
      const events = pricingEngine.getEventsForMonth(targetYear, parseInt(month));
      res.json({
        success: true,
        year: targetYear,
        month: parseInt(month),
        events
      });
    } else {
      // Get full year overview
      const holidays = pricingEngine.getHolidaysForYear(targetYear);
      const napaEvents = pricingEngine.getNapaEventsForYear(targetYear);
      
      res.json({
        success: true,
        year: targetYear,
        holidays,
        napaEvents,
        summary: {
          totalHolidays: Object.keys(holidays).length,
          totalEvents: napaEvents.length,
          highestMultiplier: Math.max(...napaEvents.map(e => e.multiplier)),
          topEvents: napaEvents
            .sort((a, b) => b.multiplier - a.multiplier)
            .slice(0, 5)
            .map(e => ({ name: e.name, multiplier: e.multiplier, category: e.category }))
        }
      });
    }
  } catch (error) {
    console.error('[Pricing] Events calendar error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// BUYOUT ALLOCATION ENDPOINTS
// ============================================================================

const buyoutEngine = require('./buyout-allocation-engine');

/**
 * Analyze a specific date for buyout allocation
 */
app.get('/api/buyout/analyze', async (req, res) => {
  try {
    const { date, occupancy } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Missing required parameter: date' });
    }
    
    const analysis = buyoutEngine.analyzeDateForBuyout(date, {
      currentOccupancy: parseInt(occupancy) || 0,
      daysUntilDate: Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24)),
    });
    
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('[Buyout] Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get buyout-blocked dates for a month
 */
app.get('/api/buyout/blocked-dates', async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    
    // Get occupancy data for the month
    const occupancyData = await getDailyOccupancy(targetYear, targetMonth);
    
    const result = buyoutEngine.getBuyoutBlockedDates(targetYear, targetMonth, occupancyData);
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Buyout] Blocked dates error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get annual buyout calendar
 */
app.get('/api/buyout/annual-calendar', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    
    const result = buyoutEngine.getAnnualBuyoutCalendar(targetYear);
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Buyout] Annual calendar error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get key buyout periods for a year
 */
app.get('/api/buyout/key-periods', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    
    const periods = buyoutEngine.identifyKeyBuyoutPeriods(targetYear);
    
    res.json({
      success: true,
      year: targetYear,
      keyPeriods: periods,
      totalPotentialRevenue: periods.reduce((sum, p) => sum + (p.estimatedBuyoutRevenue || 0), 0),
    });
  } catch (error) {
    console.error('[Buyout] Key periods error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze a date range for buyout allocation
 */
app.get('/api/buyout/analyze-range', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Missing required parameters: start, end' });
    }
    
    const result = buyoutEngine.analyzeDateRangeForBuyout(start, end);
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Buyout] Range analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Compare revenue: individual rooms vs buyout for a date
 */
app.get('/api/buyout/revenue-comparison', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Missing required parameter: date' });
    }
    
    // Parse date string correctly to avoid timezone issues
    const napaCalendar = require('./napa-events-calendar');
    const parts = date.split('-');
    const year = parseInt(parts[0]);
    const eventInfo = napaCalendar.getSpecialDateInfo(date, year);
    const multiplier = eventInfo?.multiplier || 1.0;
    
    const comparison = buyoutEngine.compareRevenuePotential(date, { multiplier });
    
    res.json({
      success: true,
      date,
      event: eventInfo ? { name: eventInfo.name, multiplier: eventInfo.multiplier } : null,
      ...comparison,
    });
  } catch (error) {
    console.error('[Buyout] Revenue comparison error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get pricing engine configuration
 */
app.get('/api/pricing/config', async (req, res) => {
  try {
    const config = pricingEngine.getConfiguration();
    res.json({ success: true, config });
  } catch (error) {
    console.error('[Pricing] Config error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update base rate for a room type
 * Body: { room_type_id, base_rate }
 */
app.post('/api/pricing/update-rate', async (req, res) => {
  try {
    const { room_type_id, base_rate } = req.body;
    
    if (!room_type_id || !base_rate) {
      return res.status(400).json({
        error: 'Missing required parameters: room_type_id, base_rate'
      });
    }
    
    const result = pricingEngine.updateBaseRate(room_type_id, parseFloat(base_rate));
    res.json({ success: true, result });
  } catch (error) {
    console.error('[Pricing] Update rate error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update pricing engine configuration
 * Body: { priceFloor, priceCeiling, competitorPremium }
 */
app.post('/api/pricing/update-config', async (req, res) => {
  try {
    const result = pricingEngine.updateConfiguration(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Pricing] Update config error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// AVAILABILITY ALLOCATION API ENDPOINTS
// ============================================================================

/**
 * Get revenue potential comparison: buyout vs individual rooms
 * Query params: check_in, check_out, occupancy (optional)
 */
app.get('/api/allocation/revenue-potential', async (req, res) => {
  try {
    const { check_in, check_out, occupancy } = req.query;
    
    if (!check_in || !check_out) {
      return res.status(400).json({
        error: 'Missing required parameters: check_in, check_out'
      });
    }
    
    const result = availabilityAllocator.calculateRevenuePotential(
      check_in,
      check_out,
      parseInt(occupancy) || 50
    );
    
    res.json({ success: true, analysis: result });
  } catch (error) {
    console.error('[Allocation] Revenue potential error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get allocation priority for dates
 * Query params: check_in, check_out, occupancy (optional)
 */
app.get('/api/allocation/priority', async (req, res) => {
  try {
    const { check_in, check_out, occupancy } = req.query;
    
    if (!check_in || !check_out) {
      return res.status(400).json({
        error: 'Missing required parameters: check_in, check_out'
      });
    }
    
    // Get current reservations for conflict checking
    const reservations = dataCache.reservations || [];
    
    const result = availabilityAllocator.calculateAllocationPriority(
      check_in,
      check_out,
      { 
        currentOccupancy: parseInt(occupancy) || 50,
        existingBookings: reservations
      }
    );
    
    res.json({ success: true, allocation: result });
  } catch (error) {
    console.error('[Allocation] Priority error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Make allocation decision (what should be available)
 * Query params: check_in, check_out, occupancy (optional)
 */
app.get('/api/allocation/decision', async (req, res) => {
  try {
    const { check_in, check_out, occupancy } = req.query;
    
    if (!check_in || !check_out) {
      return res.status(400).json({
        error: 'Missing required parameters: check_in, check_out'
      });
    }
    
    // Get current reservations for conflict checking
    const reservations = dataCache.reservations || [];
    
    const result = availabilityAllocator.makeAllocationDecision(
      check_in,
      check_out,
      { 
        currentOccupancy: parseInt(occupancy) || 50,
        existingReservations: reservations
      }
    );
    
    res.json({ success: true, decision: result });
  } catch (error) {
    console.error('[Allocation] Decision error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get allocation calendar for a date range
 * Query params: start_date, end_date, occupancy (optional)
 */
app.get('/api/allocation/calendar', async (req, res) => {
  try {
    const { start_date, end_date, occupancy } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Missing required parameters: start_date, end_date'
      });
    }
    
    // Get current reservations
    const reservations = dataCache.reservations || [];
    
    const result = availabilityAllocator.getAllocationForDates(
      start_date,
      end_date,
      { 
        currentOccupancy: parseInt(occupancy) || 50,
        existingReservations: reservations
      }
    );
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Allocation] Calendar error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get allocation analytics
 */
app.get('/api/allocation/analytics', async (req, res) => {
  try {
    const result = availabilityAllocator.getAllocationAnalytics();
    res.json({ success: true, analytics: result });
  } catch (error) {
    console.error('[Allocation] Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get allocation engine configuration
 */
app.get('/api/allocation/config', async (req, res) => {
  try {
    const config = availabilityAllocator.getConfiguration();
    res.json({ success: true, config });
  } catch (error) {
    console.error('[Allocation] Config error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Combined endpoint: Get optimal pricing with allocation recommendation
 * Query params: check_in, check_out, occupancy (optional)
 */
app.get('/api/pricing/optimal', async (req, res) => {
  try {
    const { check_in, check_out, occupancy } = req.query;
    
    if (!check_in || !check_out) {
      return res.status(400).json({
        error: 'Missing required parameters: check_in, check_out'
      });
    }
    
    const currentOccupancy = parseInt(occupancy) || 50;
    const reservations = dataCache.reservations || [];
    
    // Get pricing for all rooms
    const allRoomPrices = pricingEngine.calculateAllRoomPrices(
      check_in,
      check_out,
      { currentOccupancy }
    );
    
    // Get allocation decision
    const allocationDecision = availabilityAllocator.makeAllocationDecision(
      check_in,
      check_out,
      { currentOccupancy, existingReservations: reservations }
    );
    
    // Get revenue comparison
    const revenuePotential = availabilityAllocator.calculateRevenuePotential(
      check_in,
      check_out,
      currentOccupancy
    );
    
    // Get recommendations
    const recommendations = pricingEngine.getPricingRecommendations(
      check_in,
      currentOccupancy
    );
    
    res.json({
      success: true,
      checkIn: check_in,
      checkOut: check_out,
      occupancy: currentOccupancy,
      
      pricing: allRoomPrices,
      allocation: allocationDecision,
      revenueAnalysis: revenuePotential,
      recommendations: recommendations.recommendations,
      strategy: recommendations.overallStrategy,
      
      calculatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Pricing] Optimal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint (root level for Render/load balancers)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
// In production (Render, etc.), bind to 0.0.0.0 to accept external connections
// In development, bind to 127.0.0.1 for security
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
app.listen(PORT, HOST, async () => {
  console.log(`🚀 Booking Engine API Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Cloudbeds API: ${CLOUDBEDS_BASE_URL}`);
  console.log(`🏨 Property ID: ${CLOUDBEDS_PROPERTY_ID || 'Not set'}`);
  console.log(`🤖 AI Chatbot: Enabled (Gemini)`);
  console.log(`🔄 Data Cache: Auto-refresh every hour`);
  console.log(`💾 SQLite Database: Enabled (hourly sync)`);
  
  // Initialize SQLite database
  try {
    await db.initDatabase();
    console.log('[Database] ✅ SQLite database initialized');
    
    // Initialize Gemini service with database reference
    geminiService.initWithDatabase(db);
    console.log('[Gemini] ✅ Configured to use SQLite database as primary data source');
    
    // Initialize email marketing service with database reference
    emailMarketing.initWithDatabase(db);
    console.log('[Email Marketing] ✅ Configured to use SQLite database');
  } catch (err) {
    console.error('[Database] ❌ Failed to initialize:', err.message);
  }
  
  // Initial cache refresh for Gemini
  refreshReservationCache(cloudbedsRequest);
  
  // Initial data cache refresh (also syncs to database)
  console.log('[Cache] Starting initial data refresh...');
  refreshDataCache();
  
  // Set up hourly refresh interval (syncs both in-memory cache and database)
  setInterval(() => {
    console.log('[Cache] ⏰ Hourly refresh triggered');
    refreshDataCache();
  }, CACHE_REFRESH_INTERVAL);
});

