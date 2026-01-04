import React, { useState, useCallback } from 'react';
import { generateEmailCreative, generateSubjectLines, improveEmailContent } from '../services/api';
import './GeminiEmailAssistant.css';

/**
 * Gemini AI Email Creative Assistant
 * A powerful AI-powered tool for generating high-conversion email creatives
 */

const TONE_OPTIONS = [
  { 
    value: 'luxurious', 
    label: 'Luxurious', 
    icon: '✨',
    description: 'Sophisticated, exclusive, aspirational',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.9) 0%, rgba(139, 90, 43, 0.85) 100%)'
  },
  { 
    value: 'warm', 
    label: 'Warm', 
    icon: '💛',
    description: 'Friendly, conversational, caring',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.9) 0%, rgba(234, 88, 12, 0.85) 100%)'
  },
  { 
    value: 'professional', 
    label: 'Professional', 
    icon: '💼',
    description: 'Polished, businesslike, trustworthy',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%)'
  },
  { 
    value: 'urgent', 
    label: 'Urgent', 
    icon: '⚡',
    description: 'Time-sensitive, action-driven',
    image: 'https://images.unsplash.com/photo-1533749047139-189de3cf06d3?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(185, 28, 28, 0.85) 100%)'
  },
  { 
    value: 'playful', 
    label: 'Playful', 
    icon: '🎉',
    description: 'Light-hearted, fun, engaging',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(126, 34, 206, 0.85) 100%)'
  }
];

const FOCUS_POINT_SUGGESTIONS = {
  pre_arrival: [
    'Build excitement for upcoming stay',
    'Upsell spa treatments or experiences',
    'Provide check-in instructions',
    'Highlight local attractions',
    'Offer early check-in options'
  ],
  post_stay: [
    'Request review on Google/TripAdvisor',
    'Offer return visit discount',
    'Share photo gallery link',
    'Thank them for choosing us',
    'Invite to join newsletter'
  ],
  winback: [
    'Nostalgia for previous stay',
    'What\'s new at the property',
    'Exclusive returning guest rate',
    'Seasonal highlights',
    'Limited-time offer'
  ],
  seasonal: [
    'Seasonal activities in Napa',
    'Special package deals',
    'Weather and packing tips',
    'Wine harvest events',
    'Holiday celebrations'
  ],
  upsell: [
    'Room upgrade availability',
    'Romantic package add-ons',
    'Private wine tour',
    'In-room spa treatments',
    'Chef\'s table experience'
  ],
  cancellation_recovery: [
    'Flexible rebooking options',
    'No penalties for date changes',
    'Rebooking incentive',
    'Understanding tone',
    'Easy one-click rebooking'
  ],
  vip_loyalty: [
    'Exclusive VIP benefits',
    'Complimentary upgrades',
    'Early access to reservations',
    'Personal concierge service',
    'Wine tasting credits'
  ],
  last_minute: [
    'Flash sale urgency',
    'Limited availability',
    'Weekend escape itinerary',
    'Spontaneous getaway appeal',
    'Local guest targeting'
  ],
  special_occasion: [
    'Celebration packages',
    'Room decoration services',
    'Champagne and cake options',
    'Photography partnerships',
    'Personalized surprises'
  ],
  referral: [
    'Mutual rewards program',
    'Easy sharing mechanism',
    'Unique referral codes',
    'Track referral status',
    'Bonus for multiple referrals'
  ]
};

const IMPROVEMENT_TYPES = [
  { 
    value: 'persuasion', 
    label: 'More Persuasive', 
    icon: '🎯',
    description: 'Add social proof and compelling benefits',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(21, 128, 61, 0.85) 100%)'
  },
  { 
    value: 'clarity', 
    label: 'Clearer', 
    icon: '💡',
    description: 'Simplify and improve readability',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.85) 100%)'
  },
  { 
    value: 'urgency', 
    label: 'More Urgent', 
    icon: '⏰',
    description: 'Add scarcity and FOMO elements',
    image: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(234, 88, 12, 0.85) 100%)'
  },
  { 
    value: 'personalization', 
    label: 'More Personal', 
    icon: '👤',
    description: 'Add merge tags and intimate tone',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.9) 0%, rgba(219, 39, 119, 0.85) 100%)'
  },
  { 
    value: 'brevity', 
    label: 'More Concise', 
    icon: '✂️',
    description: 'Tighten and remove fluff',
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.9) 0%, rgba(75, 85, 99, 0.85) 100%)'
  },
  { 
    value: 'luxury', 
    label: 'More Luxurious', 
    icon: '👑',
    description: 'Elevate to premium brand voice',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop&q=80',
    gradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.9) 0%, rgba(161, 132, 41, 0.85) 100%)'
  }
];

