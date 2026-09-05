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

  /* ---------------- the run ---------------- */
  /** Called by Game.startRun for every level; it only wakes up on the boss. */
  reset(world) {
    this.on = !!(world && world.boss);
    this.energy = 0; this.charge = 0; this.holdT = 0; this.wasted = 0;
    this.gap = 1; this.boost = 0; this.boostT = 0; this.run = 0; this.lunge = 0;
    this.told = false;
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
     Everything the vet throws is a perfectly ordinary obstacle: its box
     never moves, and by the time she can reach it, it has landed. What
     changes is where it is *drawn* — it comes over the top of the screen
     and lands in its slot about half a second before she arrives, which is
     all the warning this level gives. */
  flight(G, hz) {
    const d = hz.x - G.lota.x;
    const k = clamp((d - 120) / 620, 0, 1);
    return k;
  },
  drawThrown(G, hz, k) {
    /* the mark on the ground where it is about to land */
    const ctx = G.ctx;
    if (k <= 0.02) return;
    const cx = G.sx(hz.x + hz.w / 2);
    const fy = G.sy(hz.base || 0);
    ctx.save();
    ctx.globalAlpha = (1 - k) * 0.75;
    fillEll(ctx, cx, fy + 3, hz.w * 0.4 * (1 - k * 0.5), 6, '#1a1226');
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = clamp(k * 1.6, 0, 1) * (0.55 + Math.sin(G.t * 16) * 0.35);
    ctx.translate(cx, G.sy(hz.y + hz.h) - 46);
    fillRR(ctx, -13, -20, 26, 30, 8, '#e2453c');
    ctx.fillStyle = '#fff6d8';
    ctx.font = 'bold 21px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, -5);
    poly(ctx, [[-7, 9], [7, 9], [0, 20]], '#e2453c');
    ctx.restore();
  },

  /* ---------------- whoever is behind her ---------------- */
  drawChase(G) {
    if (!this.on) return;
    const ctx = G.ctx, L = G.lota, VW = G.VW, VH = G.VH;
    const who = this.chaserAt(G);
    if (!who) return;
    const close = 1 - this.gap;

    /* the dark of them coming up the road behind her — this is all there is
       to see for most of the street, and it is meant to be */
    ctx.save();
    ctx.globalAlpha = 0.10 + close * 0.55;
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

    /* and then, when they are properly close, the people themselves */
    const bx = G.sx(L.x) - (110 + this.gap * 470);
    const by = G.sy(G.floorBase(L));
    if (bx > -170) {
      const s = 1.05;
      if (who === 'groomer') drawGroomer(ctx, bx, by, s, G.t, this.run, this.lunge);
      else if (who === 'both') {
        drawGroomer(ctx, bx - 74, by, s * 0.94, G.t, this.run + 1.7, this.lunge);
        drawVet(ctx, bx, by, s, G.t, this.run, this.lunge);
      } else drawVet(ctx, bx, by, s, G.t, this.run, this.lunge);
    }

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
    this.cut = { t: 0, level: level, mode: mode, ending: 0 };
  },
  stepCut(dt, G) {
    const c = this.cut;
    if (!c) return;
    c.t += dt;
    if (c.t > 10.6) this.endCut(G);
  },
  endCut(G) {
    const c = this.cut;
    if (!c) return;
    this.cut = null;
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

    /* the table, dead centre */
    const tx = VW * 0.44, ty = floorY - 168;
    fillRR(ctx, tx - 148, ty, 296, 22, 7, '#c4d0d8');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    fillRR(ctx, tx - 140, ty - 8, 280, 12, 6, '#e8eef2');
    fillRR(ctx, tx - 22, ty + 20, 44, 148, 6, '#8b98a6');
    fillEll(ctx, tx, floorY, 74, 13, '#7a8694');

    /* the lamp swung over it */
    ctx.save(); ctx.globalAlpha = .95;
    line(ctx, tx + 150, 30, tx + 150, ty - 150, '#8b98a6', 6);
    line(ctx, tx + 150, ty - 150, tx + 40, ty - 176, '#8b98a6', 6);
    PROPS.examLamp(ctx, tx - 30, ty - 196, 120, 46, T, {}, 0, {});
    ctx.restore();

    /* ---- what Lota is doing ---- */
    const jump0 = 3.5, jump1 = 4.5;
    let lx, ly, st = 'sit', face = 'calm', tilt = 0, paw = false, scale = 1.3;
    if (T < jump0) {
      /* on the table, one paw held out, ears going up as it dawns on her */
      lx = tx - 34; ly = ty;
      st = 'sit'; paw = true;
      face = T < 2.5 ? 'calm' : 'wow';
      tilt = Math.sin(T * 1.5) * 0.06 + (T > 2.5 ? -0.12 : 0);
    } else if (T < jump1) {
      /* the leap: off the table, down onto the floor to the left */
      const k = (T - jump0) / (jump1 - jump0);
      lx = lerp(tx - 34, tx - 250, k);
      ly = lerp(ty, floorY, k) - Math.sin(k * Math.PI) * 96;
      st = k < 0.5 ? 'jump' : 'fall';
      face = 'wow'; tilt = -0.16;
    } else if (T < 8.9) {
      /* on the floor, looking back over her shoulder */
      lx = tx - 250; ly = floorY;
      st = 'sit'; face = T < 6.6 ? 'wow' : 'happy';
      tilt = Math.sin(T * 1.2) * 0.08;
      paw = T > 6.8 && T < 8.2;
    } else {
      /* and gone */
      const k = clamp((T - 8.9) / 1.4, 0, 1);
      lx = lerp(tx - 250, -160, smooth(k)); ly = floorY;
      st = 'run'; face = 'happy'; tilt = 0.1;
    }
    /* the vet, on the right of the table, clippers in hand */
    const vetT = T < jump0 ? 0 : clamp((T - jump0) * 2, 0, 1);
    ctx.save();
    ctx.translate(tx + 208, floorY);
    ctx.rotate(-vetT * 0.06);
    ctx.scale(-1.62, 1.62);                    /* she faces left, at the table */
    drawVet(ctx, 0, 0, 1, T, T * 1.4, vetT * 0.4);
    ctx.restore();

    /* the two snips, and the little crescent of claw that flies off */
    [1.5, 2.4].forEach(s => {
      const k = T - s;
      if (k < 0 || k > 0.7) return;
      ctx.save();
      ctx.globalAlpha = 1 - k / 0.7;
      ctx.translate(tx + 10 + k * 90, ty - 30 - k * 70);
      ctx.rotate(k * 9);
      fillEll(ctx, 0, 0, 7, 4, '#f2e2c6');
      ctx.restore();
      if (k < 0.16) {
        ctx.save(); ctx.globalAlpha = 1 - k / 0.16;
        ctx.fillStyle = '#fff6d8'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('cvakšt!', tx + 40, ty - 56);
        ctx.restore();
      }
    });

    drawLota(ctx, lx, ly, { state: st, t: T, run: T * 12, skin: Save.data.skin,
                            scale: scale, face: face, tilt: tilt, paw: paw });

    /* ---- the two lines ---- */
    this.bubble(ctx, tx + 196, ty - 116, 'Why you?!', 4.7, 6.5, T, 1, '#fff6d8', '#7a2b34');
    this.bubble(ctx, tx - 148, floorY - 150, 'What did I do?', 6.9, 8.8, T, -1, '#e8f6ff', '#2f4a60');

    /* fade up at the top, and out at the bottom */
    if (T < 0.8) {
      ctx.save(); ctx.globalAlpha = 1 - T / 0.8;
      ctx.fillStyle = '#0d0a16'; ctx.fillRect(0, 0, VW, VH); ctx.restore();
    }
    if (T > 9.9) {
      ctx.save(); ctx.globalAlpha = clamp((T - 9.9) / 0.7, 0, 1);
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
