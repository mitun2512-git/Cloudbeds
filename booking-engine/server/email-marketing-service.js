/**
 * Email Marketing Service
 * Handles email drafts, sending, and conversion tracking
 * Uses SQLite database for persistence
 */

const crypto = require('crypto');

// Database reference (set during initialization)
let db = null;

// Email service integration (Resend recommended - easiest and cheapest)
let emailService = null;
try {
  const { Resend } = require('resend');
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    emailService = new Resend(RESEND_API_KEY);
    console.log('[Email] Resend service initialized');
  }
} catch (error) {
  // Resend not installed, will use console.log for now
  console.log('[Email] Resend not installed. Install with: npm install resend');
}

/**
 * Initialize with database reference
 */
function initWithDatabase(database) {
  db = database;
  console.log('[Email Marketing] Initialized with database');
}

/**
 * Generate unique IDs
 */
function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate tracking token for email
 */
function generateTrackingToken(campaignId, recipientEmail) {
  return crypto.createHash('sha256')
    .update(`${campaignId}-${recipientEmail}-${Date.now()}`)
    .digest('hex')
    .substring(0, 32);
}


/**
 * Save/create a draft
 */
async function saveDraft(draftData) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const id = draftData.id || generateId();
  
  const sql = `
    INSERT INTO email_drafts (
      id, strategy_type, strategy_id, subject, preheader,
      greeting, body, cta, cta_url, footer, target_guest_filter, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      subject = excluded.subject,
      preheader = excluded.preheader,
      greeting = excluded.greeting,
      body = excluded.body,
      cta = excluded.cta,
      cta_url = excluded.cta_url,
      footer = excluded.footer,
      target_guest_filter = excluded.target_guest_filter,
      updated_at = datetime('now')
  `;
  
  const params = [
    id,
    draftData.strategyType || 'custom',
    draftData.strategyId || null,
    draftData.subject || '',
    draftData.preheader || '',
    draftData.greeting || '',
    JSON.stringify(draftData.body || []),
    draftData.cta || '',
    draftData.ctaUrl || '',
    draftData.footer || '',
    JSON.stringify(draftData.targetGuestFilter || {}),
    draftData.createdBy || 'system'
  ];
  
  const result = db.execute(sql, params);
  if (!result.success) {
    console.error('[Email] Failed to save draft:', result.error);
    throw new Error(result.error || 'Failed to save draft to database');
  }
  
  // Save database to disk
  db.saveDatabase();
  console.log('[Email] Draft saved successfully:', id, 'Changes:', result.changes);
  
  // Small delay to ensure database is written
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Fetch and return the saved draft - try multiple times if needed
  let savedDraft = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    savedDraft = await getDraft(id);
    if (savedDraft) break;
    if (attempt < 2) {
      console.log(`[Email] Draft not found on attempt ${attempt + 1}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  if (!savedDraft) {
    console.error('[Email] Draft saved but not retrievable after 3 attempts:', id);
    // Try to query directly to debug
    const directQuery = db.queryOne('SELECT * FROM email_drafts WHERE id = ?', [id]);
    console.error('[Email] Direct query result:', directQuery ? 'Found' : 'Not found');
    if (directQuery) {
      // Manually construct draft object from direct query
      try {
        const manualDraft = {
          id: directQuery.id,
          strategyType: directQuery.strategy_type,
          strategyId: directQuery.strategy_id,
          subject: directQuery.subject,
          preheader: directQuery.preheader,
          greeting: directQuery.greeting,
          body: JSON.parse(directQuery.body || '[]'),
          cta: directQuery.cta,
          ctaUrl: directQuery.cta_url,
          footer: directQuery.footer,
          targetGuestFilter: JSON.parse(directQuery.target_guest_filter || '{}'),
          createdAt: directQuery.created_at,
          updatedAt: directQuery.updated_at,
          createdBy: directQuery.created_by
        };
        console.log('[Email] Returning manually constructed draft');
        return manualDraft;
      } catch (parseErr) {
        console.error('[Email] Error parsing manual draft:', parseErr);
      }
    }
    throw new Error('Draft was saved but could not be retrieved');
  }
  
  console.log('[Email] Draft retrieved successfully:', savedDraft.id, savedDraft.subject);
  return savedDraft;
}

/**
 * Get draft by ID
 */
async function getDraft(draftId) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  if (!draftId) {
    console.error('[Email] getDraft called with null/undefined draftId');
    return null;
  }
  
  console.log('[Email] Fetching draft:', draftId);
  
  const draftRow = db.queryOne(
    'SELECT * FROM email_drafts WHERE id = ?',
    [draftId]
  );
  
  if (!draftRow) {
    console.log('[Email] Draft not found in database:', draftId);
    // List all drafts for debugging
    const allDrafts = db.query('SELECT id, subject FROM email_drafts LIMIT 10');
    console.log('[Email] Available drafts:', allDrafts.map(d => ({ id: d.id, subject: d.subject })));
    return null;
  }
  
  console.log('[Email] Draft found:', draftRow.id, draftRow.subject);
  
  // Parse JSON fields - create a plain object to avoid serialization issues
  let body = [];
  let targetGuestFilter = {};
  
  try {
    body = JSON.parse(draftRow.body || '[]');
  } catch (e) {
    console.error('[Email] Error parsing body JSON:', e);
    body = [];
  }
  
  try {
    targetGuestFilter = JSON.parse(draftRow.target_guest_filter || '{}');
  } catch (e) {
    console.error('[Email] Error parsing targetGuestFilter JSON:', e);
    targetGuestFilter = {};
  }
  
  // Convert snake_case to camelCase - return plain object
  const draft = {
    id: String(draftRow.id || ''),
    strategyType: String(draftRow.strategy_type || ''),
    strategyId: draftRow.strategy_id ? String(draftRow.strategy_id) : null,
    subject: String(draftRow.subject || ''),
    preheader: String(draftRow.preheader || ''),
    greeting: String(draftRow.greeting || ''),
    body: Array.isArray(body) ? body : [],
    cta: String(draftRow.cta || ''),
    ctaUrl: String(draftRow.cta_url || ''),
    footer: String(draftRow.footer || ''),
    targetGuestFilter: targetGuestFilter || {},
    createdAt: String(draftRow.created_at || ''),
    updatedAt: String(draftRow.updated_at || ''),
    createdBy: String(draftRow.created_by || 'system')
  };
  
  return draft;
}

/**
 * Get all drafts
 */
async function getAllDrafts() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const drafts = db.query('SELECT * FROM email_drafts ORDER BY updated_at DESC');
  
  return drafts.map(draft => {
    try {
      draft.body = JSON.parse(draft.body || '[]');
      draft.targetGuestFilter = JSON.parse(draft.target_guest_filter || '{}');
    } catch (e) {
      draft.body = [];
      draft.targetGuestFilter = {};
    }
    
    return {
      id: draft.id,
      strategyType: draft.strategy_type,
      strategyId: draft.strategy_id,
      subject: draft.subject,
      preheader: draft.preheader,
      greeting: draft.greeting,
      body: draft.body,
      cta: draft.cta,
      ctaUrl: draft.cta_url,
      footer: draft.footer,
      targetGuestFilter: draft.targetGuestFilter,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
      createdBy: draft.created_by
    };
  });
}

/**
 * Delete draft
 */
async function deleteDraft(draftId) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const result = db.execute('DELETE FROM email_drafts WHERE id = ?', [draftId]);
  if (result.success) {
    db.saveDatabase();
    return true;
  }
  return false;
}

/**
 * Create email campaign from draft
 */
async function createCampaign(draftId, campaignData) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const draft = await getDraft(draftId);
  if (!draft) {
    throw new Error('Draft not found');
  }
  
  const campaignId = generateId();
  const bodyJson = JSON.stringify(draft.body || []);
  const recipientsJson = JSON.stringify(campaignData.recipients || []);
  
  const sql = `
    INSERT INTO email_campaigns (
      id, draft_id, name, strategy_type, subject, preheader, greeting,
      body, cta, cta_url, footer, recipients_json, status, scheduled_for, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, datetime('now'), datetime('now'))
  `;
  
  const params = [
    campaignId,
    draftId,
    campaignData.name || `Campaign ${campaignId.substring(0, 8)}`,
    draft.strategyType,
    draft.subject,
    draft.preheader,
    draft.greeting,
    bodyJson,
    draft.cta,
    draft.ctaUrl,
    draft.footer,
    recipientsJson,
    campaignData.scheduledFor || null
  ];
  
  const result = db.execute(sql, params);
  if (!result.success) {
    throw new Error(result.error || 'Failed to create campaign');
  }
  
  db.saveDatabase();
  
  return getCampaign(campaignId);
}

/**
 * Get campaign by ID
 */
async function getCampaign(campaignId) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const campaign = db.queryOne(
    'SELECT * FROM email_campaigns WHERE id = ?',
    [campaignId]
  );
  
  if (!campaign) return null;
  
  // Parse JSON fields
  try {
    campaign.body = JSON.parse(campaign.body || '[]');
    campaign.recipients = JSON.parse(campaign.recipients_json || '[]');
  } catch (e) {
    campaign.body = [];
    campaign.recipients = [];
  }
  
  return {
    id: campaign.id,
    draftId: campaign.draft_id,
    name: campaign.name,
    strategyType: campaign.strategy_type,
    subject: campaign.subject,
    preheader: campaign.preheader,
    greeting: campaign.greeting,
    body: campaign.body,
    cta: campaign.cta,
    ctaUrl: campaign.cta_url,
    footer: campaign.footer,
    recipients: campaign.recipients,
    status: campaign.status,
    scheduledFor: campaign.scheduled_for,
    sentAt: campaign.sent_at,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at
  };
}

/**
 * Get all campaigns
 */
async function getAllCampaigns() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const campaigns = db.query('SELECT * FROM email_campaigns ORDER BY created_at DESC');
  
  return campaigns.map(campaign => {
    try {
      campaign.body = JSON.parse(campaign.body || '[]');
      campaign.recipients = JSON.parse(campaign.recipients_json || '[]');
    } catch (e) {
      campaign.body = [];
      campaign.recipients = [];
    }
    
    return {
      id: campaign.id,
      draftId: campaign.draft_id,
      name: campaign.name,
      strategyType: campaign.strategy_type,
      subject: campaign.subject,
      preheader: campaign.preheader,
      greeting: campaign.greeting,
      body: campaign.body,
      cta: campaign.cta,
      ctaUrl: campaign.cta_url,
      footer: campaign.footer,
      recipients: campaign.recipients,
      status: campaign.status,
      scheduledFor: campaign.scheduled_for,
      sentAt: campaign.sent_at,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at
    };
  });
}

/**
 * Update campaign status
 */
async function updateCampaignStatus(campaignId, status) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const sql = status === 'sent'
    ? `UPDATE email_campaigns SET status = ?, sent_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    : `UPDATE email_campaigns SET status = ?, updated_at = datetime('now') WHERE id = ?`;
  
  const result = db.execute(sql, [status, campaignId]);
  if (!result.success) {
    throw new Error(result.error || 'Failed to update campaign status');
  }
  
  db.saveDatabase();
  
  return getCampaign(campaignId);
}


/**
 * Get tracking data for campaign
 */
async function getCampaignTracking(campaignId) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const allTracking = db.query(
    'SELECT * FROM email_tracking WHERE campaign_id = ?',
    [campaignId]
  );
  
  const stats = {
    totalSent: 0,
    totalOpens: 0,
    uniqueOpens: 0,
    totalClicks: 0,
    uniqueClicks: 0,
    openRate: 0,
    clickRate: 0,
    clickToOpenRate: 0,
    recipients: []
  };
  
  const uniqueOpens = new Set();
  const uniqueClicks = new Set();
  
  // Fetch analytics from Resend for each email that has a Resend ID
  const trackingWithAnalytics = await Promise.all(
    allTracking.map(async (tracking) => {
      let resendData = null;
      
      // If we have a Resend email ID, fetch analytics from Resend
      if (tracking.resend_email_id && emailService) {
        resendData = await fetchResendAnalytics(tracking.resend_email_id);
      }
      
      // Use Resend data if available, otherwise fall back to database
      const openCount = resendData?.opens || tracking.open_count || 0;
      const clickCount = resendData?.clicks || tracking.click_count || 0;
      const hasOpened = openCount > 0;
      const hasClicked = clickCount > 0;
      
      return {
        ...tracking,
        openCount,
        clickCount,
        hasOpened,
        hasClicked,
        resendData
      };
    })
  );
  
  trackingWithAnalytics.forEach(tracking => {
    stats.totalSent++;
    if (tracking.recipient_email) {
      stats.recipients.push(tracking.recipient_email);
    }
    
    // Count opens and clicks from Resend data
    if (tracking.hasOpened) {
      stats.totalOpens += tracking.openCount;
      if (tracking.recipient_email) {
        uniqueOpens.add(tracking.recipient_email);
      }
    }
    
    if (tracking.hasClicked) {
      stats.totalClicks += tracking.clickCount;
      if (tracking.recipient_email) {
        uniqueClicks.add(tracking.recipient_email);
      }
    }
  });
  
  stats.uniqueOpens = uniqueOpens.size;
  stats.uniqueClicks = uniqueClicks.size;
  stats.openRate = stats.totalSent > 0 ? (stats.uniqueOpens / stats.totalSent * 100).toFixed(2) : 0;
  stats.clickRate = stats.totalSent > 0 ? (stats.uniqueClicks / stats.totalSent * 100).toFixed(2) : 0;
  stats.clickToOpenRate = stats.uniqueOpens > 0 ? (stats.uniqueClicks / stats.uniqueOpens * 100).toFixed(2) : 0;
  
  return {
    campaignId,
    stats,
    tracking: trackingWithAnalytics.map(t => ({
      trackingToken: t.tracking_token,
      campaignId: t.campaign_id,
      recipientEmail: t.recipient_email,
      recipientName: t.recipient_name,
      resendEmailId: t.resend_email_id,
      firstOpen: t.first_open,
      lastOpen: t.last_open,
      firstClick: t.first_click,
      lastClick: t.last_click,
      openCount: t.openCount,
      clickCount: t.clickCount,
      resendData: t.resendData,
      events: JSON.parse(t.events_json || '[]')
    }))
  };
}

