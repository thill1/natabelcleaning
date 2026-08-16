/* NataBel residential instant-quote controller. */
(function () {
  'use strict';
  if (!window.PCC || !window.PCC.forms) return;
  const card = document.querySelector('[data-funnel]');
  if (!card) return;

  const form = card.querySelector('form');
  const serviceArea = window.NataBelServiceArea;
  const requestedService = new URLSearchParams(location.search).get('service');
  if (requestedService && !['residential', 'recurring', 'standard', 'move', 'move-in', 'move-out'].includes(requestedService)) {
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
  const labels = ['Service area', 'Your cleaning', 'Your price', 'Details', 'Your quote', 'Contact'];
  const priceCache = { weekly: null, biweekly: null, monthly: null, one_time: null };
  const frequencyLabels = { weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Every 4 weeks', one_time: 'Move-In / Move-Out' };
  const upgradeLabels = {
    inside_refrigerator: 'Inside refrigerator', inside_oven: 'Inside oven', interior_windows: 'Interior windows',
    baseboard_detail: 'Baseboard detail', cabinet_interiors: 'Cabinet interiors', pet_hair: 'Pet hair treatment'
  };
  const focusLabels = {
    kitchen: 'Kitchen', bathrooms: 'Bathrooms', floors: 'Floors', dusting_surfaces: 'Dust & surfaces',
    bedrooms: 'Bedrooms', high_touch: 'High-touch areas'
  };
  let index = 0;
  let previewRequestId = 0;

  function field(name) { return form.querySelector(`[name="${name}"]`); }
  function value(name) { return String(field(name)?.value || '').trim(); }
  function selected(name) { return form.querySelector(`[name="${name}"]:checked`)?.value || ''; }
  function currentService() { return selected('service_type') || 'standard'; }
  function isMove() { return currentService() === 'move'; }
  function currentFrequency() { return isMove() ? 'one_time' : selected('frequency'); }
  function selectedExtras() { return Array.from(form.querySelectorAll('[name="requested_add_ons"]:checked')).map(input => input.value); }
  function selectedFocusAreas() { return Array.from(form.querySelectorAll('[name="focus_areas"]:checked')).map(input => input.value); }

  function markField(name, invalid) {
    const wrapper = field(name)?.closest('.quote-field');
    if (wrapper) wrapper.classList.toggle('invalid', invalid);
    return !invalid;
  }

  function setZipError(message) {
    const error = field('zip')?.closest('.quote-field')?.querySelector('.quote-error');
    if (error) error.textContent = message;
  }

  function validateZip() {
    const zip = value('zip');
    if (!/^\d{5}$/.test(zip)) {
      setZipError('Enter a five-digit ZIP code.');
      return markField('zip', true);
    }
    if (!serviceArea || !serviceArea.isEligibleZip(zip)) {
      setZipError('This ZIP is outside NataBel’s current Sacramento-area service zone. Call (916) 899-8811 to ask about coverage.');
      return markField('zip', true);
    }
    setZipError('Enter a five-digit ZIP code.');
    return markField('zip', false);
  }

  function quoteInput(frequency) {
    return {
      preview: true,
      audience: 'residential',
      service_type: currentService(),
      condition: 'average',
      frequency: isMove() ? 'one_time' : (frequency || selected('frequency')),
      property_type: value('property_type'),
      square_footage: Number(value('square_footage')),
      bedrooms: value('bedrooms'),
      bathrooms: value('bathrooms'),
      zip: value('zip')
    };
  }

  async function fetchPreview(frequency) {
    try {
      const response = await fetch('/api/quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(quoteInput(frequency))
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.ok && body.status === 'estimated' && Number.isFinite(Number(body.quote?.amount))) return Number(body.quote.amount);
      return null;
    } catch (_) { return null; }
  }

  function priceText(amount, cadence) {
    if (!Number.isFinite(amount)) return 'Custom quote';
    return cadence === 'one_time' ? `$${amount.toLocaleString()}` : `$${amount.toLocaleString()} / visit`;
  }

  function syncServiceView() {
    card.querySelectorAll('[data-recurring-only]').forEach(node => { node.hidden = isMove(); });
    card.querySelectorAll('[data-move-only]').forEach(node => { node.hidden = !isMove(); });
    if (isMove()) {
      form.querySelectorAll('[name="frequency"]').forEach(input => { input.checked = false; });
      form.querySelectorAll('[name="recent_cleaning"]').forEach(input => { input.checked = false; });
    }
  }

  async function refreshPrices() {
    const requestId = ++previewRequestId;
    const manualBox = card.querySelector('[data-manual-rate]');
    if (manualBox) manualBox.hidden = true;
    syncServiceView();

    if (isMove()) {
      const node = card.querySelector('[data-price="move"]');
      if (node) node.textContent = 'Checking…';
      const amount = await fetchPreview('one_time');
      if (requestId !== previewRequestId) return;
      priceCache.one_time = amount;
      if (node) node.textContent = priceText(amount, 'one_time');
      if (manualBox) manualBox.hidden = Number.isFinite(amount);
      return;
    }

    card.querySelectorAll('[data-price="weekly"],[data-price="biweekly"],[data-price="monthly"]').forEach(node => { node.textContent = 'Checking…'; });
    const frequencies = ['weekly', 'biweekly', 'monthly'];
    const results = await Promise.all(frequencies.map(fetchPreview));
    if (requestId !== previewRequestId) return;
    frequencies.forEach((frequency, i) => {
      priceCache[frequency] = results[i];
      const node = card.querySelector(`[data-price="${frequency}"]`);
      if (node) node.textContent = priceText(results[i], frequency);
    });
    if (manualBox) manualBox.hidden = !results.every(amount => !Number.isFinite(amount));
  }

  function updateProgress() {
    progress.style.width = `${((index + 1) / steps.length) * 100}%`;
    stepLabel.textContent = `Step ${index + 1} · ${labels[index]}`;
    stepCount.textContent = `${index + 1} of ${steps.length}`;
  }

  function show(next, focus) {
    index = Math.max(0, Math.min(next, steps.length - 1));
    steps.forEach((step, i) => step.classList.toggle('active', i === index));
    syncServiceView();
    updateProgress();
    if (index === 2) refreshPrices();
    if (index === 4) renderQuoteReview();
    if (focus) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const heading = steps[index].querySelector('h2:not([hidden])');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function validateCurrent() {
    const step = steps[index];
    const stepError = step.querySelector('[data-step-error]');
    if (stepError) stepError.classList.remove('active');

    if (index === 0) return validateZip();
    if (index === 1) {
      const sqft = Number(value('square_footage'));
      const ok = [
        !!selected('service_type'),
        markField('property_type', !value('property_type')),
        markField('square_footage', !Number.isFinite(sqft) || sqft < 200 || sqft > 30000),
        markField('bedrooms', !value('bedrooms')),
        markField('bathrooms', !value('bathrooms'))
      ].every(Boolean);
      if (!ok && stepError) stepError.classList.add('active');
      return ok;
    }
    if (index === 2) {
      if (isMove()) return true;
      const ok = !!selected('frequency');
      if (!ok && stepError) stepError.classList.add('active');
      return ok;
    }
    if (index === 3) {
      if (isMove()) return true;
      const ok = !!selected('recent_cleaning');
      if (!ok && stepError) stepError.classList.add('active');
      return ok;
    }
    if (index === 5) {
      const email = value('email');
      const phone = value('phone');
      const checks = [
        markField('name', !value('name')),
        markField('phone', !/[0-9()+\-\s]{10,}/.test(phone)),
        markField('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
        markField('city', !value('city')),
        markField('service_address', !value('service_address')),
        !!form.elements.contact_consent.checked
      ];
      const consent = form.elements.contact_consent.closest('.quote-consent');
      consent.style.color = checks[5] ? '' : '#a73529';
      return checks.every(Boolean);
    }
    return true;
  }

  function reviewHomeLabel() {
    const property = ({ house: 'House', apartment: 'Apartment', condo: 'Condo', townhome: 'Townhome' })[value('property_type')] || 'Home';
    return `${value('bedrooms')} bed · ${value('bathrooms')} bath · ${Number(value('square_footage')).toLocaleString()} sq ft · ${property}`;
  }

  function renderQuoteReview() {
    const frequency = currentFrequency();
    const amount = priceCache[frequency];
    const extras = selectedExtras();
    const focusAreas = selectedFocusAreas();
    card.querySelector('[data-review-home]').textContent = reviewHomeLabel();
    card.querySelector('[data-review-zip]').textContent = `ZIP ${value('zip')}`;
    card.querySelector('[data-review-frequency]').textContent = isMove() ? 'Move-In / Move-Out Cleaning' : (frequencyLabels[frequency] || 'Recurring cleaning');
    card.querySelector('[data-review-price]').textContent = Number.isFinite(amount) ? `$${amount.toLocaleString()}` : 'Custom';
    card.querySelector('[data-review-cadence]').textContent = isMove() ? 'one-time cleaning · cleaning service only' : 'per visit · cleaning service only';
    card.querySelector('[data-review-first-label]').textContent = isMove() ? 'Cleaning type' : 'First visit';
    card.querySelector('[data-review-first]').textContent = isMove() ? 'Move-In / Move-Out' : (selected('recent_cleaning') === 'no' ? 'Confirm first-visit reset' : 'Standard recurring scope');
    card.querySelector('[data-review-focus]').textContent = focusAreas.length ? focusAreas.map(key => focusLabels[key] || key).join(', ') : 'None selected';
    card.querySelector('[data-review-extras]').textContent = extras.length ? extras.map(key => upgradeLabels[key] || key).join(', ') : 'None selected';
    const notes = [];
    if (!isMove() && selected('recent_cleaning') === 'no') notes.push('NataBel will confirm whether the first visit needs a separate reset price before service.');
    if (isMove()) notes.push('The Move-In / Move-Out price includes the $175 move-service premium for this square-footage tier.');
    if (extras.length) notes.push('Fatima will call you for any additional add-on quotes.');
    if (!notes.length) notes.push('Final scope and availability are confirmed before service.');
    card.querySelector('[data-review-note]').textContent = notes.join(' ');
  }

  card.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
    if (!validateCurrent()) return;
    show(index + 1, true);
  }));
  card.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => show(index - 1, true)));

  field('zip')?.addEventListener('input', () => {
    markField('zip', false);
    setZipError('Enter a five-digit ZIP code.');
  });
  form.querySelectorAll('[name="service_type"]').forEach(input => input.addEventListener('change', syncServiceView));
  form.querySelectorAll('[name="frequency"]').forEach(input => input.addEventListener('change', () => {
    const error = steps[2].querySelector('[data-step-error]');
    if (error) error.classList.remove('active');
  }));
  form.querySelectorAll('[name="recent_cleaning"]').forEach(input => input.addEventListener('change', () => {
    const error = steps[3].querySelector('[data-step-error]');
    if (error) error.classList.remove('active');
  }));

  function payload() {
    const data = {
      submitted_at: new Date().toISOString(), source: location.pathname,
      lead_source_label: form.dataset.leadSource || 'Instant Quote', quote_type: 'residential'
    };
    const extras = [];
    const focusAreas = [];
    new FormData(form).forEach((entryValue, key) => {
      if (key === 'website_url' || !String(entryValue).trim()) return;
      if (key === 'requested_add_ons') extras.push(String(entryValue));
      else if (key === 'focus_areas') focusAreas.push(String(entryValue));
      else data[key] = String(entryValue).trim();
    });
    data.service_type = currentService();
    data.frequency = currentFrequency();
    if (isMove()) delete data.recent_cleaning;
    if (extras.length) data.requested_add_ons = extras;
    if (focusAreas.length) data.focus_areas = focusAreas;
    Object.assign(data, window.PCC.util.getUTM());
    return data;
  }

  function deliveryMessage(result) {
    if (result?.customerEmail && result?.internalEmail) return 'We emailed the quote to you and sent the request to NataBel.';
    if (result?.delivery === 'endpoint') return 'Your quote request reached NataBel. A team member will follow up to confirm scheduling.';
    if (result?.delivery === 'email') return 'Your email app is opening with the details filled in. Press Send so NataBel receives the request.';
    return 'Your quote is shown here. Please call NataBel if you would like immediate scheduling help.';
  }

  function renderResult(type, data, submitted) {
    steps.forEach(step => step.classList.remove('active'));
    form.hidden = true;
    card.querySelector('.quote-progress').hidden = true;
    status.classList.add('active');
    const amount = Number(data?.quote?.amount);
    const move = submitted.service_type === 'move';
    status.querySelector('[data-status-title]').textContent = move ? 'Your Move-In / Move-Out quote is ready.' : 'Your recurring cleaning quote is ready.';
    status.querySelector('[data-status-price]').textContent = Number.isFinite(amount) ? `$${amount.toLocaleString()}` : 'Custom';
    status.querySelector('[data-status-cadence]').textContent = move ? 'one-time cleaning' : 'per visit';
    const copy = status.querySelector('[data-status-copy]');
    const note = status.querySelector('[data-status-note]');

    if (type === 'estimated') {
      copy.textContent = `${move ? 'Move-In / Move-Out' : (frequencyLabels[submitted.frequency] || 'Recurring')} cleaning. ${deliveryMessage(data.fallbackDelivery || data.delivery)}`;
      const notes = [];
      if (!move && submitted.recent_cleaning === 'no') notes.push('The first visit may require a separate reset price after NataBel confirms the starting condition.');
      if (move) notes.push('Your one-time price includes the approved $175 move-service premium.');
      if (selectedExtras().length) notes.push('Fatima will call you for any additional add-on quotes.');
      if (selectedFocusAreas().length) notes.push('Your selected focus areas were included with the cleaning request.');
      if (!notes.length) notes.push('Final scope and availability are confirmed before service.');
      note.textContent = notes.join(' ');
      window.PCC.util.track(window.PCC.events.quoteRevealed || 'quote_revealed', { service_type: submitted.service_type, frequency: submitted.frequency, amount });
    } else {
      copy.textContent = `This home needs a custom quote. ${deliveryMessage(data.delivery)}`;
      note.textContent = 'NataBel will review the home details and confirm pricing before a cleaning date is finalized.';
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
    submit.textContent = 'Saving your quote…';
    error.classList.remove('active');
    const data = payload();
    window.PCC.util.track(window.PCC.events.quoteContactSubmitted || 'quote_contact_submitted', { quote_type: 'residential', service_type: data.service_type, frequency: data.frequency });

    try {
      const response = await fetch('/api/quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.ok && body.status === 'estimated') {
        if (!body.delivery?.customerEmail || !body.delivery?.internalEmail) {
          data.estimate_amount = data.service_type === 'move' ? `$${body.quote.amount} one-time` : `$${body.quote.amount} per visit`;
          body.fallbackDelivery = await window.PCC.forms.route(data);
        }
        renderResult('estimated', body, data);
        return;
      }
      if (body.status === 'service_area_unavailable') {
        show(0, true);
        setZipError('This ZIP is outside NataBel’s current Sacramento-area service zone. Call (916) 899-8811 to ask about coverage.');
        markField('zip', true);
        field('zip')?.focus();
        return;
      }
      if (body.status === 'manual_review_required' || body.error === 'rate_not_found') {
        const delivery = await window.PCC.forms.route(data);
        renderResult('manual', { delivery }, data);
        return;
      }
      throw new Error(body.error || `quote_${response.status}`);
    } catch (requestError) {
      console.warn('[quote] request failed', requestError);
      try {
        const delivery = await window.PCC.forms.route(data);
        const cached = priceCache[data.frequency];
        if (delivery?.delivery) {
          renderResult(Number.isFinite(cached) ? 'estimated' : 'manual', {
            quote: Number.isFinite(cached) ? { amount: cached } : null, fallbackDelivery: delivery, delivery
          }, data);
          return;
        }
      } catch (_) { /* show direct fallback below */ }
      error.textContent = `We could not save the quote automatically. Call ${window.PCC.business.phone} or email ${window.PCC.business.email}.`;
      error.classList.add('active');
      window.PCC.util.track(window.PCC.events.quoteDeliveryFailed || 'quote_delivery_failed', { reason: String(requestError.message || requestError) });
    } finally {
      submit.disabled = false;
      submit.innerHTML = original;
      if (window.lucide) window.lucide.createIcons();
    }
  });

  if (['move', 'move-in', 'move-out'].includes(requestedService)) {
    const moveInput = form.querySelector('[name="service_type"][value="move"]');
    if (moveInput) moveInput.checked = true;
  }
  window.PCC.util.track(window.PCC.events.quoteStarted || 'quote_started', { source: location.pathname, experience: 'residential-v3' });
  show(0, false);
})();