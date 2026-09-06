'use strict';
/* ---------------------------------------------------------------
   premium.js — the trailer for the extension, and the page it sells.

   Nothing here is a purchase. There is no payment, no receipt and no
   three-level trial: the two buttons at the bottom of the page say
   "netrukus" and do nothing on purpose. What does exist is the film,
   and the film is the whole pitch:

     the book · she finds one, opens it, and is pulled into it
     the drawn world · everything past that page is crayon
     the tiles · Level 1 under her paws, and then fifty of them
     the mini games · quizzes and puzzles, not more running
     and back · one hard cut onto the page that sells it

   Like everything else in this game it is drawn, never loaded: the
   only files this project has are the ones you are reading.
----------------------------------------------------------------*/

/* the beats, in seconds. The film is a shade under twenty. */
const PF = {
  BOOK: 2.1,        // she notices it
  OPEN: 3.5,        // it opens
  SUCK: 4.4,        // and takes her
  DRAWN: 5.5,       // the crayon world
  TILE: 8.4,        // Level 1 under her paws
  LOOK: 9.6,        // she looks down and there are more
  WIDE: 10.6,       // the pull-back
  DIVE: 12.6,       // into the first tile
  GAMES: 13.6,      // four of them
  GAME_EACH: 1.15,
  HIT: 18.2,        // the way back
  END: 19.4
};

/* the crayon palette — the drawn world is not one colour, it is all of them */
const PF_COLS = ['#ff6b8a', '#ffc93a', '#5fd08a', '#5fb8f0', '#c08fe8', '#ff9a5a'];

