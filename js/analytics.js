/* =========================================================================
   NATABEL PRISTINE CLEANING — Analytics loader

   Reads IDs from PCC.analytics and loads only what is configured:
     ga4Id           e.g. 'G-XXXXXXXXXX'  — Google Analytics 4
     adsId           e.g. 'AW-123456789'  — Google Ads (conversion tracking)
     facebookPixelId e.g. '123456789012345'

   If a field is blank the corresponding tag is never loaded and no network
   request is made. With all three blank this file does nothing at all.

   Conversion events are fired from PCC.util.track() in config.js, which
   calls gtag()/fbq() once they exist. Both vendor snippets define their
   queue function synchronously, so events fired before the remote script
   finishes downloading are queued rather than lost.
   ========================================================================= */
(function () {
  'use strict';
  if (!window.PCC || !window.PCC.analytics) return;

  const a = window.PCC.analytics;
  const ga4 = (a.ga4Id || '').trim();
  const ads = (a.adsId || '').trim();
  const pixel = (a.facebookPixelId || '').trim();

  // Ignore obvious placeholders so a half-filled config can't half-load a tag
  const isReal = (v, prefix) => !!v && !/^(YOUR|TODO|XXX)/i.test(v) && (!prefix || v.indexOf(prefix) === 0);

  const useGa4 = isReal(ga4, 'G-');
  const useAds = isReal(ads, 'AW-');
  const usePixel = isReal(pixel) && /^\d{6,}$/.test(pixel);

  /* ---------- Google (GA4 + Ads share one gtag.js) ---------- */
  if (useGa4 || useAds) {
    window.dataLayer = window.dataLayer || [];
    // Must be a real function declaration — gtag relies on `arguments`
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    if (useGa4) window.gtag('config', ga4);
    if (useAds) window.gtag('config', ads);

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(useGa4 ? ga4 : ads);
    s.onerror = function () { console.warn('[PCC analytics] gtag.js failed to load'); };
    document.head.appendChild(s);
  }

  /* ---------- Meta (Facebook) Pixel ---------- */
  if (usePixel) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', pixel);
    window.fbq('track', 'PageView');
  }

  // Small hook so we can confirm what loaded when testing
  window.PCC.analytics.loaded = { ga4: useGa4, ads: useAds, pixel: usePixel };
})();
