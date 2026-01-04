import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import './LandingPage.css';

// Actual Hennessey Estate images from their website
const fallbackImages = {
  hero: 'https://static.wixstatic.com/media/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg/v1/fill/w_2500,h_1422,al_c,q_90,enc_avif,quality_auto/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg',
  pool: 'https://static.wixstatic.com/media/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_90,enc_avif,quality_auto/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg',
  tastingRoom: 'https://static.wixstatic.com/media/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_90,enc_avif,quality_auto/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg',
  breakfast: 'https://static.wixstatic.com/media/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/ebc938_094ef2061610482496a761042a6fb175~mv2.jpg',
  sauna: 'https://static.wixstatic.com/media/11062b_23621c0138f7461c916bbecc57c519af~mv2.jpeg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/11062b_23621c0138f7461c916bbecc57c519af~mv2.jpeg',
  room: 'https://static.wixstatic.com/media/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg',
  estate: 'https://static.wixstatic.com/media/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg',
  location: 'https://static.wixstatic.com/media/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_90,enc_avif,quality_auto/ebc938_f9c53f8bfbf7444081335859e527f5be~mv2.jpg'
};

// Icon mappings for buyout features
const featureIcons = {
  tub: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 24h32v4c0 6-5 10-16 10S8 34 8 28v-4z"/>
      <path d="M12 24V14c0-4 3-7 7-7"/>
      <path d="M19 7c2 0 3 1 3 3v3"/>
      <path d="M19 10h4"/>
      <ellipse cx="24" cy="32" rx="10" ry="3"/>
      <path d="M12 38v4"/>
      <path d="M36 38v4"/>
    </svg>
  ),
  wave: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="12" r="5"/>
      <path d="M20 17c-2 3-4 8-4 8"/>
      <path d="M28 17c2 3 4 8 4 8"/>
      <path d="M4 32c4-3 8-4 12-4s8 2 12 4 8 3 12 3 8-2 12-4"/>
      <path d="M4 40c4-3 8-4 12-4s8 2 12 4 8 3 12 3 8-2 12-4"/>
    </svg>
  ),
  wine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8l-1 9c0 2.5-2 4.5-4.5 4.5S6 13.5 6 11l-1-9h3"/>
      <path d="M12 15.5v6"/>
      <path d="M8 21.5h8"/>
      <path d="M7 6h10"/>
    </svg>
  ),
  tv: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="28" height="20" rx="2"/>
      <path d="M4 24h28"/>
      <path d="M12 28v6"/>
      <path d="M24 28v6"/>
      <path d="M8 34h20"/>
      <rect x="36" y="12" width="8" height="24" rx="2"/>
      <circle cx="40" cy="18" r="2"/>
      <path d="M38 24h4"/>
      <path d="M38 28h4"/>
      <path d="M38 32h4"/>
      <path d="M30 6l4-4"/>
      <path d="M34 6l-4-4"/>
    </svg>
  ),
  egg: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Chef's hat (toque) */}
      <path d="M6 12c-2 0-3-2-3-4s2-4 4-4c0-2 2-3 5-3s5 1 5 3c2 0 4 2 4 4s-1 4-3 4"/>
      <path d="M6 12v6c0 1 2 2 6 2s6-1 6-2v-6"/>
      <path d="M6 17h12"/>
    </svg>
  ),
  celebration: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 44L8 16l24 8-12 20z"/>
      <path d="M12 20l16 5"/>
      <path d="M14 28l12 4"/>
      <path d="M16 36l8 2"/>
      <circle cx="36" cy="8" r="2" fill="currentColor"/>
      <circle cx="42" cy="14" r="1.5" fill="currentColor"/>
      <circle cx="38" cy="20" r="1" fill="currentColor"/>
      <path d="M32 4l2 4"/>
      <path d="M40 6l-2 3"/>
      <path d="M44 10l-3 2"/>
      <path d="M34 14l3-1"/>
      <path d="M42 22l-2-2"/>
      <path d="M30 12l1 2"/>
      <circle cx="28" cy="6" r="1" fill="currentColor"/>
      <circle cx="44" cy="18" r="1" fill="currentColor"/>
    </svg>
  ),
};

