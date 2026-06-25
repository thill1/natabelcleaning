/* =========================================================================
   NATABEL CLEANING SERVICES — Central Configuration
   Global object: window.PCC (project config container)
   Everything else reads from this object.
   ========================================================================= */

window.PCC = {
  /* ---------- Business identity (NAP — keep consistent everywhere) ---------- */
  business: {
    name:     'Natabel Cleaning Services',
    legalName:'Natabel Cleaning Services',
    founder:  'Fatima Patalano',
    tagline:  'The Art of Clean \u00b7 Sacramento',
    description:
      'Natabel Cleaning Services is Sacramento\u2019s premium residential and commercial cleaning company. ' +
      'Founder-led by Fatima Patalano, we deliver meticulous house cleaning, deep cleaning, recurring office cleaning, ' +
      'janitorial service, and move-in/move-out cleaning across Sacramento and surrounding communities.',
    phone:          '(916) 555-0148',
    phoneHref:      'tel:+19165550148',
    email:          'hello@natabelcleaning.com',
    url:            'https://www.natabelcleaning.com',
    streetAddress:  'Sacramento, CA',
    addressLocality:'Sacramento',
    addressRegion:  'CA',
    postalCode:     '95814',
    geo:            { lat: 38.5816, lng: -121.4944 },
    founded:        '2021',
    licenseNumber:  'Lic# pending',
    hours: [
      { days: 'Mon \u2013 Fri', time: '7:00 AM \u2013 6:00 PM' },
      { days: 'Saturday',  time: '8:00 AM \u2013 4:00 PM' },
      { days: 'Sunday',    time: 'By appointment' },
    ],
    serviceAreas: [
      'Sacramento','Roseville','Rocklin','Folsom','Elk Grove','Davis',
      'Rancho Cordova','Carmichael','Citrus Heights','Fair Oaks','Orangevale',
      'West Sacramento','Natomas','Midtown Sacramento','East Sacramento',
      'Land Park','Arden-Arcade',
    ],
  },

  /* ---------- Social ---------- */
  social: {
    facebook:  'https://facebook.com/natabelcleaning',
    instagram: 'https://instagram.com/natabelcleaning',
    google:    'https://g.page/natabelcleaning',
    yelp:      'https://yelp.com/biz/natabelcleaning',
  },

  /* ---------- Reviews (placeholders \u2014 replace with real reviews) ---------- */
  reviews: {
    googleRating: 4.9,
    reviewCount:  127,
    yearsInBusiness: 4,
    clientsServed:  '340+',
    recurringAccounts: '60+',
  },

  /* ---------- Photography (Unsplash — replace with owned assets when ready) ---------- */
  images: {
    pages: {
      default:             { src: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', alt: 'Professional cleaner in a bright, tidy home' },
      commercial:          { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c', alt: 'Modern Sacramento office interior' },
      office:              { src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2', alt: 'Clean open-plan office workspace' },
      janitorial:          { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', alt: 'Commercial building lobby' },
      residential:         { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', alt: 'Sunlit residential living room' },
      deep:                { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', alt: 'Spotless modern kitchen interior' },
      move:                { src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3', alt: 'Empty home ready for move-in cleaning' },
      recurring:           { src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0', alt: 'Well-maintained family home interior' },
      property:            { src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa', alt: 'Rental property exterior and entryway' },
      about:               { src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf', alt: 'Founder-led cleaning team at work' },
      contact:             { src: 'https://images.unsplash.com/photo-1423666639043-f5600c2da73b', alt: 'Customer service and communication' },
      faq:                 { src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85', alt: 'Planning documents on a desk' },
      reviews:             { src: 'https://images.unsplash.com/photo-1556745750-68295e2c6992', alt: 'Happy client in a clean space' },
      areas:               { src: 'https://images.unsplash.com/photo-1569336414137-3a9a0e5ae986', alt: 'Sacramento area neighborhood' },
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
    notifyEmail: 'hello@natabelcleaning.com',
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
