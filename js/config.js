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
    licenseNumber:  'Lic# pending',
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

     The previous values used the pre-rebrand "natabelcleaning" slug and
     were both broken: the Yelp URL 404s, and the g.page link redirected to
     a Google search listing a competitor rather than Fatima's profile.

     google — use the review link from the Google Business Profile
              dashboard ("Ask for reviews" / "Get more reviews").
     yelp   — the real yelp.com/biz/... URL for the claimed listing. */
  social: {
    facebook:  '',
    instagram: '',
    /* Stable Knowledge Graph id for the profile. Preferred over the
       share.google short link, which carries session/tracking params
       (rlz, sxsrf timestamp, utm_source) that go stale. */
    google:    'https://www.google.com/search?kgmid=/g/11nr0z4tls',
    yelp:      'https://www.yelp.com/biz/natabel-pristine-cleaning-rocklin',
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
      areas:               { src: 'https://images.unsplash.com/photo-1569336414137-3a9a0e5ae986', alt: 'Rocklin and Placer County neighborhood' },
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
    notifyEmail: 'natabelpristinecleaning@gmail.com',
  },

  /* ---------- Analytics & conversion tracking ---------- */
  analytics: {
    ga4Id: '',
    adsId: '',
    facebookPixelId: '',
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
    quoteContactSubmitted:    'quote_contact_submitted',
    quoteRevealed:            'quote_revealed',
    quoteDeliveryFailed:      'quote_delivery_failed',
    lead:                     'lead',
  },
};

/* ---------- Tiny helpers exposed globally ---------- */
window.PCC.util = {
  telHref: () => window.PCC.business.phoneHref,
  track(eventName, params = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    if (typeof window.fbq === 'function' && eventName === window.PCC.events.lead) window.fbq('track', 'Lead', params);
    if (window.console && console.debug) console.debug('[track]', eventName, params);
  },
  getUTM() {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source:   p.get('utm_source')   || '',
      utm_medium:   p.get('utm_medium')   || '',
      utm_campaign: p.get('utm_campaign') || '',
      utm_term:     p.get('utm_term')     || '',
      utm_content:  p.get('utm_content')  || '',
      landing_page: window.location.pathname,
      referrer:     document.referrer,
    };
  },
};
