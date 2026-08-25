const test = require('node:test');
const assert = require('node:assert/strict');
const { priceBook, calculateResidential, exactRange } = require('../api/quote');

const input = {
  service_type: 'standard', frequency: 'biweekly', property_type: 'house',
  condition: 'average', square_footage: 1800, bedrooms: '3', bathrooms: '2', zip: '95765'
};

test('disabled pricing fails closed without inventing a number', () => {
  assert.deepEqual(calculateResidential(input, { enabled: false }), {
    status: 'manual_review_required', reason: 'pricing_not_configured'
  });
});

test('standard recurring cleaning is 75 dollars plus six cents per square foot', () => {
  const result = calculateResidential({ ...input, square_footage: 2500 }, priceBook);
  assert.equal(result.status, 'estimated');
  assert.equal(result.quote.amount, 225);
  assert.equal(result.quote.baseCharge, 75);
  assert.equal(result.quote.squareFootageCharge, 150);
  assert.equal(result.quote.ratePerSquareFoot, 0.06);
  assert.equal(result.quote.rateBookVersion, 'natabel-base-plus-square-footage-2026-08-25');
  assert.equal(result.quote.cadence, 'per_visit');
});

test('standard recurring cleaning applies the 125 dollar minimum', () => {
  const result = calculateResidential({ ...input, square_footage: 800 }, priceBook);
  assert.equal(result.quote.amount, 125);
  assert.equal(result.quote.minimumApplied, true);
});

test('standard pricing is the same for every recurring schedule', () => {
  for (const frequency of ['weekly', 'biweekly', 'monthly']) {
    const result = calculateResidential({ ...input, square_footage: 3000, frequency }, priceBook);
    assert.equal(result.quote.amount, 255, frequency);
  }
});

test('deep cleaning is 75 dollars plus twelve cents per square foot', () => {
  const result = calculateResidential({
    ...input,
    service_type: 'deep',
    frequency: 'one_time',
    square_footage: 1801
  }, priceBook);
  assert.equal(result.status, 'estimated');
  assert.equal(result.quote.amount, 292);
  assert.equal(result.quote.cadence, 'one_time');
});

test('move-in and move-out cleaning is 75 dollars plus twenty-five cents per square foot', () => {
  const result = calculateResidential({
    ...input,
    service_type: 'move',
    frequency: 'one_time',
    square_footage: 1801
  }, priceBook);
  assert.equal(result.status, 'estimated');
  assert.equal(result.quote.amount, 526);
  assert.equal(result.quote.cadence, 'one_time');
});

test('all formula estimates round up to the nearest whole dollar', () => {
  const standard = calculateResidential({ ...input, square_footage: 2101 }, priceBook);
  const deep = calculateResidential({ ...input, service_type: 'deep', frequency: 'one_time', square_footage: 2101 }, priceBook);
  const move = calculateResidential({ ...input, service_type: 'move', frequency: 'one_time', square_footage: 2101 }, priceBook);
  assert.equal(standard.quote.amount, 202);
  assert.equal(deep.quote.amount, 328);
  assert.equal(move.quote.amount, 601);
});

test('optional services are never included in the base estimate', () => {
  const result = calculateResidential({
    ...input,
    square_footage: 2500,
    add_ons: ['inside_oven', 'carpet_cleaning']
  }, priceBook);
  assert.equal(result.quote.amount, 225);
  assert.equal(result.quote.optionalServicesIncluded, false);
});

test('larger homes still use the approved square-footage formula', () => {
  const result = calculateResidential({ ...input, square_footage: 100000 }, priceBook);
  assert.equal(result.status, 'estimated');
  assert.equal(result.quote.amount, 6075);
});

test('all three services quote very small and very large homes', () => {
  const cases = [
    ['standard', 'biweekly', 1, 125],
    ['standard', 'biweekly', 100000, 6075],
    ['deep', 'one_time', 1, 76],
    ['deep', 'one_time', 100000, 12075],
    ['move', 'one_time', 1, 76],
    ['move', 'one_time', 100000, 25075]
  ];
  for (const [service_type, frequency, square_footage, expected] of cases) {
    const result = calculateResidential({ ...input, service_type, frequency, square_footage }, priceBook);
    assert.equal(result.status, 'estimated', `${service_type} ${square_footage}`);
    assert.equal(result.quote.amount, expected, `${service_type} ${square_footage}`);
  }
});

test('exact range preserves the rounded estimate', () => {
  assert.deepEqual(exactRange(187), { low: 187, high: 187 });
});

test('invalid inputs and service-frequency combinations are rejected', () => {
  assert.throws(() => calculateResidential({ ...input, zip: 'abc' }, priceBook), /invalid_zip/);
  assert.throws(() => calculateResidential({ ...input, square_footage: 0 }, priceBook), /invalid_square_footage/);
  assert.throws(() => calculateResidential({ ...input, square_footage: -1 }, priceBook), /invalid_square_footage/);
  assert.throws(() => calculateResidential({ ...input, service_type: 'deep' }, priceBook), /invalid_frequency/);
  assert.throws(() => calculateResidential({ ...input, frequency: 'one_time' }, priceBook), /invalid_frequency/);
});
