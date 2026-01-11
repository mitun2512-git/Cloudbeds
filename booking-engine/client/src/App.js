import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Homepage from './components/Homepage';
import DailyReservations from './components/DailyReservations';
import AvailabilityChecker from './components/AvailabilityChecker';
import EmailMarketing from './components/EmailMarketing';
import RevenueAudit from './components/RevenueAudit';
import CompetitiveBenchmark from './components/CompetitiveBenchmark';
import WebsiteRedesign from './components/WebsiteRedesign';
import DynamicPricing from './components/DynamicPricing';
import RevenueDashboard from './components/RevenueDashboard';
import ChatBot from './components/ChatBot';
import GuestBookingApp from './components/GuestBookingApp';
import LandingPage from './components/LandingPage';
import WebsiteEditor from './components/WebsiteEditor';
import GuestChatDashboard from './components/GuestChatDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import EstateBuyoutBooking from './components/EstateBuyoutBooking';
import { WebsiteContentProvider } from './context/WebsiteContentContext';
import { getProperties, getCacheStatus, triggerCacheRefresh } from './services/api';

// Staff Dashboard Component
function StaffDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('home');
  const [propertyId, setPropertyId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({
    lastRefresh: null,
    isRefreshing: false,
    stats: { reservations: 0, guests: 0 }
  });

  const fetchCacheStatus = useCallback(async () => {
    try {
      const status = await getCacheStatus();
      setCacheStatus(status);
    } catch (err) {
      console.log('Could not fetch cache status:', err.message);
    }
  }, []);

  useEffect(() => {
    // Block search engines from indexing dashboard
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = 'noindex, nofollow';
    
    // Set dashboard page title
    document.title = 'Staff Dashboard | Hennessey Estate';

    const fetchProperties = async () => {
      try {
        const properties = await getProperties();
        const props = properties?.data || properties || [];
        if (Array.isArray(props) && props.length > 0) {
          const firstProp = props[0];
          setPropertyId(firstProp.property_id || firstProp.id);
        }
      } catch (err) {
        console.log('Could not fetch properties:', err.message);
      }
    };
    fetchProperties();
    
    fetchCacheStatus();
    const interval = setInterval(fetchCacheStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchCacheStatus]);

  const handleManualRefresh = async () => {
    try {
      await triggerCacheRefresh();
      setCacheStatus(prev => ({ ...prev, isRefreshing: true }));
      const pollInterval = setInterval(async () => {
        const status = await getCacheStatus();
        setCacheStatus(status);
        if (!status.isRefreshing) {
          clearInterval(pollInterval);
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to trigger refresh:', err);
    }
  };

  const formatLastRefresh = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    return date.toLocaleString();
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'audit': return 'Revenue Audit';
      case 'reservations': return 'Daily Reservations';
      case 'availability': return 'Availability & Pricing';
      case 'email': return 'Email Marketing';
      case 'benchmark': return 'Competitive Benchmark';
      case 'website': return 'Website Redesign';
      case 'pricing': return 'Dynamic Pricing Engine';
      case 'guestchat': return 'Guest Chat Interactions';
      default: return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (activeView) {
      case 'audit': return 'Booking-level breakdown of room rate, tax, fees, and totals';
      case 'reservations': return 'View and manage upcoming guest reservations';
      case 'availability': return 'Check room availability and rates for any date';
      case 'email': return 'AI-powered email campaign strategies based on your data';
      case 'benchmark': return 'Revenue projection against 5 comparable Napa Valley properties';
      case 'website': return 'Mockup and copy recommendations for hennesseyestate.com';
      case 'pricing': return 'AI-powered dynamic pricing and room vs buyout allocation';
      case 'guestchat': return 'Monitor and review conversations with prospective guests';
      default: return '';
    }
  };

  return (
    <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="hamburger-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Open menu' : 'Close menu'}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          {!sidebarCollapsed && (
            <div className="logo" onClick={() => setActiveView('home')} style={{ cursor: 'pointer' }}>
              <img 
                src="/logo.png" 
                alt="Hennessey Estate" 
                className="sidebar-logo" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="logo-fallback"><span>H</span><span class="logo-text">Hennessey Estate</span></div>';
                }}
              />
            </div>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className="nav-item nav-item-highlight"
            onClick={() => navigate('/book')}
            title="Guest Booking Engine"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span className="nav-text">Guest Booking Engine</span>
          </button>
          <div className="nav-divider"></div>
          <button 
            className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => setActiveView('home')}
            title="Home"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span className="nav-text">Home</span>
          </button>
          <button 
            className={`nav-item ${activeView === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveView('reservations')}
            title="Reservations"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="nav-text">Reservations</span>
          </button>
          <button 
            className={`nav-item ${activeView === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveView('availability')}
            title="Availability"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            <span className="nav-text">Availability</span>
          </button>
          <button 
            className={`nav-item ${activeView === 'email' ? 'active' : ''}`}
            onClick={() => setActiveView('email')}
            title="Marketing"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span className="nav-text">Marketing</span>
          </button>
          <button 
            className={`nav-item ${activeView === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveView('audit')}
            title="Revenue Audit"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3h18M3 9h18M3 15h18M3 21h18" />
            </svg>
            <span className="nav-text">Revenue Audit</span>
          </button>
          <button 
            className={`nav-item ${activeView === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveView('revenue')}
            title="Revenue Dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="nav-text">Revenue Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeView === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveView('pricing')}
            title="Pricing Engine"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="nav-text">Pricing Engine</span>
          </button>
          <button 
            className={`nav-item ${activeView === 'benchmark' ? 'active' : ''}`}
            onClick={() => setActiveView('benchmark')}
            title="Benchmark"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span className="nav-text">Benchmark</span>
          </button>
          <button 
            className={`nav-item ${activeView === 'website' ? 'active' : ''}`}
            onClick={() => setActiveView('website')}
            title="Website"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
            <span className="nav-text">Website</span>
          </button>
          <button 
            className="nav-item"
            onClick={() => navigate('/editor')}
            title="Website Editor"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span className="nav-text">Website Editor</span>
          </button>
          <button 
            className={`nav-item ${activeView === 'guestchat' ? 'active' : ''}`}
            onClick={() => setActiveView('guestchat')}
            title="Guest Chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <span className="nav-text">Guest Chat</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeView !== 'home' && activeView !== 'website' && (
          <header className="main-header">
            <div className="header-title">
              <h1>{getPageTitle()}</h1>
              <p className="header-subtitle">{getPageSubtitle()}</p>
            </div>
          </header>
        )}

        <div className={`content-area ${activeView === 'home' ? 'content-home' : ''} ${activeView === 'benchmark' ? 'content-benchmark' : ''} ${activeView === 'website' ? 'content-website' : ''} ${activeView === 'pricing' ? 'content-pricing' : ''} ${activeView === 'revenue' ? 'content-revenue' : ''} ${activeView === 'guestchat' ? 'content-guestchat' : ''}`}>
          {activeView === 'home' && <Homepage onNavigate={setActiveView} />}
          {activeView === 'reservations' && <DailyReservations />}
          {activeView === 'availability' && <AvailabilityChecker propertyId={propertyId} />}
          {activeView === 'email' && <EmailMarketing />}
          {activeView === 'audit' && <RevenueAudit />}
          {activeView === 'revenue' && <RevenueDashboard />}
          {activeView === 'pricing' && <DynamicPricing />}
          {activeView === 'benchmark' && <CompetitiveBenchmark />}
          {activeView === 'website' && <WebsiteRedesign />}
          {activeView === 'guestchat' && <GuestChatDashboard />}
        </div>

        {/* Data Refresh Status Footer */}
        <footer className="data-refresh-footer">
          <div className="refresh-status">
            <span className="refresh-icon">
              {cacheStatus.isRefreshing ? '🔄' : '✓'}
            </span>
            <span className="refresh-text">
              {cacheStatus.isRefreshing 
                ? 'Refreshing data from Cloudbeds...' 
                : `Data last synced: ${formatLastRefresh(cacheStatus.lastRefresh)}`}
            </span>
            {cacheStatus.stats && (
              <span className="refresh-stats">
                ({cacheStatus.stats.reservations} reservations, {cacheStatus.stats.guests} guests)
              </span>
            )}
          </div>
          <button 
            className="refresh-button"
            onClick={handleManualRefresh}
            disabled={cacheStatus.isRefreshing}
          >
            {cacheStatus.isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </footer>
      </main>

      {/* AI Concierge Chatbot - Available across all pages */}
      <ChatBot />
    </div>
  );
}

// Main App with Routing
function App() {
  return (
    <WebsiteContentProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Guest Booking Engine - Public facing */}
          <Route path="/book" element={<GuestBookingApp />} />
          
          {/* Full Estate Buyout - Dedicated booking flow */}
          <Route path="/book/estate-buyout" element={<EstateBuyoutBooking />} />
          
          {/* Website Editor - Wix-inspired visual editor */}
          <Route path="/editor" element={<WebsiteEditor />} />
          
          {/* Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Staff Dashboard */}
          <Route path="/dashboard/*" element={<StaffDashboard />} />
        </Routes>
      </BrowserRouter>
    </WebsiteContentProvider>
  );
}

export default App;
