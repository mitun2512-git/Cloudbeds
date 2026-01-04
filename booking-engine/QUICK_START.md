# Quick Start Guide - Cloudbeds Booking Engine

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd booking-engine
npm run install-all
```

### Step 2: Configure

**Option A: Interactive Setup**
```bash
node configure.js
```

**Option B: Manual Setup**
1. Edit `server/.env`
2. Set `CLOUDBEDS_ACCESS_TOKEN` (get from Cloudbeds Developer Portal or Zapier)
3. Set `CLOUDBEDS_PROPERTY_ID` (get from your Cloudbeds account)

### Step 3: Start Server

```bash
npm run server
```

### Step 4: Test Connection

```bash
npm test
```

### Step 5: Start Frontend (New Terminal)

```bash
npm run client
```

### Step 6: Open Browser

Visit: http://localhost:3000

## 🔑 Getting Credentials

### Through Zapier MCP (Already Connected ✅)

Since Zapier MCP is connected, you can:

1. **Get Property ID:**
   - Ask me: "What's my Cloudbeds property ID?"
   - I can retrieve it from your reservations

2. **Test API:**
   - Ask me: "Test Cloudbeds API connection"
   - I'll verify everything works

### Through Cloudbeds Developer Portal

1. Visit [developers.cloudbeds.com](https://developers.cloudbeds.com/)
2. Create developer account
3. Create OAuth application
4. Get Client ID and Secret
5. Generate access token

## 🧪 Testing

### Quick Test
```bash
npm test
```

### Manual API Test
```bash
# Health check
curl http://localhost:3001/api/health

# Get properties
curl http://localhost:3001/api/properties
```

### Through Zapier MCP
Ask me to:
- "Get my Cloudbeds reservations"
- "Check room availability"
- "Test the booking engine API"

## 📝 Configuration File

Edit `server/.env`:

```env
CLOUDBEDS_ACCESS_TOKEN=your_token_here
CLOUDBEDS_PROPERTY_ID=your_property_id_here
PORT=3001
```

## ⚠️ Troubleshooting

**Server won't start?**
- Check Node.js is installed: `node --version`
- Verify port 3001 is available
- Check `.env` file exists in `server/` directory

**API errors?**
- Verify access token is correct
- Check property ID matches your account
- Ensure dates are in YYYY-MM-DD format

**Need help?**
- Run `npm test` for diagnostics
- Check `SETUP_AND_TEST.md` for detailed guide
- Ask me through Zapier MCP!

## ✅ Next Steps

1. ✅ Configure credentials
2. ✅ Start server
3. ✅ Test connection
4. ✅ Start frontend
5. ✅ Test booking flow

Ready to go! 🎉


