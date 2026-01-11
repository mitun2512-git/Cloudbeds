# 📋 Hennessey Estate - Comprehensive Visual Test Plan

## Overview
This document provides a detailed visual test plan for the Hennessey Estate Booking Engine, covering all features across **Desktop** (1440px+), **Tablet** (768px), and **Mobile** (375px) viewports.

---

## 🖥️ Device Breakpoints

| Device | Width | Test Priority |
|--------|-------|---------------|
| Desktop | 1440px | High |
| Tablet | 768px | Medium |
| Mobile | 375px | High |

---

# 🏠 PART 1: PUBLIC PAGES

## 1.1 Landing Page (`/`)

### Desktop Tests
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| LP-D-01 | Hero Section | Verify hero video plays automatically | Video plays, muted, loops continuously |
| LP-D-02 | Hero Text | Check title and subtitle alignment | Text is centered, readable over video |
| LP-D-03 | Navigation | Test top navigation bar | Logo centered, nav links on both sides |
| LP-D-04 | Book Now Button | Verify CTA button | Button visible, hover state works |
| LP-D-05 | Reviews Section | Check reviews carousel | 3 reviews visible, properly formatted |
| LP-D-06 | Rooms Section | Verify room showcase | Image + text side by side |
| LP-D-07 | Buyout Section | Check full-width background | Background image covers section |
| LP-D-08 | Pool Section | Verify image/text layout | Image on right, text on left |
| LP-D-09 | Tasting Room | Verify alternate layout | Image on left, text on right |
| LP-D-10 | Breakfast Section | Check layout consistency | Alternating pattern maintained |
| LP-D-11 | Amenities Grid | Verify icon grid | 10 icons in responsive grid |
| LP-D-12 | Newsletter | Test email signup form | Input + button aligned horizontally |
| LP-D-13 | Footer | Check multi-column layout | 3 columns: Visit, Contact, Follow |
| LP-D-14 | Scroll Behavior | Test smooth scrolling | Smooth scroll to anchor links |

### Mobile Tests
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| LP-M-01 | Hero Section | Verify video on mobile | Video plays or fallback image shown |
| LP-M-02 | Navigation | Test hamburger menu | Menu collapses to hamburger icon |
| LP-M-03 | Hero Text | Check responsive text | Text resizes, remains readable |
| LP-M-04 | Reviews | Test single column | Reviews stack vertically |
| LP-M-05 | Room Sections | Verify stacking | Image stacks above text |
| LP-M-06 | Amenities | Check grid reflow | 2-3 columns on mobile |
| LP-M-07 | Newsletter | Test form layout | Input stacks above button |
| LP-M-08 | Footer | Check column stacking | Columns stack vertically |
| LP-M-09 | Touch Targets | Verify button sizes | Min 44x44px touch targets |
| LP-M-10 | Horizontal Scroll | Check for overflow | No horizontal scrolling |

---

## 1.2 Guest Booking Engine (`/book`)

### Step 1: Date Selection
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| GBE-01 | Calendar | Two-month calendar display | Side-by-side months | Stacked months |
| GBE-02 | Date Selection | Click to select check-in | Date highlights, updates header |
| GBE-03 | Range Selection | Select check-out date | Range highlights between dates |
| GBE-04 | Past Dates | Verify disabled dates | Past dates grayed out, unclickable |
| GBE-05 | Navigation | Month navigation arrows | Previous/Next buttons work |
| GBE-06 | Guest Count | Adult/children selectors | Dropdowns function correctly |
| GBE-07 | Date Display | Selected dates in header | Shows "Jan 11 → Jan 13 (2 nights)" |
| GBE-08 | Clear Button | Clear date selection | × button resets dates |
| GBE-09 | Property Info | Info panel display | Right sidebar with amenities |
| GBE-10 | Search Button | CTA button state | Enabled when dates selected |

### Step 2: Room Selection
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| GBE-11 | Room Cards | Room list display | Grid layout | Single column |
| GBE-12 | Buyout Option | Full property card | Highlighted with "Exclusive" badge |
| GBE-13 | Pricing | Per-night + total | Shows both clearly |
| GBE-14 | Availability | Limited rooms badge | "Only 1 left!" badge visible |
| GBE-15 | Selection State | Selected room indicator | "✓ Selected" button state |
| GBE-16 | Room Details | Description display | Scrollable if long |
| GBE-17 | Guest Capacity | Max guests indicator | "👥 Up to 2 guests" visible |
| GBE-18 | Continue Bar | Sticky footer bar | Shows room + total |
| GBE-19 | Back Button | Return to dates | "← Change dates" works |
| GBE-20 | Loading State | Room fetch loading | Spinner or skeleton shown |

