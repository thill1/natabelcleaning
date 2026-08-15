const test = require('node:test');
const assert = require('node:assert/strict');
const priceBook = require('../lib/price-book');
const { calculateResidential, exactRange } = require('../lib/quote-pricing');

const input = {
  service_type: 'standard', frequency: 'biweekly', property_type: 'house',
  condition: 'average', square_footage: 1800, bedrooms: '3', bathrooms: '2', zip: '95765'
};

test('disabled book fails closed without inventing a number', () => {
  assert.deepEqual(calculateResidential(input, { enabled: false }), {
    status: 'manual_review_required', reason: 'pricing_not_configured'
  });
});

test('approved recurring rate returns an exact per-visit price', () => {
  const result = calculateResidential(input, priceBook);
  assert.equal(result.status, 'estimated');
  assert.equal(result.quote.amount, 245);
  assert.equal(result.quote.low, 245);
  assert.equal(result.quote.high, 245);
  assert.equal(result.quote.rateBookVersion, 'fatima-recurring-2026-08-15');
});

test('all approved size tiers map to Fatima recurring rates', () => {
  const cases = [
    [800, 130, 150, 170],
    [1000, 155, 175, 195],
    [1250, 170, 190, 210],
    [1800, 225, 245, 265],
    [2200, 290, 310, 330],
    [3000, 355, 375, 395]
  ];
  for (const [square_footage, weekly, biweekly, monthly] of cases) {
    for (const [frequency, expected] of [['weekly', weekly], ['biweekly', biweekly], ['monthly', monthly]]) {
      const result = calculateResidential({ ...input, square_footage, frequency }, priceBook);
      assert.equal(result.quote.amount, expected, `${square_footage} ${frequency}`);
    }
  }
});

test('homes over 3,500 sq ft require manual review', () => {
  const result = calculateResidential({ ...input, square_footage: 3600 }, priceBook);
  assert.equal(result.status, 'manual_review_required');
  assert.equal(result.reason, 'rate_not_found');
});

test('unapproved service types require manual review', () => {
  const result = calculateResidential({ ...input, service_type: 'deep' }, priceBook);
  assert.equal(result.status, 'manual_review_required');
  assert.equal(result.reason, 'rate_not_found');
});

test('exact range preserves approved price', () => {
  assert.deepEqual(exactRange(187), { low: 187, high: 187 });
});

test('invalid inputs are rejected', () => {
  assert.throws(() => calculateResidential({ ...input, zip: 'abc' }, priceBook), /invalid_zip/);
});
