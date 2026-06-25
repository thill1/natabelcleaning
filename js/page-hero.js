/* =========================================================================
   NATABEL — Page hero v2 + photography slots
   Upgrades interior .page-hero sections and [data-photo] split panels.
   ========================================================================= */
(function () {
  'use strict';
  if (!window.PCC || !window.PCC.images) return;

  const IMG = window.PCC.images;

  const PAGE_KEYS = {
    'commercial.html': 'commercial',
    'office-cleaning.html': 'office',
    'janitorial-services.html': 'janitorial',
    'residential.html': 'residential',
    'deep-cleaning.html': 'deep',
    'move-in-out.html': 'move',
    'recurring-cleaning.html': 'recurring',
    'property-management.html': 'property',
    'about.html': 'about',
    'contact.html': 'contact',
    'faq.html': 'faq',
    'reviews.html': 'reviews',
    'service-areas.html': 'areas',
    'book-online.html': 'booking',
    'free-estimate.html': 'estimate',
  };

  function pageFile() {
    return (location.pathname.split('/').pop() || 'index.html');
  }

  function photo(key) {
    return IMG.pages[key] || IMG.pages.default;
  }

  function buildImg(p, opts) {
    opts = opts || {};
    const w = opts.width || 960;
    const src = p.src.includes('?') ? p.src : `${p.src}?w=${w}&q=82&auto=format&fit=crop`;
    return `<img src="${src}" alt="${p.alt}" width="${w}" height="${Math.round(w * 0.75)}" loading="${opts.loading || 'lazy'}" decoding="async" />`;
  }

  function upgradePageHero(section) {
    if (section.classList.contains('page-hero-ready')) return;
    const key = section.dataset.heroKey || PAGE_KEYS[pageFile()] || 'default';
    const p = photo(key);
    if (!p) return;

    section.classList.add('page-hero-split', 'page-hero-ready');
    const container = section.querySelector('.container');
    if (!container) return;

    let inner = container.querySelector('.page-hero-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'page-hero-inner';
      while (container.firstChild) inner.appendChild(container.firstChild);
      container.appendChild(inner);
    }

    let copy = inner.querySelector('.page-hero-copy');
    if (!copy) {
      copy = document.createElement('div');
      copy.className = 'page-hero-copy';
      while (inner.firstChild) copy.appendChild(inner.firstChild);
      inner.appendChild(copy);
    }

    if (!inner.querySelector('.page-hero-media')) {
      const fig = document.createElement('figure');
      fig.className = 'page-hero-media reveal d1';
      fig.innerHTML = buildImg(p, { loading: 'eager', width: 800 });
      inner.appendChild(fig);
    }
  }

  function fillPhotoSlot(el) {
    if (el.dataset.photoReady) return;
    const key = el.dataset.photo;
    const p = photo(key);
    if (!p) return;
    el.dataset.photoReady = '1';
    el.classList.add('photo-slot');
    if (el.classList.contains('visual-panel') || el.classList.contains('split-media')) {
      el.classList.remove('visual-panel', 'emerald', 'brass');
      el.innerHTML = `<div class="photo-slot-inner">${buildImg(p, { width: 900 })}<div class="photo-slot-overlay"></div></div>`;
      return;
    }
    el.innerHTML = buildImg(p, { width: 720 });
  }

  function boot() {
    document.querySelectorAll('.page-hero:not(.page-hero-ready)').forEach(upgradePageHero);
    document.querySelectorAll('[data-photo]').forEach(fillPhotoSlot);
  }

  window.PCC.pageHero = { boot, photo, PAGE_KEYS };
  boot();
})();