/**
 * Get tracking data by token
 */
async function getTrackingByToken(trackingToken) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const tracking = db.queryOne(
    'SELECT * FROM email_tracking WHERE tracking_token = ?',
    [trackingToken]
  );
  
  if (!tracking) return null;
  
  try {
    tracking.events = JSON.parse(tracking.events_json || '[]');
  } catch (e) {
    tracking.events = [];
  }
  
  return {
    trackingToken: tracking.tracking_token,
    campaignId: tracking.campaign_id,
    recipientEmail: tracking.recipient_email,
    recipientName: tracking.recipient_name,
    resendEmailId: tracking.resend_email_id,
    firstOpen: tracking.first_open,
    lastOpen: tracking.last_open,
    firstClick: tracking.first_click,
    lastClick: tracking.last_click,
    openCount: tracking.open_count,
    clickCount: tracking.click_count,
    events: tracking.events
  };
}

/**
 * Create or update tracking record with Resend email ID
 */
async function upsertTrackingRecord(trackingToken, campaignId, recipientEmail, recipientName, resendEmailId) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const now = new Date().toISOString();
  
  // Check if record exists
  const existing = db.queryOne(
    'SELECT * FROM email_tracking WHERE tracking_token = ?',
    [trackingToken]
  );
  
  if (existing) {
    // Update existing record
    const sql = `
      UPDATE email_tracking 
      SET resend_email_id = COALESCE(?, resend_email_id),
          recipient_email = COALESCE(?, recipient_email),
          recipient_name = COALESCE(?, recipient_name),
          updated_at = ?
      WHERE tracking_token = ?
    `;
    db.execute(sql, [resendEmailId || null, recipientEmail || null, recipientName || null, now, trackingToken]);
  } else {
    // Create new record
    const sql = `
      INSERT INTO email_tracking (
        tracking_token, campaign_id, recipient_email, recipient_name, 
        resend_email_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.execute(sql, [trackingToken, campaignId, recipientEmail, recipientName, resendEmailId, now, now]);
  }
  
  db.saveDatabase();
  return true;
}

/**
 * Fetch email analytics from Resend API
 * Resend provides tracking data via emails.get() method
 */
async function fetchResendAnalytics(resendEmailId) {
  if (!emailService) {
    return null;
  }
  
  try {
    // Resend API: Get email by ID
    // Response structure: { data: { id, to, from, subject, created_at, last_event, ... } }
    const response = await emailService.emails.get(resendEmailId);
    
    if (!response || response.error) {
      console.log(`[Email] Resend analytics not available for ${resendEmailId}:`, response?.error?.message);
      return null;
    }
    
    // Resend returns data in response.data or directly in response
    const emailData = response.data || response;
    
    if (!emailData) {
      return null;
    }
    
    // Resend tracks opens and clicks - check for last_event and event data
    // Note: Resend may provide opens/clicks counts or we may need to parse last_event
    const lastEvent = emailData.last_event || null;
    const hasOpened = lastEvent === 'opened' || emailData.opens > 0;
    const hasClicked = lastEvent === 'clicked' || emailData.clicks > 0;
    
    return {
      emailId: resendEmailId,
      opens: emailData.opens || (hasOpened ? 1 : 0),
      clicks: emailData.clicks || (hasClicked ? 1 : 0),
      lastEvent: lastEvent,
      // Additional fields
      delivered: emailData.delivered || lastEvent === 'delivered' || false,
      bounced: emailData.bounced || lastEvent === 'bounced' || false,
      complained: emailData.complained || lastEvent === 'complained' || false,
      createdAt: emailData.created_at || null,
      // Raw data for debugging
      rawData: emailData
    };
  } catch (error) {
    console.error(`[Email] Error fetching Resend analytics for ${resendEmailId}:`, error.message);
    // Don't throw - return null so we can fall back to database tracking
    return null;
  }
}

/**
 * Generate HTML email with tracking pixels and click tracking
 */
function generateEmailHTML(campaign, recipient, trackingToken, baseUrl) {
  const { subject, preheader, greeting, body, cta, ctaUrl, footer } = campaign;
  
  // Replace template variables in all content
  const personalizedSubject = replaceTemplateVariables(subject, recipient);
  const personalizedPreheader = replaceTemplateVariables(preheader || '', recipient);
  const personalizedGreeting = replaceTemplateVariables(greeting || '', recipient);
  const personalizedFooter = replaceTemplateVariables(footer || '', recipient);
  
  // Add tracking to CTA URL
  const trackedCtaUrl = `${baseUrl}/api/email/track/click?token=${trackingToken}&url=${encodeURIComponent(ctaUrl || '#')}`;
  
  // Generate tracking pixel URL
  const trackingPixelUrl = `${baseUrl}/api/email/track/open?token=${trackingToken}`;
  
  // Build body HTML with variable replacement
  const bodyHTML = Array.isArray(body) 
    ? body.map(p => `<p>${replaceTemplateVariables(p, recipient)}</p>`).join('')
    : `<p>${replaceTemplateVariables(body || '', recipient)}</p>`;
  
  const personalizedCta = replaceTemplateVariables(cta || 'Learn More', recipient);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalizedSubject}</title>
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f1ea; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background-color: #2c2416; color: #f5f1ea; padding: 20px; text-align: center; }
    .email-preheader { font-size: 12px; color: #999; padding: 10px 20px; background-color: #f9f9f9; }
    .email-body { padding: 30px 20px; }
    .email-logo { display: flex; align-items: center; margin-bottom: 30px; }
    .logo-circle { width: 50px; height: 50px; border-radius: 50%; background-color: #2c2416; color: #f5f1ea; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-right: 15px; }
    .logo-text { display: flex; flex-direction: column; }
    .logo-name { font-size: 18px; font-weight: bold; letter-spacing: 2px; }
    .logo-sub { font-size: 11px; color: #666; }
    .email-greeting { font-size: 16px; margin-bottom: 20px; }
    .email-content p { margin-bottom: 15px; }
    .email-cta-wrapper { text-align: center; margin: 30px 0; }
    .email-cta { display: inline-block; background-color: #8b7355; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .email-footer { background-color: #f5f1ea; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .footer-logo { font-weight: bold; margin-bottom: 5px; }
    .footer-address { margin-bottom: 10px; }
    .footer-links a { color: #8b7355; text-decoration: none; margin: 0 5px; }
  </style>
</head>
<body>
  <div class="email-container">
    ${personalizedPreheader ? `<div class="email-preheader"><em>${personalizedPreheader}</em></div>` : ''}
    <div class="email-body">
      <div class="email-logo">
        <div class="logo-circle">H</div>
        <div class="logo-text">
          <span class="logo-name">HENNESSEY</span>
          <span class="logo-sub">ESTATE · EST. 1889</span>
        </div>
      </div>
      <div class="email-content">
        ${personalizedGreeting ? `<p class="email-greeting">${personalizedGreeting}</p>` : ''}
        ${bodyHTML}
        <div class="email-cta-wrapper">
          <a href="${trackedCtaUrl}" class="email-cta">${personalizedCta}</a>
        </div>
        ${personalizedFooter ? `<p class="email-footer-text">${personalizedFooter}</p>` : ''}
      </div>
    </div>
    <div class="email-footer">
      <div class="footer-logo">Hennessey Estate</div>
      <div class="footer-address">1727 Main Street, Napa, CA 94559</div>
      <div class="footer-links">
        <a href="#">Website</a> · <a href="#">Instagram</a> · <a href="${baseUrl}/api/email/unsubscribe?token=${trackingToken}">Unsubscribe</a>
      </div>
    </div>
    <!-- Tracking Pixel -->
    <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
  </div>
</body>
</html>
  `;
  
  return html.trim();
}

