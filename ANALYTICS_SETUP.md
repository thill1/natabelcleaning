# NataBel website analytics setup

## Production configuration

The website uses direct vendor loading because it is a no-build static Vercel site. Google Tag Manager is not needed for the current architecture.

Set the two production IDs in [`js/config.js`](js/config.js):

```js
analytics: {
  ga4Id: 'G-6SNEG7DFXE',
  clarityProjectId: 'yfwdvy2f9e',
  defaultConsent: 'granted',
  honorGlobalPrivacyControl: true,
  consentStorageKey: 'natabel.analytics.consent.v1',
}
```

These are the production IDs for the NataBel website. Blank or placeholder values still fail closed: the vendor scripts do not load and no vendor network request is made. This checkout is linked to the Vercel project `natabelcleaning-prod` (`prj_fEviSoyj9eaJHojLRK0yrLu4pTyz`).

The site is configured for direct deployment from the repository. After adding the IDs, deploy the change to the production Vercel project and verify the production domain before relying on the data.

## Consent and privacy behavior

- Optional analytics are on by default without a first-visit prompt, so normal site navigation is uninterrupted.
- An explicit choice is stored in `localStorage` under `natabel.analytics.consent.v1`.
- A persistent, unobtrusive **Privacy choices** control lets a visitor turn analytics off or back on in one step.
- Supported Global Privacy Control signals are honored automatically and keep optional analytics off.
- GA4 advertising storage, Google Signals, ad personalization, and enhanced measurement are disabled.
- Clarity masks every input, select, and textarea before loading. The site sends Clarity an affirmative Consent V2 signal only after an explicit user choice; without one, Clarity can apply its required regional no-consent mode.
- Opting out updates both vendors to denied, clears applicable first-party analytics cookies, and prevents the shared event layer from queuing later behavioral events.
- The event layer allowlists non-PII fields. Names, emails, phone numbers, street addresses, notes, application answers, raw URLs, and raw referrers are excluded from GA4 and Clarity events.

The public explanation lives in [`privacy.html`](privacy.html). This implementation is an engineering control, not legal advice; Troy should confirm the final notice and consent posture with NataBel’s privacy counsel.

## Event layer

Application code calls `window.PCC.util.track(eventName, params)` from `js/config.js`. The event layer adds first/last-touch attribution and filters values before sending to GA4 or Clarity.

Implemented event names include:

- `page_view`, `service_page_viewed`, `cta_click`, `phone_click`, `email_click`
- `quote_started`, `quote_home_details_completed`, `quote_price_viewed`, `quote_contact_started`, `quote_submitted`
- `booking_started`, `booking_completed`
- `commercial_walkthrough_started`, `commercial_walkthrough_submitted`
- `application_started`, `application_submitted`

Quote events include safe dimensions when available: `service_type`, `frequency`, `square_footage_band`, `bedrooms`, `bathrooms`, approved service-area `city`, `region`, and `estimated_price`. Lead/application events include `lead_type` and stage metadata only.

The residential quote sequence is intentionally fixed: `quote_started` fires on entry, `quote_home_details_completed` when the customer commits the service and square footage, `quote_price_viewed` when the one-time locked estimate is revealed, and `quote_contact_started` only after the customer chooses **Save My Estimate & Continue**. The locked service, square footage, and displayed amount stay in first-party `sessionStorage` for 30 minutes so refreshing the page does not create an editable estimate or a duplicate price-view event. No identity fields are stored in that lock.

## UTM attribution and OfficePro readiness

When a URL contains UTM parameters, the site immediately stores a sanitized first-touch and last-touch record in `localStorage` under `natabel.analytics.attribution.v1`, independently of optional vendor consent. This first-party capture does not contact GA4 or Clarity and lets attribution survive navigation into the quote or application funnel. The lead payload continues to include `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `traffic_source`, `campaign`, and `landing_page`, so the future OfficePro bridge can map attribution to a lead without changing the form contracts.

Recommended OfficePro mapping:

| Website field | Future OfficePro field |
| --- | --- |
| `utm_source` | `attribution.source` |
| `utm_medium` | `attribution.medium` |
| `utm_campaign` | `attribution.campaign` |
| `utm_content` | `attribution.content` |
| `traffic_source` | `attribution.channel` |
| `landing_page` | `attribution.first_landing_page` |
| `quote_submitted` / `application_submitted` | `conversion.event` |

No customer identity is sent to the analytics vendors. Identity remains in the existing lead/quote delivery path, where it can later be joined inside OfficePro using the lead system’s own durable identifier.

## Local validation

1. Serve the repository as a static site and open `/` or `/free-estimate.html`.
2. With blank IDs, confirm there are no requests to `googletagmanager.com` or `clarity.ms`.
3. With configured IDs and no stored choice, confirm both vendors load by default, no first-visit prompt appears, and the persistent **Privacy choices** control is available.
4. Inspect `window.dataLayer` and confirm event objects contain only the documented non-PII fields.
5. Use the quote funnel through each step and verify the quote milestone events; use a test endpoint or mocked request for submission.
6. Verify application and booking start/submit events without entering real personal information.
7. Opt out and confirm later behavioral events stop, applicable first-party analytics cookies are cleared, and the choice persists across navigation.
8. In GA4 DebugView and Clarity after production deployment, confirm default-on events arrive and that form fields remain masked.

Remaining governance action:

- Have privacy counsel confirm that the prompt-free default-on analytics posture, vendor contracts, retention settings, and privacy policy meet NataBel’s final California, federal, and visitor-jurisdiction requirements. The event contracts do not depend on the consent presentation and can be revised later.
