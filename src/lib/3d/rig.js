// Procedural 3D runner mannequin: bone hierarchy, smooth lathe segments, shoes, leg IK and dynamic muscle spindles.
// Units are metres, Y up, the figure faces +Z when root.rotation.y = 0. Figure's left side is +X.
import * as THREE from 'three';

export const DIM = {
  hipW: 0.092, hipY: -0.02,           // hip joints relative to pelvis origin
  L1: 0.445, L2: 0.425,               // thigh, shin
  ankleH: 0.085,                      // ankle joint height above the ground when the foot is flat
  ballZ: 0.135, heelZ: -0.07, toeZ: 0.2,
  spineY: 0.11, chestY: 0.2, neckY: 0.27, headY: 0.09,
  shX: 0.185, shY: 0.215, U: 0.29, F: 0.255,
};
export const STAND_Y = DIM.ankleH + DIM.L1 + DIM.L2 - 0.012;   // pelvis height, standing tall with soft knees

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// lathe segment hanging along -Y from 0 to -len; r(s) radius profile, rounded ends
function segGeo(len, prof, n = 28, radial = 28, cap = 0.12) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    let c = 1;
    if (s < cap) c = Math.sqrt(1 - ((cap - s) / cap) ** 2);
    if (s > 1 - cap) c = Math.sqrt(Math.max(0, 1 - ((s - (1 - cap)) / cap) ** 2));
    pts.push(new THREE.Vector2(Math.max(0.0005, prof(s) * c), -s * len));
  }
  const g = new THREE.LatheGeometry(pts, radial);
  g.computeVertexNormals();
  return g;
}
// same but growing along +Y
function segGeoUp(len, prof, n, radial, cap) { const g = segGeo(len, prof, n, radial, cap); g.rotateX(Math.PI); return g; }

function shoeGeos() {
  // side profile in (z, y) relative to the ankle joint; extruded across x
  const s = new THREE.Shape();
  const y0 = -DIM.ankleH;          // ground
  s.moveTo(-0.075, y0 + 0.012);
  s.bezierCurveTo(-0.082, y0 + 0.05, -0.07, y0 + 0.1, -0.04, y0 + 0.11);
  s.lineTo(0.0, y0 + 0.105);
  s.bezierCurveTo(0.06, y0 + 0.095, 0.12, y0 + 0.07, 0.17, y0 + 0.05);
  s.bezierCurveTo(0.205, y0 + 0.04, 0.215, y0 + 0.02, 0.205, y0 + 0.008);
  s.lineTo(-0.06, y0 + 0.008);
  s.closePath();
  const upper = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 4, curveSegments: 18 });
  upper.translate(0, 0, -0.035);
  upper.rotateY(-Math.PI / 2);      // shape x(z) -> world z, extrusion -> world x
  const so = new THREE.Shape();
  so.moveTo(-0.08, y0); so.lineTo(0.2, y0); so.bezierCurveTo(0.225, y0, 0.228, y0 + 0.022, 0.21, y0 + 0.024);
  so.lineTo(-0.078, y0 + 0.026); so.bezierCurveTo(-0.09, y0 + 0.02, -0.09, y0, -0.08, y0);
  const sole = new THREE.ExtrudeGeometry(so, { depth: 0.082, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 3, curveSegments: 12 });
  sole.translate(0, 0, -0.041); sole.rotateY(-Math.PI / 2);
  upper.computeVertexNormals(); sole.computeVertexNormals();
  return { upper, sole };
}

function fibreTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 64);
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 64, a = 0.05 + Math.random() * 0.12;
    g.strokeStyle = `rgba(120,40,70,${a})`; g.lineWidth = 0.6 + Math.random() * 1.2;
    g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(80, y + (Math.random() - 0.5) * 3, 170, y + (Math.random() - 0.5) * 3, 256, y); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------------ muscles
