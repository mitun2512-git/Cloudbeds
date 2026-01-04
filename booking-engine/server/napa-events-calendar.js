/**
 * NAPA VALLEY EVENTS & HOLIDAYS CALENDAR
 * =======================================
 * Comprehensive calendar of events that drive hotel demand in Napa Valley.
 * Includes dynamic holiday calculation and annual event scheduling.
 * 
 * Sources:
 * - Visit Napa Valley official calendar
 * - Napa Valley Vintners events
 * - Local festival schedules
 * - US Federal holidays
 */

// ============================================================================
// DYNAMIC HOLIDAY CALCULATOR
// ============================================================================

/**
 * Calculate the date of US holidays that fall on variable dates
 */
function calculateHolidays(year) {
  const holidays = {};
  
  // New Year's Day - January 1
  holidays.newYearsDay = new Date(year, 0, 1);
  
  // New Year's Eve - December 31
  holidays.newYearsEve = new Date(year, 11, 31);
  
  // Martin Luther King Jr. Day - 3rd Monday of January
  holidays.mlkDay = getNthWeekdayOfMonth(year, 0, 1, 3); // Month 0 = Jan, Day 1 = Monday, 3rd occurrence
  
  // Presidents Day - 3rd Monday of February
  holidays.presidentsDay = getNthWeekdayOfMonth(year, 1, 1, 3);
  
  // Valentine's Day - February 14
  holidays.valentinesDay = new Date(year, 1, 14);
  
  // St. Patrick's Day - March 17
  holidays.stPatricksDay = new Date(year, 2, 17);
  
  // Easter Sunday - Complex calculation
  holidays.easter = calculateEaster(year);
  
  // Mother's Day - 2nd Sunday of May
  holidays.mothersDay = getNthWeekdayOfMonth(year, 4, 0, 2);
  
  // Memorial Day - Last Monday of May
  holidays.memorialDay = getLastWeekdayOfMonth(year, 4, 1);
  
  // Father's Day - 3rd Sunday of June
  holidays.fathersDay = getNthWeekdayOfMonth(year, 5, 0, 3);
  
  // Independence Day - July 4
  holidays.july4th = new Date(year, 6, 4);
  
  // Labor Day - 1st Monday of September
  holidays.laborDay = getNthWeekdayOfMonth(year, 8, 1, 1);
  
  // Columbus Day - 2nd Monday of October
  holidays.columbusDay = getNthWeekdayOfMonth(year, 9, 1, 2);
  
  // Halloween - October 31
  holidays.halloween = new Date(year, 9, 31);
  
  // Veterans Day - November 11
  holidays.veteransDay = new Date(year, 10, 11);
  
  // Thanksgiving - 4th Thursday of November
  holidays.thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4);
  
  // Black Friday - Day after Thanksgiving
  holidays.blackFriday = new Date(holidays.thanksgiving);
  holidays.blackFriday.setDate(holidays.blackFriday.getDate() + 1);
  
  // Christmas Eve - December 24
  holidays.christmasEve = new Date(year, 11, 24);
  
  // Christmas Day - December 25
  holidays.christmasDay = new Date(year, 11, 25);
  
  return holidays;
}

/**
 * Get nth weekday of a month (e.g., 3rd Monday)
 * @param {number} year 
 * @param {number} month - 0-indexed (0 = January)
 * @param {number} weekday - 0 = Sunday, 1 = Monday, etc.
 * @param {number} n - Which occurrence (1st, 2nd, 3rd, 4th)
 */
function getNthWeekdayOfMonth(year, month, weekday, n) {
  const firstDay = new Date(year, month, 1);
  let dayOffset = weekday - firstDay.getDay();
  if (dayOffset < 0) dayOffset += 7;
  
  const nthDay = 1 + dayOffset + (n - 1) * 7;
  return new Date(year, month, nthDay);
}

/**
 * Get last weekday of a month (e.g., last Monday of May)
 */
function getLastWeekdayOfMonth(year, month, weekday) {
  const lastDay = new Date(year, month + 1, 0); // Last day of month
  let dayOffset = lastDay.getDay() - weekday;
  if (dayOffset < 0) dayOffset += 7;
  
  return new Date(year, month, lastDay.getDate() - dayOffset);
}

