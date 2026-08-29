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
  BOUNCE_V: 1300,     // off the bed in the girl's room: apex 319, not 188
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

/* ---- the duct over the girl's room ----
   The bed throws her this far above the bedroom floor; the duct floor sits a
   little under the top of that arc, so the bounce always gets her in. */
const VENT_RISE = 300;

/* ---- staircases ---- */
const STAIR_RISE = 42;    // one step
const STAIR_UP   = 48;    // riser she runs straight up: stairs are never a jump
const STAIR_FIRST = 112;  // first tread of a flight that starts inside a room —
                          // clear of her head (she is 62), so she runs under it
                          // unless she chooses to jump onto it

/* An object must have exactly one meaning: either Lota can hit it, or it is
   scenery. Sharing an id between the two makes the track unreadable. */
function assertPropRoles() {
  const hits = new Set(), all = [];
  const scan = (id, pools) => {
    ['hurdle', 'over', 'tunnel', 'ledge', 'step'].forEach(k => (pools[k] || []).forEach(p => { hits.add(p); all.push([id, p]); }));
    (pools.deco || []).forEach(p => all.push([id, p]));
  };
  ZONES.forEach(z => scan(z.id, z.pools));
  Object.keys(BRANCHES).forEach(b => BRANCHES[b].rooms.forEach(r => scan(r.id, r.pools)));

  const clash = [];
  const scanDeco = (id, pools) => (pools.deco || []).forEach(p => { if (hits.has(p)) clash.push(id + ':' + p); });
  ZONES.forEach(z => scanDeco(z.id, z.pools));
  Object.keys(BRANCHES).forEach(b => BRANCHES[b].rooms.forEach(r => scanDeco(r.id, r.pools)));
  if (clash.length) console.error('Lota Go: prop is both scenery and hazard — ' + clash.join(', '));

  const missing = all.filter(p => !PROPS[p[1]]).map(p => p.join(':'));
  if (missing.length) console.error('Lota Go: no drawing for — ' + missing.join(', '));
}

