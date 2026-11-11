// Home page: a runner jogging along rover tracks at Jezero, in the hero window behind the copy panel.
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
  // On wide screens the copy panel sits on the left, so the picture moves right to keep the runner clear of it.
  const wide = window.matchMedia('(min-width: 861px)');
  const frame = () => {
    S.setShift(wide.matches ? 0.2 : 0);
    S.camTo(wide.matches ? { az: -1.05, el: 0.1, dist: 4.6, target: [0, 0.9, 0] } : { az: -1.0, el: 0.1, dist: 5.0, target: [0, 0.92, 0] }, true);
  };
  frame();
  wide.addEventListener('change', frame);
  const still = reduceMotion();
  S.controls.autoRotate = !still; S.controls.autoRotateSpeed = 0.4;
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
