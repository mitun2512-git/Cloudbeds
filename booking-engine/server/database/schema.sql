-- =====================================================
-- HENNESSEY ESTATE - CLOUDBEDS RESERVATION DATABASE
-- Schema Version: 1.0
-- Created: December 29, 2025
-- =====================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- =====================================================
-- RESERVATIONS TABLE
-- Core reservation data from Cloudbeds getReservation
-- =====================================================
CREATE TABLE IF NOT EXISTS reservations (
    -- Primary Keys
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id TEXT UNIQUE NOT NULL,
    property_id TEXT NOT NULL,
    
    -- Guest Info (Main Guest)
    guest_name TEXT,
    guest_email TEXT,
    is_anonymized INTEGER DEFAULT 0,
    
    -- Dates
    start_date TEXT NOT NULL,                    -- Check-in date (YYYY-MM-DD)
    end_date TEXT NOT NULL,                      -- Check-out date (YYYY-MM-DD)
    date_created TEXT,                           -- Reservation created datetime
    date_modified TEXT,                          -- Last modified datetime
    estimated_arrival_time TEXT,                 -- 24-hour format (HH:MM)
    
    -- Status
    status TEXT NOT NULL DEFAULT 'confirmed',    -- confirmed, not_confirmed, canceled, checked_in, checked_out, no_show
    
    -- Financial
    total REAL DEFAULT 0,                        -- Total price
    balance REAL DEFAULT 0,                      -- Balance owed
    balance_detailed TEXT,                       -- JSON: Detailed financial breakdown
    
    -- Source & Origin
    source TEXT,                                 -- Booking source (Website, Booking.com, etc)
    source_id TEXT,                              -- Source unique ID
    third_party_identifier TEXT,                 -- OTA identifier
    origin TEXT,                                 -- Reservation origin
    
    -- Additional Info
    allotment_block_code TEXT,
    channel_provided_credit_card INTEGER DEFAULT 0,
    meal_plans TEXT,
    
    -- Custom Fields (Hennessey Estate specific)
    breakfast_requested TEXT,                    -- 'Yes' or 'Decline'
    daily_cleaning_requested TEXT,               -- 'Yes' or 'Decline'
    
    -- Raw Data
    custom_fields_json TEXT,                     -- Full custom fields array as JSON
    cards_on_file_json TEXT,                     -- Credit cards as JSON
    
    -- Sync Metadata
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_synced_at TEXT,
    
    -- Indexes
    CHECK (status IN ('confirmed', 'not_confirmed', 'canceled', 'checked_in', 'checked_out', 'no_show'))
);

-- =====================================================
-- GUESTS TABLE
-- Guest details from Cloudbeds getGuest/guestList
-- =====================================================
CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id TEXT UNIQUE NOT NULL,               -- Cloudbeds guest ID
    reservation_id TEXT,                         -- Link to reservation (nullable for standalone guests)
    
    -- Name
    first_name TEXT,
    last_name TEXT,
    
    -- Contact
    email TEXT,
    phone TEXT,
    cell_phone TEXT,
    
    -- Demographics
    gender TEXT,                                 -- M, F, N/A
    birth_date TEXT,
    
    -- Address
    address TEXT,
    address2 TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,                                -- 2-digit country code
    
    -- Documents
    document_type TEXT,
    document_number TEXT,
    document_issue_date TEXT,
    document_issuing_country TEXT,               -- 2-digit code
    document_expiration_date TEXT,
    
    -- Company Info
    company_name TEXT,
    company_tax_id TEXT,
    tax_id TEXT,
    
    -- Preferences
    special_requests TEXT,
    guest_opt_in INTEGER DEFAULT 0,              -- Marketing opt-in
    
    -- Status Flags
    is_anonymized INTEGER DEFAULT 0,
    is_merged INTEGER DEFAULT 0,
    new_guest_id TEXT,                           -- If merged, the new guest ID
    is_main_guest INTEGER DEFAULT 1,             -- Primary guest on reservation
    
    -- Raw Data
    custom_fields_json TEXT,
    guest_requirements_json TEXT,
    
    -- Sync Metadata
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_synced_at TEXT,
    
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE SET NULL
);

