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

    // Handle any reveals outside .section elements (exclude hero — it has its own intro animation)
    const orphanReveals = gsap.utils.toArray('.reveal').filter(el => !el.closest('.section') && !el.closest('.hero'));
    if (orphanReveals.length) {
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
      if (heroH1 && !reduce) {
        gsap.from(heroH1, { y: 26, opacity: 0, filter: 'blur(8px)', duration: 1.2, ease: 'power3.out', delay: 0.15 });
      }
      // Hero visual drift
      const heroVisual = document.querySelector('.hero-visual');
      if (heroVisual) {
        gsap.from(heroVisual, { opacity: 0, y: 40, duration: 1.1, ease: 'power3.out', delay: 0.25 });
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
    const count = isMobile ? 18 : 36;

    // Mix of sizes: tiny accent dots, small stars, medium stars, large feature stars
    const sizeProfile = [
      { min: 6, max: 10, weight: 4 },   // tiny
      { min: 12, max: 18, weight: 3 },   // small
      { min: 20, max: 30, weight: 2 },   // medium
      { min: 34, max: 48, weight: 1 },   // large (sparse)
    ];

    // Build weighted pool
    const pool = [];
    sizeProfile.forEach(p => { for (let i = 0; i < p.weight; i++) pool.push(p); });

    for (let i = 0; i < count; i++) {
      const profile = pool[Math.floor(Math.random() * pool.length)];
      const size = profile.min + Math.random() * (profile.max - profile.min);
      const x = Math.random() * 100;
      const y = Math.random() * 100;

      // Star shape via CSS cross (+ optional ::after for 4-point burst)
      const s = document.createElement('i');
      s.className = 'sparkle-star';

      // Decide color tier
      const colorRoll = Math.random();
      let color, glowColor, opacity;
      if (colorRoll < 0.35) {
        // Gold/brass — primary accent
        color = '#BFA26A';
        glowColor = 'rgba(191,162,106,0.5)';
        opacity = 0.7 + Math.random() * 0.3;
      } else if (colorRoll < 0.55) {
        // White — clean sparkle
        color = '#FFFFFF';
        glowColor = 'rgba(255,255,255,0.6)';
        opacity = 0.6 + Math.random() * 0.4;
      } else if (colorRoll < 0.75) {
        // Emerald — subtle brand color
        color = '#5EAD92';
        glowColor = 'rgba(94,173,146,0.4)';
        opacity = 0.5 + Math.random() * 0.3;
      } else {
        // Pale champagne — soft warm
        color = '#E8DCC8';
        glowColor = 'rgba(232,220,200,0.35)';
        opacity = 0.5 + Math.random() * 0.3;
      }

      // Random variant: some are diamond-rotated, some thick-armed
      const variants = [];
      if (Math.random() < 0.3) variants.push('diamond');
      if (Math.random() < 0.25) variants.push('thick');
      if (variants.length) s.className += ' ' + variants.join(' ');

      s.style.cssText = `left:${x}%;top:${y}%;width:${size}px;height:${size}px;color:${color};opacity:0;box-shadow:0 0 ${Math.round(size*0.6)}px ${Math.round(size*0.2)}px ${glowColor};`;

      layer.appendChild(s);

      // Pick animation style
      const animRoll = Math.random();
      const dur = 2200 + Math.random() * 3500;
      const delay = Math.random() * 6000;

      if (animRoll < 0.35) {
        // Classic twinkle: flash bright then fade
        const twinkle = () => {
          s.animate([
            { opacity: 0, transform: 'scale(0.3)', filter: 'blur(1px)' },
            { opacity: opacity, transform: 'scale(1)', filter: 'blur(0px)' },
            { opacity: opacity * 0.4, transform: 'scale(1.1)', filter: 'blur(0px)' },
            { opacity: 0, transform: 'scale(0.3)', filter: 'blur(1px)' },
          ], { duration: dur, delay: Math.random() * 4000, easing: 'ease-in-out' }).onfinish = twinkle;
        };
        twinkle();
      } else if (animRoll < 0.6) {
        // Slow rotate + pulse: elegant feel
        const startAngle = Math.floor(Math.random() * 360);
        const spin = () => {
          s.animate([
            { opacity: 0, transform: `rotate(${startAngle}deg) scale(0.2)`, filter: 'blur(1px)' },
            { opacity: opacity, transform: `rotate(${startAngle + 90}deg) scale(1)`, filter: 'blur(0px)' },
            { opacity: opacity * 0.5, transform: `rotate(${startAngle + 180}deg) scale(0.8)`, filter: 'blur(0px)' },
            { opacity: 0, transform: `rotate(${startAngle + 360}deg) scale(0.2)`, filter: 'blur(1px)' },
          ], { duration: dur * 1.6, delay, easing: 'ease-in-out' }).onfinish = spin;
        };
        spin();
      } else if (animRoll < 0.8) {
        // Float upward gently while fading
        const driftY = -12 - Math.random() * 20;
        const float = () => {
          s.animate([
            { opacity: 0, transform: 'translateY(0) scale(0.4)' },
            { opacity: opacity * 0.9, transform: `translateY(${driftY * 0.4}px) scale(1)`, offset: 0.4 },
            { opacity: 0, transform: `translateY(${driftY}px) scale(0.3)` },
          ], { duration: dur * 1.8, delay: Math.random() * 3000, easing: 'ease-out' }).onfinish = float;
        };
        float();
      } else {
        // Quick flash — like a camera glint
        const glint = () => {
          s.animate([
            { opacity: 0, transform: 'scale(0.1)', filter: 'blur(2px)' },
            { opacity: 1, transform: 'scale(1.3)', filter: 'blur(0px)' },
            { opacity: 1, transform: 'scale(1.3)', filter: 'blur(0px)', offset: 0.3 },
            { opacity: 0, transform: 'scale(0.1)', filter: 'blur(2px)' },
          ], { duration: 800 + Math.random() * 600, delay: Math.random() * 8000, easing: 'ease-in-out' }).onfinish = glint;
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
