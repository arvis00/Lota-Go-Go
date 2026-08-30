'use strict';
/* ---------------------------------------------------------------
   ui.js — screens, HUD, the outfit shops

   There is one lobby page per level and one shop per level. What a
   level pays out is spent on that level's page and nowhere else, so
   every shop reads its own purse out of Save.
----------------------------------------------------------------*/
const $ = id => document.getElementById(id);

/** price tags: treats, toys, or both */
function costHtml(cost) {
  if (!cost) return 'BOSO PRIZAS';
  const parts = [];
  if (cost.b) parts.push('<span class="bone-ico"></span>' + cost.b);
  if (cost.t) parts.push('<span class="toy-ico"></span>' + cost.t);
  return parts.length ? parts.join('<i>+</i>') : 'Nemokama';
}
function walletHtml(level) {
  const w = Save.purse(level), picks = Levels.get(level).picks, out = [];
  if (picks.indexOf('b') >= 0) out.push('<span class="cur"><span class="bone-ico"></span>' + w.b + '</span>');
  if (picks.indexOf('t') >= 0) out.push('<span class="cur"><span class="toy-ico"></span>' + w.t + '</span>');
  if (!out.length) out.push('<span class="none">Čia nieko nerenkama</span>');
  return out.join('');
}

/** the icons a level's finish bonus is paid in — level 3 pays in both */
function payHtml(level, n) {
  const picks = Levels.get(level).picks || 'b';
  return picks.split('').map(k =>
    '+' + n + '<span class="' + (k === 't' ? 'toy-ico' : 'bone-ico') + '"></span>').join(' ');
}

