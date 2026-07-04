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
      'Founder-led by Fatima Patalano, we bring meticulous standards, vetted teams, and a pristine finish to every home, office, and facility we serve.',
    /* Business line */
    phone:          '(916) 899-8811',
    phoneHref:      'tel:+19168998811',
    email:          'natabelpritinecleaning@gmail.com',
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

  /* ---------- Social ---------- */
  social: {
    facebook:  'https://facebook.com/natabelcleaning',
    instagram: 'https://instagram.com/natabelcleaning',
    google:    'https://g.page/natabelcleaning',
    yelp:      'https://yelp.com/biz/natabelcleaning',
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
      { icon: 'shield-check', num: 'Bonded', label: 'Licensed, insured & background-checked' },
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
      default:             { src: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', alt: 'Professional cleaner in a bright, tidy home' },
      commercial:          { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c', alt: 'Modern Rocklin office interior' },
      office:              { src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2', alt: 'Clean open-plan office workspace' },
      janitorial:          { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', alt: 'Commercial building lobby' },
      residential:         { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', alt: 'Sunlit residential living room' },
      deep:                { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', alt: 'Spotless modern kitchen interior' },
      move:                { src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3', alt: 'Empty home ready for move-in cleaning' },
      recurring:           { src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0', alt: 'Well-maintained family home interior' },
      property:            { src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa', alt: 'Rental property exterior and entryway' },
      about:               { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', alt: 'Pristine Rocklin home interior' },
      contact:             { src: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b', alt: 'Customer service and communication' },
      faq:                 { src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85', alt: 'Planning documents on a desk' },
      reviews:             { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', alt: 'Polished kitchen detail after cleaning' },
      areas:               { src: 'https://images.unsplash.com/photo-1569336414137-3a9a0e5ae986', alt: 'Rocklin and Placer County neighborhood' },
      booking:             { src: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335', alt: 'Calendar and scheduling' },
      estimate:            { src: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c', alt: 'Estimate consultation in a clean home' },
    },
  },

  /* ---------- Lead routing ----------
     Submit handler posts JSON to PCC.leads.endpoint when set.
     Quick setup: deploy scripts/leads-webhook.gs as a Google Apps Script web app,
     paste the deployment URL below, and demo mode turns off automatically.
     Also works with Jobber / Housecall Pro / GoHighLevel / Make / Zapier webhooks. */
  leads: {
    endpoint: '',
    method:   'POST',
    includeUTM: true,
    demoMode: true,
    notifyEmail: 'natabelpritinecleaning@gmail.com',
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
