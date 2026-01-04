# 🔐 Configure Zapier MCP Authentication for Cloudbeds

## Overview

This guide will help you configure Zapier MCP authentication so the booking engine can access Cloudbeds through Zapier MCP.

## Step 1: Access Zapier MCP Configuration

Your Zapier MCP server is already set up. Access the configuration:

**URL:** https://mcp.zapier.com/mcp/servers/9681181d-51bc-4e71-8668-6d1a59f91346/config

1. **Log in to Zapier** (if not already logged in)
2. Navigate to the configuration page above

## Step 2: Add Cloudbeds API Request Tool

1. **Click "Add Actions" or "Edit Tools"**
2. **Search for "Cloudbeds"**
3. **Select "Cloudbeds API Request"** (or `cloudbeds_api_request_beta`)
4. **Enable the tool**

## Step 3: Connect Cloudbeds Account

### Option A: Through Zapier MCP Interface

1. In the Zapier MCP config page, look for **"Connections"** or **"Apps"**
2. Click **"Add Connection"** or **"Connect App"**
3. Search for **"Cloudbeds"**
4. Click **"Connect Cloudbeds"**
5. Sign in to your Cloudbeds account
6. Authorize Zapier to access your Cloudbeds data

### Option B: Through Zapier Main App

1. Go to [zapier.com/apps](https://zapier.com/apps)
2. Search for **"Cloudbeds"**
3. Click **"Connect Cloudbeds + Zapier"**
4. Sign in to Cloudbeds
5. Authorize the connection
6. The connection will be available in Zapier MCP

## Step 4: Configure OAuth (If Required)

If Cloudbeds requires OAuth2:

1. **Get Cloudbeds OAuth Credentials:**
   - Go to [developers.cloudbeds.com](https://developers.cloudbeds.com/)
   - Create an OAuth application
   - Get `CLIENT_ID` and `CLIENT_SECRET`

2. **Add to Zapier MCP:**
   - In MCP config, add environment variables:
     - `CLOUDBEDS_CLIENT_ID`
     - `CLOUDBEDS_CLIENT_SECRET`

## Step 5: Test the Connection

After connecting, test it:

```bash
# Test via MCP tool
curl -X POST http://localhost:3002/mcp/cloudbeds \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","endpoint":"/getProperties"}'
```

Then check if the AI assistant can process it via Zapier MCP.

## Step 6: Verify Authentication

1. **Check pending requests:**
   ```bash
   curl http://localhost:3002/mcp/pending
   ```

2. **AI assistant processes via Zapier MCP**
   - I'll automatically process pending requests
   - Using `mcp_Zapier_cloudbeds_api_request_beta` tool

3. **Verify results:**
   ```bash
   curl http://localhost:3002/mcp/result/{requestId}
   ```

## Troubleshooting

### Issue: "The app returned Cloudbeds.com - Soluções online para hotéis e pousadas"

**Solution:** Cloudbeds account not connected. Follow Step 3 to connect your Cloudbeds account in Zapier.

### Issue: "Request timeout"

**Solution:** 
- Ensure Cloudbeds is connected in Zapier
- Check that the API Request tool is enabled
- Verify OAuth credentials if required

### Issue: "404 Page Not Found"

**Solution:**
- Verify the API endpoint is correct
- Check that your Cloudbeds account has API access
- Ensure proper authentication

## Quick Setup Checklist

- [ ] Logged into Zapier MCP config page
- [ ] Added Cloudbeds API Request tool
- [ ] Connected Cloudbeds account in Zapier
- [ ] Configured OAuth (if required)
- [ ] Tested connection
- [ ] Verified requests are processed

## Next Steps

Once authentication is configured:

1. **Test the booking engine:**
   ```bash
   curl http://localhost:3001/api/properties
   ```

2. **Open the booking engine:**
   - http://localhost:3000
   - Select dates
   - Search for rooms

3. **All requests will go through Zapier MCP!**

## Support

If you encounter issues:
1. Check Zapier MCP server logs
2. Verify Cloudbeds connection status
3. Test API endpoints directly
4. Check server logs: `tail -f booking-engine/server/server.log`

