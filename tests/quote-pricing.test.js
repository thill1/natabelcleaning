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
  assert.equal(result.quote.amount, 240);
  assert.equal(result.quote.low, 240);
  assert.equal(result.quote.high, 240);
  assert.equal(result.quote.rateBookVersion, 'fatima-residential-2026-08-16');
});

test('frequency discounts follow monthly base minus 25 biweekly and minus 20 weekly', () => {
  const cases = [
    [800, 125, 145, 170],
    [1000, 150, 170, 195],
    [1250, 165, 185, 210],
    [1800, 220, 240, 265],
    [2200, 285, 305, 330],
    [3000, 350, 370, 395]
  ];
  for (const [square_footage, weekly, biweekly, monthly] of cases) {
    assert.equal(monthly - biweekly, 25, `${square_footage} monthly to biweekly discount`);
    assert.equal(biweekly - weekly, 20, `${square_footage} biweekly to weekly discount`);
    for (const [frequency, expected] of [['weekly', weekly], ['biweekly', biweekly], ['monthly', monthly]]) {
      const result = calculateResidential({ ...input, square_footage, frequency }, priceBook);
      assert.equal(result.quote.amount, expected, `${square_footage} ${frequency}`);
    }
  }
});

test('move-in and move-out pricing is square-footage base plus 175', () => {
  const cases = [
    [800, 170, 345],
    [1000, 195, 370],
    [1250, 210, 385],
    [1800, 265, 440],
    [2200, 330, 505],
    [3000, 395, 570]
  ];
  for (const [square_footage, base, expected] of cases) {
    const result = calculateResidential({
      ...input,
      square_footage,
      service_type: 'move',
      frequency: 'one_time'
    }, priceBook);
    assert.equal(result.status, 'estimated');
    assert.equal(result.quote.amount, expected, `${square_footage} move price`);
    assert.equal(result.quote.amount - base, 175, `${square_footage} move premium`);
  }
});

test('homes over 3,500 sq ft require manual review', () => {
  const result = calculateResidential({ ...input, square_footage: 3600 }, priceBook);
  assert.equal(result.status, 'manual_review_required');
  assert.equal(result.reason, 'rate_not_found');
});

test('deep cleans remain manual review', () => {
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
