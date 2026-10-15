// CRYO QUEST - Stage 2: cryo-FIB-SEM (Zeiss Crossbeam 550). Find a cell, coat it, mill a lamella.
(function () {
  'use strict';
  const CQ = window.CQ;
  const g = () => CQ.gfx;

  // SEM image area on screen
  const IMG = { x: 16, y: 20, w: 352, h: 176 };
  // milling window (material grid, 2x2 pixel cells)
  const CELL = 2, COLS = 100, ROWS = 56;
  const WX = 92, WY = 50;

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

  // ------------------------------------------------------------ SEM image (procedural, grayscale)
  // Each cell is made of parts: circles {x,y,r} or rods {x0,y0,x1,y1,r}.
  function circlePart(x, y, r) { return { x0: x, y0: y, x1: x, y1: y, r }; }
  function rodPart(x, y, len, ang, r) {
    const dx = (Math.cos(ang) * len) / 2, dy = (Math.sin(ang) * len) / 2;
    return { x0: x - dx, y0: y - dy, x1: x + dx, y1: y + dy, r };
  }
  function wormParts(x, y, len, ang, r, phase) {
    const parts = [], n = 10;
    const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
    let px = null, py = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n - 0.5;
      const w = Math.sin(t * 7 + phase) * 6;
      const qx = x + ux * t * len + vx * w, qy = y + uy * t * len + vy * w;
      if (px !== null) parts.push({ x0: px, y0: py, x1: qx, y1: qy, r });
      px = qx; py = qy;
    }
    return parts;
  }
  // distance from point to a part's axis, and the nearest axis point
  function partDist(pt, x, y) {
    const ax = pt.x1 - pt.x0, ay = pt.y1 - pt.y0;
    const L2 = ax * ax + ay * ay;
    let t = L2 ? ((x - pt.x0) * ax + (y - pt.y0) * ay) / L2 : 0;
    t = Math.max(0, Math.min(1, t));
    const nx = pt.x0 + ax * t, ny = pt.y0 + ay * t;
    return { d: Math.hypot(x - nx, y - ny), nx, ny };
  }

  function partsFor(org, kind, x, y) {
    const R = CQ.rand;
    if (org === 'bacteria') {
      if (kind === 'clump') return [0, 1, 2, 3, 4].map(() => rodPart(x + R(-10, 10), y + R(-7, 7), R(18, 24), R(0, Math.PI), 6));
      if (kind === 'bar') return [rodPart(x, y, 24, R(1.2, 1.9), 7)];
      return [rodPart(x, y, R(22, 28), R(0, Math.PI), 7.5)];
    }
    if (org === 'worm') {
      if (kind === 'clump') return [].concat(wormParts(x, y, 70, R(-0.3, 0.3), 5, 0), wormParts(x, y + 4, 66, R(0.6, 1.0), 5, 2), wormParts(x - 4, y - 2, 60, R(-1.1, -0.7), 5, 4));
      if (kind === 'bar') return wormParts(x, y, 84, R(-0.25, 0.25), 6, R(0, 6));
      return wormParts(x, y, R(70, 82), R(-0.3, 0.3), 6, R(0, 6));
    }
    // yeast
    const r = CQ.irand(14, 17);
    if (kind === 'clump') return [[0, 0, 0.62], [-9, -6, 0.55], [8, -5, 0.6], [2, 8, 0.58]].map(([ox, oy, k]) => circlePart(x + ox, y + oy, r * k));
    if (kind === 'bar') return [circlePart(x, y, 13)];
    const parts = [circlePart(x, y, r)];
    if (Math.random() < 0.6) parts.push(circlePart(x + r * 0.85, y - r * 0.6, r * 0.45)); // a bud
    return parts;
  }

  function makeCells(org) {
    // four grid squares; one cell of each kind, plus one on the bar
    const spots = [[100, 62], [284, 64], [96, 148], [286, 150]];
    const kinds = ['good', 'good', 'broken', 'clump'];
    for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
    const jx = org === 'worm' ? 4 : 14, jy = org === 'worm' ? 4 : 10;
    const cells = spots.map(([x, y], i) => ({ x: x + CQ.irand(-jx, jx), y: y + CQ.irand(-jy, jy), kind: kinds[i] }));
    cells.push({ x: 192, y: CQ.pick([58, 150]), kind: 'bar' });
    for (const cl of cells) {
      cl.parts = partsFor(org, cl.kind, cl.x, cl.y);
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const pt of cl.parts) {
        x0 = Math.min(x0, pt.x0 - pt.r, pt.x1 - pt.r); x1 = Math.max(x1, pt.x0 + pt.r, pt.x1 + pt.r);
        y0 = Math.min(y0, pt.y0 - pt.r, pt.y1 - pt.r); y1 = Math.max(y1, pt.y0 + pt.r, pt.y1 + pt.r);
      }
      cl.box = { x0: x0 - 2, y0: y0 - 2, x1: x1 + 2, y1: y1 + 2 };
      cl.R = Math.max(x1 - x0, y1 - y0) / 2;
      cl.crackAng = Math.random() * Math.PI;
    }
    return cells;
  }

  // how close is a point to a cell (in pixels from its surface; negative = inside)
  function cellDist(cl, x, y) {
    let best = 1e9;
    for (const pt of cl.parts) { const q = partDist(pt, x, y); best = Math.min(best, q.d - pt.r); }
    return best;
  }

  function bakeSEM(cells) {
    const cv = CQ.makeCanvas(IMG.w, IMG.h);
    const x = cv.getContext('2d');
    const im = x.createImageData(IMG.w, IMG.h);
    const d = im.data;
    const rnd = CQ.seeded(1234);
    const barX0 = 192 - IMG.x - 9, barX1 = 192 - IMG.x + 9;
    const barY0 = 108 - IMG.y - 9, barY1 = 108 - IMG.y + 9;
    for (let py = 0; py < IMG.h; py++) {
      for (let px = 0; px < IMG.w; px++) {
        let v = 92 + (rnd() - 0.5) * 26;
        // grid bars (bright metal) with soft edges
        const inBarX = px >= barX0 && px <= barX1, inBarY = py >= barY0 && py <= barY1;
        if (inBarX || inBarY) {
          v = 150 + (rnd() - 0.5) * 20;
          const edge = Math.min(inBarX ? Math.min(px - barX0, barX1 - px) : 99, inBarY ? Math.min(py - barY0, barY1 - py) : 99);
          if (edge < 2) v += 40;
        }
        // cells: rounded bumps with bright edges (like real SEM pictures)
        const sx = px + IMG.x, sy = py + IMG.y;
        for (const cl of cells) {
          const B = cl.box;
          if (sx < B.x0 || sx > B.x1 || sy < B.y0 || sy > B.y1) continue;
          let best = null;
          for (const pt of cl.parts) {
            const q = partDist(pt, sx, sy);
            const dd = q.d / pt.r;
            if (dd < 1 && (!best || dd < best.dd)) best = { dd, dx: sx - q.nx, dy: sy - q.ny, r: pt.r };
          }
          if (!best) continue;
          const dd = best.dd;
          let cv2 = 120 + 40 * Math.sqrt(1 - dd) - ((best.dx + best.dy) / best.r) * 18;
          cv2 += 70 * Math.exp(-Math.pow((dd - 0.9) / 0.07, 2));
          if (cl.kind === 'broken') {
            // a crack across the cell, and a broken-off piece
            const ca = Math.cos(cl.crackAng), sa = Math.sin(cl.crackAng);
            const u = (sx - cl.x) * ca + (sy - cl.y) * sa, w = -(sx - cl.x) * sa + (sy - cl.y) * ca;
            if (Math.abs(w - Math.sin(u * 0.7) * 2.5) < 1.6) cv2 = 40;
            if (w > 3 && u > 2) cv2 = 70 + (rnd() - 0.5) * 10;
          }
          v = cv2 + (rnd() - 0.5) * 16;
        }
        v = CQ.clamp(v, 0, 255);
        const i = (py * IMG.w + px) * 4;
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
      }
    }
    x.putImageData(im, 0, 0);
    return cv;
  }

  // zoomed-in cell for the coating step: a round yeast cell, a rod, or a piece of worm
  function zoomShape(org) {
    const cx = 176, cy = 100;
    if (org === 'bacteria') return { type: 'capsule', cx, cy, hw: 56, r: 36 };
    if (org === 'worm') return { type: 'capsule', cx, cy, hw: 140, r: 30 };
    return { type: 'ellipse', cx, cy, rx: 56, ry: 49 };
  }
  function zoomDist(Z, x, y) {
    // 0 at the centre line, 1 at the edge
    if (Z.type === 'capsule') {
      const nx = Math.max(Z.cx - Z.hw, Math.min(Z.cx + Z.hw, x));
      return { dd: Math.hypot(x - nx, y - Z.cy) / Z.r, dx: x - nx, dy: y - Z.cy, R: Z.r };
    }
    const dx = x - Z.cx, dy = (y - Z.cy) * (Z.rx / Z.ry);
    return { dd: Math.hypot(dx, dy) / Z.rx, dx, dy, R: Z.rx };
  }
  // top surface of the shape at column x (where the platinum lands)
  function zoomTop(Z, x) {
    if (Z.type === 'capsule') {
      const ex = Math.abs(x - Z.cx) - Z.hw;
      if (ex <= 0) return Z.cy - Z.r;
      if (ex >= Z.r) return null;
      return Z.cy - Math.sqrt(Z.r * Z.r - ex * ex);
    }
    const t = 1 - Math.pow((x - Z.cx) / Z.rx, 2);
    return t <= 0 ? null : Z.cy - Z.ry * Math.sqrt(t);
  }
  function zoomSpan(Z) {
    const half = Z.type === 'capsule' ? Z.hw + Z.r * 0.95 : Z.rx * 0.95;
    return [Z.cx - half, Z.cx + half];
  }

  function bakeZoom(Z) {
    const W = 352, H = 176;
    const cv = CQ.makeCanvas(W, H);
    const x = cv.getContext('2d');
    const im = x.createImageData(W, H);
    const d = im.data;
    const rnd = CQ.seeded(99);
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      let v = 88 + (rnd() - 0.5) * 22;
      const q = zoomDist(Z, px, py);
      if (q.dd < 1) {
        v = 118 + 46 * Math.sqrt(1 - q.dd) - ((q.dx + q.dy) / q.R) * 20 + 60 * Math.exp(-Math.pow((q.dd - 0.92) / 0.06, 2)) + (rnd() - 0.5) * 14;
      } else if (q.dy > 0 && q.dd < 1.25) v -= 25 * (1.25 - q.dd) * 4 * Math.max(0, q.dy / q.R); // shadow
      v = CQ.clamp(v, 0, 255);
      const i = (py * W + px) * 4;
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    return cv;
  }

  // ------------------------------------------------------------ milling material
  function setupMill(polish) {
    const M = st.mill = st.mill || {};
    if (!polish) {
      M.hp = new Uint8Array(COLS * ROWS);
      M.zone = new Uint8Array(COLS * ROWS); // 0 = not millable, 1 = dig, 2 = keep
      M.canvas = CQ.makeCanvas(COLS * CELL, ROWS * CELL);
      const x = M.canvas.getContext('2d');
      const rnd = CQ.seeded(77);
      // draw the sample texture (a cell under a shiny platinum cap)
      for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
        let v = 98 + (rnd() - 0.5) * 30;
        const ox = i - 50, oy = j - 30;
        if ((ox + 18) * (ox + 18) + (oy + 2) * (oy + 2) < 60) v -= 40;    // organelle
        if ((ox - 20) * (ox - 20) * 0.5 + (oy - 8) * (oy - 8) < 30) v -= 30;
        if (j < 4) v = 200 + (rnd() - 0.5) * 30;                            // platinum cap
        v = CQ.clamp(v, 0, 255) | 0;
        x.fillStyle = 'rgb(' + v + ',' + v + ',' + (v + 6) + ')';
        x.fillRect(i * CELL, j * CELL, CELL, CELL);
        M.hp[j * COLS + i] = 4;
      }
    }
    M.polish = !!polish;
    M.zone.fill(0);
    let digTotal = 0;
    const keep0 = polish ? 25 : 20, keep1 = polish ? 31 : 36;      // rows [keep0, keep1)
    const c0 = polish ? 14 : 10, c1 = polish ? 86 : 90;             // cols [c0, c1)
    const dig0 = polish ? 20 : 6, dig1 = polish ? 36 : 50;
    for (let j = dig0; j < dig1; j++) for (let i = c0; i < c1; i++) {
      const k = j * COLS + i;
      if (j >= keep0 && j < keep1) M.zone[k] = 2;
      else if (M.hp[k] > 0) { M.zone[k] = 1; digTotal++; }
    }
    M.keep0 = keep0; M.keep1 = keep1; M.c0 = c0; M.c1 = c1; M.dig0 = dig0; M.dig1 = dig1;
    M.digTotal = Math.max(1, digTotal);
    M.digLeft = digTotal;
    M.brush = polish ? 3 : 4.2;
    M.time = 0;
  }

  function removeCell(k) {
    const M = st.mill;
    M.hp[k] = 0;
    const i = k % COLS, j = (k / COLS) | 0;
    const x = M.canvas.getContext('2d');
    // dark trench, a little lighter at the edges
    x.fillStyle = (i + j) % 7 === 0 ? '#1a1830' : '#0d0c1c';
    x.fillRect(i * CELL, j * CELL, CELL, CELL);
  }

  function damageTint(k) {
    const M = st.mill;
    const i = k % COLS, j = (k / COLS) | 0;
    const x = M.canvas.getContext('2d');
    x.fillStyle = 'rgba(255,90,60,0.35)';
    x.fillRect(i * CELL, j * CELL, CELL, CELL);
  }

  function mill(dt) {
    const M = st.mill;
    const bx = (st.beam.x - WX) / CELL, by = (st.beam.y - WY) / CELL;
    const r = M.brush;
    let dug = 0, hurt = false;
    const speed = M.time > 40 ? 2 : 1;
    for (let j = Math.floor(by - r); j <= Math.ceil(by + r); j++) {
      if (j < 0 || j >= ROWS) continue;
      for (let i = Math.floor(bx - r); i <= Math.ceil(bx + r); i++) {
        if (i < 0 || i >= COLS) continue;
        if ((i - bx) * (i - bx) + (j - by) * (j - by) > r * r) continue;
        const k = j * COLS + i;
        const z = M.zone[k];
        if (!z || M.hp[k] === 0) continue;
        if (z === 1) {
          if (Math.random() < 0.55 * speed) { M.hp[k]--; if (M.hp[k] === 0) { removeCell(k); M.digLeft--; dug++; } }
        } else if (z === 2) {
          // the slice we want to keep: the beam still damages it, slowly
          if (Math.random() < (M.polish ? 0.04 : 0.08)) {
            M.hp[k]--; hurt = true;
            if (M.hp[k] === 0) { removeCell(k); st.holes++; } else damageTint(k);
            st.damage++;
          }
        }
      }
    }
    if (dug) {
      for (let n = 0; n < Math.min(3, dug); n++) {
        st.parts.add({ x: st.beam.x + CQ.rand(-3, 3), y: st.beam.y + CQ.rand(-3, 3), vx: CQ.rand(-70, 70), vy: CQ.rand(-90, -20), g: 220,
          life: CQ.rand(0.3, 0.7), color: CQ.pick(['orange', 'goldL', 'white', '#c8a0ff']) });
      }
    }
    if (hurt && CQ.sceneTime - st.lastWarn > 4) {
      st.lastWarn = CQ.sceneTime;
      CQ.dialog.toast('fib_careful', { time: 2.5 });
      CQ.audio.sfx('oops');
    }
    return dug;
  }

  function finishMillPhase() {
    // clean up the last specks so the result looks neat
    const M = st.mill;
    for (let k = 0; k < M.zone.length; k++) if (M.zone[k] === 1 && M.hp[k] > 0) removeCell(k);
    M.digLeft = 0;
  }

  // ------------------------------------------------------------ views
  function drawIntro(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#1a2040', '#1e2548', '#222a50', '#262f58']);
    G.rect(c, 0, 160, CQ.W, 56, '#2a2f44');
    G.rect(c, 0, 160, CQ.W, 1, 'gold');
    c.drawImage(CQ.sprites.crossbeam, 0, 0, 62, 76, 20, 8, 124, 152);
    // two-beam diagram
    G.panel(c, 182, 22, 190, 132);
    const sx = 277, sy = 134;
    // sample on stage
    G.rect(c, sx - 26, sy + 4, 52, 6, 'g4'); G.rect(c, sx - 26, sy + 4, 52, 1, 'g3');
    G.ellipse(c, sx, sy + 2, 14, 3, 'gold'); G.ellipse(c, sx, sy + 1, 6, 2, '#9be58f');
    // SEM column (vertical) with an eye
    G.rect(c, sx - 9, 34, 18, 48, 'g1'); G.rect(c, sx - 9, 34, 3, 48, 'white'); G.rect(c, sx + 6, 34, 3, 48, 'g2');
    G.rect(c, sx - 5, 82, 10, 6, 'g2');
    G.ellipse(c, sx, 50, 6, 3, 'white'); G.circle(c, sx, 50, 2, 'blue'); G.px(c, sx, 50, 'ink');
    // FIB column (tilted 54 degrees, coming in from the upper left like on the Crossbeam) with a spark
    const ang = (54 * Math.PI) / 180, side = -1;
    const fx = sx + side * Math.sin(ang) * 30, fy = sy - 8 - Math.cos(ang) * 30;
    for (let t = 0; t < 46; t++) {
      const cx = fx + side * Math.sin(ang) * t, cy = fy - Math.cos(ang) * t;
      G.circle(c, cx, cy, 6, t < 2 ? 'g3' : 'g1');
    }
    // beams (moving dots)
    const ph = (CQ.time * 40) % 8;
    for (let y = 90 + ph; y < sy; y += 8) G.rect(c, sx - 1, y, 2, 3, 'blueL');
    for (let t = ph; t < 28; t += 8) G.rect(c, fx - side * Math.sin(ang) * t - 1, fy + Math.cos(ang) * t - 1, 3, 2, 'orange');
    G.text(c, 'LOOK', sx + 30, 46, { color: 'blueL' });
    G.text(c, 'ELECTRONS', sx + 30, 56, { color: 'g2' });
    G.text(c, 'CUT', 192, 34, { color: 'orange' });
    G.text(c, 'IONS', 192, 44, { color: 'g2' });
    const sp = Math.floor(CQ.time * 6) % 2;
    const kx = fx - 18, ky = fy - 22;
    G.px(c, kx, ky, sp ? 'goldL' : 'orange'); G.px(c, kx - 1, ky, 'orange'); G.px(c, kx + 1, ky, 'orange'); G.px(c, kx, ky - 1, 'orange'); G.px(c, kx, ky + 1, 'orange');
    G.text(c, 'ZEISS CROSSBEAM 550', 82, 170, { color: 'gold', align: 'center' });
    G.text(c, 'CRYO FIB-SEM', 82, 180, { color: 'g2', align: 'center' });
  }

  function drawMonitor(c, label) {
    const G = g();
    G.rect(c, 0, 0, CQ.W, CQ.H, '#101218');
    G.rect(c, IMG.x - 2, IMG.y - 2, IMG.w + 4, IMG.h + 4, 'g5');
    G.rect(c, IMG.x - 1, IMG.y - 1, IMG.w + 2, IMG.h + 2, 'ink');
    // databar like a real microscope image
    G.rect(c, IMG.x, IMG.y + IMG.h - 12, IMG.w, 12, 'black');
    G.text(c, label, IMG.x + 4, IMG.y + IMG.h - 10, { color: 'white' });
  }

  function drawFind(c) {
    const G = g();
    drawMonitor(c, 'SEM');
    // raster scan reveal
    const reveal = Math.min(IMG.h - 12, Math.floor((CQ.sceneTime - st.findStart) * 160));
    if (reveal > 0) c.drawImage(st.sem, 0, 0, IMG.w, reveal, IMG.x, IMG.y, IMG.w, reveal);
    if (reveal < IMG.h - 12) G.rect(c, IMG.x, IMG.y + reveal, IMG.w, 1, 'white');
    // scale bar
    G.rect(c, IMG.x + IMG.w - 60, IMG.y + IMG.h - 7, 40, 2, 'white');
    // hints: pulse good cells after a while
    if (st.phase === 'find' && CQ.sceneTime - st.findStart > 12 && Math.floor(CQ.time * 3) % 2) {
      st.cells.filter((cl) => cl.kind === 'good').forEach((cl) => G.ring(c, cl.x, cl.y, cl.R + 5, 'gold'));
    }
    // wrong picks get a little red X
    st.cells.forEach((cl) => {
      if (cl.tried) { G.line(c, cl.x - 5, cl.y - 5, cl.x + 5, cl.y + 5, 'red', 2); G.line(c, cl.x + 5, cl.y - 5, cl.x - 5, cl.y + 5, 'red', 2); }
    });
    if (st.phase === 'find' || st.phase === 'found') drawCrosshair(c, st.cur.x, st.cur.y, st.phase === 'found' ? 'green' : 'gold');
    if (st.phase === 'find' && !CQ.dialog.active) {
      G.rect(c, 120, 200, 144, 14, '#101218');
      G.pressLine(c, st.organism === 'worm' ? 'PICK A WORM' : 'PICK A CELL', 192, 204, 'white');
    }
  }

  function drawCrosshair(c, x, y, color) {
    const G = g();
    x = Math.round(x); y = Math.round(y);
    const r = 12 + Math.round(Math.sin(CQ.time * 6));
    G.ring(c, x, y, r, 'ink'); G.ring(c, x, y, r - 1, color);
    G.rect(c, x - r - 6, y, 8, 1, color); G.rect(c, x + r - 1, y, 8, 1, color);
    G.rect(c, x, y - r - 6, 1, 8, color); G.rect(c, x, y + r - 1, 1, 8, color);
    G.px(c, x, y, color);
  }

  function drawCoat(c) {
    const G = g();
    drawMonitor(c, 'SEM  ZOOM');
    c.drawImage(st.zoom, 0, 0, IMG.w, IMG.h - 12, IMG.x, IMG.y, IMG.w, IMG.h - 12);
    // platinum layer builds up on the top of the cell
    const Z = st.zshape;
    if (st.coat > 0) {
      const rows = Math.round(st.coat * 10);
      const [xa, xb] = zoomSpan(Z);
      for (let xx = Math.ceil(xa); xx <= xb; xx++) {
        const top = zoomTop(Z, xx);
        if (top === null) continue;
        for (let k = 0; k < rows; k++) {
          const y = Math.round(top - 2 + k * 0.6);
          if ((xx + y + k) % 2 === 0 || st.coat >= 1) G.px(c, IMG.x + xx, IMG.y + y, k < 2 ? '#f4f4ff' : '#c8ccd8');
        }
      }
      if (st.coat >= 1) {
        // shine sweeping across the coat
        const sft = CQ.clamp(((CQ.time * 0.8) % 1.6) - 0.3, 0, 1);
        const sx = xa + (xb - xa) * sft, sy = zoomTop(Z, sx);
        if (sy !== null) G.circle(c, IMG.x + sx, IMG.y + sy, 3, 'white');
      }
    }
    // GIS needle
    const nx = st.needleX, ny = st.needleY;
    G.line(c, IMG.x, IMG.y + 4, nx, ny, 'g4', 5);
    G.line(c, IMG.x, IMG.y + 2, nx, ny - 2, 'g2', 2);
    G.circle(c, nx, ny, 3, 'g3');
    G.text(c, 'PLATINUM SPRAY', IMG.x + 6, IMG.y + 18, { color: 'goldL' });
    // coat meter
    G.rect(c, 120, 200, 144, 12, 'ink');
    G.rect(c, 122, 202, Math.round(140 * st.coat), 8, 'g1');
    G.rect(c, 122, 202, Math.round(140 * st.coat), 2, 'white');
    G.text(c, 'COAT', 116, 203, { color: 'g2', align: 'right' });
    if (st.phase === 'coat' && !CQ.dialog.active && st.coat < 1 && !CQ.input.actHeld()) {
      CQ.drawCallout(c, 'HOLD!', 318, 183 + Math.round(Math.sin(CQ.time * 6) * 2));
    }
  }

  function drawMill(c) {
    const G = g();
    const M = st.mill;
    drawMonitor(c, 'FIB  ION BEAM');
    // mound of sample around the window
    G.rect(c, IMG.x, IMG.y, IMG.w, IMG.h - 12, '#16141f');
    G.ellipse(c, 192, WY + 60, 150, 70, '#4a4858');
    G.ellipse(c, 192, WY + 58, 146, 66, '#5d5b6c');
    G.dither(c, 60, WY - 4, 264, 4, '#8f8ea0', 0);
    c.drawImage(M.canvas, WX, WY);
    // zone outlines (marching ants)
    const ants = Math.floor(CQ.time * 8) % 4;
    const dash = (x0, y0, x1, y1, colr) => {
      for (let x = x0; x <= x1; x++) { if ((x + ants) % 4 < 2) { G.px(c, x, y0, colr); G.px(c, x, y1, colr); } }
      for (let y = y0; y <= y1; y++) { if ((y + ants) % 4 < 2) { G.px(c, x0, y, colr); G.px(c, x1, y, colr); } }
    };
    const X = (i) => WX + i * CELL, Y = (j) => WY + j * CELL;
    if (st.phase === 'mill' || st.phase === 'polish') {
      dash(X(M.c0) - 1, Y(M.dig0) - 1, X(M.c1), Y(M.keep0) - 1, 'orange');
      dash(X(M.c0) - 1, Y(M.keep1), X(M.c1), Y(M.dig1), 'orange');
      if (!M.polish) {
        G.text(c, 'DIG', X(M.c0) - 4, Y(M.dig0) + 2, { color: 'orange', align: 'right' });
        G.text(c, 'DIG', X(M.c0) - 4, Y(M.dig1) - 8, { color: 'orange', align: 'right' });
      }
    }
    // the slice to keep
    const kc = Math.floor(CQ.time * 3) % 2 ? 'gold' : 'goldL';
    G.rect(c, X(M.c0) - 2, Y(M.keep0), 1, (M.keep1 - M.keep0) * CELL, kc);
    G.rect(c, X(M.c1) + 1, Y(M.keep0), 1, (M.keep1 - M.keep0) * CELL, kc);
    G.text(c, 'KEEP', X(M.c1) + 5, Y(M.keep0) + (M.keep1 - M.keep0) - 4, { color: 'gold' });
    // beam
    if (st.phase === 'mill' || st.phase === 'polish') {
      const r = M.brush * CELL;
      const on = st.milling;
      // ion beam coming in from the upper right
      if (on) for (let k = 0; k < 30; k += 3) G.px(c, st.beam.x - 20 + k * 0.66 + CQ.rand(-1, 1), st.beam.y - 26 + k * 0.9, k % 2 ? '#c8a0ff' : 'white');
      G.ring(c, st.beam.x, st.beam.y, r + 1, on ? 'white' : 'purple');
      if (on) { G.circle(c, st.beam.x, st.beam.y, r * 0.6, Math.floor(CQ.time * 20) % 2 ? '#e8d8ff' : '#c8a0ff'); }
      G.px(c, st.beam.x, st.beam.y, 'white');
      // progress
      const p = 1 - M.digLeft / M.digTotal;
      G.rect(c, 120, 200, 144, 12, 'ink');
      G.rect(c, 122, 202, Math.round(140 * Math.min(1, p / 0.85)), 8, 'orange');
      G.rect(c, 122, 202, Math.round(140 * Math.min(1, p / 0.85)), 2, 'goldL');
      G.text(c, st.phase === 'polish' ? 'POLISH' : 'DIG', 116, 203, { color: 'orange', align: 'right' });
      if (!st.milling && !CQ.dialog.active) {
        CQ.drawCallout(c, 'HOLD!', 318, 183 + Math.round(Math.sin(CQ.time * 6) * 2));
      }
    }
    st.parts.draw(c);
  }

  function drawLamella(c) {
    const G = g();
    G.bands(c, 0, 0, CQ.W, CQ.H, ['#0c0e1e', '#10142a', '#141a36', '#182042']);
    const t = CQ.sceneTime - st.lamT;
    if (!st.showHair) {
      // our slice glowing
      G.text(c, 'OUR LAMELLA', CQ.W / 2, 30, { color: 'gold', scale: 2, align: 'center', shadow: 'goldDD' });
      const w = Math.min(220, t * 300);
      G.rect(c, 192 - w / 2, 70, w, 6, 'goldDD');
      G.rect(c, 192 - w / 2, 71, w, 4, 'gold');
      G.rect(c, 192 - w / 2, 71, w, 1, 'goldLL');
      G.text(c, 'A SUPER THIN SLICE OF THE CELL', CQ.W / 2, 92, { color: 'iceL', align: 'center' });
    } else {
      // how thin? compare with one hair
      G.text(c, 'ONE HAIR', 40, 22, { color: 'white' });
      G.rect(c, 40, 34, 304, 46, 'brownD');
      G.rect(c, 40, 36, 304, 40, 'brown');
      G.rect(c, 40, 40, 304, 6, 'brownL');
      G.text(c, 'OUR SLICE', 40, 100, { color: 'gold' });
      G.rect(c, 40, 114, 304, 1, Math.floor(CQ.time * 4) % 2 ? 'goldL' : 'gold');
      G.text(c, 'SO THIN!', 344, 124, { color: 'goldL', align: 'right' });
    }
    st.parts.draw(c);
  }

  // ------------------------------------------------------------ flow
  function startFind() {
    st.view = 'find';
    st.phase = 'busy';
    st.findStart = CQ.sceneTime;
    st.cur = { x: 192, y: 108 };
    CQ.audio.playMusic('game');
    CQ.dialog.run([st.organism === 'worm' ? 'fib_find_worm' : 'fib_find'], () => { st.phase = 'find'; st.findStart = CQ.sceneTime - 1.2; });
  }

  function pickCell() {
    let best = null, bd = 1e9;
    for (const cl of st.cells) { const d = cellDist(cl, st.cur.x, st.cur.y); if (d < bd) { bd = d; best = cl; } }
    if (!best || bd > 10) { CQ.audio.sfx('oops'); CQ.dialog.toast('fib_bad_none', { time: 2.5 }); return; }
    if (best.kind === 'good') {
      st.phase = 'found';
      st.cur.x = best.x; st.cur.y = best.y;
      CQ.audio.sfx('ok');
      CQ.dialog.run([st.organism === 'worm' ? 'fib_good_worm' : 'fib_good'], () => {
        st.view = 'coat';
        st.phase = 'busy';
        st.needleX = IMG.x; st.needleY = IMG.y;
        CQ.dialog.run(['fib_coat'], () => { st.phase = 'coat'; });
      });
    } else {
      st.wrongPicks++;
      best.tried = true;
      CQ.audio.sfx('oops');
      CQ.dialog.toast(best.kind === 'bar' ? 'fib_bad_bar' : best.kind === 'broken' ? 'fib_bad_broken' : 'fib_bad_clump', { time: 3 });
    }
  }

  function startMill() {
    st.view = 'mill';
    st.phase = 'busy';
    setupMill(false);
    st.beam = { x: 192, y: WY + 20 };
    CQ.dialog.run(['fib_mill', 'fib_keep'], () => { st.phase = 'mill'; st.mill.time = 0; });
  }

  function finish() {
    let stars = 3;
    if (st.holes > 10 || st.damage > 250) stars--;
    if (st.holes > 30 || st.damage > 500) stars--;
    CQ.finishStage(scene, 'fib', stars, ['fib_next']);
  }

  const scene = CQ.scenes.fib = {
    state: () => st, // for testing
    enter() {
      const org = CQ.game.organism || 'yeast';
      st = {
        view: 'intro', phase: 'busy', organism: org,
        cells: makeCells(org), sem: null, zoom: null, zshape: zoomShape(org), cur: { x: 192, y: 108 }, findStart: 0, wrongPicks: 0,
        coat: 0, needleX: IMG.x, needleY: IMG.y,
        beam: { x: 192, y: 80 }, milling: false, damage: 0, holes: 0, lastWarn: -10,
        parts: new CQ.gfx.Particles(), lamT: 0, showHair: false,
      };
      st.sem = bakeSEM(st.cells);
      st.zoom = bakeZoom(st.zshape);
      scene.phase = null;
      CQ.audio.playMusic('cold');
      CQ.after(0.5, () => CQ.dialog.run(['fib_1', 'fib_2', 'fib_why'], () => startFind()));
    },

    update(dt) {
      st.parts.update(dt);
      if (scene.phase === 'result') return;
      const I = CQ.input, P = I.pointer;

      if (st.phase === 'find' && !CQ.dialog.active) {
        if (P.moved || P.pressed) { st.cur.x = P.x; st.cur.y = P.y; }
        st.cur.x = CQ.clamp(st.cur.x + I.stick.x * 120 * dt, IMG.x + 4, IMG.x + IMG.w - 4);
        st.cur.y = CQ.clamp(st.cur.y + I.stick.y * 120 * dt, IMG.y + 4, IMG.y + IMG.h - 16);
        if (I.act()) pickCell();
        return;
      }

      if (st.phase === 'coat' && !CQ.dialog.active) {
        // needle slides in, then hold A to spray
        const tx = IMG.x + 120, ty = IMG.y + 40;
        st.needleX += (tx - st.needleX) * Math.min(1, dt * 4);
        st.needleY += (ty - st.needleY) * Math.min(1, dt * 4);
        if (I.actHeld() && st.coat < 1) {
          st.coat = Math.min(1, st.coat + dt * 0.42);
          if (Math.random() < 0.3) CQ.audio.sfx('sparkle');
          for (let n = 0; n < 2; n++) {
            const [xa, xb] = zoomSpan(st.zshape);
            const zx = CQ.rand(xa, xb), zy = zoomTop(st.zshape, zx);
            if (zy === null) continue;
            const ex = IMG.x + zx, ey = IMG.y + zy;
            const life = CQ.rand(0.3, 0.6);
            st.parts.add({ x: st.needleX, y: st.needleY, vx: (ex - st.needleX) / life, vy: (ey - st.needleY) / life, life, color: CQ.pick(['white', 'g1', '#e8e8ff']) });
          }
          if (st.coat >= 1) {
            st.phase = 'busy';
            CQ.audio.sfx('star');
            CQ.after(0.6, () => CQ.dialog.run(['fib_coat_done'], () => startMill()));
          }
        }
        return;
      }

      if ((st.phase === 'mill' || st.phase === 'polish') && !CQ.dialog.active) {
        const M = st.mill;
        M.time += dt;
        if (P.moved || P.pressed) { st.beam.x = P.x; st.beam.y = P.y; }
        st.beam.x = CQ.clamp(st.beam.x + I.stick.x * 90 * dt, WX, WX + COLS * CELL);
        st.beam.y = CQ.clamp(st.beam.y + I.stick.y * 90 * dt, WY, WY + ROWS * CELL);
        if (M.polish && !(P.moved || P.pressed)) {
          // gentle help: the beam is pulled onto the thin strips that still need polishing
          const yTop = WY + ((M.dig0 + M.keep0) / 2) * CELL, yBot = WY + ((M.keep1 + M.dig1) / 2) * CELL;
          const ty = Math.abs(st.beam.y - yTop) < Math.abs(st.beam.y - yBot) ? yTop : yBot;
          if (Math.abs(st.beam.y - ty) < 12 && Math.abs(I.stick.y) < 0.5) st.beam.y += (ty - st.beam.y) * Math.min(1, dt * 8);
        }
        st.milling = I.actHeld();
        if (st.milling) {
          mill(dt);
          st.zapT = (st.zapT || 0) - dt;
          if (st.zapT <= 0) { st.zapT = 0.07; CQ.audio.sfx('zap'); }
        }
        const p = 1 - M.digLeft / M.digTotal;
        if (p >= 0.85) {
          finishMillPhase();
          st.milling = false;
          CQ.audio.sfx('ok');
          if (st.phase === 'mill') {
            st.phase = 'busy';
            CQ.after(0.5, () => {
              setupMill(true);
              CQ.dialog.run(['fib_polish'], () => { st.phase = 'polish'; st.mill.time = 0; });
            });
          } else {
            st.phase = 'busy';
            CQ.audio.sfx('win');
            CQ.after(0.9, () => {
              st.view = 'lamella';
              st.lamT = CQ.sceneTime;
              st.parts.burst(192, 73, 30, { colors: ['gold', 'goldL', 'white'], min: 30, max: 90 });
              CQ.dialog.run(['fib_done'], () => {
                st.showHair = true;
                CQ.dialog.run(['fib_fact'], () => finish());
              });
            });
          }
        }
        return;
      }
    },

    draw(c) {
      if (st.view === 'intro') drawIntro(c);
      else if (st.view === 'find') drawFind(c);
      else if (st.view === 'coat') drawCoat(c);
      else if (st.view === 'mill') drawMill(c);
      else if (st.view === 'lamella') drawLamella(c);
      if (st.view !== 'intro' && st.view !== 'lamella' && scene.phase !== 'result') {
        const idx = st.view === 'find' ? 0 : st.view === 'coat' ? 1 : st.phase === 'polish' || (st.mill && st.mill.polish) ? 3 : 2;
        drawSteps(c, ['FIND', 'COAT', 'DIG', 'POLISH'], idx);
      }
      if (st.view === 'coat') st.parts.draw(c);
      if (scene.phase === 'result') CQ.drawResult(c, scene);
    },
  };
})();
