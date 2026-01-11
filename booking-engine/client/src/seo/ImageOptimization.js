/**
 * Image Optimization Utilities for SEO
 * Guidelines and helpers for optimized images
 */

/**
 * Image Optimization Guidelines
 * 
 * 1. FORMAT RECOMMENDATIONS:
 *    - Use WebP with JPEG fallback for photos
 *    - Use PNG for graphics with transparency
 *    - Use SVG for icons and logos
 * 
 * 2. SIZE GUIDELINES:
 *    - Hero images: max 1920px width
 *    - Content images: max 800px width
 *    - Thumbnails: max 400px width
 *    - Compression: 80% quality for WebP/JPEG
 * 
 * 3. NAMING CONVENTION:
 *    - Use descriptive, keyword-rich names
 *    - Use hyphens, not underscores
 *    - Include location/context
 *    - Example: "heated-pool-hennessey-estate-napa.webp"
 * 
 * 4. ALT TEXT GUIDELINES:
 *    - Be descriptive and specific
 *    - Include keywords naturally
 *    - Keep under 125 characters
 *    - Don't start with "image of" or "picture of"
 */

// Image alt text generator
export const generateAltText = (type, context = {}) => {
  const templates = {
    pool: `Heated pool ${context.time || ''} at Hennessey Estate luxury B&B in Napa Valley`.trim(),
    room: `${context.name || 'Guest'} room ${context.feature || 'with Victorian decor'} at Hennessey Estate Napa`.trim(),
    exterior: `Hennessey Estate Victorian bed and breakfast exterior in downtown Napa`,
    tasting: `Historic tasting room with original 1889 tin ceiling at Hennessey Estate`,
    breakfast: `Chef-prepared breakfast ${context.item || ''} at Hennessey Estate B&B`.trim(),
    sauna: `Traditional Finnish sauna at Hennessey Estate Napa Valley`,
    garden: `Victorian gardens ${context.season || ''} at Hennessey Estate downtown Napa`.trim(),
    spa: `Heated spa at Hennessey Estate luxury bed and breakfast Napa`,
  };

  return templates[type] || `Hennessey Estate ${type} in Napa Valley`;
};

// Responsive image srcset generator
export const generateSrcSet = (basePath, widths = [400, 800, 1200, 1920]) => {
  return widths.map(w => `${basePath}?w=${w} ${w}w`).join(', ');
};

// Image sizes attribute generator
export const generateSizes = (type) => {
  const sizeMap = {
    hero: '100vw',
    content: '(max-width: 768px) 100vw, 800px',
    thumbnail: '(max-width: 768px) 50vw, 400px',
    card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px',
  };

  return sizeMap[type] || '100vw';
};

// Lazy loading helper component
export const OptimizedImage = ({
  src,
  alt,
  type = 'content',
  className = '',
  loading = 'lazy',
  priority = false,
}) => {
  const imgProps = {
    src,
    alt,
    className,
    loading: priority ? 'eager' : loading,
    decoding: priority ? 'sync' : 'async',
  };

  // Add fetchpriority for LCP images
  if (priority) {
    imgProps.fetchpriority = 'high';
  }

  return <img {...imgProps} />;
};

// Image checklist for SEO
export const IMAGE_SEO_CHECKLIST = [
  {
    item: 'Use descriptive file names with keywords',
    example: 'heated-pool-hennessey-estate-napa.webp',
    badExample: 'IMG_12345.jpg',
  },
  {
    item: 'Add alt text to all images',
    example: 'Heated pool surrounded by Victorian gardens at Hennessey Estate',
    badExample: "'pool' or missing alt",
  },
  {
    item: 'Compress images before upload',
    example: 'WebP at 80% quality, under 200KB',
    badExample: 'Uncompressed 5MB JPEG',
  },
  {
    item: 'Use responsive images with srcset',
    example: 'srcset="img-400.webp 400w, img-800.webp 800w"',
    badExample: 'Single large image for all devices',
  },
  {
    item: 'Lazy load below-fold images',
    example: 'loading="lazy"',
    badExample: 'All images loading immediately',
  },
  {
    item: 'Prioritize LCP image',
    example: 'fetchpriority="high" on hero image',
    badExample: 'No prioritization',
  },
  {
    item: 'Add images to sitemap',
    example: 'image:image tags in sitemap.xml',
    badExample: 'Text-only sitemap',
  },
];

// Image naming convention helper
export const generateImageFileName = (subject, location, context) => {
  const parts = [subject, location, context]
    .filter(Boolean)
    .map(s => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  
  return parts.join('-') + '.webp';
};

// Placeholder for missing images
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%232A382A" width="400" height="300"/%3E%3Ctext fill="%23C5A36A" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EHennessey Estate%3C/text%3E%3C/svg%3E';

export default {
  generateAltText,
  generateSrcSet,
  generateSizes,
  OptimizedImage,
  IMAGE_SEO_CHECKLIST,
  generateImageFileName,
  PLACEHOLDER_IMAGE,
};
