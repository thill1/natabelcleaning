/* =========================================================================
   NATABEL PRISTINE CLEANING — Lead capture & routing
   Single handler for all forms: validates → tracks → routes → confirms.
   Routes to: Jobber / Housecall Pro / GoHighLevel / webhook / Google Sheet.
   See config.js `PCC.leads` to configure the endpoint.
   ========================================================================= */
(function () {
  'use strict';
  if (!window.PCC) return;
  const raw = window.PCC.leads;
  const endpoint = (raw.endpoint || '').trim();
  const cfg = endpoint && !endpoint.includes('YOUR_')
    ? { ...raw, endpoint, demoMode: false }
    : raw;
  const ev = window.PCC.events;

  function notice(form, msg, type) {
    type = type || 'info';
    let box = form.querySelector('.form-notice');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-notice';
      box.style.cssText = 'padding:14px 16px;border-radius:12px;font-size:.92rem;font-weight:600;margin-top:8px;';
      form.appendChild(box);
    }
    box.style.background = type === 'error' ? '#fdecea' : type === 'success' ? '#e6f2f1' : '#fef6e7';
    box.style.color = type === 'error' ? '#a83227' : type === 'success' ? '#0A545E' : '#8a6110';
    box.textContent = msg;
    box.style.display = 'block';
    return box;
  }

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isPhone(v) { return /[0-9()\-\s+]{10,}/.test(v); }

  /* ---------- Spam protection ----------
     Two cheap, invisible checks that stop the overwhelming majority of bot
     submissions without putting a captcha in front of real customers:
       1. Honeypot — a field hidden from people but attractive to bots.
          Any value in it means the sender was not a human.
       2. Time-to-submit — bots post near-instantly. A form completed in
          under MIN_FILL_MS was almost certainly not typed by a person.
     Both are silent: a suspected bot is shown the normal confirmation so it
     has no signal to adapt, but nothing is delivered. */
  const HONEYPOT_FIELD = 'website_url';
  const MIN_FILL_MS = 2500;

  function installHoneypot(form) {
    if (form.querySelector(`[name="${HONEYPOT_FIELD}"]`)) return;
    const wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:absolute!important;left:-9999px!important;top:auto;width:1px;height:1px;overflow:hidden;';
    const input = document.createElement('input');
    input.type = 'text';
    input.name = HONEYPOT_FIELD;
    input.tabIndex = -1;
    input.autocomplete = 'off';
    wrap.appendChild(input);
    form.appendChild(wrap);
    form.dataset.renderedAt = String(Date.now());
  }

  function looksAutomated(form) {
    const hp = form.querySelector(`[name="${HONEYPOT_FIELD}"]`);
    if (hp && String(hp.value || '').trim()) return 'honeypot';
    const started = parseInt(form.dataset.renderedAt || '0', 10);
    if (started && Date.now() - started < MIN_FILL_MS) return 'too-fast';
    return null;
  }

  /* Collect every named field + dataset extras into a clean payload */
  function collect(form) {
    const fd = new FormData(form);
    const payload = { submitted_at: new Date().toISOString(), source: window.location.pathname };
    fd.forEach((v, k) => {
      if (k === HONEYPOT_FIELD) return; // never forward the trap field
      if (v && String(v).trim()) payload[k] = String(v).trim();
    });
    if (cfg.includeUTM) Object.assign(payload, window.PCC.util.getUTM());
    payload.lead_source_label = form.dataset.leadSource || payload.form_type || 'Website';
    return payload;
  }

  function markInvalid(field, yes) {
    if (!field) return;
    field.classList.toggle('invalid', !!yes);
  }

  function validate(form, requiredMap) {
    let ok = true;
    Object.keys(requiredMap).forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;
      const val = (input.value || '').trim();
      const rule = requiredMap[name];
      let bad = !val;
      if (val && rule === 'email' && !isEmail(val)) bad = true;
      if (val && rule === 'phone' && !isPhone(val)) bad = true;
      markInvalid(input.closest('.field'), bad);
      if (bad) ok = false;
    });
    return ok;
  }

  function validateChoices(form, names) {
    let ok = true;
    names.forEach(name => {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      const field = form.querySelector(`input[name="${name}"]`)?.closest('.field');
      const bad = !checked;
      if (field) field.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    return ok;
  }

  const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

  const FIELD_LABELS = {
    name: 'Name', phone: 'Phone', email: 'Email', message: 'Message',
    service_type: 'Service', service_type_label: 'Service', frequency: 'Frequency',
    property_type: 'Property', bedrooms: 'Bedrooms', bathrooms: 'Bathrooms',
    sqft: 'Approx. square feet', city: 'City', zip: 'ZIP', address: 'Address',
    preferred_date: 'Preferred date', preferred_time: 'Preferred time',
    booking_type: 'Booking type', notes: 'Notes', lead_source_label: 'Submitted from',
  };
  const SKIP_IN_EMAIL = ['submitted_at', 'source', 'landing_page', 'referrer'];

  /* Human-readable email body so a mailto fallback is actually usable */
  function composeEmail(payload) {
    const lines = [];
    Object.keys(FIELD_LABELS).forEach(k => {
      if (payload[k]) lines.push(`${FIELD_LABELS[k]}: ${payload[k]}`);
    });
    Object.keys(payload).forEach(k => {
      if (FIELD_LABELS[k] || SKIP_IN_EMAIL.includes(k) || k.startsWith('utm_')) return;
      if (payload[k]) lines.push(`${k}: ${payload[k]}`);
    });
    const utm = Object.keys(payload).filter(k => k.startsWith('utm_') && payload[k]);
    if (utm.length) lines.push('', '-- campaign --', ...utm.map(k => `${k}: ${payload[k]}`));
    lines.push('', `Submitted: ${new Date().toLocaleString()}`, `Page: ${payload.source || ''}`);
    return lines.join('\n');
  }

  function mailtoFallback(payload) {
    const to = cfg.notifyEmail || (window.PCC.business && window.PCC.business.email);
    if (!to) return false;
    const subject = `Website request — ${payload.lead_source_label || 'New lead'}${payload.name ? ' — ' + payload.name : ''}`;
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(composeEmail(payload))}`;
    try { window.location.href = url; return true; } catch (e) { return false; }
  }

  async function route(payload) {
    // Dev only: never simulate a successful send on the live site.
    if (cfg.demoMode && isLocalhost) {
      console.info('[PCC lead] demo mode (localhost) — payload:', payload);
      await new Promise(r => setTimeout(r, 400));
      return { ok: true, delivery: 'demo' };
    }

    if (cfg.endpoint) {
      try {
        const res = await fetch(cfg.endpoint, {
          method: cfg.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        let body = null;
        try { body = await res.json(); } catch (_) { /* non-JSON response */ }
        const ok = res.ok && (!body || body.ok !== false);
        if (ok) return { ok: true, delivery: 'endpoint', status: res.status, body };
        // Endpoint answered with an error — fall through to email rather than lose the lead
        console.warn('[PCC lead] endpoint rejected the lead', res.status, body);
      } catch (e) {
        console.warn('[PCC lead] routing error', e);
        // fall through to the email fallback rather than losing the lead
      }
    }

    // No endpoint (or it failed): hand the lead to the visitor's mail client
    // so it still reaches the business instead of being silently dropped.
    if (mailtoFallback(payload)) return { ok: true, delivery: 'email' };
    return { ok: false, delivery: 'none' };
  }

  /* Generic form binder */
  function bind(form, opts) {
    if (!form) return;
    opts = opts || {};
    const requiredMap = opts.required || {};
    const eventName = opts.event || ev.contactFormSubmit;

    installHoneypot(form);

    // form_start tracking — fire once on first interaction
    let started = false;
    const startTracker = () => {
      if (started) return;
      started = true;
      window.PCC.util.track(eventName.replace('_submit', '_start'), { form: form.id });
    };
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('focus', startTracker, { once: true });
      el.addEventListener('change', startTracker, { once: true });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Silently drop suspected bots: show the normal confirmation, deliver nothing.
      const automated = looksAutomated(form);
      if (automated) {
        console.info('[PCC lead] submission ignored (' + automated + ')');
        if (opts.onSuccess) { opts.onSuccess(collect(form), { ok: true, delivery: 'ignored' }); return; }
        form.reset();
        notice(form, opts.successMsg || "Thank you! We'll be in touch within one business hour.", 'success');
        return;
      }

      const choicesOk = opts.choices ? validateChoices(form, opts.choices) : true;
      const fieldsOk = validate(form, requiredMap);
      if (!choicesOk || !fieldsOk) {
        notice(form, 'Please complete the highlighted fields and try again.', 'error');
        return;
      }
      const payload = collect(form);
      // Let callers add derived fields (e.g. funnel labels) before the lead is sent
      if (opts.enrich) { try { opts.enrich(payload); } catch (_) { /* non-fatal */ } }
      const btn = form.querySelector('[type="submit"]');
      const orig = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      const result = await route(payload);

      // Fire conversion event(s)
      window.PCC.util.track(eventName, { form_id: form.id, lead_type: payload.form_type || 'general' });
      window.PCC.util.track(ev.lead, { lead_type: payload.form_type || 'general', event: eventName });

      if (btn) { btn.disabled = false; btn.textContent = orig; }

      const phone = (window.PCC.business && window.PCC.business.phone) || '';

      if (result.ok) {
        if (opts.onSuccess) { opts.onSuccess(payload, result); return; }
        if (result.delivery === 'email') {
          // Mail client is opening — the request is not sent until they hit Send.
          notice(form, `Your email app is opening with your request — press Send and we'll reply within one business hour.${phone ? ' Prefer to call? ' + phone : ''}`, 'info');
          return;
        }
        form.reset();
        notice(form, opts.successMsg || "Thank you! We'll be in touch within one business hour.", 'success');
        if (opts.successRedirect) setTimeout(() => { window.location.href = opts.successRedirect; }, 1200);
      } else {
        notice(form, `We couldn't send your request automatically. Please call us at ${phone || 'the number above'} or email us directly — we're happy to help.`, 'error');
      }
    });
  }

  /* Expose for page scripts */
  window.PCC.forms = { bind, validate, collect, route, notice };

  /* ---------- Auto-bind known forms by id ---------- */
  function autobind() {
    const contact = document.getElementById('contactForm');
    if (contact && !contact.dataset.bound) {
      contact.dataset.bound = '1';
      bind(contact, {
        required: { name: 'text', phone: 'phone', email: 'email', message: 'text' },
        event: ev.contactFormSubmit,
        successMsg: "Thank you! We'll reply within one business hour.",
      });
    }
    const booking = document.getElementById('bookingForm');
    if (booking && !booking.dataset.bound) {
      booking.dataset.bound = '1';
      bind(booking, {
        required: { name: 'text', phone: 'phone', email: 'email', zip: 'text', preferred_date: 'text', preferred_time: 'text' },
        choices: ['booking_type'],
        event: ev.bookingFormSubmit,
        successMsg: "Booking request received! We'll confirm your date and time within one business hour.",
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autobind);
  else autobind();
})();