### Step 3: Add-ons Selection
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| GBE-21 | Add-on Cards | 6 add-ons displayed | 3-column grid | Single column |
| GBE-22 | Icons | Add-on icons | 🍳🧹🍷💆🚗💕 visible |
| GBE-23 | Pricing | Price calculation | Shows per-person/per-day |
| GBE-24 | Selection Toggle | Add/remove add-on | + button toggles to ✓ |
| GBE-25 | Running Total | Subtotal update | Total updates on selection |
| GBE-26 | Skip Option | Skip add-ons | "Skip add-ons →" button |
| GBE-27 | Continue Button | Proceed to guest info | Button enabled always |

### Step 4: Guest Information
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| GBE-28 | Form Layout | 2-column layout | Side-by-side fields | Stacked fields |
| GBE-29 | Required Fields | Asterisk indicators | First Name*, Last Name*, Email*, Phone* |
| GBE-30 | Validation | Empty field check | Red border on blur if empty |
| GBE-31 | Email Format | Email validation | Error for invalid email |
| GBE-32 | Phone Format | Phone input | Accepts various formats |
| GBE-33 | Address Fields | Optional address | No asterisk, collapsible |
| GBE-34 | Special Requests | Textarea | Placeholder text visible |
| GBE-35 | Continue Button | Form submission | Enabled when required filled |

### Step 5: Payment
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| GBE-36 | Stripe Element | Card input iframe | Stripe card element loads |
| GBE-37 | Booking Summary | Order summary | Room, add-ons, taxes, total |
| GBE-38 | Guest Info | Confirmed info | Name, email, phone shown |
| GBE-39 | Security Badge | Trust indicators | 🔒 "Encrypted" message |
| GBE-40 | Payment Note | Charge timing | "Payment at check-in" note |
| GBE-41 | Submit Button | Complete booking | "Complete Booking" CTA |
| GBE-42 | Error Handling | Card errors | Error message displays |

### Step 6: Confirmation
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| GBE-43 | Success Icon | Confirmation state | ✅ Green checkmark |
| GBE-44 | Confirmation ID | Booking reference | Unique ID displayed |
| GBE-45 | Booking Details | Summary card | All details shown |
| GBE-46 | Print Button | Print functionality | Opens print dialog |
| GBE-47 | Email Sent | Confirmation note | "Confirmation sent to..." |

### Progress Indicator (All Steps)
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| GBE-48 | Step Numbers | 5-step indicator | 1-2-3-4-5 circles |
| GBE-49 | Current Step | Active state | Current step highlighted |
| GBE-50 | Completed Steps | Checkmark state | ✓ on completed steps |
| GBE-51 | Click Navigation | Step clicking | Can click completed steps |

---

# 👨‍💼 PART 2: STAFF DASHBOARD (`/dashboard`)

## 2.1 Sidebar Navigation

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| SD-01 | Logo | Hennessey logo | Full logo visible | Hidden when collapsed |
| SD-02 | Nav Items | 11 navigation items | All items visible | Icon-only mode |
| SD-03 | Active State | Current page highlight | Blue background on active |
| SD-04 | Collapse Toggle | Hamburger button | Collapses sidebar |
| SD-05 | Overlay | Mobile overlay | Dark overlay behind sidebar |
| SD-06 | Highlight Item | Guest Booking Engine | Different color (gold) |
| SD-07 | Tooltips | Collapsed tooltips | Shows tooltip on hover |

---

## 2.2 Homepage (`/dashboard` - Home View)

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| HP-01 | AI Badge | "Powered by Gemini 3 Pro" | Visible at top |
| HP-02 | Hero Title | Two-line heading | Responsive sizing |
| HP-03 | Chat Interface | AI chat panel | Right-aligned | Full width |
| HP-04 | Quick Actions | 4 quick action buttons | Grid layout |
| HP-05 | Chat Input | Message input field | With send button |
| HP-06 | Tool Cards | 3 management tool cards | 3-column → 1-column |
| HP-07 | Feature Badges | 4 feature badges | Gemini, Sync, Secure, 24/7 |
| HP-08 | Data Sync | Sync status footer | Shows reservation count |
| HP-09 | Refresh Button | Manual refresh | "Refresh Now" button |

---

