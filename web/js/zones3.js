'use strict';
/* ---------------------------------------------------------------
   zones3.js — level 3: "Nuo debesų iki žvaigždžių".

   Thirteen places, and they climb: she starts on the back of an
   airship above the clouds, walks down inside her, steps off onto
   the mooring gantry of a sky tower, comes down its terraces
   through the cloud layer to the ground, runs a blossom orchard and
   the glasshouses behind it, crosses a marble quarry, goes under it
   into a salt mine, comes up in a rocket silo, rides the rocket up,
   climbs out onto the hull in orbit, crosses the station and
   finishes standing on the Moon.

   Air, then ground, then under the ground, then space.

   Three places offer the same choice — jump clean over the hole in
   the floor, or drop into it and take the long way round: the
   airship's ballast deck, the seed cellar under the glasshouses and
   the conveyor gallery under the quarry. The gallery has a second,
   deeper hole in it, and at the bottom of that one — behind a rock
   fall, in a bunker nobody has opened for years — is the jetpack.
----------------------------------------------------------------*/

/* ================= backgrounds shared by level 3 ================= */
const BG3 = {
  /* the top of the weather, seen from above: a slow white sea */
  cloudSea(ctx, VW, VH, off, horizon, t, top, bot) {
    const g = ctx.createLinearGradient(0, horizon - 40, 0, VH);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(0, horizon - 40, VW, VH - horizon + 60);
    for (let row = 0; row < 5; row++) {
      const f = row / 4;
      const y = horizon + (VH - horizon) * f * 0.7;
      ctx.save(); ctx.globalAlpha = .35 + f * .5;
      tileLayer(off * (0.06 + f * 0.22) + t * (4 + f * 10), 300 - f * 60, VW, (x, i) => {
        const r = makeRng(i * 53 + row * 17 + 3);
        const s = (0.7 + r() * 0.8) * (0.5 + f);
        const yy = y + r() * 26;
        fillEll(ctx, x + 70, yy, 78 * s, 22 * s, row < 2 ? '#eef4fa' : '#ffffff');
        fillEll(ctx, x + 130, yy - 12 * s, 54 * s, 20 * s, row < 2 ? '#e4ecf4' : '#f8fbff');
        fillEll(ctx, x + 24, yy + 5, 46 * s, 15 * s, '#ffffff');
      });
      ctx.restore();
    }
  },
  /* stars, and they do not scroll with her — they are a very long way off */
  stars(ctx, VW, VH, off, t, n, hi) {
    ctx.save();
    for (let i = 0; i < n; i++) {
      const r = makeRng(i * 71 + 5);
      const x = imod(r() * VW * 3 - off * 0.02, VW + 20) - 10;
      const y = r() * (hi == null ? VH : hi);
      ctx.globalAlpha = .35 + Math.abs(Math.sin(t * (0.6 + r()) + i)) * .6;
      circle(ctx, x, y, r() > .88 ? 2.2 : 1.2, r() > .7 ? '#dfe8ff' : '#ffffff');
    }
    ctx.restore();
  },
  /* the Earth, hanging there being the best thing in the sky */
  earth(ctx, cx, cy, r, t, lit) {
    ctx.save(); ctx.globalAlpha = .3;
    circle(ctx, cx, cy, r * 1.22, '#4f8fd0'); ctx.restore();
    circle(ctx, cx, cy, r, '#2f6bb0');
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
    /* continents, drifting round very slowly */
    for (let i = 0; i < 5; i++) {
      const a = t * 0.05 + i * 1.3;
      const px = cx + Math.sin(a) * r * 0.7, py = cy - r * 0.5 + i * r * 0.34;
      fillEll(ctx, px, py, r * (0.3 - i * 0.02), r * 0.16, '#5faf6a', a * .3);
      fillEll(ctx, px + r * .2, py + r * .1, r * 0.16, r * 0.1, '#7fc47a', -a * .2);
    }
    ctx.globalAlpha = .5;
    for (let i = 0; i < 6; i++) {
      const a = t * 0.07 + i * 1.05;
      fillEll(ctx, cx + Math.sin(a) * r * 0.75, cy - r * 0.6 + i * r * 0.26, r * 0.28, r * 0.08, '#ffffff', a * .2);
    }
    /* the night side */
    ctx.globalAlpha = .55;
    const sg = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    sg.addColorStop(lit === 'left' ? 0 : 0.4, 'rgba(4,8,20,0)');
    sg.addColorStop(1, 'rgba(4,8,20,.9)');
    ctx.fillStyle = sg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .45;
    ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, TAU);
    ctx.strokeStyle = '#8fd6ff'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
  },
  /* a roof of rock coming down over her, with something hanging off it */
  roof(ctx, VW, VH, off, depth, body, drip, period) {
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(VW, 0); ctx.lineTo(VW, depth);
    for (let px = VW; px >= 0; px -= 14)
      ctx.lineTo(px, depth + Math.sin((px + off * 0.4) * 0.019) * 20);
    ctx.closePath(); ctx.fillStyle = body; ctx.fill();
    tileLayer(off * 0.4, period || 56, VW, (x, i) => {
      const d = 16 + imod(i * 29, 30);
      poly(ctx, [[x - 8, depth + 4], [x + 8, depth + 4], [x, depth + 4 + d]], drip);
    });
  },
  /* the bare bones of a hall: a far wall of panels with lights on it */
  techWall(ctx, VW, VH, off, floorY, far, panel, glow, period) {
    ctx.fillStyle = far; ctx.fillRect(0, 0, VW, VH);
    tileLayer(off * 0.18, period || 240, VW, (x, i) => {
      const k = imod(i, 3);
      fillRR(ctx, x, floorY - 300, 210, 300, 6, shade(far, k === 1 ? -.1 : .07));
      ctx.save(); ctx.globalAlpha = .5;
      for (let q = 0; q < 5; q++) line(ctx, x + 10, floorY - 288 + q * 56, x + 200, floorY - 288 + q * 56, shade(far, -.2), 2);
      ctx.restore();
      if (k === 0) {
        fillRR(ctx, x + 24, floorY - 250, 160, 96, 5, shade(panel, -.15));
        ctx.save(); ctx.globalAlpha = .8;
        for (let q = 0; q < 12; q++)
          circle(ctx, x + 40 + (q % 6) * 26, floorY - 232 + Math.floor(q / 6) * 26, 4,
            imod(q * 7 + i * 5, 5) > 2 ? glow : shade(panel, -.3));
        ctx.restore();
      } else if (k === 1) {
        for (let q = 0; q < 4; q++)
          fillRR(ctx, x + 20 + q * 48, floorY - 268, 34, 210, 4, shade(panel, q % 2 ? -.05 : .1));
        ctx.save(); ctx.globalAlpha = .5;
        fillRR(ctx, x + 16, floorY - 92, 180, 10, 3, glow); ctx.restore();
      } else {
        fillRR(ctx, x + 30, floorY - 262, 150, 120, 8, shade(panel, .05));
        fillRR(ctx, x + 42, floorY - 250, 126, 96, 5, '#12181f');
        ctx.save(); ctx.globalAlpha = .6;
        for (let q = 0; q < 4; q++) fillRR(ctx, x + 50, floorY - 240 + q * 22, 100 - q * 14, 8, 2, glow);
        ctx.restore();
      }
    });
  }
};

/* ---------------- level 3's floors ---------------- */
Object.assign(FLOOR_EXT, {
  /* the airship's back: doped fabric over ribs, curving away from her */
  envelope(ctx, x, y, w, h, pal, t, camX) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e6ecf2'); g.addColorStop(0.4, '#c2cdd8'); g.addColorStop(1, '#98a5b2');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, '#f2f6fa');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 84) * 84 - camX; px < x + w; px += 84) {
      if (px < x) continue;
      line(ctx, px, y, px, y + h, '#8b98a6', 2.4);
      for (let k = 0; k < 5; k++) circle(ctx, px, y + 12 + k * 18, 2, '#7f8b99');
    }
    ctx.globalAlpha = .3;
    for (let i = 0; i < 3; i++) line(ctx, x, y + 20 + i * 26, x + w, y + 20 + i * 26, '#8b98a6', 2);
    ctx.restore();
  },
  cabinFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#7a5c3a'; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, '#a8834f');
    ctx.save(); ctx.globalAlpha = .35;
    for (let px = Math.floor((x + camX) / 58) * 58 - camX; px < x + w; px += 58)
      if (px > x) line(ctx, px, y, px, y + h, '#5f4429', 2);
    for (let i = 0; i < 4; i++) line(ctx, x, y + 16 + i * 20, x + w, y + 16 + i * 20, '#5f4429', 1.8);
    ctx.restore();
    /* the runner down the middle of the salon */
    ctx.save(); ctx.globalAlpha = .85;
    fillRR(ctx, x, y + 10, w, 22, 0, '#8a3f5c');
    ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 44) * 44 - camX; px < x + w; px += 44)
      if (px > x) circle(ctx, px, y + 21, 4, '#c9a86a');
    ctx.restore();
  },
  /* open grating: the cloud is a long way down and you can see it */
  steelGrate(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#4a5764'; ctx.fillRect(x, y, w, h);
    ctx.save(); ctx.globalAlpha = .9;
    for (let px = Math.floor((x + camX) / 15) * 15 - camX; px < x + w; px += 15) {
      if (px < x) continue;
      ctx.fillStyle = '#8b98a6'; ctx.fillRect(px, y, 9, Math.min(h, 40));
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 3; i++) ctx.fillRect(x, y + 12 + i * 14, w, 3);
    ctx.fillStyle = '#dfe8f0'; ctx.fillRect(x, y, w, 3); ctx.restore();
    fillRR(ctx, x, y - 3, w, 5, 0, '#c8cfd8');
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = Math.floor((x + camX) / 190) * 190 - camX; px < x + w; px += 190)
      if (px > x) hazardTape(ctx, px, y - 3, 60, 5);
    ctx.restore();
  },
  glassDeck(ctx, x, y, w, h, pal, t, camX) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(226,242,252,.95)'); g.addColorStop(0.35, 'rgba(160,200,222,.9)');
    g.addColorStop(1, 'rgba(96,140,168,.95)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 6, 0, '#f4fbff');
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = Math.floor((x + camX) / 96) * 96 - camX; px < x + w; px += 96) {
      if (px < x) continue;
      line(ctx, px, y, px, y + h, '#dfeef7', 3);
      line(ctx, px + 12, y + 8, px + 40, y + h * .8, '#ffffff', 2);
    }
    ctx.globalAlpha = .25;
    for (let i = 0; i < 3; i++) line(ctx, x, y + 22 + i * 26, x + w, y + 22 + i * 26, '#ffffff', 2);
    ctx.restore();
  },
  meadow(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#6b8a44'; ctx.fillRect(x, y + 10, w, h);
    ctx.fillStyle = '#8cc45c';
    ctx.beginPath(); ctx.moveTo(x, y + 16);
    for (let px = x; px <= x + w; px += 11) ctx.lineTo(px, y + 3 + Math.sin((px + camX) * 0.08) * 3);
    ctx.lineTo(x + w, y + 24); ctx.lineTo(x, y + 24); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = Math.floor((x + camX) / 15) * 15 - camX; px < x + w; px += 15)
      if (px > x) line(ctx, px, y + 10, px + 2, y - 6, '#a8dd7a', 2.2);
    /* petals lying where they fell */
    ctx.globalAlpha = .8;
    for (let px = Math.floor((x + camX) / 47) * 47 - camX; px < x + w; px += 47)
      if (px > x) fillEll(ctx, px, y + 12 + ((px | 0) % 9), 5, 3, ((px | 0) % 2) ? '#ffd6e4' : '#fff0f6');
    ctx.restore();
  },
  gravelPath(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#8a7f6c'; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 10, 0, '#b5a893');
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = Math.floor((x + camX) / 13) * 13 - camX; px < x + w; px += 13) {
      if (px < x) continue;
      circle(ctx, px, y + 4 + ((px | 0) % 6), 2.4, ((px | 0) % 3) ? '#d0c6b2' : '#9c9182');
    }
    ctx.globalAlpha = .3;
    for (let px = Math.floor((x + camX) / 210) * 210 - camX; px < x + w; px += 210)
      if (px > x) fillRR(ctx, px, y + 14, 120, 6, 3, '#6f6656');
    ctx.restore();
  },
  quarryStone(ctx, x, y, w, h, pal, t, camX) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e6e2d6'); g.addColorStop(1, '#a8a294');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 9, 0, '#f4f1e8');
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = Math.floor((x + camX) / 128) * 128 - camX; px < x + w; px += 128) {
      if (px < x) continue;
      line(ctx, px, y, px, y + h, '#8f8a7c', 2.4);
      line(ctx, px + 64, y + 26, px + 64, y + h, '#8f8a7c', 2);
    }
    for (let i = 0; i < 3; i++) line(ctx, x, y + 26 + i * 30, x + w, y + 26 + i * 30, '#8f8a7c', 2);
    ctx.globalAlpha = .35;
    for (let px = Math.floor((x + camX) / 34) * 34 - camX; px < x + w; px += 34)
      if (px > x) circle(ctx, px, y + 14 + ((px | 0) % 5), 2.2, '#f6f3ea');
    ctx.restore();
  },
  saltFloor(ctx, x, y, w, h, pal, t, camX) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#f2d6da'); g.addColorStop(1, '#a8848c');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, '#ffe4e6');
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = Math.floor((x + camX) / 62) * 62 - camX; px < x + w; px += 62) {
      if (px < x) continue;
      line(ctx, px, y + 6, px + 8, y + h, '#ffffff', 2);
      circle(ctx, px + 20, y + 15 + ((px | 0) % 7), 3, '#ffeef0');
    }
    /* the rails the ore carts run on */
    ctx.globalAlpha = .5;
    line(ctx, x, y + 30, x + w, y + 30, '#8b98a6', 3);
    line(ctx, x, y + 44, x + w, y + 44, '#8b98a6', 3);
    for (let px = Math.floor((x + camX) / 26) * 26 - camX; px < x + w; px += 26)
      if (px > x) line(ctx, px, y + 27, px, y + 47, '#6b5c4c', 4);
    ctx.restore();
  },
  plateFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#59636f'; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 9, 0, '#8b98a6');
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = Math.floor((x + camX) / 108) * 108 - camX; px < x + w; px += 108) {
      if (px < x) continue;
      line(ctx, px, y, px, y + h, '#3f4a58', 3);
      for (let k = 0; k < 4; k++) circle(ctx, px + 10, y + 16 + k * 18, 2.4, '#c8cfd8');
    }
    ctx.globalAlpha = .28;
    for (let px = Math.floor((x + camX) / 24) * 24 - camX; px < x + w; px += 24) {
      if (px < x) continue;
      line(ctx, px, y + 14, px + 12, y + 28, '#cfd8e0', 2);
      line(ctx, px + 7, y + 14, px + 19, y + 28, '#cfd8e0', 2);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .6;
    for (let px = Math.floor((x + camX) / 300) * 300 - camX; px < x + w; px += 300)
      if (px > x) hazardTape(ctx, px, y + 2, 110, 7);
    ctx.restore();
  },
  deckShip(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#3f4a58'; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, '#c8d4e0');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 46) * 46 - camX; px < x + w; px += 46)
      if (px > x) fillRR(ctx, px, y + 12, 28, 7, 3, '#8b98a6');
    ctx.globalAlpha = .35;
    for (let i = 0; i < 3; i++) line(ctx, x, y + 26 + i * 20, x + w, y + 26 + i * 20, '#2b3440', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .55;
    fillRR(ctx, x, y + 8, w, 3, 0, '#4fc3ea'); ctx.restore();
  },
  hullPlate(ctx, x, y, w, h, pal, t, camX) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e2e8ee'); g.addColorStop(1, '#8f9aa6');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 6, 0, '#f4f8fc');
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = Math.floor((x + camX) / 86) * 86 - camX; px < x + w; px += 86) {
      if (px < x) continue;
      line(ctx, px, y, px, y + h, '#7f8b99', 2.4);
      for (let k = 0; k < 5; k++) circle(ctx, px + 6, y + 12 + k * 15, 1.8, '#6f7c8a');
    }
    for (let i = 0; i < 3; i++) line(ctx, x, y + 24 + i * 24, x + w, y + 24 + i * 24, '#9aa6b2', 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 260) * 260 - camX; px < x + w; px += 260)
      if (px > x) fillRR(ctx, px, y + 6, 90, 8, 3, '#f0c23a');
    ctx.restore();
  },
  stationFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#b9c4d0'; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, '#eef2f6');
    ctx.save(); ctx.globalAlpha = .55;
    for (let px = Math.floor((x + camX) / 52) * 52 - camX; px < x + w; px += 52) {
      if (px < x) continue;
      fillRR(ctx, px + 4, y + 12, 40, 20, 4, '#cfd8e2');
      line(ctx, px, y, px, y + h, '#9aa6b2', 2);
    }
    ctx.globalAlpha = .7;
    for (let px = Math.floor((x + camX) / 156) * 156 - camX; px < x + w; px += 156)
      if (px > x) fillRR(ctx, px, y + 3, 70, 4, 2, '#4fc3ea');
    ctx.restore();
  },
  regolith(ctx, x, y, w, h, pal, t, camX) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#c8c2b4'); g.addColorStop(1, '#6f6a60');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#e2ddd0';
    ctx.beginPath(); ctx.moveTo(x, y + 14);
    for (let px = x; px <= x + w; px += 16) ctx.lineTo(px, y + 4 + Math.sin((px + camX) * 0.03) * 4);
    ctx.lineTo(x + w, y + 20); ctx.lineTo(x, y + 20); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = Math.floor((x + camX) / 40) * 40 - camX; px < x + w; px += 40) {
      if (px < x) continue;
      ctx.beginPath(); ctx.ellipse(px, y + 22 + ((px | 0) % 9), 13, 5, 0, 0, TAU);
      ctx.strokeStyle = '#9c968a'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.globalAlpha = .3;
    for (let px = Math.floor((x + camX) / 21) * 21 - camX; px < x + w; px += 21)
      if (px > x) circle(ctx, px, y + 12 + ((px | 0) % 5), 1.8, '#f2eee2');
    ctx.restore();
  },
  /* --- the second routes --- */
  ballastFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#4f4438'; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, '#8a6a45');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 70) * 70 - camX; px < x + w; px += 70) {
      if (px < x) continue;
      line(ctx, px, y, px, y + h, '#3a3226', 3);
      circle(ctx, px + 12, y + 16, 2.6, '#c8cfd8');
      circle(ctx, px + 12, y + 32, 2.6, '#c8cfd8');
    }
    ctx.restore();
  },
  cellarFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#4a4034'; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 9, 0, '#7f7462');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 46) * 46 - camX; px < x + w; px += 46) {
      if (px < x) continue;
      fillRR(ctx, px + 3, y + 3, 38, 14, 3, ((px | 0) % 3) ? '#8a7f6c' : '#736850');
    }
    ctx.globalAlpha = .3;
    for (let px = Math.floor((x + camX) / 23) * 23 - camX; px < x + w; px += 23)
      if (px > x) circle(ctx, px, y + 26 + ((px | 0) % 6), 2.2, '#3a3226');
    ctx.restore();
  },
  galleryFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#3f4a58'; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, '#7f8b99');
    ctx.save(); ctx.globalAlpha = .5;
    for (let px = Math.floor((x + camX) / 30) * 30 - camX; px < x + w; px += 30)
      if (px > x) fillRR(ctx, px, y + 10, 18, 6, 2, '#5f6c7a');
    ctx.globalAlpha = .4;
    for (let px = Math.floor((x + camX) / 190) * 190 - camX; px < x + w; px += 190)
      if (px > x) { line(ctx, px, y + 24, px + 90, y + 24, '#c8c2b4', 3); }
    ctx.restore();
  },
  bunkerFloor(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = '#2f3a48'; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, '#5f6c7a');
    ctx.save(); ctx.globalAlpha = .45;
    for (let px = Math.floor((x + camX) / 88) * 88 - camX; px < x + w; px += 88) {
      if (px < x) continue;
      line(ctx, px, y, px, y + h, '#1b2430', 3);
      hazardTape(ctx, px + 10, y + 14, 40, 6);
    }
    ctx.restore();
  }
});

