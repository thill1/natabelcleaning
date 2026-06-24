/* =========================================================================
   Natabel page generator — one-off build tool.
   Generates all interior pages from a shared template + per-page data.
   Run: node build-pages.js
   Safe to delete after running.
   ========================================================================= */
const fs = require('fs');
const path = require('path');

const VENDOR = `
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
  <!-- Lenis removed — using native CSS smooth scroll -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="js/partials.js"></script>
  <script src="js/leads.js"></script>
  <script src="js/funnel.js"></script>
  <script src="js/main.js"></script>
  <script src="js/motion.js" defer></script>`;

const HEAD = (p) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${p.title}</title>
  <meta name="description" content="${p.desc}" />
  <link rel="canonical" href="https://www.natabelcleaning.com/${p.slug}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${p.ogTitle}" />
  <meta property="og:description" content="${p.ogDesc}" />
  <meta property="og:url" content="https://www.natabelcleaning.com/${p.slug}" />
  <meta property="og:image" content="https://www.natabelcleaning.com/assets/og-image.jpg" />
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
  <meta name="theme-color" content="#0B3D2E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/styles.css" />
  <noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>
  <script src="js/config.js"></script>
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <div data-partial="header"></div>
  <div data-partial="mobile-menu"></div>
  <main id="main">`;

const FOOT = (schema) => `
  </main>
  <div data-partial="footer"></div>
  <div data-partial="mobile-cta"></div>
  ${schema ? `<script type="application/json" id="page-schema">${schema}</script>` : ''}
  ${VENDOR}
</body>
</html>`;

/* Shared section builders */
const cta = (h1Italic, body, primary, secondary, primaryHref, secondaryHref, primaryIcon='sparkles', secondaryIcon='phone') => `
    <section class="section">
      <div class="container">
        <div class="cta-banner reveal">
          <div class="section-head" style="max-width:680px;">
            <h2>${h1Italic}</h2>
            <p>${body}</p>
          </div>
          <div class="btn-row" style="margin-top:30px;">
            <a href="${primaryHref}" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="${primaryIcon}"></i> ${primary}</a>
            ${secondary ? `<a href="${secondaryHref}" class="btn ${secondaryHref.indexOf('tel:')===0 ? 'btn-ghost-light' : 'btn-ivory'} btn-lg"><i data-lucide="${secondaryIcon}"></i> ${secondary}</a>` : ''}
          </div>
        </div>
      </div>
    </section>`;

const checkList = (items) => items.map(i => `<div class="feat-item"><span class="feat-check"><i data-lucide="check"></i></span><p>${i}</p></div>`).join('');

/* ---------- PAGE DATA + BODY ---------- */
const pages = [];

/* ============ COMMERCIAL ============ */
pages.push({
  slug: 'commercial.html',
  overwrite: true,
  title: 'Commercial Cleaning Sacramento | Recurring Office & Janitorial | Natabel',
  desc: 'Recurring commercial cleaning for Sacramento businesses. Office cleaning, janitorial service, restroom sanitation, floor care, post-construction. Walkthrough-based pricing, after-hours service, custom scopes. Free quotes.',
  ogTitle: 'Recurring Commercial Cleaning for Sacramento Businesses',
  ogDesc: 'Offices, retail, medical, property management. Walkthrough-based pricing, after-hours service, custom scopes.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"Service","serviceType":"Commercial Cleaning","provider":{"@id":"https://www.natabelcleaning.com/#business"},"areaServed":"Sacramento, CA"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Commercial Cleaning","item":"https://www.natabelcleaning.com/commercial.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>Commercial Cleaning</span></div>
        <span class="pill pill-brass reveal" style="margin-bottom:16px;">Recurring Accounts · Commercial Priority</span>
        <h1 class="reveal" style="max-width:900px;">Commercial cleaning,<br /><span class="serif-italic">engineered for Sacramento businesses.</span></h1>
        <p class="lead reveal" style="max-width:680px;">Clean, professional, healthy spaces — kept that way through recurring cleaning plans, custom scopes of work, reliable after-hours availability, and walkthrough-based quotes built around your facility's real needs.</p>
        <div class="hero-ctas reveal">
          <a href="free-estimate.html?service=commercial" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="building-2"></i> Schedule a Walkthrough</a>
          <a href="free-estimate.html?service=commercial" class="btn btn-outline btn-lg">Request a Recurring Quote</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head text-center reveal" style="margin-bottom:48px;">
          <span class="h-eyebrow center">Who We Serve</span>
          <h2>Built for Sacramento's<br /><span class="serif-italic">professional spaces.</span></h2>
          <p class="lead mx-auto">From single-suite offices to multi-tenant commercial buildings, we tailor crew size, schedule, and scope to your environment.</p>
        </div>
        <div class="grid-4">
          <div class="card reveal"><div class="card-icon"><i data-lucide="building-2"></i></div><h3>Offices</h3><p>Workstations, conference rooms, kitchens, and restrooms kept spotless for staff and clients.</p></div>
          <div class="card reveal d1"><div class="card-icon brass"><i data-lucide="key-round"></i></div><h3>Property Managers</h3><p>Turnover cleans, common areas, and maintenance cleaning across your portfolio.</p></div>
          <div class="card reveal d2"><div class="card-icon"><i data-lucide="shopping-bag"></i></div><h3>Retail Spaces</h3><p>Customer-facing storefronts, fitting rooms, and display areas polished daily.</p></div>
          <div class="card reveal d3"><div class="card-icon brass"><i data-lucide="briefcase"></i></div><h3>Professional Buildings</h3><p>Lobbies, elevators, hallways, and shared facilities maintained to a high standard.</p></div>
        </div>
      </div>
    </section>

    <section class="section bg-soft">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="h-eyebrow">Full-Service Commercial Cleaning</span>
            <h2>Everything your facility needs,<br /><span class="serif-italic">one trusted partner.</span></h2>
            <p class="lead">No juggling multiple vendors. No gaps in coverage. One dedicated team, one accountable point of contact, and a scope of work built around exactly what your space requires.</p>
            <div class="feat-list">${checkList([
              '<strong>Office &amp; suite cleaning</strong> — workstations, conference rooms, glass, floors.',
              '<strong>Restroom sanitation</strong> — full disinfection, restocking, and detailing.',
              '<strong>Breakroom &amp; kitchen</strong> — counters, appliances, sinks, microwaves, floors.',
              '<strong>Floor care</strong> — vacuuming, mopping, hard-floor maintenance, periodic scrubbing.',
              '<strong>Lobby &amp; reception</strong> — first impressions, glass, entryways, waiting areas.',
              '<strong>Trash &amp; recycling removal</strong> — consistent, thorough, on schedule.',
              '<strong>Post-construction</strong> — dust, debris, and detail cleans after build-outs.',
            ])}</div>
            <a href="free-estimate.html?service=commercial" class="btn btn-brass btn-lg" data-magnetic>Get a Custom Commercial Quote</a>
          </div>
          <div class="reveal d1">
            <div class="side-cta">
              <h3>Commercial recurring options</h3>
              <p>Schedules built around your facility's traffic and standards.</p>
              <div style="display:grid;gap:10px;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Nightly cleaning</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> 2× per week</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Weekly service</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Custom schedule</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> After-hours access</div>
              </div>
              <a href="free-estimate.html?service=commercial" class="btn btn-brass btn-block">Build My Cleaning Plan</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head text-center reveal" style="margin-bottom:48px;">
          <span class="h-eyebrow center">How Commercial Onboarding Works</span>
          <h2>From walkthrough to recurring service</h2>
        </div>
        <div class="steps">
          <div class="step reveal"><div class="step-num">1</div><h3>Schedule a walkthrough</h3><p>We visit your facility, learn your standards, assess square footage, traffic patterns, restrooms, and special requirements.</p></div>
          <div class="step reveal d1"><div class="step-num">2</div><h3>Receive a custom scope of work</h3><p>A transparent, fixed proposal built around your actual needs — not a template. Clear pricing, clear deliverables.</p></div>
          <div class="step reveal d2"><div class="step-num">3</div><h3>Start recurring service</h3><p>A dedicated crew delivers consistent results on schedule, with a single point of contact for fast communication.</p></div>
        </div>
      </div>
    </section>

    <section class="section bg-emerald">
      <div class="container">
        <div class="section-head text-center reveal" style="margin-bottom:48px;">
          <span class="h-eyebrow center">The Natabel Difference</span>
          <h2>Why Sacramento businesses<br /><span class="serif-italic">trust us with their spaces.</span></h2>
        </div>
        <div class="grid-3 reveal d1">
          <div class="card" style="background:rgba(247,243,235,.05);border-color:rgba(247,243,235,.10);"><div class="card-icon brass"><i data-lucide="building-2"></i></div><h3 style="color:var(--ivory);">Walkthrough-Based Pricing</h3><p style="color:rgba(247,243,235,.72);">Quotes reflect your actual facility — no inflated estimates, no surprise fees, no hidden line items.</p></div>
          <div class="card" style="background:rgba(247,243,235,.05);border-color:rgba(247,243,235,.10);"><div class="card-icon"><i data-lucide="clock"></i></div><h3 style="color:var(--ivory);">After-Hours Availability</h3><p style="color:rgba(247,243,235,.72);">Your business runs uninterrupted. We handle keys, alarms, and access professionally.</p></div>
          <div class="card" style="background:rgba(247,243,235,.05);border-color:rgba(247,243,235,.10);"><div class="card-icon brass"><i data-lucide="users"></i></div><h3 style="color:var(--ivory);">Dedicated Crews</h3><p style="color:rgba(247,243,235,.72);">Same team, every visit. They learn your space and your standards, not the other way around.</p></div>
        </div>
      </div>
    </section>
    ${cta('Ready for a cleaner,<br /><span class="serif-italic" style="color:var(--brass-bright);">healthier workplace?</span>', 'Schedule a walkthrough and get a custom scope of work within 1–3 business days. Or request a recurring quote in 90 seconds.', 'Schedule a Walkthrough', 'Call Now', 'free-estimate.html?service=commercial', 'tel:+19165550148', 'building-2', 'phone')}`
});

