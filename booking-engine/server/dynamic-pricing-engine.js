/**
 * HENNESSEY ESTATE - DYNAMIC PRICING ENGINE
 * ===========================================
 * Industry-leading dynamic pricing algorithm inspired by:
 * - Wheelhouse (AI-driven market analysis)
 * - PriceLabs (Hyper-local demand forecasting)
 * - Beyond Pricing (Real-time competitor intelligence)
 * - Duetto (Total revenue optimization)
 * 
 * Key Features:
 * 1. Multi-factor demand scoring
 * 2. Competitor-aware pricing
 * 3. Seasonality & event detection
 * 4. Lead time optimization
 * 5. Occupancy-based adjustments
 * 6. Room vs Full-Property allocation balancing
 */

const fs = require('fs');
const path = require('path');

// Import comprehensive Napa Valley events calendar
const napaCalendar = require('./napa-events-calendar');

// ============================================================================
// CONFIGURATION - Hennessey Estate Specific
// ============================================================================

const PROPERTY_CONFIG = {
  propertyId: '49705993547975',
  propertyName: 'Hennessey Estate',
  location: 'Napa Valley, CA',
  totalRooms: 6,
  
  // Room type IDs and base rates
  // Pricing model: Base price ($299) + 5% increase per tier
  // Tier 1: $299, Tier 2: $314, Tier 3: $329, Tier 4 (Premium): $344
  roomTypes: {
    '82833129423048': { name: 'Classic', baseRate: 299, tier: 1, maxOccupancy: 2, premiumPct: 0 },
    '82835472601219': { name: 'Estate Room', baseRate: 314, tier: 2, maxOccupancy: 2, premiumPct: 5 },
    '83444066242706': { name: 'Estate Junior Suite', baseRate: 329, tier: 3, maxOccupancy: 2, premiumPct: 10 },
    '83444040888474': { name: 'Patio Retreat Suite', baseRate: 344, tier: 4, maxOccupancy: 2, premiumPct: 15 },
    '89146217537706': { name: 'Pool Suite with Bathtub', baseRate: 344, tier: 4, maxOccupancy: 2, premiumPct: 15 },
    '88798581989504': { name: 'Total Buyout', baseRate: 5000, tier: 5, maxOccupancy: 20, isBuyout: true, premiumPct: null }
  },
  
  // Revenue floors and ceilings (% of base rate)
  priceFloor: 0.75,   // Never go below 75% of base rate
  priceCeiling: 2.5,  // Can go up to 250% of base rate during peak
  
  // Competitor positioning (premium over market average)
  competitorPremium: 1.15  // 15% premium over competitors
};

// ============================================================================
// SEASONALITY CONFIGURATION - Napa Valley Specific
// ============================================================================

const SEASONALITY = {
  // Peak seasons (multipliers)
  seasons: {
    harvestSeason: { months: [9, 10], multiplier: 1.45, name: 'Harvest Season' },
    summerPeak: { months: [6, 7, 8], multiplier: 1.30, name: 'Summer Peak' },
    springWine: { months: [4, 5], multiplier: 1.20, name: 'Spring Wine Season' },
    holidaySeason: { months: [11, 12], multiplier: 1.25, name: 'Holiday Season' },
    winterLow: { months: [1, 2, 3], multiplier: 0.85, name: 'Winter Low Season' }
  },
  
  // Special dates (Napa events, holidays)
  specialDates: {
    // Major US Holidays
    'newYearsEve': { dates: ['12-31'], multiplier: 1.8, minStay: 2 },
    'valentines': { dates: ['02-14'], multiplier: 1.5, minStay: 2 },
    'presidentsDay': { dates: ['02-17'], multiplier: 1.3 },
    'memorialDay': { dates: ['05-26'], multiplier: 1.4 },
    'july4th': { dates: ['07-04'], multiplier: 1.6, minStay: 2 },
    'laborDay': { dates: ['09-01'], multiplier: 1.5 },
    'thanksgiving': { dates: ['11-27'], multiplier: 1.5, minStay: 3 },
    'christmas': { dates: ['12-25'], multiplier: 1.6, minStay: 2 },
    
    // Napa Valley Events (approximate dates - should be updated annually)
    'bottleRock': { dates: ['05-23', '05-24', '05-25'], multiplier: 2.0, minStay: 3, name: 'BottleRock Napa' },
    'napaMarathon': { dates: ['03-02'], multiplier: 1.4, name: 'Napa Valley Marathon' },
    'harvestKickoff': { dates: ['09-15'], multiplier: 1.6, name: 'Harvest Season Kickoff' },
    'mustardFestival': { dates: ['02-01'], multiplier: 1.25, name: 'Mustard Festival' },
    'filmFestival': { dates: ['11-13', '11-14', '11-15', '11-16'], multiplier: 1.5, name: 'Napa Valley Film Festival' }
  }
};