/* the ripple of a warm updraught, drawn over everything in the orchard */
function PETAL_FG(ctx, VW, VH, camX, floorY, t) {
  ctx.save();
  for (let i = 0; i < 22; i++) {
    const r = makeRng(i * 59 + 7);
    const sp = 24 + r() * 40;
    const px = imod(i * 137 - camX * 0.55 - t * sp, VW + 120) - 60;
    const py = imod(r() * VH + t * (18 + r() * 22), VH + 80) - 40;
    ctx.globalAlpha = .35 + r() * .4;
    fillEll(ctx, px, py, 6, 3.4, r() > .4 ? '#ffd6e4' : '#fff4f8', t * (0.5 + r()) + i);
  }
  ctx.restore();
}

/* =============================================================
   THE THIRTEEN PLACES
============================================================= */
const SKY_PAL = { sky1: '#2f5a9c', sky2: '#7fb4dc', sky3: '#ffd0a8' };

const ZONES3 = [
  {
    /* ---- 1 · on top of the airship, at dawn, above the weather ---- */
    id: 'airspine', exit: 'hatchAir', name: 'Dirižablio nugara', sec: 11, diff: 0.2,
    sub: 'aukščiau už debesis, ant dirižablio nugaros', floor: 'envelope',
    pal: { floorTop: '#e6ecf2', floorBody: '#98a5b2', accent: '#e2453c',
           treadTop: '#c8cfd8', treadSide: '#8b98a6' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, '#2f5a9c', '#79b0da', '#ffd2a8');
      /* the sun still low, and the last stars in the top of the sky */
      BG3.stars(ctx, VW, VH, camX, t, 26, VH * 0.28);
      BG.sun(ctx, VW, VH, VW * 0.16, VH * 0.3, 34, '#ffe7b8');
      /* the cloud floor a very long way below — it has to sit well above the
         top of the hull or the whole point of being up here is invisible */
      BG3.cloudSea(ctx, VW, VH, camX, floorY - 120, t, '#cfe0f0', '#f4f8fc');
      /* two more airships of the same line, keeping station */
      ctx.save(); ctx.globalAlpha = .5;
      tileLayer(camX * 0.05, 900, VW, (x, i) => {
        const yy = VH * (0.2 + imod(i, 2) * 0.12) + Math.sin(t * 0.4 + i) * 6;
        const s = 0.5 + imod(i, 3) * 0.16;
        fillEll(ctx, x + 160, yy, 150 * s, 40 * s, '#c8d4e0');
        fillEll(ctx, x + 160, yy + 34 * s, 40 * s, 12 * s, '#96a2b0');
        poly(ctx, [[x + 300 * s + 100, yy - 26 * s], [x + 340 * s + 100, yy - 44 * s],
          [x + 336 * s + 100, yy - 4 * s]], '#c8d4e0');
      });
      ctx.restore();
      /* her own hull curving away in front of her and behind: the nose is
         one long swell of fabric, not a wall */
      ctx.save(); ctx.globalAlpha = .95;
      ctx.beginPath();
      ctx.moveTo(-40, VH + 40);
      ctx.quadraticCurveTo(VW * 0.5, floorY - 46, VW + 40, VH + 40);
      ctx.closePath();
      const hg = ctx.createLinearGradient(0, floorY - 60, 0, VH);
      hg.addColorStop(0, '#eef3f8'); hg.addColorStop(1, '#a8b4c0');
      ctx.fillStyle = hg; ctx.fill(); ctx.restore();
      /* the ribs of her, receding */
      ctx.save(); ctx.globalAlpha = .4;
      tileLayer(camX * 0.55, 120, VW, x => {
        ctx.beginPath();
        ctx.moveTo(x, VH); ctx.quadraticCurveTo(x + 20, floorY - 20, x + 46, floorY - 34);
        ctx.strokeStyle = '#8b98a6'; ctx.lineWidth = 3; ctx.stroke();
      });
      ctx.restore();
      /* the mooring lines running forward off the nose */
      ctx.save(); ctx.globalAlpha = .35;
      for (let i = 0; i < 3; i++)
        line(ctx, -20, floorY - 90 - i * 34, VW + 20, floorY - 150 - i * 26, '#c8cfd8', 2);
      ctx.restore();
    },
    pools: { hurdle: ['ventCowl', 'riggingCleat', 'antennaBox', 'sunPanel', 'airLamp'],
             over: ['guyWire'], tunnel: ['canvasSleeve'],
             ledge: ['catwalkA'], step: ['finA', 'sunPanel'],
             deco: ['seamA', 'rivets'] }
  },
  {
    /* ---- 2 · down inside her: the promenade salon ---- */
    id: 'airsalon', exit: 'gangway', name: 'Dirižablio salonas', sec: 10, diff: 0.34,
    sub: 'pro liuką žemyn — į dirižablio vidų', floor: 'cabinFloor', branch: 'ballast',
    pal: { floorTop: '#a8834f', floorBody: '#7a5c3a', accent: '#c9a86a',
           treadTop: '#c9a86a', treadSide: '#8a6a45', rail: '#c9a86a', post: '#8a6a45' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#e8dcc0'); g.addColorStop(1, '#cbb894');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      /* the ribs of the gondola, and between them the great windows */
      tileLayer(camX * 0.4, 300, VW, (x, i) => {
        const wx = x + 24, ww = 210, wy = floorY - 268, wh = 190;
        fillRR(ctx, wx - 10, wy - 10, ww + 20, wh + 20, 10, '#c9a86a');
        ctx.save();
        rr(ctx, wx, wy, ww, wh, 6); ctx.clip();
        const sg = ctx.createLinearGradient(0, wy, 0, wy + wh);
        sg.addColorStop(0, '#4f83c4'); sg.addColorStop(0.55, '#a8cbe8'); sg.addColorStop(1, '#eef4fa');
        ctx.fillStyle = sg; ctx.fillRect(wx, wy, ww, wh);
        ctx.translate(wx, 0);
        BG3.cloudSea(ctx, ww, wh + wy, camX * 0.14 + i * 120, wy + wh * 0.42, t, '#dfeaf4', '#ffffff');
        ctx.restore();
        ctx.save(); ctx.globalAlpha = .9;
        line(ctx, wx + ww / 2, wy + 3, wx + ww / 2, wy + wh - 3, '#c9a86a', 5);
        line(ctx, wx + 3, wy + wh * 0.5, wx + ww - 3, wy + wh * 0.5, '#c9a86a', 4);
        ctx.restore();
        /* a brass rail under the window, and a card table now and then */
        fillRR(ctx, wx - 14, wy + wh + 14, ww + 28, 7, 3, '#c9a86a');
        if (imod(i, 2) === 0) {
          fillRR(ctx, wx + 40, floorY - 66, 96, 9, 4, '#8a6a45');
          [wx + 48, wx + 128].forEach(px => line(ctx, px, floorY - 58, px, floorY - 6, '#7a5434', 5));
          fillEll(ctx, wx + 88, floorY - 72, 14, 8, '#e8dcc0');
        }
      });
      /* the deckhead: curved ribs and the little skylights between them */
      ctx.save(); ctx.globalAlpha = .95;
      fillRR(ctx, 0, 0, VW, 40, 0, '#dbcaa8');
      tileLayer(camX * 0.5, 150, VW, x => {
        ctx.beginPath();
        ctx.moveTo(x, 40); ctx.quadraticCurveTo(x + 34, 8, x + 68, 40);
        ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 5; ctx.stroke();
        ctx.save(); ctx.globalAlpha = .5;
        fillRR(ctx, x + 22, 12, 24, 12, 5, '#eef4fa'); ctx.restore();
      });
      ctx.restore();
      fillRR(ctx, 0, floorY - 18, VW, 20, 0, '#8a6a45');
    },
    pools: { hurdle: ['wickerChair', 'teaTrolley', 'globeStand', 'hatBoxes', 'brassFan'],
             over: ['lampRow'], tunnel: ['archSalon'],
             ledge: ['sideboardA'], step: ['divanA', 'pianoA'],
             deco: ['runnerRug', 'pawPrints'] }
  },
  {
    /* ---- 3 · off her and onto the mooring gantry of the sky tower ---- */
    id: 'mooring', exit: 'gantryGate', name: 'Švartavimo bokštas', sec: 10, diff: 0.44,
    sub: 'lieptu iš dirižablio ant dangaus bokšto', floor: 'steelGrate',
    pal: { floorTop: '#c8cfd8', floorBody: '#4a5764', accent: '#f0c23a',
           treadTop: '#96a2b0', treadSide: '#5f6c7a', rail: '#c8cfd8', post: '#7f8b99' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, '#3f74b4', '#8fc0e0', '#e8f0f8');
      BG.sun(ctx, VW, VH, VW * 0.8, VH * 0.2, 30, '#fff0c8');
      BG3.cloudSea(ctx, VW, VH, camX, floorY - 60, t, '#d8e6f2', '#ffffff');
      /* the mast itself: it comes up out of the cloud, past the gantry she is
         standing on, and goes on up out of the top of the picture */
      ctx.save(); ctx.globalAlpha = .95;
      const tw = 210, tx = VW * 0.5 - imod(camX * 0.12, 1500);
      [tx, tx + 1500].forEach(px => {
        ctx.save(); ctx.globalAlpha = .35;
        ctx.fillStyle = '#7f8b99'; ctx.fillRect(px + 8, 0, tw - 16, VH); ctx.restore();
        for (let k = 0; k < 4; k++) {
          const lx = px + 12 + k * ((tw - 24) / 3);
          fillRR(ctx, lx - 7, 0, 14, VH, 3, k % 2 ? '#96a2b0' : '#c8cfd8');
        }
        ctx.save(); ctx.globalAlpha = .55;
        for (let k = -2; k < 9; k++) {
          const yy = floorY - 260 + k * 62;
          line(ctx, px + 10, yy, px + tw - 10, yy + 30, '#6f7c8a', 4);
          line(ctx, px + tw - 10, yy, px + 10, yy + 30, '#6f7c8a', 4);
          line(ctx, px + 6, yy, px + tw - 6, yy, '#8b98a6', 5);
        }
        ctx.restore();
        /* the collar the airship is actually moored to */
        fillRR(ctx, px - 30, floorY - 236, tw + 60, 26, 6, '#f0c23a');
        ctx.save(); ctx.globalAlpha = .6;
        hazardTape(ctx, px - 24, floorY - 230, tw + 48, 12); ctx.restore();
      });
      ctx.restore();
      /* the airship she has just walked off, moored to the mast behind her */
      ctx.save(); ctx.globalAlpha = .9;
      const ax = VW * 0.1 - imod(camX * 0.3, 2600);
      [ax, ax + 2600].forEach(px => {
        fillEll(ctx, px, floorY - 210, 300, 76, '#dfe6ee');
        ctx.save(); ctx.globalAlpha = .55;
        fillEll(ctx, px, floorY - 178, 240, 34, '#b0bcc8'); ctx.restore();
        fillRR(ctx, px - 60, floorY - 152, 130, 34, 12, '#96a2b0');
        poly(ctx, [[px + 274, floorY - 232], [px + 350, floorY - 268], [px + 344, floorY - 190]], '#dfe6ee');
        line(ctx, px + 300, floorY - 210, px + 470, floorY - 96, '#c8cfd8', 3);
      });
      ctx.restore();
      /* the crane that stands on the gantry, its jib over her head */
      ctx.save(); ctx.globalAlpha = .85;
      tileLayer(camX * 0.62, 680, VW, x => {
        fillRR(ctx, x, floorY - 300, 26, 300, 4, '#f0c23a');
        ctx.save(); ctx.globalAlpha = .5;
        for (let k = 0; k < 8; k++) {
          line(ctx, x, floorY - 292 + k * 36, x + 26, floorY - 268 + k * 36, '#a8862c', 2.4);
          line(ctx, x + 26, floorY - 292 + k * 36, x, floorY - 268 + k * 36, '#a8862c', 2.4);
        }
        ctx.restore();
        fillRR(ctx, x - 130, floorY - 316, 300, 18, 4, '#f0c23a');
      });
      ctx.restore();
    },
    pools: { hurdle: ['toolChest', 'cableDrum', 'sandbagM', 'beaconM', 'windSock'],
             over: ['craneJib'], tunnel: ['gantryArch'],
             ledge: ['gantryLedge'], step: ['cableDrum', 'crateM'],
             deco: ['boltPlate', 'oilStain'] }
  },
  {
    /* ---- 4 · down the tower's terraces, straight through the clouds ----
       Nothing here can be failed: the flight of glass steps is run, not
       jumped, and it is what takes her out of the sky and onto the ground. */
    id: 'terrace', name: 'Bokšto terasos', sec: 11, diff: 0.54, floor: 'glassDeck',
    sub: 'stiklinėmis pakopomis žemyn, pro debesų sluoksnį',
    exit: 'towerDoor', stairsDown: 9, stairProp: 'treadGlass', stairSign: 'downSign',
    pal: { floorTop: '#f4fbff', floorBody: '#6f9cb8', accent: '#4fc3ea',
           treadTop: '#e2f2fc', treadSide: '#9fc4dc', rail: '#dfeef7', post: '#96a2b0' },
    bg(ctx, VW, VH, camX, floorY, t, pal, baseY) {
      /* how far she has already come down decides what the sky is doing:
         high up it is blue, at the bottom the ground is showing through */
      const deep = clamp(1 - ((baseY || 0) + 400) / 400, 0, 1);
      BG.sky(ctx, VW, VH, mixHex('#4f8cc8', '#9fcfe8', deep), mixHex('#a8d4ec', '#dff0f8', deep), '#eef6fc');
      /* the cloud layer she is passing through */
      ctx.save(); ctx.globalAlpha = .9 - deep * 0.45;
      BG3.cloudSea(ctx, VW, VH, camX, floorY - 210 + deep * 300, t, '#e6f0f8', '#ffffff');
      ctx.restore();
      /* and the ground, a long way down, coming up to meet her */
      ctx.save(); ctx.globalAlpha = deep;
      BG.hills(ctx, VW, VH, camX * 0.06, floorY + 130, '#7fa87c', 40, 420);
      BG.hills(ctx, VW, VH, camX * 0.11, floorY + 200, '#8fc48c', 30, 280);
      ctx.restore();
      /* the tower's own glass wall on her left, terrace after terrace */
      ctx.save(); ctx.globalAlpha = .95;
      tileLayer(camX * 0.28, 240, VW, (x, i) => {
        const wg = ctx.createLinearGradient(x, floorY - 300, x, floorY + 60);
        wg.addColorStop(0, 'rgba(210,236,250,.85)'); wg.addColorStop(1, 'rgba(140,186,212,.9)');
        ctx.fillStyle = wg; ctx.fillRect(x, floorY - 300, 190, 360);
        ctx.save(); ctx.globalAlpha = .55;
        for (let k = 0; k < 4; k++) line(ctx, x + 18 + k * 46, floorY - 300, x + 18 + k * 46, floorY + 60, '#eef7fc', 4);
        for (let k = 0; k < 4; k++) line(ctx, x, floorY - 280 + k * 72, x + 190, floorY - 280 + k * 72, '#eef7fc', 3);
        ctx.globalAlpha = .3;
        line(ctx, x + 22, floorY - 286, x + 96, floorY + 40, '#ffffff', 8);
        ctx.restore();
        fillRR(ctx, x - 8, floorY - 306, 206, 14, 4, '#c8d4e0');
        if (imod(i, 2)) {
          /* a planted terrace one level up */
          fillRR(ctx, x + 26, floorY - 322, 140, 18, 5, '#e8e2d4');
          for (let k = 0; k < 4; k++) leafy(ctx, x + 44 + k * 34, floorY - 326, 17, 12, '#4caf6d', '#7fd493', k + i);
        }
      });
      ctx.restore();
      /* the balustrade on the open side, with the drop past it */
      ctx.save(); ctx.globalAlpha = .8;
      fillRR(ctx, 0, floorY + 40, VW, 8, 0, '#dfeef7');
      tileLayer(camX * 0.9, 70, VW, x => line(ctx, x, floorY + 44, x, floorY + 92, '#c8d8e4', 4));
      ctx.restore();
    },
    pools: { hurdle: ['planterT', 'deckLamp', 'tableT', 'umbrellaT', 'aerialT'],
             over: ['awningT'], tunnel: ['glassArch'],
             ledge: ['benchT'], step: ['planterT', 'tableT'],
             deco: ['tilePat', 'pawPrints'] }
  },
  {
    /* ---- 5 · the ground at last: the orchard the tower stands in ---- */
    id: 'orchard', name: 'Žydintis sodas', sec: 11, diff: 0.62, floor: 'meadow', calm: 1,
    sub: 'pagaliau žemė — bokšto papėdėje žydi vyšnios', exit: 'greenDoor',
    pal: { floorTop: '#8cc45c', floorBody: '#6b8a44', accent: '#ffd6e4',
           treadTop: '#8cc45c', treadSide: '#6b8a44' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#8fc8ea'); g.addColorStop(0.55, '#cfe8f4'); g.addColorStop(1, '#f0f4dc');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      BG.clouds(ctx, VW, VH, camX * 0.04, t, 'rgba(255,255,255,.85)', 40, 1.05);
      /* the sky tower she has just come down, standing over the whole orchard */
      ctx.save(); ctx.globalAlpha = .55;
      const tx = VW * 0.66 - imod(camX * 0.045, 2600);
      [tx, tx + 2600].forEach(px => {
        ctx.beginPath();
        ctx.moveTo(px - 54, floorY - 40); ctx.lineTo(px - 22, 10);
        ctx.lineTo(px + 22, 10); ctx.lineTo(px + 54, floorY - 40); ctx.closePath();
        ctx.fillStyle = '#b8c8d4'; ctx.fill();
        ctx.save(); ctx.globalAlpha = .5;
        for (let k = 0; k < 9; k++) line(ctx, px - 50 + k * 3, floorY - 46 - k * 32, px + 50 - k * 3, floorY - 46 - k * 32, '#8b98a6', 3);
        ctx.restore();
        fillRR(ctx, px - 40, 0, 80, 16, 4, '#96a2b0');
      });
      ctx.restore();
      /* rows of trees in blossom, three deep */
      ctx.save(); ctx.globalAlpha = .55;
      tileLayer(camX * 0.13, 170, VW, (x, i) => {
        const r = makeRng(i * 37 + 5);
        fillRR(ctx, x - 6, floorY - 128, 13, 128, 4, '#8a6a52');
        leafy(ctx, x, floorY - 150, 54 + r() * 14, 44, '#f2c8d8', '#ffe0ea', i * 3);
      });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .8;
      tileLayer(camX * 0.28, 210, VW, (x, i) => {
        const r = makeRng(i * 53 + 11);
        fillRR(ctx, x - 9, floorY - 168, 19, 168, 5, '#6b4a2c');
        for (let k = 0; k < 3; k++)
          line(ctx, x, floorY - 130, x + (k - 1) * 42, floorY - 176, '#6b4a2c', 6);
        leafy(ctx, x, floorY - 196, 66 + r() * 18, 52, '#ffd6e4', '#fff0f6', i * 7);
        leafy(ctx, x - 46, floorY - 168, 40, 32, '#ffd6e4', '#ffeaf2', i * 11);
        leafy(ctx, x + 46, floorY - 172, 40, 32, '#f6c8dc', '#fff0f6', i * 13);
      });
      ctx.restore();
      /* beehives and a ladder or two along the far edge of the grass */
      ctx.save(); ctx.globalAlpha = .7;
      tileLayer(camX * 0.42, 460, VW, (x, i) => {
        if (imod(i, 2)) {
          for (let k = 0; k < 3; k++)
            fillRR(ctx, x + 10, floorY - 74 + k * 22, 52, 20, 4, k % 2 ? '#f0e0b8' : '#e6d2a0');
          fillRR(ctx, x + 6, floorY - 82, 60, 12, 3, '#8a6a45');
        } else {
          ctx.save(); ctx.translate(x + 40, floorY); ctx.rotate(-0.3);
          line(ctx, -14, 0, -14, -130, '#c9a86a', 6);
          line(ctx, 14, 0, 14, -130, '#c9a86a', 6);
          for (let k = 1; k < 6; k++) line(ctx, -14, -22 * k, 14, -22 * k, '#b8955c', 4);
          ctx.restore();
        }
      });
      ctx.restore();
    },
    fg(ctx, VW, VH, camX, floorY, t) { PETAL_FG(ctx, VW, VH, camX, floorY, t); },
    pools: { hurdle: ['beehive', 'ladderO', 'barrowO', 'cratesO', 'treeStumpO'],
             over: ['blossomBough'], tunnel: ['blossomTunnel'],
             ledge: ['wallO'], step: ['cratesO', 'wallO'],
             deco: ['petalDeco', 'grassTuft'] }
  },
  {
    /* ---- 6 · the long glasshouses behind the orchard ---- */
    id: 'greenhouse', name: 'Šiltnamiai', sec: 10, diff: 0.7, floor: 'gravelPath',
    sub: 'to paties sodo šiltnamiai', exit: 'fieldGate', branch: 'seedcellar',
    pal: { floorTop: '#b5a893', floorBody: '#8a7f6c', accent: '#4caf6d',
           treadTop: '#b5a893', treadSide: '#8a7f6c', rail: '#8a7f6c', post: '#6f6656' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#cfe8ea'); g.addColorStop(1, '#e8f0dc');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      /* the roof: bay after bay of glass, with the sun coming through it */
      ctx.save();
      tileLayer(camX * 0.45, 200, VW, (x, i) => {
        ctx.beginPath();
        ctx.moveTo(x, 96); ctx.lineTo(x + 100, 16); ctx.lineTo(x + 200, 96);
        ctx.lineTo(x + 200, 116); ctx.lineTo(x, 116); ctx.closePath();
        ctx.fillStyle = 'rgba(214,238,240,.85)'; ctx.fill();
        ctx.save(); ctx.globalAlpha = .6;
        line(ctx, x, 96, x + 100, 16, '#9cb2a8', 4);
        line(ctx, x + 100, 16, x + 200, 96, '#9cb2a8', 4);
        line(ctx, x + 100, 16, x + 100, 116, '#9cb2a8', 3);
        ctx.restore();
        /* one pane hinged open, and the light falling through the gap */
        if (imod(i, 3) === 1) {
          ctx.save(); ctx.globalAlpha = .8;
          poly(ctx, [[x + 108, 26], [x + 176, 78], [x + 172, 92], [x + 104, 40]], '#f2fbfc');
          ctx.globalAlpha = .16;
          poly(ctx, [[x + 110, 30], [x + 176, 82], [x + 250, floorY], [x + 150, floorY]], '#fff6c4');
          ctx.restore();
        }
      });
      ctx.restore();
      /* the ridge beam and the ties under it */
      fillRR(ctx, 0, 112, VW, 12, 0, '#8a7f6c');
      ctx.save(); ctx.globalAlpha = .5;
      tileLayer(camX * 0.45, 100, VW, x => line(ctx, x, 124, x, 168, '#8a7f6c', 4));
      ctx.restore();
      /* the far side of the house: staging, benches, a wall of green */
      tileLayer(camX * 0.2, 260, VW, (x, i) => {
        const k = imod(i, 3);
        ctx.save(); ctx.globalAlpha = .85;
        if (k === 0) {
          fillRR(ctx, x, floorY - 128, 230, 14, 4, '#8a6a45');
          [x + 14, x + 202].forEach(px => fillRR(ctx, px, floorY - 116, 12, 116, 3, '#7a5c3a'));
          for (let q = 0; q < 6; q++) {
            fillRR(ctx, x + 16 + q * 34, floorY - 152, 26, 24, 4, '#d2764a');
            leafy(ctx, x + 29 + q * 34, floorY - 156, 17, 12, '#4caf6d', '#7fd493', q + i);
          }
        } else if (k === 1) {
          /* tomatoes up strings */
          for (let q = 0; q < 7; q++) {
            const px = x + 14 + q * 32;
            line(ctx, px, floorY - 4, px, floorY - 210, '#b8ad98', 2);
            for (let m = 0; m < 5; m++) leafy(ctx, px + (m % 2 ? 8 : -8), floorY - 30 - m * 36, 15, 11, '#3f8a5c', '#5fbf7a', q * 3 + m);
            for (let m = 0; m < 2; m++) circle(ctx, px + 5, floorY - 60 - m * 62, 5, '#e2453c');
          }
        } else {
          /* a water tank, and a wall of ferns */
          fillRR(ctx, x + 20, floorY - 170, 120, 170, 8, '#5f7c6c');
          ctx.save(); ctx.globalAlpha = .5;
          fillRR(ctx, x + 30, floorY - 158, 20, 146, 6, '#8fb8a4'); ctx.restore();
          fillRR(ctx, x + 12, floorY - 182, 136, 16, 4, '#4f6b5c');
          for (let q = 0; q < 5; q++) leafy(ctx, x + 168 + (q % 2) * 30, floorY - 30 - q * 34, 30, 20, '#3f8a5c', '#5fbf7a', q + i);
        }
        ctx.restore();
      });
      /* the pipes running the length of the house at knee height */
      ctx.save(); ctx.globalAlpha = .55;
      fillRR(ctx, 0, floorY - 34, VW, 9, 4, '#96a2b0');
      tileLayer(camX * 0.2, 140, VW, x => fillRR(ctx, x, floorY - 38, 10, 38, 3, '#7f8b99'));
      ctx.restore();
    },
    pools: { hurdle: ['seedTray', 'wateringCan', 'potStack', 'hoseCoil', 'sackG'],
             over: ['hangBasket'], tunnel: ['vineTunnel'],
             ledge: ['potBench'], step: ['raisedBed', 'potBench'],
             deco: ['leafDeco', 'spillDeco'] }
  },
  {
    /* ---- 7 · the marble quarry, cut in white benches out of the hill ---- */
    id: 'quarry', name: 'Marmuro karjeras', sec: 28, diff: 0.78, floor: 'quarryStone',
    sub: 'už šiltnamių prasideda baltas marmuro karjeras',
    exit: 'quarryRamp', branch: 'conveyor',
    pal: { floorTop: '#f4f1e8', floorBody: '#a8a294', accent: '#f0c23a',
           treadTop: '#eae6da', treadSide: '#b8b2a2', rail: '#96a2b0', post: '#7f8b99' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, '#6fa8d8', '#bcd8ea', '#eae4d2');
      BG.clouds(ctx, VW, VH, camX * 0.04, t, 'rgba(255,255,255,.8)', 42, 0.95);
      /* the far wall of the quarry: bench above bench of cut stone */
      ctx.save();
      for (let row = 0; row < 5; row++) {
        const f = row / 4;
        const yy = floorY - 300 + row * 62;
        ctx.globalAlpha = .7 + f * .3;
        ctx.fillStyle = mixHex('#9c9585', '#e8e2d2', f);
        ctx.beginPath(); ctx.moveTo(0, yy);
        for (let px = 0; px <= VW; px += 40) {
          const w0 = (px + camX * (0.08 + f * 0.05)) / 260;
          ctx.lineTo(px, yy + Math.sin(w0) * 9 + Math.sin(w0 * 2.7) * 5);
        }
        ctx.lineTo(VW, yy + 60); ctx.lineTo(0, yy + 60); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.globalAlpha = .3;
        tileLayer(camX * (0.08 + f * 0.05), 120, VW, x => line(ctx, x, yy + 4, x, yy + 58, '#a8a294', 2.4));
        ctx.restore();
      }
      ctx.restore();
      /* the cuts still open in the face, and the saw wires in them */
      ctx.save(); ctx.globalAlpha = .55;
      tileLayer(camX * 0.13, 520, VW, (x, i) => {
        fillRR(ctx, x, floorY - 262, 96, 200, 3, '#b8b2a2');
        ctx.save(); ctx.globalAlpha = .7;
        line(ctx, x + 8, floorY - 262, x + 8, floorY - 62, '#8f8a7c', 3);
        line(ctx, x + 88, floorY - 262, x + 88, floorY - 62, '#8f8a7c', 3);
        ctx.restore();
        if (imod(i, 2)) {
          line(ctx, x - 30, floorY - 280, x + 130, floorY - 250, '#f0c23a', 3);
          circle(ctx, x + 130, floorY - 250, 6, '#e2453c');
        }
      });
      ctx.restore();
      /* the machines on the benches: a gantry crane and a stack of blocks */
      ctx.save(); ctx.globalAlpha = .8;
      tileLayer(camX * 0.34, 620, VW, (x, i) => {
        if (imod(i, 2) === 0) {
          fillRR(ctx, x, floorY - 200, 22, 140, 3, '#f0c23a');
          fillRR(ctx, x + 220, floorY - 200, 22, 140, 3, '#f0c23a');
          fillRR(ctx, x - 14, floorY - 216, 270, 18, 4, '#f0c23a');
          line(ctx, x + 118, floorY - 198, x + 118, floorY - 120, '#5f6c7a', 3);
          fillRR(ctx, x + 96, floorY - 122, 46, 34, 4, '#e6e2d6');
        } else {
          for (let q = 0; q < 6; q++)
            fillRR(ctx, x + 20 + (q % 3) * 74, floorY - 68 - Math.floor(q / 3) * 50, 70, 46, 3,
              q % 2 ? '#eae6da' : '#dcd6c8');
        }
      });
      ctx.restore();
      /* dust hanging in the sun over the whole place */
      ctx.save(); ctx.globalAlpha = .12;
      for (let i = 0; i < 7; i++) {
        const r = makeRng(i * 47 + 3);
        fillEll(ctx, imod(i * 220 - camX * 0.2, VW + 200) - 100,
          floorY - 60 - r() * 180 + Math.sin(t * .4 + i) * 10, 90 + r() * 60, 26, '#fff8e8');
      }
      ctx.restore();
    },
    pools: { hurdle: ['blockQ', 'drumQ', 'sawQ', 'coneQ', 'bucketQ'],
             over: ['chuteQ'], tunnel: ['archQ'],
             ledge: ['benchQ'], step: ['blockQ', 'stepQ'],
             deco: ['dustQ', 'trackQ'] }
  },
  {
    /* ---- 8 · the mine head at the foot of the quarry: this is where a
       jetpack ride comes back down, so its mouth is deliberately open ---- */
    id: 'minehead', name: 'Kasyklos aikštelė', sec: 14, diff: 0.8, floor: 'gravelPath',
    sub: 'karjero papėdė: kopimo bokštas ir kasyklos anga',
    exit: 'aditMouth', jetLand: 1,
    pal: { floorTop: '#b5a893', floorBody: '#8a7f6c', accent: '#e2453c',
           treadTop: '#b5a893', treadSide: '#8a7f6c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG.sky(ctx, VW, VH, '#7fb0d8', '#c8dcea', '#e8dcc8');
      BG.clouds(ctx, VW, VH, camX * 0.04, t, 'rgba(255,255,255,.78)', 44, 1);
      /* the white face of the quarry she has just come off, behind everything */
      ctx.save(); ctx.globalAlpha = .5;
      BG.hills(ctx, VW, VH, camX * 0.07, floorY - 232, '#dcd6c8', 44, 460);
      ctx.globalAlpha = .65;
      BG.hills(ctx, VW, VH, camX * 0.12, floorY - 176, '#c2bcac', 32, 300);
      ctx.restore();
      /* the winding tower over the shaft, and the sheds round its feet */
      ctx.save(); ctx.globalAlpha = .92;
      tileLayer(camX * 0.24, 760, VW, (x, i) => {
        const bx = x + 60;
        /* the headframe: four legs, a wheel at the top */
        ctx.save(); ctx.globalAlpha = .95;
        line(ctx, bx - 46, floorY, bx - 12, floorY - 250, '#6b5c4c', 8);
        line(ctx, bx + 46, floorY, bx + 12, floorY - 250, '#6b5c4c', 8);
        line(ctx, bx + 120, floorY, bx + 26, floorY - 232, '#6b5c4c', 7);
        for (let k = 1; k < 6; k++) {
          const f = k / 6;
          line(ctx, bx - 46 + 34 * f, floorY - 250 * f, bx + 46 - 34 * f, floorY - 250 * f, '#7a6a56', 4);
        }
        const wa = t * 0.7 + i;
        ctx.save(); ctx.translate(bx, floorY - 262); ctx.rotate(wa);
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU);
        ctx.strokeStyle = '#96a2b0'; ctx.lineWidth = 7; ctx.stroke();
        for (let k = 0; k < 6; k++) {
          const a = k * TAU / 6;
          line(ctx, 0, 0, Math.cos(a) * 30, Math.sin(a) * 30, '#7f8b99', 3);
        }
        ctx.restore();
        line(ctx, bx, floorY - 232, bx, floorY - 40, '#5f6c7a', 3);
        ctx.restore();
        /* a shed with a corrugated roof, and the spoil heap behind it */
        fillRR(ctx, bx + 150, floorY - 96, 190, 96, 4, '#a8724c');
        fillRR(ctx, bx + 140, floorY - 108, 210, 16, 4, '#8b98a6');
        ctx.save(); ctx.globalAlpha = .5;
        for (let k = 0; k < 9; k++) line(ctx, bx + 146 + k * 23, floorY - 108, bx + 146 + k * 23, floorY - 92, '#5f6c7a', 2);
        for (let k = 0; k < 3; k++) fillRR(ctx, bx + 170 + k * 60, floorY - 76, 40, 34, 3, '#6f4a30');
        ctx.restore();
        ctx.save(); ctx.globalAlpha = .8;
        ctx.beginPath();
        ctx.moveTo(bx + 360, floorY);
        ctx.quadraticCurveTo(bx + 450, floorY - 92, bx + 560, floorY);
        ctx.closePath(); ctx.fillStyle = '#b8ac96'; ctx.fill(); ctx.restore();
      });
      ctx.restore();
      /* the mouth of the adit, dead ahead, waiting */
      ctx.save(); ctx.globalAlpha = .9;
      tileLayer(camX * 0.5, 1500, VW, x => {
        ctx.beginPath();
        ctx.moveTo(x + 900, floorY); ctx.lineTo(x + 900, floorY - 92);
        ctx.quadraticCurveTo(x + 966, floorY - 168, x + 1032, floorY - 92);
        ctx.lineTo(x + 1032, floorY); ctx.closePath();
        ctx.fillStyle = '#3a2f26'; ctx.fill();
        ctx.save(); ctx.globalAlpha = .5;
        fillRR(ctx, x + 888, floorY - 178, 156, 22, 5, '#8a6a45'); ctx.restore();
      });
      ctx.restore();
    },
    pools: { hurdle: ['oreCart', 'spoilPile', 'drumQ', 'crateM', 'coneQ'],
             over: ['chuteQ'], tunnel: ['archQ'],
             ledge: ['benchQ'], step: ['blockQ', 'crateM'],
             deco: ['trackQ', 'dustQ'] }
  },
  {
    /* ---- 9 · in under the hill: the salt mine ---- */
    id: 'saltmine', name: 'Druskos kasykla', sec: 11, diff: 0.84, floor: 'saltFloor', calm: 1,
    sub: 'į kalno vidų — dabar jau po žeme', exit: 'blastDoor',
    pal: { floorTop: '#ffe4e6', floorBody: '#a8848c', accent: '#f6d0d4',
           treadTop: '#f6d0d4', treadSide: '#a8848c', rail: '#8a6a45', post: '#6b5c4c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#3a2830'); g.addColorStop(0.5, '#6b4550'); g.addColorStop(1, '#a8747e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      /* the far wall: bedded salt, banded pink and white */
      ctx.save();
      for (let row = 0; row < 6; row++) {
        const f = row / 5;
        ctx.globalAlpha = .35 + f * .4;
        ctx.fillStyle = mixHex('#6b4550', '#f2d0d6', f * 0.9);
        ctx.beginPath(); ctx.moveTo(0, floorY - 250 + row * 46);
        for (let px = 0; px <= VW; px += 30) {
          const w0 = (px + camX * (0.1 + f * 0.08)) / 190;
          ctx.lineTo(px, floorY - 250 + row * 46 + Math.sin(w0) * 11 + Math.sin(w0 * 2.3) * 5);
        }
        ctx.lineTo(VW, floorY + 40); ctx.lineTo(0, floorY + 40); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      /* the roof, held up on timber sets, dripping salt */
      BG3.roof(ctx, VW, VH, camX, 68, '#2f2028', '#e8bcc4', 60);
      ctx.save(); ctx.globalAlpha = .9;
      tileLayer(camX * 0.55, 190, VW, x => {
        fillRR(ctx, x, 82, 15, floorY - 82, 3, '#7a5c3a');
        fillRR(ctx, x + 150, 82, 15, floorY - 82, 3, '#6b5030');
        fillRR(ctx, x - 8, 70, 190, 16, 3, '#8a6a45');
      });
      ctx.restore();
      /* the miner's lamps strung down the gallery, and what they light */
      tileLayer(camX * 0.55, 190, VW, (x, i) => {
        const on = .55 + Math.sin(t * 1.8 + i) * .18;
        ctx.save(); ctx.globalAlpha = on * .35;
        circle(ctx, x + 82, 108, 66, '#ffd0b8'); ctx.restore();
        line(ctx, x + 82, 86, x + 82, 100, '#5f5448', 3);
        circle(ctx, x + 82, 106, 8, '#fff3c4');
        ctx.save(); ctx.globalAlpha = .35;
        for (let k = 0; k < 3; k++)
          fillEll(ctx, x + 40 + k * 44, floorY - 132 - (k % 2) * 40, 26, 34, '#f2d0d6');
        ctx.restore();
      });
      /* a still pool of brine along the far side, holding the lamps */
      ctx.save(); ctx.globalAlpha = .5;
      fillRR(ctx, 0, floorY - 30, VW, 30, 0, '#c98a96');
      for (let i = 0; i < 5; i++) {
        const px = imod(i * 260 - camX * 0.55, VW + 200) - 100;
        ctx.globalAlpha = .3 + Math.sin(t * 1.4 + i) * .1;
        fillEll(ctx, px, floorY - 16, 40, 5, '#ffe4e6');
      }
      ctx.restore();
    },
    pools: { hurdle: ['saltBlock', 'oreCart', 'propTimber', 'lampMine', 'barrelMine'],
             over: ['beamMine'], tunnel: ['tunnelMine'],
             ledge: ['ledgeMine'], step: ['saltBlock', 'oreCart'],
             deco: ['saltDeco', 'railDeco'] }
  },
  {
    /* ---- 10 · the gallery opens into a silo, and the rocket is standing
       in it. The gantry stairs up to the hatch are run, never jumped ---- */
    id: 'silo', exit: 'rocketHatch', name: 'Raketos šachta', sec: 10, diff: 0.86,
    sub: 'kasyklos galerija atsiveria į raketos šachtą',
    floor: 'plateFloor', stairsUp: 5, stairProp: 'treadSteel', stairSign: 'upSign',
    pal: { floorTop: '#8b98a6', floorBody: '#59636f', accent: '#f0c23a',
           treadTop: '#96a2b0', treadSide: '#5f6c7a', rail: '#c8cfd8', post: '#7f8b99' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG3.techWall(ctx, VW, VH, camX, floorY, '#2b3440', '#4a5764', '#4fc3ea', 260);
      /* the rocket herself, filling the middle of the shaft */
      ctx.save(); ctx.globalAlpha = .96;
      const rx = VW * 0.62 - imod(camX * 0.2, 2200);
      [rx, rx + 2200].forEach(px => {
        const bw = 150;
        const rg = ctx.createLinearGradient(px - bw / 2, 0, px + bw / 2, 0);
        rg.addColorStop(0, '#9aa6b2'); rg.addColorStop(.38, '#f4f8fc'); rg.addColorStop(1, '#8f9aa6');
        ctx.fillStyle = rg; ctx.fillRect(px - bw / 2, -60, bw, floorY + 20);
        ctx.beginPath();
        ctx.moveTo(px - bw / 2, 40); ctx.quadraticCurveTo(px, -140, px + bw / 2, 40);
        ctx.closePath(); ctx.fillStyle = '#e8eef4'; ctx.fill();
        ctx.save(); ctx.globalAlpha = .85;
        fillRR(ctx, px - bw / 2, floorY - 300, bw, 26, 0, '#e2453c');
        fillRR(ctx, px - bw / 2, floorY - 160, bw, 18, 0, '#2f6b9c');
        ctx.restore();
        ctx.fillStyle = '#2b3440'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.save(); ctx.translate(px, floorY - 220); ctx.fillText('LOTA', 0, 0); ctx.restore();
        /* fins at her foot */
        poly(ctx, [[px - bw / 2, floorY - 40], [px - bw / 2 - 46, floorY + 20], [px - bw / 2, floorY + 20]], '#c8cfd8');
        poly(ctx, [[px + bw / 2, floorY - 40], [px + bw / 2 + 46, floorY + 20], [px + bw / 2, floorY + 20]], '#c8cfd8');
        /* the swing arm reaching out to her from the gantry */
        fillRR(ctx, px - bw / 2 - 150, floorY - 268, 150, 15, 4, '#f0c23a');
        fillRR(ctx, px - bw / 2 - 158, floorY - 300, 22, 300, 4, '#96a2b0');
      });
      ctx.restore();
      /* steam blowing off her, and the lights of the shaft going up forever */
      ctx.save(); ctx.globalAlpha = .3;
      for (let i = 0; i < 8; i++) {
        const ph = ((t * .3) + i * .13) % 1;
        fillEll(ctx, imod(i * 190 - camX * 0.2, VW + 200) - 100 + Math.sin(ph * 5) * 20,
          floorY - 40 - ph * 240, 44 + ph * 60, 22 + ph * 26, '#eef6fc');
      }
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .7;
      tileLayer(camX * 0.66, 140, VW, (x, i) => {
        const on = imod(i + Math.floor(t * 2), 4) === 0;
        circle(ctx, x, 26, 5, on ? '#f0c23a' : '#5f6c7a');
      });
      ctx.restore();
    },
    pools: { hurdle: ['fuelDrum', 'toolCrate', 'coolPipe', 'conePart', 'robotArm'],
             over: ['ductSilo'], tunnel: ['gantryTunnel'],
             ledge: ['gantryLedge2'], step: ['fuelDrum', 'toolCrate'],
             deco: ['gridDeco', 'warnStripe'] }
  },
  {
    /* ---- 11 · inside the rocket, going up ---- */
    id: 'rocket', exit: 'airlock', name: 'Raketos viduje', sec: 9, diff: 0.88,
    sub: 'startas! pro langus žemė tolsta', launch: 1, floor: 'deckShip',
    pal: { floorTop: '#c8d4e0', floorBody: '#3f4a58', accent: '#4fc3ea',
           treadTop: '#c8d4e0', treadSide: '#7f8b99' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      /* How far up the rocket already is. Everything through the ports hangs
         off this: at the bottom of the place it is still daylight outside, by
         the top of it there is nothing but stars. That is what says the rocket
         is going somewhere while she runs along inside it. */
      const sp = this.span || { x0: camX, x1: camX + 6000 };
      const up = clamp((camX + VW * 0.4 - sp.x0) / Math.max(1, sp.x1 - sp.x0), 0, 1);
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, mixHex('#25303c', '#12161f', up)); g.addColorStop(1, mixHex('#516070', '#2b3440', up));
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      /* the curve of the hull: ribs, and the ports between them */
      tileLayer(camX * 0.4, 240, VW, (x, i) => {
        ctx.save(); ctx.globalAlpha = .95;
        ctx.beginPath();
        ctx.moveTo(x, floorY); ctx.lineTo(x, 66);
        ctx.quadraticCurveTo(x + 100, 14, x + 200, 66);
        ctx.lineTo(x + 200, floorY); ctx.closePath();
        ctx.fillStyle = '#5f6c7a'; ctx.fill();
        ctx.globalAlpha = .5;
        line(ctx, x, 66, x, floorY, '#8b98a6', 5);
        line(ctx, x + 200, 66, x + 200, floorY, '#8b98a6', 5);
        ctx.restore();
        if (imod(i, 2) === 0) {
          /* a port, with the world dropping away through it */
          const px = x + 100, py = floorY - 190;
          circle(ctx, px, py, 56, '#c8d4e0');
          ctx.save(); ctx.beginPath(); ctx.arc(px, py, 46, 0, TAU); ctx.clip();
          const sg = ctx.createLinearGradient(0, py - 46, 0, py + 46);
          sg.addColorStop(0, mixHex('#4f8cc8', '#04060f', up));
          sg.addColorStop(0.6, mixHex('#a8d0e8', '#0a1024', up));
          sg.addColorStop(1, mixHex('#dff0f8', '#131c34', up));
          ctx.fillStyle = sg; ctx.fillRect(px - 46, py - 46, 92, 92);
          ctx.translate(px - 46, 0);
          ctx.save(); ctx.globalAlpha = up;
          BG3.stars(ctx, 92, py, camX * 0.05 + i * 40, t, 12, py + 20); ctx.restore();
          /* the cloud deck falling away, and then the curve of the world */
          ctx.globalAlpha = .85 * (1 - up);
          fillEll(ctx, 46, py + 30 + up * 46, 62, 20, '#ffffff');
          fillEll(ctx, 18, py + 36 + up * 46, 34, 13, '#eef6fc');
          ctx.globalAlpha = .9 * up;
          fillEll(ctx, 46, py + 74 - up * 26, 76, 30, '#2f6bb0');
          ctx.globalAlpha = .5 * up;
          fillEll(ctx, 30, py + 66 - up * 26, 22, 8, '#5faf6a');
          ctx.restore();
          for (let k = 0; k < 8; k++) {
            const a = k * TAU / 8;
            circle(ctx, px + Math.cos(a) * 51, py + Math.sin(a) * 51, 3.4, '#8b98a6');
          }
        } else {
          /* a rack of lockers and a screen counting down */
          fillRR(ctx, x + 30, floorY - 220, 140, 130, 6, '#4a5764');
          for (let k = 0; k < 3; k++)
            fillRR(ctx, x + 38 + k * 46, floorY - 212, 38, 114, 4, '#66727e');
          fillRR(ctx, x + 44, floorY - 268, 112, 42, 5, '#12181f');
          ctx.fillStyle = up > 0.06 ? '#8fe0a8' : '#ffd870';
          ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
          /* the screens count down to the launch and then read off the height */
          ctx.fillText(up > 0.06 ? (Math.round(up * 118 + imod(i, 3)) + ' km')
                                 : 'T-' + Math.max(0, Math.ceil((0.06 - up) * 150)),
                       x + 100, floorY - 238);
        }
      });
      /* the deckhead, cables and lights along it */
      fillRR(ctx, 0, 0, VW, 26, 0, '#2b3440');
      ctx.save(); ctx.globalAlpha = .6;
      tileLayer(camX * 0.5, 90, VW, (x, i) => {
        circle(ctx, x, 34, 4, imod(i + Math.floor(t * 3), 3) ? '#4fc3ea' : '#dff0ff');
      });
      ctx.restore();
      /* the whole picture trembles, and hardest right at the start: she is
         under power, and the shudder is what tells you so */
      ctx.save();
      ctx.globalAlpha = (.1 + Math.abs(Math.sin(t * 9)) * .06) * (1.6 - up * 0.9);
      ctx.fillStyle = '#ffd0a8'; ctx.fillRect(0, 0, VW, VH); ctx.restore();
      /* and the engines' light coming up the deck from below */
      ctx.save(); ctx.globalAlpha = (.28 - up * .16) + Math.abs(Math.sin(t * 11)) * .07;
      const eg = ctx.createLinearGradient(0, floorY - 90, 0, floorY + 20);
      eg.addColorStop(0, 'rgba(255,160,90,0)'); eg.addColorStop(1, '#ffb060');
      ctx.fillStyle = eg; ctx.fillRect(0, floorY - 90, VW, 110); ctx.restore();
    },
    pools: { hurdle: ['seatPod', 'lockerR', 'cargoNetR', 'tankR', 'consoleR'],
             over: ['pipeRun'], tunnel: ['hatchTunnel'],
             ledge: ['shelfR'], step: ['seatPod', 'lockerR'],
             deco: ['ledStrip', 'pawPrints'] }
  },
  {
    /* ---- 12 · out through the airlock and along the hull, in orbit ---- */
    id: 'orbit', exit: 'airlockIn', name: 'Orbita', sec: 11, diff: 0.9, floor: 'hullPlate',
    sub: 'pro šliuzą laukan — bėga stoties korpusu', calm: 1,
    pal: { floorTop: '#f4f8fc', floorBody: '#8f9aa6', accent: '#4fc3ea',
           treadTop: '#e2e8ee', treadSide: '#8f9aa6', rail: '#c8cfd8', post: '#7f8b99' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#04060f'); g.addColorStop(0.7, '#0a1024'); g.addColorStop(1, '#131c34');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      BG3.stars(ctx, VW, VH, camX, t, 90);
      /* the Earth, huge and turning. It is not scenery that comes and goes —
         it is the reason to be out here, so it stays in the picture the whole
         way and only drifts, very slowly, as the station goes round. */
      BG3.earth(ctx, VW * 0.30 + Math.sin(camX * 0.00006) * 110, VH * 0.26,
                240, t, 'left');
      /* the rest of the station stretching away in front and behind */
      ctx.save(); ctx.globalAlpha = .9;
      tileLayer(camX * 0.3, 560, VW, (x, i) => {
        fillRR(ctx, x, floorY - 220, 300, 74, 30, '#d8dfe6');
        ctx.save(); ctx.globalAlpha = .5;
        for (let k = 0; k < 5; k++) line(ctx, x + 30 + k * 56, floorY - 218, x + 30 + k * 56, floorY - 148, '#9aa6b2', 3);
        ctx.restore();
        fillRR(ctx, x + 300, floorY - 200, 74, 34, 10, '#aab6c2');
        /* a wing of solar panels reaching up off the truss */
        const wy = floorY - 252;
        fillRR(ctx, x + 60, wy - 120, 180, 118, 4, '#22355c');
        ctx.save(); ctx.globalAlpha = .55;
        for (let k = 1; k < 6; k++) line(ctx, x + 60 + k * 30, wy - 120, x + 60 + k * 30, wy - 2, '#5f7fc4', 2.4);
        line(ctx, x + 60, wy - 62, x + 240, wy - 62, '#5f7fc4', 2.4);
        ctx.globalAlpha = .25;
        fillRR(ctx, x + 70, wy - 112, 44, 40, 3, '#cfe4ff'); ctx.restore();
        line(ctx, x + 150, wy - 2, x + 150, floorY - 220, '#8b98a6', 6);
        if (imod(i, 2)) {
          /* a capsule docked on the far side */
          fillRR(ctx, x + 370, floorY - 214, 120, 62, 22, '#e8eef4');
          poly(ctx, [[x + 490, floorY - 206], [x + 540, floorY - 184], [x + 490, floorY - 160]], '#c8cfd8');
        }
      });
      ctx.restore();
      /* the hull she is actually running on, curving away below her */
      ctx.save(); ctx.globalAlpha = .95;
      ctx.beginPath();
      ctx.moveTo(-40, VH + 40);
      ctx.quadraticCurveTo(VW * 0.5, floorY + 26, VW + 40, VH + 40);
      ctx.closePath();
      const hg = ctx.createLinearGradient(0, floorY, 0, VH);
      hg.addColorStop(0, '#c2ccd6'); hg.addColorStop(1, '#5f6c7a');
      ctx.fillStyle = hg; ctx.fill(); ctx.restore();
    },
    pools: { hurdle: ['antennaO', 'thrusterO', 'crateO', 'tankO', 'dishO'],
             over: ['trussO'], tunnel: ['tetherTunnel'],
             ledge: ['railO'], step: ['crateO', 'thrusterO'],
             deco: ['boltO', 'decalO'] }
  },
  {
    /* ---- 13 · in through the airlock and along the station, with the Moon
       getting bigger in every window ---- */
    id: 'station', exit: 'landerDoor', name: 'Kosminė stotis', sec: 10, diff: 0.95,
    sub: 'atgal į vidų: Mėnulis languose vis didesnis', floor: 'stationFloor',
    pal: { floorTop: '#eef2f6', floorBody: '#b9c4d0', accent: '#4fc3ea',
           treadTop: '#eef2f6', treadSide: '#9aa6b2' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#dfe6ee'); g.addColorStop(1, '#aeb9c6');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      /* the module: white padding, and a rib every so often */
      tileLayer(camX * 0.42, 250, VW, (x, i) => {
        ctx.save(); ctx.globalAlpha = .95;
        ctx.beginPath();
        ctx.moveTo(x, floorY); ctx.lineTo(x, 74);
        ctx.quadraticCurveTo(x + 105, 20, x + 210, 74);
        ctx.lineTo(x + 210, floorY); ctx.closePath();
        ctx.fillStyle = '#f2f5f8'; ctx.fill();
        ctx.globalAlpha = .6;
        line(ctx, x, 74, x, floorY, '#b9c4d0', 6);
        ctx.restore();
        const k = imod(i, 3);
        if (k === 0) {
          /* a cupola, and the Moon coming up through it */
          const px = x + 105, py = floorY - 200;
          circle(ctx, px, py, 76, '#c8d4e0');
          ctx.save(); ctx.beginPath(); ctx.arc(px, py, 64, 0, TAU); ctx.clip();
          ctx.fillStyle = '#05080f'; ctx.fillRect(px - 64, py - 64, 128, 128);
          ctx.translate(px - 64, 0);
          BG3.stars(ctx, 128, py + 64, camX * 0.02 + i * 30, t, 14, py + 60);
          ctx.restore();
          circle(ctx, px + 14, py + 8, 34, '#e6e2d8');
          ctx.save(); ctx.globalAlpha = .5;
          circle(ctx, px + 4, py, 8, '#c2bcae');
          circle(ctx, px + 26, py + 18, 6, '#c2bcae');
          circle(ctx, px + 20, py - 12, 4, '#c2bcae'); ctx.restore();
          for (let q = 0; q < 10; q++) {
            const a = q * TAU / 10;
            circle(ctx, px + Math.cos(a) * 70, py + Math.sin(a) * 70, 3.4, '#9aa6b2');
          }
        } else if (k === 1) {
          /* racks of experiments, every drawer labelled */
          fillRR(ctx, x + 14, floorY - 250, 182, 190, 6, '#cfd8e2');
          for (let q = 0; q < 12; q++)
            fillRR(ctx, x + 22 + (q % 4) * 45, floorY - 242 + Math.floor(q / 4) * 60, 39, 52, 4,
              imod(q * 5 + i, 4) ? '#eef2f6' : '#b9c4d0');
          ctx.save(); ctx.globalAlpha = .8;
          for (let q = 0; q < 4; q++)
            circle(ctx, x + 30 + q * 45, floorY - 66, 4, imod(q + Math.floor(t * 2), 3) ? '#4fc3ea' : '#8fe0a8');
          ctx.restore();
        } else {
          /* the treadmill nobody is on, and a bag of tools drifting by it */
          fillRR(ctx, x + 30, floorY - 120, 150, 22, 8, '#3f4a58');
          fillRR(ctx, x + 36, floorY - 116, 138, 12, 5, '#1b2430');
          [x + 36, x + 168].forEach(px => line(ctx, px, floorY - 120, px, floorY - 210, '#96a2b0', 5));
          fillRR(ctx, x + 30, floorY - 218, 156, 12, 4, '#96a2b0');
          ctx.save(); ctx.globalAlpha = .9;
          fillRR(ctx, x + 120, floorY - 268 + Math.sin(t * 0.9) * 8, 44, 34, 8, '#e8dcc0');
          ctx.restore();
        }
      });
      /* the deckhead: cable runs and a line of lights */
      fillRR(ctx, 0, 0, VW, 30, 0, '#c8d4e0');
      ctx.save(); ctx.globalAlpha = .7;
      for (let i = 0; i < 3; i++) fillRR(ctx, 0, 30 + i * 8, VW, 5, 2, ['#4fc3ea', '#f0c23a', '#e2884c'][i]);
      tileLayer(camX * 0.5, 110, VW, x => fillRR(ctx, x, 26, 34, 8, 3, '#f6f9fc'));
      ctx.restore();
    },
    pools: { hurdle: ['bagS', 'labRack', 'sphereS', 'printerS', 'cargoS'],
             over: ['ductS'], tunnel: ['nodeTunnel'],
             ledge: ['rackLedge'], step: ['cargoS', 'labRack'],
             deco: ['velcroDeco', 'pawPrints'] }
  },
  {
    /* ---- 14 · and out onto the Moon, where the finish stands ---- */
    id: 'moon', name: 'Mėnulis', sec: 14, diff: 1.0, floor: 'regolith', last: true, calm: 1,
    sub: 'nusileidimo modulis pastatė ją čia — finišas priekyje',
    pal: { floorTop: '#e2ddd0', floorBody: '#6f6a60', accent: '#8fd6ff',
           treadTop: '#e2ddd0', treadSide: '#9c968a' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      const g = ctx.createLinearGradient(0, 0, 0, floorY);
      g.addColorStop(0, '#04060c'); g.addColorStop(1, '#0e1220');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      BG3.stars(ctx, VW, VH, camX, t, 110, floorY);
      /* Earth, small and blue and a very long way off — and, from here, the
         one thing in the sky that never moves */
      BG3.earth(ctx, VW * 0.74 + Math.sin(camX * 0.00004) * 60, VH * 0.19, 64, t, 'right');
      /* the far mountains of the mare, sharp because there is no air */
      ctx.save(); ctx.globalAlpha = .8;
      BG.hills(ctx, VW, VH, camX * 0.05, floorY - 150, '#33302c', 56, 520);
      ctx.globalAlpha = .9;
      BG.hills(ctx, VW, VH, camX * 0.1, floorY - 92, '#4a4640', 38, 330);
      ctx.restore();
      /* crater rims, one behind another */
      ctx.save(); ctx.globalAlpha = .85;
      tileLayer(camX * 0.18, 420, VW, (x, i) => {
        const r = makeRng(i * 43 + 7);
        const cw = 180 + r() * 140, cy = floorY - 30 - r() * 40;
        ctx.beginPath();
        ctx.ellipse(x + cw / 2, cy, cw / 2, 26 + r() * 14, 0, Math.PI, TAU);
        ctx.fillStyle = '#6f6a60'; ctx.fill();
        ctx.save(); ctx.globalAlpha = .55;
        ctx.beginPath();
        ctx.ellipse(x + cw / 2, cy - 4, cw / 2 - 14, 18 + r() * 10, 0, Math.PI, TAU);
        ctx.fillStyle = '#4a4640'; ctx.fill(); ctx.restore();
      });
      ctx.restore();
      /* the base she is running to: a lander, a dish, a flag */
      ctx.save(); ctx.globalAlpha = .95;
      tileLayer(camX * 0.34, 900, VW, (x, i) => {
        const bx = x + 120;
        fillRR(ctx, bx, floorY - 130, 130, 78, 10, '#e8e2d4');
        ctx.save(); ctx.globalAlpha = .7;
        fillRR(ctx, bx + 12, floorY - 118, 40, 30, 5, '#2f6b9c'); ctx.restore();
        poly(ctx, [[bx + 8, floorY - 130], [bx + 122, floorY - 130], [bx + 96, floorY - 182], [bx + 34, floorY - 182]], '#c8cfd8');
        line(ctx, bx + 10, floorY - 56, bx - 22, floorY - 6, '#96a2b0', 7);
        line(ctx, bx + 120, floorY - 56, bx + 152, floorY - 6, '#96a2b0', 7);
        fillEll(ctx, bx - 22, floorY - 4, 18, 6, '#7f8b99');
        fillEll(ctx, bx + 152, floorY - 4, 18, 6, '#7f8b99');
        /* the flag, held out on a wire because nothing else would hold it */
        line(ctx, bx + 250, floorY, bx + 250, floorY - 120, '#c8cfd8', 4);
        ctx.beginPath();
        ctx.moveTo(bx + 250, floorY - 120); ctx.lineTo(bx + 316, floorY - 116);
        ctx.lineTo(bx + 316, floorY - 78); ctx.lineTo(bx + 250, floorY - 82); ctx.closePath();
        ctx.fillStyle = '#f0c23a'; ctx.fill();
        fillRR(ctx, bx + 250, floorY - 108, 66, 12, 0, '#4a9d6e');
        fillRR(ctx, bx + 250, floorY - 96, 66, 13, 0, '#e2453c');
        /* and a dish, listening to home */
        line(ctx, bx + 400, floorY, bx + 400, floorY - 74, '#8b98a6', 6);
        ctx.save(); ctx.translate(bx + 400, floorY - 82); ctx.rotate(-0.5);
        ctx.beginPath(); ctx.ellipse(0, 0, 40, 30, 0, 0, TAU);
        ctx.fillStyle = '#e8eef4'; ctx.fill(); ctx.restore();
      });
      ctx.restore();
      /* dust she is kicking up, hanging where it was thrown */
      ctx.save(); ctx.globalAlpha = .18;
      for (let i = 0; i < 8; i++) {
        const ph = ((t * .22) + i * .13) % 1;
        fillEll(ctx, imod(i * 170 - camX * 0.7, VW + 200) - 100, floorY - ph * 60,
          24 + ph * 30, 8 + ph * 8, '#e2ddd0');
      }
      ctx.restore();
    },
    pools: { hurdle: ['moonRock', 'landerLeg', 'roverPart', 'crateMoon', 'drillMoon'],
             over: ['archMoon'], tunnel: ['lavaTube'],
             ledge: ['craterLedge'], step: ['moonRock', 'crateMoon'],
             deco: ['dustMoon', 'pawMoon'] }
  }
];
const ZONE3_BY_ID = {};
ZONES3.forEach((z, i) => { z.index = i; ZONE3_BY_ID[z.id] = z; });

