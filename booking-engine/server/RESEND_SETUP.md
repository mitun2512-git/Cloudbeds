# 📧 Resend Email Service Setup

## Why Resend?
- ✅ **Easiest Integration**: 5-minute setup
- ✅ **Cheapest**: Free tier (3,000 emails/month)
- ✅ **Developer-Friendly**: Modern API, great docs
- ✅ **Reliable**: Used by thousands of apps

## Quick Setup (5 minutes)

### 1. Install Resend
```bash
cd booking-engine/server
npm install resend
```

### 2. Get API Key
1. Sign up at https://resend.com (free)
2. Go to API Keys in dashboard
3. Create new API key
4. Copy the key (starts with `re_`)

### 3. Add to .env
Add to `server/.env`:
```env
RESEND_API_KEY=re_your_api_key_here
```

### 4. Verify Domain (Optional but Recommended)
1. Go to Domains in Resend dashboard
2. Add your domain (e.g., `hennesseyestate.com`)
3. Add DNS records as instructed
4. Wait for verification (usually < 5 minutes)

### 5. Update From Address
In `server/index.js`, update the `from` address:
```javascript
from: 'Hennessey Estate <hello@yourdomain.com>'
```

Or use Resend's test domain for testing:
```javascript
from: 'onboarding@resend.dev' // Only for testing
```

## Pricing
- **Free**: 3,000 emails/month (100/day)
- **Paid**: $20/month for 50,000 emails
- **Pay-as-you-go**: $0.30 per 1,000 emails

## Testing
1. Start your server
2. Create a campaign
3. Send test email
4. Check Resend dashboard for delivery status

## That's It!
Your email marketing feature will now send real emails! 🎉

