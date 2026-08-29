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
/* Anything Lota ducks under has to be held up by something, or it reads as a
   slab floating in mid-air. `legsTo` drops posts to the floor (o.floorY is the
   screen y of the floor under this object) and `hangTo` runs straps up to the
   ceiling. Both are drawn dimmed and *before* the object itself, so they sit
   visually behind her rather than in her way. */
function legsTo(ctx, x, y, w, o, col, wd, inset) {
  const fy = o && o.floorY;
  if (fy == null || fy <= y + 10) return;
  const i = inset == null ? 8 : inset, k = wd || 10;
  ctx.save(); ctx.globalAlpha = .62;
  fillRR(ctx, x + i, y + 6, k, fy - y - 6, 3, col || '#5d6470');
  fillRR(ctx, x + w - i - k, y + 6, k, fy - y - 6, 3, col || '#5d6470');
  ctx.restore();
}
function hangTo(ctx, x, y, w, col, wd) {
  ctx.save(); ctx.globalAlpha = .55;
  line(ctx, x + w * 0.26, y + 4, x + w * 0.26, 0, col || '#5d6470', wd || 4);
  line(ctx, x + w * 0.74, y + 4, x + w * 0.74, 0, col || '#5d6470', wd || 4);
  ctx.restore();
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
  table(ctx, x, y, w, h, t, pal, seed, o) {
    /* tabletop across the top of the box, legs all the way to the floor —
       she goes under it, so the legs are what make it a table */
    legsTo(ctx, x, y, w, o, '#8a5a2c', 11, 10);
    fillRR(ctx, x, y, w, 14, 4, '#b9793f'); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x + 5, y + 3, w - 10, 3, 2, '#e0a35f'); ctx.restore();
    fillRR(ctx, x + 6, y + 14, w - 12, 8, 3, '#a86a35');
    ctx.save(); ctx.globalAlpha = .35;
    fillEll(ctx, x + w * 0.5, y + 2, w * 0.2, 4, '#fff'); ctx.restore();
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
  vent(ctx, x, y, w, h, t, pal, seed, o) {
    /* a boxed-in duct running along under the ceiling */
    hangTo(ctx, x, y, w, '#6f7686', 5);
    fillRR(ctx, x, y, w, h * 0.62, 5, '#9aa3b5'); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); rr(ctx, x + 4, y + 4, w - 8, h * 0.62 - 8, 4); ctx.clip();
    ctx.fillStyle = '#7a8394'; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = .55;
    for (let i = 0; i < w; i += 18) fillRR(ctx, x + i + 4, y + 5, 9, h, 3, '#aab3c2');
    ctx.restore();
    /* the grille she actually ducks under */
    fillRR(ctx, x + w * 0.2, y + h * 0.62, w * 0.6, h * 0.3, 4, '#4e576b');
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < w * 0.56; i += 9) line(ctx, x + w * 0.22 + i, y + h * 0.64, x + w * 0.22 + i, y + h * 0.9, '#9aa3b5', 3);
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
    /* handles at the back, one wheel at the front, soil heaped in the tray */
    line(ctx, x + w - 4, y + h * 0.1, x + w * 0.3, y + h * 0.66, '#8a6a45', 6);
    line(ctx, x + w - 4, y + h * 0.28, x + w * 0.32, y + h * 0.8, '#8a6a45', 6);
    ctx.save(); ctx.globalAlpha = .9;
    fillEll(ctx, x + w * 0.42, y + h * 0.2, w * 0.3, h * 0.16, '#6b4a2c'); ctx.restore();
    ctx.beginPath(); ctx.moveTo(x + 4, y + h * 0.16); ctx.lineTo(x + w * 0.76, y + h * 0.16);
    ctx.lineTo(x + w * 0.6, y + h * 0.68); ctx.lineTo(x + 14, y + h * 0.68); ctx.closePath();
    ctx.fillStyle = '#d6564e'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    fillRR(ctx, x + 8, y + h * 0.2, w * 0.6, 5, 2, '#ff9a92'); ctx.restore();
    line(ctx, x + w * 0.2, y + h * 0.66, x + w * 0.2, y + h - 4, '#7c6a58', 4);
    wheel(ctx, x + w * 0.24, y + h - 9, 10, '#43404c');
  },
  fenceY(ctx, x, y, w, h) {
    const n = Math.max(3, Math.round(w / 24)), pw = Math.min(15, (w - 6) / n - 4);
    fillRR(ctx, x, y + h * 0.28, w, 7, 3, '#d8ccb2');
    fillRR(ctx, x, y + h * 0.68, w, 7, 3, '#d8ccb2');
    for (let i = 0; i < n; i++) {
      const px = x + 3 + i * ((w - 6) / n);
      ctx.beginPath(); ctx.moveTo(px, y + 9); ctx.lineTo(px + pw / 2, y); ctx.lineTo(px + pw, y + 9);
      ctx.lineTo(px + pw, y + h); ctx.lineTo(px, y + h); ctx.closePath();
      ctx.fillStyle = '#f2ead9'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    }
  },
  branchY(ctx, x, y, w, h, t, pal, seed, o) {
    /* the branch has to grow out of something: a trunk behind her, at the near
       end, running down past the box to the ground */
    const fy = o && o.floorY;
    if (fy != null && fy > y) {
      ctx.save(); ctx.globalAlpha = .7;
      fillRR(ctx, x - 4, y - 6, 20, fy - y + 8, 6, '#5c3f26');
      ctx.globalAlpha = .3; fillRR(ctx, x + 2, y - 4, 6, fy - y + 4, 3, '#8a6440');
      ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(x + 6, y + 4);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.42, x + w, y + 12);
    ctx.strokeStyle = '#6d4a2c'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
    for (let i = 1; i < 5; i++) leafy(ctx, x + (w * i) / 5, y + h * 0.42 + 6, 16, 13, '#3f9c5c', '#63c47e', i * 3);
    ctx.save(); ctx.globalAlpha = .5;
    line(ctx, x + w * 0.3, y + h * 0.3, x + w * 0.34, y + h * 0.62, '#6d4a2c', 4);
    ctx.restore();
  },
  benchY(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 10, 4, '#c08b52'); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    fillRR(ctx, x + 2, y + 13, w - 4, 7, 3, '#b07a44');
    line(ctx, x + 10, y + 8, x + 10, y + h, '#5d6470', 5);
    line(ctx, x + w - 10, y + 8, x + w - 10, y + h, '#5d6470', 5);
  },
  hedge(ctx, x, y, w, h, t, pal, seed, o) {
    /* a hedge with an archway cut through it: the sides carry on down to the
       ground, so the green mass overhead is clearly held up */
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .78;
      fillRR(ctx, x - 2, y + h * 0.4, 30, fy - y - h * 0.4, 10, '#2f7546');
      fillRR(ctx, x + w - 28, y + h * 0.4, 30, fy - y - h * 0.4, 10, '#2f7546');
      for (let k = 0; k < 4; k++) {
        leafy(ctx, x + 13, y + h * 0.5 + k * 22, 15, 12, '#3f9c5c', '#5cc47c', k * 5);
        leafy(ctx, x + w - 13, y + h * 0.5 + k * 22, 15, 12, '#3f9c5c', '#5cc47c', k * 9 + 2);
      }
      ctx.restore();
    }
    fillRR(ctx, x - 2, y, w + 4, h * 0.62, 14, '#357f4d');
    ctx.save(); rr(ctx, x - 2, y, w + 4, h * 0.62, 14); ctx.clip();
    for (let i = 0; i < w + 6; i += 17) leafy(ctx, x + i + 7, y + 9, 13, 10, '#3f9c5c', '#5cc47c', i);
    ctx.restore();
  },
  treeLedge(ctx, x, y, w, h, t, pal, seed, o) {
    const fy0 = o && o.floorY;
    if (fy0 != null && fy0 > y) {
      ctx.save(); ctx.globalAlpha = .65;
      fillRR(ctx, x - 6, y + 2, 24, fy0 - y, 7, '#5c3f26'); ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(x + w * 0.1, y + 8);
    ctx.quadraticCurveTo(x + w * 0.5, y + 2, x + w, y + 7);
    ctx.strokeStyle = '#6d4a2c'; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#8a6440'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x + w * 0.12, y + 6); ctx.quadraticCurveTo(x + w * 0.5, y + 1, x + w * 0.95, y + 5); ctx.stroke();
    for (let i = 0; i < 5; i++) leafy(ctx, x + 12 + (w - 24) * (i / 4), y + 22, 18, 13, '#2f8a4a', '#54b86c', i * 7);
  },
  roots(ctx, x, y, w, h) {
    /* a knot of tree roots humped across the path */
    ctx.strokeStyle = '#5c3f26'; ctx.lineWidth = 13; ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      ctx.beginPath(); ctx.moveTo(x + i * (w * 0.42) - 4, y + h);
      ctx.quadraticCurveTo(x + i * (w * 0.42) + w * 0.28, y + h * 0.05, x + i * (w * 0.42) + w * 0.58, y + h);
      ctx.stroke();
    }
    ctx.strokeStyle = '#7c5636'; ctx.lineWidth = 5;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath(); ctx.moveTo(x + i * (w * 0.42), y + h);
      ctx.quadraticCurveTo(x + i * (w * 0.42) + w * 0.26, y + h * 0.16, x + i * (w * 0.42) + w * 0.52, y + h);
      ctx.stroke();
    }
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 3; i++) fillEll(ctx, x + 8 + i * (w * 0.36), y + h - 3, 9, 4, '#4caf6d');
    ctx.restore();
  },
  stump(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 6, '#c69a63', '#8a6440');
    fillEll(ctx, x + w / 2, y + 5, w * 0.46, 6, '#d8b17a');
    ctx.save(); ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.arc(x + w / 2, y + 5, w * 0.26, 0, TAU); ctx.strokeStyle = '#a8794a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  },
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
    /* a roadworks sign standing on its folding legs */
    line(ctx, x + w * 0.28, y + h * 0.42, x + w * 0.12, y + h, '#8d94a3', 5);
    line(ctx, x + w * 0.72, y + h * 0.42, x + w * 0.88, y + h, '#8d94a3', 5);
    line(ctx, x + w * 0.2, y + h * 0.78, x + w * 0.8, y + h * 0.78, '#8d94a3', 3);
    const r = Math.min(w, h * 0.86) * 0.44;
    ctx.save(); ctx.translate(x + w / 2, y + r + 3);
    poly(ctx, [[0, -r], [r * 0.95, r * 0.7], [-r * 0.95, r * 0.7]], '#f6c93a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke();
    poly(ctx, [[0, -r * 0.68], [r * 0.62, r * 0.46], [-r * 0.62, r * 0.46]], '#fdf3d8');
    ctx.fillStyle = '#3a2f10'; ctx.font = 'bold ' + Math.round(r * 0.9) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('!', 0, r * 0.36);
    ctx.restore();
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
  awning(ctx, x, y, w, h, t, pal, seed, o) {
    /* a market stall: striped canopy on two poles, so it is obviously held up */
    legsTo(ctx, x, y, w, o, '#6f7686', 8, 6);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 6, y + 18); ctx.lineTo(x + 6, y + 18); ctx.closePath();
    ctx.fillStyle = '#e2453c'; ctx.fill();
    ctx.clip(); ctx.fillStyle = '#f4f0e6';
    for (let i = 0; i < w; i += 26) ctx.fillRect(x + i, y, 13, 22);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    /* scalloped hem */
    for (let i = 0; i * 26 <= w - 10; i++) circle(ctx, x + 8 + i * 26, y + 19, 5, '#e8ded0');
    fillRR(ctx, x - 3, y - 5, w + 6, 6, 3, '#8a6a45');
  },
  scaffold(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#7f8797', 9, 5);
    fillRR(ctx, x, y, w, 13, 3, '#c9a24a');            /* the plank deck */
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < w; i += 34) line(ctx, x + i, y + 1, x + i, y + 12, '#8a6f2c', 2);
    ctx.restore();
    fillRR(ctx, x, y + 15, w, 5, 2, '#9aa3b5');        /* the ledger tube */
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < w; i += 30) line(ctx, x + i + 4, y + 18, x + i + 22, y + h - 6, '#8d94a3', 3);
    ctx.restore();
    fillRR(ctx, x + 4, y - 6, w - 8, 6, 2, '#e2453c');  /* the warning rail */
  },
  pipeS(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#6f7686', 9, 4);
    fillRR(ctx, x - 3, y + 2, w + 6, 20, 10, '#8d94a3'); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x, y + 5, w, 5, 3, '#c3cad6'); ctx.restore();
    for (let i = 0; i < w - 10; i += 46) fillRR(ctx, x + i + 10, y, 10, 24, 3, '#6f7686');
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * 0.3, y + 24, w * 0.4, 5, 2, '#f2762c'); ctx.restore();
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
    /* a stack of shopping boxes, tied up */
    const cols = ['#ff8fa8', '#8fd6ff', '#ffe07a', '#a6e88f'];
    for (let i = 0; i < 4; i++) {
      const bx = x + (i % 2) * (w / 2), by = y + Math.floor(i / 2) * (h / 2);
      fillRR(ctx, bx + 4, by + 4, w / 2 - 8, h / 2 - 8, 4, cols[i]);
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.globalAlpha = .35;
      fillRR(ctx, bx + 4, by + 4, w / 2 - 8, 5, 2, '#fff'); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = .6;
    line(ctx, x + w * 0.5, y + 2, x + w * 0.5, y + h - 2, '#c9302c', 3);
    line(ctx, x + 3, y + h * 0.5, x + w - 3, y + h * 0.5, '#c9302c', 3);
    ctx.restore();
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
  railM(ctx, x, y, w, h, t, pal, seed, o) {
    /* a gallery railing with a glass infill — posts reach the floor */
    const fy = o && o.floorY;
    if (fy != null && fy > y + 12) {
      ctx.save(); ctx.globalAlpha = .3;
      fillRR(ctx, x + 4, y + 12, w - 8, fy - y - 14, 3, '#a9dcf0'); ctx.restore();
      ctx.save(); ctx.globalAlpha = .7;
      fillRR(ctx, x + 2, y + 10, 9, fy - y - 10, 3, '#9aa3b5');
      fillRR(ctx, x + w - 11, y + 10, 9, fy - y - 10, 3, '#9aa3b5');
      for (let i = 46; i < w - 40; i += 46) fillRR(ctx, x + i, y + 10, 7, fy - y - 10, 3, '#9aa3b5');
      ctx.restore();
    }
    fillRR(ctx, x - 2, y + 2, w + 4, 11, 6, '#c9ced9'); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x, y + 4, w, 3, 2, '#fff'); ctx.restore();
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
  handrail(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#8d94a3', 5);
    fillRR(ctx, x - 2, y, w + 4, 9, 5, '#d8b64a'); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x, y + 2, w, 3, 2, '#fff3c4'); ctx.restore();
    for (let i = 0; i < w - 10; i += 42) {
      line(ctx, x + i + 18, y + 7, x + i + 18, y + 24, '#b39440', 3);
      ctx.beginPath(); ctx.arc(x + i + 18, y + 31, 8, 0, TAU); ctx.strokeStyle = '#c9c9d4'; ctx.lineWidth = 3.5; ctx.stroke();
    }
  },
  bagB(ctx, x, y, w, h) {
    fillRR(ctx, x, y + 5, w, h - 5, 7, '#b5734e'); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w / 2, y + 6, w * 0.28, Math.PI, 0); ctx.strokeStyle = '#7c5232'; ctx.lineWidth = 3.5; ctx.stroke();
    fillRR(ctx, x + 4, y + h * 0.45, w - 8, 5, 2, '#8f5a3a');
  },
  suitcase(ctx, x, y, w, h, t, pal, seed) {
    const cols = ['#e2453c', '#3f8fd6', '#4a9d6e', '#f0a93a', '#a86fd6'];
    /* keyed on where the case stands in the world, not on where it happens to be
       on screen: screen x goes negative once it scrolls past the left edge, and
       a negative index handed shade() undefined and froze the render loop */
    const c = cols[imod(Math.round(seed || 0), cols.length)];
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
      const px = x + 9 + i * (w - 18);
      fillEll(ctx, px, y + h - 2, 15, 6, '#43404c');
      fillRR(ctx, px - 5, y + h * 0.12, 10, h * 0.88, 4, '#6f7686');
      ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, px - 2, y + h * 0.18, 3, h * 0.7, 2, '#c9ced9'); ctx.restore();
      fillEll(ctx, px, y + h * 0.12, 8, 5, '#8d94a3');
    }
    ctx.beginPath(); ctx.moveTo(x + 9, y + h * 0.22);
    ctx.quadraticCurveTo(x + w / 2, y + h * 0.66, x + w - 9, y + h * 0.22);
    ctx.strokeStyle = '#d64a72'; ctx.lineWidth = 6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    ctx.beginPath(); ctx.moveTo(x + 9, y + h * 0.2);
    ctx.quadraticCurveTo(x + w / 2, y + h * 0.62, x + w - 9, y + h * 0.2);
    ctx.strokeStyle = '#f08fae'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  },
  screenA(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#4d5666', 5);
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
  scannerA(ctx, x, y, w, h, t, pal, seed, o) {
    /* a walk-through scanner: a lintel on two side pillars */
    const fy = o && o.floorY;
    if (fy != null && fy > y + 20) {
      ctx.save(); ctx.globalAlpha = .85;
      fillRR(ctx, x, y + 16, 26, fy - y - 16, 5, '#c9ced9');
      fillRR(ctx, x + w - 26, y + 16, 26, fy - y - 16, 5, '#c9ced9');
      ctx.globalAlpha = .5;
      fillRR(ctx, x + 5, y + 26, 8, fy - y - 40, 3, '#8fd6ff');
      fillRR(ctx, x + w - 13, y + 26, 8, fy - y - 40, 3, '#8fd6ff');
      ctx.restore();
    }
    fillRR(ctx, x - 2, y, w + 4, 22, 6, '#c9ced9'); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + 6, y + 22, w - 12, 6, 3, '#8d94a3');
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * 0.24, y + 6, w * 0.52, 6, 3, '#6fe0a8'); ctx.restore();
    circle(ctx, x + w * 0.5, y + 32, 5, '#f0d05c');
  },
  cartP(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 5, '#dfe4ec', '#c1c8d4');
    for (let i = 1; i < 3; i++) line(ctx, x + 3, y + (h * i) / 3, x + w - 3, y + (h * i) / 3, '#9aa3b5', 2.5);
    wheel(ctx, x + 10, y + h - 5, 5, '#43404c'); wheel(ctx, x + w - 10, y + h - 5, 5, '#43404c');
    fillRR(ctx, x + 5, y + 4, w - 10, 6, 2, '#8fd6ff');
  },
  maskDrop(ctx, x, y, w, h) {
    /* the oxygen panel dropped open: unmistakably a thing to duck under, and
       it belongs at exactly this height in a cabin */
    hangTo(ctx, x, y, w, '#b9c2d0', 4);
    fillRR(ctx, x - 4, y, w + 8, 15, 5, '#e9eef5');
    ctx.strokeStyle = '#a9b1c0'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x, y + 2, w, 4, 2, '#ffffff'); ctx.restore();
    const n = Math.max(2, Math.round(w / 46));
    for (let i = 0; i < n; i++) {
      const mx = x + (w * (i + 0.5)) / n, sw = Math.sin(i * 1.7) * 5;
      ctx.beginPath(); ctx.moveTo(mx, y + 14);
      ctx.quadraticCurveTo(mx + sw, y + h * 0.5, mx + sw * 0.6, y + h * 0.72);
      ctx.strokeStyle = '#9aa3b5'; ctx.lineWidth = 3.4; ctx.stroke();
      ctx.save(); ctx.translate(mx + sw * 0.6, y + h * 0.82);
      fillEll(ctx, 0, 0, 14, 11, '#ffd94a');
      ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
      fillEll(ctx, 0, 3, 8, 5.5, '#f2b02c');
      ctx.save(); ctx.globalAlpha = .6; fillEll(ctx, -5, -4, 4, 3, '#fff6d8'); ctx.restore();
      ctx.restore();
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
    /* a cabin divider curtain on a track, hem swinging free */
    fillRR(ctx, x, y - 6, w, 7, 3, '#c9ced9');
    for (let i = 0; i < w; i += 15) circle(ctx, x + 8 + i, y - 2, 3.4, '#9aa3b5');
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h - 8);
    for (let px = w; px >= 0; px -= 11) ctx.lineTo(x + px, y + h - 8 + Math.sin(px * 0.2) * 6);
    ctx.closePath(); ctx.fillStyle = '#b5486a'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.globalAlpha = .35;
    for (let i = 0; i < w; i += 15) line(ctx, x + i, y, x + i + 5, y + h, '#8a2f4c', 5);
    ctx.globalAlpha = .2;
    for (let i = 7; i < w; i += 15) line(ctx, x + i, y, x + i + 5, y + h, '#e08fa8', 4);
    ctx.restore();
  },
  galley(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 5, '#e4e8ef', '#c1c8d4');
    for (let i = 0; i < 3; i++) fillRR(ctx, x + 5, y + 6 + i * ((h - 8) / 3), w - 10, (h - 16) / 3, 3, '#aeb6c4');
  },




  /* ==================== STAIRS (both branches) ====================
     One tread. The staircases are built out of these, one platform each, so
     running up or down one is ordinary running — never a jump. */
  tread(ctx, x, y, w, h, t, pal, seed, o) {
    const top = (pal && pal.treadTop) || '#d8d2c6';
    const side = (pal && pal.treadSide) || '#a49c90';
    /* a banister running the length of the flight — without it a row of steps
       reads as floating blocks rather than as stairs */
    if (o && o.dir) {
      const dy = -o.dir * (o.rise || 42);
      const rail = (pal && pal.rail) || '#a8794a', post = (pal && pal.post) || '#8a6a45';
      ctx.save(); ctx.globalAlpha = .85;
      line(ctx, x + 6, y - 4, x + 6, y - 62, post, 5);
      line(ctx, x, y - 58, x + w, y - 58 + dy, rail, 7);
      ctx.globalAlpha = .35;
      line(ctx, x, y - 60, x + w, y - 60 + dy, shade(rail, .35), 3);
      ctx.restore();
    }
    fillRR(ctx, x, y, w, Math.max(h, 12), 2, side);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    fillRR(ctx, x, y, w, 8, 2, top);
    ctx.save(); ctx.globalAlpha = .7;
    fillRR(ctx, x + 1, y + 7, w - 2, 3.5, 1, '#f6c93a');   /* the nosing strip */
    ctx.globalAlpha = .18;
    fillRR(ctx, x, y + 11, w, Math.max(h - 11, 2), 0, '#000');
    ctx.restore();
  },
  /* what the stairwell looks like from the street: steps dropping away into
     a lit passage. Nothing here can be hit — she jumps the mouth or runs down. */
  stairsDown(ctx, x, y, w, h) {
    const g = ctx.createLinearGradient(0, y, 0, y + h + 40);
    g.addColorStop(0, '#4a4438'); g.addColorStop(1, '#171a24');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h + 60);
    const n = 5, sw = w / n;
    for (let i = 0; i < n; i++) {
      const sx = x + i * sw * 0.62, sy = y + 4 + i * (h / (n + 1));
      ctx.save(); ctx.globalAlpha = 1 - i * 0.13;
      fillRR(ctx, sx, sy, w - i * sw * 0.5, h / (n + 1) - 3, 2, i % 2 ? '#b0a99c' : '#c4bdaf');
      ctx.globalAlpha = (1 - i * 0.13) * 0.75;
      fillRR(ctx, sx, sy, w - i * sw * 0.5, 3.5, 1, '#f6c93a');
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = .35;
    fillRR(ctx, x + w * 0.3, y + h * 0.72, w * 0.5, 8, 3, '#ffeec2'); ctx.restore();
    /* lit lips so the edges read at speed */
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x - 3, y - 3, 7, 9, 2, '#fff');
    fillRR(ctx, x + w - 4, y - 3, 7, 9, 2, '#fff'); ctx.restore();
  },
  /* the cue for the flight of stairs overhead in the neighbours' hall */
  stairsUpSign(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .9;
    fillRR(ctx, x + w * 0.16, y + h - 66, w * 0.68, 34, 5, '#f4ecdc');
    ctx.strokeStyle = '#c98f5a'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.translate(x + w * 0.5, y + h - 49);
    poly(ctx, [[-2, 9], [-2, -3], [-11, -3], [0, -15], [11, -3], [2, -3], [2, 9]], '#4f8ce2');
    ctx.restore();
  },
  treadRail(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 6, 3, '#8d94a3');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < w; i += 26) line(ctx, x + i + 8, y + 5, x + i + 8, y + h, '#8d94a3', 3);
    ctx.restore();
  },

  /* ==================== LONDON UNDERGROUND ==================== */
  metroSign(ctx, x, y, w, h, t, pal, seed, o) {
    /* the mouth of the stairs: a railing round it with the roundel on a post.
       It is signage, never an obstacle — she runs or jumps straight past. */
    const ry = y + h - 52;
    fillRR(ctx, x, ry, w, 8, 4, '#20304f');
    for (let i = 0; i <= w - 8; i += 20) line(ctx, x + 4 + i, ry + 7, x + 4 + i, y + h, '#20304f', 4);
    line(ctx, x + w * 0.5, ry, x + w * 0.5, y + 44, '#4a5160', 7);
    circle(ctx, x + w * 0.5, y + 30, 27, '#c9302c');
    circle(ctx, x + w * 0.5, y + 30, 17, '#f2f4f8');
    fillRR(ctx, x + w * 0.5 - 34, y + 22, 68, 17, 3, '#1f3b7a');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('METRO', x + w * 0.5, y + 34);
    ctx.save(); ctx.globalAlpha = .95;
    poly(ctx, [[x + w * 0.5 - 10, y + 62], [x + w * 0.5 + 10, y + 62], [x + w * 0.5, y + 78]], '#f6c93a');
    ctx.restore();
    /* while the gate is shut the roundel wears a padlock, so the way in reads
       as locked from as far off as the sign itself does */
    if (o && o.locked) {
      ctx.save(); ctx.translate(x + w * 0.5 + 30, y + 34); ctx.globalAlpha = .95;
      ctx.beginPath(); ctx.arc(0, -8, 7, Math.PI, 0); ctx.strokeStyle = '#d8d2c4'; ctx.lineWidth = 4; ctx.stroke();
      fillRR(ctx, -10, -8, 20, 17, 4, '#f6c93a');
      ctx.strokeStyle = '#a8791c'; ctx.lineWidth = 1.8; ctx.stroke();
      circle(ctx, 0, 0, 2.6, '#a8791c');
      ctx.restore();
    }
  },
  /* The bars across the mouth of the metro steps. Shut, they are simply floor:
     she runs over them. With the key they fold back against the railings and
     the steps are open. */
  metroGrate(ctx, x, y, w, h, t, pal, seed, o) {
    const open = o && o.open;
    const fy = (o && o.floorY != null) ? o.floorY : y + h;
    if (open) {
      ctx.save(); ctx.globalAlpha = .9;
      [x + 4, x + w - 20].forEach((bx, k) => {
        fillRR(ctx, bx, fy - 62, 16, 62, 4, '#4a5468');
        ctx.save(); ctx.globalAlpha = .55;
        for (let i = 0; i < 5; i++) line(ctx, bx + 2, fy - 56 + i * 11, bx + 14, fy - 56 + i * 11, '#8d94a3', 2);
        ctx.restore();
        circle(ctx, bx + 8, fy - 66, 4, '#6fe0a8');
      });
      ctx.restore();
      return;
    }
    /* shut: a heavy frame with uprights, sitting in the pavement */
    fillRR(ctx, x, fy - 16, w, 16, 3, '#4a5468');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    fillRR(ctx, x, fy - 62, w, 10, 4, '#5d6878');
    ctx.save(); ctx.globalAlpha = .95;
    for (let i = 6; i < w - 8; i += 22) {
      fillRR(ctx, x + i, fy - 60, 8, 48, 3, '#6f7a8c');
      ctx.save(); ctx.globalAlpha = .35; fillRR(ctx, x + i + 1.5, fy - 58, 3, 44, 2, '#c9d2e0'); ctx.restore();
    }
    ctx.restore();
    for (let i = 0; i < 2; i++) fillRR(ctx, x + 2, fy - 46 + i * 22, w - 4, 6, 3, '#5d6878');
    /* the padlock in the middle of it */
    ctx.save(); ctx.translate(x + w * 0.5, fy - 34);
    ctx.beginPath(); ctx.arc(0, -9, 8, Math.PI, 0); ctx.strokeStyle = '#c9d2e0'; ctx.lineWidth = 4.5; ctx.stroke();
    fillRR(ctx, -12, -9, 24, 20, 5, '#f6c93a');
    ctx.strokeStyle = '#a8791c'; ctx.lineWidth = 2; ctx.stroke();
    circle(ctx, 0, 0, 3, '#a8791c');
    ctx.restore();
  },
  metroExit(ctx, x, y, w, h) {
    /* the same railing seen from the street where she comes back up */
    const ry = y + h - 52;
    fillRR(ctx, x, ry, w, 8, 4, '#20304f');
    for (let i = 0; i <= w - 8; i += 20) line(ctx, x + 4 + i, ry + 7, x + 4 + i, y + h, '#20304f', 4);
    fillRR(ctx, x + w * 0.5 - 40, ry - 30, 80, 22, 3, '#1f3b7a');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('IŠĖJIMAS', x + w * 0.5, ry - 15);
  },
  turnstile(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.16, y + h * 0.24, w * 0.68, h * 0.76, 5, '#c9ced9');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + w * 0.24, y + h * 0.36, w * 0.52, 11, 3, '#f6c93a');
    circle(ctx, x + w * 0.5, y + h * 0.62, 6, '#6fe0a8');
    ctx.save(); ctx.globalAlpha = .9;
    line(ctx, x + w * 0.5, y + h * 0.24, x + w + 4, y + h * 0.06, '#8d94a3', 7);
    line(ctx, x + w * 0.5, y + h * 0.24, x - 4, y + h * 0.42, '#8d94a3', 7);
    line(ctx, x + w * 0.5, y + h * 0.24, x + w * 0.5, y, '#8d94a3', 7);
    ctx.restore();
    circle(ctx, x + w * 0.5, y + h * 0.24, 7, '#5d6470');
  },
  ticketMachine(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 5, '#4f6fa8', '#2f4a75');
    fillRR(ctx, x + 6, y + 8, w - 12, h * 0.32, 4, '#8fd6ff');
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x + 9, y + 11, (w - 18) * 0.5, h * 0.12, 2, '#fff'); ctx.restore();
    for (let i = 0; i < 3; i++) circle(ctx, x + 13 + i * 13, y + h * 0.56, 4.4, '#d8b64a');
    fillRR(ctx, x + 9, y + h * 0.72, w - 18, 8, 3, '#1f3050');
    fillRR(ctx, x + w * 0.3, y + h * 0.86, w * 0.4, 5, 2, '#8d94a3');
  },
  metroBench(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 11, 4, '#8a6440'); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    fillRR(ctx, x + 3, y + 15, w - 6, 8, 3, '#7a5636');
    line(ctx, x + 13, y + 9, x + 13, y + h, '#3f4855', 6);
    line(ctx, x + w - 13, y + 9, x + w - 13, y + h, '#3f4855', 6);
  },
  metroArch(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + h * 0.5) {
      ctx.save(); ctx.globalAlpha = .9;
      fillRR(ctx, x - 2, y + h * 0.5, 26, fy - y - h * 0.5, 4, '#6f7a8c');
      fillRR(ctx, x + w - 24, y + h * 0.5, 26, fy - y - h * 0.5, 4, '#6f7a8c');
      ctx.globalAlpha = .3;
      for (let j = 0; j * 15 < fy - y - h * 0.5; j++) {
        line(ctx, x, y + h * 0.5 + j * 15, x + 24, y + h * 0.5 + j * 15, '#4e5768', 1.6);
        line(ctx, x + w - 24, y + h * 0.5 + j * 15, x + w, y + h * 0.5 + j * 15, '#4e5768', 1.6);
      }
      ctx.restore();
    }
    fillRR(ctx, x - 2, y, w + 4, h * 0.5, 6, '#7d8798');
    ctx.save(); rr(ctx, x - 2, y, w + 4, h * 0.5, 6); ctx.clip(); ctx.globalAlpha = .28;
    ctx.strokeStyle = '#4e5768'; ctx.lineWidth = 1.6;
    for (let j = 0; j < h; j += 15) for (let i = -28; i < w + 28; i += 26)
      ctx.strokeRect(x + i + ((j / 15) % 2) * 13, y + j, 26, 15);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .85;
    fillRR(ctx, x + w * 0.12, y + h * 0.5, w * 0.76, 6, 3, '#ffeec2'); ctx.restore();
  },
  metroMap(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#4d5666', 5);
    fillRR(ctx, x, y, w, h * 0.66, 5, '#1f3b7a'); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); rr(ctx, x + 5, y + 5, w - 10, h * 0.66 - 10, 3); ctx.clip();
    ctx.fillStyle = '#f2f4f8'; ctx.fillRect(x, y, w, h);
    ['#c9302c', '#2f7fc4', '#4a9d6e'].forEach((c, i) => {
      ctx.beginPath(); ctx.moveTo(x + 6, y + 14 + i * 11);
      ctx.lineTo(x + w * 0.45, y + 14 + i * 11);
      ctx.lineTo(x + w * 0.62, y + 22 + i * 11);
      ctx.lineTo(x + w - 6, y + 22 + i * 11);
      ctx.strokeStyle = c; ctx.lineWidth = 3.4; ctx.stroke();
    });
    ctx.restore();
    fillRR(ctx, x + w * 0.3, y + h * 0.66, w * 0.4, 5, 2, '#c9302c');
  },
  trainDoor(ctx, x, y, w, h) {
    fillRR(ctx, x - 10, y - 10, w + 20, h + 10, 10, '#c3ccda');
    fillRR(ctx, x, y, w, h, 6, '#2f4a75');
    fillRR(ctx, x + 6, y + 12, w / 2 - 11, h * 0.46, 6, '#a9dcf0');
    fillRR(ctx, x + w / 2 + 5, y + 12, w / 2 - 11, h * 0.46, 6, '#a9dcf0');
    fillRR(ctx, x + w / 2 - 2, y, 5, h, 0, '#1f3050');
    ctx.save(); ctx.globalAlpha = .45; fillRR(ctx, x + 11, y + 18, 14, h * 0.3, 3, '#fff'); ctx.restore();
    circle(ctx, x + w * 0.22, y + h * 0.68, 8, '#6fe0a8');
    fillRR(ctx, x - 6, y - 30, w + 12, 22, 5, '#c9302c');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TRAUKINYS', x + w / 2, y - 14);
  },
  trainSeat(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * 0.34, w, h * 0.66, 6, '#25406b');
    fillRR(ctx, x + 3, y, w - 6, h * 0.44, 7, '#3f6fb5'); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .38;
    for (let i = 0; i + 18 < w - 12; i += 18) fillRR(ctx, x + 8 + i, y + 6, 9, h * 0.3, 3, '#8fd6ff');
    ctx.restore();
    fillRR(ctx, x + 4, y + h * 0.42, w - 8, 5, 2, '#d8b64a');
  },
  trainRail(ctx, x, y, w, h) {
    hangTo(ctx, x, y, w, '#8d94a3', 5);
    fillRR(ctx, x - 2, y, w + 4, 9, 5, '#d8b64a'); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x, y + 2, w, 3, 2, '#fff3c4'); ctx.restore();
    for (let i = 0; i < w - 10; i += 40) {
      line(ctx, x + i + 16, y + 7, x + i + 16, y + 24, '#b39440', 3);
      ctx.beginPath(); ctx.arc(x + i + 16, y + 31, 8, 0, TAU); ctx.strokeStyle = '#c9c9d4'; ctx.lineWidth = 3.5; ctx.stroke();
    }
  },
  trainRack(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 9, 3, '#aeb9c9'); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < w; i += 17) line(ctx, x + i + 6, y + 8, x + i + 6, y + h, '#8d94a3', 2.5);
    ctx.restore();
    fillRR(ctx, x + w * 0.14, y - 18, w * 0.3, 19, 4, '#b5734e');
    fillRR(ctx, x + w * 0.56, y - 14, w * 0.24, 15, 4, '#4a9d6e');
  },

  /* ==================== UPSTAIRS AT THE NEIGHBOURS' ==================== */
  bunkBed(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * 0.44, w, h * 0.56, 6, '#8a6a4e');
    fillRR(ctx, x + 4, y + h * 0.34, w - 8, h * 0.18, 6, '#5fa8e0');
    fillRR(ctx, x + 8, y + h * 0.28, w * 0.26, h * 0.15, 6, '#fff6f8');
    fillRR(ctx, x, y, 10, h, 3, '#7a5b41'); fillRR(ctx, x + w - 10, y, 10, h, 3, '#7a5b41');
    ctx.save(); ctx.globalAlpha = .7;
    for (let i = 0; i < 4; i++) line(ctx, x + 10, y + 7 + i * 10, x + w - 10, y + 7 + i * 10, '#a8845f', 3.4);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
    rr(ctx, x, y + h * 0.44, w, h * 0.56, 6); ctx.stroke();
  },
  toyRobot(ctx, x, y, w, h) {
    line(ctx, x + w * 0.5, y + h * 0.08, x + w * 0.5, y, '#8d94a3', 3);
    circle(ctx, x + w * 0.5, y - 1, 3.4, '#e2453c');
    fillRR(ctx, x + w * 0.24, y + h * 0.08, w * 0.52, h * 0.26, 5, '#8fd6ff');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    circle(ctx, x + w * 0.4, y + h * 0.2, 3.6, '#1f2330'); circle(ctx, x + w * 0.62, y + h * 0.2, 3.6, '#1f2330');
    fillRR(ctx, x + w * 0.14, y + h * 0.36, w * 0.72, h * 0.42, 5, '#4f8ce2');
    ctx.strokeStyle = INK; ctx.stroke();
    fillRR(ctx, x + w * 0.3, y + h * 0.44, w * 0.4, h * 0.16, 3, '#ffe07a');
    fillRR(ctx, x, y + h * 0.4, w * 0.14, h * 0.3, 4, '#3f6fb5');
    fillRR(ctx, x + w * 0.86, y + h * 0.4, w * 0.14, h * 0.3, 4, '#3f6fb5');
    fillRR(ctx, x + w * 0.2, y + h * 0.8, w * 0.24, h * 0.2, 3, '#2f4a75');
    fillRR(ctx, x + w * 0.56, y + h * 0.8, w * 0.24, h * 0.2, 3, '#2f4a75');
  },
  blocks(ctx, x, y, w, h) {
    const cols = ['#e2584f', '#4f8ce2', '#f0b23a', '#68c77e', '#b884e8'];
    const s = Math.min(w / 3.2, h / 3.2);
    let k = 0;
    for (let r2 = 0; r2 < 3; r2++) {
      const n = 3 - r2, x0 = x + (w - n * s) / 2;
      for (let c = 0; c < n; c++) {
        fillRR(ctx, x0 + c * s, y + h - (r2 + 1) * s, s - 3, s - 3, 3, cols[k % 5]);
        ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.save(); ctx.globalAlpha = .5;
        circle(ctx, x0 + c * s + s * 0.28, y + h - (r2 + 1) * s + s * 0.28, s * 0.13, '#fff');
        ctx.restore();
        k++;
      }
    }
  },
  deskH(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 12, 4, '#c9a06a'); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x + 8, y + 12, 12, h - 12, 3, '#a8794a');
    fillRR(ctx, x + w - 48, y + 12, 42, h - 14, 4, '#b58a58');
    for (let i = 0; i < 2; i++) {
      fillRR(ctx, x + w - 43, y + 18 + i * ((h - 26) / 2), 32, (h - 36) / 2, 3, '#a0763f');
      circle(ctx, x + w - 27, y + 18 + i * ((h - 26) / 2) + (h - 36) / 4, 2.6, '#7c5730');
    }
    fillRR(ctx, x + 14, y - 16, 34, 17, 3, '#3a3f4c');
    fillRR(ctx, x + 16, y - 14, 30, 13, 2, '#8fd6ff');
  },
  bathtub(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 16, '#f4f8fc'); ctx.strokeStyle = '#9fb2c6'; ctx.lineWidth = 2.8; ctx.stroke();
    ctx.save(); rr(ctx, x + 8, y + 7, w - 16, h - 14, 11); ctx.clip();
    ctx.fillStyle = '#8fd6ff'; ctx.fillRect(x, y + h * 0.3, w, h);
    ctx.globalAlpha = .9;
    for (let i = 0; i < 5; i++) circle(ctx, x + 18 + i * ((w - 36) / 4), y + h * 0.28 - (i % 2) * 6, 7 - (i % 3), '#ffffff');
    ctx.restore();
    fillRR(ctx, x + w - 26, y - 14, 8, 16, 3, '#c9ced9');
    fillRR(ctx, x + w - 36, y - 16, 26, 7, 3, '#c9ced9');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 4; i++) fillEll(ctx, x + w - 24 + (i % 2) * 6, y - 4 + i * 3, 2.4, 2.4, '#a9dcf0');
    ctx.restore();
    for (let i = 0; i < 2; i++) fillRR(ctx, x + 10 + i * (w - 30), y + h - 4, 14, 8, 3, '#c9ced9');
  },
  toiletH(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.08, y, w * 0.84, h * 0.42, 6, '#f4f8fc');
    ctx.strokeStyle = '#9fb2c6'; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + w * 0.2, y + h * 0.1, w * 0.6, 6, 3, '#dfe8f0');
    fillRR(ctx, x + w * 0.14, y + h * 0.4, w * 0.72, h * 0.6, 14, '#f9fcff');
    ctx.strokeStyle = '#9fb2c6'; ctx.lineWidth = 2.4; ctx.stroke();
    fillEll(ctx, x + w * 0.5, y + h * 0.45, w * 0.3, 8, '#e2ebf3');
    circle(ctx, x + w * 0.78, y + h * 0.12, 4, '#c9ced9');
  },
  sinkH(ctx, x, y, w, h) {
    line(ctx, x + w * 0.5, y + 2, x + w * 0.5, y - 16, '#c9ced9', 5);
    line(ctx, x + w * 0.5, y - 16, x + w * 0.66, y - 12, '#c9ced9', 5);
    fillRR(ctx, x, y, w, h * 0.36, 7, '#f4f8fc'); ctx.strokeStyle = '#9fb2c6'; ctx.lineWidth = 2.4; ctx.stroke();
    fillEll(ctx, x + w * 0.5, y + h * 0.15, w * 0.3, 7, '#dfe8f0');
    fillRR(ctx, x + w * 0.4, y + h * 0.36, w * 0.2, h * 0.28, 4, '#e4eaf0');
    ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.62);
    ctx.quadraticCurveTo(x + w * 0.5, y + h, x + w * 0.72, y + h);
    ctx.strokeStyle = '#c9ced9'; ctx.lineWidth = 7; ctx.stroke();
  },
  towelRail(ctx, x, y, w, h) {
    hangTo(ctx, x, y, w, '#c9ced9', 4);
    fillRR(ctx, x - 2, y, w + 4, 9, 4, '#c9ced9'); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ['#8fd6ff', '#ffd8e6', '#fff6d8'].forEach((c, i) => {
      const tw = (w - 22) / 3, tx = x + 8 + i * ((w - 16) / 3);
      fillRR(ctx, tx, y + 7, tw, h * 0.74, 4, c);
      ctx.save(); ctx.globalAlpha = .35;
      fillRR(ctx, tx + 3, y + 14, tw - 6, 4, 2, '#7f96ac');
      fillRR(ctx, tx + 3, y + h * 0.5, tw - 6, 4, 2, '#7f96ac'); ctx.restore();
    });
  },
  showerCurtainH(ctx, x, y, w, h) {
    fillRR(ctx, x, y - 7, w, 7, 3, '#c9ced9');
    for (let i = 0; i < w; i += 16) circle(ctx, x + 8 + i, y - 3, 3.6, '#9fb2c6');
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h - 8);
    for (let px = w; px >= 0; px -= 11) ctx.lineTo(x + px, y + h - 8 + Math.sin(px * 0.2) * 6);
    ctx.closePath(); ctx.fillStyle = '#dff0fb'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.globalAlpha = .45;
    for (let i = 0; i < w; i += 20) line(ctx, x + i, y, x + i + 7, y + h, '#a9dcf0', 6);
    ctx.globalAlpha = .35;
    for (let i = 0; i < w; i += 40) circle(ctx, x + i + 14, y + h * 0.4, 9, '#8fd6ff');
    ctx.restore();
  },
  dollhouse(ctx, x, y, w, h) {
    poly(ctx, [[x - 2, y + h * 0.32], [x + w * 0.5, y], [x + w + 2, y + h * 0.32]], '#e2607a');
    fillRR(ctx, x + 4, y + h * 0.3, w - 8, h * 0.7, 4, '#ffd8e6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    for (let i = 0; i < 2; i++)
      fillRR(ctx, x + 11 + i * ((w - 22) / 2 + 6), y + h * 0.4, (w - 34) / 2, h * 0.22, 3, '#fff6f8');
    fillRR(ctx, x + w * 0.38, y + h * 0.7, w * 0.24, h * 0.3, 3, '#c2607a');
    circle(ctx, x + w * 0.56, y + h * 0.85, 2.4, '#ffe07a');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 4; i++) line(ctx, x + 4 + i * ((w - 8) / 4), y + h * 0.3, x + 4 + i * ((w - 8) / 4), y + h, '#e8b6c8', 1.6);
    ctx.restore();
  },
  vanity(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.24, w * 0.3, h * 0.26, 0, 0, TAU);
    ctx.fillStyle = '#dff0fb'; ctx.fill(); ctx.strokeStyle = '#c2607a'; ctx.lineWidth = 3.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .6; fillRR(ctx, x + w * 0.36, y + h * 0.1, w * 0.1, h * 0.2, 4, '#fff'); ctx.restore();
    fillRR(ctx, x, y + h * 0.48, w, h * 0.52, 5, '#e8c9d8'); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    for (let i = 0; i < 2; i++) {
      fillRR(ctx, x + 8 + i * ((w - 16) / 2), y + h * 0.56, (w - 26) / 2, h * 0.28, 3, '#d8a8c0');
      circle(ctx, x + 8 + i * ((w - 16) / 2) + (w - 26) / 4, y + h * 0.7, 2.6, '#c2607a');
    }
    circle(ctx, x + w * 0.24, y + h * 0.44, 4, '#ff8fb0');
    circle(ctx, x + w * 0.76, y + h * 0.44, 4, '#ffe07a');
  },
  bedGirl(ctx, x, y, w, h) {
    fillRR(ctx, x + w - 12, y, 12, h, 4, '#b07a8e');
    fillRR(ctx, x, y + h * 0.42, w, h * 0.58, 6, '#c98fa8');
    fillRR(ctx, x + 3, y + h * 0.3, w - 8, h * 0.2, 8, '#ffd8e6');
    fillRR(ctx, x + w - 46, y + h * 0.22, 34, h * 0.2, 7, '#fff6f8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
    rr(ctx, x, y + h * 0.42, w, h * 0.58, 6); ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 4; i++) {
      const hx = x + w * 0.16 + i * 15, hy = y + h * 0.38;
      ctx.beginPath(); ctx.moveTo(hx, hy + 3);
      ctx.bezierCurveTo(hx - 6, hy - 3, hx - 2.5, hy - 8, hx, hy - 3.5);
      ctx.bezierCurveTo(hx + 2.5, hy - 8, hx + 6, hy - 3, hx, hy + 3);
      ctx.fillStyle = '#ff8fb0'; ctx.fill();
    }
    ctx.restore();
  },
  /* The bed in the girl's room. It is never an obstacle: running into it only
     climbs her onto it, and landing on it throws her at the ceiling — that is
     the way up into the duct, so it is drawn as a springboard, not furniture. */
  bedBounce(ctx, x, y, w, h) {
    /* legs and springs under the frame */
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 4; i++) {
      const sx = x + w * (0.18 + i * 0.21);
      ctx.beginPath();
      for (let k = 0; k <= 12; k++) {
        const f = k / 12;
        ctx.lineTo(sx + Math.sin(f * Math.PI * 3) * 5, y + h * 0.56 + f * h * 0.34);
      }
      ctx.strokeStyle = '#b07a8e'; ctx.lineWidth = 2.6; ctx.stroke();
    }
    ctx.restore();
    fillRR(ctx, x + w - 13, y - 16, 13, h + 16, 4, '#b07a8e');
    fillRR(ctx, x, y + h * 0.5, w, h * 0.5, 6, '#c98fa8');
    /* the mattress she bounces off */
    fillRR(ctx, x - 3, y, w + 6, h * 0.52, 10, '#ffd8e6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i < 5; i++) fillRR(ctx, x + 6 + i * ((w - 12) / 5), y + 5, (w - 12) / 9, h * 0.42, 4, '#ffb0cf');
    ctx.restore();
    fillRR(ctx, x + w - 52, y - 12, 40, 20, 8, '#fff6f8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    /* two chevrons over it: this one sends her up */
    ctx.save(); ctx.globalAlpha = .85;
    for (let i = 0; i < 2; i++) {
      const cy = y - 24 - i * 15;
      poly(ctx, [[x + w * 0.32, cy], [x + w * 0.44, cy - 13], [x + w * 0.56, cy],
                 [x + w * 0.44, cy - 6]], '#ff8fb0');
    }
    ctx.restore();
  },
  /* The hatch in the ceiling straight over the bed. It is a length of duct
     bolted up under the ceiling with its grille swung open, so the way up is
     something she can see from the far side of the room. */
  ventMouth(ctx, x, y, w, h) {
    hangTo(ctx, x, y, w, '#6f7686', 5);
    /* the duct body */
    fillRR(ctx, x, y, w, h * 0.46, 6, '#9aa3b5');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); rr(ctx, x + 4, y + 4, w - 8, h * 0.46 - 8, 4); ctx.clip();
    ctx.fillStyle = '#7a8394'; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = .5;
    for (let i = 0; i < w; i += 19) fillRR(ctx, x + i + 4, y + 4, 9, h, 3, '#aab3c2');
    ctx.restore();
    /* the open hatch in its underside */
    const hx = x + w * 0.22, hw = w * 0.56, hy = y + h * 0.42, hh = h * 0.5;
    fillRR(ctx, hx - 5, hy, hw + 10, hh, 4, '#5d6470');
    fillRR(ctx, hx, hy + 3, hw, hh - 6, 3, '#20242e');
    ctx.save(); rr(ctx, hx, hy + 3, hw, hh - 6, 3); ctx.clip();
    const g = ctx.createLinearGradient(0, hy, 0, hy + hh);
    g.addColorStop(0, '#4a5364'); g.addColorStop(1, '#1a1e27');
    ctx.fillStyle = g; ctx.fillRect(hx, hy, hw, hh);
    ctx.globalAlpha = .45;
    for (let i = 0; i < hw; i += 15) line(ctx, hx + i, hy + hh, hx + i + 12, hy, '#8d94a3', 2);
    ctx.restore();
    /* the grille, dropped open on its hinge and hanging clear */
    ctx.save(); ctx.translate(hx + hw + 2, hy + hh - 4); ctx.rotate(0.9);
    fillRR(ctx, 0, 0, hw * 0.8, 9, 3, '#8d94a3');
    ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 6; i < hw * 0.8; i += 11) line(ctx, i, 2, i, 8, '#5d6470', 2.4);
    ctx.restore(); ctx.restore();
    /* light falling out of it, so the eye is pulled up there */
    ctx.save(); ctx.globalAlpha = .22;
    poly(ctx, [[hx + 4, hy + hh], [hx + hw - 4, hy + hh],
               [hx + hw + 30, hy + hh + 78], [hx - 30, hy + hh + 78]], '#ffeec2');
    ctx.restore();
  },
  /* where the duct lets go of her again: the louvres pushed apart from inside */
  ventSlit(ctx, x, y, w, h) {
    hangTo(ctx, x, y, w, '#6f7686', 5);
    fillRR(ctx, x, y, w, h * 0.44, 6, '#9aa3b5');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < w; i += 19) fillRR(ctx, x + i + 4, y + 4, 9, h * 0.44 - 8, 3, '#aab3c2');
    ctx.restore();
    const sx0 = x + w * 0.18, sw = w * 0.64, sy0 = y + h * 0.4, sh = h * 0.52;
    fillRR(ctx, sx0 - 5, sy0, sw + 10, sh, 4, '#5d6470');
    fillRR(ctx, sx0, sy0 + 3, sw, sh - 6, 3, '#20242e');
    /* the louvres, bent out of the way */
    ctx.save(); ctx.globalAlpha = .95;
    for (let i = 0; i < 3; i++) {
      const ly = sy0 + 6 + i * (sh - 12) / 3, tilt = (i - 1) * 7;
      fillRR(ctx, sx0 + 3, ly + tilt, sw - 6, 5, 2, '#8d94a3');
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .22;
    poly(ctx, [[sx0 + 4, sy0 + sh], [sx0 + sw - 4, sy0 + sh],
               [sx0 + sw + 34, sy0 + sh + 96], [sx0 - 34, sy0 + sh + 96]], '#ffeec2');
    ctx.restore();
  },
  /* the key itself: a metro tag on a gold key, so it is obvious what it opens */
  keyMetro(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .3;
    circle(ctx, x + w * 0.5, y + h * 0.5, w * 0.55, '#ffe7a8'); ctx.restore();
    /* the shaft */
    fillRR(ctx, x + w * 0.34, y + h * 0.42, w * 0.52, h * 0.16, 3, '#f6c93a');
    ctx.strokeStyle = '#a8791c'; ctx.lineWidth = 1.8; ctx.stroke();
    fillRR(ctx, x + w * 0.66, y + h * 0.56, w * 0.09, h * 0.2, 2, '#f6c93a');
    fillRR(ctx, x + w * 0.8, y + h * 0.56, w * 0.09, h * 0.16, 2, '#f6c93a');
    circle(ctx, x + w * 0.26, y + h * 0.5, w * 0.17, '#f6c93a');
    ctx.strokeStyle = '#a8791c'; ctx.lineWidth = 1.8; ctx.stroke();
    circle(ctx, x + w * 0.26, y + h * 0.5, w * 0.07, '#a8791c');
    /* the roundel tag hanging off it */
    ctx.save(); ctx.globalAlpha = .95;
    circle(ctx, x + w * 0.26, y + h * 0.08, 8.5, '#c9302c');
    circle(ctx, x + w * 0.26, y + h * 0.08, 5, '#f2f4f8');
    fillRR(ctx, x + w * 0.26 - 12, y + h * 0.08 - 3.4, 24, 7, 2, '#1f3b7a');
    ctx.restore();
  },
  plushPile(ctx, x, y, w, h) {
    const cols = ['#ffb0d0', '#b48bff', '#8fd6ff'];
    for (let i = 0; i < 3; i++) {
      const cx = x + w * (0.24 + i * 0.26), cy = y + h * (i === 1 ? 0.4 : 0.66), r = h * 0.3;
      circle(ctx, cx - r * 0.72, cy - r * 0.8, r * 0.42, cols[i]);
      circle(ctx, cx + r * 0.72, cy - r * 0.8, r * 0.42, cols[i]);
      circle(ctx, cx, cy, r, cols[i]);
      circle(ctx, cx - r * 0.32, cy - r * 0.14, 2.6, '#3a2f38');
      circle(ctx, cx + r * 0.32, cy - r * 0.14, 2.6, '#3a2f38');
      fillEll(ctx, cx, cy + r * 0.3, r * 0.3, r * 0.2, '#fff');
    }
  },
  bunting(ctx, x, y, w, h) {
    const cols = ['#ff8fb5', '#ffe07a', '#8fd6ff', '#b48bff'];
    ctx.save(); ctx.globalAlpha = .5;
    line(ctx, x + 3, y + 5, x + 3, 0, '#c2607a', 2.5);
    line(ctx, x + w - 3, y + 5, x + w - 3, 0, '#c2607a', 2.5);
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(x + 3, y + 5);
    ctx.quadraticCurveTo(x + w / 2, y + 26, x + w - 3, y + 5);
    ctx.strokeStyle = '#c2607a'; ctx.lineWidth = 3; ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const f = (i + 0.5) / 6, px = x + w * f;
      const py = y + 5 + Math.sin(Math.PI * f) * 20;
      poly(ctx, [[px - 11, py], [px + 11, py], [px, py + h * 0.42]], cols[i % 4]);
      ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.4; ctx.stroke();
    }
  },
  windowOpen(ctx, x, y, w, h) {
    fillRR(ctx, x - 10, y - 10, w + 20, h + 12, 5, '#e6dccd');
    fillRR(ctx, x, y, w, h, 3, '#8fd6f0');
    ctx.save(); rr(ctx, x, y, w, h, 3); ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#8fd6f0'); g.addColorStop(1, '#d8f0e6');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.translate(x, 0);
    BG.hills(ctx, w, 4000, 40, y + h - 8, '#7fc48f', 16, 62);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .9;
    poly(ctx, [[x + w, y + 6], [x + w + 30, y + 20], [x + w + 30, y + h - 6], [x + w, y + h - 20]], '#f6efe2');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.restore();
    fillRR(ctx, x - 12, y + h - 8, w + 24, 12, 3, '#e6dccd');
    ctx.save(); ctx.globalAlpha = .85;
    ctx.beginPath(); ctx.moveTo(x + 5, y); ctx.quadraticCurveTo(x + 34, y + h * 0.42, x + 12, y + h * 0.82);
    ctx.lineTo(x + 5, y + h * 0.82); ctx.closePath(); ctx.fillStyle = '#ffd8e6'; ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = .95;
    poly(ctx, [[x + w * 0.5 - 12, y + h * 0.5], [x + w * 0.5 + 12, y + h * 0.5], [x + w * 0.5, y + h * 0.5 + 18]], '#f6c93a');
    ctx.restore();
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
  puddleD(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    fillEll(ctx, x + w * 0.5, y + h * 0.62, w * 0.46, h * 0.5, '#4f8ce2');
    ctx.globalAlpha = .3;
    fillEll(ctx, x + w * 0.38, y + h * 0.52, w * 0.18, h * 0.2, '#dff0fb');
    ctx.restore();
  },
  manholeD(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .7;
    fillEll(ctx, x + w * 0.5, y + h * 0.6, w * 0.32, h * 0.5, '#5d6470');
    ctx.globalAlpha = .45;
    for (let i = 1; i < 3; i++) fillEll(ctx, x + w * 0.5, y + h * 0.6, w * (0.32 - i * 0.09), h * (0.5 - i * 0.14), '#828a99');
    ctx.restore();
  },
  drainD(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .6;
    fillRR(ctx, x + w * 0.2, y + h * 0.3, w * 0.6, h * 0.55, 2, '#4a5160');
    ctx.globalAlpha = .8;
    for (let i = 0; i < 4; i++) fillRR(ctx, x + w * 0.24 + i * (w * 0.13), y + h * 0.36, w * 0.06, h * 0.42, 1, '#2a2f3c');
    ctx.restore();
  },
  tactile(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x, y + h * 0.25, w, h * 0.65, 2, '#e0b23a');
    ctx.globalAlpha = .75;
    for (let i = 0; i + 10 < w; i += 11) circle(ctx, x + 6 + i, y + h * 0.58, 2.4, '#a8842c');
    ctx.restore();
  },
  bathMat(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .65;
    fillRR(ctx, x, y + h * 0.15, w, h * 0.8, 5, '#7fc6ea');
    fillRR(ctx, x + 7, y + h * 0.3, w - 14, h * 0.5, 3, '#b6e6ff'); ctx.restore();
  },
  starsDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i < 5; i++) {
      const px = x + 7 + i * ((w - 14) / 4), py = y + h * (i % 2 ? 0.24 : 0.72);
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 2.6 : 6.4;
        if (k) ctx.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r * 0.8);
        else ctx.moveTo(px + Math.cos(a) * r, py + Math.sin(a) * r * 0.8);
      }
      ctx.closePath(); ctx.fillStyle = i % 2 ? '#ffe07a' : '#8fd6ff'; ctx.fill();
    }
    ctx.restore();
  },
  heartsDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 4; i++) {
      const px = x + 9 + i * ((w - 18) / 3), py = y + h * (i % 2 ? 0.32 : 0.74);
      ctx.beginPath(); ctx.moveTo(px, py + 4.5);
      ctx.bezierCurveTo(px - 8, py - 3, px - 3.4, py - 10, px, py - 4.5);
      ctx.bezierCurveTo(px + 3.4, py - 10, px + 8, py - 3, px, py + 4.5);
      ctx.fillStyle = '#ff8fb0'; ctx.fill();
    }
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
    /* a red telephone box: crown, TELEPHONE band, glazing bars */
    fillRR(ctx, x, y + 16, w, h - 16, 4, '#c9302c'); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    fillRR(ctx, x - 3, y + 8, w + 6, 12, 3, '#a8221e');
    fillRR(ctx, x + 4, y, w - 8, 10, 3, '#c9302c');
    ctx.save(); ctx.globalAlpha = .85;
    fillRR(ctx, x + 6, y + 10, w - 12, 9, 2, '#f4ecdc');
    ctx.fillStyle = '#8a1b18'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TELEFONAS', x + w / 2, y + 17); ctx.restore();
    const gy = y + 24, gh = h - 34;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++)
      fillRR(ctx, x + 7 + i * ((w - 6) / 2 - 2), gy + j * (gh / 3), (w - 22) / 2, gh / 3 - 4, 2, '#2b3a4a');
    ctx.save(); ctx.globalAlpha = .28;
    poly(ctx, [[x + 9, gy + gh], [x + 20, gy], [x + 30, gy], [x + 19, gy + gh]], '#dff0fb'); ctx.restore();
    circle(ctx, x + w / 2, y + 4, 3.5, '#f0d05c');
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
  railL(ctx, x, y, w, h, t, pal, seed, o) {
    /* cast-iron area railings — the spikes carry on down to the kerb */
    const fy = o && o.floorY;
    if (fy != null && fy > y + 12) {
      ctx.save(); ctx.globalAlpha = .8;
      for (let i = 0; i < w - 6; i += 26) fillRR(ctx, x + i + 8, y + 10, 6, fy - y - 10, 2, '#37505e');
      fillRR(ctx, x + 2, y + 10, 9, fy - y - 10, 3, '#2f4552');
      fillRR(ctx, x + w - 11, y + 10, 9, fy - y - 10, 3, '#2f4552');
      ctx.restore();
    }
    fillRR(ctx, x - 2, y + 4, w + 4, 9, 4, '#3f5f6f');
    for (let i = 0; i < w - 6; i += 26) {
      poly(ctx, [[x + i + 8, y + 6], [x + i + 11, y - 2], [x + i + 14, y + 6]], '#4f7284');
    }
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x, y + 5, w, 3, 2, '#7fa4b5'); ctx.restore();
  },
  archL(ctx, x, y, w, h, t, pal, seed, o) {
    /* a railway arch: two brick piers carry the span she runs under */
    const fy = o && o.floorY, bh = h * 0.52;
    const brick = (bx, by, bw, bhh) => {
      fillRR(ctx, bx, by, bw, bhh, 4, '#8b7f74');
      ctx.save(); rr(ctx, bx, by, bw, bhh, 4); ctx.clip();
      ctx.globalAlpha = .32; ctx.strokeStyle = '#59504a'; ctx.lineWidth = 1.6;
      for (let j = 0; j < bhh; j += 13)
        for (let i = -30; i < bw + 30; i += 28) ctx.strokeRect(bx + i + ((j / 13) % 2) * 14, by + j, 28, 13);
      ctx.restore();
    };
    if (fy != null && fy > y + bh) {
      ctx.save(); ctx.globalAlpha = .8;
      brick(x - 2, y + bh, 32, fy - y - bh);
      brick(x + w - 30, y + bh, 32, fy - y - bh);
      ctx.restore();
    }
    brick(x - 2, y, w + 4, bh);
    ctx.save(); ctx.globalAlpha = .55;
    ctx.beginPath(); ctx.moveTo(x + 26, y + bh); ctx.quadraticCurveTo(x + w / 2, y + bh - 26, x + w - 26, y + bh);
    ctx.strokeStyle = '#6d6259'; ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
    fillRR(ctx, x - 4, y - 5, w + 8, 7, 2, '#736860');
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
  boxM: PROPS.crate, coneA: PROPS.cone, bagP: PROPS.bagB, bagA: PROPS.bagB,
  rackB: PROPS.railM, awningL: PROPS.awning, shelfH: PROPS.shelfM,
  plantY: PROPS.flowers, binM: PROPS.bin, toyboxG: PROPS.toybox
});

