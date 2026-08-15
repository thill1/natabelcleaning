/*
 * NataBel estimator service area.
 *
 * This is an operational allowlist, not a generic California ZIP-code range.
 * The estimator must fail closed so a ZIP is eligible only when it is listed
 * here. Keep this file as the single source of truth for both the browser and
 * the server-side quote API.
 */
(function (root, factory) {
  const serviceArea = factory();
  if (typeof module === 'object' && module.exports) module.exports = serviceArea;
  else root.NataBelServiceArea = serviceArea;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const zipGroups = Object.freeze({
    sacramento: [
      '95811','95814','95815','95816','95817','95818','95819','95820','95821','95822',
      '95823','95824','95825','95826','95827','95828','95829','95830','95831','95832',
      '95833','95834','95835','95838','95841','95842','95843','95864'
    ],
    sacramentoSuburbs: [
      '95608', /* Carmichael */
      '95610','95621', /* Citrus Heights */
      '95628', /* Fair Oaks */
      '95630', /* Folsom */
      '95660', /* North Highlands */
      '95662', /* Orangevale */
      '95670','95742', /* Rancho Cordova / Gold River */
      '95673', /* Rio Linda */
      '95624','95757','95758' /* Elk Grove */
    ],
    westSacramentoAndDavis: [
      '95605','95691', /* West Sacramento */
      '95616','95618' /* Davis */
    ],
    placerCounty: [
      '95661','95678','95747', /* Roseville */
      '95677','95765', /* Rocklin */
      '95746', /* Granite Bay */
      '95650', /* Loomis */
      '95648', /* Lincoln */
      '95663', /* Penryn */
      '95658', /* Newcastle */
      '95602','95603' /* Auburn */
    ],
    elDoradoHills: [
      '95762'
    ]
  });

  const eligibleZips = Object.freeze(Object.values(zipGroups).flat());
  const eligibleZipSet = new Set(eligibleZips);

  function normalizeZip(value) {
    return String(value || '').trim();
  }

  function isEligibleZip(value) {
    return eligibleZipSet.has(normalizeZip(value));
  }

  return Object.freeze({
    version: 'sacramento-metro-2026-08-15',
    eligibleZips,
    zipGroups,
    isEligibleZip
  });
});
