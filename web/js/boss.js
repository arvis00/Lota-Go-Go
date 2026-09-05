'use strict';
/* ---------------------------------------------------------------
   boss.js — everything that is only true on level 4.

   Three things live here and nowhere else:

   * THE FILM. The level opens on the vet's table, with the clippers
     out, and the player cannot do anything about it except press
     Skip. It ends with Lota on the floor and running.

   * THE ENERGY. Nothing is collected on this level — no treats, no
     toys. What is lying about is energy, and energy is not a score:
     five of them make one charge, and a charge is a burst of speed
     that has to be *spent*. Sitting on a full charge wastes it, and
     wasting three in a row is how the chase ends.

   * WHOEVER IS BEHIND HER. The vet out of the clinic, the groomer
     out of the salon, and both of them down the last alley. They are
     never an obstacle: they are a distance, and the distance is the
     whole level. Boosting throws them off; drifting lets them close.
----------------------------------------------------------------*/

const BOSS = {
  PER_CHARGE: 5,      // energy symbols in one charge
  HOLD: 6.5,          // how long a full charge may be sat on before it fizzles
  BOOST: 2.6,         // seconds a burst lasts
  SPEED: 1.5,         // and how much faster than running it is
  ORB_GAIN: 0.05,     // ground won back by picking one up
  ORB_MISS: 0.045,    // and lost by running straight past one
  WASTE: 0.34,        // ground lost by letting a whole charge go to waste
  WASTE_MAX: 3,       // three wasted one after another and they simply have her
  SPIN_GAIN: 0.14,    // ground won back every time she turns on the spot
  /* A thrown thing leaves the vet's hand THROW seconds before Lota reaches
     the spot it is aimed at, and is sitting in that spot LAND seconds before
     she gets there. The second and a half in between is the whole warning
     this level gives, and it is spent in the air, in plain sight, coming over
     her head from behind. */
  THROW: 1.8, LAND: 0.55,
  /* and once she is past it, it does not stand there for ever: it drops out
     of the air, tumbles and settles on the floor behind her */
  FALL: 300,
  /* how long the chase takes to close on its own, at the start of the level
     and at the very end of it. On its own is the slow part: what really moves
     them is energy she walked past and charges she never spent. */
  CLOSE_0: 60, CLOSE_1: 40
};

