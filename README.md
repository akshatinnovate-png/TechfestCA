# CYBORG ASCENSION — Techfest 30th Edition Landing Page

A responsive, cyborg-themed landing page built for the **IIT Bombay Techfest Campus Ambassador** design task.
Zero dependencies, zero build step — pure HTML, CSS and JavaScript.

## Live

**https://akshatinnovate-png.github.io/TechfestCA/**

Deployed automatically by GitHub Actions (`.github/workflows/deploy-pages.yml`) on every push.

To run locally, open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
```

## Also in this repo

**[`3d/`](3d/) — ASCENT PROTOCOL**, a scroll-driven real-time 3D experience built with WebGL
and Three.js: five chapters, interactive event bodies, an instanced spire that assembles as
you scroll, and a particle wordmark finale.
Live at **https://akshatinnovate-png.github.io/TechfestCA/3d/**

## What's in it

- **Custom WebGL backdrop** — a hand-written GLSL fragment shader (domain-warped FBM aether clouds,
  aurora curtains, a receding horizon lattice, twin starfields and a pointer-driven light well).
  Its palette rotates per section as you scroll.
- **3D cyborg schematic** — a wireframe of the ascended frame, projected by a hand-rolled perspective
  transform on a 2D canvas. It orbits with the pointer, runs a travelling scan plane, beats at the
  plasma heart, and its DOM hotspots are pinned live to the projected joints.
- **Hero constellation field** — a node mesh with travelling data packets that parts around the cursor.
- **Boot sequence** — animated terminal log, SVG progress ring, "enter the aether" gate.
- **Reticle cursor** — dual-ring crosshair with context labels and magnetic buttons.
- **Motion system** — word-aware per-character heading reveals, scroll-linked progress and timeline
  spine, 3D tilt + spotlight cards, odometers, chromatic-aberration glitch passes.
- **Synthesised ambient audio** — three detuned drones and a filtered noise bed built in the Web Audio
  API at runtime. No audio files shipped.
- **Overdrive easter egg** — the Konami code flips the whole palette.

## Built for everyone

- Fluid type and layout from 320px to ultrawide; five breakpoints.
- Full `prefers-reduced-motion` path — animation, grain and the shader all stand down.
- Keyboard navigable, skip link, ARIA roles on tabs/accordion/live regions, visible focus rings.
- Graceful fallbacks: no WebGL → CSS gradient; no IntersectionObserver → content shown immediately.

## Structure

```
index.html
assets/css/  core.css · components.css · sections.css · responsive.css
assets/js/   gl-aether.js · cyber-core.js · interactions.js · main.js
```

The uplink form is a front-end demo — it validates and plays a transmission sequence; no backend attached.
