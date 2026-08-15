/* NataBel branded bubble texture for black and near-black site surfaces. */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = [
    '.simple-section.dark',
    '.simple-choice-card.dark',
    '.concierge-card-inner',
    '.simple-founder',
    '.simple-cta',
    '.simple-photo-note',
    '.site-footer',
    '.page-hero',
    '.cta-banner',
    '.side-cta',
    '.card'
  ];

  function parseRgb(value) {
    const match = String(value || '').match(/rgba?\((\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:[,\s\/]+([\d.]+))?\)/i);
    if (!match) return null;
    return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] == null ? 1 : Number(match[4]) };
  }

  function isDarkSurface(element) {
    const color = parseRgb(getComputedStyle(element).backgroundColor);
    if (!color || color.a < 0.35) return false;
    const luminance = (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b);
    return luminance < 42;
  }

  function bubbleOptions(element) {
    const rect = element.getBoundingClientRect();
    const isCard = rect.width < 760 || element.matches('.simple-choice-card, .concierge-card-inner, .simple-founder, .simple-photo-note, .side-cta, .card');
    const isFooter = element.matches('.site-footer');
    return {
      count: isFooter ? 18 : (isCard ? 11 : 22),
      density: isCard ? 0.48 : 0.62,
      clusterChance: isCard ? 0.18 : 0.24
    };
  }

  function mountAll() {
    const renderer = window.NatabelBubbleRender;
    if (!renderer || reduceMotion) return;

    const seen = new Set();
    targets.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (seen.has(element) || element.matches('.simple-hero') || !isDarkSurface(element)) return;
        const rect = element.getBoundingClientRect();
        if (rect.width < 180 || rect.height < 90) return;
        seen.add(element);
        element.classList.add('natabel-dark-bubbles');
        renderer.mountBubbleField(element, bubbleOptions(element));
      });
    });
  }

  function ensureRenderer() {
    if (window.NatabelBubbleRender) {
      mountAll();
      return;
    }
    if (document.querySelector('script[data-dark-bubble-renderer]')) return;
    const script = document.createElement('script');
    script.src = 'js/bubble-render.js?v=20260815-dark-surfaces';
    script.dataset.darkBubbleRenderer = 'true';
    script.onload = mountAll;
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureRenderer, { once: true });
  else ensureRenderer();
})();
