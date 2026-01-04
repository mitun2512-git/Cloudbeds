/**
 * Guest Chat Service - Gemini AI Chatbot for Prospective Guests
 * Provides information about room availability, pricing, and property amenities
 * Now with REAL-TIME availability and pricing from Cloudbeds!
 */

const axios = require('axios');

// Gemini API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCr4cGjVS8z0pSBfplnKT7cEXnLTSHbums';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Server API base URL (for fetching availability)
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// In-memory storage for guest chat interactions (would use database in production)
let guestInteractions = [];

// Property information for the chatbot
const PROPERTY_INFO = `
# Hennessey Estate - Property Information

## About the Property
Hennessey Estate is a historic 1889 Victorian bed and breakfast located in the heart of downtown Napa Valley. 
Listed on the National Register of Historic Places, it offers 10 luxury ensuite guest rooms.

## Location
- Address: 1727 Main Street, Napa, CA 94559
- Just 3 blocks from downtown Napa
- Walking distance to Michelin-starred restaurants, boutique tasting rooms, Oxbow Public Market, and Napa Valley Wine Train

## Room Types & Starting Rates
1. **Hennessey House Rooms** (5 rooms) - From $233/night
   - Queen or King beds
   - En-suite bathrooms with walk-in showers
   - Original Victorian architecture
   
2. **Carriage House Rooms** (5 rooms) - From $283/night
   - California King beds
   - More spacious layouts
   - Private entrances available

3. **Total Property Buyout** - From $3,500/night
   - All 10 rooms exclusively yours
   - Perfect for weddings, corporate retreats, family reunions
   - Private access to all amenities

## What's Included with Every Stay
- **Chef-Prepared Breakfast**: Gourmet locally-sourced breakfast served daily in our historic tasting room
- **Heated Pool & Spa**: Year-round heated outdoor pool and hot tub
- **Traditional Sauna**: Dry sauna for relaxation
- **Evening Wine Hour**: Complimentary wine tasting each evening
- **Free Parking**: On-site parking for all guests
- **High-Speed WiFi**: Throughout the property
- **Molton Brown Amenities**: Premium bath products in every room
- **Concierge Service**: Wine tour and restaurant reservations

## Policies
- **Check-in**: 3:00 PM
- **Check-out**: 11:00 AM
- **Pets**: Not permitted
- **Children**: Welcome (ages 12+)
- **Smoking**: Non-smoking property
- **Cancellation**: Free cancellation up to 72 hours before arrival

## Guest Reviews
- **Google**: 4.9/5 stars (97 reviews)
- **Booking.com**: 9.6/10 (36 reviews)
- "Exceptional" rating for cleanliness, comfort, and location

## The Experience
- Wake up to birdsong in Victorian gardens
- Enjoy breakfast under a 130-year-old tin ceiling
- Relax by the pool after wine tasting
- Walk to downtown Napa for dinner
- Return to the quiet elegance of your private room

## Contact
- Email: info@hennesseyestate.com
- Website: hennesseyestate.com
- Book Direct for Best Rates

## Special Offerings
- **Private Events**: Host intimate weddings, corporate retreats, or celebrations
- **Wine Tasting Room**: Historic room with original 19th-century tin ceiling
- **Packed Lunches**: Available for wine country excursions
- **Private Chef Dinners**: Custom multi-course dinners can be arranged
`;

/**
 * Fetch real-time availability and pricing from Cloudbeds API
 */
