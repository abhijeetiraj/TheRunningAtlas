// Motion library: each move(t, o) returns { pose, lv: muscle levels, md: muscle modes, ev: events }.
// t = seconds since the move started. Left leg (+1) is the working leg unless a move alternates.
import { neutralPose, DIM, STAND_Y } from './rig.js';

const PI = Math.PI;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const HX = DIM.hipW + 0.01;

function breathe(p, t, amt = 1) {
  const b = Math.sin(t * 2 * PI / 4.2) * amt;
  p.chF += -0.012 * b; p.spF += 0.004 * b; p.hdF += 0.01 * b;
  p.arm[1].abd += 0.012 * b; p.arm[-1].abd += 0.012 * b;
  return p;
}
const runArms = (p, ph, amp = 0.55, elbow = 1.45) => {
  p.arm[1] = { flex: amp * Math.sin(ph + PI), abd: 0.12, elbow: elbow + 0.15 * Math.sin(ph) };
  p.arm[-1] = { flex: amp * Math.sin(ph), abd: 0.12, elbow: elbow - 0.15 * Math.sin(ph) };
};

// ------------------------------------------------------------ static stance and holds
export function stand(t) {
  const p = breathe(neutralPose(), t);
  p.pRoll = 0.01 * Math.sin(t * 0.7);
  return { pose: p, lv: {}, md: {} };
}

// standing quad stretch: right leg stance, left heel pulled to seat, left hand holds the ankle
export function quadHold(t, o = {}) {
  const p = breathe(neutralPose(), t, 0.6);
  const k = ss(0, 1.4, t) * (o.release ? 1 - ss(o.release, o.release + 1.0, t) : 1);
  p.leg[-1] = { ik: { x: -0.05, z: 0.0 } };
  p.px = -0.04 * k; p.pRoll = -0.03 * k;
  p.leg[1] = k > 0.001 ? { flex: lerp(0, -0.2, k), knee: lerp(0.05, 2.5, k), ankle: lerp(0, 0.6, k), abd: -0.03 } : { ik: { x: HX, z: 0 } };
  p.arm[1] = { flex: lerp(0.05, -0.5, k), abd: lerp(0.12, 0.06, k), elbow: lerp(0.25, 0.2, k), rot: 0, wrist: 0.3 * k };
  p.arm[-1] = { flex: lerp(0.05, 0.2, k), abd: lerp(0.12, 0.75, k), elbow: lerp(0.25, 0.4, k) };
  p.spF = 0.03 + 0.04 * k;
  return { pose: p, lv: { quadsL: k, hipflexorsL: 0.6 * k }, md: {} };
}

// static hamstring hinge: left heel forward, toes up, hips back, flat back, hands on the right thigh
export function hamHold(t, o = {}) {
  const p = breathe(neutralPose(), t, 0.5);
  const k = ss(0.2, 2.0, t) * (o.release ? 1 - ss(o.release, o.release + 1.2, t) : 1);
  p.py = STAND_Y - 0.06 * k; p.pz = -0.1 * k; p.pTilt = 0.62 * k;
  p.spF = -0.04 * k; p.chF = 0.0; p.nkF = -0.3 * k; p.hdF = -0.1 * k;
  p.leg[1] = { ik: { x: HX, z: lerp(0, 0.3, ss(0, 0.6, t)), heel: true, pitch: -0.45 * k, lift: 0.05 * Math.sin(PI * ss(0, 0.6, t)) * (1 - k) } };
  p.leg[-1] = { ik: { x: -HX, z: -0.06 * k } };
  p.arm[1] = { flex: 0.5 * k + 0.05, abd: 0.1, elbow: 0.2 + 0.3 * k };
  p.arm[-1] = { flex: 0.5 * k + 0.05, abd: 0.12, elbow: 0.2 + 0.3 * k };
  return { pose: p, lv: { hamstringsL: k, calvesL: 0.5 * k }, md: {} };
}

