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

const SKINS = [
  { id: 'classic', name: 'Lota', price: 0, note: 'Tokia, kokia yra', draw: null },

  { id: 'pilot', name: 'Pilotė', price: 25, note: 'Skrydis į Londoną',
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

  { id: 'driver', name: 'Autobuso vairuotoja', price: 30, note: 'Kitas sustojimas — parkas',
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

  { id: 'cadet', name: 'Kadetė', price: 40, note: 'Pasiruošusi nuotykiui',
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

  { id: 'granny', name: 'Senelė', price: 45, note: 'Šiltai ir jaukiai',
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

  { id: 'football', name: 'Futbolininkė', price: 55, note: 'Sudėtingas kampas',
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

  { id: 'detective', name: 'Detektyvė', price: 70, note: 'Londono paslaptys',
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

  { id: 'queen', name: 'Karalienė', price: 85, note: 'God save the Lota',
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

  { id: 'astro', name: 'Astronautė', price: 110, note: 'Iki žvaigždžių',
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

  { id: 'unicorn', name: 'Vienaragė', price: 140, note: 'Slapta Lotos galia',
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
    } }
];
const SKIN_MAP = {};
SKINS.forEach(s => { SKIN_MAP[s.id] = s; });
