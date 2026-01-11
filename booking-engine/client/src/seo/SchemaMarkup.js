/**
 * Schema.org JSON-LD Markup Components
 * Generate structured data for better search visibility
 */

import React from 'react';
import { SEO_CONFIG } from './seoConfig';

// Base LodgingBusiness Schema (already in index.html, but can be used dynamically)
export const LodgingBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BedAndBreakfast",
    "@id": `${SEO_CONFIG.site.url}/#lodging`,
    "name": SEO_CONFIG.business.name,
    "alternateName": SEO_CONFIG.business.legalName,
    "description": SEO_CONFIG.business.description,
    "url": SEO_CONFIG.site.url,
    "telephone": SEO_CONFIG.business.contact.phone,
    "email": SEO_CONFIG.business.contact.email,
    "priceRange": SEO_CONFIG.business.priceRange,
    "currenciesAccepted": "USD",
    "paymentAccepted": "Cash, Credit Card",
    "image": [
      `${SEO_CONFIG.site.url}/images/pool-aerial.png`,
      `${SEO_CONFIG.site.url}/images/room-couple.png`,
      `${SEO_CONFIG.site.url}/images/dinner-party.png`,
    ],
    "logo": SEO_CONFIG.site.logo,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SEO_CONFIG.business.address.street,
      "addressLocality": SEO_CONFIG.business.address.city,
      "addressRegion": SEO_CONFIG.business.address.state,
      "postalCode": SEO_CONFIG.business.address.postalCode,
      "addressCountry": SEO_CONFIG.business.address.country,
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": SEO_CONFIG.business.geo.latitude,
      "longitude": SEO_CONFIG.business.geo.longitude,
    },
    "checkinTime": SEO_CONFIG.business.checkIn,
    "checkoutTime": SEO_CONFIG.business.checkOut,
    "numberOfRooms": SEO_CONFIG.business.numberOfRooms,
    "petsAllowed": false,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": SEO_CONFIG.business.rating.value,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": SEO_CONFIG.business.rating.count,
      "reviewCount": SEO_CONFIG.business.rating.count,
    },
    "amenityFeature": SEO_CONFIG.amenities.map(a => ({
      "@type": "LocationFeatureSpecification",
      "name": a.name,
      "value": a.value,
    })),
    "sameAs": Object.values(SEO_CONFIG.social),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// FAQ Schema
export const FAQSchema = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Breadcrumb Schema
export const BreadcrumbSchema = ({ items }) => {
  if (!items || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url || `${SEO_CONFIG.site.url}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Article/Blog Post Schema
export const ArticleSchema = ({ 
  title, 
  description, 
  image, 
  datePublished, 
  dateModified, 
  author = 'Hennessey Estate',
  url,
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image || SEO_CONFIG.site.defaultImage,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Organization",
      "name": author,
      "url": SEO_CONFIG.site.url,
    },
    "publisher": {
      "@type": "Organization",
      "name": SEO_CONFIG.business.name,
      "logo": {
        "@type": "ImageObject",
        "url": SEO_CONFIG.site.logo,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url || SEO_CONFIG.site.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Event Schema (for BottleRock, etc.)
export const EventSchema = ({ 
  name, 
  description, 
  startDate, 
  endDate, 
  location,
  image,
  url,
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": name,
    "description": description,
    "startDate": startDate,
    "endDate": endDate,
    "location": {
      "@type": "Place",
      "name": location?.name || "Napa Valley",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Napa",
        "addressRegion": "CA",
        "addressCountry": "US",
      },
    },
    "image": image || SEO_CONFIG.site.defaultImage,
    "url": url,
    "organizer": {
      "@type": "Organization",
      "name": SEO_CONFIG.business.name,
      "url": SEO_CONFIG.site.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Local Business + Hotel Room Schema
export const HotelRoomSchema = ({ rooms }) => {
  if (!rooms || rooms.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": SEO_CONFIG.business.name,
    "containsPlace": rooms.map(room => ({
      "@type": "HotelRoom",
      "name": room.name,
      "description": room.description,
      "bed": {
        "@type": "BedDetails",
        "typeOfBed": room.bedType || "King",
        "numberOfBeds": room.bedCount || 1,
      },
      "occupancy": {
        "@type": "QuantitativeValue",
        "value": room.maxOccupancy || 2,
      },
      "amenityFeature": room.amenities?.map(a => ({
        "@type": "LocationFeatureSpecification",
        "name": a,
        "value": true,
      })),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Review Schema (for individual reviews)
export const ReviewSchema = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${SEO_CONFIG.business.name} - Accommodation`,
    "brand": {
      "@type": "Brand",
      "name": SEO_CONFIG.business.name,
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author,
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
      },
      "reviewBody": review.text,
      "datePublished": review.date,
    })),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": SEO_CONFIG.business.rating.value,
      "reviewCount": SEO_CONFIG.business.rating.count,
      "bestRating": "5",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// How-To Schema (for guides)
export const HowToSchema = ({ 
  name, 
  description, 
  steps, 
  totalTime,
  image,
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "totalTime": totalTime,
    "image": image || SEO_CONFIG.site.defaultImage,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "image": step.image,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Place/LocalBusiness Schema for Location page
export const PlaceSchema = ({ nearbyPlaces }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": "Downtown Napa",
    "description": "The heart of Napa Valley wine country, featuring world-class restaurants, tasting rooms, and the famous Oxbow Public Market.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Napa",
      "addressRegion": "CA",
      "addressCountry": "US",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 38.2975,
      "longitude": -122.2869,
    },
    "containedInPlace": {
      "@type": "BedAndBreakfast",
      "name": SEO_CONFIG.business.name,
      "url": SEO_CONFIG.site.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Website Schema
export const WebsiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONFIG.site.name,
    "url": SEO_CONFIG.site.url,
    "description": SEO_CONFIG.business.description,
    "publisher": {
      "@type": "Organization",
      "name": SEO_CONFIG.business.name,
      "logo": {
        "@type": "ImageObject",
        "url": SEO_CONFIG.site.logo,
      },
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SEO_CONFIG.site.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default {
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
};
