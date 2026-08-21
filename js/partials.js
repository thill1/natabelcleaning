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
    yelp: '<svg class="footer-social-icon footer-social-icon-yelp" viewBox="0 0 14 19" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path fill="#FF1A1A" d="M4.606 11.38l.801-.186a.824.824 0 00.079-.02.883.883 0 00.631-1.052l-.003-.015a.88.88 0 00-.136-.297 1.116 1.116 0 00-.327-.28 3.026 3.026 0 00-.465-.215l-.878-.32a82.459 82.459 0 00-1.484-.536c-.323-.115-.596-.215-.833-.289-.045-.014-.095-.027-.135-.041-.287-.088-.489-.125-.66-.126a.786.786 0 00-.333.06.85.85 0 00-.288.206c-.04.046-.078.093-.114.143a1.685 1.685 0 00-.168.336 4.547 4.547 0 00-.24 1.494c.004.46.016 1.05.27 1.449a.853.853 0 00.24.26c.18.124.361.14.55.154.283.02.557-.05.83-.112l2.661-.614h.002zm8.935-4.25a4.55 4.55 0 00-.87-1.24 1.725 1.725 0 00-.299-.228 1.699 1.699 0 00-.164-.078.787.787 0 00-.675.034c-.153.076-.319.198-.538.402-.03.03-.069.064-.103.096-.181.17-.383.38-.623.625-.37.374-.736.751-1.098 1.132l-.65.673a3.026 3.026 0 00-.323.397c-.082.119-.14.253-.171.395a.881.881 0 00.008.327c0 .005.002.01.003.014a.883.883 0 001.029.669.836.836 0 00.08-.016l3.462-.8c.273-.062.55-.12.795-.262.165-.095.321-.19.428-.38a.853.853 0 00.102-.34c.053-.471-.194-1.006-.393-1.42zM7.344 8.586c.25-.315.25-.785.272-1.168.075-1.282.154-2.565.216-3.847.024-.486.076-.966.047-1.455-.025-.404-.028-.868-.283-1.2C7.145.333 6.184.38 5.529.472a6.307 6.307 0 00-.602.113c-.2.048-.397.1-.59.162-.629.206-1.513.584-1.662 1.308-.085.41.116.828.271 1.202.188.452.446.86.68 1.287.62 1.125 1.251 2.243 1.88 3.363.188.334.393.757.757.93a.78.78 0 00.073.028.88.88 0 00.95-.219.786.786 0 00.058-.06zm-.301 3.431a.801.801 0 00-1.16-.156 2.077 2.077 0 00-.376.385c-.028.035-.054.082-.087.113l-.557.765c-.315.429-.627.859-.935 1.295-.201.282-.375.52-.513.731-.026.04-.053.084-.078.12-.165.254-.258.44-.306.606a.791.791 0 00-.033.342.85.85 0 00.119.338c.033.052.07.102.108.15a1.694 1.694 0 00.28.257c.384.267.805.46 1.248.608.368.122.751.195 1.139.217a1.735 1.735 0 00.38-.03c.06-.014.118-.03.177-.051a.863.863 0 00.302-.192.793.793 0 00.184-.29c.064-.16.107-.363.134-.665l.013-.142c.022-.25.032-.545.048-.891.027-.533.048-1.063.064-1.595l.036-.946a2.27 2.27 0 00-.06-.675 1.01 1.01 0 00-.127-.294zm6.289 1.478c-.116-.127-.28-.254-.54-.411-.038-.02-.082-.049-.123-.073-.216-.13-.477-.267-.781-.432a87.6 87.6 0 00-1.409-.754l-.834-.442c-.044-.013-.088-.044-.128-.064a2.078 2.078 0 00-.507-.18 1.067 1.067 0 00-.304-.013.802.802 0 00-.668.662.992.992 0 00.011.317c.041.222.14.442.243.634l.446.834c.249.47.5.939.757 1.405.167.304.305.565.434.78.025.041.053.085.074.122.157.26.284.423.412.54a.81.81 0 00.292.179.864.864 0 00.357.04c.061-.008.122-.018.182-.032a1.776 1.776 0 00.354-.14c.338-.19.65-.423.928-.694.333-.328.627-.685.856-1.093.032-.058.06-.118.083-.18.021-.057.04-.116.055-.175.014-.06.024-.12.031-.182a.86.86 0 00-.04-.355.792.792 0 00-.18-.293z"/></svg>'
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