function buildWorld() {
  assertPropRoles();
  const rng = makeRng(20260827);
  const W = {
    ground: [], platforms: [], hazards: [], bones: [], items: [], deco: [], warps: [], portals: [],
    zones: [], layers: { main: { id: 'main', base: 0, rooms: [] } },
    finishX: 0, totalX: 0
  };
  const anchors = [];
  let x = 0, segStart = 0, pendingWarp = null, metroWarp = null, metroLandX = 0;
  let curZone = ZONES[0];
  let curLayer = 'main', curBase = 0, curRoom = null;

  const speed = () => speedAt(x);
  const dx = sec => speed() * sec;

  function place(layer, base, room) { curLayer = layer; curBase = base; curRoom = room || null; }
  function stamp(o) {
    o.layer = curLayer;
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

    shortcut(z) {
      const len = dx(rng.range(0.7, 0.95));
      plat(x, LEDGE_TOP, len, LEDGE_TOP - LEDGE_CLEAR, rng.pick(z.pools.ledge), true);
      const trig = stamp({ x: x + len - 26, y: LEDGE_TOP, w: 44, h: 60, zone: z.index, toX: 0, toY: 0 });
      W.warps.push(trig);
      W.deco.push(stamp({ x: x + len - 34, y: LEDGE_TOP, prop: z.pools.tunnel[0], w: 58, h: 62, shortcut: true }));
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
  function flight(n, run, from, dir, pal) {
    const y0 = from - curBase;
    for (let i = 0; i < n; i++) {
      plat(x + i * run, y0 + dir * STAIR_RISE * (i + 1), run + 1.5, STAIR_RISE, 'tread', false,
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
    while (budget > (o.tail == null ? 1.6 : o.tail)) {
      const x0 = x;
      let name;
      if (o.shortcut && !o.shortcutDone && budget < sec * 0.62) { name = 'shortcut'; o.shortcutDone = true; }
      else name = pickPattern(pl, rng, used);

      if (name === 'hurdle') P.hurdle(pl, false);
      else if (name === 'double') P.hurdle(pl, true);
      else if (name === 'over') P.over(pl);
      else if (name === 'tunnel') P.tunnel(pl);
      else if (name === 'step') P.step(pl);
      else if (name === 'ledge') P.ledge(pl, rng.chance(0.4));
      else if (name === 'shortcut') P.shortcut(pl);
      used = name;

      /* Breathing room — shrinks with difficulty but never below 0.46 s.
         She may leave a pattern from up on top of it, so add the time it takes
         to fall back down: the reaction budget must hold on every route. */
      const exitH = { ledge: LEDGE_TOP, shortcut: LEDGE_TOP, step: MAX_STEP_H,
                      hurdle: MAX_HURDLE_H, double: MAX_HURDLE_H }[name] || 0;
      const fallSec = Math.sqrt((2 * exitH) / PHYS.GRAV);
      const restSec = Math.max(0.46, lerp(0.95, 0.55, pl.diff) + rng.range(-0.06, 0.22)) + fallSec;
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
    const br = BRANCHES[z.branch];
    const rec = { br: br, id: br.id, x0: x, base: 0, entryEndX: 0, overlap: 0 };
    const keep = { l: curLayer, b: curBase, r: curRoom, seg: segStart };

    if (br.id === 'metro') {
      /* the mouth of the steps is a gap in the pavement she can jump clean
         over — or drop into, which simply puts her on the steps */
      const mouth = Math.round(reachAt(x) * 0.40);
      const n = Math.ceil(250 / STAIR_RISE);
      const run = Math.max(100, reachAt(x) * 0.22);
      rec.base = -n * STAIR_RISE;
      const mouthX = x;
      closeGround(x);
      W.deco.push(stamp({ x: x, y: 0, prop: 'stairsDown', w: mouth, h: 128, shaft: true }));
      W.deco.push(stamp({ x: x - 14, y: 0, prop: br.sign, w: mouth + 28, h: 158, sign: true, lock: 'metro' }));
      /* The way down is barred until she has the key. The bars are floor, not
         an obstacle: with them shut she simply runs over the mouth and never
         knows it was there — with the key they fold back and the steps open. */
      W.ground.push(stamp({ x: x - 8, w: mouth + 16, y: 0, lock: 'metro' }));
      W.deco.push(stamp({ x: x - 8, y: 0, prop: 'metroGrate', w: mouth + 16, h: 70, gate: true, lock: 'metro' }));
      portal(x - 4, mouth + 30, rec.base - 90, -8, 'main', br.id);
      x += mouth;
      openGround(x);
      keep.seg = x;          // the pavement now resumes past the mouth, not before it
      /* the steps themselves belong to the metro: from the street you see the
         drawing above, from down here you run on these */
      place(br.id, 0, br.rooms[0]);
      x = mouthX;
      flight(n, run, 0, -1, br.rooms[0].pal);
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
    rec.base = STAIR_FIRST + n * STAIR_RISE;
    rec.overlap = run + 24;
    const x0 = x;
    W.deco.push(stamp({ x: x - 34, y: 0, prop: 'stairsUpSign', w: 104, h: 162, sign: true }));
    plat(x, STAIR_FIRST, first, STAIR_RISE, 'tread', false, { stair: true, pal: br.rooms[0].pal });
    anchor(x + first * 0.5, STAIR_FIRST + 36, 'stair', true);
    x += first;
    flight(n, run, STAIR_FIRST, 1, br.rooms[0].pal);
    rec.entryEndX = x;
    portal(x - 12, run * 2 + 140, rec.base - 80, rec.base + 280, 'main', br.id);
    /* the hallway underneath stays clear — the flight is right over it */
    const spent = x - x0;
    place(keep.l, keep.b, keep.r); segStart = keep.seg;
    x = x0;
    P.flat(spent / speed());
    return rec;
  }

  /** The way back up out of the metro, into the same street she left. */
  function closeMetro(z, rec) {
    /* she gets off the train back onto a platform, and climbs out from there —
       so the way up is dressed as the station, not as the carriage */
    const br = rec.br, room = br.rooms[0];
    const n = Math.ceil(-rec.base / STAIR_RISE);
    const run = Math.max(76, reachAt(x) * 0.15);
    const keep = { l: curLayer, b: curBase, r: curRoom, seg: segStart }, x0 = x;
    rec.exitStartX = x;
    W.deco.push(stamp({ x: x - 24, y: 0, prop: br.exitSign, w: n * run + 48, h: 104, sign: true }));
    place(br.id, 0, room);
    W.deco.push(stamp({ x: x + 8, y: rec.base, prop: 'trainDoor', w: 112, h: 196, gateway: true }));
    flight(n, run, rec.base, 1, room.pal);
    rec.exitEndX = x;
    /* The train went somewhere. Climbing out of it is what actually skips the
       street: the last treads hand her to a stop far down the line, near the
       finish — which is the whole point of hunting down the key. Only someone
       coming up these steps can trigger it; the street above cannot. */
    metroWarp = stamp({ x: x - run * 1.8, y: -60, w: run * 1.5, h: 210, toX: 0, toY: 0 });
    W.warps.push(metroWarp);
    portal(x + 8, 200, -70, 220, br.id, 'main');
    const spent = x - x0;
    place(keep.l, keep.b, keep.r); segStart = keep.seg;
    x = x0;
    P.flat(spent / speed());
  }

  /** The bed in the girl's room and the duct over it.

      The bed is never a hazard: run into it and she climbs it, land on it and
      it throws her at the ceiling, through the open hatch and into the duct.
      Up there nothing can hit her — she runs a few seconds in the dark, picks
      up the metro key, and drops back out of a louvre into the same room. The
      stretch of bedroom under the duct is left deliberately empty, so taking
      the duct and jumping the bed come out at exactly the same place. */
  function buildDuct(br, rec) {
    const base = rec.base, room = br.duct;
    const keep = { l: curLayer, b: curBase, r: curRoom, seg: segStart };
    P.flat(0.45);                       /* a clear run-up to it */
    const bx = x, bw = Math.round(reachAt(x) * 0.46), bh = 64;
    plat(bx, bh, bw, bh, 'bedBounce', false, { bounce: 1, soft: true });
    anchor(bx + bw * 0.5, bh + 78, 'bed', true);
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
    W.items.push(stamp({ x: bx + bw + dx(ventSec) * 0.55, y: ventBase + 40, kind: 'metroKey', got: false }));
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

  /** The rooms of a branch, laid out across the same span of track the main
      route covers, so both ways take the same number of seconds. */
  function buildBranch(z, rec) {
    const br = rec.br;
    const a2 = rec.entryEndX;
    const b2 = br.id === 'metro' ? rec.exitStartX : rec.x1;
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
                            prop: br.id === 'metro' ? 'trainDoor' : 'doorHouse' }));
      }
      /* a room has to read before it is dangerous, the same as a zone does —
         and she arrives in the first one straight off a flight of stairs */
      P.flat(ri === 0 ? 1.0 : 0.7);
      decorate(room, 1);
      if (room.id === 'girlroom' && br.duct) {
        fill(room, Math.max(0.3, (rx1 - x) / speed() * 0.36), { tail: 0.7 });
        buildDuct(br, rec);
      }
      fill(room, Math.max(0.3, (rx1 - x) / speed()), { tail: 0.7 });
      if (x < rx1) P.flat((rx1 - x) / speed());
      x = rx1;
      closeGround(x);
      cx = rx1;
    });
    if (br.id === 'metro') {
      /* the climb back out is platform again, not carriage */
      W.layers[rec.id].rooms.push({ x0: rec.exitStartX, x1: rec.exitEndX + 200, room: br.rooms[0] });
    }
    if (br.id === 'upstairs') {
      /* the way back down is the open window: she leaps out of it and lands in
         the yard, exactly where the ground-floor route comes out */
      W.deco.push(stamp({ x: b2 - 168, y: rec.base + 24, prop: br.exitProp, w: 128, h: 158, gateway: true }));
      portal(b2 - 10, 1000, rec.base - 760, rec.base - 60, rec.id, 'main');
    }
    segStart = keepSeg;
  }

  /* ---------- walk the whole track ---------- */
  openGround(0);
  ZONES.forEach((z, zi) => {
    curZone = z;
    place('main', 0, null);
    const zx0 = x;
    /* calm entry so the new place reads before it is dangerous */
    P.flat(zi === 0 ? 2.6 : 1.15);
    decorate(z, 1);

    const br = z.branch ? BRANCHES[z.branch] : null;
    const opts = { shortcut: ['yard1', 'park', 'mall', 'airport'].indexOf(z.id) >= 0, shortcutDone: false };
    let rec = null, budget = z.sec;

    if (br) {
      const t0 = x;
      fill(z, br.enterSec, { tail: 0.9 });
      P.flat(0.6);            /* clear ground on the approach to the stairs */
      rec = openBranch(z);
      P.flat(0.9);            /* and room to react after choosing to skip them */
      budget -= (x - t0) / speed();
    }
    if (br && br.id === 'metro') {
      const t1 = x;
      fill(z, br.sec, { tail: 1.2 });
      P.flat(0.55);
      closeMetro(z, rec);
      P.flat(0.9);
      budget -= (x - t1) / speed();
      rec.x1 = x;

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

    fill(z, budget, opts);
    P.flat(1.1);
    if (z.exit) {
      const gw = z.exit === 'jetbridge' ? 190 : z.exit === 'planeDoor' ? 110 : 118;
      const gh = z.exit === 'jetbridge' ? 190 : 205;
      W.deco.push(stamp({ x: x - gw - 40, y: 0, prop: z.exit, w: gw, h: gh, gateway: true }));
      P.flat(0.55);
    }
    if (br && br.id === 'upstairs') rec.x1 = x;
    W.zones.push({ zone: z, x0: zx0, x1: x });

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
  place('main', 0, null);
  curZone = ZONES[ZONES.length - 1];
  P.flat(1.6);
  W.finishX = x + 120;
  W.deco.push(stamp({ x: x, y: 0, prop: 'finish', w: 190, h: 210, finish: true }));
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
  const perZone = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2];  // = 15
  const pairs = [];
  function takeBone(a, extra) {
    a.taken = 1;
    const b = { x: a.x, y: a.y, kind: a.kind, zone: a.zone, layer: a.layer, got: false };
    if (extra) Object.assign(b, extra);
    W.bones.push(b);
    return b;
  }
  ZONES.forEach((z, zi) => {
    const mine = anchors.filter(a => a.zone === zi && a.layer === 'main');
    if (!mine.length) return;
    let want = perZone[zi] || 1;

    const L = z.branch ? W.layers[BRANCHES[z.branch].id] : null;
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
  /* keep them apart and exactly 15 */
  W.bones.sort((a, b) => a.x - b.x);
  for (let i = 1; i < W.bones.length; i++)
    if (!W.bones[i].fixed && W.bones[i].x - W.bones[i - 1].x < 2200) W.bones[i].x = W.bones[i - 1].x + 2200;
  while (W.bones.length > 15) {
    let k = W.bones.length - 1;
    while (k > 0 && W.bones[k].fixed) k--;
    W.bones.splice(k, 1);
  }
  const branchSpans = Object.keys(W.layers).filter(k => k !== 'main').map(k => W.layers[k]);
  const shared = a => branchSpans.every(L => a.x <= L.x0 || a.x >= L.x1);
  while (W.bones.length < 15) {
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
                   i: p.bone.i, got: false, twin: 1 });
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
                     i: b.i, got: false, twin: 1 });
    });
  }

  /* split ground at zone borders so every stretch gets its own floor style */
  const cuts = W.zones.map(z => z.x0).concat([W.totalX + 1]).sort((a, b) => a - b);
  const split = [], keepG = [];
  W.ground.forEach(g => {
    /* the bars over the metro are floor too, but floor that comes and goes —
       splitting them would throw the flag away */
    if (g.layer !== 'main' || g.lock) { keepG.push(g); return; }
    let x0 = g.x; const x1 = g.x + g.w;
    cuts.forEach(c => {
      if (c > x0 && c < x1) { split.push({ x: x0, w: c - x0, y: 0, layer: 'main' }); x0 = c; }
    });
    split.push({ x: x0, w: x1 - x0, y: 0, layer: 'main' });
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
