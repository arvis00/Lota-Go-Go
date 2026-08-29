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

const LEVELS = [
  { n: 1, name: 'Kelias į Londoną', sub: 'Didysis Lotos nuotykis',
    picks: 'b', playable: true,
    collect: 'Skaniukai — 15 kaulų visoje trasoje.' },

  { n: 2, name: 'Nuo viešbučio iki miško', sub: '2 lygis · žaisliukų medžioklė',
    picks: 't', playable: true,
    collect: 'Žaisliukai — 20 visoje trasoje.' },

  { n: 3, name: 'Šviesų šventė', sub: '3 lygis · skaniukai ir žaisliukai',
    picks: 'bt', playable: false,
    collect: 'Renkami ir skaniukai, ir žaisliukai — aprangoms reikia abiejų.' },

  { n: 4, name: 'Bosas: Didysis Siurblys', sub: '4 lygis · boso kova',
    picks: '', playable: false,
    collect: 'Nieko rinkti nereikia. Nugalėk bosą — abi aprangos tavo.' }
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
    perZone: [1, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 1, 1, 2, 1],    // = 20
    shortcuts: [],
    phys: { V_MIN: 400, V_MAX: 880, X_FULL: 96000 }
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

  /** the outfits sold on level n's home page (level 4 sells nothing) */
  shop(n) { return SKINS.filter(s => (s.level || 1) === n && s.cost); },
  /** what beating the boss hands over */
  prize(n) { return SKINS.filter(s => (s.level || 1) === n && !s.cost && s.draw); },

  /** every outfit on that shelf bought — half of the key to the next level */
  allOwned(n) { return this.shop(n).every(s => Save.owns(s.id)); },

  /** level 1 is always open; every later one needs the previous level
      finished at least once AND its whole wardrobe unlocked */
  unlocked(n) {
    if (n <= 1) return true;
    const p = n - 1;
    return Save.clears(p) > 0 && this.allOwned(p);
  },

  /** what is still missing, for the padlock caption */
  blockedBy(n) {
    if (this.unlocked(n)) return null;
    const p = n - 1, need = [];
    if (Save.clears(p) < 1) need.push('pereiti ' + p + ' lygį');
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
  picBoss(ctx, W, H, t) {
    const floor = H * 0.70;
    BG.sky(ctx, W, H, '#140b26', '#3a1240', '#5c1a30');

    /* lightning behind the boss */
    const bolt = ((t * 0.7) % 1);
    if (bolt > 0.92) {
      ctx.save(); ctx.globalAlpha = (bolt - 0.92) * 8;
      ctx.fillStyle = '#ffd0e8'; ctx.fillRect(0, 0, W, H); ctx.restore();
    }

    /* dust cyclone it rides on */
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const k = i / 6;
      ctx.globalAlpha = .16 + k * .12;
      fillEll(ctx, W * 0.62 + Math.sin(t * 2 + i) * 10, floor - 10 - k * 130,
        20 + k * 108, 12 + k * 22, '#6a4a7a');
    }
    ctx.restore();

    /* THE GREAT VACUUM — body, hose, wheels, one furious eye */
    const bx = W * 0.62, by = floor - 148 + Math.sin(t * 1.7) * 8;
    ctx.save(); ctx.translate(bx, by);
    ctx.save(); ctx.globalAlpha = .3;
    fillEll(ctx, 0, 128, 120, 18, '#000'); ctx.restore();
    /* hose, whipping */
    ctx.beginPath();
    ctx.moveTo(-96, 20);
    ctx.quadraticCurveTo(-190 + Math.sin(t * 2.4) * 24, -30 + Math.sin(t * 2) * 30, -250, 70 + Math.sin(t * 2.4) * 24);
    ctx.strokeStyle = '#3a2b4a'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#55405f'; ctx.lineWidth = 20; ctx.stroke();
    ctx.save(); ctx.globalAlpha = .4; ctx.strokeStyle = '#8f6fa0'; ctx.lineWidth = 3;
    for (let i = 1; i < 9; i++) {
      const k = i / 9;
      const px = -96 + (-250 + 96) * k, py = 20 + Math.sin(t * 2.4 + k * 3) * 26 + k * 40;
      line(ctx, px, py - 12, px, py + 12, '#8f6fa0', 3);
    }
    ctx.restore();
    /* the nozzle, gaping */
    ctx.save(); ctx.translate(-256, 74); ctx.rotate(-0.5 + Math.sin(t * 2.4) * 0.16);
    poly(ctx, [[0, -22], [0, 22], [-42, 44], [-42, -44]], '#241a30');
    ctx.save(); ctx.globalAlpha = .5;
    fillEll(ctx, -42, 0, 9, 44, '#ff5f8a'); ctx.restore();
    ctx.restore();
    /* body */
    fillRR(ctx, -100, -60, 200, 150, 42, '#5c3f6e');
    fillRR(ctx, -100, -60, 200, 150, 42, 'rgba(255,255,255,0)');
    ctx.strokeStyle = '#2b1c38'; ctx.lineWidth = 5; rr(ctx, -100, -60, 200, 150, 42); ctx.stroke();
    ctx.save(); ctx.globalAlpha = .3; fillRR(ctx, -84, -48, 60, 40, 20, '#c8a8e0'); ctx.restore();
    fillRR(ctx, -70, 40, 140, 34, 14, '#3a2b4a');
    ctx.save(); ctx.globalAlpha = .55;
    for (let i = -3; i <= 3; i++) fillRR(ctx, i * 18 - 5, 46, 10, 22, 4, '#160f22');
    ctx.restore();
    /* the eye */
    const glow = 0.6 + Math.sin(t * 4) * 0.3;
    ctx.save(); ctx.globalAlpha = glow * .5;
    circle(ctx, 12, -6, 62, '#ff2f5a'); ctx.restore();
    circle(ctx, 12, -6, 34, '#f2e8f8');
    circle(ctx, 12 + Math.sin(t * 1.3) * 7, -6, 18, '#e8203f');
    circle(ctx, 12 + Math.sin(t * 1.3) * 7, -6, 8, '#2b0810');
    ctx.save(); ctx.globalAlpha = .8; circle(ctx, 4, -16, 6, '#fff'); ctx.restore();
    /* angry brow */
    ctx.save(); ctx.lineCap = 'round';
    line(ctx, -22, -40, 40, -22, '#2b1c38', 9); ctx.restore();
    /* wheels */
    circle(ctx, -58, 92, 24, '#241a30'); circle(ctx, 58, 92, 24, '#241a30');
    circle(ctx, -58, 92, 10, '#6a4f7a'); circle(ctx, 58, 92, 10, '#6a4f7a');
    ctx.restore();

    /* arena floor */
    ctx.fillStyle = '#2b1c38'; ctx.fillRect(0, floor, W, H - floor);
    ctx.save(); ctx.globalAlpha = .5;
    for (let x = -40; x < W + 40; x += 64) line(ctx, x, floor, x - 40, H, '#42304f', 2);
    ctx.restore();
    fillRR(ctx, 0, floor - 6, W, 10, 0, '#6a4f7a');

    /* the prize, hanging in the air above her — the reason to come here */
    const px = W * 0.17, py = H * 0.26 + Math.sin(t * 1.4) * 8;
    ctx.save(); ctx.translate(px, py);
    ctx.save(); ctx.globalAlpha = .3;
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 96);
    g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-96, -96, 192, 192); ctx.restore();
    for (let i = 0; i < 7; i++) {
      const a = t * 0.8 + i * (TAU / 7);
      ctx.save(); ctx.globalAlpha = .8;
      fillEll(ctx, Math.cos(a) * 44, Math.sin(a) * 30, 9, 5, 'hsla(' + ((i * 51 + t * 46) % 360) + ',92%,70%,1)', a);
      ctx.restore();
    }
    sparkle(ctx, 12, t, 0, 4, 58, 46, 3);
    /* a disc of light for her to sit on, so the prize is on display */
    ctx.save(); ctx.globalAlpha = .85;
    fillEll(ctx, 0, 52, 52, 11, rainbowLin(ctx, -52, 52, 52, 52, t, .9));
    ctx.globalAlpha = .35; fillEll(ctx, 0, 52, 68, 15, '#fff');
    ctx.restore();
    drawLota(ctx, 4, 48, { state: 'sit', t: t, skin: 'rainbow', scale: 1.02, face: 'happy',
      shadow: false, tilt: Math.sin(t * 0.9) * 0.1 });
    ctx.restore();

    /* Lota herself, small and brave, facing it */
    drawLota(ctx, W * 0.20, floor + 14, {
      state: 'run', t: t, run: t * 11, skin: Save.data.skin, scale: 1.2, face: 'wow'
    });
  }
};
