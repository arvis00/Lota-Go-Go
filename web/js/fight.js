'use strict';
/* ---------------------------------------------------------------
   fight.js — the two interludes and the fight at the end of them.

   Three scripted scenes and one battle live here:

   * THE SALON. She runs in, and the whole level stops dead for four
     seconds: the groomer turns round, sees her, and tries to buy her
     with a treat. She takes the treat — upside down, in the air, in
     slow motion — and the level starts again exactly where it left off.

   * THE ARENA. At the mouth of the last place she stops running for
     good. Everybody who has been chasing her walks in and plants
     themselves, the dogs come in behind them, and the game explains
     the two buttons it has just given her.

   * THE FIGHT. Bones fall. White ones go home into a boss; orange
     ones cost her a life. Ten each on them, five on her, and losing
     drops her back into this arena and nowhere else.

   * AND THE END OF IT. The two of them run at each other, work out
     what has happened, and the level is over.

   A scene never moves the world: it drives Lota where she already is
   and draws everybody else over the top, so the run picks up on the
   same stretch of floor it paused on.
----------------------------------------------------------------*/

const FIGHT = {
  BOSS_HP: 10,          // each of the two
  LIVES: 5,             // and what Lota has to spend
  RAMP: 50,             // seconds over which the bones speed up
  FALL_0: 210, FALL_1: 555,
  GAP_0: 1.15, GAP_1: 0.38,
  BAD_0: 0.28, BAD_1: 0.50,
  MOVE: 430,            // how fast she crosses the arena
  R: 21                 // a bone's radius
};

