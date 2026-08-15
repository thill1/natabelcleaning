const test = require('node:test');
const assert = require('node:assert/strict');
const serviceArea = require('../lib/service-area');

test('core NataBel service-area ZIPs are eligible', () => {
  for (const zip of ['95765', '95678', '95814', '95630', '95757', '95616', '95762']) {
    assert.equal(serviceArea.isEligibleZip(zip), true, `${zip} should be eligible`);
  }
});

test('non-Sacramento-region ZIPs are rejected', () => {
  for (const zip of ['94105', '90001', '96150', '94501', '99999']) {
    assert.equal(serviceArea.isEligibleZip(zip), false, `${zip} should not be eligible`);
  }
});

test('service area fails closed for malformed or empty ZIPs', () => {
  for (const zip of ['', '9581', 'abcde', null, undefined]) {
    assert.equal(serviceArea.isEligibleZip(zip), false);
  }
});

test('allowlist contains no duplicates', () => {
  assert.equal(new Set(serviceArea.eligibleZips).size, serviceArea.eligibleZips.length);
});
