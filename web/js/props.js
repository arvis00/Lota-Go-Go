'use strict';
/* ---------------------------------------------------------------
   props.js — every obstacle / platform / decoration drawing.
   Each drawer receives SCREEN coords: (ctx, x, y, w, h, t, pal)
   where (x,y) is the top-left of the object's box, y grows down.
----------------------------------------------------------------*/
const INK = 'rgba(24,16,34,.42)';

function boxy(ctx, x, y, w, h, r, top, side, edge) {
  fillRR(ctx, x, y, w, h, r); ctx.fillStyle = side; ctx.fill();
  ctx.strokeStyle = edge || INK; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
  fillRR(ctx, x, y, w, Math.min(9, h * 0.3), 3, top);
  ctx.restore();
}
function slats(ctx, x, y, w, h, n, col, vertical) {
  ctx.save(); ctx.globalAlpha = 0.35;
  for (let i = 1; i < n; i++) {
    if (vertical) line(ctx, x + (w * i) / n, y + 3, x + (w * i) / n, y + h - 3, col, 2);
    else line(ctx, x + 3, y + (h * i) / n, x + w - 3, y + (h * i) / n, col, 2);
  }
  ctx.restore();
}
function leafy(ctx, cx, cy, rx, ry, col, col2, seed) {
  const r = makeRng(seed | 0 || 7);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + r() * 0.4;
    fillEll(ctx, cx + Math.cos(a) * rx * 0.55, cy + Math.sin(a) * ry * 0.55,
      rx * (0.42 + r() * 0.2), ry * (0.42 + r() * 0.2), i % 3 === 0 ? col2 : col);
  }
  fillEll(ctx, cx, cy, rx * 0.62, ry * 0.62, col);
}
function wheel(ctx, cx, cy, r, col, hub) {
  circle(ctx, cx, cy, r, col); circle(ctx, cx, cy, r * 0.42, hub || '#c9c9d4');
}

