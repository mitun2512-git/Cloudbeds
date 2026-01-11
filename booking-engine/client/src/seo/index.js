/**
 * SEO Module Exports
 * Central export point for all SEO utilities
 */

import SEO_CONFIG from './seoConfig';

// Configuration
export { SEO_CONFIG, getPageSEO, generateTitle, getCanonicalUrl } from './seoConfig';

// Schema Markup Components
export {
  LodgingBusinessSchema,
  FAQSchema,
  BreadcrumbSchema,
  ArticleSchema,
  EventSchema,
  HotelRoomSchema,
  ReviewSchema,
  HowToSchema,
  PlaceSchema,
  WebsiteSchema,
} from './SchemaMarkup';

// Meta Tags
export {
  usePageMeta,
  PageMeta,
  PrerenderHints,
  generateBreadcrumbData,
} from './MetaTags';

// Image Optimization
export {
  generateAltText,
  generateSrcSet,
  generateSizes,
  OptimizedImage,
  IMAGE_SEO_CHECKLIST,
  generateImageFileName,
  PLACEHOLDER_IMAGE,
} from './ImageOptimization';

// Google Business Profile Content
export { GBP_POSTS, GBP_QA, generateContentCalendar } from './GBPContent';

// Re-export default
export default SEO_CONFIG;
