'use strict';
/* ---------------------------------------------------------------
   props2.js — everything level 2 is built out of: the hotel, the
   beach, the pier, the sea floor and the fox cave.

   Same contract as props.js: (ctx, x, y, w, h, t, pal, seed, o)
   with (x, y) the top-left of the object's box and y growing down.
   `o.floorY` is the screen y of the floor under the object, which is
   what legsTo()/hangTo() need to hold a hanging thing up.
----------------------------------------------------------------*/

/* gold leaf: the hotel's one recurring flourish */
function goldEdge(ctx, x, y, w, h, r) {
  rr(ctx, x, y, w, h, r);
  ctx.strokeStyle = '#d8b25e'; ctx.lineWidth = 2.2; ctx.stroke();
}
/* a swag of fabric hanging off a rail — used by every drape in the hotel */
function swag(ctx, x, y, w, h, col, col2, n) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    ctx.quadraticCurveTo(x + w * (f + 0.5 / n), y + h * (0.55 + 0.3 * Math.sin(f * 9)),
      x + w * (f + 1 / n), y + h * 0.28);
  }
  ctx.lineTo(x + w, y); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.globalAlpha = .35;
  for (let i = 1; i < n; i++) line(ctx, x + w * (i / n), y + 2, x + w * (i / n), y + h * 0.5, col2, 2);
  ctx.restore();
}

