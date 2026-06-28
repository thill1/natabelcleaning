/* =========================================================================
   NATABEL — Hero ambient atmosphere
   Soft floating bubbles. Brand palette only.
   ========================================================================= */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function bootHeroAmbient() {
    if (reduce) return;
    const mount = document.querySelector('.hero-bg') || document.querySelector('.hero');
    if (!mount) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-ambient-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    mount.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = [
      { r: 212, g: 175, b: 55 },  /* gold */
      { r: 255, g: 255, b: 255 },  /* white */
      { r: 10, g: 10, b: 10 },     /* black */
    ];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles = [];
    let glints = [];
    let raf = 0;
    let last = 0;
    let nextGlintAt = 0;

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
      seedParticles();
    }

    function seedParticles() {
      const isMobile = w < 760;
      const count = isMobile ? 6 : 11;
      particles = [];
      for (let i = 0; i < count; i++) {
        const col = palette[i % 3];
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 28 + Math.random() * (isMobile ? 40 : 72),
          col,
          alpha: 0.04 + Math.random() * 0.07,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.06,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function spawnGlint(now) {
      if (now < nextGlintAt) return;
      nextGlintAt = now + 7000 + Math.random() * 9000;
      if (glints.length > 2) return;
      glints.push({
        x: w * (0.15 + Math.random() * 0.7),
        y: h * (0.12 + Math.random() * 0.55),
        size: 6 + Math.random() * 14,
        born: now,
        life: 900 + Math.random() * 600,
        rot: Math.random() * Math.PI,
      });
    }

    function drawParticle(p, t) {
      const pulse = 0.85 + Math.sin(t * 0.0004 + p.phase) * 0.15;
      const r = p.r * pulse;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      const { r: cr, g: cg, b: cb } = p.col;
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${p.alpha * 1.4})`);
      g.addColorStop(0.45, `rgba(${cr},${cg},${cb},${p.alpha * 0.35})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawBubble(g, now) {
      const age = now - g.born;
      const p = Math.min(age / g.life, 1);
      const fade = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1;
      const alpha = fade * 0.5;
      const r = g.size * (0.5 + fade * 0.5);

      ctx.save();
      ctx.translate(g.x, g.y - p * 40);
      ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.15})`;
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(-r * 0.3, -r * 0.3, r * 0.22, r * 0.14, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function tick(now) {
      if (!last) last = now;
      const dt = Math.min(now - last, 32);
      last = now;

      ctx.clearRect(0, 0, w, h);
      spawnGlint(now);

      particles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -p.r) p.x = w + p.r;
        if (p.x > w + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = h + p.r;
        if (p.y > h + p.r) p.y = -p.r;
        drawParticle(p, now);
      });

      glints = glints.filter(g => now - g.born < g.life);
      glints.forEach(g => drawBubble(g, now));

      raf = requestAnimationFrame(tick);
    }

    resize();
    raf = requestAnimationFrame(tick);

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resize)
      : null;
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
