'use strict';
/* ---------------------------------------------------------------
   props4.js — everything the boss level is built out of: the vet's
   room, the clinic corridor, the city street, the grooming salon
   and the alleys she gets away down.

   Same contract as props.js / props2.js / props3.js:
   (ctx, x, y, w, h, t, pal, seed, o), (x, y) the top-left of the
   object's box, y growing down, `o.floorY` the screen y of the floor
   under it — that is what legsTo()/hangTo() need to hold a hanging
   thing up over her head.

   The two people chasing her live down at the bottom of this file.
   They are not props: nothing on the track ever collides with them,
   they are drawn straight onto the screen by boss.js.
----------------------------------------------------------------*/

/* the clinic's one recurring note: white enamel with a coloured lip */
function enamel(ctx, x, y, w, h, r, lip) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#e8eef2'); g.addColorStop(1, '#c4d0d8');
  fillRR(ctx, x, y, w, h, r); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
  if (lip) fillRR(ctx, x + 3, y + 2, w - 6, 6, 3, lip);
}
/* a red cross, the one badge that says "vet" at any size */
function vetCross(ctx, cx, cy, s, col) {
  ctx.save(); ctx.translate(cx, cy);
  fillRR(ctx, -s, -s * 0.34, s * 2, s * 0.68, s * 0.18, col || '#e2453c');
  fillRR(ctx, -s * 0.34, -s, s * 0.68, s * 2, s * 0.18, col || '#e2453c');
  ctx.restore();
}
/* the steel of every trolley, table and clipper in the place */
function chrome(ctx, x, y, w, h, r) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#f2f6fa'); g.addColorStop(0.4, '#b8c4d0'); g.addColorStop(1, '#8b98a6');
  fillRR(ctx, x, y, w, h, r == null ? 4 : r); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2.1; ctx.stroke();
}

