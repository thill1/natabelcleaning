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
      document.querySelectorAll('[data-reveal], .reveal').forEach(el => {
        el.classList.add('is-in', 'in');
      });
      return;
    }

    // CSS-first reveals: hero animates on load, others on scroll.
    // We add .is-in (and legacy .in) — the transition lives in CSS.
    const heroReveals = document.querySelectorAll('.hero [data-reveal]');
    heroReveals.forEach(el => {
      const delay = parseInt(el.dataset.revealDelay || '0', 10);
      setTimeout(() => el.classList.add('is-in'), 80 + delay * 90);
    });

    // Non-hero [data-reveal] via ScrollTrigger
    if (window.ScrollTrigger) {
      gsap.utils.toArray('[data-reveal]').forEach(el => {
        if (el.closest('.hero')) return;
        gsap.fromTo(el,
          { y: 28, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
          }
        );
      });
    } else {
      document.querySelectorAll('[data-reveal]:not(.hero [data-reveal])').forEach(el => el.classList.add('is-in'));
    }

    // Legacy .reveal support for generated pages
    const legacySections = gsap.utils.toArray('.section');
    legacySections.forEach(section => {
      const reveals = section.querySelectorAll('.reveal:not(.is-in):not(.in)');
      if (!reveals.length) return;
      gsap.fromTo(reveals,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none none' },
          onComplete: function () { reveals.forEach(r => r.classList.add('in')); }
        }
      );
    });

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

  /* ---------- 7. Hero scene parallax & shine ---------- */
  function bootHeroStage() {
    const scene = document.getElementById('heroScene');
    const shine = document.getElementById('heroShine');
    if (!scene || reduce) return;

    if (canHover) {
      scene.addEventListener('mousemove', (e) => {
        const r = scene.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        scene.style.transform = `rotateY(${px * 4}deg) rotateX(${-py * 3}deg)`;
        if (shine) {
          const sx = ((e.clientX - r.left) / r.width) * 100;
          const sy = ((e.clientY - r.top) / r.height) * 100;
          shine.style.background = `radial-gradient(circle 280px at ${sx}% ${sy}%, rgba(255,255,255,.4), transparent 65%)`;
          shine.style.opacity = '1';
        }
      }, { passive: true });
      scene.addEventListener('mouseleave', () => {
        scene.style.transform = '';
        if (shine) shine.style.opacity = '';
      });
    }

    if (window.gsap && window.ScrollTrigger && !reduce) {
      const heroSection = document.querySelector('.hero-v2');
      if (heroSection) {
        window.gsap.to(scene, {
          y: -24,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }
    }
  }

  /* ---------- 8. Hero ambient (replaces legacy sparkles) ---------- */
  function bootSparkle() {
    if (window.NatabelHeroAmbient && window.NatabelHeroAmbient.boot) {
      window.NatabelHeroAmbient.boot();
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
    bootHeroStage();
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
