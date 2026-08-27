'use strict';
/* ---------------------------------------------------------------
   zones.js — the 13 places Lota runs through, in order.
----------------------------------------------------------------*/
function tileLayer(offX, period, VW, fn) {
  const start = Math.floor(offX / period) - 1;
  for (let i = start; i * period - offX < VW + period; i++) fn(i * period - offX, i);
}

/* ---------------- reusable background layers ---------------- */
const BG = {
  sky(ctx, VW, VH, a, b, c) {
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, a); g.addColorStop(0.62, b); g.addColorStop(1, c || b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  },
  sun(ctx, VW, VH, x, y, r, col) {
    ctx.save(); ctx.globalAlpha = .5;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, col); g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, TAU); ctx.fill();
    ctx.restore();
    circle(ctx, x, y, r, col);
  },
  clouds(ctx, VW, VH, off, t, col, yBase, scale) {
    tileLayer(off, 420, VW, (x, i) => {
      const r = makeRng(i * 97 + 3);
      const y = yBase + r() * 70, s = (scale || 1) * (0.6 + r() * 0.7);
      ctx.save(); ctx.globalAlpha = 0.85;
      fillEll(ctx, x + 60, y, 46 * s, 22 * s, col);
      fillEll(ctx, x + 100, y - 10 * s, 34 * s, 22 * s, col);
      fillEll(ctx, x + 138, y + 2, 30 * s, 17 * s, col);
      ctx.restore();
    });
  },
  hills(ctx, VW, VH, off, base, col, amp, period) {
    ctx.beginPath(); ctx.moveTo(0, VH);
    for (let x = 0; x <= VW + 8; x += 8) {
      const w = (x + off) / (period || 260);
      ctx.lineTo(x, base - (Math.sin(w) * 0.6 + Math.sin(w * 0.43 + 1.7) * 0.4) * amp);
    }
    ctx.lineTo(VW, VH); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  },
  trees(ctx, VW, VH, off, base, trunk, leaf, leaf2, scale, period) {
    tileLayer(off, period || 190, VW, (x, i) => {
      const r = makeRng(i * 41 + 13), s = (scale || 1) * (0.75 + r() * 0.5);
      const bx = x + r() * 40, h = 90 * s;
      fillRR(ctx, bx - 7 * s, base - h * 0.55, 14 * s, h * 0.6, 4, trunk);
      leafy(ctx, bx, base - h * 0.72, 44 * s, 38 * s, leaf, leaf2, i * 7);
    });
  },
  buildings(ctx, VW, VH, off, base, cols, winCol, minH, maxH, period, roofs) {
    tileLayer(off, period || 150, VW, (x, i) => {
      const r = makeRng(i * 137 + 5);
      const w = 90 + r() * 70, h = minH + r() * (maxH - minH);
      const c = cols[i % cols.length];
      fillRR(ctx, x, base - h, w, h + 20, 5, c);
      if (roofs) { fillRR(ctx, x - 4, base - h - 8, w + 8, 12, 3, shade(c, -.18)); }
      ctx.save(); ctx.globalAlpha = .9;
      const cw = 13, ch = 17;
      for (let wy = base - h + 22; wy < base - 26; wy += ch + 12)
        for (let wx = x + 12; wx < x + w - 18; wx += cw + 11) {
          const on = ((wx * 7 + wy * 13 + i * 31) % 11) > 5;
          fillRR(ctx, wx, wy, cw, ch, 2, on ? winCol : shade(c, -.22));
        }
      ctx.restore();
    });
  },
  /* interior wall: wallpaper, skirting, pictures, doors */
  room(ctx, VW, VH, off, floorY, pal, kind) {
    ctx.fillStyle = pal.far; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.globalAlpha = .35;
    if (kind === 'stripe') {
      for (let x = -((off) % 46); x < VW; x += 46) { ctx.fillStyle = pal.mid; ctx.fillRect(x, 0, 23, VH); }
    } else if (kind === 'dots') {
      tileLayer(off, 54, VW, (x, i) => {
        for (let y = 20; y < floorY; y += 54) circle(ctx, x + ((y / 54) % 2) * 27, y + (i % 2) * 8, 4.5, pal.mid);
      });
    } else {
      tileLayer(off, 68, VW, (x, i) => {
        for (let y = 24; y < floorY; y += 62) {
          ctx.save(); ctx.translate(x + (i % 2) * 20, y);
          ctx.beginPath(); ctx.moveTo(0, 8); ctx.quadraticCurveTo(8, -6, 16, 8);
          ctx.quadraticCurveTo(8, 4, 0, 8); ctx.fillStyle = pal.mid; ctx.fill(); ctx.restore();
        }
      });
    }
    ctx.restore();
    /* furniture pushed far back */
    tileLayer(off * 0.9, 300, VW, (x, i) => {
      const r = makeRng(i * 23 + 4), k = Math.floor(r() * 4);
      ctx.save(); ctx.globalAlpha = .55;
      if (k === 0) {           /* tall bookcase */
        fillRR(ctx, x, floorY - 210, 96, 210, 6, shade(pal.far, -.30));
        for (let j = 0; j < 4; j++) {
          fillRR(ctx, x + 5, floorY - 196 + j * 48, 86, 7, 3, shade(pal.far, -.42));
          for (let m = 0; m < 5; m++)
            fillRR(ctx, x + 9 + m * 16, floorY - 210 + j * 48, 12, 15, 2,
              ['#e2584f', '#4f8ce2', '#f0b23a', '#68c77e', '#b884e8'][(m + j) % 5]);
        }
      } else if (k === 1) {    /* doorway */
        fillRR(ctx, x + 10, floorY - 240, 118, 240, 8, shade(pal.far, -.34));
        fillRR(ctx, x + 20, floorY - 228, 98, 228, 6, shade(pal.far, -.12));
        circle(ctx, x + 105, floorY - 110, 5, '#d8b25e');
      } else if (k === 2) {    /* potted plant + lamp */
        line(ctx, x + 40, floorY, x + 40, floorY - 150, shade(pal.far, -.34), 7);
        fillEll(ctx, x + 40, floorY - 165, 34, 26, '#f2e2b8');
        leafy(ctx, x + 130, floorY - 96, 46, 40, '#3f9c5c', '#63c47e', i * 5);
        fillRR(ctx, x + 112, floorY - 58, 38, 58, 6, '#c98f5a');
      } else {                 /* sideboard */
        fillRR(ctx, x + 6, floorY - 96, 150, 96, 7, shade(pal.far, -.32));
        for (let m = 0; m < 3; m++) fillRR(ctx, x + 14 + m * 46, floorY - 86, 38, 34, 4, shade(pal.far, -.44));
        leafy(ctx, x + 60, floorY - 118, 26, 22, '#4caf6d', '#75d493', i);
      }
      ctx.restore();
    });
    /* framed pictures / windows */
    tileLayer(off * 1.12, 330, VW, (x, i) => {
      const r = makeRng(i * 61 + 9);
      if (r() < 0.5) {
        const w = 74 + r() * 40, h = 58 + r() * 30, y = floorY - 250 + r() * 40;
        fillRR(ctx, x, y, w, h, 5, pal.frame || '#8a6a45');
        ctx.save();
        rr(ctx, x + 6, y + 6, w - 12, h - 12, 3); ctx.clip();
        ctx.fillStyle = pal.pic || '#a9dcf0'; ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
        ctx.translate(x + 6, 0);
        circle(ctx, (w - 12) * 0.32, y + h * 0.36, 9, '#ffe07a');
        BG.hills(ctx, w - 12, 2000, i * 40, y + h - 12, '#7fc48f', 10, 46);
        ctx.restore();
      } else {
        const w = 112, h = 122, y = floorY - 300;
        fillRR(ctx, x, y, w, h, 6, pal.frame || '#e6dccd');
        ctx.save(); rr(ctx, x + 8, y + 8, w - 16, h - 16, 4); ctx.clip();
        const gg = ctx.createLinearGradient(0, y, 0, y + h);
        gg.addColorStop(0, '#8fd6f0'); gg.addColorStop(1, '#d8f0e6');
        ctx.fillStyle = gg; ctx.fillRect(x + 8, y + 8, w - 16, h - 16);
        ctx.translate(x + 8, 0);
        circle(ctx, 34, y + 34, 13, '#fff3b0');
        BG.clouds(ctx, w - 16, h, i * 90, 0, 'rgba(255,255,255,.75)', y + 60, 0.32);
        BG.hills(ctx, w - 16, 2000, i * 30, y + h - 16, '#7fc48f', 12, 50);
        ctx.restore();
        line(ctx, x + w / 2, y + 8, x + w / 2, y + h - 8, pal.frame || '#e6dccd', 6);
        line(ctx, x + 8, y + h / 2, x + w - 8, y + h / 2, pal.frame || '#e6dccd', 6);
      }
    });
    /* skirting board */
    fillRR(ctx, 0, floorY - 16, VW, 18, 0, pal.skirt || shade(pal.far, -.18));
  }
};

