'use strict';
/* ---------------------------------------------------------------
   zones2.js — level 2: "Nuo viešbučio iki miško".

   Fifteen places in a row: a grand hotel from the inside out, the
   promenade and the beach, the pier — where the view swings round
   and Lota turns right — a dive off the end of it, the sea floor,
   the climb back out onto the shore, a short street, and the forest
   the finish stands in. One branch: the fox cave under the forest.
----------------------------------------------------------------*/

/* ================= backgrounds shared by level 2 ================= */
const BG2 = {
  /* the hotel's wall: panelling, damask, a picture rail and cornice */
  hotelWall(ctx, VW, VH, off, floorY, pal, kind) {
    ctx.fillStyle = pal.far; ctx.fillRect(0, 0, VW, VH);
    /* damask, drawn from the wall's own grid so it cannot shimmer */
    ctx.save(); ctx.globalAlpha = .28;
    tileLayer(off, 62, VW, (x, i) => {
      for (let y = 18; y < floorY - 90; y += 58) {
        const cx = x + ((y / 58) % 2) * 31, cy = y + (i % 2) * 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 12);
        ctx.quadraticCurveTo(cx - 11, cy, cx, cy - 12);
        ctx.quadraticCurveTo(cx + 11, cy, cx, cy + 12);
        ctx.fillStyle = pal.mid; ctx.fill();
        circle(ctx, cx, cy, 2.4, pal.mid);
      }
    });
    ctx.restore();
    /* cornice */
    fillRR(ctx, 0, 0, VW, 20, 0, shade(pal.far, .2));
    ctx.save(); ctx.globalAlpha = .8; fillRR(ctx, 0, 18, VW, 5, 0, '#d8b25e'); ctx.restore();
    /* the wainscot along the bottom */
    const wy = floorY - 96;
    fillRR(ctx, 0, wy, VW, 96, 0, shade(pal.far, -.14));
    ctx.save(); ctx.globalAlpha = .5;
    tileLayer(off, 108, VW, x => {
      fillRR(ctx, x + 8, wy + 12, 92, 66, 4, shade(pal.far, -.05));
      goldEdge(ctx, x + 8, wy + 12, 92, 66, 4);
    });
    ctx.restore();
    fillRR(ctx, 0, wy - 7, VW, 9, 0, '#d8b25e');
    /* picture rail with framed prints */
    fillRR(ctx, 0, floorY - 300, VW, 6, 0, '#d8b25e');
    if (kind !== 'plain') tileLayer(off * 1.1, 320, VW, (x, i) => {
      const w = 92 + (i % 3) * 22, h = 74 + (i % 2) * 20, y = floorY - 292;
      fillRR(ctx, x, y, w, h, 4, '#d8b25e');
      ctx.save(); rr(ctx, x + 7, y + 7, w - 14, h - 14, 3); ctx.clip();
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, '#a9d6ea'); g.addColorStop(1, '#e6eedc');
      ctx.fillStyle = g; ctx.fillRect(x + 7, y + 7, w - 14, h - 14);
      ctx.translate(x + 7, 0);
      circle(ctx, (w - 14) * 0.3, y + h * 0.3, 9, '#ffe7a8');
      BG.hills(ctx, w - 14, 2000, i * 31, y + h - 14, '#7fa8c4', 9, 44);
      ctx.restore();
    });
    /* wall lights */
    tileLayer(off * 0.92, 214, VW, x => {
      fillRR(ctx, x, floorY - 214, 9, 34, 4, '#d8b25e');
      ctx.beginPath();
      ctx.moveTo(x - 11, floorY - 226); ctx.lineTo(x + 20, floorY - 226);
      ctx.lineTo(x + 15, floorY - 254); ctx.lineTo(x - 6, floorY - 254); ctx.closePath();
      ctx.fillStyle = '#fdf3d8'; ctx.fill();
      ctx.save(); ctx.globalAlpha = .3;
      circle(ctx, x + 4.5, floorY - 238, 34, '#ffe7a8'); ctx.restore();
    });
  },

  /* a stretch of calm sea, seen from above the waterline */
  seaFar(ctx, VW, VH, off, horizon, floorY, t, deep, shallowCol) {
    const g = ctx.createLinearGradient(0, horizon, 0, floorY);
    g.addColorStop(0, deep); g.addColorStop(1, shallowCol);
    ctx.fillStyle = g; ctx.fillRect(0, horizon, VW, floorY - horizon + 4);
    /* long, lazy swells — nothing choppy, the sea here is calm */
    ctx.save();
    for (let row = 0; row < 7; row++) {
      const f = row / 6;
      const y = horizon + (floorY - horizon) * f * f * 0.96 + 6;
      ctx.globalAlpha = .16 + f * 0.2;
      ctx.beginPath();
      for (let px = -20; px <= VW + 20; px += 10) {
        const k = (px + off * (0.2 + f)) * (0.012 - f * 0.004);
        const yy = y + Math.sin(k + t * 0.5 + row) * (2 + f * 5);
        px === -20 ? ctx.moveTo(px, yy) : ctx.lineTo(px, yy);
      }
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4 + f * 2.2; ctx.stroke();
    }
    ctx.restore();
    /* the glitter track under the sun */
    ctx.save(); ctx.globalAlpha = .3;
    for (let i = 0; i < 26; i++) {
      const r = makeRng(i * 47 + 3);
      const f = r();
      const y = horizon + (floorY - horizon) * f * f * 0.9 + 4;
      const px = imod(VW * 0.62 + (r() - 0.5) * 260 + Math.sin(t + i) * 8, VW + 40) - 20;
      ctx.globalAlpha = .18 + Math.abs(Math.sin(t * 2 + i)) * .3;
      fillEll(ctx, px, y, 7 + f * 12, 1.6, '#fff6d8');
    }
    ctx.restore();
  },

  /* everything below the surface: the light coming down through it */
  underwater(ctx, VW, VH, off, floorY, t, top, bottom, surfY) {
    const g = ctx.createLinearGradient(0, 0, 0, floorY + 60);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    /* the underside of the surface, wobbling far overhead */
    if (surfY > -60) {
      ctx.save();
      ctx.beginPath(); ctx.moveTo(-10, -40);
      for (let px = -10; px <= VW + 10; px += 12)
        ctx.lineTo(px, surfY + Math.sin((px + off * 0.5) * 0.016 + t * 0.7) * 7);
      ctx.lineTo(VW + 10, -40); ctx.closePath();
      ctx.globalAlpha = .32; ctx.fillStyle = '#bfeaf6'; ctx.fill();
      ctx.globalAlpha = .55;
      ctx.beginPath();
      for (let px = -10; px <= VW + 10; px += 12) {
        const yy = surfY + Math.sin((px + off * 0.5) * 0.016 + t * 0.7) * 7;
        px === -10 ? ctx.moveTo(px, yy) : ctx.lineTo(px, yy);
      }
      ctx.strokeStyle = '#eaf9ff'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    }
    /* shafts of light leaning down through the water */
    ctx.save(); ctx.globalAlpha = .09;
    tileLayer(off * 0.3, 230, VW, (x, i) => {
      const sway = Math.sin(t * 0.4 + i) * 16;
      poly(ctx, [[x + sway, surfY], [x + 58 + sway, surfY],
        [x + 150, floorY + 40], [x + 24, floorY + 40]], '#eaf9ff');
    });
    ctx.restore();
    /* far-off rock silhouettes */
    ctx.save(); ctx.globalAlpha = .35;
    BG.hills(ctx, VW, VH, off * 0.14, floorY - 44, shade(bottom, -.2), 46, 340);
    ctx.globalAlpha = .5;
    BG.hills(ctx, VW, VH, off * 0.26, floorY - 12, shade(bottom, -.3), 30, 210);
    ctx.restore();
  },

  /* a school of fish drifting past, and a couple of bigger ones */
  fish(ctx, VW, VH, off, floorY, t, n, col, col2) {
    for (let i = 0; i < n; i++) {
      const r = makeRng(i * 67 + 11);
      const sp = 26 + r() * 40;
      const fx = imod(i * 173 - off * 0.4 - t * sp, VW + 200) - 100;
      const fy = 60 + r() * (floorY - 130) + Math.sin(t * 1.2 + i) * 12;
      const s = 0.6 + r() * 0.9;
      ctx.save(); ctx.translate(fx, fy); ctx.scale(s, s);
      ctx.globalAlpha = .78;
      const c = i % 3 ? col : col2;
      fillEll(ctx, 0, 0, 13, 6, c);
      poly(ctx, [[-11, 0], [-21, -7], [-21, 7]], c);
      ctx.save(); ctx.globalAlpha = .5;
      fillEll(ctx, -1, -5, 5, 3, shade(c, .35), 0.3); ctx.restore();
      circle(ctx, 7, -1.6, 1.6, '#2b2b34');
      ctx.restore();
    }
  },

  /* the canopy layers of the forest */
  forest(ctx, VW, VH, off, floorY, t, pal, density) {
    BG.hills(ctx, VW, VH, off * 0.1, floorY - 62, pal.far, 46, 320);
    /* trunks marching back into the wood */
    for (let layer = 0; layer < 3; layer++) {
      const par = 0.16 + layer * 0.13, sc = 0.7 + layer * 0.35;
      ctx.save(); ctx.globalAlpha = .5 + layer * 0.25;
      tileLayer(off * par, (200 - layer * 46) / (density || 1), VW, (x, i) => {
        const r = makeRng(i * 53 + layer * 17 + 3);
        const bx = x + r() * 44, h = (150 + r() * 130) * sc;
        const trunk = [shade(pal.trunk, .18), pal.trunk, shade(pal.trunk, -.18)][layer];
        fillRR(ctx, bx - 9 * sc, floorY - h, 18 * sc, h + 20, 5, trunk);
        ctx.save(); ctx.globalAlpha = .3;
        line(ctx, bx - 2 * sc, floorY - h + 12, bx - 2 * sc, floorY - 10, shade(trunk, -.2), 3);
        ctx.restore();
        leafy(ctx, bx, floorY - h - 16 * sc, 62 * sc, 46 * sc,
          [shade(pal.leaf, .2), pal.leaf, shade(pal.leaf, -.2)][layer],
          [shade(pal.leaf2, .2), pal.leaf2, shade(pal.leaf2, -.2)][layer], i * 7 + layer);
      });
      ctx.restore();
    }
    /* the canopy closing over the top of the screen */
    ctx.save(); ctx.globalAlpha = .9;
    tileLayer(off * 0.42, 128, VW, (x, i) => {
      leafy(ctx, x + 40, -12 + (i % 3) * 16, 74, 52, shade(pal.leaf, -.28), shade(pal.leaf2, -.22), i * 11);
    });
    ctx.restore();
    /* shafts of sun coming through it */
    ctx.save(); ctx.globalAlpha = .10;
    tileLayer(off * 0.34, 268, VW, (x, i) => {
      poly(ctx, [[x, 0], [x + 46, 0], [x + 122, floorY + 30], [x + 48, floorY + 30]], '#fff6c4');
    });
    ctx.restore();
  }
};