/* ============ OFFICE CLEANING ============ */
pages.push({
  slug: 'office-cleaning.html', overwrite: true,
  title: 'Office Cleaning Sacramento | Daily, Weekly & Nightly | Natabel',
  desc: 'Professional office cleaning in Sacramento. Daily, weekly, biweekly, and nightly office cleaning with consistent crews, detailed checklists, and after-hours availability. Free quotes for Sacramento offices.',
  ogTitle: 'Office Cleaning Sacramento — Daily, Weekly & Nightly',
  ogDesc: 'Consistent crews, detailed checklists, after-hours availability. Free quotes for Sacramento offices.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"Service","serviceType":"Office Cleaning","provider":{"@id":"https://www.natabelcleaning.com/#business"},"areaServed":"Sacramento, CA"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Commercial","item":"https://www.natabelcleaning.com/commercial.html"},{"@type":"ListItem","position":3,"name":"Office Cleaning","item":"https://www.natabelcleaning.com/office-cleaning.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><a href="commercial.html">Commercial</a><span class="sep">/</span><span>Office Cleaning</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Commercial · Offices</span>
        <h1 class="reveal">Office cleaning<br /><span class="serif-italic">in Sacramento.</span></h1>
        <p class="lead reveal">Daily, weekly, biweekly, or nightly office cleaning with consistent crews and detailed checklists. Your staff and clients walk into a spotless, healthy workspace — every single day.</p>
        <div class="hero-ctas reveal">
          <a href="free-estimate.html?service=commercial" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="sparkles"></i> Get a Free Office Quote</a>
          <a href="commercial.html" class="btn btn-outline btn-lg">Full Commercial Services</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="h-eyebrow">What's Included</span>
            <h2>A cleaner office,<br /><span class="serif-italic">inside and out.</span></h2>
            <p class="lead">From workstations to the breakroom, every surface your team touches gets consistent, professional attention.</p>
            <div class="feat-list">${checkList([
              '<strong>Workstations &amp; desks</strong> — dusting, sanitizing, trash, keyboard-safe cleaning.',
              '<strong>Conference &amp; meeting rooms</strong> — tables, chairs, glass, whiteboards, floors.',
              '<strong>Breakrooms &amp; kitchens</strong> — counters, sinks, microwave, fridge, floors, trash.',
              '<strong>Restrooms</strong> — full disinfection, restocking, mirrors, floors.',
              '<strong>Lobby &amp; reception</strong> — first impressions, glass, entryways, floors.',
              '<strong>Floor care</strong> — vacuuming, mopping, hard-floor maintenance.',
            ])}</div>
            <a href="free-estimate.html?service=commercial" class="btn btn-emerald btn-lg" data-magnetic>Request Office Cleaning Quote</a>
          </div>
          <div class="reveal d1">
            <div class="card" style="background:var(--emerald-tint);border-color:var(--emerald-line);">
              <h3 style="margin-bottom:14px;color:var(--emerald);">Office cleaning schedules</h3>
              <div style="display:grid;gap:12px;">
                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);"><strong>Nightly</strong><span class="muted">High-traffic offices</span></div>
                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);"><strong>2× / week</strong><span class="muted">Mid-size suites</span></div>
                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);"><strong>Weekly</strong><span class="muted">Smaller offices</span></div>
                <div style="display:flex;justify-content:space-between;padding:12px 0;"><strong>Custom</strong><span class="muted">Your cadence</span></div>
              </div>
              <a href="free-estimate.html?service=commercial" class="btn btn-brass btn-block" style="margin-top:20px;">Get Quote</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section bg-soft">
      <div class="container">
        <div class="section-head text-center reveal" style="margin-bottom:48px;">
          <span class="h-eyebrow center">Why It Matters</span>
          <h2>A clean office is<br /><span class="serif-italic">a productive office.</span></h2>
          <p class="lead mx-auto">Research consistently shows that clean workspaces reduce sick days, improve focus, and elevate how clients perceive your business.</p>
        </div>
        <div class="grid-3">
          <div class="card reveal"><div class="card-icon"><i data-lucide="heart-pulse"></i></div><h3>Healthier Team</h3><p>Regular disinfection of high-touch surfaces reduces the spread of illness through your office.</p></div>
          <div class="card reveal d1"><div class="card-icon brass"><i data-lucide="clock"></i></div><h3>Less Downtime</h3><p>Fewer sick days, fewer distractions, and a workspace that lets your team focus on real work.</p></div>
          <div class="card reveal d2"><div class="card-icon"><i data-lucide="star"></i></div><h3>Better Impressions</h3><p>Clients notice. A spotless lobby and conference room quietly signal professionalism.</p></div>
        </div>
      </div>
    </section>
    ${cta('Get your free<br /><span class="serif-italic" style="color:var(--brass-bright);">office cleaning quote.</span>', 'Tell us about your office and we\'ll build a custom quote — usually within one business hour.', 'Get Free Office Quote', 'Call Now', 'free-estimate.html?service=commercial', 'tel:+19165550148', 'sparkles', 'phone')}`
});

/* ============ JANITORIAL ============ */
pages.push({
  slug: 'janitorial-services.html', overwrite: true,
  title: 'Janitorial Services Sacramento | Contracted Commercial Janitorial | Natabel',
  desc: 'Contracted janitorial services for Sacramento offices, medical, retail, and commercial facilities. Restroom sanitation, floor care, trash removal, and full-scope cleaning on flexible schedules. Free janitorial quotes.',
  ogTitle: 'Janitorial Services Sacramento — Contracted Commercial Janitorial',
  ogDesc: 'Full-scope janitorial service on flexible schedules. Restrooms, floors, trash, sanitization.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"Service","serviceType":"Janitorial Services","provider":{"@id":"https://www.natabelcleaning.com/#business"},"areaServed":"Sacramento, CA"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Commercial","item":"https://www.natabelcleaning.com/commercial.html"},{"@type":"ListItem","position":3,"name":"Janitorial Services","item":"https://www.natabelcleaning.com/janitorial-services.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><a href="commercial.html">Commercial</a><span class="sep">/</span><span>Janitorial Services</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Commercial · Contracts</span>
        <h1 class="reveal">Janitorial services<br /><span class="serif-italic">in Sacramento.</span></h1>
        <p class="lead reveal">Contracted janitorial service for offices, medical facilities, retail, and commercial buildings. Full-scope cleaning — restrooms, floors, trash, dusting, sanitization — on a schedule that fits your facility.</p>
        <div class="hero-ctas reveal">
          <a href="free-estimate.html?service=commercial" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="sparkles"></i> Request a Janitorial Quote</a>
          <a href="commercial.html" class="btn btn-outline btn-lg">All Commercial Services</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="h-eyebrow">Contracted Janitorial Scope</span>
            <h2>Comprehensive coverage,<br /><span class="serif-italic">one accountable partner.</span></h2>
            <p class="lead">Janitorial contracts are flexible — month-to-month or annual — and cover everything your facility needs to stay clean, sanitary, and professional.</p>
            <div class="feat-list">${checkList([
              '<strong>Restroom sanitation</strong> — disinfection, restocking, mirrors, fixtures, floors.',
              '<strong>Trash &amp; recycling removal</strong> — collection, liner replacement, hauling.',
              '<strong>Floor care</strong> — vacuum, mop, sweep, hard-floor maintenance, periodic scrub/recoat.',
              '<strong>Dusting &amp; surface cleaning</strong> — desks, shelves, blinds, baseboards, vents.',
              '<strong>Disinfection &amp; sanitization</strong> — high-touch surfaces, door handles, light switches.',
              '<strong>Window &amp; glass</strong> — interior glass, entry doors, partitions.',
            ])}</div>
            <a href="free-estimate.html?service=commercial" class="btn btn-emerald btn-lg" data-magnetic>Get a Janitorial Contract Quote</a>
          </div>
          <div class="reveal d1">
            <div class="side-cta">
              <h3>Industries we service</h3>
              <p>Janitorial programs tailored to your facility type and compliance needs.</p>
              <div style="display:grid;gap:10px;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Offices &amp; corporate suites</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Medical &amp; dental offices</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Retail &amp; storefronts</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Gyms &amp; fitness centers</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Churches &amp; community spaces</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Multi-tenant buildings</div>
              </div>
              <a href="free-estimate.html?service=commercial" class="btn btn-brass btn-block">Request Quote</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section bg-soft">
      <div class="container">
        <div class="section-head text-center reveal" style="margin-bottom:48px;">
          <span class="h-eyebrow center">Flexible Contract Terms</span>
          <h2>Janitorial contracts<br /><span class="serif-italic">that work for you.</span></h2>
        </div>
        <div class="grid-3">
          <div class="card reveal"><div class="card-icon"><i data-lucide="calendar"></i></div><h3>Month-to-Month</h3><p>No long-term lock-in. Flexible terms that scale up or down with your needs.</p></div>
          <div class="card reveal d1"><div class="card-icon brass"><i data-lucide="shield-check"></i></div><h3>Annual Contracts</h3><p>Locked-in pricing and priority scheduling for facilities that want long-term stability.</p></div>
          <div class="card reveal d2"><div class="card-icon"><i data-lucide="repeat"></i></div><h3>Custom Schedules</h3><p>Nightly, weekly, multi-day — built around your traffic, hours, and compliance needs.</p></div>
        </div>
      </div>
    </section>
    ${cta('Need reliable<br /><span class="serif-italic" style="color:var(--brass-bright);">janitorial service?</span>', 'Get a contracted janitorial quote tailored to your facility — usually within one business hour.', 'Get Janitorial Quote', 'Call Now', 'free-estimate.html?service=commercial', 'tel:+19165550148', 'sparkles', 'phone')}`
});

