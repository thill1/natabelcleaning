const priceBook = require('../lib/price-book');
const { calculateResidential } = require('../lib/quote-pricing');
const serviceArea = require('../lib/service-area');

const BUSINESS_EMAIL = 'natabelpristinecleaning@gmail.com';
const FROM_EMAIL = 'quotes@natabelpristinecleaning.com';

function safe(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function validContact(body) {
  return String(body.name || '').trim()
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email || '').trim())
    && /[0-9()+\-\s]{10,}/.test(String(body.phone || '').trim())
    && String(body.contact_consent || '') === 'yes';
}

async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: 'resend_not_configured' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `NataBel Pristine Cleaning <${process.env.QUOTE_FROM_EMAIL || FROM_EMAIL}>`,
        to: [to], subject, html, reply_to: replyTo || BUSINESS_EMAIL
      })
    });
    return { ok: response.ok, reason: response.ok ? undefined : `resend_${response.status}` };
  } catch (_) {
    return { ok: false, reason: 'resend_request_failed' };
  }
}

function frequencyLabel(value) {
  return ({ weekly: 'Weekly', biweekly: 'Every 2 Weeks', monthly: 'Every 4 Weeks' })[value] || value;
}

function selectedList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return String(value || '').trim();
}

function emailHtml(body, quote, customer) {
  const amount = `$${Number(quote.amount).toLocaleString()}`;
  const firstVisitNote = String(body.recent_cleaning || '') === 'no'
    ? 'The first visit may require a more detailed reset and is confirmed separately before service.'
    : 'The recurring rate applies to the selected visit frequency, subject to final scope confirmation.';
  const extras = selectedList(body.requested_add_ons);
  const focusAreas = selectedList(body.focus_areas);
  return `<div style="font-family:Arial,sans-serif;color:#17140f;line-height:1.6;max-width:620px;margin:auto">
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8f6e1f">NataBel Pristine Cleaning</p>
    <h1 style="font-family:Georgia,serif;font-weight:500">${customer ? 'Your recurring cleaning quote' : 'New instant-quote lead'}</h1>
    <p style="font-size:38px;font-family:Georgia,serif;margin:18px 0">${amount} <span style="font-size:16px">per visit</span></p>
    <p><strong>Cleaning service only.</strong> Prices are subject to change.</p>
    <p><strong>${safe(frequencyLabel(body.frequency))}</strong> recurring cleaning for ${safe(body.name || 'this home')} in ${safe(body.city)} ${safe(body.zip)}.</p>
    <p><strong>Home:</strong> ${safe(body.square_footage)} sq ft · ${safe(body.bedrooms)} bed · ${safe(body.bathrooms)} bath<br><strong>Property:</strong> ${safe(body.property_type)}<br><strong>Service address:</strong> ${safe(body.service_address)}<br><strong>Professionally cleaned in the last 30 days:</strong> ${safe(body.recent_cleaning)}</p>
    ${focusAreas ? `<p><strong>Focus areas:</strong> ${safe(focusAreas)}</p>` : ''}
    ${extras ? `<p><strong>Requested add-ons:</strong> ${safe(extras)}</p><p><strong>Fatima will call you for any additional add-on quotes.</strong></p>` : ''}
    <p style="padding:14px;background:#fff8e7;border:1px solid #decfae">${safe(firstVisitNote)} Add-ons are not included in the cleaning price shown.</p>
    ${customer ? '<p>NataBel will follow up using the contact details you provided to confirm the first visit and scheduling. If you would like immediate help, call (916) 899-8811.</p>' : `<p><strong>Phone:</strong> ${safe(body.phone)}<br><strong>Email:</strong> ${safe(body.email)}<br><strong>Notes:</strong> ${safe(body.notes)}</p>`}
  </div>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch (_) { return null; } })() : req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ ok: false, error: 'invalid_payload' });
  if (String(body.website_url || '').trim()) return res.status(200).json({ ok: true, discarded: true });

  const zip = String(body.zip || '').trim();
  if (/^\d{5}$/.test(zip) && !serviceArea.isEligibleZip(zip)) {
    return res.status(200).json({
      ok: false,
      status: 'service_area_unavailable',
      error: 'zip_not_served',
      serviceAreaVersion: serviceArea.version
    });
  }

  let result;
  try { result = calculateResidential(body, priceBook); }
  catch (error) { return res.status(400).json({ ok: false, error: error.message || 'invalid_quote_input' }); }

  if (result.status !== 'estimated') {
    return res.status(200).json({ ok: false, status: 'manual_review_required', error: result.reason || 'pricing_not_configured' });
  }

  if (body.preview === true) {
    return res.status(200).json({ ok: true, status: 'estimated', quote: result.quote });
  }

  if (!validContact(body)) return res.status(400).json({ ok: false, error: 'invalid_contact' });

  const customer = await sendEmail({
    to: body.email,
    subject: `Your NataBel recurring quote: $${result.quote.amount} per visit`,
    html: emailHtml(body, result.quote, true)
  });
  const internal = await sendEmail({
    to: process.env.LEAD_TO_EMAIL || BUSINESS_EMAIL,
    subject: `New NataBel instant quote — ${body.name}`,
    html: emailHtml(body, result.quote, false),
    replyTo: body.email
  });

  return res.status(200).json({
    ok: true,
    status: 'estimated',
    quote: result.quote,
    delivery: { customerEmail: customer.ok, internalEmail: internal.ok }
  });
};
