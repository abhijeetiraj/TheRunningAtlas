// Home page: a runner jogging on the trail in the hero plate.
import { createStage } from '../lib/3d/stage.js';
import * as G from '../lib/3d/gait.js';
import { $, reduceMotion, noGL, flashOnHash } from './ui.js';

export function initHome() {
  flashOnHash();
  const el = $('#stage');
  if (!el) return;
  let S = null;
  try { S = createStage(); } catch (e) { console.warn('3D unavailable', e); }
  if (!S) { noGL(el); return; }
  S.attach(el);
  const P = G.gaitParams(3.3), strike = 'heel';
  S.camTo({ az: -1.0, el: 0.08, dist: 3.9, target: [0, 0.86, 0] }, true);
  const still = reduceMotion();
  S.controls.autoRotate = !still; S.controls.autoRotateSpeed = 0.5;
  let phi = 0.42, dist = 0;
  S.setDriver(dt => {
    if (!still) { phi = (phi + dt / P.Tstride) % 1; dist += P.v * dt; }
    const r = G.runPose(phi, P, strike);
    S.fig.apply(r.pose);
    const m = G.muscleLevels(phi, P);
    for (const k in m.lv) m.lv[k] *= 0.85;
    S.fig.updateMuscles(m.lv, m.md);
    S.scrollLane(dist);
  });
}
