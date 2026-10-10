/* ══════════════════════════════════════════════════════════════
   CYBORG ASCENSION — main.js
   Boot sequence · content injection · core schematic logic ·
   carousel · uplink form · HUD telemetry · overdrive easter egg
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════ DATA ══════════════ */
  var MARQUEE = [
    'ROBOWARS', '◆', 'MESHMERIZE', '◆', 'HACKATHON', '◆', 'IGNITE',
    '◆', 'AERO SPRINT', '◆', 'FULL THROTTLE', '◆', 'INTERNATIONAL ROBOTICS',
    '◆', 'CAMPUS AMBASSADOR', '◆', 'EXHIBITIONS', '◆', 'LECTURE SERIES'
  ];

  var CORE_NODES = [
    {
      title: 'CRANIAL ARRAY',
      tag: 'NODE 00 · COGNITION',
      body: 'Sixteen billion synthetic synapses laid over the original cortex. Latency between thought and action drops below four milliseconds — fast enough that intention and motion feel like the same event.',
      meta: ['NEURAL LACE', 'OPTIC ARRAY', '4 ms LATENCY'],
      bars: [['SYNAPTIC LOAD', 94], ['THERMAL', 38], ['INTEGRITY', 99]]
    },
    {
      title: 'SINISTRAL LIMB',
      tag: 'NODE 01 · PRECISION',
      body: 'The left arm trades raw force for resolution. Micro-actuators in each phalanx resolve to two microns — thread a capillary, solder a die, hold a hand without bruising it.',
      meta: ['2 µm RESOLUTION', 'HAPTIC MESH', 'TOOL BUS'],
      bars: [['ARTICULATION', 97], ['TORQUE', 54], ['INTEGRITY', 92]]
    },
    {
      title: 'DEXTRAL LIMB',
      tag: 'NODE 02 · FORCE',
      body: 'The right arm is the blunt instrument. Nine hundred kilos of clean lift, a shoulder joint rated for a million cycles, and a palm that can hold a plasma arc without flinching.',
      meta: ['900 kg LIFT', 'ARC SHIELD', '10⁶ CYCLES'],
      bars: [['TORQUE', 99], ['ARTICULATION', 71], ['INTEGRITY', 88]]
    },
    {
      title: 'THORACIC CORE',
      tag: 'NODE 03 · THE HEART',
      body: 'A contained fusion cell, suspended in a magnetic cradle behind the sternum. It beats — not because it needs to, but because the body refused to accept a heart that did not.',
      meta: ['12.8 TJ', 'MAG CRADLE', 'SELF-SEALING'],
      bars: [['OUTPUT', 100], ['CONTAINMENT', 96], ['INTEGRITY', 100]]
    },
    {
      title: 'LOCOMOTIVE FRAME',
      tag: 'NODE 04 · MOTION',
      body: 'Carbon-lattice femurs and tendon springs that recapture eighty-one percent of every landing. It does not walk so much as it falls forward, endlessly, and catches itself.',
      meta: ['81% RECAPTURE', '64 km/h', 'SILENT GAIT'],
      bars: [['KINETIC RECOVERY', 81], ['STABILITY', 93], ['INTEGRITY', 95]]
    }
  ];

  var QUOTES = [
    { t: 'I walked in as a student and walked out as a node in something much larger. Three days rewired how I think about building things.', n: 'ANANYA R.', r: 'CAMPUS AMBASSADOR · NIT TRICHY' },
    { t: 'The scale is genuinely difficult to describe. Robots the size of cars, a hackathon that never sleeps, and a crowd that actually understands what you built.', n: 'KARTIK M.', r: 'FINALIST · ROBOWARS' },
    { t: 'As an ambassador I brought forty people from my campus. Every one of them came back with a project they are still working on.', n: 'ZAINAB S.', r: 'CAMPUS AMBASSADOR · VIT VELLORE' },
    { t: 'Techfest is the only place where a first-year and a research scientist argue about the same circuit for two hours and both leave smarter.', n: 'DEV P.', r: 'WORKSHOP LEAD' }
  ];

  var FAQS = [
    { q: 'What exactly does a Campus Ambassador do?', a: 'You are the Techfest signal on your campus. You promote events, build a team, run local outreach and help your peers register. In return you get certification, merchandise, priority access, accommodation support for top performers and a direct line to the core team.' },
    { q: 'Is there a cost to participate?', a: 'The Campus Ambassador programme is completely free. Individual competitions and workshops may have nominal registration fees, which are listed on each event page. Early-bird registrations receive a discount.' },
    { q: 'Do I need prior technical experience?', a: 'No. Tracks run from absolute beginner workshops to international-level robotics finals. The programme is built so that a first-year with curiosity and a final-year with a patent both find their level.' },
    { q: 'Where and when does it happen?', a: 'IIT Bombay, Powai, Mumbai — 16 to 18 December. Online preliminary rounds for most competitions run through November, so you can qualify from anywhere in the country.' },
    { q: 'Is accommodation provided?', a: 'Yes. On-campus accommodation is available for registered participants at subsidised rates, and is complimentary for top-performing Campus Ambassadors. Details go out with your confirmation.' }
  ];

  var BOOT_LOG = [
    'initialising aether bus <b>· ok</b>',
    'mounting neural lace <b>· ok</b>',
    'calibrating optic array <em>[12 spectra]</em>',
    'spinning up plasma heart <b>· ok</b>',
    'handshake with <em>IIT BOMBAY // TECHFEST</em>',
    'synchronising 30<sup>th</sup> edition manifest',
    'consciousness online <b>· ready</b>'
  ];

  /* ══════════════ CONTENT INJECTION ══════════════ */
  function injectMarquee() {
    var track = $('#marqueeTrack');
    if (!track) return;
    var html = '';
    MARQUEE.forEach(function (w) {
      html += w === '◆' ? '<i>◆</i>' : (w.indexOf('AMBASSADOR') > -1 ? '<b>' + w + '</b>' : w);
    });
    /* duplicated once so the -50% keyframe loops seamlessly */
    track.innerHTML = '<span>' + html + '</span><span>' + html + '</span>';
  }

  function injectQuotes() {
    var track = $('#quotesTrack');
    var dots = $('#quotesDots');
    if (!track || !dots) return;

    track.innerHTML = QUOTES.map(function (q) {
      return '<figure class="quote">' +
        '<span class="quote__mark" aria-hidden="true">&ldquo;</span>' +
        '<blockquote class="quote__txt">' + q.t + '</blockquote>' +
        '<figcaption class="quote__who"><b>' + q.n + '</b><i>' + q.r + '</i></figcaption>' +
        '</figure>';
    }).join('');

    dots.innerHTML = QUOTES.map(function (_, i) {
      return '<button type="button" aria-label="Go to quote ' + (i + 1) + '"' +
        (i === 0 ? ' class="is-on"' : '') + ' data-q="' + i + '"></button>';
    }).join('');

    var idx = 0, timer = 0;
    function go(i) {
      idx = (i + QUOTES.length) % QUOTES.length;
      track.style.translate = (-idx * 100) + '% 0';
      $$('button', dots).forEach(function (b, k) { b.classList.toggle('is-on', k === idx); });
    }
    function auto() {
      clearInterval(timer);
      if (REDUCE) return;
      timer = setInterval(function () { go(idx + 1); }, 6500);
    }

    $('.quotes__nav--prev').addEventListener('click', function () { go(idx - 1); auto(); });
    $('.quotes__nav--next').addEventListener('click', function () { go(idx + 1); auto(); });
    dots.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-q]');
      if (b) { go(+b.dataset.q); auto(); }
    });

    /* swipe */
    var sx = 0;
    track.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    track.addEventListener('pointerup', function (e) {
      var d = e.clientX - sx;
      if (Math.abs(d) > 46) { go(idx + (d < 0 ? 1 : -1)); auto(); }
    });

    auto();
  }

  function injectFaq() {
    var list = $('#faqList');
    if (!list) return;
    list.innerHTML = FAQS.map(function (f, i) {
      var id = 'faq-' + i;
      return '<div class="faq__item">' +
        '<button class="faq__q" type="button" aria-expanded="false" aria-controls="' + id + '" data-cursor="OPEN">' +
          '<em>' + String(i + 1).padStart(2, '0') + '</em>' + f.q + '<i aria-hidden="true"></i>' +
        '</button>' +
        '<div class="faq__a" id="' + id + '"><div><p>' + f.a + '</p></div></div>' +
      '</div>';
    }).join('');
  }

  /* ══════════════ CORE SCHEMATIC ══════════════ */
  function initCore() {
    var readout = $('#coreReadout');
    var bars = $('#coreBars');
    var tabs = $$('.core__tabs button');
    var hots = $$('.hot');
    if (!readout || !bars) return;

    function paint(i) {
      var d = CORE_NODES[i];
      if (!d) return;

      readout.classList.add('is-swapping');
      setTimeout(function () {
        readout.innerHTML =
          '<span class="tagline">' + d.tag + '</span>' +
          '<h3>' + d.title + '</h3>' +
          '<p>' + d.body + '</p>' +
          '<div class="meta">' + d.meta.map(function (m) { return '<span>' + m + '</span>'; }).join('') + '</div>';
        readout.classList.remove('is-swapping');

        bars.innerHTML = d.bars.map(function (b) {
          return '<div class="bar"><div class="bar__top"><span>' + b[0] + '</span><b>' + b[1] + '%</b></div>' +
                 '<div class="bar__rail"><i class="bar__fill"></i></div></div>';
        }).join('');
        requestAnimationFrame(function () {
          $$('.bar__fill', bars).forEach(function (f, k) {
            setTimeout(function () { f.style.width = d.bars[k][1] + '%'; }, k * 110);
          });
        });
      }, 160);

      tabs.forEach(function (t, k) {
        t.classList.toggle('is-on', k === i);
        t.setAttribute('aria-selected', k === i ? 'true' : 'false');
      });
      hots.forEach(function (h, k) { h.classList.toggle('is-on', k === i); });

      if (window.CORE_RIG) { window.CORE_RIG.select(i); window.CORE_RIG.face(i); }
      if (window.AETHER) window.AETHER.burst();
    }

    tabs.forEach(function (t) { t.addEventListener('click', function () { paint(+t.dataset.tab); }); });
    hots.forEach(function (h) { h.addEventListener('click', function () { paint(+h.dataset.node); }); });

    paint(0);
  }

  /* ══════════════ UPLINK FORM ══════════════ */
  function initForm() {
    var form = $('#uplinkForm');
    if (!form) return;
    var note = $('#formNote');
    var label = $('#submitLabel');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('.field', form).forEach(function (f) {
        var input = f.querySelector('input');
        if (!input) return;
        var bad = input.hasAttribute('required') &&
          (!input.value.trim() || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value)));
        f.classList.toggle('is-bad', bad);
        if (bad) ok = false;
      });

      if (!ok) {
        note.textContent = '✖ TRANSMISSION REJECTED — CHECK HIGHLIGHTED FIELDS';
        note.className = 'uplink__note is-bad';
        form.animate(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' },
           { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }],
          { duration: 300, easing: 'ease-in-out' }
        );
        return;
      }

      /* simulated uplink — front-end demo, no backend attached */
      var steps = ['ENCRYPTING…', 'ROUTING VIA AETHER BUS…', 'HANDSHAKE…', 'TRANSMITTED'];
      var i = 0;
      label.textContent = steps[0];
      note.textContent = 'Opening channel…';
      note.className = 'uplink__note';
      var iv = setInterval(function () {
        i++;
        if (i < steps.length) { label.textContent = steps[i]; return; }
        clearInterval(iv);
        note.textContent = '✔ UPLINK ESTABLISHED — WELCOME TO THE LATTICE, AMBASSADOR';
        note.className = 'uplink__note is-ok';
        label.textContent = 'TRANSMITTED';
        if (window.AETHER) window.AETHER.burst();
        setTimeout(function () {
          label.textContent = 'TRANSMIT APPLICATION';
          note.textContent = 'Encrypted end-to-end. No signal leaves the lattice.';
          note.className = 'uplink__note';
          form.reset();
        }, 4200);
      }, 620);
    });

    $$('.field input', form).forEach(function (i) {
      i.addEventListener('input', function () { i.closest('.field').classList.remove('is-bad'); });
    });
  }

  /* ══════════════ HUD TELEMETRY ══════════════ */
  function initHud() {
    var clock = $('#hudClock');
    var dClock = $('#drawerClock');
    var sync = $('#hudSync');
    var sys = $('#hudSys');
    var yr = $('#yr');
    if (yr) yr.textContent = new Date().getFullYear();

    /* 16 Dec of the nearest upcoming edition */
    function targetDate() {
      var now = new Date();
      var y = now.getFullYear();
      var d = new Date(y, 11, 16, 9, 0, 0);
      if (now > d) d = new Date(y + 1, 11, 16, 9, 0, 0);
      return d;
    }
    var target = targetDate();

    function tick() {
      var now = new Date();
      var diff = Math.max(0, target - now);
      var days = Math.floor(diff / 86400000);
      var hrs  = Math.floor(diff / 3600000) % 24;
      var mins = Math.floor(diff / 60000) % 60;
      var secs = Math.floor(diff / 1000) % 60;
      var pad = function (n) { return String(n).padStart(2, '0'); };
      if (clock) clock.textContent = days + 'D ' + pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
      if (dClock) dClock.textContent = days + 'D ' + pad(hrs) + ':' + pad(mins);
      if (sync) sync.textContent = (98 + Math.floor(Math.random() * 3)) + '%';
    }
    tick();
    setInterval(tick, 1000);

    if (sys) {
      var states = ['NOMINAL', 'NOMINAL', 'NOMINAL', 'RESONANT', 'NOMINAL', 'OPTIMAL'];
      setInterval(function () {
        sys.textContent = states[(Math.random() * states.length) | 0];
      }, 4800);
    }
  }

  /* ══════════════ OVERDRIVE EASTER EGG ══════════════ */
  function initEgg() {
    var seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var pos = 0;
    addEventListener('keydown', function (e) {
      var k = e.key;
      if (k && k.toLowerCase() === String(seq[pos]).toLowerCase()) {
        pos++;
        if (pos === seq.length) {
          pos = 0;
          document.body.classList.toggle('is-overdrive');
          var on = document.body.classList.contains('is-overdrive');
          if (window.AETHER) window.AETHER.setHue(on ? 2.1 : 0);
          var t = document.createElement('div');
          t.className = 'overdrive-toast';
          t.textContent = on ? '⚡ OVERDRIVE ENGAGED' : 'OVERDRIVE DISENGAGED';
          document.body.appendChild(t);
          setTimeout(function () { t.remove(); }, 2600);
        }
      } else {
        pos = (k === seq[0]) ? 1 : 0;
      }
    });
  }

  /* ══════════════ BOOT SEQUENCE ══════════════ */
  function runBoot() {
    var boot = $('#boot');
    var prog = $('#bootProg');
    var pct = $('#bootPct');
    var log = $('#bootLog');
    var enter = $('#bootEnter');
    var CIRC = 603;

    function finish() {
      if (!boot || boot.classList.contains('is-gone')) return;
      boot.classList.add('is-gone');
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      setTimeout(function () { if (boot.parentNode) boot.remove(); }, 1000);

      /* hero cascade */
      $$('.hero [data-reveal]').forEach(function (el, i) {
        el.style.setProperty('--d', (160 + i * 130) + 'ms');
        el.classList.add('is-in');
      });
      $$('.hero .char').forEach(function (c) { c.classList.add('is-in'); });
      $$('.hero [data-count]').forEach(function (el) {
        setTimeout(function () { window.FX.odometer(el); }, 900);
      });
      if (window.AETHER) window.AETHER.burst();
    }

    if (!boot) { finish(); return; }
    if (REDUCE) { setTimeout(finish, 180); return; }

    var p = 0, li = 0;
    var iv = setInterval(function () {
      p += Math.random() * 11 + 4;
      if (p > 100) p = 100;
      if (pct) pct.textContent = String(Math.floor(p)).padStart(2, '0');
      if (prog) prog.style.strokeDashoffset = String(CIRC - (CIRC * p / 100));

      var want = Math.min(BOOT_LOG.length, Math.floor(p / 100 * BOOT_LOG.length) + 1);
      while (li < want && log) {
        var el = document.createElement('li');
        el.innerHTML = '<span style="color:#35f0ff">&gt;</span> ' + BOOT_LOG[li];
        el.style.animationDelay = '0ms';
        log.appendChild(el);
        li++;
      }

      if (p >= 100) {
        clearInterval(iv);
        setTimeout(function () {
          if (enter) { enter.hidden = false; enter.addEventListener('click', finish); enter.focus(); }
          /* auto-enter if nobody clicks */
          setTimeout(finish, 4800);
        }, 420);
      }
    }, 190);

    /* let keyboard users skip */
    addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') finish();
    }, { once: true });
  }

  /* ══════════════ INIT ══════════════ */
  function init() {
    injectMarquee();
    injectQuotes();
    injectFaq();

    var FX = window.FX || {};
    if (FX.cursor)   FX.cursor();
    if (FX.reveal)   FX.reveal();
    if (FX.magnetic) FX.magnetic();
    if (FX.tilt)     FX.tilt();
    if (FX.glitch)   FX.glitch();
    if (FX.scroll)   FX.scroll();
    if (FX.nav)      FX.nav();
    if (FX.audio)    FX.audio();
    if (FX.faq)      FX.faq();

    initCore();
    initForm();
    initHud();
    initEgg();
    runBoot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
