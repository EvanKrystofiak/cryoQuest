// CRYO QUEST - graphics helpers: palette, pixel font, panels, primitives, sprite builder.
(function () {
  'use strict';
  const CQ = window.CQ;

  // ---------- palette (16-bit flavoured, gold & black theme) ----------
  const P = {
    black: '#000000', ink: '#14101e', night: '#0c0e1e', navy: '#1b1f3b', navyL: '#2c3366',
    white: '#ffffff', snow: '#eef4ff',
    g1: '#d9dee8', g2: '#adb4c6', g3: '#7a8299', g4: '#4c536a', g5: '#2b3042', g6: '#1c2030',
    gold: '#f2c14e', goldL: '#ffe08a', goldLL: '#fff3c4', goldD: '#c98f1c', goldDD: '#7a5410',
    ice: '#9fe3ff', iceL: '#d8f6ff', iceD: '#4aa8e0', iceDD: '#2364a8',
    blue: '#3b74e0', blueD: '#22408f', blueL: '#7fb0ff',
    cyan: '#41e0e0', cyanD: '#1b9aa8',
    green: '#5ad46a', greenD: '#24873a', greenL: '#b3f5a0',
    red: '#ff5d5d', redD: '#a8242c', redL: '#ffa3a3',
    orange: '#ff9a2e', orangeD: '#c25a12',
    yellow: '#ffe14d',
    pink: '#ff8fb1', pinkD: '#c9507a',
    purple: '#9b6cff', purpleD: '#5b3ab0',
    teal: '#2bb5a0', tealD: '#17705f',
    brown: '#8a5a34', brownD: '#5a361c', brownL: '#c08552',
    wood: '#b9824a', woodD: '#7d5229',
    floor1: '#cfd6e4', floor2: '#bcc5d8', floorD: '#99a3bb',
    wall: '#5d6d9a', wallD: '#46547c', wallL: '#7486b8',
  };
  const col = (c) => (c && P[c]) || c || '#fff';

  // ---------- pixel font (5x7, proportional) ----------
  const GLYPHS = {
    A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
    C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
    E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
    G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
    I: '###|.#.|.#.|.#.|.#.|.#.|###', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
    K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
    M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
    O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
    Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
    U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
    W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
    0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '.#.|##.|.#.|.#.|.#.|.#.|###',
    2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '####.|....#|....#|.###.|....#|....#|####.',
    4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
    6: '.###.|#....|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
    8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|....#|.###.',
    ' ': '..|..|..|..|..|..|..',
    '!': '#|#|#|#|#|.|#', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
    '.': '.|.|.|.|.|.|#', ',': '..|..|..|..|..|.#|#.', ':': '.|#|.|.|.|#|.', ';': '..|.#|..|..|..|.#|#.',
    '-': '....|....|....|####|....|....|....', '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
    '=': '....|....|####|....|####|....|....', '/': '....#|....#|...#.|..#..|.#...|#....|#....',
    "'": '#|#|.|.|.|.|.', '"': '#.#|#.#|...|...|...|...|...',
    '(': '..#|.#.|#..|#..|#..|.#.|..#', ')': '#..|.#.|..#|..#|..#|.#.|#..',
    '%': '##..#|##..#|...#.|..#..|.#...|#..##|#..##', '°': '.##.|#..#|#..#|.##.|....|....|....',
    '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....', '#': '.#.#.|#####|.#.#.|.#.#.|.#.#.|#####|.#.#.',
    '<': '...#|..#.|.#..|#...|.#..|..#.|...#', '>': '#...|.#..|..#.|...#|..#.|.#..|#...',
    '_': '.....|.....|.....|.....|.....|.....|#####', '~': '.....|.....|.#..#|#.##.|.....|.....|.....',
    '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
    'µ': '.....|#...#|#...#|#...#|##.##|#.#.#|#....',
    // Spanish: accents sit in three extra rows above the letter
    'Á': '...#.|..#..|.....|.###.|#...#|#...#|#####|#...#|#...#|#...#',
    'É': '...#.|..#..|.....|#####|#....|#....|####.|#....|#....|#####',
    'Í': '..#|.#.|...|###|.#.|.#.|.#.|.#.|.#.|###',
    'Ó': '...#.|..#..|.....|.###.|#...#|#...#|#...#|#...#|#...#|.###.',
    'Ú': '...#.|..#..|.....|#...#|#...#|#...#|#...#|#...#|#...#|.###.',
    'Ñ': '.##.#|#.##.|.....|#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
    'Ü': '.#.#.|.....|.....|#...#|#...#|#...#|#...#|#...#|#...#|.###.',
    '¡': '#|.|#|#|#|#|#', '¿': '..#..|.....|..#..|.#...|#....|#...#|.###.',
    '©': '.#####.|#.....#|#.###.#|#.#...#|#.###.#|#.....#|.#####.',
  };
  const font = { h: 7, glyphs: {}, atlas: null, tints: {} };
  (function buildFont() {
    let x = 0;
    const list = Object.keys(GLYPHS);
    const atlas = CQ.makeCanvas(list.length * 8, 10);
    const a = atlas.getContext('2d');
    a.fillStyle = '#fff';
    for (const ch of list) {
      const rows = GLYPHS[ch].split('|');
      const w = rows[0].length;
      const top = 10 - rows.length;
      for (let r = 0; r < rows.length; r++)
        for (let c = 0; c < w; c++) if (rows[r][c] === '#') a.fillRect(x + c, top + r, 1, 1);
      font.glyphs[ch] = { x, w };
      x += w + 1;
    }
    font.atlas = atlas;
  })();
  function tinted(color) {
    color = col(color);
    if (font.tints[color]) return font.tints[color];
    const c = CQ.makeCanvas(font.atlas.width, font.atlas.height);
    const x = c.getContext('2d');
    x.drawImage(font.atlas, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    font.tints[color] = c;
    return c;
  }

  function glyph(ch) {
    if (ch === 'Μ') ch = 'µ'; // toUpperCase() turns the micro sign into Greek capital MU
    return font.glyphs[ch] || font.glyphs[ch.toUpperCase()] || font.glyphs['?'];
  }

  // UI text is written in English in the code; in Spanish mode it is swapped for its translation here
  function prep(str, raw) {
    str = String(str).toUpperCase();
    return CQ.i18n && !raw ? CQ.i18n.ui(str) : str;
  }

  function measureRaw(str, scale) {
    scale = scale || 1;
    let w = 0;
    for (const ch of String(str)) w += glyph(ch).w + 1;
    return Math.max(0, w - 1) * scale;
  }
  function measure(str, scale, raw) { return measureRaw(prep(str, raw), scale); }

  // bodyOnly: skip the accent rows (used for drop shadows, which would smear the accents)
  function rawText(c, str, x, y, color, scale, bodyOnly) {
    const atlas = tinted(color);
    let cx = x;
    for (const ch of String(str)) {
      const g = glyph(ch);
      if (bodyOnly) c.drawImage(atlas, g.x, 3, g.w, 7, cx, y, g.w * scale, 7 * scale);
      else c.drawImage(atlas, g.x, 0, g.w, 10, cx, y - 3 * scale, g.w * scale, 10 * scale);
      cx += (g.w + 1) * scale;
    }
  }

  // text(ctx, str, x, y, {color, scale, align, shadow, outline})
  function text(c, str, x, y, o) {
    o = o || {};
    const s = o.scale || 1;
    str = prep(str, o.raw);
    const w = measureRaw(str, s);
    if (o.align === 'center') x -= Math.floor(w / 2);
    else if (o.align === 'right') x -= w;
    x = Math.round(x); y = Math.round(y);
    if (o.outline) {
      const oc = o.outline === true ? 'ink' : o.outline;
      const ow = o.outlineWidth || Math.max(1, Math.floor(s / 2));
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) if (dx || dy) rawText(c, str, x + dx * ow, y + dy * ow, oc, s);
    }
    if (o.shadow) rawText(c, str, x + s, y + s, o.shadow === true ? 'ink' : o.shadow, s, true);
    rawText(c, str, x, y, o.color || 'white', s);
    return w;
  }

  // word wrap into lines that fit maxW pixels
  function wrap(str, maxW, scale) {
    const words = String(str).toUpperCase().split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (measureRaw(t, scale) > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }

  // ---------- primitives ----------
  function rect(c, x, y, w, h, color) { c.fillStyle = col(color); c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function px(c, x, y, color) { c.fillStyle = col(color); c.fillRect(Math.round(x), Math.round(y), 1, 1); }
  function circle(c, cx, cy, r, color) {
    c.fillStyle = col(color);
    cx = Math.round(cx); cy = Math.round(cy);
    if (r < 0.5) { c.fillRect(cx, cy, 1, 1); return; }
    for (let dy = -Math.floor(r); dy <= Math.floor(r); dy++) {
      const dx = Math.floor(Math.sqrt(r * r - dy * dy) + 0.35);
      c.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
    }
  }
  function ellipse(c, cx, cy, rx, ry, color) {
    c.fillStyle = col(color);
    cx = Math.round(cx); cy = Math.round(cy);
    for (let dy = -Math.floor(ry); dy <= Math.floor(ry); dy++) {
      const t = 1 - (dy * dy) / (ry * ry);
      if (t < 0) continue;
      const dx = Math.floor(rx * Math.sqrt(t) + 0.35);
      c.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
    }
  }
  function ring(c, cx, cy, r, color, thick) {
    thick = thick || 1;
    c.fillStyle = col(color);
    const steps = Math.max(24, Math.floor(r * 8));
    for (let t = 0; t < thick; t++) {
      const rr = r - t;
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        c.fillRect(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), 1, 1);
      }
    }
  }
  function line(c, x0, y0, x1, y1, color, w) {
    c.fillStyle = col(color);
    w = w || 1;
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, n = 0;
    const off = Math.floor(w / 2);
    for (;;) {
      c.fillRect(x0 - off, y0 - off, w, w);
      if ((x0 === x1 && y0 === y1) || n++ > 2000) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  // a thick line with round ends (rod-shaped bacteria, tubes)
  function capsule(c, x0, y0, x1, y1, r, color) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) circle(c, x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, r, color);
  }
  // checkerboard dither (classic 16-bit shading)
  function dither(c, x, y, w, h, color, phase) {
    c.fillStyle = col(color);
    phase = phase || 0;
    for (let j = 0; j < h; j++)
      for (let i = (j + phase) & 1; i < w; i += 2) c.fillRect(x + i, y + j, 1, 1);
  }
  // bevelled box: outline + highlight top/left + shadow bottom/right
  function box(c, x, y, w, h, o) {
    o = o || {};
    if (o.outline !== false) rect(c, x, y, w, h, o.outline || 'ink');
    const ox = o.outline !== false ? 1 : 0;
    rect(c, x + ox, y + ox, w - ox * 2, h - ox * 2, o.fill || 'g1');
    if (o.light) { rect(c, x + ox, y + ox, w - ox * 2, 1, o.light); rect(c, x + ox, y + ox, 1, h - ox * 2, o.light); }
    if (o.dark) { rect(c, x + ox, y + h - ox - 1, w - ox * 2, 1, o.dark); rect(c, x + w - ox - 1, y + ox, 1, h - ox * 2, o.dark); }
  }
  // vertical stepped gradient
  function bands(c, x, y, w, h, colors) {
    const n = colors.length;
    for (let i = 0; i < n; i++) {
      const y0 = y + Math.floor((h * i) / n), y1 = y + Math.floor((h * (i + 1)) / n);
      rect(c, x, y0, w, y1 - y0, colors[i]);
      if (i > 0) dither(c, x, y0, w, 1, colors[i - 1], i);
    }
  }

  // ---------- UI panels ----------
  function panel(c, x, y, w, h, style) {
    style = style || 'gold';
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (style === 'gold') {
      rect(c, x + 1, y, w - 2, h, 'goldDD');
      rect(c, x, y + 1, w, h - 2, 'goldDD');
      rect(c, x + 1, y + 1, w - 2, h - 2, 'gold');
      rect(c, x + 2, y + 2, w - 4, h - 4, 'goldD');
      rect(c, x + 3, y + 3, w - 6, h - 6, 'night');
      rect(c, x + 3, y + 3, w - 6, 1, '#1d2142');
      // corner rivets
      px(c, x + 2, y + 2, 'goldLL'); px(c, x + w - 3, y + 2, 'goldL');
      px(c, x + 2, y + h - 3, 'goldL'); px(c, x + w - 3, y + h - 3, 'goldDD');
    } else if (style === 'light') {
      rect(c, x + 1, y, w - 2, h, 'ink');
      rect(c, x, y + 1, w, h - 2, 'ink');
      rect(c, x + 1, y + 1, w - 2, h - 2, 'snow');
      rect(c, x + 1, y + h - 2, w - 2, 1, 'g2');
    } else if (style === 'screen') {
      rect(c, x, y, w, h, 'ink');
      rect(c, x + 1, y + 1, w - 2, h - 2, 'g5');
      rect(c, x + 2, y + 2, w - 4, h - 4, '#06121c');
    }
  }

  // ---------- button prompts (green A for the Xbox pad) ----------
  function prompt(c, x, y, opts) {
    opts = opts || {};
    const dev = CQ.input.lastDevice;
    const blink = opts.blink !== false && Math.floor(CQ.time * 2.5) % 2 === 0;
    const dy = blink ? 0 : 1;
    if (dev === 'mouse' && !opts.forcePad) {
      // mouse icon with left button lit
      rect(c, x + 1, y + dy, 8, 11, 'ink');
      rect(c, x + 2, y + 1 + dy, 6, 9, 'snow');
      rect(c, x + 2, y + 1 + dy, 3, 4, 'gold');
      rect(c, x + 5, y + 1 + dy, 1, 4, 'g3');
      rect(c, x + 2, y + 5 + dy, 6, 1, 'g3');
      return 10;
    }
    if (dev === 'key' && !opts.forcePad) {
      // keyboard key cap with an "A" on it (the A key works like the controller's A)
      rect(c, x, y + dy, 11, 11, 'ink');
      rect(c, x + 1, y + 1 + dy, 9, 9, 'g1');
      rect(c, x + 1, y + 8 + dy, 9, 2, 'g3');
      text(c, 'A', x + 3, y + 1 + dy, { color: 'ink' });
      return 11;
    }
    // Xbox-style green A button
    circle(c, x + 5, y + 5 + dy, 5.4, 'ink');
    circle(c, x + 5, y + 5 + dy, 4.4, 'greenD');
    circle(c, x + 5, y + 4 + dy, 3.6, 'green');
    text(c, 'A', x + 3, y + 2 + dy, { color: 'white' });
    return 11;
  }
  function promptWidth() {
    const dev = CQ.input.lastDevice;
    return dev === 'mouse' ? 10 : 11;
  }
  // "PRESS [A]" helper centered at x
  function pressLine(c, label, cx, y, color) {
    const tw = measure(label);
    const pw = promptWidth();
    const total = tw + 4 + pw;
    let x = Math.round(cx - total / 2);
    prompt(c, x, y - 2);
    text(c, label, x + pw + 4, y, { color: color || 'white', shadow: true });
  }

  // ---------- stars ----------
  const STAR = [
    '....#....',
    '....#....',
    '...###...',
    '#########',
    '.#######.',
    '..#####..',
    '..#####..',
    '.###.###.',
    '.##...##.',
  ];
  function makeStar(edge, fill, hi, scale) {
    scale = scale || 1;
    const cv = CQ.makeCanvas(11 * scale, 11 * scale);
    const x = cv.getContext('2d');
    const draw = (ox, oy, color) => {
      x.fillStyle = col(color);
      for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++)
        if (STAR[j][i] === '#') x.fillRect((i + 1 + ox) * scale, (j + 1 + oy) * scale, scale, scale);
    };
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) draw(dx, dy, edge);
    draw(0, 0, fill);
    if (hi) { x.fillStyle = col(hi); x.fillRect(5 * scale, 2 * scale, scale, 2 * scale); x.fillRect(3 * scale, 4 * scale, 2 * scale, scale); }
    return cv;
  }
  const starCache = {};
  // star(ctx, x, y, filled, scale) - draws an 11x11 (x scale) star
  function star(c, x, y, on, scale) {
    scale = scale || 1;
    const k = (on ? 'on' : 'off') + scale;
    if (!starCache[k]) starCache[k] = on ? makeStar('goldDD', 'gold', 'goldLL', scale) : makeStar('g5', 'g4', null, scale);
    c.drawImage(starCache[k], Math.round(x), Math.round(y));
  }

  // ---------- sprites from text maps ----------
  // rows: array of strings; pal: { char: colorName }. '.' and ' ' are transparent.
  function sprite(rows, pal, scale) {
    scale = scale || 1;
    const h = rows.length, w = Math.max.apply(null, rows.map((r) => r.length));
    const cv = CQ.makeCanvas(w * scale, h * scale);
    const x = cv.getContext('2d');
    for (let j = 0; j < h; j++) {
      const r = rows[j];
      for (let i = 0; i < r.length; i++) {
        const ch = r[i];
        if (ch === '.' || ch === ' ') continue;
        const cc = pal[ch];
        if (!cc) continue;
        x.fillStyle = col(cc);
        x.fillRect(i * scale, j * scale, scale, scale);
      }
    }
    return cv;
  }
  function flip(cv) {
    const out = CQ.makeCanvas(cv.width, cv.height);
    const x = out.getContext('2d');
    x.translate(cv.width, 0);
    x.scale(-1, 1);
    x.drawImage(cv, 0, 0);
    return out;
  }
  // build a symmetric sprite from left-half rows
  function mirrorRows(half) { return half.map((r) => r + r.split('').reverse().join('')); }
  function flipRow(r) { return r.split('').reverse().join(''); }

  // draw onto an offscreen canvas with a callback (for cached procedural art)
  function bake(w, h, fn) {
    const cv = CQ.makeCanvas(w, h);
    fn(cv.getContext('2d'), w, h);
    return cv;
  }

  // simple particle system shared by scenes
  function Particles() { this.list = []; }
  Particles.prototype.add = function (p) {
    p.life = p.life || 1; p.age = 0; p.vx = p.vx || 0; p.vy = p.vy || 0; p.g = p.g || 0; p.size = p.size || 1;
    this.list.push(p);
  };
  Particles.prototype.burst = function (x, y, n, opts) {
    opts = opts || {};
    for (let i = 0; i < n; i++) {
      const a = CQ.rand(0, Math.PI * 2), s = CQ.rand(opts.min || 20, opts.max || 70);
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (opts.up || 0), g: opts.g || 0,
        life: CQ.rand(0.4, opts.life || 1), color: CQ.pick(opts.colors || ['gold', 'goldL', 'white']), size: opts.size || 1 });
    }
  };
  Particles.prototype.update = function (dt) {
    for (const p of this.list) { p.age += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    this.list = this.list.filter((p) => p.age < p.life);
  };
  Particles.prototype.draw = function (c) {
    for (const p of this.list) {
      if (p.age > p.life * 0.7 && Math.floor(p.age * 20) % 2) continue; // flicker out
      rect(c, p.x, p.y, p.size, p.size, p.color);
    }
  };

  CQ.gfx = {
    P, col, text, measure, wrap, rect, px, circle, ellipse, ring, line, capsule, dither, box, bands,
    panel, prompt, promptWidth, pressLine, star, sprite, flip, mirrorRows, flipRow, bake, Particles,
  };
})();
