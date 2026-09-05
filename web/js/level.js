'use strict';
/* ---------------------------------------------------------------
   level.js — builds ONE long fixed track with ONE finish line.
   Everything is laid out in *time* (seconds of travel at the local
   speed) instead of pixels, so the run stays fair as Lota speeds up.

   There are no holes anywhere on the track. Where a place offers two
   ways through it, the second one is a *layer*: the same stretch of
   track built again at a different height, joined to the main route by
   real staircases. Both layers cover the same seconds, so whichever way
   she goes she comes out at the same point at the same time.
----------------------------------------------------------------*/
const PHYS = {
  GRAV: 2650,
  JUMP_V: 1000,
  BOUNCE_V: 1140,     // off the bed in the girl's room: apex 245 from the
                      // mattress at 140, so the top of the arc is still 385
  V_MIN: 330,
  V_MAX: 730,
  X_FULL: 86000,      // distance over which the speed ramp completes
  get AIRTIME() { return (2 * this.JUMP_V) / this.GRAV; },   // 0.755 s
  get APEX()    { return (this.JUMP_V * this.JUMP_V) / (2 * this.GRAV); } // 188 px
};
/* Every level runs at its own pace. `SPEED` is the profile currently in
   force — the generator sets it while it lays a track out, and the engine
   sets it when a run starts, so the two never disagree. */
let SPEED = PHYS;
function useSpeed(p) { SPEED = p || PHYS; }
function speedAt(x) {
  return SPEED.V_MIN + (SPEED.V_MAX - SPEED.V_MIN) * Math.pow(clamp(x / SPEED.X_FULL, 0, 1), 0.85);
}
/* how far she flies in one jump at this point of the track */
function reachAt(x) { return speedAt(x) * PHYS.AIRTIME; }

const MAX_STEP_H = 112;   // highest solid wall she must clear (apex is 188)
const LEDGE_TOP  = 152;   // one-way shelf height
const LEDGE_CLEAR = 110;  // free space underneath — she is 62 tall and can now
                          // be standing on a 44-high obstacle while under it
const DUCK_BOTTOM = 46;   // overhead hazards start here (duck box is 30 tall)
const MAX_HURDLE_H = 96;  // a tall obstacle is no less fair: landing on top of
                          // one is always allowed, so height never kills
/* Landing on a thing is never fatal, and neither is jumping at one: a rising
   Lota always ends up on top of whatever solid thing she clips. GRAB is the
   extra reach she still has on the way back down. */
const GRAB = 34;          // anything solid: crates, shelves, the lip of a stair
const GRAB_OVER = 52;     // hanging things: getting on top of one is a real route

/* ---- birds ----
   A seagull is the one thing on the track with no top and no bottom to it:
   she cannot stand on it and she cannot barge through it. The band it flies
   in leaves 50 px of headroom to duck under (she is 30 ducked) and stops
   well below the top of a jump (apex 188), so both ways out stay open. */
const BIRD_BOTTOM = 50;
const BIRD_H = 66;

/* ---- the duct over the girl's room ----
   The bed throws her this far above the bedroom floor; the duct floor sits a
   little under the top of that arc, so the bounce always gets her in. */
const VENT_RISE = 300;
/* The bed itself is a loft bed: the mattress is up at BED_TOP with BED_BODY of
   frame hanging under it, which leaves 94 px of air below — she is 62 standing,
   so running straight under it costs nothing and is what happens if the player
   does nothing at all. Getting *on* it is the skill: it is a one-way platform,
   so she has to already be coming down when she arrives over it, which means
   the jump has to start about half a second early. The duct, the key and the
   metro behind it are the prize for knowing that. */
const BED_TOP = 140;
const BED_BODY = 46;

/* ---- the jetpack ----
   The pack is lying at the bottom of the deepest thing on any track: down a
   branch, and then down a second hole inside that branch. Picking it up puts
   her on the `sky` layer — a stretch of track with nothing on it at all, a
   long way above the place she took off from — and she flies it faster than
   she could run the ground below. When it cuts out she comes down again, and
   the glide is long and gentle rather than a fall.

   Everything the ground would have given her over that stretch is laid out
   again up in the sky, so taking the pack never costs a treat or a toy. */
const SKY_RISE  = 640;    // how far over the ground the cloud deck sits
const SKY_HOVER = 46;     // and how far over that she actually flies
const JET_GLIDE = 1500;   // px of gentle descent between the flight and the floor
const JET_SPEED = 1.55;   // and how much faster than running the pack actually is

/* How wide and how tall each doorway between two places is drawn. A door has
   to be big enough to read as a door she runs through — that is the whole
   difference between "the picture changed" and "she went somewhere". */
const GATEWAY_SIZE = {
  jetbridge: [190, 190], planeDoor: [110, 205],
  gangway: [210, 200], towerDoor: [130, 215], greenDoor: [124, 200],
  fieldGate: [156, 150], quarryRamp: [164, 210], aditMouth: [186, 190],
  blastDoor: [140, 210], landerDoor: [156, 200], airlockIn: [124, 200]
};

/* ---- staircases ---- */
const STAIR_RISE = 42;    // one step
const STAIR_UP   = 48;    // riser she runs straight up: stairs are never a jump
const STAIR_FIRST = 112;  // first tread of a flight that starts inside a room —
                          // clear of her head (she is 62), so she runs under it
                          // unless she chooses to jump onto it

/* An object must have exactly one meaning: either Lota can hit it, or it is
   scenery. Sharing an id between the two makes the track unreadable. */
function assertPropRoles(track) {
  const hits = new Set(), all = [], rooms = [];
  track.zones.forEach(z => { rooms.push(z); if (z.gulls) all.push([z.id, 'gull']); });
  const brs = track.branches || {};
  Object.keys(brs).forEach(b => {
    brs[b].rooms.forEach(r => rooms.push(r));
    if (brs[b].deep) rooms.push(brs[b].deep.room);
  });
  rooms.forEach(r => {
    ['hurdle', 'over', 'tunnel', 'ledge', 'step', 'thrown'].forEach(k =>
      (r.pools[k] || []).forEach(p => { hits.add(p); all.push([r.id, p]); }));
    (r.pools.deco || []).forEach(p => all.push([r.id, p]));
  });

  const clash = [];
  rooms.forEach(r => (r.pools.deco || []).forEach(p => { if (hits.has(p)) clash.push(r.id + ':' + p); }));
  if (clash.length) console.error('Lota Go: prop is both scenery and hazard — ' + clash.join(', '));

  const missing = all.filter(p => !PROPS[p[1]]).map(p => p.join(':'));
  if (missing.length) console.error('Lota Go: no drawing for — ' + missing.join(', '));
}

/** Build one level's track. The `track` says which places it runs through,
    what it collects, how fast it goes and how tight the gaps are. */
