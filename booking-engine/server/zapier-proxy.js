/**
 * Zapier MCP Proxy Service
 * Proxies Cloudbeds API requests through Zapier MCP
 * 
 * This service acts as a bridge between the booking engine
 * and Cloudbeds via Zapier MCP connection
 */

const axios = require('axios');

// Zapier MCP Configuration
// Get these from your Zapier MCP server settings at mcp.zapier.com
const ZAPIER_MCP_SERVER_URL = process.env.ZAPIER_MCP_SERVER_URL || '';
const ZAPIER_MCP_API_KEY = process.env.ZAPIER_MCP_API_KEY || '';

/**
 * Make a request to Cloudbeds through Zapier MCP
 * 
 * Note: This requires Zapier MCP to expose HTTP endpoints
 * Alternative: Use Zapier webhooks or REST API
 */
async function zapierCloudbedsRequest(method, endpoint, data = null, queryParams = {}) {
  try {
    // Option 1: If Zapier MCP exposes HTTP endpoints
    if (ZAPIER_MCP_SERVER_URL) {
      const url = `${ZAPIER_MCP_SERVER_URL}/cloudbeds${endpoint}`;
      const config = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${ZAPIER_MCP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: queryParams
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data };
    }

    // Option 2: Use Zapier Webhook (if configured)
    // This would require setting up a Zap that triggers on webhook
    // and calls Cloudbeds API
    
    // Option 3: Use Zapier REST API
    // Requires Zapier account API key
    
    throw new Error('Zapier MCP server URL not configured. See setup instructions.');
    
  } catch (error) {
    console.error('Zapier Proxy Error:', error.message);
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Alternative: Use Zapier Webhook approach
 * This requires setting up a Zap that:
 * 1. Trigger: Webhook by Zapier (Catch Hook)
 * 2. Action: Cloudbeds (via Zapier integration)
 */
async function zapierWebhookRequest(webhookUrl, payload) {
  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 500
    };
  }
}

module.exports = {
  zapierCloudbedsRequest,
  zapierWebhookRequest
};


