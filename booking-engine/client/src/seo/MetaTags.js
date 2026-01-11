/**
 * SEO Meta Tags Manager
 * Dynamically updates document head for each page
 */

import { useEffect } from 'react';
import { SEO_CONFIG, getPageSEO, getCanonicalUrl } from './seoConfig';

/**
 * Hook to set page meta tags
 * @param {Object} options - Meta tag options
 * @param {string} options.pageKey - Key from SEO_CONFIG.pages
 * @param {string} options.title - Custom title (overrides pageKey)
 * @param {string} options.description - Custom description
 * @param {string} options.keywords - Custom keywords
 * @param {string} options.image - OG image URL
 * @param {string} options.path - Page path for canonical URL
 * @param {boolean} options.noIndex - Add noindex directive
 * @param {string} options.type - OG type (website, article, etc.)
 */
export const usePageMeta = ({
  pageKey,
  title,
  description,
  keywords,
  image,
  path = '',
  noIndex = false,
  type = 'website',
  article = null,
}) => {
  useEffect(() => {
    const pageSEO = pageKey ? getPageSEO(pageKey) : {};
    
    // Determine final values
    const finalTitle = title || pageSEO.title || SEO_CONFIG.pages.home.title;
    const finalDescription = description || pageSEO.description || SEO_CONFIG.pages.home.description;
    const finalKeywords = keywords || pageSEO.keywords || '';
    const finalImage = image || SEO_CONFIG.site.defaultImage;
    const canonicalUrl = getCanonicalUrl(path);
    const shouldNoIndex = noIndex || pageSEO.noIndex;

    // Update document title
    document.title = finalTitle;

    // Helper to update or create meta tag
    const updateMeta = (selector, content, attrName = 'content') => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        const [attr, value] = selector.replace('meta[', '').replace(']', '').split('=');
        meta.setAttribute(attr, value.replace(/"/g, ''));
        document.head.appendChild(meta);
      }
      meta.setAttribute(attrName, content);
    };

    // Basic meta tags
    updateMeta('meta[name="description"]', finalDescription);
    updateMeta('meta[name="keywords"]', finalKeywords);
    
    // Robots
    if (shouldNoIndex) {
      updateMeta('meta[name="robots"]', 'noindex, nofollow');
    } else {
      updateMeta('meta[name="robots"]', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Open Graph
    updateMeta('meta[property="og:title"]', finalTitle);
    updateMeta('meta[property="og:description"]', finalDescription);
    updateMeta('meta[property="og:image"]', finalImage);
    updateMeta('meta[property="og:url"]', canonicalUrl);
    updateMeta('meta[property="og:type"]', type);
    updateMeta('meta[property="og:site_name"]', SEO_CONFIG.site.name);
    updateMeta('meta[property="og:locale"]', SEO_CONFIG.site.locale);

    // Twitter
    updateMeta('meta[name="twitter:title"]', finalTitle);
    updateMeta('meta[name="twitter:description"]', finalDescription);
    updateMeta('meta[name="twitter:image"]', finalImage);
    updateMeta('meta[name="twitter:card"]', 'summary_large_image');

    // Article-specific meta (for blog posts)
    if (article && type === 'article') {
      if (article.publishedTime) {
        updateMeta('meta[property="article:published_time"]', article.publishedTime);
      }
      if (article.modifiedTime) {
        updateMeta('meta[property="article:modified_time"]', article.modifiedTime);
      }
      if (article.author) {
        updateMeta('meta[property="article:author"]', article.author);
      }
      if (article.section) {
        updateMeta('meta[property="article:section"]', article.section);
      }
      if (article.tags) {
        // Remove existing tag metas
        document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
        // Add new tags
        article.tags.forEach(tag => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:tag');
          meta.setAttribute('content', tag);
          document.head.appendChild(meta);
        });
      }
    }

    // Cleanup function - reset to defaults when component unmounts
    return () => {
      // We don't reset on unmount as it causes flicker
      // The next page will set its own meta tags
    };
  }, [pageKey, title, description, keywords, image, path, noIndex, type, article]);
};

/**
 * Component version for class components
 */
export const PageMeta = (props) => {
  usePageMeta(props);
  return null;
};

/**
 * Prerender hints for important pages
 */
export const PrerenderHints = () => {
  useEffect(() => {
    const hints = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://www.google-analytics.com' },
      { rel: 'dns-prefetch', href: 'https://static.wixstatic.com' },
    ];

    hints.forEach(hint => {
      const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossOrigin) {
          link.crossOrigin = hint.crossOrigin;
        }
        document.head.appendChild(link);
      }
    });
  }, []);

  return null;
};

/**
 * Generate JSON-LD for breadcrumbs
 */
export const generateBreadcrumbData = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SEO_CONFIG.site.url}${item.path}`,
    })),
  };
};

export default {
  usePageMeta,
  PageMeta,
  PrerenderHints,
  generateBreadcrumbData,
};
