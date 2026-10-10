# RE·ENTRY — A Parallax Descent

Scroll from 400 km up all the way down to the Techfest arena floor. Six layers of
atmosphere, every one of them moving at a different speed.

**Live:** https://akshatinnovate-png.github.io/TechfestCA/parallax/

## The descent

| Layer | Altitude | What moves |
|-------|----------|-----------|
| 01 Orbit | 400 km | Earth's limb drifts down while the satellite drifts up past the title |
| 02 Mesosphere | 80 km | Aurora ribbons, shooting stars, a weather balloon bobbing against the scroll |
| 03 Cloud deck | 10 km | Three cloud banks at three speeds, an airliner crossing with its contrail |
| 04 Ridgeline | 2 km | Five procedurally generated ridges, far to near, with birds and valley mist |
| 05 The city | 200 m | Three skyline ranks; windows light up one by one as you descend, a train crosses |
| 06 Ground | 0 m | Treeline, the Techfest gate, a crowd, and fireflies that drift toward your cursor |

## How it works

- **One rAF loop.** Nothing is bound to the scroll event directly — scroll position is
  damped each frame and every layer is positioned from that single value, so the motion
  stays smooth and nothing fights the browser's scrolling.
- **Per-scene progress.** Each scene is a tall block with a `position: sticky` stage. A
  layer's offset is `(sceneProgress − 0.5) × speed`, so layers cross each other rather
  than merely lagging. Speeds run from +24 (furthest) to −30 (nearest).
- **Generated scenery.** The ridgelines and the two far skyline ranks are SVG paths built
  in code from a seeded RNG and inlined as data URIs; clouds, stars, trees, the crowd and
  the fireflies are generated DOM. There are no image assets in this folder.
- **Gap-proof layers.** Anything anchored to the bottom of the stage is over-tall with a
  solid skirt below the fold, so translating it upward can never reveal a seam.
- **Continuous sky.** One fixed gradient, eight screens tall, panned by global scroll
  progress — so the sky grades from black orbit through dawn, haze and dusk in one piece.
- **Altitude readout** interpolates between the layer altitudes as you fall.

## Things to poke at

- Click the satellite in layer 01.
- Move the cursor around — every layer takes a little pointer parallax, the nearer ones more.
- Hover near the fireflies on the ground; they lean toward you.
- The dots on the right jump between layers.

## Running it

No build step, no dependencies.

```bash
python3 -m http.server 8000
# → http://localhost:8000/parallax/
```

Honours `prefers-reduced-motion`: the parallax stands down and the scenes become a plain
vertical read.
