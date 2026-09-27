# NataBel Residential Pricing Tiers — Production Implementation Spec

Repository: `thill1/natabelcleaning`
Branch: `feature/residential-pricing-tiers`

## Objective
Replace the single recurring residential product with three recurring service levels:
1. Pristine Care
2. Pristine Signature
3. Pristine Concierge

Pristine Signature is the primary/most-prominent offer.

Keep Deep Cleaning and Move-In / Move-Out as separate one-time services.

Preserve the existing NataBel visual system, lead delivery, analytics, accessibility, service-area logic, and responsive behavior. Do not redesign unrelated parts of the site.

## Existing production pricing
Current server-side price book in `api/quote.js`:
- baseCharge: 75
- standard: 0.06
- deep: 0.17
- move: 0.30
- standard minimum: 125

Current Move formula must remain fundamentally unchanged:
`$75 + $0.30 × square footage`

Regression example:
1,840 sq. ft. = `75 + (1840 × .30) = 627`

## New price book
Use the existing server-side price book as the source of truth.

```js
const priceBook = {
  version: 'natabel-pristine-tiers-2026-09',
  enabled: true,
  baseCharge: 75,

  recurring: {
    care: {
      weekly: 0.06,
      biweekly: 0.07,
      monthly: 0.08,
      minimum: 165
    },
    signature: {
      weekly: 0.09,
      biweekly: 0.10,
      monthly: 0.11,
      minimum: 210
    },
    concierge: {
      weekly: 0.12,
      biweekly: 0.13,
      monthly: 0.14,
      minimum: 255
    }
  },

  oneTime: {
    deep: { rate: 0.17, minimum: 325 },
    move: { rate: 0.30, minimum: 425 }
  }
};
```

Equivalent implementation is acceptable if the same values and behavior are preserved.

## Pricing formulas

Recurring:
```text
price = max(
  75 + squareFootage × recurring[tier][frequency],
  tier.minimum
)
```

Deep:
```text
max(75 + squareFootage × .17, 325)
```

Move:
```text
max(75 + squareFootage × .30, 425)
```

Continue using `Math.ceil` / current whole-dollar upward rounding behavior.

## Required recurring pricing checks at 2,500 sq. ft.

Care:
- weekly: 225
- biweekly: 250
- monthly: 275

Signature:
- weekly: 300
- biweekly: 325
- monthly: 350

Concierge:
- weekly: 375
- biweekly: 400
- monthly: 425

Minimums:
- Care 165
- Signature 210
- Concierge 255
- Deep 325
- Move 425

Regression:
- Move, 1,840 sq. ft. = 627
- Deep, 2,500 sq. ft. = 500

## Customer-facing recurring tiers

### Pristine Care
Tagline: **Beautifully maintained.**

Positioning:
Reliable professional cleaning for homes that need consistent care without additional detail services.

Include:
- Kitchen surfaces
- Sink
- Exterior appliances
- Bathrooms
- Reachable surface dusting
- Bedrooms
- Living areas
- Mirrors
- Vacuuming
- Floor care
- Trash removal
- General straightening

Best for:
**Well-maintained homes that want dependable recurring cleaning.**

CTA:
**See My Care Price**

### Pristine Signature
Badge:
**MOST CHOSEN**

Tagline:
**The complete NataBel experience.**

Copy:
"Our signature recurring service adds thoughtful detail work to the essentials, so your home doesn't just look clean. It feels cared for."

Include everything in Care plus:
- Detailed kitchen attention
- Detailed bathroom attention
- Cabinet fronts
- Window sills
- Doors and frames
- Stainless-steel polishing
- Detailed shower glass
- Baseboards on rotation
- Ceiling fans and reachable fixtures on rotation
- Rotating detail area each visit

Best for:
**Homeowners who want the details consistently handled without having to ask.**

CTA:
**See My Signature Price**

### Pristine Concierge
Tagline:
**Personalized care, elevated.**

Copy:
"Our highest level of recurring service for clients who want more of the home handled and more flexibility built into every visit."

Include everything in Signature plus:
- Priority focus areas
- Linen changes
- Light organization
- Expanded detail cleaning
- Two Concierge Enhancements per visit
- Priority scheduling when available

