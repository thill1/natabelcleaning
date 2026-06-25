/**
 * Natabel Cleaning Services — Lead webhook (Google Apps Script)
 *
 * Deploy:
 * 1. Create a new Google Sheet with tabs "Leads" (headers row 1) and optional "Errors"
 * 2. Extensions → Apps Script → paste this file
 * 3. Set NOTIFY_EMAIL below
 * 4. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 * 5. Copy the web app URL into js/config.js → PCC.leads.endpoint
 * 6. Set PCC.leads.demoMode to false (or leave endpoint non-empty — site auto-disables demo)
 */

const NOTIFY_EMAIL = 'hello@natabelcleaning.com';
const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found');

    const row = [
      payload.submitted_at || new Date().toISOString(),
      payload.form_type || '',
      payload.lead_source_label || payload.source || '',
      payload.name || '',
      payload.phone || '',
      payload.email || '',
      payload.zip || '',
      payload.city || '',
      payload.service_type || payload.booking_type || '',
      payload.frequency || '',
      payload.message || payload.notes || '',
      payload.utm_source || '',
      payload.utm_medium || '',
      payload.utm_campaign || '',
      JSON.stringify(payload),
    ];

    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      const subject = '[Natabel Lead] ' + (payload.form_type || 'lead') + ' — ' + (payload.name || 'New inquiry');
      const body = Object.keys(payload)
        .sort()
        .map(function (k) { return k + ': ' + payload[k]; })
        .join('\n');
      MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: 'Natabel leads webhook' }))
    .setMimeType(ContentService.MimeType.JSON);
}
