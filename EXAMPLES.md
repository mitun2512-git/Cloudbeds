# Zapier Integration Examples

This document provides real-world examples of how to use the Cloudbeds Zapier integration.

## Example 1: Send Welcome Email When Guest Checks In

**Trigger:** New In-House Guest  
**Action:** Send Email (Gmail/Outlook)

**Setup:**
1. Choose "New In-House Guest" as trigger
2. Choose "Send Email" as action
3. Map fields:
   - To: `{{guest_email}}`
   - Subject: `Welcome to {{property_name}}, {{guest_first_name}}!`
   - Body: 
     ```
     Dear {{guest_first_name}} {{guest_last_name}},
     
     Welcome to {{property_name}}! We're excited to have you staying with us.
     
     Check-in: {{check_in}}
     Check-out: {{check_out}}
     
     If you need anything during your stay, please don't hesitate to contact us.
     
     Enjoy your stay!
     ```

## Example 2: Create Calendar Event for New Reservation

**Trigger:** New Reservation  
**Action:** Create Event (Google Calendar)

**Setup:**
1. Choose "New Reservation" as trigger
2. Choose "Create Event" as action
3. Map fields:
   - Title: `{{guest_first_name}} {{guest_last_name}} - {{property_name}}`
   - Start: `{{check_in}}`
   - End: `{{check_out}}`
   - Description: `Reservation ID: {{reservation_id}}\nGuests: {{adults}} adults, {{children}} children\nEmail: {{guest_email}}\nPhone: {{guest_phone}}`

## Example 3: Add Guest to Mailing List on Check-In

**Trigger:** New In-House Guest  
**Action:** Add Subscriber (Mailchimp/Constant Contact)

**Setup:**
1. Choose "New In-House Guest" as trigger
2. Choose "Add Subscriber" as action
3. Map fields:
   - Email: `{{guest_email}}`
   - First Name: `{{guest_first_name}}`
   - Last Name: `{{guest_last_name}}`
   - Tags: `hotel-guest`, `checked-in`

## Example 4: Create Slack Notification for Cancellations

**Trigger:** New Cancellation  
**Action:** Send Channel Message (Slack)

**Setup:**
1. Choose "New Cancellation" as trigger
2. Choose "Send Channel Message" as action
3. Map fields:
   - Channel: `#reservations`
   - Message: 
     ```
     ⚠️ Reservation Cancelled
     Guest: {{guest_first_name}} {{guest_last_name}}
     Property: {{property_name}}
     Dates: {{check_in}} to {{check_out}}
     Reason: {{cancellation_reason}}
     ```

## Example 5: Create Reservation from Form Submission

**Trigger:** New Submission (Google Forms/Typeform)  
**Action:** Create Reservation (Cloudbeds)

**Setup:**
1. Choose "New Submission" as trigger
2. Choose "Create Reservation" as action
3. Map fields:
   - Property: Select from dropdown
   - Room Type: Select from dropdown
   - Check-In Date: `{{form_response.check_in}}`
   - Check-Out Date: `{{form_response.check_out}}`
   - Guest First Name: `{{form_response.first_name}}`
   - Guest Last Name: `{{form_response.last_name}}`
   - Guest Email: `{{form_response.email}}`
   - Guest Phone: `{{form_response.phone}}`
   - Adults: `{{form_response.adults}}`
   - Children: `{{form_response.children}}`
   - Notes: `{{form_response.notes}}`

## Example 6: Update CRM When Guest Checks Out

**Trigger:** New Checked-Out Guest  
**Action:** Create/Update Contact (HubSpot/Salesforce)

**Setup:**
1. Choose "New Checked-Out Guest" as trigger
2. Choose "Create Contact" or "Update Contact" as action
3. Map fields:
   - Email: `{{guest_email}}`
   - First Name: `{{guest_first_name}}`
   - Last Name: `{{guest_last_name}}`
   - Phone: `{{guest_phone}}`
   - Custom Field (Last Stay): `{{check_out}}`
   - Custom Field (Property): `{{property_name}}`

## Example 7: Send Review Request After Check-Out

**Trigger:** New Checked-Out Guest  
**Action:** Send Email (Gmail/Outlook) with Delay

**Setup:**
1. Choose "New Checked-Out Guest" as trigger
2. Add "Delay" step (2 days)
3. Choose "Send Email" as action
4. Map fields:
   - To: `{{guest_email}}`
   - Subject: `How was your stay at {{property_name}}?`
   - Body: Include review link and feedback form

## Example 8: Create Task in Project Management Tool

**Trigger:** New Reservation  
**Action:** Create Task (Asana/Trello/monday.com)

**Setup:**
1. Choose "New Reservation" as trigger
2. Choose "Create Task" as action
3. Map fields:
   - Name: `Prepare room for {{guest_first_name}} {{guest_last_name}}`
   - Description: `Check-in: {{check_in}}\nCheck-out: {{check_out}}\nSpecial requests: {{notes}}`
   - Due Date: `{{check_in}}` (1 day before)
   - Tags: `reservation`, `{{property_name}}`

## Example 9: Multi-Step Workflow: Reservation to Invoice

**Trigger:** New Reservation  
**Actions:**
1. Create Guest (if doesn't exist)
2. Create Invoice (QuickBooks/Xero)
3. Send Confirmation Email

**Setup:**
1. Trigger: New Reservation
2. Action 1: Create Guest (with conditional logic to check if exists)
3. Action 2: Create Invoice
   - Customer: `{{guest_email}}`
   - Amount: Calculate based on dates and room type
   - Due Date: `{{check_in}}`
4. Action 3: Send Email with invoice details

## Example 10: Automated Guest Communication

**Multi-Zap Setup:**

**Zap 1: Pre-Arrival Reminder**
- Trigger: New Reservation
- Delay: 1 day before check-in
- Action: Send Email with check-in instructions

**Zap 2: Check-In Confirmation**
- Trigger: New In-House Guest
- Action: Send SMS/Email with room number and WiFi details

**Zap 3: Mid-Stay Check-In**
- Trigger: New In-House Guest
- Delay: 2 days after check-in
- Action: Send Email asking about their stay

**Zap 4: Post-Stay Follow-Up**
- Trigger: New Checked-Out Guest
- Delay: 1 day after check-out
- Action: Send Thank You email and review request

## Tips for Building Zaps

1. **Use Filters:** Add filters to only trigger on specific conditions (e.g., only reservations at a specific property)

2. **Use Paths:** Create different paths for different scenarios (e.g., VIP guests vs regular guests)

3. **Use Formatters:** Format dates, phone numbers, and other data for better presentation

4. **Test Thoroughly:** Use Zapier's test mode to verify your Zaps work correctly before activating

5. **Monitor Performance:** Check Zap history regularly to ensure everything is running smoothly

6. **Error Handling:** Set up error notifications to be alerted when Zaps fail

## Advanced Use Cases

### Conditional Logic
- Only send emails to guests with valid email addresses
- Different messages for different property types
- Skip actions for test reservations

### Data Transformation
- Calculate total stay duration
- Format phone numbers consistently
- Combine first and last name into full name

### Multi-App Workflows
- Cloudbeds → Slack → Google Sheets → Email
- Cloudbeds → CRM → Marketing Automation → Analytics

## Need Help?

- Check the [README.md](README.md) for API documentation
- Review [SETUP.md](SETUP.md) for installation instructions
- Test individual triggers and actions before building complex workflows