## 2.3 Daily Reservations

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| DR-01 | Quick Stats | 3 stat buttons | Outstanding, Breakfast, Cleaning |
| DR-02 | Summary Cards | In House, Arriving, Departing | 3-column → stacked |
| DR-03 | Date Tabs | Week navigation | Today, Tomorrow, etc. |
| DR-04 | Reservation List | Guest cards | Expandable cards |
| DR-05 | Guest Details | Expanded card info | Room, dates, balance |
| DR-06 | Status Badges | Reservation status | Confirmed, Checked In |
| DR-07 | Action Buttons | Check-in, Edit | Functional buttons |
| DR-08 | Search/Filter | Search input | Filter by name |
| DR-09 | Empty State | No reservations | Friendly message |
| DR-10 | Loading State | Fetch in progress | Skeleton loader |

---

## 2.4 Availability & Pricing

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| AV-01 | Date Inputs | Check-in/Check-out | Date pickers |
| AV-02 | Check Button | "Check Availability" | With calendar icon |
| AV-03 | Results Header | Availability date | "Availability for Jan 10" |
| AV-04 | Room Cards | 5-6 room types | Available count + price |
| AV-05 | Price Display | Per-night rate | "$200.00 per night" |
| AV-06 | Availability Count | Room count | "3 rooms available" |
| AV-07 | Loading State | "Checking..." | Button disabled state |
| AV-08 | Empty State | Initial state | Instructions shown |

---

## 2.5 Email Marketing

### Campaign List
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| EM-01 | Insights Panel | 6 stat cards | Total, Confirmed, etc. |
| EM-02 | Campaign Cards | 5 AI campaigns | Priority badges |
| EM-03 | Guest Count | Per campaign | "556 guests" count |
| EM-04 | Priority Badge | High/Medium | Color-coded |
| EM-05 | Complete Button | Mark complete | Checkmark icon |
| EM-06 | Campaign Preview | Selected campaign | Right panel |

### Draft Management
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| EM-07 | Draft List | Draft emails | List with timestamps |
| EM-08 | Edit Button | Open editor | "✏️ Edit Template" |
| EM-09 | Send Button | Send campaign | "📧 Send" |
| EM-10 | Draft Count | Header count | "Drafts (11)" |
| EM-11 | Recipient Info | Draft metadata | "0 recipients" |

---

## 2.6 Email Template Editor

### Editor Layout
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| EE-01 | Toolbar | Top toolbar | Templates, A/B Test, Preview toggle |
| EE-02 | Sidebar | Left panel | Settings, Blocks, Variables |
| EE-03 | Preview | Center canvas | Email preview |
| EE-04 | Device Toggle | Desktop/Mobile | 💻/📱 buttons |

### Email Settings
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| EE-05 | Subject Line | Input with counter | Character count (78 max) |
| EE-06 | Preheader | Secondary text | 100 char limit |
| EE-07 | A/B Test Toggle | Alternative subject | 50/50 split option |
| EE-08 | Validation | Subject required | Error state on empty |

### Block Editor
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| EE-09 | Block Palette | 8 block types | Header, Text, Image, Button, etc. |
| EE-10 | Add Block | Click to add | Block added to canvas |
| EE-11 | Select Block | Click on block | Blue selection border |
| EE-12 | Edit Block | Inline editing | Input fields appear |
| EE-13 | Move Block | ↑↓ buttons | Reorders blocks |
| EE-14 | Delete Block | × button | Removes block |

### Block Types
| Test ID | Block Type | Edit Fields | Desktop Preview |
|---------|------------|-------------|-----------------|
| EE-15 | Header | Text, Size (H1-H3) | Large bold text |
| EE-16 | Text | Rich text editor | Formatted text |
| EE-17 | Button | Text, URL, Style | Colored button |
| EE-18 | Divider | Style | Horizontal line |
| EE-19 | Spacer | Height | Empty space |
| EE-20 | Footer | Text | Small footer text |

### Rich Text Editor
| Test ID | Feature | Test Description | Expected Result |
|---------|---------|------------------|-----------------|
| EE-21 | Bold | B button | Text bolds |
| EE-22 | Italic | I button | Text italicizes |
| EE-23 | Underline | U button | Text underlines |
| EE-24 | Heading | H button | Converts to H2 |
| EE-25 | List | • button | Creates bullet list |
| EE-26 | Link | 🔗 button | Prompts for URL |

