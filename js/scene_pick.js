// CRYO QUEST - pick your scientist.
(function () {
  'use strict';
  const CQ = window.CQ;
  const g = () => CQ.gfx;

  let sel = 0, chosen = -1, chosenT = 0;
  const SLOT_X = [72, 152, 232, 312];
  const SLOT_Y = 80;

  CQ.scenes.pick = {
    enter() {
      sel = CQ.irand(0, 3);
      chosen = -1;
      CQ.audio.playMusic('hub');
      CQ.after(0.4, () => CQ.voice.say('pick_1'));
    },
    update(dt) {
      if (chosen >= 0) {
        chosenT += dt;
        if (chosenT > 1.1) {
          CQ.game.look = chosen;
          CQ.game.explorerNo = CQ.explorers.add();
          CQ.go('hub', { intro: true }, { fx: 'mosaic' });
          chosen = -2;
        }
        return;
      }
      if (chosen === -2) return;
      const d = CQ.input.menuDir(dt);
      if (d === 'left') { sel = (sel + 3) % 4; CQ.audio.sfx('move'); }
      if (d === 'right') { sel = (sel + 1) % 4; CQ.audio.sfx('move'); }
      const P = CQ.input.pointer;
      let clicked = -1;
      if (P.moved || P.pressed) {
        for (let i = 0; i < 4; i++) {
          if (Math.abs(P.x - SLOT_X[i]) < 34 && P.y > SLOT_Y - 10 && P.y < SLOT_Y + 90) {
            if (sel !== i && P.moved) { sel = i; CQ.audio.sfx('move'); }
            if (P.pressed) clicked = i;
          }
        }
      }
      if ((CQ.input.pressed('a') || clicked >= 0) && CQ.sceneTime > 0.4) {
        if (clicked >= 0) sel = clicked;
        chosen = sel; chosenT = 0;
        CQ.audio.sfx('select');
        CQ.voice.stop();
      }
    },
    draw(c) {
      const G = g();
      G.bands(c, 0, 0, CQ.W, CQ.H, ['#101633', '#141c40', '#18224d', '#1c285a', '#203066']);
      // checker floor
      for (let y = 150; y < CQ.H; y += 8) for (let x = 0; x < CQ.W; x += 8) G.rect(c, x, y, 8, 8, ((x + y) / 8) % 2 ? '#26346e' : '#2c3c7c');
      G.rect(c, 0, 150, CQ.W, 1, 'gold');
      G.text(c, 'PICK YOUR SCIENTIST!', CQ.W / 2, 18, { color: 'gold', scale: 2, align: 'center', outline: '#000' });
      for (let i = 0; i < 4; i++) {
        const x = SLOT_X[i], isSel = i === sel;
        // pedestal
        G.ellipse(c, x, 150, 26, 6, isSel ? 'goldD' : 'g5');
        G.ellipse(c, x, 149, 24, 5, isSel ? 'gold' : 'g4');
        let jump = 0;
        if (chosen === i) jump = Math.abs(Math.sin(chosenT * 10)) * 10;
        else if (isSel) jump = Math.abs(Math.sin(CQ.time * 5)) * 3;
        const frame = isSel ? Math.floor(CQ.time * 6) % 4 : 0;
        const spr = CQ.sprites.player(i, 'down', chosen === i ? 0 : frame);
        c.drawImage(spr, 0, 0, 16, 20, x - 24, Math.round(SLOT_Y + 8 - jump), 48, 60);
        if (isSel) {
          // bouncing gold arrow
          const ay = SLOT_Y - 12 + Math.round(Math.sin(CQ.time * 6) * 2);
          for (let k = 0; k < 5; k++) G.rect(c, x - 4 + k, ay + k, 9 - k * 2, 1, 'gold');
          G.text(c, CQ.sprites.LOOKS[i].name, x, 158, { color: 'goldL', scale: 2, align: 'center', shadow: '#000' });
        }
      }
      if (chosen === -1) G.pressLine(c, 'TO CHOOSE', CQ.W / 2, 186, 'white');
      if (chosen >= 0) {
        G.text(c, "LET'S GO!", CQ.W / 2, 184, { color: 'gold', scale: 2, align: 'center', outline: '#000' });
      }
      // Pip watching
      c.drawImage(CQ.sprites.pip('left', 0), 352, 130);
    },
  };
})();
