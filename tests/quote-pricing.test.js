const test = require('node:test');
const assert = require('node:assert/strict');
const { priceBook, calculateResidential, exactRange } = require('../api/quote');

const input = {
  service_type: 'standard', tier: 'signature', frequency: 'biweekly', property_type: 'house',
  condition: 'average', square_footage: 2500, bedrooms: '3', bathrooms: '2', zip: '95765'
};

test('disabled pricing returns manual review', () => {
  assert.deepEqual(calculateResidential(input, { enabled: false }), {
    status: 'manual_review_required', reason: 'pricing_not_configured'
  });
});

test('the server price book contains the approved tier architecture', () => {
  assert.equal(priceBook.version, 'natabel-pristine-tiers-2026-09');
  assert.equal(priceBook.baseCharge, 75);
  assert.deepEqual(priceBook.recurring, {
    care: { weekly: 0.06, biweekly: 0.07, monthly: 0.08, minimum: 165 },
    signature: { weekly: 0.09, biweekly: 0.10, monthly: 0.11, minimum: 210 },
    concierge: { weekly: 0.12, biweekly: 0.13, monthly: 0.14, minimum: 255 }
  });
  assert.deepEqual(priceBook.oneTime, {
    deep: { rate: 0.17, minimum: 325 },
    move: { rate: 0.30, minimum: 425 }
  });
});

test('all recurring tier and frequency checks are exact at 2,500 square feet', () => {
  const expected = {
    care: { weekly: 225, biweekly: 250, monthly: 275 },
    signature: { weekly: 300, biweekly: 325, monthly: 350 },
    concierge: { weekly: 375, biweekly: 400, monthly: 425 }
  };
  for (const [tier, frequencies] of Object.entries(expected)) {
    for (const [frequency, amount] of Object.entries(frequencies)) {
      const result = calculateResidential({ ...input, tier, frequency }, priceBook);
      assert.equal(result.status, 'estimated');
      assert.equal(result.quote.amount, amount, `${tier} ${frequency}`);
      assert.equal(result.quote.tier, tier);
      assert.equal(result.quote.cadence, 'per_visit');
      assert.equal(result.quote.baseCharge, 75);
    }
  }
});

test('each recurring tier applies its approved minimum', () => {
  for (const [tier, minimum] of Object.entries({ care: 165, signature: 210, concierge: 255 })) {
    const result = calculateResidential({ ...input, tier, frequency: 'weekly', square_footage: 1 }, priceBook);
    assert.equal(result.quote.amount, minimum, tier);
    assert.equal(result.quote.minimum, minimum, tier);
    assert.equal(result.quote.minimumApplied, true, tier);
  }
});

test('Pristine Reset is 75 dollars plus seventeen cents per square foot with a 325 minimum', () => {
  const minimum = calculateResidential({ ...input, service_type: 'deep', tier: '', frequency: 'one_time', square_footage: 1 }, priceBook);
  const example = calculateResidential({ ...input, service_type: 'deep', tier: '', frequency: 'one_time', square_footage: 2500 }, priceBook);
  assert.equal(minimum.quote.amount, 325);
  assert.equal(example.quote.amount, 500);
  assert.equal(example.quote.ratePerSquareFoot, 0.17);
  assert.equal(example.quote.cadence, 'one_time');
  assert.equal(example.quote.tier, null);
});

test('Pristine Move preserves the 1,840 square foot 627 dollar regression', () => {
  const minimum = calculateResidential({ ...input, service_type: 'move', tier: '', frequency: 'one_time', square_footage: 1 }, priceBook);
  const regression = calculateResidential({ ...input, service_type: 'move', tier: '', frequency: 'one_time', square_footage: 1840 }, priceBook);
  assert.equal(minimum.quote.amount, 425);
  assert.equal(regression.quote.amount, 627);
  assert.equal(regression.quote.ratePerSquareFoot, 0.30);
  assert.equal(regression.quote.cadence, 'one_time');
});

test('all formula estimates round up to the nearest whole dollar', () => {
  const recurring = calculateResidential({ ...input, tier: 'care', frequency: 'weekly', square_footage: 2101 }, priceBook);
  const deep = calculateResidential({ ...input, service_type: 'deep', tier: '', frequency: 'one_time', square_footage: 2101 }, priceBook);
  const move = calculateResidential({ ...input, service_type: 'move', tier: '', frequency: 'one_time', square_footage: 2101 }, priceBook);
  assert.equal(recurring.quote.amount, 202);
  assert.equal(deep.quote.amount, 433);
  assert.equal(move.quote.amount, 706);
});

test('optional services and condition details never change the base estimate', () => {
  const baseline = calculateResidential(input, priceBook);
  const detailed = calculateResidential({
    ...input, condition: 'heavy', pets: 'multiple', bedrooms: '5+', bathrooms: '4+',
    requested_add_ons: ['inside_oven', 'wall_washing']
  }, priceBook);
  assert.equal(detailed.quote.amount, baseline.quote.amount);
  assert.equal(detailed.quote.optionalServicesIncluded, false);
});

test('larger homes still use the approved square-footage formulas', () => {
  const recurring = calculateResidential({ ...input, tier: 'concierge', frequency: 'monthly', square_footage: 100000 }, priceBook);
  const deep = calculateResidential({ ...input, service_type: 'deep', tier: '', frequency: 'one_time', square_footage: 100000 }, priceBook);
  const move = calculateResidential({ ...input, service_type: 'move', tier: '', frequency: 'one_time', square_footage: 100000 }, priceBook);
  assert.equal(recurring.quote.amount, 14075);
  assert.equal(deep.quote.amount, 17075);
  assert.equal(move.quote.amount, 30075);
});

test('exact range preserves the rounded estimate', () => {
  assert.deepEqual(exactRange(187), { low: 187, high: 187 });
});

test('invalid inputs, tiers, and service-frequency combinations are rejected', () => {
  assert.throws(() => calculateResidential({ ...input, zip: 'abc' }, priceBook), /invalid_zip/);
  assert.throws(() => calculateResidential({ ...input, square_footage: 0 }, priceBook), /invalid_square_footage/);
  assert.throws(() => calculateResidential({ ...input, square_footage: -1 }, priceBook), /invalid_square_footage/);
  assert.throws(() => calculateResidential({ ...input, tier: '' }, priceBook), /invalid_tier/);
  assert.throws(() => calculateResidential({ ...input, tier: 'premium' }, priceBook), /invalid_tier/);
  assert.throws(() => calculateResidential({ ...input, service_type: 'deep', frequency: 'one_time' }, priceBook), /invalid_tier/);
  assert.throws(() => calculateResidential({ ...input, service_type: 'deep', tier: '' }, priceBook), /invalid_frequency/);
  assert.throws(() => calculateResidential({ ...input, frequency: 'one_time' }, priceBook), /invalid_frequency/);
});
