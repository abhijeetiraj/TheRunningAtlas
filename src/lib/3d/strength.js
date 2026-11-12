// Strength library motions: each move(t) returns { pose, lv: muscle levels, md: muscle modes, box }.
// The left leg (+1) is the working leg in single-leg moves. `box` asks the lab to show a step box
// ({ x, z, w, d, h } in metres) or hides it when null.
import { neutralPose, DIM, STAND_Y } from './rig.js';
import { ss, lerp, clamp } from './motion.js';

const PI = Math.PI;
const HX = DIM.hipW + 0.01;
const ease = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// height of the ankle above the ground when the heel is lifted by `pitch` about the ball of the foot
const ballRise = pitch => DIM.ankleH * Math.cos(pitch) + DIM.ballZ * Math.sin(pitch) - DIM.ankleH;
// one rep: 0 at the top, 1 at the bottom. Down over `d`, pause, up over `u`, rest at the top.
function rep(t, C, d = 0.38, hold = 0.08, u = 0.32) {
  const x = (t % C) / C;
  if (x < d) return ease(x / d);
  if (x < d + hold) return 1;
  if (x < d + hold + u) return 1 - ease((x - d - hold) / u);
  return 0;
}
const both = (k, v) => ({ [k + 'L']: v, [k + 'R']: v });

// ------------------------------------------------------------ squat (both legs)
export function squat(t) {
  const k = rep(t, 3.4);
  const p = neutralPose();
  const W = HX + 0.07;
  for (const s of [1, -1]) p.leg[s] = { ik: { x: W * s, z: 0.0 }, rot: -0.18 };
  p.py = STAND_Y - 0.015 - 0.4 * k; p.pz = -0.16 * k; p.pTilt = 0.62 * k;
  p.spF = -0.06 * k; p.chF = -0.04 * k; p.nkF = -0.25 * k; p.hdF = -0.05 * k;
  for (const s of [1, -1]) p.arm[s] = { flex: 0.1 + 1.0 * k, abd: 0.14, elbow: 0.25 + 1.0 * k };
  return { pose: p, lv: { ...both('quads', 1), ...both('glutes', 1) }, md: { ...both('quads', 'work'), ...both('glutes', 'work') }, box: null, k };
}

// ------------------------------------------------------------ split squat (left leg in front)
export function splitSquat(t) {
  const k = rep(t, 3.6);
  const p = neutralPose();
  p.leg[1] = { ik: { x: HX + 0.01, z: 0.36 } };
  p.leg[-1] = { ik: { x: -HX - 0.01, z: -0.34, ball: true, pitch: 0.55 + 0.6 * k } };
  p.py = STAND_Y - 0.06 - 0.33 * k; p.pz = 0.02 - 0.01 * k; p.pTilt = 0.06 + 0.08 * k;
  p.spF = -0.02; p.chF = -0.02;
  for (const s of [1, -1]) p.arm[s] = { flex: -0.15, abd: 0.55, elbow: 1.7, rot: 0.2 };    // hands on hips
  return { pose: p, lv: { quadsL: 1, glutesL: 1, hipflexorsR: 0.35 + 0.65 * k }, md: { quadsL: 'work', glutesL: 'work', hipflexorsR: 'stretch' }, box: null, k };
}

// ------------------------------------------------------------ single-leg calf raise, straight knee (left), right hand on the post
function calfCommon(t, bent) {
  const C = 3.4, x = (t % C) / C;
  // up in about 1 s, hold, down slowly over about 1.7 s
  const up = x < 0.3 ? ease(x / 0.3) : x < 0.4 ? 1 : x < 0.9 ? 1 - ease((x - 0.4) / 0.5) : 0;
  const pitch = 0.62 * up;
  const p = neutralPose();
  const sink = bent ? 0.17 : 0;
  p.leg[1] = { ik: { x: HX - 0.01, z: 0.0, ball: true, pitch } };
  p.leg[-1] = { flex: -0.08, knee: 1.35, ankle: 0.35, abd: 0.02 };
  p.px = 0.04; p.pRoll = 0.02;
  p.py = STAND_Y + ballRise(pitch) - sink; p.pz = bent ? 0.06 : 0; p.pTilt = bent ? 0.18 : 0;
  p.spF = bent ? 0.02 : 0.02;
  p.arm[-1] = { flex: 0.18, abd: 0.78, elbow: 0.55 };           // on the post
  p.arm[1] = { flex: 0.05, abd: 0.35, elbow: 0.9 };
  return { pose: p, lv: { calvesL: 1, achillesL: 1 }, md: { calvesL: 'work' }, box: null, up };
}
export const calfStraight = t => calfCommon(t, false);
export const calfBent = t => calfCommon(t, true);

// ------------------------------------------------------------ single-leg Romanian deadlift (stand on the left leg)
export function rdl(t) {
  const k = rep(t, 4.0, 0.42, 0.08, 0.34);
  const p = neutralPose();
  const tilt = 1.2 * k;
  p.leg[1] = { ik: { x: HX - 0.01, z: 0.0 } };
  p.leg[-1] = { flex: -0.06 - 0.2 * k, knee: 0.08 + 0.1 * k, ankle: -0.1 + 0.5 * k, abd: 0.02 };
  p.py = STAND_Y - 0.03 - 0.05 * k; p.pz = -0.12 * k; p.pTilt = tilt; p.px = 0.03;
  p.spF = 0.0; p.chF = 0.0; p.nkF = -0.45 * k; p.hdF = -0.05 * k;
  for (const s of [1, -1]) p.arm[s] = { flex: 0.05 + tilt * 0.95, abd: 0.1, elbow: 0.12 };
  return { pose: p, lv: { hamstringsL: 1, glutesL: 1 }, md: { hamstringsL: 'work', glutesL: 'work' }, box: null, k };
}

