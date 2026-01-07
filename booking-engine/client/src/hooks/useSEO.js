/**
 * useSEO Hook
 * React hook for managing page-level SEO
 */

import { useEffect } from 'react';
import {
  updateMetaTags,
  addStructuredData,
  generateBreadcrumbSchema,
  SEO_CONFIG,
} from '../utils/seo';

/**
 * Hook to manage SEO for a page
 * @param {Object} options - SEO configuration options
 */
export function useSEO({
  title,
  description,
  canonicalUrl,
  image,
  type = 'website',
  noindex = false,
  keywords,
  schema,
  breadcrumbs,
  publishedTime,
  modifiedTime,
  author,
}) {
  useEffect(() => {
    // Update meta tags
    updateMetaTags({
      title,
      description,
      canonicalUrl,
      image,
      type,
      noindex,
      keywords,
      publishedTime,
      modifiedTime,
      author,
    });

    // Add custom schema if provided
    if (schema) {
      if (Array.isArray(schema)) {
        schema.forEach(s => addStructuredData(s));
      } else {
        addStructuredData(schema);
      }
    }

    // Add breadcrumb schema if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      addStructuredData(generateBreadcrumbSchema(breadcrumbs));
    }

    // Cleanup function to reset meta tags on unmount
    return () => {
      // Reset to defaults if needed
      // This is optional - depends on your SPA architecture
    };
  }, [
    title,
    description,
    canonicalUrl,
    image,
    type,
    noindex,
    keywords,
    schema,
    breadcrumbs,
    publishedTime,
    modifiedTime,
    author,
  ]);
}

/**
 * Preset SEO configurations for common pages
 */
export const SEO_PRESETS = {
  homepage: {
    title: 'Hennessey Estate | Luxury Bed & Breakfast in Downtown Napa Valley',
    description: 'Experience Victorian elegance at Hennessey Estate, a historic 1889 bed and breakfast in downtown Napa. 10 luxury ensuite rooms, heated pool & spa, chef-prepared breakfast.',
    canonicalUrl: SEO_CONFIG.siteUrl,
    keywords: 'Napa Valley bed and breakfast, luxury B&B Napa, downtown Napa hotel, Victorian inn California, wine country lodging',
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
    ],
  },
  
  booking: {
    title: 'Book Your Stay | Hennessey Estate - Napa Valley B&B',
    description: 'Book your luxury stay at Hennessey Estate in downtown Napa Valley. Choose from 10 ensuite rooms with pool, spa, sauna access and chef-prepared breakfast included.',
    canonicalUrl: `${SEO_CONFIG.siteUrl}/book`,
    keywords: 'book Napa Valley B&B, Hennessey Estate reservations, downtown Napa hotel booking',
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Book Your Stay', url: `${SEO_CONFIG.siteUrl}/book` },
    ],
  },
  
  rooms: {
    title: 'Luxury Rooms & Suites | Hennessey Estate Napa Valley',
    description: 'Discover our 10 unique luxury rooms and suites at Hennessey Estate. Each ensuite room features Victorian elegance with modern comforts. Pool, spa & breakfast included.',
    canonicalUrl: `${SEO_CONFIG.siteUrl}/rooms`,
    keywords: 'Napa Valley luxury rooms, Hennessey Estate suites, downtown Napa accommodations',
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Rooms & Suites', url: `${SEO_CONFIG.siteUrl}/rooms` },
    ],
  },
  
  amenities: {
    title: 'Estate Amenities | Hennessey Estate Napa Valley B&B',
    description: 'Enjoy our estate amenities: heated pool, spa, sauna, wine tasting room, and daily chef-prepared breakfast. All included with your stay at Hennessey Estate.',
    canonicalUrl: `${SEO_CONFIG.siteUrl}/amenities`,
    keywords: 'Napa B&B with pool, bed breakfast spa Napa, wine country amenities',
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Amenities', url: `${SEO_CONFIG.siteUrl}/amenities` },
    ],
  },
  
  experiences: {
    title: 'Napa Valley Experiences | Hennessey Estate',
    description: 'Plan unforgettable Napa Valley experiences from Hennessey Estate. Wine tasting tours, hot air balloons, culinary adventures, and romantic getaways.',
    canonicalUrl: `${SEO_CONFIG.siteUrl}/experiences`,
    keywords: 'Napa Valley wine tours, wine country experiences, romantic Napa getaway',
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Experiences', url: `${SEO_CONFIG.siteUrl}/experiences` },
    ],
  },
  
  contact: {
    title: 'Contact Us | Hennessey Estate Napa Valley',
    description: 'Contact Hennessey Estate for reservations, inquiries, or special requests. Located at 1727 Main Street in downtown Napa, just blocks from restaurants and wineries.',
    canonicalUrl: `${SEO_CONFIG.siteUrl}/contact`,
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Contact', url: `${SEO_CONFIG.siteUrl}/contact` },
    ],
  },
  
  faq: {
    title: 'FAQ | Hennessey Estate Napa Valley B&B',
    description: 'Find answers to frequently asked questions about staying at Hennessey Estate. Check-in times, breakfast, amenities, parking, and more.',
    canonicalUrl: `${SEO_CONFIG.siteUrl}/faq`,
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'FAQ', url: `${SEO_CONFIG.siteUrl}/faq` },
    ],
  },
  
  blog: {
    title: 'Napa Valley Guide & Blog | Hennessey Estate',
    description: 'Expert tips and guides for visiting Napa Valley from your hosts at Hennessey Estate. Wineries, restaurants, activities, and local secrets.',
    canonicalUrl: `${SEO_CONFIG.siteUrl}/blog`,
    keywords: 'Napa Valley guide, wine country tips, downtown Napa blog',
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Blog', url: `${SEO_CONFIG.siteUrl}/blog` },
    ],
  },
  
  // Dashboard pages - noindex
  dashboard: {
    title: 'Staff Dashboard | Hennessey Estate',
    description: 'Staff dashboard for Hennessey Estate.',
    noindex: true,
  },
  
  editor: {
    title: 'Website Editor | Hennessey Estate',
    description: 'Website content editor.',
    noindex: true,
  },
};

