# Hennessey Estate - State-of-the-Art SEO Strategy Plan

**Version:** 1.0  
**Created:** January 2026  
**Target Domain:** hennesseyestate.com

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Technical SEO](#technical-seo)
4. [On-Page SEO](#on-page-seo)
5. [Content Strategy](#content-strategy)
6. [Local SEO](#local-seo)
7. [Schema Markup & Structured Data](#schema-markup--structured-data)
8. [Performance & Core Web Vitals](#performance--core-web-vitals)
9. [Mobile SEO](#mobile-seo)
10. [Link Building Strategy](#link-building-strategy)
11. [Analytics & Monitoring](#analytics--monitoring)
12. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

This SEO plan is designed to position Hennessey Estate as the premier luxury bed and breakfast in Napa Valley for organic search. The strategy focuses on:

- **Primary Goal:** Rank #1 for "luxury bed and breakfast Napa Valley" and related high-intent keywords
- **Secondary Goal:** Dominate local search results for Napa Valley accommodations
- **Tertiary Goal:** Build topical authority for wine country travel content

### Key Performance Indicators (KPIs)

| Metric | Current | 6-Month Target | 12-Month Target |
|--------|---------|----------------|-----------------|
| Organic Traffic | Baseline | +150% | +400% |
| Top 10 Keywords | TBD | 50+ | 150+ |
| Domain Authority | TBD | 35+ | 50+ |
| Local Pack Rankings | TBD | Top 3 | #1 |
| Organic Booking Rate | Baseline | +75% | +200% |
| Featured Snippets | 0 | 5+ | 15+ |

---

## Current State Analysis

### ✅ Strengths (Already Implemented)

| Element | Status | Notes |
|---------|--------|-------|
| Title Tags | ✅ Excellent | Properly formatted with brand + location |
| Meta Descriptions | ✅ Good | Compelling, includes CTA |
| Canonical URLs | ✅ Implemented | Per-page canonicals |
| Open Graph Tags | ✅ Complete | Full OG implementation |
| Twitter Cards | ✅ Complete | Summary large image |
| robots.txt | ✅ Configured | Proper allow/disallow rules |
| sitemap.xml | ✅ Present | Image sitemap included |
| LodgingBusiness Schema | ✅ Rich | Reviews, amenities, pricing |
| FAQPage Schema | ✅ Implemented | 5 FAQs |
| BreadcrumbList Schema | ✅ Implemented | Navigation structured |
| Geo Tags | ✅ Complete | Lat/long, region |
| Mobile Viewport | ✅ Configured | Responsive ready |

### ⚠️ Opportunities for Enhancement

| Element | Priority | Impact |
|---------|----------|--------|
| More landing pages | High | +300% keyword coverage |
| Blog/Content hub | High | Topical authority |
| Image optimization | High | Core Web Vitals |
| Internal linking | Medium | PageRank distribution |
| More Schema types | Medium | Rich results |
| Video SEO | Medium | Engagement + SERP features |
| Reviews integration | High | Trust + conversions |

---

## Technical SEO

### 3.1 Site Architecture

```
hennesseyestate.com/
├── / (Homepage - Landing Page)
├── /book (Booking Engine)
├── /rooms/ (NEW - Room Types Hub)
│   ├── /rooms/garden-suite
│   ├── /rooms/vineyard-view
│   ├── /rooms/main-house-queen
│   └── ... (10 room pages)
├── /amenities/ (NEW - Amenities Hub)
│   ├── /amenities/heated-pool
│   ├── /amenities/spa-sauna
│   ├── /amenities/wine-tasting
│   └── /amenities/breakfast
├── /experiences/ (NEW - Local Experiences)
│   ├── /experiences/wine-tasting-tours
│   ├── /experiences/hot-air-balloon
│   ├── /experiences/culinary-tours
│   └── /experiences/couples-retreats
├── /blog/ (NEW - Content Hub)
│   ├── /blog/napa-valley-wine-guide
│   ├── /blog/best-restaurants-napa
│   └── ... (ongoing content)
├── /about/ (NEW - About & History)
├── /gallery/ (NEW - Photo Gallery)
├── /contact/ (NEW - Contact Page)
├── /faq/ (NEW - Expanded FAQ)
└── /specials/ (NEW - Deals & Packages)
```

### 3.2 URL Structure Best Practices

```javascript
// GOOD URLs (implement)
/rooms/garden-suite-king
/experiences/napa-wine-tours
/blog/best-wineries-napa-valley-2026

// AVOID
/rooms?id=123
/page.php?category=amenities
/post/12345
```

### 3.3 Technical Implementation Checklist

#### Core Technical Elements

- [ ] **HTTPS Everywhere** - Force SSL redirect
- [ ] **WWW Canonicalization** - Redirect www to non-www (or vice versa)
- [ ] **Trailing Slash Consistency** - Pick one, redirect the other
- [ ] **XML Sitemap Updates** - Auto-generate on content changes
- [ ] **HTML Sitemap** - User-accessible sitemap page
- [ ] **404 Page Optimization** - Custom 404 with navigation + search
- [ ] **301 Redirects** - Redirect any old URLs or changed pages

#### Speed & Performance

- [ ] **Image Optimization** - WebP format, lazy loading, srcset
- [ ] **JavaScript Bundling** - Code splitting for React
- [ ] **CSS Critical Path** - Inline critical CSS
- [ ] **Caching Headers** - Browser and CDN caching
- [ ] **CDN Implementation** - Cloudflare or similar
- [ ] **Gzip/Brotli Compression** - Enable on server

#### Crawlability

- [ ] **Robots Meta Per Page** - Dynamic noindex for internal pages
- [ ] **Canonical Tags** - Self-referencing + cross-domain if needed
- [ ] **Hreflang** - If multi-language (future)
- [ ] **Pagination** - rel="prev/next" if applicable

### 3.4 Server Configuration

```nginx
# Nginx Configuration Recommendations

# Force HTTPS
server {
    listen 80;
    server_name hennesseyestate.com www.hennesseyestate.com;
    return 301 https://hennesseyestate.com$request_uri;
}

# Main Server Block
server {
    listen 443 ssl http2;
    server_name hennesseyestate.com;
    
    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Caching for static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## On-Page SEO

### 4.1 Keyword Strategy

#### Primary Keywords (High Intent - Conversion Focus)

| Keyword | Monthly Volume | Difficulty | Current Rank | Target |
|---------|---------------|------------|--------------|--------|
| napa valley bed and breakfast | 2,400 | 45 | TBD | Top 3 |
| luxury b&b napa | 880 | 38 | TBD | #1 |
| downtown napa hotel | 1,600 | 52 | TBD | Top 5 |
| napa valley boutique hotel | 720 | 41 | TBD | Top 3 |
| romantic getaway napa valley | 1,900 | 48 | TBD | Top 5 |
| napa valley inn with pool | 390 | 32 | TBD | #1 |
| historic inn napa | 210 | 28 | TBD | #1 |
| napa bed and breakfast with spa | 260 | 35 | TBD | #1 |

#### Secondary Keywords (Informational - Traffic Focus)

| Keyword | Monthly Volume | Content Type |
|---------|---------------|--------------|
| things to do in napa valley | 18,100 | Blog Post |
| best wineries napa valley | 14,800 | Blog Post |
| napa valley wine tasting | 9,900 | Experience Page |
| napa valley restaurants | 8,100 | Blog Post |
| when to visit napa valley | 2,900 | Blog Post |
| napa valley wedding venues | 2,400 | Experience Page |
| napa valley hot air balloon | 1,900 | Experience Page |
| oxbow market napa | 1,600 | Blog Post |

#### Long-Tail Keywords (Low Competition - Quick Wins)

| Keyword | Content Target |
|---------|---------------|
| bed and breakfast near oxbow market napa | Homepage / About |
| victorian inn napa valley california | Homepage |
| napa b&b with breakfast included | Homepage / Amenities |
| private estate rental napa valley | Buyout Page |
| where to stay in downtown napa walking distance | Location Section |
| napa valley accommodation with heated pool | Amenities / Pool |
| romantic bed breakfast wine country | Experiences / Couples |
| corporate retreat venue napa | Buyout Page |

### 4.2 Title Tag Templates

```html
<!-- Homepage -->
<title>Hennessey Estate | Luxury Bed & Breakfast in Downtown Napa Valley</title>

<!-- Booking Page -->
<title>Book Your Stay | Hennessey Estate - Napa Valley B&B</title>

<!-- Room Pages (template) -->
<title>{Room Name} | Luxury Suite at Hennessey Estate Napa</title>

<!-- Experience Pages (template) -->
<title>{Experience Name} in Napa Valley | Hennessey Estate</title>

<!-- Blog Posts (template) -->
<title>{Post Title} | Hennessey Estate Napa Valley Guide</title>

<!-- Amenity Pages (template) -->
<title>{Amenity} at Hennessey Estate | Napa Valley B&B</title>
```

### 4.3 Meta Description Templates

```html
<!-- Homepage (155-160 chars) -->
<meta name="description" content="Experience Victorian elegance at Hennessey Estate, a historic 1889 B&B in downtown Napa. 10 luxury rooms, heated pool, spa & gourmet breakfast. Book direct for best rates.">

<!-- Booking Page -->
<meta name="description" content="Book your luxury stay at Hennessey Estate. Choose from 10 ensuite rooms with pool, spa & breakfast included. Best rate guarantee when you book direct.">

<!-- Room Pages (template) -->
<meta name="description" content="Stay in the {Room Name} at Hennessey Estate. {Key Features}. Includes breakfast, pool & spa access. From ${Price}/night. Book your Napa Valley escape.">

<!-- Blog Posts (template) -->
<meta name="description" content="{Compelling summary of post content}. Expert tips from your hosts at Hennessey Estate B&B in downtown Napa Valley.">
```

### 4.4 Header Tag Structure (H1-H6)

```html
<!-- Homepage Structure -->
<h1>Luxury Bed & Breakfast in Downtown Napa Valley</h1>
  <h2>Our Rooms & Suites</h2>
    <h3>Garden Suite</h3>
    <h3>Vineyard View Room</h3>
  <h2>Estate Amenities</h2>
    <h3>Heated Pool & Spa</h3>
    <h3>Chef-Prepared Breakfast</h3>
  <h2>Location & Getting Here</h2>
  <h2>Guest Reviews</h2>
  <h2>Frequently Asked Questions</h2>

<!-- Room Page Structure -->
<h1>{Room Name} - Luxury Suite in Napa Valley</h1>
  <h2>Room Features & Amenities</h2>
  <h2>What's Included</h2>
  <h2>Pricing & Availability</h2>
  <h2>Guest Reviews for This Room</h2>
```

### 4.5 Content Optimization Guidelines

#### Keyword Density & Placement

- **Primary keyword:** In H1, first paragraph, 2-3x in body, meta title, URL
- **Secondary keywords:** H2s, image alt text, 1-2x in body
- **LSI keywords:** Naturally throughout content
- **Avoid keyword stuffing:** Max 1-2% density

#### Content Length Targets

| Page Type | Word Count | Rationale |
|-----------|------------|-----------|
| Homepage | 1,500-2,000 | Comprehensive but scannable |
| Room Pages | 500-800 | Features + booking focus |
| Amenity Pages | 600-1,000 | Detailed descriptions |
| Experience Pages | 1,000-1,500 | Guide-style content |
| Blog Posts | 1,500-3,000 | Authority building |
| FAQ Pages | 1,000-2,000 | Comprehensive answers |

### 4.6 Image SEO

```html
<!-- Optimized Image Example -->
<img 
  src="/images/hennessey-estate-heated-pool-napa-valley.webp"
  srcset="/images/pool-400.webp 400w,
          /images/pool-800.webp 800w,
          /images/pool-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Guests enjoying the heated pool at Hennessey Estate bed and breakfast in Napa Valley"
  title="Hennessey Estate Heated Pool"
  loading="lazy"
  width="1200"
  height="800"
  decoding="async"
/>
```

#### Image File Naming Convention

```
✅ GOOD:
hennessey-estate-garden-suite-king-bed.webp
napa-valley-bed-breakfast-pool-aerial.webp
victorian-breakfast-room-hennessey.webp

❌ AVOID:
IMG_3847.jpg
photo1.png
pool.jpeg
```

---

## Content Strategy

### 5.1 Content Pillars

```
                    HENNESSEY ESTATE
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ACCOMMODATION    EXPERIENCES     NAPA GUIDE
         │               │               │
    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
    │         │     │         │     │         │
  Rooms   Amenities Wine    Food   Wineries  Activities
    │         │     │         │     │         │
  Suite   Pool    Tours   Dining  Reviews   Events
  Types   Spa     Balloon  Cooking Rankings  Seasonal
          Breakfast Private  Classes         Calendar
```

### 5.2 Blog Content Calendar (First 6 Months)

#### Month 1: Foundation Content

| Week | Title | Target Keywords | Type |
|------|-------|-----------------|------|
| 1 | The Ultimate Guide to Napa Valley Wine Tasting | napa valley wine tasting guide | Pillar |
| 2 | 15 Best Wineries Near Downtown Napa (2026) | best wineries downtown napa | List |
| 3 | Where to Eat in Napa: Local's Guide to Restaurants | best restaurants napa valley | Guide |
| 4 | Planning the Perfect Romantic Getaway to Napa Valley | romantic getaway napa | Guide |

#### Month 2: Experience Content

| Week | Title | Target Keywords | Type |
|------|-------|-----------------|------|
| 1 | Hot Air Balloon Rides Over Napa Valley: Complete Guide | napa valley hot air balloon | Guide |
| 2 | Napa Valley Wine Train: Everything You Need to Know | napa valley wine train | Guide |
| 3 | Best Spa Experiences in Napa Valley | napa valley spa | List |
| 4 | 10 Hidden Gems: Lesser-Known Wineries Worth Visiting | hidden gem wineries napa | List |

#### Month 3: Seasonal Content

| Week | Title | Target Keywords | Type |
|------|-------|-----------------|------|
| 1 | Best Time to Visit Napa Valley (Month-by-Month Guide) | when to visit napa valley | Guide |
| 2 | Napa Valley in Spring: Mustard Season Guide | napa valley spring | Seasonal |
| 3 | Summer Events in Napa Valley 2026 | napa valley summer events | Events |
| 4 | Harvest Season in Napa: The Ultimate Fall Guide | napa valley harvest | Seasonal |

#### Month 4: Accommodation Content

| Week | Title | Target Keywords | Type |
|------|-------|-----------------|------|
| 1 | B&B vs Hotel: Why Choose a Napa Valley Bed & Breakfast | napa valley bed breakfast vs hotel | Comparison |
| 2 | Historic Inns of Napa Valley: A Victorian Journey | historic inns napa | History |
| 3 | What to Expect: Breakfast at a Napa Valley B&B | napa b&b breakfast | Experience |
| 4 | Downtown Napa: The Perfect Home Base for Wine Country | staying downtown napa | Location |

#### Month 5: Special Interest

| Week | Title | Target Keywords | Type |
|------|-------|-----------------|------|
| 1 | Napa Valley Bachelorette Party Planning Guide | napa bachelorette party | Planning |
| 2 | Corporate Retreats in Wine Country | napa valley corporate retreat | Business |
| 3 | Celebrating Anniversaries in Napa Valley | anniversary trip napa | Occasion |
| 4 | Girls Weekend in Napa: The Complete Itinerary | girls trip napa valley | Itinerary |

#### Month 6: Deep Dive Content

| Week | Title | Target Keywords | Type |
|------|-------|-----------------|------|
| 1 | Understanding Napa Valley Wine Appellations | napa valley AVAs | Educational |
| 2 | Farm-to-Table Dining: Napa's Culinary Revolution | napa valley farm to table | Culinary |
| 3 | Art & Culture in Napa Valley | napa valley art galleries | Culture |
| 4 | Sustainable Wine Practices in Napa Valley | napa valley sustainable wine | Trends |

### 5.3 Content Templates

#### Room Page Template

```markdown
# {Room Name} - Luxury Suite at Hennessey Estate

[Hero Image - Room Interior]

## Overview
{2-3 sentence compelling description}

## Room Features
- Square footage
- Bed configuration
- Bathroom details
- Special amenities

## What's Included
✓ Chef-prepared breakfast
✓ Pool, spa & sauna access
✓ Complimentary WiFi
✓ Evening wine reception
✓ Parking

## Pricing
From ${base_price}/night
[Check Availability Button]

## Guest Reviews
{3-5 recent reviews mentioning this room}

## You Might Also Like
{Related room suggestions}
```

#### Blog Post Template

```markdown
# {Compelling Title with Primary Keyword}

**Last Updated:** {Date}
**Reading Time:** {X} minutes

[Hero Image with descriptive alt text]

{Opening hook - 2-3 sentences}

## Table of Contents
1. Section 1
2. Section 2
...

## {Section 1 - H2 with secondary keyword}
{Content with internal links}

[Image with caption]

### {Subsection - H3}
{Detailed content}

## {Section 2}
...

## Where to Stay in Napa Valley
{Natural plug for Hennessey Estate}

## Frequently Asked Questions
{FAQ schema-ready Q&A}

## Plan Your Visit
{CTA to book}

---
**About the Author:** Written by the hosts at Hennessey Estate, a historic bed and breakfast in downtown Napa Valley.
```

---

## Local SEO

### 6.1 Google Business Profile Optimization

#### Profile Completeness Checklist

- [ ] **Business Name:** Hennessey Estate (exact match to website)
- [ ] **Primary Category:** Bed & Breakfast
- [ ] **Secondary Categories:** 
  - Hotel
  - Event Venue
  - Wedding Venue
  - Inn
- [ ] **Description:** 750 characters, keyword-rich
- [ ] **Address:** 1727 Main Street, Napa, CA 94559
- [ ] **Phone:** Primary business line
- [ ] **Website:** https://hennesseyestate.com
- [ ] **Hours:** 24/7 (hotel), office hours for calls
- [ ] **Attributes:**
  - Pool
  - Hot tub
  - Free breakfast
  - Free parking
  - Free WiFi
  - Air conditioning
  - Wheelchair accessible (if applicable)
  - LGBTQ+ friendly

#### Google Business Profile Posts Schedule

| Day | Post Type | Content |
|-----|-----------|---------|
| Monday | Update | Weekly wine events in Napa |
| Wednesday | Offer | Mid-week stay special |
| Friday | Event | Weekend happenings nearby |
| Sunday | Photo | Fresh property photo |

#### Review Response Templates

```
// Positive Review Response
Thank you so much for your wonderful review, {Name}! We're thrilled you enjoyed 
{specific detail they mentioned}. Our team works hard to create memorable 
experiences, and it means the world to hear we succeeded. We hope to welcome 
you back to Hennessey Estate soon! - The Hennessey Estate Team

// Constructive Feedback Response
Thank you for sharing your feedback, {Name}. We appreciate you taking the time 
to help us improve. We're sorry {specific issue} didn't meet your expectations. 
We've shared your comments with our team and are {action taken}. We'd love the 
opportunity to make it right - please reach out to us directly at 
info@hennesseyestate.com. - The Hennessey Estate Team
```

### 6.2 Local Citation Building

#### Priority Citations (Must Have)

| Platform | Status | Priority |
|----------|--------|----------|
| Google Business Profile | ✅ | Critical |
| Bing Places | □ | High |
| Apple Maps | □ | High |
| TripAdvisor | ✅ | Critical |
| Booking.com | ✅ | High |
| Yelp | □ | High |
| Facebook | □ | High |
| Expedia | □ | Medium |
| Hotels.com | □ | Medium |

#### Napa-Specific Citations

| Platform | Type |
|----------|------|
| Visit Napa Valley | Tourism Board |
| Napa Valley Wine Train Partners | Partner |
| Napa Chamber of Commerce | Business |
| Wine Country This Week | Publication |
| Napa Valley Register | News |

#### NAP Consistency (Critical)

```
EXACT FORMAT TO USE EVERYWHERE:

Name: Hennessey Estate
Address: 1727 Main Street, Napa, CA 94559
Phone: (XXX) XXX-XXXX

DO NOT USE:
- "Hennessey House" (old name variation)
- "1727 Main St" (abbreviated)
- Different phone formats
```

### 6.3 Local Content Strategy

#### Location-Based Landing Pages

```
/location/downtown-napa-accommodations
/location/walking-distance-oxbow-market
/location/near-napa-valley-wine-train
/location/minutes-from-silverado-trail
```

#### Local Event Content

- Napa Valley Film Festival (November)
- Bottle Rock Napa Valley (May)
- Auction Napa Valley (June)
- Harvest Season (August-October)
- Mustard Season (February-March)

---

## Schema Markup & Structured Data

### 7.1 Current Schema (Implemented)

```json
✅ LodgingBusiness - Complete
✅ FAQPage - 5 questions
✅ BreadcrumbList - Navigation
```

### 7.2 Additional Schema to Implement

#### Hotel Schema (Enhanced)

```json
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Hennessey Estate",
  "containsPlace": [
    {
      "@type": "HotelRoom",
      "name": "Garden Suite",
      "description": "Spacious garden-level suite with king bed and private patio",
      "bed": {
        "@type": "BedDetails",
        "typeOfBed": "King",
        "numberOfBeds": 1
      },
      "occupancy": {
        "@type": "QuantitativeValue",
        "minValue": 1,
        "maxValue": 2
      },
      "amenityFeature": [
        {"@type": "LocationFeatureSpecification", "name": "Private Patio"},
        {"@type": "LocationFeatureSpecification", "name": "Garden View"},
        {"@type": "LocationFeatureSpecification", "name": "Ensuite Bathroom"}
      ]
    }
    // ... repeat for each room type
  ]
}
```

#### Event Schema (For Specials/Packages)

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Romantic Valentine's Package at Hennessey Estate",
  "startDate": "2026-02-01",
  "endDate": "2026-02-28",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "Place",
    "name": "Hennessey Estate",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1727 Main Street",
      "addressLocality": "Napa",
      "addressRegion": "CA",
      "postalCode": "94559"
    }
  },
  "offers": {
    "@type": "Offer",
    "price": "599",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2026-01-01"
  },
  "description": "Celebrate love with our Valentine's package including champagne, roses, and couples spa treatment."
}
```

#### Article Schema (For Blog Posts)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The Ultimate Guide to Napa Valley Wine Tasting",
  "image": "https://hennesseyestate.com/blog/images/napa-wine-guide.jpg",
  "datePublished": "2026-01-15",
  "dateModified": "2026-01-15",
  "author": {
    "@type": "Organization",
    "name": "Hennessey Estate"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Hennessey Estate",
    "logo": {
      "@type": "ImageObject",
      "url": "https://hennesseyestate.com/logo.png"
    }
  },
  "description": "Expert guide to wine tasting in Napa Valley from your hosts at Hennessey Estate.",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://hennesseyestate.com/blog/napa-wine-guide"
  }
}
```

#### Review Aggregate Schema (Enhanced)

```json
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Hennessey Estate",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Sarah M."
      },
      "datePublished": "2026-01-05",
      "reviewBody": "Absolutely stunning property! The breakfast was incredible..."
    }
    // Add 5-10 recent reviews
  ]
}
```

#### SpeakableSpecification (For Voice Search)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".about-summary", ".location-summary", ".amenities-list"]
  },
  "name": "Hennessey Estate - Napa Valley B&B"
}
```

### 7.3 Schema Testing Checklist

- [ ] Test all schema with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Validate JSON-LD syntax with [Schema.org Validator](https://validator.schema.org/)
- [ ] Check for errors in Google Search Console
- [ ] Monitor rich result appearances

---

## Performance & Core Web Vitals

### 8.1 Core Web Vitals Targets

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| LCP (Largest Contentful Paint) | TBD | < 2.5s | Main content loads fast |
| FID (First Input Delay) | TBD | < 100ms | Page responds quickly |
| CLS (Cumulative Layout Shift) | TBD | < 0.1 | Visual stability |
| TTFB (Time to First Byte) | TBD | < 600ms | Server response time |
| FCP (First Contentful Paint) | TBD | < 1.8s | First content appears |

### 8.2 Performance Optimization Checklist

#### Images

- [ ] Convert all images to WebP format
- [ ] Implement responsive images with srcset
- [ ] Add explicit width/height to prevent CLS
- [ ] Lazy load below-fold images
- [ ] Compress images (target: < 100KB for thumbnails, < 300KB for heroes)
- [ ] Use CDN for image delivery

#### JavaScript

- [ ] Code split React bundles
- [ ] Defer non-critical JavaScript
- [ ] Remove unused dependencies
- [ ] Minify and compress all JS
- [ ] Implement tree shaking

#### CSS

- [ ] Extract and inline critical CSS
- [ ] Defer non-critical CSS
- [ ] Remove unused CSS (PurgeCSS)
- [ ] Minify CSS files
- [ ] Use CSS containment

#### Server/Hosting

- [ ] Enable HTTP/2 or HTTP/3
- [ ] Implement Brotli compression
- [ ] Set up CDN (Cloudflare recommended)
- [ ] Configure browser caching (1 year for static assets)
- [ ] Enable server-side caching

### 8.3 Implementation Code

```javascript
// React Lazy Loading for Route-Based Code Splitting
import React, { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('./components/LandingPage'));
const GuestBookingApp = lazy(() => import('./components/GuestBookingApp'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/book" element={<GuestBookingApp />} />
      </Routes>
    </Suspense>
  );
}
```

```html
<!-- Critical CSS Inlining -->
<style>
  /* Inline critical above-fold styles here */
  .hero { min-height: 100vh; }
  .nav { position: fixed; top: 0; }
</style>
<link rel="preload" href="/styles/main.css" as="style" onload="this.rel='stylesheet'">
```

---

## Mobile SEO

### 9.1 Mobile-First Requirements

- [ ] **Responsive Design:** All pages adapt to mobile screens
- [ ] **Touch Targets:** Minimum 48x48px for all interactive elements
- [ ] **Font Sizes:** Minimum 16px base font
- [ ] **No Horizontal Scroll:** Content fits viewport width
- [ ] **Fast Mobile Speed:** < 3s load on 3G
- [ ] **Mobile-Friendly Navigation:** Hamburger menu, easy access to booking

### 9.2 Mobile UX Checklist

```css
/* Mobile-First CSS Approach */
/* Base styles for mobile */
.booking-button {
  width: 100%;
  padding: 16px 24px;
  font-size: 18px;
  min-height: 48px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .booking-button {
    width: auto;
    padding: 12px 32px;
  }
}
```

### 9.3 Mobile-Specific Features

- [ ] **Click-to-Call:** Phone number with tel: link
- [ ] **Maps Integration:** One-tap directions
- [ ] **Mobile Booking Flow:** Streamlined checkout
- [ ] **App Install Banner:** PWA install prompt (optional)

---

## Link Building Strategy

### 10.1 Link Building Priorities

#### Tier 1: High Authority (DA 60+)

| Target | Strategy | Expected DA |
|--------|----------|-------------|
| TripAdvisor | Claim & optimize listing | 93 |
| Booking.com | Partner listing | 91 |
| Expedia/Hotels.com | Distribution | 89 |
| Yelp | Claim & respond to reviews | 94 |
| Visit California | Tourism partnership | 75 |

#### Tier 2: Niche Authority (DA 40-60)

| Target | Strategy |
|--------|----------|
| Wine Country publications | Guest posts, features |
| Travel bloggers | Hosted stays, reviews |
| Wedding blogs | Venue features |
| Luxury travel sites | Sponsored content |
| Food & wine publications | Chef profiles |

#### Tier 3: Local Authority (DA 20-40)

| Target | Strategy |
|--------|----------|
| Napa Valley Register | Press releases |
| Local event sites | Sponsorships |
| Chamber of Commerce | Membership |
| Wine associations | Partnerships |
| Local blogger outreach | Collaborations |

### 10.2 Content-Based Link Building

#### Linkable Asset Ideas

1. **"The Complete Napa Valley Wine Map"** - Interactive, embeddable
2. **"Napa Valley Events Calendar"** - Comprehensive, updated monthly
3. **"Victorian Architecture of Napa Valley"** - Historical feature
4. **"Napa Valley Statistics & Data"** - Annual tourism report
5. **"Wine Varietal Guide"** - Educational infographic

#### Guest Posting Targets

- TheKnot.com (weddings)
- CondéNastTraveler.com (luxury travel)
- WineEnthusiast.com (wine content)
- TravelAndLeisure.com (travel)
- SFGate.com (regional)

### 10.3 Digital PR Opportunities

#### Story Angles

1. **Historic Angle:** "Inside One of Napa's Last Victorian Bed & Breakfasts"
2. **Culinary Angle:** "Farm-to-Table Breakfast at a 135-Year-Old Estate"
3. **Sustainability:** "How Napa's Historic Inns Are Going Green"
4. **Local Economy:** "The Renaissance of Downtown Napa's Hospitality"
5. **Romantic Travel:** "Most Romantic Getaways Within 100 Miles of San Francisco"

---

## Analytics & Monitoring

### 11.1 Tools Setup

| Tool | Purpose | Priority |
|------|---------|----------|
| Google Analytics 4 | Traffic & conversions | Critical |
| Google Search Console | Search performance | Critical |
| Google Tag Manager | Event tracking | High |
| Bing Webmaster Tools | Bing search data | Medium |
| Ahrefs/SEMrush | Rank tracking, competitors | High |
| PageSpeed Insights | Performance monitoring | High |
| Screaming Frog | Technical audits | Medium |

### 11.2 Key Metrics Dashboard

#### Weekly Monitoring

- [ ] Organic sessions
- [ ] Keyword rankings (top 20)
- [ ] Click-through rate (CTR)
- [ ] Pages indexed
- [ ] Core Web Vitals

#### Monthly Reporting

- [ ] Organic traffic growth
- [ ] New keyword rankings
- [ ] Backlink profile changes
- [ ] Conversion rate from organic
- [ ] Local pack visibility
- [ ] Competitor comparison

### 11.3 Google Analytics 4 Events

```javascript
// Key Events to Track
gtag('event', 'begin_checkout', {
  currency: 'USD',
  value: roomPrice,
  items: [{ item_name: roomName }]
});

gtag('event', 'view_item', {
  currency: 'USD',
  value: roomPrice,
  items: [{ item_name: roomName }]
});

gtag('event', 'generate_lead', {
  currency: 'USD',
  value: estimatedValue
});

// Custom Events
gtag('event', 'room_gallery_view', { room_name: roomName });
gtag('event', 'amenity_click', { amenity_name: amenityName });
gtag('event', 'blog_scroll_depth', { depth: '75%', article: articleTitle });
```

### 11.4 Search Console Alerts

Set up alerts for:
- [ ] Indexing issues
- [ ] Mobile usability errors
- [ ] Manual actions
- [ ] Security issues
- [ ] Significant ranking drops

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

| Week | Tasks | Owner |
|------|-------|-------|
| 1 | Technical audit & fixes | Dev |
| 1 | Google Business Profile optimization | Marketing |
| 2 | Core Web Vitals improvements | Dev |
| 2 | Citation audit & cleanup | Marketing |
| 3 | Schema markup enhancements | Dev |
| 3 | Content audit & optimization | Content |
| 4 | Analytics setup & baseline | Analytics |
| 4 | Keyword research finalization | SEO |

### Phase 2: Content & Structure (Weeks 5-12)

| Week | Tasks |
|------|-------|
| 5-6 | Create room detail pages |
| 5-6 | Create amenity pages |
| 7-8 | Launch blog with first 4 pillar posts |
| 7-8 | Create experience pages |
| 9-10 | Internal linking optimization |
| 9-10 | Image optimization across site |
| 11-12 | Create local landing pages |
| 11-12 | FAQ page expansion |

### Phase 3: Authority Building (Weeks 13-24)

| Week | Tasks |
|------|-------|
| 13-14 | Guest posting outreach (5 targets) |
| 15-16 | Link building from directories |
| 17-18 | Digital PR campaign launch |
| 19-20 | Continued content publishing |
| 21-22 | Review generation campaign |
| 23-24 | Performance review & optimization |

### Phase 4: Scale & Optimize (Months 7-12)

- Expand content based on performance data
- Scale link building efforts
- Launch seasonal campaigns
- A/B test meta tags and content
- Pursue featured snippets
- Video content expansion

---

## Appendices

### A. Competitor Analysis

| Competitor | DA | Organic Traffic | Top Keywords |
|------------|----|--------------------|--------------|
| Competitor 1 | TBD | TBD | TBD |
| Competitor 2 | TBD | TBD | TBD |
| Competitor 3 | TBD | TBD | TBD |

### B. Technical SEO Audit Template

```
□ Title tags unique and optimized
□ Meta descriptions compelling
□ H1 tags present and unique
□ Image alt tags descriptive
□ Internal links contextual
□ External links working
□ Page speed acceptable
□ Mobile-friendly
□ Schema markup valid
□ Canonical tags correct
```

### C. Monthly SEO Checklist

```
Week 1:
□ Review Search Console for issues
□ Check ranking movements
□ Analyze top-performing content

Week 2:
□ Publish new blog content
□ Respond to new reviews
□ Update GBP posts

Week 3:
□ Monitor backlink profile
□ Check competitor rankings
□ Technical spot-check

Week 4:
□ Monthly report generation
□ Strategy adjustments
□ Next month planning
```

---

## Quick Reference: Priority Actions

### Immediate (This Week)
1. ✅ Verify Google Business Profile is claimed and complete
2. ✅ Submit sitemap to Google Search Console
3. ✅ Set up Google Analytics 4 with conversion tracking
4. □ Run PageSpeed Insights and fix critical issues
5. □ Verify all existing pages have unique titles/descriptions

### Short-Term (This Month)
1. □ Create 3 new landing pages (rooms, amenities, experiences)
2. □ Publish 2 pillar blog posts
3. □ Build 10 local citations
4. □ Add enhanced schema markup
5. □ Optimize all images (WebP, compression, alt text)

### Medium-Term (Quarter)
1. □ Launch full blog content calendar
2. □ Acquire 25+ quality backlinks
3. □ Achieve top 10 for 5 primary keywords
4. □ Improve Core Web Vitals to "Good"
5. □ Generate 20+ new reviews

---

*This SEO plan should be reviewed and updated quarterly based on performance data and algorithm changes.*
