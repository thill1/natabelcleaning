/*
 * Approved residential pricing based on Fatima's August 2026 rate sheet.
 * Square footage is the pricing key; bedrooms and bathrooms are collected as
 * quote-validation details, not price multipliers.
 *
 * Pricing rules:
 * - Monthly is the square-footage base price.
 * - Biweekly is $25 less than monthly.
 * - Weekly is $20 less than biweekly.
 * - Move-in / move-out is the square-footage base price plus $175.
 *
 * Deep cleans, first-visit reset premiums, homes over 3,500 sq ft, and optional
 * upgrades remain manual until separate rates are approved. Never invent values.
 */
module.exports = {
  version: 'fatima-residential-2026-08-16',
  enabled: true,
  entries: [
    { service_type: 'standard', frequency: 'weekly',   minSqft: 200,  maxSqft: 850,  fixedPrice: 125 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 200,  maxSqft: 850,  fixedPrice: 145 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 200,  maxSqft: 850,  fixedPrice: 170 },
    { service_type: 'move',     frequency: 'one_time', minSqft: 200,  maxSqft: 850,  fixedPrice: 345 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 851,  maxSqft: 1100, fixedPrice: 150 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 851,  maxSqft: 1100, fixedPrice: 170 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 851,  maxSqft: 1100, fixedPrice: 195 },
    { service_type: 'move',     frequency: 'one_time', minSqft: 851,  maxSqft: 1100, fixedPrice: 370 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 1101, maxSqft: 1400, fixedPrice: 165 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 1101, maxSqft: 1400, fixedPrice: 185 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 1101, maxSqft: 1400, fixedPrice: 210 },
    { service_type: 'move',     frequency: 'one_time', minSqft: 1101, maxSqft: 1400, fixedPrice: 385 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 1401, maxSqft: 2000, fixedPrice: 220 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 1401, maxSqft: 2000, fixedPrice: 240 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 1401, maxSqft: 2000, fixedPrice: 265 },
    { service_type: 'move',     frequency: 'one_time', minSqft: 1401, maxSqft: 2000, fixedPrice: 440 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 2001, maxSqft: 2500, fixedPrice: 285 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 2001, maxSqft: 2500, fixedPrice: 305 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 2001, maxSqft: 2500, fixedPrice: 330 },
    { service_type: 'move',     frequency: 'one_time', minSqft: 2001, maxSqft: 2500, fixedPrice: 505 },

    { service_type: 'standard', frequency: 'weekly',   minSqft: 2501, maxSqft: 3500, fixedPrice: 350 },
    { service_type: 'standard', frequency: 'biweekly', minSqft: 2501, maxSqft: 3500, fixedPrice: 370 },
    { service_type: 'standard', frequency: 'monthly',  minSqft: 2501, maxSqft: 3500, fixedPrice: 395 },
    { service_type: 'move',     frequency: 'one_time', minSqft: 2501, maxSqft: 3500, fixedPrice: 570 }
  ],
  addOns: {}
};
