// CRYO QUEST - hidden staff menu for the kiosk.
// Open with F2, or hold the controller's View + Menu buttons for 3 seconds.
(function () {
  'use strict';
  const CQ = window.CQ;
  const g = () => CQ.gfx;

  const IDLE_CHOICES = [30, 45, 60, 90, 120, 180, 300];
  let sel = 0, holdT = 0, msg = '', msgT = 0;

  function items() {
    const S = CQ.settings;
    const voices = CQ.voice.voices();
    return [
      { label: 'PIP VOICE', value: S.voice ? 'ON' : 'OFF', change: () => { S.voice = !S.voice; if (!S.voice) CQ.voice.stop(); } },
      { label: 'VOICE', value: CQ.voice.voiceName().replace(/^Microsoft\s+/i, '').replace(/\s*-\s*English.*$/i, '').replace(/\s*\(.*$/, '').slice(0, 24), change: (d) => {
        if (!voices.length) return;
        let i = voices.indexOf(CQ.voice.voiceName());
        i = (i + (d || 1) + voices.length) % voices.length;
        CQ.voice.setVoice(voices[i]);
      } },
      { label: 'TEST VOICE', value: 'PRESS A', act: () => CQ.voice.say('intro_1') },
      { label: 'RECORDED VOICE FILES', value: (S.recordedVoice ? 'USE' : 'IGNORE') + (CQ.voice.hasRecordings() ? ' (FOUND)' : ' (NONE)'),
        change: () => { S.recordedVoice = !S.recordedVoice; CQ.voice.reprobe(); } },
      { label: 'MUSIC VOLUME', value: bar(S.music), change: (d) => { S.music = CQ.clamp(Math.round((S.music + 0.1 * (d || 1)) * 10) / 10, 0, 1); CQ.audio.applyVolumes(); } },
      { label: 'SOUND VOLUME', value: bar(S.sfx), change: (d) => { S.sfx = CQ.clamp(Math.round((S.sfx + 0.1 * (d || 1)) * 10) / 10, 0, 1); CQ.audio.applyVolumes(); CQ.audio.sfx('ok'); } },
      { label: 'IDLE RESET', value: S.idleTimeout + ' SEC', change: (d) => {
        let i = IDLE_CHOICES.indexOf(S.idleTimeout); if (i < 0) i = 2;
        i = CQ.clamp(i + (d || 1), 0, IDLE_CHOICES.length - 1); S.idleTimeout = IDLE_CHOICES[i];
      } },
      { label: 'RESET EXPLORER COUNT', value: 'PRESS A', act: () => { CQ.explorers.reset(); say('COUNT RESET'); } },
      { label: 'RESTART GAME', value: 'PRESS A', act: () => { close(); CQ.resetToTitle(); } },
      { label: 'CLOSE MENU', value: '', act: () => close() },
    ];
  }
  function bar(v) { const n = Math.round(v * 10); return '#'.repeat(n) + '-'.repeat(10 - n); }
  function say(m) { msg = m; msgT = 2; }
  function close() { A.open = false; CQ.saveSettings(); CQ.input.flush(); }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'F2') { e.preventDefault(); if (A.open) close(); else { A.open = true; sel = 0; CQ.voice.stop(); } }
  });

  const A = CQ.admin = {
    open: false,
    update(dt) {
      const I = CQ.input;
      // controller: hold View + Menu for 3 seconds
      if (I.held('view') && I.held('start')) {
        holdT += dt;
        if (holdT > 3 && !A.open) { A.open = true; sel = 0; holdT = 0; CQ.voice.stop(); CQ.input.flush(); }
      } else holdT = 0;
      if (!A.open) return;
      if (msgT > 0) msgT -= dt;
      const list = items();
      const d = I.menuDir(dt);
      if (d === 'up') { sel = (sel + list.length - 1) % list.length; CQ.audio.sfx('move'); }
      if (d === 'down') { sel = (sel + 1) % list.length; CQ.audio.sfx('move'); }
      const it = list[sel];
      if ((d === 'left' || d === 'right') && it.change) { it.change(d === 'left' ? -1 : 1); CQ.saveSettings(); }
      if (I.pressed('a')) { if (it.act) it.act(); else if (it.change) { it.change(1); CQ.saveSettings(); } }
      if (I.pressed('b')) close();
      const P = I.pointer;
      if (P.pressed) {
        const row = Math.floor((P.y - 46) / 13);
        if (row >= 0 && row < list.length) { sel = row; const r = list[row]; if (r.act) r.act(); else if (r.change) { r.change(P.x < 250 ? -1 : 1); CQ.saveSettings(); } }
      }
    },
    draw(c) {
      if (!A.open) return;
      const G = g();
      c.fillStyle = 'rgba(0,0,0,0.85)';
      c.fillRect(0, 0, CQ.W, CQ.H);
      G.panel(c, 16, 8, CQ.W - 32, CQ.H - 16);
      G.text(c, 'STAFF SETTINGS', CQ.W / 2, 18, { color: 'gold', scale: 2, align: 'center' });
      const ex = CQ.explorers.today();
      G.text(c, 'EXPLORERS TODAY ' + ex.count + '   ALL TIME ' + ex.total + '   CONTROLLER ' + (CQ.input.padConnected ? 'YES' : 'NO'), CQ.W / 2, 36, { color: 'g2', align: 'center' });
      items().forEach((it, i) => {
        const y = 48 + i * 13;
        if (i === sel) G.rect(c, 26, y - 2, CQ.W - 52, 11, '#2a2410');
        G.text(c, (i === sel ? '> ' : '  ') + it.label, 30, y, { color: i === sel ? 'goldL' : 'white' });
        G.text(c, it.value, CQ.W - 30, y, { color: i === sel ? 'gold' : 'g2', align: 'right' });
      });
      G.text(c, msgT > 0 ? msg : 'UP/DOWN PICK  LEFT/RIGHT CHANGE  A SELECT  B CLOSE', CQ.W / 2, CQ.H - 20, { color: msgT > 0 ? 'green' : 'g3', align: 'center' });
    },
  };
})();
