// CRYO QUEST - core engine: canvas, main loop, scenes, transitions, timers, settings.
(function () {
  'use strict';

  const CQ = window.CQ = window.CQ || {};
  CQ.W = 384;
  CQ.H = 216;

  // ---------- small utilities ----------
  CQ.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  CQ.lerp = (a, b, t) => a + (b - a) * t;
  CQ.rand = (a, b) => a + Math.random() * (b - a);
  CQ.irand = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  CQ.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  CQ.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  CQ.ease = {
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inQuad: (t) => t * t,
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    outBack: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    outBounce: (t) => {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
      return n * (t -= 2.625 / d) * t + 0.984375;
    },
  };
  // Seeded RNG so procedural art looks the same every time
  CQ.seeded = function (seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return (s >>> 0) / 4294967296;
    };
  };
  CQ.makeCanvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return c;
  };

  // ---------- safe storage (kiosk / private mode safe) ----------
  CQ.store = {
    get(key, fallback) {
      try {
        const v = window.localStorage.getItem('cq_' + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { window.localStorage.setItem('cq_' + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    },
  };

  // ---------- settings ----------
  const cfg = window.CQ_CONFIG || {};
  const defaults = {
    voice: cfg.voice !== undefined ? cfg.voice : true,
    music: cfg.musicVolume !== undefined ? cfg.musicVolume : 0.5,
    sfx: cfg.sfxVolume !== undefined ? cfg.sfxVolume : 0.8,
    idleTimeout: cfg.idleTimeoutSeconds || 60,
    recordedVoice: cfg.useRecordedVoice !== undefined ? cfg.useRecordedVoice : true,
    voiceName: cfg.voiceName || '',
  };
  // Staff-menu changes are remembered, but editing config.js wins (saved values are dropped when it changes).
  const cfgStamp = JSON.stringify(defaults);
  const saved = CQ.store.get('settings', null);
  CQ.settings = Object.assign({}, defaults, saved && saved.stamp === cfgStamp ? saved.values : {});
  CQ.saveSettings = () => CQ.store.set('settings', { stamp: cfgStamp, values: CQ.settings });

  // ---------- explorer counter (how many kids played today) ----------
  CQ.explorers = {
    today() {
      const d = new Date().toISOString().slice(0, 10);
      const rec = CQ.store.get('explorers', { date: d, count: 0, total: 0 });
      if (rec.date !== d) { rec.date = d; rec.count = 0; }
      return rec;
    },
    add() {
      const rec = this.today();
      rec.count++; rec.total++;
      CQ.store.set('explorers', rec);
      return rec.count;
    },
    reset() { CQ.store.set('explorers', { date: new Date().toISOString().slice(0, 10), count: 0, total: 0 }); },
  };

  // ---------- game state ----------
  CQ.newGame = function () {
    CQ.game = {
      look: 0,            // which scientist the kid picked
      stage: 0,           // next station: 0 freeze, 1 fib, 2 krios, 3 tomo, 4 done
      stars: { freeze: 0, fib: 0, krios: 0, tomo: 0 },
      organism: 'yeast',  // 'bacteria' | 'yeast' | 'worm' (picked at the freezing station)
      sample: 'thin',     // 'thin' (plunge) or 'thick' (high pressure)
      method: 'plunge',
      explorerNo: 0,
      tiltShots: [],
      startedAt: performance.now(),
    };
  };
  CQ.newGame();

  // ---------- canvas ----------
  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  CQ.canvas = canvas;
  CQ.ctx = ctx;
  CQ.view = { scale: 1, left: 0, top: 0 };

  function resize() {
    const ww = window.innerWidth, wh = window.innerHeight;
    let s = Math.min(ww / CQ.W, wh / CQ.H);
    // Prefer whole-number scaling when it costs little screen space (crisper pixels)
    const fs = Math.floor(s);
    if (fs >= 2 && fs / s > 0.88) s = fs;
    const w = Math.round(CQ.W * s), h = Math.round(CQ.H * s);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    CQ.view.scale = s;
    CQ.view.left = (ww - w) / 2;
    CQ.view.top = (wh - h) / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  // Block browser behaviours that get in the way at a kiosk
  window.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('dragstart', (e) => e.preventDefault());
  window.addEventListener('keydown', (e) => {
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace'].includes(e.key)) e.preventDefault();
  });

  // ---------- scenes ----------
  CQ.scenes = {};
  let scene = null, sceneName = '';
  let timers = [];
  CQ.time = 0;          // seconds since start
  CQ.sceneTime = 0;     // seconds since scene entered
  CQ.frame = 0;

  CQ.after = function (sec, fn) { const t = { at: CQ.sceneTime + sec, fn }; timers.push(t); return t; };
  CQ.cancel = function (t) { timers = timers.filter((x) => x !== t); };

  // transition state
  const trans = { active: false, phase: 'in', t: 0, dur: 0.35, fx: 'fade', next: null };

  CQ.go = function (name, params, opts) {
    opts = opts || {};
    if (trans.active && trans.phase === 'out') return; // already leaving
    if (!CQ.scenes[name]) { console.error('No scene', name); return; }
    trans.active = true;
    trans.phase = 'out';
    trans.t = 0;
    trans.fx = opts.fx || 'fade';
    trans.dur = opts.time || (trans.fx === 'mosaic' ? 0.45 : 0.3);
    trans.next = { name, params: params || {} };
    if (trans.fx === 'none') { trans.t = trans.dur; }
  };

  function switchScene(name, params) {
    if (scene && scene.exit) scene.exit();
    timers = [];
    if (CQ.dialog) CQ.dialog.close(true);
    if (CQ.realcard) CQ.realcard.close();
    if (CQ.voice) CQ.voice.stop();
    scene = CQ.scenes[name];
    sceneName = name;
    CQ.sceneTime = 0;
    CQ.input.flush();
    if (scene.enter) scene.enter(params || {});
  }
  CQ.currentScene = () => sceneName;
  CQ.transitioning = () => trans.active;

  CQ.resetToTitle = function () {
    if (CQ.audio) CQ.audio.stopMusic();
    CQ.newGame();
    CQ.go('title', {}, { fx: 'mosaic' });
  };

  // ---------- idle "are you still there?" ----------
  const idle = { showing: false, t: 0 };
  function updateIdle(dt) {
    const s = scene;
    if (!s || s.noIdle || trans.active || (CQ.admin && CQ.admin.open)) { idle.showing = false; return; }
    const quiet = (performance.now() - CQ.input.lastActivity) / 1000;
    if (!idle.showing && quiet > CQ.settings.idleTimeout) {
      idle.showing = true; idle.t = 10;
      if (CQ.voice) CQ.voice.say('idle_1');
    }
    if (idle.showing) {
      if (quiet < 0.5) { idle.showing = false; CQ.input.flush(); return; }
      idle.t -= dt;
      if (idle.t <= 0) { idle.showing = false; CQ.resetToTitle(); }
    }
  }
  function drawIdle(c) {
    if (!idle.showing) return;
    c.fillStyle = 'rgba(0,0,0,0.75)';
    c.fillRect(0, 0, CQ.W, CQ.H);
    const g = CQ.gfx;
    g.panel(c, 92, 64, 200, 88);
    g.text(c, 'STILL THERE?', CQ.W / 2, 78, { color: 'gold', scale: 2, align: 'center' });
    g.pressLine(c, 'TO KEEP PLAYING', CQ.W / 2, 108, 'white');
    g.text(c, String(Math.ceil(idle.t)), CQ.W / 2, 128, { color: 'goldL', scale: 2, align: 'center' });
  }

  // ---------- mosaic / fade ----------
  let mosaicCanvas = null;
  function applyMosaic(c, size) {
    if (size <= 1) return;
    if (!mosaicCanvas) mosaicCanvas = CQ.makeCanvas(CQ.W, CQ.H);
    const m = mosaicCanvas.getContext('2d');
    const w = Math.max(1, Math.ceil(CQ.W / size)), h = Math.max(1, Math.ceil(CQ.H / size));
    m.imageSmoothingEnabled = false;
    m.clearRect(0, 0, CQ.W, CQ.H);
    m.drawImage(canvas, 0, 0, CQ.W, CQ.H, 0, 0, w, h);
    c.imageSmoothingEnabled = false;
    c.drawImage(mosaicCanvas, 0, 0, w, h, 0, 0, w * size, h * size);
  }
  CQ.applyMosaic = applyMosaic;

  function drawTransition(c) {
    if (!trans.active) return;
    const p = CQ.clamp(trans.t / trans.dur, 0, 1);
    const amt = trans.phase === 'out' ? p : 1 - p;
    if (trans.fx === 'mosaic') {
      applyMosaic(c, 1 + Math.floor(amt * 15));
      c.fillStyle = 'rgba(0,0,0,' + (amt * amt).toFixed(3) + ')';
      c.fillRect(0, 0, CQ.W, CQ.H);
    } else {
      // stepped fade, like old consoles
      const a = Math.round(amt * 6) / 6;
      c.fillStyle = 'rgba(0,0,0,' + a.toFixed(3) + ')';
      c.fillRect(0, 0, CQ.W, CQ.H);
    }
  }

  // ---------- screen shake / flash helpers usable by scenes ----------
  const fx = { shake: 0, flash: 0, flashColor: '#fff' };
  CQ.shake = (amt) => { fx.shake = Math.max(fx.shake, amt); };
  CQ.flash = (amt, color) => { fx.flash = amt; fx.flashColor = color || '#fff'; };

  // ---------- main loop ----------
  const STEP = 1 / 60;
  let last = 0, acc = 0;
  let fpsShow = false, fpsCount = 0, fpsTime = 0, fps = 60;
  window.addEventListener('keydown', (e) => { if (e.key === 'F3') fpsShow = !fpsShow; });

  function update(dt) {
    CQ.time += dt;
    CQ.frame++;
    CQ.input.update(dt);
    if (CQ.admin) CQ.admin.update(dt);
    if (CQ.admin && CQ.admin.open) { CQ.input.endFrame(); return; }

    if (trans.active) {
      trans.t += dt;
      if (trans.phase === 'out' && trans.t >= trans.dur) {
        switchScene(trans.next.name, trans.next.params);
        trans.phase = 'in';
        trans.t = 0;
      } else if (trans.phase === 'in' && trans.t >= trans.dur) {
        trans.active = false;
      }
    }

    if (scene && !(trans.active && trans.phase === 'out')) {
      CQ.sceneTime += dt;
      // fire timers
      if (timers.length) {
        const due = timers.filter((t) => t.at <= CQ.sceneTime);
        if (due.length) {
          timers = timers.filter((t) => t.at > CQ.sceneTime);
          due.forEach((t) => t.fn());
        }
      }
      const blocked = idle.showing;
      if (!blocked) {
        if (CQ.realcard && CQ.realcard.active) CQ.realcard.update(dt);
        else if (CQ.dialog && CQ.dialog.active) CQ.dialog.update(dt);
        if (scene.update) scene.update(dt);
      }
    }
    updateIdle(dt);
    if (fx.shake > 0) fx.shake = Math.max(0, fx.shake - dt * 20);
    if (fx.flash > 0) fx.flash = Math.max(0, fx.flash - dt * 3);
    if (CQ.audio) CQ.audio.tick();
    CQ.input.endFrame();
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CQ.W, CQ.H);
    if (scene && scene.draw) {
      ctx.save();
      if (fx.shake > 0) ctx.translate(Math.round(CQ.rand(-fx.shake, fx.shake)), Math.round(CQ.rand(-fx.shake, fx.shake)));
      scene.draw(ctx);
      ctx.restore();
    }
    if (CQ.dialog) CQ.dialog.draw(ctx);
    if (CQ.realcard) CQ.realcard.draw(ctx);
    if (fx.flash > 0) {
      ctx.globalAlpha = Math.min(1, fx.flash);
      ctx.fillStyle = fx.flashColor;
      ctx.fillRect(0, 0, CQ.W, CQ.H);
      ctx.globalAlpha = 1;
    }
    drawIdle(ctx);
    drawTransition(ctx);
    if (CQ.admin) CQ.admin.draw(ctx);
    if (fpsShow) {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 60, 9);
      CQ.gfx.text(ctx, fps + 'FPS ' + sceneName.toUpperCase(), 1, 1, { color: 'green' });
    }
  }

  // A kiosk must never freeze: errors are logged, and if they keep happening we go back to the title.
  let errors = 0;
  CQ.errors = [];
  function loop(ts) {
    requestAnimationFrame(loop);
    step(ts);
  }
  // one frame of work (also used by automated tests when the page is in the background)
  function step(ts) {
    try {
      const now = ts / 1000;
      let dt = last ? now - last : STEP;
      last = now;
      if (dt > 0.25) dt = 0.25; // tab was hidden / hiccup
      if (dt < 0) dt = 0;
      acc += dt;
      let steps = 0;
      while (acc >= STEP && steps < 5) { update(STEP); acc -= STEP; steps++; }
      if (steps === 5) acc = 0;
      render();
      fpsCount++; fpsTime += dt;
      if (fpsTime >= 1) { fps = fpsCount; fpsCount = 0; fpsTime = 0; errors = Math.max(0, errors - 1); }
    } catch (e) {
      console.error(e);
      if (CQ.errors.length < 20) CQ.errors.push(String(e && e.stack || e));
      if (++errors > 20) {
        errors = 0;
        try { trans.active = false; switchScene('title', {}); } catch (e2) { console.error(e2); }
      }
    }
  }

  CQ._step = step;

  CQ.start = function (first) {
    if (CQ.sprites && CQ.sprites.build) CQ.sprites.build();
    switchScene(first, {});
    trans.active = true; trans.phase = 'in'; trans.t = 0; trans.fx = 'fade'; trans.dur = 0.6;
    requestAnimationFrame(loop);
  };
})();
