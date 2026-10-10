# Techfest — concept landing page

An unofficial redesign study of the **techfest.org** landing page, built for the
"Ideate a landing page" brief. No 3D assets — everything is HTML, CSS and a 2D canvas.

**Live:** https://akshatinnovate-png.github.io/TechfestCA/landing/

> This is a design study. It is not affiliated with or endorsed by Techfest, and the
> event details, prize figures and speaker entries on the page are illustrative
> placeholders, not official data.

## What I looked at

The starting point was the live site: a full-bleed cinematic hero with the
*Aetherial Renaissance* wordmark, an angled HUD top bar (Accommodation / Workshops /
Competitions / Ignite), a separate left rail (Home / Events / CES / Contact / About),
a social rail, and a second screen of three ornate gold-framed cards — CA Program,
About Techfest, and a "More details coming soon" slot.

It looks superb. The things it does not do are what this concept goes after.

## The six moves

| | Observation | What this does instead |
|---|---|---|
| **A1** | The fold is pure atmosphere — you scroll before you learn what this is, when it is, or what to do. | Name, dates, live countdown, one primary action and the headline numbers all above the fold. |
| **A2** | Events are split by department across three different menus. | Three "doors" routed on visitor intent — compete / learn / witness — each wired into the same index. |
| **A3** | Navigation lives in a top bar, a left rail and a social rail with overlapping items. | One searchable, filterable event index with the deadline visible before you click. |
| **A4** | "Early bird" is a small tag. | A live deadline ticker with days remaining, and a per-card countdown bar. |
| **A5** | Thirty years, 175k footfall and thousands of colleges sit below the fold. | Scale is the proof, so it runs in the hero and again as a dedicated section. |
| **A6** | Heavy ornamental frames fight the content and push body copy onto busy art. | The theme is carried by type and colour — a serif display face, ink and molten gold — so copy keeps its contrast. |

A seventh section on the page itself spells this reasoning out, since the brief asked
for ideation rather than only a layout.

## Build

- **No dependencies, no build step, no 3D.** One HTML file, one stylesheet, one script.
- **Canvas aether** — a 2D particle field with drifting light bands that parts around
  the cursor. Pure canvas, no WebGL and no model files.
- **Event index** — 16 entries filtered by category and free-text search, re-rendered
  on the fly with a count line, an empty state and a per-event deadline bar.
- **Live countdown** to 16 December, rolling over to next year once the date passes.
- Reveal-on-scroll, animated counters, a draggable speaker rail, an accordion, a
  validating demo form, and a damped cursor spotlight.
- Responsive from 320px up; honours `prefers-reduced-motion`; keyboard accessible with
  a skip link, focus rings and ARIA state on the filters and accordion.

## Running it

```bash
python3 -m http.server 8000
# → http://localhost:8000/landing/
```
