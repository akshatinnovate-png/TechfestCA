/* ══════════════════════════════════════════════════════════════
   ASCENT PROTOCOL — app.js
   Renderer + post chain, scroll-driven camera rig, pointer
   interaction, chapter UI, adaptive quality, render loop.
   ══════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { EffectComposer }   from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }       from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }  from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }       from 'three/addons/postprocessing/OutputPass.js';
import {
  buildCore, buildLattice, buildArena, buildSpire,
  buildTransmission, buildStars, buildNebula, EVENTS, Z, C
} from './world.js';

const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));
const clamp  = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp   = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
/* normalised, smoothed position of x inside [a,b] */
const span   = (x, a, b) => smooth(clamp((x - a) / (b - a), 0, 1));

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────── quality tier ─────────── */
const quality = {
  low: innerWidth < 820 || (navigator.hardwareConcurrency || 4) <= 4,
  bloom: true
};

/* ═══════════ RENDERER ═══════════
   Probing with a throwaway context burns one of the browser's few
   WebGL contexts and lies on some headless/software stacks, so the
   real renderer is the capability test. */
const canvas = $('#gl');
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({
    canvas, antialias: !quality.low, powerPreference: 'high-performance', stencil: false
  });
} catch (err) {
  renderer = null;
}
if (!renderer) {
  $('#fallback').hidden = false;
  $('#load').classList.add('is-gone');
  document.body.classList.remove('is-busy');
  throw new Error('WebGL unavailable');
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, quality.low ? 1.4 : 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x03050b, 0.0062);

const camera = new THREE.PerspectiveCamera(56, innerWidth / innerHeight, 0.1, 900);
camera.position.set(0, 1.6, 16);

scene.add(new THREE.AmbientLight(0x9fd8ff, 0.5));
const rim = new THREE.DirectionalLight(0xbfe9ff, 1.5);
rim.position.set(4, 8, 6);
scene.add(rim);

/* ═══════════ POST ═══════════ */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  quality.low ? 0.52 : 0.78,  /* strength */
  0.62,                        /* radius   */
  0.20                         /* threshold*/
);
composer.addPass(bloom);
composer.addPass(new OutputPass());
composer.setSize(innerWidth, innerHeight);

/* ═══════════ BUILD THE WORLD ═══════════ */
const loadBar = $('#loadBar'), loadPct = $('#loadPct'), loadMsg = $('#loadMsg');
let pct = 0;
function step(p, msg) {
  pct = p;
  loadBar.style.width = p + '%';
  loadPct.textContent = Math.round(p);
  if (msg) loadMsg.textContent = msg;
}

step(8, 'seeding the void');
const nebula = buildNebula(scene);
const stars  = buildStars(scene, quality);
step(24, 'igniting the core');
const core   = buildCore(scene);
step(42, 'laying the lattice');
const latt   = buildLattice(scene, quality);
step(60, 'staging the arena');
const arena  = buildArena(scene);
step(76, 'scattering the spire');
const spire  = buildSpire(scene, quality);
step(88, 'sampling the transmission');
const trans  = buildTransmission(scene, quality);

/* ═══════════ CAMERA PATH ═══════════ */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const KEYS = [
  { t: 0.00, p: V(0,   1.6,  16),        l: V(0,  0,   Z.core) },
  { t: 0.09, p: V(10,  3.4,  10),        l: V(0,  0,   Z.core) },
  { t: 0.17, p: V(2,   0.6, -4),         l: V(0,  0,  -40) },
  { t: 0.30, p: V(0,   0,   -58),        l: V(0,  0,  -118) },
  { t: 0.40, p: V(0,   0,   -112),       l: V(0,  0,  -168) },
  { t: 0.48, p: V(0,   2.0, Z.arena + 26), l: V(0, 0, Z.arena) },
  { t: 0.58, p: V(17,  5.0, Z.arena + 15), l: V(0, 0, Z.arena) },
  { t: 0.66, p: V(4,  -1.0, Z.arena - 24), l: V(0, 2, Z.spire + 14) },
  { t: 0.74, p: V(19, -4.0, Z.spire + 26), l: V(0, 6,  Z.spire) },
  { t: 0.84, p: V(15,  22,  Z.spire + 22), l: V(0, 22, Z.spire) },
  { t: 0.91, p: V(3,   40,  Z.spire - 16), l: V(0, 30, Z.spire) },
  { t: 0.96, p: V(0,  -6.5, Z.final + 33), l: V(0, -6.5, Z.final) },
  { t: 1.00, p: V(0,  -6.5, Z.final + 29), l: V(0, -6.5, Z.final) }
];

