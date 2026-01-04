# 🔗 Setting Up Zapier Integration for Cloudbeds

This guide shows you how to configure the booking engine to use Zapier MCP instead of direct Cloudbeds API credentials.

## ✅ Benefits

- ✅ No need for direct Cloudbeds API credentials
- ✅ Uses your existing Zapier MCP connection
- ✅ More secure (credentials managed by Zapier)
- ✅ Easier setup

## 🚀 Quick Setup (Webhook Method - Recommended)

### Step 1: Create a Zapier Webhook Zap

1. **Go to Zapier:**
   - Visit: https://zapier.com/apps
   - Click "Create Zap"

2. **Set Up Trigger:**
   - Search for "Webhooks by Zapier"
   - Choose "Catch Hook"
   - Copy the webhook URL (you'll need this)

3. **Set Up Action:**
   - Search for "Cloudbeds"
   - Choose your Cloudbeds account (already connected via Zapier MCP)
   - Select the action you need (e.g., "Get Reservations", "Get Rooms")

4. **Test the Zap:**
   - Send a test webhook
   - Verify it works

5. **Turn on the Zap**

### Step 2: Configure the Booking Engine

Edit `server/.env`:

```env
# Enable Zapier integration
USE_ZAPIER=true

# Your Zapier webhook URL (from Step 1)
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/

# Optional: Property ID (can get from Zapier or Cloudbeds)
CLOUDBEDS_PROPERTY_ID=your_property_id_here

# Server config
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Restart Server

```bash
cd booking-engine/server
# Stop current server
lsof -ti:3001 | xargs kill -9
# Restart
npm start
```

## 🔧 Alternative: Using Zapier REST API

If you prefer using Zapier's REST API:

1. **Get API Key:**
   - Go to: https://zapier.com/app/settings/integrations
   - Generate API key

2. **Configure:**
   ```env
   USE_ZAPIER=true
   ZAPIER_API_KEY=your_zapier_api_key
   ```

## 📋 Webhook Payload Format

The booking engine sends requests in this format:

```json
{
  "method": "GET",
  "endpoint": "/getRooms/12345",
  "data": null,
  "queryParams": {
    "start_date": "2025-02-01",
    "end_date": "2025-02-03"
  }
}
```

Your Zap should parse this and call the appropriate Cloudbeds action.

## 🧪 Testing

After setup, test the connection:

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test room types (should work through Zapier now)
curl "http://localhost:3001/api/room-types?start_date=2025-02-01&end_date=2025-02-03"
```

## 🎯 Current Status

Since Zapier MCP is already connected to Cursor, you can:

1. **Use the webhook method** (recommended for production)
2. **I can help test** through Zapier MCP directly
3. **Get property ID** through Zapier if needed

## 💡 Tips

- The webhook URL is unique to each Zap
- You can create multiple Zaps for different endpoints
- Test each Zap before using in production
- Monitor Zap history for errors

## 🆘 Troubleshooting

**Webhook not receiving requests?**
- Check webhook URL is correct
- Verify Zap is turned on
- Check Zap history for errors

**Zap not executing?**
- Verify Cloudbeds account is connected in Zapier
- Test the Zap manually
- Check Zap logs

**Still getting errors?**
- Check server logs for detailed error messages
- Verify webhook URL format
- Test webhook with a simple curl request

## ✅ Success!

Once configured, the booking engine will use Zapier instead of direct API credentials, making it more secure and easier to manage!


