/* Shared NataBel navigation, footer, mobile actions, and schema injection. */
(function () {
  'use strict';
  if (!window.PCC) return;

  const B = window.PCC.business;
  const here = location.pathname.split('/').pop() || 'index.html';
  const residentialPages = ['residential.html', 'deep-cleaning.html', 'move-in-out.html'];
  const commercialPages = ['commercial.html', 'office-cleaning.html', 'janitorial-services.html', 'property-management.html'];
  const serviceHubPages = ['services.html', 'recurring-cleaning.html'];

  const active = pages => pages.includes(here) ? ' aria-current="page"' : '';
  const header = `
    <header class="site-header" id="siteHeader">
      <div class="container container-wide">
        <div class="bar">
          <a href="index.html" class="brand brand-logo-link" aria-label="${B.name} — home">
            <img src="assets/logo-wordmark.png" alt="${B.name}" class="brand-logo brand-logo-header" width="240" height="115" />
          </a>
          <nav class="nav" aria-label="Primary">
            <a href="services.html"${active(serviceHubPages)}>Services</a>
            <a href="residential.html"${active(residentialPages)}>Residential</a>
            <a href="commercial.html"${active(commercialPages)}>Commercial</a>
            <a href="about.html"${active(['about.html'])}>About</a>
            <a href="contact.html"${active(['contact.html'])}>Contact</a>
          </nav>
          <div class="header-cta">
            <a href="${B.phoneHref}" class="phone-link" aria-label="Call ${B.phone}"><i data-lucide="phone"></i><span>${B.phone}</span></a>
            <a href="free-estimate.html" class="btn btn-brass btn-sm">Instant Estimate</a>
            <button class="menu-toggle" aria-label="Open menu" aria-controls="mobileMenu" aria-expanded="false"><i data-lucide="menu"></i></button>
          </div>
        </div>
      </div>
    </header>`;

  const mobileMenu = `
    <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
    <aside class="mobile-menu" id="mobileMenu" aria-label="Mobile navigation">
      <div class="mm-header">
        <a href="index.html" class="brand brand-logo-link"><img src="assets/logo-wordmark.png" alt="${B.name}" class="brand-logo brand-logo-sm" width="220" height="106" /></a>
        <button class="menu-toggle mm-close" aria-label="Close menu"><i data-lucide="x"></i></button>
      </div>
      <nav>
        <a href="index.html"${active(['index.html'])}>Home</a>
        <a href="services.html"${active(serviceHubPages)}>All Services</a>
        <a href="residential.html"${active(residentialPages)}>Residential</a>
        <a href="commercial.html"${active(commercialPages)}>Commercial</a>
        <a href="about.html"${active(['about.html'])}>About Fatima</a>
        <a href="service-areas.html"${active(['service-areas.html'])}>Service Areas</a>
        <a href="faq.html"${active(['faq.html'])}>FAQ</a>
        <a href="contact.html"${active(['contact.html'])}>Contact</a>
        <a href="free-estimate.html"${active(['free-estimate.html'])}>Instant Estimate</a>
      </nav>
      <div class="mm-cta">
        <a href="${B.phoneHref}" class="btn btn-outline btn-block"><i data-lucide="phone"></i> Call ${B.phone}</a>
        <a href="free-estimate.html" class="btn btn-brass btn-block">Get My Estimate</a>
      </div>
    </aside>`;

  const mobileCta = `
    <nav class="mobile-cta-bar" aria-label="Quick actions">
      <a href="${B.phoneHref}" aria-label="Call ${B.phone}"><i data-lucide="phone"></i><span>Call</span></a>
      <a href="free-estimate.html" class="cta-primary" aria-label="Get an instant estimate"><i data-lucide="calculator"></i><span>Estimate</span></a>
    </nav>`;

  const trustRibbon = `
    <section class="trust-ribbon" aria-label="NataBel promises">
      <div class="container container-wide">
        <div class="trust-ribbon-grid">
          <div class="tr-item"><span class="tr-num">Founder-led <i data-lucide="user-round"></i></span><span class="tr-lbl">Fatima stands behind every clean</span></div>
          <div class="tr-item"><span class="tr-num">24 hours <i data-lucide="refresh-ccw"></i></span><span class="tr-lbl">Pristine Guarantee re-clean window</span></div>
          <div class="tr-item"><span class="tr-num">Rocklin local <i data-lucide="map-pin"></i></span><span class="tr-lbl">Serving Placer County communities</span></div>
        </div>
      </div>
    </section>`;

  const socials = Object.entries({
    google: ['Google Business Profile', 'map-pin'],
    yelp: ['Yelp', 'star'],
    facebook: ['Facebook', 'facebook'],
    instagram: ['Instagram', 'instagram']
  }).filter(([key]) => ((window.PCC.social || {})[key] || '').trim())
    .map(([key, meta]) => `<a href="${window.PCC.social[key].trim()}" aria-label="${meta[0]}" target="_blank" rel="noopener"><i data-lucide="${meta[1]}"></i></a>`).join('');

  const footer = `
    <footer class="site-footer">
      <div class="container container-wide">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="brand brand-logo-link"><img src="assets/logo-wordmark.png" alt="${B.name}" class="brand-logo brand-logo-footer" width="280" height="134" /></a>
            <p style="color:rgba(247,243,235,.62);font-size:.92rem;max-width:38ch;margin-top:16px;">Founder-led residential and commercial cleaning for Rocklin and surrounding Placer County communities.</p>
            ${socials ? `<div class="footer-social" style="margin-top:20px;">${socials}</div>` : ''}
          </div>
          <div><h4>Services</h4><div class="footer-links">
            <a href="services.html">All Services</a><a href="residential.html">Residential</a><a href="commercial.html">Commercial</a><a href="deep-cleaning.html">Deep Cleaning</a><a href="move-in-out.html">Move-In / Out</a><a href="recurring-cleaning.html">Recurring</a>
          </div></div>
          <div><h4>Helpful</h4><div class="footer-links">
            <a href="about.html">About Fatima</a><a href="service-areas.html">Service Areas</a><a href="faq.html">FAQ</a><a href="contact.html">Contact</a><a href="join-our-team.html">Join Our Team</a>
          </div></div>
          <div><h4>Start Here</h4><div class="footer-contact">
            <a href="free-estimate.html"><i data-lucide="calculator"></i> Instant Estimate</a>
            <a href="${B.phoneHref}"><i data-lucide="phone"></i> ${B.phone}</a>
            <a href="mailto:${B.email}"><i data-lucide="mail"></i> ${B.email}</a>
            <span style="display:flex;gap:11px;color:rgba(247,243,235,.62);font-size:.92rem;"><i data-lucide="clock" style="color:var(--brass-bright);"></i> Mon–Fri 7a–6p · Sat 8a–4p</span>
          </div></div>
        </div>
        <div class="footer-bottom"><div>© ${new Date().getFullYear()} ${B.name}.</div><div>Rocklin, CA · Placer-first service area</div></div>
      </div>
    </footer>`;

  function inject(selector, html) {
    document.querySelectorAll(selector).forEach(element => { element.innerHTML = html; });
  }

  inject('[data-partial="header"]', header);
  inject('[data-partial="mobile-menu"]', mobileMenu);
  inject('[data-partial="mobile-cta"]', mobileCta);
  inject('[data-partial="footer"]', footer);
  inject('[data-partial="trust-ribbon"]', trustRibbon);

  const quoteTemplate = window.PCC.templates && window.PCC.templates.estimateFunnelCard;
  document.querySelectorAll('[data-partial="estimate-funnel"]').forEach(element => {
    if (quoteTemplate) element.innerHTML = quoteTemplate(element.dataset.leadSource || 'Instant Estimate');
  });

  const schemaEl = document.getElementById('page-schema');
  if (schemaEl) {
    try {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(JSON.parse(schemaEl.textContent));
      document.head.appendChild(script);
    } catch (error) {
      console.warn('page-schema JSON invalid', error);
    }
  }
})();
