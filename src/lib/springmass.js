// The spring-mass model of running (Blickhan 1989; McMahon and Cheng 1990), worked out with the sine-wave method of
// Morin et al. 2005: the vertical ground force is taken as a half-sine during contact. From contact time, flight
// time, speed, leg length and body mass it gives peak force, the drop of the body while the foot is down, how much
// the leg spring shortens, and the vertical and leg stiffness. All results are model values, not measurements.

const G = 9.81;
const PI = Math.PI;

/**
 * v: speed (m/s); Tstep: time of one step (s); tc: contact time (s); mass (kg); legLen (m, hip to ground, standing)
 */
export function springModel({ v, Tstep, tc, mass = 70, legLen = 0.95 }) {
  const tf = Math.max(0, Tstep - tc);
  const Fmax = mass * G * (PI / 2) * (tf / tc + 1);            // peak vertical force, N
  const dy = Fmax * tc * tc / (mass * PI * PI) - G * tc * tc / 8; // drop of the body from touchdown to mid-contact, m
  const half = v * tc / 2;                                       // how far the body travels over the foot, each half
  const H0 = Math.sqrt(Math.max(0.01, legLen * legLen - half * half)); // hip height at touchdown
  const dL = legLen - H0 + dy;                                   // leg spring shortening at mid-contact, m
  const rise = G * tf * tf / 8;                                  // rise above touchdown height at the top of the flight
  return {
    v, Tstep, tc, tf, mass, legLen, H0, half,
    Fmax, bw: Fmax / (mass * G), dy, dL, rise,
    kvert: Fmax / dy, kleg: Fmax / dL,
    energy: 0.5 * Fmax * dL,                                     // J held in the leg spring at its shortest
    angle: Math.asin(Math.min(1, half / legLen)),                // leg angle from vertical at touchdown, rad
  };
}

/**
 * Body height relative to touchdown height (m) and vertical ground force (N) at time t into a step (0..Tstep).
 * Contact runs from 0 to tc; then the body flies.
 */
export function stepState(M, t) {
  const { tc, tf, Fmax, mass } = M;
  const v0 = -G * tf / 2;        // vertical velocity at touchdown (symmetric flight)
  const a = Fmax / mass, w = PI / tc;
  if (t <= tc) {
    const y = v0 * t + (a / w) * (t - Math.sin(w * t) / w) - G * t * t / 2;
    return { y, F: Fmax * Math.sin(w * t), contact: true, q: t / tc };
  }
  const tau = t - tc, vto = G * tf / 2;
  return { y: vto * tau - G * tau * tau / 2, F: 0, contact: false, q: tf ? tau / tf : 1 };
}