### Template Variables
| Test ID | Variable | Description | Example |
|---------|----------|-------------|---------|
| EE-27 | {guest_name} | Guest's full name | "John Smith" |
| EE-28 | {check_in_date} | Check-in date | "January 15, 2026" |
| EE-29 | {check_out_date} | Check-out date | "January 18, 2026" |
| EE-30 | {room_type} | Room type name | "Estate Room" |
| EE-31 | {property_name} | Property name | "Hennessey Estate" |

### Template Library
| Test ID | Template | Category | Blocks |
|---------|----------|----------|--------|
| EE-32 | Welcome Email | Pre-Arrival | Header, Text, Button, Footer |
| EE-33 | Thank You | Post-Stay | Header, Text, Button, Footer |
| EE-34 | Special Offer | Promotions | Header, Text, Button, Footer |
| EE-35 | Check-in Reminder | Pre-Arrival | Header, Text, Button, Footer |

### Preview Modes
| Test ID | Mode | Test Description | Expected Result |
|---------|------|------------------|-----------------|
| EE-36 | Desktop | Desktop preview | 600px width email |
| EE-37 | Mobile | Mobile preview | 320px width, stacked |
| EE-38 | Live Update | Edit reflection | Changes appear immediately |

---

## 2.7 Revenue Audit

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| RA-01 | Month/Year | Month/Year selectors | Spinbuttons |
| RA-02 | Run Audit | Submit button | Triggers data fetch |
| RA-03 | Summary Cards | 5 metric cards | Room Rate, Tax, Fees, Total, Bookings |
| RA-04 | Data Table | Booking list | Scrollable table |
| RA-05 | Table Headers | 8 columns | ID, Guest, Room, Check-in, Rate, Tax, Fees, Total |
| RA-06 | Empty State | No bookings | "No bookings found" |
| RA-07 | Totals Row | Summary totals | Bold bottom row |

---

## 2.8 Revenue Dashboard

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| RD-01 | Period Selector | Month/Quarter/Year | Toggle buttons |
| RD-02 | KPI Cards | Key metrics | Revenue, ADR, Occupancy, RevPAR |
| RD-03 | Revenue Chart | Line/bar chart | Responsive chart |
| RD-04 | Room Breakdown | By room type | Pie or bar chart |
| RD-05 | Comparison | YoY comparison | Percentage change |

---

## 2.9 Dynamic Pricing Engine

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| DP-01 | Date Range | Price period | Date pickers |
| DP-02 | Room List | All room types | With current/suggested rates |
| DP-03 | Price Factors | Demand indicators | Occupancy, events, seasonality |
| DP-04 | Suggested Rates | AI suggestions | Highlighted recommendations |
| DP-05 | Apply Changes | Update rates | Confirmation dialog |

---

## 2.10 Competitive Benchmark

### Overview Tab
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| CB-01 | Property Card | Hennessey stats | Revenue, Rooms, ADR, Occupancy, RevPAR |
| CB-02 | Amenity Badges | Property amenities | Pool, Spa, Sauna, etc. |
| CB-03 | Market Position | Rank table | 5 competitors ranked |
| CB-04 | Rank Medals | Position indicators | 🥇🥈🥉4️⃣5️⃣ |

### KPI Comparisons
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| CB-05 | ADR Chart | Bar comparison | 5 properties compared |
| CB-06 | Occupancy Chart | Percentage bars | Visual comparison |
| CB-07 | RevPAR Chart | Revenue bars | Sorted by RevPAR |

### Navigation Tabs
| Test ID | Tab | Content | Expected |
|---------|-----|---------|----------|
| CB-08 | Overview | Summary stats | Default view |
| CB-09 | Monthly Trends | Month-by-month | Line charts |
| CB-10 | Pricing Analysis | Rate comparison | Price positioning |
| CB-11 | Quality & Value | Rating analysis | Star ratings |
| CB-12 | Summary | Executive summary | Key takeaways |

---

## 2.11 Website Redesign Mockup

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| WR-01 | Action Buttons | 3 buttons | Live Preview, Copy, Recommendations |
| WR-02 | Preview Frame | Website mockup | Full page preview |
| WR-03 | Hero Section | Video/image hero | Responsive hero |
| WR-04 | Content Sections | Pool, Tasting, etc. | Alternating layouts |
| WR-05 | Amenities Grid | Icons grid | Responsive columns |
| WR-06 | Reviews Section | Guest reviews | 3-column → 1-column |
| WR-07 | Newsletter | Email signup | Form styling |
| WR-08 | Footer | Contact info | Multi-column footer |

---

