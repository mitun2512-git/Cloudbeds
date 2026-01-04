/**
 * BUYOUT ALLOCATION ENGINE
 * =========================
 * Intelligent algorithm to determine which dates should be blocked
 * for full property buyout only vs individual room bookings.
 * 
 * Strategy:
 * - High-demand events/holidays → prioritize full buyout
 * - Compare potential revenue: individual rooms vs full buyout
 * - Factor in lead time, occupancy, and event type
 * - Dynamic thresholds based on booking pace
 */

const napaCalendar = require('./napa-events-calendar');

// ============================================================================
// HELPER: Parse date string without timezone issues
// ============================================================================

/**
 * Parse a date string (YYYY-MM-DD) without timezone conversion issues
 */
function parseDateString(dateInput) {
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  }
  return new Date(dateInput);
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROPERTY_CONFIG = {
  totalRooms: 6,
  
  // Base rates for revenue calculations
  // Pricing model: Base ($299) + 5% per tier
  // Patio Retreat Suite & Pool Suite are highest tier (Tier 4)
  roomRates: {
    '82833129423048': 299,   // Classic (Tier 1: base)
    '82835472601219': 314,   // Estate Room (Tier 2: +5%)
    '83444066242706': 329,   // Estate Junior Suite (Tier 3: +10%)
    '83444040888474': 344,   // Patio Retreat Suite (Tier 4: +15%) - Premium
    '89146217537706': 344,   // Pool Suite with Bathtub (Tier 4: +15%) - Premium
  },
  
  // Full buyout pricing
  buyout: {
    baseRate: 5000,           // Base nightly rate for full property
    weekendPremium: 1.20,     // 20% premium on weekends
    peakMultiplier: 1.50,     // 50% premium during peak events
    minimumNights: 2,         // Minimum nights for buyout
  },
  
  // Average individual room rate (weighted by room mix)
  avgRoomRate: 326,  // (299 + 314 + 329 + 344 + 344) / 5 = 326
};

// ============================================================================
// BUYOUT PRIORITY SCORING
// ============================================================================

/**
 * Events/dates that should STRONGLY favor full buyout
 */
const BUYOUT_PRIORITY_EVENTS = {
  // TIER 1: Block for buyout only (multiplier >= 1.8)
  tier1_buyoutOnly: [
    'bottlerock_napa_valley',
    'newYearsEve',
    'new_year_s_eve_celebrations',
  ],
  
  // TIER 2: Strongly prefer buyout (multiplier 1.5-1.8)
  tier2_preferBuyout: [
    'auction_napa_valley',
    'christmas_week',
    'thanksgiving_week',
    'july4th',
    'fourth_of_july_weekend',
    'valentinesDay',
    'napa_valley_film_festival',
  ],
  
  // TIER 3: Consider buyout based on lead time (multiplier 1.3-1.5)
  tier3_considerBuyout: [
    'memorialDay',
    'laborDay',
    'harvest_season_kickoff',
    'peak_harvest___grape_crush',
    'mothersDay',
    'napa_valley_marathon',
  ],
};

/**
 * Calculate buyout priority score for a date
 * Score 0-100 where:
 *   0-30: Individual rooms preferred
 *   31-60: Flexible - accept either
 *   61-80: Prefer buyout
 *   81-100: Buyout only
 */