// anchors: [boneName, x, y, z] in that bone's local frame (x is mirrored for the right side)
export const MUSCLES = {
  hamstrings: { r: 0.04, pts: [['pelvis', 0.062, -0.085, -0.07], ['thigh', 0.0, -0.17, -0.066], ['thigh', 0.0, -0.36, -0.05], ['shin', 0.0, -0.07, -0.036]] },
  quads: { r: 0.046, pts: [['pelvis', 0.085, -0.02, 0.08], ['thigh', 0.012, -0.16, 0.068], ['thigh', 0.0, -0.36, 0.052], ['shin', 0.0, 0.0, 0.055], ['shin', 0.0, -0.075, 0.042]] },
  hipflexors: { r: 0.03, pts: [['spine', 0.05, 0.02, 0.02], ['pelvis', 0.07, 0.04, 0.085], ['pelvis', 0.06, -0.06, 0.07], ['thigh', -0.028, -0.07, 0.035]] },
  glutes: { r: 0.058, pts: [['pelvis', 0.025, 0.07, -0.105], ['pelvis', 0.085, -0.02, -0.115], ['thigh', 0.045, -0.12, -0.035]] },
  adductors: { r: 0.038, pts: [['pelvis', 0.022, -0.085, 0.045], ['thigh', -0.045, -0.12, 0.012], ['thigh', -0.052, -0.3, -0.005]] },
  abductors: { r: 0.034, pts: [['pelvis', 0.15, 0.085, 0.0], ['pelvis', 0.165, 0.0, 0.0], ['thigh', 0.07, -0.05, 0.0]] },
  rotators: { r: 0.024, pts: [['pelvis', 0.03, -0.01, -0.095], ['pelvis', 0.09, -0.04, -0.08], ['thigh', 0.06, -0.035, -0.02]] },
  calves: { r: 0.042, pts: [['thigh', 0.0, -0.405, -0.032], ['shin', 0.0, -0.1, -0.052], ['shin', 0.0, -0.24, -0.04], ['shin', 0.0, -0.31, -0.03]] },
  achilles: { r: 0.012, tendon: true, pts: [['shin', 0.0, -0.3, -0.032], ['shin', 0.0, -0.38, -0.034], ['foot', 0.0, -0.035, -0.07]] },
};

export const MUSCLE_NAME = {
  hamstrings: 'Hamstrings', quads: 'Quads', hipflexors: 'Hip flexors', glutes: 'Glutes', adductors: 'Inner thigh (adductors)',
  abductors: 'Outer hip (glute med)', rotators: 'Deep hip rotators', calves: 'Calves', achilles: 'Achilles tendon',
};

export const COL = { stretch: new THREE.Color('#ff4f9a'), work: new THREE.Color('#ffa21f'), spring: new THREE.Color('#2fd88c') };