/* ============ RESIDENTIAL ============ */
pages.push({
  slug: 'residential.html', overwrite: true,
  title: 'House Cleaning Sacramento | Residential Cleaning | Natabel',
  desc: 'Trustworthy residential cleaning in Sacramento. Recurring weekly & biweekly house cleaning, deep cleaning, apartment & condo cleaning, move-in/move-out. Vetted teams, flexible scheduling, free estimates.',
  ogTitle: 'House Cleaning Sacramento — Recurring & One-Time',
  ogDesc: 'Vetted teams, flexible scheduling, customizable checklists. Free estimates for Sacramento homes.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"Service","serviceType":"Residential Cleaning","provider":{"@id":"https://www.natabelcleaning.com/#business"},"areaServed":"Sacramento, CA"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Residential Cleaning","item":"https://www.natabelcleaning.com/residential.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>Residential Cleaning</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Residential · Homes</span>
        <h1 class="reveal">Residential cleaning<br /><span class="serif-italic">for Sacramento homes.</span></h1>
        <p class="lead reveal">Trustworthy, thorough, and genuinely friendly. Whether you want a recurring team that learns your home or a one-time deep clean before guests arrive, we make it easy to come home to a spotless space.</p>
        <div class="hero-ctas reveal">
          <a href="book-online.html" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="calendar-check"></i> Book Residential Cleaning</a>
          <a href="free-estimate.html?service=residential" class="btn btn-outline btn-lg">Get a Free Estimate</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="h-eyebrow">Why Sacramento Homeowners Choose Us</span>
            <h2>Reliable cleaning<br /><span class="serif-italic">you can actually trust.</span></h2>
            <div class="feat-list">${checkList([
              '<strong>Vetted, background-checked teams</strong> — the same friendly faces, every visit.',
              '<strong>Customizable checklists</strong> — tell us your priorities and we build the clean around them.',
              '<strong>Flexible scheduling</strong> — weekly, biweekly, monthly, or one-time. Pause anytime.',
              '<strong>We bring everything</strong> — professional supplies and equipment. You don\'t lift a finger.',
              '<strong>Easy booking &amp; communication</strong> — text, call, or book online in under two minutes.',
            ])}</div>
            <a href="book-online.html" class="btn btn-emerald btn-lg" data-magnetic>Book Your Cleaning</a>
          </div>
          <div class="reveal d1">
            <div class="card" style="background:var(--emerald-tint);border-color:var(--emerald-line);">
              <h3 style="margin-bottom:16px;color:var(--emerald);">What we clean</h3>
              <div style="display:grid;gap:10px;">
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Kitchens — counters, sink, appliances, floors</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Bathrooms — tub, shower, toilet, vanity, mirrors</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Living areas — dusting, vacuuming, mopping</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Bedrooms — dusting, linens (on request), floors</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Baseboards, doors, switches, vents</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Interior windows, blinds, ceiling fans</div>
              </div>
              <a href="book-online.html" class="btn btn-brass btn-block" style="margin-top:20px;">Book Now</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section bg-soft">
      <div class="container">
        <div class="section-head text-center reveal" style="margin-bottom:48px;">
          <span class="h-eyebrow center">Residential Services</span>
          <h2>Every kind<br /><span class="serif-italic">of home cleaning.</span></h2>
        </div>
        <div class="grid-4">
          <div class="card reveal"><div class="card-icon"><i data-lucide="home"></i></div><h3>Standard Cleaning</h3><p>Regular maintenance cleaning — kitchens, baths, living areas, floors.</p><div class="card-links"><a href="book-online.html">Book →</a></div></div>
          <div class="card reveal d1"><div class="card-icon brass"><i data-lucide="sparkles"></i></div><h3>Deep Cleaning</h3><p>Top-to-bottom detail — baseboards, blinds, inside appliances, fans.</p><div class="card-links"><a href="deep-cleaning.html">Learn more →</a></div></div>
          <div class="card reveal d2"><div class="card-icon"><i data-lucide="repeat"></i></div><h3>Recurring Plans</h3><p>Weekly, biweekly, or monthly — same team, locked rate.</p><div class="card-links"><a href="recurring-cleaning.html">Plans →</a></div></div>
          <div class="card reveal d3"><div class="card-icon brass"><i data-lucide="move-3d"></i></div><h3>Move-In / Move-Out</h3><p>Get your deposit back or start fresh in a spotless space.</p><div class="card-links"><a href="move-in-out.html">Learn more →</a></div></div>
        </div>
      </div>
    </section>
    ${cta('Book your residential<br /><span class="serif-italic" style="color:var(--brass-bright);">cleaning today.</span>', 'Free estimates, flexible scheduling, and a local team that actually shows up.', 'Book Residential Cleaning', 'Call Now', 'book-online.html', 'tel:+19165550148', 'calendar-check', 'phone')}`
});

/* ============ DEEP CLEANING ============ */
pages.push({
  slug: 'deep-cleaning.html',
  title: 'Deep Cleaning Sacramento | Top-to-Bottom Detail Cleaning | Natabel',
  desc: 'Deep cleaning service in Sacramento. Top-to-bottom detail cleaning — baseboards, blinds, inside appliances, grout, ceiling fans, hard-to-reach areas. Perfect for spring cleaning or resetting your space. Free quotes.',
  ogTitle: 'Deep Cleaning Sacramento — Top-to-Bottom Detail',
  ogDesc: 'Baseboards, blinds, inside appliances, grout, fans. The reset your space deserves.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"Service","serviceType":"Deep Cleaning","provider":{"@id":"https://www.natabelcleaning.com/#business"},"areaServed":"Sacramento, CA"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Deep Cleaning","item":"https://www.natabelcleaning.com/deep-cleaning.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><a href="residential.html">Residential</a><span class="sep">/</span><span>Deep Cleaning</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Residential · Top-to-Bottom</span>
        <h1 class="reveal">Deep cleaning,<br /><span class="serif-italic">down to the last detail.</span></h1>
        <p class="lead reveal">Our most thorough clean. Everything in a standard clean, plus baseboards, blinds, inside appliances, grout scrubbing, ceiling fans, and the hard-to-reach corners most cleaners miss.</p>
        <div class="hero-ctas reveal">
          <a href="free-estimate.html?service=deep" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="sparkles"></i> Get a Deep Cleaning Quote</a>
          <a href="residential.html" class="btn btn-outline btn-lg">All Residential Services</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="h-eyebrow">What's Included</span>
            <h2>The reset<br /><span class="serif-italic">your space deserves.</span></h2>
            <p class="lead">Perfect for spring cleaning, moving, post-renovation, or when your home just needs a fresh start. A full checklist is provided with every quote.</p>
            <div class="feat-list">${checkList([
              '<strong>Everything in a standard clean</strong> — kitchens, baths, living areas, floors.',
              '<strong>Baseboards &amp; door frames</strong> — wiped down, detail-cleaned.',
              '<strong>Blinds &amp; window sills</strong> — dusted and wiped.',
              '<strong>Inside appliances</strong> — oven, refrigerator, microwave (where accessible).',
              '<strong>Detailed bathroom scrubbing</strong> — grout, tile, fixtures, shower doors.',
              '<strong>Ceiling fans &amp; light fixtures</strong> — dusted and wiped.',
              '<strong>Hard-to-reach areas</strong> — behind/under furniture, high shelves, vents.',
            ])}</div>
            <a href="free-estimate.html?service=deep" class="btn btn-emerald btn-lg" data-magnetic>Book a Deep Clean</a>
          </div>
          <div class="reveal d1">
            <div class="side-cta">
              <h3>When to book a deep clean</h3>
              <p>The moments a deep clean pays for itself.</p>
              <div style="display:grid;gap:10px;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Before moving in or out</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> After a renovation</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Seasonal reset (spring/fall)</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> First clean before a recurring plan</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Before hosting guests</div>
              </div>
              <a href="free-estimate.html?service=deep" class="btn btn-brass btn-block">Get Quote</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${cta('Give your home<br /><span class="serif-italic" style="color:var(--brass-bright);">a fresh start.</span>', 'Book a deep clean and feel the difference meticulous attention makes.', 'Get Deep Cleaning Quote', 'Call Now', 'free-estimate.html?service=deep', 'tel:+19165550148', 'sparkles', 'phone')}`
});

