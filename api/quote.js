const serviceArea = require('../lib/service-area');

// Server-only price book. Keep pricing details out of customer-facing assets.
const priceBook = {
  version: 'natabel-base-plus-square-footage-2026-08-25',
  enabled: true,
  baseCharge: 75,
  rates: { standard: 0.06, deep: 0.12, move: 0.25 },
  minimums: { standard: 125 }
};

const QUOTE_ALLOWED = {
  service_type: new Set(['standard', 'deep', 'move']),
  frequency: new Set(['one_time', 'weekly', 'biweekly', 'monthly']),
  property_type: new Set(['house', 'apartment', 'condo', 'townhome']),
  condition: new Set(['maintained', 'average', 'heavy'])
};

function normalizeQuoteInput(input) {
  const value = {
    service_type: String(input.service_type || ''),
    frequency: String(input.frequency || ''),
    property_type: String(input.property_type || ''),
    condition: String(input.condition || 'average'),
    square_footage: Number(input.square_footage),
    bedrooms: String(input.bedrooms || ''),
    bathrooms: String(input.bathrooms || ''),
    zip: String(input.zip || '')
  };
  if (!QUOTE_ALLOWED.service_type.has(value.service_type)) throw new Error('invalid_service_type');
  if (!QUOTE_ALLOWED.frequency.has(value.frequency)) throw new Error('invalid_frequency');
  if (value.property_type && !QUOTE_ALLOWED.property_type.has(value.property_type)) throw new Error('invalid_property_type');
  if (!QUOTE_ALLOWED.condition.has(value.condition)) throw new Error('invalid_condition');
  if (value.service_type === 'standard' && value.frequency === 'one_time') throw new Error('invalid_frequency');
  if (value.service_type !== 'standard' && value.frequency !== 'one_time') throw new Error('invalid_frequency');
  if (!Number.isFinite(value.square_footage) || value.square_footage <= 0) throw new Error('invalid_square_footage');
  if (value.zip && !/^\d{5}$/.test(value.zip)) throw new Error('invalid_zip');
  return value;
}

function exactRange(total) {
  const amount = Number(total);
  return { low: amount, high: amount };
}

function calculateResidential(rawInput, book) {
  const input = normalizeQuoteInput(rawInput);
  if (!book || !book.enabled) return { status: 'manual_review_required', reason: 'pricing_not_configured' };
  const rate = Number(book.rates?.[input.service_type]);
  if (!Number.isFinite(rate) || rate <= 0) return { status: 'manual_review_required', reason: 'rate_not_found' };
  const configuredMinimum = Number(book.minimums?.[input.service_type]);
  const minimum = Number.isFinite(configuredMinimum) && configuredMinimum > 0 ? configuredMinimum : 0;
  const configuredBaseCharge = Number(book.baseCharge);
  const baseCharge = Number.isFinite(configuredBaseCharge) && configuredBaseCharge >= 0 ? configuredBaseCharge : 0;
  const squareFootageCharge = input.square_footage * rate;
  const formulaAmount = baseCharge + squareFootageCharge;
  const amount = Math.ceil(Math.max(formulaAmount, minimum));
  return {
    status: 'estimated',
    quote: {
      amount,
      ...exactRange(amount),
      currency: 'USD',
      cadence: input.frequency === 'one_time' ? 'one_time' : 'per_visit',
      cadenceLabel: input.frequency === 'one_time' ? 'for this one-time clean' : 'per visit',
      frequency: input.frequency,
      serviceType: input.service_type,
      rateBookVersion: book.version,
      ratePerSquareFoot: rate,
      squareFootage: input.square_footage,
      baseCharge,
      squareFootageCharge,
      minimumApplied: minimum > 0 && formulaAmount < minimum,
      optionalServicesIncluded: false
    }
  };
}

function publicQuote(quote) {
  return {
    amount: quote.amount,
    currency: quote.currency,
    cadence: quote.cadence,
    cadenceLabel: quote.cadenceLabel,
    frequency: quote.frequency,
    serviceType: quote.serviceType
  };
}