/**
 * Calculate Easter Sunday using the Anonymous Gregorian algorithm
 */
function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month, day);
}

// ============================================================================
// NAPA VALLEY ANNUAL EVENTS
// ============================================================================

/**
 * Get Napa Valley events for a specific year
 * These dates are approximate and should be verified annually
 */
function getNapaEvents(year) {
  const events = [];
  
  // ========== WINTER EVENTS (Jan-Mar) ==========
  
  // Napa Valley Restaurant Week - Late January
  events.push({
    name: 'Napa Valley Restaurant Week',
    dates: getDateRange(year, 0, 20, 7), // ~Jan 20-27
    multiplier: 1.15,
    minStay: 1,
    category: 'culinary'
  });
  
  // Mustard Festival - February through March
  events.push({
    name: 'Napa Valley Mustard Festival',
    dates: getDateRange(year, 1, 1, 45), // Feb-Mar (mustard bloom season)
    multiplier: 1.20,
    minStay: 1,
    category: 'festival'
  });
  
  // Napa Valley Marathon - First Sunday of March
  const marathonDate = getNthWeekdayOfMonth(year, 2, 0, 1);
  events.push({
    name: 'Napa Valley Marathon',
    dates: getDateRange(year, 2, marathonDate.getDate() - 1, 3), // Fri-Sun
    multiplier: 1.45,
    minStay: 2,
    category: 'sports'
  });
  
  // Flavor! Napa Valley - Late March
  events.push({
    name: 'Flavor! Napa Valley',
    dates: getDateRange(year, 2, 20, 5),
    multiplier: 1.30,
    minStay: 2,
    category: 'culinary'
  });
  
  // ========== SPRING EVENTS (Apr-May) ==========
  
  // Auction Napa Valley Barrel Tasting Weekend - Early April
  events.push({
    name: 'Barrel Tasting Weekend',
    dates: getDateRange(year, 3, 4, 3),
    multiplier: 1.35,
    minStay: 2,
    category: 'wine'
  });
  
  // Cinco de Mayo - May 5
  events.push({
    name: 'Cinco de Mayo Celebrations',
    dates: [formatDate(new Date(year, 4, 5))],
    multiplier: 1.20,
    minStay: 1,
    category: 'cultural'
  });
  
  // BottleRock Napa Valley - Memorial Day Weekend (Last weekend of May)
  const memorialDay = getLastWeekdayOfMonth(year, 4, 1);
  const bottleRockStart = new Date(memorialDay);
  bottleRockStart.setDate(bottleRockStart.getDate() - 2); // Friday before
  events.push({
    name: 'BottleRock Napa Valley',
    dates: getDateRange(year, 4, bottleRockStart.getDate(), 3),
    multiplier: 2.20, // Highest demand event
    minStay: 3,
    category: 'music',
    soldOutRisk: 'extreme'
  });
  
  // ========== SUMMER EVENTS (Jun-Aug) ==========
  
  // Auction Napa Valley - First weekend of June
  events.push({
    name: 'Auction Napa Valley',
    dates: getDateRange(year, 5, 5, 4), // Thu-Sun
    multiplier: 1.80,
    minStay: 2,
    category: 'wine',
    exclusive: true
  });
  
  // Napa Valley Wine & Food Festival - Mid-June
  events.push({
    name: 'Wine & Food Festival',
    dates: getDateRange(year, 5, 14, 4),
    multiplier: 1.40,
    minStay: 2,
    category: 'culinary'
  });
  
  // Fourth of July Weekend
  events.push({
    name: 'Fourth of July Weekend',
    dates: getDateRange(year, 6, 3, 4), // July 3-6
    multiplier: 1.65,
    minStay: 2,
    category: 'holiday'
  });
  
  // Music in the Vineyards - August
  events.push({
    name: 'Music in the Vineyards',
    dates: getDateRange(year, 7, 1, 21), // First 3 weeks of August
    multiplier: 1.25,
    minStay: 1,
    category: 'music'
  });
  
  // ========== HARVEST SEASON (Sep-Oct) ==========
  
  // Harvest Season Kickoff - Mid-September
  events.push({
    name: 'Harvest Season Kickoff',
    dates: getDateRange(year, 8, 12, 4),
    multiplier: 1.55,
    minStay: 2,
    category: 'wine'
  });
  
  // Taste of Atlas Peak - September
  events.push({
    name: 'Taste of Atlas Peak',
    dates: getDateRange(year, 8, 20, 2),
    multiplier: 1.35,
    minStay: 1,
    category: 'wine'
  });
  
  // Harvest STOMP - Late September
  events.push({
    name: 'Harvest STOMP',
    dates: getDateRange(year, 8, 27, 2),
    multiplier: 1.40,
    minStay: 1,
    category: 'wine'
  });
  
  // Napa Valley Grape Crush
  events.push({
    name: 'Peak Harvest / Grape Crush',
    dates: getDateRange(year, 9, 1, 21), // First 3 weeks of October
    multiplier: 1.50,
    minStay: 2,
    category: 'wine',
    description: 'Peak harvest activity - wineries at their busiest'
  });
  
  // ========== FALL/WINTER EVENTS (Nov-Dec) ==========
  
  // Dia de los Muertos - November 1-2
  events.push({
    name: 'Dia de los Muertos',
    dates: getDateRange(year, 10, 1, 2),
    multiplier: 1.20,
    minStay: 1,
    category: 'cultural'
  });
  
  // Napa Valley Film Festival - Mid-November
  events.push({
    name: 'Napa Valley Film Festival',
    dates: getDateRange(year, 10, 13, 4), // Wed-Sat
    multiplier: 1.55,
    minStay: 2,
    category: 'entertainment'
  });
  
  // Thanksgiving Week
  const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4);
  events.push({
    name: 'Thanksgiving Week',
    dates: getDateRange(year, 10, thanksgiving.getDate() - 3, 7), // Mon-Sun
    multiplier: 1.60,
    minStay: 3,
    category: 'holiday'
  });
  
  // Holiday Open Houses - Early December
  events.push({
    name: 'Winery Holiday Open Houses',
    dates: getDateRange(year, 11, 1, 14), // First 2 weeks of December
    multiplier: 1.30,
    minStay: 1,
    category: 'wine'
  });
  
  // Christmas Week
  events.push({
    name: 'Christmas Week',
    dates: getDateRange(year, 11, 22, 6), // Dec 22-27
    multiplier: 1.70,
    minStay: 2,
    category: 'holiday'
  });
  
  // New Year's Eve Celebrations
  events.push({
    name: "New Year's Eve Celebrations",
    dates: getDateRange(year, 11, 30, 2), // Dec 30-31
    multiplier: 2.00,
    minStay: 2,
    category: 'holiday'
  });
  
  return events;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get an array of date strings for a date range
 */
