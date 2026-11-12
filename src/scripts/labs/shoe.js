// The Shoe cut-away: a generic shoe built from lofted cross-sections, so it can be sliced down the middle with solid
// cut faces. Units: 1 = 100 mm. The heel is at -z, the toe at +z, the sole's underside at y = 0.
import { createMiniStage } from '../../lib/3d/mini.js';
import { segPress, noGL, reduceMotion } from '../ui.js';

const PI = Math.PI;
const NZ = 90;                                 // cross-sections from heel to toe
const Z0 = -1.4, Z1 = 1.4;
const RUBBER = 0.03, INSOLE = 0.035;
const PRESETS = {
  minimal: { name: 'Minimal', heel: 12, fore: 12, plate: false, rocker: 0.05 },
  trainer: { name: 'Everyday trainer', heel: 34, fore: 24, plate: false, rocker: 0.1 },
  lowdrop: { name: 'Low drop', heel: 29, fore: 25, plate: false, rocker: 0.1 },
  racer: { name: 'Plated racer', heel: 39.5, fore: 31.5, plate: true, rocker: 0.2 },
};

const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// width of the sole along the shoe
const WZ = [-1.4, -1.33, -1.1, -0.35, 0.35, 0.8, 1.15, 1.32, 1.4];
const WW = [0.3, 0.58, 0.74, 0.64, 0.98, 0.98, 0.8, 0.5, 0.12];
function width(z) {
  for (let i = 1; i < WZ.length; i++) if (z <= WZ[i]) return lerp(WW[i - 1], WW[i], ss(WZ[i - 1], WZ[i], z));
  return WW[WW.length - 1];
}

