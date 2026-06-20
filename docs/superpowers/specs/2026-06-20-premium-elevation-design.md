# Premium Elevation — Luxury × AI Fusion

**Date:** 2026-06-20
**Project:** Sentient Partners website
**Status:** Design approved, ready for implementation plan

---

## 1. Goal

Elevate the existing Sentient Partners site from its current "neon-tech" aesthetic to a **world-class, one-of-a-kind luxury × AI** experience that is rooted in the brand's actual DNA (extracted from the logo): a serif wordmark, deep navy, authoritative, refined — "a high-end firm that happens to do AI."

The elevation refines, not rebuilds: all currently-working features (flip cards, horizontal pinned showcase, AI assistant, booking flow, light/dark toggle, footer/social/contact) are retained and restyled into the new luxury language.

## 2. Brand DNA (from logo analysis)

- **Wordmark:** serif typeface, mixed case ("Sentient Partners"), refined
- **Primary color:** deep navy `#0A2A5E`
- **Personality:** sophisticated, professional, trustworthy, refined, authoritative
- **Lean:** classic-luxury (consultancy / high-end finance), not cyberpunk-tech

## 3. Locked Design Decisions

| Decision | Choice |
|---|---|
| Direction | **Luxury × AI fusion** (authoritative + quietly futuristic) |
| Accent metal | **Platinum / silver** (`#C7CDD6`) — precision, modern-luxury |
| Hero centerpiece | **Both** — 3D animated platinum SP monogram + elegant neural mesh behind it |
| Glow | Subtle, soft, breathing — **no neon** |
| Default theme | Dark (navy foundation) |

## 4. Visual Foundation

### Typography
- **Display headings:** Fraunces (serif) — sophisticated optical sizing, elegant curves. Matches the logo's serif wordmark energy at scale.
- **Body & UI:** Sora (clean sans) — modern, readable.
- **Mono accents:** JetBrains Mono — technical/code labels, agent names, stats. The "AI/tech" credibility cue.

### Color System

**Dark (default):**

| Token | Value | Use |
|---|---|---|
| `--navy-deep` | `#061838` | Deepest backgrounds |
| `--navy` | `#0A2A5E` | Primary foundation, hero base |
| `--navy-elevated` | `#10356B` | Elevated cards/panels |
| `--platinum` | `#C7CDD6` | Primary accent, headline emphasis |
| `--platinum-bright` | `#E8EDF2` | Hover/active, brightest text |
| `--ice` | `#B8D4E3` | Sparingly — AI/tech cues, links |
| `--text` | `#E8EDF2` | Body text on navy |
| `--text-muted` | `#9CA8BC` | Secondary text |

**Light:**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F4ED` | Warm ivory/cream foundation |
| `--bg-elevated` | `#FFFFFF` | Elevated panels |
| `--navy` | `#0A2A5E` | Text/headings |
| `--platinum` | `#9aa3b0` | Accent (deeper for contrast on light) |
| `--ice` | `#3a6f93` | Tech cues |
| `--text` | `#1a2438` | Body text |
| `--text-muted` | `#5a6578` | Secondary text |

### Motion Language
- Slow, cinematic easing (1.2s+), never bouncy
- Soft glow that *breathes* rather than flickers
- Scroll-driven reveals with depth (parallax layers, not just fade-up)
- 3D tilt on cards responding to cursor

## 5. Hero Composition

Cinematic, multi-layered, asymmetrical (editorial / high-end magazine feel):

- **Layer 4 (furthest):** soft platinum gradient glow
- **Layer 3:** elegant neural mesh (navy + ice nodes, thin luminous links, cursor-reactive)
- **Layer 2:** 3D platinum SP monogram — slow auto-rotation, light refraction, cursor-tilt camera. Positioned **center-right**.
- **Layer 1 (nearest):** content stack **left** — eyebrow pill, serif headline, body, dual CTAs, 3-stat row.

Mobile: monogram becomes a subtle background element; content stacks centered.

## 6. Page Structure (top → bottom)

1. **Hero** — 3D mark + mesh + headline + CTAs + stats
2. **Trust band** — refined monochrome platinum tech wordmarks
3. **Value proposition** — "tool vs leverage" statement
4. **Solutions** — 6 flip cards, redesigned: platinum hairline borders, glass on navy, platinum corner accents
5. **The Sentient Stack** — horizontal pinned scroll, refined (navy panels, platinum layer numbers)
6. **Founder / credibility** — narrative + live agent dashboard + industry chips
7. **Results** — stat band on elevated navy with platinum glow
8. **Why Sentient** — three pillars + senior-delivery panel
9. **Testimonial** — large serif pull-quote, editorial
10. **Final CTA** — navy + monogram mesh backdrop, platinum glow
11. **Footer** — logo, contact, social (refined platinum)

## 7. Premium Touches

- **Custom cursor** — refined platinum dot with trailing ring (optional, subtle)
- **Magnetic interactions** on all CTAs (existing, refined)
- **Cinematic section transitions** — parallax depth on entry
- **Micro-interactions** — buttons, links, cards with refined platinum hover states
- **(Optional) Loading state** — brief elegant intro where monogram assembles

## 8. Technical Approach

### Stack
- **Three.js** (CDN) — 3D platinum SP monogram
- **WebGL neural mesh** — existing `hero-canvas.js` refactored to navy/platinum/ice palette
- **GSAP + ScrollTrigger + Lenis** — retained
- **Tailwind Play CDN** — retained; bulk styling shifted to CSS custom properties
- **Fonts:** Fraunces + Sora + JetBrains Mono via Google Fonts

### 3D Monogram
- **Geometry:** abstract interlocking "SP" mark via Three.js geometry (full control over aesthetic; avoids low-res logo artifacts)
- **Material:** `MeshStandardMaterial`, metalness ~0.9, roughness ~0.25, platinum tint, 3-point lighting + environment map for reflections
- **Perf:** capped pixel ratio (max 2x), paused via IntersectionObserver offscreen, `powerPreference: 'high-performance'`
- **A11y:** respects `prefers-reduced-motion` (static pose); canvas `aria-hidden`

### Theming
- `[data-theme]` token system retained; **token values redefined** to navy/platinum
- 3D monogram and mesh **adapt to theme**
- Theme persists via `localStorage`

### Refinement of existing features
| Feature | Change |
|---|---|
| Flip cards | Platinum hairline borders, glass on navy, corner accents, refined back-face |
| Pinned showcase | Navy panels, platinum layer numbers, cinematic |
| AI assistant | Restyled in luxury palette |
| Booking page | Same flow, new tokens applied |
| Footer | Platinum social icons, refined layout |

## 9. Non-Goals

- No bloated animation libraries beyond Three.js + GSAP
- No heavy video assets
- No features that hurt load time on mid-range devices
- No discarding working features (flip cards, booking flow, AI assistant, light/dark)

## 10. Files Affected

- `index.html` — restructure hero, restyle all sections
- `book.html` — apply new tokens
- `css/styles.css` — full token redefinition + new component styles
- `js/hero-canvas.js` — refactor neural mesh to new palette
- `js/main.js` — add Three.js monogram bootstrapping, custom cursor
- **NEW** `js/three-monogram.js` — Three.js 3D SP monogram module
- Assets: retain all logos in `assets/img/`
