/* Six-step residential instant-quote markup for NataBel. */
(function () {
  'use strict';

  function option(name, value, icon, title, detail, attrs = '') {
    return `<label class="quote-option"><input type="radio" name="${name}" value="${value}" ${attrs} />
      <span class="quote-option-content"><span class="quote-option-icon"><i data-lucide="${icon}"></i></span><strong>${title}</strong><small>${detail}</small></span></label>`;
  }

  function selectable(name, value, icon, title, detail) {
    return `<label class="quote-upgrade"><input type="checkbox" name="${name}" value="${value}" />
      <span><span class="quote-upgrade-icon"><i data-lucide="${icon}"></i></span><span><strong>${title}</strong><small>${detail}</small></span><i data-lucide="plus" class="quote-upgrade-plus"></i></span></label>`;
  }

  function estimateFunnelCard(source) {
    return `<div class="quote-card quote-card-v2" data-funnel>
      <div class="quote-progress" aria-label="Quote progress">
        <div><div class="quote-progress-meta"><span data-step-label>Step 1 · Service area</span><span data-step-count>1 of 6</span></div><div class="quote-progress-track"><span></span></div></div>
        <span class="simple-kicker" style="margin:0;white-space:nowrap;">About 90 seconds</span>
      </div>

      <form id="instantEstimateForm" data-lead-source="${source}" novalidate>
        <input type="hidden" name="form_type" value="instant_estimate" />
        <input type="hidden" name="audience" value="residential" />
        <input type="hidden" name="condition" value="average" />
        <input type="text" name="website_url" tabindex="-1" autocomplete="off" aria-hidden="true" class="quote-honeypot" />

        <section class="quote-step active" data-step="zip">
          <span class="quote-step-eyebrow">First, your location</span>
          <h2>Where is the home?</h2>
          <p>Enter the service ZIP code so we can start with the right local pricing path.</p>
          <div class="quote-single-field">
            <div class="quote-field"><label for="residentialZip">Service ZIP code</label><input id="residentialZip" name="zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="95765" /><span class="quote-error">Enter a five-digit ZIP code.</span></div>
            <p class="quote-field-note"><i data-lucide="map-pin"></i> NataBel serves Rocklin, Roseville, Granite Bay, nearby Placer communities, and selected Sacramento-side ZIPs. Final service-area confirmation happens before scheduling.</p>
          </div>
          <div class="quote-nav"><span></span><button class="btn btn-brass" type="button" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="home">
          <span class="quote-step-eyebrow">Your cleaning</span>
          <h2>What kind of cleaning do you need?</h2>
          <div class="quote-options two" style="margin-bottom:28px">
            ${option('service_type', 'standard', 'house', 'Recurring Cleaning', 'Weekly, every 2 weeks, or every 4 weeks.')}
            ${option('service_type', 'move', 'package-open', 'Move-In / Move-Out', 'A one-time detailed cleaning priced by home size plus the move-service premium.')}
          </div>
          <h2>Tell us about the space.</h2>
          <p>Square footage sets the pricing tier. Bedrooms and bathrooms help NataBel validate the scope.</p>
          <div class="quote-fields">
            <div class="quote-field"><label for="propertyType">Property type</label><select id="propertyType" name="property_type"><option value="">Choose one</option><option value="house">House</option><option value="apartment">Apartment</option><option value="condo">Condo</option><option value="townhome">Townhome</option></select><span class="quote-error">Choose a property type.</span></div>
            <div class="quote-field"><label for="squareFootage">Approximate square feet</label><input id="squareFootage" name="square_footage" type="number" min="200" max="30000" inputmode="numeric" placeholder="e.g. 1800" /><span class="quote-error">Enter approximate square footage.</span></div>
            <div class="quote-field"><label for="bedrooms">Bedrooms</label><select id="bedrooms" name="bedrooms"><option value="">Choose</option><option>1</option><option>2</option><option>3</option><option>4</option><option value="5+">5+</option></select><span class="quote-error">Choose bedrooms.</span></div>
            <div class="quote-field"><label for="bathrooms">Bathrooms</label><select id="bathrooms" name="bathrooms"><option value="">Choose</option><option>1</option><option>1.5</option><option>2</option><option>2.5</option><option>3</option><option>3.5</option><option value="4+">4+</option></select><span class="quote-error">Choose bathrooms.</span></div>
          </div>
          <div class="quote-server-error" data-step-error>Please choose a cleaning type and complete the home details.</div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>See My Price <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="frequency">
          <div data-recurring-only>
            <span class="quote-step-eyebrow">Choose your schedule</span>
            <h2>How often would you like us to clean?</h2>
            <p class="quote-honesty-line"><strong>Cleaning service only.</strong> Add-ons are quoted separately.</p>
            <div class="quote-options quote-frequency-options" data-frequency-options>
              <label class="quote-option quote-frequency"><input type="radio" name="frequency" value="weekly" />
                <span class="quote-option-content"><span class="quote-frequency-tag">Best value</span><strong>Weekly</strong><span class="quote-frequency-price" data-price="weekly">Checking…</span><small>For homes that stay consistently maintained.</small></span></label>
              <label class="quote-option quote-frequency"><input type="radio" name="frequency" value="biweekly" />
                <span class="quote-option-content"><span class="quote-frequency-tag featured">Most popular</span><strong>Every 2 weeks</strong><span class="quote-frequency-price" data-price="biweekly">Checking…</span><small>A strong balance of consistency and value.</small></span></label>
              <label class="quote-option quote-frequency"><input type="radio" name="frequency" value="monthly" />
                <span class="quote-option-content"><span class="quote-frequency-tag">Every 4 weeks</span><strong>Monthly</strong><span class="quote-frequency-price" data-price="monthly">Checking…</span><small>For lighter recurring maintenance.</small></span></label>
            </div>
          </div>
          <div data-move-only hidden>
            <span class="quote-step-eyebrow">Move cleaning</span>
            <h2>Your Move-In / Move-Out cleaning price.</h2>
            <p>This is a one-time cleaning based on the home’s square-footage tier plus the approved move-service premium.</p>
            <div class="quote-review-card" style="margin-top:20px">
              <div class="quote-review-main"><span>Move-In / Move-Out Cleaning</span><strong data-price="move">Checking…</strong><small>one-time cleaning · cleaning service only</small></div>
            </div>
          </div>
          <div class="quote-server-error" data-step-error>Please choose a cleaning frequency.</div>
          <div class="quote-manual-rate" data-manual-rate hidden><i data-lucide="phone-call"></i><span><strong>This home needs a custom quote.</strong><small>Fatima will confirm the right scope and price before scheduling.</small></span></div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="details">
          <div data-recurring-only>
            <span class="quote-step-eyebrow">First visit</span>
            <h2>Help us understand the starting point.</h2>
            <p>A few details help Fatima prepare the team for your home without changing the base cleaning price shown.</p>
            <div class="quote-question-block">
              <h3>Has the home been professionally cleaned within the last 30 days?</h3>
              <div class="quote-options two">
                ${option('recent_cleaning', 'yes', 'badge-check', 'Yes', 'The home is already on a professional cleaning rhythm.')}
                ${option('recent_cleaning', 'no', 'spray-can', 'No', 'The first visit may need a more detailed reset before recurring service begins.')}
              </div>
            </div>
          </div>
          <div data-move-only hidden>
            <span class="quote-step-eyebrow">Move cleaning details</span>
            <h2>Anything we should pay extra attention to?</h2>
            <p>Your Move-In / Move-Out price is already set by home size. You can add preferences or request optional extras below.</p>
          </div>

          <div class="quote-upgrade-block quote-focus-block">
            <div class="quote-upgrade-head"><div><span class="quote-step-eyebrow">Focus areas</span><h3>What should we pay extra attention to?</h3></div><span>Choose any</span></div>
            <p>Select the areas that matter most to you. These preferences help the team plan the visit and do not change the base cleaning price.</p>
            <div class="quote-upgrades">
              ${selectable('focus_areas', 'kitchen', 'cooking-pot', 'Kitchen', 'Counters, sink, stovetop, appliance exteriors and high-use surfaces.')}
              ${selectable('focus_areas', 'bathrooms', 'bath', 'Bathrooms', 'Showers, tubs, toilets, sinks, fixtures and mirrors.')}
              ${selectable('focus_areas', 'floors', 'sparkles', 'Floors', 'Vacuuming, mopping, edges and visible floor buildup.')}
              ${selectable('focus_areas', 'dusting_surfaces', 'feather', 'Dust & surfaces', 'Furniture, shelves, ledges and frequently used surfaces.')}
              ${selectable('focus_areas', 'bedrooms', 'bed-double', 'Bedrooms', 'Dusting, floors, mirrors and general room reset.')}
              ${selectable('focus_areas', 'high_touch', 'hand', 'High-touch areas', 'Handles, switches and other frequently touched surfaces.')}
            </div>
          </div>

          <div class="quote-upgrade-block">
            <div class="quote-upgrade-head"><div><span class="quote-step-eyebrow">Optional add-ons</span><h3>Would you like anything extra?</h3></div><span>Quoted separately</span></div>
            <p>Select any add-ons you are interested in. They are not included in the cleaning price shown. Fatima will call you for any additional add-on quotes.</p>
            <div class="quote-upgrades">
              ${selectable('requested_add_ons', 'inside_refrigerator', 'refrigerator', 'Inside refrigerator', 'Detailed interior refrigerator cleaning.')}
              ${selectable('requested_add_ons', 'inside_oven', 'cooking-pot', 'Inside oven', 'Interior oven cleaning and buildup removal.')}
              ${selectable('requested_add_ons', 'interior_windows', 'panels-top-left', 'Interior windows', 'Interior glass and reachable window detailing.')}
              ${selectable('requested_add_ons', 'baseboard_detail', 'panel-bottom', 'Baseboard detail', 'Extra attention to baseboards and edges.')}
              ${selectable('requested_add_ons', 'cabinet_interiors', 'archive', 'Cabinet interiors', 'Interior cabinet wipe-down when emptied.')}
              ${selectable('requested_add_ons', 'pet_hair', 'paw-print', 'Pet hair treatment', 'Additional pet-hair attention where needed.')}
            </div>
          </div>
          <div class="quote-server-error" data-step-error>Please tell us whether the home was professionally cleaned recently.</div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Review My Quote <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="quote">
          <span class="quote-step-eyebrow">Your NataBel cleaning plan</span>
          <h2>Your cleaning price.</h2>
          <div class="quote-review-card">
            <div class="quote-review-home"><div><strong data-review-home>Home details</strong><span data-review-zip></span></div><i data-lucide="home"></i></div>
            <div class="quote-review-main"><span data-review-frequency>Cleaning</span><strong data-review-price>—</strong><small data-review-cadence>per visit · cleaning service only</small></div>
            <div class="quote-review-lines">
              <div><span data-review-first-label>First visit</span><strong data-review-first>Standard recurring scope</strong></div>
              <div><span>Focus areas</span><strong data-review-focus>None selected</strong></div>
              <div><span>Optional add-ons requested</span><strong data-review-extras>None selected</strong></div>
            </div>
          </div>
          <p class="quote-review-note" data-review-note>Final scope and availability are confirmed before service.</p>
          <p class="quote-review-note"><strong>Cleaning service only.</strong> Add-ons are quoted separately and confirmed by phone.</p>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Send Me This Quote <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="contact">
          <span class="quote-step-eyebrow">Almost done</span>
          <h2>Where should we send your quote?</h2>
          <p>Share the service address and contact details so NataBel can confirm the cleaning and scheduling.</p>
          <div class="quote-fields">
            <div class="quote-field"><label for="quoteName">Full name</label><input id="quoteName" name="name" autocomplete="name" /><span class="quote-error">Enter your name.</span></div>
            <div class="quote-field"><label for="quotePhone">Mobile phone</label><input id="quotePhone" name="phone" type="tel" autocomplete="tel" placeholder="(916) 555-0123" /><span class="quote-error">Enter a valid phone number.</span></div>
            <div class="quote-field"><label for="quoteEmail">Email</label><input id="quoteEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com" /><span class="quote-error">Enter a valid email.</span></div>
            <div class="quote-field"><label for="quoteCity">City</label><input id="quoteCity" name="city" autocomplete="address-level2" placeholder="Rocklin" /><span class="quote-error">Enter the city.</span></div>
            <div class="quote-field full"><label for="serviceAddress">Service address</label><input id="serviceAddress" name="service_address" autocomplete="street-address" placeholder="123 Main Street" /><span class="quote-error">Enter the service address.</span></div>
            <div class="quote-field full"><label for="quoteNotes">Anything NataBel should know? <span class="quote-optional">(optional)</span></label><textarea id="quoteNotes" name="notes" placeholder="Pets, special surfaces, access notes, preferred days, or anything else we should know."></textarea></div>
          </div>
          <label class="quote-consent"><input type="checkbox" name="contact_consent" value="yes" /> <span>I agree that NataBel may contact me about this quote and requested cleaning service. This is not a marketing subscription. See our <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>
          <div class="quote-server-error" data-submit-error></div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="submit"><span data-submit-label>Send My Quote</span> <i data-lucide="arrow-right"></i></button></div>
        </section>
      </form>

      <section class="quote-status" data-quote-status aria-live="polite">
        <div class="quote-status-icon"><i data-status-icon data-lucide="check"></i></div>
        <span class="quote-step-eyebrow">Quote saved</span>
        <h2 data-status-title>Your cleaning quote is ready.</h2>
        <div class="quote-final-price"><strong data-status-price>—</strong><span data-status-cadence>per visit</span></div>
        <p><strong>Cleaning service only.</strong> Add-ons are quoted separately.</p>
        <p data-status-copy></p>
        <div class="quote-status-note" data-status-note></div>
        <p class="quote-review-note"><strong>Fatima will call you for any add-on requests.</strong></p>
        <div class="quote-status-actions">
          <a href="tel:+19168998811" class="btn btn-brass"><i data-lucide="phone"></i> Call Now to Schedule</a>
          <a href="index.html" class="btn btn-outline"><i data-lucide="home"></i> Back to Home</a>
          <a href="free-estimate.html" class="btn btn-outline">Start Over</a>
        </div>
      </section>
    </div>`;
  }

  window.PCC = window.PCC || {};
  window.PCC.templates = { estimateFunnelCard };
})();