# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Install Zapier CLI

```bash
npm install -g zapier-platform-cli
```

## Step 3: Login to Zapier

```bash
zapier login
```

This will open your browser to authenticate with Zapier.

## Step 4: Get Cloudbeds API Credentials

1. Go to the Cloudbeds Developer Portal
2. Create a new OAuth application
3. Set the redirect URI to: `https://zapier.com/dashboard/auth/oauth/return/App5050CLIAPI/`
   (Note: This may vary based on your Zapier app ID)
4. Copy your Client ID and Client Secret

## Step 5: Configure Environment Variables

Create a `.env` file in the project root:

```bash
CLOUDBEDS_CLIENT_ID=your_client_id_here
CLOUDBEDS_CLIENT_SECRET=your_client_secret_here
```

Or export them in your shell:

```bash
export CLOUDBEDS_CLIENT_ID=your_client_id_here
export CLOUDBEDS_CLIENT_SECRET=your_client_secret_here
```

## Step 6: Register Your App with Zapier

```bash
zapier register
```

Follow the prompts to create your app in Zapier.

## Step 7: Test Your Integration

```bash
zapier test
```

## Step 8: Validate Your Integration

```bash
zapier validate
```

## Step 9: Push to Zapier

```bash
zapier push
```

## Step 10: Invite Users (Optional)

```bash
zapier invite user@example.com
```

## Troubleshooting

### Authentication Issues

If you encounter OAuth errors:
- Verify your Client ID and Client Secret are correct
- Check that redirect URIs match in both Cloudbeds and Zapier
- Ensure you're using the correct OAuth endpoints

### API Errors

- Check Cloudbeds API documentation for any endpoint changes
- Verify your OAuth scopes include necessary permissions
- Test API calls directly using curl or Postman

### Testing Locally

You can test individual triggers/actions:

```bash
zapier test trigger newReservation
zapier test create createReservation
```

## Next Steps

1. Test your integration with real Cloudbeds data
2. Create example Zaps to demonstrate functionality
3. Add any additional triggers or actions you need
4. Publish your integration to the Zapier App Directory (optional)


