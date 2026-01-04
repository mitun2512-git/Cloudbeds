/**
 * Hennessey Estate - Database Service
 * SQLite database for Cloudbeds reservation data
 * Uses sql.js (pure JavaScript SQLite implementation)
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = path.join(__dirname, 'hennessey.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;
let SQL = null;

/**
 * Initialize database connection and schema
 */
async function initDatabase() {
  if (db) return db;
  
  console.log('[Database] Initializing SQLite database...');
  
  // Initialize SQL.js
  SQL = await initSqlJs();
  
  // Create database directory if needed
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Load existing database or create new
  if (fs.existsSync(DB_PATH)) {
    console.log('[Database] Loading existing database...');
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    console.log('[Database] Creating new database...');
    db = new SQL.Database();
    
    // Run schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.run(schema);
    
    // Save to file
    saveDatabase();
    console.log('[Database] Schema created successfully');
  }
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Run migrations for existing databases
  runMigrations(db);
  
  return db;
}

/**
 * Run database migrations
 */
function runMigrations(db) {
  try {
    // Migration: Add resend_email_id column if it doesn't exist
    const tableInfo = db.exec("PRAGMA table_info(email_tracking)");
    const columns = tableInfo[0]?.values || [];
    const hasResendEmailId = columns.some(col => col[1] === 'resend_email_id');
    
    if (!hasResendEmailId) {
      console.log('[Database] Running migration: Adding resend_email_id column...');
      db.run('ALTER TABLE email_tracking ADD COLUMN resend_email_id TEXT');
      saveDatabase();
      console.log('[Database] Migration completed: resend_email_id column added');
    }
    
    // Check if index exists
    const indexes = db.exec("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_email_tracking_resend_id'");
    if (indexes.length === 0) {
      console.log('[Database] Creating index for resend_email_id...');
      db.run('CREATE INDEX IF NOT EXISTS idx_email_tracking_resend_id ON email_tracking(resend_email_id)');
      saveDatabase();
    }
  } catch (error) {
    console.error('[Database] Migration error:', error);
    // Don't throw - allow server to continue
  }
}

/**
 * Save database to file
 */