// Amenity icons
const amenityIcons = {
  pool: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2-2 4-3 6-3s4 1 6 3 4 3 6 3 4-1 6-3"/>
      <path d="M2 17c2-2 4-3 6-3s4 1 6 3 4 3 6 3 4-1 6-3"/>
      <circle cx="12" cy="7" r="3"/>
    </svg>
  ),
  sauna: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.5 0 10-4.5 10-10H2c0 5.5 4.5 10 10 10z"/>
      <path d="M8 6c0-2 1-4 4-4s4 2 4 4"/>
      <path d="M6 8v4"/>
      <path d="M18 8v4"/>
      <path d="M12 4v8"/>
    </svg>
  ),
  breakfast: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8 12h8"/>
      <path d="M12 8v8"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  wine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8"/>
      <path d="M12 17v5"/>
      <path d="M17 2v5c0 1.5-1 3-3 4-1-1-2-2.5-2-4V2"/>
      <path d="M7 2v5c0 1.5 1 3 3 4"/>
      <path d="M12 11c-3 0-5-2-5-5V2h10v4c0 3-2 5-5 5z"/>
    </svg>
  ),
  historic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l7-4 7 4v14"/>
      <path d="M9 21v-6h6v6"/>
      <path d="M10 10h.01"/>
      <path d="M14 10h.01"/>
    </svg>
  ),
  amenities: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2h6l-3 7h4l-5 13 1-9H8l1-11z"/>
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="8" rx="2"/>
      <circle cx="7" cy="19" r="2"/>
      <circle cx="17" cy="19" r="2"/>
      <path d="M5 11V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v4"/>
      <path d="M3 15h18"/>
    </svg>
  ),
  wifi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1"/>
    </svg>
  ),
  concierge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      <circle cx="12" cy="2" r="1"/>
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
};

