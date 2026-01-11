/**
 * FAQ Page - SEO-optimized with FAQ Schema
 * Target keywords: hennessey estate faq, napa b&b questions
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta, FAQSchema, BreadcrumbSchema } from '../seo';
import './FAQPage.css';

// Comprehensive FAQ data
const faqCategories = [
  {
    category: 'Reservations & Booking',
    icon: '📅',
    faqs: [
      {
        question: 'What time is check-in and check-out at Hennessey Estate?',
        answer: 'Check-in begins at 3:00 PM and check-out is by 11:00 AM. Early check-in and late check-out may be available upon request, subject to availability. Please contact us at least 24 hours in advance if you need to arrange alternative times.',
      },
      {
        question: 'What is your cancellation policy?',
        answer: 'We offer free cancellation up to 7 days before your arrival date for a full refund. Cancellations within 7 days of arrival are subject to a charge equal to the first night\'s stay. No-shows will be charged the full reservation amount.',
      },
      {
        question: 'Do you require a deposit to book?',
        answer: 'Yes, we require a deposit equal to the first night\'s stay to confirm your reservation. The remaining balance is due upon check-in. We accept all major credit cards.',
      },
      {
        question: 'Can I modify my reservation after booking?',
        answer: 'Yes, you can modify your reservation subject to availability. Please contact us directly at least 48 hours before your arrival to make changes. Changes made within 48 hours may be subject to rate adjustments.',
      },
      {
        question: 'How do I book the entire estate for a private event?',
        answer: 'For full property buyouts, please use our booking engine and select "Full Estate Buyout" or contact us directly. Full buyouts require a minimum 2-night stay and advance booking of at least 30 days. We\'re perfect for weddings, corporate retreats, and milestone celebrations.',
      },
    ],
  },
  {
    category: 'Amenities & Services',
    icon: '🏊',
    faqs: [
      {
        question: 'Does Hennessey Estate have a pool?',
        answer: 'Yes! We have a beautiful heated outdoor pool and spa open to all guests. The pool is open from 8:00 AM to 10:00 PM daily. Pool towels are provided. The pool area is surrounded by Victorian gardens, making it a perfect spot to relax after wine tasting.',
      },
      {
        question: 'Is breakfast included in the room rate?',
        answer: 'Yes, a chef-prepared gourmet breakfast is included with every stay. Breakfast is served daily from 8:30 AM to 10:00 AM in our historic tasting room with its original 19th-century tin ceiling. We can accommodate dietary restrictions with advance notice.',
      },
      {
        question: 'What time is the sauna available?',
        answer: 'Our traditional Finnish sauna is available from 7:00 AM to 10:00 PM daily for all guests. The sauna is located near the pool area and is the perfect way to unwind after a day of wine tasting.',
      },
      {
        question: 'Do you have WiFi?',
        answer: 'Yes, complimentary high-speed WiFi is available throughout the property, including in all guest rooms, the tasting room, and pool area.',
      },
      {
        question: 'What toiletries are provided?',
        answer: 'Each room is stocked with premium Molton Brown bath amenities, including shampoo, conditioner, body wash, and lotion. We also provide hairdryers, robes, and slippers.',
      },
      {
        question: 'Do you offer concierge services?',
        answer: 'Yes! Our concierge can help you arrange wine tours, restaurant reservations, spa appointments, hot air balloon rides, and more. We recommend reaching out at least a week before your stay for popular restaurants and experiences.',
      },
    ],
  },
  {
    category: 'Rooms & Accommodations',
    icon: '🛏️',
    faqs: [
      {
        question: 'How many rooms does Hennessey Estate have?',
        answer: 'We have 10 uniquely appointed guest rooms, including standard rooms, deluxe rooms, and the Carriage House suite. Each room features Victorian charm with modern amenities, including private en-suite bathrooms with walk-in showers.',
      },
      {
        question: 'Are the rooms air-conditioned?',
        answer: 'Yes, all rooms feature individual climate control with both air conditioning and heating, ensuring your comfort year-round.',
      },
      {
        question: 'What type of beds do you have?',
        answer: 'Our rooms feature a mix of king, queen, and some rooms with two queen beds. All beds feature premium luxury linens and are designed for maximum comfort. Please specify your bed preference when booking.',
      },
      {
        question: 'Are the bathrooms private?',
        answer: 'Yes, every guest room has a private en-suite bathroom with a walk-in shower. Some rooms feature soaking tubs. All bathrooms are modern with beautiful tilework while maintaining Victorian aesthetic.',
      },
      {
        question: 'Do you have accessible rooms?',
        answer: 'We have limited accessibility features in our historic Victorian property. Please contact us directly to discuss your specific needs and we\'ll do our best to accommodate you.',
      },
    ],
  },
  {
    category: 'Location & Getting Here',
    icon: '📍',
    faqs: [
      {
        question: 'How far is Hennessey Estate from downtown Napa?',
        answer: 'Hennessey Estate is just 3 blocks (0.2 miles) from downtown Napa, within easy walking distance of restaurants, wine tasting rooms, the Oxbow Public Market, and the Napa Valley Wine Train. It\'s about a 5-minute walk to the heart of downtown.',
      },
      {
        question: 'Is parking available?',
        answer: 'Yes! We offer complimentary on-site parking for all guests. No need to worry about finding street parking or paying for parking garages downtown.',
      },
      {
        question: 'How far is Hennessey Estate from San Francisco?',
        answer: 'We\'re approximately 1 hour from San Francisco via Highway 29, 45 minutes from Oakland International Airport (OAK), and about 1 hour 15 minutes from San Francisco International Airport (SFO).',
      },
      {
        question: 'Do you offer airport shuttles?',
        answer: 'We don\'t offer direct shuttle service, but we can recommend transportation companies like Evans Transportation or Pure Luxury Transportation. Many guests also use rideshare services like Uber or Lyft.',
      },
      {
        question: 'What restaurants are within walking distance?',
        answer: 'Over 50 restaurants are within a 10-minute walk, including Angèle (French), Morimoto (Japanese), Cole\'s Chop House (Steakhouse), Torc (Farm-to-table), and many more. Our concierge is happy to make recommendations and reservations.',
      },
    ],
  },
  {
    category: 'Policies & Special Requests',
    icon: '📋',
    faqs: [
      {
        question: 'Is Hennessey Estate pet-friendly?',
        answer: 'We are unable to accommodate pets at Hennessey Estate. This policy ensures a comfortable environment for all guests, including those with allergies. Service animals are welcome with proper documentation.',
      },
      {
        question: 'Is smoking allowed on the property?',
        answer: 'Hennessey Estate is a completely smoke-free property. Smoking is not permitted anywhere on the grounds, including outdoor areas. This includes e-cigarettes and vaping.',
      },
      {
        question: 'What is the minimum age for guests?',
        answer: 'Hennessey Estate welcomes guests of all ages, though our property is best suited for adults. Children under 18 must be accompanied by a parent or guardian. Please note that wine service is for guests 21 and over.',
      },
      {
        question: 'Can you accommodate dietary restrictions for breakfast?',
        answer: 'Absolutely! Our chef can accommodate vegetarian, vegan, gluten-free, and other dietary requirements. Please notify us of any allergies or restrictions at least 24 hours before your stay.',
      },
      {
        question: 'Do you host weddings or events?',
        answer: 'Yes! Our estate is perfect for intimate weddings, corporate retreats, milestone celebrations, and group getaways. Full property buyouts can accommodate up to 20 guests across our 10 rooms. Contact us for event pricing and availability.',
      },
    ],
  },
  {
    category: 'About the Property',
    icon: '🏛️',
    faqs: [
      {
        question: 'What is the history of Hennessey Estate?',
        answer: 'Built in 1889, Hennessey Estate was the residence of Dr. Edwin Z. Hennessey, Napa County\'s first physician. Dr. Hennessey was so beloved that Lake Hennessey—Napa\'s primary water source—was named in his honor. Our property is listed on the National Register of Historic Places.',
      },
      {
        question: 'Is the property listed as a historic landmark?',
        answer: 'Yes! Hennessey Estate is officially listed on the National Register of Historic Places. The property features original Victorian architecture, including the stunning 19th-century tin ceiling in our tasting room.',
      },
      {
        question: 'What architectural style is the property?',
        answer: 'Hennessey Estate is a Queen Anne Victorian with Stick-Eastlake influences, featuring intricate woodwork, period details, and beautiful gardens. The property has been carefully restored to preserve its historic character while adding modern comforts.',
      },
      {
        question: 'When was the property restored?',
        answer: 'The property underwent extensive restoration to transform it into a luxury bed and breakfast while preserving its historic integrity. We\'ve maintained original features like tin ceilings and woodwork while adding modern amenities like private bathrooms, a heated pool, and air conditioning.',
      },
    ],
  },
];

// Flatten FAQs for schema
const allFaqs = faqCategories.flatMap(cat => cat.faqs);

const FAQPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Set page meta tags
  usePageMeta({
    pageKey: 'faq',
    path: '/faq',
  });

  // Breadcrumb data
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ];

  // Toggle FAQ
  const toggleFaq = (categoryIndex, faqIndex) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setOpenFaq(openFaq === key ? null : key);
  };

  // Filter FAQs based on search
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="faq-page">
      {/* Schema Markup */}
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={allFaqs} />

      {/* Header */}
      <header className="faq-header">
        <div className="faq-header-content">
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
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about your stay at Hennessey Estate</p>
          
          {/* Search */}
          <div className="faq-search">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search FAQs"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </header>

      {/* Quick Links */}
      <nav className="faq-quick-links">
        <div className="quick-links-container">
          {faqCategories.map((category, i) => (
            <a key={i} href={`#category-${i}`} className="quick-link">
              <span className="quick-link-icon">{category.icon}</span>
              <span>{category.category}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="faq-content">
        {filteredCategories.length === 0 ? (
          <div className="no-results">
            <h2>No matching questions found</h2>
            <p>Try adjusting your search or <Link to="/contact">contact us</Link> directly.</p>
          </div>
        ) : (
          filteredCategories.map((category, catIndex) => (
            <section key={catIndex} id={`category-${catIndex}`} className="faq-category">
              <h2>
                <span className="category-icon">{category.icon}</span>
                {category.category}
              </h2>
              <div className="faq-list">
                {category.faqs.map((faq, faqIndex) => {
                  const isOpen = openFaq === `${catIndex}-${faqIndex}`;
                  return (
                    <div 
                      key={faqIndex} 
                      className={`faq-item ${isOpen ? 'open' : ''}`}
                    >
                      <button
                        className="faq-question"
                        onClick={() => toggleFaq(catIndex, faqIndex)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.question}</span>
                        <span className="faq-toggle">{isOpen ? '−' : '+'}</span>
                      </button>
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}

        {/* Still Have Questions */}
        <section className="faq-contact">
          <h2>Still Have Questions?</h2>
          <p>
            Can't find what you're looking for? We're here to help.
          </p>
          <div className="contact-options">
            <div className="contact-option">
              <span className="contact-icon">📧</span>
              <h3>Email Us</h3>
              <a href="mailto:info@hennesseyestate.com">info@hennesseyestate.com</a>
              <p>We respond within 24 hours</p>
            </div>
            <div className="contact-option">
              <span className="contact-icon">📱</span>
              <h3>Book Direct</h3>
              <Link to="/book" className="book-btn">Book Your Stay →</Link>
              <p>Best rate guaranteed</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="faq-footer">
        <div className="footer-content">
          <p>Hennessey Estate • 1727 Main Street, Napa, CA 94559</p>
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

export default FAQPage;
