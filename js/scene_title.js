// CRYO QUEST - title screen with attract mode (kiosk demo loop).
(function () {
  'use strict';
  const CQ = window.CQ;
  const g = () => CQ.gfx;

  let snow = [];
  let pipX = -20;
  let lastSay = 0;
  let attract = false, attractT = 0;

  const SLIDES = [
    { n: '1', title: 'FREEZE IT!', text: 'SUPER FAST, INTO GLASS ICE', art: 'freeze', artX: 210 },
    { n: '2', title: 'SLICE IT!', text: 'A BEAM CUTS A THIN SLICE', art: 'fib', artX: 222 },
    { n: '3', title: 'SNAP IT!', text: 'PICTURES FROM MANY SIDES', art: 'krios', artX: 260 },
    { n: '4', title: 'SEE IT IN 3D!', text: 'DIVE INSIDE A REAL CELL', art: 'tomo', artX: 216 },
  ];

  function titleText(c, str, cx, y, scale) {
    const G = g();
    G.text(c, str, cx + scale, y + scale, { color: 'goldDD', scale, align: 'center', outline: '#000' });
    G.text(c, str, cx, y, { color: 'gold', scale, align: 'center', outline: '#000' });
    // light upper half for a metallic look
    c.save();
    c.beginPath();
    c.rect(0, y, CQ.W, Math.round(3 * scale));
    c.clip();
    G.text(c, str, cx, y, { color: 'goldL', scale, align: 'center' });
    c.restore();
    c.save();
    c.beginPath();
    c.rect(0, y + Math.round(5 * scale), CQ.W, Math.round(2 * scale));
    c.clip();
    G.text(c, str, cx, y, { color: 'goldD', scale, align: 'center' });
    c.restore();
  }

  function drawBackground(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#05060f', '#080a1a', '#0c1026', '#111633', '#151c40', '#1a2350']);
    for (const s of snow) {
      if (s.big) { G.px(c, s.x, s.y, 'iceL'); G.px(c, s.x - 1, s.y, 'iceD'); G.px(c, s.x + 1, s.y, 'iceD'); G.px(c, s.x, s.y - 1, 'iceD'); G.px(c, s.x, s.y + 1, 'iceD'); }
      else G.px(c, s.x, s.y, s.c);
    }
  }

  function drawFloor(c) {
    const G = g();
    G.rect(c, 0, 196, CQ.W, 20, '#0b0b10');
    G.rect(c, 0, 196, CQ.W, 1, 'gold');
    G.rect(c, 0, 197, CQ.W, 1, 'goldDD');
    const S = CQ.sprites;
    c.globalAlpha = 0.9;
    c.drawImage(S.plunger, 2, 140);
    c.drawImage(S.hpf, 50, 138);
    c.drawImage(S.crossbeam, 110, 120);
    c.drawImage(S.computer, 240, 152);
    c.drawImage(S.krios, 320, 100);
    c.globalAlpha = 1;
    // Pip waddling along the floor
    const f = Math.floor(CQ.time * 6) % 4;
    c.drawImage(S.pip(pipDir > 0 ? 'right' : 'left', f), Math.round(pipX), 180 - (f % 2));
  }
  let pipDir = 1;

  // ---------- language toggle (bottom left) ----------
  const LANG_Y = 199, LANG_H = 14, LANG_TY = 5; // text sits low enough to leave room for the tilde in ESPAÑOL
  function langButtons() {
    const G = g();
    let x = 14;
    return CQ.i18n.langs.map((l) => {
      const label = CQ.i18n.names[l];
      const w = G.measure(label, 1, true) + 8;
      const b = { lang: l, label, x, y: LANG_Y, w, h: LANG_H };
      x += w + 3;
      return b;
    });
  }
  function setLang(l) {
    if (l === CQ.i18n.lang) return;
    CQ.i18n.set(l);
    CQ.audio.sfx('move');
    CQ.voice.say('attract_1'); // so kids who can't read yet hear the switch
  }
  function drawLangToggle(c) {
    const G = g();
    const btns = langButtons();
    for (const b of btns) {
      const on = b.lang === CQ.i18n.lang;
      G.rect(c, b.x, b.y, b.w, b.h, on ? 'goldDD' : 'g5');
      G.rect(c, b.x + 1, b.y + 1, b.w - 2, b.h - 2, on ? 'gold' : '#151520');
      G.text(c, b.label, b.x + 4, b.y + LANG_TY, { color: on ? 'ink' : 'g3', raw: true });
    }
    // left/right arrows for controller and keyboard players
    if (CQ.input.lastDevice !== 'mouse') {
      const last = btns[btns.length - 1];
      const blink = Math.floor(CQ.time * 2) % 2 === 0;
      G.text(c, '<', btns[0].x - 7, LANG_Y + LANG_TY, { color: blink ? 'goldL' : 'gold', raw: true });
      G.text(c, '>', last.x + last.w + 3, LANG_Y + LANG_TY, { color: blink ? 'goldL' : 'gold', raw: true });
    }
  }
  // returns true when the toggle used this frame's input
  function updateLangToggle() {
    const I = CQ.input;
    if (I.pressed('left') || I.pressed('right')) {
      const L = CQ.i18n.langs, d = I.pressed('left') ? -1 : 1;
      setLang(L[(L.indexOf(CQ.i18n.lang) + d + L.length) % L.length]);
      return true;
    }
    const P = I.pointer;
    if (P.pressed) {
      for (const b of langButtons()) {
        if (P.x >= b.x - 2 && P.x < b.x + b.w + 2 && P.y >= b.y - 3 && P.y < b.y + b.h + 3) {
          CQ.audio.unlock();
          setLang(b.lang);
          return true;
        }
      }
    }
    return false;
  }

  function drawSlide(c) {
    const G = g();
    const i = Math.floor(attractT / 4) % SLIDES.length;
    const s = SLIDES[i];
    const lt = attractT % 4;
    G.panel(c, 52, 34, 280, 132);
    G.text(c, 'HOW TO BE A CRYO-ET SCIENTIST', CQ.W / 2, 42, { color: 'goldL', align: 'center' });
    // big step number
    G.circle(c, 82, 92, 16, 'goldDD'); G.circle(c, 82, 91, 15, 'gold');
    G.text(c, s.n, 82, 82, { color: 'ink', scale: 3, align: 'center' });
    G.text(c, s.title, 110, 70, { color: 'gold', scale: 2 });
    // wrap the line so it stays left of the picture (Spanish is longer)
    G.wrap(CQ.i18n.ui(s.text), s.artX - 116, 1).forEach((ln, k) => G.text(c, ln, 110, 92 + k * 10, { color: 'white', raw: true }));
    // little art
    const S = CQ.sprites;
    const bob = Math.round(Math.sin(lt * 4) * 2);
    if (s.art === 'freeze') {
      c.drawImage(S.plunger, 236, 100 + bob);
      c.drawImage(S.grid(10), 210, 120);
    } else if (s.art === 'fib') {
      c.drawImage(S.crossbeam, 222, 86 + bob);
    } else if (s.art === 'krios') {
      c.drawImage(S.krios, 260, 68 + bob);
    } else {
      c.drawImage(S.computer, 216, 112 + bob);
    }
    // page dots
    for (let k = 0; k < SLIDES.length; k++) G.rect(c, 172 + k * 10, 156, 6, 3, k === i ? 'gold' : 'g4');
  }

  // copyright notice (bottom right). In English, while the recorded narration is in use, it fades back
  // and forth with the narrator credit. Both texts can be changed in assets/config.js.
  const CREDIT_SECS = 5, CREDIT_FADE = 0.6;
  function drawCopyright(c) {
    const cfg = window.CQ_CONFIG || {};
    const copy = cfg.copyright !== undefined ? cfg.copyright : '© 2026 EVAN KRYSTOFIAK';
    const narr = cfg.narrationCredit !== undefined ? cfg.narrationCredit : 'NARRATION BY REBECCA SHREM';
    const list = [copy];
    if (CQ.i18n.lang === 'en' && CQ.settings.voice && CQ.settings.recordedVoice && CQ.voice.hasRecordings()) list.push(narr);
    const shown = list.filter(Boolean);
    if (!shown.length) return;
    let t = shown[0], alpha = 1;
    if (shown.length > 1) {
      const k = CQ.time / CREDIT_SECS, p = (k % 1) * CREDIT_SECS;
      t = shown[Math.floor(k) % shown.length];
      alpha = Math.max(0, Math.min(1, p / CREDIT_FADE, (CREDIT_SECS - p) / CREDIT_FADE));
    }
    c.globalAlpha = alpha;
    g().text(c, t, CQ.W - 6, LANG_Y + LANG_TY, { color: 'g3', align: 'right', raw: true });
    c.globalAlpha = 1;
  }

  CQ.scenes.title = {
    noIdle: true,
    enter() {
      CQ.newGame();
      snow = [];
      for (let i = 0; i < 70; i++) {
        snow.push({ x: CQ.rand(0, CQ.W), y: CQ.rand(0, CQ.H), v: CQ.rand(6, 22), ph: CQ.rand(0, 6), big: Math.random() < 0.15,
          c: CQ.pick(['white', 'iceL', 'ice', 'g2']) });
      }
      pipX = -20; pipDir = 1;
      attract = false; attractT = 0;
      lastSay = CQ.sceneTime;
      CQ.audio.playMusic('title');
    },
    update(dt) {
      for (const s of snow) {
        s.y += s.v * dt;
        s.x += Math.sin(CQ.time + s.ph) * 6 * dt;
        if (s.y > CQ.H) { s.y = -2; s.x = CQ.rand(0, CQ.W); }
      }
      pipX += pipDir * 22 * dt;
      if (pipX > CQ.W + 20) pipDir = -1;
      if (pipX < -40) pipDir = 1;

      const quiet = (performance.now() - CQ.input.lastActivity) / 1000;
      // attract mode: show how the game works when nobody is playing
      if (!attract && quiet > 20) { attract = true; attractT = 0; }
      if (attract) {
        attractT += dt;
        if (attractT > SLIDES.length * 4) { attract = false; CQ.input.lastActivity = performance.now() - 5000; }
      }
      if (CQ.sceneTime - lastSay > 120 && quiet > 30) { lastSay = CQ.sceneTime; CQ.voice.say('attract_1'); }

      if (CQ.sceneTime > 0.3 && updateLangToggle()) { attract = false; CQ.input.flush(); return; }
      if (CQ.input.anyPressed() && CQ.sceneTime > 0.6) {
        if (attract) { attract = false; CQ.input.flush(); return; }
        CQ.audio.unlock();
        CQ.audio.sfx('select');
        CQ.go('pick', {}, { fx: 'mosaic' });
      }
    },
    draw(c) {
      const G = g();
      drawBackground(c);
      drawFloor(c);
      drawLangToggle(c);
      drawCopyright(c);
      if (attract) { drawSlide(c); return; }
      // logo + title
      const bob = Math.round(Math.sin(CQ.time * 1.6) * 2);
      c.drawImage(CQ.sprites.logo, CQ.W / 2 - 32, 8 + bob);
      titleText(c, 'CRYO QUEST', CQ.W / 2, 80, 4);
      G.text(c, 'A FROZEN ADVENTURE INTO THE CELL', CQ.W / 2, 111, { color: 'iceL', align: 'center', shadow: '#000' });
      if (Math.floor(CQ.time * 1.8) % 2 === 0 || CQ.sceneTime < 0.5) G.pressLine(c, 'TO PLAY!', CQ.W / 2 + 20, 132, 'white');
      const ex = CQ.explorers.today();
      G.text(c, 'EXPLORERS TODAY: ' + ex.count, CQ.W - 6, 6, { color: 'gold', align: 'right', shadow: '#000' });
      if (CQ.audio.blocked() && CQ.input.padConnected === false && CQ.sceneTime > 2) {
        // two short lines so it stays left of the logo
        G.wrap(CQ.i18n.ui('CLICK OR PRESS ANY KEY FOR SOUND'), 140, 1).forEach((ln, k) => G.text(c, ln, 6, 6 + k * 10, { color: 'g3', raw: true }));
      }
    },
  };
})();