Object.assign(PROPS, {

  /* ==================== HOTEL: THE SUITE ==================== */
  trunkLux(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 5, '#7a5a3a', '#5f4429');
    fillRR(ctx, x, y + h * 0.28, w, 9, 2, '#3f2d1c');
    ctx.save(); ctx.globalAlpha = .9;
    [x + 5, x + w - 13].forEach(bx => fillRR(ctx, bx, y + 2, 8, h - 4, 2, '#d8b25e'));
    ctx.restore();
    fillRR(ctx, x + w * 0.5 - 9, y + h * 0.26, 18, 15, 3, '#d8b25e');
    circle(ctx, x + w * 0.5, y + h * 0.34, 3, '#6b4a12');
  },
  poufLux(ctx, x, y, w, h) {
    fillEll(ctx, x + w / 2, y + h * 0.42, w * 0.5, h * 0.42, '#8a3f5c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i < 5; i++) {
      const a = -0.5 + i * 0.5;
      line(ctx, x + w / 2, y + h * 0.1, x + w / 2 + Math.cos(a) * w * 0.46, y + h * 0.5 + Math.sin(a) * 8, '#5f2540', 2);
    }
    ctx.restore();
    circle(ctx, x + w / 2, y + h * 0.14, 5, '#d8b25e');
    [0.24, 0.76].forEach(f => fillRR(ctx, x + w * f - 4, y + h * 0.74, 8, h * 0.26, 3, '#d8b25e'));
  },
  lampLux(ctx, x, y, w, h) {
    line(ctx, x + w / 2, y + h * 0.32, x + w / 2, y + h - 6, '#d8b25e', 5);
    fillEll(ctx, x + w / 2, y + h - 4, w * 0.34, 7, '#c9a24a');
    ctx.beginPath();
    ctx.moveTo(x + w * 0.16, y + h * 0.32); ctx.lineTo(x + w * 0.84, y + h * 0.32);
    ctx.lineTo(x + w * 0.72, y + 4); ctx.lineTo(x + w * 0.28, y + 4); ctx.closePath();
    ctx.fillStyle = '#f6ead0'; ctx.fill(); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    fillEll(ctx, x + w / 2, y + h * 0.34, w * 0.5, 14, '#ffe7a8'); ctx.restore();
  },
  roomCart(ctx, x, y, w, h) {
    fillRR(ctx, x + 4, y + h * 0.24, w - 8, 11, 3, '#f2ece0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    swag(ctx, x + 6, y + h * 0.34, w - 12, h * 0.5, '#f6f1e6', '#d8d0c0', 4);
    fillRR(ctx, x + 8, y + h * 0.78, w - 16, 8, 3, '#c9c2b4');
    /* the silver cloche and a flute of something */
    fillEll(ctx, x + w * 0.36, y + h * 0.24, w * 0.2, h * 0.16, '#cfd6de');
    ctx.save(); ctx.globalAlpha = .55; fillEll(ctx, x + w * 0.31, y + h * 0.19, 6, 3, '#fff'); ctx.restore();
    circle(ctx, x + w * 0.36, y + h * 0.06, 3, '#d8b25e');
    line(ctx, x + w * 0.7, y + h * 0.24, x + w * 0.7, y + h * 0.04, '#e8f0f4', 3);
    poly(ctx, [[x + w * 0.64, y + h * 0.04], [x + w * 0.76, y + h * 0.04], [x + w * 0.7, y - 2]], '#ffe7a8');
    wheel(ctx, x + 14, y + h - 6, 6, '#3f3a33', '#8d94a3');
    wheel(ctx, x + w - 14, y + h - 6, 6, '#3f3a33', '#8d94a3');
  },
  champagne(ctx, x, y, w, h) {
    line(ctx, x + w / 2, y + h * 0.42, x + w / 2, y + h - 5, '#c9a24a', 5);
    fillEll(ctx, x + w / 2, y + h - 3, w * 0.4, 6, '#c9a24a');
    ctx.beginPath();
    ctx.moveTo(x + w * 0.14, y + h * 0.14); ctx.lineTo(x + w * 0.86, y + h * 0.14);
    ctx.lineTo(x + w * 0.74, y + h * 0.46); ctx.lineTo(x + w * 0.26, y + h * 0.46); ctx.closePath();
    ctx.fillStyle = '#d5dde6'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + w * 0.2, y + h * 0.18, 6, h * 0.24, 3, '#fff'); ctx.restore();
    /* the bottle leaning out of the ice */
    ctx.save(); ctx.translate(x + w * 0.55, y + h * 0.16); ctx.rotate(0.24);
    fillRR(ctx, -7, -h * 0.42, 14, h * 0.44, 5, '#2f4a35');
    fillRR(ctx, -4, -h * 0.56, 8, h * 0.16, 3, '#2f4a35');
    fillRR(ctx, -4.5, -h * 0.58, 9, 7, 2, '#d8b25e');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .8;
    circle(ctx, x + w * 0.32, y + h * 0.16, 5, '#f2f8fc');
    circle(ctx, x + w * 0.72, y + h * 0.18, 4, '#f2f8fc'); ctx.restore();
  },
  vaseTall(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w * 0.34, y + h * 0.34);
    ctx.quadraticCurveTo(x + w * 0.02, y + h * 0.62, x + w * 0.24, y + h);
    ctx.lineTo(x + w * 0.76, y + h);
    ctx.quadraticCurveTo(x + w * 0.98, y + h * 0.62, x + w * 0.66, y + h * 0.34);
    ctx.closePath();
    ctx.fillStyle = '#eef2f6'; ctx.fill(); ctx.strokeStyle = '#b8c2cc'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 3; i++) circle(ctx, x + w * (0.34 + i * 0.16), y + h * 0.72, 5, '#8fbcd6');
    ctx.restore();
    /* lilies */
    [[-0.5, 0.9], [0, 1], [0.5, 0.86]].forEach((s, i) => {
      const tx = x + w / 2 + s[0] * w * 0.3, ty = y + h * 0.34 - h * 0.3 * s[1];
      line(ctx, x + w / 2, y + h * 0.34, tx, ty, '#4caf6d', 3);
      for (let k = 0; k < 5; k++) {
        const a = k * (TAU / 5) + i;
        fillEll(ctx, tx + Math.cos(a) * 6, ty + Math.sin(a) * 6, 5.5, 3.6, i % 2 ? '#ffd8e6' : '#fff6f8', a);
      }
      circle(ctx, tx, ty, 3, '#f6c93a');
    });
  },
  housekeeping(ctx, x, y, w, h) {
    fillRR(ctx, x + 3, y + h * 0.3, w - 6, h * 0.56, 5, '#c9ced9');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x + 3, y + h * 0.3, w - 6, 9, 4, '#e2e7ee');
    /* folded towels in a stack, and a bin bag hanging off the end */
    ['#f6f1e6', '#e8e2d4', '#f6f1e6'].forEach((c, i) =>
      fillRR(ctx, x + 12, y + h * 0.3 - 9 - i * 9, w * 0.4, 8, 3, c));
    ctx.save(); ctx.globalAlpha = .8;
    fillEll(ctx, x + w - 16, y + h * 0.62, 13, h * 0.28, '#8fa3b8'); ctx.restore();
    [[0.3, '#8fd6ff'], [0.44, '#ffd8e6'], [0.58, '#a6e88f']].forEach(b => {
      fillRR(ctx, x + w * b[0], y + h * 0.14, 9, h * 0.18, 2, b[1]);
      fillRR(ctx, x + w * b[0] + 2.5, y + h * 0.1, 4, 5, 1, '#6f7686');
    });
    wheel(ctx, x + 14, y + h - 6, 6, '#3f3a33', '#8d94a3');
    wheel(ctx, x + w - 14, y + h - 6, 6, '#3f3a33', '#8d94a3');
  },
  suitcaseStack(ctx, x, y, w, h) {
    const n = 3;
    for (let i = 0; i < n; i++) {
      const bh = h / n, by = y + h - (i + 1) * bh, iw = w - i * 10;
      const bx = x + i * 5;
      boxy(ctx, bx, by + 2, iw, bh - 3, 5, ['#c9a24a', '#8a5a3a', '#5f4429'][i], ['#a8791c', '#6f4429', '#4a3320'][i]);
      ctx.save(); ctx.globalAlpha = .55;
      line(ctx, bx + 4, by + bh * 0.4, bx + iw - 4, by + bh * 0.4, '#2f2418', 2.4); ctx.restore();
      fillRR(ctx, bx + iw * 0.4, by - 1, iw * 0.2, 5, 2, '#3f3325');
    }
    ctx.save(); ctx.globalAlpha = .9;
    fillRR(ctx, x + w * 0.5 - 12, y + 2, 24, 9, 3, '#f2ece0');
    ctx.restore();
  },
  palmPot(ctx, x, y, w, h) {
    const cx = x + w / 2, base = y + h * 0.62;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 0.5 + (i - 3) * 0.42;
      const ex = cx + Math.cos(a) * w * 0.55, ey = base + Math.sin(a) * h * 0.62;
      ctx.beginPath(); ctx.moveTo(cx, base);
      ctx.quadraticCurveTo(cx + Math.cos(a) * w * 0.34, base + Math.sin(a) * h * 0.5 - 6, ex, ey);
      ctx.strokeStyle = i % 2 ? '#3f9c5c' : '#54b86c'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
      ctx.save(); ctx.globalAlpha = .55;
      ctx.strokeStyle = '#2f7546'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, base); ctx.quadraticCurveTo(cx + Math.cos(a) * w * 0.34, base + Math.sin(a) * h * 0.5 - 6, ex, ey); ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x + w * 0.24, base); ctx.lineTo(x + w * 0.76, base);
    ctx.lineTo(x + w * 0.68, y + h); ctx.lineTo(x + w * 0.32, y + h); ctx.closePath();
    ctx.fillStyle = '#e8e2d4'; ctx.fill(); goldEdge(ctx, x + w * 0.24, base - 2, w * 0.52, 8, 3);
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x + w * 0.24, base); ctx.lineTo(x + w * 0.32, y + h);
    ctx.lineTo(x + w * 0.68, y + h); ctx.lineTo(x + w * 0.76, base); ctx.stroke();
  },
  velvetRope(ctx, x, y, w, h) {
    [x + 10, x + w - 10].forEach(px => {
      fillEll(ctx, px, y + h - 4, 13, 6, '#c9a24a');
      fillRR(ctx, px - 4, y + h * 0.16, 8, h * 0.82, 3, '#d8b25e');
      circle(ctx, px, y + h * 0.12, 7, '#f0d47a');
      ctx.save(); ctx.globalAlpha = .6; circle(ctx, px - 2, y + h * 0.09, 2.4, '#fff'); ctx.restore();
    });
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h * 0.2);
    ctx.quadraticCurveTo(x + w / 2, y + h * 0.72, x + w - 10, y + h * 0.2);
    ctx.strokeStyle = '#8a1f3a'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#b83f5c'; ctx.lineWidth = 4; ctx.stroke();
  },
  armchairLux(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.06, y, w * 0.88, h * 0.9, 14, '#3f5f8a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    fillRR(ctx, x, y + h * 0.32, w * 0.24, h * 0.56, 10, '#4f719c');
    fillRR(ctx, x + w * 0.76, y + h * 0.32, w * 0.24, h * 0.56, 10, '#4f719c');
    fillRR(ctx, x + w * 0.2, y + h * 0.44, w * 0.6, h * 0.3, 8, '#6b8fbc');
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 3; i++) circle(ctx, x + w * (0.3 + i * 0.2), y + h * 0.2, 3, '#1f3350');
    ctx.restore();
    [0.16, 0.84].forEach(f => fillRR(ctx, x + w * f - 4, y + h * 0.88, 8, h * 0.14, 2, '#c9a24a'));
  },
  bedLux(ctx, x, y, w, h) {
    fillRR(ctx, x + 4, y + h * 0.3, w - 8, h * 0.72, 7, '#7a5a3a');
    fillRR(ctx, x, y + h * 0.22, w, h * 0.42, 8, '#f2ece0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    /* the runner across the foot of the bed and two fat pillows */
    fillRR(ctx, x + w * 0.42, y + h * 0.24, w * 0.5, h * 0.34, 5, '#8a3f5c');
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 4; i++) line(ctx, x + w * (0.46 + i * 0.11), y + h * 0.26, x + w * (0.46 + i * 0.11), y + h * 0.54, '#5f2540', 2);
    ctx.restore();
    fillRR(ctx, x + 8, y + h * 0.12, w * 0.19, h * 0.22, 9, '#fff9f0');
    fillRR(ctx, x + w * 0.22, y + h * 0.16, w * 0.17, h * 0.2, 9, '#fff9f0');
    fillRR(ctx, x, y, 12, h, 4, '#5f4429');
    ctx.save(); ctx.globalAlpha = .8; fillRR(ctx, x + 2, y + 3, 8, h * 0.5, 3, '#d8b25e'); ctx.restore();
  },
  sofaLux(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * 0.18, w, h * 0.86, 15, '#5c2f46');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    fillRR(ctx, x + 5, y, w - 10, h * 0.5, 13, '#7a3f5c');
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++)
      circle(ctx, x + 20 + i * ((w - 40) / 4), y + h * 0.14 + j * h * 0.2, 3, '#3f1f30');
    ctx.restore();
    fillRR(ctx, x - 2, y + h * 0.16, 18, h * 0.62, 9, '#8a4a68');
    fillRR(ctx, x + w - 16, y + h * 0.16, 18, h * 0.62, 9, '#8a4a68');
    ctx.save(); ctx.globalAlpha = .85;
    fillRR(ctx, x + 6, y + h * 0.5, w - 12, 6, 3, '#d8b25e'); ctx.restore();
  },
  consoleLux(ctx, x, y, w, h, t, pal, seed, o) {
    /* a marble console she can stand on: legs to the floor, gilt apron */
    legsTo(ctx, x, y, w, o, '#c9a24a', 9, 14);
    fillRR(ctx, x, y, w, 13, 3, '#f2ece0');
    ctx.strokeStyle = '#c9bda8'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let i = 0; i < w; i += 37) line(ctx, x + i + 6, y + 3, x + i + 20, y + 10, '#b8ab94', 1.8);
    ctx.restore();
    fillRR(ctx, x + 6, y + 13, w - 12, 7, 3, '#d8b25e');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + 4, y + 1, w - 8, 3, 1.5, '#fff'); ctx.restore();
  },
  receptionDesk(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + 20) {
      ctx.save(); ctx.globalAlpha = .8;
      fillRR(ctx, x + 6, y + 16, w - 12, fy - y - 16, 4, '#5c4326');
      ctx.globalAlpha = .35;
      for (let i = 0; i < w; i += 44) line(ctx, x + i + 10, y + 22, x + i + 10, fy - 4, '#3f2d1c', 2);
      ctx.restore();
    }
    fillRR(ctx, x - 3, y, w + 6, 16, 4, '#3f2d1c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .7;
    fillRR(ctx, x - 1, y + 1, w + 2, 5, 2, '#d8b25e'); ctx.restore();
    /* a bell and a ledger on the counter */
    fillEll(ctx, x + w * 0.24, y, 11, 9, '#d8b25e');
    circle(ctx, x + w * 0.24, y - 10, 3, '#f0d47a');
    fillRR(ctx, x + w * 0.62, y - 6, 34, 7, 2, '#f6f1e6');
  },
  chandelierLow(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#c9a24a', 3);
    const cx = x + w / 2;
    ctx.save(); ctx.globalAlpha = .22;
    const g = ctx.createRadialGradient(cx, y + h * 0.5, 6, cx, y + h * 0.5, w * 0.8);
    g.addColorStop(0, '#ffe7a8'); g.addColorStop(1, 'rgba(255,231,168,0)');
    ctx.fillStyle = g; ctx.fillRect(x - w * 0.4, y - 10, w * 1.8, h + 60); ctx.restore();
    fillRR(ctx, x + w * 0.44, y, w * 0.12, h * 0.24, 3, '#c9a24a');
    for (let ring = 0; ring < 2; ring++) {
      const ry = y + h * (0.34 + ring * 0.3), rw = w * (0.46 - ring * 0.12);
      ctx.beginPath(); ctx.ellipse(cx, ry, rw, 7, 0, 0, TAU);
      ctx.strokeStyle = '#d8b25e'; ctx.lineWidth = 4; ctx.stroke();
      const n = 6 - ring;
      for (let i = 0; i < n; i++) {
        const px = cx - rw + (2 * rw) * (i / (n - 1 || 1));
        fillRR(ctx, px - 4, ry - 16, 8, 14, 3, '#fff6d8');
        ctx.save(); ctx.globalAlpha = .6; circle(ctx, px, ry - 20, 4, '#ffe7a8'); ctx.restore();
        /* the crystal drops */
        poly(ctx, [[px - 3, ry + 4], [px + 3, ry + 4], [px, ry + 15]], 'rgba(230,244,255,.8)');
      }
    }
    circle(ctx, cx, y + h * 0.9, 6, '#d8b25e');
  },
  corridorArch(ctx, x, y, w, h, t, pal, seed, o) {
    /* a moulded arch across the corridor with a valance hanging off it */
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .7;
      fillRR(ctx, x - 2, y + h * 0.4, 22, fy - y - h * 0.4, 4, '#e2d7c2');
      fillRR(ctx, x + w - 20, y + h * 0.4, 22, fy - y - h * 0.4, 4, '#e2d7c2');
      ctx.globalAlpha = .5;
      fillRR(ctx, x + 2, y + h * 0.44, 6, fy - y - h * 0.44, 3, '#d8b25e');
      fillRR(ctx, x + w - 8, y + h * 0.44, 6, fy - y - h * 0.44, 3, '#d8b25e');
      ctx.restore();
    }
    fillRR(ctx, x - 4, y, w + 8, 15, 4, '#e8ddc8');
    ctx.strokeStyle = '#c9bda8'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .85;
    fillRR(ctx, x - 2, y + 12, w + 4, 5, 2, '#d8b25e'); ctx.restore();
    swag(ctx, x, y + 16, w, h * 0.46, '#8a3f5c', '#5f2540', 4);
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i * 30 < w; i++) circle(ctx, x + 15 + i * 30, y + 16 + h * 0.3, 4, '#d8b25e');
    ctx.restore();
  },
  curtainLux(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#c9a24a', 4);
    fillRR(ctx, x - 6, y, w + 12, 9, 4, '#d8b25e');
    circle(ctx, x - 6, y + 4, 6, '#f0d47a'); circle(ctx, x + w + 6, y + 4, 6, '#f0d47a');
    ctx.save(); ctx.globalAlpha = .95;
    for (let i = 0; i * 22 < w; i++) {
      const px = x + i * 22;
      ctx.beginPath();
      ctx.moveTo(px, y + 8);
      ctx.quadraticCurveTo(px + 6 + Math.sin(i * 1.7) * 3, y + h * 0.6, px + 2, y + h);
      ctx.lineTo(px + 22, y + h);
      ctx.quadraticCurveTo(px + 17, y + h * 0.6, px + 22, y + 8);
      ctx.closePath();
      ctx.fillStyle = i % 2 ? '#8a3f5c' : '#7a3350'; ctx.fill();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i * 22 < w; i++) line(ctx, x + i * 22 + 11, y + 10, x + i * 22 + 13, y + h - 4, '#5f2540', 2);
    ctx.restore();
  },
  lobbyArch(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .8;
      [x - 4, x + w - 26].forEach(px => {
        fillRR(ctx, px, y + h * 0.35, 30, fy - y - h * 0.35, 5, '#efe6d4');
        ctx.save(); ctx.globalAlpha = .4;
        for (let k = 0; k < 4; k++) line(ctx, px + 6 + k * 6, y + h * 0.4, px + 6 + k * 6, fy - 4, '#c9bda8', 2);
        ctx.restore();
        fillRR(ctx, px - 3, fy - 14, 36, 14, 3, '#e2d7c2');
        fillRR(ctx, px - 3, y + h * 0.32, 36, 12, 3, '#e2d7c2');
      });
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x - 6, y + h * 0.62); ctx.quadraticCurveTo(x + w / 2, y - h * 0.28, x + w + 6, y + h * 0.62);
    ctx.quadraticCurveTo(x + w / 2, y + h * 0.06, x - 6, y + h * 0.62);
    ctx.closePath();
    ctx.fillStyle = '#efe6d4'; ctx.fill();
    ctx.strokeStyle = '#c9bda8'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.6); ctx.quadraticCurveTo(x + w / 2, y - h * 0.14, x + w, y + h * 0.6);
    ctx.strokeStyle = '#d8b25e'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
    circle(ctx, x + w / 2, y + h * 0.02, 7, '#d8b25e');
  },
  doorGold(ctx, x, y, w, h) {
    fillRR(ctx, x - 9, y - 7, w + 18, h + 7, 6, '#d8b25e');
    fillRR(ctx, x, y, w, h, 4, '#5f3f26');
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x + 10, y + 12, w - 20, h * 0.36, 4, '#7a5434');
    fillRR(ctx, x + 10, y + h * 0.54, w - 20, h * 0.34, 4, '#7a5434');
    ctx.restore();
    goldEdge(ctx, x + 10, y + 12, w - 20, h * 0.36, 4);
    goldEdge(ctx, x + 10, y + h * 0.54, w - 20, h * 0.34, 4);
    circle(ctx, x + w - 15, y + h * 0.5, 5.5, '#f0d47a');
    fillRR(ctx, x + w * 0.3, y + 4, w * 0.4, 12, 3, '#d8b25e');
    ctx.fillStyle = '#3f2d1c'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('204', x + w * 0.5, y + 13);
  },
  doorGlass(ctx, x, y, w, h) {
    fillRR(ctx, x - 7, y - 6, w + 14, h + 6, 5, '#c9a24a');
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x, y, w, h, 3, '#cfe6f0'); ctx.restore();
    fillRR(ctx, x + w / 2 - 3, y, 6, h, 0, '#d8b25e');
    ctx.save(); ctx.globalAlpha = .45;
    poly(ctx, [[x + 8, y + h], [x + w * 0.42, y], [x + w * 0.6, y], [x + 26, y + h]], '#ffffff');
    ctx.restore();
    fillRR(ctx, x + w * 0.36, y + h * 0.46, 8, 30, 4, '#d8b25e');
    fillRR(ctx, x + w * 0.58, y + h * 0.46, 8, 30, 4, '#d8b25e');
  },
  gateHotel(ctx, x, y, w, h) {
    /* the way out under the porte-cochère */
    fillRR(ctx, x - 10, y - 10, w + 20, 18, 5, '#e8ddc8');
    ctx.save(); ctx.globalAlpha = .9;
    fillRR(ctx, x - 6, y + 6, w + 12, 6, 3, '#d8b25e'); ctx.restore();
    [x - 6, x + w - 12].forEach(px => {
      fillRR(ctx, px, y + 12, 18, h - 12, 4, '#efe6d4');
      ctx.save(); ctx.globalAlpha = .35;
      for (let k = 0; k < 3; k++) line(ctx, px + 4 + k * 5, y + 16, px + 4 + k * 5, y + h - 4, '#c9bda8', 2); ctx.restore();
    });
    ctx.save(); ctx.globalAlpha = .5;
    const g = ctx.createLinearGradient(0, y + 12, 0, y + h);
    g.addColorStop(0, '#9fd6ea'); g.addColorStop(1, '#e6f4f8');
    ctx.fillStyle = g; ctx.fillRect(x + 14, y + 12, w - 26, h - 12); ctx.restore();
    ctx.fillStyle = '#d8b25e'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('GRAND HOTEL', x + w * 0.5, y + 3);
  },
  rugLux(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 4, '#7a2f46');
    ctx.save(); ctx.globalAlpha = .6;
    fillRR(ctx, x + 5, y + 2, w - 10, h - 4, 3, '#a8415f');
    for (let i = 0; i * 26 < w - 12; i++) {
      const px = x + 12 + i * 26;
      poly(ctx, [[px, y + h * 0.5], [px + 7, y + 2], [px + 14, y + h * 0.5], [px + 7, y + h - 2]], '#d8b25e');
    }
    ctx.restore();
  },
  marbleShine(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    fillEll(ctx, x + w * 0.5, y + h * 0.6, w * 0.42, h * 0.4, '#ffffff');
    ctx.globalAlpha = .3;
    for (let i = 0; i < 3; i++) line(ctx, x + w * 0.2 + i * 18, y + h, x + w * 0.34 + i * 18, y + 2, '#c9bda8', 1.6);
    ctx.restore();
  },

  /* ==================== HOTEL: THE POOL ==================== */
  sunLounger(ctx, x, y, w, h) {
    ctx.save();
    /* the raised back, then the flat part she can stand on */
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h * 0.5); ctx.lineTo(x + w * 0.34, y);
    ctx.lineTo(x + w * 0.44, y + h * 0.16); ctx.lineTo(x + w * 0.16, y + h * 0.62); ctx.closePath();
    ctx.fillStyle = '#f2ece0'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.restore();
    fillRR(ctx, x + w * 0.14, y + h * 0.48, w * 0.82, 13, 5, '#f2ece0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i * 20 < w * 0.8; i++) fillRR(ctx, x + w * 0.16 + i * 20, y + h * 0.49, 9, 11, 3, '#6fc9d6');
    ctx.restore();
    /* a folded towel over the foot */
    fillRR(ctx, x + w * 0.66, y + h * 0.36, w * 0.24, 13, 3, '#8fd6ff');
    [0.22, 0.86].forEach(f => line(ctx, x + w * f, y + h * 0.6, x + w * f, y + h, '#c9ced9', 4));
    fillEll(ctx, x + w * 0.5, y + h - 2, w * 0.42, 4, 'rgba(0,0,0,.12)');
  },
  poolFloat(ctx, x, y, w, h, t) {
    /* an inflatable flamingo ring */
    const cx = x + w * 0.46, cy = y + h * 0.66, r = Math.min(w * 0.36, h * 0.34);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
    ctx.strokeStyle = '#ff8fb0'; ctx.lineWidth = r * 0.62; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.2, r * 0.9, Math.PI * 1.1, Math.PI * 1.7);
    ctx.strokeStyle = '#ffd0e0'; ctx.lineWidth = r * 0.22; ctx.stroke(); ctx.restore();
    /* neck and head */
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.5, cy - r * 0.5);
    ctx.quadraticCurveTo(x + w * 0.96, y + h * 0.1, x + w * 0.74, y + h * 0.08);
    ctx.strokeStyle = '#ff8fb0'; ctx.lineWidth = r * 0.36; ctx.lineCap = 'round'; ctx.stroke();
    circle(ctx, x + w * 0.74, y + h * 0.08, r * 0.28, '#ff8fb0');
    poly(ctx, [[x + w * 0.68, y + h * 0.06], [x + w * 0.56, y + h * 0.13], [x + w * 0.69, y + h * 0.15]], '#f2762c');
    circle(ctx, x + w * 0.77, y + h * 0.05, 2.2, '#3a2334');
  },
  towelStack(ctx, x, y, w, h) {
    fillRR(ctx, x + 4, y + h * 0.78, w - 8, h * 0.22, 3, '#c9b48f');
    const cols = ['#ffffff', '#eaf4fb', '#ffffff', '#dff0fb'];
    for (let i = 0; i < 4; i++) {
      const by = y + h * 0.74 - i * (h * 0.17);
      fillRR(ctx, x + 6 + (i % 2) * 3, by, w - 14, h * 0.16, 6, cols[i]);
      ctx.strokeStyle = 'rgba(120,140,160,.4)'; ctx.lineWidth = 1.6; ctx.stroke();
    }
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * 0.3, y + h * 0.04, w * 0.36, 5, 2, '#6fc9d6'); ctx.restore();
  },
  parasol(ctx, x, y, w, h, t, pal, seed, o) {
    /* the pole is what makes it stand — and it is set off to one side so she
       can pass under the canopy without the pole ever being in her lane */
    const fy = o && o.floorY;
    const px = x + w * 0.5;
    if (fy != null && fy > y) {
      ctx.save(); ctx.globalAlpha = .6;
      fillRR(ctx, px - 4, y + 10, 8, fy - y - 10, 3, '#c9a24a');
      fillEll(ctx, px, fy - 2, 18, 6, '#b08f4a'); ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 22);
    for (let i = 0; i <= 8; i++) {
      const f = i / 8;
      ctx.quadraticCurveTo(x - 8 + (w + 16) * (f + 0.06), y + 30, x - 8 + (w + 16) * (f + 0.125), y + 22);
    }
    ctx.lineTo(x + w * 0.5, y - 4); ctx.closePath();
    ctx.save(); ctx.clip();
    for (let i = 0; i * 22 < w + 20; i++) {
      ctx.fillStyle = i % 2 ? '#f2ece0' : '#3f9cc4';
      ctx.fillRect(x - 8 + i * 22, y - 6, 22, 42);
    }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    circle(ctx, x + w * 0.5, y - 6, 5, '#d8b25e');
  },
  cabana(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .85;
      [x - 4, x + w - 24].forEach(px => {
        fillRR(ctx, px, y + h * 0.3, 28, fy - y - h * 0.3, 5, '#f2ece0');
        ctx.save(); ctx.globalAlpha = .5;
        for (let k = 0; k * 16 < fy - y; k++) fillRR(ctx, px + 3, y + h * 0.34 + k * 16, 22, 8, 3, '#8fd6ff');
        ctx.restore();
        fillRR(ctx, px - 3, y + h * 0.28, 34, 9, 3, '#c9a24a');
      });
      ctx.restore();
    }
    fillRR(ctx, x - 6, y, w + 12, 13, 4, '#c9a24a');
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x - 6, y + 12); ctx.lineTo(x + w + 6, y + 12);
    ctx.lineTo(x + w, y + h * 0.5); ctx.lineTo(x, y + h * 0.5); ctx.closePath();
    ctx.fillStyle = '#f2ece0'; ctx.fill(); ctx.clip();
    for (let i = 0; i * 26 < w + 14; i++) { ctx.fillStyle = '#3f9cc4'; ctx.fillRect(x - 6 + i * 26, y, 13, h); }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x - 6, y + 12); ctx.lineTo(x + w + 6, y + 12); ctx.stroke();
    for (let i = 0; i * 26 <= w; i++) circle(ctx, x + 6 + i * 26, y + h * 0.5, 5, '#e8e2d4');
  },
  poolBar(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + 18) {
      ctx.save(); ctx.globalAlpha = .82;
      fillRR(ctx, x + 8, y + 15, w - 16, fy - y - 15, 4, '#b08655');
      ctx.globalAlpha = .35;
      for (let i = 0; i * 26 < w; i++) line(ctx, x + 14 + i * 26, y + 20, x + 14 + i * 26, fy - 4, '#7a5a3a', 2);
      ctx.restore();
    }
    fillRR(ctx, x - 4, y, w + 8, 15, 4, '#d8b25e');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x - 2, y + 2, w + 4, 4, 2, '#fff6d8'); ctx.restore();
    /* two tall glasses with paper umbrellas */
    [0.24, 0.7].forEach((f, i) => {
      const gx = x + w * f;
      fillRR(ctx, gx - 6, y - 22, 12, 22, 3, i ? '#ffb0a0' : '#8fd6ff');
      ctx.save(); ctx.globalAlpha = .55; fillRR(ctx, gx - 4, y - 20, 4, 16, 2, '#fff'); ctx.restore();
      line(ctx, gx + 2, y - 22, gx + 7, y - 34, '#ff8fb0', 2.4);
      poly(ctx, [[gx - 2, y - 30], [gx + 12, y - 30], [gx + 5, y - 38]], '#ffd870');
    });
  },
  poolTile(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i * 22 < w; i++) fillRR(ctx, x + i * 22, y + h * 0.3, 18, h * 0.6, 3, '#6fc9d6');
    ctx.restore();
  },

  /* ==================== PROMENADE ==================== */
  benchProm(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, 11, 4, '#c98f5a');
    fillRR(ctx, x + 3, y + 14, w - 6, 9, 4, '#b57b42');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    [x + 10, x + w - 20].forEach(px => {
      fillRR(ctx, px, y + 6, 10, h - 6, 3, '#8a8f9c');
      ctx.save(); ctx.globalAlpha = .5;
      ctx.beginPath(); ctx.arc(px + 5, y + h * 0.62, 11, Math.PI, TAU);
      ctx.strokeStyle = '#6f7686'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    });
    ctx.save(); ctx.globalAlpha = .4;
    fillRR(ctx, x + 2, y + 1, w - 4, 3, 1.5, '#e0a35f'); ctx.restore();
  },
  iceCart(ctx, x, y, w, h) {
    fillRR(ctx, x + 4, y + h * 0.3, w - 8, h * 0.52, 6, '#f2ece0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .85;
    for (let i = 0; i * 18 < w - 12; i++)
      fillRR(ctx, x + 8 + i * 18, y + h * 0.3, 9, h * 0.52, 2, i % 2 ? '#e2453c' : '#f2ece0');
    ctx.restore();
    fillRR(ctx, x, y + h * 0.24, w, 10, 4, '#e2453c');
    /* the striped canopy on two little posts */
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x - 4, y + 12); ctx.lineTo(x + w + 4, y + 12);
    ctx.lineTo(x + w - 2, y + 22); ctx.lineTo(x + 2, y + 22); ctx.closePath();
    ctx.fillStyle = '#f2ece0'; ctx.fill(); ctx.clip();
    for (let i = 0; i * 20 < w + 10; i++) { ctx.fillStyle = '#e2453c'; ctx.fillRect(x - 4 + i * 20, y + 8, 10, 20); }
    ctx.restore();
    line(ctx, x + 8, y + 22, x + 8, y + h * 0.26, '#c9ced9', 3);
    line(ctx, x + w - 8, y + 22, x + w - 8, y + h * 0.26, '#c9ced9', 3);
    /* a cone on top, because it is an ice-cream cart */
    poly(ctx, [[x + w * 0.42, y - 2], [x + w * 0.58, y - 2], [x + w * 0.5, y + 12]], '#d2a06a');
    circle(ctx, x + w * 0.46, y - 4, 6, '#ffd0e0'); circle(ctx, x + w * 0.55, y - 6, 6, '#fff6d8');
    wheel(ctx, x + 16, y + h - 7, 7, '#3f3a33', '#c9ced9');
    wheel(ctx, x + w - 16, y + h - 7, 7, '#3f3a33', '#c9ced9');
  },
  planterProm(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h * 0.34); ctx.lineTo(x + w - 2, y + h * 0.34);
    ctx.lineTo(x + w - 9, y + h); ctx.lineTo(x + 9, y + h); ctx.closePath();
    ctx.fillStyle = '#d8d2c4'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x, y + h * 0.3, w, 9, 3, '#e8e2d4');
    ctx.save(); ctx.globalAlpha = .4;
    for (let i = 0; i * 16 < w - 16; i++) line(ctx, x + 12 + i * 16, y + h * 0.44, x + 10 + i * 16, y + h - 4, '#b8b0a0', 2);
    ctx.restore();
    for (let i = 0; i < 5; i++) {
      const px = x + 8 + i * ((w - 16) / 4);
      leafy(ctx, px, y + h * 0.22, 12, 9, '#4caf6d', '#75d493', i * 5);
      circle(ctx, px + (i % 2 ? 3 : -3), y + h * 0.13, 4, ['#ff8fb0', '#ffd870', '#f2762c'][i % 3]);
    }
  },
  bikeProm(ctx, x, y, w, h) {
    const r = h * 0.34, cy = y + h - r - 2;
    [x + r + 4, x + w - r - 4].forEach(cx => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = '#3f3a44'; ctx.lineWidth = 4; ctx.stroke();
      ctx.save(); ctx.globalAlpha = .45;
      for (let i = 0; i < 6; i++) {
        const a = i * (Math.PI / 6);
        line(ctx, cx - Math.cos(a) * r, cy - Math.sin(a) * r, cx + Math.cos(a) * r, cy + Math.sin(a) * r, '#8d94a3', 1.6);
      }
      ctx.restore();
    });
    const c = '#3f9cc4';
    line(ctx, x + r + 4, cy, x + w * 0.52, y + h * 0.34, c, 4);
    line(ctx, x + w * 0.52, y + h * 0.34, x + w - r - 4, cy, c, 4);
    line(ctx, x + w * 0.52, y + h * 0.34, x + w * 0.34, cy, c, 4);
    line(ctx, x + w * 0.34, cy, x + r + 4, cy, c, 4);
    line(ctx, x + w * 0.52, y + h * 0.34, x + w * 0.4, y + h * 0.1, c, 4);
    fillRR(ctx, x + w * 0.32, y + h * 0.04, 20, 7, 3, '#2f2b34');
    line(ctx, x + w * 0.72, y + h * 0.14, x + w - r - 4, cy, '#5d6470', 3.4);
    fillRR(ctx, x + w * 0.66, y + h * 0.1, 18, 5, 2, '#2f2b34');
    /* a basket on the front, with a bunch of flowers in it */
    fillRR(ctx, x + w * 0.62, y + h * 0.16, 22, 16, 3, '#d7a76a');
    slats(ctx, x + w * 0.63, y + h * 0.18, 20, 12, 3, '#a8783f');
    circle(ctx, x + w * 0.68, y + h * 0.11, 4, '#ff8fb0');
    circle(ctx, x + w * 0.74, y + h * 0.09, 4, '#ffd870');
  },
  promArch(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .7;
      fillRR(ctx, x - 2, y + h * 0.5, 11, fy - y - h * 0.5, 4, '#e8e2d4');
      fillRR(ctx, x + w - 9, y + h * 0.5, 11, fy - y - h * 0.5, 4, '#e8e2d4');
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.5); ctx.quadraticCurveTo(x + w / 2, y - 6, x + w, y + h * 0.5);
    ctx.strokeStyle = '#e8e2d4'; ctx.lineWidth = 8; ctx.stroke();
    /* the string of bulbs slung under it */
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h * 0.5); ctx.quadraticCurveTo(x + w / 2, y + h * 0.22, x + w - 4, y + h * 0.5);
    ctx.strokeStyle = '#8a8f9c'; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 1; i < 8; i++) {
      const f = i / 8, bx = x + 4 + (w - 8) * f;
      const by = y + h * 0.5 + (y + h * 0.22 - (y + h * 0.5)) * 2 * f * (1 - f) * 2;
      const on = .5 + Math.sin(t * 2 + i) * .35;
      ctx.save(); ctx.globalAlpha = on;
      circle(ctx, bx, by + 8, 5, '#ffe7a8');
      ctx.globalAlpha = on * .3; circle(ctx, bx, by + 8, 12, '#fff6d8'); ctx.restore();
    }
  },
  kioskLedge(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#8a8f9c', 9, 8);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + w + 4, y);
    ctx.lineTo(x + w - 2, y + 17); ctx.lineTo(x + 2, y + 17); ctx.closePath();
    ctx.fillStyle = '#f2ece0'; ctx.fill(); ctx.clip();
    for (let i = 0; i * 24 < w + 10; i++) { ctx.fillStyle = '#3f9cc4'; ctx.fillRect(x - 4 + i * 24, y - 2, 12, 24); }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + w + 4, y); ctx.stroke();
    for (let i = 0; i * 24 <= w; i++) circle(ctx, x + 8 + i * 24, y + 18, 4.5, '#e8e2d4');
    fillRR(ctx, x + 6, y + 21, w - 12, 7, 3, '#c9a24a');
  },
  promStone(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i * 26 < w; i++)
      fillRR(ctx, x + i * 26, y + h * 0.3 + (i % 2) * 3, 22, h * 0.55, 4, '#c9c2b4');
    ctx.restore();
  },

  /* ==================== BEACH ==================== */
  /* The seagull. It is the one thing on the track she can neither stand on
     nor barge through: it hangs in a band that leaves room to duck under it
     and room to jump over it, and nothing else. */
  gull(ctx, x, y, w, h, t, pal, seed) {
    const cx = x + w * 0.5, cy = y + h * 0.5;
    const flap = Math.sin(t * 5 + (seed || 0) * 0.7);
    ctx.save(); ctx.translate(cx, cy + Math.sin(t * 1.7 + (seed || 0)) * 3);
    /* far wing first, so the body sits over it */
    ctx.save(); ctx.globalAlpha = .75;
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.quadraticCurveTo(-16, -16 - flap * 12, -34, -4 - flap * 16);
    ctx.quadraticCurveTo(-18, 2, -4, 4); ctx.closePath();
    ctx.fillStyle = '#d8dee8'; ctx.fill(); ctx.restore();
    fillEll(ctx, 0, 0, w * 0.3, h * 0.2, '#fbfcfe');
    ctx.strokeStyle = 'rgba(90,105,125,.5)'; ctx.lineWidth = 1.8; ctx.stroke();
    /* tail */
    poly(ctx, [[-w * 0.24, -3], [-w * 0.46, -8], [-w * 0.44, 4]], '#e8edf4');
    /* near wing, spread wide — this is what makes it read as flying */
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(10, -20 - flap * 14, 30, -8 - flap * 18);
    ctx.quadraticCurveTo(14, 3, 0, 5); ctx.closePath();
    ctx.fillStyle = '#f2f5fa'; ctx.fill();
    ctx.strokeStyle = 'rgba(90,105,125,.45)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    ctx.beginPath();
    ctx.moveTo(6, -12 - flap * 10); ctx.quadraticCurveTo(20, -12 - flap * 15, 30, -8 - flap * 18);
    ctx.lineTo(22, -2); ctx.quadraticCurveTo(14, -6, 6, -8); ctx.closePath();
    ctx.fillStyle = '#3f4a5c'; ctx.fill(); ctx.restore();
    /* head and that yellow beak */
    circle(ctx, w * 0.24, -h * 0.16, h * 0.14, '#fbfcfe');
    poly(ctx, [[w * 0.3, -h * 0.2], [w * 0.5, -h * 0.13], [w * 0.3, -h * 0.06]], '#f6b93a');
    circle(ctx, w * 0.27, -h * 0.2, 2.2, '#2b2b34');
    ctx.restore();
  },
  sandcastle(ctx, x, y, w, h) {
    const c = '#e8c98f', c2 = '#d2ac6a';
    fillRR(ctx, x + 4, y + h * 0.42, w - 8, h * 0.58, 3, c);
    ctx.strokeStyle = 'rgba(150,115,70,.55)'; ctx.lineWidth = 2.2; ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const tx = x + 2 + i * ((w - 24) / 2);
      fillRR(ctx, tx, y + h * 0.2, 20, h * 0.8, 3, c);
      fillRR(ctx, tx - 2, y + h * 0.14, 24, 9, 2, c2);
      for (let k = 0; k < 3; k++) fillRR(ctx, tx - 1 + k * 8, y + h * 0.08, 5, 7, 1, c2);
    }
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x + w * 0.42, y + h * 0.56, w * 0.16, h * 0.44, 6, '#b8935a'); ctx.restore();
    line(ctx, x + w * 0.5, y + h * 0.14, x + w * 0.5, y - 12, '#8a8f9c', 2);
    poly(ctx, [[x + w * 0.5, y - 12], [x + w * 0.72, y - 7], [x + w * 0.5, y - 2]], '#e2453c');
  },
  beachBall(ctx, x, y, w, h) {
    const r = Math.min(w, h) * 0.46, cx = x + w / 2, cy = y + h - r - 1;
    circle(ctx, cx, cy, r, '#f6f1e6');
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
    ['#e2453c', '#f5b731', '#3f9cc4', '#4ec46f'].forEach((col, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.quadraticCurveTo(cx + (i - 1.5) * r * 0.7, cy, cx, cy + r);
      ctx.quadraticCurveTo(cx + (i - 1.0) * r * 0.7, cy, cx, cy - r);
      ctx.fillStyle = col; ctx.fill();
    });
    ctx.restore();
    ctx.strokeStyle = 'rgba(40,30,20,.28)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5; fillEll(ctx, cx - r * .35, cy - r * .4, r * .26, r * .18, '#fff', -0.5); ctx.restore();
  },
  deckchair(ctx, x, y, w, h) {
    line(ctx, x + 6, y + h, x + w * 0.7, y + 4, '#b57b42', 6);
    line(ctx, x + w - 6, y + h, x + w * 0.32, y + h * 0.32, '#c98f5a', 6);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.68, y + 6); ctx.lineTo(x + w * 0.36, y + h * 0.42);
    ctx.lineTo(x + w * 0.56, y + h * 0.6); ctx.lineTo(x + w * 0.86, y + h * 0.2); ctx.closePath();
    ctx.fillStyle = '#f2ece0'; ctx.fill(); ctx.clip();
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#e2453c'; ctx.fillRect(x + w * 0.3 + i * 11, y, 5, h); }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.68, y + 6); ctx.lineTo(x + w * 0.36, y + h * 0.42);
    ctx.lineTo(x + w * 0.56, y + h * 0.6); ctx.lineTo(x + w * 0.86, y + h * 0.2); ctx.closePath(); ctx.stroke();
  },
  driftwood(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h - 4);
    ctx.quadraticCurveTo(x + w * 0.4, y + 2, x + w - 4, y + h * 0.4);
    ctx.strokeStyle = '#c9bda8'; ctx.lineWidth = h * 0.5; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#a89a84'; ctx.lineWidth = h * 0.18; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 4; i++) {
      const f = 0.2 + i * 0.2;
      line(ctx, x + w * f, y + h * (0.9 - f * 0.6), x + w * f + 12, y + h * (0.7 - f * 0.5), '#8f8574', 2);
    }
    ctx.restore();
    line(ctx, x + w * 0.52, y + h * 0.42, x + w * 0.66, y + 2, '#c9bda8', 7);
  },
  umbrellaOpen(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY, px = x + w * 0.5;
    if (fy != null && fy > y) {
      ctx.save(); ctx.globalAlpha = .62;
      ctx.beginPath(); ctx.moveTo(px - 4, y + 12); ctx.lineTo(px + 8, fy); ctx.lineTo(px + 14, fy); ctx.lineTo(px + 3, y + 12);
      ctx.closePath(); ctx.fillStyle = '#c9bda8'; ctx.fill(); ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 26);
    for (let i = 0; i <= 6; i++) {
      const f = i / 6;
      ctx.quadraticCurveTo(x - 10 + (w + 20) * (f + 0.083), y + 34, x - 10 + (w + 20) * (f + 0.167), y + 26);
    }
    ctx.lineTo(px, y - 5); ctx.closePath();
    ctx.save(); ctx.clip();
    for (let i = 0; i * 24 < w + 24; i++) {
      ctx.fillStyle = i % 2 ? '#f6f1e6' : '#e2453c';
      ctx.fillRect(x - 10 + i * 24, y - 8, 24, 46);
    }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    circle(ctx, px, y - 7, 4.5, '#c9bda8');
  },
  rowboat(ctx, x, y, w, h) {
    /* upturned on the sand, so the hull is what she runs along */
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.42, x + w - 2, y + h);
    ctx.closePath();
    ctx.fillStyle = '#3f6f8a'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 6, y + h - i * (h * 0.22));
      ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.1 - i * (h * 0.16), x + w - 6, y + h - i * (h * 0.22));
      ctx.strokeStyle = '#5f92ac'; ctx.lineWidth = 2.4; ctx.stroke();
    }
    ctx.restore();
    fillRR(ctx, x + w * 0.36, y + h * 0.06, w * 0.28, 7, 3, '#e8e2d4');
    line(ctx, x + w * 0.72, y + h * 0.5, x + w * 1.02, y + h * 0.04, '#c9bda8', 5);
    fillEll(ctx, x + w * 1.02, y + h * 0.02, 9, 5, '#c9bda8', -0.9);
  },
  boardwalkLedge(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#8a6440', 10, 12);
    fillRR(ctx, x, y, w, 13, 2, '#c9a276');
    ctx.save(); ctx.globalAlpha = .4;
    for (let i = 0; i * 25 < w; i++) line(ctx, x + i * 25, y + 1, x + i * 25, y + 12, '#8a6440', 2);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    fillRR(ctx, x, y + 14, w, 6, 2, '#9a7550');
  },
  netArch(ctx, x, y, w, h, t, pal, seed, o) {
    /* a fishing net slung between two poles — she runs under the belly of it */
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .8;
      fillRR(ctx, x - 3, y + h * 0.3, 12, fy - y - h * 0.3, 4, '#a8875a');
      fillRR(ctx, x + w - 9, y + h * 0.3, 12, fy - y - h * 0.3, 4, '#a8875a');
      ctx.restore();
    }
    fillRR(ctx, x - 6, y, w + 12, 9, 4, '#8a6440');
    ctx.save(); ctx.globalAlpha = .72;
    ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 1.8;
    for (let i = 0; i * 15 <= w; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 15, y + 8);
      ctx.quadraticCurveTo(x + i * 15 + 6, y + h * 0.6, x + i * 15 - 3, y + h * 0.86);
      ctx.stroke();
    }
    for (let k = 1; k < 5; k++) {
      ctx.beginPath();
      ctx.moveTo(x - 2, y + 8 + k * (h * 0.19));
      ctx.quadraticCurveTo(x + w / 2, y + 16 + k * (h * 0.21), x + w + 2, y + 8 + k * (h * 0.19));
      ctx.stroke();
    }
    ctx.restore();
    /* floats along the top rope */
    for (let i = 0; i * 30 <= w; i++) circle(ctx, x + 10 + i * 30, y + 5, 5, '#f2762c');
  },
  shells(ctx, x, y, w, h) {
    for (let i = 0; i < 4; i++) {
      const r = makeRng(i * 17 + 3), px = x + r() * w, py = y + h * 0.4 + r() * h * 0.5;
      const c = ['#ffe7d0', '#f6d8c0', '#ffd0e0', '#f2ece0'][i % 4];
      ctx.save(); ctx.translate(px, py); ctx.rotate(r() * 2 - 1);
      ctx.beginPath(); ctx.arc(0, 0, 6, Math.PI, TAU); ctx.closePath();
      ctx.fillStyle = c; ctx.fill();
      ctx.save(); ctx.globalAlpha = .5;
      for (let k = -2; k <= 2; k++) line(ctx, 0, 0, k * 2.4, -5.5, '#c9a68f', 1.2);
      ctx.restore(); ctx.restore();
    }
  },
  sandRipple(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + h * (0.3 + i * 0.22));
      ctx.quadraticCurveTo(x + w * 0.5, y + h * (0.18 + i * 0.22), x + w, y + h * (0.32 + i * 0.22));
      ctx.strokeStyle = '#d2ac6a'; ctx.lineWidth = 2.4; ctx.stroke();
    }
    ctx.restore();
  },

  /* ==================== THE PIER ==================== */
  bollard(ctx, x, y, w, h) {
    const cx = x + w / 2;
    fillRR(ctx, cx - w * 0.24, y + h * 0.16, w * 0.48, h * 0.84, 5, '#4a5468');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillEll(ctx, cx, y + h * 0.16, w * 0.34, h * 0.14, '#5d6878');
    fillEll(ctx, cx, y + h * 0.1, w * 0.28, h * 0.1, '#6f7a8c');
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, cx - w * 0.18, y + h * 0.24, 5, h * 0.6, 2, '#8d94a3'); ctx.restore();
    /* a coil of mooring rope round the base */
    ctx.strokeStyle = '#d8c49a'; ctx.lineWidth = 5;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath(); ctx.ellipse(cx, y + h * (0.66 + i * 0.12), w * 0.36, 5, 0, 0, TAU); ctx.stroke();
    }
  },
  pierCrate(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 4, '#8fa3b8', '#6f8399');
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 1; i < 4; i++) line(ctx, x + (w * i) / 4, y + 4, x + (w * i) / 4, y + h - 4, '#5a6d82', 2.4);
    ctx.globalAlpha = .35;
    line(ctx, x + 4, y + h * 0.5, x + w - 4, y + h * 0.5, '#5a6d82', 2.4);
    ctx.restore();
    /* a couple of silver fish showing over the rim */
    [0.3, 0.62].forEach((f, i) => {
      ctx.save(); ctx.translate(x + w * f, y + 5); ctx.rotate(i ? 0.3 : -0.2);
      fillEll(ctx, 0, 0, 13, 6, '#cfe0ea');
      poly(ctx, [[-12, 0], [-19, -5], [-19, 5]], '#cfe0ea');
      circle(ctx, 7, -1.5, 1.6, '#3a4450'); ctx.restore();
    });
  },
  lifering(ctx, x, y, w, h) {
    const cx = x + w / 2;
    fillRR(ctx, cx - 4, y + h * 0.3, 8, h * 0.7, 3, '#c9bda8');
    fillEll(ctx, cx, y + h - 3, 14, 5, '#a89a84');
    const r = Math.min(w, h * 0.5) * 0.44;
    ctx.beginPath(); ctx.arc(cx, y + h * 0.3, r, 0, TAU);
    ctx.strokeStyle = '#f2ece0'; ctx.lineWidth = r * 0.55; ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, y + h * 0.3, r, 0, TAU); ctx.lineWidth = r * 0.55;
    ctx.setLineDash([r * 0.75, r * 0.75]); ctx.strokeStyle = '#e2453c'; ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.arc(cx, y + h * 0.3, r * 1.28, 0, TAU);
    ctx.strokeStyle = '#d8c49a'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  },
  fishBox(ctx, x, y, w, h) {
    boxy(ctx, x, y + h * 0.2, w, h * 0.8, 4, '#e8e2d4', '#c9c2b4');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 3; i++) line(ctx, x + 4, y + h * 0.2 + (h * 0.8 * i) / 3, x + w - 4, y + h * 0.2 + (h * 0.8 * i) / 3, '#a8a294', 2);
    ctx.restore();
    /* ice and a tangle of nets over the top */
    fillRR(ctx, x + 4, y + h * 0.1, w - 8, h * 0.18, 4, '#dff0fb');
    ctx.save(); ctx.globalAlpha = .8;
    ctx.strokeStyle = '#4c8fa8'; ctx.lineWidth = 1.6;
    for (let i = 0; i * 12 < w; i++) line(ctx, x + i * 12, y + h * 0.1, x + i * 12 + 8, y + h * 0.28, '#8fbcd6', 1.6);
    ctx.restore();
    poly(ctx, [[x + w * 0.3, y + h * 0.1], [x + w * 0.6, y + h * 0.03], [x + w * 0.62, y + h * 0.12]], '#cfe0ea');
  },
  pierBench(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#8a6440', 10, 14);
    fillRR(ctx, x, y, w, 12, 3, '#c9a276');
    ctx.save(); ctx.globalAlpha = .4;
    for (let i = 0; i * 24 < w; i++) line(ctx, x + i * 24, y + 1, x + i * 24, y + 11, '#8a6440', 2);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    fillRR(ctx, x + 3, y + 15, w - 6, 6, 2, '#b08c60');
  },
  pierArch(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .78;
      fillRR(ctx, x - 2, y + h * 0.4, 13, fy - y - h * 0.4, 5, '#3f4a5c');
      fillRR(ctx, x + w - 11, y + h * 0.4, 13, fy - y - h * 0.4, 5, '#3f4a5c');
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h * 0.44); ctx.quadraticCurveTo(x + w / 2, y - 8, x + w - 2, y + h * 0.44);
    ctx.strokeStyle = '#3f4a5c'; ctx.lineWidth = 7; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h * 0.44); ctx.quadraticCurveTo(x + w / 2, y - 8, x + w - 2, y + h * 0.44);
    ctx.strokeStyle = '#6f7a8c'; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore();
    /* two lanterns, one each side */
    [x + w * 0.2, x + w * 0.8].forEach((lx, i) => {
      const ly = y + h * 0.18 + i * 0;
      line(ctx, lx, y + h * 0.16, lx, ly + 6, '#3f4a5c', 3);
      poly(ctx, [[lx - 8, ly + 6], [lx + 8, ly + 6], [lx + 6, ly + 24], [lx - 6, ly + 24]], '#fff6d8');
      ctx.save(); ctx.globalAlpha = .3; circle(ctx, lx, ly + 15, 18, '#ffe7a8'); ctx.restore();
      fillRR(ctx, lx - 9, ly + 3, 18, 5, 2, '#3f4a5c');
    });
  },
  ropeCoil(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(x + w * 0.5, y + h * 0.62, w * (0.34 - i * 0.08), h * (0.34 - i * 0.08), 0, 0, TAU);
      ctx.strokeStyle = i % 2 ? '#d8c49a' : '#c2ab84'; ctx.lineWidth = 5; ctx.stroke();
    }
    ctx.restore();
  },
  plankGrain(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i * 30 < w; i++) {
      fillRR(ctx, x + i * 30, y + h * 0.4, 26, h * 0.5, 2, '#b08c60');
      line(ctx, x + i * 30 + 4, y + h * 0.62, x + i * 30 + 22, y + h * 0.58, '#8a6440', 1.6);
    }
    ctx.restore();
  },

  /* ==================== UNDER THE SEA ==================== */
  coralRock(ctx, x, y, w, h, t, pal, seed) {
    const r = makeRng((seed | 0) + 11);
    /* the rock, then the coral growing out of the top of it */
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h);
    ctx.quadraticCurveTo(x + w * 0.1, y + h * 0.36, x + w * 0.34, y + h * 0.3);
    ctx.quadraticCurveTo(x + w * 0.6, y + h * 0.24, x + w * 0.86, y + h * 0.42);
    ctx.quadraticCurveTo(x + w, y + h * 0.7, x + w - 2, y + h);
    ctx.closePath();
    ctx.fillStyle = '#4f6f7a'; ctx.fill();
    ctx.strokeStyle = 'rgba(15,40,50,.45)'; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    fillEll(ctx, x + w * 0.32, y + h * 0.52, w * 0.2, h * 0.14, '#7a9aa4'); ctx.restore();
    for (let i = 0; i < 4; i++) {
      const px = x + w * (0.18 + i * 0.22), py = y + h * (0.34 + r() * 0.12);
      const col = ['#ff8fa8', '#f6b93a', '#c98fe0', '#ff7b6a'][i % 4];
      for (let k = 0; k < 3; k++) {
        const a = -Math.PI / 2 + (k - 1) * 0.5;
        line(ctx, px, py, px + Math.cos(a) * 13, py + Math.sin(a) * 15, col, 5);
        circle(ctx, px + Math.cos(a) * 13, py + Math.sin(a) * 15, 3.4, shade(col, .25));
      }
    }
  },
  anemone(ctx, x, y, w, h, t, pal, seed) {
    const cx = x + w / 2, base = y + h;
    fillRR(ctx, cx - w * 0.2, y + h * 0.5, w * 0.4, h * 0.5, 8, '#c9628a');
    for (let i = 0; i < 11; i++) {
      const f = i / 10, a = -Math.PI * 0.9 + f * Math.PI * 0.8;
      const sway = Math.sin(t * 1.6 + i * 0.7 + (seed || 0)) * 5;
      ctx.beginPath();
      ctx.moveTo(cx, y + h * 0.55);
      ctx.quadraticCurveTo(cx + Math.cos(a) * w * 0.3 + sway * 0.4, y + h * 0.28,
        cx + Math.cos(a) * w * 0.46 + sway, y + h * 0.5 + Math.sin(a) * h * 0.42);
      ctx.strokeStyle = i % 2 ? '#ff9fc0' : '#ffc0d4'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
      circle(ctx, cx + Math.cos(a) * w * 0.46 + sway, y + h * 0.5 + Math.sin(a) * h * 0.42, 3, '#fff0f6');
    }
    fillEll(ctx, cx, base - 4, w * 0.34, 6, '#a84a70');
  },
  clamShell(ctx, x, y, w, h) {
    const cx = x + w / 2, by = y + h;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x + 3, by);
    ctx.quadraticCurveTo(cx, y + h * 0.06, x + w - 3, by); ctx.closePath();
    ctx.fillStyle = '#e0c8e8'; ctx.fill();
    ctx.strokeStyle = 'rgba(80,50,95,.45)'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(cx, by);
      ctx.quadraticCurveTo(cx + i * w * 0.09, y + h * 0.34, cx + i * w * 0.14, y + h * 0.14);
      ctx.strokeStyle = '#c0a0cc'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore(); ctx.restore();
    fillRR(ctx, x + 1, by - 9, w - 2, 9, 4, '#cfb0da');
    /* the pearl */
    circle(ctx, cx, by - 14, 6, '#fdf6ff');
    ctx.save(); ctx.globalAlpha = .7; circle(ctx, cx - 2, by - 16, 2, '#fff'); ctx.restore();
  },
  amphora(ctx, x, y, w, h) {
    const cx = x + w / 2;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.14, y + h * 0.2);
    ctx.quadraticCurveTo(x - w * 0.06, y + h * 0.56, cx - w * 0.2, y + h);
    ctx.lineTo(cx + w * 0.2, y + h);
    ctx.quadraticCurveTo(x + w * 1.06, y + h * 0.56, cx + w * 0.14, y + h * 0.2);
    ctx.closePath();
    ctx.fillStyle = '#b08055'; ctx.fill();
    ctx.strokeStyle = 'rgba(40,25,15,.45)'; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, cx - w * 0.18, y + h * 0.06, w * 0.36, h * 0.16, 4, '#c99566');
    [-1, 1].forEach(d => {
      ctx.beginPath();
      ctx.moveTo(cx + d * w * 0.16, y + h * 0.14);
      ctx.quadraticCurveTo(cx + d * w * 0.42, y + h * 0.24, cx + d * w * 0.2, y + h * 0.42);
      ctx.strokeStyle = '#c99566'; ctx.lineWidth = 5; ctx.stroke();
    });
    ctx.save(); ctx.globalAlpha = .5;
    fillEll(ctx, cx - w * 0.1, y + h * 0.5, w * 0.07, h * 0.16, '#d8b48a');
    ctx.globalAlpha = .8;
    for (let i = 0; i < 3; i++) leafy(ctx, x + w * (0.2 + i * 0.3), y + h - 4, 10, 6, '#3f7a5c', '#5aa87a', i * 3);
    ctx.restore();
  },
  starRock(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h);
    ctx.quadraticCurveTo(x + w * 0.14, y + h * 0.2, x + w * 0.52, y + h * 0.16);
    ctx.quadraticCurveTo(x + w * 0.92, y + h * 0.3, x + w - 2, y + h);
    ctx.closePath();
    ctx.fillStyle = '#5f7f88'; ctx.fill();
    ctx.strokeStyle = 'rgba(15,40,50,.45)'; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .3;
    fillEll(ctx, x + w * 0.36, y + h * 0.46, w * 0.22, h * 0.16, '#8fadb5'); ctx.restore();
    /* a starfish stuck on the side of it */
    ctx.save(); ctx.translate(x + w * 0.6, y + h * 0.56); ctx.rotate(0.4);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU - Math.PI / 2, r = i % 2 ? 5 : 14;
      i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fillStyle = '#f2762c'; ctx.fill();
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU - Math.PI / 2;
      circle(ctx, Math.cos(a) * 7, Math.sin(a) * 7, 1.8, '#ffd0a8');
    }
    ctx.restore(); ctx.restore();
  },
  kelpArch(ctx, x, y, w, h, t, pal, seed, o) {
    /* two stands of kelp bending together over the track */
    const fy = o && o.floorY;
    const sway = Math.sin(t * 0.8 + (seed || 0) * 0.01) * 7;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .8;
      [x + 6, x + w - 6].forEach((px, i) => {
        ctx.beginPath(); ctx.moveTo(px, fy);
        ctx.quadraticCurveTo(px + (i ? -12 : 12) + sway, y + h * 0.6, px + (i ? -4 : 4), y + h * 0.2);
        ctx.strokeStyle = '#3f7a4a'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.stroke();
        for (let k = 0; k < 5; k++) {
          const f = k / 5;
          fillEll(ctx, px + (i ? -1 : 1) * (10 + f * 4) + sway * f, fy - (fy - y) * (0.2 + f * 0.16),
            13, 5, '#4f9c5c', i ? 0.5 : -0.5);
        }
      });
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.5);
    ctx.quadraticCurveTo(x + w / 2, y - 6 + sway, x + w, y + h * 0.5);
    ctx.strokeStyle = '#3f7a4a'; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#5aa864'; ctx.lineWidth = 5; ctx.stroke();
    for (let i = 1; i < 6; i++) {
      const f = i / 6, px = x + w * f;
      const py = y + h * 0.5 + (-h * 0.5 + sway) * 2 * f * (1 - f) * 2;
      fillEll(ctx, px, py + 9, 15, 6, '#4f9c5c', Math.sin(f * 4) * 0.5);
    }
  },
  kelpTunnel(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .85;
      [x - 4, x + w - 12].forEach((px, i) => {
        for (let k = 0; k < 3; k++) {
          const sway = Math.sin(t * 0.7 + k + i * 2) * 6;
          ctx.beginPath(); ctx.moveTo(px + k * 7, fy);
          ctx.quadraticCurveTo(px + k * 7 + sway, y + h * 0.6, px + k * 7 + sway * 0.4, y + h * 0.2);
          ctx.strokeStyle = k % 2 ? '#3f7a4a' : '#356b42'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();
        }
      });
      ctx.restore();
    }
    fillRR(ctx, x - 4, y, w + 8, h * 0.46, 16, '#356b42');
    ctx.save(); rr(ctx, x - 4, y, w + 8, h * 0.46, 16); ctx.clip();
    for (let i = 0; i * 18 < w + 10; i++) {
      const sway = Math.sin(t * 0.9 + i * 0.6) * 4;
      fillEll(ctx, x + i * 18 + 6 + sway, y + h * 0.16, 13, 8, i % 2 ? '#4f9c5c' : '#5aa864', 0.3);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i * 26 < w; i++) circle(ctx, x + 12 + i * 26, y + h * 0.36, 3.4, '#d8e88f');
    ctx.restore();
  },
  wreckLedge(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + 16) {
      ctx.save(); ctx.globalAlpha = .7;
      for (let i = 0; i * 60 < w; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 14 + i * 60, y + 14);
        ctx.lineTo(x + 20 + i * 60, fy);
        ctx.strokeStyle = '#4a3a2c'; ctx.lineWidth = 9; ctx.stroke();
      }
      ctx.restore();
    }
    fillRR(ctx, x, y, w, 13, 2, '#6b5340');
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i * 28 < w; i++) line(ctx, x + i * 28, y + 1, x + i * 28, y + 12, '#4a3a2c', 2);
    ctx.restore();
    ctx.strokeStyle = 'rgba(20,15,10,.5)'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .7;
    for (let i = 0; i * 40 < w; i++) leafy(ctx, x + 16 + i * 40, y + 2, 12, 6, '#3f7a5c', '#5aa87a', i * 5);
    ctx.restore();
  },
  anchorW(ctx, x, y, w, h) {
    const cx = x + w / 2;
    ctx.strokeStyle = '#5d6878'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, y + h * 0.18); ctx.lineTo(cx, y + h * 0.84); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y + h * 0.6);
    ctx.quadraticCurveTo(cx, y + h * 1.14, x + w * 0.9, y + h * 0.6);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + h * 0.28); ctx.lineTo(x + w * 0.8, y + h * 0.28);
    ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, y + h * 0.14, h * 0.11, 0, TAU);
    ctx.lineWidth = 6; ctx.strokeStyle = '#6f7a8c'; ctx.stroke();
    poly(ctx, [[x + w * 0.06, y + h * 0.52], [x + w * 0.2, y + h * 0.66], [x + w * 0.04, y + h * 0.7]], '#5d6878');
    poly(ctx, [[x + w * 0.94, y + h * 0.52], [x + w * 0.8, y + h * 0.66], [x + w * 0.96, y + h * 0.7]], '#5d6878');
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i < 3; i++) leafy(ctx, x + w * (0.24 + i * 0.26), y + h * (0.5 + (i % 2) * 0.2), 11, 6, '#3f7a5c', '#5aa87a', i * 7);
    ctx.restore();
  },
  chestW(ctx, x, y, w, h) {
    boxy(ctx, x, y + h * 0.34, w, h * 0.66, 4, '#8a5f3a', '#6b4a2c');
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.36);
    ctx.quadraticCurveTo(x + w / 2, y - h * 0.1, x + w, y + h * 0.36);
    ctx.closePath();
    ctx.fillStyle = '#7a5434'; ctx.fill();
    ctx.strokeStyle = 'rgba(25,15,8,.5)'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .9;
    [0.2, 0.8].forEach(f => {
      fillRR(ctx, x + w * f - 4, y + h * 0.34, 8, h * 0.64, 2, '#c9a24a');
      ctx.beginPath();
      ctx.moveTo(x + w * f - 4, y + h * 0.36);
      ctx.quadraticCurveTo(x + w * f - 4 + (f < .5 ? 8 : -8), y + h * 0.06, x + w * f + 4, y + h * 0.34);
      ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 5; ctx.stroke();
    });
    ctx.restore();
    fillRR(ctx, x + w * 0.44, y + h * 0.32, w * 0.12, h * 0.2, 3, '#d8b25e');
    circle(ctx, x + w * 0.5, y + h * 0.42, 2.6, '#5f4429');
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 3; i++) leafy(ctx, x + w * (0.16 + i * 0.34), y + h * 0.96, 12, 6, '#3f7a5c', '#5aa87a', i * 9);
    ctx.restore();
  },
  barrelW(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w * 0.16, y + 3);
    ctx.quadraticCurveTo(x - w * 0.06, y + h / 2, x + w * 0.16, y + h - 3);
    ctx.lineTo(x + w * 0.84, y + h - 3);
    ctx.quadraticCurveTo(x + w * 1.06, y + h / 2, x + w * 0.84, y + 3);
    ctx.closePath();
    ctx.fillStyle = '#8a5f3a'; ctx.fill();
    ctx.strokeStyle = 'rgba(25,15,8,.5)'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    [0.24, 0.74].forEach(f => fillRR(ctx, x + w * 0.04, y + h * f, w * 0.92, 7, 3, '#5d6878'));
    ctx.globalAlpha = .35;
    for (let i = 1; i < 4; i++) line(ctx, x + w * (0.16 + i * 0.18), y + 5, x + w * (0.16 + i * 0.18), y + h - 5, '#6b4a2c', 2);
    ctx.restore();
    fillEll(ctx, x + w / 2, y + 4, w * 0.34, 5, '#a8794a');
  },
  cannonW(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.1, y + h * 0.26, w * 0.78, h * 0.36, 9, '#3f4a5c');
    ctx.strokeStyle = 'rgba(10,20,30,.55)'; ctx.lineWidth = 2.4; ctx.stroke();
    circle(ctx, x + w * 0.9, y + h * 0.44, h * 0.2, '#2b3444');
    circle(ctx, x + w * 0.93, y + h * 0.44, h * 0.11, '#10161f');
    fillRR(ctx, x + w * 0.06, y + h * 0.2, w * 0.16, h * 0.5, 7, '#4a5468');
    /* the little carriage under it */
    fillRR(ctx, x + w * 0.12, y + h * 0.62, w * 0.6, h * 0.2, 4, '#6b4a2c');
    wheel(ctx, x + w * 0.24, y + h * 0.86, h * 0.16, '#5f4429', '#8a5f3a');
    wheel(ctx, x + w * 0.6, y + h * 0.86, h * 0.16, '#5f4429', '#8a5f3a');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 2; i++) leafy(ctx, x + w * (0.3 + i * 0.3), y + h * 0.3, 11, 6, '#3f7a5c', '#5aa87a', i * 4);
    ctx.restore();
  },
  wreckBeam(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .75;
      ctx.beginPath(); ctx.moveTo(x + 6, y + h * 0.4); ctx.lineTo(x - 4, fy);
      ctx.lineTo(x + 16, fy); ctx.lineTo(x + 20, y + h * 0.4); ctx.closePath();
      ctx.fillStyle = '#4a3a2c'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + w - 20, y + h * 0.4); ctx.lineTo(x + w - 16, fy);
      ctx.lineTo(x + w + 4, fy); ctx.lineTo(x + w - 6, y + h * 0.4); ctx.closePath();
      ctx.fillStyle = '#4a3a2c'; ctx.fill(); ctx.restore();
    }
    fillRR(ctx, x - 6, y, w + 12, 20, 4, '#6b5340');
    ctx.strokeStyle = 'rgba(20,15,10,.5)'; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i * 34 < w; i++) line(ctx, x + i * 34 + 6, y + 3, x + i * 34 + 20, y + 17, '#4a3a2c', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .75;
    for (let i = 0; i * 46 < w; i++) {
      leafy(ctx, x + 20 + i * 46, y + 22, 14, 7, '#3f7a5c', '#5aa87a', i * 7);
      circle(ctx, x + 34 + i * 46, y + 24, 3, '#f6b93a');
    }
    ctx.restore();
  },
  wreckHull(ctx, x, y, w, h, t, pal, seed, o) {
    /* the broken hull she runs through: ribs down to the sea floor on both
       sides and planking overhead */
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .82;
      [x - 6, x + w - 20].forEach(px => {
        ctx.beginPath();
        ctx.moveTo(px + 4, y + h * 0.42); ctx.quadraticCurveTo(px - 6, fy - (fy - y) * 0.3, px + 2, fy);
        ctx.lineTo(px + 24, fy); ctx.quadraticCurveTo(px + 18, fy - (fy - y) * 0.3, px + 24, y + h * 0.42);
        ctx.closePath(); ctx.fillStyle = '#4a3a2c'; ctx.fill();
      });
      ctx.restore();
    }
    fillRR(ctx, x - 8, y, w + 16, h * 0.48, 10, '#5f4a38');
    ctx.save(); rr(ctx, x - 8, y, w + 16, h * 0.48, 10); ctx.clip();
    ctx.globalAlpha = .5;
    for (let i = 0; i * 24 < w + 20; i++) line(ctx, x - 8 + i * 24, y, x - 8 + i * 24, y + h, '#3f3126', 2.4);
    ctx.globalAlpha = .3;
    for (let k = 1; k < 3; k++) line(ctx, x - 8, y + k * (h * 0.16), x + w + 8, y + k * (h * 0.16), '#3f3126', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .7;
    for (let i = 0; i * 52 < w; i++) leafy(ctx, x + 18 + i * 52, y + h * 0.5, 15, 8, '#3f7a5c', '#5aa87a', i * 11);
    ctx.restore();
    /* a porthole, because it should be readable as a ship */
    circle(ctx, x + w * 0.5, y + h * 0.24, 11, '#8fa3b8');
    circle(ctx, x + w * 0.5, y + h * 0.24, 7, '#1f3a4a');
  },
  wreckDeck(ctx, x, y, w, h, t, pal, seed, o) {
    PROPS.wreckLedge(ctx, x, y, w, h, t, pal, seed, o);
    ctx.save(); ctx.globalAlpha = .7;
    for (let i = 0; i * 70 < w; i++) {
      fillRR(ctx, x + 26 + i * 70, y - 22, 7, 22, 3, '#5d6878');
      line(ctx, x + 30 + i * 70, y - 20, x + 96 + i * 70, y - 20, '#d8c49a', 2);
    }
    ctx.restore();
  },
  seagrass(ctx, x, y, w, h, t) {
    ctx.save(); ctx.globalAlpha = .85;
    for (let i = 0; i < 7; i++) {
      const r = makeRng(i * 13 + 5), px = x + r() * w;
      const sway = Math.sin(t * 1.1 + i) * 5;
      ctx.beginPath(); ctx.moveTo(px, y + h);
      ctx.quadraticCurveTo(px + sway, y + h * 0.3, px + sway * 1.6, y - h * 0.6);
      ctx.strokeStyle = i % 2 ? '#3f7a5c' : '#4f9c6c'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
  },
  bubblesDeco(ctx, x, y, w, h, t) {
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 6; i++) {
      const r = makeRng(i * 31 + 7);
      const ph = (t * 0.35 + r()) % 1;
      circle(ctx, x + r() * w + Math.sin(ph * 7 + i) * 5, y + h - ph * 130, 2 + r() * 3, '#dff0fb');
    }
    ctx.restore();
  },
  rockWet(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h);
    ctx.quadraticCurveTo(x + w * 0.12, y + h * 0.3, x + w * 0.46, y + h * 0.2);
    ctx.quadraticCurveTo(x + w * 0.86, y + h * 0.32, x + w - 2, y + h);
    ctx.closePath();
    ctx.fillStyle = '#6f7a80'; ctx.fill();
    ctx.strokeStyle = 'rgba(20,30,35,.5)'; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    fillEll(ctx, x + w * 0.38, y + h * 0.42, w * 0.22, h * 0.14, '#a3b0b5'); ctx.restore();
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 3; i++)
      fillEll(ctx, x + w * (0.2 + i * 0.3), y + h * (0.72 + (i % 2) * 0.1), w * 0.16, h * 0.1, '#4f8a5c');
    ctx.restore();
  },

  /* ==================== THE FOREST ==================== */
  fernF(ctx, x, y, w, h) {
    const cx = x + w / 2;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 0.5 + (i - 3) * 0.34;
      const ex = cx + Math.cos(a) * w * 0.5, ey = y + h + Math.sin(a) * h * 1.02;
      ctx.beginPath(); ctx.moveTo(cx, y + h - 2);
      ctx.quadraticCurveTo(cx + Math.cos(a) * w * 0.3, y + h * 0.4 + Math.sin(a) * 6, ex, ey);
      ctx.strokeStyle = i % 2 ? '#2f7546' : '#3f9c5c'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
      for (let k = 1; k < 5; k++) {
        const f = k / 5;
        const px = lerp(cx, ex, f) + Math.cos(a) * 2, py = lerp(y + h - 2, ey, f) - 4;
        fillEll(ctx, px, py, 7, 3.4, k % 2 ? '#4caf6d' : '#5cc47c', a);
      }
    }
  },
  mushroomF(ctx, x, y, w, h) {
    const caps = [[0.28, 0.55, 1], [0.62, 0.34, 1.25], [0.84, 0.7, 0.8]];
    caps.forEach((c, i) => {
      const cx = x + w * c[0], top = y + h * c[1], s = c[2];
      fillRR(ctx, cx - 5 * s, top, 10 * s, y + h - top, 4, '#f2e2c6');
      ctx.beginPath(); ctx.ellipse(cx, top + 2, 15 * s, 11 * s, 0, Math.PI, TAU); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#d8442c' : '#e0603f'; ctx.fill();
      ctx.strokeStyle = 'rgba(60,20,10,.4)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.globalAlpha = .9;
      circle(ctx, cx - 5 * s, top - 4 * s, 3 * s, '#fff6ea');
      circle(ctx, cx + 6 * s, top - 2 * s, 2.4 * s, '#fff6ea');
      circle(ctx, cx + 1 * s, top - 7 * s, 2 * s, '#fff6ea'); ctx.restore();
    });
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 3; i++) fillEll(ctx, x + w * (0.2 + i * 0.3), y + h - 3, 11, 5, '#4f8a5c');
    ctx.restore();
  },
  logF(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * 0.16, w, h * 0.8, h * 0.34, '#7a5a3a');
    ctx.strokeStyle = 'rgba(30,20,12,.5)'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let i = 0; i * 30 < w; i++) line(ctx, x + 12 + i * 30, y + h * 0.32, x + 30 + i * 30, y + h * 0.72, '#5f4429', 2);
    ctx.restore();
    fillEll(ctx, x + 6, y + h * 0.56, 9, h * 0.36, '#a8794a');
    ctx.save(); ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.ellipse(x + 6, y + h * 0.56, 5, h * 0.2, 0, 0, TAU);
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    /* moss along the top of it */
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i * 22 < w; i++) fillEll(ctx, x + 12 + i * 22, y + h * 0.18, 13, 6, i % 2 ? '#4f8a5c' : '#5fa06a');
    ctx.restore();
    for (let i = 0; i < 2; i++) {
      const mx = x + w * (0.34 + i * 0.34);
      fillRR(ctx, mx - 3, y + h * 0.02, 6, h * 0.16, 3, '#f2e2c6');
      ctx.beginPath(); ctx.ellipse(mx, y + h * 0.04, 9, 6, 0, Math.PI, TAU); ctx.closePath();
      ctx.fillStyle = '#d8b25e'; ctx.fill();
    }
  },
  boulderF(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h);
    ctx.quadraticCurveTo(x - 2, y + h * 0.4, x + w * 0.3, y + h * 0.14);
    ctx.quadraticCurveTo(x + w * 0.72, y + h * 0.02, x + w - 3, y + h * 0.46);
    ctx.quadraticCurveTo(x + w + 2, y + h * 0.82, x + w - 4, y + h);
    ctx.closePath();
    ctx.fillStyle = '#8a8f8a'; ctx.fill();
    ctx.strokeStyle = 'rgba(30,35,28,.5)'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    fillEll(ctx, x + w * 0.36, y + h * 0.42, w * 0.24, h * 0.18, '#adb2ac');
    ctx.globalAlpha = .25;
    line(ctx, x + w * 0.6, y + h * 0.22, x + w * 0.7, y + h * 0.72, '#5f645c', 2.4); ctx.restore();
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 4; i++)
      fillEll(ctx, x + w * (0.16 + i * 0.22), y + h * (0.2 + Math.abs(i - 1.5) * 0.12), w * 0.17, h * 0.1, i % 2 ? '#4f8a5c' : '#5fa06a');
    ctx.restore();
  },
  thicketF(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .85;
      fillRR(ctx, x - 4, y + h * 0.38, 34, fy - y - h * 0.38, 12, '#245c38');
      fillRR(ctx, x + w - 30, y + h * 0.38, 34, fy - y - h * 0.38, 12, '#245c38');
      for (let k = 0; k < 5; k++) {
        leafy(ctx, x + 14, y + h * 0.46 + k * 20, 17, 13, '#2f7546', '#4caf6d', k * 5);
        leafy(ctx, x + w - 14, y + h * 0.46 + k * 20, 17, 13, '#2f7546', '#4caf6d', k * 9 + 3);
      }
      ctx.restore();
    }
    fillRR(ctx, x - 6, y, w + 12, h * 0.56, 18, '#1f5230');
    ctx.save(); rr(ctx, x - 6, y, w + 12, h * 0.56, 18); ctx.clip();
    for (let i = 0; i < w + 14; i += 16) {
      leafy(ctx, x + i, y + 10, 14, 11, '#2f7546', '#4caf6d', i);
      leafy(ctx, x + i + 8, y + h * 0.34, 12, 9, '#245c38', '#3f9c5c', i + 3);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i * 40 < w; i++) circle(ctx, x + 18 + i * 40, y + h * 0.5, 3.4, '#e2453c');
    ctx.restore();
  },
  logLedgeF(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y) {
      ctx.save(); ctx.globalAlpha = .7;
      fillRR(ctx, x + 6, y + 6, 26, fy - y - 6, 8, '#5c3f26');
      fillRR(ctx, x + w - 32, y + 8, 22, fy - y - 8, 8, '#5c3f26'); ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x, y + 12); ctx.quadraticCurveTo(x + w * 0.5, y + 2, x + w, y + 11);
    ctx.strokeStyle = '#6d4a2c'; ctx.lineWidth = 17; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#8a6440'; ctx.lineWidth = 6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i * 26 < w; i++) fillEll(ctx, x + 12 + i * 26, y + 3, 15, 6, i % 2 ? '#4f8a5c' : '#5fa06a');
    ctx.restore();
    for (let i = 0; i < 4; i++) leafy(ctx, x + 14 + (w - 28) * (i / 3), y + 26, 17, 12, '#2f8a4a', '#54b86c', i * 7);
  },
  mossDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .7;
    for (let i = 0; i < 5; i++) {
      const r = makeRng(i * 19 + 5);
      fillEll(ctx, x + r() * w, y + h * 0.5 + r() * h * 0.4, 13 + r() * 10, 5 + r() * 3, i % 2 ? '#4f8a5c' : '#5fa06a');
    }
    ctx.restore();
  },
  fernDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 4; i++) {
      const r = makeRng(i * 23 + 9), px = x + r() * w;
      for (let k = -1; k <= 1; k++)
        line(ctx, px, y + h, px + k * 11, y + h - 12 - r() * 6, '#3f9c5c', 2.6);
    }
    ctx.restore();
  },

  /* ==================== THE FOX CAVE ==================== */
  /* how the mouth of it reads from the forest floor: a slope of stone going
     down into the dark. Nothing here can be hit — she jumps it or runs in. */
  caveMouth(ctx, x, y, w, h) {
    const g = ctx.createLinearGradient(0, y, 0, y + h + 50);
    g.addColorStop(0, '#4a4038'); g.addColorStop(0.5, '#241f24'); g.addColorStop(1, '#12100f');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h + 60);
    const n = 5;
    for (let i = 0; i < n; i++) {
      const sx = x + i * (w / n) * 0.6, sy = y + 4 + i * (h / (n + 1));
      ctx.save(); ctx.globalAlpha = 1 - i * 0.14;
      fillRR(ctx, sx, sy, w - i * (w / n) * 0.48, h / (n + 1) - 3, 3, i % 2 ? '#7a7168' : '#8c8378');
      ctx.globalAlpha = (1 - i * 0.14) * 0.6;
      fillRR(ctx, sx, sy, w - i * (w / n) * 0.48, 3.5, 1, '#c9bda8');
      ctx.restore();
    }
    /* a warm glow far down it, so it looks lived in rather than empty */
    ctx.save(); ctx.globalAlpha = .32;
    const gg = ctx.createRadialGradient(x + w * 0.55, y + h * 0.86, 3, x + w * 0.55, y + h * 0.86, w * 0.7);
    gg.addColorStop(0, '#ffb06a'); gg.addColorStop(1, 'rgba(255,176,106,0)');
    ctx.fillStyle = gg; ctx.fillRect(x - 20, y, w + 40, h + 50); ctx.restore();
    /* mossy lip */
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i * 20 < w; i++) fillEll(ctx, x + 6 + i * 20, y - 1, 12, 6, i % 2 ? '#4f8a5c' : '#5fa06a');
    ctx.restore();
  },
  foxSign(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .95;
    line(ctx, x + w * 0.5, y + h, x + w * 0.5, y + h - 58, '#7a5a3a', 6);
    ctx.translate(x + w * 0.5, y + h - 74);
    ctx.rotate(-0.06);
    fillRR(ctx, -w * 0.36, -17, w * 0.72, 34, 6, '#c9a276');
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 2.6; ctx.stroke();
    /* a fox head burnt into the board, and an arrow pointing down */
    poly(ctx, [[-w * 0.2, -4], [-w * 0.1, -13], [-w * 0.05, -4]], '#e07a3a');
    poly(ctx, [[-w * 0.24, 2], [-w * 0.02, 2], [-w * 0.13, 12]], '#e07a3a');
    circle(ctx, -w * 0.17, 3, 1.6, '#3a2314'); circle(ctx, -w * 0.09, 3, 1.6, '#3a2314');
    ctx.fillStyle = '#5f4429'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('URVAS', w * 0.12, 5);
    ctx.restore();
  },
  stalagmite(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + 3, y + h);
    ctx.quadraticCurveTo(x + w * 0.36, y + h * 0.28, x + w * 0.5, y);
    ctx.quadraticCurveTo(x + w * 0.66, y + h * 0.3, x + w - 3, y + h);
    ctx.closePath();
    ctx.fillStyle = '#8c8378'; ctx.fill();
    ctx.strokeStyle = 'rgba(30,25,22,.5)'; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.4, y + h);
    ctx.quadraticCurveTo(x + w * 0.46, y + h * 0.34, x + w * 0.5, y + 4);
    ctx.strokeStyle = '#b8afa2'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
  },
  caveRock(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h);
    ctx.quadraticCurveTo(x + w * 0.1, y + h * 0.36, x + w * 0.42, y + h * 0.18);
    ctx.quadraticCurveTo(x + w * 0.8, y + h * 0.28, x + w - 2, y + h);
    ctx.closePath();
    ctx.fillStyle = '#7a7168'; ctx.fill();
    ctx.strokeStyle = 'rgba(25,20,18,.5)'; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .3;
    fillEll(ctx, x + w * 0.36, y + h * 0.46, w * 0.22, h * 0.14, '#a89e92'); ctx.restore();
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 3; i++) circle(ctx, x + w * (0.24 + i * 0.26), y + h * 0.34, 2.6, '#8fd6ff');
    ctx.restore();
  },
  crystalC(ctx, x, y, w, h, t) {
    const glow = .5 + Math.sin(t * 1.6) * .2;
    ctx.save(); ctx.globalAlpha = glow * .35;
    const g = ctx.createRadialGradient(x + w / 2, y + h * 0.5, 4, x + w / 2, y + h * 0.5, w);
    g.addColorStop(0, '#8fd6ff'); g.addColorStop(1, 'rgba(143,214,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x - w * 0.5, y - h * 0.3, w * 2, h * 1.6); ctx.restore();
    [[0.28, 0.3, 1], [0.54, 0.0, 1.25], [0.78, 0.42, 0.8]].forEach((c, i) => {
      const cx = x + w * c[0], top = y + h * c[1] + 4;
      poly(ctx, [[cx - 9 * c[2], y + h], [cx - 6 * c[2], top + 8], [cx, top],
        [cx + 6 * c[2], top + 8], [cx + 9 * c[2], y + h]], i % 2 ? '#6fc9ea' : '#8fd6ff');
      ctx.strokeStyle = 'rgba(20,60,80,.4)'; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.save(); ctx.globalAlpha = .55;
      poly(ctx, [[cx - 2, y + h], [cx, top + 3], [cx + 3, y + h]], '#e6f8ff'); ctx.restore();
    });
  },
  mushroomC(ctx, x, y, w, h, t) {
    const glow = .45 + Math.sin(t * 1.3) * .2;
    ctx.save(); ctx.globalAlpha = glow * .3;
    const g = ctx.createRadialGradient(x + w / 2, y + h * 0.4, 3, x + w / 2, y + h * 0.4, w * 0.9);
    g.addColorStop(0, '#a6e88f'); g.addColorStop(1, 'rgba(166,232,143,0)');
    ctx.fillStyle = g; ctx.fillRect(x - w * 0.4, y - 20, w * 1.8, h + 40); ctx.restore();
    [[0.26, 0.6, 1], [0.56, 0.34, 1.2], [0.82, 0.68, 0.85]].forEach((c, i) => {
      const cx = x + w * c[0], top = y + h * c[1], s = c[2];
      fillRR(ctx, cx - 4 * s, top, 8 * s, y + h - top, 4, '#d8e8c8');
      ctx.beginPath(); ctx.ellipse(cx, top + 2, 14 * s, 10 * s, 0, Math.PI, TAU); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#8fd67a' : '#a6e88f'; ctx.fill();
      ctx.save(); ctx.globalAlpha = .8;
      circle(ctx, cx - 4 * s, top - 4 * s, 2.4 * s, '#e6ffd8');
      circle(ctx, cx + 5 * s, top - 2 * s, 2 * s, '#e6ffd8'); ctx.restore();
    });
  },
  rootHang(ctx, x, y, w, h, t, pal, seed, o) {
    /* roots hanging through the cave roof — held up by the roof itself */
    hangTo(ctx, x, y, w, '#5c3f26', 5);
    fillRR(ctx, x - 6, y, w + 12, 15, 6, '#5c3f26');
    ctx.strokeStyle = 'rgba(20,14,8,.5)'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i * 17 < w + 8; i++) {
      const px = x + i * 17 + 4, drop = 16 + ((i * 37) % 26);
      ctx.beginPath(); ctx.moveTo(px, y + 12);
      ctx.quadraticCurveTo(px + ((i % 2) ? 6 : -6), y + 12 + drop * 0.6, px + ((i % 2) ? 3 : -3), y + 12 + drop);
      ctx.strokeStyle = i % 3 ? '#6d4a2c' : '#7c5636'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .7;
    for (let i = 0; i * 44 < w; i++) leafy(ctx, x + 20 + i * 44, y + 6, 13, 7, '#3f7a4a', '#5aa864', i * 5);
    ctx.restore();
  },
  caveArch(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + h) {
      ctx.save(); ctx.globalAlpha = .9;
      [x - 8, x + w - 24].forEach(px => {
        ctx.beginPath();
        ctx.moveTo(px + 4, y + h * 0.4);
        ctx.quadraticCurveTo(px - 6, fy - (fy - y) * 0.4, px + 2, fy);
        ctx.lineTo(px + 32, fy);
        ctx.quadraticCurveTo(px + 22, fy - (fy - y) * 0.4, px + 28, y + h * 0.4);
        ctx.closePath(); ctx.fillStyle = '#6b6259'; ctx.fill();
      });
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x - 10, y + h * 0.5);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.16, x + w + 10, y + h * 0.5);
    ctx.lineTo(x + w + 10, y - 4); ctx.lineTo(x - 10, y - 4); ctx.closePath();
    ctx.fillStyle = '#5f574f'; ctx.fill();
    ctx.strokeStyle = 'rgba(20,16,14,.5)'; ctx.lineWidth = 2.4; ctx.stroke();
    /* stalactites hanging off the underside of it */
    for (let i = 0; i * 24 < w; i++) {
      const px = x + 12 + i * 24, d = 12 + ((i * 29) % 16);
      poly(ctx, [[px - 6, y + h * 0.36], [px + 6, y + h * 0.36], [px, y + h * 0.36 + d]], '#8c8378');
    }
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i * 52 < w; i++) circle(ctx, x + 26 + i * 52, y + h * 0.2, 3, '#8fd6ff');
    ctx.restore();
  },
  caveLedge(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = o && o.floorY;
    if (fy != null && fy > y + 14) {
      ctx.save(); ctx.globalAlpha = .8;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 14); ctx.lineTo(x + 26, fy);
      ctx.lineTo(x + w - 26, fy); ctx.lineTo(x + w - 12, y + 14); ctx.closePath();
      ctx.fillStyle = '#5f574f'; ctx.fill(); ctx.restore();
    }
    fillRR(ctx, x, y, w, 15, 4, '#7a7168');
    ctx.strokeStyle = 'rgba(25,20,18,.5)'; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x + 2, y + 1, w - 4, 4, 2, '#a89e92');
    ctx.globalAlpha = .35;
    for (let i = 0; i * 32 < w; i++) line(ctx, x + 10 + i * 32, y + 6, x + 22 + i * 32, y + 14, '#4f4842', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .75;
    for (let i = 0; i * 46 < w; i++) circle(ctx, x + 18 + i * 46, y - 3, 3, '#a6e88f');
    ctx.restore();
  },
  caveExit(ctx, x, y, w, h) {
    /* daylight at the top of the way out */
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#cfe8b8'); g.addColorStop(1, '#6b7a58');
    ctx.save(); ctx.globalAlpha = .85;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h); ctx.lineTo(x + 4, y + h * 0.34);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.16, x + w - 4, y + h * 0.34);
    ctx.lineTo(x + w - 4, y + h); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i < 4; i++)
      poly(ctx, [[x + 10 + i * 24, y + h], [x + 22 + i * 24, y + h], [x + 40 + i * 24, y + h * 0.2], [x + 30 + i * 24, y + h * 0.2]], '#f6ffd8');
    ctx.restore();
    for (let i = 0; i * 22 < w; i++) fillEll(ctx, x + 8 + i * 22, y + h * 0.34, 13, 7, i % 2 ? '#4f8a5c' : '#5fa06a');
  },
  pebblesC(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 6; i++) {
      const r = makeRng(i * 21 + 3);
      fillEll(ctx, x + r() * w, y + h * 0.5 + r() * h * 0.4, 4 + r() * 5, 3 + r() * 2, i % 2 ? '#8c8378' : '#6b6259');
    }
    ctx.restore();
  },
  /* the very end of the pier: the rail stops, and there is only sea */
  pierEnd(ctx, x, y, w, h, t) {
    /* the deck's last few planks, then the drop */
    fillRR(ctx, x, y + h - 30, w, 14, 2, '#d8b98a');
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i * 30 < w; i++) line(ctx, x + i * 30, y + h - 30, x + i * 30, y + h - 17, '#9a7550', 2.4);
    ctx.restore();
    fillRR(ctx, x, y + h - 17, w, 9, 2, '#8a6440');
    /* the rail turning the corner and stopping */
    line(ctx, x + 8, y + h - 30, x + 8, y + h - 128, '#3f4a5c', 6);
    line(ctx, x + w - 12, y + h - 30, x + w - 12, y + h - 128, '#3f4a5c', 7);
    fillRR(ctx, x + 2, y + h - 134, w - 4, 9, 4, '#3f4a5c');
    fillRR(ctx, x + 2, y + h - 96, w - 20, 6, 3, '#4a5468');
    circle(ctx, x + w - 9, y + h - 136, 8, '#4a5468');
    /* a life ring on the last post, and a DIVE-here sign nobody reads */
    ctx.save(); ctx.translate(x + w * 0.42, y + h - 84);
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU);
    ctx.strokeStyle = '#f2ece0'; ctx.lineWidth = 8; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU); ctx.lineWidth = 8;
    ctx.setLineDash([11, 11]); ctx.strokeStyle = '#e2453c'; ctx.stroke();
    ctx.restore();
    /* the water waiting below, with the sun on it */
    ctx.save(); ctx.globalAlpha = .8;
    const g = ctx.createLinearGradient(0, y + h - 8, 0, y + h + 130);
    g.addColorStop(0, '#5fb8cc'); g.addColorStop(1, '#2f7fa8');
    ctx.fillStyle = g; ctx.fillRect(x - 40, y + h - 8, w + 80, 140);
    ctx.globalAlpha = .45;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      for (let px = -40; px <= w + 40; px += 10)
        ctx.lineTo(x + px, y + h + 6 + k * 16 + Math.sin(px * 0.05 + t * 1.2 + k) * 3);
      ctx.strokeStyle = '#eaf9ff'; ctx.lineWidth = 2.4; ctx.stroke();
    }
    ctx.restore();
  },
  /* the stone doorway between the two halls of the fox cave */
  caveGate(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.lineTo(x, y + h * 0.42);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.14, x + w, y + h * 0.42);
    ctx.lineTo(x + w, y + h); ctx.closePath();
    ctx.fillStyle = '#1c1714'; ctx.fill();
    ctx.strokeStyle = '#6b6259'; ctx.lineWidth = 7; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    const g = ctx.createRadialGradient(x + w * 0.5, y + h * 0.7, 4, x + w * 0.5, y + h * 0.7, w * 0.8);
    g.addColorStop(0, '#ffb06a'); g.addColorStop(1, 'rgba(255,176,106,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 20, y, w + 40, h); ctx.restore();
    for (let i = 0; i * 22 < w; i++) {
      const d = 10 + imod(i * 31, 16);
      poly(ctx, [[x + 8 + i * 22 - 6, y + h * 0.4], [x + 8 + i * 22 + 6, y + h * 0.4],
        [x + 8 + i * 22, y + h * 0.4 + d]], '#8c8378');
    }
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 3; i++) circle(ctx, x + w * (0.2 + i * 0.3), y + h * 0.3, 3, '#8fd6ff');
    ctx.restore();
  }
});

