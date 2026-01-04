/**
 * Zapier MCP Proxy Service
 * 
 * This service bridges the Node.js server with Zapier MCP.
 * Since MCP is for AI assistants, this creates a proxy pattern:
 * 
 * Server → MCP Proxy Endpoint → AI Assistant (via MCP) → Cloudbeds
 * 
 * The proxy exposes HTTP endpoints that the server can call,
 * and uses MCP tools to actually fetch data from Cloudbeds.
 */

const express = require('express');
const axios = require('axios');

const mcpProxyApp = express();
mcpProxyApp.use(express.json());

// Store pending requests (requestId -> { resolve, reject, timestamp })
const pendingRequests = new Map();
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Clean up old requests
setInterval(() => {
  const now = Date.now();
  for (const [id, request] of pendingRequests.entries()) {
    if (now - request.timestamp > REQUEST_TIMEOUT) {
      request.reject(new Error('Request timeout'));
      pendingRequests.delete(id);
    }
  }
}, 5000);

/**
 * Proxy endpoint that the server calls
 * This will be handled by the AI assistant through MCP
 */
mcpProxyApp.post('/mcp/cloudbeds', async (req, res) => {
  const { method, endpoint, data, queryParams } = req.body;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store the request for the AI to process
  const requestPromise = new Promise((resolve, reject) => {
    pendingRequests.set(requestId, {
      resolve,
      reject,
      timestamp: Date.now(),
      method,
      endpoint,
      data,
      queryParams
    });
  });

  // Return request ID immediately
  res.json({
    requestId,
    status: 'pending',
    message: 'Request queued for MCP processing. AI assistant will process this through Zapier MCP.'
  });

  // Wait for AI to process (with timeout)
  try {
    const result = await Promise.race([
      requestPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
      )
    ]);
    
    // Result will be set by the AI assistant
    return result;
  } catch (error) {
    pendingRequests.delete(requestId);
    throw error;
  }
});

/**
 * Endpoint for AI assistant to submit results
 * Called by AI through MCP or direct HTTP
 */
mcpProxyApp.post('/mcp/result/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { success, data, error } = req.body;

  const request = pendingRequests.get(requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (success) {
    request.resolve({ success: true, data });
  } else {
    request.reject(new Error(error || 'Request failed'));
  }

  pendingRequests.delete(requestId);
  res.json({ status: 'processed' });
});

/**
 * Get pending requests (for AI assistant to poll)
 */
mcpProxyApp.get('/mcp/pending', (req, res) => {
  const pending = Array.from(pendingRequests.entries()).map(([id, req]) => ({
    requestId: id,
    method: req.method,
    endpoint: req.endpoint,
    data: req.data,
    queryParams: req.queryParams,
    age: Date.now() - req.timestamp
  }));

  res.json({ pending });
});

/**
 * Health check
 */
mcpProxyApp.get('/mcp/health', (req, res) => {
  res.json({
    status: 'ok',
    pendingRequests: pendingRequests.size,
    timestamp: new Date().toISOString()
  });
});

module.exports = mcpProxyApp;


