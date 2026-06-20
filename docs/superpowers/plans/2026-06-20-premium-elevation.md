# Premium Elevation — Luxury × AI Fusion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the Sentient Partners site from "neon-tech" to a world-class luxury × AI experience rooted in the brand's actual DNA (serif wordmark, deep navy `#0A2A5E`, platinum accent), featuring a 3D animated platinum SP monogram hero centerpiece.

**Architecture:** Refine-don't-rebuild. Redefine CSS custom-property tokens to navy/platinum (both themes retained), refactor the existing neural-mesh canvas to the new palette, add a new Three.js 3D monogram module, restructure the hero to an asymmetrical editorial layout, and restyle every existing section/feature (flip cards, pinned showcase, AI assistant, booking page, footer) into the luxury language via the new tokens.

**Tech Stack:** Three.js (3D monogram), existing Canvas2D neural mesh, GSAP + ScrollTrigger + Lenis, Tailwind Play CDN + CSS custom properties, Google Fonts (Fraunces + Sora + JetBrains Mono). No build step.

**Design spec:** `docs/superpowers/specs/2026-06-20-premium-elevation-design.md`

**Project context (verified file state):**
- `index.html` (738 lines), `book.html` (261 lines)
- `css/styles.css` (551 lines) — current `[data-theme]` token system already exists (will redefine values)
- `js/hero-canvas.js` (269 lines) — `window.NeuralField.create(selector, opts)` factory
- `js/main.js` (273 lines) — Lenis, GSAP, reveals, counters, magnetic, neural-field bootstrap
- `js/ai-assistant.js`, `js/booking.js` — self-contained, only need token-driven restyle (no JS edits)
- Canvas ids: `#neural-canvas`, `#cta-canvas`
- All assets in `assets/img/`; dev server runs on port 8765

**Verification model:** This is a visual/CSS/3D project. Each task verifies via (a) `node --check` on JS, (b) HTTP 200 on the dev server, (c) explicit manual visual checkpoint in the browser. No unit tests.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `css/styles.css` | Modify (full token redefinition) | Navy/platinum tokens, typography, all component styles |
| `js/hero-canvas.js` | Modify (palette only) | Neural mesh repainted to navy/platinum/ice |
| `js/three-monogram.js` | **Create** | Three.js 3D platinum SP monogram, self-contained module |
| `js/main.js` | Modify (bootstrap monogram + custom cursor) | Wire new effects into existing init flow |
| `index.html` | Modify (hero restructure + section restyle + scripts) | New hero layout, token-driven section markup |
| `book.html` | Modify (tokens only) | Same booking flow, luxury palette |

---

## Task 1: Redefine CSS Token System (navy/platinum)

**Files:**
- Modify: `css/styles.css` (replace `:root`/`[data-theme]` blocks, lines ~8-55)

This task changes the visual foundation of the entire site. Do it first so everything that follows renders in the new palette.

- [ ] **Step 1: Replace the dark theme token block**

In `css/styles.css`, find the block starting `:root,` / `[data-theme="dark"] {` and replace its entire body (up to the closing `}` before `color-scheme: dark;` final brace) with these exact values:

```css
:root,
[data-theme="dark"] {
  --navy-deep:    #061838;
  --navy:         #0A2A5E;
  --navy-elevated:#10356B;

  --bg:           var(--navy-deep);
  --bg-elevated:  var(--navy);
  --bg-glass:     rgba(199, 205, 214, 0.05);
  --bg-glass-2:   rgba(199, 205, 214, 0.02);

  --border:        rgba(199, 205, 214, 0.12);
  --border-strong: rgba(199, 205, 214, 0.22);

  --platinum:        #C7CDD6;
  --platinum-bright: #E8EDF2;
  --ice:             #B8D4E3;

  --text:        var(--platinum-bright);
  --text-muted:  #9CA8BC;
  --text-faint:  #6B7A93;
  --heading:     #F2F5F9;

  --cyan:    var(--ice);       /* alias so existing refs still work */
  --violet:  var(--platinum);  /* alias existing violet refs → platinum */
  --fuchsia: var(--platinum-bright);

  --nav-bg:        rgba(6, 24, 56, 0.72);
  --nav-bg-scroll: rgba(6, 24, 56, 0.92);
  --grid-line:     rgba(199, 205, 214, 0.06);
  --vignette:      rgba(6, 24, 56, 0.85);

  --accent-grad: linear-gradient(110deg, #E8EDF2 0%, #C7CDD6 45%, #B8D4E3 100%);
  --accent-soft: linear-gradient(135deg, rgba(199,205,214,0.15), rgba(184,212,227,0.08));

  --shadow-card: 0 24px 60px -20px rgba(0, 0, 0, 0.55);
  --shadow-glow: 0 0 50px -10px rgba(199, 205, 214, 0.28);
  color-scheme: dark;
}
```

