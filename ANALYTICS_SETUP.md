# NataBel website analytics setup

## Production configuration

The website uses direct vendor loading because it is a no-build static Vercel site. Google Tag Manager is not needed for the current architecture.

Set the two production IDs in [`js/config.js`](js/config.js):

```js
analytics: {
  ga4Id: 'G-6SNEG7DFXE',
  clarityProjectId: 'yfwdvy2f9e',
  consentRequired: true,
  consentStorageKey: 'natabel.analytics.consent.v1',
}
```

These are the production IDs for the NataBel website. Blank or placeholder values still fail closed: the vendor scripts do not load and no vendor network request is made. This checkout is linked to the Vercel project `natabelcleaning-prod` (`prj_fEviSoyj9eaJHojLRK0yrLu4pTyz`).

The site is configured for direct deployment from the repository. After adding the IDs, deploy the change to the production Vercel project and verify the production domain before relying on the data.

## Consent and privacy behavior

- Optional analytics are off until the visitor chooses **Allow analytics**.
- The choice is stored in `localStorage` under `natabel.analytics.consent.v1`.
- A persistent **Privacy choices** control lets a visitor reopen the choice.
- GA4 advertising features are disabled; only analytics storage is granted after opt-in.
- Clarity loads only after opt-in and masks every input, select, and textarea before loading.
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

## UTM attribution and OfficePro readiness

When a URL contains UTM parameters, the site stores a sanitized first-touch and last-touch record in `localStorage` under `natabel.analytics.attribution.v1`. The lead payload continues to include `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `traffic_source`, `campaign`, and `landing_page`, so the future OfficePro bridge can map attribution to a lead without changing the form contracts.

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
3. Temporarily use test IDs in a local-only copy of `js/config.js`, choose **Allow analytics**, and confirm `window.PCC.analytics.loaded` reports the configured vendor(s).
4. Inspect `window.dataLayer` and confirm event objects contain only the documented non-PII fields.
5. Use the quote funnel through each step and verify the quote milestone events; use a test endpoint or mocked request for submission.
6. Verify application and booking start/submit events without entering real personal information.
7. In GA4 DebugView and Clarity after production deployment, confirm events arrive only after consent and that form fields are masked.

Remaining governance action:

- Have privacy counsel confirm that the opt-in wording and privacy notice meet NataBel’s final California requirements. The current implementation deliberately uses prior opt-in and can be revised without changing the event contracts.
