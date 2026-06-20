/* =========================================================
   Sentient Partners — Neural Field (reusable)
   A living, interactive particle network on <canvas>.
   - Particles drift and pulse (the "alive" feel)
   - Pointer exerts a gentle attraction + glow
   - Nearby particles form luminous connections (synapses)
   - Occasional light pulses travel along links to the cursor
   - DPI-aware, resize-safe, rAF-throttled, reduced-motion safe

   Usage:
     NeuralField.create('#neural-canvas', { ...overrides });
   ========================================================= */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const DEFAULTS = {
    density: 11000,       // px² per particle (lower = more particles)
    maxParticles: 120,
    minParticles: 26,
    linkDistance: 150,
    mouseRadius: 200,
    speed: 0.28,
    baseSize: 1.6,
    pulseChance: 0.0008,  // chance per link-frame to emit a cursor pulse
    interactive: true,
    colors: {
      platinum:       { r: 199, g: 205, b: 214 },
      platinumBright: { r: 232, g: 237, b: 242 },
      ice:            { r: 184, g: 212, b: 227 },
      navy:           { r: 110, g: 150, b: 200 },
    },
  };

  function pickColor(cfg) {
    const r = Math.random();
    if (r < 0.45) return cfg.colors.platinum;
    if (r < 0.75) return cfg.colors.ice;
    if (r < 0.92) return cfg.colors.platinumBright;
    return cfg.colors.navy;
  }

  function create(selector, options) {
    const canvas = document.querySelector(selector);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d', { alpha: true });
    const cfg = Object.assign({}, DEFAULTS, options || {});

    let width = 0, height = 0, dpr = 1;
    let particles = [];
    let pulses = [];
    let mouse = { x: -9999, y: -9999, active: false };
    let rafId = null;
    let running = false;

    function Particle() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const sp = cfg.speed * (0.4 + Math.random() * 0.9);
      this.vx = Math.cos(angle) * sp;
      this.vy = Math.sin(angle) * sp;
      this.color = pickColor(cfg);
      this.size = cfg.baseSize * (0.6 + Math.random() * 1.3);
      this.phase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.012 + Math.random() * 0.02;
      this.currentSize = this.size;
    }
    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;

      if (cfg.interactive && mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < cfg.mouseRadius && dist > 0.1) {
          const force = (1 - dist / cfg.mouseRadius) * 0.45;
          this.x += (dx / dist) * force;
          this.y += (dy / dist) * force;
        }
      }
      this.phase += this.pulseSpeed;
      this.currentSize = this.size + Math.sin(this.phase) * 0.7;
    };
    Particle.prototype.draw = function () {
      const c = this.color;
      const s = Math.max(0.3, this.currentSize);
      ctx.beginPath();
      ctx.arc(this.x, this.y, s * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.06)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.9)`;
      ctx.fill();
    };

    function countForArea() {
      const n = Math.round((width * height) / cfg.density);
      return Math.max(cfg.minParticles, Math.min(cfg.maxParticles, n));
    }
    function buildParticles() {
      const target = countForArea();
      particles = [];
      for (let i = 0; i < target; i++) particles.push(new Particle());
    }

    function drawLinks() {
      const max = cfg.linkDistance;
      const max2 = max * max;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < max2) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / max) * 0.22;
            const c1 = p.color, c2 = q.color;
            const grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
            grad.addColorStop(0, `rgba(${c1.r},${c1.g},${c1.b},${alpha})`);
            grad.addColorStop(1, `rgba(${c2.r},${c2.g},${c2.b},${alpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        if (cfg.interactive && mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < cfg.mouseRadius) {
            const alpha = (1 - d / cfg.mouseRadius) * 0.6;
            const c = p.color;
            ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            if (Math.random() < cfg.pulseChance) {
              pulses.push({ x1: p.x, y1: p.y, x2: mouse.x, y2: mouse.y, t: 0, color: c });
            }
          }
        }
      }
    }

    function drawPulses() {
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += 0.03;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const x = p.x1 + (p.x2 - p.x1) * p.t;
        const y = p.y1 + (p.y2 - p.y1) * p.t;
        const c = p.color;
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${1 - p.t})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${0.15 * (1 - p.t)})`;
        ctx.fill();
      }
    }

    function drawCursorGlow() {
      if (!cfg.interactive || !mouse.active) return;
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, cfg.mouseRadius);
      grad.addColorStop(0, 'rgba(199,205,214,0.10)');
      grad.addColorStop(0.5, 'rgba(184,212,227,0.05)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, cfg.mouseRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      drawCursorGlow();
      for (let i = 0; i < particles.length; i++) particles[i].update();
      drawLinks();
      drawPulses();
      for (let i = 0; i < particles.length; i++) particles[i].draw();
      rafId = requestAnimationFrame(frame);
    }

    function renderStatic() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) particles[i].draw();
      drawLinks();
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      let cx, cy;
      if (e.touches && e.touches[0]) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
      else { cx = e.clientX; cy = e.clientY; }
      mouse.x = cx - rect.left;
      mouse.y = cy - rect.top;
      mouse.active = true;
    }
    function onLeave() { mouse.active = false; mouse.x = -9999; mouse.y = -9999; }

    function start() {
      if (running) return;
      running = true;
      if (!reducedMotion) rafId = requestAnimationFrame(frame);
      else renderStatic();
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    // Pause when offscreen (perf)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { en.isIntersecting && !reducedMotion ? start() : stop(); });
    }, { threshold: 0.01 });
    io.observe(canvas);

    function debounce(fn, wait) {
      let t; return function () { clearTimeout(t); t = setTimeout(() => fn.apply(this, arguments), wait); };
    }

    function init() {
      resize();
      window.addEventListener('resize', debounce(resize, 180), { passive: true });
      if (cfg.interactive) {
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mouseout', onLeave, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onLeave, { passive: true });
      }
      start();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    return { start, stop, resize };
  }

  window.NeuralField = { create };
})();
