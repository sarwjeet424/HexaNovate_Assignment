// Google Sheets integration — appends a row on every lead submission
// Uses the Google Sheets API v4 with a service account

const { google } = require('googleapis');

let _sheetsClient = null;

/**
 * Initialise the Google Sheets auth client.
 * Reads credentials from environment variable (JSON string of service account).
 */
async function getSheetsClient() {
  if (_sheetsClient) return _sheetsClient;

  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!credJson) {
    console.warn('[Sheets] GOOGLE_SERVICE_ACCOUNT_JSON not set — skipping Sheets integration');
    return null;
  }

  const credentials = JSON.parse(credJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  _sheetsClient = google.sheets({ version: 'v4', auth });
  return _sheetsClient;
}

/**
 * Appends a row to the configured Google Sheet.
 * @param {Object} data - Lead form data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function appendToSheet(data) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    console.warn('[Sheets] GOOGLE_SHEET_ID not set — skipping Sheets integration');
    return { success: false, error: 'Sheet not configured' };
  }

  try {
    const sheets = await getSheetsClient();
    if (!sheets) return { success: false, error: 'Auth not configured' };

    const timestamp = new Date().toISOString();

    const values = [[
      timestamp,
      data.name,
      data.email,
      data.contactNo,
      data.solutionRequired,
      data.noOfDocuments,
      data.painPointExpectations || '',
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:G',  // Columns: Timestamp | Name | Email | Phone | Solution | Docs | Notes
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    console.info('[Sheets] Row appended at', timestamp);
    return { success: true };
  } catch (err) {
    console.error('[Sheets] Error appending row:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { appendToSheet };
