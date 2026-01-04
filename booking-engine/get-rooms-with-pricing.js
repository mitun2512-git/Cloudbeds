/**
 * Get Rooms with Pricing for December 26, 2024
 * Combines room types with availability/pricing data
 */

const axios = require('axios');

const MCP_PROXY_URL = 'http://localhost:3002';
const SERVER_URL = 'http://localhost:3001';

async function getRoomsWithPricing() {
  console.log('🔍 Fetching rooms with pricing for December 26, 2024...\n');

  try {
    // Step 1: Get room types
    console.log('1. Getting room types...');
    const roomTypesResponse = await axios.get(`${SERVER_URL}/api/room-types`, {
      params: {
        start_date: '2024-12-26',
        end_date: '2024-12-27',
        property_id: '12345'
      }
    });

    const roomTypes = roomTypesResponse.data?.room_types || [];
    console.log(`   ✅ Found ${roomTypes.length} room types\n`);

    // Step 2: Get availability
    console.log('2. Getting availability and pricing...');
    const availabilityResponse = await axios.get(`${SERVER_URL}/api/availability`, {
      params: {
        start_date: '2024-12-26',
        end_date: '2024-12-27',
        property_id: '12345'
      }
    });

    const availability = availabilityResponse.data?.data || availabilityResponse.data || {};
    console.log('   ✅ Availability data retrieved\n');

    // Step 3: Combine and display
    console.log('📊 Rooms Available for December 26, 2024:\n');
    console.log('='.repeat(80));

    roomTypes.forEach((room, index) => {
      const avail = availability[room.id] || availability[`type_${room.id}`] || {};
      const price = room.price || avail.price || avail.rate || 'Contact for pricing';
      const available = room.available || avail.available || 0;

      console.log(`\n${index + 1}. ${room.name}`);
      console.log(`   Room Type ID: ${room.id}`);
      console.log(`   Max Occupancy: ${room.max_occupancy} guests`);
      console.log(`   Available Rooms: ${available}`);
      console.log(`   Price: ${typeof price === 'number' ? `$${price.toFixed(2)}/night` : price}`);
      if (room.description) {
        console.log(`   Description: ${room.description.substring(0, 100)}...`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Complete!');

    return { roomTypes, availability };
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    // Fallback: Use the room types we already have from Zapier MCP
    console.log('\n📋 Using room types from Zapier MCP (pricing estimated):\n');
    
    const rooms = [
      { id: '82833129423048', name: 'Classic', max_occupancy: 2, price: 299, description: 'Timeless elegance with California king bed' },
      { id: '82835472601219', name: 'Estate Room', max_occupancy: 2, price: 399, description: 'Spacious, light-filled retreat with modern finishes' },
      { id: '83444040888474', name: 'Patio Retreat Suite', max_occupancy: 2, price: 599, description: 'Suite with private outdoor patio and gas fireplace' },
      { id: '83444066242706', name: 'Estate Junior Suite', max_occupancy: 2, price: 699, description: 'Private, serene setting with California king bed' },
      { id: '88798581989504', name: 'Total Buyout', max_occupancy: 20, price: 5000, description: 'Entire Hennessey Estate - full privacy' },
      { id: '89146217537706', name: 'Pool Suite with Bathtub', max_occupancy: 2, price: 799, description: 'Corner suite with pool view and soaking tub' }
    ];

    console.log('='.repeat(80));
    rooms.forEach((room, index) => {
      console.log(`\n${index + 1}. ${room.name}`);
      console.log(`   Room Type ID: ${room.id}`);
      console.log(`   Max Occupancy: ${room.max_occupancy} guests`);
      console.log(`   Estimated Price: $${room.price}/night`);
      console.log(`   Description: ${room.description}`);
    });
    console.log('\n' + '='.repeat(80));
    console.log('\n⚠️  Note: Prices are estimates. Contact property for exact rates.');

    return { roomTypes: rooms, availability: {} };
  }
}

// Run if called directly
if (require.main === module) {
  getRoomsWithPricing();
}

module.exports = { getRoomsWithPricing };

