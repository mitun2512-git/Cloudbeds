/**
 * Zapier MCP Bridge
 * 
 * This module provides a way for the Node.js server to use Zapier MCP
 * by creating a bridge pattern where:
 * 
 * 1. Server makes request to MCP proxy endpoint
 * 2. AI assistant (via MCP) processes the request
 * 3. Result is returned to server
 * 
 * Alternative: Use Zapier MCP HTTP API if available
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const MCP_PROXY_URL = process.env.MCP_PROXY_URL || 'http://localhost:3002';
const USE_MCP_PROXY = process.env.USE_MCP_PROXY === 'true' || process.env.USE_MCP_PROXY === true;

/**
 * Make Cloudbeds request through MCP proxy
 * 
 * This sends a request to the MCP proxy, which will be processed
 * by the AI assistant through Zapier MCP tools.
 * 
 * The function polls for results until the AI assistant processes it.
 */
async function requestViaMCPProxy(method, endpoint, data = null, queryParams = {}) {
  if (!USE_MCP_PROXY) {
    throw new Error('MCP proxy not enabled. Set USE_MCP_PROXY=true in .env');
  }

  try {
    console.log(`[MCP Proxy] Requesting: ${method} ${endpoint}`);
    
    // Submit request to MCP proxy
    // For getRoomsAvailability, pass data as form-urlencoded string
    let requestData = data;
    if (endpoint.includes('getRoomsAvailability') && data && typeof data === 'object') {
      // Convert to form-urlencoded string
      const formData = new URLSearchParams();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      requestData = formData.toString();
    }
    
    const response = await axios.post(`${MCP_PROXY_URL}/mcp/cloudbeds`, {
      method,
      endpoint,
      data: requestData,
      queryParams,
      customHeaders: endpoint.includes('getRoomsAvailability') ? {
        'Content-Type': 'application/x-www-form-urlencoded'
      } : {}
    }, {
      timeout: 5000
    });

    const requestId = response.data.requestId;
    console.log(`[MCP Proxy] Request queued: ${requestId}`);

    // Poll for result (AI assistant will process and submit result)
    const maxAttempts = 60; // 60 attempts
    const pollInterval = 1000; // 1 second
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

      try {
        const resultResponse = await axios.get(`${MCP_PROXY_URL}/mcp/result/${requestId}`);
        const result = resultResponse.data;

        if (result.status === 'completed' && result.result) {
          console.log(`[MCP Proxy] Result received for ${requestId}`);
          return result.result; // { success, data, error, status }
        }

        if (result.status === 'failed') {
          return {
            success: false,
            error: result.result?.error || 'Request failed',
            status: result.result?.status || 500
          };
        }

        // Still pending, continue polling
        if (attempts % 10 === 0) {
          console.log(`[MCP Proxy] Still waiting for ${requestId}... (${attempts}s)`);
        }
      } catch (pollError) {
        // Request not found or still pending
        if (pollError.response?.status !== 404) {
          console.error(`[MCP Proxy] Poll error:`, pollError.message);
        }
      }
    }

    // Timeout
    return {
      success: false,
      error: 'Request timeout - AI assistant did not process request in time',
      status: 504
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Check if result is ready for a request
 */
async function checkMCPResult(requestId) {
  try {
    const response = await axios.get(`${MCP_PROXY_URL}/mcp/result/${requestId}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * Alternative: Direct MCP HTTP API (if Zapier exposes it)
 */
async function requestViaMCPAPI(method, endpoint, data = null, queryParams = {}) {
  const MCP_SERVER_URL = process.env.ZAPIER_MCP_SERVER_URL;
  const MCP_API_KEY = process.env.ZAPIER_MCP_API_KEY;

  if (!MCP_SERVER_URL || !MCP_API_KEY) {
    throw new Error('Zapier MCP server URL and API key required');
  }

  try {
    // Format: https://mcp.zapier.com/api/v1/tools/{tool_id}/execute
    // This would require knowing the tool ID for Cloudbeds API Request
    const url = `${MCP_SERVER_URL}/api/v1/tools/cloudbeds-api-request/execute`;
    
    const response = await axios.post(url, {
      method,
      url: `https://hotels.cloudbeds.com/api/v1.1${endpoint}`,
      data,
      queryParams
    }, {
      headers: {
        'Authorization': `Bearer ${MCP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 500
    };
  }
}

module.exports = {
  requestViaMCPProxy,
  requestViaMCPAPI,
  checkMCPResult
};

