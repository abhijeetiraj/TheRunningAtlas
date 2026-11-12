// The Muscle fibres lab: a bundle of fibres cut across, grouped into motor units. Effort recruits motor units in order
// of size: small slow units first, then fast ones (the size principle). Mixes and thresholds are illustrative.
import { createMiniStage, cssVar } from '../../lib/3d/mini.js';
import { segPress, noGL } from '../ui.js';

const PI = Math.PI;
const MIX = {
  even: { I: 0.5, IIa: 0.3, IIx: 0.2 },
  slow: { I: 0.79, IIa: 0.16, IIx: 0.05 },
  fast: { I: 0.25, IIa: 0.4, IIx: 0.35 },
};
// switch-on band for each type's motor units (share of maximum effort), and fibres per motor unit
const BAND = { I: [0.02, 0.42], IIa: [0.35, 0.78], IIx: [0.68, 0.98] };
const UNIT = { I: 6, IIa: 12, IIx: 20 };
const TYPE_NAME = { I: 'Type I, slow', IIa: 'Type IIa, fast', IIx: 'Type IIx, fastest' };

function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// fibre centres, packed in a circle
const R = 1, FR = 0.048;
function packing() {
  const pts = [], rnd = seeded(91);
  const dx = FR * 2.08, dy = dx * Math.sqrt(3) / 2;
  for (let row = -30; row <= 30; row++) for (let col = -30; col <= 30; col++) {
    const x = col * dx + (row & 1 ? dx / 2 : 0) + (rnd() - 0.5) * 0.012, y = row * dy + (rnd() - 0.5) * 0.012;
    if (x * x + y * y < (R - FR) * (R - FR)) pts.push([x, y]);
  }
  return pts;
}

