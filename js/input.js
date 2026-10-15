// CRYO QUEST - input: Xbox controller (primary), keyboard and mouse/touch fallback.
//
// Buttons used by the game:
//   a     = A button / A key / Space / Enter / mouse click   (do things)
//   b     = B button / B key / Escape / Backspace            (back - rarely used)
//   lb,rb = shoulder buttons / Q,E / mouse wheel             (finale slice browsing)
//   start = Menu button
//   view  = View (back) button
// Movement = left stick / D-pad / arrow keys.
// (The A key means "A" like on the controller, because Pip says "press A".)
(function () {
  'use strict';
  const CQ = window.CQ;

  const KEYMAP = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    KeyA: 'a', Space: 'a', Enter: 'a', NumpadEnter: 'a',
    KeyB: 'b', Escape: 'b', Backspace: 'b',
    KeyQ: 'lb', PageUp: 'lb',
    KeyE: 'rb', PageDown: 'rb',
  };
  const BUTTONS = ['a', 'b', 'lb', 'rb', 'start', 'view', 'up', 'down', 'left', 'right', 'y', 'x'];

  const keyHeld = {};
  const padHeld = {};
  const now = {};        // held this frame (combined)
  const prev = {};       // held last frame
  const pulse = {};      // pressed via event this frame (so very quick taps are never lost)

  const input = CQ.input = {
    lastActivity: performance.now(),
    lastDevice: 'key',      // 'pad' | 'key' | 'mouse'
    padConnected: false,
    stick: { x: 0, y: 0 },  // combined analog direction, -1..1
    pointer: { x: CQ.W / 2, y: CQ.H / 2, down: false, pressed: false, released: false, moved: false, wheel: 0, active: false },
    gestureSeen: false,     // a real click/key happened (browsers need that for sound)
  };

  function activity(dev) {
    input.lastActivity = performance.now();
    if (dev) input.lastDevice = dev;
  }

  function firstGesture() {
    input.gestureSeen = true;
    if (CQ.audio) CQ.audio.unlock();
  }

  // ---------- keyboard ----------
  window.addEventListener('keydown', (e) => {
    const b = KEYMAP[e.code];
    firstGesture();
    activity('key');
    if (!b) return;
    if (!keyHeld[b]) pulse[b] = true;
    keyHeld[b] = true;
  });
  window.addEventListener('keyup', (e) => {
    const b = KEYMAP[e.code];
    if (b) keyHeld[b] = false;
  });
  window.addEventListener('blur', () => { for (const k in keyHeld) keyHeld[k] = false; });

  // ---------- mouse / touch ----------
  function toGame(clientX, clientY) {
    const v = CQ.view;
    return {
      x: CQ.clamp((clientX - v.left) / v.scale, 0, CQ.W - 1),
      y: CQ.clamp((clientY - v.top) / v.scale, 0, CQ.H - 1),
    };
  }
  window.addEventListener('pointermove', (e) => {
    const p = toGame(e.clientX, e.clientY);
    const P = input.pointer;
    if (Math.abs(p.x - P.x) + Math.abs(p.y - P.y) > 0.5) {
      P.x = p.x; P.y = p.y; P.moved = true; P.active = true;
      activity('mouse');
    }
  });
  window.addEventListener('pointerdown', (e) => {
    const p = toGame(e.clientX, e.clientY);
    const P = input.pointer;
    P.x = p.x; P.y = p.y;
    P.down = true; P.pressed = true; P.active = true;
    firstGesture();
    activity('mouse');
  });
  window.addEventListener('pointerup', () => {
    input.pointer.down = false;
    input.pointer.released = true;
  });
  window.addEventListener('wheel', (e) => {
    input.pointer.wheel += Math.sign(e.deltaY);
    activity('mouse');
  }, { passive: true });

  // ---------- gamepad ----------
  const DEAD = 0.28;
  function pollPad() {
    for (const k of BUTTONS) padHeld[k] = false;
    let sx = 0, sy = 0;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let pad = null;
    for (let i = 0; i < pads.length; i++) if (pads[i] && pads[i].connected) { pad = pads[i]; break; }
    input.padConnected = !!pad;
    if (!pad) return { x: 0, y: 0 };
    const btn = (i) => !!(pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > 0.5));
    padHeld.a = btn(0);
    padHeld.b = btn(1);
    padHeld.x = btn(2);
    padHeld.y = btn(3);
    padHeld.lb = btn(4) || btn(6);   // LB or LT
    padHeld.rb = btn(5) || btn(7);   // RB or RT
    padHeld.view = btn(8);
    padHeld.start = btn(9);
    padHeld.up = btn(12);
    padHeld.down = btn(13);
    padHeld.left = btn(14);
    padHeld.right = btn(15);
    const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
    if (Math.hypot(ax, ay) > DEAD) { sx = ax; sy = ay; }
    // right stick Y can also browse slices in the finale
    const ry = pad.axes[3] || 0;
    input.rightStickY = Math.abs(ry) > 0.4 ? ry : 0;
    let any = false;
    for (const k of BUTTONS) if (padHeld[k]) any = true;
    if (any || sx || sy || input.rightStickY) activity('pad');
    return { x: sx, y: sy };
  }

  input.update = function () {
    const s = pollPad();
    for (const k of BUTTONS) {
      now[k] = !!(keyHeld[k] || padHeld[k]);
    }
    // stick: analog first, then digital
    let x = s.x, y = s.y;
    if (now.left) x = -1; if (now.right) x = 1;
    if (now.up) y = -1; if (now.down) y = 1;
    if (now.left && now.right) x = 0;
    if (now.up && now.down) y = 0;
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    input.stick.x = x; input.stick.y = y;
    // treat stick pushes as digital directions too (for menus)
    if (s.x < -0.6) now.left = true;
    if (s.x > 0.6) now.right = true;
    if (s.y < -0.6) now.up = true;
    if (s.y > 0.6) now.down = true;
  };

  input.endFrame = function () {
    for (const k of BUTTONS) { prev[k] = now[k]; pulse[k] = false; }
    const P = input.pointer;
    P.pressed = false; P.released = false; P.moved = false; P.wheel = 0;
  };

  // Clear "pressed" states (used on scene change so one press doesn't count twice)
  input.flush = function () {
    for (const k of BUTTONS) { prev[k] = true; pulse[k] = false; }
    const P = input.pointer;
    P.pressed = false; P.released = false; P.wheel = 0;
  };

  input.held = (b) => !!now[b];
  input.pressed = (b) => !!pulse[b] || (!!now[b] && !prev[b]);
  input.released = (b) => !now[b] && !!prev[b];

  // "Do it!" - A button, Space/Enter, or a mouse click / tap anywhere
  input.act = () => input.pressed('a') || input.pointer.pressed;
  input.actHeld = () => input.held('a') || input.pointer.down;
  input.anyPressed = () => input.pressed('a') || input.pressed('b') || input.pressed('start') || input.pointer.pressed;

  // menu style navigation with key-repeat
  const rep = { dir: null, t: 0 };
  input.menuDir = function (dt) {
    let d = null;
    if (now.left) d = 'left'; else if (now.right) d = 'right'; else if (now.up) d = 'up'; else if (now.down) d = 'down';
    if (!d) { rep.dir = null; return null; }
    if (d !== rep.dir) { rep.dir = d; rep.t = 0.4; return d; }
    rep.t -= dt || 1 / 60;
    if (rep.t <= 0) { rep.t = 0.18; return d; }
    return null;
  };

  // hide the mouse cursor when kids use the controller
  setInterval(() => {
    const hide = input.lastDevice !== 'mouse' && performance.now() - input.lastActivity < 600000;
    document.body.classList.toggle('hide-cursor', hide);
  }, 500);
})();