// ============================================================================
// DAY OF WEEK CONFIGURATION
// ============================================================================

const DAY_OF_WEEK = {
  0: { name: 'Sunday', multiplier: 1.15, category: 'weekend' },
  1: { name: 'Monday', multiplier: 0.90, category: 'weekday' },
  2: { name: 'Tuesday', multiplier: 0.85, category: 'weekday' },
  3: { name: 'Wednesday', multiplier: 0.90, category: 'weekday' },
  4: { name: 'Thursday', multiplier: 1.00, category: 'weekday' },
  5: { name: 'Friday', multiplier: 1.25, category: 'weekend' },
  6: { name: 'Saturday', multiplier: 1.35, category: 'weekend' }
};

// ============================================================================
// LEAD TIME CONFIGURATION
// ============================================================================

const LEAD_TIME = {
  lastMinute: { daysOut: [0, 3], multiplier: 0.90, name: 'Last Minute' },
  shortTerm: { daysOut: [4, 14], multiplier: 1.00, name: 'Short Term' },
  mediumTerm: { daysOut: [15, 30], multiplier: 1.05, name: 'Medium Term' },
  longTerm: { daysOut: [31, 90], multiplier: 1.00, name: 'Long Term' },
  farOut: { daysOut: [91, 365], multiplier: 0.95, name: 'Far Out' }
};

// ============================================================================
// OCCUPANCY-BASED PRICING
// ============================================================================

const OCCUPANCY_PRICING = {
  veryLow: { range: [0, 25], multiplier: 0.85, urgency: 'high' },
  low: { range: [26, 50], multiplier: 0.95, urgency: 'medium' },
  moderate: { range: [51, 70], multiplier: 1.00, urgency: 'low' },
  high: { range: [71, 85], multiplier: 1.15, urgency: 'none' },
  veryHigh: { range: [86, 100], multiplier: 1.35, urgency: 'none' }
};

// ============================================================================
// DYNAMIC PRICING ENGINE CLASS
// ============================================================================

class DynamicPricingEngine {
  constructor(config = PROPERTY_CONFIG) {
    this.config = config;
    this.competitorRates = this.loadCompetitorRates();
    this.historicalData = {};
    this.pricingCache = new Map();
    this.lastCacheRefresh = null;
    this.cacheValidityMs = 15 * 60 * 1000; // 15 minutes
  }

