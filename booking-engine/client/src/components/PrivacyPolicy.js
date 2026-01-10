import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | Hennessey Estate';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link to="/" className="legal-logo">
          <img src="/logo-white.png" alt="Hennessey Estate" />
        </Link>
        <Link to="/" className="back-link">← Back to Home</Link>
      </header>

      <main className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: January 10, 2026</p>

        <section>
          <h2>Introduction</h2>
          <p>
            Hennessey Estate ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you visit our website hennesseyestate.com and make reservations 
            at our bed and breakfast located at 1727 Main Street, Napa, CA 94559.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <p>When you make a reservation or contact us, we may collect:</p>
          <ul>
            <li>Name and contact information (email address, phone number)</li>
            <li>Billing and payment information</li>
            <li>Mailing address</li>
            <li>Dates of stay and room preferences</li>
            <li>Special requests or dietary requirements</li>
            <li>Government-issued ID (for check-in verification)</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>When you visit our website, we may automatically collect:</p>
          <ul>
            <li>IP address and browser type</li>
            <li>Device information</li>
            <li>Pages visited and time spent on our site</li>
            <li>Referring website addresses</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and manage your reservations</li>
            <li>Communicate with you about your stay</li>
            <li>Send confirmation emails and pre-arrival information</li>
            <li>Process payments securely</li>
            <li>Respond to your inquiries and requests</li>
            <li>Improve our website and guest experience</li>
            <li>Send promotional offers and newsletters (with your consent)</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party companies that help us operate our business, including payment processors (Stripe), booking systems (Cloudbeds), and email services</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2>Cookies and Tracking</h2>
          <p>
            Our website uses cookies and similar tracking technologies to enhance your 
            browsing experience. You can control cookie settings through your browser 
            preferences. Disabling cookies may affect some website functionality.
          </p>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect 
            your personal information against unauthorized access, alteration, disclosure, 
            or destruction. Payment information is processed securely through PCI-compliant 
            payment processors.
          </p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data in a portable format</li>
          </ul>
          <p>
            California residents have additional rights under the California Consumer 
            Privacy Act (CCPA). To exercise any of these rights, please contact us at 
            info@hennesseyestate.com.
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the 
            purposes for which it was collected, including to satisfy legal, accounting, 
            or reporting requirements. Reservation records are typically retained for 7 years.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            Our website is not intended for children under 13 years of age. We do not 
            knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of 
            any changes by posting the new Privacy Policy on this page and updating the 
            "Last Updated" date.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our privacy practices, 
            please contact us at:
          </p>
          <address>
            <strong>Hennessey Estate</strong><br />
            1727 Main Street<br />
            Napa, CA 94559<br />
            Email: <a href="mailto:info@hennesseyestate.com">info@hennesseyestate.com</a>
          </address>
        </section>
      </main>

      <footer className="legal-footer">
        <p>© 2026 Hennessey Estate. All rights reserved.</p>
        <div className="legal-footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
