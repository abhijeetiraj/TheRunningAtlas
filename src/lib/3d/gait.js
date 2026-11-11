// Running gait model for the Stride lab: pose, muscle timing and ground force from a stride phase.
// phi = 0..1 over one stride of the TRACKED leg (the right leg, side -1); phi = 0 is its touchdown.
// All numbers are typical values from a simple model, not measurements.
import { DIM, STAND_Y, neutralPose } from './rig.js';

const PI = Math.PI;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
const HX = DIM.hipW + 0.012;
export const TRACK = -1;   // tracked leg: right

// speed v in m/s -> stride numbers
export function gaitParams(v) {
  const cad = 146 + 8 * v;                 // steps per minute
  const Tstep = 60 / cad, Tstride = 2 * Tstep;
  const tc = 0.09 + 0.5 / v;               // ground contact time, s
  const duty = tc / Tstride;               // share of the stride one foot is on the ground
  return {
    v, cad, Tstep, Tstride, tc, duty,
    flight: Tstep - tc, stepLen: v * Tstep, Lc: v * tc,
    osc: 0.095 - 0.006 * v,                // vertical bounce of the body, m
  };
}

export const STRIKES = {
  heel: { land: -0.24, flatQ: 0.17, bump: 0.42, cop0: -0.05 },
  mid: { land: 0.03, flatQ: 0.08, bump: 0.12, cop0: 0.05 },
  fore: { land: 0.32, flatQ: 0.26, bump: 0.0, cop0: 0.12 },
};

// one leg at its own phase (0 = its touchdown)
function legAt(ph, P, strike) {
  const S = STRIKES[strike];
  const { duty, Lc, v } = P;
  const zTD = 0.3 * Lc + 0.03, zTO = zTD - Lc, pTO = 0.95;
  if (ph < duty) {
    const q = ph / duty;
    const z = zTD - Lc * q;
    if (q < S.flatQ) {
      const k = 1 - Math.pow(1 - q / S.flatQ, 2);
      const pitch = lerp(S.land, 0, k);
      return { z, pitch, heel: S.land < 0, ball: S.land >= 0, lift: 0, stance: true, q };
    }
    if (q < 0.5) return { z, pitch: 0, ball: true, lift: 0, stance: true, q };
    return { z, pitch: pTO * Math.pow((q - 0.5) / 0.5, 1.5), ball: true, lift: 0, stance: true, q };
  }
  const s = (ph - duty) / (1 - duty);
  const Ymax = 0.13 + 0.07 * v;
  const lift = Ymax * Math.pow(Math.sin(PI * Math.pow(s, 0.8)), 1.15);
  const back = 0.1 * Math.sin(PI * clamp(s / 0.45));
  const z = zTO + (zTD + 0.05 - zTO) * ss(0.1, 0.86, s) - back - 0.05 * ss(0.86, 1, s);
  if (s < 0.6) {
    const pitch = s < 0.22 ? lerp(pTO, 1.3, ss(0, 0.22, s)) : lerp(1.3, 0, ss(0.22, 0.6, s));
    return { z, pitch, ball: true, lift, stance: false, s };
  }
  const pitch = S.land * ss(0.6, 0.96, s);
  return { z, pitch, heel: S.land < 0, ball: S.land >= 0, lift, stance: false, s };
}

const phOf = (phi, side) => ((phi + (side === TRACK ? 0 : 0.5)) % 1 + 1) % 1;

export function runPose(phi, P, strike) {
  const p = neutralPose();
  const legs = {};
  for (const side of [1, -1]) {
    const L = legAt(phOf(phi, side), P, strike);
    legs[side] = L;
    p.leg[side] = { ik: { x: HX * side, z: L.z, pitch: L.pitch, ball: !!L.ball, heel: !!L.heel, lift: L.lift } };
  }
  const v = P.v;
  p.py = STAND_Y - 0.012 - 0.004 * v - (0.8 * P.osc / 2) * Math.cos(4 * PI * (phi - P.duty / 2));
  p.px = -0.012 * Math.cos(2 * PI * (phi - P.duty / 2));
  p.pTilt = 0.05 + 0.012 * v;
  p.spF = 0.07 + 0.008 * v; p.chF = 0.02;
  p.nkF = -0.06 - 0.01 * v; p.hdF = -0.03;
  const c = Math.cos(2 * PI * (phi - 0.97));          // +1 when the tracked (right) leg is furthest forward
  p.pTwist = 0.09 * c;
  p.chT = -0.2 * c; p.spT = -0.04 * c; p.nkT = 0.12 * c;
  p.pRoll = 0.02 * Math.sin(4 * PI * (phi - P.duty / 2));
  const amp = 0.34 + 0.05 * v, elb = 1.25 + 0.04 * v;
  p.arm[-1] = { flex: 0.02 - amp * c, abd: 0.14, elbow: elb - 0.15 * c, wrist: 0.1 };
  p.arm[1] = { flex: 0.02 + amp * c, abd: 0.14, elbow: elb + 0.15 * c, wrist: 0.1 };
  return { pose: p, legs };
}

