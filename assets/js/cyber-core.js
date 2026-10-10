/* ══════════════════════════════════════════════════════════════
   CYBORG ASCENSION — cyber-core.js
   1. HeroField  — constellation mesh + travelling data packets
   2. CoreRig    — rotating 3D wireframe of the ascended frame,
                   hand-rolled perspective projection on 2D canvas
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;

  function dpr(cap) { return Math.min(window.devicePixelRatio || 1, cap || 2); }

  function fitCanvas(cv, ratio) {
    var r = cv.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width * ratio));
    var h = Math.max(1, Math.round(r.height * ratio));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    return { w: r.width, h: r.height };
  }

  /* ══════════════════════════════════════════════════════════
     1. HERO FIELD
     ══════════════════════════════════════════════════════════ */
  function HeroField(cv) {
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var W = 0, H = 0, R = dpr(1.75);
    var nodes = [], packets = [];
    var mouse = { x: -9999, y: -9999, active: false };
    var LINK = 148;

    function seed() {
      var box = fitCanvas(cv, R);
      W = box.w; H = box.h;
      ctx.setTransform(R, 0, 0, R, 0, 0);

      var target = Math.round(Math.min(110, Math.max(34, (W * H) / 15500)));
      nodes = [];
      for (var i = 0; i < target; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.24,
          vy: (Math.random() - 0.5) * 0.24,
          r: Math.random() * 1.5 + 0.6,
          ph: Math.random() * TAU,
          hot: Math.random() < 0.14
        });
      }
      packets = [];
    }

    function spawnPacket() {
      if (nodes.length < 2 || packets.length > 18) return;
      var a = (Math.random() * nodes.length) | 0;
      var best = -1, bd = LINK;
      for (var i = 0; i < nodes.length; i++) {
        if (i === a) continue;
        var d = Math.hypot(nodes[i].x - nodes[a].x, nodes[i].y - nodes[a].y);
        if (d < bd && Math.random() < 0.5) { bd = d; best = i; }
      }
      if (best < 0) return;
      packets.push({ a: a, b: best, t: 0, sp: 0.009 + Math.random() * 0.018, gold: Math.random() < 0.3 });
    }

    var tick = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      tick++;

      /* links */
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -40) n.x = W + 40; if (n.x > W + 40) n.x = -40;
        if (n.y < -40) n.y = H + 40; if (n.y > H + 40) n.y = -40;

        if (mouse.active) {
          var mdx = n.x - mouse.x, mdy = n.y - mouse.y;
          var md = Math.hypot(mdx, mdy);
          if (md < 190 && md > 0.1) {
            var push = (1 - md / 190) * 0.55;
            n.x += (mdx / md) * push;
            n.y += (mdy / md) * push;
          }
        }

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          var al = (1 - Math.sqrt(d2) / LINK) * 0.26;
          ctx.strokeStyle = 'rgba(53,240,255,' + al.toFixed(3) + ')';
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
        }
      }

      /* nodes */
      for (var k = 0; k < nodes.length; k++) {
        var p = nodes[k];
        var pulse = 0.55 + 0.45 * Math.sin(tick * 0.03 + p.ph);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.8 + pulse * 0.5), 0, TAU);
        if (p.hot) {
          ctx.fillStyle = 'rgba(255,194,58,' + (0.45 + pulse * 0.45).toFixed(3) + ')';
          ctx.shadowColor = 'rgba(255,194,58,.9)'; ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = 'rgba(170,230,255,' + (0.28 + pulse * 0.4).toFixed(3) + ')';
          ctx.shadowColor = 'rgba(53,240,255,.8)'; ctx.shadowBlur = 7;
        }
        ctx.fill(); ctx.shadowBlur = 0;
      }

      /* packets */
      if (tick % 22 === 0) spawnPacket();
      for (var q = packets.length - 1; q >= 0; q--) {
        var pk = packets[q];
        pk.t += pk.sp;
        if (pk.t >= 1 || !nodes[pk.a] || !nodes[pk.b]) { packets.splice(q, 1); continue; }
        var A = nodes[pk.a], B = nodes[pk.b];
        var x = A.x + (B.x - A.x) * pk.t;
        var y = A.y + (B.y - A.y) * pk.t;
        var fade = Math.sin(pk.t * Math.PI);
        ctx.beginPath(); ctx.arc(x, y, 2.1, 0, TAU);
        ctx.fillStyle = pk.gold
          ? 'rgba(255,205,90,' + fade.toFixed(3) + ')'
          : 'rgba(150,250,255,' + fade.toFixed(3) + ')';
        ctx.shadowColor = pk.gold ? '#ffc23a' : '#35f0ff';
        ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    }

    var raf = 0;
    seed();
    if (!REDUCE) raf = requestAnimationFrame(draw);
    else { draw(); cancelAnimationFrame(raf); }

    window.addEventListener('resize', function () { seed(); }, { passive: true });
    window.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      mouse.active = mouse.y > -200 && mouse.y < r.height + 200;
    }, { passive: true });
    window.addEventListener('pointerleave', function () { mouse.active = false; });
  }

  /* ══════════════════════════════════════════════════════════
     2. CORE RIG — wireframe of the ascended frame
     ══════════════════════════════════════════════════════════ */
  var V = [
    [0, 1.00, 0],        /* 0  crown        */
    [-0.13, 0.84, 0.13], /* 1               */
    [0.13, 0.84, 0.13],  /* 2               */
    [0.13, 0.84, -0.13], /* 3               */
    [-0.13, 0.84, -0.13],/* 4               */
    [0, 0.68, 0.08],     /* 5  jaw          */
    [0, 0.60, 0],        /* 6  cervical     */
    [-0.34, 0.52, 0],    /* 7  shoulder L   */
    [0.34, 0.52, 0],     /* 8  shoulder R   */
    [-0.23, 0.38, 0.11], /* 9               */
    [0.23, 0.38, 0.11],  /* 10              */
    [0.23, 0.38, -0.11], /* 11              */
    [-0.23, 0.38, -0.11],/* 12              */
    [0, 0.28, 0.15],     /* 13 plasma heart */
    [-0.17, 0.00, 0.08], /* 14              */
    [0.17, 0.00, 0.08],  /* 15              */
    [0.17, 0.00, -0.08], /* 16              */
    [-0.17, 0.00, -0.08],/* 17              */
    [-0.47, 0.16, 0.03], /* 18 elbow L      */
    [0.47, 0.16, 0.03],  /* 19 elbow R      */
    [-0.53, -0.18, 0.07],/* 20 hand L       */
    [0.53, -0.18, 0.07], /* 21 hand R       */
    [-0.16, -0.08, 0],   /* 22 hip L        */
    [0.16, -0.08, 0],    /* 23 hip R        */
    [-0.19, -0.52, 0.05],/* 24 knee L       */
    [0.19, -0.52, 0.05], /* 25 knee R       */
    [-0.21, -0.95, -0.02],/* 26 foot L      */
    [0.21, -0.95, -0.02] /* 27 foot R       */
  ];

  var E = [
    /* cranium */
    [0,1],[0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,1],
    [1,5],[2,5],[5,6],[3,6],[4,6],
    /* clavicle + ribcage */
    [6,7],[6,8],[7,9],[8,10],[7,12],[8,11],
    [9,10],[10,11],[11,12],[12,9],
    [9,13],[10,13],[13,14],[13,15],
    /* abdomen */
    [9,14],[10,15],[11,16],[12,17],
    [14,15],[15,16],[16,17],[17,14],
    /* arms */
    [7,18],[18,20],[8,19],[19,21],
    /* pelvis + legs */
    [14,22],[17,22],[15,23],[16,23],[22,23],
    [22,24],[24,26],[23,25],[25,27]
  ];

  var NODE_IDX = [0, 7, 8, 13, 24];

  function CoreRig(cv, onReady) {
    var ctx = cv.getContext('2d');
    if (!ctx) return null;

    var W = 0, H = 0, R = dpr(2);
    var rotY = -0.35, rotX = 0.06, tRotY = -0.35, tRotX = 0.06;
    var active = -1, scanY = 1.2, t = 0;
    var dust = [];
    var hover = false;
    var stage = cv.parentElement;
    var hotEls = stage ? Array.prototype.slice.call(stage.querySelectorAll('.hot')) : [];

    function size() {
      var box = fitCanvas(cv, R);
      W = box.w; H = box.h;
      ctx.setTransform(R, 0, 0, R, 0, 0);
      dust = [];
      for (var i = 0; i < 46; i++) {
        dust.push({ a: Math.random() * TAU, r: 0.5 + Math.random() * 0.75,
                    y: (Math.random() * 2 - 1), sp: 0.002 + Math.random() * 0.006,
                    s: Math.random() * 1.4 + 0.4 });
      }
    }

    function project(v) {
      var x = v[0], y = v[1], z = v[2];
      var cy = Math.cos(rotY), sy = Math.sin(rotY);
      var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      var cx = Math.cos(rotX), sx = Math.sin(rotX);
      var y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      var fov = 3.1;
      var k = fov / (fov + z2 + 1.4);
      var S = Math.min(W, H) * 0.46;
      return { x: W / 2 + x1 * S * k, y: H / 2 - y1 * S * k, z: z2, k: k };
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      rotY += (tRotY - rotY) * 0.06;
      rotX += (tRotX - rotX) * 0.06;
      if (!hover) tRotY += 0.0042;

      scanY -= 0.0065;
      if (scanY < -1.25) scanY = 1.25;

      var P = new Array(V.length);
      for (var i = 0; i < V.length; i++) P[i] = project(V[i]);

      /* orbital dust */
      for (var d = 0; d < dust.length; d++) {
        var p = dust[d];
        p.a += p.sp;
        var dv = [Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r];
        var pp = project(dv);
        var al = (0.1 + pp.k * 0.3) * (p.s / 1.8);
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, p.s * pp.k, 0, TAU);
        ctx.fillStyle = 'rgba(123,92,255,' + al.toFixed(3) + ')';
        ctx.fill();
      }

      /* edges */
      for (var e = 0; e < E.length; e++) {
        var a = P[E[e][0]], b = P[E[e][1]];
        var depth = (a.k + b.k) / 2;
        var mid = (V[E[e][0]][1] + V[E[e][1]][1]) / 2;
        var near = Math.max(0, 1 - Math.abs(mid - scanY) * 5.5);

        var base = 0.16 + (depth - 0.55) * 1.05;
        base = Math.max(0.07, Math.min(0.68, base));

        ctx.lineWidth = 0.7 + depth * 0.9 + near * 1.5;
        ctx.strokeStyle = near > 0.05
          ? 'rgba(255,' + Math.round(194 + near * 50) + ',' + Math.round(58 + near * 90) + ',' + (base + near * 0.5).toFixed(3) + ')'
          : 'rgba(53,240,255,' + base.toFixed(3) + ')';
        if (near > 0.3) { ctx.shadowColor = '#ffc23a'; ctx.shadowBlur = 12 * near; }
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.shadowBlur = 0;
      }

      /* vertices */
      for (var v = 0; v < P.length; v++) {
        var q = P[v];
        var isNode = NODE_IDX.indexOf(v);
        var r = isNode >= 0 ? 3.2 : 1.5;
        var on = isNode >= 0 && isNode === active;
        ctx.beginPath(); ctx.arc(q.x, q.y, r * q.k * 1.5, 0, TAU);
        ctx.fillStyle = on ? 'rgba(255,205,90,.95)' : 'rgba(170,235,255,' + (0.3 + q.k * 0.5).toFixed(3) + ')';
        ctx.shadowColor = on ? '#ffc23a' : '#35f0ff';
        ctx.shadowBlur = on ? 20 : 8;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      /* plasma heart */
      var hp = P[13];
      var beat = 0.72 + 0.28 * Math.pow(Math.abs(Math.sin(t * 1.5)), 3);
      var g = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 44 * beat * hp.k);
      g.addColorStop(0, 'rgba(255,255,255,.95)');
      g.addColorStop(0.18, 'rgba(120,245,255,.75)');
      g.addColorStop(0.5, 'rgba(53,240,255,.28)');
      g.addColorStop(1, 'rgba(53,240,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(hp.x, hp.y, 44 * beat * hp.k, 0, TAU); ctx.fill();

      /* pin the DOM hotspots to the live projection of their node */
      for (var hx = 0; hx < hotEls.length; hx++) {
        var np = P[NODE_IDX[hx]];
        if (!np) continue;
        hotEls[hx].style.left = np.x.toFixed(1) + 'px';
        hotEls[hx].style.top  = np.y.toFixed(1) + 'px';
        hotEls[hx].style.opacity = (0.35 + np.k * 0.75).toFixed(2);
      }

      /* scan plane */
      var sp = project([0, scanY, 0]);
      var sw = Math.min(W, H) * 0.44;
      var lg = ctx.createLinearGradient(sp.x - sw, 0, sp.x + sw, 0);
      lg.addColorStop(0, 'rgba(255,194,58,0)');
      lg.addColorStop(0.5, 'rgba(255,194,58,.5)');
      lg.addColorStop(1, 'rgba(255,194,58,0)');
      ctx.strokeStyle = lg; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(sp.x - sw, sp.y); ctx.lineTo(sp.x + sw, sp.y); ctx.stroke();

      raf = requestAnimationFrame(render);
    }

    var raf = 0;
    size();
    window.addEventListener('resize', size, { passive: true });

    cv.parentElement.addEventListener('pointermove', function (ev) {
      var r = cv.getBoundingClientRect();
      var nx = (ev.clientX - r.left) / r.width - 0.5;
      var ny = (ev.clientY - r.top) / r.height - 0.5;
      hover = true;
      tRotY = -0.35 + nx * 1.5;
      tRotX = 0.06 + ny * 0.55;
    });
    cv.parentElement.addEventListener('pointerleave', function () {
      hover = false; tRotX = 0.06;
    });

    if (REDUCE) { render(); cancelAnimationFrame(raf); }
    else raf = requestAnimationFrame(render);

    if (onReady) onReady();

    return {
      select: function (i) { active = i; },
      /** snap the rig so the chosen node faces the viewer */
      face: function (i) {
        var map = [0, 0.9, -0.9, -0.1, 0.35];
        tRotY = map[i] !== undefined ? map[i] : -0.35;
        hover = true;
        setTimeout(function () { hover = false; }, 2600);
      }
    };
  }

  /* ══════════════════════════════════════════════════════════ */
  function boot() {
    var hero = document.getElementById('heroCore');
    if (hero) HeroField(hero);
    var core = document.getElementById('coreCanvas');
    if (core) window.CORE_RIG = CoreRig(core);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