const UI = {
  winShown: false, toastT: null, skinsLevel: 1, modeLevel: 1,

  init() {
    $('btnPlay').onclick    = () => { Sfx.init(); Sfx.resume(); this.play(); };
    $('btnSkins').onclick   = () => { Sfx.init(); Sfx.resume(); this.openSkins(); };
    $('btnSkinsBack').onclick = () => { Sfx.click(); this.showLobby(); };
    $('btnRetry').onclick   = () => { Sfx.click(); Game.startRun(true); };
    $('btnLobby').onclick   = () => { Sfx.click(); this.bank(false); Game.lobby(); };
    $('btnWinAgain').onclick = () => { Sfx.click(); Game.startRun(false, Game.run.level); };
    $('btnWinLobby').onclick = () => { Sfx.click(); Game.lobby(); };
    $('btnPause').onclick   = () => { Sfx.click(); this.pause(); };
    $('btnResume').onclick  = () => { Sfx.click(); this.resume(); };
    $('btnPauseLobby').onclick = () => { Sfx.click(); this.bank(false); Game.lobby(); };
    $('btnPreviewBack').onclick = () => { Sfx.click(); this.backFromPreview(); };
    $('btnModeCp').onclick  = () => { Sfx.click(); this.pickMode('cp'); };
    $('btnModeRaw').onclick = () => { Sfx.click(); this.pickMode('raw'); };
    $('btnModeBack').onclick = () => { Sfx.click(); this.showLobby(); };
    $('lobbyMode').onclick  = () => { Sfx.init(); Sfx.resume(); Sfx.click(); this.showMode(Game.lobbyLevel()); };
    $('btnPreviewSkins').onclick = () => { Sfx.click(); this.showSkins(Game.previewLevel); };
    $('btnPagePrev').onclick = () => Game.gotoLobbyPage(Game.lobbyPage - 1);
    $('btnPageNext').onclick = () => Game.gotoLobbyPage(Game.lobbyPage + 1);
    $('btnSound').onclick   = () => {
      Save.data.sound = Save.data.sound ? 0 : 1; Save.write();
      Sfx.on = !!Save.data.sound; Sfx.init(); Sfx.resume(); if (Sfx.on) Sfx.click();
      this.syncSound();
    };
    /* the songs have their own switch: turning them off leaves the barks,
       the boings and the treats exactly where they were */
    $('btnMusic').onclick   = () => {
      Save.data.music = Save.data.music ? 0 : 1; Save.write();
      Music.setOn(!!Save.data.music);
      this.syncSound();
      if (Music.on) { Sfx.init(); Sfx.resume(); Music.preview(Game.lobbyLevel()); }
    };
    $('btnReload').onclick  = () => { Sfx.click(); this.hardReload(); };
    $('buildTag').textContent = BUILD;
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

  syncSound() {
    $('btnSound').textContent = Save.data.sound ? '♪' : '✕';
    $('btnSound').style.opacity = Save.data.sound ? 1 : .5;
    $('btnMusic').textContent = Save.data.music ? '♫' : '✕';
    $('btnMusic').style.opacity = Save.data.music ? 1 : .5;
  },

  /** Added to the home screen there is no address bar and no reload button,
      so the lobby carries one: it throws away every cached copy of the game,
      pulls each file down again and comes back on a fresh address. The date
      next to it is the build that is actually running. */
  hardReload() {
    this.toast('Atnaujinama…', BUILD);
    let gone = false;
    const go = () => {
      if (gone) return;
      gone = true;
      location.replace(location.pathname + '?v=' + Date.now());
    };
    const jobs = [];
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        jobs.push(navigator.serviceWorker.getRegistrations()
          .then(rs => Promise.all(rs.map(r => r.unregister()))));
      }
      if (window.caches) jobs.push(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))));
      /* `cache: 'reload'` is the part that matters: it refetches each script
         past the cache and writes the new copy back, so the reload that
         follows gets today's game and not last week's */
      const urls = [location.pathname];
      document.querySelectorAll('script[src], link[rel="stylesheet"]')
        .forEach(el => urls.push(el.src || el.href));
      urls.forEach(u => jobs.push(fetch(u, { cache: 'reload' }).catch(() => {})));
    } catch (e) { /* an old browser: the plain reload below still happens */ }
    Promise.all(jobs).catch(() => {}).then(go);
    setTimeout(go, 4000);      // never hang on a dead connection
  },

  hideAll() {
    ['hud', 'screen-lobby', 'screen-skins', 'screen-over', 'screen-win', 'screen-pause', 'screen-preview',
     'screen-mode']
      .forEach(id => $(id).classList.add('hidden'));
  },

  /* ---------------- lobby ---------------- */
  showLobby() {
    this.hideAll(); this.winShown = false;
    $('screen-lobby').classList.remove('hidden');
    this.lobbyPageChanged();
    if (Game.state !== 'lobby') Game.lobby();
    this.announceKeys();
  },

  /** the overlay fades while the room slides, so the buttons never sit
      over the wrong level's page */
  lobbyFade(on) { $('screen-lobby').classList.toggle('sliding', !!on); },

  /** re-dress the overlay for whichever page is now under it */
  lobbyPageChanged() {
    const level = Game.lobbyLevel(), L = Levels.get(level);
    const open = Levels.unlocked(level);

    $('lobbySub').textContent = L.sub;
    $('lobbyWallet').innerHTML = walletHtml(level);

    const play = $('btnPlay'), skins = $('btnSkins'), note = $('lobbyLock');
    play.classList.toggle('shut', !open);
    skins.classList.toggle('shut', !open);
    play.textContent = open ? (L.playable ? 'ŽAISTI' : 'NUOTRAUKA') : '🔒 ŽAISTI';
    skins.textContent = open ? 'APRANGOS' : '🔒 APRANGOS';

    if (!open) {
      note.classList.remove('hidden');
      note.innerHTML = '<b>' + level + ' lygio raktas</b><br>Reikia: ' + Levels.blockedBy(level) + '.';
    } else {
      note.classList.add('hidden');
    }

    /* Once the question has been answered it is never asked again — from then
       on the answer just sits above the buttons, and tapping it changes it. */
    const chip = $('lobbyMode'), m = open && L.playable ? Levels.mode(level) : null;
    chip.classList.toggle('hidden', !m || !Levels.chooses(level));
    if (m) {
      chip.classList.toggle('raw', m === 'raw');
      chip.innerHTML = Levels.modeName(m) + ' · <b>už finišą ' + payHtml(level, Levels.bonus(level, m)) +
        '</b><span>BAKSTELĖK, KAD PAKEISTUM</span>';
    }

    if (open && L.playable) {
      const ico = L.picks.indexOf('t') >= 0 ? ' 🧸' : ' 🦴';
      const shop = Levels.shop(level);
      const own = shop.filter(s => Save.owns(s.id)).length;
      /* the finish that counts towards the next level is the one run without
         the flags, so the lobby says outright whether it has happened yet */
      const raws = Save.rawClears(level);
      const head = Save.clears(level)
        ? 'Finišas ×' + Save.clears(level) + ' · rekordas ' + Save.best(level) + ico +
          '<br>' + (raws ? '🔑 be k. t. ×' + raws : 'Be kontrolinių taškų — dar nė karto')
        : (Save.far(level) ? 'Toliausiai: ' + Save.far(level)
          : (level === 1 ? 'Pirmyn į Londoną!' : 'Pirmyn prie jūros!'));
      $('lobbyBest').innerHTML = head + (shop.length ? '<br>Aprangos: ' + own + ' / ' + shop.length : '');
    } else if (open) {
      const shop = Levels.shop(level);
      const own = shop.filter(s => Save.owns(s.id)).length;
      $('lobbyBest').innerHTML = shop.length
        ? 'Aprangos: ' + own + ' / ' + shop.length
        : 'Prizas: 2 aprangos';
    } else {
      $('lobbyBest').innerHTML = 'Užrakinta';
    }

    /* arrows + dots */
    $('btnPagePrev').classList.toggle('off', Game.lobbyPage <= 0);
    $('btnPageNext').classList.toggle('off', Game.lobbyPage >= LEVELS.length - 1);
    const dots = $('lobbyDots');
    dots.innerHTML = '';
    LEVELS.forEach((lv, i) => {
      const b = document.createElement('i');
      if (i === Game.lobbyPage) b.className = 'on';
      else if (!Levels.unlocked(lv.n)) b.className = 'shut';
      dots.appendChild(b);
    });
  },

  play() {
    const level = Game.lobbyLevel(), L = Levels.get(level);
    if (!Levels.unlocked(level)) return this.refuse(level);
    Sfx.click();
    if (!L.playable) return Game.showPreview(level);
    /* the choice is put once, the first time this level is played; after that
       PLAY starts straight away with whatever was answered */
    if (Levels.chooses(level) && !Save.mode(level)) return this.showMode(level);
    Game.startRun(false, level);
  },

  /* ---------------- with or without checkpoints ---------------- */
  showMode(level) {
    this.modeLevel = level;
    const L = Levels.get(level);
    /* the room keeps showing behind it, but the pages stop sliding: the answer
       belongs to the level that was under the button when it was asked */
    Game.state = 'mode';
    this.hideAll();
    $('screen-mode').classList.remove('hidden');
    $('modeSub').textContent = L.name + ' — kaip norėtum ją bėgti?';
    $('modeCpPay').innerHTML = 'Už finišą ' + payHtml(level, Levels.bonus(level, 'cp'));
    $('modeRawPay').innerHTML = 'Už finišą ' + payHtml(level, Levels.bonus(level, 'raw'));
  },
  pickMode(mode) {
    const level = this.modeLevel;
    Save.mode(level, mode);
    Game.startRun(false, level, mode);
  },
  openSkins() {
    const level = Game.lobbyLevel();
    if (!Levels.unlocked(level)) return this.refuse(level);
    Sfx.click(); this.showSkins(level);
  },
  /* the note under the logo already spells out what is missing, so the
     toast only has to say that the button did nothing */
  refuse(level) { Sfx.locked(); this.toast('🔒 Užrakinta'); },

  /** the moment a key is earned, say so — once */
  announceKeys() {
    if (!Save.data.keys) Save.data.keys = {};
    for (let n = 2; n <= LEVELS.length; n++) {
      if (Levels.unlocked(n) && !Save.data.keys[n]) {
        Save.data.keys[n] = 1; Save.write();
        Sfx.init(); Sfx.resume(); Sfx.unlock();
        this.toast('🔑 ' + n + ' lygio raktas!', 'Visos spynos atrakintos');
        return;
      }
    }
  },

  /* ---------------- the level picture ---------------- */
  showPreview(level) {
    const L = Levels.get(level);
    this.hideAll();
    $('screen-preview').classList.remove('hidden');
    $('previewName').textContent = L.name;
    $('previewSub').textContent = L.sub;
    $('previewNote').innerHTML = L.collect +
      '<br>Trasa dar nepastatyta — kol kas čia tik nuotrauka.';
    $('btnPreviewSkins').classList.toggle('hidden', !Levels.shop(level).length && !Levels.prize(level).length);
  },
  backFromPreview() { this.showLobby(); },

  showHud() {
    this.hideAll();
    $('hud').classList.remove('hidden');
    /* the HUD counts whatever this level collects, and says how many of them
       there are — level 1 hides bones, level 2 hides toys */
    const W = Game.world;
    $('hudIco').className = W.currency === 't' ? 'toy-ico' : 'bone-ico';
    $('hudTotal').textContent = '/' + W.treats;
    /* the question is only ever asked once, so the answer rides in the HUD:
       which way this run is being played, and what the finish is worth */
    const m = (Game.run && Game.run.mode) || 'cp', badge = $('hudMode');
    badge.classList.toggle('raw', m === 'raw');
    badge.innerHTML = Levels.modeShort(m) +
      '<span class="pay">' + payHtml(Game.run.level || 1, Levels.bonus(Game.run.level || 1, m)) + '</span>';
    this.setBones(0); this.setProgress(0);
  },

  /** Treats are paid out once, when the run actually ends — otherwise every
      death at a checkpoint would pay again. They land in the purse of the
      level they were found on.

      Crossing the finish line is what the mode is worth: several times as much
      with the checkpoints turned off. On a level that collects both currencies
      that bonus is paid into both purses, since the outfits there want both. */
  bank(finished) {
    const r = Game.run;
    if (!r || r.banked) return 0;
    r.banked = true;
    const W = Game.world, level = r.level || 1;
    const base = r.bones === W.treats ? W.treats * 2 : r.bones;
    const bonus = finished ? Levels.bonus(level, r.mode) : 0;
    Save.earn(level, W.currency, base + bonus);
    (Levels.get(level).picks || '').split('').forEach(k => {
      if (k !== W.currency && bonus) Save.earn(level, k, bonus);
    });
    Save.best(level, base + bonus);
    Save.write();
    return base + bonus;
  },

  showOver() {
    const r = Game.run, W = Game.world;
    const cp = Game.checkpoint || { start: true, name: W.zoneList[0].name };
    const zoneName = Game.zoneAt(Game.lota.x).zone.name;
    const ico = W.currency === 't' ? '🧸' : '🦴';
    const what = W.currency === 't' ? 'Surinkti žaisliukai' : 'Surinkti skaniukai';
    Save.far(r.level || 1, zoneName);
    const pending = (r.bones === W.treats ? W.treats * 2 : r.bones);

    this.hideAll();
    $('screen-over').classList.remove('hidden');
    $('overSub').textContent = 'Lota sustojo: ' + zoneName + ' · nubėgta ' +
      Math.round(clamp(Game.lota.x / W.finishX, 0, 1) * 100) + '%';
    const raw = r.mode === 'raw';
    $('overStats').innerHTML =
      row(what, r.bones + ' / ' + W.treats) +
      (raw ? row('Be kontrolinių taškų', 'viskas iš naujo', true)
           : row('Tęsi nuo', cp.start ? 'pradžios' : cp.name, true));
    $('btnRetry').textContent = cp.start ? 'Bandyti iš naujo' : 'Tęsti nuo ' + cp.name;
    $('btnLobby').textContent = pending ? 'Baigti · +' + pending + ' ' + ico : 'Grįžti į Lobby';
  },

  showWin() {
    this.winShown = true;
    const r = Game.run, W = Game.world;
    const all = W.treats, ico = W.currency === 't' ? '🧸' : '🦴';
    const what = W.currency === 't' ? 'Surinkti žaisliukai' : 'Surinkti skaniukai';
    const base = r.bones === all ? all * 2 : r.bones;
    const bonus = Levels.bonus(r.level || 1, r.mode);
    const earned = this.bank(true);
    const last = W.zoneList[W.zoneList.length - 1].name;
    Save.markCleared(r.level || 1, r.mode);
    Save.far(r.level || 1, last + ' — finišas!');
    Save.write();

    this.hideAll();
    $('screen-win').classList.remove('hidden');
    const mins = Math.floor(r.time / 60), secs = Math.round(r.time % 60);
    const trip = (r.level || 1) === 1 ? 'Nuo namų iki Londono per ' : 'Nuo viešbučio iki miško per ';
    $('winSub').textContent = trip + mins + ':' + String(secs).padStart(2, '0') +
      (r.mode === 'raw' ? ' · be kontrolinių taškų' : '') +
      (r.shortcuts ? ' · trumpiniai: ' + r.shortcuts : '') +
      (r.deaths ? ' · bandymai: ' + (r.deaths + 1) : ' · be nė vienos klaidos!');
    $('winStats').innerHTML =
      row(what, r.bones + ' / ' + all) +
      (r.bones === all ? row('Visi ' + all + ' — dvigubai!', r.bones + ' → ' + base) : '') +
      row('Už finišą ' + (r.mode === 'raw' ? 'be kontrolinių taškų' : 'su kontroliniais taškais'), '+' + bonus) +
      row('Iš viso', '+' + earned + ' ' + ico, true);
  },

  pause() { if (Game.state !== 'run') return; Game.state = 'pause'; Music.pause(); $('screen-pause').classList.remove('hidden'); },
  resume() { if (Game.state !== 'pause') return; $('screen-pause').classList.add('hidden'); Game.state = 'run'; Music.resume(); Game.last = performance.now(); },

  setBones(n) { $('hudBones').textContent = n; },
  /* the metro key rides in the HUD once she has it, so it is never a mystery
     why the bars in London are open */
  setKey(on) { $('hudKey').classList.toggle('hidden', !on); },
  setZone(name) { $('hudZone').textContent = name; },
  setProgress(p) { $('hudBarFill').style.width = (p * 100).toFixed(1) + '%'; },
  tut(on) { $('tut').classList.toggle('show', !!on); },
  toast(msg, sub) {
    const el = $('toast');
    $('toastMain').textContent = msg;
    $('toastSub').textContent = sub || '';
    el.classList.add('show');
    clearTimeout(this.toastT);
    this.toastT = setTimeout(() => el.classList.remove('show'), sub ? 2600 : 1500);
  },

  /* ---------------- outfits ---------------- */
  showSkins(level) {
    this.skinsLevel = level || Game.lobbyLevel();
    level = this.skinsLevel;
    this.hideAll();
    $('screen-skins').classList.remove('hidden');
    $('skinsTitle').textContent = level === 1 ? 'Aprangos' : level + ' lygio aprangos';
    $('skinsWallet').innerHTML = walletHtml(level);

    const grid = $('skinGrid');
    grid.innerHTML = '';
    const list = Levels.shop(level).concat(Levels.prize(level));
    list.forEach(sk => {
      const owned = Save.owns(sk.id), sel = Save.data.skin === sk.id;
      const prize = !sk.cost;
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
      else if (prize) { tag.className = 'skin-tag prize'; tag.textContent = 'Nugalėk bosą'; }
      else if (Save.canAfford(level, sk.cost)) { tag.className = 'skin-tag buy'; tag.innerHTML = costHtml(sk.cost); }
      else { tag.className = 'skin-tag poor'; tag.innerHTML = costHtml(sk.cost); }
      card.appendChild(tag);

      card.onclick = () => {
        Sfx.init(); Sfx.resume();
        if (Save.owns(sk.id)) { Save.data.skin = sk.id; Save.write(); Sfx.click(); this.showSkins(level); return; }
        if (prize) { Sfx.locked(); this.toast('Boso prizas', 'Įveik ' + level + ' lygį — gausi abi aprangas'); return; }
        if (Save.canAfford(level, sk.cost)) {
          Save.spend(level, sk.cost);
          Save.data.owned.push(sk.id);
          Save.data.skin = sk.id;
          Save.write(); Sfx.bone(); this.showSkins(level);
          if (Levels.allOwned(level)) this.announceKeys();
        } else {
          Sfx.locked();
          const w = Save.purse(level), miss = [];
          if ((sk.cost.b || 0) > w.b) miss.push((sk.cost.b - w.b) + ' skaniukų');
          if ((sk.cost.t || 0) > w.t) miss.push((sk.cost.t - w.t) + ' žaisliukų');
          this.toast('Dar trūksta', miss.join(' ir '));
        }
      };
      grid.appendChild(card);
    });
  }
};
function row(a, b, total) {
  return '<div class="row' + (total ? ' total' : '') + '"><span>' + a + '</span><span class="hi">' + b + '</span></div>';
}