Object.assign(PROPS, {

  /* ==================== 1 · THE VET'S ROOM ==================== */
  vetStool(ctx, x, y, w, h) {
    /* a round stool on a gas strut, with castors */
    chrome(ctx, x + w * 0.42, y + h * 0.28, w * 0.16, h * 0.5, 4);
    ctx.save(); ctx.globalAlpha = .8;
    [[0.16, 1], [0.5, 1], [0.84, 1]].forEach(p => {
      line(ctx, x + w * 0.5, y + h * 0.78, x + w * p[0], y + h - 6, '#8b98a6', 5);
      circle(ctx, x + w * p[0], y + h - 4, 4, '#4e576b');
    });
    ctx.restore();
    fillEll(ctx, x + w * 0.5, y + h * 0.26, w * 0.46, h * 0.17, '#3f7fb0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    fillEll(ctx, x + w * 0.38, y + h * 0.2, w * 0.16, h * 0.06, '#a8d0ea'); ctx.restore();
  },
  vetBin(ctx, x, y, w, h) {
    /* the pedal bin with the biohazard lid */
    enamel(ctx, x + 3, y + h * 0.18, w - 6, h * 0.82, 7, null);
    fillRR(ctx, x, y + h * 0.06, w, h * 0.17, 6, '#f0c23a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x + w * 0.3, y, w * 0.4, h * 0.09, 4, '#c9962c');
    ctx.save(); ctx.globalAlpha = .8;
    vetCross(ctx, x + w * 0.5, y + h * 0.58, w * 0.16); ctx.restore();
    ctx.save(); ctx.globalAlpha = .3;
    line(ctx, x + 8, y + h * 0.3, x + 8, y + h - 8, '#8b98a6', 3); ctx.restore();
  },
  petScale(ctx, x, y, w, h) {
    /* a low weighing platform with a dial on a post */
    fillRR(ctx, x, y + h * 0.62, w, h * 0.38, 5, '#c4d0d8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x + 3, y + h * 0.56, w - 6, h * 0.12, 4, '#e8eef2');
    chrome(ctx, x + w * 0.7, y + h * 0.1, w * 0.1, h * 0.52, 3);
    circle(ctx, x + w * 0.74, y + h * 0.12, w * 0.2, '#ffffff');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    line(ctx, x + w * 0.74, y + h * 0.12, x + w * 0.74 + w * 0.12, y + h * 0.06, '#e2453c', 2.4);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 1; i < 4; i++) line(ctx, x + 8, y + h * 0.72 + i * 5, x + w - 8, y + h * 0.72 + i * 5, '#8b98a6', 2);
    ctx.restore();
  },
  carrierBox(ctx, x, y, w, h) {
    /* a plastic pet carrier, door towards her */
    fillRR(ctx, x, y + h * 0.12, w, h * 0.88, 10, '#5f9ad0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    fillRR(ctx, x + 2, y + h * 0.12, w - 4, h * 0.2, 8, '#8fc0e8');
    /* the handle */
    ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.14, w * 0.2, Math.PI, 0);
    ctx.strokeStyle = '#3f6f9c'; ctx.lineWidth = 6; ctx.stroke();
    /* the grille door */
    fillRR(ctx, x + w * 0.42, y + h * 0.34, w * 0.5, h * 0.54, 6, '#2f4a60');
    ctx.save(); ctx.globalAlpha = .85;
    for (let i = 0; i < 5; i++)
      line(ctx, x + w * (0.46 + i * 0.095), y + h * 0.38, x + w * (0.46 + i * 0.095), y + h * 0.84, '#c4d0d8', 3);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x + 7, y + h * 0.4, w * 0.2, h * 0.3, 4, '#c8e2f6'); ctx.restore();
  },
  pillTower(ctx, x, y, w, h) {
    /* a stack of medicine tubs somebody left on the floor */
    const cols = ['#e8834c', '#8fd0a8', '#f0c23a', '#c08fe0'];
    let yy = y + h, i = 0;
    while (yy > y + 2) {
      const bh = Math.min(h * 0.27, yy - y), ins = (i % 2) * 4;
      fillRR(ctx, x + ins, yy - bh + 2, w - ins * 2, bh - 3, 5, cols[i % 4]);
      ctx.strokeStyle = INK; ctx.lineWidth = 2.1; ctx.stroke();
      fillRR(ctx, x + ins + 4, yy - bh + 3, w - ins * 2 - 8, 5, 2, '#ffffff');
      yy -= bh; i++;
    }
    ctx.save(); ctx.globalAlpha = .7;
    vetCross(ctx, x + w * 0.5, y + h * 0.42, w * 0.13, '#ffffff'); ctx.restore();
  },
  examLamp(ctx, x, y, w, h, t, pal, seed, o) {
    /* the big shadowless lamp on its arm, swung right down over her */
    hangTo(ctx, x, y, w, '#8b98a6', 5);
    chrome(ctx, x + w * 0.1, y, w * 0.8, h * 0.34, 8);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.06, y + h * 0.3);
    ctx.lineTo(x + w * 0.94, y + h * 0.3);
    ctx.lineTo(x + w * 0.8, y + h * 0.86);
    ctx.lineTo(x + w * 0.2, y + h * 0.86);
    ctx.closePath();
    ctx.fillStyle = '#e8eef2'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .55 + Math.sin(t * 3) * .08;
    fillEll(ctx, x + w * 0.5, y + h * 0.86, w * 0.3, h * 0.12, '#fff6d8');
    const g = ctx.createLinearGradient(0, y + h * 0.86, 0, y + h * 2.4);
    g.addColorStop(0, 'rgba(255,246,216,.55)'); g.addColorStop(1, 'rgba(255,246,216,0)');
    ctx.fillStyle = g;
    poly(ctx, [[x + w * 0.2, y + h * 0.86], [x + w * 0.8, y + h * 0.86],
               [x + w * 1.05, y + h * 2.4], [x - w * 0.05, y + h * 2.4]]);
    ctx.fill(); ctx.restore();
  },
  xrayArch(ctx, x, y, w, h, t, pal, seed, o) {
    /* a run of lit x-ray viewers under a low soffit — she ducks the whole way */
    hangTo(ctx, x, y, w, '#8b98a6', 5);
    fillRR(ctx, x, y, w, h * 0.9, 5, '#dfe6ec');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save();
    rr(ctx, x + 6, y + 8, w - 12, h * 0.58, 4); ctx.clip();
    ctx.fillStyle = '#c8e8f6'; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = .55;
    for (let px = x + 14; px < x + w - 10; px += 34) {
      fillEll(ctx, px, y + h * 0.34, 12, h * 0.2, '#7fa8c0');
      line(ctx, px - 9, y + h * 0.14, px + 9, y + h * 0.5, '#5f88a0', 3);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + 6, y + 8, w - 12, 4, 2, '#ffffff'); ctx.restore();
    fillRR(ctx, x, y + h * 0.9, w, h * 0.1, 2, '#8b98a6');
  },
  vetCounter(ctx, x, y, w, h, t, pal, seed, o) {
    /* the run of worktop she can get up on, cupboards under it */
    legsTo(ctx, x, y, w, o, '#c4d0d8', 14, 6);
    fillRR(ctx, x, y, w, h * 0.34, 4, '#e8eef2');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x, y + h * 0.3, w, h * 0.2, 3, '#8fb0c8');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 26; px < x + w - 10; px += 52)
      line(ctx, px, y + h * 0.5, px, y + h, '#a8b8c4', 3);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x + 4, y + 3, w - 8, 4, 2, '#ffffff'); ctx.restore();
  },
  vetCrate(ctx, x, y, w, h) {
    /* a stack of supply boxes with the cross on the side */
    boxy(ctx, x, y, w, h, 6, '#f2ece0', '#dcd2c0');
    fillRR(ctx, x + 4, y + h * 0.44, w - 8, 5, 2, '#c4b8a0');
    ctx.save(); ctx.globalAlpha = .9;
    vetCross(ctx, x + w * 0.5, y + h * 0.24, Math.min(w, h) * 0.16); ctx.restore();
    ctx.save(); ctx.globalAlpha = .4;
    line(ctx, x + 6, y + h * 0.7, x + w - 6, y + h * 0.7, '#b8ac94', 2.4); ctx.restore();
  },
  pawTile(ctx, x, y, w, h) {
    /* paw prints on lino — pure scenery */
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 4; i++) {
      const px = x + w * (0.12 + i * 0.24), py = y + h * (i % 2 ? 0.3 : 0.66);
      fillEll(ctx, px, py, 6, 5, '#9aa8b4');
      for (let k = 0; k < 3; k++)
        circle(ctx, px - 5 + k * 5, py - 6.5, 2.1, '#9aa8b4');
    }
    ctx.restore();
  },
  furTuft(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i < 6; i++) {
      const r = makeRng(i * 17 + 3);
      const px = x + r() * w, py = y + h * (0.3 + r() * 0.6);
      fillEll(ctx, px, py, 9 + r() * 7, 4 + r() * 3, '#3a3440', r() * 2);
    }
    ctx.restore();
  },

  /* ==================== 2 · THE CLINIC CORRIDOR ==================== */
  mopBucket(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.06, y + h * 0.36, w * 0.88, h * 0.64, 6, '#f0c23a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + w * 0.12, y + h * 0.3, w * 0.76, h * 0.12, 4, '#c9962c');
    ctx.save(); ctx.globalAlpha = .75;
    fillEll(ctx, x + w * 0.5, y + h * 0.42, w * 0.34, h * 0.09, '#8fd0e8'); ctx.restore();
    /* the mop leaning out of it */
    line(ctx, x + w * 0.62, y + h * 0.4, x + w * 0.94, y, '#a8845a', 6);
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = -2; i <= 2; i++)
      line(ctx, x + w * 0.62, y + h * 0.4, x + w * 0.5 + i * 5, y + h * 0.68, '#e8dcc0', 3);
    ctx.restore();
    [[0.2, 1], [0.8, 1]].forEach(p => circle(ctx, x + w * p[0], y + h - 3, 4, '#4e576b'));
  },
  waitChair(ctx, x, y, w, h) {
    /* one of the moulded chairs from the waiting room, tipped forward */
    fillRR(ctx, x + w * 0.06, y, w * 0.3, h * 0.72, 7, '#4fa8b0');
    fillRR(ctx, x, y + h * 0.5, w, h * 0.18, 7, '#63c4cc');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    line(ctx, x + w * 0.2, y + h * 0.66, x + w * 0.16, y + h, '#8b98a6', 5);
    line(ctx, x + w * 0.84, y + h * 0.66, x + w * 0.9, y + h, '#8b98a6', 5);
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x + w * 0.1, y + 4, w * 0.2, 5, 3, '#a8e4e8'); ctx.restore();
  },
  oxygenTank(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.16, y + h * 0.16, w * 0.68, h * 0.84, w * 0.3, '#3f9c6a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + w * 0.34, y, w * 0.32, h * 0.2, 4, '#c4d0d8');
    circle(ctx, x + w * 0.5, y + h * 0.05, w * 0.14, '#8b98a6');
    fillRR(ctx, x + w * 0.2, y + h * 0.5, w * 0.6, h * 0.1, 3, '#e8eef2');
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x + w * 0.26, y + h * 0.26, w * 0.13, h * 0.5, 5, '#a8e0c0'); ctx.restore();
  },
  boxStack(ctx, x, y, w, h) {
    /* cardboard, three high, the top one open */
    boxy(ctx, x, y + h * 0.5, w, h * 0.5, 5, '#e0b884', '#c99a5e');
    boxy(ctx, x + 4, y + h * 0.22, w - 8, h * 0.3, 5, '#e8c894', '#d1a86a');
    boxy(ctx, x + 9, y, w - 18, h * 0.24, 4, '#d8b47c', '#bf9052');
    ctx.save(); ctx.globalAlpha = .5;
    line(ctx, x + w * 0.5, y + h * 0.52, x + w * 0.5, y + h - 4, '#a87c42', 3);
    line(ctx, x + 6, y + h * 0.74, x + w - 6, y + h * 0.74, '#e8dcc0', 4);
    ctx.restore();
  },
  signHang(ctx, x, y, w, h, t, pal, seed, o) {
    /* the ward sign hanging from the ceiling, arrows and all */
    hangTo(ctx, x, y, w, '#8b98a6', 4);
    fillRR(ctx, x, y, w, h * 0.62, 6, '#2f6b9c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 3; i++)
      fillRR(ctx, x + 12 + i * (w * 0.28), y + h * 0.2, w * 0.18, 6, 3, '#e8f2fa');
    /* an arrow pointing the way out */
    ctx.translate(x + w - 22, y + h * 0.31);
    poly(ctx, [[0, -9], [10, 0], [0, 9], [0, 3], [-12, 3], [-12, -3], [0, -3]], '#ffd870');
    ctx.restore();
    fillRR(ctx, x + w * 0.2, y + h * 0.62, w * 0.6, h * 0.16, 3, '#1f4a6c');
  },
  wardArch(ctx, x, y, w, h, t, pal, seed, o) {
    /* the swing doors between wards, propped open — she goes under the panel */
    hangTo(ctx, x, y, w, '#c4d0d8', 5);
    fillRR(ctx, x, y, w, h * 0.9, 4, '#dbe4ea');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    for (let px = x + 18; px < x + w - 14; px += 76) {
      fillRR(ctx, px, y + 8, 44, h * 0.5, 4, '#a8d0ea');
      ctx.save(); ctx.globalAlpha = .5;
      fillRR(ctx, px + 5, y + 12, 14, h * 0.4, 3, '#e8f6ff'); ctx.restore();
    }
    ctx.restore();
    fillRR(ctx, x, y + h * 0.72, w, h * 0.14, 3, '#8fb0c8');
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = x + 6; px < x + w; px += 26) hazardTape(ctx, px, y + h * 0.74, 16, 8);
    ctx.restore();
  },
  receptionDesk(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#c9a86a', 13, 8);
    fillRR(ctx, x, y, w, h * 0.3, 4, '#e8dcc0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x, y + h * 0.26, w, h * 0.28, 3, '#4fa8b0');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 30; px < x + w - 12; px += 60) {
      fillRR(ctx, px, y - 13, 26, 13, 3, '#ffffff');
      circle(ctx, px + 40, y - 7, 6, '#e2453c');
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + 4, y + 3, w - 8, 4, 2, '#fff8ec'); ctx.restore();
  },
  linoStripe(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .4;
    fillRR(ctx, x, y + h * 0.5, w, 5, 2, '#8fb0c8');
    fillRR(ctx, x, y + h * 0.7, w, 3, 2, '#c4d0d8');
    ctx.restore();
  },

  /* ==================== 3 · THE STREET ==================== */
  binCity(ctx, x, y, w, h) {
    boxy(ctx, x + 2, y + h * 0.16, w - 4, h * 0.84, 6, '#5f9a6a', '#3f7a4e');
    fillRR(ctx, x, y + h * 0.04, w, h * 0.2, 6, '#4a8a5a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + w * 0.32, y, w * 0.36, h * 0.08, 3, '#2f6b40');
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 1; i < 4; i++) line(ctx, x + 6, y + h * (0.32 + i * 0.16), x + w - 6, y + h * (0.32 + i * 0.16), '#2f6b40', 2.6);
    ctx.restore();
    [[0.22, 1], [0.78, 1]].forEach(p => circle(ctx, x + w * p[0], y + h - 3, 4.5, '#2b2634'));
  },
  coneCity(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * 0.82, w, h * 0.18, 4, '#e2582c');
    ctx.beginPath();
    ctx.moveTo(x + w * 0.42, y); ctx.lineTo(x + w * 0.58, y);
    ctx.lineTo(x + w * 0.86, y + h * 0.84); ctx.lineTo(x + w * 0.14, y + h * 0.84);
    ctx.closePath(); ctx.fillStyle = '#f2683a'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save(); ctx.globalAlpha = .95;
    fillRR(ctx, x + w * 0.2, y + h * 0.44, w * 0.6, h * 0.16, 3, '#f6f2ea'); ctx.restore();
  },
  benchCity(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h * 0.16, 5, '#a8763f');
    fillRR(ctx, x, y + h * 0.22, w, h * 0.14, 5, '#b9834a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x + w * 0.06, y + h * 0.36, w * 0.1, h * 0.64, 3, '#5f6c7a');
    fillRR(ctx, x + w * 0.84, y + h * 0.36, w * 0.1, h * 0.64, 3, '#5f6c7a');
    ctx.save(); ctx.globalAlpha = .4;
    fillRR(ctx, x + 6, y + 3, w - 12, 3, 2, '#e0b884'); ctx.restore();
  },
  postBoxCity(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.9, w * 0.3, '#e2453c');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.2, w * 0.4, Math.PI, 0);
    ctx.fillStyle = '#c9342c'; ctx.fill();
    fillRR(ctx, x + w * 0.22, y + h * 0.36, w * 0.56, h * 0.09, 3, '#2b2634');
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x + w * 0.2, y + h * 0.2, w * 0.14, h * 0.6, 5, '#ff9a90'); ctx.restore();
    fillRR(ctx, x + w * 0.28, y + h * 0.66, w * 0.44, h * 0.1, 3, '#f6f2ea');
  },
  scooter(ctx, x, y, w, h) {
    /* a kick scooter dropped on its side-stand */
    wheel(ctx, x + w * 0.16, y + h - 9, 9, '#2b2634', '#8b98a6');
    wheel(ctx, x + w * 0.86, y + h - 9, 9, '#2b2634', '#8b98a6');
    line(ctx, x + w * 0.16, y + h - 9, x + w * 0.86, y + h - 12, '#c4d0d8', 7);
    fillRR(ctx, x + w * 0.3, y + h * 0.62, w * 0.46, h * 0.12, 4, '#4fa8b0');
    line(ctx, x + w * 0.82, y + h - 12, x + w * 0.7, y + h * 0.1, '#c4d0d8', 6);
    line(ctx, x + w * 0.56, y + h * 0.12, x + w * 0.84, y + h * 0.08, '#2b2634', 6);
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + w * 0.34, y + h * 0.64, w * 0.16, 4, 2, '#8fe0e8'); ctx.restore();
  },
  marketStall(ctx, x, y, w, h) {
    /* a crate of fruit off a barrow */
    boxy(ctx, x, y + h * 0.32, w, h * 0.68, 5, '#d8b47c', '#b8905a');
    slats(ctx, x + 4, y + h * 0.36, w - 8, h * 0.6, 4, '#8f6a3a', true);
    const cols = ['#e2582c', '#f0c23a', '#8fd0a8', '#e2453c'];
    for (let i = 0; i < 5; i++) {
      const r = makeRng(i * 23 + 5);
      circle(ctx, x + w * (0.14 + i * 0.18), y + h * (0.24 + r() * 0.12), w * 0.11, cols[i % 4]);
    }
    ctx.save(); ctx.globalAlpha = .4;
    for (let i = 0; i < 3; i++) circle(ctx, x + w * (0.2 + i * 0.3), y + h * 0.2, 3, '#ffffff');
    ctx.restore();
  },
  plantTub(ctx, x, y, w, h) {
    leafy(ctx, x + w / 2, y + h * 0.28, w * 0.5, h * 0.28, '#4caf6d', '#75d493', 11);
    fillRR(ctx, x + w * 0.12, y + h * 0.5, w * 0.76, h * 0.5, 6, '#9a7a5a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + w * 0.06, y + h * 0.46, w * 0.88, h * 0.12, 4, '#b08f6a');
    ctx.save(); ctx.globalAlpha = .35;
    for (let px = x + w * 0.2; px < x + w * 0.85; px += 14) line(ctx, px, y + h * 0.58, px, y + h * 0.96, '#7a5f42', 3);
    ctx.restore();
  },
  crateMarket(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 5, '#e0c090', '#c09a5e');
    slats(ctx, x + 4, y + 4, w - 8, h - 8, 3, '#8f6a3a');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + w * 0.2, y + h * 0.3, w * 0.6, 8, 3, '#f2e4c0'); ctx.restore();
  },
  awningShop(ctx, x, y, w, h, t, pal, seed, o) {
    /* a shop awning, striped, hung low enough that she has to duck */
    hangTo(ctx, x, y, w, '#8b98a6', 4);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h * 0.55);
    for (let px = x + w; px >= x; px -= w / 6)
      ctx.quadraticCurveTo(px - w / 12, y + h * 0.82, px - w / 6, y + h * 0.55);
    ctx.closePath();
    ctx.fillStyle = '#e8534c'; ctx.fill(); outline(ctx, INK, 2.4);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h * 0.55); ctx.clip();
    ctx.globalAlpha = .95;
    for (let px = x; px < x + w; px += w / 6)
      ctx.fillStyle = '#f6f2ea', ctx.fillRect(px, y, w / 12, h);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x, y, w, 5, 2, '#8f2f2c'); ctx.restore();
  },
  scaffoldTunnel(ctx, x, y, w, h, t, pal, seed, o) {
    /* the boarded walkway under some scaffolding — a long low run */
    hangTo(ctx, x, y, w, '#8b98a6', 6);
    fillRR(ctx, x, y, w, h * 0.34, 3, '#c9a86a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 20; px < x + w - 10; px += 44) line(ctx, px, y + 2, px, y + h * 0.32, '#8f6a3a', 3);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .8;
    for (let px = x + 30; px < x + w - 20; px += 128) {
      line(ctx, px, y + h * 0.3, px, y + h, '#8b98a6', 7);
      line(ctx, px - 26, y + h * 0.56, px + 26, y + h * 0.46, '#8b98a6', 5);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .7;
    for (let px = x + 8; px < x + w; px += 40) hazardTape(ctx, px, y + h * 0.34, 24, 8);
    ctx.restore();
  },
  stallLedge(ctx, x, y, w, h, t, pal, seed, o) {
    /* a market trestle she can get up onto and run along */
    legsTo(ctx, x, y, w, o, '#8f6a3a', 11, 12);
    fillRR(ctx, x, y, w, h * 0.36, 4, '#e0c090');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x, y + h * 0.3, w, h * 0.24, 3, '#4f8ce2');
    ctx.save(); ctx.globalAlpha = .8;
    for (let px = x + 10; px < x + w; px += 26)
      poly(ctx, [[px, y + h * 0.54], [px + 13, y + h * 0.54], [px + 6.5, y + h * 0.78]], '#3f6fc0');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + 4, y + 3, w - 8, 4, 2, '#f6ecd8'); ctx.restore();
  },
  manhole(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .45;
    fillEll(ctx, x + w * 0.5, y + h * 0.6, w * 0.26, h * 0.3, '#4a4652');
    ctx.globalAlpha = .3;
    for (let i = 0; i < 4; i++)
      fillEll(ctx, x + w * 0.5, y + h * 0.6, w * (0.2 - i * 0.04), h * (0.24 - i * 0.05), '#6a6472');
    ctx.restore();
  },

  /* ==================== 4 · THE GROOMING SALON ==================== */
  groomTable(ctx, x, y, w, h) {
    /* a grooming table, its arm and noose swinging, on a hydraulic post */
    chrome(ctx, x + w * 0.4, y + h * 0.4, w * 0.18, h * 0.6, 5);
    fillEll(ctx, x + w * 0.5, y + h - 5, w * 0.42, h * 0.09, '#8b98a6');
    fillRR(ctx, x, y + h * 0.28, w, h * 0.16, 5, '#3f4a58');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .35;
    for (let px = x + 8; px < x + w - 6; px += 12) line(ctx, px, y + h * 0.3, px, y + h * 0.42, '#7a8494', 2);
    ctx.restore();
    line(ctx, x + w * 0.86, y + h * 0.3, x + w * 0.86, y, '#c4d0d8', 5);
    line(ctx, x + w * 0.86, y + 3, x + w * 0.5, y + 3, '#c4d0d8', 4);
    ctx.save(); ctx.globalAlpha = .85;
    ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.14, h * 0.11, 0, TAU);
    ctx.strokeStyle = '#e8834c'; ctx.lineWidth = 3.4; ctx.stroke(); ctx.restore();
  },
  dryerUnit(ctx, x, y, w, h, t) {
    /* a stand dryer, its drum blowing */
    chrome(ctx, x + w * 0.42, y + h * 0.42, w * 0.16, h * 0.58, 4);
    fillEll(ctx, x + w * 0.5, y + h - 4, w * 0.38, h * 0.08, '#8b98a6');
    fillRR(ctx, x + w * 0.08, y + h * 0.06, w * 0.84, h * 0.42, 12, '#e0546a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    circle(ctx, x + w * 0.5, y + h * 0.27, w * 0.24, '#2b2634');
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 3; i++) {
      const a = t * 9 + i * (TAU / 3);
      line(ctx, x + w * 0.5, y + h * 0.27,
        x + w * 0.5 + Math.cos(a) * w * 0.2, y + h * 0.27 + Math.sin(a) * w * 0.2, '#8b98a6', 4);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x + w * 0.16, y + h * 0.1, w * 0.16, h * 0.2, 6, '#ff9aa8'); ctx.restore();
  },
  shampooTub(ctx, x, y, w, h, t) {
    /* a bathing tub full of foam */
    fillRR(ctx, x, y + h * 0.24, w, h * 0.76, 10, '#8fd0e8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    fillRR(ctx, x + 4, y + h * 0.2, w - 8, h * 0.14, 7, '#c8ecf8');
    ctx.save(); ctx.globalAlpha = .95;
    for (let i = 0; i < 7; i++) {
      const r = makeRng(i * 31 + 9);
      circle(ctx, x + w * (0.1 + i * 0.13), y + h * (0.14 + r() * 0.1) + Math.sin(t * 2 + i) * 2,
        w * (0.08 + r() * 0.05), '#ffffff');
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x + 8, y + h * 0.42, w * 0.18, h * 0.34, 5, '#e0f4fc'); ctx.restore();
  },
  towelPile(ctx, x, y, w, h) {
    const cols = ['#ff9ab0', '#8fd0e8', '#ffe08a', '#c0a8e8'];
    let yy = y + h, i = 0;
    while (yy > y + 2) {
      const bh = Math.min(h * 0.24, yy - y), ins = (i % 2) * 5;
      fillRR(ctx, x + ins, yy - bh + 2, w - ins * 2, bh - 3, 6, cols[i % 4]);
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.globalAlpha = .4;
      line(ctx, x + ins + 5, yy - bh / 2, x + w - ins - 5, yy - bh / 2, '#ffffff', 2.4);
      ctx.restore();
      yy -= bh; i++;
    }
  },
  bottleShelfLow(ctx, x, y, w, h) {
    fillRR(ctx, x, y + h * 0.62, w, h * 0.38, 4, '#c9a86a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    const cols = ['#8fd0a8', '#ff9ab0', '#8fd0e8', '#ffe08a', '#c0a8e8'];
    for (let i = 0; i < 5; i++) {
      const bx = x + w * (0.08 + i * 0.19);
      fillRR(ctx, bx, y + h * (0.18 + (i % 2) * 0.1), w * 0.13, h * (0.46 - (i % 2) * 0.1), 4, cols[i]);
      fillRR(ctx, bx + w * 0.04, y + h * (0.1 + (i % 2) * 0.1), w * 0.05, h * 0.1, 2, '#e8eef2');
    }
  },
  stepStool(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h * 0.22, 4, '#f0c23a');
    fillRR(ctx, x + w * 0.12, y + h * 0.4, w * 0.76, h * 0.18, 4, '#e8a93a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    line(ctx, x + w * 0.14, y + h * 0.2, x + w * 0.08, y + h, '#c9962c', 6);
    line(ctx, x + w * 0.86, y + h * 0.2, x + w * 0.92, y + h, '#c9962c', 6);
    ctx.save(); ctx.globalAlpha = .4;
    fillRR(ctx, x + 5, y + 3, w - 10, 4, 2, '#fff0c8'); ctx.restore();
  },
  dryerHose(ctx, x, y, w, h, t, pal, seed, o) {
    /* the ribbed hoses looping down from the ceiling rail */
    hangTo(ctx, x, y, w, '#8b98a6', 5);
    fillRR(ctx, x, y, w, h * 0.2, 4, '#5f6c7a');
    for (let i = 0; i < 3; i++) {
      const hx = x + w * (0.18 + i * 0.3);
      ctx.beginPath();
      ctx.moveTo(hx, y + h * 0.16);
      ctx.quadraticCurveTo(hx + 22, y + h * (0.9 + Math.sin(t * 1.6 + i) * 0.08), hx + 48, y + h * 0.3);
      ctx.strokeStyle = '#8fa0b0'; ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.stroke();
      ctx.strokeStyle = '#c4d0d8'; ctx.lineWidth = 10; ctx.stroke();
    }
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 8; px < x + w; px += 13) line(ctx, px, y + h * 0.3, px, y + h * 0.66, '#6f7c8a', 2);
    ctx.restore();
  },
  mirrorArch(ctx, x, y, w, h, t, pal, seed, o) {
    /* a wall of mirrors and lights she runs the length of, ducked */
    hangTo(ctx, x, y, w, '#c9a86a', 5);
    fillRR(ctx, x, y, w, h * 0.88, 6, '#f2dce4');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save();
    rr(ctx, x + 8, y + 10, w - 16, h * 0.52, 5); ctx.clip();
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#dfeaf2'); g.addColorStop(1, '#b8c8d4');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = .5;
    for (let px = x - 40; px < x + w; px += 60)
      line(ctx, px, y + h * 0.6, px + 40, y + 6, '#ffffff', 8);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .9;
    for (let px = x + 20; px < x + w - 10; px += 40)
      circle(ctx, px, y + h * 0.76, 6, (Math.sin(t * 3 + px) > -0.6) ? '#fff3c4' : '#c9b898');
    ctx.restore();
  },
  groomBench(ctx, x, y, w, h, t, pal, seed, o) {
    legsTo(ctx, x, y, w, o, '#c4d0d8', 12, 10);
    fillRR(ctx, x, y, w, h * 0.34, 4, '#ff9ab0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, x, y + h * 0.3, w, h * 0.2, 3, '#e0748c');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = x + 24; px < x + w - 10; px += 48) circle(ctx, px, y + h * 0.4, 4, '#fff0f4');
    fillRR(ctx, x + 4, y + 3, w - 8, 4, 2, '#ffd8e2'); ctx.restore();
  },
  furDrift(ctx, x, y, w, h) {
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 7; i++) {
      const r = makeRng(i * 29 + 11);
      fillEll(ctx, x + r() * w, y + h * (0.3 + r() * 0.6), 10 + r() * 9, 4 + r() * 3,
        i % 2 ? '#3a3440' : '#c8bcc8', r() * 2);
    }
    ctx.restore();
  },
  bubbleDeco(ctx, x, y, w, h, t) {
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const r = makeRng(i * 37 + 5);
      ctx.globalAlpha = .3 + Math.sin(t * 2 + i) * .15;
      circle(ctx, x + r() * w, y + h * (0.2 + r() * 0.7), 4 + r() * 7, '#e8f6ff');
    }
    ctx.restore();
  },

  /* ==================== 5 · THE ALLEYS HOME ==================== */
  dustBinAlley(ctx, x, y, w, h) {
    fillRR(ctx, x + 2, y + h * 0.18, w - 4, h * 0.82, 5, '#5f6c7a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = x + 8; px < x + w - 6; px += 11) line(ctx, px, y + h * 0.24, px, y + h - 6, '#48525f', 3);
    ctx.restore();
    fillRR(ctx, x - 2, y + h * 0.06, w + 4, h * 0.16, 5, '#7a8694');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    circle(ctx, x + w * 0.5, y + h * 0.06, w * 0.11, '#48525f');
  },
  palletStack(ctx, x, y, w, h) {
    for (let k = 0; k < 3; k++) {
      const yy = y + h * (0.06 + k * 0.32);
      fillRR(ctx, x, yy, w, h * 0.1, 2, '#c9a86a');
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.globalAlpha = .55;
      for (let px = x + 6; px < x + w - 4; px += 16)
        fillRR(ctx, px, yy + h * 0.1, 9, h * 0.18, 2, '#a8845a');
      ctx.restore();
    }
  },
  tyreStack(ctx, x, y, w, h) {
    for (let k = 0; k < 3; k++) {
      const yy = y + h * (0.16 + k * 0.3);
      fillEll(ctx, x + w * 0.5, yy, w * 0.46, h * 0.15, '#2f3038');
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; ctx.stroke();
      fillEll(ctx, x + w * 0.5, yy, w * 0.24, h * 0.08, '#4a4c56');
      ctx.save(); ctx.globalAlpha = .35;
      for (let i = 0; i < 6; i++) {
        const a = i * (TAU / 6);
        line(ctx, x + w * 0.5 + Math.cos(a) * w * 0.3, yy + Math.sin(a) * h * 0.1,
          x + w * 0.5 + Math.cos(a) * w * 0.44, yy + Math.sin(a) * h * 0.14, '#63656f', 2.4);
      }
      ctx.restore();
    }
  },
  fenceGap(ctx, x, y, w, h) {
    /* a bit of site hoarding leaning across the alley */
    fillRR(ctx, x, y + h * 0.1, w, h * 0.8, 3, '#4f8ce2');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = x + 8; px < x + w - 4; px += 15) line(ctx, px, y + h * 0.14, px, y + h * 0.86, '#3f6fc0', 3);
    ctx.restore();
    fillRR(ctx, x - 3, y + h * 0.34, w + 6, h * 0.12, 3, '#f0c23a');
    ctx.save(); ctx.globalAlpha = .8;
    hazardTape(ctx, x + w * 0.14, y + h * 0.36, w * 0.7, h * 0.08); ctx.restore();
  },
  crateAlley(ctx, x, y, w, h) {
    boxy(ctx, x, y, w, h, 5, '#8f7a5f', '#6f5c46');
    slats(ctx, x + 4, y + 4, w - 8, h - 8, 3, '#4f4234');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + w * 0.18, y + h * 0.34, w * 0.64, 9, 3, '#c9b898'); ctx.restore();
  },
  fireEscape(ctx, x, y, w, h, t, pal, seed, o) {
    /* the underside of a fire escape landing, right over her head */
    hangTo(ctx, x, y, w, '#5f6c7a', 5);
    fillRR(ctx, x, y, w, h * 0.28, 3, '#4e5866');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .7;
    for (let px = x + 6; px < x + w - 4; px += 13)
      fillRR(ctx, px, y + h * 0.06, 7, h * 0.18, 1.5, '#7a8694');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = x + 24; px < x + w - 12; px += 96) {
      line(ctx, px, y + h * 0.26, px, y + h * 0.92, '#5f6c7a', 5);
      for (let k = 0; k < 3; k++) line(ctx, px - 12, y + h * (0.4 + k * 0.16), px + 12, y + h * (0.4 + k * 0.16), '#7a8694', 3);
    }
    ctx.restore();
  },
  alleyArch(ctx, x, y, w, h, t, pal, seed, o) {
    /* a covered service passage: a low brick vault with lamps in it */
    hangTo(ctx, x, y, w, '#6a5348', 6);
    fillRR(ctx, x, y, w, h * 0.9, 5, '#6a5348');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4;
    for (let row = 0; row < 3; row++)
      for (let px = x + (row % 2) * 17; px < x + w; px += 34)
        fillRR(ctx, px + 2, y + 6 + row * 17, 30, 13, 2, '#7f6355');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .85;
    for (let px = x + 40; px < x + w - 20; px += 150) {
      fillRR(ctx, px, y + h * 0.62, 22, 12, 4, '#3a3038');
      circle(ctx, px + 11, y + h * 0.72, 7, Math.sin(t * 2 + px) > -0.7 ? '#ffd870' : '#8a7a52');
    }
    ctx.restore();
  },
  loadingLedge(ctx, x, y, w, h, t, pal, seed, o) {
    /* a loading bay lip she can run along above the alley floor */
    legsTo(ctx, x, y, w, o, '#5f6c7a', 13, 14);
    fillRR(ctx, x, y, w, h * 0.4, 3, '#8a7f74');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .7;
    for (let px = x + 10; px < x + w - 8; px += 46) hazardTape(ctx, px, y + h * 0.36, 30, 8);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .45;
    fillRR(ctx, x + 4, y + 3, w - 8, 4, 2, '#c8c0b4'); ctx.restore();
  },
  puddleDeco(ctx, x, y, w, h, t) {
    ctx.save(); ctx.globalAlpha = .4;
    fillEll(ctx, x + w * 0.5, y + h * 0.66, w * 0.34, h * 0.2, '#4f6a80');
    ctx.globalAlpha = .28;
    fillEll(ctx, x + w * 0.42, y + h * 0.62, w * 0.16, h * 0.08, '#c8e2f6');
    ctx.restore();
  },

  /* ==================== THE THINGS THAT COME FLYING ====================
     Everything the vet and the groomer throw. They are drawn lying where
     they landed, or spinning in on their way — boss.js does the spinning,
     these only have to read at a glance. */
  needleTool(ctx, x, y, w, h) {
    /* a big cartoon syringe, plunger and all — blunt, and nothing in it */
    fillRR(ctx, x + w * 0.14, y + h * 0.36, w * 0.6, h * 0.32, 6, '#e8f2fa');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * 0.18, y + h * 0.4, w * 0.3, h * 0.24, 4, '#8fd0e8'); ctx.restore();
    fillRR(ctx, x + w * 0.02, y + h * 0.3, w * 0.1, h * 0.44, 3, '#c4d0d8');
    fillRR(ctx, x + w * 0.72, y + h * 0.46, w * 0.14, h * 0.12, 3, '#8b98a6');
    line(ctx, x + w * 0.86, y + h * 0.52, x + w, y + h * 0.52, '#c4d0d8', 4);
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i < 4; i++) line(ctx, x + w * (0.2 + i * 0.13), y + h * 0.38, x + w * (0.2 + i * 0.13), y + h * 0.5, '#8b98a6', 2);
    ctx.restore();
  },
  nailClipper(ctx, x, y, w, h) {
    /* the nail clippers this whole level is her fault for */
    ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.5); ctx.rotate(-0.2);
    chrome(ctx, -w * 0.44, -h * 0.1, w * 0.6, h * 0.2, 7);
    chrome(ctx, -w * 0.44, -h * 0.34, w * 0.5, h * 0.16, 7);
    ctx.beginPath();
    ctx.arc(w * 0.2, h * 0.02, h * 0.22, -0.6, 2.4);
    ctx.strokeStyle = '#c4d0d8'; ctx.lineWidth = 6; ctx.stroke();
    fillRR(ctx, -w * 0.48, -h * 0.36, w * 0.14, h * 0.6, 5, '#e2453c');
    ctx.restore();
  },
  vetScissors(ctx, x, y, w, h) {
    ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.5); ctx.rotate(0.28);
    [-1, 1].forEach(d => {
      ctx.beginPath();
      ctx.moveTo(-w * 0.42, d * h * 0.06);
      ctx.lineTo(w * 0.34, d * h * 0.26);
      ctx.lineTo(w * 0.42, d * h * 0.16);
      ctx.closePath();
      ctx.fillStyle = '#dfe8f0'; ctx.fill(); outline(ctx, INK, 2.2);
      ctx.beginPath(); ctx.ellipse(-w * 0.36, -d * h * 0.2, w * 0.12, h * 0.17, 0, 0, TAU);
      ctx.strokeStyle = '#f0683a'; ctx.lineWidth = 5; ctx.stroke();
    });
    circle(ctx, 0, 0, 4, '#8b98a6');
    ctx.restore();
  },
  thermoTool(ctx, x, y, w, h) {
    ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.5); ctx.rotate(0.5);
    fillRR(ctx, -w * 0.36, -h * 0.09, w * 0.72, h * 0.18, h * 0.09, '#f6f2ea');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    circle(ctx, -w * 0.36, 0, h * 0.15, '#e2453c');
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, -w * 0.3, -h * 0.04, w * 0.32, h * 0.07, 3, '#e2453c'); ctx.restore();
    ctx.restore();
  },
  pillJar(ctx, x, y, w, h) {
    fillRR(ctx, x + w * 0.14, y + h * 0.22, w * 0.72, h * 0.72, 7, '#f2ece0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    fillRR(ctx, x + w * 0.2, y + h * 0.06, w * 0.6, h * 0.2, 5, '#e8834c');
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 5; i++) {
      const r = makeRng(i * 19 + 7);
      fillEll(ctx, x + w * (0.26 + r() * 0.5), y + h * (0.44 + r() * 0.38), w * 0.1, h * 0.07,
        i % 2 ? '#ff9ab0' : '#8fd0e8', r() * 2);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + w * 0.2, y + h * 0.3, w * 0.12, h * 0.5, 4, '#ffffff'); ctx.restore();
  },
  combTool(ctx, x, y, w, h) {
    ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.5); ctx.rotate(-0.35);
    fillRR(ctx, -w * 0.4, -h * 0.26, w * 0.8, h * 0.2, 4, '#4f8ce2');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 9; i++)
      fillRR(ctx, -w * 0.38 + i * (w * 0.085), -h * 0.07, w * 0.04, h * 0.32, 2, '#c4d0d8');
    ctx.restore();
    ctx.restore();
  },
  clipperTool(ctx, x, y, w, h) {
    /* the groomer's clippers, blades first */
    ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.5); ctx.rotate(0.18);
    fillRR(ctx, -w * 0.4, -h * 0.22, w * 0.66, h * 0.44, 8, '#3f4a58');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, -w * 0.34, -h * 0.16, w * 0.18, h * 0.3, 5, '#7a8694'); ctx.restore();
    fillRR(ctx, w * 0.24, -h * 0.16, w * 0.2, h * 0.32, 3, '#dfe8f0');
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 5; i++)
      fillRR(ctx, w * 0.26 + i * (w * 0.038), -h * 0.14, w * 0.02, h * 0.28, 1, '#8b98a6');
    ctx.restore();
    line(ctx, -w * 0.4, h * 0.04, -w * 0.52, h * 0.24, '#2b2634', 4);
    ctx.restore();
  },
  brushTool(ctx, x, y, w, h) {
    ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.5); ctx.rotate(0.42);
    fillRR(ctx, -w * 0.36, -h * 0.2, w * 0.56, h * 0.26, 7, '#c98f5a');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .85;
    for (let i = 0; i < 8; i++)
      line(ctx, -w * 0.32 + i * (w * 0.07), h * 0.05, -w * 0.32 + i * (w * 0.07), h * 0.26, '#e8dcc0', 3);
    ctx.restore();
    fillRR(ctx, w * 0.18, -h * 0.09, w * 0.24, h * 0.12, 5, '#a8763f');
    ctx.restore();
  },
  bowTool(ctx, x, y, w, h) {
    /* a salon bow, and a hair grip through it */
    ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.5);
    poly(ctx, [[-2, 0], [-w * 0.42, -h * 0.28], [-w * 0.42, h * 0.28]], '#ff6b9a');
    poly(ctx, [[2, 0], [w * 0.42, -h * 0.28], [w * 0.42, h * 0.28]], '#ff6b9a');
    ctx.save(); ctx.globalAlpha = .5;
    poly(ctx, [[-4, 0], [-w * 0.34, -h * 0.18], [-w * 0.3, h * 0.02]], '#ff9ac0');
    poly(ctx, [[4, 0], [w * 0.34, -h * 0.18], [w * 0.3, h * 0.02]], '#ff9ac0');
    ctx.restore();
    circle(ctx, 0, 0, h * 0.14, '#ff8fb0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  },
  sprayTool(ctx, x, y, w, h) {
    ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.5); ctx.rotate(-0.25);
    fillRR(ctx, -w * 0.2, -h * 0.16, w * 0.4, h * 0.56, 6, '#8fd0a8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
    fillRR(ctx, -w * 0.1, -h * 0.36, w * 0.2, h * 0.22, 3, '#c4d0d8');
    poly(ctx, [[-w * 0.1, -h * 0.34], [-w * 0.42, -h * 0.28], [-w * 0.42, -h * 0.14], [-w * 0.1, -h * 0.2]], '#dfe8f0');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, -w * 0.14, -h * 0.1, w * 0.1, h * 0.4, 4, '#d8f4e4'); ctx.restore();
    ctx.restore();
  },

  /* ==================== THE DOORWAYS ==================== */
  clinicDoor(ctx, x, y, w, h, t) {
    doorway(ctx, x, y, w, h, '#c4d0d8', '#8fb8d8', '#e8f6ff', 'KORIDORIUS', '#2f4a60');
    ctx.save(); ctx.globalAlpha = .9;
    vetCross(ctx, x + w * 0.5, y + h * 0.2, w * 0.11); ctx.restore();
  },
  clinicExit(ctx, x, y, w, h, t) {
    doorway(ctx, x, y, w, h, '#8b98a6', '#f2c98a', '#fff0c8', 'IŠĖJIMAS', '#3a2508');
    ctx.save(); ctx.globalAlpha = .85;
    fillRR(ctx, x + w * 0.22, y + h * 0.12, w * 0.56, h * 0.1, 4, '#3f9c6a');
    ctx.restore();
  },
  salonDoor(ctx, x, y, w, h, t) {
    doorway(ctx, x, y, w, h, '#e0748c', '#ffd8e2', '#fff0f4', 'KIRPYKLA', '#7a2b40');
    ctx.save(); ctx.globalAlpha = .9;
    ctx.translate(x + w * 0.5, y + h * 0.2);
    PROPS.bowTool(ctx, -16, -12, 32, 24);
    ctx.restore();
  },
  backDoor(ctx, x, y, w, h, t) {
    doorway(ctx, x, y, w, h, '#5f6c7a', '#2f3a48', '#8fd6ff', 'Į KIEMĄ', '#dfe8f0');
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, x + w * 0.62, y + h * 0.52, w * 0.1, h * 0.06, 3, '#c4d0d8');
    ctx.restore();
  }
});

