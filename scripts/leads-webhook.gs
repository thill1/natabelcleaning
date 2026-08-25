/**
 * Natabel Pristine Cleaning — Lead webhook (Google Apps Script)
 *
 * Deploy:
 * 1. Create a new Google Sheet with tabs "Leads" (headers row 1) and optional "Errors"
 * 2. Extensions → Apps Script → paste this file
 * 3. Set NOTIFY_EMAIL below
 * 4. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 * 5. Add the web app URL to Vercel as QUOTE_WEBHOOK_URL (or LEAD_WEBHOOK_URL)
 * 6. Redeploy this script after changes so duplicate quote IDs are ignored
 */

const NOTIFY_EMAIL = 'natabelpristinecleaning@gmail.com';
const SHEET_NAME = 'Leads';

function existingSubmission(sheet, submissionId) {
  if (!submissionId || sheet.getLastRow() < 2) return false;
  const lastRow = sheet.getLastRow();
  const firstRow = Math.max(2, lastRow - 499);
  const values = sheet.getRange(firstRow, 15, lastRow - firstRow + 1, 1).getValues();
  return values.some(function (row) {
    try { return JSON.parse(row[0] || '{}').submission_id === submissionId; }
    catch (_) { return false; }
  });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found');

    if (existingSubmission(sheet, payload.submission_id)) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

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

    // Instant Estimate notifications are sent by /api/quote after this row is
    // safely stored. Other website leads keep the existing Sheet email path.
    if (NOTIFY_EMAIL && payload.form_type !== 'instant_estimate') {
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
