/**
 * SEO Configuration for Hennessey Estate
 * Centralized SEO settings, keywords, and metadata
 */

export const SEO_CONFIG = {
  // Site-wide settings
  site: {
    name: 'Hennessey Estate',
    tagline: 'Historic Luxury B&B in Downtown Napa',
    url: 'https://hennesseyestate.com',
    logo: 'https://hennesseyestate.com/logo.png',
    defaultImage: 'https://hennesseyestate.com/images/pool-aerial.png',
    locale: 'en_US',
    twitterHandle: '@hennesseynapa',
  },

  // Business information
  business: {
    name: 'Hennessey Estate',
    legalName: 'Hennessey House Bed and Breakfast',
    type: 'BedAndBreakfast',
    description: 'Historic 1889 Victorian bed and breakfast in downtown Napa Valley featuring 10 luxury ensuite rooms, heated pool, spa, sauna, and chef-prepared breakfast. Listed on the National Register of Historic Places.',
    foundingDate: '1889',
    address: {
      street: '1727 Main Street',
      city: 'Napa',
      state: 'CA',
      postalCode: '94559',
      country: 'US',
    },
    geo: {
      latitude: 38.2981853,
      longitude: -122.2849842,
    },
    contact: {
      email: 'info@hennesseyestate.com',
      phone: '', // Add when available
    },
    priceRange: '$233 - $706',
    numberOfRooms: 10,
    checkIn: '15:00',
    checkOut: '11:00',
    rating: {
      value: 4.8,
      count: 97,
      platform: 'Google',
    },
  },

  // Social profiles
  social: {
    instagram: 'https://www.instagram.com/hennesseynapa',
    pinterest: 'https://www.pinterest.com/hennesseyestate/',
    tripadvisor: 'https://www.tripadvisor.com/Hotel_Review-g32766-d224801-Reviews-Hennessey_House_Bed_and_Breakfast-Napa_Napa_Valley_California.html',
    booking: 'https://www.booking.com/hotel/us/hennessey-estate.html',
  },

  // Amenities list for schema
  amenities: [
    { name: 'Heated Pool', value: true },
    { name: 'Hot Tub/Spa', value: true },
    { name: 'Sauna', value: true },
    { name: 'Free WiFi', value: true },
    { name: 'Free Parking', value: true },
    { name: 'Breakfast Included', value: true },
    { name: 'Air Conditioning', value: true },
    { name: 'Concierge Service', value: true },
    { name: 'Wine Tasting Room', value: true },
    { name: 'Private Ensuite Bathrooms', value: true },
    { name: 'Molton Brown Amenities', value: true },
    { name: 'High-Speed WiFi', value: true },
  ],

  // Primary keywords by page
  keywords: {
    homepage: {
      primary: 'napa bed and breakfast',
      secondary: ['downtown napa hotels', 'luxury b&b napa', 'napa valley accommodation'],
      longTail: [
        'bed and breakfast downtown napa with pool',
        'historic victorian inn napa valley',
        'luxury boutique hotel napa',
      ],
    },
    rooms: {
      primary: 'napa valley b&b rooms',
      secondary: ['luxury rooms napa', 'victorian rooms napa', 'ensuite rooms napa'],
      longTail: [
        'luxury guest rooms downtown napa',
        'victorian bed and breakfast rooms california',
      ],
    },
    amenities: {
      primary: 'napa hotel with pool',
      secondary: ['napa b&b pool spa', 'hotel with sauna napa', 'napa breakfast included'],
      longTail: [
        'bed and breakfast with heated pool napa valley',
        'napa hotel with spa and sauna',
      ],
    },
    location: {
      primary: 'downtown napa accommodation',
      secondary: ['walkable napa hotel', 'near oxbow market hotel', 'napa wine train hotel'],
      longTail: [
        'hotel walking distance downtown napa restaurants',
        'where to stay near oxbow public market',
      ],
    },
    about: {
      primary: 'historic napa hotel',
      secondary: ['victorian inn napa', '1889 bed and breakfast', 'national register historic places napa'],
      longTail: [
        'historic victorian bed and breakfast napa valley',
        'dr hennessey napa history',
      ],
    },
    events: {
      primary: 'bottlerock napa hotel',
      secondary: ['napa wedding venue', 'corporate retreat napa', 'full property buyout napa'],
      longTail: [
        'where to stay bottlerock festival',
        'private estate rental napa valley',
      ],
    },
    blog: {
      categories: [
        'napa valley travel guide',
        'wine country tips',
        'downtown napa restaurants',
        'napa events calendar',
        'romantic getaways california',
      ],
    },
  },

  // Page-specific metadata
  pages: {
    home: {
      title: 'Hennessey Estate | Luxury B&B in Downtown Napa | Pool & Spa',
      description: 'Historic 1889 Victorian B&B just 3 blocks from downtown Napa. Heated pool, spa, sauna & chef-prepared breakfast included. Book direct and save 10%.',
      keywords: 'napa bed and breakfast, downtown napa hotel, luxury b&b napa valley, victorian inn napa, pool spa sauna napa',
    },
    book: {
      title: 'Book Your Stay | Hennessey Estate | From $233/night',
      description: 'Reserve your room at Hennessey Estate. 10 unique Victorian rooms with modern luxury. Heated pool, spa, breakfast included. Best rate guaranteed when booking direct.',
      keywords: 'book napa b&b, reserve room napa valley, hennessey estate booking, napa accommodation rates',
    },
    rooms: {
      title: 'Rooms & Suites | Hennessey Estate B&B | From $233/night',
      description: '10 unique Victorian guest rooms with modern luxury. Private baths, Molton Brown amenities, pool access & breakfast included. View rooms & book direct.',
      keywords: 'napa b&b rooms, luxury rooms downtown napa, victorian guest rooms, napa valley accommodation',
    },
    amenities: {
      title: 'Amenities | Pool, Spa & Sauna | Hennessey Estate Napa',
      description: 'Heated pool, relaxing spa, traditional sauna, chef-prepared breakfast & evening wine hour. Discover all amenities included with your stay.',
      keywords: 'napa hotel pool, bed breakfast spa, sauna napa valley, complimentary breakfast napa',
    },
    location: {
      title: 'Location | 3 Blocks from Downtown Napa | Hennessey Estate',
      description: 'Stay 3 blocks from downtown Napa\'s best restaurants, tasting rooms & Oxbow Market. Walk to everything. Discover our prime wine country location.',
      keywords: 'downtown napa hotel, walkable napa accommodation, near oxbow market, napa wine train hotel',
    },
    about: {
      title: 'Our Story | Hennessey Estate Since 1889 | National Historic Register',
      description: 'Built in 1889 for Napa\'s first physician, Dr. Edwin Hennessey. Listed on the National Register of Historic Places. Discover the story of our Victorian estate.',
      keywords: 'historic napa hotel, victorian inn california, dr hennessey napa, national register historic places',
    },
    faq: {
      title: 'FAQ | Hennessey Estate | Common Questions Answered',
      description: 'Find answers about check-in times, breakfast, pool hours, downtown distance, parking, and booking policies at Hennessey Estate B&B.',
      keywords: 'hennessey estate faq, napa b&b questions, check in check out napa, breakfast included napa',
    },
    bottlerock: {
      title: 'BottleRock 2026 Accommodation | Stay at Hennessey Estate',
      description: 'The perfect base for BottleRock Napa Valley. Walk to the festival, recover by the pool. Book early for the best BottleRock hotel packages.',
      keywords: 'bottlerock hotel, bottlerock accommodation, where to stay bottlerock, napa festival hotel',
    },
    downtownGuide: {
      title: 'Downtown Napa Guide | Restaurants & Tasting Rooms | Hennessey Estate',
      description: 'Your insider guide to downtown Napa. Best restaurants, wine tasting rooms, shops & attractions within walking distance of Hennessey Estate.',
      keywords: 'downtown napa guide, napa restaurants, wine tasting downtown napa, oxbow market guide',
    },
    events: {
      title: 'Private Events | Full Estate Buyout | Hennessey Estate',
      description: 'Book all 10 rooms for weddings, corporate retreats, milestone celebrations. Private pool, tasting room & gardens. Request a quote for your event.',
      keywords: 'napa wedding venue, corporate retreat napa, private estate rental, full property buyout',
    },
    blog: {
      title: 'Napa Valley Travel Blog | Tips & Guides | Hennessey Estate',
      description: 'Expert travel tips, seasonal guides, restaurant recommendations & insider knowledge for your Napa Valley adventure. Plan your perfect wine country trip.',
      keywords: 'napa valley blog, wine country tips, napa travel guide, napa restaurants blog',
    },
    privacy: {
      title: 'Privacy Policy | Hennessey Estate',
      description: 'Privacy policy for Hennessey Estate website and booking services.',
      keywords: '',
      noIndex: true,
    },
    terms: {
      title: 'Terms of Service | Hennessey Estate',
      description: 'Terms of service for Hennessey Estate website and booking services.',
      keywords: '',
      noIndex: true,
    },
  },

  // Seasonal content themes
  seasonal: {
    spring: {
      theme: 'Mustard Season & Wine Releases',
      keywords: ['napa mustard season', 'spring wine releases napa', 'napa spring events'],
    },
    summer: {
      theme: 'Pool Season & Outdoor Dining',
      keywords: ['napa summer vacation', 'pool hotel napa', 'outdoor dining napa valley'],
    },
    fall: {
      theme: 'Harvest & Crush Season',
      keywords: ['napa harvest season', 'crush season napa', 'fall foliage napa valley'],
    },
    winter: {
      theme: 'Cozy Getaways & Holiday Magic',
      keywords: ['napa winter getaway', 'holiday napa valley', 'off season napa'],
    },
  },

  // Event-specific content
  events: {
    bottlerock: {
      name: 'BottleRock Napa Valley',
      dates: 'May 2026',
      keywords: ['bottlerock hotel', 'bottlerock napa accommodation', 'where to stay bottlerock'],
    },
    valentines: {
      name: "Valentine's Day Getaway",
      dates: 'February 14',
      keywords: ['valentines napa', 'romantic getaway napa', 'couples napa weekend'],
    },
    thanksgiving: {
      name: 'Thanksgiving in Wine Country',
      dates: 'November',
      keywords: ['thanksgiving napa', 'napa thanksgiving dinner', 'wine country thanksgiving'],
    },
  },
};

// Helper function to get page SEO
export const getPageSEO = (pageKey) => {
  return SEO_CONFIG.pages[pageKey] || SEO_CONFIG.pages.home;
};

// Helper to generate full title
export const generateTitle = (pageTitle, includeBrand = true) => {
  if (includeBrand && !pageTitle.includes('Hennessey')) {
    return `${pageTitle} | Hennessey Estate`;
  }
  return pageTitle;
};

// Helper to get canonical URL
export const getCanonicalUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SEO_CONFIG.site.url}${cleanPath}`;
};

export default SEO_CONFIG;