// ------------------------------------------------------------ leg swings
// front-to-back swing of the left leg, right hand on the post at x = -0.55
export function swingFB(t, o = {}) {
  const p = breathe(neutralPose(), t, 0.4);
  const T = 1.5, w = 2 * PI / T, start = o.start || 0.3;
  const grow = ss(start, start + 4.0, t);
  const s = Math.sin(w * Math.max(0, t - start));
  const env = ss(start, start + 0.6, t);
  const fwd = (0.35 + 0.62 * grow) * env, back = (0.22 + 0.28 * grow) * env;
  const hipFlex = s > 0 ? s * fwd : s * back;
  p.leg[-1] = { ik: { x: -HX + 0.01, z: 0.0 } };
  p.leg[1] = { flex: hipFlex, knee: 0.12 + 0.35 * Math.max(0, -s) * env + 0.15 * Math.max(0, Math.cos(w * (t - start))) * env, ankle: -0.15 * s * env, abd: 0.02 };
  p.pTilt = -0.07 * hipFlex; p.spF = 0.06 * hipFlex + 0.02;
  p.arm[-1] = { flex: 0.12, abd: 0.78, elbow: 0.55, rot: 0 };       // on the post
  p.arm[1] = { flex: -0.55 * s * env, abd: 0.25, elbow: 0.45 };
  return { pose: p, lv: { hamstringsL: 1, hipflexorsL: 1 }, md: {}, phase: s * env };
}

// side-to-side swing facing the post (post in front at z = 0.55)
export function swingSide(t, o = {}) {
  const p = breathe(neutralPose(), t, 0.4);
  const T = 1.6, w = 2 * PI / T, start = o.start || 0.3;
  const env = ss(start, start + 0.6, t), grow = ss(start, start + 4, t);
  const s = Math.sin(w * Math.max(0, t - start));
  const amp = s > 0 ? (0.42 + 0.3 * grow) : (0.3 + 0.2 * grow);
  const abd = s * amp * env;
  p.leg[-1] = { ik: { x: -HX + 0.02, z: 0.0 } };
  p.leg[1] = { flex: 0.12 + 0.22 * Math.max(0, -s) * env, knee: 0.12, ankle: 0.05, abd: abd + 0.02 };
  p.pRoll = 0.08 * abd; p.px = -0.02 * env; p.spS = -0.05 * abd;
  p.arm[1] = { flex: 1.05, abd: 0.25, elbow: 0.55 }; p.arm[-1] = { flex: 1.05, abd: 0.25, elbow: 0.55 };
  return { pose: p, lv: { adductorsL: 1, abductorsL: 1 }, md: {}, phase: s * env };
}

// one-leg stance: pelvis kept level by the right outer hip (stance side)
export function oneLeg(t) {
  const p = breathe(neutralPose(), t, 0.4);
  const k = ss(0.1, 0.8, t);
  p.px = -0.05 * k;
  p.leg[-1] = { ik: { x: -HX + 0.02, z: 0 } };
  p.leg[1] = { flex: 0.5 * k, knee: 1.0 * k, ankle: 0.2 * k };
  p.arm[1] = { flex: 0.3 * k, abd: 0.3, elbow: 1.0 * k }; p.arm[-1] = { flex: -0.2 * k, abd: 0.2, elbow: 0.9 * k };
  return { pose: p, lv: { abductorsR: 1 }, md: { abductorsR: 'work' } };
}

// ------------------------------------------------------------ lunge with reach (in place, alternating)
export function lunge(t, o = {}) {
  const C = 3.6, n = Math.floor(t / C), u = (t % C) / C;
  const side = n % 2 === 0 ? 1 : -1;               // leading leg
  // phases: 0-.22 step out, .22-.45 lower, .45-.62 hold, .62-.8 rise, .8-1 step back
  const out = ss(0, 0.22, u) * (1 - ss(0.8, 1.0, u));
  const down = ss(0.2, 0.45, u) * (1 - ss(0.62, 0.8, u));
  const p = breathe(neutralPose(), t, 0.3);
  const L = 0.66;
  const lift = 0.07 * Math.sin(PI * clamp(u / 0.22)) + 0.07 * Math.sin(PI * clamp((u - 0.8) / 0.2));
  p.leg[side] = { ik: { x: HX * side + 0.01 * side, z: L * out, lift } };
  p.leg[-side] = { ik: { x: -HX * side, z: -0.1 * out, ball: true, pitch: 1.05 * down + 0.15 * out } };
  p.py = STAND_Y - 0.36 * down - 0.035 * out; p.pz = L * 0.42 * out; p.pTilt = -0.05 * down;
  p.spF = -0.06 * down; p.chF = -0.06 * down;
  const reach = ss(0.32, 0.5, u) * (1 - ss(0.62, 0.78, u));
  p.arm[1] = { flex: lerp(0.08, 2.95, reach), abd: lerp(0.15, 0.12, reach), elbow: lerp(0.3, 0.05, reach) };
  p.arm[-1] = { flex: lerp(0.08, 2.95, reach), abd: lerp(0.15, 0.12, reach), elbow: lerp(0.3, 0.05, reach) };
  const S = side > 0 ? 'L' : 'R', B = side > 0 ? 'R' : 'L';
  const lv = { ['hipflexors' + B]: 1, ['quads' + S]: 1, ['glutes' + S]: 1 };
  const md = { ['quads' + S]: 'work', ['glutes' + S]: 'work' };
  return { pose: p, lv, md, side, down };
}

