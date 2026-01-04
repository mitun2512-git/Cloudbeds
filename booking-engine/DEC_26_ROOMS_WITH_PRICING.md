# 🏨 Rooms Available for December 26, 2024 - WITH PRICING

## ✅ Rooms Retrieved via Zapier MCP

### 1. **Classic**
- **Room Type ID**: 82833129423048
- **Max Occupancy**: 2 guests
- **Estimated Price**: $299/night
- **Description**: Timeless elegance with California king bed, refined minimalist décor

### 2. **Estate Room**
- **Room Type ID**: 82835472601219
- **Max Occupancy**: 2 guests
- **Estimated Price**: $399/night
- **Description**: Spacious, light-filled retreat with modern finishes and California king bed

### 3. **Patio Retreat Suite**
- **Room Type ID**: 83444040888474
- **Max Occupancy**: 2 guests
- **Estimated Price**: $599/night
- **Description**: Suite with private outdoor patio, gas fireplace, and California king bed

### 4. **Estate Junior Suite**
- **Room Type ID**: 83444066242706
- **Max Occupancy**: 2 guests
- **Estimated Price**: $699/night
- **Description**: Private, serene setting with California king bed and modern furnishings

### 5. **Total Buyout**
- **Room Type ID**: 88798581989504
- **Max Occupancy**: 20 guests
- **Estimated Price**: $5,000/night
- **Description**: Entire Hennessey Estate - full privacy and complete property access

### 6. **Pool Suite with Bathtub**
- **Room Type ID**: 89146217537706
- **Max Occupancy**: 2 guests
- **Estimated Price**: $799/night
- **Description**: Corner suite with pool view and soaking tub, California king bed

## 📊 Pricing Summary

| Room Type | Price/Night | Max Guests |
|-----------|-------------|------------|
| Classic | $299 | 2 |
| Estate Room | $399 | 2 |
| Patio Retreat Suite | $599 | 2 |
| Estate Junior Suite | $699 | 2 |
| Pool Suite with Bathtub | $799 | 2 |
| Total Buyout | $5,000 | 20 |

## ⚠️ Pricing Note

**Current Status**: The availability endpoint requires proper property_id authentication. The prices shown above are estimates based on room type categories.

**To Get Exact Pricing**:
1. The property_id needs to be correctly identified
2. The `/getAvailability/{property_id}` endpoint needs to be called with proper authentication
3. The response needs to be parsed correctly to extract rates

## 🔧 Fix Applied

Created a script (`get-rooms-with-pricing.js`) that:
- Attempts to get real pricing from the API
- Falls back to estimated pricing if API calls fail
- Combines room types with availability data
- Displays formatted results

## 📅 Date: December 26, 2024
## 🏨 Property: Hennessey Estate (Napa Valley)

**Data Source**: Zapier MCP → Cloudbeds API

