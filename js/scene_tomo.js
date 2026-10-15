// CRYO QUEST - Stage 4 (finale): build the tomogram from the tilt pictures, then dive through it.
(function () {
  'use strict';
  const CQ = window.CQ;
  const g = () => CQ.gfx;

  const VIEW = { x: 22, y: 24, w: 220, h: 150 };
  const SLIDER = { x: 252, y: 24, h: 150 };
  let st = null;

  const targets = () => st.model.targets;
  function glowing() {
    // the unfound target closest in depth, if we are near its depth
    let best = null, bd = 99;
    for (const T of targets()) {
      if (st.found[T.key]) continue;
      const d = Math.abs(st.z - T.z);
      if (d < T.range && d < bd) { bd = d; best = T; }
    }
    return best;
  }

  // gold sparkle around the thing you can catch right now
  function drawGlow(c, T) {
    const G = g();
    const col = Math.floor(CQ.time * 5) % 2 ? 'gold' : 'goldL';
    const gl = T.glow, ox = VIEW.x, oy = VIEW.y;
    const march = Math.floor(CQ.time * 12);
    if (gl.type === 'outline') {
      CQ.cellModel.outline(st.model, gl.inset, 2.2).forEach((pt, i) => {
        if ((i + march) % 4 !== 0) G.rect(c, ox + pt[0], oy + pt[1], 2, 2, col);
      });
    } else if (gl.type === 'circle') {
      G.ring(c, ox + gl.x, oy + gl.y, gl.r, col, 2);
    } else if (gl.type === 'ellipse') {
      const cr = Math.cos(gl.ang || 0), sr = Math.sin(gl.ang || 0);
      for (let i = 0; i < 96; i++) {
        if ((i + march) % 4 === 0) continue;
        const a2 = (i / 96) * Math.PI * 2, ex = Math.cos(a2) * gl.rx, ey = Math.sin(a2) * gl.ry;
        G.rect(c, ox + gl.x + ex * cr - ey * sr, oy + gl.y + ex * sr + ey * cr, 2, 2, col);
      }
    } else if (gl.type === 'rect') {
      for (let x = gl.x0; x <= gl.x1; x += 3) if ((x / 3 + march) % 4 >= 1) { G.rect(c, ox + x, oy + gl.y0, 2, 2, col); G.rect(c, ox + x, oy + gl.y1, 2, 2, col); }
      for (let y = gl.y0; y <= gl.y1; y += 3) if ((y / 3 + march) % 4 >= 1) { G.rect(c, ox + gl.x0, oy + y, 2, 2, col); G.rect(c, ox + gl.x1, oy + y, 2, 2, col); }
    } else if (gl.type === 'path') {
      gl.pts.forEach((pt, i) => {
        if (i % 2 || (i / 2 + march) % 4 === 0) return;
        G.rect(c, ox + pt[0] - 5, oy + pt[1] - 4, 2, 2, col);
        G.rect(c, ox + pt[0] + 4, oy + pt[1] + 3, 2, 2, col);
      });
    }
  }

  // little icons for the checklist
  function icon(c, key, x, y, on) {
    const G = g();
    const a = on ? 'gold' : 'g4', b = on ? 'goldL' : 'g5';
    if (key === 'membrane') {
      for (let i = 0; i < 14; i++) { const yy = Math.round(Math.sin(i / 3) * 2); G.px(c, x + i, y + 4 + yy, a); G.px(c, x + i, y + 8 + yy, a); }
    } else if (key === 'ribosome') {
      G.circle(c, x + 4, y + 5, 3, a); G.circle(c, x + 4, y + 9, 2, b);
      G.circle(c, x + 11, y + 6, 3, a); G.circle(c, x + 11, y + 10, 2, b);
    } else if (key === 'mito') {
      G.ellipse(c, x + 7, y + 7, 7, 4, a); G.ellipse(c, x + 7, y + 7, 5, 2, b);
      for (let i = 2; i < 13; i += 3) G.px(c, x + i, y + 7, a);
    } else if (key === 'nucleus') {
      G.circle(c, x + 7, y + 7, 6, a); G.circle(c, x + 7, y + 7, 4, b);
      G.px(c, x + 6, y + 6, a); G.px(c, x + 8, y + 8, a); G.px(c, x + 9, y + 5, a);
      G.px(c, x + 1, y + 7, 'ink'); G.px(c, x + 13, y + 7, 'ink'); G.px(c, x + 7, y + 1, 'ink'); G.px(c, x + 7, y + 13, 'ink');
    } else if (key === 'dna') {
      for (let i = 0; i < 14; i++) {
        const s1 = Math.sin(i / 2.2) * 4;
        G.px(c, x + i, y + 7 + s1, a); G.px(c, x + i, y + 7 - s1, b);
        if (i % 3 === 0) G.line(c, x + i, y + 7 + s1, x + i, y + 7 - s1, b);
      }
    } else if (key === 'flagellum') {
      G.circle(c, x + 2, y + 10, 2, a);
      for (let i = 3; i < 15; i++) G.px(c, x + i, y + 9 - (i - 3) * 0.4 + Math.sin(i * 1.2) * 1.5, a);
    } else if (key === 'muscle') {
      for (let r2 = 0; r2 < 4; r2++) {
        const yy = y + 2 + r2 * 3;
        if (r2 % 2) G.rect(c, x, yy, 14, 1, b);
        else { G.rect(c, x, yy, 6, 2, a); G.rect(c, x + 8, yy, 6, 2, a); }
      }
    } else {
      G.ring(c, x + 7, y + 7, 5, a); G.ring(c, x + 7, y + 7, 4, b);
    }
  }

  function ensureShots() {
    if (CQ.game.tiltShots && CQ.game.tiltShots.length) return CQ.game.tiltShots;
    // in case someone starts here: make the pictures now
    const M = st.model;
    return [0, 10, -10, 20, -20, 30, -30, 40, -40, 50, -50, 60, -60].map((deg) => {
      const img = CQ.cellModel.renderTilt(M, deg);
      const th = CQ.makeCanvas(24, 17);
      const x = th.getContext('2d'); x.imageSmoothingEnabled = true;
      x.drawImage(img, 0, 0, img.width, img.height, 0, 0, 24, 17);
      return { deg, canvas: th };
    });
  }

  // ------------------------------------------------------------ build animation
  function drawBuild(c) {
    const G = g();
    G.rect(c, 0, 0, CQ.W, CQ.H, '#0b0d18');
    G.panel(c, 4, 4, CQ.W - 8, CQ.H - 8, 'screen');
    G.text(c, 'TOMOGRAM BUILDER', 14, 12, { color: 'cyan' });
    const t = CQ.sceneTime - st.buildT;
    const cx = 192, cy = 104;
    const box = { x: cx - 110, y: cy - 75, w: 220, h: 150 };
    G.rect(c, box.x - 1, box.y - 1, box.w + 2, box.h + 2, 'g5');
    G.rect(c, box.x, box.y, box.w, box.h, '#101014');
    // each picture flies in and smears across the slice at its own angle (back-projection)
    const n = st.shots.length;
    c.save(); c.beginPath(); c.rect(box.x, box.y, box.w, box.h); c.clip();
    for (let i = 0; i < n; i++) {
      const ti = t - 0.4 - i * 0.22;
      if (ti < 0.3) continue;
      const a = (st.shots[i].deg * Math.PI) / 180;
      c.globalAlpha = Math.min(0.12, (ti - 0.3) * 0.3);
      c.save();
      c.translate(cx, cy);
      c.rotate(a);
      c.drawImage(st.shots[i].canvas, 0, 0, 24, 17, -160, -75, 320, 150);
      c.restore();
    }
    c.globalAlpha = 1;
    // the reconstructed slice appears
    const reveal = CQ.clamp((t - (0.6 + n * 0.22)) / 1.5, 0, 1);
    if (reveal > 0) { c.globalAlpha = reveal; c.drawImage(st.slice, box.x, box.y); c.globalAlpha = 1; }
    c.restore();
    for (let i = 0; i < n; i++) {
      const ti = t - i * 0.22;
      if (ti < 0) continue;
      const s = st.shots[i];
      const a = ((s.deg - 90) * Math.PI) / 180;
      const fx = cx + Math.cos(a) * 120, fy = cy + 30 + Math.sin(a) * 120;
      const k = CQ.ease.inQuad(CQ.clamp((ti - 0.25) / 0.3, 0, 1));
      if (k >= 1) continue;
      const x = CQ.lerp(fx, cx, k), y = CQ.lerp(Math.max(18, fy), cy, k);
      G.rect(c, x - 13, y - 10, 26, 19, 'gold');
      c.drawImage(s.canvas, Math.round(x - 12), Math.round(y - 9));
    }
    if (st.cube) drawCube(c, box);
    st.parts.draw(c);
  }

  // a pseudo-3D block: the slice on the front, edges of all the other slices behind it
  function drawCube(c, box) {
    const G = g();
    const k = CQ.ease.outBack(CQ.clamp((CQ.sceneTime - st.cubeT) * 1.5, 0, 1));
    const d = Math.round(24 * k);
    for (let i = d; i > 0; i -= 2) {
      G.rect(c, box.x + i, box.y - i, box.w, 1, i % 4 ? '#3a3e48' : '#50566a');
      G.rect(c, box.x + box.w + i - 1, box.y - i, 1, box.h, i % 4 ? '#2a2d36' : '#40455a');
    }
    G.rect(c, box.x - 1, box.y - 1, box.w + 2, box.h + 2, 'gold');
    c.drawImage(st.slice, box.x, box.y);
    G.text(c, '3D!', box.x - 10, box.y + 12, { color: 'gold', scale: 3, align: 'right', outline: '#000' });
  }

  // ------------------------------------------------------------ dive
  function drawDive(c) {
    const G = g();
    G.rect(c, 0, 0, CQ.W, CQ.H, '#0b0d18');
    G.text(c, 'DIVE THROUGH THE CELL!', VIEW.x, 8, { color: 'gold' });
    G.rect(c, VIEW.x - 2, VIEW.y - 2, VIEW.w + 4, VIEW.h + 4, 'g5');
    c.drawImage(st.slice, VIEW.x, VIEW.y);
    // glow on the target you can catch right now
    const T = glowing();
    st.glow = T;
    if (T) {
      const px = VIEW.x + T.at.x, py = VIEW.y + T.at.y;
      drawGlow(c, T);
      // A bubble
      const bx = Math.round(CQ.clamp(px + 14, VIEW.x + 2, VIEW.x + VIEW.w - 20)), by = Math.round(CQ.clamp(py - 30, VIEW.y + 2, VIEW.y + VIEW.h - 18));
      const iw = G.promptWidth();
      G.rect(c, bx - 1, by - 1, iw + 6, 15, 'ink'); G.rect(c, bx, by, iw + 4, 13, 'white');
      G.prompt(c, bx + 2, by + 1);
    }
    // depth slider
    G.rect(c, SLIDER.x, SLIDER.y, 12, SLIDER.h, 'g6');
    G.rect(c, SLIDER.x + 5, SLIDER.y + 4, 2, SLIDER.h - 8, 'g4');
    for (let k = 0; k <= 6; k++) G.rect(c, SLIDER.x + 3, SLIDER.y + 4 + Math.round((k / 6) * (SLIDER.h - 8)), 6, 1, 'g4');
    const ky = SLIDER.y + 4 + Math.round((st.z / st.model.D) * (SLIDER.h - 8));
    G.rect(c, SLIDER.x - 2, ky - 3, 16, 7, 'ink'); G.rect(c, SLIDER.x - 1, ky - 2, 14, 5, 'gold'); G.rect(c, SLIDER.x - 1, ky - 2, 14, 1, 'goldLL');
    G.text(c, 'TOP', SLIDER.x + 6, SLIDER.y - 9, { color: 'g3', align: 'center' });
    G.text(c, 'BOTTOM', SLIDER.x + 6, SLIDER.y + SLIDER.h + 3, { color: 'g3', align: 'center' });
    // hint arrow toward the next thing to find
    if (CQ.sceneTime - st.lastFind > 8 && !T) {
      const next = targets().find((x) => !st.found[x.key]);
      if (next) {
        const hy = SLIDER.y + 4 + Math.round((next.z / st.model.D) * (SLIDER.h - 8));
        const bob = Math.round(Math.sin(CQ.time * 8) * 2);
        for (let k = 0; k < 5; k++) G.rect(c, SLIDER.x + 15 + k + bob, hy - 4 + k, 1, 9 - k * 2, 'gold');
        G.text(c, st.z < next.z ? 'DOWN!' : 'UP!', SLIDER.x + 22 + bob, hy - 3, { color: 'goldL' });
      }
    }
    // checklist
    G.panel(c, 276, 22, 104, 108);
    G.text(c, 'FIND:', 284, 30, { color: 'goldL' });
    targets().forEach((T2, i) => {
      const y = 44 + i * 21;
      const on = !!st.found[T2.key];
      icon(c, T2.key, 283, y, on);
      G.text(c, on ? T2.name : '?', 301, y + 4, { color: on ? 'white' : 'g4' });
      if (on) { G.line(c, 289, y + 10, 292, y + 13, 'green', 2); G.line(c, 292, y + 13, 298, y + 5, 'green', 2); }
    });
    // controls help
    const dev = CQ.input.lastDevice;
    G.text(c, dev === 'mouse' ? 'WHEEL = DIVE' : dev === 'key' ? 'UP/DOWN = DIVE' : 'STICK = DIVE', 328, 140, { color: 'g3', align: 'center' });
    // found card
    if (st.card) {
      const k = CQ.ease.outBack(CQ.clamp((CQ.sceneTime - st.card.t) * 4, 0, 1));
      const w = Math.round(180 * k), h = Math.round(64 * k);
      if (w > 16) {
        G.panel(c, 132 - w / 2, 70 - h / 2, w, h);
        if (k > 0.9) {
          c.save(); c.translate(70, 50); c.scale(3, 3); icon(c, st.card.key, 0, 0, true); c.restore();
          G.text(c, st.card.name, 122, 66, { color: 'gold', scale: G.measure(st.card.name, 2) <= 96 ? 2 : 1 });
          G.text(c, 'FOUND!', 122, 82, { color: 'goldL' });
        }
      }
    }
    st.parts.draw(c);
  }

  // ------------------------------------------------------------ flow
  function startDive() {
    st.view = 'dive';
    st.phase = 'dive';
    st.z = 2;
    st.lastZ = -1;
    st.lastFind = CQ.sceneTime;
    st.diveStart = CQ.sceneTime;
    CQ.audio.playMusic('wonder');
  }

  function catchTarget(T) {
    st.found[T.key] = true;
    st.lastFind = CQ.sceneTime;
    st.phase = 'busy';
    st.card = { key: T.key, name: T.name, t: CQ.sceneTime };
    CQ.audio.sfx('found');
    st.parts.burst(VIEW.x + T.at.x, VIEW.y + T.at.y, 24, { colors: ['gold', 'goldL', 'white'], min: 30, max: 80 });
    CQ.dialog.run([T.line], () => {
      st.card = null;
      if (targets().every((x) => st.found[x.key])) {
        CQ.audio.sfx('win');
        CQ.dialog.run(['tm_all'], () => finish());
      } else st.phase = 'dive';
    });
  }

  function finish() {
    const took = CQ.sceneTime - st.diveStart;
    const stars = took < 70 ? 3 : took < 120 ? 2 : 1;
    CQ.finishStage(scene, 'tomo', stars, [], () => CQ.go('cert', {}, { fx: 'mosaic' }));
  }

  const scene = CQ.scenes.tomo = {
    state: () => st, // for testing
    enter() {
      st = {
        view: 'build', phase: 'busy',
        model: CQ.cellModel.build(4242, CQ.game.organism),
        z: 30, lastZ: -1, slice: null, found: {}, card: null, glow: null,
        parts: new CQ.gfx.Particles(), buildT: 0, cube: false, cubeT: 0, lastFind: 0, diveStart: 0,
        lastHintPress: -10, lastTickZ: -1,
      };
      scene.phase = null;
      st.shots = ensureShots();
      st.slice = CQ.cellModel.renderSlice(st.model, st.model.D / 2);
      st.buildT = CQ.sceneTime;
      CQ.audio.playMusic('wonder');
      CQ.after(0.3, () => CQ.dialog.run(['tm_1'], () => {}, { pos: 'bottom' }));
      const buildTime = 0.6 + st.shots.length * 0.22 + 1.6;
      CQ.after(buildTime, () => {
        st.cube = true; st.cubeT = CQ.sceneTime;
        CQ.audio.sfx('win');
        st.parts.burst(192, 104, 40, { colors: ['gold', 'goldL', 'white', 'iceL'], min: 40, max: 120 });
        const go = () => CQ.dialog.run(['tm_2', 'tm_3', 'tm_4'], () => startDive());
        if (CQ.dialog.active) { const wait = () => (CQ.dialog.active ? CQ.after(0.2, wait) : go()); wait(); } else go();
      });
    },

    update(dt) {
      st.parts.update(dt);
      if (scene.phase === 'result') return;
      if (st.view !== 'dive') return;
      const I = CQ.input, P = I.pointer;
      const D = st.model.D;
      if (st.phase === 'dive' && !CQ.dialog.active) {
        let dz = I.stick.y * 20 * dt;
        if (I.rightStickY) dz += I.rightStickY * 20 * dt;
        if (I.pressed('lb')) dz -= 2;
        if (I.pressed('rb')) dz += 2;
        if (P.wheel) dz += P.wheel * 1.5;
        // drag the slider knob with the mouse
        if (P.down && P.x >= SLIDER.x - 6 && P.x <= SLIDER.x + 18 && P.y >= SLIDER.y && P.y <= SLIDER.y + SLIDER.h) {
          st.z = CQ.clamp(((P.y - SLIDER.y - 4) / (SLIDER.h - 8)) * D, 0, D);
        }
        st.z = CQ.clamp(st.z + dz, 0, D);
        const T = glowing();
        if (T && (I.pressed('a') || (P.pressed && !(P.x >= SLIDER.x - 6 && P.x <= SLIDER.x + 18)))) catchTarget(T);
        else if (!T && I.pressed('a') && CQ.sceneTime - st.lastHintPress > 3) {
          st.lastHintPress = CQ.sceneTime;
          CQ.dialog.toast('tm_4', { time: 3 });
        }
      }
      // redraw the slice when the depth changes
      const zq = Math.round(st.z * 2) / 2;
      if (zq !== st.lastZ) {
        st.lastZ = zq;
        CQ.cellModel.renderSlice(st.model, zq, st.slice);
        const zi = Math.floor(zq);
        if (zi !== st.lastTickZ && zi % 3 === 0 && st.view === 'dive') CQ.audio.sfx('tick');
        st.lastTickZ = zi;
      }
    },

    draw(c) {
      if (st.view === 'build') drawBuild(c);
      else drawDive(c);
      if (scene.phase === 'result') CQ.drawResult(c, scene);
    },
  };
})();
