/* Six-step residential instant-quote markup for NataBel. */
(function () {
  'use strict';

  function option(name, value, icon, title, detail, attrs = '') {
    return `<label class="quote-option"><input type="radio" name="${name}" value="${value}" ${attrs} />
      <span class="quote-option-content"><span class="quote-option-icon"><i data-lucide="${icon}"></i></span><strong>${title}</strong><small>${detail}</small></span></label>`;
  }

  function upgrade(value, icon, title, detail) {
    return `<label class="quote-upgrade"><input type="checkbox" name="requested_add_ons" value="${value}" />
      <span><span class="quote-upgrade-icon"><i data-lucide="${icon}"></i></span><span><strong>${title}</strong><small>${detail}</small></span><i data-lucide="plus" class="quote-upgrade-plus"></i></span></label>`;
  }

  function estimateFunnelCard(source) {
    return `<div class="quote-card quote-card-v2" data-funnel>
      <div class="quote-progress" aria-label="Estimate progress">
        <div><div class="quote-progress-meta"><span data-step-label>Step 1 · Service area</span><span data-step-count>1 of 6</span></div><div class="quote-progress-track"><span></span></div></div>
        <span class="simple-kicker" style="margin:0;white-space:nowrap;">About 90 seconds</span>
      </div>

      <form id="instantEstimateForm" data-lead-source="${source}" novalidate>
        <input type="hidden" name="form_type" value="instant_estimate" />
        <input type="hidden" name="audience" value="residential" />
        <input type="hidden" name="service_type" value="standard" />
        <input type="hidden" name="condition" value="average" />
        <input type="text" name="website_url" tabindex="-1" autocomplete="off" aria-hidden="true" class="quote-honeypot" />

        <section class="quote-step active" data-step="zip">
          <span class="quote-step-eyebrow">First, your location</span>
          <h2>Where is the home?</h2>
          <p>Enter the service ZIP code so we can start with the right local pricing path.</p>
          <div class="quote-single-field">
            <div class="quote-field"><label for="residentialZip">Service ZIP code</label><input id="residentialZip" name="zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="95765" /><span class="quote-error">Enter a five-digit ZIP code.</span></div>
            <p class="quote-field-note"><i data-lucide="map-pin"></i> NataBel serves Rocklin, Roseville, Granite Bay and surrounding Placer and Sacramento-area communities. Final service-area confirmation happens before booking.</p>
          </div>
          <div class="quote-nav"><span></span><button class="btn btn-brass" type="button" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="home">
          <span class="quote-step-eyebrow">Your home</span>
          <h2>Tell us about the space.</h2>
          <p>Square footage sets the pricing tier. Bedrooms and bathrooms help NataBel validate the scope.</p>
          <div class="quote-fields">
            <div class="quote-field"><label for="propertyType">Property type</label><select id="propertyType" name="property_type"><option value="">Choose one</option><option value="house">House</option><option value="apartment">Apartment</option><option value="condo">Condo</option><option value="townhome">Townhome</option></select><span class="quote-error">Choose a property type.</span></div>
            <div class="quote-field"><label for="squareFootage">Approximate square feet</label><input id="squareFootage" name="square_footage" type="number" min="200" max="30000" inputmode="numeric" placeholder="e.g. 1800" /><span class="quote-error">Enter approximate square footage.</span></div>
            <div class="quote-field"><label for="bedrooms">Bedrooms</label><select id="bedrooms" name="bedrooms"><option value="">Choose</option><option>1</option><option>2</option><option>3</option><option>4</option><option value="5+">5+</option></select><span class="quote-error">Choose bedrooms.</span></div>
            <div class="quote-field"><label for="bathrooms">Bathrooms</label><select id="bathrooms" name="bathrooms"><option value="">Choose</option><option>1</option><option>1.5</option><option>2</option><option>2.5</option><option>3</option><option>3.5</option><option value="4+">4+</option></select><span class="quote-error">Choose bathrooms.</span></div>
          </div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>See My Options <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="frequency">
          <span class="quote-step-eyebrow">Choose your schedule</span>
          <h2>How often would you like us to clean?</h2>
          <p>Your approved NataBel recurring rate appears directly on each option.</p>
          <div class="quote-options quote-frequency-options">
            <label class="quote-option quote-frequency"><input type="radio" name="frequency" value="weekly" />
              <span class="quote-option-content"><span class="quote-frequency-tag">Best value</span><strong>Weekly</strong><span class="quote-frequency-price" data-price="weekly">Checking…</span><small>For homes that stay consistently maintained.</small></span></label>
            <label class="quote-option quote-frequency"><input type="radio" name="frequency" value="biweekly" />
              <span class="quote-option-content"><span class="quote-frequency-tag featured">Most popular</span><strong>Every 2 weeks</strong><span class="quote-frequency-price" data-price="biweekly">Checking…</span><small>A strong balance of consistency and value.</small></span></label>
            <label class="quote-option quote-frequency"><input type="radio" name="frequency" value="monthly" />
              <span class="quote-option-content"><span class="quote-frequency-tag">Every 4 weeks</span><strong>Monthly</strong><span class="quote-frequency-price" data-price="monthly">Checking…</span><small>For lighter recurring maintenance.</small></span></label>
          </div>
          <div class="quote-server-error" data-step-error>Please choose a cleaning frequency.</div>
          <div class="quote-manual-rate" data-manual-rate hidden><i data-lucide="phone-call"></i><span><strong>This home needs a custom quote.</strong><small>NataBel confirms pricing manually for homes outside the approved recurring rate tiers.</small></span></div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="first-visit">
          <span class="quote-step-eyebrow">First visit</span>
          <h2>Help us understand the starting point.</h2>
          <p>This protects the recurring price from being confused with a more detailed first-time reset.</p>
          <div class="quote-question-block">
            <h3>Has the home been professionally cleaned within the last 30 days?</h3>
            <div class="quote-options two">
              ${option('recent_cleaning', 'yes', 'badge-check', 'Yes', 'The home is already on a professional cleaning rhythm.')}
              ${option('recent_cleaning', 'no', 'spray-can', 'No', 'The first visit may need a more detailed reset before recurring service begins.')}
            </div>
          </div>

          <div class="quote-upgrade-block">
            <div class="quote-upgrade-head"><div><span class="quote-step-eyebrow">Optional upgrades</span><h3>Anything extra you want us to price?</h3></div><span>Confirmed separately</span></div>
            <p>Select anything you may want. These do not change the recurring base price until NataBel's add-on rate card is finalized.</p>
            <div class="quote-upgrades">
              ${upgrade('inside_refrigerator', 'refrigerator', 'Inside refrigerator', 'Detailed interior refrigerator cleaning.')}
              ${upgrade('inside_oven', 'cooking-pot', 'Inside oven', 'Interior oven cleaning and buildup removal.')}
              ${upgrade('interior_windows', 'panels-top-left', 'Interior windows', 'Interior glass and reachable window detailing.')}
              ${upgrade('baseboard_detail', 'panel-bottom', 'Baseboard detail', 'Extra attention to baseboards and edges.')}
              ${upgrade('cabinet_interiors', 'archive', 'Cabinet interiors', 'Interior cabinet wipe-down when emptied.')}
              ${upgrade('pet_hair', 'paw-print', 'Pet hair treatment', 'Additional pet-hair attention where needed.')}
            </div>
          </div>
          <div class="quote-server-error" data-step-error>Please tell us whether the home was professionally cleaned recently.</div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Review My Quote <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="quote">
          <span class="quote-step-eyebrow">Your NataBel cleaning plan</span>
          <h2>Your recurring price.</h2>
          <div class="quote-review-card">
            <div class="quote-review-home"><div><strong data-review-home>Home details</strong><span data-review-zip></span></div><i data-lucide="home"></i></div>
            <div class="quote-review-main"><span data-review-frequency>Recurring cleaning</span><strong data-review-price>—</strong><small>per visit</small></div>
            <div class="quote-review-lines">
              <div><span>First visit</span><strong data-review-first>Standard recurring scope</strong></div>
              <div><span>Optional upgrades</span><strong data-review-extras>None selected</strong></div>
            </div>
          </div>
          <p class="quote-review-note" data-review-note>Final scope and availability are confirmed before service.</p>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Reserve My Cleaning <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="contact">
          <span class="quote-step-eyebrow">Almost done</span>
          <h2>Where should we send your quote?</h2>
          <p>Share the service address and contact details so NataBel can confirm the first visit and scheduling.</p>
          <div class="quote-fields">
            <div class="quote-field"><label for="quoteName">Full name</label><input id="quoteName" name="name" autocomplete="name" /><span class="quote-error">Enter your name.</span></div>
            <div class="quote-field"><label for="quotePhone">Mobile phone</label><input id="quotePhone" name="phone" type="tel" autocomplete="tel" placeholder="(916) 555-0123" /><span class="quote-error">Enter a valid phone number.</span></div>
            <div class="quote-field"><label for="quoteEmail">Email</label><input id="quoteEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com" /><span class="quote-error">Enter a valid email.</span></div>
            <div class="quote-field"><label for="quoteCity">City</label><input id="quoteCity" name="city" autocomplete="address-level2" placeholder="Rocklin" /><span class="quote-error">Enter the city.</span></div>
            <div class="quote-field full"><label for="serviceAddress">Service address</label><input id="serviceAddress" name="service_address" autocomplete="street-address" placeholder="123 Main Street" /><span class="quote-error">Enter the service address.</span></div>
            <div class="quote-field full"><label for="quoteNotes">Anything NataBel should know? <span class="quote-optional">(optional)</span></label><textarea id="quoteNotes" name="notes" placeholder="Pets, special surfaces, access notes, preferred days, or focus areas."></textarea></div>
          </div>
          <label class="quote-consent"><input type="checkbox" name="contact_consent" value="yes" /> <span>I agree that NataBel may contact me about this estimate and requested cleaning service. This is not a marketing subscription.</span></label>
          <div class="quote-server-error" data-submit-error></div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="submit"><span data-submit-label>Send My Quote</span> <i data-lucide="arrow-right"></i></button></div>
        </section>
      </form>

      <section class="quote-status" data-quote-status aria-live="polite">
        <div class="quote-status-icon"><i data-status-icon data-lucide="check"></i></div>
        <span class="quote-step-eyebrow">Quote saved</span>
        <h2>Your recurring cleaning estimate is ready.</h2>
        <div class="quote-final-price"><strong data-status-price>—</strong><span>per visit</span></div>
        <p data-status-copy></p>
        <div class="quote-status-note" data-status-note></div>
        <div class="quote-status-actions">
          <a href="book-online.html?source=instant-quote" class="btn btn-brass" data-booking-link><i data-lucide="calendar-check"></i> Choose My Cleaning Date</a>
          <a href="tel:+19168998811" class="btn btn-outline"><i data-lucide="phone"></i> Call NataBel</a>
          <a href="free-estimate.html" class="btn btn-outline">Start Over</a>
        </div>
      </section>
    </div>`;
  }

  window.PCC = window.PCC || {};
  window.PCC.templates = { estimateFunnelCard };
})();
