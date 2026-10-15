// CRYO QUEST - little 3D "cells" used by the Krios stage (tilt pictures) and the finale (tomogram slices).
// There is one for each sample kids can pick:
//   bacteria - a rod-shaped cell with two membranes, DNA in a tangle (no nucleus!), storage granules, a flagellum
//   yeast    - an oval cell with a cell wall, nucleus, mitochondria, a vacuole and a lipid droplet
//   worm     - a muscle cell from the worm, with muscle fibers and mitochondria
// Dense things are dark, like in real cryo-ET data.
(function () {
  'use strict';
  const CQ = window.CQ;
  const W = 220, H = 150, D = 60;
  // depths (0..D) of the four things kids look for, in checklist order
  const TZ = [10, 22, 34, 48];

  const gray = (v) => { v = Math.max(0, Math.min(255, v | 0)); return 'rgb(' + v + ',' + v + ',' + v + ')'; };

  // ---------------------------------------------------------------- shapes
  // ellipse {type:'ellipse', cx, cy, rx, ry}  or  capsule (a rod) {type:'capsule', cx, cy, hw, r}
  function span(S, y, inset) {
    inset = inset || 0;
    if (S.type === 'capsule') {
      const r = S.r - inset, dy = Math.abs(y - S.cy);
      if (r <= 0 || dy > r) return null;
      const dx = S.hw + Math.sqrt(r * r - dy * dy);
      return [S.cx - dx, S.cx + dx];
    }
    const rx = S.rx - inset, ry = S.ry - inset;
    if (rx <= 0 || ry <= 0) return null;
    const t = 1 - ((y - S.cy) * (y - S.cy)) / (ry * ry);
    if (t < 0) return null;
    const dx = rx * Math.sqrt(t);
    return [S.cx - dx, S.cx + dx];
  }
  function inside(S, x, y, inset) { const s = span(S, y, inset); return !!s && x >= s[0] && x <= s[1]; }
  function halfHeight(S) { return S.type === 'capsule' ? S.r : S.ry; }
  function halfWidth(S) { return S.type === 'capsule' ? S.hw + S.r : S.rx; }

  // points along the outline, `inset` pixels inside the edge (negative = outside)
  function outline(S, inset, step) {
    step = step || 0.5;
    const pts = [];
    if (S.type === 'capsule') {
      const r = S.r - inset;
      for (let x = -S.hw; x <= S.hw; x += step) { pts.push([S.cx + x, S.cy - r]); pts.push([S.cx + x, S.cy + r]); }
      const n = Math.ceil((Math.PI * r) / step);
      for (let i = 0; i <= n; i++) {
        const a = -Math.PI / 2 + (i / n) * Math.PI;
        pts.push([S.cx + S.hw + Math.cos(a) * r, S.cy + Math.sin(a) * r]);
        pts.push([S.cx - S.hw - Math.cos(a) * r, S.cy + Math.sin(a) * r]);
      }
    } else {
      const rx = S.rx - inset, ry = S.ry - inset;
      const n = Math.ceil((Math.PI * (rx + ry)) / step);
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([S.cx + Math.cos(a) * rx, S.cy + Math.sin(a) * ry]); }
    }
    return pts;
  }
  // xc/xs squeeze the shape sideways (used for tilted pictures)
  function fillShape(c, S, inset, colr, xc, xs) {
    xc = xc === undefined ? S.cx : xc; xs = xs || 1;
    c.fillStyle = colr;
    const hh = halfHeight(S);
    for (let y = Math.floor(S.cy - hh); y <= Math.ceil(S.cy + hh); y++) {
      const s = span(S, y, inset);
      if (!s) continue;
      const x0 = Math.round(xc + (s[0] - S.cx) * xs), x1 = Math.round(xc + (s[1] - S.cx) * xs);
      c.fillRect(x0, y, Math.max(1, x1 - x0 + 1), 1);
    }
  }
  function ringShape(c, S, inset, colr, xc, xs) {
    xc = xc === undefined ? S.cx : xc; xs = xs || 1;
    c.fillStyle = colr;
    for (const p of outline(S, inset, 0.5)) c.fillRect(Math.round(xc + (p[0] - S.cx) * xs), Math.round(p[1]), 1, 1);
  }

  // ---------------------------------------------------------------- ellipses (organelles)
  function ellipseRing(c, cx, cy, rx, ry, colr, rot, skip) {
    const steps = Math.max(40, Math.floor((rx + ry) * 3));
    c.fillStyle = colr;
    const cr = Math.cos(rot || 0), sr = Math.sin(rot || 0);
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      if (skip && skip(a)) continue;
      const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
      c.fillRect(Math.round(cx + ex * cr - ey * sr), Math.round(cy + ex * sr + ey * cr), 1, 1);
    }
  }
  function ellipseFill(c, cx, cy, rx, ry, colr, rot) {
    c.fillStyle = colr;
    if (rx < 0.5 || ry < 0.5) return;
    if (!rot) {
      for (let y = -Math.floor(ry); y <= Math.floor(ry); y++) {
        const t = 1 - (y * y) / (ry * ry);
        if (t < 0) continue;
        const dx = Math.floor(rx * Math.sqrt(t) + 0.35);
        c.fillRect(Math.round(cx - dx), Math.round(cy + y), dx * 2 + 1, 1);
      }
      return;
    }
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const R = Math.ceil(Math.max(rx, ry));
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      const ux = x * cr + y * sr, uy = -x * sr + y * cr;
      if ((ux * ux) / (rx * rx) + (uy * uy) / (ry * ry) <= 1) c.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
    }
  }
  function inEllipsoid(o, x, y, z, margin) {
    margin = margin || 0;
    const cr = Math.cos(o.ang || 0), sr = Math.sin(o.ang || 0);
    const dx = x - o.x, dy = y - o.y;
    const ux = dx * cr + dy * sr, uy = -dx * sr + dy * cr;
    const a = ux / (o.rx + margin), b = uy / (o.ry + margin), cz = (z - o.z) / (o.rz + margin);
    return a * a + b * b + cz * cz < 1;
  }

  // ---------------------------------------------------------------- the three cells
  function addRibosomes(M, r, n, insetMin, avoid) {
    const S = M.shape, hw = halfWidth(S), hh = halfHeight(S);
    let tries = 0;
    while (M.ribos.length < n && tries++ < n * 20) {
      const x = S.cx + (r() * 2 - 1) * hw, y = S.cy + (r() * 2 - 1) * hh, z = 2 + r() * (D - 4);
      if (!inside(S, x, y, insetMin)) continue;
      if (M.organelles.some((o) => inEllipsoid(o, x, y, z, 3))) continue;
      if (avoid && avoid(x, y, z)) continue;
      M.ribos.push({ x, y, z });
    }
  }
  function addPolysome(M, r, x, y, z) {
    // a little spiral of ribosomes reading the same message: easy to spot
    M.poly = { x, y, z };
    for (let i = 0; i < 9; i++) {
      const a = i * 0.8;
      M.ribos.push({ x: x + Math.cos(a) * (4 + i * 1.3), y: y + Math.sin(a) * (4 + i * 1.3), z: z + (r() - 0.5) * 3, target: true });
    }
  }
  function addVesicles(M, r, n, insetMin) {
    const S = M.shape;
    let tries = 0;
    while (n > 0 && tries++ < 200) {
      const v = { kind: 'vesicle', x: S.cx + (r() * 2 - 1) * halfWidth(S), y: S.cy + (r() * 2 - 1) * halfHeight(S), z: 6 + r() * (D - 12), rx: 0, ry: 0, rz: 0 };
      v.rx = v.ry = v.rz = 4 + r() * 4;
      if (!inside(M.shape, v.x, v.y, insetMin + v.rx)) continue;
      if (M.organelles.some((o) => inEllipsoid(o, v.x, v.y, v.z, v.rx + 4))) continue;
      M.organelles.push(v);
      n--;
    }
  }

  function buildBacteria(r) {
    const M = {
      organism: 'bacteria', W, H, D,
      shape: { type: 'capsule', cx: 110, cy: 70, hw: 66, r: 36 },
      // outer membrane, thin cell wall, inner membrane (this kind of bacterium has two membranes)
      layers: [{ inset: 0, fill: 136 }, { inset: 10, fill: 124 }],
      rings: [[0, 62], [2, 62], [5, 98], [8, 62], [10, 62]],
      tiltRing: 9,
      organelles: [], ribos: [], fibers: [],
    };
    // storage granules: very dense, dark balls
    const granule = { kind: 'granule', x: 160, y: 60, z: 30, rx: 7, ry: 7, rz: 7 };
    M.organelles.push(granule, { kind: 'granule', x: 50, y: 82, z: 16, rx: 5, ry: 5, rz: 5 });
    M.kTarget = granule;
    // the nucleoid: DNA in a tangle in the middle (no nucleus around it)
    M.nucleoid = { x: 112, y: 70, rx: 42, ry: 15, z0: TZ[2] - 10, z1: TZ[2] + 10 };
    for (let i = 0; i < 280; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r());
      M.fibers.push({ x: M.nucleoid.x + Math.cos(a) * M.nucleoid.rx * d, y: M.nucleoid.y + Math.sin(a) * M.nucleoid.ry * d,
        z: M.nucleoid.z0 + r() * (M.nucleoid.z1 - M.nucleoid.z0), a: r() * Math.PI, l: 2 + r() * 4 });
    }
    // flagellum: a long thin tail starting at a motor in the envelope
    const pts = [];
    for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push([64 - t * 58, 106 + t * 40 + Math.sin(t * 12) * 3]); }
    M.flag = { pts, z: TZ[3] };
    addPolysome(M, r, 70, 56, TZ[1]);
    addRibosomes(M, r, 380, 13, (x, y, z) => {
      const N = M.nucleoid, dx = (x - N.x) / (N.rx + 2), dy = (y - N.y) / (N.ry + 2);
      return dx * dx + dy * dy < 1 && z > N.z0 - 3 && z < N.z1 + 3;
    });
    M.targets = [
      { key: 'membrane', name: 'MEMBRANES', line: 'tm_membrane_bac', z: TZ[0], range: 4, glow: { type: 'outline', inset: -3 }, at: { x: 22, y: 70 } },
      { key: 'ribosome', name: 'RIBOSOMES', line: 'tm_ribosome', z: TZ[1], range: 4, glow: { type: 'circle', x: M.poly.x, y: M.poly.y, r: 17 }, at: M.poly },
      { key: 'dna', name: 'DNA', line: 'tm_dna', z: TZ[2], range: 6, glow: { type: 'ellipse', x: M.nucleoid.x, y: M.nucleoid.y, rx: M.nucleoid.rx + 5, ry: M.nucleoid.ry + 5, ang: 0 }, at: { x: M.nucleoid.x, y: M.nucleoid.y } },
      { key: 'flagellum', name: 'FLAGELLUM', line: 'tm_flagellum', z: TZ[3], range: 4, glow: { type: 'path', pts }, at: { x: pts[30][0], y: pts[30][1] } },
    ];
    return M;
  }

  function buildYeast(r) {
    const M = {
      organism: 'yeast', W, H, D,
      shape: { type: 'ellipse', cx: 110, cy: 75, rx: 104, ry: 70 },
      // thick cell wall outside, then the cell membrane
      layers: [{ inset: 0, fill: 146 }, { inset: 7, fill: 126 }],
      rings: [[0, 104], [7, 62], [9, 62]],
      tiltRing: 8,
      organelles: [], ribos: [], fibers: [],
    };
    const mito = { kind: 'mito', x: 156, y: 52, z: TZ[2], rx: 26, ry: 12, rz: 10, ang: -0.3 };
    const nucleus = { kind: 'nucleus', x: 64, y: 90, z: TZ[3], rx: 34, ry: 30, rz: 20, ang: 0 };
    M.organelles.push(mito, nucleus,
      { kind: 'mito', x: 122, y: 122, z: 14, rx: 16, ry: 8, rz: 7, ang: 0.2 },
      { kind: 'vacuole', x: 164, y: 104, z: 20, rx: 24, ry: 20, rz: 15, ang: 0 },
      { kind: 'lipid', x: 112, y: 32, z: 12, rx: 7, ry: 7, rz: 7, ang: 0 });
    M.kTarget = mito;
    addVesicles(M, r, 6, 14);
    addPolysome(M, r, 100, 62, TZ[1]);
    addRibosomes(M, r, 320, 11);
    M.targets = [
      { key: 'membrane', name: 'MEMBRANE', line: 'tm_membrane', z: TZ[0], range: 4, glow: { type: 'outline', inset: -3 }, at: { x: 12, y: 75 } },
      { key: 'ribosome', name: 'RIBOSOMES', line: 'tm_ribosome', z: TZ[1], range: 4, glow: { type: 'circle', x: M.poly.x, y: M.poly.y, r: 17 }, at: M.poly },
      { key: 'mito', name: 'MITOCHONDRION', line: 'tm_mito', z: TZ[2], range: 5, glow: { type: 'ellipse', x: mito.x, y: mito.y, rx: mito.rx + 5, ry: mito.ry + 5, ang: mito.ang }, at: mito },
      { key: 'nucleus', name: 'NUCLEUS', line: 'tm_nucleus', z: TZ[3], range: 4, glow: { type: 'ellipse', x: nucleus.x, y: nucleus.y, rx: nucleus.rx + 5, ry: nucleus.ry + 5, ang: 0 }, at: nucleus },
    ];
    return M;
  }

  function buildWorm(r) {
    const M = {
      organism: 'worm', W, H, D,
      shape: { type: 'ellipse', cx: 110, cy: 75, rx: 102, ry: 66 },
      layers: [{ inset: 0, fill: 128 }],
      rings: [[0, 60], [2, 60]],
      tiltRing: 0,
      organelles: [], ribos: [], fibers: [],
    };
    const mito = { kind: 'mito', x: 150, y: 52, z: TZ[2], rx: 28, ry: 13, rz: 11, ang: -0.25 };
    M.organelles.push(mito, { kind: 'mito', x: 60, y: 58, z: 16, rx: 18, ry: 9, rz: 8, ang: 0.3 },
      { kind: 'mito', x: 172, y: 84, z: 50, rx: 14, ry: 7, rz: 6, ang: 0.6 });
    M.kTarget = mito;
    // muscle fibers: rows of thick and thin filaments that slide to pull
    M.muscle = { x0: 50, x1: 172, y0: 98, y1: 120, z0: TZ[3] - 6, z1: TZ[3] + 6 };
    addVesicles(M, r, 7, 10);
    addPolysome(M, r, 100, 40, TZ[1]);
    const Mu = M.muscle;
    addRibosomes(M, r, 280, 6, (x, y, z) => x > Mu.x0 - 3 && x < Mu.x1 + 3 && y > Mu.y0 - 3 && y < Mu.y1 + 3 && z > Mu.z0 - 3 && z < Mu.z1 + 3);
    M.targets = [
      { key: 'membrane', name: 'MEMBRANE', line: 'tm_membrane', z: TZ[0], range: 4, glow: { type: 'outline', inset: -3 }, at: { x: 12, y: 75 } },
      { key: 'ribosome', name: 'RIBOSOMES', line: 'tm_ribosome', z: TZ[1], range: 4, glow: { type: 'circle', x: M.poly.x, y: M.poly.y, r: 17 }, at: M.poly },
      { key: 'mito', name: 'MITOCHONDRION', line: 'tm_mito', z: TZ[2], range: 5, glow: { type: 'ellipse', x: mito.x, y: mito.y, rx: mito.rx + 5, ry: mito.ry + 5, ang: mito.ang }, at: mito },
      { key: 'muscle', name: 'MUSCLE FIBERS', line: 'tm_muscle', z: TZ[3], range: 5, glow: { type: 'rect', x0: Mu.x0 - 4, y0: Mu.y0 - 4, x1: Mu.x1 + 4, y1: Mu.y1 + 4 }, at: { x: (Mu.x0 + Mu.x1) / 2, y: Mu.y0 } },
    ];
    return M;
  }

  function build(seed, organism) {
    const r = CQ.seeded(seed || 4242);
    if (organism === 'bacteria') return buildBacteria(r);
    if (organism === 'worm') return buildWorm(r);
    return buildYeast(r);
  }

  // ---------------------------------------------------------------- noise
  function noiseCanvas(seed, amount) {
    const cv = CQ.makeCanvas(W, H);
    const x = cv.getContext('2d');
    const im = x.createImageData(W, H);
    const d = im.data;
    const rnd = CQ.seeded(seed);
    for (let i = 0; i < W * H; i++) {
      const n = (rnd() - 0.5) * amount;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = n > 0 ? 255 : 0;
      d[i * 4 + 3] = Math.abs(n) | 0;
    }
    x.putImageData(im, 0, 0);
    return cv;
  }
  let noises = null;
  function getNoise(k) {
    if (!noises) noises = [noiseCanvas(11, 90), noiseCanvas(22, 90), noiseCanvas(33, 90), noiseCanvas(44, 150)];
    return noises[((k % noises.length) + noises.length) % noises.length];
  }

  // ---------------------------------------------------------------- drawing pieces
  function drawOrganelleSlice(c, o, z) {
    const dz = (z - o.z) / o.rz;
    if (Math.abs(dz) >= 1) return;
    const s = Math.sqrt(1 - dz * dz);
    const rx = o.rx * s, ry = o.ry * s;
    if (rx < 0.8) return;
    if (o.kind === 'mito') {
      ellipseFill(c, o.x, o.y, rx, ry, gray(96), o.ang);
      ellipseRing(c, o.x, o.y, rx, ry, gray(48), o.ang);
      if (rx > 4 && ry > 3) ellipseRing(c, o.x, o.y, rx - 2, ry - 2, gray(58), o.ang);
      // cristae (inner folds)
      c.fillStyle = gray(66);
      const cr = Math.cos(o.ang), sr = Math.sin(o.ang);
      for (let k = -2; k <= 2; k++) {
        const ox = k * rx * 0.33;
        for (let t = -0.7; t <= 0.7; t += 0.06) {
          const lx = ox + Math.sin(t * 6 + k) * 2, ly = t * ry;
          c.fillRect(Math.round(o.x + lx * cr - ly * sr), Math.round(o.y + lx * sr + ly * cr), 1, 1);
        }
      }
    } else if (o.kind === 'nucleus') {
      ellipseFill(c, o.x, o.y, rx, ry, gray(116));
      // a little darker patches inside (packed DNA)
      c.fillStyle = gray(104);
      const rr = CQ.seeded(77);
      for (let i = 0; i < 40; i++) {
        const a = rr() * Math.PI * 2, d = Math.sqrt(rr()) * 0.85;
        c.fillRect(Math.round(o.x + Math.cos(a) * rx * d), Math.round(o.y + Math.sin(a) * ry * d), 2, 2);
      }
      // double membrane with little gaps: the nuclear pores
      const pore = (a) => Math.abs(((a * 8) / (Math.PI * 2)) % 1 - 0.5) < 0.05;
      ellipseRing(c, o.x, o.y, rx, ry, gray(58), 0, pore);
      if (rx > 5) ellipseRing(c, o.x, o.y, rx - 3, ry - 3, gray(58), 0, pore);
    } else if (o.kind === 'vacuole') {
      ellipseFill(c, o.x, o.y, rx, ry, gray(152));
      ellipseRing(c, o.x, o.y, rx, ry, gray(70));
    } else if (o.kind === 'granule') {
      ellipseFill(c, o.x, o.y, rx, ry, gray(34));
      ellipseRing(c, o.x, o.y, rx, ry, gray(22));
    } else if (o.kind === 'lipid') {
      ellipseFill(c, o.x, o.y, rx, ry, gray(106));
      ellipseRing(c, o.x, o.y, rx, ry, gray(88));
    } else {
      ellipseFill(c, o.x, o.y, rx, ry, gray(136));
      ellipseRing(c, o.x, o.y, rx, ry, gray(55));
    }
  }

  function drawMuscle(c, Mu, xmap, alpha) {
    // thick filaments (dark dashes) between thin filaments, with dense bodies holding them
    for (let row = 0, y = Mu.y0; y <= Mu.y1; row++, y += 3) {
      if (row % 2 === 0) {
        c.fillStyle = gray(70);
        for (let x = Mu.x0; x < Mu.x1; x += 38) {
          const a = xmap(x), b = xmap(Math.min(Mu.x1, x + 28));
          c.fillRect(Math.round(Math.min(a, b)), y, Math.max(1, Math.round(Math.abs(b - a))), 2);
        }
      } else {
        c.fillStyle = gray(96);
        const a = xmap(Mu.x0), b = xmap(Mu.x1);
        c.fillRect(Math.round(Math.min(a, b)), y, Math.round(Math.abs(b - a)), 1);
      }
    }
    c.fillStyle = gray(44);
    for (let x = Mu.x0 + 32; x < Mu.x1; x += 38) {
      for (let y = Mu.y0 + 1; y < Mu.y1; y += 6) c.fillRect(Math.round(xmap(x)), y, 2, 3);
    }
  }

  // ---------------------------------------------------------------- a slice at depth z (0..D)
  function renderSlice(M, z, out) {
    const cv = out || CQ.makeCanvas(W, H);
    const c = cv.getContext('2d');
    const S = M.shape;
    if (!M._base) {
      M._base = CQ.makeCanvas(W, H);
      const b = M._base.getContext('2d');
      b.fillStyle = gray(150); b.fillRect(0, 0, W, H);
      for (const L of M.layers) fillShape(b, S, L.inset, gray(L.fill));
      for (const [inset, g] of M.rings) ringShape(b, S, inset, gray(g));
    }
    c.drawImage(M._base, 0, 0);
    // DNA tangle (bacteria): a paler area with no ribosomes, full of thin threads
    if (M.nucleoid) {
      const N = M.nucleoid, zc = (N.z0 + N.z1) / 2, half = (N.z1 - N.z0) / 2 + 2;
      const q = (z - zc) / half;
      if (Math.abs(q) < 1) {
        const s = Math.sqrt(1 - q * q);
        ellipseFill(c, N.x, N.y, N.rx * s + 2, N.ry * s + 1, gray(136));
      }
      c.fillStyle = gray(88);
      for (const f of M.fibers) {
        if (Math.abs(z - f.z) > 3) continue;
        for (let t = 0; t <= f.l; t++) c.fillRect(Math.round(f.x + Math.cos(f.a) * t), Math.round(f.y + Math.sin(f.a) * t + Math.sin(t) * 0.8), 1, 1);
      }
    }
    // muscle fibers (worm)
    if (M.muscle && z >= M.muscle.z0 && z <= M.muscle.z1) drawMuscle(c, M.muscle, (x) => x);
    for (const o of M.organelles) drawOrganelleSlice(c, o, z);
    // flagellum (bacteria): a long thin tail and its motor in the envelope
    if (M.flag && Math.abs(z - M.flag.z) < 3) {
      c.fillStyle = gray(62);
      for (const [x, y] of M.flag.pts) c.fillRect(Math.round(x), Math.round(y), 2, 2);
      const m = M.flag.pts[0];
      c.fillStyle = gray(46);
      c.fillRect(Math.round(m[0]) - 3, Math.round(m[1]) - 11, 7, 11);
    }
    // ribosomes: small dark dots
    for (const rb of M.ribos) {
      const d = Math.abs(z - rb.z);
      if (d > 2.5) continue;
      c.fillStyle = gray(d < 1.2 ? 40 : 70);
      c.fillRect(Math.round(rb.x) - 1, Math.round(rb.y) - 1, 3, 3);
      c.fillStyle = gray(d < 1.2 ? 55 : 85);
      c.fillRect(Math.round(rb.x), Math.round(rb.y) - 2, 1, 1);
    }
    c.drawImage(getNoise(Math.floor(z)), 0, 0);
    return cv;
  }

  // ---------------------------------------------------------------- a tilt picture: everything projected along the beam
  function project(M, x, z, th) { return M.shape.cx + (x - M.shape.cx) * Math.cos(th) + (z - D / 2) * Math.sin(th); }

  function renderTilt(M, deg, out) {
    const th = (deg * Math.PI) / 180;
    const cv = out || CQ.makeCanvas(W, H);
    const c = cv.getContext('2d');
    // thicker path through the slab at high tilt -> darker image
    const thick = 1 / Math.cos(th);
    c.fillStyle = gray(160 - 34 * (thick - 1)); c.fillRect(0, 0, W, H);
    const S = M.shape;
    const ext = halfWidth(S);
    const xs = (ext * Math.cos(th) + (D / 2) * Math.abs(Math.sin(th))) / ext;
    fillShape(c, S, 0, gray(138 - 34 * (thick - 1)), S.cx, xs);
    ringShape(c, S, 0, gray(80), S.cx, xs);
    if (M.tiltRing) ringShape(c, S, M.tiltRing, gray(90), S.cx, xs);
    c.globalAlpha = 0.55;
    if (M.muscle) drawMuscle(c, M.muscle, (x) => project(M, x, (M.muscle.z0 + M.muscle.z1) / 2, th));
    for (const o of M.organelles) {
      const px = project(M, o.x, o.z, th);
      const rx = Math.sqrt(Math.pow(o.rx * Math.cos(th), 2) + Math.pow(o.rz * Math.sin(th), 2));
      const ang = (o.ang || 0) * Math.cos(th);
      if (o.kind === 'vesicle') ellipseRing(c, px, o.y, rx, o.ry, gray(50));
      else if (o.kind === 'vacuole') { ellipseRing(c, px, o.y, rx, o.ry, gray(60)); }
      else ellipseFill(c, px, o.y, rx, o.ry, gray(o.kind === 'granule' ? 0 : o.kind === 'nucleus' ? 90 : o.kind === 'lipid' ? 70 : 40), ang);
    }
    if (M.flag) {
      c.fillStyle = gray(40);
      for (const [x, y] of M.flag.pts) c.fillRect(Math.round(project(M, x, M.flag.z, th)), Math.round(y), 2, 2);
    }
    c.fillStyle = gray(30);
    for (const rb of M.ribos) c.fillRect(Math.round(project(M, rb.x, rb.z, th)) - 1, Math.round(rb.y) - 1, 2, 2);
    c.globalAlpha = 1;
    c.drawImage(getNoise(3), 0, 0);
    return cv;
  }

  CQ.cellModel = {
    W, H, D, TZ,
    build,
    renderSlice,
    renderTilt,
    outline: (M, inset, step) => outline(M.shape, inset, step),
    // where is the "glowing part" (the Krios target) in a tilt picture?
    targetAt(M, deg) { const th = (deg * Math.PI) / 180, K = M.kTarget; return { x: project(M, K.x, K.z, th), y: K.y }; },
  };
})();
