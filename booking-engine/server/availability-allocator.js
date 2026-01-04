/**
 * HENNESSEY ESTATE - AVAILABILITY ALLOCATION ENGINE
 * ==================================================
 * Intelligent algorithm to balance individual room bookings vs full property buyout.
 * 
 * Key Strategies:
 * 1. Revenue maximization through dynamic allocation
 * 2. Time-based priority (weekends favor buyout, weekdays favor individual)
 * 3. Lead time rules (far-out dates protect buyout, closer dates open individual)
 * 4. Demand-responsive allocation
 * 5. Minimum stay optimization
 * 
 * Inspired by:
 * - Wheelhouse portfolio optimization
 * - PriceLabs demand forecasting
 * - Hotel revenue management best practices
 */

const { pricingEngine, PROPERTY_CONFIG, SEASONALITY } = require('./dynamic-pricing-engine');

// ============================================================================
// ALLOCATION CONFIGURATION
// ============================================================================

const ALLOCATION_CONFIG = {
  // Property specifics
  totalIndividualRooms: 5,  // Classic, Estate Room, Patio Retreat, Junior Suite, Pool Suite
  buyoutRoomTypeId: '88798581989504',
  
  // Revenue thresholds
  buyoutMinimumRevenue: 5000,  // Minimum for buyout to be attractive
  individualRoomAvgRate: 550,   // Average rate across individual rooms
  
  // Allocation modes
  modes: {
    BUYOUT_PRIORITY: 'buyout_priority',      // Prioritize full property bookings
    INDIVIDUAL_PRIORITY: 'individual_priority', // Prioritize individual rooms
    BALANCED: 'balanced',                      // Balance both
    REVENUE_OPTIMAL: 'revenue_optimal'         // Maximize total revenue
  },
  
  // Time windows for allocation decisions
  leadTimeWindows: {
    farOut: { daysOut: [90, 365], buyoutPriority: 0.9 },      // 90+ days: heavily favor buyout
    longTerm: { daysOut: [45, 89], buyoutPriority: 0.7 },     // 45-89 days: favor buyout
    mediumTerm: { daysOut: [21, 44], buyoutPriority: 0.5 },   // 21-44 days: balanced
    shortTerm: { daysOut: [8, 20], buyoutPriority: 0.3 },     // 8-20 days: favor individual
    lastMinute: { daysOut: [0, 7], buyoutPriority: 0.2 }      // 0-7 days: prioritize filling
  },
  
  // Day of week allocation
  dayOfWeekRules: {
    weekendNights: { days: [5, 6], buyoutWeight: 1.5 },  // Fri-Sat: boost buyout
    sundayNight: { days: [0], buyoutWeight: 1.2 },       // Sun: moderate buyout boost
    weekdayNights: { days: [1, 2, 3, 4], buyoutWeight: 0.7 } // Mon-Thu: favor individual
  },
  
  // Seasonal adjustments
  seasonalRules: {
    peakSeason: { multiplier: 1.3, minStay: 2 },      // High season: favor longer stays
    shoulderSeason: { multiplier: 1.0, minStay: 1 },
    lowSeason: { multiplier: 0.8, minStay: 1 }
  }
};

// ============================================================================
// AVAILABILITY ALLOCATOR CLASS
// ============================================================================

class AvailabilityAllocator {
  constructor(config = ALLOCATION_CONFIG) {
    this.config = config;
    this.allocationHistory = [];
    this.currentAllocations = new Map();
  }

