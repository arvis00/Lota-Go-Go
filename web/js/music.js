'use strict';
/* ---------------------------------------------------------------
   music.js — the songs.

   These are recordings, not notes. The game used to type out classical
   melodies and play them on an oscillator, which meant it shipped
   without a single audio file but always sounded like a games console
   doing an impression of an orchestra. What plays here instead are
   real performances, sitting in `web/audio/`.

   **The files are not in the repository.** They are ~10 MB of audio that
   nobody needs in git history, so `web/audio/*.m4a` is ignored and a
   fresh clone arrives without them. `audio/fetch.sh` downloads the
   originals again from the same sources and re-encodes them, and is the
   only thing that has to be run to get the music back. Without them the
   game is silent but perfectly playable — see `misses` below.

   Everything on the shelf is free to ship. A classical piece being old
   is only half of it: the composition is out of copyright, but a
   *recording* of it carries its own, so a modern performance is not
   free just because Mozart is. Every file was checked one by one —
   seven are public domain or CC0 outright, and the Tchaikovsky is
   CC BY 3.0 and wants a credit. See `audio/CREDITS.md`, which is the
   file that keeps us honest; read it before adding anything.

   AAC in an .m4a, and not the ogg they were downloaded as, because
   **iPhone Safari does not decode Ogg Vorbis** and this game is played
   on a phone more than anywhere else — the shelf would have been silent
   there and nothing would have said so. AAC plays everywhere and is the
   native format on Apple's own hardware. Folded to mono at 64 kbps it
   roughly halves them; the two Nachtmusik files are at 48 kbps because
   their sources were already near that, and re-encoding them any higher
   would have spent bytes inventing detail that was not there.

   They are also **levelled to one loudness**. Eight recordings from eight
   different sources arrived nearly 18 dB apart — the Grieg was clipping
   and one Mozart was so quiet it disappeared under the sound effects, so
   the music appeared to lurch every time the playlist turned over. They
   are all normalised to -18 LUFS now, which is where music sits when it
   has to play *under* something. That is done once, by `fetch.sh`, and
   not at runtime: there is no point paying for it on every launch.

   The shelf is shuffled once when the page loads, so two launches do
   not open on the same piece, and it moves on by itself: when a
   recording ends the next one starts underneath whatever is happening
   on screen. A level does not pick its own song — the playlist runs
   across all of them.

   One `<audio>` element does all of it, with its `src` swapped as the
   playlist turns over. Nothing is preloaded: pulling six megabytes down
   before the first level would be a poor trade for music that fades in
   behind the game anyway.
----------------------------------------------------------------*/

const RECORDINGS = [
  { file: 'nachtmusik-allegro.m4a', name: 'Nachtmusik',        by: 'Mozart' },
  { file: 'nachtmusik-rondo.m4a',   name: 'Nachtmusik: rondo', by: 'Mozart' },
  { file: 'fur-elise.m4a',          name: 'Elizai',            by: 'Beethoven' },
  { file: 'vivaldi-spring.m4a',     name: 'Pavasaris',         by: 'Vivaldi' },
  { file: 'mountain-king.m4a',      name: 'Kalnų karalius',    by: 'Grieg' },
  { file: 'gymnopedie-1.m4a',       name: 'Gimnopedija',       by: 'Satie' },
  { file: 'blue-danube.m4a',        name: 'Mėlynasis Dunojus', by: 'Strauss' },
  { file: 'sugar-plum-fairy.m4a',   name: 'Cukrinė fėja',      by: 'Čaikovskis' }
];
const MUSIC_DIR = 'audio/';

