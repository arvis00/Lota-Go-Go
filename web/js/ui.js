'use strict';
/* ---------------------------------------------------------------
   ui.js — screens, HUD, the treat shop
----------------------------------------------------------------*/
const $ = id => document.getElementById(id);

const UI = {
  winShown: false, toastT: null,

  init() {
    $('btnPlay').onclick    = () => { Sfx.init(); Sfx.resume(); Sfx.click(); Game.startRun(); };
    $('btnSkins').onclick   = () => { Sfx.click(); this.showSkins(); };
    $('btnSkinsBack').onclick = () => { Sfx.click(); this.showLobby(); };
    $('btnRetry').onclick   = () => { Sfx.click(); Game.startRun(true); };
    $('btnLobby').onclick   = () => { Sfx.click(); this.bank(false); Game.lobby(); };
    $('btnWinAgain').onclick = () => { Sfx.click(); Game.startRun(); };
    $('btnWinLobby').onclick = () => { Sfx.click(); Game.lobby(); };
    $('btnPause').onclick   = () => { Sfx.click(); this.pause(); };
    $('btnResume').onclick  = () => { Sfx.click(); this.resume(); };
    $('btnPauseLobby').onclick = () => { Sfx.click(); this.bank(false); Game.lobby(); };
    $('btnSound').onclick   = () => {
      Save.data.sound = Save.data.sound ? 0 : 1; Save.write();
      Sfx.on = !!Save.data.sound; Sfx.init(); Sfx.resume(); if (Sfx.on) Sfx.click();
      this.syncSound();
    };
    this.syncSound();

    /* portrait nudge */
    const hint = document.createElement('div');
    hint.id = 'rotHint';
    hint.style.cssText = 'margin:16px auto 0;display:none;width:max-content;' +
      'background:rgba(20,12,36,.72);border:2px solid rgba(255,255,255,.2);border-radius:16px;padding:9px 15px;' +
      'font-weight:700;font-size:13px;line-height:1;font-family:var(--font);white-space:nowrap;pointer-events:none';
    hint.textContent = '↻ Pasukite ekraną horizontaliai';
    document.querySelector('.logo').appendChild(hint);
    setInterval(() => {
      hint.style.display = (Game.portrait && Game.state === 'lobby') ? 'block' : 'none';
    }, 500);
  },

  syncSound() { $('btnSound').textContent = Save.data.sound ? '♪' : '✕'; $('btnSound').style.opacity = Save.data.sound ? 1 : .5; },

  hideAll() {
    ['hud', 'screen-lobby', 'screen-skins', 'screen-over', 'screen-win', 'screen-pause']
      .forEach(id => $(id).classList.add('hidden'));
  },

  showLobby() {
    this.hideAll(); this.winShown = false;
    $('screen-lobby').classList.remove('hidden');
    $('lobbyBones').textContent = Save.data.bones;
    const d = Save.data;
    $('lobbyBest').innerHTML = d.finished
      ? 'Finišas pasiektas ×' + d.finished + '<br>Rekordas: ' + d.bestBones + ' 🦴'
      : (d.bestZone ? 'Toliausiai: ' + d.bestZone : 'Pirmyn į Londoną!');
    if (Game.state !== 'lobby') Game.lobby();
  },

  showHud() {
    this.hideAll();
    $('hud').classList.remove('hidden');
    this.setBones(0); this.setProgress(0);
  },

  /** Treats are paid out once, when the run actually ends — otherwise every
      death at a checkpoint would pay again. */
  bank(finished) {
    const r = Game.run;
    if (!r || r.banked) return 0;
    r.banked = true;
    const base = r.bones === 15 ? 30 : r.bones;
    const earned = base + (finished ? 10 : 0);
    Save.addBones(earned);
    if (earned > Save.data.bestBones) Save.data.bestBones = earned;
    Save.write();
    return earned;
  },

  showOver() {
    const r = Game.run;
    const cp = Game.checkpoint || { start: true, name: ZONES[0].name };
    const zoneName = Game.zoneAt(Game.lota.x).zone.name;
    Save.data.bestZone = zoneName; Save.write();
    const pending = (r.bones === 15 ? 30 : r.bones);

    this.hideAll();
    $('screen-over').classList.remove('hidden');
    $('overSub').textContent = 'Lota sustojo: ' + zoneName + ' · nubėgta ' +
      Math.round(clamp(Game.lota.x / Game.world.finishX, 0, 1) * 100) + '%';
    $('overStats').innerHTML =
      row('Surinkti skaniukai', r.bones + ' / 15') +
      row('Tęsi nuo', cp.start ? 'pradžios' : cp.name, true);
    $('btnRetry').textContent = cp.start ? 'Bandyti iš naujo' : 'Tęsti nuo ' + cp.name;
    $('btnLobby').textContent = pending ? 'Baigti · +' + pending + ' 🦴' : 'Grįžti į Lobby';
  },

  showWin() {
    this.winShown = true;
    const r = Game.run;
    const base = r.bones === 15 ? 30 : r.bones;
    const earned = this.bank(true);
    Save.data.finished = (Save.data.finished || 0) + 1;
    Save.data.bestZone = 'Londonas — finišas!';
    Save.write();

    this.hideAll();
    $('screen-win').classList.remove('hidden');
    const mins = Math.floor(r.time / 60), secs = Math.round(r.time % 60);
    $('winSub').textContent = 'Nuo namų iki Londono per ' + mins + ':' + String(secs).padStart(2, '0') +
      (r.shortcuts ? ' · trumpiniai: ' + r.shortcuts : '') +
      (r.deaths ? ' · bandymai: ' + (r.deaths + 1) : ' · be nė vienos klaidos!');
    $('winStats').innerHTML =
      row('Surinkti skaniukai', r.bones + ' / 15') +
      (r.bones === 15 ? row('Visi 15 — dvigubai!', r.bones + ' → ' + base) : '') +
      row('Už finišą', '+10') +
      row('Iš viso', '+' + earned + ' 🦴', true);
  },

  pause() { if (Game.state !== 'run') return; Game.state = 'pause'; $('screen-pause').classList.remove('hidden'); },
  resume() { if (Game.state !== 'pause') return; $('screen-pause').classList.add('hidden'); Game.state = 'run'; Game.last = performance.now(); },

  setBones(n) { $('hudBones').textContent = n; },
  setZone(name) { $('hudZone').textContent = name; },
  setProgress(p) { $('hudBarFill').style.width = (p * 100).toFixed(1) + '%'; },
  tut(on) { $('tut').classList.toggle('show', !!on); },
  toast(msg, sub) {
    const el = $('toast');
    $('toastMain').textContent = msg;
    $('toastSub').textContent = sub || '';
    el.classList.add('show');
    clearTimeout(this.toastT);
    this.toastT = setTimeout(() => el.classList.remove('show'), sub ? 2100 : 1500);
  },

  /* ---------------- skins ---------------- */
  showSkins() {
    this.hideAll();
    $('screen-skins').classList.remove('hidden');
    $('skinsBones').textContent = Save.data.bones;
    const grid = $('skinGrid');
    grid.innerHTML = '';
    SKINS.forEach(sk => {
      const owned = Save.owns(sk.id), sel = Save.data.skin === sk.id;
      const card = document.createElement('div');
      card.className = 'skin-card' + (sel ? ' sel' : '') + (owned ? '' : ' locked');

      const cv = document.createElement('canvas');
      const W = 150, H = 118, dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.height = H + 'px';
      const c = cv.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, owned ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.22)');
      g.addColorStop(1, 'rgba(0,0,0,.04)');
      rr(c, 0, 0, W, H, 14); c.fillStyle = g; c.fill();
      c.save(); if (!owned) c.globalAlpha = .45;
      drawLota(c, W / 2 - 4, H - 10, { state: 'sit', t: 1.2, skin: sk.id, scale: 1.12, shadow: true, face: 'calm', tilt: -0.07 });
      c.restore();
      if (!owned) {
        c.save(); c.globalAlpha = .85; c.translate(W - 24, 20);
        fillRR(c, -9, -2, 18, 15, 3, '#ffd870');
        c.beginPath(); c.arc(0, -2, 6, Math.PI, 0); c.strokeStyle = '#ffd870'; c.lineWidth = 3; c.stroke();
        circle(c, 0, 5, 2.6, '#3a2508'); c.restore();
      }
      card.appendChild(cv);

      const nm = document.createElement('div');
      nm.className = 'skin-name'; nm.textContent = sk.name;
      card.appendChild(nm);

      const tag = document.createElement('div');
      if (sel) { tag.className = 'skin-tag sel'; tag.textContent = 'DĖVIMA'; }
      else if (owned) { tag.className = 'skin-tag own'; tag.textContent = 'Apsirengti'; }
      else if (Save.data.bones >= sk.price) { tag.className = 'skin-tag buy'; tag.textContent = sk.price + ' 🦴'; }
      else { tag.className = 'skin-tag poor'; tag.textContent = sk.price + ' 🦴'; }
      card.appendChild(tag);

      card.onclick = () => {
        Sfx.init(); Sfx.resume();
        if (Save.owns(sk.id)) { Save.data.skin = sk.id; Save.write(); Sfx.click(); this.showSkins(); return; }
        if (Save.data.bones >= sk.price) {
          Save.data.bones -= sk.price;
          Save.data.owned.push(sk.id);
          Save.data.skin = sk.id;
          Save.write(); Sfx.bone(); this.showSkins();
        } else {
          Sfx.tone(180, .18, 'square', .3, 120);
          this.toast('Reikia dar ' + (sk.price - Save.data.bones) + ' skaniukų');
        }
      };
      grid.appendChild(card);
    });
  }
};
function row(a, b, total) {
  return '<div class="row' + (total ? ' total' : '') + '"><span>' + a + '</span><span class="hi">' + b + '</span></div>';
}