Best for:
**Busy households, luxury homes, and clients who want cleaning tailored around their priorities.**

CTA:
**See My Concierge Price**

Concierge must not imply unlimited custom work.

## Specialty services
Remain optional and separately priced:
- Inside refrigerator
- Inside oven
- Wall washing
- Carpet cleaning
- Exterior windows
- Garage cleaning
- Hauling
- Excessive debris removal

Preserve the existing optional-service flow where possible.

## Visual treatment
Reuse existing:
- Fraunces
- Plus Jakarta Sans
- noir / ivory / champagne gold
- existing CSS tokens and shadows

Do not introduce a new design system.

Care card:
- white/ivory
- fine neutral border
- restrained brass accent

Signature card:
- visual hero
- noir background
- ivory text
- champagne/brass border
- existing premium shadow
- slightly taller/more prominent
- champagne badge: MOST CHOSEN
- primary CTA in brass

Concierge:
- warm ivory or brass-soft
- thin champagne border
- premium but quieter than Signature

Customer-facing UI should show total per-visit pricing, not prominently display cents per square foot.

Optional explanatory link:
**How is my price calculated?**
Copy:
"Your price is based on your home size, selected level of care, and cleaning frequency."

## Website information architecture

### residential.html
Replace the existing "Three straightforward choices / What does your home need?" section.

Recommended hierarchy:
1. Existing hero
2. Care / Signature / Concierge
3. Plan comparison
4. Frequency explanation
5. Pristine Reset
6. Pristine Move
7. Pricing explanation
8. Pristine Guarantee
9. Instant Quote CTA

Do not unnecessarily redesign the hero or unrelated sections.

Recurring section heading:
**Choose your Pristine experience.**

Supporting copy:
"Every home is different. Choose the NataBel experience that matches how you live, how often you want us there, and how much detail you want handled for you."

Add:
**No hourly guessing. No payment required to get your estimate.**

### recurring-cleaning.html
Convert from a frequency-only page into a dedicated Care / Signature / Concierge page while retaining SEO relevance for recurring cleaning.

## Frequency copy
Heading:
**More frequent care means better value.**

Weekly:
"Ideal for active households, pets, entertaining, and homes where you want the Pristine feeling maintained continuously."

Every Two Weeks:
"Our most popular rhythm. A strong balance of consistency, value, and detail."

Every Four Weeks:
"A deeper scheduled refresh for homes that need professional attention less frequently."

## Deep Cleaning
Customer-facing name:
**Pristine Reset**

Subheading:
**Deep Cleaning**

Heading:
**Need a fresh start first?**

Copy:
"Sometimes a home needs more than maintenance.

Pristine Reset is our detailed one-time cleaning for accumulated buildup, first-time professional cleaning, seasonal resets, or homes preparing to begin recurring NataBel service."

Display:
**Starting at $325**

CTA:
**Get My Deep Clean Estimate**

Do not imply heavy-condition work is automatically included at base price.

## Move-In / Move-Out
Customer-facing name:
**Pristine Move**

Subheading:
**Move-In / Move-Out Cleaning**

Heading:
**Moving?**

Copy:
"Start fresh or leave beautifully.

Pristine Move is designed for empty or transitioning homes and provides the detailed cleaning needed for a new beginning, final walkthrough, sale, or rental turnover."

Display:
**Starting at $425**

CTA:
**Get My Move Clean Estimate**

Preserve existing exclusions/final-review language.

## Quote funnel

Current:
Home Size → Cleaning Type → Estimate → Details → Review

New recurring path:
Home Size → Cleaning Type → Pristine Level → Frequency → Estimate → Details → Review

Deep and Move must bypass the Pristine Level step and remain one-time.

Cleaning type options:
- Recurring Cleaning — "Ongoing professional care on a dependable schedule."
- Pristine Reset — "Detailed one-time cleaning for homes that need extra attention."
- Pristine Move — "Detailed cleaning for an empty or transitioning home."

Recurring tier step:
- Pristine Care — "Beautifully maintained."
- Pristine Signature — "The complete NataBel experience." + MOST CHOSEN
- Pristine Concierge — "Personalized care, elevated."

Do not preselect a tier unless done intentionally and transparently.

