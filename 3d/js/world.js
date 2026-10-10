/* ══════════════════════════════════════════════════════════════
   ASCENT PROTOCOL — world.js
   Builds every object in the scene. Each builder returns handles
   the render loop animates. Nothing here touches the DOM.
   ══════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

export const C = {
  cyan:   new THREE.Color('#00e5ff'),
  violet: new THREE.Color('#8b5cff'),
  gold:   new THREE.Color('#ffc24a'),
  rose:   new THREE.Color('#ff4d87'),
  jade:   new THREE.Color('#47ffbe'),
  deep:   new THREE.Color('#050a16')
};

/* Where each chapter lives in world space. The camera rig walks -Z. */
export const Z = { core: 0, lattice: -70, arena: -165, spire: -250, final: -330 };

/* ─────────────────────────────────────────────────────────────
   Shared GLSL: cheap 3D value noise + fbm
   ───────────────────────────────────────────────────────────── */
const NOISE_GLSL = /* glsl */`
  vec3 hash3(vec3 p){
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float noise3(vec3 p){
    vec3 i = floor(p), f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
                       dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
                   mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                       dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
               mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                       dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
                   mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                       dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
  }
  float fbm3(vec3 p){
    float v = 0.0, a = 0.5;
    for(int i = 0; i < 4; i++){ v += a * noise3(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`;

/* ─────────────────────────────────────────────────────────────
   CHAPTER 1 — the core
   A displaced icosahedron with a fresnel rim, inside a counter
   rotating wireframe cage, inside a soft volumetric halo.
   ───────────────────────────────────────────────────────────── */
