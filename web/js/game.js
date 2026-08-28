'use strict';
/* ---------------------------------------------------------------
   game.js — engine: view, input, physics, camera, rendering
----------------------------------------------------------------*/
const Game = {
  cv: null, ctx: null,
  cw: 0, ch: 0, VW: 960, VH: 540, scale: 1, ox: 0, oy: 0, dpr: 1,
  groundY: 410,
  state: 'boot',          // boot | lobby | run | crash | over | win | pause
  world: null,
  t: 0, last: 0, stateT: 0,
  portrait: false,

  lota: null,
  cam: { x: 0, y: 0 },
  input: { jumpBuf: 0, duckHeld: false, duckTimer: 0, coyote: 0 },
  fx: { dust: [], confetti: [], sparks: [], shake: 0, flash: 0, warp: 0,
        layerFade: 0, fromLayer: 'main', fromX: 0 },
  run: null,

  /* ================= setup ================= */
  init() {
    this.cv = document.getElementById('game');
    this.ctx = this.cv.getContext('2d', { alpha: false });
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
    this.bindInput();
    this.world = buildWorld();
    this.lobby();
    this.last = performance.now();
    requestAnimationFrame(ts => this.frame(ts));
  },

  resize() {
    /* a zero-sized window (a hidden tab, a pane being restored) used to make
       VW NaN and take the whole renderer down with it */
    const cw = Math.max(1, window.innerWidth || 1), ch = Math.max(1, window.innerHeight || 1);
    this.cw = cw; this.ch = ch;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.cv.width = Math.round(cw * this.dpr);
    this.cv.height = Math.round(ch * this.dpr);
    const aspect = cw / ch;
    this.portrait = aspect < 1.15;
    this.VH = 540;
    this.VW = clamp(540 * aspect, 700, 1240);
    this.scale = Math.min(cw / this.VW, ch / this.VH);
    this.ox = (cw - this.VW * this.scale) / 2;
    this.oy = (ch - this.VH * this.scale) / 2;
    this.groundY = Math.round(this.VH * 0.76);
  },

  /* ================= input ================= */
  bindInput() {
    const jump = () => this.onJump();
    const duckOn = () => this.onDuck(true);
    const duckOff = () => this.onDuck(false);

    window.addEventListener('keydown', e => {
      if (e.repeat) return;
      const k = e.code;
      if (k === 'ArrowUp' || k === 'KeyW' || k === 'Space') { e.preventDefault(); jump(); }
      else if (k === 'ArrowDown' || k === 'KeyS') { e.preventDefault(); duckOn(); }
      else if (k === 'Escape' || k === 'KeyP') { if (this.state === 'run') UI.pause(); else if (this.state === 'pause') UI.resume(); }
    }, { passive: false });
    window.addEventListener('keyup', e => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') duckOff();
    });

    /* touch / mouse swipes on the canvas */
    let sx = 0, sy = 0, st = 0, fired = false, active = false;
    const start = (x, y) => { sx = x; sy = y; st = performance.now(); fired = false; active = true; };
    const move = (x, y) => {
      if (!active || fired) return;
      const dx = x - sx, dy = y - sy;
      if (dy < -26 && Math.abs(dy) > Math.abs(dx) * 0.8) { jump(); fired = true; }
      else if (dy > 26 && Math.abs(dy) > Math.abs(dx) * 0.8) { duckOn(); fired = true; }
    };
    const end = () => {
      if (!active) return;
      active = false;
      if (!fired && performance.now() - st < 320) jump();   // a tap also jumps
      duckOff();
    };
    const el = document.getElementById('app');
    const onMenu = e => !!(e.target.closest && (e.target.closest('button') || e.target.closest('.screen')));
    el.addEventListener('touchstart', e => {
      if (onMenu(e)) return;
      const tch = e.changedTouches[0]; start(tch.clientX, tch.clientY);
      if (this.state === 'run') e.preventDefault();
    }, { passive: false });
    el.addEventListener('touchmove', e => {
      if (onMenu(e)) return;
      const tch = e.changedTouches[0]; move(tch.clientX, tch.clientY);
      if (this.state === 'run') e.preventDefault();
    }, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    this.cv.addEventListener('mousedown', e => start(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => move(e.clientX, e.clientY));
    window.addEventListener('mouseup', end);

    /* on-screen arrows — the only controls on a phone that never need a swipe */
    const hold = (el, on, off) => {
      if (!el) return;
      el.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        el.classList.add('on'); el.setPointerCapture && el.setPointerCapture(e.pointerId);
        on();
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(k =>
        el.addEventListener(k, e => {
          e.preventDefault(); el.classList.remove('on'); if (off) off();
        }));
      el.addEventListener('contextmenu', e => e.preventDefault());
    };
    hold(document.getElementById('btnUp'), jump);
    hold(document.getElementById('btnDown'), () => duckOn(), () => duckOff());

    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      document.body.classList.add('touch');
      const tu = document.getElementById('tutUp'), td = document.getElementById('tutDown');
      if (tu) tu.textContent = '▲  arba  swipe ↑';
      if (td) td.textContent = '▼  arba  swipe ↓';
    }
  },

  onJump() {
    Sfx.init(); Sfx.resume();
    if (this.state !== 'run') return;
    this.input.jumpBuf = 0.14;
  },
  onDuck(on) {
    if (this.state !== 'run') return;
    this.input.duckHeld = on;
    if (on) { this.input.duckTimer = 0.55; if (this.lota && this.lota.grounded) Sfx.duck(); }
  },

  /* ================= run lifecycle ================= */
  lobby() {
    this.state = 'lobby'; this.stateT = 0;
    this.fx.confetti.length = 0;
    UI.showLobby();
  },

  startRun(fromCheckpoint) {
    const cp = fromCheckpoint && this.checkpoint ? this.checkpoint : null;
    if (cp) {
      /* keep the treats picked up before the checkpoint, hand back the rest */
      const kept = new Set(cp.bones);
      this.world.bones.forEach(b => { b.got = kept.has(b.i); });
      this.world.warps.forEach(w => { if (w.x >= cp.x) w.used = false; });
      this.run.bones = cp.count;
      this.run.zoneIdx = -1;
      this.run.finished = false;
      this.run.warpTo = null;
      this.run.deaths++;
    } else {
      this.world.bones.forEach(b => { b.got = false; });
      this.world.warps.forEach(w => { w.used = false; });
      this.run = { bones: 0, zoneIdx: -1, dist: 0, time: 0, shortcuts: 0,
                   finished: false, warpTo: null, deaths: 0, banked: false };
      this.checkpoint = { x: 60, zoneIdx: 0, count: 0, bones: [], name: ZONES[0].name, start: true };
    }
    const sx = cp ? cp.x : 60;
    this.lota = {
      x: sx, y: 0, vy: 0, grounded: true, duck: false, runPhase: 0,
      state: 'run', dead: false, sitT: 0, alpha: 1, layer: 'main'
    };
    this.cam.x = sx - this.VW * 0.30; this.cam.y = 0;
    this.input.jumpBuf = 0; this.input.duckHeld = false; this.input.duckTimer = 0; this.input.coyote = 0;
    this.fx.dust.length = 0; this.fx.confetti.length = 0; this.fx.sparks.length = 0;
    this.fx.shake = 0; this.fx.flash = 0; this.fx.warp = 0;
    this.fx.layerFade = 0; this.fx.fromLayer = 'main'; this.fx.fromX = sx;
    this.state = 'run'; this.stateT = 0;
    UI.showHud();
    UI.setBones(this.run.bones);
    UI.toast(cp && !cp.start ? cp.name : 'Pirmyn, Lota!', cp && !cp.start ? 'nuo kontrolinio taško' : '');
    if (!cp) { UI.tut(true); setTimeout(() => UI.tut(false), 4200); }
  },

  setCheckpoint(idx) {
    const z = this.world.zones[idx];
    this.checkpoint = {
      x: z.x0 + 24, zoneIdx: idx, name: z.zone.name, start: idx === 0,
      bones: this.world.bones.filter(b => b.got).map(b => b.i),
      count: this.run.bones
    };
    if (idx === 0) return;
    Sfx.checkpoint();
    this.fx.flash = 0.5;
    for (let k = 0; k < 22; k++) this.fx.sparks.push({
      x: z.x0 + 24 + (Math.random() - .5) * 40, y: 60 + Math.random() * 90,
      vx: (Math.random() - .5) * 150, vy: 40 + Math.random() * 190,
      life: .8, c: k % 2 ? '#ffd870' : '#fff6d8'
    });
  },

  crash(reason) {
    if (this.state !== 'run') return;
    Sfx.crash();
    this.state = 'crash'; this.stateT = 0;
    this.lota.dead = true; this.lota.state = 'sit'; this.lota.sitT = 0;
    this.fx.shake = 0.5;
    this.crashReason = reason;
    if (reason !== 'fall') { this.lota.y = this.lota.landY != null ? this.lota.landY : this.lota.y; }
  },

  finish() {
    if (this.run.finished) return;
    this.run.finished = true;
    Sfx.win();
    for (let i = 0; i < 130; i++) this.fx.confetti.push({
      x: Math.random() * this.VW, y: -Math.random() * 300,
      vx: (Math.random() - 0.5) * 90, vy: 90 + Math.random() * 180,
      r: Math.random() * TAU, vr: (Math.random() - 0.5) * 9,
      w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
      c: ['#ffd870', '#ff8fd0', '#8fd6ff', '#a6e88f', '#ffffff'][i % 5]
    });
    this.state = 'win'; this.stateT = 0;
  },

  /* ================= main loop ================= */
  frame(ts) {
    let dt = (ts - this.last) / 1000;
    this.last = ts;
    if (dt > 0.06) dt = 0.06;
    this.t += dt;
    this.stateT += dt;

    if (this.state === 'run') this.step(dt);
    else if (this.state === 'crash') {
      this.stepDeath(dt);
      if (this.stateT > 1.0) { this.state = 'over'; UI.showOver(); }
    } else if (this.state === 'win') {
      this.stepWin(dt);
      if (this.stateT > 1.7 && !UI.winShown) UI.showWin();
    }
    this.stepFx(dt);
    /* one bad colour used to throw out of render() and, because the next frame
       was requested after it, silently freeze the whole game mid-run */
    try { this.render(dt); }
    catch (e) { if (!this.drawErr) { this.drawErr = 1; console.error('Lota Go: piešimo klaida', e); } }
    requestAnimationFrame(t2 => this.frame(t2));
  },

  /* ---------- simulation ---------- */
  /** The height of the floor on a given route. Everything vertical — the
      camera, the safety net, what counts as "the ground" — is measured from
      here, so the metro and the upstairs behave exactly like the street. */
  layerBase(id) {
    const l = this.world.layers[id];
    return l ? l.base : 0;
  },
  switchLayer(to) {
    const L = this.lota;
    if (L.layer === to) return;
    this.fx.fromLayer = L.layer;
    this.fx.fromX = L.x;
    this.fx.layerFade = 1;
    L.layer = to;
  },

  step(dt) {
    const L = this.lota, W = this.world, I = this.input;
    const SUB = Math.ceil(dt / (1 / 240));
    const h = dt / SUB;
    this.run.time += dt;

    I.jumpBuf = Math.max(0, I.jumpBuf - dt);
    if (I.duckTimer > 0) I.duckTimer -= dt;

    for (let s = 0; s < SUB && this.state === 'run'; s++) {
      const v = speedAt(L.x);
      const near = queryCells(W, L.x - 260, L.x + 420);

      /* --- ducking: only ever because the player asked for it --- */
      L.duck = (I.duckHeld || I.duckTimer > 0) && L.grounded;

      /* --- jump --- */
      if (I.jumpBuf > 0 && (L.grounded || I.coyote > 0) && !L.duck) {
        L.vy = PHYS.JUMP_V; L.grounded = false; I.coyote = 0; I.jumpBuf = 0;
        Sfx.jump();
        this.puff(L.x - 10, L.y, 5);
      }
      I.coyote = Math.max(0, I.coyote - h);

      /* --- integrate --- */
      L.x += v * h;
      const g = PHYS.GRAV * ((!L.grounded && (I.duckHeld || I.duckTimer > 0) && L.vy < 60) ? 1.85 : 1);
      const prevY = L.y;
      if (!L.grounded) { L.vy -= g * h; L.y += L.vy * h; }

      /* --- which route is she on? The stairs hand her over. --- */
      const pb = this.box(L);
      for (let i = 0; i < near.portals.length; i++) {
        const p = near.portals[i];
        if (p.from !== L.layer) continue;
        if (pb.x1 <= p.x || pb.x0 >= p.x + p.w) continue;
        if (pb.y1 <= p.y0 || pb.y0 >= p.y1) continue;
        this.switchLayer(p.to);
        break;
      }
      const LY = L.layer;

      /* --- land on surfaces --- */
      const box = this.box(L);
      let bestTop = null;
      const consider = surf => {
        if (surf.x > box.x1 - 3 || surf.x + surf.w < box.x0 + 3) return;
        const top = surf.top;
        if (L.vy > 0) return;
        if (prevY >= top - 1.2 && L.y <= top + 0.5) {
          if (bestTop === null || top > bestTop) bestTop = top;
        }
      };
      near.ground.forEach(gd => { if (gd.layer === LY) consider({ x: gd.x, w: gd.w, top: gd.y }); });
      near.platforms.forEach(p => { if (p.layer === LY) consider({ x: p.x, w: p.w, top: p.y }); });
      near.hazards.forEach(hz => { if (hz.layer === LY) consider({ x: hz.x, w: hz.w, top: hz.y + hz.h }); });
      if (bestTop !== null) {
        if (!L.grounded && L.vy < -180) { Sfx.land(); this.puff(L.x - 6, bestTop, 4); }
        L.y = bestTop; L.vy = 0; L.grounded = true; L.landY = bestTop;
      } else if (L.grounded) {
        /* still supported? */
        let sup = false;
        const chk = surf => {
          if (surf.x > box.x1 - 3 || surf.x + surf.w < box.x0 + 3) return;
          if (Math.abs(surf.top - L.y) < 1.2) sup = true;
        };
        near.ground.forEach(gd => { if (gd.layer === LY) chk({ x: gd.x, w: gd.w, top: gd.y }); });
        near.platforms.forEach(p => { if (p.layer === LY) chk({ x: p.x, w: p.w, top: p.y }); });
        near.hazards.forEach(hz => { if (hz.layer === LY) chk({ x: hz.x, w: hz.w, top: hz.y + hz.h }); });
        if (!sup) { L.grounded = false; I.coyote = 0.10; L.vy = 0; }
      }

      /* --- stairs are stairs: a riser one step high she simply runs up, and a
         flight is never something she can die on. That is what makes taking
         the metro or going upstairs a choice rather than a hazard. --- */
      const bs = this.box(L);
      let stairTop = null;
      near.platforms.forEach(p => {
        if (p.layer !== LY || !p.stair) return;
        if (bs.x1 - 5 <= p.x || bs.x0 + 5 >= p.x + p.w) return;
        if (bs.y1 <= p.y - p.h + 1 || bs.y0 >= p.y) return;
        const rise = p.y - L.y;
        if (rise > 0 && rise <= STAIR_UP && (stairTop === null || p.y > stairTop)) stairTop = p.y;
      });
      if (stairTop !== null) { L.y = stairTop; L.vy = 0; L.grounded = true; L.landY = stairTop; }

      /* --- running into the FACE of something solid: platform walls, the wall
         after a step down, and the side of a ground obstacle. Clipping the very
         top edge scrambles her up instead of killing her. --- */
      const b2 = this.box(L);
      let wallTop = null, wallGrab = 0;
      const face = (top, grab) => {
        if (L.y >= top - 2.5) return;                 // she is already on top of it
        if (wallTop === null || top > wallTop) { wallTop = top; wallGrab = grab; }
      };
      near.platforms.forEach(p => {
        if (p.layer !== LY || p.oneWay || p.stair) return;
        if (b2.x1 - 5 <= p.x || b2.x0 + 5 >= p.x + p.w) return;
        /* a block is a wall only where its body actually is: a tread hanging
           overhead is something she runs under, not into */
        if (b2.y1 <= p.y - (p.h || 0) + 1 || b2.y0 >= p.y) return;
        face(p.y, GRAB);
      });
      near.ground.forEach(gd => {
        if (gd.layer !== LY) return;
        if (b2.x1 - 5 <= gd.x || b2.x0 + 5 >= gd.x + gd.w) return;
        face(gd.y, GRAB);
      });
      near.hazards.forEach(hz => {
        if (hz.layer !== LY) return;
        if (b2.x1 - 6 <= hz.x || b2.x0 + 6 >= hz.x + hz.w) return;
        const top = hz.y + hz.h;
        if (hz.kind !== 'over') { face(top, GRAB); return; }
        /* a hanging thing has no face down at floor level — she runs under it.
           Only a jump that gets her near its top edge counts, and that puts her
           up on top of it rather than killing her. */
        if (L.y > hz.y && top - L.y <= GRAB_OVER) face(top, GRAB_OVER);
      });
      if (wallTop !== null) {
        /* On her feet and running straight into it — that is a crash, whatever
           its height. In the air she jumped at it, so she scrambles up on top
           instead: a jump is never what kills her. Still falling counts only
           within reach. */
        const canGrab = !L.grounded && (L.vy > 0 || wallTop - L.y <= wallGrab) && L.vy > -760;
        if (canGrab) {
          L.y = wallTop; L.vy = 0; L.grounded = true; L.landY = wallTop;
          this.puff(L.x - 8, wallTop, 3);
        } else { this.crash('wall'); return; }
      }

      /* --- running into a hanging thing at head height still kills: that is what
         the duck is for. Read the box again — a scramble may have just lifted
         her onto the very thing we are about to test. --- */
      const b3 = this.box(L);
      let hit = null;
      near.hazards.forEach(hz => {
        if (hit || hz.kind !== 'over' || hz.layer !== LY) return;
        if (b3.x1 - 7 <= hz.x || b3.x0 + 7 >= hz.x + hz.w) return;
        if (b3.y1 - 5 <= hz.y || b3.y0 + 4 >= hz.y + hz.h) return;
        hit = hz;
      });
      if (hit) { this.crash('hit'); return; }

      /* --- shortcuts --- */
      near.warps.forEach(wp => {
        if (wp.used || !wp.toX) return;
        if (b3.x1 <= wp.x || b3.x0 >= wp.x + wp.w) return;
        if (b3.y1 <= wp.y || b3.y0 >= wp.y + wp.h) return;
        wp.used = true;
        this.run.shortcuts++;
        this.fx.warp = 0.42;
        this.run.warpTo = { x: wp.toX, y: wp.toY };
        Sfx.warp();
        UI.toast('Trumpinys!');
      });

      /* --- treats. A treat that sits on both routes is one treat: picking up
         either copy claims it, so 15 stays 15 whichever way she came. --- */
      near.bones.forEach(bn => {
        if (bn.got || bn.layer !== LY) return;
        const cx = L.x, cy = L.y + (L.duck ? LOTA.DUCK_H : LOTA.STAND_H) * 0.5;
        if (Math.abs(bn.x - cx) < 44 && Math.abs(bn.y - cy) < 66) {
          W.bones.forEach(o => { if (o.i === bn.i) o.got = true; });
          this.run.bones++;
          Sfx.bone();
          for (let k = 0; k < 10; k++) this.fx.sparks.push({
            x: bn.x, y: bn.y, vx: (Math.random() - .5) * 160, vy: 60 + Math.random() * 160, life: .55, c: '#ffe8a8'
          });
          UI.setBones(this.run.bones);
        }
      });

      /* --- safety net. There are no holes to fall down any more, so this only
         ever fires if the world itself went wrong. --- */
      if (L.y < this.layerBase(LY) - 460) { this.crash('fall'); return; }

      /* --- finish --- */
      if (L.x >= W.finishX) { this.finish(); return; }
    }

    /* warp teleport once the wipe has covered the screen */
    if (this.run.warpTo && this.fx.warp < 0.21) {
      L.x = this.run.warpTo.x; L.y = 0; L.vy = 0; L.grounded = true;
      L.layer = 'main';
      this.cam.x = L.x - this.VW * 0.30;
      this.run.warpTo = null;
    }

    /* animation state */
    L.runPhase += dt * (12 + speedAt(L.x) * 0.019);
    L.state = !L.grounded ? (L.vy > 0 ? 'jump' : 'fall') : (L.duck ? 'duck' : 'run');

    this.updateCam(dt);
    this.updateZone();
    this.run.dist = L.x;
    UI.setProgress(clamp(L.x / this.world.finishX, 0, 1));
  },

  stepDeath(dt) {
    const L = this.lota;
    if (this.crashReason === 'fall') { L.vy -= PHYS.GRAV * dt * 0.5; L.y += L.vy * dt; }
    L.sitT += dt;
    this.updateCam(dt * 0.6);
  },

  stepWin(dt) {
    const L = this.lota;
    L.x += speedAt(L.x) * dt * 0.7;
    L.runPhase += dt * 16;
    L.state = 'run';
    if (!L.grounded) { L.vy -= PHYS.GRAV * dt; L.y += L.vy * dt; if (L.y <= 0) { L.y = 0; L.vy = 0; L.grounded = true; } }
    this.updateCam(dt);
  },

  box(L) {
    const w = L.duck ? LOTA.DUCK_W : LOTA.STAND_W;
    const h = L.duck ? LOTA.DUCK_H : LOTA.STAND_H;
    return { x0: L.x - w / 2, x1: L.x + w / 2, y0: L.y, y1: L.y + h };
  },

  updateCam(dt) {
    const L = this.lota;
    const base = this.layerBase(L.layer);
    const tx = L.x - this.VW * 0.30;
    const ty = base + clamp((L.y - base) * 0.6, -70, 170);
    this.cam.x = lerp(this.cam.x, tx, 1 - Math.pow(0.0001, dt));
    this.cam.y = lerp(this.cam.y, ty, 1 - Math.pow(0.004, dt));
    if (this.state === 'run') this.cam.x = Math.max(this.cam.x, tx - 40);
    /* Whatever the stairs are doing to her height, she stays on screen. */
    const feet = this.groundY - (L.y - this.cam.y);
    const head = this.groundY - (L.y + LOTA.STAND_H - this.cam.y);
    const bot = this.VH * 0.84, top = this.VH * 0.17;
    if (feet > bot) this.cam.y -= (feet - bot);
    else if (head < top) this.cam.y += (top - head);
  },

  updateZone() {
    const zs = this.world.zones;
    let idx = 0;
    for (let i = 0; i < zs.length; i++) if (this.lota.x >= zs[i].x0) idx = i;
    if (idx !== this.run.zoneIdx) {
      const resumed = this.run.zoneIdx < 0;
      this.run.zoneIdx = idx;
      UI.setZone(zs[idx].zone.name);
      /* only a place she has never reached before plants a new checkpoint */
      if (idx > this.checkpoint.zoneIdx) {
        this.setCheckpoint(idx);
        if (idx > 0) UI.toast(zs[idx].zone.name, '✓ KONTROLINIS TAŠKAS');
      } else if (!resumed && idx > 0) {
        Sfx.zone(); UI.toast(zs[idx].zone.name, '');
      }
    }
  },

  zoneAt(x) {
    const zs = this.world.zones;
    for (let i = zs.length - 1; i >= 0; i--) if (x >= zs[i].x0) return zs[i];
    return zs[0];
  },

  /* ---------- particles ---------- */
  puff(x, y, n) {
    for (let i = 0; i < n; i++) this.fx.dust.push({
      x: x, y: y, vx: -40 - Math.random() * 90, vy: 20 + Math.random() * 70,
      r: 4 + Math.random() * 7, life: 0.42
    });
  },
  stepFx(dt) {
    const f = this.fx;
    for (let i = f.dust.length - 1; i >= 0; i--) {
      const p = f.dust[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 120 * dt;
      if (p.life <= 0) f.dust.splice(i, 1);
    }
    for (let i = f.sparks.length - 1; i >= 0; i--) {
      const p = f.sparks[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 420 * dt;
      if (p.life <= 0) f.sparks.splice(i, 1);
    }
    for (let i = f.confetti.length - 1; i >= 0; i--) {
      const c = f.confetti[i]; c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt; c.vy += 40 * dt;
      if (c.y > this.VH + 40) f.confetti.splice(i, 1);
    }
    f.layerFade = Math.max(0, f.layerFade - dt * 2.4);
    f.shake = Math.max(0, f.shake - dt * 1.6);
    f.flash = Math.max(0, f.flash - dt * 2.2);
    f.warp = Math.max(0, f.warp - dt);
  },

  /* ================= rendering ================= */
  sx(wx) { return wx - this.cam.x; },
  sy(wy) { return this.groundY - (wy - this.cam.y); },

  render(dt) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const bg = ctx.createRadialGradient(this.cw / 2, this.ch / 2, 0, this.cw / 2, this.ch / 2, Math.max(this.cw, this.ch) * 0.7);
    bg.addColorStop(0, '#241a3d'); bg.addColorStop(1, '#0d0a16');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.cw, this.ch);
    ctx.save();
    ctx.translate(this.ox * this.dpr / this.dpr, this.oy);
    ctx.setTransform(this.dpr * this.scale, 0, 0, this.dpr * this.scale, this.ox * this.dpr, this.oy * this.dpr);

    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, this.VW, this.VH); ctx.clip();

    if (this.fx.shake > 0) {
      const s = this.fx.shake * 9;
      ctx.translate((Math.random() - .5) * s, (Math.random() - .5) * s);
    }

    if (this.state === 'lobby') this.renderLobby();
    else this.renderWorld();

    ctx.restore();
    ctx.restore();
  },

  /* which palette and floor an object belongs to: a room on a branch carries
     its own, everything else takes them from its zone */
  palOf(o) { return o.pal || (ZONES[o.zone] || ZONES[0]).pal; },
  floorOf(o) { return o.floor || (ZONES[o.zone] || ZONES[0]).floor; },

  /** The place behind her: a zone on the street, or a room on a branch. */
  drawPlaceBg(layerId, atX) {
    const ctx = this.ctx, W = this.world, VW = this.VW, VH = this.VH;
    const lay = W.layers[layerId];
    if (layerId === 'main' || !lay || !lay.rooms.length) {
      const zs = W.zones;
      let zi = 0;
      for (let i = 0; i < zs.length; i++) if (atX >= zs[i].x0 - 200) zi = i;
      const z = zs[zi].zone;
      z.bg(ctx, VW, VH, this.cam.x, this.sy(0), this.t, z.pal);
      if (zi + 1 < zs.length) {
        const fade = inv(atX, zs[zi].x1 - 420, zs[zi].x1 + 60);
        if (fade > 0) {
          ctx.save(); ctx.globalAlpha = fade;
          const nz = zs[zi + 1].zone;
          nz.bg(ctx, VW, VH, this.cam.x, this.sy(0), this.t, nz.pal);
          ctx.restore();
        }
      }
      return;
    }
    let rm = lay.rooms[0];
    for (let i = 0; i < lay.rooms.length; i++) if (atX >= lay.rooms[i].x0) rm = lay.rooms[i];
    rm.room.bg(ctx, VW, VH, this.cam.x, this.sy(lay.base), this.t, rm.room.pal);
  },

  renderWorld() {
    const ctx = this.ctx, W = this.world, VW = this.VW, VH = this.VH;
    const camX = this.cam.x;
    const L = this.lota;
    const LY = L ? L.layer : 'main';

    /* ---- background, with a soft crossfade between places ---- */
    this.drawPlaceBg(LY, L ? L.x : 0);
    if (this.fx.layerFade > 0) {
      ctx.save(); ctx.globalAlpha = clamp(this.fx.layerFade, 0, 1);
      this.drawPlaceBg(this.fx.fromLayer, this.fx.fromX);
      ctx.restore();
    }

    const near = queryCells(W, camX - 260, camX + VW + 300);
    const mine = o => o.layer === LY;

    /* ---- the doorway into the next place ---- */
    near.deco.forEach(d => {
      if (!d.gateway || !mine(d)) return;
      drawProp(ctx, d.prop, this.sx(d.x), this.sy(d.y + d.h), d.w, d.h, this.t, this.palOf(d), d.x,
               { role: 'gateway', floorY: this.sy(d.y) });
    });

    /* ---- the stairwell down to the metro: steps, not a hole ---- */
    near.deco.forEach(d => {
      if (!d.shaft || !mine(d)) return;
      drawProp(ctx, d.prop, this.sx(d.x), this.sy(d.y), d.w, d.h, this.t, this.palOf(d), d.x, { role: 'shaft' });
    });

    /* ---- floors ---- */
    near.ground.forEach(g => {
      if (!mine(g)) return;
      const y0 = this.sy(g.y);
      const a = Math.max(this.sx(g.x), -30), b = Math.min(this.sx(g.x + g.w), VW + 30);
      if (b <= a) return;
      paintFloor(ctx, this.floorOf(g), a, y0, b - a, VH - y0 + 320, this.palOf(g), this.t, camX);
    });

    /* ---- signage: the metro roundel, the arrow up the stairs. These are the
       one thing on the track she can run straight through, so they are drawn
       set back and dimmed rather than sitting up in her lane. ---- */
    ctx.save(); ctx.globalAlpha = .62;
    near.deco.forEach(d => {
      if (!d.sign || !mine(d)) return;
      drawProp(ctx, d.prop, this.sx(d.x), this.sy(d.y + d.h), d.w, d.h, this.t, this.palOf(d), d.x,
               { role: 'sign', floorY: this.sy(d.y) });
    });
    ctx.restore();

    near.platforms.forEach(p => {
      if (!mine(p)) return;
      const x0 = this.sx(p.x), y0 = this.sy(p.y);
      const hgt = p.h || 40;
      ctx.save();
      if (p.oneWay) { ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6; }
      drawPropTiled(ctx, p.prop, x0, y0, p.w, hgt, this.t, this.palOf(p), p.x,
                    { role: p.stair ? 'stair' : 'step', floorY: this.sy(this.layerBase(p.layer)),
                      rise: p.rise, dir: p.dir });
      ctx.restore();
      /* readable landing edge */
      ctx.save(); ctx.globalAlpha = .38;
      fillRR(ctx, x0, y0 - 2, p.w, 3, 2, 'rgba(255,255,255,.55)');
      ctx.restore();
    });

    /* ---- scenery: flat decals lying on the floor, never anything she can hit ---- */
    ctx.save(); ctx.globalAlpha = 0.55;
    near.deco.forEach(d => {
      if (d.finish || d.shaft || d.sign || d.gateway || !mine(d)) return;
      drawPropTiled(ctx, d.prop, this.sx(d.x), this.sy(d.y + d.h), d.w, d.h, this.t, this.palOf(d), d.x);
    });
    ctx.restore();

    /* ---- checkpoint flags at the mouth of every place ---- */
    if (LY === 'main') W.zones.forEach(zz => {
      const fx = this.sx(zz.x0 + 24);
      if (fx < -70 || fx > VW + 70 || zz.zone.index === 0) return;
      this.drawFlag(fx, this.sy(0), this.checkpoint && this.checkpoint.zoneIdx >= zz.zone.index);
    });

    /* ---- obstacles. No rim any more: an object stops her because it is an
       object, and it reads as one — the shadow under it is the only cue. ---- */
    near.hazards.forEach(hz => {
      if (!mine(hz)) return;
      const x0 = this.sx(hz.x), yTop = this.sy(hz.y + hz.h);
      const floorY = this.sy(this.layerBase(hz.layer));
      if (hz.kind !== 'over') {
        ctx.save(); ctx.globalAlpha = .3;
        fillEll(ctx, x0 + hz.w / 2, this.sy(hz.y) + 3, hz.w * 0.56, 7, '#1a1226');
        ctx.restore();
      }
      drawPropTiled(ctx, hz.prop, x0, yTop, hz.w, hz.h, this.t, this.palOf(hz), hz.x,
                    { role: hz.kind, floorY: floorY });
    });

    /* ---- finish arch ---- */
    near.deco.filter(d => d.finish).forEach(d => {
      drawProp(ctx, 'finish', this.sx(d.x), this.sy(d.y + d.h), d.w, d.h, this.t, {});
    });

    /* ---- treats ---- */
    near.bones.forEach(b => {
      if (b.got || !mine(b)) return;
      this.drawBone(this.sx(b.x), this.sy(b.y) + Math.sin(this.t * 3 + b.i) * 5);
    });

    /* ---- dust ---- */
    this.fx.dust.forEach(p => {
      ctx.save(); ctx.globalAlpha = clamp(p.life * 2, 0, .5);
      circle(ctx, this.sx(p.x), this.sy(p.y), p.r, '#fff'); ctx.restore();
    });

    /* ---- Lota ---- */
    if (L) {
      drawLota(ctx, this.sx(L.x), this.sy(L.y), {
        state: L.state, t: this.t, run: L.runPhase, skin: Save.data.skin,
        face: this.state === 'crash' ? 'sad' : undefined,
        tilt: this.state === 'crash' ? Math.sin(L.sitT * 3) * 0.22 - 0.08 : undefined
      });
      if (this.state === 'crash' && this.stateT > 0.35) {
        ctx.save(); ctx.globalAlpha = clamp((this.stateT - 0.35) * 2, 0, 1);
        ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.fillText('?', this.sx(L.x) + 44, this.sy(L.y) - 74 + Math.sin(this.t * 4) * 3);
        ctx.restore();
      }
    }

    /* ---- sparks ---- */
    this.fx.sparks.forEach(p => {
      ctx.save(); ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      circle(ctx, this.sx(p.x), this.sy(p.y), 3.4, p.c); ctx.restore();
    });

    /* ---- speed streaks when she is really flying ---- */
    const spd = inv(speedAt(L ? L.x : 0), 520, PHYS.V_MAX);
    if (spd > 0.05) {
      ctx.save(); ctx.globalAlpha = spd * 0.3;
      for (let i = 0; i < 7; i++) {
        const r = makeRng(i * 31 + Math.floor(this.t * 12) * 17);
        const yy = r() * VH, len = 60 + r() * 130;
        line(ctx, VW - r() * VW, yy, VW - r() * VW - len, yy, '#fff', 2);
      }
      ctx.restore();
    }

    /* ---- confetti ---- */
    this.fx.confetti.forEach(c => {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r);
      ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); ctx.restore();
    });

    /* ---- shortcut wipe ---- */
    if (this.fx.warp > 0) {
      const a = this.fx.warp / 0.42;
      const k = a > 0.5 ? (1 - a) * 2 : a * 2;
      ctx.save(); ctx.globalAlpha = clamp(1 - k, 0, 1);
      ctx.fillStyle = '#12203a'; ctx.fillRect(0, 0, VW, VH);
      ctx.restore();
    }

    /* ---- vignette ---- */
    const g = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.42, VW / 2, VH / 2, VH * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,6,20,.34)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  },

  drawFlag(x, y, lit) {
    const ctx = this.ctx, t = this.t;
    const H = 104;
    ctx.save(); ctx.translate(x, y);
    ctx.save(); ctx.globalAlpha = .25; fillEll(ctx, 0, 0, 15, 5, '#000'); ctx.restore();
    fillRR(ctx, -3.5, -H, 7, H, 3, lit ? '#d8b25e' : '#7a7686');
    circle(ctx, 0, -H - 3, 5.5, lit ? '#ffd870' : '#8b8798');
    if (lit) {
      ctx.save(); ctx.globalAlpha = .28 + Math.sin(t * 3) * .12;
      circle(ctx, 0, -H - 3, 15, '#ffd870'); ctx.restore();
    }
    /* the flag itself: checkered, and waving once it has been claimed */
    ctx.save();
    ctx.translate(3.5, -H + 4);
    const w = 44, h = 30;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let i = 0; i <= 6; i++) {
      const f = i / 6;
      ctx.lineTo(w * f, (lit ? Math.sin(t * 5 - f * 3.4) * 4.5 * f : f * 9));
    }
    for (let i = 6; i >= 0; i--) {
      const f = i / 6;
      ctx.lineTo(w * f, h + (lit ? Math.sin(t * 5 - f * 3.4) * 4.5 * f : f * 9));
    }
    ctx.closePath();
    ctx.save(); ctx.clip();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      ctx.fillStyle = (i + j) % 2 ? (lit ? '#fff8e6' : '#b8b4c2') : (lit ? '#2b2634' : '#5f5b6b');
      ctx.fillRect(i * (w / 4) - 2, j * (h / 3) - 6, w / 4 + 2, h / 3 + 12);
    }
    ctx.restore();
    ctx.strokeStyle = lit ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.2)';
    ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
    ctx.restore();
  },

  drawBone(x, y, s) {
    const ctx = this.ctx; s = s || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = .35 + Math.sin(this.t * 4) * .12;
    circle(ctx, 0, 0, 20, '#ffe8a8'); ctx.restore();
    ctx.rotate(-0.25);
    ctx.fillStyle = '#fff7e2'; ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2.4;
    [[-9, -5], [-9, 5], [9, -5], [9, 5]].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 5.4, 0, TAU); ctx.fill(); ctx.stroke(); });
    rr(ctx, -9, -4.4, 18, 8.8, 4.4); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.globalAlpha = .8;
    circle(ctx, -6, -5, 1.8, '#fff'); ctx.restore();
    ctx.restore();
  },

  /* ---------- lobby scene ---------- */
  renderLobby() {
    const ctx = this.ctx, VW = this.VW, VH = this.VH, t = this.t;
    const floorY = VH * 0.56;
    const pal = { far: '#3a2b56', mid: '#4d3a70', skirt: '#2b1f42', frame: '#c9962c', pic: '#ffd8e6' };
    ctx.fillStyle = pal.far; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.globalAlpha = .3;
    for (let x = 0; x < VW; x += 56) for (let y = 0; y < floorY; y += 60) {
      ctx.save(); ctx.translate(x + ((y / 60) % 2) * 28, y);
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.quadraticCurveTo(9, -7, 18, 8);
      ctx.quadraticCurveTo(9, 4, 0, 8); ctx.fillStyle = pal.mid; ctx.fill(); ctx.restore();
    }
    ctx.restore();

    /* window with a night sky */
    const wx = VW * 0.70, wy = VH * 0.12, ww = VW * 0.19, wh = VH * 0.28;
    fillRR(ctx, wx, wy, ww, wh, 10, '#c9962c');
    ctx.save(); rr(ctx, wx + 8, wy + 8, ww - 16, wh - 16, 6); ctx.clip();
    const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
    g.addColorStop(0, '#1d2b55'); g.addColorStop(1, '#4a3a7a');
    ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
    circle(ctx, wx + ww * 0.7, wy + wh * 0.28, 16, '#fff3c4');
    for (let i = 0; i < 14; i++) {
      const r = makeRng(i * 53 + 3);
      ctx.save(); ctx.globalAlpha = .4 + Math.sin(t * 2 + i) * .35;
      circle(ctx, wx + 12 + r() * (ww - 24), wy + 12 + r() * (wh - 24), 1.8, '#fff'); ctx.restore();
    }
    BG.clouds(ctx, ww, wh, t * 8, t, 'rgba(255,255,255,.35)', wy + wh * 0.55, 0.5);
    ctx.restore();
    line(ctx, wx + ww / 2, wy + 8, wx + ww / 2, wy + wh - 8, '#c9962c', 6);

    /* a cosy shelf with bones */
    fillRR(ctx, VW * 0.07, VH * 0.24, VW * 0.19, 12, 4, '#8a6440');
    for (let i = 0; i < 3; i++) this.drawBone(VW * 0.09 + i * 34, VH * 0.24 - 12, 0.72);

    /* floor + rug */
    ctx.fillStyle = '#6b4a2c'; ctx.fillRect(0, floorY, VW, VH - floorY);
    fillRR(ctx, 0, floorY - 10, VW, 14, 0, '#8a6440');
    ctx.save(); ctx.globalAlpha = .35;
    for (let x = 0; x < VW; x += 90) line(ctx, x, floorY, x, VH, '#4f351d', 3);
    ctx.restore();
    fillEll(ctx, VW * 0.5, floorY + 46, VW * 0.3, 40, '#8a4a63');
    ctx.save(); ctx.globalAlpha = .5; fillEll(ctx, VW * 0.5, floorY + 46, VW * 0.24, 30, '#c96f8a'); ctx.restore();

    /* Lota, sitting and being cute */
    const cycle = (t * 0.5) % 4;
    drawLota(ctx, VW * 0.5, floorY + 24, {
      state: 'sit', t: t, skin: Save.data.skin, scale: 1.42,
      face: 'calm', paw: cycle > 2.4 && cycle < 3.4,
      tilt: Math.sin(t * 0.8) * 0.13
    });

    /* floating hearts now and then */
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.35 + i * 0.33) % 1;
      ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.55;
      const hx = VW * 0.5 + 48 + Math.sin(ph * 6 + i) * 12, hy = floorY - 60 - ph * 130;
      ctx.translate(hx, hy); ctx.scale(1.1, 1.1);
      ctx.beginPath();
      ctx.moveTo(0, 4); ctx.bezierCurveTo(-7, -3, -3, -9, 0, -4);
      ctx.bezierCurveTo(3, -9, 7, -3, 0, 4); ctx.fillStyle = '#ff8fb0'; ctx.fill();
      ctx.restore();
    }

    const vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VH);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(8,4,16,.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  }
};