/* ============ MOVE-IN / OUT ============ */
pages.push({
  slug: 'move-in-out.html',
  title: 'Move-In / Move-Out Cleaning Sacramento | Deposit-Safe | Natabel',
  desc: 'Move-in and move-out cleaning in Sacramento. Empty-unit top-to-bottom cleans — inside cabinets, appliances, closets. Get your deposit back or start fresh in a spotless space. Free quotes.',
  ogTitle: 'Move-In / Move-Out Cleaning Sacramento',
  ogDesc: 'Empty-unit deep cleans. Inside cabinets, appliances, closets. Get your deposit back.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"Service","serviceType":"Move In Move Out Cleaning","provider":{"@id":"https://www.natabelcleaning.com/#business"},"areaServed":"Sacramento, CA"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Move-In / Move-Out","item":"https://www.natabelcleaning.com/move-in-out.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><a href="residential.html">Residential</a><span class="sep">/</span><span>Move-In / Move-Out</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Residential · Turnover</span>
        <h1 class="reveal">Move-in &amp; move-out cleaning<br /><span class="serif-italic">that gets your deposit back.</span></h1>
        <p class="lead reveal">We clean empty units top-to-bottom — inside cabinets, appliances, and closets — so you get your full deposit back or start fresh in a genuinely spotless new home.</p>
        <div class="hero-ctas reveal">
          <a href="free-estimate.html?service=move" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="move-3d"></i> Get a Move-Out Quote</a>
          <a href="residential.html" class="btn btn-outline btn-lg">All Residential Services</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="h-eyebrow">What's Included</span>
            <h2>Empty-unit cleaning,<br /><span class="serif-italic">down to the inside of every cabinet.</span></h2>
            <div class="feat-list">${checkList([
              '<strong>Inside cabinets &amp; drawers</strong> — wiped, sanitized, ready for the next occupant.',
              '<strong>Inside appliances</strong> — oven, fridge, microwave, dishwasher.',
              '<strong>Inside closets</strong> — shelves, rods, baseboards.',
              '<strong>All rooms</strong> — walls (spot), baseboards, doors, switches, vents.',
              '<strong>Bathrooms</strong> — deep scrub of tub, shower, tile, grout, toilet, vanity.',
              '<strong>Kitchen</strong> — degrease, sanitize, detail every surface.',
              '<strong>Floors</strong> — vacuum, mop, hard-floor detail.',
              '<strong>Windows</strong> — interior glass, sills, tracks.',
            ])}</div>
            <a href="free-estimate.html?service=move" class="btn btn-emerald btn-lg" data-magnetic>Book Move-In / Move-Out</a>
          </div>
          <div class="reveal d1">
            <div class="card" style="background:var(--emerald-tint);border-color:var(--emerald-line);">
              <h3 style="margin-bottom:14px;color:var(--emerald);">Perfect for</h3>
              <div style="display:grid;gap:12px;">
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Renters moving out (deposit-safe)</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Homeowners moving in</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Landlords &amp; property managers</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check" style="color:var(--emerald);width:16px;height:16px;"></i> Airbnb / short-term turnover</div>
              </div>
              <a href="free-estimate.html?service=move" class="btn btn-brass btn-block" style="margin-top:20px;">Get Quote</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${cta('Moving soon?<br /><span class="serif-italic" style="color:var(--brass-bright);">Let us handle the clean.</span>', 'Get a move-in or move-out quote — usually within one business hour.', 'Get Move-Out Quote', 'Call Now', 'free-estimate.html?service=move', 'tel:+19165550148', 'move-3d', 'phone')}`
});

/* ============ RECURRING CLEANING ============ */
pages.push({
  slug: 'recurring-cleaning.html',
  title: 'Recurring Cleaning Plans Sacramento | Weekly, Biweekly, Monthly | Natabel',
  desc: 'Recurring cleaning plans in Sacramento. Weekly, biweekly, and monthly plans for homes and businesses. Same vetted team, locked-in rate, customizable checklists. Commercial nightly & custom schedules.',
  ogTitle: 'Recurring Cleaning Plans Sacramento — Weekly, Biweekly, Monthly',
  ogDesc: 'Lock in your team, your rate, and your rhythm. Same vetted crew every visit.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"Service","serviceType":"Recurring Cleaning","provider":{"@id":"https://www.natabelcleaning.com/#business"},"areaServed":"Sacramento, CA"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Recurring Cleaning","item":"https://www.natabelcleaning.com/recurring-cleaning.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>Recurring Cleaning Plans</span></div>
        <span class="pill pill-brass reveal" style="margin-bottom:16px;">Recurring · Reliable Service</span>
        <h1 class="reveal">Cleaning plans<br /><span class="serif-italic">built around your schedule.</span></h1>
        <p class="lead reveal">Ideal for offices, commercial properties, busy households, property managers, and professional spaces. Lock in your team, your rate, and your rhythm.</p>
        <div class="hero-ctas reveal">
          <a href="free-estimate.html?service=recurring" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="repeat"></i> Build My Cleaning Plan</a>
          <a href="free-estimate.html?service=commercial" class="btn btn-outline btn-lg">Commercial Recurring Quote</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid-3">
          <div class="plan-card reveal">
            <h3>Weekly Cleaning</h3><p class="plan-sub">Best for busy homes &amp; high-traffic offices</p>
            <ul><li><i data-lucide="check"></i> Same cleaning team every week</li><li><i data-lucide="check"></i> Priority scheduling</li><li><i data-lucide="check"></i> Locked-in rate</li><li><i data-lucide="check"></i> Customizable checklist</li></ul>
            <a href="free-estimate.html?service=recurring" class="btn btn-outline btn-block">Choose Weekly</a>
          </div>
          <div class="plan-card featured reveal d1">
            <h3>Biweekly Cleaning</h3><p class="plan-sub">Our most popular plan</p>
            <ul><li><i data-lucide="check"></i> Perfect balance of value &amp; upkeep</li><li><i data-lucide="check"></i> Consistent, vetted team</li><li><i data-lucide="check"></i> Preferred rate</li><li><i data-lucide="check"></i> Easy pause &amp; reschedule</li></ul>
            <a href="free-estimate.html?service=recurring" class="btn btn-brass btn-block">Choose Biweekly</a>
          </div>
          <div class="plan-card reveal d2">
            <h3>Monthly Cleaning</h3><p class="plan-sub">Maintenance that keeps things tidy</p>
            <ul><li><i data-lucide="check"></i> Ideal for lower-traffic spaces</li><li><i data-lucide="check"></i> Predictable monthly visit</li><li><i data-lucide="check"></i> Reliable crew</li><li><i data-lucide="check"></i> Easy to upgrade</li></ul>
            <a href="free-estimate.html?service=recurring" class="btn btn-outline btn-block">Choose Monthly</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section bg-soft">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="h-eyebrow">Commercial Recurring Options</span>
            <h2>Built around<br /><span class="serif-italic">your facility's rhythm.</span></h2>
            <p class="lead">Commercial recurring plans are tailored to traffic, hours, and compliance needs — with a dedicated crew and a custom scope of work.</p>
            <div class="feat-list">${checkList([
              '<strong>Nightly cleaning</strong> — for high-traffic offices and customer-facing spaces.',
              '<strong>2× per week</strong> — mid-size suites and professional buildings.',
              '<strong>Weekly service</strong> — smaller offices and lower-traffic facilities.',
              '<strong>Custom schedule</strong> — your cadence, your standards.',
            ])}</div>
            <a href="free-estimate.html?service=commercial" class="btn btn-brass btn-lg" data-magnetic>Build My Commercial Plan</a>
          </div>
          <div class="reveal d1">
            <div class="side-cta">
              <h3>Why recurring?</h3>
              <p>The benefits add up fast.</p>
              <div style="display:grid;gap:10px;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Same trusted team, every visit</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Locked-in rate (no surprise increases)</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Priority scheduling</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Easy to pause or reschedule</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Consistently clean, not catch-up clean</div>
              </div>
              <a href="free-estimate.html?service=recurring" class="btn btn-brass btn-block">Start a Plan</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${cta('Ready for a<br /><span class="serif-italic" style="color:var(--brass-bright);">consistently clean space?</span>', 'Build your recurring cleaning plan in 90 seconds.', 'Build My Cleaning Plan', 'Call Now', 'free-estimate.html?service=recurring', 'tel:+19165550148', 'repeat', 'phone')}`
});