/**
 * Track an email event (open, click, etc.)
 */
async function trackEvent(trackingToken, eventType, metadata = {}) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const tracking = await getTrackingByToken(trackingToken);
  if (!tracking) {
    console.log(`[Email] No tracking found for token: ${trackingToken}`);
    return false;
  }
  
  // Update tracking record based on event type
  const now = new Date().toISOString();
  let sql = '';
  
  switch (eventType) {
    case 'open':
      sql = `UPDATE email_tracking SET opened_at = COALESCE(opened_at, ?) WHERE tracking_token = ?`;
      db.execute(sql, [now, trackingToken]);
      break;
    case 'click':
      sql = `UPDATE email_tracking SET clicked_at = COALESCE(clicked_at, ?), click_url = ? WHERE tracking_token = ?`;
      db.execute(sql, [now, metadata.url || '', trackingToken]);
      break;
    case 'delivered':
      sql = `UPDATE email_tracking SET delivered_at = COALESCE(delivered_at, ?) WHERE tracking_token = ?`;
      db.execute(sql, [now, trackingToken]);
      break;
    default:
      console.log(`[Email] Unknown event type: ${eventType}`);
      return false;
  }
  
  db.saveDatabase();
  return true;
}

/**
 * Replace template variables in email content
 */
/**
 * Replace template variables in text
 * Supported variables:
 * - {guest_name} or {guestName} - Guest's full name
 * - {first_name} or {firstName} - Guest's first name
 * - {last_name} or {lastName} - Guest's last name
 * - {check_in_date} or {checkInDate} - Check-in date
 * - {check_out_date} or {checkOutDate} - Check-out date
 * - {room_type} or {roomType} - Room type name
 * - {room_name} or {roomName} - Room name
 * - {property_name} - Property name
 */
