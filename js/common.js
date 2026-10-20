// CRYO QUEST - shared stage helpers: star results panel, finishing a stage, little drawing bits.
(function () {
  'use strict';
  const CQ = window.CQ;
  const STAGES = ['freeze', 'fib', 'krios', 'tomo'];

  // Start the end-of-stage sequence. The scene must call CQ.drawResult(c, scene) in its draw()
  // while scene.phase === 'result'.
  //   key: 'freeze' | 'fib' | 'krios' | 'tomo'
  //   lines: lines Pip says after the stars (e.g. ['fr_done', 'fr_next'])
  //   next: optional function to run instead of going back to the lab
  CQ.finishStage = function (scene, key, stars, lines, next) {
    stars = CQ.clamp(Math.round(stars), 1, 3);
    scene.phase = 'result';
    scene.resultStart = CQ.sceneTime;
    scene.resultStars = stars;
    scene.resultShown = 0;
    CQ.game.stars[key] = Math.max(CQ.game.stars[key] || 0, stars);
    CQ.audio.playMusic(null);
    CQ.audio.sfx('win');
    for (let i = 0; i < stars; i++) {
      CQ.after(0.7 + i * 0.45, () => { scene.resultShown = i + 1; CQ.audio.sfx('star'); CQ.shake(2); });
    }
    CQ.after(0.9 + stars * 0.45, () => {
      CQ.audio.playMusic('fanfare');
      CQ.dialog.run(['stars_' + stars].concat(lines || []), () => {
        CQ.realcard.show(key === 'tomo' ? 'tomogram' : key, () => {
          CQ.game.stage = Math.max(CQ.game.stage, STAGES.indexOf(key) + 1);
          if (next) next();
          else CQ.go('hub', { from: key }, { fx: 'mosaic' });
        });
      }, { pos: 'bottom' });
    });
  };

  CQ.drawResult = function (c, scene) {
    const g = CQ.gfx;
    const t = CQ.sceneTime - (scene.resultStart || 0);
    c.fillStyle = 'rgba(0,0,0,0.55)';
    c.fillRect(0, 0, CQ.W, CQ.H);
    // rays
    c.save();
    c.translate(CQ.W / 2, 74);
    c.rotate(t * 0.4);
    c.fillStyle = 'rgba(242,193,78,0.10)';
    for (let i = 0; i < 12; i++) {
      c.rotate(Math.PI / 6);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-14, -200); c.lineTo(14, -200); c.closePath(); c.fill();
    }
    c.restore();
    const pop = CQ.ease.outBack(Math.min(1, t * 3));
    const w = Math.round(220 * pop), h = Math.round(96 * pop);
    if (w > 20 && h > 20) g.panel(c, CQ.W / 2 - w / 2, 26, w, h);
    if (t > 0.3) {
      g.text(c, 'GREAT WORK!', CQ.W / 2, 36, { color: 'gold', scale: 2, align: 'center', shadow: 'goldDD' });
      for (let i = 0; i < 3; i++) {
        const on = i < scene.resultShown;
        const sx = CQ.W / 2 - 54 + i * 38, sy = 62;
        if (on) {
          const k = Math.min(1, (t - (0.7 + i * 0.45)) * 4);
          const sc = k < 1 ? 3 + Math.round((1 - k) * 2) : 3;
          g.star(c, sx + 16 - (11 * sc) / 2, sy + 16 - (11 * sc) / 2, true, sc);
        } else {
          g.star(c, sx, sy, false, 3);
        }
      }
    }
  };

  // ---------------------------------------------------------------- the samples kids can choose
  // thick: true -> high pressure freezer; false -> plunge freezer
  CQ.ORGANISMS = {
    bacteria: { key: 'bacteria', name: 'BACTERIA', thick: false, nameLine: 'name_bacteria', facts: ['fr_bac_1', 'fr_bac_2'] },
    yeast: { key: 'yeast', name: 'YEAST', thick: false, nameLine: 'name_yeast', facts: ['fr_yeast_1', 'fr_yeast_2'] },
    worm: { key: 'worm', name: 'WORM', thick: true, nameLine: 'name_worm', facts: ['fr_worm_1', 'fr_worm_2'] },
  };
  CQ.ORGANISM_ORDER = ['bacteria', 'yeast', 'worm'];

  // a pink, wiggly worm (C. elegans) centred at cx,cy
  CQ.drawWorm = function (c, cx, cy, t, scale) {
    const g = CQ.gfx;
    scale = scale || 1;
    const seg = (i) => [cx - 16 * scale + i * 2.4 * scale, cy + Math.sin(t * 5 + i * 0.6) * 2.5 * scale];
    for (let i = 0; i < 14; i++) { const [x, y] = seg(i); g.circle(c, x, y, 2.8 * scale, '#c9507a'); }
    for (let i = 0; i < 14; i++) { const [x, y] = seg(i); g.circle(c, x, y - 0.5, 2 * scale, '#ffb3c6'); }
    const [hx, hy] = seg(13);
    g.rect(c, hx - scale, hy - scale, Math.max(1, scale), Math.max(1, scale), 'ink');
    g.rect(c, hx + scale, hy - scale, Math.max(1, scale), Math.max(1, scale), 'ink');
  };

  // a few bacteria (green rods with tiny tails) or yeast cells (round, some budding) around cx,cy
  // fixed, well-spaced spots (x, y, angle) so each cell is easy to see
  const MICROBE_SPOTS = {
    bacteria: [[-16, -1, 0.25], [-3, 3, -0.35], [10, -3, 0.5], [-8, -5, 1.4], [17, 3, -0.2]],
    yeast: [[-14, 0], [-1, -3], [12, 1], [-6, 4], [5, 4]],
  };
  CQ.drawMicrobes = function (c, kind, cx, cy, t, scale) {
    const g = CQ.gfx;
    scale = scale || 1;
    const k = scale * 0.8;
    MICROBE_SPOTS[kind === 'bacteria' ? 'bacteria' : 'yeast'].forEach((spot, i) => {
      const x = cx + spot[0] * k + Math.sin(t * 2 + i) * 0.6;
      const y = cy + spot[1] * k + Math.cos(t * 2.3 + i) * 0.5;
      if (kind === 'bacteria') {
        const a = spot[2] + Math.sin(t * 3 + i) * 0.12;
        const L = 3 * scale, rr = Math.max(1, 1.1 * scale);
        const x0 = x - Math.cos(a) * L, y0 = y - Math.sin(a) * L, x1 = x + Math.cos(a) * L, y1 = y + Math.sin(a) * L;
        g.capsule(c, x0, y0, x1, y1, rr + 0.6, '#1f7a36');
        g.capsule(c, x0, y0, x1, y1, rr, '#5ad46a');
        g.px(c, x - Math.cos(a) * L * 0.5, y - Math.sin(a) * L * 0.5 - 1, '#b3f5a0');
        // a little tail (flagellum)
        for (let k = 1; k <= 3 * scale; k++) {
          g.px(c, x1 + Math.cos(a) * k + Math.sin(t * 12 + k) * 0.6, y1 + Math.sin(a) * k + Math.cos(t * 12 + k) * 0.6, '#1f7a36');
        }
      } else {
        const rr = 2.2 * scale;
        g.circle(c, x, y, rr + 0.7, '#a07a2a');
        g.circle(c, x, y, rr, '#e8c46a');
        g.px(c, x - rr * 0.4, y - rr * 0.4, '#fff3c4');
        if (i % 2 === 0) {
          const bx = x + rr * 0.9, by = y - rr * 0.6;
          g.circle(c, bx, by, rr * 0.55 + 0.6, '#a07a2a');
          g.circle(c, bx, by, rr * 0.55, '#e8c46a');
        }
      }
    });
  };

  // the sample as it sits in a dish: a drop of microbes, or the worm
  CQ.drawSample = function (c, kind, cx, cy, t, scale) {
    const g = CQ.gfx;
    scale = scale || 1;
    if (kind === 'worm') { CQ.drawWorm(c, cx, cy - scale, t, scale); return; }
    g.ellipse(c, cx, cy, 15 * scale, 7 * scale, '#3c8fd8');
    g.ellipse(c, cx, cy - 1, 14 * scale, 6 * scale, '#7fc8ff');
    g.ellipse(c, cx - 5 * scale, cy - 3 * scale, 4 * scale, 1.5 * scale, '#d8f2ff');
    CQ.drawMicrobes(c, kind, cx, cy, t, scale);
  };

  // little helpers used by several scenes
  CQ.drawPipBig = function (c, x, y, happy) {
    c.drawImage(happy ? CQ.sprites.pipHappy() : CQ.sprites.pipPortrait(false), Math.round(x), Math.round(y));
  };

  // big "PRESS A!" call-to-action in a gold box
  CQ.drawCallout = function (c, label, cx, cy) {
    const g = CQ.gfx;
    const pulse = Math.floor(CQ.time * 4) % 2;
    const tw = g.measure(label, 2), iw = g.promptWidth();
    // accented capitals (Spanish) need room above the letters
    const acc = /[ÁÉÍÓÚÑÜ]/.test(CQ.i18n.ui(String(label).toUpperCase()));
    const w = tw + iw + 20, h = acc ? 26 : 22, ty = acc ? 9 : 5;
    const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    g.panel(c, x, y - pulse, w, h);
    g.prompt(c, x + 7, y + ty + (acc ? 1 : 0) - pulse, { blink: false });
    g.text(c, label, x + 7 + iw + 6, y + ty - pulse, { color: pulse ? 'goldL' : 'gold', scale: 2 });
  };
})();