Frequency step for recurring:
- Weekly
- Every 2 weeks
- Every 4 weeks

Frequency must affect the estimate.

Deep/Move remain `one_time`.

## Home condition / clutter
Do not add bedroom, bathroom, pet, clutter, or condition pricing multipliers.

Continue collecting these fields for final review.

If `condition === heavy` or `clutter === heavy`, show:
**This home may require a Pristine Reset before recurring service begins. Fatima will review the details before confirming your appointment.**

Do not automatically change the displayed estimate.

## Estimate language
Recurring: **per visit**
One-time: **one-time estimate**

Preserve:
- no payment collected
- final pricing confirmed after review
- specialty services separate
- requested date not guaranteed until confirmed

## Primary page copy

Residential hero for pricing area:
### Residential Cleaning
# A cleaner home, at the level of care that fits your life.

"Every home is different. Choose the NataBel experience that matches how you live, how often you want us there, and how much detail you want handled for you."

CTA:
**See My Price**

Final CTA:
### A clear price before you request service.

"Enter your home's square footage, choose the service that fits, and see your NataBel estimate before submitting your cleaning request.

No payment is collected.

Fatima reviews the property details, requested date, condition, and any specialty services before your appointment is confirmed."

Final heading:
**Your home. Your rhythm. The Pristine standard.**

CTA:
**See My Instant Estimate**

Guarantee:
### The Pristine Guarantee
"If something included in your confirmed cleaning scope isn't pristine, let us know within 24 hours and we'll return to address the missed area."

## Data model
Recurring quote requests must identify:
- service_type
- tier
- frequency
- square_footage

Tier values:
- care
- signature
- concierge

Preserve all existing lead fields.

Business and customer quote emails should identify selected tier prominently.

Example:
- Cleaning Type: Recurring Cleaning
- Pristine Level: Signature
- Frequency: Every 2 Weeks
- Square Footage: 2,500
- Calculated Estimate: $325 per visit

## Analytics
Preserve current analytics.
Add tier as a safe categorical field when recurring is selected:
`tier: care | signature | concierge`

Do not send PII through analytics.

## Validation
Reject:
- invalid tier
- recurring without valid frequency
- recurring without valid tier
- Deep / Move with recurring frequency
- Deep / Move with recurring tier
- zero/negative square footage
- unsupported service type

Preserve service-area validation.

## Expected files
Likely:
- api/quote.js
- tests/quote-pricing.test.js
- tests/quote-api.test.js
- js/funnel-template.js
- js/funnel.js
- residential.html
- recurring-cleaning.html
- css/quote-conversion.css
- css/styles.css and/or css/simplified.css

Change other files only if necessary.

Do not duplicate pricing constants in front-end code. Server-side price book remains source of truth.

## Responsive
Desktop: 3-column cards
Mobile: single-column cards
Recommended mobile order:
1. Signature
2. Care
3. Concierge

No horizontal scrolling.

## Accessibility
Preserve:
- keyboard navigation
- radio semantics
- visible focus states
- labels
- contrast
- aria-live estimate updates
- reduced motion
- semantic headings

## Out of scope
Do not:
- redesign commercial pricing
- redesign unrelated navigation
- change branding
- change phone/email routing
- add payment collection
- add automatic booking
- invent surcharges
- alter service-area logic unnecessarily
- add bedroom/bathroom/pet/condition multipliers
- lower Move below 0.30/sq. ft.
- convert Deep or Move into tiered services

## Acceptance criteria
1. Care, Signature, Concierge visible on residential site.
2. Signature clearly emphasized as primary offer.
3. Recurring pricing varies by tier and frequency.
4. Deep and Move remain one-time services.
5. Move 1,840 sq. ft. remains $627.
6. Pricing stays server-side.
7. No conflicting front-end price book.
8. Quote emails include tier.
9. Existing lead delivery works.
10. Existing service-area validation works.
11. Existing analytics work.
12. Tests cover new formulas/minimums.
13. Mobile UX is clean.
14. No unrelated redesign.
15. Existing noir / ivory / champagne identity is preserved.

Before completion:
- run full existing test suite
- inspect quote flow at desktop and mobile widths
- report files changed, tests, assumptions, risks, and migration concerns