const BUSINESS_EMAILS = ['tghill@gmail.com', 'natabelpristinecleaning@gmail.com'];
const BUSINESS_EMAIL = BUSINESS_EMAILS[1];
const FROM_EMAIL = 'quotes@natabelpristinecleaning.com';
const HONEYPOT_FIELD = 'website_url';
const MAX_BODY_BYTES = 48 * 1024;
const DISCLAIMER = 'Your instant estimate is based on your home’s square footage and selected service. Final pricing will be confirmed after we review the property’s condition, bathrooms, pets, clutter, requested services, and any add-ons.';
const EXCLUSIONS = 'Appliance interiors, excessive debris, wall washing, carpet cleaning, exterior windows, garages, and hauling are not included in this estimate. Optional services and unusual-condition charges are reviewed and priced separately.';
const ALLOWED = {
  pets: new Set(['none', 'dog', 'cat', 'multiple', 'other']),
  condition: new Set(['maintained', 'average', 'heavy']),
  clutter: new Set(['light', 'average', 'heavy'])
};

function safe(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function text(value, max = 300) {
  return String(value || '').trim().slice(0, max);
}

function selectedList(value) {
  if (Array.isArray(value)) return value.map(item => text(item, 80)).filter(Boolean).slice(0, 20);
  return text(value, 800) ? [text(value, 800)] : [];
}

function frequencyLabel(value) {
  return ({ weekly: 'Weekly', biweekly: 'Every 2 Weeks', monthly: 'Every 4 Weeks', one_time: 'One-Time' })[value] || value;
}

function serviceDetails(body) {
  if (body.service_type === 'deep') return { label: 'Deep Cleaning', cadence: 'one-time cleaning', oneTime: true };
  if (body.service_type === 'move') return { label: 'Move-In / Move-Out Cleaning', cadence: 'one-time cleaning', oneTime: true };
  return { label: 'Standard Recurring Cleaning', cadence: 'per visit', oneTime: false };
}

function normalizeSubmission(body, quote) {
  return {
    submission_id: text(body.submission_id, 128),
    submitted_at: new Date().toISOString(),
    form_type: 'instant_estimate',
    quote_type: 'residential',
    lead_source_label: 'Instant Quote',
    source: text(body.source, 300) || '/free-estimate.html',
    name: text(body.name, 120),
    phone: text(body.phone, 40),
    email: text(body.email, 254).toLowerCase(),
    service_address: text(body.service_address, 220),
    city: text(body.city, 100),
    zip: text(body.zip, 10),
    property_type: text(body.property_type, 30),
    service_type: text(body.service_type, 30),
    service_type_label: serviceDetails(body).label,
    frequency: text(body.frequency, 30),
    frequency_label: frequencyLabel(body.frequency),
    square_footage: Number(body.square_footage),
    bedrooms: text(body.bedrooms, 20),
    bathrooms: text(body.bathrooms, 20),
    pets: text(body.pets, 30),
    requested_date: text(body.requested_date, 10),
    condition: text(body.condition, 30),
    clutter: text(body.clutter, 30),
    requested_add_ons: selectedList(body.requested_add_ons),
    focus_areas: selectedList(body.focus_areas),
    notes: text(body.notes, 2000),
    contact_consent: text(body.contact_consent, 10),
    estimate_amount: quote.amount,
    estimate_currency: quote.currency,
    estimate_cadence: quote.cadence,
    base_price: quote.baseCharge,
    square_footage_charge: quote.squareFootageCharge,
    standard_minimum_applied: quote.minimumApplied,
    rate_book_version: quote.rateBookVersion,
    utm_source: text(body.utm_source, 100),
    utm_medium: text(body.utm_medium, 100),
    utm_campaign: text(body.utm_campaign, 100)
  };
}

function validationError(body) {
  const required = ['name', 'phone', 'email', 'service_address', 'city', 'zip', 'property_type', 'bedrooms', 'bathrooms', 'pets', 'requested_date'];
  if (required.some(field => !text(body[field], 220))) return 'missing_required_details';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(body.email, 254))) return 'invalid_email';
  if (text(body.phone, 40).replace(/\D/g, '').length < 10) return 'invalid_phone';
  if (!/^\d{5}$/.test(text(body.zip, 10))) return 'invalid_zip';
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(text(body.submission_id, 128))) return 'invalid_submission_id';
  if (!ALLOWED.pets.has(text(body.pets, 30))) return 'invalid_pets';
  if (!ALLOWED.condition.has(text(body.condition, 30))) return 'invalid_condition';
  if (!ALLOWED.clutter.has(text(body.clutter, 30))) return 'invalid_clutter';
  const requestedDate = text(body.requested_date, 10);
  const parsedDate = new Date(`${requestedDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== requestedDate) return 'invalid_requested_date';
  if (!Number.isFinite(Number(body.form_started_at)) || Number(body.form_started_at) <= 0) return 'invalid_form_timing';
  if (text(body.contact_consent, 10) !== 'yes') return 'invalid_contact_consent';
  if (String(body.name || '').trim().length > 120 || String(body.service_address || '').trim().length > 220 || String(body.notes || '').trim().length > 2000) return 'field_too_long';
  return null;
}

function emailRows(body) {
  return [
    ['Submission ID', body.submission_id],
    ['Customer name', body.name],
    ['Phone', body.phone],
    ['Email', body.email],
    ['Service address', `${body.service_address}, ${body.city}, ${body.zip}`],
    ['Cleaning type', body.service_type_label],
    ['Frequency', body.frequency_label],
    ['Square footage', body.square_footage],
    ['Bedrooms', body.bedrooms],
    ['Bathrooms', body.bathrooms],
    ['Pets', body.pets],
    ['Requested date', body.requested_date],
    ['Home condition', body.condition],
    ['Clutter', body.clutter],
    ['Base price', `$${Number(body.base_price).toLocaleString()}`],
    ['Square-footage charge', `$${Number(body.square_footage_charge).toLocaleString(undefined, { minimumFractionDigits: Number.isInteger(body.square_footage_charge) ? 0 : 2, maximumFractionDigits: 2 })}`],
    ['Standard minimum applied', body.standard_minimum_applied ? 'Yes — $125 minimum' : 'No'],
    ['Calculated estimate', `$${Number(body.estimate_amount).toLocaleString()} ${body.estimate_cadence === 'one_time' ? 'one-time' : 'per visit'}`],
    ['Requested add-ons', body.requested_add_ons.join(', ') || 'None'],
    ['Focus areas', body.focus_areas.join(', ') || 'None'],
    ['Additional notes', body.notes || 'None'],
    ['Submission date and time', body.submitted_at],
    ['Source page', body.source]
  ];
}

function internalEmailHtml(body) {
  const rows = emailRows(body).map(([label, value]) => `<tr><td style="padding:7px 16px 7px 0;color:#746b59;vertical-align:top;white-space:nowrap">${safe(label)}</td><td style="padding:7px 0;font-weight:600">${safe(value)}</td></tr>`).join('');
  return `<div style="font-family:Arial,sans-serif;color:#17140f;line-height:1.5;max-width:680px;margin:auto"><p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8f6e1f">NataBel Pristine Cleaning</p><h1 style="font-family:Georgia,serif;font-weight:500">New residential cleaning request</h1><table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows}</table><p style="padding:14px;background:#fff8e7;border:1px solid #decfae">${safe(DISCLAIMER)}</p><p><strong>Base-estimate exclusions:</strong> ${safe(EXCLUSIONS)}</p></div>`;
}

