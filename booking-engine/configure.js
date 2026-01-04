/**
 * Configuration Helper for Cloudbeds Booking Engine
 * Helps set up environment variables and test connection
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configure() {
  console.log('\n🔧 Cloudbeds Booking Engine Configuration\n');
  console.log('='.repeat(50));
  
  const envPath = path.join(__dirname, 'server', '.env');
  let envContent = '';

  // Check if .env exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\n📝 Current configuration found. You can update values.\n');
  } else {
    console.log('\n📝 Creating new configuration file...\n');
  }

  // Get Cloudbeds Access Token
  console.log('Cloudbeds API Configuration:');
  console.log('You can get your access token from:');
  console.log('  1. Cloudbeds Developer Portal (developers.cloudbeds.com)');
  console.log('  2. Zapier MCP (if using Zapier integration)');
  console.log('  3. Your Cloudbeds account settings\n');

  const accessToken = await question('Enter Cloudbeds Access Token (or press Enter to skip): ');
  
  // Get Property ID
  console.log('\nProperty ID:');
  console.log('You can find this in your Cloudbeds account or from reservations.\n');
  const propertyId = await question('Enter Property ID (or press Enter to skip): ');

  // Get Port
  const port = await question('\nEnter server port (default: 3001): ') || '3001';

  // Build .env content
  const newEnvContent = `# Cloudbeds API Configuration
# Generated on ${new Date().toISOString()}
CLOUDBEDS_ACCESS_TOKEN=${accessToken || 'your_access_token_here'}
CLOUDBEDS_PROPERTY_ID=${propertyId || 'your_property_id_here'}

# Server Configuration
PORT=${port}

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
`;

  // Write .env file
  try {
    // Ensure server directory exists
    const serverDir = path.join(__dirname, 'server');
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }

    fs.writeFileSync(envPath, newEnvContent);
    console.log('\n✅ Configuration saved to server/.env\n');
    
    if (!accessToken || accessToken === 'your_access_token_here' || !propertyId || propertyId === 'your_property_id_here') {
      console.log('⚠️  Warning: Some values are not set. Please edit server/.env manually.');
      console.log('   You can get these values from:');
      console.log('   - Cloudbeds Developer Portal');
      console.log('   - Zapier MCP connection');
      console.log('   - Your Cloudbeds account\n');
    } else {
      console.log('✅ Configuration complete! You can now start the server.\n');
    }
  } catch (error) {
    console.error('❌ Error saving configuration:', error.message);
  }

  rl.close();
}

// Run configuration
configure().catch(console.error);


