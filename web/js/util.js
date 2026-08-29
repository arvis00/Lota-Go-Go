'use strict';
/* ---------------------------------------------------------------
   util.js — math, colour, drawing helpers, save-game, sound
----------------------------------------------------------------*/
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp  = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const inv = (v, a, b) => clamp((v - a) / (b - a || 1), 0, 1);
/* modulo that stays positive — picking a colour with a negative index
   used to hand `undefined` to shade() and kill the whole render loop */
const imod = (n, m) => ((n % m) + m) % m;

/* deterministic RNG so the track is identical every run */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seed) {
  const r = mulberry32(seed);
  r.range = (a, b) => a + r() * (b - a);
  r.int   = (a, b) => Math.floor(a + r() * (b - a + 1));
  r.pick  = arr => arr[Math.floor(r() * arr.length) % arr.length];
  r.chance = p => r() < p;
  return r;
}

/* ---------- colour ---------- */
function hex2rgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb2hex(r, g, b) {
  return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
/** amt > 0 lightens, amt < 0 darkens (-1..1) */
function shade(hex, amt) {
  const [r, g, b] = hex2rgb(hex);
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  return rgb2hex(lerp(r, t, p), lerp(g, t, p), lerp(b, t, p));
}
function mixHex(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return rgb2hex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
}
function rgba(hex, a) {
  const [r, g, b] = hex2rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/* ---------- canvas shapes ---------- */
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function fillRR(ctx, x, y, w, h, r, col) { rr(ctx, x, y, w, h, r); ctx.fillStyle = col; ctx.fill(); }
function ell(ctx, cx, cy, rx, ry, rot) {
  ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU);
}
function fillEll(ctx, cx, cy, rx, ry, col, rot) { ell(ctx, cx, cy, rx, ry, rot); ctx.fillStyle = col; ctx.fill(); }
function circle(ctx, cx, cy, r, col) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); }
function poly(ctx, pts, col) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath(); if (col) { ctx.fillStyle = col; ctx.fill(); }
}
function line(ctx, x1, y1, x2, y2, col, w, cap) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.lineCap = cap || 'round'; ctx.stroke();
}
/** cute cartoon outline used by nearly every prop */
function outline(ctx, col, w) { ctx.strokeStyle = col || 'rgba(20,12,30,.35)'; ctx.lineWidth = w || 2.5; ctx.stroke(); }

/* ---------- save game ---------- */
/* Four levels, four wallets. What Lota picks up on a level is spent on that
   level's home page and nowhere else — treats found on level 1 can never pay
   for a level-3 outfit, so each level has to be played for its own rewards. */
const SAVE_KEY = 'lotago.save.v3';
const OLD_SAVE_KEY = 'lotago.save.v2';
const Save = {
  data: {
    wallet: { 1: { b: 0, t: 0 }, 2: { b: 0, t: 0 }, 3: { b: 0, t: 0 }, 4: { b: 0, t: 0 } },
    cleared: { 1: 0, 2: 0, 3: 0, 4: 0 },
    keys: {},
    /* 'cp' or 'raw' per level — how she is playing it. Nothing is stored until
       the player has actually been asked, and being asked happens once. */
    mode: {},
    owned: ['classic'], skin: 'classic',
    best: {}, far: {},
    bestBones: 0, bestZone: 0, sound: 1
  },
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) Object.assign(this.data, JSON.parse(raw));
      else {
        const old = localStorage.getItem(OLD_SAVE_KEY);
        if (old) this.migrate(JSON.parse(old));
      }
    } catch (e) { /* private mode / disabled storage — play with defaults */ }
    this.repair();
    return this.data;
  },
  /** a v2 save only ever knew about level 1, so its purse lands in wallet 1 */
  migrate(o) {
    const d = this.data;
    d.wallet[1].b = o.bones || 0;
    d.cleared[1] = o.finished || 0;
    if (Array.isArray(o.owned) && o.owned.length) d.owned = o.owned.slice();
    if (o.skin) d.skin = o.skin;
    d.bestBones = o.bestBones || 0;
    d.bestZone = o.bestZone || 0;
    if (o.sound != null) d.sound = o.sound;
  },
  repair() {
    const d = this.data;
    if (!d.wallet || typeof d.wallet !== 'object') d.wallet = {};
    if (!d.cleared || typeof d.cleared !== 'object') d.cleared = {};
    for (let n = 1; n <= 4; n++) {
      const w = d.wallet[n];
      d.wallet[n] = { b: (w && +w.b) || 0, t: (w && +w.t) || 0 };
      d.cleared[n] = (+d.cleared[n]) || 0;
    }
    if (!d.keys || typeof d.keys !== 'object') d.keys = {};
    if (!d.mode || typeof d.mode !== 'object') d.mode = {};
    /* a record and a furthest-reached place, per level — the old single pair
       of them only ever knew about level 1, so that is where they land */
    if (!d.best || typeof d.best !== 'object') d.best = {};
    if (!d.far || typeof d.far !== 'object') d.far = {};
    if (!d.best[1] && d.bestBones) d.best[1] = d.bestBones;
    if (!d.far[1] && d.bestZone) d.far[1] = d.bestZone;
    if (!Array.isArray(d.owned) || !d.owned.length) d.owned = ['classic'];
    if (d.owned.indexOf('classic') < 0) d.owned.unshift('classic');
  },
  write() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) {}
  },
  purse(level) { return this.data.wallet[level] || { b: 0, t: 0 }; },
  /** How this level is being played: 'cp' with checkpoints, 'raw' without.
      null means the question has never been put, which is the one time the
      game asks it. Called with a value, it remembers the answer. */
  mode(level, v) {
    if (v == null) return this.data.mode[level] || null;
    this.data.mode[level] = v; this.write();
    return v;
  },
  /** kind is 'b' (treats) or 't' (toys) */
  earn(level, kind, n) {
    const w = this.purse(level);
    w[kind] = Math.max(0, (w[kind] || 0) + n);
    this.write();
  },
  spend(level, cost) {
    const w = this.purse(level);
    w.b = Math.max(0, w.b - (cost.b || 0));
    w.t = Math.max(0, w.t - (cost.t || 0));
    this.write();
  },
  canAfford(level, cost) {
    const w = this.purse(level);
    return w.b >= (cost.b || 0) && w.t >= (cost.t || 0);
  },
  /** best haul on a level; called with a number, it records a new one */
  best(level, n) {
    const d = this.data;
    if (n == null) return d.best[level] || 0;
    if (n > (d.best[level] || 0)) { d.best[level] = n; this.write(); }
    if (level === 1 && n > d.bestBones) d.bestBones = n;
    return d.best[level] || 0;
  },
  /** the furthest place she has reached on a level */
  far(level, name) {
    const d = this.data;
    if (name == null) return d.far[level] || 0;
    d.far[level] = name;
    if (level === 1) d.bestZone = name;
    this.write();
  },
  clears(level) { return this.data.cleared[level] || 0; },
  markCleared(level) { this.data.cleared[level] = this.clears(level) + 1; this.write(); },
  owns(id) { return this.data.owned.indexOf(id) >= 0; },
  give(id) { if (!this.owns(id)) { this.data.owned.push(id); this.write(); return true; } return false; }
};