/* ============ PROPERTY MANAGEMENT ============ */
pages.push({
  slug: 'property-management.html',
  title: 'Property Management Cleaning Sacramento | Rental Turnover | Natabel',
  desc: 'Property management cleaning in Sacramento. Rental turnover, common area, and maintenance cleaning for landlords and property managers. Photo-documented, on-time, reliable. Free quotes.',
  ogTitle: 'Property Management Cleaning Sacramento',
  ogDesc: 'Turnover, common areas, and maintenance cleaning for landlords and property managers.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"Service","serviceType":"Property Management Cleaning","provider":{"@id":"https://www.natabelcleaning.com/#business"},"areaServed":"Sacramento, CA"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Property Management","item":"https://www.natabelcleaning.com/property-management.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>Property Management Cleaning</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Property Managers · Landlords</span>
        <h1 class="reveal">Property management cleaning<br /><span class="serif-italic">that respects your deadlines.</span></h1>
        <p class="lead reveal">Reliable turnover, common-area, and maintenance cleaning for landlords and property managers across Sacramento. Photo-documented, on-time, and built to keep your units rent-ready.</p>
        <div class="hero-ctas reveal">
          <a href="free-estimate.html?service=property_management" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="key-round"></i> Get a Property Mgmt Quote</a>
          <a href="commercial.html" class="btn btn-outline btn-lg">All Commercial Services</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="h-eyebrow">What We Handle</span>
            <h2>One cleaning partner<br /><span class="serif-italic">for your whole portfolio.</span></h2>
            <div class="feat-list">${checkList([
              '<strong>Rental turnovers</strong> — top-to-bottom empty-unit cleans, rent-ready fast.',
              '<strong>Common areas</strong> — lobbies, hallways, stairwells, elevators, mail rooms.',
              '<strong>Maintenance cleaning</strong> — between tenants, post-repair, scheduled upkeep.',
              '<strong>Photo-documented</strong> — proof of clean for every turnover.',
              '<strong>Multi-unit scheduling</strong> — coordinated across your properties.',
              '<strong>Reliable turnaround</strong> — on-time, every time, so you don\'t lose rent days.',
            ])}</div>
            <a href="free-estimate.html?service=property_management" class="btn btn-emerald btn-lg" data-magnetic>Request a Quote</a>
          </div>
          <div class="reveal d1">
            <div class="side-cta">
              <h3>For landlords &amp; managers</h3>
              <p>The reliability your operation depends on.</p>
              <div style="display:grid;gap:10px;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Single point of contact</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Flexible scheduling per unit</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Background-checked crews</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Licensed &amp; insured</div>
                <div style="display:flex;align-items:center;gap:10px;font-size:.94rem;"><i data-lucide="check"></i> Consistent quality standards</div>
              </div>
              <a href="free-estimate.html?service=property_management" class="btn btn-brass btn-block">Get Quote</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${cta('Stop juggling cleaners.<br /><span class="serif-italic" style="color:var(--brass-bright);">Get one reliable partner.</span>', 'Get a property management cleaning quote — usually within one business hour.', 'Get Property Mgmt Quote', 'Call Now', 'free-estimate.html?service=property_management', 'tel:+19165550148', 'key-round', 'phone')}`
});

/* ============ SERVICE AREAS ============ */
const AREAS = ['Sacramento','Roseville','Rocklin','Folsom','Elk Grove','Davis','Rancho Cordova','Carmichael','Citrus Heights','Fair Oaks','Orangevale','West Sacramento','Natomas','Midtown Sacramento','East Sacramento','Land Park','Arden-Arcade'];
pages.push({
  slug: 'service-areas.html',
  title: 'Cleaning Service Areas | Sacramento, Roseville, Folsom & More | Natabel',
  desc: 'Natabel Cleaning Services serves Sacramento, Roseville, Rocklin, Folsom, Elk Grove, Davis, Rancho Cordova, Carmichael, Citrus Heights, Fair Oaks, Orangevale, West Sacramento, Natomas, Midtown, East Sacramento, Land Park & Arden-Arcade.',
  ogTitle: 'Sacramento Cleaning Service Areas',
  ogDesc: 'Serving Sacramento and 17 surrounding communities. Founder-led, local, insured.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"WebPage","name":"Service Areas","url":"https://www.natabelcleaning.com/service-areas.html"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Service Areas","item":"https://www.natabelcleaning.com/service-areas.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>Service Areas</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Local Coverage</span>
        <h1 class="reveal">Serving Sacramento<br /><span class="serif-italic">&amp; surrounding communities.</span></h1>
        <p class="lead reveal">Based in Sacramento, we clean homes and businesses across the greater metro area. If you don't see your neighborhood listed, just ask — we're always expanding.</p>
        <div class="hero-ctas reveal"><a href="free-estimate.html" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="sparkles"></i> Check My Address</a></div>
      </div>
    </section>

    <section class="section">
      <div class="container container-wide">
        <div class="section-head text-center reveal" style="margin-bottom:48px;">
          <span class="h-eyebrow center">Where We Clean</span>
          <h2>Sacramento-area<br /><span class="serif-italic">cleaning coverage.</span></h2>
        </div>
        <div class="area-grid reveal d1">
          ${AREAS.map(a => `<a class="area-chip" href="free-estimate.html"><i data-lucide="map-pin"></i> ${a}</a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section bg-emerald">
      <div class="container container-tight">
        <div class="section-head reveal" style="margin-inline:auto;">
          <span class="h-eyebrow">Local SEO Copy</span>
          <h2 style="color:var(--ivory);">Sacramento cleaning service, rooted in the community.</h2>
          <p style="color:rgba(247,243,235,.82);">Natabel Cleaning Services is a locally owned, founder-led cleaning company serving Sacramento and the surrounding region. Whether you need <strong style="color:var(--brass-bright);">commercial cleaning in Sacramento</strong>, <strong style="color:var(--brass-bright);">office cleaning in Roseville</strong>, <strong style="color:var(--brass-bright);">house cleaning in Folsom</strong>, or <strong style="color:var(--brass-bright);">janitorial services in Elk Grove</strong>, our vetted teams deliver consistent, premium results. We know these neighborhoods because we live and work here — and we treat every home and business like our own.</p>
        </div>
      </div>
    </section>
    ${cta('Not sure if we cover you?<br /><span class="serif-italic" style="color:var(--brass-bright);">Just ask.</span>', 'Enter your ZIP in our estimate funnel and we\'ll confirm coverage instantly.', 'Check My Address', 'Call Now', 'free-estimate.html', 'tel:+19165550148', 'map-pin', 'phone')}`
});

/* ============ ABOUT (Fatima) ============ */
pages.push({
  slug: 'about.html',
  title: 'About Fatima Patalano | Founder of Natabel Cleaning Services | Sacramento',
  desc: 'Meet Fatima Patalano, founder of Natabel Cleaning Services. A Sacramento local building a premium, reliable, founder-led cleaning company for Sacramento homes and businesses. Licensed, insured, and community-rooted.',
  ogTitle: 'About Fatima — Founder of Natabel Cleaning Services',
  ogDesc: 'A Sacramento local building a premium, founder-led cleaning company.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"AboutPage","url":"https://www.natabelcleaning.com/about.html"},{"@type":"Person","name":"Fatima Patalano","jobTitle":"Founder","worksFor":{"@id":"https://www.natabelcleaning.com/#business"}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"About","item":"https://www.natabelcleaning.com/about.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>About</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Founder-Led · Sacramento Local</span>
        <h1 class="reveal">Meet Fatima.<br /><span class="serif-italic">The heart behind Natabel.</span></h1>
        <p class="lead reveal">Natabel Cleaning Services was founded by Fatima Patalano — a Sacramento local on a mission to build the cleaning company she always wished existed: meticulous, reliable, genuinely kind, and rooted in this community.</p>
      </div>
    </section>

    <section class="section">
      <div class="container container-tight">
        <div class="reveal" style="margin-bottom:40px;">
          <span class="h-eyebrow">The Story</span>
          <h2>Cleaning, done the way<br /><span class="serif-italic">it should be done.</span></h2>
        </div>
        <div class="prose reveal d1" style="max-width:70ch;margin-inline:auto;">
          <p>I started Natabel because I kept hearing the same story from homeowners and business owners across Sacramento: cleaners who didn't show up, who cut corners, who treated the work as an afterthought. I knew it could be different — because I knew how I'd want <em>my</em> home and <em>my</em> business cleaned.</p>
          <p>So I built Natabel around a simple standard: <strong>hotel-grade cleanliness, delivered by people you actually trust.</strong> Every team member is background-checked and trained to the same meticulous checklist. Every recurring client gets the same crew, every visit. Every commercial account gets a custom scope of work and a single point of contact.</p>
          <p>We're based right here in Sacramento. We clean in the neighborhoods we live in. When you call Natabel, you're talking to the owner — not a call center. That matters to me, and I think it matters to you too.</p>
          <p class="serif-italic" style="font-size:1.15rem;margin-top:32px;">— Fatima Patalano, Founder</p>
        </div>

        <div class="stats-strip reveal d2" style="margin-top:56px;max-width:760px;margin-inline:auto;">
          <div class="stat"><div class="num" data-count="4.9"></div><div class="lbl">Google rating</div></div>
          <div class="stat"><div class="num" data-count="127" data-suffix="+"></div><div class="lbl">5-star reviews</div></div>
          <div class="stat"><div class="num" data-count="340" data-suffix="+"></div><div class="lbl">Clients served</div></div>
          <div class="stat"><div class="num" data-count="60" data-suffix="+"></div><div class="lbl">Recurring accounts</div></div>
        </div>
      </div>
    </section>

    <section class="section bg-soft">
      <div class="container">
        <div class="section-head text-center reveal" style="margin-bottom:48px;">
          <span class="h-eyebrow center">What Natabel Stands For</span>
          <h2>Our values</h2>
        </div>
        <div class="grid-4">
          <div class="card reveal"><div class="card-icon"><i data-lucide="shield-check"></i></div><h3>Trust</h3><p>Background-checked teams, consistent crews, and a founder who answers the phone.</p></div>
          <div class="card reveal d1"><div class="card-icon brass"><i data-lucide="sparkles"></i></div><h3>Meticulous</h3><p>Hotel-grade standards on every clean — the corners most cleaners miss.</p></div>
          <div class="card reveal d2"><div class="card-icon"><i data-lucide="map-pin"></i></div><h3>Local</h3><p>Born and based in Sacramento. We clean in the neighborhoods we live in.</p></div>
          <div class="card reveal d3"><div class="card-icon brass"><i data-lucide="heart"></i></div><h3>Kind</h3><p>Friendly, respectful, and genuinely glad to be in your space. Every time.</p></div>
        </div>
      </div>
    </section>
    ${cta('Work with a company<br /><span class="serif-italic" style="color:var(--brass-bright);">that actually cares.</span>', 'Get a free estimate from Natabel — founded and run by Fatima, right here in Sacramento.', 'Get Free Estimate', 'Call Fatima', 'free-estimate.html', 'tel:+19165550148', 'sparkles', 'phone')}`
});