- [ ] **Step 2: Replace the light theme token block**

Find `[data-theme="light"] {` and replace its body with:

```css
[data-theme="light"] {
  --navy-deep:    #F7F4ED;
  --navy:         #FFFFFF;
  --navy-elevated:#FFFFFF;

  --bg:           #F7F4ED;
  --bg-elevated:  #FFFFFF;
  --bg-glass:     rgba(10, 42, 94, 0.04);
  --bg-glass-2:   rgba(10, 42, 94, 0.015);

  --border:        rgba(10, 42, 94, 0.12);
  --border-strong: rgba(10, 42, 94, 0.22);

  --platinum:        #5a6578;
  --platinum-bright: #1a2438;
  --ice:             #3a6f93;

  --text:        #1a2438;
  --text-muted:  #5a6578;
  --text-faint:  #8a93a5;
  --heading:     #0A2A5E;

  --cyan:    var(--ice);
  --violet:  var(--platinum);
  --fuchsia: var(--platinum-bright);

  --nav-bg:        rgba(247, 244, 237, 0.78);
  --nav-bg-scroll: rgba(255, 255, 255, 0.94);
  --grid-line:     rgba(10, 42, 94, 0.05);
  --vignette:      rgba(247, 244, 237, 0.7);

  --accent-grad: linear-gradient(110deg, #0A2A5E 0%, #3a6f93 60%, #5a6578 100%);
  --accent-soft: linear-gradient(135deg, rgba(10,42,94,0.08), rgba(58,111,147,0.04));

  --shadow-card: 0 24px 60px -24px rgba(10, 23, 42, 0.16);
  --shadow-glow: 0 0 40px -8px rgba(10, 42, 94, 0.22);
  color-scheme: light;
}
```

- [ ] **Step 3: Update the `.orb` background values to platinum/ice**

In `css/styles.css`, find the `.orb-1`, `.orb-2`, `.orb-3` rules and replace the `background:` color values:
- `.orb-1`: `rgba(199, 205, 214, 0.10)` (platinum)
- `.orb-2`: `rgba(184, 212, 227, 0.10)` (ice)
- `.orb-3`: `rgba(199, 205, 214, 0.06)` (platinum, dimmer)
- Delete the `[data-theme="light"] .orb-*` override lines (the aliasing handles it) OR set them to `rgba(10, 42, 94, 0.06)`.

- [ ] **Step 4: Verify — load dark + light themes**

```bash
# restart dev server
cd /Users/thill/ZCodeProject && lsof -ti tcp:8765 2>/dev/null | xargs kill -9 2>/dev/null; sleep 1; python3 -m http.server 8765 >/dev/null 2>&1 &
```

Open `http://localhost:8765`. **Visual checkpoint:** page background is now deep navy (not near-black), accents are silver/platinum (not neon cyan/violet). Toggle theme via nav icon → light mode should be warm ivory with navy text. If any section still shows neon color, it has a hardcoded color (fix in Task 6).

---

## Task 2: Typography (Fraunces serif + Sora + JetBrains Mono)

**Files:**
- Modify: `index.html` (font link, tailwind config, wordmark classes)
- Modify: `book.html` (font link, tailwind config)

- [ ] **Step 1: Swap Google Fonts link in `index.html`**

Replace the existing `<link href="https://fonts.googleapis.com/css2...">` with:

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: Update Tailwind font config in `index.html`**

Replace the `tailwind.config` `fontFamily` block:

```js
fontFamily: {
  serif: ['Fraunces', 'Georgia', 'serif'],
  sans: ['Sora', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
},
```

- [ ] **Step 3: Do the same two edits in `book.html`**

Same font `<link>` swap + same Tailwind config in `book.html`.

- [ ] **Step 4: Convert `font-display` → `font-serif` for all display headings**

