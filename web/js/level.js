'use strict';
/* ---------------------------------------------------------------
   level.js — builds ONE long fixed track with ONE finish line.
   Everything is laid out in *time* (seconds of travel at the local
   speed) instead of pixels, so the run stays fair as Lota speeds up.
----------------------------------------------------------------*/
const PHYS = {
  GRAV: 2650,
  JUMP_V: 1000,
  V_MIN: 330,
  V_MAX: 730,
  X_FULL: 86000,      // distance over which the speed ramp completes
  get AIRTIME() { return (2 * this.JUMP_V) / this.GRAV; },   // 0.755 s
  get APEX()    { return (this.JUMP_V * this.JUMP_V) / (2 * this.GRAV); } // 188 px
};
function speedAt(x) {
  return PHYS.V_MIN + (PHYS.V_MAX - PHYS.V_MIN) * Math.pow(clamp(x / PHYS.X_FULL, 0, 1), 0.85);
}
/* how far she flies in one jump at this point of the track */
function reachAt(x) { return speedAt(x) * PHYS.AIRTIME; }

const MAX_STEP_H = 112;   // highest solid wall she must clear (apex is 188)
const LEDGE_TOP  = 122;   // one-way shelf height
const LEDGE_CLEAR = 80;   // free space underneath (she is 62 tall)
const DUCK_BOTTOM = 46;   // overhead hazards start here (duck box is 30 tall)

/* An object must have exactly one meaning: either Lota can hit it, or it is
   scenery. Sharing an id between the two makes the track unreadable. */
function assertPropRoles() {
  const hits = new Set();
  ZONES.forEach(z => ['hurdle', 'over', 'tunnel', 'ledge', 'step', 'gap']
    .forEach(k => (z.pools[k] || []).forEach(p => hits.add(p))));
  const clash = [];
  ZONES.forEach(z => (z.pools.deco || []).forEach(p => { if (hits.has(p)) clash.push(z.id + ':' + p); }));
  if (clash.length) console.error('Lota Go: prop is both scenery and hazard — ' + clash.join(', '));
}

