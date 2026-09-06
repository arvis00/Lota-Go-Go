'use strict';
/* ---------------------------------------------------------------
   music.js — the songs.

   Same WebAudio context the sound effects use and, like everything
   else here, no files: every note is an oscillator and every drum is
   a burst of noise.

   What it plays is a shelf of classical tunes that are old enough to
   belong to everybody — Mozart, Beethoven, Bach, Grieg, Tchaikovsky,
   Rossini — arranged down to a melody, a bass line and a drum part.
   Nothing is licensed and nothing is downloaded; these are the notes,
   typed out, and the synth plays them.

   The shelf is shuffled once when the page loads, so two launches do
   not open on the same tune, and it moves on by itself: when a piece
   has been round the number of times it asks for, the next one starts
   underneath whatever is happening on screen. A level does not pick
   its own song any more — the playlist runs across all of them.

   A song is three lines of text on a grid of eighth notes:

       lead   the melody          'c5 . e5 . g5 - e5 .'
       bass   the root underneath 'c3 . c3 . g2 . c3 .'
       drums  k kick, s snare, h hat

   `.` is a rest, `-` holds the note before it for one more eighth,
   `|` is a bar line and means nothing to the parser. The bass and the
   drums loop on their own lengths, so a one-bar drum pattern under an
   eight-bar melody comes back round in the right place by itself; the
   melody's length is what decides when the piece is over.

   `plays` is how many times through the melody before moving on, and
   `beats` says how many eighths are in a bar — the minuet is in three,
   everything else is in four.
----------------------------------------------------------------*/

