/* =========================================================================
   NATABEL CLEANING SERVICES — Premium motion layer
   GSAP + ScrollTrigger + Lucide + custom cursor + magnetic CTAs
   + before/after slider + parallax + animated counters + enhanced sparkles
   Loaded once per page via <script src="js/motion.js" defer>
   ========================================================================= */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Lucide icons ---------- */
  function bootLucide() {
    if (window.lucide) window.lucide.createIcons();
  }

  /* ---------- 2. Lightweight smooth scroll (CSS native) ---------- */
  function bootSmoothScroll() {
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  /* ---------- 3. GSAP + ScrollTrigger reveals & parallax ---------- */
  function bootGSAP() {
    if (!window.gsap) return;
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    if (reduce) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      return;
    }

    // Batch reveals grouped by .section containers (performance: ~10 triggers vs 50+)
    const sections = gsap.utils.toArray('.section');
    sections.forEach(section => {
      const reveals = section.querySelectorAll('.reveal');
      if (!reveals.length) return;
      gsap.fromTo(reveals,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });

    // Handle any reveals outside .section elements (exclude hero — those animate on load)
    const orphanReveals = gsap.utils.toArray('.reveal').filter(el => !el.closest('.section') && !el.closest('.hero'));
    if (orphanReveals.length) {
      // Group orphans by their closest common parent to batch efficiently
      const parentMap = new Map();
      orphanReveals.forEach(el => {
        const parent = el.parentElement;
        if (!parentMap.has(parent)) parentMap.set(parent, []);
        parentMap.get(parent).push(el);
      });
      parentMap.forEach((children, parent) => {
        gsap.fromTo(children,
          { y: 28, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.06,
            scrollTrigger: { trigger: parent, start: 'top 90%', toggleActions: 'play none none reverse' }
          }
        );
      });
      gsap.fromTo(orphanReveals,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.06,
          scrollTrigger: { trigger: orphanReveals[0], start: 'top 90%' }
        }
      );
    }

    // Parallax on elements with [data-parallax]
    if (window.ScrollTrigger) {
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.18;
        gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        });
      });

      // Hero headline: fade/blur intro on load
      const heroH1 = document.querySelector('.hero h1');
      const heroReveals = document.querySelectorAll('.hero .reveal');
      if (heroReveals.length && !reduce) {
        const heroTl = gsap.timeline({ delay: 0.1 });
        heroReveals.forEach(el => {
          const d = el.classList.contains('d1') ? 0.1 : el.classList.contains('d2') ? 0.2 : el.classList.contains('d3') ? 0.3 : 0;
          heroTl.fromTo(el,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
            d
          );
        });
      }
    }

    // Animated counters
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      const stOpts = { trigger: el, start: 'top 85%', once: true };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: 'power2.out',
        scrollTrigger: window.ScrollTrigger ? stOpts : undefined,
        onUpdate: () => {
          el.textContent = (Number.isInteger(target) ? Math.round(obj.v) : obj.v.toFixed(1)) + suffix;
        },
        onComplete: () => { el.textContent = (Number.isInteger(target) ? target : target.toFixed(1)) + suffix; },
      });
      if (!window.ScrollTrigger) { el.textContent = (Number.isInteger(target) ? target : target.toFixed(1)) + suffix; }
    });

    // Marquee: pause on hover
    document.querySelectorAll('.marquee-track').forEach(track => {
      track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
      track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
    });
  }

  /* ---------- 4. Custom cursor with idle timeout ---------- */
  function bootCursor() {
    if (!canHover || reduce) return;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = 0, my = 0, rx = 0, ry = 0, rafId = 0, idleTimer = 0;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (!rafId) startCursorLoop();
      clearTimeout(idleTimer);
      idleTimer = setTimeout(stopCursorLoop, 200);
    }, { passive: true });

    function startCursorLoop() {
      function tick() {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    function stopCursorLoop() {
      cancelAnimationFrame(rafId);
      rafId = 0;
      // Snap ring to final position
      ring.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }

    document.querySelectorAll('a, button, [data-cursor], .choice, .gallery-item, .ba-slider, .opt').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  }

  /* ---------- 5. Magnetic CTAs ---------- */
  function bootMagnetic() {
    if (!canHover || reduce) return;
    document.querySelectorAll('[data-magnetic], .btn-brass, .btn-cta').forEach(btn => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- 6. Before / After slider ---------- */
  function bootBeforeAfter() {
    document.querySelectorAll('.ba-slider').forEach(slider => {
      const wrap = slider.querySelector('.ba-after-wrap');
      const handle = slider.querySelector('.ba-handle');
      if (!wrap || !handle) return;
      let dragging = false;

      const setPos = (clientX) => {
        const r = slider.getBoundingClientRect();
        let pct = ((clientX - r.left) / r.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        wrap.style.width = pct + '%';
        handle.style.left = pct + '%';
      };
      const onMove = (e) => { if (!dragging) return; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
      const onDown = (e) => { dragging = true; onMove(e); };
      const onUp = () => { dragging = false; };

      slider.addEventListener('mousedown', onDown);
      slider.addEventListener('touchstart', onDown, { passive: true });
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);
      // Initial position + click-to-move
      slider.addEventListener('click', (e) => setPos(e.clientX));
      setPos(slider.getBoundingClientRect().left + slider.getBoundingClientRect().width * 0.5);
    });
  }

  /* ---------- 7. Sparkle stars on hero ---------- */
  function bootSparkle() {
    if (reduce) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
    layer.setAttribute('aria-hidden', 'true');
    hero.appendChild(layer);

    const isMobile = window.innerWidth < 760;
    const count = isMobile ? 16 : 32;

    // SVG star path generator — returns an SVG string for an N-pointed star
    function starSVG(points, outerR, innerR) {
      const size = outerR * 2 + 4;
      const cx = size / 2, cy = size / 2;
      let d = '';
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / points) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
      }
      d += 'Z';
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><path d="${d}" fill="currentColor"/></svg>`;
    }

    // 4-point star (classic sparkle)
    function fourPointSVG(size) {
      const cx = size / 2, cy = size / 2;
      const outer = size / 2;
      const inner = size * 0.12;
      const mid = size * 0.22;
      let d = '';
      const pts = [
        [cx, cy - outer],     // top
        [cx + mid, cy - mid],  // inner top-right
        [cx + outer, cy],      // right
        [cx + mid, cy + mid],  // inner bottom-right
        [cx, cy + outer],      // bottom
        [cx - mid, cy + mid],  // inner bottom-left
        [cx - outer, cy],      // left
        [cx - mid, cy - mid],  // inner top-left
      ];
      pts.forEach((p, i) => { d += (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ',' + p[1].toFixed(2); });
      d += 'Z';
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><path d="${d}" fill="currentColor"/></svg>`;
    }

    // Size tiers weighted by frequency
    const sizes = [
      { min: 8, max: 14, w: 3 },   // tiny
      { min: 16, max: 24, w: 3 },   // small
      { min: 28, max: 40, w: 2 },   // medium
      { min: 44, max: 64, w: 1 },   // large feature
    ];
    const pool = [];
    sizes.forEach(s => { for (let i = 0; i < s.w; i++) pool.push(s); });

    for (let i = 0; i < count; i++) {
      const profile = pool[Math.floor(Math.random() * pool.length)];
      const size = Math.round(profile.min + Math.random() * (profile.max - profile.min));

      // Pick star type: mostly 4-point, some 6-point for variety
      const typeRoll = Math.random();
      let svg;
      if (typeRoll < 0.65) {
        svg = fourPointSVG(size);
      } else if (typeRoll < 0.85) {
        svg = starSVG(6, size / 2, size * 0.18);
      } else {
        svg = starSVG(4, size / 2, size * 0.25);
      }

      // Color
      const colorRoll = Math.random();
      let color, glow;
      if (colorRoll < 0.3) {
        color = '#BFA26A'; glow = '0 0 ' + Math.round(size * 0.5) + 'px ' + Math.round(size * 0.15) + 'px rgba(191,162,106,0.45)';
      } else if (colorRoll < 0.5) {
        color = '#D4AF37'; glow = '0 0 ' + Math.round(size * 0.4) + 'px ' + Math.round(size * 0.12) + 'px rgba(212,175,55,0.4)';
      } else if (colorRoll < 0.7) {
        color = '#FFFFFF'; glow = '0 0 ' + Math.round(size * 0.4) + 'px ' + Math.round(size * 0.1) + 'px rgba(255,255,255,0.5)';
      } else if (colorRoll < 0.85) {
        color = '#78C9A0'; glow = '0 0 ' + Math.round(size * 0.35) + 'px ' + Math.round(size * 0.1) + 'px rgba(120,201,160,0.35)';
      } else {
        color = '#E0D4C0'; glow = '0 0 ' + Math.round(size * 0.3) + 'px rgba(224,212,192,0.3)';
      }

      const s = document.createElement('span');
      s.style.cssText = `position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:0;pointer-events:none;color:${color};filter:drop-shadow(${glow});`;
      s.innerHTML = svg;
      layer.appendChild(s);

      // Pick animation
      const animRoll = Math.random();
      const dur = 2400 + Math.random() * 3200;
      const delay = Math.random() * 7000;

      if (animRoll < 0.4) {
        // Classic twinkle
        const twinkle = () => {
          s.animate([
            { opacity: 0, transform: 'scale(0.3) rotate(0deg)' },
            { opacity: 0.9, transform: 'scale(1) rotate(15deg)' },
            { opacity: 0.3, transform: 'scale(1.15) rotate(25deg)' },
            { opacity: 0, transform: 'scale(0.3) rotate(45deg)' },
          ], { duration: dur, delay: Math.random() * 4000, easing: 'ease-in-out' }).onfinish = twinkle;
        };
        twinkle();
      } else if (animRoll < 0.65) {
        // Slow full rotation with fade
        const spin = () => {
          s.animate([
            { opacity: 0, transform: 'rotate(0deg) scale(0.2)' },
            { opacity: 0.85, transform: 'rotate(90deg) scale(1)', offset: 0.3 },
            { opacity: 0.85, transform: 'rotate(180deg) scale(1)', offset: 0.6 },
            { opacity: 0, transform: 'rotate(360deg) scale(0.2)' },
          ], { duration: dur * 2, delay, easing: 'ease-in-out' }).onfinish = spin;
        };
        spin();
      } else if (animRoll < 0.82) {
        // Float upward
        const drift = -10 - Math.random() * 18;
        const float = () => {
          s.animate([
            { opacity: 0, transform: 'translateY(0) scale(0.3)' },
            { opacity: 0.8, transform: `translateY(${drift * 0.5}px) scale(1)`, offset: 0.35 },
            { opacity: 0, transform: `translateY(${drift}px) scale(0.2)` },
          ], { duration: dur * 1.6, delay: Math.random() * 3000, easing: 'ease-out' }).onfinish = float;
        };
        float();
      } else {
        // Quick glint flash
        const glint = () => {
          s.animate([
            { opacity: 0, transform: 'scale(0.1)', filter: 'drop-shadow(0 0 0 transparent)' },
            { opacity: 1, transform: 'scale(1.4)', offset: 0.2 },
            { opacity: 1, transform: 'scale(1.4)', offset: 0.35 },
            { opacity: 0, transform: 'scale(0.1)', filter: 'drop-shadow(0 0 0 transparent)' },
          ], { duration: 700 + Math.random() * 500, delay: Math.random() * 9000, easing: 'ease-in-out' }).onfinish = glint;
        };
        glint();
      }
    }
  }

  /* ---------- Boot all ---------- */
  function boot() {
    bootSmoothScroll();
    bootGSAP();
    bootLucide();
    bootCursor();
    bootMagnetic();
    bootBeforeAfter();
    bootSparkle();
    // Re-init Lucide after partials inject icons
    setTimeout(bootLucide, 200);
    setTimeout(bootMagnetic, 250); // pick up dynamically-injected buttons
    // Refresh ScrollTrigger after fonts/layout settle
    window.addEventListener('load', () => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      bootLucide();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
