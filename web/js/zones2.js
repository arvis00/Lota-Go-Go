'use strict';
/* ---------------------------------------------------------------
   zones2.js — level 2: "Nuo viešbučio iki miško".

   Fifteen places in a row: a grand hotel from the inside out, the
   promenade and the beach, the pier she runs the length of, a dive
   off the end of it, the sea floor, the climb back out onto the
   shore, a short street, and the forest the finish stands in.
   One branch: the fox cave under the forest.
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

  /* What drives along the seaside street. Four of them, and the wheels are
     on the road: a car floating clear of the tarmac was the single thing
     that made this street read as a flooded one. */
  beachTraffic(ctx, x, roadY, t, i) {
    const k = imod(i, 4);
    const body = ['#3f9cc4', '#e2453c', '#4a9d6e', '#f0a93a'][k];
    const board = (bx, by, w0, col, stripe) => {
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + w0 * 0.5, by - 11, bx + w0, by);
      ctx.quadraticCurveTo(bx + w0 * 0.5, by + 11, bx, by);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = 'rgba(40,30,20,.4)'; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.save(); ctx.globalAlpha = .55;
      line(ctx, bx + w0 * 0.12, by, bx + w0 * 0.88, by, stripe, 2); ctx.restore();
    };
    const wheels = (x0, x1, r) => { wheel(ctx, x0, roadY - r, r, '#2c2a33'); wheel(ctx, x1, roadY - r, r, '#2c2a33'); };
    if (k === 0) {
      /* an estate car with two boards strapped to the roof */
      fillRR(ctx, x + 14, roadY - 62, 84, 30, 8, shade(body, .12));
      fillRR(ctx, x, roadY - 40, 116, 28, 10, body);
      fillRR(ctx, x + 22, roadY - 58, 30, 22, 4, '#a9dcf0');
      fillRR(ctx, x + 58, roadY - 58, 34, 22, 4, '#a9dcf0');
      board(x + 12, roadY - 70, 92, '#f6e2cf', '#e07a3a');
      board(x + 20, roadY - 78, 84, '#ffd870', '#c9445a');
      circle(ctx, x + 114, roadY - 32, 4, '#ffe07a');
      wheels(x + 28, x + 92, 10);
    } else if (k === 1) {
      /* a pickup with a board sticking out of the back */
      fillRR(ctx, x + 6, roadY - 40, 116, 28, 8, body);
      fillRR(ctx, x + 14, roadY - 62, 46, 26, 6, shade(body, .12));
      fillRR(ctx, x + 20, roadY - 58, 34, 20, 4, '#a9dcf0');
      fillRR(ctx, x + 64, roadY - 52, 58, 16, 3, shade(body, -.16));
      board(x + 46, roadY - 58, 96, '#f2ece0', '#3f9cc4');
      wheels(x + 30, x + 100, 10);
    } else if (k === 2) {
      /* a camper van with a ladder up the back */
      fillRR(ctx, x, roadY - 74, 128, 62, 8, body);
      fillRR(ctx, x + 2, roadY - 44, 124, 10, 3, '#f2ece0');
      fillRR(ctx, x + 12, roadY - 68, 40, 24, 4, '#a9dcf0');
      fillRR(ctx, x + 60, roadY - 68, 30, 24, 4, '#a9dcf0');
      ctx.save(); ctx.globalAlpha = .8;
      for (let q = 0; q < 4; q++) line(ctx, x + 2, roadY - 62 + q * 5, x + 4, roadY - 62 + q * 5, '#fff', 2);
      ctx.restore();
      line(ctx, x + 2, roadY - 70, x + 2, roadY - 20, '#c9c2b4', 3);
      for (let q = 0; q < 4; q++) line(ctx, x - 2, roadY - 64 + q * 12, x + 6, roadY - 64 + q * 12, '#c9c2b4', 2.4);
      board(x + 18, roadY - 82, 96, '#a6e88f', '#3f7a5c');
      wheels(x + 26, x + 104, 11);
    } else {
      /* a car towing a little boat on a trailer */
      fillRR(ctx, x + 10, roadY - 58, 66, 26, 8, shade(body, .12));
      fillRR(ctx, x, roadY - 38, 92, 26, 10, body);
      fillRR(ctx, x + 18, roadY - 54, 26, 18, 4, '#a9dcf0');
      fillRR(ctx, x + 48, roadY - 54, 24, 18, 4, '#a9dcf0');
      wheels(x + 22, x + 72, 10);
      line(ctx, x + 92, roadY - 22, x + 112, roadY - 22, '#5d6878', 4);
      poly(ctx, [[x + 112, roadY - 52], [x + 186, roadY - 52], [x + 172, roadY - 22], [x + 124, roadY - 22]], '#f2ece0');
      fillRR(ctx, x + 116, roadY - 56, 74, 7, 3, '#e2453c');
      line(ctx, x + 148, roadY - 56, x + 148, roadY - 108, '#c9bda8', 3);
      wheel(ctx, x + 148, roadY - 9, 9, '#2c2a33');
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
  /* the hold: planking with sand drifted over it, and the ship's frames
     showing through where the sand has been scoured away */
  holdFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 12, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = Math.floor((x + camX) / 120) * 120 - camX; px < x + w; px += 120)
      if (px > x) fillRR(ctx, px, y + 2, 16, h, 2, shade(pal.floorBody, -.35));
    ctx.globalAlpha = .3;
    for (let i = 0; i < 3; i++) line(ctx, x, y + 18 + i * 16, x + w, y + 18 + i * 16, shade(pal.floorBody, -.3), 2);
    ctx.restore();
    /* the sand that has come in through the hole, in drifts */
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = Math.floor((x + camX) / 96) * 96 - camX; px < x + w; px += 96) {
      if (px < x - 96) continue;
      const k = imod(Math.round((px + camX) / 96), 4);
      ctx.beginPath();
      ctx.moveTo(px - 20, y + 12);
      ctx.quadraticCurveTo(px + 24, y - 2 - k * 3, px + 70, y + 12);
      ctx.lineTo(px + 70, y + 24); ctx.lineTo(px - 20, y + 24); ctx.closePath();
      ctx.fillStyle = '#cfc49c'; ctx.fill();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 58) * 58 - camX; px < x + w; px += 58)
      if (px > x) leafy(ctx, px, y + 6, 12, 6, '#3f7a5c', '#5aa87a', Math.round((px + camX) / 58));
    ctx.restore();
  },
  /* the deck up top: planks with gaps blown in them and weed in the seams */
  deckWreck(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 14, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = Math.floor((x + camX) / 34) * 34 - camX; px < x + w; px += 34)
      if (px > x) line(ctx, px, y, px, y + 15, shade(pal.floorTop, -.34), 2.4);
    ctx.restore();
    /* every so often a plank is simply gone, and the sea shows underneath */
    ctx.save(); ctx.globalAlpha = .8;
    for (let px = Math.floor((x + camX) / 210) * 210 - camX; px < x + w; px += 210) {
      const a = Math.max(px + 40, x), b = Math.min(px + 40 + 34, x + w);
      if (b > a) { ctx.fillStyle = '#123a4e'; ctx.fillRect(a, y + 2, b - a, 12); }
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = Math.floor((x + camX) / 62) * 62 - camX; px < x + w; px += 62)
      if (px > x) leafy(ctx, px, y + 4, 13, 7, '#3f7a5c', '#5aa87a', Math.round((px + camX) / 62));
    ctx.globalAlpha = .3;
    for (let i = 0; i < 3; i++) line(ctx, x, y + 24 + i * 18, x + w, y + 24 + i * 18, shade(pal.floorBody, -.3), 2);
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
      /* the balcony window, with the sea already visible through it. Every
         other bay of the suite is something else entirely — a fireplace, a
         four-poster alcove, a writing desk — so the room does not read as one
         window printed over and over. */
      tileLayer(camX * 0.5, 520, VW, (x, wi) => {
       if (imod(wi, 3) === 1) {
        /* a marble fireplace with a gilt mirror over it */
        fillRR(ctx, x + 20, floorY - 168, 170, 168, 5, '#e6d9c0');
        fillRR(ctx, x + 10, floorY - 182, 190, 18, 5, '#d8cab0');
        ctx.beginPath();
        ctx.moveTo(x + 56, floorY); ctx.lineTo(x + 56, floorY - 96);
        ctx.quadraticCurveTo(x + 105, floorY - 138, x + 154, floorY - 96);
        ctx.lineTo(x + 154, floorY); ctx.closePath();
        ctx.fillStyle = '#2b2119'; ctx.fill();
        ctx.save(); ctx.globalAlpha = .5 + Math.sin(t * 3) * .12;
        poly(ctx, [[x + 88, floorY - 4], [x + 105, floorY - 66], [x + 122, floorY - 4]], '#f0a93a');
        poly(ctx, [[x + 96, floorY - 4], [x + 105, floorY - 44], [x + 114, floorY - 4]], '#ffe7a8');
        ctx.restore();
        fillRR(ctx, x + 46, floorY - 300, 118, 112, 6, '#d8b25e');
        ctx.save(); ctx.globalAlpha = .55;
        fillRR(ctx, x + 54, floorY - 292, 102, 96, 4, '#efe6d4');
        fillRR(ctx, x + 64, floorY - 284, 26, 80, 3, '#ffffff'); ctx.restore();
        [x + 32, x + 178].forEach(px => {
          fillRR(ctx, px - 8, floorY - 210, 16, 30, 3, '#d8b25e');
          circle(ctx, px, floorY - 218, 7, '#fff6d8');
        });
        return;
       }
       if (imod(wi, 3) === 2) {
        /* the alcove with the four-poster in it */
        fillRR(ctx, x - 10, floorY - 300, 230, 300, 6, shade(pal.far, -.1));
        fillRR(ctx, x + 4, floorY - 128, 200, 128, 6, '#8a3f5c');
        fillRR(ctx, x + 4, floorY - 138, 200, 18, 5, '#f6efe2');
        fillRR(ctx, x + 12, floorY - 168, 60, 34, 8, '#f6efe2');
        fillRR(ctx, x + 78, floorY - 164, 56, 30, 8, '#f6efe2');
        [x + 6, x + 198].forEach(px => fillRR(ctx, px - 5, floorY - 290, 11, 290, 4, '#5f4429'));
        fillRR(ctx, x - 4, floorY - 300, 216, 16, 5, '#5f4429');
        ctx.save(); ctx.globalAlpha = .9;
        swag(ctx, x - 2, floorY - 288, 212, 54, '#8a3f5c', '#6f2f47', 5);
        ctx.restore();
        return;
       }
       (function (x) {
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
       })(x);
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
      /* What stands in a hotel lobby: reception, then the sweep of stair,
         then a seating group, then the lifts and a grand piano. A hotel has
         one reception desk, not one every screen. */
      tileLayer(camX * 0.42, 660, VW, (x, i) => {
        const k = imod(i, 3);
        if (k === 0) {
          for (let q = 0; q < 8; q++)
            fillRR(ctx, x + 330 + q * 22, floorY - 30 - q * 20, 130 - q * 4, 18, 3, '#c9a878');
          ctx.save(); ctx.globalAlpha = .7;
          line(ctx, x + 336, floorY - 62, x + 508, floorY - 214, '#d8b25e', 6); ctx.restore();
          fillRR(ctx, x, floorY - 150, 250, 150, 6, '#7a5434');
          fillRR(ctx, x - 8, floorY - 158, 266, 16, 5, '#d8b25e');
          ctx.save(); ctx.globalAlpha = .5;
          for (let q = 0; q < 5; q++) fillRR(ctx, x + 14 + q * 46, floorY - 138, 34, 120, 3, '#8a5f3a');
          ctx.restore();
          ctx.fillStyle = '#8a5f3a'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('REGISTRATŪRA', x + 125, floorY - 172);
        } else if (k === 1) {
          /* a seating group round a low table, with a palm behind it */
          fillRR(ctx, x + 40, floorY - 96, 130, 96, 12, '#8a3f5c');
          fillRR(ctx, x + 52, floorY - 122, 106, 40, 10, '#9c4f6c');
          fillRR(ctx, x + 196, floorY - 96, 130, 96, 12, '#8a3f5c');
          fillRR(ctx, x + 208, floorY - 122, 106, 40, 10, '#9c4f6c');
          fillRR(ctx, x + 158, floorY - 52, 60, 10, 4, '#d8b25e');
          [x + 166, x + 210].forEach(px => line(ctx, px, floorY - 44, px, floorY - 4, '#7a5434', 6));
          fillRR(ctx, x + 380, floorY - 74, 66, 74, 8, '#c9a878');
          for (let q = 0; q < 7; q++) {
            const a = -Math.PI * 0.5 + (q - 3) * 0.42;
            ctx.beginPath(); ctx.moveTo(x + 413, floorY - 78);
            ctx.quadraticCurveTo(x + 413 + Math.cos(a) * 44, floorY - 96 + Math.sin(a) * 40,
              x + 413 + Math.cos(a) * 76, floorY - 74 + Math.sin(a) * 70);
            ctx.strokeStyle = q % 2 ? '#3f9c5c' : '#4caf6d'; ctx.lineWidth = 8; ctx.stroke();
          }
        } else {
          /* the lifts, and a grand piano nobody is playing */
          fillRR(ctx, x + 20, floorY - 250, 190, 250, 6, '#d8cab0');
          [x + 32, x + 122].forEach(px => {
            fillRR(ctx, px, floorY - 236, 76, 236, 4, '#c9a878');
            fillRR(ctx, px + 36, floorY - 236, 4, 236, 2, '#8a6a45');
            fillRR(ctx, px + 10, floorY - 258, 56, 16, 4, '#d8b25e');
          });
          fillRR(ctx, x + 300, floorY - 84, 190, 46, 10, '#2b2119');
          ctx.beginPath();
          ctx.moveTo(x + 316, floorY - 84);
          ctx.quadraticCurveTo(x + 420, floorY - 132, x + 486, floorY - 88);
          ctx.lineTo(x + 486, floorY - 84); ctx.closePath();
          ctx.fillStyle = '#3a2c22'; ctx.fill();
          [x + 316, x + 470].forEach(px => line(ctx, px, floorY - 40, px, floorY - 4, '#2b2119', 7));
          ctx.save(); ctx.globalAlpha = .9;
          fillRR(ctx, x + 306, floorY - 46, 176, 8, 2, '#f6efe2');
          for (let q = 0; q < 16; q++) fillRR(ctx, x + 312 + q * 11, floorY - 46, 4, 5, 1, '#2b2119');
          ctx.restore();
        }
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
        const k = imod(i, 3);
        const h = k === 1 ? 260 : 330;
        fillRR(ctx, x, floorY - h, 260, h, 8, '#f2ece0');
        if (k === 1) {
          /* a lower wing, with an arcade along the front of it */
          poly(ctx, [[x - 10, floorY - h], [x + 130, floorY - h - 44], [x + 270, floorY - h]], '#c96f5a');
          ctx.save(); ctx.globalAlpha = .8;
          for (let c = 0; c < 4; c++) {
            ctx.beginPath();
            ctx.moveTo(x + 16 + c * 60, floorY - 30); ctx.lineTo(x + 16 + c * 60, floorY - 100);
            ctx.quadraticCurveTo(x + 38 + c * 60, floorY - 146, x + 60 + c * 60, floorY - 100);
            ctx.lineTo(x + 60 + c * 60, floorY - 30); ctx.closePath();
            ctx.fillStyle = '#8fc4d6'; ctx.fill();
          }
          for (let c = 0; c < 8; c++)
            fillRR(ctx, x + 20 + c * 30, floorY - 224, 22, 44, 4, c % 2 ? '#8fc4d6' : '#d8cab0');
          ctx.restore();
          return;
        }
        ctx.save(); ctx.globalAlpha = .8;
        for (let r = 0; r < 3; r++) {
          fillRR(ctx, x + 6, floorY - 306 + r * 84, 248, 10, 4, '#d8b25e');
          for (let c = 0; c < 4; c++) {
            fillRR(ctx, x + 16 + c * 60, floorY - 366 + r * 84 + 62, 44, 52, 5, '#8fc4d6');
            ctx.save(); ctx.globalAlpha = .5;
            fillRR(ctx, x + 20 + c * 60, floorY - 366 + r * 84 + 66, 16, 44, 3, '#eaf6fb'); ctx.restore();
            /* the balcony rail in front of every window, and a parasol or a
               towel out on some of them */
            for (let b = 0; b < 5; b++) line(ctx, x + 18 + c * 60 + b * 10, floorY - 306 + r * 84,
              x + 18 + c * 60 + b * 10, floorY - 290 + r * 84, '#d8b25e', 2);
            if (imod(i * 5 + r * 3 + c, 7) === 0)
              fillRR(ctx, x + 22 + c * 60, floorY - 306 + r * 84, 30, 22, 3,
                ['#e2453c', '#3f9cc4', '#ffd870'][imod(i + c, 3)]);
          }
        }
        if (k === 2) {
          /* the roof terrace, with its own parasols */
          fillRR(ctx, x - 6, floorY - 344, 272, 16, 5, '#efe6d4');
          for (let c = 0; c < 3; c++) {
            line(ctx, x + 50 + c * 80, floorY - 344, x + 50 + c * 80, floorY - 396, '#c9bda8', 4);
            poly(ctx, [[x + 14 + c * 80, floorY - 392], [x + 86 + c * 80, floorY - 392],
                       [x + 50 + c * 80, floorY - 420]], ['#e2453c', '#3f9cc4', '#ffd870'][c]);
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
      tileLayer(camX * 0.66, 560, VW, (x, i) => {
        const k = imod(i, 3);
        if (k === 0) {
          [x, x + 26].forEach(lx => line(ctx, lx, pb + 6, lx, py - 34, '#dfe6ec', 5));
          for (let q = 0; q < 3; q++) line(ctx, x, py - 22 + q * 16, x + 26, py - 22 + q * 16, '#dfe6ec', 4);
          ctx.beginPath(); ctx.arc(x + 13, py - 34, 13, Math.PI, 0);
          ctx.strokeStyle = '#dfe6ec'; ctx.lineWidth = 5; ctx.stroke();
        } else if (k === 1) {
          /* a diving board out over the deep end */
          fillRR(ctx, x - 10, py - 62, 96, 10, 4, '#f2ece0');
          line(ctx, x + 62, py - 54, x + 62, py - 12, '#c9bda8', 7);
          line(ctx, x + 76, py - 54, x + 76, py - 12, '#c9bda8', 7);
          for (let q = 0; q < 3; q++) line(ctx, x + 62, py - 60 - q * 14, x + 84, py - 60 - q * 14, '#dfe6ec', 4);
          line(ctx, x + 84, py - 100, x + 84, py - 56, '#dfe6ec', 4);
        } else {
          /* the lifeguard's chair, with a ring hanging off it */
          [x + 6, x + 46].forEach(px => line(ctx, px, py - 6, px, py - 96, '#c9a878', 6));
          fillRR(ctx, x - 4, py - 104, 64, 12, 4, '#e2453c');
          fillRR(ctx, x - 4, py - 148, 64, 44, 6, '#efe6d4');
          ctx.beginPath(); ctx.arc(x + 74, py - 62, 14, 0, TAU);
          ctx.strokeStyle = '#f2ece0'; ctx.lineWidth = 7; ctx.stroke();
          ctx.beginPath(); ctx.arc(x + 74, py - 62, 14, 0, TAU); ctx.lineWidth = 7;
          ctx.setLineDash([10, 10]); ctx.strokeStyle = '#e2453c'; ctx.stroke(); ctx.setLineDash([]);
        }
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
    dive: 1,
    pal: { sky1: '#6fcfea', sky2: '#d8f0f8', far: '#a8c9d6', mid: '#7fa8bc',
           floorTop: '#d8b98a', floorBody: '#9a7550', accent: '#3f4a5c', cloud: '#ffffff' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.sun(ctx, VW, VH, VW * 0.2, 62, 30, '#fff6d8');
      BG.clouds(ctx, VW, VH, camX * 0.035, t, pal.cloud, 34, 1.2);
      /* the shore falling away behind her */
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
      /* what is out on the water: a yacht, then a fishing boat, then a
         channel buoy, then a windsurfer — it is that kind of day, but it is
         not the same boat over and over */
      tileLayer(camX * 0.12, 900, VW, (x, i) => {
        const by = floorY - 168 + Math.sin(t * 0.8 + i) * 3;
        const k = imod(i, 4);
        if (k === 0) {
          poly(ctx, [[x, by], [x + 74, by], [x + 62, by + 15], [x + 10, by + 15]], '#f2ece0');
          line(ctx, x + 40, by, x + 40, by - 74, '#c9bda8', 3);
          poly(ctx, [[x + 42, by - 72], [x + 76, by - 4], [x + 42, by - 4]], '#ffffff');
          poly(ctx, [[x + 37, by - 68], [x + 12, by - 4], [x + 37, by - 4]], '#eaf4fb');
        } else if (k === 1) {
          /* a fishing boat, wheelhouse aft, gulls over the stern */
          poly(ctx, [[x - 4, by + 2], [x + 88, by + 2], [x + 74, by + 20], [x + 8, by + 20]], '#3f7a8c');
          fillRR(ctx, x + 6, by - 6, 82, 8, 3, '#f2ece0');
          fillRR(ctx, x + 46, by - 34, 34, 30, 4, '#f2ece0');
          fillRR(ctx, x + 52, by - 28, 22, 14, 2, '#8fc4d6');
          line(ctx, x + 22, by - 6, x + 22, by - 62, '#c9bda8', 3);
          line(ctx, x + 22, by - 58, x + 62, by - 30, '#c9bda8', 2);
          ctx.save(); ctx.globalAlpha = .5;
          for (let q = 0; q < 3; q++) {
            const gx = x + 96 + q * 16, gy = by - 46 - q * 12 + Math.sin(t * 2 + q) * 3;
            ctx.beginPath();
            ctx.moveTo(gx - 7, gy + 3); ctx.quadraticCurveTo(gx - 3, gy - 3, gx, gy);
            ctx.quadraticCurveTo(gx + 3, gy - 3, gx + 7, gy + 3);
            ctx.strokeStyle = '#5f7080'; ctx.lineWidth = 1.6; ctx.stroke();
          }
          ctx.restore();
        } else if (k === 2) {
          /* a channel buoy, rocking */
          ctx.save(); ctx.translate(x + 40, by + 14); ctx.rotate(Math.sin(t * 1.1 + i) * 0.16);
          poly(ctx, [[-16, 6], [16, 6], [11, -30], [-11, -30]], '#e2453c');
          fillRR(ctx, -13, -6, 26, 8, 2, '#f2ece0');
          line(ctx, 0, -30, 0, -54, '#4a5468', 3);
          circle(ctx, 0, -58, 6, '#ffd870');
          ctx.restore();
        } else {
          /* a windsurfer leaning off the sail */
          ctx.save(); ctx.translate(x + 40, by + 16);
          fillEll(ctx, 0, 4, 34, 5, '#f2ece0');
          ctx.beginPath();
          ctx.moveTo(2, 2); ctx.quadraticCurveTo(30, -30, 20, -62);
          ctx.quadraticCurveTo(6, -40, 2, 2); ctx.closePath();
          ctx.fillStyle = '#ffd870'; ctx.fill();
          ctx.save(); ctx.globalAlpha = .5;
          ctx.beginPath();
          ctx.moveTo(3, -6); ctx.quadraticCurveTo(22, -30, 19, -56);
          ctx.strokeStyle = '#e07a3a'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
          line(ctx, -6, 2, -12, -22, '#3f4a5c', 4);
          circle(ctx, -13, -27, 5, '#3f4a5c');
          ctx.restore();
        }
      });
    },
    pools: { hurdle: ['pierCrate', 'bollard', 'lifering', 'fishBox', 'poolFloat'],
             over: ['pierArch'], tunnel: ['netArch'],
             ledge: ['pierBench'], step: ['pierBench', 'pierCrate'],
             deco: ['plankGrain', 'ropeCoil', 'wetPaw'] }
  },
  {
    id: 'seabed', name: 'Jūros dugnas', sec: 9, diff: 0.62, floor: 'seabed', water: 1, calm: 1,
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
    /* she comes up on the wreck from outside and runs in through a hole
       torn in her side */
    id: 'wreck', name: 'Nuskendęs laivas', sec: 8, diff: 0.7, floor: 'seabed',
    water: 1, calm: 1, exit: 'hullHole',
    pal: { floorTop: '#cfc49c', floorBody: '#8a7f5c', accent: '#d8b25e',
           treadTop: '#cfc49c', treadSide: '#8a7f5c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG2.underwater(ctx, VW, VH, camX, floorY, t, '#2f7fa8', '#0a3450', -320);
      /* the ship herself, lying over on the bottom. Each length of her is a
         different length of a wrecked ship: bow, midships with the funnel
         gone, the broken mast, then the stern with her name still on it. */
      tileLayer(camX * 0.22, 980, VW, (x, i) => {
        const k = imod(i, 3);
        ctx.save(); ctx.globalAlpha = .82;
        ctx.translate(x, floorY - 30); ctx.rotate(-0.1 + k * 0.03);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(60, -150, 250, -170);
        ctx.lineTo(560, -150);
        ctx.quadraticCurveTo(600, -60, 520, 6);
        ctx.lineTo(80, 12); ctx.closePath();
        ctx.fillStyle = '#2f3f4a'; ctx.fill();
        ctx.save(); ctx.globalAlpha = .4;
        for (let q = 0; q < 9; q++) line(ctx, 70 + q * 54, -150, 60 + q * 54, 8, '#1c2a33', 3);
        for (let q = 1; q < 4; q++) line(ctx, 40, -40 - q * 42, 545, -56 - q * 42, '#1c2a33', 3);
        ctx.restore();
        for (let q = 0; q < 6; q++) circle(ctx, 140 + q * 66, -96, 12, '#12222c');
        if (k === 0) {
          /* the broken mast, and rigging still hanging off it */
          ctx.save(); ctx.rotate(-0.34);
          fillRR(ctx, 250, -420, 16, 270, 5, '#3f3126');
          ctx.globalAlpha = .5;
          line(ctx, 258, -412, 130, -190, '#5f5548', 3);
          line(ctx, 258, -412, 390, -196, '#5f5548', 3);
          ctx.restore();
        } else if (k === 1) {
          /* the stump of her funnel, and a davit with no boat on it */
          fillRR(ctx, 300, -258, 74, 96, 8, '#3a4a55');
          fillRR(ctx, 296, -264, 82, 14, 5, '#28353e');
          ctx.beginPath(); ctx.moveTo(470, -160);
          ctx.quadraticCurveTo(470, -240, 540, -232);
          ctx.strokeStyle = '#3f4a5c'; ctx.lineWidth = 9; ctx.stroke();
        } else {
          /* her name, and the anchor still in its hawse */
          ctx.save(); ctx.globalAlpha = .55;
          ctx.fillStyle = '#c9bda8'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('AUDRA', 300, -84); ctx.restore();
          circle(ctx, 96, -108, 15, '#1c2a33');
          ctx.save(); ctx.globalAlpha = .7;
          line(ctx, 96, -108, 96, -20, '#5d6878', 7); ctx.restore();
        }
        ctx.restore();
      });
      BG2.fish(ctx, VW, VH, camX, floorY, t, 12, '#8fd6ff', '#f6b93a');
      ctx.save(); ctx.globalAlpha = .5;
      tileLayer(camX * 0.34, 210, VW, (x, i) => {
        const r = makeRng(i * 41 + 3);
        for (let q = 0; q < 4; q++)
          fillEll(ctx, x + q * 16, floorY - 12 - r() * 26, 15, 8, q % 2 ? '#3f7a5c' : '#4f9c6c', Math.sin(t + q) * .3);
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
    /* ---- inside her ----
       The hold, in the dark, with the cargo that never came out of it. No
       branch and no choice: the only way on is the companionway at the far
       end, and stairs are run, not jumped. */
    id: 'hold', name: 'Laivo triumas', sec: 11, diff: 0.72, floor: 'holdFloor',
    water: 1, calm: 1,
    pal: { floorTop: '#8a7452', floorBody: '#4f4132', accent: '#f6c93a',
           treadTop: '#7a5f45', treadSide: '#4a3a2c', rail: '#6b5a4a', post: '#5a4a3c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#0b161d'); g.addColorStop(1, '#26333a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      /* the far side of the hold, and the bilge water lying along it */
      fillRR(ctx, 0, floorY - 250, VW, 250, 0, '#2b3a42');
      ctx.save(); ctx.globalAlpha = .35;
      for (let px = -imod(camX * 0.2, 74); px < VW; px += 74)
        line(ctx, px, floorY - 250, px, floorY, '#1d282e', 3);
      ctx.restore();
      /* her frames, curving up over the top of the screen. Every bay is a
         different bay: what is stacked in it, whether it has a porthole and
         whether anything is still hanging from the deckhead all change. */
      tileLayer(camX * 0.34, 300, VW, (x, i) => {
        const k = imod(i, 5);
        ctx.save(); ctx.globalAlpha = .95;
        [0, 214].forEach((o0, side) => {
          const lean = side ? 26 : -26;
          ctx.beginPath();
          ctx.moveTo(x + o0 - 10, floorY);
          ctx.quadraticCurveTo(x + o0 - 14, floorY - 190, x + o0 + lean - 10, 0);
          ctx.lineTo(x + o0 + lean + 10, 0);
          ctx.quadraticCurveTo(x + o0 + 6, floorY - 190, x + o0 + 10, floorY);
          ctx.closePath();
          /* the frames are in shadow, not lit: paler than the planking they
             stand against and they read as shafts of light, not as ribs */
          ctx.fillStyle = '#1c272d'; ctx.fill();
          ctx.globalAlpha = .35;
          ctx.beginPath();
          ctx.moveTo(x + o0 - 6, floorY);
          ctx.quadraticCurveTo(x + o0 - 10, floorY - 190, x + o0 + lean - 6, 0);
          ctx.strokeStyle = '#4f636e'; ctx.lineWidth = 2.4; ctx.stroke();
          ctx.globalAlpha = .95;
        });
        ctx.restore();
        /* the deckhead over her, with a beam every bay */
        fillRR(ctx, x - 30, 0, 300, 34, 0, '#1a252b');
        fillRR(ctx, x + 40, 30, 150, 15, 3, '#3a4a53');
        if (k === 0 || k === 3) {
          /* a porthole with the sea outside it, and the light it lets in */
          const py = floorY - 196;
          circle(ctx, x + 120, py, 30, '#5d6878');
          circle(ctx, x + 120, py, 23, '#2f8fb8');
          ctx.save(); ctx.globalAlpha = .5;
          circle(ctx, x + 112, py - 8, 8, '#bfeaf6'); ctx.restore();
          for (let q = 0; q < 6; q++) circle(ctx, x + 120 + Math.cos(q) * 28, py + Math.sin(q) * 28, 3, '#8fa3b8');
          ctx.save(); ctx.globalAlpha = .12;
          poly(ctx, [[x + 96, py + 12], [x + 144, py + 12], [x + 214, floorY], [x + 40, floorY]], '#cfeaf6');
          ctx.restore();
        }
        if (k === 1) {
          /* cargo still lashed to the side, under a net */
          for (let q = 0; q < 3; q++)
            fillRR(ctx, x + 70 + q * 46, floorY - 108 + (q % 2) * 12, 42, 46, 3, q % 2 ? '#5a442f' : '#6b5340');
          ctx.save(); ctx.globalAlpha = .5;
          for (let q = -3; q < 8; q++) {
            line(ctx, x + 60 + q * 22, floorY - 120, x + 82 + q * 22, floorY - 40, '#8a7a62', 2);
            line(ctx, x + 60 + q * 22, floorY - 40, x + 82 + q * 22, floorY - 120, '#8a7a62', 2);
          }
          ctx.restore();
        }
        if (k === 2) {
          /* a lantern still swinging on its hook, and a rack of tools */
          const sw = Math.sin(t * 0.9 + i) * 0.2;
          ctx.save(); ctx.translate(x + 150, 44); ctx.rotate(sw);
          line(ctx, 0, 0, 0, 34, '#5d6878', 3);
          fillRR(ctx, -11, 34, 22, 28, 4, '#3f4a5c');
          ctx.save(); ctx.globalAlpha = .8; fillRR(ctx, -7, 38, 14, 20, 3, '#ffd870'); ctx.restore();
          ctx.save(); ctx.globalAlpha = .16; circle(ctx, 0, 48, 62, '#ffd870'); ctx.restore();
          ctx.restore();
          fillRR(ctx, x + 40, floorY - 84, 96, 8, 3, '#4a3a2c');
          for (let q = 0; q < 4; q++) line(ctx, x + 50 + q * 24, floorY - 80, x + 46 + q * 24, floorY - 42, '#6f7a8c', 4);
        }
        if (k === 4) {
          /* a bulkhead door standing open, with the next hold black behind it */
          fillRR(ctx, x + 84, floorY - 168, 96, 168, 6, '#2b3a42');
          fillRR(ctx, x + 92, floorY - 158, 80, 158, 4, '#0e181e');
          ctx.save(); ctx.globalAlpha = .7;
          for (let q = 0; q < 6; q++) circle(ctx, x + 88 + q * 17, floorY - 172, 3, '#8fa3b8');
          ctx.restore();
          circle(ctx, x + 168, floorY - 84, 7, '#8fa3b8');
        }
        /* chains and weed off the deckhead, never the same run twice */
        ctx.save(); ctx.globalAlpha = .55;
        for (let q = 0; q < 2 + k % 3; q++) {
          const cx0 = x + 26 + imod(i * 37 + q * 61, 240);
          const len = 26 + imod(i * 19 + q * 43, 74);
          for (let m = 0; m * 11 < len; m++) {
            ctx.beginPath();
            ctx.ellipse(cx0 + Math.sin(t * 0.5 + m * 0.4 + i) * (m * 0.7), 44 + m * 11, 4.5, 6.5, 0, 0, TAU);
            ctx.strokeStyle = '#6f7a8c'; ctx.lineWidth = 2.4; ctx.stroke();
          }
        }
        ctx.restore();
      });
      BG2.fish(ctx, VW, VH, camX, floorY, t, 7, '#f6b93a', '#8fd6ff');
      /* silt turning over in the water she is stirring up */
      ctx.save(); ctx.globalAlpha = .3;
      for (let i = 0; i < 18; i++) {
        const r = makeRng(i * 47 + 5);
        circle(ctx, imod(i * 131 - camX * 0.7, VW + 60) - 30,
          floorY - 20 - r() * 220 + Math.sin(t * 0.9 + i) * 10, 1.4 + r() * 2, '#cfe0e8');
      }
      ctx.restore();
    },
    fg(ctx, VW, VH, camX, floorY, t) { WATER_FG(ctx, VW, VH, camX, floorY, t, 0.26); },
    pools: { hurdle: ['barrelW', 'chestW', 'crateSunk', 'cannonW', 'chainPile', 'anchorW'],
             over: ['wreckBeam'], tunnel: ['wreckHull'],
             ledge: ['wreckDeck'], step: ['crateSunk', 'chestW', 'barrelW'],
             deco: ['seagrass', 'bubblesDeco', 'shells'] }
  },
  {
    /* ---- and out on top of her ----
       The companionway up is not a choice: she runs it. What it puts her on
       is the deck itself, broken open and lying under thirty feet of water,
       and the far end of it is snapped off — so the way off is a jump into
       the blue and a long drop back to the sand. */
    id: 'deck', name: 'Apgriuvęs denis', sec: 10, diff: 0.78, floor: 'deckWreck',
    water: 1, calm: 1,
    stairsUp: 5, stairProp: 'treadWreck',
    dropEnd: 1, dropTo: 0, dropProp: 'deckEdge',
    dropRoom: { id: 'wreckSand', floor: 'seabed',
                pal: { floorTop: '#cfc49c', floorBody: '#8a7f5c', accent: '#8fd6ff' } },
    pal: { floorTop: '#8a7452', floorBody: '#3f3a30', accent: '#8fd6ff',
           treadTop: '#7a5f45', treadSide: '#4a3a2c', rail: '#6b5a4a', post: '#5a4a3c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG2.underwater(ctx, VW, VH, camX, floorY, t, '#3f9cc4', '#0f3f5c', -260);
      /* the sea bed a long way down on the far side of her, so the height
         she has climbed to is never in doubt */
      ctx.save(); ctx.globalAlpha = .5;
      BG.hills(ctx, VW, VH, camX * 0.08, floorY + 170, '#0e3346', 30, 380);
      ctx.restore();
      /* masts, davits, ventilators and the rail — a different piece of her
         upperworks every time */
      tileLayer(camX * 0.4, 340, VW, (x, i) => {
        const k = imod(i, 4);
        ctx.save(); ctx.globalAlpha = .9;
        if (k === 0) {
          /* a mast, leaning, with rigging and weed streaming off it */
          ctx.save(); ctx.translate(x + 120, floorY); ctx.rotate(0.16);
          fillRR(ctx, -10, -330, 20, 336, 6, '#4a3a2c');
          fillRR(ctx, -66, -250, 132, 12, 4, '#4a3a2c');
          ctx.save(); ctx.globalAlpha = .45;
          line(ctx, 0, -324, -86, -60, '#6b5a4a', 3);
          line(ctx, 0, -324, 92, -70, '#6b5a4a', 3); ctx.restore();
          ctx.save(); ctx.globalAlpha = .7;
          for (let q = 0; q < 5; q++) {
            const sw = Math.sin(t * 0.8 + q) * 9;
            ctx.beginPath(); ctx.moveTo(-60 + q * 30, -244);
            ctx.quadraticCurveTo(-56 + q * 30 + sw, -212, -60 + q * 30 + sw * 1.6, -176);
            ctx.strokeStyle = '#3f7a5c'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
          }
          ctx.restore();
          ctx.restore();
        } else if (k === 1) {
          /* a cowl ventilator, and a skylight with the glass gone */
          ctx.beginPath();
          ctx.moveTo(x + 60, floorY); ctx.lineTo(x + 60, floorY - 130);
          ctx.quadraticCurveTo(x + 62, floorY - 168, x + 100, floorY - 166);
          ctx.lineTo(x + 100, floorY - 130);
          ctx.quadraticCurveTo(x + 86, floorY - 128, x + 84, floorY);
          ctx.closePath(); ctx.fillStyle = '#3f4a5c'; ctx.fill();
          ctx.save(); ctx.globalAlpha = .5;
          fillEll(ctx, x + 88, floorY - 150, 15, 20, '#1c2a33'); ctx.restore();
          fillRR(ctx, x + 170, floorY - 74, 120, 74, 5, '#3a4a53');
          for (let q = 0; q < 3; q++) fillRR(ctx, x + 180 + q * 38, floorY - 66, 28, 40, 3, '#0e2a36');
        } else if (k === 2) {
          /* a winch, a bollard and a coil of wire nobody will ever use */
          fillRR(ctx, x + 70, floorY - 66, 110, 46, 6, '#3f4a5c');
          circle(ctx, x + 96, floorY - 44, 20, '#2b3444');
          circle(ctx, x + 154, floorY - 44, 20, '#2b3444');
          fillRR(ctx, x + 230, floorY - 52, 26, 52, 5, '#4a5468');
          fillRR(ctx, x + 224, floorY - 60, 38, 12, 4, '#4a5468');
        } else {
          /* the wheelhouse, or what is left of it */
          fillRR(ctx, x + 50, floorY - 176, 190, 176, 8, '#3a4a53');
          fillRR(ctx, x + 40, floorY - 190, 210, 20, 6, '#2b3a42');
          for (let q = 0; q < 4; q++) {
            fillRR(ctx, x + 64 + q * 44, floorY - 158, 34, 44, 4, q === 1 ? '#0e2a36' : '#2f7fa8');
            ctx.save(); ctx.globalAlpha = .4;
            fillRR(ctx, x + 68 + q * 44, floorY - 154, 12, 36, 2, '#bfeaf6'); ctx.restore();
          }
          ctx.save(); ctx.globalAlpha = .6;
          line(ctx, x + 145, floorY - 190, x + 145, floorY - 258, '#4a5468', 5); ctx.restore();
        }
        ctx.restore();
        /* the rail along the far side of the deck, in and out of the murk */
        ctx.save(); ctx.globalAlpha = .55;
        fillRR(ctx, x - 40, floorY - 96, 420, 7, 3, '#4a5468');
        for (let q = 0; q < 8; q++) line(ctx, x - 30 + q * 50, floorY - 92, x - 30 + q * 50, floorY - 6, '#4a5468', 4);
        ctx.restore();
      });
      BG2.fish(ctx, VW, VH, camX, floorY, t, 10, '#ffd870', '#8fd6ff');
    },
    fg(ctx, VW, VH, camX, floorY, t) { WATER_FG(ctx, VW, VH, camX, floorY, t, 0.24); },
    pools: { hurdle: ['crateSunk', 'barrelW', 'chainPile', 'anchorW', 'cannonW'],
             over: ['wreckBeam'], tunnel: ['wreckHull'],
             ledge: ['wreckDeck'], step: ['crateSunk', 'chestW', 'barrelW'],
             deco: ['seagrass', 'bubblesDeco', 'shells'] }
  },
  {
    id: 'reef', name: 'Koralų rifas', sec: 10, diff: 0.8, floor: 'seabed', water: 1, calm: 1,
    pal: { floorTop: '#f0dcb8', floorBody: '#b8a37a', accent: '#ff8fa8',
           treadTop: '#f0dcb8', treadSide: '#b8a37a' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG2.underwater(ctx, VW, VH, camX, floorY, t, '#4fbcd8', '#12607f', -140);
      /* A wall of coral behind everything — and a reef is not one coral
         repeated. Six kinds grow along it, in six colours, and which one
         stands where is decided by the reef's own grid, so it never crawls. */
      tileLayer(camX * 0.26, 190, VW, (x, i) => {
        const r = makeRng(i * 61 + 11);
        const COLS = ['#e0708a', '#f0a24a', '#a87fd6', '#4fb8a0', '#ffd870', '#6fbce0'];
        ctx.save(); ctx.globalAlpha = .78;
        for (let k = 0; k < 4; k++) {
          const px = x + k * 46 + r() * 16, ph = 60 + r() * 110;
          const col = COLS[imod(i * 3 + k * 5, 6)];
          const kind = imod(i * 2 + k * 3, 6);
          if (kind === 0) {
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
          } else if (kind === 1) {
            /* branching coral */
            for (let b = -1; b <= 1; b++) {
              ctx.beginPath(); ctx.moveTo(px, floorY);
              ctx.quadraticCurveTo(px + b * 16, floorY - ph * 0.6, px + b * 30, floorY - ph);
              ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
              circle(ctx, px + b * 30, floorY - ph, 6, shade(col, .28));
            }
          } else if (kind === 2) {
            /* brain coral: a dome with a maze on it */
            ctx.beginPath();
            ctx.ellipse(px, floorY, ph * 0.45, ph * 0.42, 0, Math.PI, TAU);
            ctx.closePath(); ctx.fillStyle = col; ctx.fill();
            ctx.save(); ctx.globalAlpha = .45;
            for (let q = 1; q < 5; q++) {
              ctx.beginPath();
              ctx.ellipse(px, floorY, ph * 0.45 * (q / 5), ph * 0.42 * (q / 5), 0, Math.PI, TAU);
              ctx.strokeStyle = shade(col, -.3); ctx.lineWidth = 3; ctx.stroke();
            }
            ctx.restore();
          } else if (kind === 3) {
            /* tube sponges, leaning with the current */
            for (let b = 0; b < 3; b++) {
              const sw = Math.sin(t * 0.6 + i + b) * 5, hh = ph * (0.5 + b * 0.22);
              ctx.beginPath();
              ctx.moveTo(px + b * 15 - 15, floorY);
              ctx.quadraticCurveTo(px + b * 15 - 15 + sw, floorY - hh * 0.6, px + b * 15 - 12 + sw, floorY - hh);
              ctx.strokeStyle = col; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.stroke();
              fillEll(ctx, px + b * 15 - 12 + sw, floorY - hh, 6, 3, shade(col, -.35));
            }
          } else if (kind === 4) {
            /* a sea urchin wedged in the rock */
            const rad = 14 + ph * 0.1;
            for (let q = 0; q < 14; q++) {
              const a = Math.PI + (q / 13) * Math.PI;
              line(ctx, px, floorY - rad * 0.4, px + Math.cos(a) * rad * 1.9,
                   floorY - rad * 0.4 + Math.sin(a) * rad * 1.9, shade(col, -.3), 3);
            }
            circle(ctx, px, floorY - rad * 0.4, rad, col);
          } else {
            /* staghorn coral, forking */
            const stag = (bx, by, len, a, d) => {
              const ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len;
              line(ctx, bx, by, ex, ey, col, 3 + d * 2.5);
              if (d > 0) { stag(ex, ey, len * 0.66, a - 0.5, d - 1); stag(ex, ey, len * 0.66, a + 0.5, d - 1); }
            };
            stag(px, floorY, ph * 0.42, -Math.PI / 2, 2);
            stag(px - 18, floorY, ph * 0.3, -Math.PI / 2 - 0.2, 2);
          }
        }
        ctx.restore();
      });
      BG2.fish(ctx, VW, VH, camX, floorY, t, 16, '#ffd870', '#6fe0c8');
      /* something big drifting past: a turtle, then a ray, then a turtle
         again — the reef is never twice the same stretch of water */
      tileLayer(camX * 0.3 + t * 26, 1400, VW, (x, bi) => {
        const ty = floorY - 190 + Math.sin(t * 0.6) * 14;
        if (imod(bi, 2)) {
          ctx.save(); ctx.globalAlpha = .72; ctx.translate(x, ty + 40);
          const flap = Math.sin(t * 1.4) * 10;
          ctx.beginPath();
          ctx.moveTo(-46, flap); ctx.quadraticCurveTo(-16, -14, 0, 0);
          ctx.quadraticCurveTo(16, -14, 46, flap);
          ctx.quadraticCurveTo(16, 16, 0, 12);
          ctx.quadraticCurveTo(-16, 16, -46, flap);
          ctx.closePath(); ctx.fillStyle = '#4f6f8a'; ctx.fill();
          ctx.save(); ctx.globalAlpha = .5;
          for (let q = -2; q <= 2; q++) circle(ctx, q * 13, 2, 3, '#8fb8d6'); ctx.restore();
          line(ctx, 0, 10, 4, 52, '#4f6f8a', 3);
          circle(ctx, -6, -2, 2, '#1c2a33'); circle(ctx, 6, -2, 2, '#1c2a33');
          ctx.restore();
          return;
        }
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
    /* ---- out of the sea ----
       Nothing happens to the water here. The sea keeps its level exactly
       where it has been all along; what changes is the bottom, which climbs
       out from under it a shelf at a time until she is running in daylight.
       `climb` is what actually lifts the floor — the drawing only has to
       follow it. */
    id: 'shallows', name: 'Sekluma', sec: 13, diff: 0.66, floor: 'seabed',
    water: 1, calm: 1,
    climb: { n: 9, h: 38 }, riseProp: 'sandShelf',
    surfaceY: 320,          /* the level of the sea, in world height */
    pal: { floorTop: '#f0e0b0', floorBody: '#c2ac80', accent: '#8fd6ff',
           treadTop: '#f0e0b0', treadSide: '#c2ac80' },
    /* the screen y of the surface: a fixed height above the *original* sea
       bed, converted through whatever shelf she is standing on now */
    surfAt(floorY, baseY) { return floorY - (this.surfaceY - (baseY || 0)); },
    bg(ctx, VW, VH, camX, floorY, t, pal, baseY) {
      const surf = this.surfAt(floorY, baseY);
      /* the sky over the water — always there, only nearer as she climbs */
      BG.sky(ctx, VW, VH, '#7fd6ee', '#d8f0f8');
      BG.sun(ctx, VW, VH, VW * 0.3, 56, 28, '#fff6d8');
      BG.clouds(ctx, VW, VH, camX * 0.04, t, '#ffffff', 34, 1.1);
      /* the shore ahead, which is the same sand she is running on carrying on
         up out of the water. Its foot meets the surface exactly, because that
         is where sand and sea meet. */
      const bank = clamp(surf, 30, floorY + 30) + 4;
      BG.hills(ctx, VW, VH, camX * 0.16, bank, '#e6d3a4', 20, 340);
      /* the pines on it only come in once there is room for them: while she
         is still deep the shore is a long way off and all that shows of it
         is the sand */
      const near = clamp(inv(surf, 40, 150), 0, 1);
      if (near > 0.02) {
        ctx.save(); ctx.globalAlpha = .92 * near;
        tileLayer(camX * 0.24, 230, VW, (x, i) => {
          const r = makeRng(i * 31 + 5), h = (96 + r() * 64) * near;
          fillRR(ctx, x - 7, bank - h, 14, h + 14, 5, '#7a5a3a');
          leafy(ctx, x, bank - h - 10, 42 * near, 34 * near, '#3f9c5c', '#5cc47c', i * 5);
        });
        ctx.restore();
      }
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
      /* the bottom behind her, stepping up in shelves of its own so the climb
         is something she can see happening and not only feel */
      ctx.save(); ctx.globalAlpha = .55;
      tileLayer(camX * 0.42, 190, VW, (x, i) => {
        const step = 22 + imod(i * 29, 20);
        ctx.beginPath();
        ctx.moveTo(x - 20, floorY + 40);
        ctx.lineTo(x - 20, floorY + 6);
        for (let px = 0; px <= 210; px += 14)
          ctx.lineTo(x - 20 + px, floorY + 6 - step * smooth(clamp(px / 150, 0, 1))
                                  + Math.sin((px + i * 40) * 0.05) * 3);
        ctx.lineTo(x + 190, floorY + 40); ctx.closePath();
        ctx.fillStyle = '#d8c496'; ctx.fill();
      });
      ctx.restore();
      ctx.restore();
      /* the surface itself, dead level, and the foam riding along it */
      if (surf < floorY + 30) {
        ctx.save(); ctx.globalAlpha = .9;
        ctx.beginPath();
        for (let px = -10; px <= VW + 10; px += 12) {
          const yy = surf + Math.sin((px + camX * 0.5) * 0.016 + t * 0.7) * 6;
          px === -10 ? ctx.moveTo(px, yy) : ctx.lineTo(px, yy);
        }
        ctx.strokeStyle = '#f4fbfd'; ctx.lineWidth = 4; ctx.stroke();
        ctx.globalAlpha = .5;
        for (let i = 0; i < 22; i++) {
          const r = makeRng(i * 23 + 11);
          const fx = imod(i * 83 - camX * 0.5, VW + 40) - 20;
          circle(ctx, fx, surf + Math.sin((fx + camX * 0.5) * 0.016 + t * 0.7) * 6 - 2 - r() * 5,
                 1.4 + r() * 2.4, '#ffffff');
        }
        ctx.restore();
      }
    },
    fg(ctx, VW, VH, camX, floorY, t, pal, baseY) {
      const surf = this.surfAt(floorY, baseY);
      /* the blue over everything thins out as the water above her does */
      const k = clamp(inv(surf, floorY - 20, floorY - 300), 0, 1);
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
    /* ---- a seaside street, and nothing more than that ----
       No sea in it and nothing standing in water: a road with a kerb, small
       houses along it, and traffic that has plainly come back from the beach.
       The tall blocks that used to line it and the cars that floated a foot
       above the tarmac were what made it read as a flooded one. */
    id: 'seatown', name: 'Gatvė', sec: 7, diff: 0.8, floor: 'asphalt',
    pal: { sky1: '#6fcfea', sky2: '#cdeef8', far: '#c9d8e0', mid: '#a8bcc9',
           floorTop: '#a9a29a', floorBody: '#55505c', accent: '#e2453c',
           cloud: '#ffffff', car: '#3f9cc4' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, pal.sky1, pal.sky2);
      BG.clouds(ctx, VW, VH, camX * 0.05, t, pal.cloud, 40, 1.05);
      /* wooded hills behind the roofs */
      ctx.save(); ctx.globalAlpha = .7;
      BG.hills(ctx, VW, VH, camX * 0.1, floorY - 210, '#3f7a5c', 46, 300);
      ctx.restore();
      /* the far side of the street: one-storey houses, never two the same */
      tileLayer(camX * 0.16, 210, VW, (x, i) => {
        const k = imod(i, 5);
        const wall = ['#f2ece0', '#e8ddc8', '#dfe8ee', '#f0e2cc', '#e6eee4'][k];
        const roof = ['#8a5f4a', '#4f8ca8', '#c96f5a', '#6b9c6a', '#a8794a'][k];
        const h = 104 + k * 9;
        fillRR(ctx, x, floorY - h, 150, h, 5, wall);
        if (k === 1 || k === 4) {
          /* a hipped roof */
          poly(ctx, [[x - 8, floorY - h], [x + 42, floorY - h - 40],
                     [x + 108, floorY - h - 40], [x + 158, floorY - h]], roof);
        } else {
          poly(ctx, [[x - 8, floorY - h], [x + 75, floorY - h - 46], [x + 158, floorY - h]], roof);
        }
        if (k === 2) fillRR(ctx, x + 108, floorY - h - 62, 17, 34, 3, '#b8a08a');   /* a chimney */
        for (let q = 0; q < 3; q++)
          fillRR(ctx, x + 18 + q * 44, floorY - h + 26, 30, 34, 3, k === 3 ? '#c9dce6' : '#8fc4d6');
        if (k === 0) {
          /* washing on a line between two of them */
          ctx.save(); ctx.globalAlpha = .8;
          ctx.beginPath();
          ctx.moveTo(x + 150, floorY - h + 14);
          ctx.quadraticCurveTo(x + 180, floorY - h + 34, x + 210, floorY - h + 12);
          ctx.strokeStyle = '#b8ac98'; ctx.lineWidth = 2; ctx.stroke();
          ['#ffd870', '#e2584f', '#8fd6ff'].forEach((c, q) =>
            fillRR(ctx, x + 160 + q * 16, floorY - h + 22 + q * 2, 12, 18, 2, c));
          ctx.restore();
        }
      });
      /* this side of the street: wooden villas with verandas, each one
         doing something the last one was not */
      tileLayer(camX * 0.3, 250, VW, (x, i) => {
        const k = imod(i, 4);
        const c = ['#4f8ca8', '#c96f5a', '#6b9c6a', '#d8a24a'][k];
        fillRR(ctx, x, floorY - 176, 176, 176, 6, '#f2ece0');
        poly(ctx, [[x - 10, floorY - 176], [x + 88, floorY - 236], [x + 186, floorY - 176]], c);
        ctx.save(); ctx.globalAlpha = .55;
        for (let q = 0; q < 12; q++) line(ctx, x + 4, floorY - 164 + q * 13, x + 172, floorY - 164 + q * 13, '#dcd0ba', 2);
        ctx.restore();
        if (k === 1) {            /* a dormer in the roof */
          fillRR(ctx, x + 62, floorY - 218, 52, 44, 4, '#f2ece0');
          poly(ctx, [[x + 54, floorY - 218], [x + 88, floorY - 240], [x + 122, floorY - 218]], shade(c, -.12));
          fillRR(ctx, x + 74, floorY - 208, 28, 28, 3, '#8fc4d6');
        }
        if (k === 3) {            /* a little tower on the corner */
          fillRR(ctx, x + 140, floorY - 232, 48, 60, 4, '#f2ece0');
          poly(ctx, [[x + 134, floorY - 232], [x + 164, floorY - 274], [x + 194, floorY - 232]], shade(c, .1));
          circle(ctx, x + 164, floorY - 206, 9, '#8fc4d6');
        }
        for (let q = 0; q < 3; q++) {
          fillRR(ctx, x + 16 + q * 54, floorY - 144, 38, 50, 4, '#8fc4d6');
          fillRR(ctx, x + 14 + q * 54, floorY - 150, 42, 8, 3, c);
          ctx.save(); ctx.globalAlpha = .5;
          fillRR(ctx, x + 20 + q * 54, floorY - 140, 12, 40, 2, '#eaf6fb'); ctx.restore();
          /* shutters on some of them */
          if (k === 2) {
            fillRR(ctx, x + 10 + q * 54, floorY - 144, 8, 50, 2, shade(c, .1));
            fillRR(ctx, x + 54 + q * 54, floorY - 144, 8, 50, 2, shade(c, .1));
          }
        }
        /* the veranda across the front, standing on the pavement */
        fillRR(ctx, x + 6, floorY - 82, 164, 8, 3, c);
        for (let q = 0; q < 5; q++) line(ctx, x + 14 + q * 36, floorY - 78, x + 14 + q * 36, floorY - 14, '#f2ece0', 5);
        /* and what is leaning against it: a board, a bike, a pile of pots */
        if (k === 0) {
          ctx.save(); ctx.translate(x + 132, floorY - 16); ctx.rotate(-0.22);
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.quadraticCurveTo(-13, -38, 0, -74);
          ctx.quadraticCurveTo(13, -38, 0, 0); ctx.closePath();
          ctx.fillStyle = '#ffd870'; ctx.fill();
          ctx.strokeStyle = 'rgba(40,30,20,.4)'; ctx.lineWidth = 1.8; ctx.stroke();
          line(ctx, 0, -8, 0, -66, '#e07a3a', 2); ctx.restore();
        } else if (k === 2) {
          circle(ctx, x + 118, floorY - 24, 13, 'rgba(0,0,0,0)');
          ctx.strokeStyle = '#4a5468'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(x + 118, floorY - 24, 13, 0, TAU); ctx.stroke();
          ctx.beginPath(); ctx.arc(x + 152, floorY - 24, 13, 0, TAU); ctx.stroke();
          line(ctx, x + 118, floorY - 24, x + 138, floorY - 46, '#c96f5a', 3);
          line(ctx, x + 138, floorY - 46, x + 152, floorY - 24, '#c96f5a', 3);
        } else if (k === 3) {
          [0, 22, 44].forEach((o0, q) => {
            fillRR(ctx, x + 116 + o0, floorY - 26 - q % 2 * 4, 18, 26, 3, '#c9855a');
            leafy(ctx, x + 125 + o0, floorY - 30 - q % 2 * 4, 15, 12, '#4caf6d', '#75d493', q);
          });
        }
      });
      /* the far kerb and pavement, so the road has an edge and the houses
         are standing on something */
      fillRR(ctx, 0, floorY - 14, VW, 16, 0, '#ded4c2');
      ctx.save(); ctx.globalAlpha = .5;
      for (let px = -imod(camX * 0.3, 46); px < VW; px += 46) line(ctx, px, floorY - 14, px, floorY, '#c2b7a4', 2);
      ctx.restore();
      fillRR(ctx, 0, floorY - 2, VW, 6, 0, '#b8ada0');
      /* lamp posts and a bus stop, standing on that pavement */
      tileLayer(camX * 0.3, 320, VW, (x, i) => {
        line(ctx, x, floorY - 12, x, floorY - 132, '#4a5468', 5);
        fillEll(ctx, x, floorY - 138, 13, 7, '#fff6d8');
        if (imod(i, 3) === 1) {
          fillRR(ctx, x + 60, floorY - 104, 110, 10, 3, '#4f8ca8');
          [x + 66, x + 162].forEach(px => line(ctx, px, floorY - 100, px, floorY - 12, '#4a5468', 4));
          fillRR(ctx, x + 74, floorY - 60, 84, 48, 4, '#dfe8ee');
        }
      });
      /* the traffic, on the road and not above it: everything on this street
         has just come back from the beach */
      tileLayer((camX * 0.44 + t * 62) % 100000, 380, VW, (x, i) => {
        ctx.save(); ctx.globalAlpha = .95;
        BG2.beachTraffic(ctx, x, floorY - 4, t, i);
        ctx.restore();
      });
    },
    pools: { hurdle: ['cone', 'bin', 'crate', 'hydrant', 'barrier', 'planterProm'],
             over: ['pipeS', 'awning'], tunnel: ['scaffold'],
             ledge: ['awning', 'surfVan'], step: ['surfVan', 'crate', 'benchProm'],
             deco: ['roadPaint', 'manholeD', 'drainD', 'leafLitter'] }
  },
  {
    id: 'forest', name: 'Miškas', sec: 15, diff: 0.88, floor: 'forestFloor', calm: 1,
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
    id: 'deepwood', name: 'Tankus miškas', sec: 10, diff: 1.0, floor: 'forestFloor', last: true, calm: 1,
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
            const kind = imod(i, 5);
            if (kind === 2) {
              /* roots that have found their way down through the roof */
              ctx.save(); ctx.globalAlpha = .8;
              for (let k = -1; k <= 1; k++) {
                ctx.beginPath();
                ctx.moveTo(x + k * 22, gy - 60);
                ctx.quadraticCurveTo(x + k * 22 + 10, gy - 20, x + k * 26 - 6, gy + 30);
                ctx.strokeStyle = k ? '#6b4a2c' : '#7a5a3a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
              }
              ctx.globalAlpha = on * .22;
              fillEll(ctx, x, gy - 10, 40, 26, '#ffc48a'); ctx.restore();
              return;
            }
            if (kind === 4) {
              /* a seam of ore in the rock, and water beading off it */
              ctx.save(); ctx.globalAlpha = .7;
              ctx.beginPath();
              ctx.moveTo(x - 40, gy + 18);
              ctx.quadraticCurveTo(x, gy - 14, x + 44, gy + 10);
              ctx.strokeStyle = '#c9962c'; ctx.lineWidth = 6; ctx.stroke();
              ctx.globalAlpha = .45;
              ctx.beginPath();
              ctx.moveTo(x - 36, gy + 24);
              ctx.quadraticCurveTo(x + 4, gy - 6, x + 40, gy + 16);
              ctx.strokeStyle = '#8c8378'; ctx.lineWidth = 3; ctx.stroke();
              ctx.restore();
              ctx.save(); ctx.globalAlpha = .55;
              for (let k = 0; k < 3; k++)
                circle(ctx, x - 20 + k * 22, gy + 26 + imod(i * 7 + k * 11, 14) + Math.sin(t * 1.6 + k) * 2,
                       2.4, '#bfeaf6');
              ctx.restore();
              return;
            }
            if (kind === 0 || kind === 3) {
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
          /* No two clusters alike: single spires, whole clumps of them, ones
             that have broken off and lie across the floor, and geodes split
             open in the rock — in five colours rather than two. */
          ctx.save(); ctx.globalAlpha = .78;
          tileLayer(camX * 0.32, 150, VW, (x, i) => {
            const r = makeRng(i * 71 + 5);
            const base = floorY - 20 - r() * 40, h = 80 + r() * 130;
            const on = .4 + Math.sin(t * 1.2 + i * 0.9) * .3;
            const COLS = ['#6fc9ea', '#b48bff', '#7fe0c4', '#ff9bd0', '#ffd870'];
            const col = COLS[imod(i * 2, 5)];
            const kind = imod(i, 4);
            ctx.save(); ctx.globalAlpha = on * .26;
            circle(ctx, x, base - h * 0.5, h * 0.5, col); ctx.restore();
            const spire = (px, py, hh, wd, lean) => {
              poly(ctx, [[px - wd, py], [px - wd * 0.6 + lean, py - hh * 0.82], [px + lean, py - hh],
                         [px + wd * 0.6 + lean, py - hh * 0.82], [px + wd, py]], col);
              ctx.save(); ctx.globalAlpha = .45;
              poly(ctx, [[px - wd * 0.28, py], [px + lean, py - hh * 0.9], [px + wd * 0.32, py]], '#eaf9ff');
              ctx.restore();
            };
            if (kind === 0) {
              spire(x, base, h, 15, 0);
            } else if (kind === 1) {
              /* a clump: one tall, two short, all leaning off each other */
              spire(x - 20, base, h * 0.55, 11, -5);
              spire(x + 22, base, h * 0.7, 12, 6);
              spire(x, base, h, 15, 0);
            } else if (kind === 2) {
              /* one that came down years ago and lies across the floor */
              ctx.save(); ctx.translate(x, base); ctx.rotate(-0.42 + imod(i, 3) * 0.2);
              spire(0, 0, h * 0.8, 14, 0);
              ctx.restore();
              spire(x + 30, base, h * 0.42, 10, 3);
            } else {
              /* a geode, split open in the rock face */
              ctx.beginPath();
              ctx.ellipse(x, base - h * 0.5, h * 0.34, h * 0.4, 0, 0, TAU);
              ctx.fillStyle = '#6b6070'; ctx.fill();
              ctx.save();
              ctx.beginPath();
              ctx.ellipse(x, base - h * 0.5, h * 0.26, h * 0.32, 0, 0, TAU);
              ctx.clip();
              ctx.fillStyle = shade(col, -.3);
              ctx.fillRect(x - h, base - h, h * 2, h);
              for (let q = 0; q < 9; q++) {
                const a = (q / 9) * TAU;
                poly(ctx, [[x, base - h * 0.5],
                           [x + Math.cos(a) * h * 0.3, base - h * 0.5 + Math.sin(a) * h * 0.36],
                           [x + Math.cos(a + 0.6) * h * 0.3, base - h * 0.5 + Math.sin(a + 0.6) * h * 0.36]],
                     q % 2 ? col : shade(col, .25));
              }
              ctx.restore();
            }
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
