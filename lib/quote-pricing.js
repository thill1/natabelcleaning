const ALLOWED = {
  service_type: new Set(['standard', 'deep', 'move']),
  frequency: new Set(['one_time', 'weekly', 'biweekly', 'monthly']),
  property_type: new Set(['house', 'apartment', 'condo', 'townhome']),
  condition: new Set(['maintained', 'average', 'heavy'])
};

function normalize(input) {
  const value = {
    service_type: String(input.service_type || ''),
    frequency: String(input.frequency || ''),
    property_type: String(input.property_type || ''),
    condition: String(input.condition || ''),
    square_footage: Number(input.square_footage),
    bedrooms: String(input.bedrooms || ''),
    bathrooms: String(input.bathrooms || ''),
    zip: String(input.zip || '')
  };
  Object.keys(ALLOWED).forEach(key => {
    if (!ALLOWED[key].has(value[key])) throw new Error(`invalid_${key}`);
  });
  if (!Number.isFinite(value.square_footage) || value.square_footage < 200 || value.square_footage > 30000) throw new Error('invalid_square_footage');
  if (!/^\d{5}$/.test(value.zip)) throw new Error('invalid_zip');
  if (!value.bedrooms || !value.bathrooms) throw new Error('invalid_home_details');
  return value;
}

function entryMatches(entry, input) {
  if (entry.service_type !== input.service_type || entry.frequency !== input.frequency) return false;
  if (entry.property_type && entry.property_type !== input.property_type) return false;
  if (entry.condition && entry.condition !== input.condition) return false;
  if (entry.bedrooms && String(entry.bedrooms) !== input.bedrooms) return false;
  if (entry.bathrooms && String(entry.bathrooms) !== input.bathrooms) return false;
  if (entry.minSqft && input.square_footage < entry.minSqft) return false;
  if (entry.maxSqft && input.square_footage > entry.maxSqft) return false;
  return true;
}

function roundRange(total) {
  return {
    low: Math.floor((total * 0.9) / 5) * 5,
    high: Math.ceil((total * 1.1) / 5) * 5
  };
}

function calculateResidential(rawInput, book) {
  const input = normalize(rawInput);
  if (!book || !book.enabled) return { status: 'manual_review_required', reason: 'pricing_not_configured' };
  const entry = (book.entries || []).find(candidate => entryMatches(candidate, input));
  if (!entry || !Number.isFinite(Number(entry.fixedPrice)) || Number(entry.fixedPrice) <= 0) {
    return { status: 'manual_review_required', reason: 'rate_not_found' };
  }
  let total = Number(entry.fixedPrice);
  const requestedAddOns = Array.isArray(rawInput.add_ons) ? rawInput.add_ons : [];
  for (const addOn of requestedAddOns) {
    const amount = Number((book.addOns || {})[addOn]);
    if (!Number.isFinite(amount) || amount < 0) return { status: 'manual_review_required', reason: 'addon_not_found' };
    total += amount;
  }
  const range = roundRange(total);
  return {
    status: 'estimated',
    quote: {
      ...range,
      currency: 'USD',
      cadence: input.frequency === 'one_time' ? 'one_time' : 'per_visit',
      cadenceLabel: input.frequency === 'one_time' ? 'for this one-time clean' : 'per visit',
      rateBookVersion: book.version,
      fixedRateBasis: total
    }
  };
}

module.exports = { calculateResidential, normalize, roundRange };