In both `index.html` and `book.html`, the existing code uses `font-display` (Space Grotesk). The new serif is Fraunces. Do a careful find/replace: change class token `font-display` → `font-serif` ONLY on headings (`<h1>`, `<h2>`, `<h3>`, wordmark `<span>`). Leave `font-mono` and `font-sans` untouched.

**Implementation note:** Safest approach — replace ALL occurrences of `font-display` with `font-serif` in both files (every current `font-display` usage is a heading or wordmark, which should be serif). Verify with: `grep -c 'font-display' index.html book.html` → should print `0` for each after.

- [ ] **Step 5: Verify — fonts load**

Refresh `http://localhost:8765`. **Visual checkpoint:** "Sentient Partners" wordmark and all headings are now an elegant serif (Fraunces) instead of geometric sans. Body text remains Sora. Run: `grep -c 'font-display' index.html book.html` → expect `0 0`.

---

## Task 3: Refactor Neural Mesh to Navy/Platinum Palette

**Files:**
- Modify: `js/hero-canvas.js` (the `DEFAULTS.colors` object and the `pickColor` logic)

- [ ] **Step 1: Replace the `DEFAULTS.colors` block**

In `js/hero-canvas.js`, find the `colors:` object inside `DEFAULTS` and replace with:

```js
    colors: {
      platinum: { r: 199, g: 205, b: 214 },
      platinumBright: { r: 232, g: 237, b: 242 },
      ice:      { r: 184, g: 212, b: 227 },
      navy:     { r: 110, g: 150, b: 200 },   // luminous navy node
    },
```

- [ ] **Step 2: Replace the `pickColor` function**

```js
  function pickColor(cfg) {
    const r = Math.random();
    if (r < 0.45) return cfg.colors.platinum;
    if (r < 0.75) return cfg.colors.ice;
    if (r < 0.92) return cfg.colors.platinumBright;
    return cfg.colors.navy;
  }
```

- [ ] **Step 3: Soften the link line width and alpha**

In the `drawLinks` function, change the connection alpha multiplier from `* 0.35` to `* 0.22` (line: `const alpha = (1 - d / max) * 0.35;`) and `ctx.lineWidth = 0.7;` → `ctx.lineWidth = 0.5;`. This gives thinner, more luminous/elegant lines.

- [ ] **Step 4: Update the cursor-glow gradient in `drawCursorGlow`**

Replace the existing gradient color stops with platinum/ice:

```js
      grad.addColorStop(0, 'rgba(199,205,214,0.10)');
      grad.addColorStop(0.5, 'rgba(184,212,227,0.05)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
```

- [ ] **Step 5: Update `main.js` neural-field bootstrap colors**

In `js/main.js`, the CTA-canvas `NeuralField.create` call passes a `colors:` override with cyan/violet/fuchsia keys. Replace that `colors:` object with the new keys:

```js
        colors: {
          platinum:       { r: 199, g: 205, b: 214 },
          platinumBright: { r: 232, g: 237, b: 242 },
          ice:            { r: 184, g: 212, b: 227 },
          navy:           { r: 110, g: 150, b: 200 },
        },
```

- [ ] **Step 6: Verify**

```bash
cd /Users/thill/ZCodeProject && node --check js/hero-canvas.js && echo "hero-canvas OK"
```

Refresh `http://localhost:8765`. **Visual checkpoint:** hero + CTA particle fields are now silver/platinum/ice on navy (no cyan/violet/fuchsia). Lines are thinner and more elegant.

---

## Task 4: Create Three.js 3D Platinum Monogram Module

**Files:**
- Create: `js/three-monogram.js`

A self-contained module that renders an abstract interlocking "SP" mark in luminous platinum, slow auto-rotating, cursor-tilt camera, respects reduced-motion, pauses offscreen.

- [ ] **Step 1: Create `js/three-monogram.js`**

