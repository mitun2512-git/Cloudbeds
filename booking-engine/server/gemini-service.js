/**
 * Gemini AI Chatbot Service
 * Provides intelligent assistance with Cloudbeds PMS data and APIs
 * Uses local SQLite database as primary data source
 */

const axios = require('axios');

// Gemini API Configuration - Using Gemini 3 Pro Preview (latest preview with advanced reasoning)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3-pro-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Database reference (set during initialization)
let db = null;

// Cache for reservation data (refreshed daily) - now backed by database
let reservationCache = {
  data: null,
  lastUpdated: null,
  refreshInterval: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Initialize with database reference
 */
function initWithDatabase(database) {
  db = database;
  console.log('[Gemini] Initialized with database reference');
}

// Cloudbeds API knowledge base
const CLOUDBEDS_API_KNOWLEDGE = `
# Cloudbeds PMS API Reference

You are an AI assistant for the Hennessey Estate hotel management system powered by Cloudbeds PMS.
You have deep knowledge of the Cloudbeds API and can help with:
- Reservation management
- Guest information
- Room availability and pricing
- Property operations

## Available API Endpoints

### Authentication
- GET /metadata - Get API metadata
- POST /access_token - Get access token
- GET /userinfo - Get user information

### Reservations
- GET /getReservations - List all reservations with filters
  - Query params: property_id, checkin_from, checkin_to, checkout_from, checkout_to, status
  - Status values: confirmed, checked_in, checked_out, canceled, no_show
- GET /getReservation - Get single reservation details
  - Query params: reservationID, propertyID
- POST /postReservation - Create new reservation
- PUT /putReservation - Update reservation

### Guests
- GET /getGuestList - List all guests with pagination
  - Query params: propertyID, pageSize, page
- GET /getGuest - Get single guest details
- PUT /putGuest - Update guest information
- POST /postGuest - Create new guest

### Rooms
- GET /getRoomTypes - List all room types
- GET /getRooms - List all rooms
- GET /getAvailableRoomTypes - Get available rooms for dates
- POST /postRoomCheckIn - Check in guest
- POST /postRoomCheckOut - Check out guest
- GET /getRoomBlocks - Get room blocks
- POST /postRoomBlock - Create room block

### Rates & Pricing
- GET /getRatePlans - Get rate plans with pricing
  - Query params: propertyID, startDate, endDate
- GET /getRate - Get specific rate details
- PUT /putRate - Update rate

### Housekeeping
- GET /getHousekeepingStatus - Get room housekeeping status
- POST /postHousekeepingStatus - Update housekeeping status
- GET /getHousekeepers - List housekeepers
- POST /postHousekeepingAssignment - Assign housekeeper

### Payments
- POST /postPayment - Process payment
- GET /getPaymentMethods - List payment methods
- POST /postVoidPayment - Void a payment

### Property
- GET /getHotels - List all properties
- GET /getHotelDetails - Get property details
- GET /getDashboard - Get dashboard data

### Items & Packages
- GET /getItems - List items/services
- POST /postItem - Add item to reservation
- GET /getPackages - List packages

### Reports & Dashboard
- GET /getDashboard - Property dashboard with occupancy stats
- GET /getReservationsWithRateDetails - Detailed reservation reports

## Reservation Status Values
- confirmed - Reservation is confirmed
- checked_in - Guest is currently checked in
- checked_out - Guest has checked out
- canceled - Reservation was canceled
- no_show - Guest did not show up

## Common Operations

### Check Room Availability
Use getAvailableRoomTypes with startDate, endDate, adults, children, rooms

### Get Today's Arrivals
Use getReservations with checkin_from and checkin_to set to today's date

### Get Outstanding Balances
Fetch reservations with status=checked_in or checked_out, filter by balance > 0

### View Occupancy
Use getDashboard for current occupancy statistics

## Data Format Notes
- Dates are in YYYY-MM-DD format
- Prices are in the property's default currency
- Guest IDs link reservations to guest records
- Custom fields store additional reservation data like breakfast/cleaning preferences
`;

// Function definitions for Gemini function calling
const FUNCTION_DECLARATIONS = [
  {
    name: "get_reservations",
    description: "Get reservations from the local database. Can filter by date range, status, and other criteria. Uses synced Cloudbeds data.",
    parameters: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "Start date for check-in filter (YYYY-MM-DD format)"
        },
        end_date: {
          type: "string",
          description: "End date for check-in filter (YYYY-MM-DD format)"
        },
        status: {
          type: "string",
          description: "Reservation status filter (confirmed, checked_in, checked_out, canceled, no_show)",
          enum: ["confirmed", "checked_in", "checked_out", "canceled", "no_show"]
        },
        has_balance: {
          type: "boolean",
          description: "Filter to only reservations with outstanding balance"
        },
        breakfast_requested: {
          type: "boolean",
          description: "Filter to reservations requesting breakfast"
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default 50)"
        }
      }
    }
  },
  {
    name: "get_todays_checkins",
    description: "Get all reservations checking in today from the database",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_todays_checkouts",
    description: "Get all reservations checking out today from the database",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_breakfast_requests",
    description: "Get all checked-in guests who have requested breakfast for today",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_cleaning_requests",
    description: "Get all checked-in guests who have requested daily cleaning for today",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_marketing_eligible_guests",
    description: "Get guests who are eligible for marketing (opted in, have email, not anonymized)",
    parameters: {
      type: "object",
      properties: {
        country: {
          type: "string",
          description: "Filter by country code (e.g., 'US', 'CA')"
        }
      }
    }
  },
  {
    name: "get_database_stats",
    description: "Get comprehensive statistics from the database including reservation counts, revenue totals, and status breakdowns",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_room_availability",
    description: "Check room availability and pricing for specific dates",
    parameters: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "Check-in date (YYYY-MM-DD format)"
        },
        end_date: {
          type: "string",
          description: "Check-out date (YYYY-MM-DD format)"
        }
      },
      required: ["start_date", "end_date"]
    }
  },
  {
    name: "get_guest_list",
    description: "Get list of guests from the system",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of guests to return (default 50)"
        }
      }
    }
  },
  {
    name: "get_reservation_details",
    description: "Get detailed information about a specific reservation",
    parameters: {
      type: "object",
      properties: {
        reservation_id: {
          type: "string",
          description: "The reservation ID to look up"
        }
      },
      required: ["reservation_id"]
    }
  },
  {
    name: "get_outstanding_balances",
    description: "Get reservations with outstanding balances from checked-in guests in the past 3 days",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_service_requests",
    description: "Get current day service requests (breakfast, daily cleaning) from checked-in guests",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_room_pricing",
    description: "Get room types sorted by price with upgrade options",
    parameters: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "Start date for pricing (YYYY-MM-DD format)"
        },
        end_date: {
          type: "string",
          description: "End date for pricing (YYYY-MM-DD format)"
        }
      }
    }
  },
  {
    name: "get_dashboard_stats",
    description: "Get current dashboard statistics including occupancy and arrivals",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_revenue_report",
    description: "Get revenue report for a date range. Calculates total revenue excluding taxes and can filter by reservation status.",
    parameters: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "Start date (YYYY-MM-DD format)"
        },
        end_date: {
          type: "string",
          description: "End date (YYYY-MM-DD format)"
        },
        exclude_canceled: {
          type: "boolean",
          description: "Whether to exclude canceled reservations (default: true)"
        },
        exclude_taxes: {
          type: "boolean",
          description: "Whether to exclude taxes from revenue (default: true)"
        }
      },
      required: ["start_date", "end_date"]
    }
  },
  {
    name: "get_reservations_by_booking_date",
    description: "Get reservations by the date they were booked (created), with breakdown by booking channel/source. Use this for questions like 'how many reservations did we get yesterday' or 'what channels are bookings coming from'.",
    parameters: {
      type: "object",
      properties: {
        booking_date: {
          type: "string",
          description: "Specific booking date (YYYY-MM-DD format). Use 'yesterday' or 'today' keywords, or a specific date."
        },
        start_date: {
          type: "string",
          description: "Start date for booking date range (YYYY-MM-DD format)"
        },
        end_date: {
          type: "string",
          description: "End date for booking date range (YYYY-MM-DD format)"
        },
        group_by_channel: {
          type: "boolean",
          description: "Whether to group results by booking channel/source (default: true)"
        }
      }
    }
  }
];

