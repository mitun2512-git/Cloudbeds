# Hennessey Estate - Quality Test Plan

## Complete Testing Guide for Guest Website & Staff Dashboard

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Scope:** Guest-facing Website, Booking Engine, and Staff Dashboard  

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Standards & Design System](#testing-standards--design-system)
3. [Guest Website Tests](#guest-website-tests)
4. [Guest Booking Engine Tests](#guest-booking-engine-tests)
5. [Staff Dashboard Tests](#staff-dashboard-tests)
6. [Cross-Cutting Concerns](#cross-cutting-concerns)
7. [Test Checklists](#test-checklists)

---

## Overview

### Application Architecture

| Component | Route | Description |
|-----------|-------|-------------|
| Landing Page | `/` | Public marketing website |
| Booking Engine | `/book` | Guest reservation flow |
| Website Editor | `/editor` | Content management |
| Staff Dashboard | `/dashboard/*` | Internal management system |

### Testing Environments

- **Development:** `localhost:3000` (frontend) + `localhost:3001` (backend)
- **Staging:** Render deployment preview URLs
- **Production:** Live URLs

### Supported Browsers

- Chrome (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (iOS 15+)
- Chrome for Android

### Supported Viewports

| Breakpoint | Width | Device Type |
|------------|-------|-------------|
| Mobile | 320px - 767px | Phones |
| Tablet | 768px - 1023px | Tablets, small laptops |
| Desktop | 1024px+ | Desktops, large laptops |

---

## Testing Standards & Design System

### Color Palette Compliance

All components must adhere to the established design system:

| Purpose | CSS Variable | Expected Value |
|---------|--------------|----------------|
| Background | `--color-bg` | `#f8f5f0` |
| Surface | `--color-surface` | `#ffffff` |
| Primary | `--color-primary` | `#9a7b4f` (gold/bronze) |
| Primary Hover | `--color-primary-hover` | `#b08d5b` |
| Accent | `--color-accent` | `#8fa396` (sage green) |
| Text | `--color-text` | `#2d2a26` |
| Text Secondary | `--color-text-secondary` | `#5c574f` |
| Text Muted | `--color-text-muted` | `#8a847a` |
| Border | `--color-border` | `#e5ddd0` |
| Success | `--color-success` | `#5a8a6b` |
| Warning | `--color-warning` | `#c4956a` |
| Danger | `--color-danger` | `#b5706a` |

#### Color Test Criteria

- [ ] Primary CTA buttons use `--color-primary` background
- [ ] All text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- [ ] Hover states are visually distinct but within palette
- [ ] Error states use `--color-danger`
- [ ] Success states use `--color-success`
- [ ] Warning states use `--color-warning`
- [ ] No hardcoded color values outside design system

### Typography Standards

| Element | Font Family | Weight | Size |
|---------|-------------|--------|------|
| Headings (h1-h4) | Cormorant Garamond | 500 | Varies |
| Body Text | Lato | 400 | 0.9375rem |
| Labels | Lato | 600 | 0.8125rem |
| Buttons | Lato | 600 | 0.875rem |
| Small Text | Lato | 400 | 0.75rem |

#### Typography Test Criteria

- [ ] All headings use serif font (Cormorant Garamond)
- [ ] Body text uses sans-serif (Lato)
- [ ] Font weights are consistent across similar elements
- [ ] Letter spacing matches design spec
- [ ] Line height provides adequate readability (1.6 base)

### Spacing Standards

| Size | Variable | Value |
|------|----------|-------|
| XS | `--spacing-xs` | 4px |
| SM | `--spacing-sm` | 8px |
| MD | `--spacing-md` | 16px |
| LG | `--spacing-lg` | 24px |
| XL | `--spacing-xl` | 32px |
| 2XL | `--spacing-2xl` | 48px |

#### Spacing Test Criteria

- [ ] Consistent padding within card components
- [ ] Adequate margin between sections
- [ ] Form fields have proper spacing
- [ ] No visual crowding of elements
- [ ] Responsive spacing adjustments on mobile

### Border Radius Standards

| Size | Variable | Value |
|------|----------|-------|
| SM | `--radius-sm` | 4px |
| MD | `--radius-md` | 8px |
| LG | `--radius-lg` | 12px |
| XL | `--radius-xl` | 16px |

---

## Guest Website Tests

### LandingPage.js (`/`)

#### 1. Navigation Header

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-NAV-001 | Logo displays correctly | Hennessey Estate logo visible at proper size | High |
| LP-NAV-002 | Scroll state transition | Header becomes opaque after 50px scroll | Medium |
| LP-NAV-003 | Navigation links functional | All links scroll to correct sections | High |
| LP-NAV-004 | "Book Now" CTA visible | Button prominently displayed in header | High |
| LP-NAV-005 | Mobile menu toggle | Hamburger opens/closes mobile menu | High |
| LP-NAV-006 | Mobile menu overlay | Background darkens when menu open | Medium |

**Visual Checks:**
- [ ] Logo sizing: max-width matches design
- [ ] Nav link spacing: consistent gaps between items
- [ ] Scroll transition smooth (not jarring)
- [ ] Mobile hamburger alignment (right side)

#### 2. Hero Section

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-HERO-001 | Video background plays | Autoplay, muted, looping video | High |
| LP-HERO-002 | Fallback image loads | Static image when video unavailable | High |
| LP-HERO-003 | Hero text hierarchy | Title, subtitle properly styled | High |
| LP-HERO-004 | Trust badges display | Star ratings, review count visible | Medium |
| LP-HERO-005 | CTA button prominent | "Book Your Escape" button clickable | High |
| LP-HERO-006 | Quick facts visible | 10 Rooms, Est. 1889, etc. | Medium |
| LP-HERO-007 | Scroll indicator animates | Bouncing arrow at bottom | Low |

**Visual Checks:**
- [ ] Overlay darkness: readable text over video
- [ ] CTA button contrast: passes AA standards
- [ ] Title uses serif font
- [ ] Mobile: hero text doesn't overflow
- [ ] Desktop: hero fills viewport height

#### 3. Quick Info Bar

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-INFO-001 | All items display | Location, check-in, contact info | Medium |
| LP-INFO-002 | Phone number clickable | `tel:` link on mobile | High |
| LP-INFO-003 | Icons render correctly | SVG icons properly sized | Low |

**Visual Checks:**
- [ ] Background color matches design
- [ ] Consistent icon sizing (20-24px)
- [ ] Text alignment: centered items
- [ ] Mobile: stacks vertically

#### 4. Full Property Buyout Section

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-BUYOUT-001 | Section visible | Buyout option prominently displayed | High |
| LP-BUYOUT-002 | Feature icons render | Hot tub, pool, wine SVGs | Medium |
| LP-BUYOUT-003 | CTA links to booking | Direct to `/book?buyout=true` | High |
| LP-BUYOUT-004 | Background image loads | Estate aerial/exterior photo | Medium |

**Visual Checks:**
- [ ] Background overlay: text readable
- [ ] Badge styling: distinct appearance
- [ ] Feature grid alignment
- [ ] Mobile: single column layout

#### 5. Reviews Carousel

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-REV-001 | Auto-rotation works | Reviews change every 5 seconds | Medium |
| LP-REV-002 | Pause on hover | Rotation stops when hovering | Medium |
| LP-REV-003 | Manual navigation | Dots/arrows change review | High |
| LP-REV-004 | Rating display | Stars accurately represent score | High |
| LP-REV-005 | Platform badges | Google/TripAdvisor scores shown | Medium |

**Visual Checks:**
- [ ] Card shadow: subtle elevation
- [ ] Quote marks or styling for testimonials
- [ ] Star color: gold/yellow
- [ ] Smooth transition between reviews

#### 6. Rooms Section

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-ROOMS-001 | Room image loads | High-quality interior photo | High |
| LP-ROOMS-002 | Pricing visible | "From $XXX/night" displayed | High |
| LP-ROOMS-003 | Features list | Amenities bullet points | Medium |
| LP-ROOMS-004 | CTA links to booking | "View Rooms" → `/book` | High |

**Visual Checks:**
- [ ] Image aspect ratio maintained
- [ ] Price typography: larger/bolder
- [ ] Feature checkmarks aligned
- [ ] Mobile: image above text

#### 7. Content Sections (Pool, Tasting Room, Breakfast, Sauna)

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-CONT-001 | Alternating layout | Left-right pattern maintained | Medium |
| LP-CONT-002 | Images lazy load | Performance optimization active | Medium |
| LP-CONT-003 | "Read more" expands | Mobile truncation toggle works | Medium |
| LP-CONT-004 | Section CTAs work | All buttons navigate correctly | High |

**Visual Checks:**
- [ ] Alternating background colors (cream/green)
- [ ] Image-text balance
- [ ] Consistent padding between sections
- [ ] Mobile: full-width images

#### 8. Amenities Grid

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-AMEN-001 | All amenities display | 10+ amenity items shown | High |
| LP-AMEN-002 | Icons render correctly | Custom SVG icons visible | Medium |
| LP-AMEN-003 | Grid responsive | Adjusts columns on resize | Medium |

**Visual Checks:**
- [ ] Icon consistency: same stroke weight
- [ ] Equal grid cell sizing
- [ ] Label typography consistent
- [ ] Hover states (if applicable)

#### 9. Gallery Section

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-GAL-001 | Category carousels work | Each category scrollable | High |
| LP-GAL-002 | Auto-advance images | 4-second rotation | Medium |
| LP-GAL-003 | Navigation arrows work | Manual prev/next functional | High |
| LP-GAL-004 | Dots indicate position | Active dot highlighted | Medium |
| LP-GAL-005 | Full-size on click | Opens larger image view | Medium |

**Visual Checks:**
- [ ] Image quality: no pixelation
- [ ] Carousel transition: smooth
- [ ] Arrow positioning: edges of container
- [ ] Mobile: touch swipe support

#### 10. Location Section

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-LOC-001 | Background image loads | Napa Valley scenic photo | Medium |
| LP-LOC-002 | Address displays | Full street address visible | High |
| LP-LOC-003 | Location description | Downtown Napa context | Medium |

**Visual Checks:**
- [ ] Text overlay: readable on background
- [ ] Consistent spacing
- [ ] CTA button styling

#### 11. Newsletter Section

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-NEWS-001 | Email input validates | Requires valid email format | High |
| LP-NEWS-002 | Submit shows feedback | Success/error message | High |
| LP-NEWS-003 | Placeholder text clear | "Your email address" | Low |

**Visual Checks:**
- [ ] Input field sizing
- [ ] Button alignment (inline or stacked)
- [ ] Success state styling

#### 12. Footer

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-FOOT-001 | Contact info displays | Address, email visible | High |
| LP-FOOT-002 | Social links work | Instagram, Pinterest, etc. | Medium |
| LP-FOOT-003 | Legal links present | Privacy, Terms | Low |
| LP-FOOT-004 | Copyright year correct | Dynamic year (2026) | Low |

**Visual Checks:**
- [ ] Column alignment
- [ ] Social icon sizing
- [ ] Link hover states
- [ ] Bottom padding sufficient

#### 13. Mobile Floating Reserve Button

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| LP-MOB-001 | Button appears on mobile | Fixed position "Stay Here" | High |
| LP-MOB-002 | Links to booking | Navigates to Cloudbeds | High |
| LP-MOB-003 | Doesn't obstruct content | Positioned at bottom | Medium |

**Visual Checks:**
- [ ] Z-index: above other content
- [ ] Safe area respect on iPhone
- [ ] Finger-friendly size (44px min)

---

## Guest Booking Engine Tests

### GuestBookingApp.js (`/book`)

#### 1. Global Header

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-HDR-001 | Logo links to landing | Click → navigate to `/` | High |
| GBA-HDR-002 | Contact email visible | info@hennesseyestate.com | Medium |
| GBA-HDR-003 | Logo displays correctly | Proper sizing and alignment | High |

**Visual Checks:**
- [ ] Header background: white/transparent
- [ ] Logo sizing matches landing page
- [ ] Horizontal centering

#### 2. Progress Bar

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-PROG-001 | Steps display correctly | Dates → Room → Extras → Details → Payment | High |
| GBA-PROG-002 | Active step highlighted | Current step visually distinct | High |
| GBA-PROG-003 | Completed steps show check | ✓ icon for past steps | Medium |
| GBA-PROG-004 | Progress hidden on confirmation | Bar removed after booking | Medium |

**Visual Checks:**
- [ ] Step indicator sizing
- [ ] Active state: primary color
- [ ] Completed state: checkmark
- [ ] Mobile: labels may hide (icons only)

#### 3. Step 1: Date Selection

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-DATE-001 | Calendar renders | Two-month view displays | High |
| GBA-DATE-002 | Past dates disabled | Cannot select before today | High |
| GBA-DATE-003 | Check-in selection | First click sets check-in | High |
| GBA-DATE-004 | Check-out selection | Second click sets check-out | High |
| GBA-DATE-005 | Range highlighting | Days between dates highlighted | Medium |
| GBA-DATE-006 | Nights calculation | "X nights" displays correctly | High |
| GBA-DATE-007 | Clear dates button | × clears selection | Medium |
| GBA-DATE-008 | Month navigation | ← → arrows change months | High |
| GBA-DATE-009 | Guest count selection | Adults/children dropdowns | Medium |
| GBA-DATE-010 | Continue validation | Button disabled without valid dates | High |
| GBA-DATE-011 | Property info shows | Amenities, policies visible below | Medium |

**Visual Checks:**
- [ ] Calendar cell sizing: touch-friendly
- [ ] Selected date: filled primary color
- [ ] Range dates: subtle highlight
- [ ] Today: distinct styling
- [ ] Weekend vs weekday (if different)
- [ ] Month label: readable
- [ ] Date picker boxes: active state styling

#### 4. Step 2: Room Selection

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-ROOM-001 | Rooms load from API | Available rooms display | High |
| GBA-ROOM-002 | Loading state shown | Spinner while fetching | Medium |
| GBA-ROOM-003 | Room cards display | Name, price, availability | High |
| GBA-ROOM-004 | Total Buyout option | Separate prominent section | High |
| GBA-ROOM-005 | Low availability badge | "Only X left!" shows | Medium |
| GBA-ROOM-006 | Room selection toggle | Click selects/deselects | High |
| GBA-ROOM-007 | Selected state visual | Card border/highlight | High |
| GBA-ROOM-008 | Price calculation | Total for # nights shown | High |
| GBA-ROOM-009 | No availability message | Graceful empty state | Medium |
| GBA-ROOM-010 | Back navigation | Return to date selection | High |
| GBA-ROOM-011 | Continue validation | Disabled without room selection | High |

**Visual Checks:**
- [ ] Card shadow/border
- [ ] Price typography: prominent
- [ ] "per night" vs "total" distinction
- [ ] Buyout card: distinct styling
- [ ] Selected card: primary border
- [ ] Grid responsiveness: 1-3 columns

#### 5. Step 3: Add-ons Selection

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-ADD-001 | Add-ons grid displays | 6 options: breakfast, cleaning, etc. | High |
| GBA-ADD-002 | Toggle selection | Click adds/removes add-on | High |
| GBA-ADD-003 | Price calculation | Dynamic based on nights/guests | High |
| GBA-ADD-004 | Running total updates | Summary shows selections | High |
| GBA-ADD-005 | Skip button works | Can bypass add-ons | Medium |
| GBA-ADD-006 | Back navigation | Return to room selection | High |

**Visual Checks:**
- [ ] Icon sizing per add-on
- [ ] Selected state: checkmark or highlight
- [ ] Price breakdown clarity
- [ ] Summary section alignment

#### 6. Step 4: Guest Details

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-GUEST-001 | Required fields marked | * on first name, last name, email, phone | High |
| GBA-GUEST-002 | Email validation | Invalid format shows error | High |
| GBA-GUEST-003 | Phone validation | Required field validates | High |
| GBA-GUEST-004 | Error messages display | Red text under invalid fields | High |
| GBA-GUEST-005 | Optional fields work | Address, city, state, zip | Medium |
| GBA-GUEST-006 | Special requests textarea | Multi-line input functional | Medium |
| GBA-GUEST-007 | Continue validation | Disabled without required fields | High |
| GBA-GUEST-008 | Back navigation | Return to add-ons | High |

**Visual Checks:**
- [ ] Form field spacing
- [ ] Label alignment (above inputs)
- [ ] Error state: red border + message
- [ ] Focus state: primary color border
- [ ] Two-column layout on desktop

#### 7. Step 5: Payment (Stripe Elements)

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-PAY-001 | Stripe card element loads | Card input field appears | Critical |
| GBA-PAY-002 | Card validation | Invalid card shows error | High |
| GBA-PAY-003 | Booking summary displays | Room, add-ons, taxes, total | High |
| GBA-PAY-004 | Guest summary displays | Name, email, phone | High |
| GBA-PAY-005 | Submit processing state | "Processing..." with spinner | High |
| GBA-PAY-006 | Error handling | Network/API errors shown | High |
| GBA-PAY-007 | Back navigation | Return to guest details | High |
| GBA-PAY-008 | Tax calculation | 15% TOT correctly calculated | High |
| GBA-PAY-009 | Security messaging | Lock icon, encryption text | Medium |

**Visual Checks:**
- [ ] Stripe element styling matches app
- [ ] Summary card layout
- [ ] Price alignment (right-justified)
- [ ] CTA button prominence
- [ ] Processing overlay (if used)

#### 8. Step 6: Confirmation

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-CONF-001 | Success icon displays | Large checkmark visible | High |
| GBA-CONF-002 | Confirmation number shows | Reservation ID from API | High |
| GBA-CONF-003 | Booking details correct | Dates, room, guest info | High |
| GBA-CONF-004 | Check-in/out times | 4:00 PM / 11:00 AM | Medium |
| GBA-CONF-005 | Contact information | Email, address shown | Medium |
| GBA-CONF-006 | "Book Another" button | Resets flow to Step 1 | Medium |
| GBA-CONF-007 | Email confirmation note | "Email sent to..." | Medium |

**Visual Checks:**
- [ ] Success state: celebratory styling
- [ ] Logo at top
- [ ] Card-based detail layout
- [ ] Typography hierarchy

#### 9. Processing Overlay

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-OVER-001 | Overlay blocks interaction | Cannot click behind | High |
| GBA-OVER-002 | Spinner animates | Loading indicator visible | Medium |
| GBA-OVER-003 | Message displays | "Securing your reservation..." | Low |

**Visual Checks:**
- [ ] Semi-transparent backdrop
- [ ] Centered loading content
- [ ] Z-index above all content

#### 10. Footer

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GBA-FOOT-001 | Copyright displays | "© 2026 Hennessey Estate" | Low |
| GBA-FOOT-002 | Legal links present | Privacy, Terms | Low |

---

## Staff Dashboard Tests

### App.js - StaffDashboard (`/dashboard/*`)

#### 1. Sidebar Navigation

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| SD-NAV-001 | Logo click → Home | Returns to homepage view | Medium |
| SD-NAV-002 | All nav items work | Each button changes view | High |
| SD-NAV-003 | Active state displays | Current section highlighted | High |
| SD-NAV-004 | Collapse toggle works | Sidebar shrinks to icons | High |
| SD-NAV-005 | Guest Booking Engine link | Opens `/book` in same window | High |
| SD-NAV-006 | Website Editor link | Opens `/editor` | Medium |
| SD-NAV-007 | Icons display correctly | SVG icons render | Medium |

**Visual Checks:**
- [ ] Sidebar width: 280px expanded, 70px collapsed
- [ ] Active item: gold background
- [ ] Hover states on all items
- [ ] Icon alignment in collapsed state
- [ ] Logo visibility in expanded only

#### 2. Mobile Sidebar

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| SD-MOB-001 | Hamburger button appears | Visible on mobile | High |
| SD-MOB-002 | Sidebar slides in/out | Smooth transition | High |
| SD-MOB-003 | Overlay appears | Dark backdrop on open | Medium |
| SD-MOB-004 | Overlay closes sidebar | Click outside closes | High |

**Visual Checks:**
- [ ] Z-index layering correct
- [ ] Animation smoothness
- [ ] Overlay opacity

#### 3. Main Header

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| SD-HDR-001 | Title updates per view | Correct page title shown | High |
| SD-HDR-002 | Subtitle displays | Helpful description per page | Medium |

**Visual Checks:**
- [ ] Title typography: serif font
- [ ] Subtitle: muted color
- [ ] Header spacing consistent

#### 4. Data Refresh Footer

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| SD-FOOT-001 | Last sync time shows | "Data last synced: X ago" | High |
| SD-FOOT-002 | Stats display | Reservation/guest counts | Medium |
| SD-FOOT-003 | Manual refresh works | Button triggers cache refresh | High |
| SD-FOOT-004 | Refreshing state shown | "Refreshing data..." | Medium |

**Visual Checks:**
- [ ] Fixed position at bottom
- [ ] Button styling
- [ ] Responsive on mobile

#### 5. ChatBot Component

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| SD-CHAT-001 | Chat bubble appears | Fixed position corner | High |
| SD-CHAT-002 | Click opens chat | Panel expands | High |
| SD-CHAT-003 | Messages send/receive | Bidirectional communication | High |
| SD-CHAT-004 | Close button works | Panel collapses | High |

---

### Homepage.js (Dashboard Home)

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| HOME-001 | Hero section displays | AI concierge intro | High |
| HOME-002 | Chat interface loads | Message input, send button | High |
| HOME-003 | Welcome message shows | Initial assistant greeting | High |
| HOME-004 | Messages send correctly | User input → API → response | High |
| HOME-005 | Quick actions work | Pre-filled queries trigger | High |
| HOME-006 | Feature cards display | Reservations, Availability, Email | High |
| HOME-007 | Feature cards navigate | Click → changes dashboard view | High |
| HOME-008 | Typing indicator shows | Animation during API call | Medium |
| HOME-009 | Live data badge shows | "Live data from Cloudbeds" | Low |
| HOME-010 | Stats section displays | Gemini 3, Real-time, Secure, 24/7 | Low |

**Visual Checks:**
- [ ] Chat avatar styling (H circle)
- [ ] Message bubbles: user vs assistant
- [ ] Quick action buttons: pill styling
- [ ] Feature cards: hover elevation
- [ ] Markdown rendering in messages

---

### DailyReservations.js

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| RES-001 | Reservations load | Table populates from API | High |
| RES-002 | Loading state shows | Spinner during fetch | Medium |
| RES-003 | Stats row displays | In House, Confirmed, etc. counts | High |
| RES-004 | Quick actions work | Outstanding, Breakfast, Cleaning | High |
| RES-005 | Action panels expand | Show filtered lists | High |
| RES-006 | Table headers correct | Guest, Dates, Room, Total, Status | High |
| RES-007 | Row expansion works | Click shows details | High |
| RES-008 | Status badges styled | Confirmed=green, etc. | High |
| RES-009 | Currency formatting | Proper $ symbol and commas | Medium |
| RES-010 | Date formatting | "Jan 7" style | Medium |
| RES-011 | Refresh button works | Re-fetches data | Medium |
| RES-012 | Empty state shows | Message when no reservations | Medium |
| RES-013 | Balance highlight | Red if outstanding balance | Medium |

**Visual Checks:**
- [ ] Table alternating row colors
- [ ] Expandable row transition
- [ ] Status badge color mapping
- [ ] Quick action button styling
- [ ] Panel slide animation

---

### AvailabilityChecker.js

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| AVAIL-001 | Date inputs work | Check-in/out selection | High |
| AVAIL-002 | Check-in minimum | Cannot select past dates | High |
| AVAIL-003 | Check-out minimum | Must be after check-in | High |
| AVAIL-004 | Search button works | Triggers API call | High |
| AVAIL-005 | Loading state shows | Spinner during fetch | Medium |
| AVAIL-006 | Room cards display | Available rooms shown | High |
| AVAIL-007 | Availability count | "X rooms available" badge | High |
| AVAIL-008 | Pricing displays | Per-night rate shown | High |
| AVAIL-009 | Night count shown | "X nights" in header | Medium |
| AVAIL-010 | Empty state handles | No rooms message | Medium |
| AVAIL-011 | Error handling | Network error message | Medium |

**Visual Checks:**
- [ ] Date input styling
- [ ] Room card grid layout
- [ ] Price alignment
- [ ] Availability badge color (green)
- [ ] Empty state icon/message

---

### RevenueDashboard.js

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| REV-001 | KPI cards load | 5 main metrics display | High |
| REV-002 | Year filter works | 2025/2026 toggle | High |
| REV-003 | Chart renders | Bar chart for monthly data | High |
| REV-004 | Chart toggle works | Revenue/ADR/Occ/RevPAR switch | High |
| REV-005 | Current month summary | Month-to-date values | Medium |
| REV-006 | Performance table loads | Metric breakdown | Medium |
| REV-007 | Competitor pricing shows | Competitive rates list | Medium |
| REV-008 | Distribution chart | Pie/bar for sources | Medium |
| REV-009 | Pickup report loads | Recent booking activity | High |
| REV-010 | Pickup selectors work | Lookback/forward periods | Medium |
| REV-011 | Pickup chart renders | Daily pickup bars | Medium |
| REV-012 | Change indicators | ↑↓ arrows with percentages | Medium |
| REV-013 | Loading state | Spinner during fetch | Medium |
| REV-014 | Error state | Failure message | Medium |

**Visual Checks:**
- [ ] KPI card spacing
- [ ] Change indicator colors (green/red)
- [ ] Chart bar sizing
- [ ] Legend positioning
- [ ] Two-column layout on desktop

---

### DynamicPricing.js

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| PRICE-001 | Tab navigation works | Calendar/Forecast/Config | High |
| PRICE-002 | Calendar loads | Monthly grid displays | High |
| PRICE-003 | Month navigation | Prev/Next changes month | High |
| PRICE-004 | Day cells show multiplier | ×1.25 format | High |
| PRICE-005 | Day cells show price | Base price shown | High |
| PRICE-006 | Price level colors | Low→Premium gradient | High |
| PRICE-007 | Event badges display | 🎉 on event days | Medium |
| PRICE-008 | Day click expands | Room prices panel opens | High |
| PRICE-009 | Room prices calculated | All room types listed | High |
| PRICE-010 | Monthly summary shows | Avg multiplier, counts | Medium |
| PRICE-011 | Forecast view loads | Revenue projections | High |
| PRICE-012 | Historical data shows | Year-over-year bars | Medium |
| PRICE-013 | Config view loads | Room pricing inputs | High |
| PRICE-014 | Config changes save | localStorage persistence | High |
| PRICE-015 | Reset to defaults | Restores original values | Medium |
| PRICE-016 | Legend displays | Price level key | Medium |

**Visual Checks:**
- [ ] Calendar grid alignment
- [ ] Color coding consistency
- [ ] Day cell sizing (square)
- [ ] Selected day highlight
- [ ] Room prices panel styling
- [ ] Forecast chart sizing

---

### EmailMarketing.js

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| EMAIL-001 | Insights cards load | Reservation analysis | High |
| EMAIL-002 | Strategies display | 5 campaign cards | High |
| EMAIL-003 | Strategy selection | Click highlights card | High |
| EMAIL-004 | Guest list shows | Filtered by strategy | High |
| EMAIL-005 | Guest selection | Click shows email preview | High |
| EMAIL-006 | Email preview renders | Formatted template | High |
| EMAIL-007 | Email editor opens | Block-based editing | High |
| EMAIL-008 | Draft saves | API call succeeds | High |
| EMAIL-009 | Test email sends | To specified address | High |
| EMAIL-010 | Campaign sends | To all recipients | High |
| EMAIL-011 | AI assistant opens | Gemini integration | Medium |
| EMAIL-012 | Campaign analytics | Tracking stats display | Medium |
| EMAIL-013 | Validation badges | Campaign readiness | Medium |
| EMAIL-014 | Completed strategies | History section | Low |
| EMAIL-015 | Drafts list | Saved drafts shown | Medium |
| EMAIL-016 | Campaigns list | Sent campaigns shown | Medium |

**Visual Checks:**
- [ ] Insight card colors by status
- [ ] Strategy card layout
- [ ] Guest list scrolling
- [ ] Email preview: realistic styling
- [ ] Modal overlay styling
- [ ] Button grouping

---

### RevenueAudit.js

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| AUDIT-001 | Data loads from API | Revenue breakdown displays | High |
| AUDIT-002 | Table renders | Reservation details | High |
| AUDIT-003 | Column sorting | Click headers to sort | Medium |
| AUDIT-004 | Totals calculated | Summary row at bottom | High |
| AUDIT-005 | Loading state | Spinner during fetch | Medium |

**Visual Checks:**
- [ ] Table column widths
- [ ] Numeric alignment (right)
- [ ] Currency formatting

---

### CompetitiveBenchmark.js

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| BENCH-001 | Overview tab loads | Hennessey hero card | High |
| BENCH-002 | Ranking table shows | 5 properties sorted | High |
| BENCH-003 | KPI comparison bars | ADR, Occupancy, RevPAR | High |
| BENCH-004 | Tab navigation works | Overview/Trends/Pricing/Quality/Summary | High |
| BENCH-005 | Monthly trends chart | Bar chart comparison | High |
| BENCH-006 | Pricing calendar shows | 6-month price grid | Medium |
| BENCH-007 | Quality matrix shows | Review/amenity scores | Medium |
| BENCH-008 | Summary sections | Actionable recommendations | High |
| BENCH-009 | Property detail modal | Click row shows detail | Medium |
| BENCH-010 | Amenity comparison | Table shows features | Medium |

**Visual Checks:**
- [ ] Hero card prominence
- [ ] Ranking icons (🥇🥈🥉)
- [ ] Bar chart proportions
- [ ] Color coding for properties
- [ ] Tab active state

---

### GuestChatDashboard.js

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| GCHAT-001 | Conversations list | Past chats displayed | High |
| GCHAT-002 | Conversation selection | Click shows messages | High |
| GCHAT-003 | Message history | Full thread visible | High |
| GCHAT-004 | Loading state | Spinner during fetch | Medium |
| GCHAT-005 | Empty state | No conversations message | Medium |

**Visual Checks:**
- [ ] Conversation list styling
- [ ] Message bubble alignment
- [ ] Timestamp formatting

---

### WebsiteEditor.js (`/editor`)

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| EDIT-001 | Editor loads | Content blocks display | High |
| EDIT-002 | Section list shows | Navigation sidebar | High |
| EDIT-003 | Section selection | Click loads section content | High |
| EDIT-004 | Text editing works | Inline content changes | High |
| EDIT-005 | Image editing works | Upload/URL change | Medium |
| EDIT-006 | Save functionality | Changes persist | High |
| EDIT-007 | Preview toggle | Show/hide mode | Medium |
| EDIT-008 | Reset functionality | Revert to defaults | Medium |

**Visual Checks:**
- [ ] Editor panel layout
- [ ] Input field styling
- [ ] Preview accuracy

---

## Cross-Cutting Concerns

### Accessibility (WCAG 2.1 AA)

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| A11Y-001 | Keyboard navigation | All interactive elements focusable | High |
| A11Y-002 | Focus visible | Outline on focused elements | High |
| A11Y-003 | Alt text on images | Descriptive alt attributes | High |
| A11Y-004 | ARIA labels | Buttons, inputs labeled | High |
| A11Y-005 | Color contrast | 4.5:1 ratio minimum | High |
| A11Y-006 | Form labels | Labels associated with inputs | High |
| A11Y-007 | Skip links | Skip to main content | Medium |
| A11Y-008 | Screen reader testing | VoiceOver/NVDA compatibility | Medium |

### Performance

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| PERF-001 | Lighthouse score | 80+ performance | High |
| PERF-002 | First Contentful Paint | < 2s | High |
| PERF-003 | Largest Contentful Paint | < 3s | High |
| PERF-004 | Time to Interactive | < 4s | High |
| PERF-005 | Image optimization | WebP, proper sizing | Medium |
| PERF-006 | Code splitting | Lazy loading routes | Medium |
| PERF-007 | Bundle size | < 500KB main bundle | Medium |

### SEO

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| SEO-001 | Page titles | Unique, descriptive | High |
| SEO-002 | Meta descriptions | Present and accurate | High |
| SEO-003 | robots.txt | Dashboard excluded | High |
| SEO-004 | sitemap.xml | Public pages included | Medium |
| SEO-005 | Semantic HTML | Proper heading hierarchy | Medium |
| SEO-006 | Open Graph tags | Social sharing metadata | Low |

### Security

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| SEC-001 | HTTPS enforcement | All requests over TLS | Critical |
| SEC-002 | No exposed secrets | API keys not in client | Critical |
| SEC-003 | XSS prevention | User input sanitized | High |
| SEC-004 | CSRF protection | Token validation | High |
| SEC-005 | Secure cookies | HttpOnly, Secure flags | High |
| SEC-006 | Content Security Policy | Headers configured | Medium |

### Error Handling

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| ERR-001 | Network failure | Graceful error message | High |
| ERR-002 | API errors | User-friendly messages | High |
| ERR-003 | 404 pages | Custom not found page | Medium |
| ERR-004 | Validation errors | Field-level feedback | High |
| ERR-005 | Recovery options | Retry buttons where appropriate | Medium |

---

## Test Checklists

### Pre-Release Checklist

#### Visual Quality
- [ ] All images load correctly (no broken images)
- [ ] All icons render (no missing SVGs)
- [ ] Fonts load correctly (no FOUT/FOIT issues)
- [ ] Colors match design system
- [ ] Spacing is consistent throughout
- [ ] Alignment issues resolved
- [ ] No horizontal scrolling on mobile
- [ ] Dark mode disabled (if not supported)

#### Functionality
- [ ] All navigation links work
- [ ] All forms submit correctly
- [ ] All API integrations function
- [ ] Error states display properly
- [ ] Loading states display properly
- [ ] Empty states display properly
- [ ] Pagination works (if applicable)
- [ ] Search/filter works (if applicable)

#### Responsive Design
- [ ] Mobile (320px-767px) layouts correct
- [ ] Tablet (768px-1023px) layouts correct
- [ ] Desktop (1024px+) layouts correct
- [ ] Touch targets adequate (44px minimum)
- [ ] Text readable at all sizes
- [ ] Images scale properly

#### Cross-Browser
- [ ] Chrome: All features work
- [ ] Safari: All features work
- [ ] Firefox: All features work
- [ ] Edge: All features work
- [ ] Mobile Safari: All features work
- [ ] Chrome Android: All features work

### Smoke Test Checklist

Quick verification for deployments:

1. [ ] Landing page loads
2. [ ] Navigation works
3. [ ] Booking flow starts
4. [ ] Room availability loads
5. [ ] Dashboard login works
6. [ ] Reservations display
7. [ ] API connections active
8. [ ] No console errors

### Regression Test Checklist

After significant changes:

1. [ ] All landing page sections render
2. [ ] Gallery carousel functions
3. [ ] Reviews carousel functions
4. [ ] Booking date selection works
5. [ ] Room cards display with pricing
6. [ ] Add-ons calculate correctly
7. [ ] Guest form validates
8. [ ] Stripe elements load
9. [ ] Confirmation displays
10. [ ] Dashboard sidebar navigation
11. [ ] All dashboard views load
12. [ ] Data refresh works
13. [ ] Email marketing loads strategies
14. [ ] Dynamic pricing calendar works
15. [ ] Revenue dashboard loads charts

---

## Test Execution Guidelines

### Bug Reporting Format

```markdown
**Bug Title:** [Component] Brief description

**Environment:**
- Browser: 
- Device: 
- Screen size: 
- URL: 

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Screenshot/Video:**

**Severity:** Critical / High / Medium / Low

**Additional Notes:**
```

### Severity Definitions

| Severity | Definition |
|----------|------------|
| Critical | Blocks booking or payment; data loss |
| High | Major feature broken; significant visual issue |
| Medium | Feature partially works; minor visual issue |
| Low | Cosmetic issue; nice-to-have fix |

---

## Appendix: CSS Variable Quick Reference

```css
/* Colors */
--color-bg: #f8f5f0;
--color-surface: #ffffff;
--color-primary: #9a7b4f;
--color-primary-hover: #b08d5b;
--color-accent: #8fa396;
--color-text: #2d2a26;
--color-text-secondary: #5c574f;
--color-text-muted: #8a847a;
--color-border: #e5ddd0;
--color-success: #5a8a6b;
--color-warning: #c4956a;
--color-danger: #b5706a;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;

/* Layout */
--sidebar-width: 280px;
--header-height: 80px;
```

---

**Document maintained by:** Engineering Team  
**Review cycle:** Before each major release