const Music = {
  on: true,
  playing: false,
  track: null, level: 0,
  /* the shelf, shuffled once per launch, and where in it we are */
  order: null, idx: 0,
  el: null, fadeT: null, previewT: null,
  /* how many files in a row have failed to load. A clone without the
     audio folder fails all eight, and without this it would chase its
     own tail through the shelf forever. */
  misses: 0,
  VOL: 0.42,          // the recordings sit under the effects, which are louder

  /* ---------- plumbing ---------- */
  /** One element for the whole game. It is made on the first ask rather than
      at load, because a browser that never gets a tap never needs it. */
  ensure() {
    if (this.el) return this.el;
    const a = new Audio();
    a.preload = 'none';
    a.volume = this.VOL;
    /* the playlist moves itself along: no gap to fill, no timer to keep */
    a.addEventListener('ended', () => { if (this.playing) this.advance(); });
    /* a file that will not load must not take the music down with it — skip
       to the next one, but count it, and give up once the whole shelf has
       failed rather than spinning through eight 404s a second forever */
    a.addEventListener('error', () => {
      if (!this.playing) return;
      if (++this.misses >= RECORDINGS.length) { this.giveUp(); return; }
      this.advance();
    });
    /* something actually started: the shelf is fine, forget the failures */
    a.addEventListener('playing', () => { this.misses = 0; });
    this.el = a;
    return a;
  },

  /** Nothing on the shelf will load — almost always a clone that has not run
      `audio/fetch.sh`. Stop asking, and leave the rest of the game alone. */
  giveUp() {
    this.playing = false;
    this.track = null;
    this.misses = 0;
    if (window.console && console.info) {
      console.info('Lota Go: no music files in audio/ — run audio/fetch.sh to get them.');
    }
  },

  /** Not every browser decodes every container. Ask before putting a file on
      the shelf rather than finding out mid-level. */
  playable(t) {
    const a = this.ensure();
    if (!a.canPlayType) return true;
    const ext = t.file.slice(t.file.lastIndexOf('.') + 1).toLowerCase();
    const mime = ext === 'm4a' ? 'audio/mp4'
               : ext === 'mp3' ? 'audio/mpeg'
               : ext === 'flac' ? 'audio/flac'
               : ext === 'opus' ? 'audio/ogg; codecs=opus'
               : 'audio/ogg; codecs=vorbis';
    return a.canPlayType(mime) !== '';
  },

  setOn(v) {
    this.on = !!v;
    if (!this.on) this.stop();
  },

  /* ---------- the playlist ---------- */
  /** Deal the shelf out in a fresh order, dropping anything this browser
      cannot decode. Called once, so every launch opens on a different piece. */
  shuffle() {
    this.order = RECORDINGS.map((t, i) => i).filter(i => this.playable(RECORDINGS[i]));
    if (!this.order.length) this.order = RECORDINGS.map((t, i) => i);   // hope
    for (let i = this.order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = this.order[i]; this.order[i] = this.order[j]; this.order[j] = t;
    }
    this.idx = 0;
  },
  /** the piece at the front of the queue, and step past it */
  take() {
    if (!this.order || !this.order.length) this.shuffle();
    const t = RECORDINGS[this.order[this.idx % this.order.length]];
    this.idx = (this.idx + 1) % this.order.length;
    return t;
  },

  /* ---------- transport ---------- */
  /** Put music on. `level` does not pick the piece — the playlist does — but
      it is still passed in, because it is a level that asks. */
  play(level) {
    if (!this.on) return;
    const a = this.ensure();
    clearTimeout(this.previewT); this.previewT = null;
    this.level = level;
    if (this.playing && this.track) return;             // already running
    this.misses = 0;                                    // a fresh ask, a fresh count
    if (!this.track) this.load(this.take());            // otherwise: resume where it was
    this.playing = true;
    this.go();
  },

  /** the next recording, starting from the top */
  advance() {
    this.load(this.take());
    if (this.playing) this.go();
  },

  load(t) {
    const a = this.ensure();
    this.track = t;
    a.src = MUSIC_DIR + t.file;
    try { a.currentTime = 0; } catch (e) { /* not loaded far enough to seek */ }
  },

  /** Actually start it. `play()` hands back a promise that a browser will
      reject if nothing has been tapped yet — that is not an error worth
      shouting about, the next tap comes along and asks again. */
  go() {
    const a = this.ensure();
    this.fade(this.VOL, 700);
    const p = a.play();
    if (p && p.catch) p.catch(() => { /* waiting on a tap */ });
  },

  /** put a little of it on, so turning the music on is audible in the lobby */
  preview(level) {
    this.stop();
    this.play(level);
    clearTimeout(this.previewT);
    this.previewT = setTimeout(() => this.stop(), 6000);
  },

  /** silence it and forget where it was */
  stop() {
    this.pause();
    this.track = null;
    clearTimeout(this.previewT); this.previewT = null;
    if (this.el) { try { this.el.currentTime = 0; } catch (e) {} }
  },

  /** silence it but stay where it is, so Tęsti picks the piece back up */
  pause() {
    this.playing = false;
    clearInterval(this.fadeT); this.fadeT = null;
    if (this.el) this.el.pause();
  },

  resume() {
    if (!this.on || !this.track || this.playing) return;
    this.playing = true;
    this.go();
  },

  /** She speeds up as the level goes on. The synth used to lean in with her,
      but a recording cannot: pushing `playbackRate` on an orchestra raises its
      pitch and turns Grieg into a cartoon. So this now does nothing, and is
      kept because the level code still calls it every frame. */
  setRate(f) { },

  /** ease the volume rather than cutting it, so nothing clicks or lurches */
  fade(to, ms) {
    const a = this.ensure();
    clearInterval(this.fadeT);
    const from = a.volume, steps = Math.max(1, Math.round(ms / 40));
    let i = 0;
    this.fadeT = setInterval(() => {
      i++;
      const v = from + (to - from) * (i / steps);
      try { a.volume = Math.min(1, Math.max(0, v)); } catch (e) {}
      if (i >= steps) { clearInterval(this.fadeT); this.fadeT = null; }
    }, 40);
  }
};