function getDateRange(year, month, startDay, numDays) {
  const dates = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(year, month, startDay + i);
    dates.push(formatDate(date));
  }
  return dates;
}

/**
 * Format date as MM-DD for matching
 * IMPORTANT: Use UTC methods to avoid timezone issues when parsing ISO date strings
 */
function formatDate(date) {
  // If date is a string, parse it carefully to avoid timezone issues
  let d;
  if (typeof date === 'string') {
    // Parse YYYY-MM-DD without timezone conversion
    const parts = date.split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      d = new Date(date);
    }
  } else {
    d = new Date(date);
  }
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatFullDate(date) {
  return date.toISOString().split('T')[0];
}

// ============================================================================
// MAIN EXPORT: Get all special dates for pricing
// ============================================================================

/**
 * Build complete special dates configuration for a year
 * Returns format compatible with dynamic-pricing-engine.js
 */
function buildSpecialDatesConfig(year) {
  const holidays = calculateHolidays(year);
  const napaEvents = getNapaEvents(year);
  
  const specialDates = {};
  
  // Add holidays with pricing multipliers
  const holidayConfig = {
    newYearsEve: { multiplier: 2.00, minStay: 2, name: "New Year's Eve" },
    newYearsDay: { multiplier: 1.40, minStay: 1, name: "New Year's Day" },
    mlkDay: { multiplier: 1.25, minStay: 2, name: 'MLK Day Weekend' },
    valentinesDay: { multiplier: 1.55, minStay: 2, name: "Valentine's Day" },
    presidentsDay: { multiplier: 1.30, minStay: 2, name: "Presidents Day Weekend" },
    stPatricksDay: { multiplier: 1.15, minStay: 1, name: "St. Patrick's Day" },
    easter: { multiplier: 1.35, minStay: 2, name: 'Easter Weekend' },
    mothersDay: { multiplier: 1.45, minStay: 2, name: "Mother's Day Weekend" },
    memorialDay: { multiplier: 1.50, minStay: 2, name: 'Memorial Day Weekend' },
    fathersDay: { multiplier: 1.25, minStay: 1, name: "Father's Day" },
    july4th: { multiplier: 1.65, minStay: 2, name: 'Independence Day' },
    laborDay: { multiplier: 1.50, minStay: 2, name: 'Labor Day Weekend' },
    halloween: { multiplier: 1.20, minStay: 1, name: 'Halloween' },
    thanksgiving: { multiplier: 1.60, minStay: 3, name: 'Thanksgiving' },
    blackFriday: { multiplier: 1.45, minStay: 2, name: 'Black Friday Weekend' },
    christmasEve: { multiplier: 1.70, minStay: 2, name: 'Christmas Eve' },
    christmasDay: { multiplier: 1.65, minStay: 2, name: 'Christmas Day' }
  };
  
  // Add holiday weekends (day before and after for major holidays)
  for (const [key, config] of Object.entries(holidayConfig)) {
    const holidayDate = holidays[key];
    if (!holidayDate) continue;
    
    const dates = [formatDate(holidayDate)];
    
    // Add weekend padding for major holidays
    if (config.minStay >= 2) {
      const dayBefore = new Date(holidayDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      dates.unshift(formatDate(dayBefore));
      
      const dayAfter = new Date(holidayDate);
      dayAfter.setDate(dayAfter.getDate() + 1);
      dates.push(formatDate(dayAfter));
    }
    
    specialDates[key] = {
      dates,
      multiplier: config.multiplier,
      minStay: config.minStay,
      name: config.name,
      type: 'holiday'
    };
  }
  
  // Add Napa Valley events
  for (const event of napaEvents) {
    const eventKey = event.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    specialDates[eventKey] = {
      dates: event.dates,
      multiplier: event.multiplier,
      minStay: event.minStay,
      name: event.name,
      type: 'event',
      category: event.category
    };
  }
  
  return specialDates;
}

/**
 * Check if a date matches any special date/event
 * @param {Date|string} date - Date to check
 * @param {number} year - Year for event calendar
 * @returns {object|null} - Matching event info or null
 */
function getSpecialDateInfo(date, year) {
  // Use formatDate which handles timezone issues
  const monthDay = formatDate(date);
  const specialDates = buildSpecialDatesConfig(year);
  
  // Find all matching events (a date could have multiple)
  const matches = [];
  
  for (const [key, config] of Object.entries(specialDates)) {
    if (config.dates.includes(monthDay)) {
      matches.push({
        key,
        ...config
      });
    }
  }
  
  if (matches.length === 0) {
    return null;
  }
  
  // If multiple events, return the one with highest multiplier
  matches.sort((a, b) => b.multiplier - a.multiplier);
  return matches[0];
}

/**
 * Get all events for a specific month
 */
function getEventsForMonth(year, month) {
  const specialDates = buildSpecialDatesConfig(year);
  const monthStr = String(month).padStart(2, '0');
  const events = [];
  
  for (const [key, config] of Object.entries(specialDates)) {
    const monthDates = config.dates.filter(d => d.startsWith(monthStr + '-'));
    if (monthDates.length > 0) {
      events.push({
        key,
        name: config.name,
        dates: monthDates,
        multiplier: config.multiplier,
        type: config.type,
        category: config.category
      });
    }
  }
  
  return events.sort((a, b) => {
    const dateA = a.dates[0];
    const dateB = b.dates[0];
    return dateA.localeCompare(dateB);
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  calculateHolidays,
  getNapaEvents,
  buildSpecialDatesConfig,
  getSpecialDateInfo,
  getEventsForMonth,
  formatDate,
  formatFullDate
};

