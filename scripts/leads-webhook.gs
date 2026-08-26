/**
 * Natabel Pristine Cleaning — Lead webhook (Google Apps Script)
 *
 * Deploy:
 * 1. Create a new Google Sheet with tabs "Leads" (headers row 1) and optional "Errors"
 * 2. Extensions → Apps Script → paste this file
 * 3. Set NOTIFY_EMAILS below
 * 4. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 * 5. Add the web app URL to Vercel as QUOTE_WEBHOOK_URL (or LEAD_WEBHOOK_URL)
 * 6. Redeploy this script after changes so duplicate quote IDs are ignored
 */

const NOTIFY_EMAILS = ['tghill@gmail.com', 'natabelpristinecleaning@gmail.com'];
const SHEET_NAME = 'Leads';
const ERRORS_SHEET_NAME = 'Errors';
const CUSTOMER_DISCLAIMER = 'Your instant estimate is based on your home’s square footage and selected service. Final pricing will be confirmed after we review the property’s condition, bathrooms, pets, clutter, requested services, and any add-ons.';
const BASE_EXCLUSIONS = 'Appliance interiors, excessive debris, wall washing, carpet cleaning, exterior windows, garages, and hauling are not included in this estimate. Optional services and unusual-condition charges are reviewed and priced separately.';

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
  });
}

function formatMoney(value) {
  return '$' + Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function listValue(value) {
  return Array.isArray(value) && value.length ? value.join(', ') : 'None';
}

function recordError(spreadsheet, submissionId, recipient, error) {
  const sheet = spreadsheet.getSheetByName(ERRORS_SHEET_NAME);
  if (!sheet) return;
  sheet.appendRow([new Date().toISOString(), submissionId || '', recipient || '', String(error || 'Unknown email error')]);
}

function sendInstantEstimateEmails(payload) {
  const cadence = payload.estimate_cadence === 'one_time' ? 'one-time' : 'per visit';
  const rows = [
    ['Customer name', payload.name],
    ['Phone', payload.phone],
    ['Email', payload.email],
    ['Service address', [payload.service_address, payload.city, payload.zip].filter(Boolean).join(', ')],
    ['Cleaning type', payload.service_type_label],
    ['Frequency', payload.frequency_label],
    ['Square footage', payload.square_footage],
    ['Bedrooms', payload.bedrooms],
    ['Bathrooms', payload.bathrooms],
    ['Pets', payload.pets],
    ['Requested date', payload.requested_date],
    ['Home condition', payload.condition],
    ['Clutter', payload.clutter],
    ['Calculated estimate', formatMoney(payload.estimate_amount) + ' ' + cadence],
    ['Requested add-ons', listValue(payload.requested_add_ons)],
    ['Focus areas', listValue(payload.focus_areas)],
    ['Additional notes', payload.notes || 'None'],
    ['Submission date and time', payload.submitted_at],
    ['Source page', payload.source]
  ];
  const businessRows = rows.map(function (row) {
    return '<tr><td style="padding:7px 16px 7px 0;color:#746b59;vertical-align:top;white-space:nowrap">' + escapeHtml(row[0]) + '</td><td style="padding:7px 0;font-weight:600">' + escapeHtml(row[1]) + '</td></tr>';
  }).join('');
  const businessHtml = '<div style="font-family:Arial,sans-serif;color:#17140f;line-height:1.5;max-width:680px;margin:auto"><p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8f6e1f">NataBel Pristine Cleaning</p><h1 style="font-family:Georgia,serif;font-weight:500">New residential cleaning request</h1><table cellpadding="0" cellspacing="0" style="border-collapse:collapse">' + businessRows + '</table><p style="padding:14px;background:#fff8e7;border:1px solid #decfae">' + escapeHtml(CUSTOMER_DISCLAIMER) + '</p><p><strong>Base-estimate exclusions:</strong> ' + escapeHtml(BASE_EXCLUSIONS) + '</p></div>';
  const customerHtml = '<div style="font-family:Arial,sans-serif;color:#17140f;line-height:1.6;max-width:620px;margin:auto"><p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8f6e1f">NataBel Pristine Cleaning</p><h1 style="font-family:Georgia,serif;font-weight:500">Your Instant Estimate</h1><p style="font-size:38px;font-family:Georgia,serif;margin:18px 0">' + escapeHtml(formatMoney(payload.estimate_amount)) + ' <span style="font-size:16px">' + escapeHtml(cadence) + '</span></p><p><strong>' + escapeHtml(payload.service_type_label) + '</strong> for your home at ' + escapeHtml(payload.service_address) + ', ' + escapeHtml(payload.city) + '.</p><p style="padding:14px;background:#fff8e7;border:1px solid #decfae">' + escapeHtml(CUSTOMER_DISCLAIMER) + '</p><p>NataBel will review your property details, confirm final pricing and availability, and contact you about next steps. For immediate help, call (916) 899-8811.</p><p><strong>Base-estimate exclusions:</strong> ' + escapeHtml(BASE_EXCLUSIONS) + '</p></div>';

  const result = { notificationDelivered: false, customerEmailDelivered: false, errors: [] };
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAILS.join(','),
      subject: 'New NataBel ' + (payload.service_type_label || 'cleaning') + ' request — ' + (payload.name || 'New customer') + ' — ' + formatMoney(payload.estimate_amount),
      body: rows.map(function (row) { return row[0] + ': ' + row[1]; }).join('\n'),
      htmlBody: businessHtml,
      replyTo: payload.email || NOTIFY_EMAILS[1],
      name: 'NataBel Instant Quotes'
    });
    result.notificationDelivered = true;
  } catch (error) {
    result.errors.push('Business notification: ' + String(error));
  }

  try {
    MailApp.sendEmail({
      to: payload.email,
      subject: 'Your NataBel Instant Estimate: ' + formatMoney(payload.estimate_amount),
      body: 'Your instant estimate is ' + formatMoney(payload.estimate_amount) + ' ' + cadence + '.\n\n' + CUSTOMER_DISCLAIMER + '\n\nNataBel will review your details and contact you with final pricing and availability. Call (916) 899-8811 for immediate help.',
      htmlBody: customerHtml,
      replyTo: NOTIFY_EMAILS[1],
      name: 'NataBel Pristine Cleaning'
    });
    result.customerEmailDelivered = true;
  } catch (error) {
    result.errors.push('Customer confirmation: ' + String(error));
  }
  return result;
}

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
      return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: true, notificationDelivered: true, customerEmailDelivered: true }))
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

    let delivery = { notificationDelivered: false, customerEmailDelivered: false, errors: [] };
    if (payload.form_type === 'instant_estimate') {
      delivery = sendInstantEstimateEmails(payload);
      delivery.errors.forEach(function (error) {
        recordError(sheet.getParent(), payload.submission_id, payload.email, error);
      });
    } else if (NOTIFY_EMAILS.length) {
      const subject = '[Natabel Lead] ' + (payload.form_type || 'lead') + ' — ' + (payload.name || 'New inquiry');
      const body = Object.keys(payload)
        .sort()
        .map(function (k) { return k + ': ' + payload[k]; })
        .join('\n');
      MailApp.sendEmail(NOTIFY_EMAILS.join(','), subject, body);
      delivery.notificationDelivered = true;
    }

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      notificationDelivered: delivery.notificationDelivered,
      customerEmailDelivered: delivery.customerEmailDelivered,
      emailErrors: delivery.errors
    }))
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