function calculateBuyoutPriorityScore(date, options = {}) {
  const {
    currentOccupancy = 0,
    daysUntilDate = 365,
    existingBuyoutInquiries = 0,
    historicalBuyoutRate = 0.15, // 15% of peak dates historically had buyout interest
  } = options;
  
  let score = 0;
  // Parse date correctly to avoid timezone issues
  const d = parseDateString(date);
  const year = d.getFullYear();
  const dayOfWeek = d.getDay();
  
  // 1. Check for special events (up to 50 points)
  const eventInfo = napaCalendar.getSpecialDateInfo(d, year);
  
  if (eventInfo) {
    // Tier 1 events: automatic high score
    if (BUYOUT_PRIORITY_EVENTS.tier1_buyoutOnly.some(e => 
        eventInfo.key?.toLowerCase().includes(e.toLowerCase()) ||
        eventInfo.name?.toLowerCase().includes(e.toLowerCase().replace(/_/g, ' ')))) {
      score += 50;
    }
    // Tier 2 events: high score
    else if (BUYOUT_PRIORITY_EVENTS.tier2_preferBuyout.some(e => 
        eventInfo.key?.toLowerCase().includes(e.toLowerCase()) ||
        eventInfo.name?.toLowerCase().includes(e.toLowerCase().replace(/_/g, ' ')))) {
      score += 40;
    }
    // Tier 3 events: moderate score
    else if (BUYOUT_PRIORITY_EVENTS.tier3_considerBuyout.some(e => 
        eventInfo.key?.toLowerCase().includes(e.toLowerCase()) ||
        eventInfo.name?.toLowerCase().includes(e.toLowerCase().replace(/_/g, ' ')))) {
      score += 25;
    }
    // Other events with high multipliers
    else if (eventInfo.multiplier >= 1.5) {
      score += 35;
    } else if (eventInfo.multiplier >= 1.3) {
      score += 20;
    } else if (eventInfo.multiplier >= 1.2) {
      score += 10;
    }
  }
  
  // 2. Weekend premium (up to 15 points)
  if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
    score += 15;
  } else if (dayOfWeek === 0) { // Sunday
    score += 8;
  }
  
  // 3. Lead time factor (up to 20 points)
  // Far out = more likely to get buyout inquiry
  // Close in with no bookings = individual rooms better
  if (daysUntilDate > 180 && currentOccupancy === 0) {
    score += 20; // Far out, hold for buyout
  } else if (daysUntilDate > 90 && currentOccupancy < 30) {
    score += 15;
  } else if (daysUntilDate > 60 && currentOccupancy < 50) {
    score += 10;
  } else if (daysUntilDate < 30 && currentOccupancy < 30) {
    score -= 15; // Close in with low occupancy, need individual bookings
  } else if (daysUntilDate < 14 && currentOccupancy < 50) {
    score -= 25; // Very close, take any bookings
  }
  
  // 4. Existing occupancy factor (up to 15 points)
  if (currentOccupancy === 0) {
    score += 15; // No bookings yet, can still offer buyout
  } else if (currentOccupancy <= 17) { // 1 room
    score += 10;
  } else if (currentOccupancy <= 33) { // 2 rooms
    score += 5;
  } else if (currentOccupancy > 50) {
    score -= 30; // Already more than half booked, can't do buyout
  }
  
  // 5. Buyout inquiry factor (up to 10 points)
  if (existingBuyoutInquiries > 0) {
    score += Math.min(existingBuyoutInquiries * 5, 10);
  }
  
  // 6. Season factor (up to 10 points)
  const month = d.getMonth() + 1;
  if ([9, 10].includes(month)) { // Harvest season
    score += 10;
  } else if ([6, 7, 8].includes(month)) { // Summer
    score += 7;
  } else if ([11, 12].includes(month)) { // Holiday season
    score += 5;
  }
  
  // Clamp score to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Determine the booking strategy for a date
 */
function getBuyoutStrategy(score) {
  if (score >= 81) {
    return {
      strategy: 'BUYOUT_ONLY',
      description: 'Block individual rooms - only accept full property buyout',
      blockIndividualRooms: true,
      showBuyoutPromo: true,
      minStay: 2,
    };
  } else if (score >= 61) {
    return {
      strategy: 'PREFER_BUYOUT',
      description: 'Prioritize buyout inquiries, accept individual with restrictions',
      blockIndividualRooms: false,
      showBuyoutPromo: true,
      minStay: 2,
      restrictions: ['Minimum 2-night stay', 'Buyout inquiries given priority response'],
    };
  } else if (score >= 31) {
    return {
      strategy: 'FLEXIBLE',
      description: 'Accept both individual rooms and buyout inquiries',
      blockIndividualRooms: false,
      showBuyoutPromo: true,
      minStay: 1,
    };
  } else {
    return {
      strategy: 'INDIVIDUAL_PREFERRED',
      description: 'Focus on filling individual rooms',
      blockIndividualRooms: false,
      showBuyoutPromo: false,
      minStay: 1,
    };
  }
}

// ============================================================================
// REVENUE COMPARISON
// ============================================================================

/**
 * Calculate potential revenue from individual room bookings
 */
function calculateIndividualRoomRevenue(date, nightlyMultiplier = 1.0) {
  const baseRevenue = Object.values(PROPERTY_CONFIG.roomRates).reduce((sum, rate) => sum + rate, 0);
  return Math.round(baseRevenue * nightlyMultiplier);
}

