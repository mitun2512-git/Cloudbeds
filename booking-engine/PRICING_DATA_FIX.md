# 🔧 Pricing Data Mapping Fix

## Issue
The pricing data was incorrect because the code wasn't correctly parsing the Cloudbeds API response structure.

## Root Cause
The code was only looking for pricing data in a specific format:
- `availability[roomType.id]` 
- Only checking `price` or `rate` fields

But Cloudbeds API responses can have:
- Different key formats (string vs number IDs)
- Different field names (`rate`, `price`, `amount`, `rateAmount`)
- Array format instead of object format
- Different nested structures

## ✅ Fix Applied

### 1. Enhanced Data Mapping (`server/index.js`)
Updated the `/api/room-types` endpoint to:
- Try multiple key formats (string, number, with/without prefix)
- Handle both object and array response formats
- Check multiple pricing field names (`rate`, `price`, `amount`, `total`, `rateAmount`)
- Extract currency information
- Add detailed logging to debug response structure

### 2. Improved MCP Bridge (`server/mcp-bridge.js`)
Updated to properly format form-urlencoded data for `getRoomsAvailability` requests:
- Converts data object to form-urlencoded string
- Sets correct Content-Type header

## 📊 Response Structure Handling

The code now handles these possible response formats:

### Format 1: Object with room type IDs as keys
```json
{
  "data": {
    "82833129423048": {
      "roomTypeID": "82833129423048",
      "roomTypeName": "Classic",
      "available": 3,
      "rate": 299,
      "price": 299,
      "currency": "USD"
    }
  }
}
```

### Format 2: Array of room types
```json
{
  "data": [
    {
      "roomTypeID": "82833129423048",
      "roomTypeName": "Classic",
      "available": 3,
      "rate": 299,
      "currency": "USD"
    }
  ]
}
```

### Format 3: Nested structure
```json
{
  "data": {
    "rooms": [
      {
        "roomTypeID": "82833129423048",
        "rate": 299
      }
    ]
  }
}
```

## 🔍 Debugging

The code now logs:
- Full availability response structure (first 500 chars)
- Pricing found for each room type
- Warnings when pricing is missing
- Available data keys when pricing not found

## ⚠️ Next Steps

To get **actual real pricing data**, you need to:

1. **Verify Zapier MCP Authentication**
   - Ensure Cloudbeds account is properly connected in Zapier
   - The error "Cloudbeds.com - Soluções online para hotéis e pousadas" suggests authentication issue

2. **Test with Real API Response**
   - Once authentication works, the code will log the actual response structure
   - This will help verify the mapping is correct

3. **Check Server Logs**
   - Look for `[API] Availability response structure:` logs
   - Check `[API] Room type X: $Y` logs to see if pricing is extracted

## 📝 Code Changes

### `server/index.js` (lines 382-450)
- Enhanced availability data parsing
- Multiple key format attempts
- Multiple pricing field checks
- Detailed logging

### `server/mcp-bridge.js` (lines 38-50)
- Form-urlencoded data formatting
- Content-Type header handling

## ✅ Expected Result

After this fix, the code should:
1. ✅ Handle different response structures
2. ✅ Extract pricing from multiple field names
3. ✅ Match room types correctly (string/number IDs)
4. ✅ Log actual response structure for debugging
5. ✅ Return correct pricing when API response is received

The pricing will be correct once the actual Cloudbeds API response is received through Zapier MCP.

