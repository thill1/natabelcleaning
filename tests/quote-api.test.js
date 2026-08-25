const test = require('node:test');
const assert = require('node:assert/strict');
const quoteHandler = require('../api/quote');

function request(body) {
  return new Promise((resolve, reject) => {
    const response = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ statusCode: this.statusCode, payload, headers: this.headers }); }
    };
    Promise.resolve(quoteHandler({ method: 'POST', body }, response)).catch(reject);
  });
}

const preview = {
  preview: true,
  service_type: 'standard',
  frequency: 'monthly',
  square_footage: 1800
};

const complete = {
  service_type: 'standard', frequency: 'biweekly', square_footage: 2500,
  submission_id: 'quote-test-00000001', form_started_at: Date.now() - 5000,
  name: 'Ada Customer', phone: '(916) 555-0123', email: 'ada@example.com',
  service_address: '123 Main Street', city: 'Rocklin', zip: '95765', property_type: 'house',
  bedrooms: '3', bathrooms: '2', pets: 'dog', requested_date: '2026-09-15',
  condition: 'heavy', clutter: 'light', requested_add_ons: ['inside_oven'],
  notes: 'Use the side gate.', contact_consent: 'yes', source: '/free-estimate.html?utm_source=test'
};

function response(ok, status = ok ? 200 : 500, payload = {}) {
  return { ok, status, async json() { return payload; } };
}

async function withDeliveryMocks(callback, options = {}) {
  const originalFetch = global.fetch;
  const originalWebhook = process.env.QUOTE_WEBHOOK_URL;
  const originalKey = process.env.RESEND_API_KEY;
  const calls = [];
  process.env.QUOTE_WEBHOOK_URL = 'https://storage.example.test/quotes';
  process.env.RESEND_API_KEY = 're_test';
  global.fetch = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    if (url.includes('storage.example.test')) {
      return options.storageFailure ? response(false, 503, { ok: false, error: 'sheet_unavailable' }) : response(true, 200, { ok: true, duplicate: !!options.duplicate });
    }
    return options.emailFailure ? response(false, 503, { message: 'temporary failure' }) : response(true, 200, { id: 'email_123' });
  };
  try { return await callback(calls); }
  finally {
    global.fetch = originalFetch;
    if (originalWebhook === undefined) delete process.env.QUOTE_WEBHOOK_URL; else process.env.QUOTE_WEBHOOK_URL = originalWebhook;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey;
  }
}

test('preview API returns the final estimate without exposing the rate calculation', async () => {
  const result = await request(preview);
  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.ok, true);
  assert.equal(result.payload.quote.amount, 183);
  assert.equal(result.payload.quote.baseCharge, undefined);
  assert.equal(result.payload.quote.ratePerSquareFoot, undefined);
});

test('preview API quotes deep and move services for large homes', async () => {
  const deep = await request({ ...preview, service_type: 'deep', frequency: 'one_time', square_footage: 100000 });
  const move = await request({ ...preview, service_type: 'move', frequency: 'one_time', square_footage: 100000 });
  assert.equal(deep.payload.quote.amount, 12075);
  assert.equal(move.payload.quote.amount, 25075);
});

test('preview rejects zero square footage and accepts a one-square-foot home', async () => {
  const zero = await request({ ...preview, square_footage: 0 });
  const small = await request({ ...preview, square_footage: 1 });
  assert.equal(zero.statusCode, 400);
  assert.equal(zero.payload.error, 'invalid_square_footage');
  assert.equal(small.payload.quote.amount, 125);
});

test('final submission requires the complete server-validated property details', async () => {
  const result = await request({ ...preview, preview: false });
  assert.equal(result.statusCode, 400);
  assert.equal(result.payload.error, 'missing_required_details');
});

test('complete quote is stored before emails and notification includes every required field', async () => {
  await withDeliveryMocks(async calls => {
    const result = await request(complete);
    assert.equal(result.statusCode, 200);
    assert.equal(result.payload.ok, true);
    assert.equal(result.payload.saved, true);
    assert.equal(result.payload.quote.amount, 225);
    assert.equal(calls.length, 3);
    assert.equal(calls[0].url, 'https://storage.example.test/quotes');
    assert.equal(calls[0].body.estimate_amount, 225);
    assert.equal(calls[0].body.base_price, 75);
    assert.equal(calls[0].body.square_footage_charge, 150);
    assert.equal(calls[0].body.submission_id, complete.submission_id);
    assert.equal(calls[0].init.headers['Idempotency-Key'], `natabel-quote-${complete.submission_id}`);

    const businessEmail = calls.find(call => call.url.includes('resend.com') && call.body.to[0] === 'natabelpristinecleaning@gmail.com');
    assert.ok(businessEmail);
    for (const expected of ['Ada Customer', '(916) 555-0123', 'ada@example.com', '123 Main Street', 'Standard Recurring Cleaning', 'Every 2 Weeks', '2500', 'Bedrooms', 'Bathrooms', 'dog', '2026-09-15', '$75', '$150', '$225 per visit', 'inside_oven', 'Use the side gate.', '/free-estimate.html?utm_source=test']) {
      assert.match(businessEmail.body.html, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
    assert.match(businessEmail.body.html, /Submission date and time/);
    assert.equal(businessEmail.init.headers['Idempotency-Key'], `natabel-quote-${complete.submission_id}-internal`);
  });
});

test('email delivery failure keeps the stored quote and clearly logs the failure', async () => {
  const originalError = console.error;
  const logs = [];
  console.error = (...args) => logs.push(args);
  try {
    await withDeliveryMocks(async calls => {
      const result = await request({ ...complete, submission_id: 'quote-test-00000002' });
      assert.equal(result.statusCode, 200);
      assert.equal(result.payload.ok, true);
      assert.equal(result.payload.saved, true);
      assert.equal(result.payload.notificationPending, true);
      assert.equal(calls[0].url, 'https://storage.example.test/quotes');
      assert.match(logs[0][0], /EMAIL DELIVERY FAILED/);
      assert.equal(logs[0][1].submissionId, 'quote-test-00000002');
    }, { emailFailure: true });
  } finally { console.error = originalError; }
});

test('storage failure does not send email or claim the request was saved', async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    await withDeliveryMocks(async calls => {
      const result = await request({ ...complete, submission_id: 'quote-test-00000003' });
      assert.equal(result.statusCode, 503);
      assert.equal(result.payload.ok, false);
      assert.equal(result.payload.error, 'quote_storage_failed');
      assert.equal(calls.length, 1);
    }, { storageFailure: true });
  } finally { console.error = originalError; }
});

test('duplicate storage response remains successful and uses stable email idempotency keys', async () => {
  await withDeliveryMocks(async calls => {
    const result = await request({ ...complete, submission_id: 'quote-test-00000004' });
    assert.equal(result.payload.duplicate, true);
    assert.deepEqual(calls.slice(1).map(call => call.init.headers['Idempotency-Key']).sort(), [
      'natabel-quote-quote-test-00000004-customer',
      'natabel-quote-quote-test-00000004-internal'
    ]);
  }, { duplicate: true });
});

test('honeypot submissions are accepted and discarded without delivery', async () => {
  const originalFetch = global.fetch;
  let called = false;
  global.fetch = async () => { called = true; return response(true); };
  try {
    const result = await request({ ...complete, website_url: 'https://spam.example' });
    assert.equal(result.payload.discarded, true);
    assert.equal(called, false);
  } finally { global.fetch = originalFetch; }
});