const GeminiEmailAssistant = ({ 
  strategy, 
  onApplyCreative, 
  onClose,
  existingContent = null 
}) => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'subjects', 'improve'
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCreative, setGeneratedCreative] = useState(null);
  const [generatedSubjects, setGeneratedSubjects] = useState(null);
  const [improvedContent, setImprovedContent] = useState(null);
  const [error, setError] = useState(null);
  
  // Generation settings
  const [tone, setTone] = useState('luxurious');
  const [focusPoints, setFocusPoints] = useState([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [improvementType, setImprovementType] = useState('persuasion');
  
  // Get suggestions based on strategy type
  const suggestedFocusPoints = FOCUS_POINT_SUGGESTIONS[strategy?.type] || FOCUS_POINT_SUGGESTIONS.pre_arrival;

  const handleGenerateCreative = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedCreative(null);
    
    try {
      const result = await generateEmailCreative({
        strategyType: strategy?.type || 'custom',
        strategyTitle: strategy?.title || 'Custom Campaign',
        strategyDescription: strategy?.description || '',
        targetAudience: strategy?.details?.targetAudience || 'Hotel guests',
        tone,
        focusPoints,
        customInstructions,
        propertyName: 'Hennessey Estate',
        existingContent: existingContent ? {
          subject: existingContent.subject,
          body: existingContent.body,
          cta: existingContent.cta
        } : null
      });
      
      if (result.success) {
        setGeneratedCreative(result.creative);
      } else {
        setError(result.error || 'Failed to generate creative');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating the creative');
    } finally {
      setIsGenerating(false);
    }
  }, [strategy, tone, focusPoints, customInstructions, existingContent]);

  const handleGenerateSubjects = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedSubjects(null);
    
    try {
      const result = await generateSubjectLines({
        strategyType: strategy?.type || 'custom',
        targetAudience: strategy?.details?.targetAudience || 'Hotel guests',
        tone,
        count: 5,
        existingSubject: existingContent?.subject || ''
      });
      
      if (result.success) {
        setGeneratedSubjects(result.subjects);
      } else {
        setError(result.error || 'Failed to generate subject lines');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating subjects');
    } finally {
      setIsGenerating(false);
    }
  }, [strategy, tone, existingContent]);

  const handleImproveContent = useCallback(async () => {
    if (!existingContent) {
      setError('No existing content to improve. Generate a creative first.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setImprovedContent(null);
    
    try {
      const result = await improveEmailContent({
        content: existingContent,
        improvementType,
        additionalInstructions: customInstructions
      });
      
      if (result.success) {
        setImprovedContent(result.improved);
      } else {
        setError(result.error || 'Failed to improve content');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while improving content');
    } finally {
      setIsGenerating(false);
    }
  }, [existingContent, improvementType, customInstructions]);

  const handleApplyCreative = (creative) => {
    if (onApplyCreative) {
      onApplyCreative({
        subject: creative.subject,
        preheader: creative.preheader,
        greeting: creative.greeting,
        body: creative.body,
        cta: creative.cta,
        footer: creative.footer
      });
    }
  };

  const handleApplySubject = (subject) => {
    if (onApplyCreative) {
      onApplyCreative({
        subject: subject.subject,
        preheader: subject.preheader
      });
    }
  };

  const toggleFocusPoint = (point) => {
    setFocusPoints(prev => 
      prev.includes(point) 
        ? prev.filter(p => p !== point)
        : [...prev, point]
    );
  };

  return (
    <div className="gemini-assistant-overlay">
      <div className="gemini-assistant-container">
        {/* Header */}
        <div className="gemini-header">
          <div className="gemini-header-content">
            <div className="gemini-logo">
              <span className="gemini-icon">✨</span>
              <div className="gemini-title">
                <h2>AI Creative Assistant</h2>
                <span className="powered-by">Powered by Gemini</span>
              </div>
            </div>
            <button className="gemini-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          {/* Campaign Context */}
          {strategy && (
            <div className="gemini-context">
              <span className="context-icon">{strategy.icon}</span>
              <div className="context-info">
                <span className="context-title">{strategy.title}</span>
                <span className="context-type">{strategy.type.replace('_', ' ')}</span>
              </div>
            </div>
          )}
          
          {/* Tabs */}
          <div className="gemini-tabs">
            <button 
              className={`gemini-tab ${activeTab === 'generate' ? 'active' : ''}`}
              onClick={() => setActiveTab('generate')}
            >
              <span className="tab-icon">🎨</span>
              Generate Creative
            </button>
            <button 
              className={`gemini-tab ${activeTab === 'subjects' ? 'active' : ''}`}
              onClick={() => setActiveTab('subjects')}
            >
              <span className="tab-icon">📝</span>
              Subject Lines
            </button>
            <button 
              className={`gemini-tab ${activeTab === 'improve' ? 'active' : ''}`}
              onClick={() => setActiveTab('improve')}
              disabled={!existingContent}
              title={!existingContent ? 'Generate content first to use this feature' : ''}
            >
              <span className="tab-icon">🚀</span>
              Improve Existing
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="gemini-content">
          {/* Generate Creative Tab */}
          {activeTab === 'generate' && (
            <div className="gemini-panel">
              <div className="panel-section">
                <h3>Tone of Voice</h3>
                <div className="tone-grid visual">
                  {TONE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      className={`tone-card ${tone === option.value ? 'selected' : ''}`}
                      onClick={() => setTone(option.value)}
                      style={{
                        '--card-image': `url(${option.image})`,
                        '--card-gradient': option.gradient
                      }}
                    >
                      <div className="tone-card-bg" />
                      <div className="tone-card-content">
                        <span className="tone-card-icon">{option.icon}</span>
                        <span className="tone-card-label">{option.label}</span>
                        <span className="tone-card-description">{option.description}</span>
                      </div>
                      {tone === option.value && (
                        <div className="tone-card-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <h3>Focus Points</h3>
                <p className="section-hint">Select key messages to emphasize in your email</p>
                <div className="focus-points-grid">
                  {suggestedFocusPoints.map((point, idx) => (
                    <button
                      key={idx}
                      className={`focus-point ${focusPoints.includes(point) ? 'selected' : ''}`}
                      onClick={() => toggleFocusPoint(point)}
                    >
                      {focusPoints.includes(point) && <span className="check-icon">✓</span>}
                      {point}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <h3>Custom Instructions <span className="optional">(Optional)</span></h3>
                <textarea
                  className="custom-instructions"
                  placeholder="Add any specific requirements, mentions, or style preferences..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <button 
                className="generate-button"
                onClick={handleGenerateCreative}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    Generating Creative...
                  </>
                ) : (
                  <>
                    <span className="button-icon">✨</span>
                    Generate Email Creative
                  </>
                )}
              </button>

              {/* Generated Creative Result */}
              {generatedCreative && (
                <div className="generated-result">
                  <div className="result-header">
                    <h3>🎉 Generated Creative</h3>
                    <button 
                      className="apply-button"
                      onClick={() => handleApplyCreative(generatedCreative)}
                    >
                      Apply to Campaign
                    </button>
                  </div>
                  
                  <div className="creative-preview rich-preview">
                    {/* Subject & Preheader Section */}
                    <div className="preview-email-header">
                      <div className="preview-field">
                        <label>Subject Line</label>
                        <div className="preview-value subject">{generatedCreative.subject}</div>
                        {generatedCreative.subjectVariants && (
                          <div className="variants">
                            <span className="variants-label">Alternatives:</span>
                            {generatedCreative.subjectVariants.map((v, i) => (
                              <span key={i} className="variant">{v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="preview-field">
                        <label>Preheader</label>
                        <div className="preview-value preheader">{generatedCreative.preheader}</div>
                      </div>
                    </div>

                    {/* Email Body Preview */}
                    <div className="email-body-preview">
                      {/* Hero Section */}
                      {generatedCreative.heroSection && (
                        <div className="block-hero">
                          <div className="hero-content">
                            <h2 className="hero-headline">{generatedCreative.heroSection.headline}</h2>
                            {generatedCreative.heroSection.subheadline && (
                              <p className="hero-subheadline">{generatedCreative.heroSection.subheadline}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Greeting */}
                      <div className="block-greeting">{generatedCreative.greeting}</div>

                      {/* Rich Body Blocks */}
                      {generatedCreative.bodyBlocks?.map((block, i) => (
                        <div key={i} className={`content-block block-${block.type}`}>
                          {block.type === 'text' && (
                            <p dangerouslySetInnerHTML={{ __html: block.content }} />
                          )}

                          {block.type === 'features' && (
                            <div className="features-block">
                              {block.title && <h4 className="features-title">{block.title}</h4>}
                              <div className="features-grid">
                                {block.items?.map((item, j) => (
                                  <div key={j} className="feature-item">
                                    <span className="feature-icon">{item.icon}</span>
                                    <div className="feature-content">
                                      <strong className="feature-title">{item.title}</strong>
                                      <span className="feature-desc">{item.description}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {block.type === 'highlight' && (
                            <div className={`highlight-block ${block.style || 'gold'}`}>
                              {block.icon && <span className="highlight-icon">{block.icon}</span>}
                              <div className="highlight-content">
                                {block.title && <strong className="highlight-title">{block.title}</strong>}
                                <p className="highlight-text">{block.content}</p>
                              </div>
                            </div>
                          )}

                          {block.type === 'quote' && (
                            <div className="quote-block">
                              <blockquote>"{block.content}"</blockquote>
                              <div className="quote-footer">
                                {block.rating && (
                                  <span className="quote-rating">{'★'.repeat(block.rating)}</span>
                                )}
                                {block.author && <cite>— {block.author}</cite>}
                              </div>
                            </div>
                          )}

                          {block.type === 'stats' && (
                            <div className="stats-block">
                              {block.items?.map((stat, j) => (
                                <div key={j} className="stat-item">
                                  <span className="stat-value">{stat.value}</span>
                                  <span className="stat-label">{stat.label}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {block.type === 'checklist' && (
                            <div className="checklist-block">
                              {block.title && <h4 className="checklist-title">{block.title}</h4>}
                              <ul className="checklist-items">
                                {block.items?.map((item, j) => (
                                  <li key={j}>
                                    <span className="check-icon">✓</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {block.type === 'urgency' && (
                            <div className="urgency-block">
                              {block.icon && <span className="urgency-icon">{block.icon}</span>}
                              <p>{block.content}</p>
                            </div>
                          )}

                          {block.type === 'divider' && (
                            <div className="divider-block" />
                          )}
                        </div>
                      ))}

                      {/* Fallback for old body format */}
                      {!generatedCreative.bodyBlocks && generatedCreative.body?.map((para, i) => (
                        <p key={i} className="content-block block-text" dangerouslySetInnerHTML={{ __html: para }} />
                      ))}

                      {/* CTA Section */}
                      <div className="block-cta">
                        <button className={`cta-preview-button ${generatedCreative.ctaStyle || 'gold'}`}>
                          {generatedCreative.cta}
                        </button>
                        {generatedCreative.ctaSecondary && (
                          <button className="cta-preview-button secondary">
                            {generatedCreative.ctaSecondary}
                          </button>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="block-footer">{generatedCreative.footer}</div>
                    </div>

                    {/* Conversion Tips */}
                    {generatedCreative.conversionTips && (
                      <div className="conversion-tips">
                        <h4>💡 Conversion Tips</h4>
                        <ul>
                          {generatedCreative.conversionTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Images */}
                    {generatedCreative.suggestedImages && (
                      <div className="suggested-images">
                        <h4>📸 Suggested Images</h4>
                        <div className="image-suggestions">
                          {generatedCreative.suggestedImages.map((img, i) => (
                            <div key={i} className="image-suggestion">
                              <span className="image-placement">{img.placement}</span>
                              <span className="image-desc">{img.description}</span>
                              <span className="image-keywords">🔍 {img.unsplashKeywords}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subject Lines Tab */}
          {activeTab === 'subjects' && (
            <div className="gemini-panel">
              <div className="panel-section">
                <h3>Tone of Voice</h3>
                <div className="tone-grid visual compact">
                  {TONE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      className={`tone-card compact ${tone === option.value ? 'selected' : ''}`}
                      onClick={() => setTone(option.value)}
                      style={{
                        '--card-image': `url(${option.image})`,
                        '--card-gradient': option.gradient
                      }}
                    >
                      <div className="tone-card-bg" />
                      <div className="tone-card-content">
                        <span className="tone-card-icon">{option.icon}</span>
                        <span className="tone-card-label">{option.label}</span>
                      </div>
                      {tone === option.value && (
                        <div className="tone-card-check compact">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="generate-button"
                onClick={handleGenerateSubjects}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    Generating Subject Lines...
                  </>
                ) : (
                  <>
                    <span className="button-icon">📝</span>
                    Generate 5 Subject Lines
                  </>
                )}
              </button>

              {/* Generated Subjects Result */}
              {generatedSubjects && (
                <div className="generated-result subjects-result">
                  <h3>📧 Subject Line Variations</h3>
                  <div className="subjects-list">
                    {generatedSubjects.map((item, index) => (
                      <div key={index} className="subject-item">
                        <div className="subject-content">
                          <div className="subject-main">
                            <span className="subject-number">{index + 1}</span>
                            <div className="subject-text">
                              <strong>{item.subject}</strong>
                              <span className="subject-preheader">{item.preheader}</span>
                            </div>
                          </div>
                          {item.strategy && (
                            <p className="subject-strategy">💡 {item.strategy}</p>
                          )}
                        </div>
                        <button 
                          className="use-subject-button"
                          onClick={() => handleApplySubject(item)}
                        >
                          Use This
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Improve Tab */}
          {activeTab === 'improve' && (
            <div className="gemini-panel">
              {!existingContent ? (
                <div className="no-content-message">
                  <span className="message-icon">📄</span>
                  <h3>No Content to Improve</h3>
                  <p>Generate a creative first, or select a campaign with existing content to use this feature.</p>
                </div>
              ) : (
                <>
                  <div className="panel-section">
                    <h3>Improvement Type</h3>
                    <div className="improvement-grid visual">
                      {IMPROVEMENT_TYPES.map(option => (
                        <button
                          key={option.value}
                          className={`improvement-card ${improvementType === option.value ? 'selected' : ''}`}
                          onClick={() => setImprovementType(option.value)}
                          style={{
                            '--card-image': `url(${option.image})`,
                            '--card-gradient': option.gradient
                          }}
                        >
                          <div className="improvement-card-bg" />
                          <div className="improvement-card-content">
                            <span className="improvement-card-icon">{option.icon}</span>
                            <span className="improvement-card-label">{option.label}</span>
                            <span className="improvement-card-description">{option.description}</span>
                          </div>
                          {improvementType === option.value && (
                            <div className="improvement-card-check">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="panel-section">
                    <h3>Additional Instructions <span className="optional">(Optional)</span></h3>
                    <textarea
                      className="custom-instructions"
                      placeholder="Any specific improvements you'd like..."
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <button 
                    className="generate-button improve"
                    onClick={handleImproveContent}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <span className="spinner"></span>
                        Improving Content...
                      </>
                    ) : (
                      <>
                        <span className="button-icon">🚀</span>
                        Improve Content
                      </>
                    )}
                  </button>

                  {/* Improved Content Result */}
                  {improvedContent && (
                    <div className="generated-result">
                      <div className="result-header">
                        <h3>✨ Improved Content</h3>
                        <button 
                          className="apply-button"
                          onClick={() => handleApplyCreative(improvedContent)}
                        >
                          Apply Changes
                        </button>
                      </div>
                      
                      {improvedContent.improvements && (
                        <div className="improvements-list">
                          <h4>Changes Made:</h4>
                          <ul>
                            {improvedContent.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="creative-preview compact">
                        {improvedContent.subject && (
                          <div className="preview-field">
                            <label>Subject</label>
                            <div className="preview-value">{improvedContent.subject}</div>
                          </div>
                        )}
                        {improvedContent.body && (
                          <div className="preview-field">
                            <label>Body</label>
                            <div className="preview-value body">
                              {improvedContent.body.map((para, i) => (
                                <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="gemini-error">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error}</span>
              <button className="error-dismiss" onClick={() => setError(null)}>×</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiEmailAssistant;

