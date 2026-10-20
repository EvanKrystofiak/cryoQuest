// CRYO QUEST - dialog box (Pip talks) and small "toast" hints.
// Lines auto-advance after Pip finishes talking, so kids who don't press anything still move on.
(function () {
  'use strict';
  const CQ = window.CQ;
  const G = () => CQ.gfx;

  const BOX = { x: 4, y: 152, w: 376, h: 60 };

  const d = CQ.dialog = {
    active: false,
    queue: [],
    line: null,
    shown: 0,
    voiceDone: false,
    wait: 0,
    onDone: null,
    pos: 'bottom',
    toastLine: null,
    toastT: 0,
  };

  function resolve(item) {
    if (typeof item === 'string') {
      const l = CQ.i18n.line(item);
      return l ? { id: item, t: l.t, say: l.say } : { id: null, t: item };
    }
    return item;
  }

  function startLine() {
    d.line = resolve(d.queue.shift());
    d.lines = G().wrap(d.line.t, BOX.w - (d.portrait ? 62 : 24), 1);
    d.total = d.lines.join(' ').length;
    d.shown = 0;
    d.wait = 0;
    d.voiceDone = false;
    d.blipCount = 0;
    const L = d.line;
    if (CQ.settings.voice) {
      CQ.voice.speak(L.say || L.t, () => { d.voiceDone = true; }, L.id);
    } else {
      d.voiceDone = true;
    }
  }

  // run(['intro_1','intro_2'], onDone, { pos: 'top'|'bottom', portrait: true })
  d.run = function (items, onDone, opts) {
    opts = opts || {};
    d.queue = items.slice();
    d.onDone = onDone || null;
    d.pos = opts.pos || 'bottom';
    d.portrait = opts.portrait !== false;
    d.active = true;
    d.age = 0;
    startLine();
  };

  d.close = function (silent) {
    const was = d.active;
    d.active = false;
    d.queue = [];
    d.line = null;
    d.toastLine = null;
    if (!silent && was) CQ.voice.stop();
  };

  function advance() {
    if (d.queue.length) { startLine(); return; }
    d.active = false;
    d.line = null;
    const cb = d.onDone;
    d.onDone = null;
    CQ.input.flush();
    if (cb) cb();
  }

  d.update = function (dt) {
    if (!d.active || !d.line) return;
    d.age += dt;
    const before = Math.floor(d.shown);
    d.shown = Math.min(d.total, d.shown + dt * 38);
    if (Math.floor(d.shown) !== before && !CQ.voice.speaking) {
      d.blipCount++;
      if (d.blipCount % 3 === 0) CQ.audio.sfx('blip');
    }
    const done = d.shown >= d.total;
    // press A: finish typing, or go to the next line
    if (CQ.input.act() && d.age > 0.25) {
      CQ.input.flush();
      if (!done) d.shown = d.total;
      else { CQ.voice.stop(); advance(); return; }
    }
    if (done) {
      const voiceOff = !CQ.settings.voice || CQ.voice.blocked || !CQ.voice.available();
      if (d.voiceDone || voiceOff) {
        d.wait += dt;
        const need = voiceOff ? 1.6 + d.total * 0.05 : 1.4;
        if (d.wait > need) advance();
      }
    }
  };

  // small, non-blocking hint at the top of the screen
  d.toast = function (id, opts) {
    opts = opts || {};
    const l = resolve(id);
    d.toastLine = l;
    d.toastT = opts.time || 3;
    d.toastLines = G().wrap(l.t, 300, 1);
    if (opts.speak !== false && CQ.settings.voice) CQ.voice.speak(l.say || l.t, null, l.id);
  };

  function drawToast(c, dt) {
    if (!d.toastLine) return;
    d.toastT -= 1 / 60;
    if (d.toastT <= 0) { d.toastLine = null; return; }
    const g = G();
    const n = d.toastLines.length;
    const w = Math.max.apply(null, d.toastLines.map((s) => g.measure(s, 1, true))) + 34;
    const h = 12 + n * 10;
    const x = Math.round(CQ.W / 2 - w / 2), y = 14;
    g.panel(c, x, y, w, h);
    c.drawImage(CQ.sprites.pipMini(), x + 6, y + Math.round(h / 2) - 7);
    d.toastLines.forEach((s, i) => g.text(c, s, x + 26, y + 6 + i * 10, { color: 'white', raw: true }));
  }

  d.draw = function (c) {
    drawToast(c);
    if (!d.active || !d.line) return;
    const g = G();
    const by = d.pos === 'top' ? 4 : BOX.y;
    const slide = Math.min(1, d.age * 6);
    const y = Math.round(d.pos === 'top' ? by - (1 - slide) * 20 : by + (1 - slide) * 20);
    g.panel(c, BOX.x, y, BOX.w, BOX.h);
    let tx = BOX.x + 12;
    if (d.portrait) {
      // portrait frame
      g.rect(c, BOX.x + 7, y + 7, 46, 46, 'goldD');
      g.rect(c, BOX.x + 8, y + 8, 44, 44, '#203060');
      g.dither(c, BOX.x + 8, y + 30, 44, 22, '#2a3c78');
      const talking = CQ.voice.speaking || d.shown < d.total;
      c.drawImage(CQ.sprites.pipPortrait(talking && Math.floor(CQ.time * 8) % 2 === 0), BOX.x + 10, y + 10);
      // name tag
      g.rect(c, BOX.x + 10, y - 6, 26, 9, 'goldDD');
      g.rect(c, BOX.x + 11, y - 5, 24, 7, 'gold');
      g.text(c, 'PIP', BOX.x + 14, y - 5, { color: 'ink' });
      tx = BOX.x + 60;
    }
    // typewriter text
    let left = Math.floor(d.shown);
    const n = d.lines.length;
    const ty = y + Math.round((BOX.h - (n * 11 - 4)) / 2);
    for (let i = 0; i < n && left > 0; i++) {
      const s = d.lines[i].slice(0, left);
      left -= d.lines[i].length + 1;
      g.text(c, s, tx, ty + i * 11, { color: 'white', shadow: '#000', raw: true });
    }
    if (d.shown >= d.total && Math.floor(CQ.time * 2) % 2 === 0) {
      // little gold "next" arrow
      const ax = BOX.x + BOX.w - 14, ay = y + BOX.h - 12;
      g.rect(c, ax, ay, 7, 1, 'gold'); g.rect(c, ax + 1, ay + 1, 5, 1, 'gold'); g.rect(c, ax + 2, ay + 2, 3, 1, 'gold'); g.rect(c, ax + 3, ay + 3, 1, 1, 'gold');
    }
  };
})();
