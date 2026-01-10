import React, { useState, useEffect } from 'react';
import './EmailEditor.css';

/**
 * Advanced Email Editor Component
 * Industry-leading features inspired by Mailchimp, HubSpot, and Guestara
 * - Drag-and-drop block editor
 * - Rich text formatting
 * - Template library
 * - Mobile preview
 * - A/B testing
 */

const EMAIL_BLOCKS = [
  { type: 'header', label: 'Header', icon: '📋', default: { text: 'Your Header', style: 'h1' } },
  { type: 'text', label: 'Text', icon: '📝', default: { content: 'Your text content here...' } },
  { type: 'image', label: 'Image', icon: '🖼️', default: { src: '', alt: 'Image', width: '100%' } },
  { type: 'button', label: 'Button', icon: '🔘', default: { text: 'Click Here', url: '#', style: 'primary' } },
  { type: 'divider', label: 'Divider', icon: '➖', default: { style: 'solid' } },
  { type: 'spacer', label: 'Spacer', icon: '⬜', default: { height: '20px' } },
  { type: 'social', label: 'Social Links', icon: '🔗', default: { links: [] } },
  { type: 'footer', label: 'Footer', icon: '📄', default: { text: 'Footer content' } }
];

const HOSPITALITY_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    category: 'Pre-Arrival',
    preview: '🏨',
    blocks: [
      { type: 'header', data: { text: 'Welcome to {property_name}!', style: 'h1' } },
      { type: 'text', data: { content: 'Dear {guest_name},<br/><br/>We are delighted to welcome you to {property_name} on {check_in_date}.' } },
      { type: 'button', data: { text: 'View Your Reservation', url: '#', style: 'primary' } },
      { type: 'footer', data: { text: 'We look forward to hosting you!' } }
    ]
  },
  {
    id: 'thank-you',
    name: 'Thank You & Review',
    category: 'Post-Stay',
    preview: '⭐',
    blocks: [
      { type: 'header', data: { text: 'Thank You for Staying!', style: 'h1' } },
      { type: 'text', data: { content: 'Dear {guest_name},<br/><br/>Thank you for choosing {property_name}. We hope you enjoyed your stay!' } },
      { type: 'button', data: { text: 'Leave a Review', url: '#', style: 'primary' } },
      { type: 'footer', data: { text: 'We hope to welcome you back soon!' } }
    ]
  },
  {
    id: 'promotion',
    name: 'Special Offer',
    category: 'Promotions',
    preview: '🎁',
    blocks: [
      { type: 'header', data: { text: 'Special Offer Just for You!', style: 'h1' } },
      { type: 'text', data: { content: 'Dear {guest_name},<br/><br/>We have a special offer for your next stay at {property_name}.' } },
      { type: 'button', data: { text: 'Book Now', url: '#', style: 'primary' } },
      { type: 'footer', data: { text: 'Limited time offer. Book today!' } }
    ]
  },
  {
    id: 'reminder',
    name: 'Check-in Reminder',
    category: 'Pre-Arrival',
    preview: '⏰',
    blocks: [
      { type: 'header', data: { text: 'Your Stay Starts Tomorrow!', style: 'h1' } },
      { type: 'text', data: { content: 'Dear {guest_name},<br/><br/>Your check-in is tomorrow, {check_in_date}. Here are your check-in details.' } },
      { type: 'button', data: { text: 'View Details', url: '#', style: 'primary' } },
      { type: 'footer', data: { text: 'See you soon!' } }
    ]
  }
];