```js
/* =========================================================
   Sentient Partners — 3D Platinum SP Monogram (Three.js)
   Self-contained. Exposes window.SPMonogram.create(selector, opts).
   - Abstract interlocking S+P torus knot forms in metallic platinum
   - Slow auto-rotation + cursor-tilt camera
   - prefers-reduced-motion → static pose
   - IntersectionObserver pause when offscreen
   ========================================================= */
(function () {
  'use strict';
  if (!window.THREE) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function create(selector, opts) {
    opts = opts || {};
    const mount = document.querySelector(selector);
    if (!mount) return null;

    let W = mount.clientWidth, H = mount.clientHeight;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0, 7);

    // ---- Lighting (3-point + environment-ish) ----
    scene.add(new THREE.AmbientLight(0x6677aa, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 5, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0xb8d4e3, 1.4);
    rim.position.set(-6, -2, -4); scene.add(rim);
    const fill = new THREE.PointLight(0xc7cdd6, 1.0, 30);
    fill.position.set(0, -4, 4); scene.add(fill);

    // ---- Platinum material ----
    const mat = new THREE.MeshStandardMaterial({
      color: 0xc7cdd6, metalness: 0.92, roughness: 0.22,
      envMapIntensity: 1.0,
    });

    // ---- Abstract interlocking "S" + "P" forms ----
    // S: a torus knot that evokes the curve of an S
    const sGeo = new THREE.TorusKnotGeometry(1.25, 0.34, 180, 24, 2, 3);
    const sMesh = new THREE.Mesh(sGeo, mat);
    sMesh.position.x = -0.9;
    // P: a torus (the loop) + a cylinder (the stem) grouped, offset right
    const pGroup = new THREE.Group();
    const pLoop = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.3, 28, 60), mat);
    pLoop.position.set(0.85, 0.45, 0);
    const pStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.9, 28), mat
    );
    pStem.position.set(0.85, -0.5, 0);
    pGroup.add(pLoop, pStem);
    pGroup.position.x = 1.5;

    const group = new THREE.Group();
    group.add(sMesh, pGroup);
    group.scale.setScalar(opts.scale || 0.95);
    scene.add(group);

    // soft inner glow plane behind
    const glowGeo = new THREE.CircleGeometry(3.2, 48);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xb8d4e3, transparent: true, opacity: 0.06, side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -2;
    scene.add(glow);

    // ---- Interaction ----
    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
    function onMove(e) {
      const r = mount.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      targetRY = nx * 0.5;
      targetRX = -ny * 0.3;
    }
    window.addEventListener('mousemove', onMove, { passive: true });

    // ---- Resize ----
    function resize() {
      W = mount.clientWidth; H = mount.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize, { passive: true });

    // ---- Loop ----
    let running = false, rafId = null, t = 0;
    function frame() {
      if (!running) return;
      t += 0.005;
      if (!reduced) {
        group.rotation.y += 0.004;
        group.rotation.x = Math.sin(t * 0.5) * 0.08;
        curRX += (targetRX - curRX) * 0.06;
        curRY += (targetRY - curRY) * 0.06;
        camera.position.x = curRY * 1.2;
        camera.position.y = curRX * 1.2;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; rafId = requestAnimationFrame(frame); }
    function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }

    if (reduced) renderer.render(scene, camera);
    else {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => e.isIntersecting ? start() : stop());
      }, { threshold: 0.05 });
      io.observe(mount);
    }
    return { start, stop, resize };
  }

  window.SPMonogram = { create };
})();
```

- [ ] **Step 2: Verify syntax**

```bash
cd /Users/thill/ZCodeProject && node --check js/three-monogram.js && echo "three-monogram OK"
```

Expected: `three-monogram OK`

- [ ] **Step 3: Add Three.js CDN + module script to `index.html`**

Before `</body>` in `index.html`, add (after the existing GSAP/Lenis script tags, before `js/hero-canvas.js`):

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.min.js"></script>
```

And after the `js/ai-assistant.js` line, add:

```html
<script src="js/three-monogram.js"></script>
```

- [ ] **Step 4: Verify Three.js loads (no render yet — wired in Task 5/9)**

Refresh `http://localhost:8765`. Open DevTools Console — confirm **no errors** and `THREE` is defined (type `THREE` in console → should return an object, not undefined).

---

## Task 5: Restructure Hero to Asymmetrical Editorial Layout

**Files:**
- Modify: `index.html` (the `<section>` containing `#neural-canvas`)

- [ ] **Step 1: Add the 3D monogram mount layer to the hero**

Inside the hero `<section>`, immediately after the `<canvas id="neural-canvas" ...></canvas>` line, add a dedicated mount div for the 3D monogram positioned center-right:

```html
<!-- 3D platinum monogram (center-right) -->
<div id="monogram-mount" aria-hidden="true" class="absolute inset-y-0 right-0 w-1/2 hidden md:block" style="z-index:5; pointer-events:none;"></div>
```