/* ---- how wide each of these naturally is, for wide platforms ---- */
Object.assign(PROP_NATURAL, {
  examLamp: 175, xrayArch: 190, vetCounter: 180, pawTile: 200, furTuft: 190,
  signHang: 180, wardArch: 190, receptionDesk: 185, linoStripe: 200,
  awningShop: 185, scaffoldTunnel: 195, stallLedge: 180, manhole: 190,
  dryerHose: 185, mirrorArch: 195, groomBench: 180, furDrift: 190, bubbleDeco: 200,
  fireEscape: 185, alleyArch: 195, loadingLedge: 180, puddleDeco: 190,
  bottleShelfLow: 175, treadClinic: 400, treadStreet: 400
});

const PROP_SIZE4 = {
  vetStool: [58, 76], vetBin: [56, 76], petScale: [96, 58], carrierBox: [86, 72],
  pillTower: [54, 78], examLamp: [130, 46], xrayArch: [150, 44], vetCounter: [150, 42],
  vetCrate: [72, 62],
  mopBucket: [62, 74], waitChair: [78, 76], oxygenTank: [52, 84], boxStack: [76, 80],
  signHang: [140, 40], wardArch: [150, 44], receptionDesk: [150, 42],
  binCity: [62, 82], coneCity: [50, 64], benchCity: [124, 58], postBoxCity: [52, 88],
  scooter: [96, 62], marketStall: [88, 66], plantTub: [64, 78], crateMarket: [70, 60],
  awningShop: [150, 44], scaffoldTunnel: [150, 44], stallLedge: [150, 42],
  groomTable: [104, 78], dryerUnit: [70, 88], shampooTub: [98, 66], towelPile: [66, 72],
  bottleShelfLow: [92, 56], stepStool: [66, 58], dryerHose: [150, 44],
  mirrorArch: [150, 44], groomBench: [150, 42],
  dustBinAlley: [60, 82], palletStack: [92, 62], tyreStack: [78, 66], fenceGap: [104, 70],
  crateAlley: [74, 64], fireEscape: [150, 42], alleyArch: [150, 44], loadingLedge: [150, 42],
  needleTool: [82, 44], nailClipper: [66, 52], vetScissors: [70, 56], thermoTool: [64, 40],
  pillJar: [52, 62], combTool: [72, 46],
  clipperTool: [78, 50], brushTool: [72, 48], bowTool: [58, 42], sprayTool: [56, 62]
};
Object.assign(PROP_SIZE, PROP_SIZE4);
Object.keys(PROP_SIZE4).forEach(k => {
  if (!PROP_NATURAL[k]) PROP_NATURAL[k] = PROP_SIZE4[k][0] + 16;
});