/* ---------- a hand-drawn line, wobbling in place ---------- */
function crayon(ctx, x1, y1, x2, y2, col, w, seed) {
  const r = makeRng((seed || 0) * 97 + 13);
  const n = 6;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i <= n; i++) {
    const k = i / n;
    ctx.lineTo(lerp(x1, x2, k) + (r() - .5) * 4, lerp(y1, y2, k) + (r() - .5) * 4);
  }
  ctx.strokeStyle = col; ctx.lineWidth = w || 3; ctx.lineCap = 'round'; ctx.stroke();
}
/** the scribble that fills one in */
function scribble(ctx, x, y, w, h, col, seed, alpha) {
  const r = makeRng(seed * 41 + 7);
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
/** paper: the grain the whole drawn half of the film sits on */
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
      the lobby's room — this is the other side of the page, not the house. */
  drawScreen(G) {
    const ctx = G.ctx, VW = G.VW, VH = G.VH, t = G.t;
    /* a deep violet night, because everything on top of it is bright */
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#1b0f38'); g.addColorStop(0.55, '#3a1560'); g.addColorStop(1, '#6b1f5c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 60; i++) {
      const r = makeRng(i * 47 + 11);
      ctx.save(); ctx.globalAlpha = .25 + Math.sin(t * 1.7 + i) * .25;
      circle(ctx, r() * VW, r() * VH * 0.8, 1.4 + r() * 1.6, '#fff6d8'); ctx.restore();
    }
    /* the light coming out of the book, sweeping */
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
    /* level tiles drifting up through it */
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
    /* the book itself, open, at the bottom */
    this.book(ctx, VW / 2, VH * 0.99, 1.5 + Math.sin(t * 0.9) * 0.03, 1);
    /* and a soft dark under the sheet so the words on it stay readable */
    const vg = ctx.createRadialGradient(VW / 2, VH * 0.46, VH * 0.15, VW / 2, VH * 0.46, VH * 0.95);
    vg.addColorStop(0, 'rgba(10,4,22,.42)'); vg.addColorStop(1, 'rgba(10,4,22,.18)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  },

  /* =================================================================
     THE FILM
  ================================================================= */
  startFilm(from) {
    if (from) this.from = from;
    this.film = { t: 0, said: {} };
    Game.state = 'pfilm'; Game.stateT = 0;
    Sfx.init(); Sfx.resume();
    UI.showPremiumFilm();
  },
  stepFilm(dt) {
    const c = this.film;
    if (!c) return;
    c.t += dt;
    const T = c.t;
    if (!c.said.open && T >= PF.OPEN) { c.said.open = 1; Sfx.pop(); }
    if (!c.said.suck && T >= PF.SUCK) { c.said.suck = 1; Sfx.warp(); }
    if (!c.said.drawn && T >= PF.DRAWN) { c.said.drawn = 1; Sfx.unlock(); }
    if (!c.said.tile && T >= PF.TILE) { c.said.tile = 1; Sfx.checkpoint(); }
    if (!c.said.wide && T >= PF.WIDE) { c.said.wide = 1; Sfx.zone(); }
    if (!c.said.dive && T >= PF.DIVE) { c.said.dive = 1; Sfx.warp(); Sfx.boing(); }
    for (let i = 0; i < 4; i++) {
      const k = 'g' + i;
      if (!c.said[k] && T >= PF.GAMES + i * PF.GAME_EACH) { c.said[k] = 1; Sfx.click(); }
    }
    if (!c.said.hit && T >= PF.HIT) { c.said.hit = 1; Sfx.crash(); Sfx.win(); Game.fx.shake = 0.5; }
    if (T > PF.END) this.endFilm();
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
    if (T < PF.DRAWN) this.sceneBook(ctx, VW, VH, T, G);
    else if (T < PF.DIVE) this.sceneWorld(ctx, VW, VH, T, G);
    else if (T < PF.GAMES) this.sceneDive(ctx, VW, VH, T, G);
    else if (T < PF.HIT) this.sceneGames(ctx, VW, VH, T, G);
    else this.sceneOut(ctx, VW, VH, T, G);
    /* the seam between the real world and the drawn one: one white frame */
    const flash = (a, b) => clamp(1 - Math.abs(T - a) / b, 0, 1);
    const wh = Math.max(flash(PF.DRAWN, 0.22), flash(PF.DIVE, 0.2), flash(PF.HIT, 0.26));
    if (wh > 0) { ctx.save(); ctx.globalAlpha = wh; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); }
  },

  /* ---------- 1 · a room, a dog, and a book on the floor ---------- */
  sceneBook(ctx, VW, VH, T, G) {
    const floorY = VH * 0.72;
    /* the same kind of room the lobby is, so it is obviously her house */
    ctx.fillStyle = '#3a2b56'; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.globalAlpha = .3;
    for (let x = 0; x < VW; x += 56) for (let y = 0; y < floorY; y += 60) {
      ctx.save(); ctx.translate(x + ((y / 60) % 2) * 28, y);
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.quadraticCurveTo(9, -7, 18, 8);
      ctx.quadraticCurveTo(9, 4, 0, 8); ctx.fillStyle = '#4d3a70'; ctx.fill(); ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = '#6b4a2c'; ctx.fillRect(0, floorY, VW, VH - floorY);
    fillRR(ctx, 0, floorY - 10, VW, 14, 0, '#8a6440');

    const bx = VW * 0.68, by = floorY + 30;
    /* the swirl, once the book is open and pulling */
    const suck = clamp((T - PF.OPEN) / (PF.DRAWN - PF.OPEN), 0, 1);
    if (suck > 0) {
      ctx.save();
      ctx.globalAlpha = suck * 0.8;
      for (let i = 0; i < 26; i++) {
        const a = i * 0.62 + T * 5.5;
        const rr0 = (1 - suck) * 250 + 20 + imod(i * 37, 130);
        const r2 = rr0 * (1 - suck * 0.7);
        circle(ctx, bx + Math.cos(a) * r2 * 1.3, by - 60 + Math.sin(a) * r2 * 0.55,
          2 + (i % 4), PF_COLS[imod(i, PF_COLS.length)]);
      }
      ctx.restore();
    }

    /* Lota. She sits, she notices, she walks over, and then she is not
       walking any more — she is going round and round and getting smaller. */
    let lx, ly = floorY + 26, st = 'sit', rot = 0, sc = 1.5, alpha = 1;
    if (T < PF.BOOK) {
      lx = VW * 0.26;
      st = 'sit';
    } else if (T < PF.OPEN) {
      const k = smooth(clamp((T - PF.BOOK) / (PF.OPEN - PF.BOOK), 0, 1));
      lx = lerp(VW * 0.26, VW * 0.53, k);
      st = k < 0.92 ? 'run' : 'sit';
    } else {
      const k = smooth(suck);
      lx = lerp(VW * 0.53, bx, k);
      ly = lerp(floorY + 26, by - 40, k);
      st = 'jump';
      rot = -TAU * 2.4 * k;
      sc = lerp(1.5, 0.12, k * k);
      alpha = 1 - clamp((suck - 0.82) / 0.18, 0, 1);
    }
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rot);
    drawLota(ctx, 0, 0, {
      state: st, t: G.t, run: G.t * 13, skin: Save.data.skin, scale: sc,
      face: T < PF.BOOK ? 'calm' : 'happy', alpha: alpha, shadow: false
    });
    ctx.restore();

    /* the book, shut, then open */
    this.book(ctx, bx, by, 1.1, clamp((T - PF.OPEN + 0.3) / 0.6, 0, 1));

    /* one caption, because the first two seconds have to say who she is */
    if (T < PF.BOOK + 0.4) {
      ctx.save();
      ctx.globalAlpha = clamp(T / 0.5, 0, 1) * clamp((PF.BOOK + 0.4 - T) / 0.4, 0, 1);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.round(VH * 0.07) + 'px system-ui, sans-serif';
      ctx.fillStyle = '#ffd870';
      ctx.fillText('LOTA RADO KNYGĄ', VW / 2, VH * 0.16);
      ctx.restore();
    }
  },

  /** the book: shut at open=0, spread wide at open=1 */
  book(ctx, x, y, s, open) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .3; fillEll(ctx, 0, 0, 74, 12, '#000'); ctx.restore();
    const w = lerp(46, 96, open), h = lerp(58, 20, open);
    /* the covers */
    poly(ctx, [[-w, -h], [0, -h + lerp(0, 10, open)], [0, 0], [-w, -6]], '#8a3f6a');
    poly(ctx, [[w, -h], [0, -h + lerp(0, 10, open)], [0, 0], [w, -6]], '#a04f7c');
    /* the pages */
    ctx.save(); ctx.globalAlpha = .96;
    poly(ctx, [[-w + 7, -h + 5], [-2, -h + lerp(2, 12, open)], [-2, -5], [-w + 7, -10]], '#fbf3e2');
    poly(ctx, [[w - 7, -h + 5], [2, -h + lerp(2, 12, open)], [2, -5], [w - 7, -10]], '#f6ecd8');
    ctx.restore();
    /* lines of writing on them, and a rainbow when it is open */
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

  /* ---------- 2 · inside: crayon, an Exit, and fifty tiles ----------
     Two shots, one after the other. First she is running at the way out
     and the way out is right there. Then a tile lands under her paws, she
     looks down, and the camera keeps pulling back until the reason the
     Exit was never as close as it looked is fifty levels long. */
  sceneWorld(ctx, VW, VH, T, G) {
    const groundY = VH * 0.74;
    this.crayonLand(ctx, VW, VH, T, groundY);
    if (T < PF.TILE) this.shotRun(ctx, VW, VH, T, G, groundY);
    else this.shotTiles(ctx, VW, VH, T, G, groundY);

    /* the captions live outside the camera, so the pull-back does not
       shrink the one thing that has to stay readable */
    const cap = T < PF.TILE ? 'KITA PUSĖ — VISKAS NUPIEŠTA'
              : T < PF.LOOK ? 'PIRMOJI PLYTELĖ: LEVEL 1'
              : T < PF.WIDE ? 'IR JŲ YRA DAUGIAU…'
              : '+200 LYGIŲ';
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 ' + Math.round(VH * 0.066) + 'px system-ui, sans-serif';
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,251,242,.92)';
    ctx.strokeText(cap, VW / 2, VH * 0.13);
    ctx.fillStyle = '#e0479c';
    ctx.fillText(cap, VW / 2, VH * 0.13);
    ctx.restore();
  },

  /** paper, a scribbled sky, a sun somebody was pleased with, and grass */
  crayonLand(ctx, VW, VH, T, groundY) {
    paper(ctx, VW, VH, T);
    scribble(ctx, -10, -10, VW + 20, groundY * 0.55, '#9fd8f2', 3, .35);
    /* clouds, drawn as loops */
    ctx.save(); ctx.globalAlpha = .8;
    for (let i = 0; i < 3; i++) {
      const cx = VW * (0.14 + i * 0.3) + Math.sin(T * 0.3 + i) * 10, cy = VH * (0.14 + (i % 2) * 0.07);
      for (let k = 0; k < 5; k++) {
        const a = Math.PI + k * (Math.PI / 4);
        crayon(ctx, cx + Math.cos(a) * 34, cy + Math.sin(a) * 16,
          cx + Math.cos(a + 0.8) * 34, cy + Math.sin(a + 0.8) * 16, '#bfe4f6', 4, i * 9 + k);
      }
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .95;
    for (let i = 0; i < 9; i++) {
      const a = i * (TAU / 9) + T * 0.3;
      crayon(ctx, VW * 0.88 + Math.cos(a) * 30, VH * 0.13 + Math.sin(a) * 30,
        VW * 0.88 + Math.cos(a) * 48, VH * 0.13 + Math.sin(a) * 48, '#ffc93a', 4, i);
    }
    circle(ctx, VW * 0.88, VH * 0.13, 26, '#ffe07a');
    ctx.restore();
    /* the grass, and flowers pushed into it */
    scribble(ctx, -10, groundY, VW + 20, VH - groundY + 10, '#8fd06a', 11, .55);
    crayon(ctx, -10, groundY, VW + 10, groundY, '#4f9c5a', 5, 2);
    ctx.save(); ctx.globalAlpha = .85;
    for (let i = 0; i < 7; i++) {
      const r = makeRng(i * 43 + 7);
      const fx = r() * VW, fy = groundY + 14 + r() * (VH - groundY - 18);
      crayon(ctx, fx, fy + 12, fx + (r() - .5) * 5, fy, '#4f9c5a', 3, i + 40);
      circle(ctx, fx, fy - 3, 4.5, PF_COLS[imod(i, PF_COLS.length)]);
    }
    ctx.restore();
  },

  /** shot one: she has seen the way out and she is going for it */
  shotRun(ctx, VW, VH, T, G, groundY) {
    const k = smooth(clamp((T - PF.DRAWN) / (PF.TILE - PF.DRAWN), 0, 1));
    /* The door itself is NOT crayon: it is the same one the levels and the
       home page use, and its being the only solid thing on the page is the
       whole point of the shot. */
    this.exitDoor(ctx, VW * 0.84, groundY, 1.15, T);
    const lx = lerp(VW * 0.08, VW * 0.5, k);
    this.drawnLota(ctx, lx, groundY, 1.3, G.t, 'run', 0);
    /* her eyeline: a dotted crayon arc from her nose to the door */
    ctx.save();
    ctx.globalAlpha = .5 + Math.sin(T * 5) * .15;
    ctx.setLineDash([9, 11]);
    ctx.beginPath();
    ctx.moveTo(lx + 44, groundY - 78);
    ctx.quadraticCurveTo((lx + VW * 0.84) / 2, groundY - 168, VW * 0.79, groundY - 96);
    ctx.strokeStyle = '#e0479c'; ctx.lineWidth = 4; ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  /** shot two: Level 1 under her paws, and then all of them.

      The camera does not zoom — the board unfolds. One tile becomes a row,
      the row becomes a board that snakes back and forth up the page, and by
      the end fifty of them are on the screen at a size you can still see,
      which a real pull-back would have turned into fifty specks. */
  shotTiles(ctx, VW, VH, T, G, groundY) {
    const N = 50;
    let k;                                            /* 0 close, 1 the board */
    if (T < PF.LOOK) k = 0;
    else if (T < PF.WIDE) k = smooth((T - PF.LOOK) / (PF.WIDE - PF.LOOK)) * 0.2;
    else k = lerp(0.2, 1, smooth(clamp((T - PF.WIDE) / (PF.DIVE - PF.WIDE), 0, 1)));
    const shown = Math.max(1, Math.round(lerp(1, N, k)));

    const cols = Math.min(10, shown);
    const rows = Math.ceil(shown / cols);
    const bx0 = lerp(VW * 0.42, VW * 0.13, k), bx1 = VW * 0.80;
    const pitch = cols <= 1 ? 96 : Math.min(96, (bx1 - bx0) / (cols - 1));
    const rowH = rows <= 1 ? 0 : Math.min(62, (groundY - VH * 0.26) / (rows - 1));
    const tw = Math.min(92, pitch * 0.94), th = tw * 0.4;

    /* where tile i sits: back and forth, bottom row first */
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
    /* far rows first, so the near ones sit on top of them */
    for (let i = shown - 1; i >= 0; i--) {
      const p = at(i);
      ctx.save();
      ctx.globalAlpha = i === 0 ? 1 : clamp(1 - i / (N * 2.4), 0.55, 1);
      this.tile(ctx, p[0], p[1], i === 0 ? Math.max(tw, 66) : tw,
        i === 0 ? Math.max(th, 27) : th,
        i === 0 ? 'LEVEL 1' : (pitch > 40 ? String(i + 1) : ''),
        i === 0 ? '#4fd07a' : '#3fae66', i === 0 ? T : 0);
      ctx.restore();
    }
    /* and past the last of them, the door she thought she was running to */
    const last = at(shown - 1);
    this.exitDoor(ctx, clamp(last[0] + Math.max(74, pitch * 1.5), 0, VW * 0.94),
      last[1], lerp(1.15, 0.62, k), T);
    /* her, standing on the first one and looking down the rest */
    this.drawnLota(ctx, bx0 - pitch * 0.18 * k, groundY - Math.max(26, th * 0.72),
      lerp(1.3, 0.66, k), G.t, 'sit', (T >= PF.LOOK && k < 0.75) ? 1 : 0);
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
      same door the levels and the home page use, and that is the joke. */
  exitDoor(ctx, x, y, s, t) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .3; fillEll(ctx, 0, 0, 60, 11, '#000'); ctx.restore();
    fillRR(ctx, -52, -136, 104, 136, 8, '#8b98a6');
    fillRR(ctx, -42, -126, 84, 118, 6, '#f2c98a');
    ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * 2) * .12;
    fillRR(ctx, -36, -120, 72, 106, 5, '#fff0c8'); ctx.restore();
    circle(ctx, 26, -66, 5, '#6b4a12');
    /* the running-man sign over it */
    fillRR(ctx, -34, -172, 68, 28, 6, '#3f9c6a');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 15px system-ui, sans-serif';
    ctx.fillStyle = '#eafff2';
    ctx.fillText('EXIT', 0, -157);
    ctx.restore();
  },

  /** Lota, in crayon: her own drawing with the colours scribbled over it */
  drawnLota(ctx, x, y, s, t, state, look) {
    ctx.save();
    drawLota(ctx, x, y, {
      state: state || 'run', t: t, run: t * 13, skin: Save.data.skin,
      scale: s, face: 'happy', tilt: look ? 0.16 : 0
    });
    ctx.restore();
    /* the colours somebody went over her with */
    ctx.save();
    ctx.globalAlpha = .38;
    for (let i = 0; i < 7; i++) {
      const r = makeRng(i * 71 + 5);
      const px = x - 46 * s + r() * 92 * s, py = y - 96 * s + r() * 84 * s;
      crayon(ctx, px, py, px + 22 * s, py + (r() - .5) * 22 * s,
        PF_COLS[imod(i, PF_COLS.length)], 5 * s, i);
    }
    ctx.restore();
    /* the ground she is drawn standing on, dashed off in one stroke */
    ctx.save();
    ctx.globalAlpha = .4;
    crayon(ctx, x - 40 * s, y + 3, x + 40 * s, y + 3, '#5a4a3a', 3 * s, 21);
    ctx.restore();
    /* when she looks down, a little arrow says so */
    if (look) {
      ctx.save(); ctx.globalAlpha = .8;
      crayon(ctx, x + 62 * s, y - 74 * s, x + 62 * s, y - 24 * s, '#e0479c', 5, 3);
      poly(ctx, [[x + 62 * s, y - 12 * s], [x + 50 * s, y - 32 * s], [x + 74 * s, y - 32 * s]], '#e0479c');
      ctx.restore();
    }
  },

  /* ---------- 3 · and into the first tile ---------- */
  sceneDive(ctx, VW, VH, T, G) {
    const k = smooth(clamp((T - PF.DIVE) / (PF.GAMES - PF.DIVE), 0, 1));
    paper(ctx, VW, VH, T);
    const groundY = VH * 0.74;
    ctx.save();
    scribble(ctx, -VW, groundY, VW * 3, VH, '#8fd06a', 11, .55);
    crayon(ctx, -VW, groundY, VW * 2, groundY, '#4f9c5a', 5, 2);
    ctx.restore();

    /* the tile, gaping open, and the funnel of light out of it */
    const tx = VW * 0.5, ty = groundY - 6;
    ctx.save(); ctx.globalAlpha = .55 + k * 0.4;
    for (let i = 0; i < 9; i++) {
      const w = 30 + i * 26 * (0.4 + k);
      ctx.save(); ctx.globalAlpha = (0.5 - i * 0.045) * (0.4 + k);
      fillEll(ctx, tx, ty - 6, w, w * 0.34, PF_COLS[imod(i, PF_COLS.length)]);
      ctx.restore();
    }
    ctx.restore();
    this.tile(ctx, tx, ty, 104, 40, 'LEVEL 1', '#4fd07a', T);

    /* she goes in nose first, spinning, and the screen closes after her */
    ctx.save();
    ctx.translate(tx, lerp(groundY - 150, ty - 6, k));
    ctx.rotate(-TAU * 1.9 * k);
    ctx.scale(1 - k * 0.86, 1 - k * 0.86);
    drawLota(ctx, 0, 0, {
      state: 'jump', t: G.t, run: G.t * 16, skin: Save.data.skin, scale: 1.4,
      face: 'happy', shadow: false
    });
    ctx.restore();
    /* the pull */
    ctx.save(); ctx.globalAlpha = k * 0.8;
    for (let i = 0; i < 24; i++) {
      const a = i * 0.52 + T * 7;
      const r0 = (1 - k) * 300 + 30;
      circle(ctx, tx + Math.cos(a) * r0 * 1.2, ty - 40 + Math.sin(a) * r0 * 0.5,
        2.4 + (i % 3), PF_COLS[imod(i, PF_COLS.length)]);
    }
    ctx.restore();
  },

  /* ---------- 4 · what is actually in there ---------- */
  sceneGames(ctx, VW, VH, T, G) {
    const idx = clamp(Math.floor((T - PF.GAMES) / PF.GAME_EACH), 0, 3);
    const local = (T - PF.GAMES) - idx * PF.GAME_EACH;
    const fade = Math.min(clamp(local / 0.22, 0, 1), clamp((PF.GAME_EACH - local) / 0.22, 0, 1));
    [this.gQuiz, this.gMemory, this.gMaze, this.gObstacle][idx].call(this, ctx, VW, VH, local, G);
    /* the label under it, and a wipe between one and the next */
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 ' + Math.round(VH * 0.06) + 'px system-ui, sans-serif';
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(12,6,24,.65)';
    const names = ['VIKTORINA', 'ATMINTIS', 'LABIRINTAS', 'KLIŪTYS'];
    ctx.strokeText(names[idx], VW / 2, VH * 0.12);
    ctx.fillStyle = '#ffd870';
    ctx.fillText(names[idx], VW / 2, VH * 0.12);
    ctx.restore();
    if (fade < 1) {
      ctx.save(); ctx.globalAlpha = 1 - fade;
      ctx.fillStyle = '#12082a'; ctx.fillRect(0, 0, VW, VH); ctx.restore();
    }
  },

  /** a question, three answers, and Lota picking one */
  gQuiz(ctx, VW, VH, t, G) {
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#123a6a'); g.addColorStop(1, '#0b1f3c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 30; i++) {
      const r = makeRng(i * 33 + 2);
      ctx.save(); ctx.globalAlpha = .3 + Math.sin(G.t * 2 + i) * .25;
      circle(ctx, r() * VW, r() * VH * 0.6, 1.6, '#cfe6ff'); ctx.restore();
    }
    /* the board the question is on */
    fillRR(ctx, VW * 0.16, VH * 0.24, VW * 0.68, VH * 0.16, 18, '#f6f2ea');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 ' + Math.round(VH * 0.052) + 'px system-ui, sans-serif';
    ctx.fillStyle = '#2b1c38';
    ctx.fillText('KIEK KOJŲ TURI ŠUO?', VW / 2, VH * 0.32);
    /* three answers; the middle one lights up */
    const pick = t > 0.55 ? 1 : -1;
    ['2', '4', '6'].forEach((s, i) => {
      const x = VW * (0.26 + i * 0.24), y = VH * 0.55;
      const on = pick === 1 && i === 1;
      fillRR(ctx, x - VW * 0.09, y - VH * 0.06, VW * 0.18, VH * 0.12, 14,
        on ? '#4fd07a' : 'rgba(255,255,255,.14)');
      ctx.font = '900 ' + Math.round(VH * 0.075) + 'px system-ui, sans-serif';
      ctx.fillStyle = on ? '#0d3a20' : '#fff';
      ctx.fillText(s, x, y);
    });
    drawLota(ctx, VW * 0.5, VH * 0.94, {
      state: t > 0.55 ? 'jump' : 'sit', t: G.t, run: G.t * 12,
      skin: Save.data.skin, scale: 1.15, face: 'happy'
    });
  },

  /** cards turning over, one pair at a time */
  gMemory(ctx, VW, VH, t, G) {
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#5a2b6a'); g.addColorStop(1, '#2a1038');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    const cols = 4, rows = 2, cw = VW * 0.14, ch = VH * 0.19;
    for (let r0 = 0; r0 < rows; r0++) for (let c0 = 0; c0 < cols; c0++) {
      const i = r0 * cols + c0;
      const x = VW * 0.5 + (c0 - (cols - 1) / 2) * (cw + 14);
      const y = VH * 0.42 + (r0 - (rows - 1) / 2) * (ch + 14);
      const open = t > 0.35 + i * 0.06;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(open ? 1 : Math.abs(Math.cos((t * 6 + i))) * 0.4 + 0.6, 1);
      fillRR(ctx, -cw / 2, -ch / 2, cw, ch, 12, open ? '#fbf3e2' : '#7a4fd0');
      if (open) {
        ctx.save(); ctx.translate(0, 4);
        if (i % 2) Levels.toyBall(ctx, 0, 0, Math.min(cw, ch) * 0.28, G.t, i);
        else boneIcon(ctx, 0, 0, Math.min(cw, ch) * 0.022, G.t);
        ctx.restore();
      } else {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 ' + Math.round(ch * 0.5) + 'px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.fillText('?', 0, 0);
      }
      ctx.restore();
    }
    drawLota(ctx, VW * 0.12, VH * 0.95, {
      state: 'sit', t: G.t, skin: Save.data.skin, scale: 1.1, face: 'calm',
      paw: (G.t % 2) > 1
    });
  },

  /** a little maze, and the line she is thinking her way along */
  gMaze(ctx, VW, VH, t, G) {
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#1f4a3a'); g.addColorStop(1, '#0d2620');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    const cell = Math.min(VW, VH) * 0.09;
    const cols = 9, rows = 5;
    const ox = VW / 2 - cols * cell / 2, oy = VH * 0.28;
    ctx.save(); ctx.globalAlpha = .8;
    for (let r0 = 0; r0 <= rows; r0++) line(ctx, ox, oy + r0 * cell, ox + cols * cell, oy + r0 * cell, 'rgba(255,255,255,.14)', 2);
    for (let c0 = 0; c0 <= cols; c0++) line(ctx, ox + c0 * cell, oy, ox + c0 * cell, oy + rows * cell, 'rgba(255,255,255,.14)', 2);
    ctx.restore();
    /* the walls, fixed by seed so the maze is the same maze each play */
    ctx.save();
    for (let i = 0; i < 22; i++) {
      const r = makeRng(i * 59 + 3);
      const c0 = Math.floor(r() * cols), r1 = Math.floor(r() * rows);
      const horiz = r() > 0.5;
      if (horiz) line(ctx, ox + c0 * cell, oy + r1 * cell, ox + (c0 + 1) * cell, oy + r1 * cell, '#7fe0a8', 5);
      else line(ctx, ox + c0 * cell, oy + r1 * cell, ox + c0 * cell, oy + (r1 + 1) * cell, '#7fe0a8', 5);
    }
    ctx.restore();
    /* the route being worked out, a step at a time */
    const path = [[0, 2], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [4, 2], [5, 2], [5, 3], [6, 3], [7, 3], [8, 3]];
    const upto = clamp(Math.floor(t / PF.GAME_EACH * path.length * 1.1), 1, path.length);
    ctx.save(); ctx.globalAlpha = .9;
    ctx.beginPath();
    for (let i = 0; i < upto; i++) {
      const px = ox + (path[i][0] + 0.5) * cell, py = oy + (path[i][1] + 0.5) * cell;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#ffd870'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(); ctx.restore();
    const head = path[upto - 1];
    drawLota(ctx, ox + (head[0] + 0.5) * cell, oy + (head[1] + 1) * cell, {
      state: 'run', t: G.t, run: G.t * 14, skin: Save.data.skin, scale: 0.6, face: 'happy'
    });
    /* the way out of it */
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 ' + Math.round(cell * 0.45) + 'px system-ui, sans-serif';
    ctx.fillStyle = '#8fffc0';
    ctx.fillText('★', ox + (8.5) * cell, oy + 3.5 * cell);
  },

  /** and one that is obstacles, but not the ones she already knows */
  gObstacle(ctx, VW, VH, t, G) {
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#6a3a12'); g.addColorStop(1, '#2a1608');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    const floorY = VH * 0.78;
    fillRR(ctx, 0, floorY, VW, VH - floorY, 0, '#4a2c14');
    fillRR(ctx, 0, floorY, VW, 8, 0, '#8a5a2c');
    /* swinging things she has to time, which is a different job to jumping */
    for (let i = 0; i < 4; i++) {
      const x = VW * (0.22 + i * 0.2);
      const a = Math.sin(G.t * 2.2 + i * 1.3) * 0.6;
      ctx.save();
      ctx.translate(x, VH * 0.16);
      ctx.rotate(a);
      line(ctx, 0, 0, 0, VH * 0.34, '#c9a86a', 4);
      circle(ctx, 0, VH * 0.36, VH * 0.045, PF_COLS[imod(i, PF_COLS.length)]);
      ctx.restore();
    }
    /* stepping stones that only stay up while she is on them */
    for (let i = 0; i < 5; i++) {
      const x = VW * (0.14 + i * 0.18);
      const up = Math.sin(G.t * 3 + i * 1.1) > -0.2;
      ctx.save(); ctx.globalAlpha = up ? 1 : .3;
      fillRR(ctx, x - 34, floorY - 14, 68, 16, 7, up ? '#ffd870' : '#6b5a3a');
      ctx.restore();
    }
    drawLota(ctx, VW * (0.16 + (t / PF.GAME_EACH) * 0.66),
      floorY - 14 - Math.abs(Math.sin(t * 7)) * 60, {
      state: 'jump', t: G.t, run: G.t * 16, skin: Save.data.skin, scale: 1.15, face: 'happy'
    });
  },

  /* ---------- 5 · the way back out, and it lands hard ---------- */
  sceneOut(ctx, VW, VH, T, G) {
    const k = smooth(clamp((T - PF.HIT) / (PF.END - PF.HIT), 0, 1));
    this.drawScreen(G);
    /* the drawn world crashing shut over it */
    ctx.save();
    ctx.globalAlpha = 1 - k;
    paper(ctx, VW, VH, T);
    ctx.restore();
    /* the impact rings */
    if (k < 0.55) {
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
    /* and the words, coming in on the hit */
    const pop = clamp((k - 0.18) / 0.3, 0, 1);
    if (pop > 0) {
      ctx.save();
      ctx.globalAlpha = pop;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.translate(VW / 2, VH * 0.42);
      ctx.scale(lerp(1.5, 1, smooth(pop)), lerp(1.5, 1, smooth(pop)));
      ctx.font = '900 ' + Math.round(VH * 0.15) + 'px system-ui, sans-serif';
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(12,4,26,.7)';
      ctx.strokeText('PREMIUM', 0, 0);
      ctx.fillStyle = '#ffd870';
      ctx.fillText('PREMIUM', 0, 0);
      ctx.font = '900 ' + Math.round(VH * 0.06) + 'px system-ui, sans-serif';
      ctx.fillStyle = '#ff8fd0';
      ctx.fillText('+200 LYGIŲ', 0, VH * 0.13);
      ctx.restore();
    }
  }
};
