/**
 * Revenue Service
 * Handles revenue reporting and data enrichment for the Revenue Audit tab.
 */

const TAX_RATE = 0.12; // Fallback tax rate if detailed breakdown is missing

/**
 * Generate a detailed revenue report for a date range
 * @param {string} startDateStr - Start date (YYYY-MM-DD)
 * @param {string} endDateStr - End date (YYYY-MM-DD)
 * @param {Object} options - Options { excludeCanceled }
 * @param {Object} context - { cloudbedsRequest, getCachedReservations }
 */
async function getRevenueReport(startDateStr, endDateStr, options = {}, context = {}) {
  const { cloudbedsRequest, getCachedReservations } = context;
  const excludeCanceled = options.excludeCanceled !== false;
  
  if (!cloudbedsRequest || !getCachedReservations) {
    throw new Error('Missing dependencies: cloudbedsRequest or getCachedReservations');
  }

  // 1. Get Base Data (Cache or API)
  let allReservations = getCachedReservations() || [];
  console.log(`[RevenueService] Using cached data: ${allReservations.length} reservations`);
  
  // Fallback: If cache is empty, fetch from API (using pagination)
  if (allReservations.length === 0) {
    console.log(`[RevenueService] Cache empty, fetching from API...`);
    let page = 1;
    let hasMore = true;
    const pageSize = 100;
    
    while (hasMore) {
      const result = await cloudbedsRequest('GET', '/getReservations', null, {
        property_id: process.env.CLOUDBEDS_PROPERTY_ID || '49705993547975',
        pageNumber: page, // Using correct parameter
        pageSize
      });
      
      if (!result.success) {
        console.error(`[RevenueService] Error fetching page ${page}:`, result.error);
        break;
      }
      
      const pageData = result.data?.data || [];
      allReservations = allReservations.concat(pageData);
      
      const total = result.data?.total || 0;
      hasMore = allReservations.length < total && pageData.length === pageSize;
      page++;
      
      if (page > 50) break; // Safety limit
    }
  }
  
  // 2. Filter by Date Range
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);
  
  const reservations = allReservations.filter(r => {
    const checkIn = new Date(r.startDate);
    return checkIn >= startDate && checkIn <= endDate;
  });
  
  console.log(`[RevenueService] Found ${reservations.length} reservations in date range ${startDateStr} to ${endDateStr}`);
  
  // 3. Enrich Data (Fetch details if missing roomRevenue or total)
  const validReservations = reservations.filter(r => r.status !== 'canceled');
  // Check if we need enrichment: missing roomRevenue OR missing totals
  const needsEnrichment = validReservations.filter(r => r.roomRevenue === undefined || (!r.total && !r.grandTotal));
  
  if (needsEnrichment.length > 0) {
    console.log(`[RevenueService] Enriching ${needsEnrichment.length} reservations...`);
    
    // Process in batches
    const batchSize = 8;
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
            
            // Update reference in cache/array
            r.total = detail.total;
            r.grandTotal = detail.grandTotal;
            r.tax = detail.tax || detail.totalTax;
            
            // Capture Room Revenue (Sum of assigned room totals)
            if (detail.assigned && Array.isArray(detail.assigned)) {
              r.roomRevenue = detail.assigned.reduce((sum, room) => sum + parseFloat(room.roomTotal || 0), 0);
            } else if (detail.subtotal) {
               // Fallback if assigned not detailed
               r.roomRevenue = parseFloat(detail.subtotal); 
            }
          }
        } catch (err) {
          console.error(`[RevenueService] Enrichment error ${r.reservationID}:`, err.message);
        }
      }));
      
      // Delay between batches
      if (i + batchSize < needsEnrichment.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    console.log(`[RevenueService] Enrichment complete`);
  }

  // 4. Calculate Totals and Build List
  let totalRevenue = 0;
  let totalRoomRevenue = 0;
  let totalTax = 0;
  let totalFees = 0;
  
  const bookings = [];

  reservations.forEach(r => {
    if (excludeCanceled && r.status === 'canceled') return;
    
    const grossTotal = parseFloat(r.total || r.grandTotal || 0);
    
    if (grossTotal > 0 || r.status === 'confirmed' || r.status === 'checked_in' || r.status === 'checked_out') {
      let roomRev = 0;
      let tax = 0;
      let fees = 0;

      if (r.roomRevenue !== undefined) {
        roomRev = parseFloat(r.roomRevenue);
        tax = parseFloat(r.tax || 0);
        
        // Fees = Gross - Room - Tax
        const calculatedFees = grossTotal - roomRev - tax;
        fees = Math.max(0, calculatedFees); // Avoid negative fees due to precision
      } else {
        // Fallback Estimation (Total - 12%)
        roomRev = grossTotal / (1 + TAX_RATE);
        tax = grossTotal - roomRev;
        fees = 0;
      }

      // Only count towards totals if not canceled
      if (r.status !== 'canceled') {
        totalRevenue += grossTotal;
        totalRoomRevenue += roomRev;
        totalTax += tax;
        totalFees += fees;
      }

      bookings.push({
        id: r.reservationID,
        guestName: r.guestName || (r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : 'Unknown Guest'),
        roomType: r.roomTypeName || 'Unknown',
        status: r.status,
        checkIn: r.startDate,
        checkOut: r.endDate,
        roomRevenue: roomRev,
        tax: tax,
        fees: fees,
        total: grossTotal
      });
    }
  });

  return {
    summary: {
      bookingsCount: bookings.filter(b => b.status !== 'canceled').length,
      totalRevenue,
      totalRoomRevenue,
      totalTax,
      totalFees
    },
    bookings: bookings.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn)) // Sort by date
  };
}

module.exports = { getRevenueReport };
