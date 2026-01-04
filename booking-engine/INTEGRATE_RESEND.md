# 🚀 Integrating Resend Email Service

## Quick Setup Guide

### Step 1: Sign Up for Resend
1. Go to https://resend.com
2. Sign up for free account
3. Verify your email
4. Get your API key from dashboard

### Step 2: Install Resend SDK
```bash
cd booking-engine/server
npm install resend
```

### Step 3: Add API Key to .env
Add to `server/.env`:
```env
RESEND_API_KEY=re_your_api_key_here
```

### Step 4: Update email-marketing-service.js
The service will automatically use Resend if the API key is configured.

## Pricing
- **Free**: 3,000 emails/month (100/day)
- **Paid**: $20/month for 50,000 emails
- **Pay-as-you-go**: $0.30 per 1,000 emails

## Why Resend?
- ✅ Easiest integration (5 minutes)
- ✅ Modern, clean API
- ✅ Great free tier
- ✅ Excellent documentation
- ✅ Built for developers

