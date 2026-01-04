# Quick Reference Guide

## Installation Commands

```bash
# Install dependencies
npm install

# Install Zapier CLI globally
npm install -g zapier-platform-cli

# Login to Zapier
zapier login

# Test integration
zapier test

# Validate integration
zapier validate

# Push to Zapier
zapier push
```

## Environment Variables

```bash
CLOUDBEDS_CLIENT_ID=your_client_id
CLOUDBEDS_CLIENT_SECRET=your_client_secret
```

## Available Triggers

| Trigger | Description | Key Fields |
|---------|-------------|------------|
| New Reservation | New reservation created | `reservation_id`, `guest_first_name`, `guest_last_name`, `check_in`, `check_out` |
| New In-House Guest | Guest checks in | `reservation_id`, `guest_email`, `check_in`, `status` |
| New Checked-Out Guest | Guest checks out | `reservation_id`, `guest_email`, `check_out`, `status` |
| New Cancellation | Reservation cancelled | `reservation_id`, `cancelled_date`, `cancellation_reason` |
| New Guest | New guest profile created | `guest_id`, `first_name`, `last_name`, `email` |

## Available Actions

| Action | Description | Required Fields |
|--------|-------------|-----------------|
| Create Reservation | Create new reservation | `property_id`, `room_type_id`, `check_in`, `check_out`, `guest_first_name`, `guest_last_name` |
| Update Reservation | Update existing reservation | `reservation_id` (plus fields to update) |
| Cancel Reservation | Cancel a reservation | `reservation_id` |
| Create Guest | Create guest profile | `first_name`, `last_name` |

## Available Searches

| Search | Description | Search Fields |
|--------|-------------|---------------|
| Find Reservation | Search for reservations | `reservation_id`, `guest_email`, `guest_name` |
| Find Guest | Search for guests | `guest_id`, `email`, `name` |

## API Client Methods

```javascript
const client = new CloudbedsClient(z, accessToken);

// Reservations
await client.getReservations(params);
await client.getReservation(id);
await client.createReservation(data);
await client.updateReservation(id, data);
await client.cancelReservation(id, data);

// Guests
await client.getGuests(params);
await client.getGuest(id);
await client.createGuest(data);
await client.updateGuest(id, data);

// Properties & Rooms
await client.getProperties();
await client.getRooms(propertyId, params);
await client.getAvailability(propertyId, params);
await client.getTransactions(propertyId, params);
```

## Common Patterns

### Date Formatting
```javascript
const { formatDate } = require('./lib/helpers');
const formattedDate = formatDate(new Date()); // Returns YYYY-MM-DD
```

### Response Parsing
```javascript
const { parseResponse } = require('./lib/helpers');
const data = parseResponse(apiResponse);
```

### Validation
```javascript
const { validateReservationData } = require('./lib/helpers');
const errors = validateReservationData(data);
if (errors.length > 0) {
  throw new Error(errors.join(', '));
}
```

## File Structure

```
.
├── index.js              # Main app configuration
├── authentication.js    # OAuth2 setup
├── triggers.js          # Event triggers
├── creates.js           # Actions
├── searches.js          # Search functionality
├── lib/
│   ├── cloudbeds-client.js  # API client
│   └── helpers.js           # Utility functions
└── test/
    └── index.js         # Tests
```

## Troubleshooting

### Authentication Issues
- Verify Client ID and Secret are correct
- Check redirect URI matches Cloudbeds configuration
- Ensure OAuth scopes are properly set

### API Errors
- Check Cloudbeds API documentation
- Verify access token is valid
- Check rate limits (429 errors)

### Dynamic Fields Not Loading
- Ensure property is selected before room type
- Check API response format
- Verify authentication is working

## Support Resources

- [README.md](README.md) - Full documentation
- [SETUP.md](SETUP.md) - Setup instructions
- [EXAMPLES.md](EXAMPLES.md) - Example workflows
- [Zapier Platform Docs](https://platform.zapier.com/docs)
- [Cloudbeds API Docs](https://developers.cloudbeds.com/)


