'use strict';
/* ---------------------------------------------------------------
   lota.js — the black miniature schnauzer, drawn procedurally.
   Local space: origin = centre between her paws, +x = forward,
   y grows downward (so her head sits at negative y).

   She is a black-and-silver mini: the coat is black, the schnauzer
   furnishings — beard, eyebrows, chest and the lower half of every
   leg — are silver, which is what makes the breed readable at the
   size she is actually drawn on screen.
----------------------------------------------------------------*/
const LOTA = {
  STAND_W: 56, STAND_H: 62,
  DUCK_W: 66,  DUCK_H: 30,
  fur:      '#242231',
  furLight: '#3b3849',
  furDark:  '#15141c',
  beard:    '#b9b4ab',
  beardHi:  '#ded9d0',
  beardSh:  '#8b867e',
  furnish:  '#7f7a71',
  furnishD: '#57534f',
  nose:     '#0e0d13',
  ink:      'rgba(150,145,175,.55)',
  tongue:   '#ff8fa8'
};

/* split a quadratic at t and return the far half's control + start */
function quadTail(p0, p1, p2, t) {
  const lp = (a, b) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const a = lp(p0, p1), b = lp(p1, p2);
  return { s: lp(a, b), c: b };
}

/* quadratic limb; `furn` silvers the lower half the way her furnishings do */
function limb(ctx, hx, hy, fx, fy, bend, col, w, furn) {
  const mx = (hx + fx) / 2, my = (hy + fy) / 2;
  const dx = fx - hx, dy = fy - hy, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const cx = mx + nx * bend, cy = my + ny * bend;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.quadraticCurveTo(cx, cy, fx, fy);
  ctx.strokeStyle = col; ctx.lineWidth = w;
  ctx.stroke();
  if (furn) {
    const h = quadTail([hx, hy], [cx, cy], [fx, fy], 0.68);
    ctx.beginPath();
    ctx.moveTo(h.s[0], h.s[1]);
    ctx.quadraticCurveTo(h.c[0], h.c[1], fx, fy);
    ctx.strokeStyle = furn; ctx.lineWidth = w * 0.88;
    ctx.stroke();
  }
}

/* one small V-shaped ear, creased at the base and folded forward.
   The pivot is the crease, so the whole flap hangs off the skull top. */
function ear(ctx, bx, by, ang, sc, col) {
  ctx.save();
  ctx.translate(bx, by); ctx.rotate(ang); ctx.scale(sc, sc);
  ctx.beginPath();
  ctx.moveTo(-5.5, -1);
  ctx.quadraticCurveTo(-1.5, -4.5, 4.5, -1.5);
  ctx.quadraticCurveTo(7.8, 2.5, 5.4, 8.5);
  ctx.quadraticCurveTo(2.6, 12, -0.4, 8.2);
  ctx.quadraticCurveTo(-5.5, 3.5, -5.5, -1);
  ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = LOTA.ink; ctx.lineWidth = 1.4; ctx.stroke();
  /* the crease catches the light */
  ctx.save(); ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(-4.4, -1.2);
  ctx.quadraticCurveTo(-1.2, -3.6, 3.6, -1.2);
  ctx.quadraticCurveTo(5.2, 0.8, 4.2, 2.6);
  ctx.quadraticCurveTo(-0.6, 0.4, -4.4, -1.2);
  ctx.closePath();
  ctx.fillStyle = LOTA.furLight; ctx.fill();
  ctx.restore();
  ctx.restore();
}

/* torso: straight topline, deep chest up front, tucked-up waist */
function bodyPath(ctx, rx, ry) {
  ctx.beginPath();
  ctx.moveTo(-rx, -ry * 0.30);
  ctx.quadraticCurveTo(-rx * 1.0, -ry * 1.02, -rx * 0.52, -ry * 1.0);
  ctx.quadraticCurveTo(rx * 0.1, -ry * 1.02, rx * 0.5, -ry * 0.92);
  ctx.quadraticCurveTo(rx * 0.98, -ry * 0.82, rx, -ry * 0.05);
  ctx.quadraticCurveTo(rx * 1.02, ry * 0.72, rx * 0.58, ry * 0.98);
  ctx.quadraticCurveTo(rx * 0.12, ry * 0.8, -rx * 0.3, ry * 0.82);
  ctx.quadraticCurveTo(-rx * 0.82, ry * 0.84, -rx, -ry * 0.30);
  ctx.closePath();
}

/* the silver fringe that hangs off her belly */
function skirt(ctx, rx, ry) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(rx * 0.88, ry * 0.36);
  ctx.quadraticCurveTo(rx * 0.9, ry * 0.72, rx * 0.6, ry * 0.9);
  const x0 = rx * 0.6, x1 = -rx * 0.2, n = 3;
  for (let i = 0; i < n; i++) {
    const a = lerp(x0, x1, i / n), b = lerp(x0, x1, (i + 1) / n);
    ctx.quadraticCurveTo((a + b) / 2, ry * 0.99, b, ry * 0.86);
  }
  ctx.quadraticCurveTo(-rx * 0.34, ry * 0.76, -rx * 0.22, ry * 0.66);
  ctx.quadraticCurveTo(rx * 0.34, ry * 0.78, rx * 0.88, ry * 0.36);
  ctx.closePath();
  ctx.fillStyle = LOTA.furnish; ctx.fill();
  ctx.restore();
}

/**
 * Draw Lota.
 * @param opts {state:'run'|'jump'|'fall'|'duck'|'sit'|'idle', t, run, skin, scale, alpha, shadow}
 */
function drawLota(ctx, px, py, opts) {
  const o = opts || {};
  const st = o.state || 'run';
  const t = o.t || 0;
  const s = o.scale == null ? 1 : o.scale;
  const skin = o.skin || 'classic';
  const F = LOTA;

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(s, s);
  if (o.alpha != null) ctx.globalAlpha = o.alpha;

  /* ---- ground shadow ---- */
  if (o.shadow !== false) {
    const sh = st === 'jump' || st === 'fall' ? 0.45 : 1;
    ctx.save(); ctx.globalAlpha = 0.26 * sh;
    fillEll(ctx, 2, 2, 34, 7, '#000');
    ctx.restore();
  }

  /* blink: quick, every ~3.4 s */
  const blinkT = (t * 1000) % 3400;
  const blink = blinkT > 3180 && blinkT < 3300;

  const rig = { t: t, state: st, flipTail: 1 };

  if (st === 'sit') {
    /* -------------------------------------------------- SIT ---- */
    const breathe = Math.sin(t * 2.1) * 1.6;
    const tilt = o.tilt != null ? o.tilt : Math.sin(t * 0.9) * 0.11;
    const earTw = Math.sin(t * 5.5) * (((t * 0.5) % 4 > 3.4) ? 0.35 : 0.05);

    /* short docked tail, carried up behind */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-24, -20);
    ctx.quadraticCurveTo(-34, -26 + Math.sin(t * 3) * 3, -31, -36 + Math.sin(t * 3) * 4);
    ctx.strokeStyle = F.fur; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore();

    /* haunch + back paw */
    fillEll(ctx, -13, -18, 20, 18, F.fur);
    ctx.strokeStyle = F.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.globalAlpha = 0.8;
    fillEll(ctx, -5, -7, 11, 6, F.furnishD);
    ctx.restore();
    fillEll(ctx, -4, -4, 12, 5.5, F.furnishD);

    /* chest / body upright */
    ctx.save();
    ctx.translate(4, -34 + breathe * 0.4);
    ell(ctx, 0, 0, 19, 22, -0.06);
    ctx.fillStyle = F.fur; ctx.fill(); ctx.strokeStyle = F.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    /* silver chest, from the beard down to the front paws */
    ctx.save(); ctx.globalAlpha = 0.96;
    ctx.beginPath();
    ctx.moveTo(10, -48);
    ctx.quadraticCurveTo(20, -43, 19, -31);
    ctx.quadraticCurveTo(18, -21, 13, -17);
    ctx.quadraticCurveTo(8, -24, 10, -48);
    ctx.closePath();
    ctx.fillStyle = F.furnish; ctx.fill();
    ctx.globalAlpha = 0.35;
    line(ctx, 14, -40, 13, -20, F.furnishD, 1.3);
    line(ctx, 18, -38, 17, -22, F.furnishD, 1.3);
    ctx.restore();

    /* front legs, silver from the elbow down */
    const lift = o.paw ? Math.max(0, Math.sin(t * 2.6)) * 16 : 0;
    limb(ctx, 8, -40, 12, -2, 2, F.fur, 10.5, F.furnishD);
    limb(ctx, 17, -40, 22 + lift * 0.5, -2 - lift, 2, F.fur, 10.5, F.furnish);
    fillEll(ctx, 12, -2, 7, 4.2, F.furnishD);
    if (lift < 3) fillEll(ctx, 22, -2, 7, 4.2, F.furnish);
    else fillEll(ctx, 22 + lift * 0.5, -2 - lift, 6.5, 4.6, F.furnish);
    /* where a costume hangs a shoe or a glove; the raised one is [0] */
    rig.paws = [
      { x: 22 + lift * 0.5, y: -2 - lift, front: true, lift: lift },
      { x: 12, y: -2, front: true, lift: 0 },
      { x: -4, y: -4, front: false, lift: 0 }
    ];

    /* head */
    ctx.save();
    ctx.translate(13, -60 + breathe);
    ctx.rotate(tilt);
    rig.headX = 13; rig.headY = -60 + breathe; rig.headA = tilt; rig.headR = 16;
    drawHead(ctx, t, blink, o.face || 'calm', earTw, 1);
    ctx.restore();

  } else {
    /* ------------------------------------------- RUN / AIR / DUCK ---- */
    const duck = st === 'duck';
    const air = st === 'jump' || st === 'fall';
    const p = o.run || 0;
    const bob = duck ? 0 : Math.sin(p * 2) * 2.6;
    const bodyY = (duck ? -17 : -34) + bob;
    const bodyRX = duck ? 32 : 27;
    const bodyRY = duck ? 12 : 15.5;
    const tilt = duck ? -0.05 : air ? (st === 'jump' ? -0.20 : 0.13) : Math.sin(p * 2 + 1.1) * 0.045;
    const headX = duck ? 40 : 31;
    const headY = (duck ? -26 : -49) + bob * 0.8;
    const headA = duck ? 0.22 : air ? (st === 'jump' ? -0.24 : 0.16) : Math.sin(p * 2) * 0.06;

    /* ---- tail (docked short, carried up) ---- */
    const wag = duck ? 0.1 : air ? -0.25 : Math.sin(p * 2.4) * 0.42;
    ctx.save();
    ctx.translate(-23, bodyY - 9);
    ctx.rotate(wag + (duck ? 0.5 : -0.15));
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(-8, -4, -6.5, -14);
    ctx.strokeStyle = F.fur; ctx.lineWidth = 11.5; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = F.furLight; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(-1.5, 0); ctx.quadraticCurveTo(-8, -5, -7, -12.5); ctx.stroke();
    ctx.restore();

    /* ---- back legs ---- */
    const bhx = -17, bhy = bodyY + 10;
    const legs = legPositions(p, st, duck);
    limb(ctx, bhx, bhy, bhx + legs.b1x, legs.b1y, -5, F.furDark, 9, F.furnishD);
    limb(ctx, bhx + 3, bhy, bhx + 3 + legs.b2x, legs.b2y, -5, F.fur, 9.5, F.furnish);

    /* ---- front legs (behind body) ---- */
    const fhx = 16, fhy = bodyY + 9;
    limb(ctx, fhx, fhy, fhx + legs.f1x, legs.f1y, 5, F.furDark, 8.5, F.furnishD);

    /* ---- body ---- */
    ctx.save();
    ctx.translate(0, bodyY); ctx.rotate(tilt);
    bodyPath(ctx, bodyRX, bodyRY);
    ctx.fillStyle = F.fur; ctx.fill();
    ctx.strokeStyle = F.ink; ctx.lineWidth = 2.2; ctx.stroke();
    /* back highlight along the straight topline */
    ctx.save(); ctx.globalAlpha = 0.45;
    ell(ctx, -2, -bodyRY * 0.6, bodyRX * 0.66, bodyRY * 0.22, -0.04);
    ctx.fillStyle = F.furLight; ctx.fill();
    ctx.restore();
    /* silver skirt along the belly */
    skirt(ctx, bodyRX, bodyRY);
    ctx.restore();

    /* ---- front leg (in front of body) ---- */
    limb(ctx, fhx + 4, fhy, fhx + 4 + legs.f2x, legs.f2y, 5, F.fur, 9, F.furnish);
    /* paws */
    pawAt(ctx, bhx + legs.b1x, legs.b1y, F.furnishD);
    pawAt(ctx, bhx + 3 + legs.b2x, legs.b2y, F.furnish);
    pawAt(ctx, fhx + legs.f1x, legs.f1y, F.furnishD);
    pawAt(ctx, fhx + 4 + legs.f2x, legs.f2y, F.furnish);
    /* the near front paw is [0] — a glove or a cane goes there */
    rig.paws = [
      { x: fhx + 4 + legs.f2x, y: legs.f2y, front: true, lift: 0 },
      { x: fhx + legs.f1x, y: legs.f1y, front: true, lift: 0 },
      { x: bhx + 3 + legs.b2x, y: legs.b2y, front: false, lift: 0 },
      { x: bhx + legs.b1x, y: legs.b1y, front: false, lift: 0 }
    ];

    /* ---- neck + head ---- */
    ctx.save();
    ctx.translate(headX - 10, headY + 12); ctx.rotate(headA * 0.5);
    fillEll(ctx, 0, 0, 13, 12, F.fur);
    /* silver chest between the front legs, under the beard */
    ctx.save(); ctx.globalAlpha = 0.85;
    ell(ctx, 2, 8, 6, 5, 0.3); ctx.fillStyle = F.furnish; ctx.fill();
    ctx.restore();
    ctx.restore();

    ctx.save();
    ctx.translate(headX, headY); ctx.rotate(headA);
    rig.headX = headX; rig.headY = headY; rig.headA = headA; rig.headR = 16;
    const earA = duck ? 0.85 : air ? -0.22 : Math.sin(p * 2 + 0.7) * 0.13;
    drawHead(ctx, t, blink, o.face || (air ? 'wow' : 'happy'), earA, duck ? 0.5 : 1);
    ctx.restore();

    rig.bodyX = 0; rig.bodyY = bodyY; rig.bodyRX = bodyRX; rig.bodyRY = bodyRY; rig.bodyA = tilt;
    rig.duck = duck;
  }

  rig.bodyX = rig.bodyX || 0;
  if (rig.bodyY == null) { rig.bodyX = 4; rig.bodyY = -34; rig.bodyRX = 19; rig.bodyRY = 22; rig.bodyA = 0; }
  if (!rig.paws) rig.paws = [];
  rig.skinScale = 1;

  /* ---- costume on top ---- */
  const sk = SKIN_MAP[skin];
  if (sk && sk.draw) sk.draw(ctx, rig, t);

  ctx.restore();
}