export function initFibreLab(root) {
  if (!root) return;
  const $ = s => root.querySelector(s);
  const out = k => root.querySelector(`[data-out="${k}"]`);
  const slider = $('#fibreEffort');
  const st = { e: +slider.value, mix: 'even' };
  const PTS = packing();
  const N = PTS.length;
  let fibres = [];           // { type, unit }
  let units = [];            // { type, thr, n }

  function assign() {
    const rnd = seeded(st.mix === 'even' ? 5 : st.mix === 'slow' ? 6 : 7);
    const mix = MIX[st.mix];
    const counts = { I: Math.round(N * mix.I), IIa: Math.round(N * mix.IIa) }; counts.IIx = N - counts.I - counts.IIa;
    // types scattered through the bundle, as in a real muscle
    const types = [...Array(counts.I).fill('I'), ...Array(counts.IIa).fill('IIa'), ...Array(counts.IIx).fill('IIx')];
    for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [types[i], types[j]] = [types[j], types[i]]; }
    // each type's fibres split into motor units; a unit's fibres are spread out, not side by side
    units = []; fibres = types.map(type => ({ type, unit: -1 }));
    for (const type of ['I', 'IIa', 'IIx']) {
      const idx = fibres.map((f, i) => f.type === type ? i : -1).filter(i => i >= 0);
      const nU = Math.max(1, Math.round(idx.length / UNIT[type]));
      const first = units.length;
      for (let u = 0; u < nU; u++) { const [a, b] = BAND[type]; units.push({ type, thr: a + (b - a) * (nU === 1 ? 0 : u / (nU - 1)), n: 0 }); }
      idx.forEach((fi, k) => { const u = first + ((k * 7919) % nU); fibres[fi].unit = u; units[u].n++; });
    }
  }

  function readout() {
    const on = { I: 0, IIa: 0, IIx: 0 }, all = { I: 0, IIa: 0, IIx: 0 };
    for (const f of fibres) { all[f.type]++; if (st.e >= units[f.unit].thr) on[f.type]++; }
    const total = on.I + on.IIa + on.IIx;
    const rows = [['All fibres', Math.round(100 * total / N), '% on']];
    for (const t of ['I', 'IIa', 'IIx']) rows.push([TYPE_NAME[t], all[t] ? Math.round(100 * on[t] / all[t]) : 0, `% of ${all[t]}`]);
    out('readouts').innerHTML = rows.map(([k, v, u]) => `<div><dt>${k}</dt><dd><span class="num">${v}</span> <span class="u">${u}</span></dd></div>`).join('');
    out('effortPct').textContent = `${Math.round(st.e * 100)}% of maximum`;
    const name = st.e < 0.06 ? 'Standing' : st.e < 0.4 ? 'Easy run' : st.e < 0.7 ? 'Hard run' : st.e < 0.9 ? 'Very hard' : 'Sprint';
    const sub = st.e < 0.06 ? 'A few slow units keep you upright' : st.e < 0.36 ? 'Slow fibres do the work' : st.e < 0.7 ? 'Fast IIa fibres join the slow ones' : 'Even the fastest fibres are switched on';
    out('effortName').textContent = name; out('effortSub').textContent = sub;
  }

  slider.addEventListener('input', () => { st.e = +slider.value; root.querySelectorAll('[data-effort]').forEach(b => b.setAttribute('aria-pressed', String(Math.abs(+b.dataset.effort - st.e) < 0.005))); readout(); });
  root.querySelectorAll('[data-effort]').forEach(b => b.addEventListener('click', () => { st.e = +b.dataset.effort; slider.value = st.e; segPress(b); readout(); }));
  root.querySelectorAll('[data-mix]').forEach(b => b.addEventListener('click', () => { st.mix = b.dataset.mix; segPress(b); assign(); readout(); repaint(); }));
  let repaint = () => {};
  assign(); readout();

  // ---- 3D
  let S = null;
  try { S = createMiniStage({ target: [0, 0, 0], minDist: 1.2, maxDist: 9 }); } catch (e) { console.warn('3D unavailable', e); }
  const stageEl = $('#fibreStage');
  if (!S) { noGL(stageEl); return; }
  S.attach(stageEl);
  const { THREE, scene } = S;
  const VIEWS = {
    cut: { target: [0, 0, 0.6], az: 0.55, el: 0.35, dist: 4.6 },
    side: { target: [0, 0, 0], az: 1.45, el: 0.18, dist: 5.2 },
    close: { target: [0.25, 0.1, 1.2], az: 0.25, el: 0.22, dist: 1.6 },
  };
  S.camTo(VIEWS.cut, true);
  root.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { segPress(b); S.camTo(VIEWS[b.dataset.view]); }));

  const LEN = 2.4;
  const geo = new THREE.CylinderGeometry(FR, FR, LEN, 14, 1, false); geo.rotateX(PI / 2);   // along Z, cut end facing +Z
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0 });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  scene.add(mesh);
  // a thin sheath around the bundle, open at the cut end
  const sheath = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.02, R + 0.02, LEN, 64, 1, true), new THREE.MeshPhysicalMaterial({ color: '#efe3d6', roughness: 0.6, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }));
  sheath.rotation.x = PI / 2; scene.add(sheath);
  // a capillary or two between fibres
  const capMat = new THREE.MeshStandardMaterial({ color: '#c8443a', roughness: 0.4 });
  for (const [x, y] of [[0.3, 0.42], [-0.5, -0.2], [0.1, -0.62], [-0.15, 0.55], [0.62, -0.1]]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, LEN + 0.02, 8), capMat); c.rotation.x = PI / 2; c.position.set(x, y, 0); scene.add(c);
  }

  const COL = { I: new THREE.Color(), IIa: new THREE.Color(), IIx: new THREE.Color() };
  const m4 = new THREE.Matrix4(), tmp = new THREE.Color(), white = new THREE.Color('#ffffff');
  for (let i = 0; i < N; i++) { m4.makeTranslation(PTS[i][0], PTS[i][1], 0); mesh.setMatrixAt(i, m4); }
  mesh.instanceMatrix.needsUpdate = true;
  function paint(time = 0) {
    for (let i = 0; i < N; i++) {
      const f = fibres[i], u = units[f.unit];
      tmp.copy(COL[f.type]);
      if (st.e >= u.thr) {
        // switched on: brighter, and flickering at the unit's own firing rhythm (faster for fast units)
        const rate = f.type === 'I' ? 1.4 : f.type === 'IIa' ? 2.4 : 3.4;
        const glow = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(time * rate * 2 * PI + f.unit * 1.7));
        tmp.lerp(white, glow * (f.type === 'IIx' ? 0.25 : 0.45));
      } else {
        tmp.multiplyScalar(0.42);
      }
      mesh.setColorAt(i, tmp);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
  let t = 0;
  S.onSky(() => { COL.I.set(cssVar('--f1') || '#b8324a'); COL.IIa.set(cssVar('--f2a') || '#e0884a'); COL.IIx.set(cssVar('--f2x') || '#efe0cc'); paint(t); });
  repaint = () => paint(t);
  S.setDriver(dt => { t += dt; paint(t); });
}
