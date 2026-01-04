const axios = require('axios');
const https = require('https');

const TOKEN = 'cbat_XIvn71EZDUjAA0orkmFpxpTf5XxOa3ph';
const BASE_URL = 'https://hotels.cloudbeds.com/api/v1.2';

const agent = new https.Agent({  
  rejectUnauthorized: false
});

async function testEndpoint(endpoint) {
  console.log(`Testing ${endpoint}...`);
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json'
      },
      httpsAgent: agent
    });
    console.log(`Success! Status: ${response.status}`);
    console.log('Data:', JSON.stringify(response.data, null, 2).substring(0, 500));
  } catch (error) {
    console.error(`Error! Status: ${error.response?.status}`);
    console.error('Data:', typeof error.response?.data === 'string' ? error.response.data.substring(0, 500) : error.response?.data);
    if (error.response?.headers) {
        // console.log('Headers:', error.response.headers);
    }
    if (error.code) console.error('Error Code:', error.code);
  }
}

async function testPostEndpoint(endpoint, data) {
  console.log(`Testing POST ${endpoint}...`);
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded' // based on server code
      },
      httpsAgent: agent
    });
    console.log(`Success! Status: ${response.status}`);
    console.log('Data:', JSON.stringify(response.data, null, 2).substring(0, 500));
  } catch (error) {
    console.error(`Error! Status: ${error.response?.status}`);
    console.error('Data:', typeof error.response?.data === 'string' ? error.response.data.substring(0, 500) : error.response?.data);
     if (error.code) console.error('Error Code:', error.code);
  }
}

async function run() {
  await testEndpoint('/getRoomTypes');
  
  // Test getRatePlans for availability/pricing
  await testEndpoint('/getRatePlans?startDate=2025-12-29&endDate=2025-12-30');
}

run();