/* ---- aliases: same shape, themed name, no duplicated drawing ---- */
Object.assign(PROPS, {
  wetPaw: PROPS.pawPrints,
  seabedRock: PROPS.rockWet,
  rootF: PROPS.roots,
  branchF: PROPS.branchY,
  stumpF: PROPS.stump,
  poolLedge: PROPS.poolBar,
  seaLedge: PROPS.wreckLedge,
  reefRock: PROPS.coralRock
});

/* ---- how wide each of them wants to be before it repeats ---- */
Object.assign(PROP_NATURAL, {
  bedLux: 235, sofaLux: 205, consoleLux: 190, receptionDesk: 210, corridorArch: 175,
  curtainLux: 150, lobbyArch: 180, chandelierLow: 150, cabana: 190, parasol: 170,
  umbrellaOpen: 170, poolBar: 190, poolLedge: 190, sunLounger: 165, boardwalkLedge: 195,
  netArch: 175, pierArch: 175, pierBench: 175, kioskLedge: 185, promArch: 175,
  benchProm: 165, rowboat: 175, kelpArch: 185, kelpTunnel: 175, wreckBeam: 175,
  wreckHull: 185, wreckLedge: 195, wreckDeck: 195, seaLedge: 195, logLedgeF: 205,
  thicketF: 180, rootHang: 165, caveArch: 175, caveLedge: 190, driftwood: 130,
  logF: 145, plankGrain: 120, promStone: 130, poolTile: 110, rugLux: 150,
  sandRipple: 120, mossDeco: 120, fernDeco: 110, seagrass: 120, bubblesDeco: 120,
  shells: 110, ropeCoil: 90, marbleShine: 110, pebblesC: 110,
  cannonW: 130, caveExit: 150, pierEnd: 130, caveGate: 130,
  deckchair: 108, sandcastle: 104, rockWet: 118, seabedRock: 118, boulderF: 120,
  fernF: 100, mushroomF: 100, coralRock: 118, reefRock: 118, clamShell: 104,
  anemone: 90, amphora: 86, chestW: 110, barrelW: 92, anchorW: 104,
  stalagmite: 88, caveRock: 118, crystalC: 96, mushroomC: 100, palmPot: 96,
  armchairLux: 110, suitcaseStack: 104, housekeeping: 130, roomCart: 126,
  iceCart: 128, planterProm: 112, bikeProm: 130, poolFloat: 110, towelStack: 96,
  trunkLux: 112, poufLux: 96, lampLux: 84, vaseTall: 80, champagne: 80,
  velvetRope: 140, bollard: 78, pierCrate: 108, lifering: 86, fishBox: 104,
  beachBall: 88, starRock: 112, gull: 0
});