/* ============ REVIEWS ============ */
const REVIEWS = [
  ['DK','Dana K.','Office Manager · Midtown Sacramento','"Natabel has been cleaning our 8,000 sq ft office weekly for over a year. Reliable, thorough, and our staff has absolutely noticed the difference. Fatima is responsive and professional."'],
  ['MR','Marcus R.','Property Manager · Elk Grove','"I manage 14 rental units across Elk Grove and Folsom. Turnovers used to be my biggest headache — now I just call Natabel. Photo-documented cleans, on-time every time."'],
  ['SP','Sofia P.','Homeowner · Land Park','"Biweekly cleaning that has genuinely changed our weekends. Coming home to a clean house on a Friday is the best feeling. They remember every little thing we asked for."'],
  ['JT','James T.','Move-Out Customer · Natomas','"Used them for a move-out clean. Got my full deposit back for the first time ever. The place looked better than when I moved in. Worth every penny."'],
  ['AL','Aisha L.','Recurring Customer · East Sacramento','"Third month of weekly cleans and I am a customer for life. Same two cleaners every time, they know my dog by name, and the house has never been more consistently clean."'],
  ['BC','Brian C.','Commercial Client · Roseville','"Our retail store gets cleaned nightly by Natabel. Floors sparkle, restrooms are always stocked, and they handle after-hours access seamlessly. A genuinely premium operation."'],
  ['LG','Lisa G.','Homeowner · Folsom','"The deep clean was transformative. Baseboards, blinds, inside the oven — they got everything. I have already booked a recurring biweekly plan."'],
  ['RV','Raj V.','Office Manager · Rancho Cordova','"Switched from a national chain to Natabel and the difference is night and day. Same crew, better communication, and our office has never looked better."'],
];
pages.push({
  slug: 'reviews.html',
  title: 'Reviews | Natabel Cleaning Services | Sacramento',
  desc: 'Read reviews from Natabel Cleaning Services clients across Sacramento — office managers, property managers, homeowners, and commercial clients. 4.9★ Google-rated, 127+ reviews.',
  ogTitle: 'Natabel Cleaning Reviews — Sacramento',
  ogDesc: '4.9★ from 127+ Sacramento clients. Office managers, homeowners, property managers.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"Review","itemReviewed":{"@id":"https://www.natabelcleaning.com/#business"},"reviewRating":{"@type":"Rating","ratingValue":"5","bestRating":"5"},"author":{"@type":"Person","name":"Dana K."}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Reviews","item":"https://www.natabelcleaning.com/reviews.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>Reviews</span></div>
        <span class="pill pill-brass reveal" style="margin-bottom:16px;">4.9★ · 127+ Reviews</span>
        <h1 class="reveal">Sacramento loves<br /><span class="serif-italic">a genuinely clean space.</span></h1>
        <p class="lead reveal">Real words from the offices, homes, and properties we clean every week. <em>(Placeholder reviews — replace with verified Google reviews.)</em></p>
        <div class="hero-ctas reveal"><a href="free-estimate.html" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="sparkles"></i> Get a Free Estimate</a></div>
      </div>
    </section>

    <section class="section">
      <div class="container container-wide">
        <div class="grid-3">
          ${REVIEWS.map((r,i) => `<div class="review-card reveal${i%3===1?' d1':i%3===2?' d2':''}"><div class="review-stars">★★★★★</div><p class="review-body">${r[3]}</p><div class="review-author"><span class="review-avatar">${r[0]}</span><span><strong>${r[1]}</strong><small>${r[2]}</small></span></div></div>`).join('')}
        </div>
      </div>
    </section>
    ${cta('Join hundreds of happy<br /><span class="serif-italic" style="color:var(--brass-bright);">Sacramento clients.</span>', 'Get a free estimate and see the Natabel difference for yourself.', 'Get Free Estimate', 'Call Now', 'free-estimate.html', 'tel:+19165550148', 'sparkles', 'phone')}`
});

/* ============ FAQ ============ */
const FAQS = [
  ['Do you offer free estimates?','Yes — every estimate is free, with no obligation. Use our 90-second estimate funnel, request a commercial walkthrough, or just call us. You\'ll get a clear, honest quote within one business hour.'],
  ['Do you clean both homes and businesses?','Absolutely. We serve residential clients (houses, apartments, condos, rentals) and commercial clients (offices, retail, medical, gyms, property managers). Residential and commercial teams are trained for their specific environments.'],
  ['Do you offer recurring commercial cleaning?','Yes — recurring commercial cleaning is a core part of what we do. We offer nightly, twice-weekly, weekly, and custom schedules, all backed by a dedicated crew and a custom scope of work.'],
  ['Do you offer janitorial contracts?','We do. Our janitorial contracts are flexible — month-to-month or annual — and cover restrooms, breakrooms, trash, floors, dusting, and sanitization on a schedule that fits your facility.'],
  ['Can I schedule a commercial walkthrough?','Yes, and we recommend it. A walkthrough lets us see your space, understand your standards, and quote accurately. Use the "Schedule a Commercial Walkthrough" button anywhere on the site, or call us directly.'],
  ['Do you offer after-hours commercial cleaning?','Yes. Most of our commercial clients prefer after-hours cleaning so their business runs uninterrupted. We handle access logistics, keys, and alarm procedures professionally.'],
  ['Do you bring your own supplies?','Yes — our teams arrive fully equipped with professional-grade supplies and equipment. If you prefer specific products (hypoallergenic, eco-friendly, or your own brand), just let us know and we\'ll accommodate.'],
  ['What is included in a deep cleaning?','Our deep clean covers everything in a standard clean, plus baseboards, blinds, inside appliances (where accessible), detailed bathroom scrubbing, light fixtures, ceiling fans, and hard-to-reach areas. A full checklist is provided with your quote.'],
  ['Do you offer move-in and move-out cleaning?','Yes — move-in/move-out cleaning is one of our specialties. We clean empty units top-to-bottom, including inside cabinets, appliances, and closets, so you get your deposit back or start fresh in a spotless space.'],
  ['What areas do you serve?','Sacramento, Roseville, Rocklin, Folsom, Elk Grove, Davis, Rancho Cordova, Carmichael, Citrus Heights, Fair Oaks, Orangevale, West Sacramento, Natomas, Midtown, East Sacramento, Land Park, Arden-Arcade, and surrounding communities.'],
  ['Can I customize my cleaning checklist?','Absolutely. Every recurring plan starts with a customizable checklist. Tell us your priorities — pet areas, allergy concerns, skip rooms, focus rooms — and we\'ll build the cleaning around you.'],
  ['How quickly can I get a quote?','Most quotes come back within one business hour during normal hours. For commercial walkthroughs, we\'ll schedule a visit within 1–3 business days depending on location.'],
];
pages.push({
  slug: 'faq.html',
  title: 'FAQ | Natabel Cleaning Services | Sacramento',
  desc: 'Answers to common questions about Natabel Cleaning Services — free estimates, recurring plans, janitorial contracts, after-hours service, supplies, deep cleaning, move-in/out, service areas, and more.',
  ogTitle: 'Natabel Cleaning FAQ — Sacramento',
  ogDesc: 'Free estimates, recurring plans, janitorial contracts, after-hours service, and more.',
  schema: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":FAQS.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))}),
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>FAQ</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Frequently Asked</span>
        <h1 class="reveal">Questions,<br /><span class="serif-italic">answered.</span></h1>
        <p class="lead reveal">Everything you need to know about Natabel Cleaning Services. Don't see your question? Just call us — we're happy to help.</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="max-width:880px;">
        <div class="faq-group reveal d1">
          ${FAQS.map(([q,a]) => `<div class="faq-item"><button class="faq-q" aria-expanded="false">${q} <i data-lucide="chevron-down" class="chev"></i></button><div class="faq-a"><div class="faq-a-inner">${a}</div></div></div>`).join('')}
        </div>
      </div>
    </section>
    ${cta('Still have questions?<br /><span class="serif-italic" style="color:var(--brass-bright);">Let\'s talk.</span>', 'Call us or request a free estimate — we\'ll answer everything.', 'Get Free Estimate', 'Call Now', 'free-estimate.html', 'tel:+19165550148', 'sparkles', 'phone')}`
});

