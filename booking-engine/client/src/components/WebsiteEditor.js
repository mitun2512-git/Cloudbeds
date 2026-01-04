import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useWebsiteContent, defaultContent } from '../context/WebsiteContentContext';
import './WebsiteEditor.css';

// ============================================
// WEBSITE EDITOR - Wix-Inspired Visual Editor
// Now integrated with shared content context
// ============================================

const WebsiteEditor = () => {
  // Get shared content from context
  const { content, setContent, updateContent, updateSection, resetToDefaults, exportContent, importContent, isLoaded } = useWebsiteContent();
  
  // Editor state (local only)
  const [selectedElement, setSelectedElement] = useState(null);
  const [deviceView, setDeviceView] = useState('desktop'); // desktop, tablet, mobile
  const [leftPanelTab, setLeftPanelTab] = useState('sections'); // sections, elements, media
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState(null);

  // Section order for drag reordering (stored locally in editor)
  const [sectionOrder, setSectionOrder] = useState([
    'header', 'hero', 'reviews', 'rooms', 'buyout', 
    'contentSections.pool', 'contentSections.tastingRoom', 
    'contentSections.breakfast', 'contentSections.sauna',
    'amenities', 'location', 'newsletter', 'footer'
  ]);

  // Canvas ref for measurements
  const canvasRef = useRef(null);

  // Convert context content structure to flat sections for editor
  const getFlatSection = useCallback((sectionId) => {
    if (sectionId.startsWith('contentSections.')) {
      const key = sectionId.replace('contentSections.', '');
      return content.contentSections?.[key];
    }
    return content[sectionId];
  }, [content]);

  // Save to history for undo/redo
  const saveToHistory = useCallback(() => {
    const state = JSON.stringify(content);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setHasUnsavedChanges(true);
  }, [content, history, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = JSON.parse(history[historyIndex - 1]);
      setContent(prevState);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setContent]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = JSON.parse(history[historyIndex + 1]);
      setContent(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setContent]);

  // Update section content
  const updateSectionContent = (sectionId, path, value) => {
    saveToHistory();
    
    if (sectionId.startsWith('contentSections.')) {
      const key = sectionId.replace('contentSections.', '');
      updateContent(`contentSections.${key}.${path}`, value);
    } else {
      updateContent(`${sectionId}.${path}`, value);
    }
    setHasUnsavedChanges(true);
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId) => {
    saveToHistory();
    
    if (sectionId.startsWith('contentSections.')) {
      const key = sectionId.replace('contentSections.', '');
      const currentVisible = content.contentSections?.[key]?.visible !== false;
      updateContent(`contentSections.${key}.visible`, !currentVisible);
    } else {
      const currentVisible = content[sectionId]?.visible !== false;
      updateContent(`${sectionId}.visible`, !currentVisible);
    }
    setHasUnsavedChanges(true);
  };

  // Move section up/down
  const moveSection = (sectionId, direction) => {
    const index = sectionOrder.indexOf(sectionId);
    if (direction === 'up' && index > 0) {
      const newOrder = [...sectionOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setSectionOrder(newOrder);
      saveToHistory();
    } else if (direction === 'down' && index < sectionOrder.length - 1) {
      const newOrder = [...sectionOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setSectionOrder(newOrder);
      saveToHistory();
    }
  };

  // Save website - now saves to context (which auto-saves to localStorage)
  const handleSave = async () => {
    setHasUnsavedChanges(false);
    showNotification('Website saved successfully! Changes will appear on the live site.', 'success');
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Export content as JSON
  const handleExport = () => {
    const json = exportContent();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hennessey-website-content.json';
    a.click();
    showNotification('Content exported!', 'success');
  };

  // Import content from JSON
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = importContent(event.target.result);
          if (success) {
            showNotification('Content imported successfully!', 'success');
          } else {
            showNotification('Error importing content. Invalid format.', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all content to defaults? This cannot be undone.')) {
      resetToDefaults();
      showNotification('Content reset to defaults!', 'success');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setIsPreviewMode(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Get device width
  const getDeviceWidth = () => {
    switch (deviceView) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="website-editor loading">
        <div className="loading-spinner"></div>
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className={`website-editor ${isPreviewMode ? 'preview-mode' : ''}`}>
      {/* Top Toolbar */}
      <header className="editor-toolbar">
        <div className="toolbar-left">
          <a href="/" className="editor-logo">
            <img src={content.global?.logo || '/logo.png'} alt="Hennessey Estate" />
            <span>Editor</span>
          </a>
        </div>
        
        <div className="toolbar-center">
          <div className="device-switcher">
            <button 
              className={`device-btn ${deviceView === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceView('desktop')}
              title="Desktop view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </button>
            <button 
              className={`device-btn ${deviceView === 'tablet' ? 'active' : ''}`}
              onClick={() => setDeviceView('tablet')}
              title="Tablet view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <path d="M12 18h.01"/>
              </svg>
            </button>
            <button 
              className={`device-btn ${deviceView === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceView('mobile')}
              title="Mobile view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <path d="M12 18h.01"/>
              </svg>
            </button>
          </div>
          
          <div className="history-controls">
            <button 
              className="toolbar-btn" 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7v6h6M3 13c1.5-4.5 6-7.5 11-6.5s9 5.5 9 11"/>
              </svg>
            </button>
            <button 
              className="toolbar-btn" 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 7v6h-6M21 13c-1.5-4.5-6-7.5-11-6.5S1 12 1 17.5"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="toolbar-right">
          <button 
            className={`toolbar-btn preview-btn ${isPreviewMode ? 'active' : ''}`}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Preview</span>
          </button>
          
          <button 
            className={`toolbar-btn save-btn ${hasUnsavedChanges ? 'has-changes' : ''}`}
            onClick={handleSave}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
            <span>Save</span>
            {hasUnsavedChanges && <span className="unsaved-dot"></span>}
          </button>
          
          <a href="/" className="toolbar-btn exit-btn" target="_blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            <span>View Site</span>
          </a>
        </div>
      </header>

      <div className={`editor-main ${!isPreviewMode && selectedElement ? 'has-right-panel' : ''}`}>
        {/* Left Panel - Elements & Sections */}
        {!isPreviewMode && (
          <aside className="editor-left-panel">
            <div className="panel-tabs">
              <button 
                className={`panel-tab ${leftPanelTab === 'sections' ? 'active' : ''}`}
                onClick={() => setLeftPanelTab('sections')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
                Sections
              </button>
              <button 
                className={`panel-tab ${leftPanelTab === 'design' ? 'active' : ''}`}
                onClick={() => setLeftPanelTab('design')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/>
                  <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
                  <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/>
                  <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
                </svg>
                Design
              </button>
              <button 
                className={`panel-tab ${leftPanelTab === 'tools' ? 'active' : ''}`}
                onClick={() => setLeftPanelTab('tools')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                </svg>
                Tools
              </button>
            </div>

            <div className="panel-content">
              {leftPanelTab === 'sections' && (
                <SectionsPanel 
                  sectionOrder={sectionOrder}
                  content={content}
                  getFlatSection={getFlatSection}
                  selectedElement={selectedElement}
                  onSelect={setSelectedElement}
                  onToggleVisibility={toggleSectionVisibility}
                  onMoveSection={moveSection}
                />
              )}
              
              {leftPanelTab === 'design' && (
                <DesignPanel 
                  content={content}
                  onUpdateContent={updateContent}
                  saveToHistory={saveToHistory}
                />
              )}
              
              {leftPanelTab === 'tools' && (
                <ToolsPanel 
                  onExport={handleExport}
                  onImport={handleImport}
                  onReset={handleReset}
                />
              )}
            </div>
          </aside>
        )}

        {/* Center - Canvas */}
        <main className="editor-canvas" ref={canvasRef}>
          <div 
            className="canvas-viewport"
            style={{ 
              width: getDeviceWidth(),
              maxWidth: deviceView === 'desktop' ? 'none' : getDeviceWidth(),
            }}
          >
            <CanvasPreview 
              content={content}
              sectionOrder={sectionOrder}
              getFlatSection={getFlatSection}
              selectedElement={selectedElement}
              onSelect={setSelectedElement}
              isPreviewMode={isPreviewMode}
              deviceView={deviceView}
            />
          </div>
        </main>

        {/* Right Panel - Properties */}
        {!isPreviewMode && selectedElement && (
          <aside className="editor-right-panel">
            <PropertiesPanel 
              sectionId={selectedElement}
              section={getFlatSection(selectedElement)}
              content={content}
              onUpdateContent={(path, value) => updateSectionContent(selectedElement, path, value)}
              onClose={() => setSelectedElement(null)}
            />
          </aside>
        )}
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`editor-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

// ============================================
// SECTIONS PANEL - List all sections
// ============================================
const SectionsPanel = ({ sectionOrder, content, getFlatSection, selectedElement, onSelect, onToggleVisibility, onMoveSection }) => {
  const sectionLabels = {
    header: 'Navigation Header',
    hero: 'Hero Section',
    reviews: 'Reviews',
    rooms: 'Rooms Section',
    buyout: 'Full Property Buyout',
    'contentSections.pool': 'The Pool',
    'contentSections.tastingRoom': 'Tasting Room',
    'contentSections.breakfast': 'Breakfast Section',
    'contentSections.sauna': 'Sauna Section',
    amenities: 'Amenities Grid',
    location: 'Location Section',
    newsletter: 'Newsletter Signup',
    footer: 'Footer',
  };

  return (
    <div className="sections-panel">
      <div className="panel-header">
        <h3>Page Sections</h3>
        <p>Click to edit, use arrows to reorder</p>
      </div>
      <div className="sections-list">
        {sectionOrder.map((sectionId, index) => {
          const section = getFlatSection(sectionId);
          if (!section) return null;
          
          const isVisible = section.visible !== false;
          
          return (
            <div 
              key={sectionId}
              className={`section-item ${selectedElement === sectionId ? 'selected' : ''} ${!isVisible ? 'hidden-section' : ''}`}
              onClick={() => onSelect(sectionId)}
            >
              <div className="section-item-left">
                <button 
                  className="visibility-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(sectionId);
                  }}
                  title={isVisible ? 'Hide section' : 'Show section'}
                >
                  {isVisible ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
                <span className="section-name">{sectionLabels[sectionId] || sectionId}</span>
              </div>
              <div className="section-item-right">
                <button 
                  className="move-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSection(sectionId, 'up');
                  }}
                  disabled={index === 0}
                  title="Move up"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18,15 12,9 6,15"/>
                  </svg>
                </button>
                <button 
                  className="move-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSection(sectionId, 'down');
                  }}
                  disabled={index === sectionOrder.length - 1}
                  title="Move down"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// DESIGN PANEL - Global styles
// ============================================
const DesignPanel = ({ content, onUpdateContent, saveToHistory }) => {
  const logoInputRef = useRef(null);
  
  const colorLabels = {
    primary: 'Primary (Forest Green)',
    secondary: 'Secondary (Gold)',
    accent: 'Accent',
    background: 'Background (Cream)',
    text: 'Text Color',
  };

  const fontOptions = [
    { value: "'Playfair Display', serif", label: 'Playfair Display' },
    { value: "'Lato', sans-serif", label: 'Lato' },
    { value: "'Georgia', serif", label: 'Georgia' },
    { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond' },
    { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  ];

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      saveToHistory();
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateContent('global.logo', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="design-panel">
      <div className="panel-header">
        <h3>Site Design</h3>
        <p>Colors, fonts & branding</p>
      </div>
      
      <div className="design-section">
        <h4>Brand Colors</h4>
        <div className="color-grid">
          {Object.entries(content.global?.colors || {}).slice(0, 5).map(([key, value]) => (
            <div key={key} className="color-item">
              <label>{colorLabels[key] || key}</label>
              <div className="color-input-wrapper">
                <input 
                  type="color" 
                  value={value}
                  onChange={(e) => {
                    saveToHistory();
                    onUpdateContent(`global.colors.${key}`, e.target.value);
                  }}
                />
                <input 
                  type="text" 
                  value={value}
                  onChange={(e) => {
                    saveToHistory();
                    onUpdateContent(`global.colors.${key}`, e.target.value);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="design-section">
        <h4>Typography</h4>
        <div className="font-selector">
          <label>Heading Font</label>
          <select 
            value={content.global?.fonts?.heading || "'Playfair Display', serif"}
            onChange={(e) => {
              saveToHistory();
              onUpdateContent('global.fonts.heading', e.target.value);
            }}
          >
            {fontOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="font-selector">
          <label>Body Font</label>
          <select 
            value={content.global?.fonts?.body || "'Lato', sans-serif"}
            onChange={(e) => {
              saveToHistory();
              onUpdateContent('global.fonts.body', e.target.value);
            }}
          >
            {fontOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="design-section">
        <h4>Logo</h4>
        <div className="logo-preview">
          <img src={content.global?.logo || '/logo.png'} alt="Current logo" />
        </div>
        <input 
          ref={logoInputRef}
          type="file" 
          accept="image/*"
          onChange={handleLogoUpload}
          style={{ display: 'none' }}
        />
        <button className="upload-btn" onClick={() => logoInputRef.current?.click()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload New Logo
        </button>
      </div>

      <div className="design-section">
        <h4>Site Info</h4>
        <div className="property-field">
          <label>Site Name</label>
          <input 
            type="text"
            value={content.global?.siteName || 'Hennessey Estate'}
            onChange={(e) => {
              saveToHistory();
              onUpdateContent('global.siteName', e.target.value);
            }}
          />
        </div>
        <div className="property-field checkbox-field">
          <label>
            <input 
              type="checkbox"
              checked={content.global?.showEstablished !== false}
              onChange={(e) => {
                saveToHistory();
                onUpdateContent('global.showEstablished', e.target.checked);
              }}
            />
            Show "EST. 1889" text
          </label>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TOOLS PANEL - Import/Export/Reset
// ============================================
const ToolsPanel = ({ onExport, onImport, onReset }) => {
  return (
    <div className="tools-panel">
      <div className="panel-header">
        <h3>Tools</h3>
        <p>Backup and restore content</p>
      </div>
      
      <div className="tools-section">
        <h4>Backup Content</h4>
        <p className="tools-hint">Download a JSON file of all your website content</p>
        <button className="tools-btn" onClick={onExport}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Content
        </button>
      </div>
      
      <div className="tools-section">
        <h4>Restore Content</h4>
        <p className="tools-hint">Import a previously exported JSON file</p>
        <button className="tools-btn" onClick={onImport}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import Content
        </button>
      </div>
      
      <div className="tools-section danger">
        <h4>Reset to Defaults</h4>
        <p className="tools-hint">Restore all content to the original defaults. This cannot be undone!</p>
        <button className="tools-btn danger" onClick={onReset}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          Reset All Content
        </button>
      </div>
    </div>
  );
};

// ============================================
// Media Upload Component
// ============================================
const MediaUpload = ({ label, currentValue, onUpload, accept = "image/*", type = "image" }) => {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpload(event.target.result);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
        alert('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="media-upload-field">
      <label>{label}</label>
      <div className="media-preview">
        {type === 'video' && currentValue ? (
          <video src={currentValue} muted loop className="media-preview-video">
            <source src={currentValue} type="video/mp4" />
          </video>
        ) : currentValue ? (
          <img src={currentValue} alt="Preview" className="media-preview-image" />
        ) : (
          <div className="media-preview-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {type === 'video' ? (
                <>
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </>
              )}
            </svg>
            <span>No {type} selected</span>
          </div>
        )}
      </div>
      <input 
        ref={inputRef}
        type="file" 
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className="media-upload-actions">
        <button 
          className="upload-btn small" 
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {currentValue ? 'Replace' : 'Upload'} {type === 'video' ? 'Video' : 'Image'}
            </>
          )}
        </button>
        {currentValue && currentValue.startsWith('data:') && (
          <button 
            className="remove-btn small"
            onClick={() => onUpload('')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// PROPERTIES PANEL - Edit selected element
// ============================================
const PropertiesPanel = ({ sectionId, section, content, onUpdateContent, onClose }) => {
  if (!section) return null;

  const sectionLabels = {
    header: 'Navigation Header',
    hero: 'Hero Section',
    reviews: 'Reviews',
    rooms: 'Rooms Section',
    buyout: 'Full Property Buyout',
    'contentSections.pool': 'The Pool',
    'contentSections.tastingRoom': 'Tasting Room',
    'contentSections.breakfast': 'Breakfast Section',
    'contentSections.sauna': 'Sauna Section',
    amenities: 'Amenities Grid',
    location: 'Location Section',
    newsletter: 'Newsletter Signup',
    footer: 'Footer',
  };

  // Determine section type
  const isContentSection = sectionId.startsWith('contentSections.');
  
  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>{sectionLabels[sectionId] || 'Section Settings'}</h3>
        <button className="close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="properties-content">
        {/* Header/Navigation specific */}
        {sectionId === 'header' && (
          <HeaderProperties section={section} onUpdateContent={onUpdateContent} />
        )}

        {/* Hero specific */}
        {sectionId === 'hero' && (
          <HeroProperties section={section} onUpdateContent={onUpdateContent} />
        )}

        {/* Content sections (pool, tasting room, etc.) */}
        {isContentSection && (
          <ContentSectionProperties section={section} onUpdateContent={onUpdateContent} />
        )}

        {/* Rooms section */}
        {sectionId === 'rooms' && (
          <RoomsProperties section={section} onUpdateContent={onUpdateContent} />
        )}

        {/* Buyout section */}
        {sectionId === 'buyout' && (
          <BuyoutProperties section={section} onUpdateContent={onUpdateContent} />
        )}

        {/* Reviews section */}
        {sectionId === 'reviews' && (
          <ReviewsProperties section={section} onUpdateContent={onUpdateContent} />
        )}

        {/* Newsletter section */}
        {sectionId === 'newsletter' && (
          <NewsletterProperties section={section} onUpdateContent={onUpdateContent} />
        )}

        {/* Location section */}
        {sectionId === 'location' && (
          <LocationProperties section={section} onUpdateContent={onUpdateContent} />
        )}
      </div>
    </div>
  );
};

// Individual property panels for each section type
const HeaderProperties = ({ section, onUpdateContent }) => (
  <div className="properties-section">
    <h4>Navigation Links</h4>
    {section.navLinks?.map((link, index) => (
      <div key={index} className="nav-link-editor">
        <div className="property-field">
          <label>Link {index + 1}</label>
          <input 
            type="text"
            value={link.label}
            onChange={(e) => {
              const newLinks = [...section.navLinks];
              newLinks[index] = { ...newLinks[index], label: e.target.value };
              onUpdateContent('navLinks', newLinks);
            }}
            placeholder="Label"
          />
          <input 
            type="text"
            value={link.href}
            onChange={(e) => {
              const newLinks = [...section.navLinks];
              newLinks[index] = { ...newLinks[index], href: e.target.value };
              onUpdateContent('navLinks', newLinks);
            }}
            placeholder="URL"
          />
        </div>
      </div>
    ))}
    <button 
      className="add-link-btn"
      onClick={() => {
        const newLinks = [...(section.navLinks || []), { label: 'New Link', href: '#' }];
        onUpdateContent('navLinks', newLinks);
      }}
    >
      + Add Link
    </button>
    
    <div className="property-divider"></div>
    <div className="property-field">
      <label>Book Button Text</label>
      <input 
        type="text"
        value={section.bookButtonText}
        onChange={(e) => onUpdateContent('bookButtonText', e.target.value)}
      />
    </div>
    <div className="property-field">
      <label>Book Button Link</label>
      <input 
        type="text"
        value={section.bookButtonLink}
        onChange={(e) => onUpdateContent('bookButtonLink', e.target.value)}
      />
    </div>
  </div>
);

const HeroProperties = ({ section, onUpdateContent }) => (
  <>
    <div className="properties-section">
      <h4>Content</h4>
      <div className="property-field">
        <label>Title Line 1</label>
        <input 
          type="text"
          value={section.title}
          onChange={(e) => onUpdateContent('title', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Title Line 2</label>
        <input 
          type="text"
          value={section.titleLine2}
          onChange={(e) => onUpdateContent('titleLine2', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Emphasis Word (italic)</label>
        <input 
          type="text"
          value={section.titleEmphasis}
          onChange={(e) => onUpdateContent('titleEmphasis', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Subtitle</label>
        <textarea 
          value={section.subtitle}
          onChange={(e) => onUpdateContent('subtitle', e.target.value)}
          rows={4}
        />
      </div>
      <div className="property-field">
        <label>CTA Button Text</label>
        <input 
          type="text"
          value={section.ctaText}
          onChange={(e) => onUpdateContent('ctaText', e.target.value)}
        />
      </div>
    </div>
    
    <div className="properties-section">
      <h4>Media</h4>
      <MediaUpload 
        label="Background Video"
        currentValue={section.backgroundVideo}
        onUpload={(value) => onUpdateContent('backgroundVideo', value)}
        accept="video/mp4,video/webm"
        type="video"
      />
      <MediaUpload 
        label="Fallback Image"
        currentValue={section.backgroundImage}
        onUpload={(value) => onUpdateContent('backgroundImage', value)}
        accept="image/*"
        type="image"
      />
    </div>
  </>
);

const ContentSectionProperties = ({ section, onUpdateContent }) => (
  <>
    <div className="properties-section">
      <h4>Content</h4>
      <div className="property-field">
        <label>Title</label>
        <input 
          type="text"
          value={section.title}
          onChange={(e) => onUpdateContent('title', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Subtitle</label>
        <input 
          type="text"
          value={section.subtitle}
          onChange={(e) => onUpdateContent('subtitle', e.target.value)}
        />
      </div>
      {section.paragraphs?.map((para, idx) => (
        <div className="property-field" key={idx}>
          <label>Paragraph {idx + 1}</label>
          <textarea 
            value={para}
            onChange={(e) => {
              const newParagraphs = [...section.paragraphs];
              newParagraphs[idx] = e.target.value;
              onUpdateContent('paragraphs', newParagraphs);
            }}
            rows={4}
          />
        </div>
      ))}
      <div className="property-field">
        <label>CTA Button Text</label>
        <input 
          type="text"
          value={section.ctaText}
          onChange={(e) => onUpdateContent('ctaText', e.target.value)}
        />
      </div>
    </div>
    
    <div className="properties-section">
      <h4>Image</h4>
      <MediaUpload 
        label="Section Image"
        currentValue={section.image}
        onUpload={(value) => onUpdateContent('image', value)}
        accept="image/*"
        type="image"
      />
    </div>
  </>
);

const RoomsProperties = ({ section, onUpdateContent }) => (
  <>
    <div className="properties-section">
      <h4>Content</h4>
      <div className="property-field">
        <label>Title</label>
        <input 
          type="text"
          value={section.title}
          onChange={(e) => onUpdateContent('title', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Subtitle</label>
        <input 
          type="text"
          value={section.subtitle}
          onChange={(e) => onUpdateContent('subtitle', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Description</label>
        <textarea 
          value={section.description}
          onChange={(e) => onUpdateContent('description', e.target.value)}
          rows={6}
        />
      </div>
      <div className="property-field">
        <label>Starting Price</label>
        <input 
          type="text"
          value={section.priceFrom}
          onChange={(e) => onUpdateContent('priceFrom', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Peak Price</label>
        <input 
          type="text"
          value={section.pricePeak}
          onChange={(e) => onUpdateContent('pricePeak', e.target.value)}
        />
      </div>
    </div>
    
    <div className="properties-section">
      <h4>Image</h4>
      <MediaUpload 
        label="Room Image"
        currentValue={section.image}
        onUpload={(value) => onUpdateContent('image', value)}
        accept="image/*"
        type="image"
      />
    </div>
  </>
);

const BuyoutProperties = ({ section, onUpdateContent }) => (
  <>
    <div className="properties-section">
      <h4>Content</h4>
      <div className="property-field">
        <label>Badge Text</label>
        <input 
          type="text"
          value={section.badge}
          onChange={(e) => onUpdateContent('badge', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Title</label>
        <input 
          type="text"
          value={section.title}
          onChange={(e) => onUpdateContent('title', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Subtitle</label>
        <input 
          type="text"
          value={section.subtitle}
          onChange={(e) => onUpdateContent('subtitle', e.target.value)}
        />
      </div>
      <div className="property-field">
        <label>Lead Text</label>
        <textarea 
          value={section.lead}
          onChange={(e) => onUpdateContent('lead', e.target.value)}
          rows={3}
        />
      </div>
      <div className="property-field">
        <label>Description</label>
        <textarea 
          value={section.description}
          onChange={(e) => onUpdateContent('description', e.target.value)}
          rows={6}
        />
      </div>
    </div>
    
    <div className="properties-section">
      <h4>Background</h4>
      <MediaUpload 
        label="Background Image"
        currentValue={section.backgroundImage}
        onUpload={(value) => onUpdateContent('backgroundImage', value)}
        accept="image/*"
        type="image"
      />
    </div>
  </>
);

const ReviewsProperties = ({ section, onUpdateContent }) => (
  <div className="properties-section">
    <h4>Content</h4>
    <div className="property-field">
      <label>Rating</label>
      <input 
        type="text"
        value={section.rating}
        onChange={(e) => onUpdateContent('rating', e.target.value)}
      />
    </div>
    <div className="property-field">
      <label>Platform</label>
      <input 
        type="text"
        value={section.platform}
        onChange={(e) => onUpdateContent('platform', e.target.value)}
      />
    </div>
    <div className="property-field">
      <label>Review Count</label>
      <input 
        type="text"
        value={section.reviewCount}
        onChange={(e) => onUpdateContent('reviewCount', e.target.value)}
      />
    </div>
    <div className="property-field">
      <label>Reviews Link</label>
      <input 
        type="text"
        value={section.reviewsLink}
        onChange={(e) => onUpdateContent('reviewsLink', e.target.value)}
      />
    </div>
  </div>
);

const NewsletterProperties = ({ section, onUpdateContent }) => (
  <div className="properties-section">
    <h4>Content</h4>
    <div className="property-field">
      <label>Title</label>
      <input 
        type="text"
        value={section.title}
        onChange={(e) => onUpdateContent('title', e.target.value)}
      />
    </div>
    <div className="property-field">
      <label>Subtitle</label>
      <textarea 
        value={section.subtitle}
        onChange={(e) => onUpdateContent('subtitle', e.target.value)}
        rows={3}
      />
    </div>
    <div className="property-field">
      <label>Placeholder Text</label>
      <input 
        type="text"
        value={section.placeholder}
        onChange={(e) => onUpdateContent('placeholder', e.target.value)}
      />
    </div>
    <div className="property-field">
      <label>Button Text</label>
      <input 
        type="text"
        value={section.buttonText}
        onChange={(e) => onUpdateContent('buttonText', e.target.value)}
      />
    </div>
  </div>
);

const LocationProperties = ({ section, onUpdateContent }) => (
  <div className="properties-section">
    <h4>Content</h4>
    <div className="property-field">
      <label>Title</label>
      <input 
        type="text"
        value={section.title}
        onChange={(e) => onUpdateContent('title', e.target.value)}
      />
    </div>
    <div className="property-field">
      <label>Subtitle</label>
      <input 
        type="text"
        value={section.subtitle}
        onChange={(e) => onUpdateContent('subtitle', e.target.value)}
      />
    </div>
    {section.paragraphs?.map((para, idx) => (
      <div className="property-field" key={idx}>
        <label>Paragraph {idx + 1}</label>
        <textarea 
          value={para}
          onChange={(e) => {
            const newParagraphs = [...section.paragraphs];
            newParagraphs[idx] = e.target.value;
            onUpdateContent('paragraphs', newParagraphs);
          }}
          rows={3}
        />
      </div>
    ))}
    <div className="property-field">
      <label>CTA Button Text</label>
      <input 
        type="text"
        value={section.ctaText}
        onChange={(e) => onUpdateContent('ctaText', e.target.value)}
      />
    </div>
  </div>
);

// ============================================
// CANVAS PREVIEW - Live website preview
// ============================================
const CanvasPreview = ({ content, sectionOrder, getFlatSection, selectedElement, onSelect, isPreviewMode, deviceView }) => {
  const renderSection = (sectionId) => {
    const section = getFlatSection(sectionId);
    if (!section || section.visible === false) return null;

    // Skip header as standalone since it's built into hero
    if (sectionId === 'header') return null;

    const isSelected = selectedElement === sectionId;
    const sectionType = sectionId.startsWith('contentSections.') ? 'content' : sectionId;

    return (
      <div 
        key={sectionId}
        className={`preview-section ${sectionType}-preview ${isSelected ? 'selected' : ''} ${isPreviewMode ? '' : 'editable'}`}
        onClick={(e) => {
          if (!isPreviewMode) {
            e.stopPropagation();
            onSelect(sectionId);
          }
        }}
      >
        {!isPreviewMode && isSelected && (
          <div className="section-selection-indicator">
            <span>{sectionId.replace('contentSections.', '')}</span>
          </div>
        )}
        
        <SectionRenderer 
          sectionId={sectionId}
          section={section}
          content={content}
          deviceView={deviceView}
        />
      </div>
    );
  };

  return (
    <div className={`canvas-preview device-${deviceView}`}>
      {sectionOrder.map(renderSection)}
    </div>
  );
};

// ============================================
// SECTION RENDERER - Render individual sections
// ============================================
const SectionRenderer = ({ sectionId, section, content, deviceView }) => {
  const globalContent = content.global || {};
  const headerContent = content.header || {};

  // Determine section type based on sectionId
  if (sectionId === 'hero') {
    return (
      <div className="hero-preview-content">
        {section.backgroundVideo && (
          <video className="hero-bg-video" autoPlay muted loop playsInline poster={section.backgroundImage}>
            <source src={section.backgroundVideo} type="video/mp4" />
          </video>
        )}
        {!section.backgroundVideo && section.backgroundImage && (
          <div className="hero-bg-image" style={{ backgroundImage: `url(${section.backgroundImage})` }} />
        )}
        <div className="hero-bg-overlay"></div>
        
        {/* Header */}
        <header className="preview-header">
          <nav className="preview-nav">
            <div className="preview-nav-left">
              {headerContent.navLinks?.slice(0, 4).map((link, i) => (
                <span key={i}>{link.label}</span>
              ))}
            </div>
            <div className="preview-logo">
              <img src={globalContent.logo || '/logo.png'} alt={globalContent.siteName} />
              {globalContent.showEstablished !== false && <span className="est">{globalContent.establishedText || 'EST. 1889'}</span>}
            </div>
            <div className="preview-nav-right">
              {headerContent.navLinks?.slice(4).map((link, i) => (
                <span key={i}>{link.label}</span>
              ))}
              <span className="nav-book-btn">{headerContent.bookButtonText || 'Book Now'}</span>
            </div>
          </nav>
        </header>
        
        <div className="hero-text">
          <h1>
            {section.title}<br/>
            {section.titleLine2} <em>{section.titleEmphasis}</em>
          </h1>
          <p>{section.subtitle}</p>
          <button className="hero-cta">{section.ctaText}</button>
        </div>
      </div>
    );
  }

  if (sectionId === 'reviews') {
    return (
      <div className="reviews-preview-content">
        <div className="reviews-header">
          <div className="stars">★★★★★</div>
          <h2>{section.rating} on {section.platform}</h2>
          <p>{section.reviewCount} Five-Star Reviews</p>
        </div>
        <div className="reviews-grid">
          {section.items?.map((review, i) => (
            <div key={i} className="review-card">
              <p>{review.text}</p>
              <span>— {review.author}, {review.source}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sectionId === 'rooms') {
    return (
      <div className="rooms-preview-content">
        <div className="rooms-text">
          <h2>{section.title}</h2>
          <h3>{section.subtitle}</h3>
          <p>{section.description}</p>
          <div className="room-features">
            {section.features?.map((f, i) => <span key={i}>✦ {f}</span>)}
          </div>
          <div className="room-pricing">
            <span>From {section.priceFrom}/night</span>
            <span>{section.pricePeak}/night peak season</span>
          </div>
          <button className="rooms-cta">{section.ctaText}</button>
        </div>
        <div className="rooms-image">
          <img src={section.image} alt="Room" />
        </div>
      </div>
    );
  }

  if (sectionId === 'buyout') {
    return (
      <div className="buyout-preview-content" style={{ backgroundImage: `url(${section.backgroundImage})` }}>
        <div className="buyout-overlay"></div>
        <div className="buyout-text">
          <span className="buyout-badge">{section.badge}</span>
          <h2>{section.title}</h2>
          <h3>{section.subtitle}</h3>
          <p className="buyout-lead">{section.lead}</p>
          <div className="buyout-features">
            {section.features?.map((f, i) => (
              <div key={i} className="buyout-feature-item">
                <strong>{f.title}</strong>
                <span>{f.description}</span>
              </div>
            ))}
          </div>
          <p className="buyout-description">{section.description}</p>
          <button className="buyout-cta">{section.ctaText}</button>
        </div>
      </div>
    );
  }

  // Content sections (pool, tastingRoom, breakfast, sauna)
  if (sectionId.startsWith('contentSections.')) {
    return (
      <div className={`content-preview-content image-${section.imagePosition || 'right'}`}>
        <div className="content-text">
          <h2>{section.title}</h2>
          <h3>{section.subtitle}</h3>
          {section.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
          <button className="content-cta">{section.ctaText}</button>
        </div>
        <div className="content-image">
          <img src={section.image} alt={section.title} />
        </div>
      </div>
    );
  }

  if (sectionId === 'amenities') {
    return (
      <div className="amenities-preview-content">
        <h2>{section.title}</h2>
        <div className="amenities-grid">
          {section.items?.map((item, i) => (
            <div key={i} className="amenity-item">
              <span className="amenity-icon">{item.icon}</span>
              <span className="amenity-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sectionId === 'location') {
    return (
      <div className="location-preview-content">
        <h2>{section.title}</h2>
        <h3>{section.subtitle}</h3>
        {section.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
        <button className="location-cta">{section.ctaText}</button>
      </div>
    );
  }

  if (sectionId === 'newsletter') {
    return (
      <div className="newsletter-preview-content">
        <h2>{section.title}</h2>
        <p>{section.subtitle}</p>
        <div className="newsletter-form">
          <input type="email" placeholder={section.placeholder} />
          <button>{section.buttonText}</button>
        </div>
        <span className="newsletter-disclaimer">{section.disclaimer}</span>
      </div>
    );
  }

  if (sectionId === 'footer') {
    return (
      <div className="footer-preview-content">
        <p className="footer-tagline">{section.tagline}</p>
        <div className="footer-columns">
          <div className="footer-col">
            <h4>Visit</h4>
            <p>
              {globalContent.contact?.address?.name}<br/>
              {globalContent.contact?.address?.street}<br/>
              {globalContent.contact?.address?.city}
            </p>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <p>
              {globalContent.contact?.email}<br/>
              {globalContent.contact?.phone}
            </p>
          </div>
          <div className="footer-col">
            <h4>Follow</h4>
            <div className="footer-social">
              <span>IG</span>
              <span>Pin</span>
              <span>TA</span>
            </div>
          </div>
        </div>
        <p className="footer-copyright">{section.copyright}</p>
      </div>
    );
  }

  return <div className="unknown-section">Unknown section: {sectionId}</div>;
};

export default WebsiteEditor;
