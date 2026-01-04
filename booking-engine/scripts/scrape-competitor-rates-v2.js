/**
 * Competitor Rate Scraper v2 - Improved with Direct Booking Engine URLs
 * 
 * SOLUTIONS IMPLEMENTED:
 * 1. Francis House: Direct ThinkReservations URL (bypasses iframe)
 * 2. The George: Booking.com fallback (bypasses Cloudflare)
 * 3. McClelland House: Direct Stay Wanderful URL (bypasses iframe)
 * 4. White House Napa: Direct website (already working)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PROPERTIES = [
  {
    id: 'francis-house',
    name: 'The Francis House',
    rooms: 8,
    // KEY FIX: Use ThinkReservations direct URL instead of iframe
    directUrlPattern: (checkIn, checkOut) => 
      `https://secure.thinkreservations.com/thefrancishouse/reservations/availability?start_date=${checkIn}&end_date=${checkOut}&number_of_adults=2`,
    scrapeMethod: 'thinkreservations',
    fallbackUrl: 'https://www.booking.com/hotel/us/the-francis-house.html',
    baseRates: { low: 687, high: 1050 }
  },
  {
    id: 'white-house-napa',
    name: 'White House Napa',
    rooms: 17,
    directUrlPattern: (checkIn, checkOut) => 
      `https://whitehousenapa.com/`,
    scrapeMethod: 'direct',
    fallbackUrl: 'https://www.booking.com/hotel/us/white-house-napa.html',
    baseRates: { low: 299, high: 486 }
  },
  {
    id: 'the-george',
    name: 'The George Napa',
    rooms: 9,
    // KEY FIX: Skip direct site (Cloudflare), go straight to Booking.com
    directUrlPattern: (checkIn, checkOut) => 
      `https://www.booking.com/hotel/us/the-george-napa.html?checkin=${checkIn}&checkout=${checkOut}&group_adults=2`,
    scrapeMethod: 'booking.com',
    fallbackUrl: null, // No fallback - Booking.com is primary
    baseRates: { low: 350, high: 700 }
  },
  {
    id: 'mcclelland-house',
    name: 'McClelland House',
    rooms: 5,
    // KEY FIX: Use Stay Wanderful direct URL
    directUrlPattern: (checkIn, checkOut) => 
      `https://app.staywanderful.com/en/reservation/jAQOZs?check-in=${checkIn}&check-out=${checkOut}`,
    scrapeMethod: 'staywanderful',
    fallbackUrl: null,
    baseRates: { low: 350, high: 650 }
  }
];

// Generate 52 date pairs (2 nights per week for 6 months)
function generateDatePairs() {
  const pairs = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-06-30');
  
  let current = new Date(startDate);
  while (current <= endDate) {
    // Wednesday night (mid-week)
    const midWeek = new Date(current);
    midWeek.setDate(current.getDate() + (3 - current.getDay() + 7) % 7);
    if (midWeek <= endDate) {
      const checkOut = new Date(midWeek);
      checkOut.setDate(checkOut.getDate() + 1);
      pairs.push({
        checkIn: midWeek.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        dayType: 'midweek'
      });
    }
    
    // Saturday night (weekend)
    const weekend = new Date(current);
    weekend.setDate(current.getDate() + (6 - current.getDay() + 7) % 7);
    if (weekend <= endDate) {
      const checkOut = new Date(weekend);
      checkOut.setDate(checkOut.getDate() + 1);
      pairs.push({
        checkIn: weekend.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        dayType: 'weekend'
      });
    }
    
    current.setDate(current.getDate() + 7);
  }
  
  return pairs;
}

// ThinkReservations scraper (Francis House)
async function scrapeThinkReservations(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('[class*="rate"]', { timeout: 10000 });
    
    // Extract rates from the page
    const rates = await page.evaluate(() => {
      const rateElements = document.querySelectorAll('[class*="rate"]');
      const prices = [];
      rateElements.forEach(el => {
        const text = el.textContent;
        const match = text.match(/\$([0-9,]+\.?[0-9]*)/);
        if (match) {
          prices.push(parseFloat(match[1].replace(',', '')));
        }
      });
      return prices;
    });
    
    return {
      success: true,
      source: 'direct',
      lowestRate: Math.min(...rates),
      allRates: rates
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Booking.com scraper (The George)
async function scrapeBookingCom(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for prices to load
    await page.waitForFunction(
      () => document.body.innerText.includes('$') || document.body.innerText.includes('Show prices'),
      { timeout: 15000 }
    );
    
    // Check if we need to click "Show prices"
    const showPricesBtn = await page.$('button:has-text("Show prices")');
    if (showPricesBtn) {
      await showPricesBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // Extract rates
    const rates = await page.evaluate(() => {
      const prices = [];
      const priceElements = document.querySelectorAll('[data-testid="price-and-discounted-price"], .bui-price-display__value, .prco-val498');
      priceElements.forEach(el => {
        const match = el.textContent.match(/\$([0-9,]+)/);
        if (match) {
          prices.push(parseFloat(match[1].replace(',', '')));
        }
      });
      return prices;
    });
    
    if (rates.length > 0) {
      return {
        success: true,
        source: 'booking.com',
        lowestRate: Math.min(...rates),
        allRates: rates
      };
    }
    
    return { success: false, error: 'No rates found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Stay Wanderful scraper (McClelland House)
async function scrapeStayWanderful(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Look for rate displays
    const rates = await page.evaluate(() => {
      const prices = [];
      const elements = document.querySelectorAll('[class*="price"], [class*="rate"]');
      elements.forEach(el => {
        const match = el.textContent.match(/\$([0-9,]+)/);
        if (match) {
          prices.push(parseFloat(match[1].replace(',', '')));
        }
      });
      return prices;
    });
    
    if (rates.length > 0) {
      return {
        success: true,
        source: 'direct',
        lowestRate: Math.min(...rates),
        allRates: rates
      };
    }
    
    return { success: false, error: 'No rates found in Stay Wanderful' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Estimate rate based on seasonality
function estimateRate(property, date, dayType) {
  const month = new Date(date).getMonth() + 1;
  const { low, high } = property.baseRates;
  
  // Seasonal adjustments
  let seasonMultiplier = 1.0;
  if (month >= 5 && month <= 10) seasonMultiplier = 1.4; // Peak
  else if (month >= 3 && month <= 4) seasonMultiplier = 1.2; // Shoulder
  else if (month === 11 || month === 12) seasonMultiplier = 1.1; // Holiday
  
  // Day of week adjustment
  const dayMultiplier = dayType === 'weekend' ? 1.15 : 1.0;
  
  // Calculate estimated rate
  const baseRate = low + (high - low) * (seasonMultiplier - 0.8) / 0.6;
  return Math.round(baseRate * dayMultiplier);
}

// Main scraping function
async function scrapeAllProperties() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  const datePairs = generateDatePairs();
  const results = [];
  const log = [];
  
  console.log(`\n🚀 Starting scrape: ${PROPERTIES.length} properties × ${datePairs.length} dates = ${PROPERTIES.length * datePairs.length} data points\n`);
  
  for (const property of PROPERTIES) {
    console.log(`\n📊 Processing: ${property.name}`);
    let successCount = 0;
    let estimatedCount = 0;
    
    for (let i = 0; i < datePairs.length; i++) {
      const { checkIn, checkOut, dayType } = datePairs[i];
      const url = property.directUrlPattern(checkIn, checkOut);
      
      let result;
      
      // Try primary method
      switch (property.scrapeMethod) {
        case 'thinkreservations':
          result = await scrapeThinkReservations(page, url);
          break;
        case 'booking.com':
          result = await scrapeBookingCom(page, url);
          break;
        case 'staywanderful':
          result = await scrapeStayWanderful(page, url);
          break;
        default:
          result = { success: false, error: 'Unknown method' };
      }
      
      // Fallback to estimation if scraping fails
      if (!result.success) {
        const estimatedRate = estimateRate(property, checkIn, dayType);
        result = {
          success: true,
          source: 'estimated',
          lowestRate: estimatedRate,
          allRates: [estimatedRate]
        };
        estimatedCount++;
      } else {
        successCount++;
      }
      
      results.push({
        propertyId: property.id,
        propertyName: property.name,
        checkIn,
        checkOut,
        dayType,
        ...result
      });
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`  ${i + 1}/${datePairs.length} dates processed`);
      }
      
      // Anti-detection delay
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
    }
    
    log.push({
      property: property.name,
      totalDates: datePairs.length,
      directScraped: successCount,
      estimated: estimatedCount,
      successRate: `${((successCount / datePairs.length) * 100).toFixed(1)}%`
    });
    
    console.log(`  ✅ ${successCount} direct, ⚙️ ${estimatedCount} estimated`);
  }
  
  await browser.close();
  
  // Save results
  const outputPath = path.join(__dirname, '../data/competitor-rates-v2.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    scrapedAt: new Date().toISOString(),
    totalDataPoints: results.length,
    summary: log,
    results
  }, null, 2));
  
  console.log(`\n✅ Scraping complete! Results saved to: ${outputPath}`);
  console.log('\n📊 Summary:');
  log.forEach(l => {
    console.log(`  ${l.property}: ${l.directScraped}/${l.totalDates} direct (${l.successRate})`);
  });
}

// Run if called directly
if (require.main === module) {
  scrapeAllProperties().catch(console.error);
}

module.exports = { scrapeAllProperties, generateDatePairs, PROPERTIES };