/* ---------- sound (tiny WebAudio synth, no assets) ---------- */
const Sfx = {
  ac: null, master: null, on: true,
  init() {
    if (this.ac) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ac = new AC();
      this.master = this.ac.createGain();
      this.master.gain.value = 0.28;
      this.master.connect(this.ac.destination);
    } catch (e) { this.ac = null; }
  },
  resume() { if (this.ac && this.ac.state === 'suspended') this.ac.resume(); },
  tone(freq, dur, type, vol, slideTo, delay) {
    if (!this.on || !this.ac) return;
    const t0 = this.ac.currentTime + (delay || 0);
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol == null ? 0.5 : vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.03);
  },
  jump()  { this.tone(430, 0.16, 'triangle', 0.5, 760); },
  duck()  { this.tone(300, 0.11, 'sine', 0.32, 190); },
  land()  { this.tone(150, 0.07, 'sine', 0.25, 110); },
  bone()  { this.tone(880, 0.09, 'triangle', 0.45); this.tone(1320, 0.14, 'triangle', 0.38, null, 0.07); },
  warp()  { this.tone(300, 0.3, 'sawtooth', 0.22, 1200); },
  boing() { this.tone(240, 0.24, 'sine', 0.5, 900); this.tone(120, 0.18, 'triangle', 0.3, 420, 0.02); },
  crash() { this.tone(260, 0.32, 'square', 0.3, 70); this.tone(150, 0.4, 'triangle', 0.24, 60, 0.05); },
  zone()  { [523, 659, 784].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.3, null, i * 0.07)); },
  checkpoint() {
    [659, 880, 1174].forEach((f, i) => this.tone(f, 0.26, 'triangle', 0.42, null, i * 0.09));
    this.tone(440, 0.5, 'sine', 0.2, 880, 0.02);
  },
  win()   { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.32, 'triangle', 0.4, null, i * 0.12)); },
  click() { this.tone(600, 0.06, 'triangle', 0.3); },
  locked() { this.tone(200, 0.13, 'square', 0.26, 130); this.tone(150, 0.16, 'square', 0.2, 100, 0.08); },
  unlock() { [392, 523, 659, 880, 1046].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.42, null, i * 0.1)); },
  swipe()  { this.tone(520, 0.09, 'sine', 0.22, 760); },
  /* off the end of the pier and into the sea */
  splash() {
    this.tone(900, 0.22, 'sine', 0.3, 180);
    this.tone(260, 0.4, 'triangle', 0.26, 90, 0.03);
    this.tone(1600, 0.18, 'sawtooth', 0.1, 400, 0.01);
  },
  yip()    { this.tone(760, 0.08, 'triangle', 0.22, 1050); }
};
