'use strict';
/* ---------------------------------------------------------------
   props3.js — everything level 3 is built out of: the airship, the
   sky tower, the orchard and the glasshouses, the marble quarry,
   the salt mine, the rocket and what is above the sky.

   Same contract as props.js and props2.js:
   (ctx, x, y, w, h, t, pal, seed, o) with (x, y) the top-left of the
   object's box and y growing down. `o.floorY` is the screen y of the
   floor under the object — that is what legsTo()/hangTo() need to
   hold a hanging thing up over her head.
----------------------------------------------------------------*/

/* the airship's one recurring note: a riveted seam of doped fabric */
function seamRun(ctx, x, y, w, col, n) {
  ctx.save(); ctx.globalAlpha = .5;
  for (let i = 0; i < (n || 6); i++) circle(ctx, x + w * ((i + 0.5) / (n || 6)), y, 1.7, col);
  ctx.restore();
}
/* brushed metal: one gradient and a few scratches, used all over the
   gantry, the silo and the station */
function steelBox(ctx, x, y, w, h, r, c1, c2) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, shade(c2, -.2));
  fillRR(ctx, x, y, w, h, r); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
  ctx.save(); ctx.globalAlpha = .3;
  for (let i = 0; i < 3; i++) line(ctx, x + 5 + i * 9, y + h * 0.3, x + 9 + i * 9, y + h * 0.72, '#fff', 1.4);
  ctx.restore();
}
/* the yellow-and-black warning chevron that says "works" everywhere */
function hazardTape(ctx, x, y, w, h) {
  ctx.save(); rr(ctx, x, y, w, h, 2); ctx.clip();
  ctx.fillStyle = '#f0c23a'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#2b2634';
  for (let px = -h; px < w + h; px += h * 1.7) {
    poly(ctx, [[x + px, y + h], [x + px + h * .8, y], [x + px + h * 1.5, y], [x + px + h * .7, y + h]], '#2b2634');
  }
  ctx.restore();
}