/* =============================================================
   THE SECOND ROUTES — three of them, and the same choice every
   time: the floor has a hole in it. Run straight over the hole and
   nothing happens at all; drop into it and you take the longer,
   lower way round, which comes out at exactly the same place at
   exactly the same moment.

   Everything that is hidden on this level is down one of these.
============================================================= */
const BRANCHES3 = {
  /* ---------- 1 · under the airship's salon ---------- */
  ballast: {
    id: 'ballast', drop: -260, enterSec: 3.0, sec: 8.6, locked: 0,
    shaft: 'hatchShaft', sign: 'ballastSign', exitSign: 'upOut', roomGate: 'roomGateA',
    rooms: [
      {
        id: 'ballasthold', name: 'Balasto denis', sub: 'po salonu — bakai ir vamzdžiai', share: 0.54, floor: 'ballastFloor', diff: 0.34,
        pal: { floorTop: '#8a6a45', floorBody: '#4f4438', accent: '#4fc3ea',
               treadTop: '#a8834f', treadSide: '#6f5232', rail: '#c8cfd8', post: '#8a6a45' },
        bg(ctx, VW, VH, camX, floorY, t, pal) {
          const g = ctx.createLinearGradient(0, 0, 0, floorY);
          g.addColorStop(0, '#241d18'); g.addColorStop(1, '#514438');
          ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
          /* the ring frames of the hull, marching away down the ship */
          tileLayer(camX * 0.4, 210, VW, (x, i) => {
            ctx.save(); ctx.globalAlpha = .9;
            ctx.beginPath();
            ctx.moveTo(x, floorY); ctx.lineTo(x, 96);
            ctx.quadraticCurveTo(x + 90, 30, x + 180, 96);
            ctx.lineTo(x + 180, floorY);
            ctx.strokeStyle = '#8a6a45'; ctx.lineWidth = 11; ctx.stroke();
            ctx.globalAlpha = .5;
            for (let k = 1; k < 5; k++)
              line(ctx, x + 6, 110 + k * 52, x + 174, 110 + k * 52, '#6f5232', 4);
            ctx.restore();
            /* the gasbags overhead, breathing */
            ctx.save(); ctx.globalAlpha = .5;
            fillEll(ctx, x + 90, 48 + Math.sin(t * 0.7 + i) * 4, 96, 44, '#c8bfa8');
            ctx.globalAlpha = .3;
            fillEll(ctx, x + 62, 34, 34, 16, '#e8dcc0'); ctx.restore();
          });
          /* water ballast tanks along the far side */
          ctx.save(); ctx.globalAlpha = .85;
          tileLayer(camX * 0.2, 300, VW, (x, i) => {
            fillRR(ctx, x + 20, floorY - 150, 210, 150, 22, '#5f7c8c');
            ctx.save(); ctx.globalAlpha = .55;
            fillRR(ctx, x + 40, floorY - 138, 26, 126, 10, '#8fb0c0'); ctx.restore();
            fillRR(ctx, x + 6, floorY - 168, 238, 20, 5, '#4a6472');
            fillRR(ctx, x + 110, floorY - 130, 34, 100, 5, '#1b3440');
            ctx.save(); ctx.globalAlpha = .9;
            const lv = floorY - 96 + Math.sin(t * 1.2 + i) * 5;
            fillRR(ctx, x + 110, lv, 34, floorY - 34 - lv, 3, '#4fc3ea'); ctx.restore();
          });
          ctx.restore();
          /* one lamp in a cage every few frames, and that is all the light */
          tileLayer(camX * 0.55, 260, VW, (x, i) => {
            const on = .5 + Math.sin(t * 1.6 + i) * .16;
            ctx.save(); ctx.globalAlpha = on * .4;
            circle(ctx, x + 40, 128, 66, '#ffd870'); ctx.restore();
            line(ctx, x + 40, 96, x + 40, 118, '#5f4429', 3);
            circle(ctx, x + 40, 126, 8, '#fff3c4');
            ctx.save(); ctx.globalAlpha = .55;
            ctx.beginPath(); ctx.arc(x + 40, 126, 13, 0, TAU);
            ctx.strokeStyle = '#8a6a45'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          });
        },
        pools: { hurdle: ['ballastTank', 'pipeValve', 'gearCrate', 'engineCase'],
                 over: ['lowBeamB'], tunnel: ['ropeTunnelB'],
                 ledge: ['ballastLedge'], step: ['gearCrate', 'engineCase'],
                 deco: ['rivets', 'oilStain'] }
      },
      {
        id: 'enginebay', name: 'Variklių skyrius', sub: 'sraigtai suka už pat borto', share: 0.46, floor: 'ballastFloor', diff: 0.46,
        pal: { floorTop: '#a8834f', floorBody: '#4f4438', accent: '#f0c23a',
               treadTop: '#a8834f', treadSide: '#6f5232', rail: '#c8cfd8', post: '#8a6a45' },
        bg(ctx, VW, VH, camX, floorY, t, pal) {
          const g = ctx.createLinearGradient(0, 0, 0, floorY);
          g.addColorStop(0, '#2b2118'); g.addColorStop(1, '#5c4a38');
          ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
          /* the engine cars themselves, out through the side of the hull */
          tileLayer(camX * 0.34, 340, VW, (x, i) => {
            ctx.save(); ctx.globalAlpha = .95;
            fillRR(ctx, x + 30, floorY - 190, 220, 130, 26, '#8a6a45');
            fillRR(ctx, x + 44, floorY - 176, 60, 46, 10, '#c9a86a');
            ctx.globalAlpha = .5;
            for (let k = 0; k < 5; k++) fillRR(ctx, x + 120, floorY - 172 + k * 22, 116, 9, 3, '#5f4429');
            ctx.restore();
            /* the propeller, turning */
            const cx = x + 268, cy = floorY - 126;
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 9);
            for (let k = 0; k < 3; k++) {
              ctx.save(); ctx.rotate(k * TAU / 3);
              ctx.globalAlpha = .55;
              fillEll(ctx, 46, 0, 46, 9, '#c8cfd8'); ctx.restore();
            }
            ctx.restore();
            circle(ctx, cx, cy, 11, '#7f8b99');
            /* and the sky going past outside it */
            ctx.save(); ctx.globalAlpha = .5;
            fillEll(ctx, x + 300, floorY - 120, 46, 70, '#a8cbe8'); ctx.restore();
          });
          /* pipes and rods running the length of the bay */
          ctx.save(); ctx.globalAlpha = .7;
          for (let k = 0; k < 3; k++)
            fillRR(ctx, 0, floorY - 250 + k * 26, VW, 11, 5, ['#96a2b0', '#c9a86a', '#8a6a45'][k]);
          tileLayer(camX * 0.34, 130, VW, x => fillRR(ctx, x, floorY - 256, 13, 76, 4, '#7f8b99'));
          ctx.restore();
          /* heat shimmer over the whole bay */
          ctx.save(); ctx.globalAlpha = .1 + Math.abs(Math.sin(t * 3)) * .05;
          ctx.fillStyle = '#ffb87a'; ctx.fillRect(0, 0, VW, VH); ctx.restore();
        },
        pools: { hurdle: ['engineCase', 'pipeValve', 'gearCrate', 'ballastTank'],
                 over: ['lowBeamB'], tunnel: ['ropeTunnelB'],
                 ledge: ['ballastLedge'], step: ['engineCase', 'gearCrate'],
                 deco: ['rivets', 'oilStain'] }
      }
    ]
  },

  /* ---------- 2 · under the glasshouses ---------- */
  seedcellar: {
    id: 'seedcellar', drop: -250, enterSec: 3.0, sec: 8.2, locked: 0,
    shaft: 'cellarShaft', sign: 'cellarSign', exitSign: 'upOut', roomGate: 'roomGateW',
    rooms: [
      {
        id: 'cellarhall', name: 'Sėklų rūsys', sub: 'po šiltnamiais — stiklainiai ir sėklos', share: 0.52, floor: 'cellarFloor', diff: 0.4,
        pal: { floorTop: '#7f7462', floorBody: '#4a4034', accent: '#f0c23a',
               treadTop: '#8a7f6c', treadSide: '#5f5448', rail: '#8a6a45', post: '#6f5232' },
        bg(ctx, VW, VH, camX, floorY, t, pal) {
          const g = ctx.createLinearGradient(0, 0, 0, floorY);
          g.addColorStop(0, '#241f18'); g.addColorStop(1, '#544a3c');
          ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
          /* a brick barrel vault, one bay after another */
          tileLayer(camX * 0.4, 200, VW, (x, i) => {
            ctx.save(); ctx.globalAlpha = .95;
            ctx.beginPath();
            ctx.moveTo(x, floorY); ctx.lineTo(x, 110);
            ctx.quadraticCurveTo(x + 85, 24, x + 170, 110);
            ctx.lineTo(x + 170, floorY);
            ctx.strokeStyle = '#8a6a52'; ctx.lineWidth = 14; ctx.stroke();
            ctx.restore();
            ctx.save(); ctx.globalAlpha = .5;
            for (let k = 0; k < 7; k++) {
              const a = Math.PI + k * (Math.PI / 7);
              line(ctx, x + 85 + Math.cos(a) * 96, 110 + Math.sin(a) * 78,
                x + 85 + Math.cos(a) * 82, 110 + Math.sin(a) * 66, '#6f5232', 4);
            }
            ctx.restore();
          });
          /* shelves of jars and sacks against the far wall */
          ctx.save(); ctx.globalAlpha = .85;
          tileLayer(camX * 0.2, 280, VW, (x, i) => {
            for (let row = 0; row < 3; row++) {
              const yy = floorY - 60 - row * 66;
              fillRR(ctx, x + 10, yy, 200, 10, 3, '#7a5c3a');
              for (let q = 0; q < 6; q++) {
                if (imod(q + row + i, 4) === 3) continue;
                fillRR(ctx, x + 18 + q * 32, yy - 30, 22, 30, 4, 'rgba(190,215,195,.65)');
                fillRR(ctx, x + 20 + q * 32, yy - 34, 18, 7, 2, '#c9a86a');
                ctx.save(); ctx.globalAlpha = .8;
                fillRR(ctx, x + 21 + q * 32, yy - 21, 16, 17, 3,
                  ['#e2584f', '#f0a93a', '#8a5fc4', '#4a9d6e'][imod(q + row, 4)]); ctx.restore();
              }
            }
            fillRR(ctx, x + 224, floorY - 70, 46, 70, 8, '#c9b184');
          });
          ctx.restore();
          /* roots that have come down through the roof, and one bare bulb */
          tileLayer(camX * 0.5, 230, VW, (x, i) => {
            ctx.save(); ctx.globalAlpha = .7;
            for (let k = -1; k <= 1; k++) {
              ctx.beginPath();
              ctx.moveTo(x + 40 + k * 20, 96);
              ctx.quadraticCurveTo(x + 46 + k * 24, 140, x + 36 + k * 28, 186);
              ctx.strokeStyle = k ? '#6b4a2c' : '#7a5a3a'; ctx.lineWidth = 5; ctx.stroke();
            }
            ctx.restore();
            const on = .5 + Math.sin(t * 1.4 + i) * .2;
            line(ctx, x + 150, 96, x + 150, 132, '#3a3226', 2);
            circle(ctx, x + 150, 138, 8, '#fff3c4');
            ctx.save(); ctx.globalAlpha = on * .35;
            circle(ctx, x + 150, 138, 60, '#ffd870'); ctx.restore();
          });
        },
        pools: { hurdle: ['seedBin', 'cellarCrate', 'sackG', 'potStack'],
                 over: ['rootBundle'], tunnel: ['cellarArch'],
                 ledge: ['jarShelf'], step: ['cellarCrate', 'seedBin'],
                 deco: ['spillDeco', 'leafDeco'] }
      },
      {
        id: 'rootstore', name: 'Šaknų sandėlis', sub: 'dėžės šaknų ir svogūnų vainikai', share: 0.48, floor: 'cellarFloor', diff: 0.52,
        pal: { floorTop: '#8a7f6c', floorBody: '#4a4034', accent: '#e2884c',
               treadTop: '#8a7f6c', treadSide: '#5f5448', rail: '#8a6a45', post: '#6f5232' },
        bg(ctx, VW, VH, camX, floorY, t, pal) {
          const g = ctx.createLinearGradient(0, 0, 0, floorY);
          g.addColorStop(0, '#1f1b16'); g.addColorStop(1, '#4a4034');
          ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
          BG3.roof(ctx, VW, VH, camX, 76, '#2b241c', '#6b5a42', 62);
          /* bins of roots, and onions hung up in ropes over them */
          ctx.save(); ctx.globalAlpha = .9;
          tileLayer(camX * 0.24, 260, VW, (x, i) => {
            ctx.beginPath();
            ctx.moveTo(x + 16, floorY - 118); ctx.lineTo(x + 216, floorY - 118);
            ctx.lineTo(x + 194, floorY); ctx.lineTo(x + 38, floorY); ctx.closePath();
            ctx.fillStyle = '#7a5c3a'; ctx.fill();
            ctx.save(); ctx.globalAlpha = .55;
            for (let k = 1; k < 4; k++) line(ctx, x + 16 + k * 50, floorY - 116, x + 38 + k * 39, floorY - 3, '#5f4429', 3);
            ctx.restore();
            for (let q = 0; q < 7; q++)
              fillEll(ctx, x + 34 + q * 26, floorY - 122, 13, 9, imod(q + i, 3) ? '#e2884c' : '#c9a86a');
          });
          ctx.restore();
          tileLayer(camX * 0.5, 150, VW, (x, i) => {
            const sw = Math.sin(t * 0.8 + i) * 3;
            line(ctx, x + 30 + sw, 84, x + 30, 96, '#8a7f5c', 3);
            for (let k = 0; k < 4; k++)
              fillEll(ctx, x + 30 + sw * (1 - k * .2), 106 + k * 20, 12, 15, k % 2 ? '#d8b98a' : '#c9a86a');
          });
          /* one lantern, and a great many shadows */
          tileLayer(camX * 0.5, 300, VW, (x, i) => {
            const on = .45 + Math.sin(t * 2 + i) * .2;
            fillRR(ctx, x + 60, 100, 20, 26, 5, '#8a6a45');
            circle(ctx, x + 70, 113, 6, '#ffd870');
            ctx.save(); ctx.globalAlpha = on * .3;
            circle(ctx, x + 70, 113, 76, '#ffb87a'); ctx.restore();
          });
        },
        pools: { hurdle: ['seedBin', 'cellarCrate', 'potStack', 'sackG'],
                 over: ['rootBundle'], tunnel: ['cellarArch'],
                 ledge: ['jarShelf'], step: ['seedBin', 'cellarCrate'],
                 deco: ['spillDeco', 'leafDeco'] }
      }
    ]
  },

  /* ---------- 3 · under the quarry — and under THAT ---------- */
  conveyor: {
    id: 'conveyor', drop: -270, enterSec: 3.2, sec: 21, locked: 0,
    shaft: 'galleryShaft', sign: 'gallerySign', exitSign: 'upOut', roomGate: 'roomGateA',
    /* the second hole is in the crusher house, at the far end of the gallery */
    deepRoom: 'crusher',
    deep: {
      id: 'bunker', drop: -250, sec: 7.2, exitSign: 'upOut',
      shaft: 'deepShaft', sign: 'deepSign',
      room: {
        id: 'bunker', name: 'Bandymų bunkeris', sub: 'niekas čia nebuvo daug metų', floor: 'bunkerFloor', diff: 0.5,
        pal: { floorTop: '#5f6c7a', floorBody: '#2f3a48', accent: '#8fd6ff',
               treadTop: '#8b98a6', treadSide: '#4a5764', rail: '#c8cfd8', post: '#7f8b99' },
        bg(ctx, VW, VH, camX, floorY, t, pal) {
          const g = ctx.createLinearGradient(0, 0, 0, floorY);
          g.addColorStop(0, '#0d1219'); g.addColorStop(1, '#2f3a48');
          ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
          /* a concrete tube, ribbed, with the paint peeling off it */
          tileLayer(camX * 0.42, 190, VW, (x, i) => {
            ctx.save(); ctx.globalAlpha = .95;
            ctx.beginPath();
            ctx.moveTo(x, floorY); ctx.lineTo(x, 92);
            ctx.quadraticCurveTo(x + 80, 26, x + 160, 92);
            ctx.lineTo(x + 160, floorY);
            ctx.strokeStyle = '#4a5764'; ctx.lineWidth = 15; ctx.stroke();
            ctx.globalAlpha = .35;
            ctx.strokeStyle = '#6f7c8a'; ctx.lineWidth = 5; ctx.stroke();
            ctx.restore();
          });
          /* the far wall: the test stand this place was built for, and the
             boards that recorded what it did */
          ctx.save(); ctx.globalAlpha = .9;
          tileLayer(camX * 0.2, 420, VW, (x, i) => {
            fillRR(ctx, x + 20, floorY - 210, 170, 210, 6, '#3f4a58');
            ctx.save(); ctx.globalAlpha = .6;
            for (let k = 0; k < 4; k++) fillRR(ctx, x + 32, floorY - 196 + k * 48, 146, 34, 4, '#2b3440');
            ctx.restore();
            for (let k = 0; k < 8; k++)
              circle(ctx, x + 44 + (k % 4) * 40, floorY - 186 + Math.floor(k / 4) * 96, 5,
                imod(k * 3 + i + Math.floor(t * 1.5), 5) > 2 ? '#8fe0a8' : '#1b2430');
            /* a rocket on a stand, bolted down, going nowhere ever again */
            fillRR(ctx, x + 250, floorY - 190, 54, 168, 16, '#c8cfd8');
            ctx.beginPath();
            ctx.moveTo(x + 250, floorY - 176); ctx.quadraticCurveTo(x + 277, floorY - 250, x + 304, floorY - 176);
            ctx.closePath(); ctx.fillStyle = '#e8eef4'; ctx.fill();
            poly(ctx, [[x + 250, floorY - 46], [x + 226, floorY - 12], [x + 250, floorY - 12]], '#96a2b0');
            poly(ctx, [[x + 304, floorY - 46], [x + 328, floorY - 12], [x + 304, floorY - 12]], '#96a2b0');
            fillRR(ctx, x + 214, floorY - 12, 126, 12, 3, '#f0c23a');
          });
          ctx.restore();
          /* the rock fall that shut this place: half the roof is on the floor
             at the far end, and the emergency lamps have been on ever since */
          tileLayer(camX * 0.55, 260, VW, (x, i) => {
            const on = (Math.sin(t * 2 + i) > -0.4);
            fillRR(ctx, x + 90, 96, 26, 20, 4, on ? '#e2453c' : '#5f2a28');
            ctx.save(); ctx.globalAlpha = on ? .3 : .06;
            circle(ctx, x + 103, 110, 54, '#ff6b5f'); ctx.restore();
          });
          ctx.save(); ctx.globalAlpha = .16;
          for (let i = 0; i < 6; i++) {
            const r = makeRng(i * 37 + 3);
            fillEll(ctx, imod(i * 210 - camX * 0.3, VW + 200) - 100,
              floorY - 40 - r() * 140 + Math.sin(t * .5 + i) * 8, 70, 22, '#8fa8c0');
          }
          ctx.restore();
        },
        pools: { hurdle: ['testRig', 'fuelCan', 'sparePack', 'toolCrate', 'crateM'],
                 over: ['bunkerBeam'], tunnel: ['galleryBeam'],
                 ledge: ['bunkerLedge'], step: ['toolCrate', 'crateM'],
                 deco: ['warnStripe', 'oilStain'] }
      }
    },
    shaftProp: 'galleryShaft',
    rooms: [
      {
        id: 'gallery', name: 'Transporterio galerija', sub: 'juosta virš galvos veža akmenį laukan', share: 0.38, floor: 'galleryFloor', diff: 0.5,
        pal: { floorTop: '#7f8b99', floorBody: '#3f4a58', accent: '#f0c23a',
               treadTop: '#96a2b0', treadSide: '#5f6c7a', rail: '#c8cfd8', post: '#7f8b99' },
        bg(ctx, VW, VH, camX, floorY, t, pal) {
          const g = ctx.createLinearGradient(0, 0, 0, floorY);
          g.addColorStop(0, '#12181f'); g.addColorStop(1, '#414d5b');
          ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
          BG3.roof(ctx, VW, VH, camX, 62, '#1b2229', '#8f8a7c', 58);
          /* the belt itself, running the length of the gallery over her head,
             carrying cut stone out to the yard */
          ctx.save(); ctx.globalAlpha = .95;
          fillRR(ctx, 0, 118, VW, 16, 4, '#3f4a58');
          ctx.globalAlpha = .8;
          for (let i = 0; i < 40; i++) {
            const px = imod(i * 64 - camX * 0.5 - t * 120, VW + 120) - 60;
            fillRR(ctx, px, 106, 30, 14, 3, imod(i, 3) ? '#e6e2d6' : '#cfc9ba');
          }
          ctx.restore();
          ctx.save(); ctx.globalAlpha = .6;
          tileLayer(camX * 0.5, 150, VW, x => {
            fillRR(ctx, x, 134, 12, 44, 3, '#5f6c7a');
            circle(ctx, x + 6, 126, 9, '#7f8b99');
          });
          ctx.restore();
          /* the rock wall on the far side, and the props holding it */
          ctx.save(); ctx.globalAlpha = .85;
          BG.hills(ctx, VW, VH, camX * 0.16, floorY - 44, '#5a6470', 34, 260);
          ctx.globalAlpha = .9;
          BG.hills(ctx, VW, VH, camX * 0.28, floorY - 6, '#6b7580', 22, 170);
          ctx.restore();
          tileLayer(camX * 0.36, 210, VW, (x, i) => {
            fillRR(ctx, x, floorY - 168, 14, 168, 3, '#7f8b99');
            fillRR(ctx, x - 10, floorY - 182, 130, 14, 3, '#8b98a6');
            const on = .5 + Math.sin(t * 1.8 + i) * .2;
            circle(ctx, x + 60, floorY - 194, 7, '#fff3c4');
            ctx.save(); ctx.globalAlpha = on * .3;
            circle(ctx, x + 60, floorY - 194, 52, '#ffd870'); ctx.restore();
          });
        },
        pools: { hurdle: ['beltRoller', 'hopperQ', 'spoilPile', 'drumQ', 'crateM'],
                 over: ['galleryBeam'], tunnel: ['archQ'],
                 ledge: ['galleryLedge'], step: ['crateM', 'blockQ'],
                 deco: ['dustQ', 'trackQ'] }
      },
      {
        id: 'crusher', name: 'Trupintuvas', sub: 'čia akmuo malamas — ir čia dar viena skylė', share: 0.62, floor: 'galleryFloor', diff: 0.6,
        pal: { floorTop: '#7f8b99', floorBody: '#3f4a58', accent: '#e2453c',
               treadTop: '#96a2b0', treadSide: '#5f6c7a', rail: '#c8cfd8', post: '#7f8b99' },
        bg(ctx, VW, VH, camX, floorY, t, pal) {
          const g = ctx.createLinearGradient(0, 0, 0, floorY);
          g.addColorStop(0, '#0e1319'); g.addColorStop(1, '#3a4552');
          ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
          BG3.roof(ctx, VW, VH, camX, 54, '#161c22', '#8f8a7c', 52);
          /* the crusher house: two great jaws, and everything shakes */
          const sh = Math.sin(t * 7) * 2;
          ctx.save(); ctx.translate(0, sh); ctx.globalAlpha = .95;
          tileLayer(camX * 0.3, 460, VW, (x, i) => {
            fillRR(ctx, x + 20, floorY - 256, 250, 176, 8, '#5f6c7a');
            ctx.save(); ctx.globalAlpha = .6;
            for (let k = 0; k < 4; k++) fillRR(ctx, x + 34, floorY - 244 + k * 42, 222, 8, 3, '#3f4a58');
            ctx.restore();
            /* the jaws, opening and shutting */
            const j = Math.abs(Math.sin(t * 3.4)) * 9;
            poly(ctx, [[x + 70, floorY - 80], [x + 132 - j, floorY - 80],
              [x + 120 - j, floorY - 14], [x + 86, floorY - 14]], '#2b3440');
            poly(ctx, [[x + 158 + j, floorY - 80], [x + 220, floorY - 80],
              [x + 204, floorY - 14], [x + 170 + j, floorY - 14]], '#2b3440');
            hazardTape(ctx, x + 20, floorY - 268, 250, 12);
            /* the hopper feeding it */
            poly(ctx, [[x + 40, floorY - 330], [x + 250, floorY - 330],
              [x + 190, floorY - 258], [x + 100, floorY - 258]], '#7f8b99');
            ctx.save(); ctx.globalAlpha = .8;
            for (let k = 0; k < 5; k++)
              fillRR(ctx, x + 110 + imod(k * 37 + Math.floor(t * 90), 70), floorY - 320 + k * 12, 20, 12, 3, '#e6e2d6');
            ctx.restore();
          });
          ctx.restore();
          /* dust, and a great deal of it */
          ctx.save(); ctx.globalAlpha = .2;
          for (let i = 0; i < 9; i++) {
            const ph = ((t * .35) + i * .11) % 1;
            fillEll(ctx, imod(i * 160 - camX * 0.4, VW + 200) - 100, floorY - 20 - ph * 190,
              40 + ph * 60, 18 + ph * 22, '#cfc9ba');
          }
          ctx.restore();
        },
        pools: { hurdle: ['hopperQ', 'beltRoller', 'drumQ', 'spoilPile', 'crateM'],
                 over: ['galleryBeam'], tunnel: ['archQ'],
                 ledge: ['galleryLedge'], step: ['crateM', 'blockQ'],
                 deco: ['dustQ', 'trackQ'] }
      }
    ]
  }
};
Object.keys(BRANCHES3).forEach(k => {
  BRANCHES3[k].rooms.forEach((r, i) => { r.index = i; r.branch = BRANCHES3[k]; });
});

