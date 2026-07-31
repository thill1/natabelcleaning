/* =========================================================================
   NATABEL PRISTINE CLEANING — Shared partials
   Injects sticky header, mobile menu, mobile CTA bar, footer.
   Uses Lucide icons via data-lucide="..." (initialized by motion.js).
   Active nav link auto-highlighted from current path.
   ========================================================================= */
(function () {
  'use strict';
  if (!window.PCC) return;
  const B = window.PCC.business;
  const PHONE_DISPLAY = B.phone;
  const PHONE_HREF = B.phoneHref;

  const NAV = [
    { label: 'Residential',   href: 'residential.html',      match: ['residential.html','deep-cleaning.html','move-in-out.html'] },
    { label: 'Commercial',    href: 'commercial.html',       match: ['commercial.html','office-cleaning.html','janitorial-services.html','property-management.html'] },
    { label: 'Recurring',     href: 'recurring-cleaning.html', match: ['recurring-cleaning.html'] },
    { label: 'Service Areas', href: 'service-areas.html',    match: ['service-areas.html'] },
    { label: 'Reviews',       href: 'reviews.html',          match: ['reviews.html'] },
    { label: 'FAQ',           href: 'faq.html',              match: ['faq.html'] },
    { label: 'About',         href: 'about.html',            match: ['about.html'] },
    { label: 'Contact',       href: 'contact.html',          match: ['contact.html'] },
  ];
  const here = (location.pathname.split('/').pop() || 'index.html');
  const navLink = (item) => {
    const active = item.match.includes(here) ? ' style="color:var(--brass-deep);background:var(--brass-soft);"' : '';
    return `<a href="${item.href}"${active}>${item.label}</a>`;
  };

  const header = `
  <header class="site-header" id="siteHeader">
    <div class="container container-wide">
      <div class="bar">
        <a href="index.html" class="brand brand-logo-link" aria-label="${B.name} — home">
          <img src="assets/logo-wordmark.png" alt="${B.name}" class="brand-logo brand-logo-header" width="240" height="115" />
        </a>
        <nav class="nav" aria-label="Primary">${NAV.map(navLink).join('')}</nav>
        <div class="header-cta">
          <a href="${PHONE_HREF}" class="phone-link" aria-label="Call ${PHONE_DISPLAY}">
            <i data-lucide="phone"></i><span>${PHONE_DISPLAY}</span>
          </a>
          <a href="free-estimate.html" class="btn btn-brass btn-sm" data-magnetic>Free Estimate</a>
          <button class="menu-toggle" aria-label="Open menu" aria-controls="mobileMenu" aria-expanded="false">
            <i data-lucide="menu"></i>
          </button>
        </div>
      </div>
    </div>
  </header>`;

  const mobileMenu = `
  <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
  <aside class="mobile-menu" id="mobileMenu" aria-label="Mobile navigation">
    <div class="mm-header">
      <a href="index.html" class="brand brand-logo-link">
        <img src="assets/logo-wordmark.png" alt="${B.name}" class="brand-logo brand-logo-sm" width="220" height="106" />
      </a>
      <button class="menu-toggle mm-close" aria-label="Close menu"><i data-lucide="x"></i></button>
    </div>
    <nav>
      <a href="index.html" ${here === 'index.html' ? 'aria-current="page" class="active"' : ''}>Home</a>
      <a href="residential.html" ${['residential.html','deep-cleaning.html','move-in-out.html'].includes(here) ? 'aria-current="page" class="active"' : ''}>Residential</a>
      <a href="commercial.html" ${['commercial.html','office-cleaning.html','janitorial-services.html','property-management.html'].includes(here) ? 'aria-current="page" class="active"' : ''}>Commercial</a>
      <a href="recurring-cleaning.html" ${here === 'recurring-cleaning.html' ? 'aria-current="page" class="active"' : ''}>Recurring Plans</a>
      <a href="service-areas.html" ${here === 'service-areas.html' ? 'aria-current="page" class="active"' : ''}>Service Areas</a>
      <a href="reviews.html" ${here === 'reviews.html' ? 'aria-current="page" class="active"' : ''}>Reviews</a>
      <a href="about.html" ${here === 'about.html' ? 'aria-current="page" class="active"' : ''}>About Fatima</a>
      <a href="faq.html" ${here === 'faq.html' ? 'aria-current="page" class="active"' : ''}>FAQ</a>
      <a href="contact.html" ${here === 'contact.html' ? 'aria-current="page" class="active"' : ''}>Contact</a>
    </nav>
    <div class="mm-cta">
      <a href="${PHONE_HREF}" class="btn btn-outline btn-block"><i data-lucide="phone"></i> Call ${PHONE_DISPLAY}</a>
      <a href="free-estimate.html" class="btn btn-brass btn-block">Get Free Estimate</a>
    </div>
  </aside>`;

  const mobileCtaBar = `
  <nav class="mobile-cta-bar" aria-label="Quick actions">
    <a href="${PHONE_HREF}" aria-label="Call now"><i data-lucide="phone"></i><span>Call</span></a>
    <a href="free-estimate.html" class="cta-primary" aria-label="Get a free estimate"><i data-lucide="droplets"></i><span>Free Estimate</span></a>
    <a href="book-online.html" aria-label="Book online"><i data-lucide="calendar-check"></i><span>Book</span></a>
  </nav>`;

  const promoBar = `
  <div class="promo-bar" role="region" aria-label="Promotion">
    <div class="container container-wide promo-inner">
      <p><i data-lucide="droplets"></i> <strong>Free estimates in 90 seconds</strong> <span class="promo-hide-sm">— premium cleaning for Rocklin &amp; Placer County homes and businesses.</span></p>
      <div class="promo-actions">
        <a href="free-estimate.html" class="btn btn-brass btn-sm">Get My Estimate</a>
        <button type="button" class="promo-close" aria-label="Dismiss promotion"><i data-lucide="x"></i></button>
      </div>
    </div>
  </div>`;

  const floatCta = `
  <aside class="float-cta" aria-label="Quick actions">
    <a href="free-estimate.html" class="float-cta-main btn btn-brass" data-magnetic>
      <i data-lucide="droplets"></i>
      <span>Free Estimate</span>
    </a>
    <a href="${PHONE_HREF}" class="float-cta-phone" aria-label="Call ${PHONE_DISPLAY}">
      <i data-lucide="phone"></i>
    </a>
  </aside>`;

  const trustRibbon = `
  <section class="trust-ribbon" aria-label="Trust indicators">
    <div class="container container-wide">
      <div class="trust-ribbon-brand">
        <img src="assets/logo-wordmark.png" alt="${B.name}" class="brand-logo brand-logo-trust" width="220" height="106" />
      </div>
      <div class="trust-ribbon-grid">
        ${(window.PCC.trust && window.PCC.trust.promises ? window.PCC.trust.promises : []).map(p => `
        <div class="tr-item"><span class="tr-num">${p.num} <i data-lucide="${p.icon}"></i></span><span class="tr-lbl">${p.label}</span></div>`).join('')}
      </div>
    </div>
  </section>`;

  /* Social icons — only profiles with a real URL are rendered.
     A blank entry in PCC.social is skipped entirely rather than linking
     to a dead page. */
  const SOCIAL_META = {
    google:    { label: 'Google Business Profile', icon: 'map-pin' },
    yelp:      { label: 'Yelp', icon: 'star' },
    facebook:  { label: 'Facebook', icon: 'facebook' },
    instagram: { label: 'Instagram', icon: 'instagram' },
  };
  const socialLinks = Object.keys(SOCIAL_META)
    .filter(k => ((window.PCC.social || {})[k] || '').trim())
    .map(k => `<a href="${window.PCC.social[k].trim()}" aria-label="${SOCIAL_META[k].label}" target="_blank" rel="noopener"><i data-lucide="${SOCIAL_META[k].icon}"></i></a>`)
    .join('');

  const year = new Date().getFullYear();
  const footer = `
  <footer class="site-footer">
    <div class="container container-wide">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="brand brand-logo-link" style="margin-bottom:16px;">
            <img src="assets/logo-wordmark.png" alt="${B.name}" class="brand-logo brand-logo-footer" width="280" height="134" />
          </a>
          <p style="color:rgba(247,243,235,.62);font-size:.92rem;max-width:40ch;">${B.description}</p>
          ${socialLinks ? `<div class="footer-social" style="margin-top:20px;">${socialLinks}</div>` : ''}
        </div>
        <div>
          <h4>Services</h4>
          <div class="footer-links">
            <a href="commercial.html">Commercial Cleaning</a>
            <a href="office-cleaning.html">Office Cleaning</a>
            <a href="janitorial-services.html">Janitorial Services</a>
            <a href="residential.html">Residential Cleaning</a>
            <a href="deep-cleaning.html">Deep Cleaning</a>
            <a href="move-in-out.html">Move-In / Move-Out</a>
            <a href="recurring-cleaning.html">Recurring Plans</a>
            <a href="property-management.html">Property Management</a>
          </div>
        </div>
        <div>
          <h4>Company</h4>
          <div class="footer-links">
            <a href="about.html">About Fatima</a>
            <a href="reviews.html">Reviews</a>
            <a href="service-areas.html">Service Areas</a>
            <a href="faq.html">FAQ</a>
            <a href="free-estimate.html">Free Estimate</a>
            <a href="book-online.html">Book Online</a>
            <a href="contact.html">Contact</a>
          </div>
        </div>
        <div>
          <h4>Get in Touch</h4>
          <div class="footer-contact">
            <a href="${PHONE_HREF}"><i data-lucide="phone"></i> ${PHONE_DISPLAY}</a>
            <a href="mailto:${B.email}"><i data-lucide="mail"></i> ${B.email}</a>
            <span style="display:flex;align-items:flex-start;gap:11px;color:rgba(247,243,235,.62);font-size:.92rem;"><i data-lucide="map-pin" style="color:var(--brass-bright);flex-shrink:0;margin-top:3px;"></i> Serving ${B.addressLocality} &amp; surrounding communities</span>
            <span style="display:flex;align-items:flex-start;gap:11px;color:rgba(247,243,235,.62);font-size:.92rem;"><i data-lucide="clock" style="color:var(--brass-bright);flex-shrink:0;margin-top:3px;"></i> Mon–Fri 7a–6p · Sat 8a–4p</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div>© ${year} ${B.name}. Licensed &amp; insured. ${B.licenseNumber}.</div>
        <div>Rocklin, CA · Serving Placer &amp; Sacramento Counties</div>
      </div>
    </div>
  </footer>`;

  function inject(sel, html) {
    document.querySelectorAll(sel).forEach(el => { el.innerHTML = html; });
  }
  inject('[data-partial="header"]', header);
  inject('[data-partial="mobile-menu"]', mobileMenu);
  inject('[data-partial="mobile-cta"]', mobileCtaBar);
  inject('[data-partial="footer"]', footer);
  inject('[data-partial="trust-ribbon"]', trustRibbon);

  /* Shared estimate funnel (single source: funnel-template.js) */
  const funnelTpl = window.PCC.templates && window.PCC.templates.estimateFunnelCard;
  document.querySelectorAll('[data-partial="estimate-funnel"]').forEach(el => {
    if (!funnelTpl) return;
    const source = el.dataset.leadSource || 'Website Estimate Funnel';
    let html = funnelTpl(source);
    const reveal = el.dataset.funnelReveal;
    if (reveal !== undefined) {
      html = html.replace('class="funnel-card"', `class="funnel-card reveal${reveal ? ' ' + reveal : ''}"`);
    }
    el.innerHTML = html;
  });

  document.querySelectorAll('[data-partial="header"]').forEach(el => {
    if (!document.querySelector('.promo-bar')) el.insertAdjacentHTML('beforebegin', promoBar);
  });
  if (!document.querySelector('.float-cta')) document.body.insertAdjacentHTML('beforeend', floatCta);

  /* Page-specific JSON-LD schema injection */
  const schemaEl = document.getElementById('page-schema');
  if (schemaEl) {
    try {
      const data = JSON.parse(schemaEl.textContent);
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    } catch (e) { console.warn('page-schema JSON invalid', e); }
  }
})();
