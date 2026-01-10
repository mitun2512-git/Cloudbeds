import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const TermsOfService = () => {
  useEffect(() => {
    document.title = 'Terms of Service | Hennessey Estate';
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
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: January 10, 2026</p>

        <section>
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using the Hennessey Estate website (hennesseyestate.com) and 
            making reservations at our property, you agree to be bound by these Terms of 
            Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2>Reservation & Booking</h2>
          
          <h3>Booking Confirmation</h3>
          <p>
            A reservation is confirmed only when you receive a confirmation email from us 
            or our booking partner (Cloudbeds). Your credit card will be charged according 
            to the rate and policies displayed at the time of booking.
          </p>

          <h3>Rates & Pricing</h3>
          <p>
            All rates are quoted in US Dollars (USD) and are subject to applicable taxes 
            and fees. Rates vary by room type, season, and availability. Special offers 
            and promotions may have additional terms and conditions.
          </p>

          <h3>Minimum Stay</h3>
          <p>
            Minimum stay requirements may apply during holidays, special events, and peak 
            seasons. These requirements will be displayed during the booking process.
          </p>
        </section>

        <section>
          <h2>Cancellation Policy</h2>
          <p>Our standard cancellation policy is as follows:</p>
          <ul>
            <li><strong>5+ days before arrival:</strong> Full refund minus any non-refundable fees</li>
            <li><strong>Less than 5 days before arrival:</strong> First night's stay is non-refundable</li>
            <li><strong>No-show:</strong> Full stay amount is charged</li>
          </ul>
          <p>
            Special rates, promotional offers, and holiday bookings may have different 
            cancellation policies, which will be clearly stated at the time of booking.
          </p>
        </section>

        <section>
          <h2>Check-In & Check-Out</h2>
          <ul>
            <li><strong>Check-in:</strong> 3:00 PM</li>
            <li><strong>Check-out:</strong> 11:00 AM</li>
          </ul>
          <p>
            Early check-in and late check-out may be available upon request, subject to 
            availability and additional charges. Please contact us in advance to arrange.
          </p>
          <p>
            Valid government-issued photo identification is required at check-in. The 
            guest making the reservation must be present at check-in with the credit 
            card used for booking.
          </p>
        </section>

        <section>
          <h2>Guest Conduct</h2>
          <p>Guests are expected to:</p>
          <ul>
            <li>Treat the property, staff, and other guests with respect</li>
            <li>Keep noise to a reasonable level, especially after 10:00 PM</li>
            <li>Not smoke anywhere on the property (we are 100% smoke-free)</li>
            <li>Not bring pets (we are unable to accommodate pets)</li>
            <li>Not exceed the maximum occupancy for their room</li>
            <li>Report any damages or issues promptly</li>
          </ul>
          <p>
            We reserve the right to terminate a guest's stay without refund for violation 
            of these rules or behavior that disturbs other guests or damages the property.
          </p>
        </section>

        <section>
          <h2>Property Rules</h2>
          
          <h3>Pool, Spa & Sauna</h3>
          <p>
            Our pool, hot tub, and sauna facilities are for registered guests only. Pool 
            hours are from 8:00 AM to 10:00 PM. Children under 14 must be accompanied by 
            an adult. No glass containers are permitted in the pool area.
          </p>

          <h3>Breakfast</h3>
          <p>
            Complimentary chef-prepared breakfast is served daily from 8:00 AM to 9:30 AM 
            in our historic tasting room. Please inform us of any dietary restrictions or 
            allergies at the time of booking.
          </p>

          <h3>Parking</h3>
          <p>
            Complimentary on-site parking is available on a first-come, first-served basis. 
            We are not responsible for theft or damage to vehicles parked on the property.
          </p>
        </section>

        <section>
          <h2>Full Estate Buyouts</h2>
          <p>
            Private event bookings and full estate buyouts are subject to additional terms, 
            including:
          </p>
          <ul>
            <li>50% deposit required at time of booking</li>
            <li>Remaining balance due 30 days before arrival</li>
            <li>Security deposit may be required</li>
            <li>Custom cancellation policy applies</li>
          </ul>
          <p>
            Please contact us directly at info@hennesseyestate.com for full estate buyout 
            inquiries and detailed terms.
          </p>
        </section>

        <section>
          <h2>Liability</h2>
          <p>
            Hennessey Estate is not liable for any loss, damage, or injury to guests or 
            their property during their stay, except where caused by our negligence. 
            Guests are responsible for their own valuables and personal belongings.
          </p>
          <p>
            We are not responsible for any illness resulting from food allergies if guests 
            fail to inform us of their dietary restrictions.
          </p>
        </section>

        <section>
          <h2>Website Use</h2>
          <p>
            The content on this website is for informational purposes only. While we strive 
            to keep information accurate and up-to-date, we make no warranties about the 
            completeness, reliability, or accuracy of this information.
          </p>
          <p>
            Photos are representative of our property and rooms but may not reflect current 
            décor or specific room assignments.
          </p>
        </section>

        <section>
          <h2>Intellectual Property</h2>
          <p>
            All content on this website, including text, images, logos, and design, is the 
            property of Hennessey Estate and protected by copyright laws. You may not 
            reproduce, distribute, or use our content without written permission.
          </p>
        </section>

        <section>
          <h2>Governing Law</h2>
          <p>
            These Terms of Service are governed by the laws of the State of California. 
            Any disputes arising from these terms or your stay at Hennessey Estate shall 
            be resolved in the courts of Napa County, California.
          </p>
        </section>

        <section>
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes 
            will be effective immediately upon posting to the website. Your continued use 
            of our services constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at:
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

export default TermsOfService;
