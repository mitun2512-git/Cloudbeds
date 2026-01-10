/**
 * SEO Utilities for Hennessey Estate
 * State-of-the-art SEO implementation
 */

// Base configuration
export const SEO_CONFIG = {
  siteName: 'Hennessey Estate',
  siteUrl: 'https://hennesseyestate.com',
  defaultTitle: 'Hennessey Estate | Luxury Bed & Breakfast in Downtown Napa Valley',
  defaultDescription: 'Experience Victorian elegance at Hennessey Estate, a historic 1889 bed and breakfast in downtown Napa. 10 luxury ensuite rooms, heated pool & spa, chef-prepared breakfast.',
  defaultImage: 'https://hennesseyestate.com/images/pool-aerial.png',
  twitterHandle: '@hennesseynapa',
  locale: 'en_US',
  themeColor: '#2A382A',
};

/**
 * Update page meta tags dynamically
 */
export function updateMetaTags({
  title,
  description,
  canonicalUrl,
  image,
  type = 'website',
  noindex = false,
  keywords,
  publishedTime,
  modifiedTime,
  author,
}) {
  // Title
  document.title = title || SEO_CONFIG.defaultTitle;
  
  // Meta Title
  updateOrCreateMeta('name', 'title', title || SEO_CONFIG.defaultTitle);
  
  // Description
  updateOrCreateMeta('name', 'description', description || SEO_CONFIG.defaultDescription);
  
  // Keywords (still useful for some search engines)
  if (keywords) {
    updateOrCreateMeta('name', 'keywords', keywords);
  }
  
  // Robots
  const robotsContent = noindex 
    ? 'noindex, nofollow' 
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  updateOrCreateMeta('name', 'robots', robotsContent);
  updateOrCreateMeta('name', 'googlebot', noindex ? 'noindex, nofollow' : 'index, follow');
  
  // Canonical URL
  updateCanonical(canonicalUrl || window.location.href);
  
  // Open Graph
  updateOrCreateMeta('property', 'og:type', type);
  updateOrCreateMeta('property', 'og:title', title || SEO_CONFIG.defaultTitle);
  updateOrCreateMeta('property', 'og:description', description || SEO_CONFIG.defaultDescription);
  updateOrCreateMeta('property', 'og:image', image || SEO_CONFIG.defaultImage);
  updateOrCreateMeta('property', 'og:url', canonicalUrl || window.location.href);
  updateOrCreateMeta('property', 'og:site_name', SEO_CONFIG.siteName);
  updateOrCreateMeta('property', 'og:locale', SEO_CONFIG.locale);
  
  // Article-specific OG tags
  if (type === 'article') {
    if (publishedTime) {
      updateOrCreateMeta('property', 'article:published_time', publishedTime);
    }
    if (modifiedTime) {
      updateOrCreateMeta('property', 'article:modified_time', modifiedTime);
    }
    if (author) {
      updateOrCreateMeta('property', 'article:author', author);
    }
  }
  
  // Twitter Card
  updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
  updateOrCreateMeta('name', 'twitter:title', title || SEO_CONFIG.defaultTitle);
  updateOrCreateMeta('name', 'twitter:description', description || SEO_CONFIG.defaultDescription);
  updateOrCreateMeta('name', 'twitter:image', image || SEO_CONFIG.defaultImage);
}

/**
 * Helper to update or create meta tags
 */
function updateOrCreateMeta(attribute, name, content) {
  if (!content) return;
  
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

/**
 * Update canonical URL
 */
function updateCanonical(url) {
  let canonical = document.querySelector('link[rel="canonical"]');
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  
  canonical.href = url;
}

/**
 * Add JSON-LD structured data
 */
export function addStructuredData(schema) {
  // Remove existing schema with same @type if present
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === schema['@type']) {
        script.remove();
      }
    } catch (e) {
      // Skip if parsing fails
    }
  });
  
  // Add new schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}

/**
 * Generate LodgingBusiness schema
 */
export function generateLodgingSchema(data = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${SEO_CONFIG.siteUrl}/#lodging`,
    'name': 'Hennessey Estate',
    'alternateName': 'Hennessey House Bed and Breakfast',
    'description': data.description || SEO_CONFIG.defaultDescription,
    'url': SEO_CONFIG.siteUrl,
    'telephone': data.phone || '',
    'email': 'info@hennesseyestate.com',
    'priceRange': '$233 - $530',
    'image': [
      `${SEO_CONFIG.siteUrl}/images/pool-aerial.png`,
      `${SEO_CONFIG.siteUrl}/images/room-couple.png`,
      `${SEO_CONFIG.siteUrl}/images/dinner-party.png`,
    ],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '1727 Main Street',
      'addressLocality': 'Napa',
      'addressRegion': 'CA',
      'postalCode': '94559',
      'addressCountry': 'US',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 38.2981853,
      'longitude': -122.2849842,
    },
    'checkinTime': '15:00',
    'checkoutTime': '11:00',
    'numberOfRooms': 10,
    'aggregateRating': data.rating || {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '97',
      'bestRating': '5',
    },
    ...data,
  };
}

