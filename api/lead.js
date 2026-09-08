/* =========================================================================
   NATABEL PRISTINE CLEANING — Lead intake endpoint (Vercel Function)

   Receives a lead from any site form, validates it server-side, and
   delivers it. Runs on Vercel with no npm dependencies (uses built-in
   fetch), so the site stays a no-build static project.

   Environment variables (set in the Vercel dashboard, never in git):
     RESEND_API_KEY   required to send email. From resend.com > API Keys.
     LEAD_TO_EMAIL    where leads go. Accepts a comma-separated list.
                      Default: the two business inboxes below.
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

   Job applications additionally get a confirmation email sent back to the
   applicant. That send is best-effort: if it fails, the response still
   reports success, because the application itself did reach the business.
   NOTE: the confirmation cannot work on the default sandbox sender —
   onboarding@resend.dev only delivers to the Resend account owner. Set
   LEAD_FROM_EMAIL to an address on a domain verified in Resend before
   relying on applicant confirmations.
   ========================================================================= */

/* Every lead notification goes to both the business inbox and Sentient
   Partners. LEAD_TO_EMAIL overrides and accepts a comma-separated list. */
const DEFAULT_TO = ['natabelpristinecleaning@gmail.com', 'info@sentientipartners.ai'];

function notifyRecipients() {
  const configured = String(process.env.LEAD_TO_EMAIL || '').trim();
  if (!configured) return DEFAULT_TO.slice();
  const list = configured.split(',').map(s => s.trim()).filter(Boolean);
  return list.length ? list : DEFAULT_TO.slice();
}
const DEFAULT_FROM = 'onboarding@resend.dev';
const HONEYPOT_FIELD = 'website_url';
const MAX_BODY_BYTES = 32 * 1024;
const BUSINESS_NAME = 'NataBel Pristine Cleaning';
const BUSINESS_PHONE = '(916) 899-8811';
const SITE_URL = 'https://www.natabelpristinecleaning.com';

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

  /* Job applications — keeps the careers fields readable instead of
     rendering raw names like "start_availability" in Fatima's inbox. */
  application_reference: 'Reference', application_stage: 'Stage',
  position: 'Position', preferred_name: 'Preferred name',
  preferred_contact: 'Best way to reach them',
  drivers_license: 'Valid driver’s license', auto_insurance: 'Current auto insurance',
  employer_1_contact: 'Employer 1 contact', employer_2_contact: 'Employer 2 contact',
  preferred_schedule: 'Preferred schedule', cleaning_experience: 'Cleaning experience',
  start_availability: 'Could start', reliable_transportation: 'Reliable transportation',
  eligibility_confirmed: '18+ and work authorized', application_language: 'Applied in',
  days_available: 'Days available', hours_desired: 'Hours wanted per week',
  available_start_date: 'Available start date', available_from: 'Earliest time',
  available_until: 'Latest time', essential_duties: 'Can perform essential duties',
  training_and_protocols: 'Will complete training', languages_spoken: 'Languages spoken',
  cleaning_skills: 'Cleaning skills', electronic_signature: 'Electronic signature',
  signature_date: 'Signed on',
};

/* Form types that get an applicant confirmation email. */
const JOB_APPLICATION_TYPES = ['job_application', 'job_application_express', 'job_application_full'];
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
    to: notifyRecipients(),
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

/* =========================================================================
   Applicant confirmation
   -------------------------------------------------------------------------
   Sent to the address on a job application so the applicant knows it arrived
   and what to expect. The body is fixed copy — the only value taken from the
   submission is the first name and the reference code, both escaped and
   length-capped, so this endpoint cannot be turned into a way to mail
   arbitrary text to an arbitrary address.
   ========================================================================= */

/* Best-effort throttle. Serverless instances are ephemeral and there can be
   many at once, so this bounds a hot loop on one warm instance rather than
   providing real rate limiting. Put a proper limiter in front of the
   function if applicant confirmations ever get abused. */
const recentConfirmations = new Map();
const CONFIRM_WINDOW_MS = 10 * 60 * 1000;

function confirmationThrottled(email) {
  const now = Date.now();
  for (const [key, at] of recentConfirmations) {
    if (now - at > CONFIRM_WINDOW_MS) recentConfirmations.delete(key);
  }
  const key = email.toLowerCase();
  if (recentConfirmations.has(key)) return true;
  recentConfirmations.set(key, now);
  return false;
}

