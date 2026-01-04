# How to Get Cloudbeds Credentials

## Quick Guide to Get Your Credentials

### Option 1: Through Cloudbeds Dashboard (Recommended)

1. **Log in to Cloudbeds:**
   - Go to [myfrontdesk.cloudbeds.com](https://myfrontdesk.cloudbeds.com)
   - Sign in to your account

2. **Get Property ID:**
   - Go to Settings → Property Settings
   - Your Property ID is displayed there
   - Or check the URL when viewing your property

3. **Get API Access Token:**
   - Go to Settings → Integrations → API
   - Create a new API key/token
   - Copy the access token

### Option 2: Through Cloudbeds Developer Portal

1. **Visit Developer Portal:**
   - Go to [developers.cloudbeds.com](https://developers.cloudbeds.com/)
   - Sign in or create account

2. **Create OAuth Application:**
   - Click "Create Application"
   - Fill in application details
   - Set redirect URI (if needed)

3. **Get Credentials:**
   - Copy Client ID
   - Copy Client Secret
   - Generate access token using OAuth flow

### Option 3: Through Zapier MCP

Since Zapier MCP is connected:

1. **Property ID:**
   - The property ID is visible in reservations (though may be censored)
   - Get the actual ID from Cloudbeds dashboard
   - Format is usually a string identifier

2. **Access Token:**
   - Zapier manages tokens automatically
   - For direct API access, get token from Cloudbeds Developer Portal

## Setting Up Credentials

### Method 1: Interactive Configuration

```bash
cd booking-engine
node configure.js
```

Follow the prompts to enter your credentials.

### Method 2: Manual Configuration

Edit `server/.env`:

```env
CLOUDBEDS_ACCESS_TOKEN=your_actual_token_here
CLOUDBEDS_PROPERTY_ID=your_actual_property_id_here
PORT=3001
```

### Method 3: Environment Variables

Set in your shell:

```bash
export CLOUDBEDS_ACCESS_TOKEN="your_token"
export CLOUDBEDS_PROPERTY_ID="your_property_id"
```

## Verifying Credentials

After setting credentials, test the connection:

```bash
npm test
```

Or start the server and check for warnings:

```bash
npm run server
```

If credentials are missing or invalid, you'll see warnings.

## Security Notes

⚠️ **Important:**
- Never commit `.env` files to version control
- Keep your access tokens secure
- Rotate tokens regularly
- Use environment variables in production

## Troubleshooting

**Can't find Property ID?**
- Check Cloudbeds dashboard → Settings
- Look in property URL
- Contact Cloudbeds support

**Token not working?**
- Verify token hasn't expired
- Check token has correct permissions
- Regenerate token if needed

**Need help?**
- Check Cloudbeds API documentation
- Contact Cloudbeds support
- Review `SETUP_AND_TEST.md` for detailed guide


