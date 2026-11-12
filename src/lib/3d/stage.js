// One WebGL stage per page: lights, red Martian ground with rocks, rover tracks that scroll, a post prop, the runner,
// a ground-force arrow and a foot-path trace. Each page sets a driver that poses the runner every frame.
// The canvas is transparent: the sky is the stage's CSS gradient, and fog of the same tone melts the ground into it.
// Day and Dusk follow the page (data-sky on <html>, changed by the `jezero-sky` event from src/scripts/sky.js).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Figure, COL } from './rig.js';
import { MARS } from './theme.js';

const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function canvasTexture(w, h, draw, rnd) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), rnd);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// small seeded random, so the rocks and the ground look the same on every visit
function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const isDusk = () => document.documentElement.dataset.sky === 'dusk';

/** Returns null when WebGL is not available, so the page can show its text-only fallback. */
/** Whether this browser can draw WebGL 2 at all. Asked first, because three.js logs an error when it can't. */
function canDraw() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext(); // only a test: give the context back
    return !!gl;
  } catch (e) {
    return false;
  }
}

export function createStage() {
  if (!canDraw()) return null;
  let theme = isDusk() ? MARS.dusk : MARS.day;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = theme.exposure;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'gl';
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = theme.envIntensity;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 6000);
  const hemi = new THREE.HemisphereLight(theme.hemi[0], theme.hemi[1], theme.hemi[2]); scene.add(hemi);
  scene.fog = new THREE.Fog(theme.fog[0], theme.fog[1], theme.fog[2]);
  const key = new THREE.DirectionalLight(theme.key[0], theme.key[1]);
  key.position.set(2.6, 5.2, 3.4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 15 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key); scene.add(key.target);
  const rim = new THREE.DirectionalLight(theme.rim[0], theme.rim[1]); rim.position.set(-3.5, 3.0, -4.0); scene.add(rim);
  const fill = new THREE.DirectionalLight(theme.fill[0], theme.fill[1]); fill.position.set(-4, 1.5, 3); scene.add(fill);

  // ground: tiled regolith (2 m per tile) on a plane wide enough to reach the horizon, hazed by the fog
  const rnd = seeded(0x4a45);
  const groundTex = canvasTexture(512, 512, theme.ground, rnd);
  groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping; groundTex.repeat.set(4000, 4000); groundTex.anisotropy = 8;
  const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, color: theme.groundColor, roughness: 1, metalness: 0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), groundMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // rocks: scattered around the runner, never on the tracks
  const rockMat = new THREE.MeshStandardMaterial({ color: theme.rock, roughness: 0.95, flatShading: true });
  const ROCKS = 170;
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), rockMat, ROCKS);
  {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    let n = 0;
    while (n < ROCKS) {
      const r = 1.3 + Math.pow(rnd(), 1.6) * 30, a = rnd() * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const size = 0.025 + Math.pow(rnd(), 3) * (0.12 + r * 0.012);
      if (Math.abs(x) < 0.85 + size) { rnd(); rnd(); continue; }
      e.set(rnd() * 3, rnd() * 3, rnd() * 3); q.setFromEuler(e);
      sc.set(size * (0.8 + rnd() * 0.6), size * (0.45 + rnd() * 0.35), size * (0.8 + rnd() * 0.6));
      p.set(x, sc.y * 0.35, z);
      rocks.setMatrixAt(n++, m.compose(p, q, sc));
    }
  }
  rocks.castShadow = true; rocks.receiveShadow = true; scene.add(rocks);

  // rover tracks: their texture scrolls like a treadmill belt; the ends fade out
  const laneTex = canvasTexture(256, 512, theme.trail);
  laneTex.wrapS = laneTex.wrapT = THREE.RepeatWrapping;
  const LANE_LEN = 9, TILE = 1.0;
  laneTex.repeat.set(1, LANE_LEN / TILE);
  const laneAlpha = canvasTexture(4, 256, x => {
    const gg = x.createLinearGradient(0, 0, 0, 256);
    gg.addColorStop(0, '#000'); gg.addColorStop(0.3, '#fff'); gg.addColorStop(0.7, '#fff'); gg.addColorStop(1, '#000');
    x.fillStyle = gg; x.fillRect(0, 0, 4, 256);
  });
  laneAlpha.colorSpace = THREE.NoColorSpace;
  const laneMat = new THREE.MeshStandardMaterial({ map: laneTex, alphaMap: laneAlpha, color: theme.track, roughness: 1, transparent: true, depthWrite: false });
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(1.22, LANE_LEN), laneMat);
  lane.receiveShadow = true;
  lane.rotation.x = -Math.PI / 2; lane.position.y = 0.002; scene.add(lane);

  // post for leg swings
  const propMat = new THREE.MeshPhysicalMaterial({ color: theme.prop, roughness: 0.5, metalness: 0.05, clearcoat: 0.3 });
  const post = new THREE.Group();
  {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.08, 24), propMat); m.position.y = 0.54; m.castShadow = true; post.add(m);
    const tp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), propMat); tp.position.y = 1.09; post.add(tp);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.04, 30), propMat); base.position.y = 0.02; base.castShadow = true; post.add(base);
  }
  scene.add(post); post.visible = false;

  for (const k of ['work', 'stretch', 'spring']) COL[k].set(theme.muscles[k]);
  const fig = new Figure(scene, theme.figure);

  // ground-force arrow
  const forceMat = new THREE.MeshStandardMaterial({ color: theme.force, emissive: theme.force, emissiveIntensity: 0.35, roughness: 0.4 });
  const arrow = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 16), forceMat); shaft.position.y = 0.5; arrow.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 20), forceMat); arrow.add(head);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), new THREE.MeshBasicMaterial({ color: theme.force, transparent: true, opacity: 0.6, depthWrite: false }));
  dot.rotation.x = -Math.PI / 2; dot.position.y = 0.004;
  const arrowRoot = new THREE.Group(); arrowRoot.add(arrow); arrowRoot.add(dot); scene.add(arrowRoot); arrowRoot.visible = false;
  function setForce(pos, fv, fh, scale = 0.2) {
    const len = Math.hypot(fv, fh) * scale;
    if (len < 0.01) { arrowRoot.visible = false; return; }
    arrowRoot.visible = true;
    arrowRoot.position.set(pos.x, 0, pos.z);
    arrow.rotation.set(Math.atan2(fh, fv), 0, 0);
    shaft.scale.set(1, Math.max(0.001, len - 0.1), 1); shaft.position.y = (len - 0.1) / 2;
    head.position.y = len - 0.055;
  }

  // foot path trace
  const pathMat = new THREE.MeshStandardMaterial({ color: theme.path, emissive: theme.path, emissiveIntensity: 0.2, transparent: true, opacity: 0.9, roughness: 0.5 });
  let pathMesh = null;
  function setPath(points) {
    if (pathMesh) { scene.remove(pathMesh); pathMesh.geometry.dispose(); pathMesh = null; }
    if (!points || points.length < 4) return;
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
    pathMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.006, 8, true), pathMat);
    scene.add(pathMesh);
  }
  function showPath(v) { if (pathMesh) pathMesh.visible = v; }

  // camera and orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.minDistance = 2.2; controls.maxDistance = 9;
  controls.maxPolarAngle = Math.PI * 0.53; controls.minPolarAngle = 0.15;
  controls.target.set(0, 0.85, 0);
  controls.rotateSpeed = 0.7;
  let tween = null;
  function camTo(view, instant = false) {
    const t = view.target || [0, 0.85, 0];
    const az = view.az, el = view.el ?? 0.1, d = view.dist ?? 5.2;
    const to = new THREE.Vector3(t[0] + Math.sin(az) * Math.cos(el) * d, t[1] + Math.sin(el) * d, t[2] + Math.cos(az) * Math.cos(el) * d);
    const tt = new THREE.Vector3(...t);
    if (instant || reduceMotion()) { camera.position.copy(to); controls.target.copy(tt); controls.update(); tween = null; return; }
    tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: to, t1: tt, u: 0 };
  }

  // sizing
  let host = null, W = 0, H = 0, shift = 0;
  const ro = new ResizeObserver(() => resize());
  function resize() {
    if (!host) return;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h || (w === W && h === H)) return;
    W = w; H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    applyShift();
  }
  // move the picture sideways (a share of the width), e.g. so the hero runner stands clear of the text panel
  function applyShift() {
    if (shift && W) camera.setViewOffset(W, H, -shift * W, 0, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function attach(el) {
    if (host) ro.unobserve(host);
    host = el; W = H = 0;
    el.prepend(canvas);
    ro.observe(el); resize();
  }

  // pause rendering when the stage is off screen or the tab is hidden
  let onScreen = true;
  const io = new IntersectionObserver(es => { for (const e of es) if (e.target === canvas) onScreen = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  let driver = null, last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!host || !onScreen || document.hidden) return;
    if (tween) {
      tween.u = Math.min(1, tween.u + dt / 0.8);
      const k = tween.u < 0.5 ? 4 * tween.u ** 3 : 1 - Math.pow(-2 * tween.u + 2, 3) / 2;
      camera.position.lerpVectors(tween.p0, tween.p1, k); controls.target.lerpVectors(tween.t0, tween.t1, k);
      if (tween.u >= 1) tween = null;
    }
    controls.update();
    if (driver) driver(dt);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  // Day and Dusk
  function setSky(dusk) {
    theme = dusk ? MARS.dusk : MARS.day;
    renderer.toneMappingExposure = theme.exposure;
    scene.environmentIntensity = theme.envIntensity;
    hemi.color.set(theme.hemi[0]); hemi.groundColor.set(theme.hemi[1]); hemi.intensity = theme.hemi[2];
    key.color.set(theme.key[0]); key.intensity = theme.key[1];
    rim.color.set(theme.rim[0]); rim.intensity = theme.rim[1];
    fill.color.set(theme.fill[0]); fill.intensity = theme.fill[1];
    scene.fog.color.set(theme.fog[0]); scene.fog.near = theme.fog[1]; scene.fog.far = theme.fog[2];
    groundMat.color.set(theme.groundColor); rockMat.color.set(theme.rock); laneMat.color.set(theme.track);
    forceMat.color.set(theme.force); forceMat.emissive.set(theme.force); dot.material.color.set(theme.force);
    pathMat.color.set(theme.path); pathMat.emissive.set(theme.path);
  }
  window.addEventListener('jezero-sky', e => setSky(!!(e.detail && e.detail.dusk)));

  function project(v3) {
    const p = v3.clone().project(camera);
    return { x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H, behind: p.z > 1 };
  }

  return {
    THREE, renderer, scene, camera, controls, fig, lane, post, floor,
    setForce, hideForce: () => { arrowRoot.visible = false; }, setPath, showPath,
    camTo, attach, setDriver: d => { driver = d; }, project, setSky,
    setShift(f) { shift = f; applyShift(); },
    scrollLane(dist) { laneTex.offset.y = -(dist / TILE) % 1; },
    size: () => ({ W, H }),
  };
}
