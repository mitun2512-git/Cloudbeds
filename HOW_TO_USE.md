# How to Access Cloudbeds Through Zapier

This guide explains how to set up and use the Cloudbeds Zapier integration to access your Cloudbeds data and automate workflows.

## Prerequisites

1. **Cloudbeds Account** - You need an active Cloudbeds account
2. **Zapier Account** - Sign up at [zapier.com](https://zapier.com) if you don't have one
3. **Cloudbeds API Credentials** - OAuth Client ID and Secret from Cloudbeds Developer Portal

## Step 1: Get Cloudbeds API Credentials

### Option A: Use Existing Cloudbeds-Zapier Integration (Easiest)

If Cloudbeds already has an official Zapier integration:

1. Go to [zapier.com/apps/cloudbeds](https://zapier.com/apps/cloudbeds)
2. Click "Connect Cloudbeds + Zapier"
3. Sign in to your Cloudbeds account
4. Authorize Zapier to access your Cloudbeds data
5. You're ready to create Zaps!

### Option B: Use This Custom Integration

If you want to use this custom integration:

1. **Register with Cloudbeds Developer Portal:**
   - Go to [developers.cloudbeds.com](https://developers.cloudbeds.com)
   - Create a developer account
   - Register a new OAuth application
   - Set redirect URI: `https://zapier.com/dashboard/auth/oauth/return/App5050CLIAPI/`
   - Copy your **Client ID** and **Client Secret**

2. **Deploy This Integration:**
   ```bash
   # Install dependencies
   npm install
   
   # Install Zapier CLI
   npm install -g zapier-platform-cli
   
   # Login to Zapier
   zapier login
   
   # Register your app (first time only)
   zapier register
   
   # Set environment variables
   export CLOUDBEDS_CLIENT_ID=your_client_id
   export CLOUDBEDS_CLIENT_SECRET=your_client_secret
   
   # Push to Zapier
   zapier push
   ```

## Step 2: Connect Your Cloudbeds Account in Zapier

1. **Go to Zapier Dashboard:**
   - Visit [zapier.com/apps](https://zapier.com/apps)
   - Search for "Cloudbeds" or your custom app name

2. **Create a New Zap:**
   - Click "Create Zap"
   - Search for "Cloudbeds" as your trigger or action app

3. **Connect Your Account:**
   - Click "Sign in to Cloudbeds"
   - You'll be redirected to Cloudbeds authorization page
   - Sign in with your Cloudbeds credentials
   - Click "Approve" to authorize Zapier
   - You'll be redirected back to Zapier

4. **Test Connection:**
   - Zapier will test the connection
   - If successful, you'll see "Account Connected"

## Step 3: Access Cloudbeds Data Through Triggers

### Using Cloudbeds as a Trigger (When something happens in Cloudbeds)

**Example: Get notified when a new reservation is created**

1. **Create a Zap:**
   - Trigger: Choose "Cloudbeds" → "New Reservation"
   - Click "Continue"

2. **Connect Account:**
   - Select your connected Cloudbeds account
   - Click "Continue"

3. **Test Trigger:**
   - Click "Test trigger"
   - Zapier will fetch a sample reservation
   - You'll see data like:
     ```json
     {
       "reservation_id": "12345",
       "guest_first_name": "John",
       "guest_last_name": "Doe",
       "guest_email": "john@example.com",
       "check_in": "2024-01-15",
       "check_out": "2024-01-17",
       "property_name": "Sample Hotel"
     }
     ```

4. **Add an Action:**
   - Choose what to do with this data (e.g., send email, create calendar event)
   - Map the Cloudbeds fields to your action

5. **Turn on Zap:**
   - Click "Publish" to activate

### Available Triggers:

- **New Reservation** - When a new reservation is created
- **New In-House Guest** - When a guest checks in
- **New Checked-Out Guest** - When a guest checks out
- **New Cancellation** - When a reservation is cancelled
- **New Guest** - When a new guest profile is created

## Step 4: Perform Actions in Cloudbeds

### Using Cloudbeds as an Action (Do something in Cloudbeds)

**Example: Create a reservation from a form submission**

1. **Create a Zap:**
   - Trigger: Choose your trigger app (e.g., "Google Forms" → "New Submission")
   - Action: Choose "Cloudbeds" → "Create Reservation"

2. **Connect Account:**
   - Select your Cloudbeds account
   - Click "Continue"

3. **Set Up Action:**
   - **Property**: Select from dropdown (dynamically loaded)
   - **Room Type**: Select from dropdown (based on property)
   - **Check-In Date**: Map from form field
   - **Check-Out Date**: Map from form field
   - **Guest First Name**: Map from form field
   - **Guest Last Name**: Map from form field
   - **Guest Email**: Map from form field
   - Fill in other optional fields

4. **Test Action:**
   - Click "Test action"
   - Zapier will create a test reservation in Cloudbeds
   - Verify it appears in your Cloudbeds dashboard

5. **Turn on Zap:**
   - Click "Publish" to activate

### Available Actions:

- **Create Reservation** - Create a new reservation
- **Update Reservation** - Update an existing reservation
- **Cancel Reservation** - Cancel a reservation
- **Create Guest** - Create a new guest profile

## Step 5: Search Cloudbeds Data

### Using Cloudbeds Search

**Example: Find a reservation before updating it**

1. **In a Zap Action:**
   - Choose "Cloudbeds" → "Find Reservation"
   - Enter search criteria:
     - Reservation ID
     - Guest Email
     - Guest Name
   - Zapier will return matching reservations

2. **Use Results:**
   - Use the found reservation data in subsequent steps
   - Update it, send notifications, etc.

## Common Use Cases

### 1. Send Welcome Email When Guest Checks In

```
Trigger: Cloudbeds → New In-House Guest
Action: Gmail → Send Email
  To: {{guest_email}}
  Subject: Welcome to {{property_name}}!
  Body: Dear {{guest_first_name}}, welcome...
```

### 2. Create Calendar Event for New Reservation

```
Trigger: Cloudbeds → New Reservation
Action: Google Calendar → Create Event
  Title: {{guest_first_name}} {{guest_last_name}}
  Start: {{check_in}}
  End: {{check_out}}
```

### 3. Add Guest to Mailing List

```
Trigger: Cloudbeds → New In-House Guest
Action: Mailchimp → Add Subscriber
  Email: {{guest_email}}
  First Name: {{guest_first_name}}
  Last Name: {{guest_last_name}}
```

### 4. Create Reservation from Form

```
Trigger: Google Forms → New Submission
Action: Cloudbeds → Create Reservation
  Property: [Select from dropdown]
  Room Type: [Select from dropdown]
  Check-In: {{form_response.check_in}}
  Check-Out: {{form_response.check_out}}
  Guest: {{form_response.guest_name}}
```

## Accessing Cloudbeds Data Fields

When you use Cloudbeds in a Zap, you can access these common fields:

### Reservation Fields:
- `reservation_id` - Unique reservation ID
- `property_id` - Property ID
- `property_name` - Property name
- `guest_first_name` - Guest's first name
- `guest_last_name` - Guest's last name
- `guest_email` - Guest's email
- `guest_phone` - Guest's phone
- `check_in` - Check-in date
- `check_out` - Check-out date
- `status` - Reservation status
- `adults` - Number of adults
- `children` - Number of children
- `notes` - Reservation notes

### Guest Fields:
- `guest_id` - Unique guest ID
- `first_name` - First name
- `last_name` - Last name
- `email` - Email address
- `phone` - Phone number
- `address` - Street address
- `city` - City
- `state` - State/Province
- `zip` - ZIP/Postal code
- `country` - Country

## Tips for Using Cloudbeds in Zapier

1. **Test First**: Always test your Zaps before turning them on
2. **Use Filters**: Add filters to only trigger on specific conditions
3. **Handle Errors**: Set up error notifications for failed Zaps
4. **Monitor Performance**: Check Zap history regularly
5. **Use Delays**: Add delays for time-sensitive workflows (e.g., send review request 2 days after checkout)

## Troubleshooting

### Can't Connect Account
- Verify your Cloudbeds credentials
- Check that OAuth credentials are correct
- Ensure redirect URI matches in Cloudbeds settings

### Triggers Not Firing
- Check Zap is turned on
- Verify Cloudbeds account is connected
- Check Zap history for errors
- Ensure you have permissions in Cloudbeds

### Actions Failing
- Verify all required fields are filled
- Check date formats (should be YYYY-MM-DD)
- Ensure property and room type IDs are valid
- Check Zap history for specific error messages

### Data Not Appearing
- Wait a few minutes (Zapier polls every 5-15 minutes)
- Check if filters are too restrictive
- Verify the data exists in Cloudbeds

## Getting Help

- **Zapier Support**: [zapier.com/support](https://zapier.com/support)
- **Cloudbeds Support**: [myfrontdesk.cloudbeds.com](https://myfrontdesk.cloudbeds.com)
- **Integration Docs**: See [README.md](README.md) and [EXAMPLES.md](EXAMPLES.md)

## Next Steps

1. **Explore Templates**: Check Zapier's Cloudbeds templates
2. **Build Custom Zaps**: Create workflows specific to your needs
3. **Automate Everything**: Connect Cloudbeds to all your other apps
4. **Monitor & Optimize**: Review Zap performance and improve workflows

---

**Ready to start?** Go to [zapier.com](https://zapier.com) and create your first Cloudbeds Zap!


