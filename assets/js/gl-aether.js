/* ══════════════════════════════════════════════════════════════
   CYBORG ASCENSION — gl-aether.js
   Procedural WebGL backdrop: volumetric aether, aurora curtains,
   starfield, horizon lattice. Zero dependencies, raw WebGL1.
   Falls back silently to a CSS gradient if WebGL is unavailable.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var VERT = [
    'attribute vec2 aPos;',
    'void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec2  uRes;',
    'uniform float uTime;',
    'uniform vec2  uMouse;',
    'uniform float uScroll;',
    'uniform float uHue;',
    'uniform float uPulse;',

    /* ---- hash / noise / fbm ---- */
    'float hash(vec2 p){',
    '  p = fract(p * vec2(123.34, 456.21));',
    '  p += dot(p, p + 45.32);',
    '  return fract(p.x * p.y);',
    '}',
    'float noise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  float a = hash(i);',
    '  float b = hash(i + vec2(1.0, 0.0));',
    '  float c = hash(i + vec2(0.0, 1.0));',
    '  float d = hash(i + vec2(1.0, 1.0));',
    '  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);',
    '}',
    'float fbm(vec2 p){',
    '  float v = 0.0, a = 0.5;',
    '  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);',
    '  for(int i = 0; i < 6; i++){',
    '    v += a * noise(p);',
    '    p = rot * p * 2.02;',
    '    a *= 0.5;',
    '  }',
    '  return v;',
    '}',

    /* ---- starfield ---- */
    'float stars(vec2 uv, float density, float t){',
    '  vec2 g = floor(uv * density);',
    '  vec2 f = fract(uv * density);',
    '  float h = hash(g);',
    '  if(h < 0.972) return 0.0;',
    '  vec2 c = vec2(hash(g + 1.3), hash(g + 7.7));',
    '  float d = length(f - c);',
    '  float tw = 0.55 + 0.45 * sin(t * 2.2 + h * 62.8);',
    '  return smoothstep(0.085, 0.0, d) * tw;',
    '}',

    /* ---- palette rotation ---- */
    'vec3 shiftHue(vec3 col, float a){',
    '  const vec3 k = vec3(0.57735);',
    '  float c = cos(a);',
    '  return col * c + cross(k, col) * sin(a) + k * dot(k, col) * (1.0 - c);',
    '}',

    'void main(){',
    '  vec2 frag = gl_FragCoord.xy;',
    '  vec2 uv   = (frag - 0.5 * uRes) / uRes.y;',
    '  vec2 suv  = frag / uRes;',
    '  float t   = uTime * 0.055;',

    /* parallax drift from pointer + scroll */
    '  vec2 par = (uMouse - 0.5) * 0.22;',
    '  vec2 p   = uv + par;',
    '  p.y += uScroll * 0.55;',

    /* ---- deep aether clouds (domain-warped fbm) ---- */
    '  vec2 q = vec2(fbm(p * 1.6 + vec2(0.0, t)), fbm(p * 1.6 + vec2(5.2, 1.3 - t)));',
    '  vec2 r = vec2(fbm(p * 1.6 + 4.0 * q + vec2(1.7, 9.2) + t * 0.7),',
    '                fbm(p * 1.6 + 4.0 * q + vec2(8.3, 2.8) - t * 0.4));',
    '  float f = fbm(p * 1.6 + 4.0 * r);',

    '  vec3 deep   = vec3(0.012, 0.024, 0.055);',
    '  vec3 violet = vec3(0.32, 0.20, 0.72);',
    '  vec3 cyan   = vec3(0.14, 0.86, 1.00);',
    '  vec3 gold   = vec3(1.00, 0.72, 0.21);',

    '  vec3 col = deep;',
    '  col = mix(col, violet * 0.30, clamp(f * f * 2.1, 0.0, 1.0));',
    '  col = mix(col, cyan * 0.17, clamp(length(q) * 0.75, 0.0, 1.0));',
    '  col = mix(col, gold * 0.14, clamp(r.x * r.x * 1.10, 0.0, 1.0));',

    /* ---- aurora curtains ---- */
    '  float band = 0.0;',
    '  for(int i = 0; i < 3; i++){',
    '    float fi = float(i);',
    '    float yy = p.y + 0.22 * fi - 0.12;',
    '    float wob = sin(p.x * (2.1 + fi * 0.8) + uTime * (0.28 + fi * 0.11)) * 0.12;',
    '    wob += fbm(vec2(p.x * 1.5 + fi * 3.0, uTime * 0.09)) * 0.18;',
    '    float d = abs(yy - wob);',
    '    band += (0.016 + 0.006 * fi) / (d + 0.02);',
    '  }',
    '  vec3 auroraCol = mix(cyan, violet, 0.5 + 0.5 * sin(uTime * 0.2));',
    '  col += auroraCol * band * 0.040;',

    /* ---- horizon lattice ---- */
    '  float hz = suv.y;',
    '  if(hz < 0.46){',
    '    float depth = (0.46 - hz);',
    '    vec2 gp;',
    '    gp.x = (suv.x - 0.5) / max(depth, 0.004) * 0.26;',
    '    gp.y = 1.0 / max(depth, 0.004) * 0.12 + uTime * 0.16;',
    '    vec2 gw = abs(fract(gp) - 0.5);',
    '    float line = 1.0 - smoothstep(0.0, 0.045, min(gw.x, gw.y));',
    '    float fade = smoothstep(0.0, 0.30, depth) * smoothstep(0.46, 0.30, hz);',
    '    col += cyan * line * fade * 0.085;',
    '  }',

    /* ---- starfield (two layers) ---- */
    '  col += vec3(0.85, 0.93, 1.0) * stars(uv + par * 0.4, 42.0, uTime) * 0.46;',
    '  col += vec3(1.0, 0.88, 0.70) * stars(uv * 1.7 + par * 0.9 + 11.0, 26.0, uTime * 0.7) * 0.32;',

    /* ---- pointer luminance well ---- */
    '  vec2 m = (uMouse * uRes - 0.5 * uRes) / uRes.y;',
    '  float md = length(uv - m);',
    '  col += cyan * 0.045 / (md * 3.8 + 0.26);',
    '  col += gold * uPulse * 0.10 / (md * 5.0 + 0.3);',

    /* ---- scanline + vignette + grade ---- */
    '  float scan = 0.965 + 0.035 * sin(frag.y * 2.2 + uTime * 5.0);',
    '  col *= scan;',
    '  float vig = 1.0 - smoothstep(0.26, 1.05, length(uv * vec2(0.78, 1.0)));',
    '  col *= 0.10 + 0.90 * vig;',
    '  col = shiftHue(col, uHue);',
    '  col = pow(max(col, 0.0), vec3(1.08));',
    '  col += (hash(frag + fract(uTime)) - 0.5) * 0.018;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function Aether(canvas) {
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'high-performance' })
        || canvas.getContext('experimental-webgl');
    } catch (e) { gl = null; }
    if (!gl) return null;

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {
      res:    gl.getUniformLocation(prog, 'uRes'),
      time:   gl.getUniformLocation(prog, 'uTime'),
      mouse:  gl.getUniformLocation(prog, 'uMouse'),
      scroll: gl.getUniformLocation(prog, 'uScroll'),
      hue:    gl.getUniformLocation(prog, 'uHue'),
      pulse:  gl.getUniformLocation(prog, 'uPulse')
    };

    var state = {
      mx: 0.5, my: 0.5, tmx: 0.5, tmy: 0.5,
      scroll: 0, tscroll: 0,
      hue: 0, thue: 0,
      pulse: 0,
      dpr: 1, running: true, t0: performance.now()
    };

    function resize() {
      var cap = window.innerWidth < 760 ? 1.5 : 2;
      state.dpr = Math.min(window.devicePixelRatio || 1, cap);
      var w = Math.max(1, Math.floor(window.innerWidth * state.dpr));
      var h = Math.max(1, Math.floor(window.innerHeight * state.dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener('pointermove', function (e) {
      state.tmx = e.clientX / window.innerWidth;
      state.tmy = 1 - e.clientY / window.innerHeight;
    }, { passive: true });

    window.addEventListener('scroll', function () {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      state.tscroll = window.scrollY / max;
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      state.running = !document.hidden;
      if (state.running) { state.t0 = performance.now() - lastT * 1000; frame(); }
    });

    var lastT = 0;
    function frame() {
      if (!state.running) return;
      requestAnimationFrame(frame);
      var now = (performance.now() - state.t0) / 1000;
      lastT = now;

      state.mx += (state.tmx - state.mx) * 0.045;
      state.my += (state.tmy - state.my) * 0.045;
      state.scroll += (state.tscroll - state.scroll) * 0.06;
      state.hue += (state.thue - state.hue) * 0.03;
      state.pulse *= 0.93;

      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, now);
      gl.uniform2f(U.mouse, state.mx, state.my);
      gl.uniform1f(U.scroll, state.scroll);
      gl.uniform1f(U.hue, state.hue);
      gl.uniform1f(U.pulse, state.pulse);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    frame();

    return {
      /** rotate the whole palette — used per section + for the easter egg */
      setHue: function (v) { state.thue = v; },
      /** fire a gold luminance burst at the pointer */
      burst: function () { state.pulse = 1; }
    };
  }

  function boot() {
    var canvas = document.getElementById('aether');
    if (!canvas) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      canvas.style.background =
        'radial-gradient(120% 90% at 50% 20%, #101a35 0%, #070c18 45%, #04060c 100%)';
      return;
    }
    var inst = Aether(canvas);
    if (!inst) {
      canvas.style.background =
        'radial-gradient(120% 90% at 50% 20%, #101a35 0%, #070c18 45%, #04060c 100%)';
      return;
    }
    window.AETHER = inst;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
