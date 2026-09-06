'use strict';
/* ---------------------------------------------------------------
   brief.js — the page the boss level opens on.

   The boss level is the only one that is not a running-and-jumping
   level, and everything that makes it different is invisible until
   it has already gone wrong: energy is not a score, a full charge
   rots if it is not spent, and the last arena is not a race at all.
   So it says so first, in four little moving pictures with a line
   under each, and only then rolls the film.

   Every picture is drawn the same way as the rest of the game — no
   image files anywhere — and each one animates on its own canvas.
----------------------------------------------------------------*/

const Brief = {
  /* the boss level's four cards, in the order they happen to her */
  cards: [
    { id: 'runFrom', title: 'Bėk ir nesustok',
      text: 'Nuo veterinaro stalo iki namų. Šuolis ↑, pasilenkimas ↓.' },
    { id: 'energy', title: 'Rink energiją ⚡',
      text: 'Penki ženklai — vienas pagreitis. Daugiau nei penkių paw nesutalpina.' },
    { id: 'boost', title: 'Panaudok pagreitį',
      text: 'Pilnas pagreitis genda, jei jo nespaudi. Kas nenaudoja — tą pagauna.' },
    { id: 'fight', title: 'Boso kova',
      text: 'Paskutinėje arenoje bėgimas baigiasi: balti kaulai muša, oranžiniai skaudina.' }
  ],

  /* every live card canvas on the screen right now, plus the loop
     driving them; they are torn down the moment the page closes */
  live: [], raf: 0, t: 0, last: 0,

  /** fill `grid` with one animated card per entry above */
  mount(grid) {
    this.unmount();
    grid.innerHTML = '';
    this.cards.forEach(c => {
      const card = document.createElement('div');
      card.className = 'brief-card';
      const cv = document.createElement('canvas');
      card.appendChild(cv);
      const b = document.createElement('b'); b.textContent = c.title; card.appendChild(b);
      const i = document.createElement('i'); i.textContent = c.text; card.appendChild(i);
      grid.appendChild(card);
      this.live.push({ id: c.id, cv: cv });
    });
    this.sizeAll();
    this.last = performance.now();
    const tick = ts => {
      if (!this.live.length) { this.raf = 0; return; }
      this.t += Math.min(0.06, (ts - this.last) / 1000);
      this.last = ts;
      this.live.forEach(l => this.paint(l));
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  },

  unmount() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0; this.live.length = 0;
  },

  /** a card is as wide as the grid made it and 96 css px tall */
  sizeAll() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.live.forEach(l => {
      const w = Math.max(80, Math.round(l.cv.clientWidth || 150)), h = 96;
      l.w = w; l.h = h;
      l.cv.width = Math.round(w * dpr); l.cv.height = Math.round(h * dpr);
      l.ctx = l.cv.getContext('2d');
      l.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
  },

  paint(l) {
    if (!l.ctx || l.w !== l.cv.clientWidth) this.sizeAll();
    const ctx = l.ctx, W = l.w, H = l.h, t = this.t;
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath(); rr(ctx, 0, 0, W, H, 14); ctx.clip();
    const fn = this[l.id];
    if (fn) fn.call(this, ctx, W, H, t);
    ctx.restore();
  },

  /* ---- a little clinic floor, used by three of the four ---- */
  floorStrip(ctx, W, H, top, low) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top); g.addColorStop(1, low);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const fy = H * 0.78;
    fillRR(ctx, 0, fy, W, H - fy, 0, 'rgba(0,0,0,.24)');
    fillRR(ctx, 0, fy, W, 4, 0, 'rgba(255,255,255,.22)');
    return fy;
  },

  /* ---- 1 · she is running, and somebody is behind her ---- */
  runFrom(ctx, W, H, t) {
    const fy = this.floorStrip(ctx, W, H, '#2f4a60', '#16283a');
    /* the road going past */
    ctx.save(); ctx.globalAlpha = .3;
    for (let i = 0; i < 6; i++) {
      const x = imod(W - (t * 210 + i * (W / 5)), W + 60) - 30;
      line(ctx, x, fy + 8, x - 18, H, '#8fb8d8', 3);
    }
    ctx.restore();
    /* the vet, a good way back and coming on */
    ctx.save(); ctx.globalAlpha = .85;
    drawVet(ctx, W * 0.17 + Math.sin(t * 3) * 2, fy + 2, 0.36, t, t * 13, 0.35);
    ctx.restore();
    drawLota(ctx, W * 0.66, fy + 2 - Math.abs(Math.sin(t * 5)) * 5, {
      state: 'run', t: t, run: t * 15, skin: Save.data.skin, scale: 0.5, face: 'happy'
    });
    /* the dust she is kicking up */
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 4; i++) {
      const ph = (t * 1.6 + i * 0.25) % 1;
      circle(ctx, W * 0.60 - ph * 34, fy - 3 - ph * 8, 3 + ph * 5, '#cfe0ee');
    }
    ctx.restore();
  },

  /* ---- 2 · five symbols, and the fifth is the one that matters ---- */
  energy(ctx, W, H, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#123049'); g.addColorStop(1, '#0b1c2c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* the five slots in her paw, filling one at a time and then emptying */
    const cyc = (t * 0.9) % 6, lit = Math.min(5, Math.floor(cyc));
    const n = 5, gap = Math.min(24, (W - 22) / n);
    const x0 = W / 2 - (n - 1) * gap / 2;
    for (let i = 0; i < n; i++) {
      const on = i < lit;
      const y = H * 0.44 + (on ? Math.sin(t * 4 + i) * 2 : 0);
      circle(ctx, x0 + i * gap, y, 8.5, on ? 'rgba(143,232,255,.25)' : 'rgba(255,255,255,.07)');
      if (on) Levels.energyIcon(ctx, x0 + i * gap, y, 0.42, t + i);
      else {
        ctx.beginPath(); ctx.arc(x0 + i * gap, y, 7, 0, TAU);
        ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    /* what a full paw says, and what a sixth symbol does about it */
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 12px ' + 'system-ui, sans-serif';
    ctx.fillStyle = lit >= 5 ? '#8fe8ff' : 'rgba(255,255,255,.5)';
    ctx.fillText(lit >= 5 ? '5 / 5 — PILNA' : lit + ' / 5', W / 2, H * 0.75);
    if (lit >= 5) {
      /* a sixth one drifts in and is simply left alone */
      const ph = ((cyc - 5) / 1);
      ctx.save(); ctx.globalAlpha = (1 - ph) * 0.8;
      Levels.energyIcon(ctx, W * 0.5 + 30 + ph * 40, H * 0.24, 0.4, t);
      ctx.restore();
    }
  },

  /* ---- 3 · the charge being spent, which is the whole point of it ---- */
  boost(ctx, W, H, t) {
    const fy = this.floorStrip(ctx, W, H, '#2a2350', '#140f2c');
    const cyc = (t * 0.7) % 3, firing = cyc > 1.4;
    /* the speed lines, only while the burst is running */
    if (firing) {
      ctx.save(); ctx.globalAlpha = .55;
      for (let i = 0; i < 8; i++) {
        const r = makeRng(i * 31 + Math.floor(t * 22) * 7);
        const y = 12 + r() * (fy - 20), len = 22 + r() * 44;
        line(ctx, W - imod(t * 900 + i * 90, W + 120), y,
             W - imod(t * 900 + i * 90, W + 120) - len, y, '#8fe8ff', 2.4);
      }
      ctx.restore();
    }
    drawLota(ctx, W * (firing ? 0.66 : 0.44), fy + 2, {
      state: 'run', t: t, run: t * (firing ? 26 : 12), skin: Save.data.skin,
      scale: 0.5, face: 'happy'
    });
    /* the button, pulsing until it is pressed */
    const bx = W * 0.16, by = H * 0.26, on = !firing;
    circle(ctx, bx, by, 15 + (on ? Math.sin(t * 6) * 1.6 : 0),
      on ? 'rgba(143,232,255,.32)' : 'rgba(255,255,255,.08)');
    ctx.beginPath(); ctx.arc(bx, by, 13, 0, TAU);
    ctx.strokeStyle = on ? '#8fe8ff' : 'rgba(255,255,255,.3)'; ctx.lineWidth = 2.4; ctx.stroke();
    poly(ctx, [[bx + 2, by - 7], [bx - 5, by + 1], [bx - 1, by + 1], [bx - 3, by + 8],
               [bx + 5, by - 1], [bx + 1, by - 1]], on ? '#fffbe8' : 'rgba(255,255,255,.35)');
  },

  /* ---- 4 · the arena, and which bone is which ---- */
  fight(ctx, W, H, t) {
    const fy = this.floorStrip(ctx, W, H, '#3a2b3f', '#1c1420');
    /* two of them standing there */
    ctx.save(); ctx.globalAlpha = .9;
    drawVet(ctx, W * 0.24, fy + 2, 0.34, t, 0, 0, { still: true });
    drawGroomer(ctx, W * 0.76, fy + 2, 0.32, t, 0, 0, { still: true });
    ctx.restore();
    /* the bones coming down between them */
    for (let i = 0; i < 4; i++) {
      const r = makeRng(i * 53 + 9);
      const ph = ((t * 0.55) + r()) % 1;
      const x = 18 + r() * (W - 36), y = -8 + ph * (fy + 4);
      const bad = i % 3 === 2;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ph * 5 + i);
      if (bad) {
        ctx.fillStyle = '#ff8a3a'; ctx.strokeStyle = '#a04a10';
      } else {
        ctx.fillStyle = '#fff7e2'; ctx.strokeStyle = '#c9a86a';
      }
      ctx.lineWidth = 1.8;
      [[-7, -4], [-7, 4], [7, -4], [7, 4]].forEach(q => {
        ctx.beginPath(); ctx.arc(q[0], q[1], 4.2, 0, TAU); ctx.fill(); ctx.stroke();
      });
      rr(ctx, -7, -3.4, 14, 6.8, 3.4); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    drawLota(ctx, W * 0.5 + Math.sin(t * 1.5) * W * 0.16, fy + 2, {
      state: 'sit', t: t, skin: Save.data.skin, scale: 0.46, face: 'calm'
    });
  }
};
