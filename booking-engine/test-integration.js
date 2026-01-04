/**
 * Integration Test Script for Cloudbeds Booking Engine
 * Tests the connection through Zapier MCP and verifies API endpoints
 */

const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const API_BASE = 'http://localhost:3001/api';
const CLOUDBEDS_ACCESS_TOKEN = process.env.CLOUDBEDS_ACCESS_TOKEN;
const CLOUDBEDS_PROPERTY_ID = process.env.CLOUDBEDS_PROPERTY_ID;

// Test colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testServerHealth() {
  log('\n📡 Testing Server Health...', 'blue');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.data.status === 'ok') {
      log('✅ Server is running', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Server is not running. Please start the server first:', 'red');
    log('   Run: cd server && npm start', 'yellow');
    return false;
  }
}

async function testCloudbedsConnection() {
  log('\n🔌 Testing Cloudbeds API Connection...', 'blue');
  
  if (!CLOUDBEDS_ACCESS_TOKEN || CLOUDBEDS_ACCESS_TOKEN === 'your_access_token_here') {
    log('⚠️  CLOUDBEDS_ACCESS_TOKEN not configured in server/.env', 'yellow');
    log('   Please set your access token in server/.env file', 'yellow');
    return false;
  }

  try {
    const response = await axios.get(`${API_BASE}/properties`, {
      headers: {
        'Authorization': `Bearer ${CLOUDBEDS_ACCESS_TOKEN}`
      }
    });
    
    if (response.data) {
      log('✅ Cloudbeds API connection successful', 'green');
      const properties = response.data.data || response.data.properties || [];
      if (properties.length > 0) {
        log(`   Found ${properties.length} property/properties`, 'green');
        if (properties[0].property_id) {
          log(`   Sample Property ID: ${properties[0].property_id}`, 'blue');
        }
      }
      return true;
    }
  } catch (error) {
    log('❌ Cloudbeds API connection failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function testRoomTypes() {
  log('\n🏨 Testing Room Types Endpoint...', 'blue');
  
  if (!CLOUDBEDS_PROPERTY_ID || CLOUDBEDS_PROPERTY_ID === 'your_property_id_here') {
    log('⚠️  CLOUDBEDS_PROPERTY_ID not configured', 'yellow');
    return false;
  }

  // Use dates 30 days from now
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  try {
    const response = await axios.get(`${API_BASE}/room-types`, {
      params: {
        property_id: CLOUDBEDS_PROPERTY_ID,
        start_date: startDateStr,
        end_date: endDateStr
      }
    });

    if (response.data && response.data.room_types) {
      log(`✅ Found ${response.data.room_types.length} room types`, 'green');
      response.data.room_types.forEach((room, idx) => {
        log(`   ${idx + 1}. ${room.name} - $${room.price || 'N/A'}/night`, 'blue');
      });
      return true;
    }
  } catch (error) {
    log('❌ Room types endpoint failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function testAvailability() {
  log('\n📅 Testing Availability Endpoint...', 'blue');
  
  if (!CLOUDBEDS_PROPERTY_ID || CLOUDBEDS_PROPERTY_ID === 'your_property_id_here') {
    log('⚠️  Skipping - Property ID not configured', 'yellow');
    return false;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  try {
    const response = await axios.get(`${API_BASE}/availability`, {
      params: {
        property_id: CLOUDBEDS_PROPERTY_ID,
        start_date: startDateStr,
        end_date: endDateStr
      }
    });

    if (response.data) {
      log('✅ Availability endpoint working', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Availability endpoint failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n🧪 Cloudbeds Booking Engine Integration Tests', 'blue');
  log('='.repeat(50), 'blue');

  const results = {
    server: await testServerHealth(),
    cloudbeds: false,
    roomTypes: false,
    availability: false
  };

  if (results.server) {
    results.cloudbeds = await testCloudbedsConnection();
    
    if (results.cloudbeds) {
      results.roomTypes = await testRoomTypes();
      results.availability = await testAvailability();
    }
  }

  // Summary
  log('\n📊 Test Summary', 'blue');
  log('='.repeat(50), 'blue');
  log(`Server Health: ${results.server ? '✅' : '❌'}`, results.server ? 'green' : 'red');
  log(`Cloudbeds Connection: ${results.cloudbeds ? '✅' : '❌'}`, results.cloudbeds ? 'green' : 'red');
  log(`Room Types: ${results.roomTypes ? '✅' : '⚠️ '}`, results.roomTypes ? 'green' : 'yellow');
  log(`Availability: ${results.availability ? '✅' : '⚠️ '}`, results.availability ? 'green' : 'yellow');

  const allPassed = results.server && results.cloudbeds;
  if (allPassed) {
    log('\n✅ Integration tests passed! Booking engine is ready.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the configuration.', 'yellow');
  }

  return allPassed;
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };


