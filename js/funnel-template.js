/* Four-step instant-estimate and commercial-walkthrough markup. */
(function () {
  'use strict';

  function option(name, value, icon, title, detail) {
    return `<label class="quote-option"><input type="radio" name="${name}" value="${value}" />
      <span class="quote-option-content"><span class="quote-option-icon"><i data-lucide="${icon}"></i></span><strong>${title}</strong><small>${detail}</small></span></label>`;
  }

  function estimateFunnelCard(source) {
    return `<div class="quote-card" data-funnel>
      <div class="quote-progress" aria-label="Estimate progress">
        <div><div class="quote-progress-meta"><span data-step-label>Step 1 · Your space</span><span data-step-count>1 of 4</span></div><div class="quote-progress-track"><span></span></div></div>
        <span class="simple-kicker" style="margin:0;white-space:nowrap;">About 90 seconds</span>
      </div>
      <form id="instantEstimateForm" data-lead-source="${source}" novalidate>
        <input type="hidden" name="form_type" value="instant_estimate" />
        <input type="text" name="website_url" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;" />

        <section class="quote-step active" data-step="audience">
          <h2>What kind of space needs cleaning?</h2>
          <p>Choose one path. We will only ask questions that apply to your space.</p>
          <div class="quote-options two">
            ${option('audience', 'residential', 'home', 'My home', 'Get an instant residential price range when Fatima’s approved rate sheet is connected.')}
            ${option('audience', 'commercial', 'building-2', 'My business', 'Request a walkthrough and a scope built around your facility.')}
          </div>
          <div class="quote-server-error" data-step-error>Please choose home or business.</div>
          <div class="quote-nav"><span></span><button class="btn btn-brass" type="button" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="service">
          <div data-residential>
            <h2>What kind of home cleaning?</h2>
            <p>Pick the result you need. Frequency comes next.</p>
            <div class="quote-options">
              ${option('service_type', 'standard', 'home', 'Standard cleaning', 'Routine kitchens, bathrooms, living areas, dusting, vacuuming, and floors.')}
              ${option('service_type', 'deep', 'droplets', 'Deep cleaning', 'A more detailed reset for buildup, baseboards, fixtures, and overlooked surfaces.')}
              ${option('service_type', 'move', 'key-round', 'Move-in / move-out', 'An empty-home clean for a fresh start or turnover.')}
            </div>
          </div>
          <div data-commercial hidden>
            <h2>What kind of business space?</h2>
            <p>This helps Fatima prepare for a useful walkthrough.</p>
            <div class="quote-options">
              ${option('facility_type', 'office', 'briefcase-business', 'Office', 'Suites, professional offices, and shared workplaces.')}
              ${option('facility_type', 'retail', 'store', 'Retail', 'Storefronts and customer-facing spaces.')}
              ${option('facility_type', 'medical', 'cross', 'Medical / professional', 'Clinics, dental offices, and specialty practices.')}
              ${option('facility_type', 'property', 'building', 'Property management', 'Turnovers, common areas, and multi-site needs.')}
              ${option('facility_type', 'fitness', 'dumbbell', 'Fitness / community', 'Gyms, studios, churches, and gathering spaces.')}
              ${option('facility_type', 'other', 'layout-grid', 'Something else', 'Tell us about it in the final step.')}
            </div>
          </div>
          <div class="quote-server-error" data-step-error>Please choose a service.</div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="details">
          <div data-residential>
            <h2>Tell us about your home.</h2>
            <p>These details map directly to the approved NataBel rate sheet.</p>
            <div class="quote-fields">
              <div class="quote-field"><label for="propertyType">Property type</label><select id="propertyType" name="property_type"><option value="">Choose one</option><option value="house">House</option><option value="apartment">Apartment</option><option value="condo">Condo</option><option value="townhome">Townhome</option></select><span class="quote-error">Choose a property type.</span></div>
              <div class="quote-field"><label for="squareFootage">Approximate square feet</label><input id="squareFootage" name="square_footage" type="number" min="200" max="30000" inputmode="numeric" placeholder="e.g. 1800" /><span class="quote-error">Enter approximate square footage.</span></div>
              <div class="quote-field"><label for="bedrooms">Bedrooms</label><select id="bedrooms" name="bedrooms"><option value="">Choose</option><option>1</option><option>2</option><option>3</option><option>4</option><option value="5+">5+</option></select><span class="quote-error">Choose bedrooms.</span></div>
              <div class="quote-field"><label for="bathrooms">Bathrooms</label><select id="bathrooms" name="bathrooms"><option value="">Choose</option><option>1</option><option>1.5</option><option>2</option><option>2.5</option><option>3</option><option>3.5</option><option value="4+">4+</option></select><span class="quote-error">Choose bathrooms.</span></div>
              <div class="quote-field"><label for="frequency">How often?</label><select id="frequency" name="frequency"><option value="">Choose</option><option value="one_time">One-time</option><option value="weekly">Weekly</option><option value="biweekly">Every two weeks</option><option value="monthly">Monthly</option></select><span class="quote-error">Choose a frequency.</span></div>
              <div class="quote-field"><label for="condition">Current condition</label><select id="condition" name="condition"><option value="">Choose</option><option value="maintained">Light upkeep</option><option value="average">Average lived-in</option><option value="heavy">Heavy buildup</option></select><span class="quote-error">Choose the current condition.</span></div>
              <div class="quote-field full"><label for="residentialZip">Service ZIP code</label><input id="residentialZip" name="zip" type="text" inputmode="numeric" maxlength="5" placeholder="e.g. 95765" /><span class="quote-error">Enter a five-digit ZIP code.</span></div>
            </div>
          </div>
          <div data-commercial hidden>
            <h2>Tell us about the facility.</h2>
            <p>A walkthrough gives NataBel the information needed for an accurate commercial scope.</p>
            <div class="quote-fields">
              <div class="quote-field"><label for="commercialSqft">Approximate square feet</label><input id="commercialSqft" name="commercial_sqft" type="number" min="200" max="1000000" inputmode="numeric" placeholder="e.g. 4500" /><span class="quote-error">Enter approximate square footage.</span></div>
              <div class="quote-field"><label for="restrooms">Restrooms</label><input id="restrooms" name="restrooms" type="number" min="0" max="100" inputmode="numeric" placeholder="e.g. 3" /><span class="quote-error">Enter the restroom count.</span></div>
              <div class="quote-field"><label for="commercialFrequency">Desired frequency</label><select id="commercialFrequency" name="commercial_frequency"><option value="">Choose</option><option value="nightly">Nightly</option><option value="multiple_weekly">Multiple times weekly</option><option value="weekly">Weekly</option><option value="custom">Custom schedule</option></select><span class="quote-error">Choose a frequency.</span></div>
              <div class="quote-field"><label for="cleaningTime">Preferred cleaning time</label><select id="cleaningTime" name="cleaning_time"><option value="">Choose</option><option value="business_hours">Business hours</option><option value="after_hours">After hours</option><option value="either">Either</option></select><span class="quote-error">Choose a preferred time.</span></div>
              <div class="quote-field full"><label for="commercialZip">Service ZIP code</label><input id="commercialZip" name="commercial_zip" type="text" inputmode="numeric" maxlength="5" placeholder="e.g. 95765" /><span class="quote-error">Enter a five-digit ZIP code.</span></div>
            </div>
          </div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="button" data-next>Continue <i data-lucide="arrow-right"></i></button></div>
        </section>

        <section class="quote-step" data-step="contact">
          <h2 data-contact-heading>Where can NataBel follow up?</h2>
          <p data-contact-copy>Enter your contact details to see the right next step and share the same information with NataBel.</p>
          <div class="quote-fields">
            <div class="quote-field"><label for="quoteName">Full name</label><input id="quoteName" name="name" autocomplete="name" /><span class="quote-error">Enter your name.</span></div>
            <div class="quote-field"><label for="quotePhone">Phone</label><input id="quotePhone" name="phone" type="tel" autocomplete="tel" placeholder="(916) 555-0123" /><span class="quote-error">Enter a valid phone number.</span></div>
            <div class="quote-field"><label for="quoteEmail">Email</label><input id="quoteEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com" /><span class="quote-error">Enter a valid email.</span></div>
            <div class="quote-field"><label for="quoteCity">City</label><input id="quoteCity" name="city" autocomplete="address-level2" placeholder="Rocklin" /><span class="quote-error">Enter the city.</span></div>
            <div class="quote-field full"><label for="quoteNotes">Anything NataBel should know? <span style="font-weight:400;color:var(--simple-muted);">(optional)</span></label><textarea id="quoteNotes" name="notes" placeholder="Pets, special surfaces, access, preferred walkthrough time, or focus areas."></textarea></div>
          </div>
          <label class="quote-consent"><input type="checkbox" name="contact_consent" value="yes" /> <span>I agree that NataBel may contact me about this estimate or walkthrough request. This is not a marketing subscription.</span></label>
          <div class="quote-server-error" data-submit-error></div>
          <div class="quote-nav"><button class="btn btn-outline" type="button" data-back><i data-lucide="arrow-left"></i> Back</button><button class="btn btn-brass" type="submit"><span data-submit-label>Show My Next Step</span> <i data-lucide="arrow-right"></i></button></div>
        </section>
      </form>

      <section class="quote-status" data-quote-status aria-live="polite">
        <div class="quote-status-icon"><i data-status-icon data-lucide="check"></i></div>
        <h2 data-status-title></h2>
        <div class="quote-range" data-status-range hidden></div>
        <p data-status-copy></p>
        <div class="quote-status-note" data-status-note></div>
        <div class="quote-status-actions">
          <a href="tel:+19168998811" class="btn btn-brass"><i data-lucide="phone"></i> Call NataBel</a>
          <a href="free-estimate.html" class="btn btn-outline">Start Over</a>
        </div>
      </section>
    </div>`;
  }

  window.PCC = window.PCC || {};
  window.PCC.templates = { estimateFunnelCard };
})();
