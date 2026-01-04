/**
 * MCP Request Processor
 * 
 * This module automatically processes pending MCP requests by:
 * 1. Checking for pending requests
 * 2. Processing them through Zapier MCP
 * 3. Submitting results back
 * 
 * Note: This runs as a background service and requires the AI assistant
 * to be available to process requests through Zapier MCP tools.
 */

const axios = require('axios');

const MCP_PROXY_URL = process.env.MCP_PROXY_URL || 'http://localhost:3002';
const PROCESS_INTERVAL = 5000; // Check every 5 seconds

let processingInterval = null;

/**
 * Process a single pending request
 * 
 * Note: This function doesn't actually process requests - it just logs them.
 * The AI assistant must process requests using Zapier MCP tools.
 * This is just for monitoring purposes.
 */
async function processRequest(request) {
  const { requestId, method, endpoint, data, queryParams } = request;
  
  // Don't actually process - just log that requests are pending
  // The AI assistant will process them via Zapier MCP
  console.log(`[MCP Processor] Request ${requestId} pending: ${method} ${endpoint}`);
  console.log(`[MCP Processor] AI assistant should process this via Zapier MCP`);
  
  // Return null to indicate no automatic processing
  return null;
}

/**
 * Check and process pending requests
 */
async function checkAndProcessPending() {
  try {
    const response = await axios.get(`${MCP_PROXY_URL}/mcp/pending`);
    const { pending } = response.data;
    
    if (pending && pending.length > 0) {
      console.log(`[MCP Processor] Found ${pending.length} pending request(s)`);
      
      // Process the oldest request first
      const oldestRequest = pending.sort((a, b) => a.age - b.age)[0];
      
      // Log pending requests - AI assistant will process them
      if (oldestRequest.age > 2000) {
        await processRequest(oldestRequest);
        // Don't submit results - AI assistant handles that
      }
    }
  } catch (error) {
    // Silently handle errors - the processor will retry on next interval
    if (error.code !== 'ECONNREFUSED') {
      console.error('[MCP Processor] Error checking pending:', error.message);
    }
  }
}

/**
 * Start the MCP processor
 */
function start() {
  if (processingInterval) {
    return; // Already running
  }
  
  console.log('[MCP Processor] Starting request monitor...');
  console.log('[MCP Processor] Requests are queued and will be processed by AI assistant via Zapier MCP');
  console.log('[MCP Processor] Monitor endpoint: http://localhost:3002/mcp/pending');
  
  // Check immediately
  checkAndProcessPending();
  
  // Then check periodically
  processingInterval = setInterval(checkAndProcessPending, PROCESS_INTERVAL);
}

/**
 * Stop the MCP processor
 */
function stop() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    console.log('[MCP Processor] Stopped');
  }
}

module.exports = {
  start,
  stop,
  processRequest,
  checkAndProcessPending
};

