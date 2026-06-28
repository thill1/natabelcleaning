/* =========================================================================
   NATABEL — Premium bubble system (site-wide)
   Floating soap bubbles for a refined cleaning brand motif.
   Brand palette only. Respects reduced-motion.
   ========================================================================= */
(function () {
  'use strict';
  if (window.__NatabelBubbles) return;
  window.__NatabelBubbles = true;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const BUBBLE_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="bubbleShine" cx="28%" cy="24%" r="65%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.85"/>
        <stop offset="45%" stop-color="#fff" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="currentColor" stop-opacity="0.08"/>
      </radialGradient>
    </defs>
    <circle cx="16" cy="16" r="13.5" fill="url(#bubbleShine)" stroke="currentColor" stroke-width="1.1" opacity="0.82"/>
    <ellipse cx="11" cy="11" rx="4" ry="2.5" fill="#fff" opacity="0.55" transform="rotate(-28 11 11)"/>
  </svg>`;

  const BUBBLE_SM = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="0.9" opacity="0.75"/>
    <circle cx="6" cy="6" r="1.8" fill="#fff" opacity="0.6"/>
  </svg>`;

  function el(tag, cls, style) {
    const e = document.createElement(tag);
    e.className = cls;
    e.setAttribute('aria-hidden', 'true');
    if (style) Object.assign(e.style, style);
    return e;
  }

  /* ---------- 1. Section accent bubbles ---------- */
  function placeSectionBubbles() {
    const targets = document.querySelectorAll(
      '.section-head, .cta-banner, .page-hero-copy, .hero-copy, .trust-ribbon, .funnel-card .funnel-progress, .form-head, .split, .grid-4, .section-dark, .section-gold'
    );
    targets.forEach(scope => {
      if (scope.querySelector('.natabel-bubble')) return;
      const isCopy = scope.classList.contains('page-hero-copy') || scope.classList.contains('hero-copy');
      const isHead = scope.classList.contains('section-head');
      const count = isCopy ? 2 : (isHead ? 2 : 3);
      for (let i = 0; i < count; i++) {
        const bubble = el('span', 'natabel-bubble');
        const sx = isCopy ? (2 + Math.random() * 18) : (4 + Math.random() * 92);
        const sy = isCopy ? (4 + Math.random() * 14) : (6 + Math.random() * 84);
        bubble.innerHTML = Math.random() > 0.45 ? BUBBLE_SVG : BUBBLE_SM;
        bubble.style.setProperty('--bx', sx + '%');
        bubble.style.setProperty('--by', sy + '%');
        bubble.style.setProperty('--bd', (Math.random() * 8).toFixed(2) + 's');
        bubble.style.setProperty('--bs', (0.55 + Math.random() * 0.75).toFixed(2));
        bubble.style.setProperty('--br', (Math.random() * 360).toFixed(0) + 'deg');
        bubble.classList.toggle('is-sm', Math.random() > 0.55);
        scope.style.position = scope.style.position || 'relative';
        scope.appendChild(bubble);
      }
    });
  }

  /* ---------- 2. Drifting bubbles in hero + page heroes ---------- */
  function placeDriftingBubbles() {
    if (reduce) return;
    const mounts = document.querySelectorAll('.hero-bg, .page-hero, .section-dark');
    mounts.forEach(mount => {
      if (mount.querySelector('.natabel-bubbles')) return;
      const wrap = el('div', 'natabel-bubbles');
      const isHero = mount.classList.contains('hero-bg');
      const n = isHero ? 18 : (mount.classList.contains('section-dark') ? 8 : 10);
      for (let i = 0; i < n; i++) {
        const bubble = el('span', 'natabel-drift');
        bubble.style.setProperty('--dx', (Math.random() * 100).toFixed(2) + '%');
        bubble.style.setProperty('--dy', (Math.random() * 100).toFixed(2) + '%');
        bubble.style.setProperty('--dd', (Math.random() * 16).toFixed(2) + 's');
        bubble.style.setProperty('--ds', (0.45 + Math.random() * 1.1).toFixed(2));
        bubble.style.setProperty('--df', (14 + Math.random() * 28).toFixed(0) + 's');
        bubble.innerHTML = Math.random() > 0.35 ? BUBBLE_SVG : BUBBLE_SM;
        bubble.classList.toggle('is-gold', Math.random() > 0.5);
        wrap.appendChild(bubble);
      }
      mount.appendChild(wrap);
    });
  }

  /* ---------- 3. Cursor bubble trail (desktop, subtle) ---------- */
  function bootCursorBubbles() {
    if (!canHover || reduce) return;
    let last = 0;
    const pool = [];
    for (let i = 0; i < 10; i++) {
      const b = el('span', 'natabel-trail-bubble');
      b.innerHTML = BUBBLE_SM;
      b.style.display = 'none';
      document.body.appendChild(b);
      pool.push({ el: b, free: true });
    }
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - last < 110) return;
      last = now;
      const slot = pool.find(p => p.free);
      if (!slot) return;
      slot.free = false;
      slot.el.style.display = 'block';
      const scale = 0.5 + Math.random() * 0.6;
      slot.el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(${scale})`;
      slot.el.style.opacity = '0.75';
      setTimeout(() => {
        slot.el.style.opacity = '0';
        slot.el.style.transform += ' scale(0.1) translateY(-20px)';
      }, 50);
      setTimeout(() => {
        slot.el.style.display = 'none';
        slot.free = true;
      }, 800);
    }, { passive: true });
  }

  /* ---------- 4. Bubble pop on CTA hover ---------- */
  function bootCTABubbles() {
    if (reduce) return;
    document.querySelectorAll('.btn-brass, .btn-emerald, .btn-dark, [data-magnetic]').forEach(btn => {
      if (btn.dataset.bubbleBound) return;
      btn.dataset.bubbleBound = '1';
      btn.addEventListener('mouseenter', () => {
        const b = el('span', 'natabel-btn-bubble');
        b.innerHTML = BUBBLE_SM;
        btn.style.position = btn.style.position || 'relative';
        btn.appendChild(b);
        setTimeout(() => b.remove(), 950);
      });
    });
  }

  function boot() {
    placeSectionBubbles();
    placeDriftingBubbles();
    bootCursorBubbles();
    bootCTABubbles();
    setTimeout(() => { placeSectionBubbles(); placeDriftingBubbles(); bootCTABubbles(); }, 400);
    window.addEventListener('load', () => { placeSectionBubbles(); bootCTABubbles(); });
  }

  window.NatabelBubbles = { boot, placeSectionBubbles, placeDriftingBubbles, bootCTABubbles };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