Object.assign(PROPS, {

  /* ==================== 1 · THE BACK OF THE AIRSHIP ==================== */
  /* everything up here is bolted to a curved fabric skin, so it all sits on
     a little foot rather than straight on the "ground" */
  ventCowl(ctx, x, y, w, h) {
    const cx = x + w / 2;
    ctx.beginPath();
    ctx.moveTo(x + w * .18, y + h);
    ctx.lineTo(x + w * .18, y + h * .42);
    ctx.quadraticCurveTo(x + w * .2, y, x + w * .78, y + h * .06);
    ctx.lineTo(x + w * .82, y + h * .5);
    ctx.lineTo(x + w * .82, y + h);
    ctx.closePath();
    ctx.fillStyle = '#b8c4d0'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .55;
    fillEll(ctx, x + w * .5, y + h * .1, w * .3, h * .1, '#2f3a48'); ctx.restore();
    fillRR(ctx, x + w * .1, y + h - 9, w * .8, 9, 3, '#8b98a6');
    ctx.save(); ctx.globalAlpha = .4;
    line(ctx, cx, y + h * .34, cx, y + h - 12, '#5f6c7a', 2); ctx.restore();
  },
  riggingCleat(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .12, y + h * .62, w * .76, h * .38, 4, '#7f8b99');
    outline(ctx, INK, 2.2);
    ctx.strokeStyle = '#c8d2dc'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + w * .2, y + h * .64);
    ctx.quadraticCurveTo(x + w * .5, y - h * .12, x + w * .8, y + h * .64); ctx.stroke();
    ctx.strokeStyle = '#e6b46a'; ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.moveTo(x + w * (.28 + i * .13), y + h * .3);
      ctx.lineTo(x + w * (.34 + i * .13), y + h * .5);
    }
    ctx.stroke();
  },
  antennaBox(ctx, x, y, w, h) {
    steelBox(ctx, x + w * .1, y + h * .45, w * .8, h * .55, 5, '#d0d8e2', '#96a2b0');
    line(ctx, x + w * .3, y + h * .45, x + w * .3, y, '#6f7c8a', 4);
    line(ctx, x + w * .7, y + h * .45, x + w * .7, y + h * .12, '#6f7c8a', 4);
    circle(ctx, x + w * .3, y - 1, 4.4, '#e2453c');
    circle(ctx, x + w * .7, y + h * .1, 3.4, '#8fd6ff');
    ctx.save(); ctx.globalAlpha = .5;
    line(ctx, x + w * .3, y + 4, x + w * .7, y + h * .16, '#c8d2dc', 1.6); ctx.restore();
  },
  sunPanel(ctx, x, y, w, h) {
    /* a tilted solar wing on two short legs */
    ctx.save();
    ctx.translate(x + w / 2, y + h * .5); ctx.rotate(-0.16);
    fillRR(ctx, -w * .46, -h * .3, w * .92, h * .42, 4, '#22355c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 1; i < 5; i++) line(ctx, -w * .46 + w * .92 * (i / 5), -h * .3, -w * .46 + w * .92 * (i / 5), h * .12, '#5f7fc4', 2);
    line(ctx, -w * .46, -h * .1, w * .46, -h * .1, '#5f7fc4', 2);
    ctx.globalAlpha = .35;
    fillRR(ctx, -w * .4, -h * .26, w * .3, h * .1, 2, '#cfe4ff'); ctx.restore();
    ctx.restore();
    line(ctx, x + w * .28, y + h * .55, x + w * .3, y + h, '#7f8b99', 6);
    line(ctx, x + w * .72, y + h * .48, x + w * .7, y + h, '#7f8b99', 6);
  },
  airLamp(ctx, x, y, w, h, t) {
    line(ctx, x + w / 2, y + h * .3, x + w / 2, y + h, '#7f8b99', 7);
    fillRR(ctx, x + w * .18, y + h * .1, w * .64, h * .3, 6, '#d0d8e2');
    outline(ctx, INK, 2.2);
    const on = .5 + Math.sin(t * 3.2) * .32;
    ctx.save(); ctx.globalAlpha = on * .5;
    circle(ctx, x + w / 2, y + h * .28, w * .5, '#ffd870'); ctx.restore();
    circle(ctx, x + w / 2, y + h * .28, w * .17, '#fff3c4');
    fillRR(ctx, x + w * .22, y + h - 8, w * .56, 8, 3, '#8b98a6');
  },
  /* over: a guy wire strung across her lane with pennants on it */
  guyWire(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#8b98a6', 3);
    ctx.strokeStyle = '#c8d2dc'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 6, y + h * .3);
    ctx.quadraticCurveTo(x + w / 2, y + h * .62, x + w + 6, y + h * .3); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const f = (i + .5) / 5, px = x + w * f;
      const py = y + h * .3 + Math.sin(f * Math.PI) * h * .3;
      const sway = Math.sin(t * 2.4 + i) * 4;
      poly(ctx, [[px, py], [px + 20 + sway, py + 6], [px, py + 20]],
        ['#e2453c', '#f0c23a', '#4fc3ea', '#8fe0a8', '#ffffff'][i % 5]);
    }
    fillRR(ctx, x + w * .38, y + h * .05, w * .24, h * .2, 5, '#96a2b0');
  },
  /* tunnel: a sleeve of doped canvas she runs through */
  canvasSleeve(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#8b98a6', 8, 4);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e8edf2'); g.addColorStop(1, '#b4c0cc');
    fillRR(ctx, x, y, w, h, 16); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 22; px < x + w - 10; px += 34) {
      ctx.beginPath(); ctx.ellipse(px, y + h * .55, 5, h * .46, 0, 0, TAU);
      ctx.strokeStyle = '#7f8b99'; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .3; fillRR(ctx, x + 6, y + 5, w - 12, 6, 3, '#fff'); ctx.restore();
  },
  /* ledge: the catwalk that runs the length of her back */
  catwalkA(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .5, 3, '#96a2b0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 8; px < x + w - 4; px += 14) line(ctx, px, y + 3, px, y + h * .5 - 3, '#5f6c7a', 2);
    ctx.restore();
    /* the handrail on the far side, and the struts under it */
    ctx.save(); ctx.globalAlpha = .8;
    line(ctx, x + 4, y - 20, x + w - 4, y - 20, '#c8d2dc', 3);
    for (let px = x + 12; px < x + w; px += 46) line(ctx, px, y - 20, px, y, '#c8d2dc', 3);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 20; px < x + w; px += 52) line(ctx, px, y + h * .5, px - 10, y + h, '#7f8b99', 4);
    ctx.restore();
  },
  finA(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.lineTo(x + w * .32, y);
    ctx.lineTo(x + w, y + h * .18); ctx.lineTo(x + w, y + h); ctx.closePath();
    ctx.fillStyle = '#dbe3ea'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .45;
    line(ctx, x + w * .34, y + h * .2, x + w * .94, y + h * .34, '#8b98a6', 2.4);
    line(ctx, x + w * .2, y + h * .6, x + w * .96, y + h * .66, '#8b98a6', 2.4);
    ctx.restore();
    fillRR(ctx, x + w * .55, y + h * .3, w * .3, h * .2, 3, '#e2453c');
  },
  seamA(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .8;
    line(ctx, x, y + h * .5, x + w, y + h * .5, '#b4c0cc', 3);
    seamRun(ctx, x, y + h * .5, w, '#7f8b99', Math.max(4, Math.round(w / 16)));
    ctx.restore();
  },
  rivets(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < Math.round(w / 14); i++)
      circle(ctx, x + 7 + i * 14, y + h * .5 + ((i % 2) * 3), 2, '#8b98a6');
    ctx.restore();
  },
  hatchAir(ctx, x, y, w, h, t, pal, seed, o) {
    /* the way down off her back and into the gondola */
    fillRR(ctx, x, y, w, h, 12, '#8b98a6');
    fillRR(ctx, x + 8, y + 8, w - 16, h - 16, 9, '#22303f');
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x + 14, y + 14, w - 28, h * .3, 6, '#3f5468'); ctx.restore();
    for (let i = 0; i < 6; i++) {
      const a = t * .6 + i * (TAU / 6);
      circle(ctx, x + w * .5 + Math.cos(a) * (w * .28), y + h * .55 + Math.sin(a) * (w * .28), 3.4, '#d0d8e2');
    }
    circle(ctx, x + w * .5, y + h * .55, w * .1, '#e6b46a');
    ctx.fillStyle = '#dbe3ea'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('↓ SALONAS', x + w * .5, y + h - 12);
  },

  /* ==================== 2 · THE AIRSHIP'S SALON ==================== */
  wickerChair(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .06, y, w * .34, h, 12, '#d8b98a');
    fillRR(ctx, x, y + h * .45, w, h * .55, 10, '#e2c79c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 1; i < 5; i++) line(ctx, x + w * (i / 5), y + h * .48, x + w * (i / 5), y + h * .95, '#a8834f', 2);
    for (let i = 1; i < 3; i++) line(ctx, x + 4, y + h * (.45 + i * .18), x + w - 4, y + h * (.45 + i * .18), '#a8834f', 2);
    ctx.restore();
    fillRR(ctx, x + w * .42, y + h * .38, w * .5, h * .2, 6, '#7f9ec4');
  },
  teaTrolley(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x + w * .04, y + h * .04, w * .92, 8, 3, '#e8e0cc');
    fillRR(ctx, x + w * .04, y + h * .52, w * .92, 7, 3, '#e8e0cc');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    [x + w * .1, x + w * .86].forEach(px => line(ctx, px, y + 8, px, y + h - 11, '#c9a86a', 5));
    /* what is on it */
    fillRR(ctx, x + w * .16, y + h * .04 - 15, 22, 15, 4, '#f6efe2');
    circle(ctx, x + w * .16 + 11, y + h * .04 - 19, 4, '#c9a86a');
    fillRR(ctx, x + w * .5, y + h * .04 - 12, 16, 12, 3, '#e2453c');
    fillEll(ctx, x + w * .74, y + h * .04 - 7, 11, 7, '#8fd6ff');
    wheel(ctx, x + w * .14, y + h - 8, 8, '#3f3a4a');
    wheel(ctx, x + w * .84, y + h - 8, 8, '#3f3a4a');
  },
  globeStand(ctx, x, y, w, h, t) {
    const cx = x + w / 2, r = Math.min(w, h) * .3;
    line(ctx, cx, y + h * .5, cx, y + h - 4, '#7a5434', 7);
    fillEll(ctx, cx, y + h - 3, w * .3, 6, '#5f4429');
    circle(ctx, cx, y + h * .38, r, '#4f9cc4');
    ctx.save(); ctx.beginPath(); ctx.arc(cx, y + h * .38, r, 0, TAU); ctx.clip();
    ctx.fillStyle = '#7fc48f';
    ctx.beginPath();
    ctx.ellipse(cx - r * .3 + Math.sin(t * .4) * r * .3, y + h * .32, r * .5, r * .3, .3, 0, TAU); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * .5 + Math.sin(t * .4) * r * .3, y + h * .5, r * .35, r * .22, -.2, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, y + h * .38, r + 4, -0.9, 2.4);
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 4; ctx.stroke();
  },
  hatBoxes(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .06, y + h * .5, w * .88, h * .5, 7, '#c96f8a');
    fillRR(ctx, x + w * .16, y + h * .18, w * .68, h * .34, 7, '#e8dcc0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .7;
    line(ctx, x + w * .5, y + h * .18, x + w * .5, y + h, '#8a5f7a', 3);
    line(ctx, x + w * .16, y + h * .35, x + w * .84, y + h * .35, '#8a5f7a', 3);
    ctx.restore();
    fillRR(ctx, x + w * .34, y + h * .1, w * .32, 9, 4, '#c9a86a');
  },
  brassFan(ctx, x, y, w, h, t) {
    const cx = x + w / 2, cy = y + h * .38, r = Math.min(w, h) * .34;
    line(ctx, cx, cy, cx, y + h - 4, '#8a6a45', 6);
    fillEll(ctx, cx, y + h - 3, w * .28, 6, '#5f4429');
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 4);
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.rotate(i * TAU / 3);
      fillEll(ctx, r * .55, 0, r * .55, r * .22, '#e6c17a');
      ctx.restore();
    }
    ctx.restore();
    circle(ctx, cx, cy, r * .22, '#c9a86a');
    ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, TAU);
    ctx.strokeStyle = '#b8955c'; ctx.lineWidth = 3; ctx.stroke();
  },
  /* over: the row of lamps down the middle of the salon ceiling */
  lampRow(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#c9a86a', 3);
    fillRR(ctx, x, y + h * .1, w, h * .3, 8, '#e8dcc0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const px = x + w * (0.2 + i * 0.3);
      ctx.beginPath();
      ctx.moveTo(px - 13, y + h * .4); ctx.lineTo(px + 13, y + h * .4);
      ctx.lineTo(px + 8, y + h * .74); ctx.lineTo(px - 8, y + h * .74); ctx.closePath();
      ctx.fillStyle = '#fdf3d8'; ctx.fill();
      ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 2 + i) * .1;
      circle(ctx, px, y + h * .8, 24, '#ffe7a8'); ctx.restore();
    }
  },
  archSalon(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#c9a86a', 10, 6);
    fillRR(ctx, x, y, w, h * .34, 6, '#e8dcc0');
    ctx.save(); ctx.globalAlpha = .85;
    fillRR(ctx, x + 4, y + h * .3, w - 8, 6, 3, '#c9a86a'); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    /* velvet swags hanging out of it, well clear of a ducked dog */
    swag(ctx, x + 4, y + h * .34, w - 8, h * .3, '#8a3f5c', '#6f2f47', 5);
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 16; px < x + w - 8; px += 40) circle(ctx, px, y + h * .12, 3, '#c9a86a');
    ctx.restore();
  },
  sideboardA(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .34, 4, '#8a6a45');
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x + 4, y + 3, w - 8, 4, 2, '#c9a86a'); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    legsTo(ctx, x, y + h * .3, w, o, '#7a5434', 9, 12);
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 14; px < x + w - 10; px += 44) fillRR(ctx, px, y + h * .38, 34, h * .34, 3, '#6f5232');
    ctx.restore();
  },
  divanA(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * .22, w, h * .78, 12, '#8a3f5c');
    fillRR(ctx, x + 6, y + h * .1, w * .34, h * .3, 10, '#9c4f6c');
    fillRR(ctx, x + w * .5, y + h * .12, w * .44, h * .26, 10, '#9c4f6c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 1; i < 4; i++) circle(ctx, x + w * (i / 4), y + h * .55, 3.4, '#c9a86a');
    ctx.restore();
    fillRR(ctx, x + 4, y + h - 9, w - 8, 9, 3, '#5f4429');
  },
  pianoA(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * .18, w, h * .48, 8, '#2b2119');
    ctx.beginPath();
    ctx.moveTo(x + w * .1, y + h * .18);
    ctx.quadraticCurveTo(x + w * .55, y - h * .1, x + w * .96, y + h * .2);
    ctx.lineTo(x + w * .96, y + h * .24); ctx.closePath();
    ctx.fillStyle = '#3a2c22'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .95;
    fillRR(ctx, x + 4, y + h * .5, w - 8, 9, 2, '#f6efe2');
    for (let q = 0; q < Math.round(w / 12); q++) fillRR(ctx, x + 8 + q * 12, y + h * .5, 4, 6, 1, '#2b2119');
    ctx.restore();
    [x + w * .12, x + w * .84].forEach(px => line(ctx, px, y + h * .66, px, y + h, '#2b2119', 7));
  },
  runnerRug(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 5, '#8a3f5c');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + 6, y + 3, w - 12, h - 6, 3, '#a85a78');
    for (let px = x + 14; px < x + w - 8; px += 26) circle(ctx, px, y + h * .5, 3, '#e8dcc0');
    ctx.restore();
  },

  /* ==================== 3 · THE MOORING GANTRY ==================== */
  toolChest(ctx, x, y, w, h) {
    steelBox(ctx, x, y + h * .18, w, h * .82, 5, '#e2453c', '#a8302c');
    fillRR(ctx, x + w * .1, y, w * .8, h * .22, 4, '#c93c34');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 3; i++) fillRR(ctx, x + 5, y + h * (.3 + i * .22), w - 10, 5, 2, '#f0e0d0');
    ctx.restore();
    fillRR(ctx, x + w * .38, y + h * .04, w * .24, 6, 3, '#8b98a6');
  },
  cableDrum(ctx, x, y, w, h) {
    const cx = x + w / 2, cy = y + h * .5;
    fillRR(ctx, x + w * .12, y, w * .76, h, 6, '#5f4429');
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 7; i++) {
      const yy = y + h * .1 + i * (h * .8 / 7);
      line(ctx, x + w * .16, yy, x + w * .84, yy, i % 2 ? '#8b98a6' : '#6f7c8a', h * .8 / 7 - 1);
    }
    ctx.restore();
    [x + w * .1, x + w * .9].forEach(px => {
      fillEll(ctx, px, cy, w * .1, h * .52, '#7a5434');
      ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    });
    ctx.save(); ctx.globalAlpha = .4; circle(ctx, x + w * .1, cy, w * .04, '#3f2d1c'); ctx.restore();
  },
  sandbagM(ctx, x, y, w, h) {
    for (let i = 0; i < 3; i++) {
      const bx = x + (i % 2) * w * .14, by = y + h * (i * .32);
      fillEll(ctx, bx + w * .43, by + h * .22, w * .42, h * .19, i % 2 ? '#b9a882' : '#a89572');
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.globalAlpha = .35;
      line(ctx, bx + w * .18, by + h * .2, bx + w * .68, by + h * .24, '#7f6f52', 2); ctx.restore();
    }
  },
  beaconM(ctx, x, y, w, h, t) {
    line(ctx, x + w / 2, y + h * .34, x + w / 2, y + h, '#6f7c8a', 8);
    fillRR(ctx, x + w * .2, y + h * .34, w * .6, 8, 3, '#8b98a6');
    const on = (Math.sin(t * 3) > 0);
    ctx.save(); ctx.globalAlpha = on ? .55 : .12;
    circle(ctx, x + w / 2, y + h * .2, w * .55, '#e2453c'); ctx.restore();
    fillRR(ctx, x + w * .28, y + h * .05, w * .44, h * .3, 8, on ? '#ff6b5f' : '#a8302c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x + w * .34, y + h * .09, w * .12, h * .16, 4, '#fff'); ctx.restore();
  },
  windSock(ctx, x, y, w, h, t) {
    line(ctx, x + w * .16, y, x + w * .16, y + h, '#8b98a6', 6);
    const sw = Math.sin(t * 1.6) * 5;
    for (let i = 0; i < 4; i++) {
      const f = i / 4, f2 = (i + 1) / 4;
      const y0 = y + h * .1 + sw * f, r0 = h * .2 * (1 - f * .45), r1 = h * .2 * (1 - f2 * .45);
      poly(ctx, [
        [x + w * (.18 + f * .8), y0 - r0], [x + w * (.18 + f2 * .8), y0 + sw * .25 - r1],
        [x + w * (.18 + f2 * .8), y0 + sw * .25 + r1], [x + w * (.18 + f * .8), y0 + r0]
      ], i % 2 ? '#f0f0f0' : '#e2453c');
    }
    circle(ctx, x + w * .18, y + h * .1, 4, '#6f7c8a');
  },
  crateM(ctx, x, y, w, h) {
    steelBox(ctx, x, y, w, h, 4, '#c8cfd8', '#8b98a6');
    hazardTape(ctx, x + 4, y + h * .5, w - 8, 10);
    ctx.save(); ctx.globalAlpha = .5;
    line(ctx, x + 5, y + 5, x + w - 5, y + h * .42, '#5f6c7a', 2);
    line(ctx, x + w - 5, y + 5, x + 5, y + h * .42, '#5f6c7a', 2); ctx.restore();
  },
  /* over: the jib of the crane swinging over the gantry */
  craneJib(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#e6b46a', 4);
    fillRR(ctx, x, y + h * .16, w, h * .22, 3, '#f0c23a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 8; px < x + w - 6; px += 22) {
      line(ctx, px, y + h * .16, px + 12, y + h * .38, '#8a6a2c', 2.4);
      line(ctx, px + 12, y + h * .16, px, y + h * .38, '#8a6a2c', 2.4);
    }
    ctx.restore();
    /* the hook, swinging */
    const hx = x + w * .62 + Math.sin(t * 1.1) * 8;
    line(ctx, hx, y + h * .38, hx, y + h * .7, '#8b98a6', 2.4);
    ctx.beginPath(); ctx.arc(hx, y + h * .78, 7, -0.6, 3.4);
    ctx.strokeStyle = '#c8cfd8'; ctx.lineWidth = 5; ctx.stroke();
  },
  gantryArch(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#7f8b99', 12, 4);
    fillRR(ctx, x, y, w, h * .3, 4, '#96a2b0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 10; px < x + w - 8; px += 30) {
      line(ctx, px, y + h * .3, px + 18, y + h * .62, '#6f7c8a', 4);
      line(ctx, px + 18, y + h * .3, px, y + h * .62, '#6f7c8a', 4);
    }
    ctx.restore();
    hazardTape(ctx, x + 6, y + 5, w - 12, 9);
    fillRR(ctx, x, y + h * .62, w, 7, 3, '#7f8b99');
  },
  gantryLedge(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .46, 3, '#96a2b0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 6; px < x + w - 4; px += 12) line(ctx, px, y + 3, px, y + h * .46 - 3, '#5f6c7a', 2);
    ctx.restore();
    hazardTape(ctx, x, y - 7, w, 7);
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 24; px < x + w; px += 60) line(ctx, px, y + h * .46, px - 12, y + h, '#7f8b99', 5);
    ctx.restore();
  },
  boltPlate(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x, y, w, h, 3, '#7f8b99');
    for (let i = 0; i < Math.round(w / 20); i++) circle(ctx, x + 10 + i * 20, y + h * .5, 2.4, '#5f6c7a');
    ctx.restore();
  },
  oilStain(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    fillEll(ctx, x + w * .5, y + h * .5, w * .46, h * .45, '#3f4a58');
    fillEll(ctx, x + w * .26, y + h * .6, w * .16, h * .28, '#2f3a48'); ctx.restore();
  },
  gantryGate(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h, 5, '#8b98a6');
    fillRR(ctx, x + 9, y + 9, w - 18, h - 18, 3, '#2f3a48');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 6; i++) line(ctx, x + 12, y + 16 + i * (h - 30) / 6, x + w - 12, y + 16 + i * (h - 30) / 6, '#5f6c7a', 2);
    ctx.restore();
    hazardTape(ctx, x + 4, y + h - 22, w - 8, 12);
    ctx.fillStyle = '#f0c23a'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TERASOS →', x + w * .5, y + 26);
  },
  treadGlass(ctx, x, y, w, h, t, pal) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(226,244,255,.95)'); g.addColorStop(1, 'rgba(150,190,215,.8)');
    fillRR(ctx, x, y, w, h, 2); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(60,90,110,.5)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + 2, y + 1, w - 4, 3, 2, '#fff');
    line(ctx, x + w * .2, y + 6, x + w * .34, y + h - 4, '#fff', 1.6); ctx.restore();
  },
  downSign(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = (o && o.floorY) || (y + h);
    line(ctx, x + w * .5, fy, x + w * .5, y + 20, '#8b98a6', 6);
    fillRR(ctx, x + w * .18, y, w * .64, 40, 6, '#2f7fa8');
    ctx.fillStyle = '#eaf7ff'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('▼ ŽEMYN', x + w * .5, y + 26);
  },

  /* ==================== 4 · THE TOWER TERRACES ==================== */
  planterT(ctx, x, y, w, h) {
    leafy(ctx, x + w * .5, y + h * .26, w * .5, h * .3, '#4caf6d', '#7fd493', 5);
    leafy(ctx, x + w * .24, y + h * .38, w * .28, h * .2, '#3f9c5c', '#63c47e', 9);
    ctx.beginPath();
    ctx.moveTo(x + w * .12, y + h * .52); ctx.lineTo(x + w * .88, y + h * .52);
    ctx.lineTo(x + w * .8, y + h); ctx.lineTo(x + w * .2, y + h); ctx.closePath();
    ctx.fillStyle = '#e8e2d4'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + w * .14, y + h * .52, w * .72, 6, 2, '#c8bfae'); ctx.restore();
  },
  deckLamp(ctx, x, y, w, h, t) {
    line(ctx, x + w / 2, y + h * .2, x + w / 2, y + h - 4, '#3f4a58', 6);
    fillEll(ctx, x + w / 2, y + h - 3, w * .32, 6, '#2f3a48');
    ctx.beginPath();
    ctx.moveTo(x + w * .18, y + h * .2); ctx.lineTo(x + w * .82, y + h * .2);
    ctx.lineTo(x + w * .66, y); ctx.lineTo(x + w * .34, y); ctx.closePath();
    ctx.fillStyle = '#f6efe2'; ctx.fill(); outline(ctx, INK, 2.2);
    ctx.save(); ctx.globalAlpha = .28 + Math.sin(t * 2) * .07;
    circle(ctx, x + w / 2, y + h * .24, w * .6, '#ffe7a8'); ctx.restore();
  },
  tableT(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#8b98a6', 7, 14);
    const g = ctx.createLinearGradient(0, y, 0, y + 12);
    g.addColorStop(0, 'rgba(240,250,255,.95)'); g.addColorStop(1, 'rgba(170,205,225,.85)');
    fillRR(ctx, x, y, w, 12, 4); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(60,90,110,.55)'; ctx.lineWidth = 2.2; ctx.stroke();
    fillRR(ctx, x + w * .3, y - 15, 14, 15, 3, '#8fd6ff');
    fillEll(ctx, x + w * .62, y - 6, 12, 6, '#e2453c');
  },
  umbrellaT(ctx, x, y, w, h, t) {
    line(ctx, x + w / 2, y + h * .3, x + w / 2, y + h, '#8a6a45', 6);
    const sw = Math.sin(t * 1.2) * 0.03;
    ctx.save(); ctx.translate(x + w / 2, y + h * .3); ctx.rotate(sw);
    for (let i = 0; i < 5; i++) {
      const a0 = Math.PI + i * (Math.PI / 5), a1 = Math.PI + (i + 1) * (Math.PI / 5);
      poly(ctx, [[0, 0], [Math.cos(a0) * w * .5, Math.sin(a0) * h * .3],
        [Math.cos(a1) * w * .5, Math.sin(a1) * h * .3]], i % 2 ? '#e8e2d4' : '#c96f8a');
    }
    ctx.restore();
    fillEll(ctx, x + w / 2, y + h - 4, w * .24, 7, '#5f6c7a');
  },
  aerialT(ctx, x, y, w, h, t) {
    fillRR(ctx, x + w * .3, y + h * .5, w * .4, h * .5, 4, '#96a2b0');
    outline(ctx, INK, 2.2);
    ctx.save(); ctx.translate(x + w * .5, y + h * .48);
    ctx.beginPath(); ctx.arc(0, 0, w * .38, Math.PI * 1.15, Math.PI * 1.85);
    ctx.strokeStyle = '#dbe3ea'; ctx.lineWidth = 8; ctx.stroke();
    line(ctx, 0, 0, 0, -h * .3, '#8b98a6', 3);
    circle(ctx, 0, -h * .3, 4, '#e2453c');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .25 + Math.sin(t * 4) * .12;
    circle(ctx, x + w * .5, y + h * .18, 12, '#8fd6ff'); ctx.restore();
  },
  awningT(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#8b98a6', 3);
    ctx.beginPath();
    ctx.moveTo(x, y + h * .06); ctx.lineTo(x + w, y + h * .06);
    ctx.lineTo(x + w, y + h * .42);
    for (let i = 8; i >= 0; i--) {
      const f = i / 8;
      ctx.lineTo(x + w * f, y + h * .42 + (i % 2 ? 9 : 0));
    }
    ctx.closePath();
    ctx.fillStyle = '#c96f8a'; ctx.fill(); outline(ctx, INK, 2.2);
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 1; i < 6; i++) line(ctx, x + w * (i / 6), y + h * .06, x + w * (i / 6), y + h * .42, '#f0e6ec', 4);
    ctx.restore();
  },
  glassArch(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#9fb0bd', 9, 5);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(226,244,255,.85)'); g.addColorStop(1, 'rgba(150,195,220,.55)');
    fillRR(ctx, x, y, w, h * .74, 12); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(60,90,110,.55)'; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 26; px < x + w - 10; px += 44) line(ctx, px, y + 4, px, y + h * .7, '#dbe9f2', 4);
    line(ctx, x + 4, y + h * .3, x + w - 4, y + h * .3, '#dbe9f2', 3);
    ctx.globalAlpha = .35;
    line(ctx, x + w * .14, y + 10, x + w * .3, y + h * .62, '#fff', 5);
    ctx.restore();
  },
  benchT(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .3, 4, '#e0d6c2');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let i = 1; i < 3; i++) line(ctx, x + 4, y + h * .3 * (i / 3), x + w - 4, y + h * .3 * (i / 3), '#b8ad98', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 22; px < x + w; px += 62) fillRR(ctx, px, y + h * .3, 10, h * .7, 3, '#96a2b0');
    ctx.restore();
  },
  tilePat(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x; px < x + w; px += 26) fillRR(ctx, px + 3, y + 2, 20, h - 4, 3, '#dfe8ee');
    ctx.restore();
  },

  /* ==================== 5 · THE BLOSSOM ORCHARD ==================== */
  beehive(ctx, x, y, w, h, t) {
    for (let i = 0; i < 3; i++) {
      const yy = y + h * (.12 + i * .29);
      fillRR(ctx, x + w * (.04 + i * .02), yy, w * (.92 - i * .04), h * .27, 4, i % 2 ? '#f0e0b8' : '#e6d2a0');
      ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    }
    fillRR(ctx, x, y, w, h * .12, 3, '#8a6a45');
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * .34, y + h * .88, w * .32, 6, 2, '#5f4429'); ctx.restore();
    for (let i = 0; i < 3; i++) {
      const a = t * 2 + i * 2;
      circle(ctx, x + w * .5 + Math.cos(a) * w * .55, y + h * .3 + Math.sin(a * 1.3) * h * .3, 2.6, '#f0c23a');
    }
  },
  ladderO(ctx, x, y, w, h) {
    ctx.save(); ctx.translate(x + w * .5, y + h); ctx.rotate(-0.22);
    line(ctx, -w * .3, 0, -w * .18, -h * 1.02, '#c9a86a', 7);
    line(ctx, w * .22, 0, w * .34, -h * 1.02, '#c9a86a', 7);
    for (let i = 1; i < 6; i++) {
      const f = i / 6;
      line(ctx, -w * .3 + w * .12 * f, -h * 1.02 * f, w * .22 + w * .12 * f, -h * 1.02 * f, '#b8955c', 5);
    }
    ctx.restore();
  },
  barrowO(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w * .12, y + h * .3); ctx.lineTo(x + w * .86, y + h * .24);
    ctx.lineTo(x + w * .74, y + h * .74); ctx.lineTo(x + w * .24, y + h * .74); ctx.closePath();
    ctx.fillStyle = '#4a9d6e'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 5; i++) circle(ctx, x + w * (.26 + i * .12), y + h * .26 - 3, 6, i % 2 ? '#e2584f' : '#f0a93a');
    ctx.restore();
    line(ctx, x + w * .84, y + h * .3, x + w, y + h * .16, '#8a6a45', 5);
    wheel(ctx, x + w * .28, y + h - 10, 10, '#3f3a4a');
    line(ctx, x + w * .62, y + h * .74, x + w * .68, y + h, '#8a6a45', 5);
  },
  cratesO(ctx, x, y, w, h) {
    boxy(ctx, x, y + h * .34, w, h * .66, 4, '#e0b578', '#c9975a');
    slats(ctx, x + 4, y + h * .38, w - 8, h * .58, 4, '#a8783f', true);
    ctx.save(); ctx.globalAlpha = .95;
    for (let i = 0; i < 4; i++)
      circle(ctx, x + w * (.2 + (i % 3) * .3), y + h * (.24 + Math.floor(i / 3) * .1), 8, i % 2 ? '#e2584f' : '#f0c23a');
    ctx.restore();
  },
  treeStumpO(ctx, x, y, w, h, t, pal, seed) {
    fillRR(ctx, x + w * .16, y + h * .16, w * .68, h * .84, 6, '#8a6a45');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillEll(ctx, x + w * .5, y + h * .18, w * .35, h * .16, '#c9a86a');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(x + w * .5, y + h * .18, w * .35 * (i / 4), h * .16 * (i / 4), 0, 0, TAU);
      ctx.strokeStyle = '#8a6a45'; ctx.lineWidth = 1.6; ctx.stroke();
    }
    ctx.restore();
    leafy(ctx, x + w * .84, y + h * .5, w * .2, h * .18, '#4caf6d', '#7fd493', seed | 0);
  },
  blossomBough(ctx, x, y, w, h, t, pal, seed, o) {
    ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 13; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 8, y + h * .1);
    ctx.quadraticCurveTo(x + w * .5, y + h * .36, x + w + 8, y + h * .08); ctx.stroke();
    const r = makeRng((seed | 0) + 11);
    for (let i = 0; i < 16; i++) {
      const f = i / 16;
      const px = x + w * f, py = y + h * .1 + Math.sin(f * Math.PI) * h * .26 + r() * h * .3;
      leafy(ctx, px, py, 13, 11, '#ffd6e4', '#ffeaf2', i * 3);
      if (i % 3 === 0) circle(ctx, px + 3, py - 2, 2.4, '#f6c93a');
    }
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 4; i++) {
      const ph = ((t * .18) + i * .27) % 1;
      fillEll(ctx, x + w * (.2 + i * .2) + Math.sin(ph * 7 + i) * 12, y + h * .4 + ph * h * .6, 5, 3.4, '#ffd6e4', ph * 4);
    }
    ctx.restore();
  },
  blossomTunnel(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#6b4a2c', 9, 6);
    ctx.beginPath();
    ctx.moveTo(x, y + h * .8);
    ctx.quadraticCurveTo(x + w * .5, y - h * .12, x + w, y + h * .8);
    ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 11; ctx.stroke();
    const r = makeRng((seed | 0) + 5);
    for (let i = 0; i < 22; i++) {
      const f = i / 21;
      const px = x + w * f;
      const py = y + h * .8 - Math.sin(f * Math.PI) * h * .82 + (r() - .5) * 16;
      leafy(ctx, px, py, 15, 13, i % 4 ? '#ffd6e4' : '#fff0f6', '#ffeaf2', i * 7);
    }
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 6; i++) {
      const ph = ((t * .2) + i * .17) % 1;
      fillEll(ctx, x + w * (.1 + i * .16), y + h * .1 + ph * h * .9, 5, 3.2, '#ffd6e4', ph * 5);
    }
    ctx.restore();
  },
  wallO(ctx, x, y, w, h, t, pal, seed) {
    const r = makeRng((seed | 0) + 3);
    ctx.fillStyle = '#c9c2b0'; ctx.fillRect(x, y, w, h * .5);
    for (let px = x + 2; px < x + w - 4; px += 22) {
      for (let py = y + 3; py < y + h * .5 - 3; py += 11)
        fillRR(ctx, px + (r() * 4), py, 19, 9, 3, r() > .5 ? '#dcd6c4' : '#c2bba8');
    }
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.strokeRect(x, y, w, h * .5);
    ctx.save(); ctx.globalAlpha = .8;
    for (let px = x + 10; px < x + w; px += 40) leafy(ctx, px, y + 2, 12, 8, '#4caf6d', '#7fd493', px | 0);
    ctx.restore();
  },
  petalDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .7;
    for (let i = 0; i < Math.round(w / 18); i++)
      fillEll(ctx, x + 8 + i * 18, y + h * .5 + ((i * 7) % 9), 5, 3.2, i % 3 ? '#ffd6e4' : '#fff0f6', i);
    ctx.restore();
  },
  grassTuft(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < Math.round(w / 12); i++) {
      const px = x + 6 + i * 12;
      line(ctx, px, y + h, px + 3 - (i % 3), y + h - 12 - ((i * 5) % 7), i % 2 ? '#7fc46a' : '#5faf52', 2.4);
    }
    ctx.restore();
  }
});

