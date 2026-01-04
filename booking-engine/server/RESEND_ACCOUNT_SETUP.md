# 🚀 Resend Account Setup - Quick Guide

## Step 1: Create Free Account (2 minutes)

1. **Go to Resend**: https://resend.com
2. **Click "Sign Up"** (top right)
3. **Enter your email** and create a password
4. **Verify your email** (check inbox)
5. **Complete signup** - you're in!

## Step 2: Get Your API Key (1 minute)

1. **Log in** to Resend dashboard
2. **Click "API Keys"** in the left sidebar
3. **Click "Create API Key"**
4. **Name it** (e.g., "Booking Engine")
5. **Copy the key** - it starts with `re_`
   - ⚠️ **Copy it now** - you won't see it again!

## Step 3: Add to Your Project (30 seconds)

1. **Open** `booking-engine/server/.env`
2. **Add this line**:
   ```env
   RESEND_API_KEY=re_your_actual_key_here
   ```
3. **Replace** `re_your_actual_key_here` with your actual key
4. **Save** the file

## Step 4: Restart Server

```bash
# Stop your server (Ctrl+C)
# Then restart:
cd booking-engine/server
npm start
```

## ✅ That's It!

Your email marketing feature will now send real emails!

### Free Tier Limits
- ✅ **3,000 emails/month** (100/day)
- ✅ Perfect for testing and small campaigns
- ✅ No credit card required

### Testing Email Address
For the free tier, emails will be sent **from**: `onboarding@resend.dev`

This is Resend's test domain - no domain verification needed!

### Next Steps (Optional)
- **Verify your domain** for production use
- **Update from address** in `.env`:
  ```env
  RESEND_FROM_ADDRESS=Hennessey Estate <hello@yourdomain.com>
  ```

## 🎉 Ready to Send!

Try sending a test campaign from your email marketing dashboard!

