/* =========================================================================
   PATALANO CLEANING CO. — Lead capture & routing
   Single handler for all forms: validates → tracks → routes → confirms.
   Routes to: Jobber / Housecall Pro / GoHighLevel / webhook / Google Sheet.
   See config.js `PCC.leads` to configure the endpoint.
   ========================================================================= */
(function () {
  'use strict';
  if (!window.PCC) return;
  const cfg = window.PCC.leads;
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

  /* Collect every named field + dataset extras into a clean payload */
  function collect(form) {
    const fd = new FormData(form);
    const payload = { submitted_at: new Date().toISOString(), source: window.location.pathname };
    fd.forEach((v, k) => { if (v && String(v).trim()) payload[k] = String(v).trim(); });
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
    const firstInvalid = null;
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

  async function route(payload) {
    if (cfg.demoMode || !cfg.endpoint) {
      // Simulate latency, then succeed
      console.info('[PCC lead] demo mode — payload:', payload);
      await new Promise(r => setTimeout(r, 700));
      return { ok: true, demo: true };
    }
    try {
      const res = await fetch(cfg.endpoint, {
        method: cfg.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { ok: res.ok, status: res.status };
    } catch (e) {
      console.warn('[PCC lead] routing error', e);
      return { ok: false, error: e };
    }
  }

  /* Generic form binder */
  function bind(form, opts) {
    if (!form) return;
    opts = opts || {};
    const requiredMap = opts.required || {};
    const eventName = opts.event || ev.contactFormSubmit;

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
      if (!validate(form, requiredMap)) {
        notice(form, 'Please complete the highlighted fields and try again.', 'error');
        return;
      }
      const payload = collect(form);
      const btn = form.querySelector('[type="submit"]');
      const orig = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      const result = await route(payload);

      // Fire conversion event(s)
      window.PCC.util.track(eventName, { form_id: form.id, lead_type: payload.form_type || 'general' });
      window.PCC.util.track(ev.lead, { lead_type: payload.form_type || 'general', event: eventName });

      if (btn) { btn.disabled = false; btn.textContent = orig; }

      if (result.ok) {
        if (opts.onSuccess) { opts.onSuccess(payload); return; }
        form.reset();
        notice(form, opts.successMsg || "Thank you! We'll be in touch within one business hour.", 'success');
        if (opts.successRedirect) setTimeout(() => { window.location.href = opts.successRedirect; }, 1200);
      } else {
        notice(form, 'Something went wrong sending your request. Please call us — we\'re happy to help.', 'error');
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
        event: ev.bookingFormSubmit,
        successMsg: "Booking request received! We'll confirm your date and time within one business hour.",
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autobind);
  else autobind();
})();
