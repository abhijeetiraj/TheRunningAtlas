// Strength library: pick one of eight exercises and watch it on the 3D runner, with the muscles it works lit.
import { createStage } from '../../lib/3d/stage.js';
import * as SM from '../../lib/3d/strength.js';
import { STRENGTH } from '../../data/strength-moves.js';
import { ICON, noGL, makeCallouts, musclePos, reduceMotion } from '../ui.js';

const PI = Math.PI;
const MOVE = {
  squat: SM.squat, split: SM.splitSquat, calf: SM.calfStraight, calfbent: SM.calfBent,
  rdl: SM.rdl, stepup: SM.stepUp, hike: SM.hipHike, bridge: SM.bridge,
};
const CAM = {
  squat: { az: PI / 2 + 0.5, el: 0.1, dist: 4.2, target: [0, 0.75, 0] },
  split: { az: PI / 2 + 0.45, el: 0.1, dist: 4.2, target: [0, 0.75, 0] },
  calf: { az: PI / 2 - 0.35, el: 0.06, dist: 3.8, target: [0, 0.7, 0] },
  calfbent: { az: PI / 2 - 0.35, el: 0.06, dist: 3.8, target: [0, 0.65, 0] },
  rdl: { az: PI / 2 + 0.35, el: 0.1, dist: 4.4, target: [0, 0.75, -0.1] },
  stepup: { az: PI / 2 + 0.55, el: 0.1, dist: 4.8, target: [0, 0.9, 0.25] },
  hike: { az: 0.25, el: 0.08, dist: 4.0, target: [0, 0.95, 0] },
  bridge: { az: PI / 2 + 0.35, el: 0.28, dist: 3.8, target: [0, 0.2, -0.05] },
};
// callouts: [muscle, side (+1 left), label]
const LBL = {
  squat: [['quads', 1, 'Quads'], ['glutes', -1, 'Glutes']],
  split: [['quads', 1, 'Quads (front leg)'], ['glutes', 1, 'Glutes'], ['hipflexors', -1, 'Hip flexors (back leg)']],
  calf: [['calves', 1, 'Calf'], ['achilles', 1, 'Achilles tendon']],
  calfbent: [['calves', 1, 'Calf (soleus)'], ['achilles', 1, 'Achilles tendon']],
  rdl: [['hamstrings', 1, 'Hamstrings'], ['glutes', 1, 'Glutes']],
  stepup: [['quads', 1, 'Quads'], ['glutes', 1, 'Glutes']],
  hike: [['abductors', 1, 'Outer hip (glute med)']],
  bridge: [['glutes', 1, 'Glutes'], ['hamstrings', 1, 'Hamstrings']],
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function initStrengthLab(root) {
  if (!root) return;
  const $ = s => root.querySelector(s);
  let idx = 0, t = 0, playing = !reduceMotion();
  const card = $('#strengthCard'), playBtn = $('#strengthPlay');

  function showCard() {
    const m = STRENGTH[idx];
    card.innerHTML = `<div class="mc-head"><span class="mc-no">${idx + 1}/${STRENGTH.length}</span><h3 class="mc-name">${esc(m.name)}</h3><span class="mc-dose">${esc(m.dose)}</span></div>
      <dl class="mc-grid"><div><dt>How</dt><dd>${esc(m.how)}</dd></div><div><dt>What it works</dt><dd>${esc(m.works)}</dd></div><div><dt>Why runners do it</dt><dd>${esc(m.why)}</dd></div></dl>`;
  }
  function setPlay(on) { playing = on; playBtn.innerHTML = `${on ? ICON.pause : ICON.play}<span>${on ? 'Pause' : 'Play'}</span>`; }

  let S = null;
  try { S = createStage(); } catch (e) { console.warn('3D unavailable', e); }
  function select(i, instant = false) {
    idx = i; t = 0;
    root.querySelectorAll('[data-ex]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.ex === i)));
    showCard();
    if (S) S.camTo({ target: [0, 0.85, 0], ...CAM[STRENGTH[i].id] }, instant);
  }
  root.querySelectorAll('[data-ex]').forEach(b => b.addEventListener('click', () => { select(+b.dataset.ex); if (!playing && !reduceMotion()) setPlay(true); }));
  playBtn.addEventListener('click', () => setPlay(!playing));
  setPlay(playing);

  const stageEl = $('#strengthStage');
  if (!S) { noGL(stageEl); playBtn.hidden = true; return; }
  S.attach(stageEl);
  const { THREE, scene } = S;

  // a step box, reused by the step-up and the hip hike
  const boxMat = new THREE.MeshPhysicalMaterial({ color: '#cdbba6', roughness: 0.55, clearcoat: 0.2 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), boxMat);
  box.castShadow = true; box.receiveShadow = true; box.visible = false; scene.add(box);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: '#8a7864' }));
  box.add(edges);

  select(0, true);
  root.strengthSeek = s => { t = s; };        // jump to a time in the current exercise (used by screenshot checks)
  const callouts = makeCallouts($('#strengthCallouts'));
  const md0 = {};
  // a still pose for reduced motion: the bottom of each rep
  const STILL = { squat: 1.4, split: 1.5, calf: 1.1, calfbent: 1.1, rdl: 1.75, stepup: 2.3, hike: 0.9, bridge: 1.5 };
  S.setDriver(dt => {
    if (playing) t += dt;
    const id = STRENGTH[idx].id;
    const r = MOVE[id](playing || t > 0 ? t : STILL[id]);
    S.fig.apply(r.pose);
    const fade = playing ? Math.min(1, 0.25 + t / 0.6) : 1, lv = {};
    for (const k in r.lv) lv[k] = r.lv[k] * fade;
    S.fig.updateMuscles(lv, r.md || md0);
    S.post.visible = id === 'calf' || id === 'calfbent';
    if (S.post.visible) S.post.position.set(-0.5, 0, 0.02);
    S.lane.visible = false;
    if (r.box) { box.visible = true; box.scale.set(r.box.w, r.box.h, r.box.d); box.position.set(r.box.x, r.box.h / 2, r.box.z); }
    else box.visible = false;
    const items = [];
    for (const [k, side, text] of LBL[id] || []) {
      const p = musclePos(S, k, side); if (!p) continue;
      const mode = k === 'achilles' ? 'spring' : ((r.md || {})[k + (side > 0 ? 'L' : 'R')] || 'work');
      items.push({ key: k + side, text, mode, pos: p, side: p.x > S.size().W / 2 ? 1 : -1 });
    }
    callouts.set(items);
  });
}