function buildWorld() {
  assertPropRoles();
  const rng = makeRng(20260827);
  const W = {
    ground: [], platforms: [], hazards: [], bones: [], deco: [], warps: [], zones: [],
    finishX: 0, totalX: 0
  };
  const anchors = [];
  let x = 0, segStart = 0, pendingWarp = null;

  const speed = () => speedAt(x);
  const dx = sec => speed() * sec;

  function closeGround(untilX) {
    if (untilX > segStart + 4) W.ground.push({ x: segStart, w: untilX - segStart, y: 0 });
  }
  function openGround(fromX) { segStart = fromX; }

  function hz(zone, prop, gx, gy, gw, gh, kind) {
    W.hazards.push({ x: gx, y: gy, w: gw, h: gh, prop: prop, zone: zone.index, kind: kind || 'hurdle' });
  }
  function anchor(gx, gy, kind, special) {
    anchors.push({ x: gx, y: gy, kind: kind, special: !!special, zone: curZone.index });
  }
  function takeBone(a) { a.taken = 1; W.bones.push({ x: a.x, y: a.y, kind: a.kind, zone: a.zone }); }
  function decorate(zone, count) {
    for (let i = 0; i < count; i++) {
      if (!zone.pools.deco.length) return;
      const p = rng.pick(zone.pools.deco);
      /* scenery is always a flat decal on the floor — never tall enough to be
         mistaken for something that has to be jumped */
      W.deco.push({ x: x + rng.range(10, dx(0.5)), y: 0, prop: p,
                    w: rng.range(52, 104), h: rng.range(9, 15), zone: zone.index, flat: true });
    }
  }

  let curZone = ZONES[0];

  /* ---------- primitive patterns ---------- */
  const P = {
    flat(sec) {
      const d = dx(sec);
      x += d;
      if (pendingWarp && x - pendingWarp.fromX > pendingWarp.minSkip) {
        pendingWarp.trigger.toX = x - dx(0.35);
        pendingWarp.trigger.toY = 0;
        pendingWarp = null;
      }
    },

    hurdle(z, dbl) {
      const h = rng.range(42, 42 + 18 * (0.4 + z.diff));
      const w = rng.range(46, 70);
      hz(z, rng.pick(z.pools.hurdle), x, 0, w, Math.min(h, 58));
      anchor(x + w / 2, h + 66, 'jump', false);
      x += w;
      if (dbl) {
        const g2 = rng.range(18, 34), w2 = rng.range(40, 58);
        hz(z, rng.pick(z.pools.hurdle), x + g2, 0, w2, Math.min(h * 0.9, 52));
        x += g2 + w2;
      }
    },

    over(z) {
      const w = rng.range(66, 120);
      hz(z, rng.pick(z.pools.over), x, DUCK_BOTTOM, w, 84, 'over');
      anchor(x + w / 2, 8, 'duck', false);
      x += w;
    },

    tunnel(z) {
      const w = dx(rng.range(0.55, 0.95));
      hz(z, rng.pick(z.pools.tunnel), x, DUCK_BOTTOM, w, 92, 'over');
      anchor(x + w * 0.5, 8, 'duck', true);
      x += w;
    },

    gap(z) {
      const g = reachAt(x) * rng.range(0.34, 0.45);
      closeGround(x);
      W.deco.push({ x: x, y: 0, prop: rng.pick(z.pools.gap), w: g, h: 60, zone: z.index, inGap: true });
      anchor(x + g / 2, 130, 'air', true);
      x += g;
      openGround(x);
    },

    step(z) {
      const h = rng.range(70, MAX_STEP_H);
      const len = dx(rng.range(0.55, 1.0));
      W.platforms.push({ x: x, y: h, w: len, oneWay: false, prop: rng.pick(z.pools.step), zone: z.index, h: h });
      anchor(x + len * 0.6, h + 40, 'top', false);
      x += len;
    },

    ledge(z, withBoneUnder) {
      const len = dx(rng.range(0.65, 1.05));
      W.platforms.push({ x: x, y: LEDGE_TOP, w: len, oneWay: true, prop: rng.pick(z.pools.ledge),
                         zone: z.index, h: LEDGE_TOP - LEDGE_CLEAR });
      anchor(x + len * 0.5, LEDGE_TOP + 34, 'ledge', true);
      /* something to dodge on the ground below — taking the shelf skips it */
      const hw = rng.range(46, 62);
      hz(z, rng.pick(z.pools.hurdle), x + len * 0.42, 0, hw, rng.range(46, 58));
      if (withBoneUnder) anchor(x + len * 0.42 + hw / 2, 70, 'jump', false);
      x += len;
    },

    pit(z) {
      const len = dx(rng.range(0.75, 1.15));
      closeGround(x);
      W.platforms.push({ x: x, y: -74, w: len, oneWay: false, base: true, pit: true, zone: z.index, h: 40 });
      anchor(x + len * 0.5, -74 + 40, 'pit', true);
      x += len;
      openGround(x);   // ground resumes as a solid wall she must jump
    },

    shortcut(z) {
      const len = dx(rng.range(0.7, 0.95));
      W.platforms.push({ x: x, y: LEDGE_TOP, w: len, oneWay: true, prop: rng.pick(z.pools.ledge),
                         zone: z.index, h: LEDGE_TOP - LEDGE_CLEAR });
      const trig = { x: x + len - 26, y: LEDGE_TOP, w: 44, h: 60, zone: z.index, toX: 0, toY: 0 };
      W.warps.push(trig);
      W.deco.push({ x: x + len - 34, y: LEDGE_TOP, prop: z.pools.tunnel[0], w: 58, h: 62, zone: z.index, shortcut: true });
      anchor(x + len - 70, LEDGE_TOP + 34, 'shortcut', true);
      const hw = rng.range(48, 64);
      hz(z, rng.pick(z.pools.hurdle), x + len * 0.4, 0, hw, rng.range(46, 58));
      x += len;
      pendingWarp = { trigger: trig, fromX: x, minSkip: dx(1.8) };
    }
  };

  /* ---------- pattern menu per zone ---------- */
  function pickPattern(z, rng, used) {
    const d = z.diff;
    const bag = [];
    const add = (name, w) => { if (w > 0) for (let i = 0; i < Math.round(w * 10); i++) bag.push(name); };
    add('hurdle', 3.2 - d * 0.8);
    add('over', 1.6 + d * 0.5);
    add('double', d * 1.4);
    add('gap', 0.5 + d * 1.1);
    add('step', 0.9 + d * 0.7);
    add('ledge', 1.0 + d * 0.5);
    add('tunnel', 0.35 + d * 0.7);
    add('pit', d * 0.8);
    let name = rng.pick(bag);
    /* never the same heavy pattern twice in a row */
    if (name === used && (name === 'pit' || name === 'tunnel' || name === 'gap')) name = 'hurdle';
    return name;
  }

  /* ---------- walk the whole track ---------- */
  openGround(0);
  ZONES.forEach((z, zi) => {
    curZone = z;
    const zx0 = x;
    /* calm entry so the new place reads before it is dangerous */
    P.flat(zi === 0 ? 2.6 : 1.15);
    decorate(z, 1);

    let budget = z.sec, used = '', shortcutDone = false;
    const wantsShortcut = ['yard1', 'park', 'mall', 'airport'].indexOf(z.id) >= 0;

    while (budget > 1.6) {
      const x0 = x;
      let name;
      if (wantsShortcut && !shortcutDone && budget < z.sec * 0.62) { name = 'shortcut'; shortcutDone = true; }
      else name = pickPattern(z, rng, used);

      if (name === 'hurdle') P.hurdle(z, false);
      else if (name === 'double') P.hurdle(z, true);
      else if (name === 'over') P.over(z);
      else if (name === 'tunnel') P.tunnel(z);
      else if (name === 'gap') P.gap(z);
      else if (name === 'step') P.step(z);
      else if (name === 'ledge') P.ledge(z, rng.chance(0.4));
      else if (name === 'pit') P.pit(z);
      else if (name === 'shortcut') P.shortcut(z);
      used = name;

      /* breathing room — shrinks with difficulty but never below 0.46 s */
      const restSec = Math.max(0.46, lerp(0.95, 0.55, z.diff) + rng.range(-0.06, 0.22));
      P.flat(restSec);
      if (rng.chance(0.5)) decorate(z, 1);
      budget -= (x - x0) / speed();
    }
    P.flat(1.1);
    if (z.exit) {
      const gw = z.exit === 'jetbridge' ? 190 : z.exit === 'planeDoor' ? 110 : 118;
      const gh = z.exit === 'jetbridge' ? 190 : 205;
      W.deco.push({ x: x - gw - 40, y: 0, prop: z.exit, w: gw, h: gh, zone: z.index, gateway: true });
      P.flat(0.55);
    }
    W.zones.push({ zone: z, x0: zx0, x1: x });
  });

  /* ---------- finish line ---------- */
  P.flat(1.6);
  W.finishX = x + 120;
  W.deco.push({ x: x, y: 0, prop: 'finish', w: 190, h: 210, zone: ZONES.length - 1, finish: true });
  P.flat(2.4);
  closeGround(x + 400);
  W.totalX = x + 400;
  if (pendingWarp) { pendingWarp.trigger.toX = W.finishX - 400; pendingWarp.trigger.toY = 0; }

  /* ---------- place the 15 treats ---------- */
  const perZone = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2];  // = 15
  ZONES.forEach((z, zi) => {
    const mine = anchors.filter(a => a.zone === zi);
    if (!mine.length) return;
    const want = perZone[zi] || 1;
    const special = mine.filter(a => a.special);
    const pool = special.length >= want ? special : mine;
    for (let k = 0; k < want; k++) {
      /* spread the picks across the zone */
      const idx = Math.min(pool.length - 1,
        Math.floor(pool.length * ((k + 0.5) / want) + (k * 7 % 3) - 1));
      const a = pool[clamp(idx, 0, pool.length - 1)];
      if (!a || a.taken) { const alt = pool.find(p => !p.taken); if (!alt) break; takeBone(alt); continue; }
      takeBone(a);
    }
  });
  /* keep them apart and exactly 15 */
  W.bones.sort((a, b) => a.x - b.x);
  for (let i = 1; i < W.bones.length; i++)
    if (W.bones[i].x - W.bones[i - 1].x < 2200) W.bones[i].x = W.bones[i - 1].x + 2200;
  while (W.bones.length > 15) W.bones.pop();
  while (W.bones.length < 15) {
    const free = anchors.filter(a => !a.taken);
    if (!free.length) break;
    const a = free[Math.floor(free.length * 0.5)];
    takeBone(a);
    W.bones.sort((p, q) => p.x - q.x);
  }
  W.bones.forEach((b, i) => { b.i = i; b.got = false; });

  /* split ground at zone borders so every stretch gets its own floor style */
  const cuts = W.zones.map(z => z.x0).concat([W.totalX + 1]).sort((a, b) => a - b);
  const split = [];
  W.ground.forEach(g => {
    let x0 = g.x; const x1 = g.x + g.w;
    cuts.forEach(c => {
      if (c > x0 && c < x1) { split.push({ x: x0, w: c - x0, y: 0 }); x0 = c; }
    });
    split.push({ x: x0, w: x1 - x0, y: 0 });
  });
  W.ground = split.filter(g => g.w > 1);
  W.ground.forEach(g => {
    let zi = 0;
    for (let i = 0; i < W.zones.length; i++) if (g.x + 1 >= W.zones[i].x0) zi = i;
    g.zone = zi;
  });

  /* spatial buckets so rendering & collision stay cheap */
  W.index = buildIndex(W);
  return W;
}