/* ---- and the size each of them naturally is ---- */
Object.assign(PROP_SIZE, {
  trunkLux: [80, 58], poufLux: [66, 48], lampLux: [52, 88], roomCart: [94, 66],
  champagne: [50, 76], vaseTall: [50, 90], housekeeping: [100, 68], suitcaseStack: [76, 74],
  palmPot: [66, 86], velvetRope: [110, 56], armchairLux: [82, 76], bedLux: [180, 70],
  sofaLux: [170, 66], sunLounger: [128, 56], poolFloat: [78, 62], towelStack: [66, 58],
  benchProm: [124, 58], iceCart: [96, 76], planterProm: [80, 58], bikeProm: [100, 64],
  sandcastle: [70, 62], beachBall: [58, 56], deckchair: [76, 68], driftwood: [100, 44],
  rowboat: [160, 60], bollard: [48, 54], pierCrate: [76, 56], lifering: [54, 78],
  fishBox: [72, 52], coralRock: [84, 60], anemone: [60, 62], clamShell: [76, 52],
  amphora: [54, 78], starRock: [80, 52], anchorW: [74, 78], chestW: [82, 58],
  barrelW: [60, 68], cannonW: [100, 52], rockWet: [82, 54], seabedRock: [82, 54],
  reefRock: [84, 60], fernF: [80, 60], mushroomF: [70, 54], logF: [116, 52],
  boulderF: [88, 60], stumpF: [66, 46], rootF: [86, 44], stalagmite: [56, 64],
  caveRock: [84, 56], crystalC: [62, 68], mushroomC: [68, 52], gull: [58, 40]
});