function pawAt(ctx, x, y, col) { fillEll(ctx, x + 0.5, y, 5.4, 3.8, col); }

/* leg target positions for the current pose */
function legPositions(p, st, duck) {
  if (duck) {
    return { f1x: 16, f1y: -3, f2x: 22, f2y: -3, b1x: -14, b1y: -3, b2x: -20, b2y: -3 };
  }
  if (st === 'jump') {
    return { f1x: 16, f1y: -30, f2x: 21, f2y: -24, b1x: -16, b1y: -20, b2x: -20, b2y: -13 };
  }
  if (st === 'fall') {
    return { f1x: 12, f1y: -6, f2x: 17, f2y: -2, b1x: -12, b1y: -4, b2x: -17, b2y: -8 };
  }
  /* gallop cycle */
  const A = p, B = p + 2.15;
  const swing = (ph, reach) => Math.sin(ph) * reach;
  const lift  = ph => -Math.max(0, Math.sin(ph + 0.9)) * 15;
  return {
    f1x: swing(A, 15),         f1y: lift(A),
    f2x: swing(A + 0.55, 15),  f2y: lift(A + 0.55),
    b1x: swing(B, 14),         b1y: lift(B),
    b2x: swing(B + 0.55, 14),  b2y: lift(B + 0.55)
  };
}

/* head drawn at local origin = head centre.
   The schnauzer read comes from three shapes: a blocky flat-topped
   skull, brows that overhang the eyes, and a beard that squares off
   the whole muzzle. */
function drawHead(ctx, t, blink, face, earA, earVis) {
  const F = LOTA;
  const eSc = earVis > 0.2 ? 1 : 0.8;

  /* far ear, behind the skull */
  ear(ctx, -13.5, -9.5, -0.95 + earA * 0.7, 0.74 * eSc, F.furDark);

  /* skull */
  ctx.beginPath();
  ctx.moveTo(-15, -5);
  ctx.quadraticCurveTo(-15.5, -15, -5, -16);
  ctx.quadraticCurveTo(6, -16.5, 11, -13);
  ctx.quadraticCurveTo(14.5, -10, 14, -3);
  ctx.quadraticCurveTo(13.5, 5, 8, 9);
  ctx.quadraticCurveTo(0, 13.5, -8, 10.5);
  ctx.quadraticCurveTo(-14.5, 6.5, -15, -5);
  ctx.closePath();
  ctx.fillStyle = F.fur; ctx.fill();
  ctx.strokeStyle = F.ink; ctx.lineWidth = 2.1; ctx.stroke();

  /* near ear, folded forward off the top of the skull */
  ear(ctx, -6.5, -15.5, -0.14 + earA, 0.8 * eSc, F.fur);

  /* muzzle bridge — black, running flat forward off the brow to the nose */
  ctx.beginPath();
  ctx.moveTo(6, -11);
  ctx.quadraticCurveTo(16, -11.5, 23, -9);
  ctx.quadraticCurveTo(27, -7, 26, -1);
  ctx.quadraticCurveTo(18, 1.5, 6, 0.5);
  ctx.closePath();
  ctx.fillStyle = F.fur; ctx.fill();

  /* beard — a square curtain hung off the muzzle */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(1, -1);
  ctx.quadraticCurveTo(13, -3.5, 25, -2);
  ctx.quadraticCurveTo(28.5, -1, 28, 5);
  ctx.quadraticCurveTo(27.5, 12.5, 24, 16.5);   /* front face, straight down */
  ctx.quadraticCurveTo(20, 20.5, 16.5, 17);     /* notched hem */
  ctx.quadraticCurveTo(13, 21, 9.5, 16.5);
  ctx.quadraticCurveTo(5.5, 19.5, 2.5, 14);
  ctx.quadraticCurveTo(-1.5, 7.5, 1, -1);
  ctx.closePath();
  ctx.fillStyle = F.beard; ctx.fill();
  ctx.strokeStyle = 'rgba(80,75,72,.32)'; ctx.lineWidth = 1.5; ctx.stroke();
  /* it sits in the shade where it meets the muzzle */
  ctx.save(); ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(1.5, 0); ctx.quadraticCurveTo(13, -2.5, 25, -1);
  ctx.quadraticCurveTo(14, 2.5, 2, 4); ctx.closePath();
  ctx.fillStyle = F.beardSh; ctx.fill();
  ctx.restore();
  /* strands */
  ctx.globalAlpha = 0.4;
  line(ctx, 6, 6, 4.5, 14.5, F.beardSh, 1.5);
  line(ctx, 12, 5, 11.5, 16.5, F.beardSh, 1.5);
  line(ctx, 18, 4, 18, 16.5, F.beardSh, 1.5);
  line(ctx, 23.5, 4, 24, 13.5, F.beardSh, 1.5);
  ctx.globalAlpha = 0.45;
  line(ctx, 9, 7, 8, 13.5, F.beardHi, 1.3);
  line(ctx, 21, 6, 21, 12.5, F.beardHi, 1.3);
  ctx.restore();

  /* nose — big and square-ish, at the end of the muzzle */
  ctx.beginPath();
  ctx.moveTo(20, -9.5);
  ctx.quadraticCurveTo(28, -9, 28.5, -3.5);
  ctx.quadraticCurveTo(28.5, 1, 23, 1);
  ctx.quadraticCurveTo(19.5, 0.5, 20, -9.5);
  ctx.closePath();
  ctx.fillStyle = F.nose; ctx.fill();
  fillEll(ctx, 24, -6.6, 2.4, 1.3, 'rgba(255,255,255,.4)');

  /* eyes, small and dark, set deep under the brow ridge */
  const wow = face === 'wow', sad = face === 'sad';
  const eyeR = wow ? 4.6 : sad ? 3.6 : 4.0;
  const eyes = [[1.5, -5.2], [10.8, -4.6]];
  eyes.forEach(e => {
    if (blink) { line(ctx, e[0] - 3.6, e[1], e[0] + 3.6, e[1], '#0c0b11', 2.1); return; }
    fillEll(ctx, e[0], e[1], eyeR, eyeR * 1.04, '#fdfcff');
    const px = e[0] + (wow ? 0.5 : 1.1), py = e[1] + (sad ? 1.0 : 0.4);
    circle(ctx, px, py, eyeR * 0.72, '#171622');
    circle(ctx, px - eyeR * 0.28, py - eyeR * 0.34, eyeR * 0.27, '#fff');
    circle(ctx, px + eyeR * 0.3, py + eyeR * 0.32, eyeR * 0.14, 'rgba(255,255,255,.6)');
  });

  /* eyebrows — bushy, overhanging, the other half of the signature.
     Drawn last on the face so nothing crops them. */
  const brow = sad ? 1.8 : wow ? -1.6 : 0;
  ctx.save();
  ctx.translate(0, brow);
  /* far brow */
  ctx.beginPath();
  ctx.moveTo(-8, -7.6);
  ctx.quadraticCurveTo(-7.4, -13.4, -1.6, -12.8);
  ctx.quadraticCurveTo(3.6, -12.2, 5, -7.2);
  ctx.quadraticCurveTo(1.4, -8.8, -2.8, -8.6);
  ctx.quadraticCurveTo(-6.2, -8.4, -8, -7.6);
  ctx.closePath();
  ctx.fillStyle = F.furnishD; ctx.fill();
  /* near brow, jutting forward over the outer corner of the eye */
  ctx.beginPath();
  ctx.moveTo(3.6, -8.4);
  ctx.quadraticCurveTo(6, -14.8, 12.2, -13.4);
  ctx.quadraticCurveTo(18.2, -12, 17.4, -5.6);
  ctx.quadraticCurveTo(15.2, -8.2, 10.2, -8.4);
  ctx.quadraticCurveTo(6.4, -8.6, 3.6, -8.4);
  ctx.closePath();
  ctx.fillStyle = F.beard; ctx.fill();
  ctx.save(); ctx.globalAlpha = 0.5;
  line(ctx, 6.2, -12.2, 5.6, -8.6, F.beardHi, 1.3);
  line(ctx, 10, -13.6, 9.8, -8.6, F.beardHi, 1.3);
  line(ctx, 13.6, -12.9, 14.2, -7.6, F.beardHi, 1.3);
  line(ctx, 16.3, -11.3, 16.8, -6.6, F.beardHi, 1.2);
  line(ctx, -5.4, -11.8, -5.8, -8.8, F.beard, 1.2);
  line(ctx, -1.8, -12.4, -2, -9, F.beard, 1.2);
  line(ctx, 1.8, -11.8, 2, -8.9, F.beard, 1.2);
  ctx.restore();
  ctx.restore();

  /* mouth / tongue, peeking out of the beard under the nose */
  if (face === 'happy') {
    ctx.beginPath();
    ctx.moveTo(19, 4); ctx.quadraticCurveTo(22.5, 8, 25.5, 4.5);
    ctx.strokeStyle = '#4a4340'; ctx.lineWidth = 1.7; ctx.stroke();
    if (Math.sin(t * 6) > -0.2) {
      ctx.beginPath();
      ctx.moveTo(20, 5.5); ctx.quadraticCurveTo(22.5, 13.5, 26, 6.5);
      ctx.closePath(); ctx.fillStyle = LOTA.tongue; ctx.fill();
    }
  } else if (face === 'wow') {
    fillEll(ctx, 22.5, 6.5, 3.2, 3.8, '#3a2b33');
  } else if (face === 'sad') {
    ctx.beginPath(); ctx.moveTo(19, 7.5); ctx.quadraticCurveTo(22.5, 4, 26, 7.5);
    ctx.strokeStyle = '#4a4340'; ctx.lineWidth = 1.7; ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(20, 4.5); ctx.quadraticCurveTo(22.5, 7, 25, 4.5);
    ctx.strokeStyle = '#4a4340'; ctx.lineWidth = 1.6; ctx.stroke();
  }

  /* cheek blush */
  ctx.save(); ctx.globalAlpha = 0.16;
  fillEll(ctx, -5, 2, 4, 2.6, '#ff8fb0');
  ctx.restore();
}

