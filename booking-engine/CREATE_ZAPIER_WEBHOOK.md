# 🔗 Create Zapier Webhook for Booking Engine

## Quick Setup (5 Minutes)

### Step 1: Create the Webhook Zap

1. **Go to Zapier:**
   - Visit: https://zapier.com/apps
   - Click **"Create Zap"**

2. **Set Up Trigger:**
   - Search: **"Webhooks by Zapier"**
   - Choose: **"Catch Hook"**
   - Click **"Continue"**
   - **Copy the webhook URL** (looks like: `https://hooks.zapier.com/hooks/catch/12345/abcde/`)
   - ⚠️ **SAVE THIS URL** - you'll need it!

3. **Test the Trigger:**
   - Click **"Test trigger"**
   - Send a test webhook (or skip for now)
   - Click **"Continue"**

### Step 2: Add Cloudbeds Action

1. **Search for Action:**
   - Search: **"Cloudbeds"**
   - Choose your connected Cloudbeds account

2. **Choose Action Event:**
   For room types, choose one of:
   - **"Get Reservations"** (can filter by dates)
   - **"Find Reservation"** (search)
   - Or create multiple Zaps for different endpoints

3. **Configure Action:**
   - Map the webhook data to Cloudbeds fields
   - For room types, you might need to:
     - Use `queryParams.start_date` from webhook
     - Use `queryParams.end_date` from webhook
     - Or hardcode property ID if you have one

4. **Test the Action:**
   - Click **"Test action"**
   - Verify it returns Cloudbeds data
   - Click **"Continue"**

5. **Turn on the Zap:**
   - Click **"Publish"** or **"Turn on Zap"**

### Step 3: Configure Booking Engine

Edit `server/.env`:

```env
USE_ZAPIER=true
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/
```

Replace `YOUR_WEBHOOK_ID` with the actual webhook URL from Step 1.

### Step 4: Restart Server

```bash
cd booking-engine/server
npm start
```

## 📋 Webhook Payload Format

The booking engine sends this to your webhook:

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

Your Zap should use this data to call Cloudbeds actions.

## 🎯 Recommended Zap Setup

### For Room Types Endpoint

**Trigger:** Webhook by Zapier (Catch Hook)

**Action:** Cloudbeds → Get Reservations
- Filter by dates from `queryParams.start_date` and `queryParams.end_date`
- This will return reservations which include room information

**Alternative:** Create a custom Cloudbeds action if available

### Multiple Zaps for Different Endpoints

You can create separate Zaps for:
- Room types → One webhook URL
- Availability → Another webhook URL  
- Create reservation → Another webhook URL

Then update the code to use different webhook URLs for different endpoints.

## ✅ Testing

After setup:

1. **Test Webhook:**
   ```bash
   curl -X POST https://hooks.zapier.com/hooks/catch/YOUR_ID/ \
        -H "Content-Type: application/json" \
        -d '{"method":"GET","endpoint":"/getRooms","queryParams":{"start_date":"2025-02-01"}}'
   ```

2. **Check Zap History:**
   - Go to Zapier dashboard
   - Check your Zap's history
   - Verify it's receiving requests and executing

3. **Test in Booking Engine:**
   - Refresh browser at http://localhost:3000
   - Select dates
   - Should now load rooms through Zapier!

## 🆘 Troubleshooting

**Webhook not receiving requests?**
- Check webhook URL is correct
- Verify Zap is turned on
- Check Zap history for errors

**Zap not executing Cloudbeds action?**
- Verify Cloudbeds account is connected
- Check action configuration
- Test the action manually

**Still getting errors?**
- Check server logs for detailed errors
- Verify webhook URL format
- Test webhook with curl first

## 💡 Pro Tip

Since Zapier MCP is connected, I can help you:
- Test the webhook connection
- Get your property ID
- Verify the setup works

Just ask me!


