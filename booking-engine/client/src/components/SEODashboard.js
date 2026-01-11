/**
 * SEO Dashboard Component
 * Track and monitor SEO performance
 */

import React, { useState } from 'react';
import { SEO_CONFIG } from '../seo';
import { GBP_POSTS, GBP_QA, generateContentCalendar } from '../seo/GBPContent';
import './SEODashboard.css';

const SEODashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());

  // Generate content calendar
  const contentCalendar = generateContentCalendar(selectedMonth, selectedYear);

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'keywords', label: 'Keywords', icon: '🔍' },
    { id: 'pages', label: 'Pages', icon: '📄' },
    { id: 'gbp', label: 'Google Business', icon: '📍' },
    { id: 'content', label: 'Content Calendar', icon: '📅' },
    { id: 'checklist', label: 'Checklist', icon: '✅' },
  ];

  // Checklist items
  const checklistItems = [
    { task: 'Update Google Business Profile description', priority: 'high', status: 'pending' },
    { task: 'Add FAQ schema to FAQ page', priority: 'high', status: 'completed' },
    { task: 'Create Location page', priority: 'high', status: 'completed' },
    { task: 'Create About page with history', priority: 'high', status: 'completed' },
    { task: 'Create Amenities page', priority: 'high', status: 'completed' },
    { task: 'Set up blog with 5 initial posts', priority: 'high', status: 'completed' },
    { task: 'Update sitemap.xml', priority: 'high', status: 'completed' },
    { task: 'Add schema markup to all pages', priority: 'high', status: 'completed' },
    { task: 'Respond to all Google reviews', priority: 'medium', status: 'pending' },
    { task: 'Create BottleRock landing page content', priority: 'medium', status: 'completed' },
    { task: 'Set up Google Search Console', priority: 'high', status: 'pending' },
    { task: 'Set up Google Analytics 4', priority: 'high', status: 'pending' },
    { task: 'Submit sitemap to Search Console', priority: 'high', status: 'pending' },
    { task: 'Claim Bing Places listing', priority: 'medium', status: 'pending' },
    { task: 'Update TripAdvisor listing', priority: 'medium', status: 'pending' },
    { task: 'Add business to Apple Maps', priority: 'medium', status: 'pending' },
    { task: 'Create Pinterest business account', priority: 'low', status: 'pending' },
    { task: 'Optimize images (WebP format)', priority: 'medium', status: 'pending' },
    { task: 'Test Core Web Vitals', priority: 'high', status: 'pending' },
    { task: 'Mobile usability test', priority: 'high', status: 'pending' },
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="seo-dashboard">
      <header className="seo-header">
        <h1>SEO Dashboard</h1>
        <p>Monitor and optimize your search engine presence</p>
      </header>

      {/* Tab Navigation */}
      <nav className="seo-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`seo-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="seo-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Target Keywords</h3>
                <div className="stat-value">30+</div>
                <p>Primary & long-tail keywords</p>
              </div>
              <div className="stat-card">
                <h3>SEO Pages</h3>
                <div className="stat-value">10</div>
                <p>Optimized landing pages</p>
              </div>
              <div className="stat-card">
                <h3>Blog Posts</h3>
                <div className="stat-value">5</div>
                <p>Published articles</p>
              </div>
              <div className="stat-card">
                <h3>Schema Types</h3>
                <div className="stat-value">8</div>
                <p>Structured data schemas</p>
              </div>
            </div>

            <div className="overview-sections">
              <section className="overview-section">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                  <a href="/blog" className="action-btn">View Blog →</a>
                  <a href="/faq" className="action-btn">View FAQ Page →</a>
                  <a href="/location" className="action-btn">View Location Page →</a>
                  <a href="/about" className="action-btn">View About Page →</a>
                </div>
              </section>

              <section className="overview-section">
                <h2>SEO Health Score</h2>
                <div className="health-score">
                  <div className="score-circle">
                    <span className="score">85</span>
                    <span className="score-label">/ 100</span>
                  </div>
                  <div className="score-breakdown">
                    <div className="score-item good">
                      <span>✓</span> Meta tags optimized
                    </div>
                    <div className="score-item good">
                      <span>✓</span> Schema markup implemented
                    </div>
                    <div className="score-item good">
                      <span>✓</span> Sitemap updated
                    </div>
                    <div className="score-item warning">
                      <span>!</span> Core Web Vitals need testing
                    </div>
                    <div className="score-item warning">
                      <span>!</span> Search Console not connected
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === 'keywords' && (
          <div className="tab-content keywords-tab">
            <h2>Target Keywords</h2>
            
            {Object.entries(SEO_CONFIG.keywords).map(([page, keywords]) => (
              <div key={page} className="keyword-section">
                <h3>{page.charAt(0).toUpperCase() + page.slice(1)}</h3>
                <div className="keyword-list">
                  <div className="keyword-group">
                    <h4>Primary</h4>
                    <span className="keyword primary">{keywords.primary}</span>
                  </div>
                  {keywords.secondary && (
                    <div className="keyword-group">
                      <h4>Secondary</h4>
                      {keywords.secondary.map((kw, i) => (
                        <span key={i} className="keyword secondary">{kw}</span>
                      ))}
                    </div>
                  )}
                  {keywords.longTail && (
                    <div className="keyword-group">
                      <h4>Long-tail</h4>
                      {keywords.longTail.map((kw, i) => (
                        <span key={i} className="keyword longtail">{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="tab-content pages-tab">
            <h2>SEO Page Configuration</h2>
            
            <table className="pages-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(SEO_CONFIG.pages).map(([key, page]) => (
                  <tr key={key}>
                    <td><strong>{key}</strong></td>
                    <td>{page.title}</td>
                    <td>
                      <span className={`status ${page.noIndex ? 'noindex' : 'indexed'}`}>
                        {page.noIndex ? 'No Index' : 'Indexed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GBP Tab */}
        {activeTab === 'gbp' && (
          <div className="tab-content gbp-tab">
            <h2>Google Business Profile Content</h2>
            
            <section className="gbp-section">
              <h3>📝 Ready-to-Post Templates</h3>
              <div className="gbp-posts">
                {GBP_POSTS.weekly.map((post, i) => (
                  <div key={i} className="gbp-post-card">
                    <div className="post-type">{post.type}</div>
                    <h4>{post.title}</h4>
                    <pre>{post.content}</pre>
                    <button 
                      className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(post.content)}
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="gbp-section">
              <h3>❓ Pre-populated Q&A</h3>
              <div className="gbp-qa">
                {GBP_QA.map((qa, i) => (
                  <div key={i} className="qa-card">
                    <h4>Q: {qa.question}</h4>
                    <p>A: {qa.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="gbp-section">
              <h3>💬 Review Response Templates</h3>
              <div className="response-templates">
                <div className="response-card positive">
                  <h4>Positive Review Response</h4>
                  <p>{GBP_POSTS.responses.positive}</p>
                  <button onClick={() => navigator.clipboard.writeText(GBP_POSTS.responses.positive)}>
                    Copy
                  </button>
                </div>
                <div className="response-card neutral">
                  <h4>Neutral Review Response</h4>
                  <p>{GBP_POSTS.responses.neutral}</p>
                  <button onClick={() => navigator.clipboard.writeText(GBP_POSTS.responses.neutral)}>
                    Copy
                  </button>
                </div>
                <div className="response-card negative">
                  <h4>Negative Review Response</h4>
                  <p>{GBP_POSTS.responses.negative}</p>
                  <button onClick={() => navigator.clipboard.writeText(GBP_POSTS.responses.negative)}>
                    Copy
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Content Calendar Tab */}
        {activeTab === 'content' && (
          <div className="tab-content content-tab">
            <h2>Content Calendar</h2>
            
            <div className="calendar-header">
              <button 
                onClick={() => setSelectedMonth(m => m > 0 ? m - 1 : 11)}
                className="month-nav"
              >
                ←
              </button>
              <h3>{monthNames[selectedMonth]} {selectedYear}</h3>
              <button 
                onClick={() => setSelectedMonth(m => m < 11 ? m + 1 : 0)}
                className="month-nav"
              >
                →
              </button>
            </div>

            <div className="calendar-grid">
              {contentCalendar.map((item, i) => (
                <div key={i} className={`calendar-item ${item.type}`}>
                  <div className="calendar-date">{item.date}</div>
                  <div className="calendar-type">{item.type}</div>
                  <div className="calendar-title">{item.template.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="tab-content checklist-tab">
            <h2>SEO Implementation Checklist</h2>
            
            <div className="checklist-stats">
              <div className="checklist-stat">
                <span className="stat-number">
                  {checklistItems.filter(i => i.status === 'completed').length}
                </span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="checklist-stat">
                <span className="stat-number">
                  {checklistItems.filter(i => i.status === 'pending').length}
                </span>
                <span className="stat-label">Pending</span>
              </div>
            </div>

            <div className="checklist-items">
              {checklistItems.map((item, i) => (
                <div key={i} className={`checklist-item ${item.status} ${item.priority}`}>
                  <span className="check-icon">
                    {item.status === 'completed' ? '✓' : '○'}
                  </span>
                  <span className="check-text">{item.task}</span>
                  <span className={`priority-badge ${item.priority}`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SEODashboard;
