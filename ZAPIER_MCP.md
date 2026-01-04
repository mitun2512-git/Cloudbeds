# Accessing Cloudbeds Through Zapier MCP

Zapier MCP (Model Context Protocol) allows AI assistants to interact with Cloudbeds and 8,000+ other apps through natural language commands. This is different from traditional Zaps - it enables direct AI-to-app communication.

## What is Zapier MCP?

Zapier MCP is a standardized framework that enables AI assistants (like Claude, ChatGPT, Cursor, etc.) to:
- Execute actions across 8,000+ apps
- Access data from connected services
- Perform tasks using natural language
- Work securely with built-in authentication

## Benefits of Using Zapier MCP for Cloudbeds

1. **Natural Language Access**: Ask AI to "create a reservation for John Doe" instead of building a Zap
2. **Direct Integration**: AI can access Cloudbeds directly without pre-configured workflows
3. **Multi-App Actions**: Combine Cloudbeds with other apps in a single command
4. **Secure**: Built-in authentication and encryption
5. **No Coding Required**: Everything works through conversation

## Setup: Connect Cloudbeds to Zapier MCP

### Step 1: Create a Zapier MCP Server

1. **Visit Zapier MCP Portal:**
   - Go to [mcp.zapier.com](https://mcp.zapier.com/)
   - Sign in with your Zapier account

2. **Create New MCP Server:**
   - Click "+ New MCP Server"
   - Select your AI client (Claude, Cursor, Windsurf, etc.)
   - Name your server (e.g., "Cloudbeds Assistant")

3. **Get Your MCP Endpoint:**
   - Zapier will generate a unique MCP endpoint URL
   - Copy this URL - you'll need it to connect your AI client

### Step 2: Connect Cloudbeds to Your Zapier Account

Before the AI can access Cloudbeds, you need to connect it in Zapier:

1. **Go to Zapier Apps:**
   - Visit [zapier.com/apps](https://zapier.com/apps)
   - Search for "Cloudbeds"

2. **Connect Cloudbeds:**
   - Click "Connect Cloudbeds + Zapier"
   - Sign in to your Cloudbeds account
   - Authorize Zapier to access your Cloudbeds data
   - Your Cloudbeds account is now connected to Zapier

### Step 3: Configure MCP Tools (Actions)

1. **In Your MCP Server Settings:**
   - Go to "Tools" or "Actions" section
   - Search for "Cloudbeds"

2. **Add Cloudbeds Actions:**
   - **Create Reservation** - Create new reservations
   - **Update Reservation** - Modify existing reservations
   - **Cancel Reservation** - Cancel reservations
   - **Create Guest** - Add new guest profiles
   - **Find Reservation** - Search for reservations
   - **Find Guest** - Search for guests
   - **Get Reservations** - List reservations
   - **Get Guests** - List guests

3. **Configure Each Action:**
   - Set which Cloudbeds account to use
   - Define default values if needed
   - Set up any required mappings

### Step 4: Connect Your AI Client

The steps vary by AI client, but generally:

#### For Cursor/VS Code:
1. Open settings/preferences
2. Find "MCP Servers" or "Model Context Protocol"
3. Add new server:
   ```json
   {
     "name": "zapier-cloudbeds",
     "url": "https://mcp.zapier.com/your-endpoint",
     "apiKey": "your-api-key"
   }
   ```

#### For Claude Desktop:
1. Edit `claude_desktop_config.json`
2. Add MCP server configuration
3. Restart Claude Desktop

#### For Other Clients:
- Check your AI client's documentation for MCP setup
- Most support MCP through configuration files

## Using Cloudbeds Through Zapier MCP

Once set up, you can interact with Cloudbeds through natural language:

### Example Commands:

**Create a Reservation:**
```
"Create a reservation in Cloudbeds for John Doe, checking in January 15th, 
checking out January 17th, at the Downtown Hotel, 2 adults"
```

**Find a Guest:**
```
"Find the guest with email john.doe@example.com in Cloudbeds"
```

**Update a Reservation:**
```
"Update reservation 12345 to check out on January 18th instead"
```

**Cancel a Reservation:**
```
"Cancel reservation 12345 in Cloudbeds, reason: guest request"
```

**Get Recent Reservations:**
```
"Show me the last 10 reservations in Cloudbeds"
```

**Create a Guest Profile:**
```
"Create a new guest profile in Cloudbeds for Jane Smith, 
email jane@example.com, phone 555-1234"
```

## Available Cloudbeds Actions via MCP

### Reservation Management:
- ✅ Create Reservation
- ✅ Update Reservation
- ✅ Cancel Reservation
- ✅ Get Reservation (by ID)
- ✅ List Reservations
- ✅ Find Reservation (search)

### Guest Management:
- ✅ Create Guest
- ✅ Update Guest
- ✅ Get Guest (by ID)
- ✅ List Guests
- ✅ Find Guest (search)

### Property & Room Data:
- ✅ Get Properties
- ✅ Get Rooms
- ✅ Get Availability
- ✅ Get Transactions

## Combining Cloudbeds with Other Apps

One powerful feature of Zapier MCP is combining multiple apps:

**Example: Create Reservation + Send Email:**
```
"Create a reservation in Cloudbeds for John Doe, then send him a 
confirmation email through Gmail"
```

**Example: Check-In Guest + Add to CRM:**
```
"When a guest checks in to Cloudbeds, add them to our HubSpot CRM 
and tag them as 'active guest'"
```

## Security & Authentication

- **OAuth2**: Cloudbeds uses secure OAuth2 authentication
- **Token Management**: Zapier handles token refresh automatically
- **Encryption**: All data is encrypted in transit
- **Rate Limiting**: Built-in protection against abuse
- **Access Control**: You control which apps and actions are available

## Troubleshooting

### AI Can't Access Cloudbeds
- Verify Cloudbeds is connected in your Zapier account
- Check that Cloudbeds actions are enabled in your MCP server
- Ensure your MCP endpoint is correctly configured in your AI client

### Actions Not Working
- Test the action directly in Zapier first
- Verify your Cloudbeds account has proper permissions
- Check Zapier MCP logs for error messages

### Authentication Issues
- Reconnect your Cloudbeds account in Zapier
- Verify OAuth credentials are still valid
- Check that your Zapier account is active

## Best Practices

1. **Start Simple**: Begin with basic actions like "get reservations"
2. **Test First**: Try actions in Zapier UI before using via MCP
3. **Be Specific**: Provide clear, detailed commands
4. **Use Filters**: Specify which property, dates, etc.
5. **Monitor Usage**: Check Zapier MCP dashboard for activity

## Example Workflows

### Daily Operations:
```
"Show me all guests checking in today at the Downtown Hotel"
"List all reservations that need follow-up"
"Find any cancelled reservations from this week"
```

### Guest Communication:
```
"Create a reservation for Sarah Johnson, then send her a welcome email"
"Find the guest who checked out yesterday and send them a review request"
```

### Reporting:
```
"Get all reservations from last month and summarize the revenue"
"List all guests who stayed more than 3 nights"
```

## Resources

- **Zapier MCP Docs**: [docs.zapier.com/mcp](https://docs.zapier.com/mcp)
- **Zapier MCP Portal**: [mcp.zapier.com](https://mcp.zapier.com/)
- **Cloudbeds API Docs**: [developers.cloudbeds.com](https://developers.cloudbeds.com/)
- **MCP Specification**: [modelcontextprotocol.io](https://modelcontextprotocol.io/)

## Comparison: Traditional Zaps vs. MCP

| Feature | Traditional Zaps | Zapier MCP |
|---------|----------------|------------|
| **Setup** | Pre-configure workflows | On-demand via AI |
| **Flexibility** | Fixed workflows | Dynamic, conversational |
| **Use Case** | Automated workflows | Interactive AI assistance |
| **Learning Curve** | Requires Zap building | Natural language |
| **Best For** | Recurring automation | Ad-hoc tasks & queries |

## Next Steps

1. **Set Up MCP Server**: Create your server at [mcp.zapier.com](https://mcp.zapier.com/)
2. **Connect Cloudbeds**: Link your Cloudbeds account in Zapier
3. **Configure Tools**: Add Cloudbeds actions to your MCP server
4. **Connect AI Client**: Configure your AI assistant to use MCP
5. **Start Using**: Begin interacting with Cloudbeds through natural language!

---

**Ready to get started?** Visit [mcp.zapier.com](https://mcp.zapier.com/) to create your MCP server and start accessing Cloudbeds through AI!


