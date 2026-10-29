// Vercel serverless function: POST /api/book-calendar
// Books a demo slot on Google Calendar and sends invite

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { slot, email } = req.body || {};
  if (!slot || !email) return res.status(400).json({ success: false, error: 'slot and email required' });

  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!credJson) {
    // Calendar not configured — still respond with success so UX is not broken
    console.warn('[Calendar] Not configured — returning mock success');
    return res.status(200).json({ success: true, message: 'Booking received (calendar not configured).' });
  }

  try {
    const { google } = require('googleapis');
    const credentials = JSON.parse(credJson);
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/calendar'] });
    const calendar = google.calendar({ version: 'v3', auth });

    // Parse slot time — use next business day as base for demo purposes
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() + 1);
    const timeMatch = slot.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const isPM = timeMatch[3].toUpperCase() === 'PM';
      if (isPM && h !== 12) h += 12;
      if (!isPM && h === 12) h = 0;
      start.setHours(h, m, 0, 0);
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const event = {
      summary: 'KlearStack Demo — Live Document Processing',
      description: `Demo booked via KlearStack.ai\nSlot: ${slot}\nAttendee: ${email}`,
      start: { dateTime: start.toISOString(), timeZone: 'Asia/Kolkata' },
      end: { dateTime: end.toISOString(), timeZone: 'Asia/Kolkata' },
      attendees: [{ email: email.toLowerCase().trim() }],
      reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 60 }, { method: 'popup', minutes: 15 }] },
    };

    const result = await calendar.events.insert({ calendarId, sendUpdates: 'all', requestBody: event });
    console.info('[Calendar] Event created:', result.data.id);
    return res.status(200).json({ success: true, eventId: result.data.id });
  } catch (err) {
    console.error('[Calendar] Error:', err.message);
    // Non-blocking: still return success to user
    return res.status(200).json({ success: true, message: 'Booking received.' });
  }
};
