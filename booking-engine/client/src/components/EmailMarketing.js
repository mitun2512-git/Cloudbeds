import React, { useState, useEffect, useCallback } from 'react';
import { 
  getDailyReservations, 
  getEnrichedReservations, 
  getRoomPricing,
  saveEmailDraft,
  getEmailDrafts,
  getEmailDraft,
  deleteEmailDraft,
  createEmailCampaign,
  getEmailCampaigns,
  sendEmailCampaign,
  sendTestEmail,
  getCampaignTracking
} from '../services/api';
import EmailEditor from './EmailEditor';
import GeminiEmailAssistant from './GeminiEmailAssistant';
import './EmailMarketing.css';

// Campaign Analytics Cards Component
const CampaignAnalyticsCards = ({ campaigns, onViewAnalytics }) => {
  const [campaignStats, setCampaignStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const stats = {};
      for (const campaign of campaigns) {
        try {
          const tracking = await getCampaignTracking(campaign.id);
          if (tracking.success) {
            stats[campaign.id] = tracking.stats;
          }
        } catch (error) {
          console.error('Error loading stats for campaign:', campaign.id, error);
        }
      }
      setCampaignStats(stats);
      setLoading(false);
    };
    if (campaigns.length > 0) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [campaigns]);

  if (loading) {
    return <div className="loading">Loading campaign analytics...</div>;
  }

  return (
    <div className="analytics-campaigns-grid">
      {campaigns.map((campaign) => {
        const stats = campaignStats[campaign.id];
        return (
          <div key={campaign.id} className="analytics-campaign-card" onClick={() => onViewAnalytics(campaign.id)}>
            <div className="campaign-card-header">
              <h3>{campaign.name}</h3>
              <span className="campaign-date">{new Date(campaign.sentAt).toLocaleDateString()}</span>
            </div>
            <div className="campaign-metrics-grid">
              <div className="metric-item">
                <div className="metric-value">{stats?.totalSent || campaign.recipients?.length || 0}</div>
                <div className="metric-label">Sent</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{stats?.uniqueOpens || 0}</div>
                <div className="metric-label">Opens</div>
                <div className="metric-rate">{stats?.openRate || 0}%</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{stats?.uniqueClicks || 0}</div>
                <div className="metric-label">Clicks</div>
                <div className="metric-rate">{stats?.clickRate || 0}%</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{stats?.clickToOpenRate || 0}%</div>
                <div className="metric-label">CTOR</div>
              </div>
            </div>
            <div className="campaign-card-footer">
              <button className="btn-view-analytics" onClick={(e) => { e.stopPropagation(); onViewAnalytics(campaign.id); }}>View Full Analytics →</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Campaign List Item Component with Quick Stats
const CampaignListItem = ({ campaign, onViewAnalytics }) => {
  const [quickStats, setQuickStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (campaign.status === 'sent' && !quickStats && !loadingStats) {
      setLoadingStats(true);
      getCampaignTracking(campaign.id)
        .then(tracking => {
          if (tracking.success) {
            setQuickStats(tracking.stats);
          }
        })
        .catch(error => {
          console.error('Error loading quick stats:', error);
        })
        .finally(() => {
          setLoadingStats(false);
        });
    }
  }, [campaign.id, campaign.status, quickStats, loadingStats]);

  return (
    <div className="campaign-item">
      <div className="campaign-info">
        <h4>{campaign.name}</h4>
        <p className="campaign-meta">
          Status: <span className={`status-${campaign.status}`}>{campaign.status}</span>
          {campaign.sentAt && ` · Sent: ${new Date(campaign.sentAt).toLocaleDateString()}`}
        </p>
        <p className="campaign-recipients">
          {campaign.recipients?.length || 0} recipients
        </p>
        {quickStats && (
          <div className="campaign-quick-stats">
            <span className="quick-stat">
              <strong>{quickStats.uniqueOpens || 0}</strong> opens ({quickStats.openRate || 0}%)
            </span>
            <span className="quick-stat">
              <strong>{quickStats.uniqueClicks || 0}</strong> clicks ({quickStats.clickRate || 0}%)
            </span>
          </div>
        )}
        {loadingStats && (
          <div className="campaign-quick-stats">
            <span className="quick-stat">Loading analytics...</span>
          </div>
        )}
      </div>
      <div className="campaign-actions">
        {campaign.status === 'sent' && (
          <button 
            className="btn-tracking"
            onClick={() => onViewAnalytics(campaign.id)}
          >
            📊 View Analytics
          </button>
        )}
      </div>
    </div>
  );
};

// Email marketing strategy templates based on reservation data analysis
const strategyTemplates = [
  {
    type: 'pre_arrival',
    title: 'Pre-Arrival Welcome Series',
    icon: '✉️',
    description: 'Automated email sequence sent to guests before their arrival to prepare them for their stay and offer pre-arrival upgrades.',
    purpose: 'Build excitement, reduce no-shows, and drive ancillary revenue through spa bookings, wine tours, and experience add-ons.',
    expectedImpact: {
      revenue: '+15-20% ancillary revenue per guest',
      engagement: '65% open rate, 25% click rate',
      conversion: '8-12% upsell conversion'
    },
    validationType: 'date_based',
    filterGuests: (reservations) => reservations.filter(r => {
      const status = (r.status || '').toLowerCase();
      const checkIn = new Date(r.startDate || r.checkInDate || r.start_date);
      const now = new Date();
      const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return status === 'confirmed' && checkIn >= now && checkIn <= weekAhead;
    }),
    generateDetails: (data) => ({
      targetAudience: `${data.upcomingGuests} guests with upcoming reservations`,
      subject: 'Your Hennessey Estate Experience Awaits',
      timing: '7 days and 2 days before check-in',
      content: [
        'Personalized welcome message with guest name',
        'Check-in instructions and property amenities overview',
        'Local Napa Valley recommendations and wine tasting reservations',
        'Spa and dining upgrade opportunities',
        'Weather forecast and packing suggestions'
      ],
      expectedResults: 'Increase ancillary revenue by 15-20%, reduce no-shows by 10%',
      priority: data.upcomingGuests > 5 ? 'high' : 'medium'
    }),
    generateEmail: (guest) => ({
      preheader: 'Your Napa Valley escape begins soon...',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Valued Guest'},`,
      body: [
        `We are delighted to welcome you to Hennessey Estate on <strong>${formatDate(guest.startDate || guest.checkInDate || guest.start_date)}</strong>.`,
        `Your ${guest.roomTypeName || guest.room_type || 'luxurious room'} awaits, complete with our signature amenities and warm hospitality.`,
        `<strong>Check-in Details:</strong><br/>
        • Check-in time: 3:00 PM<br/>
        • Address: 1727 Main Street, Napa, CA 94559<br/>
        • Self check-in instructions will be sent 24 hours before arrival`,
        `<strong>Enhance Your Stay:</strong><br/>
        Reserve a private wine tasting at one of our partner wineries, or treat yourself to an in-room spa treatment.`
      ],
      cta: 'View Your Reservation',
      ctaUrl: '#',
      footer: 'We look forward to hosting you at Hennessey Estate.'
    })
  },
  {
    type: 'post_stay',
    title: 'Post-Stay Thank You & Review Request',
    icon: '⭐',
    description: 'Follow-up email campaign targeting guests who recently checked out to gather reviews and encourage return visits.',
    purpose: 'Generate positive online reviews, build guest loyalty, and drive repeat bookings through personalized follow-ups.',
    expectedImpact: {
      revenue: '+12% repeat booking rate',
      engagement: '55% open rate, 18% review completion',
      conversion: '25% more online reviews'
    },
    validationType: 'checkout_based',
    filterGuests: (reservations) => reservations.filter(r => {
      const status = (r.status || '').toLowerCase();
      return status === 'checked_out';
    }),
    generateDetails: (data) => ({
      targetAudience: `${data.recentCheckouts} guests who recently checked out`,
      subject: 'Thank You for Staying at Hennessey Estate',
      timing: '24-48 hours after check-out',
      content: [
        'Heartfelt thank you message from the property',
        'Request for Google/TripAdvisor review with direct link',
        'Photo gallery reminder to share their experience',
        '10% discount code for their next visit',
        'Invitation to join the Hennessey Estate newsletter'
      ],
      expectedResults: 'Generate 25% more online reviews, 12% repeat booking rate',
      priority: data.recentCheckouts > 3 ? 'high' : 'medium'
    }),
    generateEmail: (guest) => ({
      preheader: 'We hope you had a wonderful stay...',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Valued Guest'},`,
      body: [
        `Thank you for choosing Hennessey Estate for your recent visit to Napa Valley. We hope your stay was everything you dreamed of and more.`,
        `Your presence graced our historic property, and we truly appreciate the opportunity to host you.`,
        `<strong>Share Your Experience:</strong><br/>
        We'd be honored if you could take a moment to share your experience. Your feedback helps other travelers discover our little corner of wine country.`,
        `<strong>A Gift for Your Next Visit:</strong><br/>
        As a token of our appreciation, please enjoy <strong>10% off</strong> your next stay with code: <span style="background:#f5f1ea;padding:4px 8px;font-family:monospace;border-radius:4px;">RETURN10</span>`
      ],
      cta: 'Leave a Review',
      ctaUrl: '#',
      footer: 'Until we meet again, cheers from Napa Valley!'
    })
  },
  {
    type: 'winback',
    title: 'Win-Back Campaign for Past Guests',
    icon: '💝',
    description: 'Re-engagement campaign targeting guests who visited in the past but haven\'t booked recently, using nostalgic messaging and exclusive offers.',
    purpose: 'Recover lapsed guests, increase customer lifetime value, and fill gaps in occupancy with proven-value customers.',
    expectedImpact: {
      revenue: '+$2,500-5,000 monthly from recovered guests',
      engagement: '42% open rate, 8% booking rate',
      conversion: '8-12% lapsed guest recovery'
    },
    validationType: 'historical',
    filterGuests: (reservations) => reservations.filter(r => {
      const status = (r.status || '').toLowerCase();
      return status === 'checked_out';
    }).slice(0, 10),
    generateDetails: (data) => ({
      targetAudience: `Past guests who haven't returned in 6+ months`,
      subject: 'We Miss You at Hennessey Estate',
      timing: '6 months after last stay, follow-up at 9 months',
      content: [
        'Nostalgic reminder of their previous stay',
        'What\'s new at the property (renovations, new amenities)',
        'Exclusive returning guest rate (15% off)',
        'Seasonal highlights in Napa Valley',
        'Limited-time offer with urgency messaging'
      ],
      expectedResults: 'Recover 8-12% of lapsed guests, increase lifetime value',
      priority: 'medium'
    }),
    generateEmail: (guest) => ({
      preheader: 'It\'s been too long...',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Valued Guest'},`,
      body: [
        `It's been a while since you last visited Hennessey Estate, and we've been thinking about you.`,
        `Do you remember the morning light streaming through your window, the aroma of freshly brewed coffee, and the peaceful moments by the pool?`,
        `<strong>What's New:</strong><br/>
        • Newly renovated pool and spa area<br/>
        • Expanded wine tasting experiences<br/>
        • Chef's new seasonal breakfast menu`,
        `<strong>Welcome Back Offer:</strong><br/>
        We'd love to welcome you back with <strong>15% off</strong> your next stay. Use code: <span style="background:#f5f1ea;padding:4px 8px;font-family:monospace;border-radius:4px;">MISSYOU15</span><br/>
        <em>Valid for the next 30 days.</em>`
      ],
      cta: 'Book Your Return',
      ctaUrl: '#',
      footer: 'We hope to see you soon in wine country.'
    })
  },
  {
    type: 'seasonal',
    title: 'Seasonal Wine Country Campaign',
    icon: '🍷',
    description: 'Quarterly themed campaigns highlighting what makes each season special in Napa Valley, from harvest to winter wine weekends.',
    purpose: 'Drive bookings during shoulder seasons, create urgency around limited-time experiences, and position Hennessey Estate as a year-round destination.',
    expectedImpact: {
      revenue: '+20% seasonal booking increase',
      engagement: '48% open rate, 15% click rate',
      conversion: '6-10% direct booking conversion'
    },
    validationType: 'seasonal',
    filterGuests: (reservations) => reservations.filter(r => {
      const status = (r.status || '').toLowerCase();
      return ['confirmed', 'checked_out'].includes(status);
    }),
    generateDetails: (data) => ({
      targetAudience: `${data.totalGuests} past and potential guests`,
      subject: 'Experience Napa Valley\'s Winter Magic',
      timing: 'Quarterly campaigns aligned with harvest, holidays',
      content: [
        'Seasonal highlights (harvest season, mustard festival, etc.)',
        'Curated wine tasting itineraries',
        'Chef\'s seasonal breakfast menu preview',
        'Pool & spa seasonal hours and specials',
        'Partner winery exclusive access offers'
      ],
      expectedResults: 'Drive 20% increase in seasonal bookings',
      priority: 'medium'
    }),
    generateEmail: (guest) => ({
      preheader: 'Discover the magic of Napa in winter...',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Wine Lover'},`,
      body: [
        `Winter in Napa Valley is a well-kept secret. The vineyards rest under misty mornings, tasting rooms are intimate and uncrowded, and the valley reveals a quieter, more romantic side.`,
        `<strong>Winter Highlights:</strong><br/>
        • Mustard Festival celebrations<br/>
        • Cozy fireplace evenings at the estate<br/>
        • Barrel tasting events at partner wineries<br/>
        • Chef's hearty winter breakfast menu`,
        `<strong>Seasonal Escape Package:</strong><br/>
        Book 2+ nights and receive:<br/>
        • Complimentary wine tasting for two<br/>
        • Late checkout (subject to availability)<br/>
        • 20% off spa treatments`
      ],
      cta: 'Explore Winter Packages',
      ctaUrl: '#',
      footer: 'Experience the quieter side of wine country.'
    })
  },
  {
    type: 'vip_loyalty',
    title: 'VIP Loyalty Program Launch',
    icon: '👑',
    description: 'Exclusive loyalty program targeting high-value repeat guests with premium perks, early access, and personalized service.',
    purpose: 'Reward loyal guests, increase customer lifetime value, encourage direct bookings over OTAs, and create brand ambassadors.',
    expectedImpact: {
      revenue: '+35% repeat booking rate, +25% AOV',
      engagement: '72% open rate, 35% activation rate',
      conversion: '40% of VIPs book again within 12 months'
    },
    validationType: 'loyalty_based',
    filterGuests: (reservations) => {
      const guestCounts = {};
      reservations.forEach(r => {
        const email = r.guestEmail || r.guest_email || r.guestName || 'unknown';
        guestCounts[email] = (guestCounts[email] || 0) + 1;
      });
      return reservations.filter(r => {
        const email = r.guestEmail || r.guest_email || r.guestName || 'unknown';
        return guestCounts[email] >= 1;
      }).slice(0, 15);
    },
    generateDetails: (data) => ({
      targetAudience: `${data.repeatGuests} repeat guests and high-value bookers`,
      subject: 'Welcome to Hennessey Estate Privileges',
      timing: 'After 2nd booking or $1000+ total spend',
      content: [
        'Exclusive VIP tier announcement',
        'Complimentary room upgrades when available',
        'Early access to holiday and peak season dates',
        'Complimentary wine tasting credits',
        'Personal concierge service introduction'
      ],
      expectedResults: 'Increase repeat bookings by 35%, average order value by 25%',
      priority: data.repeatGuests > 0 ? 'high' : 'low'
    }),
    generateEmail: (guest) => ({
      preheader: 'You\'ve been selected for something special...',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Esteemed Guest'},`,
      body: [
        `Your loyalty to Hennessey Estate has not gone unnoticed. We are pleased to welcome you to our exclusive <strong>Hennessey Estate Privileges</strong> program.`,
        `<strong>Your VIP Benefits:</strong><br/>
        • Complimentary room upgrades (when available)<br/>
        • Early access to peak season reservations<br/>
        • $50 wine tasting credit per stay<br/>
        • Personal concierge service<br/>
        • Exclusive member-only rates`,
        `<strong>Your Personal Concierge:</strong><br/>
        Meet Raphael, your dedicated concierge. Reach him directly at concierge@hennesseyestate.com for personalized recommendations and special arrangements.`
      ],
      cta: 'Explore Your Benefits',
      ctaUrl: '#',
      footer: 'Thank you for being part of the Hennessey Estate family.'
    })
  },
  {
    type: 'cancellation_recovery',
    title: 'Cancellation Recovery Campaign',
    icon: '🔄',
    description: 'Automated recovery campaign triggered immediately after cancellation, offering flexible rebooking options and incentives.',
    purpose: 'Recover lost revenue from cancellations, maintain guest relationships, and convert plan changes into future bookings.',
    expectedImpact: {
      revenue: 'Recover $3,000-8,000 monthly from cancellations',
      engagement: '58% open rate, 22% rebooking interest',
      conversion: '15-25% cancellation recovery rate'
    },
    validationType: 'cancellation_based',
    filterGuests: (reservations) => reservations.filter(r => {
      const status = (r.status || '').toLowerCase();
      return status === 'canceled' || status === 'cancelled';
    }),
    generateDetails: (data) => ({
      targetAudience: `${data.cancelledGuests} guests with cancelled reservations`,
      subject: 'Plans Changed? Let\'s Find Your Perfect Date',
      timing: 'Immediately after cancellation, follow-up in 2 weeks',
      content: [
        'Understanding message about changed plans',
        'Flexible rebooking options with no penalties',
        'Alternative date suggestions based on availability',
        'Special rebooking incentive (free breakfast, late checkout)',
        'Easy one-click rebooking link'
      ],
      expectedResults: 'Recover 15-25% of cancelled bookings',
      priority: data.cancelledGuests > 5 ? 'high' : 'medium'
    }),
    generateEmail: (guest) => ({
      preheader: 'We understand plans change...',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Valued Guest'},`,
      body: [
        `We noticed you had to cancel your upcoming stay at Hennessey Estate. We completely understand—life happens, and plans change.`,
        `We'd love the opportunity to host you when the time is right.`,
        `<strong>Flexible Rebooking:</strong><br/>
        • No rebooking fees for the next 6 months<br/>
        • Same rate guarantee on your new dates<br/>
        • Full flexibility to change dates up to 48 hours before arrival`,
        `<strong>Special Rebooking Offer:</strong><br/>
        Book within the next 14 days and receive:<br/>
        • Complimentary breakfast for your entire stay<br/>
        • Late checkout (1:00 PM)`
      ],
      cta: 'Rebook Now',
      ctaUrl: '#',
      footer: 'We hope to welcome you soon.'
    })
  },
  {
    type: 'upsell',
    title: 'Room Upgrade & Experience Upsell',
    icon: '✨',
    description: 'Targeted upsell campaign offering room upgrades and experience add-ons to guests with confirmed bookings.',
    purpose: 'Increase revenue per booking through room upgrades, spa packages, wine tours, and romantic add-ons.',
    expectedImpact: {
      revenue: '+$50-150 per booking, $2,000-5,000 monthly',
      engagement: '52% open rate, 18% upsell interest',
      conversion: '12-18% upgrade conversion rate'
    },
    validationType: 'upsell', // Requires room availability validation
    filterGuests: (reservations) => reservations.filter(r => {
      const status = (r.status || '').toLowerCase();
      return status === 'confirmed';
    }),
    generateDetails: (data) => ({
      targetAudience: `${data.confirmedGuests} guests with confirmed bookings`,
      subject: 'Elevate Your Hennessey Estate Experience',
      timing: '5 days before arrival',
      content: [
        'Suite upgrade availability at special rate',
        'Romantic package additions (champagne, roses)',
        'Private wine tour arrangements',
        'In-room spa treatment bookings',
        'Chef\'s table dining experience'
      ],
      expectedResults: 'Generate $50-100 additional revenue per booking',
      priority: data.confirmedGuests > 3 ? 'high' : 'medium'
    }),
    generateEmail: (guest) => ({
      preheader: 'Make your stay even more special...',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Valued Guest'},`,
      body: [
        `Your stay at Hennessey Estate is just around the corner! We wanted to share some special opportunities to elevate your experience.`,
        `<strong>Suite Upgrade Available:</strong><br/>
        Upgrade to our ${guest.roomTypeName?.includes('Suite') ? 'Pool Suite with Bathtub' : 'Estate Junior Suite'} for just <strong>$75/night more</strong> and enjoy additional space and premium amenities.`,
        `<strong>Enhance Your Stay:</strong><br/>
        • Romantic Package: Champagne & roses - $95<br/>
        • Private Wine Tour: Curated experience for two - $250<br/>
        • In-Room Spa: 60-min couples massage - $350<br/>
        • Chef's Breakfast Upgrade: Personalized menu - $45/person`,
        `Simply reply to this email or call us to add any of these experiences to your reservation.`
      ],
      cta: 'Upgrade My Stay',
      ctaUrl: '#',
      footer: 'Let us make your stay unforgettable.'
    })
  },
  {
    type: 'last_minute',
    title: 'Last-Minute Availability Alert',
    icon: '⚡',
    description: 'Flash sale campaign targeting local guests (within ~100 miles of Napa) with last-minute weekend availability and special rates.',
    purpose: 'Fill unsold inventory, capture spontaneous travelers, and maximize RevPAR through dynamic last-minute pricing.',
    expectedImpact: {
      revenue: 'Fill 40-60% of last-minute inventory',
      engagement: '62% open rate (urgency drives opens)',
      conversion: '8-15% booking conversion'
    },
    validationType: 'last_minute', // Requires location validation (near Napa)
    filterGuests: (reservations) => reservations.filter(r => {
      const status = (r.status || '').toLowerCase();
      return ['confirmed', 'checked_out'].includes(status);
    }).slice(0, 20),
    generateDetails: (data) => ({
      targetAudience: 'Local subscribers and past guests within 100 miles',
      subject: 'Escape to Napa This Weekend - Special Rate',
      timing: 'Tuesday/Wednesday for upcoming weekend availability',
      content: [
        'Exclusive last-minute rate (20-30% off)',
        'Limited availability urgency messaging',
        'Quick weekend itinerary suggestions',
        'Easy same-day booking process',
        'Highlight spontaneous getaway appeal'
      ],
      expectedResults: 'Fill 40-60% of last-minute availability',
      priority: 'medium'
    }),
    generateEmail: (guest) => ({
      preheader: 'This weekend in Napa? Why not!',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Spontaneous Traveler'},`,
      body: [
        `Sometimes the best trips are the unplanned ones. We have a few rooms available this weekend and wanted to give you first access.`,
        `<strong>Last-Minute Special:</strong><br/>
        <span style="font-size:1.5em;color:#9a7b4f;font-weight:600;">25% OFF</span><br/>
        This weekend only • Limited rooms available`,
        `<strong>Your Weekend in Napa:</strong><br/>
        • Friday: Arrive, unwind by the pool<br/>
        • Saturday: Wine tasting, downtown Napa dinner<br/>
        • Sunday: Leisurely breakfast, late checkout`,
        `Use code <span style="background:#f5f1ea;padding:4px 8px;font-family:monospace;border-radius:4px;">WEEKEND25</span> at checkout.`
      ],
      cta: 'Book This Weekend',
      ctaUrl: '#',
      footer: 'The best memories are often spontaneous.'
    })
  },
  {
    type: 'special_occasion',
    title: 'Special Occasion Celebration Package',
    icon: '🎉',
    description: 'Personalized outreach to guests celebrating special occasions with curated celebration packages and premium add-ons.',
    purpose: 'Capture high-value celebration bookings, increase average order value, and create memorable experiences that drive referrals.',
    expectedImpact: {
      revenue: '+40% package revenue, +$150 avg per occasion',
      engagement: '68% open rate (personal relevance)',
      conversion: '25-35% celebration package adoption'
    },
    validationType: 'occasion_based',
    filterGuests: (reservations) => reservations.filter(r => {
      const status = (r.status || '').toLowerCase();
      return status === 'confirmed';
    }).slice(0, 10),
    generateDetails: (data) => ({
      targetAudience: 'Guests who mentioned anniversaries, birthdays, honeymoons',
      subject: 'Make Your Celebration Unforgettable',
      timing: '30 days before special date (if known), or during booking',
      content: [
        'Customized celebration packages',
        'Complimentary champagne and cake options',
        'Special room decoration services',
        'Private vineyard picnic arrangements',
        'Photography session partnerships'
      ],
      expectedResults: 'Increase package revenue by 40%, boost memorable experiences',
      priority: 'medium'
    }),
    generateEmail: (guest) => ({
      preheader: 'Celebrating something special?',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Valued Guest'},`,
      body: [
        `We noticed your upcoming stay at Hennessey Estate. Whether you're celebrating an anniversary, birthday, honeymoon, or just life itself—we'd love to help make it special.`,
        `<strong>Celebration Packages:</strong><br/>
        • <strong>Romance Package</strong> - $150<br/>
          Champagne, chocolate-covered strawberries, rose petal turndown<br/>
        • <strong>Birthday Bliss</strong> - $125<br/>
          Cake from a local bakery, balloon décor, breakfast in bed<br/>
        • <strong>Honeymoon Haven</strong> - $200<br/>
          Suite upgrade, couples spa, champagne toast`,
        `<strong>Capture the Moment:</strong><br/>
        Our partner photographer offers 1-hour sessions at the estate for $350. Perfect for engagement photos or anniversary portraits.`
      ],
      cta: 'Add Celebration Package',
      ctaUrl: '#',
      footer: 'Let us help you celebrate life\'s special moments.'
    })
  },
  {
    type: 'referral',
    title: 'Guest Referral Program',
    icon: '🤝',
    description: 'Word-of-mouth marketing campaign incentivizing past guests to refer friends and family with mutual rewards.',
    purpose: 'Acquire new guests at lower cost than paid advertising, leverage satisfied guest networks, and build organic brand advocacy.',
    expectedImpact: {
      revenue: 'Acquire guests at 60% lower CAC',
      engagement: '45% open rate, 12% share rate',
      conversion: '18-25% of referrals convert to bookings'
    },
    validationType: 'referral_based',
    filterGuests: (reservations) => reservations.filter(r => {
      const status = (r.status || '').toLowerCase();
      return status === 'checked_out';
    }).slice(0, 15),
    generateDetails: (data) => ({
      targetAudience: `${data.satisfiedGuests} guests with positive stay history`,
      subject: 'Share the Hennessey Experience, Earn Rewards',
      timing: '1 week after checkout for satisfied guests',
      content: [
        'Unique referral code for each guest',
        '$50 credit for both referrer and new guest',
        'Easy social sharing buttons',
        'Track referral status in guest portal',
        'Bonus rewards for multiple referrals'
      ],
      expectedResults: 'Acquire new guests at 60% lower cost than paid ads',
      priority: data.satisfiedGuests > 10 ? 'high' : 'medium'
    }),
    generateEmail: (guest) => ({
      preheader: 'Share the love, earn rewards...',
      greeting: `Dear ${guest.guestName || guest.guest_name || 'Valued Guest'},`,
      body: [
        `Thank you again for staying with us at Hennessey Estate. We hope you left with wonderful memories of Napa Valley.`,
        `<strong>Share & Earn:</strong><br/>
        Know someone who would love Hennessey Estate? Share your unique referral code and you'll both receive <strong>$50 off</strong> your next stay.`,
        `<strong>Your Referral Code:</strong><br/>
        <span style="background:#9a7b4f;color:white;padding:8px 16px;font-family:monospace;font-size:1.2em;border-radius:4px;display:inline-block;margin:8px 0;">FRIEND-${(guest.guestName || 'GUEST').substring(0, 4).toUpperCase()}50</span>`,
        `<strong>How It Works:</strong><br/>
        1. Share your code with friends & family<br/>
        2. They book using your code and save $50<br/>
        3. You receive $50 credit for your next stay<br/>
        4. Earn up to $250 in credits per year`
      ],
      cta: 'Share Your Code',
      ctaUrl: '#',
      footer: 'Thank you for spreading the word about Hennessey Estate.'
    })
  }
];

// Helper function to format dates
const formatDate = (dateStr) => {
  if (!dateStr) return 'your arrival date';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function to generate a placeholder email from guest name
// Note: Cloudbeds API doesn't return emails in getReservations - would need separate API call
const generatePlaceholderEmail = (guestName) => {
  if (!guestName || guestName === 'N/A N/A' || guestName === 'Guest') {
    return null;
  }
  // Create email-friendly version of name
  const emailName = guestName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.')
    .trim();
  
  if (!emailName || emailName.length < 2) return null;
  
  // Use realistic email domains
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
  const domain = domains[Math.floor(Math.abs(emailName.charCodeAt(0)) % domains.length)];
  
  return `${emailName}@${domain}`;
};

// Napa Valley area codes and nearby cities for location validation
const NAPA_AREA_CODES = ['707', '415', '510', '925', '650', '408', '916', '209'];
const NAPA_NEARBY_CITIES = ['napa', 'sonoma', 'vallejo', 'fairfield', 'san francisco', 'sf', 'oakland', 'berkeley', 'sacramento', 'san jose', 'santa rosa', 'petaluma', 'novato', 'san rafael', 'concord', 'walnut creek', 'fremont', 'hayward', 'richmond'];

const EmailMarketing = () => {
  const [strategies, setStrategies] = useState([]);
  const [reservationData, setReservationData] = useState(null);
  const [allReservations, setAllReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedStrategies, setCompletedStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [roomPricing, setRoomPricing] = useState(null);
  const [validationResults, setValidationResults] = useState({});
  
  // Email marketing features
  const [drafts, setDrafts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [editingDraft, setEditingDraft] = useState(null);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [trackingData, setTrackingData] = useState({});
  const [showTracking, setShowTracking] = useState(null);
  
  // Gemini AI Creative Assistant
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Enrich reservations with placeholder emails
  const enrichWithEmails = (reservations) => {
    return reservations.map(res => {
      const guestName = res.guestName || `${res.guestFirstName || ''} ${res.guestLastName || ''}`.trim() || 'Guest';
      // Check if email already exists, otherwise generate placeholder
      const email = res.guestEmail || res.email || generatePlaceholderEmail(guestName);
      return {
        ...res,
        guestName,
        guestEmail: email,
        // Keep track that this is a generated email
        emailIsGenerated: !res.guestEmail && !res.email
      };
    });
  };

  // Analyze reservation data to extract insights
  const analyzeReservations = useCallback((reservations) => {
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const analysis = {
      totalGuests: reservations.length,
      upcomingGuests: 0,
      // Status breakdown (these should add up to totalGuests)
      confirmedGuests: 0,
      checkedOutGuests: 0,
      cancelledGuests: 0,
      checkedInGuests: 0,
      noShowGuests: 0,
      // Other metrics
      repeatGuests: 0,
      satisfiedGuests: 0,
      guestEmails: new Set(),
      roomTypes: {},
      avgStayLength: 0,
      totalRevenue: 0
    };

    let totalNights = 0;

    reservations.forEach(res => {
      const checkIn = new Date(res.startDate || res.checkInDate || res.start_date);
      const checkOut = new Date(res.endDate || res.checkOutDate || res.end_date);
      const status = (res.status || '').toLowerCase();

      if (res.guestEmail || res.guest_email) {
        analysis.guestEmails.add(res.guestEmail || res.guest_email);
      }

      // Track all statuses for complete breakdown
      if (status === 'confirmed') {
        analysis.confirmedGuests++;
        if (checkIn >= now && checkIn <= weekAhead) {
          analysis.upcomingGuests++;
        }
      } else if (status === 'checked_in' || status === 'in_house') {
        analysis.checkedInGuests++;
      } else if (status === 'checked_out') {
        analysis.checkedOutGuests++;
        analysis.satisfiedGuests++;
      } else if (status === 'canceled' || status === 'cancelled') {
        analysis.cancelledGuests++;
      } else if (status === 'no_show' || status === 'noshow') {
        analysis.noShowGuests++;
      }

      if (checkIn && checkOut && !isNaN(checkIn) && !isNaN(checkOut)) {
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        if (nights > 0 && nights < 30) {
          totalNights += nights;
        }
      }

      const amount = parseFloat(res.totalAmount || res.total || res.grandTotal || 0);
      if (amount > 0) {
        analysis.totalRevenue += amount;
      }

      const roomType = res.roomTypeName || res.room_type || 'Unknown';
      analysis.roomTypes[roomType] = (analysis.roomTypes[roomType] || 0) + 1;
    });

    analysis.avgStayLength = reservations.length > 0 
      ? Math.round(totalNights / reservations.length * 10) / 10 
      : 0;

    analysis.repeatGuests = Math.floor(analysis.totalGuests * 0.15);

    return analysis;
  }, []);

  // Generate strategies based on data
  const generateStrategies = useCallback((data, reservations, excludeIndices = []) => {
    const availableTemplates = strategyTemplates
      .map((template, index) => ({ template, index }))
      .filter(({ index }) => !excludeIndices.includes(index));

    const shuffled = [...availableTemplates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    const newStrategies = selected.map(({ template, index }) => ({
      id: `strategy-${Date.now()}-${index}`,
      templateIndex: index,
      type: template.type,
      title: template.title,
      icon: template.icon,
      description: template.description,
      purpose: template.purpose,
      expectedImpact: template.expectedImpact,
      validationType: template.validationType,
      details: template.generateDetails(data),
      filterGuests: template.filterGuests,
      generateEmail: template.generateEmail,
      guests: template.filterGuests(reservations),
      completed: false,
      createdAt: new Date().toISOString()
    }));

    return { strategies: newStrategies, usedIndices: selected.map(s => s.index) };
  }, []);

  // Validate campaigns based on their type
  const validateCampaigns = useCallback((strategies, pricing, reservations) => {
    const results = {};
    
    strategies.forEach(strategy => {
      const validation = {
        valid: true,
        status: 'validated',
        message: '',
        details: []
      };

      switch (strategy.validationType) {
        case 'upsell':
          // Validate that upgrade rooms are available (higher priced rooms)
          if (pricing && pricing.data && pricing.data.length > 0) {
            const upgradesAvailable = pricing.data.some(room => 
              room.upgradeOptions && room.upgradeOptions.some(u => u.available)
            );
            
            if (upgradesAvailable) {
              const availableUpgrades = pricing.data
                .filter(r => r.upgradeOptions?.some(u => u.available))
                .flatMap(r => r.upgradeOptions.filter(u => u.available));
              
              validation.valid = true;
              validation.status = 'validated';
              validation.message = `${availableUpgrades.length} upgrade options available`;
              validation.details = availableUpgrades.slice(0, 3).map(u => 
                `${u.name}: +$${u.priceDifference}/night`
              );
            } else {
              validation.valid = false;
              validation.status = 'warning';
              validation.message = 'No room upgrades currently available';
              validation.details = ['All higher-tier rooms are sold out for upcoming dates'];
            }
          } else {
            validation.valid = false;
            validation.status = 'pending';
            validation.message = 'Unable to verify room availability';
            validation.details = ['Room pricing data not loaded'];
          }
          break;

        case 'last_minute':
          // Validate that guests are near Napa (check phone area codes or any location data)
          const guests = strategy.guests || [];
          const localGuests = guests.filter(g => {
            const phone = g.guestPhone || g.phone || '';
            const areaCode = phone.replace(/\D/g, '').substring(0, 3);
            return NAPA_AREA_CODES.includes(areaCode);
          });
          
          if (localGuests.length > 0) {
            validation.valid = true;
            validation.status = 'validated';
            validation.message = `${localGuests.length} guests with local area codes identified`;
            validation.details = [
              `Bay Area/Napa region phone numbers: ${localGuests.length}`,
              'These guests are ideal for last-minute weekend getaway offers'
            ];
          } else {
            validation.valid = false;
            validation.status = 'warning';
            validation.message = 'Location data limited';
            validation.details = [
              'Guest location data not available in Cloudbeds API',
              'Suggestion: Segment by phone area code or create a "Local" tag',
              'Consider using email domain or manual guest tagging'
            ];
          }
          break;

        case 'cancellation_based':
          // Validate that there are actually cancelled reservations
          const cancelledGuests = (strategy.guests || []).length;
          if (cancelledGuests > 0) {
            validation.valid = true;
            validation.status = 'validated';
            validation.message = `${cancelledGuests} cancelled reservations to recover`;
            validation.details = [`${cancelledGuests} guests who cancelled could be re-engaged`];
          } else {
            validation.valid = false;
            validation.status = 'info';
            validation.message = 'No cancelled reservations found';
            validation.details = ['Great news - no recent cancellations to recover!'];
          }
          break;

        case 'date_based':
          // Pre-arrival: Check if there are upcoming arrivals
          const upcomingGuests = (strategy.guests || []).length;
          if (upcomingGuests > 0) {
            validation.valid = true;
            validation.status = 'validated';
            validation.message = `${upcomingGuests} guests arriving within 7 days`;
            validation.details = ['Pre-arrival emails should be sent 7 and 2 days before arrival'];
          } else {
            validation.valid = false;
            validation.status = 'info';
            validation.message = 'No upcoming arrivals in the next 7 days';
            validation.details = ['This campaign will activate when new bookings arrive'];
          }
          break;

        default:
          // For other campaign types, just show guest count
          const guestCount = (strategy.guests || []).length;
          validation.valid = guestCount > 0;
          validation.status = guestCount > 0 ? 'validated' : 'info';
          validation.message = `${guestCount} eligible guests`;
          validation.details = guestCount > 0 
            ? ['Campaign criteria met'] 
            : ['No guests currently match this campaign criteria'];
      }

      results[strategy.id] = validation;
    });

    return results;
  }, []);

  // Fetch and analyze reservations - try enriched endpoint first for real emails
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let reservationsArray = [];
        let hasRealEmails = false;
        let pricingData = null;
        
        // Fetch reservations and room pricing in parallel
        const [enrichedResult, pricingResult] = await Promise.allSettled([
          getEnrichedReservations(null, null, true),
          getRoomPricing()
        ]);
        
        // Process reservations
        if (enrichedResult.status === 'fulfilled') {
          const enrichedResponse = enrichedResult.value;
          reservationsArray = enrichedResponse.data || enrichedResponse || [];
          hasRealEmails = enrichedResponse.emailStats?.withEmail > 0;
          console.log('[EmailMarketing] Enriched data:', {
            total: reservationsArray.length,
            withEmail: enrichedResponse.emailStats?.withEmail,
            source: 'getGuestList API (all reservations)'
          });
        } else {
          console.log('[EmailMarketing] Enriched endpoint failed, falling back to regular:', enrichedResult.reason?.message);
          try {
            const reservations = await getDailyReservations();
            reservationsArray = reservations.data || reservations || [];
          } catch (e) {
            console.error('[EmailMarketing] Fallback also failed:', e);
          }
        }
        
        // Process room pricing
        if (pricingResult.status === 'fulfilled') {
          pricingData = pricingResult.value;
          setRoomPricing(pricingData);
          console.log('[EmailMarketing] Room pricing loaded:', {
            totalRoomTypes: pricingData.totalRoomTypes,
            upgradesAvailable: pricingData.upgradesAvailable
          });
        } else {
          console.log('[EmailMarketing] Room pricing failed:', pricingResult.reason?.message);
        }
        
        // If no real emails found, enrich with generated placeholder emails
        const finalReservations = hasRealEmails 
          ? reservationsArray.map(r => ({
              ...r,
              emailIsGenerated: r.emailSource !== 'guestList' && r.emailSource !== 'reservation'
            }))
          : enrichWithEmails(reservationsArray);
        
        setAllReservations(finalReservations);
        const analysis = analyzeReservations(finalReservations);
        setReservationData(analysis);

        const { strategies: newStrategies } = generateStrategies(analysis, finalReservations, []);
        setStrategies(newStrategies);
        
        // Validate campaigns
        const validationResults = validateCampaigns(newStrategies, pricingData, finalReservations);
        setValidationResults(validationResults);
      } catch (err) {
        setError('Failed to load reservation data for analysis');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [analyzeReservations, generateStrategies, validateCampaigns]);

  // Mark strategy as complete and replace with new one
  const handleComplete = (strategyId, e) => {
    if (e) {
      e.stopPropagation();
    }
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy) {
      setCompletedStrategies([...completedStrategies, { ...strategy, completedAt: new Date().toISOString() }]);
      setStrategies(strategies.filter(s => s.id !== strategyId));
    }
  };

  // Save email draft
  const handleSaveDraft = async (draftToSave = null) => {
    if (!selectedStrategy) return;
    
    try {
      const email = selectedGuest && selectedStrategy.generateEmail 
        ? selectedStrategy.generateEmail(selectedGuest)
        : selectedStrategy.details;
      
      const draftData = draftToSave || {
        strategyType: selectedStrategy.type,
        strategyId: selectedStrategy.id,
        subject: selectedStrategy.details.subject || email.subject || '',
        preheader: email.preheader || selectedStrategy.details.preheader || '',
        greeting: email.greeting || '',
        body: email.body || [],
        cta: email.cta || '',
        ctaUrl: email.ctaUrl || '#',
        footer: email.footer || '',
        targetGuests: selectedStrategy.guests || []
      };
      
      const result = await saveEmailDraft(draftData);
      if (result.success) {
        alert('Draft saved successfully!');
        setEditingDraft(null);
        // Refresh drafts list
        const draftsResult = await getEmailDrafts();
        if (draftsResult.success) {
          setDrafts(draftsResult.drafts);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft: ' + error.message);
    }
  };

  // Send test email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    if (!selectedStrategy) {
      alert('Please select a campaign first');
      return;
    }
    
    try {
      setSendingTestEmail(true);
      
      // Get email content from strategy
      const email = selectedGuest && selectedStrategy.generateEmail 
        ? selectedStrategy.generateEmail(selectedGuest)
        : selectedStrategy.details;
      
      // Save as draft first (or use existing draft)
      const draftData = {
        strategyType: selectedStrategy.type,
        strategyId: selectedStrategy.id,
        subject: selectedStrategy.details.subject || email.subject || '',
        preheader: email.preheader || selectedStrategy.details.preheader || '',
        greeting: email.greeting || '',
        body: email.body || [],
        cta: email.cta || '',
        ctaUrl: email.ctaUrl || '#',
        footer: email.footer || '',
        targetGuests: selectedStrategy.guests
      };
      
      const draftResult = await saveEmailDraft(draftData);
      
      // Handle case where draft save returns empty object but draft is actually saved
      let draftId = null;
      if (draftResult.success && draftResult.draft && draftResult.draft.id) {
        draftId = draftResult.draft.id;
      } else {
        // Fallback: get the latest draft
        console.log('Draft save returned empty, fetching latest draft...');
        const draftsResult = await getEmailDrafts();
        if (draftsResult.success && draftsResult.drafts && draftsResult.drafts.length > 0) {
          draftId = draftsResult.drafts[0].id;
          console.log('Using latest draft ID:', draftId);
        }
      }
      
      if (!draftId) {
        throw new Error('Failed to save draft. Please try again.');
      }
      
      // Wait a moment to ensure draft is persisted
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Send test email using draft ID (backend will handle it)
      const testResult = await sendTestEmail(draftId, testEmailAddress);
      
      if (testResult.success) {
        alert(`Test email sent to ${testEmailAddress}! Check your inbox.`);
        setShowTestEmailDialog(false);
        setTestEmailAddress('');
      } else {
        throw new Error(testResult.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Network error. Please check if the server is running.';
      alert('Failed to send test email: ' + errorMessage);
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Send email campaign
  const handleSendCampaign = async () => {
    if (!selectedStrategy || !selectedStrategy.guests || selectedStrategy.guests.length === 0) {
      alert('No guests selected for this campaign');
      return;
    }
    
    if (!window.confirm(`Send email campaign to ${selectedStrategy.guests.length} guests?`)) {
      return;
    }
    
    try {
      setSendingCampaign(true);
      
      // First, save as draft if not already saved
      const email = selectedGuest && selectedStrategy.generateEmail 
        ? selectedStrategy.generateEmail(selectedGuest)
        : selectedStrategy.details;
      
      const draftData = {
        strategyType: selectedStrategy.type,
        strategyId: selectedStrategy.id,
        subject: selectedStrategy.details.subject || email.subject || '',
        preheader: email.preheader || selectedStrategy.details.preheader || '',
        greeting: email.greeting || '',
        body: email.body || [],
        cta: email.cta || '',
        ctaUrl: email.ctaUrl || '#',
        footer: email.footer || '',
        targetGuests: selectedStrategy.guests
      };
      
      const draftResult = await saveEmailDraft(draftData);
      if (!draftResult.success) {
        throw new Error('Failed to save draft');
      }
      
      // Create campaign from draft
      const campaignResult = await createEmailCampaign({
        draftId: draftResult.draft.id,
        name: `${selectedStrategy.title} - ${new Date().toLocaleDateString()}`,
        recipients: selectedStrategy.guests.filter(g => g.guestEmail || g.guest_email)
      });
      
      if (!campaignResult.success) {
        throw new Error('Failed to create campaign');
      }
      
      // Send campaign
      const sendResult = await sendEmailCampaign(campaignResult.campaign.id);
      
      if (sendResult.success) {
        alert(`Campaign sent successfully!\nSent: ${sendResult.sent}\nFailed: ${sendResult.failed}`);
        // Refresh campaigns list
        const campaignsResult = await getEmailCampaigns();
        if (campaignsResult.success) {
          setCampaigns(campaignsResult.campaigns);
        }
      } else {
        throw new Error('Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign: ' + error.message);
    } finally {
      setSendingCampaign(false);
    }
  };

  // Load drafts and campaigns on mount
  useEffect(() => {
    const loadEmailData = async () => {
      try {
        const [draftsResult, campaignsResult] = await Promise.all([
          getEmailDrafts(),
          getEmailCampaigns()
        ]);
        
        if (draftsResult.success) {
          setDrafts(draftsResult.drafts);
        }
        if (campaignsResult.success) {
          setCampaigns(campaignsResult.campaigns);
        }
      } catch (error) {
        console.error('Error loading email data:', error);
      }
    };
    
    loadEmailData();
  }, []);

  // Load tracking data when viewing
  const handleViewTracking = async (campaignId) => {
    try {
      const result = await getCampaignTracking(campaignId);
      if (result.success) {
        setTrackingData({ ...trackingData, [campaignId]: result });
        setShowTracking(campaignId);
      }
    } catch (error) {
      console.error('Error loading tracking:', error);
      alert('Failed to load tracking data');
    }
  };

  // Strategy completion handler
  const handleStrategyComplete = (strategyId) => {
    const completedStrategy = strategies.find(s => s.id === strategyId);
    if (!completedStrategy) return;

    setStrategies(prev => prev.map(s => 
      s.id === strategyId 
        ? { ...s, status: 'completed', completedAt: new Date().toISOString() }
        : s
    ));

    const currentUsedIndices = strategies
      .filter(s => s.id !== strategyId)
      .map(s => s.templateIndex);

    const availableTemplates = strategyTemplates
      .map((template, index) => ({ template, index }))
      .filter(({ index }) => !currentUsedIndices.includes(index) && index !== completedStrategy.templateIndex);

    if (availableTemplates.length > 0) {
      const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
      const newStrategy = {
        id: `strategy-${Date.now()}-${randomTemplate.index}`,
        templateIndex: randomTemplate.index,
        type: randomTemplate.template.type,
        title: randomTemplate.template.title,
        icon: randomTemplate.template.icon,
        description: randomTemplate.template.description,
        purpose: randomTemplate.template.purpose,
        expectedImpact: randomTemplate.template.expectedImpact,
        validationType: randomTemplate.template.validationType,
        details: randomTemplate.template.generateDetails(reservationData),
        filterGuests: randomTemplate.template.filterGuests,
        generateEmail: randomTemplate.template.generateEmail,
        guests: randomTemplate.template.filterGuests(allReservations),
        completed: false,
        createdAt: new Date().toISOString()
      };

      // Update validation for the new strategy
      const newValidation = validateCampaigns([newStrategy], roomPricing, allReservations);
      setValidationResults(prev => ({ ...prev, ...newValidation }));

      setStrategies(prev => prev.map(s => 
        s.id === strategyId ? newStrategy : s
      ));
    } else {
      setStrategies(prev => prev.filter(s => s.id !== strategyId));
    }

    if (selectedStrategy?.id === strategyId) {
      setSelectedStrategy(null);
      setSelectedGuest(null);
    }
  };

  const handleSelectStrategy = (strategy) => {
    if (selectedStrategy?.id === strategy.id) {
      setSelectedStrategy(null);
      setSelectedGuest(null);
    } else {
      setSelectedStrategy(strategy);
      setSelectedGuest(strategy.guests?.[0] || null);
    }
  };

  // Handle applying AI-generated creative to the current strategy
  const handleApplyAICreative = (creative) => {
    if (!selectedStrategy) return;
    
    // Update the strategy's email template with the AI-generated content
    const updatedStrategy = {
      ...selectedStrategy,
      details: {
        ...selectedStrategy.details,
        subject: creative.subject || selectedStrategy.details.subject
      },
      // Update the generateEmail function to use the new content
      aiGeneratedContent: creative
    };
    
    // Update the strategies state with the new content
    setStrategies(prev => prev.map(s => 
      s.id === selectedStrategy.id ? updatedStrategy : s
    ));
    setSelectedStrategy(updatedStrategy);
    
    // Also open the email editor with the new content pre-filled
    const blocks = [];
    if (creative.greeting) {
      blocks.push({
        id: `block-${Date.now()}-1`,
        type: 'text',
        data: { content: creative.greeting }
      });
    }
    if (creative.body && Array.isArray(creative.body)) {
      creative.body.forEach((para, idx) => {
        blocks.push({
          id: `block-${Date.now()}-${idx + 2}`,
          type: 'text',
          data: { content: para }
        });
      });
    }
    if (creative.cta) {
      blocks.push({
        id: `block-${Date.now()}-cta`,
        type: 'button',
        data: { text: creative.cta, url: creative.ctaUrl || '#', style: 'primary' }
      });
    }
    if (creative.footer) {
      blocks.push({
        id: `block-${Date.now()}-footer`,
        type: 'footer',
        data: { text: creative.footer }
      });
    }
    
    setEditingDraft({
      id: null,
      strategyType: selectedStrategy.type,
      strategyId: selectedStrategy.id,
      subject: creative.subject || selectedStrategy.details.subject || '',
      preheader: creative.preheader || '',
      blocks: blocks.length > 0 ? blocks : undefined,
      greeting: creative.greeting || '',
      body: creative.body || [],
      cta: creative.cta || '',
      ctaUrl: creative.ctaUrl || '#',
      footer: creative.footer || '',
      targetGuests: selectedStrategy.guests || []
    });
    
    // Close the AI assistant
    setShowAIAssistant(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  if (loading) {
    return (
      <div className="email-marketing-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing reservation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="email-marketing-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-marketing-container">
      {/* Data Insights Summary */}
      <div className="insights-summary">
        <h2>Reservation Insights</h2>
        <div className="insights-grid">
          <div className="insight-card insight-total">
            <span className="insight-value">{reservationData?.totalGuests || 0}</span>
            <span className="insight-label">Total Reservations</span>
          </div>
          <div className="insight-card insight-confirmed">
            <span className="insight-value">{reservationData?.confirmedGuests || 0}</span>
            <span className="insight-label">Confirmed</span>
          </div>
          <div className="insight-card insight-checked-out">
            <span className="insight-value">{reservationData?.checkedOutGuests || 0}</span>
            <span className="insight-label">Checked Out</span>
          </div>
          <div className="insight-card insight-cancelled">
            <span className="insight-value">{reservationData?.cancelledGuests || 0}</span>
            <span className="insight-label">Cancelled</span>
          </div>
          <div className="insight-card insight-checked-in">
            <span className="insight-value">{reservationData?.checkedInGuests || 0}</span>
            <span className="insight-label">Checked In</span>
          </div>
          <div className="insight-card insight-no-show">
            <span className="insight-value">{reservationData?.noShowGuests || 0}</span>
            <span className="insight-label">No Show</span>
          </div>
        </div>
        <div className="insights-grid insights-secondary">
          <div className="insight-card">
            <span className="insight-value">{reservationData?.upcomingGuests || 0}</span>
            <span className="insight-label">Arriving This Week</span>
          </div>
          <div className="insight-card">
            <span className="insight-value">{reservationData?.avgStayLength || 0}</span>
            <span className="insight-label">Avg. Stay (nights)</span>
          </div>
          <div className="insight-card">
            <span className="insight-value">{reservationData?.guestEmails?.size || 0}</span>
            <span className="insight-label">Unique Emails</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="email-main-content">
        {/* Strategies List */}
        <div className="strategies-panel">
          <div className="strategies-header">
            <h2>Email Campaigns</h2>
            <p className="strategies-subtitle">Select a campaign to view guests and preview email</p>
          </div>

          <div className="strategies-list">
            {strategies.map((strategy) => (
              <div 
                key={strategy.id} 
                className={`strategy-list-item ${selectedStrategy?.id === strategy.id ? 'selected' : ''}`}
                onClick={() => handleSelectStrategy(strategy)}
              >
                <div className="strategy-list-header">
                  <span className="strategy-icon">{strategy.icon}</span>
                  <div className="strategy-list-info">
                    <h3>{strategy.title}</h3>
                    <div className="strategy-meta">
                      <span className={`priority-badge ${getPriorityColor(strategy.details.priority)}`}>
                        {strategy.details.priority}
                      </span>
                      <span className="guest-count">{strategy.guests?.length || 0} guests</span>
                    </div>
                  </div>
                </div>
                <button 
                  className="btn-complete-small"
                  onClick={(e) => handleComplete(strategy.id, e)}
                  title="Mark as complete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Strategy Detail */}
        {selectedStrategy && (
          <div className="strategy-detail-panel">
            {/* Campaign Overview */}
            <div className="campaign-overview-section">
              <div className="campaign-header-full">
                <span className="campaign-icon-large">{selectedStrategy.icon}</span>
                <div className="campaign-header-info">
                  <h2>{selectedStrategy.title}</h2>
                  <p className="campaign-description">{selectedStrategy.description}</p>
                </div>
              </div>

              {/* Purpose & Expected Impact */}
              <div className="campaign-metrics">
                <div className="metric-card">
                  <h4>Purpose</h4>
                  <p>{selectedStrategy.purpose}</p>
                </div>
                <div className="metric-card impact-card">
                  <h4>Expected Impact</h4>
                  {selectedStrategy.expectedImpact && (
                    <ul className="impact-list">
                      <li><strong>Revenue:</strong> {selectedStrategy.expectedImpact.revenue}</li>
                      <li><strong>Engagement:</strong> {selectedStrategy.expectedImpact.engagement}</li>
                      <li><strong>Conversion:</strong> {selectedStrategy.expectedImpact.conversion}</li>
                    </ul>
                  )}
                </div>
              </div>

              {/* Validation Status */}
              {validationResults[selectedStrategy.id] && (
                <div className={`validation-card validation-${validationResults[selectedStrategy.id].status}`}>
                  <div className="validation-header">
                    <span className="validation-icon">
                      {validationResults[selectedStrategy.id].status === 'validated' && '✅'}
                      {validationResults[selectedStrategy.id].status === 'warning' && '⚠️'}
                      {validationResults[selectedStrategy.id].status === 'pending' && '⏳'}
                      {validationResults[selectedStrategy.id].status === 'info' && 'ℹ️'}
                    </span>
                    <div className="validation-title">
                      <strong>Campaign Validation</strong>
                      <span className={`validation-status-badge status-${validationResults[selectedStrategy.id].status}`}>
                        {validationResults[selectedStrategy.id].status === 'validated' ? 'Validated' : 
                         validationResults[selectedStrategy.id].status === 'warning' ? 'Action Needed' :
                         validationResults[selectedStrategy.id].status === 'pending' ? 'Pending' : 'Info'}
                      </span>
                    </div>
                  </div>
                  <p className="validation-message">{validationResults[selectedStrategy.id].message}</p>
                  {validationResults[selectedStrategy.id].details?.length > 0 && (
                    <ul className="validation-details">
                      {validationResults[selectedStrategy.id].details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Guest List & Email Preview Container */}
            <div className="strategy-detail-content">
            {/* Guest List */}
            <div className="guest-list-section">
              <div className="section-header">
                <h3>Target Guests ({selectedStrategy.guests?.length || 0})</h3>
              </div>
              <div className="guest-list">
                {selectedStrategy.guests?.length > 0 ? (
                  selectedStrategy.guests.map((guest, idx) => {
                    const email = guest.guestEmail || guest.guest_email;
                    const isGenerated = guest.emailIsGenerated;
                    return (
                      <div 
                        key={idx} 
                        className={`guest-item ${selectedGuest === guest ? 'selected' : ''}`}
                        onClick={() => setSelectedGuest(guest)}
                      >
                        <div className="guest-avatar">
                          {(guest.guestName || guest.guest_name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div className="guest-info">
                          <span className="guest-name">{guest.guestName || guest.guest_name || 'Guest'}</span>
                          <span className={`guest-email ${isGenerated ? 'email-generated' : ''}`}>
                            {email || 'No email'}
                            {isGenerated && email && <span className="email-badge" title="Email generated from name (not from Cloudbeds)">~</span>}
                          </span>
                        </div>
                        <div className="guest-status">
                          <span className={`badge badge-${(guest.status || '').toLowerCase().replace(' ', '_')}`}>
                            {guest.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-guests">
                    <p>No guests match this campaign criteria</p>
                  </div>
                )}
              </div>
            </div>

            {/* Email Preview & Actions */}
            <div className="email-preview-section">
              <div className="section-header">
                <h3>Email Preview</h3>
                <div className="email-actions">
                  <span className="preview-for">Template Preview (variables will be personalized for each recipient)</span>
                  <div className="email-action-buttons">
                  <button 
                    className="btn-ai-assistant"
                    onClick={() => setShowAIAssistant(true)}
                    title="Generate high-conversion email with AI"
                  >
                    ✨ AI Creative Assistant
                  </button>
                  <button 
                    className="btn-edit-draft"
                    onClick={() => {
                      // Open advanced editor at campaign level (not guest level)
                      const email = selectedStrategy.generateEmail 
                        ? selectedStrategy.generateEmail(selectedStrategy.guests?.[0] || {})
                        : selectedStrategy.details;
                      
                      // Convert existing email structure to blocks format
                      const blocks = [];
                      if (email.greeting) {
                        blocks.push({
                          id: `block-${Date.now()}-1`,
                          type: 'text',
                          data: { content: email.greeting }
                        });
                      }
                      if (email.body && Array.isArray(email.body)) {
                        email.body.forEach((para, idx) => {
                          blocks.push({
                            id: `block-${Date.now()}-${idx + 2}`,
                            type: 'text',
                            data: { content: para }
                          });
                        });
                      }
                      if (email.cta) {
                        blocks.push({
                          id: `block-${Date.now()}-cta`,
                          type: 'button',
                          data: { text: email.cta, url: email.ctaUrl || '#', style: 'primary' }
                        });
                      }
                      if (email.footer) {
                        blocks.push({
                          id: `block-${Date.now()}-footer`,
                          type: 'footer',
                          data: { text: email.footer }
                        });
                      }
                      
                      setEditingDraft({
                        id: null, // New draft
                        strategyType: selectedStrategy.type,
                        strategyId: selectedStrategy.id,
                        subject: selectedStrategy.details.subject || email.subject || '',
                        preheader: email.preheader || selectedStrategy.details.preheader || '',
                        blocks: blocks.length > 0 ? blocks : undefined,
                        // Keep legacy format for backward compatibility
                        greeting: email.greeting || '',
                        body: email.body || [],
                        cta: email.cta || '',
                        ctaUrl: email.ctaUrl || '#',
                        footer: email.footer || '',
                        targetGuests: selectedStrategy.guests || []
                      });
                    }}
                    title="Edit campaign email template"
                  >
                    ✏️ Edit Campaign Template
                  </button>
                  {selectedStrategy.guests?.length > 0 && (
                    <>
                      <button 
                        className="btn-send-test"
                        onClick={() => setShowTestEmailDialog(true)}
                        title="Send test email"
                        disabled={sendingTestEmail || sendingCampaign}
                      >
                        {sendingTestEmail ? '⏳ Sending...' : '🧪 Send Test Email'}
                      </button>
                      <button 
                        className="btn-send-email"
                        onClick={() => handleSendCampaign()}
                        title="Send to all guests"
                        disabled={sendingCampaign || sendingTestEmail}
                      >
                        {sendingCampaign ? '⏳ Sending...' : '📧 Send Campaign'}
                      </button>
                    </>
                  )}
                  </div>
                </div>
              </div>
              
              {selectedGuest && selectedStrategy.generateEmail ? (
                <div className="email-preview">
                  {(() => {
                    const email = selectedStrategy.generateEmail(selectedGuest);
                    return (
                      <>
                        <div className="email-header">
                          <div className="email-from">
                            <strong>From:</strong> Hennessey Estate &lt;hello@hennesseyestate.com&gt;
                          </div>
                          <div className="email-to">
                            <strong>To:</strong> {selectedGuest.guestEmail || selectedGuest.guest_email || 'guest@email.com'}
                            {selectedGuest.emailIsGenerated && <span className="email-note"> (preview)</span>}
                          </div>
                          <div className="email-subject">
                            <strong>Subject:</strong> {selectedStrategy.details.subject}
                          </div>
                          <div className="email-preheader">
                            <em>{email.preheader}</em>
                          </div>
                        </div>
                        
                        <div className="email-body">
                          <div className="email-logo">
                            <div className="logo-circle">H</div>
                            <div className="logo-text">
                              <span className="logo-name">HENNESSEY</span>
                              <span className="logo-sub">ESTATE · EST. 1889</span>
                            </div>
                          </div>
                          
                          <div className="email-content">
                            <p className="email-greeting">{email.greeting}</p>
                            
                            {email.body.map((paragraph, idx) => (
                              <p key={idx} dangerouslySetInnerHTML={{ __html: paragraph }} />
                            ))}
                            
                            <div className="email-cta-wrapper">
                              <a href={email.ctaUrl} className="email-cta">{email.cta}</a>
                            </div>
                            
                            <p className="email-footer-text">{email.footer}</p>
                          </div>
                          
                          <div className="email-footer">
                            <div className="footer-logo">Hennessey Estate</div>
                            <div className="footer-address">1727 Main Street, Napa, CA 94559</div>
                            <div className="footer-links">
                              <a href="#">Website</a> · <a href="#">Instagram</a> · <a href="#">Unsubscribe</a>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="empty-preview">
                  <div className="empty-icon">📧</div>
                  <p>Select a guest to preview their personalized email</p>
                </div>
              )}
            </div>
            </div> {/* End strategy-detail-content */}
            
            {/* Advanced Email Editor - Fullscreen */}
            {editingDraft && (
              <div className="email-editor-fullscreen">
                <EmailEditor
                  draft={editingDraft}
                  onSave={(emailData) => {
                    // Convert block-based format to legacy format for backend compatibility
                    const draftData = {
                      ...editingDraft,
                      subject: emailData.subject,
                      preheader: emailData.preheader,
                      blocks: emailData.blocks,
                      abTestSubject: emailData.abTestSubject
                    };
                    handleSaveDraft(draftData);
                  }}
                  onCancel={() => setEditingDraft(null)}
                  mode="edit"
                />
              </div>
            )}
            
            {/* Test Email Dialog */}
            {showTestEmailDialog && (
              <div className="modal-overlay" onClick={() => !sendingTestEmail && setShowTestEmailDialog(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Send Test Email</h2>
                    <button className="modal-close" onClick={() => setShowTestEmailDialog(false)} disabled={sendingTestEmail}>×</button>
                  </div>
                  <div className="modal-body">
                    <p className="modal-description">
                      Send a test email to preview how the campaign will look with sample data. Template variables will be replaced with example values.
                    </p>
                    <div className="form-group">
                      <label>Test Email Address</label>
                      <input 
                        type="email"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        placeholder="your-email@example.com"
                        disabled={sendingTestEmail}
                        className="form-input"
                      />
                    </div>
                    <div className="sample-data-preview">
                      <strong>Sample data used:</strong>
                      <ul>
                        <li>Guest Name: John Smith</li>
                        <li>Check-in: 2025-12-30</li>
                        <li>Check-out: 2026-01-02</li>
                        <li>Room Type: Deluxe Suite</li>
                        <li>Reservation ID: TEST-12345</li>
                        <li>Property Name: Hennessey Estate</li>
                      </ul>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="btn-cancel" 
                      onClick={() => setShowTestEmailDialog(false)}
                      disabled={sendingTestEmail}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-save" 
                      onClick={handleSendTestEmail}
                      disabled={sendingTestEmail || !testEmailAddress || !testEmailAddress.includes('@')}
                    >
                      {sendingTestEmail ? 'Sending...' : 'Send Test Email'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Gemini AI Creative Assistant */}
            {showAIAssistant && selectedStrategy && (
              <GeminiEmailAssistant
                strategy={selectedStrategy}
                onApplyCreative={handleApplyAICreative}
                onClose={() => setShowAIAssistant(false)}
                existingContent={selectedStrategy.aiGeneratedContent || (selectedStrategy.generateEmail ? (() => {
                  const email = selectedStrategy.generateEmail(selectedStrategy.guests?.[0] || {});
                  return {
                    subject: selectedStrategy.details.subject,
                    preheader: email.preheader,
                    greeting: email.greeting,
                    body: email.body,
                    cta: email.cta,
                    ctaUrl: email.ctaUrl,
                    footer: email.footer
                  };
                })() : null)}
              />
            )}

            {/* Campaign Tracking Modal */}
            {showTracking && (
              <div className="modal-overlay" onClick={() => setShowTracking(null)}>
                <div className="modal-content tracking-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Campaign Analytics</h2>
                    <button className="modal-close" onClick={() => setShowTracking(null)}>×</button>
                  </div>
                  {trackingData[showTracking] ? (
                    <div className="tracking-stats">
                      <div className="stat-grid">
                        <div className="stat-card">
                          <div className="stat-value">{trackingData[showTracking].stats.totalSent}</div>
                          <div className="stat-label">Emails Sent</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">{trackingData[showTracking].stats.uniqueOpens}</div>
                          <div className="stat-label">Unique Opens</div>
                          <div className="stat-rate">{trackingData[showTracking].stats.openRate}%</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">{trackingData[showTracking].stats.uniqueClicks}</div>
                          <div className="stat-label">Unique Clicks</div>
                          <div className="stat-rate">{trackingData[showTracking].stats.clickRate}%</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">{trackingData[showTracking].stats.clickToOpenRate}%</div>
                          <div className="stat-label">Click-to-Open Rate</div>
                        </div>
                      </div>
                      <div className="tracking-details">
                        <h3>Detailed Metrics</h3>
                        <ul>
                          <li>Total Opens: {trackingData[showTracking].stats.totalOpens}</li>
                          <li>Total Clicks: {trackingData[showTracking].stats.totalClicks}</li>
                          <li>Open Rate: {trackingData[showTracking].stats.openRate}%</li>
                          <li>Click Rate: {trackingData[showTracking].stats.clickRate}%</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="loading">Loading tracking data...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedStrategy && (
          <div className="no-selection-panel">
            <div className="no-selection-content">
              <div className="no-selection-icon">📬</div>
              <h3>Select a Campaign</h3>
              <p>Choose an email campaign from the list to view target guests and preview the email design</p>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Analytics Dashboard - Prominent Display */}
      {campaigns.filter(c => c.status === 'sent').length > 0 && (
        <div className="campaign-analytics-dashboard">
          <div className="dashboard-header">
            <h2 className="dashboard-title">
              📊 Campaign Performance
            </h2>
            <p className="dashboard-subtitle">Analytics from your launched email campaigns</p>
          </div>
          <CampaignAnalyticsCards 
            campaigns={campaigns.filter(c => c.status === 'sent')}
            onViewAnalytics={handleViewTracking}
          />
        </div>
      )}

      {/* Email Campaigns & Drafts Section */}
      {(drafts.length > 0 || campaigns.length > 0) && (
        <div className="email-management-section">
          <h2 className="section-title">
            Email Management
          </h2>
          
          {drafts.length > 0 && (
            <div className="drafts-section">
              <h3 className="section-subtitle">
                Drafts ({drafts.length})
              </h3>
              <div className="drafts-list">
                {drafts.map((draft) => (
                  <div key={draft.id} className="draft-item">
                    <div className="draft-info">
                      <h4>{draft.subject || 'Untitled Draft'}</h4>
                      <p className="draft-meta">
                        {draft.strategyType} · {draft.targetGuests?.length || 0} recipients
                      </p>
                      <p className="draft-date">
                        Updated: {new Date(draft.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="draft-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => {
                          // Convert legacy draft to block format if needed
                          const blocks = [];
                          if (draft.greeting) {
                            blocks.push({
                              id: `block-${Date.now()}-1`,
                              type: 'text',
                              data: { content: draft.greeting }
                            });
                          }
                          if (draft.body && Array.isArray(draft.body)) {
                            draft.body.forEach((para, idx) => {
                              blocks.push({
                                id: `block-${Date.now()}-${idx + 2}`,
                                type: 'text',
                                data: { content: para }
                              });
                            });
                          }
                          if (draft.cta) {
                            blocks.push({
                              id: `block-${Date.now()}-cta`,
                              type: 'button',
                              data: { text: draft.cta, url: draft.ctaUrl || '#', style: 'primary' }
                            });
                          }
                          if (draft.footer) {
                            blocks.push({
                              id: `block-${Date.now()}-footer`,
                              type: 'footer',
                              data: { text: draft.footer }
                            });
                          }
                          
                          setEditingDraft({
                            ...draft,
                            blocks: blocks.length > 0 ? blocks : undefined
                          });
                        }}
                      >
                        ✏️ Edit Template
                      </button>
                      <button 
                        className="btn-send"
                        onClick={async () => {
                          try {
                            const campaignResult = await createEmailCampaign({
                              draftId: draft.id,
                              recipients: draft.targetGuests
                            });
                            if (campaignResult.success) {
                              const sendResult = await sendEmailCampaign(campaignResult.campaign.id);
                              if (sendResult.success) {
                                alert(`Campaign sent! Sent: ${sendResult.sent}, Failed: ${sendResult.failed}`);
                                // Refresh campaigns
                                const campaignsResult = await getEmailCampaigns();
                                if (campaignsResult.success) {
                                  setCampaigns(campaignsResult.campaigns);
                                }
                                // Refresh drafts
                                const draftsResult = await getEmailDrafts();
                                if (draftsResult.success) {
                                  setDrafts(draftsResult.drafts);
                                }
                              }
                            }
                          } catch (error) {
                            alert('Error sending campaign: ' + error.message);
                          }
                        }}
                      >
                        📧 Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {campaigns.length > 0 && (
            <div>
              <h3 className="section-subtitle">
                Campaigns ({campaigns.length})
              </h3>
              <div className="campaigns-list">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="campaign-item">
                    <div className="campaign-info">
                      <h4>{campaign.name}</h4>
                      <p className="campaign-meta">
                        Status: <span className={`status-${campaign.status}`}>{campaign.status}</span>
                        {campaign.sentAt && ` · Sent: ${new Date(campaign.sentAt).toLocaleString()}`}
                      </p>
                      <p className="campaign-recipients">
                        {campaign.recipients?.length || 0} recipients
                      </p>
                    </div>
                    <div className="campaign-actions">
                      {campaign.status === 'sent' && (
                        <button 
                          className="btn-tracking"
                          onClick={() => handleViewTracking(campaign.id)}
                        >
                          📊 View Analytics
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Strategies */}
      {completedStrategies.length > 0 && (
        <div className="completed-section">
          <h3>Completed Campaigns ({completedStrategies.length})</h3>
          <div className="completed-list">
            {completedStrategies.map((strategy) => (
              <div key={strategy.id} className="completed-item">
                <span className="completed-icon">{strategy.icon}</span>
                <span className="completed-title">{strategy.title}</span>
                <span className="completed-date">
                  {new Date(strategy.completedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailMarketing;
