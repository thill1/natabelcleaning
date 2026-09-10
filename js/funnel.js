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
  const labels = ['Cleaning type', 'Home size', 'Your estimate', 'Your details', 'Review'];
  const serviceLabels = { standard: 'Standard Recurring Cleaning', deep: 'Deep Cleaning', move: 'Move-In / Move-Out Cleaning' };
  const frequencyLabels = { weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Every 4 weeks', one_time: 'One-time' };
  const petLabels = { none: 'No pets', dog: 'Dog', cat: 'Cat', multiple: 'Multiple pets', other: 'Other' };
  const addOnLabels = {
    inside_refrigerator: 'Inside refrigerator', inside_oven: 'Inside oven', wall_washing: 'Wall washing',
    carpet_cleaning: 'Carpet cleaning', exterior_windows: 'Exterior windows', garage_or_hauling: 'Garage or hauling'
  };
  let index = 0;
  let submitting = false;
  let estimateLoading = false;
  let lockedEstimate = null;
  let homeDetailsTracked = false;
  let contactStartedTracked = false;
  let priceViewedTracked = false;
  const estimateLockKey = 'natabel.quote.lock.v1';
  const estimateLockMaxAge = 30 * 60 * 1000;

  function field(name) { return form.querySelector(`[name="${name}"]`); }
  function value(name) { return String(field(name)?.value || '').trim(); }
  function selected(name) { return form.querySelector(`[name="${name}"]:checked`)?.value || ''; }
  function currentService() { return lockedEstimate?.service_type || selected('service_type'); }
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

  function readEstimateLock() {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(estimateLockKey) || 'null');
      const valid = saved && /^[A-Za-z0-9._:-]{8,127}$/.test(String(saved.submission_id || ''))
        && ['standard', 'deep', 'move'].includes(saved.service_type)
        && Number.isFinite(Number(saved.square_footage)) && Number(saved.square_footage) > 0
        && Number.isFinite(Number(saved.amount)) && Number(saved.amount) >= 0
        && Date.now() - Number(saved.locked_at) < estimateLockMaxAge;
      if (valid) return {
        submission_id: String(saved.submission_id),
        service_type: saved.service_type,
        square_footage: Number(saved.square_footage),
        amount: Number(saved.amount),
        locked_at: Number(saved.locked_at),
        price_viewed: saved.price_viewed === true
      };
      window.sessionStorage.removeItem(estimateLockKey);
    } catch (_) { /* private mode */ }
    return null;
  }

  function saveEstimateLock(lock) {
    try { window.sessionStorage.setItem(estimateLockKey, JSON.stringify(lock)); } catch (_) { /* private mode */ }
  }

  lockedEstimate = readEstimateLock();
  field('submission_id').value = lockedEstimate?.submission_id || makeSubmissionId();
  field('form_started_at').value = String(Date.now());
  field('requested_date').min = localDate();

  function markField(name, invalid) {
    const wrapper = field(name)?.closest('.quote-field');
    if (wrapper) wrapper.classList.toggle('invalid', invalid);
    return !invalid;
  }

  function setFieldError(name, message) {
    const error = field(name)?.closest('.quote-field')?.querySelector('.quote-error');
    if (error) error.textContent = message;
  }

  function calculatedAmount() {
    return Number.isFinite(lockedEstimate?.amount) ? lockedEstimate.amount : null;
  }

  function cadenceText() {
    return isOneTime() ? `${serviceLabels[currentService()]} · one-time base estimate` : 'Standard Recurring Cleaning · per-visit base estimate';
  }

  function paintEstimate(message) {
    const amount = calculatedAmount();
    card.querySelectorAll('[data-live-estimate]').forEach(panel => {
      const price = panel.querySelector('[data-live-price]');
      const cadence = panel.querySelector('[data-live-cadence]');
      if (!price || !cadence) return;
      price.textContent = Number.isFinite(amount) ? `$${amount.toLocaleString()}` : message;
      cadence.textContent = Number.isFinite(amount) ? cadenceText() : 'Choose a cleaning type and enter a positive home size.';
    });
    updateProgress();
    if (index === 4) renderReview();
    if (index === 2 && Number.isFinite(amount) && !priceViewedTracked) {
      priceViewedTracked = true;
      lockedEstimate.price_viewed = true;
      saveEstimateLock(lockedEstimate);
      window.PCC.util.track(window.PCC.events.quotePriceViewed, {
        quote_type: 'residential', service_type: currentService(), frequency: currentFrequency(),
        square_footage: lockedEstimate.square_footage, amount,
      });
    }
  }

  async function lockEstimate() {
    if (estimateLoading || lockedEstimate || !validateCurrent()) return;
    const button = card.querySelector('[data-lock-estimate]');
    const error = card.querySelector('[data-estimate-error]');
    const serviceType = selected('service_type');
    const squareFootage = Number(value('square_footage'));
    const original = button.innerHTML;
    estimateLoading = true;
    button.disabled = true;
    button.textContent = 'Calculating…';
    error.classList.remove('active');
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preview: true,
          service_type: serviceType,
          frequency: ['deep', 'move'].includes(serviceType) ? 'one_time' : 'monthly',
          square_footage: squareFootage,
          condition: 'average'
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok || body.status !== 'estimated' || !Number.isFinite(Number(body.quote?.amount))) {
        throw new Error(body.error || `quote_preview_${response.status}`);
      }
      lockedEstimate = {
        submission_id: value('submission_id'),
        service_type: serviceType,
        square_footage: squareFootage,
        amount: Number(body.quote.amount),
        locked_at: Date.now(),
        price_viewed: false
      };
      saveEstimateLock(lockedEstimate);
      form.querySelectorAll('[name="service_type"]').forEach(input => { input.disabled = true; });
      field('square_footage').readOnly = true;
      if (!homeDetailsTracked) {
        homeDetailsTracked = true;
        window.PCC.util.track(window.PCC.events.quoteHomeDetailsCompleted, {
          quote_type: 'residential', service_type: serviceType, square_footage: squareFootage,
        });
      }
      show(2, true);
    } catch (requestError) {
      console.error('[quote] preview failed', { error: String(requestError.message || requestError) });
      error.textContent = 'We could not calculate the estimate yet. Your home size is unchanged, so please try again.';
      error.classList.add('active');
      error.focus?.();
    } finally {
      estimateLoading = false;
      if (!lockedEstimate) {
        button.disabled = false;
        button.innerHTML = original;
        if (window.lucide) window.lucide.createIcons();
      }
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
    if (progressEstimate) progressEstimate.textContent = index > 1 && Number.isFinite(amount) ? `$${amount.toLocaleString()} locked estimate` : 'About 2 minutes';
  }

  function show(next, focus) {
    const previous = index;
    const guardedNext = lockedEstimate && next < 2 ? 2 : next;
    index = Math.max(0, Math.min(guardedNext, steps.length - 1));
    steps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
    syncServiceView();
    updateProgress();
    if (index === 2 && lockedEstimate) {
      card.querySelector('[data-locked-summary]').textContent = `${serviceLabels[currentService()]} · ${lockedEstimate.square_footage.toLocaleString()} sq ft. This estimate will not recalculate.`;
      paintEstimate('Estimate unavailable');
    }
    if (index === 4) renderReview();
    if (index === 3 && previous < 3) {
      if (!contactStartedTracked) {
        contactStartedTracked = true;
        window.PCC.util.track(window.PCC.events.quoteContactStarted, {
          quote_type: 'residential', service_type: currentService(), frequency: currentFrequency(),
        });
      }
    }
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
    if (index === 3) {
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
    card.querySelector('[data-review-home]').textContent = `${lockedEstimate.square_footage.toLocaleString()} sq ft · ${value('bedrooms')} bed · ${value('bathrooms')} bath · ${property}`;
    card.querySelector('[data-review-address]').textContent = `${value('service_address')}, ${value('city')} ${value('zip')}`;
    card.querySelector('[data-review-price]').textContent = Number.isFinite(amount) ? `$${amount.toLocaleString()}` : '—';
    card.querySelector('[data-review-cadence]').textContent = isOneTime() ? 'one-time base estimate' : 'per-visit base estimate';
    card.querySelector('[data-review-service]').textContent = serviceLabels[currentService()] || 'Cleaning';
    card.querySelector('[data-review-frequency]').textContent = frequencyLabels[currentFrequency()] || '—';
    card.querySelector('[data-review-date]').textContent = value('requested_date') || '—';
    card.querySelector('[data-review-pets]').textContent = petLabels[value('pets')] || value('pets') || '—';
    card.querySelector('[data-review-extras]').textContent = extras.length ? extras.map(item => addOnLabels[item] || item).join(', ') : 'None selected';
  }

  card.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
    if (validateCurrent()) show(index + 1, true);
  }));
  card.querySelector('[data-lock-estimate]').addEventListener('click', lockEstimate);
  card.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => show(index - 1, true)));
  form.querySelectorAll('[name="service_type"]').forEach(input => input.addEventListener('change', syncServiceView));
  field('square_footage').addEventListener('input', () => {
    markField('square_footage', false);
  });
  field('zip').addEventListener('input', () => {
    markField('zip', false);
    setFieldError('zip', 'Enter a five-digit ZIP code.');
  });

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
    data.square_footage = lockedEstimate.square_footage;
    data.preview_estimate_amount = lockedEstimate.amount;
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
    status.querySelector('[data-status-note]').textContent = `Requested for ${submitted.requested_date}. Reference ${data.submissionId}. Final pricing and availability will be confirmed after review.`;
    status.focus({ preventScroll: true });
    status.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.PCC.util.track(window.PCC.events.quoteRevealed || 'quote_revealed', { service_type: submitted.service_type, frequency: submitted.frequency, amount });
    if (window.lucide) window.lucide.createIcons();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || index !== 4 || !lockedEstimate || !validateCurrent()) return;
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
        window.PCC.util.track(window.PCC.events.quoteSubmitted, {
          quote_type: 'residential', service_type: data.service_type, frequency: data.frequency,
          square_footage: data.square_footage, bedrooms: data.bedrooms, bathrooms: data.bathrooms,
          city: data.city, amount: body.quote?.amount,
        });
        renderConfirmation(body, data);
        return;
      }
      if (body.status === 'service_area_unavailable') {
        show(3, true);
        setFieldError('zip', 'This ZIP is outside NataBel’s current Sacramento-area service zone. Call (916) 899-8811 to ask about coverage.');
        markField('zip', true);
        field('zip').focus();
        return;
      }
      if (body.status === 'estimate_changed') {
        error.textContent = `Pricing changed before the request was saved. Your displayed estimate remains locked; please call ${window.PCC.business.phone} so NataBel can honor and review it.`;
        error.classList.add('active');
        error.focus?.();
        return;
      }
      throw new Error(body.error || `quote_${response.status}`);
    } catch (requestError) {
      console.error('[quote] save failed', { submissionId: value('submission_id'), error: String(requestError.message || requestError) });
      error.textContent = `We could not save the request yet. Your details remain here so you can try again. You can also call ${window.PCC.business.phone}.`;
      error.classList.add('active');
      error.focus?.();
      window.PCC.util.track(window.PCC.events.quoteDeliveryFailed || 'quote_delivery_failed', { error_code: 'quote_save_failed' });
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

  if (lockedEstimate) {
    form.querySelector(`[name="service_type"][value="${lockedEstimate.service_type}"]`).checked = true;
    form.querySelectorAll('[name="service_type"]').forEach(input => { input.disabled = true; });
    field('square_footage').value = String(lockedEstimate.square_footage);
    field('square_footage').readOnly = true;
    homeDetailsTracked = true;
    priceViewedTracked = lockedEstimate.price_viewed === true;
  } else {
    if (['move', 'move-in', 'move-out'].includes(requestedService)) form.querySelector('[name="service_type"][value="move"]').checked = true;
    if (['deep', 'deep-cleaning'].includes(requestedService)) form.querySelector('[name="service_type"][value="deep"]').checked = true;
    if (['residential', 'recurring', 'standard'].includes(requestedService)) form.querySelector('[name="service_type"][value="standard"]').checked = true;
  }
  window.PCC.util.track(window.PCC.events.quoteStarted || 'quote_started', {
    quote_type: 'residential', service_type: currentService() || 'residential', experience: 'residential-v6-locked',
  });
  show(lockedEstimate ? 2 : 0, false);
})();
