/**
 * Validate Pricing Fix - December 28, 2024
 * Tests the corrected API format for getting availability and pricing
 */

const axios = require('axios');

const PROPERTY_ID = '49705993547975';
const START_DATE = '2024-12-28';
const END_DATE = '2024-12-29';
const SERVER_URL = 'http://localhost:3001';
const MCP_PROXY = 'http://localhost:3002';

async function validatePricing() {
  console.log('🧪 Validating Pricing Fix for December 28, 2024\n');
  console.log('='.repeat(80));
  console.log(`Property ID: ${PROPERTY_ID}`);
  console.log(`Date: ${START_DATE}`);
  console.log('='.repeat(80) + '\n');

  try {
    // Test 1: Get room types with pricing
    console.log('📋 Test 1: Getting room types with pricing...\n');
    const roomTypesRes = await axios.get(`${SERVER_URL}/api/room-types`, {
      params: {
        property_id: PROPERTY_ID,
        start_date: START_DATE,
        end_date: END_DATE
      },
      timeout: 30000
    });

    const roomTypes = roomTypesRes.data?.room_types || [];
    console.log(`✅ Found ${roomTypes.length} room types\n`);

    if (roomTypes.length > 0) {
      console.log('📊 Rooms Available for December 28, 2024:\n');
      console.log('-'.repeat(80));
      
      roomTypes.forEach((room, index) => {
        console.log(`\n${index + 1}. ${room.name || 'Room'}`);
        console.log(`   ID: ${room.id || 'N/A'}`);
        console.log(`   Max Occupancy: ${room.max_occupancy || 'N/A'} guests`);
        console.log(`   Available: ${room.available !== undefined ? room.available : 'N/A'} room(s)`);
        
        if (room.price !== null && room.price !== undefined) {
          console.log(`   ✅ Price: $${typeof room.price === 'number' ? room.price.toFixed(2) : room.price}/night`);
        } else {
          console.log(`   ⚠️  Price: Not available`);
        }
        
        if (room.description) {
          console.log(`   Description: ${room.description.substring(0, 80)}...`);
        }
      });
      
      console.log('\n' + '-'.repeat(80));
      
      // Count rooms with pricing
      const withPricing = roomTypes.filter(r => r.price !== null && r.price !== undefined).length;
      console.log(`\n✅ Rooms with pricing: ${withPricing}/${roomTypes.length}`);
      
      if (withPricing === roomTypes.length) {
        console.log('🎉 SUCCESS: All rooms have pricing information!');
      } else if (withPricing > 0) {
        console.log(`⚠️  PARTIAL: ${roomTypes.length - withPricing} rooms missing pricing`);
      } else {
        console.log('❌ ISSUE: No rooms have pricing information');
      }
    } else {
      console.log('⚠️  No room types returned');
    }

    // Test 2: Get availability directly
    console.log('\n\n📋 Test 2: Getting availability directly...\n');
    try {
      const availabilityRes = await axios.post(`${SERVER_URL}/api/availability`, 
        `property_id=${PROPERTY_ID}&start_date=${START_DATE}&end_date=${END_DATE}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000
        }
      );

      const availability = availabilityRes.data?.data || availabilityRes.data || {};
      console.log('✅ Availability data received');
      console.log(`   Data keys: ${Object.keys(availability).length}`);
      
      if (Object.keys(availability).length > 0) {
        console.log('\n📊 Availability Summary:\n');
        Object.keys(availability).slice(0, 5).forEach(key => {
          const avail = availability[key];
          console.log(`   ${key}:`);
          console.log(`     Available: ${avail.available !== undefined ? avail.available : 'N/A'}`);
          console.log(`     Rate: ${avail.rate !== undefined ? `$${avail.rate}` : 'N/A'}`);
          console.log(`     Price: ${avail.price !== undefined ? `$${avail.price}` : 'N/A'}`);
        });
      }
    } catch (availError) {
      console.log(`⚠️  Availability endpoint: ${availError.response?.data?.error || availError.message}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Validation Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('\n⚠️  This may indicate the server needs to be restarted or MCP proxy needs processing');
  }
}

// Run
if (require.main === module) {
  validatePricing();
}

module.exports = { validatePricing };