/* =================================================================
   THE TWO PEOPLE CHASING HER

   Neither of them is ever an obstacle: they are drawn straight onto
   the screen behind Lota by boss.js and the only thing they can do
   is catch up. `run` is a phase, `lunge` how far forward she is
   throwing herself, `s` a plain scale.
================================================================= */
/* A pair of legs planted on the ground. They are straight, so they reach
   further than the swinging pair do — STAND_LIFT is exactly that difference,
   and standing figures are drawn that much higher up so their shoes land on
   the floor instead of through it. */
const STAND_LIFT = 21;
function standLegs(ctx, t, col, shoe, wide) {
  const b = Math.sin(t * 1.7) * 1.1;
  [-1, 1].forEach(sgn => {
    ctx.save(); ctx.translate(sgn * (wide == null ? 8 : wide), 0);
    fillRR(ctx, -6, 0, 12, 32 + b, 6, col);
    fillRR(ctx, -6, 30, 12, 26, 6, col);
    fillRR(ctx, -10, 50, 21, 9, 5, shoe);
    ctx.restore();
  });
}
/** a pair of legs mid-stride, shared by both of them */
function chaseLegs(ctx, run, col, shoe) {
  const a = Math.sin(run), b = Math.sin(run + Math.PI);
  [[a, 1], [b, -1]].forEach(p => {
    ctx.save(); ctx.rotate(p[0] * 0.55);
    fillRR(ctx, -6, 0, 12, 34, 6, col);
    ctx.translate(0, 32); ctx.rotate(-Math.abs(p[0]) * 0.5);
    fillRR(ctx, -6, 0, 12, 30, 6, col);
    fillRR(ctx, -9, 26, 20, 10, 5, shoe);
    ctx.restore();
  });
}
/** The vet: scrubs, a clipboard she has given up on, and the clippers
    still in her other hand. Comic, never frightening. */