async function fetchAvailability(startDate, endDate) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/availability`, {
      params: {
        start_date: startDate,
        end_date: endDate || startDate
      },
      timeout: 10000
    });
    
    if (response.data && response.data.rooms) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return { success: false, error: 'No availability data returned' };
  } catch (error) {
    console.error('[GuestChat] Error fetching availability:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Parse dates from user message using natural language
 */
function parseDatesFromMessage(message) {
  const today = new Date();
  const lowerMessage = message.toLowerCase();
  
  // Common date patterns
  const datePatterns = [
    // "January 15" or "Jan 15" or "January 15th"
    /(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*[-–to]+\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)?\s*(\d{1,2})(?:st|nd|rd|th)?)?/gi,
    // "1/15" or "01/15/2025" or "1-15-2025"
    /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/g,
    // "2025-01-15" ISO format
    /(\d{4})-(\d{2})-(\d{2})/g
  ];
  
  // Try to find dates
  let startDate = null;
  let endDate = null;
  
  // Check for relative dates
  if (lowerMessage.includes('tonight') || lowerMessage.includes('today')) {
    startDate = today;
    endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);
  } else if (lowerMessage.includes('tomorrow')) {
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() + 1);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
  } else if (lowerMessage.includes('this weekend')) {
    // Find next Saturday
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilSaturday);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // Sunday
  } else if (lowerMessage.includes('next weekend')) {
    // Find Saturday after this weekend
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilSaturday + 7);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
  }
  
  // Try ISO format first (most reliable)
  const isoMatch = message.match(/(\d{4})-(\d{2})-(\d{2})/g);
  if (isoMatch && isoMatch.length >= 1) {
    startDate = new Date(isoMatch[0]);
    if (isoMatch.length >= 2) {
      endDate = new Date(isoMatch[1]);
    }
  }
  
  // Try month name format
  if (!startDate) {
    const monthNames = {
      'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
      'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5,
      'jul': 6, 'july': 6, 'aug': 7, 'august': 7, 'sep': 8, 'september': 8,
      'oct': 9, 'october': 9, 'nov': 10, 'november': 10, 'dec': 11, 'december': 11
    };
    
    const monthPattern = /(?:(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?)/gi;
    const matches = [...message.matchAll(monthPattern)];
    
    if (matches.length >= 1) {
      const monthNum = monthNames[matches[0][1].toLowerCase()];
      const day = parseInt(matches[0][2]);
      const year = today.getFullYear();
      startDate = new Date(year, monthNum, day);
      
      // If date is in the past, assume next year
      if (startDate < today) {
        startDate.setFullYear(year + 1);
      }
      
      if (matches.length >= 2) {
        const endMonthNum = monthNames[matches[1][1].toLowerCase()];
        const endDay = parseInt(matches[1][2]);
        endDate = new Date(year, endMonthNum, endDay);
        if (endDate < startDate) {
          endDate.setFullYear(year + 1);
        }
      }
    }
  }
  
  // Try numeric format (1/15 or 1-15)
  if (!startDate) {
    const numericPattern = /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/g;
    const matches = [...message.matchAll(numericPattern)];
    
    if (matches.length >= 1) {
      const month = parseInt(matches[0][1]) - 1;
      const day = parseInt(matches[0][2]);
      let year = matches[0][3] ? parseInt(matches[0][3]) : today.getFullYear();
      if (year < 100) year += 2000;
      
      startDate = new Date(year, month, day);
      if (startDate < today && !matches[0][3]) {
        startDate.setFullYear(today.getFullYear() + 1);
      }
      
      if (matches.length >= 2) {
        const endMonth = parseInt(matches[1][1]) - 1;
        const endDay = parseInt(matches[1][2]);
        let endYear = matches[1][3] ? parseInt(matches[1][3]) : startDate.getFullYear();
        if (endYear < 100) endYear += 2000;
        endDate = new Date(endYear, endMonth, endDay);
      }
    }
  }
  
  // Format dates as YYYY-MM-DD
  const formatDate = (d) => {
    if (!d || isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  };
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate) || formatDate(startDate)
  };
}

/**
 * Format availability data for the AI prompt
 */
function formatAvailabilityContext(availabilityData, startDate, endDate) {
  if (!availabilityData || !availabilityData.rooms || availabilityData.rooms.length === 0) {
    return `
## Real-Time Availability Check Failed
Unable to fetch current availability. Please direct the guest to the booking page for accurate information.`;
  }
  
  const rooms = availabilityData.rooms;
  const availableRooms = rooms.filter(r => r.available > 0);
  const nights = availabilityData.nights || 1;
  
  let context = `
## 🔴 LIVE AVAILABILITY DATA - ${startDate} to ${endDate} (${nights} night${nights > 1 ? 's' : ''})
`;
  
  if (availableRooms.length === 0) {
    context += `
**NO ROOMS AVAILABLE** for these dates. All rooms are fully booked.

Suggest the guest:
1. Try different dates (perhaps a few days earlier or later)
2. Consider a weekday stay which typically has better availability
3. Join our waitlist by contacting info@hennesseyestate.com
`;
  } else {
    context += `
**${availableRooms.length} Room Type${availableRooms.length > 1 ? 's' : ''} Available:**

`;
    
    availableRooms.forEach(room => {
      const totalPrice = room.totalPrice || (room.price * nights);
      const pricePerNight = room.price || Math.round(totalPrice / nights);
      
      context += `### ${room.name}
