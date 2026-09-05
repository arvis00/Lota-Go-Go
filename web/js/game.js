'use strict';
/* ---------------------------------------------------------------
   game.js — engine: view, input, physics, camera, rendering
----------------------------------------------------------------*/
const Game = {
  cv: null, ctx: null,
  cw: 0, ch: 0, VW: 960, VH: 540, scale: 1, ox: 0, oy: 0, dpr: 1,
  groundY: 410,
  state: 'boot',          // boot | lobby | mode | preview | cut | run | scene | fight
                          // | crash | over | win | pause
  world: null, worlds: {},
  trail: [], foxes: [],
  t: 0, last: 0, stateT: 0,
  portrait: false,

  lota: null,
  /* the lobby is a strip of four identical rooms, one per level; the view
     slides sideways between them and the locked ones are drained of colour */
  lobbyPage: 0, lobbyFrom: 0, lobbySlide: 1, lobbySwapped: true,
  /* where in the room Lota sits, as a fraction of its width, and how big she
     is allowed to be once she is over there — see resize() */
  lobbyFocus: 0.5, lobbySize: 1,
  previewLevel: 2,
  cam: { x: 0, y: 0 },
  input: { jumpBuf: 0, duckHeld: false, duckTimer: 0, coyote: 0, left: false, right: false },
  fx: { dust: [], confetti: [], sparks: [], shake: 0, flash: 0, warp: 0, spin: 0,
        warpFull: 0.42, warpCol: '#12203a',
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
    Sfx.warmVoices();
    this.world = this.worldFor(1);
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

    /* The lobby's buttons run down the middle of the screen, and lying down
       there is not much middle left: Lota used to sit right behind them. So
       measure what the column leaves free to the left of it and, if she fits,
       move her, her rug and the room's number over there instead. */
    const col = Math.min(360, cw * 0.86) / 2 / this.scale;   // half the button column
    const edge = 62 / this.scale;                            // the ‹ page arrow
    const bandR = this.VW / 2 - col, band = bandR - edge;
    if (!this.portrait && band > 90) {
      this.lobbyFocus = ((edge + bandR) / 2) / this.VW;
      this.lobbySize = clamp(band / 170, 0.62, 1);           // a narrow strip, a smaller dog
    } else {
      /* standing up the room is letterboxed and the buttons sit below it, so
         the middle is hers again */
      this.lobbyFocus = 0.5; this.lobbySize = 1;
    }
  },

  /* ================= input ================= */
  bindInput() {
    const jump = () => this.onJump();
    const duckOn = () => this.onDuck(true);
    const duckOff = () => this.onDuck(false);
    const boost = () => this.onBoost();
    const moveL = on => this.onMove(-1, on);
    const moveR = on => this.onMove(1, on);

    window.addEventListener('keydown', e => {
      if (e.repeat) return;
      const k = e.code;
      if (k === 'ArrowUp' || k === 'KeyW' || k === 'Space') { e.preventDefault(); jump(); }
      else if (k === 'ArrowDown' || k === 'KeyS') { e.preventDefault(); duckOn(); }
      else if (k === 'KeyX' || k === 'KeyE' || k === 'ShiftLeft' || k === 'ShiftRight') {
        e.preventDefault(); boost();
      }
      else if (k === 'Escape' || k === 'KeyP') {
        if (this.state === 'cut') this.skipCut();
        else if (this.state === 'run' || this.state === 'fight') UI.pause();
        else if (this.state === 'pause') UI.resume();
        else if (this.state === 'preview') UI.backFromPreview();
        else if (this.state === 'mode') UI.showLobby();
      }
      /* left and right are the lobby's pages everywhere else, and the two new
         buttons in the arena: in a fight they walk her across it */
      else if (k === 'ArrowLeft' || k === 'KeyA') {
        if (this.state === 'fight') { e.preventDefault(); moveL(true); }
        else if (this.state === 'lobby' && k === 'ArrowLeft') this.gotoLobbyPage(this.lobbyPage - 1);
      }
      else if (k === 'ArrowRight' || k === 'KeyD') {
        if (this.state === 'fight') { e.preventDefault(); moveR(true); }
        else if (this.state === 'lobby' && k === 'ArrowRight') this.gotoLobbyPage(this.lobbyPage + 1);
      }
    }, { passive: false });
    window.addEventListener('keyup', e => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') duckOff();
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveL(false);
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') moveR(false);
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
    hold(document.getElementById('btnBoost'), boost);
    hold(document.getElementById('btnLeft'), () => moveL(true), () => moveL(false));
    hold(document.getElementById('btnRight'), () => moveR(true), () => moveR(false));

    /* the lobby is a strip of level pages — drag it sideways to see the rest */
    let lx = 0, ly = 0, lActive = false, lFired = false;
    const lob = document.getElementById('screen-lobby');
    const lStart = (x, y, e) => {
      if (this.state !== 'lobby' || (e.target.closest && e.target.closest('button'))) return;
      lx = x; ly = y; lActive = true; lFired = false;
    };
    const lMove = (x, y) => {
      if (!lActive || lFired) return;
      const dx = x - lx, dy = y - ly;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        lFired = true;
        this.gotoLobbyPage(this.lobbyPage + (dx < 0 ? 1 : -1));
      }
    };
    const lEnd = () => { lActive = false; };
    if (lob) {
      lob.addEventListener('touchstart', e => lStart(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e), { passive: true });
      lob.addEventListener('touchmove', e => lMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY), { passive: true });
      lob.addEventListener('touchend', lEnd);
      lob.addEventListener('touchcancel', lEnd);
      lob.addEventListener('mousedown', e => lStart(e.clientX, e.clientY, e));
      lob.addEventListener('mousemove', e => { if (lActive) lMove(e.clientX, e.clientY); });
      window.addEventListener('mouseup', lEnd);
    }

    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      document.body.classList.add('touch');
      const tu = document.getElementById('tutUp'), td = document.getElementById('tutDown');
      if (tu) tu.textContent = '▲  arba  swipe ↑';
      if (td) td.textContent = '▼  arba  swipe ↓';
    }
  },

  onJump() {
    Sfx.init(); Sfx.resume();
    /* the arena keeps the jump: it is the third of the three buttons it shows */
    if (this.state !== 'run' && this.state !== 'fight') return;
    this.input.jumpBuf = 0.14;
  },
  /** the third control, and only the boss level has one: spend a charge */
  onBoost() {
    Sfx.init(); Sfx.resume();
    if (this.state !== 'run') return;
    Boss.fire(this);
  },
  /** the arena's two new buttons: nothing outside the fight listens to them */
  onMove(dir, on) {
    Sfx.init(); Sfx.resume();
    if (dir < 0) this.input.left = !!on; else this.input.right = !!on;
  },
  onDuck(on) {
    if (this.state !== 'run') return;
    this.input.duckHeld = on;
    if (on) { this.input.duckTimer = 0.55; if (this.lota && this.lota.grounded) Sfx.duck(); }
  },

  /* ================= run lifecycle ================= */
  /** Each level is its own track, built the first time it is played and kept
      afterwards — the generator is deterministic, so a rebuilt world would be
      identical anyway, but building it twice is wasted work. */
  worldFor(level) {
    if (!this.worlds[level]) this.worlds[level] = buildWorld(Levels.track(level));
    return this.worlds[level];
  },

  lobby() {
    this.state = 'lobby'; this.stateT = 0;
    Music.stop();
    this.fx.confetti.length = 0;
    this.lobbyFrom = this.lobbyPage; this.lobbySlide = 1; this.lobbySwapped = true;
    UI.showLobby();
  },

  /** level number shown on the lobby page currently under the buttons */
  lobbyLevel() { return this.lobbyPage + 1; },

  gotoLobbyPage(n) {
    n = clamp(n, 0, LEVELS.length - 1);
    if (this.state !== 'lobby' || n === this.lobbyPage || this.lobbySlide < 1) return;
    this.lobbyFrom = this.lobbyPage;
    this.lobbyPage = n;
    this.lobbySlide = 0; this.lobbySwapped = false;
    Sfx.init(); Sfx.resume(); Sfx.swipe();
    UI.lobbyFade(true);
  },

  /** The boss level opens on a film. It is not playable and it is not long,
      and there is a Skip on the screen the whole time it is running. */
  showCut(level, mode) {
    this.state = 'cut'; this.stateT = 0;
    Boss.startCut(level, mode);
    Music.play(level);
    UI.showCut();
  },
  skipCut() { if (this.state === 'cut') Boss.endCut(this); },

  /** the picture standing in for a level that has no arena yet */
  showPreview(level) {
    this.previewLevel = level;
    this.state = 'preview'; this.stateT = 0;
    UI.showPreview(level);
  },

  /** `mode` is 'cp' or 'raw'; left out, the level's remembered answer stands */
  startRun(fromCheckpoint, level, mode) {
    const cp = fromCheckpoint && this.checkpoint ? this.checkpoint : null;
    level = level || (cp && this.run ? this.run.level : this.lobbyLevel());
    if (!cp || !this.world || this.world.level !== level) this.world = this.worldFor(level);
    useSpeed(this.world.phys);
    const ZL = this.world.zoneList;
    /* whatever the last burst of energy went through is standing again, and
       every symbol she ran past is waiting to be run past again */
    this.world.hazards.forEach(h => { if (h.smashed) h.smashed = 0; });
    this.world.bones.forEach(b => { if (b.missed) b.missed = 0; });
    if (cp) {
      /* keep the treats picked up before the checkpoint, hand back the rest */
      const kept = new Set(cp.bones);
      this.world.bones.forEach(b => { b.got = kept.has(b.i); });
      this.world.warps.forEach(w => { if (w.x >= cp.x) w.used = false; });
      /* once found, a thing is hers for good; if the checkpoint is from before
         she found it, it is lying back where it was waiting to be found again */
      const keptI = new Set(cp.items || []);
      this.world.items.forEach(it => { it.got = keptI.has(it.id); });
      this.run.metroKey = keptI.has('metroKey');
      this.run.bones = cp.count;
      this.run.gotB = cp.b || 0;
      this.run.gotT = cp.t || 0;
      this.run.zoneIdx = -1;
      this.run.finished = false;
      this.run.warpTo = null;
      this.run.deaths++;
    } else {
      this.world.bones.forEach(b => { b.got = false; });
      this.world.items.forEach(it => { it.got = false; });
      this.world.warps.forEach(w => { w.used = false; });
      this.run = { level: level, bones: 0, gotB: 0, gotT: 0, zoneIdx: -1, dist: 0, time: 0,
                   shortcuts: 0, finished: false, warpTo: null, deaths: 0, banked: false,
                   metroKey: false, mode: mode || Levels.mode(level) || 'cp' };
      const s0 = this.world.stops[0];
      this.checkpoint = { k: 0, x: s0.x, y: s0.y, zoneIdx: 0, count: 0, b: 0, t: 0,
                          bones: [], items: [], name: ZL[0].name, start: true };
    }
    this.run.diving = null;
    this.run.fly = 0; this.run.glide = 0;
    this.shownPlace = null;
    this.world.spins.forEach(sp => { sp.used = false; });
    /* a scene she has already run past does not play again on the way back */
    const startX = cp ? cp.x : 60;
    (this.world.scenes || []).forEach(sc => { sc.used = sc.x <= startX; });
    this.trail.length = 0; this.foxes.length = 0;
    const sx = startX;
    const sy0 = groundYAt(this.world, sx, 'main') || 0;
    this.baseRef = sy0; this.camBase = sy0;
    this.lota = {
      x: sx, y: sy0, vy: 0, grounded: true, duck: false, runPhase: 0,
      state: 'run', dead: false, sitT: 0, alpha: 1, layer: 'main'
    };
    this.cam.x = sx - this.VW * 0.30; this.cam.y = sy0;
    this.input.jumpBuf = 0; this.input.duckHeld = false; this.input.duckTimer = 0; this.input.coyote = 0;
    this.fx.dust.length = 0; this.fx.confetti.length = 0; this.fx.sparks.length = 0;
    this.fx.shake = 0; this.fx.flash = 0; this.fx.warp = 0; this.fx.spin = 0;
    this.fx.layerFade = 0; this.fx.fromLayer = 'main'; this.fx.fromX = sx;
    this.state = 'run'; this.stateT = 0;
    Fight.on = false; Scene.on = null;
    UI.movePad(false);
    Music.play(level);
    UI.showHud();
    /* the boss level's energy, and whoever is coming up the road behind her */
    Boss.reset(this.world);
    UI.setBones(this.run.bones);
    UI.setKey(this.run.metroKey);
    /* Losing the boss fight never sends her back down the street: the arena is
       its own checkpoint, so a retry starts the fight again and nothing else. */
    if (cp && cp.fight) { Fight.start(this); return; }
    UI.toast(cp && !cp.start ? cp.name : 'Pirmyn, Lota!', cp && !cp.start ? 'nuo kontrolinio taško' : '');
    if (!cp) { UI.tut(true); setTimeout(() => UI.tut(false), 4200); }
  },

  /** `k` indexes W.stops: the mouth of every place, plus the extra ones the
      boss level puts inside its longest arenas. */
  setCheckpoint(k) {
    /* played without them, the only checkpoint there has ever been is the
       start line: one mistake and the whole run goes again */
    if (k > 0 && this.run.mode === 'raw') return;
    /* never in mid-air on the pack: a checkpoint taken up there would put her
       back on the ground with the treats still in the sky and no way to them */
    if (this.run.fly || this.run.glide) return;
    const st = this.world.stops[k];
    if (!st) return;
    this.checkpoint = {
      k: k, x: st.x, y: st.y, zoneIdx: st.zone, name: st.name, start: k === 0,
      bones: this.world.bones.filter(b => b.got).map(b => b.i),
      count: this.run.bones, b: this.run.gotB, t: this.run.gotT,
      items: this.world.items.filter(it => it.got).map(it => it.id),
      key: !!this.run.metroKey
    };
    if (k === 0) return;
    Sfx.checkpoint();
    this.fx.flash = 0.5;
    for (let q = 0; q < 22; q++) this.fx.sparks.push({
      x: st.x + (Math.random() - .5) * 40, y: st.y + 60 + Math.random() * 90,
      vx: (Math.random() - .5) * 150, vy: 40 + Math.random() * 190,
      life: .8, c: q % 2 ? '#ffd870' : '#fff6d8'
    });
  },

  crash(reason) {
    if (this.state !== 'run') return;
    Music.stop();
    Sfx.crash();
    this.state = 'crash'; this.stateT = 0;
    this.lota.dead = true; this.lota.state = 'sit'; this.lota.sitT = 0;
    this.fx.shake = 0.5;
    this.crashReason = reason;
    if (reason === 'caught') { this.fx.shake = 0.8; this.fx.flash = 0.5; }
    if (reason !== 'fall') { this.lota.y = this.lota.landY != null ? this.lota.landY : this.lota.y; }
  },

  finish() {
    if (this.run.finished) return;
    this.run.finished = true;
    Music.stop();
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

    if (this.state === 'lobby' && this.lobbySlide < 1) {
      this.lobbySlide = Math.min(1, this.lobbySlide + dt * 3.1);
      if (!this.lobbySwapped && this.lobbySlide > 0.42) { this.lobbySwapped = true; UI.lobbyPageChanged(); }
      if (this.lobbySlide >= 1) UI.lobbyFade(false);
    }

    if (this.state === 'run') this.step(dt);
    else if (this.state === 'cut') Boss.stepCut(dt, this);
    else if (this.state === 'scene') Scene.step(dt, this);
    else if (this.state === 'fight') Fight.step(dt, this);
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
  /** The height of the floor she is actually over. On a branch that is the
      layer's own base; on the main route it used to be zero everywhere, but
      the deck of the wreck stands over the sea bed and the shore climbs out
      of the water, so it has to be looked up. Over a gap the last known one
      stands, or the camera would lurch every time she is in the air. */
  floorBase(L) {
    if (L.layer !== 'main') return this.layerBase(L.layer);
    const y = groundYAt(this.world, L.x, 'main');
    if (y != null) this.baseRef = y;
    return this.baseRef || 0;
  },
  switchLayer(to) {
    const L = this.lota;
    if (L.layer === to) return;
    this.fx.fromLayer = L.layer;
    this.fx.fromX = L.x;
    this.fx.layerFade = 1;
    L.layer = to;
    /* Say where she has just gone. Dropping through a hole in the floor into
       a place that has a name of its own is exactly the moment it is worth
       spending a caption on. */
    if (to !== 'main' && this.state === 'run') {
      const rm = this.roomAt(to, L.x);
      if (rm && rm.name) UI.toast(rm.name, rm.sub || '');
    }
  },

  /** the room of a branch (or of the sky) she is over right now */
  roomAt(layerId, x) {
    const lay = this.world.layers[layerId];
    if (!lay || !lay.rooms || !lay.rooms.length) return null;
    let rm = lay.rooms[0];
    for (let i = 0; i < lay.rooms.length; i++) if (x >= lay.rooms[i].x0) rm = lay.rooms[i];
    return rm.room || null;
  },

  /** What the HUD calls the place she is in. On the street that is the zone;
      down a hole it is the room, which is a different place with a different
      name and should say so. */
  placeName() {
    const L = this.lota;
    if (L.layer !== 'main') {
      const rm = this.roomAt(L.layer, L.x);
      if (rm && rm.name) return rm.name;
    }
    return this.zoneAt(L.x).zone.name;
  },

  step(dt) {
    const L = this.lota, W = this.world, I = this.input;
    const SUB = Math.ceil(dt / (1 / 240));
    const h = dt / SUB;
    this.run.time += dt;
    if (this.run.fly || this.run.glide) { this.stepFly(dt); return; }

    I.jumpBuf = Math.max(0, I.jumpBuf - dt);
    if (I.duckTimer > 0) I.duckTimer -= dt;

    /* a burst of energy is the one thing that changes how fast she runs */
    const burst = Boss.speed();
    const smashing = Boss.on && Boss.boost > 0;
    for (let s = 0; s < SUB && this.state === 'run'; s++) {
      const v = speedAt(L.x) * burst;
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
      /* nothing moves vertically while a wipe is covering the screen — she is
         already on her way somewhere else */
      if (!L.grounded && !this.run.warpTo) { L.vy -= g * h; L.y += L.vy * h; }

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
      /* the bars over the metro are floor only while they are shut */
      const solidG = gd => gd.layer === LY && (!gd.lock || !this.run.metroKey);
      const consider = surf => {
        if (surf.x > box.x1 - 3 || surf.x + surf.w < box.x0 + 3) return;
        const top = surf.top;
        if (L.vy > 0) return;
        if (prevY >= top - 1.2 && L.y <= top + 0.5) {
          if (bestTop === null || top > bestTop) bestTop = top;
        }
      };
      near.ground.forEach(gd => { if (solidG(gd)) consider({ x: gd.x, w: gd.w, top: gd.y }); });
      near.platforms.forEach(p => { if (p.layer === LY) consider({ x: p.x, w: p.w, top: p.y }); });
      /* a bird has no top to it: she can never land on a gull, only duck it or
         clear it */
      near.hazards.forEach(hz => { if (hz.layer === LY && !hz.smashed && hz.kind !== 'bird') consider({ x: hz.x, w: hz.w, top: hz.y + hz.h }); });
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
        near.ground.forEach(gd => { if (solidG(gd)) chk({ x: gd.x, w: gd.w, top: gd.y }); });
        near.platforms.forEach(p => { if (p.layer === LY) chk({ x: p.x, w: p.w, top: p.y }); });
        near.hazards.forEach(hz => { if (hz.layer === LY && !hz.smashed && hz.kind !== 'bird') chk({ x: hz.x, w: hz.w, top: hz.y + hz.h }); });
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

      /* --- the bed throws her at the ceiling. Getting up there is the hard
         part — she has to come down onto a one-way mattress with air under it;
         once she is standing on it the bounce is automatic. --- */
      if (L.grounded) {
        for (let i = 0; i < near.platforms.length; i++) {
          const p = near.platforms[i];
          if (!p.bounce || p.layer !== LY) continue;
          if (L.x < p.x - 8 || L.x > p.x + p.w + 8 || Math.abs(L.y - p.y) > 2) continue;
          L.vy = PHYS.BOUNCE_V; L.grounded = false; I.coyote = 0; I.jumpBuf = 0;
          Sfx.boing(); this.puff(L.x, L.y, 7);
          break;
        }
      }

      /* --- running into the FACE of something solid: platform walls, the wall
         after a step down, and the side of a ground obstacle. Clipping the very
         top edge scrambles her up instead of killing her. --- */
      const b2 = this.box(L);
      let wallTop = null, wallGrab = 0, wallHz = null;
      const face = (top, grab, hzo) => {
        if (L.y >= top - 2.5) return;                 // she is already on top of it
        if (wallTop === null || top > wallTop) { wallTop = top; wallGrab = grab; wallHz = hzo || null; }
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
        if (!solidG(gd)) return;
        if (b2.x1 - 5 <= gd.x || b2.x0 + 5 >= gd.x + gd.w) return;
        face(gd.y, GRAB);
      });
      near.hazards.forEach(hz => {
        if (hz.layer !== LY || hz.smashed || hz.kind === 'bird') return;
        if (b2.x1 - 6 <= hz.x || b2.x0 + 6 >= hz.x + hz.w) return;
        const top = hz.y + hz.h;
        if (hz.kind !== 'over') { face(top, GRAB, hz); return; }
        /* a hanging thing has no face down at floor level — she runs under it.
           Only a jump that gets her near its top edge counts, and that puts her
           up on top of it rather than killing her. */
        if (L.y > hz.y && top - L.y <= GRAB_OVER) face(top, GRAB_OVER, hz);
      });
      if (wallTop !== null) {
        /* On her feet and running straight into it — that is a crash, whatever
           its height. In the air she jumped at it, so she scrambles up on top
           instead: a jump is never what kills her. Still falling counts only
           within reach. */
        const canGrab = !L.grounded && (L.vy > 0 || wallTop - L.y <= wallGrab) && L.vy > -760;
        /* mid-burst nothing stops her: a thing she throws herself at comes
           apart, and a wall she cannot break she simply goes up */
        if (smashing && wallHz) Boss.smash(this, wallHz);
        else if (canGrab || smashing) {
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
        if (hit || hz.smashed || (hz.kind !== 'over' && hz.kind !== 'bird') || hz.layer !== LY) return;
        if (b3.x1 - 7 <= hz.x || b3.x0 + 7 >= hz.x + hz.w) return;
        if (b3.y1 - 5 <= hz.y || b3.y0 + 4 >= hz.y + hz.h) return;
        hit = hz;
      });
      if (hit) {
        if (smashing) Boss.smash(this, hit);
        else { this.crash('hit'); return; }
      }

      /* --- shortcuts --- */
      near.warps.forEach(wp => {
        if (wp.used || !wp.toX) return;
        if (wp.layer && wp.layer !== LY) return;
        if (b3.x1 <= wp.x || b3.x0 >= wp.x + wp.w) return;
        if (b3.y1 <= wp.y || b3.y0 >= wp.y + wp.h) return;
        wp.used = true;
        this.run.shortcuts++;
        this.fx.warp = 0.42; this.fx.warpFull = 0.42; this.fx.warpCol = '#12203a';
        this.run.warpTo = { x: wp.toX, y: wp.toY };
        Sfx.warp();
        /* the metro is a shortcut of a different order — it is worth saying so */
        if (wp.layer === 'metro') UI.toast('🚇 Metro!', 'toli į priekį');
        else UI.toast('Trumpinys!');
      });

      /* --- treats. A treat that sits on both routes is one treat: picking up
         either copy claims it, so 15 stays 15 whichever way she came. --- */
      near.bones.forEach(bn => {
        if (bn.got || bn.layer !== LY) return;
        const cx = L.x, cy = L.y + (L.duck ? LOTA.DUCK_H : LOTA.STAND_H) * 0.5;
        if (Math.abs(bn.x - cx) < 44 && Math.abs(bn.y - cy) < 66) { this.claim(bn); return; }
        /* on the boss level walking past energy is itself a mistake: it is
           what lets whoever is behind her make up the ground */
        if (!bn.missed && bn.cur === 'e' && bn.x < L.x - 90) { bn.missed = 1; Boss.missed(); }
      });

      /* --- the metro key, lying in the duct over the girl's room --- */
      near.items.forEach(it => {
        if (it.got || it.layer !== LY) return;
        const cy = L.y + (L.duck ? LOTA.DUCK_H : LOTA.STAND_H) * 0.5;
        if (Math.abs(it.x - L.x) > 52 || Math.abs(it.y - cy) > 74) return;
        it.got = true;
        if (it.kind === 'jetpack') { this.liftOff(it); return; }
        this.run.metroKey = true;
        Sfx.unlock();
        this.fx.flash = 0.45;
        for (let k = 0; k < 20; k++) this.fx.sparks.push({
          x: it.x, y: it.y, vx: (Math.random() - .5) * 200, vy: 50 + Math.random() * 200,
          life: .7, c: k % 2 ? '#f6c93a' : '#fff6d8'
        });
        UI.setKey(true);
        UI.toast('🔑 Metro raktas!', 'Grotos Londone atsirakino');
      });

      /* --- the one place the view swings round: she comes off the beach and
         turns right onto the pier --- */
      for (let i = 0; i < W.spins.length; i++) {
        const sp = W.spins[i];
        if (sp.used || LY !== 'main' || L.x < sp.x) continue;
        /* No caption. She plants a paw, swings her whole body round to the
           right and the camera comes round with her — a beat behind, the way
           a camera would. Saying so in words is what made it read as a bug. */
        sp.used = true; this.fx.spin = 1;
        Sfx.swipe();
        this.puff(L.x - 14, L.y, 7);
        if (sp.slip) { Boss.slipped(); UI.toast('Pasimetė!', 'apsisuko jai prieš nosį'); }
      }

      /* --- and the places where the running simply stops: the salon
         doorway, and the mouth of the last arena --- */
      for (let i = 0; i < W.scenes.length; i++) {
        const sc = W.scenes[i];
        if (sc.used || LY !== 'main' || L.x < sc.x) continue;
        sc.used = true;
        Scene.start(sc.kind, this);
        return;
      }

      /* --- off the end of the pier ---
         The deck stops and she leaps. This is the only place on any track
         where the floor runs out, and it is not a hole: falling here is the
         point, and the sea catches her. --- */
      if (!this.run.diving) {
        for (let i = 0; i < W.dives.length; i++) {
          const d = W.dives[i];
          if (LY !== 'main' || L.x < d.x0 || L.x > d.x1) continue;
          this.run.diving = d;
          if (L.grounded) { L.vy = PHYS.JUMP_V * 0.62; L.grounded = false; I.coyote = 0; }
          Sfx.jump(); this.puff(L.x - 10, L.y, 6);
          break;
        }
      } else if (!this.run.warpTo) {
        const d = this.run.diving;
        if (L.y < -150 || L.x > d.x1) {
          this.run.diving = null;
          this.splash(L.x, L.y);
          this.fx.warp = 0.5; this.fx.warpFull = 0.5; this.fx.warpCol = '#0e4a68';
          this.run.warpTo = { x: d.toX, y: 0 };
          UI.toast('🌊 Į vandenį!', 'toliau — jūros dugnu');
        }
      }

      /* --- safety net. There are no holes to fall down any more, so this only
         ever fires if the world itself went wrong. --- */
      if (!this.run.warpTo && !this.run.diving && L.y < this.floorBase(L) - 460) { this.crash('fall'); return; }

      /* --- finish --- */
      if (L.x >= W.finishX) { this.finish(); return; }
    }

    /* warp teleport once the wipe has covered the screen */
    if (this.run.warpTo && this.fx.warp < 0.21) {
      const wt = this.run.warpTo;
      L.x = wt.x;
      if (wt.fly) {
        /* the pack does not put her down anywhere — it puts her up */
        L.layer = 'sky'; L.y = wt.y;
        this.baseRef = this.layerBase('sky'); this.camBase = this.baseRef;
        L.vy = 0; L.grounded = false;
        this.run.fly = 1; this.run.glide = 0;
      } else {
        L.y = groundYAt(W, L.x, 'main') || 0;
        this.baseRef = L.y;
        L.vy = 0; L.grounded = true;
        L.layer = 'main';
      }
      this.cam.x = L.x - this.VW * 0.30;
      this.run.warpTo = null;
    }

    if (this.state !== 'run') return;

    /* animation state */
    L.runPhase += dt * (12 + speedAt(L.x) * 0.019 * burst);
    L.state = !L.grounded ? (L.vy > 0 ? 'jump' : 'fall') : (L.duck ? 'duck' : 'run');
    this.stepFoxes(dt);
    /* whoever is behind her gains or loses ground — and may catch her */
    Boss.step(dt, this);
    if (this.state !== 'run') return;

    this.updateCam(dt);
    this.updateZone();
    this.run.dist = L.x;
    const done = clamp(L.x / this.world.finishX, 0, 1);
    UI.setProgress(done);
    /* she runs faster as the level goes on; the song leans forward with her */
    Music.setRate(done);
  },

  /** A treat is one treat wherever it was picked up: a copy of it on another
      route, or up in the sky, carries the same number, and claiming any copy
      claims all of them. Which purse it pays into is the treat's own. */
  claim(bn) {
    this.world.bones.forEach(o => { if (o.i === bn.i) o.got = true; });
    this.run.bones++;
    /* the boss level collects energy, which buys speed rather than outfits */
    if (bn.cur === 'e') Boss.collect();
    else if (bn.cur === 't') this.run.gotT++; else this.run.gotB++;
    Sfx.bone();
    for (let k = 0; k < 10; k++) this.fx.sparks.push({
      x: bn.x, y: bn.y, vx: (Math.random() - .5) * 160, vy: 60 + Math.random() * 160,
      life: .55, c: bn.cur === 't' ? '#ffd0dc' : '#ffe8a8'
    });
    UI.setBones(this.run.bones, this.run.gotB, this.run.gotT);
  },

  /** The pack goes off. She is thrown up out of the rock, the screen washes
      white, and she comes out over the top of the weather. */
  liftOff(it) {
    const W = this.world;
    if (!W.jet) return;
    Sfx.boing(); Sfx.warp();
    this.fx.flash = 0.6;
    this.fx.warp = 0.62; this.fx.warpFull = 0.62; this.fx.warpCol = '#eaf6ff';
    for (let k = 0; k < 26; k++) this.fx.sparks.push({
      x: it.x, y: it.y, vx: (Math.random() - .5) * 200, vy: 120 + Math.random() * 320,
      life: .8, c: k % 2 ? '#8fd6ff' : '#ffffff'
    });
    this.run.warpTo = { x: W.jet.x0, y: W.jet.base + SKY_HOVER, fly: 1 };
    UI.toast('🚀 Raketinė kuprinė!', 'aukštyn pro uolą, virš debesų');
  },

  /** Flying, and then coming down again.

      Nothing up here can hurt her and nothing she presses does anything: the
      pack is what she gets for having found it, not another thing to be good
      at. She goes faster than she could ever run, the treats the ground would
      have given her are strung out along the way, and when it runs out she
      comes down on a long, easy slope rather than falling. */
  stepFly(dt) {
    const L = this.lota, W = this.world, J = W.jet;
    if (!J) { this.run.fly = 0; this.run.glide = 0; return; }
    if (this.run.warpTo) return;
    if (this.run.fly) {
      L.x += speedAt(L.x) * JET_SPEED * dt;
      L.y = J.base + SKY_HOVER;
      L.layer = 'sky'; L.grounded = false; L.vy = 0; L.duck = false;
      if (L.x >= J.x1) {
        this.run.fly = 0; this.run.glide = 1;
        this.switchLayer('main');
        this.camBase = J.landY;
        Sfx.duck();
      }
    } else {
      L.x += speedAt(L.x) * dt;
      const k = clamp((L.x - J.x1) / Math.max(1, J.landX - J.x1), 0, 1);
      L.y = lerp(J.base + SKY_HOVER, J.landY, smooth(k));
      L.layer = 'main'; L.grounded = false; L.vy = 0; L.duck = false;
      if (k >= 1) {
        this.run.glide = 0;
        const gy = groundYAt(W, L.x, 'main');
        L.y = gy == null ? J.landY : gy;
        L.vy = 0; L.grounded = true; L.landY = L.y;
        this.baseRef = L.y;
        Sfx.land(); this.puff(L.x - 8, L.y, 9);
        UI.toast('Kuprinė baigėsi', 'nusileido kasyklos aikštelėje');
      }
    }
    /* the treats still count up here — flying through them is how she gets
       everything the stretch below would have given her */
    const near = queryCells(W, L.x - 300, L.x + 460), LY = L.layer;
    near.bones.forEach(bn => {
      if (bn.got || bn.layer !== LY) return;
      const cy = L.y + LOTA.STAND_H * 0.5;
      if (Math.abs(bn.x - L.x) < 56 && Math.abs(bn.y - cy) < 78) this.claim(bn);
    });
    L.runPhase += dt * 9;
    L.state = this.run.fly ? 'jump' : 'fall';
    this.trail.length = 0; this.foxes.length = 0;
    this.updateCam(dt);
    this.updateZone();
    this.run.dist = L.x;
    const done = clamp(L.x / W.finishX, 0, 1);
    UI.setProgress(done);
    Music.setRate(done);
    if (L.x >= W.finishX) this.finish();
  },

  /** How many friends are running behind her right now: the fox cave is the
      only place with any, and they follow the exact path she took rather than
      a guess at it — up onto a ledge, under an arch, all of it. */
  foxCount() {
    const l = this.world.layers[this.lota.layer];
    return (l && l.br && l.br.foxes) || 0;
  },
  stepFoxes(dt) {
    const L = this.lota, n = this.foxCount();
    if (!n) { if (this.trail.length) this.trail.length = 0; this.foxes.length = 0; return; }
    const tr = this.trail;
    if (!tr.length || L.x - tr[tr.length - 1].x > 7) tr.push({ x: L.x, y: L.y, g: L.grounded });
    while (tr.length && tr[0].x < L.x - 620) tr.shift();
    this.foxes.length = n;
    for (let i = 0; i < n; i++) {
      const want = L.x - (86 + i * 70);
      let k = tr.length - 1;
      while (k > 0 && tr[k].x > want) k--;
      const p = tr[k];
      const f = this.foxes[i] || (this.foxes[i] = { x: want, y: 0, run: 0, hop: i * 1.3 });
      f.x = p ? p.x : want;
      f.y = p ? p.y : 0;
      f.run += dt * (11 + speedAt(L.x) * 0.02);
      f.hop += dt * (1.4 + i * 0.23);
      f.air = p ? !p.g : false;
    }
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
    const fy = groundYAt(this.world, L.x, 'main') || 0;
    if (!L.grounded) { L.vy -= PHYS.GRAV * dt; L.y += L.vy * dt; }
    if (L.y <= fy) { L.y = fy; L.vy = 0; L.grounded = true; }
    this.updateCam(dt);
  },

  box(L) {
    const w = L.duck ? LOTA.DUCK_W : LOTA.STAND_W;
    const h = L.duck ? LOTA.DUCK_H : LOTA.STAND_H;
    return { x0: L.x - w / 2, x1: L.x + w / 2, y0: L.y, y1: L.y + h };
  },

  updateCam(dt) {
    const L = this.lota;
    const base = this.floorBase(L);
    /* the floor line the backgrounds hang off. It follows the real one but
       eases into it, so a flight of steps slides the place up behind her
       instead of snapping it up 42 px at a time. */
    if (this.camBase == null) this.camBase = base;
    this.camBase = lerp(this.camBase, base, 1 - Math.pow(0.004, dt));
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
    /* the HUD always names the place she is actually in, branch rooms and the
       sky included, and it updates the moment she goes down a hole */
    const nm = this.placeName();
    if (nm !== this.shownPlace) { this.shownPlace = nm; UI.setZone(nm); }
    /* the furthest stop she has run past. On every level but the boss that is
       simply the mouth of the place she is in; the boss puts a few more inside
       its long arenas, so an arena is never a minute of running to lose. */
    const st = this.world.stops;
    let k = 0;
    for (let i = 0; i < st.length; i++) if (this.lota.x >= st[i].x) k = i;
    const fresh = k > (this.checkpoint.k || 0) && this.run.mode !== 'raw'
                  && !this.run.fly && !this.run.glide;
    if (fresh) this.setCheckpoint(k);

    if (idx !== this.run.zoneIdx) {
      const resumed = this.run.zoneIdx < 0;
      const z = zs[idx].zone;
      this.run.zoneIdx = idx;
      /* one line saying what this place is and how she got into it — a level
         that changes scenery every twenty seconds has to explain itself */
      const sub = z.sub || '';
      /* the rocket does not simply appear in space: it goes */
      if (z.launch && !resumed) { this.fx.shake = 0.9; this.fx.flash = 0.3; }
      if (idx > 0) {
        if (fresh) UI.toast(z.name, sub ? '✓ ' + sub : '✓ KONTROLINIS TAŠKAS');
        else if (!resumed) { Sfx.zone(); UI.toast(z.name, sub); }
      }
    } else if (fresh && st[k].mid) {
      UI.toast('✓ Kontrolinis taškas', st[k].name);
    }
  },

  zoneAt(x) {
    const zs = this.world.zones;
    for (let i = zs.length - 1; i >= 0; i--) if (x >= zs[i].x0) return zs[i];
    return zs[0];
  },

  /* ---------- particles ---------- */
  /** hitting the water off the end of the pier */
  splash(x, y) {
    Sfx.splash();
    this.fx.flash = 0.35;
    for (let i = 0; i < 34; i++) this.fx.sparks.push({
      x: x + (Math.random() - .5) * 60, y: y,
      vx: (Math.random() - .5) * 320, vy: 120 + Math.random() * 320,
      life: .75, c: i % 3 ? '#eaf9ff' : '#8fd6ff'
    });
    for (let i = 0; i < 16; i++) this.fx.dust.push({
      x: x + (Math.random() - .5) * 90, y: y,
      vx: (Math.random() - .5) * 140, vy: 60 + Math.random() * 150,
      r: 5 + Math.random() * 12, life: 0.6
    });
  },
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
    f.spin = Math.max(0, f.spin - dt * 0.9);
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
    /* the view swinging round as she turns onto the pier. It has to zoom in
       while it turns, or the corners of the rotated picture show through. */
    /* The camera coming round after her. It swings and pushes in at the same
       time — pushing in is not decoration, it is what keeps the corners of
       the frame covered while the picture is tilted. The streaks over the top
       are the pan itself; without them a turn this fast just reads as the
       screen wobbling. */
    const spin = this.state === 'lobby' ? 0 : this.fx.spin;
    ctx.save();
    if (spin > 0) {
      const k = Math.sin((1 - spin) * Math.PI);
      ctx.translate(this.VW / 2, this.VH / 2);
      ctx.rotate(k * 0.34);
      ctx.scale(1 + k * 0.75, 1 + k * 0.75);
      ctx.translate(-this.VW / 2, -this.VH / 2);
    }

    if (this.state === 'lobby' || this.state === 'mode') this.renderLobby();
    else if (this.state === 'preview') this.renderPreview();
    else if (this.state === 'cut') Boss.drawCut(this);
    else {
      this.renderWorld();
      /* the arena and its interludes are drawn over the top of the place they
         happen in — the floor and the walls are the level's own */
      Fight.draw(this);
      Scene.draw(this);
    }
    ctx.restore();
    if (spin > 0) this.drawTurnBlur(Math.sin((1 - spin) * Math.PI));

    ctx.restore();
    ctx.restore();
  },

  /** the smear of a fast pan, drawn flat over the top of the turn */
  drawTurnBlur(k) {
    const ctx = this.ctx, VW = this.VW, VH = this.VH;
    ctx.save();
    ctx.globalAlpha = k * 0.5;
    for (let i = 0; i < 26; i++) {
      const r = makeRng(i * 37 + Math.floor(this.t * 20) * 13);
      const yy = r() * VH, len = VW * (0.3 + r() * 0.7);
      const x0 = r() * VW;
      const g = ctx.createLinearGradient(x0, 0, x0 + len, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, i % 3 ? 'rgba(255,255,255,.5)' : 'rgba(180,220,255,.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(x0, yy, len, 1 + r() * 3);
    }
    /* and the frame darkening at the edges as it whips round */
    ctx.globalAlpha = k * 0.4;
    const v = ctx.createLinearGradient(0, 0, VW, 0);
    v.addColorStop(0, 'rgba(10,12,24,.9)');
    v.addColorStop(0.35, 'rgba(10,12,24,0)');
    v.addColorStop(0.65, 'rgba(10,12,24,0)');
    v.addColorStop(1, 'rgba(10,12,24,.9)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, VW, VH);
    ctx.restore();
  },

  /* which palette and floor an object belongs to: a room on a branch carries
     its own, everything else takes them from its zone */
  palOf(o) { const Z = this.world.zoneList; return o.pal || (Z[o.zone] || Z[0]).pal; },
  floorOf(o) { const Z = this.world.zoneList; return o.floor || (Z[o.zone] || Z[0]).floor; },

  /** The place behind her: a zone on the street, or a room on a branch. */
  drawPlaceBg(layerId, atX) {
    const ctx = this.ctx, W = this.world, VW = this.VW, VH = this.VH;
    const lay = W.layers[layerId];
    if (layerId === 'main' || !lay || !lay.rooms.length) {
      const zs = W.zones;
      let zi = 0;
      for (let i = 0; i < zs.length; i++) if (atX >= zs[i].x0 - 200) zi = i;
      /* the line the place is built on. It used to be zero everywhere; now
         the deck of the wreck and the shelves out of the sea sit above it,
         so the background is hung off whatever floor is under the middle of
         the screen. `base` goes with it, for the places that need to know
         how high they have climbed. */
      const b = this.camBase || 0, fy = this.sy(b);
      const z = zs[zi].zone;
      z.bg(ctx, VW, VH, this.cam.x, fy, this.t, z.pal, b);
      if (zi + 1 < zs.length) {
        const fade = inv(atX, zs[zi].x1 - 420, zs[zi].x1 + 60);
        if (fade > 0) {
          ctx.save(); ctx.globalAlpha = fade;
          const nz = zs[zi + 1].zone;
          nz.bg(ctx, VW, VH, this.cam.x, fy, this.t, nz.pal, b);
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

    /* ---- the hatch and the louvre in the bedroom ceiling ---- */
    near.deco.forEach(d => {
      if (!d.duct || !mine(d)) return;
      drawProp(ctx, d.prop, this.sx(d.x), this.sy(d.y + d.h), d.w, d.h, this.t, this.palOf(d), d.x, { role: 'duct' });
    });

    /* ---- floors ---- */
    near.ground.forEach(g => {
      if (!mine(g)) return;
      /* the bars are floor only while they are shut — with the key the mouth
         of the stairs is a hole in the pavement again */
      if (g.lock && this.run && this.run.metroKey) return;
      const y0 = this.sy(g.y);
      const a = Math.max(this.sx(g.x), -30), b = Math.min(this.sx(g.x + g.w), VW + 30);
      if (b <= a) return;
      paintFloor(ctx, this.floorOf(g), a, y0, b - a, VH - y0 + 320, this.palOf(g), this.t, camX);
    });

    /* ---- the bars over the metro steps: floor while they are shut ---- */
    near.deco.forEach(d => {
      if (!d.gate || !mine(d)) return;
      drawProp(ctx, d.prop, this.sx(d.x), this.sy(d.y + d.h), d.w, d.h, this.t, this.palOf(d), d.x,
               { role: 'gate', open: !!(this.run && this.run.metroKey), floorY: this.sy(d.y) });
    });

    /* ---- signage: the metro roundel, the arrow up the stairs. These are the
       one thing on the track she can run straight through, so they are drawn
       set back and dimmed rather than sitting up in her lane. ---- */
    ctx.save(); ctx.globalAlpha = .62;
    near.deco.forEach(d => {
      if (!d.sign || !mine(d)) return;
      drawProp(ctx, d.prop, this.sx(d.x), this.sy(d.y + d.h), d.w, d.h, this.t, this.palOf(d), d.x,
               { role: 'sign', floorY: this.sy(d.y),
                 locked: !!(d.lock && this.run && !this.run.metroKey) });
    });
    ctx.restore();

    near.platforms.forEach(p => {
      if (!mine(p)) return;
      const x0 = this.sx(p.x), y0 = this.sy(p.y);
      const hgt = p.h || 40;
      ctx.save();
      if (p.oneWay) { ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6; }
      drawPropTiled(ctx, p.prop, x0, y0, p.w, hgt, this.t, this.palOf(p), p.x,
                    { role: p.stair ? 'stair' : 'step', floorY: this.sy(p.base || 0),
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
      if (d.finish || d.shaft || d.sign || d.gateway || d.gate || d.duct || !mine(d)) return;
      drawPropTiled(ctx, d.prop, this.sx(d.x), this.sy(d.y + d.h), d.w, d.h, this.t, this.palOf(d), d.x);
    });
    ctx.restore();

    /* ---- checkpoint flags at the mouth of every place ---- */
    if (LY === 'main' && this.run && this.run.mode !== 'raw') W.stops.forEach((st, i) => {
      if (i === 0) return;
      const fx = this.sx(st.x);
      if (fx < -70 || fx > VW + 70) return;
      this.drawFlag(fx, this.sy(st.y || 0), !!(this.checkpoint && this.checkpoint.k >= i));
    });

    /* ---- obstacles. No rim any more: an object stops her because it is an
       object, and it reads as one — the shadow under it is the only cue. ---- */
    near.hazards.forEach(hz => {
      if (!mine(hz) || hz.smashed) return;
      const x0 = this.sx(hz.x), yTop = this.sy(hz.y + hz.h);
      const floorY = this.sy(hz.base || 0);
      /* The things the vet throws come out of her hand behind Lota, fly over
         her head in plain sight and drop into their slot half a second before
         she arrives — and once she is past, they fall out of the air and
         tumble to a stop instead of standing there. The box never moved. */
      if (hz.thrown && L && Boss.drawThrown(this, hz, x0, yTop, floorY)) {
        Boss.cue(this, hz, x0, yTop, floorY);
        return;
      }
      if (hz.kind === 'bird') {
        /* a gull's shadow belongs on the ground below it, which is also the
           cue that something is coming */
        ctx.save(); ctx.globalAlpha = .22;
        fillEll(ctx, x0 + hz.w / 2, floorY + 3, hz.w * 0.4, 5, '#1a1226');
        ctx.restore();
      } else if (hz.kind !== 'over') {
        ctx.save(); ctx.globalAlpha = .3;
        fillEll(ctx, x0 + hz.w / 2, this.sy(hz.y) + 3, hz.w * 0.56, 7, '#1a1226');
        ctx.restore();
      }
      drawPropTiled(ctx, hz.prop, x0, yTop, hz.w, hz.h, this.t, this.palOf(hz), hz.x,
                    { role: hz.kind, floorY: floorY });
      /* on the boss level every obstacle says what it wants: an arrow up over
         a thing to jump, and the gap itself picked out under a thing to duck */
      Boss.cue(this, hz, x0, yTop, floorY);
    });
    /* and what is still off the right-hand edge, announced before it arrives */
    Boss.edgeWarn(this);

    /* ---- finish arch ---- */
    near.deco.filter(d => d.finish).forEach(d => {
      drawProp(ctx, 'finish', this.sx(d.x), this.sy(d.y + d.h), d.w, d.h, this.t, {});
    });

    /* ---- treats ---- */
    near.bones.forEach(b => {
      if (b.got || !mine(b)) return;
      this.drawTreat(this.sx(b.x), this.sy(b.y) + Math.sin(this.t * 3 + b.i) * 5, b.cur);
    });

    /* ---- the key ---- */
    near.items.forEach(it => {
      if (it.got || !mine(it)) return;
      const bob = Math.sin(this.t * 2.6) * 6;
      if (it.kind === 'jetpack') {
        drawProp(ctx, 'jetpack', this.sx(it.x) - 34, this.sy(it.y) - 46 + bob, 68, 86, this.t, {}, it.x);
        return;
      }
      drawProp(ctx, 'keyMetro', this.sx(it.x) - 27, this.sy(it.y) - 18 + bob, 54, 36, this.t, {}, it.x);
    });

    /* ---- dust ---- */
    this.fx.dust.forEach(p => {
      ctx.save(); ctx.globalAlpha = clamp(p.life * 2, 0, .5);
      circle(ctx, this.sx(p.x), this.sy(p.y), p.r, '#fff'); ctx.restore();
    });

    /* ---- the foxes, tumbling along behind her ---- */
    if (this.foxes.length) {
      this.foxes.forEach((f, i) => {
        const fx = this.sx(f.x);
        if (fx < -90 || fx > VW + 90) return;
        drawFox(ctx, fx, this.sy(f.y), 0.78 - i * 0.045, f.run,
                f.air ? 'jump' : 'run', Math.sin(f.hop) * 0.1, this.t + i);
      });
    }

    /* ---- whoever is coming up the road behind her ---- */
    Boss.drawChase(this);

    /* ---- Lota ----
       On the turn she pivots on the spot: her own squeeze runs a little ahead
       of the camera's, so she is round before the view has finished coming
       round after her. ---- */
    if (L) {
      const spin = this.fx.spin;
      ctx.save();
      if (spin > 0) {
        const pl = clamp((1 - spin) * 1.45, 0, 1);
        const lx = this.sx(L.x), ly = this.sy(L.y);
        ctx.translate(lx, ly);
        ctx.scale(Math.max(0.1, Math.abs(Math.cos(pl * Math.PI))), 1);
        ctx.translate(-lx, -ly);
      }
      const flying = this.run && (this.run.fly || this.run.glide);
      if (flying) this.drawPack(this.sx(L.x), this.sy(L.y), !!this.run.fly);
      /* a scene may have her upside down, and in the arena she faces whichever
         way she is walking — neither ever happens on a normal run */
      if (L.rot || L.flip) {
        const lx2 = this.sx(L.x), ly2 = this.sy(L.y);
        ctx.translate(lx2, ly2 - 30);
        if (L.rot) ctx.rotate(L.rot);
        if (L.flip) ctx.scale(-1, 1);
        ctx.translate(-lx2, -(ly2 - 30));
      }
      drawLota(ctx, this.sx(L.x), this.sy(L.y), {
        state: L.state, t: this.t, run: L.runPhase, skin: Save.data.skin,
        face: this.state === 'crash' ? 'sad' : (flying ? 'happy' : undefined),
        shadow: flying ? false : undefined,
        tilt: this.state === 'crash' ? Math.sin(L.sitT * 3) * 0.22 - 0.08
              : (flying ? (this.run.fly ? -0.1 : 0.06) : undefined)
      });
      ctx.restore();
      if (this.state === 'crash' && this.stateT > 0.35) {
        ctx.save(); ctx.globalAlpha = clamp((this.stateT - 0.35) * 2, 0, 1);
        ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.fillText('?', this.sx(L.x) + 44, this.sy(L.y) - 74 + Math.sin(this.t * 4) * 3);
        ctx.restore();
      }
    }

    /* ---- the burst of energy, drawn over the whole picture ---- */
    Boss.drawBoost(this);

    /* ---- sparks ---- */
    this.fx.sparks.forEach(p => {
      ctx.save(); ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      circle(ctx, this.sx(p.x), this.sy(p.y), 3.4, p.c); ctx.restore();
    });

    /* ---- what a place puts in FRONT of everything: under water that is the
       blue of it, the bubbles and the light ---- */
    if (LY === 'main') {
      const zf = this.zoneAt(L ? L.x : 0).zone;
      if (zf.fg) {
        const b = this.camBase || 0;
        ctx.save(); zf.fg(ctx, VW, VH, camX, this.sy(b), this.t, zf.pal, b); ctx.restore();
      }
    }

    /* ---- speed streaks when she is really flying. A calm place — under
       water, deep in the wood — says no to them: there the bubbles and the
       trees flying past already say how fast she is going. ---- */
    const calm = LY !== 'main' || this.zoneAt(L ? L.x : 0).zone.calm;
    const spd = calm ? 0 : inv(speedAt(L ? L.x : 0), 520, SPEED.V_MAX);
    if (spd > 0.05) {
      ctx.save(); ctx.globalAlpha = spd * 0.3;
      for (let i = 0; i < 7; i++) {
        const r = makeRng(i * 31 + Math.floor(this.t * 12) * 17);
        const yy = r() * VH, len = 60 + r() * 130;
        line(ctx, VW - r() * VW, yy, VW - r() * VW - len, yy, '#fff', 2);
      }
      ctx.restore();
    }

    /* ---- the wind ----
       While the pack is running this is the only thing that says how fast she
       is going, and it has to say it quietly: long, soft, unhurried streaks
       and a few wisps of cloud tearing past, not the hard white dashes the
       street uses. ---- */
    if (this.run && (this.run.fly || this.run.glide)) {
      const k = this.run.fly ? 1 : 0.45;
      ctx.save();
      for (let i = 0; i < 16; i++) {
        const r = makeRng(i * 53 + Math.floor(this.t * 6) * 29);
        const yy = r() * VH, len = VW * (0.25 + r() * 0.6);
        const x0 = imod(r() * VW * 1.4 - this.t * (620 + r() * 500), VW + len) - len;
        const g2 = ctx.createLinearGradient(x0, 0, x0 + len, 0);
        g2.addColorStop(0, 'rgba(255,255,255,0)');
        g2.addColorStop(0.5, i % 3 ? 'rgba(255,255,255,.55)' : 'rgba(200,230,255,.5)');
        g2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = k * (0.25 + r() * 0.35);
        ctx.fillStyle = g2; ctx.fillRect(x0, yy, len, 1.4 + r() * 2.6);
      }
      /* and torn wisps of the cloud she is skimming */
      for (let i = 0; i < 5; i++) {
        const r = makeRng(i * 97 + Math.floor(this.t * 1.5) * 13);
        const yy = VH * (0.55 + r() * 0.4);
        const x0 = imod(r() * VW * 2 - this.t * (300 + r() * 260), VW + 340) - 170;
        ctx.globalAlpha = k * 0.22;
        fillEll(ctx, x0, yy, 90 + r() * 90, 12 + r() * 10, '#ffffff');
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
      const a = this.fx.warp / (this.fx.warpFull || 0.42);
      const k = a > 0.5 ? (1 - a) * 2 : a * 2;
      ctx.save(); ctx.globalAlpha = clamp(1 - k, 0, 1);
      ctx.fillStyle = this.fx.warpCol || '#12203a'; ctx.fillRect(0, 0, VW, VH);
      ctx.restore();
    }

    /* ---- vignette ---- */
    const g = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.42, VW / 2, VH / 2, VH * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,6,20,.34)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  },

  /** The pack strapped to her back, and what is coming out of the bottom of
      it. Drawn under her, so it reads as being on her rather than in front. */
  drawPack(x, y, hot) {
    const ctx = this.ctx, t = this.t;
    ctx.save(); ctx.translate(x - 24, y - 42);
    /* the two bottles */
    fillRR(ctx, -17, -30, 17, 44, 8, '#e8eef4');
    fillRR(ctx, 1, -27, 17, 41, 8, '#c2ccd6');
    ctx.strokeStyle = 'rgba(24,16,34,.42)'; ctx.lineWidth = 2.2; ctx.stroke();
    fillRR(ctx, -18, -9, 37, 9, 4, '#e2453c');
    fillRR(ctx, -18, -35, 37, 9, 4, '#f0c23a');
    ctx.save(); ctx.globalAlpha = .5;
    fillRR(ctx, -14, -25, 6, 32, 3, '#ffffff'); ctx.restore();
    /* the nozzles, and the flame */
    [-9, 10].forEach(px => {
      poly(ctx, [[px - 7, 14], [px + 7, 14], [px + 9, 25], [px - 9, 25]], '#8b98a6');
      const f = (hot ? 1 : 0.4) * (0.82 + Math.sin(t * 22 + px) * 0.18);
      ctx.save(); ctx.globalAlpha = .8;
      poly(ctx, [[px - 8, 25], [px + 8, 25], [px, 25 + 46 * f]], '#8fd6ff');
      ctx.globalAlpha = .92;
      poly(ctx, [[px - 4, 25], [px + 4, 25], [px, 25 + 26 * f]], '#ffffff');
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .2 * f;
      circle(ctx, px, 34, 24, '#8fd6ff'); ctx.restore();
    });
    ctx.restore();
    /* a thin trail of it hanging in the air behind her */
    for (let i = 0; i < 7; i++) {
      const ph = ((t * 1.6) + i * 0.14) % 1;
      ctx.save(); ctx.globalAlpha = (1 - ph) * (hot ? .4 : .18);
      circle(ctx, x - 24 - ph * 190, y - 24 + Math.sin(ph * 6 + i) * 9, 4 + ph * 11, '#dff0ff');
      ctx.restore();
    }
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

  /** the thing this level's track is littered with: a bone on level 1, one of
      her squeaky balls on level 2, and on the boss level energy — which is
      not a score at all, only speed she has not spent yet */
  drawTreat(x, y, cur) {
    const c = cur || (this.world && this.world.currency) || 'b';
    if (c === 'e') { Levels.energyIcon(this.ctx, x, y, 1, this.t); return; }
    if (c !== 't') { this.drawBone(x, y); return; }
    const ctx = this.ctx, r = 15;
    ctx.save(); ctx.translate(x, y);
    ctx.save(); ctx.globalAlpha = .35 + Math.sin(this.t * 4) * .12;
    circle(ctx, 0, 0, 22, '#ffd8a8'); ctx.restore();
    circle(ctx, 0, 0, r, '#ff6b7a');
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
    ctx.fillStyle = '#4fc3ea';
    ctx.beginPath(); ctx.moveTo(-r, -r * .1);
    ctx.quadraticCurveTo(0, -r * .7, r, -r * .1);
    ctx.lineTo(r, r * .35); ctx.quadraticCurveTo(0, -r * .18, -r, r * .35);
    ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(60,20,30,.4)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
    ctx.save(); ctx.globalAlpha = .55;
    fillEll(ctx, -r * .36, -r * .42, r * .3, r * .18, '#fff', -0.5); ctx.restore();
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
  /** The strip: the settled page, plus the one sliding past it. Each level
      has the same room — a locked one is simply the colour taken out of it. */
  renderLobby() {
    const ctx = this.ctx, VW = this.VW;
    const k = this.lobbySlide;
    if (k >= 1) { this.drawLobbyRoom(0, this.lobbyPage); return; }
    const dir = this.lobbyPage > this.lobbyFrom ? 1 : -1;
    const e = smooth(k);
    const oFrom = -e * VW * dir;
    this.drawLobbyRoom(oFrom, this.lobbyFrom);
    this.drawLobbyRoom(oFrom + dir * VW, this.lobbyPage);
    /* a seam of shadow so the two rooms read as separate places */
    const seam = oFrom + (dir > 0 ? VW : 0);
    ctx.save(); ctx.globalAlpha = .5;
    const g = ctx.createLinearGradient(seam - 26, 0, seam + 26, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(seam - 26, 0, 52, this.VH); ctx.restore();
  },

  drawLobbyRoom(ox, page) {
    const ctx = this.ctx, VW = this.VW, VH = this.VH;
    if (ox <= -VW || ox >= VW) return;
    const level = page + 1;
    const locked = !Levels.unlocked(level);
    ctx.save();
    ctx.beginPath(); ctx.rect(ox, 0, VW, VH); ctx.clip();
    ctx.translate(ox, 0);
    this.drawRoom(level, locked);
    ctx.restore();

    if (locked) {
      /* drain the colour out of just this room, then dim it */
      ctx.save();
      ctx.beginPath(); ctx.rect(ox, 0, VW, VH); ctx.clip();
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = 'hsl(0,0%,50%)'; ctx.fillRect(ox, 0, VW, VH);
      /* lift the blacks a little so it still reads as the same room,
         only with the colour taken out of it */
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(226,226,236,.13)'; ctx.fillRect(ox, 0, VW, VH);
      ctx.fillStyle = 'rgba(12,10,20,.20)'; ctx.fillRect(ox, 0, VW, VH);
      ctx.restore();
      this.drawBigLock(ox + VW * this.lobbyFocus, VH * 0.345, level);
    }
  },

  /** one home page — the same room every time, so a locked level looks
      exactly like the one you already know, only shut */
  drawRoom(level, locked) {
    const ctx = this.ctx, VW = this.VW, VH = this.VH, t = this.t;
    const floorY = VH * 0.56;
    const pal = { far: '#3a2b56', mid: '#4d3a70' };
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

    /* the shelf carries what this level pays out: treats, toys, or both */
    fillRR(ctx, VW * 0.07, VH * 0.24, VW * 0.19, 12, 4, '#8a6440');
    const picks = Levels.get(level).picks;
    if (level === 4) {
      /* nothing is collected on the boss level — the prize sits there instead */
      for (let i = 0; i < 3; i++) {
        const a = t * 0.7 + i * 2.1;
        ctx.save(); ctx.globalAlpha = .9;
        fillEll(ctx, VW * 0.09 + i * 34, VH * 0.24 - 14 + Math.sin(a) * 3, 8, 5,
          'hsla(' + ((i * 90 + t * 46) % 360) + ',90%,72%,1)', a * .3);
        ctx.restore();
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const x = VW * 0.09 + i * 34, y = VH * 0.24 - 12;
        const toy = picks === 't' || (picks === 'bt' && i % 2 === 1);
        if (toy) Levels.toyBall(ctx, x, y - 2, 11, t, i); else this.drawBone(x, y, 0.72);
      }
    }

    /* floor + rug */
    ctx.fillStyle = '#6b4a2c'; ctx.fillRect(0, floorY, VW, VH - floorY);
    fillRR(ctx, 0, floorY - 10, VW, 14, 0, '#8a6440');
    ctx.save(); ctx.globalAlpha = .35;
    for (let x = 0; x < VW; x += 90) line(ctx, x, floorY, x, VH, '#4f351d', 3);
    ctx.restore();
    /* her corner of the room: dead centre when there is room for her there,
       off to one side when the buttons have taken the middle */
    const fx = VW * this.lobbyFocus, side = this.lobbyFocus < 0.45;
    const sz = side ? this.lobbySize : 1;
    const rugR = side ? VW * 0.24 * sz : VW * 0.3;
    fillEll(ctx, fx, floorY + 46, rugR, 40, '#8a4a63');
    ctx.save(); ctx.globalAlpha = .5; fillEll(ctx, fx, floorY + 46, rugR * 0.8, 30, '#c96f8a'); ctx.restore();

    /* the level's number, painted on the wall above the rug */
    ctx.save(); ctx.globalAlpha = .12;
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 ' + Math.round(VH * 0.3 * sz) + 'px ' + 'system-ui, sans-serif';
    ctx.fillText(String(level), fx, floorY - VH * 0.13);
    ctx.restore();

    /* Lota, sitting and being cute. A locked room is one she has not been
       let into yet, so she only sits on the page you actually own. */
    if (!locked) {
      const cycle = (t * 0.5) % 4;
      drawLota(ctx, fx, floorY + 24, {
        state: 'sit', t: t, skin: Save.data.skin, scale: 1.42 * sz,
        face: 'calm', paw: cycle > 2.4 && cycle < 3.4,
        tilt: Math.sin(t * 0.8) * 0.13
      });
      for (let i = 0; i < 3; i++) {
        const ph = (t * 0.35 + i * 0.33) % 1;
        ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.55;
        const hx = fx + 48 * sz + Math.sin(ph * 6 + i) * 12, hy = floorY - 60 * sz - ph * 130;
        ctx.translate(hx, hy); ctx.scale(1.1, 1.1);
        ctx.beginPath();
        ctx.moveTo(0, 4); ctx.bezierCurveTo(-7, -3, -3, -9, 0, -4);
        ctx.bezierCurveTo(3, -9, 7, -3, 0, 4); ctx.fillStyle = '#ff8fb0'; ctx.fill();
        ctx.restore();
      }
    } else {
      /* an empty rug, with her collar left on it */
      ctx.save(); ctx.globalAlpha = .8;
      ctx.beginPath(); ctx.ellipse(fx, floorY + 40, 26, 9, -0.1, 0, TAU);
      ctx.strokeStyle = '#8a4a63'; ctx.lineWidth = 7; ctx.stroke();
      circle(ctx, fx + 2, floorY + 49, 4.4, '#c9962c');
      ctx.restore();
    }

    const vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VH);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(8,4,16,.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  },

  /** the padlock hanging over a level that has not been earned */
  drawBigLock(x, y, level) {
    const ctx = this.ctx;
    const sw = 1 + Math.sin(this.t * 1.6) * 0.02;
    ctx.save(); ctx.translate(x, y); ctx.scale(sw, sw);
    ctx.save(); ctx.globalAlpha = .45;
    circle(ctx, 0, 6, 64, '#0b0716'); ctx.restore();
    ctx.strokeStyle = '#ffd870'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -14, 21, Math.PI, 0); ctx.stroke();
    fillRR(ctx, -30, -14, 60, 48, 12, '#ffd870');
    fillRR(ctx, -26, -10, 52, 40, 9, '#f2b93a');
    circle(ctx, 0, 6, 7, '#6b4a12');
    fillRR(ctx, -3, 6, 6, 14, 3, '#6b4a12');
    ctx.restore();
  },

  /* ---------- the picture that stands in for a level with no arena ---------- */
  renderPreview() {
    Levels.picture(this.previewLevel, this.ctx, this.VW, this.VH, this.t);
    const ctx = this.ctx;
    const vg = ctx.createLinearGradient(0, this.VH * 0.55, 0, this.VH);
    vg.addColorStop(0, 'rgba(8,4,16,0)'); vg.addColorStop(1, 'rgba(8,4,16,.72)');
    ctx.fillStyle = vg; ctx.fillRect(0, this.VH * 0.55, this.VW, this.VH * 0.45);
  }

};