## 2.12 Website Editor (`/editor`)

### Editor Chrome
| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| WE-01 | Top Toolbar | Editor toolbar | Logo, device switch, save |
| WE-02 | Device Switcher | 3 device buttons | Desktop, Tablet, Mobile |
| WE-03 | Undo/Redo | History controls | ↩️↪️ buttons |
| WE-04 | Preview Toggle | Preview mode | Eye icon |
| WE-05 | Save Button | Save changes | Unsaved indicator dot |
| WE-06 | View Site | External link | Opens in new tab |

### Left Panel - Sections Tab
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| WE-07 | Section List | 12 sections | Ordered list |
| WE-08 | Section Names | Readable labels | Header, Hero, Reviews, etc. |
| WE-09 | Visibility Toggle | Eye icon | Show/hide section |
| WE-10 | Move Controls | ↑↓ arrows | Reorder sections |
| WE-11 | Selected State | Blue highlight | Current selection |
| WE-12 | Hidden State | Grayed out | For hidden sections |

### Left Panel - Design Tab
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| WE-13 | Color Grid | 5 brand colors | Color pickers |
| WE-14 | Color Picker | Input + swatch | Both editable |
| WE-15 | Font Selectors | Heading/Body fonts | Dropdown menus |
| WE-16 | Logo Upload | Logo preview | Upload button |
| WE-17 | Site Name | Text input | Editable name |
| WE-18 | EST Toggle | Checkbox | Show/hide "EST. 1889" |

### Left Panel - Tools Tab
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| WE-19 | Export Button | Download JSON | Creates file download |
| WE-20 | Import Button | Upload JSON | File picker opens |
| WE-21 | Reset Button | Reset to defaults | Confirmation dialog |
| WE-22 | Danger Styling | Reset warning | Red button styling |

### Canvas Preview
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| WE-23 | Viewport Width | Device sizing | 375px / 768px / 100% |
| WE-24 | Section Render | All sections | Live preview |
| WE-25 | Click to Select | Section selection | Blue border on click |
| WE-26 | Selection Label | Section name badge | Top-left label |
| WE-27 | Preview Mode | Clean view | No selection UI |

### Right Panel - Properties
| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| WE-28 | Panel Header | Section name | With close button |
| WE-29 | Property Fields | Input fields | Labels + inputs |
| WE-30 | Text Fields | Text inputs | Single-line inputs |
| WE-31 | Textarea | Multi-line | For paragraphs |
| WE-32 | Media Upload | Image/video upload | Preview + upload button |
| WE-33 | Link Editor | Nav links | Label + URL pairs |
| WE-34 | Add Link | Add navigation | "+ Add Link" button |

### Section-Specific Properties
| Test ID | Section | Editable Properties |
|---------|---------|---------------------|
| WE-35 | Header | Nav links, Book button text/link |
| WE-36 | Hero | Title lines, Emphasis, Subtitle, CTA, Video, Image |
| WE-37 | Reviews | Rating, Platform, Count, Link |
| WE-38 | Rooms | Title, Subtitle, Description, Prices, Image |
| WE-39 | Buyout | Badge, Title, Subtitle, Lead, Description, Features, Background |
| WE-40 | Content Sections | Title, Subtitle, Paragraphs, CTA, Image |
| WE-41 | Newsletter | Title, Subtitle, Placeholder, Button text |
| WE-42 | Location | Title, Subtitle, Paragraphs, CTA |

### Keyboard Shortcuts
| Test ID | Shortcut | Action | Expected Result |
|---------|----------|--------|-----------------|
| WE-43 | Ctrl+Z | Undo | Reverts last change |
| WE-44 | Ctrl+Shift+Z | Redo | Restores undone change |
| WE-45 | Ctrl+S | Save | Saves content |
| WE-46 | Escape | Deselect/Exit Preview | Clears selection |

---

## 2.13 Guest Chat Dashboard

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| GC-01 | Conversation List | Chat threads | Left sidebar |
| GC-02 | Chat Preview | Message preview | Truncated text |
| GC-03 | Timestamp | Last message time | Relative time |
| GC-04 | Unread Count | Unread badge | Number indicator |
| GC-05 | Chat Window | Selected conversation | Full message history |
| GC-06 | Message Bubbles | User/AI messages | Different styling |

---

## 2.14 AI Chatbot Widget