const PROPS = {
  /* fallback */
  _default(ctx, x, y, w, h) { boxy(ctx, x, y, w, h, 6, '#c08b52', '#a06f3d'); },

  /* ==================== HOUSE ==================== */
  toybox(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 7, '#ffd15c', '#f0a93a');
    fillRR(ctx, x + 4, y + h * 0.42, w - 8, 6, 3, '#e0932c');
    circle(ctx, x + w * 0.3, y + h * 0.68, 5, '#ff7b8a');
    circle(ctx, x + w * 0.62, y + h * 0.7, 4, '#6fc9ff');
  },
  books(ctx, x, y, w, h) {
    const cols = ['#e2584f', '#4f8ce2', '#f0b23a', '#68c77e', '#b884e8'];
    let yy = y + h, i = 0;
    while (yy > y + 2) {
      const bh = Math.min(11, yy - y), off = (i % 2) * 4;
      fillRR(ctx, x + off, yy - bh, w - off - (i % 3), bh - 1.5, 2.5, cols[i % 5]);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
      yy -= bh; i++;
    }
  },
  chair(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.05, y, w * 0.24, h, 4, '#c78b4e');
    fillRR(ctx, x, y + h * 0.42, w, 9, 4, '#e0a35f');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    line(ctx, x + w * 0.2, y + h * 0.5, x + w * 0.2, y + h, '#b57b42', 5);
    line(ctx, x + w * 0.82, y + h * 0.5, x + w * 0.82, y + h, '#b57b42', 5);
  },
  basket(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x + 3, y); ctx.lineTo(x + w - 3, y);
    ctx.lineTo(x + w - 8, y + h); ctx.lineTo(x + 8, y + h); ctx.closePath();
    ctx.fillStyle = '#d7a76a'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    slats(ctx, x + 6, y + 4, w - 12, h - 8, 4, '#a8783f');
    fillEll(ctx, x + w / 2, y + 2, w * 0.34, 5, '#f2e2c6');
  },
  laundry(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * 0.3, w, h * 0.7, 8, '#d8dbe6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ['#ff9bb5', '#8fd6ff', '#ffe08a'].forEach((c, i) =>
      fillEll(ctx, x + w * (0.28 + i * 0.22), y + h * 0.26, 11, 8, c));
  },
  plantH(ctx, x, y, w, h) {
    leafy(ctx, x + w / 2, y + h * 0.3, w * 0.55, h * 0.36, '#4caf6d', '#75d493', 3);
    ctx.beginPath(); ctx.moveTo(x + w * 0.22, y + h * 0.55); ctx.lineTo(x + w * 0.78, y + h * 0.55);
    ctx.lineTo(x + w * 0.68, y + h); ctx.lineTo(x + w * 0.32, y + h); ctx.closePath();
    ctx.fillStyle = '#d2764a'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
  },
  table(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h - 12, w, 12, 4, '#b9793f');
    fillRR(ctx, x, y, 10, h - 8, 3, '#a86a35');
    fillRR(ctx, x + w - 10, y, 10, h - 8, 3, '#a86a35');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + 4, y + h - 11, w - 8, 3, 2, '#e0a35f'); ctx.restore();
  },
  sofa(ctx, x, y, w, h) {
    fillRR(ctx, x, y + 4, w, h, 12, '#6f8fd6'); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    fillRR(ctx, x + 4, y, w - 8, 16, 8, '#87a4e4');
    fillRR(ctx, x + 8, y + 2, w * 0.4, 11, 6, '#a6bdf0');
    fillRR(ctx, x + w * 0.55, y + 2, w * 0.38, 11, 6, '#a6bdf0');
  },
  bed(ctx, x, y, w, h) {
    fillRR(ctx, x, y + 6, w, h - 6, 8, '#8a6a4e');
    fillRR(ctx, x + 2, y, w - 4, 18, 8, '#f2d7dd'); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + 6, y + 1, w * 0.3, 12, 6, '#fff6f8');
    fillRR(ctx, x + w * 0.42, y + 4, w * 0.55, 12, 5, '#e58fa6');
  },
  dresser(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 6, '#d1a06a', '#b5824c');
    for (let i = 0; i < 3; i++) {
      fillRR(ctx, x + 6, y + 8 + i * ((h - 12) / 3), w - 12, (h - 16) / 3, 4, '#c08f5a');
      circle(ctx, x + w / 2, y + 8 + i * ((h - 12) / 3) + (h - 16) / 6, 3, '#7c5730');
    }
  },
  vent(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 5, '#9aa3b5'); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); rr(ctx, x + 3, y + 3, w - 6, h - 6, 4); ctx.clip();
    ctx.fillStyle = '#4e576b'; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = .6;
    for (let i = 0; i < w; i += 14) fillRR(ctx, x + i + 3, y + 4, 8, h - 8, 3, '#87909f');
    ctx.restore();
  },
  stairsH(ctx, x, y, w, h) {
    const n = 4;
    for (let i = 0; i < n; i++) {
      const sw = w / n, sh = h * ((i + 1) / n);
      boxy(ctx, x + i * sw, y + h - sh, sw + 2, sh, 3, '#d8b483', '#b98f5c');
    }
  },
  rugDeco(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 6, '#c2607a');
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x + 8, y + 3, w - 16, h - 6, 4, '#e08fa4'); ctx.restore();
  },

  /* ==================== YARD / PARK ==================== */
  rock(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.quadraticCurveTo(x + w * 0.05, y + h * 0.2, x + w * 0.42, y);
    ctx.quadraticCurveTo(x + w * 0.85, y + h * 0.1, x + w, y + h); ctx.closePath();
    ctx.fillStyle = '#8e93a3'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + h); ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.3, x + w * 0.5, y + h * 0.08);
    ctx.lineTo(x + w * 0.62, y + h * 0.3); ctx.lineTo(x + w * 0.44, y + h); ctx.closePath();
    ctx.fillStyle = '#b9bfcd'; ctx.fill(); ctx.restore();
  },
  bushY(ctx, x, y, w, h) {
    leafy(ctx, x + w / 2, y + h * 0.5, w * 0.55, h * 0.55, '#3f9c5c', '#5cc47c', 11);
    ctx.save(); ctx.globalAlpha = .8;
    circle(ctx, x + w * 0.3, y + h * 0.4, 3, '#ff8fa8'); circle(ctx, x + w * 0.7, y + h * 0.6, 3, '#ffe07a');
    ctx.restore();
  },
  logpile(ctx, x, y, w, h) {
    const r = Math.min(h / 2.2, w / 3.4);
    for (let i = 0; i < 3; i++) circle(ctx, x + r + i * r * 1.9, y + h - r, r, '#9a6b3e');
    for (let i = 0; i < 2; i++) circle(ctx, x + r * 1.9 + i * r * 1.9, y + h - r * 2.7, r, '#a87a4a');
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 3; i++) circle(ctx, x + r + i * r * 1.9, y + h - r, r * 0.5, '#c99a63');
    ctx.restore();
  },
  bucket(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.lineTo(x + w - 2, y);
    ctx.lineTo(x + w - 7, y + h); ctx.lineTo(x + 7, y + h); ctx.closePath();
    ctx.fillStyle = '#6fc9d6'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w / 2, y + 2, w * 0.4, Math.PI, 0);
    ctx.strokeStyle = '#4a5566'; ctx.lineWidth = 2.4; ctx.stroke();
  },
  wheelbarrow(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x + 4, y); ctx.lineTo(x + w - 6, y);
    ctx.lineTo(x + w - 20, y + h * 0.65); ctx.lineTo(x + 12, y + h * 0.65); ctx.closePath();
    ctx.fillStyle = '#d6564e'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    line(ctx, x + w - 8, y + 4, x + w * 0.42, y + h * 0.8, '#7c6a58', 4);
    wheel(ctx, x + w * 0.35, y + h - 8, 8, '#43404c');
  },
  fenceY(ctx, x, y, w, h) {
    for (let i = 0; i < 4; i++) {
      const px = x + 3 + i * ((w - 8) / 4);
      ctx.beginPath(); ctx.moveTo(px, y + 6); ctx.lineTo(px + 5, y); ctx.lineTo(px + 10, y + 6);
      ctx.lineTo(px + 10, y + h); ctx.lineTo(px, y + h); ctx.closePath();
      ctx.fillStyle = '#f2ead9'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    }
    fillRR(ctx, x, y + h * 0.42, w, 6, 3, '#e0d5bd');
  },
  branchY(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x, y + 6);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.4, x + w, y + 10);
    ctx.strokeStyle = '#6d4a2c'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();
    for (let i = 1; i < 5; i++) leafy(ctx, x + (w * i) / 5, y + h * 0.42 + 6, 15, 12, '#3f9c5c', '#63c47e', i * 3);
  },
  benchY(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 10, 4, '#c08b52'); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    fillRR(ctx, x + 2, y + 13, w - 4, 7, 3, '#b07a44');
    line(ctx, x + 10, y + 8, x + 10, y + h, '#5d6470', 5);
    line(ctx, x + w - 10, y + 8, x + w - 10, y + h, '#5d6470', 5);
  },
  hedge(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 12, '#357f4d');
    ctx.save(); rr(ctx, x, y, w, h, 12); ctx.clip();
    for (let i = 0; i < w; i += 18) leafy(ctx, x + i + 9, y + 8, 13, 10, '#3f9c5c', '#5cc47c', i);
    ctx.restore();
  },
  treeLedge(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x + w * 0.1, y + 8);
    ctx.quadraticCurveTo(x + w * 0.5, y + 2, x + w, y + 7);
    ctx.strokeStyle = '#6d4a2c'; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#8a6440'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x + w * 0.12, y + 6); ctx.quadraticCurveTo(x + w * 0.5, y + 1, x + w * 0.95, y + 5); ctx.stroke();
    for (let i = 0; i < 5; i++) leafy(ctx, x + 12 + (w - 24) * (i / 4), y + 22, 18, 13, '#2f8a4a', '#54b86c', i * 7);
  },
  roots(ctx, x, y, w, h) {
    ctx.strokeStyle = '#6d4a2c'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(x + i * (w / 3), y + h);
      ctx.quadraticCurveTo(x + i * (w / 3) + w * 0.18, y + h * 0.1, x + i * (w / 3) + w * 0.34, y + h);
      ctx.stroke();
    }
  },
  stump(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 6, '#c69a63', '#8a6440');
    fillEll(ctx, x + w / 2, y + 5, w * 0.46, 6, '#d8b17a');
    ctx.save(); ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.arc(x + w / 2, y + 5, w * 0.26, 0, TAU); ctx.strokeStyle = '#a8794a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  },
  pond(ctx, x, y, w, h, t) {
    ctx.fillStyle = '#2f6ea8'; ctx.fillRect(x, y + 16, w, h + 60);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y + 16, w, h + 60); ctx.clip();
    ctx.globalAlpha = .5;
    for (let i = 0; i < 5; i++) {
      const yy = y + 26 + i * 13 + Math.sin(t * 2 + i) * 2.5;
      line(ctx, x + 8, yy, x + w - 8, yy, '#9fd6ff', 3);
    }
    ctx.globalAlpha = .8;
    fillEll(ctx, x + w * 0.3, y + 22, 15, 6, '#4caf6d');
    fillEll(ctx, x + w * 0.68, y + 30, 12, 5, '#3f9c5c');
    ctx.restore();
  },
  puddle(ctx, x, y, w, h, t) { PROPS.pond(ctx, x, y, w, h, t); },
  flowers(ctx, x, y, w, h) {
    for (let i = 0; i < 5; i++) {
      const px = x + 5 + i * ((w - 10) / 4);
      line(ctx, px, y + h, px, y + h * 0.42, '#4caf6d', 2);
      circle(ctx, px, y + h * 0.34, 3.4, ['#ff8fa8', '#ffe07a', '#b48bff', '#fff', '#ffb0d0'][i % 5]);
      circle(ctx, px, y + h * 0.34, 1.3, '#ffd35e');
    }
  },

  /* ==================== STREET / CITY ==================== */
  cone(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w - 4, y + h - 6); ctx.lineTo(x + 4, y + h - 6); ctx.closePath();
    ctx.fillStyle = '#f2762c'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x + w * 0.22, y + h * 0.42, w * 0.56, 7, 2, '#fff');
    fillRR(ctx, x, y + h - 7, w, 7, 3, '#e0631f');
  },
  barrier(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 16, 4, '#f4f0e6'); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); rr(ctx, x, y, w, 16, 4); ctx.clip();
    ctx.fillStyle = '#e2453c';
    for (let i = -1; i < w / 14 + 1; i++) { ctx.save(); ctx.translate(x + i * 14, y); ctx.transform(1, 0, -0.6, 1, 0, 0); ctx.fillRect(0, 0, 7, 16); ctx.restore(); }
    ctx.restore();
    line(ctx, x + 10, y + 14, x + 10, y + h, '#8d94a3', 5);
    line(ctx, x + w - 10, y + 14, x + w - 10, y + h, '#8d94a3', 5);
  },
  bin(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x + 3, y + 6); ctx.lineTo(x + w - 3, y + 6);
    ctx.lineTo(x + w - 7, y + h); ctx.lineTo(x + 7, y + h); ctx.closePath();
    ctx.fillStyle = '#4a9d6e'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x, y, w, 8, 4, '#3d8a5e');
    slats(ctx, x + 6, y + 12, w - 12, h - 16, 3, '#2f6d4a', true);
  },
  crate(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 4, '#d8ad72', '#b98a50');
    ctx.save(); ctx.globalAlpha = .5;
    line(ctx, x + 4, y + 4, x + w - 4, y + h - 4, '#8a6135', 3);
    line(ctx, x + w - 4, y + 4, x + 4, y + h - 4, '#8a6135', 3);
    ctx.restore();
  },
  signFallen(ctx, x, y, w, h) {
    line(ctx, x + 6, y + h, x + w - 10, y + 8, '#9aa3b5', 6);
    ctx.save(); ctx.translate(x + w - 14, y + 12); ctx.rotate(-0.5);
    circle(ctx, 0, 0, 15, '#e2453c'); circle(ctx, 0, 0, 11, '#f4f0e6');
    fillRR(ctx, -8, -3, 16, 6, 2, '#e2453c'); ctx.restore();
  },
  hydrant(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.2, y + 6, w * 0.6, h - 6, 6, '#e2453c'); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x + w * 0.1, y + h * 0.35, w * 0.8, 8, 3, '#c9382f');
    circle(ctx, x + w / 2, y + 6, w * 0.24, '#f26a60');
  },
  car(ctx, x, y, w, h, t, pal) {
    const c = (pal && pal.car) || '#e2453c';
    fillRR(ctx, x + w * 0.16, y, w * 0.62, h * 0.5, 10, shade(c, .12));
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x, y + h * 0.34, w, h * 0.48, 12, c); ctx.strokeStyle = INK; ctx.stroke();
    fillRR(ctx, x + w * 0.2, y + 5, w * 0.24, h * 0.32, 5, '#a9dcf0');
    fillRR(ctx, x + w * 0.48, y + 5, w * 0.26, h * 0.32, 5, '#a9dcf0');
    wheel(ctx, x + w * 0.24, y + h * 0.84, h * 0.18, '#2c2a33');
    wheel(ctx, x + w * 0.76, y + h * 0.84, h * 0.18, '#2c2a33');
    circle(ctx, x + w - 5, y + h * 0.5, 4, '#ffe07a');
  },
  awning(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 6, y + 16); ctx.lineTo(x + 6, y + 16); ctx.closePath();
    ctx.fillStyle = '#e2453c'; ctx.fill();
    ctx.clip(); ctx.fillStyle = '#f4f0e6';
    for (let i = 0; i < w; i += 26) ctx.fillRect(x + i, y, 13, 20);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    for (let i = 0; i <= w; i += 26) circle(ctx, x + 6 + i * 0.94, y + 17, 4, '#d8dbe6');
  },
  scaffold(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 14, 3, '#c9a24a');
    for (let i = 0; i < w; i += 60) line(ctx, x + i + 20, y + 12, x + i + 20, y + h, '#9aa3b5', 5);
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i < w; i += 22) line(ctx, x + i, y + 14, x + i + 16, y + 30, '#8d94a3', 2.5);
    ctx.restore();
  },
  pipeS(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 18, 8, '#8d94a3'); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    for (let i = 0; i < w; i += 40) fillRR(ctx, x + i + 8, y - 2, 8, 22, 3, '#6f7686');
  },
  /* ---- gap bottoms: drawn inside an opening in the floor ---- */
  manhole(ctx, x, y, w, h) {
    fillRR(ctx, x - 10, y - 5, 20, 9, 4, '#5d6470');
    fillRR(ctx, x + w - 10, y - 5, 20, 9, 4, '#5d6470');
    ctx.save(); ctx.translate(x + w * 0.5, y + 26); ctx.rotate(-0.4);
    fillEll(ctx, 0, 0, 26, 9, '#3c414f');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 3; i++) line(ctx, x + 10, y + 40 + i * 12, x + w - 10, y + 40 + i * 12, '#2a2f3c', 3);
    ctx.restore();
  },
  hatch(ctx, x, y, w, h) {
    fillRR(ctx, x - 8, y - 6, 18, 12, 4, '#b98f5c');
    fillRR(ctx, x + w - 10, y - 6, 18, 12, 4, '#b98f5c');
    for (let i = 0; i < 3; i++) fillRR(ctx, x + 8 + i * 10, y + 18 + i * 18, w - 20 - i * 18, 11, 3, '#8a6440');
    ctx.save(); ctx.globalAlpha = .35;
    fillRR(ctx, x + 4, y + 4, w - 8, 16, 4, '#000'); ctx.restore();
  },
  gapMetal(ctx, x, y, w, h) {
    fillRR(ctx, x - 8, y - 5, 18, 10, 4, '#9aa3b5');
    fillRR(ctx, x + w - 10, y - 5, 18, 10, 4, '#9aa3b5');
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i < w; i += 16) line(ctx, x + i, y + 16, x + i + 9, y + 44, '#4a5160', 3);
    ctx.restore();
  },

  /* ==================== MALL ==================== */
  cart(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x + 6, y); ctx.lineTo(x + w - 2, y);
    ctx.lineTo(x + w - 10, y + h * 0.62); ctx.lineTo(x + 12, y + h * 0.62); ctx.closePath();
    ctx.fillStyle = 'rgba(200,208,222,.9)'; ctx.fill(); ctx.strokeStyle = '#6f7686'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 1; i < 4; i++) line(ctx, x + 8 + i * (w / 5), y + 2, x + 12 + i * (w / 5), y + h * 0.6, '#6f7686', 2);
    line(ctx, x + 8, y + h * 0.3, x + w - 6, y + h * 0.3, '#6f7686', 2); ctx.restore();
    wheel(ctx, x + 16, y + h - 6, 6, '#43404c'); wheel(ctx, x + w - 14, y + h - 6, 6, '#43404c');
    fillRR(ctx, x + 14, y - 8, 16, 10, 3, '#ff8fa8'); fillRR(ctx, x + 32, y - 6, 14, 8, 3, '#8fd6ff');
  },
  goods(ctx, x, y, w, h) {
    const cols = ['#ff8fa8', '#8fd6ff', '#ffe07a', '#a6e88f'];
    for (let i = 0; i < 6; i++) {
      const bx = x + (i % 3) * (w / 3), by = y + Math.floor(i / 3) * (h / 2);
      fillRR(ctx, bx + 3, by + 3, w / 3 - 6, h / 2 - 6, 3, cols[i % 4]);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
    }
  },
  wetsign(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w - 3, y + h); ctx.lineTo(x + 3, y + h); ctx.closePath();
    ctx.fillStyle = '#f6c93a'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.fillStyle = '#3a2f10'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!', x + w / 2, y + h * 0.78);
  },
  shelfM(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 11, 3, '#c9ced9'); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    const cols = ['#ff8fa8', '#8fd6ff', '#ffe07a', '#a6e88f', '#c9a6ff'];
    for (let i = 0; i < w; i += 22) fillRR(ctx, x + i + 5, y + 12, 14, 16, 3, cols[(i / 22) % 5 | 0]);
    fillRR(ctx, x + 4, y + 30, w - 8, 8, 3, '#b3b9c6');
    line(ctx, x + 12, y + 36, x + 12, y + h, '#9aa3b5', 5);
    line(ctx, x + w - 12, y + 36, x + w - 12, y + h, '#9aa3b5', 5);
  },
  railM(ctx, x, y, w, h) {
    fillRR(ctx, x, y + 6, w, 9, 5, '#c9ced9'); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    for (let i = 0; i < w; i += 46) {
      line(ctx, x + i + 20, y, x + i + 20, y + 8, '#9aa3b5', 4);
      fillRR(ctx, x + i + 8, y + 15, 26, 20, 4, ['#ff8fa8', '#8fd6ff', '#ffe07a'][(i / 46) % 3 | 0]);
    }
  },
  escalator(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.closePath();
    ctx.fillStyle = '#aab2c0'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); poly(ctx, [[x, y + h], [x + w, y], [x + w, y + h]]); ctx.clip();
    ctx.globalAlpha = .5; ctx.strokeStyle = '#7c8493'; ctx.lineWidth = 2;
    for (let i = 0; i < w; i += 14) { ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + 10, y + h - 20); ctx.stroke(); }
    ctx.restore();
  },
  plantM(ctx, x, y, w, h) {
    leafy(ctx, x + w / 2, y + h * 0.32, w * 0.5, h * 0.34, '#3f9c5c', '#63c47e', 21);
    fillRR(ctx, x + w * 0.24, y + h * 0.55, w * 0.52, h * 0.45, 6, '#c9ced9');
  },

  /* ==================== BUS / PLANE / AIRPORT ==================== */
  seatB(ctx, x, y, w, h, t, pal) {
    const c = (pal && pal.seat) || '#3f6fb5';
    fillRR(ctx, x, y + h * 0.36, w, h * 0.64, 6, shade(c, -.15));
    fillRR(ctx, x + w * 0.06, y, w * 0.34, h * 0.5, 7, c); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 3; i++) circle(ctx, x + w * (0.13 + i * 0.1), y + h * (0.16 + i * 0.1), 3, '#fff');
    ctx.restore();
  },
  handrail(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 8, 4, '#d8b64a'); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 0; i < w; i += 42) {
      line(ctx, x + i + 18, y + 6, x + i + 18, y + 22, '#b39440', 3);
      ctx.beginPath(); ctx.arc(x + i + 18, y + 28, 7, 0, TAU); ctx.strokeStyle = '#c9c9d4'; ctx.lineWidth = 3.5; ctx.stroke();
    }
  },
  bagB(ctx, x, y, w, h) {
    fillRR(ctx, x, y + 5, w, h - 5, 7, '#b5734e'); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w / 2, y + 6, w * 0.28, Math.PI, 0); ctx.strokeStyle = '#7c5232'; ctx.lineWidth = 3.5; ctx.stroke();
    fillRR(ctx, x + 4, y + h * 0.45, w - 8, 5, 2, '#8f5a3a');
  },
  suitcase(ctx, x, y, w, h, t, pal) {
    const cols = ['#e2453c', '#3f8fd6', '#4a9d6e', '#f0a93a', '#a86fd6'];
    const c = cols[(x | 0) % 5];
    fillRR(ctx, x, y + 6, w, h - 6, 7, c); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + w * 0.3, y, w * 0.4, 8, 3, '#5d6470');
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 1; i < 4; i++) line(ctx, x + (w * i) / 4, y + 10, x + (w * i) / 4, y + h - 4, '#000', 2);
    ctx.restore();
    fillRR(ctx, x + 4, y + h * 0.35, w - 8, 6, 2, shade(c, .25));
  },
  trolley(ctx, x, y, w, h) {
    fillRR(ctx, x + 4, y + h * 0.35, w - 8, 8, 3, '#c9ced9');
    fillRR(ctx, x + 8, y + h * 0.05, w - 24, h * 0.32, 5, '#8fa8d6');
    line(ctx, x + w - 8, y, x + w - 8, y + h * 0.6, '#9aa3b5', 4);
    line(ctx, x + 8, y + h * 0.45, x + 8, y + h - 8, '#9aa3b5', 4);
    line(ctx, x + w - 14, y + h * 0.45, x + w - 14, y + h - 8, '#9aa3b5', 4);
    wheel(ctx, x + 8, y + h - 6, 6, '#43404c'); wheel(ctx, x + w - 14, y + h - 6, 6, '#43404c');
  },
  ropes(ctx, x, y, w, h) {
    for (let i = 0; i <= 1; i++) {
      const px = x + 6 + i * (w - 14);
      fillRR(ctx, px - 5, y + h * 0.2, 11, h * 0.8, 4, '#5d6470');
      fillEll(ctx, px, y + h, 12, 5, '#43404c');
    }
    ctx.beginPath(); ctx.moveTo(x + 6, y + h * 0.3);
    ctx.quadraticCurveTo(x + w / 2, y + h * 0.62, x + w - 8, y + h * 0.3);
    ctx.strokeStyle = '#d64a72'; ctx.lineWidth = 5; ctx.stroke();
  },
  screenA(ctx, x, y, w, h, t) {
    fillRR(ctx, x, y, w, h - 6, 6, '#1e2436'); ctx.strokeStyle = '#5d6470'; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); rr(ctx, x + 4, y + 4, w - 8, h - 14, 4); ctx.clip();
    ctx.fillStyle = '#0f1626'; ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 5; i++) {
      const yy = y + 10 + i * 11;
      ctx.globalAlpha = ((t * 1.5 + i) % 3 < 0.4) ? 0.3 : 0.85;
      fillRR(ctx, x + 8, yy, w * 0.42, 5, 2, '#6fe0a8');
      fillRR(ctx, x + w * 0.55, yy, w * 0.3, 5, 2, '#f0d05c');
    }
    ctx.restore();
    fillRR(ctx, x + w * 0.42, y + h - 8, w * 0.16, 10, 3, '#5d6470');
  },
  beltA(ctx, x, y, w, h, t) {
    fillRR(ctx, x, y, w, 14, 6, '#3c414f'); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); rr(ctx, x, y, w, 14, 6); ctx.clip(); ctx.globalAlpha = .5;
    for (let i = -1; i < w / 18 + 1; i++) line(ctx, x + ((i * 18 + t * 60) % (w + 20)) - 10, y, x + ((i * 18 + t * 60) % (w + 20)) - 2, y + 14, '#7c8493', 3);
    ctx.restore();
    fillRR(ctx, x + 2, y + 14, w - 4, h - 14, 4, '#5d6470');
  },
  chairsA(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 10, 4, '#4a5566'); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    for (let i = 0; i < 3; i++) fillRR(ctx, x + 6 + i * ((w - 12) / 3), y - 16, (w - 20) / 3, 18, 5, '#3f8fd6');
    line(ctx, x + 14, y + 8, x + 14, y + h, '#8d94a3', 5);
    line(ctx, x + w - 14, y + 8, x + w - 14, y + h, '#8d94a3', 5);
  },
  scannerA(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 8, '#c9ced9'); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + 6, y + 6, w - 12, h - 12, 5, '#8d94a3');
    ctx.save(); ctx.globalAlpha = .7;
    fillRR(ctx, x + w * 0.3, y + 4, w * 0.4, 5, 2, '#6fe0a8'); ctx.restore();
  },
  cartP(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 5, '#dfe4ec', '#c1c8d4');
    for (let i = 1; i < 3; i++) line(ctx, x + 3, y + (h * i) / 3, x + w - 3, y + (h * i) / 3, '#9aa3b5', 2.5);
    wheel(ctx, x + 10, y + h - 5, 5, '#43404c'); wheel(ctx, x + w - 10, y + h - 5, 5, '#43404c');
    fillRR(ctx, x + 5, y + 4, w - 10, 6, 2, '#8fd6ff');
  },
  binP(ctx, x, y, w, h) {
    fillRR(ctx, x, y - 6, w, h + 6, 10, '#e4e8ef'); ctx.strokeStyle = '#a9b1c0'; ctx.lineWidth = 2.6; ctx.stroke();
    for (let i = 0; i < w; i += 70) {
      fillRR(ctx, x + i + 6, y + h - 14, 56, 10, 4, '#cfd6e2');
      circle(ctx, x + i + 34, y + h - 9, 3, '#8d94a3');
    }
  },
  seatP(ctx, x, y, w, h, t, pal) {
    for (let i = 0; i < 2; i++) {
      const sx = x + i * (w / 2);
      fillRR(ctx, sx + 2, y, w / 2 - 6, 12, 4, '#4a6fa5');
      fillRR(ctx, sx + 4, y - 22, w / 2 - 12, 24, 6, '#3f5f92');
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      fillRR(ctx, sx + 8, y - 20, w / 2 - 20, 8, 3, '#6f8fc4');
    }
    fillRR(ctx, x, y + 12, w, h - 12, 4, '#5d6470');
  },
  curtainP(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 4, '#b5486a');
    ctx.save(); ctx.globalAlpha = .4;
    for (let i = 0; i < w; i += 14) line(ctx, x + i, y + 2, x + i + 3, y + h - 2, '#8a2f4c', 3);
    ctx.restore();
  },
  galley(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 5, '#e4e8ef', '#c1c8d4');
    for (let i = 0; i < 3; i++) fillRR(ctx, x + 5, y + 6 + i * ((h - 8) / 3), w - 10, (h - 16) / 3, 3, '#aeb6c4');
  },



  /* ==================== SCENERY DECALS ====================
     These never hurt Lota. They are deliberately flat and never share an
     id with anything she can hit, so "if it stands up, it hurts" holds. */
  pawPrints(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 4; i++) {
      const px = x + 8 + i * ((w - 16) / 3), py = y + h * (i % 2 ? 0.28 : 0.72);
      fillEll(ctx, px, py, 4.4, 3.4, '#6b4a2c');
      for (let k = 0; k < 3; k++) circle(ctx, px - 3 + k * 3, py - 4.4, 1.5, '#6b4a2c');
    }
    ctx.restore();
  },
  grassTuft(ctx, x, y, w, h) {
    for (let i = 0; i < 7; i++) {
      const px = x + 4 + i * ((w - 8) / 6), lean = (i % 2 ? 3 : -3);
      ctx.beginPath(); ctx.moveTo(px, y + h);
      ctx.quadraticCurveTo(px + lean, y + h * 0.4, px + lean * 1.8, y + h * (i % 3 ? 0.15 : 0));
      ctx.strokeStyle = i % 3 ? '#4caf6d' : '#69c98a'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.stroke();
    }
  },
  pebbles(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .85;
    for (let i = 0; i < 6; i++) {
      const r = makeRng(i * 17 + (x | 0));
      fillEll(ctx, x + 6 + r() * (w - 12), y + h - 2 - r() * (h * 0.5),
        3 + r() * 3.5, 2.2 + r() * 2, i % 2 ? '#9aa0ad' : '#b3b9c4');
    }
    ctx.restore();
  },
  leafLitter(ctx, x, y, w, h) {
    const cols = ['#e0862c', '#d64a2c', '#f2b04a', '#b5813a'];
    for (let i = 0; i < 7; i++) {
      const r = makeRng(i * 29 + (x | 0));
      ctx.save();
      ctx.translate(x + 5 + r() * (w - 10), y + h - 2 - r() * (h * 0.7));
      ctx.rotate(r() * TAU); ctx.globalAlpha = .8;
      fillEll(ctx, 0, 0, 5.5, 3, cols[i % 4]);
      ctx.restore();
    }
  },
  roadPaint(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x, y + h - 5, w * 0.42, 5, 2, '#f0e9d8');
    fillRR(ctx, x + w * 0.56, y + h - 5, w * 0.4, 5, 2, '#f0e9d8');
    ctx.restore();
  },
  tileShine(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .3;
    ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.34, y);
    ctx.lineTo(x + w * 0.62, y); ctx.lineTo(x + w * 0.28, y + h);
    ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.restore();
  },
  floorArrow(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .42;
    fillRR(ctx, x, y + h * 0.3, w * 0.66, h * 0.4, 2, '#2f7fc4');
    poly(ctx, [[x + w * 0.62, y], [x + w, y + h * 0.5], [x + w * 0.62, y + h]], '#2f7fc4');
    ctx.restore();
  },
  aisleStrip(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .38;
    fillRR(ctx, x, y + h * 0.2, w, h * 0.34, 2, '#8fd6ff');
    fillRR(ctx, x, y + h * 0.72, w, h * 0.24, 2, '#6f9fd0');
    ctx.restore();
  },
  /* ==================== DOORWAYS BETWEEN PLACES ==================== */
  doorHouse(ctx, x, y, w, h) {
    fillRR(ctx, x - 8, y - 6, w + 16, h + 6, 6, '#8a6a45');
    fillRR(ctx, x, y, w, h, 4, '#c4703f');
    ctx.save(); ctx.globalAlpha = .4;
    fillRR(ctx, x + 10, y + 14, w - 20, h * 0.34, 4, '#a35a30');
    fillRR(ctx, x + 10, y + h * 0.5, w - 20, h * 0.36, 4, '#a35a30');
    ctx.restore();
    circle(ctx, x + w - 16, y + h * 0.52, 5, '#f0d05c');
    ctx.save(); ctx.globalAlpha = .55;
    poly(ctx, [[x, y], [x + w, y], [x + w - 14, y + h], [x + 14, y + h]], '#fff8e0');
    ctx.restore();
  },
  doorService(ctx, x, y, w, h) {
    fillRR(ctx, x - 8, y - 8, w + 16, h + 8, 5, '#7f8ea0');
    fillRR(ctx, x, y, w, h, 3, '#adbac9');
    fillRR(ctx, x + w / 2 - 2, y, 4, h, 0, '#8f9dae');
    fillRR(ctx, x + 8, y + 12, w - 16, 26, 4, '#2b6f4a');
    ctx.fillStyle = '#eafaf0'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('IŠĖJIMAS', x + w / 2, y + 30);
    fillRR(ctx, x + w * 0.2, y + h * 0.52, 12, 5, 2, '#6f7f92');
    fillRR(ctx, x + w * 0.62, y + h * 0.52, 12, 5, 2, '#6f7f92');
  },
  busDoor(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 6, '#2f4a75');
    fillRR(ctx, x + 4, y + 6, w / 2 - 7, h - 14, 4, '#a9dcf0');
    fillRR(ctx, x + w / 2 + 3, y + 6, w / 2 - 7, h - 14, 4, '#a9dcf0');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + 8, y + 12, 16, h * 0.4, 3, '#ffffff'); ctx.restore();
    fillRR(ctx, x - 4, y - 12, w + 8, 16, 4, '#d8b64a');
  },
  jetbridge(ctx, x, y, w, h) {
    fillRR(ctx, x, y - h * 0.1, w, h, 10, '#dfe6ef');
    ctx.strokeStyle = '#9fb0c2'; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < w; i += 22) line(ctx, x + i, y, x + i, y + h * 0.9, '#b9c6d6', 3);
    ctx.restore();
    fillRR(ctx, x + w * 0.12, y + h * 0.22, w * 0.76, h * 0.3, 6, '#a9dcf0');
    fillRR(ctx, x - 6, y - h * 0.24, w + 12, 34, 6, '#2f7fc4');
    ctx.fillStyle = '#eaf4fb'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('ĮLIPIMAS ▸', x + w / 2, y - h * 0.24 + 23);
  },
  planeDoor(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 22, '#c6d0de');
    fillRR(ctx, x + 7, y + 8, w - 14, h - 16, 18, '#8fc4e8');
    ctx.save(); rr(ctx, x + 7, y + 8, w - 14, h - 16, 18); ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#9fd0f0'); g.addColorStop(1, '#dfeef7');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.translate(x + 7, 0);
    BG.buildings(ctx, w - 14, h, 40, y + h - 18, ['#8a94ac', '#7a86a0'], '#ffe7b0', 40, 80, 52, true);
    ctx.restore();
    fillRR(ctx, x - 5, y + h - 6, w + 10, 12, 4, '#aab6c6');
    fillRR(ctx, x + w * 0.18, y + h * 0.46, 16, 6, 3, '#7f8ea0');
  },
  /* ==================== LONDON ==================== */
  booth(ctx, x, y, w, h) {
    fillRR(ctx, x, y + 6, w, h - 6, 4, '#c9302c'); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    fillRR(ctx, x - 3, y, w + 6, 9, 3, '#a8221e');
    for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++)
      fillRR(ctx, x + 6 + i * ((w - 8) / 2), y + 14 + j * ((h - 24) / 3), (w - 18) / 2, (h - 30) / 3, 2, '#2b3a4a');
    circle(ctx, x + w / 2, y + 4, 3, '#f0d05c');
  },
  postbox(ctx, x, y, w, h) {
    fillRR(ctx, x, y + 8, w, h - 8, w * 0.4, '#c9302c'); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + 10, w / 2, 9, 0, Math.PI, 0); ctx.fillStyle = '#1f1f28'; ctx.fill();
    fillRR(ctx, x + w * 0.2, y + 22, w * 0.6, 6, 2, '#2b2b34');
    fillRR(ctx, x, y + h * 0.62, w, 5, 2, '#a8221e');
  },
  busL(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h * 0.86, 10, '#c9302c'); ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .95;
    for (let i = 0; i < 4; i++) fillRR(ctx, x + 10 + i * ((w - 16) / 4), y + 8, (w - 30) / 4, h * 0.24, 3, '#a9dcf0');
    for (let i = 0; i < 4; i++) fillRR(ctx, x + 10 + i * ((w - 16) / 4), y + h * 0.46, (w - 30) / 4, h * 0.22, 3, '#a9dcf0');
    ctx.restore();
    fillRR(ctx, x + 4, y + h * 0.38, w - 8, 6, 2, '#f0e6d2');
    wheel(ctx, x + w * 0.2, y + h * 0.88, h * 0.12, '#2c2a33');
    wheel(ctx, x + w * 0.8, y + h * 0.88, h * 0.12, '#2c2a33');
  },
  railL(ctx, x, y, w, h) {
    fillRR(ctx, x, y + 4, w, 8, 4, '#3f5f6f');
    for (let i = 0; i < w; i += 34) {
      line(ctx, x + i + 14, y + 10, x + i + 14, y + h, '#3f5f6f', 4);
      circle(ctx, x + i + 14, y + 6, 5, '#4f7284');
    }
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x, y + 4, w, 3, 2, '#7fa4b5'); ctx.restore();
  },
  archL(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 6, '#8b7f74'); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); rr(ctx, x, y, w, h, 6); ctx.clip(); ctx.globalAlpha = .4;
    for (let i = 0; i < w; i += 30) for (let j = 0; j < h; j += 14)
      ctx.strokeRect(x + i + ((j / 14) % 2) * 15, y + j, 30, 14);
    ctx.restore();
  },
  crateL(ctx, x, y, w, h) { PROPS.crate(ctx, x, y, w, h); },
  barrierL(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 12, 3, '#3a4250');
    for (let i = 0; i < w; i += 26) line(ctx, x + i + 12, y + 10, x + i + 12, y + h, '#3a4250', 5);
    ctx.save(); ctx.globalAlpha = .8; fillRR(ctx, x, y, w, 4, 2, '#c9302c'); ctx.restore();
  },
  finish(ctx, x, y, w, h) {
    fillRR(ctx, x + 4, y, 16, h, 4, '#f4f0e6'); fillRR(ctx, x + w - 20, y, 16, h, 4, '#f4f0e6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x, y, w, 34, 6, '#f4f0e6');
    ctx.save(); rr(ctx, x, y, w, 34, 6); ctx.clip();
    for (let i = 0; i * 17 < w; i++) for (let j = 0; j < 2; j++)
      if ((i + j) % 2 === 0) { ctx.fillStyle = '#1f1f28'; ctx.fillRect(x + i * 17, y + j * 17, 17, 17); }
    ctx.restore();
    fillRR(ctx, x + w * 0.08, y + 38, w * 0.84, 30, 8, '#f4f0e6');
    ctx.strokeStyle = '#c9302c'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = '#c9302c'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('FINIŠAS', x + w / 2, y + 60);
  }
};