function buildWorld(track) {
  track = track || TRACKS[1];
  useSpeed(track.phys);
  assertPropRoles(track);
  const ZL = track.zones, BR = track.branches || {};
  const MIN_REST = track.minRest == null ? 0.46 : track.minRest;
  const REST = track.rest || [0.95, 0.55];
  /* Nothing can be ducked in mid-air, and a jump lasts 0.755 s whatever the
     player does. So the room between a thing she has just jumped and a thing
     she has to duck has to cover the rest of that arc as well as her reaction
     — and on a track this tight it no longer does by itself. `landRest` is
     that extra room; the three tracks built before this one leave it at zero,
     which is exactly what they were laid out with. */
  const LAND_REST = track.landRest || 0;
  const JUMPED = { hurdle: 1, double: 1, step: 1, ledge: 1, shortcut: 1, thrown: 1 };
  const DUCKED = { over: 1, tunnel: 1, bird: 1, thrown: 1 };
  const rng = makeRng(track.seed);
  const W = {
    ground: [], platforms: [], hazards: [], bones: [], items: [], deco: [], warps: [], portals: [],
    spins: [], dives: [],
    zones: [], layers: { main: { id: 'main', base: 0, rooms: [] } },
    level: track.level, currency: track.currency,
    treats: track.treats + (track.toys || 0), collectibles: track.treats, toys: track.toys || 0,
    jet: null, jetItemX: 0, jetLandX: 0, jetLandBase: 0,
    phys: track.phys, zoneList: ZL, branches: BR,
    /* Where a crash puts her back. One at the mouth of every place, and on
       the boss level a few more inside the long ones — an arena that takes a
       minute and a quarter to run is not a fair thing to lose all of. */
    stops: [], boss: !!track.boss, energy: !!track.boss,
    finishX: 0, totalX: 0
  };
  const anchors = [];
  let x = 0, segStart = 0, pendingWarp = null, metroWarp = null, metroLandX = 0;
  let curZone = ZL[0];
  let curLayer = 'main', curBase = 0, curRoom = null;

  const speed = () => speedAt(x);
  const dx = sec => speed() * sec;

  function place(layer, base, room) { curLayer = layer; curBase = base; curRoom = room || null; }
  function stamp(o) {
    o.layer = curLayer;
    /* the height of the floor this thing is standing on: props with legs need
       it to draw them, and it is no longer always zero */
    if (o.base == null) o.base = curBase;
    if (o.zone == null) o.zone = curZone.index;
    if (curRoom) { o.pal = curRoom.pal; o.floor = curRoom.floor; o.room = curRoom.id; }
    return o;
  }

  function closeGround(untilX) {
    if (untilX > segStart + 4) W.ground.push(stamp({ x: segStart, w: untilX - segStart, y: curBase }));
  }
  function openGround(fromX) { segStart = fromX; }

  function hz(zone, prop, gx, gy, gw, gh, kind) {
    W.hazards.push(stamp({ x: gx, y: curBase + gy, w: gw, h: gh, prop: prop, kind: kind || 'hurdle' }));
  }
  function plat(gx, gy, gw, gh, prop, oneWay, extra) {
    const p = stamp({ x: gx, y: curBase + gy, w: gw, h: gh, prop: prop, oneWay: !!oneWay });
    if (extra) Object.assign(p, extra);
    W.platforms.push(p);
    return p;
  }
  function anchor(gx, gy, kind, special) {
    anchors.push({ x: gx, y: curBase + gy, kind: kind, special: !!special,
                   zone: curZone.index, layer: curLayer });
  }
  function decorate(pl, count) {
    const pool = pl.pools.deco || [];
    for (let i = 0; i < count; i++) {
      if (!pool.length) return;
      W.deco.push(stamp({ x: x + rng.range(10, dx(0.5)), y: curBase, prop: rng.pick(pool),
                          w: rng.range(52, 104), h: rng.range(9, 15), flat: true }));
    }
  }

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

    /* Each obstacle is drawn at the size that object actually is — sizing them
       at random is what turned half of them into unreadable blobs. */
    hurdle(z, dbl) {
      const p = rng.pick(z.pools.hurdle), s = propSize(p), k = rng.range(0.94, 1.08);
      const w = Math.round(s[0] * k), h = Math.round(Math.min(s[1] * k, MAX_HURDLE_H));
      hz(z, p, x, 0, w, h);
      anchor(x + w / 2, h + 66, 'jump', false);
      x += w;
      if (dbl) {
        const p2 = rng.pick(z.pools.hurdle), s2 = propSize(p2);
        const g2 = rng.range(20, 40);
        const w2 = Math.round(s2[0] * 0.92), h2 = Math.round(Math.min(s2[1] * 0.9, 78));
        hz(z, p2, x + g2, 0, w2, h2);
        x += g2 + w2;
      }
    },

    /* a seagull, hanging in her lane: duck under it or jump it */
    bird(z) {
      const w = Math.round(propSize('gull')[0] * rng.range(1.0, 1.14));
      hz(z, 'gull', x, BIRD_BOTTOM, w, BIRD_H, 'bird');
      anchor(x + w / 2, BIRD_BOTTOM + BIRD_H + 34, 'bird', true);
      x += w;
    },

    /* something the vet threw. It is an obstacle like any other — the box
       never moves — but it is drawn arriving, and it arrives late: about half
       a second of warning, which on this level is all anyone gets. Half of
       them stick in the ground to be jumped, half come in at head height. */
    thrown(z) {
      const p = rng.pick(z.pools.thrown), s = propSize(p);
      const high = rng.chance(0.45);
      const w = Math.round(s[0] * rng.range(0.96, 1.1));
      if (high) {
        hz(z, p, x, DUCK_BOTTOM, w, 78, 'over');
        W.hazards[W.hazards.length - 1].thrown = 1;
        anchor(x + w / 2, 8, 'duck', true);
      } else {
        const h = Math.round(Math.min(s[1] * 1.05, MAX_HURDLE_H));
        hz(z, p, x, 0, w, h);
        W.hazards[W.hazards.length - 1].thrown = 1;
        anchor(x + w / 2, h + 66, 'jump', false);
      }
      x += w;
    },

    over(z) {
      const w = rng.range(76, 128);
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

    step(z) {
      const h = rng.range(70, MAX_STEP_H);
      const len = dx(rng.range(0.55, 1.0));
      plat(x, h, len, h, rng.pick(z.pools.step), false);
      anchor(x + len * 0.6, h + 40, 'top', false);
      x += len;
    },

    ledge(z, withBoneUnder) {
      const len = dx(rng.range(0.65, 1.05));
      plat(x, LEDGE_TOP, len, LEDGE_TOP - LEDGE_CLEAR, rng.pick(z.pools.ledge), true);
      anchor(x + len * 0.5, LEDGE_TOP + 34, 'ledge', true);
      /* something to dodge on the ground below — taking the shelf skips it.
         Only short things go here, so she still fits under the shelf while
         standing on one. */
      const low = z.pools.hurdle.filter(p => propSize(p)[1] <= 58);
      const lp = low.length ? rng.pick(low) : rng.pick(z.pools.hurdle);
      const hw = Math.round(propSize(lp)[0] * 0.86);
      hz(z, lp, x + len * 0.42, 0, hw, rng.range(36, 44));
      if (withBoneUnder) anchor(x + len * 0.42 + hw / 2, 70, 'jump', false);
      x += len;
    },

    /* One shelf the floor itself steps up by. It is a stair, so she runs
       straight up it — the ground behind her is simply lower than the ground
       in front. Nothing about the sea has to move for this to read. */
    riser(z, h) {
      const run = Math.max(76, reachAt(x) * 0.17);
      closeGround(x);
      plat(x, h, run, h, z.riseProp || 'sandShelf', false,
           { stair: true, rise: h, dir: 1, pal: z.pal });
      x += run;
      curBase += h;
      openGround(x);
    },

    shortcut(z) {
      const len = dx(rng.range(0.7, 0.95));
      plat(x, LEDGE_TOP, len, LEDGE_TOP - LEDGE_CLEAR, rng.pick(z.pools.ledge), true);
      const trig = stamp({ x: x + len - 26, y: curBase + LEDGE_TOP, w: 44, h: 60, zone: z.index, toX: 0, toY: 0 });
      W.warps.push(trig);
      W.deco.push(stamp({ x: x + len - 34, y: curBase + LEDGE_TOP, prop: z.pools.tunnel[0], w: 58, h: 62, shortcut: true }));
      anchor(x + len - 70, LEDGE_TOP + 34, 'shortcut', true);
      const low = z.pools.hurdle.filter(p => propSize(p)[1] <= 58);
      const lp = low.length ? rng.pick(low) : rng.pick(z.pools.hurdle);
      const hw = Math.round(propSize(lp)[0] * 0.86);
      hz(z, lp, x + len * 0.4, 0, hw, rng.range(36, 44));
      x += len;
      pendingWarp = { trigger: trig, fromX: x, minSkip: dx(1.8) };
    }
  };

  /* ---------- staircases ---------- */
  /** A run of treads. dir -1 goes down, +1 goes up. Starts at world height
      `from` and ends exactly on `from + dir * n * STAIR_RISE`. */
  function flight(n, run, from, dir, pal, prop) {
    const y0 = from - curBase;
    for (let i = 0; i < n; i++) {
      plat(x + i * run, y0 + dir * STAIR_RISE * (i + 1), run + 1.5, STAIR_RISE, prop || 'tread', false,
           { stair: true, pal: pal, rise: STAIR_RISE, dir: dir });
    }
    x += n * run;
  }
  function portal(px, pw, y0, y1, from, to) {
    W.portals.push({ x: px, w: pw, y0: y0, y1: y1, from: from, to: to });
  }

  /* ---------- the pattern menu ---------- */
  function pickPattern(pl, rng, used) {
    const d = pl.diff;
    const bag = [];
    const has = k => (pl.pools[k] || []).length > 0;
    const add = (name, w, k) => { if (w > 0 && has(k)) for (let i = 0; i < Math.round(w * 10); i++) bag.push(name); };
    add('hurdle', 3.4 - d * 0.7, 'hurdle');
    add('over', 1.7 + d * 0.6, 'over');
    add('double', 0.4 + d * 1.5, 'hurdle');
    add('step', 1.2 + d * 0.9, 'step');
    add('ledge', 1.3 + d * 0.6, 'ledge');
    add('tunnel', 0.5 + d * 0.9, 'tunnel');
    add('thrown', 1.4 + d * 2.2, 'thrown');
    if (!bag.length) return 'hurdle';
    let name = rng.pick(bag);
    if (name === used && (name === 'tunnel' || name === 'double')) name = 'hurdle';
    return name;
  }

  /** Fill `sec` seconds of a place with obstacles. Works for a zone and for a
      room on a branch alike — they carry the same `pools`/`diff` shape. */
  function fill(pl, sec, opts) {
    let budget = sec, used = '';
    const o = opts || {};
    /* the gulls are not left to chance: a place that says it has four of them
       gets four, spread evenly down its length */
    const gulls = o.gulls || 0;
    let gullsDone = 0;
    /* the same trick for the shelves the sea floor climbs by: a place that
       says it rises eight times rises eight times, evenly */
    const risers = o.risers || 0;
    while (budget > (o.tail == null ? 1.6 : o.tail)) {
      const x0 = x;
      let name;
      if (risers && o.risersDone < risers && (sec - budget) >= sec * ((o.risersDone + 0.5) / (risers + 1))) {
        name = 'riser'; o.risersDone++;
      }
      else if (gulls && gullsDone < gulls && (sec - budget) >= sec * ((gullsDone + 0.7) / (gulls + 1))) {
        name = 'bird'; gullsDone++;
      }
      else if (o.shortcut && !o.shortcutDone && budget < sec * 0.62) { name = 'shortcut'; o.shortcutDone = true; }
      else name = pickPattern(pl, rng, used);

      /* she may still be coming down off the last one */
      if (LAND_REST && DUCKED[name] && JUMPED[used]) P.flat(LAND_REST);

      if (name === 'hurdle') P.hurdle(pl, false);
      else if (name === 'double') P.hurdle(pl, true);
      else if (name === 'over') P.over(pl);
      else if (name === 'tunnel') P.tunnel(pl);
      else if (name === 'step') P.step(pl);
      else if (name === 'ledge') P.ledge(pl, rng.chance(0.4));
      else if (name === 'bird') P.bird(pl);
      else if (name === 'riser') P.riser(pl, o.riseH || 38);
      else if (name === 'thrown') P.thrown(pl);
      else if (name === 'shortcut') P.shortcut(pl);
      used = name;

      /* Breathing room — shrinks with difficulty but never below 0.46 s.
         She may leave a pattern from up on top of it, so add the time it takes
         to fall back down: the reaction budget must hold on every route. */
      const exitH = { ledge: LEDGE_TOP, shortcut: LEDGE_TOP, step: MAX_STEP_H,
                      hurdle: MAX_HURDLE_H, double: MAX_HURDLE_H, thrown: MAX_HURDLE_H,
                      bird: PHYS.APEX }[name] || 0;
      const fallSec = Math.sqrt((2 * exitH) / PHYS.GRAV);
      const restSec = Math.max(MIN_REST, lerp(REST[0], REST[1], pl.diff) + rng.range(-0.06, 0.22)) + fallSec;
      P.flat(restSec);
      if (rng.chance(0.5)) decorate(pl, 1);
      budget -= (x - x0) / speed();
    }
    return budget;
  }

  /* ---------- the second route through a place ---------- */
  /** Lays down everything the main layer needs for the branch to exist: the
      way in, and later the way out. `rec` carries the span the branch body
      then has to fill. */
  function openBranch(z) {
    const br = BR[z.branch];
    /* `top` is the floor the branch is cut into — the street, or the forest
       path. It used to be zero everywhere, so everything down here was
       written as if it were; it no longer is. */
    const B = curBase;
    const rec = { br: br, id: br.id, x0: x, base: 0, top: B, entryEndX: 0, overlap: 0 };
    const keep = { l: curLayer, b: curBase, r: curRoom, seg: segStart };

    if (br.drop) {
      /* the mouth of the steps is an opening in the floor she can jump clean
         over — or drop into, which simply puts her on the steps */
      const mouth = Math.round(reachAt(x) * 0.40);
      const n = Math.ceil(-br.drop / STAIR_RISE);
      const run = Math.max(100, reachAt(x) * 0.22);
      rec.base = B - n * STAIR_RISE;
      const mouthX = x;
      closeGround(x);
      W.deco.push(stamp({ x: x, y: B, prop: br.shaft, w: mouth, h: 128, shaft: true }));
      W.deco.push(stamp({ x: x - 14, y: B, prop: br.sign, w: mouth + 28, h: 158, sign: true,
                          lock: br.locked ? br.id : 0 }));
      if (br.locked) {
        /* The way down is barred until she has the key. The bars are floor, not
           an obstacle: with them shut she simply runs over the mouth and never
           knows it was there — with the key they fold back and the steps open. */
        W.ground.push(stamp({ x: x - 8, w: mouth + 16, y: B, lock: br.id }));
        W.deco.push(stamp({ x: x - 8, y: B, prop: 'metroGrate', w: mouth + 16, h: 70, gate: true, lock: br.id }));
      }
      portal(x - 4, mouth + 30, rec.base - 90, B - 8, 'main', br.id);
      x += mouth;
      openGround(x);
      keep.seg = x;          // the floor now resumes past the mouth, not before it
      /* the steps themselves belong to the branch: from above you see the
         drawing, from down here you run on these */
      place(br.id, B, br.rooms[0]);
      x = mouthX;
      flight(n, run, B, -1, br.rooms[0].pal);
      rec.entryEndX = x;
      place(keep.l, keep.b, keep.r); segStart = keep.seg;
      x = mouthX + mouth;
      return rec;
    }

    /* upstairs: the bottom tread hangs clear of her head, so she runs under
       the flight unless she chooses to jump up onto it */
    const n = Math.ceil((br.rise - STAIR_FIRST) / STAIR_RISE);
    const run = Math.max(72, reachAt(x) * 0.26);
    const first = Math.max(132, reachAt(x) * 0.5);
    rec.base = B + STAIR_FIRST + n * STAIR_RISE;
    rec.overlap = run + 24;
    const x0 = x;
    W.deco.push(stamp({ x: x - 34, y: B, prop: 'stairsUpSign', w: 104, h: 162, sign: true }));
    plat(x, STAIR_FIRST, first, STAIR_RISE, 'tread', false, { stair: true, pal: br.rooms[0].pal });
    anchor(x + first * 0.5, STAIR_FIRST + 36, 'stair', true);
    x += first;
    flight(n, run, B + STAIR_FIRST, 1, br.rooms[0].pal);
    rec.entryEndX = x;
    portal(x - 12, run * 2 + 140, rec.base - 80, rec.base + 280, 'main', br.id);
    /* the hallway underneath stays clear — the flight is right over it */
    const spent = x - x0;
    place(keep.l, keep.b, keep.r); segStart = keep.seg;
    x = x0;
    P.flat(spent / speed());
    return rec;
  }

  /** The way back up out of a branch that went down, into the same place she
      left it. */
  function closeDown(z, rec) {
    /* she comes back into the first room of the branch and climbs out of that,
       so the way up is dressed as the place the steps belong to */
    const br = rec.br, room = br.rooms[0], B = rec.top;
    const n = Math.ceil((B - rec.base) / STAIR_RISE);
    const run = Math.max(76, reachAt(x) * 0.15);
    const keep = { l: curLayer, b: curBase, r: curRoom, seg: segStart }, x0 = x;
    rec.exitStartX = x;
    W.deco.push(stamp({ x: x - 24, y: B, prop: br.exitSign, w: n * run + 48, h: 104, sign: true }));
    place(br.id, B, room);
    W.deco.push(stamp({ x: x + 8, y: rec.base, prop: br.roomGate, w: 112, h: 196, gateway: true }));
    flight(n, run, rec.base, 1, room.pal);
    rec.exitEndX = x;
    if (br.shortcut) {
      /* The train went somewhere. Climbing out of it is what actually skips the
         street: the last treads hand her to a stop far down the line, near the
         finish — which is the whole point of hunting down the key. Only someone
         coming up these steps can trigger it; the street above cannot. */
      metroWarp = stamp({ x: x - run * 1.8, y: B - 60, w: run * 1.5, h: 210, toX: 0, toY: 0 });
      W.warps.push(metroWarp);
    }
    portal(x + 8, 200, B - 70, B + 220, br.id, 'main');
    const spent = x - x0;
    place(keep.l, keep.b, keep.r); segStart = keep.seg;
    x = x0;
    P.flat(spent / speed());
  }

  /** The bed in the girl's room and the duct over it.

      The bed is never a hazard — but it is not a gift either. It is a loft
      bed: a one-way platform up at BED_TOP with clear air underneath, so
      running under it is free and is exactly what doing nothing gets you.
      Landing on top of it is the whole trick, and landing on it throws her at
      the ceiling, through the open hatch and into the duct. Up there nothing
      can hit her — she runs a few seconds in the dark, picks up the metro key,
      and drops back out of a louvre into the same room. The stretch of bedroom
      under the duct is left deliberately empty, so taking the duct and running
      past the bed come out at exactly the same place. */
  function buildDuct(br, rec) {
    const base = rec.base, room = br.duct;
    const keep = { l: curLayer, b: curBase, r: curRoom, seg: segStart };
    /* she has to jump well before the bed to come down on it, so the run-up
       has to be long enough that the jump starts on clear floor */
    P.flat(1.1);
    const bx = x, bw = Math.round(reachAt(x) * 0.42), bh = BED_TOP;
    plat(bx, bh, bw, BED_BODY, 'bedBounce', true, { bounce: 1 });
    anchor(bx + bw * 0.5, bh + 34, 'bed', true);
    x = bx + bw;

    const ventSec = 1.9, dropSec = 1.15;
    const ventBase = base + VENT_RISE;
    const vx0 = bx - 30, vx1 = x + dx(ventSec);
    /* seen from the bedroom: the hatch she goes up through and the louvre she
       comes back down out of */
    W.deco.push(stamp({ x: bx + 10, y: ventBase - 86, prop: 'ventMouth', w: bw + 40, h: 86, duct: true }));
    W.deco.push(stamp({ x: vx1 - 110, y: ventBase - 86, prop: 'ventSlit', w: 150, h: 86, duct: true }));
    /* the bounce carries her past base+300; nothing she can jump does */
    portal(bx - 10, bw + 430, base + 262, base + 620, rec.id, 'vent');

    place('vent', ventBase, room);
    openGround(vx0);
    W.items.push(stamp({ x: bx + bw + dx(ventSec) * 0.55, y: ventBase + 40, kind: 'metroKey', id: 'metroKey', got: false }));
    x = vx1;
    closeGround(x);
    /* off the end of it she simply falls, and lands back in the bedroom */
    portal(vx1 + 4, 340, base - 90, ventBase - 30, 'vent', rec.id);
    W.layers.vent = { id: 'vent', base: ventBase, x0: vx0, x1: vx1 + 340,
                      rooms: [{ x0: vx0 - 400, x1: vx1 + 400, room: room }] };

    place(keep.l, keep.b, keep.r); segStart = keep.seg;
    x = vx1;
    P.flat(dropSec);                    /* clear floor under the drop */
  }

  /** A second hole, in the floor of a branch this time.

      The choice it puts is exactly the one the branch itself put — run
      straight over it, or drop in — except that hardly anyone is down here to
      be asked. Lying at the far end of it, on its stand, is the jetpack.

      Laid out like a branch in miniature: the mouth and its portal go on the
      branch's own layer, the steps and the room below go on a layer of their
      own, and the branch above is filled over the same span so both ways come
      out at the same place at the same time. */
  function buildDeep(br, rec, roomEndX) {
    const D = br.deep, room = D.room, id = D.id;
    const B = rec.base;                     // the branch floor we are cutting into
    const base = B + D.drop;
    const keep = { l: curLayer, b: curBase, r: curRoom };
    const n = Math.ceil(-D.drop / STAIR_RISE);
    const run = Math.max(96, reachAt(x) * 0.2);
    /* Whatever is down here has to fit inside what is left of the room above
       it, or the two routes stop covering the same ground and the way out
       comes up somewhere else entirely. Two flights, the calm at each end and
       the mouth are fixed; the bunker itself gets whatever remains. */
    const fixed = 2 * n * run + dx(0.8 + 1.0 + 0.8 + 1.1) + Math.round(reachAt(x) * 0.40) + 320;
    const room4 = (roomEndX || (x + fixed + dx(D.sec))) - x;
    const bodySec = clamp((room4 - fixed) / speed(), 1.6, D.sec);

    P.flat(0.8);
    const mouthX = x, mouth = Math.round(reachAt(x) * 0.40);
    closeGround(x);
    W.deco.push(stamp({ x: x, y: B, prop: D.shaft, w: mouth, h: 130, shaft: true }));
    W.deco.push(stamp({ x: x - 14, y: B, prop: D.sign, w: mouth + 28, h: 158, sign: true }));
    portal(x - 4, mouth + 30, base - 90, B - 8, rec.id, id);
    x += mouth;
    openGround(x);
    const afterMouth = x;

    /* ---- and now the way down, and what is at the bottom of it ---- */
    W.layers[id] = { id: id, base: base, x0: mouthX, x1: 0, rooms: [] };
    place(id, B, room);
    x = mouthX;
    flight(n, run, B, -1, room.pal);
    place(id, base, room);
    openGround(x - 40);
    P.flat(1.0);
    fill(room, bodySec, { tail: 1.0 });
    P.flat(0.8);
    W.items.push(stamp({ x: x, y: base + 30, kind: 'jetpack', id: 'jetpack', got: false }));
    W.jetItemX = x;
    P.flat(1.1);
    /* the steps back up, for anyone who decides to leave it where it is */
    W.deco.push(stamp({ x: x - 24, y: B, prop: D.exitSign || 'upOut',
                        w: n * run + 48, h: 104, sign: true }));
    flight(n, run, base, 1, room.pal);
    const outX = x;
    closeGround(x + 60);
    portal(x + 8, 200, B - 70, B + 220, id, rec.id);
    W.layers[id].x1 = outX + 240;
    W.layers[id].rooms.push({ x0: mouthX - 240, x1: outX + 240, room: room });

    /* ---- the branch above, over exactly the same stretch ---- */
    place(keep.l, keep.b, keep.r);
    segStart = afterMouth;
    x = afterMouth;
    const spanSec = (outX + 240 - afterMouth) / speed();
    if (spanSec > 1.6) {
      P.flat(0.7);
      fill(keep.r, spanSec - 1.5, { tail: 0.9 });
    }
    if (x < outX + 240) P.flat((outX + 240 - x) / speed());
    x = outX + 240;
  }

  /** The rooms of a branch, laid out across the same span of track the main
      route covers, so both ways take the same number of seconds. */
  function buildBranch(z, rec) {
    const br = rec.br;
    const a2 = rec.entryEndX;
    const b2 = br.drop ? rec.exitStartX : rec.x1;
    const span = Math.max(500, b2 - a2);
    const keepSeg = segStart;
    let cx = a2;
    br.rooms.forEach((room, ri) => {
      const rx1 = ri === br.rooms.length - 1 ? b2 : cx + span * room.share;
      place(rec.id, rec.base, room);
      x = cx;
      openGround(x - (ri === 0 ? rec.overlap : 0));
      W.layers[rec.id].rooms.push({ x0: cx - (ri === 0 ? rec.overlap : 0), x1: rx1, room: room });
      if (ri > 0) {
        W.deco.push(stamp({ x: x + 12, y: rec.base, w: 112, h: 196, gateway: true,
                            prop: br.roomGate }));
      }
      /* a room has to read before it is dangerous, the same as a zone does —
         and she arrives in the first one straight off a flight of stairs */
      P.flat(ri === 0 ? 1.0 : 0.7);
      decorate(room, 1);
      if (br.duct && room.id === br.ductRoom) {
        fill(room, Math.max(0.3, (rx1 - x) / speed() * 0.36), { tail: 0.7 });
        buildDuct(br, rec);
      }
      if (br.deep && room.id === br.deepRoom) {
        fill(room, Math.max(0.3, (rx1 - x) / speed() * 0.2), { tail: 0.8 });
        buildDeep(br, rec, rx1);
      }
      fill(room, Math.max(0.3, (rx1 - x) / speed()), { tail: 0.7 });
      if (x < rx1) P.flat((rx1 - x) / speed());
      x = rx1;
      closeGround(x);
      cx = rx1;
    });
    if (br.drop) {
      /* the climb back out is dressed as the first room again, not the last */
      W.layers[rec.id].rooms.push({ x0: rec.exitStartX, x1: rec.exitEndX + 200, room: br.rooms[0] });
    }
    if (br.exitProp) {
      /* the way back down is the open window: she leaps out of it and lands in
         the yard, exactly where the ground-floor route comes out */
      W.deco.push(stamp({ x: b2 - 168, y: rec.base + 24, prop: br.exitProp, w: 128, h: 158, gateway: true }));
      portal(b2 - 10, 1000, rec.base - 760, rec.base - 60, rec.id, 'main');
    }
    segStart = keepSeg;
  }

  /* ---------- walk the whole track ----------
     The main route is no longer flat. A place can stand higher than the one
     before it — the broken deck of the wreck does, and the shore climbs out
     of the sea a shelf at a time — so `mainBase` is the height the floor is
     at right now, and everything the zone lays down is stamped with it. */
  let mainBase = 0;
  openGround(0);
  /** Somewhere a crash can put her back. Every place starts with one; a place
      that says `stops: n` gets n more spread down it, each on floor that has
      been deliberately left clear on both sides. */
  function addStop(sx, z, mid) {
    W.stops.push({ x: sx, y: curBase, zone: z.index, name: z.name,
                   sub: mid ? null : (z.sub || ''), mid: !!mid,
                   start: W.stops.length === 0 });
  }
  ZL.forEach((z, zi) => {
    curZone = z;
    place('main', mainBase, null);
    const zx0 = x;
    addStop(zi === 0 ? 60 : zx0 + 24, z, 0);
    /* calm entry so the new place reads before it is dangerous */
    P.flat(zi === 0 ? 2.6 : 1.15);
    /* ---- a flight up into a place that stands higher ----
       There is no way past it and no way to fail it: stairs are run, not
       jumped, so the only thing this asks of the player is to keep going. */
    if (z.stairsUp) {
      const n = z.stairsUp, run = Math.max(88, reachAt(x) * 0.2);
      closeGround(x);
      if (z.stairSign) W.deco.push(stamp({ x: x - 24, y: curBase, prop: z.stairSign,
                                           w: n * run + 60, h: 150, sign: true }));
      flight(n, run, mainBase, 1, z.pal, z.stairProp);
      mainBase += n * STAIR_RISE;
      place('main', mainBase, null);
      openGround(x);
      P.flat(0.9);
    }
    /* ---- a flight DOWN out of a place that stands higher ----
       The mirror of the one above, and every bit as safe: she runs off the
       top tread and lands on the next one, all the way to the bottom. It is
       what takes her out of the sky and puts her on the ground. */
    if (z.stairsDown) {
      const n = z.stairsDown, run = Math.max(88, reachAt(x) * 0.2);
      closeGround(x);
      if (z.stairSign) W.deco.push(stamp({ x: x - 24, y: curBase, prop: z.stairSign,
                                           w: n * run + 60, h: 150, sign: true }));
      flight(n, run, mainBase, -1, z.pal, z.stairProp);
      mainBase -= n * STAIR_RISE;
      place('main', mainBase, null);
      openGround(x);
      P.flat(0.9);
    }
    /* where a jetpack ride comes back down: the mouth of this place is left
       deliberately empty so there is never anything to land on top of */
    if (z.jetLand && !W.jetLandX) {
      P.flat(3.2);
      W.jetLandX = x;
      W.jetLandBase = curBase;
      P.flat(1.6);
    }
    /* the one place the view swings round: she comes off the beach, turns
       right and the pier is suddenly ahead of her */
    if (z.turn) W.spins.push({ x: zx0 + dx(0.3) });
    decorate(z, 1);

    const br = z.branch ? BR[z.branch] : null;
    const opts = { shortcut: (track.shortcuts || []).indexOf(z.id) >= 0, shortcutDone: false,
                   gulls: z.gulls || 0,
                   risers: (z.climb && z.climb.n) || 0, risersDone: 0,
                   riseH: (z.climb && z.climb.h) || 38 };
    let rec = null, budget = z.sec;

    if (br) {
      const t0 = x;
      fill(z, br.enterSec, { tail: 0.9 });
      P.flat(0.6);            /* clear ground on the approach to the stairs */
      rec = openBranch(z);
      P.flat(0.9);            /* and room to react after choosing to skip them */
      budget -= (x - t0) / speed();
    }
    if (br && br.drop) {
      const t1 = x;
      fill(z, br.sec, { tail: 1.2 });
      P.flat(0.55);
      closeDown(z, rec);
      P.flat(0.9);
      budget -= (x - t1) / speed();
      rec.x1 = x;

      if (br.shortcut) {
        /* The far end of the shortcut. The train has to put her down somewhere
           the track is deliberately empty — she arrives out of a screen wipe
           with nothing to read ahead of time — and far enough down the street
           that the key was worth going after, yet with a real stretch of London
           still to run: the metro is a shortcut, not the finish line. */
        const t2 = x, tail = 3.2;
        fill(z, Math.max(1.2, budget - tail - 1.9), opts);
        P.flat(0.55);
        metroLandX = x + dx(0.15);
        P.flat(1.35);
        budget -= (x - t2) / speed();
      }
    }

    /* A place long enough to say so is broken into stretches, with a stop
       between each pair of them. The calm on either side of the stop is what
       makes it safe to come back to. */
    const nStop = z.stops || 0;
    if (nStop > 0 && budget > 6) {
      const chunk = (budget - nStop * 2.6) / (nStop + 1);
      for (let si = 0; si <= nStop; si++) {
        fill(z, chunk, opts);
        if (si < nStop) { P.flat(1.3); addStop(x, z, 1); P.flat(1.3); }
      }
    } else fill(z, budget, opts);
    /* a place that promised to climb, climbs — whatever the gaps did */
    while (opts.risers && opts.risersDone < opts.risers) {
      P.flat(0.5); P.riser(z, opts.riseH); opts.risersDone++; P.flat(0.5);
    }
    mainBase = curBase;
    P.flat(1.1);
    if (z.exit) {
      const gs = GATEWAY_SIZE[z.exit] || [118, 205];
      const gw = gs[0], gh = gs[1];
      W.deco.push(stamp({ x: x - gw - 40, y: curBase, prop: z.exit, w: gw, h: gh, gateway: true }));
      P.flat(0.55);
    }
    /* ---- off the end of the pier ----
       The deck simply stops. There is no hole to fall down anywhere on this
       track; this is a dive, and it is scripted: she leaps, the sea takes her,
       and she comes up running on the bottom. */
    if (z.dive) {
      P.flat(0.45);
      const lip = x;
      z.deckEnd = lip;      /* the background stops laying deck here too */
      closeGround(lip);
      W.deco.push(stamp({ x: lip - 118, y: curBase, prop: 'pierEnd', w: 130, h: 150, gateway: true }));
      const gap = dx(1.7);
      x = lip + gap;
      openGround(x);
      /* the region ends just short of the new floor, so coming back from a
         checkpoint down there never re-triggers the leap */
      W.dives.push({ x0: lip - 26, x1: x - 6, toX: x + dx(0.55), lip: lip, base: curBase });
    }
    /* ---- the far end of a deck that stands over something ----
       The planking simply stops. It is not a hole: the floor she came in on
       has been running along underneath the whole time, so she drops onto it
       and keeps going — the way out of the wreck is a jump off the side. */
    if (z.dropEnd) {
      P.flat(0.5);
      const lip = x;
      closeGround(lip);
      W.deco.push(stamp({ x: lip - 128, y: curBase, prop: z.dropProp || 'deckEdge',
                          w: 140, h: 160, gateway: true }));
      mainBase = z.dropTo == null ? 0 : z.dropTo;
      /* the floor down there belongs to what she is dropping onto, not to the
         deck she is leaving — the sea bed under a wreck is still sea bed */
      place('main', mainBase, z.dropRoom || null);
      /* the floor below is already there, well before the edge */
      openGround(lip - dx(1.1));
      x = lip + dx(0.25);
      P.flat(1.5);
    }
    /* the salon turns her on the spot several times: whoever is chasing her
       loses her for a beat every time it happens */
    if (z.spins) for (let si = 0; si < z.spins; si++)
      W.spins.push({ x: zx0 + (x - zx0) * ((si + 1) / (z.spins + 1)), slip: 1 });
    if (br && !br.drop) rec.x1 = x;
    z.span = { x0: zx0, x1: x };
    z.baseY = mainBase;
    W.zones.push({ zone: z, x0: zx0, x1: x, baseY: mainBase });

    /* ---- and now the other way through, over exactly the same span ---- */
    if (rec) {
      const back = x;
      W.layers[rec.id] = { id: rec.id, base: rec.base, br: rec.br,
                           x0: rec.x0, x1: rec.x1, rooms: [] };
      buildBranch(z, rec);
      x = back;
      place('main', 0, null);
    }
  });

  /* ---------- finish line ---------- */
  /* whatever height the last place left her at, the finish stands on it */
  place('main', mainBase, null);
  curZone = ZL[ZL.length - 1];
  P.flat(1.6);
  W.finishX = x + 120;
  W.deco.push(stamp({ x: x, y: curBase, prop: 'finish', w: 190, h: 210, finish: true }));
  P.flat(2.4);
  closeGround(x + 400);
  W.totalX = x + 400;
  if (pendingWarp) { pendingWarp.trigger.toX = W.finishX - 400; pendingWarp.trigger.toY = 0; }

  /* ---------- where the train lets her out ----------
     She comes up with about five seconds of London left instead of the
     twenty-odd she would have had to run — that is what the key buys. */
  if (metroWarp && metroLandX) {
    metroWarp.toX = metroLandX;
    metroWarp.toY = 0;
    W.metroSkip = { x0: metroWarp.x, x1: metroLandX };
  }

  /* ---------- place the 15 treats ----------
     A place with two routes spends one of its treats on *both* of them, so the
     count is the same whichever way she goes: 15 either way, 15 in total. */
  const perZone = track.perZone;
  const TREATS = track.treats;
  const pairs = [];
  function takeBone(a, extra) {
    a.taken = 1;
    const b = { x: a.x, y: a.y, kind: a.kind, zone: a.zone, layer: a.layer,
                cur: track.currency, got: false };
    if (extra) Object.assign(b, extra);
    W.bones.push(b);
    return b;
  }
  ZL.forEach((z, zi) => {
    const mine = anchors.filter(a => a.zone === zi && a.layer === 'main');
    if (!mine.length) return;
    let want = perZone[zi] || 1;

    const L = z.branch ? W.layers[BR[z.branch].id] : null;
    if (L) {
      const inside = mine.filter(a => !a.taken && a.x > L.x0 && a.x < L.x1);
      const pool0 = inside.filter(a => a.special).length ? inside.filter(a => a.special) : inside;
      if (pool0.length) {
        const b = takeBone(pool0[Math.floor(pool0.length * 0.5)], { fixed: 1 });
        pairs.push({ layer: L.id, bone: b });
        want--;
      }
    }

    /* every other treat in this place has to sit where BOTH routes pass, or
       taking the second one would quietly cost her a treat */
    let free = mine.filter(a => !a.taken);
    if (L) {
      const outside = free.filter(a => a.x <= L.x0 || a.x >= L.x1);
      if (outside.length >= want) free = outside;
    }
    const special = free.filter(a => a.special);
    const pool = special.length >= want ? special : free;
    for (let k = 0; k < want; k++) {
      const idx = Math.min(pool.length - 1,
        Math.floor(pool.length * ((k + 0.5) / want) + (k * 7 % 3) - 1));
      const a = pool[clamp(idx, 0, pool.length - 1)];
      if (!a || a.taken) { const alt = pool.find(p => !p.taken); if (!alt) break; takeBone(alt); continue; }
      takeBone(a);
    }
  });
  /* Keep them apart, and exactly as many as the level promises. The floor on
     the spacing is a fraction of what an even share would be, never the whole
     of it: pushed onto an exact grid, a treat stops sitting where its jump or
     its shelf put it and starts hanging over nothing. The three tracks built
     before the boss are nowhere near this bound — the boss, which lays down
     seventy of them, is nothing but. */
  const SPACE = Math.min(2200, (W.totalX * 0.55) / TREATS);
  W.bones.sort((a, b) => a.x - b.x);
  for (let i = 1; i < W.bones.length; i++)
    if (!W.bones[i].fixed && W.bones[i].x - W.bones[i - 1].x < SPACE) W.bones[i].x = W.bones[i - 1].x + SPACE;
  while (W.bones.length > TREATS) {
    let k = W.bones.length - 1;
    while (k > 0 && W.bones[k].fixed) k--;
    W.bones.splice(k, 1);
  }
  const branchSpans = Object.keys(W.layers).filter(k => k !== 'main').map(k => W.layers[k]);
  const shared = a => branchSpans.every(L => a.x <= L.x0 || a.x >= L.x1);
  while (W.bones.length < TREATS) {
    const all = anchors.filter(a => !a.taken && a.layer === 'main');
    const free = all.filter(shared).length ? all.filter(shared) : all;
    if (!free.length) break;
    takeBone(free[Math.floor(free.length * 0.5)]);
    W.bones.sort((p, q) => p.x - q.x);
  }
  W.bones.forEach((b, i) => { b.i = i; b.got = false; });

  /* the twin on the other route: same treat, same number, two places to get it */
  pairs.forEach(p => {
    const L = W.layers[p.layer];
    const cand = anchors.filter(a => a.layer === p.layer && !a.taken);
    if (!cand.length) return;
    const sp = cand.filter(a => a.special);
    const a = (sp.length ? sp : cand)[Math.floor((sp.length ? sp.length : cand.length) * 0.5)];
    a.taken = 1;
    W.bones.push({ x: a.x, y: a.y, kind: a.kind, zone: a.zone, layer: p.layer,
                   cur: p.bone.cur, i: p.bone.i, got: false, twin: 1 });
  });

  /* Whatever the train skips past, it also carries a copy of: every treat on
     the stretch of street the shortcut jumps over is laid out again down in
     the station or the carriage, so 15 stays 15 whichever way she goes. */
  if (W.metroSkip && W.layers.metro) {
    const gap = W.metroSkip;
    const missed = W.bones.filter(b => b.layer === 'main' && b.x > gap.x0 && b.x < gap.x1);
    const have = {};
    W.bones.forEach(b => { if (b.layer === 'metro') have[b.i] = 1; });
    const cand = anchors.filter(a => a.layer === 'metro' && !a.taken);
    missed.forEach((b, k) => {
      if (have[b.i] || !cand.length) return;
      const a = cand.splice(clamp(Math.floor(cand.length * ((k + 0.5) / missed.length)), 0, cand.length - 1), 1)[0];
      a.taken = 1; have[b.i] = 1;
      W.bones.push({ x: a.x, y: a.y, kind: a.kind, zone: a.zone, layer: 'metro',
                     cur: b.cur, i: b.i, got: false, twin: 1 });
    });
  }

  /* ---------- the toys ----------
     Level 3 collects two things, and the second one is not lying about on the
     main route at all: every ball on that track is down one of the second
     routes — the ballast deck, the seed cellar, the conveyor gallery or the
     bunker under it. Running the level straight through gets the treats and
     none of the toys, which is the whole point of the holes in the floor. */
  const TOYS = W.toys;
  if (TOYS) {
    let next = W.bones.length ? W.bones.reduce((m, b) => Math.max(m, b.i), 0) + 1 : 0;
    const ids = Object.keys(W.layers).filter(k => k !== 'main');
    const pools = ids.map(k => anchors.filter(a => a.layer === k && !a.taken)
                                      .sort((p, q) => p.x - q.x))
                     .filter(pl => pl.length);
    if (pools.length) {
      /* share them out a layer at a time, and never ask a layer for more
         places than it actually has: the twelfth ball has to exist */
      const want = pools.map(() => 0);
      let left = TOYS;
      while (left > 0) {
        let any = false;
        for (let i = 0; i < pools.length && left > 0; i++)
          if (want[i] < pools[i].length) { want[i]++; left--; any = true; }
        if (!any) break;
      }
      pools.forEach((pool, pi) => {
        const nWant = want[pi];
        if (!nWant) return;
        const sp = pool.filter(a => a.special);
        const use = sp.length >= nWant ? sp : pool;
        for (let k = 0; k < nWant; k++) {
          const f = nWant === 1 ? 0.5 : k / (nWant - 1);
          let a = use[clamp(Math.round((use.length - 1) * f), 0, use.length - 1)];
          if (!a || a.taken) a = use.find(q => !q.taken) || pool.find(q => !q.taken);
          if (!a) break;
          a.taken = 1;
          W.bones.push({ x: a.x, y: a.y, kind: a.kind, zone: a.zone, layer: a.layer,
                         cur: 't', i: next++, got: false });
        }
      });
    }
  }

  /* ---------- above the clouds ----------
     Where the jetpack flies her, and what is laid out along the way. The sky
     is not a place she can walk to: nothing but the pack ever puts her on it,
     and there is nothing up there to hit. */
  if (W.jetItemX && W.jetLandX) {
    const sx0 = W.jetItemX + 60, sx1 = W.jetLandX - JET_GLIDE;
    if (sx1 > sx0 + 900) {
      const base = W.jetLandBase + SKY_RISE;
      W.jet = { itemX: W.jetItemX, x0: sx0, x1: sx1, base: base,
                landX: W.jetLandX, landY: W.jetLandBase };
      W.layers.sky = { id: 'sky', base: base, x0: sx0, x1: sx1,
                       rooms: [{ x0: sx0 - 3000, x1: sx1 + 3000, room: SKY_ROOM }] };
      /* every treat and every toy the flight goes over, laid out again along
         it — so choosing the pack never costs her a single one */
      const have = {}, seen = {}, missed = [];
      W.bones.forEach(b => {
        if (b.layer === 'sky') { have[b.i] = 1; return; }
        if (b.x <= W.jetItemX || b.x >= W.jetLandX || seen[b.i]) return;
        seen[b.i] = 1; missed.push(b);
      });
      missed.sort((a, b) => a.x - b.x);
      const span = sx1 - sx0;
      /* and if the stretch she flew over happened to be carrying nothing at
         all, borrow the next few from the ground she is about to land on: a
         copy in the sky is the same treat, so a run that never finds the pack
         picks them up on foot instead and neither way is short of one */
      if (missed.length < 3) {
        W.bones.filter(b => b.layer === 'main' && b.x >= W.jetLandX && !have[b.i])
          .sort((a, b) => a.x - b.x)
          .slice(0, 3 - missed.length)
          .forEach(b => { if (!have[b.i]) { have[b.i] = 0; missed.push(b); } });
      }
      missed.forEach((b, k) => {
        if (have[b.i]) return;
        have[b.i] = 1;
        W.bones.push({ x: sx0 + span * ((k + 0.6) / (missed.length + 0.2)),
                       y: base + SKY_HOVER + 26, kind: 'fly', zone: b.zone,
                       layer: 'sky', cur: b.cur, i: b.i, got: false, twin: 1 });
      });
    }
  }

  /* split ground at zone borders so every stretch gets its own floor style */
  const cuts = W.zones.map(z => z.x0).concat([W.totalX + 1]).sort((a, b) => a - b);
  const split = [], keepG = [];
  W.ground.forEach(g => {
    /* barred floor comes and goes with the key — splitting it would throw the
       flag away */
    if (g.layer !== 'main' || g.lock) { keepG.push(g); return; }
    /* whatever height this stretch of floor was laid at, it keeps — the deck
       of the wreck and the shelves out of the sea are floor like any other */
    const cut = (a, b) => ({ x: a, w: b - a, y: g.y, base: g.base, layer: 'main',
                             floor: g.floor, pal: g.pal, room: g.room });
    let x0 = g.x; const x1 = g.x + g.w;
    cuts.forEach(c => { if (c > x0 && c < x1) { split.push(cut(x0, c)); x0 = c; } });
    split.push(cut(x0, x1));
  });
  const mainG = split.filter(g => g.w > 1);
  mainG.forEach(g => {
    let zi = 0;
    for (let i = 0; i < W.zones.length; i++) if (g.x + 1 >= W.zones[i].x0) zi = i;
    g.zone = zi;
  });
  W.ground = mainG.concat(keepG);

  /* spatial buckets so rendering & collision stay cheap */
  W.index = buildIndex(W);
  return W;
}