-- =====================================================
-- RESERVATION_ROOMS TABLE
-- Assigned rooms from Cloudbeds (assigned array)
-- =====================================================
CREATE TABLE IF NOT EXISTS reservation_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id TEXT NOT NULL,
    reservation_room_id TEXT NOT NULL,           -- Cloudbeds reservationRoomID
    sub_reservation_id TEXT,
    
    -- Room Info
    room_id TEXT,
    room_name TEXT,
    room_type_id TEXT,
    room_type_name TEXT,
    room_type_name_short TEXT,
    room_type_is_virtual INTEGER DEFAULT 0,
    dorm_room_name TEXT,
    
    -- Dates (room-specific, may differ from main reservation)
    start_date TEXT,
    end_date TEXT,
    
    -- Occupancy
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    
    -- Financial
    room_total REAL DEFAULT 0,
    daily_rates_json TEXT,                       -- JSON array: [{date, rate}, ...]
    
    -- Market Segmentation
    market_name TEXT,
    market_code TEXT,
    
    -- Status
    is_assigned INTEGER DEFAULT 1,               -- 1 = assigned, 0 = unassigned
    
    -- Sync Metadata
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    UNIQUE(reservation_id, reservation_room_id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE
);

-- =====================================================
-- ROOM_TYPES TABLE
-- Room type master data from Cloudbeds getRoomTypes
-- =====================================================
CREATE TABLE IF NOT EXISTS room_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_type_id TEXT UNIQUE NOT NULL,
    property_id TEXT NOT NULL,
    
    room_type_name TEXT,
    room_type_name_short TEXT,
    room_type_description TEXT,
    max_guests INTEGER,
    adults_included INTEGER,
    children_included INTEGER,
    is_virtual INTEGER DEFAULT 0,
    is_private INTEGER DEFAULT 1,
    
    -- Sync Metadata
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_synced_at TEXT
);

-- =====================================================
-- SYNC_LOG TABLE
-- Track data synchronization from Cloudbeds
-- =====================================================
CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_type TEXT NOT NULL,                     -- 'full', 'incremental', 'reservations', 'guests', 'room_types'
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT DEFAULT 'running',               -- 'running', 'completed', 'failed'
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    error_message TEXT,
    metadata_json TEXT                           -- Additional sync details
);

-- =====================================================
-- INDEXES
-- Optimize common queries
-- =====================================================

-- Reservations
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_start_date ON reservations(start_date);
CREATE INDEX IF NOT EXISTS idx_reservations_end_date ON reservations(end_date);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_email ON reservations(guest_email);
CREATE INDEX IF NOT EXISTS idx_reservations_date_created ON reservations(date_created);
CREATE INDEX IF NOT EXISTS idx_reservations_source ON reservations(source);
CREATE INDEX IF NOT EXISTS idx_reservations_balance ON reservations(balance);
CREATE INDEX IF NOT EXISTS idx_reservations_breakfast ON reservations(breakfast_requested);
CREATE INDEX IF NOT EXISTS idx_reservations_cleaning ON reservations(daily_cleaning_requested);

-- Guests
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_reservation ON guests(reservation_id);
CREATE INDEX IF NOT EXISTS idx_guests_country ON guests(country);
CREATE INDEX IF NOT EXISTS idx_guests_city ON guests(city);
CREATE INDEX IF NOT EXISTS idx_guests_opt_in ON guests(guest_opt_in);

-- Reservation Rooms
CREATE INDEX IF NOT EXISTS idx_rooms_reservation ON reservation_rooms(reservation_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON reservation_rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_dates ON reservation_rooms(start_date, end_date);

-- Sync Log
CREATE INDEX IF NOT EXISTS idx_sync_log_type ON sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status);

-- =====================================================
-- VIEWS
-- Common query patterns
-- =====================================================

-- Active reservations (checked_in or confirmed)
CREATE VIEW IF NOT EXISTS v_active_reservations AS
SELECT 
    r.*,
    g.first_name,
    g.last_name,
    g.phone,
    g.cell_phone,
    g.country as guest_country,
    g.city as guest_city
FROM reservations r
LEFT JOIN guests g ON r.reservation_id = g.reservation_id AND g.is_main_guest = 1
WHERE r.status IN ('confirmed', 'checked_in');

-- Today's check-ins
CREATE VIEW IF NOT EXISTS v_todays_checkins AS
SELECT * FROM reservations 
WHERE start_date = date('now') 
AND status IN ('confirmed', 'not_confirmed');

-- Today's check-outs
CREATE VIEW IF NOT EXISTS v_todays_checkouts AS
SELECT * FROM reservations 
WHERE end_date = date('now') 
AND status = 'checked_in';

-- Guests requesting breakfast (today)
CREATE VIEW IF NOT EXISTS v_breakfast_today AS
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
AND date('now') BETWEEN r.start_date AND r.end_date;

-- Guests requesting daily cleaning (today)
CREATE VIEW IF NOT EXISTS v_cleaning_today AS
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
AND date('now') BETWEEN r.start_date AND r.end_date;