| Test ID | Component | Test Description | Desktop | Mobile |
|---------|-----------|------------------|---------|--------|
| AI-01 | Toggle Button | Open/close chat | Bottom-right bubble |
| AI-02 | Chat Header | Bot name + status | "Online • Ready" |
| AI-03 | Clear Button | Clear conversation | Trash icon |
| AI-04 | Close Button | Minimize chat | × button |
| AI-05 | Welcome Message | Initial greeting | Multi-point list |
| AI-06 | Quick Actions | Preset buttons | 4 action buttons |
| AI-07 | Input Field | Message input | With send button |
| AI-08 | Send Button | Submit message | Disabled when empty |
| AI-09 | Powered By | Attribution | "Cloudbeds & Gemini AI" |

---

## 2.15 Data Sync Footer

| Test ID | Component | Test Description | Expected Result |
|---------|-----------|------------------|-----------------|
| DS-01 | Sync Icon | Status indicator | ✓ or 🔄 |
| DS-02 | Last Sync | Timestamp | "Just now" / "2 min ago" |
| DS-03 | Stats | Record counts | "(702 reservations, 700 guests)" |
| DS-04 | Refresh Button | Manual refresh | "Refresh Now" / "Refreshing..." |
| DS-05 | Loading State | During refresh | Animated icon |

---

# 📱 PART 3: RESPONSIVE BEHAVIOR TESTS

## 3.1 Breakpoint Transitions

| Test ID | Breakpoint | Test | Expected Result |
|---------|------------|------|-----------------|
| RB-01 | 1024px → 768px | Sidebar collapse | Auto-collapses |
| RB-02 | 768px → 375px | Grid to stack | 2-col → 1-col |
| RB-03 | Any → Any | No horizontal scroll | Content contained |
| RB-04 | Any → Any | Font scaling | Readable at all sizes |

## 3.2 Touch Interaction Tests (Mobile)

| Test ID | Component | Test | Expected Result |
|---------|-----------|------|-----------------|
| TI-01 | Buttons | Tap target size | Min 44x44px |
| TI-02 | Links | Tap accuracy | No mis-taps |
| TI-03 | Forms | Input focus | Keyboard appears |
| TI-04 | Dropdowns | Option selection | Native picker on iOS |
| TI-05 | Scroll | Vertical scroll | Smooth scrolling |
| TI-06 | Swipe | Sidebar | Swipe to close |

## 3.3 Performance Tests

| Test ID | Test | Threshold | Tool |
|---------|------|-----------|------|
| PF-01 | First Contentful Paint | < 2s | Lighthouse |
| PF-02 | Time to Interactive | < 4s | Lighthouse |
| PF-03 | Cumulative Layout Shift | < 0.1 | Lighthouse |
| PF-04 | Largest Contentful Paint | < 2.5s | Lighthouse |

---

# ✅ TEST EXECUTION CHECKLIST

## Pre-Test Setup
- [ ] Backend server running on port 3001
- [ ] Frontend running on port 3000
- [ ] Browser dev tools open
- [ ] Network throttling off
- [ ] Cache cleared

## Device Testing Matrix
| Page | Desktop 1440px | Tablet 768px | Mobile 375px |
|------|----------------|--------------|--------------|
| Landing Page | ⬜ | ⬜ | ⬜ |
| Booking Engine | ⬜ | ⬜ | ⬜ |
| Dashboard Home | ⬜ | ⬜ | ⬜ |
| Reservations | ⬜ | ⬜ | ⬜ |
| Availability | ⬜ | ⬜ | ⬜ |
| Email Marketing | ⬜ | ⬜ | ⬜ |
| Email Editor | ⬜ | ⬜ | ⬜ |
| Revenue Audit | ⬜ | ⬜ | ⬜ |
| Benchmark | ⬜ | ⬜ | ⬜ |
| Website Mockup | ⬜ | ⬜ | ⬜ |
| Website Editor | ⬜ | ⬜ | ⬜ |

## Bug Severity Classification
- **Critical**: Blocks user flow, data loss
- **High**: Major feature broken
- **Medium**: Feature partially works
- **Low**: Cosmetic/minor issue

---

# 📝 NOTES

## Browser Support
- Chrome 90+
- Safari 14+
- Firefox 90+
- Edge 90+

## Accessibility Considerations
- Keyboard navigation
- Screen reader compatibility
- Color contrast (WCAG 2.1 AA)
- Focus indicators

## Known Limitations
- Hero video may not autoplay on iOS Safari without user interaction
- Stripe Elements styling limited by iframe constraints

---

*Last Updated: January 10, 2026*
*Version: 1.0*