/* how wide each prop wants to be — anything laid out longer than this repeats
   the drawing instead of stretching it into an unrecognisable smear */
const PROP_NATURAL = {
  crate: 104, crateL: 104, car: 190, busL: 235, sofa: 205, bed: 235, dresser: 150,
  stairsH: 175, benchY: 165, benchP: 165, stump: 105, logpile: 135, rock: 115, rockP: 115,
  booth: 78, escalator: 235, shelfM: 195, shelfH: 195, beltA: 235, seatP: 175, chairsA: 185,
  galley: 115, seatB: 145, awning: 175, awningL: 175, treeLedge: 205, branchP: 205,
  boxM: 104, suitcase: 82, cart: 96, railM: 185, rackB: 185,
  /* the long hanging pieces — these were the worst offenders */
  vent: 150, hedge: 175, hedgeP: 175, scaffold: 185, scannerA: 155, curtainP: 130,
  archL: 175, metroArch: 165, showerCurtainH: 150, table: 165, pipeS: 165,
  railL: 175, handrail: 175, trainRail: 175, towelRail: 165, maskDrop: 170,
  screenA: 150, metroMap: 150, ropes: 130, branchY: 195, rootArch: 195,
  trainSeat: 165, trainRack: 175, bunkBed: 215, bedGirl: 215, deskH: 165,
  bathtub: 175, metroBench: 165, bunting: 190, tread: 400
};

