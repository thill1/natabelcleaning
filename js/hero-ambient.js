/* =========================================================================
   NATABEL — Hero ambient suds
   Realistic rising soap bubbles on the homepage hero canvas.
   Interactive: bubbles drift away from the pointer; click to pop.
   ========================================================================= */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const R = window.NatabelBubbleRender;

  function bootHeroAmbient() {
    if (reduce || !R) return;
    const mount = document.querySelector('.hero-bg') || document.querySelector('.hero');
    if (!mount) return;

    let canvas = mount.querySelector('.hero-ambient-canvas, #heroAmbient, .natabel-bubble-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'hero-ambient-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      mount.appendChild(canvas);
    }
    if (canvas.dataset.heroSuds) return;
    canvas.dataset.heroSuds = '1';

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

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = mount.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedBubbles();
    }

    function seedBubbles() {
      const isMobile = w < 760;
      const count = isMobile ? 64 : 68;
      bubbles = [];
      for (let i = 0; i < count; i++) {
        const b = R.makeBubble(i * 173 + 41, w, h, {
          minTiny: 3,
          maxTiny: isMobile ? 18 : 16,
          minR: isMobile ? 8 : 10,
          maxR: isMobile ? 44 : 48,
          minLarge: isMobile ? 20 : 24,
          maxLarge: isMobile ? 62 : 72,
          density: isMobile ? 1.15 : 1,
          clusterChance: isMobile ? 0.44 : 0.32,
        });
        b.y = (i / count) * (h + 80) + b.r;
        b.pop = b.y > h * 0.82 ? 0 : 1;
        bubbles.push(b);
      }
    }

    function respawn(b, i) {
      const isMobile = w < 760;
      Object.assign(b, R.makeBubble(i * 173 + (Date.now() % 8000), w, h, {
        minTiny: 3,
        maxTiny: isMobile ? 18 : 16,
        minR: isMobile ? 8 : 10,
        maxR: isMobile ? 44 : 48,
        minLarge: isMobile ? 20 : 24,
        maxLarge: isMobile ? 62 : 72,
        density: isMobile ? 1.15 : 1,
        clusterChance: isMobile ? 0.44 : 0.32,
      }));
      b.y = h + b.r + 10 + Math.random() * 40;
      b.x = Math.random() * w;
      b.pop = 0;
    }

    /* ---------- Pointer interaction ---------- */
    const pointer = { x: -9999, y: -9999, active: false };
    const heroEl = mount.closest('.hero') || mount;

    function toCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    if (canHover) {
      heroEl.addEventListener('mousemove', (e) => {
        const p = toCanvasCoords(e);
        pointer.x = p.x; pointer.y = p.y; pointer.active = true;
      }, { passive: true });
      heroEl.addEventListener('mouseleave', () => { pointer.active = false; }, { passive: true });
    }

    // Click-to-pop: playful burst on empty hero space (links still work)
    heroEl.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input, select, label')) return;
      const p = toCanvasCoords(e);
      let popped = 0;
      bubbles.forEach(b => {
        const dx = b.x - p.x, dy = b.y - p.y;
        if (!b.bursting && Math.hypot(dx, dy) < Math.max(60, b.r + 26) && popped < 6) {
          b.bursting = 0.0001;
          popped++;
        }
      });
    });

    const REPEL_R = 140;
    function repel(b, dt) {
      if (!pointer.active) return;
      const dx = b.x - pointer.x;
      const dy = b.y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.5 && d < REPEL_R) {
        const f = (1 - d / REPEL_R) * 0.055 * dt;
        b.x += (dx / d) * f * (18 / Math.max(10, b.r));
        b.y += (dy / d) * f * (18 / Math.max(10, b.r));
      }
    }

    function tick(now) {
      if (!last) last = now;
      const dt = Math.min(now - last, 32);
      last = now;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      bubbles.forEach((b, i) => {
        if (b.bursting) {
          // Pop: rim expands and fades, then the bubble is reborn below
          b.bursting = Math.min(1, b.bursting + (dt * motionScale()) / 240);
          const burstR = b.r * (1 + b.bursting * 0.6);
          const burstA = b.alpha * (1 - b.bursting);
          if (burstA > 0.01) {
            R.drawSoapBubble(ctx, b.x, b.y, burstR, { alpha: burstA, seed: b.seed, rim: 1.3 });
          }
          if (b.bursting >= 1) { respawn(b, i); b.bursting = 0; }
          return;
        }

        const scaledDt = dt * motionScale();
        R.stepBubble(b, scaledDt);
        repel(b, scaledDt);

        if (b.y < -b.r * 4) respawn(b, i);

        const drawAlpha = b.alpha * (0.65 + (b.y / h) * 0.35);
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

  window.NatabelHeroAmbient = { boot: bootHeroAmbient };
})();
