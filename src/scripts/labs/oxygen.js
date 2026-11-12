// The Oxygen journey: a schematic body circuit. Red cells pick up oxygen in the lungs, the heart pumps them to a
// working muscle, oxygen moves into the muscle, and the cells return. Effort sets heart rate, stroke volume,
// breathing and how much oxygen the muscle takes, from a simple model of a fit adult (grade: Model).
import { createMiniStage, cssVar, reduceMotion } from '../../lib/3d/mini.js';
import { segPress, noGL } from '../ui.js';

const PI = Math.PI;
const MASS = 70;
// anchor points of the model: rest, easy run, hard run, all out
const ANCHORS = [0, 0.35, 0.7, 1];
const MODEL = {
  hr: [60, 135, 165, 185],          // beats per minute
  sv: [80, 110, 115, 115],          // mL per beat
  cv: [15, 8, 6, 4],                // mL of oxygen per 100 mL of blood coming back from the muscle
  rr: [12, 28, 38, 50],             // breaths per minute
  tv: [0.5, 1.6, 2.2, 2.6],         // litres per breath
};
const CA = 20;                       // mL of oxygen per 100 mL of blood leaving the lungs

function at(key, e) {
  const a = MODEL[key];
  for (let i = 1; i < ANCHORS.length; i++) {
    if (e <= ANCHORS[i]) { const k = (e - ANCHORS[i - 1]) / (ANCHORS[i] - ANCHORS[i - 1]); return a[i - 1] + (a[i] - a[i - 1]) * k; }
  }
  return a[a.length - 1];
}
export function oxygenModel(e) {
  const hr = at('hr', e), sv = at('sv', e), cv = at('cv', e), rr = at('rr', e), tv = at('tv', e);
  const q = hr * sv / 1000;                    // cardiac output, L/min
  const avd = CA - cv;                          // mL O2 given up per 100 mL
  const vo2 = q * avd * 10;                     // mL/min
  return { e, hr, sv, q, cv, avd, vo2, vo2kg: vo2 / MASS, rr, tv, ve: rr * tv, sat: cv / CA };
}

const STEP = {
  all: { k: 'The whole loop', name: 'Oxygen journey', text: 'Blood picks up oxygen in the lungs, the heart pumps it to the muscles, and it comes back for more.', view: { target: [-0.8, 0.12, 0], az: 0.35, el: 0.12, dist: 6.3 } },
  lungs: { k: 'Step 1', name: 'Lungs', text: 'Air reaches millions of tiny air sacs. Oxygen crosses into the blood, where red cells carry it on haemoglobin.', view: { target: [0, 1.0, 0], az: 0.25, el: 0.18, dist: 2.6 } },
  heart: { k: 'Step 2', name: 'Heart', text: 'The left side of the heart pumps oxygen-rich blood to the body. The right side sends returning blood to the lungs.', view: { target: [0, 0.42, 0], az: -0.3, el: 0.1, dist: 1.9 } },
  arteries: { k: 'Step 3', name: 'Arteries', text: 'Arteries carry the oxygen-rich blood out to the working muscles. The harder you run, the faster it flows.', view: { target: [0.3, -0.2, 0], az: 0.9, el: 0.1, dist: 3.2 } },
  muscle: { k: 'Step 4', name: 'Muscle', text: 'In tiny capillaries, oxygen leaves the blood and moves into the muscle fibres, where mitochondria use it to make ATP.', view: { target: [0, -1.1, 0], az: 0.4, el: 0.15, dist: 2.0 } },
  veins: { k: 'Step 5', name: 'Back to the heart', text: 'Blood that has given up oxygen, and picked up carbon dioxide, returns to the right side of the heart and on to the lungs.', view: { target: [-0.3, -0.3, 0], az: -0.9, el: 0.1, dist: 3.2 } },
};