-- Outstanding balances
CREATE VIEW IF NOT EXISTS v_outstanding_balance AS
SELECT 
    r.*,
    g.phone,
    g.cell_phone
FROM reservations r
LEFT JOIN guests g ON r.reservation_id = g.reservation_id AND g.is_main_guest = 1
WHERE r.balance > 0
AND r.status IN ('checked_in', 'checked_out');

-- Reservation summary stats
CREATE VIEW IF NOT EXISTS v_reservation_stats AS
SELECT 
    COUNT(*) as total_reservations,
    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
    SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as checked_in,
    SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END) as checked_out,
    SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled,
    SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show,
    SUM(total) as total_revenue,
    SUM(balance) as total_outstanding
FROM reservations;

-- Marketing eligible guests (opted in with email)
CREATE VIEW IF NOT EXISTS v_marketing_eligible AS
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
GROUP BY g.guest_id;

-- =====================================================
-- TRIGGERS
-- Automatic timestamp updates
-- =====================================================

CREATE TRIGGER IF NOT EXISTS trg_reservations_updated 
AFTER UPDATE ON reservations
BEGIN
    UPDATE reservations SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_guests_updated 
AFTER UPDATE ON guests
BEGIN
    UPDATE guests SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_rooms_updated 
AFTER UPDATE ON reservation_rooms
BEGIN
    UPDATE reservation_rooms SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- =====================================================
-- EMAIL MARKETING TABLES
-- Email drafts, campaigns, and tracking
-- =====================================================

-- Email Drafts Table
CREATE TABLE IF NOT EXISTS email_drafts (
    id TEXT PRIMARY KEY,
    strategy_type TEXT,
    strategy_id TEXT,
    subject TEXT NOT NULL,
    preheader TEXT,
    greeting TEXT,
    body TEXT,                          -- JSON array of paragraphs
    cta TEXT,
    cta_url TEXT,
    footer TEXT,
    target_guest_filter TEXT,           -- JSON: filter criteria for target guests
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT DEFAULT 'system'
);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id TEXT PRIMARY KEY,
    draft_id TEXT,
    name TEXT NOT NULL,
    strategy_type TEXT,
    subject TEXT NOT NULL,
    preheader TEXT,
    greeting TEXT,
    body TEXT,                          -- JSON array of paragraphs (template with variables)
    cta TEXT,
    cta_url TEXT,
    footer TEXT,
    recipients_json TEXT,                -- JSON array of recipient data
    status TEXT DEFAULT 'draft',         -- draft, scheduled, sending, sent, paused, cancelled
    scheduled_for TEXT,
    sent_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (draft_id) REFERENCES email_drafts(id) ON DELETE SET NULL
);

-- Email Tracking Table
CREATE TABLE IF NOT EXISTS email_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_token TEXT UNIQUE NOT NULL,
    campaign_id TEXT,
    recipient_email TEXT,
    recipient_name TEXT,
    resend_email_id TEXT,                -- Resend email ID for fetching analytics
    first_open TEXT,
    last_open TEXT,
    first_click TEXT,
    last_click TEXT,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    events_json TEXT,                   -- JSON array of all events
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE SET NULL
);

-- Email Tracking Events Table (detailed event log)
CREATE TABLE IF NOT EXISTS email_tracking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_token TEXT NOT NULL,
    event_type TEXT NOT NULL,           -- 'sent', 'open', 'click', 'unsubscribe', 'bounce'
    metadata_json TEXT,                  -- JSON: IP, user agent, clicked URL, etc.
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (tracking_token) REFERENCES email_tracking(tracking_token) ON DELETE CASCADE
);

-- Indexes for email marketing
CREATE INDEX IF NOT EXISTS idx_email_drafts_strategy ON email_drafts(strategy_type);
CREATE INDEX IF NOT EXISTS idx_email_drafts_updated ON email_drafts(updated_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent ON email_campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_tracking_campaign ON email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_token ON email_tracking(tracking_token);
CREATE INDEX IF NOT EXISTS idx_email_tracking_email ON email_tracking(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_tracking_resend_id ON email_tracking(resend_email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_token ON email_tracking_events(tracking_token);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_tracking_events(event_type);

-- Migration: Add resend_email_id column to existing email_tracking table (if not exists)
-- This is safe to run multiple times - it will only add the column if it doesn't exist
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we check via PRAGMA
-- For production, run this migration manually if needed:
-- ALTER TABLE email_tracking ADD COLUMN resend_email_id TEXT;