/** The height of the floor under a point on a route. The main route used to
    be flat all the way, so this was always zero; it no longer is. */
function groundYAt(W, x, layer) {
  const c = queryCells(W, x - 3, x + 3);
  const LY = layer || 'main';
  let y = null;
  for (let i = 0; i < c.ground.length; i++) {
    const g = c.ground[i];
    if ((g.layer || 'main') !== LY || g.lock) continue;
    if (x < g.x - 1 || x > g.x + g.w + 1) continue;
    if (y === null || g.y > y) y = g.y;
  }
  return y;
}

/* bucket everything by 800-px columns */
function buildIndex(W) {
  const SZ = 800;
  const idx = { SZ: SZ, cells: {} };
  const push = (kind, o, x0, x1) => {
    const a = Math.floor(x0 / SZ), b = Math.floor(x1 / SZ);
    for (let i = a; i <= b; i++) {
      (idx.cells[i] || (idx.cells[i] = { ground: [], platforms: [], hazards: [], bones: [], items: [], deco: [], warps: [], portals: [] }))[kind].push(o);
    }
  };
  W.ground.forEach(g => push('ground', g, g.x, g.x + g.w));
  W.platforms.forEach(p => push('platforms', p, p.x, p.x + p.w));
  W.hazards.forEach(h => push('hazards', h, h.x, h.x + h.w));
  W.bones.forEach(b => push('bones', b, b.x - 20, b.x + 20));
  W.items.forEach(it => push('items', it, it.x - 40, it.x + 40));
  W.deco.forEach(d => push('deco', d, d.x, d.x + d.w));
  W.warps.forEach(w => push('warps', w, w.x, w.x + w.w));
  W.portals.forEach(p => push('portals', p, p.x, p.x + p.w));
  return idx;
}
let QSTAMP = 0;
function queryCells(W, x0, x1) {
  QSTAMP++;
  const SZ = W.index.SZ, out = { ground: [], platforms: [], hazards: [], bones: [], items: [], deco: [], warps: [], portals: [] };
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