const camPos = new THREE.Vector3().copy(KEYS[0].p);
const camLook = new THREE.Vector3().copy(KEYS[0].l);
const tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();

function samplePath(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const k = smooth(clamp((t - a.t) / (b.t - a.t), 0, 1));
  tmpP.lerpVectors(a.p, b.p, k);
  tmpL.lerpVectors(a.l, b.l, k);
}

/* ═══════════ SCROLL + INPUT STATE ═══════════ */
const S = {
  raw: 0, prog: 0,          /* 0 → 1 through the whole journey  */
  mx: 0, my: 0, tmx: 0, tmy: 0,
  orbit: 0, torbit: 0,      /* drag-accumulated azimuth         */
  lift: 0, tlift: 0,
  dragging: false, lastX: 0, lastY: 0, moved: 0,
  auto: false
};

function readScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  S.raw = clamp(scrollY / max, 0, 1);
}
addEventListener('scroll', readScroll, { passive: true });
readScroll();

addEventListener('pointermove', (e) => {
  S.tmx = (e.clientX / innerWidth) * 2 - 1;
  S.tmy = (e.clientY / innerHeight) * 2 - 1;
  if (S.dragging) {
    S.torbit += (e.clientX - S.lastX) * 0.0052;
    S.tlift  = clamp(S.tlift + (e.clientY - S.lastY) * 0.016, -7, 7);
    S.moved  += Math.abs(e.clientX - S.lastX) + Math.abs(e.clientY - S.lastY);
    S.lastX = e.clientX; S.lastY = e.clientY;
  }
}, { passive: true });

canvas.addEventListener('pointerdown', (e) => {
  S.dragging = true; S.moved = 0;
  S.lastX = e.clientX; S.lastY = e.clientY;
  canvas.setPointerCapture?.(e.pointerId);
});
addEventListener('pointerup', () => { S.dragging = false; });
addEventListener('pointercancel', () => { S.dragging = false; });

/* ═══════════ ARENA INTERACTION ═══════════ */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const pickable = arena.items.map((it) => it.mesh);
let hovered = -1, selected = -1;

const labelWrap = $('#labels');
const labels = EVENTS.map((ev) => {
  const d = document.createElement('div');
  d.className = 'lbl';
  d.innerHTML = '<b>' + ev.name + '</b><i>' + ev.tag + '</i>';
  labelWrap.appendChild(d);
  return d;
});

function arenaActive() { return S.prog > 0.41 && S.prog < 0.68; }

function pick(cx, cy) {
  ndc.x = (cx / innerWidth) * 2 - 1;
  ndc.y = -(cy / innerHeight) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(pickable, false)[0];
  return hit ? hit.object.userData.index : -1;
}

addEventListener('pointermove', (e) => {
  if (!arenaActive() || S.dragging) { return; }
  const i = pick(e.clientX, e.clientY);
  if (i !== hovered) {
    hovered = i;
    canvas.style.cursor = i >= 0 ? 'pointer' : 'grab';
    labels.forEach((l, k) => l.classList.toggle('is-hot', k === i));
  }
}, { passive: true });

canvas.addEventListener('pointerup', (e) => {
  if (!arenaActive() || S.moved > 7) return;
  const i = pick(e.clientX, e.clientY);
  if (i >= 0) openPanel(i); else closePanel();
});

const panel = $('#panel');
function openPanel(i) {
  selected = i;
  const ev = EVENTS[i];
  $('#panelTag').textContent = ev.tag;
  $('#panelTitle').textContent = ev.name;
  $('#panelBody').textContent = ev.body;
  $('#panelSpecs').innerHTML = ev.specs
    .map((s) => '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>').join('');
  panel.classList.add('is-on');
}
function closePanel() { selected = -1; panel.classList.remove('is-on'); }
$('#panelX').addEventListener('click', closePanel);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

