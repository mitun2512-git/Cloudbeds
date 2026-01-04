# Cloudbeds Zapier Integration

A comprehensive Zapier integration for accessing and managing Cloudbeds data through automated workflows.

> **📖 New to this integration?** Start with [HOW_TO_USE.md](HOW_TO_USE.md) for step-by-step instructions on accessing Cloudbeds through Zapier.
> 
> **🤖 Want AI access?** Check out [ZAPIER_MCP.md](ZAPIER_MCP.md) to access Cloudbeds through Zapier MCP (Model Context Protocol) for AI assistants.

## Features

### Triggers (Events)
- **New Reservation** - Triggers when a new reservation is created
- **New In-House Guest** - Triggers when a guest checks in
- **New Checked-Out Guest** - Triggers when a guest checks out
- **New Cancellation** - Triggers when a reservation is canceled
- **New Guest** - Triggers when a new guest profile is created

### Actions (Creates)
- **Create Reservation** - Create a new reservation in Cloudbeds
- **Update Reservation** - Update an existing reservation
- **Cancel Reservation** - Cancel a reservation
- **Create Guest** - Create a new guest profile

### Searches
- **Find Reservation** - Search for reservations by ID, email, or name
- **Find Guest** - Search for guests by ID, email, or name

## Setup

### Prerequisites

1. Node.js (v14 or higher)
2. Zapier CLI
3. Cloudbeds API credentials (Client ID and Client Secret)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Zapier CLI globally (if not already installed):
```bash
npm install -g zapier-platform-cli
```

3. Login to Zapier:
```bash
zapier login
```

### Configuration

1. Register your app with Cloudbeds to get OAuth credentials:
   - Go to Cloudbeds Developer Portal
   - Create a new OAuth application
   - Note your Client ID and Client Secret

2. Set environment variables:
```bash
export CLOUDBEDS_CLIENT_ID=your_client_id
export CLOUDBEDS_CLIENT_SECRET=your_client_secret
```

Or create a `.env` file:
```
CLOUDBEDS_CLIENT_ID=your_client_id
CLOUDBEDS_CLIENT_SECRET=your_client_secret
```

### Testing

Test your integration locally:
```bash
zapier test
```

Validate your integration:
```bash
zapier validate
```

### Deployment

Push your integration to Zapier:
```bash
zapier push
```

## Project Structure

```
.
├── index.js                 # Main Zapier app configuration
├── authentication.js        # OAuth2 authentication setup
├── triggers.js              # Event triggers (new reservations, guests, etc.)
├── creates.js               # Actions (create/update reservations, guests)
├── searches.js              # Search functionality
├── lib/
│   └── cloudbeds-client.js # Cloudbeds API client
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Cloudbeds API Client

The `CloudbedsClient` class provides methods to interact with the Cloudbeds API:

- `getReservations(params)` - Get list of reservations
- `getReservation(id)` - Get a specific reservation
- `createReservation(data)` - Create a new reservation
- `updateReservation(id, data)` - Update a reservation
- `cancelReservation(id, data)` - Cancel a reservation
- `getGuests(params)` - Get list of guests
- `getGuest(id)` - Get a specific guest
- `createGuest(data)` - Create a new guest
- `updateGuest(id, data)` - Update a guest
- `getProperties()` - Get list of properties
- `getRooms(propertyId, params)` - Get rooms for a property
- `getAvailability(propertyId, params)` - Get availability
- `getTransactions(propertyId, params)` - Get transactions

## Authentication

This integration uses OAuth2 authentication. Users will be prompted to authorize the app when setting up their Zapier connection.

The authentication flow:
1. User clicks "Connect Account" in Zapier
2. Redirected to Cloudbeds authorization page
3. User approves access
4. Cloudbeds redirects back with authorization code
5. Zapier exchanges code for access token
6. Access token is stored and used for API requests

## Usage Examples

### Example Zap: Send Email When New Reservation is Created

1. Trigger: "New Reservation" from Cloudbeds
2. Action: "Send Email" from Gmail/Outlook
3. Map reservation details to email fields

### Example Zap: Create Calendar Event for Check-In

1. Trigger: "New In-House Guest" from Cloudbeds
2. Action: "Create Event" from Google Calendar
3. Map check-in date and guest information

### Example Zap: Create Guest from Form Submission

1. Trigger: "New Submission" from Google Forms
2. Action: "Create Guest" from Cloudbeds
3. Map form fields to guest fields

## API Endpoints

The integration uses the Cloudbeds API v1.1:
- Base URL: `https://hotels.cloudbeds.com/api/v1.1`
- Authentication: OAuth2 Bearer Token

## Development

### Adding New Triggers

1. Add trigger definition to `triggers.js`
2. Implement the `perform` function using `CloudbedsClient`
3. Export the trigger

### Adding New Actions

1. Add action definition to `creates.js`
2. Define `inputFields` for user input
3. Implement the `perform` function using `CloudbedsClient`
4. Export the action

### Adding New Searches

1. Add search definition to `searches.js`
2. Define `inputFields` for search parameters
3. Implement the `perform` function using `CloudbedsClient`
4. Export the search

## Troubleshooting

### Authentication Issues

- Verify your Client ID and Client Secret are correct
- Check that the redirect URI matches what's configured in Cloudbeds
- Ensure OAuth scopes are properly configured

### API Errors

- Check Cloudbeds API documentation for endpoint changes
- Verify your access token is valid and not expired
- Check rate limits if receiving 429 errors

### Testing Issues

- Use `zapier test` to run local tests
- Check logs for detailed error messages
- Verify all required fields are provided

## Resources

- [Zapier Platform Documentation](https://platform.zapier.com/docs)
- [Cloudbeds API Documentation](https://developers.cloudbeds.com/)
- [Zapier CLI Documentation](https://zapier.github.io/zapier-platform-cli/)

## License

MIT