- [ ] **Step 2: Adjust the hero content wrapper to left-biased width**

Find the hero content `<div class="relative z-10 mx-auto flex min-h-screen max-w-7xl ...">`. Change the inner `<div class="max-w-4xl">` to `max-w-2xl` so content stays left and doesn't overlap the right-side monogram:

```html
<div class="max-w-2xl">
```

- [ ] **Step 3: Verify layout**

```bash
cd /Users/thill/ZCodeProject && lsof -ti tcp:8765 2>/dev/null | xargs kill -9 2>/dev/null; sleep 1; python3 -m http.server 8765 >/dev/null 2>&1 &
```

Refresh. **Visual checkpoint (desktop):** hero content sits left, right half is open space reserved for the monogram. Mobile: `hidden md:block` hides the mount, content centers (max-w-2xl still reads fine). The monogram itself won't render until Task 9 wiring — that's expected here.

---

## Task 6: Restyle All Sections with New Tokens

**Files:**
- Modify: `index.html` (audit + replace any hardcoded neon colors)

The token system (Task 1) auto-cascades to most elements via `var(--*)`. This task removes hardcoded color holdouts so nothing renders neon.

- [ ] **Step 1: Find hardcoded neon colors**

```bash
cd /Users/thill/ZCodeProject
grep -noE 'rgba?\([0-9]+, *[0-9]+, *[0-9]+[^)]*\)' index.html | grep -iE '56, ?189|189, ?248|167, ?139|139, ?250|232, ?121|121, ?249|22d3ee|67e8f9|f0abfc' | head -40
grep -noE '#(22d3ee|67e8f9|a78bfa|e879f9|f0abfc|38bdf8)' index.html | head -20
```

These reveal inline hardcoded cyan/violet/fuchsia values (e.g. `bg-cyan-400`, the ping dots, card icon backgrounds).

- [ ] **Step 2: Replace card-icon neon backgrounds with platinum/ice**

For each `.flip-icon` inline `style` using `rgba(56,189,248,...)`, `rgba(167,139,250,...)`, `rgba(232,121,249,...)`, replace with platinum/ice equivalents and keep the per-card differentiation via opacity only:

- `rgba(56,189,248,...)` (cyan icons) → `rgba(184,212,227,...)` (ice)
- `rgba(167,139,250,...)` (violet icons) → `rgba(199,205,214,...)` (platinum)
- `rgba(232,121,249,...)` (fuchsia icons) → `rgba(232,237,242,...)` (platinum-bright)

Same substitution for the `box-shadow: inset 0 0 0 1px ...` borders in those same elements.

- [ ] **Step 3: Replace the agent-panel status colors**