/* ================= the floors level 2 runs on ================= */
Object.assign(FLOOR_EXT, {
  carpetLux(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .32;
    /* a patterned runner, keyed to the world so it never crawls */
    for (let px = Math.floor((x + camX) / 54) * 54 - camX; px < x + w; px += 54) {
      if (px < x - 54) continue;
      const a = Math.max(px, x), b = Math.min(px + 26, x + w);
      if (b > a) { ctx.fillStyle = shade(pal.floorTop, -.24); ctx.fillRect(a, y + 10, b - a, h); }
      const dx0 = px + 13;
      if (dx0 > x && dx0 < x + w) {
        poly(ctx, [[dx0 - 9, y + 22], [dx0, y + 13], [dx0 + 9, y + 22], [dx0, y + 31]], '#d8b25e');
      }
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x, y + 6, w, 3, 0, '#d8b25e'); ctx.restore();
  },
  marble(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 7, 0, pal.floorTop);
    ctx.save();
    ctx.globalAlpha = .3;
    for (let px = Math.floor((x + camX) / 76) * 76 - camX; px < x + w; px += 76) {
      if (px > x) line(ctx, px, y, px - 30, y + h, '#ffffff', 2);
      if (px > x) line(ctx, px + 38, y, px + 8, y + h, '#d8b25e', 1.6);
    }
    ctx.globalAlpha = .16;
    for (let i = 0; i < 4; i++) line(ctx, x, y + 14 + i * 24, x + w, y + 14 + i * 24, '#ffffff', 2);
    /* veining */
    ctx.globalAlpha = .2;
    for (let px = Math.floor((x + camX) / 150) * 150 - camX; px < x + w; px += 150) {
      ctx.beginPath(); ctx.moveTo(px, y + 4);
      ctx.quadraticCurveTo(px + 40, y + 20, px + 24, y + 44);
      ctx.strokeStyle = '#8a8f9c'; ctx.lineWidth = 1.8; ctx.stroke();
    }
    ctx.restore();
  },
  poolDeck(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 7, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .3;
    for (let px = Math.floor((x + camX) / 58) * 58 - camX; px < x + w; px += 58)
      if (px > x) line(ctx, px, y, px, y + h, shade(pal.floorTop, -.25), 2.4);
    ctx.globalAlpha = .2;
    for (let i = 0; i < 3; i++) line(ctx, x, y + 22 + i * 26, x + w, y + 22 + i * 26, '#ffffff', 2);
    ctx.restore();
    /* the blue mosaic strip along the edge of the deck */
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = Math.floor((x + camX) / 20) * 20 - camX; px < x + w; px += 20) {
      const a = Math.max(px, x), b = Math.min(px + 15, x + w);
      if (b > a) { ctx.fillStyle = (Math.round((px + camX) / 20) % 2) ? '#6fc9d6' : '#3f9cc4'; ctx.fillRect(a, y + 8, b - a, 7); }
    }
    ctx.restore();
  },
  stoneProm(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .32;
    for (let row = 0; row < 3; row++) {
      const per = 66, ry = y + 10 + row * 20;
      for (let px = Math.floor((x + camX) / per) * per - camX + (row % 2) * 33; px < x + w; px += per)
        if (px > x - per) {
          const a = Math.max(px, x), b = Math.min(px + per - 5, x + w);
          if (b > a) { ctx.strokeStyle = shade(pal.floorTop, -.28); ctx.lineWidth = 2; ctx.strokeRect(a, ry, b - a, 18); }
        }
    }
    ctx.restore();
  },
  sand(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    const g = ctx.createLinearGradient(0, y, 0, y + 46);
    g.addColorStop(0, pal.floorTop); g.addColorStop(1, pal.floorBody);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, 46);
    ctx.save(); ctx.globalAlpha = .35;
    for (let px = Math.floor((x + camX) / 42) * 42 - camX; px < x + w; px += 42) {
      if (px < x) continue;
      ctx.beginPath();
      ctx.moveTo(px, y + 16 + ((px + camX) % 3) * 4);
      ctx.quadraticCurveTo(px + 21, y + 8 + ((px + camX) % 5) * 3, px + 42, y + 17);
      ctx.strokeStyle = shade(pal.floorTop, -.2); ctx.lineWidth = 2.2; ctx.stroke();
    }
    ctx.globalAlpha = .45;
    for (let px = Math.floor((x + camX) / 29) * 29 - camX; px < x + w; px += 29)
      if (px > x) circle(ctx, px, y + 30 + ((px | 0) % 7), 1.8, shade(pal.floorTop, .3));
    ctx.restore();
  },
  wetSand(ctx, x, y, w, h, pal, t, camX) {
    FLOOR_EXT.sand(ctx, x, y, w, h, pal, t, camX);
    /* the shine left behind by the last wave */
    ctx.save(); ctx.globalAlpha = .3;
    const g = ctx.createLinearGradient(0, y, 0, y + 26);
    g.addColorStop(0, '#cfeaf4'); g.addColorStop(1, 'rgba(207,234,244,0)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, 26);
    ctx.globalAlpha = .45;
    for (let px = Math.floor((x + camX) / 96) * 96 - camX; px < x + w; px += 96) {
      if (px < x) continue;
      ctx.beginPath();
      ctx.moveTo(px, y + 5);
      ctx.quadraticCurveTo(px + 26, y + 13 + Math.sin(t + px * 0.01) * 3, px + 62, y + 4);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.6; ctx.stroke();
    }
    ctx.restore();
  },
  planks(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 13, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .42;
    for (let px = Math.floor((x + camX) / 32) * 32 - camX; px < x + w; px += 32)
      if (px > x) line(ctx, px, y, px, y + 14, shade(pal.floorTop, -.32), 2.4);
    ctx.globalAlpha = .3;
    for (let i = 0; i < 3; i++) line(ctx, x, y + 18 + i * 15, x + w, y + 18 + i * 15, shade(pal.floorBody, -.25), 2);
    ctx.restore();
    /* the beams under the deck, and the sea showing between them */
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 140) * 140 - camX; px < x + w; px += 140)
      if (px > x) fillRR(ctx, px, y + 14, 15, h, 2, shade(pal.floorBody, -.35));
    ctx.restore();
  },
  seabed(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    const g = ctx.createLinearGradient(0, y, 0, y + 52);
    g.addColorStop(0, pal.floorTop); g.addColorStop(1, pal.floorBody);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, 52);
    /* caustics rippling across the sand */
    ctx.save(); ctx.globalAlpha = .22;
    for (let px = Math.floor((x + camX) / 64) * 64 - camX; px < x + w; px += 64) {
      if (px < x - 64) continue;
      const ph = t * 0.6 + (px + camX) * 0.01;
      ctx.beginPath();
      ctx.ellipse(px + 32 + Math.sin(ph) * 8, y + 16 + Math.cos(ph * 0.8) * 5, 26, 8, Math.sin(ph) * 0.3, 0, TAU);
      ctx.strokeStyle = '#dff6ff'; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .35;
    for (let px = Math.floor((x + camX) / 38) * 38 - camX; px < x + w; px += 38) {
      if (px < x) continue;
      ctx.beginPath();
      ctx.moveTo(px, y + 32);
      ctx.quadraticCurveTo(px + 19, y + 25, px + 38, y + 33);
      ctx.strokeStyle = shade(pal.floorTop, -.2); ctx.lineWidth = 2.2; ctx.stroke();
    }
    ctx.globalAlpha = .6;
    for (let px = Math.floor((x + camX) / 54) * 54 - camX; px < x + w; px += 54)
      if (px > x) fillEll(ctx, px, y + 42 + ((px | 0) % 6), 6, 3, shade(pal.floorTop, -.28));
    ctx.restore();
  },
  forestFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y + 8, w, h);
    ctx.fillStyle = pal.floorTop;
    ctx.beginPath(); ctx.moveTo(x, y + 14);
    for (let px = x; px <= x + w; px += 11) ctx.lineTo(px, y + 3 + Math.sin((px + camX) * 0.07) * 3);
    ctx.lineTo(x + w, y + 22); ctx.lineTo(x, y + 22); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 21) * 21 - camX; px < x + w; px += 21)
      if (px > x) line(ctx, px, y + 9, px + 2, y - 4, shade(pal.floorTop, .22), 2.2);
    ctx.globalAlpha = .55;
    for (let px = Math.floor((x + camX) / 47) * 47 - camX; px < x + w; px += 47) {
      if (px < x) continue;
      const k = imod(Math.round((px + camX) / 47), 3);
      fillEll(ctx, px, y + 16 + k * 5, 8, 4, ['#8a6440', '#a8794a', '#6b4a2c'][k], k - 1);
    }
    ctx.restore();
  },
  caveFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 9, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .35;
    for (let px = Math.floor((x + camX) / 52) * 52 - camX; px < x + w; px += 52) {
      if (px < x) continue;
      ctx.beginPath();
      ctx.moveTo(px, y + 4); ctx.lineTo(px + 14, y + 22); ctx.lineTo(px + 40, y + 16);
      ctx.strokeStyle = shade(pal.floorTop, -.3); ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 44) * 44 - camX; px < x + w; px += 44)
      if (px > x) fillEll(ctx, px, y + 30 + ((px | 0) % 5), 7, 3.4, shade(pal.floorTop, -.2));
    ctx.restore();
  }
});

/* =============================================================
   THE FIFTEEN PLACES
============================================================= */
const HOTEL_PAL = {
  far: '#e8d8c0', mid: '#c9a878', skirt: '#b08f5a', frame: '#d8b25e',
  floorTop: '#8a3f5c', floorBody: '#5c2f46', accent: '#d8b25e'
};

