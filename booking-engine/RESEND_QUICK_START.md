# 📧 Resend Integration - Quick Start

## ✅ What's Done

1. ✅ **Resend package installed** (`npm install resend`)
2. ✅ **Code integrated** - ready to use
3. ✅ **Configuration updated** - just need API key

## 🎯 What You Need to Do (3 steps, 3 minutes)

### 1. Create Resend Account
- Go to: **https://resend.com**
- Click "Sign Up" (free, no credit card)
- Verify your email

### 2. Get API Key
- In Resend dashboard → "API Keys"
- Click "Create API Key"
- Copy the key (starts with `re_`)

### 3. Add to .env
```bash
cd booking-engine/server
# Edit .env file, add:
RESEND_API_KEY=re_your_actual_key_here
```

### 4. Restart Server
```bash
npm start
```

## 🎉 Done!

Your emails will now send via Resend!

### Free Tier
- **3,000 emails/month** (100/day)
- Perfect for testing
- No credit card needed

### Test Email
Emails will send from: `onboarding@resend.dev` (Resend's test domain)

For production, verify your domain and update the from address.

## 📚 Full Setup Guide
See `server/RESEND_ACCOUNT_SETUP.md` for detailed instructions.