/**
 * Calculate potential revenue from full property buyout
 */
function calculateBuyoutRevenue(date, nightlyMultiplier = 1.0) {
  const d = parseDateString(date);
  const dayOfWeek = d.getDay();
  let rate = PROPERTY_CONFIG.buyout.baseRate;
  
  // Apply weekend premium
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    rate *= PROPERTY_CONFIG.buyout.weekendPremium;
  }
  
  // Apply peak multiplier for high-demand dates
  if (nightlyMultiplier >= 1.5) {
    rate *= PROPERTY_CONFIG.buyout.peakMultiplier;
  } else if (nightlyMultiplier >= 1.3) {
    rate *= 1.25;
  }
  
  return Math.round(rate);
}

/**
 * Compare revenue potential
 */
function compareRevenuePotential(date, options = {}) {
  const { multiplier = 1.0, occupancyProbability = 0.7 } = options;
  
  const individualRevenue = calculateIndividualRoomRevenue(date, multiplier);
  const buyoutRevenue = calculateBuyoutRevenue(date, multiplier);
  
  // Adjust individual revenue by probability of filling all rooms
  const expectedIndividualRevenue = Math.round(individualRevenue * occupancyProbability);
  
  return {
    individualRevenue: {
      potential: individualRevenue,
      expected: expectedIndividualRevenue,
      perRoom: Math.round(individualRevenue / PROPERTY_CONFIG.totalRooms),
    },
    buyoutRevenue: {
      total: buyoutRevenue,
      perRoom: Math.round(buyoutRevenue / PROPERTY_CONFIG.totalRooms),
    },
    comparison: {
      buyoutPremium: buyoutRevenue - individualRevenue,
      buyoutPremiumPercent: ((buyoutRevenue / individualRevenue - 1) * 100).toFixed(1) + '%',
      recommendation: buyoutRevenue > expectedIndividualRevenue ? 'PREFER_BUYOUT' : 'PREFER_INDIVIDUAL',
      breakEvenOccupancy: Math.round((buyoutRevenue / individualRevenue) * 100) + '%',
    },
  };
}

// ============================================================================
// MAIN ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze a single date for buyout allocation
 */
function analyzeDateForBuyout(date, options = {}) {
  const d = parseDateString(date);
  const year = d.getFullYear();
  // Format date string manually to avoid timezone issues
  const dateStr = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  // Get event info - pass the date string to use the fixed formatDate function
  const eventInfo = napaCalendar.getSpecialDateInfo(dateStr, year);
  const multiplier = eventInfo?.multiplier || 1.0;
  
  // Calculate priority score
  const score = calculateBuyoutPriorityScore(date, options);
  
  // Get strategy recommendation
  const strategy = getBuyoutStrategy(score);
  
  // Compare revenue potential
  const revenueComparison = compareRevenuePotential(date, { multiplier });
  
  return {
    date: dateStr,
    dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
    event: eventInfo ? {
      name: eventInfo.name,
      multiplier: eventInfo.multiplier,
      type: eventInfo.type,
      category: eventInfo.category,
    } : null,
    buyoutAnalysis: {
      priorityScore: score,
      strategy: strategy.strategy,
      description: strategy.description,
      blockIndividualRooms: strategy.blockIndividualRooms,
      minStay: strategy.minStay,
      showBuyoutPromo: strategy.showBuyoutPromo,
    },
    revenue: revenueComparison,
  };
}

/**
 * Analyze a date range for buyout allocation
 */