function drawVet(ctx, x, y, s, t, run, lunge, o) {
  s = s || 1; o = o || {};
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.globalAlpha = .25;
  fillEll(ctx, 0, 2, 34, 8, '#000'); ctx.restore();
  ctx.translate(0, -64 - (o.still ? STAND_LIFT : 0));
  ctx.rotate((o.lean || 0) - 0.06 - lunge * 0.12);
  /* legs — running unless she has stopped and planted herself */
  ctx.save(); ctx.translate(0, 26);
  if (o.still) standLegs(ctx, t, '#4f8ca8', '#e8eef2');
  else chaseLegs(ctx, run, '#4f8ca8', '#e8eef2');
  ctx.restore();
  /* the scrubs */
  fillRR(ctx, -19, -18, 38, 48, 13, '#5fa8c4');
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.save(); ctx.globalAlpha = .5;
  fillRR(ctx, -14, -13, 12, 22, 5, '#8fd0e0'); ctx.restore();
  vetCross(ctx, 8, -6, 6, '#ffffff');
  /* The arm out in front, clippers first. `arm` aims it somewhere on purpose
     — down at a paw on the table, or straight up over her head to throw. */
  ctx.save();
  const armA = o.arm != null ? o.arm
             : -0.5 + Math.sin(run * 1.02) * 0.28 - lunge * 0.5 - (o.throw || 0) * 2.1;
  ctx.translate(15, -10); ctx.rotate(armA);
  const reach = o.reach || 0;
  fillRR(ctx, 0, -6, 30 + reach, 12, 6, '#5fa8c4');
  ctx.translate(30 + reach, 0);
  circle(ctx, 0, 0, 6.5, '#f2cfa8');
  ctx.rotate(0.2);
  /* the clippers themselves. Snipping opens and shuts the jaws, which is the
     whole reason anyone can tell what she is doing to that paw. */
  const gap = o.snip ? Math.abs(Math.sin(t * 13)) * 8 : 0;
  fillRR(ctx, 1, -7, 17, 14, 6, '#3f4a58');
  fillRR(ctx, 16, -5 - gap * 0.6, 17, 6, 2, '#eef4f8');
  fillRR(ctx, 16, -1 + gap * 0.6, 17, 6, 2, '#b8c4d0');
  if (o.snip) {
    /* a spark off the blades, so it is unmistakably a pair of clippers doing
       something to something */
    ctx.save(); ctx.globalAlpha = 0.3 + Math.abs(Math.sin(t * 13)) * 0.6;
    circle(ctx, 34, -1, 4, '#ffffff'); ctx.restore();
  }
  ctx.restore();
  /* the other arm, trailing, still holding the clipboard */
  ctx.save();
  ctx.translate(-15, -8); ctx.rotate(2.5 + Math.sin(run * 1.02 + Math.PI) * 0.3);
  fillRR(ctx, 0, -5, 26, 11, 5, '#5fa8c4');
  ctx.translate(26, 0); circle(ctx, 0, 0, 6, '#f2cfa8');
  fillRR(ctx, -4, -12, 16, 20, 3, '#e8dcc0');
  ctx.restore();
  /* head: a bun, round glasses, a mouth wide open */
  circle(ctx, 3, -34, 15, '#f2cfa8');
  ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-11, -40); ctx.quadraticCurveTo(2, -54, 16, -42);
  ctx.quadraticCurveTo(4, -46, -11, -40); ctx.closePath();
  ctx.fillStyle = '#8a5a3a'; ctx.fill();
  circle(ctx, -12, -44, 8, '#8a5a3a');
  circle(ctx, 8, -35, 4.6, '#ffffff');
  circle(ctx, 8, -35, 2.4, '#2b2634');
  circle(ctx, -1, -35, 4.2, '#ffffff');
  circle(ctx, -1, -35, 2.2, '#2b2634');
  ctx.save(); ctx.globalAlpha = .55;
  ctx.beginPath(); ctx.arc(8, -35, 6.4, 0, TAU); ctx.strokeStyle = '#8b98a6'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(-1, -35, 6, 0, TAU); ctx.stroke();
  line(ctx, 4, -36, 5, -36, '#8b98a6', 2);
  ctx.restore();
  line(ctx, -4, -44, 3, -46, '#6a452c', 2.4);
  /* the mouth: normally a little O of effort, wide open when she is shouting */
  const mo = o.mouth || 0;
  fillEll(ctx, 4, -26 + mo * 2, 5 + mo * 4, 4 + mo * 6 + Math.abs(Math.sin(t * 7)) * 2.5, '#7a2b34');
  if (mo > 0.4) fillEll(ctx, 4, -22 + mo * 4, 3 + mo * 2, 2 + mo * 2, '#ff9ab0');
  if (o.cross) {
    /* two cross brows: she has stopped being puzzled and started being furious */
    line(ctx, -6, -42, 1, -39, '#6a452c', 2.6);
    line(ctx, 13, -42, 6, -39, '#6a452c', 2.6);
  }
  ctx.restore();
}
/** The groomer: an apron, a dryer in one hand, bows in her pocket,
    and absolutely no idea where the dog went. */
