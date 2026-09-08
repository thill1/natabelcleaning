/* =========================================================================
   NATABEL PRISTINE CLEANING — Careers flow
   Shared by join-our-team.html, application.html, application-received.html

   Two-stage hiring funnel:
     Stage 1  Express apply (join-our-team.html)  — ~45 seconds
              → posts to /api/lead → application-received.html
     Stage 2  Full application (application.html) — the legal employment
              application, saved as you go so nobody loses their progress.

   Exposes window.NBCareers for the page scripts.
   ========================================================================= */
(function () {
  'use strict';

  const STORE = {
    lang:    'natabel.careers.lang',
    express: 'natabel.careers.express',
    fullApp: 'natabel.careers.fullapp',
  };

  /* Every read/write is guarded: Safari private mode and "block site data"
     make localStorage throw rather than return null, and a careers page
     that crashes on a storage error is worse than one without save/resume. */
  const store = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); return true; } catch (_) { return false; }
    },
    remove(key) {
      try { window.localStorage.removeItem(key); } catch (_) { /* nothing to do */ }
    },
    getJSON(key) {
      const raw = store.get(key);
      if (!raw) return null;
      try { return JSON.parse(raw); } catch (_) { return null; }
    },
    setJSON(key, value) {
      try { return store.set(key, JSON.stringify(value)); } catch (_) { return false; }
    },
  };

  /* =======================================================================
     Bilingual text
     -----------------------------------------------------------------------
     Elements opt in with data-en / data-es. The swap writes textContent, so
     a translated element must be a LEAF — writing textContent on an element
     that has children deletes those children permanently. (The previous
     version of this page did exactly that and destroyed the Privacy Policy
     link the first time anyone pressed "Español".) Anything with children is
     skipped and reported, so the mistake cannot come back silently.
     ======================================================================= */
  function applyLanguage(lang) {
    const key = lang === 'es' ? 'es' : 'en';
    document.documentElement.lang = key;

    document.querySelectorAll('[data-en][data-es]').forEach(el => {
      if (el.children.length) {
        console.warn('[careers] skipped translating an element with child nodes — wrap the text in a <span data-en data-es> instead:', el);
        return;
      }
      const next = el.dataset[key];
      if (typeof next === 'string') el.textContent = next;
    });

    document.querySelectorAll('[data-placeholder-en][data-placeholder-es]').forEach(el => {
      const next = el.dataset[key === 'es' ? 'placeholderEs' : 'placeholderEn'];
      if (typeof next === 'string') el.placeholder = next;
    });

    document.querySelectorAll('[data-aria-en][data-aria-es]').forEach(el => {
      const next = el.dataset[key === 'es' ? 'ariaEs' : 'ariaEn'];
      if (typeof next === 'string') el.setAttribute('aria-label', next);
    });

    document.querySelectorAll('[data-language]').forEach(btn => {
      const active = btn.dataset.language === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    const hidden = document.getElementById('applicationLanguage');
    if (hidden) hidden.value = key === 'es' ? 'Spanish' : 'English';

    store.set(STORE.lang, key);
    document.dispatchEvent(new CustomEvent('careers:language', { detail: { lang: key } }));
    return key;
  }

  function currentLanguage() {
    return store.get(STORE.lang) === 'es' ? 'es' : 'en';
  }

  function initLanguageSwitch() {
    const buttons = document.querySelectorAll('[data-language]');
    if (!buttons.length) return;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => applyLanguage(btn.dataset.language));
    });
    applyLanguage(currentLanguage());
  }

  function t(en, es) {
    return currentLanguage() === 'es' ? es : en;
  }

  /* =======================================================================
     Validation
     ======================================================================= */
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = v => (String(v).match(/\d/g) || []).length >= 10;
  const isZip   = v => /^\d{5}(-\d{4})?$/.test(String(v).trim());

  function fieldOf(el) {
    return el.closest('.field') || el.closest('.consent');
  }

  function checkControl(el) {
    // Returns true when the control is acceptable.
    const value = (el.value || '').trim();

    if (el.type === 'checkbox') return el.required ? el.checked : true;

    if (el.type === 'radio') {
      const form = el.form || document;
      return !!form.querySelector(`input[name="${CSS.escape(el.name)}"]:checked`);
    }

    if (el.required && !value) return false;
    if (!value) return true; // optional and empty

    const rule = el.dataset.validate || (el.type === 'email' ? 'email' : el.type === 'tel' ? 'phone' : '');
    if (rule === 'email') return isEmail(value);
    if (rule === 'phone') return isPhone(value);
    if (rule === 'zip')   return isZip(value);
    return true;
  }

  /* Validate every control inside `scope`. Marks fields and returns the
     first offending control so the caller can focus it. */
  function validateScope(scope) {
    let firstBad = null;
    const seenRadioGroups = new Set();

    scope.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.type === 'hidden' || el.disabled) return;
      if (el.name === 'website_url') return; // honeypot

      if (el.type === 'radio') {
        if (!el.required && !scope.querySelector(`input[name="${CSS.escape(el.name)}"][required]`)) return;
        if (seenRadioGroups.has(el.name)) return;
        seenRadioGroups.add(el.name);
      } else if (!el.required) {
        // Optional fields still get format-checked when filled in.
        if (!(el.value || '').trim()) { setFieldState(el, null); return; }
      }

      const ok = checkControl(el);
      setFieldState(el, ok);
      if (!ok && !firstBad) firstBad = el;
    });

    return firstBad;
  }

  function setFieldState(el, ok) {
    const field = fieldOf(el);
    if (!field) return;
    if (ok === null) { field.classList.remove('invalid', 'valid'); return; }
    field.classList.toggle('invalid', !ok);
    field.classList.toggle('valid', !!ok && el.type !== 'radio' && el.type !== 'checkbox');
  }

  /* Re-check a field the moment the visitor fixes it, so an error message
     clears itself instead of sitting there until the next submit. */
  function bindLiveValidation(form) {
    form.addEventListener('blur', e => {
      const el = e.target;
      if (!el.matches || !el.matches('input, select, textarea')) return;
      if (el.type === 'hidden' || el.name === 'website_url') return;
      if (!el.required && !(el.value || '').trim()) { setFieldState(el, null); return; }
      setFieldState(el, checkControl(el));
    }, true);

    form.addEventListener('change', e => {
      const el = e.target;
      if (!el.matches || !el.matches('input, select, textarea')) return;
      const field = fieldOf(el);
      if (field && field.classList.contains('invalid')) setFieldState(el, checkControl(el));
    });
  }

  /* =======================================================================
     Phone formatting — light touch, US format, never blocks typing
     ======================================================================= */
  function bindPhoneFormat(form) {
    form.querySelectorAll('input[type="tel"]').forEach(input => {
      input.addEventListener('blur', () => {
        const digits = (input.value.match(/\d/g) || []).join('');
        if (digits.length === 10) {
          input.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
      });
    });
  }

  /* =======================================================================
     Reference code — shown on the thank-you page and sent with the lead so
     Fatima and the applicant are talking about the same application.
     ======================================================================= */
  function makeReference(prefix) {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${ymd}-${rand}`;
  }

  /* =======================================================================
     Form values in / out
     ======================================================================= */
  function readForm(form) {
    const out = {};
    new FormData(form).forEach((value, key) => {
      if (key === 'website_url') return;
      const v = String(value).trim();
      if (!v) return;
      // Repeated names (checkbox groups) collect into a comma list.
      out[key] = out[key] ? `${out[key]}, ${v}` : v;
    });
    return out;
  }

  function fillForm(form, data) {
    if (!data) return;
    Object.keys(data).forEach(name => {
      const value = data[name];
      if (value === undefined || value === null || value === '') return;
      // Consents and certifications carry data-no-prefill: a legal agreement
      // is only valid if the applicant ticks it themselves on this form, so it
      // is never restored from a draft or carried over from the express apply.
      const controls = Array.from(form.querySelectorAll(`[name="${CSS.escape(name)}"]`))
        .filter(el => el.dataset.noPrefill === undefined);
      if (!controls.length) return;

      const first = controls[0];
      if (first.type === 'radio') {
        controls.forEach(el => { el.checked = el.value === value; });
      } else if (first.type === 'checkbox') {
        const wanted = String(value).split(',').map(s => s.trim());
        controls.forEach(el => {
          el.checked = controls.length === 1 ? true : wanted.includes(el.value);
        });
      } else if (!first.value) {
        // Never overwrite something the applicant has already typed.
        first.value = value;
      }
    });
  }

  /* =======================================================================
     Stage 2 — multi-step engine with autosave
     ======================================================================= */
  function initSteppedApplication(options) {
    const form = document.getElementById(options.formId);
    if (!form) return null;

    const steps = Array.from(form.querySelectorAll('.app-step'));
    if (!steps.length) return null;

    const prevBtn     = form.querySelector('.app-prev');
    const nextBtn     = form.querySelector('.app-next');
    const submitBtn   = form.querySelector('.app-submit');
    // The progress readout sits in the card header, outside <form>, so these
    // are looked up on the document rather than scoped to the form.
    const labelEl     = document.querySelector('.app-step-label');
    const nameEl      = document.querySelector('.app-step-name');
    const progressEl  = document.querySelector('.app-progress-track span');
    const resumeBar   = document.querySelector('.app-saved-bar');
    const discardBtns = document.querySelectorAll('[data-discard-progress]');

    let index = 0;
    let saveTimer = null;

    function stepName(i) {
      const step = steps[i];
      const lang = currentLanguage();
      return (lang === 'es' ? step.dataset.nameEs : step.dataset.nameEn) || '';
    }

    function render(moveFocus) {
      steps.forEach((s, i) => s.classList.toggle('active', i === index));
      const last = index === steps.length - 1;
      if (prevBtn)   prevBtn.hidden = index === 0;
      if (nextBtn)   nextBtn.hidden = last;
      if (submitBtn) submitBtn.hidden = !last;
      if (labelEl)   labelEl.textContent = t(`Step ${index + 1} of ${steps.length}`, `Paso ${index + 1} de ${steps.length}`);
      if (nameEl)    nameEl.textContent = stepName(index);
      if (progressEl) progressEl.style.transform = `scaleX(${(index + 1) / steps.length})`;

      if (moveFocus) {
        const card = document.querySelector('.application-card');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const heading = steps[index].querySelector('h2');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
      }
      save();
    }

    function goTo(i, moveFocus) {
      index = Math.max(0, Math.min(i, steps.length - 1));
      render(moveFocus !== false);
    }

    /* Fields the page fills in by itself. A draft made only of these is not
       progress worth saving — and restoring one would greet a first-time
       visitor with "we restored your saved progress" over an empty form. */
    const AUTO_FILLED = [
      'form_type', 'position', 'application_stage', 'application_language',
      'application_reference', 'signature_date',
    ];

    function hasApplicantInput(values) {
      return Object.keys(values || {}).some(k => !AUTO_FILLED.includes(k));
    }

    function save() {
      if (!options.storageKey) return;
      const values = readForm(form);
      if (!hasApplicantInput(values)) { store.remove(options.storageKey); return; }
      store.setJSON(options.storageKey, {
        step: index,
        savedAt: new Date().toISOString(),
        values,
      });
    }

    function scheduleSave() {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(save, 500);
    }

    function clearSaved() {
      if (options.storageKey) store.remove(options.storageKey);
    }

    function restore() {
      // Prefill from the express apply first, then let a saved draft win.
      const express = store.getJSON(STORE.express);
      if (express && express.values) fillForm(form, express.values);

      const saved = options.storageKey ? store.getJSON(options.storageKey) : null;
      if (saved && saved.values && hasApplicantInput(saved.values)) {
        fillForm(form, saved.values);
        if (resumeBar) {
          resumeBar.classList.add('show');
          const when = resumeBar.querySelector('[data-saved-when]');
          if (when && saved.savedAt) {
            const d = new Date(saved.savedAt);
            if (!Number.isNaN(d.getTime())) when.textContent = d.toLocaleString();
          }
        }
        if (typeof saved.step === 'number') index = Math.max(0, Math.min(saved.step, steps.length - 1));
      }
      return !!(express || saved);
    }

    // --- wiring ---
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const bad = validateScope(steps[index]);
        if (bad) { bad.focus(); return; }
        goTo(index + 1);
      });
    }
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));

    form.addEventListener('input', scheduleSave);
    form.addEventListener('change', scheduleSave);

    discardBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const ok = window.confirm(t(
          'Clear the saved application on this device and start over?',
          '¿Borrar la solicitud guardada en este dispositivo y empezar de nuevo?'
        ));
        if (!ok) return;
        clearSaved();
        store.remove(STORE.express);
        window.location.reload();
      });
    });

    // Validate the WHOLE form on submit, not just the visible step, and jump
    // to the first step that has a problem. Registered before PCC.forms.bind
    // so stopImmediatePropagation keeps a bad application from being sent.
    form.addEventListener('submit', e => {
      const firstBad = validateScope(form);
      if (!firstBad) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const owningStep = steps.findIndex(s => s.contains(firstBad));
      if (owningStep > -1 && owningStep !== index) goTo(owningStep);
      firstBad.focus();
    });

    document.addEventListener('careers:language', () => render(false));

    bindLiveValidation(form);
    bindPhoneFormat(form);
    restore();
    render(false);

    return { form, goTo, save, clearSaved, steps };
  }

  /* =======================================================================
     Public surface
     ======================================================================= */
  window.NBCareers = {
    STORE,
    store,
    t,
    applyLanguage,
    currentLanguage,
    initLanguageSwitch,
    validateScope,
    bindLiveValidation,
    bindPhoneFormat,
    makeReference,
    readForm,
    fillForm,
    initSteppedApplication,
  };
})();