// ------------------------------------------------------------ step-up onto a box (left leg leads)
const BOX_H = 0.32, BOX_Z = 0.44;
export function stepUp(t) {
  const C = 4.4, x = (t % C) / C;
  const p = neutralPose();
  const place = ss(0.0, 0.14, x) * (1 - ss(0.88, 1.0, x));      // left foot up on the box
  const rise = ss(0.16, 0.5, x) * (1 - ss(0.6, 0.86, x));       // body up and over
  const arc = a => Math.sin(PI * clamp(a));
  // left foot: from the ground to the box top
  p.leg[1] = { ik: { x: HX, z: lerp(0.0, BOX_Z, place), lift: BOX_H * place + 0.08 * arc(x / 0.14) + 0.08 * arc((x - 0.88) / 0.12) } };
  // right foot: stays down until the body is high, then drives up and lands beside the left
  const rf = ss(0.32, 0.5, x) * (1 - ss(0.6, 0.76, x));
  const drive = 0.14 * arc((x - 0.32) / 0.18) + 0.14 * arc((x - 0.6) / 0.16);
  p.leg[-1] = { ik: { x: -HX, z: lerp(0.0, BOX_Z, rf), lift: BOX_H * rf + drive, ball: rf < 0.98 && rise > 0.05, pitch: 0.25 * (1 - rf) * rise } };
  p.py = STAND_Y - 0.02 - 0.12 * place * (1 - rise) + BOX_H * rise;
  p.pz = lerp(0.04 * place, BOX_Z, rise);
  p.pTilt = 0.12 * place + 0.22 * Math.sin(PI * rise) ;
  p.spF = 0.03;
  const sw = Math.sin(PI * rise);
  p.arm[1] = { flex: -0.35 * sw + 0.05, abd: 0.14, elbow: 0.9 };
  p.arm[-1] = { flex: 0.45 * sw + 0.05, abd: 0.14, elbow: 0.9 };
  const lv = { quadsL: place, glutesL: place };
  return { pose: p, lv, md: { quadsL: 'work', glutesL: 'work' }, box: { x: 0, z: BOX_Z, w: 0.6, d: 0.42, h: BOX_H }, rise };
}

// ------------------------------------------------------------ hip hike: stand on the left leg on a step, right foot hanging
const HIKE_H = 0.22;
export function hipHike(t) {
  const C = 3.0, x = (t % C) / C;
  // right side drops, then lifts above level
  const s = x < 0.35 ? -ease(x / 0.35) : x < 0.75 ? lerp(-1, 1, ease((x - 0.35) / 0.4)) : 1 - ease((x - 0.75) / 0.25);
  const roll = 0.13 * s;
  const p = neutralPose();
  p.leg[1] = { ik: { x: HX, z: 0.0, lift: HIKE_H } };
  p.leg[-1] = { flex: 0.03, knee: 0.06, ankle: 0.1, abd: 0.0 };
  p.py = STAND_Y + HIKE_H - 0.01; p.px = 0.035; p.pRoll = roll;
  p.spS = -0.8 * roll; p.chS = -0.3 * roll;
  p.arm[1] = { flex: 0.05, abd: 0.3, elbow: 1.5, rot: 0.3 }; p.arm[-1] = { flex: 0.05, abd: 0.3, elbow: 1.5, rot: 0.3 };
  return { pose: p, lv: { abductorsL: 1 }, md: { abductorsL: 'work' }, box: { x: HX, z: 0.02, w: 0.2, d: 0.4, h: HIKE_H }, s };
}

// ------------------------------------------------------------ glute bridge: lying on the back, feet flat, hips lift
export function bridge(t) {
  const k = rep(t, 3.6, 0.32, 0.18, 0.36);
  const p = neutralPose();
  const lift = 0.22 * k;
  const trunk = 0.5;                                           // pelvis to shoulders, roughly
  const ang = Math.asin(clamp(lift / trunk, 0, 0.9));
  p.py = 0.105 + lift; p.pz = 0.0;
  p.pTilt = -PI / 2 - ang;
  p.spF = 0.04 * k; p.chF = 0.0;
  p.nkF = 0.35 + ang * 0.8; p.hdF = 0.25 + ang * 0.3;
  for (const s of [1, -1]) {
    p.leg[s] = { ik: { x: (HX + 0.03) * s, z: 0.46 } };
    p.arm[s] = { flex: -0.06 - ang, abd: 0.22, elbow: 0.05 };
  }
  return { pose: p, lv: { ...both('glutes', 1), ...both('hamstrings', 0.7), ...both('hipflexors', 0.4 * k) }, md: { ...both('glutes', 'work'), ...both('hamstrings', 'work'), ...both('hipflexors', 'stretch') }, box: null, k };
}
