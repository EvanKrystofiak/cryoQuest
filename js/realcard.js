// CRYO QUEST - "THE REAL THING!" cards that show real images from the lab.
// Real photos are shown with an HTML <img>/<video> laid over the canvas so they stay full resolution.
// Pictures can be set once for everyone, or per sample (bacteria / yeast / worm) in assets/config.js.
(function () {
  'use strict';
  const CQ = window.CQ;
  const cfg = (window.CQ_CONFIG && window.CQ_CONFIG.real) || {};
  const KEYS = ['freeze', 'fib', 'krios', 'tomogram'];
  const ORGS = ['bacteria', 'yeast', 'worm'];

  const resolvePath = (p) => (!p ? '' : /[\\/]/.test(p) ? p : 'assets/data/' + p);

  // the settings for a card: the sample's own pictures win over the general ones
  function entry(key) {
    const org = CQ.game && CQ.game.organism;
    const own = org && cfg[org] && cfg[org][key];
    const hasOwn = own && (own.image || (own.slices && own.slices.length) || own.video);
    return hasOwn ? own : cfg[key] || {};
  }
  const slicesOf = (e) => (e.slices || []).map(resolvePath);

  // preload images so the cards pop up instantly
  const cache = {};
  function preload(src) {
    if (!src || cache[src]) return;
    const img = new Image();
    img.onload = () => { img.ok = true; };
    img.onerror = () => { img.ok = false; console.warn('Could not load real image:', src); };
    img.src = src;
    cache[src] = img;
  }
  function preloadEntry(e) {
    if (!e) return;
    if (e.image) preload(resolvePath(e.image));
    slicesOf(e).forEach(preload);
  }
  KEYS.forEach((k) => preloadEntry(cfg[k]));
  ORGS.forEach((o) => cfg[o] && KEYS.forEach((k) => preloadEntry(cfg[o][k])));

  // DOM overlay elements
  const imgEl = document.createElement('img');
  const vidEl = document.createElement('video');
  [imgEl, vidEl].forEach((el) => {
    el.style.cssText = 'position:absolute;display:none;object-fit:contain;pointer-events:none;background:#000;image-rendering:auto;';
    document.body.appendChild(el);
  });
  vidEl.muted = true; vidEl.loop = true; vidEl.playsInline = true;

  function place(el, x, y, w, h) {
    const v = CQ.view;
    el.style.left = Math.round(v.left + x * v.scale) + 'px';
    el.style.top = Math.round(v.top + y * v.scale) + 'px';
    el.style.width = Math.round(w * v.scale) + 'px';
    el.style.height = Math.round(h * v.scale) + 'px';
  }

  let slices = [];

  const R = CQ.realcard = {
    active: false,
    has(key) {
      const e = entry(key);
      if (key === 'tomogram') return slicesOf(e).length > 0 || !!e.video;
      if (!e.image) return false;
      const img = cache[resolvePath(e.image)];
      return !img || img.ok !== false;
    },
    // show(key, onDone): shows the card if an image is configured, otherwise calls onDone right away
    show(key, onDone) {
      if (!R.has(key)) { if (onDone) onDone(); return; }
      const e = entry(key);
      R.active = true;
      R.key = key;
      R.t = 0;
      R.onDone = onDone;
      const es = CQ.i18n.lang === 'es';
      R.caption = (es && (e.caption_es || (cfg[key] && cfg[key].caption_es))) || e.caption || (cfg[key] && cfg[key].caption) || 'THE REAL THING!';
      R.slice = 0;
      R.dir = 1;
      slices = [];
      if (key === 'tomogram' && e.video) {
        R.mode = 'video';
        vidEl.src = resolvePath(e.video);
        vidEl.currentTime = 0;
        const p = vidEl.play(); if (p && p.catch) p.catch(() => {});
      } else if (key === 'tomogram') {
        R.mode = 'slices';
        slices = slicesOf(e);
        imgEl.src = slices[0];
      } else {
        R.mode = 'image';
        imgEl.src = resolvePath(e.image);
      }
      CQ.audio.sfx('found');
      CQ.voice.say(key === 'tomogram' ? 'tm_real' : 'real_1');
    },
    close() {
      R.active = false;
      imgEl.style.display = 'none';
      vidEl.style.display = 'none';
      try { vidEl.pause(); } catch (e) { /* ignore */ }
    },
    update(dt) {
      if (!R.active) return;
      R.t += dt;
      if (R.mode === 'slices' && slices.length > 1) {
        // flip through slices automatically; stick up/down scrubs by hand
        const s = CQ.input.stick.y;
        if (Math.abs(s) > 0.3) R.slice += s * dt * 14;
        else R.slice += R.dir * dt * 10;
        if (R.slice >= slices.length - 1) { R.slice = slices.length - 1; R.dir = -1; }
        if (R.slice <= 0) { R.slice = 0; R.dir = 1; }
        const src = slices[Math.round(R.slice)];
        if (imgEl.getAttribute('src') !== src) imgEl.src = src;
      }
      const minTime = 1.5;
      const maxTime = R.key === 'tomogram' ? 16 : 9;
      if ((R.t > minTime && CQ.input.act()) || R.t > maxTime) {
        CQ.input.flush();
        const cb = R.onDone;
        R.close();
        if (cb) cb();
      }
    },
    draw(c) {
      if (!R.active) return;
      const g = CQ.gfx;
      c.fillStyle = 'rgba(0,0,0,0.8)';
      c.fillRect(0, 0, CQ.W, CQ.H);
      const pop = Math.min(1, R.t * 5);
      const w = Math.round(320 * (0.6 + 0.4 * CQ.ease.outBack(pop))), h = Math.round(196 * (0.6 + 0.4 * CQ.ease.outBack(pop)));
      const x = Math.round(CQ.W / 2 - w / 2), y = Math.round(CQ.H / 2 - h / 2);
      g.panel(c, x, y, w, h);
      g.text(c, 'THE REAL THING!', CQ.W / 2, y + 8, { color: 'gold', scale: 2, align: 'center', shadow: 'goldDD' });
      const px = x + 12, py = y + 28, pw = w - 24, ph = h - 56;
      g.rect(c, px - 1, py - 1, pw + 2, ph + 2, 'gold');
      g.rect(c, px, py, pw, ph, 'black');
      g.text(c, R.caption, CQ.W / 2, y + h - 22, { color: 'white', align: 'center' });
      if (R.mode === 'slices' && slices.length > 1) {
        g.text(c, 'SLICE ' + (Math.round(R.slice) + 1) + '/' + slices.length, x + w - 10, y + h - 12, { color: 'g2', align: 'right' });
      }
      if (R.t > 1.5) g.pressLine(c, 'NEXT', CQ.W / 2, y + h - 12, 'goldL');
      const el = R.mode === 'video' ? vidEl : imgEl;
      if (pop >= 1) { place(el, px, py, pw, ph); el.style.display = 'block'; } else el.style.display = 'none';
    },
  };
})();
