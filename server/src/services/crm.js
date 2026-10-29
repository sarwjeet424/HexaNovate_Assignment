// CRM integration service (HubSpot free tier)
// Docs: https://developers.hubspot.com/docs/api/crm/contacts

const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

/**
 * Creates or updates a contact in HubSpot CRM.
 * @param {Object} data - Lead form data
 * @returns {Promise<{success: boolean, contactId?: string, error?: string}>}
 */
async function createHubSpotContact(data) {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey) {
    console.warn('[CRM] HUBSPOT_API_KEY not set — skipping CRM integration');
    return { success: false, error: 'CRM not configured' };
  }

  const payload = {
    properties: {
      firstname: data.name.split(' ')[0] || data.name,
      lastname: data.name.split(' ').slice(1).join(' ') || '',
      email: data.email,
      phone: data.contactNo,
      // Custom HubSpot properties (must exist in your portal)
      solution_required: data.solutionRequired || '',
      number_of_documents: data.noOfDocuments || '',
      message: data.painPointExpectations || '',
      lead_source: 'KlearStack Website',
    },
  };

  try {
    const res = await fetch(HUBSPOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      // HubSpot returns 409 if contact already exists — treat as success
      if (res.status === 409) {
        console.info('[CRM] Contact already exists in HubSpot — treating as success');
        return { success: true, contactId: 'existing' };
      }
      console.error('[CRM] HubSpot error:', json);
      return { success: false, error: json.message || 'CRM API error' };
    }

    console.info('[CRM] Contact created in HubSpot:', json.id);
    return { success: true, contactId: json.id };
  } catch (err) {
    console.error('[CRM] Network error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { createHubSpotContact };
