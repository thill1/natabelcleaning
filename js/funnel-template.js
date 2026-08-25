/* Four-step residential Instant Estimate markup for NataBel. */
(function () {
  'use strict';

  const disclaimer = 'Your instant estimate is based on your home’s square footage and selected service. Final pricing will be confirmed after we review the property’s condition, bathrooms, pets, clutter, requested services, and any add-ons.';
  const exclusions = 'Appliance interiors, excessive debris, wall washing, carpet cleaning, exterior windows, garages, and hauling are not included in the base estimate. Optional services and unusual-condition charges are reviewed and priced separately.';

  function option(name, value, icon, title, detail) {
    return `<label class="quote-option"><input type="radio" name="${name}" value="${value}" />
      <span class="quote-option-content"><span class="quote-option-icon"><i data-lucide="${icon}"></i></span><strong>${title}</strong><small>${detail}</small></span></label>`;
  }

  function selectable(name, value, icon, title, detail) {
    return `<label class="quote-upgrade"><input type="checkbox" name="${name}" value="${value}" />
      <span><span class="quote-upgrade-icon"><i data-lucide="${icon}"></i></span><span><strong>${title}</strong><small>${detail}</small></span><i data-lucide="plus" class="quote-upgrade-plus"></i></span></label>`;
  }

  function estimatePanel() {
    return `<div class="quote-live-estimate" data-live-estimate role="status" aria-live="polite" aria-atomic="true">
      <span>Instant Estimate</span>
      <strong data-live-price>Enter square footage</strong>
      <small data-live-cadence>Choose a cleaning type and enter a positive home size.</small>
      <p>${disclaimer}</p>
    </div>`;
  }

  function estimateFunnelCard(source) {
    return `<div class="quote-card quote-card-v2" data-funnel>
      <div class="quote-progress" aria-label="Quote progress">
        <div><div class="quote-progress-meta"><span data-step-label>Step 1 · Cleaning type</span><span data-step-count>1 of 4</span></div><div class="quote-progress-track"><span></span></div></div>
        <span class="quote-progress-estimate" data-progress-estimate>About 2 minutes</span>
      </div>

      <form id="instantEstimateForm" data-lead-source="${source}" novalidate>
        <input type="hidden" name="form_type" value="instant_estimate" />
        <input type="hidden" name="audience" value="residential" />
        <input type="hidden" name="submission_id" />
        <input type="hidden" name="form_started_at" />
        <input type="text" name="website_url" tabindex="-1" autocomplete="off" aria-hidden="true" class="quote-honeypot" />

        <section class="quote-step active" data-step="service">
          <span class="quote-step-eyebrow">Choose your cleaning</span>
          <h2>Choose the cleaning that fits your home.</h2>
          <p>Choose the service that best matches the cleaning your home needs.</p>
          <div class="quote-options quote-service-options">
            ${option('service_type', 'standard', 'house', 'Standard Recurring', 'Ongoing maintenance cleaning on a weekly, every-two-weeks, or monthly schedule.')}
            ${option('service_type', 'deep', 'spray-can', 'Deep Clean', 'A detailed one-time cleaning for homes that need extra attention.')}
            ${option('service_type', 'move', 'package-open', 'Move-In / Move-Out', 'A one-time cleaning for an empty or transitioning home.')}
          </div>
          <div class="quote-server-error" data-step-error>Please choose a cleaning type.</div>
          <div class="quote-nav"><span></span><button class="btn btn-brass" type="button" data-next>Enter Home Size <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="size">
          <span class="quote-step-eyebrow">Home size</span>
          <h2>What’s your home’s square footage?</h2>
          <p>Use your best estimate. Every positive home size receives an Instant Estimate.</p>
          <div class="quote-single-field">
            <div class="quote-field"><label for="squareFootage">Home square footage</label><input id="squareFootage" name="square_footage" type="number" min="1" step="1" inputmode="numeric" autocomplete="off" placeholder="e.g. 1800" aria-describedby="squareFootageHelp" /><span class="quote-error">Enter a square footage greater than zero.</span><small id="squareFootageHelp" class="quote-input-help">The estimate updates instantly as you type.</small></div>
          </div>
          ${estimatePanel()}
          <div class="quote-server-error" data-step-error>Please enter a valid home size.</div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Add My Details <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="details">
          <span class="quote-step-eyebrow">Your cleaning request</span>
          <h2>Where and when should we clean?</h2>
          <p>These details help NataBel confirm the property, final scope, and requested date. They do not change the Instant Estimate.</p>
          <div class="quote-detail-stack">
            <fieldset class="quote-form-section"><legend><span>1</span> How we can reach you</legend><div class="quote-fields">
              <div class="quote-field"><label for="quoteName">Full name</label><input id="quoteName" name="name" autocomplete="name" maxlength="120" /><span class="quote-error">Enter your name.</span></div>
              <div class="quote-field"><label for="quotePhone">Mobile phone</label><input id="quotePhone" name="phone" type="tel" autocomplete="tel" maxlength="40" placeholder="(916) 555-0123" /><span class="quote-error">Enter a valid phone number.</span></div>
              <div class="quote-field full"><label for="quoteEmail">Email</label><input id="quoteEmail" name="email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com" /><span class="quote-error">Enter a valid email.</span></div>
            </div></fieldset>

            <fieldset class="quote-form-section"><legend><span>2</span> About the home</legend><div class="quote-fields">
              <div class="quote-field"><label for="propertyType">Property type</label><select id="propertyType" name="property_type"><option value="">Choose one</option><option value="house">House</option><option value="apartment">Apartment</option><option value="condo">Condo</option><option value="townhome">Townhome</option></select><span class="quote-error">Choose a property type.</span></div>
              <div class="quote-field"><label for="bedrooms">Bedrooms</label><select id="bedrooms" name="bedrooms"><option value="">Choose</option><option>Studio</option><option>1</option><option>2</option><option>3</option><option>4</option><option value="5+">5+</option></select><span class="quote-error">Choose bedrooms.</span></div>
              <div class="quote-field"><label for="bathrooms">Bathrooms</label><select id="bathrooms" name="bathrooms"><option value="">Choose</option><option>1</option><option>1.5</option><option>2</option><option>2.5</option><option>3</option><option>3.5</option><option value="4+">4+</option></select><span class="quote-error">Choose bathrooms.</span></div>
              <div class="quote-field"><label for="quotePets">Pets</label><select id="quotePets" name="pets"><option value="">Choose</option><option value="none">No pets</option><option value="dog">Dog</option><option value="cat">Cat</option><option value="multiple">Multiple pets</option><option value="other">Other</option></select><span class="quote-error">Tell us about pets.</span></div>
              <div class="quote-field full"><label for="serviceAddress">Service address</label><input id="serviceAddress" name="service_address" autocomplete="street-address" maxlength="220" placeholder="123 Main Street" /><span class="quote-error">Enter the service address.</span></div>
              <div class="quote-field"><label for="quoteCity">City</label><input id="quoteCity" name="city" autocomplete="address-level2" maxlength="100" placeholder="Rocklin" /><span class="quote-error">Enter the city.</span></div>
              <div class="quote-field"><label for="residentialZip">Service ZIP code</label><input id="residentialZip" name="zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="95765" /><span class="quote-error">Enter a five-digit ZIP code.</span></div>
            </div></fieldset>

            <fieldset class="quote-form-section"><legend><span>3</span> Timing and preparation</legend><div class="quote-fields">
              <div class="quote-field" data-frequency-field><label for="quoteFrequency">Desired frequency</label><select id="quoteFrequency" name="frequency"><option value="">Choose</option><option value="weekly">Weekly</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Every 4 weeks</option><option value="one_time">One-time</option></select><span class="quote-error">Choose a frequency.</span></div>
              <div class="quote-field"><label for="requestedDate">Requested date</label><input id="requestedDate" name="requested_date" type="date" /><span class="quote-error">Choose a requested date.</span></div>
              <div class="quote-field"><label for="homeCondition">Home condition</label><select id="homeCondition" name="condition"><option value="maintained">Well maintained</option><option value="average" selected>Average lived-in condition</option><option value="heavy">Needs extra attention</option></select></div>
              <div class="quote-field"><label for="homeClutter">Clutter level</label><select id="homeClutter" name="clutter"><option value="light">Light</option><option value="average" selected>Average</option><option value="heavy">Heavy</option></select></div>
              <div class="quote-field full"><label for="quoteNotes">Additional notes <span class="quote-optional">(optional)</span></label><textarea id="quoteNotes" name="notes" maxlength="2000" placeholder="Access notes, special surfaces, timing, or anything else we should know."></textarea></div>
            </div></fieldset>
          </div>

          <details class="quote-optional-services">
            <summary><span><strong>Add optional services</strong><small>Appliance interiors, windows, walls, carpets, garages, or hauling.</small></span><i data-lucide="chevron-down"></i></summary>
            <div class="quote-upgrade-block">
              <div class="quote-upgrade-head"><h3>Anything extra?</h3><span>Priced separately</span></div>
              <p>Selections are sent for review and never added automatically to the Instant Estimate.</p>
              <div class="quote-upgrades">
                ${selectable('requested_add_ons', 'inside_refrigerator', 'refrigerator', 'Inside refrigerator', 'Appliance interior; priced separately.')}
                ${selectable('requested_add_ons', 'inside_oven', 'cooking-pot', 'Inside oven', 'Appliance interior; priced separately.')}
                ${selectable('requested_add_ons', 'wall_washing', 'panels-top-left', 'Wall washing', 'Specialty surface work; priced separately.')}
                ${selectable('requested_add_ons', 'carpet_cleaning', 'waves', 'Carpet cleaning', 'Specialty floor service; priced separately.')}
                ${selectable('requested_add_ons', 'exterior_windows', 'panels-top-left', 'Exterior windows', 'Exterior work; priced separately.')}
                ${selectable('requested_add_ons', 'garage_or_hauling', 'truck', 'Garage or hauling', 'Garage, debris, or hauling review.')}
              </div>
            </div>
          </details>
          <aside class="quote-exclusions" aria-label="Base estimate exclusions"><strong>Not included in the base estimate</strong><p>${exclusions}</p></aside>
          <p class="quote-field-note"><i data-lucide="map-pin"></i> NataBel currently serves Rocklin, Roseville, Granite Bay and surrounding Placer and Sacramento-area communities. Service area and requested date are confirmed before scheduling.</p>
          <label class="quote-consent"><input type="checkbox" name="contact_consent" value="yes" /> <span>I agree that NataBel may contact me about this estimate and requested cleaning service. This is not a marketing subscription.</span></label>
          <div class="quote-server-error" data-step-error>Please complete the required contact, property, and scheduling details.</div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Review My Estimate <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="review">
          <span class="quote-step-eyebrow">Instant Estimate</span>
          <h2>Your estimate is ready.</h2>
          <div class="quote-review-card">
            <div class="quote-review-home"><div><strong data-review-home>Home details</strong><span data-review-address></span></div><i data-lucide="home"></i></div>
            <div class="quote-review-main"><span>Instant Estimate</span><strong data-review-price>—</strong><small data-review-cadence>base estimate</small></div>
            <div class="quote-review-lines">
              <div><span>Cleaning type</span><strong data-review-service>Cleaning</strong></div>
              <div><span>Desired frequency</span><strong data-review-frequency>—</strong></div>
              <div><span>Requested date</span><strong data-review-date>—</strong></div>
              <div><span>Pets</span><strong data-review-pets>—</strong></div>
              <div><span>Optional services</span><strong data-review-extras>None selected</strong></div>
            </div>
          </div>
          <p class="quote-disclaimer">${disclaimer}</p>
          <p class="quote-review-note"><strong>Final pricing is confirmed after NataBel reviews the property details. Optional services and unusual-condition charges remain separate.</strong></p>
          <p class="quote-submit-reassurance"><i data-lucide="lock-keyhole"></i> No payment is collected when you request this cleaning.</p>
          <div class="quote-server-error" data-submit-error role="alert"></div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="submit"><span data-submit-label>Request This Cleaning</span> <i data-lucide="arrow-right"></i></button></div>
        </section>
      </form>

      <section class="quote-status" data-quote-status aria-live="polite" tabindex="-1">
        <div class="quote-status-icon"><i data-status-icon data-lucide="check"></i></div>
        <span class="quote-step-eyebrow">Request saved</span>
        <h2 data-status-title>Your cleaning request is confirmed.</h2>
        <div class="quote-final-price"><strong data-status-price>—</strong><span data-status-cadence>Instant Estimate</span></div>
        <p data-status-copy></p>
        <p class="quote-disclaimer">${disclaimer}</p>
        <div class="quote-status-note" data-status-note></div>
        <p class="quote-review-note"><strong>NataBel will review the property details, confirm final pricing and availability, and contact you with next steps.</strong></p>
        <div class="quote-status-actions">
          <a href="tel:+19168998811" class="btn btn-brass"><i data-lucide="phone"></i> Call NataBel</a>
          <a href="index.html" class="btn btn-outline"><i data-lucide="home"></i> Back to Home</a>
          <a href="free-estimate.html" class="btn btn-outline">Start Another Estimate</a>
        </div>
      </section>
    </div>`;
  }

  window.PCC = window.PCC || {};
  window.PCC.templates = { estimateFunnelCard };
})();
