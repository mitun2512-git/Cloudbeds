# ⚡ Quick Zapier Setup (5 Minutes)

## Why Use Zapier?

✅ **No direct Cloudbeds API credentials needed**
✅ **Uses your existing Zapier MCP connection**
✅ **More secure - credentials managed by Zapier**
✅ **Easier to set up**

## 🚀 Setup Steps

### Step 1: Create Zapier Webhook (2 minutes)

1. Go to: https://zapier.com/apps
2. Click **"Create Zap"**
3. **Trigger:** Search "Webhooks by Zapier" → Choose **"Catch Hook"**
4. **Copy the webhook URL** (looks like: `https://hooks.zapier.com/hooks/catch/12345/abcde/`)

### Step 2: Add Cloudbeds Action (2 minutes)

1. **Action:** Search "Cloudbeds" → Choose your connected account
2. **Action Event:** Choose "Get Rooms" or "Get Reservations"
3. **Test the Zap** to make sure it works
4. **Turn on the Zap**

### Step 3: Configure Booking Engine (1 minute)

Edit `server/.env`:

```env
USE_ZAPIER=true
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/
```

### Step 4: Restart Server

```bash
cd booking-engine/server
lsof -ti:3001 | xargs kill -9
npm start
```

## ✅ Done!

The booking engine now uses Zapier instead of direct API credentials!

## 🆘 Need Help?

- **Get Property ID:** Ask me - I can retrieve it through Zapier MCP
- **Test Connection:** Ask me to test the Cloudbeds connection
- **Troubleshooting:** See ZAPIER_SETUP.md for detailed help

## 💡 Pro Tip

Since Zapier MCP is already connected, I can help you:
- Get your property ID
- Test API endpoints
- Verify the connection works

Just ask me!


