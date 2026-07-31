/* =========================================================================
   NATABEL PRISTINE CLEANING — Lead intake endpoint (Vercel Function)

   Receives a lead from any site form, validates it server-side, and
   delivers it. Runs on Vercel with no npm dependencies (uses built-in
   fetch), so the site stays a no-build static project.

   Environment variables (set in the Vercel dashboard, never in git):
     RESEND_API_KEY   required to send email. From resend.com > API Keys.
     LEAD_TO_EMAIL    where leads go.  Default: the business inbox below.
     LEAD_FROM_EMAIL  sender address. Must be on a domain verified in
                      Resend. Default: onboarding@resend.dev, which is
                      Resend's sandbox sender and can ONLY deliver to the
                      Resend account owner's own address. Fine for testing,
                      must be changed to a verified domain for real use.
     LEAD_WEBHOOK_URL optional. If set, the lead is also POSTed here
                      (Zapier / Make / Jobber / Google Apps Script).

   Responds { ok: true } only when at least one delivery actually
   succeeded, so the site never tells a customer their request went
   through when it did not.
   ========================================================================= */

const DEFAULT_TO = 'natabelpristinecleaning@gmail.com';
const DEFAULT_FROM = 'onboarding@resend.dev';
const HONEYPOT_FIELD = 'website_url';
const MAX_BODY_BYTES = 32 * 1024;

const FIELD_LABELS = {
  name: 'Name', phone: 'Phone', email: 'Email', message: 'Message',
  service_type_label: 'Service', service_type: 'Service (value)',
  frequency: 'Frequency', property_type: 'Property', bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms', square_footage: 'Approx. square feet',
  commercial_sqft: 'Approx. square feet', restrooms: 'Restrooms',
  city: 'City', zip: 'ZIP', address: 'Address', subject: 'Subject',
  preferred_date: 'Preferred date', preferred_time: 'Preferred time',
  booking_type: 'Booking type', notes: 'Notes',
  lead_source_label: 'Submitted from',
};
const INTERNAL_FIELDS = ['submitted_at', 'source', 'landing_page', 'referrer', HONEYPOT_FIELD];

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function buildRows(payload) {
  const rows = [];
  const seen = new Set();
  Object.keys(FIELD_LABELS).forEach(k => {
    if (payload[k]) { rows.push([FIELD_LABELS[k], payload[k]]); seen.add(k); }
  });
  Object.keys(payload).forEach(k => {
    if (seen.has(k) || INTERNAL_FIELDS.includes(k) || k.startsWith('utm_')) return;
    if (payload[k]) rows.push([k, payload[k]]);
  });
  return rows;
}

function buildEmail(payload) {
  const rows = buildRows(payload);
  const utm = Object.keys(payload).filter(k => k.startsWith('utm_') && payload[k]);

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n')
    + (utm.length ? '\n\n-- campaign --\n' + utm.map(k => `${k}: ${payload[k]}`).join('\n') : '')
    + `\n\nPage: ${payload.source || ''}\nSubmitted: ${payload.submitted_at || new Date().toISOString()}`;

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;color:#14110c">
    <h2 style="margin:0 0 4px;font-size:18px">New ${esc(payload.lead_source_label || 'website')} lead</h2>
    <p style="margin:0 0 16px;color:#6b6b6b;font-size:13px">NataBel Pristine Cleaning</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr>
        <td style="padding:6px 16px 6px 0;color:#6b6b6b;vertical-align:top;white-space:nowrap">${esc(k)}</td>
        <td style="padding:6px 0;font-weight:600">${esc(v)}</td></tr>`).join('')}
    </table>
    ${utm.length ? `<p style="margin:16px 0 0;color:#6b6b6b;font-size:12px">Campaign: ${utm.map(k => esc(k + '=' + payload[k])).join(' &middot; ')}</p>` : ''}
    <p style="margin:16px 0 0;color:#6b6b6b;font-size:12px">Page: ${esc(payload.source || '')}</p>
  </div>`;

  const who = payload.name ? ` — ${payload.name}` : '';
  return { subject: `New lead: ${payload.lead_source_label || 'Website'}${who}`, text, html };
}

async function sendViaResend(payload) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: 'RESEND_API_KEY not set' };

  const { subject, text, html } = buildEmail(payload);
  const body = {
    from: `NataBel Website <${process.env.LEAD_FROM_EMAIL || DEFAULT_FROM}>`,
    to: [process.env.LEAD_TO_EMAIL || DEFAULT_TO],
    subject,
    text,
    html,
  };
  // Let Fatima reply straight to the customer
  if (payload.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    body.reply_to = payload.email;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch (_) { /* ignore */ }
    return { ok: false, reason: `resend ${res.status}`, detail };
  } catch (e) {
    return { ok: false, reason: 'resend request failed: ' + e.message };
  }
}

async function forwardToWebhook(payload) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, reason: res.ok ? undefined : `webhook ${res.status}` };
  } catch (e) {
    return { ok: false, reason: 'webhook request failed: ' + e.message };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    if (payload.length > MAX_BODY_BYTES) return res.status(413).json({ ok: false, error: 'too_large' });
    try { payload = JSON.parse(payload); } catch (_) {
      return res.status(400).json({ ok: false, error: 'invalid_json' });
    }
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  // Server-side honeypot: accept and discard so bots get no signal.
  if (String(payload[HONEYPOT_FIELD] || '').trim()) {
    console.info('[lead] discarded: honeypot');
    return res.status(200).json({ ok: true, discarded: true });
  }

  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const phone = String(payload.phone || '').trim();
  if (!name || (!email && !phone)) {
    return res.status(400).json({ ok: false, error: 'missing_contact_details' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }

  const [mail, hook] = await Promise.all([sendViaResend(payload), forwardToWebhook(payload)]);
  const delivered = !!(mail.ok || (hook && hook.ok));

  if (!delivered) {
    // Log enough to diagnose, never the key itself. The lead text is in the
    // log so it is recoverable from the Vercel dashboard even on failure.
    console.error('[lead] DELIVERY FAILED', {
      email: mail.reason, emailDetail: mail.detail, webhook: hook && hook.reason,
      lead: buildEmail(payload).text,
    });
    // Deliberately 200 with ok:false rather than a 5xx. Cloudflare sits in
    // front of this domain and replaces 5xx bodies with its own error page,
    // which would hide this JSON from the browser. The client treats
    // ok:false as a failure and falls back to the mail-client hand-off.
    return res.status(200).json({ ok: false, error: 'delivery_failed' });
  }

  console.info('[lead] delivered', { email: mail.ok, webhook: hook ? hook.ok : 'not-configured' });
  return res.status(200).json({ ok: true, delivery: { email: mail.ok, webhook: hook ? hook.ok : null } });
};
