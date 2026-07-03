/* =========================================================================
   NATABEL — Realistic soap bubble renderer (shared)
   Thin-film iridescence, specular highlights, suds clusters.
   ========================================================================= */
(function () {
  'use strict';

  function hashSeed(seed) {
    let h = seed | 0;
    h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
    h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
    return (h ^ (h >>> 16)) >>> 0;
  }

  function rand(seed) {
    return hashSeed(seed) / 4294967295;
  }

  /**
   * Draw a single realistic soap bubble on canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {{ alpha?: number, seed?: number, rim?: number }} opts
   */
  function drawSoapBubble(ctx, x, y, radius, opts) {
    if (radius < 1.5) return;
    const alpha = opts && opts.alpha != null ? opts.alpha : 1;
    const seed = (opts && opts.seed) || Math.floor(x * 17 + y * 31 + radius * 13);
    const rimBoost = (opts && opts.rim) != null ? opts.rim : 1;
    const r = radius;

    ctx.save();

    /* No body fill — avoids soft orb glow when bubbles overlap on black */

    /* Thin white soap rim — no fill, no colored wash */
    ctx.beginPath();
    ctx.arc(x, y, r - 0.45, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.82 * alpha * rimBoost})`;
    ctx.lineWidth = Math.max(0.35, r * 0.028);
    ctx.stroke();

    /* Thin-film iridescence — faint spectral arcs hugging the rim.
       Gold-biased with whispers of rose and cyan; deterministic per seed. */
    if (r > 6) {
      const irA = 0.14 * alpha * rimBoost;
      const a0 = rand(seed + 21) * Math.PI * 2;
      const irW = Math.max(0.3, r * 0.022);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(x, y, r - 0.9, a0, a0 + 1.5);
      ctx.strokeStyle = `rgba(227,200,120,${irA})`;
      ctx.lineWidth = irW;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r - 0.9, a0 + 1.9, a0 + 2.9);
      ctx.strokeStyle = `rgba(200,150,190,${irA * 0.6})`;
      ctx.lineWidth = irW;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r - 0.9, a0 + 3.4, a0 + 4.5);
      ctx.strokeStyle = `rgba(140,200,215,${irA * 0.55})`;
      ctx.lineWidth = irW;
      ctx.stroke();
    }

    /* Faint inner arc — specular edge only */
    ctx.beginPath();
    ctx.arc(x, y, r - 0.75, -1.1, 0.6);
    ctx.strokeStyle = `rgba(255,255,255,${0.28 * alpha * rimBoost})`;
    ctx.lineWidth = Math.max(0.3, r * 0.02);
    ctx.lineCap = 'round';
    ctx.stroke();

    /* Specular highlight — upper left */
    ctx.fillStyle = `rgba(255,255,255,${0.88 * alpha})`;
    ctx.beginPath();
    ctx.ellipse(x - r * 0.32, y - r * 0.36, r * 0.18, r * 0.1, -0.55, 0, Math.PI * 2);
    ctx.fill();

    /* Secondary highlight */
    if (r > 8) {
      ctx.fillStyle = `rgba(255,255,255,${0.45 * alpha})`;
      ctx.beginPath();
      ctx.ellipse(x + r * 0.16, y - r * 0.46, r * 0.06, r * 0.035, -0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /** Suds cluster — overlapping micro-bubbles */
  function drawSudsCluster(ctx, x, y, baseR, opts) {
    const alpha = opts && opts.alpha != null ? opts.alpha : 0.85;
    const seed = (opts && opts.seed) || 0;
    const count = 3 + Math.floor(rand(seed + 1) * 4);
    const offsets = [
      [0, 0, 1],
      [-0.55, -0.15, 0.62],
      [0.5, -0.2, 0.55],
      [-0.25, 0.45, 0.48],
      [0.35, 0.4, 0.42],
      [-0.5, 0.35, 0.38],
    ];
    for (let i = 0; i < count; i++) {
      const [ox, oy, scale] = offsets[i];
      drawSoapBubble(ctx, x + ox * baseR, y + oy * baseR, baseR * scale, {
        alpha: alpha * (0.75 + rand(seed + i) * 0.25),
        seed: seed + i * 97,
        rim: 0.85 + rand(seed + i + 3) * 0.3,
      });
    }
  }

  function createSprite(size, opts) {
    const pad = 4;
    const canvas = document.createElement('canvas');
    canvas.width = size + pad * 2;
    canvas.height = size + pad * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const seed = (opts && opts.seed) || size * 7;
    if (opts && opts.cluster) {
      drawSudsCluster(ctx, cx, cy, size * 0.22, { alpha: opts.alpha, seed });
    } else {
      drawSoapBubble(ctx, cx, cy, size * 0.42, { alpha: opts && opts.alpha, seed });
    }
    return canvas.toDataURL('image/png');
  }

  function makeBubble(seed, w, h, opts) {
    const o = opts || {};
    const tier = rand(seed + 20);
    let minR;
    let maxR;
    if (tier < 0.38) {
      minR = o.minTiny != null ? o.minTiny : 3;
      maxR = o.maxTiny != null ? o.maxTiny : 12;
    } else if (tier < 0.78) {
      minR = o.minR != null ? o.minR : 10;
      maxR = o.maxR != null ? o.maxR : 34;
    } else {
      minR = o.minLarge != null ? o.minLarge : 26;
      maxR = o.maxLarge != null ? o.maxLarge : 64;
    }
    const r = minR + rand(seed) * (maxR - minR);
    const cluster = rand(seed + 5) < (o.clusterChance != null ? o.clusterChance : 0.28);
    const speedMul = 0.55 + rand(seed + 12) * 1.1;
    return {
      x: rand(seed + 1) * w,
      y: rand(seed + 2) * h,
      r,
      cluster,
      vy: -(0.06 + rand(seed + 3) * 0.52) * (o.density || 1) * speedMul,
      vx: (rand(seed + 4) - 0.5) * 0.28,
      wobblePhase: rand(seed + 6) * Math.PI * 2,
      phase2: rand(seed + 14) * Math.PI * 2,
      wobbleAmp: 0.6 + rand(seed + 7) * 2.8,
      wobbleSpeed: 0.0004 + rand(seed + 8) * 0.0035,
      swayAmp: 0.2 + rand(seed + 15) * 1.4,
      alpha: 0.5 + rand(seed + 9) * 0.45,
      seed,
      pop: 0,
      popSpeed: 0.002 + rand(seed + 16) * 0.004,
    };
  }

  function stepBubble(b, dt) {
    if (b.pop < 1) b.pop = Math.min(1, b.pop + b.popSpeed * dt);
    b.wobblePhase += b.wobbleSpeed * dt;
    b.x += b.vx * dt
      + Math.sin(b.wobblePhase) * b.wobbleAmp * 0.045 * dt
      + Math.cos(b.wobblePhase * 0.67 + b.phase2) * b.swayAmp * 0.022 * dt;
    b.y += b.vy * dt + Math.sin(b.wobblePhase * 1.35 + b.phase2) * 0.018 * dt;
  }

  function drawBubble(ctx, b, drawAlpha) {
    const popEase = b.pop < 1 ? 0.3 + 0.7 * (1 - Math.pow(1 - b.pop, 3)) : 1;
    const r = b.r * popEase;
    const a = drawAlpha * Math.min(1, b.pop * 1.4);
    if (b.cluster) {
      drawSudsCluster(ctx, b.x, b.y, r, { alpha: a, seed: b.seed });
    } else {
      drawSoapBubble(ctx, b.x, b.y, r, { alpha: a, seed: b.seed });
    }
  }

  function mountBubbleField(mount, options) {
    if (!mount || mount.dataset.bubbleField) return null;
    mount.dataset.bubbleField = '1';

    const canvas = document.createElement('canvas');
    canvas.className = 'natabel-bubble-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    if (mount.firstChild) mount.insertBefore(canvas, mount.firstChild);
    else mount.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const opts = options || {};
    let w = 0;
    let h = 0;
    let dpr = 1;
    let bubbles = [];
    let raf = 0;
    let last = 0;

    function isMobileField() {
      return w < 760;
    }

    function motionScale() {
      return isMobileField() ? 0.42 : 1;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = mount.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedField();
    }

    function seedField() {
      const isMobile = isMobileField();
      const base = opts.count || (isMobile ? 46 : 56);
      const count = isMobile
        ? Math.floor(base * 1.3)
        : Math.floor(base * (w / 1100 + 0.55));
      bubbles = [];
      for (let i = 0; i < count; i++) {
        const b = makeBubble(i * 131 + 17, w, h, {
          minTiny: 3,
          maxTiny: isMobile ? 16 : 14,
          minR: isMobile ? 6 : 8,
          maxR: isMobile ? 40 : 44,
          minLarge: isMobile ? 18 : 22,
          maxLarge: isMobile ? 56 : 68,
          density: isMobile ? 1.12 : (opts.density || 1),
          clusterChance: isMobile ? 0.42 : (opts.clusterChance || 0.3),
        });
        b.y = rand(b.seed + 2) * h;
        bubbles.push(b);
      }
    }

    function respawn(b, i) {
      const isMobile = isMobileField();
      Object.assign(b, makeBubble(i * 131 + Date.now() % 10000, w, h, {
        minTiny: 3,
        maxTiny: isMobile ? 16 : 14,
        minR: isMobile ? 6 : 8,
        maxR: isMobile ? 40 : 36,
        minLarge: isMobile ? 18 : 22,
        maxLarge: isMobile ? 56 : 68,
        density: isMobile ? 1.12 : (opts.density || 1),
        clusterChance: isMobile ? 0.42 : (opts.clusterChance || 0.3),
      }));
      b.y = h + b.r + rand(b.seed) * 60;
      b.x = rand(b.seed + 11) * w;
      b.pop = 0;
    }

    function tick(now) {
      if (!last) last = now;
      const dt = Math.min(now - last, 32);
      last = now;

      ctx.clearRect(0, 0, w, h);

      bubbles.forEach((b, i) => {
        stepBubble(b, dt * motionScale());

        if (b.y < -b.r * 3) respawn(b, i);

        const edgeFade = Math.min(1, Math.min(b.y / (h * 0.12), (h - b.y) / (h * 0.08)) || 1);
        const drawAlpha = b.alpha * Math.max(0.25, edgeFade);
        drawBubble(ctx, b, drawAlpha);
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

    return { canvas, destroy: () => { cancelAnimationFrame(raf); canvas.remove(); delete mount.dataset.bubbleField; } };
  }

  window.NatabelBubbleRender = {
    drawSoapBubble,
    drawSudsCluster,
    createSprite,
    makeBubble,
    stepBubble,
    drawBubble,
    mountBubbleField,
  };
})();