function drawGroomer(ctx, x, y, s, t, run, lunge, o) {
  s = s || 1; o = o || {};
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.globalAlpha = .25;
  fillEll(ctx, 0, 2, 32, 8, '#000'); ctx.restore();
  ctx.translate(0, -62 - (o.still ? STAND_LIFT : 0) + (o.crouch || 0) * 20);
  ctx.rotate((o.lean || 0) - 0.08 - lunge * 0.1);
  ctx.save(); ctx.translate(0, 24 - (o.crouch || 0) * 20);
  if (o.still) standLegs(ctx, t, '#4a4652', '#ff9ab0');
  else chaseLegs(ctx, run + 1.1, '#4a4652', '#ff9ab0');
  ctx.restore();
  /* the apron over a striped top */
  fillRR(ctx, -18, -18, 36, 46, 12, '#f2ece0');
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.save(); ctx.globalAlpha = .8;
  for (let i = -2; i <= 2; i++) line(ctx, -14, i * 8, 14, i * 8 - 2, '#ff9ab0', 2.6);
  ctx.restore();
  fillRR(ctx, -13, 2, 26, 22, 5, '#e0748c');
  ctx.save(); ctx.globalAlpha = .9;
  PROPS.bowTool(ctx, -6, 8, 14, 10); ctx.restore();
  /* the clippers, held high and buzzing */
  ctx.save();
  ctx.translate(14, -14);
  ctx.rotate(o.arm != null ? o.arm
             : -1.0 + Math.sin(run * 1.02) * 0.3 - lunge * 0.4 - (o.scared || 0) * 1.4);
  fillRR(ctx, 0, -5, 28, 11, 5, '#f2cfa8');
  ctx.translate(28, 0);
  ctx.rotate(0.5 + Math.sin(t * 26) * 0.06);
  fillRR(ctx, -3, -8, 20, 16, 6, '#3f4a58');
  fillRR(ctx, 15, -5, 10, 10, 2, '#dfe8f0');
  ctx.save(); ctx.globalAlpha = .5;
  for (let i = 0; i < 3; i++) {
    const a = t * 20 + i * 2;
    line(ctx, 24 + i * 4, -8 + Math.sin(a) * 3, 30 + i * 4, 8 + Math.sin(a) * 3, '#c8e2f6', 2);
  }
  ctx.restore();
  ctx.restore();
  /* trailing arm */
  ctx.save();
  ctx.translate(-14, -6); ctx.rotate(2.6 + Math.sin(run * 1.02 + Math.PI) * 0.3);
  fillRR(ctx, 0, -5, 24, 10, 5, '#f2cfa8');
  ctx.restore();
  /* head: a headscarf, and the same round-eyed panic */
  circle(ctx, 2, -32, 14.5, '#f2cfa8');
  ctx.strokeStyle = INK; ctx.lineWidth = 2.3; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-12, -36); ctx.quadraticCurveTo(2, -52, 16, -38);
  ctx.lineTo(14, -32); ctx.quadraticCurveTo(2, -44, -12, -31); ctx.closePath();
  ctx.fillStyle = '#e0748c'; ctx.fill();
  ctx.save(); ctx.globalAlpha = .55;
  for (let i = 0; i < 4; i++) circle(ctx, -8 + i * 7, -40 + (i % 2) * 4, 2, '#ffffff'); ctx.restore();
  poly(ctx, [[-12, -34], [-22, -40], [-20, -28]], '#e0748c');
  circle(ctx, 8, -33, 4.4, '#ffffff'); circle(ctx, 8, -33, 2.3, '#2b2634');
  circle(ctx, -2, -33, 4, '#ffffff'); circle(ctx, -2, -33, 2.1, '#2b2634');
  const gm = o.mouth || 0;
  fillEll(ctx, 4, -24 + gm * 2, 4.5 + gm * 3.5, 3.5 + gm * 5 + Math.abs(Math.sin(t * 6 + 1)) * 2.5, '#7a2b34');
  if (o.cross) { line(ctx, -6, -40, 1, -37, '#8a5a3a', 2.5); line(ctx, 13, -40, 6, -37, '#8a5a3a', 2.5); }
  ctx.restore();
}

