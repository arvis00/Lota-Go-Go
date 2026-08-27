'use strict';
window.__errs = [];
window.addEventListener('error', e => {
  window.__errs.push((e.error && e.error.stack) || (e.message + ' @' + e.filename + ':' + e.lineno));
});
Save.load();
Sfx.on = !!Save.data.sound;
window.addEventListener('load', () => {
  UI.init();
  Game.init();
});
/* keep the page from bouncing/zooming on iOS */
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
