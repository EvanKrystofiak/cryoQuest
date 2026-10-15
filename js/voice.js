// CRYO QUEST - narration. Uses recorded voice files (voice/<LINE_ID>.mp3) when present,
// otherwise the computer's built-in text-to-speech voice.
(function () {
  'use strict';
  const CQ = window.CQ;
  const synth = window.speechSynthesis || null;

  let voice = null;
  let token = 0;
  let current = null;       // HTMLAudioElement when playing a recording
  let recordingsAvailable = null; // null = unknown, true/false after probing

  function pickVoice() {
    if (!synth) return null;
    const all = synth.getVoices() || [];
    if (!all.length) return null;
    const en = all.filter((v) => /^en(-|_|$)/i.test(v.lang));
    const pool = en.length ? en : all;
    if (CQ.settings.voiceName) {
      const v = pool.find((x) => x.name.toLowerCase().includes(CQ.settings.voiceName.toLowerCase()));
      if (v) return v;
    }
    const online = navigator.onLine;
    const prefer = [
      (v) => online && /natural/i.test(v.name) && /(ana|aria|jenny|emma|ava|michelle|libby|sonia)/i.test(v.name),
      (v) => online && /natural/i.test(v.name) && /en-us/i.test(v.lang),
      (v) => v.localService && /(zira|hazel|susan|jenny|aria|catherine|linda|heera)/i.test(v.name),
      (v) => v.localService && /en-us/i.test(v.lang),
      (v) => v.localService,
      () => true,
    ];
    for (const test of prefer) { const v = pool.find(test); if (v) return v; }
    return pool[0];
  }
  if (synth) {
    voice = pickVoice();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', () => { voice = pickVoice(); });
    else synth.onvoiceschanged = () => { voice = pickVoice(); };
  }

  // Display text is ALL CAPS; speech engines read caps words as letters, so convert to sentence case.
  function speechText(t) {
    let s = String(t).toLowerCase();
    s = s.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
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
    try {
      const u = new SpeechSynthesisUtterance(speechText(text));
      if (!voice) voice = pickVoice();
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-US';
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
    const a = new Audio('voice/' + id + '.mp3');
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

  // Find out once whether any recorded voice files exist.
  function probe() {
    if (!CQ.settings.recordedVoice) { recordingsAvailable = false; return; }
    const a = new Audio();
    a.preload = 'metadata';
    a.addEventListener('loadedmetadata', () => { recordingsAvailable = true; });
    a.addEventListener('error', () => { recordingsAvailable = false; });
    a.src = 'voice/intro_1.mp3';
  }
  probe();

  CQ.voice = {
    speaking: false,
    blocked: false,
    // say a line by id from CQ.LINES
    say(id, cb) {
      const line = CQ.LINES && CQ.LINES[id];
      const text = line ? (line.say || line.t) : id;
      this.speak(text, cb, id);
    },
    speak(text, cb0, id) {
      this.stop();
      const myToken = ++token;
      let called = false;
      const cb = () => { if (!called) { called = true; if (cb0) cb0(); } };
      if (!CQ.settings.voice) { this.speaking = false; if (cb) setTimeout(() => finish(myToken, cb), 0); return; }
      if (id && recordingsAvailable && CQ.settings.recordedVoice) playRecording(id, text, myToken, cb);
      else speakTTS(text, myToken, cb);
    },
    stop() {
      token++;
      this.speaking = false;
      if (current) { try { current.pause(); } catch (e) { /* ignore */ } current = null; }
      if (synth) { try { synth.cancel(); } catch (e) { /* ignore */ } }
      if (CQ.audio) CQ.audio.duck(false);
    },
    voiceName() { return voice ? voice.name : '(none)'; },
    voices() { return synth ? synth.getVoices().filter((v) => /^en/i.test(v.lang)).map((v) => v.name) : []; },
    setVoice(name) { CQ.settings.voiceName = name; voice = pickVoice(); },
    hasRecordings() { return !!recordingsAvailable; },
    reprobe: probe,
  };
})();
