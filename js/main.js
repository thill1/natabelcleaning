/* =========================================================
   Sentient Partners — Interactions
   - Lenis smooth scroll + GSAP/ScrollTrigger sync
   - Scroll-reveal (.reveal -> .is-visible)
   - Animated stat counters
   - Nav scroll state + mobile menu + smooth anchor scrolling
   - Magnetic CTAs
   - Neural field bootstrapping (hero + CTA)
   ========================================================= */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersReduced = reducedMotion;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !prefersReduced) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // IMPORTANT: drive Lenis from exactly ONE rAF loop.
    // When GSAP is present, use its ticker only (it also powers ScrollTrigger).
    // Running both loops double-advances Lenis and makes scroll stutter.
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Anchor links (respect Lenis if present) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -90 });
      else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      // close mobile menu
      const mm = document.getElementById('mobile-menu');
      if (mm) mm.classList.add('hidden');
    });
  });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('hidden'));
  }

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById('scroll-progress');
  const updateProgress = () => {
    if (!progress) return;
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    progress.style.width = (scrolled * 100) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Scroll reveal ---------- */
  // Signal a healthy load so the head safety-net timer doesn't fire.
  window.__revealOK = true;
  try { window.clearTimeout(window.__revealFallback); } catch (e) {}

  // Re-add js-enabled in case the inline head script is the one that ran.
  document.documentElement.classList.add('js-enabled');
  const revealEls = document.querySelectorAll('.reveal');
  try {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // small stagger for grouped reveals
            const delay = Math.min((i % 6) * 60, 300);
            setTimeout(() => entry.target.classList.add('is-visible'), delay);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  } catch (e) {
    // If anything goes wrong, just show everything.
    revealEls.forEach((el) => el.classList.add('is-visible'));
    document.documentElement.classList.remove('js-enabled');
  }

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const duration = 1800;
    const start = performance.now();
    const isInt = Number.isInteger(target);
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);   // easeOutCubic
      const val = target * eased;
      el.textContent = isInt ? Math.round(val).toString() : val.toFixed(1);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = isInt ? target.toString() : target.toFixed(1);
    }
    requestAnimationFrame(tick);
  }
  const counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (prefersReduced) {
            entry.target.textContent = entry.target.dataset.target;
          } else {
            animateCounter(entry.target);
          }
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Magnetic buttons ---------- */
  if (!prefersReduced) {
    document.querySelectorAll('.cta-magnetic').forEach((btn) => {
      const strength = 0.3;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('sp-theme', next); } catch (e) {}
      // Refresh ScrollTrigger measurements after layout shifts
      if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 550);
    });
  }

  /* ---------- Horizontal pinned scroll showcase ---------- */
  function initPinnedScroll() {
    if (prefersReduced || !window.gsap || !window.ScrollTrigger) return;
    const section = document.getElementById('showcase');
    const track = document.getElementById('pin-track');
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const getScrollAmount = () => {
      // distance to scroll the track horizontally
      return Math.max(0, track.scrollWidth - window.innerWidth + 64);
    };

    const tween = gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        // pin for the horizontal travel distance plus a little breathing room
        end: () => '+=' + (getScrollAmount() + window.innerHeight * 0.5),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    // Refresh once images/fonts settle
    window.addEventListener('load', () => ScrollTrigger.refresh());
    return tween;
  }

  /* ---------- Parallax orbs ---------- */
  function initParallaxOrbs() {
    if (prefersReduced || !window.gsap || !window.ScrollTrigger) return;
    document.querySelectorAll('.orb').forEach((orb, i) => {
      gsap.to(orb, {
        yPercent: (i + 1) * 12,
        ease: 'none',
        scrollTrigger: { trigger: orb.closest('section') || document.body, start: 'top top', end: 'bottom top', scrub: 1.2 },
      });
    });
  }

  /* ---------- Flip card tap (touch devices) ---------- */
  document.querySelectorAll('.flip-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      // On touch, hover doesn't work — toggle a class. Ignore clicks on the CTA link.
      if (e.target.closest('a')) return;
      card.classList.toggle('is-flipped');
    });
  });

  /* ---------- Custom cursor ---------- */
  if (!prefersReduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (dot && ring) {
      let mx = 0, my = 0, rx = 0, ry = 0;
      window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      }, { passive: true });
      const tick = () => {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(tick);
      };
      tick();
      // grow ring over interactive elements
      document.querySelectorAll('a, button, .flip-card, input, textarea, select').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
      });
    }
  }

  /* ---------- Neural fields ---------- */
  try {
    if (window.NeuralField) {
      // Hero — full interactive constellation
      NeuralField.create('#neural-canvas', {
        density: 11000,
        maxParticles: 120,
        linkDistance: 150,
        interactive: true,
      });

      // CTA band — sparser, more violet, still alive
      NeuralField.create('#cta-canvas', {
        density: 18000,
        maxParticles: 60,
        minParticles: 18,
        linkDistance: 130,
        interactive: true,
        colors: {
          platinum:       { r: 199, g: 205, b: 214 },
          platinumBright: { r: 232, g: 237, b: 242 },
          ice:            { r: 184, g: 212, b: 227 },
          navy:           { r: 110, g: 150, b: 200 },
        },
      });

      // 3D platinum monogram (hero center-right)
      if (window.SPMonogram) {
        window.SPMonogram.create('#monogram-mount', { scale: 0.95 });
      }
    }
  } catch (e) {
    // A canvas error must never break the page.
    if (window.console) console.warn('Neural field skipped:', e);
  }

  /* ---------- Boot scroll-driven effects (after GSAP available) ---------- */
  // Defer so ScrollTrigger reads correct layout once fonts/Tailwind settle.
  function bootScrollFX() {
    try {
      initPinnedScroll();
      initParallaxOrbs();
    } catch (e) {
      if (window.console) console.warn('Scroll FX skipped:', e);
    }
  }
  if (document.readyState === 'complete') bootScrollFX();
  else window.addEventListener('load', bootScrollFX);
})();
