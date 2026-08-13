const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateResidential, roundRange } = require('../lib/quote-pricing');

const input = {
  service_type: 'standard', frequency: 'biweekly', property_type: 'house',
  condition: 'average', square_footage: 1800, bedrooms: '3', bathrooms: '2', zip: '95765'
};

test('production-disabled book fails closed without inventing a number', () => {
  assert.deepEqual(calculateResidential(input, { enabled: false }), {
    status: 'manual_review_required', reason: 'pricing_not_configured'
  });
});

test('approved fixed rate becomes a rounded plus-or-minus ten percent range', () => {
  const book = {
    enabled: true, version: 'fixture-v1', addOns: {},
    entries: [{ service_type: 'standard', frequency: 'biweekly', minSqft: 1501, maxSqft: 2000, fixedPrice: 200 }]
  };
  const result = calculateResidential(input, book);
  assert.equal(result.status, 'estimated');
  assert.equal(result.quote.low, 180);
  assert.equal(result.quote.high, 225);
  assert.equal(result.quote.rateBookVersion, 'fixture-v1');
});

test('missing approved rate fails closed', () => {
  const result = calculateResidential(input, { enabled: true, version: 'fixture', entries: [], addOns: {} });
  assert.equal(result.status, 'manual_review_required');
  assert.equal(result.reason, 'rate_not_found');
});

test('range uses five-dollar floor and ceiling', () => {
  assert.deepEqual(roundRange(187), { low: 165, high: 210 });
});

test('invalid inputs are rejected', () => {
  assert.throws(() => calculateResidential({ ...input, zip: 'abc' }, { enabled: false }), /invalid_zip/);
});
