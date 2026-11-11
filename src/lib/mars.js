// The Sun at a place on Mars, after NASA GISS's Mars24 algorithm (Allison & McEwen 2000).
// Ported from Jezero Base (src/lib/mars.ts) so Day and Dusk here match the base exactly.
// It must stay self-contained: Base.astro inlines its source as the script that sets Day/Dusk before the first paint.

/** The Sun's height above the horizon in degrees (below zero at night) at a place (latitude north, longitude east) at `ms`, in Unix milliseconds. */
export function marsSun(ms, latN, lonE) {
  const rad = Math.PI / 180;
  const jdTT = ms / 86400000 + 2440587.5 + 69.184 / 86400;
  const t = jdTT - 2451545.0;
  const m = (19.3871 + 0.52402073 * t) * rad;
  const fms = 270.3871 + 0.524038496 * t;
  const pa = [0.0071, 0.0057, 0.0039, 0.0037, 0.0021, 0.002, 0.0018];
  const pt = [2.2353, 2.7543, 1.1177, 15.7866, 2.1354, 2.4694, 32.8493];
  const pp = [49.409, 168.173, 191.837, 21.736, 15.704, 95.528, 49.095];
  let pbs = 0;
  for (let i = 0; i < 7; i++) pbs += pa[i] * Math.cos(((0.985626 * t) / pt[i] + pp[i]) * rad);
  const nuM = (10.691 + 3e-7 * t) * Math.sin(m) + 0.623 * Math.sin(2 * m) + 0.05 * Math.sin(3 * m) + 0.005 * Math.sin(4 * m) + 0.0005 * Math.sin(5 * m) + pbs;
  const ls = (((fms + nuM) % 360) + 360) % 360;
  const l = ls * rad;
  const eot = 2.861 * Math.sin(2 * l) - 0.071 * Math.sin(4 * l) + 0.002 * Math.sin(6 * l) - nuM;
  const msd = (jdTT - 2405522.0028779) / 1.0274912517;
  const mtc = (((msd % 1) * 24) + 24) % 24;
  const lmst = (mtc + lonE / 15 + 24) % 24;
  const ltst = lmst + eot / 15;
  const dec = Math.asin(0.42565 * Math.sin(l)) + 0.25 * rad * Math.sin(l);
  const lat = latN * rad, h = (ltst - 12) * 15 * rad;
  return Math.asin(Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(h)) / rad;
}
