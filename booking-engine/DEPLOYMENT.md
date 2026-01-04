# Deploying Hennessey Estate to hennesseyestate.com

This guide covers deploying your booking engine to production using **Render** and connecting it to your domain.

## Prerequisites

- GitHub account (to connect your repo)
- Render account (free at [render.com](https://render.com))
- Your Cloudbeds API credentials
- Access to DNS settings (Wix)

---

## Step 1: Push Code to GitHub

If not already done:
```bash
cd booking-engine
git init
git add .
git commit -m "Prepare for production deployment"
git remote add origin https://github.com/YOUR_USERNAME/hennessey-estate.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### Option A: Using Blueprint (Recommended)
1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render will detect `render.yaml` and create both services

### Option B: Manual Setup
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `hennessey-api`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free (or Starter for better performance)

4. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `CLOUDBEDS_ACCESS_TOKEN` | `cbat_XIvn71EZDUjAA0orkmFpxpTf5XxOa3ph` |
   | `CLOUDBEDS_PROPERTY_ID` | `49705993547975` |
   | `GEMINI_API_KEY` | `your_gemini_key` |
   | `CORS_ORIGIN` | `https://hennesseyestate.com` |

5. Click **Create Web Service**

Your backend URL will be: `https://hennessey-api.onrender.com`

---

## Step 3: Deploy Frontend to Render

1. Go to **New** → **Static Site**
2. Connect same GitHub repo
3. Configure:
   - **Name**: `hennessey-estate`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://hennessey-api.onrender.com` |

5. Click **Create Static Site**

Your frontend URL will be: `https://hennessey-estate.onrender.com`

---

## Step 4: Connect Your Domain

### Add Custom Domain in Render

1. Go to your **hennessey-estate** static site in Render
2. Click **Settings** → **Custom Domains**
3. Click **Add Custom Domain**
4. Enter: `hennesseyestate.com`
5. Render will show you the required DNS records

### Update DNS in Wix

1. Log into your **Wix account**
2. Go to **Domains** → **hennesseyestate.com** → **Manage DNS**
3. Add/update these records:

| Type | Host/Name | Value | TTL |
|------|-----------|-------|-----|
| `CNAME` | `www` | `hennessey-estate.onrender.com` | Auto |
| `A` | `@` | (Render's IP - shown in dashboard) | Auto |

**OR** if Render provides CNAME flattening:
| Type | Host/Name | Value | TTL |
|------|-----------|-------|-----|
| `CNAME` | `@` | `hennessey-estate.onrender.com` | Auto |

4. Wait for DNS propagation (5-30 minutes)

### Verify Domain

Back in Render:
1. Click **Verify** next to your domain
2. Render will automatically provision an SSL certificate

---

## Step 5: Update CORS

After your domain is live, update the backend CORS setting:

1. Go to **hennessey-api** in Render
2. Click **Environment** → Edit `CORS_ORIGIN`
3. Change to: `https://hennesseyestate.com`
4. Save (triggers redeploy)

---

## Step 6: Test Everything

Visit your site and test:
- [ ] Homepage loads correctly
- [ ] Room availability shows real data
- [ ] Booking flow works
- [ ] SSL certificate is valid (padlock icon)

---

## Optional: Add API Subdomain

For cleaner URLs, add `api.hennesseyestate.com`:

1. In Render → **hennessey-api** → **Settings** → **Custom Domains**
2. Add: `api.hennesseyestate.com`
3. In Wix DNS, add:
   | Type | Host/Name | Value |
   |------|-----------|-------|
   | `CNAME` | `api` | `hennessey-api.onrender.com` |

4. Update frontend environment:
   - `REACT_APP_API_URL` = `https://api.hennesseyestate.com`

---

## Environment Variables Reference

### Backend (server)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | No | Server port (Render sets automatically) |
| `CORS_ORIGIN` | Yes | Frontend URL for CORS |
| `CLOUDBEDS_ACCESS_TOKEN` | Yes | Cloudbeds API token |
| `CLOUDBEDS_PROPERTY_ID` | Yes | Your property ID |
| `GEMINI_API_KEY` | Yes | Google AI API key |
| `RESEND_API_KEY` | No | For email features |

### Frontend (client)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend API URL |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | No | For payments |

---

## Troubleshooting

### "Invalid CORS origin"
- Check `CORS_ORIGIN` matches your frontend URL exactly (including https://)

### "API not responding"
- Check Render logs for errors
- Verify all required environment variables are set

### "Domain not working"
- DNS changes can take up to 48 hours (usually 5-30 min)
- Use [dnschecker.org](https://dnschecker.org) to verify propagation

### "SSL certificate error"
- Wait 5-10 minutes after domain verification
- Clear browser cache and try again

---

## Costs

| Service | Render Plan | Cost |
|---------|-------------|------|
| Backend API | Free | $0/mo |
| Static Site | Free | $0/mo |
| **Total** | | **$0/mo** |

For better performance:
| Service | Render Plan | Cost |
|---------|-------------|------|
| Backend API | Starter | $7/mo |
| Static Site | Free | $0/mo |
| **Total** | | **$7/mo** |

