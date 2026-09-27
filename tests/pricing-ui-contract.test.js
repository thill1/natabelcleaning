const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('residential and recurring pages publish all three approved tiers', () => {
  for (const file of ['residential.html', 'recurring-cleaning.html']) {
    const html = read(file);
    assert.match(html, /Pristine Care/);
    assert.match(html, /Pristine Signature/);
    assert.match(html, /Pristine Concierge/);
    assert.match(html, /MOST CHOSEN/);
    assert.match(html, /No hourly guessing\. No payment required to get your estimate\./);
  }
});

test('residential page publishes approved one-time names, minimum presentation, and guarantee', () => {
  const html = read('residential.html');
  assert.match(html, /Pristine Reset/);
  assert.match(html, /Starting at \$325/);
  assert.match(html, /Pristine Move/);
  assert.match(html, /Starting at \$425/);
  assert.match(html, /If something included in your confirmed cleaning scope isn't pristine/);
});

test('quote template follows the recurring decision order without preselecting a tier', () => {
  const template = read('js/funnel-template.js');
  const expectedOrder = ['data-step="size"', 'data-step="service"', 'data-step="tier"', 'data-step="frequency"', 'data-step="estimate"', 'data-step="details"', 'data-step="review"'];
  let previous = -1;
  for (const marker of expectedOrder) {
    const position = template.indexOf(marker);
    assert.ok(position > previous, `${marker} should follow the previous step`);
    previous = position;
  }
  assert.doesNotMatch(template, /name="tier"[^>]*checked/);
  assert.match(template, /name="tier" value="\$\{value\}"/);
  assert.match(template, /option\('frequency', 'weekly'/);
  assert.match(template, /option\('frequency', 'biweekly'/);
  assert.match(template, /option\('frequency', 'monthly'/);
});

test('one-time routes bypass tier and frequency while recurring includes them', () => {
  const controller = read('js/funnel.js');
  assert.match(controller, /\['size', 'service', 'tier', 'frequency', 'estimate', 'details', 'review'\]/);
  assert.match(controller, /\['size', 'service', 'estimate', 'details', 'review'\]/);
  assert.match(controller, /if \(isRecurring\(\)\) requestBody\.tier = currentTier\(\)/);
  assert.match(controller, /else delete data\.tier/);
});

test('front-end assets do not duplicate the server-side recurring rate table', () => {
  const publicPricingAssets = [
    read('js/funnel.js'), read('js/funnel-template.js'), read('residential.html'), read('recurring-cleaning.html')
  ].join('\n');
  for (const rate of ['0.06', '0.07', '0.08', '0.09', '0.10', '0.11', '0.12', '0.13', '0.14']) {
    assert.doesNotMatch(publicPricingAssets, new RegExp(rate.replace('.', '\\.')));
  }
});

test('responsive styles make Signature dominant and first on mobile', () => {
  const pageCss = read('css/simplified.css');
  const quoteCss = read('css/quote-conversion.css');
  assert.match(pageCss, /\.pristine-plan-signature\s*\{/);
  assert.match(pageCss, /background: var\(--simple-black\)/);
  assert.match(pageCss, /\.pristine-plan-signature \{ order: 1;/);
  assert.match(quoteCss, /\.quote-tier-signature \{ order: 1;/);
});
