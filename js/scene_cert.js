// CRYO QUEST - the certificate at the end. Then back to the title for the next explorer.
(function () {
  'use strict';
  const CQ = window.CQ;
  const g = () => CQ.gfx;

  let confetti = [];
  let canLeave = false;

  CQ.scenes.cert = {
    enter() {
      confetti = [];
      for (let i = 0; i < 90; i++) confetti.push(newBit(true));
      canLeave = false;
      CQ.audio.playMusic('fanfare');
      CQ.after(0.6, () => CQ.dialog.run(['cert_1', 'cert_2'], () => { canLeave = true; }, { pos: 'top' }));
      CQ.after(30, () => CQ.resetToTitle());
    },
    update(dt) {
      for (const b of confetti) {
        b.y += b.vy * dt; b.x += Math.sin(CQ.time * 3 + b.ph) * 12 * dt; b.spin += dt * 8;
        if (b.y > CQ.H + 4) Object.assign(b, newBit(false));
      }
      if ((canLeave || CQ.sceneTime > 6) && !CQ.dialog.active && CQ.input.act()) CQ.resetToTitle();
    },
    draw(c) {
      const G = g();
      G.rect(c, 0, 0, CQ.W, CQ.H, '#0a0908');
      // certificate frame
      G.rect(c, 10, 10, CQ.W - 20, CQ.H - 20, 'goldDD');
      G.rect(c, 12, 12, CQ.W - 24, CQ.H - 24, 'gold');
      G.rect(c, 14, 14, CQ.W - 28, CQ.H - 28, '#0a0908');
      G.rect(c, 17, 17, CQ.W - 34, CQ.H - 34, 'goldD');
      G.rect(c, 18, 18, CQ.W - 36, CQ.H - 36, '#12100c');
      for (const [x, y] of [[14, 14], [CQ.W - 22, 14], [14, CQ.H - 22], [CQ.W - 22, CQ.H - 22]]) { G.rect(c, x, y, 8, 8, 'gold'); G.rect(c, x + 2, y + 2, 4, 4, 'goldDD'); }

      c.drawImage(CQ.sprites.logo, 26, 26);
      G.text(c, 'CERTIFICATE', 218, 30, { color: 'goldL', align: 'center' });
      G.text(c, 'CRYO-ET', 218, 44, { color: 'gold', scale: 3, align: 'center', shadow: 'goldDD' });
      G.text(c, 'SCIENTIST', 218, 70, { color: 'gold', scale: 3, align: 'center', shadow: 'goldDD' });
      const cfg = window.CQ_CONFIG || {};
      G.text(c, 'EXPLORER #' + CQ.game.explorerNo + ' AT ' + (cfg.labName || 'OUR LAB'), 218, 98, { color: 'white', align: 'center' });

      // you + Pip
      const look = CQ.game.look;
      const hop = Math.abs(Math.sin(CQ.time * 4)) * 4;
      c.drawImage(CQ.sprites.player(look, 'down', 0), 0, 0, 16, 20, 30, Math.round(116 - hop), 48, 60);
      c.drawImage(CQ.sprites.pipHappy(), 80, 140);

      // stars per stage
      const rows = [['FREEZE', 'freeze'], ['SLICE', 'fib'], ['SNAP', 'krios'], ['3D', 'tomo']];
      let total = 0;
      rows.forEach(([name, key], i) => {
        const y = 112 + i * 16;
        G.text(c, name, 196, y + 2, { color: 'goldL', align: 'right' });
        const n = CQ.game.stars[key] || 0;
        total += n;
        for (let k = 0; k < 3; k++) G.star(c, 204 + k * 13, y, k < n);
      });
      G.text(c, 'STARS', 296, 114, { color: 'goldL', align: 'center' });
      G.text(c, total + '/12', 296, 126, { color: 'gold', scale: 3, align: 'center', shadow: 'goldDD' });
      const org = CQ.ORGANISMS[CQ.game.organism] || CQ.ORGANISMS.yeast;
      G.text(c, 'WE LOOKED INSIDE:', 296, 157, { color: 'g2', align: 'center' });
      G.text(c, org.name, 296, 167, { color: 'gold', align: 'center' });
      if ((canLeave || CQ.sceneTime > 6) && !CQ.dialog.active) G.pressLine(c, 'TO FINISH', 218, 186, 'white');

      for (const b of confetti) {
        const w = Math.abs(Math.cos(b.spin)) * 3 + 1;
        G.rect(c, b.x, b.y, w, 2, b.c);
      }
    },
  };

  function newBit(anywhere) {
    return { x: CQ.rand(0, CQ.W), y: anywhere ? CQ.rand(-CQ.H, CQ.H) : CQ.rand(-30, -4), vy: CQ.rand(25, 60), ph: CQ.rand(0, 6), spin: CQ.rand(0, 6),
      c: CQ.pick(['gold', 'goldL', 'white', 'iceL', 'ice', 'pink', 'greenL']) };
  }
})();