/* =================================================================
   THE BIG DOGS

   They only ever turn up in the last arena: four of them, no two the
   same breed, standing in a half-circle behind the two people while
   the whole thing is settled. They are never an obstacle either —
   they watch, they bark, and at the end they are on Lota's side.
================================================================= */
const BIG_DOGS = {
  /* coat, markings, how tall, how wide, the ears, and what the tail does */
  dane:    { coat: '#8b95a2', mark: '#5d6773', nose: '#2b2634', h: 1.20, w: 0.96, ear: 'prick', muzzle: 1.30, tail: 'whip' },
  saint:   { coat: '#a4713f', mark: '#f2e6d2', nose: '#3a2a22', h: 1.02, w: 1.22, ear: 'flop',  muzzle: 1.05, tail: 'bushy' },
  poodle:  { coat: '#eadcc4', mark: '#fff6e8', nose: '#4a3a30', h: 1.08, w: 0.98, ear: 'curl',  muzzle: 0.90, tail: 'pom' },
  bulldog: { coat: '#c99a5e', mark: '#f6f2ea', nose: '#3a2f2a', h: 0.80, w: 1.28, ear: 'rose',  muzzle: 0.66, tail: 'stub' }
};
const BIG_DOG_IDS = ['dane', 'saint', 'poodle', 'bulldog'];