export function buildCore(scene) {
  const group = new THREE.Group();
  group.position.z = Z.core;

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime:   { value: 0 },
      uPulse:  { value: 0 },
      uA:      { value: C.cyan.clone() },
      uB:      { value: C.violet.clone() },
      uC:      { value: C.gold.clone() }
    },
    vertexShader: /* glsl */`
      uniform float uTime;
      uniform float uPulse;
      varying vec3 vN;
      varying vec3 vView;
      varying float vD;
      ${NOISE_GLSL}
      void main(){
        vec3 p = position;
        float n = fbm3(normalize(position) * 1.9 + vec3(0.0, 0.0, uTime * 0.26));
        float beat = 1.0 + 0.10 * pow(abs(sin(uTime * 1.25)), 3.0) + uPulse * 0.22;
        p += normal * n * 0.62 * beat;
        vD = n;
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
      uniform float uTime;
      varying vec3 vN; varying vec3 vView; varying float vD;
      void main(){
        float fres = pow(1.0 - clamp(dot(normalize(vN), normalize(vView)), 0.0, 1.0), 2.2);
        vec3 col = mix(uB * 0.26, uA * 0.62, clamp(vD * 1.5 + 0.5, 0.0, 1.0));
        col = mix(col, uC * 0.9, pow(fres, 1.5) * 0.7);
        col += uA * fres * 0.85;
        col *= 0.72 + 0.26 * sin(uTime * 2.0 + vD * 6.0);
        gl_FragColor = vec4(col, 0.94);
      }
    `
  });

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 24), mat);
  group.add(core);

  const cage = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(4.6, 1)),
    new THREE.LineBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.30 })
  );
  group.add(cage);

  const cage2 = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.OctahedronGeometry(6.2, 0)),
    new THREE.LineBasicMaterial({ color: C.gold, transparent: true, opacity: 0.18 })
  );
  group.add(cage2);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(6.2, 32, 32),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uCol: { value: C.cyan.clone() } },
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vN = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uCol; uniform float uTime; varying vec3 vN; varying vec3 vV;
        void main(){
          float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.4);
          gl_FragColor = vec4(uCol * f * (0.34 + 0.16 * sin(uTime)), f * 0.38);
        }`
    })
  );
  group.add(halo);

  const light = new THREE.PointLight(0x00e5ff, 120, 90, 2);
  group.add(light);

  scene.add(group);
  return { group, core, cage, cage2, mat, halo, light };
}

/* ─────────────────────────────────────────────────────────────
   CHAPTER 2 — the lattice corridor
   Instanced resonance rings + wall pylons + a particle stream.
   ───────────────────────────────────────────────────────────── */
export function buildLattice(scene, quality) {
  const group = new THREE.Group();

  const RINGS = quality.low ? 16 : 26;
  const ringGeo = new THREE.TorusGeometry(7.4, 0.095, 8, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x0a2b38, emissive: C.cyan, emissiveIntensity: 1.0,
    metalness: 0.9, roughness: 0.25
  });
  const rings = new THREE.InstancedMesh(ringGeo, ringMat, RINGS);
  rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  /* instances are spread over 150 units but the bounds come from one
     ring at the origin, so leave culling to us */
  rings.frustumCulled = false;

  const ringData = [];
  for (let i = 0; i < RINGS; i++) {
    ringData.push({
      z: Z.core - 22 - i * 6.2,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.35,
      scale: 0.82 + Math.random() * 0.5,
      tilt: (Math.random() - 0.5) * 0.3
    });
  }
  group.add(rings);

  /* wall pylons — thin emissive slabs rushing past in peripheral vision */
  const PYL = quality.low ? 70 : 150;
  const pylGeo = new THREE.BoxGeometry(0.16, 0.16, 3.4);
  const pylMat = new THREE.MeshStandardMaterial({
    color: 0x101c30, emissive: C.violet, emissiveIntensity: 1.1,
    metalness: 0.8, roughness: 0.4, transparent: true, opacity: 1
  });
  const pylons = new THREE.InstancedMesh(pylGeo, pylMat, PYL);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  const e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  for (let i = 0; i < PYL; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 10 + Math.random() * 6;
    v.set(Math.cos(a) * r, Math.sin(a) * r, Z.core - 20 - Math.random() * 112);
    e.set(0, 0, a);
    q.setFromEuler(e);
    s.set(1, 1, 0.5 + Math.random() * 2.4);
    m4.compose(v, q, s);
    pylons.setMatrixAt(i, m4);
  }
  pylons.instanceMatrix.needsUpdate = true;
  pylons.frustumCulled = false;
  group.add(pylons);

  /* stream particles flowing down the corridor */
  const SP = quality.low ? 900 : 2200;
  const spPos = new Float32Array(SP * 3);
  const spSeed = new Float32Array(SP);
  for (let i = 0; i < SP; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 8.2;
    spPos[i * 3]     = Math.cos(a) * r;
    spPos[i * 3 + 1] = Math.sin(a) * r;
    spPos[i * 3 + 2] = Z.core - Math.random() * 180;
    spSeed[i] = Math.random();
  }
  const spGeo = new THREE.BufferGeometry();
  spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  spGeo.setAttribute('aSeed', new THREE.BufferAttribute(spSeed, 1));
  const spMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uA: { value: C.cyan.clone() }, uB: { value: C.gold.clone() } },
    vertexShader: `
      uniform float uTime; attribute float aSeed; varying float vS;
      void main(){
        vS = aSeed;
        vec3 p = position;
        p.z = mod(p.z + uTime * (9.0 + aSeed * 16.0) + 400.0, 190.0) - 190.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = min((1.6 + aSeed * 3.4) * (170.0 / max(-mv.z, 6.0)), 7.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uA; uniform vec3 uB; varying float vS;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(mix(uA, uB, vS), a * 0.85);
      }`
  });
  const stream = new THREE.Points(spGeo, spMat);
  stream.frustumCulled = false;  /* the shader scrolls z past the bounds */
  group.add(stream);

  scene.add(group);
  return { group, rings, ringData, stream, spMat, ringMat, pylMat };
}

/* ─────────────────────────────────────────────────────────────
   CHAPTER 3 — the arena
   Six interactive event bodies on a ring. Each one is a mesh plus
   a wireframe shell so hover reads clearly at any distance.
   ───────────────────────────────────────────────────────────── */
export const EVENTS = [
  { id: 'robowars', name: 'ROBOWARS',   tag: 'COMBAT ROBOTICS',
    body: 'Fifteen-kilo machines, one steel arena, three minutes. The loudest event on campus and the hardest to engineer for.',
    specs: [['WEIGHT CLASS', '15 kg'], ['ARENA', '20 × 20 ft'], ['PRIZE', '₹5,00,000']],
    color: C.rose, geo: () => new THREE.OctahedronGeometry(2.1, 0) },
  { id: 'hack', name: 'HACKATHON', tag: '36-HOUR BUILD',
    body: 'A day and a half, one problem statement, no sleep worth mentioning. Ship something that works by sunrise on the second day.',
    specs: [['DURATION', '36 hours'], ['TEAM SIZE', '2 – 4'], ['TRACKS', '6']],
    color: C.cyan, geo: () => new THREE.IcosahedronGeometry(2.1, 0) },
  { id: 'meshmerize', name: 'MESHMERIZE', tag: 'AUTONOMOUS NAVIGATION',
    body: 'A maze nobody has seen before and a bot that has to solve it alone. No remotes, no second attempts.',
    specs: [['MODE', 'Fully autonomous'], ['RUNS', '2'], ['PRIZE', '₹2,00,000']],
    color: C.jade, geo: () => new THREE.TorusKnotGeometry(1.35, 0.42, 120, 16) },
  { id: 'aero', name: 'AERO SPRINT', tag: 'FIXED-WING RACING',
    body: 'Hand-built aircraft through a pylon course at low altitude. Scored on lap time and on whether it lands in one piece.',
    specs: [['WINGSPAN', '< 1.5 m'], ['COURSE', '6 pylons'], ['LAPS', '3']],
    color: C.gold, geo: () => new THREE.ConeGeometry(1.6, 3.6, 5) },
  { id: 'ignite', name: 'IGNITE', tag: 'LECTURE SERIES',
    body: 'Nobel laureates, astronauts and the occasional person who built something that changed an industry. Free seating, arrive early.',
    specs: [['SESSIONS', '12'], ['SEATS', '4,000'], ['ENTRY', 'Free']],
    color: C.violet, geo: () => new THREE.DodecahedronGeometry(2.1, 0) },
  { id: 'exhibit', name: 'EXHIBITION', tag: 'TECH SHOWCASE',
    body: 'Humanoids, hyperloop pods and defence hardware you normally only see in press photos, parked on the lawn for three days.',
    specs: [['PAVILIONS', '8'], ['EXHIBITS', '60+'], ['OPEN', 'All 3 days']],
    color: C.cyan, geo: () => new THREE.BoxGeometry(2.9, 2.9, 2.9) }
];

export function buildArena(scene) {
  const group = new THREE.Group();
  group.position.z = Z.arena;

  const items = [];
  const R = 11.4;
  EVENTS.forEach((ev, i) => {
    const a = (i / EVENTS.length) * Math.PI * 2;
    const holder = new THREE.Group();
    holder.position.set(Math.cos(a) * R, Math.sin(a * 2) * 1.4, Math.sin(a) * R);

    const mesh = new THREE.Mesh(
      ev.geo(),
      new THREE.MeshStandardMaterial({
        color: 0x0c1526, emissive: ev.color, emissiveIntensity: 0.55,
        metalness: 0.95, roughness: 0.22
      })
    );
    mesh.userData.index = i;
    holder.add(mesh);

    const shell = new THREE.LineSegments(
      new THREE.WireframeGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color: ev.color, transparent: true, opacity: 0.35 })
    );
    shell.scale.setScalar(1.22);
    holder.add(shell);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.1, 3.26, 48),
      new THREE.MeshBasicMaterial({ color: ev.color, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -2.9;
    holder.add(ring);

    group.add(holder);
    items.push({ ev, holder, mesh, shell, ring, base: holder.position.clone(), angle: a, hot: 0, sel: 0 });
  });

  /* floor grid so the arena reads as a place, not just floating shapes */
  const grid = new THREE.GridHelper(70, 36, 0x18506b, 0x0d2636);
  grid.position.y = -7.5;
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  group.add(grid);

  const key = new THREE.PointLight(0xffffff, 260, 70, 2);
  key.position.set(0, 9, 0);
  group.add(key);

  scene.add(group);
  return { group, items, grid };
}

/* ─────────────────────────────────────────────────────────────
   CHAPTER 4 — the spire
   An instanced helix that assembles from scattered debris as the
   chapter's local progress runs 0 → 1.
   ───────────────────────────────────────────────────────────── */
export function buildSpire(scene, quality) {
  const N = quality.low ? 900 : 2200;
  const geo = new THREE.BoxGeometry(0.44, 0.44, 0.44);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x0b1424, emissive: C.cyan, emissiveIntensity: 0.6,
    metalness: 0.92, roughness: 0.28
  });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;   /* 2,200 instances, origin-sized bounds */
  mesh.position.z = Z.spire;

  const data = [];
  const H = 46;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const y = -8 + t * H;
    const turns = 7.5;
    const a = t * Math.PI * 2 * turns;
    const r = 6.4 * Math.pow(1 - t, 0.62) + 0.55;
    data.push({
      to: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r),
      from: new THREE.Vector3(
        (Math.random() - 0.5) * 95,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 95
      ),
      rot: new THREE.Euler(Math.random() * 6.28, a, Math.random() * 6.28),
      spin: (Math.random() - 0.5) * 2.2,
      delay: t * 0.55 + Math.random() * 0.12,
      scale: 0.6 + Math.random() * 0.9
    });
  }

  /* a beacon running up the spine */
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, H + 8, 8),
    new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.35 })
  );
  beacon.position.set(0, -8 + H / 2, Z.spire);

  scene.add(mesh);
  scene.add(beacon);
  return { mesh, data, N, mat, beacon };
}

/* ─────────────────────────────────────────────────────────────
   CHAPTER 5 — the transmission
   A point cloud that morphs from a sphere into the word TECHFEST,
   sampled from an offscreen 2D canvas. Morph runs on the GPU.
   ───────────────────────────────────────────────────────────── */
function sampleText(text, count) {
  const cv = document.createElement('canvas');
  cv.width = 1024; cv.height = 256;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 150px Orbitron, Impact, sans-serif';
  ctx.fillText(text, cv.width / 2, cv.height / 2 + 6);

  const img = ctx.getImageData(0, 0, cv.width, cv.height).data;
  const hits = [];
  for (let y = 0; y < cv.height; y += 2) {
    for (let x = 0; x < cv.width; x += 2) {
      if (img[(y * cv.width + x) * 4] > 128) hits.push(x, y);
    }
  }
  const out = new Float32Array(count * 3);
  const n = hits.length / 2;
  const SX = 0.050, SY = 0.050;
  for (let i = 0; i < count; i++) {
    if (n === 0) { out[i * 3] = out[i * 3 + 1] = out[i * 3 + 2] = 0; continue; }
    const k = (Math.random() * n) | 0;
    out[i * 3]     = (hits[k * 2] - cv.width / 2) * SX + (Math.random() - 0.5) * 0.09;
    out[i * 3 + 1] = -(hits[k * 2 + 1] - cv.height / 2) * SY + (Math.random() - 0.5) * 0.09;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.7;
  }
  return out;
}

export function buildTransmission(scene, quality) {
  const N = quality.low ? 6000 : 14000;
  const from = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    /* even-ish sphere via the golden spiral */
    const t = (i + 0.5) / N;
    const phi = Math.acos(1 - 2 * t);
    const th = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 13 + Math.random() * 3;
    from[i * 3]     = Math.cos(th) * Math.sin(phi) * r;
    from[i * 3 + 1] = Math.cos(phi) * r;
    from[i * 3 + 2] = Math.sin(th) * Math.sin(phi) * r;
    seed[i] = Math.random();
  }
  const to = sampleText('TECHFEST', N);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(from, 3));
  geo.setAttribute('aTo', new THREE.BufferAttribute(to, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime:  { value: 0 },
      uMorph: { value: 0 },
      uFade:  { value: 0 },
      uA:     { value: C.cyan.clone() },
      uB:     { value: C.gold.clone() },
      uC:     { value: C.violet.clone() }
    },
    vertexShader: /* glsl */`
      uniform float uTime; uniform float uMorph;
      attribute vec3 aTo; attribute float aSeed;
      varying float vS; varying float vM;
      void main(){
        vS = aSeed;
        /* stagger each point so the word resolves in a wave */
        float m = clamp((uMorph - aSeed * 0.34) / 0.66, 0.0, 1.0);
        m = m * m * (3.0 - 2.0 * m);
        vM = m;
        vec3 p = mix(position, aTo, m);
        /* drift, strongest while the cloud is still loose */
        float d = 1.0 - m;
        p.x += sin(uTime * 0.7 + aSeed * 31.4) * 0.5 * d;
        p.y += cos(uTime * 0.6 + aSeed * 17.2) * 0.5 * d;
        p.z += sin(uTime * 0.5 + aSeed * 23.9) * 0.5 * d;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = min((1.3 + aSeed * 2.0 + m * 1.6) * (210.0 / max(-mv.z, 8.0)), 9.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform float uFade;
      varying float vS; varying float vM;
      void main(){
        if(uFade <= 0.001) discard;
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        float a = smoothstep(0.5, 0.05, d);
        vec3 col = mix(mix(uC, uA, vS), uB, vM * 0.75);
        gl_FragColor = vec4(col, a * (0.35 + vM * 0.65) * uFade);
      }`
  });

  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.position.z = Z.final;
  scene.add(pts);
  return { pts, mat, N };
}

/* ─────────────────────────────────────────────────────────────
   Ambient starfield wrapping the whole journey
   ───────────────────────────────────────────────────────────── */
export function buildStars(scene, quality) {
  const N = quality.low ? 1800 : 4200;
  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  /* Stars live in a shell around the flight corridor. A star that sits
     near the camera path renders as a giant bokeh disc, so the inner
     radius keeps them all comfortably outside it. */
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 70 + Math.random() * 180;
    pos[i * 3]     = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.sin(a) * r * 0.75;
    pos[i * 3 + 2] = 60 - Math.random() * 560;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      uniform float uTime; attribute float aSeed; varying float vS; varying float vT;
      void main(){
        vS = aSeed;
        vT = 0.55 + 0.45 * sin(uTime * 1.6 + aSeed * 62.8);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = min((0.9 + aSeed * 2.1) * (150.0 / max(-mv.z, 12.0)), 3.4);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying float vS; varying float vT;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        vec3 c = mix(vec3(0.75,0.88,1.0), vec3(1.0,0.86,0.62), step(0.82, vS));
        gl_FragColor = vec4(c, smoothstep(0.5, 0.0, d) * vT * 0.85);
      }`
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);
  return { pts, mat };
}

/* ─────────────────────────────────────────────────────────────
   Nebula backdrop — one big additive shell behind everything
   ───────────────────────────────────────────────────────────── */
export function buildNebula(scene) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, transparent: false,
    uniforms: {
      uTime: { value: 0 },
      uA: { value: C.violet.clone() },
      uB: { value: C.cyan.clone() },
      uC: { value: C.deep.clone() }
    },
    vertexShader: `varying vec3 vP;
      void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
      varying vec3 vP;
      ${NOISE_GLSL}
      void main(){
        vec3 d = normalize(vP);
        float n = fbm3(d * 2.4 + vec3(0.0, 0.0, uTime * 0.016));
        float m = fbm3(d * 4.8 - vec3(uTime * 0.01, 0.0, 0.0));
        vec3 col = uC * 0.6;
        col = mix(col, uA * 0.20, smoothstep(0.0, 0.75, n + 0.25));
        col = mix(col, uB * 0.12, smoothstep(0.25, 0.9, m));
        col *= 0.35 + 0.45 * smoothstep(-0.7, 0.7, d.y);
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 32), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;   /* always first, behind everything */
  scene.add(mesh);
  return { mesh, mat };
}