  // --------------------------------------------------------------------------
  // Calculate buyout vs individual revenue potential
  // --------------------------------------------------------------------------
  calculateRevenuePotential(checkInDate, checkOutDate, currentOccupancy = 50) {
    const nights = this.calculateNights(checkInDate, checkOutDate);
    
    // Calculate buyout revenue
    const buyoutPrice = pricingEngine.calculatePrice(
      this.config.buyoutRoomTypeId,
      checkInDate,
      checkOutDate,
      { currentOccupancy }
    );
    
    const buyoutRevenue = buyoutPrice.pricing?.total || 0;
    
    // Calculate individual rooms revenue (sum of all rooms)
    let individualRevenue = 0;
    let individualRoomPrices = [];
    
    for (const [roomTypeId, roomConfig] of Object.entries(PROPERTY_CONFIG.roomTypes)) {
      if (roomConfig.isBuyout) continue;
      
      try {
        const price = pricingEngine.calculatePrice(
          roomTypeId,
          checkInDate,
          checkOutDate,
          { currentOccupancy }
        );
        individualRevenue += price.pricing?.total || 0;
        individualRoomPrices.push({
          roomTypeId,
          name: roomConfig.name,
          total: price.pricing?.total || 0,
          avgNightlyRate: price.pricing?.avgNightlyRate || roomConfig.baseRate
        });
      } catch (err) {
        console.error(`Error calculating price for ${roomTypeId}:`, err.message);
      }
    }
    
    // Calculate revenue comparison
    const revenueDiff = buyoutRevenue - individualRevenue;
    const buyoutPremium = individualRevenue > 0 ? ((buyoutRevenue / individualRevenue) * 100).toFixed(1) : 0;
    
    return {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      
      buyout: {
        revenue: buyoutRevenue,
        perNight: Math.round(buyoutRevenue / nights),
        price: buyoutPrice
      },
      
      individual: {
        revenue: individualRevenue,
        perNight: Math.round(individualRevenue / nights),
        rooms: individualRoomPrices,
        assumedOccupancy: '100%' // Assumes all rooms booked
      },
      
      comparison: {
        revenueDifference: revenueDiff,
        buyoutPremiumPct: `${buyoutPremium}%`,
        recommendedStrategy: revenueDiff > 0 ? 'BUYOUT' : 'INDIVIDUAL',
        breakEvenOccupancy: individualRevenue > 0 
          ? `${Math.round((buyoutRevenue / individualRevenue) * 100)}%`
          : 'N/A'
      }
    };
  }