Object.assign(PROPS, {

  /* ==================== 6 · THE GLASSHOUSES ==================== */
  seedTray(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * .38, w, h * .62, 4, '#3f4a58');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 4; i++) line(ctx, x + w * (i / 4), y + h * .42, x + w * (i / 4), y + h * .96, '#2b3440', 2);
    ctx.restore();
    for (let i = 0; i < 4; i++) {
      const px = x + w * (.16 + i * .23);
      line(ctx, px, y + h * .4, px - 2, y + h * .1, '#4caf6d', 3);
      leafy(ctx, px - 2, y + h * .1, 8, 6, '#5fc47e', '#8fe0a8', i * 3);
    }
  },
  wateringCan(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .16, y + h * .3, w * .56, h * .7, 8, '#4a9d6e');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * .7, y + h * .5); ctx.lineTo(x + w * .98, y + h * .2);
    ctx.strokeStyle = '#3f8a5c'; ctx.lineWidth = 8; ctx.stroke();
    circle(ctx, x + w * .98, y + h * .18, 7, '#3f8a5c');
    ctx.beginPath(); ctx.arc(x + w * .44, y + h * .28, w * .2, Math.PI, TAU);
    ctx.strokeStyle = '#3f8a5c'; ctx.lineWidth = 6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    fillRR(ctx, x + w * .24, y + h * .4, w * .12, h * .4, 4, '#fff'); ctx.restore();
  },
  potStack(ctx, x, y, w, h) {
    for (let i = 0; i < 3; i++) {
      const yy = y + h * (.06 + i * .3), ww = w * (.86 - i * .06);
      ctx.beginPath();
      ctx.moveTo(x + (w - ww) / 2, yy);
      ctx.lineTo(x + (w + ww) / 2, yy);
      ctx.lineTo(x + (w + ww) / 2 - 8, yy + h * .34);
      ctx.lineTo(x + (w - ww) / 2 + 8, yy + h * .34);
      ctx.closePath();
      ctx.fillStyle = i % 2 ? '#d2764a' : '#c06840'; ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 2.1; ctx.stroke();
    }
  },
  hoseCoil(ctx, x, y, w, h) {
    const cx = x + w * .5, cy = y + h * .58;
    for (let i = 3; i >= 0; i--) {
      ctx.beginPath();
      ctx.ellipse(cx, cy - i * 5, w * (.46 - i * .05), h * (.3 - i * .03), 0, 0, TAU);
      ctx.strokeStyle = i % 2 ? '#2f7fa8' : '#3f9cc4'; ctx.lineWidth = 8; ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx + w * .4, cy - 14); ctx.quadraticCurveTo(x + w, y + h * .1, x + w * .78, y);
    ctx.strokeStyle = '#3f9cc4'; ctx.lineWidth = 7; ctx.stroke();
    fillRR(ctx, x + w * .72, y - 4, 12, 10, 3, '#c8cfd8');
  },
  sackG(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w * .18, y + h);
    ctx.quadraticCurveTo(x, y + h * .3, x + w * .3, y + h * .12);
    ctx.quadraticCurveTo(x + w * .5, y, x + w * .72, y + h * .14);
    ctx.quadraticCurveTo(x + w, y + h * .32, x + w * .82, y + h);
    ctx.closePath(); ctx.fillStyle = '#c9b184'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .45;
    line(ctx, x + w * .28, y + h * .34, x + w * .74, y + h * .34, '#8a7a52', 3);
    line(ctx, x + w * .3, y + h * .58, x + w * .72, y + h * .58, '#8a7a52', 3); ctx.restore();
    line(ctx, x + w * .34, y + h * .14, x + w * .66, y + h * .16, '#7a6a42', 4);
  },
  hangBasket(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#7a6a52', 3);
    for (let k = 0; k < 3; k++) {
      const px = x + w * (0.18 + k * 0.32);
      const sw = Math.sin(t * 1.3 + k) * 3;
      ctx.beginPath();
      ctx.moveTo(px - 18 + sw, y + h * .12); ctx.lineTo(px + 18 + sw, y + h * .12);
      ctx.lineTo(px + 13 + sw, y + h * .42); ctx.lineTo(px - 13 + sw, y + h * .42);
      ctx.closePath(); ctx.fillStyle = '#8a6a45'; ctx.fill(); outline(ctx, INK, 2);
      leafy(ctx, px + sw, y + h * .12, 20, 10, '#4caf6d', '#7fd493', k * 5);
      for (let i = 0; i < 3; i++) {
        const dx0 = (i - 1) * 11;
        ctx.beginPath();
        ctx.moveTo(px + dx0 + sw, y + h * .4);
        ctx.quadraticCurveTo(px + dx0 + sw + 5, y + h * .58, px + dx0 + sw - 3, y + h * .74);
        ctx.strokeStyle = '#3f8a5c'; ctx.lineWidth = 3.4; ctx.stroke();
        circle(ctx, px + dx0 + sw - 3, y + h * .74, 3.4, i % 2 ? '#e2584f' : '#f0a93a');
      }
    }
  },
  vineTunnel(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#7a6a52', 8, 5);
    fillRR(ctx, x, y, w, 9, 3, '#8a7a5c');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 12; px < x + w; px += 30) line(ctx, px, y, px, y + h * .74, '#8a7a5c', 3);
    ctx.restore();
    const r = makeRng((seed | 0) + 7);
    for (let px = x + 6; px < x + w; px += 17) {
      const py = y + 8 + r() * h * .22;
      leafy(ctx, px, py, 13, 10, '#3f8a5c', '#5fbf7a', px | 0);
      if (r() > .62) {
        ctx.save(); ctx.globalAlpha = .9;
        for (let k = 0; k < 3; k++) circle(ctx, px + (k - 1) * 5, py + 14 + k * 5, 4, '#8a5fc4');
        ctx.restore();
      }
    }
  },
  potBench(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .3, 3, '#8a6a45');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 8; px < x + w; px += 24) line(ctx, px, y + 2, px, y + h * .3 - 2, '#6f5232', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .7;
    for (let px = x + 18; px < x + w; px += 56) fillRR(ctx, px, y + h * .3, 9, h * .7, 3, '#7a5434');
    ctx.restore();
    for (let px = x + 16; px < x + w - 10; px += 52) {
      fillRR(ctx, px, y - 15, 18, 15, 3, '#d2764a');
      leafy(ctx, px + 9, y - 17, 11, 7, '#4caf6d', '#7fd493', px | 0);
    }
  },
  raisedBed(ctx, x, y, w, h, t, pal, seed) {
    fillRR(ctx, x, y, w, h, 4, '#8a6a45');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + 5, y + 4, w - 10, h * .28, 3, '#4f3a26');
    const r = makeRng((seed | 0) + 13);
    for (let px = x + 14; px < x + w - 8; px += 26) {
      const lh = 10 + r() * 12;
      line(ctx, px, y + 8, px - 3, y + 8 - lh, '#4caf6d', 3);
      leafy(ctx, px - 3, y + 8 - lh, 10, 7, '#5fc47e', '#8fe0a8', px | 0);
    }
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 1; i < 3; i++) line(ctx, x + 3, y + h * (.35 + i * .22), x + w - 3, y + h * (.35 + i * .22), '#6f5232', 2);
    ctx.restore();
  },
  leafDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .7;
    for (let i = 0; i < Math.round(w / 20); i++)
      leafy(ctx, x + 10 + i * 20, y + h * .55, 9, 5, '#4caf6d', '#7fd493', i * 5);
    ctx.restore();
  },
  spillDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .45;
    fillEll(ctx, x + w * .5, y + h * .55, w * .42, h * .4, '#5f4a32');
    fillEll(ctx, x + w * .3, y + h * .6, w * .14, h * .22, '#4f3a26'); ctx.restore();
  },

  /* ==================== 7 · THE MARBLE QUARRY ==================== */
  blockQ(ctx, x, y, w, h, t, pal, seed) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#f4f1e8'); g.addColorStop(1, '#cfc9ba');
    fillRR(ctx, x, y, w, h, 3); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    const r = makeRng((seed | 0) + 3);
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + r() * w, y + 4);
      ctx.quadraticCurveTo(x + r() * w, y + h * .5, x + r() * w, y + h - 4);
      ctx.strokeStyle = '#a8a294'; ctx.lineWidth = 1.8; ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, x + 3, y + 2, w - 6, 4, 2, '#fff'); ctx.restore();
  },
  drumQ(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .08, y + h * .06, w * .84, h * .94, 8, '#3f7a5c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * .06, y + h * .3, w * .88, 8, 3, '#2f6b4a');
    fillRR(ctx, x + w * .06, y + h * .64, w * .88, 8, 3, '#2f6b4a'); ctx.restore();
    fillEll(ctx, x + w * .5, y + h * .07, w * .42, h * .07, '#4f8a6c');
    hazardTape(ctx, x + w * .2, y + h * .44, w * .6, 9);
  },
  sawQ(ctx, x, y, w, h, t) {
    fillRR(ctx, x, y + h * .58, w, h * .42, 4, '#f0c23a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    const cx = x + w * .58, cy = y + h * .42, r = Math.min(w, h) * .38;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 1.4);
    circle(ctx, 0, 0, r, '#c8cfd8');
    for (let i = 0; i < 14; i++) {
      const a = i * TAU / 14;
      poly(ctx, [[Math.cos(a) * r, Math.sin(a) * r],
        [Math.cos(a + .18) * (r + 5), Math.sin(a + .18) * (r + 5)],
        [Math.cos(a + .32) * r, Math.sin(a + .32) * r]], '#96a2b0');
    }
    circle(ctx, 0, 0, r * .22, '#5f6c7a');
    ctx.restore();
    wheel(ctx, x + w * .18, y + h - 8, 8, '#2f3a48');
    wheel(ctx, x + w * .82, y + h - 8, 8, '#2f3a48');
  },
  coneQ(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w * .5, y); ctx.lineTo(x + w * .84, y + h * .82);
    ctx.lineTo(x + w * .16, y + h * .82); ctx.closePath();
    ctx.fillStyle = '#f07a3a'; ctx.fill(); outline(ctx, INK, 2.3);
    ctx.save(); ctx.globalAlpha = .9;
    fillRR(ctx, x + w * .27, y + h * .4, w * .46, h * .14, 2, '#f6efe2'); ctx.restore();
    fillRR(ctx, x + w * .06, y + h * .82, w * .88, h * .18, 4, '#d2643a');
  },
  bucketQ(ctx, x, y, w, h) {
    /* the toothed bucket off a digger, left on the bench */
    ctx.beginPath();
    ctx.moveTo(x + w * .06, y + h * .1); ctx.lineTo(x + w * .94, y + h * .22);
    ctx.lineTo(x + w * .8, y + h * .84); ctx.lineTo(x + w * .2, y + h * .78);
    ctx.closePath(); ctx.fillStyle = '#f0a93a'; ctx.fill(); outline(ctx, INK, 2.5);
    ctx.save(); ctx.globalAlpha = .55;
    line(ctx, x + w * .14, y + h * .4, x + w * .88, y + h * .5, '#c98a2c', 3); ctx.restore();
    for (let i = 0; i < 4; i++)
      poly(ctx, [[x + w * (.24 + i * .16), y + h * .8], [x + w * (.34 + i * .16), y + h * .82],
        [x + w * (.29 + i * .16), y + h]], '#c8cfd8');
  },
  chuteQ(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#8b98a6', 4);
    ctx.beginPath();
    ctx.moveTo(x, y + h * .04); ctx.lineTo(x + w, y + h * .18);
    ctx.lineTo(x + w, y + h * .5); ctx.lineTo(x, y + h * .36); ctx.closePath();
    ctx.fillStyle = '#7f8b99'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 5; i++) line(ctx, x + w * (i / 5), y + h * .04 + h * .14 * (i / 5), x + w * (i / 5), y + h * .36 + h * .14 * (i / 5), '#5f6c7a', 2.4);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i < 6; i++) {
      const ph = ((t * .8) + i * .17) % 1;
      circle(ctx, x + w * (.1 + ph * .85), y + h * .5 + ph * h * .2, 2.8, '#e8e2d4');
    }
    ctx.restore();
  },
  archQ(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#b8b2a2', 14, 3);
    const g = ctx.createLinearGradient(0, y, 0, y + h * .4);
    g.addColorStop(0, '#efece2'); g.addColorStop(1, '#c8c2b2');
    fillRR(ctx, x - 4, y, w + 8, h * .4, 4); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    for (let px = x + 20; px < x + w; px += 46) line(ctx, px, y + 2, px, y + h * .4 - 2, '#a8a294', 2.4);
    ctx.restore();
    hazardTape(ctx, x + 8, y + h * .4, w - 16, 9);
  },
  benchQ(ctx, x, y, w, h, t, pal, seed, o) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#f2efe6'); g.addColorStop(1, '#c2bcac');
    fillRR(ctx, x, y, w, h * .5, 3); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 26; px < x + w; px += 52) line(ctx, px, y + 3, px, y + h * .5 - 3, '#a8a294', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 14; px < x + w; px += 58) fillRR(ctx, px, y + h * .5, 22, h * .5, 2, '#b8b2a2');
    ctx.restore();
  },
  stepQ(ctx, x, y, w, h) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#eae6da'); g.addColorStop(1, '#b8b2a2');
    fillRR(ctx, x, y, w, h, 2); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .3;
    for (let i = 1; i < 4; i++) line(ctx, x + 3, y + h * (i / 4), x + w - 3, y + h * (i / 4), '#a8a294', 2);
    ctx.restore();
  },
  dustQ(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    fillEll(ctx, x + w * .5, y + h * .6, w * .46, h * .34, '#e8e4d8');
    fillEll(ctx, x + w * .3, y + h * .48, w * .18, h * .2, '#f2efe6'); ctx.restore();
  },
  trackQ(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .55;
    line(ctx, x, y + h * .4, x + w, y + h * .4, '#8b98a6', 3);
    line(ctx, x, y + h * .72, x + w, y + h * .72, '#8b98a6', 3);
    for (let px = x + 6; px < x + w; px += 22) line(ctx, px, y + h * .34, px, y + h * .78, '#6b5c4c', 4);
    ctx.restore();
  },

  /* ==================== 8 · THE SALT MINE ==================== */
  saltBlock(ctx, x, y, w, h, t, pal, seed) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#ffe4e6'); g.addColorStop(.5, '#f6d0d4'); g.addColorStop(1, '#e0aeb6');
    ctx.beginPath();
    ctx.moveTo(x + w * .06, y + h); ctx.lineTo(x, y + h * .34);
    ctx.lineTo(x + w * .3, y); ctx.lineTo(x + w * .82, y + h * .1);
    ctx.lineTo(x + w, y + h * .62); ctx.lineTo(x + w * .8, y + h);
    ctx.closePath(); ctx.fillStyle = g; ctx.fill(); outline(ctx, 'rgba(90,50,60,.4)', 2.4);
    ctx.save(); ctx.globalAlpha = .45;
    line(ctx, x + w * .3, y + h * .06, x + w * .5, y + h * .8, '#fff', 2.4);
    line(ctx, x + w * .66, y + h * .16, x + w * .8, y + h * .7, '#fff', 2); ctx.restore();
    ctx.save(); ctx.globalAlpha = .3;
    circle(ctx, x + w * .5, y + h * .5, Math.min(w, h) * .5, '#ffd0d8'); ctx.restore();
  },
  oreCart(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w * .06, y + h * .18); ctx.lineTo(x + w * .94, y + h * .18);
    ctx.lineTo(x + w * .84, y + h * .74); ctx.lineTo(x + w * .16, y + h * .74);
    ctx.closePath(); ctx.fillStyle = '#6b5c4c'; ctx.fill(); outline(ctx, INK, 2.5);
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 1; i < 4; i++) line(ctx, x + w * (.06 + i * .22), y + h * .2, x + w * (.14 + i * .19), y + h * .72, '#4f4438', 2.4);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .95;
    for (let i = 0; i < 4; i++)
      fillEll(ctx, x + w * (.24 + i * .18), y + h * .16, 10, 7, i % 2 ? '#f6d0d4' : '#ffe4e6');
    ctx.restore();
    wheel(ctx, x + w * .28, y + h - 9, 9, '#3f3a4a');
    wheel(ctx, x + w * .74, y + h - 9, 9, '#3f3a4a');
  },
  propTimber(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .1, y + h * .16, w * .22, h * .84, 3, '#8a6a45');
    fillRR(ctx, x + w * .66, y + h * .16, w * .22, h * .84, 3, '#7a5c3a');
    fillRR(ctx, x, y, w, h * .18, 3, '#8a6a45');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    line(ctx, x + w * .16, y + h * .3, x + w * .16, y + h * .9, '#5f4429', 2);
    line(ctx, x + w * .74, y + h * .3, x + w * .74, y + h * .9, '#5f4429', 2); ctx.restore();
    circle(ctx, x + w * .2, y + h * .22, 3, '#4f4438');
    circle(ctx, x + w * .78, y + h * .22, 3, '#4f4438');
  },
  lampMine(ctx, x, y, w, h, t) {
    line(ctx, x + w * .5, y + h * .34, x + w * .5, y + h, '#5f5448', 6);
    fillRR(ctx, x + w * .26, y + h * .12, w * .48, h * .3, 5, '#8a7a5c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    const on = .55 + Math.sin(t * 2.2) * .18;
    ctx.save(); ctx.globalAlpha = on * .5;
    circle(ctx, x + w * .5, y + h * .3, w * .7, '#ffd8a8'); ctx.restore();
    fillRR(ctx, x + w * .34, y + h * .2, w * .32, h * .16, 3, '#fff3c4');
    fillEll(ctx, x + w * .5, y + h - 3, w * .3, 5, '#4f4438');
  },
  barrelMine(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w * .12, y + h * .06);
    ctx.quadraticCurveTo(x - w * .02, y + h * .5, x + w * .12, y + h * .94);
    ctx.lineTo(x + w * .88, y + h * .94);
    ctx.quadraticCurveTo(x + w * 1.02, y + h * .5, x + w * .88, y + h * .06);
    ctx.closePath(); ctx.fillStyle = '#7a5c3a'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * .06, y + h * .26, w * .88, 7, 2, '#96a2b0');
    fillRR(ctx, x + w * .06, y + h * .66, w * .88, 7, 2, '#96a2b0'); ctx.restore();
    fillEll(ctx, x + w * .5, y + h * .07, w * .38, h * .07, '#8a6a45');
  },
  beamMine(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#7a5c3a', 13, 4);
    fillRR(ctx, x - 4, y, w + 8, h * .3, 3, '#8a6a45');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 12; px < x + w; px += 34) line(ctx, px, y + 3, px, y + h * .3 - 3, '#5f4429', 2.2);
    ctx.restore();
    /* crusts of salt hanging off the underside, glowing faintly */
    for (let px = x + 14; px < x + w - 8; px += 26) {
      const d = 8 + ((px | 0) % 11);
      poly(ctx, [[px - 6, y + h * .3], [px + 6, y + h * .3], [px, y + h * .3 + d]], '#f6d0d4');
    }
    ctx.save(); ctx.globalAlpha = .16 + Math.sin(t * 1.5) * .06;
    fillRR(ctx, x, y + h * .3, w, 26, 8, '#ffc8d4'); ctx.restore();
  },
  tunnelMine(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#7a5c3a', 11, 4);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + h * .32);
    ctx.quadraticCurveTo(x + w * .5, y - h * .2, x + w, y + h * .32);
    ctx.lineTo(x + w, y + h); ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#f6d0d4'); g.addColorStop(1, '#c99aa4');
    ctx.fillStyle = g; ctx.fill(); outline(ctx, 'rgba(90,50,60,.4)', 2.5);
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 18; px < x + w; px += 40) {
      ctx.beginPath();
      ctx.moveTo(px, y + h);
      ctx.quadraticCurveTo(px + 6, y + h * .4, px + 2, y + h * .1);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .22 + Math.sin(t * 1.2) * .07;
    fillRR(ctx, x + 6, y + 6, w - 12, h * .5, 20, '#ffd0d8'); ctx.restore();
  },
  ledgeMine(ctx, x, y, w, h, t, pal, seed, o) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#ffe4e6'); g.addColorStop(1, '#c99aa4');
    fillRR(ctx, x, y, w, h * .5, 4); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(90,50,60,.4)'; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 18; px < x + w; px += 38) line(ctx, px, y + 3, px + 6, y + h * .5 - 3, '#fff', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 26; px < x + w; px += 64) fillRR(ctx, px, y + h * .5, 13, h * .5, 3, '#7a5c3a');
    ctx.restore();
  },
  saltDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < Math.round(w / 16); i++)
      fillEll(ctx, x + 8 + i * 16, y + h * .6, 6, 3, i % 2 ? '#ffe4e6' : '#f6d0d4');
    ctx.restore();
  },
  railDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 5; px < x + w; px += 20) fillRR(ctx, px, y + h * .3, 12, 5, 2, '#6b5c4c');
    line(ctx, x, y + h * .28, x + w, y + h * .28, '#96a2b0', 2.4);
    line(ctx, x, y + h * .62, x + w, y + h * .62, '#96a2b0', 2.4);
    ctx.restore();
  }
});

