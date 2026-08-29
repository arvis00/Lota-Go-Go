/* dev-only: a reflex bot that plays the track, to prove it is completable.
   `BOT_TAKE` chooses which way it goes where a place offers two routes:
   { metro: true, upstairs: false } is what a player who does nothing gets. */
(function () {
  const W = () => Game.world;
  const LY = () => Game.lota.layer;

  function topsAt(x) {
    const c = queryCells(W(), x, x), out = [], ly = LY();
    /* the bars over the metro stop being floor the moment she has the key */
    c.ground.forEach(g => {
      if (g.lock && Game.run.metroKey) return;
      if (g.layer === ly && x >= g.x && x <= g.x + g.w) out.push(g.y);
    });
    c.platforms.forEach(p => { if (p.layer === ly && x >= p.x && x <= p.x + p.w) out.push(p.y); });
    /* every obstacle top is standable now, hanging ones included */
    c.hazards.forEach(h => { if (h.layer === ly && x >= h.x && x <= h.x + h.w) out.push(h.y + h.h); });
    return out;
  }

  function decide() {
    const L = Game.lota, v = speedAt(L.x), ly = L.layer;
    const take = window.BOT_TAKE || { metro: true, upstairs: false };
    const front = L.x + LOTA.STAND_W / 2;
    const near = queryCells(W(), L.x - 120, L.x + v * 1.1 + 300);
    const react = v * 0.26;
    let jump = false, duck = false, overhead = false;

    near.hazards.forEach(h => {
      if (h.layer !== ly) return;
      const d = h.x - front;
      /* a gull is ducked exactly like anything else hanging in her lane —
         she just cannot land on top of this one */
      if (h.kind === 'over' || h.kind === 'bird') {
        if (d < v * 0.34 && L.x < h.x + h.w + 20) { duck = true; if (d < 10) overhead = true; }
      } else {
        if (d > -h.w && d < react && h.y <= L.y + 40 && h.y + h.h > L.y) jump = true;
      }
    });

    /* solid walls we must clear — stairs are never one of them */
    near.platforms.forEach(p => {
      if (p.layer !== ly || p.oneWay || p.stair) return;
      const d = p.x - front;
      if (d > -6 && d < react && p.y > L.y + 12) jump = true;
    });

    /* the way up: land on the bottom treads of a flight that starts overhead */
    if (take.upstairs && L.grounded) {
      near.platforms.forEach(p => {
        if (p.layer !== ly || !p.stair) return;
        const d = p.x - front;
        if (p.y - L.y > 60 && d > 90 && d < 210) jump = true;
      });
    }

    /* the mouth of the stairs down: with the key in hand doing nothing takes
       them, jumping stays up. Only ever on the street — off the end of the
       duct there is nothing to decide, she is meant to fall. */
    /* the mouth of a way down: doing nothing takes it, jumping stays up */
    const takeDown = take.down !== undefined ? take.down : take.metro;
    if (!takeDown && L.grounded && ly === 'main' && !inDive(L.x)) {
      let edge = null;
      for (let dxp = 6; dxp < v * 0.5 + 200; dxp += 6) {
        const x = L.x + dxp;
        if (!topsAt(x).some(t => Math.abs(t - L.y) < 2.5)) { edge = x; break; }
      }
      if (edge !== null && edge - front < v * 0.20) jump = true;
    }

    if (overhead) jump = false;
    Game.input.duckHeld = duck;
    if (jump && !duck) Game.input.jumpBuf = 0.15;   // jump buffer fires it on landing
  }

  /* off the end of the pier the deck genuinely stops, and that is the point:
     the bot must not treat it as an edge to jump */
  function inDive(x) {
    const d = W().dives || [];
    for (let i = 0; i < d.length; i++) if (x > d[i].x0 - 900 && x < d[i].x1) return true;
    return false;
  }

  window.botDecide = decide;

  window.runBot = function (maxSec) {
    const setP = UI.setProgress, setB = UI.setBones, setZ = UI.setZone, tst = UI.toast, tut = UI.tut;
    UI.setProgress = UI.setBones = UI.setZone = UI.toast = UI.tut = function () {};
    const soundWas = Sfx.on; Sfx.on = false;
    Game.startRun(false, window.BOT_LEVEL || 1);
    const dt = 1 / 120; let t = 0, frame = 0;
    const every = window.BOT_EVERY || 1;
    const seen = {};
    while (t < (maxSec || 400) && Game.state === 'run') {
      if (frame % every === 0) decide();
      frame++;
      Game.step(dt);
      Game.stepFx(dt);      /* the wipe lives here — without it no shortcut ever
                               actually teleports and the bot runs the long way */
      t += dt;
      seen[Game.lota.layer] = (seen[Game.lota.layer] || 0) + 1;
    }
    const out = {
      state: Game.state, x: Math.round(Game.lota.x), finishX: Math.round(Game.world.finishX),
      pct: (Game.lota.x / Game.world.finishX * 100).toFixed(1) + '%',
      level: Game.run.level, treats: Game.run.bones + ' / ' + Game.world.treats,
      reason: Game.state === 'crash' || Game.state === 'over' ? (Game.crashReason || 'hit') : null,
      zone: Game.zoneAt(Game.lota.x).zone.name, layer: Game.lota.layer,
      routes: Object.keys(seen).map(k => k + ':' + (seen[k] / 120).toFixed(1) + 's').join(' '),
      seconds: Math.round(t)
    };
    UI.setProgress = setP; UI.setBones = setB; UI.setZone = setZ; UI.toast = tst; UI.tut = tut;
    Sfx.on = soundWas;
    return out;
  };

  /* what is around a given x — for diagnosing a death */
  window.inspect = function (x, r) {
    r = r || 400;
    const c = queryCells(W(), x - r, x + r);
    const near = (o, w) => o.x + (w || 0) > x - r && o.x < x + r;
    return {
      hazards: c.hazards.filter(h => near(h, h.w)).map(h => [h.layer, h.prop, Math.round(h.x), Math.round(h.y), Math.round(h.w), Math.round(h.h), h.kind]),
      platforms: c.platforms.filter(p => near(p, p.w)).map(p => [p.layer, p.prop + (p.stair ? '/stair' : ''), Math.round(p.x), Math.round(p.y), Math.round(p.w), p.oneWay ? 'oneway' : 'solid']),
      ground: c.ground.filter(g => near(g, g.w)).map(g => [g.layer, Math.round(g.x), Math.round(g.w), Math.round(g.y)]),
      portals: c.portals.filter(p => near(p, p.w)).map(p => [p.from + '->' + p.to, Math.round(p.x), Math.round(p.w)])
    };
  };
})();
