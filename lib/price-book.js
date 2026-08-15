/*
 * Approved recurring residential pricing transcribed from Fatima's
 * August 2026 rate sheet. Square footage is the pricing key; bedrooms and
 * bathrooms are collected as quote-validation details, not price multipliers.
 *
 * Deep cleans, move-in / move-out work, first-visit reset premiums, homes over
 * 3,500 sq ft, and optional upgrades remain manual until separate rates are
 * approved. Never invent those values.
 */
module.exports = {
  version: 'fatima-recurring-2026-08-15',
  enabled: true,
  entries: [
    { service_type: 'standard', frequency: 'weekly',   minSqft: 200,  maxSqft: 850,  fixedPrice: 130 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 200,  maxSqft: 850,  fixedPrice: 150 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 200,  maxSqft: 850,  fixedPrice: 170 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 851,  maxSqft: 1100, fixedPrice: 155 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 851,  maxSqft: 1100, fixedPrice: 175 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 851,  maxSqft: 1100, fixedPrice: 195 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 1101, maxSqft: 1400, fixedPrice: 170 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 1101, maxSqft: 1400, fixedPrice: 190 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 1101, maxSqft: 1400, fixedPrice: 210 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 1401, maxSqft: 2000, fixedPrice: 225 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 1401, maxSqft: 2000, fixedPrice: 245 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 1401, maxSqft: 2000, fixedPrice: 265 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 2001, maxSqft: 2500, fixedPrice: 290 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 2001, maxSqft: 2500, fixedPrice: 310 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 2001, maxSqft: 2500, fixedPrice: 330 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 2501, maxSqft: 3500, fixedPrice: 355 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 2501, maxSqft: 3500, fixedPrice: 375 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 2501, maxSqft: 3500, fixedPrice: 395 }
  ],
  addOns: {}
};
