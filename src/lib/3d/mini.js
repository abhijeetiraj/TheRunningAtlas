// A small WebGL stage for the labs that don't need the runner or the Martian ground: a studio with soft light,
// orbit controls, a camera that can glide between views, and Day and Dusk lighting that follows the page.
// The canvas is transparent, so the stage's CSS background shows through (see .stage in src/styles/global.css).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isDusk = () => document.documentElement.dataset.sky === 'dusk';

function canDraw() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch (e) {
    return false;
  }
}

const LIGHT = {
  day: { exposure: 1.0, env: 0.55, hemi: ['#fff1e2', '#b07a5a', 1.0], key: ['#fff3e4', 2.2], rim: ['#ffd6b0', 0.7] },
  dusk: { exposure: 1.08, env: 0.38, hemi: ['#8fa8d8', '#2a1f22', 0.7], key: ['#ffe6cc', 1.9], rim: ['#7fe3da', 1.0] },
};

/**
 * opts: { fov, near, far, target: [x,y,z], minDist, maxDist, pan, clipping, shadows }
 * Returns null when WebGL is not available, so the page can show its text-only fallback.
 */
export function createMiniStage(opts = {}) {
  if (!canDraw()) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  if (!renderer.getContext()) return null;
  let L = isDusk() ? LIGHT.dusk : LIGHT.day;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = L.exposure;
  renderer.setClearColor(0x000000, 0);
  renderer.localClippingEnabled = !!opts.clipping;
  if (opts.shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
  const canvas = renderer.domElement;
  canvas.className = 'gl';
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = L.env;
  const hemi = new THREE.HemisphereLight(L.hemi[0], L.hemi[1], L.hemi[2]); scene.add(hemi);
  const key = new THREE.DirectionalLight(L.key[0], L.key[1]); key.position.set(3, 5, 4); scene.add(key);
  if (opts.shadows) {
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 14 });
    key.shadow.bias = -0.0005; key.shadow.radius = 4;
  }
  const rim = new THREE.DirectionalLight(L.rim[0], L.rim[1]); rim.position.set(-4, 2.5, -3); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(opts.fov ?? 32, 1, opts.near ?? 0.05, opts.far ?? 200);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.rotateSpeed = 0.7;
  controls.enablePan = !!opts.pan;
  controls.minDistance = opts.minDist ?? 1; controls.maxDistance = opts.maxDist ?? 20;
  controls.target.set(...(opts.target || [0, 0, 0]));

  let tween = null;
  /** Glide to a view: { target: [x,y,z], az, el, dist }. */
  function camTo(view, instant = false) {
    const t = view.target || [0, 0, 0];
    const az = view.az ?? 0, el = view.el ?? 0.2, d = view.dist ?? 5;
    const to = new THREE.Vector3(t[0] + Math.sin(az) * Math.cos(el) * d, t[1] + Math.sin(el) * d, t[2] + Math.cos(az) * Math.cos(el) * d);
    const tt = new THREE.Vector3(...t);
    if (instant || reduceMotion()) { camera.position.copy(to); controls.target.copy(tt); controls.update(); tween = null; return; }
    tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: to, t1: tt, u: 0 };
  }

  let host = null, W = 0, H = 0;
  const ro = new ResizeObserver(() => resize());
  function resize() {
    if (!host) return;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h || (w === W && h === H)) return;
    W = w; H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  function attach(el) {
    host = el; W = H = 0;
    el.prepend(canvas);
    ro.observe(el); resize();
  }

  let onScreen = true;
  const io = new IntersectionObserver(es => { for (const e of es) if (e.target === canvas) onScreen = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  let driver = null, last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!host || !onScreen || document.hidden) return;
    if (tween) {
      tween.u = Math.min(1, tween.u + dt / 0.9);
      const k = tween.u < 0.5 ? 4 * tween.u ** 3 : 1 - Math.pow(-2 * tween.u + 2, 3) / 2;
      camera.position.lerpVectors(tween.p0, tween.p1, k); controls.target.lerpVectors(tween.t0, tween.t1, k);
      if (tween.u >= 1) tween = null;
    }
    controls.update();
    if (driver) driver(dt, now / 1000);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  const skyHooks = [];
  function setSky(dusk) {
    L = dusk ? LIGHT.dusk : LIGHT.day;
    renderer.toneMappingExposure = L.exposure; scene.environmentIntensity = L.env;
    hemi.color.set(L.hemi[0]); hemi.groundColor.set(L.hemi[1]); hemi.intensity = L.hemi[2];
    key.color.set(L.key[0]); key.intensity = L.key[1];
    rim.color.set(L.rim[0]); rim.intensity = L.rim[1];
    for (const f of skyHooks) f(dusk);
  }
  window.addEventListener('jezero-sky', e => setSky(!!(e.detail && e.detail.dusk)));

  function project(v3) {
    const p = v3.clone().project(camera);
    return { x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H, behind: p.z > 1 || p.z < -1 };
  }

  return {
    THREE, renderer, scene, camera, controls, key,
    camTo, attach, project,
    setDriver: d => { driver = d; },
    onSky: f => { skyHooks.push(f); f(isDusk()); },
    size: () => ({ W, H }),
  };
}

/** Read a CSS custom property from the page (for colours that follow Day and Dusk). */
export const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