function analyzeDateRangeForBuyout(startDate, endDate, occupancyData = {}) {
  const results = [];
  const buyoutOnlyDates = [];
  const preferBuyoutDates = [];
  
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  let current = new Date(start);
  
  while (current <= end) {
    // Format date string manually to avoid timezone issues
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    const occupancy = occupancyData[dateStr] || 0;
    const daysUntil = Math.ceil((current - new Date()) / (1000 * 60 * 60 * 24));
    
    const analysis = analyzeDateForBuyout(dateStr, {
      currentOccupancy: occupancy,
      daysUntilDate: daysUntil,
    });
    
    results.push(analysis);
    
    if (analysis.buyoutAnalysis.strategy === 'BUYOUT_ONLY') {
      buyoutOnlyDates.push(dateStr);
    } else if (analysis.buyoutAnalysis.strategy === 'PREFER_BUYOUT') {
      preferBuyoutDates.push(dateStr);
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return {
    dateRange: { start: startDate, end: endDate },
    totalDays: results.length,
    summary: {
      buyoutOnlyDays: buyoutOnlyDates.length,
      preferBuyoutDays: preferBuyoutDates.length,
      flexibleDays: results.filter(r => r.buyoutAnalysis.strategy === 'FLEXIBLE').length,
      individualPreferredDays: results.filter(r => r.buyoutAnalysis.strategy === 'INDIVIDUAL_PREFERRED').length,
    },
    buyoutOnlyDates,
    preferBuyoutDates,
    dailyAnalysis: results,
  };
}

/**
 * Get dates to block for buyout only for a specific month
 */
function getBuyoutBlockedDates(year, month, occupancyData = {}) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const analysis = analyzeDateRangeForBuyout(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
    occupancyData
  );
  
  // Group consecutive dates
  const buyoutPeriods = groupConsecutiveDates(analysis.buyoutOnlyDates);
  const preferBuyoutPeriods = groupConsecutiveDates(analysis.preferBuyoutDates);
  
  return {
    year,
    month,
    monthName: startDate.toLocaleDateString('en-US', { month: 'long' }),
    blockedForBuyout: {
      dates: analysis.buyoutOnlyDates,
      periods: buyoutPeriods,
      count: analysis.buyoutOnlyDates.length,
    },
    preferBuyout: {
      dates: analysis.preferBuyoutDates,
      periods: preferBuyoutPeriods,
      count: analysis.preferBuyoutDates.length,
    },
    summary: analysis.summary,
  };
}

/**
 * Get annual buyout calendar
 */
function getAnnualBuyoutCalendar(year, occupancyData = {}) {
  const months = [];
  const allBuyoutDates = [];
  const allPreferBuyoutDates = [];
  
  for (let month = 1; month <= 12; month++) {
    const monthData = getBuyoutBlockedDates(year, month, occupancyData);
    months.push(monthData);
    allBuyoutDates.push(...monthData.blockedForBuyout.dates);
    allPreferBuyoutDates.push(...monthData.preferBuyout.dates);
  }
  
  // Identify key buyout periods
  const keyPeriods = identifyKeyBuyoutPeriods(year);
  
  return {
    year,
    totalBuyoutOnlyDays: allBuyoutDates.length,
    totalPreferBuyoutDays: allPreferBuyoutDates.length,
    buyoutOnlyDates: allBuyoutDates,
    preferBuyoutDates: allPreferBuyoutDates,
    keyBuyoutPeriods: keyPeriods,
    monthlyBreakdown: months,
    revenueImpact: calculateAnnualRevenueImpact(allBuyoutDates, allPreferBuyoutDates),
  };
}

/**
 * Identify key buyout periods (consecutive high-value dates)
 */
function identifyKeyBuyoutPeriods(year) {
  const periods = [];
  
  // BottleRock Weekend
  const memorialDay = getLastMondayOfMay(year);
  const bottleRockStart = new Date(memorialDay);
  bottleRockStart.setDate(bottleRockStart.getDate() - 2);
  periods.push({
    name: 'BottleRock Napa Valley',
    start: bottleRockStart.toISOString().split('T')[0],
    end: memorialDay.toISOString().split('T')[0],
    nights: 3,
    strategy: 'BUYOUT_ONLY',
    estimatedBuyoutRevenue: 5000 * 1.5 * 3, // Peak pricing * 3 nights
    reason: 'Highest demand event - hotels sell out months in advance',
  });
  
  // New Year's Eve
  periods.push({
    name: "New Year's Eve Weekend",
    start: `${year}-12-30`,
    end: `${year + 1}-01-01`,
    nights: 3,
    strategy: 'BUYOUT_ONLY',
    estimatedBuyoutRevenue: 5000 * 1.5 * 3,
    reason: 'Premium celebration dates with high group demand',
  });
  
  // Thanksgiving Week
  const thanksgiving = getNthThursdayOfNovember(year, 4);
  const thanksgivingStart = new Date(thanksgiving);
  thanksgivingStart.setDate(thanksgivingStart.getDate() - 1); // Wednesday
  const thanksgivingEnd = new Date(thanksgiving);
  thanksgivingEnd.setDate(thanksgivingEnd.getDate() + 2); // Saturday
  periods.push({
    name: 'Thanksgiving Week',
    start: thanksgivingStart.toISOString().split('T')[0],
    end: thanksgivingEnd.toISOString().split('T')[0],
    nights: 4,
    strategy: 'PREFER_BUYOUT',
    estimatedBuyoutRevenue: 5000 * 1.3 * 4,
    reason: 'Family gathering period - high demand for full property',
  });
  
  // Harvest Season Peak (first 2 weekends of October)
  periods.push({
    name: 'Harvest Season Peak - Weekend 1',
    start: `${year}-10-02`,
    end: `${year}-10-04`,
    nights: 2,
    strategy: 'PREFER_BUYOUT',
    estimatedBuyoutRevenue: 5000 * 1.4 * 2,
    reason: "Napa's peak wine tourism season",
  });
  
  // Valentine's Day Weekend
  periods.push({
    name: "Valentine's Day Weekend",
    start: `${year}-02-13`,
    end: `${year}-02-15`,
    nights: 2,
    strategy: 'PREFER_BUYOUT',
    estimatedBuyoutRevenue: 5000 * 1.3 * 2,
    reason: 'Romantic getaway demand - couples often book multiple rooms for groups',
  });
  
  return periods;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function groupConsecutiveDates(dates) {
  if (dates.length === 0) return [];
  
  const sorted = dates.sort();
  const periods = [];
  let periodStart = sorted[0];
  let periodEnd = sorted[0];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i]);
    const previous = new Date(sorted[i - 1]);
    const diffDays = (current - previous) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      periodEnd = sorted[i];
    } else {
      periods.push({ start: periodStart, end: periodEnd, nights: daysBetween(periodStart, periodEnd) + 1 });
      periodStart = sorted[i];
      periodEnd = sorted[i];
    }
  }
  periods.push({ start: periodStart, end: periodEnd, nights: daysBetween(periodStart, periodEnd) + 1 });
  
  return periods;
}

