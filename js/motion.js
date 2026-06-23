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

    // Handle any reveals outside .section elements
    const orphanReveals = gsap.utils.toArray('.reveal').filter(el => !el.closest('.section'));
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

  /* ---------- 7. Enhanced sparkle on hero ---------- */
  function bootSparkle() {
    if (reduce) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Subtle warm vignette behind sparkles for contrast against light bg
    const vignette = document.createElement('div');
    vignette.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 50% 40%,rgba(176,135,85,.04) 0%,transparent 70%);';
    hero.appendChild(vignette);

    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
    hero.appendChild(layer);

    const count = window.innerWidth < 760 ? 12 : 24;
    const colors = ['#CBA874', '#B08755', '#FFFFFF', '#DCEEE7'];

    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      const size = 4 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const isGold = color === '#CBA874' || color === '#B08755';
      s.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:${color};left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:0;${isGold ? 'box-shadow:0 0 6px 2px rgba(203,168,116,0.35);' : ''}`;
      layer.appendChild(s);

      // Vary animation types for visual richness
      const animType = Math.random();
      const dur = 2000 + Math.random() * 3000;
      const delay = Math.random() * 5000;

      if (animType < 0.5) {
        // Twinkle: quick bright flash
        const anim = () => {
          s.animate([
            { opacity: 0, transform: 'scale(.5)' },
            { opacity: 0.95, transform: 'scale(1.2)' },
            { opacity: 0, transform: 'scale(.5)' },
          ], { duration: dur, delay: Math.random() * 3000, easing: 'ease-in-out' }).onfinish = anim;
        };
        anim();
      } else if (animType < 0.8) {
        // Gentle pulse with slight upward drift
        const driftY = -8 - Math.random() * 16;
        const anim = () => {
          s.animate([
            { opacity: 0, transform: 'scale(.6) translateY(0)' },
            { opacity: 0.85, transform: 'scale(1) translateY(' + driftY * 0.5 + 'px)' },
            { opacity: 0, transform: 'scale(.4) translateY(' + driftY + 'px)' },
          ], { duration: dur * 1.4, delay, easing: 'ease-in-out' }).onfinish = anim;
        };
        anim();
      } else {
        // Slow steady glow with brightness pulse
        const anim = () => {
          s.animate([
            { opacity: 0, transform: 'scale(.4)', filter: 'brightness(1)' },
            { opacity: 1, transform: 'scale(1)', filter: 'brightness(1.4)' },
            { opacity: 0, transform: 'scale(.4)', filter: 'brightness(1)' },
          ], { duration: dur * 1.8, delay: Math.random() * 2000, easing: 'ease-in-out' }).onfinish = anim;
        };
        anim();
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
