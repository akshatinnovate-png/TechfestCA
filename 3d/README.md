# ASCENT PROTOCOL — Techfest 3D

A scroll-driven, real-time 3D journey built with WebGL and Three.js.
Five chapters in one continuous world, no page reloads, no video.

**Live:** https://akshatinnovate-png.github.io/TechfestCA/3d/

## The journey

| # | Chapter | What happens |
|---|---------|--------------|
| 01 | **Ignition** | A displaced, noise-driven icosahedron core pulses inside two counter-rotating wireframe cages. Drag to orbit it. |
| 02 | **The Lattice** | The camera flies down a corridor of instanced resonance rings while a GPU particle stream rushes past. |
| 03 | **The Arena** | Six interactive event bodies on a ring. Hover to scan, click to lock on and open a detail panel. |
| 04 | **The Spire** | 2,200 instanced cubes assemble out of scattered debris into a helical tower as you climb. |
| 05 | **Transmission** | 14,000 points morph from a sphere into the word TECHFEST, staggered per-particle on the GPU. |

## Technique

- **Camera rig** — twelve keyframes interpolated with smoothstep, driven by damped scroll
  progress, with drag-orbit and pointer parallax layered on top.
- **Post-processing** — `EffectComposer` → `RenderPass` → `UnrealBloomPass` → `OutputPass`,
  ACES filmic tone mapping.
- **Custom GLSL** — the core (fbm displacement + fresnel), the nebula backdrop, the particle
  stream, the starfield and the text morph are all hand-written shaders.
- **Instancing** — rings, pylons and the 2,200-cube spire are `InstancedMesh`; the spire's
  assembly is recomputed only when its progress actually changes.
- **Interaction** — `Raycaster` picking gated to the arena chapter, with HTML labels projected
  onto the 3D bodies every frame.
- **Adaptive quality** — a lower geometry/particle tier on small or low-core devices, and an
  automatic ECO mode that drops bloom and pixel ratio if the frame rate sustains below 28 FPS.

## Running it

No build step. Serve the folder and open it:

```bash
python3 -m http.server 8000
# → http://localhost:8000/3d/
```

Three.js r160.1 is **vendored** in `vendor/three/` (core + the four postprocessing
addons it needs) rather than loaded from a CDN, so the site keeps working offline and
cannot break mid-demo. Resolved through a native `<script type="importmap">`.

## Controls

- **Scroll** — fly the camera through the chapters
- **Drag** — orbit the current subject
- **Hover / click** — scan and lock on to an arena body (chapter 03)
- **AUTO-FLY** — hands-free tour; any scroll input cancels it
- **Chapter nav** — jump straight to a chapter

Falls back to a readable notice without WebGL, and honours `prefers-reduced-motion`.
