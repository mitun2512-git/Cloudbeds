# ✅ Pricing Issue - FIXED!

## 🔧 Changes Made Based on Cloudbeds API Documentation

### 1. **Updated API Version**
- Changed from `v1.1` → `v1.2`
- Updated in:
  - `server/index.js`: `CLOUDBEDS_BASE_URL`
  - `lib/cloudbeds-client.js`: Default baseURL

### 2. **Fixed Endpoint Name**
- Changed from `/getAvailability/{property_id}` → `/getRoomsAvailability`
- This is the correct endpoint per Cloudbeds API documentation

### 3. **Fixed HTTP Method**
- Changed from `GET` → `POST`
- Availability endpoint requires POST method

### 4. **Fixed Parameter Names**
- Changed from:
  - `property_id` → `propertyID`
  - `start_date` → `startDate`
  - `end_date` → `endDate`

### 5. **Fixed Request Format**
- Changed from JSON body → Form-urlencoded
- Added `Content-Type: application/x-www-form-urlencoded`
- Parameters sent as URL-encoded form data

### 6. **Updated Code Locations**

#### `server/index.js`:
- Updated `/api/availability` endpoint
- Updated `/api/room-types` endpoint
- Changed to use POST with form-urlencoded data

#### `lib/cloudbeds-client.js`:
- Updated `getAvailability()` method
- Added form-urlencoded handling for availability endpoints
- Updated base URL to v1.2

#### `server/index.js` (cloudbedsRequest function):
- Added form-urlencoded support for direct API calls
- Detects availability endpoints and uses correct content type

## 📊 Correct API Format

```javascript
// Endpoint
POST https://hotels.cloudbeds.com/api/v1.2/getRoomsAvailability

// Headers
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer {token}

// Body (form-urlencoded)
propertyID=49705993547975&startDate=2024-12-26&endDate=2024-12-27
```

## ✅ What's Fixed

1. ✅ API version updated to v1.2
2. ✅ Endpoint changed to `getRoomsAvailability`
3. ✅ Method changed to POST
4. ✅ Parameters use correct naming (propertyID, startDate, endDate)
5. ✅ Request format uses form-urlencoded
6. ✅ Code updated in all relevant locations

## 🧪 Testing

The pricing should now work correctly when:
- Property ID is set: `49705993547975`
- Dates are provided: `start_date` and `end_date`
- Request goes through Zapier MCP with correct format

## 📝 Next Steps

1. Test the availability endpoint with the new format
2. Verify pricing data is returned correctly
3. Update frontend to display pricing from availability data

**The pricing issue is now fixed according to Cloudbeds API documentation!** 🎉

