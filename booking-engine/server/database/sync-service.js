/**
 * Hennessey Estate - Cloudbeds Sync Service
 * Syncs reservation data from Cloudbeds API to local SQLite database
 */

const axios = require('axios');
const https = require('https');
const db = require('./db');

// Cloudbeds API configuration
const CLOUDBEDS_BASE_URL = 'https://api.cloudbeds.com/api/v1.2';
const CLOUDBEDS_ACCESS_TOKEN = process.env.CLOUDBEDS_ACCESS_TOKEN;
const CLOUDBEDS_PROPERTY_ID = process.env.CLOUDBEDS_PROPERTY_ID;

// Create axios instance with SSL handling
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const api = axios.create({ httpsAgent });

// Rate limiting
const API_DELAY_MS = 200; // Delay between API calls to avoid rate limiting
const PAGE_SIZE = 100;

/**
 * Make a request to Cloudbeds API
 */
async function cloudbedsRequest(method, endpoint, data = null, params = {}) {
  try {
    const config = {
      method,
      url: `${CLOUDBEDS_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${CLOUDBEDS_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        propertyID: CLOUDBEDS_PROPERTY_ID,
        ...params
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await api(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`[Sync] API Error: ${endpoint}`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Fetch all pages of data from a paginated endpoint
 */
async function fetchAllPages(endpoint, params = {}) {
  const allData = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const result = await cloudbedsRequest('GET', endpoint, null, {
      ...params,
      pageNumber: page,
      pageSize: PAGE_SIZE
    });
    
    if (!result.success) {
      console.error(`[Sync] Failed to fetch page ${page} from ${endpoint}`);
      break;
    }
    
    const data = result.data?.data || [];
    allData.push(...data);
    
    const total = result.data?.total || 0;
    const count = result.data?.count || data.length;
    
    console.log(`[Sync] ${endpoint} - Page ${page}: ${count} records (total: ${total})`);
    
    hasMore = allData.length < total && data.length > 0;
    page++;
    
    // Rate limiting delay
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, API_DELAY_MS));
    }
  }
  
  return allData;
}

/**
 * Fetch detailed reservation data
 */
async function fetchReservationDetail(reservationId) {
  const result = await cloudbedsRequest('GET', '/getReservation', null, {
    reservationID: reservationId
  });
  
  return result.success ? result.data?.data : null;
}

/**
 * Sync all reservations from Cloudbeds
 */
async function syncReservations(options = {}) {
  const { fullSync = false, daysBack = 365 } = options;
  
  console.log('[Sync] Starting reservation sync...');
  const logId = db.startSyncLog('reservations');
  
  const stats = {
    processed: 0,
    created: 0,
    updated: 0,
    errors: 0,
    metadata: {}
  };
  
  try {
    // Determine date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    // Fetch all reservations
    console.log(`[Sync] Fetching reservations from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    const reservations = await fetchAllPages('/getReservations', {
      propertyID: CLOUDBEDS_PROPERTY_ID
    });
    
    console.log(`[Sync] Found ${reservations.length} reservations`);
    stats.metadata.totalFound = reservations.length;
    
    // Process each reservation
    for (const reservation of reservations) {
      try {
        stats.processed++;
        
        // Get detailed reservation data (includes rooms, custom fields, etc.)
        const detail = await fetchReservationDetail(reservation.reservationID);
        
        if (detail) {
          // Merge basic and detailed data
          const fullReservation = { ...reservation, ...detail };
          
          // Upsert reservation
          const result = db.upsertReservation(fullReservation);
          
          if (result.changes > 0) {
            stats.updated++;
          } else {
            stats.created++;
          }
          
          // Upsert assigned rooms
          if (detail.assigned && detail.assigned.length > 0) {
            db.upsertReservationRooms(reservation.reservationID, detail.assigned, true);
          }
          
          // Upsert unassigned rooms
          if (detail.unassigned && detail.unassigned.length > 0) {
            db.upsertReservationRooms(reservation.reservationID, detail.unassigned, false);
          }
          
          // Upsert guests from guestList
          if (detail.guestList) {
            let isFirst = true;
            for (const [guestId, guest] of Object.entries(detail.guestList)) {
              db.upsertGuest({ ...guest, guestID: guestId }, reservation.reservationID, isFirst);
              isFirst = false;
            }
          }
        } else {
          // If detail fetch failed, still save basic reservation data
          db.upsertReservation(reservation);
        }
        
        // Progress logging and save every 50 records
        if (stats.processed % 50 === 0) {
          console.log(`[Sync] Progress: ${stats.processed}/${reservations.length} reservations`);
          db.saveDatabase(); // Persist to disk
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, API_DELAY_MS));
        
      } catch (error) {
        console.error(`[Sync] Error processing reservation ${reservation.reservationID}:`, error.message);
        stats.errors++;
      }
    }
    
    // Final save and complete sync log
    db.saveDatabase();
    db.completeSyncLog(logId, stats);
    
    console.log('[Sync] Reservation sync completed:', stats);
    return { success: true, stats };
    
  } catch (error) {
    console.error('[Sync] Reservation sync failed:', error.message);
    db.failSyncLog(logId, error.message);
    return { success: false, error: error.message, stats };
  }
}

