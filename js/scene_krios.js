// CRYO QUEST - Stage 3: Titan Krios G4. Load the grid, find the lamella, take a tilt series.
(function () {
  'use strict';
  const CQ = window.CQ;
  const g = () => CQ.gfx;

  const TILTS = [0, 10, -10, 20, -20, 30, -30, 40, -40, 50, -50, 60, -60];
  const CAM = { x: 156, y: 20, w: 220, h: 150 };
  const SIDE = { x: 6, y: 20, w: 144, h: 150 };
  const ATLAS = { cx: 192, cy: 108, r: 84 };

  let st = null;

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

  // ------------------------------------------------------------ intro
  function drawIntro(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#0e1124', '#111530', '#141a3a', '#171e44']);
    G.rect(c, 0, 186, CQ.W, 30, '#20243a'); G.rect(c, 0, 186, CQ.W, 1, 'gold');
    c.drawImage(CQ.sprites.krios, 0, 0, 60, 96, 22, -2, 120, 192);
    // inside the column
    G.panel(c, 164, 14, 208, 136);
    const cx = 268;
    const tall = CQ.i18n.lang === 'es' ? 2 : 0; // room for the accents in CAÑÓN
    G.rect(c, cx - 22, 24 - tall, 44, 14 + tall, 'goldD'); G.rect(c, cx - 21, 25 - tall, 42, 12 + tall, 'gold');
    G.text(c, 'GUN', cx, 28, { color: 'ink', align: 'center' });
    for (const ly of [52, 72, 112]) { G.rect(c, cx - 30, ly, 20, 8, 'g3'); G.rect(c, cx + 10, ly, 20, 8, 'g3'); G.rect(c, cx - 30, ly, 20, 2, 'g2'); G.rect(c, cx + 10, ly, 20, 2, 'g2'); }
    // sample
    G.rect(c, cx - 22, 93, 44, 3, 'gold'); G.rect(c, cx - 22, 93, 44, 1, 'goldLL');
    // camera
    G.rect(c, cx - 26, 128, 52, 14, 'ink'); G.rect(c, cx - 25, 129, 50, 12, 'g5');
    G.px(c, cx + 20, 132, Math.floor(CQ.time * 3) % 2 ? 'green' : 'greenD');
    // flying electrons
    const ph = (CQ.time * 60) % 10;
    for (let y = 38 + ph; y < 128; y += 10) {
      const w = y > 93 ? 1 + (y - 93) * 0.1 : 1 + Math.abs(y - 70) * 0.05;
      G.rect(c, cx - Math.round(w), y, Math.round(w) * 2 + 1, 2, y > 93 && y < 96 ? 'white' : 'blueL');
    }
    G.text(c, 'ELECTRONS', cx - 36, 44, { color: 'blueL', align: 'right' });
    G.text(c, 'OUR SLICE', cx - 30, 91, { color: 'gold', align: 'right' });
    G.text(c, 'CAMERA', cx - 32, 132, { color: 'g2', align: 'right' });
    G.text(c, 'TITAN KRIOS G4', 80, 196, { color: 'gold', align: 'center' });
    G.text(c, 'CRYO-TEM', 80, 206, { color: 'g2', align: 'center' });
  }

  // ------------------------------------------------------------ autoloader
  function drawLoad(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#2a3048', '#2e3550', '#333a58', '#373f60']);
    G.text(c, 'ROBOT LOADER', CQ.W / 2, 22, { color: 'goldL', align: 'center' });
    // cassette with 12 slots
    G.rect(c, 36, 50, 120, 120, 'ink'); G.rect(c, 37, 51, 118, 118, 'g1'); G.rect(c, 37, 51, 118, 3, 'white');
    for (let i = 0; i < 12; i++) {
      const sx = 48 + (i % 4) * 26, sy = 66 + Math.floor(i / 4) * 34;
      G.rect(c, sx, sy, 20, 22, 'g3'); G.rect(c, sx + 1, sy + 1, 18, 20, 'g4');
      const ours = i === 5;
      if (!(ours && st.gripped)) {
        G.circle(c, sx + 10, sy + 11, 7, ours ? 'gold' : 'goldD');
        G.circle(c, sx + 10, sy + 11, 4, ours ? 'goldDD' : '#5a4010');
        if (ours && Math.floor(CQ.time * 3) % 2) G.ring(c, sx + 10, sy + 11, 10, 'goldL');
      }
      if (ours && !st.gripped) {
        // bouncing arrow: this one is ours!
        const ay = sy - 12 + Math.round(Math.sin(CQ.time * 6) * 2);
        for (let k = 0; k < 5; k++) G.rect(c, sx + 6 + k, ay + k, 9 - k * 2, 1, 'red');
        G.rect(c, sx + 8, ay - 5, 5, 5, 'red');
      }
    }
    // column port
    G.rect(c, 300, 30, 60, 150, 'g1'); G.rect(c, 300, 30, 3, 150, 'white'); G.rect(c, 357, 30, 3, 150, 'g2');
    G.rect(c, 296, 92, 10, 30, 'ink'); G.rect(c, 297, 93, 8, 28, '#0a0c14');
    G.text(c, 'MICROSCOPE', 330, 184, { color: 'g2', align: 'center' });
    // gripper arm
    const a = st.arm;
    G.rect(c, a.x - 1, 30, 3, a.y - 30, 'g3');
    G.rect(c, a.x - 7, a.y - 3, 14, 4, 'g2');
    G.rect(c, a.x - 7, a.y, 2, 6, 'g2'); G.rect(c, a.x + 5, a.y, 2, 6, 'g2');
    if (st.gripped) { G.circle(c, a.x, a.y + 8, 7, 'gold'); G.circle(c, a.x, a.y + 8, 4, 'goldDD'); }
    if (st.phase === 'load' && !CQ.dialog.active) CQ.drawCallout(c, 'LOAD IT!', 220, 196);
  }

  // ------------------------------------------------------------ atlas (low magnification map)
  function bakeAtlas() {
    const cv = CQ.makeCanvas(CQ.W, CQ.H);
    const c = cv.getContext('2d');
    const G = g();
    const r = CQ.seeded(Date.now() & 0xffff);
    G.rect(c, 0, 0, CQ.W, CQ.H, '#05060a');
    const pitch = 15, sq = 11;
    const cols = [];
    for (let gy = -6; gy <= 6; gy++) for (let gx = -6; gx <= 6; gx++) {
      const x = ATLAS.cx + gx * pitch, y = ATLAS.cy + gy * pitch;
      if (Math.hypot(gx * pitch, gy * pitch) > ATLAS.r - 10) continue;
      cols.push([x, y]);
    }
    // pick the lamella square somewhere not too close to the middle
    const cand = cols.filter(([x, y]) => Math.hypot(x - ATLAS.cx, y - ATLAS.cy) > 25 && Math.hypot(x - ATLAS.cx, y - ATLAS.cy) < 60);
    const lam = cand[Math.floor(r() * cand.length)];
    for (const [x, y] of cols) {
      let v = 60 + r() * 50;
      if (r() < 0.08) v = 200; // broken square: nothing there, very bright
      if (r() < 0.12) v = 25;  // very thick ice
      c.fillStyle = 'rgb(' + (v | 0) + ',' + (v | 0) + ',' + ((v + 8) | 0) + ')';
      c.fillRect(x - sq / 2, y - sq / 2, sq, sq);
    }
    // the milled site: dark square with a bright thin slit
    const [lx, ly] = lam;
    c.fillStyle = '#202024'; c.fillRect(lx - sq / 2, ly - sq / 2, sq, sq);
    c.fillStyle = '#d8d8e0'; c.fillRect(lx - 4, ly - 2, 9, 1); c.fillRect(lx - 4, ly + 2, 9, 1);
    c.fillStyle = '#8890a0'; c.fillRect(lx - 4, ly - 1, 9, 3);
    // grid rim
    G.ring(c, ATLAS.cx, ATLAS.cy, ATLAS.r, '#2a2a30', 6);
    return { canvas: cv, lam: { x: lx, y: ly } };
  }

  function drawAtlas(c) {
    const G = g();
    let zoom = 1, zx = 0, zy = 0;
    if (st.phase === 'zooming') {
      const k = CQ.ease.inQuad(Math.min(1, (CQ.sceneTime - st.zoomT) / 0.8));
      zoom = 1 + k * 7;
      zx = st.atlas.lam.x; zy = st.atlas.lam.y;
      c.save();
      c.translate(CQ.W / 2, CQ.H / 2);
      c.scale(zoom, zoom);
      c.translate(-zx, -zy);
    }
    c.drawImage(st.atlas.canvas, 0, 0);
    // glow on the lamella so kids can spot it
    const L = st.atlas.lam;
    const glow = Math.floor(CQ.time * 3) % 2;
    G.rect(c, L.x - 4, L.y - 1, 9, 3, glow ? '#fff3c4' : '#ffe08a');
    if (st.phase === 'zooming') { c.restore(); return; }
    if (CQ.sceneTime - st.atlasStart > 9 && glow) G.ring(c, L.x, L.y, 12, 'gold');
    st.misses2.forEach((m) => { G.line(c, m.x - 3, m.y - 3, m.x + 3, m.y + 3, 'red'); G.line(c, m.x + 3, m.y - 3, m.x - 3, m.y + 3, 'red'); });
    G.text(c, 'GRID MAP', 12, 22, { color: 'goldL' });
    G.text(c, 'EACH SQUARE IS', 12, 34, { color: 'g3' });
    G.text(c, 'A TINY WINDOW', 12, 43, { color: 'g3' });
    drawCross(c, st.cur.x, st.cur.y, 'gold');
    if (st.phase === 'atlas' && !CQ.dialog.active) G.pressLine(c, 'TO PICK', 192, 204, 'white');
  }

  function drawCross(c, x, y, color) {
    const G = g();
    x = Math.round(x); y = Math.round(y);
    const r = 9 + Math.round(Math.sin(CQ.time * 6));
    G.ring(c, x, y, r, 'ink'); G.ring(c, x, y, r - 1, color);
    G.rect(c, x - r - 5, y, 6, 1, color); G.rect(c, x + r, y, 6, 1, color);
    G.rect(c, x, y - r - 5, 1, 6, color); G.rect(c, x, y + r, 1, 6, color);
  }

  // ------------------------------------------------------------ tilt series
  function renderCurrent() {
    st.img = CQ.cellModel.renderTilt(st.model, st.angle, st.img);
  }

  function targetPos() {
    const m = CQ.cellModel.targetAt(st.model, st.angle);
    return { x: CAM.x + st.off.x + m.x, y: CAM.y + st.off.y + m.y };
  }

  function newDrift() {
    // the sample drifts a bit after each tilt, so the target moves away from the circle
    const a = CQ.rand(0, Math.PI * 2), d = CQ.rand(26, 46);
    const m = CQ.cellModel.targetAt(st.model, st.angle);
    let tx = st.ret.x + Math.cos(a) * d, ty = st.ret.y + Math.sin(a) * d;
    tx = CQ.clamp(tx, CAM.x + 30, CAM.x + CAM.w - 30);
    ty = CQ.clamp(ty, CAM.y + 26, CAM.y + CAM.h - 26);
    st.off.x = CQ.clamp(tx - CAM.x - m.x, -50, 50);
    st.off.y = CQ.clamp(ty - CAM.y - m.y, -36, 36);
    st.aimT = 0;
  }

  function snap() {
    const t = targetPos();
    if (CQ.dist(t.x, t.y, st.ret.x, st.ret.y) > 13) {
      st.misses++;
      st.dose += 0.5;
      CQ.audio.sfx('oops');
      if (CQ.sceneTime - st.lastMissTalk > 5) { st.lastMissTalk = CQ.sceneTime; CQ.dialog.toast('kr_miss', { time: 2.5 }); }
      return;
    }
    CQ.audio.sfx('snap');
    CQ.flash(0.35, '#ffffff');
    st.dose += 1;
    // keep a little picture for the film strip (and for the finale)
    const th = CQ.makeCanvas(24, 17);
    const x = th.getContext('2d');
    x.imageSmoothingEnabled = true;
    x.drawImage(st.img, 0, 0, st.img.width, st.img.height, 0, 0, 24, 17);
    st.shots.push({ deg: st.angle, canvas: th });
    st.done[st.idx] = true;
    st.parts.burst(st.ret.x, st.ret.y, 10, { colors: ['white', 'goldL'], min: 20, max: 60 });
    if (st.shots.length === 4) CQ.dialog.toast('kr_gentle', { time: 3.5 });
    if (st.idx >= TILTS.length - 1) {
      st.phase = 'busy';
      CQ.after(0.8, () => {
        CQ.game.tiltShots = st.shots;
        st.view = 'strip';
        st.stripT = CQ.sceneTime;
        CQ.audio.sfx('win');
        CQ.dialog.run(['kr_done'], () => finish());
      });
      return;
    }
    st.phase = 'turn';
    st.from = st.angle;
    st.idx++;
    st.to = TILTS[st.idx];
    st.turnT = 0;
    CQ.audio.sfx('motor');
  }

  function drawTilt(c) {
    const G = g();
    G.rect(c, 0, 0, CQ.W, CQ.H, '#0a0c16');
    // ---- side view
    G.panel(c, SIDE.x - 2, SIDE.y - 2, SIDE.w + 4, SIDE.h + 4, 'screen');
    const cx = SIDE.x + 72, cy = SIDE.y + 70;
    // beam from the top
    const ph = (CQ.time * 50) % 8;
    for (let y = SIDE.y + 6 + ph; y < SIDE.y + 128; y += 8) G.rect(c, cx - 1, y, 3, 3, Math.abs(y - cy) < 4 ? 'white' : 'blueL');
    G.rect(c, cx - 12, SIDE.y + 2, 24, 6, 'g3');
    G.rect(c, cx - 16, SIDE.y + 128, 32, 8, 'g4'); G.text(c, 'CAMERA', cx, SIDE.y + 138, { color: 'g3', align: 'center' });
    // tilt range arc with dots for each picture
    TILTS.forEach((deg, i) => {
      const a = ((deg - 90) * Math.PI) / 180;
      const x = cx + Math.cos(a) * 52, y = cy + Math.sin(a) * 52;
      const isNow = i === st.idx && st.phase !== 'busy';
      G.circle(c, x, y, 2, st.done[i] ? 'gold' : isNow && Math.floor(CQ.time * 4) % 2 ? 'white' : 'g4');
    });
    // the lamella tilting
    const a = (st.angle * Math.PI) / 180;
    const lx = Math.cos(a) * 34, ly = Math.sin(a) * 34;
    G.line(c, cx - lx, cy - ly, cx + lx, cy + ly, 'goldD', 4);
    G.line(c, cx - lx, cy - ly, cx + lx, cy + ly, 'gold', 2);
    G.circle(c, cx, cy, 2, 'goldLL');
    const ang = (st.angle > 0 ? '+' : '') + Math.round(st.angle) + '°';
    G.rect(c, cx - 26, SIDE.y + 92, 52, 22, '#06121c');
    G.text(c, ang, cx, SIDE.y + 96, { color: 'goldL', scale: 2, align: 'center', outline: '#000' });
    // zap meter (electron dose)
    G.text(c, 'ZAP', SIDE.x + 6, SIDE.y + 116, { color: 'g2' });
    G.rect(c, SIDE.x + 26, SIDE.y + 116, 110, 7, 'ink');
    const dz = Math.min(1, st.dose / 16);
    G.rect(c, SIDE.x + 27, SIDE.y + 117, Math.round(108 * dz), 5, dz < 0.7 ? 'green' : dz < 0.9 ? 'yellow' : 'orange');

    // ---- camera view
    G.panel(c, CAM.x - 2, CAM.y - 2, CAM.w + 4, CAM.h + 4, 'screen');
    c.save();
    c.beginPath(); c.rect(CAM.x, CAM.y, CAM.w, CAM.h); c.clip();
    // ice around the image (so drifting never shows a black hole)
    const th = (st.angle * Math.PI) / 180;
    const bgv = Math.round(160 - 34 * (1 / Math.cos(th) - 1));
    G.rect(c, CAM.x, CAM.y, CAM.w, CAM.h, 'rgb(' + bgv + ',' + bgv + ',' + bgv + ')');
    c.drawImage(st.img, Math.round(CAM.x + st.off.x), Math.round(CAM.y + st.off.y));
    // target hint
    const t = targetPos();
    if (st.phase === 'aim') {
      const m = st.model.kTarget;
      const rx = Math.max(10, m.rx * Math.abs(Math.cos((st.angle * Math.PI) / 180)) + 4);
      const k = Math.floor(CQ.time * 4) % 2;
      for (let i = 0; i < 40; i++) {
        if ((i + Math.floor(CQ.time * 8)) % 4 > 1) continue;
        const aa = (i / 40) * Math.PI * 2;
        G.px(c, t.x + Math.cos(aa) * rx, t.y + Math.sin(aa) * (m.ry + 4), k ? 'gold' : 'goldL');
      }
    }
    c.restore();
    // reticle
    const near = CQ.dist(t.x, t.y, st.ret.x, st.ret.y) <= 13;
    const rc = near ? 'green' : 'gold';
    G.ring(c, st.ret.x, st.ret.y, 14, 'ink'); G.ring(c, st.ret.x, st.ret.y, 13, rc); G.ring(c, st.ret.x, st.ret.y, 12, 'ink');
    G.rect(c, st.ret.x - 18, st.ret.y, 5, 1, rc); G.rect(c, st.ret.x + 14, st.ret.y, 5, 1, rc);
    G.rect(c, st.ret.x, st.ret.y - 18, 1, 5, rc); G.rect(c, st.ret.x, st.ret.y + 14, 1, 5, rc);
    if (near && st.phase === 'aim' && !CQ.dialog.active) CQ.drawCallout(c, 'SNAP!', CAM.x + CAM.w / 2, CAM.y + CAM.h - 16);
    G.text(c, 'PICTURE ' + Math.min(TILTS.length, st.shots.length + 1) + ' OF ' + TILTS.length, CAM.x + 4, CAM.y + 4, { color: 'white', shadow: '#000' });

    drawStrip(c, 176);
    st.parts.draw(c);
  }

  function drawStrip(c, y) {
    const G = g();
    G.rect(c, 4, y, CQ.W - 8, 36, '#1a1410');
    for (let x = 8; x < CQ.W - 8; x += 8) { G.rect(c, x, y + 2, 4, 3, '#4a3a2a'); G.rect(c, x, y + 31, 4, 3, '#4a3a2a'); }
    for (let i = 0; i < TILTS.length; i++) {
      const fx = 10 + i * 28, fy = y + 8;
      G.rect(c, fx - 1, fy - 1, 26, 19, '#3a2e22');
      const shot = st.shots[i];
      if (shot) c.drawImage(shot.canvas, fx, fy);
      else G.rect(c, fx, fy, 24, 17, '#0e0c0a');
    }
  }

  function drawStripView(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#0c0e1e', '#10142a', '#141a36', '#182042']);
    G.text(c, 'OUR TILT SERIES', CQ.W / 2, 20, { color: 'gold', scale: 2, align: 'center', shadow: 'goldDD' });
    // fan of pictures by angle
    const t = CQ.sceneTime - st.stripT;
    st.shots.forEach((s, i) => {
      const k = CQ.clamp((t - i * 0.08) * 3, 0, 1);
      const a = ((s.deg - 90) * Math.PI) / 180;
      const x = 192 + Math.cos(a) * 86 * k, y = 142 + Math.sin(a) * 86 * k;
      G.rect(c, x - 13, y - 10, 26, 19, 'gold');
      c.drawImage(s.canvas, Math.round(x - 12), Math.round(y - 9));
    });
    G.text(c, '-60°', 80, 96, { color: 'goldL', align: 'center' });
    G.text(c, '+60°', 304, 96, { color: 'goldL', align: 'center' });
    G.text(c, '0°', 192, 40, { color: 'goldL', align: 'center' });
  }

  function finish() {
    const stars = st.misses <= 1 ? 3 : st.misses <= 4 ? 2 : 1;
    CQ.finishStage(scene, 'krios', stars, ['kr_next']);
  }

  const scene = CQ.scenes.krios = {
    state: () => st, // for testing
    enter() {
      st = {
        view: 'intro', phase: 'busy',
        arm: { x: 220, y: 40 }, gripped: false,
        atlas: null, cur: { x: 192, y: 108 }, atlasStart: 0, misses2: [], zoomT: 0,
        model: CQ.cellModel.build(4242, CQ.game.organism), img: null, angle: 0, idx: 0, from: 0, to: 0, turnT: 0,
        off: { x: 0, y: 0 }, ret: { x: CAM.x + CAM.w / 2, y: CAM.y + CAM.h / 2 }, aimT: 0,
        shots: [], done: [], dose: 0, misses: 0, lastMissTalk: -10,
        parts: new CQ.gfx.Particles(), stripT: 0,
      };
      scene.phase = null;
      CQ.audio.playMusic('cold');
      CQ.after(0.5, () => CQ.dialog.run(['kr_1', 'kr_2', 'kr_3'], () => {
        st.view = 'load';
        CQ.dialog.run(['kr_load'], () => { st.phase = 'load'; });
      }));
    },

    update(dt) {
      st.parts.update(dt);
      if (scene.phase === 'result') return;
      const I = CQ.input, P = I.pointer;

      // ---- robot loader
      if (st.phase === 'load' && !CQ.dialog.active) {
        if (I.act()) { st.phase = 'loading'; st.loadT = 0; CQ.audio.sfx('motor'); }
        return;
      }
      if (st.phase === 'loading') {
        st.loadT += dt;
        const slot = { x: 48 + 1 * 26 + 10, y: 66 + 1 * 34 + 3 };
        const t = st.loadT;
        if (t < 0.8) { const k = CQ.ease.inOut(t / 0.8); st.arm.x = CQ.lerp(220, slot.x, k); st.arm.y = CQ.lerp(40, 40, k); }
        else if (t < 1.3) { const k = CQ.ease.inOut((t - 0.8) / 0.5); st.arm.x = slot.x; st.arm.y = CQ.lerp(40, slot.y, k); }
        else if (!st.gripped) { st.gripped = true; CQ.audio.sfx('clunk'); }
        else if (t < 1.8) { const k = CQ.ease.inOut((t - 1.3) / 0.5); st.arm.y = CQ.lerp(slot.y, 99, k); }
        else if (t < 2.8) { const k = CQ.ease.inOut((t - 1.8) / 1.0); st.arm.x = CQ.lerp(slot.x, 300, k); }
        else {
          st.phase = 'busy';
          CQ.audio.sfx('beep');
          CQ.after(0.2, () => CQ.audio.sfx('beep'));
          CQ.after(0.8, () => {
            st.atlas = bakeAtlas();
            st.view = 'atlas';
            st.cur = { x: 192, y: 108 };
            CQ.audio.playMusic('game');
            CQ.dialog.run(['kr_find'], () => { st.phase = 'atlas'; st.atlasStart = CQ.sceneTime; });
          });
        }
        return;
      }

      // ---- find the lamella on the grid map
      if (st.phase === 'atlas' && !CQ.dialog.active) {
        if (P.moved || P.pressed) { st.cur.x = P.x; st.cur.y = P.y; }
        st.cur.x = CQ.clamp(st.cur.x + I.stick.x * 100 * dt, 100, 284);
        st.cur.y = CQ.clamp(st.cur.y + I.stick.y * 100 * dt, 22, 196);
        if (I.act()) {
          const L = st.atlas.lam;
          if (Math.abs(st.cur.x - L.x) <= 9 && Math.abs(st.cur.y - L.y) <= 9) {
            st.phase = 'busy';
            CQ.audio.sfx('ok');
            CQ.dialog.run(['kr_found'], () => {
              st.phase = 'zooming';
              st.zoomT = CQ.sceneTime;
              CQ.audio.sfx('whoosh');
              CQ.after(0.85, () => {
                st.view = 'tilt';
                st.phase = 'busy';
                st.angle = 0; st.idx = 0;
                renderCurrent();
                CQ.dialog.run(['kr_tilt1', 'kr_tilt2', 'kr_tilt3'], () => { st.phase = 'aim'; st.aimT = 0; });
              });
            });
          } else {
            CQ.audio.sfx('oops');
            st.misses2.push({ x: st.cur.x, y: st.cur.y });
            if (st.misses2.length > 6) st.misses2.shift();
            CQ.dialog.toast('kr_notit', { time: 2.5 });
          }
        }
        return;
      }

      // ---- tilt series
      if (st.phase === 'aim' && !CQ.dialog.active) {
        st.aimT += dt;
        if (P.moved || P.pressed) { st.ret.x = P.x; st.ret.y = P.y; }
        st.ret.x = CQ.clamp(st.ret.x + I.stick.x * 95 * dt, CAM.x + 12, CAM.x + CAM.w - 12);
        st.ret.y = CQ.clamp(st.ret.y + I.stick.y * 95 * dt, CAM.y + 12, CAM.y + CAM.h - 12);
        // helper: after a while the microscope tracks the target toward the circle
        if (st.aimT > 9) {
          const t = targetPos();
          st.off.x += (st.ret.x - t.x) * Math.min(1, dt * 0.8);
          st.off.y += (st.ret.y - t.y) * Math.min(1, dt * 0.8);
        }
        if (I.act()) snap();
        return;
      }
      if (st.phase === 'turn') {
        st.turnT += dt;
        const k = Math.min(1, st.turnT / 0.7);
        const prev = Math.round(st.angle / 5);
        st.angle = CQ.lerp(st.from, st.to, CQ.ease.inOut(k));
        if (Math.round(st.angle / 5) !== prev || k >= 1) renderCurrent();
        if (k >= 1) {
          st.angle = st.to;
          renderCurrent();
          newDrift();
          st.phase = 'aim';
        }
        return;
      }
    },

    draw(c) {
      if (st.view === 'intro') drawIntro(c);
      else if (st.view === 'load') drawLoad(c);
      else if (st.view === 'atlas') drawAtlas(c);
      else if (st.view === 'tilt') drawTilt(c);
      else if (st.view === 'strip') drawStripView(c);
      if ((st.view === 'load' || st.view === 'atlas' || st.view === 'tilt') && scene.phase !== 'result') {
        drawSteps(c, ['LOAD', 'FIND', 'TILT + SNAP'], st.view === 'load' ? 0 : st.view === 'atlas' ? 1 : 2);
      }
      if (scene.phase === 'result') CQ.drawResult(c, scene);
    },
  };
})();
