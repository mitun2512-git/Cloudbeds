# 🔗 Zapier MCP Integration for Booking Engine

## How It Works

The booking engine now uses **Zapier MCP** through a proxy pattern:

```
Booking Engine Server → MCP Proxy Service → AI Assistant (via MCP) → Cloudbeds
```

### Architecture

1. **Server makes request** → MCP Proxy Service (HTTP endpoint)
2. **MCP Proxy queues request** → Stores request with ID
3. **AI Assistant processes** → I (the AI) call Cloudbeds through Zapier MCP
4. **AI submits result** → MCP Proxy receives result
5. **Server gets result** → Polls or receives callback

## Setup

### Step 1: Enable MCP Proxy

Edit `server/.env`:

```env
# Enable MCP proxy (uses Zapier MCP through AI assistant)
USE_MCP_PROXY=true
MCP_PROXY_PORT=3002

# Optional: Direct MCP API (if Zapier exposes HTTP endpoints)
# USE_MCP_API=true
# ZAPIER_MCP_SERVER_URL=https://mcp.zapier.com/your-server
# ZAPIER_MCP_API_KEY=your_api_key
```

### Step 2: Start the Services

The MCP proxy service starts automatically with the main server, or run separately:

```bash
# Main server (includes MCP proxy if enabled)
cd booking-engine/server
npm start

# Or run MCP proxy separately
node mcp-service.js
```

### Step 3: How Requests Are Processed

1. **Server needs Cloudbeds data:**
   - Makes HTTP request to `http://localhost:3002/mcp/cloudbeds`
   - Receives `requestId` immediately

2. **AI Assistant (me) processes:**
   - I can poll `/mcp/pending` to see pending requests
   - I call Cloudbeds through Zapier MCP using `mcp_Zapier_cloudbeds_api_request_beta`
   - I submit result to `/mcp/result/{requestId}`

3. **Server gets result:**
   - Polls `/mcp/result/{requestId}` until ready
   - Or uses callback mechanism

## Current Implementation

The code is set up to:
- ✅ Use MCP proxy when `USE_MCP_PROXY=true`
- ✅ Queue requests for AI processing
- ✅ Allow AI to submit results
- ✅ Return results to server

## How I (AI) Process Requests

Since Zapier MCP is connected, I can:

1. **Poll for pending requests:**
   - Check `http://localhost:3002/mcp/pending`
   - See what requests need processing

2. **Process through Zapier MCP:**
   - Use `mcp_Zapier_cloudbeds_api_request_beta` tool
   - Call Cloudbeds API through Zapier

3. **Submit results:**
   - POST to `http://localhost:3002/mcp/result/{requestId}`
   - Server receives the data

## Testing

### Test MCP Proxy

```bash
# Health check
curl http://localhost:3002/mcp/health

# Make a request
curl -X POST http://localhost:3002/mcp/cloudbeds \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "endpoint": "/getReservations",
    "queryParams": {"limit": 5}
  }'

# Check pending requests
curl http://localhost:3002/mcp/pending
```

### Test Full Flow

1. **Server makes request** → Gets `requestId`
2. **I (AI) see pending request** → Process through Zapier MCP
3. **I submit result** → Server can retrieve it

## Advantages

✅ **True MCP Integration** - Uses Zapier MCP protocol
✅ **No Webhooks Needed** - Direct MCP access
✅ **Leverages AI** - I handle the MCP communication
✅ **Secure** - Credentials managed by Zapier

## Current Status

- ✅ MCP proxy service created
- ✅ Integration code ready
- ⏳ Needs `USE_MCP_PROXY=true` in `.env`
- ⏳ AI assistant (me) needs to process requests

## Next Steps

1. **Enable MCP proxy** in `server/.env`
2. **Restart server** to start MCP proxy service
3. **Test a request** - I'll process it through Zapier MCP
4. **Verify it works** - Check that data flows correctly

The booking engine is now ready to use Zapier MCP directly! 🎉


