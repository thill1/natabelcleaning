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

  const stepElements = new Map(Array.from(card.querySelectorAll('.quote-step')).map(step => [step.dataset.step, step]));
  const status = card.querySelector('[data-quote-status]');
  const progress = card.querySelector('.quote-progress-track span');
  const stepLabel = card.querySelector('[data-step-label]');
  const stepCount = card.querySelector('[data-step-count]');
  const progressEstimate = card.querySelector('[data-progress-estimate]');
  const labels = {
    size: 'Home size', service: 'Cleaning type', tier: 'Pristine level', frequency: 'Frequency',
    estimate: 'Your estimate', details: 'Your details', review: 'Review'
  };
  const serviceLabels = { standard: 'Recurring Cleaning', deep: 'Pristine Reset', move: 'Pristine Move' };
  const tierLabels = { care: 'Pristine Care', signature: 'Pristine Signature', concierge: 'Pristine Concierge' };
  const frequencyLabels = { weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Every 4 weeks', one_time: 'One-time' };
  const petLabels = { none: 'No pets', dog: 'Dog', cat: 'Cat', multiple: 'Multiple pets', other: 'Other' };
  const addOnLabels = {
    inside_refrigerator: 'Inside refrigerator', inside_oven: 'Inside oven', wall_washing: 'Wall washing',
    carpet_cleaning: 'Carpet cleaning', exterior_windows: 'Exterior windows', garage_or_hauling: 'Garage or hauling'
  };

  let currentStep = 'size';
  let submitting = false;
  let estimateLoading = false;
  let squareFootageLock = null;
  let quotePreview = null;
  let homeDetailsTracked = false;
  let contactStartedTracked = false;
  let priceViewedKey = '';
  const squareFootageLockKey = 'natabel.quote.lock.v1';
  const squareFootageLockMaxAge = 30 * 60 * 1000;

  function field(name) { return form.querySelector(`[name="${name}"]`); }
  function value(name) { return String(field(name)?.value || '').trim(); }
  function selected(name) { return form.querySelector(`[name="${name}"]:checked`)?.value || ''; }
  function currentService() { return selected('service_type'); }
  function isRecurring() { return currentService() === 'standard'; }
  function isOneTime() { return ['deep', 'move'].includes(currentService()); }
  function currentTier() { return isRecurring() ? selected('tier') : ''; }
  function currentFrequency() { return isOneTime() ? 'one_time' : selected('frequency'); }
  function selectedExtras() { return Array.from(form.querySelectorAll('[name="requested_add_ons"]:checked')).map(input => input.value); }
  function routeSteps() {
    return isRecurring()
      ? ['size', 'service', 'tier', 'frequency', 'estimate', 'details', 'review']
      : ['size', 'service', 'estimate', 'details', 'review'];
  }
  function analyticsContext(extra = {}) {
    const context = { quote_type: 'residential', service_type: currentService() || 'not_selected', frequency: currentFrequency() || 'not_selected', ...extra };
    if (isRecurring() && currentTier()) context.tier = currentTier();
    return context;
  }

  function makeSubmissionId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `q-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function localDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  function readSquareFootageLock() {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(squareFootageLockKey) || 'null');
      const valid = saved && /^[A-Za-z0-9._:-]{8,127}$/.test(String(saved.submission_id || ''))
        && Number.isFinite(Number(saved.square_footage)) && Number(saved.square_footage) > 0
        && Date.now() - Number(saved.locked_at) < squareFootageLockMaxAge;
      if (valid) return {
        submission_id: String(saved.submission_id),
        square_footage: Number(saved.square_footage),
        locked_at: Number(saved.locked_at)
      };
      window.sessionStorage.removeItem(squareFootageLockKey);
    } catch (_) { /* private mode */ }
    return null;
  }

  function saveSquareFootageLock(lock) {
    try { window.sessionStorage.setItem(squareFootageLockKey, JSON.stringify(lock)); } catch (_) { /* private mode */ }
  }

  squareFootageLock = readSquareFootageLock();
  field('submission_id').value = squareFootageLock?.submission_id || makeSubmissionId();
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
    return Number.isFinite(quotePreview?.amount) ? quotePreview.amount : null;
  }

  function cadenceText() {
    if (isOneTime()) return `${serviceLabels[currentService()]} · one-time estimate`;
    return `${tierLabels[currentTier()]} · ${frequencyLabels[currentFrequency()]} · per visit`;
  }

  function paintEstimate(message) {
    const amount = calculatedAmount();
    card.querySelectorAll('[data-live-estimate]').forEach(panel => {
      const price = panel.querySelector('[data-live-price]');
      const cadence = panel.querySelector('[data-live-cadence]');
      if (!price || !cadence) return;
      price.textContent = Number.isFinite(amount) ? `$${amount.toLocaleString()}` : message;
      cadence.textContent = Number.isFinite(amount) ? cadenceText() : 'Complete your choices to calculate your estimate.';
    });
    updateProgress();
    if (currentStep === 'review') renderReview();
    const viewedKey = `${currentService()}:${currentTier()}:${currentFrequency()}:${amount}`;
    if (currentStep === 'estimate' && Number.isFinite(amount) && priceViewedKey !== viewedKey) {
      priceViewedKey = viewedKey;
      window.PCC.util.track(window.PCC.events.quotePriceViewed, analyticsContext({
        square_footage: squareFootageLock.square_footage, amount
      }));
    }
  }

  function lockSquareFootage() {
    if (squareFootageLock || !validateCurrent()) return;
    const squareFootage = Number(value('square_footage'));
    squareFootageLock = {
      submission_id: value('submission_id'), square_footage: squareFootage, locked_at: Date.now()
    };
    saveSquareFootageLock(squareFootageLock);
    field('square_footage').readOnly = true;
    if (!homeDetailsTracked) {
      homeDetailsTracked = true;
      window.PCC.util.track(window.PCC.events.quoteHomeDetailsCompleted, analyticsContext({ square_footage: squareFootage }));
    }
    show('service', true);
  }

  function hasActiveSquareFootageLock() {
    if (squareFootageLock && Date.now() - squareFootageLock.locked_at < squareFootageLockMaxAge) return true;
    try { window.sessionStorage.removeItem(squareFootageLockKey); } catch (_) { /* private mode */ }
    squareFootageLock = null;
    quotePreview = null;
    field('square_footage').readOnly = false;
    field('square_footage').value = '';
    show('size', true);
    const error = stepElements.get('size').querySelector('[data-step-error]');
    error.textContent = 'Your 30-minute session expired. Enter your square footage to start a new estimate.';
    error.classList.add('active');
    return false;
  }

  async function calculateAndShowEstimate() {
    if (estimateLoading || !squareFootageLock || !hasActiveSquareFootageLock() || !validateCurrent()) return;
    const section = stepElements.get(currentStep);
    const button = section.querySelector('[data-show-estimate], [data-continue-service]');
    const error = section.querySelector('[data-estimate-error]');
    const original = button.innerHTML;
    estimateLoading = true;
    button.disabled = true;
    button.textContent = 'Calculating…';
    error?.classList.remove('active');
    const requestBody = {
      preview: true,
      service_type: currentService(),
      frequency: currentFrequency(),
      square_footage: squareFootageLock.square_footage,
      condition: 'average'
    };
    if (isRecurring()) requestBody.tier = currentTier();
    try {
      const response = await fetch('/api/quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok || body.status !== 'estimated' || !Number.isFinite(Number(body.quote?.amount))) {
        throw new Error(body.error || `quote_preview_${response.status}`);
      }
      quotePreview = {
        service_type: currentService(), tier: currentTier(), frequency: currentFrequency(), amount: Number(body.quote.amount)
      };
      show('estimate', true);
    } catch (requestError) {
      console.error('[quote] preview failed', { error: String(requestError.message || requestError) });
      if (error) {
        error.textContent = 'We could not calculate this selection yet. Your home size is still locked, so please try again.';
        error.classList.add('active');
        error.focus?.();
      }
    } finally {
      estimateLoading = false;
      button.disabled = false;
      button.innerHTML = original;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function updateProgress() {
    const route = routeSteps();
    const position = Math.max(0, route.indexOf(currentStep));
    progress.style.width = `${((position + 1) / route.length) * 100}%`;
    stepLabel.textContent = `Step ${position + 1} · ${labels[currentStep]}`;
    stepCount.textContent = `${position + 1} of ${route.length}`;
    const amount = calculatedAmount();
    if (progressEstimate) progressEstimate.textContent = position >= route.indexOf('estimate') && Number.isFinite(amount)
      ? `$${amount.toLocaleString()} current estimate`
      : 'About 2 minutes';
  }

  function show(next, focus) {
    const previous = currentStep;
    const guarded = squareFootageLock && next === 'size' ? 'service' : next;
    currentStep = stepElements.has(guarded) ? guarded : 'service';
    stepElements.forEach((step, key) => step.classList.toggle('active', key === currentStep));
    updateProgress();
    if (currentStep === 'service' && squareFootageLock) {
      card.querySelector('[data-locked-size-summary]').textContent = `${squareFootageLock.square_footage.toLocaleString()} sq ft is locked for this 30-minute session. Your cleaning choices can still be changed.`;
    }
    if (currentStep === 'estimate' && quotePreview) {
      card.querySelector('[data-locked-summary]').textContent = `${squareFootageLock.square_footage.toLocaleString()} sq ft is locked. You can go back to compare another service, level, or frequency.`;
      paintEstimate('Estimate unavailable');
    }
    if (currentStep === 'review') renderReview();
    if (currentStep === 'details' && previous !== 'details') {
      if (!contactStartedTracked) {
        contactStartedTracked = true;
        window.PCC.util.track(window.PCC.events.quoteContactStarted, analyticsContext());
      }
      updateConditionNote();
    }
    if (focus) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const heading = stepElements.get(currentStep).querySelector('h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function routeMove(offset) {
    const route = routeSteps();
    const position = route.indexOf(currentStep);
    if (position >= 0) show(route[Math.max(0, Math.min(route.length - 1, position + offset))], true);
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
    const step = stepElements.get(currentStep);
    const stepError = step?.querySelector('[data-step-error]');
    stepError?.classList.remove('active');
    if (currentStep === 'size') {
      const sqft = Number(value('square_footage'));
      const ok = markField('square_footage', !Number.isFinite(sqft) || sqft <= 0);
      if (!ok) stepError?.classList.add('active');
      return ok;
    }
    if (currentStep === 'service') {
      const ok = !!currentService();
      if (!ok) stepError?.classList.add('active');
      return ok;
    }
    if (currentStep === 'tier') {
      const ok = !!currentTier();
      if (!ok) stepError?.classList.add('active');
      return ok;
    }
    if (currentStep === 'frequency') {
      const ok = !!currentFrequency();
      if (!ok) stepError?.classList.add('active');
      return ok;
    }
    if (currentStep === 'details') {
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
        markField('pets', !value('pets')),
        markField('requested_date', !value('requested_date')),
        form.elements.contact_consent.checked
      ];
      const consent = form.elements.contact_consent.closest('.quote-consent');
      consent.style.color = checks[11] ? '' : '#a73529';
      const ok = checks.every(Boolean);
      if (!ok) stepError?.classList.add('active');
      return ok;
    }
    return true;
  }

  function updateConditionNote() {
    const note = card.querySelector('[data-condition-note]');
    note.hidden = !(isRecurring() && (value('condition') === 'heavy' || value('clutter') === 'heavy'));
  }

  function renderReview() {
    const amount = calculatedAmount();
    const extras = selectedExtras();
    const property = ({ house: 'House', apartment: 'Apartment', condo: 'Condo', townhome: 'Townhome' })[value('property_type')] || 'Home';
    card.querySelector('[data-review-home]').textContent = `${squareFootageLock.square_footage.toLocaleString()} sq ft · ${value('bedrooms')} bed · ${value('bathrooms')} bath · ${property}`;
    card.querySelector('[data-review-address]').textContent = `${value('service_address')}, ${value('city')} ${value('zip')}`;
    card.querySelector('[data-review-price]').textContent = Number.isFinite(amount) ? `$${amount.toLocaleString()}` : '—';
    card.querySelector('[data-review-cadence]').textContent = isOneTime() ? 'one-time estimate' : 'per visit';
    card.querySelector('[data-review-service]').textContent = serviceLabels[currentService()] || 'Cleaning';
    const tierRow = card.querySelector('[data-review-tier-row]');
    tierRow.hidden = !isRecurring();
    card.querySelector('[data-review-tier]').textContent = tierLabels[currentTier()] || '—';
    card.querySelector('[data-review-frequency]').textContent = frequencyLabels[currentFrequency()] || '—';
    card.querySelector('[data-review-date]').textContent = value('requested_date') || '—';
    card.querySelector('[data-review-pets]').textContent = petLabels[value('pets')] || value('pets') || '—';
    card.querySelector('[data-review-extras]').textContent = extras.length ? extras.map(item => addOnLabels[item] || item).join(', ') : 'None selected';
  }

  function resetPreview() {
    quotePreview = null;
    priceViewedKey = '';
    updateProgress();
  }

  card.querySelector('[data-lock-size]').addEventListener('click', lockSquareFootage);
  card.querySelector('[data-continue-service]').addEventListener('click', () => {
    if (!validateCurrent()) return;
    if (isRecurring()) show('tier', true);
    else calculateAndShowEstimate();
  });
  card.querySelector('[data-show-estimate]').addEventListener('click', calculateAndShowEstimate);
  card.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
    if (validateCurrent()) routeMove(1);
  }));
  card.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => routeMove(-1)));
  form.querySelectorAll('[name="service_type"], [name="tier"], [name="frequency"]').forEach(input => input.addEventListener('change', resetPreview));
  field('square_footage').addEventListener('input', () => markField('square_footage', false));
  field('zip').addEventListener('input', () => {
    markField('zip', false);
    setFieldError('zip', 'Enter a five-digit ZIP code.');
  });
  field('condition').addEventListener('change', updateConditionNote);
  field('clutter').addEventListener('change', updateConditionNote);

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
    if (isRecurring()) data.tier = currentTier();
    else delete data.tier;
    data.square_footage = squareFootageLock.square_footage;
    data.preview_estimate_amount = quotePreview.amount;
    if (extras.length) data.requested_add_ons = extras;
    Object.assign(data, window.PCC.util.getUTM());
    return data;
  }

  function renderConfirmation(data, submitted) {
    stepElements.forEach(step => step.classList.remove('active'));
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
    const event = { service_type: submitted.service_type, frequency: submitted.frequency, amount };
    if (submitted.tier) event.tier = submitted.tier;
    window.PCC.util.track(window.PCC.events.quoteRevealed || 'quote_revealed', event);
    if (window.lucide) window.lucide.createIcons();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || currentStep !== 'review' || !quotePreview || !hasActiveSquareFootageLock() || !validateCurrent()) return;
    submitting = true;
    const submit = form.querySelector('[type="submit"]');
    const error = form.querySelector('[data-submit-error]');
    const original = submit.innerHTML;
    submit.disabled = true;
    submit.setAttribute('aria-disabled', 'true');
    submit.textContent = 'Saving your request…';
    error.classList.remove('active');
    const data = payload();
    const submittedContext = { quote_type: 'residential', service_type: data.service_type, frequency: data.frequency };
    if (data.tier) submittedContext.tier = data.tier;
    window.PCC.util.track(window.PCC.events.quoteContactSubmitted || 'quote_contact_submitted', submittedContext);

    try {
      const response = await fetch('/api/quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.ok && body.status === 'estimated' && body.saved) {
        const eventData = {
          quote_type: 'residential', service_type: data.service_type, frequency: data.frequency,
          square_footage: data.square_footage, bedrooms: data.bedrooms, bathrooms: data.bathrooms,
          city: data.city, amount: body.quote?.amount
        };
        if (data.tier) eventData.tier = data.tier;
        window.PCC.util.track(window.PCC.events.quoteSubmitted, eventData);
        renderConfirmation(body, data);
        return;
      }
      if (body.status === 'service_area_unavailable') {
        show('details', true);
        setFieldError('zip', 'This ZIP is outside NataBel’s current Sacramento-area service zone. Call (916) 899-8811 to ask about coverage.');
        markField('zip', true);
        field('zip').focus();
        return;
      }
      if (body.status === 'estimate_changed') {
        error.textContent = `Pricing changed since this estimate was calculated. Your square footage is still locked; go back and select Show My Estimate again, or call ${window.PCC.business.phone}.`;
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

  if (['move', 'move-in', 'move-out'].includes(requestedService)) form.querySelector('[name="service_type"][value="move"]').checked = true;
  if (['deep', 'deep-cleaning'].includes(requestedService)) form.querySelector('[name="service_type"][value="deep"]').checked = true;
  if (['residential', 'recurring', 'standard'].includes(requestedService)) form.querySelector('[name="service_type"][value="standard"]').checked = true;
  if (squareFootageLock) {
    field('square_footage').value = String(squareFootageLock.square_footage);
    field('square_footage').readOnly = true;
    homeDetailsTracked = true;
  }
  window.PCC.util.track(window.PCC.events.quoteStarted || 'quote_started', {
    quote_type: 'residential', service_type: currentService() || 'residential', experience: 'residential-v8-pristine-tiers'
  });
  show(squareFootageLock ? 'service' : 'size', false);
})();