/* =============================================================
   ABOVE THE CLOUDS — where the jetpack takes her.

   This is not a place she can walk to. It is the layer the pack
   flies her through: no obstacles, nothing to duck, nothing that
   can go wrong. All there is to do up here is watch, and pick up
   whatever the ground below would have given her.
============================================================= */
const SKY_ROOM = {
  id: 'sky', name: 'Virš debesų', sub: 'kuprinė neša — kliūčių čia nėra', floor: 'envelope',
  pal: { floorTop: '#ffffff', floorBody: '#c8d8e8', accent: '#8fd6ff' },
  bg(ctx, VW, VH, camX, floorY, t, pal) {
    /* the sky is a great deal bigger up here, and completely still */
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, '#1f4b8c'); g.addColorStop(0.42, '#68a8d8');
    g.addColorStop(0.78, '#bfe0f0'); g.addColorStop(1, '#ffe4c8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    BG3.stars(ctx, VW, VH, camX, t, 22, VH * 0.3);
    BG.sun(ctx, VW, VH, VW * 0.78, VH * 0.2, 40, '#fff0c8');
    /* towers of cloud standing well above the deck, going past fast */
    ctx.save(); ctx.globalAlpha = .85;
    tileLayer(camX * 0.34, 420, VW, (x, i) => {
      const r = makeRng(i * 61 + 13);
      const cy = VH * (0.4 + r() * 0.16), s = 0.8 + r() * 0.7;
      fillEll(ctx, x + 110, cy, 96 * s, 40 * s, '#ffffff');
      fillEll(ctx, x + 60, cy + 14 * s, 62 * s, 30 * s, '#f2f8fc');
      fillEll(ctx, x + 168, cy + 10 * s, 54 * s, 26 * s, '#f8fcff');
      fillEll(ctx, x + 118, cy - 30 * s, 56 * s, 30 * s, '#ffffff');
      ctx.save(); ctx.globalAlpha = .35;
      fillEll(ctx, x + 110, cy + 34 * s, 100 * s, 16 * s, '#bcd4e6'); ctx.restore();
    });
    ctx.restore();
    /* and the deck of cloud she is flying over */
    BG3.cloudSea(ctx, VW, VH, camX, floorY - 40, t, '#dbe9f4', '#ffffff');
    /* a flock of something, a long way off and going the other way */
    ctx.save(); ctx.globalAlpha = .35;
    for (let i = 0; i < 7; i++) {
      const px = imod(i * 190 - camX * 0.16 + t * 30, VW + 160) - 80;
      const py = VH * 0.26 + Math.sin(t * 0.9 + i) * 10 + i * 7;
      ctx.beginPath();
      ctx.moveTo(px - 9, py); ctx.quadraticCurveTo(px, py - 6, px + 9, py);
      ctx.strokeStyle = '#3f5a78'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
  }
};