/* ---------------- floor painting ---------------- */
function paintFloor(ctx, style, x, y, w, h, pal, t, camX) {
  switch (style) {
    case 'wood':
      ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
      fillRR(ctx, x, y, w, 8, 0, pal.floorTop);
      ctx.save(); ctx.globalAlpha = .3;
      for (let i = 0; i < 5; i++) line(ctx, x, y + 14 + i * 16, x + w, y + 14 + i * 16, shade(pal.floorBody, -.25), 2);
      for (let px = Math.floor((x + camX) / 96) * 96 - camX; px < x + w; px += 96)
        if (px > x) line(ctx, px, y, px, y + h, shade(pal.floorBody, -.3), 2);
      ctx.restore();
      break;
    case 'grass':
      ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y + 10, w, h);
      ctx.fillStyle = pal.floorTop;
      ctx.beginPath(); ctx.moveTo(x, y + 14);
      for (let px = x; px <= x + w; px += 12) ctx.lineTo(px, y + 4 + Math.sin((px + camX) * 0.09) * 3);
      ctx.lineTo(x + w, y + 20); ctx.lineTo(x, y + 20); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.globalAlpha = .55;
      for (let px = Math.floor((x + camX) / 17) * 17 - camX; px < x + w; px += 17)
        if (px > x) line(ctx, px, y + 8, px + 2, y - 5, shade(pal.floorTop, .2), 2.2);
      ctx.restore();
      break;
    case 'path':
      ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y + 8, w, h);
      fillRR(ctx, x, y, w, 12, 0, pal.floorTop);
      ctx.save(); ctx.globalAlpha = .4;
      for (let px = Math.floor((x + camX) / 23) * 23 - camX; px < x + w; px += 23)
        if (px > x) circle(ctx, px, y + 5 + ((px | 0) % 4), 2.4, shade(pal.floorTop, -.3));
      ctx.restore();
      break;
    case 'asphalt':
      ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
      fillRR(ctx, x, y, w, 9, 0, pal.floorTop);
      fillRR(ctx, x, y + 9, w, 4, 0, shade(pal.floorTop, -.25));
      ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = '#f0e9d8';
      for (let px = Math.floor((x + camX) / 90) * 90 - camX; px < x + w; px += 90)
        if (px > x - 40) ctx.fillRect(Math.max(px, x), y + 40, Math.min(44, x + w - px), 5);
      ctx.restore();
      break;
    case 'tile':
      ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
      fillRR(ctx, x, y, w, 6, 0, pal.floorTop);
      ctx.save(); ctx.globalAlpha = .35;
      for (let px = Math.floor((x + camX) / 62) * 62 - camX; px < x + w; px += 62)
        if (px > x) line(ctx, px, y, px - 22, y + h, '#fff', 2);
      ctx.globalAlpha = .18;
      for (let i = 0; i < 3; i++) line(ctx, x, y + 16 + i * 22, x + w, y + 16 + i * 22, '#fff', 2);
      ctx.restore();
      break;
    case 'carpet':
      ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
      fillRR(ctx, x, y, w, 7, 0, pal.floorTop);
      ctx.save(); ctx.globalAlpha = .3;
      for (let px = Math.floor((x + camX) / 30) * 30 - camX; px < x + w; px += 30)
        if (px > x) line(ctx, px, y + 7, px, y + h, shade(pal.floorTop, -.3), 3);
      ctx.restore();
      break;
    case 'metal':
      ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
      fillRR(ctx, x, y, w, 7, 0, pal.floorTop);
      ctx.save(); ctx.globalAlpha = .28;
      for (let px = Math.floor((x + camX) / 40) * 40 - camX; px < x + w; px += 40)
        if (px > x) { line(ctx, px, y + 10, px + 14, y + 24, '#fff', 2); line(ctx, px + 8, y + 10, px + 22, y + 24, '#fff', 2); }
      ctx.restore();
      break;
    default:
      ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
      fillRR(ctx, x, y, w, 8, 0, pal.floorTop);
  }
  /* soft contact shadow so props read as standing on it */
  ctx.save(); ctx.globalAlpha = .16;
  const g = ctx.createLinearGradient(0, y, 0, y + 26);
  g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, 26); ctx.restore();
}

