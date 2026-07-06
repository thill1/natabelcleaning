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
  const NO_MEDIA_KEYS = new Set(['contact', 'faq', 'estimate']);

  function pageFile() {
    return (location.pathname.split('/').pop() || 'index.html');
  }

  function photo(key) {
    return Object.prototype.hasOwnProperty.call(IMG.pages, key) ? IMG.pages[key] : IMG.pages.default;
  }

  function buildImg(p, opts) {
    opts = opts || {};
    const w = opts.width || 960;
    const local = src => src && (/^(assets\/|\/assets\/|https:\/\/www\.natabelpristinecleaning\.com\/assets\/)/).test(src);
    const formatSrc = src => {
      if (!src) return '';
      if (local(src) || src.includes('?')) return src;
      return `${src}?w=${w}&q=82&auto=format&fit=crop`;
    };
    const src = formatSrc(p.src);
    const webp = formatSrc(p.webp);
    const width = p.width || w;
    const height = p.height || Math.round(width * 0.75);
    const img = `<img src="${src}" alt="${p.alt}" width="${width}" height="${height}" loading="${opts.loading || 'lazy'}" decoding="async" />`;
    if (webp) return `<picture><source srcset="${webp}" type="image/webp">${img}</picture>`;
    return img;
  }

  function removeBrokenImage(img) {
    const media = img.closest('.page-hero-media');
    if (media) {
      media.remove();
      return;
    }

    const slot = img.closest('.photo-slot');
    if (slot) slot.classList.add('photo-slot-empty');
    img.remove();
  }

  function bindImageFallback(root) {
    root.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', () => removeBrokenImage(img), { once: true });
      if (img.complete && img.naturalWidth === 0) removeBrokenImage(img);
    });
  }

  function upgradePageHero(section) {
    if (section.classList.contains('page-hero-ready')) return;
    const key = section.dataset.heroKey || PAGE_KEYS[pageFile()] || 'default';
    const noMedia = section.dataset.heroMedia === 'none' || NO_MEDIA_KEYS.has(key);
    const p = noMedia ? null : photo(key);
    if (!noMedia && !p) return;

    section.classList.add(noMedia ? 'page-hero-no-media' : 'page-hero-split', 'page-hero-ready');
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

    if (!copy.querySelector('.page-hero-logo')) {
      const logoWrap = document.createElement('div');
      logoWrap.className = 'page-hero-logo';
      logoWrap.innerHTML = `<img src="assets/logo-wordmark.png" alt="${window.PCC.business.name}" class="page-hero-logo-img" width="280" height="134" />`;
      copy.insertBefore(logoWrap, copy.firstChild);
    }

    if (!noMedia && !inner.querySelector('.page-hero-media')) {
      const fig = document.createElement('figure');
      fig.className = `page-hero-media page-hero-media-${key} reveal d1`;
      fig.innerHTML = buildImg(p, { loading: 'eager', width: 800 });
      bindImageFallback(fig);
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
      bindImageFallback(el);
      return;
    }
    el.innerHTML = buildImg(p, { width: 720 });
    bindImageFallback(el);
  }

  function boot() {
    if (document.querySelector('.page-hero')) {
      document.documentElement.classList.add('has-page-hero');
    }
    document.querySelectorAll('.page-hero:not(.page-hero-ready)').forEach(upgradePageHero);
    document.querySelectorAll('[data-photo]').forEach(fillPhotoSlot);
  }

  window.PCC.pageHero = { boot, photo, PAGE_KEYS };
  boot();
})();