const ZONES2 = [
  {
    id: 'suite', exit: 'doorGold', name: 'Apartamentai', sec: 10, diff: 0.14, floor: 'carpetLux',
    pal: Object.assign({}, HOTEL_PAL),
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG2.hotelWall(ctx, VW, VH, camX * 0.35, floorY, pal);
      /* the balcony window, with the sea already visible through it */
      tileLayer(camX * 0.5, 520, VW, x => {
        fillRR(ctx, x, floorY - 296, 200, 210, 8, '#d8b25e');
        ctx.save(); rr(ctx, x + 9, floorY - 287, 182, 192, 5); ctx.clip();
        const g = ctx.createLinearGradient(0, floorY - 287, 0, floorY - 95);
        g.addColorStop(0, '#8fd0ea'); g.addColorStop(.55, '#cfe8f2'); g.addColorStop(1, '#3f9cc4');
        ctx.fillStyle = g; ctx.fillRect(x + 9, floorY - 287, 182, 192);
        ctx.translate(x + 9, 0);
        circle(ctx, 132, floorY - 250, 15, '#fff6d8');
        BG.clouds(ctx, 182, 200, camX * 0.1, t, 'rgba(255,255,255,.7)', floorY - 246, 0.4);
        BG2.seaFar(ctx, 182, 200, camX * 0.2, floorY - 186, floorY - 95, t, '#2f7fa8', '#7fc4d8');
        ctx.restore();
        line(ctx, x + 100, floorY - 287, x + 100, floorY - 95, '#d8b25e', 6);
        /* drapes either side of it */
        [x - 22, x + 176].forEach((dx0, i) => {
          ctx.save(); ctx.globalAlpha = .95;
          ctx.beginPath();
          ctx.moveTo(dx0, floorY - 306);
          ctx.quadraticCurveTo(dx0 + (i ? 12 : -12), floorY - 200, dx0 + (i ? -4 : 4), floorY - 86);
          ctx.lineTo(dx0 + (i ? 46 : -46), floorY - 86);
          ctx.quadraticCurveTo(dx0 + (i ? 34 : -34), floorY - 200, dx0 + (i ? 46 : -46), floorY - 306);
          ctx.closePath(); ctx.fillStyle = '#8a3f5c'; ctx.fill(); ctx.restore();
        });
        fillRR(ctx, x - 30, floorY - 312, 260, 12, 5, '#d8b25e');
      });
      /* a chandelier or two on the ceiling */
      tileLayer(camX * 0.55, 340, VW, x => {
        line(ctx, x + 60, 20, x + 60, 46, '#d8b25e', 3);
        ctx.save(); ctx.globalAlpha = .35;
        circle(ctx, x + 60, 66, 34, '#ffe7a8'); ctx.restore();
        for (let i = 0; i < 5; i++) {
          const px = x + 32 + i * 14;
          fillRR(ctx, px - 3, 52, 6, 13, 2, '#fff6d8');
          poly(ctx, [[px - 3, 66], [px + 3, 66], [px, 78]], 'rgba(230,244,255,.75)');
        }
        ctx.beginPath(); ctx.ellipse(x + 60, 52, 34, 6, 0, 0, TAU);
        ctx.strokeStyle = '#d8b25e'; ctx.lineWidth = 4; ctx.stroke();
      });
    },
    pools: { hurdle: ['poufLux', 'trunkLux', 'lampLux', 'roomCart', 'champagne', 'vaseTall'],
             over: ['chandelierLow'], tunnel: ['curtainLux'],
             ledge: ['consoleLux'], step: ['bedLux', 'sofaLux', 'trunkLux'],
             deco: ['rugLux', 'pawPrints'] }
  },
  {
    id: 'corridor', exit: 'doorGold', name: 'Koridorius', sec: 9, diff: 0.28, floor: 'carpetLux',
    pal: Object.assign({}, HOTEL_PAL, { far: '#dfcdb2', mid: '#bd9c6c' }),
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG2.hotelWall(ctx, VW, VH, camX * 0.35, floorY, pal, 'plain');
      /* numbered doors, one after another, all the way down */
      tileLayer(camX * 0.5, 250, VW, (x, i) => {
        fillRR(ctx, x - 8, floorY - 262, 132, 262, 6, '#d8b25e');
        fillRR(ctx, x, floorY - 254, 116, 254, 4, '#5f3f26');
        ctx.save(); ctx.globalAlpha = .55;
        fillRR(ctx, x + 12, floorY - 240, 92, 94, 4, '#7a5434');
        fillRR(ctx, x + 12, floorY - 136, 92, 106, 4, '#7a5434'); ctx.restore();
        circle(ctx, x + 100, floorY - 132, 5, '#f0d47a');
        fillRR(ctx, x + 36, floorY - 216, 44, 20, 4, '#d8b25e');
        ctx.fillStyle = '#3f2d1c'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(String(201 + imod(i, 9)), x + 58, floorY - 201);
        /* the DO NOT DISTURB card on every other one */
        if (i % 2) {
          fillRR(ctx, x + 92, floorY - 126, 16, 34, 3, '#e2453c');
          ctx.save(); ctx.globalAlpha = .6;
          fillRR(ctx, x + 95, floorY - 118, 10, 3, 1, '#fff'); ctx.restore();
        }
      });
      /* the ceiling coving, receding */
      ctx.save(); ctx.globalAlpha = .45;
      poly(ctx, [[0, 0], [VW, 0], [VW, 26], [0, 26]], '#c9a878');
      for (let i = 0; i < 8; i++) line(ctx, VW * (i / 8), 26, VW * (i / 8) + 30, 0, '#b08f5a', 2);
      ctx.restore();
    },
    pools: { hurdle: ['housekeeping', 'roomCart', 'trunkLux', 'vaseTall', 'suitcaseStack'],
             over: ['corridorArch'], tunnel: ['corridorArch'],
             ledge: ['consoleLux'], step: ['trunkLux', 'sofaLux'],
             deco: ['rugLux', 'pawPrints'] }
  },
  {
    id: 'lobby', exit: 'doorGlass', name: 'Laukiamasis', sec: 11, diff: 0.4, floor: 'marble',
    pal: { far: '#f0e6d2', mid: '#d8c4a2', skirt: '#c0a87e', frame: '#d8b25e',
           floorTop: '#f2ece0', floorBody: '#b8ab94', accent: '#d8b25e' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#f6efe0'); g.addColorStop(1, '#e0d2b8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      const gy = floorY - 300;
      /* the back wall: tall arched windows onto the sea, set in marble */
      tileLayer(camX * 0.16, 300, VW, (x, i) => {
        const wx = x + 26, ww = 150, wy = floorY - 292, wh = 210;
        fillRR(ctx, wx - 12, wy - 14, ww + 24, wh + 26, 8, '#e6d9c0');
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(wx, wy + wh); ctx.lineTo(wx, wy + ww * 0.5);
        ctx.quadraticCurveTo(wx + ww * 0.5, wy - ww * 0.16, wx + ww, wy + ww * 0.5);
        ctx.lineTo(wx + ww, wy + wh); ctx.closePath();
        ctx.clip();
        const sg = ctx.createLinearGradient(0, wy - 40, 0, wy + wh);
        sg.addColorStop(0, '#8fcfe8'); sg.addColorStop(1, '#dff0f6');
        ctx.fillStyle = sg; ctx.fillRect(wx, wy - 40, ww, wh + 40);
        ctx.translate(wx, 0);
        BG.clouds(ctx, ww, wh, camX * 0.1 + i * 90, t, 'rgba(255,255,255,.7)', wy + 40, 0.45);
        BG2.seaFar(ctx, ww, wh, camX * 0.2, wy + wh * 0.52, wy + wh, t, '#2f7fa8', '#8fd0dc');
        ctx.restore();
        /* the glazing bars and the gilt surround */
        ctx.save(); ctx.globalAlpha = .9;
        line(ctx, wx + ww / 2, wy + 4, wx + ww / 2, wy + wh, '#d8b25e', 5);
        for (let k = 1; k < 4; k++) line(ctx, wx + 4, wy + ww * 0.5 + k * 44, wx + ww - 4, wy + ww * 0.5 + k * 44, '#d8b25e', 4);
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(wx, wy + wh); ctx.lineTo(wx, wy + ww * 0.5);
        ctx.quadraticCurveTo(wx + ww * 0.5, wy - ww * 0.16, wx + ww, wy + ww * 0.5);
        ctx.lineTo(wx + ww, wy + wh);
        ctx.strokeStyle = '#d8b25e'; ctx.lineWidth = 7; ctx.stroke();
        /* drapes tied back either side */
        [wx - 16, wx + ww - 12].forEach((dx0, k) => {
          ctx.save(); ctx.globalAlpha = .95;
          ctx.beginPath();
          ctx.moveTo(dx0, wy - 8);
          ctx.quadraticCurveTo(dx0 + (k ? 14 : -14), wy + wh * 0.5, dx0 + (k ? -2 : 2), wy + wh + 10);
          ctx.lineTo(dx0 + (k ? 30 : -30), wy + wh + 10);
          ctx.quadraticCurveTo(dx0 + (k ? 22 : -22), wy + wh * 0.5, dx0 + (k ? 30 : -30), wy - 8);
          ctx.closePath(); ctx.fillStyle = '#8a3f5c'; ctx.fill(); ctx.restore();
        });
      });
      /* marble dado along the foot of the back wall */
      fillRR(ctx, 0, floorY - 78, VW, 78, 0, '#e6d9c0');
      ctx.save(); ctx.globalAlpha = .4;
      tileLayer(camX * 0.16, 96, VW, x => { goldEdge(ctx, x + 8, floorY - 64, 80, 50, 4); });
      ctx.restore();
      fillRR(ctx, 0, floorY - 86, VW, 10, 0, '#d8b25e');
      /* reception, and a sweep of stair behind it */
      tileLayer(camX * 0.42, 660, VW, x => {
        for (let k = 0; k < 8; k++)
          fillRR(ctx, x + 330 + k * 22, floorY - 30 - k * 20, 130 - k * 4, 18, 3, '#c9a878');
        ctx.save(); ctx.globalAlpha = .7;
        line(ctx, x + 336, floorY - 62, x + 508, floorY - 214, '#d8b25e', 6); ctx.restore();
        fillRR(ctx, x, floorY - 150, 250, 150, 6, '#7a5434');
        fillRR(ctx, x - 8, floorY - 158, 266, 16, 5, '#d8b25e');
        ctx.save(); ctx.globalAlpha = .5;
        for (let k = 0; k < 5; k++) fillRR(ctx, x + 14 + k * 46, floorY - 138, 34, 120, 3, '#8a5f3a');
        ctx.restore();
        ctx.fillStyle = '#8a5f3a'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('REGISTRATŪRA', x + 125, floorY - 172);
      });
      /* the columns, standing in front of all of it */
      tileLayer(camX * 0.3, 330, VW, x => {
        const cg = ctx.createLinearGradient(x, 0, x + 46, 0);
        cg.addColorStop(0, '#d8cab0'); cg.addColorStop(.4, '#f6efe0'); cg.addColorStop(1, '#cbbc9e');
        ctx.fillStyle = cg; ctx.fillRect(x, gy, 46, floorY - gy);
        ctx.save(); ctx.globalAlpha = .3;
        for (let k = 0; k < 5; k++) line(ctx, x + 6 + k * 8, gy + 16, x + 6 + k * 8, floorY - 18, '#a8977c', 2.4);
        ctx.restore();
        fillRR(ctx, x - 9, gy - 6, 64, 26, 4, '#efe6d4');
        fillRR(ctx, x - 7, floorY - 24, 60, 26, 4, '#efe6d4');
        ctx.save(); ctx.globalAlpha = .85;
        fillRR(ctx, x - 9, gy + 18, 64, 5, 2, '#d8b25e'); ctx.restore();
      });
      /* the ceiling and its chandeliers */
      fillRR(ctx, 0, 0, VW, 30, 0, '#e8ddc8');
      tileLayer(camX * 0.55, 300, VW, x => {
        line(ctx, x + 70, 26, x + 70, 54, '#d8b25e', 4);
        ctx.save(); ctx.globalAlpha = .3; circle(ctx, x + 70, 80, 46, '#ffe7a8'); ctx.restore();
        for (let ring = 0; ring < 2; ring++) {
          const ry = 60 + ring * 26, rw = 46 - ring * 15;
          ctx.beginPath(); ctx.ellipse(x + 70, ry, rw, 7, 0, 0, TAU);
          ctx.strokeStyle = '#d8b25e'; ctx.lineWidth = 4; ctx.stroke();
          for (let i = 0; i < 6 - ring; i++) {
            const px = x + 70 - rw + (2 * rw) * (i / (5 - ring));
            fillRR(ctx, px - 3, ry - 14, 6, 12, 2, '#fff6d8');
            poly(ctx, [[px - 3, ry + 4], [px + 3, ry + 4], [px, ry + 14]], 'rgba(230,244,255,.7)');
          }
        }
      });
    },
    pools: { hurdle: ['suitcaseStack', 'palmPot', 'velvetRope', 'roomCart', 'armchairLux', 'vaseTall'],
             over: ['chandelierLow', 'lobbyArch'], tunnel: ['lobbyArch'],
             ledge: ['receptionDesk', 'consoleLux'], step: ['sofaLux', 'armchairLux', 'trunkLux'],
             deco: ['marbleShine', 'pawPrints'] }
  },
  {
    id: 'poolside', exit: 'gateHotel', name: 'Baseinas', sec: 11, diff: 0.5, floor: 'poolDeck',
    pal: { sky1: '#5fc4ea', sky2: '#bfeaf6', far: '#f0e6d2', mid: '#d8c4a2',
           floorTop: '#efe6d4', floorBody: '#c9bda8', accent: '#3f9cc4', cloud: '#ffffff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.76, 62, 30, '#fff6d8');
      BG.clouds(ctx, VW, VH, camX * 0.06, t, pal.cloud, 44, 0.9);
      /* the hotel standing behind the terrace */
      tileLayer(camX * 0.16, 330, VW, (x, i) => {
        fillRR(ctx, x, floorY - 330, 260, 330, 8, '#f2ece0');
        ctx.save(); ctx.globalAlpha = .8;
        for (let r = 0; r < 3; r++) {
          fillRR(ctx, x + 6, floorY - 306 + r * 84, 248, 10, 4, '#d8b25e');
          for (let c = 0; c < 4; c++) {
            fillRR(ctx, x + 16 + c * 60, floorY - 366 + r * 84 + 62, 44, 52, 5, '#8fc4d6');
            ctx.save(); ctx.globalAlpha = .5;
            fillRR(ctx, x + 20 + c * 60, floorY - 366 + r * 84 + 66, 16, 44, 3, '#eaf6fb'); ctx.restore();
            /* the balcony rail in front of every window */
            for (let b = 0; b < 5; b++) line(ctx, x + 18 + c * 60 + b * 10, floorY - 306 + r * 84,
              x + 18 + c * 60 + b * 10, floorY - 290 + r * 84, '#d8b25e', 2);
          }
        }
        ctx.restore();
      });
      /* palms along the terrace */
      tileLayer(camX * 0.3, 235, VW, (x, i) => {
        const r = makeRng(i * 37 + 5), h = 150 + r() * 60;
        ctx.beginPath();
        ctx.moveTo(x + 6, floorY - 60);
        ctx.quadraticCurveTo(x + 16, floorY - 60 - h * 0.6, x + 2, floorY - 60 - h);
        ctx.strokeStyle = '#a8794a'; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.stroke();
        for (let k = 0; k < 7; k++) {
          const a = -Math.PI * 0.5 + (k - 3) * 0.44;
          ctx.beginPath(); ctx.moveTo(x + 2, floorY - 60 - h);
          ctx.quadraticCurveTo(x + 2 + Math.cos(a) * 44, floorY - 66 - h + Math.sin(a) * 34 - 12,
            x + 2 + Math.cos(a) * 74, floorY - 58 - h + Math.sin(a) * 62);
          ctx.strokeStyle = k % 2 ? '#3f9c5c' : '#4caf6d'; ctx.lineWidth = 8; ctx.stroke();
        }
      });
      /* THE POOL — a long turquoise basin right behind the deck she runs on */
      const py = floorY - 132, pb = floorY - 30;
      fillRR(ctx, 0, py - 26, VW, 26, 0, '#efe6d4');
      const pg = ctx.createLinearGradient(0, py, 0, pb);
      pg.addColorStop(0, '#1f8fbc'); pg.addColorStop(.55, '#3fb0cc'); pg.addColorStop(1, '#8fdfe4');
      ctx.fillStyle = pg; ctx.fillRect(0, py, VW, pb - py);
      /* the lane tiles on the bottom, seen through the water */
      ctx.save(); ctx.globalAlpha = .22;
      for (let px = -imod(camX * 0.5, 54); px < VW; px += 54)
        fillRR(ctx, px, py + 18, 30, pb - py - 26, 4, '#0f5f88');
      ctx.restore();
      /* light moving over the surface */
      ctx.save(); ctx.globalAlpha = .4;
      for (let row = 0; row < 6; row++) {
        ctx.beginPath();
        for (let px = 0; px <= VW; px += 10) {
          const yy = py + 12 + row * 15 + Math.sin((px + camX * 0.5) * 0.035 + t * 1.2 + row) * 4;
          px ? ctx.lineTo(px, yy) : ctx.moveTo(px, yy);
        }
        ctx.strokeStyle = '#eaf9ff'; ctx.lineWidth = 2.6; ctx.stroke();
      }
      ctx.restore();
      /* a lilo and a beach ball drifting on it */
      tileLayer(camX * 0.66, 430, VW, (x, i) => {
        ctx.save(); ctx.translate(x, py + 40 + Math.sin(t * 1.1 + i) * 4); ctx.rotate(0.04);
        fillRR(ctx, 0, 0, 104, 18, 9, '#ffd870');
        ctx.save(); ctx.globalAlpha = .5; fillRR(ctx, 7, 3, 90, 5, 2, '#fff6d8'); ctx.restore();
        ctx.restore();
        ctx.save(); ctx.globalAlpha = .9;
        circle(ctx, x + 250, py + 62 + Math.sin(t * 1.4 + i) * 4, 15, '#ff6b7a');
        ctx.restore();
      });
      /* the coping, and a ladder into the water */
      fillRR(ctx, 0, py - 8, VW, 12, 0, '#6fc9d6');
      fillRR(ctx, 0, pb - 4, VW, 34, 0, '#efe6d4');
      ctx.save(); ctx.globalAlpha = .5;
      for (let px = -imod(camX * 0.5, 24); px < VW; px += 24) line(ctx, px, pb, px, pb + 26, '#d5c9b0', 2);
      ctx.restore();
      tileLayer(camX * 0.66, 560, VW, x => {
        [x, x + 26].forEach(lx => line(ctx, lx, pb + 6, lx, py - 34, '#dfe6ec', 5));
        for (let k = 0; k < 3; k++) line(ctx, x, py - 22 + k * 16, x + 26, py - 22 + k * 16, '#dfe6ec', 4);
        ctx.beginPath(); ctx.arc(x + 13, py - 34, 13, Math.PI, 0);
        ctx.strokeStyle = '#dfe6ec'; ctx.lineWidth = 5; ctx.stroke();
      });
    },
    pools: { hurdle: ['sunLounger', 'poolFloat', 'towelStack', 'palmPot', 'champagne'],
             over: ['parasol'], tunnel: ['cabana'],
             ledge: ['poolBar'], step: ['sunLounger', 'towelStack', 'trunkLux'],
             deco: ['poolTile', 'wetPaw', 'marbleShine'] }
  },
  {
    id: 'promenade', name: 'Promenada', sec: 9, diff: 0.56, floor: 'stoneProm',
    pal: { sky1: '#6fcfea', sky2: '#cdeef8', far: '#c9d8e0', mid: '#a8bcc9',
           floorTop: '#ded4c2', floorBody: '#a89e8c', accent: '#3f9cc4', cloud: '#ffffff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.68, 58, 28, '#fff6d8');
      BG.clouds(ctx, VW, VH, camX * 0.05, t, pal.cloud, 40, 1.05);
      /* the hotels behind her — spaced out, so the sea is never walled off */
      BG.buildings(ctx, VW, VH, camX * 0.2, floorY - 214, ['#f2ece0', '#e8ddc8', '#dfd0b8'], '#ffe7b0', 100, 170, 330, true);
      /* the sea, filling everything below their feet */
      BG2.seaFar(ctx, VW, VH, camX * 0.1, floorY - 214, floorY - 62, t, '#2f8fb8', '#8fd6e0');
      /* a strip of beach between the water and the promenade */
      ctx.save(); ctx.globalAlpha = .95;
      ctx.beginPath();
      ctx.moveTo(-10, floorY - 62);
      for (let px = -10; px <= VW + 10; px += 14)
        ctx.lineTo(px, floorY - 66 + Math.sin((px + camX * 0.24) * 0.012 + t * 0.6) * 4);
      ctx.lineTo(VW + 10, floorY - 20); ctx.lineTo(-10, floorY - 20); ctx.closePath();
      ctx.fillStyle = '#ecdcae'; ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = .8;
      for (let px = -imod(camX * 0.24, 26); px < VW; px += 26)
        fillEll(ctx, px, floorY - 62, 13, 3.4, '#fbfdfe');
      ctx.restore();
      /* the balustrade along the edge of the promenade */
      tileLayer(camX * 0.62, 46, VW, x => {
        ctx.beginPath();
        ctx.moveTo(x + 8, floorY - 66); ctx.quadraticCurveTo(x + 2, floorY - 44, x + 8, floorY - 20);
        ctx.strokeStyle = '#efe6d4'; ctx.lineWidth = 9; ctx.stroke();
      });
      fillRR(ctx, 0, floorY - 76, VW, 12, 0, '#f2ece0');
      fillRR(ctx, 0, floorY - 22, VW, 12, 0, '#e8ddc8');
      /* lamp posts and flags */
      tileLayer(camX * 0.5, 280, VW, (x, i) => {
        line(ctx, x, floorY - 76, x, floorY - 206, '#4a5468', 6);
        circle(ctx, x, floorY - 212, 10, '#fff6d8');
        ctx.save(); ctx.globalAlpha = .3; circle(ctx, x, floorY - 212, 22, '#ffe7a8'); ctx.restore();
        const fw = 30 + Math.sin(t * 2 + i) * 4;
        poly(ctx, [[x + 3, floorY - 200], [x + 3 + fw, floorY - 192 + Math.sin(t * 2 + i) * 4],
          [x + 3, floorY - 176]], ['#e2453c', '#f5b731', '#3f9cc4'][imod(i, 3)]);
      });
    },
    pools: { hurdle: ['benchProm', 'iceCart', 'planterProm', 'bikeProm', 'palmPot'],
             over: ['promArch'], tunnel: ['netArch'],
             ledge: ['kioskLedge'], step: ['benchProm', 'planterProm'],
             deco: ['promStone', 'pebbles', 'shells'] }
  },
  {
    id: 'beach', name: 'Paplūdimys', sec: 12, diff: 0.6, floor: 'sand', gulls: 4,
    pal: { sky1: '#7fd6ee', sky2: '#d8f0f8', far: '#e8d8ae', mid: '#d2bc8a',
           floorTop: '#f0dfae', floorBody: '#d2bc8a', accent: '#3f9cc4', cloud: '#ffffff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.62, 54, 30, '#fff6d8');
      BG.clouds(ctx, VW, VH, camX * 0.04, t, pal.cloud, 36, 1.15);
      /* gulls circling out over the water, far away and harmless */
      ctx.save(); ctx.globalAlpha = .5;
      for (let i = 0; i < 7; i++) {
        const r = makeRng(i * 43 + 9);
        const gx = imod(i * 190 - camX * 0.1 - t * (10 + r() * 14), VW + 120) - 60;
        const gy = 60 + r() * 90 + Math.sin(t * 0.9 + i) * 9;
        const fl = Math.sin(t * 3 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(gx - 11, gy + fl); ctx.quadraticCurveTo(gx - 5, gy - 5, gx, gy);
        ctx.quadraticCurveTo(gx + 5, gy - 5, gx + 11, gy + fl);
        ctx.strokeStyle = '#5f7080'; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.restore();
      /* the sea, calm, running away to the horizon */
      BG2.seaFar(ctx, VW, VH, camX * 0.08, floorY - 210, floorY - 54, t, '#2f8fb8', '#a8e2e8');
      /* the foam line where it meets the sand */
      ctx.save();
      ctx.globalAlpha = .85;
      ctx.beginPath();
      ctx.moveTo(-10, floorY - 46);
      for (let px = -10; px <= VW + 10; px += 12)
        ctx.lineTo(px, floorY - 50 + Math.sin((px + camX * 0.3) * 0.02 + t * 0.9) * 5);
      ctx.lineTo(VW + 10, floorY - 24); ctx.lineTo(-10, floorY - 24); ctx.closePath();
      ctx.fillStyle = '#f4fbfd'; ctx.fill();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .5;
      for (let i = 0; i < 26; i++) {
        const r = makeRng(i * 29 + 5);
        circle(ctx, imod(i * 71 - camX * 0.3, VW + 40) - 20,
          floorY - 44 + r() * 16 + Math.sin(t * 1.4 + i) * 3, 1.6 + r() * 2.4, '#ffffff');
      }
      ctx.restore();
      /* dunes with marram grass, behind her */
      BG.hills(ctx, VW, VH, camX * 0.2, floorY - 22, '#e6d3a4', 15, 470);
      ctx.save(); ctx.globalAlpha = .7;
      tileLayer(camX * 0.24, 44, VW, (x, i) => {
        const r = makeRng(i * 17 + 3), gy = floorY - 20 - r() * 12;
        for (let k = -2; k <= 2; k++)
          line(ctx, x, gy, x + k * 8, gy - 20 - r() * 12 + Math.sin(t * 1.2 + i + k) * 2, '#b8bc72', 2.2);
      });
      ctx.restore();
    },
    pools: { hurdle: ['sandcastle', 'beachBall', 'deckchair', 'driftwood', 'poolFloat'],
             over: ['umbrellaOpen'], tunnel: ['netArch'],
             ledge: ['boardwalkLedge'], step: ['rowboat', 'deckchair'],
             deco: ['shells', 'sandRipple', 'wetPaw'] }
  },
  {
    id: 'pier', name: 'Tiltas', sec: 13, diff: 0.66, floor: 'planks', gulls: 3,
    turn: 1, dive: 1,
    pal: { sky1: '#6fcfea', sky2: '#d8f0f8', far: '#a8c9d6', mid: '#7fa8bc',
           floorTop: '#d8b98a', floorBody: '#9a7550', accent: '#3f4a5c', cloud: '#ffffff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.2, 62, 30, '#fff6d8');
      BG.clouds(ctx, VW, VH, camX * 0.035, t, pal.cloud, 34, 1.2);
      /* the shore falling away behind, now that she has turned */
      ctx.save(); ctx.globalAlpha = .55;
      BG.buildings(ctx, VW, VH, camX * 0.06, floorY - 206, ['#e2e8ee', '#d2dce4'], '#ffe7b0', 40, 90, 210, true);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .85;
      BG.hills(ctx, VW, VH, camX * 0.05, floorY - 202, '#e6dcc4', 9, 520);
      ctx.restore();
      /* open sea, all the way to both sides of the deck */
      BG2.seaFar(ctx, VW, VH, camX * 0.09, floorY - 206, floorY + 120, t, '#2f8fb8', '#5fb8cc');
      /* Everything that belongs to the deck — railing, rails, lamps — stops
         exactly where the deck does. Past the last plank there is only sea. */
      const endS = this.deckEnd == null ? VW + 60 : this.deckEnd - camX;
      if (endS > -30) {
        ctx.save();
        ctx.beginPath(); ctx.rect(-40, 0, Math.min(endS, VW + 40) + 40, VH); ctx.clip();
        tileLayer(camX * 0.55, 62, VW, x => {
          line(ctx, x, floorY - 34, x, floorY - 128, '#3f4a5c', 6);
          ctx.save(); ctx.globalAlpha = .55;
          line(ctx, x + 2, floorY - 40, x + 2, floorY - 120, '#6f7a8c', 2); ctx.restore();
        });
        fillRR(ctx, -40, floorY - 134, VW + 80, 9, 4, '#3f4a5c');
        fillRR(ctx, -40, floorY - 96, VW + 80, 6, 3, '#4a5468');
        fillRR(ctx, -40, floorY - 62, VW + 80, 6, 3, '#4a5468');
        tileLayer(camX * 0.55, 310, VW, x => {
          line(ctx, x, floorY - 134, x, floorY - 224, '#3f4a5c', 7);
          poly(ctx, [[x - 13, floorY - 224], [x + 13, floorY - 224], [x + 9, floorY - 254], [x - 9, floorY - 254]], '#fff6d8');
          ctx.save(); ctx.globalAlpha = .28; circle(ctx, x, floorY - 236, 30, '#ffe7a8'); ctx.restore();
          fillRR(ctx, x - 15, floorY - 258, 30, 7, 3, '#3f4a5c');
        });
        ctx.restore();
      }
      /* a sailing boat out on the water, because it is that kind of day */
      tileLayer(camX * 0.12, 900, VW, x => {
        const by = floorY - 168 + Math.sin(t * 0.8) * 3;
        poly(ctx, [[x, by], [x + 74, by], [x + 62, by + 15], [x + 10, by + 15]], '#f2ece0');
        line(ctx, x + 40, by, x + 40, by - 74, '#c9bda8', 3);
        poly(ctx, [[x + 42, by - 72], [x + 76, by - 4], [x + 42, by - 4]], '#ffffff');
        poly(ctx, [[x + 37, by - 68], [x + 12, by - 4], [x + 37, by - 4]], '#eaf4fb');
      });
    },
    pools: { hurdle: ['pierCrate', 'bollard', 'lifering', 'fishBox', 'poolFloat'],
             over: ['pierArch'], tunnel: ['netArch'],
             ledge: ['pierBench'], step: ['pierBench', 'pierCrate'],
             deco: ['plankGrain', 'ropeCoil', 'wetPaw'] }
  },
  {
    id: 'seabed', name: 'Jūros dugnas', sec: 11, diff: 0.62, floor: 'seabed', water: 1, calm: 1,
    pal: { floorTop: '#e0d4a8', floorBody: '#a8996f', accent: '#8fd6ff',
           treadTop: '#e0d4a8', treadSide: '#a8996f' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG2.underwater(ctx, VW, VH, camX, floorY, t, '#3fa8cc', '#0f4a6a', -180);
      BG2.fish(ctx, VW, VH, camX, floorY, t, 9, '#f6b93a', '#ff8fa8');
      /* weed and boulders lying further out */
      ctx.save(); ctx.globalAlpha = .55;
      tileLayer(camX * 0.3, 180, VW, (x, i) => {
        const r = makeRng(i * 29 + 7);
        for (let k = 0; k < 5; k++) {
          const px = x + k * 14 + r() * 10, sway = Math.sin(t * 0.9 + i + k) * 7;
          ctx.beginPath(); ctx.moveTo(px, floorY - 4);
          ctx.quadraticCurveTo(px + sway, floorY - 50, px + sway * 1.8, floorY - 96 - r() * 40);
          ctx.strokeStyle = k % 2 ? '#2f6b4a' : '#3f8a5c'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
        }
      });
      ctx.restore();
    },
    fg(ctx, VW, VH, camX, floorY, t) { WATER_FG(ctx, VW, VH, camX, floorY, t, 0.22); },
    pools: { hurdle: ['coralRock', 'anemone', 'clamShell', 'amphora', 'starRock'],
             over: ['kelpArch'], tunnel: ['kelpTunnel'],
             ledge: ['seaLedge'], step: ['coralRock', 'amphora', 'clamShell'],
             deco: ['seagrass', 'shells', 'bubblesDeco'] }
  },
  {
    id: 'wreck', name: 'Nuskendęs laivas', sec: 11, diff: 0.74, floor: 'seabed', water: 1, calm: 1,
    pal: { floorTop: '#cfc49c', floorBody: '#8a7f5c', accent: '#d8b25e',
           treadTop: '#cfc49c', treadSide: '#8a7f5c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG2.underwater(ctx, VW, VH, camX, floorY, t, '#2f7fa8', '#0a3450', -320);
      /* the ship herself, lying over on the bottom */
      tileLayer(camX * 0.22, 980, VW, x => {
        ctx.save(); ctx.globalAlpha = .82;
        ctx.translate(x, floorY - 30); ctx.rotate(-0.1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(60, -150, 250, -170);
        ctx.lineTo(560, -150);
        ctx.quadraticCurveTo(600, -60, 520, 6);
        ctx.lineTo(80, 12); ctx.closePath();
        ctx.fillStyle = '#2f3f4a'; ctx.fill();
        ctx.save(); ctx.globalAlpha = .4;
        for (let i = 0; i < 9; i++) line(ctx, 70 + i * 54, -150, 60 + i * 54, 8, '#1c2a33', 3);
        for (let k = 0; k < 3; k++) line(ctx, 40, -40 - k * 42, 545, -56 - k * 42, '#1c2a33', 3);
        ctx.restore();
        for (let i = 0; i < 6; i++) circle(ctx, 140 + i * 66, -96, 12, '#12222c');
        /* the broken mast, and rigging still hanging off it */
        ctx.save(); ctx.rotate(-0.34);
        fillRR(ctx, 250, -420, 16, 270, 5, '#3f3126');
        ctx.globalAlpha = .5;
        line(ctx, 258, -412, 130, -190, '#5f5548', 3);
        line(ctx, 258, -412, 390, -196, '#5f5548', 3);
        ctx.restore();
        ctx.restore();
      });
      BG2.fish(ctx, VW, VH, camX, floorY, t, 12, '#8fd6ff', '#f6b93a');
      ctx.save(); ctx.globalAlpha = .5;
      tileLayer(camX * 0.34, 210, VW, (x, i) => {
        const r = makeRng(i * 41 + 3);
        for (let k = 0; k < 4; k++)
          fillEll(ctx, x + k * 16, floorY - 12 - r() * 26, 15, 8, k % 2 ? '#3f7a5c' : '#4f9c6c', Math.sin(t + k) * .3);
      });
      ctx.restore();
    },
    fg(ctx, VW, VH, camX, floorY, t) { WATER_FG(ctx, VW, VH, camX, floorY, t, 0.22); },
    pools: { hurdle: ['anchorW', 'chestW', 'barrelW', 'cannonW', 'coralRock'],
             over: ['wreckBeam'], tunnel: ['wreckHull'],
             ledge: ['wreckDeck'], step: ['chestW', 'barrelW', 'coralRock'],
             deco: ['seagrass', 'bubblesDeco', 'shells'] }
  },
  {
    id: 'reef', name: 'Koralų rifas', sec: 10, diff: 0.8, floor: 'seabed', water: 1, calm: 1,
    pal: { floorTop: '#f0dcb8', floorBody: '#b8a37a', accent: '#ff8fa8',
           treadTop: '#f0dcb8', treadSide: '#b8a37a' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG2.underwater(ctx, VW, VH, camX, floorY, t, '#4fbcd8', '#12607f', -140);
      /* a wall of coral behind everything */
      tileLayer(camX * 0.26, 190, VW, (x, i) => {
        const r = makeRng(i * 61 + 11);
        ctx.save(); ctx.globalAlpha = .78;
        for (let k = 0; k < 4; k++) {
          const px = x + k * 46 + r() * 16, ph = 60 + r() * 110;
          const col = ['#e0708a', '#f0a24a', '#a87fd6', '#4fb8a0'][imod(i + k, 4)];
          if (k % 2) {
            /* fan coral */
            ctx.beginPath();
            ctx.moveTo(px, floorY);
            ctx.quadraticCurveTo(px - ph * 0.5, floorY - ph * 0.7, px, floorY - ph);
            ctx.quadraticCurveTo(px + ph * 0.5, floorY - ph * 0.7, px, floorY);
            ctx.fillStyle = col; ctx.fill();
            ctx.save(); ctx.globalAlpha = .4;
            for (let q = -2; q <= 2; q++)
              line(ctx, px, floorY - 6, px + q * ph * 0.18, floorY - ph * 0.9, shade(col, -.25), 2);
            ctx.restore();
          } else {
            /* branching coral */
            for (let b = -1; b <= 1; b++) {
              ctx.beginPath(); ctx.moveTo(px, floorY);
              ctx.quadraticCurveTo(px + b * 16, floorY - ph * 0.6, px + b * 30, floorY - ph);
              ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
              circle(ctx, px + b * 30, floorY - ph, 6, shade(col, .28));
            }
          }
        }
        ctx.restore();
      });
      BG2.fish(ctx, VW, VH, camX, floorY, t, 16, '#ffd870', '#6fe0c8');
      /* a turtle going quietly about its business */
      tileLayer(camX * 0.3 + t * 26, 1400, VW, x => {
        const ty = floorY - 190 + Math.sin(t * 0.6) * 14;
        ctx.save(); ctx.globalAlpha = .8; ctx.translate(x, ty);
        fillEll(ctx, 0, 0, 34, 22, '#4f7a54');
        ctx.save(); ctx.globalAlpha = .5;
        for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++)
          fillEll(ctx, i * 16, k * 9, 7, 5, '#6b9c6a'); ctx.restore();
        fillEll(ctx, 33, -5, 11, 8, '#5f8a5f');
        circle(ctx, 39, -7, 1.8, '#2b2b34');
        fillEll(ctx, -12, -18, 15, 7, '#5f8a5f', -0.5);
        fillEll(ctx, -12, 18, 15, 7, '#5f8a5f', 0.5);
        ctx.restore();
      });
    },
    fg(ctx, VW, VH, camX, floorY, t) { WATER_FG(ctx, VW, VH, camX, floorY, t, 0.22); },
    pools: { hurdle: ['reefRock', 'anemone', 'clamShell', 'starRock', 'amphora'],
             over: ['kelpArch'], tunnel: ['kelpTunnel'],
             ledge: ['seaLedge'], step: ['reefRock', 'clamShell', 'chestW'],
             deco: ['seagrass', 'bubblesDeco', 'shells'] }
  },
  {
    id: 'shallows', name: 'Sekluma', sec: 9, diff: 0.7, floor: 'seabed', water: 1, rising: 1, calm: 1,
    pal: { floorTop: '#f0e0b0', floorBody: '#c2ac80', accent: '#8fd6ff',
           treadTop: '#f0e0b0', treadSide: '#c2ac80' },
    /* the sea floor is climbing under her: the surface comes down to meet it,
       and by the far end of this stretch she is running in daylight again */
    surfAt(camX, VW, floorY) {
      const sp = this.span;
      const p = sp ? inv(camX + VW * 0.34, sp.x0, sp.x1) : 0;
      return -260 + smooth(clamp(p * 1.18, 0, 1)) * (floorY + 300);
    },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const surf = this.surfAt(camX, VW, floorY);
      const p = clamp(inv(surf, -260, floorY - 40), 0, 1);
      /* the sky, revealed as the water drops away */
      BG.sky(ctx, VW, VH, '#7fd6ee', '#d8f0f8');
      BG.sun(ctx, VW, VH, VW * 0.3, 56, 28, '#fff6d8');
      BG.clouds(ctx, VW, VH, camX * 0.04, t, '#ffffff', 34, 1.1);
      /* the far shore she is climbing towards: a bank of sand that always
         meets the water exactly where the surface is, with pines on top of it */
      const bank = clamp(surf, 40, floorY - 20) + 4;
      BG.hills(ctx, VW, VH, camX * 0.16, bank, '#e6d3a4', 20, 340);
      ctx.save(); ctx.globalAlpha = .92;
      tileLayer(camX * 0.24, 230, VW, (x, i) => {
        const r = makeRng(i * 31 + 5), h = 96 + r() * 64;
        fillRR(ctx, x - 7, bank - h, 14, h + 14, 5, '#7a5a3a');
        leafy(ctx, x, bank - h - 10, 42, 34, '#3f9c5c', '#5cc47c', i * 5);
      });
      ctx.restore();
      /* everything still below the waterline */
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-10, VH + 10); ctx.lineTo(-10, surf);
      for (let px = -10; px <= VW + 10; px += 12)
        ctx.lineTo(px, surf + Math.sin((px + camX * 0.5) * 0.016 + t * 0.7) * 6);
      ctx.lineTo(VW + 10, VH + 10); ctx.closePath();
      ctx.clip();
      BG2.underwater(ctx, VW, VH, camX, floorY, t, '#5fc4dc', '#2f8fa8', surf);
      BG2.fish(ctx, VW, VH, camX, floorY, t, 7, '#f6b93a', '#8fd6ff');
      ctx.restore();
      /* the line of the surface itself, and the foam on it */
      if (surf < floorY + 30) {
        ctx.save(); ctx.globalAlpha = .9;
        ctx.beginPath();
        for (let px = -10; px <= VW + 10; px += 12) {
          const yy = surf + Math.sin((px + camX * 0.5) * 0.016 + t * 0.7) * 6;
          px === -10 ? ctx.moveTo(px, yy) : ctx.lineTo(px, yy);
        }
        ctx.strokeStyle = '#f4fbfd'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
      }
    },
    fg(ctx, VW, VH, camX, floorY, t) {
      const surf = this.surfAt(camX, VW, floorY);
      const k = clamp(inv(surf, floorY - 40, -180), 0, 1);
      if (k > 0.02) WATER_FG(ctx, VW, VH, camX, floorY, t, 0.22 * k, surf);
    },
    pools: { hurdle: ['rockWet', 'clamShell', 'coralRock', 'driftwood', 'starRock'],
             over: ['kelpArch'], tunnel: ['kelpTunnel'],
             ledge: ['seaLedge'], step: ['rockWet', 'driftwood', 'clamShell'],
             deco: ['sandRipple', 'shells', 'seagrass'] }
  },
  {
    id: 'shore', name: 'Krantas', sec: 8, diff: 0.72, floor: 'wetSand', gulls: 2,
    pal: { sky1: '#7fd6ee', sky2: '#d8f0f8', far: '#e8d8ae', mid: '#cfbc8a',
           floorTop: '#e2cf9e', floorBody: '#bda87c', accent: '#3f9cc4', cloud: '#ffffff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.24, 56, 28, '#fff6d8');
      BG.clouds(ctx, VW, VH, camX * 0.04, t, pal.cloud, 34, 1.1);
      /* the sea now behind her, and getting further away */
      BG2.seaFar(ctx, VW, VH, camX * 0.07, floorY - 194, floorY - 96, t, '#2f8fb8', '#a8e2e8');
      ctx.save(); ctx.globalAlpha = .85;
      ctx.beginPath();
      ctx.moveTo(-10, floorY - 92);
      for (let px = -10; px <= VW + 10; px += 12)
        ctx.lineTo(px, floorY - 96 + Math.sin((px + camX * 0.3) * 0.02 + t) * 5);
      ctx.lineTo(VW + 10, floorY - 72); ctx.lineTo(-10, floorY - 72); ctx.closePath();
      ctx.fillStyle = '#f4fbfd'; ctx.fill(); ctx.restore();
      /* the dunes and the first pines of the wood ahead */
      BG.hills(ctx, VW, VH, camX * 0.16, floorY - 62, '#e8d8ae', 34, 250);
      BG.trees(ctx, VW, VH, camX * 0.28, floorY - 18, '#7a5a3a', '#3f8a5c', '#5cb87c', 1.1, 210);
      ctx.save(); ctx.globalAlpha = .6;
      tileLayer(camX * 0.3, 40, VW, (x, i) => {
        const r = makeRng(i * 19 + 7);
        for (let k = -2; k <= 2; k++)
          line(ctx, x, floorY - 26, x + k * 7, floorY - 46 - r() * 12, '#b8bc72', 2);
      });
      ctx.restore();
    },
    pools: { hurdle: ['driftwood', 'rockWet', 'sandcastle', 'beachBall', 'deckchair'],
             over: ['umbrellaOpen'], tunnel: ['netArch'],
             ledge: ['boardwalkLedge'], step: ['rowboat', 'rockWet'],
             deco: ['shells', 'sandRipple', 'wetPaw'] }
  },
  {
    id: 'seatown', name: 'Gatvė', sec: 7, diff: 0.8, floor: 'asphalt',
    pal: { sky1: '#6fcfea', sky2: '#cdeef8', far: '#c9d8e0', mid: '#a8bcc9',
           floorTop: '#a9a29a', floorBody: '#55505c', accent: '#e2453c', cloud: '#ffffff', car: '#3f9cc4' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.clouds(ctx, VW, VH, camX * 0.05, t, pal.cloud, 40, 1.05);
      /* a little seaside town: wooden villas, then the forest above the roofs */
      ctx.save(); ctx.globalAlpha = .7;
      BG.hills(ctx, VW, VH, camX * 0.1, floorY - 190, '#3f7a5c', 46, 300);
      ctx.restore();
      BG.buildings(ctx, VW, VH, camX * 0.16, floorY - 30, ['#e8ddc8', '#d2bc8a', '#c9d8e0'], '#ffe7b0', 120, 200, 175, true);
      tileLayer(camX * 0.3, 230, VW, (x, i) => {
        const c = ['#4f8ca8', '#c96f5a', '#6b9c6a'][imod(i, 3)];
        fillRR(ctx, x, floorY - 172, 176, 172, 6, '#f2ece0');
        poly(ctx, [[x - 10, floorY - 172], [x + 88, floorY - 232], [x + 186, floorY - 172]], c);
        ctx.save(); ctx.globalAlpha = .55;
        for (let k = 0; k < 12; k++) line(ctx, x + 4, floorY - 160 + k * 13, x + 172, floorY - 160 + k * 13, '#dcd0ba', 2);
        ctx.restore();
        for (let k = 0; k < 3; k++) {
          fillRR(ctx, x + 16 + k * 54, floorY - 140, 38, 50, 4, '#8fc4d6');
          fillRR(ctx, x + 14 + k * 54, floorY - 146, 42, 8, 3, c);
          ctx.save(); ctx.globalAlpha = .5;
          fillRR(ctx, x + 20 + k * 54, floorY - 136, 12, 40, 2, '#eaf6fb'); ctx.restore();
        }
        /* the veranda across the front */
        fillRR(ctx, x + 6, floorY - 78, 164, 8, 3, c);
        for (let k = 0; k < 5; k++) line(ctx, x + 14 + k * 36, floorY - 74, x + 14 + k * 36, floorY - 4, '#f2ece0', 5);
      });
      tileLayer((camX * 0.44 + t * 62) % 100000, 380, VW, (x, i) => {
        const cols = ['#3f9cc4', '#e2453c', '#4a9d6e', '#f0a93a'];
        ctx.save(); ctx.globalAlpha = .95;
        PROPS.car(ctx, x, floorY - 54, 78, 40, t, { car: cols[imod(i, 4)] }); ctx.restore();
      });
    },
    pools: { hurdle: ['cone', 'bin', 'crate', 'hydrant', 'barrier', 'planterProm'],
             over: ['pipeS', 'awning'], tunnel: ['scaffold'],
             ledge: ['awning', 'car'], step: ['car', 'crate', 'benchProm'],
             deco: ['roadPaint', 'manholeD', 'drainD', 'leafLitter'] }
  },
  {
    id: 'forest', name: 'Miškas', sec: 22, diff: 0.88, floor: 'forestFloor', calm: 1,
    branch: 'foxcave',
    pal: { sky1: '#8fd6a8', sky2: '#d8f0d8', far: '#4f8a5c', trunk: '#6b4a2c',
           leaf: '#3f8a4c', leaf2: '#5cb864',
           floorTop: '#5f9c5c', floorBody: '#6b4f34', accent: '#e07a3a' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#a8dcb8'); g.addColorStop(0.5, '#d8f0d8'); g.addColorStop(1, '#e8f0c8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      BG2.forest(ctx, VW, VH, camX, floorY, t, pal, 1);
      /* midges hanging in the sunbeams */
      ctx.save(); ctx.globalAlpha = .5;
      for (let i = 0; i < 16; i++) {
        const r = makeRng(i * 37 + 5);
        circle(ctx, imod(i * 121 - camX * 0.5, VW + 40) - 20,
          floorY - 60 - r() * 200 + Math.sin(t * 1.6 + i) * 12, 1.6, '#fff6c4');
      }
      ctx.restore();
    },
    pools: { hurdle: ['fernF', 'mushroomF', 'logF', 'boulderF', 'rootF', 'stumpF'],
             over: ['branchF'], tunnel: ['thicketF'],
             ledge: ['logLedgeF'], step: ['stumpF', 'boulderF', 'logF'],
             deco: ['mossDeco', 'fernDeco', 'leafLitter', 'pebbles'] }
  },
  {
    id: 'deepwood', name: 'Tankus miškas', sec: 12, diff: 1.0, floor: 'forestFloor', last: true, calm: 1,
    pal: { far: '#2f5c3f', trunk: '#4f3a24', leaf: '#2f6b3f', leaf2: '#46905a',
           floorTop: '#4a7a48', floorBody: '#4f3a26', accent: '#ffd870' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#4f8a5c'); g.addColorStop(0.55, '#6b9c68'); g.addColorStop(1, '#9cb47a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      BG2.forest(ctx, VW, VH, camX, floorY, t, pal, 1.6);
      /* mist lying between the trunks */
      ctx.save(); ctx.globalAlpha = .22;
      tileLayer(camX * 0.2, 300, VW, (x, i) => {
        fillEll(ctx, x + 90, floorY - 40 - (i % 3) * 26, 150, 26, '#dff0e6');
      });
      ctx.restore();
      /* fireflies, so the darkest place is also the prettiest */
      for (let i = 0; i < 22; i++) {
        const r = makeRng(i * 53 + 9);
        const fx = imod(i * 137 - camX * 0.45, VW + 60) - 30;
        const fy = floorY - 40 - r() * 240 + Math.sin(t * 1.1 + i * 1.7) * 20;
        const on = .35 + Math.sin(t * 2.4 + i * 2.1) * .45;
        if (on <= 0) continue;
        ctx.save(); ctx.globalAlpha = on;
        circle(ctx, fx, fy, 2.4, '#fff6a8');
        ctx.globalAlpha = on * .25; circle(ctx, fx, fy, 9, '#ffe77a'); ctx.restore();
      }
    },
    pools: { hurdle: ['boulderF', 'logF', 'fernF', 'mushroomF', 'rootF', 'stumpF'],
             over: ['branchF'], tunnel: ['thicketF'],
             ledge: ['logLedgeF'], step: ['stumpF', 'logF', 'boulderF'],
             deco: ['mossDeco', 'fernDeco', 'leafLitter', 'grassTuft'] }
  }
];
const ZONE2_BY_ID = {};
ZONES2.forEach((z, i) => { z.index = i; ZONE2_BY_ID[z.id] = z; });