/* =================================================================
   THE THREE SCENES
================================================================= */
const Scene = {
  on: null,

  /** Freeze the run and start one. Lota stays exactly where she is. */
  start(kind, G) {
    const L = G.lota;
    /* the arena is pegged where she stops running; the salon never moves it,
       and the victory scene plays out in the one the fight already used */
    if (kind === 'arena') Fight.setup(G, L.x + 150);
    G.state = 'scene'; G.stateT = 0;
    Boss.hold = true;
    L.vy = 0; L.grounded = true; L.duck = false; L.rot = 0; L.flip = 0;
    this.on = { kind: kind, t: 0, x0: L.x, base: G.floorBase(L),
                said: {}, caught: 0, cardOn: 0 };
    UI.tut(false);
    Sfx.init(); Sfx.resume();
    if (kind === 'arena') { UI.bossHud(false); Music.stop(); }
    if (kind === 'victory') Music.stop();
  },

  /** one line, spoken once, whatever the frame rate is doing */
  line(key, text, o) {
    const s = this.on;
    if (!s || s.said[key]) return;
    s.said[key] = 1;
    Sfx.say(text, o);
  },

  /** slow motion is a scene's own business: it stretches its clock */
  rate(s) {
    if (s.kind === 'salon' && s.t > 3.05 && s.t < 4.15) return 0.35;
    return 1;
  },

  step(dt, G) {
    const s = this.on;
    if (!s) return;
    s.t += dt * this.rate(s);
    /* the camera settles on the arena while the scene plays */
    if (s.kind !== 'salon') {
      const tx = Fight.cx - G.VW * 0.5;
      G.cam.x = lerp(G.cam.x, tx, 1 - Math.pow(0.06, dt));
    }
    if (s.kind === 'salon') this.stepSalon(dt, G);
    else if (s.kind === 'arena') this.stepArena(dt, G);
    else this.stepVictory(dt, G);
  },

  end(G) {
    const s = this.on;
    this.on = null;
    if (!s) return;
    if (s.kind === 'salon') {
      /* back into the run, on the same floor, a dog's length further on */
      const L = G.lota;
      L.rot = 0; L.flip = 0; L.state = 'run'; L.grounded = true; L.vy = 0;
      L.y = groundYAt(G.world, L.x, 'main');
      if (L.y == null) L.y = s.base;
      Boss.hold = false;
      G.state = 'run'; G.stateT = 0;
      Music.play(G.run.level);
      UI.tut(false);
      UI.toast('Skanėstas!', 'ir toliau — pro galines duris');
    } else if (s.kind === 'arena') {
      Fight.start(G);
    } else {
      G.finish();
    }
  },

  /* ---------------- 1 · the salon, and the treat ----------------
     She skids to a halt in the doorway, the groomer turns round and
     sees her, and the only idea he has is to buy her off. */
  stepSalon(dt, G) {
    const s = this.on, L = G.lota, T = s.t;
    const gx = s.x0 + 330;                       /* where he is standing */
    s.gx = gx;
    if (T < 0.55) {
      /* the skid */
      const k = smooth(T / 0.55);
      L.x = s.x0 + 92 * k; L.y = s.base;
      L.state = 'duck'; L.duck = true;
      if (Math.random() < 0.5) G.puff(L.x - 16, s.base, 2);
    } else if (T < 2.5) {
      L.x = s.x0 + 92; L.y = s.base; L.duck = false;
      L.state = 'sit';
      if (T > 0.62) this.line('see', 'A dog!', { pitch: 1.5, rate: 1.35, v: 0 });
      if (T > 1.45) this.line('lure', 'Come here, doggy!', { pitch: 1.6, rate: 1.05, v: 0 });
    } else if (T < 2.8) {
      L.state = 'duck'; L.duck = true;           /* the crouch before the jump */
    } else if (T < 4.6) {
      /* the leap at him — and halfway up she goes over onto her back */
      const k = (T - 2.8) / 1.8;
      L.duck = false;
      L.x = lerp(s.x0 + 92, s.x0 + 258, k);
      L.y = s.base + Math.sin(k * Math.PI) * 196;
      L.state = k < 0.5 ? 'jump' : 'fall';
      L.rot = -TAU * smooth(k);
      if (T > 3.0) this.line('panic', 'Aaah!', { pitch: 2, rate: 1.4, v: 0 });
      if (!s.caught && T >= 3.95) {
        s.caught = 1;
        Sfx.bone(); Sfx.yip();
        G.fx.flash = 0.25;
        for (let i = 0; i < 16; i++) G.fx.sparks.push({
          x: L.x + 20, y: L.y + 40, vx: (Math.random() - .5) * 220,
          vy: 60 + Math.random() * 180, life: .6, c: i % 2 ? '#ffe8a8' : '#ffffff'
        });
      }
    } else if (T < 5.4) {
      L.x = s.x0 + 258; L.y = s.base; L.rot = 0;
      L.state = 'sit';
    } else this.end(G);
  },

  /* ---------------- 2 · the arena fills up ---------------- */
  stepArena(dt, G) {
    const s = this.on, L = G.lota, T = s.t;
    if (T < 1.1) {
      const k = smooth(T / 1.1);
      L.x = lerp(s.x0, Fight.cx, k); L.y = s.base;
      L.state = k > 0.75 ? 'sit' : 'duck'; L.duck = k <= 0.75;
      if (Math.random() < 0.6) G.puff(L.x - 18, s.base, 2);
      if (T > 0.9) L.duck = false;
    } else {
      L.x = Fight.cx; L.y = s.base; L.state = 'sit'; L.duck = false;
    }
    if (T > 2.15 && !s.said.thud1) { s.said.thud1 = 1; Sfx.thud(); }
    if (T > 2.95 && !s.said.thud2) { s.said.thud2 = 1; Sfx.thud(); }
    if (T > 3.4 && !s.said.woof) { s.said.woof = 1; Sfx.bark(); }
    if (T > 3.7 && !s.said.horn) { s.said.horn = 1; Sfx.unlock(); }
    /* the two buttons appear at the same moment the card explains them */
    if (T > 4.3 && !s.cardOn) { s.cardOn = 1; UI.movePad(true); Sfx.click(); }
    if (T > 7.6) this.end(G);
  },

  /* ---------------- 3 · and what happens after she wins ---------------- */
  stepVictory(dt, G) {
    const s = this.on, L = G.lota, T = s.t;
    L.y = Fight.base; L.duck = false; L.rot = 0; L.flip = 0;
    /* she gets out of the way first: the two of them are about to run into
       each other, and they should not run into her doing it */
    if (s.lx0 == null) s.lx0 = L.x;
    L.x = lerp(s.lx0, Fight.cx - Fight.spread * 0.86, smooth(clamp(T / 0.8, 0, 1)));
    /* she hops on the spot, because of course she does */
    if (T > 1.4) {
      const hop = Math.max(0, Math.sin((T - 1.4) * 5.2));
      L.y = Fight.base + hop * 74;
      L.state = hop > 0.05 ? 'jump' : 'run';
    } else L.state = 'sit';
    if (T > 1.35 && !s.said.bump) {
      s.said.bump = 1;
      Sfx.thud(); Sfx.boing();
      G.fx.shake = 0.35;
      Sfx.say('Ouch!', { pitch: 1.9, rate: 1.3, v: 0 });
    }
    if (T > 2.5) this.line('won', 'She won!', { pitch: 1.75, rate: 1.05, v: 1 });
    if (T > 1.5 && !s.said.party) {
      s.said.party = 1;
      Sfx.win();
      for (let i = 0; i < 90; i++) G.fx.confetti.push({
        x: Math.random() * G.VW, y: -Math.random() * 260,
        vx: (Math.random() - 0.5) * 90, vy: 90 + Math.random() * 170,
        r: Math.random() * TAU, vr: (Math.random() - 0.5) * 9,
        w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
        c: ['#ffd870', '#ff8fd0', '#8fd6ff', '#a6e88f', '#ffffff'][i % 5]
      });
    }
    if (T > 4.6) this.end(G);
  },

  /* =============== the drawing =============== */
  draw(G) {
    const s = this.on;
    if (!s) return;
    if (s.kind === 'salon') this.drawSalon(G);
    else if (s.kind === 'arena') this.drawArena(G);
    else this.drawVictory(G);
  },

  drawSalon(G) {
    const ctx = G.ctx, s = this.on, T = s.t, L = G.lota;
    const gx = G.sx(s.gx), gy = G.sy(s.base);
    const slow = T > 3.05 && T < 4.3;

    /* the groomer. He starts with his back to the door, hears something,
       and comes round on the spot — which is the whole joke. */
    const turn = clamp((T - 0.55) * 3.0, 0, 1);
    const crouch = T > 1.3 && T < 3.05 ? clamp((T - 1.3) * 2.4, 0, 1) : 0;
    const scared = T > 3.0 ? clamp((T - 3.0) * 3, 0, 1) : 0;
    ctx.save();
    ctx.translate(gx, gy);
    const face = lerp(1, -1, turn);              /* +1 away, -1 facing her */
    ctx.scale(Math.abs(face) < 0.14 ? (face < 0 ? -0.14 : 0.14) : face, 1);
    drawGroomer(ctx, 0, 0, 1.25, G.t, G.t * 9, 0, {
      still: true, crouch: crouch * 0.7,
      arm: scared ? -2.5 : (crouch ? 0.35 : null),
      scared: scared, mouth: scared ? 1 : (T > 0.6 && T < 2.5 ? 0.5 : 0.1),
      cross: T > 0.7 && T < 1.9, lean: scared * -0.2
    });
    ctx.restore();

    /* the treat: held out, then thrown straight up in a panic, then caught */
    const handX = gx - 52, handY = gy - 96;
    let tx = handX, ty = handY, ts = 1;
    if (T >= 3.05 && T < 3.95) {
      const k = (T - 3.05) / 0.9;
      const cx = G.sx(L.x) + 26, cy = G.sy(L.y + 48);
      tx = lerp(handX, cx, k);
      ty = lerp(handY, cy, k) - Math.sin(k * Math.PI) * 210;
      ts = 1 + k * 0.15;
    } else if (T >= 3.95) {
      tx = G.sx(L.x) + 24; ty = G.sy(L.y + 44); ts = 0.9;
    } else {
      ty += Math.sin(T * 7) * 6;                 /* waved about, to tempt her */
    }
    boneIcon(ctx, tx, ty, ts, G.t);

    /* slow motion says so: bars top and bottom, and the air streaked */
    if (slow) {
      const k = Math.sin(clamp((T - 3.05) / 1.25, 0, 1) * Math.PI);
      ctx.save();
      ctx.globalAlpha = k * 0.5;
      for (let i = 0; i < 20; i++) {
        const r = makeRng(i * 41 + Math.floor(G.t * 5) * 13);
        const yy = r() * G.VH, len = G.VW * (0.2 + r() * 0.5);
        const x0 = imod(r() * G.VW * 1.4 - G.t * 260, G.VW + len) - len;
        ctx.fillStyle = i % 3 ? 'rgba(255,255,255,.4)' : 'rgba(255,208,232,.5)';
        ctx.fillRect(x0, yy, len, 1 + r() * 2.5);
      }
      ctx.globalAlpha = k * 0.92;
      ctx.fillStyle = '#0d0a16';
      ctx.fillRect(0, 0, G.VW, 44); ctx.fillRect(0, G.VH - 44, G.VW, 44);
      /* and the light goes out of the room while everything crawls */
      ctx.globalAlpha = k * 0.3;
      const vg = ctx.createRadialGradient(G.sx(L.x), G.sy(L.y + 40), G.VH * 0.16,
                                          G.sx(L.x), G.sy(L.y + 40), G.VH * 0.9);
      vg.addColorStop(0, 'rgba(20,12,36,0)'); vg.addColorStop(1, 'rgba(20,12,36,.95)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, G.VW, G.VH);
      ctx.restore();
    }
    if (s.caught && T < 4.6) {
      ctx.save();
      ctx.globalAlpha = clamp(1 - (T - 3.95) / 0.6, 0, 1);
      ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = 7; ctx.strokeStyle = '#fff6d8';
      ctx.strokeText('AM!', G.sx(L.x) + 40, G.sy(L.y + 120));
      ctx.fillStyle = '#7a2b34';
      ctx.fillText('AM!', G.sx(L.x) + 40, G.sy(L.y + 120));
      ctx.restore();
    }

    /* the two things anybody says in a salon doorway */
    Boss.bubble(ctx, gx - 40, gy - 210, 'Come here, doggy!', 1.45, 3.0, T, 1, '#fff0f6', '#7a2b34');
    Boss.bubble(ctx, gx - 30, gy - 230, 'Aaah!', 3.05, 4.2, T, 1, '#ffe0e6', '#7a2b34');
    if (T > 0.6 && T < 1.5) {
      ctx.save();
      ctx.globalAlpha = clamp((1.5 - T) * 2, 0, 1);
      ctx.font = 'bold 54px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd870';
      ctx.fillText('!', gx - 6, gy - 218);
      ctx.restore();
    }
  },

  /* ---- the arena filling up, and the card that explains the buttons ---- */
  drawArena(G) {
    const ctx = G.ctx, s = this.on, T = s.t, VW = G.VW;
    const gy = G.sy(Fight.base);
    /* the vet runs in from the left and plants herself */
    const vk = clamp((T - 1.1) / 1.1, 0, 1);
    const vx = lerp(G.sx(Fight.vetX) - 420, G.sx(Fight.vetX), smooth(vk));
    drawVet(ctx, vx, gy, 1.22, G.t, G.t * 13, 0,
            { still: vk >= 1, mouth: vk >= 1 ? 0.5 : 0.2, cross: vk >= 1 });
    /* the groomer comes in behind her and crosses to the other side */
    const gk = clamp((T - 1.9) / 1.2, 0, 1);
    const gxs = lerp(G.sx(Fight.vetX) - 520, G.sx(Fight.groX), smooth(gk));
    drawGroomer(ctx, gxs, gy, 1.2, G.t, G.t * 13 + 1.7, 0,
                { still: gk >= 1, mouth: gk >= 1 ? 0.5 : 0.2, cross: gk >= 1 });
    /* and the dogs walk in from the far side */
    Fight.drawDogs(G, clamp((T - 2.4) / 1.2, 0, 1), 0.25);

    /* the title */
    if (T > 3.5 && T < 5.0) {
      const k = clamp((T - 3.5) / 0.35, 0, 1) * clamp((5.0 - T) / 0.4, 0, 1);
      ctx.save();
      ctx.globalAlpha = k;
      ctx.textAlign = 'center';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillStyle = '#ffd870';
      ctx.fillText('BOSO KOVA', VW / 2, G.VH * 0.28);
      ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = '#fff6d8';
      ctx.fillText('Nebebėgame. Dabar kaunamės.', VW / 2, G.VH * 0.28 + 32);
      ctx.restore();
    }
    /* and the card: the two buttons she has just been given, and the rule */
    if (T > 4.3) {
      const k = clamp((T - 4.3) / 0.4, 0, 1) * clamp((7.6 - T) / 0.4, 0, 1);
      Fight.card(G, k);
    }
  },

  /* ---- the two of them work out what has just happened ---- */
  drawVictory(G) {
    const ctx = G.ctx, s = this.on, T = s.t;
    const gy = G.sy(Fight.base);
    const meet = G.sx(Fight.cx) + 70;      /* clear of the dog they lost to */
    /* they run at each other from opposite ends and collide in the middle */
    const k = clamp(T / 1.35, 0, 1);
    const gxs = lerp(G.sx(Fight.vetX), meet - 62, smooth(k));
    const vxs = lerp(G.sx(Fight.groX), meet + 62, smooth(k));
    const bump = T > 1.35 ? Math.max(0, Math.sin((T - 1.35) * 9) * (1 - (T - 1.35))) : 0;

    Fight.drawDogs(G, 1, 1);
    drawGroomer(ctx, gxs - bump * 26, gy, 1.2, G.t, G.t * 13 + 1.7, 0,
                { still: k >= 1, arm: k >= 1 ? -2.4 : null, scared: k >= 1 ? 1 : 0,
                  mouth: k >= 1 ? 1 : 0.3, lean: bump * 0.3 });
    ctx.save();
    ctx.translate(vxs + bump * 26, gy); ctx.scale(-1, 1);
    drawVet(ctx, 0, 0, 1.22, G.t, G.t * 13, 0,
            { still: k >= 1, arm: k >= 1 ? -2.2 : null, mouth: k >= 1 ? 1 : 0.3,
              lean: -bump * 0.3 });
    ctx.restore();
    /* the stars of the collision */
    if (bump > 0.02) {
      ctx.save();
      ctx.globalAlpha = bump;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + G.t * 3;
        const r = 40 + Math.sin(G.t * 8 + i) * 10;
        poly(ctx, [[meet + Math.cos(a) * r, gy - 190 + Math.sin(a) * r * 0.5],
                   [meet + Math.cos(a) * r + 9, gy - 182 + Math.sin(a) * r * 0.5],
                   [meet + Math.cos(a) * r - 4, gy - 176 + Math.sin(a) * r * 0.5]], '#ffd870');
      }
      ctx.restore();
    }
    Boss.bubble(ctx, meet - 96, gy - 236, 'Ouch!', 1.4, 2.6, T, 1, '#ffe0e6', '#7a2b34');
    Boss.bubble(ctx, meet + 110, gy - 250, 'She won!', 2.5, 4.4, T, -1, '#fff6d8', '#2f4a60');
    if (T > 3.0) {
      const k2 = clamp((T - 3.0) / 0.4, 0, 1);
      ctx.save();
      ctx.globalAlpha = k2; ctx.textAlign = 'center';
      ctx.font = 'bold 46px sans-serif'; ctx.fillStyle = '#ffd870';
      ctx.fillText('LOTA LAIMĖJO!', G.VW / 2, G.VH * 0.24);
      ctx.restore();
    }
  }
};

