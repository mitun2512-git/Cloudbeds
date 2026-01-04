/**
 * Zapier Integration for Cloudbeds Booking Engine
 * 
 * This module provides a way to access Cloudbeds through Zapier
 * without needing direct Cloudbeds API credentials.
 * 
 * NOTE: This uses Zapier Webhooks, not Zapier MCP directly.
 * 
 * Zapier MCP (Model Context Protocol) is for AI assistants only.
 * For Node.js servers, we use Zapier Webhooks which still access
 * Cloudbeds through your Zapier connection, just via HTTP.
 * 
 * Setup Options:
 * 1. Use Zapier Webhooks (Current - Recommended for servers)
 * 2. Use Zapier REST API (Alternative)
 * 3. Use Zapier MCP HTTP endpoints (If Zapier exposes MCP via HTTP)
 */

const axios = require('axios');

// Configuration
const USE_ZAPIER_WEBHOOK = process.env.USE_ZAPIER_WEBHOOK === 'true';
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL || '';
const ZAPIER_API_KEY = process.env.ZAPIER_API_KEY || '';

/**
 * Make Cloudbeds API request through Zapier Webhook
 * 
 * Setup Required:
 * 1. Create a Zap in Zapier:
 *    - Trigger: Webhook by Zapier (Catch Hook)
 *    - Action: Cloudbeds (your connected account)
 * 2. Copy the webhook URL to ZAPIER_WEBHOOK_URL
 * 
 * The webhook receives requests and triggers Cloudbeds actions.
 * For different endpoints, you may need multiple Zaps or use a single Zap
 * that routes based on the payload.
 */
async function requestViaWebhook(method, endpoint, data = null, queryParams = {}) {
  if (!ZAPIER_WEBHOOK_URL) {
    throw new Error('ZAPIER_WEBHOOK_URL not configured. Set up a Zapier webhook first. See ZAPIER_SETUP.md');
  }

  // Format the request for Zapier webhook
  // The webhook will receive this and trigger the appropriate Cloudbeds action
  const payload = {
    method: method,
    endpoint: endpoint,
    data: data,
    queryParams: queryParams,
    timestamp: new Date().toISOString()
  };

  try {
    console.log(`Making request through Zapier webhook: ${method} ${endpoint}`);
    const response = await axios.post(ZAPIER_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Zapier webhook returns the result from Cloudbeds action
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Zapier webhook error:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Zapier webhook request failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

/**
 * Make Cloudbeds API request through Zapier REST API
 * 
 * Setup Required:
 * 1. Get API key from: https://zapier.com/app/settings/integrations
 * 2. Set ZAPIER_API_KEY in .env
 */
async function requestViaZapierAPI(method, endpoint, data = null, queryParams = {}) {
  if (!ZAPIER_API_KEY) {
    throw new Error('ZAPIER_API_KEY not configured. Get it from Zapier settings.');
  }

  // Zapier REST API endpoint for executing actions
  const zapierAPIUrl = 'https://hooks.zapier.com/hooks/catch/';
  
  // This would require a specific Zap setup
  // For now, we'll use the webhook approach which is simpler
  return requestViaWebhook(method, endpoint, data, queryParams);
}

/**
 * Main function to make Cloudbeds requests through Zapier
 */
async function cloudbedsViaZapier(method, endpoint, data = null, queryParams = {}) {
  if (USE_ZAPIER_WEBHOOK && ZAPIER_WEBHOOK_URL) {
    return await requestViaWebhook(method, endpoint, data, queryParams);
  }
  
  if (ZAPIER_API_KEY) {
    return await requestViaZapierAPI(method, endpoint, data, queryParams);
  }
  
  throw new Error('Zapier integration not configured. Set ZAPIER_WEBHOOK_URL or ZAPIER_API_KEY in .env');
}

module.exports = {
  cloudbedsViaZapier,
  requestViaWebhook,
  requestViaZapierAPI
};