const Boss = {
  on: false,
  energy: 0, charge: 0, holdT: 0, wasted: 0,
  gap: 1, boost: 0, boostT: 0,
  run: 0, lunge: 0, told: false,
  cut: null,
  /* while a scene or the arena fight is running, whoever was chasing her is
     being drawn by that instead — the road behind her goes quiet */
  hold: false,
  /* how recently the vet let something go, so her arm can be drawn throwing it */
  throwT: 0,

  /* ---------------- the run ---------------- */
  /** Called by Game.startRun for every level; it only wakes up on the boss. */
  reset(world) {
    this.on = !!(world && world.boss);
    this.energy = 0; this.charge = 0; this.holdT = 0; this.wasted = 0;
    this.gap = 1; this.boost = 0; this.boostT = 0; this.run = 0; this.lunge = 0;
    this.told = false; this.hold = false; this.throwT = 0;
    if (this.on) { UI.bossHud(true); this.sync(); }
    else UI.bossHud(false);
  },

  /** how much faster she is going right now — 1 unless a burst is running */
  speed() { return this.on && this.boost > 0 ? BOSS.SPEED : 1; },

  /** who is behind her here, if anybody */
  chaserAt(G) {
    const z = G.zoneAt(G.lota.x).zone;
    return z.chaser || null;
  },

  /** one energy symbol she ran straight past */
  missed() {
    if (!this.on || this.boost > 0) return;
    this.gap = clamp(this.gap - BOSS.ORB_MISS, 0, 1);
    this.sync();
  },

  /** one energy symbol picked up */
  collect() {
    if (!this.on) return;
    this.gap = clamp(this.gap + BOSS.ORB_GAIN, 0, 1);
    if (this.charge) return;               // a full charge cannot hold any more
    this.energy++;
    if (this.energy >= BOSS.PER_CHARGE) {
      this.energy = 0; this.charge = 1; this.holdT = 0;
      Sfx.unlock();
      if (!this.told) {
        this.told = true;
        UI.toast('⚡ Pilna!', 'Spausk ⚡ (arba X) — pagreitėk');
      }
    }
    this.sync();
  },

  /** the player spends a charge */
  fire(G) {
    if (!this.on || !this.charge || this.boost > 0) return;
    this.charge = 0; this.holdT = 0; this.wasted = 0;
    this.boost = BOSS.BOOST; this.boostT = 0;
    this.gap = 1;
    Sfx.boing(); Sfx.warp();
    G.fx.flash = 0.4;
    const L = G.lota;
    for (let k = 0; k < 26; k++) G.fx.sparks.push({
      x: L.x - 20, y: L.y + 20 + Math.random() * 40,
      vx: -240 - Math.random() * 300, vy: (Math.random() - .5) * 260,
      life: .6, c: k % 2 ? '#8fe8ff' : '#ffffff'
    });
    UI.toast('⚡ Pirmyn!', 'prasiveržia');
    this.sync();
  },

  /** the salon: she turns on the spot and whoever it is loses her for a beat */
  slipped() {
    if (!this.on) return;
    this.gap = clamp(this.gap + BOSS.SPIN_GAIN, 0, 1);
    this.sync();
  },

  /** during a burst nothing stops her: the thing in the way comes apart */
  smash(G, hz) {
    hz.smashed = 1;
    Sfx.crash();
    G.fx.shake = Math.max(G.fx.shake, 0.22);
    for (let k = 0; k < 16; k++) G.fx.sparks.push({
      x: hz.x + hz.w / 2, y: hz.y + hz.h * 0.5,
      vx: 80 + Math.random() * 320, vy: (Math.random() - .3) * 340,
      life: .5, c: k % 3 ? '#ffe08a' : '#ffffff'
    });
  },

  /* ---------------- the chase, one frame of it ---------------- */
  step(dt, G) {
    if (!this.on) return;
    this.run += dt * (11 + speedAt(G.lota.x) * 0.02);
    this.throwT = Math.max(0, this.throwT - dt);

    if (this.boost > 0) {
      this.boost -= dt; this.boostT += dt;
      this.gap = 1;
      if (this.boost <= 0) { this.boost = 0; Sfx.duck(); }
      this.sync();
      return;
    }

    const who = this.chaserAt(G);
    if (!who) { this.sync(); return; }      // arena 1: nobody is after her yet

    /* a charge she is sitting on runs out of patience */
    if (this.charge) {
      this.holdT += dt;
      if (this.holdT >= BOSS.HOLD) {
        this.charge = 0; this.holdT = 0; this.wasted++;
        this.gap = clamp(this.gap - BOSS.WASTE, 0, 1);
        Sfx.locked();
        if (this.wasted >= BOSS.WASTE_MAX) this.gap = 0;
        else UI.toast('Energija prapuolė!',
          this.wasted >= BOSS.WASTE_MAX - 1 ? 'dar kartą — ir pagaus' : 'reikėjo pagreitėti');
      }
    }

    /* and the ground closes by itself, faster the further she has come */
    const f = clamp(G.lota.x / G.world.finishX, 0, 1);
    this.gap -= dt / lerp(BOSS.CLOSE_0, BOSS.CLOSE_1, f);
    this.lunge = lerp(this.lunge, this.gap < 0.22 ? 1 : 0, 1 - Math.pow(0.02, dt));

    if (this.gap <= 0) {
      this.gap = 0;
      this.sync();
      UI.toast('Pagavo!', this.wasted >= BOSS.WASTE_MAX
        ? 'trys pagreičiai iš eilės nepanaudoti'
        : (who === 'groomer' ? 'kirpėja ją sučiupo' : 'veterinarė ją sučiupo'));
      G.crash('caught');
      return;
    }
    this.sync();
  },

  sync() {
    UI.setEnergy(this.energy, BOSS.PER_CHARGE, this.charge,
                 this.charge ? clamp(1 - this.holdT / BOSS.HOLD, 0, 1) : 1);
    UI.setChase(this.gap, this.boost > 0);
  },

  /* ---------------- what a thrown thing is doing right now ----------------
     Everything the vet throws is a perfectly ordinary obstacle: its box never
     moves. What changes is where it is *drawn*.

     It comes out of her hand, behind Lota, low on the screen; it arcs over
     Lota's head; and it drops into the slot it was always going to occupy
     about half a second before Lota arrives. So the player watches it fly the
     whole way, and can read what it is going to be long before it is a
     problem. Once Lota is past it, it falls out of the air and tumbles to a
     stop on the floor rather than hanging there or blinking out. */
  thrownAt(G, hz) {
    const L = G.lota;
    const v = Math.max(220, speedAt(hz.x));
    const d = hz.x - L.x;
    const air = clamp((d - v * BOSS.LAND) / (v * (BOSS.THROW - BOSS.LAND)), 0, 1);
    const gone = clamp((L.x - (hz.x + hz.w)) / BOSS.FALL, 0, 1);
    return { air: air, gone: gone };
  },

  /** Draw one thing the vet threw — flying, sitting, or falling away behind
      her. Returns true when it has drawn the object itself. */
  drawThrown(G, hz, x0, yTop, floorY) {
    const ctx = G.ctx, L = G.lota;
    if (!L) return false;
    const st = this.thrownAt(G, hz);
    const cx = x0 + hz.w / 2, cy = yTop + hz.h / 2;
    const high = hz.kind === 'over';

    /* ---- still in the air, on its way ---- */
    if (st.air > 0) {
      const k = st.air;                       /* 1 in her hand, 0 in its slot */
      const hx = G.sx(L.x) - 230;             /* out of the vet's hand, behind Lota */
      const hy = G.sy(G.floorBase(L)) - 120;
      const px = lerp(cx, hx, k);
      const py = lerp(cy, hy, k) - Math.sin((1 - k) * Math.PI) * 150;
      if (k > 0.94) this.throwT = 0.5;        /* her arm is what let it go */

      /* the shadow on the ground underneath it: the only honest cue to how
         high the thing actually is */
      ctx.save(); ctx.globalAlpha = 0.10 + (1 - k) * 0.22;
      fillEll(ctx, px, floorY + 3, 26 - k * 8, 6, '#1a1226'); ctx.restore();
      /* the path it has already flown */
      ctx.save(); ctx.globalAlpha = 0.5;
      for (let i = 1; i <= 3; i++) {
        const kk = clamp(k + i * 0.055, 0, 1);
        const tx = lerp(cx, hx, kk), ty = lerp(cy, hy, kk) - Math.sin((1 - kk) * Math.PI) * 150;
        ctx.globalAlpha = 0.22 - i * 0.05;
        circle(ctx, tx, ty, 9 - i * 2, high ? '#8fd6ff' : '#ffd870');
      }
      ctx.restore();
      /* and the thing itself, spinning */
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(k * 9 + G.t * 3);
      drawProp(ctx, hz.prop, -hz.w / 2, -hz.h / 2, hz.w, hz.h, G.t, G.palOf(hz), hz.x,
               { role: hz.kind, floorY: hz.h });
      ctx.restore();
      /* the mark on the floor, or in the air, where it is going to end up */
      this.mark(G, hz, cx, cy, floorY, 1 - k);
      return true;
    }

    /* ---- she is past it: it comes down and rolls to a stop ---- */
    if (st.gone > 0) {
      const g = smooth(st.gone);
      const rest = floorY - 10;
      const drop = high ? (rest - cy) : 0;
      const bounce = Math.abs(Math.sin(st.gone * Math.PI * 1.6)) * (1 - st.gone) * 26;
      ctx.save();
      ctx.translate(cx - g * 40, cy + drop * g - bounce);
      ctx.rotate(g * (high ? 3.2 : 1.5));
      ctx.globalAlpha = 1 - st.gone * 0.15;
      drawProp(ctx, hz.prop, -hz.w / 2, -hz.h / 2, hz.w, hz.h, G.t, G.palOf(hz), hz.x,
               { role: hz.kind, floorY: hz.h });
      ctx.restore();
      return true;
    }
    return false;                              /* landed and waiting: drawn as normal */
  },

  /** the ring on the floor, or the ring in the air, that says where a thrown
      thing is going to be — drawn while it is still on its way there */
  mark(G, hz, cx, cy, floorY, k) {
    const ctx = G.ctx;
    if (k <= 0.02) return;
    const high = hz.kind === 'over';
    const col = high ? '#8fd6ff' : '#ffd870';
    ctx.save();
    ctx.globalAlpha = clamp(k * 1.4, 0, 1) * 0.75;
    if (high) {
      /* it is coming in at head height: draw the ring where it will hang, and
         the clear gap underneath it that she has to be inside */
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
      ell(ctx, cx, cy, hz.w * 0.55, hz.h * 0.6); ctx.stroke();
      ctx.setLineDash([]);
    } else {
      fillEll(ctx, cx, floorY + 3, hz.w * 0.5, 8, col);
      ctx.globalAlpha *= 0.6;
      ell(ctx, cx, floorY + 3, hz.w * 0.5 + 8 * (1 - k), 12 * (1 - k) + 8);
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
    }
    ctx.restore();
  },

  /* ---------------- what this one wants her to DO ----------------
     Two things sat at the same height used to mean two different answers, and
     nothing on the screen said which. Now every obstacle on this level carries
     the answer above it while there is still time to act on it: an arrow up
     over a thing to jump, an arrow down under a thing to duck, and a pair of
     brackets around the gap she has to go through. It fades in as soon as the
     obstacle is a reaction away and fades out as she reaches it. */
  cue(G, hz, x0, yTop, floorY) {
    if (!this.on || this.hold) return;
    const L = G.lota;
    if (!L) return;
    const ctx = G.ctx;
    const v = Math.max(220, speedAt(hz.x));
    const d = hz.x - L.x;
    if (d < -20 || d > v * 1.55) return;
    const k = Math.min(clamp((v * 1.55 - d) / (v * 0.45), 0, 1),
                       clamp(d / (v * 0.16), 0, 1));
    if (k <= 0.02) return;
    const duck = hz.kind === 'over' || hz.kind === 'bird';
    const col = duck ? '#8fd6ff' : '#ffd870';
    const pulse = 0.72 + Math.sin(G.t * 7) * 0.24;
    /* A scaffold half a street long has its middle somewhere off the screen,
       and a mark drawn there is a mark nobody sees. Everything below is drawn
       against the part of the thing that is actually in the picture, with the
       arrow near the end she is about to reach. */
    const gx0 = Math.max(x0, 4), gx1 = Math.min(x0 + hz.w, G.VW - 4);
    if (gx1 - gx0 < 8) return;
    const ax = clamp(x0 + Math.min(hz.w / 2, 90), gx0 + 18, gx1 - 18);
    ctx.save();
    ctx.globalAlpha = k * pulse;
    if (duck) {
      /* the gap she has to fit through: the floor line, both sides of the
         opening, and the arrow inside it pointing the way down */
      const gapTop = G.sy(hz.y), gapBot = floorY;
      ctx.save(); ctx.globalAlpha = k * 0.4;
      ctx.fillStyle = col;
      ctx.fillRect(gx0, gapTop, gx1 - gx0, gapBot - gapTop - 2);
      ctx.restore();
      line(ctx, gx0, gapBot - 2, gx1, gapBot - 2, col, 3);
      if (x0 > 4) line(ctx, gx0, gapTop + 2, gx0, gapBot - 2, col, 3);
      if (x0 + hz.w < G.VW - 4) line(ctx, gx1, gapTop + 2, gx1, gapBot - 2, col, 3);
      const ay = lerp(gapTop, gapBot, 0.42) + Math.sin(G.t * 7) * 4;
      poly(ctx, [[ax - 14, ay - 10], [ax + 14, ay - 10], [ax, ay + 12]], col);
    } else {
      const ay = yTop - 22 - Math.abs(Math.sin(G.t * 7)) * 7;
      poly(ctx, [[ax - 15, ay + 12], [ax + 15, ay + 12], [ax, ay - 12]], col);
      ctx.save(); ctx.globalAlpha = k * 0.35;
      line(ctx, ax - 22, yTop + 4, ax + 22, yTop + 4, col, 3); ctx.restore();
    }
    ctx.restore();
  },

  /* ---------------- what is coming before it is on the screen ----------------
     At this speed the screen only shows about half a second of road ahead,
     which is not enough time to read an obstacle, let alone decide what to do
     about it. So everything inside the next second and three quarters is
     announced at the right-hand edge first: the arrow it is going to want,
     sitting at the height it is going to be at, filling up as it arrives.
     By the time the thing itself slides into view the answer is already on
     the screen. */
  edgeWarn(G) {
    if (!this.on || this.hold) return;
    const L = G.lota;
    if (!L) return;
    const ctx = G.ctx, VW = G.VW;
    const v = Math.max(220, speedAt(L.x));
    const AHEAD = v * 1.75;
    const c = queryCells(G.world, L.x, L.x + AHEAD + 40);
    const seen = [];
    for (let i = 0; i < c.hazards.length; i++) {
      const hz = c.hazards[i];
      if (hz.smashed || hz.layer !== L.layer) continue;
      const d = hz.x - L.x;
      if (d <= 0 || d > AHEAD) continue;
      if (G.sx(hz.x) < VW - 26) continue;      /* already in view: the cue has it */
      seen.push({ hz: hz, d: d });
    }
    if (!seen.length) return;
    seen.sort((a, b) => a.d - b.d);
    const floorY = G.sy(G.floorBase(L));
    seen.slice(0, 2).forEach((it, n) => {
      const hz = it.hz;
      const duck = hz.kind === 'over' || hz.kind === 'bird';
      const col = duck ? '#8fd6ff' : '#ffd870';
      const k = clamp(1 - it.d / AHEAD, 0, 1);          /* 0 far away, 1 arriving */
      const x = VW - 42 - n * 5;
      const y = duck ? floorY - 108 : floorY - 34;
      ctx.save();
      ctx.globalAlpha = (0.35 + k * 0.65) * (n ? 0.55 : 1);
      fillRR(ctx, x - 22, y - 22, 44, 44, 13, 'rgba(14,9,26,.6)');
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
      if (duck) poly(ctx, [[x - 11, y - 8], [x + 11, y - 8], [x, y + 10]], col);
      else poly(ctx, [[x - 11, y + 8], [x + 11, y + 8], [x, y - 10]], col);
      /* how close it is, as a ring that closes round the badge */
      ctx.globalAlpha *= 0.9;
      ctx.beginPath();
      ctx.arc(x, y, 27, -Math.PI / 2, -Math.PI / 2 + TAU * k);
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    });
  },

  /* ---------------- whoever is behind her ---------------- */
  drawChase(G) {
    if (!this.on || this.hold) return;
    const ctx = G.ctx, L = G.lota, VW = G.VW, VH = G.VH;
    const who = this.chaserAt(G);
    if (!who) return;
    const close = 1 - this.gap;

    /* the dark of them coming up the road behind her. It used to be nearly
       all there was to see; now it is only the weather they arrive in — they
       themselves are on the screen the whole time. */
    ctx.save();
    ctx.globalAlpha = 0.08 + close * 0.28;
    const g = ctx.createLinearGradient(0, 0, VW * 0.62, 0);
    g.addColorStop(0, 'rgba(12,8,22,.95)'); g.addColorStop(1, 'rgba(12,8,22,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW * 0.62, VH);
    ctx.restore();

    /* dust and paper kicked up ahead of them */
    ctx.save(); ctx.globalAlpha = 0.1 + close * 0.3;
    for (let i = 0; i < 7; i++) {
      const r = makeRng(i * 43 + Math.floor(G.t * 4) * 17);
      const px = imod(r() * 240 - G.t * 260, 300) - 40 + close * 120;
      fillEll(ctx, px, G.sy(L.y) - 10 - r() * 46, 22 + r() * 30, 8 + r() * 8, '#8a7f94');
    }
    ctx.restore();

    /* And then the people themselves — always. Whoever is after her is on
       the screen from the moment they take up the chase: running, legs going,
       arms going, close enough behind her to be read as a person rather than
       as a shadow. How far back they are is what the gap says: right on her
       heels when it is nearly gone, a good stretch of road back when it is
       full — but never off the edge of the picture. */
    const lotaX = G.sx(L.x);
    const bx = Math.max(86, lotaX - lerp(76, 236, this.gap));
    const by = G.sy(G.floorBase(L));
    const s = 1.12;
    /* the vet throws over her own head, and the arm has to show it */
    const vopt = { throw: clamp(this.throwT / 0.5, 0, 1), mouth: close * 0.7 };
    if (who === 'groomer') drawGroomer(ctx, bx, by, s, G.t, this.run, this.lunge, { mouth: close * 0.6 });
    else if (who === 'both') {
      drawGroomer(ctx, Math.max(30, bx - 82), by, s * 0.94, G.t, this.run + 1.7, this.lunge,
                  { mouth: close * 0.6 });
      drawVet(ctx, bx, by, s, G.t, this.run, this.lunge, vopt);
    } else drawVet(ctx, bx, by, s, G.t, this.run, this.lunge, vopt);

    /* the last warning: the screen itself starts to panic */
    if (this.gap < 0.18) {
      ctx.save();
      ctx.globalAlpha = (0.18 - this.gap) / 0.18 * (0.35 + Math.sin(G.t * 12) * 0.2);
      const v = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VH);
      v.addColorStop(0, 'rgba(226,69,60,0)'); v.addColorStop(1, 'rgba(226,69,60,.95)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, VW, VH);
      ctx.restore();
    }
  },

  /** the burst itself, drawn over the top of her */
  drawBoost(G) {
    if (!this.on || this.boost <= 0) return;
    const ctx = G.ctx, VW = G.VW, VH = G.VH, L = G.lota;
    const k = clamp(this.boost / BOSS.BOOST, 0, 1);
    ctx.save();
    for (let i = 0; i < 22; i++) {
      const r = makeRng(i * 61 + Math.floor(G.t * 22) * 13);
      const yy = r() * VH, len = VW * (0.3 + r() * 0.7);
      const x0 = imod(r() * VW * 1.5 - G.t * 2400, VW + len) - len;
      const gg = ctx.createLinearGradient(x0, 0, x0 + len, 0);
      gg.addColorStop(0, 'rgba(143,232,255,0)');
      gg.addColorStop(0.5, i % 3 ? 'rgba(255,255,255,.8)' : 'rgba(143,232,255,.75)');
      gg.addColorStop(1, 'rgba(143,232,255,0)');
      ctx.globalAlpha = k * (0.25 + r() * 0.4);
      ctx.fillStyle = gg; ctx.fillRect(x0, yy, len, 1.4 + r() * 3);
    }
    /* a trail of sparks off her heels */
    ctx.globalAlpha = k * 0.5;
    for (let i = 0; i < 9; i++) {
      const ph = ((G.t * 2.4) + i * 0.11) % 1;
      circle(ctx, G.sx(L.x) - 20 - ph * 260, G.sy(L.y) - 18 + Math.sin(ph * 7 + i) * 12,
        4 + ph * 12, '#8fe8ff');
    }
    ctx.restore();
  },

  /* =================================================================
     THE FILM

     Nothing here is playable. She is on the table, the clippers are
     out, one nail is done — and then she is not on the table any more.
     ================================================================= */
  startCut(level, mode) {
    this.cut = { t: 0, level: level, mode: mode, ending: 0, said1: 0, said2: 0, snip: 0 };
    Sfx.init(); Sfx.resume();
  },
  stepCut(dt, G) {
    const c = this.cut;
    if (!c) return;
    c.t += dt;
    /* the clippers, twice, on a claw that was never in anybody's way */
    if (c.snip < 2 && c.t >= [1.45, 2.35][c.snip]) { c.snip++; Sfx.snip(); }
    /* and the two lines, spoken out loud. The vet is loud, fast and appalled;
       Lota is smaller, higher, and has no idea what she is supposed to have
       done. If the device has no voice, Sfx falls back to blips. */
    if (!c.said1 && c.t >= 4.85) {
      c.said1 = 1;
      Sfx.say('Why you?!', { pitch: 1.85, rate: 1.3, v: 0 });
    }
    if (!c.said2 && c.t >= 7.15) {
      c.said2 = 1;
      Sfx.say('What did I do?', { pitch: 2.0, rate: 1.0, v: 1 });
    }
    if (c.t > 11.2) this.endCut(G);
  },
  endCut(G) {
    const c = this.cut;
    if (!c) return;
    this.cut = null;
    Sfx.hush();
    G.startRun(false, c.level, c.mode);
  },

  /** the whole scene, in one function, driven by nothing but `c.t` */
  drawCut(G) {
    const ctx = G.ctx, VW = G.VW, VH = G.VH, c = this.cut;
    if (!c) return;
    const T = c.t, floorY = VH * 0.80;

    BG4.clinicWall(ctx, VW, VH, 0, floorY, T, '#eaf2f6', '#bcd8e4', '#5fa8c4');
    /* the floor */
    ctx.fillStyle = '#b8c8d0'; ctx.fillRect(0, floorY, VW, VH - floorY);
    fillRR(ctx, 0, floorY, VW, 9, 0, '#dfe8ee');
    ctx.save(); ctx.globalAlpha = .3;
    for (let px = 0; px < VW; px += 132) line(ctx, px, floorY, px, VH, '#94a4ae', 2);
    ctx.restore();

    /* the table, a little left of centre: everything happens to the right of
       it, because that is the way she is going to leave */
    /* the table is chest-high on the vet, so that when she is bent over the
        paw her hands and the paw are in the same place on the screen */
    const tx = VW * 0.38, ty = floorY - 130;
    fillRR(ctx, tx - 148, ty, 296, 22, 7, '#c4d0d8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    fillRR(ctx, tx - 140, ty - 8, 280, 12, 6, '#e8eef2');
    fillRR(ctx, tx - 22, ty + 20, 44, 112, 6, '#8b98a6');
    fillEll(ctx, tx, floorY, 74, 13, '#7a8694');

    /* the lamp swung over it */
    ctx.save(); ctx.globalAlpha = .95;
    line(ctx, tx + 150, 30, tx + 150, ty - 150, '#8b98a6', 6);
    line(ctx, tx + 150, ty - 150, tx + 40, ty - 176, '#8b98a6', 6);
    PROPS.examLamp(ctx, tx - 30, ty - 196, 120, 46, T, {}, 0, {});
    ctx.restore();

    /* ---- the beats ----
       jump0..jump1 is the leap: she goes OVER the vet, lands on the far side
       of her, and everything after that is her looking back at somebody who
       is now between her and the table. */
    const jump0 = 3.5, jump1 = 4.6;
    const lotaX0 = tx + 14;                /* on the table, paw out to the right */
    const vetX = tx + 185;                 /* the vet, an arm's length off the table */
    const landX = tx + 306;                /* where she comes down, past her */

    /* ---- the vet ----
       Until the leap she is bent over the paw with the clippers actually on
       it. After it she spins round to face the way the dog went. */
    const spun = clamp((T - jump1 + 0.35) * 3.2, 0, 1);
    const vetScale = 1.7;
    ctx.save();
    ctx.translate(vetX, floorY);
    /* she faces left at the table, and swings round to the right afterwards.
       Halfway through the turn she is edge-on, which is exactly what a spin
       on the spot looks like — but a scale of nothing draws nothing, so it
       never quite gets there. */
    const turn = -vetScale * (1 - spun * 2);
    ctx.scale(Math.abs(turn) < 0.14 ? (turn < 0 ? -0.14 : 0.14) : turn, vetScale);
    const clipping = T < jump0;
    drawVet(ctx, 0, 0, 1, T, T * 1.4, 0, {
      still: true,
      lean: clipping ? 0.22 : -0.1 * spun,
      /* the arm goes down and forward onto the paw, and stays there */
      arm: clipping ? -0.35 : (spun > 0.5 ? -1.5 : -0.2),
      reach: clipping ? 18 : 0,
      snip: clipping && T > 1.0,
      mouth: T > jump0 ? clamp((T - jump0) * 1.6, 0, 1) : 0.1,
      cross: T > jump1
    });
    ctx.restore();

    /* ---- what Lota is doing ---- */
    let lx, ly, st = 'sit', face = 'calm', tilt = 0, paw = false;
    const scale = 1.3;
    if (T < jump0) {
      /* on the table, one paw held out to the vet, ears going up as it dawns */
      lx = lotaX0; ly = ty;
      st = 'sit'; paw = true;
      face = T < 2.4 ? 'calm' : 'wow';
      tilt = Math.sin(T * 1.5) * 0.06 + (T > 2.4 ? -0.12 : 0);
    } else if (T < jump1) {
      /* the leap: off the table, up over the vet's head, down on her far side */
      const k = (T - jump0) / (jump1 - jump0);
      lx = lerp(lotaX0, landX, k);
      ly = lerp(ty, floorY, k) - Math.sin(k * Math.PI) * 168;
      st = k < 0.55 ? 'jump' : 'fall';
      face = 'wow'; tilt = 0.16;
    } else if (T < 9.4) {
      /* down on the far side, looking back at her over her shoulder */
      lx = landX; ly = floorY;
      st = 'sit'; face = T < 6.9 ? 'wow' : 'happy';
      tilt = Math.sin(T * 1.2) * 0.08;
      paw = T > 7.1 && T < 8.6;
    } else {
      /* and gone — forwards, the way the whole level runs */
      const k = clamp((T - 9.4) / 1.5, 0, 1);
      lx = lerp(landX, VW + 170, smooth(k)); ly = floorY;
      st = 'run'; face = 'happy'; tilt = 0;
    }

    /* the two snips, and the little crescent of claw that flies off the paw
       the vet is holding */
    const pawX = tx + 48, pawY = ty - 18;
    [1.45, 2.35].forEach(sT => {
      const k = T - sT;
      if (k < 0 || k > 0.7) return;
      ctx.save();
      ctx.globalAlpha = 1 - k / 0.7;
      ctx.translate(pawX + k * 80, pawY - k * 70);
      ctx.rotate(k * 9);
      fillEll(ctx, 0, 0, 7, 4, '#f2e2c6');
      ctx.restore();
      if (k < 0.18) {
        ctx.save(); ctx.globalAlpha = 1 - k / 0.18;
        ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 6; ctx.strokeStyle = '#fff6d8';
        ctx.strokeText('cvakšt!', pawX + 66, pawY - 74);
        ctx.fillStyle = '#7a2b34';
        ctx.fillText('cvakšt!', pawX + 66, pawY - 74);
        ctx.restore();
      }
    });

    /* Once she is down on the far side she is looking back over her shoulder
       at the person she has just jumped, so she is drawn facing that way —
       and turns round again only when she leaves. */
    const lookBack = T > jump1 && T < 9.3;
    ctx.save();
    if (lookBack) { ctx.translate(lx, 0); ctx.scale(-1, 1); ctx.translate(-lx, 0); }
    drawLota(ctx, lx, ly, { state: st, t: T, run: T * 12, skin: Save.data.skin,
                            scale: scale, face: face, tilt: tilt, paw: paw });
    ctx.restore();

    /* the puff of the take-off, and the one where she lands */
    [[jump0, lotaX0, ty], [jump1, landX, floorY]].forEach(p => {
      const k = T - p[0];
      if (k < 0 || k > 0.45) return;
      ctx.save(); ctx.globalAlpha = (1 - k / 0.45) * 0.6;
      for (let i = 0; i < 5; i++)
        circle(ctx, p[1] - 20 + i * 12, p[2] - 4 - k * 30 - i * 3, 6 + k * 22, '#ffffff');
      ctx.restore();
    });

    /* ---- the two lines. They are spoken out loud; the bubbles are only
       there so a player with the sound off still gets them. ---- */
    this.bubble(ctx, vetX - 34, floorY - 250, 'Why you?!', 4.8, 6.7, T, 1, '#fff6d8', '#7a2b34');
    this.bubble(ctx, landX - 66, floorY - 150, 'What did I do?', 7.1, 9.2, T, 1, '#e8f6ff', '#2f4a60');

    /* fade up at the top, and out at the bottom */
    if (T < 0.8) {
      ctx.save(); ctx.globalAlpha = 1 - T / 0.8;
      ctx.fillStyle = '#0d0a16'; ctx.fillRect(0, 0, VW, VH); ctx.restore();
    }
    if (T > 10.5) {
      ctx.save(); ctx.globalAlpha = clamp((T - 10.5) / 0.7, 0, 1);
      ctx.fillStyle = '#0d0a16'; ctx.fillRect(0, 0, VW, VH); ctx.restore();
    }
    /* a vignette, so it reads as a film and not as the game */
    const vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.4, VW / 2, VH / 2, VH);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(8,4,16,.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.globalAlpha = .85; ctx.fillStyle = '#0d0a16';
    ctx.fillRect(0, 0, VW, 26); ctx.fillRect(0, VH - 26, VW, 26); ctx.restore();
  },

  /** one speech bubble, popping in and out on its own clock */
  bubble(ctx, x, y, text, t0, t1, T, dir, fill, ink) {
    if (T < t0 || T > t1) return;
    const inK = clamp((T - t0) / 0.22, 0, 1);
    const outK = clamp((t1 - T) / 0.2, 0, 1);
    const s = Math.min(inK, 1) * (0.86 + Math.min(inK, 1) * 0.14) * (0.6 + outK * 0.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = Math.min(1, outK * 1.4);
    ctx.font = 'bold 27px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(text).width + 44, h = 62;
    fillRR(ctx, -w / 2, -h, w, h, 20, fill);
    ctx.strokeStyle = 'rgba(24,16,34,.5)'; ctx.lineWidth = 3; ctx.stroke();
    poly(ctx, [[dir * 14, -6], [dir * 44, -6], [dir * 20, 26]], fill);
    ctx.fillStyle = ink;
    ctx.fillText(text, 0, -h / 2 - 2);
    ctx.restore();
  }
};
