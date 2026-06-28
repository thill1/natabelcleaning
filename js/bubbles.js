/* =========================================================================
   NATABEL — Realistic suds bubble system (site-wide)
   Canvas-rendered soap bubbles with iridescent film & suds clusters.
   ========================================================================= */
(function () {
  'use strict';
  if (window.__NatabelBubbles) return;
  window.__NatabelBubbles = true;

  const R = window.NatabelBubbleRender;
  if (!R) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function el(tag, cls) {
    const e = document.createElement(tag);
    e.className = cls;
    e.setAttribute('aria-hidden', 'true');
    return e;
  }

  function bubbleImg(size, opts) {
    const img = el('img', 'natabel-bubble-img');
    img.src = R.createSprite(size, opts || {});
    img.width = size;
    img.height = size;
    img.decoding = 'async';
    return img;
  }

  /* ---------- 1. Section accent suds (static sprites, gentle float) ---------- */
  function placeSectionBubbles() {
    const targets = document.querySelectorAll(
      '.section-head, .cta-banner, .page-hero-copy, .trust-ribbon, .funnel-card .funnel-progress, .form-head, .split, .grid-4, .section-gold'
    );
    targets.forEach((scope, ti) => {
      if (scope.querySelector('.natabel-bubble')) return;
      const isCopy = scope.classList.contains('page-hero-copy');
      const count = isCopy ? 3 : 4;
      for (let i = 0; i < count; i++) {
        const bubble = el('span', 'natabel-bubble');
        const sx = isCopy ? (2 + Math.random() * 16) : (4 + Math.random() * 90);
        const sy = isCopy ? (4 + Math.random() * 12) : (6 + Math.random() * 82);
        const size = Math.random() > 0.4 ? 36 + Math.floor(Math.random() * 28) : 22 + Math.floor(Math.random() * 14);
        const cluster = Math.random() > 0.55;
        bubble.appendChild(bubbleImg(size, { seed: ti * 100 + i * 17, cluster, alpha: 0.88 }));
        bubble.style.setProperty('--bx', sx + '%');
        bubble.style.setProperty('--by', sy + '%');
        bubble.style.setProperty('--bd', (Math.random() * 8).toFixed(2) + 's');
        bubble.style.setProperty('--bs', (0.65 + Math.random() * 0.55).toFixed(2));
        bubble.classList.toggle('is-sm', size < 30);
        bubble.classList.toggle('is-cluster', cluster);
        scope.style.position = scope.style.position || 'relative';
        scope.appendChild(bubble);
      }
    });
  }

  /* ---------- 2. Canvas suds fields — hero handled by hero-ambient.js ---------- */
  function mountCanvasFields() {
    if (reduce) return;
    document.querySelectorAll('.page-hero, .section-dark').forEach(mount => {
      R.mountBubbleField(mount, {
        count: mount.classList.contains('section-dark') ? 28 : 22,
        minTiny: 3,
        maxTiny: 12,
        minR: 8,
        maxR: 38,
        minLarge: 20,
        maxLarge: 58,
        clusterChance: 0.34,
      });
    });
  }

  /* ---------- 3. Cursor suds trail ---------- */
  function bootCursorBubbles() {
    if (!canHover || reduce) return;
    let last = 0;
    const pool = [];
    for (let i = 0; i < 8; i++) {
      const b = el('span', 'natabel-trail-bubble');
      b.appendChild(bubbleImg(18, { seed: i * 13, alpha: 0.9 }));
      b.style.display = 'none';
      document.body.appendChild(b);
      pool.push({ el: b, free: true });
    }
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - last < 120) return;
      last = now;
      const slot = pool.find(p => p.free);
      if (!slot) return;
      slot.free = false;
      slot.el.style.display = 'block';
      const scale = 0.45 + Math.random() * 0.5;
      slot.el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(${scale})`;
      slot.el.style.opacity = '0.85';
      setTimeout(() => {
        slot.el.style.opacity = '0';
        slot.el.style.transform += ' scale(0.05) translateY(-24px)';
      }, 40);
      setTimeout(() => {
        slot.el.style.display = 'none';
        slot.free = true;
      }, 900);
    }, { passive: true });
  }

  /* ---------- 4. Suds pop on CTA hover ---------- */
  function bootCTABubbles() {
    if (reduce) return;
    document.querySelectorAll('.btn-brass, .btn-emerald, .btn-dark, [data-magnetic]').forEach(btn => {
      if (btn.dataset.bubbleBound) return;
      btn.dataset.bubbleBound = '1';
      btn.addEventListener('mouseenter', () => {
        const wrap = el('span', 'natabel-btn-bubble');
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          const b = el('span', 'natabel-btn-bubble-piece');
          b.appendChild(bubbleImg(14 + Math.floor(Math.random() * 10), { seed: Date.now() + i, cluster: i === 0 }));
          b.style.setProperty('--bi', i);
          wrap.appendChild(b);
        }
        btn.style.position = btn.style.position || 'relative';
        btn.appendChild(wrap);
        setTimeout(() => wrap.remove(), 1000);
      });
    });
  }

  function boot() {
    placeSectionBubbles();
    mountCanvasFields();
    bootCursorBubbles();
    bootCTABubbles();
    setTimeout(() => { placeSectionBubbles(); mountCanvasFields(); bootCTABubbles(); }, 400);
    window.addEventListener('load', () => { placeSectionBubbles(); bootCTABubbles(); });
  }

  window.NatabelBubbles = { boot, placeSectionBubbles, bootCTABubbles };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
