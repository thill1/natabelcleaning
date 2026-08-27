/* NataBel residential Instant Estimate controller. */
(function () {
  'use strict';
  if (!window.PCC || !window.PCC.forms) return;
  const card = document.querySelector('[data-funnel]');
  if (!card) return;

  const form = card.querySelector('form');
  const serviceArea = window.NataBelServiceArea;
  const requestedService = new URLSearchParams(location.search).get('service');
  const allowedRoutes = ['residential', 'recurring', 'standard', 'deep', 'deep-cleaning', 'move', 'move-in', 'move-out'];
  if (requestedService && !allowedRoutes.includes(requestedService)) {
    const target = new URL('contact.html', location.href);
    target.searchParams.set('service', requestedService);
    target.searchParams.set('source', 'instant-quote');
    location.replace(target.toString());
    return;
  }

  const steps = Array.from(card.querySelectorAll('.quote-step'));
  const status = card.querySelector('[data-quote-status]');
  const progress = card.querySelector('.quote-progress-track span');
  const stepLabel = card.querySelector('[data-step-label]');
  const stepCount = card.querySelector('[data-step-count]');
  const progressEstimate = card.querySelector('[data-progress-estimate]');
  const labels = ['Cleaning type', 'Home size', 'Your details', 'Review'];
  const serviceLabels = { standard: 'Standard Recurring Cleaning', deep: 'Deep Cleaning', move: 'Move-In / Move-Out Cleaning' };
  const frequencyLabels = { weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Every 4 weeks', one_time: 'One-time' };
  const petLabels = { none: 'No pets', dog: 'Dog', cat: 'Cat', multiple: 'Multiple pets', other: 'Other' };
  const addOnLabels = {
    inside_refrigerator: 'Inside refrigerator', inside_oven: 'Inside oven', wall_washing: 'Wall washing',
    carpet_cleaning: 'Carpet cleaning', exterior_windows: 'Exterior windows', garage_or_hauling: 'Garage or hauling'
  };
  let index = 0;
  let submitting = false;
  let estimateAmount = null;
  let estimateKey = '';
  let estimateRequest = 0;
  let lockedService = '';
  let lockedSquareFootage = null;

  function field(name) { return form.querySelector(`[name="${name}"]`); }
  function value(name) { return String(field(name)?.value || '').trim(); }
  function selected(name) { return form.querySelector(`[name="${name}"]:checked`)?.value || ''; }
  function enteredService() { return selected('service_type'); }
  function currentService() { return lockedService || enteredService(); }
  function currentSquareFootage() { return lockedSquareFootage ?? Number(value('square_footage')); }
  function isOneTime() { return ['deep', 'move'].includes(currentService()); }
  function currentFrequency() { return isOneTime() ? 'one_time' : value('frequency'); }
  function selectedExtras() { return Array.from(form.querySelectorAll('[name="requested_add_ons"]:checked')).map(input => input.value); }

  function makeSubmissionId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `q-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function localDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  function initializeSubmission() {
    field('submission_id').value = makeSubmissionId();
    field('form_started_at').value = String(Date.now());
    field('requested_date').min = localDate();
  }

  initializeSubmission();

  function markField(name, invalid) {
    const wrapper = field(name)?.closest('.quote-field');
    if (wrapper) wrapper.classList.toggle('invalid', invalid);
    return !invalid;
  }

  function setFieldError(name, message) {
    const error = field(name)?.closest('.quote-field')?.querySelector('.quote-error');
    if (error) error.textContent = message;
  }

  function currentEstimateKey() {
    const sqft = currentSquareFootage();
    const service = currentService();
    return service && Number.isFinite(sqft) && sqft > 0 ? `${service}:${sqft}` : '';
  }

  function calculatedAmount() {
    return estimateKey === currentEstimateKey() && Number.isFinite(estimateAmount) ? estimateAmount : null;
  }

  function cadenceText() {
    return isOneTime() ? `${serviceLabels[currentService()]} · one-time estimate` : 'Standard Recurring Cleaning · per-visit estimate';
  }

  function paintEstimate() {
    const amount = calculatedAmount();
    card.querySelectorAll('[data-live-estimate]').forEach(panel => {
      const price = panel.querySelector('[data-live-price]');
      const cadence = panel.querySelector('[data-live-cadence]');
      if (!price || !cadence) return;
      price.textContent = Number.isFinite(amount) ? `$${amount.toLocaleString()}` : 'Preparing…';
      cadence.textContent = Number.isFinite(amount) ? cadenceText() : 'Your estimate is being prepared.';
    });
    updateProgress();
    if (index === 3) renderReview();
  }

  async function lockAndCalculateEstimate() {
    const service = enteredService();
    const squareFootage = Number(value('square_footage'));
    const key = `${service}:${squareFootage}`;
    const requestId = ++estimateRequest;
    lockedService = service;
    lockedSquareFootage = squareFootage;
    field('square_footage').readOnly = true;
    form.querySelectorAll('[name="service_type"]').forEach(input => { input.disabled = true; });
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preview: true,
          service_type: service,
          frequency: ['deep', 'move'].includes(service) ? 'one_time' : 'monthly',
          square_footage: squareFootage,
          condition: 'average'
        })
      });
      const body = await response.json().catch(() => ({}));
      if (requestId !== estimateRequest || key !== currentEstimateKey()) return false;
      if (!response.ok || !body.ok || body.status !== 'estimated' || !Number.isFinite(Number(body.quote?.amount))) {
        throw new Error(body.error || `quote_preview_${response.status}`);
      }
      estimateKey = key;
      estimateAmount = Number(body.quote.amount);
      paintEstimate();
      return true;
    } catch (error) {
      if (requestId !== estimateRequest) return false;
      estimateKey = '';
      estimateAmount = null;
      lockedService = '';
      lockedSquareFootage = null;
      field('square_footage').readOnly = false;
      form.querySelectorAll('[name="service_type"]').forEach(input => { input.disabled = false; });
      console.error('[quote] preview failed', { error: String(error.message || error) });
      return false;
    }
  }

  function syncServiceView() {
    const frequency = field('frequency');
    const wrapper = card.querySelector('[data-frequency-field]');
    if (!frequency || !wrapper) return;
    if (isOneTime()) {
      frequency.value = 'one_time';
      wrapper.hidden = true;
    } else {
      if (frequency.value === 'one_time') frequency.value = '';
      wrapper.hidden = false;
    }
  }

  function updateProgress() {
    progress.style.width = `${((index + 1) / steps.length) * 100}%`;
    stepLabel.textContent = `Step ${index + 1} · ${labels[index]}`;
    stepCount.textContent = `${index + 1} of ${steps.length}`;
    const amount = calculatedAmount();
    if (progressEstimate) progressEstimate.textContent = index > 1 && Number.isFinite(amount) ? `$${amount.toLocaleString()} estimate` : 'About 2 minutes';
  }

  function show(next, focus) {
    index = Math.max(0, Math.min(next, steps.length - 1));
    steps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
    syncServiceView();
    updateProgress();
    if (index >= 2) paintEstimate();
    if (index === 3) renderReview();
    if (focus) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const heading = steps[index].querySelector('h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function validateZip() {
    const zip = value('zip');
    if (!/^\d{5}$/.test(zip)) {
      setFieldError('zip', 'Enter a five-digit ZIP code.');
      return markField('zip', true);
    }
    if (!serviceArea || !serviceArea.isEligibleZip(zip)) {
      setFieldError('zip', 'This ZIP is outside NataBel’s current Sacramento-area service zone. Call (916) 899-8811 to ask about coverage.');
      return markField('zip', true);
    }
    return markField('zip', false);
  }

  function validateCurrent() {
    const stepError = steps[index].querySelector('[data-step-error]');
    stepError?.classList.remove('active');

    if (index === 0) {
      const ok = !!currentService();
      if (!ok) stepError?.classList.add('active');
      return ok;
    }
    if (index === 1) {
      const sqft = Number(value('square_footage'));
      const ok = markField('square_footage', !Number.isFinite(sqft) || sqft <= 0);
      if (!ok) stepError?.classList.add('active');
      return ok;
    }
    if (index === 2) {
      const checks = [
        markField('name', !value('name')),
        markField('phone', !/[0-9()+\-\s]{10,}/.test(value('phone'))),
        markField('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))),
        markField('property_type', !value('property_type')),
        markField('service_address', !value('service_address')),
        markField('city', !value('city')),
        validateZip(),
        markField('bedrooms', !value('bedrooms')),
        markField('bathrooms', !value('bathrooms')),
        markField('frequency', !currentFrequency()),
        markField('pets', !value('pets')),
        markField('requested_date', !value('requested_date')),
        form.elements.contact_consent.checked
      ];
      const consent = form.elements.contact_consent.closest('.quote-consent');
      consent.style.color = checks[12] ? '' : '#a73529';
      const ok = checks.every(Boolean);
      if (!ok) stepError?.classList.add('active');
      return ok;
    }
    return true;
  }

  function renderReview() {
    const amount = calculatedAmount();
    const extras = selectedExtras();
    const property = ({ house: 'House', apartment: 'Apartment', condo: 'Condo', townhome: 'Townhome' })[value('property_type')] || 'Home';
    card.querySelector('[data-review-home]').textContent = `${Number(currentSquareFootage()).toLocaleString()} sq ft · ${value('bedrooms')} bed · ${value('bathrooms')} bath · ${property}`;
    card.querySelector('[data-review-address]').textContent = `${value('service_address')}, ${value('city')} ${value('zip')}`;
    card.querySelector('[data-review-price]').textContent = Number.isFinite(amount) ? `$${amount.toLocaleString()}` : '—';
    card.querySelector('[data-review-cadence]').textContent = isOneTime() ? 'one-time estimate' : 'per-visit estimate';
    card.querySelector('[data-review-service]').textContent = serviceLabels[currentService()] || 'Cleaning';
    card.querySelector('[data-review-frequency]').textContent = frequencyLabels[currentFrequency()] || '—';
    card.querySelector('[data-review-date]').textContent = value('requested_date') || '—';
    card.querySelector('[data-review-pets]').textContent = petLabels[value('pets')] || value('pets') || '—';
    card.querySelector('[data-review-extras]').textContent = extras.length ? extras.map(item => addOnLabels[item] || item).join(', ') : 'None selected';
  }

  card.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', async () => {
    if (!validateCurrent()) return;
    if (index !== 1) {
      show(index + 1, true);
      return;
    }
    const original = button.innerHTML;
    const stepError = steps[index].querySelector('[data-step-error]');
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Preparing your estimate…';
    const ready = await lockAndCalculateEstimate();
    button.disabled = false;
    button.removeAttribute('aria-disabled');
    button.innerHTML = original;
    if (ready) {
      show(index + 1, true);
    } else {
      if (stepError) stepError.textContent = 'We could not prepare your estimate. Check your connection and try again.';
      stepError?.classList.add('active');
      field('square_footage').focus();
    }
    if (window.lucide) window.lucide.createIcons();
  }));
  card.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => show(index - 1, true)));
  form.querySelectorAll('[name="service_type"]').forEach(input => input.addEventListener('change', syncServiceView));
  field('square_footage').addEventListener('input', () => {
    markField('square_footage', false);
    const stepError = steps[1].querySelector('[data-step-error]');
    if (stepError) stepError.textContent = 'Please enter a valid home size.';
  });
  field('zip').addEventListener('input', () => {
    markField('zip', false);
    setFieldError('zip', 'Enter a five-digit ZIP code.');
  });

  card.querySelectorAll('[data-restart]').forEach(button => button.addEventListener('click', () => {
    estimateRequest += 1;
    estimateAmount = null;
    estimateKey = '';
    lockedService = '';
    lockedSquareFootage = null;
    form.reset();
    field('square_footage').readOnly = false;
    form.querySelectorAll('[name="service_type"]').forEach(input => { input.disabled = false; });
    initializeSubmission();
    show(0, true);
  }));

  function payload() {
    const data = { source: `${location.pathname}${location.search}`, quote_type: 'residential' };
    const extras = [];
    new FormData(form).forEach((entryValue, key) => {
      if (!String(entryValue).trim()) return;
      if (key === 'requested_add_ons') extras.push(String(entryValue));
      else data[key] = String(entryValue).trim();
    });
    data.service_type = currentService();
    data.frequency = currentFrequency();
    data.square_footage = currentSquareFootage();
    if (extras.length) data.requested_add_ons = extras;
    Object.assign(data, window.PCC.util.getUTM());
    return data;
  }

  function renderConfirmation(data, submitted) {
    steps.forEach(step => step.classList.remove('active'));
    form.hidden = true;
    card.querySelector('.quote-progress').hidden = true;
    status.classList.add('active');
    const amount = Number(data.quote?.amount);
    status.querySelector('[data-status-title]').textContent = `${serviceLabels[submitted.service_type]} request received.`;
    status.querySelector('[data-status-price]').textContent = `$${amount.toLocaleString()}`;
    status.querySelector('[data-status-cadence]').textContent = submitted.frequency === 'one_time' ? 'one-time Instant Estimate' : 'per-visit Instant Estimate';
    status.querySelector('[data-status-copy]').textContent = data.notificationPending
      ? 'Your complete request is safely saved. The business email notification was delayed, and the failure was logged for follow-up.'
      : data.delivery?.customerEmail
        ? 'Your complete request is saved, NataBel has been notified, and a copy of the estimate was emailed to you.'
        : 'Your complete request is saved and NataBel has been notified. Keep this estimate on screen for your records.';
    status.focus({ preventScroll: true });
    status.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.PCC.util.track(window.PCC.events.quoteRevealed || 'quote_revealed', { service_type: submitted.service_type, frequency: submitted.frequency, amount });
    if (window.lucide) window.lucide.createIcons();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || index !== 3 || !validateCurrent()) return;
    submitting = true;
    const submit = form.querySelector('[type="submit"]');
    const error = form.querySelector('[data-submit-error]');
    const original = submit.innerHTML;
    submit.disabled = true;
    submit.setAttribute('aria-disabled', 'true');
    submit.textContent = 'Saving your request…';
    error.classList.remove('active');
    const data = payload();
    window.PCC.util.track(window.PCC.events.quoteContactSubmitted || 'quote_contact_submitted', { quote_type: 'residential', service_type: data.service_type, frequency: data.frequency });

    try {
      const response = await fetch('/api/quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.ok && body.status === 'estimated' && body.saved) {
        renderConfirmation(body, data);
        return;
      }
      if (body.status === 'service_area_unavailable') {
        show(2, true);
        setFieldError('zip', 'This ZIP is outside NataBel’s current Sacramento-area service zone. Call (916) 899-8811 to ask about coverage.');
        markField('zip', true);
        field('zip').focus();
        return;
      }
      throw new Error(body.error || `quote_${response.status}`);
    } catch (requestError) {
      console.error('[quote] save failed', { submissionId: value('submission_id'), error: String(requestError.message || requestError) });
      error.textContent = `We could not save the request yet. Your details remain here so you can try again. You can also call ${window.PCC.business.phone}.`;
      error.classList.add('active');
      error.focus?.();
      window.PCC.util.track(window.PCC.events.quoteDeliveryFailed || 'quote_delivery_failed', { reason: String(requestError.message || requestError) });
    } finally {
      if (!form.hidden) {
        submitting = false;
        submit.disabled = false;
        submit.removeAttribute('aria-disabled');
        submit.innerHTML = original;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  });

  if (['move', 'move-in', 'move-out'].includes(requestedService)) form.querySelector('[name="service_type"][value="move"]').checked = true;
  if (['deep', 'deep-cleaning'].includes(requestedService)) form.querySelector('[name="service_type"][value="deep"]').checked = true;
  if (['residential', 'recurring', 'standard'].includes(requestedService)) form.querySelector('[name="service_type"][value="standard"]').checked = true;
  window.PCC.util.track(window.PCC.events.quoteStarted || 'quote_started', { source: location.pathname, experience: 'residential-v5' });
  show(0, false);
})();
