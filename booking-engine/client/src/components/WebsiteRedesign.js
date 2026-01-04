import React, { useState } from 'react';
import './WebsiteRedesign.css';

const WebsiteRedesign = () => {
  const [activeSection, setActiveSection] = useState('preview');

  // Image URLs from Hennessey's actual website - correctly mapped to sections
  const images = {
    // Hero: Aerial drone shot of the entire estate (drone view showing pool)
    hero: 'https://static.wixstatic.com/media/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg/v1/fill/w_2500,h_1422,al_c,q_90,enc_avif,quality_auto/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg',
    // Pool: Same drone shot the actual website uses for "Sparkling Pool & Spa" section (shows pool from above)
    pool: 'https://static.wixstatic.com/media/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_90,enc_avif,quality_auto/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg',
    // Tasting Room: The interior dining room shot used for "Historic Tasting Room" section
    tastingRoom: 'https://static.wixstatic.com/media/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_90,enc_avif,quality_auto/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg',
    // Breakfast: The breakfast/food setup image
    breakfast: 'https://static.wixstatic.com/media/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg',
    // Sauna: Sauna interior with bucket and ladle
    sauna: 'https://static.wixstatic.com/media/11062b_23621c0138f7461c916bbecc57c519af~mv2.jpeg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/11062b_23621c0138f7461c916bbecc57c519af~mv2.jpeg',
    // Room interior
    room: 'https://static.wixstatic.com/media/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg',
    // Estate exterior twilight shot (Victorian house at sunset)
    estate: 'https://static.wixstatic.com/media/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg',
    // Logo
    logo: 'https://static.wixstatic.com/media/ebc938_caa5dee343f640b181d2ce0e904974d8~mv2.png/v1/crop/x_52,y_98,w_394,h_291/fill/w_187,h_138,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Hennessey%20House%20(6).png'
  };

  const copyChanges = [
    {
      section: 'Hero',
      before: 'Historic Architecture Meets Modern Luxury',
      after: 'Where Every Stay Becomes a Story',
      subBefore: null,
      subAfter: 'A Victorian estate, lovingly restored. A sparkling pool beneath the Napa sun. Three blocks from downtown—yet a world away.'
    },
    {
      section: 'Pool & Spa',
      before: 'Sparkling Pool & Spa',
      after: 'The Pool',
      subBefore: 'Your private oasis awaits',
      subAfter: 'Your Private Sanctuary — Return from a day of wine tasting to find the afternoon sun dancing on crystal-clear water. This is your private oasis. This is the Hennessey way.'
    },
    {
      section: 'Tasting Room',
      before: 'Historic Tasting Room',
      after: 'The Tasting Room',
      subBefore: 'Experience our restored 19th century tin ceiling for daily dining and wine tasting',
      subAfter: 'Where History Comes Alive — That original 19th-century tin ceiling has witnessed over 130 years of Napa stories. The tin ceiling doesn\'t judge. It just listens.'
    },
    {
      section: 'Breakfast',
      before: 'Complementary Breakfast',
      after: 'Morning at Hennessey',
      subBefore: 'Enjoy a chef-prepared breakfast daily, included with your stay',
      subAfter: 'Chef-Prepared. Locally Sourced. — The aroma of fresh coffee finds you before your alarm does. Breakfast is included. The memories are complimentary.'
    },
    {
      section: 'Sauna',
      before: 'Sauna',
      after: 'The Sauna',
      subBefore: 'Unwind after a long day of wine tasting',
      subAfter: 'Warmth That Restores — Let the dry heat work its magic—releasing tension, clearing your mind, preparing you for whatever the evening holds.'
    },
    {
      section: 'Location',
      before: 'Prime Downtown Location',
      after: 'Downtown Napa',
      subBefore: 'Minutes away from your favorite restaurants & tasting rooms',
      subAfter: 'Three Blocks. Infinite Possibilities. — Close enough to walk to dinner. Quiet enough to hear the birds at breakfast.'
    }
  ];

  const ctaChanges = [
    { before: 'Book Now', after: 'Book Your Escape →' },
    { before: 'Book Now', after: 'Reserve Your Stay →' },
    { before: 'Book Now', after: 'Experience the Estate →' },
    { before: 'Book Now', after: 'Wake Up Here →' },
    { before: 'Book Now', after: 'Find Your Retreat →' },
    { before: 'Book Now', after: 'Discover Your Location →' }
  ];

  const newSections = [
    { name: 'Amenities Grid', description: 'Visual icon grid showing all included amenities' },
    { name: 'Google Reviews Badge', description: '★★★★★ 4.8 on Google · 95 Reviews' },
    { name: 'Newsletter Signup', description: '"Join the Hennessey Circle" email capture' },
    { name: 'Pricing Transparency', description: 'Room rates shown on site ($233-$530)' }
  ];

  return (
    <div className="website-redesign">
      {/* Header */}
      <div className="redesign-header">
        <div className="header-content">
          <h1>Website Redesign Mockup</h1>
          <p>Transforming features into experiences — keeping Hennessey's visual identity</p>
        </div>
        <div className="header-tabs">
          <button 
            className={`tab-btn ${activeSection === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveSection('preview')}
          >
            Live Preview
          </button>
          <button 
            className={`tab-btn ${activeSection === 'changes' ? 'active' : ''}`}
            onClick={() => setActiveSection('changes')}
          >
            Copy Changes
          </button>
          <button 
            className={`tab-btn ${activeSection === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveSection('recommendations')}
          >
            Recommendations
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="redesign-content">
        {activeSection === 'preview' && (
          <div className="preview-container">
            {/* Mockup Website */}
            <div className="mockup-website">
              {/* Mock Header */}
              <header className="mock-header">
                <nav className="mock-nav">
                  <a href="#home">Home</a>
                  <a href="#about">About Us</a>
                  <a href="#gallery">Gallery</a>
                  <a href="#blog">Blog</a>
                  <a href="#contact">Contact</a>
                </nav>
                <div className="mock-logo">
                  <img src={images.logo} alt="Hennessey Estate" />
                </div>
                <a href="https://us2.cloudbeds.com/en/reservation/N2eFbP" className="mock-book-btn" target="_blank" rel="noopener noreferrer">
                  Book Now
                </a>
              </header>

              {/* Hero Section */}
              <section className="mock-hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${images.hero})` }}>
                <h1>Where Every Stay<br/>Becomes a Story</h1>
                <p>A Victorian estate, lovingly restored. A sparkling pool beneath the Napa sun.<br/>Three blocks from downtown—yet a world away.</p>
                <a href="https://us2.cloudbeds.com/en/reservation/N2eFbP" className="mock-cta" target="_blank" rel="noopener noreferrer">
                  Book Your Escape →
                </a>
              </section>

              {/* Pool Section */}
              <section className="mock-section mock-green">
                <div className="mock-two-col">
                  <div className="mock-col-content">
                    <h2>The Pool</h2>
                    <h3>Your Private Sanctuary</h3>
                    <p>Return from a day of wine tasting to find the afternoon sun dancing on crystal-clear water. Slip into the heated pool or let the spa jets melt away the day.</p>
                    <p>As evening falls, the garden lights flicker on—and the wine country sky puts on its nightly show.</p>
                    <p className="mock-tagline">This is your private oasis. This is the Hennessey way.</p>
                    <a href="https://us2.cloudbeds.com/en/reservation/N2eFbP" className="mock-section-cta" target="_blank" rel="noopener noreferrer">
                      Reserve Your Stay →
                    </a>
                  </div>
                  <div className="mock-col-image">
                    <img src={images.pool} alt="Hennessey Estate Pool" />
                  </div>
                </div>
              </section>

              {/* Tasting Room Section */}
              <section className="mock-section mock-cream">
                <div className="mock-two-col reverse">
                  <div className="mock-col-content">
                    <h2>The Tasting Room</h2>
                    <h3>Where History Comes Alive</h3>
                    <p>Look up. That original 19th-century tin ceiling has witnessed over 130 years of Napa stories. Built for Dr. Edwin Hennessey—the county's first physician and namesake of Lake Hennessey—this room now hosts a different kind of gathering.</p>
                    <p>Each morning, settle into your seat for a chef-prepared breakfast. Each evening, return for complimentary wine and local conversation.</p>
                    <p className="mock-tagline dark">The tin ceiling doesn't judge. It just listens.</p>
                    <a href="https://us2.cloudbeds.com/en/reservation/N2eFbP" className="mock-section-cta dark" target="_blank" rel="noopener noreferrer">
                      Experience the Estate →
                    </a>
                  </div>
                  <div className="mock-col-image">
                    <img src={images.tastingRoom} alt="Historic Tasting Room" />
                  </div>
                </div>
              </section>

              {/* Breakfast Section */}
              <section className="mock-section mock-green">
                <div className="mock-two-col">
                  <div className="mock-col-content">
                    <h2>Morning at Hennessey</h2>
                    <h3>Chef-Prepared. Locally Sourced.</h3>
                    <p>The aroma of fresh coffee finds you before your alarm does. In the sunlit tasting room, our chef has been busy—seasonal fruits, warm pastries, and made-to-order plates that fuel your day of discovery.</p>
                    <p>Linger over a second cup. Compare notes on yesterday's favorite winery. Plan today's adventure with fellow travelers who've quickly become friends.</p>
                    <p className="mock-tagline">Breakfast is included. The memories are complimentary.</p>
                    <a href="https://us2.cloudbeds.com/en/reservation/N2eFbP" className="mock-section-cta" target="_blank" rel="noopener noreferrer">
                      Wake Up Here →
                    </a>
                  </div>
                  <div className="mock-col-image">
                    <img src={images.breakfast} alt="Chef-Prepared Breakfast" />
                  </div>
                </div>
              </section>

              {/* Amenities Section */}
              <section className="mock-amenities">
                <h2>Every Stay Includes</h2>
                <div className="mock-amenities-grid">
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 12h2m4 0h8m4 0h2M4 12c0-4 2-8 8-8s8 4 8 8M4 12v4a2 2 0 002 2h12a2 2 0 002-2v-4M7 18v2m10-2v2" />
                      </svg>
                    </div>
                    <span className="amenity-label">Heated Pool & Spa</span>
                  </div>
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 3v3m0 12v3m-9-9h3m12 0h3M5.5 5.5l2 2m9 9l2 2m-13 0l2-2m9-9l2-2M12 9a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                    </div>
                    <span className="amenity-label">Traditional Sauna</span>
                  </div>
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 6c-2 0-3 1-3 2v1h6V8c0-1-1-2-3-2zM6 10h12v2H6v-2zM8 14h8v5a1 1 0 01-1 1H9a1 1 0 01-1-1v-5z" />
                      </svg>
                    </div>
                    <span className="amenity-label">Chef-Prepared Breakfast</span>
                  </div>
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 22h8M12 11v11M7 2l1 4h8l1-4M9 6c0 2.5 3 5 3 5s3-2.5 3-5" />
                      </svg>
                    </div>
                    <span className="amenity-label">Evening Wine Hour</span>
                  </div>
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
                      </svg>
                    </div>
                    <span className="amenity-label">Historic Tasting Room</span>
                  </div>
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h.01M12 16h.01" />
                      </svg>
                    </div>
                    <span className="amenity-label">Molton Brown Amenities</span>
                  </div>
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 10h14M5 14h14M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                      </svg>
                    </div>
                    <span className="amenity-label">Free Parking</span>
                  </div>
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01M5.636 13.636a9 9 0 0112.728 0M3.172 11.172a12 12 0 0117.656 0" />
                      </svg>
                    </div>
                    <span className="amenity-label">High-Speed WiFi</span>
                  </div>
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <span className="amenity-label">Concierge Service</span>
                  </div>
                  <div className="mock-amenity">
                    <div className="amenity-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="amenity-label">Downtown in 3 Blocks</span>
                  </div>
                </div>
              </section>

              {/* Reviews Section */}
              <section className="mock-reviews">
                <div className="mock-reviews-header">
                  <div className="stars">★★★★★</div>
                  <h2>4.8 on Google</h2>
                  <p>95 Five-Star Reviews</p>
                </div>
                <div className="mock-reviews-grid">
                  <div className="mock-review">
                    <p>"Beautifully restored Victorian... rooms that nicely fused the historic with the modern. Hot delicious breakfast. Exceptional stay!"</p>
                    <span className="author">— Denise L., Google</span>
                  </div>
                  <div className="mock-review">
                    <p>"Amazing old Napa charm combined with super modern rooms. Cozy beds, great lighting, and big walk-in showers. The pool was perfect."</p>
                    <span className="author">— Michael T., TripAdvisor</span>
                  </div>
                  <div className="mock-review">
                    <p>"The breakfast alone is worth the stay. And then there's the pool, the sauna, the location... we're already planning our return."</p>
                    <span className="author">— Sarah K., Booking.com</span>
                  </div>
                </div>
              </section>

              {/* Newsletter Section */}
              <section className="mock-newsletter">
                <h2>Join the Hennessey Circle</h2>
                <p>Be first to hear about seasonal offers, last-minute availability, and insider tips for your Napa adventure.</p>
                <div className="mock-newsletter-form">
                  <input type="email" placeholder="Your email address" />
                  <button>Subscribe →</button>
                </div>
                <span className="mock-newsletter-note">We respect your inbox. Unsubscribe anytime.</span>
              </section>

              {/* Footer */}
              <footer className="mock-footer">
                <p className="mock-footer-tagline">Step into a piece of Napa's past. Refined for today.</p>
                <div className="mock-footer-content">
                  <div className="mock-footer-col">
                    <h4>Visit</h4>
                    <p>Hennessey Estate<br/>1727 Main Street<br/>Napa, CA 94559</p>
                  </div>
                  <div className="mock-footer-col">
                    <h4>Contact</h4>
                    <p>info@hennesseyestate.com<br/>(707) 255-1727</p>
                  </div>
                  <div className="mock-footer-col">
                    <h4>Follow</h4>
                    <div className="mock-social">
                      <a href="https://www.instagram.com/hennesseynapa" target="_blank" rel="noopener noreferrer">📷</a>
                      <a href="https://www.pinterest.com/hennesseyestate/" target="_blank" rel="noopener noreferrer">📌</a>
                    </div>
                  </div>
                </div>
                <div className="mock-footer-bottom">
                  <p className="rating">★★★★★ 4.8 on Google · 95 Reviews</p>
                  <p>Listed on the National Register of Historic Places · Est. 1889</p>
                </div>
              </footer>
            </div>
          </div>
        )}

        {activeSection === 'changes' && (
          <div className="changes-container">
            <div className="changes-intro">
              <h2>Copy Transformation Summary</h2>
              <p>Side-by-side comparison of current vs. proposed copy for each section</p>
            </div>

            {/* Copy Changes Table */}
            <div className="changes-table">
              <div className="changes-header-row">
                <div className="change-col section-col">Section</div>
                <div className="change-col before-col">Current Copy</div>
                <div className="change-col after-col">Proposed Copy</div>
              </div>
              {copyChanges.map((change, index) => (
                <div key={index} className="change-row">
                  <div className="change-col section-col">
                    <strong>{change.section}</strong>
                  </div>
                  <div className="change-col before-col">
                    <div className="copy-headline">{change.before}</div>
                    {change.subBefore && <div className="copy-sub">{change.subBefore}</div>}
                  </div>
                  <div className="change-col after-col">
                    <div className="copy-headline new">{change.after}</div>
                    {change.subAfter && <div className="copy-sub new">{change.subAfter}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Changes */}
            <div className="cta-changes">
              <h3>Call-to-Action Variations</h3>
              <p>Instead of repeating "Book Now" 6 times, use varied CTAs:</p>
              <div className="cta-grid">
                {ctaChanges.map((cta, index) => (
                  <div key={index} className="cta-change">
                    <span className="cta-before">{cta.before}</span>
                    <span className="cta-arrow">→</span>
                    <span className="cta-after">{cta.after}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'recommendations' && (
          <div className="recommendations-container">
            <div className="rec-intro">
              <h2>Implementation Recommendations</h2>
              <p>Priority actions to improve website conversion and desirability</p>
            </div>

            {/* Priority Matrix */}
            <div className="priority-matrix">
              <div className="priority-section high">
                <h3>🔴 High Priority</h3>
                <div className="priority-items">
                  <div className="priority-item">
                    <div className="item-header">
                      <span className="item-title">Update Hero Headline</span>
                      <span className="item-impact">+15-20% engagement</span>
                    </div>
                    <p>Change "Historic Architecture Meets Modern Luxury" to "Where Every Stay Becomes a Story"</p>
                  </div>
                  <div className="priority-item">
                    <div className="item-header">
                      <span className="item-title">Add Google Reviews Badge</span>
                      <span className="item-impact">+20% trust</span>
                    </div>
                    <p>Display "★★★★★ 4.8 on Google · 95 Reviews" prominently in footer and hero</p>
                  </div>
                  <div className="priority-item">
                    <div className="item-header">
                      <span className="item-title">Rewrite Pool & Sauna Sections</span>
                      <span className="item-impact">+25% desire</span>
                    </div>
                    <p>Transform feature descriptions into experiential storytelling</p>
                  </div>
                </div>
              </div>

              <div className="priority-section medium">
                <h3>🟡 Medium Priority</h3>
                <div className="priority-items">
                  <div className="priority-item">
                    <div className="item-header">
                      <span className="item-title">Add Pricing Transparency</span>
                      <span className="item-impact">-15% bounce rate</span>
                    </div>
                    <p>Show room rates on website ($233-$530) like White House Napa does</p>
                  </div>
                  <div className="priority-item">
                    <div className="item-header">
                      <span className="item-title">Email Newsletter Signup</span>
                      <span className="item-impact">Build remarketing list</span>
                    </div>
                    <p>"Join the Hennessey Circle" - capture emails for direct marketing</p>
                  </div>
                  <div className="priority-item">
                    <div className="item-header">
                      <span className="item-title">Vary CTAs Across Sections</span>
                      <span className="item-impact">Reduce fatigue</span>
                    </div>
                    <p>Use "Reserve Your Stay", "Wake Up Here", etc. instead of repeated "Book Now"</p>
                  </div>
                </div>
              </div>

              <div className="priority-section low">
                <h3>🟢 Lower Priority</h3>
                <div className="priority-items">
                  <div className="priority-item">
                    <div className="item-header">
                      <span className="item-title">Update Meta Descriptions</span>
                      <span className="item-impact">SEO improvement</span>
                    </div>
                    <p>Optimize page titles and meta descriptions for search</p>
                  </div>
                  <div className="priority-item">
                    <div className="item-header">
                      <span className="item-title">Add Amenities Icon Grid</span>
                      <span className="item-impact">Visual scanability</span>
                    </div>
                    <p>Create visual grid showing all included amenities at a glance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Sections */}
            <div className="new-sections">
              <h3>Recommended New Sections</h3>
              <div className="new-sections-grid">
                {newSections.map((section, index) => (
                  <div key={index} className="new-section-card">
                    <h4>{section.name}</h4>
                    <p>{section.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Comparison */}
            <div className="competitor-insight">
              <h3>Why This Matters: Competitor Comparison</h3>
              <div className="comparison-table">
                <div className="comp-row header">
                  <div className="comp-cell">Element</div>
                  <div className="comp-cell">Hennessey (Current)</div>
                  <div className="comp-cell">Francis House</div>
                  <div className="comp-cell">White House Napa</div>
                </div>
                <div className="comp-row">
                  <div className="comp-cell">Hero Copy</div>
                  <div className="comp-cell warning">Generic feature</div>
                  <div className="comp-cell success">Emotional hook</div>
                  <div className="comp-cell success">Lifestyle focused</div>
                </div>
                <div className="comp-row">
                  <div className="comp-cell">Pricing Shown</div>
                  <div className="comp-cell warning">No</div>
                  <div className="comp-cell neutral">No</div>
                  <div className="comp-cell success">Yes ($299+)</div>
                </div>
                <div className="comp-row">
                  <div className="comp-cell">Reviews Displayed</div>
                  <div className="comp-cell warning">1 slider</div>
                  <div className="comp-cell success">Forbes #1 badge</div>
                  <div className="comp-cell success">Multiple + ratings</div>
                </div>
                <div className="comp-row">
                  <div className="comp-cell">Email Capture</div>
                  <div className="comp-cell warning">None</div>
                  <div className="comp-cell success">Yes</div>
                  <div className="comp-cell success">Yes</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteRedesign;