/** One big dog, standing, facing left (towards Lota) unless `o.face` is 1.
    `wag` is how hard the tail is going, `bark` a 0..1 poke of the head. */
function drawBigDog(ctx, x, y, s, t, breed, o) {
  const D = BIG_DOGS[breed] || BIG_DOGS.dane;
  o = o || {};
  s = (s == null ? 1 : s);
  const wag = o.wag == null ? 0.5 : o.wag, bark = o.bark || 0;
  const ph = (o.phase || 0) + t;
  const breathe = Math.sin(ph * 1.8) * 1.4;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s * (o.face === 1 ? -1 : 1), s);
  ctx.save(); ctx.globalAlpha = .26;
  fillEll(ctx, 0, 2, 44 * D.w, 9, '#000'); ctx.restore();

  const H = 96 * D.h;                       /* shoulder height */
  const legTop = -H * 0.52;
  /* four legs: the far pair first, dulled, so the near pair reads */
  const leg = (lx, dull) => {
    ctx.save(); ctx.globalAlpha = dull ? .62 : 1;
    fillRR(ctx, lx - 7, legTop, 14, -legTop - 4, 7, dull ? shade(D.coat, -.18) : D.coat);
    fillRR(ctx, lx - 9, -10, 19, 10, 5, shade(D.coat, -.1));
    ctx.restore();
  };
  leg(-24 * D.w, true); leg(20 * D.w, true);
  leg(-30 * D.w, false); leg(26 * D.w, false);

  /* the tail */
  ctx.save();
  ctx.translate(-36 * D.w, -H * 0.86);
  const sw = Math.sin(ph * (3 + wag * 7)) * (0.25 + wag * 0.55);
  ctx.rotate(-0.7 + sw);
  if (D.tail === 'stub') { fillRR(ctx, -10, -6, 16, 12, 6, D.coat); }
  else if (D.tail === 'pom') {
    line(ctx, 0, 0, -22, -10, D.coat, 7);
    circle(ctx, -26, -12, 11, D.mark);
  } else if (D.tail === 'bushy') {
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-22, -18, -40, -12);
    ctx.strokeStyle = D.coat; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-28, -14); ctx.quadraticCurveTo(-36, -14, -42, -11);
    ctx.strokeStyle = D.mark; ctx.lineWidth = 13; ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-20, -14, -34, -22);
    ctx.strokeStyle = D.coat; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.restore();

  /* the body */
  ctx.save(); ctx.translate(0, -H * 0.74 + breathe * 0.3);
  fillEll(ctx, 0, 0, 42 * D.w, 26 * D.h, D.coat);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.save(); ctx.globalAlpha = .9;
  fillEll(ctx, 6 * D.w, 10, 26 * D.w, 13, D.mark); ctx.restore();
  if (breed === 'poodle') {
    ctx.save(); ctx.globalAlpha = .75;
    for (let i = 0; i < 9; i++)
      circle(ctx, -34 + i * 8.4, -12 + Math.sin(i * 2.1) * 5, 7, D.mark);
    ctx.restore();
  }
  ctx.restore();

  /* neck and head */
  ctx.save();
  ctx.translate(30 * D.w, -H * 0.92 - breathe * 0.4);
  ctx.rotate(-0.12 + bark * 0.3 + Math.sin(ph * 1.3) * 0.04);
  fillRR(ctx, -14, -4, 22, 30, 10, D.coat);
  const hw = 22 * (0.9 + D.w * 0.12);
  fillEll(ctx, 4, -16, hw, 19, D.coat);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke();
  /* the muzzle, which is most of what tells the breeds apart */
  const ml = 22 * D.muzzle;
  fillRR(ctx, 4, -14, ml, 17, 8, shade(D.coat, .06));
  fillEll(ctx, 4 + ml, -12, 7, 6, D.nose);
  ctx.save(); ctx.globalAlpha = .8;
  fillEll(ctx, 8, 0, ml * 0.6, 5, D.mark); ctx.restore();
  /* the mouth, open when it is barking */
  if (bark > 0.05) {
    fillEll(ctx, 4 + ml * 0.55, -2 + bark * 3, ml * 0.4, 3 + bark * 6, '#7a2b34');
    ctx.save(); ctx.globalAlpha = .9;
    fillEll(ctx, 4 + ml * 0.5, 1 + bark * 5, ml * 0.24, 2 + bark * 2, '#ff9ab0'); ctx.restore();
  }
  /* eye */
  const blink = imod(ph * 1000, 3600) > 3420;
  circle(ctx, 2, -20, 4.6, '#ffffff');
  circle(ctx, 3, -20, blink ? 0.5 : 2.5, '#2b2634');
  /* ears */
  if (D.ear === 'prick') poly(ctx, [[-12, -26], [-2, -46], [4, -24]], shade(D.coat, -.12));
  else if (D.ear === 'flop') {
    ctx.save(); ctx.rotate(Math.sin(ph * 2.2) * 0.08);
    fillRR(ctx, -18, -24, 18, 34, 9, shade(D.coat, -.14)); ctx.restore();
  } else if (D.ear === 'curl') {
    circle(ctx, -12, -20, 13, D.mark);
    circle(ctx, -16, -30, 9, D.mark);
    circle(ctx, 2, -34, 11, D.mark);        /* the topknot */
  } else {
    fillRR(ctx, -14, -30, 15, 15, 7, shade(D.coat, -.14));
  }
  ctx.restore();
  ctx.restore();
}
