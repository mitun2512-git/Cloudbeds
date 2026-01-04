#!/bin/bash

# Interactive script to set up Cloudbeds credentials

echo "🔧 Cloudbeds Booking Engine - Credential Setup"
echo "=============================================="
echo ""

ENV_FILE="server/.env"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "server/env.template" ]; then
        cp server/env.template "$ENV_FILE"
        echo "✅ Created $ENV_FILE from template"
    else
        echo "❌ Template file not found!"
        exit 1
    fi
fi

echo "Current configuration:"
echo "---------------------"
grep -E "CLOUDBEDS_ACCESS_TOKEN|CLOUDBEDS_PROPERTY_ID" "$ENV_FILE" | grep -v "^#" | head -2
echo ""

echo "To get your credentials:"
echo "1. Access Token: https://developers.cloudbeds.com/"
echo "2. Property ID: Cloudbeds Dashboard → Settings → Property Settings"
echo ""

read -p "Do you want to update credentials now? (y/n): " update

if [ "$update" != "y" ] && [ "$update" != "Y" ]; then
    echo "Skipping credential update."
    echo "Edit $ENV_FILE manually to set your credentials."
    exit 0
fi

echo ""
read -p "Enter Cloudbeds Access Token (or press Enter to skip): " token
if [ ! -z "$token" ]; then
    # Update token in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|CLOUDBEDS_ACCESS_TOKEN=.*|CLOUDBEDS_ACCESS_TOKEN=$token|" "$ENV_FILE"
    else
        # Linux
        sed -i "s|CLOUDBEDS_ACCESS_TOKEN=.*|CLOUDBEDS_ACCESS_TOKEN=$token|" "$ENV_FILE"
    fi
    echo "✅ Access token updated"
fi

echo ""
read -p "Enter Property ID (or press Enter to skip): " property_id
if [ ! -z "$property_id" ]; then
    # Update property ID in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|CLOUDBEDS_PROPERTY_ID=.*|CLOUDBEDS_PROPERTY_ID=$property_id|" "$ENV_FILE"
    else
        # Linux
        sed -i "s|CLOUDBEDS_PROPERTY_ID=.*|CLOUDBEDS_PROPERTY_ID=$property_id|" "$ENV_FILE"
    fi
    echo "✅ Property ID updated"
fi

echo ""
echo "✅ Configuration updated!"
echo ""
echo "Next steps:"
echo "1. Restart the server: cd server && npm start"
echo "2. Or restart both: npm run dev"
echo ""


