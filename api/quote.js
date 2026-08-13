const priceBook = require('../lib/price-book');
const { calculateResidential } = require('../lib/quote-pricing');

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
  } catch (error) {
    return { ok: false, reason: 'resend_request_failed' };
  }
}

function emailHtml(body, quote, customer) {
  const range = `$${quote.low.toLocaleString()}–$${quote.high.toLocaleString()}`;
  return `<div style="font-family:Arial,sans-serif;color:#17140f;line-height:1.6;max-width:620px;margin:auto">
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8f6e1f">NataBel Pristine Cleaning</p>
    <h1 style="font-family:Georgia,serif;font-weight:500">${customer ? 'Your instant estimate' : 'New instant-estimate lead'}</h1>
    <p style="font-size:34px;font-family:Georgia,serif;margin:18px 0">${range}</p>
    <p>Estimated ${safe(quote.cadenceLabel)} for ${safe(body.name)} in ${safe(body.city)} ${safe(body.zip)}.</p>
    <p><strong>Service:</strong> ${safe(body.service_type)}<br><strong>Home:</strong> ${safe(body.square_footage)} sq ft · ${safe(body.bedrooms)} bed · ${safe(body.bathrooms)} bath<br><strong>Frequency:</strong> ${safe(body.frequency)}<br><strong>Condition:</strong> ${safe(body.condition)}</p>
    <p style="padding:14px;background:#fff8e7;border:1px solid #decfae">This is a planning range, not a final price. Fatima confirms scope, condition, add-ons, and availability before service.</p>
    ${customer ? '<p>NataBel will follow up using the contact details you provided.</p>' : `<p><strong>Phone:</strong> ${safe(body.phone)}<br><strong>Email:</strong> ${safe(body.email)}<br><strong>Notes:</strong> ${safe(body.notes)}</p>`}
  </div>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch (_) { return null; } })() : req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ ok: false, error: 'invalid_payload' });
  if (String(body.website_url || '').trim()) return res.status(200).json({ ok: true, discarded: true });
  if (!validContact(body)) return res.status(400).json({ ok: false, error: 'invalid_contact' });

  let result;
  try { result = calculateResidential(body, priceBook); }
  catch (error) { return res.status(400).json({ ok: false, error: error.message || 'invalid_quote_input' }); }
  if (result.status !== 'estimated') {
    return res.status(200).json({ ok: false, status: 'manual_review_required', error: result.reason || 'pricing_not_configured' });
  }

  const customer = await sendEmail({
    to: body.email,
    subject: `Your NataBel estimate: $${result.quote.low}–$${result.quote.high}`,
    html: emailHtml(body, result.quote, true)
  });
  const internal = await sendEmail({
    to: process.env.LEAD_TO_EMAIL || BUSINESS_EMAIL,
    subject: `New NataBel estimate — ${body.name}`,
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
