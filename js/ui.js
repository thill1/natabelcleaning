/* =========================================================================
   NATABEL CLEANING SERVICES — UI enhancements
   Promo bar, floating CTA, config-driven social proof, choice radios
   ========================================================================= */
(function () {
  'use strict';
  if (!window.PCC) return;

  const B = window.PCC.business;
  const R = window.PCC.reviews;

  /* ---------- Config-driven text ---------- */
  document.querySelectorAll('[data-rating]').forEach(el => {
    el.textContent = String(R.googleRating);
  });
  document.querySelectorAll('[data-review-count]').forEach(el => {
    el.textContent = String(R.reviewCount);
  });
  document.querySelectorAll('[data-clients]').forEach(el => {
    el.textContent = R.clientsServed;
  });

  /* ---------- Promo bar dismiss ---------- */
  const promo = document.querySelector('.promo-bar');
  if (promo) {
    const key = 'natabel-promo-dismissed';
    const close = promo.querySelector('.promo-close');
    if (localStorage.getItem(key) === '1') promo.classList.add('hidden');
    if (close) {
      close.addEventListener('click', () => {
        promo.classList.add('hidden');
        try { localStorage.setItem(key, '1'); } catch (e) { /* ignore */ }
        document.documentElement.classList.remove('has-promo');
      });
    }
    if (!promo.classList.contains('hidden')) {
      document.documentElement.classList.add('has-promo');
    }
  }

  /* ---------- Floating estimate CTA (desktop) ---------- */
  const floatCta = document.querySelector('.float-cta');
  if (floatCta) {
    const hero = document.querySelector('.hero, .page-hero');
    let visible = false;
    const onScroll = () => {
      const threshold = hero ? hero.offsetTop + hero.offsetHeight * 0.55 : 420;
      const show = window.scrollY > threshold;
      if (show === visible) return;
      visible = show;
      floatCta.classList.toggle('visible', show);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Choice radios: sync .checked on load + click ---------- */
  function syncChoiceGroup(group) {
    group.querySelectorAll('.choice').forEach(c => {
      const input = c.querySelector('input[type="radio"], input[type="checkbox"]');
      if (input) c.classList.toggle('checked', input.checked);
    });
  }
  document.querySelectorAll('.choice-group').forEach(group => {
    syncChoiceGroup(group);
    group.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', () => syncChoiceGroup(group));
    });
  });

  /* ---------- Invalid choice groups: clear on select ---------- */
  document.querySelectorAll('.field.invalid .choice input').forEach(input => {
    input.addEventListener('change', () => {
      const field = input.closest('.field');
      if (field && input.form?.querySelector(`input[name="${input.name}"]:checked`)) {
        field.classList.remove('invalid');
      }
    });
  });
})();