// smooth window on a circular phase: on from a to b (b may pass 1)
function win(ph, a, b, edge = 0.06) {
  let x = ph; if (x < a) x += 1;
  if (x > b) return 0;
  return ss(a, a + edge, x) * (1 - ss(b - edge, b, x));
}

export function muscleLevels(phi, P) {
  const lv = {}, md = {};
  const d = P.duty;
  for (const side of [1, -1]) {
    const ph = phOf(phi, side), S = side > 0 ? 'L' : 'R';
    lv['glutes' + S] = win(ph, 0.86, 1 + 0.55 * d);
    lv['quads' + S] = win(ph, 0.9, 1 + 0.62 * d);
    lv['hamstrings' + S] = 0.9 * win(ph, 0.68, 1 + 0.3 * d, 0.08);
    lv['calves' + S] = win(ph, 0.95, 1 + 0.97 * d, 0.05);
    lv['hipflexors' + S] = 0.9 * win(ph, d - 0.02, d + 0.38 * (1 - d), 0.07);
    lv['achilles' + S] = ph < d ? 0.35 + 0.65 * Math.sin(PI * ph / d) : 0.12;
    for (const m of ['glutes', 'quads', 'hamstrings', 'calves', 'hipflexors']) md[m + S] = 'work';
    md['achilles' + S] = 'stretch';
  }
  return { lv, md };
}

// vertical (fv) and horizontal (fh, + = forward push) ground force in body weights, q = 0..1 through contact
const shapeCache = {};
function shape(q, strike) {
  const S = STRIKES[strike];
  return Math.sin(PI * q) + S.bump * Math.exp(-(((q - 0.085) / 0.035) ** 2));
}
function shapeMean(strike) {
  if (shapeCache[strike]) return shapeCache[strike];
  let s = 0; const n = 400;
  for (let i = 0; i < n; i++) s += shape((i + 0.5) / n, strike);
  return (shapeCache[strike] = s / n);
}
export function grf(q, P, strike) {
  // over a whole step the average upward force equals body weight: impulse BW * Tstep fits into contact time tc
  const fv = shape(q, strike) * (P.Tstep / P.tc) / shapeMean(strike);
  const fh = -0.4 * Math.sqrt(P.v / 3.3) * Math.sin(2 * PI * q);
  return { fv, fh };
}
export function peakForce(P, strike) {
  let m = 0;
  for (let i = 0; i <= 200; i++) m = Math.max(m, grf(i / 200, P, strike).fv);
  return m;
}
export function impactPeak(P, strike) {
  if (strike === 'fore') return null;
  let m = 0, at = 0;
  for (let i = 0; i <= 60; i++) { const q = i / 200, f = grf(q, P, strike).fv; if (f > m) { m = f; at = q; } }
  return strike === 'heel' ? { f: m, q: at } : null;
}

// force on the tracked leg (and the other leg) at stride phase phi
export function forcesAt(phi, P, strike) {
  const out = {};
  for (const side of [1, -1]) {
    const ph = phOf(phi, side);
    out[side] = ph < P.duty ? { ...grf(ph / P.duty, P, strike), q: ph / P.duty } : null;
  }
  return out;
}

// centre of pressure z (root frame) for a leg in stance
export function copZ(L, strike) {
  const S = STRIKES[strike];
  return L.z + lerp(S.cop0, DIM.ballZ + 0.02, ss(0.05, 0.85, L.q));
}

export const MOMENTS = [
  { id: 'landing', name: 'Landing', at: 0.0 },
  { id: 'loading', name: 'Loading', at: 0.25 },
  { id: 'midstance', name: 'Midstance', at: 0.5 },
  { id: 'pushoff', name: 'Push-off', at: 0.85 },
  { id: 'float', name: 'Float', at: null },
  { id: 'swing', name: 'Swing', at: null },
];

// what the tracked leg is doing at phi
export function momentAt(phi, P) {
  const d = P.duty;
  if (phi < d) {
    const q = phi / d;
    if (q < 0.14) return 'landing';
    if (q < 0.42) return 'loading';
    if (q < 0.62) return 'midstance';
    return 'pushoff';
  }
  if (phi < 0.5) return 'float';
  if (phi < 0.5 + d) return 'swing';
  return 'float';
}
export function momentPhi(id, P) {
  const d = P.duty;
  switch (id) {
    case 'landing': return 0.002;
    case 'loading': return 0.26 * d;
    case 'midstance': return 0.52 * d;
    case 'pushoff': return 0.84 * d;
    case 'float': return (d + 0.5) / 2;
    case 'swing': return 0.5 + d * 0.5;
  }
  return 0;
}

export const fmtPace = (secs) => { const m = Math.floor(secs / 60), s = Math.round(secs - m * 60); return s === 60 ? `${m + 1}:00` : `${m}:${String(s).padStart(2, '0')}`; };
