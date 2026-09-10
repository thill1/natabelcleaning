/* =========================================================================
   NATABEL PRISTINE CLEANING — Privacy-aware analytics loader

   Direct GA4 and Microsoft Clarity use a disclosed, default-on analytics
   setting with no first-visit prompt and a one-click opt-out available from
   Privacy choices. Advertising storage stays denied, Global Privacy Control
   is honored, and production IDs live in js/config.js.

   The event layer in config.js is the only application-facing API. This file
   owns consent, vendor loading, page-level events, CTA events, and Clarity
   form masking. No form values are read or sent here.
   ========================================================================= */
(function () {
  'use strict';
  if (!window.PCC || !window.PCC.analytics) return;

  const analytics = window.PCC.analytics;
  const consentKey = analytics.consentStorageKey || 'natabel.analytics.consent.v1';
  const configuredDefault = analytics.defaultConsent === 'denied' ? 'denied' : 'granted';
  const isReal = (value, prefix) => {
    const normalized = String(value || '').trim();
    return !!normalized && !/^(YOUR|TODO|XXX)/i.test(normalized)
      && (!prefix || normalized.indexOf(prefix) === 0);
  };

  function hasGlobalPrivacyControl() {
    return analytics.honorGlobalPrivacyControl !== false && navigator.globalPrivacyControl === true;
  }

  function readStoredConsent() {
    try {
      const value = window.localStorage.getItem(consentKey);
      return value === 'granted' || value === 'denied' ? value : 'unknown';
    } catch (_) {
      return 'unknown';
    }
  }

  function readConsent() {
    if (hasGlobalPrivacyControl()) return 'denied';
    const stored = readStoredConsent();
    return stored === 'unknown' ? configuredDefault : stored;
  }

  function writeConsent(value) {
    try { window.localStorage.setItem(consentKey, value); } catch (_) { /* private mode */ }
  }

  function injectStyles() {
    if (document.querySelector('link[data-analytics-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/analytics.css?v=20260910-default-on';
    link.dataset.analyticsStyles = 'true';
    document.head.appendChild(link);
  }

  function maskClarityFields() {
    document.querySelectorAll('form input, form select, form textarea').forEach(field => {
      field.setAttribute('data-clarity-mask', 'true');
    });
  }

  function consentPayload(analyticsStorage) {
    return {
      analytics_storage: analyticsStorage,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    };
  }

  function clearAnalyticsCookies() {
    const names = document.cookie.split(';').map(part => part.split('=')[0].trim())
      .filter(name => /^(_ga|_gid|_gat|_clck|_clsk)/i.test(name));
    const rootDomain = window.location.hostname.replace(/^www\./, '');
    const domains = ['', window.location.hostname, rootDomain, '.' + rootDomain];
    names.forEach(name => {
      domains.forEach(domain => {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
      });
    });
  }

  function updateLoadedVendorConsent(value) {
    const state = value === 'granted' ? 'granted' : 'denied';
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', consentPayload(state));
    if (typeof window.clarity === 'function') {
      window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: state });
      if (state === 'denied') window.clarity('consent', false);
    }
  }

  function loadGa4() {
    const id = String(analytics.ga4Id || '').trim();
    if (!isReal(id, 'G-') || analytics.loaded?.ga4) return false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', consentPayload('granted'));
    window.gtag('js', new Date());
    // page_view is emitted by the shared event layer so it has the same
    // attribution context as funnel and conversion events.
    window.gtag('config', id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    script.onerror = () => console.warn('[PCC analytics] GA4 failed to load');
    document.head.appendChild(script);
    analytics.loaded = { ...(analytics.loaded || {}), ga4: true };
    return true;
  }

  function loadClarity() {
    const id = String(analytics.clarityProjectId || '').trim();
    if (!isReal(id) || !/^[a-z0-9]{6,}$/i.test(id) || analytics.loaded?.clarity) return false;
    maskClarityFields();
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    // Only send Clarity an affirmative consent signal after an explicit user
    // choice. With no choice, Clarity applies its own regional no-consent mode
    // where required instead of receiving a false consent signal.
    if (readStoredConsent() === 'granted') {
      window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    }
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.clarity.ms/tag/' + encodeURIComponent(id);
    script.onerror = () => console.warn('[PCC analytics] Clarity failed to load');
    document.head.appendChild(script);
    analytics.loaded = { ...(analytics.loaded || {}), clarity: true };
    return true;
  }

  function loadConfiguredVendors() {
    if (readConsent() !== 'granted') return;
    sanitizeUrlForVendors();
    updateLoadedVendorConsent('granted');
    const ga4Loaded = loadGa4();
    const clarityLoaded = loadClarity();
    if ((ga4Loaded || clarityLoaded || analytics.loaded?.ga4 || analytics.loaded?.clarity) && window.PCC.util) {
      window.PCC.util.track('page_view', { page_type: analytics.pageType || 'website' });
    }
  }

  function hasConfiguredVendors() {
    return isReal(analytics.ga4Id, 'G-') || isReal(analytics.clarityProjectId);
  }

  function sanitizeUrlForVendors() {
    // GA4 and Clarity can observe the current page URL. Preserve only the
    // site parameters the pages actually use and remove arbitrary query keys
    // before either vendor is allowed to load.
    const allowed = new Set(['service', 'source', 'stage', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']);
    const current = new URL(window.location.href);
    const attribution = window.PCC.util?.getUTM ? window.PCC.util.getUTM() : {};
    let changed = false;
    Array.from(current.searchParams.keys()).forEach(key => {
      if (!allowed.has(key)) {
        current.searchParams.delete(key);
        changed = true;
      }
    });
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
      const value = attribution[key] || '';
      if (value) {
        if (current.searchParams.get(key) !== value) { current.searchParams.set(key, value); changed = true; }
      } else if (current.searchParams.has(key)) {
        current.searchParams.delete(key);
        changed = true;
      }
    });
    if (changed) window.history.replaceState(window.history.state, document.title, current.pathname + current.search + current.hash);
  }

  function removeConsentUi() {
    document.querySelector('[data-analytics-consent]')?.remove();
  }

  function showConsentUi() {
    if (document.querySelector('[data-analytics-consent]')) return;
    injectStyles();
    const banner = document.createElement('aside');
    banner.className = 'analytics-consent';
    banner.dataset.analyticsConsent = 'true';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Privacy choices');
    const gpc = hasGlobalPrivacyControl();
    const analyticsActive = readConsent() === 'granted';
    if (gpc) {
      banner.innerHTML = `
        <div class="analytics-consent-copy">
          <strong>Privacy preference honored</strong>
          <p>Your browser privacy signal is active, so optional analytics is off. NataBel does not sell or share analytics data for cross-context behavioral advertising. <a href="privacy.html">Learn more</a></p>
        </div>
        <div class="analytics-consent-actions">
          <button type="button" class="analytics-consent-decline" data-analytics-close>Close</button>
        </div>`;
      document.body.appendChild(banner);
      banner.querySelector('[data-analytics-close]').addEventListener('click', removeConsentUi);
      return;
    }
    banner.innerHTML = `
      <div class="analytics-consent-copy">
        <strong>Analytics choices</strong>
        <p>Optional Google Analytics and Microsoft Clarity are currently ${analyticsActive ? 'on' : 'off'}. They help NataBel improve the quote and application experiences. Form fields are masked, advertising features are off, and names, emails, phone numbers, and street addresses are not sent in analytics events. <a href="privacy.html">Learn more</a></p>
      </div>
      <div class="analytics-consent-actions">
        <button type="button" class="analytics-consent-decline" data-analytics-decline>${analyticsActive ? 'Turn off analytics' : 'Keep analytics off'}</button>
        <button type="button" class="analytics-consent-allow" data-analytics-allow>${analyticsActive ? 'Keep analytics on' : 'Turn analytics on'}</button>
      </div>`;
    document.body.appendChild(banner);
    banner.querySelector('[data-analytics-allow]').addEventListener('click', () => {
      analytics.setConsent('granted');
      removeConsentUi();
    });
    banner.querySelector('[data-analytics-decline]').addEventListener('click', () => {
      analytics.setConsent('denied');
      removeConsentUi();
    });
  }

  function showPrivacyChoices() {
    showConsentUi();
  }

  function addPrivacyChoicesLink() {
    if (document.querySelector('[data-analytics-open]')) return;
    injectStyles();
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'analytics-privacy-link';
    link.dataset.analyticsOpen = 'true';
    link.textContent = 'Privacy choices';
    link.addEventListener('click', showPrivacyChoices);
    document.body.appendChild(link);
  }

  function trackPageInteractions() {
    const util = window.PCC.util;
    if (!util) return;

    const servicePages = {
      '/residential.html': 'residential',
      '/recurring-cleaning.html': 'recurring',
      '/deep-cleaning.html': 'deep',
      '/move-in-out.html': 'move',
      '/commercial.html': 'commercial',
      '/office-cleaning.html': 'office',
      '/janitorial-services.html': 'janitorial',
      '/property-management.html': 'property_management',
    };
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (servicePages[path]) util.track('service_page_viewed', { service_type: servicePages[path] });

    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.addEventListener('click', () => util.track('email_click', { link_location: path }));
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.addEventListener('click', () => util.track('phone_click', { link_location: path }));
    });
    document.querySelectorAll('a, button').forEach(control => {
      if (control.matches('[data-analytics-open], [data-analytics-allow], [data-analytics-decline], [data-analytics-close]')) return;
      const label = String(control.getAttribute('aria-label') || control.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      if (!label || !/quote|estimate|walkthrough|apply|application|book|schedule|contact|start|learn more|request/i.test(label)) return;
      control.addEventListener('click', () => {
        const href = control.getAttribute('href') || '';
        let target = '';
        try { target = href ? new URL(href, window.location.href).pathname : ''; } catch (_) { target = ''; }
        util.track('cta_click', { cta_text: label, cta_target: target || 'button', cta_location: path });
      });
    });
  }

  analytics.getConsent = readConsent;
  analytics.setConsent = value => {
    if (value !== 'granted' && value !== 'denied') return readConsent();
    if (value === 'granted' && hasGlobalPrivacyControl()) return 'denied';
    writeConsent(value);
    if (value === 'granted') loadConfiguredVendors();
    else {
      updateLoadedVendorConsent('denied');
      clearAnalyticsCookies();
      removeConsentUi();
    }
    return value;
  };
  analytics.openConsent = showPrivacyChoices;
  analytics.loaded = analytics.loaded || { ga4: false, clarity: false };

  function init() {
    // Capture first-party campaign attribution immediately so it survives
    // navigation into a quote or application, even before an analytics choice.
    // This does not contact GA4 or Clarity.
    if (window.PCC.util?.getUTM) window.PCC.util.getUTM();
    if (readConsent() === 'granted') loadConfiguredVendors();
    if (hasConfiguredVendors()) addPrivacyChoicesLink();
    trackPageInteractions();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
