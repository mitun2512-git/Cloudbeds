# 🔐 Setup Zapier MCP Authentication for Cloudbeds

## Current Status

❌ **Cloudbeds account not connected in Zapier MCP**

The error message "Cloudbeds.com - Soluções online para hotéis e pousadas" indicates that your Cloudbeds account needs to be connected in Zapier.

## Step-by-Step Setup

### Step 1: Log into Zapier

1. Go to: https://zapier.com/app/login
2. Log in with your Zapier account credentials
3. If you don't have an account, sign up at: https://zapier.com/sign-up

### Step 2: Connect Cloudbeds to Your Zapier Account

**Option A: Through Zapier Apps Page (Recommended)**

1. Go to: https://zapier.com/apps/cloudbeds/integrations
2. Click **"Start free with email"** or **"Continue with Google"**
3. You'll be prompted to create a Zap
4. When selecting Cloudbeds as a trigger/action, you'll be asked to connect your account
5. Click **"Connect Cloudbeds"**
6. Sign in to your Cloudbeds account
7. Authorize Zapier to access your Cloudbeds data
8. Your Cloudbeds account is now connected!

**Option B: Through Zapier MCP Config**

1. Go to: https://mcp.zapier.com/mcp/servers/9681181d-51bc-4e71-8668-6d1a59f91346/config
2. Log in if prompted
3. Look for **"Connections"** or **"Apps"** section
4. Click **"Add Connection"** or **"Connect App"**
5. Search for **"Cloudbeds"**
6. Click **"Connect"** and follow the OAuth flow

### Step 3: Enable Cloudbeds API Request Tool in Zapier MCP

1. Go to: https://mcp.zapier.com/mcp/servers/9681181d-51bc-4e71-8668-6d1a59f91346/config
2. Click **"Add Actions"** or **"Edit Tools"**
3. Search for **"Cloudbeds"**
4. Find **"API Request (Beta)"** or **"cloudbeds_api_request_beta"**
5. Click **"Add"** or **"Enable"**
6. The tool should now be available

### Step 4: Verify Connection

After connecting, test the connection:

```bash
# Make a test request
curl -X POST http://localhost:3002/mcp/cloudbeds \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","endpoint":"/getProperties"}'

# Check if it's queued
curl http://localhost:3002/mcp/pending
```

The AI assistant will process the request via Zapier MCP. If successful, you should see property data returned.

### Step 5: Test the Booking Engine

Once authentication is working:

```bash
# Test the API
curl http://localhost:3001/api/properties

# Open the booking engine
open http://localhost:3000
```

## Troubleshooting

### Error: "Cloudbeds.com - Soluções online para hotéis e pousadas"

**Cause:** Cloudbeds account not connected in Zapier

**Solution:**
1. Go to https://zapier.com/apps/cloudbeds/integrations
2. Connect your Cloudbeds account
3. Ensure the connection is active

### Error: "Request timeout"

**Cause:** AI assistant couldn't process the request

**Solution:**
1. Check that Cloudbeds is connected
2. Verify API Request tool is enabled
3. Check server logs: `tail -f booking-engine/server/server.log`

### Error: "404 Page Not Found"

**Cause:** Incorrect API endpoint or authentication issue

**Solution:**
1. Verify the endpoint format: `/getProperties` (not `/api/v1.1/getProperties`)
2. Check Cloudbeds connection status
3. Ensure proper OAuth scopes

## Quick Checklist

- [ ] Logged into Zapier
- [ ] Connected Cloudbeds account in Zapier
- [ ] Enabled API Request tool in Zapier MCP
- [ ] Tested connection
- [ ] Verified booking engine works

## What Happens After Setup

Once authentication is configured:

1. ✅ All API requests go through Zapier MCP
2. ✅ No direct Cloudbeds credentials needed
3. ✅ Secure authentication via Zapier
4. ✅ Full Cloudbeds API access
5. ✅ Booking engine works with real data

## Need Help?

If you encounter issues:

1. Check Zapier connection status
2. Verify Cloudbeds account is active
3. Test API endpoints directly
4. Review server logs

## Next Steps

After completing setup:

1. **Restart the server** (if needed)
2. **Test the booking engine** at http://localhost:3000
3. **All Cloudbeds operations** will use Zapier MCP!

🎉 **You're all set!**