  // --------------------------------------------------------------------------
  // Determine allocation priority based on multiple factors
  // --------------------------------------------------------------------------
  calculateAllocationPriority(checkInDate, checkOutDate, options = {}) {
    const { currentOccupancy = 50, existingBookings = [] } = options;
    
    const checkIn = new Date(checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysOut = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
    
    // Get base factors
    const dayOfWeek = checkIn.getDay();
    const season = pricingEngine.getSeasonMultiplier(checkInDate);
    const specialDate = pricingEngine.getSpecialDateMultiplier(checkInDate);
    const revenuePotential = this.calculateRevenuePotential(checkInDate, checkOutDate, currentOccupancy);
    
    // Calculate base buyout score (0-1)
    let buyoutScore = 0.5; // Start neutral
    
    // 1. Lead time adjustment
    for (const [key, window] of Object.entries(this.config.leadTimeWindows)) {
      if (daysOut >= window.daysOut[0] && daysOut <= window.daysOut[1]) {
        buyoutScore = window.buyoutPriority;
        break;
      }
    }
    
    // 2. Day of week adjustment
    if ([5, 6].includes(dayOfWeek)) {
      buyoutScore *= this.config.dayOfWeekRules.weekendNights.buyoutWeight;
    } else if (dayOfWeek === 0) {
      buyoutScore *= this.config.dayOfWeekRules.sundayNight.buyoutWeight;
    } else {
      buyoutScore *= this.config.dayOfWeekRules.weekdayNights.buyoutWeight;
    }
    
    // 3. Season adjustment
    if (season.multiplier > 1.3) {
      buyoutScore *= this.config.seasonalRules.peakSeason.multiplier;
    } else if (season.multiplier > 1.0) {
      buyoutScore *= this.config.seasonalRules.shoulderSeason.multiplier;
    } else {
      buyoutScore *= this.config.seasonalRules.lowSeason.multiplier;
    }
    
    // 4. Special event boost
    if (specialDate.event) {
      buyoutScore *= 1.4; // 40% boost for events
    }
    
    // 5. Occupancy adjustment
    if (currentOccupancy < 30) {
      // Low occupancy: be more flexible
      buyoutScore *= 0.7;
    } else if (currentOccupancy > 80) {
      // High occupancy: maximize value
      buyoutScore *= 1.2;
    }
    
    // 6. Revenue optimization
    if (revenuePotential.comparison.recommendedStrategy === 'BUYOUT') {
      buyoutScore *= 1.15;
    }
    
    // Normalize score to 0-1
    buyoutScore = Math.min(Math.max(buyoutScore, 0), 1);
    
    // Determine allocation mode
    let mode, recommendation;
    if (buyoutScore >= 0.7) {
      mode = this.config.modes.BUYOUT_PRIORITY;
      recommendation = 'PROTECT_BUYOUT';
    } else if (buyoutScore <= 0.3) {
      mode = this.config.modes.INDIVIDUAL_PRIORITY;
      recommendation = 'OPEN_INDIVIDUAL';
    } else {
      mode = this.config.modes.BALANCED;
      recommendation = 'BALANCED';
    }

    return {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      daysOut,
      
      scores: {
        buyoutScore: buyoutScore.toFixed(2),
        individualScore: (1 - buyoutScore).toFixed(2)
      },
      
      factors: {
        leadTime: this.getLeadTimeCategory(daysOut),
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        isWeekend: [0, 5, 6].includes(dayOfWeek),
        season: season.season,
        specialEvent: specialDate.event,
        currentOccupancy: `${currentOccupancy}%`
      },
      
      allocation: {
        mode,
        recommendation,
        buyoutAvailable: buyoutScore >= 0.3, // Available unless strongly individual
        individualAvailable: buyoutScore <= 0.8, // Available unless strongly buyout
        
        // Detailed availability rules
        rules: this.generateAllocationRules(buyoutScore, daysOut, specialDate)
      },
      
      revenue: revenuePotential.comparison,
      
      suggestedMinStay: this.calculateMinStay(buyoutScore, specialDate, season)
    };
  }

  // --------------------------------------------------------------------------
  // Generate specific allocation rules
  // --------------------------------------------------------------------------
  generateAllocationRules(buyoutScore, daysOut, specialDate) {
    const rules = [];
    
    if (buyoutScore >= 0.7) {
      rules.push({
        type: 'BUYOUT_HOLD',
        description: 'Hold inventory for potential buyout booking',
        action: 'Block individual room bookings until buyout decision deadline',
        deadline: daysOut > 30 ? `${daysOut - 14} days before check-in` : `${Math.max(3, daysOut - 7)} days before check-in`
      });
    }
    
    if (specialDate.event) {
      rules.push({
        type: 'EVENT_PREMIUM',
        description: `Special event: ${specialDate.event}`,
        action: 'Apply event pricing and minimum stay requirements',
        minStay: specialDate.minStay
      });
    }
    
    if (daysOut <= 7 && buyoutScore < 0.5) {
      rules.push({
        type: 'LAST_MINUTE_FILL',
        description: 'Last minute inventory - prioritize any booking',
        action: 'Open all inventory, consider promotional pricing'
      });
    }
    
    if (buyoutScore >= 0.5 && buyoutScore < 0.7) {
      rules.push({
        type: 'CONDITIONAL_INDIVIDUAL',
        description: 'Accept individual bookings conditionally',
        action: 'Allow bookings but require 48-hour cancellation flexibility clause'
      });
    }
    
    return rules;
  }

  // --------------------------------------------------------------------------
  // Calculate recommended minimum stay
  // --------------------------------------------------------------------------
  calculateMinStay(buyoutScore, specialDate, season) {
    let minStay = 1;
    
    // Special event minimum
    if (specialDate.minStay) {
      minStay = Math.max(minStay, specialDate.minStay);
    }
    
    // Peak season minimum
    if (season.multiplier > 1.3) {
      minStay = Math.max(minStay, 2);
    }
    
    // High buyout priority = encourage longer stays
    if (buyoutScore >= 0.7) {
      minStay = Math.max(minStay, 2);
    }
    
    return {
      nights: minStay,
      reason: specialDate.event 
        ? `Event: ${specialDate.event}` 
        : season.multiplier > 1.3 
          ? `Peak season: ${season.season}`
          : 'Standard'
    };
  }

  // --------------------------------------------------------------------------
  // Get lead time category
  // --------------------------------------------------------------------------
  getLeadTimeCategory(daysOut) {
    for (const [key, window] of Object.entries(this.config.leadTimeWindows)) {
      if (daysOut >= window.daysOut[0] && daysOut <= window.daysOut[1]) {
        return key;
      }
    }
    return 'unknown';
  }

  // --------------------------------------------------------------------------
  // Check if dates conflict with existing allocations
  // --------------------------------------------------------------------------
  checkConflicts(checkInDate, checkOutDate, existingReservations = []) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    const conflicts = {
      hasBuyoutConflict: false,
      hasIndividualConflicts: false,
      conflictingReservations: [],
      blockedRoomTypes: []
    };
    
    for (const res of existingReservations) {
      const resStart = new Date(res.startDate || res.checkIn);
      const resEnd = new Date(res.endDate || res.checkOut);
      
      // Check for overlap
      if (checkIn < resEnd && checkOut > resStart) {
        const roomTypeId = res.roomTypeID || res.room_type_id;
        
        if (roomTypeId === this.config.buyoutRoomTypeId) {
          conflicts.hasBuyoutConflict = true;
        } else {
          conflicts.hasIndividualConflicts = true;
          conflicts.blockedRoomTypes.push(roomTypeId);
        }
        
        conflicts.conflictingReservations.push({
          reservationId: res.reservationID || res.id,
          roomType: res.roomTypeName || res.room_type_name,
          dates: `${this.formatDate(resStart)} - ${this.formatDate(resEnd)}`
        });
      }
    }
    
    return conflicts;
  }

