# Vessante — Aesthetic Institute

A concept web demo for a premium aesthetic & dermatology clinic. Ivory/champagne
art direction, WebGL hero, live-rendered 3D product viewer, and a multi-step
booking flow.

> Fictional clinic. All copy, figures and imagery are invented for the demo.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Palette

Bright, warm, and deliberately not white. Ivory rather than `#FFF` gives the
champagne and blush accents something to sit against.

| Token | Value | Role |
| --- | --- | --- |
| `canvas` | `#FBF8F4` | Page ground (`canvas-warm` `#F5EEE5` for banded sections) |
| `surface` | `#FFFFFF` | Cards, drawers |
| `ink` | `#1F1A17` | Headings and primary fills — warm near-black, never `#000` |
| `ink-soft` / `ink-muted` | `#5B524B` / `#7A6F66` | Body and meta |
| `champagne` | `#C9A227` | Borders, rules, decorative fills |
| `champagne-deep` | `#8A6D14` | The only gold that clears 4.5:1 on ivory — use for gold *text* |
| `blush` | `#F5E4E2` | Tints, the hero silk |
| `sage` | `#8FA79B` | Secondary accent |

The primary CTA is ink, not gold: a champagne fill cannot hold ivory text at an
accessible contrast, so weight comes from darkness rather than colour.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19, TypeScript |
| Styling | Tailwind CSS 3, custom glassmorphism layer in `globals.css` |
| Animation | Framer Motion 12 |
| Smooth scroll | Lenis |
| 3D | React Three Fiber 9 + drei 10 + Three.js |
| Primitives | Radix (Dialog, Accordion) |
| Icons | lucide-react |

Next 15 rather than 14: the whole 14.x line carries unpatched advisories. Three
transitive ones remain (`postcss`, `sharp`, both inside Next's own tree) that
only clear on Next 16 — build-time and image-optimizer surfaces, neither reached
by this demo.

## Layout

```
src/
├─ app/
│  ├─ layout.tsx              fonts, providers, custom cursor
│  ├─ page.tsx                section composition
│  └─ globals.css             design tokens, .glass, .mask-line
├─ components/
│  ├─ HeroCanvas.tsx          R3F hero: silk shader, cell field, nucleus
│  ├─ TreatmentGrid.tsx       filterable cards, tilt + video preview
│  ├─ Product3DViewer.tsx     lathed glass bottle, drag-to-spin
│  ├─ BookingDrawer.tsx       3-step glass drawer + confirmation
│  ├─ canvas/shaders.ts       GLSL (simplex noise, silk, cell sprites)
│  ├─ sections/               Nav, Hero, Marquee, BeforeAfter, Boutique,
│  │                          Reels, Faq, CartDrawer, Footer
│  ├─ providers/              Lenis provider + scroll lock
│  └─ ui/                     Cursor, MagneticButton, SectionHeading,
│                             ProceduralSkin
└─ lib/                       data, motion variants, cart/booking store, utils
```

## Notes on the pieces that aren't obvious

**Hero shader.** A displaced plane lit with a two-light Blinn-Phong model.
Normals come from finite differences of the height field in the vertex shader —
elevation alone gives no shading cue and the surface reads as fog. Because
normals need three evaluations of the noise per vertex, the height field runs
two octaves and the fine weave detail is added in the fragment stage instead.

On a light ground the fabric reads by going *darker* than the ivory in its
troughs (`mix(shadow, base, shade)`), not by accumulating brightness from black.
The same inversion applies to the drifting motes: alpha-blended, since additive
particles are invisible on a bright page.

**`ProceduralSkin`.** Dermal surfaces synthesised in SVG — fractal turbulence
for pore structure, displacement for relief, diffuse lighting for the read.
No image assets. `roughness` drives texture and relief, which is what lets the
before/after slider show the same "patient" at two tissue states; the microscope
toggle simply drops `detail` to tighten the turbulence.

Skin *tone* is deliberately near-constant across the roughness range. If tone
tracked roughness the pair would differ mainly in brightness, and a "smooth"
surface would fade into the ivory page. The lighting pass is multiplied into the
gradient rather than added — adding it pushes everything toward white.

**`.mask-line`.** Display headings run a line-height below 1, so a plain
`overflow: hidden` clip box is shorter than the glyph ink and slices descenders
off the masked word reveals. The utility pads the clip region and cancels the
padding with a matching negative margin so leading is unaffected.

**Cursor.** Hidden on coarse pointers and under `prefers-reduced-motion`. Any
element can drive it with `data-cursor="link|view|drag|text"`, plus optional
`data-cursor-label` and `data-cursor-magnet` (0–1 pull strength).

**Product glass.** Not `MeshTransmissionMaterial`. Fully transmissive glass only
reads against contrast: over a transparent canvas the transmission buffer is
black and every bottle becomes a silhouette, while forcing the buffer to the card
colour makes them vanish entirely. Partial transmission on `meshPhysicalMaterial`
keeps the material's own tinted shading, which is what gives each bottle its
identity on a white card.

**Media.** `public/media/*.mp4` is generated, not stock — `scripts/generate-media.sh`
synthesises the treatment previews and testimonial reels from ffmpeg's built-in
sources, with audio, so the sound toggles do something real. Regenerate or
replace with clinical footage:

```bash
./scripts/generate-media.sh
```

Filenames are the contract: `treatment-{rejuvenation,sculpting,hair,longevity}.mp4`
and `reel-{1..5}.mp4`. Paths are wired in `src/lib/data.ts`; drop the `video`
field and a card falls back to the procedural surface.

## Known gaps

- Checkout and booking submit are inert — no backend, no payment.
- Cart state is in-memory; it resets on reload.
- Outcome imagery is synthesised. A production build would pull consented
  patient photography, and the before/after disclaimer should be reviewed by
  whoever owns medical-advertising compliance in your jurisdiction.