/* bucket everything by 800-px columns */
function buildIndex(W) {
  const SZ = 800;
  const idx = { SZ: SZ, cells: {} };
  const push = (kind, o, x0, x1) => {
    const a = Math.floor(x0 / SZ), b = Math.floor(x1 / SZ);
    for (let i = a; i <= b; i++) {
      (idx.cells[i] || (idx.cells[i] = { ground: [], platforms: [], hazards: [], bones: [], deco: [], warps: [] }))[kind].push(o);
    }
  };
  W.ground.forEach(g => push('ground', g, g.x, g.x + g.w));
  W.platforms.forEach(p => push('platforms', p, p.x, p.x + p.w));
  W.hazards.forEach(h => push('hazards', h, h.x, h.x + h.w));
  W.bones.forEach(b => push('bones', b, b.x - 20, b.x + 20));
  W.deco.forEach(d => push('deco', d, d.x, d.x + d.w));
  W.warps.forEach(w => push('warps', w, w.x, w.x + w.w));
  return idx;
}
let QSTAMP = 0;
function queryCells(W, x0, x1) {
  QSTAMP++;
  const SZ = W.index.SZ, out = { ground: [], platforms: [], hazards: [], bones: [], deco: [], warps: [] };
  const a = Math.floor(x0 / SZ), b = Math.floor(x1 / SZ);
  for (let i = a; i <= b; i++) {
    const c = W.index.cells[i]; if (!c) continue;
    for (const k in out) {
      const src = c[k];
      for (let j = 0; j < src.length; j++) {
        const o = src[j];
        if (o.__q !== QSTAMP) { o.__q = QSTAMP; out[k].push(o); }
      }
    }
  }
  return out;
}
