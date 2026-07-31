# PakOption — Design System

**Version:** 1.0 · Implementation: `src/app/globals.css` (Tailwind v4 `@theme`)

---

## 1. Design principles

1. **Dark, but not black.** The canvas is a deep desaturated green-black (`#04140E`), not `#000`. It reads as premium rather than harsh, and lets the brand green glow without vibrating.
2. **The number is the hero.** On an auction site the price, the countdown and the score are the content. They get the largest type, tabular figures, and the only use of gold.
3. **Motion has a job.** Every animation either (a) directs attention to state change, (b) communicates hierarchy on entry, or (c) makes waiting feel shorter. Decorative-only motion is cut.
4. **One accent, used sparingly.** Green = the brand and "live". Gold = money. Red = urgency. Nothing else gets colour.
5. **Density on demand.** Browse is airy; comparison and inspection reports are dense. Both are correct in context.

---

## 2. Colour

### Brand
| Token | Hex | Use |
|---|---|---|
| `--color-ink` | `#04140E` | Page background |
| `--color-ink-2` | `#071B13` | Section alternate |
| `--color-surface` | `#0A2119` | Cards, panels |
| `--color-surface-2` | `#0E2C21` | Elevated / hover |
| `--color-line` | `#17392B` | Borders, dividers |
| `--color-line-strong` | `#1F4A37` | Focused borders |
| `--color-brand-300` | `#5FE8AC` | Light accent on dark |
| `--color-brand-400` | `#2DD48A` | Hover, gradient stop |
| `--color-brand-500` | `#12B76A` | **Primary** |
| `--color-brand-600` | `#0E9558` | Pressed |
| `--color-brand-700` | `#0B6B45` | Deep gradient stop |
| `--color-gold` | `#F5B301` | Prices, bids, Certified |
| `--color-gold-soft` | `#FFD666` | Gold text on dark |
| `--color-danger` | `#E5484D` | Ending soon, outbid, errors |
| `--color-ivory` | `#F4F7F5` | Primary text |
| `--color-muted` | `#8FA69A` | Secondary text |
| `--color-muted-2` | `#5F776A` | Tertiary / disabled |

### Semantic
| Meaning | Colour |
|---|---|
| Live auction | `brand-500` + pulsing dot |
| Ending soon (< 1h) | `danger` + pulse |
| Reserve met | `brand-400` |
| Reserve not met | `muted` |
| You are leading | `brand-500` fill |
| You were outbid | `danger` outline |
| Certified | `gold` badge + shield icon |
| No reserve | `gold` outline |

### Contrast
All body text ≥ 4.5:1 against its surface. `muted` on `ink` = 5.1:1. `muted-2` is used only for ≥ 18px or non-essential text. Gold on ink = 9.8:1.

---

## 3. Typography

| Role | Font | Size / Weight | Tracking |
|---|---|---|---|
| Display | Geist Sans | `clamp(2.75rem, 7vw, 5.5rem)` / 700 | `-0.04em` |
| H1 | Geist Sans | `clamp(2rem, 4vw, 3.25rem)` / 700 | `-0.03em` |
| H2 | Geist Sans | `clamp(1.5rem, 2.5vw, 2.25rem)` / 650 | `-0.02em` |
| H3 | Geist Sans | `1.25rem` / 600 | `-0.01em` |
| Body | Geist Sans | `1rem` / 400, `1.6` leading | `0` |
| Small | Geist Sans | `0.875rem` / 400 | `0` |
| Label / eyebrow | Geist Sans | `0.75rem` / 600, uppercase | `0.14em` |
| **Price** | Geist **Mono** | `1.5–2.5rem` / 600, `tabular-nums` | `-0.02em` |
| **Countdown** | Geist **Mono** | `1.125–1.75rem` / 600, `tabular-nums` | `0` |
| VIN / chassis | Geist Mono | `0.8125rem` / 400 | `0.02em` |

**Non-negotiable:** every countdown and price uses `font-variant-numeric: tabular-nums`. Without it the digits jitter every second and the whole page feels cheap.

---

## 4. Spacing, radius, elevation

**Spacing scale** (4px base): `1 2 3 4 6 8 10 12 16 20 24 32` → 4…128px
**Section rhythm:** `py-20` mobile · `py-28` tablet · `py-32` desktop
**Container:** `max-w-[1400px]`, `px-5 / px-8 / px-12`

| Radius | Value | Use |
|---|---|---|
| `sm` | 6px | Chips, tags |
| `md` | 10px | Inputs, buttons |
| `lg` | 14px | Cards |
| `xl` | 20px | Modals, hero panels |
| `2xl` | 28px | Feature cards |
| `full` | 9999px | Pills, avatars |

**Elevation** — dark UI uses light-bleed, not drop shadow:
```
--shadow-card:  0 1px 0 0 rgb(255 255 255 / .04) inset,
                0 12px 32px -12px rgb(0 0 0 / .6);
--shadow-lift:  0 1px 0 0 rgb(255 255 255 / .07) inset,
                0 24px 56px -20px rgb(0 0 0 / .75);
--shadow-glow:  0 0 0 1px rgb(18 183 106 / .30),
                0 12px 48px -12px rgb(18 183 106 / .35);
```

---

## 5. Components

