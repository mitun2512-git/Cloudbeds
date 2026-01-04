# Cloudbeds Booking Engine

A modern, full-featured booking engine webapp integrated with Cloudbeds API for displaying rooms, processing payments, and creating reservations.

## Features

✅ **Room Display & Availability**
- View available rooms for selected dates
- Real-time pricing and availability
- Room details, amenities, and images
- Filter by capacity and preferences

✅ **Payment Processing**
- Secure payment processing through Cloudbeds
- Credit card validation
- Real-time booking total calculation
- Payment confirmation

✅ **Reservation Management**
- Create reservations directly in Cloudbeds
- Automatic confirmation
- Guest information collection
- Reservation details and confirmation

## Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **API Integration**: Cloudbeds API v1.1
- **Styling**: CSS3 with modern design

## Project Structure

```
booking-engine/
├── server/              # Backend API server
│   ├── index.js        # Express server & Cloudbeds integration
│   ├── package.json
│   └── .env.example
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API service layer
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json        # Root package.json
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (server + client)
npm run install-all
```

### 2. Configure Environment Variables

Create `server/.env` file:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your Cloudbeds credentials:

```env
CLOUDBEDS_ACCESS_TOKEN=your_access_token_here
CLOUDBEDS_PROPERTY_ID=your_property_id_here
PORT=3001
```

### 3. Get Cloudbeds API Credentials

1. Go to Cloudbeds Developer Portal
2. Create an OAuth application
3. Get your access token
4. Find your property ID

### 4. Start the Application

**Development mode (runs both server and client):**
```bash
npm run dev
```

**Or run separately:**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run client
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Endpoints

### Backend API Routes

- `GET /api/health` - Health check
- `GET /api/properties` - Get properties
- `GET /api/rooms` - Get rooms for property
- `GET /api/availability` - Get availability for dates
- `GET /api/room-types` - Get room types with pricing
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/:id` - Get reservation details

## Usage Flow

1. **Select Dates**: User selects check-in and check-out dates
2. **View Rooms**: System fetches and displays available rooms with pricing
3. **Choose Room**: User selects a room
4. **Guest Information**: User fills in guest details
5. **Payment**: User enters payment information
6. **Confirmation**: Reservation is created in Cloudbeds and confirmed

## Components

### Frontend Components

- **DateSelector**: Date range picker for check-in/check-out
- **RoomList**: Displays available rooms with details
- **BookingForm**: Guest information collection
- **PaymentForm**: Payment processing form
- **Confirmation**: Reservation confirmation page

### Backend Services

- **Cloudbeds API Client**: Handles all Cloudbeds API requests
- **Reservation Service**: Creates and manages reservations
- **Payment Service**: Processes payments through Cloudbeds
- **Availability Service**: Fetches room availability and pricing

## Payment Processing

The booking engine processes payments through Cloudbeds API:

1. Payment data is collected securely
2. Reservation is created first
3. Payment is processed for the reservation
4. Reservation is confirmed upon successful payment

**Note**: Actual payment processing endpoints may vary based on your Cloudbeds API version and payment gateway configuration.

## Security Considerations

- ⚠️ **Never commit `.env` files** with real credentials
- ⚠️ **Use HTTPS in production** for secure payment processing
- ⚠️ **Validate all inputs** on both client and server
- ⚠️ **Implement rate limiting** for API endpoints
- ⚠️ **Use environment variables** for sensitive data

## Production Deployment

### Build for Production

```bash
# Build React app
cd client
npm run build
```

### Environment Variables

Set production environment variables:
- `CLOUDBEDS_ACCESS_TOKEN`
- `CLOUDBEDS_PROPERTY_ID`
- `PORT`
- `CORS_ORIGIN` (your production domain)

### Deploy

Deploy the built `client/build` folder and run the server with a process manager like PM2:

```bash
pm2 start server/index.js --name booking-engine
```

## Troubleshooting

### API Connection Issues
- Verify your Cloudbeds access token is valid
- Check property ID is correct
- Ensure API endpoints match your Cloudbeds API version

### Payment Processing Errors
- Verify payment endpoint is correct for your Cloudbeds setup
- Check payment gateway configuration
- Review Cloudbeds API documentation for payment requirements

### Room Availability Not Showing
- Check date format (YYYY-MM-DD)
- Verify property has rooms configured
- Check Cloudbeds API response format

## Customization

### Styling
- Modify CSS files in `client/src/components/`
- Update color scheme in CSS variables
- Customize layout and design

### Features
- Add room filtering options
- Implement room comparison
- Add guest reviews/ratings
- Integrate with additional services

## Support

- **Cloudbeds API Docs**: [developers.cloudbeds.com](https://developers.cloudbeds.com/)
- **Issues**: Check API response formats and error messages
- **Testing**: Use Cloudbeds sandbox/test environment first

## License

MIT


