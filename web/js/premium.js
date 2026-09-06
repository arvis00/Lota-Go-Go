'use strict';
/* ---------------------------------------------------------------
   premium.js — the trailer for the extension, and the page it sells.

   Nothing here is a purchase. There is no payment, no receipt and no
   three-level trial: the two buttons at the bottom of the page say
   "netrukus" and do nothing on purpose. What does exist is the film,
   and the film is the whole pitch.

   THE FILM IS DRAWN BY HAND. Not "stylised" — drawn: every line in it
   wobbles, and it wobbles to a new place seven and a half times a
   second, the way ink boils in a hand-inked cartoon. Nothing is a
   rectangle. The paper grain is under all of it and the colour is put
   on in crayon strokes that miss the edges. The point is that it must
   never read as a recording of the game: the extension is a different
   world, and it looks like one.

   It runs a shade under two minutes, and it takes its time:

     I  · the page          a blank sheet draws itself into her house
                            she is bored · she notices a book
                            it opens · it takes her
     II · the other side    she lands · the Exit, far off
                            the first tile · and two hundred of them
     III· what is inside    four mini games, five seconds each, each
                            one shown until you have understood it
                            and then: they are one story
                            and then: the outfit that comes with it
     IV · back              the page shuts and PREMIUM lands on it

   Nothing here is loaded. Every frame is drawn from these lines.
----------------------------------------------------------------*/

/* The beats, in seconds. Nothing is allowed less than five: the old
   film gave a mini game 1.15 s, which is long enough to see that
   something happened and not long enough to see what. */
const PF = {
  /* I */
  DRAW: 0,        // the sheet, drawing itself
  ROOM: 6,        // she is in it, and she is bored
  NOTICE: 13,     // something on the shelf
  WALK: 19,       // over to it
  OPEN: 25,       // it opens on its own
  PULL: 31,       // and pulls
  /* II */
  LAND: 37,       // the other side
  LOOK: 44,       // the Exit, and it looks close
  TILE: 50,       // Level 1 under her paws
  BOARD: 56,      // and the rest of them
  DIVE: 66,       // in
  /* III */
  GAMES: 71,
  GAME_EACH: 5,   // × 4 = 20 s
  STORY: 91,
  GIFT: 99,
  /* IV */
  OUT: 107,
  END: 115
};

/* the crayon palette — the drawn world is not one colour, it is all of them */
const PF_COLS = ['#ff6b8a', '#ffc93a', '#5fd08a', '#5fb8f0', '#c08fe8', '#ff9a5a'];
/* the ink everything is outlined in: a soft pencil, never black */
const PF_INK = '#4a3b32';

/* ---------------------------------------------------------------
   THE HAND

   Every line below wobbles, and `boil` is what makes the wobble a
   drawing rather than a jitter: it holds still for an eighth of a
   second and then jumps, so the film runs on drawn frames instead of
   sliding about at sixty of them a second.
----------------------------------------------------------------*/
let PF_T = 0;                                   // the film's clock, for the boil
function boil() { return Math.floor(PF_T * 7.5) * 131; }

/* ---------- a hand-drawn line, wobbling in place ---------- */
function crayon(ctx, x1, y1, x2, y2, col, w, seed) {
  const r = makeRng((seed || 0) * 97 + 13 + boil());
  const n = 6;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i <= n; i++) {
    const k = i / n;
    ctx.lineTo(lerp(x1, x2, k) + (r() - .5) * 4, lerp(y1, y2, k) + (r() - .5) * 4);
  }
  ctx.strokeStyle = col; ctx.lineWidth = w || 3; ctx.lineCap = 'round'; ctx.stroke();
}

/** the same line, but only the first `p` of it has been drawn yet */
function crayonP(ctx, x1, y1, x2, y2, col, w, seed, p) {
  if (p <= 0) return;
  crayon(ctx, x1, y1, lerp(x1, x2, p), lerp(y1, y2, p), col, w, seed);
}

/** a hand-drawn path through a list of points */
function hpath(ctx, pts, col, w, seed, close, p) {
  if (pts.length < 2) return;
  const r = makeRng((seed || 0) * 61 + 7 + boil());
  const list = close ? pts.concat([pts[0]]) : pts;
  const upto = p == null ? list.length - 1 : (list.length - 1) * clamp(p, 0, 1);
  ctx.beginPath();
  ctx.moveTo(pts[0][0] + (r() - .5) * 3, pts[0][1] + (r() - .5) * 3);
  for (let i = 1; i < list.length; i++) {
    const k = clamp(upto - (i - 1), 0, 1);
    if (k <= 0) break;
    const a = list[i - 1], b = list[i];
    ctx.lineTo(lerp(a[0], b[0], k) + (r() - .5) * 3.4, lerp(a[1], b[1], k) + (r() - .5) * 3.4);
  }
  ctx.strokeStyle = col; ctx.lineWidth = w || 3;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}

/** a shape filled the way a child fills one: roughly, and past the line */
function hfill(ctx, pts, col, seed, slop) {
  const r = makeRng((seed || 0) * 43 + 11 + boil());
  const s = slop == null ? 3.5 : slop;
  ctx.beginPath();
  ctx.moveTo(pts[0][0] + (r() - .5) * s, pts[0][1] + (r() - .5) * s);
  for (let i = 1; i < pts.length; i++)
    ctx.lineTo(pts[i][0] + (r() - .5) * s, pts[i][1] + (r() - .5) * s);
  ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
}

/** a hand-drawn box: the fill first, then the line round it */
function hbox(ctx, x, y, w, h, fillCol, lineCol, lw, seed, p) {
  const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  if (fillCol && (p == null || p >= 1)) hfill(ctx, pts, fillCol, seed);
  hpath(ctx, pts, lineCol || PF_INK, lw || 3, seed + 1, true, p);
}

/** a hand-drawn circle */
function hcircle(ctx, x, y, rad, fillCol, lineCol, lw, seed, p) {
  const pts = [];
  for (let i = 0; i < 14; i++) {
    const a = i * TAU / 14;
    pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]);
  }
  if (fillCol && (p == null || p >= 1)) hfill(ctx, pts, fillCol, seed, 2.6);
  if (lineCol) hpath(ctx, pts, lineCol, lw || 3, seed + 2, true, p);
}

/** the scribble that fills one in */
function scribble(ctx, x, y, w, h, col, seed, alpha) {
  const r = makeRng(seed * 41 + 7 + boil());
  ctx.save(); ctx.globalAlpha = alpha == null ? .5 : alpha;
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let yy = y + 4; yy < y + h - 2; yy += 7) {
    ctx.beginPath();
    ctx.moveTo(x + 2 + r() * 5, yy);
    ctx.lineTo(x + w - 2 - r() * 5, yy + (r() - .5) * 5);
    ctx.stroke();
  }
  ctx.restore();
}

