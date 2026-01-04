# 🚀 Run the Booking Engine Now

## Quick Start (3 Steps)

### Step 1: Install Node.js (if not installed)

**Check if installed:**
```bash
node --version
```

**If not installed, choose one:**

**Option A: Homebrew (Recommended)**
```bash
brew install node
```

**Option B: Direct Download**
- Visit: https://nodejs.org/
- Download and install LTS version

**Option C: Using the start script (auto-detects)**
```bash
cd booking-engine
./start-app.sh
```

### Step 2: Configure Credentials

```bash
cd booking-engine/server
cp env.template .env
# Edit .env with your Cloudbeds credentials
```

**Get credentials:**
- Property ID: Cloudbeds Dashboard → Settings
- Access Token: Cloudbeds Developer Portal

### Step 3: Run the App

**Option A: Use the start script**
```bash
cd booking-engine
./start-app.sh
```

**Option B: Manual start**
```bash
# Terminal 1 - Server
cd booking-engine/server
npm start

# Terminal 2 - Client  
cd booking-engine/client
npm start
```

**Option C: Run both together**
```bash
cd booking-engine
npm run dev
```

## 🌐 Access the App

Once running:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

The browser should open automatically, or open manually.

## ⚡ Quick Commands

```bash
# Install everything
cd booking-engine
./install.sh

# Start app (auto-installs if needed)
./start-app.sh

# Or use npm
npm run dev
```

## 🔧 Troubleshooting

**Node.js not found?**
- Install: `brew install node`
- Or download from nodejs.org
- Restart terminal after installation

**Port already in use?**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Dependencies not installing?**
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

## ✅ Ready!

The app is configured and ready to run. Just install Node.js and run `./start-app.sh`!