// ------------------------------------------------------------ gait-style drills (feet driven by IK paths)
// kind: 'jog' | 'march' | 'knees' | 'kicks' | 'stride'
export function drill(t, o = {}) {
  const kind = o.kind || 'jog';
  const cad = { march: 1.05, jog: 1.35, knees: 1.6, kicks: 1.6, stride: 1.45 }[kind];   // leg cycles per second
  const duty = { march: 0.62, jog: 0.42, knees: 0.4, kicks: 0.4, stride: 0.34 }[kind];
  const v = kind === 'stride' ? (o.v != null ? o.v : 3.6) : 0;                            // treadmill speed (m/s)
  const p = neutralPose();
  const ev = [];
  let pyBase = STAND_Y - 0.035, bounce = 0;
  const amp = o.amp != null ? o.amp : 1;
  for (const side of [1, -1]) {
    const ph = ((t * cad + (side > 0 ? 0 : 0.5)) % 1 + 1) % 1;
    const x = HX * side;
    let z, y = 0, pitch = 0, ball = false;
    if (ph < duty) {                        // stance
      const q = ph / duty;
      if (q < 1 / (30 * cad * duty) + 1e-6) ev.push(side);      // landing (first frame of stance)
      z = v > 0 ? lerp(0.32, -0.34, q) : 0.02;
      pitch = v > 0 ? 0.9 * ss(0.55, 1, q) : (kind === 'march' ? 0.0 : kind === 'jog' ? 0.05 + 0.3 * ss(0.6, 1, q) : 0.25 + 0.2 * ss(0.6, 1, q));
      ball = true;
    } else {                                 // swing
      const q = (ph - duty) / (1 - duty);
      const arc = Math.sin(PI * q);
      if (kind === 'knees') { z = lerp(0.02, 0.02, q) + 0.32 * arc * amp; y = 0.5 * Math.pow(arc, 0.8) * amp; pitch = 0.35; ball = true; }
      else if (kind === 'march') { z = 0.02 + 0.26 * arc * amp; y = 0.38 * arc * amp; pitch = 0.15; ball = true; }
      else if (kind === 'kicks') { z = 0.02 - 0.3 * arc * amp; y = 0.55 * Math.pow(arc, 0.7) * amp; pitch = 0.55 * arc; ball = true; }
      else if (kind === 'stride') { z = lerp(-0.34, 0.32, ease(q)) - 0.18 * arc; y = 0.42 * Math.pow(Math.sin(PI * Math.min(1, q * 1.15)), 1.2); pitch = 0.6 * (1 - q); ball = true; }
      else { z = 0.02 + 0.08 * arc - 0.12 * Math.sin(PI * q) * 0.5; y = 0.2 * arc * amp; pitch = 0.4 * (1 - q); ball = true; }
    }
    p.leg[side] = { ik: { x, z, ball, pitch, lift: y } };
  }
  // vertical bounce: low during double/single stance, up in flight
  const phA = (t * cad) % 1, phB = (t * cad + 0.5) % 1;
  const st = q => (q < duty ? Math.sin(PI * q / duty) : 0);
  const load = Math.max(st(phA), st(phB));
  if (kind === 'march') { bounce = 0.01 * load; pyBase = STAND_Y - 0.01; }
  else if (kind === 'jog') { pyBase = STAND_Y + 0.0; bounce = -0.03 * load + 0.015; }
  else bounce = -0.045 * load + 0.03;
  p.py = pyBase + bounce * (kind === 'stride' ? 1.3 : 1);
  p.spF = kind === 'stride' ? 0.1 : 0.05;
  const armPh = 2 * PI * t * cad;
  runArms(p, armPh, kind === 'march' ? 0.45 : kind === 'stride' ? 0.7 : 0.55, kind === 'march' ? 0.6 : 1.45);
  return { pose: p, lv: {}, md: {}, ev };
}