/** shading, the way a pencil does it: strokes all one way */
function hatch(ctx, x, y, w, h, col, seed, alpha, step) {
  const r = makeRng(seed * 17 + 5 + boil());
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.globalAlpha = alpha == null ? .3 : alpha;
  ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  const st = step || 11;
  for (let i = -h; i < w + h; i += st) {
    ctx.beginPath();
    ctx.moveTo(x + i + (r() - .5) * 3, y);
    ctx.lineTo(x + i + h + (r() - .5) * 3, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

/** paper: the grain the whole film sits on */
function paper(ctx, VW, VH, t) {
  ctx.fillStyle = '#fbf3e2'; ctx.fillRect(0, 0, VW, VH);
  ctx.save(); ctx.globalAlpha = .07;
  for (let i = 0; i < 120; i++) {
    const r = makeRng(i * 29 + 3);
    circle(ctx, r() * VW, r() * VH, 1 + r() * 2, '#8a7a5a');
  }
  ctx.restore();
}

const Premium = {
  film: null,
  /* where the film came from, so Skip and the end both go back to it */
  from: 'lobby',

  /* =================================================================
     THE PAGE
  ================================================================= */
  open(from) {
    this.from = from || 'lobby';
    Game.state = 'premium'; Game.stateT = 0;
    UI.showPremium();
  },
  close() {
    Game.lobby();
  },

  /** The page's own background, drawn behind the sheet: an open book with
      the whole extension pouring out of it. It is deliberately nothing like
      the lobby's rooms — this is the other side of the page, not a house. */
  drawScreen(G) {
    const ctx = G.ctx, VW = G.VW, VH = G.VH, t = G.t;
    PF_T = 0;                            /* the page does not boil; it is still */
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#1b0f38'); g.addColorStop(0.55, '#3a1560'); g.addColorStop(1, '#6b1f5c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 60; i++) {
      const r = makeRng(i * 47 + 11);
      ctx.save(); ctx.globalAlpha = .25 + Math.sin(t * 1.7 + i) * .25;
      circle(ctx, r() * VW, r() * VH * 0.8, 1.4 + r() * 1.6, '#fff6d8'); ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = .16;
    ctx.translate(VW / 2, VH * 0.92);
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i - 4.5) * 0.16 + Math.sin(t * 0.4) * 0.06;
      poly(ctx, [[0, 0], [Math.cos(a - .05) * VH * 1.5, Math.sin(a - .05) * VH * 1.5],
                 [Math.cos(a + .05) * VH * 1.5, Math.sin(a + .05) * VH * 1.5]],
        PF_COLS[imod(i, PF_COLS.length)]);
    }
    ctx.restore();
    for (let i = 0; i < 14; i++) {
      const r = makeRng(i * 63 + 5);
      const ph = ((t * 0.09) + r()) % 1;
      const x = VW * (0.06 + r() * 0.88), y = VH * 1.02 - ph * VH * 1.15;
      ctx.save();
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.85;
      ctx.translate(x, y); ctx.rotate(Math.sin(ph * 5 + i) * 0.2);
      const s = 0.5 + r() * 0.5;
      this.tile(ctx, 0, 0, 74 * s, 30 * s, '', PF_COLS[imod(i, PF_COLS.length)]);
      ctx.restore();
    }
    this.book(ctx, VW / 2, VH * 0.99, 1.5 + Math.sin(t * 0.9) * 0.03, 1);
    const vg = ctx.createRadialGradient(VW / 2, VH * 0.46, VH * 0.15, VW / 2, VH * 0.46, VH * 0.95);
    vg.addColorStop(0, 'rgba(10,4,22,.42)'); vg.addColorStop(1, 'rgba(10,4,22,.18)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  },

  /* =================================================================
     THE FILM — the driver
  ================================================================= */
  startFilm(from) {
    if (from) this.from = from;
    this.film = { t: 0, said: {} };
    Game.state = 'pfilm'; Game.stateT = 0;
    Sfx.init(); Sfx.resume();
    UI.showPremiumFilm();
  },

  /** one cue, once, at a given second */
  cue(c, key, at, fn) {
    if (!c.said[key] && c.t >= at) { c.said[key] = 1; fn(); }
  },

  stepFilm(dt) {
    const c = this.film;
    if (!c) return;
    c.t += dt;
    this.cue(c, 'sigh', PF.ROOM + 2.2, () => Sfx.yip());
    this.cue(c, 'see', PF.NOTICE + 1.0, () => Sfx.pop());
    this.cue(c, 'walk', PF.WALK + 0.2, () => Sfx.click());
    this.cue(c, 'fall', PF.WALK + 3.4, () => Sfx.thud());
    this.cue(c, 'open', PF.OPEN + 0.6, () => Sfx.unlock());
    this.cue(c, 'pull', PF.PULL + 0.3, () => Sfx.warp());
    this.cue(c, 'land', PF.LAND + 0.15, () => { Sfx.zone(); Game.fx.shake = 0.22; });
    this.cue(c, 'look', PF.LOOK + 0.4, () => Sfx.bone());
    this.cue(c, 'tile', PF.TILE + 0.3, () => Sfx.checkpoint());
    this.cue(c, 'board', PF.BOARD + 0.4, () => Sfx.zone());
    this.cue(c, 'many', PF.BOARD + 5.5, () => Sfx.unlock());
    this.cue(c, 'dive', PF.DIVE + 0.4, () => { Sfx.warp(); Sfx.boing(); });
    for (let i = 0; i < 4; i++) {
      this.cue(c, 'g' + i, PF.GAMES + i * PF.GAME_EACH + 0.2, () => Sfx.zone());
      this.cue(c, 'gw' + i, PF.GAMES + i * PF.GAME_EACH + 3.4, () => Sfx.bone());
    }
    this.cue(c, 'story', PF.STORY + 0.3, () => Sfx.checkpoint());
    this.cue(c, 'gift', PF.GIFT + 0.4, () => Sfx.unlock());
    this.cue(c, 'gift2', PF.GIFT + 3.6, () => Sfx.win());
    this.cue(c, 'out', PF.OUT + 0.5, () => { Sfx.crash(); Game.fx.shake = 0.45; });
    this.cue(c, 'end', PF.OUT + 1.6, () => Sfx.win());
    if (c.t > PF.END) this.endFilm();
  },

  endFilm() {
    if (!this.film) return;
    this.film = null;
    Sfx.hush();
    this.open(this.from);
  },

  drawFilm(G) {
    const ctx = G.ctx, VW = G.VW, VH = G.VH, c = this.film;
    if (!c) return;
    const T = c.t;
    PF_T = T;                                   /* every wobble below boils off this */

    if (T < PF.LAND) this.actHouse(ctx, VW, VH, T, G);
    else if (T < PF.DIVE) this.actWorld(ctx, VW, VH, T, G);
    else if (T < PF.GAMES) this.actDive(ctx, VW, VH, T, G);
    else if (T < PF.STORY) this.actGames(ctx, VW, VH, T, G);
    else if (T < PF.GIFT) this.actStory(ctx, VW, VH, T, G);
    else if (T < PF.OUT) this.actGift(ctx, VW, VH, T, G);
    else this.actOut(ctx, VW, VH, T, G);

    /* the one white frame at each seam */
    const flash = (a, b) => clamp(1 - Math.abs(T - a) / b, 0, 1);
    const wh = Math.max(flash(PF.LAND, 0.3), flash(PF.DIVE, 0.26), flash(PF.OUT, 0.3));
    if (wh > 0) { ctx.save(); ctx.globalAlpha = wh; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); }

    /* how much of it is left. It is nearly two minutes long — saying so is
       the difference between a viewer waiting and a viewer reaching for Skip */
    this.progress(ctx, VW, VH, T / PF.END);
  },

  progress(ctx, VW, VH, k) {
    const y = VH - 13, w = VW * 0.42, x = (VW - w) / 2;
    ctx.save();
    ctx.globalAlpha = .3;
    crayon(ctx, x, y, x + w, y, PF_INK, 3, 91);
    ctx.globalAlpha = .85;
    crayon(ctx, x, y, x + w * clamp(k, 0, 1), y, '#e0479c', 4, 92);
    ctx.restore();
  },

  /* =================================================================
     the two things every scene needs: a caption, and her
  ================================================================= */

  /** The caption. It is hand-lettered onto a torn strip of the same paper,
      because a clean bar of UI over a drawing breaks the spell faster than
      anything else in the film. */
  capt(ctx, VW, VH, main, sub, a, y0) {
    if (a <= 0) return;
    const y = y0 == null ? VH * 0.115 : y0;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const fs = Math.round(VH * 0.062);
    ctx.font = '900 ' + fs + 'px system-ui, sans-serif';
    const w = ctx.measureText(main).width + 46;
    /* the strip */
    hfill(ctx, [[VW / 2 - w / 2, y - fs * 0.85], [VW / 2 + w / 2, y - fs * 0.8],
                [VW / 2 + w / 2, y + fs * (sub ? 1.35 : 0.75)],
                [VW / 2 - w / 2, y + fs * (sub ? 1.3 : 0.7)]], 'rgba(255,250,238,.9)', 7, 5);
    hpath(ctx, [[VW / 2 - w / 2, y - fs * 0.85], [VW / 2 + w / 2, y - fs * 0.8],
                [VW / 2 + w / 2, y + fs * (sub ? 1.35 : 0.75)],
                [VW / 2 - w / 2, y + fs * (sub ? 1.3 : 0.7)]], PF_INK, 2.6, 8, true);
    ctx.font = '900 ' + fs + 'px system-ui, sans-serif';
    ctx.fillStyle = '#c9306a';
    ctx.fillText(main, VW / 2, y);
    if (sub) {
      ctx.font = '800 ' + Math.round(fs * 0.44) + 'px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(74,59,50,.85)';
      ctx.fillText(sub, VW / 2, y + fs * 0.72);
    }
    ctx.restore();
  },

  /** in over half a second, out over half a second, on for the rest */
  captA(T, a, b) { return Math.min(inv(T, a, a + 0.55), inv(b - T, 0, 0.55)); },

  /** Lota, drawn: the game's own dog, then gone over in crayon and ringed
      in soft pencil so she belongs to the page she is standing on. */
  drawnLota(ctx, x, y, s, o) {
    o = o || {};
    drawLota(ctx, x, y, {
      state: o.state || 'run', t: o.t || 0, run: (o.t || 0) * (o.runRate || 13),
      skin: Save.data.skin, scale: s, face: o.face || 'happy',
      tilt: o.tilt || 0, alpha: o.alpha, shadow: o.shadow !== false
    });
    /* the colour somebody went over her with, missing her edges */
    ctx.save();
    ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * 0.34;
    for (let i = 0; i < 7; i++) {
      const r = makeRng(i * 71 + 5 + boil());
      const px = x - 46 * s + r() * 92 * s, py = y - 96 * s + r() * 84 * s;
      crayon(ctx, px, py, px + 22 * s, py + (r() - .5) * 22 * s,
        PF_COLS[imod(i, PF_COLS.length)], 5 * s, i);
    }
    ctx.restore();
    /* the ground she is drawn standing on, dashed off in one stroke */
    if (o.ground !== false) {
      ctx.save(); ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * 0.4;
      crayon(ctx, x - 42 * s, y + 3, x + 42 * s, y + 3, '#5a4a3a', 3 * s, 21);
      ctx.restore();
    }
  },

  /** what she is thinking, in a bubble somebody drew round it */
  thought(ctx, x, y, r, a, draw) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    hcircle(ctx, x, y, r, 'rgba(255,252,244,.95)', PF_INK, 3, 12);
    hcircle(ctx, x - r * 0.75, y + r * 0.85, r * 0.22, 'rgba(255,252,244,.95)', PF_INK, 2.4, 13);
    hcircle(ctx, x - r * 0.95, y + r * 1.2, r * 0.12, 'rgba(255,252,244,.95)', PF_INK, 2, 14);
    ctx.save(); ctx.translate(x, y);
    if (draw) draw(ctx, r);
    ctx.restore();
    ctx.restore();
  },

  /* =================================================================
     ACT I · THE PAGE
     A blank sheet draws itself into her front room, she is bored in it,
     and then there is a book on the shelf that was not there before.
  ================================================================= */
  actHouse(ctx, VW, VH, T, G) {
    const floorY = VH * 0.74;
    paper(ctx, VW, VH, T);

    /* how far each thing has been drawn. Past the first beat, all of it. */
    const p = (a, b) => (T >= PF.ROOM ? 1 : inv(T, a, b));
    this.houseSet(ctx, VW, VH, T, G, p, floorY);

    /* the book: on the shelf, then off it, then open on the floor */
    const shX = VW * 0.775, shY = VH * 0.335;
    const bkFall = inv(T, PF.WALK + 2.6, PF.WALK + 3.4);
    const bkOpen = inv(T, PF.OPEN + 0.4, PF.OPEN + 2.2);
    const bx = lerp(shX, VW * 0.735, bkFall), by = lerp(shY, floorY - 4, bkFall * bkFall);
    if (p(3.2, 4.4) >= 1) {
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(bkFall * (1 - bkFall) * 3.4);
      /* it is the only thing on the page that glows, from the moment she
         notices it — that is the whole of the "look over there" */
      const glow = inv(T, PF.NOTICE, PF.NOTICE + 1.6) * (0.45 + Math.sin(T * 3) * 0.16);
      if (glow > 0) {
        ctx.save(); ctx.globalAlpha = glow;
        for (let i = 0; i < 5; i++) circle(ctx, 0, -14, 26 + i * 13, 'rgba(255,216,112,.16)');
        ctx.restore();
      }
      this.book(ctx, 0, 0, 0.72, bkOpen);
      ctx.restore();
    }

    /* the light and the colour coming out of it, over the drawn room */
    if (T >= PF.OPEN) {
      const k = inv(T, PF.OPEN + 1.0, PF.PULL + 2.0);
      ctx.save();
      ctx.globalAlpha = k * 0.5;
      ctx.translate(bx, by - 22);
      for (let i = 0; i < 11; i++) {
        const a = -Math.PI / 2 + (i - 5) * 0.17 + Math.sin(T * 0.8) * 0.05;
        poly(ctx, [[0, 0], [Math.cos(a - .06) * VH * 1.6, Math.sin(a - .06) * VH * 1.6],
                   [Math.cos(a + .06) * VH * 1.6, Math.sin(a + .06) * VH * 1.6]],
          PF_COLS[imod(i, PF_COLS.length)]);
      }
      ctx.restore();
      /* and the colour crawling across the whole page */
      ctx.save(); ctx.globalAlpha = k * 0.2;
      const cg = ctx.createRadialGradient(bx, by, 20, bx, by, VW * 0.9);
      cg.addColorStop(0, '#ffd870'); cg.addColorStop(0.5, '#e0479c'); cg.addColorStop(1, 'rgba(224,71,156,0)');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, VW, VH);
      ctx.restore();
    }

    /* the pull: everything that is loose goes round and round and in */
    if (T >= PF.PULL) {
      const suck = inv(T, PF.PULL, PF.LAND);
      ctx.save();
      ctx.globalAlpha = suck * 0.85;
      for (let i = 0; i < 30; i++) {
        const a = i * 0.62 + T * 4.2;
        const r0 = (1 - suck) * 270 + 18 + imod(i * 37, 120);
        const r2 = r0 * (1 - suck * 0.72);
        hcircle(ctx, bx + Math.cos(a) * r2 * 1.25, by - 54 + Math.sin(a) * r2 * 0.52,
          2.6 + (i % 4), PF_COLS[imod(i, PF_COLS.length)], null, 0, i + 30);
      }
      ctx.restore();
    }

    /* --------- her --------- */
    const rugX = VW * 0.29;
    let lx = rugX, ly = floorY + 2, st = 'sit', sc = 1.5, rot = 0, alpha = 1, face = 'calm';
    if (T < PF.ROOM) {
      /* she is being drawn too — she fades up out of the pencil */
      alpha = inv(T, 5.2, 6.2);
    } else if (T < PF.NOTICE) {
      face = 'calm';
    } else if (T < PF.WALK) {
      face = 'happy';
    } else if (T < PF.OPEN) {
      const k = smooth(inv(T, PF.WALK + 0.4, PF.WALK + 2.6));
      lx = lerp(rugX, VW * 0.63, k);
      st = k < 0.94 ? 'run' : 'sit';
      face = 'happy';
    } else if (T < PF.PULL) {
      lx = VW * 0.63; st = 'sit'; face = 'happy';
    } else {
      const k = smooth(inv(T, PF.PULL, PF.LAND));
      lx = lerp(VW * 0.63, bx, k);
      ly = lerp(floorY + 2, by - 34, k);
      st = 'jump';
      rot = -TAU * 2.2 * k;
      sc = lerp(1.5, 0.1, k * k);
      alpha = 1 - inv(k, 0.84, 1);
      face = 'happy';
    }
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rot);
    this.drawnLota(ctx, 0, 0, sc, {
      state: st, t: G.t, face: face, alpha: alpha, shadow: false, ground: false,
      tilt: (T >= PF.NOTICE && T < PF.WALK) ? -0.2 : (T < PF.NOTICE ? Math.sin(G.t * 0.7) * 0.1 : 0)
    });
    ctx.restore();

    /* the toy she has already played with, rolling to a stop */
    if (T >= PF.ROOM + 1.2 && T < PF.WALK) {
      const k = smooth(inv(T, PF.ROOM + 1.2, PF.ROOM + 3.4));
      const tx = lerp(-40, rugX + 96, k);
      ctx.save();
      ctx.translate(tx, floorY - 10);
      ctx.rotate(k * 9);
      hcircle(ctx, 0, 0, 15, '#ff6b8a', PF_INK, 3, 44);
      crayon(ctx, -13, 0, 13, 0, '#5fb8f0', 3, 45);
      ctx.restore();
    }

    /* the question over her head when she sees it */
    if (T >= PF.NOTICE + 0.5 && T < PF.WALK + 0.6) {
      const a = Math.min(inv(T, PF.NOTICE + 0.5, PF.NOTICE + 1.1), inv(PF.WALK + 0.6 - T, 0, 0.5));
      this.thought(ctx, lx + 74, floorY - 132, 28, a, (c2, r) => {
        c2.textAlign = 'center'; c2.textBaseline = 'middle';
        c2.font = '900 ' + Math.round(r * 1.5) + 'px system-ui, sans-serif';
        c2.fillStyle = '#c9306a'; c2.fillText('?', 0, 2);
      });
    }

    /* --------- what it is saying --------- */
    let m = '', s2 = '', a = 0;
    if (T < PF.ROOM) { m = 'LOTA GO'; s2 = 'viskas prasideda nuo tuščio lapo'; a = this.captA(T, 0.6, PF.ROOM - 0.2); }
    else if (T < PF.NOTICE) { m = 'Namie viskas jau ištyrinėta'; a = this.captA(T, PF.ROOM + 0.4, PF.NOTICE - 0.3); }
    else if (T < PF.WALK) { m = 'Bet lentynoje kažkas šviečia'; a = this.captA(T, PF.NOTICE + 0.4, PF.WALK - 0.3); }
    else if (T < PF.OPEN) { m = 'Knyga, kurios ji dar neatvertė'; a = this.captA(T, PF.WALK + 0.5, PF.OPEN - 0.3); }
    else if (T < PF.PULL) { m = 'Ji atsiverčia pati'; a = this.captA(T, PF.OPEN + 0.6, PF.PULL - 0.3); }
    else { m = '…ir įtraukia'; a = this.captA(T, PF.PULL + 0.4, PF.LAND - 0.3); }
    this.capt(ctx, VW, VH, m, s2, a);
  },

  /** The room, drawn line by line. `p(a,b)` is how much of the thing that
      starts at second a and finishes at second b has been put down yet —
      and the fills only arrive once the outline is closed, so it reads as
      somebody drawing, then colouring. */
  houseSet(ctx, VW, VH, T, G, p, floorY) {
    /* the floor */
    const pf = p(0.4, 1.8);
    crayonP(ctx, -10, floorY, VW + 10, floorY, PF_INK, 5, 2, pf);
    if (pf >= 1) {
      hatch(ctx, 0, floorY, VW, VH - floorY, '#d8b98a', 3, .3, 26);
      ctx.save(); ctx.globalAlpha = .3;
      for (let i = 0; i < 6; i++) crayon(ctx, VW * i / 6, floorY + 3, VW * i / 6 + 14, VH, '#c9a86a', 3, i + 60);
      ctx.restore();
    }
    /* the skirting */
    crayonP(ctx, -10, floorY - 13, VW + 10, floorY - 13, '#b08a5a', 4, 4, p(1.4, 2.4));

    /* the window, and the night in it */
    const wx = VW * 0.09, wy = VH * 0.17, ww = VW * 0.21, wh = VH * 0.27;
    const pw = p(2.2, 3.4);
    if (pw > 0) {
      hbox(ctx, wx, wy, ww, wh, pw >= 1 ? '#cfe0f0' : null, PF_INK, 3.4, 20, pw);
      if (pw >= 1) {
        crayon(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, PF_INK, 3, 21);
        crayon(ctx, wx, wy + wh / 2, wx + ww, wy + wh / 2, PF_INK, 3, 22);
        hcircle(ctx, wx + ww * 0.74, wy + wh * 0.26, 13, '#ffe07a', PF_INK, 2.4, 23);
        for (let i = 0; i < 7; i++) {
          const r = makeRng(i * 51 + 3);
          ctx.save(); ctx.globalAlpha = .5 + Math.sin(G.t * 2 + i) * .35;
          this.star(ctx, wx + 14 + r() * (ww - 28), wy + 12 + r() * (wh - 24), 4.5, '#ffd870');
          ctx.restore();
        }
      }
    }

    /* the shelf, and what is on it */
    const sx = VW * 0.56, sy = VH * 0.36, sw = VW * 0.30;
    const ps = p(3.2, 4.4);
    crayonP(ctx, sx, sy, sx + sw, sy, '#b08a5a', 6, 30, ps);
    if (ps >= 1) {
      /* the ordinary books, which are only there so one of them is not */
      for (let i = 0; i < 4; i++) {
        const bw = 15 + (i % 3) * 5, bh = 34 + (i % 2) * 10;
        hbox(ctx, sx + 12 + i * 24, sy - bh, bw, bh, PF_COLS[imod(i + 1, PF_COLS.length)], PF_INK, 2.4, 31 + i);
      }
      crayonP(ctx, sx - 4, sy + 4, sx - 4, sy + 30, '#b08a5a', 4, 36, 1);
      crayonP(ctx, sx + sw + 4, sy + 4, sx + sw + 4, sy + 30, '#b08a5a', 4, 37, 1);
    }

    /* the rug */
    const pr = p(4.2, 5.0);
    if (pr > 0) {
      const pts = [];
      for (let i = 0; i < 16; i++) {
        const a = i * TAU / 16;
        pts.push([VW * 0.29 + Math.cos(a) * VW * 0.14, floorY + 20 + Math.sin(a) * 22]);
      }
      if (pr >= 1) hfill(ctx, pts, '#f0a8c0', 40, 4);
      hpath(ctx, pts, '#c9306a', 3.4, 41, true, pr);
      if (pr >= 1) {
        ctx.save(); ctx.globalAlpha = .5;
        hatch(ctx, VW * 0.16, floorY, VW * 0.26, 42, '#ffffff', 42, .5, 14);
        ctx.restore();
      }
    }

    /* the lamp, and the warm patch it makes */
    const pl = p(4.8, 5.6);
    if (pl > 0) {
      crayonP(ctx, VW * 0.945, floorY, VW * 0.945, VH * 0.30, '#b08a5a', 5, 50, pl);
      if (pl >= 1) {
        hfill(ctx, [[VW * 0.885, VH * 0.30], [VW * 1.005, VH * 0.30],
                    [VW * 0.985, VH * 0.22], [VW * 0.905, VH * 0.22]], '#ffe07a', 51, 4);
        hpath(ctx, [[VW * 0.885, VH * 0.30], [VW * 1.005, VH * 0.30],
                    [VW * 0.985, VH * 0.22], [VW * 0.905, VH * 0.22]], PF_INK, 3, 52, true);
        ctx.save(); ctx.globalAlpha = .16;
        poly(ctx, [[VW * 0.885, VH * 0.31], [VW * 1.005, VH * 0.31],
                   [VW * 1.08, floorY + 40], [VW * 0.80, floorY + 40]], '#ffd870');
        ctx.restore();
      }
    }

    /* the pencil doing the drawing, on the end of whatever line is live */
    if (T < PF.ROOM - 0.2) this.pencil(ctx, VW, VH, T, floorY, p);
  },

  /** the pencil, put wherever the line being drawn has got to */
  pencil(ctx, VW, VH, T, floorY, p) {
    let x = 0, y = 0;
    const at = (a, b, fn) => { if (T >= a && T < b) { const q = inv(T, a, b); const pt = fn(q); x = pt[0]; y = pt[1]; } };
    at(0.4, 1.8, q => [lerp(-10, VW + 10, q), floorY]);
    at(1.4, 2.4, q => [lerp(-10, VW + 10, q), floorY - 13]);
    at(2.2, 3.4, q => [VW * 0.09 + VW * 0.21 * Math.min(1, q * 2), VH * 0.17 + VH * 0.27 * clamp(q * 2 - 1, 0, 1)]);
    at(3.2, 4.4, q => [lerp(VW * 0.56, VW * 0.86, q), VH * 0.36]);
    at(4.2, 5.0, q => [VW * 0.29 + Math.cos(q * TAU) * VW * 0.14, floorY + 20 + Math.sin(q * TAU) * 22]);
    at(4.8, 5.6, q => [VW * 0.945, lerp(floorY, VH * 0.30, q)]);
    if (!x && !y) return;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(-0.6);
    hfill(ctx, [[3, 0], [10, -13], [-4, -13], [-1, 0]], '#e8b23a', 70, 1.6);
    hfill(ctx, [[10, -13], [-4, -13], [-4, -62], [10, -62]], '#f2c94c', 71, 2);
    hfill(ctx, [[10, -62], [-4, -62], [-4, -74], [10, -74]], '#e0479c', 72, 2);
    hpath(ctx, [[3, 0], [10, -13], [10, -74], [-4, -74], [-4, -13], [-1, 0]], PF_INK, 2.4, 73, true);
    ctx.restore();
  },

  /** a five-pointed star, drawn rather than filled */
  star(ctx, x, y, r, col) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5 - Math.PI / 2;
      const rr0 = i % 2 ? r * 0.42 : r;
      pts.push([x + Math.cos(a) * rr0, y + Math.sin(a) * rr0]);
    }
    hfill(ctx, pts, col, 80, 1.4);
  },

  /* =================================================================
     ACT II · THE OTHER SIDE
     She lands in it, sees the way out, finds the first tile — and then
     finds out how far the way out actually is.
  ================================================================= */
  actWorld(ctx, VW, VH, T, G) {
    const groundY = VH * 0.76;
    this.crayonLand(ctx, VW, VH, T, G, groundY);

    if (T < PF.TILE) this.shotArrive(ctx, VW, VH, T, G, groundY);
    else this.shotTiles(ctx, VW, VH, T, G, groundY);

    let m = '', s2 = '', a = 0;
    if (T < PF.LOOK) {
      m = 'Kita knygos pusė'; s2 = 'čia viskas nupiešta ranka';
      a = this.captA(T, PF.LAND + 0.5, PF.LOOK - 0.3);
    } else if (T < PF.TILE) {
      m = 'Išėjimas atrodo visai netoli'; a = this.captA(T, PF.LOOK + 0.4, PF.TILE - 0.3);
    } else if (T < PF.BOARD) {
      m = 'Pirmoji plytelė'; s2 = 'LEVEL 1'; a = this.captA(T, PF.TILE + 0.4, PF.BOARD - 0.3);
    } else {
      m = '…ir jų dar 200'; a = this.captA(T, PF.BOARD + 0.6, PF.DIVE - 0.3);
    }
    this.capt(ctx, VW, VH, m, s2, a);
  },

  /** paper, a scribbled sky, a sun somebody was pleased with, and grass */
  crayonLand(ctx, VW, VH, T, G, groundY) {
    paper(ctx, VW, VH, T);
    ctx.save(); ctx.globalAlpha = .28;
    for (let i = 0; i < 40; i++) {
      const r = makeRng(i * 53 + 17);
      const px = r() * VW, py = r() * groundY * 0.85;
      crayon(ctx, px, py, px + 30 + r() * 34, py + (r() - .5) * 12, '#9fd8f2', 5, i);
    }
    ctx.restore();
    /* clouds, drawn as loops */
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 3; i++) {
      const cx = VW * (0.14 + i * 0.3) + Math.sin(T * 0.22 + i) * 10, cy = VH * (0.28 + (i % 2) * 0.07);
      for (let k = 0; k < 5; k++) {
        const a = Math.PI + k * (Math.PI / 4);
        crayon(ctx, cx + Math.cos(a) * 34, cy + Math.sin(a) * 16,
          cx + Math.cos(a + 0.8) * 34, cy + Math.sin(a + 0.8) * 16, '#bfe4f6', 4, i * 9 + k);
      }
    }
    ctx.restore();
    /* the sun */
    ctx.save(); ctx.globalAlpha = .95;
    for (let i = 0; i < 9; i++) {
      const a = i * (TAU / 9) + T * 0.22;
      crayon(ctx, VW * 0.88 + Math.cos(a) * 30, VH * 0.22 + Math.sin(a) * 30,
        VW * 0.88 + Math.cos(a) * 48, VH * 0.22 + Math.sin(a) * 48, '#ffc93a', 4, i);
    }
    hcircle(ctx, VW * 0.88, VH * 0.22, 26, '#ffe07a', '#e8a02c', 3, 90);
    ctx.restore();
    /* the ground, and things pushed into it */
    ctx.fillStyle = 'rgba(150,214,116,.5)'; ctx.fillRect(0, groundY, VW, VH - groundY);
    crayon(ctx, -10, groundY, VW + 10, groundY, '#4f9c5a', 5, 2);
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 90; i++) {
      const r = makeRng(i * 29 + 5);
      const gx = r() * VW, gy = groundY + 5 + r() * (VH - groundY);
      crayon(ctx, gx, gy, gx + (r() - .5) * 8, gy - 9 - r() * 12, i % 4 ? '#4f9c5a' : '#7fc45a', 3, i);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .9;
    for (let i = 0; i < 7; i++) {
      const r = makeRng(i * 43 + 7);
      const fx = r() * VW, fy = groundY + 16 + r() * (VH - groundY - 26);
      crayon(ctx, fx, fy + 13, fx + (r() - .5) * 6, fy, '#4f9c5a', 3, i + 40);
      hcircle(ctx, fx, fy - 3, 5, PF_COLS[imod(i, PF_COLS.length)], null, 0, i + 55);
    }
    ctx.restore();
  },

  /** she lands, she picks herself up, she sees the Exit and goes for it */
  shotArrive(ctx, VW, VH, T, G, groundY) {
    /* the way out is NOT crayon: it is the same door the levels and the home
       pages use, and its being the only solid thing on the page is the shot */
    this.exitDoor(ctx, VW * 0.86, groundY, 1.1, T);

    let lx, st = 'sit', tilt = 0;
    if (T < PF.LAND + 1.4) {
      /* the landing: she drops in from the top of the page */
      const k = smooth(inv(T, PF.LAND, PF.LAND + 0.7));
      lx = VW * 0.16;
      const ly = lerp(-VH * 0.3, groundY, k);
      ctx.save(); ctx.globalAlpha = 1 - k * 0.2;
      this.drawnLota(ctx, lx, ly, 1.35, { state: 'jump', t: G.t, face: 'happy', ground: k >= 1 });
      ctx.restore();
      if (k >= 1) this.puff(ctx, lx, groundY, inv(T, PF.LAND + 0.7, PF.LAND + 1.4));
      return;
    }
    if (T < PF.LOOK) {
      lx = VW * 0.16; st = 'sit'; tilt = Math.sin((T - PF.LAND) * 1.6) * 0.22;
    } else {
      const k = smooth(inv(T, PF.LOOK + 0.8, PF.TILE));
      lx = lerp(VW * 0.16, VW * 0.44, k);
      st = k > 0.02 && k < 0.97 ? 'run' : 'sit';
    }
    this.drawnLota(ctx, lx, groundY, 1.35, { state: st, t: G.t, face: 'happy', tilt: tilt });

    /* her eyeline: a dotted crayon arc from her nose to the door */
    if (T >= PF.LOOK) {
      ctx.save();
      ctx.globalAlpha = .45 + Math.sin(T * 4) * .15;
      ctx.setLineDash([9, 12]);
      ctx.beginPath();
      ctx.moveTo(lx + 44, groundY - 78);
      ctx.quadraticCurveTo((lx + VW * 0.86) / 2, groundY - 190, VW * 0.80, groundY - 96);
      ctx.strokeStyle = '#e0479c'; ctx.lineWidth = 4; ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  },

  /** the little cloud of paper dust she lands in */
  puff(ctx, x, y, k) {
    if (k <= 0 || k >= 1) return;
    ctx.save(); ctx.globalAlpha = (1 - k) * 0.8;
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + i * (Math.PI / 6);
      hcircle(ctx, x + Math.cos(a) * (30 + k * 60), y - 6 + Math.sin(a) * (14 + k * 20),
        7 + (i % 3) * 4, 'rgba(240,230,210,.9)', '#c9b89a', 2, i + 20);
    }
    ctx.restore();
  },

  /** Level 1 under her paws, and then the rest of them.

      The camera does not zoom — the board unfolds. One tile becomes a row,
      the row becomes a board that snakes back and forth up the page, and by
      the end two hundred of them are on the screen at a size you can still
      see, which a real pull-back would have turned into two hundred specks.
      It takes ten seconds on purpose: the number is the pitch, so it is
      counted out rather than announced. */
  shotTiles(ctx, VW, VH, T, G, groundY) {
    const N = 200;
    let k;
    if (T < PF.BOARD) k = 0;
    else k = smooth(inv(T, PF.BOARD + 0.6, PF.DIVE - 0.6));
    /* the count does not run linearly: one, then a few, then all of them */
    const shown = Math.max(1, Math.round(1 + (N - 1) * k * k));

    const cols = Math.min(20, shown);
    const rows = Math.ceil(shown / cols);
    const bx0 = lerp(VW * 0.44, VW * 0.10, k), bx1 = VW * 0.84;
    const pitch = cols <= 1 ? 96 : Math.min(96, (bx1 - bx0) / (cols - 1));
    const rowH = rows <= 1 ? 0 : Math.min(56, (groundY - VH * 0.30) / (rows - 1));
    const tw = Math.min(92, pitch * 0.94), th = Math.max(11, tw * 0.4);

    const at = i => {
      const r0 = Math.floor(i / cols), c0 = i % cols;
      const c = (r0 % 2) ? cols - 1 - c0 : c0;
      return [bx0 + c * pitch, groundY - 6 - r0 * rowH];
    };
    /* the thread the board is strung on, so it reads as one path */
    if (shown > 1) {
      ctx.save(); ctx.globalAlpha = .3;
      ctx.beginPath();
      for (let i = 0; i < shown; i++) { const p = at(i); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
      ctx.strokeStyle = '#4f9c5a'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.restore();
    }
    for (let i = shown - 1; i >= 0; i--) {
      const p = at(i);
      ctx.save();
      ctx.globalAlpha = i === 0 ? 1 : clamp(1 - i / (N * 2.2), 0.5, 1);
      this.tile(ctx, p[0], p[1], i === 0 ? Math.max(tw, 66) : tw,
        i === 0 ? Math.max(th, 27) : th,
        i === 0 ? 'LEVEL 1' : (pitch > 44 ? String(i + 1) : ''),
        i === 0 ? '#4fd07a' : '#3fae66', i === 0 ? T : 0);
      ctx.restore();
    }
    /* past the last of them, the door she thought she was running to */
    const last = at(shown - 1);
    this.exitDoor(ctx, clamp(last[0] + Math.max(70, pitch * 1.5), 0, VW * 0.95),
      last[1], lerp(1.1, 0.5, k), T);
    /* her, standing on the first one and looking down the rest */
    this.drawnLota(ctx, bx0 - pitch * 0.16 * k, groundY - Math.max(24, th * 0.7),
      lerp(1.35, 0.6, k), {
        state: 'sit', t: G.t, face: 'happy',
        tilt: (T >= PF.TILE + 1.4 && k < 0.7) ? 0.2 : 0, ground: false
      });
    /* the count, written out as it climbs */
    if (k > 0.02) {
      ctx.save();
      ctx.globalAlpha = clamp(k * 2.4, 0, 1);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(VH * 0.13) + 'px system-ui, sans-serif';
      ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,251,242,.95)';
      const label = shown >= N ? '200' : String(shown);
      ctx.strokeText(label, VW * 0.955, VH * 0.30);
      ctx.fillStyle = '#e0479c';
      ctx.fillText(label, VW * 0.955, VH * 0.30);
      ctx.font = '900 ' + Math.round(VH * 0.038) + 'px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(74,59,50,.8)';
      ctx.fillText('LYGIŲ', VW * 0.955, VH * 0.385);
      ctx.restore();
    }
  },

  /* ---------- into the first tile ---------- */
  actDive(ctx, VW, VH, T, G) {
    const k = smooth(inv(T, PF.DIVE, PF.GAMES - 0.4));
    const groundY = VH * 0.76;
    this.crayonLand(ctx, VW, VH, T, G, groundY);

    const tx = VW * 0.5, ty = groundY - 6;
    ctx.save(); ctx.globalAlpha = .5 + k * 0.45;
    for (let i = 0; i < 9; i++) {
      const w = 30 + i * 26 * (0.4 + k);
      ctx.save(); ctx.globalAlpha = (0.5 - i * 0.045) * (0.4 + k);
      fillEll(ctx, tx, ty - 6, w, w * 0.34, PF_COLS[imod(i, PF_COLS.length)]);
      ctx.restore();
    }
    ctx.restore();
    this.tile(ctx, tx, ty, 108, 42, 'LEVEL 1', '#4fd07a', T);

    ctx.save();
    ctx.translate(tx, lerp(groundY - 190, ty - 6, k));
    ctx.rotate(-TAU * 1.6 * k);
    ctx.scale(1 - k * 0.88, 1 - k * 0.88);
    this.drawnLota(ctx, 0, 0, 1.4, { state: 'jump', t: G.t, runRate: 16, face: 'happy', shadow: false, ground: false });
    ctx.restore();

    ctx.save(); ctx.globalAlpha = k * 0.8;
    for (let i = 0; i < 24; i++) {
      const a = i * 0.52 + T * 6;
      const r0 = (1 - k) * 300 + 30;
      hcircle(ctx, tx + Math.cos(a) * r0 * 1.2, ty - 40 + Math.sin(a) * r0 * 0.5,
        3 + (i % 3), PF_COLS[imod(i, PF_COLS.length)], null, 0, i + 12);
    }
    ctx.restore();
    this.capt(ctx, VW, VH, 'Į vidų', '', this.captA(T, PF.DIVE + 0.3, PF.GAMES - 0.3));
  },

  /* =================================================================
     ACT III · WHAT IS ACTUALLY IN THERE
     Four of them, five seconds each. Five seconds is the whole point:
     a mini game shown for one is a flash of colour, and a flash of
     colour sells nothing. Each one is set up, played and won while you
     watch, and the line under it says what it is for.
  ================================================================= */
  actGames(ctx, VW, VH, T, G) {
    const idx = clamp(Math.floor((T - PF.GAMES) / PF.GAME_EACH), 0, 3);
    const u = (T - PF.GAMES) - idx * PF.GAME_EACH;      /* 0 → 5, inside this one */
    const fade = Math.min(inv(u, 0, 0.3), inv(PF.GAME_EACH - u, 0, 0.3));

    [this.gQuiz, this.gMemory, this.gMaze, this.gObstacle][idx].call(this, ctx, VW, VH, u, G);

    const names = ['VIKTORINA', 'ATMINTIS', 'LABIRINTAS', 'KLIŪTYS'];
    const subs = ['Klausimai, į kuriuos smagu atsakyti',
                  'Atmink, kur kas buvo paslėpta',
                  'Rask kelią — bėgti čia neužtenka',
                  'Kliūtys, kokių įprastame žaidime nėra'];
    this.capt(ctx, VW, VH, names[idx], subs[idx], fade);

    /* the wipe between one and the next */
    if (fade < 1) {
      ctx.save(); ctx.globalAlpha = (1 - fade) * 0.9;
      paper(ctx, VW, VH, T);
      ctx.restore();
    }
  },

  /** every mini game sits on the same sheet, with its own wash over it */
  gSheet(ctx, VW, VH, T, col) {
    paper(ctx, VW, VH, T);
    ctx.save(); ctx.globalAlpha = .3;
    ctx.fillStyle = col; ctx.fillRect(0, 0, VW, VH);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .3;
    hatch(ctx, 0, VH * 0.72, VW, VH * 0.28, col, 6, .5, 17);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    hpath(ctx, [[16, 16], [VW - 16, 16], [VW - 16, VH - 16], [16, VH - 16]], PF_INK, 3, 9, true);
    ctx.restore();
  },

  /** the tick somebody draws when it is right */
  tick(ctx, x, y, s, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    hpath(ctx, [[x - 16 * s, y], [x - 4 * s, y + 13 * s], [x + 18 * s, y - 16 * s]],
      '#2f9c5a', 7 * s, 88, false, clamp(a * 1.6, 0, 1));
    ctx.restore();
  },

  /** 1 · a question, three answers, and Lota working it out */
  gQuiz(ctx, VW, VH, u, G) {
    this.gSheet(ctx, VW, VH, u, '#9fd0f2');
    /* the question, on a torn-out sheet */
    const bw = VW * 0.62, bh = VH * 0.15, bx = (VW - bw) / 2, by = VH * 0.26;
    hbox(ctx, bx, by, bw, bh, '#fffaf0', PF_INK, 3.4, 100);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 ' + Math.round(VH * 0.055) + 'px system-ui, sans-serif';
    ctx.fillStyle = '#3a2b26';
    ctx.fillText('KIEK KOJŲ TURI ŠUO?', VW / 2, by + bh / 2);
    ctx.restore();

    /* she thinks about it for two whole seconds, and you can see her do it */
    const picked = u > 3.0;
    ['2', '4', '6'].forEach((s, i) => {
      const x = VW * (0.24 + i * 0.26), y = VH * 0.58, w = VW * 0.16, h = VH * 0.13;
      const on = picked && i === 1;
      /* the one she is looking at right now, before she commits */
      const hover = !picked && u > 1.1 && imod(Math.floor((u - 1.1) * 1.6), 3) === i;
      hbox(ctx, x - w / 2, y - h / 2, w, h,
        on ? '#7fe0a0' : (hover ? '#ffe8a8' : '#fffaf0'), PF_INK, 3.4, 101 + i);
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(VH * 0.08) + 'px system-ui, sans-serif';
      ctx.fillStyle = '#3a2b26';
      ctx.fillText(s, x, y);
      ctx.restore();
      if (on) this.tick(ctx, x + w * 0.42, y - h * 0.42, 1, inv(u, 3.1, 3.7));
    });

    this.thought(ctx, VW * 0.80, VH * 0.20, VH * 0.075, Math.min(inv(u, 0.8, 1.4), inv(3.2 - u, 0, 0.4)),
      (c2, r) => {
        c2.textAlign = 'center'; c2.textBaseline = 'middle';
        c2.font = '900 ' + Math.round(r * 1.1) + 'px system-ui, sans-serif';
        c2.fillStyle = '#c9306a';
        c2.fillText(['?', '2?', '4?'][imod(Math.floor(u * 2), 3)], 0, 2);
      });

    this.drawnLota(ctx, VW * 0.5, VH * 0.95, 1.15, {
      state: picked ? 'jump' : 'sit', t: G.t, face: 'happy',
      tilt: picked ? 0 : Math.sin(u * 2) * 0.16, ground: false
    });
  },

  /** 2 · cards drawn face down, turned over two at a time */
  gMemory(ctx, VW, VH, u, G) {
    this.gSheet(ctx, VW, VH, u, '#c8a0ea');
    const cols = 4, rows = 2, cw = VW * 0.13, ch = VH * 0.19;
    /* one pair a second, and the pair that has just matched is ringed */
    const pair = Math.floor(clamp(u - 0.9, 0, 4) / 0.95);
    const order = [[0, 5], [1, 4], [2, 7], [3, 6]];
    for (let r0 = 0; r0 < rows; r0++) for (let c0 = 0; c0 < cols; c0++) {
      const i = r0 * cols + c0;
      const x = VW * 0.5 + (c0 - (cols - 1) / 2) * (cw + 16);
      const y = VH * 0.46 + (r0 - (rows - 1) / 2) * (ch + 16);
      let open = false, matched = false;
      for (let q = 0; q <= pair && q < 4; q++)
        if (order[q].indexOf(i) >= 0) { open = true; if (q < pair) matched = true; }
      /* the turn itself: the card squashes flat and comes back the other way */
      const local = clamp(u - 0.9 - pair * 0.95, 0, 1);
      const turning = open && !matched && local < 0.34;
      const sq = turning ? Math.abs(Math.cos(local / 0.34 * Math.PI)) : 1;
      ctx.save();
      ctx.translate(x, y); ctx.scale(sq, 1);
      hbox(ctx, -cw / 2, -ch / 2, cw, ch, open && !turning ? '#fffaf0' : '#a06fe0', PF_INK, 3.4, 110 + i);
      if (open && !turning) {
        ctx.save(); ctx.translate(0, 4);
        if (i % 2) Levels.toyBall(ctx, 0, 0, Math.min(cw, ch) * 0.26, G.t, i);
        else boneIcon(ctx, 0, 0, Math.min(cw, ch) * 0.021, G.t);
        ctx.restore();
      } else if (!open) {
        ctx.save();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 ' + Math.round(ch * 0.46) + 'px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText('?', 0, 0);
        ctx.restore();
      }
      ctx.restore();
      if (matched) {
        ctx.save(); ctx.globalAlpha = .8;
        hcircle(ctx, x, y, Math.max(cw, ch) * 0.6, null, '#2f9c5a', 4, 120 + i);
        ctx.restore();
      }
    }
    if (pair >= 3) this.tick(ctx, VW * 0.5, VH * 0.78, 1.5, inv(u, 3.9, 4.4));
    this.drawnLota(ctx, VW * 0.12, VH * 0.95, 1.1, {
      state: 'sit', t: G.t, face: 'calm', ground: false,
      tilt: Math.sin(u * 1.4) * 0.12
    });
  },

  /** 3 · a maze in pencil, and the route worked out one square at a time */
  gMaze(ctx, VW, VH, u, G) {
    this.gSheet(ctx, VW, VH, u, '#8fd0a8');
    const cell = Math.min(VW, VH) * 0.095;
    const cols = 9, rows = 5;
    const ox = VW / 2 - cols * cell / 2, oy = VH * 0.30;
    ctx.save(); ctx.globalAlpha = .5;
    for (let r0 = 0; r0 <= rows; r0++) crayon(ctx, ox, oy + r0 * cell, ox + cols * cell, oy + r0 * cell, '#9a8a7a', 2, r0);
    for (let c0 = 0; c0 <= cols; c0++) crayon(ctx, ox + c0 * cell, oy, ox + c0 * cell, oy + rows * cell, '#9a8a7a', 2, c0 + 20);
    ctx.restore();
    /* the walls, fixed by seed so the maze is the same maze each play */
    for (let i = 0; i < 22; i++) {
      const r = makeRng(i * 59 + 3);
      const c0 = Math.floor(r() * cols), r1 = Math.floor(r() * rows);
      if (r() > 0.5) crayon(ctx, ox + c0 * cell, oy + r1 * cell, ox + (c0 + 1) * cell, oy + r1 * cell, '#2f7a52', 6, i + 40);
      else crayon(ctx, ox + c0 * cell, oy + r1 * cell, ox + c0 * cell, oy + (r1 + 1) * cell, '#2f7a52', 6, i + 60);
    }
    /* the route, thought out slowly, with two wrong turns rubbed out */
    const path = [[0, 2], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [4, 2], [5, 2], [5, 3], [6, 3], [7, 3], [8, 3]];
    const upto = clamp(Math.round(inv(u, 0.7, 4.0) * path.length), 1, path.length);
    ctx.save(); ctx.globalAlpha = .92;
    for (let i = 1; i < upto; i++) {
      const a = path[i - 1], b = path[i];
      crayon(ctx, ox + (a[0] + .5) * cell, oy + (a[1] + .5) * cell,
        ox + (b[0] + .5) * cell, oy + (b[1] + .5) * cell, '#e8a02c', 7, i + 80);
    }
    ctx.restore();
    const head = path[upto - 1];
    this.drawnLota(ctx, ox + (head[0] + 0.5) * cell, oy + (head[1] + 1) * cell, 0.6, {
      state: upto < path.length ? 'run' : 'sit', t: G.t, runRate: 14, face: 'happy', ground: false
    });
    this.star(ctx, ox + 8.5 * cell, oy + 2.9 * cell, cell * 0.34, '#ffc93a');
    if (upto >= path.length) this.tick(ctx, ox + (cols + 0.7) * cell, oy + 2.9 * cell, 1.2, inv(u, 4.0, 4.5));
  },

  /** 4 · obstacles, but not the ones she already knows how to jump */
  gObstacle(ctx, VW, VH, u, G) {
    this.gSheet(ctx, VW, VH, u, '#f0b070');
    const floorY = VH * 0.80;
    crayon(ctx, -10, floorY, VW + 10, floorY, '#8a5a2c', 6, 2);
    ctx.save(); ctx.globalAlpha = .4;
    hatch(ctx, 0, floorY, VW, VH - floorY, '#8a5a2c', 7, .5, 15);
    ctx.restore();
    /* things on strings, which is a matter of timing rather than reflex */
    for (let i = 0; i < 4; i++) {
      const x = VW * (0.24 + i * 0.19);
      const a = Math.sin(G.t * 1.9 + i * 1.3) * 0.55;
      ctx.save();
      ctx.translate(x, VH * 0.14); ctx.rotate(a);
      crayon(ctx, 0, 0, 0, VH * 0.34, '#8a5a2c', 4, i + 10);
      hcircle(ctx, 0, VH * 0.37, VH * 0.05, PF_COLS[imod(i, PF_COLS.length)], PF_INK, 3, i + 30);
      ctx.restore();
    }
    /* stones that are only there some of the time */
    for (let i = 0; i < 5; i++) {
      const x = VW * (0.14 + i * 0.18);
      const up = Math.sin(G.t * 2.6 + i * 1.1) > -0.2;
      ctx.save(); ctx.globalAlpha = up ? 1 : .28;
      hbox(ctx, x - 36, floorY - 16, 72, 18, up ? '#ffd870' : '#c9b89a', PF_INK, 3, 140 + i);
      ctx.restore();
    }
    /* and her, timing it */
    const k = inv(u, 0.5, 4.3);
    this.drawnLota(ctx, VW * (0.14 + k * 0.68), floorY - 16 - Math.abs(Math.sin(u * 4.4)) * 74, 1.15, {
      state: 'jump', t: G.t, runRate: 16, face: 'happy', ground: false
    });
    if (u > 4.2) this.tick(ctx, VW * 0.86, floorY - 90, 1.4, inv(u, 4.2, 4.7));
  },

  /* =================================================================
     …and they are not four things. They are one.
  ================================================================= */
  actStory(ctx, VW, VH, T, G) {
    const u = T - PF.STORY;
    paper(ctx, VW, VH, T);
    ctx.save(); ctx.globalAlpha = .22;
    ctx.fillStyle = '#e0b0f0'; ctx.fillRect(0, 0, VW, VH);
    ctx.restore();

    /* four panels, drawn as a comic strip is drawn */
    const n = 4, pw = VW * 0.19, ph = VH * 0.28, gap = VW * 0.045;
    const total = n * pw + (n - 1) * gap, x0 = (VW - total) / 2, y0 = VH * 0.36;
    const shown = clamp(inv(u, 0.4, 4.6) * n, 0, n);
    /* the thread that ties them together, drawn last but sitting under them */
    if (shown > 1) {
      ctx.save(); ctx.globalAlpha = .8;
      for (let i = 1; i < Math.ceil(shown); i++) {
        const a = x0 + (i - 1) * (pw + gap) + pw, b = x0 + i * (pw + gap);
        crayon(ctx, a, y0 + ph * 0.5, b, y0 + ph * 0.5, '#c9306a', 5, i + 200);
        poly(ctx, [[b, y0 + ph * 0.5], [b - 11, y0 + ph * 0.5 - 7], [b - 11, y0 + ph * 0.5 + 7]], '#c9306a');
      }
      ctx.restore();
    }
    for (let i = 0; i < n; i++) {
      const p = clamp(shown - i, 0, 1);
      if (p <= 0) continue;
      const x = x0 + i * (pw + gap);
      hbox(ctx, x, y0, pw, ph, p >= 1 ? '#fffaf0' : null, PF_INK, 3.4, 210 + i, p);
      if (p < 1) continue;
      ctx.save();
      ctx.beginPath(); ctx.rect(x + 4, y0 + 4, pw - 8, ph - 8); ctx.clip();
      this.panel(ctx, i, x, y0, pw, ph, G, u);
      ctx.restore();
      /* the panel's number, in the corner the way a comic does it */
      ctx.save();
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.font = '900 ' + Math.round(VH * 0.03) + 'px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(74,59,50,.55)';
      ctx.fillText(String(i + 1), x + 9, y0 + 7);
      ctx.restore();
    }
    this.capt(ctx, VW, VH, 'Ir visa tai — viena istorija',
      'kiekvienas mini žaidimas veda toliau', this.captA(u, 0.4, PF.GIFT - PF.STORY - 0.3));
  },

  /** one frame of the strip */
  panel(ctx, i, x, y, w, h, G, u) {
    const cx = x + w / 2, cy = y + h * 0.62;
    ctx.save(); ctx.globalAlpha = .5;
    hatch(ctx, x, y + h * 0.62, w, h * 0.38, '#c9b89a', i + 220, .5, 13);
    ctx.restore();
    crayon(ctx, x + 6, y + h * 0.66, x + w - 6, y + h * 0.66, '#8a7a5a', 3, i + 230);
    if (i === 0) {                       /* she goes in */
      this.tile(ctx, cx, y + h * 0.66, w * 0.5, w * 0.2, '1', '#4fd07a', 0);
      drawLota(ctx, cx, y + h * 0.6, { state: 'jump', t: G.t, run: G.t * 14, skin: Save.data.skin, scale: 0.42, face: 'happy', shadow: false });
    } else if (i === 1) {                /* she finds something */
      hbox(ctx, cx - w * 0.18, y + h * 0.28, w * 0.36, h * 0.2, '#fffaf0', PF_INK, 2.4, 240);
      ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(h * 0.13) + 'px system-ui, sans-serif';
      ctx.fillStyle = '#c9306a'; ctx.fillText('?', cx, y + h * 0.38); ctx.restore();
      drawLota(ctx, cx, y + h * 0.64, { state: 'sit', t: G.t, skin: Save.data.skin, scale: 0.42, face: 'happy', shadow: false });
    } else if (i === 2) {                /* somebody else is in it too */
      drawLota(ctx, cx - w * 0.16, y + h * 0.64, { state: 'run', t: G.t, run: G.t * 12, skin: Save.data.skin, scale: 0.4, face: 'happy', shadow: false });
      ctx.save(); ctx.globalAlpha = .8;
      hcircle(ctx, cx + w * 0.17, y + h * 0.5, w * 0.1, '#c08fe8', PF_INK, 2.4, 250);
      hcircle(ctx, cx + w * 0.13, y + h * 0.44, w * 0.03, '#fffaf0', PF_INK, 1.6, 251);
      hcircle(ctx, cx + w * 0.21, y + h * 0.44, w * 0.03, '#fffaf0', PF_INK, 1.6, 252);
      ctx.restore();
    } else {                             /* and there is a door at the end */
      ctx.save(); ctx.translate(cx, y + h * 0.66); ctx.scale(0.42, 0.42);
      this.exitDoor(ctx, 0, 0, 1, G.t);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .9 * (0.6 + Math.sin(u * 4) * 0.4);
      this.star(ctx, cx + w * 0.24, y + h * 0.3, w * 0.09, '#ffc93a');
      ctx.restore();
    }
  },

  /* =================================================================
     and the thing she gets to keep
  ================================================================= */
  actGift(ctx, VW, VH, T, G) {
    const u = T - PF.GIFT;
    paper(ctx, VW, VH, T);
    ctx.save(); ctx.globalAlpha = .25;
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#ffd870'); g.addColorStop(1, '#e0479c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    ctx.restore();

    const bx = VW * 0.5, by = VH * 0.90, bw = VW * 0.26, bh = VH * 0.20;
    const top = by - bh;
    const lid = smooth(inv(u, 1.2, 2.6));
    const rise = smooth(inv(u, 1.9, 3.6));

    /* the back edge of the box, so there is something for her to come up
       from behind rather than to sit on top of */
    hpath(ctx, [[bx - bw / 2, top], [bx + bw / 2, top]], PF_INK, 3.4, 299);
    ctx.save(); ctx.globalAlpha = .5;
    hfill(ctx, [[bx - bw / 2, top - 10], [bx + bw / 2, top - 10],
                [bx + bw / 2, top], [bx - bw / 2, top]], '#c9a02c', 298);
    ctx.restore();

    /* her, standing up out of it — everything below the rim is inside */
    if (rise > 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, VW, top + 4); ctx.clip();
      this.drawnLota(ctx, bx, lerp(by, top + VH * 0.055, rise), 1.5, {
        state: 'sit', t: G.t, face: 'happy', ground: false, shadow: false,
        tilt: Math.sin(G.t * 1.2) * 0.1
      });
      ctx.restore();
    }

    /* the front of the box, over her paws */
    hbox(ctx, bx - bw / 2, top, bw, bh, '#f2c94c', PF_INK, 3.6, 300);
    crayon(ctx, bx, top, bx, by, '#c9306a', 13, 301);
    ctx.save(); ctx.globalAlpha = .45;
    hatch(ctx, bx - bw / 2, top, bw, bh, '#c9a02c', 306, .5, 19);
    ctx.restore();

    /* the lid, going up and off the top of the page */
    if (lid < 1) {
      ctx.save();
      ctx.globalAlpha = 1 - inv(lid, 0.75, 1);
      ctx.translate(0, -lid * VH * 0.42);
      ctx.rotate(0);
      hbox(ctx, bx - bw * 0.56, top - 26, bw * 1.12, 28, '#ffd870', PF_INK, 3.4, 302);
      crayon(ctx, bx, top - 26, bx, top + 2, '#c9306a', 13, 303);
      hcircle(ctx, bx - 22, top - 38, 16, '#e0479c', PF_INK, 3, 304);
      hcircle(ctx, bx + 22, top - 38, 16, '#e0479c', PF_INK, 3, 305);
      ctx.restore();
    }

    /* the sparkle round her */
    if (rise > 0) {
      ctx.save();
      for (let i = 0; i < 10; i++) {
        const a = i * TAU / 10 + u * 0.8;
        ctx.globalAlpha = rise * (0.35 + Math.sin(u * 3 + i) * 0.4);
        this.star(ctx, bx + Math.cos(a) * VW * 0.17, top - VH * 0.10 + Math.sin(a) * VH * 0.15,
          8 + (i % 3) * 4, PF_COLS[imod(i, PF_COLS.length)]);
      }
      ctx.restore();
    }

    this.capt(ctx, VW, VH, 'Knygos apranga — dovanų',
      'kartu su Premium, iš karto', this.captA(u, 0.4, PF.OUT - PF.GIFT - 0.3));
  },

  /* =================================================================
     ACT IV · BACK
     The page shuts. What is left on it is the offer, written out —
     and it is written out, not shouted: four short lines that appear
     one after another under the word.
  ================================================================= */
  actOut(ctx, VW, VH, T, G) {
    const u = T - PF.OUT;
    const k = smooth(inv(u, 0, 1.0));
    this.drawScreen(G);
    PF_T = T;                                   /* drawScreen stills the boil; start it again */
    /* the drawn world crashing shut over it */
    ctx.save();
    ctx.globalAlpha = 1 - k;
    paper(ctx, VW, VH, T);
    ctx.restore();
    if (k < 0.6) {
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const kk = clamp(k * 2.2 - i * 0.12, 0, 1);
        if (kk <= 0 || kk >= 1) continue;
        ctx.globalAlpha = (1 - kk) * 0.8;
        ctx.beginPath();
        ctx.arc(VW / 2, VH / 2, kk * VW * 0.85, 0, TAU);
        ctx.strokeStyle = PF_COLS[imod(i, PF_COLS.length)];
        ctx.lineWidth = 16 * (1 - kk); ctx.stroke();
      }
      ctx.restore();
    }

    /* the word */
    const pop = inv(u, 0.5, 1.2);
    if (pop > 0) {
      ctx.save();
      ctx.globalAlpha = pop;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.translate(VW / 2, VH * 0.27);
      const sc = lerp(1.45, 1, smooth(pop));
      ctx.scale(sc, sc);
      ctx.font = '900 ' + Math.round(VH * 0.145) + 'px system-ui, sans-serif';
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(12,4,26,.7)';
      ctx.strokeText('PREMIUM', 0, 0);
      ctx.fillStyle = '#ffd870';
      ctx.fillText('PREMIUM', 0, 0);
      ctx.restore();
    }
    /* and the four things it is, written out one at a time */
    const lines = ['+200 lygių', 'Mini žaidimai', 'Viena istorija', 'Apranga dovanų'];
    lines.forEach((s, i) => {
      const a = inv(u, 1.6 + i * 0.75, 2.1 + i * 0.75);
      if (a <= 0) return;
      const y = VH * 0.44 + i * VH * 0.095;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(VH * 0.052) + 'px system-ui, sans-serif';
      ctx.fillStyle = '#fff2d8';
      ctx.fillText(s, VW / 2, y);
      /* the line under it, drawn in as the words land */
      ctx.globalAlpha = a * 0.75;
      const w = ctx.measureText(s).width;
      crayon(ctx, VW / 2 - w / 2, y + VH * 0.032, VW / 2 - w / 2 + w * clamp(a * 1.6, 0, 1),
        y + VH * 0.032, PF_COLS[imod(i, PF_COLS.length)], 4, 400 + i);
      ctx.restore();
    });
    /* the last line, and it is the only one that is a promise */
    const la = inv(u, 5.0, 5.8);
    if (la > 0) {
      ctx.save();
      ctx.globalAlpha = la;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(VH * 0.042) + 'px system-ui, sans-serif';
      ctx.fillStyle = '#ff9ad8';
      ctx.fillText('Tik kitoje knygos pusėje', VW / 2, VH * 0.87);
      ctx.restore();
    }
  },

  /* =================================================================
     THE THREE THINGS BOTH HALVES OF THE FILM NEED
  ================================================================= */

  /** the book: shut at open=0, spread wide at open=1 */
  book(ctx, x, y, s, open) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .3; fillEll(ctx, 0, 0, 74, 12, '#000'); ctx.restore();
    const w = lerp(46, 96, open), h = lerp(58, 20, open);
    poly(ctx, [[-w, -h], [0, -h + lerp(0, 10, open)], [0, 0], [-w, -6]], '#8a3f6a');
    poly(ctx, [[w, -h], [0, -h + lerp(0, 10, open)], [0, 0], [w, -6]], '#a04f7c');
    ctx.save(); ctx.globalAlpha = .96;
    poly(ctx, [[-w + 7, -h + 5], [-2, -h + lerp(2, 12, open)], [-2, -5], [-w + 7, -10]], '#fbf3e2');
    poly(ctx, [[w - 7, -h + 5], [2, -h + lerp(2, 12, open)], [2, -5], [w - 7, -10]], '#f6ecd8');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5 * open + .25;
    for (let i = 0; i < 4; i++) {
      const yy = -h + 14 + i * (h - 20) / 4;
      line(ctx, -w + 14, yy, -10, yy - 2, '#b8a88a', 2);
      line(ctx, 10, yy - 2, w - 14, yy, '#b8a88a', 2);
    }
    ctx.restore();
    if (open > 0.15) {
      ctx.save(); ctx.globalAlpha = open * 0.75;
      for (let i = 0; i < PF_COLS.length; i++) {
        ctx.beginPath();
        ctx.arc(0, -h + 8, 26 + i * 9, Math.PI * 1.06, Math.PI * 1.94);
        ctx.strokeStyle = PF_COLS[i]; ctx.lineWidth = 7; ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  },

  /** a level tile: green, numbered, and glowing if she is standing on it */
  tile(ctx, x, y, w, h, label, col, glow) {
    ctx.save();
    ctx.translate(x, y);
    if (glow) {
      ctx.save(); ctx.globalAlpha = .35 + Math.sin(glow * 6) * .2;
      fillEll(ctx, 0, 0, w * 0.8, h * 0.9, '#8fffc0'); ctx.restore();
    }
    poly(ctx, [[-w / 2, 0], [-w / 2 + h * 0.5, -h * 0.62], [w / 2, -h * 0.62], [w / 2 - h * 0.5, 0]],
      shade(col || '#3fae66', -.18));
    poly(ctx, [[-w / 2 + 6, -h * 0.1], [-w / 2 + h * 0.5 + 6, -h * 0.68],
               [w / 2 - 6, -h * 0.68], [w / 2 - h * 0.5 - 6, -h * 0.1]], col || '#3fae66');
    if (label) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(h * 0.42) + 'px system-ui, sans-serif';
      ctx.fillStyle = '#0d3a20';
      ctx.fillText(label, 0, -h * 0.36);
    }
    ctx.restore();
  },

  /** The way out. Everything else in here is crayon; this is not — it is the
      same door the levels and the home pages use, and that is the joke. */
  exitDoor(ctx, x, y, s, t) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .3; fillEll(ctx, 0, 0, 60, 11, '#000'); ctx.restore();
    fillRR(ctx, -52, -136, 104, 136, 8, '#8b98a6');
    fillRR(ctx, -42, -126, 84, 118, 6, '#f2c98a');
    ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * 2) * .12;
    fillRR(ctx, -36, -120, 72, 106, 5, '#fff0c8'); ctx.restore();
    circle(ctx, 26, -66, 5, '#6b4a12');
    fillRR(ctx, -34, -172, 68, 28, 6, '#3f9c6a');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 15px system-ui, sans-serif';
    ctx.fillStyle = '#eafff2';
    ctx.fillText('EXIT', 0, -157);
    ctx.restore();
  }
};