class Muscle {
  constructor(fig, key, side) {
    this.fig = fig; this.key = key; this.side = side; const def = MUSCLES[key]; this.def = def;
    this.anchors = def.pts.map(([bone, x, y, z]) => {
      const o = new THREE.Object3D(); o.position.set(x * side, y, z); fig.bone(bone, side).add(o); return o;
    });
    this.NS = 30; this.NR = 16;
    const g = new THREE.BufferGeometry();
    const n = (this.NS + 1) * (this.NR + 1);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const uv = new Float32Array(n * 2), idx = [];
    for (let i = 0; i <= this.NS; i++) for (let j = 0; j <= this.NR; j++) { const k = i * (this.NR + 1) + j; uv[k * 2] = i / this.NS; uv[k * 2 + 1] = j / this.NR; }
    for (let i = 0; i < this.NS; i++) for (let j = 0; j < this.NR; j++) {
      const a = i * (this.NR + 1) + j, b = a + this.NR + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    this.geo = g;
    this.mat = new THREE.MeshStandardMaterial({ color: COL.stretch.clone(), emissive: COL.stretch.clone(), emissiveIntensity: 0.25, roughness: 0.32, metalness: 0.0, map: fig.fibre, transparent: true, opacity: 0, depthWrite: true });
    this.ghostMat = new THREE.MeshBasicMaterial({ color: COL.stretch.clone(), transparent: true, opacity: 0, depthTest: true, depthFunc: THREE.GreaterDepth, depthWrite: false });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.castShadow = false; this.mesh.renderOrder = 2;
    this.ghost = new THREE.Mesh(g, this.ghostMat); this.ghost.frustumCulled = false; this.ghost.renderOrder = 3;
    fig.scene.add(this.mesh); fig.scene.add(this.ghost);
    this.rest = null; this.curve = new THREE.CatmullRomCurve3(this.anchors.map(() => new THREE.Vector3()), false, 'centripetal');
    this.level = 0; this.mode = 'stretch'; this.ratio = 1; this.mid = new THREE.Vector3();
  }
  pathLength() {
    let L = 0; const p = this.anchors.map(a => a.getWorldPosition(new THREE.Vector3()));
    for (let i = 1; i < p.length; i++) L += p[i].distanceTo(p[i - 1]);
    return L;
  }
  update() {
    const L = this.pathLength();
    if (this.rest == null) this.rest = L;
    this.ratio = L / this.rest;
    const vis = this.level > 0.002;
    this.mesh.visible = vis; this.ghost.visible = vis;
    if (!vis) return;
    this.anchors.forEach((a, i) => a.getWorldPosition(this.curve.points[i]));
    const pos = this.geo.attributes.position.array;
    const thin = 1 / Math.sqrt(Math.max(0.6, this.ratio));          // keep volume: longer -> thinner
    const R = this.def.r * 1.2 * thin * this.fig.scale;
    const frames = this.curve.computeFrenetFrames(this.NS, false);
    const P = new THREE.Vector3();
    for (let i = 0; i <= this.NS; i++) {
      const s = i / this.NS;
      this.curve.getPointAt(s, P);
      if (i === Math.floor(this.NS / 2)) this.mid.copy(P);
      let prof;
      if (this.def.tendon) prof = 0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, s * 1.0)) ** 0.3;
      else prof = Math.pow(Math.sin(Math.PI * Math.min(0.999, Math.max(0.001, s))), 0.75) * 0.92 + 0.08;
      const r = R * prof;
      const N = frames.normals[i], B = frames.binormals[i];
      for (let j = 0; j <= this.NR; j++) {
        const a = (j / this.NR) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
        const k = (i * (this.NR + 1) + j) * 3;
        pos[k] = P.x + r * (c * N.x + sn * B.x); pos[k + 1] = P.y + r * (c * N.y + sn * B.y); pos[k + 2] = P.z + r * (c * N.z + sn * B.z);
      }
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.computeVertexNormals();
    const base = this.def.tendon && this.mode === 'stretch' ? COL.spring : COL[this.mode];
    // lengthening reads as a brighter glow
    const stretchGlow = this.mode === 'stretch' ? smooth(1.0, 1.12, this.ratio) : 0.35 + 0.65 * smooth(1.0, 0.93, this.ratio);
    this.mat.color.copy(base); this.mat.emissive.copy(base);
    this.mat.emissiveIntensity = 0.12 + 0.5 * stretchGlow * this.level;
    this.mat.opacity = Math.min(1, this.level * 1.15); this.mat.transparent = this.mat.opacity < 0.99;
    this.ghostMat.color.copy(base); this.ghostMat.opacity = this.fig.ghost * this.level; this.mesh.renderOrder = 2;
  }
}

