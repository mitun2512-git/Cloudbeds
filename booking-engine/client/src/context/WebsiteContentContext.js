import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ============================================
// DEFAULT WEBSITE CONTENT
// This is the single source of truth for all website content
// ============================================

export const defaultContent = {
  // Global settings
  global: {
    siteName: 'Hennessey Estate',
    logo: '/logo-white.png',
    establishedText: 'EST. 1889',
    showEstablished: true,
    bookingUrl: 'https://us2.cloudbeds.com/en/reservation/N2eFbP?currency=usd',
    colors: {
      primary: '#3a4a3a',
      secondary: '#c5a36a',
      accent: '#c5a36a',
      background: '#f5f1e8',
      text: '#2d3a2d',
      white: '#ffffff',
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Lato', sans-serif",
    },
    contact: {
      phone: '',
      email: 'info@hennesseyestate.com',
      address: {
        name: 'Hennessey Estate',
        street: '1727 Main Street',
        city: 'Napa, CA 94559',
      },
    },
    social: {
      instagram: 'https://www.instagram.com/hennesseynapa',
      pinterest: 'https://www.pinterest.com/hennesseyestate/',
      tripadvisor: 'https://www.tripadvisor.com/Hotel_Review-g32766-d224801-Reviews-Hennessey_House_Bed_and_Breakfast-Napa_Napa_Valley_California.html',
    },
  },

  // Header/Navigation
  header: {
    visible: true,
    navLinks: [
      { label: 'Rooms', href: '#rooms' },
      { label: 'Reviews', href: '#reviews' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Full Estate Buyout', href: '#buyout' },
    ],
    bookButtonText: 'Stay Here',
    bookButtonLink: '/book',
  },

  // Hero Section
  hero: {
    visible: true,
    title: 'Where Every Stay',
    titleLine2: 'Becomes a',
    titleEmphasis: 'Story',
    subtitle: 'A Victorian estate, lovingly restored. A sparkling pool beneath the Napa sun. Chef-prepared breakfast in a room where 130-year-old tin ceilings still whisper stories. Three blocks from downtown—yet a world away.',
    ctaText: 'Book Your Escape →',
    ctaLink: '/book',
    backgroundVideo: '/hero-video.mp4',
    backgroundImage: '/images/pool-aerial.png',
    trustBadges: [
      { icon: '★★★★★', text: '5/5 Google · 97 Reviews' },
      { icon: '🏛️', text: 'Historic Places Registry' },
    ],
    quickFacts: [
      { label: 'From $233/night', sublabel: '10 Unique Rooms' },
      { label: 'Gourmet Breakfast Included', sublabel: 'Chef-prepared daily' },
      { label: '3 Blocks to Downtown', sublabel: 'Walk to restaurants' },
      { label: 'Full Buyouts Available', sublabel: 'Private events & celebrations' },
    ],
  },

  // Quick Info Bar
  quickInfo: {
    visible: false,
    items: [
      { icon: '✓', title: 'Free Cancellation', description: '5+ days before arrival' },
      { icon: '🍳', title: 'Breakfast Included', description: '8:00 AM - 9:30 AM daily' },
      { icon: '🅿️', title: 'Free Parking', description: 'On-site parking available' },
      { icon: '✉️', title: 'Questions?', description: 'info@hennesseyestate.com', isLink: true },
    ],
  },

  // Reviews Section
  reviews: {
    visible: true,
    rating: '5',
    ratingOutOf: '5',
    platform: 'Google',
    reviewCount: '97',
    reviewsLink: 'https://www.google.com/maps/place/Hennessey+House+Bed+and+Breakfast/@38.2981853,-122.2875591,17z/data=!4m8!3m7!1s0x8085080e6a5a7b95:0x5df9e05e2ed04a63!8m2!3d38.2981853!4d-122.2849842!9m1!1b1!16s%2Fg%2F1tkp6y8c',
    secondaryRating: '9.6',
    secondaryRatingOutOf: '10',
    secondaryPlatform: 'Booking.com',
    secondaryReviewCount: '36',
    items: [
      {
        text: '"How clean and comfortable the property was! Very close to downtown Napa. Loved the hot tub and sauna on the property."',
        author: 'Rachael',
        source: 'Google',
        rating: 5,
      },
      {
        text: '"Beautifully restored Victorian with rooms that nicely fused the historic with the modern. Hot delicious breakfast. Exceptional stay!"',
        author: 'Denise L.',
        source: 'Google',
        rating: 5,
      },
      {
        text: '"Amazing old Napa charm combined with super modern rooms. Cozy beds, great lighting, and big walk-in showers. The pool was perfect."',
        author: 'Michael T.',
        source: 'Google',
        rating: 5,
      },
      {
        text: '"Perfectly located near downtown Napa, with spacious, comfortable rooms in a peaceful neighborhood. Breakfast was wonderful!"',
        author: 'Helen S.',
        source: 'Google',
        rating: 5,
      },
      {
        text: '"The staff was so gracious and accommodating. The chef and her breakfast were awesome... we will definitely be back!"',
        author: 'Sughayar K.',
        source: 'Google',
        rating: 5,
      },
      {
        text: '"Our stay was incredible. The service was exceptional, staff warm and attentive, and the location couldn\'t be more ideal."',
        author: 'James D.',
        source: 'Google',
        rating: 5,
      },
      {
        text: '"It was nicer than the pictures! Exceptional service and so clean. The staff made us feel like family from the moment we arrived."',
        author: 'Nicole',
        source: 'Booking.com',
        rating: 10,
      },
      {
        text: '"Amazing staff, comfortable room, keyless entry was nice. Pool, jacuzzi, sauna were nice too. Breakfast was absolutely delicious."',
        author: 'Thibault',
        source: 'Booking.com',
        rating: 10,
      },
    ],
  },

  // Rooms Section
  rooms: {
    visible: true,
    title: 'Ten Rooms',
    subtitle: 'A Thousand Stories',
    description: 'Each of our ten guest rooms tells its own story. Original Victorian architecture preserved with painstaking care. California King beds dressed in curated luxury linens. Walk-in showers with Molton Brown amenities. High ceilings that breathe. Windows that frame the gardens. This is where historic charm meets contemporary comfort—where you\'ll sleep surrounded by the stories of those who came before.',
    features: [
      'En-suite bathroom with walk-in shower',
      'Molton Brown amenities',
      'Luxury bedding',
      'High-speed WiFi',
      'Pool, spa & sauna access',
      'Chef\'s breakfast included',
    ],
    priceFrom: '$233',
    pricePeak: '$530',
    ctaText: 'View Rooms & Availability →',
    image: '/images/room-couple.png',
  },

  // Buyout/Private Events Section
  buyout: {
    visible: true,
    badge: 'PRIVATE EVENTS & CELEBRATIONS',
    title: 'The Entire Estate',
    subtitle: 'Your Private Victorian Retreat in Napa Valley',
    lead: 'Some celebrations deserve more than a table for twelve. They deserve an entire Victorian estate.',
    features: [
      { icon: 'tub', title: 'All 10 Ensuite Rooms', description: 'Private bathrooms for every group' },
      { icon: 'wave', title: 'Private Pool & Gardens', description: 'Your exclusive outdoor sanctuary' },
      { icon: 'wine', title: 'Exclusive Tasting Room', description: 'Private dining & wine experiences' },
      { icon: 'tv', title: 'Corporate Ready', description: 'Meeting space with 55" presentation TV' },
      { icon: 'egg', title: 'Private Chef Available', description: 'Custom dinners & packed lunches' },
      { icon: 'celebration', title: 'Perfect for Celebrations', description: 'Milestones, reunions & retreats' },
    ],
    description: 'Book all 10 rooms for your milestone birthday, your reunion of college friends, or your team offsite that actually inspires. Transform our historic dining room into your private meeting space—complete with a 55" TV for presentations. We\'ll pack lunches for your vineyard excursions and arrange private chef dinners under the stars. The pool becomes your private club. The gardens, your backdrop for photos you\'ll treasure forever.',
    ctaText: 'Experience The Full Estate →',
    backgroundImage: 'https://static.wixstatic.com/media/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg',
  },

  // Content Sections (Pool, Tasting Room, Breakfast, Sauna)
  contentSections: {
    pool: {
      visible: true,
      title: 'Outdoor Oasis',
      subtitle: 'Where Afternoons Unfold',
      paragraphs: [
        'Return from a morning of wine tasting. The afternoon sun dances on crystal-clear water. Slip into the heated pool—your private sanctuary. The spa jets melt away the day\'s miles.',
        'A peaceful sanctuary for quiet afternoons that becomes your exclusive open-air venue for sunset cocktails and social gatherings under the stars.',
      ],
      ctaText: 'Reserve Your Stay',
      image: '/images/pool-group.png',
      imagePosition: 'right',
      theme: 'cream',
    },
    tastingRoom: {
      visible: true,
      title: 'The Tasting Room',
      subtitle: 'Where History Comes Alive',
      paragraphs: [
        'Look up. That original 19th-century tin ceiling has witnessed over 130 years of Napa stories. Built for Dr. Edwin Hennessey—the county\'s first physician and namesake of Lake Hennessey— this room now hosts a different kind of gathering.',
        'When the estate is yours, this historic space transforms into a sophisticated private hall for executive meetings or intimate candlelit dinners.',
      ],
      ctaText: 'Experience the Estate',
      image: '/images/dinner-party.png',
      imagePosition: 'left',
      theme: 'green',
    },
    breakfast: {
      visible: true,
      title: 'Morning at Hennessey',
      subtitle: 'Chef-Prepared. Locally Sourced.',
      paragraphs: [
        'The aroma of fresh coffee finds you before your alarm does. In the sunlit tasting room, our chef has been busy—seasonal fruits from local farms, warm pastries baked this morning, and made-to-order plates that fuel your day of discovery.',
        'Linger over a second cup. Compare notes on yesterday\'s favorite winery. Plan today\'s adventure with fellow travelers who\'ve quickly become friends. Breakfast is included. The memories are complimentary.',
      ],
      ctaText: 'Wake Up Here',
      image: '/images/breakfast-tasting-room.png',
      imagePosition: 'right',
      theme: 'cream',
    },
    sauna: {
      visible: true,
      title: 'The Sauna',
      subtitle: 'Warmth That Restores',
      paragraphs: [
        'After miles of vineyard views and flights of world-class wine, your body deserves this. Step into our traditional sauna and let the dry heat work its magic—releasing tension, clearing your mind, preparing you for whatever the evening holds.',
        'A dip in the pool afterward? A glass of wine on the veranda? The choice is yours. The restoration is guaranteed.',
      ],
      ctaText: 'Find Your Retreat',
      image: 'https://static.wixstatic.com/media/11062b_23621c0138f7461c916bbecc57c519af~mv2.jpeg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/11062b_23621c0138f7461c916bbecc57c519af~mv2.jpeg',
      imagePosition: 'left',
      theme: 'green',
    },
  },

  // Amenities Section
  amenities: {
    visible: true,
    title: 'Every Stay Includes',
    items: [
      { icon: 'pool', label: 'Heated Pool & Spa' },
      { icon: 'sauna', label: 'Traditional Sauna' },
      { icon: 'breakfast', label: 'Chef-Prepared Breakfast' },
      { icon: 'wine', label: 'Welcome Drink' },
      { icon: 'historic', label: 'Historic Tasting Room' },
      { icon: 'amenities', label: 'Molton Brown Amenities' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'wifi', label: 'High-Speed WiFi' },
      { icon: 'concierge', label: 'Concierge Service' },
      { icon: 'location', label: 'Downtown in 3 Blocks' },
    ],
  },

  // Gallery Section - All images from hennesseyestate.com/gallery
  gallery: {
    visible: true,
    title: 'Gallery',
    subtitle: 'Explore the luxury of Hennessey Estate and create timeless memories in Napa Valley',
    categories: [
      {
        name: 'The Estate',
        images: [
          { src: 'https://static.wixstatic.com/media/ebc938_69798aba533044e59b18d3be394b79ce~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_69798aba533044e59b18d3be394b79ce~mv2.jpg', alt: 'Historic Victorian Estate' },
          { src: 'https://static.wixstatic.com/media/ebc938_329840d85e3a4d57849fa2b9b6ad7273~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_329840d85e3a4d57849fa2b9b6ad7273~mv2.jpg', alt: 'Estate Gardens' },
          { src: 'https://static.wixstatic.com/media/ebc938_ecef8018884249079d23feb1c60de2eb~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_ecef8018884249079d23feb1c60de2eb~mv2.jpg', alt: 'Estate Sunset View' },
          { src: 'https://static.wixstatic.com/media/ebc938_e152ffeda2144b28bbc4a67799d7298c~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_e152ffeda2144b28bbc4a67799d7298c~mv2.jpg', alt: 'Victorian Architecture' },
          { src: 'https://static.wixstatic.com/media/ebc938_0810d974346746da9a039b775aeb0c27~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_0810d974346746da9a039b775aeb0c27~mv2.jpg', alt: 'Estate Entrance' },
          { src: 'https://static.wixstatic.com/media/ebc938_f2c49ce1ffba440cbccebdd080c7870d~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_f2c49ce1ffba440cbccebdd080c7870d~mv2.jpg', alt: 'Property Grounds' },
          { src: 'https://static.wixstatic.com/media/ebc938_5c519550a921474dbf77307e4f3304fd~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_5c519550a921474dbf77307e4f3304fd~mv2.jpg', alt: 'Estate Exterior View' },
          { src: 'https://static.wixstatic.com/media/ebc938_f8176e6525c749b6ab416473d7263604~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_f8176e6525c749b6ab416473d7263604~mv2.jpg', alt: 'Garden Pathway' },
          { src: 'https://static.wixstatic.com/media/ebc938_393b638fdb394d52bfb91ed5679c360d~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_393b638fdb394d52bfb91ed5679c360d~mv2.jpg', alt: 'Historic Property' },
        ],
      },
      {
        name: 'The Rooms',
        images: [
          { src: 'https://static.wixstatic.com/media/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg', alt: 'Luxury Guest Room' },
          { src: 'https://static.wixstatic.com/media/ebc938_5fc5e940263e4844ab93987f65a398a0~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_5fc5e940263e4844ab93987f65a398a0~mv2.jpg', alt: 'Victorian Bedroom' },
          { src: 'https://static.wixstatic.com/media/ebc938_3436ff8f3f1d47e5abaf58cafb1f416c~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_3436ff8f3f1d47e5abaf58cafb1f416c~mv2.jpg', alt: 'Cozy Room Interior' },
          { src: 'https://static.wixstatic.com/media/ebc938_ff0a5c2a981840e6a6d4838d7a96010e~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_ff0a5c2a981840e6a6d4838d7a96010e~mv2.jpg', alt: 'Elegant Suite' },
          { src: 'https://static.wixstatic.com/media/ebc938_da84154e75294e2aa255d3cbfc9a58d6~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_da84154e75294e2aa255d3cbfc9a58d6~mv2.jpg', alt: 'Classic Room' },
          { src: 'https://static.wixstatic.com/media/ebc938_00b3bb900ae24e1dacd8c5e64751b0ae~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_00b3bb900ae24e1dacd8c5e64751b0ae~mv2.jpg', alt: 'Bedroom Details' },
          { src: 'https://static.wixstatic.com/media/ebc938_6498db66f6054b83b68b093c618614d4~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_6498db66f6054b83b68b093c618614d4~mv2.jpg', alt: 'Room Amenities' },
          { src: 'https://static.wixstatic.com/media/ebc938_12f6af792c45402baf9dccb7f59d356a~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_12f6af792c45402baf9dccb7f59d356a~mv2.jpg', alt: 'Guest Quarters' },
          { src: 'https://static.wixstatic.com/media/ebc938_b508932f8fc44eb5a1781802a0f21778~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_b508932f8fc44eb5a1781802a0f21778~mv2.jpg', alt: 'Luxury Bathroom' },
          { src: 'https://static.wixstatic.com/media/ebc938_eadab940a3fd413f95abaea54471d652~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_eadab940a3fd413f95abaea54471d652~mv2.jpg', alt: 'Room View' },
          { src: 'https://static.wixstatic.com/media/ebc938_3161f50827ee4180a78b16ce05924862~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_3161f50827ee4180a78b16ce05924862~mv2.jpg', alt: 'Charming Bedroom' },
          { src: 'https://static.wixstatic.com/media/ebc938_5ee02951786546ca9aaf5e95d0d5274d~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_5ee02951786546ca9aaf5e95d0d5274d~mv2.jpg', alt: 'Period Furnishings' },
          { src: 'https://static.wixstatic.com/media/ebc938_3664aca7a496447d9d6eef035cbcdda6~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_3664aca7a496447d9d6eef035cbcdda6~mv2.jpg', alt: 'Antique Decor' },
          { src: 'https://static.wixstatic.com/media/ebc938_f07f99c8c5444142b92914ae29c9bc40~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_f07f99c8c5444142b92914ae29c9bc40~mv2.jpg', alt: 'Comfortable Suite' },
          { src: 'https://static.wixstatic.com/media/ebc938_cfc00ffc7f2b4f97a034490d89bce569~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_cfc00ffc7f2b4f97a034490d89bce569~mv2.jpg', alt: 'Ensuite Bathroom' },
          { src: 'https://static.wixstatic.com/media/ebc938_a9e9dc613ebc4ee6b2b85a0af1b8e5dc~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_a9e9dc613ebc4ee6b2b85a0af1b8e5dc~mv2.jpg', alt: 'Premium Room' },
        ],
      },
      {
        name: 'Common Areas',
        images: [
          { src: 'https://static.wixstatic.com/media/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg', alt: 'Tasting Room' },
          { src: 'https://static.wixstatic.com/media/ebc938_0a9b75d4b374429ca043887408e484cd~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_0a9b75d4b374429ca043887408e484cd~mv2.jpg', alt: 'Dining Area' },
          { src: 'https://static.wixstatic.com/media/ebc938_8a4a89186e7846fb9970e7e70df1bb1d~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_8a4a89186e7846fb9970e7e70df1bb1d~mv2.jpg', alt: 'Pool Area' },
          { src: 'https://static.wixstatic.com/media/ebc938_35bdf0c1410248f5b29018b79ca0bc56~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_35bdf0c1410248f5b29018b79ca0bc56~mv2.jpg', alt: 'Outdoor Seating' },
          { src: 'https://static.wixstatic.com/media/ebc938_f84aae1604f849379ab4695bd8b693bb~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_f84aae1604f849379ab4695bd8b693bb~mv2.jpg', alt: 'Garden Lounge' },
          { src: 'https://static.wixstatic.com/media/ebc938_132d9fabbeb34b2789f18eb6a751be01~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_132d9fabbeb34b2789f18eb6a751be01~mv2.jpg', alt: 'Traditional Sauna' },
          { src: 'https://static.wixstatic.com/media/ebc938_463b5d97c6174ff3aeb093dc0e1850ad~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_463b5d97c6174ff3aeb093dc0e1850ad~mv2.jpg', alt: 'Hot Tub' },
          { src: 'https://static.wixstatic.com/media/ebc938_f3de2b001f9244aead46818516102e33~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_f3de2b001f9244aead46818516102e33~mv2.jpg', alt: 'Breakfast Area' },
          { src: 'https://static.wixstatic.com/media/ebc938_4cfc1ece4a7a4c08891eb418c97d46bb~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_4cfc1ece4a7a4c08891eb418c97d46bb~mv2.jpg', alt: 'Living Room' },
          { src: 'https://static.wixstatic.com/media/ebc938_6bc59e4d3da647ac97218389adbc1a1d~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_6bc59e4d3da647ac97218389adbc1a1d~mv2.jpg', alt: 'Historic Parlor' },
          { src: 'https://static.wixstatic.com/media/ebc938_26c3174641fc4a84a82086aca6b899e1~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_26c3174641fc4a84a82086aca6b899e1~mv2.jpg', alt: 'Veranda' },
          { src: 'https://static.wixstatic.com/media/ebc938_bda94e3c66a34547bf47e0fe6e1ede84~mv2.jpg/v1/fill/w_2560,h_1707,q_90,enc_avif,quality_auto/ebc938_bda94e3c66a34547bf47e0fe6e1ede84~mv2.jpg', alt: 'Patio Area' },
        ],
      },
    ],
  },

  // Location Section
  location: {
    visible: true,
    title: 'Downtown Napa',
    subtitle: 'Three Blocks. Infinite Possibilities.',
    paragraphs: [
      'Step through our gate and you\'re in a Victorian garden retreat. Walk three blocks and you\'re at the heart of Napa\'s renaissance—Michelin-starred restaurants, boutique tasting rooms, the Oxbow Market, and the Napa Valley Wine Train.',
      'Close enough to walk to dinner. Quiet enough to hear the birds at breakfast.',
      'This is the balance wine country was made for.',
    ],
    ctaText: 'Discover Your Location',
  },

  // Newsletter Section
  newsletter: {
    visible: true,
    title: 'Join the Hennessey Circle',
    subtitle: 'Be first to hear about seasonal offers, last-minute availability, and insider tips for your Napa adventure.',
    placeholder: 'Your email address',
    buttonText: 'Subscribe →',
    disclaimer: 'We respect your inbox. Unsubscribe anytime.',
  },

  // Footer
  footer: {
    visible: true,
    tagline: 'Step into a piece of Napa\'s past. Refined for today.',
    rating: '★★★★★ 5/5 on Google · 97 Reviews',
    historic: 'Listed on the National Register of Historic Places · Est. 1889',
    copyright: '© 2026 Hennessey Estate. All rights reserved.',
  },
};

// ============================================
// CONTEXT CREATION
// ============================================

const WebsiteContentContext = createContext(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const WebsiteContentProvider = ({ children }) => {
  const [content, setContent] = useState(defaultContent);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load content from localStorage on mount
  useEffect(() => {
    // Clear old cache versions to force fresh content
    localStorage.removeItem('hennessey_website_content');
    localStorage.removeItem('hennessey_website_content_v1');
    localStorage.removeItem('hennessey_website_content_v2');
    localStorage.removeItem('hennessey_website_content_v3');
    localStorage.removeItem('hennessey_website_content_v4');
    
    // Always start fresh with defaults (don't load cached)
    // This ensures all browsers get the latest content updates
    setContent(defaultContent);
    setIsLoaded(true);
  }, []);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hennessey_website_content_v5', JSON.stringify(content));
    }
  }, [content, isLoaded]);

  // Update a specific section
  const updateSection = useCallback((sectionKey, newData) => {
    setContent(prev => ({
      ...prev,
      [sectionKey]: typeof newData === 'function' ? newData(prev[sectionKey]) : newData,
    }));
  }, []);

  // Update nested content (e.g., 'hero.title')
  const updateContent = useCallback((path, value) => {
    setContent(prev => {
      const newContent = { ...prev };
      const keys = path.split('.');
      let current = newContent;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newContent;
    });
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setContent(defaultContent);
    localStorage.removeItem('hennessey_website_content_v5');
  }, []);

  // Export current content
  const exportContent = useCallback(() => {
    return JSON.stringify(content, null, 2);
  }, [content]);

  // Import content
  const importContent = useCallback((jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      setContent(deepMerge(defaultContent, imported));
      return true;
    } catch (e) {
      console.error('Error importing content:', e);
      return false;
    }
  }, []);

  const value = {
    content,
    setContent,
    updateSection,
    updateContent,
    resetToDefaults,
    exportContent,
    importContent,
    isLoaded,
  };

  return (
    <WebsiteContentContext.Provider value={value}>
      {children}
    </WebsiteContentContext.Provider>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================

export const useWebsiteContent = () => {
  const context = useContext(WebsiteContentContext);
  if (!context) {
    throw new Error('useWebsiteContent must be used within a WebsiteContentProvider');
  }
  return context;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Deep merge utility
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export default WebsiteContentContext;

