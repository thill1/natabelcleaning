/* =========================================================================
   NATABEL CLEANING SERVICES — Central Configuration
   Change NAP (Name / Address / Phone), endpoints, and tracking IDs here.
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

  /* ---------- Lead routing ----------
     Submit handler posts JSON to this endpoint if set.
     Integrate with: Jobber / Housecall Pro / GoHighLevel webhook /
     Google Apps Script (Google Sheet) / Make / Zapier / custom CRM.
     Leave as '' to run in demo mode (logs to console + shows success). */
  leads: {
    endpoint: '',
    method:   'POST',
    includeUTM: true,
    demoMode: true,
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