function customerEmailHtml(body) {
  const service = serviceDetails(body);
  const cadence = service.oneTime ? 'one-time estimate' : 'per-visit estimate';
  return `<div style="font-family:Arial,sans-serif;color:#17140f;line-height:1.6;max-width:620px;margin:auto"><p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8f6e1f">NataBel Pristine Cleaning</p><h1 style="font-family:Georgia,serif;font-weight:500">Your Instant Estimate</h1><p style="font-size:38px;font-family:Georgia,serif;margin:18px 0">$${Number(body.estimate_amount).toLocaleString()} <span style="font-size:16px">${safe(cadence)}</span></p><p><strong>${safe(service.label)}</strong> for ${safe(body.square_footage)} sq ft at ${safe(body.service_address)}, ${safe(body.city)}.</p><p style="padding:14px;background:#fff8e7;border:1px solid #decfae">${safe(DISCLAIMER)}</p><p>NataBel will review your property details, confirm final pricing and availability, and contact you about next steps. For immediate help, call (916) 899-8811.</p><p><strong>Base-estimate exclusions:</strong> ${safe(EXCLUSIONS)}</p></div>`;
}

async function saveSubmission(payload) {
  const url = process.env.QUOTE_WEBHOOK_URL || process.env.LEAD_WEBHOOK_URL;
  if (!url) return { ok: false, reason: 'quote_webhook_not_configured' };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `natabel-quote-${payload.submission_id}` },
      body: JSON.stringify(payload)
    });
    let result = null;
    try { result = await response.json(); } catch (_) { /* generic webhooks may return no JSON */ }
    if (!response.ok || result?.ok === false) return { ok: false, reason: result?.error || `quote_webhook_${response.status}` };
    return {
      ok: true,
      duplicate: result?.duplicate === true,
      notificationDelivered: result?.notificationDelivered === true,
      customerEmailDelivered: result?.customerEmailDelivered === true
    };
  } catch (error) {
    return { ok: false, reason: `quote_webhook_request_failed: ${error.message}` };
  }
}

