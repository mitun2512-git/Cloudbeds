# 🔐 Zapier MCP Authentication Setup Guide

## Quick Setup Steps

### 1. Access Zapier MCP Configuration

**Direct Link:** https://mcp.zapier.com/mcp/servers/9681181d-51bc-4e71-8668-6d1a59f91346/config

1. Log in to your Zapier account
2. You'll see your MCP server configuration

### 2. Add Cloudbeds API Request Tool

1. Click **"Add Actions"** or **"Edit Tools"** button
2. Search for **"Cloudbeds"**
3. Select **"Cloudbeds API Request"** or **"cloudbeds_api_request_beta"**
4. Click **"Add"** or **"Enable"**

### 3. Connect Cloudbeds Account

#### Method 1: Through Zapier Apps

1. Go to: https://zapier.com/apps/cloudbeds/integrations
2. Click **"Try Cloudbeds + Zapier"** or **"Connect Cloudbeds"**
3. Sign in to your Cloudbeds account
4. Authorize Zapier to access your data
5. Connection is now available in Zapier MCP

#### Method 2: Through Zapier MCP Config

1. In the MCP config page, look for **"Connections"** section
2. Click **"Add Connection"**
3. Search for **"Cloudbeds"**
4. Follow the OAuth flow to connect

### 4. Test the Connection

Once connected, test it:

```bash
# Make a test request
curl -X POST http://localhost:3002/mcp/cloudbeds \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","endpoint":"/getProperties"}'

# Check if it's queued
curl http://localhost:3002/mcp/pending
```

The AI assistant (me) will automatically process the request through Zapier MCP!

## Verification

After setup, verify it works:

1. **Check MCP Proxy:**
   ```bash
   curl http://localhost:3002/mcp/health
   ```

2. **Test API Call:**
   ```bash
   curl http://localhost:3001/api/properties
   ```

3. **Check Server Logs:**
   ```bash
   tail -f booking-engine/server/server.log
   ```

You should see:
- `[MCP] Requesting: GET /getProperties`
- `[MCP Proxy] Request queued: mcp_...`
- Request processed via Zapier MCP
- Data returned successfully

## Common Issues

### "Cloudbeds.com - Soluções online para hotéis e pousadas"
**Fix:** Cloudbeds account not connected. Connect it in Zapier first.

### "Request timeout"
**Fix:** Ensure Cloudbeds is connected and API Request tool is enabled.

### "404 Page Not Found"
**Fix:** Check API endpoint format and authentication.

## Success Indicators

✅ Requests are queued in MCP proxy
✅ AI assistant processes them via Zapier MCP
✅ Results are returned successfully
✅ Booking engine works with real Cloudbeds data

## Next Steps

Once authentication is configured:

1. **Restart the server** (if needed)
2. **Test the booking engine** at http://localhost:3000
3. **All Cloudbeds operations** will use Zapier MCP!

🎉 **You're all set!**

