const express = require('express');
const rateLimit = require('express-rate-limit');
const { createHubSpotContact } = require('../services/crm');
const { appendToSheet } = require('../services/sheets');
const { sendLeadNotification } = require('../services/email');

const router = express.Router();

// Strict rate limit for the lead submission endpoint: 5 per hour per IP
const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many submissions from this IP. Please try again in an hour.' },
});

// ── Validation helpers ────────────────────────────────────────────────────────
const FREE_EMAIL_DOMAINS = [
  'gmail.com','yahoo.com','yahoo.in','outlook.com','hotmail.com',
  'hotmail.in','icloud.com','protonmail.com','proton.me',
  'rediffmail.com','live.com','msn.com','aol.com','ymail.com',
  'zoho.com','mail.com','inbox.com','fastmail.com','tutanota.com',
  'gmx.com','yandex.com','yandex.ru','qq.com','163.com',
];

function isBusinessEmail(email) {
  const domain = (email || '').split('@')[1]?.toLowerCase();
  return domain && !FREE_EMAIL_DOMAINS.includes(domain);
}

function isValidPhone(phone) {
  const cleaned = (phone || '').replace(/[\s\-().]/g, '');
  return /^\+?[1-9]\d{6,14}$/.test(cleaned);
}

function validateLeadPayload(body) {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) errors.push('name: must be at least 2 characters');
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('email: invalid format');
  if (body.email && !isBusinessEmail(body.email)) errors.push('email: must be a work email, not a free provider');
  if (!body.contactNo || !isValidPhone(body.contactNo)) errors.push('contactNo: invalid phone number');
  if (!body.solutionRequired) errors.push('solutionRequired: required');
  if (!body.noOfDocuments) errors.push('noOfDocuments: required');
  return errors;
}

// ── POST /api/submit-lead ─────────────────────────────────────────────────────
router.post('/submit-lead', leadLimiter, async (req, res) => {
  try {
    const body = req.body || {};

    // Honeypot check — bots often fill hidden fields
    if (body._hp && body._hp.length > 0) {
      // Return 200 so bots think they succeeded
      return res.status(200).json({ success: true });
    }

    // Validate payload
    const errors = validateLeadPayload(body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join('; ') });
    }

    const leadData = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      contactNo: body.contactNo.trim(),
      solutionRequired: body.solutionRequired,
      noOfDocuments: body.noOfDocuments,
      painPointExpectations: (body.painPointExpectations || '').trim(),
    };

    // ── Run all integrations concurrently (P1 + P2) ─────────────────────────
    // Partial failure: each integration is independent — one failing does NOT
    // block the others or return an error to the user.
    const [crmResult, sheetResult, emailResult] = await Promise.allSettled([
      createHubSpotContact(leadData),
      appendToSheet(leadData),
      sendLeadNotification(leadData),
    ]);

    // Log integration outcomes without exposing secrets
    console.info('[Lead] Integration results:', {
      crm:   crmResult.status === 'fulfilled' ? crmResult.value : { success: false, error: crmResult.reason?.message },
      sheet: sheetResult.status === 'fulfilled' ? sheetResult.value : { success: false, error: sheetResult.reason?.message },
      email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: emailResult.reason?.message },
    });

    return res.status(200).json({
      success: true,
      message: 'Lead submitted successfully.',
    });

  } catch (err) {
    console.error('[Lead] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
    });
  }
});

module.exports = router;