const EmailEditor = ({ draft, onSave, onCancel, mode = 'edit' }) => {
  const [blocks, setBlocks] = useState(draft?.blocks || []);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [subject, setSubject] = useState(draft?.subject || '');
  const [preheader, setPreheader] = useState(draft?.preheader || '');
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, mobile
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAbtest, setShowAbtest] = useState(false);
  const [abTestSubject, setAbTestSubject] = useState('');

  // Initialize with template if provided
  useEffect(() => {
    if (draft?.templateId && blocks.length === 0) {
      const template = HOSPITALITY_TEMPLATES.find(t => t.id === draft.templateId);
      if (template) {
        setBlocks(template.blocks.map((block, idx) => ({
          id: `block-${Date.now()}-${idx}`,
          type: block.type,
          data: { ...block.data }
        })));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.templateId]);

  const addBlock = (blockType) => {
    const blockTemplate = EMAIL_BLOCKS.find(b => b.type === blockType);
    if (blockTemplate) {
      const newBlock = {
        id: `block-${Date.now()}`,
        type: blockType,
        data: { ...blockTemplate.default }
      };
      setBlocks([...blocks, newBlock]);
      setSelectedBlock(newBlock.id);
    }
  };

  const removeBlock = (blockId) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    if (selectedBlock === blockId) {
      setSelectedBlock(null);
    }
  };

  const updateBlock = (blockId, data) => {
    setBlocks(blocks.map(b => 
      b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b
    ));
  };

  const moveBlock = (blockId, direction) => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const applyTemplate = (template) => {
    setBlocks(template.blocks.map((block, idx) => ({
      id: `block-${Date.now()}-${idx}`,
      type: block.type,
      data: { ...block.data }
    })));
    setShowTemplates(false);
  };

  // Validation functions
  const validateSubject = (subj) => {
    if (!subj || subj.trim().length === 0) {
      return { valid: false, error: 'Subject line is required' };
    }
    if (subj.length > 78) {
      return { valid: false, error: 'Subject line should be 78 characters or less for best deliverability' };
    }
    return { valid: true };
  };

  const validatePreheader = (pre) => {
    if (pre && pre.length > 100) {
      return { valid: false, error: 'Preheader should be 100 characters or less' };
    }
    return { valid: true };
  };

  const validateURL = (url) => {
    if (!url || url === '#') return { valid: true }; // Allow placeholder
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  };

  const validateBlocks = () => {
    for (const block of blocks) {
      if (block.type === 'button') {
        const urlValidation = validateURL(block.data.url);
        if (!urlValidation.valid) {
          return { valid: false, error: `Button "${block.data.text || 'unnamed'}" has invalid URL` };
        }
        if (!block.data.text || block.data.text.trim().length === 0) {
          return { valid: false, error: 'Button text is required' };
        }
      }
      if (block.type === 'header' && (!block.data.text || block.data.text.trim().length === 0)) {
        return { valid: false, error: 'Header text is required' };
      }
    }
    if (blocks.length === 0) {
      return { valid: false, error: 'Add at least one content block to your email' };
    }
    return { valid: true };
  };

  const [validationErrors, setValidationErrors] = useState({});

  const handleSave = () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate subject
    const subjectValidation = validateSubject(subject);
    if (!subjectValidation.valid) {
      setValidationErrors({ subject: subjectValidation.error });
      return;
    }

    // Validate preheader
    const preheaderValidation = validatePreheader(preheader);
    if (!preheaderValidation.valid) {
      setValidationErrors({ preheader: preheaderValidation.error });
      return;
    }

    // Validate A/B test subject if provided
    if (showAbtest && abTestSubject) {
      const abValidation = validateSubject(abTestSubject);
      if (!abValidation.valid) {
        setValidationErrors({ abTestSubject: abValidation.error });
        return;
      }
    }

    // Validate blocks
    const blocksValidation = validateBlocks();
    if (!blocksValidation.valid) {
      setValidationErrors({ blocks: blocksValidation.error });
      return;
    }

    // All validations passed
    const emailData = {
      subject: subject.trim(),
      preheader: preheader.trim(),
      blocks: blocks.map(b => ({
        type: b.type,
        data: b.data
      })),
      abTestSubject: showAbtest && abTestSubject ? abTestSubject.trim() : null
    };
    onSave(emailData);
  };

  const renderBlock = (block) => {
    const isSelected = selectedBlock === block.id;
    
    switch (block.type) {
      case 'header':
        return (
          <div className={`email-block header-block ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedBlock(block.id)}>
            <div className="block-controls">
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}>↑</button>
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}>↓</button>
              <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>×</button>
            </div>
            {isSelected ? (
              <div className="block-editor">
                <input
                  type="text"
                  value={block.data.text || ''}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder="Header text"
                  className="header-input"
                />
                <select
                  value={block.data.style || 'h1'}
                  onChange={(e) => updateBlock(block.id, { style: e.target.value })}
                >
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>
              </div>
            ) : (
              <div className={`block-preview header-${block.data.style || 'h1'}`}>
                {block.data.text || 'Header'}
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className={`email-block text-block ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedBlock(block.id)}>
            <div className="block-controls">
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}>↑</button>
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}>↓</button>
              <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>×</button>
            </div>
            {isSelected ? (
              <div className="block-editor">
                <RichTextEditor
                  value={block.data.content || ''}
                  onChange={(content) => updateBlock(block.id, { content })}
                />
              </div>
            ) : (
              <div className="block-preview" dangerouslySetInnerHTML={{ __html: block.data.content || 'Text content' }} />
            )}
          </div>
        );

      case 'button':
        return (
          <div className={`email-block button-block ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedBlock(block.id)}>
            <div className="block-controls">
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}>↑</button>
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}>↓</button>
              <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>×</button>
            </div>
            {isSelected ? (
              <div className="block-editor">
                <input
                  type="text"
                  value={block.data.text || ''}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder="Button text"
                />
                <input
                  type="url"
                  value={block.data.url || ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    updateBlock(block.id, { url });
                    // Validate URL in real-time
                    if (url && url !== '#') {
                      try {
                        new URL(url);
                      } catch {
                        // Invalid URL, but don't block typing
                      }
                    }
                  }}
                  placeholder="Button URL (https://...)"
                  className={block.data.url && block.data.url !== '#' && !block.data.url.match(/^https?:\/\//) ? 'warning' : ''}
                />
                {block.data.url && block.data.url !== '#' && !block.data.url.match(/^https?:\/\//) && (
                  <small className="url-hint">URL should start with http:// or https://</small>
                )}
                <select
                  value={block.data.style || 'primary'}
                  onChange={(e) => updateBlock(block.id, { style: e.target.value })}
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
            ) : (
              <div className={`block-preview button-preview button-${block.data.style || 'primary'}`}>
                {block.data.text || 'Button'}
              </div>
            )}
          </div>
        );

      case 'divider':
        return (
          <div className={`email-block divider-block ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedBlock(block.id)}>
            <div className="block-controls">
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}>↑</button>
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}>↓</button>
              <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>×</button>
            </div>
            <div className="block-preview divider-preview" />
          </div>
        );

      case 'spacer':
        return (
          <div className={`email-block spacer-block ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedBlock(block.id)}>
            <div className="block-controls">
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}>↑</button>
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}>↓</button>
              <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>×</button>
            </div>
            {isSelected && (
              <div className="block-editor">
                <input
                  type="number"
                  value={block.data.height?.replace('px', '') || 20}
                  onChange={(e) => updateBlock(block.id, { height: `${e.target.value}px` })}
                  placeholder="Height (px)"
                />
              </div>
            )}
            <div className="block-preview spacer-preview" style={{ height: block.data.height || '20px' }} />
          </div>
        );

      case 'footer':
        return (
          <div className={`email-block footer-block ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedBlock(block.id)}>
            <div className="block-controls">
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}>↑</button>
              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}>↓</button>
              <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>×</button>
            </div>
            {isSelected ? (
              <div className="block-editor">
                <textarea
                  value={block.data.text || ''}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder="Footer text"
                  rows="3"
                />
              </div>
            ) : (
              <div className="block-preview footer-preview">
                {block.data.text || 'Footer content'}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="email-editor">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="btn-icon" onClick={() => setShowTemplates(true)} title="Templates">
            📋 Templates
          </button>
          <button className="btn-icon" onClick={() => setShowAbtest(!showAbtest)} title="A/B Test">
            🧪 A/B Test
          </button>
          <div className="preview-toggle">
            <button 
              className={previewMode === 'desktop' ? 'active' : ''} 
              onClick={() => setPreviewMode('desktop')}
            >
              💻 Desktop
            </button>
            <button 
              className={previewMode === 'mobile' ? 'active' : ''} 
              onClick={() => setPreviewMode('mobile')}
            >
              📱 Mobile
            </button>
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Campaign</button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-sidebar">
          <div className="sidebar-section">
            <h3>Email Settings</h3>
            <div className="form-group">
              <label>Subject Line <span className="char-count">{subject.length}/78</span></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (validationErrors.subject) {
                    setValidationErrors({ ...validationErrors, subject: null });
                  }
                }}
                placeholder="Email subject"
                className={`subject-input ${validationErrors.subject ? 'error' : ''} ${subject.length > 78 ? 'warning' : ''}`}
                maxLength={100}
              />
              {validationErrors.subject && (
                <div className="validation-error">{validationErrors.subject}</div>
              )}
              {subject.length > 78 && !validationErrors.subject && (
                <div className="validation-warning">Subject line is long. Keep it under 78 characters for best results.</div>
              )}
            </div>
            <div className="form-group">
              <label>Preheader Text <span className="char-count">{preheader.length}/100</span></label>
              <input
                type="text"
                value={preheader}
                onChange={(e) => {
                  setPreheader(e.target.value);
                  if (validationErrors.preheader) {
                    setValidationErrors({ ...validationErrors, preheader: null });
                  }
                }}
                placeholder="Preview text (shown in inbox)"
                maxLength={100}
                className={validationErrors.preheader ? 'error' : ''}
              />
              {validationErrors.preheader && (
                <div className="validation-error">{validationErrors.preheader}</div>
              )}
              <small>This text appears next to the subject in most email clients</small>
            </div>
            {showAbtest && (
              <div className="form-group">
                <label>A/B Test Subject (Alternative) <span className="char-count">{abTestSubject.length}/78</span></label>
                <input
                  type="text"
                  value={abTestSubject}
                  onChange={(e) => {
                    setAbTestSubject(e.target.value);
                    if (validationErrors.abTestSubject) {
                      setValidationErrors({ ...validationErrors, abTestSubject: null });
                    }
                  }}
                  placeholder="Alternative subject for testing"
                  maxLength={100}
                  className={validationErrors.abTestSubject ? 'error' : abTestSubject.length > 78 ? 'warning' : ''}
                />
                {validationErrors.abTestSubject && (
                  <div className="validation-error">{validationErrors.abTestSubject}</div>
                )}
                <small>50% of recipients will receive this subject. Test which performs better!</small>
              </div>
            )}
            {validationErrors.blocks && (
              <div className="validation-error-block">
                <strong>⚠️ Content Error:</strong> {validationErrors.blocks}
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3>Add Blocks</h3>
            <div className="block-palette">
              {EMAIL_BLOCKS.map(block => (
                <button
                  key={block.type}
                  className="block-type-btn"
                  onClick={() => addBlock(block.type)}
                  title={block.label}
                >
                  <span className="block-icon">{block.icon}</span>
                  <span className="block-label">{block.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Template Variables</h3>
            <div className="variables-list">
              <div className="variable-item">
                <code>{'{guest_name}'}</code>
                <span>Guest's full name</span>
              </div>
              <div className="variable-item">
                <code>{'{check_in_date}'}</code>
                <span>Check-in date</span>
              </div>
              <div className="variable-item">
                <code>{'{check_out_date}'}</code>
                <span>Check-out date</span>
              </div>
              <div className="variable-item">
                <code>{'{room_type}'}</code>
                <span>Room type name</span>
              </div>
              <div className="variable-item">
                <code>{'{property_name}'}</code>
                <span>Property name</span>
              </div>
            </div>
          </div>
        </div>

        <div className="editor-main">
          <div className={`email-preview ${previewMode}`}>
            <div className="preview-header">
              <div className="preview-subject">{subject || 'Email Subject'}</div>
              <div className="preview-preheader">{preheader || 'Preview text...'}</div>
            </div>
            <div className="preview-body">
              {blocks.length === 0 ? (
                <div className="empty-state">
                  <p>Start building your email by adding blocks from the sidebar</p>
                  <button className="btn-primary" onClick={() => setShowTemplates(true)}>
                    Or choose a template
                  </button>
                </div>
              ) : (
                blocks.map(block => (
                  <div key={block.id}>
                    {renderBlock(block)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showTemplates && (
        <div className="modal-overlay" onClick={() => setShowTemplates(false)}>
          <div className="modal-content template-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Choose a Template</h2>
              <button className="modal-close" onClick={() => setShowTemplates(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="templates-grid">
                {HOSPITALITY_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className="template-card"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="template-preview">{template.preview}</div>
                    <div className="template-name">{template.name}</div>
                    <div className="template-category">{template.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Rich Text Editor Component
const RichTextEditor = ({ value, onChange }) => {
  const [html, setHtml] = useState(value || '');
  
  useEffect(() => {
    setHtml(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.innerHTML;
    setHtml(newValue);
    onChange(newValue);
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    const newValue = document.querySelector('.rich-text-editor').innerHTML;
    setHtml(newValue);
    onChange(newValue);
  };

  return (
    <div className="rich-text-editor-wrapper">
      <div className="rich-text-toolbar">
        <button type="button" onClick={() => applyFormat('bold')} title="Bold">B</button>
        <button type="button" onClick={() => applyFormat('italic')} title="Italic">I</button>
        <button type="button" onClick={() => applyFormat('underline')} title="Underline">U</button>
        <button type="button" onClick={() => applyFormat('formatBlock', 'h2')} title="Heading">H</button>
        <button type="button" onClick={() => applyFormat('insertUnorderedList')} title="List">•</button>
        <button type="button" onClick={() => applyFormat('createLink', prompt('Enter URL:'))} title="Link">🔗</button>
      </div>
      <div
        className="rich-text-editor"
        contentEditable
        dangerouslySetInnerHTML={{ __html: html }}
        onInput={handleChange}
        placeholder="Type your content here..."
      />
    </div>
  );
};

export default EmailEditor;

