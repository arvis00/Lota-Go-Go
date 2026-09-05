'use strict';
/* ---------------------------------------------------------------
   levels.js — the four levels, what unlocks them, and (for the
   three that are not built yet) the picture shown in their place.

   Levels 2, 3 and 4 are deliberately picture-only for now: their
   home page, their key and their whole wardrobe already work, but
   pressing PLAY shows the level's picture instead of running an
   arena. Nothing here needs changing when the arenas land — swap
   `playable: false` for the real start call.
----------------------------------------------------------------*/

/* ---------------------------------------------------------------
   TESTING SWITCH — every level open, no keys needed.

   With this true `Levels.unlocked()` says yes to everything: no
   padlocks in the lobby, no locked buttons, every wardrobe reachable.
   It changes nothing else — the purses, the prices and the finish
   bonuses all still work exactly as they do in a real save.

   Put the progression back by setting it to false. That is the only
   line that has to change; nothing anywhere else knows about it.
----------------------------------------------------------------*/
const UNLOCK_ALL = true;

/* `bonus` is what reaching the finish is worth, and it is the whole reason to
   turn the checkpoints off: `cp` is what a run with them pays, `raw` is what
   the same finish pays when one mistake sends her back to the very start. The
   boss level is not offered the choice — it is always played with them, and it
   pays nothing: the only thing waiting at its finish is the two outfits. */
const LEVELS = [
  { n: 1, name: 'Kelias į Londoną', sub: 'Didysis Lotos nuotykis',
    picks: 'b', playable: true, bonus: { cp: 10, raw: 50 },
    collect: 'Skaniukai — 15 kaulų visoje trasoje.' },

  { n: 2, name: 'Nuo viešbučio iki miško', sub: '2 lygis · žaisliukų medžioklė',
    picks: 't', playable: true, bonus: { cp: 30, raw: 100 },
    collect: 'Žaisliukai — 20 visoje trasoje.' },

  { n: 3, name: 'Nuo debesų iki žvaigždžių', sub: '3 lygis · skaniukai ir žaisliukai',
    picks: 'bt', playable: true, bonus: { cp: 35, raw: 120 },
    collect: 'Skaniukai — 18 trasoje. Žaisliukai — 12, ir visi paslėpti žemiau: '
           + 'kamuoliuką gausi tik nusileidusi pro skylę grindyse.' },

  { n: 4, name: 'Didysis pabėgimas', sub: '4 lygis · boso lygis',
    picks: '', playable: true, choose: false, film: true, bonus: { cp: 0, raw: 0 },
    collect: 'Nieko rinkti nereikia — tik energiją ⚡. Penki ženklai = vienas '
           + 'pagreitis, o pagreitį reikia panaudoti: kas jo nenaudoja, tą pagauna. '
           + 'Paskutinėje arenoje bėgimas baigiasi ir prasideda boso kova: balti kaulai '
           + 'muša bosus, oranžiniai atima gyvybę. Nugalėk — ir abi aprangos tavo.' }
];
const LEVEL_MAP = {};
LEVELS.forEach(l => { LEVEL_MAP[l.n] = l; });

