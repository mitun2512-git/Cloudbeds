/**
 * Zapier MCP Service
 * 
 * This service runs alongside the main server and handles MCP requests.
 * It provides HTTP endpoints that can be called, and processes requests
 * through Zapier MCP (via AI assistant).
 * 
 * Run this as a separate service or integrate into main server.
 */

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.MCP_PROXY_PORT || 3002;

// Store for pending requests
const requests = new Map();

/**
 * Endpoint for server to make Cloudbeds requests via MCP
 */
app.post('/mcp/cloudbeds', async (req, res) => {
  const { method, endpoint, data, queryParams } = req.body;
  const requestId = `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store request
  requests.set(requestId, {
    method,
    endpoint,
    data,
    queryParams,
    timestamp: Date.now(),
    status: 'pending'
  });

  console.log(`[MCP Service] New request: ${requestId} - ${method} ${endpoint}`);

  // Return request ID - AI assistant will process this
  res.json({
    requestId,
    status: 'queued',
    message: 'Request queued. AI assistant will process through Zapier MCP.',
    endpoint: `/mcp/result/${requestId}`
  });
});

/**
 * Endpoint for AI assistant to submit results
 * This is called by the AI after processing through MCP
 */
app.post('/mcp/result/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { success, data, error, status } = req.body;

  const request = requests.get(requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  request.status = success ? 'completed' : 'failed';
  request.result = { success, data, error, status };
  request.completedAt = Date.now();

  console.log(`[MCP Service] Result for ${requestId}: ${success ? 'success' : 'failed'}`);

  res.json({ status: 'received', requestId });
});

/**
 * Get result for a request
 */
app.get('/mcp/result/:requestId', (req, res) => {
  const { requestId } = req.params;
  const request = requests.get(requestId);

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (request.status === 'pending') {
    return res.json({
      status: 'pending',
      message: 'Request is being processed by AI assistant via Zapier MCP'
    });
  }

  res.json({
    status: request.status,
    result: request.result,
    request: {
      method: request.method,
      endpoint: request.endpoint
    }
  });
});

/**
 * Get all pending requests (for AI assistant to process)
 */
app.get('/mcp/pending', (req, res) => {
  const pending = Array.from(requests.entries())
    .filter(([_, req]) => req.status === 'pending')
    .map(([id, req]) => ({
      requestId: id,
      method: req.method,
      endpoint: req.endpoint,
      data: req.data,
      queryParams: req.queryParams,
      age: Date.now() - req.timestamp
    }));

  res.json({ pending, count: pending.length });
});

/**
 * Health check
 */
app.get('/mcp/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Zapier MCP Proxy',
    pendingRequests: Array.from(requests.values()).filter(r => r.status === 'pending').length,
    totalRequests: requests.size
  });
});

// Cleanup old requests
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  for (const [id, req] of requests.entries()) {
    if (now - req.timestamp > maxAge && req.status !== 'pending') {
      requests.delete(id);
    }
  }
}, 60000); // Every minute

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔗 Zapier MCP Proxy Service running on port ${PORT}`);
    console.log(`   Endpoint: http://localhost:${PORT}/mcp/cloudbeds`);
  });
}

module.exports = app;


