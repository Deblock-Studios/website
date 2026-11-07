/* ═══════════════════════════════════════════════════════════
   DEBLOCK STUDIOS — theme.js
   Switches between the classic theme and Material 3 Expressive,
   plus light/dark inside Material. Both choices are persisted.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var UI_KEY = 'ds-ui';
  var MODE_KEY = 'ds-mode';
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  var LABELS = {
    fr: { group: 'Thème du site', dark: 'Activer le mode sombre', light: 'Activer le mode clair' },
    en: { group: 'Site theme', dark: 'Switch to dark mode', light: 'Switch to light mode' },
  };

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  }

  function currentUI() {
    return root.getAttribute('data-ui') === 'classic' ? 'classic' : 'material';
  }
  function currentMode() {
    var mode = root.getAttribute('data-mode');
    if (mode === 'dark' || mode === 'light') return mode;
    return mq && mq.matches ? 'dark' : 'light';
  }
  function currentLang() {
    return window.i18n && window.i18n.currentLang === 'en' ? 'en' : 'fr';
  }

  /* ── Controls ── */
  function sync() {
    var ui = currentUI();
    var mode = currentMode();
    var dict = LABELS[currentLang()];

    document.querySelectorAll('[data-ui-choice]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-ui-choice') === ui ? 'true' : 'false');
    });

    document.querySelectorAll('[data-mode-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', mode === 'dark' ? dict.light : dict.dark);
      btn.setAttribute('title', mode === 'dark' ? dict.light : dict.dark);
    });

    document.querySelectorAll('[data-theme-group]').forEach(function (el) {
      el.setAttribute('aria-label', dict.group);
    });
  }

  /* ── Expressive flower shapes (M3 shape library) ──
     The silhouette is the union of `petals` discs laid around the
     centre: the rim bulges out into rounded petals and dips into
     sharp notches between them, which reads as a flower instead of
     a wobbly circle. Radii are expressed in box fractions (0.5 max). */
  var R_MAX = 0.485;

  /* Distance at which a ray leaves a disc of radius `rd` centred
     `dc` from the origin on the bisector direction. */
  function petalGeometry(petals, rMin) {
    var alpha = Math.PI / petals;
    var lo = 1e-4;
    var hi = R_MAX;
    var sinA = Math.sin(alpha);

    for (var k = 0; k < 48; k++) {
      var rd = (lo + hi) / 2;
      var dc = R_MAX - rd;
      var s = rd * rd - dc * dc * sinA * sinA;
      var valley = s <= 0 ? 0 : dc * Math.cos(alpha) + Math.sqrt(s);
      if (valley < rMin) lo = rd;
      else hi = rd;
    }

    return { rd: (lo + hi) / 2, dc: R_MAX - (lo + hi) / 2 };
  }

  function buildShapes() {
    document.querySelectorAll('[data-shape]').forEach(function (el) {
      if (el.dataset.shaped === '1') return;
      el.dataset.shaped = '1';

      var petals = Math.round(parseFloat(el.getAttribute('data-shape')) || 0);
      if (petals < 3) return;

      var amp = parseFloat(el.getAttribute('data-shape-a'));
      if (isNaN(amp)) amp = 0.12;
      amp = Math.min(Math.max(amp, 0), 0.32);

      var g = petalGeometry(petals, R_MAX * (1 - 1.7 * amp));
      var steps = Math.max(220, petals * 28);
      var points = [];

      for (var i = 0; i < steps; i++) {
        var t = (i / steps) * Math.PI * 2;
        var r = 0;
        for (var p = 0; p < petals; p++) {
          var d = t - (p / petals) * Math.PI * 2;
          var s = g.rd * g.rd - g.dc * g.dc * Math.sin(d) * Math.sin(d);
          var reach = s <= 0 ? 0 : g.dc * Math.cos(d) + Math.sqrt(s);
          if (reach > r) r = reach;
        }
        var x = 50 + Math.cos(t) * r * 100;
        var y = 50 + Math.sin(t) * r * 100;
        points.push(x.toFixed(2) + '% ' + y.toFixed(2) + '%');
      }

      /* Only the painted layer is clipped, so labels are never cut */
      el.style.setProperty('--m-shape-clip', 'polygon(' + points.join(',') + ')');
    });
  }

  /* ── Values group: one panel expands at a time ── */
  var valuesBound = false;

  function initValues() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.feature-grid .feature'));
    if (!items.length) return;

    if (!document.querySelector('.feature-grid .feature.on')) items[0].classList.add('on');

    items.forEach(function (item) {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-expanded', item.classList.contains('on') ? 'true' : 'false');
    });

    if (valuesBound) return;
    valuesBound = true;

    items.forEach(function (item) {
      function activate() {
        items.forEach(function (other) {
          var on = other === item;
          other.classList.toggle('on', on);
          other.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
      }
      item.addEventListener('click', activate);
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function releaseValues() {
    document.querySelectorAll('.feature-grid .feature').forEach(function (item) {
      item.removeAttribute('role');
      item.removeAttribute('tabindex');
      item.removeAttribute('aria-expanded');
    });
  }

  /* ── Apply ── */
  function applyUI(ui, persist) {
    ui = ui === 'classic' ? 'classic' : 'material';
    root.setAttribute('data-ui', ui);
    if (persist) store(UI_KEY, ui);

    if (ui === 'material') {
      buildShapes();
      initValues();
    } else {
      releaseValues();
    }
    sync();
  }

  function applyMode(mode, persist) {
    mode = mode === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-mode', mode);
    if (persist) store(MODE_KEY, mode);
    sync();
  }

  /* ── Ripple / state layer ── */
  document.addEventListener('pointerdown', function (e) {
    if (currentUI() !== 'material') return;
    var target = e.target.closest && e.target.closest('.btn, .project-link, .nav-links a, .lang-btn, .theme-opt, .mode-btn, .m-shape');
    if (!target) return;

    var rect = target.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 2;
    var ripple = document.createElement('span');
    ripple.className = 'm-ripple';
    ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' +
      (e.clientX - rect.left - size / 2) + 'px;top:' + (e.clientY - rect.top - size / 2) + 'px';
    target.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 650);
  });

  /* ── Control interactions (delegated: nav + drawer) ── */
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    var uiBtn = e.target.closest('[data-ui-choice]');
    if (uiBtn) {
      applyUI(uiBtn.getAttribute('data-ui-choice'), true);
      return;
    }

    var modeBtn = e.target.closest('[data-mode-toggle]');
    if (modeBtn) {
      applyMode(currentMode() === 'dark' ? 'light' : 'dark', true);
    }
  });

  /* ── Follow the OS until the visitor picks a mode ── */
  if (mq) {
    var onSchemeChange = function (e) {
      if (read(MODE_KEY)) return;
      root.setAttribute('data-mode', e.matches ? 'dark' : 'light');
      sync();
    };
    if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  }

  /* ── Re-localise labels when the language changes ── */
  var previousLangChange = window.onLangChange;
  window.onLangChange = function () {
    if (typeof previousLangChange === 'function') previousLangChange();
    sync();
  };

  function boot() {
    applyUI(currentUI(), false);
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