/* ---------------------------------------------------------------
   A *track* is everything the generator needs to lay one level out:
   the places in order, the second routes through them, how many
   things are hidden on it, what those things are, how fast she runs
   and how little breathing room the gaps are allowed to shrink to.

   Level 2 is deliberately the harder one: it starts faster than
   level 1 ever gets, tops out 150 px/s above it, and gives 60 ms
   less reaction time at the tightest.
----------------------------------------------------------------*/
const TRACKS = {
  1: {
    level: 1, seed: 20260827, zones: ZONES, branches: BRANCHES,
    treats: 15, currency: 'b', minRest: 0.46, rest: [0.95, 0.55],
    perZone: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2],          // = 15
    shortcuts: ['yard1', 'park', 'mall', 'airport'],
    phys: PHYS
  },
  2: {
    level: 2, seed: 20260901, zones: ZONES2, branches: BRANCHES2,
    treats: 20, currency: 't', minRest: 0.40, rest: [0.80, 0.42],
    /* seventeen places now: the wreck is three of them — up to her side, in
       through the hole, and out on the broken deck */
    perZone: [1, 1, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],   // = 20
    shortcuts: [],
    phys: { V_MIN: 400, V_MAX: 880, X_FULL: 104000 }
  },
  3: {
    /* The hardest and the fastest of the three: it opens at 460 px/s — faster
       than level 2 ever runs at its very end — tops out at 1010, and at the
       tightest leaves 0.36 s to read what is coming instead of 0.40.

       `treats` is what lies on the track itself; `toys` is the twelve balls,
       and not one of them is on the main route — they are all down the three
       holes in the floor and in the bunker under the third one. */
    level: 3, seed: 20260905, zones: ZONES3, branches: BRANCHES3,
    treats: 18, toys: 12, currency: 'b', minRest: 0.36, rest: [0.74, 0.38],
    perZone: [1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1],            // = 18
    shortcuts: [],
    phys: { V_MIN: 460, V_MAX: 1010, X_FULL: 116000 }
  },
  4: {
    /* The boss level, and it is the longest, the fastest and the hardest of
       the four by a clear margin: it opens at 520 px/s — faster than level 3
       has ever run by its own finish line — tops out at 1180, and at the
       tightest leaves 0.33 s to read what is coming instead of 0.36.

       `boss` is what turns the rest of it on. Nothing here is collected for a
       purse: `treats` is the energy lying about the five arenas, and every
       symbol of it goes into the burst of speed that keeps whoever is behind
       her behind her. There are no second routes and nothing to find. */
    level: 4, seed: 20260906, zones: ZONES4, branches: BRANCHES4, boss: true,
    treats: 84, currency: 'e', minRest: 0.33, rest: [0.70, 0.35], landRest: 0.26,
    perZone: [3, 11, 32, 17, 21],                                   // = 84
    shortcuts: [],
    phys: { V_MIN: 520, V_MAX: 1180, X_FULL: 200000 }
  }
};

/** the treat, drawn free of the engine so the pictures can use it too */
function boneIcon(ctx, x, y, s, t) {
  s = s || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * 4) * .12;
  circle(ctx, 0, 0, 20, '#ffe8a8'); ctx.restore();
  ctx.rotate(-0.25);
  ctx.fillStyle = '#fff7e2'; ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2.4;
  [[-9, -5], [-9, 5], [9, -5], [9, 5]].forEach(q => { ctx.beginPath(); ctx.arc(q[0], q[1], 5.4, 0, TAU); ctx.fill(); ctx.stroke(); });
  rr(ctx, -9, -4.4, 18, 8.8, 4.4); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.globalAlpha = .8; circle(ctx, -6, -5, 1.8, '#fff'); ctx.restore();
  ctx.restore();
}