### Button
| Variant | Appearance |
|---|---|
| `primary` | Brand gradient (`brand-500 → brand-600`), ivory text, glow on hover |
| `gold` | Gold fill, ink text — reserved for **Place bid** |
| `secondary` | `surface-2` fill, `line` border |
| `outline` | Transparent, `line-strong` border |
| `ghost` | Transparent, hover `surface-2` |
| `danger` | `danger` fill |

Sizes `sm 36px · md 44px · lg 52px · xl 60px`. Every button has a `:focus-visible` ring: `2px brand-400`, `2px` offset. Loading state swaps the label for a spinner and locks the width so the layout doesn't jump.

### Auction card
```
┌──────────────────────────────────┐
│ [16:9 image, scale-105 on hover] │
│  ◉ LIVE            ♡ watch       │  ← top overlay
│  🛡 Certified                     │  ← bottom-left badge
├──────────────────────────────────┤
│ 2019 Honda Civic RS Turbo        │  h3, 2-line clamp
│ 48,000 km · Automatic · Lahore   │  muted, small
│                                  │
│ Current bid          Ends in     │
│ PKR 62,50,000        02:14:38    │  gold mono | mono
│ 23 bids · Reserve met            │  muted small
└──────────────────────────────────┘
```
Hover: `translateY(-4px)`, `shadow-lift`, image `scale(1.05)`, border → `line-strong`. Spring `{ stiffness: 300, damping: 26 }`.

### Bid panel (sticky on desktop)
Current bid (display size, gold mono) → reserve status → countdown → quick-increment chips (`+1 inc`, `+2`, `+5`) → max-bid input → buyer's premium preview → **Place bid** (gold) → binding-bid disclaimer.

### Countdown
`02d 14h 38m 12s`, mono, tabular. Under 1 hour: switches to `MM:SS`, turns `danger`, seconds pulse. Under 3 minutes: shows an `EXTENDING` chip explaining soft close. Drives from a single shared rAF loop, not one interval per card.

### Inspection score ring
SVG circle, `stroke-dasharray` animated on `useInView`. Colour by grade: A `brand-400` · B `brand-500` · C `gold` · D `danger`. Centre shows score `8.4` (mono) over `/10` and the letter grade.

---

## 6. Motion

### Tokens
```
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out-quad:cubic-bezier(0.45, 0, 0.55, 1)
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1)

--dur-instant 120ms · --dur-fast 200ms · --dur-base 320ms
--dur-slow 520ms · --dur-slower 800ms
```

### Patterns
| Pattern | Spec |
|---|---|
| Section reveal | `y: 32 → 0`, `opacity: 0 → 1`, 520ms `ease-out-expo`, triggered at 20% viewport, once |
| Stagger | 60ms between children, max 8 before the delay caps |
| Card hover | Spring `{ stiffness: 300, damping: 26 }` |
| Modal | Backdrop fade 200ms; panel `scale .96 → 1` + `y 12 → 0`, 320ms |
| Page transition | Fade + 8px rise, 240ms |
| Counter | GSAP tween to value, 1.6s `ease-out-expo`, on scroll into view |
| Marquee | Infinite CSS translate, 40s linear, pauses on hover |
| Hero | GSAP ScrollTrigger timeline, pinned 100vh, scrub 0.8 |

### Reduced motion
`<MotionProvider>` reads `prefers-reduced-motion: reduce` and exposes a context flag. When set: no transforms, no parallax, no counters (final value rendered immediately), marquees frozen, transitions reduced to a 120ms opacity fade. **Every** animated component must consume this flag.

---

## 7. Layout & breakpoints

| Breakpoint | Width | Auction grid |
|---|---|---|
| `xs` | < 640 | 1 column |
| `sm` | ≥ 640 | 2 |
| `md` | ≥ 768 | 2 |
| `lg` | ≥ 1024 | 3 |
| `xl` | ≥ 1280 | 3 + filter rail |
| `2xl` | ≥ 1536 | 4 + filter rail |

Mobile: filters become a bottom sheet; the bid panel becomes a fixed bottom bar showing current bid + a **Bid** button that opens the sheet.

---

## 8. Iconography & imagery

- **lucide-react**, 24px default, `1.75` stroke, `currentColor`. Named imports only — never `import * as icons`.
- Vehicle photos: 16:9 in grids, 4:3 in the lightbox. Always `next/image` with `sizes`. Blurhash placeholder.
- No stock-photo people. Real cars, real inspection bays.
- Gradient meshes are used behind the hero and CTA only, at ≤ 18% opacity, and are pure CSS (no image weight).

---

## 9. Accessibility checklist

- [ ] All interactive elements reachable and operable by keyboard
- [ ] Visible `:focus-visible` ring on every control
- [ ] Countdown state conveyed by text + icon, not colour alone
- [ ] `aria-live="polite"` on the current bid; `assertive` on outbid
- [ ] Modals trap focus and restore it on close
- [ ] Images have descriptive alt text (`2019 Honda Civic RS Turbo, front three-quarter`)
- [ ] Forms: label, description, and `aria-invalid` + `aria-describedby` on error
- [ ] Colour contrast ≥ 4.5:1 for body, ≥ 3:1 for large text and UI borders
- [ ] `prefers-reduced-motion` honoured everywhere
- [ ] Skip-to-content link as the first focusable element