/* ============ FREE ESTIMATE (uses funnel) ============ */
pages.push({
  slug: 'free-estimate.html',
  title: 'Free Cleaning Estimate | Sacramento | Natabel Cleaning Services',
  desc: 'Get a free cleaning estimate in 90 seconds. Residential, commercial, move-in/out, deep cleaning, recurring plans. No pressure, no obligation. Serving Sacramento and surrounding communities.',
  ogTitle: 'Free Cleaning Estimate — Natabel, Sacramento',
  ogDesc: '90-second estimate. No pressure, no obligation. Residential & commercial.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"WebPage","name":"Free Estimate","url":"https://www.natabelcleaning.com/free-estimate.html"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Free Estimate","item":"https://www.natabelcleaning.com/free-estimate.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>Free Estimate</span></div>
        <span class="pill pill-brass reveal" style="margin-bottom:16px;">90 Seconds · No Obligation</span>
        <h1 class="reveal">Your free<br /><span class="serif-italic">cleaning estimate.</span></h1>
        <p class="lead reveal">Tell us about your space and we'll send a personalized estimate within one business hour. No pressure, no obligation — just a clear, honest quote.</p>
      </div>
    </section>

    <section class="section funnel">
      <div class="container">
        <div class="funnel-card reveal" data-funnel>
          <div class="funnel-progress">
            <div class="meta"><span class="step-label">Step 1 · Service Type</span><span class="step-count">1 of 7</span></div>
            <div class="bar"><span></span></div>
          </div>
          <form data-lead-source="Free Estimate Page" novalidate>
            <input type="hidden" name="form_type" value="free_estimate" />
            <div class="funnel-step active">
              <h3>What kind of cleaning do you need?</h3>
              <p class="step-desc">Choose the service that best fits — you can refine details later.</p>
              <div class="choice-group cols-3">
                <label class="choice"><input type="radio" name="service_type" value="residential" /><span class="choice-ic"><i data-lucide="home"></i></span><strong>Residential Cleaning</strong><small>House, apartment, condo</small></label>
                <label class="choice"><input type="radio" name="service_type" value="commercial" /><span class="choice-ic"><i data-lucide="building-2"></i></span><strong>Commercial Cleaning</strong><small>Office, retail, medical</small></label>
                <label class="choice"><input type="radio" name="service_type" value="move_in_out" /><span class="choice-ic"><i data-lucide="move-3d"></i></span><strong>Move-In / Move-Out</strong><small>Tenant &amp; turnover</small></label>
                <label class="choice"><input type="radio" name="service_type" value="deep_cleaning" /><span class="choice-ic"><i data-lucide="sparkles"></i></span><strong>Deep Cleaning</strong><small>Top-to-bottom detail</small></label>
                <label class="choice"><input type="radio" name="service_type" value="recurring" /><span class="choice-ic"><i data-lucide="repeat"></i></span><strong>Recurring Cleaning</strong><small>Weekly / biweekly / monthly</small></label>
                <label class="choice"><input type="radio" name="service_type" value="property_management" /><span class="choice-ic"><i data-lucide="key-round"></i></span><strong>Property Management</strong><small>Rental turnover &amp; upkeep</small></label>
              </div>
              <div class="funnel-nav"><span></span><button type="button" class="btn btn-emerald" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
            </div>
            <div class="funnel-step">
              <h3>What kind of property is it?</h3>
              <p class="step-desc">We tailor equipment, products, and team size to your space.</p>
              <div data-prop="residential">
                <div class="choice-group cols-4">
                  <label class="choice"><input type="radio" name="property_type" value="house" /><strong>House</strong><small>Single-family</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="apartment" /><strong>Apartment</strong><small>Multi-unit</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="condo" /><strong>Condo</strong><small>Condominium</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="townhome" /><strong>Townhome</strong><small>Attached</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="rental" /><strong>Rental property</strong><small>Income property</small></label>
                </div>
              </div>
              <div data-prop="commercial" style="display:none;">
                <div class="choice-group cols-4">
                  <label class="choice"><input type="radio" name="property_type" value="office" /><strong>Office</strong><small>Suite / building</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="retail" /><strong>Retail space</strong><small>Storefront</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="medical" /><strong>Medical office</strong><small>Clinic / dental</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="gym" /><strong>Gym / fitness</strong><small>Studio / club</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="church" /><strong>Church / community</strong><small>Place of worship</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="property_mgmt" /><strong>Property mgmt</strong><small>Multi-tenant</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="commercial_building" /><strong>Commercial building</strong><small>Multi-floor</small></label>
                  <label class="choice"><input type="radio" name="property_type" value="other" /><strong>Other</strong><small>Tell us in notes</small></label>
                </div>
              </div>
              <div class="funnel-nav"><button type="button" class="btn btn-back" data-back><i data-lucide="arrow-left"></i> Back</button><button type="button" class="btn btn-emerald" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
            </div>
            <div class="funnel-step">
              <h3>How often do you need cleaning?</h3>
              <p class="step-desc">Recurring plans lock in your rate and your team. You can change or pause anytime.</p>
              <div class="choice-group cols-4">
                <label class="choice"><input type="radio" name="frequency" value="one_time" /><strong>One-time</strong><small>Single clean</small></label>
                <label class="choice"><input type="radio" name="frequency" value="weekly" /><strong>Weekly</strong><small>Every 7 days</small></label>
                <label class="choice"><input type="radio" name="frequency" value="biweekly" /><strong>Biweekly</strong><small>Every 14 days</small></label>
                <label class="choice"><input type="radio" name="frequency" value="monthly" /><strong>Monthly</strong><small>Every 30 days</small></label>
                <label class="choice"><input type="radio" name="frequency" value="custom" /><strong>Custom</strong><small>Tell us your cadence</small></label>
              </div>
              <div class="funnel-nav"><button type="button" class="btn btn-back" data-back><i data-lucide="arrow-left"></i> Back</button><button type="button" class="btn btn-emerald" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
            </div>
            <div class="funnel-step">
              <h3>Property details</h3>
              <p class="step-desc">A few specifics help us build an accurate quote.</p>
              <div data-size="residential">
                <div class="field-row">
                  <div class="field"><label>Bedrooms <span class="req">*</span></label><select name="bedrooms"><option value="">Select…</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select></div>
                  <div class="field"><label>Bathrooms <span class="req">*</span></label><select name="bathrooms"><option value="">Select…</option><option>1</option><option>1.5</option><option>2</option><option>2.5</option><option>3</option><option>3.5</option><option>4+</option></select></div>
                </div>
                <div class="field"><label>Approximate square footage</label><input type="text" name="square_footage" placeholder="e.g. 1,800 sq ft" /></div>
              </div>
              <div data-size="commercial" style="display:none;">
                <div class="field-row">
                  <div class="field"><label>Approx. square footage</label><input type="text" name="commercial_sqft" placeholder="e.g. 4,500 sq ft" /></div>
                  <div class="field"><label>Number of restrooms</label><input type="number" name="restrooms" min="0" placeholder="e.g. 3" /></div>
                </div>
                <div class="field-row">
                  <div class="field"><label>Desired cleaning days</label><input type="text" name="cleaning_days" placeholder="e.g. Mon/Wed/Fri" /></div>
                  <div class="field"><label>Preferred cleaning time</label><select name="cleaning_time"><option value="">Select…</option><option>Business hours</option><option>After hours</option><option>Either</option></select></div>
                </div>
              </div>
              <div class="funnel-nav"><button type="button" class="btn btn-back" data-back><i data-lucide="arrow-left"></i> Back</button><button type="button" class="btn btn-emerald" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
            </div>
            <div class="funnel-step">
              <h3>Where is the property?</h3>
              <p class="step-desc">We serve Sacramento and surrounding communities.</p>
              <div class="field-row">
                <div class="field"><label>ZIP code <span class="req">*</span></label><input type="text" name="zip" inputmode="numeric" pattern="[0-9]{5}" placeholder="e.g. 95814" /><div class="field-error">Please enter a 5-digit ZIP.</div></div>
                <div class="field"><label>City</label><input type="text" name="city" placeholder="e.g. Sacramento" /></div>
              </div>
              <div class="field"><label>Service address <span class="muted" style="font-weight:400;">(optional)</span></label><input type="text" name="address" placeholder="Street address (optional)" /></div>
              <div class="funnel-nav"><button type="button" class="btn btn-back" data-back><i data-lucide="arrow-left"></i> Back</button><button type="button" class="btn btn-emerald" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
            </div>
            <div class="funnel-step">
              <h3>Where should we send your estimate?</h3>
              <p class="step-desc">We'll reach out within one business hour. No spam, ever.</p>
              <div class="field-row">
                <div class="field"><label>Full name <span class="req">*</span></label><input type="text" name="name" placeholder="Your name" /><div class="field-error">Please enter your name.</div></div>
                <div class="field"><label>Phone <span class="req">*</span></label><input type="tel" name="phone" placeholder="(916) 555-0148" /><div class="field-error">Please enter a valid phone number.</div></div>
              </div>
              <div class="field-row">
                <div class="field"><label>Email <span class="req">*</span></label><input type="email" name="email" placeholder="you@example.com" /><div class="field-error">Please enter a valid email.</div></div>
                <div class="field"><label>Preferred contact</label><select name="preferred_contact"><option value="">Select…</option><option>Phone call</option><option>Text message</option><option>Email</option></select></div>
              </div>
              <div class="field"><label>Notes / special requests <span class="muted" style="font-weight:400;">(optional)</span></label><textarea name="notes" placeholder="Pets, allergies, focus areas, access instructions, etc."></textarea></div>
              <div class="funnel-nav"><button type="button" class="btn btn-back" data-back><i data-lucide="arrow-left"></i> Back</button><button type="button" class="btn btn-emerald" data-next>Review request <i data-lucide="arrow-right"></i></button></div>
            </div>
            <div class="funnel-step">
              <h3>You're almost done</h3>
              <p class="step-desc">Submit your request and we'll send a personalized cleaning estimate within one business hour.</p>
              <div class="card" style="background:var(--emerald-tint);border-color:var(--emerald-line);">
                <div class="feat-item"><span class="feat-check"><i data-lucide="check"></i></span><p><strong>No pressure.</strong> Just a clear, honest estimate.</p></div>
                <div class="feat-item"><span class="feat-check"><i data-lucide="check"></i></span><p><strong>No obligation.</strong> Decide on your timeline.</p></div>
                <div class="feat-item"><span class="feat-check"><i data-lucide="check"></i></span><p><strong>Local team.</strong> Founded and run from Sacramento.</p></div>
              </div>
              <div class="funnel-nav"><button type="button" class="btn btn-back" data-back><i data-lucide="arrow-left"></i> Back</button><button type="submit" class="btn btn-brass btn-lg" data-magnetic><i data-lucide="send"></i> Submit My Free Estimate Request</button></div>
            </div>
          </form>
          <div class="funnel-success">
            <div class="check-circle"><i data-lucide="check"></i></div>
            <h2 style="margin-bottom:10px;">Request received — thank you!</h2>
            <p data-summary style="color:var(--muted);max-width:54ch;margin-inline:auto;"></p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px;">
              <a href="free-estimate.html" class="btn btn-emerald">Submit another request</a>
              <a href="tel:+19165550148" class="btn btn-outline">Need it sooner? Call us</a>
            </div>
          </div>
        </div>
      </div>
    </section>`
});

/* ============ BOOK ONLINE ============ */
pages.push({
  slug: 'book-online.html',
  title: 'Book Cleaning Online | Sacramento | Natabel Cleaning Services',
  desc: 'Book residential cleaning, schedule a commercial walkthrough, or request a free estimate online. Preferred date and time, confirmation step, and SMS/email reminders. Sacramento and surrounding communities.',
  ogTitle: 'Book Cleaning Online — Natabel, Sacramento',
  ogDesc: 'Residential booking, commercial walkthroughs, free estimates. Preferred date & time.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"WebPage","name":"Book Online","url":"https://www.natabelcleaning.com/book-online.html"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Book Online","item":"https://www.natabelcleaning.com/book-online.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>Book Online</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Book in Under 2 Minutes</span>
        <h1 class="reveal">Book your<br /><span class="serif-italic">cleaning online.</span></h1>
        <p class="lead reveal">Residential booking, commercial walkthrough scheduling, or a free estimate — pick what you need and pick a time. We'll confirm by text and email.</p>
      </div>
    </section>

    <section class="section">
      <div class="container container-tight">
        <div class="form-card reveal">
          <div class="form-head">
            <h2>Request a booking</h2>
            <p>Choose your service type, preferred date, and time. We'll confirm within one business hour.</p>
          </div>
          <div class="form-body">
            <form id="bookingForm" data-lead-source="Book Online Page" novalidate>
              <input type="hidden" name="form_type" value="booking" />
              <div class="field">
                <label>What would you like to book? <span class="req">*</span></label>
                <div class="choice-group cols-3">
                  <label class="choice"><input type="radio" name="booking_type" value="residential" /><strong>Residential Cleaning</strong><small>House, apartment, condo</small></label>
                  <label class="choice"><input type="radio" name="booking_type" value="commercial_walkthrough" /><strong>Commercial Walkthrough</strong><small>On-site quote visit</small></label>
                  <label class="choice"><input type="radio" name="booking_type" value="free_estimate" /><strong>Free Estimate</strong><small>Quick phone/email quote</small></label>
                </div>
              </div>
              <div class="field-row">
                <div class="field"><label>Preferred date <span class="req">*</span></label><input type="date" name="preferred_date" /><div class="field-error">Please pick a date.</div></div>
                <div class="field"><label>Preferred time <span class="req">*</span></label><select name="preferred_time"><option value="">Select…</option><option>Morning (7a–11a)</option><option>Midday (11a–2p)</option><option>Afternoon (2p–6p)</option><option>After hours (commercial)</option></select><div class="field-error">Please pick a time.</div></div>
              </div>
              <div class="field-row">
                <div class="field"><label>Full name <span class="req">*</span></label><input type="text" name="name" placeholder="Your name" /><div class="field-error">Please enter your name.</div></div>
                <div class="field"><label>Phone <span class="req">*</span></label><input type="tel" name="phone" placeholder="(916) 555-0148" /><div class="field-error">Please enter a valid phone number.</div></div>
              </div>
              <div class="field-row">
                <div class="field"><label>Email <span class="req">*</span></label><input type="email" name="email" placeholder="you@example.com" /><div class="field-error">Please enter a valid email.</div></div>
                <div class="field"><label>ZIP code <span class="req">*</span></label><input type="text" name="zip" inputmode="numeric" pattern="[0-9]{5}" placeholder="e.g. 95814" /><div class="field-error">Please enter a 5-digit ZIP.</div></div>
              </div>
              <div class="field"><label>Service address</label><input type="text" name="address" placeholder="Street address (optional)" /></div>
              <div class="field"><label>Notes <span class="muted" style="font-weight:400;">(optional)</span></label><textarea name="notes" placeholder="Bedrooms/baths, sq ft, pets, focus areas, access instructions, etc."></textarea></div>
              <button type="submit" class="btn btn-brass btn-lg btn-block" data-magnetic><i data-lucide="calendar-check"></i> Request Booking</button>
              <p class="muted" style="font-size:.82rem;text-align:center;margin-top:14px;"><i data-lucide="bell" style="width:14px;height:14px;vertical-align:-2px;"></i> Confirmation + SMS/email reminders sent automatically. <em>(Placeholder — connect to your calendar/CRM in config.js.)</em></p>
            </form>
          </div>
        </div>
      </div>
    </section>`
});

