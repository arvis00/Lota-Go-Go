'use strict';
/* ---------------------------------------------------------------
   zones4.js — the boss level: "Didysis pabėgimas".

   Exactly five arenas, and they tell one story:

     1 · Veterinarijos kabinetas — where the film ends and she lands
     2 · Klinikos koridorius     — short, and only there to teach it
     3 · Miesto gatvė            — the longest and hardest of the five
     4 · Šunų kirpykla           — fast, chaotic, and it spins her round
     5 · Paskutinis pabėgimas    — everything at once, at full speed

   There are no second routes down here and nothing to hunt for: the
   only thing on the floor is energy, and the only thing behind her is
   somebody who wants to finish clipping her nails.
----------------------------------------------------------------*/

/* ================= backgrounds shared by the boss level ================= */
const BG4 = {
  /* a clinic wall: half-height panelling, posters, a door now and then */
  clinicWall(ctx, VW, VH, off, floorY, t, top, low, trim) {
    const g = ctx.createLinearGradient(0, 0, 0, floorY);
    g.addColorStop(0, top); g.addColorStop(1, shade(top, -.08));
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    fillRR(ctx, 0, floorY - 128, VW, 132, 0, low);
    fillRR(ctx, 0, floorY - 134, VW, 9, 0, trim);
    /* the strip light running the length of the ceiling */
    ctx.save(); ctx.globalAlpha = .85;
    fillRR(ctx, 0, 24, VW, 13, 0, '#e8eef2');
    tileLayer(off * 0.5, 320, VW, x => {
      fillRR(ctx, x + 30, 22, 190, 17, 5, '#fff8e0');
      ctx.save(); ctx.globalAlpha = .22;
      const lg = ctx.createLinearGradient(0, 38, 0, 170);
      lg.addColorStop(0, 'rgba(255,248,224,.8)'); lg.addColorStop(1, 'rgba(255,248,224,0)');
      ctx.fillStyle = lg; ctx.fillRect(x + 10, 38, 230, 132); ctx.restore();
    });
    ctx.restore();
    /* posters, cupboards and the odd door, pushed well back */
    tileLayer(off * 0.62, 300, VW, (x, i) => {
      const k = imod(i, 4);
      ctx.save(); ctx.globalAlpha = .9;
      if (k === 0) {
        /* a poster of a very pleased dog */
        fillRR(ctx, x + 20, floorY - 264, 128, 104, 6, '#f6f2ea');
        fillRR(ctx, x + 27, floorY - 257, 114, 76, 4, '#bfe4f2');
        fillEll(ctx, x + 84, floorY - 208, 30, 24, '#3a3440');
        circle(ctx, x + 72, floorY - 216, 3, '#fff'); circle(ctx, x + 94, floorY - 216, 3, '#fff');
        fillRR(ctx, x + 40, floorY - 176, 88, 8, 3, '#e2453c');
      } else if (k === 1) {
        /* a glass-fronted cabinet full of bottles */
        fillRR(ctx, x + 26, floorY - 300, 150, 172, 6, '#dfe8ee');
        fillRR(ctx, x + 34, floorY - 292, 134, 156, 4, '#cfe4ee');
        for (let r = 0; r < 3; r++) {
          fillRR(ctx, x + 34, floorY - 250 + r * 48, 134, 6, 2, '#b8c8d0');
          for (let c = 0; c < 5; c++)
            fillRR(ctx, x + 42 + c * 25, floorY - 276 + r * 48, 14, 26, 3,
              ['#8fd0a8', '#ff9ab0', '#8fd0e8', '#ffe08a', '#c0a8e8'][(c + r) % 5]);
        }
      } else if (k === 2) {
        /* a consulting-room door, shut */
        fillRR(ctx, x + 40, floorY - 306, 128, 306, 6, shade(low, -.14));
        fillRR(ctx, x + 50, floorY - 296, 108, 286, 4, shade(low, -.04));
        circle(ctx, x + 148, floorY - 150, 5, '#c9962c');
        fillRR(ctx, x + 66, floorY - 286, 76, 46, 3, '#c8e2f6');
      } else {
        /* a rack of leaflets and a hand-sanitiser */
        fillRR(ctx, x + 40, floorY - 214, 96, 86, 5, shade(low, -.12));
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < 3; c++)
            fillRR(ctx, x + 47 + c * 29, floorY - 206 + r * 28, 24, 20, 2,
              ['#f6f2ea', '#ffe08a', '#8fd0e8'][(c + r) % 3]);
        fillRR(ctx, x + 152, floorY - 190, 22, 44, 5, '#8fd0a8');
      }
      ctx.restore();
    });
    /* the paw-print border every vet in the world has */
    ctx.save(); ctx.globalAlpha = .4;
    tileLayer(off * 0.62, 58, VW, x => {
      fillEll(ctx, x + 20, floorY - 152, 6, 5, trim);
      for (let k = 0; k < 3; k++) circle(ctx, x + 15 + k * 5, floorY - 158, 2, trim);
    });
    ctx.restore();
  },

  /* a street of shopfronts under a low grey sky, with rain in the air */
  cityFront(ctx, VW, VH, off, floorY, t) {
    BG.sky(ctx, VW, VH, '#5f6f92', '#8fa0bc', '#c8cfd8');
    ctx.save(); ctx.globalAlpha = .6;
    BG.clouds(ctx, VW, VH, off * 0.04 + t * 5, t, 'rgba(226,232,242,.9)', VH * 0.1, 1.3);
    ctx.restore();
    /* the far side of the street */
    ctx.save(); ctx.globalAlpha = .55;
    BG.buildings(ctx, VW, VH, off * 0.08, floorY - 130, ['#4a5570', '#56617c', '#3f4a63'],
      '#ffe08a', 150, 260, 190, true);
    ctx.restore();
    /* the near terrace: shopfronts, awnings, signs */
    tileLayer(off * 0.3, 340, VW, (x, i) => {
      const r = makeRng(i * 67 + 3);
      const h = 260 + r() * 90, w = 300;
      const c = ['#8a6a68', '#6a7a8a', '#7a6a8a', '#8a7a5a'][imod(i, 4)];
      fillRR(ctx, x, floorY - h, w, h + 20, 4, c);
      fillRR(ctx, x - 6, floorY - h - 12, w + 12, 16, 3, shade(c, -.2));
      /* upstairs windows */
      for (let row = 0; row < 2; row++)
        for (let col = 0; col < 3; col++)
          fillRR(ctx, x + 26 + col * 90, floorY - h + 34 + row * 78, 58, 56, 4,
            imod(col * 5 + row * 7 + i * 3, 7) > 3 ? '#ffe08a' : shade(c, -.26));
      /* the shopfront itself */
      fillRR(ctx, x + 12, floorY - 132, w - 24, 132, 4, shade(c, -.3));
      fillRR(ctx, x + 22, floorY - 120, w - 44, 96, 4, '#b8ccd8');
      ctx.save(); ctx.globalAlpha = .4;
      for (let px = x + 22; px < x + w - 30; px += 46) line(ctx, px, floorY - 120, px + 30, floorY - 24, '#eef6fa', 8);
      ctx.restore();
      /* the awning over it, and the shop's name */
      const ac = ['#e8534c', '#3f9c6a', '#4f8ce2', '#e8a93a'][imod(i, 4)];
      fillRR(ctx, x + 6, floorY - 146, w - 12, 20, 4, ac);
      ctx.save(); ctx.globalAlpha = .85;
      for (let px = x + 6; px < x + w - 18; px += 34) ctx.fillStyle = '#f6f2ea', ctx.fillRect(px, floorY - 146, 17, 20);
      ctx.restore();
      fillRR(ctx, x + 60, floorY - 176, w - 120, 24, 5, shade(c, -.36));
      ctx.save(); ctx.globalAlpha = .7;
      for (let k = 0; k < 5; k++) fillRR(ctx, x + 74 + k * 26, floorY - 170, 17, 12, 2, '#ffe08a');
      ctx.restore();
    });
    /* lamp posts on the near pavement */
    ctx.save(); ctx.globalAlpha = .9;
    tileLayer(off * 0.55, 420, VW, x => {
      line(ctx, x + 40, floorY, x + 40, floorY - 210, '#3a3f4c', 7);
      line(ctx, x + 40, floorY - 210, x + 76, floorY - 222, '#3a3f4c', 6);
      fillRR(ctx, x + 70, floorY - 226, 24, 13, 5, '#ffe08a');
      ctx.save(); ctx.globalAlpha = .25;
      circle(ctx, x + 82, floorY - 218, 30, '#ffe08a'); ctx.restore();
    });
    ctx.restore();
    /* rain, slanting */
    ctx.save(); ctx.globalAlpha = .22;
    for (let i = 0; i < 40; i++) {
      const r = makeRng(i * 37 + Math.floor(t * 9) * 11);
      const px = r() * VW, py = imod(r() * VH * 2 - t * 900, VH + 60) - 30;
      line(ctx, px, py, px - 7, py + 26, '#dfe8f4', 1.6);
    }
    ctx.restore();
  },

  /* the salon: pink, tiled, mirrors down the far wall */
  salonWall(ctx, VW, VH, off, floorY, t) {
    const g = ctx.createLinearGradient(0, 0, 0, floorY);
    g.addColorStop(0, '#ffe4ee'); g.addColorStop(1, '#f6cddd');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    /* the tiled dado */
    ctx.save(); ctx.globalAlpha = .55;
    tileLayer(off * 0.62, 46, VW, (x, i) => {
      for (let y = floorY - 160; y < floorY; y += 46)
        fillRR(ctx, x + (imod(Math.round(y / 46), 2)) * 23, y, 42, 42, 4, '#ffffff');
    });
    ctx.restore();
    fillRR(ctx, 0, floorY - 168, VW, 10, 0, '#e0748c');
    /* mirror stations along the wall, each with a dog in it */
    tileLayer(off * 0.62, 330, VW, (x, i) => {
      ctx.save(); ctx.globalAlpha = .95;
      fillRR(ctx, x + 30, floorY - 322, 160, 200, 80, '#e8c0d0');
      fillRR(ctx, x + 40, floorY - 312, 140, 180, 70, '#dfeaf2');
      ctx.save();
      rr(ctx, x + 40, floorY - 312, 140, 180, 70); ctx.clip();
      const mg = ctx.createLinearGradient(0, floorY - 312, 0, floorY - 132);
      mg.addColorStop(0, '#eef6fa'); mg.addColorStop(1, '#c0d4e0');
      ctx.fillStyle = mg; ctx.fillRect(x + 40, floorY - 312, 140, 180);
      ctx.globalAlpha = .5;
      line(ctx, x + 40, floorY - 180, x + 120, floorY - 300, '#ffffff', 14);
      ctx.restore();
      /* the lightbulbs round it */
      for (let k = 0; k < 8; k++) {
        const a = -Math.PI * 0.5 + (k / 7) * Math.PI * 1.6;
        circle(ctx, x + 110 + Math.cos(a) * 92, floorY - 218 + Math.sin(a) * 112, 7,
          imod(k + Math.floor(t * 2), 5) > 1 ? '#fff3c4' : '#e8d8b0');
      }
      /* a shelf of bottles under it */
      fillRR(ctx, x + 24, floorY - 118, 172, 10, 4, '#e0748c');
      for (let k = 0; k < 6; k++)
        fillRR(ctx, x + 34 + k * 28, floorY - 150, 17, 32, 4,
          ['#8fd0a8', '#ff9ab0', '#8fd0e8', '#ffe08a', '#c0a8e8', '#ffb08a'][k]);
      ctx.restore();
    });
    /* bunting, because of course there is bunting */
    ctx.save(); ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.moveTo(-20, 30);
    ctx.quadraticCurveTo(VW / 2, 76, VW + 20, 30);
    ctx.strokeStyle = '#e0748c'; ctx.lineWidth = 3; ctx.stroke();
    for (let i = 0; i <= 12; i++) {
      const k = i / 12, px = -20 + k * (VW + 40);
      const py = 30 + 46 * 2 * k * (1 - k) + Math.sin(t * 1.6 + i) * 2;
      poly(ctx, [[px - 12, py], [px + 12, py], [px, py + 26]],
        ['#ff9ab0', '#ffe08a', '#8fd0e8', '#c0a8e8'][imod(i, 4)]);
    }
    ctx.restore();
    /* soap bubbles drifting up through the whole room */
    ctx.save();
    for (let i = 0; i < 16; i++) {
      const r = makeRng(i * 53 + 7);
      const ph = ((t * 0.18) + r()) % 1;
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.4;
      const px = imod(r() * VW * 1.6 - off * 0.35, VW + 80) - 40;
      circle(ctx, px + Math.sin(ph * 7 + i) * 20, floorY - ph * (floorY - 20), 6 + r() * 12, '#ffffff');
    }
    ctx.restore();
  },

  /* the back alleys at dusk, one wall close and one far */
  alleyWall(ctx, VW, VH, off, floorY, t) {
    BG.sky(ctx, VW, VH, '#241a3d', '#5a3a68', '#e08a6a');
    for (let i = 0; i < 30; i++) {
      const r = makeRng(i * 61 + 9);
      ctx.save(); ctx.globalAlpha = .3 + Math.sin(t * 2 + i) * .3;
      circle(ctx, imod(r() * VW * 2 - off * 0.02, VW + 20) - 10, r() * VH * 0.36, 1.6, '#fff6d8');
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = .7;
    BG.buildings(ctx, VW, VH, off * 0.07, floorY - 190, ['#2f2740', '#3a3050', '#282038'],
      '#ffd870', 190, 320, 200, true);
    ctx.restore();
    /* the near wall: brick, drainpipes, and washing strung across */
    tileLayer(off * 0.34, 360, VW, (x, i) => {
      const h = 300 + imod(i * 37, 90);
      fillRR(ctx, x, floorY - h, 330, h + 20, 3, '#4a3a44');
      ctx.save(); ctx.globalAlpha = .3;
      for (let row = 0; row < 14; row++)
        for (let px = x + (row % 2) * 20; px < x + 330; px += 40)
          fillRR(ctx, px + 2, floorY - h + 10 + row * 21, 36, 16, 2, '#5f4a54');
      ctx.restore();
      /* a lit window or two */
      for (let k = 0; k < 3; k++)
        if (imod(i * 5 + k * 3, 4) > 1)
          fillRR(ctx, x + 40 + k * 100, floorY - h + 60 + imod(k * 31, 60), 54, 66, 4, '#ffd870');
      /* the drainpipe */
      line(ctx, x + 300, floorY, x + 300, floorY - h, '#3a2f38', 9);
      ctx.save(); ctx.globalAlpha = .7;
      for (let yy = floorY - h + 24; yy < floorY; yy += 74) fillRR(ctx, x + 294, yy, 13, 8, 2, '#5f4a54');
      ctx.restore();
      /* washing line */
      ctx.save(); ctx.globalAlpha = .85;
      ctx.beginPath();
      ctx.moveTo(x + 30, floorY - h + 120);
      ctx.quadraticCurveTo(x + 170, floorY - h + 168, x + 310, floorY - h + 116);
      ctx.strokeStyle = '#8a7a84'; ctx.lineWidth = 2; ctx.stroke();
      for (let k = 0; k < 4; k++) {
        const f = 0.16 + k * 0.22, px = x + 30 + 280 * f;
        const py = floorY - h + 120 + 48 * 2 * f * (1 - f);
        fillRR(ctx, px - 13, py, 26, 34 + imod(k * 7, 14), 4,
          ['#8fd0e8', '#ffe08a', '#ff9ab0', '#f6f2ea'][imod(k + i, 4)]);
      }
      ctx.restore();
    });
    /* the glow of a street lamp somewhere behind her */
    ctx.save(); ctx.globalAlpha = .16;
    const lg = ctx.createRadialGradient(VW * 0.2, floorY - 150, 10, VW * 0.2, floorY - 150, 320);
    lg.addColorStop(0, '#ffd870'); lg.addColorStop(1, 'rgba(255,216,112,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, VW, VH); ctx.restore();
  }
};

/* ---------------- the boss level's floors ---------------- */
Object.assign(FLOOR_EXT, {
  /* clinic lino: speckled, seamed, and mopped to within an inch of its life */
  clinicLino(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 9, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .35;
    for (let px = Math.floor((x + camX) / 132) * 132 - camX; px < x + w; px += 132)
      if (px > x) line(ctx, px, y, px, y + h, shade(pal.floorBody, -.22), 2);
    ctx.globalAlpha = .22;
    for (let i = 0; i < 70; i++) {
      const r = makeRng(i * 29 + Math.floor((x + camX) / 200) * 13);
      circle(ctx, x + r() * w, y + 12 + r() * Math.min(h - 14, 120), 2, '#ffffff');
    }
    ctx.restore();
    /* the reflection of the strip light, running the whole way along */
    ctx.save(); ctx.globalAlpha = .3;
    fillRR(ctx, x, y + 16, w, 7, 3, '#ffffff'); ctx.restore();
  },
  /* city paving: slabs, kerb, a drain here and there */
  cityPave(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 11, 0, pal.floorTop);
    fillRR(ctx, x, y + 11, w, 5, 0, shade(pal.floorTop, -.22));
    ctx.save(); ctx.globalAlpha = .4;
    for (let px = Math.floor((x + camX) / 88) * 88 - camX; px < x + w; px += 88)
      if (px > x) line(ctx, px, y + 12, px, y + h, shade(pal.floorBody, -.28), 2.4);
    for (let i = 0; i < 3; i++) line(ctx, x, y + 30 + i * 34, x + w, y + 30 + i * 34, shade(pal.floorBody, -.2), 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .35;
    for (let px = Math.floor((x + camX) / 350) * 350 - camX; px < x + w; px += 350)
      if (px > x) {
        fillRR(ctx, px, y + 44, 54, 20, 3, '#3f4a58');
        for (let k = 0; k < 4; k++) line(ctx, px + 6 + k * 13, y + 47, px + 6 + k * 13, y + 61, '#7a8694', 3);
      }
    ctx.restore();
    /* wet, because it is raining */
    ctx.save(); ctx.globalAlpha = .16;
    fillRR(ctx, x, y + 14, w, 9, 4, '#cfe0ee'); ctx.restore();
  },
  /* salon tiles: pink and white chequer, and always a little soapy */
  salonTile(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    ctx.save(); ctx.globalAlpha = .85;
    const S = 44;
    for (let px = Math.floor((x + camX) / S) * S - camX; px < x + w; px += S) {
      for (let row = 0; row * S < h; row++) {
        const col = imod(Math.round((px + camX) / S) + row, 2);
        if (col) continue;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.max(px, x), y + 10 + row * S, Math.min(S, x + w - px), S);
      }
    }
    ctx.restore();
    fillRR(ctx, x, y, w, 10, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .3;
    for (let i = 0; i < 5; i++) {
      const r = makeRng(i * 41 + Math.floor((x + camX) / 260) * 7);
      fillEll(ctx, x + r() * w, y + 24 + r() * 40, 18 + r() * 22, 6 + r() * 5, '#ffffff');
    }
    ctx.restore();
  },
  /* alley stone: old setts, puddles between them */
  alleyStone(ctx, x, y, w, h, pal, t, camX) {
    ctx.fillStyle = pal.floorBody; ctx.fillRect(x, y, w, h);
    fillRR(ctx, x, y, w, 8, 0, pal.floorTop);
    ctx.save(); ctx.globalAlpha = .4;
    const S = 30;
    for (let row = 0; row * 18 < Math.min(h, 110); row++) {
      const off = (row % 2) * (S / 2);
      for (let px = Math.floor((x + camX - off) / S) * S - camX + off; px < x + w; px += S)
        if (px > x - S) fillRR(ctx, Math.max(px, x) + 2, y + 10 + row * 18, S - 5, 14, 3, shade(pal.floorBody, row % 3 ? .09 : -.12));
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .22;
    for (let px = Math.floor((x + camX) / 300) * 300 - camX; px < x + w; px += 300)
      if (px > x) fillEll(ctx, px + 60, y + 46, 62, 13, '#8fb8d8');
    ctx.restore();
  }
});

/* =============================================================
   THE FIVE ARENAS
============================================================= */
const ZONES4 = [
  {
    /* ---- 1 · she lands on the vet's floor and does not stop ---- */
    id: 'vetroom', exit: 'clinicDoor', name: 'Veterinarijos kabinetas', sec: 10, diff: 0.34,
    sub: 'nušoko nuo stalo — ir jau bėga', floor: 'clinicLino',
    pal: { floorTop: '#dfe8ee', floorBody: '#b8c8d0', accent: '#e2453c',
           treadTop: '#e8eef2', treadSide: '#a8b8c4' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG4.clinicWall(ctx, VW, VH, camX, floorY, t, '#eaf2f6', '#bcd8e4', '#5fa8c4');
      /* the examination table she has just jumped off, receding behind her */
      ctx.save(); ctx.globalAlpha = .95;
      tileLayer(camX * 0.62, 620, VW, x => {
        fillRR(ctx, x + 40, floorY - 152, 210, 20, 6, '#c4d0d8');
        fillRR(ctx, x + 46, floorY - 158, 198, 10, 5, '#e8eef2');
        fillRR(ctx, x + 128, floorY - 134, 34, 134, 5, '#8b98a6');
        fillEll(ctx, x + 145, floorY - 4, 56, 11, '#7a8694');
        /* the nail clippers, abandoned on it */
        ctx.save(); ctx.globalAlpha = .9;
        PROPS.nailClipper(ctx, x + 168, floorY - 186, 54, 34); ctx.restore();
      });
      ctx.restore();
    },
    pools: { hurdle: ['vetStool', 'vetBin', 'petScale', 'carrierBox', 'pillTower'],
             over: ['examLamp'], tunnel: ['xrayArch'],
             ledge: ['vetCounter'], step: ['vetCrate', 'petScale'],
             deco: ['pawTile', 'furTuft'] }
  },

  {
    /* ---- 2 · out through the clinic. Short: it is the lesson, not the test ---- */
    id: 'corridor', exit: 'clinicExit', name: 'Klinikos koridorius', sec: 32, diff: 0.5,
    stops: 1,
    sub: 'pro narvus ir dėžes link išėjimo', floor: 'clinicLino', chaser: 'vet',
    pal: { floorTop: '#e8dcc0', floorBody: '#c9b898', accent: '#3f9c6a',
           treadTop: '#f2ece0', treadSide: '#b8a684' },
    bg(ctx, VW, VH, camX, floorY, t, pal) {
      BG4.clinicWall(ctx, VW, VH, camX, floorY, t, '#f2f6f0', '#cfe4d4', '#3f9c6a');
      /* a wall of kennels, and somebody watching her go past in each one */
      ctx.save(); ctx.globalAlpha = .92;
      tileLayer(camX * 0.62, 400, VW, (x, i) => {
        for (let r = 0; r < 2; r++) {
          const ky = floorY - 268 + r * 130;
          fillRR(ctx, x + 24, ky, 160, 118, 6, '#c8d4dc');
          fillRR(ctx, x + 32, ky + 8, 144, 102, 4, '#26323c');
          ctx.save(); ctx.globalAlpha = .85;
          for (let k = 0; k < 8; k++) line(ctx, x + 38 + k * 18, ky + 10, x + 38 + k * 18, ky + 108, '#8b98a6', 3);
          ctx.restore();
          /* two eyes and a nose in the dark */
          const on = imod(i * 7 + r * 3, 3) > 0;
          if (on) {
            const bl = Math.sin(t * 1.7 + i + r * 2) > -0.9;
            circle(ctx, x + 92, ky + 62, 4.4, bl ? '#ffe08a' : '#26323c');
            circle(ctx, x + 112, ky + 62, 4.4, bl ? '#ffe08a' : '#26323c');
            fillEll(ctx, x + 102, ky + 76, 7, 5, '#5f4a54');
          }
        }
      });
      ctx.restore();
    },
    pools: { hurdle: ['carrierBox', 'mopBucket', 'waitChair', 'oxygenTank', 'boxStack'],
             over: ['signHang'], tunnel: ['wardArch'],
             ledge: ['receptionDesk'], step: ['boxStack', 'vetCrate'],
             deco: ['linoStripe', 'pawTile'] }
  },

  {
    /* ---- 3 · the street. The long one, and the one that hurts ----
       Everything the vet can lay a hand on comes over the top of the
       screen at her, and there is barely time to read it. */
    id: 'street', name: 'Miesto gatvė', sec: 92, diff: 0.84, floor: 'cityPave',
    exit: 'salonDoor', chaser: 'vet', stops: 4,
    sub: 'ilgiausia dalis — ir viskas skrenda jai iš paskos',
    pal: { floorTop: '#a8b0bc', floorBody: '#767e8c', accent: '#e8534c',
           treadTop: '#c0c8d4', treadSide: '#69707c' },
    bg(ctx, VW, VH, camX, floorY, t, pal) { BG4.cityFront(ctx, VW, VH, camX, floorY, t); },
    pools: { hurdle: ['binCity', 'coneCity', 'benchCity', 'postBoxCity', 'scooter', 'marketStall'],
             over: ['awningShop'], tunnel: ['scaffoldTunnel'],
             ledge: ['stallLedge'], step: ['crateMarket', 'plantTub'],
             thrown: ['needleTool', 'nailClipper', 'vetScissors', 'thermoTool', 'pillJar', 'combTool'],
             deco: ['manhole', 'pawTile'] }
  },

  {
    /* ---- 4 · in through the salon door, and straight back out ----
       She skids, turns on the spot and is gone again before the
       groomer has worked out which way she went. */
    id: 'salon', name: 'Šunų kirpykla', sec: 48, diff: 0.92, floor: 'salonTile',
    exit: 'backDoor', chaser: 'groomer', spins: 3, stops: 2,
    sub: 'kirpėja su mašinėle — ir Lota apsisuka jai prieš nosį',
    pal: { floorTop: '#ffd8e2', floorBody: '#f0b8c8', accent: '#e0748c',
           treadTop: '#fff0f4', treadSide: '#e0a8bc' },
    bg(ctx, VW, VH, camX, floorY, t, pal) { BG4.salonWall(ctx, VW, VH, camX, floorY, t); },
    pools: { hurdle: ['groomTable', 'dryerUnit', 'shampooTub', 'towelPile', 'bottleShelfLow'],
             over: ['dryerHose'], tunnel: ['mirrorArch'],
             ledge: ['groomBench'], step: ['shampooTub', 'stepStool'],
             thrown: ['clipperTool', 'brushTool', 'bowTool', 'sprayTool', 'combTool'],
             deco: ['furDrift', 'bubbleDeco'] }
  },

  {
    /* ---- 5 · the last run home, with both of them right behind ---- */
    id: 'alley', name: 'Paskutinis pabėgimas', sec: 62, diff: 1.0, floor: 'alleyStone',
    last: true, chaser: 'both', stops: 3,
    sub: 'visi iš paskos — greičiausia ir sunkiausia atkarpa',
    pal: { floorTop: '#8a7f74', floorBody: '#5a5158', accent: '#ffd870',
           treadTop: '#a89c90', treadSide: '#4a4248' },
    bg(ctx, VW, VH, camX, floorY, t, pal) { BG4.alleyWall(ctx, VW, VH, camX, floorY, t); },
    pools: { hurdle: ['dustBinAlley', 'palletStack', 'tyreStack', 'fenceGap', 'crateAlley', 'binCity'],
             over: ['fireEscape'], tunnel: ['alleyArch'],
             ledge: ['loadingLedge'], step: ['palletStack', 'crateAlley'],
             thrown: ['needleTool', 'nailClipper', 'vetScissors', 'clipperTool', 'brushTool', 'sprayTool'],
             deco: ['puddleDeco', 'pawTile'] }
  }
];
const ZONE4_BY_ID = {};
ZONES4.forEach((z, i) => { z.index = i; ZONE4_BY_ID[z.id] = z; });

/* No second routes on the boss level: there is nowhere to hide and
   nothing to go looking for. The generator still wants the table. */
const BRANCHES4 = {};