/* ===============================================================
   SKINS — costumes tailored to a schnauzer body
================================================================*/
function atHead(ctx, rig, fn) {
  ctx.save(); ctx.translate(rig.headX, rig.headY); ctx.rotate(rig.headA); fn(ctx); ctx.restore();
}
function atBody(ctx, rig, fn) {
  ctx.save(); ctx.translate(rig.bodyX, rig.bodyY); ctx.rotate(rig.bodyA || 0); fn(ctx); ctx.restore();
}
/* a cloth strip that flutters behind her */
function flutter(ctx, x, y, len, amp, col, w, t, seedPhase) {
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 1; i <= 6; i++) {
    const f = i / 6;
    ctx.lineTo(x - len * f, y + Math.sin(t * 9 - i * 0.8 + (seedPhase || 0)) * amp * f);
  }
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}

/* ---------------------------------------------------------------
   Dressing helpers shared by the later, fancier outfits.
   Everything here works off `rig`, so a coat sits on her back whether
   she is running, ducking or sitting on the lobby rug.
----------------------------------------------------------------*/

/** a slowly-turning rainbow, the signature of the boss prize */
function rainbowStops(g, t, alpha) {
  const a = alpha == null ? 1 : alpha;
  for (let i = 0; i <= 6; i++) {
    const h = ((i / 6) * 360 + t * 46) % 360;
    g.addColorStop(i / 6, 'hsla(' + h.toFixed(0) + ',92%,66%,' + a + ')');
  }
  return g;
}
function rainbowLin(ctx, x0, y0, x1, y1, t, alpha) {
  return rainbowStops(ctx.createLinearGradient(x0, y0, x1, y1), t, alpha);
}

/** tiny twinkling stars scattered over an area — reads as "this one shimmers" */
function sparkle(ctx, n, t, x, y, rx, ry, seed, col) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const r = makeRng((seed || 7) * 131 + i * 17);
    const a = Math.sin(t * 3.2 + i * 1.9) * 0.5 + 0.5;
    if (a < 0.12) continue;
    const sx = x + (r() * 2 - 1) * rx, sy = y + (r() * 2 - 1) * ry;
    const s = 1.1 + a * 2.3;
    ctx.globalAlpha = a * 0.9;
    ctx.fillStyle = col || '#fff';
    ctx.beginPath();
    ctx.moveTo(sx, sy - s); ctx.quadraticCurveTo(sx, sy, sx + s, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy + s); ctx.quadraticCurveTo(sx, sy, sx - s, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy - s);
    ctx.fill();
  }
  ctx.restore();
}

/** a five-pointed star, the punctuation mark of every sparkly outfit */
function c2star(ctx, x, y, r, ri, col) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * (Math.PI / 5), rad = i % 2 ? ri : r;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}

/** six-armed snowflake, spinning gently */
function snowflake(ctx, x, y, r, col, spin) {
  ctx.save(); ctx.translate(x, y); ctx.rotate((spin || 0) * 0.4);
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.8, r * 0.28); ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a = i * (Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(-Math.cos(a) * r, -Math.sin(a) * r);
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * .55, Math.sin(a) * r * .55);
    ctx.lineTo(Math.cos(a + .8) * r * .85, Math.sin(a + .8) * r * .85);
    ctx.moveTo(-Math.cos(a) * r * .55, -Math.sin(a) * r * .55);
    ctx.lineTo(-Math.cos(a + .8) * r * .85, -Math.sin(a + .8) * r * .85);
    ctx.stroke();
  }
  ctx.restore();
}