export function initOxygenLab(root) {
  if (!root) return;
  const $ = s => root.querySelector(s);
  const out = k => root.querySelector(`[data-out="${k}"]`);
  const effort = $('#oxyEffort');
  const st = { e: +effort.value, step: 'all' };
  let O = oxygenModel(st.e);

  function readout() {
    O = oxygenModel(st.e);
    const lbl = st.e < 0.12 ? 'Resting' : st.e < 0.5 ? 'Easy running' : st.e < 0.85 ? 'Hard running' : 'Close to all out';
    out('effortLbl').textContent = lbl;
    const rows = [
      ['Heart rate', Math.round(O.hr), 'beats/min'], ['Blood per beat', Math.round(O.sv), 'mL'],
      ['Blood pumped', O.q.toFixed(1), 'L/min'], ['Oxygen given up', Math.round(O.avd * 10), 'mL per litre'],
      ['Oxygen used', (O.vo2 / 1000).toFixed(2), 'L/min'], ['Per kilogram', O.vo2kg.toFixed(1), 'mL/kg/min'],
      ['Breathing', Math.round(O.ve), 'L of air/min'],
    ];
    out('readouts').innerHTML = rows.map(([k, v, u]) => `<div><dt>${k}</dt><dd><span class="num">${v}</span> <span class="u">${u}</span></dd></div>`).join('');
    out('fick').innerHTML = `Oxygen used = blood pumped × oxygen given up<br><span class="num">${(O.vo2 / 1000).toFixed(2)}</span> L/min = <span class="num">${O.q.toFixed(1)}</span> L/min × <span class="num">${Math.round(O.avd * 10)}</span> mL/L`;
  }
  effort.addEventListener('input', () => { st.e = +effort.value; root.querySelectorAll('[data-effort]').forEach(b => b.setAttribute('aria-pressed', String(Math.abs(+b.dataset.effort - st.e) < 0.005))); readout(); });
  root.querySelectorAll('[data-effort]').forEach(b => b.addEventListener('click', () => { st.e = +b.dataset.effort; effort.value = st.e; segPress(b); readout(); }));
  readout();

  function showStep(id) {
    st.step = id;
    const s = STEP[id];
    out('stepK').textContent = s.k; out('stepName').textContent = s.name; out('stepText').textContent = s.text;
    if (S) S.camTo(s.view);
  }
  root.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { segPress(b); showStep(b.dataset.step); }));

  // ---- 3D
  let S = null;
  try { S = createMiniStage({ target: [0, 0, 0], minDist: 1.2, maxDist: 9 }); } catch (e) { console.warn('3D unavailable', e); }
  const stageEl = $('#oxyStage');
  if (!S) { noGL(stageEl); return; }
  S.attach(stageEl);
  const { THREE, scene } = S;
  S.camTo(STEP.all.view, true);

  const RICH = new THREE.Color(), POOR = new THREE.Color(), O2C = new THREE.Color();
  S.onSky(() => { RICH.set(cssVar('--o2-rich') || '#d9473b'); POOR.set(cssVar('--o2-poor') || '#6b4fa0'); O2C.set(cssVar('--o2-dot') || '#2fb6c9'); });

  // lungs
  const lungMat = new THREE.MeshPhysicalMaterial({ color: '#efb3ac', roughness: 0.55, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide });
  const lungs = [-1, 1].map(sx => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), lungMat);
    m.position.set(0.44 * sx, 1.02, 0); m.scale.set(0.27, 0.4, 0.2); scene.add(m); return m;
  });
  const sacs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 10, 8), new THREE.MeshStandardMaterial({ color: '#f6d2cc', roughness: 0.6 }), 160);
  {
    const m4 = new THREE.Matrix4(); let n = 0, seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    while (n < 160) {
      const x = rnd() * 2 - 1, y = rnd() * 2 - 1, z = rnd() * 2 - 1;
      if (x * x + y * y + z * z > 0.8) continue;
      const sx = n % 2 ? 1 : -1;
      m4.makeTranslation(0.44 * sx + x * 0.24, 1.02 + y * 0.36, z * 0.17); sacs.setMatrixAt(n++, m4);
    }
  }
  scene.add(sacs);
  // airway
  const airMat = new THREE.MeshStandardMaterial({ color: '#e7d7c9', roughness: 0.6 });
  const trachea = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.75, 0), new THREE.Vector3(0, 1.3, 0), new THREE.Vector3(-0.3, 1.1, 0)]), 30, 0.035, 10), airMat);
  const bronchus = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.3, 0), new THREE.Vector3(0.3, 1.1, 0)]), 20, 0.03, 10), airMat);
  scene.add(trachea, bronchus);

  // heart: right side (left of screen) and left side
  const heart = new THREE.Group(); heart.position.set(0, 0.42, 0.02); scene.add(heart);
  const rhMat = new THREE.MeshPhysicalMaterial({ color: '#7d5aa8', roughness: 0.35, clearcoat: 0.4 });
  const lhMat = new THREE.MeshPhysicalMaterial({ color: '#c8443a', roughness: 0.35, clearcoat: 0.4 });
  const rh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 24), rhMat); rh.position.set(-0.1, 0.02, 0);
  const lh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 24), lhMat); lh.position.set(0.1, 0, -0.01);
  const apex = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.26, 32), lhMat); apex.position.set(0.04, -0.17, 0); apex.rotation.z = 0.35; apex.rotation.x = PI;
  heart.add(rh, lh, apex);

  // muscle: a calf-like spindle with fibre stripes, and mitochondria inside
  const fibreTex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 256);
    for (let x = 0; x < 64; x += 4) { g.fillStyle = `rgba(90,20,30,${0.08 + (x % 8 ? 0.06 : 0.14)})`; g.fillRect(x, 0, 1.5, 256); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const musclePts = []; for (let i = 0; i <= 24; i++) { const s = i / 24; musclePts.push(new THREE.Vector2(0.03 + 0.2 * Math.pow(Math.sin(PI * s), 0.8), -0.4 + 0.8 * s)); }
  const muscleMat = new THREE.MeshPhysicalMaterial({ color: '#b5574c', roughness: 0.5, map: fibreTex, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
  const muscle = new THREE.Mesh(new THREE.LatheGeometry(musclePts, 40), muscleMat); muscle.position.set(0, -1.12, 0); scene.add(muscle);
  const mitoMat = new THREE.MeshStandardMaterial({ color: '#f2b45a', emissive: '#f2a03a', emissiveIntensity: 0.3, roughness: 0.4 });
  const MITO = 46;
  const mito = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.012, 0.03, 4, 8), mitoMat, MITO);
  const mitoPos = [];
  {
    const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), sc = new THREE.Vector3(1, 1, 1); let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < MITO; i++) {
      const s = 0.12 + rnd() * 0.76, r = (0.03 + 0.2 * Math.pow(Math.sin(PI * s), 0.8)) * 0.75 * Math.sqrt(rnd()), a = rnd() * 2 * PI;
      const p = new THREE.Vector3(Math.cos(a) * r, -1.12 - 0.4 + 0.8 * s, Math.sin(a) * r); mitoPos.push(p);
      e4.set(rnd() * 3, rnd() * 3, rnd() * 3); q4.setFromEuler(e4); mito.setMatrixAt(i, m4.compose(p, q4, sc));
    }
  }
  scene.add(mito);

  // the circuit: two loops, through the left or the right lung
  const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
  function loop(side) {
    const lx = 0.44 * side;
    const pts = [
      V(-0.1, 0.46, 0.06),                          // right heart
      V(-0.04, 0.72, 0.1), V(lx * 0.6, 0.9, 0.08), V(lx, 1.0, 0.04), V(lx * 0.9, 1.18, -0.02), // into the lung
      V(lx * 0.5, 0.86, -0.08), V(0.12, 0.52, -0.08),    // back to the left heart
      V(0.2, 0.8, -0.12), V(0.32, 0.62, -0.1), V(0.34, 0.0, -0.06), V(0.24, -0.6, 0), // aorta and artery down
      V(0.1, -0.9, 0.06), V(0.0, -1.12, 0.1), V(-0.1, -1.36, 0.06), // through the muscle
      V(-0.26, -1.0, 0.02), V(-0.34, -0.3, 0.06), V(-0.3, 0.2, 0.08), // vein back up
    ];
    const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
    // where each part starts, as a share of the loop (found by nearest point)
    const near = p => { let best = 0, bd = 1e9; for (let i = 0; i <= 600; i++) { const d = curve.getPointAt(i / 600).distanceToSquared(p); if (d < bd) { bd = d; best = i / 600; } } return best; };
    return { curve, uLungIn: near(pts[2]), uLungOut: near(pts[5]), uMuscleIn: near(pts[10]), uMuscleOut: near(pts[13]) };
  }
  const loops = [loop(-1), loop(1)];
  // oxygen saturation along the loop, 0 (venous) .. 1 (arterial)
  function oxAt(L, u) {
    const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    if (u < L.uLungIn) return 0;
    if (u < L.uLungOut) return ss(L.uLungIn, L.uLungIn + (L.uLungOut - L.uLungIn) * 0.6, u);
    if (u < L.uMuscleIn) return 1;
    if (u < L.uMuscleOut) return 1 - ss(L.uMuscleIn, L.uMuscleOut, u);
    return 0;
  }
  // vessels, coloured along their length
  const vesselMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, transparent: true, opacity: 0.38, depthWrite: false });
  const vessels = loops.map(L => {
    const g = new THREE.TubeGeometry(L.curve, 400, 0.034, 10, true);
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    const m = new THREE.Mesh(g, vesselMat); scene.add(m); return { L, g };
  });
  const tmpC = new THREE.Color();
  const cellColor = (L, u, target) => {
    const o = oxAt(L, u);
    const venous = O.sat;                         // how much oxygen is left on the way back, as a share
    const level = venous + (1 - venous) * o;
    return target.copy(POOR).lerp(RICH, Math.pow(level, 1.4));
  };
  function paintVessels() {
    for (const { L, g } of vessels) {
      const col = g.attributes.color, segs = 401, rad = 11;
      for (let i = 0; i < segs; i++) {
        cellColor(L, i / 400, tmpC);
        for (let j = 0; j < rad; j++) { const k = i * rad + j; if (k < col.count) col.setXYZ(k, tmpC.r, tmpC.g, tmpC.b); }
      }
      col.needsUpdate = true;
    }
  }

  // red cells
  const CELLS = 300;
  const cellGeo = new THREE.SphereGeometry(0.02, 12, 8); cellGeo.scale(1, 0.45, 1);
  const cellMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0 });
  const cells = new THREE.InstancedMesh(cellGeo, cellMat, CELLS);
  cells.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CELLS * 3), 3);
  scene.add(cells);
  const cell = [];
  { let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < CELLS; i++) cell.push({ L: loops[i % 2], u: rnd(), off: new THREE.Vector3((rnd() - 0.5) * 0.04, (rnd() - 0.5) * 0.04, (rnd() - 0.5) * 0.04), spin: rnd() * PI, inMuscle: false });
  }
  // oxygen leaving the blood in the muscle
  const DOTS = 140;
  const dotMat = new THREE.MeshBasicMaterial({ color: '#2fb6c9', transparent: true, opacity: 0.95 });
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.011, 8, 6), dotMat, DOTS);
  scene.add(dots);
  const dot = Array.from({ length: DOTS }, () => ({ live: 0, from: new THREE.Vector3(), to: new THREE.Vector3(), t: 0 }));
  let nextDot = 0;

  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), sc = new THREE.Vector3(), p3 = new THREE.Vector3(), hide = new THREE.Matrix4().makeScale(0, 0, 0);
  let time = 0, beatPhase = 0, breathPhase = 0, paintedAt = -1;
  const slow = reduceMotion() ? 0.35 : 1;
  S.setDriver(dt => {
    dt *= slow; time += dt;
    if (paintedAt !== O.e) { paintVessels(); paintedAt = O.e; dotMat.color.copy(O2C); }
    // heart beats at the model's rate; lungs breathe at its breathing rate
    beatPhase = (beatPhase + dt * O.hr / 60) % 1;
    const beat = Math.exp(-Math.pow((beatPhase - 0.1) / 0.07, 2)) + 0.5 * Math.exp(-Math.pow((beatPhase - 0.32) / 0.08, 2));
    heart.scale.setScalar(1 - 0.07 * beat);
    breathPhase = (breathPhase + dt * O.rr / 60) % 1;
    const br = 0.5 - 0.5 * Math.cos(2 * PI * breathPhase), amp = 0.03 + 0.05 * (O.tv / 2.6);
    lungs.forEach(l => { const k = 1 + amp * br; l.scale.set(0.27 * k, 0.4 * k, 0.2 * k); });
    mitoMat.emissiveIntensity = 0.15 + 1.4 * (O.vo2 / 3400);

    // cells flow faster as the heart pumps more: one lap takes about 14 s at rest in the lab's time
    const lap = 14 * 4.8 / O.q;
    for (let i = 0; i < CELLS; i++) {
      const c = cell[i];
      c.u = (c.u + dt / lap * (0.85 + 0.3 * ((i * 37) % 10) / 10)) % 1;
      c.L.curve.getPointAt(c.u, p3).add(c.off);
      c.spin += dt * 2;
      e4.set(c.spin, c.spin * 0.7, 0); q4.setFromEuler(e4); sc.set(1, 1, 1);
      cells.setMatrixAt(i, m4.compose(p3, q4, sc));
      cellColor(c.L, c.u, tmpC); cells.setColorAt(i, tmpC);
      const inM = c.u > c.L.uMuscleIn && c.u < c.L.uMuscleOut;
      // while in the muscle, a cell hands over oxygen: more of it the more the muscle takes
      if (inM && Math.random() < dt * (0.6 + 9 * O.avd / 16)) {
        const d = dot[nextDot]; nextDot = (nextDot + 1) % DOTS;
        d.live = 1; d.t = 0; d.from.copy(p3); d.to.copy(mitoPos[(i * 13 + Math.floor(time * 7)) % MITO]);
      }
    }
    cells.instanceMatrix.needsUpdate = true; if (cells.instanceColor) cells.instanceColor.needsUpdate = true;
    for (let i = 0; i < DOTS; i++) {
      const d = dot[i];
      if (!d.live) { dots.setMatrixAt(i, hide); continue; }
      d.t += dt / 0.9;
      if (d.t >= 1) { d.live = 0; dots.setMatrixAt(i, hide); continue; }
      p3.lerpVectors(d.from, d.to, d.t * d.t * (3 - 2 * d.t));
      const s = d.t < 0.8 ? 1 : (1 - d.t) / 0.2;
      dots.setMatrixAt(i, m4.makeScale(s, s, s).setPosition(p3));
    }
    dots.instanceMatrix.needsUpdate = true;
  });
}
