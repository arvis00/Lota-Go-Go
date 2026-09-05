'use strict';
/* ---------------------------------------------------------------
   music.js — the songs.

   Same WebAudio context the sound effects use and, like everything
   else here, no files: every note is an oscillator and every drum is
   a burst of noise. One tune per level, looping quietly under the
   run while the effects keep playing on top of it.

   A song is three lines of text on a grid of eighth notes:

       lead   the melody          'c5 . e5 . g5 - e5 .'
       bass   the root underneath 'c3 . c3 . g2 . c3 .'
       drums  k kick, s snare, h hat

   `.` is a rest, `-` holds the note before it for one more eighth,
   `|` is a bar line and means nothing to the parser. The three lines
   loop on their own lengths, so a one-bar drum pattern under an
   eight-bar melody comes back round in the right place by itself.
----------------------------------------------------------------*/

const SONGS = {
  /* 1 — Kelias į Londoną. C major, bouncy, the tune she trots to. */
  1: {
    bpm: 138,
    lead: 'c5 .  e5 .  g5 -  e5 . | f5 .  e5 .  d5 -  .  . | ' +
          'd5 .  f5 .  a5 -  f5 . | g5 -  e5 .  c5 -  -  . | ' +
          'c5 .  e5 .  g5 -  a5 . | g5 -  e5 .  d5 -  .  . | ' +
          'b4 .  d5 .  g5 -  f5 . | e5 -  c5 -  -  .  .  .',
    bass: 'c3 .  c3 .  g2 .  c3 . | f2 .  f2 .  c3 .  f2 . | ' +
          'd3 .  d3 .  a2 .  d3 . | g2 .  g2 .  d3 .  g2 . | ' +
          'c3 .  c3 .  g2 .  c3 . | c3 .  c3 .  e3 .  c3 . | ' +
          'g2 .  g2 .  d3 .  f3 . | c3 .  c3 .  g2 .  c3 .',
    drums: 'k h s h k h s h | k h s h k h s k'
  },

  /* 2 — Nuo viešbučio iki miško. F major, sunnier and a shade slower;
     the same shape, but it sways instead of trotting. */
  2: {
    bpm: 126,
    lead: 'f4 .  a4 .  c5 -  a4 . | d5 -  c5 .  a4 -  .  . | ' +
          'g4 .  bb4 . d5 -  bb4 . | c5 -  a4 .  f4 -  -  . | ' +
          'a4 .  c5 .  f5 -  e5 . | d5 -  c5 .  a4 -  .  . | ' +
          'bb4 . d5 .  g5 -  e5 . | f5 -  c5 -  a4 -  .  .',
    bass: 'f2 .  f2 .  c3 .  f2 . | d3 .  d3 .  a2 .  d3 . | ' +
          'bb2 . bb2 . f2 .  bb2 . | c3 .  c3 .  g2 .  c3 . | ' +
          'f2 .  f2 .  c3 .  f2 . | d3 .  d3 .  a2 .  d3 . | ' +
          'bb2 . bb2 . c3 .  c3 . | f2 .  f2 .  c3 .  f2 .',
    drums: 'k .  s h  k h  s . | k .  s h  k h  s s'
  },

  /* 3 — Šviesų šventė. D major, all bells and sparkle. */
  3: {
    bpm: 132,
    lead: 'd5 .  fs5 . a5 -  fs5 . | b5 -  a5 .  fs5 - .  . | ' +
          'g5 .  b5 .  d6 -  b5 . | a5 -  fs5 . d5 -  -  .',
    bass: 'd3 .  d3 .  a2 .  d3 . | b2 .  b2 .  fs2 . b2 . | ' +
          'g2 .  g2 .  d3 .  g2 . | a2 .  a2 .  e3 .  a2 .',
    drums: 'k h h s k h h s | k h s h k s s h'
  },

  /* 4 — Didysis pabėgimas. A minor, fast, and it does not let up. */
  4: {
    bpm: 152,
    lead: 'a4 -  c5 .  a4 .  e5 . | f5 -  e5 .  c5 -  .  . | ' +
          'g4 -  bb4 . g4 .  d5 . | e5 -  d5 .  a4 -  -  .',
    bass: 'a2 a2 .  a2 e2 .  a2 . | f2 f2 .  f2 c3 .  f2 . | ' +
          'g2 g2 .  g2 d2 .  g2 . | e2 e2 .  e2 b2 .  e2 .',
    drums: 'k h k s k h k s | k k s h k h s s'
  }
};

