// The Jezero Base look for the 3D stage: a plaster runner on red Martian ground, with rover tracks that scroll under
// the feet like a treadmill belt. The sky is the CSS gradient behind the transparent canvas (src/styles/global.css),
// so the ground fades into it with fog of the same colour. Day and Dusk follow the page's sky switch.
// Colours here match the CSS tokens (--m-work, --force and so on).

const shared = {
  figure: { skin: '#ece5da', joint: '#d2c7b8', shoe: '#22303f', cap: '#137872' },
  muscles: { work: '#d9822b', stretch: '#b8326b', spring: '#2f8f5b' },
  prop: '#a59e95',

  // regolith: fine speckle and a few darker patches on a mid tone (tiled; the colour comes from the material)
  ground(g, rnd) {
    const S = 512;
    g.fillStyle = '#bdbdbd'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 26; i++) {
      const x = rnd() * S, y = rnd() * S, r = 30 + rnd() * 90;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      const a = 0.05 + rnd() * 0.08, dark = rnd() < 0.6;
      gr.addColorStop(0, dark ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { g.save(); g.translate(dx, dy); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore(); }
    }
    for (let i = 0; i < 9000; i++) {
      const v = rnd() < 0.5 ? 0 : 255;
      g.fillStyle = `rgba(${v},${v},${v},${0.05 + rnd() * 0.12})`;
      const s = rnd() < 0.92 ? 1 : 2;
      g.fillRect(rnd() * S, rnd() * S, s, s);
    }
  },

  // rover tracks: two tread bands with chevrons and a lightly packed strip between them
  // (256 x 512 tile = 1.22 m x 1 m; drawn in greys and tinted by the material)
  trail(g) {
    g.clearRect(0, 0, 256, 512);
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(48, 0, 160, 512);
    for (const x0 of [10, 196]) {
      g.fillStyle = 'rgba(0,0,0,0.30)'; g.fillRect(x0, 0, 50, 512);
      g.strokeStyle = 'rgba(0,0,0,0.42)'; g.lineWidth = 5;
      for (let y = -16; y < 528; y += 32) { g.beginPath(); g.moveTo(x0 + 4, y + 12); g.lineTo(x0 + 25, y); g.lineTo(x0 + 46, y + 12); g.stroke(); }
    }
  },
};

export const MARS = {
  day: {
    ...shared,
    groundColor: '#c4794e', rock: '#7a4430', track: '#5e3019',
    fog: ['#e2bc98', 7, 34],
    force: '#137872', path: '#2b1b14',
    hemi: ['#ffe9d2', '#a2603e', 1.05],
    key: ['#fff0dc', 2.6],
    rim: ['#ffd4ad', 0.8],
    fill: ['#ffe8d6', 0.45],
    envIntensity: 0.5,
    exposure: 1.0,
  },
  dusk: {
    ...shared,
    groundColor: '#4b3a3a', rock: '#2a2026', track: '#3a2c2c',
    fog: ['#151b28', 5, 26],
    force: '#7fe3da', path: '#eaf0f7',
    hemi: ['#6f8fc0', '#1c1414', 0.55],
    key: ['#ffe2c2', 2.3],
    rim: ['#7fe3da', 1.1],
    fill: ['#8fb4ff', 0.35],
    envIntensity: 0.32,
    exposure: 1.05,
  },
};
