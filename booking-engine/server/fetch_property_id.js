const axios = require('axios');
const https = require('https');
require('dotenv').config();

const token = process.env.CLOUDBEDS_ACCESS_TOKEN;

// Bypass SSL validation for dev environment
const agent = new https.Agent({  
  rejectUnauthorized: false
});

async function getPropertyId() {
  try {
    console.log('Trying getReservations to see if token works and find property ID...');
    const response = await axios.get('https://hotels.cloudbeds.com/api/v1.2/getReservations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      httpsAgent: agent
    });
    
    console.log('Reservations Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
       // Look for property ID in the response
       const data = response.data.data;
       if (data && data.length > 0) {
         console.log('Found Property ID from reservation:', data[0].propertyID);
       }
    }
  } catch (error) {
    console.error('Error fetching reservations:', error.response ? error.response.data : error.message);
  }
}

getPropertyId();