- **Availability**: ${room.available} room${room.available > 1 ? 's' : ''} left
- **Rate**: $${pricePerNight}/night
- **Total for ${nights} night${nights > 1 ? 's' : ''}**: $${totalPrice}
- **Max Guests**: ${room.maxGuests || 2} people
${room.description ? `- **Description**: ${room.description}` : ''}

`;
    });
    
    context += `
**Important**: These rates and availability are LIVE from our booking system. You can confidently share this pricing with guests!

When sharing prices:
- Quote the total price for their stay
- Mention "book direct for best rates"
- Offer to help them proceed with booking at hennesseyestate.com/book
`;
  }
  
  return context;
}

// Build dynamic system prompt
function buildSystemPrompt(availabilityContext = '') {
  return `You are the friendly AI concierge for Hennessey Estate, a luxury bed and breakfast in Napa Valley.

## Your Role
You help prospective guests learn about the property and make booking decisions. You are warm, helpful, and professional.

## IMPORTANT: You now have REAL-TIME availability and pricing data!
When guests ask about specific dates, you CAN provide:
- Exact room availability for those dates
- Actual pricing (not just "starting from")
- Which room types are available
- Total cost for their stay

${availabilityContext}

## What You CAN Discuss
- Room types, descriptions, and rates
- LIVE availability for specific dates (when provided in context above)
- Exact pricing for specific dates (when provided in context above)
- Amenities (pool, spa, sauna, breakfast, wine hour, etc.)
- Property location and nearby attractions
- Policies (check-in/out times, cancellation, pets, etc.)
- What's included with every stay
- The guest experience at Hennessey Estate
- General Napa Valley area information
- How to book (direct through website for best rates)

## What You CANNOT Discuss
- Competitor properties or comparisons
- Staff-only information
- Guest personal data or reservation details

## Response Guidelines
1. Be concise but thorough - aim for 2-3 paragraphs max
2. Use a warm, welcoming tone that reflects the property's elegance
3. When you have live availability data, confidently share exact prices!
4. If no availability data is provided, encourage checking the booking page
5. Highlight unique features: historic property, chef's breakfast, pool & spa, downtown location
6. Always mention "book direct for best rates" when appropriate
7. End responses with a helpful suggestion or offer to book

## Property Information
${PROPERTY_INFO}