/* ═══════════ CHAPTER UI ═══════════ */
const CH = [
  { name: 'IGNITION',     a: 0.00, b: 0.15 },
  { name: 'LATTICE',      a: 0.21, b: 0.39 },
  { name: 'ARENA',        a: 0.45, b: 0.63 },
  { name: 'SPIRE',        a: 0.70, b: 0.86 },
  { name: 'TRANSMISSION', a: 0.91, b: 1.01 }
];
const chEls = $$('.ch');
const navEl = $('#chapterNav');
CH.forEach((c, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = String(i + 1).padStart(2, '0') + ' ' + c.name;
  b.addEventListener('click', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: max * ((c.a + c.b) / 2), behavior: REDUCE ? 'auto' : 'smooth' });
  });
  navEl.appendChild(b);
});
const navBtns = $$('#chapterNav button');

const progFill = $('#progFill'), progPct = $('#progPct'), hint = $('#hint');

function updateUI() {
  progFill.style.width = (S.prog * 100).toFixed(1) + '%';
  progPct.textContent = String(Math.round(S.prog * 100)).padStart(2, '0');
  hint.classList.toggle('is-off', S.prog > 0.02);

  let active = -1;
  CH.forEach((c, i) => {
    const on = S.prog >= c.a && S.prog <= c.b;
    if (on) active = i;
    if (chEls[i]) chEls[i].classList.toggle('is-on', on);
  });
  navBtns.forEach((b, i) => b.classList.toggle('is-on', i === active));
  if (!arenaActive() && selected >= 0) closePanel();
}

/* ═══════════ AUTO-FLY ═══════════ */
const autoBtn = $('#autoBtn');
autoBtn.addEventListener('click', () => {
  S.auto = !S.auto;
  autoBtn.setAttribute('aria-pressed', S.auto ? 'true' : 'false');
});
addEventListener('wheel', () => { if (S.auto) { S.auto = false; autoBtn.setAttribute('aria-pressed', 'false'); } }, { passive: true });

/* ═══════════ RESIZE ═══════════ */
let resizeRAF = 0;
addEventListener('resize', () => {
  cancelAnimationFrame(resizeRAF);
  resizeRAF = requestAnimationFrame(() => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    bloom.setSize(innerWidth, innerHeight);
    readScroll();
  });
}, { passive: true });

