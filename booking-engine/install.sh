#!/bin/bash

# Cloudbeds Booking Engine - Installation Script
# This script installs all Node.js dependencies

echo "🚀 Cloudbeds Booking Engine - Installation"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo ""
    echo "Please install Node.js first:"
    echo "  - Visit: https://nodejs.org/"
    echo "  - Or use Homebrew: brew install node"
    echo ""
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js found: $NODE_VERSION"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    echo ""
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm found: $NPM_VERSION"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install root dependencies"
    exit 1
fi
echo "✅ Root dependencies installed"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi
echo "✅ Server dependencies installed"
cd ..
echo ""

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi
echo "✅ Client dependencies installed"
cd ..
echo ""

echo "✅ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "  1. Configure credentials: node configure.js"
echo "  2. Or edit server/.env manually"
echo "  3. Start server: npm run server"
echo "  4. Test: npm test"
echo ""


