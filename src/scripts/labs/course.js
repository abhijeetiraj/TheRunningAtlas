// The Course fly-over: a made-up race course in 3D, with its hills drawn taller than they are, a pacing plan that
// keeps effort steady over the hills (src/lib/course.js, claim C5), and a fly-over that follows the plan.
// The elevation chart and splits table below the stage work without WebGL too.
import { createMiniStage, isDusk } from '../../lib/3d/mini.js';
import { COURSES } from '../../data/courses.js';
import { buildPlan, segIndex } from '../../lib/course.js';
import { fmtClock, fmtPace } from '../run-math.js';
import { ICON, reduceMotion, segPress, noGL } from '../ui.js';

const EXAG = 6;            // hills drawn this many times taller than they are
const SIZE = 10;           // the course fits in about this many scene units
const FLY = 40;            // seconds for a whole fly-over at normal speed

export function initCourseLab(root) {
  if (!root) return;
  const $ = s => root.querySelector(s);
  const out = k => root.querySelector(`[data-out="${k}"]`);
  const st = { ci: 1, time: COURSES[1].time, km: 0, playing: false, follow: true };
  let plan = null;

  // ---- controls
  const playB = $('[data-act="play"]');
  const setPlaying = on => {
    st.playing = on; playB.innerHTML = on ? ICON.pause : ICON.play; playB.setAttribute('aria-label', on ? 'Pause' : 'Play');
    if (on && st.km >= COURSES[st.ci].km - 1e-6) st.km = 0;
    if (on) setFollow(true);
  };
  playB.addEventListener('click', () => setPlaying(!st.playing));
  const viewBs = [...root.querySelectorAll('[data-view]')];
  function setFollow(on, move = true) {
    st.follow = on;
    viewBs.forEach(b => b.setAttribute('aria-pressed', String((b.dataset.view === 'follow') === on)));
    if (!on && move && S) S.camTo(overview, false);
  }
  viewBs.forEach(b => b.addEventListener('click', () => setFollow(b.dataset.view === 'follow')));
  const hIn = $('[data-in="h"]'), mIn = $('[data-in="m"]'), scrub = $('#courseScrub');
  root.querySelectorAll('[data-course]').forEach(b => b.addEventListener('click', () => {
    segPress(b); st.ci = +b.dataset.course; st.time = COURSES[st.ci].time; st.km = 0;
    hIn.value = Math.floor(st.time / 3600); mIn.value = Math.round((st.time % 3600) / 60);
    rebuild(true);
  }));
  for (const i of [hIn, mIn]) i.addEventListener('input', () => {
    const t = (+hIn.value || 0) * 3600 + (+mIn.value || 0) * 60;
    const c = COURSES[st.ci], pace = t / c.km;
    const msg = out('msg');
    if (pace < 150 || pace > 900) { msg.hidden = false; msg.textContent = 'Enter a finishing time that works out between 2:30 and 15:00 per km.'; return; }
    msg.hidden = true; st.time = t; rebuild(false);
  });
  scrub.addEventListener('input', () => { st.km = +scrub.value / 1000 * COURSES[st.ci].km; setPlaying(false); show(); });

  // ---- 3D
  const stageEl = $('#courseStage');
  const S = createMiniStage({ fov: 40, near: 0.01, far: 120, minDist: 0.6, maxDist: 26, pan: true, target: [0, 0, 0] });
  let overview = { target: [0, 0, 0], az: 0.5, el: 0.62, dist: 13 };
  let G = null;                 // this course's scene objects and helpers
  if (S) {
    S.attach(stageEl);
    S.controls.maxPolarAngle = Math.PI * 0.47;
    S.controls.addEventListener('start', () => { if (st.follow) setFollow(false, false); });
    S.onSky(d => G?.paint(d));
  } else noGL(stageEl);

  function buildScene(course) {
    const { THREE, scene } = S;
    if (G) { scene.remove(G.group); G.group.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); }); }
    const group = new THREE.Group(); scene.add(group);
    // route: a smooth curve through the control points, scaled to the course's real length
    const raw = new THREE.CatmullRomCurve3(course.route.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    const k = course.km / raw.getLength();
    const box = new THREE.Box3().setFromPoints(raw.getSpacedPoints(200));
    const ext = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) * k;
    const s = SIZE / ext;                                   // scene units per km
    const cx = (box.max.x + box.min.x) / 2, cz = (box.max.z + box.min.z) / 2;
    const vy = s / 1000 * EXAG;                              // scene units per metre of height
    const base = plan.low;
    const Y = el => (el - base) * vy;
    const P = km => { const v = raw.getPointAt(Math.min(1, Math.max(0, km / course.km))); return new THREE.Vector3((v.x - cx) * k * s, 0, (v.z - cz) * k * s); };
    const T = km => { const v = raw.getTangentAt(Math.min(1, Math.max(0, km / course.km))); return new THREE.Vector3(v.x, 0, v.z).normalize(); };

    // samples along the route for the road and the terrain
    const N = plan.d.length, pts = plan.d.map((km, i) => { const p = P(km); p.y = Y(plan.e[i]); return p; });

    // terrain: heights spread out from the route, dropping gently away from it, with a little texture
    const half = SIZE * 0.85, R = 140;
    const tg = new THREE.PlaneGeometry(half * 2, half * 2, R, R); tg.rotateX(-Math.PI / 2);
    const pos = tg.attributes.position, sub = pts.filter((_, i) => i % 4 === 0);
    const colors = new Float32Array(pos.count * 3);
    const low = new THREE.Color(), high = new THREE.Color();
    const maxY = Y(plan.high) || 1;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      let wsum = 0, hsum = 0, dmin = 1e9;
      for (const p of sub) { const dd = (p.x - x) ** 2 + (p.z - z) ** 2; dmin = Math.min(dmin, dd); const w = 1 / (dd + 0.02); wsum += w; hsum += w * p.y; }
      const dist = Math.sqrt(dmin);
      const tex = 0.05 * Math.sin(x * 1.7 + Math.sin(z * 0.9)) * Math.cos(z * 1.3) + 0.03 * Math.sin(x * 4.1 + z * 3.3);
      const h = hsum / wsum - 0.025 - Math.min(0.35, dist * 0.06) + tex * Math.min(1, dist * 1.5);
      pos.setY(i, h);
      colors[i * 3] = Math.min(1, Math.max(0, (h + 0.3) / (maxY + 0.6)));   // height, mixed into the colour below
    }
    tg.computeVertexNormals();
    const groundMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
    const shade = colors.slice();
    const paint = dusk => {
      low.set(dusk ? '#4a3434' : '#a8603e'); high.set(dusk ? '#7a5a52' : '#d9a57c');
      for (let i = 0; i < pos.count; i++) { const u = shade[i * 3]; const c = low.clone().lerp(high, u); colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b; }
      tg.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    };
    const ground = new THREE.Mesh(tg, groundMat); group.add(ground);

    // road: a flat ribbon on the route, and a second, brighter one that grows behind the runner
    const W = 0.07;
    const ribbon = () => {
      const g = new THREE.BufferGeometry(), v = new Float32Array(N * 2 * 3), idx = [];
      for (let i = 0; i < N; i++) {
        const t = T(plan.d[i]), nx = -t.z * W, nz = t.x * W, p = pts[i];
        v.set([p.x + nx, p.y + 0.012, p.z + nz, p.x - nx, p.y + 0.012, p.z - nz], i * 6);
        if (i < N - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
      }
      g.setAttribute('position', new THREE.BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
      return g;
    };
    const road = new THREE.Mesh(ribbon(), new THREE.MeshStandardMaterial({ color: '#efe6da', roughness: 0.8, side: THREE.DoubleSide }));
    const doneGeo = ribbon(); doneGeo.translate(0, 0.004, 0);
    const done = new THREE.Mesh(doneGeo, new THREE.MeshBasicMaterial({ color: '#ff6a3d', side: THREE.DoubleSide }));
    group.add(road, done);

    // a post every kilometre (taller every 5), and banners at the start and finish
    const postMat = new THREE.MeshStandardMaterial({ color: '#f4efe6', roughness: 0.6 });
    for (let km = 1; km < course.km; km++) {
      const p = P(km), tall = km % 5 === 0, hgt = tall ? 0.32 : 0.16;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, hgt, 6), postMat);
      const t = T(km); post.position.set(p.x - t.z * W * 1.6, Y(plan.e[Math.round(km / 0.05)] ?? plan.e[0]) + hgt / 2, p.z + t.x * W * 1.6);
      group.add(post);
    }
    const arch = (km, color) => {
      const p = P(km), t = T(km), y = Y(plan.e[Math.min(N - 1, Math.round(km / 0.05))]);
      const a = new THREE.Group();
      const legs = new THREE.CylinderGeometry(0.014, 0.014, 0.34, 8), m = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
      for (const sgn of [1, -1]) { const l = new THREE.Mesh(legs, m); l.position.set(sgn * W * 2.2, 0.17, 0); a.add(l); }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(W * 4.6, 0.06, 0.012), m); bar.position.y = 0.33; a.add(bar);
      a.position.set(p.x, y, p.z); a.rotation.y = Math.atan2(t.x, t.z);
      group.add(a);
    };
    arch(0, '#137872'); arch(course.km, '#ff6a3d');

    // the runner: a bright marker with a soft halo and a thin line down to the road
    const marker = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), new THREE.MeshBasicMaterial({ color: '#ff6a3d' }));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), new THREE.MeshBasicMaterial({ color: '#ff6a3d', transparent: true, opacity: 0.22, depthWrite: false }));
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), new THREE.MeshBasicMaterial({ color: '#ff6a3d' }));
    core.position.y = 0.2; halo.position.y = 0.2; stem.position.y = 0.09;
    marker.add(core, halo, stem); group.add(marker);

    overview = { target: [0, Y((plan.high + plan.low) / 2) * 0.5, 0], az: 0.55, el: 0.66, dist: SIZE * 1.3 };
    G = { group, P, T, Y, pts, done, doneGeo, marker, halo, paint, N };
    paint(isDusk());
  }

  // ---- the chart: elevation (area) and the plan's pace for each stretch (line), with the runner's position
  const cv = out('chart'), cx = cv.getContext('2d');
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function drawChart() {
    if (!plan) return;
    const c = COURSES[st.ci];
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (!w) return;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, w, h);
    const padL = 40, padR = 44, padT = 10, padB = 22;
    const X = km => padL + km / c.km * (w - padL - padR);
    const lo = Math.floor(plan.low / 10) * 10 - 10, hi = Math.ceil(plan.high / 10) * 10 + 10;
    const Ye = m => padT + (1 - (m - lo) / (hi - lo)) * (h - padT - padB);
    const paces = plan.seg.map(s => s.pace), pMin = Math.min(...paces) - 10, pMax = Math.max(...paces) + 10;
    const Yp = p => padT + (p - pMin) / (pMax - pMin) * (h - padT - padB);   // faster pace higher
    const ink = css('--ink'), ink2 = css('--ink-2'), line = css('--line'), accent = '#ff6a3d';
    cx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
    // grid and axes
    cx.strokeStyle = line; cx.lineWidth = 1; cx.fillStyle = ink2; cx.textAlign = 'center'; cx.textBaseline = 'top';
    const stepKm = c.km > 30 ? 5 : c.km > 15 ? 2 : 1;
    for (let k = 0; k <= c.km + 1e-6; k += stepKm) { cx.beginPath(); cx.moveTo(X(k), padT); cx.lineTo(X(k), h - padB); cx.stroke(); cx.fillText(`${k}`, X(k), h - padB + 6); }
    cx.textAlign = 'right'; cx.textBaseline = 'middle';
    cx.fillText(`${hi} m`, padL - 6, Ye(hi)); cx.fillText(`${lo} m`, padL - 6, Ye(lo));
    // elevation area
    cx.beginPath(); cx.moveTo(X(0), Ye(lo));
    plan.d.forEach((km, i) => cx.lineTo(X(km), Ye(plan.e[i])));
    cx.lineTo(X(c.km), Ye(lo)); cx.closePath();
    cx.fillStyle = 'rgba(201, 141, 99, 0.35)'; cx.fill();
    cx.beginPath(); plan.d.forEach((km, i) => (i ? cx.lineTo(X(km), Ye(plan.e[i])) : cx.moveTo(X(km), Ye(plan.e[i])))); cx.strokeStyle = 'rgba(201, 141, 99, 0.95)'; cx.lineWidth = 1.5; cx.stroke();
    // pace line, with the even pace dashed
    // (each 50 m stretch has its own pace; drawn through the middle of each stretch so it reads as one smooth line)
    const n = plan.seg.length;
    cx.beginPath(); cx.moveTo(X(0), Yp(plan.seg[0].pace));
    plan.seg.forEach((s, i) => cx.lineTo(X((plan.d[i] + plan.d[i + 1]) / 2), Yp(s.pace)));
    cx.lineTo(X(c.km), Yp(plan.seg[n - 1].pace));
    cx.strokeStyle = ink; cx.lineWidth = 1.8; cx.lineJoin = 'round'; cx.stroke();
    cx.setLineDash([4, 4]); cx.strokeStyle = ink2; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(padL, Yp(plan.evenPace)); cx.lineTo(w - padR, Yp(plan.evenPace)); cx.stroke(); cx.setLineDash([]);
    cx.textAlign = 'left'; cx.fillStyle = ink2;
    cx.fillText(`${fmtPace(pMin + 10)}`, w - padR + 6, Yp(pMin + 10)); cx.fillText(`${fmtPace(pMax - 10)}`, w - padR + 6, Yp(pMax - 10));
    // the runner
    cx.strokeStyle = accent; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(X(st.km), padT); cx.lineTo(X(st.km), h - padB); cx.stroke();
    cx.fillStyle = accent; cx.beginPath(); cx.arc(X(st.km), Ye(plan.at(plan.e, st.km)), 4, 0, Math.PI * 2); cx.fill();
  }
  // click or drag on the chart to move the runner
  let dragging = false;
  const seek = e => { const r = cv.getBoundingClientRect(), c = COURSES[st.ci]; const u = (e.clientX - r.left - 40) / (r.width - 84); st.km = Math.min(c.km, Math.max(0, u * c.km)); setPlaying(false); show(); };
  cv.addEventListener('pointerdown', e => { dragging = true; cv.setPointerCapture(e.pointerId); seek(e); });
  cv.addEventListener('pointermove', e => { if (dragging) seek(e); });
  cv.addEventListener('pointerup', () => { dragging = false; });
  new ResizeObserver(drawChart).observe(cv);

  // ---- numbers, splits and the HUD
  function rebuild(newCourse) {
    const c = COURSES[st.ci];
    plan = buildPlan(c, st.time);
    out('blurb').textContent = c.blurb;
    out('time').textContent = fmtClock(st.time);
    const rows = [
      ['Distance', c.km.toFixed(c.km % 1 ? 1 : 0), 'km'],
      ['Total climb', Math.round(plan.climb), 'm'],
      ['Highest point', Math.round(plan.high), 'm'],
      ['Even pace', fmtPace(plan.evenPace), '/km'],
      ['Slowest planned km', fmtPace(plan.slowest.pace), `km ${Math.ceil(plan.slowest.k)}`],
      ['Fastest planned km', fmtPace(plan.fastest.pace), `km ${Math.ceil(plan.fastest.k)}`],
    ];
    out('readouts').innerHTML = rows.map(([k, v, u]) => `<div><dt>${k}</dt><dd><span class="num">${v}</span> <span class="u">${u}</span></dd></div>`).join('');
    out('splits').innerHTML = plan.splits.map(s => `<tr><td>${s.len < 0.999 ? `${(s.k).toFixed(1)}` : Math.round(s.k)}</td><td>${s.up >= 0.5 ? `+${Math.round(s.up)}` : ''}${s.up >= 0.5 && s.down >= 0.5 ? ' / ' : ''}${s.down >= 0.5 ? `−${Math.round(s.down)}` : ''}${s.up < 0.5 && s.down < 0.5 ? '0' : ''} m</td><td>${fmtPace(s.pace)}</td><td>${fmtClock(s.clock)}</td></tr>`).join('');
    if (S && (newCourse || !G)) buildScene(c);
    show();
    if (S && newCourse) { setFollow(true); placeCamera(true); }
  }

  function show() {
    const c = COURSES[st.ci];
    const i = segIndex(plan, st.km), s = plan.seg[i];
    const g = Math.round(s.g * 1000) / 10;
    out('km').textContent = `km ${st.km.toFixed(1)}`;
    out('pace').innerHTML = `${fmtPace(s.pace)}<small> /km</small>`;
    out('grade').textContent = `${g > 0.2 ? `+${g.toFixed(1)}% uphill` : g < -0.2 ? `${g.toFixed(1)}% downhill` : 'Flat'} · ${Math.round(plan.at(plan.e, st.km))} m`;
    out('clock').textContent = `${fmtClock(plan.at(plan.t, st.km))} on the clock`;
    scrub.value = String(Math.round(st.km / c.km * 1000));
    out('where').textContent = `${st.km.toFixed(1)} of ${c.km.toFixed(c.km % 1 ? 1 : 0)} km`;
    drawChart();
    if (G) {
      const p = G.P(st.km); p.y = G.Y(plan.at(plan.e, st.km));
      G.marker.position.copy(p);
      G.doneGeo.setDrawRange(0, Math.max(0, Math.floor(st.km / 0.05)) * 6);
    }
  }

  const tmpP = S ? new S.THREE.Vector3() : null, tmpT = S ? new S.THREE.Vector3() : null;
  function placeCamera(instant) {
    if (!G || !st.follow) return;
    const p = G.marker.position, t = G.T(Math.min(COURSES[st.ci].km - 0.05, st.km + 0.15));
    tmpP.set(p.x - t.x * 1.9, p.y + 1.05, p.z - t.z * 1.9);
    tmpT.set(p.x + t.x * 0.8, p.y + 0.1, p.z + t.z * 0.8);
    if (instant) { S.camera.position.copy(tmpP); S.controls.target.copy(tmpT); }
    else { S.camera.position.lerp(tmpP, 0.06); S.controls.target.lerp(tmpT, 0.12); }
  }

  if (S) {
    let tt = 0;
    S.setDriver(dt => {
      tt += dt;
      const c = COURSES[st.ci];
      if (st.playing) {
        st.km = Math.min(c.km, st.km + dt * c.km / FLY);
        if (st.km >= c.km) setPlaying(false);
        show();
      }
      if (G) G.halo.scale.setScalar(reduceMotion() ? 1 : 1 + 0.25 * Math.sin(tt * 4));
      placeCamera(false);
    });
  }

  rebuild(true);
  setPlaying(false);
}
