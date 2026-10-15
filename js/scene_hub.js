// CRYO QUEST - the lab (top-down hub). Walk to the glowing station, press A.
(function () {
  'use strict';
  const CQ = window.CQ;
  const g = () => CQ.gfx;

  const HUD_H = 11;
  const WALL_Y = 66;
  const BOUNDS = { x0: 6, x1: 378, y0: 74, y1: 212 };
  const SPEED = 74;
  const AISLE = 130;                  // open walkway in front of the machines

  const STATIONS = [
    { key: 'freeze', scene: 'freeze', ix: 69, iy: 112, ax: 69, ay: 22, path: [[69, AISLE], [69, 112]],
      click: { x0: 2, y0: 38, x1: 136, y1: 98 } },
    { key: 'fib', scene: 'fib', ix: 175, iy: 114, ax: 175, ay: 28, path: [[175, AISLE], [175, 114]],
      click: { x0: 144, y0: 22, x1: 206, y1: 100 } },
    { key: 'krios', scene: 'krios', ix: 320, iy: 122, ax: 320, ay: 30, path: [[320, AISLE], [320, 122]],
      click: { x0: 290, y0: 11, x1: 350, y1: 108 } },
    { key: 'tomo', scene: 'tomo', ix: 331, iy: 196, ax: 331, ay: 126, path: [[282, AISLE], [282, 196], [331, 196]], faceUp: true,
      click: { x0: 296, y0: 137, x1: 366, y1: 182 } },
  ];
  const SOLIDS = [
    { x: 2, y: 80, w: 134, h: 18 },    // plunge freezer + LN2 + high pressure freezer
    { x: 146, y: 84, w: 88, h: 16 },   // crossbeam + LN2
    { x: 266, y: 92, w: 22, h: 13 },   // LN2 next to the krios
    { x: 288, y: 92, w: 64, h: 16 },   // krios
    { x: 362, y: 80, w: 18, h: 10 },   // plant
    { x: 110, y: 162, w: 96, h: 23 },  // lab bench
    { x: 296, y: 158, w: 70, h: 24 },  // computer desk
  ];
  // things drawn sorted by their bottom edge (so the player can walk in front/behind)
  let PROPS = null;
  function props() {
    const S = CQ.sprites;
    return [
      { spr: S.plunger, x: 2, y: 38 }, { spr: S.tank, x: 52, y: 58 }, { spr: S.hpf, x: 78, y: 38 },
      { spr: S.crossbeam, x: 144, y: 22 }, { spr: S.tank, x: 212, y: 62 },
      { spr: S.tank, x: 266, y: 68 }, { spr: S.krios, x: 290, y: 11 },
      { spr: S.plant, x: 364, y: 66 },
      { spr: S.bench, x: 110, y: 151 }, { spr: S.computer, x: 296, y: 137 },
    ].map((p) => Object.assign(p, { bottom: p.y + p.spr.height }));
  }

  const posterReady = () => { const p = CQ.sprites.labPoster; return !!(p && p.complete && p.naturalWidth > 0); };

  let bg = null, bgHasPoster = false;
  function bakeBackground() {
    const S = CQ.sprites;
    bgHasPoster = posterReady();
    return g().bake(CQ.W, CQ.H, (c) => {
      const G = g();
      // wall
      G.rect(c, 0, HUD_H, CQ.W, WALL_Y - HUD_H, 'wall');
      for (let x = 0; x < CQ.W; x += 24) { G.rect(c, x, HUD_H, 1, WALL_Y - HUD_H - 8, 'wallD'); G.rect(c, x + 1, HUD_H, 1, WALL_Y - HUD_H - 8, 'wallL'); }
      G.rect(c, 0, HUD_H, CQ.W, 2, 'wallL');
      G.rect(c, 0, WALL_Y - 10, CQ.W, 2, 'wallL');
      G.rect(c, 0, WALL_Y - 8, CQ.W, 8, 'wallD');
      G.rect(c, 0, WALL_Y - 2, CQ.W, 2, 'ink');
      // floor tiles
      for (let y = WALL_Y; y < CQ.H; y += 16) for (let x = 0; x < CQ.W; x += 16) {
        const alt = ((x + y) / 16) % 2;
        G.rect(c, x, y, 16, 16, alt ? 'floor1' : 'floor2');
        G.rect(c, x, y, 16, 1, 'floorD');
        G.rect(c, x, y, 1, 16, 'floorD');
        if (alt) G.px(c, x + 3, y + 3, 'white');
      }
      // shadow under the wall
      G.dither(c, 0, WALL_Y, CQ.W, 2, 'floorD', 0);
      // wall decorations
      c.drawImage(S.clock, 40, 18);
      c.drawImage(S.coldSign, 92, 18);
      c.drawImage(S.cellPoster, 352, 20);
      // our facility's SEM picture, framed in gold, on the wall behind the LN2 dewars and the Krios
      G.rect(c, 214, 13, 78, 53, 'goldDD');
      G.rect(c, 215, 14, 76, 51, 'gold');
      G.rect(c, 215, 14, 76, 1, 'goldL');
      if (bgHasPoster) c.drawImage(S.labPoster, 216, 15, 74, 49);
      else G.rect(c, 216, 15, 74, 49, 'g4');
      // gold doormat at the entrance
      G.rect(c, 172, 206, 40, 10, 'goldDD'); G.rect(c, 173, 207, 38, 9, 'gold');
      G.dither(c, 174, 208, 36, 7, 'goldD', 0);
      // floor shadows under props
      G.ellipse(c, 69, 97, 68, 3, 'floorD');
      G.ellipse(c, 189, 99, 48, 3, 'floorD');
      G.ellipse(c, 277, 105, 12, 2, 'floorD');
      G.ellipse(c, 320, 108, 32, 3, 'floorD');
      G.ellipse(c, 158, 186, 50, 3, 'floorD');
      G.ellipse(c, 331, 182, 36, 3, 'floorD');
    });
  }

  const pl = { x: 192, y: 200, dir: 'up', frame: 0, animT: 0, moving: false };
  const pip = { x: 210, y: 200, dir: 'up', frame: 0 };
  let trail = [];
  let auto = null;          // auto-walk waypoints (mouse)
  let autoStation = null;
  let lastMove = 0, lastHint = 0;
  let busy = false;         // during intro / scene change
  let vapor = new CQ.gfx.Particles();

  function hits(x, y) {
    if (x < BOUNDS.x0 || x > BOUNDS.x1 || y < BOUNDS.y0 || y > BOUNDS.y1) return true;
    const fx = x - 5, fy = y - 3, fw = 10, fh = 4;
    for (const r of SOLIDS) if (fx < r.x + r.w && fx + fw > r.x && fy < r.y + r.h && fy + fh > r.y) return true;
    return false;
  }

  function tryMove(dx, dy) {
    let moved = false;
    if (dx && !hits(pl.x + dx, pl.y)) { pl.x += dx; moved = true; }
    if (dy && !hits(pl.x, pl.y + dy)) { pl.y += dy; moved = true; }
    return moved;
  }

  function nearStation() {
    for (let i = 0; i < STATIONS.length; i++) {
      const s = STATIONS[i];
      if (CQ.dist(pl.x, pl.y, s.ix, s.iy) < 22) return i;
    }
    return -1;
  }

  function useStation(i) {
    const st = STATIONS[i];
    const stage = CQ.game.stage;
    if (i === stage) {
      busy = true;
      CQ.audio.sfx('select');
      CQ.go(st.scene, {}, { fx: 'mosaic' });
    } else if (i < stage) {
      CQ.dialog.toast('hub_done', { time: 3 });
      CQ.audio.sfx('oops');
    } else {
      CQ.dialog.toast('hub_locked', { time: 3 });
      CQ.audio.sfx('oops');
    }
  }

  // waypoints for walking to a station with the mouse (around the bench and the desk)
  function planPath(i) {
    const pts = [];
    if (pl.y > 150 && pl.x > 104 && pl.x < 212) pts.push([pl.x < 158 ? 100 : 216, pl.y]);
    if (pl.y > 150 && pl.x > 290) pts.push([284, pl.y]);
    if (i === 3 && pl.y > 186 && pl.x > 280) { pts.length = 0; }
    else pts.push([pts.length ? pts[pts.length - 1][0] : pl.x, AISLE]);
    STATIONS[i].path.forEach((p) => pts.push(p));
    return pts;
  }

  CQ.scenes.hub = {
    state: () => pl, // for testing
    enter(params) {
      if (!bg || (!bgHasPoster && posterReady())) bg = bakeBackground();
      if (!PROPS) PROPS = props();
      busy = false;
      auto = null; autoStation = null;
      trail = [];
      vapor = new CQ.gfx.Particles();
      CQ.audio.playMusic('hub');
      if (params.intro) {
        pl.x = 192; pl.y = 200; pl.dir = 'up';
        pip.x = 214; pip.y = 192; pip.dir = 'left';
        busy = true;
        CQ.after(0.5, () => CQ.dialog.run(['intro_1', 'intro_2', 'intro_3', 'intro_4', 'hub_go0'], () => { busy = false; lastMove = CQ.sceneTime; }));
      } else {
        const from = STATIONS[Math.max(0, CQ.game.stage - 1)];
        pl.x = from.ix; pl.y = from.iy + (from.faceUp ? 0 : 6); pl.dir = 'down';
        if (hits(pl.x, pl.y)) { pl.x = from.ix; pl.y = AISLE; }
        pip.x = pl.x + 18; pip.y = pl.y; pip.dir = 'left';
        if (hits(pip.x, pip.y)) pip.x = pl.x - 18;
        busy = true;
        CQ.after(0.4, () => CQ.dialog.run(['hub_go' + CQ.game.stage], () => { busy = false; lastMove = CQ.sceneTime; }));
      }
      lastMove = CQ.sceneTime; lastHint = CQ.sceneTime;
    },
    update(dt) {
      vapor.update(dt);
      // cold mist from the plunge freezer's cryogen container
      if (Math.random() < 0.15) vapor.add({ x: 18 + CQ.rand(0, 14), y: 78, vx: CQ.rand(-4, 4), vy: CQ.rand(-10, -4), life: CQ.rand(0.6, 1.4), color: CQ.pick(['white', 'iceL']) });

      if (busy || CQ.dialog.active) { pl.moving = false; return; }

      const I = CQ.input;
      let mx = I.stick.x, my = I.stick.y;
      // mouse: click to walk / click a station
      const P = I.pointer;
      if (P.pressed) {
        let clickedStation = -1;
        for (let i = 0; i < STATIONS.length; i++) {
          const s = STATIONS[i], r = s.click;
          if (P.x >= r.x0 && P.x <= r.x1 && P.y >= r.y0 && P.y <= r.y1) clickedStation = i;
          if (CQ.dist(P.x, P.y, s.ix, s.iy) < 14) clickedStation = i;
        }
        if (clickedStation >= 0) {
          if (nearStation() === clickedStation) { useStation(clickedStation); return; }
          auto = planPath(clickedStation); autoStation = clickedStation;
        } else if (P.y > WALL_Y) {
          auto = [[P.x, P.y]]; autoStation = null;
        }
      }
      if (Math.hypot(mx, my) > 0.1) { auto = null; autoStation = null; }
      if (auto && auto.length) {
        const [tx, ty] = auto[0];
        const dx = tx - pl.x, dy = ty - pl.y, d = Math.hypot(dx, dy);
        if (d < 2) { auto.shift(); if (!auto.length) { auto = null; if (autoStation !== null) { const st = autoStation; autoStation = null; pl.dir = 'up'; useStation(st); return; } } }
        else { mx = dx / d; my = dy / d; }
      }

      pl.moving = false;
      if (Math.hypot(mx, my) > 0.1) {
        const moved = tryMove(mx * SPEED * dt, my * SPEED * dt);
        if (Math.abs(mx) > Math.abs(my)) pl.dir = mx > 0 ? 'right' : 'left';
        else pl.dir = my > 0 ? 'down' : 'up';
        if (moved) {
          pl.moving = true;
          lastMove = CQ.sceneTime;
          trail.push([pl.x, pl.y]);
          if (trail.length > 60) trail.shift();
        } else if (auto) { auto = null; autoStation = null; }
      }
      if (pl.moving) {
        pl.animT += dt;
        if (pl.animT > 0.13) { pl.animT = 0; pl.frame = (pl.frame + 1) % 4; if (pl.frame % 2) CQ.audio.sfx('step'); }
      } else { pl.frame = 0; pl.animT = 0; }

      // Pip follows a few steps behind
      if (trail.length > 16) {
        const [tx, ty] = trail[trail.length - 16];
        const dx = tx - pip.x, dy = ty - pip.y;
        if (Math.hypot(dx, dy) > 0.5) {
          pip.x += dx * 0.2; pip.y += dy * 0.2;
          if (Math.abs(dx) > Math.abs(dy)) pip.dir = dx > 0 ? 'right' : 'left'; else pip.dir = dy > 0 ? 'down' : 'up';
          pip.frame = Math.floor(CQ.time * 8) % 4;
        } else pip.frame = 0;
      }

      // use a station
      const near = nearStation();
      if (near >= 0 && I.pressed('a')) { useStation(near); return; }

      // gentle hint if the kid seems stuck
      if (CQ.sceneTime - lastMove > 10 && CQ.sceneTime - lastHint > 16) {
        lastHint = CQ.sceneTime;
        CQ.dialog.toast('hub_hint', { time: 4 });
      }
    },
    draw(c) {
      const G = g();
      if (!bgHasPoster && posterReady()) bg = bakeBackground();
      c.drawImage(bg, 0, 0);

      // y-sorted props + characters
      const list = PROPS.map((p) => ({ y: p.bottom, draw: () => c.drawImage(p.spr, p.x, p.y) }));
      list.push({ y: pl.y, draw: () => {
        G.ellipse(c, pl.x, pl.y, 6, 2, 'floorD');
        c.drawImage(CQ.sprites.player(CQ.game.look, pl.dir, pl.frame), Math.round(pl.x - 8), Math.round(pl.y - 20 - (pl.moving && pl.frame % 2 ? 1 : 0)));
      } });
      list.push({ y: pip.y - 0.5, draw: () => {
        G.ellipse(c, pip.x, pip.y, 6, 2, 'floorD');
        c.drawImage(CQ.sprites.pip(pip.dir, pip.frame), Math.round(pip.x - 8), Math.round(pip.y - 17 - (pip.frame % 2)));
      } });
      list.sort((a, b) => a.y - b.y).forEach((o) => o.draw());
      vapor.draw(c);

      // blinking screens/lights and the Krios's blue glow
      if (Math.floor(CQ.time * 2) % 2) { G.px(c, 175, 78, 'white'); G.rect(c, 5, 87, 2, 1, 'white'); }
      if (Math.floor(CQ.time * 1.5) % 2) G.rect(c, 125, 56, 3, 1, '#d8f6ff');
      const glow = (Math.sin(CQ.time * 2) + 1) / 2;
      c.globalAlpha = 0.25 + glow * 0.5;
      G.rect(c, 302, 23, 21, 1, '#e3eaff'); G.rect(c, 325, 23, 21, 1, '#e3eaff');
      G.rect(c, 302, 100, 21, 1, '#e3eaff'); G.rect(c, 325, 100, 21, 1, '#e3eaff');
      c.globalAlpha = 1;

      // station markers
      const stage = CQ.game.stage;
      STATIONS.forEach((s, i) => {
        if (i < stage) { G.star(c, s.ax - 5, s.ay - 4, true); }
        if (i === stage) {
          const by = s.ay + Math.round(Math.sin(CQ.time * 5) * 3);
          // big gold arrow pointing down
          for (let k = 0; k < 7; k++) G.rect(c, s.ax - 7 + k, by + 6 + k, 15 - k * 2, 1, k === 0 ? 'goldL' : 'gold');
          G.rect(c, s.ax - 3, by - 2, 7, 8, 'gold'); G.rect(c, s.ax - 3, by - 2, 2, 8, 'goldL');
          G.rect(c, s.ax - 4, by - 3, 9, 1, 'goldDD');
          if (Math.random() < 0.1) vapor.add({ x: s.ax + CQ.rand(-14, 14), y: by + CQ.rand(0, 20), vy: -8, life: 0.6, color: 'goldL' });
          // glowing floor spot
          if (Math.floor(CQ.time * 4) % 2) G.ellipse(c, s.ix, s.iy + 1, 9, 3, 'goldL');
        }
      });

      // "press A" bubble above the player when at a station
      const near = nearStation();
      if (near >= 0 && !CQ.dialog.active && !busy) {
        const iw = G.promptWidth();
        const bw = iw + 8;
        const bx = Math.round(pl.x - bw / 2), by = Math.round(pl.y - 40);
        G.rect(c, bx - 1, by - 2, bw + 2, 17, 'ink'); G.rect(c, bx, by - 1, bw, 15, 'white');
        G.rect(c, Math.round(pl.x) - 2, by + 15, 4, 2, 'ink'); G.rect(c, Math.round(pl.x) - 1, by + 13, 2, 3, 'white');
        G.prompt(c, bx + 4, by + 1);
      }

      // HUD
      G.rect(c, 0, 0, CQ.W, HUD_H, 'black');
      G.rect(c, 0, HUD_H - 1, CQ.W, 1, 'goldD');
      const names = ['FREEZE', 'SLICE', 'SNAP', '3D'];
      const keys = ['freeze', 'fib', 'krios', 'tomo'];
      let x = 4;
      names.forEach((n, i) => {
        G.text(c, n, x, 2, { color: i === stage ? 'goldL' : i < stage ? 'gold' : 'g4' });
        x += G.measure(n) + 3;
        for (let k = 0; k < 3; k++) G.text(c, '*', x + k * 6, 2, { color: k < CQ.game.stars[keys[i]] ? 'gold' : 'g5' });
        x += 22;
      });
      G.text(c, 'EXPLORER #' + CQ.game.explorerNo, CQ.W - 4, 2, { color: 'gold', align: 'right' });
    },
  };
})();
