'use strict';
window.__errs = [];
window.addEventListener('error', e => {
  window.__errs.push((e.error && e.error.stack) || (e.message + ' @' + e.filename + ':' + e.lineno));
});
/* Bumped by hand whenever something ships. It is printed in the corner of the
   lobby next to the ⟳ button, so an iPhone that kept an old copy of the game
   in its home-screen cache can be told apart from one that did not. */
const BUILD = '2026-08-30';

Save.load();
Sfx.on = !!Save.data.sound;
Music.on = !!Save.data.music;
window.addEventListener('load', () => {
  UI.init();
  Game.init();
});
/* pocketed phone, or a tab in the background: the song stops rather than
   playing on to nobody, and picks up where it was when the game comes back */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) Music.pause();
  else if (Game.state === 'run') Music.resume();
});

/* keep the page from bouncing/zooming on iOS */
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });

/* ---------------------------------------------------------------
   Console helpers. The game never calls these — they exist so the
   later levels' wardrobes can be looked at before those levels are
   built and can actually pay for anything.

     LotaDev.give(2, 't', 200)   // 200 toys into level 2's purse
     LotaDev.clear(1)            // count level 1 as finished once
     LotaDev.key(2)              // everything needed to open level 2
     LotaDev.boss()              // hand over the boss prize
     LotaDev.reset()             // wipe the save
----------------------------------------------------------------*/
window.LotaDev = {
  give(level, kind, n) { Save.earn(level, kind, n); UI.showLobby(); return Save.purse(level); },
  clear(level, mode) { Save.markCleared(level, mode || 'raw'); UI.showLobby(); return Save.clears(level); },
  key(level) {
    const p = level - 1;
    Save.markCleared(p, 'raw');
    Levels.shop(p).forEach(s => Save.give(s.id));
    UI.showLobby();
    return Levels.unlocked(level);
  },
  boss() { const got = Levels.award(4); UI.showLobby(); return got.map(s => s.id); },
  reset() { try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(OLD_SAVE_KEY); } catch (e) {} location.reload(); }
};
