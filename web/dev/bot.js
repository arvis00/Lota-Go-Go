/* dev-only: a reflex bot that plays the track, to prove it is completable */
(function () {
  const W = () => Game.world;

  function topsAt(x) {
    const c = queryCells(W(), x, x), out = [];
    c.ground.forEach(g => { if (x >= g.x && x <= g.x + g.w) out.push(0); });
    c.platforms.forEach(p => { if (x >= p.x && x <= p.x + p.w) out.push(p.y); });
    return out;
  }

  function decide() {
    const L = Game.lota, v = speedAt(L.x);
    const front = L.x + LOTA.STAND_W / 2;
    const near = queryCells(W(), L.x - 120, L.x + v * 1.1 + 260);
    const react = v * 0.26;
    let jump = false, duck = false, overhead = false;

    near.hazards.forEach(h => {
      const d = h.x - front;
      if (h.kind === 'over') {
        if (d < v * 0.34 && L.x < h.x + h.w + 20) { duck = true; if (d < 10) overhead = true; }
      } else {
        if (d > -h.w && d < react && h.y <= L.y + 40 && h.y + h.h > L.y) jump = true;
      }
    });

    /* solid walls we must clear */
    near.platforms.forEach(p => {
      if (p.oneWay) return;
      const d = p.x - front;
      if (d > -6 && d < react && p.y > L.y + 12) jump = true;
    });

    /* the floor running out */
    if (L.grounded) {
      let edge = null;
      for (let dxp = 6; dxp < v * 0.5 + 200; dxp += 6) {
        const x = L.x + dxp;
        if (!topsAt(x).some(t => Math.abs(t - L.y) < 2.5)) { edge = x; break; }
      }
      if (edge !== null) {
        /* right past the lip: a lower floor means it is only a step down,
           nothing at all means it is a hole and we must jump */
        const stepDown = topsAt(edge + 10).some(t => t <= L.y + 2 && t > L.y - 150);
        if (!stepDown && edge - front < v * 0.20) jump = true;
      }
    }

    if (overhead) jump = false;
    Game.input.duckHeld = duck;
    if (jump && L.grounded && !duck) Game.input.jumpBuf = 0.15;
  }

  window.runBot = function (maxSec) {
    const setP = UI.setProgress, setB = UI.setBones, setZ = UI.setZone, tst = UI.toast, tut = UI.tut;
    UI.setProgress = UI.setBones = UI.setZone = UI.toast = UI.tut = function () {};
    const soundWas = Sfx.on; Sfx.on = false;
    Game.startRun();
    const dt = 1 / 120; let t = 0, frame = 0;
    const every = window.BOT_EVERY || 1;
    const trail = [];
    while (t < (maxSec || 400) && Game.state === 'run') {
      if (frame % every === 0) decide();
      frame++;
      Game.step(dt);
      t += dt;
      if (trail.length === 0 || Game.lota.x - trail[trail.length - 1] > 2000) trail.push(Math.round(Game.lota.x));
    }
    const out = {
      state: Game.state, x: Math.round(Game.lota.x), finishX: Math.round(Game.world.finishX),
      pct: (Game.lota.x / Game.world.finishX * 100).toFixed(1) + '%',
      bones: Game.run.bones, reason: Game.crashReason || null,
      zone: Game.zoneAt(Game.lota.x).zone.name, seconds: Math.round(t)
    };
    UI.setProgress = setP; UI.setBones = setB; UI.setZone = setZ; UI.toast = tst; UI.tut = tut;
    Sfx.on = soundWas;
    return out;
  };

  /* what is around a given x — for diagnosing a death */
  window.inspect = function (x, r) {
    r = r || 400;
    const c = queryCells(W(), x - r, x + r);
    return {
      hazards: c.hazards.filter(h => h.x > x - r && h.x < x + r).map(h => [h.prop, Math.round(h.x), Math.round(h.y), Math.round(h.w), Math.round(h.h), h.kind]),
      platforms: c.platforms.filter(p => p.x + p.w > x - r && p.x < x + r).map(p => [p.prop || (p.pit ? 'PIT' : '?'), Math.round(p.x), Math.round(p.y), Math.round(p.w), p.oneWay ? 'oneway' : 'solid']),
      ground: c.ground.filter(g => g.x + g.w > x - r && g.x < x + r).map(g => [Math.round(g.x), Math.round(g.w)])
    };
  };
})();