function daysBetween(date1, date2) {
  return Math.ceil((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));
}

function getLastMondayOfMay(year) {
  const lastDay = new Date(year, 5, 0); // Last day of May
  const dayOfWeek = lastDay.getDay();
  const daysToMonday = (dayOfWeek + 6) % 7;
  lastDay.setDate(lastDay.getDate() - daysToMonday);
  return lastDay;
}

function getNthThursdayOfNovember(year, n) {
  const firstDay = new Date(year, 10, 1);
  let dayOffset = 4 - firstDay.getDay();
  if (dayOffset < 0) dayOffset += 7;
  return new Date(year, 10, 1 + dayOffset + (n - 1) * 7);
}

function calculateAnnualRevenueImpact(buyoutDates, preferBuyoutDates) {
  // Estimate revenue impact of buyout strategy
  const avgBuyoutRate = 5500; // Average buyout rate with premiums
  const avgIndividualFill = 0.65; // 65% occupancy on non-buyout days
  const avgRoomRevenue = PROPERTY_CONFIG.avgRoomRate * PROPERTY_CONFIG.totalRooms;
  
  const buyoutRevenue = buyoutDates.length * avgBuyoutRate;
  const alternativeRevenue = buyoutDates.length * avgRoomRevenue * avgIndividualFill;
  
  return {
    estimatedBuyoutRevenue: buyoutRevenue,
    alternativeIndividualRevenue: Math.round(alternativeRevenue),
    potentialUplift: buyoutRevenue - Math.round(alternativeRevenue),
    upliftPercent: (((buyoutRevenue / alternativeRevenue) - 1) * 100).toFixed(1) + '%',
    assumptions: {
      avgBuyoutRate,
      avgIndividualFillRate: avgIndividualFill,
      avgRoomRevenue,
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  analyzeDateForBuyout,
  analyzeDateRangeForBuyout,
  getBuyoutBlockedDates,
  getAnnualBuyoutCalendar,
  calculateBuyoutPriorityScore,
  getBuyoutStrategy,
  compareRevenuePotential,
  identifyKeyBuyoutPeriods,
  BUYOUT_PRIORITY_EVENTS,
  PROPERTY_CONFIG,
};