Object.assign(PROPS, {

  /* ==================== 9 · THE ROCKET SILO ==================== */
  fuelDrum(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .08, y + h * .06, w * .84, h * .94, 8, '#c8cfd8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillEll(ctx, x + w * .5, y + h * .07, w * .42, h * .07, '#e2e8ee');
    ctx.save(); ctx.globalAlpha = .85;
    fillRR(ctx, x + w * .06, y + h * .36, w * .88, 12, 3, '#2f7fa8'); ctx.restore();
    ctx.fillStyle = '#2b3440'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('O₂', x + w * .5, y + h * .66);
    ctx.save(); ctx.globalAlpha = .35; fillRR(ctx, x + w * .18, y + h * .12, w * .12, h * .7, 4, '#fff'); ctx.restore();
  },
  toolCrate(ctx, x, y, w, h) {
    steelBox(ctx, x, y, w, h, 4, '#e8e2d4', '#b8b2a2');
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + 4, y + h * .42, w - 8, 6, 2, '#5f6c7a'); ctx.restore();
    hazardTape(ctx, x + 6, y + 6, w - 12, 9);
    ctx.fillStyle = '#3f4a58'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('NR-7', x + w * .5, y + h * .78);
  },
  coolPipe(ctx, x, y, w, h, t) {
    fillRR(ctx, x, y + h * .3, w, h * .34, 12, '#96a2b0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 8; px < x + w - 4; px += 13) line(ctx, px, y + h * .3, px, y + h * .64, '#6f7c8a', 3);
    ctx.restore();
    fillRR(ctx, x + w * .1, y + h * .64, w * .18, h * .36, 3, '#7f8b99');
    fillRR(ctx, x + w * .72, y + h * .64, w * .18, h * .36, 3, '#7f8b99');
    /* frost curling off it */
    ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * 1.4) * .12;
    for (let i = 0; i < 4; i++)
      fillEll(ctx, x + w * (.2 + i * .2), y + h * .18 - Math.sin(t + i) * 4, 13, 7, '#dff0ff');
    ctx.restore();
  },
  conePart(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x + w * .5, y); ctx.quadraticCurveTo(x + w * .96, y + h * .6, x + w * .9, y + h);
    ctx.lineTo(x + w * .1, y + h);
    ctx.quadraticCurveTo(x + w * .04, y + h * .6, x + w * .5, y); ctx.closePath();
    ctx.fillStyle = '#e8e2d4'; ctx.fill(); outline(ctx, INK, 2.5);
    ctx.save(); ctx.globalAlpha = .55;
    line(ctx, x + w * .5, y + h * .1, x + w * .5, y + h - 4, '#b8b2a2', 2.4); ctx.restore();
    fillRR(ctx, x + w * .06, y + h - 10, w * .88, 10, 3, '#96a2b0');
    fillRR(ctx, x + w * .34, y + h * .4, w * .32, h * .14, 3, '#e2453c');
  },
  robotArm(ctx, x, y, w, h, t) {
    const sw = Math.sin(t * .8) * 0.14;
    fillRR(ctx, x + w * .3, y + h * .78, w * .4, h * .22, 4, '#5f6c7a');
    ctx.save(); ctx.translate(x + w * .5, y + h * .78); ctx.rotate(-0.6 + sw);
    fillRR(ctx, -7, -h * .5, 14, h * .5, 6, '#f0c23a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.translate(0, -h * .5); ctx.rotate(0.9 - sw * 1.6);
    fillRR(ctx, -6, -h * .4, 12, h * .4, 5, '#e8e2d4');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.translate(0, -h * .4);
    circle(ctx, 0, 0, 6, '#96a2b0');
    line(ctx, -4, 0, -9, 9, '#96a2b0', 3.4);
    line(ctx, 4, 0, 9, 9, '#96a2b0', 3.4);
    ctx.restore();
    circle(ctx, x + w * .5, y + h * .78, 7, '#96a2b0');
  },
  ductSilo(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#7f8b99', 4);
    fillRR(ctx, x, y + h * .08, w, h * .34, 6, '#8b98a6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 10; px < x + w - 6; px += 26) fillRR(ctx, px, y + h * .08, 7, h * .34, 2, '#5f6c7a');
    ctx.restore();
    hazardTape(ctx, x + 6, y + h * .44, w - 12, 8);
    ctx.save(); ctx.globalAlpha = .25 + Math.sin(t * 3) * .1;
    for (let i = 0; i < 3; i++) circle(ctx, x + w * (.24 + i * .26), y + h * .58, 5, '#8fd6ff');
    ctx.restore();
  },
  gantryTunnel(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#6f7c8a', 12, 4);
    fillRR(ctx, x, y, w, h * .28, 4, '#8b98a6');
    fillRR(ctx, x, y + h * .62, w, 9, 3, '#7f8b99');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 10; px < x + w - 8; px += 32) {
      line(ctx, px, y + h * .28, px + 20, y + h * .62, '#5f6c7a', 4);
      line(ctx, px + 20, y + h * .28, px, y + h * .62, '#5f6c7a', 4);
    }
    ctx.restore();
    for (let px = x + 20; px < x + w; px += 64) {
      ctx.save(); ctx.globalAlpha = .5 + Math.sin(t * 4 + px) * .2;
      circle(ctx, px, y + h * .16, 4, '#f0c23a'); ctx.restore();
    }
  },
  gantryLedge2(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .44, 3, '#b8b2a2');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 7; px < x + w - 4; px += 13) line(ctx, px, y + 3, px, y + h * .44 - 3, '#7f7a6c', 2);
    ctx.restore();
    hazardTape(ctx, x, y - 8, w, 8);
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 22; px < x + w; px += 58) line(ctx, px, y + h * .44, px - 14, y + h, '#8b98a6', 5);
    ctx.restore();
  },
  gridDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x; px < x + w; px += 18) line(ctx, px, y, px, y + h, '#7f8b99', 2);
    line(ctx, x, y + h * .5, x + w, y + h * .5, '#7f8b99', 2); ctx.restore();
  },
  warnStripe(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .6; hazardTape(ctx, x, y + h * .3, w, h * .4); ctx.restore();
  },
  rocketHatch(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h, 14, '#c8cfd8');
    fillRR(ctx, x + 10, y + 10, w - 20, h - 20, 10, '#2b3440');
    ctx.save(); ctx.globalAlpha = .6;
    fillRR(ctx, x + 16, y + 16, w - 32, h * .28, 8, '#3f5468'); ctx.restore();
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + t * .3;
      circle(ctx, x + w * .5 + Math.cos(a) * w * .3, y + h * .55 + Math.sin(a) * w * .3, 3.6, '#e8eef4');
    }
    ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 2) * .12;
    circle(ctx, x + w * .5, y + h * .55, w * .2, '#8fd6ff'); ctx.restore();
    circle(ctx, x + w * .5, y + h * .55, w * .1, '#e8eef4');
    ctx.fillStyle = '#f0c23a'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('RAKETA →', x + w * .5, y + h - 13);
  },
  treadSteel(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 2, '#96a2b0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 6; px < x + w - 4; px += 12) line(ctx, px, y + 2, px, y + h - 2, '#5f6c7a', 2);
    ctx.globalAlpha = .8; fillRR(ctx, x, y, w, 3, 1, '#f0c23a'); ctx.restore();
  },
  upSign(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = (o && o.floorY) || (y + h);
    line(ctx, x + w * .5, fy, x + w * .5, y + 20, '#8b98a6', 6);
    fillRR(ctx, x + w * .18, y, w * .64, 40, 6, '#f0c23a');
    ctx.fillStyle = '#2b2634'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('▲ Į RAKETĄ', x + w * .5, y + 26);
  },

  /* ==================== 10 · INSIDE THE ROCKET ==================== */
  seatPod(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * .2, w, h * .8, 14, '#e8eef4');
    fillRR(ctx, x + w * .08, y + h * .08, w * .5, h * .4, 12, '#c8d4e0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    line(ctx, x + w * .18, y + h * .3, x + w * .78, y + h * .66, '#e2453c', 5);
    line(ctx, x + w * .74, y + h * .3, x + w * .22, y + h * .66, '#e2453c', 5); ctx.restore();
    circle(ctx, x + w * .48, y + h * .48, 6, '#f0c23a');
  },
  lockerR(ctx, x, y, w, h) {
    steelBox(ctx, x, y, w, h, 5, '#eef2f6', '#b9c4d0');
    ctx.save(); ctx.globalAlpha = .6;
    line(ctx, x + w * .5, y + 5, x + w * .5, y + h - 5, '#7f8b99', 2.4); ctx.restore();
    circle(ctx, x + w * .42, y + h * .5, 3.4, '#5f6c7a');
    circle(ctx, x + w * .58, y + h * .5, 3.4, '#5f6c7a');
    fillRR(ctx, x + w * .1, y + h * .12, w * .28, 8, 3, '#4fc3ea');
  },
  cargoNetR(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .04, y + h * .2, w * .92, h * .8, 8, '#8a7f5c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .7;
    for (let i = 0; i <= 5; i++) {
      line(ctx, x + w * (.04 + i * .184), y + h * .2, x + w * (.04 + i * .184) - 8, y + h, '#3f4a58', 2.4);
      line(ctx, x + w * (.04 + i * .184) - 8, y + h * .2, x + w * (.04 + i * .184), y + h, '#3f4a58', 2.4);
    }
    ctx.restore();
    fillRR(ctx, x + w * .3, y + h * .06, w * .4, h * .16, 5, '#e2453c');
  },
  tankR(ctx, x, y, w, h, t) {
    fillRR(ctx, x + w * .16, y, w * .3, h, 12, '#c8cfd8');
    fillRR(ctx, x + w * .54, y + h * .1, w * .3, h * .9, 12, '#b0bcc8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * .16, y + h * .36, w * .3, 7, 2, '#2f7fa8');
    fillRR(ctx, x + w * .54, y + h * .46, w * .3, 7, 2, '#e2453c'); ctx.restore();
    ctx.save(); ctx.globalAlpha = .25 + Math.sin(t * 2.4) * .1;
    circle(ctx, x + w * .31, y + h * .16, 6, '#8fd6ff'); ctx.restore();
  },
  consoleR(ctx, x, y, w, h, t) {
    fillRR(ctx, x, y + h * .3, w, h * .7, 6, '#3f4a58');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save();
    ctx.translate(0, 0);
    fillRR(ctx, x + w * .08, y + h * .06, w * .84, h * .3, 5, '#1b2430');
    ctx.globalAlpha = .9;
    for (let i = 0; i < 5; i++) {
      const hgt = 4 + ((i * 7 + Math.floor(t * 3)) % 5) * 3;
      fillRR(ctx, x + w * (.14 + i * .16), y + h * .3 - hgt - 3, w * .1, hgt, 1, i % 2 ? '#4fc3ea' : '#8fe0a8');
    }
    ctx.restore();
    for (let i = 0; i < 4; i++)
      circle(ctx, x + w * (.18 + i * .22), y + h * .58, 4, ['#e2453c', '#f0c23a', '#8fe0a8', '#4fc3ea'][i]);
    fillRR(ctx, x + w * .12, y + h * .74, w * .76, 8, 3, '#5f6c7a');
  },
  pipeRun(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#7f8b99', 3);
    for (let i = 0; i < 3; i++) {
      const yy = y + h * (.08 + i * .14);
      fillRR(ctx, x - 4, yy, w + 8, h * .11, 6, ['#96a2b0', '#4fc3ea', '#e2884c'][i]);
      ctx.save(); ctx.globalAlpha = .35;
      fillRR(ctx, x, yy + 2, w, 3, 2, '#fff'); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 20; px < x + w - 10; px += 52) fillRR(ctx, px, y + h * .04, 12, h * .48, 3, '#7f8b99');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 3.4) * .12;
    for (let px = x + 34; px < x + w; px += 90) circle(ctx, px, y + h * .56, 5, '#8fe0a8');
    ctx.restore();
  },
  hatchTunnel(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#9aa6b2', 12, 3);
    ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.lineTo(x, y + h * .42);
    ctx.quadraticCurveTo(x + w * .5, y - h * .16, x + w, y + h * .42);
    ctx.lineTo(x + w, y + h); ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#eef2f6'); g.addColorStop(1, '#a8b4c0');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 24; px < x + w - 12; px += 40)
      line(ctx, px, y + h, px, y + h * .3 + Math.abs(px - x - w / 2) * .12, '#7f8b99', 3);
    ctx.restore();
    for (let px = x + 34; px < x + w; px += 78) {
      ctx.save(); ctx.globalAlpha = .5 + Math.sin(t * 3 + px * .05) * .2;
      circle(ctx, px, y + h * .2, 4, '#8fe0a8'); ctx.restore();
    }
  },
  shelfR(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .42, 4, '#c8d4e0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 16; px < x + w; px += 40) fillRR(ctx, px, y + 4, 22, h * .34, 3, '#96a2b0');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .7;
    for (let px = x + 26; px < x + w; px += 60) line(ctx, px, y + h * .42, px, y + h, '#8b98a6', 5);
    ctx.restore();
  },
  ledStrip(ctx, x, y, w, h, t) {
    ctx.save(); ctx.globalAlpha = .7;
    fillRR(ctx, x, y + h * .4, w, 5, 2, '#4fc3ea');
    ctx.globalAlpha = .3 + Math.sin(t * 2) * .1;
    fillRR(ctx, x, y + h * .4 - 4, w, 13, 5, '#8fd6ff'); ctx.restore();
  },
  airlock(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h, 10, '#b9c4d0');
    fillRR(ctx, x + 9, y + 9, w - 18, h - 18, 7, '#1b2430');
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 40; i++) {
      const r = makeRng(i * 31 + 5);
      circle(ctx, x + 14 + r() * (w - 28), y + 14 + r() * (h - 28), 1.2, '#fff');
    }
    ctx.restore();
    circle(ctx, x + w * .5, y + h * .42, w * .2, '#2f6b9c');
    ctx.save(); ctx.globalAlpha = .5; circle(ctx, x + w * .44, y + h * .36, w * .07, '#8fd6ff'); ctx.restore();
    for (let i = 0; i < 6; i++) {
      const a = i * TAU / 6 + t * .4;
      circle(ctx, x + w * .5 + Math.cos(a) * w * .34, y + h * .42 + Math.sin(a) * w * .34, 3.4, '#e8eef4');
    }
    ctx.fillStyle = '#8fe0a8'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Į KOSMOSĄ →', x + w * .5, y + h - 12);
  },

  /* ==================== 11 · OUT ON THE HULL ==================== */
  antennaO(ctx, x, y, w, h, t) {
    line(ctx, x + w * .5, y + h * .2, x + w * .5, y + h, '#8b98a6', 6);
    fillRR(ctx, x + w * .3, y + h * .82, w * .4, h * .18, 3, '#5f6c7a');
    for (let i = 0; i < 4; i++) {
      const yy = y + h * (.18 + i * .16), ww = w * (.9 - i * .16);
      line(ctx, x + w * .5 - ww * .5, yy, x + w * .5 + ww * .5, yy, '#c8cfd8', 3.4);
    }
    ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 3) * .16;
    circle(ctx, x + w * .5, y + h * .12, 8, '#4fc3ea'); ctx.restore();
    circle(ctx, x + w * .5, y + h * .12, 3.4, '#dff0ff');
  },
  thrusterO(ctx, x, y, w, h, t) {
    fillRR(ctx, x + w * .18, y, w * .64, h * .58, 5, '#c8cfd8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * .2, y + h * .58); ctx.lineTo(x + w * .8, y + h * .58);
    ctx.lineTo(x + w * .96, y + h); ctx.lineTo(x + w * .04, y + h); ctx.closePath();
    ctx.fillStyle = '#7f8b99'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * 6) * .2;
    fillEll(ctx, x + w * .5, y + h - 2, w * .34, 8, '#8fd6ff'); ctx.restore();
    hazardTape(ctx, x + w * .24, y + h * .2, w * .52, 8);
  },
  crateO(ctx, x, y, w, h) {
    steelBox(ctx, x, y, w, h, 4, '#f0f3f7', '#aab6c2');
    ctx.save(); ctx.globalAlpha = .8;
    line(ctx, x + 5, y + 6, x + w - 5, y + h - 6, '#5f6c7a', 2.4);
    line(ctx, x + w - 5, y + 6, x + 5, y + h - 6, '#5f6c7a', 2.4); ctx.restore();
    fillRR(ctx, x + w * .3, y + h * .4, w * .4, 12, 3, '#f0c23a');
    ctx.fillStyle = '#2b3440'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('LOTA-1', x + w * .5, y + h * .4 + 9);
  },
  tankO(ctx, x, y, w, h, t) {
    fillRR(ctx, x + w * .06, y + h * .1, w * .88, h * .8, 20, '#e8eef4');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x + w * .16, y + h * .2, w * .16, h * .6, 8, '#fff'); ctx.restore();
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * .04, y + h * .44, w * .92, 8, 3, '#4fc3ea'); ctx.restore();
    circle(ctx, x + w * .8, y + h * .26, 5, '#e2453c');
    ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 2.6) * .1;
    circle(ctx, x + w * .8, y + h * .26, 11, '#ff8f8a'); ctx.restore();
  },
  dishO(ctx, x, y, w, h, t) {
    line(ctx, x + w * .5, y + h * .5, x + w * .5, y + h, '#8b98a6', 7);
    ctx.save(); ctx.translate(x + w * .5, y + h * .46); ctx.rotate(-0.35 + Math.sin(t * .5) * .08);
    ctx.beginPath(); ctx.ellipse(0, 0, w * .44, h * .34, 0, 0, TAU);
    ctx.fillStyle = '#e8eef4'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.ellipse(0, 0, w * .44 * (i / 3), h * .34 * (i / 3), 0, 0, TAU);
      ctx.strokeStyle = '#b0bcc8'; ctx.lineWidth = 1.8; ctx.stroke();
    }
    ctx.restore();
    line(ctx, 0, 0, 0, -h * .3, '#96a2b0', 3);
    circle(ctx, 0, -h * .32, 4.4, '#f0c23a');
    ctx.restore();
  },
  trussO(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#8b98a6', 4);
    fillRR(ctx, x - 4, y + h * .08, w + 8, 10, 3, '#c8cfd8');
    fillRR(ctx, x - 4, y + h * .46, w + 8, 10, 3, '#c8cfd8');
    ctx.save(); ctx.globalAlpha = .7;
    for (let px = x; px < x + w; px += 30) {
      line(ctx, px, y + h * .12, px + 22, y + h * .5, '#96a2b0', 3.4);
      line(ctx, px + 22, y + h * .12, px, y + h * .5, '#96a2b0', 3.4);
    }
    ctx.restore();
    /* one bay of solar wing hanging off it */
    fillRR(ctx, x + w * .3, y + h * .56, w * .4, h * .2, 3, '#22355c');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 4; i++) line(ctx, x + w * (.3 + .1 * i), y + h * .56, x + w * (.3 + .1 * i), y + h * .76, '#5f7fc4', 2);
    ctx.restore();
  },
  tetherTunnel(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#7f8b99', 10, 4);
    fillRR(ctx, x, y, w, h * .22, 4, '#aab6c2');
    fillRR(ctx, x, y + h * .64, w, 8, 3, '#8b98a6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    /* safety tethers looping down out of the truss */
    for (let px = x + 22; px < x + w - 10; px += 46) {
      ctx.beginPath();
      ctx.moveTo(px, y + h * .22);
      ctx.quadraticCurveTo(px + 16, y + h * .5, px + 34, y + h * .22);
      ctx.strokeStyle = '#f0c23a'; ctx.lineWidth = 3.4; ctx.stroke();
      circle(ctx, px + 17, y + h * .42, 3.4, '#e8eef4');
    }
    ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 2.4) * .1;
    fillRR(ctx, x + 6, y + h * .22, w - 12, 10, 4, '#8fd6ff'); ctx.restore();
  },
  railO(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .4, 4, '#c8cfd8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x, y - 6, w, 5, 2, '#f0c23a'); ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 20; px < x + w; px += 54) {
      line(ctx, px, y + h * .4, px, y + h, '#8b98a6', 5);
      circle(ctx, px, y + h * .4, 4, '#96a2b0');
    }
    ctx.restore();
  },
  boltO(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < Math.round(w / 22); i++) {
      const px = x + 11 + i * 22;
      circle(ctx, px, y + h * .5, 3.4, '#96a2b0');
      circle(ctx, px, y + h * .5, 1.4, '#5f6c7a');
    }
    ctx.restore();
  },
  decalO(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x + 4, y + h * .2, w - 8, h * .6, 3, '#2f6b9c');
    ctx.fillStyle = '#dff0ff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('LOTA', x + w * .5, y + h * .7); ctx.restore();
  }
});