/* =============================================================
   ZONE TABLE
============================================================= */
const ZONES = [
  {
    id: 'home1', exit: 'doorHouse', name: 'Lotos namai', sec: 12, diff: 0.0, floor: 'wood',
    pal: { far: '#e6c9a8', mid: '#d8b088', skirt: '#b98d63', frame: '#8a6a45',
           floorTop: '#d9a86a', floorBody: '#a87a4a', accent: '#ffd15c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) { BG.room(ctx, VW, VH, camX * 0.35, floorY, pal, 'leaf'); },
    pools: { hurdle: ['toybox', 'books', 'chair', 'basket', 'laundry', 'plantH'], over: ['table'],
             tunnel: ['vent'], ledge: ['shelfH', 'sofa'], step: ['sofa', 'bed', 'dresser', 'stairsH'],
             gap: ['hatch'], deco: ['rugDeco', 'pawPrints'] }
  },
  {
    id: 'yard1', exit: 'doorHouse', name: 'Kiemas', sec: 10, diff: 0.08, floor: 'grass',
    pal: { sky1: '#7fd4f5', sky2: '#bdeaf7', far: '#8fd6a8', mid: '#6cc48c',
           floorTop: '#5cbf6f', floorBody: '#7a5a3a', accent: '#ffd15c', cloud: '#ffffff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.8, 70, 30, '#fff3b0');
      BG.clouds(ctx, VW, VH, camX * 0.08, t, pal.cloud, 60);
      BG.hills(ctx, VW, VH, camX * 0.15, floorY - 40, pal.far, 34);
      BG.trees(ctx, VW, VH, camX * 0.3, floorY - 6, '#7a5a3a', '#4caf6d', '#6fd48c', 1.05, 200);
      tileLayer(camX * 0.5, 210, VW, x => {
        for (let i = 0; i < 5; i++) fillRR(ctx, x + i * 22, floorY - 62, 12, 66, 3, '#f2ead9');
        fillRR(ctx, x, floorY - 46, 118, 8, 3, '#e0d5bd');
      });
    },
    pools: { hurdle: ['rock', 'bushY', 'logpile', 'bucket', 'wheelbarrow', 'fenceY'], over: ['branchY'],
             tunnel: ['hedge'], ledge: ['treeLedge', 'benchY'], step: ['benchY', 'logpile', 'stump'],
             gap: ['puddle'], deco: ['grassTuft', 'flowers', 'pebbles'] }
  },
  {
    id: 'home2', exit: 'doorHouse', name: 'Kaimynų namas', sec: 10, diff: 0.16, floor: 'tile',
    pal: { far: '#a8d6e6', mid: '#7fbdd6', skirt: '#6f9db5', frame: '#e6dccd', pic: '#ffd8e6',
           floorTop: '#dfe9ef', floorBody: '#9fb4c2', accent: '#6fc9ff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.room(ctx, VW, VH, camX * 0.35, floorY, pal, 'stripe');
      tileLayer(camX * 0.5, 380, VW, x => {
        fillRR(ctx, x, floorY - 190, 96, 120, 6, '#cfe0ea');
        for (let i = 0; i < 3; i++) fillRR(ctx, x + 6, floorY - 182 + i * 38, 84, 30, 3, '#eef5f9');
        circle(ctx, x + 48, floorY - 210, 16, '#ffd8e6');
      });
    },
    pools: { hurdle: ['laundry', 'basket', 'books', 'toybox', 'plantH'], over: ['table'],
             tunnel: ['vent'], ledge: ['shelfH', 'sofa'], step: ['dresser', 'sofa', 'stairsH'],
             gap: ['hatch'], deco: ['rugDeco', 'pawPrints'] }
  },
  {
    id: 'yard2', exit: 'doorHouse', name: 'Rudens kiemas', sec: 10, diff: 0.24, floor: 'path',
    pal: { sky1: '#f5b96f', sky2: '#ffe0b0', far: '#c98f5a', mid: '#a86f42',
           floorTop: '#d2a06a', floorBody: '#8a6440', accent: '#ff9b4a', cloud: '#ffe7cf' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.22, 90, 34, '#fff0c4');
      BG.clouds(ctx, VW, VH, camX * 0.08, t, pal.cloud, 70);
      BG.hills(ctx, VW, VH, camX * 0.15, floorY - 46, pal.far, 40);
      BG.trees(ctx, VW, VH, camX * 0.3, floorY - 6, '#6b4a2c', '#e0862c', '#f2b04a', 1.15, 175);
      /* falling leaves */
      for (let i = 0; i < 14; i++) {
        const r = makeRng(i * 29 + 1);
        const sp = 30 + r() * 40, lx = (i * 97 - camX * 0.6 - t * sp) % (VW + 80);
        const ly = ((t * (20 + r() * 25) + i * 60) % (floorY + 60)) - 30;
        ctx.save(); ctx.translate(lx < 0 ? lx + VW + 80 : lx, ly);
        ctx.rotate(t * 2 + i); fillEll(ctx, 0, 0, 7, 4, ['#e0862c', '#d64a2c', '#f2b04a'][i % 3]); ctx.restore();
      }
    },
    pools: { hurdle: ['rock', 'bushY', 'logpile', 'wheelbarrow', 'fenceY', 'bucket'], over: ['branchY'],
             tunnel: ['hedge'], ledge: ['treeLedge', 'benchY'], step: ['stump', 'logpile', 'benchY'],
             gap: ['puddle'], deco: ['leafLitter', 'pebbles', 'grassTuft'] }
  },
  {
    id: 'home3', exit: 'doorHouse', name: 'Senelės namas', sec: 10, diff: 0.32, floor: 'carpet',
    pal: { far: '#c9a6d6', mid: '#a87fc4', skirt: '#8a63a8', frame: '#c9962c', pic: '#ffe7cf',
           floorTop: '#c96f8a', floorBody: '#8a4a63', accent: '#ffb0d0' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.room(ctx, VW, VH, camX * 0.35, floorY, pal, 'dots');
      tileLayer(camX * 0.5, 420, VW, x => {
        fillRR(ctx, x, floorY - 150, 70, 150, 8, '#8a6440');
        for (let i = 0; i < 3; i++) {
          fillRR(ctx, x + 5, floorY - 140 + i * 46, 60, 8, 3, '#a8794a');
          for (let k = 0; k < 4; k++) fillRR(ctx, x + 9 + k * 13, floorY - 152 + i * 46, 9, 12, 2,
            ['#e2584f', '#4f8ce2', '#f0b23a', '#68c77e'][k]);
        }
      });
    },
    pools: { hurdle: ['chair', 'basket', 'books', 'plantH', 'laundry'], over: ['table'],
             tunnel: ['vent'], ledge: ['shelfH', 'sofa'], step: ['bed', 'dresser', 'sofa'],
             gap: ['hatch'], deco: ['rugDeco', 'pawPrints'] }
  },
  {
    id: 'street1', name: 'Miesto gatvė', sec: 12, diff: 0.4, floor: 'asphalt',
    pal: { sky1: '#5fb8ea', sky2: '#a8dcf2', far: '#8fa8c4', mid: '#6f88a8',
           floorTop: '#9aa3b5', floorBody: '#4a4f5e', accent: '#f2762c', cloud: '#ffffff', car: '#e2453c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.clouds(ctx, VW, VH, camX * 0.06, t, pal.cloud, 50);
      BG.buildings(ctx, VW, VH, camX * 0.14, floorY - 30, ['#8fa8c4', '#a8b8cf', '#7f96b5'], '#cfe6f5', 150, 260, 170, false);
      BG.buildings(ctx, VW, VH, camX * 0.3, floorY - 4, ['#d6a86f', '#c98f5a', '#e0bb85'], '#ffe7b0', 90, 170, 150, true);
      /* driving cars far away */
      tileLayer((camX * 0.42 + t * 55) % 100000, 340, VW, (x, i) => {
        const cols = ['#e2453c', '#3f8fd6', '#4a9d6e', '#f0a93a'];
        ctx.save(); ctx.globalAlpha = .95;
        PROPS.car(ctx, x, floorY - 54, 78, 40, t, { car: cols[i % 4] }); ctx.restore();
      });
    },
    pools: { hurdle: ['cone', 'bin', 'crate', 'signFallen', 'hydrant', 'barrier'], over: ['pipeS', 'awning'],
             tunnel: ['scaffold'], ledge: ['awning', 'car'], step: ['car', 'crate'],
             gap: ['manhole'], deco: ['roadPaint', 'leafLitter'] }
  },
  {
    id: 'park', name: 'Parkas', sec: 12, diff: 0.48, floor: 'path',
    pal: { sky1: '#8fd6f0', sky2: '#d6f0e6', far: '#7fc48f', mid: '#4caf6d',
           floorTop: '#d8c49a', floorBody: '#8a6b46', accent: '#4caf6d', cloud: '#ffffff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.7, 60, 26, '#fff3b0');
      BG.clouds(ctx, VW, VH, camX * 0.07, t, pal.cloud, 46);
      BG.hills(ctx, VW, VH, camX * 0.14, floorY - 50, pal.far, 44);
      BG.trees(ctx, VW, VH, camX * 0.24, floorY - 20, '#6b4a2c', '#3f9c5c', '#63c47e', 1.5, 230);
      BG.trees(ctx, VW, VH, camX * 0.4, floorY - 4, '#7a5a3a', '#4caf6d', '#75d493', 1.0, 165);
      /* butterflies */
      for (let i = 0; i < 6; i++) {
        const bx = ((i * 210 - camX * 0.55) % (VW + 100) + VW + 100) % (VW + 100) - 50;
        const by = floorY - 130 + Math.sin(t * 2 + i) * 26;
        ctx.save(); ctx.translate(bx, by); ctx.scale(1 + Math.sin(t * 14 + i) * 0.3, 1);
        fillEll(ctx, -4, 0, 4, 6, '#ffb0d0'); fillEll(ctx, 4, 0, 4, 6, '#ffd8e6'); ctx.restore();
      }
    },
    pools: { hurdle: ['rockP', 'bushP', 'logP', 'roots', 'benchP'], over: ['rootArch'],
             tunnel: ['hedgeP'], ledge: ['branchP', 'benchP'], step: ['stump', 'rockP', 'benchP'],
             gap: ['pond'], deco: ['grassTuft', 'flowers', 'pebbles', 'leafLitter'] }
  },
  {
    id: 'street2', name: 'Vakaro gatvė', sec: 10, diff: 0.56, floor: 'asphalt',
    pal: { sky1: '#5a4a8a', sky2: '#e0806f', far: '#5a5a80', mid: '#3f3f5e',
           floorTop: '#7f8496', floorBody: '#3a3d4c', accent: '#ffb04a', cloud: '#f0b0a0', car: '#f0a93a' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, '#c96f8a', pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.3, floorY - 120, 40, '#ffd08a');
      BG.clouds(ctx, VW, VH, camX * 0.06, t, pal.cloud, 60);
      BG.buildings(ctx, VW, VH, camX * 0.14, floorY - 26, ['#4a4a70', '#5a5a80', '#3f3f5e'], '#ffd87a', 170, 300, 160, false);
      BG.buildings(ctx, VW, VH, camX * 0.3, floorY - 4, ['#6f5a7a', '#7f6a8a', '#5f4a6a'], '#ffe0a0', 100, 190, 140, true);
      tileLayer(camX * 0.62, 240, VW, x => {
        line(ctx, x, floorY - 4, x, floorY - 96, '#3a3d4c', 6);
        circle(ctx, x, floorY - 100, 9, '#ffd87a');
        ctx.save(); ctx.globalAlpha = .22;
        poly(ctx, [[x - 9, floorY - 96], [x + 9, floorY - 96], [x + 44, floorY], [x - 44, floorY]], '#ffd87a');
        ctx.restore();
      });
    },
    pools: { hurdle: ['bin', 'crate', 'cone', 'barrier', 'signFallen'], over: ['pipeS', 'awning'],
             tunnel: ['scaffold'], ledge: ['awning', 'car'], step: ['car', 'crate'],
             gap: ['manhole'], deco: ['roadPaint', 'leafLitter'] }
  },
  {
    id: 'mall', exit: 'doorService', name: 'Prekybos centras', sec: 12, diff: 0.62, floor: 'tile',
    pal: { far: '#dbe6f0', mid: '#b9c9da', skirt: '#93a5b8',
           floorTop: '#e2ecf4', floorBody: '#93a5b8', accent: '#ff5f8f' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, '#cfe0ee', '#aec2d6');
      /* skylight ceiling */
      fillRR(ctx, 0, 0, VW, 78, 0, '#8fa6bc');
      tileLayer(camX * 0.12, 190, VW, x => {
        fillRR(ctx, x + 8, 8, 150, 58, 10, '#dff0fb');
        ctx.save(); ctx.globalAlpha = .55; fillRR(ctx, x + 18, 14, 60, 46, 6, '#ffffff'); ctx.restore();
      });
      /* upper gallery with a railing */
      fillRR(ctx, 0, floorY - 268, VW, 44, 0, '#c3d2e0');
      tileLayer(camX * 0.2, 44, VW, x => line(ctx, x, floorY - 268, x, floorY - 232, '#8fa6bc', 3));
      fillRR(ctx, 0, floorY - 272, VW, 8, 0, '#7f96ac');
      /* shopfronts */
      tileLayer(camX * 0.3, 250, VW, (x, i) => {
        const c = ['#ff5f8f', '#3fa8e8', '#f5b731', '#4ec46f', '#a06ff0'][i % 5];
        fillRR(ctx, x, floorY - 224, 200, 224, 8, '#e8f0f7');
        fillRR(ctx, x + 8, floorY - 218, 184, 40, 6, c);
        ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = 'bold 19px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(['LOTA', 'ZOO', 'MODA', 'KAVA', 'BATAI'][i % 5], x + 100, floorY - 190);
        fillRR(ctx, x + 14, floorY - 172, 172, 120, 6, '#f7fbfe');
        ctx.save(); ctx.globalAlpha = .5;
        fillRR(ctx, x + 14, floorY - 172, 172, 120, 6, shade(c, .55)); ctx.restore();
        for (let k = 0; k < 4; k++) {
          fillRR(ctx, x + 26 + k * 42, floorY - 150, 30, 74, 5, shade(c, .28));
          circle(ctx, x + 41 + k * 42, floorY - 158, 7, shade(c, -.1));
        }
        fillRR(ctx, x + 8, floorY - 50, 184, 50, 4, '#cddbe7');
      });
      /* hanging banners */
      tileLayer(camX * 0.55, 330, VW, (x, i) => {
        line(ctx, x + 60, 74, x + 60, 96, '#7f96ac', 3);
        const c = ['#ff5f8f', '#3fa8e8', '#f5b731'][i % 3];
        fillRR(ctx, x + 16, 96, 90, 62, 6, c);
        poly(ctx, [[x + 16, 158], [x + 61, 142], [x + 106, 158]], shade(c, -.15));
      });
    },
    pools: { hurdle: ['cart', 'boxM', 'goods', 'wetsign', 'plantM'], over: ['railM'],
             tunnel: ['scannerA'], ledge: ['shelfM'], step: ['escalator', 'shelfM', 'boxM'],
             gap: ['holeM'], deco: ['tileShine', 'floorArrow'] }
  },
  {
    id: 'bus', exit: 'busDoor', name: 'Autobusas', sec: 7, diff: 0.66, floor: 'metal',
    pal: { far: '#3f5f92', mid: '#5a7fb5', skirt: '#2f4a75', seat: '#3f6fb5',
           floorTop: '#8d94a3', floorBody: '#4a5160', accent: '#d8b64a' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, '#4a6fa5', '#35507a');
      /* windows with the city rushing past */
      tileLayer(camX * 0.2, 190, VW, x => {
        fillRR(ctx, x, floorY - 250, 150, 130, 10, '#1e3050');
        ctx.save(); rr(ctx, x + 6, floorY - 244, 138, 118, 8); ctx.clip();
        ctx.fillStyle = '#a8dcf2'; ctx.fillRect(x + 6, floorY - 244, 138, 118);
        ctx.translate(x + 6, 0);
        BG.buildings(ctx, 138, 130, (camX * 2.2) % 100000, floorY - 132, ['#8fa8c4', '#a8b8cf'], '#fff', 46, 92, 78, true);
        ctx.restore();
        fillRR(ctx, x + 68, floorY - 250, 8, 130, 3, '#2f4a75');
      });
      fillRR(ctx, 0, floorY - 120, VW, 40, 0, '#35507a');
      fillRR(ctx, 0, 0, VW, 46, 0, '#2f4a75');
    },
    pools: { hurdle: ['seatB', 'bagB', 'bagP'], over: ['handrail'],
             tunnel: ['curtainP'], ledge: ['rackB'], step: ['seatB'],
             gap: ['stepB'], deco: ['aisleStrip'] }
  },
  {
    id: 'airport', exit: 'jetbridge', name: 'Oro uostas', sec: 13, diff: 0.74, floor: 'tile',
    pal: { far: '#c6d5e4', mid: '#a3b6c9', skirt: '#8496aa',
           floorTop: '#dae6f0', floorBody: '#8ea0b4', accent: '#2f7fc4' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, '#dbe8f4', '#b6cadd');
      /* the world outside the glass */
      const gy = floorY - 236;
      const sg = ctx.createLinearGradient(0, 40, 0, gy);
      sg.addColorStop(0, '#7cc4ec'); sg.addColorStop(1, '#cfe6f5');
      ctx.fillStyle = sg; ctx.fillRect(0, 40, VW, gy - 40);
      BG.clouds(ctx, VW, VH, camX * 0.05, t, '#ffffff', 90, 0.8);
      /* parked aeroplane */
      tileLayer(camX * 0.16, 700, VW, x => {
        fillRR(ctx, x, gy - 44, 270, 36, 18, '#f7fafd');
        ctx.strokeStyle = '#9fb2c6'; ctx.lineWidth = 2; ctx.stroke();
        poly(ctx, [[x + 70, gy - 34], [x + 168, gy - 34], [x + 132, gy + 4], [x + 78, gy + 4]], '#dde7f0');
        poly(ctx, [[x + 250, gy - 44], [x + 276, gy - 96], [x + 284, gy - 44]], '#2f7fc4');
        circle(ctx, x + 16, gy - 30, 6, '#a9dcf0');
        for (let i = 0; i < 6; i++) circle(ctx, x + 60 + i * 26, gy - 28, 4, '#bcd2e4');
        fillRR(ctx, x + 96, gy + 4, 8, 16, 3, '#6f7f92');
      });
      /* runway */
      fillRR(ctx, 0, gy - 8, VW, 16, 0, '#7f8ea0');
      ctx.save(); ctx.globalAlpha = .75;
      for (let px = -((camX * 0.16) % 70); px < VW; px += 70) fillRR(ctx, px, gy - 2, 34, 4, 2, '#f2f5f8');
      ctx.restore();
      /* the glass wall itself */
      ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 30, VW, gy - 20); ctx.restore();
      tileLayer(camX * 0.1, 150, VW, x => {
        fillRR(ctx, x, 30, 9, gy - 20, 3, '#93a7ba');
      });
      fillRR(ctx, 0, gy + 6, VW, 22, 0, '#93a7ba');
      /* terminal interior band + gate desks */
      fillRR(ctx, 0, gy + 26, VW, floorY - gy - 26, 0, '#c6d5e4');
      tileLayer(camX * 0.3, 420, VW, (x, i) => {
        fillRR(ctx, x, floorY - 150, 200, 150, 6, '#b0c2d4');
        fillRR(ctx, x + 10, floorY - 140, 180, 46, 5, '#2f7fc4');
        ctx.fillStyle = '#eaf4fb'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('B' + (i % 9 + 1), x + 100, floorY - 106);
        fillRR(ctx, x + 22, floorY - 82, 156, 60, 5, '#d8e5f0');
      });
      /* dark ceiling with hanging signage */
      fillRR(ctx, 0, 0, VW, 34, 0, '#5f7186');
      tileLayer(camX * 0.5, 400, VW, x => {
        line(ctx, x + 40, 30, x + 40, 44, '#4d5f74', 3);
        line(ctx, x + 130, 30, x + 130, 44, '#4d5f74', 3);
        fillRR(ctx, x, 44, 170, 42, 6, '#f4c22c');
        ctx.fillStyle = '#2b2b34'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('VARTAI  ▸', x + 85, 71);
      });
    },
    pools: { hurdle: ['suitcase', 'trolley', 'ropes', 'coneA', 'bagA'], over: ['screenA'],
             tunnel: ['scannerA'], ledge: ['chairsA'], step: ['beltA', 'chairsA', 'suitcase'],
             gap: ['gapA'], deco: ['floorArrow', 'tileShine'] }
  },
  {
    id: 'plane', exit: 'planeDoor', name: 'Lėktuvas', sec: 12, diff: 0.85, floor: 'carpet',
    pal: { far: '#cdd6e3', mid: '#aeb9c9', skirt: '#94a1b3', seat: '#35558a',
           floorTop: '#3f639c', floorBody: '#25406b', accent: '#8fd6ff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g0 = ctx.createLinearGradient(0, 0, 0, floorY);
      g0.addColorStop(0, '#eef2f8'); g0.addColorStop(1, '#bcc7d6');
      ctx.fillStyle = g0; ctx.fillRect(0, 0, VW, VH);
      /* curved cabin ceiling */
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(VW, 0); ctx.lineTo(VW, 62);
      ctx.quadraticCurveTo(VW / 2, 18, 0, 62); ctx.closePath();
      ctx.fillStyle = '#dbe2ec'; ctx.fill();
      /* reading lights */
      tileLayer(camX * 0.35, 74, VW, x => {
        circle(ctx, x, 40, 4, '#fff3c4');
        ctx.save(); ctx.globalAlpha = .22; circle(ctx, x, 46, 13, '#ffe9a8'); ctx.restore();
      });
      /* overhead bins */
      tileLayer(camX * 0.35, 172, VW, x => {
        fillRR(ctx, x, 58, 162, 50, 13, '#e9eef5');
        ctx.strokeStyle = '#93a1b4'; ctx.lineWidth = 2.4; ctx.stroke();
        fillRR(ctx, x + 66, 96, 32, 7, 3, '#93a1b4');
      });
      /* wall panel with windows onto the clouds */
      fillRR(ctx, 0, 108, VW, floorY - 168, 0, '#d2dae6');
      tileLayer(camX * 0.2, 148, VW, x => {
        fillRR(ctx, x, floorY - 238, 64, 82, 27, '#c2ccdb');
        ctx.save(); rr(ctx, x + 8, floorY - 230, 48, 66, 21); ctx.clip();
        const g = ctx.createLinearGradient(0, floorY - 230, 0, floorY - 164);
        g.addColorStop(0, '#3fa4dd'); g.addColorStop(1, '#b6e2f7');
        ctx.fillStyle = g; ctx.fillRect(x, floorY - 230, 64, 70);
        ctx.translate(x + 8, 0);
        BG.clouds(ctx, 48, 70, (camX * 1.6) % 100000, t, '#ffffff', floorY - 214, 0.34);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = .35;
        fillRR(ctx, x + 12, floorY - 226, 16, 26, 8, '#ffffff'); ctx.restore();
      });
      /* a row of seats receding into the back of the cabin */
      tileLayer(camX * 0.42, 132, VW, x => {
        fillRR(ctx, x, floorY - 150, 112, 66, 8, '#35558a');
        fillRR(ctx, x + 10, floorY - 142, 92, 26, 6, '#4a6ea8');
        fillRR(ctx, x, floorY - 88, 112, 16, 5, '#26406b');
      });
      fillRR(ctx, 0, floorY - 74, VW, 74, 0, '#b9c4d4');
    },
    pools: { hurdle: ['cartP', 'bagP', 'galley'], over: ['binP'],
             tunnel: ['curtainP'], ledge: ['seatP'], step: ['seatP', 'galley'],
             gap: ['gapP'], deco: ['aisleStrip'] }
  },
  {
    id: 'london', name: 'Londonas', sec: 14, diff: 1.0, floor: 'asphalt', last: true,
    pal: { sky1: '#7f93b5', sky2: '#cfd8e6', far: '#7a86a0', mid: '#5f6b85',
           floorTop: '#a9a29a', floorBody: '#55505c', accent: '#c9302c', cloud: '#eef2f8', car: '#c9302c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.clouds(ctx, VW, VH, camX * 0.05, t, pal.cloud, 46, 1.25);
      /* Big Ben + skyline */
      tileLayer(camX * 0.1, 900, VW, x => {
        fillRR(ctx, x + 60, floorY - 400, 66, 400, 4, '#b5a58a');
        fillRR(ctx, x + 54, floorY - 318, 78, 12, 3, '#a08f74');
        circle(ctx, x + 93, floorY - 350, 24, '#f2ead2');
        circle(ctx, x + 93, floorY - 350, 20, '#fdf8ea');
        line(ctx, x + 93, floorY - 350, x + 93, floorY - 366, '#3a3238', 3);
        line(ctx, x + 93, floorY - 350, x + 105, floorY - 344, '#3a3238', 3);
        poly(ctx, [[x + 56, floorY - 400], [x + 93, floorY - 470], [x + 130, floorY - 400]], '#7f8f74');
        ctx.save(); ctx.globalAlpha = .5;
        for (let i = 0; i < 8; i++) line(ctx, x + 64, floorY - 300 + i * 34, x + 122, floorY - 300 + i * 34, '#9c8b70', 2);
        ctx.restore();
        /* a distant ferris wheel */
        ctx.save(); ctx.translate(x + 520, floorY - 190); ctx.globalAlpha = .55;
        ctx.beginPath(); ctx.arc(0, 0, 92, 0, TAU); ctx.strokeStyle = '#6f7a92'; ctx.lineWidth = 6; ctx.stroke();
        for (let i = 0; i < 14; i++) {
          const a = t * 0.16 + (i / 14) * TAU;
          line(ctx, 0, 0, Math.cos(a) * 92, Math.sin(a) * 92, '#6f7a92', 2);
          circle(ctx, Math.cos(a) * 92, Math.sin(a) * 92, 6, '#cfd8e6');
        }
        ctx.restore();
      });
      BG.buildings(ctx, VW, VH, camX * 0.2, floorY - 20, ['#7a86a0', '#8a94ac', '#6b7690'], '#ffe7b0', 130, 240, 175, false);
      BG.buildings(ctx, VW, VH, camX * 0.34, floorY - 2, ['#b5876a', '#a87a5c', '#c99a7a'], '#ffe7b0', 90, 165, 145, true);
      /* red double-decker rolling by */
      tileLayer((camX * 0.46 + t * 70) % 100000, 620, VW, x => {
        ctx.save(); ctx.globalAlpha = .95; PROPS.busL(ctx, x, floorY - 118, 210, 112); ctx.restore();
      });
    },
    pools: { hurdle: ['booth', 'postbox', 'crateL', 'barrierL', 'bin'], over: ['railL', 'awningL'],
             tunnel: ['archL'], ledge: ['awningL', 'busL'], step: ['busL', 'crateL', 'booth'],
             gap: ['gapL'], deco: ['roadPaint', 'leafLitter', 'pebbles'] }
  }
];
const ZONE_BY_ID = {};
ZONES.forEach((z, i) => { z.index = i; ZONE_BY_ID[z.id] = z; });