// ------------------------------------------------------------------ figure
export class Figure {
  constructor(scene, opts = {}) {
    this.scene = scene; this.scale = opts.scale || 1; this.ghost = 0.3; this.fibre = opts.fibre || fibreTexture();
    const skin = new THREE.MeshPhysicalMaterial({ color: opts.skin || '#ebe5da', roughness: 0.5, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.6, sheen: 0.3, sheenColor: new THREE.Color('#ffffff') });
    const joint = new THREE.MeshPhysicalMaterial({ color: opts.joint || '#c9c1b4', roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.5 });
    const shoeM = new THREE.MeshPhysicalMaterial({ color: opts.shoe || '#ff6b6b', roughness: 0.55, clearcoat: 0.2 });
    const soleM = new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.7 });
    this.skin = skin; this.jointMat = joint;
    const M = (geo, mat, parent, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
    const O = (parent, x = 0, y = 0, z = 0) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

    this.root = O(scene); this.root.scale.setScalar(this.scale);
    const pelvis = this.pelvis = O(this.root, 0, STAND_Y, 0);
    // pelvis block
    const pg = segGeoUp(0.23, s => 0.1 + 0.07 * Math.sin(Math.PI * Math.min(1, s * 1.25)) ** 0.8 - 0.02 * s, 28, 32, 0.22);
    const pm = M(pg, skin, pelvis); pm.position.y = -0.1; pm.scale.set(1.12, 1, 0.78);
    // abdomen + chest
    const spine = this.spine = O(pelvis, 0, DIM.spineY, 0);
    const ab = M(segGeoUp(0.2, s => 0.118 + 0.01 * Math.sin(Math.PI * s), 20, 32, 0.1), skin, spine); ab.position.y = -0.04; ab.scale.set(1.1, 1, 0.78);
    const chest = this.chest = O(spine, 0, DIM.chestY - 0.06, 0);
    const cg = segGeoUp(0.33, s => 0.122 + 0.055 * Math.sin(Math.PI * Math.min(1, s * 1.15)) ** 0.7 - 0.03 * s, 30, 36, 0.2);
    const cm = M(cg, skin, chest); cm.position.y = -0.03; cm.scale.set(1.18, 1, 0.74);
    const neck = this.neck = O(chest, 0, DIM.neckY, 0);
    M(segGeoUp(0.12, s => 0.045 - 0.006 * s, 10, 20, 0.05), skin, neck).position.y = -0.03;
    const head = this.head = O(neck, 0, DIM.headY, 0.0);
    const hg = new THREE.SphereGeometry(1, 40, 30); const hm = M(hg, skin, head); hm.scale.set(0.094, 0.118, 0.106); hm.position.set(0, 0.035, 0.012);
    const jaw = M(new THREE.SphereGeometry(1, 30, 20), skin, head); jaw.scale.set(0.07, 0.06, 0.075); jaw.position.set(0, -0.035, 0.04);
    // a visor cap makes facing direction obvious
    const capM = new THREE.MeshPhysicalMaterial({ color: opts.cap || '#2f6fd6', roughness: 0.5, clearcoat: 0.3 });
    const cap = M(new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.5), capM, head); cap.scale.set(0.1, 0.085, 0.112); cap.position.set(0, 0.06, 0.01);
    const brim = M(new THREE.CylinderGeometry(0.075, 0.075, 0.01, 30, 1, false, -Math.PI * 0.5, Math.PI), capM, head); brim.scale.set(1, 1, 0.9); brim.position.set(0, 0.068, 0.07); brim.rotation.x = 0.12;
    this.bones = { pelvis, spine, chest, neck, head };

    // arms
    for (const side of [1, -1]) {
      const sh = O(chest, DIM.shX * side, DIM.shY, -0.005);
      M(new THREE.SphereGeometry(0.058, 24, 18), joint, sh);
      const ua = O(sh);
      M(segGeo(DIM.U, s => 0.05 - 0.012 * s + 0.006 * Math.sin(Math.PI * s), 20, 22, 0.14), skin, ua);
      const el = O(ua, 0, -DIM.U, 0);
      M(new THREE.SphereGeometry(0.036, 20, 14), joint, el);
      const fa = O(el);
      M(segGeo(DIM.F, s => 0.04 - 0.014 * s + 0.004 * Math.sin(Math.PI * s * 0.8), 20, 22, 0.14), skin, fa);
      const wr = O(fa, 0, -DIM.F, 0);
      const hand = O(wr);
      const hm2 = M(segGeo(0.17, s => 0.034 + 0.008 * Math.sin(Math.PI * s * 0.9), 16, 20, 0.35), skin, hand); hm2.scale.set(0.75, 1, 1.0); hm2.position.y = 0.01;
      const th = M(segGeo(0.07, s => 0.014, 8, 12, 0.4), skin, hand); th.position.set(0, -0.03, 0.03); th.rotation.x = -0.6;
      this.bones['shoulder' + side] = sh; this.bones['uarm' + side] = ua; this.bones['farm' + side] = fa; this.bones['hand' + side] = hand;
      this.bones['elbow' + side] = el;
    }
    // legs
    const shoe = shoeGeos();
    for (const side of [1, -1]) {
      const hip = O(pelvis, DIM.hipW * side, DIM.hipY, 0);
      M(new THREE.SphereGeometry(0.07, 24, 18), skin, hip);
      const th = O(hip);
      M(segGeo(DIM.L1, s => 0.084 - 0.03 * s + 0.012 * Math.sin(Math.PI * s), 26, 28, 0.08), skin, th);
      const kn = O(th, 0, -DIM.L1, 0);
      M(new THREE.SphereGeometry(0.053, 22, 16), joint, kn);
      const sk = O(kn);
      M(segGeo(DIM.L2, s => 0.05 - 0.02 * s + 0.012 * Math.sin(Math.PI * Math.min(1, s * 1.6)) * (s < 0.62 ? 1 : 0.6), 26, 28, 0.08), skin, sk);
      const an = O(sk, 0, -DIM.L2, 0);
      const ft = O(an);
      M(shoe.upper, shoeM, ft); M(shoe.sole, soleM, ft);
      this.bones['hip' + side] = hip; this.bones['thigh' + side] = th; this.bones['shin' + side] = sk; this.bones['foot' + side] = ft;
    }
    this.muscles = [];
    for (const key of Object.keys(MUSCLES)) for (const side of [1, -1]) this.muscles.push(new Muscle(this, key, side));
    this.root.updateMatrixWorld(true);
    this.setVisible(true);
  }
  bone(name, side) {
    if (['thigh', 'shin', 'foot', 'hip', 'uarm', 'farm', 'hand', 'shoulder'].includes(name)) return this.bones[name + side];
    return this.bones[name];
  }
  setXray(a) { // 0 = solid skin, 1 = see-through skin
    for (const m of [this.skin, this.jointMat]) { m.transparent = a > 0.001; m.opacity = 1 - 0.55 * a; m.depthWrite = a < 0.5; }
  }
  setVisible(v) { this.root.visible = v; this.visible = v; }
  muscle(key, side) { return this.muscles.find(m => m.key === key && m.side === side); }

  // pose: see moves.js. Angles in radians.
  apply(p) {
    const r = this.root, B = this.bones;
    r.position.set(p.x || 0, 0, p.z || 0); r.rotation.set(0, p.ry || 0, 0);
    B.pelvis.position.set(p.px || 0, p.py != null ? p.py : STAND_Y, p.pz || 0);
    B.pelvis.rotation.set(p.pTilt || 0, p.pTwist || 0, p.pRoll || 0);
    B.spine.rotation.set(p.spF || 0, p.spT || 0, p.spS || 0);
    B.chest.rotation.set(p.chF || 0, p.chT || 0, p.chS || 0);
    B.neck.rotation.set(p.nkF || 0, p.nkT || 0, 0);
    B.head.rotation.set(p.hdF || 0, p.hdT || 0, 0);
    for (const side of [1, -1]) {
      const a = p.arm[side];
      B['uarm' + side].rotation.set(-(a.flex || 0), a.rot || 0, (a.abd || 0) * side);
      B['farm' + side].rotation.set(-(a.elbow || 0), 0, 0);
      B['hand' + side].rotation.set(a.wrist || 0, 0, 0);
    }
    r.updateMatrixWorld(true);
    for (const side of [1, -1]) {
      const l = p.leg[side];
      if (l.ik) this.solveLeg(side, l); else {
        B['thigh' + side].rotation.set(-(l.flex || 0), (l.rot || 0) * side, (l.abd || 0) * side);
        B['shin' + side].rotation.set(l.knee || 0, 0, 0);
        B['foot' + side].rotation.set(l.ankle || 0, 0, 0);
      }
    }
    r.updateMatrixWorld(true);
  }
  // l.ik = {x, z, pitch, ball}: world ground position of the ankle (flat) or of the ball of the foot (ball: true), pitch>0 lifts the heel
  solveLeg(side, l) {
    const B = this.bones, k = l.ik, s = this.scale;
    const pitch = k.pitch || 0;
    let ax = k.x, az = k.z, ay = DIM.ankleH + (k.lift || 0);
    if (k.ball || k.heel) { // rotate the ankle about the ball (heel lifts) or the heel (toes lift); k.z stays the flat-foot ankle z
      const vy = DIM.ankleH, vz = k.ball ? -DIM.ballZ : -DIM.heelZ;
      ay = vy * Math.cos(pitch) - vz * Math.sin(pitch) + (k.lift || 0);
      az = k.z - vz + (vy * Math.sin(pitch) + vz * Math.cos(pitch));
    }
    // world target -> local (root) frame: root is translated/rotated/scaled; targets are given in root-local metres
    const target = new THREE.Vector3(ax, ay, az);
    const pel = B.pelvis, hip = B['hip' + side];
    // express target in pelvis frame
    const Tw = this.root.localToWorld(target.clone());
    const Tp = pel.worldToLocal(Tw.clone());
    const d = Tp.sub(hip.position);
    const L1 = DIM.L1, L2 = DIM.L2;
    let dist = d.length(); dist = Math.min(dist, L1 + L2 - 0.0015); dist = Math.max(dist, 0.12);
    const u = d.clone().normalize();
    const abd = Math.asin(Math.max(-1, Math.min(1, u.x))) * side;
    const f = Math.atan2(u.z, -u.y);
    const alpha = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist))));
    const knee = Math.PI - Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2))));
    const flex = f + alpha;
    B['thigh' + side].rotation.set(-flex, (l.rot || 0) * side, abd * side);
    B['shin' + side].rotation.set(knee, 0, 0);
    // foot pitch relative to the world: undo pelvis tilt and leg pitch
    const pt = pel.rotation.x;
    B['foot' + side].rotation.set(pitch - (-flex + knee + pt), 0, 0);
    this.lastIK = this.lastIK || {}; this.lastIK[side] = { flex, knee, abd };
  }
  updateMuscles(levels = {}, modes = {}) {
    for (const m of this.muscles) {
      const id = m.key + (m.side > 0 ? 'L' : 'R');
      const lv = levels[id] != null ? levels[id] : levels[m.key] != null ? levels[m.key] : 0;
      m.level = this.visible ? lv : 0; m.mode = modes[id] || modes[m.key] || 'stretch';
      m.update();
    }
  }
}

export function neutralPose() {
  return {
    x: 0, z: 0, ry: 0, px: 0, py: STAND_Y, pz: 0, pTilt: 0,
    spF: 0.02, chF: 0.0, nkF: 0, hdF: 0,
    arm: { 1: { flex: 0.05, abd: 0.12, elbow: 0.25 }, '-1': { flex: 0.05, abd: 0.12, elbow: 0.25 } },
    leg: { 1: { ik: { x: DIM.hipW + 0.01, z: 0 } }, '-1': { ik: { x: -DIM.hipW - 0.01, z: 0 } } },
  };
}