/* the blue veil, the bubbles and the drifting motes that sit OVER everything
   while she is under water — without it the sea floor reads as a dry room
   painted blue */
function WATER_FG(ctx, VW, VH, camX, floorY, t, strength, clipSurf) {
  ctx.save();
  if (clipSurf != null) {
    ctx.beginPath();
    ctx.moveTo(-10, VH + 10); ctx.lineTo(-10, clipSurf);
    for (let px = -10; px <= VW + 10; px += 14)
      ctx.lineTo(px, clipSurf + Math.sin((px + camX * 0.5) * 0.016 + t * 0.7) * 6);
    ctx.lineTo(VW + 10, VH + 10); ctx.closePath(); ctx.clip();
  }
  ctx.globalAlpha = strength;
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#4fbce0'); g.addColorStop(1, '#0f5a7a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  /* bubbles going up past the camera */
  ctx.globalAlpha = 1;
  for (let i = 0; i < 26; i++) {
    const r = makeRng(i * 71 + 13);
    const sp = 40 + r() * 90;
    const bx = imod(i * 149 - camX * 0.55, VW + 60) - 30 + Math.sin(t * 1.3 + i) * 7;
    const by = imod(VH + 40 - (t * sp + r() * 900), VH + 120) - 40;
    const rad = 1.6 + r() * 4;
    ctx.save(); ctx.globalAlpha = .28 + r() * .3;
    ctx.beginPath(); ctx.arc(bx, by, rad, 0, TAU);
    ctx.strokeStyle = '#eaf9ff'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.globalAlpha = .2; circle(ctx, bx - rad * .3, by - rad * .3, rad * .4, '#ffffff');
    ctx.restore();
  }
  ctx.restore();
}

