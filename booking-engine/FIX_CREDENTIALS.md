# 🔧 Fix: "Failed to load rooms" Error

## Problem

The error "Failed to load rooms. Please try again." occurs because Cloudbeds API credentials are not configured.

## Solution

### Step 1: Get Your Cloudbeds Credentials

**Option A: Through Cloudbeds Dashboard**
1. Log in to: https://myfrontdesk.cloudbeds.com
2. Go to Settings → Property Settings
3. Find your Property ID
4. Go to Settings → Integrations → API
5. Create/generate an API access token

**Option B: Through Cloudbeds Developer Portal**
1. Visit: https://developers.cloudbeds.com/
2. Sign in or create account
3. Create OAuth application
4. Generate access token

**Option C: Through Zapier (if using Zapier integration)**
- Access token is managed by Zapier
- Property ID can be retrieved from reservations

### Step 2: Update server/.env

Edit `booking-engine/server/.env`:

```env
# Replace with your actual credentials
CLOUDBEDS_ACCESS_TOKEN=your_actual_token_here
CLOUDBEDS_PROPERTY_ID=your_actual_property_id_here
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Restart the Server

```bash
# Stop the current server (Ctrl+C or kill process)
# Then restart:
cd booking-engine/server
npm start
```

Or restart both:

```bash
cd booking-engine
# Stop current processes
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Restart
npm run dev
```

## Verify Configuration

After updating credentials, test the connection:

```bash
# Test API health
curl http://localhost:3001/api/health

# Test properties endpoint (should work with valid token)
curl http://localhost:3001/api/properties
```

## Common Errors

### "Invalid or missing access token"
- ✅ Check CLOUDBEDS_ACCESS_TOKEN is set correctly
- ✅ Verify token hasn't expired
- ✅ Regenerate token if needed

### "Property not found"
- ✅ Check CLOUDBEDS_PROPERTY_ID is correct
- ✅ Verify property exists in your account
- ✅ Get property ID from Cloudbeds dashboard

### "401 Unauthorized"
- ✅ Access token is invalid or expired
- ✅ Token doesn't have required permissions
- ✅ Regenerate token from Cloudbeds

## Quick Fix Command

```bash
cd booking-engine/server
nano .env  # or use your preferred editor
# Update the credentials
# Save and restart server
```

## Need Help Getting Credentials?

Ask me:
- "Get my Cloudbeds property ID"
- "Help me get Cloudbeds API credentials"
- "Test Cloudbeds API connection"

I can help retrieve information through Zapier MCP!