function saveDatabase() {
  if (!db) return;
  
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Get database instance
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    console.log('[Database] Connection closed');
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Run a query and return results as array of objects
 */
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * Run a single query and return first result
 */
function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a statement (INSERT, UPDATE, DELETE)
 */
function execute(sql, params = []) {
  try {
    db.run(sql, params);
    const changes = db.getRowsModified();
    return { success: true, changes };
  } catch (error) {
    console.error('[Database] Execute error:', error);
    console.error('[Database] SQL:', sql.substring(0, 200));
    console.error('[Database] Params:', params.slice(0, 5));
    return { success: false, error: error?.message || String(error) };
  }
}

// =====================================================
// RESERVATION OPERATIONS
// =====================================================

/**
 * Upsert a reservation (insert or update)
 */
function upsertReservation(reservation) {
  // Extract custom field values - handle both array and object formats
  let customFields = reservation.customFields || [];
  
  // If customFields is an object (from detailed API), convert to array
  if (customFields && typeof customFields === 'object' && !Array.isArray(customFields)) {
    customFields = Object.values(customFields);
  }
  
  // Find breakfast field (case-insensitive, handles various field name formats)
  const breakfastField = customFields.find(cf => {
    const name = (cf.customFieldName || cf.name || '').toLowerCase();
    return name.includes('breakfast');
  });
  
  // Find cleaning field
  const cleaningField = customFields.find(cf => {
    const name = (cf.customFieldName || cf.name || '').toLowerCase();
    return name.includes('cleaning');
  });
  
  // Validate email - filter out invalid entries like "N/A"
  let guestEmail = reservation.guestEmail;
  if (guestEmail && (guestEmail.toLowerCase() === 'n/a' || !guestEmail.includes('@'))) {
    guestEmail = null; // Don't store invalid emails
  }
  
  const sql = `
    INSERT INTO reservations (
      reservation_id, property_id, guest_name, guest_email, is_anonymized,
      start_date, end_date, date_created, date_modified, estimated_arrival_time,
      status, total, balance, balance_detailed, source, source_id,
      third_party_identifier, origin, allotment_block_code,
      channel_provided_credit_card, meal_plans, breakfast_requested,
      daily_cleaning_requested, custom_fields_json, cards_on_file_json, last_synced_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, datetime('now')
    )
    ON CONFLICT(reservation_id) DO UPDATE SET
      guest_name = excluded.guest_name,
      guest_email = excluded.guest_email,
      is_anonymized = excluded.is_anonymized,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      date_modified = excluded.date_modified,
      estimated_arrival_time = excluded.estimated_arrival_time,
      status = excluded.status,
      total = excluded.total,
      balance = excluded.balance,
      balance_detailed = excluded.balance_detailed,
      source = excluded.source,
      origin = excluded.origin,
      meal_plans = excluded.meal_plans,
      breakfast_requested = excluded.breakfast_requested,
      daily_cleaning_requested = excluded.daily_cleaning_requested,
      custom_fields_json = excluded.custom_fields_json,
      cards_on_file_json = excluded.cards_on_file_json,
      last_synced_at = datetime('now'),
      updated_at = datetime('now')
  `;
  
  // Helper to convert undefined to null (sql.js requires this)
  const n = (v) => v === undefined ? null : v;
  
  // Extract custom field values with fallbacks
  const breakfastValue = breakfastField?.customFieldValue || breakfastField?.value || null;
  const cleaningValue = cleaningField?.customFieldValue || cleaningField?.value || null;
  
  // Handle source field - detail endpoint uses 'source', list endpoint uses 'sourceName'
  const sourceValue = reservation.source || reservation.sourceName || null;
  
  const params = [
    n(reservation.reservationID),
    n(reservation.propertyID),
    n(reservation.guestName),
    n(guestEmail), // Use validated email
    reservation.isAnonymized ? 1 : 0,
    n(reservation.startDate),
    n(reservation.endDate),
    n(reservation.dateCreated),
    n(reservation.dateModified),
    n(reservation.estimatedArrivalTime),
    n(reservation.status) || 'confirmed',
    reservation.total || 0,
    reservation.balance || 0,
    JSON.stringify(reservation.balanceDetailed || {}),
    n(sourceValue), // Use source or sourceName
    n(reservation.sourceID),
    n(reservation.thirdPartyIdentifier),
    n(reservation.origin),
    n(reservation.allotmentBlockCode),
    reservation.channelProvidedCreditCard ? 1 : 0,
    n(reservation.mealPlans),
    n(breakfastValue),
    n(cleaningValue),
    JSON.stringify(customFields),
    JSON.stringify(reservation.cardsOnFile || [])
  ];
  
  return execute(sql, params);
}

/**
 * Upsert reservation rooms
 */
function upsertReservationRooms(reservationId, rooms, isAssigned = true) {
  const sql = `
    INSERT INTO reservation_rooms (
      reservation_id, reservation_room_id, sub_reservation_id,
      room_id, room_name, room_type_id, room_type_name, room_type_name_short,
      room_type_is_virtual, dorm_room_name, start_date, end_date,
      adults, children, room_total, daily_rates_json, market_name, market_code, is_assigned
    ) VALUES (
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(reservation_id, reservation_room_id) DO UPDATE SET
      room_id = excluded.room_id,
      room_name = excluded.room_name,
      room_type_name = excluded.room_type_name,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      adults = excluded.adults,
      children = excluded.children,
      room_total = excluded.room_total,
      daily_rates_json = excluded.daily_rates_json,
      market_name = excluded.market_name,
      market_code = excluded.market_code,
      updated_at = datetime('now')
  `;
  
  // Helper to convert undefined to null (sql.js requires this)
  const n = (v) => v === undefined ? null : v;
  
  for (const room of rooms) {
    const params = [
      n(reservationId),
      n(room.reservationRoomID),
      n(room.subReservationID),
      n(room.roomID),
      n(room.roomName),
      n(room.roomTypeID),
      n(room.roomTypeName),
      n(room.roomTypeNameShort),
      room.roomTypeIsVirtual ? 1 : 0,
      n(room.dormRoomName),
      n(room.startDate),
      n(room.endDate),
      parseInt(room.adults) || 1,
      parseInt(room.children) || 0,
      parseFloat(room.roomTotal) || 0,
      JSON.stringify(room.dailyRates || []),
      n(room.marketName),
      n(room.marketCode),
      isAssigned ? 1 : 0
    ];
    
    execute(sql, params);
  }
}

/**
 * Upsert a guest
 * Handles both formats: 
 *   - getGuestList API format (guestFirstName, guestEmail, etc.)
 *   - getReservation guestList format (guestFirstName/firstName, etc.)
 */
function upsertGuest(guest, reservationId = null, isMainGuest = true) {
  const sql = `
    INSERT INTO guests (
      guest_id, reservation_id, first_name, last_name, email, phone, cell_phone,
      gender, birth_date, address, address2, city, state, zip, country,
      document_type, document_number, document_issue_date, document_issuing_country,
      document_expiration_date, company_name, company_tax_id, tax_id,
      special_requests, guest_opt_in, is_anonymized, is_merged, new_guest_id,
      is_main_guest, custom_fields_json, guest_requirements_json, last_synced_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, datetime('now')
    )
    ON CONFLICT(guest_id) DO UPDATE SET
      reservation_id = COALESCE(excluded.reservation_id, guests.reservation_id),
      first_name = COALESCE(excluded.first_name, guests.first_name),
      last_name = COALESCE(excluded.last_name, guests.last_name),
      email = COALESCE(excluded.email, guests.email),
      phone = COALESCE(excluded.phone, guests.phone),
      cell_phone = COALESCE(excluded.cell_phone, guests.cell_phone),
      address = COALESCE(excluded.address, guests.address),
      city = COALESCE(excluded.city, guests.city),
      state = COALESCE(excluded.state, guests.state),
      country = COALESCE(excluded.country, guests.country),
      special_requests = COALESCE(excluded.special_requests, guests.special_requests),
      guest_opt_in = excluded.guest_opt_in,
      is_anonymized = excluded.is_anonymized,
      custom_fields_json = excluded.custom_fields_json,
      last_synced_at = datetime('now'),
      updated_at = datetime('now')
  `;
  
  // Helper to convert undefined to null (sql.js requires this)
  const n = (v) => v === undefined ? null : v;
  
  // Map field names - handle both Cloudbeds API formats:
  // - getGuestList format: guestFirstName, guestLastName, guestEmail, etc.
  // - guestList object format: guestFirstName, guestLastName, etc.
  const firstName = guest.firstName || guest.guestFirstName || null;
  const lastName = guest.lastName || guest.guestLastName || null;
  const phone = guest.phone || guest.guestPhone || null;
  const cellPhone = guest.cellPhone || guest.guestCellPhone || null;
  const gender = guest.gender || guest.guestGender || null;
  const birthDate = guest.birthDate || guest.guestBirthDate || null;
  const address = guest.address || guest.guestAddress || null;
  const address2 = guest.address2 || guest.guestAddress2 || null;
  const city = guest.city || guest.guestCity || null;
  const state = guest.state || guest.guestState || null;
  const zip = guest.zip || guest.guestZip || null;
  const country = guest.country || guest.guestCountry || null;
  const documentType = guest.documentType || guest.guestDocumentType || null;
  const documentNumber = guest.documentNumber || guest.guestDocumentNumber || null;
  const documentIssueDate = guest.documentIssueDate || guest.guestDocumentIssueDate || null;
  const documentIssuingCountry = guest.documentIssuingCountry || guest.guestDocumentIssuingCountry || null;
  const documentExpirationDate = guest.documentExpirationDate || guest.guestDocumentExpirationDate || null;
  const companyName = guest.companyName || guest.guestCompanyName || null;
  const companyTaxID = guest.companyTaxID || guest.guestCompanyTaxID || null;
  const taxID = guest.taxID || guest.guestTaxID || null;
  const specialRequests = guest.specialRequests || guest.guestSpecialRequests || null;
  const newGuestID = guest.newGuestID || guest.newGuestId || null;
  
  // Validate email - filter out invalid entries like "N/A"
  let email = guest.email || guest.guestEmail || null;
  if (email && (email.toLowerCase() === 'n/a' || !email.includes('@'))) {
    email = null; // Don't store invalid emails
  }
  
  const params = [
    n(guest.guestID || guest.guestId),
    n(reservationId),
    n(firstName),
    n(lastName),
    n(email),
    n(phone),
    n(cellPhone),
    n(gender),
    n(birthDate),
    n(address),
    n(address2),
    n(city),
    n(state),
    n(zip),
    n(country),
    n(documentType),
    n(documentNumber),
    n(documentIssueDate),
    n(documentIssuingCountry),
    n(documentExpirationDate),
    n(companyName),
    n(companyTaxID),
    n(taxID),
    n(specialRequests),
    guest.guestOptIn ? 1 : 0,
    guest.isAnonymized ? 1 : 0,
    guest.isMerged ? 1 : 0,
    n(newGuestID),
    isMainGuest ? 1 : 0,
    JSON.stringify(guest.customFields || []),
    JSON.stringify(guest.guestRequirements || [])
  ];
  
  return execute(sql, params);
}

// =====================================================
// QUERY OPERATIONS
// =====================================================

/**
 * Get all reservations with optional filters
 */
function getReservations(filters = {}) {
  let sql = 'SELECT * FROM reservations WHERE 1=1';
  const params = [];
  
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  
  if (filters.startDate) {
    sql += ' AND start_date >= ?';
    params.push(filters.startDate);
  }
  
  if (filters.endDate) {
    sql += ' AND end_date <= ?';
    params.push(filters.endDate);
  }
  
  if (filters.hasBalance) {
    sql += ' AND balance > 0';
  }
  
  if (filters.breakfastRequested) {
    sql += " AND breakfast_requested LIKE '%yes%'";
  }
  
  if (filters.cleaningRequested) {
    sql += " AND daily_cleaning_requested LIKE '%yes%'";
  }
  
  sql += ' ORDER BY start_date DESC';
  
  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  return query(sql, params);
}

/**
 * Get reservation by ID with full details
 */
function getReservationById(reservationId) {
  const reservation = queryOne('SELECT * FROM reservations WHERE reservation_id = ?', [reservationId]);
  
  if (reservation) {
    // Get rooms
    reservation.rooms = query('SELECT * FROM reservation_rooms WHERE reservation_id = ?', [reservationId]);
    
    // Get guests
    reservation.guests = query('SELECT * FROM guests WHERE reservation_id = ?', [reservationId]);
    
    // Parse JSON fields
    try {
      reservation.customFields = JSON.parse(reservation.custom_fields_json || '[]');
      reservation.balanceDetailed = JSON.parse(reservation.balance_detailed || '{}');
      reservation.cardsOnFile = JSON.parse(reservation.cards_on_file_json || '[]');
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  return reservation;
}

/**
 * Get guests with optional filters
 */
function getGuests(filters = {}) {
  let sql = 'SELECT * FROM guests WHERE 1=1';
  const params = [];
  
  if (filters.email) {
    sql += ' AND email = ?';
    params.push(filters.email);
  }
  
  if (filters.hasEmail) {
    sql += " AND email IS NOT NULL AND email != ''";
  }
  
  if (filters.optedIn) {
    sql += ' AND guest_opt_in = 1';
  }
  
  if (filters.country) {
    sql += ' AND country = ?';
    params.push(filters.country);
  }
  
  sql += ' ORDER BY last_name, first_name';
  
  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  return query(sql, params);
}

/**
 * Get reservation statistics
 */
function getReservationStats() {
  return queryOne(`
    SELECT 
      COUNT(*) as total_reservations,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
      SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as checked_in,
      SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END) as checked_out,
      SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled,
      SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show,
      SUM(total) as total_revenue,
      SUM(balance) as total_outstanding
    FROM reservations
  `);
}

/**
 * Get today's check-ins
 */
function getTodaysCheckins() {
  return query(`
    SELECT * FROM reservations 
    WHERE start_date = date('now') 
    AND status IN ('confirmed', 'not_confirmed')
  `);
}

/**
 * Get today's check-outs
 */
function getTodaysCheckouts() {
  return query(`
    SELECT * FROM reservations 
    WHERE end_date = date('now') 
    AND status = 'checked_in'
  `);
}

/**
 * Get breakfast requests for today
 */
function getBreakfastToday() {
  return query(`
    SELECT 
      r.reservation_id,
      r.guest_name,
      r.guest_email,
      rr.room_name,
      rr.room_type_name,
      r.breakfast_requested
    FROM reservations r
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
    WHERE r.breakfast_requested LIKE '%yes%'
    AND r.status = 'checked_in'
    AND date('now') BETWEEN r.start_date AND r.end_date
  `);
}

/**
 * Get cleaning requests for today
 */
function getCleaningToday() {
  return query(`
    SELECT 
      r.reservation_id,
      r.guest_name,
      r.guest_email,
      rr.room_name,
      rr.room_type_name,
      r.daily_cleaning_requested
    FROM reservations r
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
    WHERE r.daily_cleaning_requested LIKE '%yes%'
    AND r.status = 'checked_in'
    AND date('now') BETWEEN r.start_date AND r.end_date
  `);
}

/**
 * Get outstanding balances
 */
function getOutstandingBalances() {
  return query(`
    SELECT 
      r.*,
      g.phone,
      g.cell_phone
    FROM reservations r
    LEFT JOIN guests g ON r.reservation_id = g.reservation_id AND g.is_main_guest = 1
    WHERE r.balance > 0
    AND r.status IN ('checked_in', 'checked_out')
  `);
}

/**
 * Get marketing eligible guests
 */
function getMarketingEligible() {
  return query(`
    SELECT DISTINCT
      g.guest_id,
      g.first_name,
      g.last_name,
      g.email,
      g.country,
      g.city,
      r.source,
      MAX(r.end_date) as last_stay,
      COUNT(r.reservation_id) as total_stays,
      SUM(r.total) as lifetime_value
    FROM guests g
    JOIN reservations r ON g.reservation_id = r.reservation_id
    WHERE g.email IS NOT NULL 
    AND g.email != ''
    AND g.guest_opt_in = 1
    AND g.is_anonymized = 0
    GROUP BY g.guest_id
  `);
}

// =====================================================
// SYNC LOG OPERATIONS
// =====================================================

/**
 * Start a sync log entry
 */
function startSyncLog(syncType) {
  const sql = `
    INSERT INTO sync_log (sync_type, started_at, status)
    VALUES (?, datetime('now'), 'running')
  `;
  execute(sql, [syncType]);
  saveDatabase();
  
  // Get the last inserted ID
  const result = queryOne('SELECT last_insert_rowid() as id');
  return result?.id || 0;
}

/**
 * Complete a sync log entry
 */
function completeSyncLog(logId, stats) {
  const sql = `
    UPDATE sync_log SET
      completed_at = datetime('now'),
      status = 'completed',
      records_processed = ?,
      records_created = ?,
      records_updated = ?,
      metadata_json = ?
    WHERE id = ?
  `;
  execute(sql, [
    stats.processed || 0,
    stats.created || 0,
    stats.updated || 0,
    JSON.stringify(stats.metadata || {}),
    logId
  ]);
  saveDatabase();
}

/**
 * Fail a sync log entry
 */
function failSyncLog(logId, errorMessage) {
  const sql = `
    UPDATE sync_log SET
      completed_at = datetime('now'),
      status = 'failed',
      error_message = ?
    WHERE id = ?
  `;
  execute(sql, [errorMessage, logId]);
  saveDatabase();
}

/**
 * Get last successful sync
 */
function getLastSync(syncType = null) {
  let sql = "SELECT * FROM sync_log WHERE status = 'completed'";
  const params = [];
  
  if (syncType) {
    sql += ' AND sync_type = ?';
    params.push(syncType);
  }
  
  sql += ' ORDER BY completed_at DESC LIMIT 1';
  return queryOne(sql, params);
}

// =====================================================
// DAILY OPERATIONS QUERIES
// =====================================================

/**
 * Get all reservations for daily operations view
 */
function getDailyReservations(options = {}) {
  const { limit = 100, includeDetails = true } = options;
  
  let sql = `
    SELECT 
      r.*,
      rr.room_name,
      rr.room_type_name,
      g.first_name,
      g.last_name,
      g.phone,
      g.cell_phone,
      g.email as guest_email_from_guests
    FROM reservations r
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
    LEFT JOIN guests g ON r.reservation_id = g.reservation_id AND g.is_main_guest = 1
    ORDER BY r.start_date DESC
  `;
  
  if (limit) {
    sql += ` LIMIT ${limit}`;
  }
  
  return query(sql);
}

/**
 * Get outstanding balances from past 3 days (checked-in guests)
 */
function getOutstandingBalancePast3Days() {
  return query(`
    SELECT 
      r.*,
      rr.room_name,
      rr.room_type_name,
      g.phone,
      g.cell_phone
    FROM reservations r
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
    LEFT JOIN guests g ON r.reservation_id = g.reservation_id AND g.is_main_guest = 1
    WHERE r.balance > 0
    AND r.status IN ('checked_in', 'checked_out')
    AND r.start_date >= date('now', '-3 days')
    AND r.start_date < date('now')
    ORDER BY r.balance DESC
  `);
}

/**
 * Get all service requests for today (breakfast, daily cleaning, checkout turnovers)
 */
function getServicesForToday() {
  // Breakfast requests - currently checked in guests with breakfast = yes
  const breakfast = query(`
    SELECT 
      r.reservation_id,
      r.guest_name,
      r.guest_email,
      rr.room_name,
      rr.room_type_name,
      r.breakfast_requested as custom_field_value,
      r.start_date,
      r.end_date,
      r.status
    FROM reservations r
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
    WHERE LOWER(r.breakfast_requested) LIKE '%yes%'
    AND r.status = 'checked_in'
    AND date('now') BETWEEN r.start_date AND r.end_date
  `);
  
  // Daily cleaning requests - currently checked in guests with cleaning = yes
  const dailyCleaning = query(`
    SELECT 
      r.reservation_id,
      r.guest_name,
      r.guest_email,
      rr.room_name,
      rr.room_type_name,
      r.daily_cleaning_requested as custom_field_value,
      r.start_date,
      r.end_date,
      r.status
    FROM reservations r
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
    WHERE LOWER(r.daily_cleaning_requested) LIKE '%yes%'
    AND r.status = 'checked_in'
    AND date('now') BETWEEN r.start_date AND r.end_date
  `);
  
  // Checkout turnovers - guests checking out today
  const checkoutCleaning = query(`
    SELECT 
      r.reservation_id,
      r.guest_name,
      r.guest_email,
      rr.room_name,
      rr.room_type_name,
      'Checkout' as custom_field_value,
      r.start_date,
      r.end_date,
      r.status
    FROM reservations r
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
    WHERE r.end_date = date('now')
    AND r.status = 'checked_in'
  `);
  
  return {
    breakfast,
    dailyCleaning,
    checkoutCleaning,
    cleaning: [...dailyCleaning, ...checkoutCleaning]
  };
}

/**
 * Get all guests with emails for marketing
 */
function getAllGuestsWithEmail() {
  return query(`
    SELECT 
      g.*,
      r.reservation_id,
      r.source,
      r.start_date,
      r.end_date,
      r.status as reservation_status,
      r.total,
      rr.room_type_name
    FROM guests g
    LEFT JOIN reservations r ON g.reservation_id = r.reservation_id
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
    WHERE g.email IS NOT NULL 
    AND g.email != ''
    ORDER BY r.start_date DESC
  `);
}

/**
 * Get enriched reservations with all details
 */
function getEnrichedReservations(filters = {}) {
  let sql = `
    SELECT 
      r.*,
      rr.room_name,
      rr.room_type_name,
      rr.room_type_id,
      g.first_name,
      g.last_name,
      g.email as guest_email_direct,
      g.phone,
      g.cell_phone,
      g.country as guest_country,
      g.city as guest_city
    FROM reservations r
    LEFT JOIN reservation_rooms rr ON r.reservation_id = rr.reservation_id
    LEFT JOIN guests g ON r.reservation_id = g.reservation_id AND g.is_main_guest = 1
    WHERE 1=1
  `;
  
  const params = [];
  
  if (filters.status) {
    sql += ' AND r.status = ?';
    params.push(filters.status);
  }
  
  if (filters.checkin_from) {
    sql += ' AND r.start_date >= ?';
    params.push(filters.checkin_from);
  }
  
  if (filters.checkout_to) {
    sql += ' AND r.end_date <= ?';
    params.push(filters.checkout_to);
  }
  
  sql += ' ORDER BY r.start_date DESC';
  
  if (filters.limit) {
    sql += ` LIMIT ${parseInt(filters.limit)}`;
  }
  
  return query(sql, params);
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  initDatabase,
  getDb,
  closeDatabase,
  saveDatabase,
  
  // Helpers
  query,
  queryOne,
  execute,
  
  // Reservations
  upsertReservation,
  upsertReservationRooms,
  getReservations,
  getReservationById,
  getReservationStats,
  
  // Guests
  upsertGuest,
  getGuests,
  
  // Views
  getTodaysCheckins,
  getTodaysCheckouts,
  getBreakfastToday,
  getCleaningToday,
  getOutstandingBalances,
  getMarketingEligible,
  
  // Daily Operations
  getDailyReservations,
  getOutstandingBalancePast3Days,
  getServicesForToday,
  getAllGuestsWithEmail,
  getEnrichedReservations,
  
  // Sync
  startSyncLog,
  completeSyncLog,
  failSyncLog,
  getLastSync,
  
  // Constants
  DB_PATH
};