/* =================================================================
   THE FIGHT ITSELF
================================================================= */
const Fight = {
  on: false, t: 0, over: '', overT: 0,
  lives: FIGHT.LIVES, hp: [FIGHT.BOSS_HP, FIGHT.BOSS_HP],
  bones: [], shots: [], dogs: [], hitT: [0, 0],
  hurt: 0, spawnT: 0, spawned: 0, next: 0,
  cx: 0, base: 0, spread: 0, vetX: 0, groX: 0, minX: 0, maxX: 0,

  /** where everybody stands. Called by the scene that walks them in, and
      again by a retry that drops straight back into the fight. */
  setup(G, atX) {
    const L = G.lota;
    this.cx = atX == null ? L.x : atX;
    this.base = G.floorBase(L);
    const b = groundYAt(G.world, this.cx, 'main');
    if (b != null) this.base = b;
    this.spread = Math.min(330, G.VW * 0.34);
    this.vetX = this.cx - this.spread;
    this.groX = this.cx + this.spread;
    this.minX = this.cx - this.spread + 96;
    this.maxX = this.cx + this.spread - 96;
    /* The dogs stand between the two people and well behind them: smaller,
       lifted off the floor line, so the arena reads as having a depth to it
       and nobody is hidden behind a Great Dane. */
    const place = i => this.cx + (i - 1.5) * 108 + (i % 2 ? 18 : -18);
    if (!this.dogs.length) {
      this.dogs = BIG_DOG_IDS.map((id, i) => ({
        id: id, x: place(i), lift: 62 + (i % 2) * 16,
        s: 0.56 + (i % 3) * 0.05, phase: i * 1.7, face: i > 1 ? 1 : 0
      }));
    } else this.dogs.forEach((d, i) => { d.x = place(i); });
  },

  /** Everything resets except where they are standing: this is also the
      entry point a retry uses, so it must be able to start cold. */
  start(G) {
    const L = G.lota;
    this.setup(G, this.cx || L.x);
    this.on = true; this.t = 0; this.over = ''; this.overT = 0;
    this.lives = FIGHT.LIVES;
    this.hp = [FIGHT.BOSS_HP, FIGHT.BOSS_HP];
    this.hitT = [0, 0];
    this.bones.length = 0; this.shots.length = 0;
    this.hurt = 0; this.spawnT = 0; this.spawned = 0; this.next = 0;
    Boss.hold = true;
    L.x = this.cx; L.y = this.base; L.vy = 0; L.grounded = true;
    L.duck = false; L.rot = 0; L.flip = 0; L.state = 'run';
    /* the whole arena has to be in frame from the first bone. Coming out of
       the scene the camera is already here; coming back from a lost fight it
       is not, and easing it in would start the fight half off the screen. */
    G.cam.x = this.cx - G.VW * 0.5;
    G.cam.y = this.base; G.camBase = this.base; G.baseRef = this.base;
    G.state = 'fight'; G.stateT = 0;
    G.input.left = false; G.input.right = false; G.input.jumpBuf = 0;
    UI.bossHud(false);
    UI.tut(false);
    UI.movePad(true);
    UI.setZone('BOSO KOVA');
    UI.setProgress(0);
    Music.play(G.run.level);
    Music.setRate(0.6);
    /* Losing here never sends her back to the vet's table: the checkpoint IS
       this arena, so a retry drops straight back into the fight. */
    this.markCheckpoint(G);
    UI.toast('KOVA!', 'balti kaulai — rink, oranžinių — venk');
  },

  markCheckpoint(G) {
    const W = G.world;
    let k = 0;
    for (let i = 0; i < W.stops.length; i++) if (W.stops[i].zone === 4) { k = i; break; }
    G.checkpoint = {
      k: k, x: this.cx, y: this.base, zoneIdx: 4, name: 'Boso kova', start: false,
      bones: W.bones.filter(b => b.got).map(b => b.i),
      count: G.run.bones, b: G.run.gotB, t: G.run.gotT,
      items: W.items.filter(it => it.got).map(it => it.id),
      key: !!G.run.metroKey, fight: 1
    };
  },

  /* ---------------- one frame of the battle ---------------- */
  step(dt, G) {
    if (!this.on) return;
    const L = G.lota, I = G.input;
    this.t += dt;
    this.hurt = Math.max(0, this.hurt - dt);
    this.hitT[0] = Math.max(0, this.hitT[0] - dt);
    this.hitT[1] = Math.max(0, this.hitT[1] - dt);
    /* the camera holds the whole arena */
    G.cam.x = lerp(G.cam.x, this.cx - G.VW * 0.5, 1 - Math.pow(0.06, dt));

    if (this.over) {
      this.overT += dt;
      this.stepBones(dt, G, true);
      this.stepShots(dt, G);
      if (this.over === 'won' && this.overT > 1.2) {
        this.on = false;
        UI.movePad(false);
        Scene.start('victory', G);
      } else if (this.over === 'lost' && this.overT > 1.5) {
        this.on = false;
        UI.movePad(false);
        G.crashReason = 'fightLost';
        G.state = 'over';
        UI.showOver();
      }
      return;
    }

    /* ---- she moves left and right, and may hop ---- */
    const dir = (I.right ? 1 : 0) - (I.left ? 1 : 0);
    L.x = clamp(L.x + dir * FIGHT.MOVE * dt, this.minX, this.maxX);
    if (dir) L.flip = dir < 0 ? 1 : 0;
    if (I.jumpBuf > 0 && L.grounded) {
      L.vy = PHYS.JUMP_V * 0.9; L.grounded = false; I.jumpBuf = 0;
      Sfx.jump(); G.puff(L.x - 8, L.y, 4);
    }
    I.jumpBuf = Math.max(0, I.jumpBuf - dt);
    if (!L.grounded) {
      L.vy -= PHYS.GRAV * dt;
      L.y += L.vy * dt;
      if (L.y <= this.base) { L.y = this.base; L.vy = 0; L.grounded = true; Sfx.land(); }
    }
    L.runPhase += dt * (dir ? 15 : 5);
    L.state = !L.grounded ? (L.vy > 0 ? 'jump' : 'fall') : 'run';

    /* ---- bones fall, faster and faster ---- */
    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawn(G); this.spawnT = this.gap(); }
    this.stepBones(dt, G, false);
    this.stepShots(dt, G);

    const gone = (FIGHT.BOSS_HP * 2 - this.hp[0] - this.hp[1]) / (FIGHT.BOSS_HP * 2);
    UI.setProgress(gone);
    if (this.hp[0] <= 0 && this.hp[1] <= 0) {
      this.over = 'won'; this.overT = 0;
      Music.stop(); Sfx.win();
      G.fx.flash = 0.6;
    }
  },

  /** how hard it is right now: slow and generous at the start, quick later */
  ramp() { return clamp(this.t / FIGHT.RAMP, 0, 1); },
  gap() {
    /* the first few come one at a time, slowly, so the rule is obvious */
    if (this.spawned < 3) return 1.5;
    return lerp(FIGHT.GAP_0, FIGHT.GAP_1, this.ramp()) * (0.82 + Math.random() * 0.36);
  },
  spawn(G) {
    const k = this.ramp();
    const first = this.spawned < 3;
    const bad = first ? false : Math.random() < lerp(FIGHT.BAD_0, FIGHT.BAD_1, k);
    this.spawned++;
    this.bones.push({
      x: lerp(this.minX - 30, this.maxX + 30, Math.random()),
      y: G.cam.y + G.groundY + 60,
      v: (first ? 165 : lerp(FIGHT.FALL_0, FIGHT.FALL_1, k)) * (0.9 + Math.random() * 0.2),
      bad: bad, r: Math.random() * TAU, vr: (Math.random() - 0.5) * 4, dead: 0
    });
  },

  stepBones(dt, G, frozen) {
    const L = G.lota;
    for (let i = this.bones.length - 1; i >= 0; i--) {
      const b = this.bones[i];
      b.y -= b.v * dt;
      b.r += b.vr * dt;
      if (b.dead) { b.dead -= dt; if (b.dead <= 0) this.bones.splice(i, 1); continue; }
      /* the floor eats what she did not take */
      if (b.y <= this.base + 8) {
        b.y = this.base + 8;
        b.dead = 0.3;
        if (!b.bad) Sfx.thud();
        continue;
      }
      if (frozen) continue;
      /* did she get it? */
      const cy = L.y + 30;
      if (Math.abs(b.x - L.x) < 26 + FIGHT.R && Math.abs(b.y - cy) < 34 + FIGHT.R) {
        this.bones.splice(i, 1);
        if (b.bad) this.bite(G, b); else this.catchBone(G, b);
      }
    }
  },

  /** a white one: it turns round in her paws and goes home into a boss */
  catchBone(G, b) {
    Sfx.bone();
    const live = [0, 1].filter(i => this.hp[i] > 0);
    if (!live.length) return;
    /* whoever is still standing tallest gets it, so the two go down together */
    live.sort((a, c) => this.hp[c] - this.hp[a]);
    const target = live[0];
    this.shots.push({ x: b.x, y: b.y, t: 0, dur: 0.42, to: target,
                      x0: b.x, y0: b.y });
    for (let i = 0; i < 8; i++) G.fx.sparks.push({
      x: b.x, y: b.y, vx: (Math.random() - .5) * 180, vy: 40 + Math.random() * 150,
      life: .45, c: '#ffffff'
    });
  },

  /** an orange one: that is a life */
  bite(G, b) {
    if (this.hurt > 0) return;
    this.lives--;
    this.hurt = 1.5;
    Sfx.hurt();
    G.fx.shake = 0.5; G.fx.flash = 0.35;
    for (let i = 0; i < 14; i++) G.fx.sparks.push({
      x: b.x, y: b.y, vx: (Math.random() - .5) * 240, vy: 50 + Math.random() * 200,
      life: .6, c: i % 2 ? '#ff8f5a' : '#ffd0a8'
    });
    if (this.lives <= 0) {
      this.lives = 0;
      this.over = 'lost'; this.overT = 0;
      G.lota.state = 'sit'; G.lota.dead = true;
      Music.stop(); Sfx.crash();
    }
  },

  stepShots(dt, G) {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const sh = this.shots[i];
      sh.t += dt;
      const k = clamp(sh.t / sh.dur, 0, 1);
      const tx = sh.to === 0 ? this.vetX : this.groX;
      const ty = this.base + 120;
      sh.x = lerp(sh.x0, tx, k);
      sh.y = lerp(sh.y0, ty, k) + Math.sin(k * Math.PI) * 90;
      if (k >= 1) {
        this.shots.splice(i, 1);
        if (this.hp[sh.to] > 0) {
          this.hp[sh.to]--;
          this.hitT[sh.to] = 0.4;
          Sfx.strike();
          G.fx.shake = Math.max(G.fx.shake, 0.2);
          for (let q = 0; q < 12; q++) G.fx.sparks.push({
            x: tx, y: ty, vx: (Math.random() - .5) * 260, vy: 40 + Math.random() * 200,
            life: .5, c: q % 2 ? '#ffd870' : '#ffffff'
          });
          if (this.hp[sh.to] <= 0) { Sfx.locked(); Sfx.bark(); }
        }
      }
    }
  },

  /* ---------------- the drawing ---------------- */
  draw(G) {
    if (!this.on) return;
    const ctx = G.ctx;
    this.drawDogs(G, 1, this.over === 'won' ? 1 : 0.35);
    this.drawBosses(G);
    /* the bones, and the mark on the floor under each one */
    this.bones.forEach(b => {
      const sx = G.sx(b.x), sy = G.sy(b.y);
      ctx.save();
      ctx.globalAlpha = b.dead ? clamp(b.dead * 3, 0, 1) : 1;
      ctx.save(); ctx.globalAlpha *= 0.3;
      fillEll(ctx, sx, G.sy(this.base) + 3, 22, 6, b.bad ? '#ff8f5a' : '#ffffff');
      ctx.restore();
      this.bone(ctx, sx, sy, b.r, b.bad, G.t);
      ctx.restore();
    });
    this.shots.forEach(sh => {
      const sx = G.sx(sh.x), sy = G.sy(sh.y);
      ctx.save(); ctx.globalAlpha = .55;
      circle(ctx, sx, sy, 17, '#ffffff'); ctx.restore();
      this.bone(ctx, sx, sy, sh.t * 22, false, G.t);
    });
    this.hud(G);
  },

  /** the two of them, standing their ground until they are not */
  drawBosses(G) {
    const ctx = G.ctx;
    const gy = G.sy(this.base);
    const shake = i => this.hitT[i] > 0 ? Math.sin(this.hitT[i] * 60) * this.hitT[i] * 22 : 0;
    const down0 = this.hp[0] <= 0, down1 = this.hp[1] <= 0;
    /* the vet, on the left, facing right */
    ctx.save();
    ctx.translate(G.sx(this.vetX) + shake(0), gy);
    ctx.scale(-1, 1);
    drawVet(ctx, 0, 0, 1.22, G.t, G.t * 12, 0, {
      still: true, mouth: down0 ? 0.2 : 0.6, cross: !down0,
      lean: down0 ? 0.5 : Math.sin(G.t * 2) * 0.03
    });
    ctx.restore();
    /* the groomer, on the right, facing left */
    ctx.save();
    ctx.translate(G.sx(this.groX) + shake(1), gy);
    drawGroomer(ctx, 0, 0, 1.2, G.t, G.t * 12 + 1.7, 0, {
      still: true, mouth: down1 ? 0.2 : 0.6, cross: !down1,
      lean: down1 ? -0.5 : Math.sin(G.t * 2 + 1) * 0.03
    });
    ctx.restore();
    /* their health, over their heads */
    this.hpBar(G, G.sx(this.vetX), gy - 214, this.hp[0], 'Veterinarė', '#5fa8c4');
    this.hpBar(G, G.sx(this.groX), gy - 210, this.hp[1], 'Kirpėjas', '#e0748c');
    /* and the dizzy stars of one that is finished */
    [down0 ? G.sx(this.vetX) : 0, down1 ? G.sx(this.groX) : 0].forEach(x => {
      if (!x) return;
      ctx.save(); ctx.globalAlpha = .9;
      for (let i = 0; i < 4; i++) {
        const a = G.t * 3 + i * 1.6;
        circle(ctx, x + Math.cos(a) * 30, gy - 200 + Math.sin(a) * 12, 5, '#ffd870');
      }
      ctx.restore();
    });
  },

  hpBar(G, x, y, hp, name, col) {
    const ctx = G.ctx, W = 132, H = 13;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText(name, x, y - 8);
    fillRR(ctx, x - W / 2 - 3, y - 3, W + 6, H + 6, 8, 'rgba(14,9,26,.65)');
    fillRR(ctx, x - W / 2, y, W, H, 6, 'rgba(255,255,255,.16)');
    const f = clamp(hp / FIGHT.BOSS_HP, 0, 1);
    if (f > 0) {
      const g = ctx.createLinearGradient(x - W / 2, 0, x + W / 2, 0);
      g.addColorStop(0, col); g.addColorStop(1, '#ffd870');
      fillRR(ctx, x - W / 2, y, W * f, H, 6, '#ffffff');
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
    ctx.fillText(hp + ' / ' + FIGHT.BOSS_HP, x, y + H + 12);
    ctx.restore();
  },

  /** Lota's five lives, and nothing else: the rest of the HUD is off */
  hud(G) {
    const ctx = G.ctx;
    ctx.save();
    ctx.translate(24, 96);
    ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText('LOTA', 0, -12);
    for (let i = 0; i < FIGHT.LIVES; i++) {
      const alive = i < this.lives;
      const pop = alive && this.hurt > 0 && i === this.lives ? 1 : 0;
      ctx.save();
      ctx.translate(i * 30 + 11, 8);
      ctx.globalAlpha = alive ? 1 : 0.24;
      const s = alive ? (1 + Math.sin(G.t * 3 + i) * 0.05 + pop * 0.3) : 0.85;
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.bezierCurveTo(-14, -4, -8, -14, 0, -6);
      ctx.bezierCurveTo(8, -14, 14, -4, 0, 7);
      ctx.fillStyle = alive ? '#ff5f7a' : '#5a4a5e';
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,12,30,.5)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    /* she is on one life: the screen says so */
    if (this.lives === 1 && !this.over) {
      ctx.save();
      ctx.globalAlpha = 0.2 + Math.sin(G.t * 6) * 0.12;
      const v = ctx.createRadialGradient(G.VW / 2, G.VH / 2, G.VH * 0.32, G.VW / 2, G.VH / 2, G.VH);
      v.addColorStop(0, 'rgba(226,69,60,0)'); v.addColorStop(1, 'rgba(226,69,60,.95)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, G.VW, G.VH);
      ctx.restore();
    }
  },

  /** the dogs at the back of the arena. `k` walks them in, `wag` is the tail */
  drawDogs(G, k, wag) {
    const ctx = G.ctx;
    this.dogs.forEach((d, i) => {
      const kk = clamp((k - i * 0.12) / 0.6, 0, 1);
      if (kk <= 0) return;
      const x = lerp(G.sx(d.x) + 520, G.sx(d.x), smooth(kk));
      ctx.save();
      ctx.globalAlpha = 0.88;
      drawBigDog(ctx, x, G.sy(this.base + d.lift), d.s, G.t, d.id, {
        wag: wag, phase: d.phase, face: d.face,
        bark: Math.max(0, Math.sin(G.t * 2.2 + d.phase * 2) - 0.86) * 6
      });
      ctx.restore();
    });
  },

  /** one bone, white or orange */
  bone(ctx, x, y, rot, bad, t) {
    const body = bad ? '#ff9a4a' : '#fff7e2';
    const edge = bad ? '#c2571c' : '#c9a86a';
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.save();
    ctx.globalAlpha = .35 + Math.sin(t * 5) * .12;
    circle(ctx, 0, 0, 26, bad ? '#ff8f5a' : '#ffe8a8');
    ctx.restore();
    ctx.scale(1.25, 1.25);
    ctx.fillStyle = body; ctx.strokeStyle = edge; ctx.lineWidth = 2.4;
    [[-9, -5], [-9, 5], [9, -5], [9, 5]].forEach(q => {
      ctx.beginPath(); ctx.arc(q[0], q[1], 5.4, 0, TAU); ctx.fill(); ctx.stroke();
    });
    rr(ctx, -9, -4.4, 18, 8.8, 4.4); ctx.fill(); ctx.stroke();
    if (bad) {
      /* a cross, so nobody has to work out what orange means */
      line(ctx, -5, -5, 5, 5, '#7a2b12', 2.6);
      line(ctx, 5, -5, -5, 5, '#7a2b12', 2.6);
    }
    ctx.restore();
  },

  /** the card that hands over the two new buttons */
  card(G, k) {
    const ctx = G.ctx, VW = G.VW, VH = G.VH;
    if (k <= 0.01) return;
    const W = Math.min(560, VW - 60), H = 214;
    const x = (VW - W) / 2, y = VH * 0.52;
    ctx.save();
    ctx.globalAlpha = k;
    fillRR(ctx, x, y, W, H, 22, 'rgba(14,9,26,.82)');
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = 'bold 19px sans-serif'; ctx.fillStyle = '#ffd870';
    ctx.fillText('NAUJI MYGTUKAI', x + W / 2, y + 32);
    /* the three keys, drawn as keys */
    const key = (kx, ky, label, sub) => {
      fillRR(ctx, kx - 34, ky, 68, 50, 14, 'rgba(255,255,255,.14)');
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.font = 'bold 26px sans-serif'; ctx.fillStyle = '#fff';
      ctx.fillText(label, kx, ky + 34);
      ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.fillText(sub, kx, ky + 70);
    };
    key(x + W * 0.22, y + 52, '◀', 'kairėn');
    key(x + W * 0.5, y + 52, '▶', 'dešinėn');
    key(x + W * 0.78, y + 52, '▲', 'šuolis');
    /* and the one rule of the fight, with both bones drawn out */
    const by = y + 172;
    this.bone(ctx, x + W * 0.22 - 8, by, 0.3, false, G.t);
    ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('rink — muša bosą', x + W * 0.22 + 22, by + 5);
    this.bone(ctx, x + W * 0.62 - 8, by, -0.3, true, G.t);
    ctx.fillStyle = '#ffc9a8';
    ctx.fillText('venk — atima gyvybę', x + W * 0.62 + 22, by + 5);
    ctx.restore();
  }
};