Current Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
`;
}

/**
 * Send a message to Gemini for guest chat
 * Now with real-time availability checking!
 */
async function sendGuestMessage(userMessage, conversationHistory = []) {
  try {
    // Check if user is asking about dates/availability
    let availabilityContext = '';
    const { startDate, endDate } = parseDatesFromMessage(userMessage);
    
    // Also check conversation history for dates
    let historicalDates = null;
    if (!startDate && conversationHistory.length > 0) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const msg = conversationHistory[i];
        if (msg.role === 'user') {
          const parsed = parseDatesFromMessage(msg.content);
          if (parsed.startDate) {
            historicalDates = parsed;
            break;
          }
        }
      }
    }
    
    const finalDates = startDate ? { startDate, endDate } : historicalDates;
    
    // If dates are mentioned, fetch real-time availability
    if (finalDates && finalDates.startDate) {
      console.log(`[GuestChat] Fetching availability for ${finalDates.startDate} to ${finalDates.endDate}`);
      const availabilityResult = await fetchAvailability(finalDates.startDate, finalDates.endDate);
      
      if (availabilityResult.success) {
        availabilityContext = formatAvailabilityContext(
          availabilityResult.data, 
          finalDates.startDate, 
          finalDates.endDate
        );
        console.log('[GuestChat] Got real-time availability data');
      } else {
        console.log('[GuestChat] Could not fetch availability:', availabilityResult.error);
      }
    }
    
    // Build dynamic system prompt with availability context
    const systemPrompt = buildSystemPrompt(availabilityContext);
    
    // Build conversation contents
    const contents = [];
    
    // Add conversation history
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
    
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const candidate = response.data.candidates?.[0];
    if (!candidate) {
      throw new Error('No response from AI');
    }
    
    const textPart = candidate.content?.parts?.find(p => p.text);
    if (textPart) {
      return {
        success: true,
        response: textPart.text,
        hasAvailabilityData: !!availabilityContext,
        datesChecked: finalDates
      };
    }
    
    return {
      success: false,
      error: 'No response generated'
    };
    
  } catch (error) {
    console.error('[GuestChat] Error:', error.response?.data || error.message);
    
    let errorMessage = 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact us directly at info@hennesseyestate.com';
    
    if (error.response?.status === 429) {
      errorMessage = 'Our chat service is very busy right now. Please try again in a moment or visit our booking page directly.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Save guest interaction
 */
function saveGuestInteraction(guestInfo, messages, metadata = {}) {
  const interaction = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    guestInfo: {
      name: guestInfo.name,
      email: guestInfo.email,
      phone: guestInfo.phone || null
    },
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp || new Date().toISOString()
    })),
    startedAt: metadata.startedAt || new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    messageCount: messages.length,
    metadata: {
      userAgent: metadata.userAgent || null,
      referrer: metadata.referrer || null,
      ipAddress: metadata.ipAddress || null
    }
  };
  
  // Store interaction
  guestInteractions.unshift(interaction);
  
  // Keep only last 1000 interactions in memory
  if (guestInteractions.length > 1000) {
    guestInteractions = guestInteractions.slice(0, 1000);
  }
  
  console.log(`[GuestChat] Saved interaction ${interaction.id} for ${guestInfo.name} (${guestInfo.email})`);
  
  return interaction;
}

/**
 * Update existing interaction with new messages
 */
function updateGuestInteraction(interactionId, newMessages) {
  const interaction = guestInteractions.find(i => i.id === interactionId);
  
  if (interaction) {
    interaction.messages.push(...newMessages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp || new Date().toISOString()
    })));
    interaction.lastMessageAt = new Date().toISOString();
    interaction.messageCount = interaction.messages.length;
    
    console.log(`[GuestChat] Updated interaction ${interactionId}`);
  }
  
  return interaction;
}

/**
 * Get all guest interactions (for dashboard)
 */
function getGuestInteractions(options = {}) {
  let results = [...guestInteractions];
  
  // Filter by date range
  if (options.startDate) {
    const start = new Date(options.startDate);
    results = results.filter(i => new Date(i.startedAt) >= start);
  }
  
  if (options.endDate) {
    const end = new Date(options.endDate);
    results = results.filter(i => new Date(i.startedAt) <= end);
  }
  
  // Filter by email
  if (options.email) {
    results = results.filter(i => 
      i.guestInfo.email?.toLowerCase().includes(options.email.toLowerCase())
    );
  }
  
  // Filter by name
  if (options.name) {
    results = results.filter(i => 
      i.guestInfo.name?.toLowerCase().includes(options.name.toLowerCase())
    );
  }
  
  // Pagination
  const page = options.page || 1;
  const limit = options.limit || 50;
  const offset = (page - 1) * limit;
  
  return {
    total: results.length,
    page,
    limit,
    interactions: results.slice(offset, offset + limit)
  };
}

/**
 * Get a single interaction by ID
 */
function getGuestInteraction(interactionId) {
  return guestInteractions.find(i => i.id === interactionId);
}

/**
 * Get chat statistics
 */
function getChatStats() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const todayChats = guestInteractions.filter(i => new Date(i.startedAt) >= today);
  const thisWeekChats = guestInteractions.filter(i => new Date(i.startedAt) >= thisWeekStart);
  const thisMonthChats = guestInteractions.filter(i => new Date(i.startedAt) >= thisMonthStart);
  
  // Calculate average messages per chat
  const avgMessages = guestInteractions.length > 0
    ? Math.round(guestInteractions.reduce((sum, i) => sum + i.messageCount, 0) / guestInteractions.length)
    : 0;
  
  // Get unique guests
  const uniqueEmails = new Set(guestInteractions.map(i => i.guestInfo.email?.toLowerCase()).filter(Boolean));
  
  return {
    total: guestInteractions.length,
    today: todayChats.length,
    thisWeek: thisWeekChats.length,
    thisMonth: thisMonthChats.length,
    uniqueGuests: uniqueEmails.size,
    avgMessagesPerChat: avgMessages,
    recentChats: guestInteractions.slice(0, 5).map(i => ({
      id: i.id,
      guestName: i.guestInfo.name,
      guestEmail: i.guestInfo.email,
      messageCount: i.messageCount,
      startedAt: i.startedAt,
      lastMessageAt: i.lastMessageAt
    }))
  };
}

module.exports = {
  sendGuestMessage,
  saveGuestInteraction,
  updateGuestInteraction,
  getGuestInteractions,
  getGuestInteraction,
  getChatStats,
  fetchAvailability,
  parseDatesFromMessage
};