/**
 * Generate HotelRoom schema
 */
export function generateRoomSchema(room) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    'name': room.name,
    'description': room.description,
    'image': room.images || [],
    'bed': {
      '@type': 'BedDetails',
      'typeOfBed': room.bedType || 'Queen',
      'numberOfBeds': room.bedCount || 1,
    },
    'occupancy': {
      '@type': 'QuantitativeValue',
      'minValue': 1,
      'maxValue': room.maxOccupancy || 2,
    },
    'amenityFeature': (room.amenities || []).map(amenity => ({
      '@type': 'LocationFeatureSpecification',
      'name': amenity,
      'value': true,
    })),
    'offers': {
      '@type': 'Offer',
      'price': room.price,
      'priceCurrency': 'USD',
      'availability': room.available ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
  };
}

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.description,
    'image': article.image || SEO_CONFIG.defaultImage,
    'datePublished': article.publishedDate,
    'dateModified': article.modifiedDate || article.publishedDate,
    'author': {
      '@type': 'Organization',
      'name': 'Hennessey Estate',
      'url': SEO_CONFIG.siteUrl,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Hennessey Estate',
      'logo': {
        '@type': 'ImageObject',
        'url': `${SEO_CONFIG.siteUrl}/logo.png`,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': article.url || window.location.href,
    },
  };
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  };
}

/**
 * Generate Event schema for specials/packages
 */
export function generateEventSchema(event) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': event.name,
    'description': event.description,
    'startDate': event.startDate,
    'endDate': event.endDate,
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'eventStatus': 'https://schema.org/EventScheduled',
    'location': {
      '@type': 'Place',
      'name': 'Hennessey Estate',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '1727 Main Street',
        'addressLocality': 'Napa',
        'addressRegion': 'CA',
        'postalCode': '94559',
      },
    },
    'offers': event.price ? {
      '@type': 'Offer',
      'price': event.price,
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock',
    } : undefined,
    'image': event.image || SEO_CONFIG.defaultImage,
  };
}

/**
 * Generate LocalBusiness schema with enhanced details
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LodgingBusiness', 'LocalBusiness'],
    'name': 'Hennessey Estate',
    'image': SEO_CONFIG.defaultImage,
    '@id': `${SEO_CONFIG.siteUrl}/#business`,
    'url': SEO_CONFIG.siteUrl,
    'telephone': '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '1727 Main Street',
      'addressLocality': 'Napa',
      'addressRegion': 'CA',
      'postalCode': '94559',
      'addressCountry': 'US',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 38.2981853,
      'longitude': -122.2849842,
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      'opens': '00:00',
      'closes': '23:59',
    },
    'sameAs': [
      'https://www.instagram.com/hennesseynapa',
      'https://www.facebook.com/hennesseyestate',
      'https://www.tripadvisor.com/Hotel_Review-g32766-d224801-Reviews-Hennessey_House_Bed_and_Breakfast-Napa_Napa_Valley_California.html',
    ],
    'priceRange': '$233 - $530',
  };
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources) {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
}

/**
 * Add preconnect hints for external resources
 */
export function addPreconnectHints(origins) {
  origins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Track Core Web Vitals
 */
export function trackWebVitals(onReport) {
  if ('web-vital' in window) return;
  
  // Track LCP
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    onReport({ name: 'LCP', value: lastEntry.startTime });
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  
  // Track FID
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      onReport({ name: 'FID', value: entry.processingStart - entry.startTime });
    });
  });
  fidObserver.observe({ type: 'first-input', buffered: true });
  
  // Track CLS
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        onReport({ name: 'CLS', value: clsValue });
      }
    });
  });
  clsObserver.observe({ type: 'layout-shift', buffered: true });
}

/**
 * Generate sitemap entry for dynamic pages
 */
export function generateSitemapEntry(url, options = {}) {
  const defaults = {
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.5,
  };
  
  return {
    url,
    ...defaults,
    ...options,
  };
}

/**
 * SEO-friendly URL slug generator
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate estimated reading time
 */
export function calculateReadingTime(text, wordsPerMinute = 200) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(content, maxLength = 155) {
  // Strip HTML tags
  const stripped = content.replace(/<[^>]*>/g, '');
  
  // Get first X characters
  if (stripped.length <= maxLength) return stripped;
  
  // Cut at word boundary
  const truncated = stripped.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

export default {
  SEO_CONFIG,
  updateMetaTags,
  addStructuredData,
  generateLodgingSchema,
  generateRoomSchema,
  generateArticleSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateEventSchema,
  generateLocalBusinessSchema,
  preloadCriticalResources,
  addPreconnectHints,
  trackWebVitals,
  generateSitemapEntry,
  generateSlug,
  calculateReadingTime,
  generateMetaDescription,
};
