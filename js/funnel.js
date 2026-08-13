/* NataBel four-step instant-estimate controller. */
(function () {
  'use strict';
  if (!window.PCC || !window.PCC.forms) return;
  const card = document.querySelector('[data-funnel]');
  if (!card) return;

  const form = card.querySelector('form');
  const steps = Array.from(card.querySelectorAll('.quote-step'));
  const status = card.querySelector('[data-quote-status]');
  const progress = card.querySelector('.quote-progress-track span');
  const stepLabel = card.querySelector('[data-step-label]');
  const stepCount = card.querySelector('[data-step-count]');
  const labels = ['Your space', 'Cleaning need', 'Property details', 'Contact'];
  let index = 0;

  function audience() {
    return form.querySelector('[name="audience"]:checked')?.value || '';
  }

  function setBranch() {
    const commercial = audience() === 'commercial';
    card.querySelectorAll('[data-residential]').forEach(el => { el.hidden = commercial; });
    card.querySelectorAll('[data-commercial]').forEach(el => { el.hidden = !commercial; });
    const heading = card.querySelector('[data-contact-heading]');
    const copy = card.querySelector('[data-contact-copy]');
    const submit = card.querySelector('[data-submit-label]');
    if (commercial) {
      heading.textContent = 'Who should we contact about the walkthrough?';
      copy.textContent = 'NataBel will use these details only to discuss your facility and schedule the next step.';
      submit.textContent = 'Request My Walkthrough';
    } else {
      heading.textContent = 'Where can NataBel follow up?';
      copy.textContent = 'Enter your contact details to see the right next step and share the same information with NataBel.';
      submit.textContent = 'Show My Next Step';
    }
  }

  function show(next, focus) {
    index = Math.max(0, Math.min(next, steps.length - 1));
    steps.forEach((step, i) => step.classList.toggle('active', i === index));
    progress.style.width = `${((index + 1) / steps.length) * 100}%`;
    stepLabel.textContent = `Step ${index + 1} · ${labels[index]}`;
    stepCount.textContent = `${index + 1} of ${steps.length}`;
    setBranch();
    if (focus) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      steps[index].querySelector('h2')?.setAttribute('tabindex', '-1');
      steps[index].querySelector('h2')?.focus({ preventScroll: true });
    }
  }

  function markField(name, invalid) {
    const field = form.querySelector(`[name="${name}"]`)?.closest('.quote-field');
    if (field) field.classList.toggle('invalid', invalid);
    return !invalid;
  }

  function hasValue(name) {
    return !!String(form.querySelector(`[name="${name}"]`)?.value || '').trim();
  }

  function validateCurrent() {
    const step = steps[index];
    const error = step.querySelector('[data-step-error]');
    if (error) error.classList.remove('active');

    if (index === 0) {
      const ok = !!audience();
      if (!ok && error) error.classList.add('active');
      return ok;
    }
    if (index === 1) {
      const name = audience() === 'commercial' ? 'facility_type' : 'service_type';
      const ok = !!form.querySelector(`[name="${name}"]:checked`);
      if (!ok && error) error.classList.add('active');
      return ok;
    }
    if (index === 2) {
      const names = audience() === 'commercial'
        ? ['commercial_sqft', 'restrooms', 'commercial_frequency', 'cleaning_time', 'commercial_zip']
        : ['property_type', 'square_footage', 'bedrooms', 'bathrooms', 'frequency', 'condition', 'zip'];
      return names.map(name => {
        let invalid = !hasValue(name);
        if (/zip/.test(name) && hasValue(name)) invalid = !/^\d{5}$/.test(form.querySelector(`[name="${name}"]`).value.trim());
        return markField(name, invalid);
      }).every(Boolean);
    }
    if (index === 3) {
      const email = String(form.elements.email.value || '').trim();
      const phone = String(form.elements.phone.value || '').trim();
      const checks = [
        markField('name', !hasValue('name')),
        markField('phone', !/[0-9()+\-\s]{10,}/.test(phone)),
        markField('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
        markField('city', !hasValue('city')),
        !!form.elements.contact_consent.checked
      ];
      const consent = form.elements.contact_consent.closest('.quote-consent');
      consent.style.color = checks[4] ? '' : '#a73529';
      return checks.every(Boolean);
    }
    return true;
  }

  card.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
    if (!validateCurrent()) return;
    show(index + 1, true);
  }));
  card.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => show(index - 1, true)));
  form.querySelectorAll('[name="audience"]').forEach(input => input.addEventListener('change', setBranch));

  function payload() {
    const data = { submitted_at: new Date().toISOString(), source: location.pathname, lead_source_label: form.dataset.leadSource || 'Instant Estimate' };
    new FormData(form).forEach((value, key) => {
      if (key !== 'website_url' && String(value).trim()) data[key] = String(value).trim();
    });
    Object.assign(data, window.PCC.util.getUTM());
    data.quote_type = audience();
    return data;
  }

  function deliveryMessage(result) {
    if (result?.customerEmail && result?.internalEmail) return 'The estimate was emailed to you and NataBel received the request.';
    if (result?.delivery === 'endpoint') return 'Your request reached NataBel. A team member will follow up to confirm details.';
    if (result?.delivery === 'email') return 'Your email app is opening with the details filled in. Press Send so NataBel receives the request.';
    return 'Automatic delivery is not connected. Please call or email NataBel using the options below.';
  }

  function renderResult(type, data) {
    steps.forEach(step => step.classList.remove('active'));
    form.hidden = true;
    card.querySelector('.quote-progress').hidden = true;
    status.classList.add('active');
    const title = status.querySelector('[data-status-title]');
    const range = status.querySelector('[data-status-range]');
    const copy = status.querySelector('[data-status-copy]');
    const note = status.querySelector('[data-status-note]');

    if (type === 'estimated') {
      title.textContent = 'Your instant estimate';
      range.hidden = false;
      range.textContent = `$${data.quote.low.toLocaleString()}–$${data.quote.high.toLocaleString()}`;
      copy.textContent = `Estimated ${data.quote.cadenceLabel}. ${deliveryMessage(data.fallbackDelivery || data.delivery)}`;
      note.textContent = 'This is a planning range, not a final price. Fatima confirms scope, condition, add-ons, and availability before service.';
      window.PCC.util.track(window.PCC.events.quoteRevealed || 'quote_revealed', { service: form.elements.service_type?.value || '' });
    } else if (type === 'commercial') {
      title.textContent = 'Your walkthrough request is ready';
      range.hidden = true;
      copy.textContent = deliveryMessage(data.delivery);
      note.textContent = 'Commercial pricing is walkthrough-based so the scope reflects the real facility, schedule, and access requirements.';
      window.PCC.util.track(window.PCC.events.commercialWalkthrough || 'commercial_walkthrough_request', { facility: form.elements.facility_type?.value || '' });
    } else {
      title.textContent = 'Your details are ready for NataBel';
      range.hidden = true;
      copy.textContent = deliveryMessage(data.delivery);
      note.textContent = 'The real NataBel rate sheet is not connected to this preview yet, so the site will not invent a price. Fatima can provide a manual estimate from the details you entered.';
    }
    status.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.lucide) window.lucide.createIcons();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!validateCurrent()) return;
    const submit = form.querySelector('[type="submit"]');
    const error = form.querySelector('[data-submit-error]');
    const original = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = audience() === 'commercial' ? 'Preparing request…' : 'Calculating…';
    error.classList.remove('active');
    const data = payload();
    window.PCC.util.track(window.PCC.events.quoteContactSubmitted || 'quote_contact_submitted', { quote_type: audience() });

    try {
      if (audience() === 'commercial') {
        const delivery = await window.PCC.forms.route(data);
        renderResult('commercial', { delivery });
        return;
      }

      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      let body = {};
      try { body = await response.json(); } catch (_) { /* handled below */ }

      if (response.ok && body.ok && body.status === 'estimated') {
        if (!body.delivery?.customerEmail || !body.delivery?.internalEmail) {
          data.estimate_range = `$${body.quote.low}–$${body.quote.high}`;
          body.fallbackDelivery = await window.PCC.forms.route(data);
        }
        renderResult('estimated', body);
        return;
      }

      if (body.error === 'pricing_not_configured' || body.status === 'manual_review_required') {
        const delivery = await window.PCC.forms.route(data);
        renderResult('manual', { delivery });
        return;
      }

      throw new Error(body.error || `quote_${response.status}`);
    } catch (requestError) {
      console.warn('[quote] request failed', requestError);
      error.textContent = `We could not prepare the estimate automatically. Call ${window.PCC.business.phone} or email ${window.PCC.business.email}.`;
      error.classList.add('active');
      window.PCC.util.track(window.PCC.events.quoteDeliveryFailed || 'quote_delivery_failed', { reason: String(requestError.message || requestError) });
    } finally {
      submit.disabled = false;
      submit.innerHTML = original;
      if (window.lucide) window.lucide.createIcons();
    }
  });

  const service = new URLSearchParams(location.search).get('service');
  if (service) {
    const isCommercial = /commercial|property/.test(service);
    const audienceInput = form.querySelector(`[name="audience"][value="${isCommercial ? 'commercial' : 'residential'}"]`);
    if (audienceInput) audienceInput.checked = true;
    const serviceMap = { residential: 'standard', deep: 'deep', deep_cleaning: 'deep', move: 'move', move_in_out: 'move', recurring: 'standard' };
    if (!isCommercial && serviceMap[service]) {
      const input = form.querySelector(`[name="service_type"][value="${serviceMap[service]}"]`);
      if (input) input.checked = true;
    }
    setBranch();
  }

  window.PCC.util.track(window.PCC.events.quoteStarted || 'quote_started', { source: location.pathname });
  show(0, false);
})();
