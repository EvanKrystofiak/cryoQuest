// CRYO QUEST - pixel art: player scientists, Pip the penguin, lab instruments, logo.
(function () {
  'use strict';
  const CQ = window.CQ;
  const G = () => CQ.gfx;

  // ---------------- player scientist (16x20) ----------------
  const HEAD_FRONT = [
    '.....kkkkkk.....',
    '...kkhhhhhhkk...',
    '..khhhhhhhhhhk..',
    '.khhhhhhhhhhhhk.',
    '.khgGGggggGGghk.',
    '.khhgggggggghhk.',
    '.khsssssssssshk.',
    '.khsksssssskshk.',
    '.khsksssssskshk.',
    '..kcsssmmsssck..',
    '...kssssssssk...',
  ];
  const BODY_FRONT = [
    '....kwwsswwk....',
    '...kwwwttwwwk...',
    '..kswwwttwwwsk..',
    '..kswwwwwwwwsk..',
    '...kwwwwwwwwk...',
    '...kWWWWWWWWk...',
  ];
  const HEAD_BACK = [
    '.....kkkkkk.....',
    '...kkhhhhhhkk...',
    '..khhhhhhhhhhk..',
    '.khhhhhhhhhhhhk.',
    '.khgggggggggghk.',
    '.khhhhhhhhhhhhk.',
    '.khhhhhhhhhhhhk.',
    '.khhhhhhhhhhhhk.',
    '.khHhhhhhhhhHhk.',
    '.kHhhhhhhhhhhHk.',
    '..kHhhhhhhhhHk..',
  ];
  const BODY_BACK = [
    '....kwwwwwwk....',
    '...kwwwwwwwwk...',
    '..kswwwwwwwwsk..',
    '..kswwwwwwwwsk..',
    '...kwwwwwwwwk...',
    '...kWWWWWWWWk...',
  ];
  const HEAD_SIDE = [
    '.....kkkkkk.....',
    '...kkhhhhhhkk...',
    '..khhhhhhhhhhk..',
    '.khhhhhhhhhhhhk.',
    '.khhhhhhhgggGGk.',
    '.khhhhhhhgggggk.',
    '.khhhhhhssssssk.',
    '.khhhhhsssskssk.',
    '.khhhhhsssskssk.',
    '..khhhssssscsmk.',
    '...khhkssssssk..',
  ];
  const BODY_SIDE = [
    '....kwwwsswk....',
    '....kwwwwttk....',
    '....kwwswwtk....',
    '....kwwswwwk....',
    '....kwwwwwwk....',
    '....kWWWWWWk....',
  ];
  const LEGS = {
    front: [
      ['....kppkkppk....', '....kppkkppk....', '...kbbbkkbbbk...'],
      ['....kppkkppk....', '....kppk.kpk....', '...kbbbk.kbk....'],
    ],
    side: [
      ['.....kppppk.....', '.....kppppk.....', '.....kbbbbbk....'],
      ['.....kppppk.....', '....kpk..kpk....', '...kbbk..kbbk...'],
      ['.....kppppk.....', '.....kpkkpk.....', '....kbbkkbbk....'],
    ],
  };
  // second hair style: two puffs
  const PUFFS_FRONT = ['.kk..........kk.', 'khhk........khhk', 'khHk........kHhk', '.kk..........kk.'];
  const PUFFS_SIDE = ['.kk.............', 'khhk............', 'khHk............', '.kk.............'];

  const LOOKS = [
    { name: 'SAM', s: '#f5c9a0', S: '#d9a077', h: '#6a4325', H: '#46291a', t: '#2bb5a0', p: '#3a4a8a', puffs: false },
    { name: 'ZOE', s: '#8d5a3b', S: '#6b4129', h: '#24181a', H: '#120c0c', t: '#ff8fb1', p: '#4a3a7a', puffs: true },
    { name: 'MIA', s: '#ffdcbf', S: '#e8b48f', h: '#e0782e', H: '#a8501a', t: '#9b6cff', p: '#2f4f6f', puffs: true },
    { name: 'LEO', s: '#c68a5e', S: '#a06a43', h: '#2b2b3a', H: '#16162a', t: '#3b74e0', p: '#5a3a2a', puffs: false },
  ];

  function palFor(look) {
    return {
      k: '#1a1426', h: look.h, H: look.H, s: look.s, S: look.S, g: '#f2c14e', G: '#7fe6ff',
      w: '#f4f6fb', W: '#b8c2da', t: look.t, p: look.p, b: '#2a2030', m: '#b8434f', c: '#ff9eae',
    };
  }

  function compose(head, body, legs, overlay, overlayRows) {
    const rows = head.concat(body, legs);
    if (overlay) {
      overlay.forEach((r, i) => {
        const y = overlayRows + i;
        let out = '';
        for (let x = 0; x < 16; x++) out += r[x] !== '.' ? r[x] : rows[y][x];
        rows[y] = out;
      });
    }
    return rows;
  }

  const S = CQ.sprites = { LOOKS, players: [], pipF: [], pipS: [] };

  function buildPlayer(look) {
    const pal = palFor(look);
    const flipRow = G().flipRow;
    const pf = look.puffs ? PUFFS_FRONT : null;
    const ps = look.puffs ? PUFFS_SIDE : null;
    const mk = (rows) => G().sprite(rows, pal);
    const down = [
      mk(compose(HEAD_FRONT, BODY_FRONT, LEGS.front[0], pf, 1)),
      mk(compose(HEAD_FRONT, BODY_FRONT, LEGS.front[1], pf, 1)),
      mk(compose(HEAD_FRONT, BODY_FRONT, LEGS.front[0], pf, 1)),
      mk(compose(HEAD_FRONT, BODY_FRONT, LEGS.front[1].map(flipRow), pf, 1)),
    ];
    const up = [
      mk(compose(HEAD_BACK, BODY_BACK, LEGS.front[0], pf, 1)),
      mk(compose(HEAD_BACK, BODY_BACK, LEGS.front[1], pf, 1)),
      mk(compose(HEAD_BACK, BODY_BACK, LEGS.front[0], pf, 1)),
      mk(compose(HEAD_BACK, BODY_BACK, LEGS.front[1].map(flipRow), pf, 1)),
    ];
    const right = [
      mk(compose(HEAD_SIDE, BODY_SIDE, LEGS.side[0], ps, 1)),
      mk(compose(HEAD_SIDE, BODY_SIDE, LEGS.side[1], ps, 1)),
      mk(compose(HEAD_SIDE, BODY_SIDE, LEGS.side[0], ps, 1)),
      mk(compose(HEAD_SIDE, BODY_SIDE, LEGS.side[2], ps, 1)),
    ];
    const left = right.map((c) => G().flip(c));
    return { down, up, left, right };
  }

  // ---------------- Pip the penguin (16x17) ----------------
  const PIP_FRONT = [
    '.....kkkkkk.....',
    '...kkggggggkk...',
    '..kbgGGggGGgbk..',
    '..kbbggggggbbk..',
    '.kbbbbbbbbbbbbk.',
    '.kbbwwbbbbwwbbk.',
    '.kbbwkbbbbkwbbk.',
    '.kbbbboooobbbbk.',
    '.kbcbbwOOwbbcbk.',
    '..kggggggggggk..',
    '.kbbwwwwwwwggbk.',
    'kbbbwwwwwwwgbbbk',
    'kbbbwwwwwwwwbbbk',
    '.kbbwwwwwwwwbbk.',
    '..kbWWWWWWWWbk..',
    '...kkkkkkkkkk...',
    '...kook..kook...',
  ];
  const PIP_SIDE = [
    '.....kkkkkk.....',
    '....kggggggk....',
    '...kbgggGGGk....',
    '..kbbbggggbbk...',
    '..kbbbbbbbbbk...',
    '..kbbbbbbwwbk...',
    '..kbbbbbbwkbk...',
    '..kbbbbbbbbbooo.',
    '..kbbbbbbwwcOk..',
    '..kggggggggggk..',
    '..kbbbbwwwwwk...',
    '..kbbBbwwwwwwk..',
    '..kbbBbwwwwwwk..',
    '..kbbbbwwwwwk...',
    '...kbbWWWWWk....',
    '....kkkkkkkk....',
    '.....kooook.....',
  ];
  const PIP_PAL = { k: '#121222', b: '#262a44', B: '#3c4266', w: '#ffffff', W: '#c7d0e4', o: '#ffa22e', O: '#c8661a',
    g: '#f2c14e', G: '#7fe6ff', c: '#ff9eae' };

  function buildPip() {
    const mk = (rows) => G().sprite(rows, PIP_PAL);
    const f1 = PIP_FRONT.slice(); f1[16] = '....kook.kook...';
    const f2 = PIP_FRONT.slice(); f2[16] = '...kook.kook....';
    S.pipF = [mk(PIP_FRONT), mk(f1), mk(PIP_FRONT), mk(f2)];
    const s1 = PIP_SIDE.slice(); s1[16] = '....kooook......';
    const s2 = PIP_SIDE.slice(); s2[16] = '......kooook....';
    S.pipR = [mk(PIP_SIDE), mk(s1), mk(PIP_SIDE), mk(s2)];
    S.pipL = S.pipR.map((c) => G().flip(c));
    // back view: all dark
    const back = PIP_FRONT.map((r, i) => (i >= 4 && i <= 14 ? r.replace(/[wWoOc]/g, 'b') : r));
    S.pipU = [mk(back), mk(back), mk(back), mk(back)];
    // portrait (2x) + talking frame
    const talk = PIP_FRONT.slice(); talk[8] = '.kbcbbwkkwbbcbk.';
    S._portrait = [G().sprite(PIP_FRONT, PIP_PAL, 2), G().sprite(talk, PIP_PAL, 2)];
    // happy (eyes closed ^ ^) for celebrations
    const happy = PIP_FRONT.slice();
    happy[5] = '.kbbbkbbbbkbbbk.';
    happy[6] = '.kbbkbkbbkbkbbk.';
    S._happy = G().sprite(happy, PIP_PAL, 2);
    S._mini = G().sprite(PIP_FRONT, PIP_PAL, 1);
  }

  S.pip = function (dir, frame) {
    const set = dir === 'left' ? S.pipL : dir === 'right' ? S.pipR : dir === 'up' ? S.pipU : S.pipF;
    return set[frame % 4];
  };
  S.pipPortrait = (talking) => S._portrait[talking ? 1 : 0];
  S.pipHappy = () => S._happy;
  S.pipMini = () => S._mini;
  S.player = function (look, dir, frame) {
    const p = S.players[look] || S.players[0];
    return (p[dir] || p.down)[frame % 4];
  };

  // ---------------- lab instruments & props (procedural pixel art) ----------------
  function shade(c, x, y, w, h, base, light, dark) {
    const g = G();
    g.rect(c, x, y, w, h, base);
    if (light) { g.rect(c, x, y, w, 1, light); g.rect(c, x, y, 1, h, light); }
    if (dark) { g.rect(c, x, y + h - 1, w, 1, dark); g.rect(c, x + w - 1, y, 1, h, dark); }
  }

  // shaded cylinder along an axis tilted `ang` radians from vertical (to the right), starting at its tip (x0,y0)
  function cylinder(c, x0, y0, ang, len, w, rings, pal) {
    pal = pal || { light: '#ffffff', base: '#d9dee8', mid: '#adb4c6', dark: '#7a8299', edge: '#14101e' };
    const ux = Math.sin(ang), uy = -Math.cos(ang);
    const px = -uy, py = ux;
    const x1 = x0 + ux * len, y1 = y0 + uy * len;
    const minx = Math.floor(Math.min(x0, x1) - w), maxx = Math.ceil(Math.max(x0, x1) + w);
    const miny = Math.floor(Math.min(y0, y1) - w), maxy = Math.ceil(Math.max(y0, y1) + w);
    const hw = w / 2;
    for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) {
      const dx = x + 0.5 - x0, dy = y + 0.5 - y0;
      const a = dx * ux + dy * uy, p = dx * px + dy * py;
      if (a < 0 || a > len || Math.abs(p) > hw) continue;
      const q = p / hw;
      let colr = q < -0.45 ? pal.light : q < 0.25 ? pal.base : q < 0.7 ? pal.mid : pal.dark;
      if (rings.some((r) => Math.abs(a - r) < 0.8)) colr = pal.mid;
      if (Math.abs(p) > hw - 1 || a < 1 || a > len - 1) colr = pal.edge;
      c.fillStyle = colr;
      c.fillRect(x, y, 1, 1);
    }
  }

  // Leica EM GP2 plunge freezer: white tower with a domed top, dark environmental chamber window,
  // black cryogen container in the base, side stereo microscope and a small control box: 46 x 56
  function bakePlunger() {
    return G().bake(46, 56, (c) => {
      const g = G();
      const OUT = '#14101e', W1 = '#f4f4f2', HL = '#ffffff', SH = '#d7d7d3', SH2 = '#b9b9b4';
      const BLK = '#1d1d22', GLASS = '#2e3644', YEL = '#ffd23f';
      // ---- tower: domed head ----
      const head = [[17, 29], [15, 31], [14, 32]];
      head.forEach(([x0, x1], y) => g.rect(c, x0, y, x1 - x0 + 1, 1, OUT));
      g.rect(c, 13, 3, 21, 28, OUT);
      g.rect(c, 16, 1, 13, 1, HL); g.rect(c, 15, 2, 17, 1, W1);
      g.rect(c, 14, 3, 19, 27, W1);
      g.rect(c, 14, 3, 1, 27, HL); g.rect(c, 32, 3, 1, 27, SH);
      g.px(c, 23, 5, '#e2231a');                                    // little red logo
      // environmental chamber window: black frame, dark glass, tweezers + blotting pads inside
      g.rect(c, 15, 8, 17, 18, BLK);
      g.rect(c, 17, 10, 13, 14, GLASS);
      g.rect(c, 18, 10, 1, 14, '#46516a');
      g.rect(c, 23, 10, 1, 9, '#9aa0aa'); g.rect(c, 22, 19, 3, 1, '#9aa0aa');
      g.rect(c, 19, 15, 2, 6, '#e8e8e2'); g.rect(c, 26, 15, 2, 6, '#e8e8e2');
      g.rect(c, 28, 27, 3, 2, YEL); g.px(c, 29, 27, BLK);            // warning sticker
      // ---- narrow neck (the plunge path) ----
      g.rect(c, 16, 30, 15, 9, OUT);
      g.rect(c, 17, 30, 13, 9, W1);
      g.rect(c, 17, 30, 1, 9, HL); g.rect(c, 29, 30, 1, 9, SH);
      g.rect(c, 23, 30, 1, 9, SH2);
      // ---- wide base with the black cryogen container ----
      g.rect(c, 9, 38, 29, 16, OUT);
      g.rect(c, 10, 39, 27, 14, W1);
      g.rect(c, 10, 39, 27, 1, HL); g.rect(c, 36, 39, 1, 14, SH);
      g.rect(c, 15, 40, 17, 11, BLK);
      g.ellipse(c, 23, 41, 7, 1, '#4a4a54');
      g.rect(c, 21, 45, 5, 3, YEL); g.px(c, 23, 46, BLK);
      g.rect(c, 10, 52, 27, 1, SH);
      g.rect(c, 9, 54, 29, 2, OUT);
      // ---- stereo microscope on a post (right) ----
      g.rect(c, 39, 38, 2, 16, BLK);                                // post
      g.rect(c, 37, 54, 6, 2, BLK);                                 // foot
      g.rect(c, 33, 34, 7, 2, '#55555c');                           // arm
      g.rect(c, 35, 27, 8, 8, OUT); g.rect(c, 36, 28, 6, 6, HL); g.rect(c, 36, 33, 6, 1, SH);
      g.line(c, 40, 27, 44, 23, BLK, 2); g.line(c, 42, 28, 45, 25, BLK, 2);  // eyepieces
      g.rect(c, 36, 35, 4, 4, BLK);                                 // objective
      // ---- control box (left, on the floor) ----
      g.rect(c, 0, 46, 12, 8, OUT);
      g.rect(c, 1, 47, 10, 6, W1); g.rect(c, 1, 47, 10, 1, HL);
      g.rect(c, 3, 49, 6, 3, '#7fd7ff'); g.px(c, 1, 48, '#e2231a');
      g.rect(c, 0, 54, 12, 2, OUT);
    });
  }

  // Leica EM ICE high pressure freezer: tall tower (red swoosh, grey band) + loading station
  // (stereo microscope, black work table, red loading device, navy base stripe): 58 x 58
  function bakeHPF() {
    return G().bake(58, 58, (c) => {
      const g = G();
      const OUT = '#14101e', W1 = '#f2f0ea', HL = '#ffffff', SH = '#dad6cc', SH2 = '#bfbab0';
      const RED = '#e8381e', REDD = '#b4261a', GREY = '#cfd2d6', GREYL = '#e4e6e9', GREYD = '#aeb2b8';
      const BLK = '#1d1d22', BLK2 = '#34343c', NAVY = '#26304f', METAL = '#9aa0aa';
      // ---- main tower (left) ----
      g.rect(c, 1, 0, 29, 1, OUT);
      g.rect(c, 0, 1, 31, 51, OUT);
      g.rect(c, 1, 1, 29, 50, W1);
      g.rect(c, 1, 1, 29, 1, HL);
      g.rect(c, 1, 1, 1, 50, HL);
      g.rect(c, 29, 2, 1, 49, SH);
      // red swoosh: thick on the left, thin to a point on the right
      g.rect(c, 1, 7, 17, 2, RED); g.rect(c, 1, 8, 15, 1, REDD);
      g.rect(c, 18, 7, 5, 1, RED); g.px(c, 23, 7, '#f08a7a');
      // the name plate (tiny grey marks)
      g.rect(c, 15, 10, 4, 1, '#b5b3ab'); g.rect(c, 20, 10, 2, 1, '#6c6a64'); g.rect(c, 23, 10, 3, 1, '#b5b3ab');
      // light grey band across the middle
      g.rect(c, 1, 18, 28, 1, SH2);
      g.rect(c, 1, 19, 23, 12, GREY);
      g.rect(c, 1, 19, 23, 1, GREYL);
      g.rect(c, 1, 30, 23, 1, GREYD);
      // narrow door section on the right of the tower
      g.rect(c, 24, 19, 1, 28, SH2);
      g.rect(c, 25, 19, 4, 27, W1);
      g.rect(c, 24, 46, 6, 1, SH2);
      // bottom edge + caster
      g.rect(c, 1, 49, 29, 2, SH);
      g.rect(c, 8, 52, 3, 2, '#6b6f78'); g.rect(c, 7, 54, 5, 4, '#3a3c42'); g.px(c, 9, 55, '#8a8f99');
      // ---- loading station (right) ----
      // housing with a curved front
      g.rect(c, 30, 14, 22, 12, OUT);
      g.rect(c, 31, 15, 20, 11, W1);
      g.rect(c, 31, 15, 20, 1, HL);
      for (let x = 31; x < 44; x++) { const y = 17 + Math.round(Math.sin(((x - 31) / 12) * Math.PI) * 3); g.px(c, x, y, SH); g.px(c, x, y + 1, SH); }
      // touchscreen
      g.rect(c, 45, 16, 6, 5, OUT); g.rect(c, 46, 17, 4, 3, '#7fd7ff'); g.px(c, 46, 17, HL); g.rect(c, 47, 19, 2, 1, '#3b74e0');
      // stereo microscope with gooseneck lights
      g.line(c, 52, 12, 55, 19, METAL); g.line(c, 55, 19, 50, 24, METAL);
      g.rect(c, 40, 8, 8, 8, OUT); g.rect(c, 41, 9, 6, 6, HL); g.rect(c, 41, 14, 6, 1, SH);
      g.rect(c, 38, 11, 3, 3, OUT); g.px(c, 39, 12, HL);
      g.line(c, 45, 8, 49, 5, BLK, 2); g.line(c, 47, 9, 51, 6, BLK, 2);
      g.rect(c, 42, 15, 5, 5, BLK); g.rect(c, 42, 17, 5, 1, '#55555c');
      // black work table (in front of the tower's door)
      for (let y = 25; y <= 30; y++) {
        const x1 = y < 28 ? 54 + (y - 25) : 57;
        g.rect(c, 25, y, x1 - 25 + 1, 1, y <= 28 ? BLK2 : BLK);
      }
      g.rect(c, 25, 25, 30, 1, '#4a4a54');
      // red loading device
      g.rect(c, 36, 25, 9, 2, METAL);
      g.rect(c, 37, 21, 7, 4, OUT); g.rect(c, 38, 22, 5, 3, RED); g.rect(c, 38, 24, 5, 1, REDD); g.px(c, 40, 22, '#ff8a7a');
      // cabinet under the table, navy stripe at the bottom
      g.rect(c, 29, 31, 24, 19, OUT);
      g.rect(c, 30, 31, 22, 18, W1);
      g.rect(c, 51, 31, 1, 18, SH);
      g.rect(c, 32, 33, 8, 9, SH); g.rect(c, 33, 34, 7, 8, W1);
      g.rect(c, 26, 46, 27, 3, NAVY);
      g.rect(c, 26, 46, 27, 1, '#3a4670');
      g.rect(c, 46, 49, 3, 3, '#6b6f78'); g.rect(c, 45, 52, 5, 5, '#3a3c42'); g.px(c, 47, 54, '#8a8f99');
    });
  }

  // Zeiss Crossbeam 550 (front view): white pedestal cabinet, round vacuum chamber with a vented door and
  // port covers, Gemini 2 SEM column with the blue logo, silver FIB column angled in from the left with
  // black boxes and cables, and a load lock with control panel and transfer rod on the right: 62 x 76
  function bakeCrossbeam() {
    return G().bake(62, 76, (c) => {
      const g = G();
      const OUT = '#14101e', W1 = '#eef0f3', HL = '#ffffff', SH = '#d3d7de', SH2 = '#b5bbc6';
      const SILV = '#c8ccd4', SILVD = '#8e95a3', SILVL = '#eef1f5', BLK = '#1d1d22';
      // cables looping down on the left (behind everything)
      g.line(c, 3, 22, 2, 32, '#7a8299', 2); g.line(c, 2, 32, 6, 40, '#7a8299', 2); g.line(c, 6, 40, 12, 43, '#7a8299', 2);
      g.line(c, 7, 22, 7, 30, '#555b68'); g.line(c, 7, 30, 11, 37, '#555b68');
      // ---- SEM column (Gemini 2) with the blocks behind it ----
      g.rect(c, 13, 4, 6, 18, OUT); g.rect(c, 14, 5, 4, 17, SH);
      g.rect(c, 33, 3, 5, 18, OUT); g.rect(c, 34, 4, 3, 17, SH);
      g.rect(c, 13, 11, 5, 6, BLK);                                         // detector box (black)
      g.rect(c, 18, 0, 16, 23, OUT);
      g.rect(c, 19, 1, 14, 22, W1);
      g.rect(c, 19, 1, 14, 1, HL); g.rect(c, 19, 1, 2, 22, HL); g.rect(c, 31, 2, 2, 21, SH);
      g.rect(c, 23, 6, 5, 5, '#1d3fbb'); g.rect(c, 24, 8, 3, 1, 'white');  // blue logo badge
      g.rect(c, 23, 19, 6, 1, '#4c536a');                                   // "Gemini 2"
      // ---- FIB column: silver tube angled in from the upper left ----
      cylinder(c, 15, 28, -0.9, 17, 7, [6, 11], { light: SILVL, base: SILV, mid: '#aab0bc', dark: SILVD, edge: OUT });
      g.circle(c, 2, 17, 2.5, '#55555c');                                    // ion source cap
      g.rect(c, 9, 14, 2, 5, SILV);                                         // neck to the box
      g.rect(c, 6, 7, 7, 8, OUT); g.rect(c, 7, 8, 5, 6, BLK);                // black box on top
      g.rect(c, 8, 10, 3, 2, '#ffd23f');                                    // yellow warning label
      // ---- vacuum chamber ----
      g.rect(c, 13, 21, 27, 1, OUT);
      g.rect(c, 11, 22, 31, 27, OUT);
      g.rect(c, 12, 22, 29, 26, '#e3e6eb');
      g.rect(c, 12, 22, 29, 1, HL); g.rect(c, 12, 22, 1, 26, HL); g.rect(c, 39, 23, 2, 25, SH);
      [15, 21, 26, 34].forEach((x) => { g.circle(c, x, 24, 1.5, SH2); g.px(c, x, 24, W1); });   // small ports
      g.rect(c, 17, 27, 13, 19, OUT); g.rect(c, 18, 28, 11, 17, W1);                          // vented door
      for (let y = 29; y < 44; y += 2) for (let x = 19; x < 28; x += 3) g.rect(c, x, y, 2, 1, SH2);
      [30, 35, 40].forEach((y) => { g.circle(c, 34, y, 2.4, SH2); g.circle(c, 34, y, 1.6, W1); }); // port covers
      g.rect(c, 13, 46, 27, 3, SILVD); g.rect(c, 13, 46, 27, 1, SILV);                         // stage platform
      // ---- right side: detector box, elbow pipe, load lock with control panel, transfer rod ----
      g.rect(c, 39, 25, 3, 6, SILV); g.rect(c, 39, 25, 1, 6, SILVL);
      g.rect(c, 37, 16, 11, 9, OUT); g.rect(c, 38, 17, 9, 7, W1); g.rect(c, 38, 23, 4, 1, '#3b74e0');
      g.rect(c, 42, 41, 1, 12, SILVD);                                      // thin rod hanging down
      g.rect(c, 40, 29, 15, 12, OUT); g.rect(c, 41, 30, 13, 10, W1); g.rect(c, 41, 30, 13, 1, HL);
      g.rect(c, 49, 31, 4, 6, '#26304f'); g.px(c, 50, 32, 'white'); g.px(c, 50, 34, 'white'); g.px(c, 51, 35, '#5ad46a');
      g.rect(c, 55, 33, 3, 2, SILV); g.rect(c, 58, 32, 4, 4, BLK); g.px(c, 59, 33, '#555b68');
      // ---- pedestal cabinet ----
      g.rect(c, 4, 48, 44, 26, OUT);
      g.rect(c, 5, 49, 42, 24, W1);
      g.rect(c, 5, 49, 42, 2, '#e1e4ea');
      g.rect(c, 5, 49, 1, 24, HL); g.rect(c, 46, 49, 1, 24, SH);
      g.rect(c, 15, 52, 22, 21, SH); g.rect(c, 16, 52, 20, 20, '#f6f7f9');                     // centre panel
      g.rect(c, 16, 60, 20, 1, SH);
      g.rect(c, 17, 54, 8, 1, '#4c536a');                                   // "Crossbeam 550"
      g.px(c, 31, 56, '#5ad46a'); g.px(c, 33, 56, '#8a8f99'); g.px(c, 35, 56, '#8a8f99');   // ON / STANDBY / OFF
      g.rect(c, 8, 73, 4, 3, '#55555c'); g.rect(c, 40, 73, 4, 3, '#55555c');                 // levelling feet
    });
  }

  // Thermo Scientific Krios G4 style: white frame, two dark doors with a blue glow, a touchscreen,
  // and the side of the cabinet in perspective: 60 x 96
  function bakeKrios() {
    return G().bake(60, 96, (c) => {
      const g = G();
      const OUT = '#14101e', WH = '#eceef2', HL = '#ffffff', SH = '#c8ccd5', SIDE = '#b9bec9', SIDE2 = '#a3a9b6';
      const NAVY = '#1c2238', NAVY2 = '#262d4a', GLOW = '#6f8cff', GLOWL = '#b3c4ff';
      // side of the cabinet (perspective)
      for (let x = 1; x <= 8; x++) {
        const top = 6 - Math.round(((x - 1) / 7) * 4), bot = 90 + Math.round(((x - 1) / 7) * 4);
        g.rect(c, x, top, 1, bot - top, x <= 2 ? '#cfd3dc' : SIDE);
      }
      g.line(c, 0, 6, 8, 2, OUT); g.line(c, 0, 90, 8, 94, OUT); g.rect(c, 0, 6, 1, 85, OUT);
      g.line(c, 1, 33, 8, 34, SIDE2); g.line(c, 1, 61, 8, 62, SIDE2);
      // front frame
      g.rect(c, 9, 1, 50, 1, OUT);
      g.rect(c, 8, 2, 52, 93, OUT);
      g.rect(c, 9, 2, 50, 92, WH);
      g.rect(c, 9, 2, 50, 1, HL);
      g.rect(c, 58, 3, 1, 90, SH);
      // logo marks at the top: "thermo" (red) "scientific" (grey)
      g.rect(c, 30, 6, 5, 1, '#e2231a'); g.rect(c, 35, 6, 8, 1, '#8a8f99');
      // two dark doors with a white gap between them
      for (const [x0, x1] of [[12, 32], [35, 55]]) {
        const w = x1 - x0 + 1;
        g.rect(c, x0, 12, w, 78, NAVY);
        g.dither(c, x0, 12, w, 78, NAVY2, 0);
        g.rect(c, x0, 12, w, 1, GLOWL); g.rect(c, x0, 13, w, 1, GLOW);   // blue glow along the top
        g.rect(c, x0, 88, w, 1, GLOW); g.rect(c, x0, 89, w, 1, GLOWL);   // ...and the bottom
        g.dither(c, x0, 14, 1, 74, GLOW, 0); g.dither(c, x1, 14, 1, 74, GLOW, 1);
      }
      // left door: upper panel, service hatch with a handle, lower panel
      g.rect(c, 12, 36, 21, 1, OUT); g.rect(c, 12, 57, 21, 1, OUT);
      g.rect(c, 13, 37, 19, 20, '#2b3253');
      g.rect(c, 29, 44, 2, 6, '#9aa0aa');
      // right door: touchscreen
      g.rect(c, 37, 46, 10, 8, OUT); g.rect(c, 38, 47, 8, 6, '#4fa3ff'); g.rect(c, 38, 47, 8, 1, '#b8e0ff');
      g.rect(c, 39, 49, 4, 1, '#d8f0ff'); g.rect(c, 39, 51, 6, 1, '#9fd0ff');
      // base
      g.rect(c, 9, 90, 50, 4, WH); g.rect(c, 9, 93, 50, 1, SH);
      g.rect(c, 8, 94, 52, 2, OUT);
    });
  }

  // computer desk with two monitors: 70 x 44
  function bakeComputer() {
    return G().bake(70, 44, (c) => {
      const g = G();
      // desk
      g.rect(c, 0, 22, 70, 6, 'woodD');
      g.rect(c, 0, 21, 70, 3, 'wood');
      g.rect(c, 0, 21, 70, 1, 'brownL');
      g.rect(c, 2, 28, 5, 16, 'woodD'); g.rect(c, 63, 28, 5, 16, 'woodD');
      g.rect(c, 44, 28, 18, 12, 'brown'); g.rect(c, 52, 33, 2, 2, 'gold');
      // monitors
      for (const mx of [6, 36]) {
        g.rect(c, mx, 2, 28, 18, 'ink');
        g.rect(c, mx + 1, 3, 26, 15, '#7a7f88');
        // tomogram-looking noise
        const r = CQ.seeded(mx * 7);
        for (let i = 0; i < 60; i++) g.px(c, mx + 1 + Math.floor(r() * 26), 3 + Math.floor(r() * 15), r() > 0.5 ? '#5c616b' : '#9a9fa8');
        g.ring(c, mx + 14, 10, 5, '#3a3e46');
        g.rect(c, mx + 12, 19, 4, 2, 'g4');
      }
      // keyboard + mouse
      g.rect(c, 18, 22, 24, 3, 'g2'); g.rect(c, 19, 22, 22, 1, 'g1');
      g.rect(c, 46, 22, 4, 3, 'g2');
    });
  }

  // lab bench with flasks: 96 x 34
  function bakeBench() {
    return G().bake(96, 34, (c) => {
      const g = G();
      g.rect(c, 0, 12, 96, 8, 'g5');
      g.rect(c, 0, 11, 96, 3, 'g3');
      g.rect(c, 0, 11, 96, 1, 'g2');
      g.rect(c, 1, 20, 94, 13, 'wood');
      g.rect(c, 1, 20, 94, 1, 'brownL');
      for (let i = 0; i < 4; i++) {
        g.rect(c, 4 + i * 23, 22, 20, 10, 'woodD');
        g.rect(c, 5 + i * 23, 23, 18, 8, 'wood');
        g.rect(c, 13 + i * 23, 26, 2, 2, 'gold');
      }
      // flasks
      const flask = (x, liquid, lightC) => {
        g.rect(c, x + 2, 0, 3, 5, 'iceL');
        g.rect(c, x + 1, 0, 5, 1, 'g2');
        g.rect(c, x, 5, 7, 7, 'iceL');
        g.rect(c, x + 1, 7, 5, 5, liquid);
        g.rect(c, x + 1, 7, 5, 1, lightC);
        g.px(c, x + 1, 5, 'white');
      };
      flask(10, 'green', 'greenL');
      flask(22, 'pink', 'white');
      flask(56, 'blue', 'blueL');
      // microscope slide box + pipette
      g.rect(c, 36, 6, 12, 6, 'purple'); g.rect(c, 36, 6, 12, 1, 'white');
      g.rect(c, 72, 2, 2, 10, 'g1'); g.rect(c, 71, 0, 4, 3, 'orange');
      g.rect(c, 80, 7, 10, 5, 'gold'); g.rect(c, 81, 8, 8, 1, 'goldL');
    });
  }

  // liquid nitrogen dewar: stainless steel, valves + pressure gauge on top, green "nitrogen" label,
  // little frost, rolling base: 22 x 36
  function bakeTank() {
    return G().bake(22, 36, (c) => {
      const g = G();
      const OUT = '#14101e';
      // plumbing on top
      g.rect(c, 10, 0, 2, 7, '#7a8299');
      g.rect(c, 13, 2, 5, 2, OUT); g.rect(c, 14, 2, 3, 1, '#3b74e0');      // blue valve handle
      g.circle(c, 6, 4, 3, OUT); g.circle(c, 6, 4, 2, 'white'); g.px(c, 7, 3, '#ff5d5d');  // gauge
      // shoulder
      g.rect(c, 3, 6, 16, 3, OUT); g.rect(c, 4, 7, 14, 2, '#b8bfca'); g.rect(c, 5, 7, 4, 1, '#eef1f5');
      // stainless body
      g.rect(c, 1, 9, 20, 22, OUT);
      g.rect(c, 2, 9, 18, 22, '#c3c9d3');
      g.rect(c, 4, 9, 3, 22, '#eef1f5');
      g.rect(c, 16, 9, 3, 22, '#99a1ae');
      // green "nitrogen" diamond label + LN2
      for (let k = 0; k < 4; k++) g.rect(c, 11 - k, 12 + k, 1 + k * 2, 1, '#2f9a4a');
      for (let k = 0; k < 3; k++) g.rect(c, 9 + k, 16 + k, 5 - k * 2, 1, '#2f9a4a');
      g.px(c, 11, 14, 'white'); g.px(c, 11, 16, 'white');
      g.rect(c, 2, 21, 18, 8, '#3b74e0'); g.rect(c, 2, 21, 18, 1, '#7fb0ff');
      g.text(c, 'LN2', 11, 22, { color: 'white', align: 'center' });
      // frost (it's cold!)
      g.px(c, 4, 8, 'white'); g.px(c, 9, 7, 'white'); g.px(c, 15, 8, 'white'); g.px(c, 12, 6, '#eef6ff');
      // rolling base
      g.rect(c, 0, 30, 22, 2, OUT); g.rect(c, 1, 30, 20, 1, '#6b6f78');
      g.rect(c, 2, 32, 4, 4, '#3a3c42'); g.px(c, 3, 33, '#8a8f99');
      g.rect(c, 16, 32, 4, 4, '#3a3c42'); g.px(c, 17, 33, '#8a8f99');
    });
  }

  function bakePlant() {
    return G().bake(16, 24, (c) => {
      const g = G();
      g.rect(c, 4, 15, 8, 8, 'orangeD'); g.rect(c, 3, 14, 10, 2, 'orange'); g.rect(c, 5, 16, 2, 6, '#e07a3a');
      const leaf = (x, y, w, h) => { g.ellipse(c, x, y, w, h, 'greenD'); g.ellipse(c, x - 1, y - 1, w - 1, h - 1, 'green'); };
      leaf(8, 8, 4, 5); leaf(4, 10, 3, 3); leaf(12, 10, 3, 3); leaf(8, 3, 2, 3);
    });
  }

  function bakeWindow() {
    return G().bake(40, 26, (c) => {
      const g = G();
      g.rect(c, 0, 0, 40, 26, 'ink');
      g.rect(c, 1, 1, 38, 24, 'white');
      g.bands(c, 2, 2, 36, 22, ['#5aa0ff', '#7ab4ff', '#9ac8ff', '#bfe0ff']);
      g.ellipse(c, 12, 9, 6, 2, 'white'); g.ellipse(c, 28, 14, 5, 2, 'white');
      g.rect(c, 19, 2, 2, 22, 'white'); g.rect(c, 2, 12, 36, 2, 'white');
    });
  }

  function bakeDoor() {
    return G().bake(28, 40, (c) => {
      const g = G();
      g.rect(c, 0, 0, 28, 40, 'ink');
      g.rect(c, 2, 2, 24, 38, 'brown');
      g.rect(c, 4, 4, 20, 14, 'brownL'); g.rect(c, 5, 5, 18, 12, 'iceL'); g.dither(c, 5, 5, 18, 12, 'ice', 0);
      g.rect(c, 4, 21, 20, 16, 'brownD'); g.rect(c, 5, 22, 18, 14, 'brown');
      g.rect(c, 21, 24, 3, 2, 'gold');
    });
  }

  function bakeColdSign() {
    return G().bake(26, 14, (c) => {
      const g = G();
      g.rect(c, 0, 0, 26, 14, 'ink');
      g.rect(c, 1, 1, 24, 12, 'gold');
      for (let i = -12; i < 26; i += 6) g.line(c, i + 1, 12, i + 8, 1, 'goldD');
      g.rect(c, 3, 4, 20, 7, 'ink');
      g.text(c, 'COLD', 13, 4, { color: 'gold', align: 'center' });
    });
  }

  function bakeClock() {
    return G().bake(14, 14, (c) => {
      const g = G();
      g.circle(c, 7, 7, 6.5, 'ink'); g.circle(c, 7, 7, 5.5, 'snow');
      g.line(c, 7, 7, 7, 3, 'ink'); g.line(c, 7, 7, 10, 7, 'ink'); g.px(c, 7, 7, 'red');
    });
  }

  // poster with a friendly cell drawing
  function bakeCellPoster() {
    return G().bake(30, 36, (c) => {
      const g = G();
      g.rect(c, 0, 0, 30, 36, 'goldDD'); g.rect(c, 1, 1, 28, 34, 'gold'); g.rect(c, 2, 2, 26, 32, 'snow');
      g.ellipse(c, 15, 15, 11, 9, 'greenD'); g.ellipse(c, 15, 15, 10, 8, 'greenL');
      g.circle(c, 12, 14, 3, 'purple'); g.circle(c, 12, 14, 2, 'purpleD');
      g.ellipse(c, 19, 18, 3, 2, 'orange');
      g.px(c, 18, 11, 'ink'); g.px(c, 21, 12, 'ink'); g.px(c, 9, 19, 'ink'); g.px(c, 16, 21, 'ink');
      g.text(c, 'CELL', 15, 26, { color: 'ink', align: 'center' });
    });
  }

  // ---------------- logo (gold & black) ----------------
  function hexInside(x, y, R) { const ax = Math.abs(x), ay = Math.abs(y); return ax <= 0.866 * R && ay + ax / 1.732 <= R; }
  function bakeLogo(scale) {
    scale = scale || 1;
    const N = 64;
    const base = G().bake(N, N, (c) => {
      const g = G();
      const cx = 32, cy = 32;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        if (!hexInside(dx, dy, 31)) continue;
        let colr = '#0b0a0c';
        if (!hexInside(dx, dy, 30)) colr = '#7a5410';
        else if (!hexInside(dx, dy, 29)) colr = '#f2c14e';
        else if (!hexInside(dx, dy, 28)) colr = '#ffe08a';
        else if (!hexInside(dx, dy, 27)) colr = '#7a5410';
        else if (!hexInside(dx, dy, 25)) colr = '#0b0a0c';
        else if (!hexInside(dx, dy, 24)) colr = '#c98f1c';
        g.px(c, x, y, colr);
      }
      // electron column
      g.rect(c, 27, 8, 10, 3, 'goldD'); g.rect(c, 27, 8, 10, 1, 'goldL');
      g.rect(c, 28, 11, 8, 11, 'gold'); g.rect(c, 28, 11, 2, 11, 'goldL'); g.rect(c, 35, 11, 1, 11, 'goldD');
      g.rect(c, 26, 15, 12, 3, 'gold'); g.rect(c, 26, 15, 12, 1, 'goldLL'); g.rect(c, 26, 17, 12, 1, 'goldD');
      g.rect(c, 30, 22, 4, 3, 'goldD');
      // beam cone
      for (let y = 25; y < 35; y++) {
        const w = Math.round((y - 25) * 0.7) + 1;
        for (let x = 32 - w; x < 32 + w; x++) if ((x + y) % 2 === 0 || Math.abs(x - 31.5) < 1) g.px(c, x, y, 'goldL');
      }
      // snowflake
      const sx = 32, sy = 43;
      for (let k = 0; k < 6; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 3;
        const ex = sx + Math.cos(a) * 11, ey = sy + Math.sin(a) * 11;
        g.line(c, sx, sy, ex, ey, 'goldLL');
        const bx = sx + Math.cos(a) * 6.5, by = sy + Math.sin(a) * 6.5;
        for (const s of [-1, 1]) {
          const b = a + s * 0.8;
          g.line(c, bx, by, bx + Math.cos(b) * 4, by + Math.sin(b) * 4, 'gold');
        }
      }
      g.circle(c, sx, sy, 2, 'goldL'); g.px(c, sx, sy, '#0b0a0c');
    });
    if (scale === 1) return base;
    const out = CQ.makeCanvas(N * scale, N * scale);
    out.getContext('2d').drawImage(base, 0, 0, N * scale, N * scale);
    return out;
  }

  // EM grid (3 mm copper/gold mesh disc), drawn at radius r
  function bakeGrid(r, opts) {
    opts = opts || {};
    const size = r * 2 + 3;
    return G().bake(size, size, (c) => {
      const g = G();
      const cx = r + 1, cy = r + 1;
      g.circle(c, cx, cy, r + 0.5, 'goldDD');
      g.circle(c, cx, cy, r - 0.5, 'gold');
      g.circle(c, cx, cy, r - 2.5, opts.film || '#0e1a2a');
      const step = Math.max(3, Math.round(r / 4));
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
        if (x * x + y * y > (r - 2.5) * (r - 2.5)) continue;
        if (((x + 1000) % step === 0) || ((y + 1000) % step === 0)) g.px(c, cx + x, cy + y, 'goldD');
      }
      g.px(c, cx - Math.round(r * 0.6), cy - Math.round(r * 0.6), 'goldLL');
    });
  }

  S.build = function () {
    // the facility's SEM picture, as a poster on the lab wall
    S.labPoster = new Image();
    S.labPoster.src = (window.CQ_CONFIG && window.CQ_CONFIG.labPosterImage) || 'assets/art/lab_poster.png';
    S.players = LOOKS.map(buildPlayer);
    buildPip();
    S.plunger = bakePlunger();
    S.hpf = bakeHPF();
    S.crossbeam = bakeCrossbeam();
    S.krios = bakeKrios();
    S.computer = bakeComputer();
    S.bench = bakeBench();
    S.tank = bakeTank();
    S.plant = bakePlant();
    S.window = bakeWindow();
    S.door = bakeDoor();
    S.coldSign = bakeColdSign();
    S.clock = bakeClock();
    S.cellPoster = bakeCellPoster();
    S.logo = bakeLogo(1);
    S.logo2 = bakeLogo(2);
    S.grid = bakeGrid;
  };
  S.bakeLogo = bakeLogo;
})();