export function initShoeLab(root) {
  if (!root) return;
  const $ = s => root.querySelector(s);
  const out = k => root.querySelector(`[data-out="${k}"]`);
  const heelIn = $('#shoeHeel'), foreIn = $('#shoeFore'), cutIn = $('#shoeCut');
  const opt = k => root.querySelector(`[data-opt="${k}"]`);
  const st = { ...PRESETS.trainer, preset: 'trainer', cut: +cutIn.value, soft: true, upper: true, press: !reduceMotion() };
  opt('press').checked = st.press;

  function readout() {
    const drop = st.heel - st.fore, thick = Math.max(st.heel, st.fore);
    out('heel').textContent = `${st.heel} mm`; out('fore').textContent = `${st.fore} mm`;
    out('cut').textContent = st.cut < 0.05 ? 'Whole' : st.cut > 0.95 ? 'Half' : `${Math.round(st.cut * 100)}%`;
    const rows = [['Heel stack', st.heel, 'mm'], ['Forefoot stack', st.fore, 'mm'], ['Drop', drop.toFixed(drop % 1 ? 1 : 0), 'mm'], ['Plate', st.plate ? 'Yes' : 'No', ''], ['Foam', st.soft ? 'Soft' : 'Firm', '']];
    out('readouts').innerHTML = rows.map(([k, v, u]) => `<div><dt>${k}</dt><dd><span class="num">${v}</span> <span class="u">${u}</span></dd></div>`).join('');
    const rule = out('rule');
    rule.dataset.tone = thick > 40 ? 'big' : 'ok';
    rule.textContent = thick > 40 ? `At ${thick} mm, this sole is thicker than the 40 mm World Athletics allows in road races.` : `At ${thick} mm at its thickest, this sole is within the 40 mm road racing limit.`;
    out('shoeName').textContent = st.preset ? PRESETS[st.preset].name : 'Your shoe';
    out('shoeSub').textContent = `${drop.toFixed(drop % 1 ? 1 : 0)} mm drop, ${st.plate ? 'with a plate' : 'no plate'}`;
  }
  function custom() {
    st.preset = null; root.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', 'false'));
  }
  heelIn.addEventListener('input', () => { st.heel = +heelIn.value; custom(); readout(); dirty = true; });
  foreIn.addEventListener('input', () => { st.fore = +foreIn.value; custom(); readout(); dirty = true; });
  cutIn.addEventListener('input', () => { st.cut = +cutIn.value; readout(); dirty = true; });
  for (const k of ['plate', 'soft', 'upper', 'press']) opt(k).addEventListener('change', e => { st[k] = e.target.checked; if (k === 'plate') custom(); readout(); dirty = true; });
  root.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    const p = PRESETS[b.dataset.preset];
    Object.assign(st, { heel: p.heel, fore: p.fore, plate: p.plate, rocker: p.rocker, preset: b.dataset.preset });
    heelIn.value = p.heel; foreIn.value = p.fore; opt('plate').checked = p.plate;
    segPress(b); readout(); dirty = true;
  }));
  let dirty = true;
  readout();

  // ---- 3D
  let S = null;
  try { S = createMiniStage({ target: [0, 0.35, 0], minDist: 1.5, maxDist: 10, shadows: true }); } catch (e) { console.warn('3D unavailable', e); }
  const stageEl = $('#shoeStage');
  if (!S) { noGL(stageEl); return; }
  S.attach(stageEl);
  const { THREE, scene } = S;
  const VIEWS = {
    cut: { target: [0, 0.3, 0.05], az: 1.05, el: 0.28, dist: 5.2 },
    side: { target: [0, 0.35, 0], az: PI / 2, el: 0.06, dist: 5.4 },
    heel: { target: [0, 0.35, 0], az: PI * 0.88, el: 0.2, dist: 5.0 },
  };
  S.camTo(VIEWS.cut, true);
  root.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { segPress(b); S.camTo(VIEWS[b.dataset.view]); }));

  // a soft floor to catch the shadow
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), new THREE.ShadowMaterial({ opacity: 0.18 }));
  floor.rotation.x = -PI / 2; floor.position.y = -0.002; floor.receiveShadow = true; scene.add(floor);

  const MAT = {
    rubber: new THREE.MeshStandardMaterial({ color: '#3a3f48', roughness: 0.9 }),
    foamSoft: new THREE.MeshStandardMaterial({ color: '#f1ede6', roughness: 0.85 }),
    foamFirm: new THREE.MeshStandardMaterial({ color: '#cfc6b7', roughness: 0.8 }),
    plate: new THREE.MeshPhysicalMaterial({ color: '#1d1f24', roughness: 0.25, metalness: 0.3, clearcoat: 1 }),
    insole: new THREE.MeshStandardMaterial({ color: '#137872', roughness: 0.7 }),
    upper: new THREE.MeshPhysicalMaterial({ color: '#b54a17', roughness: 0.7, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }),
  };
  const meshes = {};
  for (const k of ['rubber', 'foam', 'plate', 'insole', 'upper']) {
    meshes[k] = new THREE.Mesh(new THREE.BufferGeometry(), k === 'foam' ? MAT.foamSoft : MAT[k]);
    meshes[k].castShadow = k !== 'upper'; meshes[k].receiveShadow = true;
    scene.add(meshes[k]);
  }

  // sole profile: underside (toe spring, heel bevel) and thickness along the shoe, with an optional local squash
  const under = z => (z > 0.55 ? st.rocker * Math.pow((z - 0.55) / (Z1 - 0.55), 2) : 0) + (z < -1.2 ? 0.05 * Math.pow((-1.2 - z) / 0.2, 2) : 0);
  const stack = z => {
    const H = st.heel / 100, F = st.fore / 100;
    let t = lerp(H, F, ss(-0.75, 0.45, z));
    if (z > 1.0) t *= lerp(1, 0.55, ss(1.0, Z1, z));
    if (z < -1.25) t *= lerp(1, 0.8, ss(-1.25, Z0, z));
    return t;
  };
  let pressZ = 0, pressAmt = 0;
  const squash = z => 1 - pressAmt * (st.soft ? 0.22 : 0.1) * Math.exp(-Math.pow((z - pressZ) / 0.38, 2));

  // build a solid slab between two height profiles, cut by the plane x = c (whole shoe when c >= half width)
  // proud: how far this layer's cut face sits in front of the others, so a layer inside the foam (the plate) shows
  // cleanly in the cut instead of flickering against the foam's own cut face
  function slab(geo, bot, top, inset = 0, zA = Z0, zB = Z1, proud = 0) {
    const c = lerp(0.6, 0, st.cut) + proud;
    const pos = [], idx = [];
    const ring = [];
    for (let i = 0; i <= NZ; i++) {
      const z = lerp(zA, zB, i / NZ);
      const hw = Math.max(0.01, width(z) / 2 - inset);
      const xr = Math.min(hw, c), xl = -hw;
      const yb = bot(z), yt = Math.max(yb + 0.002, top(z));
      ring.push([[xl, yb, z], [xr, yb, z], [xr, yt, z], [xl, yt, z]]);
    }
    // four walls, each with its own vertices so edges stay crisp
    for (let side = 0; side < 4; side++) {
      const base = pos.length / 3;
      for (let i = 0; i <= NZ; i++) { const a = ring[i][side], b = ring[i][(side + 1) % 4]; pos.push(...a, ...b); }
      for (let i = 0; i < NZ; i++) {
        const a = base + i * 2, b = a + 1, c2 = a + 2, d = a + 3;
        idx.push(a, b, c2, b, d, c2);
      }
    }
    // end caps
    for (const [i, flip] of [[0, false], [NZ, true]]) {
      const base = pos.length / 3; for (const p of ring[i]) pos.push(...p);
      flip ? idx.push(base, base + 1, base + 2, base, base + 2, base + 3) : idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    geo.attributes.position.needsUpdate = true;
  }
  // the upper: a half-ellipse shell over the insole, cut by the same plane
  function shell(geo, base) {
    const c = lerp(0.6, 0, st.cut);
    const NA = 28, pos = [], idx = [];
    const h = z => (z < -1.0 ? lerp(0.62, 0.78, ss(-1.38, -1.0, z)) : lerp(0.78, 0.26, ss(-1.0, 1.0, z))) * (z > 1.0 ? lerp(1, 0.2, ss(1.0, Z1, z)) : 1);
    for (let i = 0; i <= NZ; i++) {
      const z = lerp(Z0 + 0.02, Z1 - 0.02, i / NZ), hw = width(z) / 2 * 0.98;
      const amin = Math.acos(Math.min(1, c / hw));
      for (let j = 0; j <= NA; j++) {
        const a = lerp(amin, PI, j / NA);
        pos.push(Math.cos(a) * hw, base(z) + Math.sin(a) * h(z), z);
      }
    }
    for (let i = 0; i < NZ; i++) for (let j = 0; j < NA; j++) {
      const a = i * (NA + 1) + j, b = a + NA + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
  }

  function rebuild() {
    const foamBot = z => under(z) + RUBBER;
    const foamTop = z => under(z) + stack(z) * squash(z);
    slab(meshes.rubber.geometry, under, foamBot);
    slab(meshes.foam.geometry, foamBot, foamTop);
    slab(meshes.insole.geometry, foamTop, z => foamTop(z) + INSOLE, 0.03, Z0 + 0.06, Z1 - 0.08);
    meshes.plate.visible = st.plate;
    if (st.plate) {
      // a plate about 40% up the foam, curving up towards the toe with the rocker
      const py = z => foamBot(z) + (foamTop(z) - foamBot(z)) * 0.4 + (z > 0.4 ? 0.05 * Math.pow((z - 0.4) / 1.0, 2) : 0);
      slab(meshes.plate.geometry, py, z => py(z) + 0.012, 0.025, -1.15, 1.22, 0.004);
    }
    meshes.upper.visible = st.upper;
    if (st.upper) shell(meshes.upper.geometry, z => foamTop(z) + INSOLE);
    meshes.foam.material = st.soft ? MAT.foamSoft : MAT.foamFirm;
  }

  let t = 0;
  S.setDriver(dt => {
    if (st.press) {
      // a foot rolls from heel to toe: the squash travels along the shoe, then lifts off
      t = (t + dt / 2.2) % 1;
      pressAmt = Math.sin(PI * Math.min(1, t / 0.75)) * (t < 0.75 ? 1 : 0);
      pressZ = lerp(-1.0, 0.95, ss(0, 0.75, t));
      dirty = true;
    } else if (pressAmt) { pressAmt = 0; dirty = true; }
    if (dirty) { rebuild(); dirty = false; }
  });
}