/**
 * Generate room page SEO
 */
export function generateRoomSEO(room) {
  return {
    title: `${room.name} | Luxury Suite at Hennessey Estate Napa`,
    description: `Stay in the ${room.name} at Hennessey Estate. ${room.description?.substring(0, 100) || 'Elegant Victorian room with modern amenities'}. Includes breakfast, pool & spa access. From $${room.basePrice}/night.`,
    canonicalUrl: `${SEO_CONFIG.siteUrl}/rooms/${room.slug}`,
    image: room.images?.[0] || SEO_CONFIG.defaultImage,
    keywords: `${room.name} Napa, Hennessey Estate ${room.bedType || ''} room, luxury suite Napa Valley`,
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Rooms & Suites', url: `${SEO_CONFIG.siteUrl}/rooms` },
      { name: room.name, url: `${SEO_CONFIG.siteUrl}/rooms/${room.slug}` },
    ],
  };
}

/**
 * Generate blog post SEO
 */
export function generateBlogPostSEO(post) {
  return {
    title: `${post.title} | Hennessey Estate Napa Valley Guide`,
    description: post.excerpt || post.description,
    canonicalUrl: `${SEO_CONFIG.siteUrl}/blog/${post.slug}`,
    image: post.featuredImage || SEO_CONFIG.defaultImage,
    type: 'article',
    keywords: post.tags?.join(', '),
    publishedTime: post.publishedDate,
    modifiedTime: post.modifiedDate,
    author: 'Hennessey Estate',
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Blog', url: `${SEO_CONFIG.siteUrl}/blog` },
      { name: post.title, url: `${SEO_CONFIG.siteUrl}/blog/${post.slug}` },
    ],
  };
}

/**
 * Generate experience page SEO
 */
export function generateExperienceSEO(experience) {
  return {
    title: `${experience.name} in Napa Valley | Hennessey Estate`,
    description: experience.description?.substring(0, 155) || `Enjoy ${experience.name} during your stay at Hennessey Estate in Napa Valley.`,
    canonicalUrl: `${SEO_CONFIG.siteUrl}/experiences/${experience.slug}`,
    image: experience.image || SEO_CONFIG.defaultImage,
    keywords: `${experience.name} Napa Valley, wine country ${experience.category}, Napa activities`,
    breadcrumbs: [
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Experiences', url: `${SEO_CONFIG.siteUrl}/experiences` },
      { name: experience.name, url: `${SEO_CONFIG.siteUrl}/experiences/${experience.slug}` },
    ],
  };
}

export default useSEO;
