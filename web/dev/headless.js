/* dev-only: run the game with no browser at all, so a track can be proved
   completable from the command line.  node dev/headless.js [level] */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');

const noop = () => {};
const el = () => ({ classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
                    style: {}, appendChild: noop, addEventListener: noop, textContent: '',
                    innerHTML: '', onclick: null, getContext: () => null, closest: () => null });
const sandbox = {
  console, Math, JSON, Date, TAU: undefined,
  performance: { now: () => Date.now() },
  requestAnimationFrame: noop, setTimeout: noop, setInterval: noop,
  clearTimeout: noop, clearInterval: noop,
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  document: { getElementById: el, createElement: el, querySelector: el, body: el(),
              addEventListener: noop },
  navigator: {}, devicePixelRatio: 1
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

['js/util.js', 'js/music.js', 'js/lota.js', 'js/props.js', 'js/props2.js', 'js/props3.js',
 'js/props4.js', 'js/zones.js', 'js/zones2.js', 'js/zones3.js', 'js/zones4.js',
 'js/level.js', 'js/levels.js', 'js/boss.js', 'js/game.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f }));

/* a UI that does nothing, so the engine can run with no screen */
vm.runInContext(`
  var UI = { showHud(){}, setBones(){}, setKey(){}, setZone(){}, setProgress(){},
             toast(){}, tut(){}, showOver(){}, showWin(){}, bank(){ return 0; },
             bossHud(){}, setEnergy(){}, setChase(){}, showCut(){}, winShown: false };
  Sfx.on = false;
  Save.load();
  Game.VW = 960; Game.VH = 540; Game.groundY = 410;
`, sandbox);

vm.runInContext(fs.readFileSync(path.join(root, 'dev/bot.js'), 'utf8'), sandbox, { filename: 'bot.js' });

const level = +(process.argv[2] || 1);
const every = +(process.argv[3] || 1);
const take = process.argv[4] || '';
const out = vm.runInContext(
  'window.BOT_EVERY = ' + every + '; window.BOT_LEVEL = ' + level + ';' +
  (take ? 'window.BOT_TAKE = ' + take + ';' : '') +
  'JSON.stringify(runBot(600), null, 1);', sandbox);
console.log(out);