Object.assign(PROPS, {

  /* ==================== 12 · INSIDE THE STATION ==================== */
  bagS(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * .16, w, h * .84, 10, '#dfe4ea');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + 4, y + h * .42, w - 8, 8, 3, '#4fc3ea'); ctx.restore();
    ctx.beginPath(); ctx.arc(x + w * .5, y + h * .18, w * .22, Math.PI, TAU);
    ctx.strokeStyle = '#8b98a6'; ctx.lineWidth = 5; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 3; i++) circle(ctx, x + w * (.24 + i * .26), y + h * .68, 3.4, '#96a2b0'); ctx.restore();
  },
  labRack(ctx, x, y, w, h, t) {
    steelBox(ctx, x, y, w, h, 4, '#f2f5f8', '#c2ccd6');
    for (let i = 0; i < 3; i++) {
      fillRR(ctx, x + 5, y + 5 + i * (h - 10) / 3, w - 10, (h - 14) / 3, 3, '#1b2430');
      ctx.save(); ctx.globalAlpha = .85;
      for (let k = 0; k < 4; k++)
        circle(ctx, x + 12 + k * ((w - 24) / 3), y + 5 + i * (h - 10) / 3 + (h - 14) / 6,
          2.6, ((k + i + Math.floor(t * 2)) % 3) ? '#4fc3ea' : '#8fe0a8');
      ctx.restore();
    }
  },
  sphereS(ctx, x, y, w, h, t) {
    const cx = x + w * .5, cy = y + h * .48, r = Math.min(w, h) * .42;
    ctx.save(); ctx.globalAlpha = .3; circle(ctx, cx, cy, r * 1.25, '#8fd6ff'); ctx.restore();
    circle(ctx, cx, cy, r, '#dff0ff');
    ctx.save(); ctx.globalAlpha = .55;
    circle(ctx, cx - r * .3, cy - r * .32, r * .3, '#fff'); ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
    ctx.strokeStyle = 'rgba(60,110,140,.5)'; ctx.lineWidth = 2.4; ctx.stroke();
    /* it hangs on a short bracket, so it reads as bolted down, not floating */
    fillRR(ctx, cx - 7, cy + r * .7, 14, h - (cy + r * .7 - y), 4, '#96a2b0');
    ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * 1.6) * .1;
    for (let i = 0; i < 4; i++) {
      const a = t * .6 + i * TAU / 4;
      circle(ctx, cx + Math.cos(a) * r * .5, cy + Math.sin(a) * r * .5, 2.4, '#4fc3ea');
    }
    ctx.restore();
  },
  printerS(ctx, x, y, w, h, t) {
    steelBox(ctx, x, y + h * .1, w, h * .9, 6, '#eef2f6', '#b9c4d0');
    fillRR(ctx, x + w * .12, y + h * .22, w * .76, h * .42, 4, '#1b2430');
    ctx.save(); ctx.globalAlpha = .85;
    const k = (t * 40) % (w * .68);
    line(ctx, x + w * .16 + k, y + h * .26, x + w * .16 + k, y + h * .6, '#8fe0a8', 3);
    ctx.globalAlpha = .5;
    fillRR(ctx, x + w * .16, y + h * .52, w * .68, 7, 2, '#4fc3ea'); ctx.restore();
    fillRR(ctx, x + w * .2, y + h * .72, w * .6, 9, 3, '#f0c23a');
    fillRR(ctx, x + w * .34, y, w * .32, h * .12, 4, '#96a2b0');
  },
  cargoS(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 6, '#e8dcc0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .75;
    for (let i = 0; i < 2; i++) fillRR(ctx, x + 4, y + h * (.24 + i * .38), w - 8, 9, 3, '#3f4a58');
    for (let i = 0; i < 2; i++) fillRR(ctx, x + w * (.22 + i * .42), y + 4, 9, h - 8, 3, '#3f4a58');
    ctx.restore();
    fillRR(ctx, x + w * .06, y + h * .06, w * .28, 12, 3, '#e2453c');
  },
  ductS(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#aab6c2', 4);
    fillRR(ctx, x - 4, y + h * .06, w + 8, h * .36, 8, '#eef2f6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 12; px < x + w - 6; px += 24) fillRR(ctx, px, y + h * .06, 6, h * .36, 2, '#b9c4d0');
    ctx.restore();
    /* a bundle of cables cable-tied along the underside */
    for (let i = 0; i < 3; i++)
      fillRR(ctx, x, y + h * (.44 + i * .07), w, 5, 2, ['#4fc3ea', '#f0c23a', '#e2884c'][i]);
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 30; px < x + w; px += 66) fillRR(ctx, px, y + h * .42, 8, h * .24, 3, '#8b98a6');
    ctx.restore();
  },
  nodeTunnel(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#b9c4d0', 12, 3);
    ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.lineTo(x, y + h * .38);
    ctx.quadraticCurveTo(x + w * .5, y - h * .18, x + w, y + h * .38);
    ctx.lineTo(x + w, y + h); ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#f6f9fc'); g.addColorStop(1, '#b9c4d0');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 20; px < x + w - 10; px += 34) {
      ctx.beginPath();
      ctx.moveTo(px, y + h);
      ctx.quadraticCurveTo(px + 4, y + h * .5, px + (px < x + w / 2 ? 12 : -12), y + h * .22);
      ctx.strokeStyle = '#8b98a6'; ctx.lineWidth = 2.6; ctx.stroke();
    }
    ctx.restore();
    for (let px = x + 28; px < x + w; px += 60) {
      ctx.save(); ctx.globalAlpha = .55 + Math.sin(t * 3 + px * .04) * .2;
      circle(ctx, px, y + h * .16, 4, '#4fc3ea'); ctx.restore();
    }
  },
  rackLedge(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .42, 4, '#dfe4ea');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 12; px < x + w - 8; px += 34) fillRR(ctx, px, y + 4, 20, h * .32, 3, '#b9c4d0');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x, y - 5, w, 4, 2, '#4fc3ea'); ctx.restore();
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 24; px < x + w; px += 62) fillRR(ctx, px, y + h * .42, 9, h * .58, 3, '#96a2b0');
    ctx.restore();
  },
  velcroDeco(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i < Math.round(w / 24); i++) fillRR(ctx, x + 6 + i * 24, y + h * .35, 15, 6, 2, '#8b98a6');
    ctx.restore();
  },
  stationDoor(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h, 10, '#c8d4e0');
    fillRR(ctx, x + 8, y + 8, w - 16, h - 16, 7, '#1b2430');
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 30; i++) {
      const r = makeRng(i * 41 + 9);
      circle(ctx, x + 14 + r() * (w - 28), y + 14 + r() * (h - 40), 1.2, '#fff');
    }
    ctx.restore();
    /* the Moon, seen through it */
    circle(ctx, x + w * .5, y + h * .42, w * .21, '#e6e2d8');
    ctx.save(); ctx.globalAlpha = .5;
    circle(ctx, x + w * .44, y + h * .38, w * .05, '#c2bcae');
    circle(ctx, x + w * .58, y + h * .48, w * .04, '#c2bcae'); ctx.restore();
    ctx.fillStyle = '#8fe0a8'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('MĖNULIS →', x + w * .5, y + h - 12);
  },

  /* ==================== 13 · THE MOON ==================== */
  moonRock(ctx, x, y, w, h, t, pal, seed) {
    const r = makeRng((seed | 0) + 5);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w * (.08 + r() * .1), y + h * (.3 + r() * .2));
    ctx.lineTo(x + w * (.36 + r() * .1), y + h * (.02 + r() * .12));
    ctx.lineTo(x + w * (.72 + r() * .1), y + h * (.16 + r() * .16));
    ctx.lineTo(x + w, y + h * (.5 + r() * .2));
    ctx.lineTo(x + w, y + h); ctx.closePath();
    ctx.fillStyle = '#c8c2b4'; ctx.fill(); outline(ctx, 'rgba(40,36,50,.5)', 2.4);
    ctx.save(); ctx.globalAlpha = .55;
    poly(ctx, [[x + w * .1, y + h], [x + w * .38, y + h * .1], [x + w * .5, y + h * .18], [x + w * .3, y + h]], '#e2ddd0');
    ctx.globalAlpha = .35;
    circle(ctx, x + w * .66, y + h * .58, w * .1, '#9c968a'); ctx.restore();
  },
  landerLeg(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .3, y, w * .4, h * .42, 5, '#e8e2d4');
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * .3, y + h * .1, w * .4, 8, 2, '#f0c23a'); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    line(ctx, x + w * .42, y + h * .42, x + w * .1, y + h - 6, '#96a2b0', 7);
    line(ctx, x + w * .6, y + h * .42, x + w * .92, y + h - 6, '#96a2b0', 7);
    fillEll(ctx, x + w * .1, y + h - 4, w * .18, 6, '#7f8b99');
    fillEll(ctx, x + w * .92, y + h - 4, w * .18, 6, '#7f8b99');
    line(ctx, x + w * .18, y + h * .72, x + w * .84, y + h * .72, '#8b98a6', 4);
  },
  roverPart(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .08, y + h * .3, w * .84, h * .38, 5, '#c8cfd8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x + w * .18, y + h * .08, w * .3, h * .24, 4, '#22355c');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 3; i++) line(ctx, x + w * (.18 + i * .1), y + h * .08, x + w * (.18 + i * .1), y + h * .32, '#5f7fc4', 2);
    ctx.restore();
    wheel(ctx, x + w * .24, y + h * .78, h * .2, '#3f4a58');
    wheel(ctx, x + w * .74, y + h * .78, h * .2, '#3f4a58');
    line(ctx, x + w * .74, y + h * .3, x + w * .88, y + h * .04, '#8b98a6', 3);
    circle(ctx, x + w * .88, y + h * .04, 4, '#e2453c');
  },
  crateMoon(ctx, x, y, w, h) {
    steelBox(ctx, x, y, w, h, 4, '#e8e2d4', '#a8a294');
    ctx.save(); ctx.globalAlpha = .7;
    fillRR(ctx, x + 5, y + h * .3, w - 10, 7, 2, '#e2453c');
    fillRR(ctx, x + 5, y + h * .62, w - 10, 7, 2, '#e2453c'); ctx.restore();
    ctx.fillStyle = '#3f4a58'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('BAZĖ', x + w * .5, y + h * .56);
  },
  drillMoon(ctx, x, y, w, h, t) {
    fillRR(ctx, x + w * .16, y + h * .5, w * .68, h * .5, 5, '#f0c23a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    line(ctx, x + w * .5, y + h * .5, x + w * .5, y + h * .04, '#96a2b0', 8);
    ctx.save(); ctx.translate(x + w * .5, y + h * .1); ctx.rotate(t * 2);
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.rotate(i * TAU / 3);
      poly(ctx, [[0, -3], [w * .22, -8], [w * .22, 8], [0, 3]], '#c8cfd8'); ctx.restore();
    }
    ctx.restore();
    hazardTape(ctx, x + w * .2, y + h * .68, w * .6, 9);
  },
  archMoon(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#8b98a6', 3);
    /* a communications gantry bridging two crater rims */
    fillRR(ctx, x - 6, y + h * .08, w + 12, 9, 3, '#c8c2b4');
    fillRR(ctx, x - 6, y + h * .44, w + 12, 9, 3, '#c8c2b4');
    ctx.save(); ctx.globalAlpha = .75;
    for (let px = x; px < x + w; px += 28) {
      line(ctx, px, y + h * .12, px + 20, y + h * .48, '#9c968a', 3.2);
      line(ctx, px + 20, y + h * .12, px, y + h * .48, '#9c968a', 3.2);
    }
    ctx.restore();
    for (let px = x + 24; px < x + w; px += 70) {
      circle(ctx, px, y + h * .6, 5, '#e2453c');
      ctx.save(); ctx.globalAlpha = .25 + Math.sin(t * 3 + px) * .12;
      circle(ctx, px, y + h * .6, 12, '#ff8f8a'); ctx.restore();
    }
  },
  lavaTube(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#9c968a', 13, 3);
    ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.lineTo(x, y + h * .36);
    ctx.quadraticCurveTo(x + w * .5, y - h * .2, x + w, y + h * .36);
    ctx.lineTo(x + w, y + h); ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#d2ccbe'); g.addColorStop(1, '#8a8478');
    ctx.fillStyle = g; ctx.fill(); outline(ctx, 'rgba(40,36,50,.5)', 2.6);
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 22; px < x + w - 12; px += 42) {
      ctx.beginPath();
      ctx.moveTo(px, y + h);
      ctx.quadraticCurveTo(px + 8, y + h * .5, px + 3, y + h * .16);
      ctx.strokeStyle = '#efeade'; ctx.lineWidth = 2.4; ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 34; px < x + w; px += 74) {
      circle(ctx, px, y + h * .2, 4, '#8fd6ff');
      line(ctx, px, y + h * .2, px, y, '#5f6c7a', 2);
    }
    ctx.restore();
  },
  craterLedge(ctx, x, y, w, h, t, pal, seed) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e2ddd0'); g.addColorStop(1, '#a8a294');
    fillRR(ctx, x, y, w, h * .5, 6); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(40,36,50,.5)'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 18; px < x + w; px += 34) circle(ctx, px, y + h * .3, 4 + ((px | 0) % 4), '#9c968a');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 26; px < x + w; px += 66) {
      ctx.beginPath();
      ctx.moveTo(px, y + h * .5); ctx.lineTo(px + 14, y + h); ctx.lineTo(px - 10, y + h); ctx.closePath();
      ctx.fillStyle = '#b8b2a2'; ctx.fill();
    }
    ctx.restore();
  },
  dustMoon(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .45;
    fillEll(ctx, x + w * .5, y + h * .6, w * .46, h * .34, '#d8d2c4');
    for (let i = 0; i < 3; i++) circle(ctx, x + w * (.24 + i * .26), y + h * .5, 3.4, '#9c968a');
    ctx.restore();
  },
  pawMoon(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i < Math.round(w / 30); i++) {
      const px = x + 14 + i * 30, py = y + h * .5 + (i % 2 ? 6 : -6);
      fillEll(ctx, px, py, 6, 5, '#9c968a');
      for (let k = 0; k < 3; k++) circle(ctx, px - 5 + k * 5, py - 7, 2, '#9c968a');
    }
    ctx.restore();
  },

  /* ==================== THE SECOND ROUTES ==================== */
  /* --- the airship's ballast deck --- */
  ballastTank(ctx, x, y, w, h, t) {
    fillRR(ctx, x + w * .06, y, w * .88, h, 16, '#8fa8b8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * .04, y + h * .34, w * .92, 8, 3, '#5f7c8c'); ctx.restore();
    /* the water in the sight glass, sloshing */
    fillRR(ctx, x + w * .38, y + h * .12, w * .24, h * .7, 5, '#1b3440');
    ctx.save(); ctx.globalAlpha = .85;
    const lv = y + h * .42 + Math.sin(t * 1.6) * 4;
    fillRR(ctx, x + w * .38, lv, w * .24, y + h * .82 - lv, 3, '#4fc3ea'); ctx.restore();
    circle(ctx, x + w * .18, y + h * .2, 5, '#c8cfd8');
  },
  pipeValve(ctx, x, y, w, h, t) {
    fillRR(ctx, x, y + h * .44, w, h * .3, 10, '#8b98a6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    const cx = x + w * .5, cy = y + h * .3;
    line(ctx, cx, y + h * .44, cx, cy, '#6f7c8a', 6);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(t * .7) * .3);
    ctx.beginPath(); ctx.arc(0, 0, w * .2, 0, TAU);
    ctx.strokeStyle = '#e2453c'; ctx.lineWidth = 6; ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const a = i * TAU / 4;
      line(ctx, 0, 0, Math.cos(a) * w * .2, Math.sin(a) * w * .2, '#e2453c', 4);
    }
    ctx.restore();
    fillRR(ctx, x + w * .1, y + h * .74, w * .8, h * .26, 3, '#7f8b99');
  },
  engineCase(ctx, x, y, w, h, t) {
    steelBox(ctx, x, y + h * .1, w, h * .9, 6, '#c9a86a', '#8a6a45');
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 4; i++) fillRR(ctx, x + 6, y + h * (.24 + i * .17), w - 12, 6, 2, '#5f4429');
    ctx.restore();
    const cx = x + w * .5, cy = y + h * .1;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 6);
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(i * TAU / 3); fillEll(ctx, w * .2, 0, w * .2, 5, '#c8cfd8'); ctx.restore(); }
    ctx.restore();
    circle(ctx, cx, cy, 5, '#7f8b99');
  },
  gearCrate(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 4, '#b8955c', '#8a6a45');
    slats(ctx, x + 4, y + 4, w - 8, h - 8, 3, '#5f4429');
    ctx.save(); ctx.globalAlpha = .8;
    circle(ctx, x + w * .5, y + h * .42, Math.min(w, h) * .2, '#96a2b0');
    circle(ctx, x + w * .5, y + h * .42, Math.min(w, h) * .09, '#5f6c7a'); ctx.restore();
  },
  lowBeamB(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#8a6a45', 11, 4);
    fillRR(ctx, x - 4, y, w + 8, h * .3, 3, '#a8834f');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 14; px < x + w; px += 32) circle(ctx, px, y + h * .15, 3, '#5f4429');
    ctx.restore();
    for (let px = x + 30; px < x + w; px += 84) {
      ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 2 + px) * .1;
      circle(ctx, px, y + h * .42, 14, '#ffd870'); ctx.restore();
      circle(ctx, px, y + h * .36, 4.4, '#fff3c4');
    }
  },
  ropeTunnelB(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#8a6a45', 9, 5);
    fillRR(ctx, x, y, w, 9, 3, '#8a6a45');
    for (let px = x + 8; px < x + w - 4; px += 15) {
      ctx.beginPath();
      ctx.moveTo(px, y + 8);
      ctx.quadraticCurveTo(px + 4, y + h * .3, px - 2, y + h * .56 + Math.sin(t + px) * 3);
      ctx.strokeStyle = px % 30 < 15 ? '#e8d6a8' : '#c9b184'; ctx.lineWidth = 4; ctx.stroke();
    }
    ctx.save(); ctx.globalAlpha = .3; fillRR(ctx, x, y + 8, w, h * .5, 6, '#3a2f22'); ctx.restore();
  },
  ballastLedge(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .44, 3, '#a8834f');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 8; px < x + w - 4; px += 18) line(ctx, px, y + 3, px, y + h * .44 - 3, '#6f5232', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 22; px < x + w; px += 58) line(ctx, px, y + h * .44, px - 10, y + h, '#8a6a45', 5);
    ctx.restore();
  },

  /* --- the seed cellar under the glasshouses --- */
  seedBin(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y + h * .1); ctx.lineTo(x + w, y + h * .1);
    ctx.lineTo(x + w * .84, y + h); ctx.lineTo(x + w * .16, y + h); ctx.closePath();
    ctx.fillStyle = '#8a6a45'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 4; i++) line(ctx, x + w * (i / 4), y + h * .12, x + w * (.08 + i * .21), y + h - 3, '#5f4429', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 5; i++) fillEll(ctx, x + w * (.2 + i * .16), y + h * .1, 7, 4.4, i % 2 ? '#e0c48a' : '#c9a86a');
    ctx.restore();
  },
  jarShelf(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .28, 3, '#7a5c3a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    for (let px = x + 12; px < x + w - 10; px += 32) {
      fillRR(ctx, px, y - 26, 20, 26, 4, 'rgba(190,220,200,.75)');
      fillRR(ctx, px + 2, y - 30, 16, 6, 2, '#c9a86a');
      ctx.save(); ctx.globalAlpha = .8;
      fillRR(ctx, px + 3, y - 16, 14, 14, 3, ((px | 0) % 3) ? '#e2584f' : '#f0a93a'); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = .7;
    for (let px = x + 22; px < x + w; px += 60) fillRR(ctx, px, y + h * .28, 9, h * .72, 3, '#6f5232');
    ctx.restore();
  },
  cellarCrate(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 4, '#c9a86a', '#8a6a45');
    slats(ctx, x + 4, y + 4, w - 8, h - 8, 4, '#5f4429', true);
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 3; i++) fillEll(ctx, x + w * (.26 + i * .24), y - 3, 9, 7, i % 2 ? '#e2584f' : '#f0c23a');
    ctx.restore();
  },
  rootBundle(ctx, x, y, w, h, t, pal, seed, o) {
    hangTo(ctx, x, y, w, '#6f5232', 3);
    fillRR(ctx, x, y + h * .06, w, 8, 3, '#6f5232');
    const r = makeRng((seed | 0) + 3);
    for (let px = x + 8; px < x + w - 4; px += 20) {
      const d = h * (.2 + r() * .26);
      ctx.beginPath();
      ctx.moveTo(px, y + h * .12);
      ctx.quadraticCurveTo(px + 5, y + h * .12 + d * .6, px - 3, y + h * .12 + d);
      ctx.strokeStyle = '#7f9c4a'; ctx.lineWidth = 4; ctx.stroke();
      fillEll(ctx, px - 3, y + h * .12 + d, 7, 10, '#e2884c');
    }
  },
  cellarArch(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#8a7f6c', 13, 3);
    ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.lineTo(x, y + h * .4);
    ctx.quadraticCurveTo(x + w * .5, y - h * .14, x + w, y + h * .4);
    ctx.lineTo(x + w, y + h); ctx.closePath();
    ctx.fillStyle = '#a89c86'; ctx.fill(); outline(ctx, INK, 2.5);
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 16; px < x + w; px += 30) line(ctx, px, y + h, px + 2, y + h * .3, '#7f7462', 2.4);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .3; fillRR(ctx, x + 6, y + 8, w - 12, h * .4, 16, '#3a3226'); ctx.restore();
  },

  /* --- the quarry's conveyor gallery, and the bunker under it --- */
  beltRoller(ctx, x, y, w, h, t) {
    fillRR(ctx, x, y + h * .38, w, h * .26, 8, '#3f4a58');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 5; i++) {
      const px = x + imod(i * (w / 5) + t * 40, w);
      fillRR(ctx, px, y + h * .3, 12, 9, 3, '#c8c2b4');
    }
    ctx.restore();
    fillRR(ctx, x + w * .06, y + h * .64, w * .16, h * .36, 3, '#5f6c7a');
    fillRR(ctx, x + w * .78, y + h * .64, w * .16, h * .36, 3, '#5f6c7a');
  },
  hopperQ(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w, y);
    ctx.lineTo(x + w * .66, y + h * .72); ctx.lineTo(x + w * .34, y + h * .72); ctx.closePath();
    ctx.fillStyle = '#8b98a6'; ctx.fill(); outline(ctx, INK, 2.5);
    ctx.save(); ctx.globalAlpha = .5;
    line(ctx, x + w * .2, y + 3, x + w * .42, y + h * .7, '#5f6c7a', 2.4);
    line(ctx, x + w * .8, y + h * .02, x + w * .58, y + h * .7, '#5f6c7a', 2.4); ctx.restore();
    fillRR(ctx, x + w * .3, y + h * .72, w * .4, h * .28, 3, '#5f6c7a');
    hazardTape(ctx, x + w * .1, y + h * .12, w * .8, 9);
  },
  spoilPile(ctx, x, y, w, h, t, pal, seed) {
    const r = makeRng((seed | 0) + 9);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w * .3, y + h * (.1 + r() * .16), x + w * .56, y + h * .3);
    ctx.quadraticCurveTo(x + w * .8, y + h * .5, x + w, y + h);
    ctx.closePath(); ctx.fillStyle = '#c2bcac'; ctx.fill(); outline(ctx, 'rgba(40,36,50,.4)', 2.3);
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 7; i++) circle(ctx, x + w * (.16 + r() * .7), y + h * (.4 + r() * .5), 3 + r() * 4, '#e2ddd0');
    ctx.restore();
  },
  galleryBeam(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#7f8b99', 12, 4);
    fillRR(ctx, x - 4, y, w + 8, h * .28, 3, '#8b98a6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    hazardTape(ctx, x + 6, y + h * .28, w - 12, 8);
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 16; px < x + w; px += 38) line(ctx, px, y + h * .36, px, y + h * .58, '#5f6c7a', 3);
    ctx.restore();
    for (let px = x + 40; px < x + w; px += 96) {
      ctx.save(); ctx.globalAlpha = .28 + Math.sin(t * 1.8 + px) * .1;
      circle(ctx, px, y + h * .5, 15, '#ffd870'); ctx.restore();
      circle(ctx, px, y + h * .44, 4.4, '#fff3c4');
    }
  },
  galleryLedge(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .44, 3, '#96a2b0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 7; px < x + w - 4; px += 13) line(ctx, px, y + 3, px, y + h * .44 - 3, '#5f6c7a', 2);
    ctx.restore();
    hazardTape(ctx, x, y - 7, w, 7);
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 24; px < x + w; px += 62) line(ctx, px, y + h * .44, px - 12, y + h, '#7f8b99', 5);
    ctx.restore();
  },

  /* --- the sealed test bunker, right at the bottom --- */
  testRig(ctx, x, y, w, h, t) {
    fillRR(ctx, x + w * .1, y + h * .1, w * .8, h * .9, 5, '#5f6c7a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + w * .2, y + h * .22, w * .6, h * .34, 4, '#1b2430');
    ctx.save(); ctx.globalAlpha = .85;
    for (let i = 0; i < 4; i++) {
      const hgt = 4 + ((i * 5 + Math.floor(t * 2)) % 4) * 4;
      fillRR(ctx, x + w * (.26 + i * .13), y + h * .52 - hgt, w * .08, hgt, 1, '#8fe0a8');
    }
    ctx.restore();
    hazardTape(ctx, x + w * .16, y + h * .66, w * .68, 9);
    circle(ctx, x + w * .3, y + h * .84, 4, '#e2453c');
    circle(ctx, x + w * .5, y + h * .84, 4, '#f0c23a');
  },
  fuelCan(ctx, x, y, w, h) {
    fillRR(ctx, x + w * .12, y + h * .12, w * .76, h * .88, 5, '#e2453c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .6;
    fillRR(ctx, x + w * .2, y + h * .3, w * .6, h * .1, 2, '#a8302c');
    fillRR(ctx, x + w * .2, y + h * .62, w * .6, h * .1, 2, '#a8302c'); ctx.restore();
    fillRR(ctx, x + w * .38, y, w * .24, h * .14, 3, '#8b98a6');
    ctx.beginPath(); ctx.arc(x + w * .5, y + h * .1, w * .22, Math.PI, TAU);
    ctx.strokeStyle = '#96a2b0'; ctx.lineWidth = 4; ctx.stroke();
  },
  sparePack(ctx, x, y, w, h, t) {
    /* an old pack like hers, empty, propped against the wall */
    fillRR(ctx, x + w * .16, y + h * .1, w * .3, h * .8, 8, '#b9c4d0');
    fillRR(ctx, x + w * .52, y + h * .1, w * .3, h * .8, 8, '#a8b4c0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x + w * .1, y + h * .9, w * .8, h * .1, 3, '#5f6c7a');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + w * .2, y + h * .2, w * .1, h * .4, 4, '#fff'); ctx.restore();
    fillRR(ctx, x + w * .3, y, w * .4, h * .1, 3, '#f0c23a');
  },
  bunkerBeam(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#6f7c8a', 12, 4);
    fillRR(ctx, x - 4, y, w + 8, h * .3, 3, '#7f8b99');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    hazardTape(ctx, x + 5, y + h * .3, w - 10, 9);
    for (let px = x + 32; px < x + w; px += 76) {
      const on = (Math.sin(t * 2.4 + px * .03) > -0.3);
      ctx.save(); ctx.globalAlpha = on ? .3 : .08;
      circle(ctx, px, y + h * .52, 16, '#e2453c'); ctx.restore();
      circle(ctx, px, y + h * .46, 4.4, on ? '#ff8f8a' : '#7a3a3a');
    }
  },
  bunkerLedge(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h * .44, 3, '#8b98a6');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 9; px < x + w - 4; px += 16) fillRR(ctx, px, y + 4, 8, h * .44 - 8, 2, '#5f6c7a');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 26; px < x + w; px += 64) fillRR(ctx, px, y + h * .44, 10, h * .56, 3, '#6f7c8a');
    ctx.restore();
  },

  /* ==================== THE JETPACK ==================== */
  /* the thing itself, lying on its stand at the bottom of the bunker */
  jetpack(ctx, x, y, w, h, t) {
    ctx.save(); ctx.translate(x + w * .5, y + h * .5);
    /* the glow that says "this is worth having" */
    ctx.save(); ctx.globalAlpha = .22 + Math.sin(t * 2.4) * .1;
    circle(ctx, 0, 0, w * .72, '#8fd6ff'); ctx.restore();
    const bob = Math.sin(t * 1.8) * 3;
    ctx.translate(0, bob);
    /* two bottles, a harness and a pair of nozzles */
    fillRR(ctx, -w * .30, -h * .34, w * .26, h * .62, 11, '#e8eef4');
    fillRR(ctx, w * .04, -h * .34, w * .26, h * .62, 11, '#cfd9e4');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    fillRR(ctx, -w * .32, -h * .06, w * .64, h * .12, 4, '#e2453c');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, -w * .26, -h * .28, w * .07, h * .4, 4, '#fff'); ctx.restore();
    fillRR(ctx, -w * .34, -h * .44, w * .68, h * .12, 5, '#f0c23a');
    [-w * .17, w * .17].forEach(px => {
      poly(ctx, [[px - w * .09, h * .28], [px + w * .09, h * .28],
        [px + w * .13, h * .46], [px - w * .13, h * .46]], '#8b98a6');
      ctx.save(); ctx.globalAlpha = .5 + Math.sin(t * 8 + px) * .25;
      poly(ctx, [[px - w * .1, h * .46], [px + w * .1, h * .46], [px, h * .68]], '#8fd6ff');
      ctx.restore();
    });
    /* the harness straps */
    ctx.save(); ctx.globalAlpha = .8;
    line(ctx, -w * .2, -h * .4, -w * .3, h * .1, '#3f4a58', 4);
    line(ctx, w * .2, -h * .4, w * .3, h * .1, '#3f4a58', 4); ctx.restore();
    ctx.restore();
    /* sparks going up off it */
    for (let i = 0; i < 5; i++) {
      const ph = ((t * .5) + i * .2) % 1;
      ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI) * .8;
      circle(ctx, x + w * .5 + Math.sin(ph * 7 + i) * w * .4, y + h * .5 - ph * h * .9, 2.4, '#8fd6ff');
      ctx.restore();
    }
  },

  /* ==================== SHAFTS, SIGNS AND GATEWAYS ==================== */
  hatchShaft(ctx, x, y, w, h, t, pal) {
    /* the open hatch in the salon floor, seen from above */
    ctx.save();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#1b2430'); g.addColorStop(1, '#0d131b');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = .55;
    for (let i = 0; i < 5; i++) fillRR(ctx, x + 6, y + 16 + i * 26, w - 12, 7, 2, '#3f4a58');
    ctx.restore();
    fillRR(ctx, x - 6, y - 7, w + 12, 11, 4, '#8b98a6');
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x - 6, y - 7, w + 12, 4, 2, '#c8cfd8'); ctx.restore();
  },
  cellarShaft(ctx, x, y, w, h) {
    ctx.save();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#3a3226'); g.addColorStop(1, '#1b160f');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = .5;
    for (let i = 0; i < 5; i++) fillRR(ctx, x + 5, y + 14 + i * 25, w - 10, 7, 2, '#6f5232');
    ctx.restore();
    fillRR(ctx, x - 7, y - 8, w + 14, 12, 4, '#8a6a45');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x; px < x + w; px += 18) circle(ctx, px + 6, y - 2, 2.4, '#5f4429'); ctx.restore();
  },
  galleryShaft(ctx, x, y, w, h) {
    ctx.save();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#2b3440'); g.addColorStop(1, '#12181f');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = .55;
    for (let i = 0; i < 5; i++) fillRR(ctx, x + 6, y + 15 + i * 25, w - 12, 7, 2, '#5f6c7a');
    ctx.restore();
    hazardTape(ctx, x - 8, y - 10, w + 16, 11);
  },
  deepShaft(ctx, x, y, w, h, t) {
    ctx.save();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#1b2430'); g.addColorStop(1, '#05080c');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = .45;
    for (let i = 0; i < 5; i++) fillRR(ctx, x + 6, y + 14 + i * 26, w - 12, 6, 2, '#3f4a58');
    ctx.restore();
    fillRR(ctx, x - 8, y - 9, w + 16, 12, 4, '#5f6c7a');
    ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * 1.4) * .12;
    fillRR(ctx, x, y, w, 40, 6, '#4fc3ea'); ctx.restore();
  },
  ballastSign(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = (o && o.floorY) || (y + h);
    fillRR(ctx, x + w * .12, y, w * .76, 46, 6, '#2f3a48');
    ctx.fillStyle = '#8fd6ff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('BALASTO DENIS', x + w * .5, y + 21);
    ctx.fillStyle = '#c8cfd8'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText('▼ arba peršok', x + w * .5, y + 38);
    line(ctx, x + w * .5, y + 46, x + w * .5, fy, '#8b98a6', 5);
  },
  cellarSign(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = (o && o.floorY) || (y + h);
    fillRR(ctx, x + w * .12, y, w * .76, 46, 6, '#4f3a26');
    ctx.fillStyle = '#f0c23a'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('SĖKLŲ RŪSYS', x + w * .5, y + 21);
    ctx.fillStyle = '#e8dcc0'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText('▼ arba peršok', x + w * .5, y + 38);
    line(ctx, x + w * .5, y + 46, x + w * .5, fy, '#8a6a45', 5);
  },
  gallerySign(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = (o && o.floorY) || (y + h);
    fillRR(ctx, x + w * .12, y, w * .76, 46, 6, '#f0c23a');
    ctx.fillStyle = '#2b2634'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TRANSPORTERIS', x + w * .5, y + 21);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('▼ arba peršok', x + w * .5, y + 38);
    line(ctx, x + w * .5, y + 46, x + w * .5, fy, '#8b98a6', 5);
  },
  deepSign(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = (o && o.floorY) || (y + h);
    fillRR(ctx, x + w * .12, y, w * .76, 46, 6, '#a8302c');
    ctx.fillStyle = '#ffe0d8'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('BANDYMŲ BUNKERIS', x + w * .5, y + 21);
    ctx.fillStyle = '#ffd0c8'; ctx.font = 'bold 11px sans-serif';
    ctx.fillText('užverstas nuo seno', x + w * .5, y + 37);
    line(ctx, x + w * .5, y + 46, x + w * .5, fy, '#6f7c8a', 5);
  },
  upOut(ctx, x, y, w, h, t, pal, seed, o) {
    const fy = (o && o.floorY) || (y + h);
    ctx.save(); ctx.globalAlpha = .9;
    fillRR(ctx, x, y + h - 44, w, 34, 6, '#2f3a48');
    ctx.fillStyle = '#8fe0a8'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('▲ ATGAL Į VIRŠŲ', x + w * .5, y + h - 21);
    ctx.restore();
  },
  roomGateA(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h, 8, '#7f8b99');
    fillRR(ctx, x + 9, y + 9, w - 18, h - 18, 5, '#1b2430');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 5; i++) line(ctx, x + 12, y + 18 + i * (h - 34) / 5, x + w - 12, y + 18 + i * (h - 34) / 5, '#3f4a58', 2);
    ctx.restore();
    hazardTape(ctx, x + 4, y + h - 20, w - 8, 10);
  },
  roomGateW(ctx, x, y, w, h, t, pal, seed, o) {
    fillRR(ctx, x, y, w, h, 8, '#8a6a45');
    fillRR(ctx, x + 9, y + 9, w - 18, h - 18, 5, '#2f2620');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 14; px < x + w - 10; px += 18) line(ctx, px, y + 12, px, y + h - 12, '#5f4429', 3);
    ctx.restore();
  }
});

