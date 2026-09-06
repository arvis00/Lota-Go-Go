'use strict';
/* ---------------------------------------------------------------
   rooms.js — one home page per level, and the Premium page past them

   The lobby used to be four copies of the same violet living room with
   a different number painted on the wall. It is now four different
   places, and each one is the place its level starts from — or, for the
   boss level, the place it is trying to get out of:

     1 · Namai        the night before the trip: a packed case, a lead
                      on the hook, London pinned to the wall
     2 · Viešbutis    a suite over the evening sea, sand on the boards,
                      the pines of the forest on the far headland
     3 · Observatorija an attic under glass: telescope, orrery, the moon
     4 · Veterinaras  the waiting room. Tiles, a strip light, a carrier
                      with its door open, and somebody behind the glass

   Past the last level there is a fifth page that is not a room at all:
   Premium is drawn on paper, in crayon, because that is what is on the
   other side of the book.

   Every room draws the place, then hands `stage()` the few things all
   five share — where she sits, the mat under her, the number on the
   wall and the vignette — so the pages read as one game with four
   moods rather than four unrelated screens.
----------------------------------------------------------------*/

const Rooms = {

  /* ================= the frame around all of them ================= */

  draw(G, level, locked) {
    const fn = [this.home, this.hotel, this.observatory, this.vet][level - 1] || this.home;
    const spec = fn.call(this, G.ctx, G.VW, G.VH, G.t, G) || {};
    this.stage(G, spec, locked, level);
  },

  /** her corner of whatever the place is: the mat, the number, and her */
  stage(G, spec, locked, level) {
    const ctx = G.ctx, VW = G.VW, VH = G.VH, t = G.t;
    const floorY = spec.floorY == null ? VH * 0.56 : spec.floorY;
    const fx = VW * G.lobbyFocus, side = G.lobbyFocus < 0.45;
    const sz = side ? G.lobbySize : 1;
    const matR = side ? VW * 0.24 * sz : VW * 0.3;

    /* the mat. Every room has one, and no two are the same thing: a rug,
       a beach towel, a star chart, a scrubbed-down clinic mat. */
    this.mat(ctx, fx, floorY + 46, matR, 40, spec.mat || ['#8a4a63', '#c96f8a'], spec.matKind, t);

    /* the level's number, painted on the wall above her */
    ctx.save(); ctx.globalAlpha = spec.numAlpha == null ? 0.12 : spec.numAlpha;
    ctx.fillStyle = spec.numCol || '#fff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 ' + Math.round(VH * 0.3 * sz) + 'px system-ui, sans-serif';
    ctx.fillText(String(level), fx, floorY - VH * 0.13);
    ctx.restore();

    if (!locked) {
      const cycle = (t * 0.5) % 4;
      drawLota(ctx, fx, floorY + 24, {
        state: 'sit', t: t, skin: Save.data.skin, scale: 1.42 * sz,
        face: spec.face || 'calm', paw: cycle > 2.4 && cycle < 3.4,
        tilt: Math.sin(t * 0.8) * 0.13
      });
      /* what is on her mind, drifting up: hearts at home, bubbles by the
         sea, stars under the dome, and nothing at all at the vet's */
      const mood = spec.mood == null ? 'heart' : spec.mood;
      if (mood) for (let i = 0; i < 3; i++) {
        const ph = (t * 0.35 + i * 0.33) % 1;
        ctx.save();
        ctx.globalAlpha = Math.sin(ph * Math.PI) * (spec.moodA || 0.55);
        const hx = fx + 48 * sz + Math.sin(ph * 6 + i) * 12, hy = floorY - 60 * sz - ph * 130;
        ctx.translate(hx, hy);
        this.mote(ctx, mood, spec.moodCol, t, i);
        ctx.restore();
      }
    } else {
      /* an empty mat, with her collar left on it */
      ctx.save(); ctx.globalAlpha = .8;
      ctx.beginPath(); ctx.ellipse(fx, floorY + 40, 26, 9, -0.1, 0, TAU);
      ctx.strokeStyle = spec.mat ? spec.mat[0] : '#8a4a63'; ctx.lineWidth = 7; ctx.stroke();
      circle(ctx, fx + 2, floorY + 49, 4.4, '#c9962c');
      ctx.restore();
    }

    const vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VH);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, spec.vignette || 'rgba(8,4,16,.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  },

  /** one drifting thought */
  mote(ctx, kind, col, t, i) {
    if (kind === 'heart') {
      ctx.scale(1.1, 1.1);
      ctx.beginPath();
      ctx.moveTo(0, 4); ctx.bezierCurveTo(-7, -3, -3, -9, 0, -4);
      ctx.bezierCurveTo(3, -9, 7, -3, 0, 4);
      ctx.fillStyle = col || '#ff8fb0'; ctx.fill();
    } else if (kind === 'bubble') {
      const r = 5 + (i % 3) * 2.4;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU);
      ctx.strokeStyle = col || '#bff0ff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.globalAlpha *= .7;
      circle(ctx, -r * .35, -r * .35, r * .28, '#fff'); ctx.restore();
    } else if (kind === 'star') {
      ctx.rotate(t * 0.9 + i);
      const pts = [];
      for (let k = 0; k < 10; k++) {
        const a = k * Math.PI / 5 - Math.PI / 2, rr0 = k % 2 ? 3.2 : 8;
        pts.push([Math.cos(a) * rr0, Math.sin(a) * rr0]);
      }
      poly(ctx, pts, col || '#ffe89a');
    }
  },

  /** the thing she sits on — the one bit of softness each place is allowed */
  mat(ctx, x, y, rx, ry, cols, kind, t) {
    if (kind === 'towel') {
      /* a beach towel, laid out flat and striped */
      const w = rx * 1.34, h = ry * 0.9;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.035);
      ctx.save(); ctx.globalAlpha = .22; fillEll(ctx, 2, h * 0.4, w * 0.5, h * 0.3, '#000'); ctx.restore();
      fillRR(ctx, -w / 2, -h / 2, w, h, 9, cols[0]);
      ctx.save();
      rr(ctx, -w / 2, -h / 2, w, h, 9); ctx.clip();
      for (let i = 0; i < 7; i++)
        fillRR(ctx, -w / 2 + i * (w / 6.5), -h / 2, w / 15, h, 0, cols[1]);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .45;
      rr(ctx, -w / 2 + 5, -h / 2 + 4, w - 10, h - 8, 6);
      ctx.strokeStyle = cols[1]; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      ctx.restore();
      return;
    }
    if (kind === 'chart') {
      /* a star chart, unrolled and walked on */
      ctx.save(); ctx.translate(x, y);
      fillEll(ctx, 0, 0, rx, ry, cols[0]);
      ctx.save(); ell(ctx, 0, 0, rx, ry); ctx.clip();
      ctx.globalAlpha = .55;
      for (let i = 0; i < 26; i++) {
        const r = makeRng(i * 31 + 9);
        circle(ctx, (r() - .5) * rx * 2, (r() - .5) * ry * 2, 1 + r() * 1.8, cols[1]);
      }
      ctx.globalAlpha = .28;
      for (let i = 0; i < 5; i++) {
        const r = makeRng(i * 77 + 4);
        line(ctx, (r() - .5) * rx * 2, (r() - .5) * ry * 2,
                  (r() - .5) * rx * 2, (r() - .5) * ry * 2, cols[1], 1.4);
      }
      ctx.restore(); ctx.restore();
      return;
    }
    if (kind === 'clinic') {
      /* a rubber mat, wiped down twice a day */
      ctx.save(); ctx.translate(x, y);
      fillRR(ctx, -rx, -ry * 0.5, rx * 2, ry, 14, cols[0]);
      ctx.save(); ctx.globalAlpha = .5;
      rr(ctx, -rx + 8, -ry * 0.5 + 6, rx * 2 - 16, ry - 12, 10);
      ctx.strokeStyle = cols[1]; ctx.lineWidth = 2; ctx.setLineDash([7, 7]); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      ctx.restore();
      return;
    }
    fillEll(ctx, x, y, rx, ry, cols[0]);
    ctx.save(); ctx.globalAlpha = .5;
    fillEll(ctx, x, y, rx * 0.8, ry * 0.75, cols[1]); ctx.restore();
  },

  /** the shelf every room keeps, carrying whatever that level pays in */
  shelf(ctx, x, y, w, t, level, wood) {
    fillRR(ctx, x, y, w, 12, 4, wood || '#8a6440');
    ctx.save(); ctx.globalAlpha = .3;
    fillRR(ctx, x + 4, y + 12, w - 8, 5, 2, '#000'); ctx.restore();
    const picks = Levels.get(level).picks;
    if (level === 4) {
      /* nothing is collected here — the prize sits on it instead */
      for (let i = 0; i < 3; i++) {
        const a = t * 0.7 + i * 2.1;
        ctx.save(); ctx.globalAlpha = .9;
        fillEll(ctx, x + 18 + i * 34, y - 14 + Math.sin(a) * 3, 8, 5,
          'hsla(' + ((i * 90 + t * 46) % 360) + ',90%,72%,1)', a * .3);
        ctx.restore();
      }
      return;
    }
    for (let i = 0; i < 3; i++) {
      const bx = x + 18 + i * 34, by = y - 12;
      const toy = picks === 't' || (picks === 'bt' && i % 2 === 1);
      if (toy) Levels.toyBall(ctx, bx, by - 2, 11, t, i);
      else boneIcon(ctx, bx, by, 0.72, t);
    }
  },

  /* =================================================================
     1 · NAMAI — the night before she leaves
  ================================================================= */
  home(ctx, VW, VH, t, G) {
    const floorY = VH * 0.56;
    /* wall: the same violet paw paper the game has always had here */
    ctx.fillStyle = '#3a2b56'; ctx.fillRect(0, 0, VW, floorY + 2);
    ctx.save(); ctx.globalAlpha = .3;
    for (let x = 0; x < VW; x += 56) for (let y = 0; y < floorY; y += 60) {
      ctx.save(); ctx.translate(x + ((y / 60) % 2) * 28, y);
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.quadraticCurveTo(9, -7, 18, 8);
      ctx.quadraticCurveTo(9, 4, 0, 8); ctx.fillStyle = '#4d3a70'; ctx.fill(); ctx.restore();
    }
    ctx.restore();

    /* the window, and the night behind it */
    const wx = VW * 0.70, wy = VH * 0.12, ww = VW * 0.19, wh = VH * 0.28;
    fillRR(ctx, wx, wy, ww, wh, 10, '#c9962c');
    ctx.save(); rr(ctx, wx + 8, wy + 8, ww - 16, wh - 16, 6); ctx.clip();
    const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
    g.addColorStop(0, '#1d2b55'); g.addColorStop(1, '#4a3a7a');
    ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
    circle(ctx, wx + ww * 0.7, wy + wh * 0.28, 16, '#fff3c4');
    for (let i = 0; i < 14; i++) {
      const r = makeRng(i * 53 + 3);
      ctx.save(); ctx.globalAlpha = .4 + Math.sin(t * 2 + i) * .35;
      circle(ctx, wx + 12 + r() * (ww - 24), wy + 12 + r() * (wh - 24), 1.8, '#fff'); ctx.restore();
    }
    BG.clouds(ctx, ww, wh, t * 8, t, 'rgba(255,255,255,.35)', wy + wh * 0.55, 0.5);
    ctx.restore();
    line(ctx, wx + ww / 2, wy + 8, wx + ww / 2, wy + wh - 8, '#c9962c', 6);

    /* London, pinned to the wall — where all of this is going */
    this.poster(ctx, VW * 0.335, VH * 0.045, VW * 0.135, VH * 0.215, t);

    /* the lead, on its hook by the door, swinging a little */
    this.lead(ctx, VW * 0.905, VH * 0.16, t);

    /* the shelf, with tonight's treats on it */
    this.shelf(ctx, VW * 0.07, VH * 0.24, VW * 0.19, t, 1);

    /* floor: boards, and the lamp's pool of light across them */
    ctx.fillStyle = '#6b4a2c'; ctx.fillRect(0, floorY, VW, VH - floorY);
    fillRR(ctx, 0, floorY - 10, VW, 14, 0, '#8a6440');
    ctx.save(); ctx.globalAlpha = .35;
    for (let x = 0; x < VW; x += 90) line(ctx, x, floorY, x, VH, '#4f351d', 3);
    ctx.restore();

    /* the standing lamp, and what it throws */
    this.lamp(ctx, VW * 0.955, floorY, VH, t);

    /* the suitcase, open, mostly packed */
    this.suitcase(ctx, VW * 0.055, floorY + 40, 0.92, t);
    /* and the bowl she will miss */
    this.bowl(ctx, VW * 0.855, floorY + 62);

    return { floorY: floorY, mat: ['#8a4a63', '#c96f8a'], mood: 'heart',
             moodCol: '#ff8fb0', face: 'calm' };
  },

  /** a travel poster: Big Ben, a river, and the word */
  poster(ctx, x, y, w, h, t) {
    ctx.save();
    ctx.rotate(0); ctx.translate(x, y);
    fillRR(ctx, 0, 0, w, h, 4, '#e8dfc8');
    ctx.save(); rr(ctx, 5, 5, w - 10, h - 10, 3); ctx.clip();
    const g = ctx.createLinearGradient(0, 5, 0, h - 5);
    g.addColorStop(0, '#f2a45c'); g.addColorStop(1, '#7a4f9c');
    ctx.fillStyle = g; ctx.fillRect(5, 5, w - 10, h - 10);
    /* skyline */
    ctx.fillStyle = 'rgba(30,16,44,.72)';
    ctx.fillRect(5, h * 0.62, w - 10, h * 0.3);
    const bx = w * 0.62;
    ctx.fillRect(bx, h * 0.26, w * 0.11, h * 0.4);
    poly(ctx, [[bx - 2, h * 0.26], [bx + w * 0.055, h * 0.14], [bx + w * 0.13, h * 0.26]], 'rgba(30,16,44,.72)');
    fillRR(ctx, bx + w * 0.018, h * 0.32, w * 0.074, h * 0.07, 2, '#ffe9a8');
    /* a wheel on the left */
    ctx.save(); ctx.globalAlpha = .8;
    ctx.beginPath(); ctx.arc(w * 0.26, h * 0.5, w * 0.14, 0, TAU);
    ctx.strokeStyle = 'rgba(30,16,44,.72)'; ctx.lineWidth = 3; ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + t * 0.12;
      line(ctx, w * 0.26, h * 0.5, w * 0.26 + Math.cos(a) * w * 0.14,
        h * 0.5 + Math.sin(a) * w * 0.14, 'rgba(30,16,44,.5)', 1.6);
    }
    ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 ' + Math.round(h * 0.13) + 'px system-ui, sans-serif';
    ctx.fillStyle = '#fff3d0';
    ctx.fillText('LONDON', w / 2, h * 0.86);
    ctx.restore();
    /* the pin */
    circle(ctx, w / 2, 4, 4, '#e2584f');
    ctx.restore();
  },

  /** her lead, hung up and still moving from being hung up */
  lead(ctx, x, y, t) {
    const sw = Math.sin(t * 1.1) * 0.05;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw);
    fillRR(ctx, -5, -8, 10, 8, 3, '#9aa2b0');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-26, 34, 22, 44, -4, 78);
    ctx.strokeStyle = '#c94f6a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.stroke();
    circle(ctx, -4, 82, 5, '#c9962c');
    ctx.restore();
  },

  /** a standing lamp, and the warm cone it puts on the boards */
  lamp(ctx, x, floorY, VH, t) {
    const top = floorY - VH * 0.42;
    ctx.save(); ctx.globalAlpha = .16;
    poly(ctx, [[x - 34, top + 26], [x + 34, top + 26], [x + 96, floorY + 70], [x - 96, floorY + 70]], '#ffd870');
    ctx.restore();
    fillEll(ctx, x, floorY + 4, 26, 8, '#5a3f24');
    line(ctx, x, floorY, x, top + 22, '#8a6440', 6);
    poly(ctx, [[x - 30, top + 26], [x + 30, top + 26], [x + 20, top - 8], [x - 20, top - 8]], '#f2d08a');
    ctx.save(); ctx.globalAlpha = .5 + Math.sin(t * 1.7) * 0.05;
    fillEll(ctx, x, top + 26, 28, 7, '#fff3c4'); ctx.restore();
  },

  /** the case, open on the floor, with a ticket sticking out of it */
  suitcase(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .32; fillEll(ctx, 0, 6, 62, 11, '#000'); ctx.restore();
    /* the lid, propped back */
    ctx.save(); ctx.translate(-52, -6); ctx.rotate(-0.42);
    fillRR(ctx, 0, -54, 96, 54, 7, '#6b3f2c');
    fillRR(ctx, 6, -48, 84, 42, 5, '#8a5a3c');
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, 18, -40, 26, 15, 3, '#e8dfc8');
    fillRR(ctx, 52, -34, 22, 13, 3, '#c9d8e8');
    ctx.restore();
    ctx.restore();
    /* the body */
    fillRR(ctx, -56, -32, 112, 40, 8, '#7a4a32');
    fillRR(ctx, -50, -27, 100, 30, 6, '#a06a44');
    /* what is in it */
    fillRR(ctx, -44, -24, 42, 20, 5, '#c9d8e8');
    fillRR(ctx, 2, -22, 38, 18, 5, '#e8c0a0');
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = 0; i < 3; i++) line(ctx, -42, -20 + i * 6, -6, -20 + i * 6, '#9ab0c8', 2);
    ctx.restore();
    /* the ticket, half out and lifting in the draught */
    ctx.save();
    ctx.translate(28, -26); ctx.rotate(-0.25 + Math.sin(t * 1.3) * 0.05);
    fillRR(ctx, 0, -22, 34, 24, 3, '#fff6dc');
    ctx.save(); ctx.globalAlpha = .7;
    line(ctx, 5, -16, 26, -16, '#c9a86a', 2);
    line(ctx, 5, -10, 20, -10, '#c9a86a', 2);
    ctx.restore();
    circle(ctx, 28, -18, 3.4, '#e2584f');
    ctx.restore();
    /* strap and buckles */
    fillRR(ctx, -14, -33, 12, 42, 3, '#4f3120');
    circle(ctx, -8, -12, 4, '#d8b25e');
    ctx.restore();
  },

  /** her bowl, with her name half worn off it */
  bowl(ctx, x, y) {
    ctx.save(); ctx.globalAlpha = .3; fillEll(ctx, x, y + 5, 30, 7, '#000'); ctx.restore();
    poly(ctx, [[x - 28, y - 16], [x + 28, y - 16], [x + 19, y + 4], [x - 19, y + 4]], '#c95f7a');
    fillEll(ctx, x, y - 16, 28, 8, '#e08098');
    ctx.save(); ctx.globalAlpha = .55;
    fillEll(ctx, x, y - 15, 21, 5, '#7a3550'); ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 9px system-ui, sans-serif';
    ctx.fillStyle = '#fff0d8'; ctx.fillText('LOTA', x, y - 5);
    ctx.restore();
  },

  /* =================================================================
     2 · VIEŠBUTIS — a suite over the evening sea
  ================================================================= */
  hotel(ctx, VW, VH, t, G) {
    const floorY = VH * 0.56;
    /* the wall: warm teal, with a hotel's wide horizontal panelling */
    ctx.fillStyle = '#2f5f6a'; ctx.fillRect(0, 0, VW, floorY + 2);
    ctx.save(); ctx.globalAlpha = .28;
    for (let y = 0; y < floorY; y += 34) ctx.fillRect(0, y, VW, 16);
    ctx.fillStyle = '#3f7a86'; ctx.fillRect(0, 0, VW, floorY);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .22;
    for (let y = 12; y < floorY; y += 34) line(ctx, 0, y, VW, y, '#1d4650', 2);
    ctx.restore();

    /* the balcony: most of the wall is gone, and the sea is through it */
    const bx = VW * 0.30, bw = VW * 0.48, by = VH * 0.05, bh = floorY - by - 2;
    ctx.save();
    rr(ctx, bx, by, bw, bh, 12); ctx.clip();
    const sg = ctx.createLinearGradient(0, by, 0, by + bh);
    sg.addColorStop(0, '#2d3f7a'); sg.addColorStop(0.42, '#e0708a'); sg.addColorStop(0.72, '#ffb46a');
    sg.addColorStop(1, '#f2d08a');
    ctx.fillStyle = sg; ctx.fillRect(bx, by, bw, bh);
    const horiz = by + bh * 0.62;
    /* the sun, sitting on the water */
    circle(ctx, bx + bw * 0.62, horiz - 6, 24, '#fff0b8');
    ctx.save(); ctx.globalAlpha = .35;
    circle(ctx, bx + bw * 0.62, horiz - 6, 46, '#ffd870'); ctx.restore();
    /* the headland, with the level's pines standing on the end of it */
    poly(ctx, [[bx, horiz], [bx + bw * 0.30, horiz - 34], [bx + bw * 0.44, horiz]], '#3d5a52');
    for (let i = 0; i < 6; i++) {
      const px = bx + bw * (0.10 + i * 0.055), ph = 16 + (i % 3) * 7;
      poly(ctx, [[px, horiz - 6], [px + 5, horiz - 6 - ph], [px + 10, horiz - 6]], '#2b4a40');
    }
    /* the sea, and the sun's road across it */
    ctx.fillStyle = '#1f4f70'; ctx.fillRect(bx, horiz, bw, bh);
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 12; i++) {
      const yy = horiz + 4 + i * 5.5;
      const wob = Math.sin(t * 1.2 + i * 0.7) * 8;
      line(ctx, bx + bw * 0.62 - 22 - i * 3 + wob, yy, bx + bw * 0.62 + 22 + i * 3 + wob, yy, '#ffd8a0', 2.6);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .3;
    for (let i = 0; i < 9; i++) {
      const yy = horiz + 8 + i * 7;
      const off = Math.sin(t * 0.8 + i) * 14;
      line(ctx, bx - 20 + off, yy, bx + bw * 0.5 + off, yy, '#bfe4f0', 2);
    }
    ctx.restore();
    /* the pier the level runs off the end of */
    ctx.save(); ctx.globalAlpha = .8;
    fillRR(ctx, bx + bw * 0.66, horiz + 8, bw * 0.34, 5, 2, '#6b4a3a');
    for (let i = 0; i < 5; i++) fillRR(ctx, bx + bw * (0.70 + i * 0.07), horiz + 12, 4, 16, 1, '#5a3d2e');
    ctx.restore();
    /* gulls, going nowhere in particular */
    ctx.save(); ctx.globalAlpha = .7; ctx.strokeStyle = '#fff4e0'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const gx = bx + ((t * 12 + i * 160) % (bw + 60)) - 30, gy = by + 34 + i * 22 + Math.sin(t + i) * 5;
      const fl = Math.sin(t * 3 + i * 2) * 5;
      ctx.beginPath();
      ctx.moveTo(gx - 9, gy); ctx.quadraticCurveTo(gx - 4, gy - 6 - fl, gx, gy);
      ctx.quadraticCurveTo(gx + 4, gy - 6 - fl, gx + 9, gy); ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
    /* the balcony's frame and rail */
    ctx.save();
    rr(ctx, bx, by, bw, bh, 12);
    ctx.strokeStyle = '#e8e0cf'; ctx.lineWidth = 9; ctx.stroke();
    ctx.restore();
    line(ctx, bx, by + bh * 0.72, bx + bw, by + bh * 0.72, 'rgba(232,224,207,.85)', 5);
    for (let i = 1; i < 7; i++)
      line(ctx, bx + bw * i / 7, by + bh * 0.72, bx + bw * i / 7, by + bh, 'rgba(232,224,207,.6)', 3);

    /* the curtain, taken by the breeze off the water */
    this.curtain(ctx, bx - 6, by - 2, VW * 0.11, bh * 0.96, t, 1);
    this.curtain(ctx, bx + bw + 6, by - 2, VW * 0.11, bh * 0.96, t + 1.4, -1);

    /* the do-not-disturb tag, hung on the door handle by the shelf */
    this.tag(ctx, VW * 0.905, VH * 0.30, t);
    /* the shelf, with this level's toys on it */
    this.shelf(ctx, VW * 0.83, VH * 0.16, VW * 0.14, t, 2, '#c9b08a');

    /* the floor: pale deck boards, with sand blown in over them */
    ctx.fillStyle = '#c9a878'; ctx.fillRect(0, floorY, VW, VH - floorY);
    fillRR(ctx, 0, floorY - 9, VW, 13, 0, '#e0c79a');
    ctx.save(); ctx.globalAlpha = .3;
    for (let x = 0; x < VW; x += 74) line(ctx, x, floorY, x, VH, '#96774f', 3);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 60; i++) {
      const r = makeRng(i * 37 + 11);
      circle(ctx, r() * VW, floorY + 6 + r() * (VH - floorY), 1 + r() * 2.2, '#f2dfb8');
    }
    ctx.restore();
    /* the corner of the bed, cut off by the edge of the frame */
    this.bedCorner(ctx, -VW * 0.11, floorY, VW * 0.23, VH * 0.2);
    /* and what the sea left on the boards, low, where nothing else is */
    this.shell(ctx, VW * 0.545, VH * 0.955, 1.05, -0.3);
    this.shell(ctx, VW * 0.945, floorY + 44, 0.8, 0.5);
    this.starfish(ctx, VW * 0.795, VH * 0.93, 1.05);

    return { floorY: floorY, mat: ['#e2604f', '#fff0d8'], matKind: 'towel',
             mood: 'bubble', moodCol: '#d8f4ff', moodA: 0.6, face: 'happy',
             numCol: '#fff2d0', numAlpha: 0.14, vignette: 'rgba(10,24,34,.5)' };
  },

  curtain(ctx, x, y, w, h, t, dir) {
    ctx.save();
    ctx.globalAlpha = .82;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.5 * dir, y);
    ctx.lineTo(x + w * 0.5 * dir, y);
    for (let i = 0; i <= 8; i++) {
      const k = i / 8;
      const sway = Math.sin(t * 1.3 + k * 3) * 18 * k * dir;
      ctx.lineTo(x + (w * 0.5 + sway) * dir, y + h * k);
    }
    for (let i = 8; i >= 0; i--) {
      const k = i / 8;
      const sway = Math.sin(t * 1.3 + k * 3 + 0.6) * 14 * k * dir;
      ctx.lineTo(x + (-w * 0.5 + sway) * dir, y + h * k);
    }
    ctx.closePath();
    ctx.fillStyle = '#f4ece0'; ctx.fill();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .22;
    for (let i = 1; i < 4; i++) {
      const k = i / 4;
      ctx.beginPath();
      ctx.moveTo(x + (w * (k - 0.5)) * dir, y);
      for (let j = 0; j <= 6; j++) {
        const kk = j / 6;
        ctx.lineTo(x + (w * (k - 0.5) + Math.sin(t * 1.3 + kk * 3) * 16 * kk) * dir, y + h * kk);
      }
      ctx.strokeStyle = '#a89a86'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
  },

  bedCorner(ctx, x, floorY, w, h) {
    fillRR(ctx, x, floorY - h, w, h + 30, 10, '#7a5a48');
    fillRR(ctx, x, floorY - h - 12, w, 22, 9, '#f4ece0');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, x + w * 0.1, floorY - h - 26, w * 0.55, 20, 8, '#ffffff'); ctx.restore();
    /* the towel somebody folded into a shape on top of it */
    fillRR(ctx, x + w * 0.5, floorY - h - 6, w * 0.42, 14, 6, '#e2604f');
    ctx.save(); ctx.globalAlpha = .6;
    fillRR(ctx, x + w * 0.54, floorY - h - 3, w * 0.34, 7, 3, '#fff0d8'); ctx.restore();
  },

  tag(ctx, x, y, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.9) * 0.07);
    fillRR(ctx, -18, 0, 36, 46, 8, '#f2c94c');
    circle(ctx, 0, 9, 6, '#2f5f6a');
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 3; i++) line(ctx, -11, 24 + i * 7, 11, 24 + i * 7, '#8a6a1c', 2);
    ctx.restore();
    ctx.restore();
  },

  shell(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .28; fillEll(ctx, 1, 3, 15, 5, '#000'); ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, 4);
    ctx.arc(0, 4, 15, Math.PI, TAU); ctx.closePath();
    ctx.fillStyle = '#f7dcc8'; ctx.fill();
    ctx.strokeStyle = '#d8a888'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + (i + 1) * Math.PI / 6;
      line(ctx, 0, 4, Math.cos(a) * 14, 4 + Math.sin(a) * 14, '#e0b494', 1.6);
    }
    ctx.stroke();
    ctx.restore();
  },

  starfish(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.3);
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 5 : 15;
      pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.62]);
    }
    ctx.save(); ctx.globalAlpha = .28; fillEll(ctx, 1, 3, 14, 5, '#000'); ctx.restore();
    poly(ctx, pts, '#e88a5a');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 6; i++) circle(ctx, (i % 3 - 1) * 5, (i < 3 ? -2 : 3), 1.4, '#fff0d8');
    ctx.restore();
    ctx.restore();
  },

  /* =================================================================
     3 · OBSERVATORIJA — an attic under glass, aimed at the sky
  ================================================================= */
  observatory(ctx, VW, VH, t, G) {
    const floorY = VH * 0.56;
    /* the night, filling the whole dome */
    const g = ctx.createLinearGradient(0, 0, 0, floorY);
    g.addColorStop(0, '#0d0a2c'); g.addColorStop(0.6, '#241a4f'); g.addColorStop(1, '#3f2a68');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, floorY + 2);
    /* stars, slowly turning about a point off the top of the screen */
    for (let i = 0; i < 90; i++) {
      const r = makeRng(i * 61 + 7);
      const a0 = r() * TAU, rad = 60 + r() * VH * 1.3;
      const a = a0 + t * 0.012;
      const sx = VW * 0.5 + Math.cos(a) * rad, sy = -VH * 0.5 + Math.sin(a) * rad;
      if (sy > floorY - 6) continue;
      ctx.save();
      ctx.globalAlpha = .35 + Math.sin(t * 1.8 + i) * .3;
      circle(ctx, sx, sy, 0.9 + r() * 1.7, i % 9 ? '#fff' : '#bfd8ff');
      ctx.restore();
    }
    /* a comet, every so often */
    const cph = (t * 0.11) % 1;
    if (cph < 0.34) {
      const k = cph / 0.34;
      const cx = lerp(-40, VW * 0.85, k), cy = lerp(VH * 0.04, VH * 0.34, k);
      ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI) * 0.9;
      const cg = ctx.createLinearGradient(cx - 90, cy - 34, cx, cy);
      cg.addColorStop(0, 'rgba(190,220,255,0)'); cg.addColorStop(1, '#dff0ff');
      ctx.strokeStyle = cg; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 90, cy - 34); ctx.lineTo(cx, cy); ctx.stroke();
      circle(ctx, cx, cy, 3.2, '#ffffff');
      ctx.restore();
    }
    /* the moon, big and low — the last place the level goes */
    const mx = VW * 0.78, my = VH * 0.17, mr = VH * 0.115;
    ctx.save(); ctx.globalAlpha = .22;
    circle(ctx, mx, my, mr * 2.1, '#cfd8ff'); ctx.restore();
    circle(ctx, mx, my, mr, '#f2eede');
    ctx.save(); ctx.globalAlpha = .35;
    circle(ctx, mx - mr * .3, my - mr * .2, mr * .22, '#b8b0a0');
    circle(ctx, mx + mr * .28, my + mr * .18, mr * .16, '#b8b0a0');
    circle(ctx, mx + mr * .05, my + mr * .42, mr * .11, '#b8b0a0');
    ctx.restore();

    /* the glass over all of it: the dome's ribs and panes */
    ctx.save(); ctx.globalAlpha = .5;
    ctx.strokeStyle = '#6a5a9c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(VW * 0.5 + i * VW * 0.17, floorY);
      ctx.quadraticCurveTo(VW * 0.5 + i * VW * 0.11, -VH * 0.1, VW * 0.5 + i * VW * 0.02, -VH * 0.3);
      ctx.stroke();
    }
    for (let i = 1; i <= 3; i++) {
      const yy = floorY - i * VH * 0.155;
      ctx.beginPath();
      ctx.moveTo(0, yy + VH * 0.02);
      ctx.quadraticCurveTo(VW * 0.5, yy - VH * 0.05, VW, yy + VH * 0.02);
      ctx.stroke();
    }
    ctx.restore();
    /* a pane catching the moon */
    ctx.save(); ctx.globalAlpha = .07;
    poly(ctx, [[VW * 0.16, floorY], [VW * 0.33, floorY], [VW * 0.44, VH * 0.06], [VW * 0.3, VH * 0.02]], '#cfe4ff');
    ctx.restore();

    /* the shelf, with this level's treats and toys */
    this.shelf(ctx, VW * 0.30, VH * 0.30, VW * 0.16, t, 3, '#4f4278');

    /* the floor: dark boards under a rim of instrument light */
    ctx.fillStyle = '#2a2246'; ctx.fillRect(0, floorY, VW, VH - floorY);
    fillRR(ctx, 0, floorY - 8, VW, 12, 0, '#4a3d70');
    ctx.save(); ctx.globalAlpha = .3;
    for (let x = 0; x < VW; x += 88) line(ctx, x, floorY, x, VH, '#191338', 3);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .1 + Math.sin(t * 1.4) * 0.03;
    const fg = ctx.createLinearGradient(0, floorY, 0, VH);
    fg.addColorStop(0, '#8fb0ff'); fg.addColorStop(1, 'rgba(143,176,255,0)');
    ctx.fillStyle = fg; ctx.fillRect(0, floorY, VW, VH - floorY);
    ctx.restore();

    /* the telescope, aimed at where the comet went */
    this.telescope(ctx, VW * 0.885, floorY + 26, VH, t);
    /* the orrery on its stand, still turning */
    this.orrery(ctx, VW * 0.715, floorY - VH * 0.055, VH * 0.075, t);
    /* an apple sapling under a glass cloche — the orchard, brought indoors */
    this.cloche(ctx, VW * 0.585, VH * 0.965, 0.86, t);

    return { floorY: floorY, mat: ['#2f2a5c', '#bfd0ff'], matKind: 'chart',
             mood: 'star', moodCol: '#ffe89a', moodA: 0.7, face: 'happy',
             numCol: '#cfe0ff', numAlpha: 0.13, vignette: 'rgba(4,2,20,.6)' };
  },

  telescope(ctx, x, floorY, VH, t) {
    const sway = Math.sin(t * 0.5) * 0.04;
    ctx.save(); ctx.translate(x, floorY);
    /* the tripod */
    line(ctx, 0, 0, -34, 8, '#5a4a2c', 7);
    line(ctx, 0, 0, 34, 8, '#5a4a2c', 7);
    line(ctx, 0, 0, 2, 12, '#4a3c22', 6);
    ctx.translate(0, -VH * 0.16);
    ctx.rotate(-0.75 + sway);
    /* the tube */
    fillRR(ctx, -VH * 0.05, -13, VH * 0.30, 26, 12, '#8a7ac0');
    fillRR(ctx, -VH * 0.05, -13, VH * 0.30, 10, 6, '#a898e0');
    fillRR(ctx, VH * 0.235, -16, VH * 0.022, 32, 6, '#c9b06a');
    fillRR(ctx, -VH * 0.062, -9, VH * 0.02, 18, 5, '#c9b06a');
    ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 2) * .1;
    fillEll(ctx, VH * 0.246, 0, 5, 15, '#dff0ff'); ctx.restore();
    /* the mount */
    ctx.rotate(0.75 - sway);
    fillRR(ctx, -12, -6, 24, VH * 0.17, 6, '#4a3c22');
    ctx.restore();
  },

  orrery(ctx, x, y, r, t) {
    ctx.save(); ctx.translate(x, y);
    line(ctx, 0, 0, 0, r * 1.5, '#6a5a3c', 6);
    fillEll(ctx, 0, r * 1.55, 24, 8, '#5a4a2c');
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.ellipse(0, 0, r * (0.45 + i * 0.28), r * (0.18 + i * 0.11), 0, 0, TAU);
      ctx.strokeStyle = '#c9b06a'; ctx.lineWidth = 1.6; ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    circle(ctx, 0, 0, r * 0.55, '#ffd870'); ctx.restore();
    circle(ctx, 0, 0, r * 0.3, '#ffe8a8');
    const cols = ['#6fb0e8', '#e2846a', '#a8e0b0'];
    for (let i = 1; i <= 3; i++) {
      const a = t * (0.9 - i * 0.22) + i * 2;
      circle(ctx, Math.cos(a) * r * (0.45 + i * 0.28), Math.sin(a) * r * (0.18 + i * 0.11),
        r * 0.16, cols[i - 1]);
    }
    ctx.restore();
  },

  cloche(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .3; fillEll(ctx, 0, 4, 34, 8, '#000'); ctx.restore();
    fillRR(ctx, -30, -8, 60, 14, 5, '#5a4a2c');
    fillRR(ctx, -24, -22, 48, 18, 4, '#6b4a2c');
    /* the sapling */
    line(ctx, 0, -22, 2, -56, '#4a7a3c', 5);
    leafy(ctx, 0, -66, 24, 20, '#3f9c5c', '#63c47e', 3);
    circle(ctx, -9, -62, 4.2, '#e2584f');
    circle(ctx, 8, -70, 3.6, '#e2584f');
    /* the glass over it */
    ctx.save(); ctx.globalAlpha = .22;
    ctx.beginPath();
    ctx.moveTo(-30, -8); ctx.quadraticCurveTo(-32, -92, 0, -94);
    ctx.quadraticCurveTo(32, -92, 30, -8); ctx.closePath();
    ctx.fillStyle = '#cfe4ff'; ctx.fill();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    ctx.beginPath();
    ctx.moveTo(-30, -8); ctx.quadraticCurveTo(-32, -92, 0, -94);
    ctx.quadraticCurveTo(32, -92, 30, -8);
    ctx.strokeStyle = '#9ab4e0'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.restore();
    circle(ctx, 0, -98, 5, '#c9b06a');
    ctx.restore();
  },

  /* =================================================================
     4 · VETERINARAS — the waiting room she is trying to get out of
  ================================================================= */
  vet(ctx, VW, VH, t, G) {
    const floorY = VH * 0.56;
    /* the strip light overhead, and it is not quite right */
    const flick = 1 - (Math.sin(t * 31) > 0.94 ? 0.3 : 0) - (Math.sin(t * 7.3) > 0.985 ? 0.5 : 0);

    /* the wall: mint tiles to shoulder height, painted plaster above */
    ctx.fillStyle = '#c8d8cf'; ctx.fillRect(0, 0, VW, floorY + 2);
    const tileTop = VH * 0.20;
    ctx.fillStyle = '#e2ece6'; ctx.fillRect(0, 0, VW, tileTop);
    ctx.fillStyle = '#a8c0b6'; ctx.fillRect(0, tileTop - 6, VW, 8);
    ctx.save(); ctx.globalAlpha = .5;
    for (let y = tileTop + 4; y < floorY; y += 30) line(ctx, 0, y, VW, y, '#a8bdb2', 2);
    for (let x = 0; x < VW; x += 44) line(ctx, x, tileTop, x, floorY, '#a8bdb2', 2);
    ctx.restore();

    /* the light itself */
    ctx.save(); ctx.globalAlpha = 0.5 * flick;
    const lg = ctx.createLinearGradient(0, 0, 0, floorY);
    lg.addColorStop(0, 'rgba(238,255,248,.9)'); lg.addColorStop(1, 'rgba(238,255,248,0)');
    ctx.fillStyle = lg; ctx.fillRect(VW * 0.18, 0, VW * 0.5, floorY);
    ctx.restore();
    fillRR(ctx, VW * 0.30, 0, VW * 0.26, 14, 4, '#9fb4aa');
    ctx.save(); ctx.globalAlpha = flick;
    fillRR(ctx, VW * 0.31, 8, VW * 0.24, 7, 3, '#f2fff8'); ctx.restore();

    /* the way out, at the back — and it is the only warm thing in here */
    this.vetDoor(ctx, VW * 0.485, floorY, VH, t);

    /* the chart nobody reads, and the clock everybody does */
    this.chart(ctx, VW * 0.145, VH * 0.055, VW * 0.13, VH * 0.20);
    this.clock(ctx, VW * 0.70, VH * 0.10, VH * 0.055, t);

    /* the shelf — here it holds the prize, not a purse */
    this.shelf(ctx, VW * 0.655, VH * 0.235, VW * 0.13, t, 4, '#9fb4aa');

    /* the floor: speckled clinic tiles, mopped to a shine */
    ctx.fillStyle = '#d8ded8'; ctx.fillRect(0, floorY, VW, VH - floorY);
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 200; i++) {
      const r = makeRng(i * 23 + 5);
      circle(ctx, r() * VW, floorY + r() * (VH - floorY), 0.9 + r() * 1.4, '#a8b4ac');
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .28;
    for (let x = -VH; x < VW + VH; x += 96) line(ctx, x, floorY, x + 60, VH, '#b0bcb4', 2);
    for (let y = floorY + 26; y < VH; y += 32) line(ctx, 0, y, VW, y, '#b0bcb4', 2);
    ctx.restore();
    /* the strip light, reflected in the wet of it */
    ctx.save(); ctx.globalAlpha = .18 * flick;
    poly(ctx, [[VW * 0.34, floorY], [VW * 0.54, floorY], [VW * 0.68, VH], [VW * 0.24, VH]], '#ffffff');
    ctx.restore();

    /* the row of plastic chairs, bolted to the wall behind her */
    this.chairs(ctx, VW * 0.035, floorY + 6, VW * 0.24);
    /* the counter, with a bell nobody has rung */
    this.counter(ctx, VW * 0.775, floorY, VW * 0.22, VH * 0.14, t);
    /* the carrier, door open, waiting for her */
    this.carrier(ctx, VW * 0.585, VH * 0.945, 0.9, t);

    return { floorY: floorY, mat: ['#7f9a90', '#e2ece6'], matKind: 'clinic',
             mood: '', face: 'calm',
             numCol: '#20302a', numAlpha: 0.08, vignette: 'rgba(10,20,16,.6)' };
  },

  /** the double door out, its EXIT sign lit — and somebody through the glass */
  vetDoor(ctx, x, floorY, VH, t) {
    const w = VH * 0.30, h = VH * 0.42, y = floorY - h;
    fillRR(ctx, x - w / 2 - 8, y - 8, w + 16, h + 8, 4, '#8fa89e');
    fillRR(ctx, x - w / 2, y, w, h, 3, '#b8ccc2');
    line(ctx, x, y, x, floorY, '#8fa89e', 4);
    /* the frosted panes */
    [-1, 1].forEach(side => {
      const px = x + side * w * 0.25;
      ctx.save();
      rr(ctx, px - w * 0.19, y + 14, w * 0.38, h * 0.46, 3); ctx.clip();
      ctx.fillStyle = '#e8f4ee'; ctx.fillRect(px - w * 0.19, y + 14, w * 0.38, h * 0.46);
      ctx.save(); ctx.globalAlpha = .3;
      for (let i = 0; i < 9; i++) line(ctx, px - w * 0.19, y + 18 + i * 8, px + w * 0.19, y + 18 + i * 8, '#b8ccc2', 3);
      ctx.restore();
      /* a shape behind it, going past and coming back */
      if (side < 0) {
        const ph = (t * 0.12) % 1;
        const sx = px - w * 0.3 + ph * w * 0.6;
        ctx.save(); ctx.globalAlpha = .28 * Math.sin(ph * Math.PI);
        fillEll(ctx, sx, y + h * 0.34, w * 0.14, h * 0.26, '#3a4a44');
        circle(ctx, sx, y + h * 0.14, w * 0.08, '#3a4a44');
        ctx.restore();
      }
      ctx.restore();
      ctx.save();
      rr(ctx, px - w * 0.19, y + 14, w * 0.38, h * 0.46, 3);
      ctx.strokeStyle = '#8fa89e'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    });
    /* the push bar */
    fillRR(ctx, x - w * 0.42, y + h * 0.62, w * 0.84, 8, 4, '#c9b06a');
    /* the sign */
    fillRR(ctx, x - w * 0.24, y - 34, w * 0.48, 24, 5, '#2f7a52');
    ctx.save();
    ctx.globalAlpha = .35 + Math.sin(t * 1.5) * 0.1;
    fillRR(ctx, x - w * 0.28, y - 38, w * 0.56, 32, 7, '#4fd07a');
    ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 ' + Math.round(VH * 0.03) + 'px system-ui, sans-serif';
    ctx.fillStyle = '#eafff2';
    ctx.fillText('IŠĖJIMAS', x, y - 22);
  },

  chart(ctx, x, y, w, h) {
    fillRR(ctx, x, y, w, h, 3, '#f4f7f2');
    ctx.save();
    rr(ctx, x + 4, y + 4, w - 8, h - 8, 2); ctx.clip();
    ctx.save(); ctx.globalAlpha = .8;
    /* a dog, drawn the way clinics draw them */
    const cx = x + w * 0.5, cy = y + h * 0.44;
    fillEll(ctx, cx, cy, w * 0.28, h * 0.16, '#c9d4cc');
    circle(ctx, cx + w * 0.28, cy - h * 0.07, w * 0.13, '#c9d4cc');
    poly(ctx, [[cx + w * 0.22, cy - h * 0.16], [cx + w * 0.3, cy - h * 0.3], [cx + w * 0.34, cy - h * 0.14]], '#c9d4cc');
    for (let i = 0; i < 4; i++)
      fillRR(ctx, cx - w * 0.2 + i * w * 0.13, cy + h * 0.1, w * 0.05, h * 0.16, 2, '#c9d4cc');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i < 5; i++) {
      const ly = y + h * 0.68 + i * h * 0.06;
      line(ctx, x + 9, ly, x + w - 9 - (i % 2) * w * 0.2, ly, '#93a89c', 2);
    }
    ctx.restore();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    rr(ctx, x, y, w, h, 3); ctx.strokeStyle = '#8fa89e'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  },

  clock(ctx, x, y, r, t) {
    ctx.save(); ctx.globalAlpha = .25; circle(ctx, x + 2, y + 3, r, '#000'); ctx.restore();
    circle(ctx, x, y, r, '#f4f7f2');
    ctx.save(); ctx.globalAlpha = .6;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
    ctx.strokeStyle = '#8fa89e'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    for (let i = 0; i < 12; i++) {
      const a = i * TAU / 12;
      line(ctx, x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78,
               x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, '#93a89c', i % 3 ? 1.4 : 2.4);
    }
    line(ctx, x, y, x + Math.cos(-1.1) * r * 0.5, y + Math.sin(-1.1) * r * 0.5, '#3a4a44', 3.4);
    line(ctx, x, y, x + Math.cos(0.9) * r * 0.72, y + Math.sin(0.9) * r * 0.72, '#3a4a44', 2.4);
    const a = -Math.PI / 2 + (t % 60) * TAU / 60;
    line(ctx, x, y, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, '#c94f4f', 1.6);
    circle(ctx, x, y, 2.4, '#3a4a44');
  },

  chairs(ctx, x, y, w) {
    const n = 3, cw = w / n;
    /* the rail they are all bolted to */
    fillRR(ctx, x - 6, y + 34, w + 12, 8, 3, '#8fa89e');
    for (let i = 0; i < n; i++) {
      const cx = x + i * cw;
      fillRR(ctx, cx, y - 44, cw - 8, 40, 6, '#4f8ca8');
      fillRR(ctx, cx + 2, y - 6, cw - 12, 12, 5, '#5f9cb8');
      line(ctx, cx + 6, y + 6, cx + 6, y + 38, '#8fa89e', 4);
      line(ctx, cx + cw - 14, y + 6, cx + cw - 14, y + 38, '#8fa89e', 4);
      ctx.save(); ctx.globalAlpha = .3;
      fillRR(ctx, cx + 6, y - 40, cw - 20, 8, 4, '#ffffff'); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = .22;
    fillEll(ctx, x + w / 2, y + 46, w * 0.56, 10, '#000'); ctx.restore();
  },

  counter(ctx, x, floorY, w, h, t) {
    fillRR(ctx, x, floorY - h, w, h + 40, 6, '#b8ccc2');
    fillRR(ctx, x - 5, floorY - h - 10, w + 10, 14, 5, '#e2ece6');
    ctx.save(); ctx.globalAlpha = .3;
    fillRR(ctx, x + 8, floorY - h + 14, w - 16, 5, 2, '#8fa89e');
    fillRR(ctx, x + 8, floorY - h + 34, w - 16, 5, 2, '#8fa89e');
    ctx.restore();
    /* the bell */
    const bx = x + w * 0.24, by = floorY - h - 10;
    fillEll(ctx, bx, by, 15, 5, '#c9b06a');
    ctx.beginPath(); ctx.arc(bx, by - 2, 12, Math.PI, TAU); ctx.fillStyle = '#e0c87a'; ctx.fill();
    circle(ctx, bx, by - 17, 3.4, '#c9b06a');
    ctx.save(); ctx.globalAlpha = .5;
    fillEll(ctx, bx - 4, by - 8, 3.4, 2, '#fff8e0', -0.5); ctx.restore();
    /* a stack of forms, and a pen that is not on its chain */
    fillRR(ctx, x + w * 0.58, by - 8, 34, 9, 2, '#f4f7f2');
    ctx.save(); ctx.translate(x + w * 0.72, by - 12); ctx.rotate(-0.5);
    fillRR(ctx, 0, 0, 22, 4, 2, '#3a4a6a'); ctx.restore();
    /* a plant somebody keeps alive */
    leafy(ctx, x + w * 0.9, floorY - h - 30, 22, 20, '#4f8c5c', '#73b47e', 5);
    fillRR(ctx, x + w * 0.9 - 12, floorY - h - 16, 24, 18, 4, '#c98f5a');
  },

  carrier(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .3; fillEll(ctx, 0, 6, 52, 10, '#000'); ctx.restore();
    fillRR(ctx, -48, -50, 96, 56, 10, '#9aa8b4');
    fillRR(ctx, -42, -44, 84, 44, 8, '#cdd8e0');
    /* the door, swung open towards us */
    ctx.save();
    ctx.translate(46, -2); ctx.rotate(-0.7);
    fillRR(ctx, 0, -46, 46, 46, 7, '#8a98a4');
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 1; i < 5; i++) line(ctx, i * 9, -42, i * 9, -4, '#5f6c78', 3);
    for (let i = 1; i < 4; i++) line(ctx, 4, -46 + i * 11, 42, -46 + i * 11, '#5f6c78', 3);
    ctx.restore();
    ctx.restore();
    /* the dark inside */
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, -34, -38, 68, 34, 6, '#3a4450'); ctx.restore();
    /* a blanket she is not going to lie on */
    fillRR(ctx, -30, -14, 58, 12, 5, '#c95f7a');
    fillRR(ctx, -48, -58, 96, 12, 5, '#8a98a4');
    fillRR(ctx, -14, -66, 28, 10, 5, '#7a8894');
    ctx.restore();
  },

  /* =================================================================
     5 · PREMIUM — not a room at all
     One swipe past the last level the wall stops and the page starts:
     paper, crayon, and the book everything else comes out of.
  ================================================================= */
  premium(G) {
    const ctx = G.ctx, VW = G.VW, VH = G.VH, t = G.t;
    const groundY = VH * 0.70;
    /* the film's boil is a film thing: a home page you can sit and look at
       should hold still, so the hand's wobble is pinned to one frame here */
    PF_T = 0;

    /* the page itself, and a warm twilight bled into the top of it — the
       four rooms are lit; this one is lit from inside the paper */
    paper(ctx, VW, VH, t);
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, 'rgba(74,34,132,.72)');
    sky.addColorStop(0.42, 'rgba(196,86,164,.46)');
    sky.addColorStop(0.78, 'rgba(255,158,120,.34)');
    sky.addColorStop(1, 'rgba(255,224,168,.2)');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VW, groundY);
    /* the crayon over the top of it — short strokes, the way a hand fills a
       sky in, not the long ruled ones a rectangle of scribble gives you */
    ctx.save(); ctx.globalAlpha = .3;
    for (let i = 0; i < 46; i++) {
      const r = makeRng(i * 53 + 17);
      const px = r() * VW, py = r() * groundY * 0.9;
      crayon(ctx, px, py, px + 26 + r() * 34, py + (r() - .5) * 14,
        i % 3 ? '#c9a0f0' : '#f0a8d0', 5, i);
    }
    ctx.restore();

    ctx.save(); ctx.globalAlpha = .85;
    for (let i = 0; i < 10; i++) {
      const a = i * (TAU / 10) + t * 0.22;
      crayon(ctx, VW * 0.10 + Math.cos(a) * 28, VH * 0.14 + Math.sin(a) * 28,
        VW * 0.10 + Math.cos(a) * 47, VH * 0.14 + Math.sin(a) * 47, '#ffb43a', 4, i);
    }
    circle(ctx, VW * 0.10, VH * 0.14, 25, '#ffd86a');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .6;
    for (let i = 0; i < 3; i++) {
      const cx = VW * (0.36 + i * 0.24) + Math.sin(t * 0.25 + i) * 12, cy = VH * (0.09 + (i % 2) * 0.06);
      for (let k = 0; k < 5; k++) {
        const a = Math.PI + k * (Math.PI / 4);
        crayon(ctx, cx + Math.cos(a) * 31, cy + Math.sin(a) * 14,
          cx + Math.cos(a + 0.8) * 31, cy + Math.sin(a + 0.8) * 14, '#e0d0ff', 4, i * 9 + k);
      }
    }
    ctx.restore();

    /* the ground, in crayon: a horizon line, and grass pushed into it */
    ctx.fillStyle = 'rgba(150,214,116,.55)'; ctx.fillRect(0, groundY, VW, VH - groundY);
    crayon(ctx, -10, groundY, VW + 10, groundY, '#3f8c4a', 6, 2);
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 120; i++) {
      const r = makeRng(i * 29 + 5);
      const gx = r() * VW, gy = groundY + 6 + r() * (VH - groundY);
      const hh = 9 + r() * 13;
      crayon(ctx, gx, gy, gx + (r() - .5) * 9, gy - hh, i % 4 ? '#4f9c5a' : '#7fc45a', 3.2, i);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 9; i++) {
      const r = makeRng(i * 43 + 7);
      const fx0 = r() * VW, fy0 = groundY + 16 + r() * (VH - groundY - 24);
      crayon(ctx, fx0, fy0 + 13, fx0 + (r() - .5) * 6, fy0, '#4f9c5a', 3, i + 40);
      circle(ctx, fx0, fy0 - 3, 4.6, PF_COLS[imod(i, PF_COLS.length)]);
    }
    ctx.restore();
    for (let i = 0; i < 10; i++) {
      const k = i / 9;
      const tx = VW * (0.34 + k * 0.60), ty = groundY - 2 - k * VH * 0.14;
      const sc = 1 - k * 0.6;
      ctx.save(); ctx.globalAlpha = 1 - k * 0.42;
      Premium.tile(ctx, tx, ty, 80 * sc, 32 * sc, i < 3 ? String(i + 1) : '', '#4fd07a', 0);
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = .5;
    Premium.exitDoor(ctx, VW * 0.965, groundY - VH * 0.145, 0.36, t);
    ctx.restore();

    /* the book, low and open, with the extension coming up out of it */
    const bx = VW * 0.5, by = VH * 1.14;
    ctx.save();
    ctx.globalAlpha = .09;
    ctx.translate(bx, by - 40);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.185 + Math.sin(t * 0.35) * 0.05;
      poly(ctx, [[0, 0], [Math.cos(a - .06) * VH * 1.7, Math.sin(a - .06) * VH * 1.7],
                 [Math.cos(a + .06) * VH * 1.7, Math.sin(a + .06) * VH * 1.7]],
        PF_COLS[imod(i, PF_COLS.length)]);
    }
    ctx.restore();
    /* the tiles and the stars it is throwing up the page */
    for (let i = 0; i < 18; i++) {
      const r = makeRng(i * 63 + 5);
      const ph = ((t * 0.07) + r()) % 1;
      const px = bx + (r() - 0.5) * VW * 1.0 * (0.24 + ph);
      const py = by - 70 - ph * VH * 1.05;
      ctx.save();
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.62;
      ctx.translate(px, py); ctx.rotate(Math.sin(ph * 5 + i) * 0.26);
      const sc = 0.38 + r() * 0.38;
      if (i % 3 === 2) this.mote(ctx, 'star', PF_COLS[imod(i, PF_COLS.length)], t, i);
      else Premium.tile(ctx, 0, 0, 68 * sc, 27 * sc, '', PF_COLS[imod(i, PF_COLS.length)], 0);
      ctx.restore();
    }
    Premium.book(ctx, bx, by, 1.3, 1);

    /* she is already on the other side, sitting on the grass */
    const fx = VW * G.lobbyFocus, sz = G.lobbyFocus < 0.45 ? G.lobbySize : 1;
    ctx.save(); ctx.globalAlpha = .45;
    crayon(ctx, fx - 54 * sz, groundY + 30, fx + 54 * sz, groundY + 30, '#5a4a3a', 3.4 * sz, 21);
    ctx.restore();
    drawLota(ctx, fx, groundY + 28, {
      state: 'sit', t: t, skin: Save.data.skin, scale: 1.34 * sz,
      face: 'happy', paw: ((t * 0.5) % 4) > 3, tilt: Math.sin(t * 0.8) * 0.12
    });
    ctx.save(); ctx.globalAlpha = .28;
    for (let i = 0; i < 6; i++) {
      const r = makeRng(i * 71 + 5);
      const px = fx - 46 * sz + r() * 92 * sz, py = groundY - 66 * sz + r() * 84 * sz;
      crayon(ctx, px, py, px + 20 * sz, py + (r() - .5) * 20 * sz,
        PF_COLS[imod(i, PF_COLS.length)], 5 * sz, i);
    }
    ctx.restore();

    /* the page darkening towards its own edges, so the gold rule sits on
       something rather than floating on cream */
    const eg = ctx.createRadialGradient(VW / 2, VH * 0.52, VH * 0.34, VW / 2, VH * 0.52, VH * 1.05);
    eg.addColorStop(0, 'rgba(58,18,74,0)'); eg.addColorStop(1, 'rgba(58,18,74,.5)');
    ctx.fillStyle = eg; ctx.fillRect(0, 0, VW, VH);

    /* the gold rule round the page: of the five, this is the framed one */
    ctx.save();
    ctx.globalAlpha = .8;
    rr(ctx, 12, 12, VW - 24, VH - 24, 20);
    ctx.strokeStyle = '#c9962c'; ctx.lineWidth = 4; ctx.stroke();
    ctx.globalAlpha = .4;
    rr(ctx, 21, 21, VW - 42, VH - 42, 15);
    ctx.strokeStyle = '#e8c46a'; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.restore();
    [[27, 27], [VW - 27, 27], [27, VH - 27], [VW - 27, VH - 27]].forEach((p, i) => {
      ctx.save(); ctx.globalAlpha = .55 + Math.sin(t * 1.6 + i) * 0.22;
      ctx.translate(p[0], p[1]); ctx.scale(1.3, 1.3);
      this.mote(ctx, 'star', '#d8a02c', t * 0.3, i);
      ctx.restore();
    });

    /* and the softest possible dark, so the buttons on top stay legible */
    const vg = ctx.createRadialGradient(VW / 2, VH * 0.5, VH * 0.3, VW / 2, VH * 0.5, VH);
    vg.addColorStop(0, 'rgba(40,16,60,0)'); vg.addColorStop(1, 'rgba(40,16,60,.34)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  }
};
