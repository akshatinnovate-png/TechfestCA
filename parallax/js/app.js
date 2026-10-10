/* ══════════════════════════════════════════════════════════════
   RE·ENTRY — a parallax descent
   One rAF loop drives every layer. Scroll is damped, each layer
   gets its own speed, and all the scenery is generated in code.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };
  var rand  = function (a, b) { return a + Math.random() * (b - a); };
  /* smoothstep between two edges */
  var band  = function (x, a, b) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SMALL  = innerWidth < 860;

  /* ════════════════ SCENERY GENERATORS ════════════════ */

  /** one jagged ridge as an inline SVG data-URI, so it scales to any width */
  function ridge(opts) {
    var W = 1440, H = opts.h || 420;
    var pts = [];
    var n = opts.peaks;
    var seed = opts.seed;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i <= n; i++) {
      var x = (i / n) * W;
      var base = opts.base + Math.sin(i * opts.freq + opts.phase) * opts.amp;
      var jag = (rnd() - 0.5) * opts.rough;
      pts.push([x, clamp(base + jag, 10, H - 4)]);
    }
    var d = 'M0,' + H + ' L0,' + pts[0][1].toFixed(1);
    for (var k = 1; k < pts.length; k++) {
      var px = pts[k - 1], c = pts[k];
      var mx = (px[0] + c[0]) / 2;
      d += ' Q' + px[0].toFixed(1) + ',' + px[1].toFixed(1) + ' ' + mx.toFixed(1) + ',' + ((px[1] + c[1]) / 2).toFixed(1);
    }
    d += ' L' + W + ',' + pts[n][1].toFixed(1) + ' L' + W + ',' + H + ' Z';

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<path d="' + d + '" fill="' + opts.fill + '"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /** a flat-topped skyline silhouette */
  function skyline(opts) {
    var W = 1440, H = opts.h || 420;
    var seed = opts.seed;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var d = 'M0,' + H;
    var x = 0;
    while (x < W) {
      var w = opts.minW + rnd() * (opts.maxW - opts.minW);
      var h = opts.minH + rnd() * (opts.maxH - opts.minH);
      var y = H - h;
      d += ' L' + x.toFixed(1) + ',' + y.toFixed(1);
      /* the occasional mast or water tank */
      if (rnd() > 0.82) {
        var mw = w * 0.22, mx = x + w / 2 - mw / 2;
        d += ' L' + mx.toFixed(1) + ',' + y.toFixed(1) +
             ' L' + mx.toFixed(1) + ',' + (y - 26).toFixed(1) +
             ' L' + (mx + mw).toFixed(1) + ',' + (y - 26).toFixed(1) +
             ' L' + (mx + mw).toFixed(1) + ',' + y.toFixed(1);
      }
      d += ' L' + (x + w).toFixed(1) + ',' + y.toFixed(1);
      x += w;
    }
    d += ' L' + W + ',' + H + ' Z';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<path d="' + d + '" fill="' + opts.fill + '"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /* ── stars ── */
  (function buildStars() {
    var wrap = $('#stars');
    var n = SMALL ? 90 : 170;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var s = document.createElement('i');
      s.className = 'star';
      var size = Math.random() < 0.88 ? rand(1, 2) : rand(2.2, 3.4);
      s.style.cssText =
        'left:' + rand(0, 100).toFixed(2) + '%;top:' + rand(0, 100).toFixed(2) + '%;' +
        'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;' +
        '--d:' + rand(2.2, 6).toFixed(1) + 's;--o:' + rand(.15, .55).toFixed(2) + ';' +
        'animation-delay:' + rand(0, 5).toFixed(1) + 's';
      frag.appendChild(s);
    }
    wrap.appendChild(frag);
  })();

  /* ── cloud decks ── */
  function puff(host, count, cfg) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var c = document.createElement('span');
      c.className = 'cloud';
      var w = rand(cfg.minW, cfg.maxW);
      c.style.cssText =
        'left:' + rand(-15, 100).toFixed(1) + '%;' +
        'top:' + rand(cfg.top[0], cfg.top[1]).toFixed(1) + '%;' +
        'width:' + w.toFixed(0) + 'px;height:' + (w * rand(0.17, 0.3)).toFixed(0) + 'px;' +
        '--b:' + cfg.blur + 'px;--o:' + rand(cfg.op[0], cfg.op[1]).toFixed(2);
      frag.appendChild(c);
    }
    host.appendChild(frag);
  }
  puff($('#cloudFar'),  SMALL ? 7 : 12, { minW: 240, maxW: 560, top: [6, 52],  blur: 22, op: [.35, .6] });
  puff($('#cloudMid'),  SMALL ? 6 : 10, { minW: 340, maxW: 760, top: [26, 74], blur: 14, op: [.6, .85] });
  puff($('#cloudNear'), SMALL ? 5 : 8,  { minW: 520, maxW: 1150, top: [58, 108], blur: 8,  op: [.85, 1] });

  /* ── ridgelines ── */
  var RIDGES = [
    { sel: '.lyr--ridge5', fill: '#6d86b8', base: 150, amp: 30, rough: 34, peaks: 26, freq: .7,  phase: 0.3, at: 0.58 },
    { sel: '.lyr--ridge4', fill: '#566ea0', base: 146, amp: 38, rough: 44, peaks: 22, freq: .9,  phase: 1.4, at: 0.68 },
    { sel: '.lyr--ridge3', fill: '#3b4d79', base: 142, amp: 46, rough: 56, peaks: 18, freq: 1.1, phase: 2.6, at: 0.78 },
    { sel: '.lyr--ridge2', fill: '#253357', base: 138, amp: 54, rough: 68, peaks: 14, freq: 1.3, phase: 3.9, at: 0.89 },
    { sel: '.lyr--ridge1', fill: '#121a33', base: 134, amp: 50, rough: 82, peaks: 10, freq: 1.6, phase: 5.1, at: 1.02 }
  ];

  /* Each ridge is two stacked backgrounds: the silhouette, then a solid
     block of the same colour running to the bottom of a deliberately
     over-tall element, so translating it upward can never reveal a seam.
     Sized in pixels because the relief has to stay legible at any height. */
  var RIDGE_IMG = RIDGES.map(function (r, i) {
    return ridge({
      fill: r.fill, base: r.base, amp: r.amp, rough: r.rough,
      peaks: r.peaks, freq: r.freq, phase: r.phase, h: 420, seed: 1000 + i * 777
    });
  });

  function layoutRidges() {
    var vh = innerHeight;
    var elH = vh * 1.8;          /* matches the 180% height in the stylesheet */
    var imgH = vh * 0.46;        /* the silhouette band                       */
    RIDGES.forEach(function (r, i) {
      var el = $(r.sel);
      if (!el) return;
      var bottom = r.at * vh;    /* where the silhouette's baseline lands     */
      el.style.backgroundImage = RIDGE_IMG[i] + ', linear-gradient(' + r.fill + ',' + r.fill + ')';
      el.style.backgroundSize = '100% ' + imgH.toFixed(0) + 'px, 100% ' + Math.max(0, elH - bottom).toFixed(0) + 'px';
      el.style.backgroundPosition = 'center ' + (bottom - imgH).toFixed(0) + 'px, center ' + bottom.toFixed(0) + 'px';
    });
  }
  layoutRidges();
  addEventListener('resize', layoutRidges, { passive: true });

  /* ── birds ── */
  (function buildBirds() {
    var host = $('#birds');
    for (var i = 0; i < (SMALL ? 5 : 9); i++) {
      var b = document.createElement('span');
      b.className = 'bird';
      b.style.cssText =
        'left:' + rand(8, 82).toFixed(1) + '%;top:' + rand(14, 46).toFixed(1) + '%;' +
        'scale:' + rand(.5, 1.15).toFixed(2) + ';' +
        'animation-delay:' + rand(0, 1).toFixed(2) + 's;' +
        'animation-duration:' + rand(.75, 1.4).toFixed(2) + 's';
      host.appendChild(b);
    }
  })();

  /* ── city: far + mid as silhouettes, near as real buildings with windows ── */
  $('#skyFar').style.backgroundImage = skyline({ fill: '#2b3357', minW: 46, maxW: 96, minH: 90,  maxH: 230, seed: 4242, h: 420 });
  $('#skyFar').style.cssText += ';background-repeat:no-repeat;background-position:center 58%;background-size:100% 42%;';
  $('#skyMid').style.backgroundImage = skyline({ fill: '#191f3b', minW: 58, maxW: 124, minH: 130, maxH: 320, seed: 9119, h: 420 });
  $('#skyMid').style.cssText += ';background-repeat:no-repeat;background-position:center 46%;background-size:100% 54%;';

  var windows = [];
  (function buildNearCity() {
    var host = $('#skyNear');
    var holder = document.createElement('div');
    holder.className = 'city';
    var x = -4;
    var seed = 777;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    while (x < 104) {
      var w = 4 + rnd() * 7;
      var h = 11 + rnd() * 25;
      var b = document.createElement('div');
      b.style.cssText =
        'position:absolute;bottom:0;left:' + x.toFixed(2) + '%;width:' + w.toFixed(2) + '%;' +
        'height:' + h.toFixed(1) + 'vh;background:#070a16;border-radius:2px 2px 0 0;' +
        'box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);';
      /* windows on a grid inside each tower */
      var cols = Math.max(2, Math.round(w * 1.5));
      var rows = Math.max(3, Math.round(h / 3.4));
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          if (rnd() > 0.62) continue;
          var win = document.createElement('i');
          win.className = 'win';
          win.style.cssText =
            'left:' + (((c + 0.5) / cols) * 100).toFixed(1) + '%;' +
            'bottom:' + (((r + 0.6) / rows) * 100).toFixed(1) + '%;' +
            'width:' + (46 / cols).toFixed(1) + '%;height:' + (34 / rows).toFixed(1) + '%;' +
            '--wo:' + rand(.45, 1).toFixed(2) + ';';
          win.dataset.k = Math.random().toFixed(3);
          b.appendChild(win);
          windows.push(win);
        }
      }
      holder.appendChild(b);
      x += w + rnd() * 1.2;
    }
    host.appendChild(holder);
    windows.sort(function (a, b2) { return a.dataset.k - b2.dataset.k; });
  })();

  /* ── ground: trees, crowd, fireflies ── */
  (function buildGround() {
    var tl = $('#treeline');
    for (var i = 0; i < (SMALL ? 16 : 30); i++) {
      var t = document.createElement('span');
      t.className = 'tree';
      var w = rand(2.2, 6);
      t.style.cssText =
        'left:' + rand(-3, 100).toFixed(1) + '%;width:' + w.toFixed(1) + '%;' +
        'height:' + rand(10, 24).toFixed(1) + 'vh;opacity:' + rand(.55, 1).toFixed(2);
      tl.appendChild(t);
    }
    var cr = $('#crowd');
    for (var j = 0; j < (SMALL ? 26 : 52); j++) {
      var p = document.createElement('span');
      p.className = 'person';
      p.style.cssText =
        'left:' + rand(-2, 100).toFixed(1) + '%;width:' + rand(.7, 1.5).toFixed(2) + '%;' +
        'height:' + rand(4.5, 9).toFixed(1) + 'vh;';
      cr.appendChild(p);
    }
  })();

  var flies = [];
  (function buildFlies() {
    var host = $('#flies');
    for (var i = 0; i < (SMALL ? 10 : 20); i++) {
      var f = document.createElement('span');
      f.className = 'fly';
      host.appendChild(f);
      flies.push({
        el: f,
        x: rand(0, innerWidth), y: rand(innerHeight * 0.45, innerHeight * 0.92),
        vx: 0, vy: 0, ph: rand(0, 6.28), sp: rand(.4, 1.1)
      });
    }
  })();

  /* ── shooting stars ── */
  (function shooters() {
    if (REDUCE) return;
    var host = $('#shootLayer');
    setInterval(function () {
      if (document.hidden) return;
      var s = document.createElement('span');
      s.className = 'shoot';
      var x = rand(20, 100), y = rand(2, 55);
      s.style.cssText = 'left:' + x + '%;top:' + y + '%;opacity:0;';
      host.appendChild(s);
      var dist = rand(220, 520);
      s.animate(
        [{ transform: 'translate(0,0)', opacity: 0 },
         { opacity: 1, offset: 0.12 },
         { transform: 'translate(-' + dist + 'px,' + dist * 0.42 + 'px)', opacity: 0 }],
        { duration: rand(700, 1400), easing: 'cubic-bezier(.2,.6,.3,1)' }
      ).onfinish = function () { s.remove(); };
    }, 1700);
  })();

  /* ════════════════ NAV DOTS ════════════════ */
  var scenes = $$('.scene');
  var dotsWrap = $('#dots');
  scenes.forEach(function (sc, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<span>' + sc.dataset.name + '</span><i></i>';
    b.setAttribute('aria-label', 'Go to ' + sc.dataset.name);
    b.addEventListener('click', function () {
      scrollTo({ top: sc.offsetTop + 2, behavior: REDUCE ? 'auto' : 'smooth' });
    });
    dotsWrap.appendChild(b);
  });
  var dotBtns = $$('button', dotsWrap);

  /* ════════════════ LAYER REGISTRY ════════════════ */
  var layers = [];
  function indexLayers() {
    layers = [];
    scenes.forEach(function (sc) {
      $$('[data-speed]', sc).forEach(function (el) {
        layers.push({
          el: el,
          scene: sc,
          speed: parseFloat(el.dataset.speed) || 0,
          drift: parseFloat(el.dataset.drift) || 0,
          isCopy: el.classList.contains('copy')
        });
      });
    });
  }
  indexLayers();

  /* geometry cache, refreshed on resize */
  var geo = { h: innerHeight, w: innerWidth, docH: 1, scenes: [] };
  function measure() {
    geo.h = innerHeight; geo.w = innerWidth;
    geo.docH = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    geo.scenes = scenes.map(function (sc) {
      return { top: sc.offsetTop, height: sc.offsetHeight };
    });
    layers.forEach(function (L) {
      L.idx = scenes.indexOf(L.scene);
    });
  }
  measure();
  addEventListener('resize', function () { measure(); }, { passive: true });
  addEventListener('load', measure);

  /* ════════════════ INPUT ════════════════ */
  var sy = scrollY, ty = scrollY;
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('scroll', function () { ty = scrollY; }, { passive: true });
  addEventListener('pointermove', function (e) {
    tmx = (e.clientX / innerWidth) * 2 - 1;
    tmy = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  /* a small reward for poking at the satellite */
  var sat = $('#sat');
  if (sat) sat.addEventListener('click', function () {
    sat.classList.add('spun');
    setTimeout(function () { sat.classList.remove('spun'); }, 1200);
  });
  var replay = $('#replay');
  if (replay) replay.addEventListener('click', function () {
    scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
  });

  /* ════════════════ ALTITUDE ════════════════ */
  /* metres at each scene boundary — interpolated for the readout */
  var ALT = [400000, 80000, 10000, 2000, 200, 0];
  var altNum = $('#altNum'), altUnit = $('#altUnit');

  function showAlt(m) {
    var v, u;
    if (m >= 1000) { v = Math.round(m / 1000); u = 'km'; }
    else { v = Math.round(m); u = 'm'; }
    altNum.textContent = v.toLocaleString('en-IN');
    altUnit.textContent = u;
  }

  /* ════════════════ ELEMENTS DRIVEN BY GLOBAL PROGRESS ════════════════ */
  var sky = $('#sky'), starsEl = $('#stars'), sunEl = $('#sun');
  var tapeFill = $('#tapeFill'), cue = $('#cue'), train = $('#train');
  var lastLit = 0;

  /* ════════════════ FRAME ════════════════ */
  function frame() {
    requestAnimationFrame(frame);

    sy += (ty - sy) * (REDUCE ? 1 : 0.12);
    mx += (tmx - mx) * 0.06;
    my += (tmy - my) * 0.06;

    var g = clamp(sy / geo.docH, 0, 1);

    /* ── the sky itself pans through its gradient ── */
    sky.style.backgroundPosition = '0 ' + (g * 100).toFixed(2) + '%';

    /* stars fade as the atmosphere thickens, return at dusk on the ground */
    starsEl.style.opacity = (1 - band(g, 0.16, 0.44) * 0.95 + band(g, 0.82, 0.95) * 0.5).toFixed(3);

    /* the sun rises into the cloud deck, then sets behind the city */
    var sunIn = band(g, 0.36, 0.52) * (1 - band(g, 0.66, 0.84));
    sunEl.style.opacity = sunIn.toFixed(3);
    sunEl.style.transform = 'translate3d(' + (mx * 14).toFixed(1) + 'px,' +
      (lerp(34, -16, band(g, 0.34, 0.8)) * geo.h / 100).toFixed(1) + 'px,0)';

    tapeFill.style.width = (g * 100).toFixed(2) + '%';
    cue.classList.toggle('off', sy > geo.h * 0.35);

    /* ── per-scene layer transforms ── */
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      var S = geo.scenes[L.idx];
      if (!S) continue;

      /* 0 when the scene's top hits the viewport top, 1 when its bottom does */
      var p = (sy - S.top) / Math.max(1, S.height - geo.h);
      if (p < -0.35 || p > 1.35) {           /* far offscreen — skip the write */
        if (L.parked) continue;
        L.parked = true;
      } else {
        L.parked = false;
      }
      p = clamp(p, -0.35, 1.35);

      var c = p - 0.5;
      var y = c * L.speed * geo.h / 100;
      var x = c * L.drift * geo.w / 100;

      /* pointer parallax, stronger on the nearer (faster) layers */
      var k = Math.abs(L.speed) * 0.035;
      x += mx * k;
      y += my * k * 0.45;

      if (L.isCopy) {
        /* copy drifts gently and fades at the edges of its scene */
        var vis = band(p, -0.34, -0.04) * (1 - band(p, 0.74, 1.02));
        L.el.style.opacity = vis.toFixed(3);
        L.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      } else {
        L.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      }
    }

    /* ── city windows light up progressively ── */
    var cityS = geo.scenes[4];
    if (cityS) {
      var cp = clamp((sy - cityS.top) / Math.max(1, cityS.height - geo.h), 0, 1);
      var want = Math.floor(band(cp, 0.05, 0.78) * windows.length);
      if (want > lastLit) {
        for (var w = lastLit; w < want; w++) windows[w].classList.add('on');
        lastLit = want;
      } else if (want < lastLit) {
        for (var w2 = want; w2 < lastLit; w2++) windows[w2].classList.remove('on');
        lastLit = want;
      }
      if (train) {
        train.style.transform = 'translate3d(' + lerp(-260, geo.w + 60, cp).toFixed(0) + 'px,0,0)';
      }
    }

    /* ── fireflies wander, and lean toward the pointer ── */
    var gS = geo.scenes[5];
    if (gS && flies.length) {
      var gp = clamp((sy - gS.top) / Math.max(1, gS.height - geo.h), -0.3, 1.3);
      var alive = gp > -0.2 && gp < 1.2;
      var t = performance.now() * 0.001;
      var px = (mx * 0.5 + 0.5) * geo.w, py = (my * 0.5 + 0.5) * geo.h;
      for (var f = 0; f < flies.length; f++) {
        var F = flies[f];
        if (!alive) { F.el.style.opacity = '0'; continue; }
        F.el.style.opacity = (0.45 + 0.55 * Math.sin(t * 2 + F.ph)).toFixed(2);
        F.vx += Math.cos(t * F.sp + F.ph) * 0.06 + (px - F.x) * 0.00018;
        F.vy += Math.sin(t * F.sp * 1.3 + F.ph) * 0.06 + (py - F.y) * 0.00018;
        F.vx *= 0.96; F.vy *= 0.96;
        F.x += F.vx; F.y += F.vy;
        if (F.x < -20) F.x = geo.w + 20; if (F.x > geo.w + 20) F.x = -20;
        if (F.y < geo.h * 0.3) F.y = geo.h * 0.3; if (F.y > geo.h) F.y = geo.h;
        F.el.style.transform = 'translate3d(' + F.x.toFixed(1) + 'px,' + F.y.toFixed(1) + 'px,0)';
      }
    }

    /* ── altitude readout + active dot ── */
    var seg = clamp(g * (ALT.length - 1), 0, ALT.length - 1.0001);
    var si = Math.floor(seg);
    showAlt(lerp(ALT[si], ALT[si + 1], seg - si));

    var active = 0;
    for (var d = 0; d < geo.scenes.length; d++) {
      if (sy + geo.h * 0.4 >= geo.scenes[d].top) active = d;
    }
    for (var db = 0; db < dotBtns.length; db++) {
      dotBtns[db].classList.toggle('on', db === active);
    }
  }

  frame();
})();
