/**
 * Amenities Page - SEO-optimized detailed amenities
 * Target keywords: napa hotel with pool, b&b pool spa, sauna napa valley
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta, BreadcrumbSchema } from '../seo';
import './AmenitiesPage.css';

// Detailed amenities data
const amenitiesData = [
  {
    id: 'pool',
    title: 'Heated Pool & Spa',
    subtitle: 'Your Private Oasis',
    description: 'Return from a day of wine tasting to find the afternoon sun dancing on crystal-clear water. Slip into the heated pool or let the spa jets melt away the day. As evening falls, the garden lights flicker on—and the wine country sky puts on its nightly show.',
    features: [
      'Heated year-round',
      'Open 8:00 AM - 10:00 PM',
      'Pool towels provided',
      'Surrounded by Victorian gardens',
      'Perfect for post-tasting relaxation',
    ],
    image: 'https://static.wixstatic.com/media/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_90,enc_avif,quality_auto/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg',
    icon: '🏊',
  },
  {
    id: 'sauna',
    title: 'Traditional Finnish Sauna',
    subtitle: 'Warmth That Restores',
    description: 'After miles of vineyard views and flights of world-class wine, your body deserves this. Step into our traditional sauna and let the dry heat work its magic—releasing tension, clearing your mind, preparing you for whatever the evening holds.',
    features: [
      'Traditional dry heat sauna',
      'Available 7:00 AM - 10:00 PM',
      'Located near the pool',
      'Perfect post-wine tasting recovery',
      'Complimentary for all guests',
    ],
    image: 'https://static.wixstatic.com/media/11062b_23621c0138f7461c916bbecc57c519af~mv2.jpeg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/11062b_23621c0138f7461c916bbecc57c519af~mv2.jpeg',
    icon: '🧖',
  },
  {
    id: 'breakfast',
    title: 'Chef-Prepared Breakfast',
    subtitle: 'Morning at Hennessey',
    description: 'The aroma of fresh coffee finds you before your alarm does. In the sunlit tasting room, our chef has been busy—seasonal fruits, warm pastries, and made-to-order plates that fuel your day of discovery.',
    features: [
      'Served 8:30 AM - 10:00 AM daily',
      'Locally sourced ingredients',
      'Hot entrées made to order',
      'Fresh pastries and fruits',
      'Dietary restrictions accommodated',
      'Served in the historic tasting room',
    ],
    image: 'https://static.wixstatic.com/media/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg',
    icon: '🍳',
  },
  {
    id: 'tasting-room',
    title: 'Historic Tasting Room',
    subtitle: 'Where History Comes Alive',
    description: 'Look up. That original 19th-century tin ceiling has witnessed over 130 years of Napa stories. Built for Dr. Edwin Hennessey—the county\'s first physician—this room now hosts a different kind of gathering. Each morning, breakfast. Each evening, wine and conversation.',
    features: [
      'Original 1889 tin ceilings',
      'Breakfast served daily',
      'Evening wine hour',
      'Listed on National Historic Register',
      'Elegant gathering space',
    ],
    image: 'https://static.wixstatic.com/media/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_90,enc_avif,quality_auto/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg',
    icon: '🏛️',
  },
];

// Room amenities
const roomAmenities = [
  { icon: '🛏️', title: 'Luxury Bedding', description: 'Premium linens and pillows' },
  { icon: '🚿', title: 'Private En-Suite', description: 'Walk-in showers, some with tubs' },
  { icon: '🧴', title: 'Molton Brown', description: 'Premium bath amenities' },
  { icon: '❄️', title: 'Climate Control', description: 'Individual AC and heating' },
  { icon: '📶', title: 'High-Speed WiFi', description: 'Throughout the property' },
  { icon: '🅿️', title: 'Free Parking', description: 'On-site parking included' },
  { icon: '👘', title: 'Robes & Slippers', description: 'For your comfort' },
  { icon: '💇', title: 'Hair Dryer', description: 'In every bathroom' },
  { icon: '☕', title: 'Coffee & Tea', description: 'In-room amenities' },
  { icon: '🔒', title: 'In-Room Safe', description: 'Secure storage' },
  { icon: '📺', title: 'Smart TV', description: 'Streaming services' },
  { icon: '🔌', title: 'USB Charging', description: 'Bedside ports' },
];

// Services
const services = [
  { icon: '🍷', title: 'Evening Wine Hour', description: 'Complimentary wine and conversation each evening in the tasting room.' },
  { icon: '🎫', title: 'Concierge Service', description: 'Restaurant reservations, wine tour bookings, and local recommendations.' },
  { icon: '📰', title: 'Morning Newspaper', description: 'Delivered to your door each morning.' },
  { icon: '🧹', title: 'Daily Housekeeping', description: 'Fresh towels and room tidying.' },
];

const AmenitiesPage = () => {
  // Set page meta tags
  usePageMeta({
    pageKey: 'amenities',
    path: '/amenities',
  });

  // Breadcrumb data
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Amenities', path: '/amenities' },
  ];

  return (
    <div className="amenities-page">
      {/* Schema Markup */}
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Hero Section */}
      <section className="amenities-hero">
        <div className="amenities-hero-overlay"></div>
        <div className="amenities-hero-content">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((item, i) => (
              <span key={i}>
                {i > 0 && <span className="separator">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className="current">{item.name}</span>
                ) : (
                  <Link to={item.path}>{item.name}</Link>
                )}
              </span>
            ))}
          </nav>
          <h1>Amenities at Hennessey Estate</h1>
          <p className="hero-subtitle">Every detail designed for your perfect stay</p>
        </div>
      </section>

      {/* Quick Links */}
      <nav className="amenities-quick-links">
        <div className="quick-links-container">
          {amenitiesData.map((amenity) => (
            <a key={amenity.id} href={`#${amenity.id}`} className="quick-link">
              <span className="quick-link-icon">{amenity.icon}</span>
              <span>{amenity.title.split(' ')[0]}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="amenities-content">
        {/* Featured Amenities */}
        {amenitiesData.map((amenity, index) => (
          <section 
            key={amenity.id} 
            id={amenity.id}
            className={`amenity-section ${index % 2 === 1 ? 'reverse' : ''}`}
          >
            <div className="amenity-image">
              <img 
                src={amenity.image} 
                alt={amenity.title}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            </div>
            <div className="amenity-content">
              <span className="amenity-icon">{amenity.icon}</span>
              <h2>{amenity.title}</h2>
              <h3>{amenity.subtitle}</h3>
              <p>{amenity.description}</p>
              <ul className="amenity-features">
                {amenity.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        {/* Room Amenities Grid */}
        <section className="room-amenities-section">
          <h2>Every Room Includes</h2>
          <p className="section-intro">
            All 10 of our uniquely appointed guest rooms feature these modern comforts 
            while maintaining Victorian charm.
          </p>
          <div className="room-amenities-grid">
            {roomAmenities.map((amenity, i) => (
              <div key={i} className="room-amenity">
                <span className="room-amenity-icon">{amenity.icon}</span>
                <div>
                  <strong>{amenity.title}</strong>
                  <span>{amenity.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="services-section">
          <h2>Services & Extras</h2>
          <div className="services-grid">
            {services.map((service, i) => (
              <div key={i} className="service-card">
                <span className="service-icon">{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What Sets Us Apart */}
        <section className="unique-section">
          <h2>What Sets Us Apart</h2>
          <div className="unique-grid">
            <div className="unique-item">
              <div className="unique-stat">Only</div>
              <div className="unique-label">Downtown Napa B&B with Pool, Spa & Sauna</div>
            </div>
            <div className="unique-item">
              <div className="unique-stat">3 Blocks</div>
              <div className="unique-label">Walk to 50+ Restaurants & Tasting Rooms</div>
            </div>
            <div className="unique-item">
              <div className="unique-stat">Since 1889</div>
              <div className="unique-label">National Register of Historic Places</div>
            </div>
            <div className="unique-item">
              <div className="unique-stat">10 Rooms</div>
              <div className="unique-label">Full Property Buyout Available</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="amenities-cta">
          <h2>Experience All This & More</h2>
          <p>
            From the heated pool to chef-prepared breakfast, every amenity at Hennessey 
            Estate is designed to make your Napa Valley experience unforgettable.
          </p>
          <div className="cta-buttons">
            <Link to="/book" className="cta-primary">Book Your Stay →</Link>
            <Link to="/rooms" className="cta-secondary">View Our Rooms</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="amenities-footer">
        <div className="footer-content">
          <p>Hennessey Estate • 1727 Main Street, Napa, CA 94559</p>
          <nav className="footer-nav">
            <Link to="/">Home</Link>
            <Link to="/rooms">Rooms</Link>
            <Link to="/about">About</Link>
            <Link to="/location">Location</Link>
            <Link to="/book">Book</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default AmenitiesPage;
