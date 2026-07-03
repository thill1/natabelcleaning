## Learned User Preferences

- Target a premium, world-class, high-polish UI for residential and commercial cleaning — engaging, high-converting, and visually polished.
- Brand colors are black and gold predominantly, with white-and-gold accent sections. Gold is a champagne ramp (`--brass-bright: #E3C878`, `--brass: #C6A14A`, `--brass-deep: #8F6E1F`); gold CTAs use dark text (`--on-brass`).
- Brand name is **NataBel** (capital B) Pristine Cleaning; brand display: "NataBel" on top with "Pristine Cleaning" underneath (not a single-line name).
- Use bubble/sud motifs site-wide for the cleaning theme — not stars or sparkles.
- Hero must be jet black with realistic sud-like bubbles only — no gradients, no gold orbs, and no decorative background layers behind the black.
- Bubbles should look like actual suds: white-outline with faint thin-film iridescence, varied sizes, varied movement, reasonably dense. Hero suds are interactive (pointer repulsion, click-to-pop).
- When the user supplies a logo image, use it as the primary brand mark (wordmark in nav/footer, PNG for favicons and social/schema).
- **No fabricated social proof.** Ratings/review counts stay `null` in `PCC.reviews` until real Google reviews exist; the UI hides star elements while null. Trust is communicated via written promises (founder-inspected, licensed/insured, 24-hour Pristine Guarantee).

## Learned Workspace Facts

- Static marketing site for **NataBel Pristine Cleaning** — a new (2026) residential and commercial cleaning company based in **Rocklin, CA** (Placer County); founder **Fatima Patalano**, a client of Sentient Partners. Service area leads Placer-first: Rocklin, Roseville, Granite Bay, Loomis, Lincoln, Penryn, Newcastle, Auburn, then Folsom/Sacramento-side communities.
- No-build stack: plain HTML (~16 pages), single `css/styles.css`, vanilla JS from CDN — no `package.json`.
- Deploy target: Vercel via `thill1/natabelcleaning`; production canonical URL is `natabelpristinecleaning.com`.
- Central config lives in `js/config.js` as `window.PCC`; shared header/footer/nav in `js/partials.js`; page scaffolding in `build-pages.js`. `PCC.pricing` holds optional "From $X" plan anchors (hidden until set); `PCC.trust` holds the guarantee copy and promise tiles.
- Design tokens in `css/styles.css` — primary tokens are `--noir*` (black ramp) with legacy `--emerald*` aliases kept for older markup; `--brass*` is the champagne gold ramp.
- Typography: **Fraunces variable** (display; opsz auto, SOFT axis raised at display sizes, signature/quote styles use SOFT 60–100 + WONK) + Plus Jakarta Sans (UI, tabular-nums for stats). No mono font. Lucide icons pinned to `0.469.0`.
- Motion: GSAP **3.13** (SplitText free) from jsdelivr. Hero/page-hero h1s use SplitText line-mask reveals (fonts.ready-gated, CSS fallback). Signature "squeegee reveal" (clip-path wipe + champagne shine) applies to `.ba-slider`, `.page-hero-media`, `.founder-media` via `motion.js`. All effects disabled under `prefers-reduced-motion`. Every page adds `js-ready` to `<html>` before `config.js`.
- Bubble system: `js/bubbles.js`, `js/bubble-render.js` (iridescent rim arcs); hero canvas effects + interactivity in `js/hero-ambient.js`; site UI helpers in `js/ui.js` (rating fillOrHide, price anchors, promo bar).
- Logo assets: `assets/logo.png`, `assets/logo-wordmark.png`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`.
- Pre-launch TODOs for real data: business phone `(949) 246-2176`, license number (`Lic# pending`), Fatima's real portrait for the homepage founder section (Unsplash placeholder now), `PCC.leads.endpoint` (leads are in demo mode), and `PCC.pricing` anchors.