// Gallery Carousel Component
const GalleryCarousel = ({ category }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const images = category.images || [];
  
  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Auto-advance every 4 seconds
    
    return () => clearInterval(interval);
  }, [isPaused, images.length]);
  
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  return (
    <div 
      className="gallery-category"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <h3 className="category-title">{category.name}</h3>
      <div className="gallery-carousel">
        <div 
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, imgIndex) => (
            <div key={imgIndex} className="carousel-slide">
              <img 
                src={image.src} 
                alt={image.alt} 
                loading={imgIndex < 3 ? "eager" : "lazy"}
                onClick={() => window.open(image.src.replace(/w_\d+,h_\d+/, 'w_1920,h_1280'), '_blank')}
              />
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button className="carousel-arrow carousel-prev" onClick={goToPrev} aria-label="Previous image">
          ‹
        </button>
        <button className="carousel-arrow carousel-next" onClick={goToNext} aria-label="Next image">
          ›
        </button>
        
        {/* Dots Indicator */}
        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { content, isLoaded } = useWebsiteContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Set page title and meta description for SEO
  useEffect(() => {
    document.title = 'Hennessey Estate | Luxury Bed & Breakfast in Downtown Napa Valley';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Experience Victorian elegance at Hennessey Estate, a historic 1889 bed and breakfast in downtown Napa. 10 luxury ensuite rooms, heated pool & spa, chef-prepared breakfast.');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll reviews carousel
  useEffect(() => {
    if (isPaused || !content?.reviews?.items?.length) return;
    
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => 
        (prev + 1) % content.reviews.items.length
      );
    }, 5000); // Change review every 5 seconds
    
    return () => clearInterval(interval);
  }, [isPaused, content?.reviews?.items?.length]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for joining the Hennessey Circle! We'll be in touch at ${email}`);
    setEmail('');
  };

  // Show loading state while content loads
  if (!isLoaded) {
    return (
      <div className="landing-page loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Destructure content for easier access
  const { global: globalContent, header, hero, quickInfo, reviews, rooms, buyout, contentSections, amenities, gallery, location, newsletter, footer } = content;

  return (
    <div className="landing-page">
      {/* Navigation */}
      {header?.visible !== false && (
        <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
          <nav className="landing-nav">
            <div className="nav-links left">
              {header?.navLinks?.slice(0, 4).map((link, i) => (
                <a key={i} href={link.href}>{link.label}</a>
              ))}
            </div>
            
            <div className="nav-logo">
              <img src={globalContent?.logo || '/logo.png'} alt={globalContent?.siteName || 'Hennessey Estate'} />
              {globalContent?.showEstablished && (
                <span className="est">{globalContent?.establishedText || 'EST. 1889'}</span>
              )}
            </div>
            
            <div className="nav-links right">
              {header?.navLinks?.slice(4).map((link, i) => (
                <a key={i} href={link.href}>{link.label}</a>
              ))}
              <Link to={header?.bookButtonLink || '/book'} className="nav-book-btn">
                {header?.bookButtonText || 'Book Now'}
              </Link>
            </div>

            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </nav>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            {header?.navLinks?.map((link, i) => (
              <a key={i} href={link.href} onClick={() => setMobileMenuOpen(false)}>{link.label}</a>
            ))}
            <Link to={header?.bookButtonLink || '/book'} className="mobile-book-btn" onClick={() => setMobileMenuOpen(false)}>
              Book Your Stay
            </Link>
          </div>
        </header>
      )}

      {/* Hero Section */}
      {hero?.visible !== false && (
        <section className="hero-section">
          <div className="hero-video-background">
            {hero?.backgroundVideo ? (
              <video autoPlay loop muted playsInline poster={hero?.backgroundImage || fallbackImages.hero}>
                <source src={hero.backgroundVideo} type="video/mp4" />
              </video>
            ) : (
              <div className="hero-image-fallback" style={{ backgroundImage: `url(${hero?.backgroundImage || fallbackImages.hero})` }}></div>
            )}
          </div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            {hero?.trustBadges?.length > 0 && (
              <div className="hero-trust-badges">
                {hero.trustBadges.map((badge, i) => (
                  <div key={i} className="trust-badge">
                    <span className={badge.icon.includes('★') ? 'stars' : 'badge-icon'}>{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            )}
            <h1>
              {hero?.title || 'Where Every Stay'}<br/>
              {hero?.titleLine2 || 'Becomes a'} <em>{hero?.titleEmphasis || 'Story'}</em>
            </h1>
            <p className="hero-subtitle">
              <span className="desktop-full">{hero?.subtitle}</span>
              <span className="mobile-short">
                {hero?.subtitle?.split('. ').slice(0, 2).join('. ')}.
              </span>
            </p>
            {hero?.quickFacts?.length > 0 && (
              <div className="hero-quick-facts">
                {hero.quickFacts.map((fact, i) => (
                  <div key={i} className="quick-fact">
                    <strong>{fact.label}</strong>
                    <span>{fact.sublabel}</span>
                  </div>
                ))}
              </div>
            )}
            <Link to={hero?.ctaLink || '/book'} className="hero-cta primary">
              {hero?.ctaText || 'Book Your Escape →'}
            </Link>
          </div>
          <div className="hero-scroll-indicator">
            <span>Scroll to explore</span>
            <div className="scroll-arrow"></div>
          </div>
        </section>
      )}

      {/* Quick Info Bar */}
      {quickInfo?.visible !== false && (
        <section className="quick-info-bar">
          <div className="quick-info-container">
            {quickInfo?.items?.map((item, i) => (
              <div key={i} className="quick-info-item">
                <span className="info-icon">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.isLink ? (
                      <a href={`tel:${item.description.replace(/[^0-9]/g, '')}`}>{item.description}</a>
                    ) : (
                      item.description
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full Property Buyout Hero Section */}
      {buyout?.visible !== false && (
        <section 
          id="buyout" 
          className="buyout-hero-section" 
          style={{ backgroundImage: `url(${buyout?.backgroundImage || fallbackImages.estate})` }}
        >
          <div className="buyout-hero-overlay"></div>
          <div className="buyout-hero-content">
            <div className="buyout-badge">{buyout?.badge}</div>
            <h2>{buyout?.title}</h2>
            <h3>{buyout?.subtitle}</h3>
            <p className="buyout-hero-lead">{buyout?.lead}</p>
            <div className="buyout-features">
              {buyout?.features?.map((feature, i) => (
                <div key={i} className="buyout-feature">
                  <span className="feature-icon">
                    {featureIcons[feature.icon] || featureIcons.celebration}
                  </span>
                  <div>
                    <strong>{feature.title}</strong>
                    <span>{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="buyout-hero-description">{buyout?.description}</p>
            <Link to="/book?buyout=true" className="buyout-hero-cta">{buyout?.ctaText}</Link>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviews?.visible !== false && (
        <section id="reviews" className="reviews-section">
          <div className="reviews-header">
            <div className="rating-badges">
              <div className="rating-badge">
                <div className="rating-score">{reviews?.rating}<span>/{reviews?.ratingOutOf || '5'}</span></div>
                <div className="rating-label">{reviews?.platform}</div>
                <div className="rating-count">{reviews?.reviewCount} reviews</div>
              </div>
              {reviews?.secondaryRating && (
                <div className="rating-badge">
                  <div className="rating-score">{reviews?.secondaryRating}<span>/{reviews?.secondaryRatingOutOf || '10'}</span></div>
                  <div className="rating-label">{reviews?.secondaryPlatform}</div>
                  <div className="rating-count">{reviews?.secondaryReviewCount} reviews</div>
                </div>
              )}
            </div>
            <h2>What Our Guests Say</h2>
          </div>
          
          {/* Auto-scrolling Carousel */}
          <div 
            className="reviews-carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="reviews-track" style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}>
              {reviews?.items?.map((review, i) => (
                <div key={i} className={`review-slide ${i === currentReviewIndex ? 'active' : ''}`}>
                  <div className="review-card carousel-card">
                    <div className="review-stars">{'★'.repeat(review.rating >= 10 ? 5 : review.rating)}</div>
                    <p>{review.text}</p>
                    <div className="review-author">
                      <span className="author-name">— {review.author}</span>
                      <span className="author-source">{review.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Indicators */}
            <div className="carousel-indicators">
              {reviews?.items?.map((_, i) => (
                <button
                  key={i}
                  className={`indicator ${i === currentReviewIndex ? 'active' : ''}`}
                  onClick={() => setCurrentReviewIndex(i)}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
            
            {/* Navigation Arrows */}
            <button 
              className="carousel-arrow prev" 
              onClick={() => setCurrentReviewIndex((prev) => (prev - 1 + reviews.items.length) % reviews.items.length)}
              aria-label="Previous review"
            >
              ‹
            </button>
            <button 
              className="carousel-arrow next" 
              onClick={() => setCurrentReviewIndex((prev) => (prev + 1) % reviews.items.length)}
              aria-label="Next review"
            >
              ›
            </button>
          </div>

          <div className="reviews-cta">
            <a href={reviews?.reviewsLink} target="_blank" rel="noopener noreferrer" className="review-link">
              Read All {reviews?.reviewCount} Reviews →
            </a>
            <Link to="/book" className="review-link primary">Book Your Stay →</Link>
          </div>
        </section>
      )}

      {/* Rooms Section */}
      {rooms?.visible !== false && (
        <section id="rooms" className="rooms-section">
          <div className="rooms-container">
            <div className="rooms-content">
              <h2>{rooms?.title}</h2>
              <h3>{rooms?.subtitle}</h3>
              <p>
                <span className="desktop-full">{rooms?.description}</span>
                <span className="mobile-short">
                  {rooms?.description?.split('. ').slice(0, 4).join('. ')}.
                </span>
              </p>
              {rooms?.features?.length > 0 && (
                <div className="room-features">
                  {rooms.features.map((feature, i) => (
                    <div key={i} className="feature">✦ {feature}</div>
                  ))}
                </div>
              )}
              <div className="room-pricing">
                <span className="price-range">From {rooms?.priceFrom}/night</span>
                <span className="price-note">{rooms?.pricePeak}/night peak season</span>
              </div>
              <Link to="/book" className="rooms-cta">{rooms?.ctaText}</Link>
            </div>
            <div className="rooms-image">
              <img src={rooms?.image || fallbackImages.room} alt="Luxury Room Interior" />
            </div>
          </div>
        </section>
      )}

      {/* Pool Section */}
      {contentSections?.pool?.visible !== false && (
        <section id="pool" className="content-section green-section">
          <div className="section-container">
            <div className="section-content">
              <h2>{contentSections?.pool?.title}</h2>
              <h3>{contentSections?.pool?.subtitle}</h3>
              <p>{contentSections?.pool?.paragraphs?.[0]}</p>
              <p className={expandedSections.pool ? 'mobile-visible' : 'mobile-hidden'}>
                {contentSections?.pool?.paragraphs?.[1]}
              </p>
              {!expandedSections.pool && contentSections?.pool?.paragraphs?.[1] && (
                <button className="read-more-toggle" onClick={() => toggleSection('pool')}>
                  Read more →
                </button>
              )}
              <Link to="/book" className="section-cta">{contentSections?.pool?.ctaText}</Link>
            </div>
            <div className="section-image">
              <img src={contentSections?.pool?.image || fallbackImages.pool} alt={contentSections?.pool?.title} />
            </div>
          </div>
        </section>
      )}

      {/* Tasting Room Section */}
      {contentSections?.tastingRoom?.visible !== false && (
        <section className="content-section cream-section reverse">
          <div className="section-container">
            <div className="section-content">
              <h2>{contentSections?.tastingRoom?.title}</h2>
              <h3>{contentSections?.tastingRoom?.subtitle}</h3>
              <p>{contentSections?.tastingRoom?.paragraphs?.[0]}</p>
              <p className={expandedSections.tastingRoom ? 'mobile-visible' : 'mobile-hidden'}>
                {contentSections?.tastingRoom?.paragraphs?.[1]}
              </p>
              {contentSections?.tastingRoom?.paragraphs?.[2] && (
                <p className={expandedSections.tastingRoom ? 'mobile-visible' : 'mobile-hidden'}>
                  {contentSections?.tastingRoom?.paragraphs?.[2]}
                </p>
              )}
              {!expandedSections.tastingRoom && contentSections?.tastingRoom?.paragraphs?.[1] && (
                <button className="read-more-toggle" onClick={() => toggleSection('tastingRoom')}>
                  Read more →
                </button>
              )}
              <Link to="/book" className="section-cta dark">{contentSections?.tastingRoom?.ctaText}</Link>
            </div>
            <div className="section-image">
              <img src={contentSections?.tastingRoom?.image || fallbackImages.tastingRoom} alt={contentSections?.tastingRoom?.title} />
            </div>
          </div>
        </section>
      )}

      {/* Breakfast Section */}
      {contentSections?.breakfast?.visible !== false && (
        <section className="content-section green-section">
          <div className="section-container">
            <div className="section-content">
              <h2>{contentSections?.breakfast?.title}</h2>
              <h3>{contentSections?.breakfast?.subtitle}</h3>
              <p>{contentSections?.breakfast?.paragraphs?.[0]}</p>
              <p className={expandedSections.breakfast ? 'mobile-visible' : 'mobile-hidden'}>
                {contentSections?.breakfast?.paragraphs?.[1]}
              </p>
              {!expandedSections.breakfast && contentSections?.breakfast?.paragraphs?.[1] && (
                <button className="read-more-toggle" onClick={() => toggleSection('breakfast')}>
                  Read more →
                </button>
              )}
              <Link to="/book" className="section-cta">{contentSections?.breakfast?.ctaText}</Link>
            </div>
            <div className="section-image">
              <img src={contentSections?.breakfast?.image || fallbackImages.breakfast} alt={contentSections?.breakfast?.title} />
            </div>
          </div>
        </section>
      )}

      {/* Sauna Section */}
      {contentSections?.sauna?.visible !== false && (
        <section className="content-section cream-section reverse">
          <div className="section-container">
            <div className="section-content">
              <h2>{contentSections?.sauna?.title}</h2>
              <h3>{contentSections?.sauna?.subtitle}</h3>
              <p>{contentSections?.sauna?.paragraphs?.[0]}</p>
              <p className={expandedSections.sauna ? 'mobile-visible' : 'mobile-hidden'}>
                {contentSections?.sauna?.paragraphs?.[1]}
              </p>
              {!expandedSections.sauna && contentSections?.sauna?.paragraphs?.[1] && (
                <button className="read-more-toggle" onClick={() => toggleSection('sauna')}>
                  Read more →
                </button>
              )}
              <Link to="/book" className="section-cta dark">{contentSections?.sauna?.ctaText}</Link>
            </div>
            <div className="section-image">
              <img src={contentSections?.sauna?.image || fallbackImages.sauna} alt={contentSections?.sauna?.title} />
            </div>
          </div>
        </section>
      )}

      {/* Amenities Section */}
      {amenities?.visible !== false && (
        <section id="amenities" className="amenities-section">
          <h2>{amenities?.title}</h2>
          <div className="amenities-grid">
            {amenities?.items?.map((item, i) => (
              <div key={i} className="amenity-item">
                <div className="amenity-icon">
                  {amenityIcons[item.icon] || amenityIcons.amenities}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Location Section */}
      {location?.visible !== false && (
        <section id="location" className="location-section" style={{ backgroundImage: `url(${fallbackImages.location})` }}>
          <div className="location-overlay"></div>
          <div className="location-content">
            <h2>{location?.title}</h2>
            <h3>{location?.subtitle}</h3>
            {location?.paragraphs?.map((p, i) => (
              <p key={i} className={i === 1 ? 'location-tagline' : i === 2 ? 'location-balance' : ''}>
                {p}
              </p>
            ))}
            <Link to="/book" className="location-cta">{location?.ctaText}</Link>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {gallery?.visible !== false && (
        <section id="gallery" className="gallery-section">
          <div className="gallery-header">
            <h2>{gallery?.title || 'Gallery'}</h2>
            <p className="gallery-subtitle">{gallery?.subtitle || 'Explore the luxury of Hennessey Estate'}</p>
          </div>
          <div className="gallery-categories">
            {gallery?.categories?.map((category, catIndex) => (
              <GalleryCarousel key={catIndex} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      {newsletter?.visible !== false && (
        <section className="newsletter-section">
          <h2>{newsletter?.title}</h2>
          <p>{newsletter?.subtitle}</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder={newsletter?.placeholder || 'Your email address'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">{newsletter?.buttonText || 'Subscribe →'}</button>
          </form>
          <span className="newsletter-note">{newsletter?.disclaimer}</span>
        </section>
      )}

      {/* Footer */}
      {footer?.visible !== false && (
        <footer className="landing-footer">
          <p className="footer-tagline">{footer?.tagline}</p>
          
          <div className="footer-content">
            <div className="footer-col">
              <h4>Visit</h4>
              <p>
                {globalContent?.contact?.address?.name}<br/>
                {globalContent?.contact?.address?.street}<br/>
                {globalContent?.contact?.address?.city}
              </p>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <p>
                <a href={`mailto:${globalContent?.contact?.email}`}>{globalContent?.contact?.email}</a>
              </p>
            </div>
            <div className="footer-col">
              <h4>Follow</h4>
              <div className="footer-social">
                {globalContent?.social?.instagram && (
                  <a href={globalContent.social.instagram} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {globalContent?.social?.pinterest && (
                  <a href={globalContent.social.pinterest} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
                  </a>
                )}
                {globalContent?.social?.tripadvisor && (
                  <a href={globalContent.social.tripadvisor} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 004.04 10.43 5.976 5.976 0 004.075-1.6L12 19.705l1.922-2.09a5.972 5.972 0 004.072 1.598 6 6 0 004.04-10.43l1.966-2.135h-4.361c-2.307-1.569-4.975-2.353-7.645-2.353h.012zm0 2.137c1.602 0 3.206.45 4.607 1.35l-1.127.804c-1.063-.517-2.26-.8-3.48-.8-1.222 0-2.418.284-3.48.8L7.4 7.783c1.4-.899 3.004-1.35 4.606-1.35zM6.003 9.428a4.006 4.006 0 100 8.012 4.006 4.006 0 000-8.012zm11.994 0a4.006 4.006 0 100 8.012 4.006 4.006 0 000-8.012zM6.003 11.42a2.003 2.003 0 11.002 4.006 2.003 2.003 0 01-.002-4.006zm11.994 0a2.003 2.003 0 110 4.006 2.003 2.003 0 010-4.006z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-rating">{footer?.rating}</p>
            <p className="footer-historic">{footer?.historic}</p>
          </div>

          <div className="footer-legal">
            <p>{footer?.copyright?.replace('{year}', new Date().getFullYear())}</p>
            <div className="footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>
          </div>
        </footer>
      )}
      
      {/* Floating Reserve Button - Mobile */}
      <Link to="/book" className="mobile-reserve-btn">Stay Here</Link>
    </div>
  );
};

export default LandingPage;
