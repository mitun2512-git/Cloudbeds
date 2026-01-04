# 🤖 How I Process MCP Requests

## Overview

When the booking engine server makes a request through the MCP proxy, I (the AI assistant) process it using Zapier MCP tools.

## The Flow

```
1. Server → POST /mcp/cloudbeds → Request queued
2. AI Assistant → GET /mcp/pending → See pending requests
3. AI Assistant → Zapier MCP Tool → Call Cloudbeds API
4. AI Assistant → POST /mcp/result/{requestId} → Submit result
5. Server → GET /mcp/result/{requestId} → Get data
```

## How I Process Requests

### Step 1: Check for Pending Requests

I can check what requests are waiting:

```bash
curl http://localhost:3002/mcp/pending
```

This returns:
```json
{
  "pending": [
    {
      "requestId": "mcp_1234567890_abc123",
      "method": "GET",
      "endpoint": "/getRooms/12345",
      "data": null,
      "queryParams": {},
      "age": 5000
    }
  ],
  "count": 1
}
```

### Step 2: Process Through Zapier MCP

For each pending request, I use the Zapier MCP tool:

```javascript
// Example: Get rooms
mcp_Zapier_cloudbeds_api_request_beta({
  method: "GET",
  url: "https://hotels.cloudbeds.com/api/v1.1/getRooms/12345",
  instructions: "Get rooms for property 12345",
  output_hint: "Room data with IDs, names, and types"
})
```

### Step 3: Submit Result

After getting the data from Cloudbeds, I submit it back:

```bash
curl -X POST http://localhost:3002/mcp/result/mcp_1234567890_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "success": true,
    "data": { /* Cloudbeds response */ },
    "status": 200
  }'
```

## Example: Processing a Get Rooms Request

1. **Server makes request:**
   ```bash
   curl -X POST http://localhost:3002/mcp/cloudbeds \
     -d '{"method":"GET","endpoint":"/getRooms/12345"}'
   ```
   Returns: `{"requestId": "mcp_123_abc", "status": "queued"}`

2. **I check pending:**
   ```bash
   curl http://localhost:3002/mcp/pending
   ```
   See: Request for `/getRooms/12345`

3. **I call Cloudbeds via Zapier MCP:**
   - Use `mcp_Zapier_cloudbeds_api_request_beta`
   - Method: GET
   - URL: `https://hotels.cloudbeds.com/api/v1.1/getRooms/12345`

4. **I submit result:**
   ```bash
   curl -X POST http://localhost:3002/mcp/result/mcp_123_abc \
     -d '{"success": true, "data": {...}, "status": 200}'
   ```

5. **Server gets result:**
   - Polls `/mcp/result/mcp_123_abc`
   - Receives the data
   - Returns to frontend

## Automation

I can automatically:
- ✅ Monitor pending requests
- ✅ Process them through Zapier MCP
- ✅ Submit results back

This creates a seamless integration where the server uses Zapier MCP through me!

## Current Status

The system is ready! When you:
1. Open the booking engine (http://localhost:3000)
2. Select dates
3. Request rooms

The server will queue a request, and I'll process it through Zapier MCP! 🎉


