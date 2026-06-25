/* =========================================================================
   NATABEL — Premium sparkle system (site-wide)
   Refined specular star glints + drifting gold motes.
   Brand palette only. Respects reduced-motion. No cartoon stars.
   ========================================================================= */
(function () {
  'use strict';
  if (window.__NatabelSparkles) return;
  window.__NatabelSparkles = true;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const STAR_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 0 C12.6 6, 18 9.4, 24 12 C18 14.6, 12.6 18, 12 24 C11.4 18, 6 14.6, 0 12 C6 9.4, 11.4 6, 12 0 Z" fill="currentColor"/>
  </svg>`;

  const GLOW_SVG = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="20" cy="20" r="3" fill="currentColor"/>
    <circle cx="20" cy="20" r="12" fill="currentColor" opacity="0.18"/>
    <circle cx="20" cy="20" r="20" fill="currentColor" opacity="0.06"/>
  </svg>`;

  function el(tag, cls, style) {
    const e = document.createElement(tag);
    e.className = cls;
    e.setAttribute('aria-hidden', 'true');
    if (style) Object.assign(e.style, style);
    return e;
  }

  /* ---------- 1. Section accent stars — subtle, fixed in key sections ---------- */
  function placeSectionStars() {
    const targets = document.querySelectorAll(
      '.section-head, .cta-banner, .page-hero-copy, .hero-copy, .trust-ribbon, .funnel-card .funnel-progress, .form-head, .split, .grid-4'
    );
    targets.forEach(scope => {
      if (scope.querySelector('.natabel-star')) return;
      // Fewer stars in copy-heavy areas to avoid overlapping text
      const isCopy = scope.classList.contains('page-hero-copy') || scope.classList.contains('hero-copy');
      const isHead = scope.classList.contains('section-head');
      const count = isCopy ? 1 : (isHead ? 1 : 2);
      for (let i = 0; i < count; i++) {
        const star = el('span', 'natabel-star');
        // Place in upper region / corners to avoid text overlap
        const sx = isCopy ? (3 + Math.random() * 12) : (5 + Math.random() * 90);
        const sy = isCopy ? (2 + Math.random() * 10) : (8 + Math.random() * 80);
        star.innerHTML = STAR_SVG;
        star.style.setProperty('--sx', sx + '%');
        star.style.setProperty('--sy', sy + '%');
        star.style.setProperty('--sd', (Math.random() * 6).toFixed(2) + 's');
        star.style.setProperty('--ss', (0.6 + Math.random() * 0.4).toFixed(2));
        scope.style.position = scope.style.position || 'relative';
        scope.appendChild(star);
      }
    });
  }

  /* ---------- 2. Drifting motes — premium gold dust in hero + page heroes ---------- */
  function placeMotes() {
    if (reduce) return;
    const mounts = document.querySelectorAll('.hero-bg, .page-hero');
    mounts.forEach(mount => {
      if (mount.querySelector('.natabel-motes')) return;
      const wrap = el('div', 'natabel-motes');
      const isHero = mount.classList.contains('hero-bg');
      const n = isHero ? 14 : 8;
      for (let i = 0; i < n; i++) {
        const mote = el('span', 'natabel-mote');
        mote.style.setProperty('--mx', (Math.random() * 100).toFixed(2) + '%');
        mote.style.setProperty('--my', (Math.random() * 100).toFixed(2) + '%');
        mote.style.setProperty('--md', (Math.random() * 14).toFixed(2) + 's');
        mote.style.setProperty('--mr', (Math.random() * 360).toFixed(0) + 'deg');
        mote.style.setProperty('--ms', (0.5 + Math.random() * 0.9).toFixed(2));
        const isGlow = Math.random() > 0.78;
        mote.innerHTML = isGlow ? GLOW_SVG : STAR_SVG;
        mote.classList.toggle('is-glow', isGlow);
        wrap.appendChild(mote);
      }
      mount.appendChild(wrap);
    });
  }

  /* ---------- 3. Cursor sparkle trail (premium, desktop only, very subtle) ---------- */
  function bootCursorSparkle() {
    if (!canHover || reduce) return;
    let last = 0;
    let pool = [];
    for (let i = 0; i < 8; i++) {
      const s = el('span', 'natabel-trail');
      s.innerHTML = STAR_SVG;
      s.style.display = 'none';
      document.body.appendChild(s);
      pool.push({ el: s, free: true, born: 0 });
    }
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - last < 90) return;
      last = now;
      const slot = pool.find(p => p.free);
      if (!slot) return;
      slot.free = false;
      slot.born = now;
      slot.el.style.display = 'block';
      slot.el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(${0.6 + Math.random() * 0.5})`;
      slot.el.style.opacity = '0.9';
      setTimeout(() => {
        slot.el.style.opacity = '0';
        slot.el.style.transform += ' scale(0.2)';
      }, 40);
      setTimeout(() => {
        slot.el.style.display = 'none';
        slot.free = true;
      }, 700);
    }, { passive: true });
  }

  /* ---------- 4. Sparkle on CTA hover (premium micro-interaction) ---------- */
  function bootCTASparkles() {
    if (reduce) return;
    document.querySelectorAll('.btn-brass, .btn-emerald, [data-magnetic]').forEach(btn => {
      if (btn.dataset.sparkleBound) return;
      btn.dataset.sparkleBound = '1';
      btn.addEventListener('mouseenter', () => {
        const s = el('span', 'natabel-btn-spark');
        s.innerHTML = STAR_SVG;
        btn.style.position = btn.style.position || 'relative';
        btn.appendChild(s);
        setTimeout(() => s.remove(), 900);
      });
    });
  }

  function boot() {
    placeSectionStars();
    placeMotes();
    bootCursorSparkle();
    bootCTASparkles();
    // Re-run after partials/funnel injection settles
    setTimeout(() => { placeSectionStars(); placeMotes(); bootCTASparkles(); }, 400);
    window.addEventListener('load', () => { placeSectionStars(); bootCTASparkles(); });
  }

  window.NatabelSparkles = { boot, placeSectionStars, placeMotes, bootCTASparkles };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