function buildApplicantEmail(payload) {
  const spanish = String(payload.application_language || '').toLowerCase() === 'spanish';
  const firstName = String(payload.name || '').trim().split(/\s+/)[0].slice(0, 40);
  const reference = String(payload.application_reference || '').trim().slice(0, 40);
  const isExpress = payload.form_type === 'job_application_express';

  const copy = spanish ? {
    subject: `Recibimos tu solicitud — ${BUSINESS_NAME}`,
    greeting: firstName ? `Hola ${firstName},` : 'Hola,',
    intro: `Gracias por postularte a ${BUSINESS_NAME}. Recibimos tu solicitud.`,
    next: 'Fatima revisa personalmente cada solicitud, normalmente en un plazo de dos días hábiles. Si parece haber compatibilidad, te llamará o te escribirá para hablar del puesto, el horario y el pago.',
    refLabel: 'Tu referencia',
    ctaIntro: 'Si quieres adelantarte, puedes completar la solicitud de empleo completa ahora. Toma unos 8 minutos y se guarda mientras avanzas.',
    ctaLabel: 'Completar la solicitud completa',
    questions: `¿Preguntas? Llámanos al ${BUSINESS_PHONE}.`,
    signoff: `— Fatima Patalano, Fundadora\n${BUSINESS_NAME}`,
    disclaimer: 'Postularse no garantiza empleo.',
  } : {
    subject: `We received your application — ${BUSINESS_NAME}`,
    greeting: firstName ? `Hi ${firstName},` : 'Hi,',
    intro: `Thank you for applying to ${BUSINESS_NAME}. Your application came through.`,
    next: 'Fatima reads every application herself, usually within two business days. If it looks like a fit, she will call or text you to talk through the role, schedule, and pay.',
    refLabel: 'Your reference',
    ctaIntro: 'If you would like to get ahead, you can complete the full employment application now. It takes about 8 minutes and saves as you go.',
    ctaLabel: 'Complete the full application',
    questions: `Questions? Call us at ${BUSINESS_PHONE}.`,
    signoff: `— Fatima Patalano, Founder\n${BUSINESS_NAME}`,
    disclaimer: 'Applying does not guarantee employment.',
  };

  const applyUrl = `${SITE_URL}/application.html`;

  const text = [
    copy.greeting,
    '',
    copy.intro,
    '',
    copy.next,
    reference ? `\n${copy.refLabel}: ${reference}` : '',
    isExpress ? `\n${copy.ctaIntro}\n${applyUrl}` : '',
    '',
    copy.questions,
    '',
    copy.signoff,
    '',
    copy.disclaimer,
  ].filter(Boolean).join('\n');

  const html = `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#17140f;max-width:560px">
    <p style="margin:0 0 16px">${esc(copy.greeting)}</p>
    <p style="margin:0 0 16px">${esc(copy.intro)}</p>
    <p style="margin:0 0 16px">${esc(copy.next)}</p>
    ${reference ? `<p style="margin:0 0 20px;padding:12px 16px;background:#fbf6ec;border:1px solid rgba(198,161,74,.38);border-radius:10px;font-size:14px">
      ${esc(copy.refLabel)}: <strong style="letter-spacing:.03em">${esc(reference)}</strong></p>` : ''}
    ${isExpress ? `<p style="margin:0 0 16px">${esc(copy.ctaIntro)}</p>
      <p style="margin:0 0 24px"><a href="${applyUrl}" style="display:inline-block;padding:14px 26px;border-radius:999px;background:#e3c878;color:#17120a;font-weight:600;text-decoration:none">${esc(copy.ctaLabel)}</a></p>` : ''}
    <p style="margin:0 0 16px">${esc(copy.questions)}</p>
    <p style="margin:0 0 6px;white-space:pre-line">${esc(copy.signoff)}</p>
    <p style="margin:20px 0 0;color:#6b6b6b;font-size:12px">${esc(copy.disclaimer)}</p>
  </div>`;

  return { subject: copy.subject, text, html };
}

async function sendApplicantConfirmation(payload) {
  if (!JOB_APPLICATION_TYPES.includes(payload.form_type)) return null;

  const to = String(payload.email || '').trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { ok: false, reason: 'no applicant email' };

  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: 'RESEND_API_KEY not set' };

  if (confirmationThrottled(to)) return { ok: false, reason: 'throttled' };

  const { subject, text, html } = buildApplicantEmail(payload);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `${BUSINESS_NAME} <${process.env.LEAD_FROM_EMAIL || DEFAULT_FROM}>`,
        to: [to],
        reply_to: notifyRecipients()[0],
        subject,
        text,
        html,
      }),
    });
    if (res.ok) return { ok: true };
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch (_) { /* ignore */ }
    return { ok: false, reason: `resend ${res.status}`, detail };
  } catch (e) {
    return { ok: false, reason: 'confirmation request failed: ' + e.message };
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

  // Only confirm to the applicant once the application has actually reached
  // the business. Failure here is logged but never downgrades the response:
  // the application did arrive, and telling the applicant otherwise would
  // push them to submit it a second time.
  const confirmation = await sendApplicantConfirmation(payload);
  if (confirmation && !confirmation.ok) {
    console.warn('[lead] applicant confirmation not sent', confirmation);
  }

  console.info('[lead] delivered', {
    email: mail.ok,
    webhook: hook ? hook.ok : 'not-configured',
    applicantConfirmation: confirmation ? confirmation.ok : 'not-applicable',
  });
  return res.status(200).json({
    ok: true,
    delivery: {
      email: mail.ok,
      webhook: hook ? hook.ok : null,
      applicant_confirmation: confirmation ? confirmation.ok : null,
    },
  });
};
