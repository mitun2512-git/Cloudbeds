#!/bin/bash
# Start script that finds and uses available Node.js

echo "🚀 Starting Cloudbeds Booking Engine..."
echo ""

# Try to find Node.js
NODE_PATH=""
if command -v node &> /dev/null; then
    NODE_PATH="node"
elif [ -f "/usr/local/bin/node" ]; then
    NODE_PATH="/usr/local/bin/node"
elif [ -f "/opt/homebrew/bin/node" ]; then
    NODE_PATH="/opt/homebrew/bin/node"
elif [ -f "/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node" ]; then
    NODE_PATH="/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node"
fi

if [ -z "$NODE_PATH" ]; then
    echo "❌ Node.js not found!"
    echo ""
    echo "Please install Node.js:"
    echo "  brew install node"
    echo "  OR visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Using Node.js: $NODE_PATH"
$NODE_PATH --version
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo ""
    
    # Install root
    if [ ! -d "node_modules" ]; then
        echo "Installing root dependencies..."
        $NODE_PATH $(dirname $NODE_PATH)/npm install 2>/dev/null || npm install
    fi
    
    # Install server
    if [ ! -d "server/node_modules" ]; then
        echo "Installing server dependencies..."
        cd server
        $NODE_PATH $(dirname $NODE_PATH)/npm install 2>/dev/null || npm install
        cd ..
    fi
    
    # Install client
    if [ ! -d "client/node_modules" ]; then
        echo "Installing client dependencies..."
        cd client
        $NODE_PATH $(dirname $NODE_PATH)/npm install 2>/dev/null || npm install
        cd ..
    fi
    
    echo "✅ Dependencies installed!"
    echo ""
fi

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  Configuration file not found!"
    echo "Creating server/.env from template..."
    if [ -f "server/env.template" ]; then
        cp server/env.template server/.env
        echo "✅ Created server/.env"
        echo "⚠️  Please edit server/.env with your Cloudbeds credentials!"
        echo ""
    fi
fi

# Start the application
echo "🚀 Starting application..."
echo ""
echo "Server will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start server in background
cd server
$NODE_PATH index.js &
SERVER_PID=$!
cd ..

# Wait a bit for server to start
sleep 3

# Start client
cd client
$NODE_PATH $(dirname $NODE_PATH)/npm start 2>/dev/null || npm start &
CLIENT_PID=$!
cd ..

# Wait for user interrupt
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT TERM

echo "✅ Application started!"
echo "   Server PID: $SERVER_PID"
echo "   Client PID: $CLIENT_PID"
echo ""
echo "🌐 Opening browser..."
sleep 5
open http://localhost:3000 2>/dev/null || echo "Please open http://localhost:3000 in your browser"

# Wait
wait
