// CRYO QUEST - chiptune music + sound effects, all synthesized (no audio files needed).
(function () {
  'use strict';
  const CQ = window.CQ;

  let ac = null, master, musicBus, sfxBus, noiseBuf = null;
  const waves = {};
  let duckLevel = 1;

  function ensure() {
    if (ac) return ac;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ac = new AC(); } catch (e) { return null; }
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    musicBus = ac.createGain(); musicBus.connect(master);
    sfxBus = ac.createGain(); sfxBus.connect(master);
    applyVolumes();
    // pulse waves with different duty cycles (classic chip sound)
    [0.125, 0.25, 0.5].forEach((d) => {
      const n = 48, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) {
        re[k] = Math.sin(2 * Math.PI * k * d) / (k * Math.PI);
        im[k] = (1 - Math.cos(2 * Math.PI * k * d)) / (k * Math.PI);
      }
      waves['p' + Math.round(d * 100)] = ac.createPeriodicWave(re, im);
    });
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }

  function applyVolumes() {
    if (!ac) return;
    const t = ac.currentTime;
    musicBus.gain.setTargetAtTime(0.55 * CQ.settings.music * duckLevel, t, 0.08);
    sfxBus.gain.setTargetAtTime(0.7 * CQ.settings.sfx, t, 0.02);
  }

  // ---------- note helpers ----------
  const SEMI = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function freq(note) {
    const m = /^([A-G](?:#|b)?)(-?\d)$/.exec(note);
    if (!m) return 0;
    const n = SEMI[m[1]] + (parseInt(m[2], 10) + 1) * 12;
    return 440 * Math.pow(2, (n - 69) / 12);
  }

  function setWave(osc, wave) {
    if (wave === 'tri') osc.type = 'triangle';
    else if (wave === 'sine') osc.type = 'sine';
    else if (wave === 'saw') osc.type = 'sawtooth';
    else if (waves[wave]) osc.setPeriodicWave(waves[wave]);
    else osc.type = 'square';
  }

  // tone(freq, dur, opts) - opts: wave, vol, to (slide target), at (start offset), bus, vib
  function tone(f, dur, o) {
    if (!ensure() || ac.state !== 'running') return;
    o = o || {};
    const t0 = (o.time || ac.currentTime) + (o.at || 0);
    const osc = ac.createOscillator();
    setWave(osc, o.wave || 'p50');
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
    if (o.vib) {
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t0); lg.gain.linearRampToValueAtTime(f * 0.012, t0 + Math.min(0.3, dur));
      lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t0); lfo.stop(t0 + dur + 0.05);
    }
    const g = ac.createGain();
    const v = o.vol === undefined ? 0.3 : o.vol;
    const atk = Math.min(o.attack || 0.004, dur * 0.3), rel = Math.min(o.release || 0.04, dur * 0.5);
    const lvl = o.decay ? v * (o.sustain === undefined ? 0.6 : o.sustain) : v;
    const tRel = Math.max(t0 + dur - rel, t0 + atk + 0.001);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(v, t0 + atk);
    if (o.decay) g.gain.linearRampToValueAtTime(lvl, Math.max(t0 + atk + 0.001, Math.min(t0 + atk + o.decay, tRel)));
    g.gain.setValueAtTime(lvl, tRel);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  // noise(dur, opts) - opts: vol, type (lowpass/highpass/bandpass), f, to, q, at
  function noise(dur, o) {
    if (!ensure() || ac.state !== 'running') return;
    o = o || {};
    const t0 = (o.time || ac.currentTime) + (o.at || 0);
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const filt = ac.createBiquadFilter();
    filt.type = o.type || 'highpass';
    filt.frequency.setValueAtTime(o.f || 1000, t0);
    if (o.to) filt.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + dur);
    filt.Q.value = o.q || 1;
    const g = ac.createGain();
    const v = o.vol === undefined ? 0.3 : o.vol;
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(o.bus || sfxBus);
    src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.02);
  }

  // ---------- music ----------
  // Each channel is a string of steps: note (C5, Bb4, F#3), '-' = hold, '.' = rest.
  // Drum channel tokens: k = kick, s = snare, h = hat, o = open hat.
  const TRACKS = {
    title: {
      bpm: 132, spb: 2,
      ch: [
        { wave: 'p25', vol: 0.16, vib: true, notes:
          'E5 - G5 - C6 - B5 C6 | A5 - - - G5 - E5 - | F5 - A5 - C6 - A5 F5 | G5 - - - D5 - G5 - |' +
          'E5 - G5 - C6 - E6 - | D6 - C6 - A5 - E5 - | F5 - A5 - B5 - D6 - | C6 - - - - - . .' },
        { wave: 'p12', vol: 0.06, notes:
          'G4 C5 E5 C5 G4 C5 E5 C5 | A4 C5 E5 C5 A4 C5 E5 C5 | A4 C5 F5 C5 A4 C5 F5 C5 | B4 D5 G5 D5 B4 D5 G5 D5 |' +
          'G4 C5 E5 C5 G4 C5 E5 C5 | A4 C5 E5 C5 A4 C5 E5 C5 | A4 C5 F5 C5 B4 D5 G5 D5 | G4 C5 E5 G5 C6 . . .' },
        { wave: 'tri', vol: 0.26, notes:
          'C3 . C3 . G2 . C3 . | A2 . A2 . E2 . A2 . | F2 . F2 . C3 . F2 . | G2 . G2 . D3 . G2 . |' +
          'C3 . C3 . G2 . C3 . | A2 . A2 . E2 . A2 . | F2 . F2 . G2 . G2 . | C3 . G2 . C3 - - .' },
        { wave: 'drum', vol: 0.5, notes: 'k . h . s . h k | k . h . s . h h' },
      ],
    },
    hub: {
      bpm: 112, spb: 2,
      ch: [
        { wave: 'p25', vol: 0.14, vib: true, notes:
          'A4 . C5 . F5 - E5 F5 | D5 - A4 - F4 - A4 - | Bb4 . D5 . F5 - D5 Bb4 | C5 - - - E5 - G5 - |' +
          'A5 - G5 F5 E5 - F5 - | D5 - F5 - A5 - F5 - | Bb4 - D5 - E5 - G5 - | F5 - - - . . . .' },
        { wave: 'p12', vol: 0.05, notes:
          'F4 A4 C5 A4 F4 A4 C5 A4 | D4 F4 A4 F4 D4 F4 A4 F4 | D4 F4 Bb4 F4 D4 F4 Bb4 F4 | E4 G4 C5 G4 E4 G4 C5 G4 |' +
          'F4 A4 C5 A4 F4 A4 C5 A4 | D4 F4 A4 F4 D4 F4 A4 F4 | D4 G4 Bb4 G4 E4 G4 C5 G4 | F4 A4 C5 F5 . . . .' },
        { wave: 'tri', vol: 0.25, notes:
          'F2 . C3 . F2 . C3 . | D2 . A2 . D2 . A2 . | Bb1 . F2 . Bb1 . F2 . | C2 . G2 . C2 . G2 . |' +
          'F2 . C3 . F2 . C3 . | D2 . A2 . D2 . A2 . | G2 . D3 . C2 . G2 . | F2 . C3 . F2 - - .' },
        { wave: 'drum', vol: 0.4, notes: 'k . h h s . h . | k . h . s . h h' },
      ],
    },
    game: {
      bpm: 148, spb: 2,
      ch: [
        { wave: 'p25', vol: 0.14, vib: true, notes:
          'E5 - A5 - C6 - B5 A5 | C6 - A5 - F5 - A5 - | G5 - E5 - G5 - C6 - | B5 - - - D6 - B5 G5 |' +
          'A5 - - - E5 - A5 - | C6 - - - A5 - F5 - | E5 - G5 - C6 - E6 - | D6 - - - B5 - - -' },
        { wave: 'tri', vol: 0.26, notes:
          'A2 A2 A3 A2 A2 A2 A3 A2 | F2 F2 F3 F2 F2 F2 F3 F2 | C3 C3 C4 C3 C3 C3 C4 C3 | G2 G2 G3 G2 G2 G2 G3 G2' },
        { wave: 'p12', vol: 0.05, notes:
          'A4 C5 E5 C5 A4 C5 E5 C5 | A4 C5 F5 C5 A4 C5 F5 C5 | G4 C5 E5 C5 G4 C5 E5 C5 | G4 B4 D5 B4 G4 B4 D5 B4' },
        { wave: 'drum', vol: 0.45, notes: 'k . h . s . h . | k k h . s . h h' },
      ],
    },
    cold: {
      bpm: 100, spb: 2,
      ch: [
        { wave: 'p12', vol: 0.12, vib: true, notes:
          'E5 - - - B4 - - - | C5 - - - G4 - - - | A4 - - - E5 - - - | D5 - - - - - - - |' +
          'E5 - G5 - B5 - - - | A5 - G5 - E5 - - - | F5 - E5 - C5 - - - | B4 - - - - - - -' },
        { wave: 'tri', vol: 0.22, notes:
          'E3 B3 E4 B3 E3 B3 E4 B3 | C3 G3 C4 G3 C3 G3 C4 G3 | A2 E3 A3 E3 A2 E3 A3 E3 | B2 F#3 B3 F#3 B2 F#3 B3 F#3' },
        { wave: 'drum', vol: 0.3, notes: 'k . . h . . h . | k . h . . . h .' },
      ],
    },
    wonder: {
      bpm: 84, spb: 4,
      ch: [
        { wave: 'p25', vol: 0.10, vib: true, notes:
          'E5 - - - - - - - G5 - - - - - - - | C5 - - - - - - - E5 - - - D5 - - - | A4 - - - - - - - C5 - - - - - - - | B4 - - - - - - - D5 - - - - - - -' },
        { wave: 'p12', vol: 0.06, notes:
          'C4 E4 G4 B4 C5 B4 G4 E4 C4 E4 G4 B4 C5 B4 G4 E4 | A3 C4 E4 G4 A4 G4 E4 C4 A3 C4 E4 G4 A4 G4 E4 C4 |' +
          'F3 A3 C4 E4 F4 E4 C4 A3 F3 A3 C4 E4 F4 E4 C4 A3 | G3 B3 D4 G4 B4 G4 D4 B3 G3 B3 D4 G4 B4 G4 D4 B3' },
        { wave: 'tri', vol: 0.22, notes:
          'C3 - - - - - - - - - - - - - - - | A2 - - - - - - - - - - - - - - - | F2 - - - - - - - - - - - - - - - | G2 - - - - - - - - - - - - - - -' },
      ],
    },
    fanfare: {
      bpm: 140, spb: 2,
      ch: [
        { wave: 'p25', vol: 0.15, vib: true, notes:
          'C5 - E5 - G5 - C6 - | B5 - G5 - D5 - G5 - | A5 - F5 - C5 - F5 A5 | G5 - - - - - . . |' +
          'C6 - B5 - A5 - G5 - | F5 - E5 - D5 - G5 - | E5 - G5 - C6 - E6 - | C6 - - - - - . .' },
        { wave: 'tri', vol: 0.25, notes:
          'C3 . G2 . C3 . G2 . | G2 . D3 . G2 . D3 . | F2 . C3 . F2 . C3 . | G2 . D3 . G2 . G2 . |' +
          'A2 . E3 . A2 . E3 . | F2 . C3 . G2 . D3 . | C3 . G2 . C3 . G2 . | C3 . G2 . C3 - - .' },
        { wave: 'drum', vol: 0.45, notes: 'k . h . s . h . | k . h k s . o .' },
      ],
    },
  };

  // parse tracks into note events
  for (const name in TRACKS) {
    const tr = TRACKS[name];
    tr.ch.forEach((ch) => {
      const toks = ch.notes.replace(/\|/g, ' ').trim().split(/\s+/);
      ch.len = toks.length;
      ch.events = {};
      let last = null;
      toks.forEach((tk, i) => {
        if (tk === '-') { if (last) last.len++; return; }
        if (tk === '.') { last = null; return; }
        const ev = { tok: tk, len: 1, f: ch.wave === 'drum' ? 0 : freq(tk) };
        ch.events[i] = ev;
        last = ch.wave === 'drum' ? null : ev;
      });
    });
  }

  const music = { want: null, track: null, step: 0, next: 0 };

  function drum(tok, time, vol) {
    if (tok === 'k') {
      tone(150, 0.12, { wave: 'sine', to: 45, vol: vol * 0.9, time, bus: musicBus });
    } else if (tok === 's') {
      noise(0.12, { type: 'bandpass', f: 1800, q: 0.7, vol: vol * 0.5, time, bus: musicBus });
      tone(220, 0.06, { wave: 'tri', to: 140, vol: vol * 0.3, time, bus: musicBus });
    } else if (tok === 'h') {
      noise(0.03, { type: 'highpass', f: 7000, vol: vol * 0.22, time, bus: musicBus });
    } else if (tok === 'o') {
      noise(0.12, { type: 'highpass', f: 6000, vol: vol * 0.2, time, bus: musicBus });
    }
  }

  function scheduleMusic() {
    const tr = music.track;
    if (!tr) return;
    const stepDur = 60 / tr.bpm / tr.spb;
    if (music.next < ac.currentTime - 0.2) music.next = ac.currentTime + 0.05;
    while (music.next < ac.currentTime + 0.15) {
      for (const ch of tr.ch) {
        const ev = ch.events[music.step % ch.len];
        if (!ev) continue;
        if (ch.wave === 'drum') drum(ev.tok, music.next, ch.vol);
        else tone(ev.f, ev.len * stepDur * 0.92, { wave: ch.wave, vol: ch.vol, time: music.next, bus: musicBus,
          vib: ch.vib && ev.len >= 3, decay: 0.1, sustain: 0.7 });
      }
      music.step++;
      music.next += stepDur;
    }
  }

  // ---------- sound effects ----------
  const SFX = {
    blip: () => tone(620, 0.03, { wave: 'p50', vol: 0.06 }),
    move: () => tone(660, 0.05, { wave: 'p25', vol: 0.15 }),
    select: () => { tone(880, 0.06, { wave: 'p25', vol: 0.2 }); tone(1320, 0.08, { wave: 'p25', vol: 0.2, at: 0.06 }); },
    ok: () => { tone(784, 0.08, { wave: 'p25', vol: 0.22 }); tone(1047, 0.16, { wave: 'p25', vol: 0.22, at: 0.08 }); },
    oops: () => { tone(330, 0.12, { wave: 'tri', vol: 0.35 }); tone(262, 0.22, { wave: 'tri', vol: 0.35, at: 0.12 }); },
    star: () => { tone(1319, 0.07, { wave: 'p12', vol: 0.2 }); tone(1976, 0.25, { wave: 'p12', vol: 0.2, at: 0.07 }); },
    win: () => {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1, { wave: 'p25', vol: 0.22, at: i * 0.09 }));
      [1047, 1319, 1568].forEach((f) => tone(f, 0.6, { wave: 'p12', vol: 0.12, at: 0.38, decay: 0.2 }));
      tone(262, 0.7, { wave: 'tri', vol: 0.3, at: 0.38 });
    },
    found: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.08, { wave: 'p12', vol: 0.18, at: i * 0.06 })),
    whoosh: () => noise(0.45, { type: 'bandpass', f: 3000, to: 300, q: 1.2, vol: 0.5 }),
    splash: () => { noise(0.35, { type: 'lowpass', f: 2500, to: 400, vol: 0.45 }); tone(300, 0.15, { wave: 'sine', to: 120, vol: 0.2 }); },
    drop: () => tone(900, 0.12, { wave: 'sine', to: 400, vol: 0.35 }),
    freeze: () => {
      noise(0.5, { type: 'highpass', f: 5000, vol: 0.25 });
      [2093, 2637, 3136, 2349, 2794, 3520].forEach((f, i) => tone(f, 0.06, { wave: 'p12', vol: 0.09, at: i * 0.05 }));
    },
    crack: () => { for (let i = 0; i < 4; i++) noise(0.05, { type: 'highpass', f: 2000 + i * 500, vol: 0.4, at: i * 0.07 }); },
    pump: () => { tone(120, 0.12, { wave: 'p50', to: 60, vol: 0.3 }); noise(0.08, { type: 'lowpass', f: 600, vol: 0.25 }); },
    hiss: () => noise(0.6, { type: 'highpass', f: 3000, vol: 0.25 }),
    zap: () => { noise(0.06, { type: 'highpass', f: 4000, vol: 0.12 }); tone(CQ.rand(1400, 1900), 0.04, { wave: 'p12', vol: 0.05 }); },
    sparkle: () => tone(CQ.pick([1568, 1760, 2093, 2349]), 0.06, { wave: 'p12', vol: 0.08 }),
    snap: () => { noise(0.04, { type: 'highpass', f: 2500, vol: 0.5 }); noise(0.05, { type: 'bandpass', f: 1500, vol: 0.4, at: 0.07 }); },
    beep: () => tone(1000, 0.08, { wave: 'p50', vol: 0.12 }),
    motor: () => tone(180, 0.5, { wave: 'p25', to: 260, vol: 0.08 }),
    step: () => noise(0.03, { type: 'lowpass', f: 900, vol: 0.12 }),
    thud: () => tone(140, 0.15, { wave: 'sine', to: 50, vol: 0.4 }),
    clunk: () => { tone(220, 0.08, { wave: 'p50', to: 110, vol: 0.2 }); noise(0.06, { type: 'lowpass', f: 1200, vol: 0.3 }); },
    pop: () => tone(500, 0.08, { wave: 'sine', to: 1200, vol: 0.3 }),
    tick: () => tone(1200, 0.02, { wave: 'p50', vol: 0.08 }),
  };

  CQ.audio = {
    unlock() {
      if (!ensure()) return;
      if (ac.state === 'suspended') ac.resume().catch(() => {});
    },
    running() { return !!ac && ac.state === 'running'; },
    blocked() { return !ac || ac.state !== 'running'; },
    tick() {
      if (!ac) { ensure(); if (!ac) return; }
      if (ac.state !== 'running') return;
      if (music.want !== music.track) {
        music.track = music.want;
        music.step = 0;
        music.next = ac.currentTime + 0.06;
      }
      scheduleMusic();
    },
    playMusic(name) { music.want = TRACKS[name] || null; },
    stopMusic() { music.want = null; },
    sfx(name) { try { if (SFX[name]) SFX[name](); } catch (e) { /* audio is optional */ } },
    duck(on) { duckLevel = on ? 0.35 : 1; applyVolumes(); },
    applyVolumes,
    tone, noise, freq,
  };

  // try to start right away (works when launched with the kiosk launcher)
  ensure();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
})();
