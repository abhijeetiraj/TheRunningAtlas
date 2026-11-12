// The Course fly-over's pacing plan (claim C5, a model). Plain functions, no DOM, so they can be tested on their own.
// The plan keeps the energy cost per minute steady: on each short stretch, speed is the flat speed divided by how
// much more (or less) each metre costs on that slope (the hill curve, claim H17). Downhill, it lets you go at most
// DOWN_CAP times the flat speed, because braking, footing and sore legs limit how much a downhill gives back.
import { hillCost } from '../scripts/run-math.js';

export const DOWN_CAP = 1.08;
export const STEP = 0.05;               // km between samples

/** Elevation in metres at `km` along a course: cosine easing between its control points. */
export function elevAt(course, km) {
  const p = course.elev;
  if (km <= p[0][0]) return p[0][1];
  for (let i = 1; i < p.length; i++) {
    if (km <= p[i][0]) {
      const [k0, e0] = p[i - 1], [k1, e1] = p[i];
      const u = (km - k0) / (k1 - k0);
      return e0 + (e1 - e0) * (1 - Math.cos(Math.PI * u)) / 2;
    }
  }
  return p[p.length - 1][1];
}

/** Speed factor on gradient g (a fraction) against the flat, for the same energy per minute. */
export const effortFactor = g => Math.min(DOWN_CAP, hillCost(0) / hillCost(g));

/**
 * The plan for a finishing time in seconds. Returns samples (d km, e m, t s on the clock), each stretch's pace
 * (s per km) and gradient, per-km splits, and summary numbers.
 */
export function buildPlan(course, timeSec) {
  const n = Math.ceil(course.km / STEP - 1e-9);
  const d = [], e = [];
  for (let i = 0; i <= n; i++) { const k = Math.min(i * STEP, course.km); d.push(k); e.push(elevAt(course, k)); }
  const seg = [];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const len = d[i + 1] - d[i];
    const g = (e[i + 1] - e[i]) / (len * 1000);
    const f = effortFactor(g);
    seg.push({ len, g, f });
    sum += len / f;
  }
  const v0 = sum / timeSec;                                   // flat-equivalent speed, km per s
  const t = [0];
  for (const s of seg) { s.pace = 1 / (v0 * s.f); t.push(t[t.length - 1] + s.len * s.pace); }

  const at = (arr, km) => {                                     // linear lookup by distance
    const k = Math.min(Math.max(km, 0), course.km), i = Math.min(n - 1, Math.floor(k / STEP));
    const u = Math.min(1, Math.max(0, (k - d[i]) / (d[i + 1] - d[i] || STEP)));
    return arr[i] + (arr[i + 1] - arr[i]) * u;
  };
  const splits = [];
  for (let k0 = 0; k0 < course.km - 1e-9; k0 += 1) {
    const k1 = Math.min(course.km, k0 + 1);
    let up = 0, down = 0;
    for (let i = 0; i < n; i++) {
      if (d[i] >= k0 - 1e-9 && d[i + 1] <= k1 + 1e-9) { const de = e[i + 1] - e[i]; if (de > 0) up += de; else down -= de; }
    }
    const tt = at(t, k1) - at(t, k0);
    splits.push({ k: k1, len: k1 - k0, up, down, time: tt, pace: tt / (k1 - k0), clock: at(t, k1) });
  }
  let climb = 0, fall = 0;
  for (let i = 0; i < n; i++) { const de = e[i + 1] - e[i]; if (de > 0) climb += de; else fall -= de; }
  const full = splits.filter(s => s.len > 0.5);
  return {
    d, e, t, seg, splits, v0,
    flatPace: 1 / v0, evenPace: timeSec / course.km,
    climb, fall, high: Math.max(...e), low: Math.min(...e),
    slowest: full.reduce((a, b) => (b.pace > a.pace ? b : a), full[0]),
    fastest: full.reduce((a, b) => (b.pace < a.pace ? b : a), full[0]),
    at,
  };
}

/** Index of the stretch that contains `km`. */
export const segIndex = (plan, km) => Math.max(0, Math.min(plan.seg.length - 1, Math.floor(km / STEP)));