/**
 * Execute a function call from Gemini
 * Uses local database as primary source, falls back to API when needed
 */
async function executeFunctionCall(functionName, args, cloudbedsRequest) {
  console.log(`[Gemini] Executing function: ${functionName}`, args);
  
  try {
    switch (functionName) {
      // =====================================================
      // DATABASE-POWERED FUNCTIONS (Primary Data Source)
      // =====================================================
      
      case 'get_reservations': {
        // Use database as primary source
        if (db) {
          const filters = {
            status: args.status,
            startDate: args.start_date,
            endDate: args.end_date,
            hasBalance: args.has_balance,
            breakfastRequested: args.breakfast_requested,
            limit: args.limit || 50
          };
          
          const reservations = db.getReservations(filters);
          return {
            success: true,
            source: 'database',
            count: reservations.length,
            reservations: reservations.slice(0, 20).map(r => ({
              id: r.reservation_id,
              guestName: r.guest_name,
              checkIn: r.start_date,
              checkOut: r.end_date,
              status: r.status,
              balance: r.balance,
              total: r.total,
              breakfastRequested: r.breakfast_requested,
              cleaningRequested: r.daily_cleaning_requested
            }))
          };
        }
        
        // Fallback to API if database not available
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        
        const params = {
          property_id: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
          checkin_from: args.start_date || today,
          checkin_to: args.end_date || nextWeek.toISOString().split('T')[0]
        };
        
        if (args.status) {
          params.status = args.status;
        }
        
        const result = await cloudbedsRequest('GET', '/getReservations', null, params);
        if (result.success) {
          const reservations = result.data?.data || [];
          return {
            success: true,
            source: 'api',
            count: reservations.length,
            reservations: reservations.slice(0, 20).map(r => ({
              id: r.reservationID,
              guestName: r.guestName,
              checkIn: r.startDate,
              checkOut: r.endDate,
              status: r.status,
              roomType: r.roomTypeName,
              balance: r.balance,
              total: r.grandTotal
            }))
          };
        }
        return { success: false, error: result.error };
      }
      
      case 'get_todays_checkins': {
        if (db) {
          const checkins = db.getTodaysCheckins();
          return {
            success: true,
            source: 'database',
            date: new Date().toISOString().split('T')[0],
            count: checkins.length,
            arrivals: checkins.map(r => ({
              id: r.reservation_id,
              guestName: r.guest_name,
              guestEmail: r.guest_email,
              estimatedArrival: r.estimated_arrival_time || 'Not specified',
              total: r.total,
              balance: r.balance,
              breakfastRequested: r.breakfast_requested,
              cleaningRequested: r.daily_cleaning_requested
            }))
          };
        }
        return { success: false, error: 'Database not initialized' };
      }
      
      case 'get_todays_checkouts': {
        if (db) {
          const checkouts = db.getTodaysCheckouts();
          return {
            success: true,
            source: 'database',
            date: new Date().toISOString().split('T')[0],
            count: checkouts.length,
            departures: checkouts.map(r => ({
              id: r.reservation_id,
              guestName: r.guest_name,
              guestEmail: r.guest_email,
              balance: r.balance,
              totalSpent: r.total
            }))
          };
        }
        return { success: false, error: 'Database not initialized' };
      }
      
      case 'get_breakfast_requests': {
        if (db) {
          const requests = db.getBreakfastToday();
          return {
            success: true,
            source: 'database',
            date: new Date().toISOString().split('T')[0],
            count: requests.length,
            breakfastGuests: requests.map(r => ({
              reservationId: r.reservation_id,
              guestName: r.guest_name,
              roomName: r.room_name,
              roomType: r.room_type_name,
              request: r.breakfast_requested
            }))
          };
        }
        return { success: false, error: 'Database not initialized' };
      }
      
      case 'get_cleaning_requests': {
        if (db) {
          const requests = db.getCleaningToday();
          return {
            success: true,
            source: 'database',
            date: new Date().toISOString().split('T')[0],
            count: requests.length,
            cleaningGuests: requests.map(r => ({
              reservationId: r.reservation_id,
              guestName: r.guest_name,
              roomName: r.room_name,
              roomType: r.room_type_name,
              request: r.daily_cleaning_requested
            }))
          };
        }
        return { success: false, error: 'Database not initialized' };
      }
      
      case 'get_marketing_eligible_guests': {
        if (db) {
          const guests = db.getMarketingEligible();
          // Filter by country if specified
          const filtered = args.country 
            ? guests.filter(g => g.country === args.country)
            : guests;
          
          return {
            success: true,
            source: 'database',
            count: filtered.length,
            guests: filtered.slice(0, 50).map(g => ({
              guestId: g.guest_id,
              name: `${g.first_name || ''} ${g.last_name || ''}`.trim(),
              email: g.email,
              country: g.country,
              city: g.city,
              lastStay: g.last_stay,
              totalStays: g.total_stays,
              lifetimeValue: `$${(g.lifetime_value || 0).toFixed(2)}`
            }))
          };
        }
        return { success: false, error: 'Database not initialized' };
      }
      
      case 'get_database_stats': {
        if (db) {
          const stats = db.getReservationStats();
          const lastSync = db.getLastSync();
          
          return {
            success: true,
            source: 'database',
            lastSynced: lastSync?.completed_at || 'Never',
            statistics: {
              totalReservations: stats.total_reservations || 0,
              confirmed: stats.confirmed || 0,
              checkedIn: stats.checked_in || 0,
              checkedOut: stats.checked_out || 0,
              canceled: stats.canceled || 0,
              noShow: stats.no_show || 0,
              totalRevenue: `$${(stats.total_revenue || 0).toFixed(2)}`,
              totalOutstanding: `$${(stats.total_outstanding || 0).toFixed(2)}`
            }
          };
        }
        return { success: false, error: 'Database not initialized' };
      }
      
      case 'get_reservations_by_booking_date': {
        if (db) {
          // Parse date parameters
          const now = new Date();
          let startDate, endDate;
          
          if (args.booking_date) {
            // Handle special keywords
            if (args.booking_date === 'yesterday') {
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              startDate = yesterday.toISOString().split('T')[0];
              endDate = startDate;
            } else if (args.booking_date === 'today') {
              startDate = now.toISOString().split('T')[0];
              endDate = startDate;
            } else {
              startDate = args.booking_date;
              endDate = args.booking_date;
            }
          } else {
            startDate = args.start_date || now.toISOString().split('T')[0];
            endDate = args.end_date || startDate;
          }
          
          // Query reservations by date_created (booking date)
          const sql = `
            SELECT 
              reservation_id,
              guest_name,
              guest_email,
              start_date,
              end_date,
              status,
              total,
              source,
              origin,
              date_created
            FROM reservations
            WHERE date(date_created) >= date(?)
            AND date(date_created) <= date(?)
            ORDER BY date_created DESC
          `;
          
          const reservations = db.query(sql, [startDate, endDate]);
          
          // Group by channel (source/origin)
          const byChannel = {};
          const byOrigin = {};
          
          reservations.forEach(r => {
            const channel = r.source || 'Direct/Unknown';
            const origin = r.origin || 'Unknown';
            
            if (!byChannel[channel]) {
              byChannel[channel] = { count: 0, totalValue: 0, reservations: [] };
            }
            byChannel[channel].count++;
            byChannel[channel].totalValue += parseFloat(r.total || 0);
            if (byChannel[channel].reservations.length < 5) {
              byChannel[channel].reservations.push({
                id: r.reservation_id,
                guest: r.guest_name,
                checkIn: r.start_date,
                value: r.total
              });
            }
            
            if (!byOrigin[origin]) {
              byOrigin[origin] = { count: 0 };
            }
            byOrigin[origin].count++;
          });
          
          // Format channel breakdown
          const channelBreakdown = Object.entries(byChannel)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([channel, data]) => ({
              channel,
              count: data.count,
              totalValue: `$${data.totalValue.toFixed(2)}`,
              sampleBookings: data.reservations
            }));
          
          const originBreakdown = Object.entries(byOrigin)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([origin, data]) => ({
              origin,
              count: data.count
            }));
          
          return {
            success: true,
            source: 'database',
            dateRange: startDate === endDate 
              ? { date: startDate }
              : { start: startDate, end: endDate },
            summary: {
              totalReservations: reservations.length,
              totalValue: `$${reservations.reduce((sum, r) => sum + parseFloat(r.total || 0), 0).toFixed(2)}`,
              uniqueChannels: Object.keys(byChannel).length
            },
            byChannel: channelBreakdown,
            byOrigin: originBreakdown,
            recentBookings: reservations.slice(0, 10).map(r => ({
              id: r.reservation_id,
              guest: r.guest_name,
              checkIn: r.start_date,
              checkOut: r.end_date,
              status: r.status,
              value: `$${parseFloat(r.total || 0).toFixed(2)}`,
              channel: r.source || 'Direct/Unknown',
              origin: r.origin || 'Unknown',
              bookedAt: r.date_created
            }))
          };
        }
        return { success: false, error: 'Database not initialized' };
      }
      
      // =====================================================
      // API-POWERED FUNCTIONS (Real-time data)
      // =====================================================
      
      case 'get_room_availability': {
        const params = {
          propertyID: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
          startDate: args.start_date,
          endDate: args.end_date,
          adults: 2,
          children: 0,
          rooms: 1
        };
        
        const result = await cloudbedsRequest('GET', '/getAvailableRoomTypes', null, params);
        if (result.success) {
          const rooms = result.data?.data || result.data || [];
          const roomList = Array.isArray(rooms) ? rooms : Object.values(rooms);
          return {
            success: true,
            dateRange: { start: args.start_date, end: args.end_date },
            rooms: roomList.map(r => ({
              name: r.roomTypeName || r.name,
              available: r.roomsAvailable ?? r.available ?? 'Unknown',
              rate: r.roomRate || r.totalRate || 'Contact for pricing',
              maxGuests: r.maxGuests
            }))
          };
        }
        return { success: false, error: result.error };
      }
      
      case 'get_guest_list': {
        const result = await cloudbedsRequest('GET', '/getGuestList', null, {
          propertyID: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
          pageSize: args.limit || 50
        });
        
        if (result.success) {
          const guests = result.data?.data || [];
          return {
            success: true,
            count: guests.length,
            guests: guests.slice(0, 20).map(g => ({
              id: g.guestID,
              name: `${g.firstName || ''} ${g.lastName || ''}`.trim(),
              email: g.email,
              phone: g.phone
            }))
          };
        }
        return { success: false, error: result.error };
      }
      
      case 'get_reservation_details': {
        const result = await cloudbedsRequest('GET', '/getReservation', null, {
          reservationID: args.reservation_id,
          propertyID: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975'
        });
        
        if (result.success) {
          const r = result.data?.data || result.data;
          return {
            success: true,
            reservation: {
              id: r.reservationID,
              guestName: r.guestName,
              guestEmail: r.guestEmail,
              checkIn: r.startDate,
              checkOut: r.endDate,
              status: r.status,
              roomType: r.roomTypeName,
              roomNumber: r.assigned?.[0]?.roomName || 'Unassigned',
              adults: r.adults,
              children: r.children,
              balance: r.balance,
              total: r.grandTotal,
              source: r.sourceName,
              notes: r.guestNotes,
              customFields: r.customFields
            }
          };
        }
        return { success: false, error: result.error };
      }
      
      case 'get_outstanding_balances': {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        const result = await cloudbedsRequest('GET', '/getReservations', null, {
          property_id: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
          checkin_from: threeDaysAgo.toISOString().split('T')[0],
          checkin_to: yesterday.toISOString().split('T')[0],
          status: 'checked_in,checked_out'
        });
        
        if (result.success) {
          const reservations = result.data?.data || [];
          const withBalance = reservations.filter(r => parseFloat(r.balance) > 0);
          return {
            success: true,
            count: withBalance.length,
            totalOutstanding: withBalance.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0).toFixed(2),
            reservations: withBalance.map(r => ({
              id: r.reservationID,
              guestName: r.guestName,
              balance: r.balance,
              checkIn: r.startDate,
              roomType: r.roomTypeName
            }))
          };
        }
        return { success: false, error: result.error };
      }
      
      case 'get_service_requests': {
        // Get checked-in reservations
        const result = await cloudbedsRequest('GET', '/getReservations', null, {
          property_id: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
          status: 'checked_in'
        });
        
        if (result.success) {
          const reservations = result.data?.data || [];
          // For a more complete implementation, we'd need to fetch detail for each to get custom fields
          // For now, return the basic info
          return {
            success: true,
            currentGuests: reservations.length,
            message: "To see specific service requests (breakfast, cleaning), check the individual reservation details or view the Daily Reservations page.",
            reservations: reservations.slice(0, 10).map(r => ({
              id: r.reservationID,
              guestName: r.guestName,
              roomType: r.roomTypeName,
              checkOut: r.endDate
            }))
          };
        }
        return { success: false, error: result.error };
      }
      
      case 'get_room_pricing': {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        
        const [roomTypesResult, ratePlansResult] = await Promise.all([
          cloudbedsRequest('GET', '/getRoomTypes', null, { 
            property_id: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975' 
          }),
          cloudbedsRequest('GET', '/getRatePlans', null, {
            propertyID: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
            startDate: args.start_date || now.toISOString().split('T')[0],
            endDate: args.end_date || tomorrow.toISOString().split('T')[0]
          })
        ]);
        
        const roomTypes = roomTypesResult.data?.data || [];
        const ratePlans = ratePlansResult.data?.data || [];
        
        // Build pricing map
        const pricing = {};
        ratePlans.forEach(rp => {
          if (!rp.isDerived && (!pricing[rp.roomTypeID] || rp.ratePlanName?.toLowerCase().includes('standard'))) {
            pricing[rp.roomTypeID] = {
              name: rp.roomTypeName,
              price: parseFloat(rp.roomRate || 0),
              available: rp.roomsAvailable || 0
            };
          }
        });
        
        const sortedRooms = Object.values(pricing)
          .filter(r => r.price > 0)
          .sort((a, b) => a.price - b.price);
        
        return {
          success: true,
          rooms: sortedRooms.map((room, idx) => ({
            ...room,
            priceFormatted: `$${room.price.toFixed(2)}`,
            upgradeOptions: sortedRooms.slice(idx + 1).map(u => ({
              name: u.name,
              price: `$${u.price.toFixed(2)}`,
              difference: `+$${(u.price - room.price).toFixed(2)}`
            }))
          }))
        };
      }
      
      case 'get_dashboard_stats': {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Fetch multiple stats in parallel
        const [arrivalsResult, checkedInResult] = await Promise.all([
          cloudbedsRequest('GET', '/getReservations', null, {
            property_id: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
            checkin_from: today,
            checkin_to: today
          }),
          cloudbedsRequest('GET', '/getReservations', null, {
            property_id: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
            status: 'checked_in'
          })
        ]);
        
        const arrivals = arrivalsResult.success ? (arrivalsResult.data?.data || []) : [];
        const checkedIn = checkedInResult.success ? (checkedInResult.data?.data || []) : [];
        
        return {
          success: true,
          date: today,
          stats: {
            todayArrivals: arrivals.length,
            currentlyCheckedIn: checkedIn.length,
            arrivingGuests: arrivals.slice(0, 5).map(r => ({
              name: r.guestName,
              roomType: r.roomTypeName,
              checkIn: r.startDate
            }))
          }
        };
      }
      
      case 'get_revenue_report': {
        const excludeCanceled = args.exclude_canceled !== false;
        const excludeTaxes = args.exclude_taxes !== false;
        
        // First try to use cached data (which has enriched 'total' fields)
        let allReservations = getCachedReservations();
        console.log(`[Revenue] Using cached data: ${allReservations.length} reservations`);
        
        // If cache is empty, fetch from API with pagination
        if (allReservations.length === 0) {
          console.log(`[Revenue] Cache empty, fetching from API...`);
          let page = 1;
          let hasMore = true;
          const pageSize = 100;
          
          while (hasMore) {
            const result = await cloudbedsRequest('GET', '/getReservations', null, {
              property_id: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
              page,
              pageSize
            });
            
            if (!result.success) {
              console.error(`[Revenue] Error fetching page ${page}:`, result.error);
              break;
            }
            
            const pageData = result.data?.data || [];
            allReservations = allReservations.concat(pageData);
            
            const total = result.data?.total || 0;
            console.log(`[Revenue] Page ${page}: got ${pageData.length} items (${allReservations.length}/${total} total)`);
            
            hasMore = allReservations.length < total && pageData.length === pageSize;
            page++;
            
            if (page > 30) break; // Safety limit
          }
        }
        
        // Filter by date range (check-in date)
        const startDate = new Date(args.start_date);
        const endDate = new Date(args.end_date);
        endDate.setHours(23, 59, 59, 999); // Include the end date
        
        const reservations = allReservations.filter(r => {
          const checkIn = new Date(r.startDate);
          return checkIn >= startDate && checkIn <= endDate;
        });
        
        console.log(`[Revenue] Found ${reservations.length} reservations in date range ${args.start_date} to ${args.end_date}`);
        
        // Enrich reservations that are missing 'total' field
        // The list endpoint doesn't return totals, so we need to fetch details for revenue calculation
        const validReservations = reservations.filter(r => r.status !== 'canceled');
        const needsEnrichment = validReservations.filter(r => !r.total && !r.grandTotal);
        
        if (needsEnrichment.length > 0) {
          console.log(`[Revenue] Enriching ${needsEnrichment.length} reservations with pricing data...`);
          
          // Enrich in batches to avoid rate limits
          const batchSize = 5;
          for (let i = 0; i < needsEnrichment.length; i += batchSize) {
            const batch = needsEnrichment.slice(i, i + batchSize);
            await Promise.all(batch.map(async (r) => {
              try {
                const detailResult = await cloudbedsRequest('GET', '/getReservation', null, {
                  reservationID: r.reservationID,
                  propertyID: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975'
                });
                
                if (detailResult.success) {
                  const detail = detailResult.data?.data || detailResult.data || {};
                  // Update the reservation object (reference)
                  r.total = detail.total;
                  r.grandTotal = detail.grandTotal;
                  r.tax = detail.tax || detail.totalTax;
                  
                  // Calculate pure room revenue (sum of all assigned rooms)
                  if (detail.assigned && Array.isArray(detail.assigned)) {
                    r.roomRevenue = detail.assigned.reduce((sum, room) => sum + parseFloat(room.roomTotal || 0), 0);
                  }
                }
              } catch (err) {
                console.error(`[Revenue] Failed to enrich reservation ${r.reservationID}:`, err.message);
              }
            }));
            
            // Small delay between batches
            if (i + batchSize < needsEnrichment.length) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          console.log(`[Revenue] Enrichment complete`);
        }

        let totalRevenue = 0;
        let estimatedTaxes = 0;
        let totalBookings = reservations.length;
        let canceledCount = 0;
        let canceledPotentialRevenue = 0; // This is NOT actual revenue - just tracking for info
        
        const revenueByRoomType = {};
        const revenueByStatus = {
          confirmed: 0,
          checked_in: 0,
          checked_out: 0,
          no_show: 0
        };
        
        // Tax rate estimate (typically around 10-15% for hotels)
        const TAX_RATE = 0.12;
        
        let reservationsWithTotal = 0;
        let reservationsWithoutTotal = 0;
        
        const detailedBookings = [];
        
        reservations.forEach(r => {
          if (r.status === 'canceled') {
            canceledCount++;
            // Cancelled reservations don't generate actual revenue - skip them entirely
            return;
          }
          
          // Only use the 'total' field - don't fall back to 'balance' as it's not the same
          // 'balance' is the unpaid amount, not the booking total
          const reservationTotal = parseFloat(r.total || r.grandTotal || 0);
          
          if (reservationTotal > 0) {
            reservationsWithTotal++;
            // If no separate tax field, estimate taxes from total
            const tax = parseFloat(r.tax || r.totalTax || 0) || (reservationTotal * TAX_RATE);
            // Revenue excluding tax
            const revenueExTax = excludeTaxes ? (reservationTotal - tax) : reservationTotal;
            
            totalRevenue += revenueExTax;
            estimatedTaxes += tax;
            
            // Collect detailed booking info for the report
            detailedBookings.push({
              id: r.reservationID,
              guestName: r.guestName || (r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : 'Unknown Guest'),
              roomType: r.roomTypeName || 'Unknown',
              checkIn: r.startDate,
              revenue: `$${revenueExTax.toFixed(2)}`
            });
            
            // Track by room type
            const roomType = r.roomTypeName || 'Unknown';
            if (!revenueByRoomType[roomType]) {
              revenueByRoomType[roomType] = { count: 0, revenue: 0 };
            }
            revenueByRoomType[roomType].count++;
            revenueByRoomType[roomType].revenue += revenueExTax;
            
            // Track by status
            if (revenueByStatus[r.status] !== undefined) {
              revenueByStatus[r.status] += revenueExTax;
            }
          } else {
            reservationsWithoutTotal++;
          }
        });
        
        const nonCanceledCount = totalBookings - canceledCount;
        const dataCompleteness = reservationsWithTotal > 0 
          ? Math.round((reservationsWithTotal / nonCanceledCount) * 100)
          : 0;
        
        return {
          success: true,
          report: {
            dateRange: { start: args.start_date, end: args.end_date },
            excludedTaxes: excludeTaxes,
            taxNote: excludeTaxes ? 'Taxes estimated at 12% and excluded from revenue' : 'Taxes included in revenue',
            summary: {
              totalBookings: nonCanceledCount,
              bookingsWithRevenueData: reservationsWithTotal,
              bookingsMissingRevenueData: reservationsWithoutTotal,
              canceledBookings: canceledCount,
              totalRevenue: `$${totalRevenue.toFixed(2)}`,
              estimatedTaxes: `$${estimatedTaxes.toFixed(2)}`,
              dataCompleteness: `${dataCompleteness}%`,
              dataNote: reservationsWithoutTotal > 0 
                ? `Revenue shown is from ${reservationsWithTotal} of ${nonCanceledCount} bookings (${reservationsWithoutTotal} bookings missing detailed pricing data)`
                : null,
              canceledInfo: canceledCount > 0 ? `${canceledCount} cancelled reservations excluded` : null
            },
            byRoomType: Object.entries(revenueByRoomType)
              .sort((a, b) => b[1].revenue - a[1].revenue)
              .map(([name, data]) => ({
                roomType: name,
                bookings: data.count,
                revenue: `$${data.revenue.toFixed(2)}`
              })),
            byStatus: Object.entries(revenueByStatus)
              .filter(([_, val]) => val > 0)
              .map(([status, revenue]) => ({
                status,
                revenue: `$${revenue.toFixed(2)}`
              })),
            bookings: detailedBookings.sort((a, b) => parseFloat(b.revenue.replace(/[^0-9.-]+/g,"")) - parseFloat(a.revenue.replace(/[^0-9.-]+/g,"")))
          }
        };
      }
      
      default:
        return { success: false, error: `Unknown function: ${functionName}` };
    }
  } catch (error) {
    console.error(`[Gemini] Function execution error:`, error);
    // Check for rate limiting
    if (error.message?.includes('rate limit') || error.rateLimited) {
      return { 
        success: false, 
        error: 'The Cloudbeds API is currently rate limited. Please wait a moment and try again.',
        rateLimited: true
      };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Build the system prompt with context
 */
function buildSystemPrompt(reservationContext = null) {
  const dbStatus = db ? 'Connected (Primary Data Source)' : 'Not Connected (Using API)';
  
  let prompt = `You are the AI concierge assistant for Hennessey Estate, a luxury boutique hotel.
You are powered by Cloudbeds Property Management System with a LOCAL SQLite DATABASE as your primary data source.

## Data Architecture
- **Primary Source**: Local SQLite database (synced hourly from Cloudbeds)
- **Secondary Source**: Live Cloudbeds API (for real-time availability and pricing)
- **Database Status**: ${dbStatus}

The database contains comprehensive historical and current data including:
- All reservations with full details (dates, pricing, custom fields)
- Guest information and marketing preferences
- Room assignments and daily rates
- Service requests (breakfast, daily cleaning)
- Financial data (totals, balances)

For historical queries, revenue reports, and guest lookups - USE DATABASE FUNCTIONS.
For real-time availability and pricing - USE API FUNCTIONS.

Your personality:
- Professional yet warm and welcoming
- Knowledgeable about hotel operations
- Proactive in suggesting solutions
- Precise with data and numbers

${CLOUDBEDS_API_KNOWLEDGE}

## Current Context
Property: Hennessey Estate
Property ID: ${process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975'}
Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Database: ${dbStatus}
`;

  if (reservationContext) {
    prompt += `
## Cached Reservation Data (Updated: ${reservationContext.lastUpdated})
Total Active Reservations: ${reservationContext.count || 0}
Recent Activity Summary: ${reservationContext.summary || 'Available on request'}
`;
  }

  prompt += `
## Guidelines
1. When asked about specific data, use the available functions to fetch real-time information
2. Always be accurate - if you're unsure, say so and offer to look up the information
3. Format responses clearly - use bullet points and clear sections when appropriate
4. For pricing questions, always check current rates as they may change
5. For reservation lookups, you can search by guest name, date, or reservation ID
6. Protect guest privacy - don't share full details unless specifically asked by staff
7. Be helpful with Cloudbeds API questions - you know the full API reference

## Response Style
- Keep responses concise but complete
- Use the Hennessey Estate voice - elegant and professional
- When showing data, format it nicely for readability
- Always confirm before suggesting changes to reservations
`;

  return prompt;
}

/**
 * Send message to Gemini with function calling support
 */
async function sendToGemini(messages, cloudbedsRequest, maxIterations = 5) {
  const systemPrompt = buildSystemPrompt(reservationCache.data);
  
  // Build conversation history for Gemini
  const contents = [];
  
  // Add conversation history
  for (const msg of messages) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }
  
  let currentContents = contents;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    iteration++;
    
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: currentContents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          tools: [{
            functionDeclarations: FUNCTION_DECLARATIONS
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 8192,  // Pro supports longer outputs
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const candidate = response.data.candidates?.[0];
      if (!candidate) {
        throw new Error('No response from Gemini');
      }
      
      const content = candidate.content;
      const parts = content?.parts || [];
      
      // Check for function calls
      const functionCalls = parts.filter(p => p.functionCall);
      
      if (functionCalls.length > 0) {
        // Execute function calls
        const functionResponses = [];
        
        for (const fc of functionCalls) {
          const funcName = fc.functionCall.name;
          const funcArgs = fc.functionCall.args || {};
          
          console.log(`[Gemini] Function call: ${funcName}`, funcArgs);
          
          const result = await executeFunctionCall(funcName, funcArgs, cloudbedsRequest);
          
          functionResponses.push({
            functionResponse: {
              name: funcName,
              response: result
            }
          });
        }
        
        // Add model response and function results to conversation
        currentContents = [
          ...currentContents,
          content,
          {
            role: 'user',
            parts: functionResponses
          }
        ];
        
        // Continue loop to get final response
        continue;
      }
      
      // No function calls - return text response
      const textPart = parts.find(p => p.text);
      if (textPart) {
        return {
          success: true,
          response: textPart.text,
          functionsCalled: iteration > 1
        };
      }
      
      return {
        success: false,
        error: 'No text response from Gemini'
      };
      
    } catch (error) {
      const errorData = error.response?.data;
      console.error('[Gemini] API Error:', errorData || error.message);
      
      // Provide more user-friendly error messages
      let userMessage = 'I encountered an issue processing your request.';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        userMessage = 'Unable to connect to the AI service. Please check your network connection.';
      } else if (error.response?.status === 429) {
        userMessage = 'The AI service is temporarily rate limited. Please try again in a moment.';
      } else if (error.response?.status === 400) {
        userMessage = 'There was an issue with the request format. Please try rephrasing your question.';
      } else if (errorData?.error?.message) {
        userMessage = `AI service error: ${errorData.error.message}`;
      }
      
      return {
        success: false,
        error: userMessage
      };
    }
  }
  
  return {
    success: false,
    error: 'The request took too long to process. Please try a simpler question.'
  };
}