function replaceTemplateVariables(text, recipient) {
  if (!text || typeof text !== 'string') return text || '';
  
  const guestName = recipient?.guestName || recipient?.guest_name || 
                   (recipient?.firstName && recipient?.lastName ? `${recipient.firstName} ${recipient.lastName}` : null) ||
                   (recipient?.first_name && recipient?.last_name ? `${recipient.first_name} ${recipient.last_name}` : null) ||
                   'Valued Guest';
  const firstName = recipient?.firstName || recipient?.first_name || guestName.split(' ')[0] || 'Guest';
  const lastName = recipient?.lastName || recipient?.last_name || guestName.split(' ').slice(1).join(' ') || '';
  const checkInDate = recipient?.startDate || recipient?.checkInDate || recipient?.start_date || recipient?.checkIn || 'your arrival date';
  const checkOutDate = recipient?.endDate || recipient?.checkOutDate || recipient?.end_date || recipient?.checkOut || 'your departure date';
  const roomType = recipient?.roomTypeName || recipient?.room_type_name || recipient?.roomType || recipient?.room_type || 'your room';
  const roomName = recipient?.roomName || recipient?.room_name || 'your room';
  const propertyName = recipient?.propertyName || 'Hennessey Estate';
  
  return text
    .replace(/\{guest_name\}/gi, guestName)
    .replace(/\{guestName\}/g, guestName)
    .replace(/\{first_name\}/gi, firstName)
    .replace(/\{firstName\}/g, firstName)
    .replace(/\{last_name\}/gi, lastName)
    .replace(/\{lastName\}/g, lastName)
    .replace(/\{check_in_date\}/gi, checkInDate)
    .replace(/\{checkInDate\}/g, checkInDate)
    .replace(/\{check_out_date\}/gi, checkOutDate)
    .replace(/\{checkOutDate\}/g, checkOutDate)
    .replace(/\{room_type\}/gi, roomType)
    .replace(/\{roomType\}/g, roomType)
    .replace(/\{room_name\}/gi, roomName)
    .replace(/\{roomName\}/g, roomName)
    .replace(/\{property_name\}/gi, propertyName)
    .replace(/\{propertyName\}/g, propertyName);
}

module.exports = {
  initWithDatabase,
  saveDraft,
  getDraft,
  getAllDrafts,
  deleteDraft,
  createCampaign,
  getCampaign,
  getAllCampaigns,
  updateCampaignStatus,
  trackEvent,
  getCampaignTracking,
  getTrackingByToken,
  generateEmailHTML,
  generateTrackingToken,
  replaceTemplateVariables,
  upsertTrackingRecord,
  fetchResendAnalytics,
  emailService // Export email service instance
};

