'use strict';
/* ---------------------------------------------------------------
   util.js — math, colour, drawing helpers, save-game, sound
----------------------------------------------------------------*/
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp  = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const inv = (v, a, b) => clamp((v - a) / (b - a || 1), 0, 1);

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
const SAVE_KEY = 'lotago.save.v2';
const Save = {
  data: { bones: 0, owned: ['classic'], skin: 'classic', bestBones: 0, bestZone: 0, finished: 0, sound: 1 },
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) Object.assign(this.data, JSON.parse(raw));
      if (!Array.isArray(this.data.owned) || !this.data.owned.length) this.data.owned = ['classic'];
    } catch (e) { /* private mode / disabled storage — play with defaults */ }
    return this.data;
  },
  write() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) {}
  },
  addBones(n) { this.data.bones = Math.max(0, this.data.bones + n); this.write(); },
  owns(id) { return this.data.owned.indexOf(id) >= 0; }
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
  crash() { this.tone(260, 0.32, 'square', 0.3, 70); this.tone(150, 0.4, 'triangle', 0.24, 60, 0.05); },
  zone()  { [523, 659, 784].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.3, null, i * 0.07)); },
  checkpoint() {
    [659, 880, 1174].forEach((f, i) => this.tone(f, 0.26, 'triangle', 0.42, null, i * 0.09));
    this.tone(440, 0.5, 'sine', 0.2, 880, 0.02);
  },
  win()   { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.32, 'triangle', 0.4, null, i * 0.12)); },
  click() { this.tone(600, 0.06, 'triangle', 0.3); }
};
