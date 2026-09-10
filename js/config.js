/* =========================================================================
   NATABEL PRISTINE CLEANING — Central Configuration
   Global object: window.PCC (project config container)
   Everything else reads from this object.
   ========================================================================= */

window.PCC = {
  /* ---------- Business identity (NAP — keep consistent everywhere) ---------- */
  business: {
    name:     'NataBel Pristine Cleaning',
    legalName:'NataBel Pristine Cleaning',
    founder:  'Fatima Patalano',
    tagline:  'Premium Cleaning \u00b7 Rocklin, CA',
    description:
      'NataBel Pristine Cleaning delivers luxury residential and commercial cleaning across Rocklin, Roseville, Granite Bay, and greater Placer County. ' +
      'Founder-led by Fatima Patalano, we bring careful scope-setting, meticulous standards, and a pristine finish to homes, offices, and facilities.',
    /* Business line */
    phone:          '(916) 899-8811',
    phoneHref:      'tel:+19168998811',
    email:          'natabelpristinecleaning@gmail.com',
    url:            'https://www.natabelpristinecleaning.com',
    streetAddress:  'Rocklin, CA',
    addressLocality:'Rocklin',
    addressRegion:  'CA',
    postalCode:     '95765',
    geo:            { lat: 38.7907, lng: -121.2358 },
    founded:        '2026',
    licenseNumber:  '',
    hours: [
      { days: 'Mon \u2013 Fri', time: '7:00 AM \u2013 6:00 PM' },
      { days: 'Saturday',  time: '8:00 AM \u2013 4:00 PM' },
      { days: 'Sunday',    time: 'By appointment' },
    ],
    serviceAreas: [
      'Rocklin','Roseville','Granite Bay','Loomis','Lincoln','Penryn',
      'Newcastle','Auburn','Folsom','Citrus Heights','Fair Oaks','Orangevale',
      'Carmichael','Sacramento',
    ],
  },

  /* ---------- Social ----------
     Only non-empty entries are rendered. Leave a profile blank until its
     real URL is known — a blank entry is hidden everywhere (footer icons
     and the "Leave a Google review" button), which is always better than
     linking somewhere wrong.

     Footer icon links below are review URLs (not generic listing/search):
     google — Google Maps place URL with the !9m1!1b1 reviews-panel flag
              and the listing kgmid (16s%2Fg%2F11nr0z4tls). Keep tracking
              params such as entry/g_ep/sei stripped.
     yelp   — Yelp business profile URL anchored directly to #reviews. */
  social: {
    facebook:  '',
    instagram: '',
    google:    'https://www.google.com/maps/place/NataBel+Pristine+Cleaning/@38.7834446,-121.2498116,11z/data=!4m8!3m7!1s0xa076a880b5d6e6e1:0xd85e531e54e951f0!8m2!3d38.7834446!4d-121.2498116!9m1!1b1!16s%2Fg%2F11nr0z4tls',
    yelp:      'https://www.yelp.com/biz/natabel-pristine-cleaning-rocklin#reviews',
  },

  /* ---------- Reviews & trust ----------
     NataBel is a new company. Rating fields stay null until real Google
     reviews exist \u2014 the UI hides star/count elements while they are null
     and shows the honest trust promises below instead. When reviews are
     live, set googleRating + reviewCount and the UI upgrades itself. */
  reviews: {
    googleRating: null,
    reviewCount:  null,
    clientsServed: null,
  },
  trust: {
    guarantee:      'The Pristine Guarantee',
    guaranteeCopy:  'Not pristine? Tell us within 24 hours and we return to re-clean the missed areas \u2014 free.',
    promises: [
      { icon: 'user-round',   num: '100%', label: 'Founder-inspected cleans' },
      { icon: 'clipboard-check', num: 'Clear', label: 'Checklist-led scope before service' },
      { icon: 'refresh-ccw',  num: '24 hr', label: 'Pristine Guarantee re-clean window' },
      { icon: 'map-pin',      num: 'Local', label: 'Rocklin-based \u00b7 Placer County proud' },
    ],
  },

  /* ---------- Pricing anchors (leave '' to hide until Fatima sets rates) ---------- */
  pricing: {
    weeklyFrom:   '',
    biweeklyFrom: '',
    monthlyFrom:  '',
    deepFrom:     '',
  },

  /* ---------- Photography (Unsplash — replace with owned assets when ready) ---------- */
  images: {
    pages: {
      default:             null,
      commercial:          { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c', alt: 'Modern Rocklin office interior' },
      office:              { src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2', alt: 'Clean open-plan office workspace' },
      janitorial:          { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', alt: 'Commercial building lobby' },
      residential:         { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', alt: 'Sunlit residential living room' },
      deep:                { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', alt: 'Spotless modern kitchen interior' },
      move:                { src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3', alt: 'Empty home ready for move-in cleaning' },
      recurring:           { src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0', alt: 'Well-maintained family home interior' },
      property:            { src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa', alt: 'Rental property exterior and entryway' },
      about:               { src: 'assets/fatima-patalano-headshot-portrait-800x1000.jpg', webp: 'assets/fatima-patalano-headshot-portrait-800x1000.webp', alt: 'Fatima Patalano, founder and owner of NataBel Pristine Cleaning', width: 800, height: 1000 },
      contact:             null,
      faq:                 null,
      reviews:             { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', alt: 'Polished kitchen detail after cleaning' },
      areas:               null,
      booking:             { src: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335', alt: 'Calendar and scheduling' },
      estimate:            null,
    },
  },

  /* ---------- Lead routing ----------
     Submit handler posts JSON to PCC.leads.endpoint when set.
     Quick setup: deploy scripts/leads-webhook.gs as a Google Apps Script web app,
     paste the deployment URL below, and leads post straight to the inbox/sheet.
     Also works with Jobber / Housecall Pro / GoHighLevel / Make / Zapier webhooks.

     Delivery order (js/leads.js):
       1. endpoint, if set and it accepts the lead
       2. otherwise the visitor's mail client, pre-filled to notifyEmail
       3. if neither is possible, the form says so and shows the phone number
     A lead is never reported as sent when it wasn't.

     demoMode only applies on localhost, so the live site can never fake a
     successful submission. */
  leads: {
    /* Vercel Function in /api/lead.js. It emails the lead via Resend and,
       if LEAD_WEBHOOK_URL is set, forwards it on. Needs RESEND_API_KEY in
       the Vercel project settings; until that exists the endpoint returns
       an error and js/leads.js falls back to the mail-client hand-off, so
       a lead is never silently dropped. */
    endpoint: '/api/lead',
    method:   'POST',
    includeUTM: true,
    demoMode: false,
    notifyEmail: 'natabelpristinecleaning@gmail.com,hello@sentientpartners.ai',
  },

  /* ---------- Analytics & conversion tracking ---------- */
  analytics: {
    // Production properties for the NataBel Pristine Cleaning website.
    // Blank or placeholder values remain fail-closed in js/analytics.js.
    ga4Id: 'G-6SNEG7DFXE',
    clarityProjectId: 'yfwdvy2f9e',
    consentRequired: true,
    consentStorageKey: 'natabel.analytics.consent.v1',
    pageType: 'website',
  },

  /* ---------- Conversion event names (single source of truth) ---------- */
  events: {
    phoneClick:               'phone_click',
    estimateFormStart:        'estimate_form_start',
    estimateFormSubmit:       'estimate_form_submit',
    bookingFormStart:         'booking_form_start',
    bookingFormSubmit:        'booking_form_submit',
    commercialWalkthrough:    'commercial_walkthrough_request',
    recurringQuote:           'recurring_quote_request',
    contactFormSubmit:        'contact_form_submit',
    quoteStarted:             'quote_started',
    quoteHomeDetailsCompleted:'quote_home_details_completed',
    quotePriceViewed:         'quote_price_viewed',
    quoteContactStarted:      'quote_contact_started',
    quoteSubmitted:           'quote_submitted',
    quoteContactSubmitted:    'quote_contact_submitted',
    quoteRevealed:            'quote_revealed',
    quoteDeliveryFailed:      'quote_delivery_failed',
    pageView:                 'page_view',
    servicePageViewed:        'service_page_viewed',
    ctaClick:                 'cta_click',
    emailClick:               'email_click',
    bookingStarted:           'booking_started',
    bookingCompleted:         'booking_completed',
    commercialWalkthroughStarted: 'commercial_walkthrough_started',
    commercialWalkthroughSubmitted: 'commercial_walkthrough_submitted',
    applicationStarted:       'application_started',
    applicationSubmitted:     'application_submitted',
    lead:                     'lead',
  },
};

/* ---------- Tiny helpers exposed globally ---------- */
window.PCC.util = {
  telHref: () => window.PCC.business.phoneHref,
  /*
     Attribution is first-touch + last-touch and contains only short,
     allowlisted campaign values. It is used both by the lead payload and the
     analytics layer, but raw URLs and form values never enter analytics.
   */
  getUTM() {
    const key = 'natabel.analytics.attribution.v1';
    const params = new URLSearchParams(window.location.search);
    const clean = (value, max = 120) => {
      const text = String(value || '').trim();
      if (!text || /@/.test(text) || /(?:\+?\d[\d\s().-]{8,}\d)/.test(text)) return '';
      return text.replace(/[^a-z0-9._~:/+\- ]/gi, '').slice(0, max);
    };
    const incoming = {
      utm_source: clean(params.get('utm_source')),
      utm_medium: clean(params.get('utm_medium')),
      utm_campaign: clean(params.get('utm_campaign')),
      utm_term: clean(params.get('utm_term')),
      utm_content: clean(params.get('utm_content')),
      landing_page: window.location.pathname.slice(0, 200) || '/',
    };
    let stored = {};
    try { stored = JSON.parse(window.localStorage.getItem(key) || '{}') || {}; } catch (_) { stored = {}; }
    const hasCampaign = Object.values(incoming).some(value => value && value !== incoming.landing_page);
    if (hasCampaign) {
      const now = new Date().toISOString();
      if (!stored.first_touch) stored.first_touch = { ...incoming, captured_at: now };
      stored.last_touch = { ...incoming, captured_at: now };
      try { window.localStorage.setItem(key, JSON.stringify(stored)); } catch (_) { /* private mode */ }
    }
    const first = stored.first_touch || {};
    const last = stored.last_touch || {};
    let referrerHost = '';
    try { referrerHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (_) { referrerHost = ''; }
    const source = last.utm_source || first.utm_source || referrerHost || 'direct';
    return {
      utm_source: last.utm_source || first.utm_source || '',
      utm_medium: last.utm_medium || first.utm_medium || (referrerHost ? 'referral' : 'direct'),
      utm_campaign: last.utm_campaign || first.utm_campaign || '',
      utm_term: last.utm_term || first.utm_term || '',
      utm_content: last.utm_content || first.utm_content || '',
      traffic_source: source,
      campaign: last.utm_campaign || first.utm_campaign || '',
      landing_page: first.landing_page || incoming.landing_page,
      referrer_host: referrerHost,
    };
  },
  track(eventName, params = {}) {
    const allowed = new Set([
      'page_type', 'service_type', 'frequency', 'square_footage_band',
      'bedrooms', 'bathrooms', 'city', 'region', 'estimated_price',
      'lead_type', 'traffic_source', 'campaign', 'landing_page',
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'form_id', 'form', 'booking_type', 'quote_type', 'experience', 'stage',
      'application_stage', 'delivery_status', 'error_code', 'cta_text',
      'cta_target', 'cta_location', 'link_location', 'square_footage', 'amount',
    ]);
    const safeText = value => {
      const text = String(value || '').replace(/[\r\n]/g, ' ').trim();
      if (/@/.test(text) || /(?:\+?\d[\d\s().-]{8,}\d)/.test(text)) return '';
      return text.slice(0, 120);
    };
    const safeCategories = new Set(['standard', 'deep', 'move', 'residential', 'recurring', 'commercial', 'office', 'janitorial', 'property_management', 'weekly', 'biweekly', 'monthly', 'one_time', 'house', 'apartment', 'condo', 'townhome', 'direct', 'referral', 'website']);
    const safeCities = new Set(['rocklin', 'roseville', 'granite bay', 'loomis', 'lincoln', 'penryn', 'newcastle', 'auburn', 'folsom', 'citrus heights', 'fair oaks', 'orangevale', 'carmichael', 'sacramento']);
    const safe = { ...window.PCC.util.getUTM(), region: 'CA' };
    Object.entries(params || {}).forEach(([key, value]) => {
      if (!allowed.has(key) || value === undefined || value === null || value === '') return;
      if (key === 'square_footage') {
        const sqft = Number(value);
        if (Number.isFinite(sqft) && sqft > 0) safe.square_footage_band = sqft < 1000 ? 'under_1000' : sqft < 1500 ? '1000_1499' : sqft < 2000 ? '1500_1999' : sqft < 3000 ? '2000_2999' : '3000_plus';
        return;
      }
      if (key === 'amount') key = 'estimated_price';
      if (key === 'estimated_price') {
        const amount = Number(value);
        if (Number.isFinite(amount) && amount >= 0) safe.estimated_price = Math.round(amount);
        return;
      }
      if (key === 'city') {
        const city = safeText(value).toLowerCase();
        if (safeCities.has(city)) safe.city = city;
        return;
      }
      if (['service_type', 'frequency', 'booking_type', 'quote_type'].includes(key)) {
        const category = safeText(value).toLowerCase().replace(/\s+/g, '_');
        if (safeCategories.has(category) || key === 'booking_type') safe[key] = category;
        return;
      }
      safe[key] = safeText(value);
    });
    Object.keys(safe).forEach(key => { if (safe[key] === '') delete safe[key]; });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...safe });
    if (typeof window.gtag === 'function') window.gtag('event', eventName, safe);
    if (typeof window.clarity === 'function') window.clarity('event', eventName);
    if (window.console && console.debug) console.debug('[track]', eventName, safe);
  },
};
