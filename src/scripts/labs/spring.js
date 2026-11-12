// The Spring lab: the runner and a spring-mass model of the same step, side by side on the Martian track.
import { createStage } from '../../lib/3d/stage.js';
import * as G from '../../lib/3d/gait.js';
import { springModel, stepState } from '../../lib/springmass.js';
import { ICON, reduceMotion, segPress, noGL } from '../ui.js';

const PI = Math.PI;
const POGO_Z = -1.2;          // the spring model stands behind the runner along the track
const LEG = 0.95;             // model leg length, m

export function initSpringLab(root) {
  if (!root) return;
  const $ = s => root.querySelector(s);
  const out = k => root.querySelector(`[data-out="${k}"]`);
  const st = { t: 0, v: 3.3, stiff: 0, mass: 70, playing: !reduceMotion(), rate: 0.08, dist: 0, runner: true, pogo: true, muscles: true };
  let P = null, M = null;

  // the gait model sets cadence and a typical contact time at each speed; the stiffness control shortens or
  // lengthens contact (a stiffer spring gives a quicker bounce)
  function build() {
    const base = G.gaitParams(st.v);
    const k = Math.pow(1.22, -st.stiff);                       // contact time factor, about 0.82 to 1.22
    const tc = Math.min(base.Tstep * 0.92, base.tc * k);
    P = { ...base, tc, duty: tc / base.Tstride, flight: base.Tstep - tc, Lc: st.v * tc };
    M = springModel({ v: st.v, Tstep: base.Tstep, tc, mass: st.mass, legLen: LEG });
    P.osc = (M.dy + M.rise) / 0.8;                               // runner's bounce matches the model
  }

  // ---- controls
  const playB = $('[data-act="play"]');
  const setPlaying = on => { st.playing = on; playB.innerHTML = on ? ICON.pause : ICON.play; playB.setAttribute('aria-label', on ? 'Pause' : 'Play'); };
  setPlaying(st.playing);
  playB.addEventListener('click', () => setPlaying(!st.playing));
  root.querySelectorAll('[data-rate]').forEach(b => b.addEventListener('click', () => { st.rate = +b.dataset.rate; segPress(b); if (!st.playing) setPlaying(true); }));
  const speed = $('#springSpeed'), stiff = $('#springStiff'), mass = $('#springMass');
  speed.addEventListener('input', () => { st.v = +speed.value; changed(); });
  stiff.addEventListener('input', () => { st.stiff = +stiff.value; changed(); });
  mass.addEventListener('input', () => { st.mass = +mass.value; changed(); });
  root.querySelectorAll('[data-opt]').forEach(i => i.addEventListener('change', () => { st[i.dataset.opt] = i.checked; applyVis(); }));

  function changed() {
    build();
    const pace = G.fmtPace(1000 / st.v);
    out('speed').textContent = `${pace} /km · ${G.fmtPace(1609.344 / st.v)} /mi`;
    out('stiffLbl').textContent = st.stiff < -0.33 ? 'Softer' : st.stiff > 0.33 ? 'Stiffer' : 'Typical';
    out('mass').textContent = `${st.mass} kg`;
    out('tele').textContent = `${pace} /km · ${Math.round(P.cad)} steps/min`;
    const rows = [
      ['Ground contact', Math.round(M.tc * 1000), 'ms'], ['In the air', Math.round(M.tf * 1000), 'ms'],
      ['Peak force', M.bw.toFixed(1), '× body weight'], ['Body drops', (M.dy * 100).toFixed(1), 'cm'],
      ['Leg spring shortens', (M.dL * 100).toFixed(1), 'cm'], ['Vertical stiffness', (M.kvert / 1000).toFixed(1), 'kN/m'],
      ['Leg stiffness', (M.kleg / 1000).toFixed(1), 'kN/m'], ['Energy in the spring', Math.round(M.energy), 'J'],
    ];
    out('readouts').innerHTML = rows.map(([k, v, u]) => `<div><dt>${k}</dt><dd><span class="num">${v}</span> <span class="u">${u}</span></dd></div>`).join('');
    drawChart();
  }

  // ---- chart: force (top) and body height (bottom) through one step
  const cv = out('chart'), cx = cv.getContext('2d');
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function drawChart() {
    if (!M) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w) return;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, w, h);
    const padL = 30, padR = 8, gap = 18, padT = 8, padB = 20;
    const ph = (h - padT - padB - gap) / 2;
    const X = f => padL + f * (w - padL - padR);
    const ink = css('--ink'), ink2 = css('--ink-2'), line = css('--line'), force = css('--force'), spring = css('--m-spring'), tint = css('--float-tint');
    const T = M.Tstep, fc = M.tc / T;
    cx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
    // float shading on both panels
    cx.fillStyle = tint; cx.fillRect(X(fc), padT, X(1) - X(fc), h - padT - padB);
    // force panel
    const fmax = 3.6, Yf = f => padT + (1 - f / fmax) * ph;
    cx.fillStyle = ink2; cx.textAlign = 'right'; cx.textBaseline = 'middle';
    for (const k of [0, 1, 2, 3]) { cx.fillText(k, padL - 7, Yf(k)); cx.strokeStyle = line; cx.beginPath(); cx.moveTo(padL, Yf(k)); cx.lineTo(w - padR, Yf(k)); cx.stroke(); }
    cx.setLineDash([4, 4]); cx.strokeStyle = ink2; cx.beginPath(); cx.moveTo(padL, Yf(1)); cx.lineTo(w - padR, Yf(1)); cx.stroke(); cx.setLineDash([]);
    cx.beginPath(); cx.moveTo(X(0), Yf(0));
    for (let i = 0; i <= 80; i++) { const t = (i / 80) * M.tc; cx.lineTo(X(t / T), Yf(stepState(M, t).F / (M.mass * 9.81))); }
    cx.lineTo(X(fc), Yf(0)); cx.globalAlpha = 0.16; cx.fillStyle = force; cx.fill(); cx.globalAlpha = 1; cx.strokeStyle = force; cx.lineWidth = 2; cx.stroke(); cx.lineWidth = 1;
    // height panel, cm
    const top = padT + ph + gap, lo = -10, hi = 4, Yh = y => top + (1 - (y - lo) / (hi - lo)) * ph;
    cx.fillStyle = ink2; cx.textAlign = 'right';
    for (const k of [-10, -5, 0]) { cx.fillText(k, padL - 7, Yh(k)); cx.strokeStyle = line; cx.beginPath(); cx.moveTo(padL, Yh(k)); cx.lineTo(w - padR, Yh(k)); cx.stroke(); }
    cx.beginPath();
    for (let i = 0; i <= 120; i++) { const t = (i / 120) * T, y = stepState(M, t).y * 100; i ? cx.lineTo(X(t / T), Yh(y)) : cx.moveTo(X(0), Yh(y)); }
    cx.strokeStyle = spring; cx.lineWidth = 2; cx.stroke(); cx.lineWidth = 1;
    // labels and the time cursor
    cx.textAlign = 'center'; cx.textBaseline = 'alphabetic'; cx.fillStyle = ink2;
    cx.fillText('foot down', X(fc / 2), h - 5); cx.fillText('in the air', X((1 + fc) / 2), h - 5);
    const tt = st.t % T, s = stepState(M, tt);
    cx.strokeStyle = ink; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(X(tt / T), padT); cx.lineTo(X(tt / T), h - padB); cx.stroke(); cx.lineWidth = 1;
    cx.fillStyle = force; cx.beginPath(); cx.arc(X(tt / T), Yf(s.F / (M.mass * 9.81)), 4, 0, 2 * PI); cx.fill();
    cx.fillStyle = spring; cx.beginPath(); cx.arc(X(tt / T), Yh(s.y * 100), 4, 0, 2 * PI); cx.fill();
  }
  new ResizeObserver(drawChart).observe(cv);
  new MutationObserver(drawChart).observe(document.documentElement, { attributes: true, attributeFilter: ['data-sky'] });

  let lastPhase = null;
  function phaseLabel(contact) {
    if (contact === lastPhase) return;
    lastPhase = contact;
    out('phase').textContent = contact ? 'Foot down' : 'In the air';
    out('phaseSub').textContent = contact ? 'The leg spring squashes, then springs back' : 'The spring is unloaded and swings forward';
  }

  // ---- 3D
  let S = null;
  try { S = createStage(); } catch (e) { console.warn('3D unavailable', e); }
  const stageEl = $('#springStage');
  build(); changed();
  if (!S) { noGL(stageEl); phaseLabel(true); return; }
  S.attach(stageEl);
  S.camTo({ az: -PI / 2, el: 0.1, dist: 4.4, target: [0, 0.68, -0.6] }, true);
  const { THREE } = S;

  // the spring model: a ball for the body's centre of mass on a coil spring, with a small foot
  const pogo = new THREE.Group(); pogo.position.z = POGO_Z; S.scene.add(pogo);
  const ballMat = new THREE.MeshPhysicalMaterial({ color: '#137872', roughness: 0.25, metalness: 0.1, clearcoat: 0.6 });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 40, 28), ballMat); ball.castShadow = true; pogo.add(ball);
  const coil = (() => {
    const turns = 9, r = 0.045, pts = [];
    for (let i = 0; i <= 360; i++) { const u = i / 360, a = u * turns * 2 * PI; pts.push(new THREE.Vector3(Math.cos(a) * r, u, Math.sin(a) * r)); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 720, 0.008, 8, false);
  })();
  const springMat = new THREE.MeshStandardMaterial({ color: '#8a8f96', roughness: 0.35, metalness: 0.6, emissive: '#2fd88c', emissiveIntensity: 0 });
  const springMesh = new THREE.Mesh(coil, springMat); springMesh.castShadow = true;
  const leg = new THREE.Group(); leg.add(springMesh); pogo.add(leg);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.03, 24), new THREE.MeshStandardMaterial({ color: '#22303f', roughness: 0.7 }));
  foot.castShadow = true; pogo.add(foot);
  const greenRest = new THREE.Color('#8a8f96'), green = new THREE.Color(), springCol = new THREE.Color();
  const readCols = () => springCol.set(css('--m-spring') || '#2f8f5b');
  readCols(); new MutationObserver(readCols).observe(document.documentElement, { attributes: true, attributeFilter: ['data-sky'] });
  S.fig.setVisible(true);

  function applyVis() { S.fig.setVisible(st.runner); pogo.visible = st.pogo; }
  applyVis();

  const up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), q = new THREE.Quaternion();
  let frame = 0;
  S.setDriver(dt => {
    const T = M.Tstep;
    if (st.playing) { st.t = (st.t + dt * st.rate) % (2 * T); st.dist += st.v * dt * st.rate; }
    // runner: stride phase 0 is the right foot's touchdown; the model's step starts at the same moment
    const phi = (st.t / (2 * T)) % 1;
    const r = G.runPose(phi, P, 'mid');
    S.fig.apply(r.pose);
    const m = G.muscleLevels(phi, P);
    if (st.muscles) {
      const lv = { achillesR: m.lv.achillesR, achillesL: m.lv.achillesL, calvesR: m.lv.calvesR, calvesL: m.lv.calvesL };
      S.fig.updateMuscles(lv, { achillesR: 'spring', achillesL: 'spring', calvesR: 'work', calvesL: 'work' });
    } else S.fig.updateMuscles({}, {});
    S.scrollLane(st.dist);
    S.hideForce();

    // spring model at the same moment of its step
    const tt = st.t % T, s = stepState(M, tt);
    const hip = M.H0 + s.y;                       // ball height
    ball.position.set(0, hip, 0);
    let fz, fy, len;
    if (s.contact) {
      fz = M.half - st.v * tt;                    // the foot is planted, and the track carries it backwards
      fy = 0; len = Math.hypot(fz, hip);
    } else {
      const k = s.q, a = -M.angle + 2 * M.angle * (k * k * (3 - 2 * k)); // swing from the take-off angle to the next touchdown
      len = LEG; fz = Math.sin(a) * LEG; fy = hip - Math.cos(a) * LEG;
    }
    foot.position.set(0, fy + 0.015, fz);
    dir.set(0, hip - fy, -fz).normalize();
    q.setFromUnitVectors(up, dir);
    leg.position.set(0, fy + 0.03, fz); leg.quaternion.copy(q);
    springMesh.scale.set(1, Math.max(0.2, len - 0.15), 1);
    const squash = s.contact ? Math.min(1, (LEG - len) / Math.max(0.02, M.dL)) : 0;
    green.copy(greenRest).lerp(springCol, squash);
    springMat.color.copy(green); springMat.emissiveIntensity = 0.35 * squash;

    phaseLabel(s.contact);
    if ((frame++ & 1) === 0) drawChart();
  });
}