  // --------------------------------------------------------------------------
  // Get availability allocation for a date range
  // --------------------------------------------------------------------------
  getAllocationForDates(startDate, endDate, options = {}) {
    const { currentOccupancy = 50, existingReservations = [] } = options;
    
    const results = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const nextDay = new Date(current);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const allocation = this.calculateAllocationPriority(
        this.formatDate(current),
        this.formatDate(nextDay),
        { currentOccupancy, existingReservations }
      );
      
      results.push({
        date: this.formatDate(current),
        ...allocation
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return {
      startDate,
      endDate,
      allocations: results,
      summary: this.summarizeAllocations(results)
    };
  }

  // --------------------------------------------------------------------------
  // Summarize allocation decisions
  // --------------------------------------------------------------------------
  summarizeAllocations(allocations) {
    const buyoutPriority = allocations.filter(a => a.allocation.mode === this.config.modes.BUYOUT_PRIORITY).length;
    const individualPriority = allocations.filter(a => a.allocation.mode === this.config.modes.INDIVIDUAL_PRIORITY).length;
    const balanced = allocations.filter(a => a.allocation.mode === this.config.modes.BALANCED).length;
    
    const avgBuyoutScore = allocations.reduce((sum, a) => sum + parseFloat(a.scores.buyoutScore), 0) / allocations.length;
    
    return {
      totalDays: allocations.length,
      distribution: {
        buyoutPriority,
        individualPriority,
        balanced
      },
      avgBuyoutScore: avgBuyoutScore.toFixed(2),
      recommendedStrategy: avgBuyoutScore > 0.6 
        ? 'Focus on buyout marketing'
        : avgBuyoutScore < 0.4 
          ? 'Maximize individual room bookings'
          : 'Balanced approach',
      specialEvents: [...new Set(allocations.filter(a => a.factors.specialEvent).map(a => a.factors.specialEvent))]
    };
  }

  // --------------------------------------------------------------------------
  // Make allocation decision (returns what should be available)
  // --------------------------------------------------------------------------
  makeAllocationDecision(checkInDate, checkOutDate, options = {}) {
    const allocation = this.calculateAllocationPriority(checkInDate, checkOutDate, options);
    const conflicts = this.checkConflicts(checkInDate, checkOutDate, options.existingReservations || []);
    
    // Determine final availability
    const availability = {
      buyoutAvailable: true,
      individualRoomsAvailable: {},
      blockedReason: null
    };
    
    // Check buyout availability
    if (conflicts.hasBuyoutConflict) {
      availability.buyoutAvailable = false;
      availability.blockedReason = 'Buyout already booked for these dates';
    } else if (conflicts.hasIndividualConflicts) {
      availability.buyoutAvailable = false;
      availability.blockedReason = 'Individual rooms already booked - buyout not possible';
    }
    
    // Check individual room availability
    for (const [roomTypeId, roomConfig] of Object.entries(PROPERTY_CONFIG.roomTypes)) {
      if (roomConfig.isBuyout) continue;
      
      if (conflicts.hasBuyoutConflict) {
        availability.individualRoomsAvailable[roomTypeId] = {
          available: false,
          reason: 'Property is exclusively booked (buyout)'
        };
      } else if (conflicts.blockedRoomTypes.includes(roomTypeId)) {
        availability.individualRoomsAvailable[roomTypeId] = {
          available: false,
          reason: 'Room already booked'
        };
      } else if (allocation.allocation.mode === this.config.modes.BUYOUT_PRIORITY && 
                 parseFloat(allocation.scores.buyoutScore) > 0.8) {
        // Strong buyout priority - restrict individual bookings
        availability.individualRoomsAvailable[roomTypeId] = {
          available: false,
          reason: 'Inventory reserved for potential buyout',
          releaseDate: this.calculateReleaseDate(checkInDate)
        };
      } else {
        availability.individualRoomsAvailable[roomTypeId] = {
          available: true,
          price: pricingEngine.calculatePrice(roomTypeId, checkInDate, checkOutDate, options)
        };
      }
    }
    
    // Log allocation decision
    this.logAllocationDecision(checkInDate, checkOutDate, allocation, availability);
    
    return {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      allocation: allocation.allocation,
      availability,
      pricing: allocation.revenue,
      minStay: allocation.suggestedMinStay
    };
  }

  // --------------------------------------------------------------------------
  // Calculate when inventory should be released
  // --------------------------------------------------------------------------
  calculateReleaseDate(checkInDate) {
    const checkIn = new Date(checkInDate);
    const today = new Date();
    const daysOut = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
    
    // Release 14 days before check-in or 7 days from now, whichever is later
    const releaseDate = new Date(checkIn);
    releaseDate.setDate(releaseDate.getDate() - 14);
    
    const minRelease = new Date(today);
    minRelease.setDate(minRelease.getDate() + 7);
    
    return this.formatDate(releaseDate > minRelease ? releaseDate : minRelease);
  }

  // --------------------------------------------------------------------------
  // Log allocation decision for analytics
  // --------------------------------------------------------------------------
  logAllocationDecision(checkIn, checkOut, allocation, availability) {
    this.allocationHistory.push({
      timestamp: new Date().toISOString(),
      checkIn,
      checkOut,
      mode: allocation.allocation.mode,
      buyoutScore: allocation.scores.buyoutScore,
      buyoutAvailable: availability.buyoutAvailable,
      decision: allocation.allocation.recommendation
    });
    
    // Keep last 1000 decisions
    if (this.allocationHistory.length > 1000) {
      this.allocationHistory = this.allocationHistory.slice(-1000);
    }
  }

  // --------------------------------------------------------------------------
  // Get allocation analytics
  // --------------------------------------------------------------------------
  getAllocationAnalytics() {
    if (this.allocationHistory.length === 0) {
      return { message: 'No allocation history available' };
    }
    
    const buyoutDecisions = this.allocationHistory.filter(h => h.mode === this.config.modes.BUYOUT_PRIORITY).length;
    const individualDecisions = this.allocationHistory.filter(h => h.mode === this.config.modes.INDIVIDUAL_PRIORITY).length;
    const balancedDecisions = this.allocationHistory.filter(h => h.mode === this.config.modes.BALANCED).length;
    
    return {
      totalDecisions: this.allocationHistory.length,
      distribution: {
        buyoutPriority: buyoutDecisions,
        individualPriority: individualDecisions,
        balanced: balancedDecisions
      },
      avgBuyoutScore: (
        this.allocationHistory.reduce((sum, h) => sum + parseFloat(h.buyoutScore), 0) / 
        this.allocationHistory.length
      ).toFixed(2),
      recentDecisions: this.allocationHistory.slice(-10)
    };
  }

  // --------------------------------------------------------------------------
  // Utility functions
  // --------------------------------------------------------------------------
  calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // --------------------------------------------------------------------------
  // Get configuration
  // --------------------------------------------------------------------------
  getConfiguration() {
    return {
      ...this.config,
      pricingEngine: pricingEngine.getConfiguration()
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
const availabilityAllocator = new AvailabilityAllocator();

module.exports = {
  AvailabilityAllocator,
  availabilityAllocator,
  ALLOCATION_CONFIG
};

