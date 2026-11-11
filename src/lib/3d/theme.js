// The Trail atlas look for the 3D stage: a plaster runner on map paper, contour rings on the floor
// and a dashed trail that scrolls under the feet like a treadmill belt.
// Colours here match the CSS tokens in src/styles/global.css (--m-work, --force and so on).

export const ATLAS = {
  figure: { skin: '#e6dccb', joint: '#cbbfac', shoe: '#e8590c', cap: '#1f4d3a' },
  muscles: { work: '#d9822b', stretch: '#b8326b', spring: '#2f8f5b' },
  force: '#2b6cb0',
  path: '#1f4d3a',
  prop: '#9c8f7a',
  hemi: ['#fff6e8', '#d9cfbf', 1.1],
  key: ['#fff1dc', 2.5],
  rim: ['#ffe6c7', 0.9],
  fill: ['#ffffff', 0.55],
  envIntensity: 0.55,
  exposure: 1.0,
  shadow: ['#3b2f20', 0.26],

  // topographic contour rings, slightly irregular, fading towards the edge (1024 px canvas = 8.4 m disc)
  floor(g) {
    g.clearRect(0, 0, 1024, 1024);
    for (let k = 1; k <= 9; k++) {
      const r0 = 46 * k;
      g.beginPath();
      for (let i = 0; i <= 240; i++) {
        const a = (i / 240) * Math.PI * 2;
        const r = r0 * (1 + 0.07 * Math.sin(3 * a + k * 0.7) + 0.04 * Math.sin(5 * a - k * 1.3) + 0.025 * Math.sin(9 * a + k));
        const x = 512 + r * Math.cos(a), y = 512 + r * Math.sin(a) * 0.96;
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.closePath();
      g.strokeStyle = `rgba(52, 84, 58, ${0.42 * (1 - k / 10)})`;
      g.lineWidth = k % 3 === 0 ? 3 : 1.6;
      g.stroke();
    }
  },

  // a trail drawn on a map: a faint band with dashed edges and a dashed blaze centre line (256 x 512 tile = 1.22 m x 1 m)
  trail(g) {
    g.clearRect(0, 0, 256, 512);
    g.fillStyle = 'rgba(21, 36, 31, 0.05)';
    g.fillRect(16, 0, 224, 512);
    g.fillStyle = 'rgba(21, 36, 31, 0.32)';
    for (let y = 0; y < 512; y += 64) { g.fillRect(14, y, 4, 36); g.fillRect(238, y, 4, 36); }
    g.fillStyle = 'rgba(217, 72, 15, 0.55)';
    for (let y = 16; y < 512; y += 128) g.fillRect(124, y, 8, 72);
  },
};
