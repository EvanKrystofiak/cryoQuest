// CRYO QUEST - narration. Uses recorded voice files (voice/<LINE_ID>.mp3, Spanish: voice/es/<LINE_ID>.mp3)
// when present, otherwise the computer's built-in text-to-speech voice.
// If the computer has no Spanish voice, Pip stays quiet in Spanish (the text still shows).
(function () {
  'use strict';
  const CQ = window.CQ;
  const synth = window.speechSynthesis || null;

  let voice = null;          // voice for the current language (null = none installed)
  let voiceLang = null;
  let token = 0;
  let current = null;       // HTMLAudioElement when playing a recording
  const recordings = { en: null, es: null }; // null = unknown, true/false after probing

  const lang = () => (CQ.i18n ? CQ.i18n.lang : 'en');
  const voiceSetting = () => (lang() === 'es' ? 'voiceNameEs' : 'voiceName');
  const recDir = () => (lang() === 'es' ? 'voice/es/' : 'voice/');

  function voicesFor(l) {
    const all = (synth && synth.getVoices()) || [];
    return all.filter((v) => (l === 'es' ? /^es(-|_|$)/i : /^en(-|_|$)/i).test(v.lang));
  }

  function pickVoice() {
    if (!synth) return null;
    const all = synth.getVoices() || [];
    if (!all.length) return null;
    const l = lang();
    const mine = voicesFor(l);
    // never read Spanish text with an English voice; English falls back to any voice
    const pool = mine.length ? mine : l === 'es' ? [] : all;
    if (!pool.length) return null;
    const want = CQ.settings[voiceSetting()];
    if (want) {
      const v = pool.find((x) => x.name.toLowerCase().includes(want.toLowerCase()));
      if (v) return v;
    }
    const online = navigator.onLine;
    // checked in order; whole words only (so "ana" does not match "Canada")
    const natural = (re) => (v) => online && /natural/i.test(v.name) && re.test(v.name);
    const prefer = l === 'es' ? [
      // Latin American Spanish first (Edge lists Spain's voices before Mexico's)
      natural(/\bdalia\b/i),
      natural(/\bpaloma\b/i),
      (v) => online && /natural/i.test(v.name) && /es-(mx|us)/i.test(v.lang),
      (v) => online && /natural/i.test(v.name),
      (v) => v.localService && /\bsabina\b/i.test(v.name),
      (v) => v.localService && /es-(mx|us)/i.test(v.lang),
      (v) => v.localService,
      () => true,
    ] : [
      natural(/\bana\b/i),
      natural(/\b(aria|jenny)\b/i),
      (v) => online && /natural/i.test(v.name) && /en-us/i.test(v.lang),
      natural(/\b(emma|ava|michelle|libby|sonia)\b/i),
      (v) => v.localService && /\b(zira|hazel|susan|jenny|aria|catherine|linda|heera)\b/i.test(v.name),
      (v) => v.localService && /en-us/i.test(v.lang),
      (v) => v.localService,
      () => true,
    ];
    for (const test of prefer) { const v = pool.find(test); if (v) return v; }
    return pool[0];
  }
  function refreshVoice() { voice = pickVoice(); voiceLang = lang(); }
  function currentVoice() { if (!voice || voiceLang !== lang()) refreshVoice(); return voice; }
  if (synth) {
    refreshVoice();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoice);
    else synth.onvoiceschanged = refreshVoice;
  }

  // Display text is ALL CAPS; speech engines read caps words as letters, so convert to sentence case.
  function speechText(t) {
    let s = String(t).toLowerCase();
    s = s.replace(/(^\s*|[.!?]\s+)([¡¿]?)([a-záéíóúñü])/g, (m, a, p, b) => a + p + b.toUpperCase());
    if (lang() === 'es') {
      s = s.replace(/\bpip\b/g, 'Pip');
      s = s.replace(/-(\d)/g, 'menos $1').replace(/°c/gi, ' grados').replace(/°/g, ' grados');
      return s;
    }
    s = s.replace(/\bi\b/g, 'I').replace(/\bi'm\b/gi, "I'm").replace(/\bi'll\b/gi, "I'll");
    s = s.replace(/\bpip\b/g, 'Pip');
    // "press a" means the A button: say the letter, not the word "a"
    s = s.replace(/\b(press|hold|tap|green|the)\s+a\b/gi, (m, w) => w + ' A');
    s = s.replace(/-(\d)/g, 'minus $1').replace(/°c/gi, ' degrees').replace(/°/g, ' degrees');
    return s;
  }

  function finish(myToken, cb) {
    if (myToken !== token) return;
    CQ.voice.speaking = false;
    if (CQ.audio) CQ.audio.duck(false);
    if (cb) cb();
  }

  function speakTTS(text, myToken, cb) {
    if (!synth || !CQ.settings.voice) { finish(myToken, cb); return false; }
    const v = currentVoice();
    if (!v && lang() === 'es') { finish(myToken, cb); return false; }
    try {
      const u = new SpeechSynthesisUtterance(speechText(text));
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
      u.rate = 0.92;
      u.pitch = 1.12;
      u.volume = 1;
      u.onend = () => finish(myToken, cb);
      u.onerror = (e) => {
        if (e && e.error === 'not-allowed') CQ.voice.blocked = true;
        finish(myToken, cb);
      };
      CQ.voice.speaking = true;
      if (CQ.audio) CQ.audio.duck(true);
      // keep a reference (Chromium can garbage-collect an utterance before 'end' fires)
      CQ.voice._utterance = u;
      // Chromium can drop an utterance that starts right after cancel(), so wait a moment
      setTimeout(() => { if (myToken === token) synth.speak(u); }, 60);
      // safety net: some voices never fire onend
      const est = 2 + text.length * 0.09;
      setTimeout(() => finish(myToken, cb), est * 1000 + 4000);
      return true;
    } catch (e) {
      finish(myToken, cb);
      return false;
    }
  }

  function playRecording(id, text, myToken, cb) {
    const a = new Audio(recDir() + id + '.mp3');
    current = a;
    let started = false;
    a.addEventListener('ended', () => finish(myToken, cb));
    a.addEventListener('error', () => {
      if (myToken !== token) return;
      if (!started) speakTTS(text, myToken, cb); else finish(myToken, cb);
    });
    CQ.voice.speaking = true;
    if (CQ.audio) CQ.audio.duck(true);
    const p = a.play();
    if (p && p.then) p.then(() => { started = true; }).catch(() => { if (myToken === token && !started) speakTTS(text, myToken, cb); });
  }

  // Find out once (per language) whether any recorded voice files exist.
  function probe() {
    const l = lang();
    if (!CQ.settings.recordedVoice) { recordings[l] = false; return; }
    const a = new Audio();
    a.preload = 'metadata';
    a.addEventListener('loadedmetadata', () => { recordings[l] = true; });
    a.addEventListener('error', () => { recordings[l] = false; });
    a.src = recDir() + 'intro_1.mp3';
  }
  probe();

  CQ.voice = {
    speaking: false,
    blocked: false,
    // say a line by id from CQ.LINES
    say(id, cb) {
      const line = CQ.i18n.line(id);
      const text = line ? (line.say || line.t) : id;
      this.speak(text, cb, id);
    },
    speak(text, cb0, id) {
      this.stop();
      const myToken = ++token;
      let called = false;
      const cb = () => { if (!called) { called = true; if (cb0) cb0(); } };
      if (!CQ.settings.voice) { this.speaking = false; if (cb) setTimeout(() => finish(myToken, cb), 0); return; }
      if (id && recordings[lang()] && CQ.settings.recordedVoice) playRecording(id, text, myToken, cb);
      else speakTTS(text, myToken, cb);
    },
    stop() {
      token++;
      this.speaking = false;
      if (current) { try { current.pause(); } catch (e) { /* ignore */ } current = null; }
      if (synth) { try { synth.cancel(); } catch (e) { /* ignore */ } }
      if (CQ.audio) CQ.audio.duck(false);
    },
    voiceName() { const v = currentVoice(); return v ? v.name : '(none)'; },
    voices() { return voicesFor(lang()).map((v) => v.name); },
    setVoice(name) { CQ.settings[voiceSetting()] = name; refreshVoice(); },
    hasRecordings() { return !!recordings[lang()]; },
    // can Pip talk in the current language? (recordings or an installed voice)
    available() {
      if (recordings[lang()] && CQ.settings.recordedVoice) return true;
      return !!synth && (lang() !== 'es' || !!currentVoice());
    },
    reprobe() { recordings.en = recordings.es = null; probe(); },
    langChanged() {
      this.stop();
      refreshVoice();
      if (recordings[lang()] === null) probe();
    },
  };
})();
