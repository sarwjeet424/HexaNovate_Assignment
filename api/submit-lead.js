// Vercel serverless function: POST /api/submit-lead
// Handles lead form submission, CRM, Sheets, and Email integrations

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

// ── CRM: HubSpot ──────────────────────────────────────────────────────────────
async function createHubSpotContact(data) {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) return { success: false, error: 'CRM not configured' };

  try {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        properties: {
          firstname: data.name.split(' ')[0],
          lastname: data.name.split(' ').slice(1).join(' ') || '',
          email: data.email,
          phone: data.contactNo,
          lead_source: 'KlearStack Website',
        },
      }),
    });
    if (res.status === 409) return { success: true, contactId: 'existing' };
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.message };
    return { success: true, contactId: json.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Sheets: Google Sheets API ─────────────────────────────────────────────────
async function appendToSheet(data) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!spreadsheetId || !credJson) return { success: false, error: 'Sheets not configured' };

  try {
    const { google } = require('googleapis');
    const credentials = JSON.parse(credJson);
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[
        new Date().toISOString(),
        data.name, data.email, data.contactNo,
        data.solutionRequired, data.noOfDocuments,
        data.painPointExpectations || '',
      ]]},
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Email: Resend ─────────────────────────────────────────────────────────────
async function sendLeadNotification(data) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: 'Email not configured' };

  const { Resend } = require('resend');
  const resend = new Resend(apiKey);
  const notifyTo = process.env.NOTIFY_EMAIL || 'ai-labs@hexanovate.com';
  const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="color:#1a4fba;">✦ KlearStack — New Lead</h2>
      <p style="color:#475569;">Received: <strong>${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</strong> IST</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${[['Name',data.name],['Email',data.email],['Phone',data.contactNo],['Solution',data.solutionRequired],['Documents',data.noOfDocuments],['Notes',data.painPointExpectations||'—']].map(([l,v])=>`<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px;font-weight:600;background:#f8fafc;">${l}</td><td style="padding:8px;color:#475569;">${v}</td></tr>`).join('')}
      </table>
    </div>`;

  try {
    const result = await resend.emails.send({
      from: fromAddress, to: notifyTo,
      subject: `New Demo Request — ${data.name} (${data.solutionRequired})`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const body = req.body || {};

  // Honeypot
  if (body._hp && body._hp.length > 0) return res.status(200).json({ success: true });

  // Validation
  const errors = [];
  if (!body.name || body.name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Invalid email format.');
  if (body.email && !isBusinessEmail(body.email)) errors.push('Please use a work email address.');
  if (!body.contactNo || !isValidPhone(body.contactNo)) errors.push('Invalid phone number.');
  if (!body.solutionRequired) errors.push('Solution required field is missing.');
  if (!body.noOfDocuments) errors.push('Number of documents is missing.');
  if (errors.length) return res.status(400).json({ success: false, error: errors.join(' ') });

  const leadData = {
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    contactNo: body.contactNo.trim(),
    solutionRequired: body.solutionRequired,
    noOfDocuments: body.noOfDocuments,
    painPointExpectations: (body.painPointExpectations || '').trim(),
  };

  // Run all integrations concurrently — partial failure is non-blocking
  const [crmR, sheetR, emailR] = await Promise.allSettled([
    createHubSpotContact(leadData),
    appendToSheet(leadData),
    sendLeadNotification(leadData),
  ]);

  console.info('[Lead] CRM:', crmR.status, '| Sheets:', sheetR.status, '| Email:', emailR.status);

  return res.status(200).json({ success: true, message: 'Lead submitted successfully.' });
};
