# Quick Start: Cloudbeds via Zapier MCP

Get Cloudbeds working with AI assistants in 5 minutes.

## What You'll Need

- Zapier account (free tier works)
- Cloudbeds account
- AI client that supports MCP (Cursor, Claude Desktop, etc.)

## 5-Minute Setup

### 1. Create MCP Server (2 min)
1. Go to [mcp.zapier.com](https://mcp.zapier.com/)
2. Click "+ New MCP Server"
3. Choose your AI client
4. Name it "Cloudbeds"
5. Copy the endpoint URL

### 2. Connect Cloudbeds (1 min)
1. Go to [zapier.com/apps/cloudbeds](https://zapier.com/apps/cloudbeds)
2. Click "Connect Cloudbeds"
3. Sign in and authorize

### 3. Add Cloudbeds Tools (1 min)
1. In your MCP server, go to "Tools"
2. Search "Cloudbeds"
3. Add these tools:
   - Create Reservation
   - Find Reservation
   - Get Reservations
   - Create Guest

### 4. Connect AI Client (1 min)
Add to your AI client's MCP config:
```json
{
  "zapier-cloudbeds": {
    "url": "https://mcp.zapier.com/your-endpoint",
    "apiKey": "your-key"
  }
}
```

## Try It Out

Ask your AI:
- "Show me recent reservations in Cloudbeds"
- "Create a reservation for John Doe, checking in tomorrow"
- "Find the guest with email john@example.com"

## That's It!

You can now access Cloudbeds through natural language. See [ZAPIER_MCP.md](ZAPIER_MCP.md) for full documentation.