/* the size an object naturally *is*, used for anything standing on the floor.
   Sizing a hurdle at random is what made half of them unreadable: a bin drawn
   96 wide is a skip, a wheelbarrow drawn 46 wide is a smudge. */
const PROP_SIZE = {
  toybox: [74, 54], books: [48, 62], chair: [56, 76], basket: [56, 50], laundry: [66, 50],
  plantH: [54, 74], rock: [78, 52], bushY: [72, 60], logpile: [88, 48], bucket: [46, 46],
  wheelbarrow: [96, 58], fenceY: [104, 56], stump: [66, 46],
  cone: [46, 58], bin: [56, 68], crate: [66, 58], signFallen: [66, 62], hydrant: [42, 60],
  barrier: [108, 54], booth: [60, 94], postbox: [46, 82], crateL: [66, 58], barrierL: [108, 52],
  rockP: [78, 52], bushP: [72, 60], logP: [88, 48], benchP: [118, 56], roots: [86, 44],
  cart: [92, 68], boxM: [66, 58], goods: [72, 58], wetsign: [54, 58], plantM: [56, 72],
  seatB: [104, 62], bagB: [54, 46], bagP: [54, 46], bagA: [54, 46], coneA: [46, 58],
  suitcase: [56, 64], trolley: [90, 62], ropes: [116, 64], cartP: [64, 68], galley: [84, 88],
  turnstile: [58, 70], ticketMachine: [54, 86], metroBench: [124, 54], binM: [56, 68],
  trainSeat: [126, 54], toyRobot: [58, 82], blocks: [70, 62], deskH: [110, 64],
  toiletH: [54, 72], sinkH: [56, 56], dollhouse: [72, 78], vanity: [70, 80],
  plushPile: [88, 56], bunkBed: [150, 92], bedGirl: [150, 74], bathtub: [140, 62]
};
/* the natural height, or a sane default when a prop has no entry */
function propSize(id) { return PROP_SIZE[id] || [60, 52]; }

function drawProp(ctx, id, x, y, w, h, t, pal, seed, o) {
  (PROPS[id] || PROPS._default)(ctx, x, y, w, h, t || 0, pal || {}, seed || 0, o);
}
/* draw a prop across a wide platform, repeating it at a sane size */
function drawPropTiled(ctx, id, x, y, w, h, t, pal, seed, o) {
  const nat = PROP_NATURAL[id] || 0;
  if (!nat || w <= nat * 1.45) { drawProp(ctx, id, x, y, w, h, t, pal, seed, o); return; }
  const n = Math.max(1, Math.round(w / nat));
  const tw = w / n;
  for (let i = 0; i < n; i++) drawProp(ctx, id, x + i * tw, y, tw + 0.6, h, t, pal, (seed || 0) + i * 37, o);
}
