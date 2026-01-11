/**
 * About Page - SEO-optimized history and story
 * Target keywords: historic napa hotel, victorian inn, dr hennessey, national register historic places
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta, BreadcrumbSchema, ArticleSchema } from '../seo';
import './AboutPage.css';

// Timeline data
const timeline = [
  {
    year: '1889',
    title: 'The Beginning',
    description: 'Dr. Edwin Z. Hennessey, Napa County\'s first physician, builds this Queen Anne Victorian as his family residence. The estate becomes a cornerstone of the community.',
  },
  {
    year: '1890s',
    title: 'A Doctor\'s Legacy',
    description: 'Dr. Hennessey serves the growing Napa community, making house calls by horse and buggy. His dedication earns him the honor of having Lake Hennessey named in his memory.',
  },
  {
    year: '1920s',
    title: 'Preservation Era',
    description: 'The estate passes through careful stewards who maintain its Victorian character, preserving the original tin ceilings, woodwork, and architectural details.',
  },
  {
    year: '1980s',
    title: 'Historic Recognition',
    description: 'The property is officially listed on the National Register of Historic Places, recognizing its architectural significance and historical importance to Napa Valley.',
  },
  {
    year: '2000s',
    title: 'Luxury Restoration',
    description: 'Comprehensive restoration transforms the estate into a luxury bed and breakfast while preserving its historic character. Modern amenities including the heated pool and spa are added.',
  },
  {
    year: 'Today',
    title: 'Your Story Begins',
    description: 'Hennessey Estate welcomes guests from around the world, offering a unique blend of Victorian elegance and modern luxury just steps from downtown Napa.',
  },
];

// Architectural features
const features = [
  {
    title: 'Original Tin Ceilings',
    description: 'The tasting room features stunning 19th-century pressed tin ceilings, meticulously preserved and restored to their original glory.',
    icon: '🏛️',
  },
  {
    title: 'Queen Anne Architecture',
    description: 'Classic Victorian design with wraparound details, decorative woodwork, and elegant proportions typical of the era.',
    icon: '🏠',
  },
  {
    title: 'Stick-Eastlake Details',
    description: 'Intricate wooden ornamentation throughout the property showcases the craftsmanship of late 19th-century artisans.',
    icon: '✨',
  },
  {
    title: 'Victorian Gardens',
    description: 'Landscaped grounds feature period-appropriate plantings, creating a serene retreat in the heart of downtown.',
    icon: '🌿',
  },
];

const AboutPage = () => {
  // Set page meta tags
  usePageMeta({
    pageKey: 'about',
    path: '/about',
  });

  // Breadcrumb data
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];

  return (
    <div className="about-page">
      {/* Schema Markup */}
      <BreadcrumbSchema items={breadcrumbs} />
      <ArticleSchema
        title="The Story of Hennessey Estate - Since 1889"
        description="Discover the rich history of Hennessey Estate, built in 1889 for Napa's first physician and listed on the National Register of Historic Places."
        datePublished="2024-01-01"
        url="https://hennesseyestate.com/about"
      />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
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
          <div className="hero-badge">EST. 1889</div>
          <h1>The Story of Hennessey Estate</h1>
          <p className="hero-subtitle">Where Napa History Meets Modern Luxury</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="about-content">
        {/* Introduction */}
        <section className="about-intro">
          <div className="intro-image">
            <img 
              src="https://static.wixstatic.com/media/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/ebc938_bcf265b8470243cd851d807251620c57~mv2.jpg" 
              alt="Hennessey Estate Victorian exterior"
              loading="eager"
            />
            <div className="historic-badge">
              <span className="badge-icon">🏛️</span>
              <span>National Register of Historic Places</span>
            </div>
          </div>
          <div className="intro-text">
            <h2>A Legacy of Care</h2>
            <p>
              In 1889, when Napa Valley was still finding its identity, <strong>Dr. Edwin Z. 
              Hennessey</strong>—the county's first physician—built this Queen Anne Victorian 
              as his family home. A civic leader so beloved that the county named its primary 
              water source after him, Dr. Hennessey chose this spot for a reason: close enough 
              to serve his patients, peaceful enough to restore his own spirit.
            </p>
            <p>
              Today, <strong>Lake Hennessey</strong> still provides water to Napa County. And 
              this estate—now a proud listing on the <strong>National Register of Historic 
              Places</strong>—provides something equally essential: a place to pause, to 
              reconnect, to remember why you came to wine country in the first place.
            </p>
          </div>
        </section>

        {/* Dr. Hennessey Section */}
        <section className="doctor-section">
          <div className="doctor-content">
            <h2>Dr. Edwin Z. Hennessey</h2>
            <h3>Napa County's First Physician</h3>
            <div className="doctor-story">
              <p>
                Arriving in Napa Valley in the 1870s, Edwin Hennessey dedicated his life to 
                caring for the community. Before modern hospitals, before paved roads, he 
                traveled by horse to reach patients across the valley—from vineyard workers 
                to prominent families.
              </p>
              <p>
                His impact was so profound that when Napa built its primary reservoir, the 
                community insisted it bear his name. Today, Lake Hennessey supplies water to 
                the city of Napa, a fitting tribute to a man who spent his life sustaining 
                his community.
              </p>
              <p>
                The home he built reflects his values: welcoming, comfortable, and built to 
                last. Over 135 years later, we honor his legacy by opening these doors to 
                travelers seeking the same restorative experience he once found here.
              </p>
            </div>
          </div>
          <div className="doctor-image">
            <div className="image-frame">
              <img 
                src="https://static.wixstatic.com/media/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_90,enc_avif,quality_auto/ebc938_1298d35da3ee44939009a45ffe697222~mv2.jpg"
                alt="Historic tasting room with original tin ceiling"
                loading="lazy"
              />
              <p className="image-caption">The historic tasting room with its original 19th-century tin ceiling</p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="timeline-section">
          <h2>Our History</h2>
          <div className="timeline">
            {timeline.map((item, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content">
                  <span className="timeline-year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Architectural Features */}
        <section className="architecture-section">
          <h2>Architectural Heritage</h2>
          <p className="section-intro">
            Every corner of Hennessey Estate tells a story of Victorian craftsmanship, 
            carefully preserved for over a century.
          </p>
          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className="feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The Restoration */}
        <section className="restoration-section">
          <div className="restoration-content">
            <h2>The Restoration</h2>
            <p>
              Look up in our tasting room. That 19th-century tin ceiling? Original. The 
              intricate Stick-Eastlake woodwork throughout the estate? Painstakingly preserved. 
              We believe luxury isn't about erasing history—it's about honoring it while adding 
              the comforts today's traveler expects.
            </p>
            <ul className="restoration-features">
              <li>Private baths with rainfall showers</li>
              <li>Premium Molton Brown amenities</li>
              <li>Curated luxury bedding</li>
              <li>Heated pool and spa</li>
              <li>Traditional Finnish sauna</li>
              <li>Climate-controlled comfort</li>
            </ul>
            <p className="restoration-quote">
              <em>"The best restoration isn't about making something look new—it's about 
              making it feel timeless."</em>
            </p>
          </div>
          <div className="restoration-images">
            <img 
              src="https://static.wixstatic.com/media/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg/v1/fill/w_1920,h_1280,q_90,enc_avif,quality_auto/ebc938_b718a456c03341b1baaf4807d9981421~mv2.jpg"
              alt="Luxury restored guest room"
              loading="lazy"
            />
          </div>
        </section>

        {/* Your Chapter */}
        <section className="your-chapter">
          <h2>Your Chapter Begins</h2>
          <p>
            The best Napa experiences aren't just about wine. They're about the story you 
            return home with. The breakfast conversation with travelers from three states 
            away. The sunset swim after your fifth tasting of the day. The evening on the 
            veranda, watching the garden lights flicker on.
          </p>
          <p className="highlight">
            <strong>Step into a piece of Napa's past—refined for today.</strong>
          </p>
          <Link to="/book" className="cta-button">Book Your Story →</Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="about-footer">
        <div className="footer-content">
          <p>Hennessey Estate • 1727 Main Street, Napa, CA 94559</p>
          <p className="footer-historic">Listed on the National Register of Historic Places</p>
          <nav className="footer-nav">
            <Link to="/">Home</Link>
            <Link to="/rooms">Rooms</Link>
            <Link to="/amenities">Amenities</Link>
            <Link to="/location">Location</Link>
            <Link to="/book">Book</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