/**
 * Refresh reservation cache
 */
async function refreshReservationCache(cloudbedsRequest) {
  console.log('[Gemini] Refreshing reservation cache...');
  
  try {
    const now = new Date();
    const result = await cloudbedsRequest('GET', '/getReservations', null, {
      property_id: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
      status: 'confirmed,checked_in'
    });
    
    if (result.success) {
      const reservations = result.data?.data || [];
      
      reservationCache = {
        data: {
          count: reservations.length,
          summary: `${reservations.filter(r => r.status === 'checked_in').length} guests checked in, ${reservations.filter(r => r.status === 'confirmed').length} upcoming`,
          lastUpdated: now.toISOString()
        },
        lastUpdated: now,
        refreshInterval: 24 * 60 * 60 * 1000
      };
      
      console.log('[Gemini] Cache refreshed:', reservationCache.data);
      return true;
    }
  } catch (error) {
    console.error('[Gemini] Cache refresh error:', error);
  }
  
  return false;
}

/**
 * Check if cache needs refresh
 */
function shouldRefreshCache() {
  if (!reservationCache.lastUpdated) return true;
  
  const now = new Date();
  const elapsed = now - reservationCache.lastUpdated;
  
  return elapsed > reservationCache.refreshInterval;
}

// Getter for cached reservations (set by index.js)
let getCachedReservations = () => [];

function setCachedReservationsGetter(getter) {
  getCachedReservations = getter;
}

module.exports = {
  sendToGemini,
  refreshReservationCache,
  shouldRefreshCache,
  setCachedReservationsGetter,
  getCachedReservations: () => getCachedReservations(),
  initWithDatabase,
  CLOUDBEDS_API_KNOWLEDGE,
  FUNCTION_DECLARATIONS
};