const Levels = {
  get(n) { return LEVEL_MAP[n] || LEVELS[0]; },

  /** the track a level runs on, or null while it is still a picture */
  track(n) { return TRACKS[n] || null; },

  /* -------------------------------------------------------------
     Checkpoints, and what turning them off is worth.

     Every level except the boss is played one of two ways, chosen once
     and then remembered. With the flags on, a crash sends her back to
     the start of the place she is in. With them off, a crash is the end
     of the run — and the finish pays several times as much.
  --------------------------------------------------------------*/
  /** is this level's mode the player's to pick? the boss's is not */
  chooses(n) { return this.get(n).choose !== false; },
  /** how it is being played: 'cp', 'raw', or null if never asked */
  mode(n) { return this.chooses(n) ? Save.mode(n) : 'cp'; },
  /** what crossing the finish line is worth, the way it is being played */
  bonus(n, mode) {
    const b = this.get(n).bonus || { cp: 0, raw: 0 };
    return b[mode === 'raw' ? 'raw' : 'cp'] || 0;
  },
  /** the name of a mode, for buttons and badges */
  modeName(mode) { return mode === 'raw' ? 'Be kontrolinių taškų' : 'Su kontroliniais taškais'; },
  modeShort(mode) { return mode === 'raw' ? 'BE K.T.' : 'SU K.T.'; },

  /** The outfits sold on level n's home page (level 4 sells nothing), always
      cheapest first — the shelf is a ladder, and it should look like one
      however the costumes happen to sit in the SKINS array. */
  shop(n) {
    const price = s => (s.cost.b || 0) + (s.cost.t || 0);
    return SKINS.filter(s => (s.level || 1) === n && s.cost).sort((a, b) => price(a) - price(b));
  },
  /** what beating the boss hands over */
  prize(n) { return SKINS.filter(s => (s.level || 1) === n && !s.cost && s.draw); },

  /** every outfit on that shelf bought — half of the key to the next level */
  allOwned(n) { return this.shop(n).every(s => Save.owns(s.id)); },

  /** level 1 is always open; every later one needs the previous level's whole
      wardrobe bought AND that level finished at least once with the flags
      switched off. Finishing it with checkpoints is worth treats, not a key:
      the way on is earned by running it clean from the start line. */
  unlocked(n) {
    if (UNLOCK_ALL || n <= 1) return true;
    const p = n - 1;
    return Save.rawClears(p) > 0 && this.allOwned(p);
  },

  /** what is still missing, for the padlock caption */
  blockedBy(n) {
    if (this.unlocked(n)) return null;
    const p = n - 1, need = [];
    if (Save.rawClears(p) < 1)
      need.push(Save.clears(p) > 0
        ? 'pereiti ' + p + ' lygį BE kontrolinių taškų'
        : 'pereiti ' + p + ' lygį be kontrolinių taškų');
    const left = this.shop(p).filter(s => !Save.owns(s.id)).length;
    if (left) need.push('atrakinti visas ' + p + ' lygio aprangas (liko ' + left + ')');
    return need.join(' ir ');
  },

  /** hand over the boss prize; returns the outfits that were new */
  award(n) {
    const got = [];
    this.prize(n).forEach(s => { if (Save.give(s.id)) got.push(s); });
    return got;
  },

  /* -------------------------------------------------------------
     The pictures. One per level, drawn the same way as everything
     else in this game — no image files anywhere.
  --------------------------------------------------------------*/
  picture(n, ctx, W, H, t) {
    if (n === 2) return this.picToys(ctx, W, H, t);
    if (n === 3) return this.picFestival(ctx, W, H, t);
    if (n === 4) return this.picBoss(ctx, W, H, t);
    return this.picToys(ctx, W, H, t);
  },

  /** The energy the boss level is littered with, drawn free of the engine so
      the track, the HUD and the picture can all use the same symbol. */
  energyIcon(ctx, x, y, s, t) {
    s = s || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 5) * .16;
    circle(ctx, 0, 0, 23, '#8fe8ff'); ctx.restore();
    circle(ctx, 0, 0, 15, '#2f5f8c');
    ctx.save(); ctx.globalAlpha = .9;
    circle(ctx, 0, 0, 12.5, '#8fe8ff'); ctx.restore();
    poly(ctx, [[2.5, -11], [-6.5, 1.5], [-0.5, 1.5], [-3, 11], [6.5, -2], [0.5, -2]], '#fffbe8');
    ctx.strokeStyle = 'rgba(24,40,64,.55)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .7;
    fillEll(ctx, -5, -6, 4, 2.4, '#ffffff', -0.6); ctx.restore();
    ctx.restore();
  },

  /* ---- level 2: a sunny yard buried in dog toys ---- */
  picToys(ctx, W, H, t) {
    const floor = H * 0.62;
    BG.sky(ctx, W, H, '#8fd8f0', '#cdeeff', '#e8f7d8');
    BG.sun(ctx, W, H, W * 0.82, H * 0.16, 30, '#fff0a8');
    BG.clouds(ctx, W, H, t * 9, t, 'rgba(255,255,255,.7)', H * 0.12, 0.9);
    BG.hills(ctx, W, H, 0, floor - 26, '#8fca6a', 26, 300);

    /* garden fence */
    ctx.save(); ctx.globalAlpha = .95;
    for (let x = -10; x < W + 20; x += 26) {
      fillRR(ctx, x, floor - 74, 15, 62, 3, '#e8dcc0');
      poly(ctx, [[x, floor - 74], [x + 7.5, floor - 84], [x + 15, floor - 74]], '#f2e8d0');
    }
    fillRR(ctx, -10, floor - 62, W + 30, 7, 2, '#d8c9a8');
    fillRR(ctx, -10, floor - 40, W + 30, 7, 2, '#d8c9a8');
    ctx.restore();

    /* grass */
    ctx.fillStyle = '#77bc55'; ctx.fillRect(0, floor, W, H - floor);
    ctx.save(); ctx.globalAlpha = .5;
    for (let i = 0; i < 90; i++) {
      const r = makeRng(i * 29 + 7);
      const gx = r() * W, gy = floor + 6 + r() * (H - floor - 8);
      line(ctx, gx, gy, gx + 3, gy - 8, '#a8dd7a', 2);
    }
    ctx.restore();

    /* the toys, big and obviously the point of the level */
    this.toyBall(ctx, W * 0.14, floor + 22, 30, t, 0);
    this.toyBall(ctx, W * 0.86, floor + 40, 24, t, 1.7);
    this.toyRope(ctx, W * 0.30, floor + 52, 1.15, -0.12);
    this.toyRope(ctx, W * 0.72, floor + 16, 0.85, 0.2);
    this.toyBone(ctx, W * 0.60, floor + 58, 1.25, 0.1);
    this.toyTeddy(ctx, W * 0.22, floor + 58, 1.1, t);
    this.toyBall(ctx, W * 0.70, floor + 66, 17, t, 3.1);

    /* a few more raining down, to say there are a lot of them */
    for (let i = 0; i < 6; i++) {
      const r = makeRng(i * 71 + 11);
      const ph = ((t * 0.32) + r()) % 1;
      const x = 60 + r() * (W - 120), y = -40 + ph * (floor - 30);
      ctx.save(); ctx.globalAlpha = 0.85; ctx.translate(x, y); ctx.rotate(ph * 5 + i);
      if (i % 2) this.toyBall(ctx, 0, 0, 13, t, i); else this.toyBone(ctx, 0, 0, 0.7, 0);
      ctx.restore();
    }

    /* Lota, mid-leap over a ball */
    drawLota(ctx, W * 0.45, floor + 34 - 46 - Math.abs(Math.sin(t * 1.6)) * 26, {
      state: 'jump', t: t, run: t * 9, skin: Save.data.skin, scale: 1.35, face: 'happy'
    });
  },

  toyBall(ctx, x, y, r, t, ph) {
    ctx.save(); ctx.translate(x, y - Math.abs(Math.sin(t * 2 + (ph || 0))) * 3);
    ctx.save(); ctx.globalAlpha = .22; fillEll(ctx, 2, r * 0.95, r * 0.9, r * 0.24, '#000'); ctx.restore();
    circle(ctx, 0, 0, r, '#ff6b7a');
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
    ctx.fillStyle = '#4fc3ea';
    ctx.beginPath(); ctx.moveTo(-r, -r * .1);
    ctx.quadraticCurveTo(0, -r * .7, r, -r * .1);
    ctx.lineTo(r, r * .35); ctx.quadraticCurveTo(0, -r * .18, -r, r * .35);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .45; fillEll(ctx, -r * .35, -r * .4, r * .28, r * .18, '#fff', -0.5); ctx.restore();
    ctx.strokeStyle = 'rgba(40,20,30,.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
    ctx.restore();
  },
  toyRope(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .2; fillEll(ctx, 0, 12, 34, 6, '#000'); ctx.restore();
    /* frayed ends first, so the rope lies on top of them */
    [-1, 1].forEach(d => {
      for (let k = -3; k <= 3; k++)
        line(ctx, d * 22, k * 0.8, d * 44, k * 6, k % 2 ? '#f2e4c0' : '#dcc79c', 3);
    });
    ctx.strokeStyle = '#e8d6a8'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(0, -8, 26, 0); ctx.stroke();
    /* the twist */
    ctx.strokeStyle = '#c9b184'; ctx.lineWidth = 2.4;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * 7 - 3, -6); ctx.quadraticCurveTo(i * 7, 0, i * 7 + 4, 5); ctx.stroke();
    }
    /* a knot at each end */
    [-1, 1].forEach(d => {
      fillEll(ctx, d * 21, d > 0 ? -1 : -1, 8, 8.5, '#dcc79c');
      ctx.save(); ctx.globalAlpha = .4;
      line(ctx, d * 17, -5, d * 25, 4, '#a8916a', 2); ctx.restore();
    });
    ctx.restore();
  },
  toyBone(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .2; fillEll(ctx, 0, 13, 26, 5, '#000'); ctx.restore();
    ctx.fillStyle = '#8fdd8f'; ctx.strokeStyle = '#4f9c5a'; ctx.lineWidth = 2.4;
    [[-17, -6], [-17, 6], [17, -6], [17, 6]].forEach(p => {
      ctx.beginPath(); ctx.arc(p[0], p[1], 8, 0, TAU); ctx.fill(); ctx.stroke();
    });
    rr(ctx, -17, -6, 34, 12, 6); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5; fillEll(ctx, -8, -4, 6, 2.4, '#e8ffe8'); ctx.restore();
    ctx.restore();
  },
  toyTeddy(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.3) * 0.05);
    ctx.save(); ctx.globalAlpha = .2; fillEll(ctx, 0, 24, 22, 5, '#000'); ctx.restore();
    circle(ctx, -13, -18, 7, '#c98f5a'); circle(ctx, 13, -18, 7, '#c98f5a');
    fillEll(ctx, 0, 6, 17, 18, '#e0a86a');
    circle(ctx, 0, -14, 14, '#e0a86a');
    circle(ctx, -13, -18, 4, '#f2cfa8'); circle(ctx, 13, -18, 4, '#f2cfa8');
    fillEll(ctx, 0, -9, 7, 5.5, '#f2cfa8');
    circle(ctx, 0, -11, 2.6, '#4a2f1c');
    circle(ctx, -5, -17, 2, '#3a2314'); circle(ctx, 5, -17, 2, '#3a2314');
    line(ctx, -6, -6, 6, -6, '#b07a4a', 1.6);
    fillRR(ctx, -22, -2, 11, 18, 5, '#c98f5a');
    fillRR(ctx, 11, -2, 11, 18, 5, '#c98f5a');
    fillRR(ctx, -12, 18, 11, 10, 5, '#c98f5a');
    fillRR(ctx, 1, 18, 11, 10, 5, '#c98f5a');
    /* the ribbon round its neck */
    ctx.save(); ctx.translate(0, -1);
    poly(ctx, [[-1, 0], [-9, -5], [-9, 5]], '#ff6b9a');
    poly(ctx, [[1, 0], [9, -5], [9, 5]], '#ff6b9a');
    circle(ctx, 0, 0, 2.4, '#ff8fb8');
    ctx.restore();
    ctx.restore();
  },

  /* ---- level 3: a lantern-lit festival where both currencies drop ---- */
  picFestival(ctx, W, H, t) {
    const floor = H * 0.60;
    BG.sky(ctx, W, H, '#2b1f5c', '#6b3f8c', '#e08a6a');
    BG.sun(ctx, W, H, W * 0.2, H * 0.3, 34, '#ffcf8a');
    for (let i = 0; i < 40; i++) {
      const r = makeRng(i * 61 + 5);
      ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 2 + i) * .3;
      circle(ctx, r() * W, r() * H * 0.45, 1.7, '#fff6d8'); ctx.restore();
    }
    BG.buildings(ctx, W, H, 0, floor - 10, ['#3f2f6a', '#4a3578', '#332757'], '#ffd870', 120, 210, 170, true);

    /* bunting and lanterns strung across the sky */
    for (let row = 0; row < 2; row++) {
      const y0 = H * (0.14 + row * 0.11);
      ctx.beginPath(); ctx.moveTo(-20, y0);
      ctx.quadraticCurveTo(W / 2, y0 + 52, W + 20, y0);
      ctx.strokeStyle = 'rgba(255,230,180,.5)'; ctx.lineWidth = 2; ctx.stroke();
      for (let i = 0; i <= 12; i++) {
        const k = i / 12, x = -20 + k * (W + 40);
        const y = y0 + 52 * 2 * k * (1 - k) + Math.sin(t * 1.6 + i) * 2;
        const col = ['#ff8f6a', '#ffd870', '#8fe8c8', '#8fbcff', '#e8a8ff'][(i + row) % 5];
        ctx.save(); ctx.globalAlpha = .35;
        circle(ctx, x, y + 12, 16, col); ctx.restore();
        fillRR(ctx, x - 7, y + 4, 14, 17, 6, col);
        fillRR(ctx, x - 4, y + 1, 8, 4, 2, '#c9962c');
        ctx.save(); ctx.globalAlpha = .55; fillEll(ctx, x - 2.5, y + 9, 2.4, 4, '#fff6d8'); ctx.restore();
      }
    }

    /* the plaza floor */
    ctx.fillStyle = '#4a3a66'; ctx.fillRect(0, floor, W, H - floor);
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = -6; i <= 12; i++) {
      const x = W * 0.5 + (i * 90);
      line(ctx, x, floor, x + (x - W * 0.5) * 0.55, H, '#7a63a0', 2);
    }
    for (let y = floor + 14; y < H; y += 22) line(ctx, 0, y, W, y, '#7a63a0', 1.6);
    ctx.restore();

    /* two pedestals: treats on one, toys on the other */
    const ped = (x, label) => {
      fillRR(ctx, x - 34, floor - 8, 68, 26, 6, '#6a568e');
      fillRR(ctx, x - 40, floor - 14, 80, 10, 5, '#8a72b0');
      ctx.save(); ctx.globalAlpha = .3;
      const g = ctx.createRadialGradient(x, floor - 60, 4, x, floor - 60, 70);
      g.addColorStop(0, label === 'b' ? '#fff6d8' : '#8fe8ff'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 70, floor - 130, 140, 140); ctx.restore();
    };
    ped(W * 0.2, 'b'); ped(W * 0.8, 't');
    ctx.save(); ctx.translate(W * 0.2, floor - 46 - Math.sin(t * 2) * 5); ctx.rotate(Math.sin(t) * 0.15);
    boneIcon(ctx, 0, 0, 1.5, t); ctx.restore();
    this.toyBall(ctx, W * 0.8, floor - 46 - Math.sin(t * 2 + 1) * 5, 20, t, 0.5);

    /* both currencies drifting through the air — the point of level 3 */
    for (let i = 0; i < 10; i++) {
      const r = makeRng(i * 83 + 17);
      const ph = ((t * 0.22) + r()) % 1;
      const x = 40 + r() * (W - 80), y = floor - 20 - ph * (floor - 40);
      ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
      ctx.translate(x + Math.sin(ph * 6 + i) * 14, y);
      if (i % 2) { ctx.rotate(ph * 3); boneIcon(ctx, 0, 0, 0.8, t); }
      else this.toyBall(ctx, 0, 0, 11, t, i);
      ctx.restore();
    }

    drawLota(ctx, W * 0.5, floor + 46, {
      state: 'sit', t: t, skin: Save.data.skin, scale: 1.5, face: 'happy',
      paw: ((t * 0.5) % 4) > 2.4, tilt: Math.sin(t * 0.8) * 0.12
    });
  },

  /* ---- level 4: the boss ---- */
  /* ---- level 4: the great escape ----
     The arena is built, so nothing in the game reaches this any more — it is
     what the page would show if the boss were ever put back behind a picture,
     and it says the same thing the level does: she is out, they are behind
     her, and the only thing on the road is energy. */
  picBoss(ctx, W, H, t) {
    const floor = H * 0.72;
    BG.sky(ctx, W, H, '#5f6f92', '#8fa0bc', '#c8cfd8');
    BG.clouds(ctx, W, H, t * 7, t, 'rgba(226,232,242,.85)', H * 0.1, 1.2);
    BG.buildings(ctx, W, H, 0, floor - 96, ['#4a5570', '#56617c', '#3f4a63'],
      '#ffe08a', 130, 230, 175, true);

    /* the road */
    ctx.fillStyle = '#767e8c'; ctx.fillRect(0, floor, W, H - floor);
    fillRR(ctx, 0, floor, W, 11, 0, '#a8b0bc');
    ctx.save(); ctx.globalAlpha = .4;
    for (let x = -40; x < W + 40; x += 88) line(ctx, x, floor + 12, x - 30, H, '#5f6674', 2.4);
    ctx.restore();

    /* the dark of them coming up behind her */
    ctx.save(); ctx.globalAlpha = .55;
    const g = ctx.createLinearGradient(0, 0, W * 0.5, 0);
    g.addColorStop(0, 'rgba(12,8,22,.95)'); g.addColorStop(1, 'rgba(12,8,22,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W * 0.5, H);
    ctx.restore();
    drawVet(ctx, W * 0.12, floor + 16, 1.25, t, t * 12, 0.6);
    drawGroomer(ctx, W * 0.02, floor + 12, 1.12, t, t * 12 + 1.7, 0.4);

    /* everything they have thrown at her, still in the air */
    const tools = ['needleTool', 'nailClipper', 'vetScissors', 'combTool', 'clipperTool'];
    for (let i = 0; i < 5; i++) {
      const r = makeRng(i * 47 + 11);
      const ph = ((t * 0.5) + r()) % 1;
      const s = propSize(tools[i]);
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.translate(W * (0.18 + ph * 0.72), H * (0.16 + r() * 0.2) + Math.sin(ph * Math.PI) * -60);
      ctx.rotate(ph * 9 + i);
      drawProp(ctx, tools[i], -s[0] / 2, -s[1] / 2, s[0], s[1], t, {}, i);
      ctx.restore();
    }

    /* the energy, strung out down the road in front of her */
    for (let i = 0; i < 5; i++)
      this.energyIcon(ctx, W * (0.62 + i * 0.09), floor - 74 + Math.sin(t * 3 + i) * 7, 1.15, t);

    /* Lota, flat out, and enjoying it more than she should */
    drawLota(ctx, W * 0.46, floor + 14, {
      state: 'run', t: t, run: t * 15, skin: Save.data.skin, scale: 1.35, face: 'happy'
    });
  }
};