/** a scalloped skirt — tutu, gown, petal dress all come out of this */
function tulle(c, cx, cy, rx, ry, lobes, col, phase) {
  c.beginPath();
  for (let k = 0; k <= 44; k++) {
    const a = (k / 44) * TAU;
    const w = 1 + Math.cos(a * lobes + (phase || 0)) * 0.1;
    const x = cx + Math.cos(a) * rx * w, y = cy + Math.sin(a) * ry * w;
    if (k === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.closePath(); c.fillStyle = col; c.fill();
}

/** a faceted gem — the level-3 outfits are built out of these */
function gem(ctx, x, y, r, col, hi) {
  ctx.save(); ctx.translate(x, y);
  poly(ctx, [[0, -r], [r * 0.86, -r * 0.2], [r * 0.55, r], [-r * 0.55, r], [-r * 0.86, -r * 0.2]], col);
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.9; ctx.stroke();
  ctx.globalAlpha = 0.7;
  poly(ctx, [[0, -r], [r * 0.4, -r * 0.1], [-r * 0.3, r * 0.2]], hi || '#fff');
  ctx.restore();
}

/** a bootie on every paw; `col` is the leather, `trim` the sole */
function shoes(ctx, rig, col, trim, glow) {
  (rig.paws || []).forEach(p => {
    ctx.save(); ctx.translate(p.x, p.y);
    if (glow) { ctx.save(); ctx.globalAlpha = .3; fillEll(ctx, 0.5, 0, 8.5, 5.5, glow); ctx.restore(); }
    /* low and wrapped round the paw — a paw in a shoe, not a paw in a box */
    ctx.beginPath();
    ctx.moveTo(-5.8, -3);
    ctx.quadraticCurveTo(-6.8, 2, -4.2, 3.4);
    ctx.quadraticCurveTo(1, 5.2, 5.6, 2.8);
    ctx.quadraticCurveTo(7.4, 1.4, 6.2, -2.2);
    ctx.quadraticCurveTo(0.4, -4.8, -5.8, -3);
    ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = 'rgba(20,12,30,.28)'; ctx.lineWidth = 1.1; ctx.stroke();
    fillRR(ctx, -6.2, 2.4, 12.8, 2.6, 1.3, trim);
    ctx.save(); ctx.globalAlpha = .5; fillEll(ctx, -1.8, -1.8, 2.2, 1.2, '#fff'); ctx.restore();
    ctx.restore();
  });
}

/** one long glove, on the near front paw only */
function glove(ctx, rig, cuffCol, clothCol, t) {
  const p = (rig.paws || [])[0];
  if (!p) return;
  ctx.save(); ctx.translate(p.x, p.y);
  /* the sleeve runs back up the leg, then the hand */
  fillRR(ctx, -3.4, -12.5, 6.8, 11.5, 3, clothCol);
  fillEll(ctx, 0.4, 0.2, 6.2, 4.4, clothCol);
  ctx.beginPath(); ctx.ellipse(0.4, 0.2, 6.2, 4.4, 0, 0, TAU);
  ctx.strokeStyle = 'rgba(20,12,30,.22)'; ctx.lineWidth = 1; ctx.stroke();
  fillRR(ctx, -4.8, -14.8, 9.6, 3.8, 1.9, cuffCol);
  ctx.save(); ctx.globalAlpha = .4;
  line(ctx, -1.6, -10, -1.6, -2, '#fff', 1);
  ctx.restore();
  sparkle(ctx, 2, t, 0, -7, 5, 7, 21);
  ctx.restore();
}

const SKINS = [
  { id: 'classic', name: 'Lota', level: 1, cost: { b: 0 }, from: 'Kaip yra',
    note: 'Tokia, kokia yra', draw: null },

  /* ============================================================
     LEVEL 1 — every one of them comes from a place on the road to
     London, and the shop says which. They go up in price in the
     order the level runs: home first, London last.
  ============================================================ */
  { id: 'pyjama', name: 'Pižamos', level: 1, cost: { b: 25 }, from: 'Lotos namai',
    note: 'Dar tik keliasi',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        c.save(); c.globalAlpha = .96;
        ell(c, -1, 1, rx * .9, ry * .95, 0); c.fillStyle = '#bcd6f2'; c.fill(); c.restore();
        c.save(); c.globalAlpha = .5;
        for (let i = -2; i <= 2; i++) line(c, i * 7 + 2, -ry * .8, i * 7 - 2, ry * .85, '#8fb4e0', 3);
        c.restore();
        /* a breast pocket with a biscuit saved in it */
        fillRR(c, -13, -1, 12, 10, 3, '#a8c8ea');
        c.save(); c.globalAlpha = .9; circle(c, -7, 3, 2.4, '#fff3d8'); c.restore();
        /* the collar of the jacket */
        c.beginPath(); c.moveTo(15, -ry * .55); c.lineTo(6, -ry * .1); c.lineTo(16, -ry * .05);
        c.closePath(); c.fillStyle = '#dbe9f8'; c.fill();
      });
      atHead(ctx, rig, c => {
        /* nightcap: it flops back behind her and the pompom swings */
        const sw = Math.sin(t * 3) * 3;
        c.beginPath();
        c.moveTo(-17, -8); c.quadraticCurveTo(-4, -23, 15, -13);
        c.quadraticCurveTo(-2, -13, -17, -8); c.closePath();
        c.fillStyle = '#7fa8dc'; c.fill();
        c.beginPath();
        c.moveTo(-15, -9); c.quadraticCurveTo(-26, -16 + sw, -34, -6 + sw);
        c.strokeStyle = '#7fa8dc'; c.lineWidth = 9; c.lineCap = 'round'; c.stroke();
        fillRR(c, -18, -12, 34, 6, 3, '#eef4fb');
        circle(c, -35, -5 + sw, 5.5, '#eef4fb');
      });
      shoes(ctx, rig, '#e8c8dc', '#c99ab8');
    } },

  { id: 'autumn', name: 'Rudeninė', level: 1, cost: { b: 30 }, from: 'Rudens kiemas',
    note: 'Šalikas iki pat ausų',
    draw(ctx, rig, t) {
      /* the long end of the scarf streaming behind her */
      flutter(ctx, rig.bodyX - 6, rig.bodyY - 10, 42, 8, '#d2643a', 7, t, 0.4);
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        c.save(); c.globalAlpha = .95;
        ell(c, -1, 2, rx * .86, ry * .9, 0); c.fillStyle = '#8a6a45'; c.fill(); c.restore();
        c.save(); c.globalAlpha = .45;
        for (let i = -2; i <= 2; i++) line(c, -10, i * 6, 12, i * 6 - 2, '#6f5232', 2.4);
        c.restore();
        /* two wooden buttons */
        circle(c, 8, -4, 2.6, '#c9a86a'); circle(c, 6, 5, 2.6, '#c9a86a');
        /* one leaf that landed on her and stayed */
        c.save(); c.translate(-6, -8); c.rotate(-0.5 + Math.sin(t * 1.4) * 0.08);
        c.beginPath();
        c.moveTo(0, -6); c.quadraticCurveTo(7, 0, 0, 7); c.quadraticCurveTo(-7, 0, 0, -6);
        c.closePath(); c.fillStyle = '#e08a2c'; c.fill();
        line(c, 0, -5, 0, 6, '#a8621c', 1.2);
        c.restore();
      });
      atHead(ctx, rig, c => {
        /* a knitted scarf wound twice round her neck */
        fillRR(c, -20, -2, 26, 11, 5, '#d2643a');
        fillRR(c, -19, -8, 24, 9, 4, '#e8834c');
        c.save(); c.globalAlpha = .4;
        for (let i = 0; i < 5; i++) line(c, -18 + i * 5, -8, -19 + i * 5, 8, '#a8481c', 2);
        c.restore();
        /* a beret, tipped over one ear */
        c.save(); c.rotate(-0.14);
        c.beginPath(); c.ellipse(-1, -16, 16, 8, 0, 0, TAU);
        c.fillStyle = '#6f4a7a'; c.fill();
        c.beginPath(); c.ellipse(-1, -19, 12.5, 6.5, 0, 0, TAU);
        c.fillStyle = '#845a90'; c.fill();
        circle(c, -1, -24, 3, '#6f4a7a');
        c.restore();
      });
    } },

  { id: 'pilot', name: 'Pilotė', level: 1, cost: { b: 85 }, from: 'Lėktuvas',
    note: 'Skrydis į Londoną',
    draw(ctx, rig, t) {
      flutter(ctx, rig.bodyX + 12, rig.bodyY - 6, 44, 7, '#f4efe4', 7, t, 0);
      atHead(ctx, rig, c => {
        c.beginPath(); c.moveTo(-17, -2); c.quadraticCurveTo(-16, -20, 2, -19);
        c.quadraticCurveTo(17, -18, 16, -3); c.quadraticCurveTo(0, -12, -17, -2); c.closePath();
        c.fillStyle = '#8a5a34'; c.fill(); c.strokeStyle = 'rgba(40,25,12,.5)'; c.lineWidth = 2; c.stroke();
        fillRR(c, -20, -6, 9, 15, 4, '#7a4e2c');
        /* goggles pushed up on the forehead */
        c.save(); c.translate(0, -14);
        fillRR(c, -14, -5, 28, 9, 4, '#4a3524');
        circle(c, -7, 0, 5, '#9fe0f0'); circle(c, 7, 0, 5, '#9fe0f0');
        c.strokeStyle = '#d9b26a'; c.lineWidth = 1.8;
        c.beginPath(); c.arc(-7, 0, 5, 0, TAU); c.stroke();
        c.beginPath(); c.arc(7, 0, 5, 0, TAU); c.stroke();
        c.restore();
      });
      atBody(ctx, rig, c => { fillRR(c, 6, -4, 16, 12, 5, '#f4efe4'); });
    } },

  { id: 'driver', name: 'Autobuso vairuotoja', level: 1, cost: { b: 55 }, from: 'Autobusas',
    note: 'Kitas sustojimas — parkas',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        c.save(); c.globalAlpha = .95;
        ell(c, 2, 1, rig.bodyRX * .8, rig.bodyRY * .85, 0); c.fillStyle = '#f6d93a'; c.fill();
        c.restore();
        line(c, -8, -6, -8, 10, '#e8e8ee', 3); line(c, 8, -7, 8, 9, '#e8e8ee', 3);
      });
      atHead(ctx, rig, c => {
        c.beginPath(); c.moveTo(-16, -8); c.quadraticCurveTo(0, -24, 15, -8); c.closePath();
        c.fillStyle = '#25407a'; c.fill();
        fillRR(c, -17, -9, 33, 6, 3, '#1b2f5c');
        fillRR(c, 8, -8, 16, 5, 2.5, '#16264a');
        fillRR(c, -6, -17, 12, 5, 2, '#f6d93a');
      });
    } },

  { id: 'cadet', name: 'Skrydžio palydovė', level: 1, cost: { b: 70 }, from: 'Oro uostas',
    note: 'Sagtis prisegta, kylame',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        c.beginPath(); c.moveTo(10, -10); c.quadraticCurveTo(20, -2, 10, 8);
        c.quadraticCurveTo(2, 0, 10, -10); c.closePath(); c.fillStyle = '#e9edf5'; c.fill();
        fillRR(c, -12, -8, 22, 16, 6, '#2e4b8c');
        line(c, 12, -6, 18, 2, '#2e4b8c', 3);
      });
      atHead(ctx, rig, c => {
        fillRR(c, -16, -18, 32, 9, 4, '#f2f4fa');
        c.beginPath(); c.ellipse(0, -18, 15, 6, 0, Math.PI, 0); c.fillStyle = '#f8fafe'; c.fill();
        fillRR(c, -17, -11, 34, 4, 2, '#2e4b8c');
        circle(c, 0, -20, 3.4, '#d8a63a');
      });
    } },

  { id: 'granny', name: 'Senelė', level: 1, cost: { b: 40 }, from: 'Senelės namas',
    note: 'Šiltai ir jaukiai',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        c.save(); c.globalAlpha = .96;
        ell(c, -2, 0, rig.bodyRX * .88, rig.bodyRY * .95, 0); c.fillStyle = '#c98fb4'; c.fill();
        c.restore();
        c.save(); c.globalAlpha = .5;
        for (let i = -2; i <= 2; i++) line(c, i * 8, -8, i * 8 - 3, 9, '#a86e96', 2);
        c.restore();
      });
      atHead(ctx, rig, c => {
        c.beginPath(); c.moveTo(-17, -1); c.quadraticCurveTo(-14, -21, 2, -20);
        c.quadraticCurveTo(16, -19, 15, -2); c.quadraticCurveTo(0, -9, -17, -1); c.closePath();
        c.fillStyle = '#e07a9a'; c.fill();
        c.save(); c.globalAlpha = .8;
        [[-9, -12], [1, -16], [9, -9], [-3, -6]].forEach(p => {
          for (let k = 0; k < 5; k++) circle(c, p[0] + Math.cos(k * 1.26) * 3, p[1] + Math.sin(k * 1.26) * 3, 1.7, '#fff0f5');
          circle(c, p[0], p[1], 1.5, '#ffd35e');
        });
        c.restore();
        /* knot under the chin */
        c.beginPath(); c.moveTo(-16, -2); c.quadraticCurveTo(-22, 4, -13, 7); c.closePath();
        c.fillStyle = '#c9678a'; c.fill();
        /* round glasses */
        c.strokeStyle = '#d8b25e'; c.lineWidth = 1.9;
        c.beginPath(); c.arc(2.5, -3, 6.6, 0, TAU); c.stroke();
        c.beginPath(); c.arc(13, -2.4, 6.4, 0, TAU); c.stroke();
        line(c, 9, -3, 6.5, -3, '#d8b25e', 1.9);
        c.save(); c.globalAlpha = .22; circle(c, 2.5, -3, 6.4, '#fff'); circle(c, 13, -2.4, 6.2, '#fff'); c.restore();
      });
    } },

  { id: 'football', name: 'Futbolininkė', level: 1, cost: { b: 45 }, from: 'Parkas',
    note: 'Sudėtingas kampas',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        c.save(); ell(c, 0, 0, rig.bodyRX * .85, rig.bodyRY * .9, 0); c.clip();
        c.fillStyle = '#e8332a'; c.fillRect(-40, -30, 80, 60);
        c.fillStyle = '#1d2b4a';
        for (let i = -4; i <= 4; i++) c.fillRect(i * 10 - 2.5, -30, 5, 60);
        c.restore();
        c.save(); c.globalAlpha = .9;
        c.fillStyle = '#fff'; c.font = 'bold 11px sans-serif'; c.textAlign = 'center';
        c.fillText('9', 0, 4); c.restore();
      });
      atHead(ctx, rig, c => {
        fillRR(c, -16, -14, 31, 6, 3, '#e8332a');
        fillRR(c, -16, -14, 31, 2.5, 2, '#fff');
      });
    } },

  { id: 'detective', name: 'Detektyvė', level: 1, cost: { b: 110 }, from: 'Londonas',
    note: 'Londono paslaptys',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        c.beginPath(); c.moveTo(14, -12); c.quadraticCurveTo(-16, -14, -22, 12);
        c.quadraticCurveTo(-2, 4, 14, 4); c.closePath();
        c.fillStyle = '#8d6b4a'; c.fill(); c.strokeStyle = 'rgba(40,25,12,.4)'; c.lineWidth = 2; c.stroke();
      });
      atHead(ctx, rig, c => {
        c.beginPath(); c.moveTo(-18, -7); c.quadraticCurveTo(0, -25, 17, -7); c.closePath();
        c.fillStyle = '#9d7c58'; c.fill();
        fillRR(c, -22, -8, 44, 5, 2.5, '#8a6a48');
        c.save(); c.globalAlpha = .45; c.strokeStyle = '#5e452c'; c.lineWidth = 1.2;
        for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 7, -22); c.lineTo(i * 7, -8); c.stroke(); }
        c.beginPath(); c.moveTo(-16, -14); c.lineTo(16, -14); c.stroke();
        c.restore();
        fillEll(c, -19, -14, 6, 8, '#9d7c58');
      });
    } },

  { id: 'queen', name: 'Karalienė', level: 1, cost: { b: 140 }, from: 'Londonas',
    note: 'God save the Lota',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        c.beginPath(); c.moveTo(12, -12); c.quadraticCurveTo(-18, -16, -26, 14);
        c.quadraticCurveTo(-4, 6, 12, 4); c.closePath();
        c.fillStyle = '#b4232f'; c.fill();
        c.save(); c.globalAlpha = .9;
        c.beginPath(); c.moveTo(-26, 14); c.quadraticCurveTo(-14, 8, 0, 6);
        c.lineTo(2, 12); c.quadraticCurveTo(-12, 14, -24, 20); c.closePath();
        c.fillStyle = '#f6f3ee'; c.fill(); c.restore();
      });
      atHead(ctx, rig, c => {
        c.beginPath();
        c.moveTo(-13, -13); c.lineTo(-13, -24); c.lineTo(-6.5, -18); c.lineTo(0, -27);
        c.lineTo(6.5, -18); c.lineTo(13, -24); c.lineTo(13, -13); c.closePath();
        c.fillStyle = '#ffd45e'; c.fill(); c.strokeStyle = '#c9962c'; c.lineWidth = 1.6; c.stroke();
        fillRR(c, -14, -15, 28, 5, 2.5, '#e8b93f');
        circle(c, 0, -25, 2.2, '#ff6b8e'); circle(c, -13, -23, 1.8, '#6fd6ff'); circle(c, 13, -23, 1.8, '#6fd6ff');
      });
    } },

  { id: 'astro', name: 'Astronautė', level: 3, cost: { b: 130, t: 80 },
    from: 'Raketa ir orbita', note: 'Iki žvaigždžių ir dar toliau',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        c.save(); c.globalAlpha = .95;
        ell(c, 0, 0, rig.bodyRX * .9, rig.bodyRY * .95, 0); c.fillStyle = '#eef1f6'; c.fill();
        c.restore();
        fillRR(c, -6, -5, 13, 9, 3, '#b9c4d6');
        circle(c, -2, -1, 1.8, '#ff6b6b'); circle(c, 3, -1, 1.8, '#6bff9a');
        fillRR(c, -22, -9, 9, 18, 4, '#c9d3e2');
      });
      atHead(ctx, rig, c => {
        c.save(); c.globalAlpha = .16;
        circle(c, 3, -1, 23, '#9fe8ff'); c.restore();
        c.strokeStyle = '#eef3fa'; c.lineWidth = 3.4;
        c.beginPath(); c.arc(3, -1, 23, 0, TAU); c.stroke();
        c.save(); c.globalAlpha = .34;
        c.beginPath(); c.arc(3, -1, 18.5, Math.PI * 1.18, Math.PI * 1.52);
        c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); c.restore();
        fillRR(c, -6, 17, 12, 7, 3, '#c9d3e2');
      });
    } },

  { id: 'unicorn', name: 'Miško vienaragė', level: 2, cost: { t: 260 },
    from: 'Tankus miškas', note: 'Slapta Lotos galia',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const cols = ['#ff7b8a', '#ffb84d', '#ffe95c', '#7be08a', '#6fc9ff', '#b48bff'];
        cols.forEach((col, i) => {
          c.save(); c.globalAlpha = .9;
          c.beginPath(); c.moveTo(6 - i * 1.2, -12 + i * 3.6);
          c.quadraticCurveTo(-10, -14 + i * 4 + Math.sin(t * 8 - i) * 2, -24 - i, -6 + i * 3.4 + Math.sin(t * 8 - i * .8) * 3);
          c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round'; c.stroke(); c.restore();
        });
      });
      atHead(ctx, rig, c => {
        c.beginPath(); c.moveTo(-3, -13); c.lineTo(3.5, -13); c.lineTo(0.5, -30); c.closePath();
        c.fillStyle = '#ffd75e'; c.fill(); c.strokeStyle = '#e0a92c'; c.lineWidth = 1.4; c.stroke();
        c.save(); c.globalAlpha = .55;
        for (let i = 0; i < 4; i++) line(c, -3, -16 - i * 4, 3.5, -18 - i * 4, '#fff3c4', 1.4);
        c.restore();
        for (let i = 0; i < 3; i++) {
          const a = t * 3 + i * 2.1;
          circle(c, Math.cos(a) * 20, -18 + Math.sin(a * 1.4) * 8, 1.7, 'rgba(255,255,255,.8)');
        }
      });
    } },

  /* ============================================================
     LEVEL 2 — bought with toys. Softer fabrics, more of them, and
     everything on this shelf moves a little.
  ============================================================ */

  { id: 'ballerina', name: 'Pokylių suknelė', level: 2, cost: { t: 40 },
    from: 'Viešbučio fojė', note: 'Po sietynais, tarp kolonų',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        const sway = Math.sin(t * 4.2) * 0.06;
        c.save(); c.rotate(sway);
        /* three layers of tulle standing out from the waist */
        c.save(); c.globalAlpha = .5; tulle(c, -7, ry * .2, rx * 1.02, ry * .78, 9, '#ffd7e8', t * 2); c.restore();
        c.save(); c.globalAlpha = .72; tulle(c, -7, ry * .16, rx * .84, ry * .62, 8, '#ffeaf3', t * 2 + 1); c.restore();
        c.save(); c.globalAlpha = .9;  tulle(c, -7, ry * .1, rx * .64, ry * .46, 7, '#fff6fa', t * 2 + 2); c.restore();
        c.restore();
        /* satin bodice with crossed laces */
        c.beginPath();
        c.moveTo(14, -ry * .7); c.quadraticCurveTo(-4, -ry * 1.05, -12, -ry * .2);
        c.quadraticCurveTo(-2, ry * .5, 14, ry * .35); c.closePath();
        c.fillStyle = '#e8639a'; c.fill();
        c.save(); c.globalAlpha = .5;
        for (let i = 0; i < 4; i++) line(c, 8 - i * 6, -ry * .75 + i * 2, 2 - i * 6, ry * .25, '#ffd7e8', 1.4);
        c.restore();
        /* rose at the hip */
        for (let k = 0; k < 5; k++) circle(c, -6 + Math.cos(k * 1.26) * 3.2, -2 + Math.sin(k * 1.26) * 3.2, 2.6, '#ff8fb8');
        circle(c, -6, -2, 2.2, '#fff0f5');
      });
      atHead(ctx, rig, c => {
        /* flower crown */
        const buds = [[-12, -13], [-5, -18], [2, -20], [9, -17], [14, -12]];
        buds.forEach((b, i) => {
          for (let k = 0; k < 5; k++)
            circle(c, b[0] + Math.cos(k * 1.26 + i) * 3, b[1] + Math.sin(k * 1.26 + i) * 3, 2.3,
              i % 2 ? '#ffd7e8' : '#ff9fc4');
          circle(c, b[0], b[1], 1.8, '#ffe89a');
        });
        /* ribbon streaming back off the crown */
        flutter(c, -13, -12, 26, 5, '#ff8fb8', 3.2, t, 0.6);
      });
      shoes(ctx, rig, '#ff9fc4', '#e8639a');
    } },

  { id: 'pirate', name: 'Piratė', level: 2, cost: { t: 105 },
    from: 'Nuskendęs laivas', note: 'Lobis — laivo triume',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* long red coat, open at the front */
        c.beginPath();
        c.moveTo(rx * .5, -ry * .8); c.quadraticCurveTo(-rx * .6, -ry, -rx * 1.05, ry * .8);
        c.quadraticCurveTo(-rx * .2, ry * .45, rx * .5, ry * .3); c.closePath();
        c.fillStyle = '#9c2b3a'; c.fill();
        c.strokeStyle = 'rgba(40,10,16,.45)'; c.lineWidth = 2; c.stroke();
        c.save(); c.globalAlpha = .85;
        c.beginPath();
        c.moveTo(-rx * 1.05, ry * .8); c.quadraticCurveTo(-rx * .5, ry * .3, rx * .2, ry * .16);
        c.lineTo(rx * .22, ry * .5); c.quadraticCurveTo(-rx * .5, ry * .62, -rx * .95, ry * 1.02);
        c.closePath(); c.fillStyle = '#e8c15e'; c.fill(); c.restore();
        /* sash + buttons */
        c.save(); c.globalAlpha = .95;
        c.beginPath(); c.moveTo(12, -ry * .6); c.quadraticCurveTo(-2, 0, -8, ry * .9);
        c.strokeStyle = '#e0a03a'; c.lineWidth = 6; c.stroke(); c.restore();
        for (let i = 0; i < 3; i++) circle(c, 6 - i * 7, -ry * .45 + i * 5, 2, '#ffd870');
      });
      atHead(ctx, rig, c => {
        /* tricorn */
        c.beginPath();
        c.moveTo(-20, -8); c.quadraticCurveTo(-14, -26, 2, -25);
        c.quadraticCurveTo(17, -24, 20, -8);
        c.quadraticCurveTo(10, -14, 0, -14); c.quadraticCurveTo(-10, -14, -20, -8);
        c.closePath(); c.fillStyle = '#20222e'; c.fill();
        c.strokeStyle = '#e8c15e'; c.lineWidth = 2; c.stroke();
        fillRR(c, -21, -12, 42, 5, 2.5, '#171825');
        /* skull-and-bone badge */
        circle(c, 0, -18, 4.2, '#f2eee4');
        circle(c, -1.4, -19, 1.1, '#20222e'); circle(c, 1.4, -19, 1.1, '#20222e');
        line(c, -4, -13.5, 4, -13.5, '#f2eee4', 1.8);
        /* feather */
        c.save(); c.translate(16, -20); c.rotate(-0.5 + Math.sin(t * 3) * 0.06);
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -8, 22, -6);
        c.quadraticCurveTo(11, 0, 0, 3); c.closePath(); c.fillStyle = '#e8637a'; c.fill();
        c.restore();
        /* eye patch over the far eye */
        fillRR(c, -2.5, -9.5, 8.5, 8.5, 2.5, '#171825');
        line(c, -3, -9, -13, -12, '#171825', 1.8);
        line(c, 6, -9.5, 12, -13, '#171825', 1.8);
      });
      shoes(ctx, rig, '#3a2a20', '#e8c15e');
    } },

  { id: 'fairy', name: 'Miško fėja', level: 2, cost: { t: 200 },
    from: 'Miškas', note: 'Sparnai tarp paparčių',
    draw(ctx, rig, t) {
      /* wings first — they belong behind her */
      atBody(ctx, rig, c => {
        const flap = Math.sin(t * 9) * 0.22;
        [[-1, -0.55], [1, 0.35]].forEach((w, i) => {
          c.save(); c.translate(-6, -6); c.rotate(w[1] + flap * w[0] * -1);
          c.save(); c.globalAlpha = .48;
          const g = c.createLinearGradient(0, 0, -34, -20);
          g.addColorStop(0, '#bff5ff'); g.addColorStop(0.5, '#dcbcff'); g.addColorStop(1, '#ffd0ee');
          c.beginPath();
          c.moveTo(0, 0); c.quadraticCurveTo(-26, -26, -36, -12);
          c.quadraticCurveTo(-40, 2, -18, 6); c.quadraticCurveTo(-6, 6, 0, 0);
          c.closePath(); c.fillStyle = g; c.fill();
          c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.4; c.stroke();
          c.globalAlpha = .3;
          line(c, -4, -1, -30, -14, '#fff', 1); line(c, -4, 1, -22, 5, '#fff', 1);
          c.restore(); c.restore();
        });
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* petal dress */
        c.save(); c.globalAlpha = .9; tulle(c, -4, ry * .18, rx * .82, ry * .74, 6, '#c8f0d8', t * 1.6); c.restore();
        c.save(); c.globalAlpha = .95; tulle(c, -4, ry * .1, rx * .6, ry * .52, 5, '#eafff2', t * 1.6 + 1); c.restore();
        c.beginPath();
        c.moveTo(13, -ry * .7); c.quadraticCurveTo(-2, -ry, -10, -ry * .1);
        c.quadraticCurveTo(0, ry * .4, 13, ry * .3); c.closePath();
        c.fillStyle = '#7fd6a8'; c.fill();
        sparkle(c, 6, t, -4, 0, rx * .8, ry * .8, 3, '#eafff2');
      });
      atHead(ctx, rig, c => {
        /* dew-drop tiara */
        c.beginPath(); c.moveTo(-13, -12); c.quadraticCurveTo(0, -23, 13, -12);
        c.strokeStyle = '#9be8ff'; c.lineWidth = 2.4; c.stroke();
        [[-9, -15], [0, -19], [9, -15]].forEach((d, i) => {
          circle(c, d[0], d[1] - Math.abs(Math.sin(t * 2 + i)) * 1.4, 2.8, 'rgba(190,240,255,.85)');
          circle(c, d[0] - 0.8, d[1] - 1, 1, '#fff');
        });
        sparkle(c, 5, t, 0, -16, 16, 8, 9, '#dff8ff');
      });
      /* wand in the near front paw */
      const p = (rig.paws || [])[0];
      if (p) {
        ctx.save(); ctx.translate(p.x + 3, p.y - 2); ctx.rotate(-0.85 + Math.sin(t * 3) * 0.08);
        line(ctx, 0, 0, 0, -22, '#f0e3c4', 2.6);
        ctx.translate(0, -24);
        c2star(ctx, 0, 0, 6.2, 2.8, '#ffe36e');
        sparkle(ctx, 4, t, 0, 0, 9, 9, 5, '#fff6c8');
        ctx.restore();
      }
      shoes(ctx, rig, '#7fd6a8', '#eafff2');
    } },

  { id: 'popstar', name: 'Pajūrio žvaigždė', level: 2, cost: { t: 70 },
    from: 'Promenada', note: 'Dainuoja visam pajūriui',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* studded jacket */
        c.beginPath();
        c.moveTo(rx * .55, -ry * .85); c.quadraticCurveTo(-rx * .5, -ry * 1.05, -rx * 1.0, ry * .35);
        c.quadraticCurveTo(-rx * .3, ry * .55, rx * .5, ry * .35); c.closePath();
        c.fillStyle = '#2a2733'; c.fill();
        c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 2; c.stroke();
        /* pink lightning down the back */
        c.save(); c.globalAlpha = .95;
        poly(c, [[-6, -ry * .85], [-14, -1], [-8, -1], [-16, ry * .5], [-2, -3], [-8, -3], [-1, -ry * .8]], '#ff4f9a');
        c.restore();
        c.save(); c.globalAlpha = .8;
        for (let i = 0; i < 7; i++) circle(c, rx * .35 - i * 5, -ry * .8 + i * 2.4, 1.5, '#d8d5e2');
        c.restore();
        /* spiked collar */
        c.save(); c.translate(rx * .5, -ry * .55);
        fillRR(c, -3, -4, 10, 7, 3, '#4a3a52');
        for (let i = 0; i < 3; i++) poly(c, [[-1 + i * 3.4, -4], [1 + i * 3.4, -4], [i * 3.4, -8]], '#e4e0ee');
        c.restore();
      });
      atHead(ctx, rig, c => {
        /* magenta crest */
        c.save();
        for (let i = -3; i <= 3; i++) {
          const h = 16 - Math.abs(i) * 2.6;
          poly(c, [[i * 3.4 - 2, -13], [i * 3.4 + 2, -13], [i * 3.4 + Math.sin(t * 5 + i) * 2, -13 - h]],
            i % 2 ? '#ff4f9a' : '#b46bff');
        }
        c.restore();
        /* star shades */
        c.save(); c.globalAlpha = .95;
        fillRR(c, -3.5, -9.5, 18, 9, 3, '#171825');
        line(c, -3.5, -6, -13, -8.5, '#171825', 2);
        c.globalAlpha = .5; fillRR(c, -2, -8.5, 6.5, 3, 1.5, '#8fd8ff');
        c.restore();
        c2star(c, 15.5, -12.5, 4.4, 2, '#ffe36e');
      });
      shoes(ctx, rig, '#2a2733', '#ff4f9a', '#ff4f9a');
    } },

  { id: 'snow', name: 'Druskos karalienė', level: 3, cost: { b: 70, t: 105 },
    from: 'Druskos kasykla', note: 'Druskos kristalai ant ūsų',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* long ice cape trailing behind */
        c.save(); c.globalAlpha = .62;
        const g = c.createLinearGradient(rx * .4, 0, -rx * 1.6, ry);
        g.addColorStop(0, '#fff0f2'); g.addColorStop(1, 'rgba(230,160,175,.18)');
        c.beginPath();
        c.moveTo(rx * .45, -ry * .85);
        c.quadraticCurveTo(-rx * .7, -ry * .9, -rx * 1.55, ry * 1.1 + Math.sin(t * 3) * 3);
        c.quadraticCurveTo(-rx * .5, ry * .55, rx * .45, ry * .3);
        c.closePath(); c.fillStyle = g; c.fill(); c.restore();
        /* frosted gown */
        c.save(); c.globalAlpha = .93; tulle(c, -5, ry * .16, rx * .86, ry * .7, 8, '#f8dde1', t * 1.2); c.restore();
        c.beginPath();
        c.moveTo(13, -ry * .72); c.quadraticCurveTo(-2, -ry, -11, -ry * .15);
        c.quadraticCurveTo(0, ry * .4, 13, ry * .3); c.closePath();
        c.fillStyle = '#d894a2'; c.fill();
        c.save(); c.globalAlpha = .8;
        for (let i = 0; i < 4; i++) snowflake(c, 6 - i * 8, -ry * .5 + i * 6, 3.2 - i * .3, '#fffafb', t + i);
        c.restore();
        sparkle(c, 7, t, -5, 0, rx, ry, 11, '#fff0f2');
      });
      atHead(ctx, rig, c => {
        /* snowflake crown */
        c.beginPath(); c.moveTo(-14, -11); c.quadraticCurveTo(0, -18, 14, -11);
        c.strokeStyle = '#ffe2e6'; c.lineWidth = 2.6; c.stroke();
        for (let i = -2; i <= 2; i++) {
          const h = 20 - Math.abs(i) * 3.4;
          line(c, i * 6, -13, i * 6, -h, '#fff0f2', 2);
          snowflake(c, i * 6, -h - 1, 3 - Math.abs(i) * .4, '#fffafb', t + i);
        }
        sparkle(c, 4, t, 0, -18, 15, 7, 13, '#fff');
      });
      shoes(ctx, rig, '#d894a2', '#fff0f2', '#ffb8c4');
    } },

  /* ============================================================
     LEVEL 3 — paid for in both treats and toys, in different
     proportions, so no two are earned the same way.
  ============================================================ */

  { id: 'gardener', name: 'Sodininkė', level: 3, cost: { b: 35, t: 60 },
    from: 'Žydintis sodas ir šiltnamiai', note: 'Šiaudinė skrybėlė ir sauja sėklų',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* a canvas apron, tied at the back */
        c.beginPath();
        c.moveTo(14, -ry * .55); c.quadraticCurveTo(-4, -ry * .75, -12, -ry * .05);
        c.quadraticCurveTo(-2, ry * .55, 14, ry * .4); c.closePath();
        c.fillStyle = '#dcc79c'; c.fill();
        c.strokeStyle = 'rgba(90,70,40,.4)'; c.lineWidth = 1.6; c.stroke();
        /* the big front pocket, and what is in it */
        fillRR(c, -9, -2, 19, 13, 3, '#c9b184');
        c.save(); c.globalAlpha = .95;
        line(c, 4, -2, 8, -13, '#4caf6d', 2.4);
        leafy(c, 8, -15, 6, 5, '#5fc47e', '#8fe0a8', 3);
        circle(c, -4, 4, 2, '#8a6a45'); circle(c, 0, 6, 2, '#8a6a45');
        c.restore();
        /* the strap over her shoulder */
        line(c, 13, -ry * .5, 2, -ry * .05, '#c9b184', 3.4);
        /* a sprig of blossom tucked into the tie */
        c.save(); c.translate(-11, -ry * .1); c.rotate(0.5 + Math.sin(t * 1.2) * .06);
        line(c, 0, 0, -9, -7, '#6b4a2c', 2);
        leafy(c, -10, -8, 6, 5, '#ffd6e4', '#fff0f6', 5);
        leafy(c, -4, -4, 5, 4, '#ffd6e4', '#ffeaf2', 9);
        c.restore();
      });
      atHead(ctx, rig, c => {
        /* a wide straw hat with a ribbon round it */
        c.save(); c.rotate(-0.06);
        c.beginPath(); c.ellipse(-1, -13, 23, 7.5, 0, 0, TAU);
        c.fillStyle = '#e0c07a'; c.fill();
        c.strokeStyle = 'rgba(120,90,30,.45)'; c.lineWidth = 1.6; c.stroke();
        c.beginPath(); c.ellipse(-1, -18, 12, 7, 0, Math.PI, 0);
        c.fillStyle = '#eccf8e'; c.fill();
        fillRR(c, -13, -17, 24, 5, 2.5, '#4caf6d');
        c.save(); c.globalAlpha = .4;
        for (let i = -3; i <= 3; i++) line(c, i * 6, -13.5, i * 6 + 2, -20, '#c9a45a', 1.4);
        c.restore();
        /* a daisy on the band */
        for (let k = 0; k < 5; k++)
          circle(c, 9 + Math.cos(k * 1.26) * 3, -15 + Math.sin(k * 1.26) * 3, 2.2, '#fff6ea');
        circle(c, 9, -15, 1.8, '#ffd870');
        c.restore();
      });
      shoes(ctx, rig, '#4caf6d', '#2f7a4c');
    } },

  { id: 'golden', name: 'Auksinė princesė', level: 3, cost: { b: 50, t: 20 },
    from: 'Dirižablio salonas', note: 'Aukso siūlai, tikri',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        const g = c.createLinearGradient(rx * .6, -ry, -rx, ry);
        g.addColorStop(0, '#fff2c0'); g.addColorStop(.45, '#f2c34a'); g.addColorStop(1, '#b8801e');
        c.save(); tulle(c, -6, ry * .18, rx * 1.0, ry * .8, 10, '#b8801e', t * .9); c.restore();
        c.save(); tulle(c, -6, ry * .08, rx * .84, ry * .64, 9, '#f2c34a', t * .9 + 1); c.restore();
        c.beginPath();
        c.moveTo(14, -ry * .75); c.quadraticCurveTo(-2, -ry * 1.05, -12, -ry * .1);
        c.quadraticCurveTo(0, ry * .45, 14, ry * .32); c.closePath();
        c.fillStyle = g; c.fill();
        c.strokeStyle = 'rgba(120,80,10,.4)'; c.lineWidth = 1.6; c.stroke();
        /* jewelled collar */
        c.save(); c.translate(12, -ry * .62);
        for (let i = 0; i < 4; i++) gem(c, -i * 5.6, i * 1.4, 3.2, i % 2 ? '#ff5f7a' : '#7fd8ff');
        c.restore();
        sparkle(c, 6, t, -4, 0, rx * .9, ry * .8, 17, '#fff6cc');
      });
      atHead(ctx, rig, c => {
        c.beginPath();
        c.moveTo(-14, -12); c.lineTo(-14, -25); c.lineTo(-7, -18); c.lineTo(0, -30);
        c.lineTo(7, -18); c.lineTo(14, -25); c.lineTo(14, -12); c.closePath();
        const g = c.createLinearGradient(0, -30, 0, -12);
        g.addColorStop(0, '#fff2c0'); g.addColorStop(1, '#d8a12c');
        c.fillStyle = g; c.fill(); c.strokeStyle = '#a8720e'; c.lineWidth = 1.5; c.stroke();
        fillRR(c, -15, -14, 30, 5.5, 2.5, '#e8b93f');
        gem(c, 0, -27, 3.2, '#ff5f7a'); gem(c, -14, -24, 2.4, '#7fd8ff'); gem(c, 14, -24, 2.4, '#7fd8ff');
        sparkle(c, 5, t, 0, -20, 16, 9, 19, '#fff6cc');
      });
      shoes(ctx, rig, '#f2c34a', '#fff2c0', '#ffd870');
    } },

  { id: 'mermaid', name: 'Undinė', level: 2, cost: { t: 150 },
    from: 'Jūros dugnas', note: 'Uodega vietoj sijono',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* scaled tail-skirt that sweeps out behind */
        const g = c.createLinearGradient(rx * .4, -ry, -rx * 1.4, ry);
        g.addColorStop(0, '#7fe8d8'); g.addColorStop(.5, '#3fa8d8'); g.addColorStop(1, '#8f5fd8');
        c.beginPath();
        c.moveTo(rx * .5, -ry * .5);
        c.quadraticCurveTo(-rx * .5, -ry * .6, -rx * 1.25, ry * .25 + Math.sin(t * 3) * 3);
        c.quadraticCurveTo(-rx * .9, ry * 1.15, -rx * .2, ry * .85);
        c.quadraticCurveTo(rx * .3, ry * .6, rx * .5, ry * .3);
        c.closePath(); c.fillStyle = g; c.fill();
        /* scales */
        c.save(); c.globalAlpha = .35;
        for (let ix = -4; ix <= 1; ix++) for (let iy = -1; iy <= 2; iy++) {
          const sx = ix * 8 + (iy % 2 ? 4 : 0), sy = iy * 6;
          c.beginPath(); c.arc(sx, sy, 4, Math.PI, 0); c.strokeStyle = '#eafaff'; c.lineWidth = 1.2; c.stroke();
        }
        c.restore();
        /* tail fin */
        c.save(); c.translate(-rx * 1.15, ry * .5); c.rotate(Math.sin(t * 3) * .18);
        c.save(); c.globalAlpha = .8;
        poly(c, [[0, 0], [-16, -14], [-10, 2], [-17, 13], [0, 5]], '#7fe8d8');
        c.restore(); c.restore();
        /* shell bodice + pearls */
        c.save(); c.translate(10, -ry * .35);
        [[0, 0], [-9, 3]].forEach(sh => {
          c.save(); c.translate(sh[0], sh[1]);
          c.beginPath(); c.arc(0, 2, 6, Math.PI, 0); c.closePath(); c.fillStyle = '#ffc0d8'; c.fill();
          c.save(); c.globalAlpha = .5;
          for (let k = -2; k <= 2; k++) line(c, 0, 2, k * 2.4, -3.6, '#ff8fb8', 1);
          c.restore(); c.restore();
        });
        c.restore();
        c.save(); c.globalAlpha = .9;
        for (let i = 0; i < 6; i++) circle(c, 12 - i * 4.4, -ry * .62 + i * 1.6, 1.7, '#fff6fa');
        c.restore();
        sparkle(c, 6, t, -8, 0, rx, ry, 23, '#dffaff');
      });
      atHead(ctx, rig, c => {
        /* coral crown */
        c.beginPath(); c.moveTo(-13, -11); c.quadraticCurveTo(0, -17, 13, -11);
        c.strokeStyle = '#ff8fb8'; c.lineWidth = 2.4; c.stroke();
        [[-10, -14, 6], [-3, -16, 9], [4, -16, 8], [11, -13, 6]].forEach((b, i) => {
          c.save(); c.translate(b[0], b[1]);
          line(c, 0, 0, Math.sin(t + i) * 1.5, -b[2], '#ff9fc4', 2.2);
          circle(c, Math.sin(t + i) * 1.5, -b[2], 2.4, i % 2 ? '#fff6fa' : '#7fe8d8');
          c.restore();
        });
        /* bubbles drifting up */
        for (let i = 0; i < 4; i++) {
          const ph = (t * .5 + i * .27) % 1;
          c.save(); c.globalAlpha = (1 - ph) * .55;
          c.beginPath(); c.arc(18 + Math.sin(ph * 7 + i) * 4, 2 - ph * 34, 1.4 + i * .5, 0, TAU);
          c.strokeStyle = '#eafaff'; c.lineWidth = 1.1; c.stroke(); c.restore();
        }
      });
      shoes(ctx, rig, '#3fa8d8', '#7fe8d8', '#7fe8d8');
    } },

  { id: 'phoenix', name: 'Ugnies paukštė', level: 3, cost: { b: 95, t: 45 },
    from: 'Raketinė kuprinė', note: 'Plunksnos, kurios dega',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* flame plume streaming behind */
        for (let i = 0; i < 7; i++) {
          const col = ['#fff0a8', '#ffd34a', '#ff9b2e', '#ff6a2a', '#e8412a', '#ff8f3a', '#ffc23a'][i];
          c.save(); c.globalAlpha = .82;
          c.beginPath();
          c.moveTo(rx * .2 - i * 1.2, -ry * .7 + i * 3.4);
          c.quadraticCurveTo(-rx * .7, -ry * .8 + i * 4 + Math.sin(t * 7 - i) * 4,
                             -rx * (1.35 + i * .05), -ry * .1 + i * 3.6 + Math.sin(t * 7 - i * .8) * 5);
          c.strokeStyle = col; c.lineWidth = 5.2; c.lineCap = 'round'; c.stroke();
          c.restore();
        }
        /* feathered breastplate */
        const g = c.createLinearGradient(rx * .6, -ry, -rx * .4, ry);
        g.addColorStop(0, '#ffe17a'); g.addColorStop(.5, '#ff8f2e'); g.addColorStop(1, '#d8331e');
        c.beginPath();
        c.moveTo(15, -ry * .75); c.quadraticCurveTo(-2, -ry * 1.05, -12, -ry * .1);
        c.quadraticCurveTo(0, ry * .5, 15, ry * .34); c.closePath();
        c.fillStyle = g; c.fill();
        c.save(); c.globalAlpha = .45;
        for (let i = 0; i < 4; i++) {
          c.beginPath(); c.arc(9 - i * 7, -ry * .3 + i * 3, 5.5, Math.PI, 0);
          c.strokeStyle = '#fff0a8'; c.lineWidth = 1.4; c.stroke();
        }
        c.restore();
        sparkle(c, 7, t, -10, -2, rx, ry, 29, '#ffe9a8');
      });
      atHead(ctx, rig, c => {
        /* flame crest */
        for (let i = -2; i <= 2; i++) {
          const h = 22 - Math.abs(i) * 4.5 + Math.sin(t * 8 + i) * 2.5;
          c.beginPath();
          c.moveTo(i * 5 - 3, -12); c.quadraticCurveTo(i * 5 + Math.sin(t * 6 + i) * 3, -12 - h * .6, i * 5, -12 - h);
          c.quadraticCurveTo(i * 5 + 3, -12 - h * .5, i * 5 + 3, -12);
          c.closePath();
          c.fillStyle = ['#ff6a2a', '#ff9b2e', '#ffd34a', '#ff9b2e', '#ff6a2a'][i + 2]; c.fill();
        }
        /* golden brow band */
        c.beginPath(); c.moveTo(-14, -10.5); c.quadraticCurveTo(0, -16, 14, -10.5);
        c.strokeStyle = '#ffd34a'; c.lineWidth = 3; c.stroke();
        gem(c, 0, -14.5, 3, '#ff4f4a');
        sparkle(c, 4, t, 0, -20, 14, 10, 31, '#ffe9a8');
      });
      shoes(ctx, rig, '#d8331e', '#ffd34a', '#ff8f2e');
    } },

  { id: 'sorceress', name: 'Žvaigždžių burtininkė', level: 3, cost: { b: 105, t: 160 },
    from: 'Kosminė stotis', note: 'Naktis, susiūta į apsiaustą',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        const g = c.createLinearGradient(rx * .5, -ry, -rx * 1.3, ry);
        g.addColorStop(0, '#4a3a9c'); g.addColorStop(.55, '#2b2166'); g.addColorStop(1, '#150f3a');
        c.beginPath();
        c.moveTo(rx * .55, -ry * .85);
        c.quadraticCurveTo(-rx * .6, -ry * 1.0, -rx * 1.35, ry * .95 + Math.sin(t * 2.4) * 3);
        c.quadraticCurveTo(-rx * .4, ry * .6, rx * .5, ry * .34);
        c.closePath(); c.fillStyle = g; c.fill();
        c.strokeStyle = 'rgba(180,160,255,.35)'; c.lineWidth = 1.8; c.stroke();
        /* constellation stitched into the cloak */
        const pts = [[-8, -6], [-18, 2], [-27, -4], [-34, 6], [-20, 10], [-11, 6]];
        c.save(); c.globalAlpha = .55; c.strokeStyle = '#bfa8ff'; c.lineWidth = 1;
        c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); c.restore();
        pts.forEach((q, i) => c2star(c, q[0], q[1], 2.6 + (i % 2), 1.1,
          'rgba(255,245,200,' + (0.55 + Math.sin(t * 3 + i) * 0.35) + ')'));
        /* moon clasp */
        c.save(); c.translate(12, -ry * .6);
        circle(c, 0, 0, 4.4, '#ffe9a8');
        c.globalCompositeOperation = 'destination-out'; circle(c, 2.4, -1.4, 3.8, '#000');
        c.restore();
        sparkle(c, 6, t, -14, 0, rx, ry, 37, '#dcc8ff');
      });
      atHead(ctx, rig, c => {
        /* tall pointed hat, curling at the tip */
        c.beginPath();
        c.moveTo(-16, -11); c.quadraticCurveTo(-9, -30, -2, -38);
        c.quadraticCurveTo(6, -44, 10, -37); c.quadraticCurveTo(9, -30, 15, -11);
        c.closePath();
        const g = c.createLinearGradient(-16, -40, 16, -11);
        g.addColorStop(0, '#4a3a9c'); g.addColorStop(1, '#221a52');
        c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(180,160,255,.4)'; c.lineWidth = 1.6; c.stroke();
        fillRR(c, -19, -13, 38, 5.5, 2.6, '#2b2166');
        c.save(); c.globalAlpha = .9;
        fillRR(c, -18, -14.5, 36, 3, 1.5, '#bfa8ff'); c.restore();
        [[-6, -30], [2, -35], [-9, -21], [6, -24]].forEach((q, i) =>
          c2star(c, q[0], q[1], 2.6, 1.1, 'rgba(255,245,200,' + (0.5 + Math.sin(t * 3 + i * 1.7) * 0.4) + ')'));
        /* motes orbiting her head */
        for (let i = 0; i < 4; i++) {
          const a = t * 1.6 + i * 1.57;
          c2star(c, Math.cos(a) * 24, -14 + Math.sin(a * 1.3) * 9, 2.2, 1, 'rgba(200,180,255,.85)');
        }
      });
      shoes(ctx, rig, '#2b2166', '#bfa8ff', '#8f7fe8');
    } },

  { id: 'crystal', name: 'Krištolo šokėja', level: 3, cost: { b: 260, t: 245 },
    from: 'Mėnulis', note: 'Suknelė, iškalta iš šviesos',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* the gown is built out of facets, each catching a different light */
        c.save(); c.globalAlpha = .9;
        for (let i = 0; i < 11; i++) {
          const a = Math.PI * 0.15 + (i / 11) * Math.PI * 1.7;
          const r1 = rx * .28, r2 = rx * (.95 + Math.sin(i * 1.7) * .1);
          const hue = (200 + i * 9 + Math.sin(t * 1.6 + i) * 22) % 360;
          poly(c, [
            [-5 + Math.cos(a) * r1, ry * .1 + Math.sin(a) * r1 * .8],
            [-5 + Math.cos(a - .16) * r2, ry * .1 + Math.sin(a - .16) * r2 * .85],
            [-5 + Math.cos(a + .16) * r2, ry * .1 + Math.sin(a + .16) * r2 * .85]
          ], 'hsla(' + hue.toFixed(0) + ',72%,' + (72 + (i % 3) * 7) + '%,.85)');
        }
        c.restore();
        c.save(); c.globalAlpha = .55; c.strokeStyle = '#fff'; c.lineWidth = .9;
        for (let i = 0; i < 11; i++) {
          const a = Math.PI * 0.15 + (i / 11) * Math.PI * 1.7;
          line(c, -5, ry * .1, -5 + Math.cos(a) * rx * .95, ry * .1 + Math.sin(a) * rx * .8, '#fff', .9);
        }
        c.restore();
        /* bodice */
        c.beginPath();
        c.moveTo(14, -ry * .75); c.quadraticCurveTo(-2, -ry * 1.05, -11, -ry * .12);
        c.quadraticCurveTo(0, ry * .4, 14, ry * .3); c.closePath();
        c.fillStyle = 'rgba(235,248,255,.92)'; c.fill();
        c.strokeStyle = 'rgba(160,210,255,.7)'; c.lineWidth = 1.4; c.stroke();
        for (let i = 0; i < 4; i++) gem(c, 10 - i * 6, -ry * .55 + i * 3.4, 2.8,
          ['#9be8ff', '#ffb0e8', '#c8b0ff', '#b0ffd8'][i]);
        sparkle(c, 9, t, -6, 0, rx, ry, 41, '#fff');
      });
      atHead(ctx, rig, c => {
        /* crystal tiara */
        for (let i = -2; i <= 2; i++) {
          const h = 21 - Math.abs(i) * 4;
          poly(c, [[i * 6 - 3.2, -12], [i * 6 + 3.2, -12], [i * 6, -12 - h]], 'rgba(220,245,255,.9)');
          c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = .9; c.stroke();
        }
        c.beginPath(); c.moveTo(-15, -11); c.quadraticCurveTo(0, -15.5, 15, -11);
        c.strokeStyle = '#dff4ff'; c.lineWidth = 3; c.stroke();
        gem(c, 0, -34, 3.6, '#9be8ff');
        sparkle(c, 7, t, 0, -20, 17, 11, 43, '#fff');
      });
      shoes(ctx, rig, 'rgba(226,244,255,.95)', '#9be8ff', '#bfe8ff');
    } },

  /* ============================================================
     LEVEL 4 — the boss prize. Not for sale at any price: beating
     the boss hands both of these over at once, so the player picks
     the dress or the tailcoat. They share one rainbow.
  ============================================================ */

  { id: 'rainbow', name: 'Vaivorykštės suknelė', level: 4, cost: null,
    from: 'Boso prizas', note: 'Už Didįjį pabėgimą',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* the train sweeps out behind her */
        c.save(); c.globalAlpha = .55;
        c.beginPath();
        c.moveTo(rx * .3, -ry * .3);
        c.quadraticCurveTo(-rx * .6, -ry * .5, -rx * 1.6, ry * .8 + Math.sin(t * 2.6) * 4);
        c.quadraticCurveTo(-rx * 1.1, ry * 1.7, -rx * .2, ry * 1.4);
        c.quadraticCurveTo(rx * .2, ry * 1.0, rx * .35, ry * .4);
        c.closePath();
        c.fillStyle = rainbowLin(c, rx * .3, -ry, -rx * 1.6, ry, t, .9); c.fill();
        c.restore();
        /* the skirt itself, scalloped and shimmering */
        c.save(); c.globalAlpha = .95;
        c.beginPath();
        for (let k = 0; k <= 44; k++) {
          const a = (k / 44) * TAU;
          const w = 1 + Math.cos(a * 9 + t * 2) * .09;
          const x = -6 + Math.cos(a) * rx * .96 * w, y = ry * .78 + Math.sin(a) * ry * .92 * w;
          if (k === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.closePath();
        c.fillStyle = rainbowLin(c, -rx, -ry, rx, ry, t + 1.4, 1); c.fill();
        c.restore();
        /* a veil of white tulle over it, so the colour stays soft */
        c.save(); c.globalAlpha = .34;
        tulle(c, -6, ry * .76, rx * .78, ry * .74, 8, '#fff', t * 2);
        c.restore();
        /* pearl bodice, cut close so it does not read as a lump */
        c.beginPath();
        c.moveTo(rx * .56, -ry * .68);
        c.quadraticCurveTo(rx * .02, -ry * .95, -rx * .3, -ry * .1);
        c.quadraticCurveTo(rx * .05, ry * .3, rx * .5, ry * .22);
        c.closePath();
        c.fillStyle = '#fbf7ff'; c.fill();
        c.strokeStyle = 'rgba(190,175,225,.7)'; c.lineWidth = 1.3; c.stroke();
        /* rainbow sash across it */
        c.save(); c.globalAlpha = .95;
        c.beginPath();
        c.moveTo(rx * .52, -ry * .55); c.quadraticCurveTo(rx * .1, -ry * .05, -rx * .26, ry * .12);
        c.strokeStyle = rainbowLin(c, rx * .5, -ry, -rx * .3, ry, t + .8, 1); c.lineWidth = 4.2; c.stroke();
        c.restore();
        sparkle(c, 9, t, -6, ry * .6, rx * .95, ry * .85, 51);
      });
      atHead(ctx, rig, c => {
        /* the hat sits on top of the skull — her face stays visible */
        c.save();
        /* gauzy veil off the back of the brim, drawn first so it hangs behind */
        c.save(); c.globalAlpha = .42;
        c.beginPath();
        c.moveTo(-19, -15);
        c.quadraticCurveTo(-31, -9 + Math.sin(t * 3) * 4, -37, 5 + Math.sin(t * 3 + 1) * 5);
        c.quadraticCurveTo(-26, 1, -17, -10);
        c.closePath(); c.fillStyle = rainbowLin(c, -37, 5, -17, -15, t + 3, .85); c.fill();
        c.restore();
        /* crown */
        c.beginPath();
        c.moveTo(-12, -16); c.quadraticCurveTo(-11, -29, -1, -30);
        c.quadraticCurveTo(10, -31, 11, -16);
        c.closePath(); c.fillStyle = '#fbf7ff'; c.fill();
        c.strokeStyle = 'rgba(190,180,220,.6)'; c.lineWidth = 1.3; c.stroke();
        /* rainbow band round the crown */
        c.save(); c.beginPath(); rr(c, -12.5, -21, 24, 5, 2.4);
        c.fillStyle = rainbowLin(c, -12, 0, 12, 0, t + 1, 1); c.fill(); c.restore();
        /* wide upturned brim */
        c.beginPath(); c.ellipse(-1, -15, 22, 5.8, -0.06, 0, TAU);
        c.fillStyle = rainbowLin(c, -23, -15, 21, -15, t + 2, .95); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.stroke();
        c.save(); c.globalAlpha = .32;
        c.beginPath(); c.ellipse(-1, -16.4, 18, 4, -0.06, 0, TAU); c.fillStyle = '#fff'; c.fill();
        c.restore();
        /* the bloom pinned to the band */
        c.save(); c.translate(-9, -22);
        for (let k = 0; k < 6; k++) {
          const a = k * (TAU / 6) + t * .5;
          fillEll(c, Math.cos(a) * 3.6, Math.sin(a) * 3.6, 3.1, 2.1,
            'hsla(' + ((k * 60 + t * 46) % 360) + ',90%,74%,.95)', a);
        }
        circle(c, 0, 0, 2.3, '#fff6d8');
        c.restore();
        c.restore();
        sparkle(c, 6, t, -1, -22, 22, 11, 53);
      });
      /* iridescent booties and one long glove */
      shoes(ctx, rig, '#fdf9ff', '#ffc4ee', '#ffb0e8');
      (rig.paws || []).forEach((p, i) => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = .42;
        ctx.beginPath();
        ctx.moveTo(-5.8, -3); ctx.quadraticCurveTo(-6.8, 2, -4.2, 3.4);
        ctx.quadraticCurveTo(1, 5.2, 5.6, 2.8); ctx.quadraticCurveTo(7.4, 1.4, 6.2, -2.2);
        ctx.quadraticCurveTo(0.4, -4.8, -5.8, -3); ctx.closePath();
        ctx.fillStyle = rainbowLin(ctx, -7, 0, 7, 0, t + i * .6, 1); ctx.fill();
        ctx.restore();
      });
      glove(ctx, rig, '#fff', '#fdf9ff', t);
      const p0 = (rig.paws || [])[0];
      if (p0) {
        ctx.save(); ctx.translate(p0.x, p0.y); ctx.globalAlpha = .6;
        fillRR(ctx, -4.8, -14.8, 9.6, 3.8, 1.9, rainbowLin(ctx, -5, 0, 5, 0, t, 1));
        ctx.restore();
      }
    } },

  { id: 'tailcoat', name: 'Vaivorykštės frakas', level: 4, cost: null,
    from: 'Boso prizas', note: 'Už Didįjį pabėgimą',
    draw(ctx, rig, t) {
      atBody(ctx, rig, c => {
        const rx = rig.bodyRX, ry = rig.bodyRY;
        /* the two tails, split and flying */
        [[-0.05, 1.0], [0.12, 0.86]].forEach((tl, i) => {
          c.save(); c.rotate(tl[0] + Math.sin(t * 3 + i) * .04);
          c.beginPath();
          c.moveTo(rx * .3, -ry * .35);
          c.quadraticCurveTo(-rx * .7, -ry * .5, -rx * 1.4 * tl[1], ry * (.45 + i * .4));
          c.quadraticCurveTo(-rx * .6, ry * (.75 + i * .15), rx * .3, ry * .3);
          c.closePath(); c.fillStyle = i ? '#171528' : '#252340'; c.fill();
          c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.4; c.stroke();
          c.restore();
        });
        /* jacket body */
        c.beginPath();
        c.moveTo(rx * .6, -ry * .82); c.quadraticCurveTo(-rx * .5, -ry * 1.02, -rx * .92, ry * .42);
        c.quadraticCurveTo(-rx * .2, ry * .55, rx * .5, ry * .34); c.closePath();
        c.fillStyle = '#201e33'; c.fill();
        c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.8; c.stroke();
        /* white shirt front, then the iridescent lapels folded over it */
        c.beginPath();
        c.moveTo(rx * .6, -ry * .72); c.quadraticCurveTo(rx * .3, -ry * .1, rx * .26, ry * .3);
        c.lineTo(rx * .56, ry * .26); c.quadraticCurveTo(rx * .62, -ry * .2, rx * .66, -ry * .66);
        c.closePath(); c.fillStyle = '#fbf7ff'; c.fill();
        c.save();
        c.beginPath();
        c.moveTo(rx * .58, -ry * .78); c.quadraticCurveTo(rx * .16, -ry * .3, rx * .1, ry * .3);
        c.lineTo(rx * .3, ry * .28); c.quadraticCurveTo(rx * .38, -ry * .24, rx * .64, -ry * .68);
        c.closePath();
        c.fillStyle = rainbowLin(c, rx * .66, -ry, 0, ry, t, .95); c.fill();
        c.restore();
        for (let i = 0; i < 3; i++) circle(c, rx * .42 - i * 3, -ry * .05 + i * 4.4, 1.3, '#c8c2dd');
        sparkle(c, 6, t, 0, 0, rx * .9, ry * .8, 61);
      });
      atHead(ctx, rig, c => {
        /* bow tie, under the beard where a collar would sit */
        c.save(); c.translate(3, 16);
        poly(c, [[-1.4, 0], [-9, -5], [-9, 5]], rainbowLin(c, -9, 0, 9, 0, t + .6, 1));
        poly(c, [[1.4, 0], [9, -5], [9, 5]], rainbowLin(c, -9, 0, 9, 0, t + .6, 1));
        circle(c, 0, 0, 2.2, '#fbf7ff');
        c.restore();
        /* top hat */
        c.save(); c.translate(-1, -14); c.rotate(-0.05);
        fillRR(c, -12, -21, 24, 21, 3, '#201e33');
        c.beginPath(); c.ellipse(0, -21, 12, 3.8, 0, 0, TAU);
        c.fillStyle = '#2b2842'; c.fill();
        c.save(); c.globalAlpha = .22; fillRR(c, -9, -19, 3.6, 13, 1.8, '#fff'); c.restore();
        c.beginPath(); rr(c, -12.4, -7.5, 24.8, 5.6, 2);
        c.fillStyle = rainbowLin(c, -12, 0, 12, 0, t + 1, 1); c.fill();
        c.restore();
        c.beginPath(); c.ellipse(-1, -13.5, 19, 5.4, -0.05, 0, TAU);
        c.fillStyle = '#191728'; c.fill();
        c.strokeStyle = 'rgba(255,255,255,.24)'; c.lineWidth = 1.3; c.stroke();
        sparkle(c, 4, t, -1, -26, 15, 9, 63);
      });
      shoes(ctx, rig, '#1d1b2e', '#e8e4f4', '#b0e8ff');
      (rig.paws || []).forEach((p, i) => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = .5;
        fillRR(ctx, -6.2, 2.4, 12.8, 2.6, 1.3, rainbowLin(ctx, -6, 0, 7, 0, t + i * .5, 1));
        ctx.restore();
      });
      /* the cane, tucked into the near front paw */
      const p = (rig.paws || [])[0];
      if (p) {
        ctx.save(); ctx.translate(p.x + 5, p.y - 2); ctx.rotate(0.3 + Math.sin(t * 3) * .05);
        line(ctx, 0, -19, 0, 12, '#2b2033', 3.2);
        ctx.save(); ctx.globalAlpha = .45; line(ctx, -1, -15, -1, 8, '#7a6a88', 1.1); ctx.restore();
        fillRR(ctx, -2.2, 10, 4.6, 3.2, 1.5, '#c8c2dd');
        circle(ctx, 0, -21, 4, '#fbf7ff');
        ctx.save(); ctx.globalAlpha = .85;
        circle(ctx, 0, -21, 3, rainbowLin(ctx, -4, -25, 4, -17, t, 1)); ctx.restore();
        sparkle(ctx, 3, t, 0, -21, 6, 6, 67);
        ctx.restore();
      }
    } }
];
const SKIN_MAP = {};
SKINS.forEach(s => { SKIN_MAP[s.id] = s; });
