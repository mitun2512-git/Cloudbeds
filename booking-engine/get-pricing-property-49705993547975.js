/**
 * Get Rooms with Pricing for Property 49705993547975
 * December 26, 2024
 */

const axios = require('axios');

const PROPERTY_ID = '49705993547975';
const START_DATE = '2024-12-26';
const END_DATE = '2024-12-27';
const MCP_PROXY = 'http://localhost:3002';
const SERVER = 'http://localhost:3001';

async function getRoomsWithPricing() {
  console.log('🏨 Getting Rooms with Pricing');
  console.log(`Property ID: ${PROPERTY_ID}`);
  console.log(`Date: ${START_DATE}\n`);
  console.log('='.repeat(80));

  try {
    // Step 1: Get room types (we already have these)
    console.log('\n📋 Room Types Available:\n');
    
    const roomTypes = [
      { id: '82833129423048', name: 'Classic', max_occupancy: 2 },
      { id: '82835472601219', name: 'Estate Room', max_occupancy: 2 },
      { id: '83444040888474', name: 'Patio Retreat Suite', max_occupancy: 2 },
      { id: '83444066242706', name: 'Estate Junior Suite', max_occupancy: 2 },
      { id: '88798581989504', name: 'Total Buyout', max_occupancy: 20 },
      { id: '89146217537706', name: 'Pool Suite with Bathtub', max_occupancy: 2 }
    ];

    // Step 2: Try to get availability via API
    console.log('\n💰 Attempting to get pricing from API...\n');
    
    try {
      const availabilityRes = await axios.get(`${SERVER}/api/availability`, {
        params: {
          property_id: PROPERTY_ID,
          start_date: START_DATE,
          end_date: END_DATE
        },
        timeout: 10000
      });

      const availability = availabilityRes.data?.data || availabilityRes.data || {};
      console.log('✅ Availability data received from API\n');

      // Combine room types with availability
      roomTypes.forEach((room, index) => {
        const avail = availability[room.id] || availability[`type_${room.id}`] || {};
        const price = avail.price || avail.rate || avail.base_rate || null;
        const available = avail.available || avail.rooms_available || 0;

        console.log(`${index + 1}. ${room.name}`);
        console.log(`   Room Type ID: ${room.id}`);
        console.log(`   Max Occupancy: ${room.max_occupancy} guests`);
        console.log(`   Available: ${available} room(s)`);
        console.log(`   Price: ${price ? `$${typeof price === 'number' ? price.toFixed(2) : price}/night` : 'Contact for pricing'}`);
        console.log('');
      });

    } catch (apiError) {
      console.log('⚠️  API call failed, using estimated pricing\n');
      
      // Fallback: Estimated pricing
      const estimatedPrices = {
        '82833129423048': 299,  // Classic
        '82835472601219': 399,  // Estate Room
        '83444040888474': 599,  // Patio Retreat Suite
        '83444066242706': 699,  // Estate Junior Suite
        '88798581989504': 5000, // Total Buyout
        '89146217537706': 799   // Pool Suite
      };

      roomTypes.forEach((room, index) => {
        const price = estimatedPrices[room.id] || 'Contact for pricing';
        console.log(`${index + 1}. ${room.name}`);
        console.log(`   Room Type ID: ${room.id}`);
        console.log(`   Max Occupancy: ${room.max_occupancy} guests`);
        console.log(`   Estimated Price: ${typeof price === 'number' ? `$${price}/night` : price}`);
        console.log('');
      });
    }

    console.log('='.repeat(80));
    console.log('\n✅ Complete!');
    console.log(`\n📅 Date: ${START_DATE}`);
    console.log(`🏨 Property ID: ${PROPERTY_ID}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run
if (require.main === module) {
  getRoomsWithPricing();
}

module.exports = { getRoomsWithPricing };