/* ---------------------------------------------------------------
   The foxes of the cave. They are not props — nothing can hit them
   and they are not part of the track. They simply run the path Lota
   ran, a little way behind her, for as long as she is down there.

   Same local space as Lota: origin between the paws, y grows down.
----------------------------------------------------------------*/
const FOX = { coat: '#e07a3a', coatD: '#bf5e28', bib: '#f6e6d2', sock: '#3a2b22', tip: '#fff4e6' };
function drawFox(ctx, px, py, scale, run, state, tilt, t) {
  const s = scale == null ? 1 : scale;
  const air = state === 'jump';
  const cyc = run || 0;
  ctx.save();
  ctx.translate(px, py); ctx.scale(s, s); ctx.rotate(tilt || 0);

  ctx.save(); ctx.globalAlpha = air ? .12 : .24;
  fillEll(ctx, 2, 2, 26, 6, '#000'); ctx.restore();

  const bob = air ? -6 : Math.abs(Math.sin(cyc)) * 3;
  ctx.translate(0, -bob);

  /* the tail: big, bushy, and always doing something */
  const sw = Math.sin(cyc * 0.5 + (t || 0) * 2) * 0.34;
  ctx.save(); ctx.translate(-20, -26); ctx.rotate(-0.5 + sw);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-22, -14, -40, -4);
  ctx.strokeStyle = FOX.coat; ctx.lineWidth = 17; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-30, -8); ctx.quadraticCurveTo(-38, -8, -42, -3);
  ctx.strokeStyle = FOX.tip; ctx.lineWidth = 15; ctx.stroke();
  ctx.restore();

  /* back legs, then body, then front legs, so the near pair reads */
  const swing = air ? 0.9 : Math.sin(cyc);
  const swing2 = air ? -0.7 : Math.sin(cyc + Math.PI);
  const leg = (hx, hy, ph, bend) => {
    const fx = hx + ph * 11, fy = -3 + (air ? -6 : Math.max(0, -ph) * 5);
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.quadraticCurveTo(hx + ph * 5 + bend, hy + 11, fx, fy);
    ctx.strokeStyle = FOX.coat; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx + ph * 7 + bend * .5, hy + 12); ctx.lineTo(fx, fy);
    ctx.strokeStyle = FOX.sock; ctx.lineWidth = 6; ctx.stroke();
  };
  leg(-14, -20, swing2, -2);
  leg(11, -20, swing, 2);

  ctx.beginPath();
  ctx.moveTo(-20, -24);
  ctx.quadraticCurveTo(-6, -36, 12, -33);
  ctx.quadraticCurveTo(24, -30, 22, -20);
  ctx.quadraticCurveTo(6, -13, -12, -16);
  ctx.closePath();
  ctx.fillStyle = FOX.coat; ctx.fill();
  ctx.save(); ctx.globalAlpha = .8;
  ctx.beginPath();
  ctx.moveTo(-4, -16); ctx.quadraticCurveTo(10, -14, 20, -20);
  ctx.strokeStyle = FOX.bib; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();

  leg(-9, -22, swing, 0);
  leg(16, -22, swing2, 0);

  /* head, with the ears up and the nose out front */
  ctx.save(); ctx.translate(22, -34); ctx.rotate(air ? -0.16 : Math.sin(cyc) * 0.06);
  poly(ctx, [[-8, -2], [-11, -17], [-1, -6]], FOX.coat);
  poly(ctx, [[6, -3], [4, -18], [13, -5]], FOX.coat);
  poly(ctx, [[-7, -4], [-9, -14], [-2, -7]], '#8a4a24');
  poly(ctx, [[6, -5], [5, -15], [11, -7]], '#8a4a24');
  fillEll(ctx, 0, 0, 12, 10, FOX.coat);
  /* the pale mask round the muzzle */
  ctx.beginPath();
  ctx.moveTo(4, -3); ctx.quadraticCurveTo(16, -1, 17, 4);
  ctx.quadraticCurveTo(10, 8, 2, 6); ctx.closePath();
  ctx.fillStyle = FOX.bib; ctx.fill();
  circle(ctx, 17, 3, 2.6, '#2b1d18');
  circle(ctx, -2, -2, 2.2, '#2b1d18');
  circle(ctx, 7, -3, 2.2, '#2b1d18');
  ctx.save(); ctx.globalAlpha = .8;
  circle(ctx, -2.7, -2.8, .9, '#fff'); circle(ctx, 6.3, -3.8, .9, '#fff'); ctx.restore();
  /* a small pink tongue, because they are pleased she came */
  if (imod(Math.floor(cyc * 0.5), 3) === 0)
    fillEll(ctx, 13, 7, 3.4, 2.4, '#ff8fa8', 0.3);
  ctx.restore();
  ctx.restore();
}
