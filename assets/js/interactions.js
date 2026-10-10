/* ══════════════════════════════════════════════════════════════
   CYBORG ASCENSION — interactions.js
   Cursor rig · magnetic buttons · 3D tilt · reveal engine ·
   odometers · glitch scheduler · scroll-spy · nav · ambient audio
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  var FX = {};

  /* ══════════════ CURSOR RIG ══════════════ */
  FX.cursor = function () {
    var el = $('#cursor');
    if (!el || !FINE || REDUCE) { if (el) el.remove(); return; }
    document.body.classList.add('has-cursor');

    var dot = $('.cursor__dot', el);
    var ring = $('.cursor__ring', el);
    var label = $('#cursorLabel');

    var mx = innerWidth / 2, my = innerHeight / 2;
    var dx = mx, dy = my, rx = mx, ry = my;

    addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    addEventListener('pointerdown', function () { el.classList.add('is-down'); });
    addEventListener('pointerup',   function () { el.classList.remove('is-down'); });
    addEventListener('pointerleave',function () { el.style.opacity = '0'; });
    addEventListener('pointerenter',function () { el.style.opacity = '1'; });

    (function loop() {
      dx += (mx - dx) * 0.55; dy += (my - dy) * 0.55;
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      dot.style.transform   = 'translate(' + dx + 'px,' + dy + 'px)';
      ring.style.transform  = 'translate(' + rx + 'px,' + ry + 'px)';
      label.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();

    var SEL = 'a,button,[data-cursor],input,select,textarea,.cardx,.panel,.faq__q';
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest ? e.target.closest(SEL) : null;
      if (!t) return;
      el.classList.add('is-hover');
      var txt = t.getAttribute('data-cursor') || '';
      label.textContent = txt;
    });
    document.addEventListener('pointerout', function (e) {
      var t = e.target.closest ? e.target.closest(SEL) : null;
      if (!t) return;
      if (e.relatedTarget && t.contains(e.relatedTarget)) return;
      el.classList.remove('is-hover');
      label.textContent = '';
    });
  };

  /* ══════════════ MAGNETIC ELEMENTS ══════════════ */
  FX.magnetic = function () {
    if (!FINE || REDUCE) return;
    $$('[data-magnetic]').forEach(function (el) {
      var raf = 0, cx = 0, cy = 0, tx = 0, ty = 0;

      function run() {
        cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
        el.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
        if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(run);
        else { raf = 0; el.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; }
      }
      function kick() { if (!raf) raf = requestAnimationFrame(run); }

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx = clamp((e.clientX - (r.left + r.width / 2)) * 0.32, -22, 22);
        ty = clamp((e.clientY - (r.top + r.height / 2)) * 0.45, -14, 14);
        kick();
      });
      el.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
    });
  };

  /* ══════════════ 3D TILT + SPOTLIGHT ══════════════ */
  FX.tilt = function () {
    if (!FINE || REDUCE) return;
    $$('[data-tilt],.cardx').forEach(function (el) {
      var max = el.classList.contains('panel') ? 7 : 9;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        el.style.transform =
          'perspective(1100px) rotateX(' + ((0.5 - py) * max).toFixed(2) + 'deg) ' +
          'rotateY(' + ((px - 0.5) * max).toFixed(2) + 'deg) translateZ(6px)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transform = 'perspective(1100px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  };

  /* ══════════════ REVEAL ENGINE ══════════════ */
  FX.reveal = function () {
    /* Split headings into characters, grouped by word.
       Words sit in nowrap boxes so a heading never breaks mid-word. */
    $$('[data-reveal-chars]').forEach(function (el) {
      var txt = el.textContent.replace(/\s+/g, ' ').trim();
      el.setAttribute('aria-label', txt);
      el.textContent = '';
      var frag = document.createDocumentFragment();
      var words = txt.split(' ');
      var n = 0;
      words.forEach(function (word, wi) {
        var w = document.createElement('span');
        w.className = 'word';
        w.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < word.length; i++) {
          var c = document.createElement('span');
          c.className = 'char';
          c.textContent = word[i];
          c.style.setProperty('--d', (n * 28) + 'ms');
          w.appendChild(c);
          n++;
        }
        frag.appendChild(w);
        if (wi < words.length - 1) {
          var sp = document.createElement('span');
          sp.className = 'char char--space';
          sp.setAttribute('aria-hidden', 'true');
          sp.innerHTML = '&nbsp;';
          sp.style.setProperty('--d', (n * 28) + 'ms');
          frag.appendChild(sp);
          n++;
        }
      });
      el.appendChild(frag);
    });

    if (!('IntersectionObserver' in window)) {
      $$('[data-reveal],.char,.tl__item').forEach(function (e) { e.classList.add('is-in'); });
      $$('.cardx__meter').forEach(function (m) {
        var i = m.querySelector('i'); if (i) i.style.width = (m.dataset.meter || 0) + '%';
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');

        /* stagger sibling groups */
        var group = el.parentElement ? $$('[data-reveal]', el.parentElement) : [];
        if (group.length > 1) {
          var idx = group.indexOf(el);
          if (idx > 0) el.style.setProperty('--d', (idx * 90) + 'ms');
        }

        /* char cascade inside */
        $$('.char', el).forEach(function (c) { c.classList.add('is-in'); });
        if (el.matches('[data-reveal-chars]')) $$('.char', el).forEach(function (c) { c.classList.add('is-in'); });

        /* meters */
        $$('.cardx__meter', el).forEach(function (m) {
          var bar = m.querySelector('i');
          if (bar) setTimeout(function () { bar.style.width = (m.dataset.meter || 0) + '%'; }, 220);
        });
        if (el.classList.contains('cardx')) {
          var mm = el.querySelector('.cardx__meter');
          if (mm) { var b2 = mm.querySelector('i'); if (b2) setTimeout(function () { b2.style.width = (mm.dataset.meter || 0) + '%'; }, 220); }
        }

        /* counters */
        $$('[data-count]', el).forEach(FX.odometer);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    $$('[data-reveal]').forEach(function (e) { io.observe(e); });

    /* cards reveal on their own (they are not all [data-reveal]) */
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        var m = en.target.querySelector('.cardx__meter');
        if (m) { var b = m.querySelector('i'); if (b) setTimeout(function () { b.style.width = (m.dataset.meter || 0) + '%'; }, 260); }
        io2.unobserve(en.target);
      });
    }, { threshold: 0.2 });
    $$('.cardx').forEach(function (e) { io2.observe(e); });

    var io3 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('is-in'); });
    }, { threshold: 0.3 });
    $$('.tl__item').forEach(function (e) { io3.observe(e); });
  };

  /* ══════════════ ODOMETER ══════════════ */
  FX.odometer = function (el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var end = parseFloat(el.dataset.count) || 0;
    var dec = parseInt(el.dataset.decimals || '0', 10);
    var suf = el.dataset.suffix || '';
    var dur = 1900, t0 = performance.now();

    function out(v) {
      var n = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN');
      el.innerHTML = n + (suf ? '<sup>' + suf + '</sup>' : '');
    }
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      var e = 1 - Math.pow(1 - p, 4);
      out(end * e);
      if (p < 1) requestAnimationFrame(step); else out(end);
    })(t0);
  };

  /* ══════════════ GLITCH SCHEDULER ══════════════ */
  FX.glitch = function () {
    if (REDUCE) return;
    var items = $$('.glitch');
    if (!items.length) return;

    function fire(el) {
      el.classList.add('is-glitching');
      var ab = $('#fxAberration');
      if (ab) { ab.classList.add('is-hot'); setTimeout(function () { ab.classList.remove('is-hot'); }, 150); }
      setTimeout(function () { el.classList.remove('is-glitching'); }, 460);
    }
    (function cycle() {
      var wait = 2600 + Math.random() * 5200;
      setTimeout(function () {
        var vis = items.filter(function (el) {
          var r = el.getBoundingClientRect();
          return r.top < innerHeight && r.bottom > 0;
        });
        if (vis.length) fire(vis[(Math.random() * vis.length) | 0]);
        cycle();
      }, wait);
    })();

    items.forEach(function (el) {
      el.addEventListener('pointerenter', function () { fire(el); });
    });
  };

  /* ══════════════ SCROLL SPY + PROGRESS + HEADER ══════════════ */
  FX.scroll = function () {
    var bar = $('#scrollFill');
    var hdr = $('#hdr');
    var tlFill = $('#tlFill');
    var tl = $('.tl');
    var secs = $$('main section[id]');
    var railLinks = $$('.rail__list a');
    var navLinks = $$('.hdr__nav a');

    /* per-section palette rotation of the WebGL field */
    var HUES = { hero: 0, overview: 0.12, protocols: -0.22, core: 0.3, timeline: -0.1, archive: 0.42, uplink: -0.35 };

    var lastY = 0, ticking = false;

    function update() {
      ticking = false;
      var y = scrollY;
      var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      if (bar) bar.style.width = (y / max * 100).toFixed(2) + '%';

      if (hdr) {
        hdr.classList.toggle('is-stuck', y > 40);
        hdr.classList.toggle('is-hidden', y > 420 && y > lastY && !document.body.classList.contains('is-locked'));
      }
      lastY = y;

      /* timeline spine fill */
      if (tl && tlFill) {
        var r = tl.getBoundingClientRect();
        var prog = clamp((innerHeight * 0.75 - r.top) / r.height, 0, 1);
        tlFill.style.height = (prog * 100).toFixed(1) + '%';
      }

      /* active section */
      var mid = y + innerHeight * 0.38;
      var cur = 'hero';
      for (var i = 0; i < secs.length; i++) {
        var s = secs[i];
        if (s.offsetTop <= mid) cur = s.id;
      }
      if (cur === 'hero') cur = y < innerHeight * 0.6 ? 'hero' : cur;

      railLinks.forEach(function (a) {
        var k = a.getAttribute('data-rail');
        a.classList.toggle('is-active', k === cur || (k === 'top' && cur === 'hero'));
      });
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur);
      });

      if (window.AETHER && HUES[cur] !== undefined) window.AETHER.setHue(HUES[cur]);
    }

    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  };

  /* ══════════════ SMOOTH ANCHORS + DRAWER ══════════════ */
  FX.nav = function () {
    var drawer = $('#drawer');
    var burger = $('#burger');

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      if (burger) burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
    }

    if (burger && drawer) {
      burger.addEventListener('click', function () {
        var open = drawer.classList.toggle('is-open');
        drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('is-locked', open);
      });
    }
    addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeDrawer();
      var off = id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - 70;
      window.scrollTo({ top: Math.max(0, off), behavior: REDUCE ? 'auto' : 'smooth' });
      if (window.AETHER) window.AETHER.burst();
      history.replaceState(null, '', id === '#top' ? location.pathname : id);
    });
  };

  /* ══════════════ AMBIENT AUDIO (synthesised, no asset) ══════════════ */
  FX.audio = function () {
    var btn = $('#soundBtn');
    if (!btn) return;
    var ctxA = null, master = null, on = false, nodes = [];

    function build() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctxA = new AC();
      master = ctxA.createGain();
      master.gain.value = 0;
      master.connect(ctxA.destination);

      /* three detuned drones + a slow filtered noise bed */
      [55, 82.5, 110].forEach(function (f, i) {
        var o = ctxA.createOscillator();
        var g = ctxA.createGain();
        var lfo = ctxA.createOscillator();
        var lg = ctxA.createGain();
        o.type = i === 2 ? 'triangle' : 'sine';
        o.frequency.value = f;
        o.detune.value = (i - 1) * 7;
        g.gain.value = 0.11 / (i + 1);
        lfo.frequency.value = 0.05 + i * 0.03;
        lg.gain.value = 0.045;
        lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(master);
        o.start(); lfo.start();
        nodes.push(o, lfo);
      });

      var len = ctxA.sampleRate * 2;
      var buf = ctxA.createBuffer(1, len, ctxA.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
      var src = ctxA.createBufferSource();
      src.buffer = buf; src.loop = true;
      var flt = ctxA.createBiquadFilter();
      flt.type = 'bandpass'; flt.frequency.value = 420; flt.Q.value = 0.8;
      var ng = ctxA.createGain(); ng.gain.value = 0.02;
      src.connect(flt); flt.connect(ng); ng.connect(master);
      src.start();
      nodes.push(src);
      return true;
    }

    btn.addEventListener('click', function () {
      if (!ctxA && !build()) return;
      if (ctxA.state === 'suspended') ctxA.resume();
      on = !on;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var now = ctxA.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(on ? 0.5 : 0, now + (on ? 1.6 : 0.7));
    });
  };

  /* ══════════════ FAQ ACCORDION (delegated) ══════════════ */
  FX.faq = function () {
    document.addEventListener('click', function (e) {
      var q = e.target.closest ? e.target.closest('.faq__q') : null;
      if (!q) return;
      var item = q.parentElement;
      var open = item.classList.contains('is-open');
      $$('.faq__item').forEach(function (i) {
        i.classList.remove('is-open');
        var b = i.querySelector('.faq__q'); if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!open) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
    });
  };

  window.FX = FX;
})();