async function sendEmail({ to, subject, html, replyTo, idempotencyKey }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: 'resend_not_configured' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        from: `NataBel Pristine Cleaning <${process.env.QUOTE_FROM_EMAIL || process.env.LEAD_FROM_EMAIL || FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to], subject, html, reply_to: replyTo || BUSINESS_EMAIL
      })
    });
    if (response.ok) return { ok: true };
    let detail = '';
    try { detail = JSON.stringify(await response.json()); } catch (_) { /* do not mask the status */ }
    return { ok: false, reason: `resend_${response.status}`, detail };
  } catch (error) {
    return { ok: false, reason: `resend_request_failed: ${error.message}` };
  }
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) return res.status(413).json({ ok: false, error: 'too_large' });
    try { body = JSON.parse(body); } catch (_) { return res.status(400).json({ ok: false, error: 'invalid_json' }); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ ok: false, error: 'invalid_payload' });
  if (JSON.stringify(body).length > MAX_BODY_BYTES) return res.status(413).json({ ok: false, error: 'too_large' });

  if (text(body[HONEYPOT_FIELD], 100)) {
    console.info('[quote] discarded spam submission');
    return res.status(200).json({ ok: true, discarded: true });
  }

  let result;
  try { result = calculateResidential(body, priceBook); }
  catch (error) { return res.status(400).json({ ok: false, error: error.message || 'invalid_quote_input' }); }
  if (result.status !== 'estimated') return res.status(503).json({ ok: false, status: 'manual_review_required', error: result.reason || 'pricing_not_configured' });
  if (body.preview === true) return res.status(200).json({ ok: true, status: 'estimated', quote: publicQuote(result.quote) });

  const validation = validationError(body);
  if (validation) return res.status(400).json({ ok: false, error: validation });
  if (!serviceArea.isEligibleZip(text(body.zip, 10))) {
    return res.status(200).json({ ok: false, status: 'service_area_unavailable', error: 'zip_not_served', serviceAreaVersion: serviceArea.version });
  }

  const startedAt = Number(body.form_started_at);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < 1500) {
    console.info('[quote] discarded submission completed too quickly', { submissionId: text(body.submission_id, 128) });
    return res.status(200).json({ ok: true, discarded: true });
  }

  const submission = normalizeSubmission(body, result.quote);
  const storage = await saveSubmission(submission);
  if (!storage.ok) {
    console.error('[quote] STORAGE FAILED', { submissionId: submission.submission_id, reason: storage.reason });
    return res.status(503).json({ ok: false, error: 'quote_storage_failed', submissionId: submission.submission_id });
  }

  const service = serviceDetails(submission);
  const cadenceSuffix = service.oneTime ? '' : ' per visit';
  const [internal, customer] = await Promise.all([
    storage.notificationDelivered ? Promise.resolve({ ok: true, via: 'webhook' }) : sendEmail({
      to: BUSINESS_EMAILS,
      subject: `New NataBel ${service.label} request — ${submission.name} — $${result.quote.amount}${cadenceSuffix}`,
      html: internalEmailHtml(submission),
      replyTo: submission.email,
      idempotencyKey: `natabel-quote-${submission.submission_id}-internal`
    }),
    storage.customerEmailDelivered ? Promise.resolve({ ok: true, via: 'webhook' }) : sendEmail({
      to: submission.email,
      subject: `Your NataBel Instant Estimate: $${result.quote.amount}${cadenceSuffix}`,
      html: customerEmailHtml(submission),
      idempotencyKey: `natabel-quote-${submission.submission_id}-customer`
    })
  ]);

  if (!internal.ok || !customer.ok) {
    console.error('[quote] EMAIL DELIVERY FAILED — SUBMISSION PRESERVED', {
      submissionId: submission.submission_id,
      internal: internal.reason,
      internalDetail: internal.detail,
      customer: customer.reason,
      customerDetail: customer.detail
    });
  }

  return res.status(200).json({
    ok: true,
    status: 'estimated',
    submissionId: submission.submission_id,
    duplicate: storage.duplicate,
    saved: true,
    quote: publicQuote(result.quote),
    delivery: { customerEmail: customer.ok, internalEmail: internal.ok },
    notificationPending: !internal.ok
  });
}

module.exports = handler;
module.exports.calculateResidential = calculateResidential;
module.exports.exactRange = exactRange;
module.exports.priceBook = priceBook;