/* =============================================================
   THE FOX CAVE — the one branch on level 2.

   Not a shortcut and not a trap: a way down under the forest that
   takes exactly as long as staying on the path, with easier things
   in the way and a pack of foxes who fall in behind her for the
   whole length of it.
============================================================= */
const BRANCHES2 = {
  foxcave: {
    id: 'foxcave', drop: -270, enterSec: 3.4, sec: 10.5, locked: 0, foxes: 4,
    shaft: 'caveMouth', sign: 'foxSign', exitSign: 'caveExit', roomGate: 'caveGate',
    rooms: [
      {
        id: 'denhall', name: 'Lapių urvas', share: 0.52, floor: 'caveFloor', diff: 0.3,
        pal: { floorTop: '#b5a795', floorBody: '#6b5c4c', accent: '#e07a3a',
               treadTop: '#b5a795', treadSide: '#6b5c4c', rail: '#7a5a3a', post: '#5c3f26' },
        bg(ctx, VW, VH, camX, floorY, t, pal) {
          const g = ctx.createLinearGradient(0, 0, 0, floorY);
          g.addColorStop(0, '#2f2620'); g.addColorStop(1, '#5c4f43');
          ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
          /* the far wall of the cave, layered rock */
          ctx.save(); ctx.globalAlpha = .9;
          BG.hills(ctx, VW, VH, camX * 0.14, floorY - 40, '#6b5c4e', 40, 260);
          ctx.globalAlpha = .85;
          BG.hills(ctx, VW, VH, camX * 0.26, floorY - 6, '#7a695a', 26, 170);
          ctx.restore();
          /* the roof coming down over her, with stalactites */
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(VW, 0); ctx.lineTo(VW, 74);
          for (let px = VW; px >= 0; px -= 16)
            ctx.lineTo(px, 74 + Math.sin((px + camX * 0.4) * 0.02) * 22);
          ctx.closePath(); ctx.fillStyle = '#3a302a'; ctx.fill();
          tileLayer(camX * 0.4, 58, VW, (x, i) => {
            const d = 18 + imod(i * 29, 34);
            poly(ctx, [[x - 8, 78], [x + 8, 78], [x, 78 + d]], '#544539');
          });
          /* what lights the place: seams of crystal in the rock, and clumps
             of glowing mushroom growing off the walls between them */
          tileLayer(camX * 0.3, 190, VW, (x, i) => {
            const r = makeRng(i * 43 + 7);
            const gy = floorY - 50 - r() * 140;
            const on = .5 + Math.sin(t * 1.4 + i) * .25;
            if (i % 2) {
              ctx.save(); ctx.globalAlpha = on * .34;
              fillEll(ctx, x, gy, 44, 30, '#7fd0f0'); ctx.restore();
              for (let k = -2; k <= 2; k++) {
                const hgt = 16 + imod(i * 17 + k * 29, 30), lean = k * 3.4;
                poly(ctx, [[x + k * 11 - 5, gy + 16], [x + k * 11 + lean - 1.5, gy + 16 - hgt],
                  [x + k * 11 + lean + 1.5, gy + 16 - hgt], [x + k * 11 + 5, gy + 16]], '#7fd0f0');
                ctx.save(); ctx.globalAlpha = .5;
                poly(ctx, [[x + k * 11 - 1.5, gy + 16], [x + k * 11 + lean, gy + 17 - hgt],
                  [x + k * 11 + 1.5, gy + 16]], '#f2fbff'); ctx.restore();
              }
            } else {
              ctx.save(); ctx.globalAlpha = on * .3;
              fillEll(ctx, x, gy + 4, 42, 26, '#a6e88f'); ctx.restore();
              for (let k = -1; k <= 1; k++) {
                const sc = 0.8 + imod(i * 13 + k * 7, 5) * 0.14;
                const mx = x + k * 20, my = gy + 14 - imod(i * 11 + k * 17, 14);
                fillRR(ctx, mx - 3 * sc, my, 6 * sc, gy + 18 - my, 3, '#d8e8c8');
                ctx.beginPath(); ctx.ellipse(mx, my + 2, 13 * sc, 9 * sc, 0, Math.PI, TAU);
                ctx.closePath(); ctx.fillStyle = k ? '#8fd67a' : '#a6e88f'; ctx.fill();
                ctx.save(); ctx.globalAlpha = .75;
                circle(ctx, mx - 4 * sc, my - 3 * sc, 2 * sc, '#eaffdc'); ctx.restore();
              }
            }
          });
          /* dens dug into the back wall, with cubs looking out of them */
          tileLayer(camX * 0.44, 420, VW, (x, i) => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, floorY); ctx.lineTo(x, floorY - 44);
            ctx.quadraticCurveTo(x + 34, floorY - 96, x + 68, floorY - 44);
            ctx.lineTo(x + 68, floorY); ctx.closePath();
            ctx.fillStyle = '#241d18'; ctx.fill();
            ctx.strokeStyle = '#7a695a'; ctx.lineWidth = 4; ctx.stroke();
            ctx.restore();
            const bob = Math.sin(t * 1.6 + i) * 2;
            ctx.save(); ctx.translate(x + 34, floorY - 16 + bob);
            fillEll(ctx, 0, 0, 15, 12, '#e07a3a');
            poly(ctx, [[-11, -7], [-6, -19], [-2, -6]], '#e07a3a');
            poly(ctx, [[11, -7], [6, -19], [2, -6]], '#e07a3a');
            fillEll(ctx, 0, 5, 10, 7, '#f6e2cf');
            circle(ctx, -5, -2, 2, '#2b2018'); circle(ctx, 5, -2, 2, '#2b2018');
            circle(ctx, 0, 3, 2.2, '#2b2018');
            ctx.restore();
          });
          /* embers of light drifting up from the floor */
          ctx.save(); ctx.globalAlpha = .5;
          for (let i = 0; i < 14; i++) {
            const r = makeRng(i * 61 + 3);
            circle(ctx, imod(i * 113 - camX * 0.6, VW + 40) - 20,
              floorY - imod(t * (16 + r() * 24) + r() * 300, 300), 1.8, '#ffc48a');
          }
          ctx.restore();
        },
        pools: { hurdle: ['caveRock', 'stalagmite', 'mushroomC', 'crystalC'],
                 over: ['rootHang'], tunnel: ['caveArch'],
                 ledge: ['caveLedge'], step: ['caveRock', 'caveLedge'],
                 deco: ['pebblesC', 'mossDeco'] }
      },
      {
        id: 'crystalhall', name: 'Kristalų salė', share: 0.48, floor: 'caveFloor', diff: 0.34,
        pal: { floorTop: '#bdb6c8', floorBody: '#5a5268', accent: '#8fd6ff',
               treadTop: '#bdb6c8', treadSide: '#5a5266' },
        bg(ctx, VW, VH, camX, floorY, t, pal) {
          const g = ctx.createLinearGradient(0, 0, 0, floorY);
          g.addColorStop(0, '#251f33'); g.addColorStop(1, '#4d4463');
          ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
          /* an underground pool, perfectly still, with the roof in it */
          const py = floorY - 34;
          ctx.save(); ctx.globalAlpha = .55;
          const wg = ctx.createLinearGradient(0, py, 0, floorY + 20);
          wg.addColorStop(0, '#2f7f9c'); wg.addColorStop(1, '#123f56');
          ctx.fillStyle = wg; ctx.fillRect(0, py, VW, 60);
          ctx.globalAlpha = .3;
          for (let row = 0; row < 3; row++) {
            ctx.beginPath();
            for (let px = 0; px <= VW; px += 12) {
              const yy = py + 8 + row * 9 + Math.sin((px + camX * 0.4) * 0.03 + t + row) * 2;
              px ? ctx.lineTo(px, yy) : ctx.moveTo(px, yy);
            }
            ctx.strokeStyle = '#bfeaf6'; ctx.lineWidth = 2; ctx.stroke();
          }
          ctx.restore();
          ctx.save(); ctx.globalAlpha = .85;
          BG.hills(ctx, VW, VH, camX * 0.2, floorY - 30, '#5a5070', 40, 230);
          ctx.restore();
          /* a whole wall of crystal, lit from inside — set back and dimmed a
             little, so the things she actually has to jump still read first */
          ctx.save(); ctx.globalAlpha = .78;
          tileLayer(camX * 0.32, 150, VW, (x, i) => {
            const r = makeRng(i * 71 + 5);
            const base = floorY - 20 - r() * 40, h = 80 + r() * 130;
            const on = .4 + Math.sin(t * 1.2 + i * 0.9) * .3;
            const col = i % 3 ? '#6fc9ea' : '#b48bff';
            ctx.save(); ctx.globalAlpha = on * .26;
            circle(ctx, x, base - h * 0.55, h * 0.5, col); ctx.restore();
            poly(ctx, [[x - 15, base], [x - 9, base - h * 0.82], [x, base - h],
              [x + 9, base - h * 0.82], [x + 15, base]], col);
            ctx.save(); ctx.globalAlpha = .45;
            poly(ctx, [[x - 4, base], [x, base - h * 0.9], [x + 5, base]], '#eaf9ff'); ctx.restore();
          });
          ctx.restore();
          /* the roof, lower here, with more stalactites */
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(VW, 0); ctx.lineTo(VW, 58);
          for (let px = VW; px >= 0; px -= 16)
            ctx.lineTo(px, 58 + Math.sin((px + camX * 0.4) * 0.024 + 1.4) * 26);
          ctx.closePath(); ctx.fillStyle = '#332b47'; ctx.fill();
          tileLayer(camX * 0.4, 48, VW, (x, i) => {
            const d = 22 + imod(i * 37, 40);
            poly(ctx, [[x - 7, 62], [x + 7, 62], [x, 62 + d]], '#4a4060');
            if (i % 3 === 0) {
              ctx.save(); ctx.globalAlpha = .5;
              circle(ctx, x, 62 + d + 4, 2, '#8fd6ff'); ctx.restore();
            }
          });
        },
        pools: { hurdle: ['crystalC', 'stalagmite', 'caveRock', 'mushroomC'],
                 over: ['rootHang'], tunnel: ['caveArch'],
                 ledge: ['caveLedge'], step: ['caveRock', 'caveLedge'],
                 deco: ['pebblesC', 'mossDeco'] }
      }
    ]
  }
};
Object.keys(BRANCHES2).forEach(k => {
  BRANCHES2[k].rooms.forEach((r, i) => { r.index = i; r.branch = BRANCHES2[k]; });
});
