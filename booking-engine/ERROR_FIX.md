# ❌ Error Fix: "Failed to load rooms"

## 🔍 Problem Identified

The error occurs because **Cloudbeds API credentials are not configured**. The `.env` file still has placeholder values.

## ✅ Quick Fix

### Method 1: Interactive Setup (Easiest)

```bash
cd booking-engine
./setup-credentials.sh
```

Follow the prompts to enter your credentials.

### Method 2: Manual Edit

```bash
cd booking-engine/server
nano .env  # or use your preferred editor
```

Update these lines:
```env
CLOUDBEDS_ACCESS_TOKEN=your_actual_token_here
CLOUDBEDS_PROPERTY_ID=your_actual_property_id_here
```

### Method 3: Get Credentials Through Zapier

Since Zapier MCP is connected, I can help you:
- Get your property ID
- Test the API connection
- Verify credentials work

Just ask me!

## 📋 Where to Get Credentials

### Access Token
1. **Cloudbeds Developer Portal:**
   - Visit: https://developers.cloudbeds.com/
   - Sign in or create account
   - Create OAuth application
   - Generate access token

2. **Cloudbeds Dashboard:**
   - Go to: https://myfrontdesk.cloudbeds.com
   - Settings → Integrations → API
   - Create/generate API key

### Property ID
1. **Cloudbeds Dashboard:**
   - Go to: https://myfrontdesk.cloudbeds.com
   - Settings → Property Settings
   - Your Property ID is displayed there

2. **From Reservations:**
   - Check any reservation in your account
   - Property ID is in the reservation details

## 🔄 After Updating Credentials

**Restart the server:**

```bash
# Stop current server (find process)
lsof -ti:3001 | xargs kill -9

# Restart server
cd booking-engine/server
npm start
```

Or restart both server and client:

```bash
cd booking-engine
# Stop both
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Restart
npm run dev
```

## 🧪 Test After Fix

1. **Refresh browser** at http://localhost:3000
2. **Select dates** again
3. **Check browser console** (F12) for any errors
4. **Check server logs** for API responses

## 📊 Improved Error Messages

I've updated the code to show better error messages:
- ✅ Clear message if credentials are missing
- ✅ Specific error for invalid token
- ✅ Helpful hints on how to fix

The error message will now tell you exactly what's wrong!

## ✅ Success Indicators

After fixing, you should see:
- ✅ Rooms loading successfully
- ✅ No error messages
- ✅ Room cards displaying with prices
- ✅ Can proceed to booking form

## 🆘 Still Having Issues?

1. **Check server logs** for detailed error messages
2. **Verify credentials** are correct (no extra spaces)
3. **Test API directly:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://hotels.cloudbeds.com/api/v1.1/getProperties
   ```
4. **Ask me for help** - I can test through Zapier MCP!