const Music = {
  on: true,
  playing: false,
  song: null, level: 0,
  gain: null, soft: null, noise: null, timer: null, previewT: null,
  step: 0, nextT: 0, rate: 1,
  VOL: 0.14,          // the whole band, kept well under the effects
  LOOK: 0.35,         // how far ahead notes are handed to WebAudio

  /* ---------- plumbing ---------- */
  /** the effects own the AudioContext; music just hangs its own fader on it */
  ensure() {
    Sfx.init();
    const ac = Sfx.ac;
    if (!ac) return null;
    if (!this.gain) {
      this.gain = ac.createGain();
      this.gain.gain.value = this.VOL;
      this.gain.connect(ac.destination);
      /* the melody is a square wave, which on a phone speaker is all edges —
         everything but the drums goes through this to round it off */
      this.soft = ac.createBiquadFilter();
      this.soft.type = 'lowpass';
      this.soft.frequency.value = 3600;
      this.soft.Q.value = 0.6;
      this.soft.connect(this.gain);
      /* one second of noise, reused by every drum for the rest of the game */
      const n = ac.sampleRate | 0;
      const buf = ac.createBuffer(1, n, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    return ac;
  },

  setOn(v) {
    this.on = !!v;
    if (!this.on) this.stop();
  },

  /* ---------- transport ---------- */
  /** start (or keep) the tune belonging to a level */
  play(level) {
    if (!this.on) return;
    const ac = this.ensure();
    if (!ac) return;
    Sfx.resume();
    clearTimeout(this.previewT); this.previewT = null;
    const song = SONGS[level] || SONGS[1];
    if (this.playing && this.song === song) return;     // already running
    this.song = song; this.level = level;
    this.step = 0; this.rate = 1;
    this.start(ac);
  },

  /** put a couple of bars on, so turning the music on is audible in the lobby */
  preview(level) {
    this.stop();
    this.play(level);
    clearTimeout(this.previewT);
    this.previewT = setTimeout(() => this.stop(), 3200);
  },

  start(ac) {
    this.gain.gain.cancelScheduledValues(ac.currentTime);
    this.gain.gain.setValueAtTime(this.VOL, ac.currentTime);
    this.nextT = ac.currentTime + 0.08;
    this.playing = true;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.pump(), 90);
    this.pump();
  },

  /** silence it and forget where it was */
  stop() {
    this.pause();
    this.song = null; this.step = 0;
    clearTimeout(this.previewT); this.previewT = null;
  },

  /** silence it but remember the bar, so Tęsti picks the tune back up */
  pause() {
    clearInterval(this.timer); this.timer = null;
    this.playing = false;
    if (this.gain && Sfx.ac) {
      const t = Sfx.ac.currentTime;
      this.gain.gain.cancelScheduledValues(t);
      this.gain.gain.setTargetAtTime(0.0001, t, 0.03);
    }
  },

  resume() {
    if (!this.on || !this.song || this.playing) return;
    const ac = this.ensure();
    if (!ac) return;
    Sfx.resume();
    this.start(ac);
  },

  /** she speeds up as the level goes on, and so does the song — a little */
  setRate(f) { this.rate = 1 + clamp(f, 0, 1) * 0.14; },

  /* ---------- the clock ---------- */
  pump() {
    const ac = Sfx.ac;
    if (!ac || !this.playing || !this.song) return;
    if (document.hidden) return;                        // pocket / other tab
    const now = ac.currentTime;
    if (this.nextT < now) this.nextT = now + 0.03;      // came back from a stall
    while (this.nextT < now + this.LOOK) {
      this.tick(this.step, this.nextT);
      this.nextT += 30 / (this.song.bpm * this.rate);   // one eighth note
      this.step++;
    }
  },

  tick(step, t) {
    const s = this.song;
    if (!s.c) s.c = { lead: compileNotes(s.lead), bass: compileNotes(s.bass), drums: compileDrums(s.drums) };
    const beat = 30 / (s.bpm * this.rate);

    const lead = s.c.lead.ev[step % s.c.lead.n];
    if (lead) {
      this.note(lead.f, t, beat * lead.len * 0.92, 'square', 0.34);
      this.note(lead.f * 2, t, beat * lead.len * 0.55, 'triangle', 0.11);
    }
    const bass = s.c.bass.ev[step % s.c.bass.n];
    if (bass) this.note(bass.f, t, beat * bass.len * 0.85, 'triangle', 0.34);

    const hit = s.c.drums.ev[step % s.c.drums.n];
    if (hit) this.hit(hit, t);
  },

  note(freq, t, dur, type, vol) {
    const ac = Sfx.ac;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.06, dur));
    o.connect(g); g.connect(this.soft);
    o.start(t); o.stop(t + dur + 0.05);
  },

  hit(kind, t) {
    const ac = Sfx.ac;
    if (kind === 'k') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(132, t);
      o.frequency.exponentialRampToValueAtTime(44, t + 0.11);
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(g); g.connect(this.gain);
      o.start(t); o.stop(t + 0.18);
      return;
    }
    const snare = kind === 's';
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = this.noise;
    src.playbackRate.value = snare ? 1 : 1.8;
    f.type = snare ? 'bandpass' : 'highpass';
    f.frequency.value = snare ? 1750 : 7200;
    const dur = snare ? 0.13 : 0.045;
    g.gain.setValueAtTime(snare ? 0.26 : 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.gain);
    src.start(t); src.stop(t + dur + 0.02);
  }
};

/* ---------- reading the songs ---------- */
const NOTE_STEPS = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
/** 'fs5' / 'bb2' / 'c3' → a frequency in Hz */
function noteFreq(name) {
  const m = /^([a-g])([sb#]?)(\d)$/.exec(name);
  if (!m) return 0;
  const semi = NOTE_STEPS[m[1]] + (m[2] === 'b' ? -1 : m[2] ? 1 : 0);
  const midi = (+m[3] + 1) * 12 + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
/** the grid → one entry per eighth note, `null` where nothing starts */
function compileNotes(str) {
  const tk = str.split(/[\s|]+/).filter(Boolean);
  const ev = new Array(tk.length).fill(null);
  for (let i = 0; i < tk.length; i++) {
    if (tk[i] === '.' || tk[i] === '-') continue;
    let len = 1;
    while (i + len < tk.length && tk[i + len] === '-') len++;
    ev[i] = { f: noteFreq(tk[i]), len: len };
  }
  return { ev: ev, n: tk.length };
}
function compileDrums(str) {
  const tk = str.split(/[\s|]+/).filter(Boolean);
  return { ev: tk.map(c => (c === '.' ? null : c)), n: tk.length };
}
