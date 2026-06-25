/* =========================================================================
   NATABEL CLEANING SERVICES — Core site interactions
   Header scroll, mobile menu, reveal-on-scroll, FAQ accordion, phone tracking
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 12) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const menu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  const toggle = document.querySelector('.menu-toggle');
  const closeBtn = document.querySelector('.mobile-menu .mm-close');

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle) toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  if (overlay) overlay.addEventListener('click', () => setMenu(false));
  if (closeBtn) closeBtn.addEventListener('click', () => setMenu(false));
  if (menu) menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Reveal on scroll (IntersectionObserver — fallback only) ---------- */
  // GSAP ScrollTrigger handles all reveals when available.
  // This IO is a progressive-enhancement fallback for when GSAP is absent.
  if (!window.gsap || !window.ScrollTrigger) {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      const group = item.closest('.faq-group');
      if (group) {
        group.querySelectorAll('.faq-item.open').forEach(other => {
          if (other !== item) {
            other.classList.remove('open');
            const oa = other.querySelector('.faq-a');
            if (oa) oa.style.maxHeight = null;
          }
        });
      }
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = !isOpen ? (a.scrollHeight + 'px') : null;
      q.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  /* ---------- Phone-click tracking ---------- */
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', () => {
      if (window.PCC && window.PCC.util) {
        window.PCC.util.track(window.PCC.events.phoneClick, {
          phone: a.getAttribute('href'),
          location: window.location.pathname,
        });
      }
    });
  });

  /* ---------- Smooth anchor scroll offset (sticky header) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    a.addEventListener('click', e => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = (header ? header.offsetHeight : 0) + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Animated number counters ---------- */
  const nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window) {
    const ioNum = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = 1200;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        ioNum.unobserve(el);
      });
    }, { threshold: 0.4 });
    nums.forEach(el => ioNum.observe(el));
  }

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Inject phone/email into all [data-phone] elements ---------- */
  if (window.PCC) {
    document.querySelectorAll('[data-phone="display"]').forEach(el => { el.textContent = window.PCC.business.phone; });
    document.querySelectorAll('[data-phone="email"]').forEach(el => { el.textContent = window.PCC.business.email; });
  }
})();