In the "Why Sentient" / dashboard mockups, the mono labels use `color: var(--cyan)` / `var(--violet)` / `var(--fuchsia)`. Since these are aliased to ice/platinum/platinum-bright in Task 1, they auto-update — **verify** no hardcoded `#` hex remains for them. The `bg-red-400/70` / `bg-yellow-400/70` / `bg-green-400/70` "traffic light" dots in the window-chrome mockup can stay (they're a deliberate UI metaphor) OR be muted to `bg-platinum/40`. Leave them — they read as a realistic window.

- [ ] **Step 4: Tint the "active" ping/green dots to ice**

The `bg-cyan-400` ping dots (announcement pill, CTA pill) and `text-cyan-300`/`bg-green-400` live-status dots: replace `bg-cyan-400` → inline `style="background: var(--ice)"`, `text-cyan-300` → `style="color: var(--ice)"`. Keep the green "active" status dots as green (semantic = "online").

- [ ] **Step 5: Verify**

Refresh `http://localhost:8765`. **Visual checkpoint:** scan the whole page top-to-bottom in dark mode — **no neon cyan/violet/fuchsia anywhere** except the green "online" status dots (intentional). Every accent is silver/platinum/ice on navy. Re-run the grep from Step 1 — the icon-background matches should be gone.

---

## Task 7: Premium Touches — Custom Cursor + Refined Micro-interactions

**Files:**
- Modify: `css/styles.css` (add cursor styles)
- Modify: `js/main.js` (add cursor logic)
- Modify: `index.html` (add cursor elements)

- [ ] **Step 1: Add custom-cursor elements to `index.html`**

Right after `<body ...>`, add:

```html
<div id="cursor-dot" class="cursor-dot"></div>
<div id="cursor-ring" class="cursor-ring"></div>
```

- [ ] **Step 2: Add cursor CSS to `css/styles.css`**

```css
/* ---------- Custom cursor ---------- */
.cursor-dot, .cursor-ring {
  position: fixed; top: 0; left: 0; pointer-events: none; z-index: 90;
  border-radius: 9999px; mix-blend-mode: difference;
  transform: translate(-50%, -50%);
}
.cursor-dot { width: 6px; height: 6px; background: #E8EDF2; transition: transform 0.1s; }
.cursor-ring {
  width: 32px; height: 32px; border: 1px solid rgba(199,205,214,0.5);
  transition: transform 0.25s cubic-bezier(0.2,0.8,0.2,1), width 0.25s, height 0.25s, border-color 0.25s;
}
.cursor-ring.hovering { width: 56px; height: 56px; border-color: var(--platinum-bright); }
/* hide on touch devices */
@media (hover: none) { .cursor-dot, .cursor-ring { display: none; } }
@media (prefers-reduced-motion: reduce) { .cursor-dot, .cursor-ring { display: none; } }
/* keep native cursor hidden on devices that support hover */
@media (hover: hover) and (pointer: fine) {
  body { cursor: none; }
  a, button, input, textarea, select, [role="button"] { cursor: none; }
}
```

- [ ] **Step 3: Add cursor logic to `js/main.js`**

Add this block inside the IIFE, before the `/* ---------- Neural fields ---------- */` section:

```js
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
```

- [ ] **Step 4: Verify**

```bash
cd /Users/thill/ZCodeProject && node --check js/main.js && echo "main.js OK"
```

Refresh on desktop. **Visual checkpoint:** a platinum dot follows the cursor instantly, a ring trails with smooth lag; hovering links/buttons/cards grows the ring. Touch devices: no custom cursor, native cursor intact.

---

## Task 8: Apply Tokens to Booking Page

**Files:**
- Modify: `book.html` (already got fonts in Task 2; verify token cascade)

- [ ] **Step 1: Audit book.html for hardcoded neon**

```bash
cd /Users/thill/ZCodeProject
grep -noE '#(22d3ee|67e8f9|a78bfa|e879f9|f0abfc|38bdf8)' book.html | head
grep -noE 'rgba?\([0-9]+, *[0-9]+, *[0-9]+[^)]*\)' book.html | grep -iE '56, ?189|167, ?139|232, ?121' | head
```

- [ ] **Step 2: Replace any matches**

Apply the same substitution rules as Task 6 Step 2 (cyan→ice, violet/fuchsia→platinum/platinum-bright) to any inline styles in `book.html`. The `bg-cyan-400` ping dots in book.html → `style="background: var(--ice)"`.

- [ ] **Step 3: Verify booking page renders in luxury palette**

Open `http://localhost:8765/book.html`. **Visual checkpoint:** booking page is navy with platinum/ice accents, Fraunces serif headings. Walk the full 4-step flow (select topic → pick date/slot → fill name+email → confirm) to ensure nothing broke.

---

## Task 9: Wire 3D Monogram + Final Verification

**Files:**
- Modify: `js/main.js` (bootstrap the monogram)
- Verify: all files

- [ ] **Step 1: Bootstrap the monogram in `js/main.js`**

Inside the `try { if (window.NeuralField) {...} }` neural-fields block in `main.js`, after the CTA neural field create call (still inside the try), add:

```js
    // 3D platinum monogram (hero center-right)
    if (window.SPMonogram) {
      window.SPMonogram.create('#monogram-mount', { scale: 0.95 });
    }
```

- [ ] **Step 2: Verify all JS syntax**

```bash
cd /Users/thill/ZCodeProject
for f in js/main.js js/hero-canvas.js js/three-monogram.js js/ai-assistant.js js/booking.js; do
  node --check "$f" && echo "OK $f"
done
```

Expected: all five print `OK`.

- [ ] **Step 3: Verify all routes serve**

```bash
cd /Users/thill/ZCodeProject && lsof -ti tcp:8765 2>/dev/null | xargs kill -9 2>/dev/null; sleep 1; python3 -m http.server 8765 >/dev/null 2>&1 &
sleep 1.5
python3 -c "
import urllib.request
for p in ['/','/book.html','/css/styles.css','/js/main.js','/js/hero-canvas.js','/js/three-monogram.js','/js/ai-assistant.js','/js/booking.js']:
    print(urllib.request.urlopen('http://localhost:8765'+p).status, p)
"
```

Expected: all `200`.

- [ ] **Step 4: Full visual verification — dark mode**

Open `http://localhost:8765`. **Visual checkpoints:**
1. Hero: 3D platinum SP monogram rotates slowly on the right, neural mesh behind in silver/ice on navy, content left. Move cursor → monogram tilts, mesh reacts.
2. Scroll: smooth (Lenis), platinum scroll-progress bar.
3. Solutions: 6 flip cards, platinum hairline borders, hover-flips work, back-face CTAs intact.
4. Pinned showcase: horizontal scroll, navy panels, platinum layer numbers.
5. AI assistant: bottom-right FAB, opens, chat works, voice mic shows if supported.
6. Custom cursor: dot + trailing ring throughout.
7. Footer: social icons, phone `(415) 504-2757`, email link.
8. DevTools Console: **no red errors**.

- [ ] **Step 5: Full visual verification — light mode**

Click theme toggle (nav sun/moon). **Visual checkpoints:**
1. Background → warm ivory `#F7F4ED`, text → navy.
2. 3D monogram still visible (platinum on ivory — may want to confirm it's not washed out; if so, darken material color in light mode via a theme check — see Step 6).
3. All sections readable with good contrast.
4. Booking page (`/book.html`) also respects theme.

- [ ] **Step 6: (Conditional) Monogram visibility in light mode**

If the monogram is hard to see on ivory in light mode, add a theme-aware tweak in `three-monogram.js` — read the theme and adjust material color/roughness:

```js
    // after mat is created:
    function applyTheme() {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      mat.color.setHex(light ? 0x8a93a5 : 0xc7cdd6);
      mat.roughness = light ? 0.35 : 0.22;
    }
    applyTheme();
    // observe theme changes
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
```

Only apply if Step 5 shows a visibility problem.

- [ ] **Step 7: Commit**

```bash
cd /Users/thill/ZCodeProject
git add -A
git commit -m "feat: premium luxury×AI elevation — navy/platinum palette, 3D SP monogram hero, serif typography, custom cursor

- Redefine CSS tokens to navy #0A2A5E + platinum #C7CDD6 (both themes)
- Fraunces serif display + Sora body + JetBrains Mono
- New Three.js 3D platinum SP monogram (js/three-monogram.js)
- Refactor neural mesh to platinum/ice palette
- Restructure hero to asymmetrical editorial layout
- Custom platinum cursor (dot + trailing ring)
- Restyle all sections, flip cards, pinned showcase, AI assistant, booking, footer"
```

---

## Self-Review Notes

**Spec coverage:**
- §2 Brand DNA (serif, navy) → Tasks 1, 2 ✓
- §3 Locked decisions (navy/platinum, 3D monogram + mesh, no neon) → Tasks 1, 3, 4, 5, 6 ✓
- §4 Typography (Fraunces/Sora/Mono) → Task 2 ✓
- §4 Color system (dark + light tables) → Task 1 ✓
- §4 Motion language (cinematic, reduced-motion) → Task 4 (reduced-motion guard), Task 7 (cursor reduced-motion guard) ✓
- §5 Hero composition (4-layer, asymmetrical, monogram right/content left) → Tasks 4, 5 ✓
- §6 Page structure (11 sections) → already exist; restyled in Task 6 ✓
- §7 Premium touches (custom cursor, magnetic already exists) → Task 7 ✓
- §8 Tech approach (Three.js, mesh refactor, theming, feature refinement) → Tasks 3, 4, 8, 9 ✓
- §9 Non-goals respected (no new heavy libs beyond Three.js; no discarded features) ✓

**Placeholder scan:** none — every step has exact values/code/commands.

**Type/identifier consistency:** `SPMonogram.create('#monogram-mount', {scale})` matches the mount id `monogram-mount` added in Task 5; `NeuralField` factory unchanged; token names (`--navy`, `--platinum`, `--ice`) consistent across CSS and inline styles.

**Ambiguity:** Task 6/8 use "substitution rules" rather than per-line diffs because there are many small inline styles — the rules are explicit and verifiable by re-running the grep. This is the most reliable approach for bulk color replacement.