  // --------------------------------------------------------------------------
  // Load competitor rates from scraped data
  // --------------------------------------------------------------------------
  loadCompetitorRates() {
    try {
      const dataPath = path.join(__dirname, '../data/competitor-rates-final.json');
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log(`[DynamicPricing] Loaded ${data.totalDataPoints} competitor data points`);
        return data;
      }
    } catch (err) {
      console.warn('[DynamicPricing] Could not load competitor rates:', err.message);
    }
    return { results: [], summary: {} };
  }

  // --------------------------------------------------------------------------
  // Get competitor rate for a specific date
  // --------------------------------------------------------------------------
  getCompetitorRate(date) {
    const dateStr = this.formatDate(date);
    const dayRates = this.competitorRates.results?.filter(r => r.checkin === dateStr) || [];
    
    if (dayRates.length === 0) {
      // Estimate based on summary averages
      const avgRates = Object.values(this.competitorRates.summary || {}).map(s => parseFloat(s.averageRate) || 500);
      return avgRates.length > 0 ? avgRates.reduce((a, b) => a + b, 0) / avgRates.length : 500;
    }
    
    // Return average of competitors for this date
    const total = dayRates.reduce((sum, r) => sum + (r.lowestRate || 500), 0);
    return total / dayRates.length;
  }

  // --------------------------------------------------------------------------
  // Calculate season multiplier
  // --------------------------------------------------------------------------
  getSeasonMultiplier(date) {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    
    for (const [key, season] of Object.entries(SEASONALITY.seasons)) {
      if (season.months.includes(month)) {
        return { multiplier: season.multiplier, season: season.name, key };
      }
    }
    return { multiplier: 1.0, season: 'Standard', key: 'standard' };
  }

  // --------------------------------------------------------------------------
  // Check for special dates/events using comprehensive Napa Valley calendar
  // --------------------------------------------------------------------------
  getSpecialDateMultiplier(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    
    // Use the comprehensive Napa Valley events calendar
    const eventInfo = napaCalendar.getSpecialDateInfo(d, year);
    
    if (eventInfo) {
      return { 
        multiplier: eventInfo.multiplier, 
        event: eventInfo.name, 
        minStay: eventInfo.minStay || 1,
        key: eventInfo.key,
        type: eventInfo.type,
        category: eventInfo.category
      };
    }
    return { multiplier: 1.0, event: null, minStay: 1, key: null };
  }

  // --------------------------------------------------------------------------
  // Get day of week multiplier
  // --------------------------------------------------------------------------
  getDayOfWeekMultiplier(date) {
    const d = new Date(date);
    const dayConfig = DAY_OF_WEEK[d.getDay()];
    return {
      multiplier: dayConfig.multiplier,
      dayName: dayConfig.name,
      category: dayConfig.category
    };
  }

  // --------------------------------------------------------------------------
  // Get lead time multiplier
  // --------------------------------------------------------------------------
  getLeadTimeMultiplier(checkInDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    
    const daysOut = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
    
    for (const [key, config] of Object.entries(LEAD_TIME)) {
      if (daysOut >= config.daysOut[0] && daysOut <= config.daysOut[1]) {
        return { multiplier: config.multiplier, category: config.name, daysOut, key };
      }
    }
    return { multiplier: 1.0, category: 'Standard', daysOut, key: 'standard' };
  }

  // --------------------------------------------------------------------------
  // Get occupancy-based multiplier
  // --------------------------------------------------------------------------
  getOccupancyMultiplier(occupancyRate) {
    for (const [key, config] of Object.entries(OCCUPANCY_PRICING)) {
      if (occupancyRate >= config.range[0] && occupancyRate <= config.range[1]) {
        return { 
          multiplier: config.multiplier, 
          level: key, 
          urgency: config.urgency 
        };
      }
    }
    return { multiplier: 1.0, level: 'moderate', urgency: 'low' };
  }

  // --------------------------------------------------------------------------
  // Calculate competitor-aware adjustment
  // --------------------------------------------------------------------------
  getCompetitorAdjustment(date, baseRate) {
    const competitorAvg = this.getCompetitorRate(date);
    const targetPrice = competitorAvg * this.config.competitorPremium;
    
    // Calculate adjustment factor to be competitive but premium
    const ratio = targetPrice / baseRate;
    
    // Clamp the adjustment to reasonable bounds
    const adjustment = Math.min(Math.max(ratio, 0.8), 1.5);
    
    return {
      competitorAvg,
      targetPrice,
      adjustment,
      positioning: adjustment > 1.1 ? 'premium' : adjustment < 0.95 ? 'value' : 'competitive'
    };
  }

  // --------------------------------------------------------------------------
  // MAIN PRICING CALCULATION
  // --------------------------------------------------------------------------
  calculatePrice(roomTypeId, checkInDate, checkOutDate, options = {}) {
    const { currentOccupancy = 50, forceRefresh = false } = options;
    
    // Get room configuration
    const roomConfig = this.config.roomTypes[roomTypeId];
    if (!roomConfig) {
      throw new Error(`Unknown room type: ${roomTypeId}`);
    }

    const baseRate = roomConfig.baseRate;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Calculate daily rates
    const dailyRates = [];
    const factors = [];
    let current = new Date(checkIn);

    for (let i = 0; i < nights; i++) {
      const dayFactors = this.calculateDayFactors(current, baseRate, currentOccupancy);
      
      // Calculate final rate for this day
      let rate = baseRate;
      rate *= dayFactors.season.multiplier;
      rate *= dayFactors.specialDate.multiplier;
      rate *= dayFactors.dayOfWeek.multiplier;
      rate *= dayFactors.leadTime.multiplier;
      rate *= dayFactors.occupancy.multiplier;
      rate *= dayFactors.competitor.adjustment;

      // Apply floor and ceiling
      const floor = baseRate * this.config.priceFloor;
      const ceiling = baseRate * this.config.priceCeiling;
      rate = Math.min(Math.max(rate, floor), ceiling);
      rate = Math.round(rate);

      dailyRates.push({
        date: this.formatDate(current),
        rate,
        baseRate,
        factors: dayFactors
      });

      factors.push(dayFactors);
      current.setDate(current.getDate() + 1);
    }

    // Calculate totals
    const subtotal = dailyRates.reduce((sum, d) => sum + d.rate, 0);
    const avgNightlyRate = Math.round(subtotal / nights);
    const savingsFromBase = (baseRate * nights) - subtotal;

    // Length of stay discount
    let lengthDiscount = 0;
    if (nights >= 7) {
      lengthDiscount = 0.15; // 15% off for 7+ nights
    } else if (nights >= 4) {
      lengthDiscount = 0.10; // 10% off for 4-6 nights
    } else if (nights >= 3) {
      lengthDiscount = 0.05; // 5% off for 3 nights
    }

    const discountAmount = Math.round(subtotal * lengthDiscount);
    const total = subtotal - discountAmount;

    return {
      roomTypeId,
      roomTypeName: roomConfig.name,
      checkIn: this.formatDate(checkIn),
      checkOut: this.formatDate(checkOut),
      nights,
      
      pricing: {
        baseRate,
        dailyRates,
        subtotal,
        avgNightlyRate,
        lengthOfStayDiscount: lengthDiscount,
        discountAmount,
        total,
        savingsFromBase: savingsFromBase > 0 ? savingsFromBase : 0,
        
        // Summary of applied factors
        summary: {
          dominantSeason: this.getDominantFactor(factors, 'season'),
          hasSpecialEvent: factors.some(f => f.specialDate.event),
          events: [...new Set(factors.filter(f => f.specialDate.event).map(f => f.specialDate.event))],
          avgOccupancyMultiplier: factors.reduce((s, f) => s + f.occupancy.multiplier, 0) / factors.length,
          competitorPositioning: factors[0]?.competitor.positioning
        }
      },

      // Minimum stay requirements
      minStay: Math.max(...factors.map(f => f.specialDate.minStay || 1)),

      // Revenue metrics
      metrics: {
        revenuePerRoom: total,
        revenueVsBase: ((total / (baseRate * nights)) * 100).toFixed(1) + '%',
        priceIndex: (avgNightlyRate / baseRate).toFixed(2)
      },

      calculatedAt: new Date().toISOString()
    };
  }

  // --------------------------------------------------------------------------
  // Calculate all factors for a single day
  // --------------------------------------------------------------------------
  calculateDayFactors(date, baseRate, occupancyRate) {
    return {
      date: this.formatDate(date),
      season: this.getSeasonMultiplier(date),
      specialDate: this.getSpecialDateMultiplier(date),
      dayOfWeek: this.getDayOfWeekMultiplier(date),
      leadTime: this.getLeadTimeMultiplier(date),
      occupancy: this.getOccupancyMultiplier(occupancyRate),
      competitor: this.getCompetitorAdjustment(date, baseRate)
    };
  }

  // --------------------------------------------------------------------------
  // Get dominant factor from array
  // --------------------------------------------------------------------------
  getDominantFactor(factors, type) {
    const counts = {};
    factors.forEach(f => {
      const key = f[type]?.season || f[type]?.key || 'standard';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'standard';
  }

  // --------------------------------------------------------------------------
  // Calculate prices for all room types
  // --------------------------------------------------------------------------
  calculateAllRoomPrices(checkInDate, checkOutDate, options = {}) {
    const results = {};
    
    for (const roomTypeId of Object.keys(this.config.roomTypes)) {
      try {
        results[roomTypeId] = this.calculatePrice(roomTypeId, checkInDate, checkOutDate, options);
      } catch (err) {
        console.error(`Error calculating price for ${roomTypeId}:`, err.message);
        results[roomTypeId] = { error: err.message };
      }
    }
    
    return {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      rooms: results,
      calculatedAt: new Date().toISOString()
    };
  }

  // --------------------------------------------------------------------------
  // Get pricing calendar for a month
  // --------------------------------------------------------------------------
  getPricingCalendar(roomTypeId, year, month, occupancyData = {}) {
    const roomConfig = this.config.roomTypes[roomTypeId];
    if (!roomConfig) {
      throw new Error(`Unknown room type: ${roomTypeId}`);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const days = [];

    let current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = this.formatDate(current);
      // Use actual occupancy if available, otherwise default to 0% (no bookings)
      // Previously defaulted to 50% which was incorrect - missing dates mean NO bookings
      const occupancy = occupancyData[dateStr] !== undefined ? occupancyData[dateStr] : 0;
      
      const factors = this.calculateDayFactors(current, roomConfig.baseRate, occupancy);
      
      let rate = roomConfig.baseRate;
      rate *= factors.season.multiplier;
      rate *= factors.specialDate.multiplier;
      rate *= factors.dayOfWeek.multiplier;
      rate *= factors.leadTime.multiplier;
      rate *= factors.occupancy.multiplier; // Apply occupancy factor
      
      // Apply floor and ceiling constraints
      const floor = roomConfig.baseRate * this.config.priceFloor;
      const ceiling = roomConfig.baseRate * this.config.priceCeiling;
      rate = Math.min(Math.max(rate, floor), ceiling);
      rate = Math.round(rate);

      days.push({
        date: dateStr,
        dayOfWeek: current.getDay(),
        rate,
        baseRate: roomConfig.baseRate,
        multiplier: (rate / roomConfig.baseRate).toFixed(2),
        occupancy: occupancy,
        factors: {
          season: factors.season.season,
          event: factors.specialDate.event,
          dayType: factors.dayOfWeek.category,
          occupancy: factors.occupancy.multiplier
        },
        minStay: factors.specialDate.minStay || 1
      });

      current.setDate(current.getDate() + 1);
    }

    return {
      roomTypeId,
      roomTypeName: roomConfig.name,
      year,
      month,
      baseRate: roomConfig.baseRate,
      days,
      summary: {
        avgRate: Math.round(days.reduce((s, d) => s + d.rate, 0) / days.length),
        minRate: Math.min(...days.map(d => d.rate)),
        maxRate: Math.max(...days.map(d => d.rate)),
        specialEvents: [...new Set(days.filter(d => d.factors.event).map(d => d.factors.event))]
      }
    };
  }

  // --------------------------------------------------------------------------
  // Utility: Format date as YYYY-MM-DD
  // --------------------------------------------------------------------------
  formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // --------------------------------------------------------------------------
  // Get pricing recommendations
  // --------------------------------------------------------------------------
  getPricingRecommendations(checkInDate, occupancyRate = 50) {
    const factors = this.calculateDayFactors(new Date(checkInDate), 500, occupancyRate);
    const recommendations = [];

    // Occupancy-based recommendations
    if (occupancyRate < 40) {
      recommendations.push({
        type: 'occupancy',
        priority: 'high',
        message: 'Low occupancy detected. Consider promotional pricing or last-minute deals.',
        suggestedAction: 'Reduce rates by 10-15% to stimulate demand'
      });
    } else if (occupancyRate > 85) {
      recommendations.push({
        type: 'occupancy',
        priority: 'high',
        message: 'High demand period. Maximize revenue with premium pricing.',
        suggestedAction: 'Increase rates by 15-25%'
      });
    }

    // Event-based recommendations
    if (factors.specialDate.event) {
      recommendations.push({
        type: 'event',
        priority: 'high',
        message: `Special event detected: ${factors.specialDate.event}`,
        suggestedAction: `Apply ${((factors.specialDate.multiplier - 1) * 100).toFixed(0)}% premium and ${factors.specialDate.minStay}-night minimum stay`
      });
    }

    // Season-based recommendations
    if (factors.season.multiplier > 1.2) {
      recommendations.push({
        type: 'season',
        priority: 'medium',
        message: `Peak season: ${factors.season.season}`,
        suggestedAction: 'Ensure rates reflect high demand period'
      });
    } else if (factors.season.multiplier < 0.9) {
      recommendations.push({
        type: 'season',
        priority: 'medium',
        message: `Low season: ${factors.season.season}`,
        suggestedAction: 'Consider packages or added value to attract bookings'
      });
    }

    // Lead time recommendations
    if (factors.leadTime.daysOut < 7 && occupancyRate < 60) {
      recommendations.push({
        type: 'leadTime',
        priority: 'high',
        message: 'Last-minute inventory available',
        suggestedAction: 'Consider flash sale or OTA visibility boost'
      });
    }

    return {
      date: checkInDate,
      currentOccupancy: occupancyRate,
      factors,
      recommendations,
      overallStrategy: this.determineOverallStrategy(factors, occupancyRate)
    };
  }

  // --------------------------------------------------------------------------
  // Determine overall pricing strategy
  // --------------------------------------------------------------------------
  determineOverallStrategy(factors, occupancyRate) {
    const totalMultiplier = 
      factors.season.multiplier * 
      factors.specialDate.multiplier * 
      factors.dayOfWeek.multiplier;

    if (totalMultiplier > 1.5 && occupancyRate > 70) {
      return {
        strategy: 'MAXIMIZE',
        description: 'High demand period - maximize revenue per room',
        priceGuidance: 'premium',
        suggestedMultiplier: 1.3
      };
    } else if (totalMultiplier > 1.2) {
      return {
        strategy: 'OPTIMIZE',
        description: 'Above-average demand - balance occupancy and rate',
        priceGuidance: 'standard-plus',
        suggestedMultiplier: 1.1
      };
    } else if (occupancyRate < 40) {
      return {
        strategy: 'FILL',
        description: 'Low occupancy - prioritize filling rooms',
        priceGuidance: 'promotional',
        suggestedMultiplier: 0.85
      };
    } else {
      return {
        strategy: 'BALANCED',
        description: 'Normal conditions - maintain standard pricing',
        priceGuidance: 'standard',
        suggestedMultiplier: 1.0
      };
    }
  }

  // --------------------------------------------------------------------------
  // Export configuration for admin dashboard
  // --------------------------------------------------------------------------
  getConfiguration() {
    const currentYear = new Date().getFullYear();
    return {
      property: this.config,
      seasonality: SEASONALITY,
      dayOfWeek: DAY_OF_WEEK,
      leadTime: LEAD_TIME,
      occupancyPricing: OCCUPANCY_PRICING,
      competitorData: {
        lastUpdated: this.competitorRates.scrapedAt,
        totalDataPoints: this.competitorRates.totalDataPoints,
        competitors: Object.keys(this.competitorRates.summary || {})
      },
      eventsCalendar: {
        source: 'Napa Valley Events Calendar (Dynamic)',
        yearsSupported: [currentYear, currentYear + 1],
        holidaysCalculated: 'dynamic',
        eventsIncluded: 'BottleRock, Auction Napa Valley, Harvest Season, Film Festival, and more'
      }
    };
  }

  // --------------------------------------------------------------------------
  // Get events for a specific month (for calendar display)
  // --------------------------------------------------------------------------
  getEventsForMonth(year, month) {
    return napaCalendar.getEventsForMonth(year, month);
  }

  // --------------------------------------------------------------------------
  // Get all holidays for a year
  // --------------------------------------------------------------------------
  getHolidaysForYear(year) {
    const holidays = napaCalendar.calculateHolidays(year);
    const result = {};
    for (const [key, date] of Object.entries(holidays)) {
      result[key] = {
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' })
      };
    }
    return result;
  }

  // --------------------------------------------------------------------------
  // Get all Napa events for a year
  // --------------------------------------------------------------------------
  getNapaEventsForYear(year) {
    return napaCalendar.getNapaEvents(year);
  }

  // --------------------------------------------------------------------------
  // Update base rate for a room type
  // --------------------------------------------------------------------------
  updateBaseRate(roomTypeId, newBaseRate) {
    if (!this.config.roomTypes[roomTypeId]) {
      throw new Error(`Unknown room type: ${roomTypeId}`);
    }
    
    const oldRate = this.config.roomTypes[roomTypeId].baseRate;
    this.config.roomTypes[roomTypeId].baseRate = newBaseRate;
    
    // Clear pricing cache
    this.pricingCache.clear();
    
    return {
      roomTypeId,
      roomTypeName: this.config.roomTypes[roomTypeId].name,
      oldRate,
      newRate: newBaseRate,
      change: ((newBaseRate - oldRate) / oldRate * 100).toFixed(1) + '%'
    };
  }

  // --------------------------------------------------------------------------
  // Bulk update configuration
  // --------------------------------------------------------------------------
  updateConfiguration(updates) {
    const changes = [];
    
    if (updates.priceFloor !== undefined) {
      this.config.priceFloor = updates.priceFloor;
      changes.push({ field: 'priceFloor', value: updates.priceFloor });
    }
    
    if (updates.priceCeiling !== undefined) {
      this.config.priceCeiling = updates.priceCeiling;
      changes.push({ field: 'priceCeiling', value: updates.priceCeiling });
    }
    
    if (updates.competitorPremium !== undefined) {
      this.config.competitorPremium = updates.competitorPremium;
      changes.push({ field: 'competitorPremium', value: updates.competitorPremium });
    }
    
    // Clear cache after config changes
    this.pricingCache.clear();
    
    return { success: true, changes };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
const pricingEngine = new DynamicPricingEngine();

module.exports = {
  DynamicPricingEngine,
  pricingEngine,
  PROPERTY_CONFIG,
  SEASONALITY,
  DAY_OF_WEEK,
  LEAD_TIME,
  OCCUPANCY_PRICING,
  napaCalendar
};

