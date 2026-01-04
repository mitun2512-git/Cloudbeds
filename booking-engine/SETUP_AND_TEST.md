# Setup and Test Guide for Cloudbeds Booking Engine

This guide will help you configure and test the booking engine integration with Cloudbeds through Zapier.

## Prerequisites

1. **Node.js** installed (v14 or higher)
2. **Cloudbeds Account** with API access
3. **Zapier MCP** connected (already done ✅)

## Step 1: Install Dependencies

```bash
cd booking-engine

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 2: Get Cloudbeds Credentials

### Option A: Through Zapier MCP (Recommended)

Since Zapier MCP is already connected, you can get your credentials:

1. **Get Property ID:**
   - The property ID is available through Zapier MCP
   - It's the same ID used in your reservations
   - Format: Usually a string like `:censored:14:af3aac2535:`

2. **Get Access Token:**
   - Go to [mcp.zapier.com](https://mcp.zapier.com/)
   - Check your MCP server settings
   - The access token is managed by Zapier automatically
   - For direct API access, you may need to get it from Cloudbeds Developer Portal

### Option B: Direct Cloudbeds API

1. Go to [developers.cloudbeds.com](https://developers.cloudbeds.com/)
2. Create/access your developer account
3. Create an OAuth application
4. Get your Client ID and Client Secret
5. Generate an access token

## Step 3: Configure Environment Variables

Edit `server/.env`:

```bash
cd server
# Edit .env file with your credentials
```

Set these values:

```env
CLOUDBEDS_ACCESS_TOKEN=your_actual_access_token
CLOUDBEDS_PROPERTY_ID=your_property_id
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

**Important:** 
- Replace `your_actual_access_token` with your real Cloudbeds access token
- Replace `your_property_id` with your actual property ID
- Never commit the `.env` file to version control

## Step 4: Start the Server

```bash
# From booking-engine/server directory
npm start
```

You should see:
```
🚀 Booking Engine API Server running on port 3001
📡 Cloudbeds API: https://hotels.cloudbeds.com/api/v1.1
🏨 Property ID: your_property_id
```

## Step 5: Test the Integration

### Quick Test Script

Run the test script:

```bash
# From booking-engine directory
node test-integration.js
```

This will test:
- ✅ Server health
- ✅ Cloudbeds API connection
- ✅ Room types endpoint
- ✅ Availability endpoint

### Manual API Testing

#### Test 1: Health Check
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

#### Test 2: Get Properties
```bash
curl http://localhost:3001/api/properties
```

#### Test 3: Get Room Types (with dates)
```bash
curl "http://localhost:3001/api/room-types?start_date=2024-02-01&end_date=2024-02-03&property_id=YOUR_PROPERTY_ID"
```

#### Test 4: Get Availability
```bash
curl "http://localhost:3001/api/availability?start_date=2024-02-01&end_date=2024-02-03&property_id=YOUR_PROPERTY_ID"
```

## Step 6: Start the Frontend

In a new terminal:

```bash
cd booking-engine/client
npm start
```

The React app will open at http://localhost:3000

## Step 7: Test the Full Booking Flow

1. **Select Dates:**
   - Open http://localhost:3000
   - Choose check-in and check-out dates
   - Click "Search Rooms"

2. **View Rooms:**
   - You should see available rooms
   - Check pricing and availability
   - Select a room

3. **Enter Guest Info:**
   - Fill in guest details
   - Continue to payment

4. **Payment:**
   - Enter test payment information
   - Submit booking

5. **Confirmation:**
   - Verify reservation is created
   - Check confirmation details

## Testing Through Zapier MCP

You can also test Cloudbeds operations directly through Zapier MCP:

### Get Reservations
Ask me: "Get recent reservations from Cloudbeds"

### Get Rooms
Ask me: "Get rooms for property [property_id]"

### Create Test Reservation
Ask me: "Create a test reservation in Cloudbeds"

## Troubleshooting

### Server Won't Start

**Error: Port 3001 already in use**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9
```

### Cloudbeds API Errors

**Error: 401 Unauthorized**
- Check your access token is correct
- Verify token hasn't expired
- Regenerate token if needed

**Error: 404 Not Found**
- Verify property ID is correct
- Check API endpoint URLs
- Ensure property exists in your account

**Error: Invalid date format**
- Use YYYY-MM-DD format
- Ensure dates are in the future
- Check-in must be before check-out

### Room Types Not Showing

- Verify property has rooms configured
- Check dates are valid (not in the past)
- Ensure rooms are available for selected dates
- Verify API response format matches expected structure

### Payment Processing Issues

- Check Cloudbeds payment gateway configuration
- Verify payment endpoint is correct for your API version
- Test with Cloudbeds sandbox/test environment first
- Review Cloudbeds API documentation for payment requirements

## Using Zapier MCP for Testing

Since Zapier MCP is connected, you can test Cloudbeds operations through me:

1. **Test API Connection:**
   - Ask: "Test Cloudbeds API connection"
   - I'll verify the connection works

2. **Get Property Info:**
   - Ask: "Get my Cloudbeds properties"
   - I'll retrieve your property information

3. **Check Availability:**
   - Ask: "Check room availability for [dates]"
   - I'll check availability through Zapier

4. **Create Test Reservation:**
   - Ask: "Create a test reservation"
   - I'll create a reservation through Zapier

## Next Steps

Once everything is tested and working:

1. ✅ Customize the UI styling
2. ✅ Add more room filtering options
3. ✅ Implement additional payment methods
4. ✅ Add email notifications
5. ✅ Deploy to production

## Support

- **Cloudbeds API Docs**: [developers.cloudbeds.com](https://developers.cloudbeds.com/)
- **Zapier MCP Docs**: [docs.zapier.com/mcp](https://docs.zapier.com/mcp)
- **Test Script**: Run `node test-integration.js` for diagnostics