const SONGS = [
  /* Mozart — Eine kleine Nachtmusik, K.525, the opening. Public domain. */
  { name: 'Nachtmusik', bpm: 140, plays: 3,
    lead: 'g4 -  d4 -  g4 -  d4 - | g4 d4 g4 b4 d5 -  -  . | ' +
          'd5 -  a4 -  d5 -  a4 - | d5 a4 d5 fs5 a5 - -  . | ' +
          'a5 .  g5 .  fs5 . e5 . | d5 .  c5 .  b4 -  a4 . | ' +
          'g4 .  b4 .  d5 .  g5 . | fs5 - d5 -  g4 -  -  .',
    bass: 'g2 .  d3 .  g2 .  d3 . | g2 .  d3 .  g2 .  g2 . | ' +
          'd2 .  a2 .  d2 .  a2 . | d2 .  a2 .  d2 .  d2 . | ' +
          'd3 .  d3 .  a2 .  a2 . | g2 .  g2 .  d3 .  d3 . | ' +
          'g2 .  b2 .  d3 .  g2 . | d3 .  d3 .  g2 .  g2 .',
    drums: 'k h s h k h s h | k h s h k h s k' },

  /* Beethoven — Ode to Joy, from the Ninth. Public domain. */
  { name: 'Džiaugsmo odė', bpm: 122, plays: 3,
    lead: 'e5 -  e5 -  f5 -  g5 - | g5 -  f5 -  e5 -  d5 - | ' +
          'c5 -  c5 -  d5 -  e5 - | e5 -  -  d5 d5 -  -  . | ' +
          'e5 -  e5 -  f5 -  g5 - | g5 -  f5 -  e5 -  d5 - | ' +
          'c5 -  c5 -  d5 -  e5 - | d5 -  -  c5 c5 -  -  .',
    bass: 'c3 .  e3 .  g2 .  e3 . | g2 .  b2 .  d3 .  b2 . | ' +
          'c3 .  e3 .  g2 .  e3 . | g2 .  d3 .  g2 .  g2 . | ' +
          'c3 .  e3 .  g2 .  e3 . | g2 .  b2 .  d3 .  b2 . | ' +
          'c3 .  e3 .  g2 .  e3 . | g2 .  d3 .  c3 .  c3 .',
    drums: 'k .  s .  k .  s . | k .  s .  k .  s s' },

  /* Mozart — Ah vous dirai-je, Maman, K.265: the tune every child on
     this planet already knows. Public domain. */
  { name: 'Žvaigždutė', bpm: 124, plays: 2,
    lead: 'c5 -  c5 -  g5 -  g5 - | a5 -  a5 -  g5 -  -  - | ' +
          'f5 -  f5 -  e5 -  e5 - | d5 -  d5 -  c5 -  -  - | ' +
          'g5 -  g5 -  f5 -  f5 - | e5 -  e5 -  d5 -  -  - | ' +
          'g5 -  g5 -  f5 -  f5 - | e5 -  e5 -  d5 -  -  - | ' +
          'c5 -  c5 -  g5 -  g5 - | a5 -  a5 -  g5 -  -  - | ' +
          'f5 -  f5 -  e5 -  e5 - | d5 -  d5 -  c5 -  -  -',
    bass: 'c3 .  c3 .  g2 .  c3 . | f2 .  f2 .  c3 .  c3 . | ' +
          'f2 .  f2 .  c3 .  c3 . | g2 .  g2 .  c3 .  c3 . | ' +
          'c3 .  c3 .  g2 .  g2 . | c3 .  c3 .  g2 .  g2 . | ' +
          'c3 .  c3 .  g2 .  g2 . | c3 .  c3 .  g2 .  g2 . | ' +
          'c3 .  c3 .  g2 .  c3 . | f2 .  f2 .  c3 .  c3 . | ' +
          'f2 .  f2 .  c3 .  c3 . | g2 .  g2 .  c3 .  c3 .',
    drums: 'k h s h k h s h' },

  /* Petzold — Minuet in G, BWV Anh.114, out of Bach's notebook for Anna
     Magdalena. Three beats to the bar, which is why `beats` is 6. */
  { name: 'Menuetas', bpm: 132, plays: 4, beats: 6,
    lead: 'd5 -  g4 a4 b4 c5 | d5 -  g4 -  g4 - | ' +
          'e5 -  c5 d5 e5 fs5 | g5 -  g4 -  g4 - | ' +
          'c5 -  d5 c5 b4 a4 | b4 -  c5 b4 a4 g4 | ' +
          'fs4 - g4 a4 b4 g4 | a4 -  -  -  -  -',
    bass: 'g2 -  -  d3 -  - | g2 -  -  b2 -  - | ' +
          'c3 -  -  g2 -  - | g2 -  -  d3 -  - | ' +
          'a2 -  -  e3 -  - | g2 -  -  d3 -  - | ' +
          'd3 -  -  a2 -  - | d3 -  -  d3 -  -',
    drums: 'k h h s h h' },

  /* Rossini — William Tell Overture, the final galop. Public domain, and
     the only tune on the shelf that runs at the same speed she does. */
  { name: 'Vilius Telis', bpm: 152, plays: 3,
    lead: 'g4 g4 g4 -  g4 g4 g4 - | g4 g4 g4 g4 g4 -  -  . | ' +
          'c5 c5 c5 -  c5 c5 c5 - | c5 c5 c5 c5 c5 -  -  . | ' +
          'g4 g4 c5 -  e5 -  g5 - | e5 -  c5 -  g4 -  -  . | ' +
          'g4 g4 g4 -  c5 c5 c5 - | e5 -  c5 -  c5 -  -  .',
    bass: 'c3 c3 .  c3 g2 .  c3 . | c3 c3 .  c3 g2 .  g2 . | ' +
          'c3 c3 .  c3 g2 .  c3 . | c3 c3 .  c3 g2 .  g2 . | ' +
          'f2 f2 .  f2 c3 .  f2 . | c3 c3 .  c3 g2 .  g2 . | ' +
          'g2 g2 .  g2 d3 .  g2 . | c3 c3 .  c3 g2 .  c3 .',
    drums: 'k h k s k h k s | k k s h k h s s' },

  /* Tchaikovsky — Dance of the Sugar Plum Fairy, from The Nutcracker.
     Public domain, and the quietest thing here. */
  { name: 'Cukrinė fėja', bpm: 118, plays: 4,
    lead: 'e5 ds5 b4 g4 e5 ds5 b4 g4 | c5 b4 g4 e4 c5 -  -  . | ' +
          'e5 ds5 b4 g4 e5 ds5 b4 g4 | fs5 e5 ds5 e5 b4 -  -  .',
    bass: 'e2 .  .  e2 .  .  b2 . | c3 .  .  c3 .  .  g2 . | ' +
          'e2 .  .  e2 .  .  b2 . | b2 .  .  fs2 . .  b2 .',
    drums: '.  h .  h .  h .  h | .  h .  h .  h s  h' },

  /* Grieg — In the Hall of the Mountain King, Peer Gynt. Public domain,
     and it is here because it creeps. */
  { name: 'Kalnų karalius', bpm: 128, plays: 4,
    lead: 'b4 cs5 d5 e5 d5 fs5 d5 fs5 | b4 cs5 d5 e5 d5 fs5 d5 fs5 | ' +
          'g5 e5 g5 fs5 d5 fs5 e5 cs5 | e5 b4 e5 d5 b4 d5 cs5 as4',
    bass: 'b2 .  b2 .  b2 .  b2 . | b2 .  b2 .  b2 .  b2 . | ' +
          'g2 .  g2 .  g2 .  g2 . | e2 .  e2 .  fs2 . fs2 .',
    drums: 'k .  k .  k .  k . | k .  k .  k .  k k' },

  /* Beethoven — Bagatelle in A minor, WoO 59, "Für Elise". Public domain. */
  { name: 'Elizai', bpm: 132, plays: 3,
    lead: 'e5 ds5 e5 ds5 e5 b4 d5 c5 | a4 -  .  c4 e4 a4 b4 - | ' +
          '.  e4 gs4 b4 c5 -  .  e4 | e5 ds5 e5 ds5 e5 b4 d5 c5 | ' +
          'a4 -  .  c4 e4 a4 b4 - | .  e4 c5 b4 a4 -  -  .',
    bass: 'a2 .  e3 .  a2 .  e3 . | a2 .  e3 .  a2 .  e3 . | ' +
          'e2 .  b2 .  e2 .  b2 . | a2 .  e3 .  a2 .  e3 . | ' +
          'a2 .  e3 .  a2 .  e3 . | e2 .  b2 .  a2 .  a2 .',
    drums: '.  h .  h .  h .  h | .  h .  h .  h .  h' }
];

