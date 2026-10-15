// CRYO QUEST - Stage 1: freezing (plunge freezer or high pressure freezer) + "glass ice" lesson.
(function () {
  'use strict';
  const CQ = window.CQ;
  const g = () => CQ.gfx;

  const GRID_X = 192;
  let st = null;          // scene state (reset every time)
  let gridSpr = null, gridWet = null;

  // ---------------------------------------------------------------- helpers
  function drawSteps(c, labels, cur) {
    const G = g();
    let total = 0;
    labels.forEach((l) => { total += G.measure(l) + 14; });
    let x = Math.round(CQ.W / 2 - total / 2);
    labels.forEach((l, i) => {
      const w = G.measure(l) + 10;
      const done = i < cur, now = i === cur;
      G.rect(c, x, 3, w, 11, done ? 'goldD' : now ? 'gold' : 'g5');
      G.rect(c, x + 1, 4, w - 2, 9, done ? 'goldDD' : now ? 'goldL' : 'g6');
      G.text(c, l, x + 5, 5, { color: done ? 'gold' : now ? 'ink' : 'g3' });
      x += w + 4;
    });
  }

  // ---------------------------------------------------------------- pick a sample
  const SAMPLE_X = [80, 192, 304];

  function drawSamples(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, 150, ['#9fb3d6', '#a9bcdc', '#b3c5e2', '#bdcde7', '#c7d5ec']);
    for (let x = 0; x < CQ.W; x += 32) G.rect(c, x, 0, 1, 150, '#a2b4d4');
    G.rect(c, 0, 146, CQ.W, 4, 'woodD');
    G.rect(c, 0, 150, CQ.W, 66, 'wood');
    G.rect(c, 0, 150, CQ.W, 2, 'brownL');
    G.text(c, 'PICK A SAMPLE!', CQ.W / 2, 10, { color: 'gold', scale: 2, align: 'center', outline: '#000' });
    const picking = st.phase === 'pick';
    CQ.ORGANISM_ORDER.forEach((kind, i) => {
      const x = SAMPLE_X[i], on = picking && st.osel === i;
      const bob = on ? Math.round(Math.abs(Math.sin(CQ.time * 5)) * -3) : 0;
      // stand + dish
      G.rect(c, x - 9, 112, 18, 36, 'g3'); G.rect(c, x - 8, 112, 4, 36, 'g2');
      if (on) G.ellipse(c, x, 110, 44, 13, Math.floor(CQ.time * 4) % 2 ? 'gold' : 'goldL');
      G.ellipse(c, x, 110, 40, 11, 'g4');
      G.ellipse(c, x, 108, 38, 10, 'iceL');
      G.ellipse(c, x, 108, 35, 8, '#eaf8ff');
      CQ.drawSample(c, kind, x, 104 + bob, CQ.time + i, 2);
      G.text(c, CQ.ORGANISMS[kind].name, x, 160, { color: on ? 'goldL' : 'white', scale: 2, align: 'center', outline: '#000' });
      if (on) {
        const ay = 40 + Math.round(Math.sin(CQ.time * 6) * 3);
        for (let k = 0; k < 7; k++) G.rect(c, x - 7 + k, ay + k, 15 - k * 2, 1, 'gold');
        G.rect(c, x - 3, ay - 8, 7, 8, 'gold');
      }
    });
    if (picking && !CQ.dialog.active) G.pressLine(c, 'TO PICK', 192, 196, 'white');
  }

  // ---------------------------------------------------------------- views
  function drawBench(c) {
    const G = g();
    const S = CQ.sprites;
    G.bands(c, 0, 0, CQ.W, 150, ['#9fb3d6', '#a9bcdc', '#b3c5e2', '#bdcde7', '#c7d5ec']);
    for (let x = 0; x < CQ.W; x += 32) G.rect(c, x, 0, 1, 150, '#a2b4d4');
    G.rect(c, 0, 146, CQ.W, 4, 'woodD');
    G.rect(c, 0, 150, CQ.W, 66, 'wood');
    G.rect(c, 0, 150, CQ.W, 2, 'brownL');
    for (let x = 8; x < CQ.W; x += 48) G.rect(c, x, 158, 1, 58, 'woodD');
    // machines (2x)
    const pick = st.phase === 'choose' ? st.sel : -1;
    const lift = (i) => (pick === i ? Math.round(Math.abs(Math.sin(CQ.time * 4)) * -2) : 0);
    if (pick === 0) G.rect(c, 38, 30, 104, 120, Math.floor(CQ.time * 4) % 2 ? 'gold' : 'goldL');
    if (pick === 1) G.rect(c, 244, 26, 128, 124, Math.floor(CQ.time * 4) % 2 ? 'gold' : 'goldL');
    if (pick === 0) G.rect(c, 40, 32, 100, 116, '#b3c5e2');
    if (pick === 1) G.rect(c, 246, 28, 124, 120, '#b3c5e2');
    c.drawImage(S.plunger, 0, 0, 46, 56, 44, 36 + lift(0), 92, 112);
    c.drawImage(S.hpf, 0, 0, 58, 58, 250, 32 + lift(1), 116, 116);
    // sample on a little stand
    G.rect(c, 182, 104, 20, 44, 'g3'); G.rect(c, 183, 104, 3, 44, 'g2');
    G.ellipse(c, 192, 102, 34, 9, 'g4');
    G.ellipse(c, 192, 100, 32, 8, 'iceL');
    G.ellipse(c, 192, 100, 29, 6, '#eaf8ff');
    CQ.drawSample(c, st.organism, 192, 99, CQ.time, 1);
    if (Math.floor(CQ.time * 3) % 3 === 0) G.px(c, 214, 88, 'white');
    // labels on the bench front
    if (st.phase === 'choose') {
      G.text(c, 'THIN', 90, 160, { color: pick === 0 ? 'goldL' : 'white', scale: 2, align: 'center', outline: '#000' });
      G.rect(c, 70, 180, 40, 2, 'iceL');
      G.text(c, 'THICK', 308, 160, { color: pick === 1 ? 'goldL' : 'white', scale: 2, align: 'center', outline: '#000' });
      G.rect(c, 298, 176, 20, 10, '#ffb3c6'); G.rect(c, 298, 176, 20, 1, 'white');
      // bouncing arrow over the choice
      const ax = pick === 0 ? 90 : 308, ay = 14 + Math.round(Math.sin(CQ.time * 6) * 3);
      for (let k = 0; k < 7; k++) G.rect(c, ax - 7 + k, ay + k, 15 - k * 2, 1, 'gold');
      G.rect(c, ax - 3, ay - 8, 7, 8, 'gold');
      G.pressLine(c, 'TO PICK', 192, 196, 'white');
    }
  }

  function drawChamber(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#e6f7ff', '#d9f2ff', '#cdeefe', '#c0e8fd', '#b3e2fb', '#a6dbf8']);
    // moving mist
    const m = Math.floor(CQ.time * 6);
    for (let y = 24; y < 180; y += 22) G.dither(c, 16 + ((m + y) % 20), y, 330, 2, '#f4fcff', (y + m) & 1);
    // chamber frame
    G.rect(c, 0, 0, 16, CQ.H, '#1d1d22'); G.rect(c, 14, 0, 2, CQ.H, '#34343c');
    G.rect(c, 368, 0, 16, CQ.H, '#1d1d22'); G.rect(c, 368, 0, 2, CQ.H, '#34343c');
    for (let y = 20; y < CQ.H; y += 40) { G.circle(c, 7, y, 2, '#4a4a54'); G.circle(c, 376, y, 2, '#4a4a54'); }
    // dewar opening below
    G.ellipse(c, GRID_X, 212, 46, 9, 'g4');
    G.ellipse(c, GRID_X, 212, 42, 7, '#0c1830');
    if (Math.floor(CQ.time * 3) % 2) G.dither(c, GRID_X - 30, 206, 60, 3, 'iceD', 0);
    // tweezers + grid
    const gy = st.gridY;
    G.rect(c, GRID_X - 2, 0, 4, gy - 30, 'g3'); G.rect(c, GRID_X - 2, 0, 1, gy - 30, 'g1');
    G.line(c, GRID_X - 2, gy - 30, GRID_X - 6, gy - 16, 'g4', 2);
    G.line(c, GRID_X + 2, gy - 30, GRID_X + 6, gy - 16, 'g4', 2);
    c.drawImage(gridSpr, GRID_X - 19, gy - 19);
    // water on the grid
    if (st.water > 0.02) {
      const ry = Math.max(1, 1 + 9 * st.water);
      c.globalAlpha = 0.85;
      G.ellipse(c, GRID_X, gy, 15, ry, '#4aa8e0');
      G.ellipse(c, GRID_X, gy - ry * 0.25, 13, ry * 0.7, '#8fd3ff');
      c.globalAlpha = 1;
      G.ellipse(c, GRID_X - 5, gy - ry * 0.5, 3, Math.max(1, ry * 0.2), 'white');
    }
    // blotting papers
    if (st.phase === 'pl_blot' || st.padIn > 0.01) {
      const gap = 21 + (1 - st.padIn) * 130;
      for (const side of [-1, 1]) {
        const x = side < 0 ? GRID_X - gap - 40 : GRID_X + gap;
        G.rect(c, x, gy - 26, 40, 52, 'g3');
        G.rect(c, x + 1, gy - 25, 38, 50, '#fff6e0');
        G.dither(c, x + 2, gy - 24, 36, 48, '#f3e6c4', 0);
        // wet spot grows as the paper soaks up water
        const wr = 3 + st.blot * 16;
        if (st.blot > 0.01) G.ellipse(c, side < 0 ? x + 38 : x + 2, gy, wr, wr * 1.1, '#9cd2f7');
        G.rect(c, side < 0 ? x + 38 : x, gy - 26, 2, 52, 'g3');
      }
    }
    // pipette
    if (st.phase === 'pl_drop' || st.phase === 'pl_dropping') {
      const px = Math.round(st.pipX), py = 16;
      G.rect(c, px - 5, py - 2, 11, 14, 'ink'); G.rect(c, px - 4, py - 1, 9, 12, 'orange'); G.rect(c, px - 4, py - 1, 3, 12, '#ffc27a');
      G.rect(c, px - 3, py + 12, 7, 22, 'ink'); G.rect(c, px - 2, py + 12, 5, 22, 'snow'); G.rect(c, px - 2, py + 12, 1, 22, 'white');
      G.rect(c, px - 2, py + 22, 5, 8, '#9cd2f7');
      G.rect(c, px - 1, py + 34, 3, 5, 'ink'); G.rect(c, px, py + 34, 1, 6, 'snow');
      if (st.phase === 'pl_drop') { const s = 1 + Math.sin(CQ.time * 8) * 0.3; G.circle(c, px, py + 42, 2 + s, '#4aa8e0'); G.px(c, px - 1, py + 41, 'white'); }
      // guide line straight down
      if (Math.abs(st.pipX - GRID_X) < 16) for (let y = py + 46; y < gy - 22; y += 4) G.px(c, px, y, 'goldD');
    }
    if (st.falling) { G.circle(c, st.falling.x, st.falling.y, 3, '#4aa8e0'); G.px(c, st.falling.x - 1, st.falling.y - 1, 'white'); }
    // blot meter
    if (st.phase === 'pl_blot') drawBlotMeter(c);
    st.parts.draw(c);
  }

  function drawBlotMeter(c) {
    const G = g();
    const x = 112, y = 168, w = 160, h = 12;
    G.rect(c, x - 2, y - 2, w + 4, h + 4, 'ink');
    G.rect(c, x, y, w * 0.55, h, '#4aa8e0');
    G.rect(c, x + w * 0.55, y, w * 0.25, h, 'green');
    G.rect(c, x + w * 0.8, y, w * 0.2, h, 'orange');
    G.rect(c, x, y, w, 2, 'white');
    // wet / dry icons
    G.circle(c, x - 12, y + 6, 5, '#4aa8e0'); G.rect(c, x - 13, y - 2, 2, 4, '#4aa8e0'); G.px(c, x - 14, y + 4, 'white');
    G.text(c, 'DRY', x + w + 6, y + 3, { color: 'orangeD' });
    const mx = x + Math.round(w * st.blot);
    G.rect(c, mx - 1, y - 6, 3, h + 12, 'ink'); G.rect(c, mx, y - 5, 1, h + 10, 'gold');
    for (let k = 0; k < 4; k++) G.rect(c, mx - 3 + k, y - 10 + k, 7 - k * 2, 1, 'gold');
    if (!CQ.dialog.active && st.blot < 0.55) G.pressLine(c, 'HOLD TO SOAK', 192, 194, 'ink');
  }

  function drawCup(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#060a16', '#0a1020', '#0e162c', '#121c38', '#162244']);
    // dewar
    G.rect(c, 102, 124, 180, 92, '#14101e'); G.rect(c, 104, 126, 176, 90, '#2b2b32'); G.rect(c, 104, 126, 6, 90, '#45454f');
    G.rect(c, 112, 132, 160, 84, 'blueD');
    G.dither(c, 112, 132, 160, 84, 'blue', 0);
    G.ellipse(c, GRID_X, 132, 80, 8, '#5d8fe8');
    // ethane cup
    G.rect(c, 158, 108, 68, 108, 'goldDD'); G.rect(c, 160, 110, 64, 106, 'goldD'); G.rect(c, 162, 110, 6, 106, 'gold');
    G.rect(c, 164, 116, 56, 100, '#bfe9ff');
    G.dither(c, 164, 116, 56, 100, '#9fd8f5', 1);
    // grid diving
    const gy = st.cupGridY;
    G.rect(c, GRID_X - 2, 0, 4, gy - 30, 'g3'); G.rect(c, GRID_X - 2, 0, 1, gy - 30, 'g1');
    G.line(c, GRID_X - 2, gy - 30, GRID_X - 6, gy - 16, 'g4', 2);
    G.line(c, GRID_X + 2, gy - 30, GRID_X + 6, gy - 16, 'g4', 2);
    c.drawImage(st.frozen ? gridWet : gridSpr, GRID_X - 19, gy - 19);
    // liquid surface in front of the grid
    if (gy > 118) {
      c.globalAlpha = 0.45;
      G.rect(c, 164, 118, 56, Math.min(98, gy + 20 - 118), '#d8f6ff');
      c.globalAlpha = 1;
    }
    G.ellipse(c, GRID_X, 116, 28, 3, '#e8fbff');
    G.rect(c, 168 + (Math.floor(CQ.time * 10) % 40), 115, 6, 1, 'white');
    // fog
    st.fog.draw(c);
    // labels
    G.text(c, 'LIQUID ETHANE', 300, 110, { color: 'iceL', align: 'center' });
    G.line(c, 266, 114, 228, 120, 'iceL');
    G.text(c, '-180 °C', 300, 122, { color: 'gold', scale: 2, align: 'center', outline: '#000' });
    G.text(c, 'LIQUID NITROGEN', 70, 170, { color: 'blueL', align: 'center' });
    G.line(c, 70, 180, 112, 190, 'blueL');
    st.parts.draw(c);
  }

  function drawHpfLoad(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#3a4058', '#424a64', '#4a5370', '#525c7c', '#5a6588']);
    for (let y = 0; y < CQ.H; y += 12) G.rect(c, 0, y, CQ.W, 1, '#363c52');
    // bottom carrier
    const by = 132;
    G.rect(c, 150, by, 84, 22, 'ink'); G.rect(c, 151, by + 1, 82, 20, 'g2'); G.rect(c, 151, by + 1, 82, 3, 'g1');
    G.ellipse(c, GRID_X, by + 2, 26, 6, 'g4'); G.ellipse(c, GRID_X, by + 3, 24, 4, 'g5');
    CQ.drawWorm(c, GRID_X, by + 1, CQ.time, 0.8);
    // top carrier
    const ty = st.topY;
    G.rect(c, 150, ty - 22, 84, 22, 'ink'); G.rect(c, 151, ty - 21, 82, 20, 'g2'); G.rect(c, 151, ty - 21, 82, 3, 'g1');
    G.ellipse(c, GRID_X, ty - 2, 26, 5, 'g4');
    G.text(c, 'TOP', GRID_X, ty - 16, { color: 'g4', align: 'center' });
    G.text(c, 'BOTTOM', GRID_X, by + 11, { color: 'g4', align: 'center' });
    if (st.phase === 'hp_load' && !CQ.dialog.active) CQ.drawCallout(c, 'CLOSE IT!', GRID_X, 190);
    st.parts.draw(c);
  }

  function drawGauge(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#f6f4ef', '#f2f0ea', '#eeebe4', '#e9e6de']);
    // red swoosh like on the EM ICE: thick on the left, thin to a point
    for (let x = 0; x < 330; x++) { const t = Math.round(6 * (1 - x / 330)); if (t > 0) G.rect(c, x, 22, 1, t, '#e8381e'); }
    G.rect(c, 0, 26, 300, 1, '#b4261a');
    // light grey band
    G.rect(c, 0, 158, CQ.W, 12, '#cfd2d6'); G.rect(c, 0, 158, CQ.W, 1, '#e4e6e9'); G.rect(c, 0, 169, CQ.W, 1, '#aeb2b8');
    const cx = 140, cy = 92, R = 58;
    G.circle(c, cx, cy, R + 4, 'ink');
    G.circle(c, cx, cy, R + 3, 'g3');
    G.circle(c, cx, cy, R, 'snow');
    const ang = (p) => ((-225 + (p / 2500) * 270) * Math.PI) / 180;
    // green zone 2000-2500
    for (let p = 2000; p <= 2500; p += 8) {
      const a = ang(p);
      for (let r = R - 9; r < R - 2; r++) G.px(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 'green');
    }
    for (let p = 0; p <= 2500; p += 250) {
      const a = ang(p), major = p % 500 === 0;
      G.line(c, cx + Math.cos(a) * (R - (major ? 12 : 7)), cy + Math.sin(a) * (R - (major ? 12 : 7)), cx + Math.cos(a) * (R - 2), cy + Math.sin(a) * (R - 2), 'ink');
    }
    [[0, '0'], [1000, '1000'], [2000, '2000']].forEach(([p, s]) => {
      const a = ang(p);
      G.text(c, s, cx + Math.cos(a) * (R - 24), cy + Math.sin(a) * (R - 24) - 3, { color: 'g4', align: 'center' });
    });
    G.text(c, 'BAR', cx, cy + 22, { color: 'g3', align: 'center' });
    const a = ang(st.pressure);
    G.line(c, cx, cy, cx + Math.cos(a) * (R - 10), cy + Math.sin(a) * (R - 10), 'red', 2);
    G.circle(c, cx, cy, 4, 'ink'); G.circle(c, cx, cy, 2, 'redD');
    // digital readout
    G.panel(c, cx - 40, cy + 64, 80, 20, 'screen');
    G.text(c, String(Math.round(st.pressure)).padStart(4, ' ') + ' BAR', cx, cy + 70, { color: st.pressure >= 2000 ? 'green' : 'cyan', align: 'center' });
    // pump handle
    const hx = 270, press = st.pumpAnim;
    G.rect(c, hx + 18, 70, 12, 90, 'g3'); G.rect(c, hx + 19, 70, 3, 90, 'g2');
    G.rect(c, hx - 10, 40 + press * 26, 68, 10, 'ink'); G.rect(c, hx - 9, 41 + press * 26, 66, 8, 'redD'); G.rect(c, hx - 9, 41 + press * 26, 66, 2, 'red');
    G.rect(c, hx + 21, 50 + press * 26, 6, 22, 'g2');
    // sample window
    G.rect(c, 250, 176, 70, 32, 'ink'); G.rect(c, 251, 177, 68, 30, st.frozen ? '#d8f6ff' : '#1c2030');
    G.rect(c, 264, 186, 42, 12, 'g2'); G.rect(c, 264, 186, 42, 2, 'g1');
    if (st.frozen) G.dither(c, 251, 177, 68, 30, 'white', 0);
    G.text(c, 'SAMPLE', 244, 189, { color: 'g4', align: 'right' });
    if (st.phase === 'hp_pump' && !CQ.dialog.active) {
      CQ.drawCallout(c, 'TAP TAP!', 300, 28 + Math.round(Math.sin(CQ.time * 10) * 2));
    }
    st.parts.draw(c);
  }

  // ---------------------------------------------------------------- glass ice lesson
  function makeMolecules(px, py, pw, ph) {
    const list = [];
    for (let i = 0; i < 46; i++) {
      list.push({ x: px + CQ.rand(6, pw - 6), y: py + CQ.rand(16, ph - 6), vx: CQ.rand(-25, 25), vy: CQ.rand(-25, 25), state: 'free', tx: 0, ty: 0 });
    }
    return list;
  }

  function startIce() {
    st.view = 'ice';
    st.phase = 'ice';
    CQ.audio.playMusic('cold');
    const L = { x: 12, y: 22, w: 176, h: 124 }, R = { x: 196, y: 22, w: 176, h: 124 };
    st.ice = {
      L, R,
      molL: makeMolecules(L.x, L.y, L.w, L.h),
      molR: makeMolecules(R.x, R.y, R.w, R.h),
      crystals: [],
      growing: false, hurt: false, fast: false, fastT: 0, word: false, wordT: 0,
    };
    CQ.after(0.4, () => CQ.dialog.run(['ice_1'], () => {
      // slow freezing: spiky crystals grow and poke the cell
      const I = st.ice;
      I.growing = true;
      CQ.audio.sfx('crack');
      const cx = L.x + L.w / 2, cy = L.y + 74;
      [[-50, -30], [46, -26], [-40, 40], [52, 36], [0, -52]].forEach(([dx, dy]) => I.crystals.push({ x: cx + dx, y: cy + dy, r: 0, max: CQ.rand(26, 34) }));
      CQ.after(2.6, () => {
        I.hurt = true;
        CQ.audio.sfx('oops');
        CQ.shake(3);
        CQ.dialog.run(['ice_slow'], () => {
          I.fast = true; I.fastT = 0;
          CQ.audio.sfx('freeze');
          CQ.flash(0.6, '#d8f6ff');
          CQ.after(0.8, () => CQ.dialog.run(['ice_fast'], () => {
            I.word = true; I.wordT = 0;
            CQ.audio.sfx('win');
            CQ.dialog.run(['ice_word'], () => finish());
          }));
        });
      });
    }));
  }

  function updateIce(dt) {
    const I = st.ice;
    const move = (m, box) => {
      if (m.state === 'free') {
        m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.x < box.x + 4 || m.x > box.x + box.w - 6) m.vx *= -1;
        if (m.y < box.y + 14 || m.y > box.y + box.h - 6) m.vy *= -1;
        m.x = CQ.clamp(m.x, box.x + 4, box.x + box.w - 6); m.y = CQ.clamp(m.y, box.y + 14, box.y + box.h - 6);
      } else if (m.state === 'lock') {
        m.x += (m.tx - m.x) * Math.min(1, dt * 6); m.y += (m.ty - m.y) * Math.min(1, dt * 6);
      }
    };
    I.molL.forEach((m) => move(m, I.L));
    I.molR.forEach((m) => move(m, I.R));
    if (I.growing) {
      for (const k of I.crystals) k.r = Math.min(k.max, k.r + dt * 14);
      // molecules caught by a crystal snap into a neat lattice
      for (const m of I.molL) {
        if (m.state !== 'free') continue;
        for (const k of I.crystals) {
          if (CQ.dist(m.x, m.y, k.x, k.y) < k.r) {
            m.state = 'lock';
            const row = Math.round((m.y - k.y) / 5);
            m.ty = k.y + row * 5;
            m.tx = k.x + Math.round((m.x - k.x - (row & 1) * 3) / 6) * 6 + (row & 1) * 3;
            break;
          }
        }
      }
    }
    if (I.fast) {
      I.fastT += dt;
      for (const m of I.molR) if (m.state === 'free') m.state = 'frozen';
    }
    if (I.word) I.wordT += dt;
  }

  function drawCell(c, cx, cy, hurt, kind) {
    const G = g();
    if (kind === 'bacteria') {
      // a rod-shaped cell with no nucleus: its DNA is a tangle in the middle
      G.capsule(c, cx - 22, cy, cx + 22, cy, 20, '#2a8a3a');
      G.capsule(c, cx - 22, cy, cx + 22, cy, 18, '#9be58f');
      for (let i = 0; i < 26; i++) G.px(c, cx - 30 + i, cy - 2 + Math.sin(i * 0.9) * 4, i % 2 ? '#7b4fd0' : '#a98af0');
      for (let i = 0; i < 18; i++) G.px(c, cx - 26 + i, cy + 4 + Math.cos(i * 1.1) * 3, '#7b4fd0');
    } else if (kind === 'yeast') {
      // an oval yeast cell with a little bud, a nucleus and a vacuole
      G.circle(c, cx + 22, cy - 22, 12, '#a07a2a'); G.circle(c, cx + 22, cy - 22, 10, '#f2d58a');
      G.circle(c, cx - 2, cy + 2, 31, '#a07a2a');
      G.circle(c, cx - 2, cy + 2, 29, '#f2d58a');
      G.circle(c, cx - 12, cy - 8, 8, '#7b4fd0'); G.circle(c, cx - 12, cy - 8, 6, '#a98af0');
      G.circle(c, cx - 12, cy + 15, 6, '#7fb0ff'); G.circle(c, cx - 12, cy + 15, 4, '#cfe8ff');
    } else {
      // one of the worm's cells
      G.circle(c, cx, cy, 31, '#2a8a3a');
      G.circle(c, cx, cy, 29, '#9be58f');
      G.circle(c, cx - 8, cy - 6, 9, '#7b4fd0');
      G.circle(c, cx - 8, cy - 6, 7, '#a98af0');
    }
    // face
    if (hurt) {
      G.line(c, cx + 2, cy - 4, cx + 6, cy, 'ink'); G.line(c, cx + 6, cy - 4, cx + 2, cy, 'ink');
      G.line(c, cx + 12, cy - 4, cx + 16, cy, 'ink'); G.line(c, cx + 16, cy - 4, cx + 12, cy, 'ink');
      G.line(c, cx + 4, cy + 10, cx + 7, cy + 7, 'ink'); G.line(c, cx + 7, cy + 7, cx + 10, cy + 10, 'ink'); G.line(c, cx + 10, cy + 10, cx + 14, cy + 7, 'ink');
    } else {
      G.rect(c, cx + 4, cy - 4, 2, 4, 'ink'); G.rect(c, cx + 13, cy - 4, 2, 4, 'ink');
      G.line(c, cx + 3, cy + 6, cx + 6, cy + 9, 'ink'); G.line(c, cx + 6, cy + 9, cx + 12, cy + 9, 'ink'); G.line(c, cx + 12, cy + 9, cx + 15, cy + 6, 'ink');
      G.px(c, cx + 1, cy + 4, 'pink'); G.px(c, cx + 17, cy + 4, 'pink');
    }
  }

  function drawMolecule(c, m, frozen) {
    const G = g();
    const x = Math.round(m.x), y = Math.round(m.y);
    G.rect(c, x, y, 2, 2, frozen ? '#2364a8' : '#3b74e0');
    G.px(c, x - 1, y - 1, 'white'); G.px(c, x + 2, y - 1, 'white');
  }

  function drawIce(c) {
    const G = g();
    const I = st.ice;
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#0a1020', '#0e162c', '#121c38', '#162244']);
    G.text(c, "LET'S ZOOM IN ON THE WATER!", CQ.W / 2, 6, { color: 'iceL', align: 'center' });
    [I.L, I.R].forEach((P, side) => {
      G.panel(c, P.x - 3, P.y - 3, P.w + 6, P.h + 6);
      G.rect(c, P.x, P.y, P.w, P.h, side === 0 ? '#cfe8ff' : '#d8f3ff');
      G.text(c, side === 0 ? 'SLOW FREEZE' : 'SUPER FAST FREEZE', P.x + P.w / 2, P.y + 4, { color: side === 0 ? 'redD' : 'blueD', align: 'center' });
      const cx = P.x + P.w / 2, cy = P.y + 74;
      drawCell(c, cx, cy, side === 0 && I.hurt, st.organism);
      const mols = side === 0 ? I.molL : I.molR;
      mols.forEach((m) => drawMolecule(c, m, m.state !== 'free'));
    });
    // spiky crystals (kept inside the left window)
    c.save(); c.beginPath(); c.rect(I.L.x, I.L.y + 12, I.L.w, I.L.h - 12); c.clip();
    for (const k of I.crystals) {
      if (k.r < 1) continue;
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI) / 3 + 0.3;
        const ex = k.x + Math.cos(ang) * k.r, ey = k.y + Math.sin(ang) * k.r;
        G.line(c, k.x, k.y, ex, ey, 'white', 2);
        G.line(c, k.x, k.y, ex, ey, '#4aa8e0');
        const bx = k.x + Math.cos(ang) * k.r * 0.6, by = k.y + Math.sin(ang) * k.r * 0.6;
        for (const s of [-0.7, 0.7]) G.line(c, bx, by, bx + Math.cos(ang + s) * k.r * 0.3, by + Math.sin(ang + s) * k.r * 0.3, '#4aa8e0');
      }
    }
    c.restore();
    if (I.hurt) {
      const shake = Math.round(Math.sin(CQ.time * 30) * 1);
      G.text(c, 'OUCH!', I.L.x + I.L.w / 2 + shake, I.L.y + 18, { color: 'red', scale: 2, align: 'center', outline: '#000' });
    }
    if (I.fast) {
      // glassy sheen sweeping across
      const sx = I.R.x - 40 + Math.min(1, I.fastT / 1.2) * (I.R.w + 80);
      c.save(); c.beginPath(); c.rect(I.R.x, I.R.y, I.R.w, I.R.h); c.clip();
      c.globalAlpha = 0.18; G.rect(c, I.R.x, I.R.y, I.R.w, I.R.h, '#7fd0ff'); c.globalAlpha = 0.5;
      for (let y = I.R.y; y < I.R.y + I.R.h; y++) G.rect(c, sx + (y - I.R.y) * 0.5, y, 10, 1, 'white');
      c.restore(); c.globalAlpha = 1;
      G.text(c, 'SAFE!', I.R.x + I.R.w / 2, I.R.y + 18, { color: 'greenD', scale: 2, align: 'center', outline: 'white' });
      G.text(c, 'GLASS ICE', I.R.x + I.R.w / 2, I.R.y + I.R.h - 12, { color: 'blueD', align: 'center' });
    }
    if (I.word) {
      const k = Math.min(1, I.wordT * 3);
      const y = 100 - Math.round((1 - CQ.ease.outBack(k)) * 40);
      G.panel(c, 52, y - 10, 280, 40);
      G.text(c, 'VITRIFICATION', CQ.W / 2, y, { color: 'gold', scale: 3, align: 'center', shadow: 'goldDD' });
    }
  }

  // ---------------------------------------------------------------- flow
  function finish() {
    let stars;
    if (st.method === 'plunge') {
      stars = 3;
      if (st.misses >= 2) stars--;
      if (st.blotResult === 'dry') stars--;
      if (st.reaction > 2.5) stars--;
    } else {
      stars = st.pumpTime < 8 ? 3 : st.pumpTime < 15 ? 2 : 1;
    }
    st.view = 'ice';
    CQ.finishStage(scene, 'freeze', stars, ['fr_done', 'fr_next']);
  }

  function startPlunge() {
    st.method = 'plunge';
    CQ.game.method = 'plunge';
    st.view = 'chamber';
    st.phase = 'busy';
    st.pipX = 80; st.pipDir = 1; st.misses = 0;
    CQ.audio.playMusic('game');
    CQ.dialog.run(['pl_1', 'pl_grid', 'pl_drop'], () => { st.phase = 'pl_drop'; });
  }

  function startHPF() {
    st.method = 'hpf';
    CQ.game.method = 'hpf';
    st.view = 'hpfload';
    st.phase = 'busy';
    st.topY = 70;
    CQ.audio.playMusic('game');
    CQ.dialog.run(['hp_1', 'hp_load'], () => { st.phase = 'hp_load'; });
  }

  const scene = CQ.scenes.freeze = {
    state: () => st, // for testing
    enter() {
      st = {
        phase: 'busy', view: 'samples',
        organism: 'yeast', sample: 'thin', osel: CQ.irand(0, 2),
        sel: 0, method: null,
        gridY: 96, water: 0, blot: 0, padIn: 0, blotResult: null,
        falling: null, pipX: 80, pipDir: 1, misses: 0,
        reaction: 0, plungeT: 0, vy: 0, cupGridY: -30, frozen: false,
        topY: 70, pressure: 0, pumpAnim: 0, pumpTime: 0,
        parts: new CQ.gfx.Particles(), fog: new CQ.gfx.Particles(),
      };
      scene.phase = null;
      if (!gridSpr) { gridSpr = CQ.sprites.grid(18); gridWet = CQ.sprites.grid(18, { film: '#9fd8f5' }); }
      CQ.audio.playMusic('cold');
      CQ.after(0.5, () => CQ.dialog.run(['fr_1', 'fr_pick'], () => { st.phase = 'pick'; }));
    },

    update(dt) {
      st.parts.update(dt);
      st.fog.update(dt);
      if (st.view === 'ice' && st.ice) updateIce(dt);
      if (scene.phase === 'result') return;
      const I = CQ.input;
      const P = I.pointer;
      if (st.view === 'cup' && Math.random() < 0.5) {
        st.fog.add({ x: CQ.rand(110, 274), y: CQ.rand(118, 134), vx: CQ.rand(-6, 6), vy: CQ.rand(-14, -5), life: CQ.rand(0.8, 1.8), color: CQ.pick(['#c8d8f0', '#e8f2ff', '#a8bcd8']), size: 2 });
      }

      // ---- pick a sample (bacteria, yeast or worm)
      if (st.phase === 'pick' && !CQ.dialog.active) {
        const before = st.osel;
        const d = I.menuDir(dt);
        if (d === 'left') st.osel = (st.osel + 2) % 3;
        if (d === 'right') st.osel = (st.osel + 1) % 3;
        let clicked = -1;
        if (P.moved || P.pressed) {
          SAMPLE_X.forEach((x, i) => {
            if (Math.abs(P.x - x) < 52 && P.y > 30 && P.y < 186) { st.osel = i; if (P.pressed) clicked = i; }
          });
        }
        if (st.osel !== before) {
          CQ.audio.sfx('move');
          CQ.voice.say(CQ.ORGANISMS[CQ.ORGANISM_ORDER[st.osel]].nameLine); // say the name for kids who can't read yet
        }
        if (I.pressed('a') || clicked >= 0) {
          const org = CQ.ORGANISMS[CQ.ORGANISM_ORDER[st.osel]];
          st.organism = org.key;
          st.sample = org.thick ? 'thick' : 'thin';
          CQ.game.organism = org.key;
          CQ.game.sample = st.sample;
          st.phase = 'busy';
          CQ.audio.sfx('select');
          st.parts.burst(SAMPLE_X[st.osel], 100, 18, { colors: ['gold', 'goldL', 'white'], min: 20, max: 60 });
          CQ.after(0.6, () => {
            st.view = 'bench';
            CQ.dialog.run(org.facts.concat(['fr_2', 'fr_4', 'fr_rule', 'fr_ask']), () => {
              st.phase = 'choose';
              st.sel = 0;
            });
          });
        }
        return;
      }

      // ---- choose the machine
      if (st.phase === 'choose' && !CQ.dialog.active) {
        const d = I.menuDir(dt);
        if (d === 'left' || d === 'right') { st.sel = st.sel ? 0 : 1; CQ.audio.sfx('move'); }
        let clicked = -1;
        if (P.moved || P.pressed) {
          if (P.x < 150 && P.y > 30 && P.y < 190) { if (st.sel !== 0 && P.moved) CQ.audio.sfx('move'); st.sel = 0; if (P.pressed) clicked = 0; }
          if (P.x > 234 && P.y > 30 && P.y < 190) { if (st.sel !== 1 && P.moved) CQ.audio.sfx('move'); st.sel = 1; if (P.pressed) clicked = 1; }
        }
        if (I.pressed('a') || clicked >= 0) {
          const right = st.sample === 'thin' ? 0 : 1;
          if (st.sel === right) {
            CQ.audio.sfx('ok');
            st.phase = 'busy';
            CQ.dialog.run(['fr_right'], () => (right === 0 ? startPlunge() : startHPF()));
          } else {
            CQ.audio.sfx('oops');
            CQ.dialog.run([st.sample === 'thin' ? 'fr_wrong_thin' : 'fr_wrong_thick'], () => {});
          }
        }
        return;
      }

      // ---- plunge freezer: put a drop on the grid
      if (st.phase === 'pl_drop' && !CQ.dialog.active) {
        const speed = st.misses >= 3 ? 55 : 80;
        st.pipX += st.pipDir * speed * dt;
        if (st.pipX > 300) st.pipDir = -1;
        if (st.pipX < 84) st.pipDir = 1;
        if (I.act()) {
          st.phase = 'pl_dropping';
          st.falling = { x: st.pipX, y: 60, vy: 40 };
          CQ.audio.sfx('drop');
        }
        return;
      }
      if (st.phase === 'pl_dropping') {
        const f = st.falling;
        f.vy += 400 * dt; f.y += f.vy * dt;
        const tol = st.misses >= 3 ? 26 : 17;
        if (f.y >= st.gridY - 6 && Math.abs(f.x - GRID_X) < tol) {
          st.falling = null; st.water = 1;
          CQ.audio.sfx('pop');
          st.parts.burst(GRID_X, st.gridY - 6, 10, { colors: ['#9cd2f7', 'white'], min: 20, max: 50 });
          st.phase = 'busy';
          CQ.dialog.toast('pl_hit', { time: 2 });
          CQ.after(1.4, () => CQ.dialog.run(['pl_blot'], () => { st.phase = 'pl_blot'; }));
        } else if (f.y > 200) {
          st.falling = null; st.misses++;
          CQ.audio.sfx('splash');
          st.parts.burst(f.x, 200, 12, { colors: ['#9cd2f7', 'white'], min: 20, max: 60, up: 40, g: 200 });
          if (st.misses >= 6) {
            // after many tries, the drop magically lands (no one gets stuck)
            st.pipX = GRID_X;
          }
          if (st.misses === 1 || st.misses === 3) CQ.dialog.toast('pl_miss', { time: 2 });
          st.phase = 'pl_drop';
        }
        return;
      }

      // ---- blotting
      if (st.phase === 'pl_blot' && !CQ.dialog.active) {
        const holding = I.actHeld();
        st.padIn = CQ.clamp(st.padIn + (holding ? 6 : -6) * dt, 0, 1);
        if (holding && st.padIn > 0.9) {
          st.blot = Math.min(1, st.blot + dt * 0.24);
          st.water = Math.max(0.05, 1 - st.blot * 1.05);
          st.wasHolding = true;
          if (Math.random() < 0.2) CQ.audio.sfx('tick');
        }
        const released = st.wasHolding && !holding;
        if (released || st.blot >= 1) {
          st.wasHolding = false;
          if (st.blot < 0.55) {
            CQ.dialog.toast('pl_blot_more', { time: 2 });
          } else {
            st.blotResult = st.blot <= 0.8 ? 'good' : 'dry';
            st.phase = 'busy';
            st.padIn = 0;
            CQ.audio.sfx(st.blotResult === 'good' ? 'ok' : 'oops');
            CQ.dialog.run([st.blotResult === 'good' ? 'pl_blot_good' : 'pl_blot_dry'], () => {
              st.phase = 'pl_plunge';
              st.plungeT = 0;
              CQ.dialog.toast('pl_plunge', { time: 3 });
            });
          }
        }
        return;
      }
      if (st.padIn > 0 && st.phase !== 'pl_blot') st.padIn = Math.max(0, st.padIn - dt * 6);

      // ---- plunge!
      if (st.phase === 'pl_plunge') {
        st.plungeT += dt;
        if (I.act() || st.plungeT > 9) {
          st.reaction = st.plungeT;
          st.phase = 'pl_dive';
          st.vy = 60;
          CQ.audio.sfx('whoosh');
          CQ.dialog.toastLine = null;
        }
        return;
      }
      if (st.phase === 'pl_dive') {
        st.vy += 1400 * dt;
        st.gridY += st.vy * dt;
        if (st.gridY > 260) {
          st.view = 'cup';
          st.phase = 'pl_cup';
          st.cupGridY = -40;
          st.vy = 420;
        }
        return;
      }
      if (st.phase === 'pl_cup') {
        st.cupGridY += st.vy * dt;
        if (!st.frozen && st.cupGridY > 118) {
          st.frozen = true;
          CQ.audio.sfx('splash');
          CQ.after(0.15, () => CQ.audio.sfx('freeze'));
          CQ.flash(0.5, '#d8f6ff');
          CQ.shake(3);
          st.parts.burst(GRID_X, 116, 30, { colors: ['white', '#d8f6ff', '#9fd8f5'], min: 30, max: 90, up: 60, g: 260 });
        }
        if (st.frozen) st.vy = Math.max(0, st.vy - 1600 * dt);
        if (st.frozen && st.vy === 0) {
          st.phase = 'busy';
          CQ.after(0.4, () => CQ.dialog.run(['pl_cold', 'pl_pole'], () => startIce()));
        }
        return;
      }

      // ---- high pressure freezer: close the sandwich
      if (st.phase === 'hp_load' && !CQ.dialog.active) {
        if (I.act()) { st.phase = 'hp_closing'; CQ.audio.sfx('whoosh'); }
        return;
      }
      if (st.phase === 'hp_closing') {
        st.topY = Math.min(132, st.topY + dt * 160);
        if (st.topY >= 132) {
          st.phase = 'busy';
          CQ.audio.sfx('clunk');
          CQ.shake(2);
          st.parts.burst(GRID_X, 132, 10, { colors: ['g1', 'white'], min: 20, max: 50 });
          CQ.after(0.8, () => {
            st.view = 'gauge';
            st.pressure = 0;
            CQ.dialog.run(['hp_pump'], () => { st.phase = 'hp_pump'; st.pumpTime = 0; });
          });
        }
        return;
      }
      if (st.phase === 'hp_pump') {
        if (CQ.dialog.active) return;
        st.pumpTime += dt;
        if (I.act()) { st.pressure += 130; st.pumpAnim = 1; CQ.audio.sfx('pump'); st.parts.burst(278, 66, 4, { colors: ['g2', 'white'], min: 10, max: 30 }); }
        else if (I.actHeld()) st.pressure += 110 * dt;
        st.pressure = Math.max(0, st.pressure - 35 * dt);
        st.pumpAnim = Math.max(0, st.pumpAnim - dt * 5);
        if (st.pressure >= 2050) {
          st.pressure = 2100;
          st.phase = 'busy';
          st.frozen = true;
          CQ.audio.sfx('hiss');
          CQ.after(0.2, () => CQ.audio.sfx('freeze'));
          CQ.flash(0.7, '#d8f6ff');
          CQ.shake(4);
          for (let i = 0; i < 40; i++) {
            st.parts.add({ x: CQ.rand(0, 1) < 0.5 ? 236 : 334, y: CQ.rand(178, 206), vx: CQ.rand(-80, 80), vy: CQ.rand(-30, 10), life: CQ.rand(0.5, 1.2), color: CQ.pick(['white', '#d8f6ff', '#9fd8f5']), size: 2 });
          }
          CQ.dialog.run(['hp_full', 'hp_fact', 'hp_why'], () => startIce());
        }
        return;
      }
    },

    draw(c) {
      if (st.view === 'samples') { drawSamples(c); st.parts.draw(c); }
      else if (st.view === 'bench') drawBench(c);
      else if (st.view === 'chamber') drawChamber(c);
      else if (st.view === 'cup') drawCup(c);
      else if (st.view === 'hpfload') drawHpfLoad(c);
      else if (st.view === 'gauge') drawGauge(c);
      else if (st.view === 'ice') drawIce(c);
      if (st.method === 'plunge' && st.view !== 'ice' && scene.phase !== 'result') {
        drawSteps(c, ['DROP', 'BLOT', 'PLUNGE'], st.phase === 'pl_drop' || st.phase === 'pl_dropping' ? 0 : st.phase === 'pl_blot' ? 1 : st.water > 0 && st.blotResult === null ? 1 : st.blotResult ? 2 : 0);
      } else if (st.method === 'hpf' && st.view !== 'ice' && scene.phase !== 'result') {
        drawSteps(c, ['LOAD', 'SQUEEZE', 'FREEZE'], st.view === 'hpfload' ? 0 : st.frozen ? 2 : 1);
      }
      if (st.phase === 'pl_plunge') CQ.drawCallout(c, 'PLUNGE!', GRID_X, 160);
      if (st.phase === 'pl_drop' && !CQ.dialog.active) G_hint(c);
      if (scene.phase === 'result') CQ.drawResult(c, scene);
    },
  };

  function G_hint(c) {
    g().pressLine(c, 'TO DROP', 192, 184, 'ink');
  }
})();