/* ═══════════ FRAME ═══════════ */
const clock = new THREE.Clock();
const fpsEl = $('#fps');
let frames = 0, fpsT = 0, slow = 0;
const mat4 = new THREE.Matrix4(), quat = new THREE.Quaternion();
const eul = new THREE.Euler(), pv = new THREE.Vector3(), sv = new THREE.Vector3();
const proj = new THREE.Vector3();
let lastAssembly = -1;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  const T = clock.elapsedTime;

  /* ---- progress ---- */
  if (S.auto) {
    const max = document.documentElement.scrollHeight - innerHeight;
    const next = clamp(S.raw + dt * 0.035, 0, 1);
    scrollTo({ top: next * max, behavior: 'instant' });
    S.raw = next;
  }
  S.prog += (S.raw - S.prog) * (REDUCE ? 1 : 0.115);

  /* ---- damped input ---- */
  S.mx += (S.tmx - S.mx) * 0.05;
  S.my += (S.tmy - S.my) * 0.05;
  S.orbit += (S.torbit - S.orbit) * 0.07;
  S.lift  += (S.tlift  - S.lift)  * 0.07;
  if (!S.dragging) { S.torbit *= 0.985; S.tlift *= 0.985; }

  /* ---- camera along the path ---- */
  samplePath(S.prog);
  camPos.lerp(tmpP, 0.22);
  camLook.lerp(tmpL, 0.22);

  /* orbit the damped drag around the look target, then parallax */
  const off = pv.copy(camPos).sub(camLook);
  const ca = Math.cos(S.orbit), sa = Math.sin(S.orbit);
  const ox = off.x * ca - off.z * sa;
  const oz = off.x * sa + off.z * ca;
  camera.position.set(
    camLook.x + ox + S.mx * 2.2,
    camLook.y + off.y + S.lift - S.my * 1.5,
    camLook.z + oz
  );
  camera.lookAt(camLook);

  /* ═══ chapter 1 — core ═══ */
  core.mat.uniforms.uTime.value = T;
  core.mat.uniforms.uPulse.value = Math.max(0, 1 - S.prog * 6);
  core.halo.material.uniforms.uTime.value = T;
  core.cage.rotation.y = T * 0.14;
  core.cage.rotation.x = T * 0.09;
  core.cage2.rotation.y = -T * 0.1;
  core.cage2.rotation.z = T * 0.07;
  core.core.rotation.y = T * 0.08;
  const coreOut = 1 - span(S.prog, 0.14, 0.26);
  core.light.intensity = 120 * coreOut + 6;
  core.group.visible = coreOut > 0.01;
  core.group.scale.setScalar(0.4 + 0.6 * coreOut);
  core.mat.opacity = coreOut;
  core.cage.material.opacity = 0.30 * coreOut;
  core.cage2.material.opacity = 0.18 * coreOut;

  /* ═══ chapter 2 — lattice ═══ */
  latt.spMat.uniforms.uTime.value = T;
  for (let i = 0; i < latt.ringData.length; i++) {
    const d = latt.ringData[i];
    const pulse = 1 + 0.07 * Math.sin(T * 1.6 + i * 0.5);
    eul.set(d.tilt, d.rot + T * d.spin, 0);
    quat.setFromEuler(eul);
    pv.set(Math.sin(T * 0.4 + i) * 0.5, Math.cos(T * 0.33 + i) * 0.5, d.z);
    sv.setScalar(d.scale * pulse);
    mat4.compose(pv, quat, sv);
    latt.rings.setMatrixAt(i, mat4);
  }
  latt.rings.instanceMatrix.needsUpdate = true;
  latt.ringMat.emissiveIntensity = 0.7 + 0.8 * span(S.prog, 0.16, 0.34);
  const lattWin = span(S.prog, 0.10, 0.20) * (1 - span(S.prog, 0.40, 0.48));
  latt.pylMat.opacity = lattWin;
  latt.group.visible = lattWin > 0.02;

  /* ═══ chapter 3 — arena ═══ */
  const arenaVis = span(S.prog, 0.36, 0.46);
  arena.group.rotation.y = T * 0.055 + S.prog * 1.4;
  for (let i = 0; i < arena.items.length; i++) {
    const it = arena.items[i];
    const wantHot = (i === hovered || i === selected) ? 1 : 0;
    it.hot += (wantHot - it.hot) * 0.14;
    const wantSel = (i === selected) ? 1 : 0;
    it.sel += (wantSel - it.sel) * 0.1;

    it.mesh.rotation.x += dt * (0.22 + it.hot * 0.9);
    it.mesh.rotation.y += dt * (0.3 + it.hot * 1.1);
    it.shell.rotation.copy(it.mesh.rotation);

    const s = (0.9 + 0.22 * it.hot + 0.18 * it.sel) * (0.3 + 0.7 * arenaVis);
    it.holder.scale.setScalar(s);
    it.holder.position.y = it.base.y + Math.sin(T * 0.9 + it.angle * 3) * 0.5 + it.sel * 1.1;
    it.mesh.material.emissiveIntensity = 0.42 + it.hot * 1.9 + it.sel * 0.8;
    it.shell.material.opacity = 0.26 + it.hot * 0.55;
    it.ring.material.opacity = (0.14 + it.hot * 0.4) * arenaVis;
    it.ring.rotation.z = T * 0.5;
  }
  arena.grid.material.opacity = 0.42 * arenaVis;
  arena.grid.visible = arenaVis > 0.02;

  /* project the HTML labels onto the bodies */
  const showLabels = arenaVis > 0.25;
  for (let i = 0; i < labels.length; i++) {
    const l = labels[i];
    if (!showLabels) { l.classList.remove('is-vis'); continue; }
    arena.items[i].holder.getWorldPosition(proj);
    proj.y += 2.6;
    proj.project(camera);
    const inFront = proj.z < 1;
    if (!inFront) { l.classList.remove('is-vis'); continue; }
    l.style.left = ((proj.x * 0.5 + 0.5) * innerWidth) + 'px';
    l.style.top  = ((-proj.y * 0.5 + 0.5) * innerHeight) + 'px';
    l.classList.add('is-vis');
  }

  /* ═══ chapter 4 — spire assembly ═══ */
  const asm = span(S.prog, 0.56, 0.80);
  if (Math.abs(asm - lastAssembly) > 0.0008) {
    lastAssembly = asm;
    for (let i = 0; i < spire.N; i++) {
      const d = spire.data[i];
      const k = smooth(clamp((asm - d.delay) / 0.42, 0, 1));
      pv.lerpVectors(d.from, d.to, k);
      eul.set(d.rot.x + (1 - k) * d.spin * 6, d.rot.y, d.rot.z + (1 - k) * d.spin * 4);
      quat.setFromEuler(eul);
      sv.setScalar(d.scale * (0.35 + 0.65 * k));
      mat4.compose(pv, quat, sv);
      spire.mesh.setMatrixAt(i, mat4);
    }
    spire.mesh.instanceMatrix.needsUpdate = true;
  }
  spire.mat.emissiveIntensity = 0.35 + asm * 1.5;
  const spireWin = span(S.prog, 0.54, 0.64) * (1 - span(S.prog, 0.88, 0.95));
  spire.beacon.visible = spireWin > 0.02;
  spire.beacon.material.opacity = 0.34 * spireWin * (0.4 + asm * 0.6);
  spire.beacon.scale.y = 0.2 + asm * 0.8;

  /* ═══ chapter 5 — transmission ═══ */
  trans.mat.uniforms.uTime.value = T;
  trans.mat.uniforms.uMorph.value = span(S.prog, 0.83, 0.97);
  /* the cloud should not hang in the sky during earlier chapters */
  const transFade = span(S.prog, 0.70, 0.84);
  trans.mat.uniforms.uFade.value = transFade;
  trans.pts.visible = transFade > 0.01;
  trans.pts.rotation.y = Math.sin(T * 0.18) * 0.1 + (1 - span(S.prog, 0.84, 1)) * 0.5;

  /* ═══ ambience ═══ */
  stars.mat.uniforms.uTime.value = T;
  nebula.mat.uniforms.uTime.value = T;
  nebula.mesh.position.copy(camera.position);

  /* hue of the whole scene drifts chapter to chapter */
  const warm = span(S.prog, 0.55, 0.95);
  renderer.toneMappingExposure = 1.12 + warm * 0.18;
  bloom.strength = (quality.low ? 0.42 : 0.58) + 0.06 * Math.sin(T * 0.4) + warm * 0.16;

  updateUI();
  composer.render();

  /* ---- fps + adaptive quality ---- */
  frames++; fpsT += dt;
  if (fpsT >= 1) {
    const fps = frames / fpsT;
    fpsEl.textContent = Math.round(fps) + ' FPS';
    if (fps < 28) { slow++; } else { slow = Math.max(0, slow - 1); }
    if (slow >= 4 && quality.bloom) {
      quality.bloom = false;
      bloom.enabled = false;
      renderer.setPixelRatio(1);
      fpsEl.textContent = Math.round(fps) + ' FPS · ECO';
    }
    frames = 0; fpsT = 0;
  }
}

/* ═══════════ GO ═══════════ */
step(94, 'compiling shaders');
renderer.compile(scene, camera);
/* one hidden frame so every program is warm before the curtain lifts */
composer.render();
step(100, 'ready');

const load = $('#load'), loadBtn = $('#loadBtn');
function enter() {
  load.classList.add('is-gone');
  document.body.classList.remove('is-busy');
  document.body.classList.add('is-live');
  setTimeout(() => load.remove(), 1000);
}
document.body.classList.add('is-busy');
loadBtn.hidden = false;
loadBtn.addEventListener('click', enter);
function onEnterKey(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    removeEventListener('keydown', onEnterKey);
    enter();
  }
}
addEventListener('keydown', onEnterKey);

frame();