// ------------------------------------------------------------ calf raises then ankle rocks
export function calves(t, o = {}) {
  const p = breathe(neutralPose(), t, 0.3);
  const R = 2.6;                     // one slow raise
  const nR = o.raises || 2;
  let pitch = 0, rock = 0, mode = 'work';
  if (t < nR * R) { const u = (t % R) / R; pitch = 0.62 * (ss(0, 0.3, u) * (1 - ss(0.45, 0.95, u))); }
  else { const u = ((t - nR * R) % 2.2) / 2.2; rock = Math.sin(PI * u) ** 2 * ss(nR * R, nR * R + 0.4, t); mode = 'stretch'; }
  // heels up: ankles rise about the balls of the feet; rock: knees forward, heels down
  for (const side of [1, -1]) p.leg[side] = pitch > 0.001 ? { ik: { x: HX * side, z: 0.0, ball: true, pitch } } : { ik: { x: HX * side, z: 0.0 } };
  const ay = DIM.ankleH * Math.cos(pitch) + DIM.ballZ * Math.sin(pitch) - DIM.ankleH;
  p.py = STAND_Y + ay - 0.2 * rock; p.pz = 0.17 * rock;
  p.spF = 0.02 + 0.12 * rock;
  p.arm[1] = { flex: 0.12 + 0.4 * rock, abd: 0.15, elbow: 0.3 + 0.5 * rock }; p.arm[-1] = { flex: 0.12 + 0.4 * rock, abd: 0.15, elbow: 0.3 + 0.5 * rock };
  const lv = { calvesL: 1, calvesR: 1, achillesL: 1, achillesR: 1 };
  const md = { calvesL: mode, calvesR: mode };
  return { pose: p, lv, md, mode };
}

// ------------------------------------------------------------ open / close the gate (left leg)
export function gate(t, o = {}) {
  const p = breathe(neutralPose(), t, 0.3);
  const C = 2.8, n = Math.floor(t / C), u = (t % C) / C;
  const close = (o.closeAfter != null && n >= o.closeAfter);
  // open: knee up in front -> out to the side -> down. close: reverse path
  const lift = ss(0, 0.3, u) * (1 - ss(0.75, 1, u));
  let side = ss(0.28, 0.62, u);
  if (close) side = 1 - ss(0.28, 0.62, u);
  const outAmt = close ? (u < 0.3 ? 1 : 1 - ss(0.28, 0.62, u)) : side;
  const knee = 1.75 * lift;
  const flex = 1.45 * lift;
  const abd = 1.05 * lift * (close ? (u < 0.28 ? 1 : 1 - ss(0.28, 0.62, u)) : side);
  p.leg[-1] = { ik: { x: -HX + 0.02, z: 0 } };
  p.leg[1] = { flex, knee, ankle: 0.25 * lift, abd, rot: -0.55 * abd };
  p.px = -0.03 * lift; p.pRoll = 0.03 * abd;
  p.arm[1] = { flex: 0.1, abd: 0.55 * lift + 0.15, elbow: 0.4 }; p.arm[-1] = { flex: 0.1, abd: 0.55 * lift + 0.15, elbow: 0.4 };
  return { pose: p, lv: { adductorsL: 1, rotatorsL: 1 }, md: {}, outAmt };
}

// blend two poses (numbers and nested objects); flags come from b
export function lerpPose(a, b, k) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * k;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if ((a.ik && !b.ik) || (!a.ik && b.ik)) return k < 0.5 ? a : b;
    const o = {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(key in a)) o[key] = b[key]; else if (!(key in b)) o[key] = a[key];
      else if (typeof b[key] === 'boolean') o[key] = b[key];
      else o[key] = lerpPose(a[key], b[key], k);
    }
    return o;
  }
  return k < 0.5 ? a : b;
}