/* ---- how wide each of these naturally is, for wide platforms ---- */
Object.assign(PROP_NATURAL, {
  catwalkA: 180, guyWire: 170, canvasSleeve: 180, archSalon: 175, lampRow: 175,
  sideboardA: 175, divanA: 185, pianoA: 190, runnerRug: 200, gantryArch: 175,
  craneJib: 180, gantryLedge: 180, benchT: 175, awningT: 170, glassArch: 180,
  tableT: 165, blossomBough: 195, blossomTunnel: 195, wallO: 190, hangBasket: 180,
  vineTunnel: 185, potBench: 175, raisedBed: 170, archQ: 180, chuteQ: 175,
  benchQ: 180, trackQ: 200, beamMine: 180, tunnelMine: 190, ledgeMine: 180,
  railDeco: 200, ductSilo: 175, gantryTunnel: 180, gantryLedge2: 180, gridDeco: 200,
  pipeRun: 180, hatchTunnel: 190, shelfR: 175, ledStrip: 220, trussO: 180,
  tetherTunnel: 180, railO: 180, boltO: 200, ductS: 180, nodeTunnel: 190,
  rackLedge: 175, velcroDeco: 200, archMoon: 180, lavaTube: 195, craterLedge: 180,
  pawMoon: 200, lowBeamB: 180, ropeTunnelB: 185, ballastLedge: 180, jarShelf: 175,
  rootBundle: 180, cellarArch: 185, galleryBeam: 180, galleryLedge: 180,
  bunkerBeam: 180, bunkerLedge: 180, beltRoller: 175, seamA: 190, rivets: 200,
  tilePat: 200, petalDeco: 200, grassTuft: 190, leafDeco: 200, dustQ: 190,
  saltDeco: 190, dustMoon: 190, oilStain: 180, boltPlate: 190, warnStripe: 200,
  spillDeco: 180, decalO: 180, treadGlass: 400, treadSteel: 400
});

