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
    $('btnWinAgain').onclick = () => { Sfx.click(); this.begin(Game.run.level); };
    $('btnWinLobby').onclick = () => { Sfx.click(); Game.lobby(); };
    $('btnPause').onclick   = () => { Sfx.click(); this.pause(); };
    $('btnResume').onclick  = () => { Sfx.click(); this.resume(); };
    $('btnPauseLobby').onclick = () => { Sfx.click(); this.bank(false); Game.lobby(); };
    $('btnPreviewBack').onclick = () => { Sfx.click(); this.backFromPreview(); };
    $('btnSkipCut').onclick = () => { Sfx.click(); Game.skipCut(); };
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
     'screen-mode', 'screen-cut']
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

    if (open && L.playable && !L.picks) {
      /* the boss level keeps no purse and no record: the only thing it can
         say is whether she has got away yet, and what that was worth */
      const prizes = Levels.prize(level), own = prizes.filter(sk => Save.owns(sk.id)).length;
      $('lobbyBest').innerHTML = (Save.clears(level)
        ? 'Pabėgo ×' + Save.clears(level)
        : (Save.far(level) ? 'Toliausiai: ' + Save.far(level) : 'Nuo veterinaro — ir namo!'))
        + '<br>Prizas: ' + own + ' / ' + prizes.length + ' aprangos';
    } else if (open && L.playable) {
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
    this.begin(level);
  },

  /** Start a level from the top. The boss level opens on its film; every
      other one simply starts. Coming back from a checkpoint never comes
      through here, so a death never makes anybody watch the film again. */
  begin(level, mode) {
    if (Levels.get(level).film) Game.showCut(level, mode);
    else Game.startRun(false, level, mode);
  },

  /** the film has no controls of its own beyond the way out of it */
  showCut() {
    this.hideAll();
    $('screen-cut').classList.remove('hidden');
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
    this.begin(level, mode);
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
    const two = W.toys > 0;
    /* the boss level collects nothing for a purse: no counter, no bonus badge,
       and in their place the energy in her paw and how close they are */
    $('hudBonesBox').classList.toggle('hidden', !!W.boss);
    $('hudMode').classList.toggle('hidden', !!W.boss);
    if (W.boss) { this.setProgress(0); return; }
    $('hudIco').className = W.currency === 't' ? 'toy-ico' : 'bone-ico';
    $('hudTotal').textContent = '/' + (two ? W.collectibles : W.treats);
    $('hudToysBox').classList.toggle('hidden', !two);
    if (two) $('hudToysTotal').textContent = '/' + W.toys;
    /* the question is only ever asked once, so the answer rides in the HUD:
       which way this run is being played, and what the finish is worth */
    const m = (Game.run && Game.run.mode) || 'cp', badge = $('hudMode');
    badge.classList.toggle('raw', m === 'raw');
    badge.innerHTML = Levels.modeShort(m) +
      '<span class="pay">' + payHtml(Game.run.level || 1, Levels.bonus(Game.run.level || 1, m)) + '</span>';
    this.setBones(0, 0, 0); this.setProgress(0);
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
    const dbl = r.bones === W.treats ? 2 : 1;
    const gotB = (r.gotB || 0) * dbl, gotT = (r.gotT || 0) * dbl;
    const bonus = finished ? Levels.bonus(level, r.mode) : 0;
    const picks = Levels.get(level).picks || 'b';
    r.paid = { b: picks.indexOf('b') >= 0 ? gotB + bonus : 0,
               t: picks.indexOf('t') >= 0 ? gotT + bonus : 0 };
    if (r.paid.b) Save.earn(level, 'b', r.paid.b);
    if (r.paid.t) Save.earn(level, 't', r.paid.t);
    const total = r.paid.b + r.paid.t;
    Save.best(level, total);
    Save.write();
    return total;
  },

  /** what a run actually paid, written out per purse — on level 3 one number
      would be two different things added together */
  paidHtml(r) {
    const p = r.paid || { b: 0, t: 0 }, out = [];
    if (p.b) out.push('+' + p.b + ' 🦴');
    if (p.t) out.push('+' + p.t + ' 🧸');
    return out.join(' · ') || '+0';
  },

  showOver() {
    const r = Game.run, W = Game.world;
    const cp = Game.checkpoint || { start: true, name: W.zoneList[0].name };
    const zoneName = Game.zoneAt(Game.lota.x).zone.name;
    const two = W.toys > 0;
    const ico = two ? '🦴🧸' : (W.currency === 't' ? '🧸' : '🦴');
    const what = W.currency === 't' ? 'Surinkti žaisliukai' : 'Surinkti skaniukai';
    Save.far(r.level || 1, zoneName);
    const dbl = r.bones === W.treats ? 2 : 1;
    const pending = ((r.gotB || 0) + (r.gotT || 0)) * dbl;

    this.hideAll();
    $('screen-over').classList.remove('hidden');
    const caught = Game.crashReason === 'caught';
    $('overSub').textContent = (caught ? 'Pagavo! ' : 'Lota sustojo: ') + zoneName +
      ' · nubėgta ' + Math.round(clamp(Game.lota.x / W.finishX, 0, 1) * 100) + '%';
    const raw = r.mode === 'raw';
    $('overStats').innerHTML =
      (W.boss ? row('Surinkta energijos', r.bones + ' / ' + W.treats) +
                row(caught ? 'Kodėl' : 'Kliūtis',
                    caught ? 'per mažai pagreičių' : 'atsitrenkė')
       : two ? row('Skaniukai', (r.gotB || 0) + ' / ' + W.collectibles) +
               row('Žaisliukai', (r.gotT || 0) + ' / ' + W.toys)
             : row(what, r.bones + ' / ' + W.treats)) +
      (raw ? row('Be kontrolinių taškų', 'viskas iš naujo', true)
           : row('Tęsi nuo', cp.start ? 'pradžios' : cp.name, true));
    $('btnRetry').textContent = cp.start ? 'Bandyti iš naujo' : 'Tęsti nuo ' + cp.name;
    const pB = (r.gotB || 0) * dbl, pT = (r.gotT || 0) * dbl;
    $('btnLobby').textContent = pending
      ? 'Baigti · ' + (two ? '+' + pB + ' 🦴 +' + pT + ' 🧸' : '+' + pending + ' ' + ico)
      : 'Grįžti į Lobby';
  },

  showWin() {
    this.winShown = true;
    const r = Game.run, W = Game.world;
    const all = W.treats, two = W.toys > 0;
    const ico = two ? '🦴🧸' : (W.currency === 't' ? '🧸' : '🦴');
    const what = W.currency === 't' ? 'Surinkti žaisliukai' : 'Surinkti skaniukai';
    const dbl = r.bones === all ? 2 : 1;
    const base = ((r.gotB || 0) + (r.gotT || 0)) * dbl;
    const bonus = Levels.bonus(r.level || 1, r.mode);
    this.bank(true);
    const last = W.zoneList[W.zoneList.length - 1].name;
    Save.markCleared(r.level || 1, r.mode);
    Save.far(r.level || 1, last + ' — finišas!');
    Save.write();

    this.hideAll();
    $('screen-win').classList.remove('hidden');
    const mins = Math.floor(r.time / 60), secs = Math.round(r.time % 60);
    const lvl = r.level || 1;
    const trip = lvl === 1 ? 'Nuo namų iki Londono per '
               : lvl === 2 ? 'Nuo viešbučio iki miško per '
               : lvl === 3 ? 'Nuo debesų iki Mėnulio per '
               : 'Nuo veterinaro stalo iki namų per ';
    $('winSub').textContent = trip + mins + ':' + String(secs).padStart(2, '0') +
      (r.mode === 'raw' ? ' · be kontrolinių taškų' : '') +
      (r.shortcuts ? ' · trumpiniai: ' + r.shortcuts : '') +
      (r.deaths ? ' · bandymai: ' + (r.deaths + 1) : ' · be nė vienos klaidos!');
    /* the boss level pays in outfits and in nothing else: crossing its finish
       line is what hands over the two prizes, once */
    if (W.boss) {
      const got = Levels.award(lvl);
      const prizes = Levels.prize(lvl);
      $('winStats').innerHTML =
        row('Surinkta energijos', r.bones + ' / ' + all) +
        row('Bandymai', String((r.deaths || 0) + 1)) +
        row(got.length ? 'Prizas — ' + got.length + ' naujos aprangos!' : 'Prizas',
            got.length ? got.map(sk => sk.name).join(' · ')
                       : prizes.map(sk => sk.name).join(' · '), true);
      return;
    }
    $('winStats').innerHTML =
      (two ? row('Skaniukai', (r.gotB || 0) + ' / ' + W.collectibles) +
             row('Žaisliukai', (r.gotT || 0) + ' / ' + W.toys)
           : row(what, r.bones + ' / ' + all)) +
      (r.bones === all ? row('Visi ' + all + ' — dvigubai!', r.bones + ' → ' + base) : '') +
      row('Už finišą ' + (r.mode === 'raw' ? 'be kontrolinių taškų' : 'su kontroliniais taškais'), '+' + bonus) +
      row('Iš viso', this.paidHtml(r), true);
  },

  pause() { if (Game.state !== 'run') return; Game.state = 'pause'; Music.pause(); $('screen-pause').classList.remove('hidden'); },
  resume() { if (Game.state !== 'pause') return; $('screen-pause').classList.add('hidden'); Game.state = 'run'; Music.resume(); Game.last = performance.now(); },

  /** On a level that collects one thing this is one number. On level 3 it is
      two, because the balls are worth a different purse and are found in a
      completely different way. */
  setBones(n, b, t) {
    const W = Game.world;
    if (W && W.toys) {
      $('hudBones').textContent = b || 0;
      $('hudToys').textContent = t || 0;
    } else $('hudBones').textContent = n;
  },
  /* the metro key rides in the HUD once she has it, so it is never a mystery
     why the bars in London are open */
  setKey(on) { $('hudKey').classList.toggle('hidden', !on); },

  /** Turn the boss level's own dials on or off: the energy in her paw, the
      road behind her, and the third button nobody else has. */
  bossHud(on) {
    $('hudEnergy').classList.toggle('hidden', !on);
    $('hudChaseBar').classList.toggle('hidden', !on);
    $('btnBoost').classList.toggle('hidden', !on);
    const tb = $('tutBoostRow');
    if (tb) tb.hidden = !on;
  },
  /** `n` of `max` symbols in hand, and whether that has made a whole charge */
  setEnergy(n, max, charge, left) {
    const box = $('hudEnergy'), pips = $('energyPips');
    if (pips.childElementCount !== max) {
      pips.innerHTML = '';
      for (let i = 0; i < max; i++) pips.appendChild(document.createElement('i'));
    }
    const lit = charge ? max : n;
    for (let i = 0; i < max; i++) pips.children[i].className = i < lit ? 'lit' : '';
    box.classList.toggle('full', !!charge);
    $('btnBoost').classList.toggle('ready', !!charge);
  },
  /** how much road is left between her and them — 1 is safe, 0 is caught */
  setChase(gap, boosting) {
    const f = $('hudChaseFill');
    f.style.width = (clamp(gap, 0, 1) * 100).toFixed(1) + '%';
    f.classList.toggle('near', gap < 0.3 && !boosting);
    f.classList.toggle('boost', !!boosting);
  },
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

      /* which place on this level the outfit comes from. Every costume on a
         shelf belongs to somewhere the level actually goes through, and
         saying so is what turns a row of dresses into a row of souvenirs. */
      if (sk.from) {
        const fr = document.createElement('div');
        fr.className = 'skin-from'; fr.textContent = sk.from;
        card.appendChild(fr);
      }

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
