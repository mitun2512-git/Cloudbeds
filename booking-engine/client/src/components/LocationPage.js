/**
 * Location Page - SEO-optimized downtown Napa location guide
 * Target keywords: downtown napa hotel, walkable napa accommodation, near oxbow market
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta, BreadcrumbSchema, PlaceSchema } from '../seo';
import './LocationPage.css';

// Nearby attractions data
const nearbyAttractions = [
  {
    category: 'Wine Tasting',
    icon: '🍷',
    places: [
      { name: 'Downtown Napa Tasting Collective', distance: '3 min walk', description: '15+ wineries under one roof' },
      { name: 'CIA at Copia', distance: '8 min walk', description: 'Culinary Institute of America campus' },
      { name: 'Oxbow Public Market', distance: '6 min walk', description: 'Wine bars & local tastings' },
      { name: 'First Street Napa', distance: '5 min walk', description: 'Boutique tasting rooms' },
    ],
  },
  {
    category: 'Restaurants',
    icon: '🍽️',
    places: [
      { name: 'Angèle Restaurant', distance: '4 min walk', description: 'French riverside dining' },
      { name: 'Morimoto Napa', distance: '8 min walk', description: 'Celebrity chef Japanese' },
      { name: 'Cole\'s Chop House', distance: '5 min walk', description: 'Classic steakhouse' },
      { name: 'Tarla Mediterranean Grill', distance: '6 min walk', description: 'Mediterranean cuisine' },
      { name: 'Gran Eléctrica', distance: '7 min walk', description: 'Mexican street food' },
      { name: 'Torc', distance: '5 min walk', description: 'Farm-to-table fine dining' },
    ],
  },
  {
    category: 'Attractions',
    icon: '🎭',
    places: [
      { name: 'Napa Valley Wine Train', distance: '10 min walk', description: 'Scenic wine country tour' },
      { name: 'Napa River Trail', distance: '3 min walk', description: 'Walking & cycling path' },
      { name: 'Napa Valley Opera House', distance: '6 min walk', description: 'Live performances & events' },
      { name: 'Veterans Memorial Park', distance: '8 min walk', description: 'Riverside park & recreation' },
    ],
  },
  {
    category: 'Shopping',
    icon: '🛍️',
    places: [
      { name: 'First Street Napa', distance: '5 min walk', description: 'Boutiques & galleries' },
      { name: 'Oxbow Public Market', distance: '6 min walk', description: 'Artisan goods & food' },
      { name: 'Downtown Napa Antiques', distance: '4 min walk', description: 'Vintage finds' },
    ],
  },
];

// Getting here info
const gettingHere = [
  {
    method: 'From San Francisco',
    icon: '🚗',
    details: '1 hour drive via Highway 29. Free parking at the estate.',
  },
  {
    method: 'From Sacramento',
    icon: '🚗',
    details: '1 hour drive via I-80. Easy access from downtown.',
  },
  {
    method: 'From Oakland Airport',
    icon: '✈️',
    details: '45 minutes. Shuttle services available.',
  },
  {
    method: 'From SFO Airport',
    icon: '✈️',
    details: '1 hour 15 minutes. Consider Evans Transportation.',
  },
];

const LocationPage = () => {
  // Set page meta tags
  usePageMeta({
    pageKey: 'location',
    path: '/location',
  });

  // Breadcrumb data
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Location', path: '/location' },
  ];

  return (
    <div className="location-page">
      {/* Schema Markup */}
      <BreadcrumbSchema items={breadcrumbs} />
      <PlaceSchema />

      {/* Hero Section */}
      <section className="location-hero">
        <div className="location-hero-overlay"></div>
        <div className="location-hero-content">
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
          <h1>Prime Downtown Napa Location</h1>
          <p className="hero-subtitle">Three Blocks. Infinite Possibilities.</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="location-content">
        {/* Introduction */}
        <section className="location-intro">
          <div className="intro-text">
            <h2>Walk to Everything in Wine Country</h2>
            <p>
              Step through our gate and you're in a Victorian garden retreat. Walk three blocks 
              and you're at the heart of Napa's renaissance—Michelin-starred restaurants, boutique 
              tasting rooms, the Oxbow Market, and the Napa Valley Wine Train.
            </p>
            <p className="highlight">
              <strong>Close enough to walk to dinner. Quiet enough to hear the birds at breakfast.</strong>
            </p>
            <p>
              This is the balance wine country was made for. Unlike properties in the countryside 
              that require driving everywhere, Hennessey Estate puts you at the center of it all 
              while maintaining the peaceful ambiance of a private estate.
            </p>
          </div>
          <div className="location-map">
            <iframe
              title="Hennessey Estate Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3123.5!2d-122.287!3d38.298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDE3JzUzLjUiTiAxMjLCsDE3JzEzLjEiVw!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="address-card">
              <h3>📍 Hennessey Estate</h3>
              <p>1727 Main Street<br />Napa, CA 94559</p>
              <a 
                href="https://www.google.com/maps/dir//Hennessey+House+Bed+and+Breakfast,+1727+Main+St,+Napa,+CA+94559" 
                target="_blank" 
                rel="noopener noreferrer"
                className="directions-btn"
              >
                Get Directions →
              </a>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="location-stats">
          <div className="stat">
            <span className="stat-number">3</span>
            <span className="stat-label">Blocks to Downtown</span>
          </div>
          <div className="stat">
            <span className="stat-number">5</span>
            <span className="stat-label">Min Walk to Restaurants</span>
          </div>
          <div className="stat">
            <span className="stat-number">50+</span>
            <span className="stat-label">Walkable Venues</span>
          </div>
          <div className="stat">
            <span className="stat-number">Free</span>
            <span className="stat-label">On-Site Parking</span>
          </div>
        </section>

        {/* Nearby Attractions */}
        <section className="nearby-section">
          <h2>What's Nearby</h2>
          <p className="section-intro">
            Everything you need for the perfect Napa experience is within a short walk.
          </p>
          
          <div className="attractions-grid">
            {nearbyAttractions.map((category, i) => (
              <div key={i} className="attraction-category">
                <h3>
                  <span className="category-icon">{category.icon}</span>
                  {category.category}
                </h3>
                <ul>
                  {category.places.map((place, j) => (
                    <li key={j}>
                      <div className="place-header">
                        <strong>{place.name}</strong>
                        <span className="distance">{place.distance}</span>
                      </div>
                      <p>{place.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Getting Here */}
        <section className="getting-here">
          <h2>Getting Here</h2>
          <div className="transport-grid">
            {gettingHere.map((method, i) => (
              <div key={i} className="transport-card">
                <span className="transport-icon">{method.icon}</span>
                <h3>{method.method}</h3>
                <p>{method.details}</p>
              </div>
            ))}
          </div>
          <div className="parking-note">
            <h3>🅿️ Free Parking</h3>
            <p>
              Complimentary on-site parking is available for all guests. No need to worry 
              about downtown parking meters or garages—leave your car at the estate and 
              walk everywhere.
            </p>
          </div>
        </section>

        {/* Insider Tips */}
        <section className="insider-tips">
          <h2>Insider Tips from Our Concierge</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h3>🌅 Morning Ritual</h3>
              <p>
                Start with our chef-prepared breakfast, then take a morning walk along 
                the Napa River Trail before the tasting rooms open at 10 AM.
              </p>
            </div>
            <div className="tip-card">
              <h3>🍷 Tasting Strategy</h3>
              <p>
                Book 2-3 tastings per day max. Start at the downtown collective, then 
                venture to Silverado Trail or Stags Leap in the afternoon.
              </p>
            </div>
            <div className="tip-card">
              <h3>🌙 Evening Plans</h3>
              <p>
                Make dinner reservations early—especially for Angèle and Morimoto. After 
                dinner, walk back to the estate for a nightcap by the pool.
              </p>
            </div>
            <div className="tip-card">
              <h3>📅 Timing Tips</h3>
              <p>
                Weekdays are quieter at tasting rooms. Oxbow Market is best in the morning. 
                Book wine train at least 2 weeks ahead.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="location-cta">
          <h2>Experience the Best of Downtown Napa</h2>
          <p>
            Wake up to chef-prepared breakfast, walk to world-class restaurants, 
            and return to your private oasis with pool and spa.
          </p>
          <div className="cta-buttons">
            <Link to="/book" className="cta-primary">Book Your Stay →</Link>
            <Link to="/rooms" className="cta-secondary">View Our Rooms</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="location-footer">
        <div className="footer-content">
          <p>Hennessey Estate • 1727 Main Street, Napa, CA 94559</p>
          <nav className="footer-nav">
            <Link to="/">Home</Link>
            <Link to="/rooms">Rooms</Link>
            <Link to="/amenities">Amenities</Link>
            <Link to="/about">About</Link>
            <Link to="/book">Book</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LocationPage;