const PROP_SIZE3 = {
  ventCowl: [58, 74], riggingCleat: [64, 48], antennaBox: [62, 76], sunPanel: [86, 56],
  airLamp: [50, 82], finA: [88, 84], catwalkA: [140, 42],
  wickerChair: [72, 78], teaTrolley: [96, 68], globeStand: [58, 86], hatBoxes: [64, 74],
  brassFan: [58, 80], divanA: [168, 66], pianoA: [176, 74], sideboardA: [150, 42],
  toolChest: [70, 62], cableDrum: [84, 70], sandbagM: [86, 52], beaconM: [52, 84],
  windSock: [104, 56], crateM: [70, 62], gantryLedge: [150, 42],
  planterT: [72, 78], deckLamp: [54, 88], tableT: [96, 60], umbrellaT: [92, 90],
  aerialT: [64, 80], benchT: [130, 42],
  beehive: [62, 82], ladderO: [70, 92], barrowO: [98, 62], cratesO: [78, 66],
  treeStumpO: [72, 58], wallO: [150, 56],
  seedTray: [78, 52], wateringCan: [72, 60], potStack: [58, 74], hoseCoil: [82, 54],
  sackG: [64, 70], potBench: [150, 44], raisedBed: [120, 70],
  blockQ: [82, 68], drumQ: [58, 76], sawQ: [96, 66], coneQ: [50, 62], bucketQ: [88, 60],
  benchQ: [150, 44], stepQ: [120, 70],
  saltBlock: [80, 66], oreCart: [96, 62], propTimber: [76, 88], lampMine: [52, 78],
  barrelMine: [58, 72], ledgeMine: [150, 44],
  fuelDrum: [60, 84], toolCrate: [72, 60], coolPipe: [96, 56], conePart: [66, 82],
  robotArm: [64, 92], gantryLedge2: [150, 42],
  seatPod: [86, 72], lockerR: [62, 78], cargoNetR: [84, 66], tankR: [78, 74],
  consoleR: [90, 64], shelfR: [150, 42],
  antennaO: [56, 88], thrusterO: [70, 64], crateO: [76, 62], tankO: [88, 58],
  dishO: [82, 76], railO: [150, 40],
  bagS: [62, 70], labRack: [70, 80], sphereS: [64, 66], printerS: [80, 74],
  cargoS: [76, 66], rackLedge: [150, 42],
  moonRock: [86, 62], landerLeg: [78, 86], roverPart: [98, 62], crateMoon: [72, 62],
  drillMoon: [70, 84], craterLedge: [150, 46],
  ballastTank: [72, 82], pipeValve: [88, 62], engineCase: [70, 80], gearCrate: [70, 62],
  ballastLedge: [150, 42],
  seedBin: [76, 62], cellarCrate: [72, 62], jarShelf: [150, 42],
  beltRoller: [110, 54], hopperQ: [80, 70], spoilPile: [96, 56], galleryLedge: [150, 42],
  testRig: [76, 80], fuelCan: [56, 70], sparePack: [66, 74], bunkerLedge: [150, 42]
};
Object.assign(PROP_SIZE, PROP_SIZE3);
/* Anything that can stand on the floor can also end up being a step or a
   shelf 700 px long, and a crate drawn 700 px wide is not a crate. Whatever
   has a natural size gets repeated at it unless it already says otherwise. */
Object.keys(PROP_SIZE3).forEach(k => {
  if (!PROP_NATURAL[k]) PROP_NATURAL[k] = PROP_SIZE3[k][0] + 16;
});
