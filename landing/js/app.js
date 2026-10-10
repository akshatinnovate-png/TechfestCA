/* ══════════════════════════════════════════════════════════════
   TECHFEST — concept landing page
   Event index + filters · countdown · deadline ticker ·
   canvas aether · reveals · counters · FAQ
   NOTE: this is a design study. Event details below are
   illustrative, not official Techfest data.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ════════ DATA ════════ */
  var CATS = [
    { k: 'all',      t: 'All' },
    { k: 'robotics', t: 'Robotics' },
    { k: 'software', t: 'Software' },
    { k: 'aero',     t: 'Aero' },
    { k: 'design',   t: 'Design & build' },
    { k: 'business', t: 'Business' },
    { k: 'workshop', t: 'Workshops' }
  ];

  var EVENTS = [
    { n: 'Robowars', c: 'robotics', door: 'compete', days: 12,
      d: 'Fifteen-kilo combat robots, one steel arena, three minutes a bout. The loudest ticket on campus.',
      m: [['Team', '2–6'], ['Weight', '15 kg'], ['Prize', '₹5,00,000']] },
    { n: 'Full Throttle', c: 'robotics', door: 'compete', days: 9,
      d: 'All-terrain RC machines against an obstacle course built to break them.',
      m: [['Team', '2–4'], ['Format', 'Time trial'], ['Prize', '₹2,00,000']] },
    { n: 'Meshmerize', c: 'robotics', door: 'compete', days: 18,
      d: 'A maze nobody has seen before and a bot that has to solve it alone. No remotes, no second attempt.',
      m: [['Team', '1–4'], ['Mode', 'Autonomous'], ['Prize', '₹2,00,000']] },
    { n: 'International Robotics Challenge', c: 'robotics', door: 'compete', days: 26,
      d: 'Qualifiers run in a dozen countries; the finalists fly in for the floor rounds.',
      m: [['Team', '2–5'], ['Rounds', 'Online + on-site'], ['Entry', 'Open']] },
    { n: 'Codefest', c: 'software', door: 'compete', days: 6,
      d: 'Competitive programming across three escalating rounds. Pure algorithms, no frameworks.',
      m: [['Team', 'Solo'], ['Rounds', '3'], ['Prize', '₹1,00,000']] },
    { n: '36-Hour Hackathon', c: 'software', door: 'compete', days: 15,
      d: 'A day and a half, one problem statement, and a demo that has to work by sunrise on the second day.',
      m: [['Team', '2–4'], ['Tracks', '6'], ['Prize', '₹3,00,000']] },
    { n: 'Aero Sprint', c: 'aero', door: 'compete', days: 21,
      d: 'Hand-built fixed-wing aircraft through a low-altitude pylon course. Scored on time and on landing intact.',
      m: [['Team', '2–4'], ['Span', '< 1.5 m'], ['Laps', '3']] },
    { n: 'Drone Rush', c: 'aero', door: 'compete', days: 11,
      d: 'FPV quadcopter racing through a lit gate circuit after dark.',
      m: [['Team', '1–2'], ['Class', '5 inch'], ['Heats', '4']] },
    { n: 'Micromouse', c: 'robotics', door: 'compete', days: 24,
      d: 'The oldest problem in the book: smallest robot, fastest maze, no human input.',
      m: [['Team', '1–3'], ['Mode', 'Autonomous'], ['Prize', '₹75,000']] },
    { n: 'Case Challenge', c: 'business', door: 'compete', days: 8,
      d: 'A real operations problem from a partner firm, judged by the people who own it.',
      m: [['Team', '2–4'], ['Rounds', '2'], ['Prize', '₹1,50,000']] },
    { n: 'Design-a-Thon', c: 'design', door: 'compete', days: 16,
      d: 'Forty-eight hours from brief to working prototype, with a fabrication lab on site.',
      m: [['Team', '2–5'], ['Lab', 'On site'], ['Prize', '₹1,00,000']] },
    { n: 'Drone Build Workshop', c: 'workshop', door: 'learn', days: 5,
      d: 'Build and fly a quadcopter from parts across two days. The hardware goes home with you.',
      m: [['Level', 'Beginner'], ['Days', '2'], ['Kit', 'Included']] },
    { n: 'Embedded Systems', c: 'workshop', door: 'learn', days: 13,
      d: 'From bare-metal registers to a working sensor node, on real boards rather than simulators.',
      m: [['Level', 'Intermediate'], ['Days', '2'], ['Kit', 'Included']] },
    { n: 'Applied ML', c: 'workshop', door: 'learn', days: 19,
      d: 'Train, break and fix a model on a messy real dataset. Bring a laptop.',
      m: [['Level', 'Intermediate'], ['Days', '2'], ['Kit', 'Digital']] },
    { n: 'CAD & Fabrication', c: 'workshop', door: 'learn', days: 23,
      d: 'Model it, print it, mill it, then find out why the tolerances were wrong.',
      m: [['Level', 'Beginner'], ['Days', '2'], ['Kit', 'Included']] },
    { n: 'Exhibition Floor', c: 'design', door: 'witness', days: 40,
      d: 'Humanoids, hyperloop pods and defence hardware parked on the lawn for three days.',
      m: [['Entry', 'Free'], ['Pavilions', '8'], ['Open', 'All 3 days']] }
  ];

  var SPEAKERS = [
    { n: 'A Nobel laureate', r: 'PHYSICS', d: 'Techfest has hosted several; the Ignite stage has a habit of it.' },
    { n: 'A mission astronaut', r: 'SPACEFLIGHT', d: 'On what the first ninety seconds actually feel like.' },
    { n: 'A robotics founder', r: 'INDUSTRY', d: 'How a lab demo becomes a product people are allowed to stand next to.' },
    { n: 'A climate engineer', r: 'ENERGY', d: 'Grid-scale storage, and why the hard part was never the battery.' },
    { n: 'An AI researcher', r: 'COMPUTATION', d: 'Where the current generation of models genuinely falls over.' },
    { n: 'A materials scientist', r: 'MATERIALS', d: 'Things that are strong because of their geometry, not their chemistry.' }
  ];

  var FAQS = [
    { q: 'Do I need to pay to attend?', a: 'Entry to the campus, the exhibition floor and the Ignite lectures is free. Individual competitions and workshops carry their own registration fee, shown on each event. Early registration is cheaper.' },
    { q: 'I have never competed before. Is there anything for me?', a: 'Yes. Roughly half the index is built for first-timers — the beginner workshops assume no background, and several competitions run a separate novice bracket.' },
    { q: 'Where is it, and when?', a: 'IIT Bombay, Powai, Mumbai, over three days in December. Most competitions run online preliminary rounds through November so you can qualify from anywhere.' },
    { q: 'Is accommodation available?', a: 'On-campus accommodation is offered to registered participants at a subsidised rate, allocated first-come. Campus ambassadors with strong numbers get it covered.' },
    { q: 'Can I enter more than one event?', a: 'You can, and most people do. The schedule is built so the major finals do not collide, and your account flags a clash before you register for the second one.' }
  ];

  var NOTES = [
    { t: 'A1', h: 'Answer the three questions first', p: 'The live site leads with atmosphere and makes you scroll to learn what this is, when it happens and what to do. Here the fold carries the name, the dates, a countdown and one primary action — the art works around them rather than instead of them.' },
    { t: 'A2', h: 'Sort by intent, not by department', p: 'A visitor arrives wanting to compete, to learn, or to watch. The three doors route on that, instead of asking them to guess whether what they want lives under Events, Competitions or Workshops.' },
    { t: 'A3', h: 'One index, searchable', p: 'Navigation on the live site is split across a top bar, a left rail and a social rail with overlapping items. Everything collapses into a single filterable index with a search box and a visible deadline per event.' },
    { t: 'A4', h: 'Make the deadline the headline', p: '"Early bird" is a small tag today. Here it is a live ticker with days remaining, because a date you can feel moving is the thing that converts.' },
    { t: 'A5', h: 'Spend the scale', p: 'Thirty years, a six-figure footfall and thousands of colleges are the strongest proof Techfest has. They belong above the fold, not in an About page.' },
    { t: 'A6', h: 'Let the type carry the theme', p: 'The Aetherial Renaissance identity is kept through a serif display face, ink and molten gold — not through heavy ornamental frames that fight the content and push body copy onto busy art.' }
  ];

  /* ════════ CANVAS AETHER (2D — no 3D assets) ════════ */
  (function aether() {
    var cv = $('#aether');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;
    var W = 0, H = 0, R = Math.min(devicePixelRatio || 1, 2);
    var motes = [], t = 0;
    var mouse = { x: -999, y: -999 };

    function size() {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.max(1, W * R); cv.height = Math.max(1, H * R);
      ctx.setTransform(R, 0, 0, R, 0, 0);
      var n = Math.round(Math.min(90, Math.max(26, (W * H) / 22000)));
      motes = [];
      for (var i = 0; i < n; i++) {
        motes.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.7 + 0.5,
          sp: Math.random() * 0.22 + 0.05,
          ph: Math.random() * 6.28,
          am: Math.random() * 26 + 8,
          gold: Math.random() < 0.42
        });
      }
    }
    size();
    addEventListener('resize', size, { passive: true });
    addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });

    function draw() {
      requestAnimationFrame(draw);
      t += 0.0055;
      ctx.clearRect(0, 0, W, H);

      /* slow horizontal light bands, like dust in a shaft */
      for (var b = 0; b < 3; b++) {
        var y = H * (0.22 + b * 0.27) + Math.sin(t * (1 + b * 0.4)) * H * 0.05;
        var g = ctx.createLinearGradient(0, y - 90, 0, y + 90);
        g.addColorStop(0, 'rgba(224,177,92,0)');
        g.addColorStop(0.5, b === 1 ? 'rgba(95,211,196,.035)' : 'rgba(224,177,92,.045)');
        g.addColorStop(1, 'rgba(224,177,92,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, y - 90, W, 180);
      }

      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.y -= m.sp;
        if (m.y < -12) { m.y = H + 12; m.x = Math.random() * W; }
        var x = m.x + Math.sin(t * 2.2 + m.ph) * m.am;

        /* motes drift away from the pointer */
        var dx = x - mouse.x, dy = m.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 24000 && d2 > 1) {
          var d = Math.sqrt(d2), push = (1 - d / 155) * 26;
          x += (dx / d) * push;
        }

        var tw = 0.45 + 0.55 * Math.sin(t * 9 + m.ph);
        ctx.beginPath();
        ctx.arc(x, m.y, m.r * (0.8 + tw * 0.5), 0, 6.283);
        ctx.fillStyle = m.gold
          ? 'rgba(224,177,92,' + (0.22 + tw * 0.5).toFixed(3) + ')'
          : 'rgba(246,241,231,' + (0.14 + tw * 0.3).toFixed(3) + ')';
        ctx.shadowColor = m.gold ? 'rgba(224,177,92,.8)' : 'rgba(246,241,231,.5)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    if (!REDUCE) draw(); else { t = 1; ctx.clearRect(0, 0, W, H); }
  })();

  /* ════════ COUNTDOWN ════════ */
  (function countdown() {
    function target() {
      var now = new Date();
      var d = new Date(now.getFullYear(), 11, 16, 9, 0, 0);
      if (now > d) d = new Date(now.getFullYear() + 1, 11, 16, 9, 0, 0);
      return d;
    }
    var T = target();
    var el = { D: $('#cD'), H: $('#cH'), M: $('#cM'), S: $('#cS') };
    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      var ms = Math.max(0, T - new Date());
      if (el.D) el.D.textContent = Math.floor(ms / 864e5);
      if (el.H) el.H.textContent = pad(Math.floor(ms / 36e5) % 24);
      if (el.M) el.M.textContent = pad(Math.floor(ms / 6e4) % 60);
      if (el.S) el.S.textContent = pad(Math.floor(ms / 1e3) % 60);
    }
    tick(); setInterval(tick, 1000);
    var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  })();

  /* ════════ DEADLINE TICKER ════════ */
  (function ticker() {
    var track = $('#tickTrack');
    if (!track) return;
    var soon = EVENTS.slice().sort(function (a, b) { return a.days - b.days; }).slice(0, 8);
    var html = soon.map(function (e) {
      return '<span class="tick__it"><b>' + e.n + '</b><s>registration closes in</s><em>' + e.days + ' days</em></span>';
    }).join('');
    track.innerHTML = html + html;
  })();

  /* ════════ EVENT INDEX ════════ */
  (function explorer() {
    var grid = $('#grid'), chips = $('#chips'), q = $('#q');
    var qClear = $('#qClear'), empty = $('#empty'), countLine = $('#countLine');
    if (!grid) return;

    var active = 'all', term = '';

    CATS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (c.k === 'all' ? ' on' : '');
      b.textContent = c.t;
      b.dataset.k = c.k;
      b.setAttribute('aria-pressed', c.k === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () { active = c.k; render(); });
      chips.appendChild(b);
    });

    function matches(e) {
      if (active !== 'all' && e.c !== active) return false;
      if (!term) return true;
      var hay = (e.n + ' ' + e.d + ' ' + e.c).toLowerCase();
      return hay.indexOf(term) > -1;
    }

    function render() {
      $$('.chip', chips).forEach(function (b) {
        var on = b.dataset.k === active;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      var list = EVENTS.filter(matches);
      countLine.textContent = list.length + (list.length === 1 ? ' event' : ' events')
        + (active === 'all' ? '' : ' in ' + (CATS.filter(function (c) { return c.k === active; })[0] || {}).t)
        + (term ? ' matching “' + term + '”' : '');

      grid.innerHTML = list.map(function (e, i) {
        var urgent = e.days <= 10;
        var pct = Math.max(4, Math.min(100, Math.round((1 - e.days / 42) * 100)));
        return '<article class="card" style="animation-delay:' + (i * 32) + 'ms">' +
          '<div class="card__top">' +
            '<span class="card__cat">' + ((CATS.filter(function (c) { return c.k === e.c; })[0] || {}).t || e.c) + '</span>' +
            '<span class="card__d ' + (urgent ? 'soon' : 'open') + '">' +
              (urgent ? '● ' : '○ ') + e.days + 'd left</span>' +
          '</div>' +
          '<h3>' + e.n + '</h3>' +
          '<p>' + e.d + '</p>' +
          '<div class="card__meta">' +
            e.m.map(function (x) { return '<span>' + x[0] + ' <b>' + x[1] + '</b></span>'; }).join('') +
          '</div>' +
          '<div class="card__bar"><i data-w="' + pct + '"></i></div>' +
        '</article>';
      }).join('');

      requestAnimationFrame(function () {
        $$('.card__bar i', grid).forEach(function (b) { b.style.width = b.dataset.w + '%'; });
      });

      empty.hidden = list.length > 0;
    }

    q.addEventListener('input', function () {
      term = q.value.trim().toLowerCase();
      qClear.hidden = !term;
      render();
    });
    qClear.addEventListener('click', function () {
      q.value = ''; term = ''; qClear.hidden = true; q.focus(); render();
    });
    $('#reset').addEventListener('click', function () {
      active = 'all'; term = ''; q.value = ''; qClear.hidden = true; render();
    });

    /* the three doors drive the same index */
    $$('.door').forEach(function (d) {
      d.addEventListener('click', function () {
        var door = d.dataset.door;
        active = door === 'learn' ? 'workshop' : 'all';
        term = '';
        q.value = '';
        qClear.hidden = true;
        if (door === 'witness') { active = 'all'; term = 'exhibition'; q.value = 'exhibition'; qClear.hidden = false; }
        render();
        $('#explore').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
      });
      d.addEventListener('pointermove', function (e) {
        var r = d.getBoundingClientRect();
        d.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        d.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });

    render();
  })();

  /* ════════ SPEAKER RAIL ════════ */
  (function rail() {
    var r = $('#rail');
    if (!r) return;
    r.innerHTML = SPEAKERS.map(function (s) {
      var initials = s.n.replace(/^(A|An)\s+/i, '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
      return '<article class="spk">' +
        '<span class="spk__av" aria-hidden="true">' + initials + '</span>' +
        '<span class="spk__r">' + s.r + '</span>' +
        '<h3>' + s.n + '</h3><p>' + s.d + '</p></article>';
    }).join('');

    /* drag to pan */
    var down = false, sx = 0, sl = 0;
    r.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; sl = r.scrollLeft; r.setPointerCapture(e.pointerId); });
    r.addEventListener('pointermove', function (e) { if (down) r.scrollLeft = sl - (e.clientX - sx); });
    r.addEventListener('pointerup', function () { down = false; });
    r.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { r.scrollLeft += 300; e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { r.scrollLeft -= 300; e.preventDefault(); }
    });
  })();

  /* ════════ FAQ + NOTES ════════ */
  (function lists() {
    var f = $('#faqList');
    if (f) {
      f.innerHTML = FAQS.map(function (x, i) {
        return '<div class="faq__i"><button class="faq__q" type="button" aria-expanded="false" aria-controls="fa' + i + '">' +
          x.q + '<i aria-hidden="true"></i></button>' +
          '<div class="faq__a" id="fa' + i + '"><div><p>' + x.a + '</p></div></div></div>';
      }).join('');
      f.addEventListener('click', function (e) {
        var b = e.target.closest('.faq__q');
        if (!b) return;
        var item = b.parentElement, was = item.classList.contains('open');
        $$('.faq__i', f).forEach(function (i2) {
          i2.classList.remove('open');
          i2.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        });
        if (!was) { item.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
      });
    }
    var n = $('#notesGrid');
    if (n) {
      n.innerHTML = NOTES.map(function (x) {
        return '<div class="note"><b>' + x.t + '</b><h3>' + x.h + '</h3><p>' + x.p + '</p></div>';
      }).join('');
    }
  })();

  /* ════════ REGISTER FORM (demo) ════════ */
  (function reg() {
    var f = $('#regForm');
    if (!f) return;
    var mail = $('#regMail'), note = $('#regNote'), btn = $('#regBtn');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim());
      mail.classList.toggle('bad', !ok);
      if (!ok) {
        note.textContent = 'That email does not look right.';
        note.className = 'reg__note bad';
        return;
      }
      btn.textContent = 'Creating…';
      note.textContent = 'Concept demo — nothing is sent anywhere.';
      note.className = 'reg__note';
      setTimeout(function () {
        btn.textContent = 'Account created ✓';
        note.textContent = 'In the real thing this is where your event schedule would start.';
        note.className = 'reg__note ok';
        setTimeout(function () {
          btn.textContent = 'Create account';
          note.textContent = 'Concept demo — this form validates and resets, it does not send anything.';
          note.className = 'reg__note';
          f.reset();
        }, 3600);
      }, 900);
    });
    mail.addEventListener('input', function () { mail.classList.remove('bad'); });
  })();

  /* ════════ REVEALS + COUNTERS ════════ */
  (function reveals() {
    var els = $$('[data-rv]');
    function countUp(el) {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      var end = parseFloat(el.dataset.n) || 0;
      var dec = parseInt(el.dataset.dec || '0', 10);
      var suf = el.dataset.suf || '';
      var t0 = performance.now(), dur = 1700;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var v = end * (1 - Math.pow(1 - p, 4));
        el.innerHTML = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) +
          (suf ? '<sup>' + suf + '</sup>' : '');
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      $$('[data-n]').forEach(countUp);
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        $$('[data-n]', en.target).forEach(countUp);
        if (en.target.matches('[data-n]')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e, i) {
      var sibs = e.parentElement ? $$('[data-rv]', e.parentElement) : [];
      if (sibs.length > 1) e.style.setProperty('--d', (sibs.indexOf(e) * 80) + 'ms');
      io.observe(e);
    });
  })();

  /* ════════ NAV + SPOTLIGHT ════════ */
  (function chrome() {
    var nav = $('#nav'), burger = $('#burger'), drawer = $('#drawer'), spot = $('#spot');
    addEventListener('scroll', function () {
      nav.classList.toggle('stuck', scrollY > 10);
    }, { passive: true });

    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    if (!REDUCE) {
      var tx = 50, ty = 30, cx = 50, cy = 30, raf = 0;
      addEventListener('pointermove', function (e) {
        tx = (e.clientX / innerWidth) * 100;
        ty = (e.clientY / innerHeight) * 100;
        if (!raf) raf = requestAnimationFrame(run);
      }, { passive: true });
      function run() {
        raf = 0;
        cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
        spot.style.setProperty('--x', cx.toFixed(2) + '%');
        spot.style.setProperty('--y', cy.toFixed(2) + '%');
        if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) raf = requestAnimationFrame(run);
      }
    }
  })();
})();
