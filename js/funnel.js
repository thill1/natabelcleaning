/* =========================================================================
   PATALANO CLEANING CO. — Multi-step Free Estimate funnel
   7 steps: service → property → frequency → size → location → contact → submit
   Branches residential vs commercial property options.
   ========================================================================= */
(function () {
  'use strict';
  if (!window.PCC || !window.PCC.forms) return;

  const funnel = document.querySelector('[data-funnel]');
  if (!funnel) return;

  const steps = Array.from(funnel.querySelectorAll('.funnel-step'));
  const success = funnel.querySelector('.funnel-success');
  const bar = funnel.querySelector('.funnel-progress .bar > span');
  const stepLabel = funnel.querySelector('.funnel-progress .step-label');
  const stepCount = funnel.querySelector('.funnel-progress .step-count');
  const total = steps.length;

  const LABELS = [
    'Service Type', 'Property', 'Frequency', 'Details', 'Location', 'Contact', 'Review'
  ];

  let i = 0;
  const state = {};

  function show(idx) {
    i = Math.max(0, Math.min(idx, total - 1));
    steps.forEach((s, n) => s.classList.toggle('active', n === i));
    const pct = ((i) / total) * 100;
    if (bar) bar.style.width = pct + '%';
    if (stepLabel) stepLabel.textContent = 'Step ' + (i + 1) + ' · ' + LABELS[i];
    if (stepCount) stepCount.textContent = (i + 1) + ' of ' + total;
    funnel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function syncChoice($step) {
    $step.querySelectorAll('.choice').forEach(c => {
      const input = c.querySelector('input');
      if (input) c.classList.toggle('checked', input.checked);
    });
  }

  /* choice chips → auto-advance on selection (except last contact step) */
  funnel.querySelectorAll('.funnel-step').forEach(($step, idx) => {
    syncChoice($step);
    $step.querySelectorAll('.choice input').forEach(input => {
      input.addEventListener('change', () => {
        syncChoice($step);
        state[input.name] = input.value;
        // store label too for the lead payload
        const label = input.closest('.choice').querySelector('strong');
        if (label) state[input.name + '_label'] = label.textContent;
        // brief delay so the user sees the selection highlight
        if (idx < total - 2) setTimeout(() => show(idx + 1), 220);
      });
    });
  });

  /* Back / Next buttons */
  funnel.querySelectorAll('[data-next]').forEach(btn => btn.addEventListener('click', () => show(i + 1)));
  funnel.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', () => show(i - 1)));

  /* Property options: branch residential vs commercial on step 2 */
  const serviceType = () => state.service_type || '';
  const isCommercial = () => /commercial|property/i.test(serviceType());

  function refreshPropertyStep() {
    const propStep = steps[1];
    const res = propStep.querySelector('[data-prop="residential"]');
    const com = propStep.querySelector('[data-prop="commercial"]');
    if (!res || !com) return;
    if (isCommercial()) { com.style.display = ''; res.style.display = 'none'; }
    else { com.style.display = 'none'; res.style.display = ''; }
  }
  // re-evaluate whenever service type changes
  const svcInputs = steps[0].querySelectorAll('input[name="service_type"]');
  svcInputs.forEach(inp => inp.addEventListener('change', refreshPropertyStep));
  refreshPropertyStep();

  /* Size step: toggle res/com detail rows */
  function refreshSizeStep() {
    const sizeStep = steps[3];
    const res = sizeStep.querySelector('[data-size="residential"]');
    const com = sizeStep.querySelector('[data-size="commercial"]');
    if (!res || !com) return;
    if (isCommercial()) { com.style.display = ''; res.style.display = 'none'; }
    else { com.style.display = 'none'; res.style.display = ''; }
  }
  svcInputs.forEach(inp => inp.addEventListener('change', refreshSizeStep));
  refreshSizeStep();

  /* Submit via the lead handler */
  const form = funnel.querySelector('form');
  if (form) {
    window.PCC.forms.bind(form, {
      required: {
        name: 'text',
        phone: 'phone',
        email: 'email',
        zip: 'text',
      },
      event: window.PCC.events.estimateFormSubmit,
      onSuccess: (payload) => {
        // enrich with funnel state already collected
        Object.assign(payload, state);
        // fire unified lead + specific commercial/recurring events
        if (isCommercial()) window.PCC.util.track(window.PCC.events.commercialWalkthrough, { type: payload.service_type });
        if (/recurring/i.test(payload.frequency || '')) window.PCC.util.track(window.PCC.events.recurringQuote, { frequency: payload.frequency });
        // reveal success panel
        steps.forEach(s => s.classList.remove('active'));
        success.classList.add('active');
        const summary = success.querySelector('[data-summary]');
        if (summary) {
          summary.innerHTML =
            `<strong>${payload.name}</strong>, your ${payload.service_type_label || payload.service_type || 'cleaning'} estimate request is in.` +
            `<br><br>A member of our team will reach out within one business hour at <strong>${payload.phone}</strong> or <strong>${payload.email}</strong>` +
            (payload.city ? ` to confirm details for your ${payload.city} ${payload.zip ? '· ' + payload.zip : ''} property.` : '.');
        }
        success.scrollIntoView({ block: 'center', behavior: 'smooth' });
      },
    });
  }

  /* init */
  show(0);
})();
