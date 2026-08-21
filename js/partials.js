/* Shared NataBel navigation, footer, mobile actions, and schema injection. */
(function () {
  'use strict';
  if (!window.PCC) return;

  /* Final deployment polish is intentionally additive so the original design
     system remains intact and easy to roll back. */
  if (!document.querySelector('link[data-qa-polish]')) {
    const polish = document.createElement('link');
    polish.rel = 'stylesheet';
    polish.href = 'css/qa-polish.css?v=20260820-audit';
    polish.dataset.qaPolish = 'true';
    document.head.appendChild(polish);
  }

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
            <a href="join-our-team.html"${active(['join-our-team.html'])}>Career</a>
            <a href="contact.html"${active(['contact.html'])}>Contact</a>
          </nav>
          <div class="header-cta">
            <a href="${B.phoneHref}" class="header-call-btn" aria-label="Call NataBel at ${B.phone}"><i data-lucide="phone"></i><span class="header-call-label">Call Now</span><span class="header-call-number">${B.phone}</span></a>
            <a href="free-estimate.html" class="btn btn-brass btn-sm">Instant Quote</a>
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
        <a href="join-our-team.html"${active(['join-our-team.html'])}>Career</a>
        <a href="service-areas.html"${active(['service-areas.html'])}>Service Areas</a>
        <a href="faq.html"${active(['faq.html'])}>FAQ</a>
        <a href="contact.html"${active(['contact.html'])}>Contact</a>
        <a href="free-estimate.html"${active(['free-estimate.html'])}>Instant Quote</a>
      </nav>
      <div class="mm-cta">
        <a href="${B.phoneHref}" class="btn btn-outline btn-block"><i data-lucide="phone"></i> Call ${B.phone}</a>
        <a href="free-estimate.html" class="btn btn-brass btn-block">Get My Quote</a>
      </div>
    </aside>`;

  const mobileCta = `
    <nav class="mobile-cta-bar" aria-label="Quick actions">
      <a href="${B.phoneHref}" aria-label="Call ${B.phone}"><i data-lucide="phone"></i><span>Call</span></a>
      <a href="free-estimate.html" class="cta-primary" aria-label="Get an instant cleaning quote"><i data-lucide="calculator"></i><span>Quote</span></a>
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

  const socialIcons = {
    google: '<svg class="footer-social-icon footer-social-icon-google" viewBox="0 0 533.5 544.3" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M533.5 278.4c0-18.5-1.5-37-4.7-55.3H272.1v104.7h146.9c-6.1 33.9-25 62.5-53.2 81.6v67h85.9c50.4-46.4 81.8-114.9 81.8-198z"/><path fill="#34A853" d="M272.1 544.3c72.4 0 133.2-23.9 177.6-64.9l-85.9-67c-23.9 16-54.5 25.4-91.7 25.4-70.5 0-130.3-47.7-151.7-111.8H31.8v70.2c44.1 87.5 134.7 148.1 240.3 148.1z"/><path fill="#FBBC04" d="M120.4 326c-10.9-32.3-10.9-67.2 0-99.5v-70.2H31.8c-36.8 73.2-36.8 166.7 0 239.9l88.6-70.2z"/><path fill="#EA4335" d="M272.1 106.5c39.4-.6 77.3 14.2 106.4 41.2l79.2-79.2C404.7 24.1 342.1-.8 272.1 0 166.5 0 75.9 60.6 31.8 148.1l88.6 70.2c21.3-64.1 81.1-111.8 151.7-111.8z"/></svg>',
    yelp: '<svg class="footer-social-icon footer-social-icon-yelp" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="#FF1744"><path d="M30.8 4.7c2.1-.6 4.3.6 4.9 2.7l3.8 13.8c.5 1.8-.2 3.7-1.8 4.7l-8 5.4c-1.9 1.3-4.5.6-5.6-1.5l-7-13c-1.1-2-.3-4.5 1.8-5.5z"/><path d="M56.2 22.9c1.6 1.5 1.8 4 .3 5.6L46.1 39.2c-1.4 1.4-3.5 1.7-5.2.7l-7.8-4.4c-2.1-1.2-2.6-3.9-1.1-5.8L41 18.9c1.4-1.7 4-2 5.8-.7z"/><path d="M53.2 51.3c-.1 2.2-2 3.9-4.1 3.8l-14.3-.8c-1.9-.1-3.5-1.5-3.9-3.4l-1.9-9.4c-.5-2.4 1.3-4.6 3.7-4.6l14.2.2c2.2 0 4 1.8 4 4z"/><path d="M25.8 60.2c-2.1.8-4.4-.2-5.2-2.3l-5.3-13.3c-.7-1.7-.1-3.8 1.4-4.9l7.4-5.9c1.9-1.5 4.6-.9 5.8 1.2L37.2 47c1.1 1.9.5 4.4-1.5 5.5z"/><path d="M6.5 39.4c-1.8-1.3-2.2-3.8-.9-5.6l8.2-11.7c1.1-1.5 3.2-2.2 5-1.5l9.1 3.3c2.3.8 3.2 3.5 2.1 5.7l-6.3 12.7c-1 2-3.5 2.8-5.6 1.8z"/></g></svg>'
  };
  const socials = Object.entries({
    google: ['Google Business Profile', socialIcons.google],
    yelp: ['Yelp', socialIcons.yelp],
    facebook: ['Facebook', '<i data-lucide="facebook" aria-hidden="true"></i>'],
    instagram: ['Instagram', '<i data-lucide="instagram" aria-hidden="true"></i>']
  }).filter(([key]) => ((window.PCC.social || {})[key] || '').trim())
    .map(([key, meta]) => `<a href="${window.PCC.social[key].trim()}" aria-label="${meta[0]}" target="_blank" rel="noopener">${meta[1]}</a>`).join('');

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
            <a href="about.html">About Fatima</a><a href="service-areas.html">Service Areas</a><a href="faq.html">FAQ</a><a href="contact.html">Contact</a><a href="join-our-team.html">Join Our Team</a><a href="privacy.html">Privacy</a>
          </div></div>
          <div><h4>Start Here</h4><div class="footer-contact">
            <a href="free-estimate.html"><i data-lucide="calculator"></i> Instant Quote</a>
            <a href="contact.html?service=commercial&source=footer-start-here"><i data-lucide="building-2"></i> Commercial Walkthrough</a>
            <a href="${B.phoneHref}"><i data-lucide="phone"></i> ${B.phone}</a>
            <a href="mailto:${B.email}"><i data-lucide="mail"></i> ${B.email}</a>
            <span class="footer-hours"><i data-lucide="clock"></i> Mon–Fri 7a–6p · Sat 8a–4p</span>
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
    if (quoteTemplate) element.innerHTML = quoteTemplate(element.dataset.leadSource || 'Instant Quote');
  });

  const socialLinks = ['google', 'yelp']
    .map(key => String((window.PCC.social || {})[key] || '').trim())
    .filter(Boolean);
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${B.url}/#business`,
    name: B.name,
    url: B.url,
    telephone: B.phoneHref.replace('tel:', ''),
    email: B.email,
    foundingDate: B.founded,
    areaServed: (B.serviceAreas || []).map(area => ({ '@type': 'Place', name: `${area}, CA` })),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '16:00'
      }
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: B.geo?.lat,
      longitude: B.geo?.lng
    },
    sameAs: socialLinks.length ? socialLinks : undefined,
    founder: { '@type': 'Person', name: B.founder },
    address: {
      '@type': 'PostalAddress',
      addressLocality: B.addressLocality,
      addressRegion: B.addressRegion,
      postalCode: B.postalCode,
      addressCountry: 'US'
    }
  };

  if (!document.querySelector('script[data-business-schema]')) {
    const businessScript = document.createElement('script');
    businessScript.type = 'application/ld+json';
    businessScript.dataset.businessSchema = 'true';
    businessScript.textContent = JSON.stringify(localBusinessSchema);
    document.head.appendChild(businessScript);
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
    requestAnimationFrame(() => window.lucide.createIcons());
  }
})();