/* ============ CONTACT ============ */
pages.push({
  slug: 'contact.html',
  title: 'Contact | Natabel Cleaning Services | Sacramento',
  desc: 'Contact Natabel Cleaning Services in Sacramento. Call (916) 555-0148, email hello@natabelcleaning.com, or send a message. Serving Sacramento and surrounding communities. Mon–Fri 7a–6p, Sat 8a–4p.',
  ogTitle: 'Contact Natabel Cleaning Services — Sacramento',
  ogDesc: 'Call, email, or message us. Sacramento-based, founder-led, responsive.',
  schema: `{"@context":"https://schema.org","@graph":[{"@type":"ContactPage","url":"https://www.natabelcleaning.com/contact.html"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.natabelcleaning.com/"},{"@type":"ListItem","position":2,"name":"Contact","item":"https://www.natabelcleaning.com/contact.html"}]}]}`,
  body: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs reveal"><a href="index.html">Home</a><span class="sep">/</span><span>Contact</span></div>
        <span class="pill reveal" style="margin-bottom:16px;">Get in Touch</span>
        <h1 class="reveal">Let's talk<br /><span class="serif-italic">about your space.</span></h1>
        <p class="lead reveal">Call, email, or send a message. We respond within one business hour during normal hours — and you'll talk to a real person, not a call center.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div class="reveal">
            <span class="h-eyebrow">Reach Us Directly</span>
            <h2>Contact<br /><span class="serif-italic">information.</span></h2>
            <div class="feat-list">
              <div class="feat-item"><span class="feat-check"><i data-lucide="phone"></i></span><p><strong>Call:</strong> <a href="tel:+19165550148">(916) 555-0148</a></p></div>
              <div class="feat-item"><span class="feat-check"><i data-lucide="mail"></i></span><p><strong>Email:</strong> <a href="mailto:hello@natabelcleaning.com">hello@natabelcleaning.com</a></p></div>
              <div class="feat-item"><span class="feat-check"><i data-lucide="map-pin"></i></span><p><strong>Service area:</strong> Sacramento &amp; surrounding communities</p></div>
              <div class="feat-item"><span class="feat-check"><i data-lucide="clock"></i></span><p><strong>Hours:</strong> Mon–Fri 7a–6p · Sat 8a–4p · Sun by appointment</p></div>
            </div>
            <div class="card" style="background:var(--emerald-tint);border-color:var(--emerald-line);margin-top:24px;">
              <h3 style="color:var(--emerald);margin-bottom:8px;">Prefer to text?</h3>
              <p style="margin:0;color:var(--ink-2);">Text us at <strong>(916) 555-0148</strong> — great for quick questions, scheduling, or sending photos of your space.</p>
            </div>
          </div>
          <div class="reveal d1">
            <div class="form-card">
              <div class="form-head">
                <h2>Send a message</h2>
                <p>We'll get back to you within one business hour.</p>
              </div>
              <div class="form-body">
                <form id="contactForm" data-lead-source="Contact Page" novalidate>
                  <input type="hidden" name="form_type" value="contact" />
                  <div class="field-row">
                    <div class="field"><label>Full name <span class="req">*</span></label><input type="text" name="name" placeholder="Your name" /><div class="field-error">Please enter your name.</div></div>
                    <div class="field"><label>Phone <span class="req">*</span></label><input type="tel" name="phone" placeholder="(916) 555-0148" /><div class="field-error">Please enter a valid phone number.</div></div>
                  </div>
                  <div class="field"><label>Email <span class="req">*</span></label><input type="email" name="email" placeholder="you@example.com" /><div class="field-error">Please enter a valid email.</div></div>
                  <div class="field"><label>Subject</label><select name="subject"><option value="">Select…</option><option>Free estimate</option><option>Residential cleaning</option><option>Commercial cleaning</option><option>Recurring plan</option><option>Move-in / move-out</option><option>General question</option></select></div>
                  <div class="field"><label>Message <span class="req">*</span></label><textarea name="message" placeholder="Tell us about your space and what you need." ></textarea><div class="field-error">Please enter a message.</div></div>
                  <button type="submit" class="btn btn-brass btn-lg btn-block" data-magnetic><i data-lucide="send"></i> Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`
});

/* ---------- WRITE ALL ---------- */
let written = 0;
pages.forEach(p => {
  const html = HEAD(p) + p.body + FOOT(p.schema);
  const outPath = path.join(__dirname, p.slug);
  // Only overwrite if marked, else create
  if (p.overwrite && !fs.existsSync(outPath)) {
    // marked overwrite but missing — create anyway
  }
  fs.writeFileSync(outPath, html, 'utf8');
  written++;
  console.log('✓ wrote', p.slug);
});
console.log(`\nDone. ${written} pages generated.`);