/* aliases so zones can use themed names without duplicating art */
Object.assign(PROPS, {
  rockP: PROPS.rock, bushP: PROPS.bushY, logP: PROPS.logpile, benchP: PROPS.benchY,
  rootArch: PROPS.branchY, branchP: PROPS.treeLedge, hedgeP: PROPS.hedge,
  boxM: PROPS.crate, coneA: PROPS.cone, gapA: PROPS.manhole, gapP: PROPS.manhole,
  gapL: PROPS.manhole, holeM: PROPS.manhole, stepB: PROPS.manhole, hatch: PROPS.manhole,
  bagP: PROPS.bagB, rackB: PROPS.railM, awningL: PROPS.awning, shelfH: PROPS.shelfM,
  bagA: PROPS.bagB, plantY: PROPS.flowers
});
function drawProp(ctx, id, x, y, w, h, t, pal) {
  (PROPS[id] || PROPS._default)(ctx, x, y, w, h, t || 0, pal || {});
}

/* how wide each prop wants to be — long platforms repeat it instead of stretching */
const PROP_NATURAL = {
  crate: 104, crateL: 104, car: 190, busL: 235, sofa: 205, bed: 235, dresser: 150,
  stairsH: 175, benchY: 165, benchP: 165, stump: 105, logpile: 135, rock: 115, rockP: 115,
  booth: 78, escalator: 235, shelfM: 195, shelfH: 195, beltA: 235, seatP: 175, chairsA: 185,
  galley: 115, seatB: 145, awning: 175, awningL: 175, treeLedge: 205, branchP: 205,
  boxM: 104, suitcase: 82, cart: 96, railM: 185, rackB: 185
};
/* draw a prop across a wide platform, repeating it at a sane size */
function drawPropTiled(ctx, id, x, y, w, h, t, pal) {
  const nat = PROP_NATURAL[id] || 0;
  if (!nat || w <= nat * 1.45) { drawProp(ctx, id, x, y, w, h, t, pal); return; }
  const n = Math.max(1, Math.round(w / nat));
  const tw = w / n;
  for (let i = 0; i < n; i++) drawProp(ctx, id, x + i * tw, y, tw + 0.6, h, t, pal);
}
