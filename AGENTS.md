## Learned User Preferences

- Target a premium, world-class, high-polish UI for residential and commercial cleaning — engaging, high-converting, and visually polished.
- Brand colors are black and gold predominantly, with white-and-gold accent sections.
- Brand display: "Natabel" on top with "Pristine Cleaning" underneath (not a single-line name).
- Use bubble/sud motifs site-wide for the cleaning theme — not stars or sparkles.
- Hero must be jet black with realistic sud-like bubbles only — no gradients, no gold orbs, and no decorative background layers behind the black.
- Bubbles should look like actual suds: white-outline, varied sizes, varied movement, reasonably dense.
- When the user supplies a logo image, use it as the primary brand mark (wordmark in nav/footer, PNG for favicons and social/schema).

## Learned Workspace Facts

- Static marketing site at `/Users/thill/ZCodeProject` for **Natabel Pristine Cleaning** (Sacramento residential and commercial cleaning; founder Fatima Patalano).
- No-build stack: plain HTML (~16 pages), single `css/styles.css`, vanilla JS from CDN — no `package.json`.
- Deploy target: GitHub Pages via `thill1/natabelcleaning` (`thill1.github.io/natabelcleaning`); production canonical URL is `natabelcleaning.com`.
- Central config lives in `js/config.js` as `window.PCC`; shared header/footer/nav in `js/partials.js`; page scaffolding in `build-pages.js`.
- Design tokens in `css/styles.css` — legacy `--emerald` aliases map to black, `--brass` to gold (e.g. `#D4AF37`, `#000000`).
- Typography: DM Serif Display + Plus Jakarta Sans; Lucide icons pinned to `0.469.0`.
- Logo assets: `assets/logo.png`, `assets/logo-wordmark.png`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`.
- Bubble system: `js/bubbles.js`, `js/bubble-render.js`; hero canvas effects in `js/hero-ambient.js`; site UI helpers in `js/ui.js`.
