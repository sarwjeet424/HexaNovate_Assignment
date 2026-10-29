// Calendar booking service using Google Calendar API
// Books a meeting slot and sends an invite to the lead's email

const { google } = require('googleapis');

let _calendarClient = null;

async function getCalendarClient() {
  if (_calendarClient) return _calendarClient;

  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credJson) {
    console.warn('[Calendar] GOOGLE_SERVICE_ACCOUNT_JSON not set — skipping calendar booking');
    return null;
  }

  const credentials = JSON.parse(credJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  _calendarClient = google.calendar({ version: 'v3', auth });
  return _calendarClient;
}

/**
 * Parses a slot label like "Thu, 30 Oct · 10:00 AM IST" into a Date.
 * For demo purposes we map to a hardcoded year and return start/end times.
 */
function parseSlot(slotLabel) {
  // Extract time portion (e.g. "10:00 AM")
  const timeMatch = slotLabel.match(/(\d{1,2}:\d{2}\s+[AP]M)/i);
  if (!timeMatch) return null;

  // For demo: book for the next day relative to "now"
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 1);

  const [hourStr, minStr] = timeMatch[1].replace(/\s+[AP]M/i, '').split(':');
  const isPM = timeMatch[1].toLowerCase().includes('pm');
  let hours = parseInt(hourStr, 10);
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  start.setHours(hours, parseInt(minStr, 10), 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1-hour meeting

  return { start, end };
}

/**
 * Creates a Google Calendar event and sends invite.
 * @param {string} slotLabel - Human-readable slot label
 * @param {string} attendeeEmail - Lead's email
 * @returns {Promise<{success: boolean, eventId?: string, error?: string}>}
 */
async function bookCalendarSlot(slotLabel, attendeeEmail) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  try {
    const calendar = await getCalendarClient();
    if (!calendar) return { success: false, error: 'Calendar not configured' };

    const times = parseSlot(slotLabel);
    if (!times) return { success: false, error: 'Could not parse slot time' };

    const event = {
      summary: 'KlearStack Demo — Live Document Processing',
      description: `You requested a demo slot via KlearStack.ai.\n\nSlot: ${slotLabel}\nAttendee: ${attendeeEmail}`,
      start: { dateTime: times.start.toISOString(), timeZone: 'Asia/Kolkata' },
      end: { dateTime: times.end.toISOString(), timeZone: 'Asia/Kolkata' },
      attendees: [{ email: attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: `klear-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const result = await calendar.events.insert({
      calendarId,
      sendUpdates: 'all',
      conferenceDataVersion: 1,
      requestBody: event,
    });

    console.info('[Calendar] Event created:', result.data.id);
    return { success: true, eventId: result.data.id };
  } catch (err) {
    console.error('[Calendar] Error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { bookCalendarSlot };