const Music = {
  on: true,
  playing: false,
  song: null, level: 0,
  /* the shelf, shuffled once per launch, and where in it we are */
  order: null, idx: 0, len: 0,
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

  /* ---------- the playlist ---------- */
  /** Deal the shelf out in a fresh order. Called once, the first time
      anything asks for music, so every launch opens on a different piece. */
  shuffle() {
    this.order = SONGS.map((s, i) => i);
    for (let i = this.order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = this.order[i]; this.order[i] = this.order[j]; this.order[j] = t;
    }
    this.idx = 0;
  },
  /** the piece at the front of the queue, and step past it */
  take() {
    if (!this.order || !this.order.length) this.shuffle();
    const song = SONGS[this.order[this.idx % this.order.length]];
    this.idx = (this.idx + 1) % this.order.length;
    return song;
  },
  /** how many eighths one piece lasts, all the way round `plays` times */
  measure(song) {
    if (!song.c) song.c = { lead: compileNotes(song.lead), bass: compileNotes(song.bass),
                            drums: compileDrums(song.drums) };
    return song.c.lead.n * (song.plays || 2);
  },

  /* ---------- transport ---------- */
  /** Put music on. `level` no longer picks the tune — the playlist does —
      but it is still passed in, because how fast she is running is a level's
      business and setRate() reads from there. */
  play(level) {
    if (!this.on) return;
    const ac = this.ensure();
    if (!ac) return;
    Sfx.resume();
    clearTimeout(this.previewT); this.previewT = null;
    if (this.playing && this.song) return;              // already running
    /* a piece that was only paused picks up where it was; otherwise the
       next one off the shelf starts from the top */
    if (!this.song) { this.song = this.take(); this.step = 0; this.rate = 1; }
    this.len = this.measure(this.song);
    this.level = level;
    this.start(ac);
  },

  /** one piece has been round often enough: the next one starts on the
      very next eighth, without stopping the clock */
  advance() {
    this.song = this.take();
    this.len = this.measure(this.song);
    this.step = 0;
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
      /* a piece that has finished hands over mid-run: nobody has to go back
         to the lobby to hear a different one */
      if (this.len && this.step >= this.len) this.advance();
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