/**
 * Sync guests from Cloudbeds (standalone, not linked to reservations)
 */
async function syncGuests(options = {}) {
  console.log('[Sync] Starting guest sync...');
  const logId = db.startSyncLog('guests');
  
  const stats = {
    processed: 0,
    created: 0,
    updated: 0,
    errors: 0
  };
  
  try {
    const guests = await fetchAllPages('/getGuestList', {
      includeGuestInfo: true
    });
    
    console.log(`[Sync] Found ${guests.length} guests`);
    
    for (const guest of guests) {
      try {
        stats.processed++;
        
        // Map guest list fields to standard format
        const guestData = {
          guestID: guest.guestID,
          firstName: guest.guestFirstName,
          lastName: guest.guestLastName,
          email: guest.guestEmail,
          phone: guest.guestPhone,
          cellPhone: guest.guestCellPhone,
          country: guest.guestCountry,
          city: guest.guestCity,
          state: guest.guestState,
          zip: guest.guestZip,
          address: guest.guestAddress,
          birthDate: guest.guestBirthDate,
          gender: guest.guestGender,
          documentType: guest.guestDocumentType,
          documentNumber: guest.guestDocumentNumber
        };
        
        const result = db.upsertGuest(guestData, guest.reservationID);
        
        if (result.changes > 0) {
          stats.updated++;
        } else {
          stats.created++;
        }
        
      } catch (error) {
        console.error(`[Sync] Error processing guest ${guest.guestID}:`, error.message);
        stats.errors++;
      }
    }
    
    // Save and complete
    db.saveDatabase();
    db.completeSyncLog(logId, stats);
    console.log('[Sync] Guest sync completed:', stats);
    return { success: true, stats };
    
  } catch (error) {
    console.error('[Sync] Guest sync failed:', error.message);
    db.failSyncLog(logId, error.message);
    return { success: false, error: error.message, stats };
  }
}

/**
 * Sync room types from Cloudbeds
 */
async function syncRoomTypes() {
  console.log('[Sync] Starting room type sync...');
  const logId = db.startSyncLog('room_types');
  
  const stats = { processed: 0, created: 0, updated: 0, errors: 0 };
  
  try {
    const result = await cloudbedsRequest('GET', '/getRoomTypes');
    
    if (!result.success) {
      throw new Error('Failed to fetch room types');
    }
    
    const roomTypes = result.data?.data || [];
    
    for (const rt of roomTypes) {
      if (!rt.roomTypeID) continue; // Skip if no ID
      stats.processed++;
      
      const sql = `
        INSERT INTO room_types (
          room_type_id, property_id, room_type_name, room_type_name_short,
          room_type_description, max_guests, adults_included, children_included,
          is_virtual, is_private, last_synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(room_type_id) DO UPDATE SET
          room_type_name = excluded.room_type_name,
          room_type_name_short = excluded.room_type_name_short,
          room_type_description = excluded.room_type_description,
          max_guests = excluded.max_guests,
          last_synced_at = datetime('now'),
          updated_at = datetime('now')
      `;
      
      db.execute(sql, [
        rt.roomTypeID,
        CLOUDBEDS_PROPERTY_ID,
        rt.roomTypeName,
        rt.roomTypeNameShort,
        rt.roomTypeDescription,
        rt.maxGuests,
        rt.adultsIncluded,
        rt.childrenIncluded,
        rt.isVirtual ? 1 : 0,
        rt.isPrivate ? 1 : 0
      ]);
      stats.created++;
    }
    
    // Save and complete
    db.saveDatabase();
    db.completeSyncLog(logId, stats);
    console.log('[Sync] Room type sync completed:', stats);
    return { success: true, stats };
    
  } catch (error) {
    console.error('[Sync] Room type sync failed:', error.message);
    db.failSyncLog(logId, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Run full sync (all data)
 */
async function runFullSync() {
  console.log('[Sync] ========================================');
  console.log('[Sync] Starting FULL database sync');
  console.log('[Sync] ========================================');
  
  const startTime = Date.now();
  const results = {};
  
  // Initialize database (async)
  await db.initDatabase();
  
  // Sync room types first (quick)
  results.roomTypes = await syncRoomTypes();
  
  // Sync reservations (with details)
  results.reservations = await syncReservations({ fullSync: true });
  
  // Sync guests
  results.guests = await syncGuests();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('[Sync] ========================================');
  console.log(`[Sync] FULL sync completed in ${duration}s`);
  console.log('[Sync] Results:', JSON.stringify(results, null, 2));
  console.log('[Sync] ========================================');
  
  return results;
}

/**
 * Get sync status
 */
function getSyncStatus() {
  const lastSync = db.getLastSync();
  const stats = db.getReservationStats();
  
  return {
    lastSync: lastSync ? {
      type: lastSync.sync_type,
      completedAt: lastSync.completed_at,
      recordsProcessed: lastSync.records_processed
    } : null,
    database: {
      ...stats,
      dbPath: db.DB_PATH
    }
  };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  syncReservations,
  syncGuests,
  syncRoomTypes,
  runFullSync,
  getSyncStatus,
  fetchReservationDetail,
  fetchAllPages
};

