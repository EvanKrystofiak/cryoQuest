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
    { n: '1', title: 'FREEZE IT!', text: 'SUPER FAST, INTO GLASS ICE', art: 'freeze' },
    { n: '2', title: 'SLICE IT!', text: 'A BEAM CUTS A THIN SLICE', art: 'fib' },
    { n: '3', title: 'SNAP IT!', text: 'PICTURES FROM MANY SIDES', art: 'krios' },
    { n: '4', title: 'SEE IT IN 3D!', text: 'DIVE INSIDE A REAL CELL', art: 'tomo' },
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
    G.text(c, s.text, 110, 92, { color: 'white' });
    // little art
    const S = CQ.sprites;
    const bob = Math.round(Math.sin(lt * 4) * 2);
    if (s.art === 'freeze') {
      c.drawImage(S.plunger, 236, 100 + bob);
      c.drawImage(S.grid(10), 210, 120);
    } else if (s.art === 'fib') {
      c.drawImage(S.crossbeam, 222, 86 + bob);
    } else if (s.art === 'krios') {
      c.drawImage(S.krios, 236, 68 + bob);
    } else {
      c.drawImage(S.computer, 216, 112 + bob);
    }
    // page dots
    for (let k = 0; k < SLIDES.length; k++) G.rect(c, 172 + k * 10, 156, 6, 3, k === i ? 'gold' : 'g4');
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
      if (attract) { drawSlide(c); return; }
      // logo + title
      const bob = Math.round(Math.sin(CQ.time * 1.6) * 2);
      c.drawImage(CQ.sprites.logo, CQ.W / 2 - 32, 8 + bob);
      titleText(c, 'CRYO QUEST', CQ.W / 2, 80, 4);
      G.text(c, 'A FROZEN ADVENTURE INTO THE CELL', CQ.W / 2, 111, { color: 'iceL', align: 'center', shadow: '#000' });
      if (Math.floor(CQ.time * 1.8) % 2 === 0 || CQ.sceneTime < 0.5) G.pressLine(c, 'TO PLAY!', CQ.W / 2 + 20, 132, 'white');
      const ex = CQ.explorers.today();
      G.text(c, 'EXPLORERS TODAY: ' + ex.count, CQ.W - 6, 204, { color: 'gold', align: 'right' });
      if (CQ.audio.blocked() && CQ.input.padConnected === false && CQ.sceneTime > 2) {
        G.text(c, 'CLICK OR PRESS ANY KEY FOR SOUND', 6, 204, { color: 'g3' });
      }
    },
  };
})();
