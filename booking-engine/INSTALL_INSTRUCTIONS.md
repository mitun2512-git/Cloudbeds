# Installation Instructions

## Prerequisites

Before installing, make sure you have:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Or install via Homebrew: `brew install node`
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

## Installation Steps

### Step 1: Install Node.js (if not installed)

**macOS (Homebrew):**
```bash
brew install node
```

**macOS (Direct Download):**
- Visit https://nodejs.org/
- Download and install the LTS version

**Verify Installation:**
```bash
node --version  # Should show v14.x or higher
npm --version   # Should show version number
```

### Step 2: Install Dependencies

**Option A: Using the install script (Recommended)**
```bash
cd booking-engine
./install.sh
```

**Option B: Manual installation**
```bash
cd booking-engine

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

**Option C: Using npm script**
```bash
cd booking-engine
npm run install-all
```

### Step 3: Configure Credentials

**Option A: Interactive setup**
```bash
node configure.js
```

**Option B: Manual setup**
1. Edit `server/.env`
2. Set `CLOUDBEDS_ACCESS_TOKEN`
3. Set `CLOUDBEDS_PROPERTY_ID`

See `GET_CREDENTIALS.md` for how to get these values.

### Step 4: Verify Installation

```bash
# Test the integration
npm test

# Or start the server
npm run server
```

## What Gets Installed

- **Root dependencies:**
  - `concurrently` - Run server and client together
  - `axios` - HTTP client for testing
  - `dotenv` - Environment variable management

- **Server dependencies:**
  - `express` - Web framework
  - `cors` - CORS middleware
  - `axios` - HTTP client
  - `body-parser` - Request parsing
  - `dotenv` - Environment variables

- **Client dependencies:**
  - `react` - React framework
  - `react-dom` - React DOM rendering
  - `react-scripts` - Create React App scripts
  - `axios` - HTTP client
  - `date-fns` - Date utilities

## Troubleshooting

### Node.js Not Found

**Error:** `node: command not found`

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart your terminal
3. Verify: `node --version`

### npm Install Fails

**Error:** Permission denied or network errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Port Already in Use

**Error:** Port 3001 already in use

**Solution:**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or change port in server/.env
PORT=3002
```

## Next Steps

After installation:

1. ✅ Configure credentials (see `GET_CREDENTIALS.md`)
2. ✅ Test connection: `npm test`
3. ✅ Start server: `npm run server`
4. ✅ Start client: `npm run client` (new terminal)
5. ✅ Open browser: http://localhost:3000

## Quick Commands Reference

```bash
# Install everything
npm run install-all
# OR
./install.sh

# Configure
node configure.js

# Test
npm test

# Start server
npm run server

# Start client
npm run client

# Start both (development)
npm run dev
```

## Need Help?

- Check `SETUP_AND_TEST.md` for detailed setup
- See `GET_CREDENTIALS.md` for credential setup
- Review `QUICK_START.md` for quick reference
- Check `INTEGRATION_STATUS.md` for current status


