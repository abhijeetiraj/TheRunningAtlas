// Injury body map: pick an area on the 3D runner to read about the running injury usually felt there.
// Markers sit on the figure's bones; the chosen area's markers glow and pulse, and nearby muscles are lit for context.
import { createStage } from '../../lib/3d/stage.js';
import { neutralPose } from '../../lib/3d/rig.js';
import { AREAS } from '../../data/body-map.js';
import { noGL, makeCallouts, reduceMotion } from '../ui.js';

export function initBodyMap(root) {
  if (!root) return;
  const $ = s => root.querySelector(s);
  let idx = 0;
  const buttons = [...root.querySelectorAll('[data-area]')];
  const cards = [...root.querySelectorAll('[data-card]')];

  let S = null;
  try { S = createStage(); } catch (e) { console.warn('3D unavailable', e); }

  function select(i, instant = false) {
    idx = i;
    const id = AREAS[i].id;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.area === id)));
    cards.forEach(c => { c.hidden = c.dataset.card !== id; });
    if (S) S.camTo(AREAS[i].cam, instant);
  }
  buttons.forEach((b, i) => b.addEventListener('click', () => select(i)));

  const stageEl = $('#bodyStage');
  if (!S) { noGL(stageEl); select(0); return; }
  S.attach(stageEl);
  const { THREE, fig, renderer } = S;
  S.controls.minDistance = 1.4;
  S.post.visible = false; S.lane.visible = false;

  // a relaxed standing pose, right foot a little back so the inner left shin can be seen
  const pose = neutralPose();
  pose.leg[1] = { ik: { x: 0.11, z: 0.03 } };
  pose.leg[-1] = { ik: { x: -0.12, z: -0.1 } };
  for (const s of [1, -1]) pose.arm[s] = { flex: 0.05, abd: 0.22, elbow: 0.35 };
  fig.apply(pose);

  // markers: a bright core and a soft halo, parented to the figure's bones
  const coreGeo = new THREE.SphereGeometry(0.019, 20, 14), haloGeo = new THREE.SphereGeometry(0.04, 20, 14);
  const marks = AREAS.map((a, i) => a.markers.map(m => {
    const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: '#ff5a3c', transparent: true, depthTest: false }));
    const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: '#ff5a3c', transparent: true, opacity: 0.25, depthWrite: false, depthTest: false }));
    core.renderOrder = 10; halo.renderOrder = 9;
    core.position.set(m.x, m.y, m.z); halo.position.copy(core.position);
    core.userData.area = i; halo.userData.area = i;
    const bone = fig.bone(m.bone, 1); bone.add(core); bone.add(halo);
    return { core, halo };
  }));
  const pickable = marks.flat().flatMap(m => [m.core, m.halo]);

  // tap or click a marker to choose its area (a drag turns the runner instead)
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
    down = null;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, S.camera);
    const hit = ray.intersectObjects(pickable, false)[0];
    if (hit) select(hit.object.userData.area);
  });

  select(0, true);
  const callouts = makeCallouts($('#bodyCallouts'));
  const still = reduceMotion();
  const tmp = new THREE.Vector3();
  let t = 0;
  S.setDriver(dt => {
    t += dt;
    const a = AREAS[idx];
    // muscles near the chosen area, for context
    const modes = {};
    for (const k in a.lit) modes[k] = k.startsWith('achilles') ? 'spring' : 'work';
    fig.updateMuscles(a.lit, modes);
    // marker glow
    const pulse = still ? 1 : 1 + 0.35 * Math.sin(t * 4);
    marks.forEach((ms, i) => ms.forEach(({ core, halo }) => {
      const on = i === idx;
      core.material.opacity = on ? 1 : 0.45; core.scale.setScalar(on ? 1.15 : 0.75);
      halo.material.opacity = on ? 0.3 : 0.08; halo.scale.setScalar(on ? pulse : 0.8);
    }));
    // one label, on the chosen area's first visible marker
    const items = [];
    for (const { core } of marks[idx]) {
      core.getWorldPosition(tmp);
      const p = S.project(tmp);
      if (p.behind) continue;
      items.push({ key: a.id, text: a.name, mode: 'work', pos: p, side: p.x > S.size().W / 2 ? 1 : -1 });
      break;
    }
    callouts.set(items);
  });
}
