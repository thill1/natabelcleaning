/* NataBel hero-matched bubble texture for every black / near-black surface. */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = [
    '.site-header',
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
    '.card',
    '.bg-emerald',
    '.bg-black'
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
    return luminance < 46;
  }

  /* These are the same bubble size, cluster, and motion values used by the
     homepage hero so the brand texture reads as one system everywhere. */
  function heroBubbleOptions(isMobile) {
    return {
      minTiny: 3,
      maxTiny: isMobile ? 13 : 16,
      minR: isMobile ? 7 : 10,
      maxR: isMobile ? 32 : 48,
      minLarge: isMobile ? 18 : 24,
      maxLarge: isMobile ? 44 : 72,
      density: isMobile ? 0.9 : 1,
      clusterChance: isMobile ? 0.34 : 0.32
    };
  }

  function heroEquivalentCount(w, h) {
    const isMobile = w < 760;
    const referenceArea = isMobile ? (390 * 650) : (1100 * 760);
    const referenceCount = isMobile ? 64 : 68;
    const count = Math.round(referenceCount * ((w * h) / referenceArea));
    return Math.max(6, Math.min(referenceCount, count));
  }

  function mountHeroMatchedField(mount, R) {
    if (!mount || mount.dataset.heroMatchedBubbles) return;
    mount.dataset.heroMatchedBubbles = '1';
    mount.classList.add('natabel-dark-bubbles');

    const canvas = document.createElement('canvas');
    canvas.className = 'natabel-bubble-canvas natabel-hero-matched-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    mount.insertBefore(canvas, mount.firstChild);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let bubbles = [];
    let raf = 0;
    let last = 0;

    function motionScale() {
      return w < 760 ? 0.42 : 1;
    }

    function keepMobileBubbleInFrame(b) {
      if (w >= 760) return;
      const inset = Math.max(14, b.r * 0.72);
      b.x = Math.min(w - inset, Math.max(inset, b.x));
    }

    function seedBubbles() {
      const isMobile = w < 760;
      const count = heroEquivalentCount(w, h);
      bubbles = [];
      for (let i = 0; i < count; i++) {
        const b = R.makeBubble(i * 173 + 41, w, h, heroBubbleOptions(isMobile));
        keepMobileBubbleInFrame(b);
        b.y = (i / count) * (h + 80) + b.r;
        b.pop = b.y > h * 0.82 ? 0 : 1;
        bubbles.push(b);
      }
    }

    function resize() {
      const rect = mount.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedBubbles();
    }

    function respawn(b, i) {
      const isMobile = w < 760;
      Object.assign(b, R.makeBubble(i * 173 + (Date.now() % 8000), w, h, heroBubbleOptions(isMobile)));
      b.y = h + b.r + 10 + Math.random() * 40;
      b.x = Math.random() * w;
      keepMobileBubbleInFrame(b);
      b.pop = 0;
    }

    function tick(now) {
      if (!last) last = now;
      const dt = Math.min(now - last, 32);
      last = now;
      ctx.clearRect(0, 0, w, h);

      bubbles.forEach((b, i) => {
        R.stepBubble(b, dt * motionScale());
        if (b.y < -b.r * 4) respawn(b, i);
        const drawAlpha = b.alpha * (0.65 + (b.y / Math.max(h, 1)) * 0.35);
        R.drawBubble(ctx, b, drawAlpha);
      });

      raf = requestAnimationFrame(tick);
    }

    resize();
    raf = requestAnimationFrame(tick);

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(mount);
    else window.addEventListener('resize', resize, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    });
  }

  function mountAll() {
    const R = window.NatabelBubbleRender;
    if (!R || reduceMotion) return;

    const seen = new Set();
    targets.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (seen.has(element) || element.matches('.simple-hero') || !isDarkSurface(element)) return;
        const rect = element.getBoundingClientRect();
        if (rect.width < 160 || rect.height < 56) return;
        seen.add(element);
        mountHeroMatchedField(element, R);
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
    script.src = 'js/bubble-render.js?v=20260815-hero-match';
    script.dataset.darkBubbleRenderer = 'true';
    script.onload = mountAll;
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureRenderer, { once: true });
  else ensureRenderer();
})();
