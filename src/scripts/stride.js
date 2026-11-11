// The stride lab: play or scrub one stride, change speed, foot strike and view, and read the numbers and the force chart.
import { createStage } from '../lib/3d/stage.js';
import * as G from '../lib/3d/gait.js';
import { $, $$, ICON, reduceMotion, segPress, noGL, makeCallouts, musclePos, MUSCLE_LABEL, flashOnHash } from './ui.js';

const PI = Math.PI;
const MOMENT_NAME = { landing: 'Landing', loading: 'Loading', midstance: 'Midstance', pushoff: 'Push-off', float: 'Float', swing: 'Swing' };
const VIEWS = {
  side: { az: -PI / 2, el: 0.12, dist: 4.1, target: [0, 0.78, -0.05] },
  front: { az: 0, el: 0.08, dist: 4.8, target: [0, 0.82, 0] },
  back: { az: PI, el: 0.12, dist: 4.8, target: [0, 0.82, 0] },
  angle: { az: -0.85, el: 0.22, dist: 4.6, target: [0, 0.8, 0] },
};

export function initStride() {
  flashOnHash();
  const st = { phi: 0.08, v: 3.3, strike: 'heel', playing: !reduceMotion(), rate: 0.25, dist: 0, muscles: true, force: true, path: false };
  let P = G.gaitParams(st.v);

  let S = null;
  try { S = createStage(); } catch (e) { console.warn('3D unavailable', e); }

  // ---- controls
  const playBtn = $('#play'), scrub = $('#scrub'), speed = $('#speed');
  const setPlaying = on => { st.playing = on; playBtn.innerHTML = on ? ICON.pause : ICON.play; playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play'); };
  setPlaying(st.playing);
  playBtn.addEventListener('click', () => setPlaying(!st.playing));
  $$('[data-rate]').forEach(b => b.addEventListener('click', () => { st.rate = +b.dataset.rate; segPress(b); if (!st.playing) setPlaying(true); }));
  scrub.addEventListener('input', () => { setPlaying(false); st.phi = scrub.value / 1000; });
  speed.value = st.v;
  speed.addEventListener('input', () => { st.v = +speed.value; P = G.gaitParams(st.v); paramsChanged(); });
  $$('[data-strike]').forEach(b => b.addEventListener('click', () => { st.strike = b.dataset.strike; segPress(b); paramsChanged(); }));
  $$('[data-view]').forEach(b => b.addEventListener('click', () => { segPress(b); if (S) S.camTo(VIEWS[b.dataset.view]); }));
  $('#tMuscles').addEventListener('change', e => { st.muscles = e.target.checked; });
  $('#tForce').addEventListener('change', e => { st.force = e.target.checked; });
  $('#tPath').addEventListener('change', e => { st.path = e.target.checked; if (S) S.showPath(st.path); });
  $$('[data-go-moment]').forEach(b => b.addEventListener('click', () => {
    setPlaying(false); st.phi = G.momentPhi(b.dataset.goMoment, P);
    if (!S) updateMoment();
    $('#lab').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  }));

  // ---- readouts, phase strip, worked example
  function paramsChanged() {
    const pk = G.peakForce(P, st.strike), ip = G.impactPeak(P, st.strike);
    const pace = G.fmtPace(1000 / P.v);
    $('#speedOut').textContent = `${pace} /km · ${G.fmtPace(1609.344 / P.v)} /mi`;
    $('#hudPace').textContent = `${pace} /km · ${Math.round(P.cad)} steps/min`;
    const rows = [
      ['Pace', pace, '/km'], ['Speed', (P.v * 3.6).toFixed(1), 'km/h'],
      ['Cadence', Math.round(P.cad), 'steps/min'], ['Step length', P.stepLen.toFixed(2), 'm'],
      ['Ground contact', Math.round(P.tc * 1000), 'ms'], ['Float', Math.round(P.flight * 1000), 'ms'],
      ['Peak force', pk.toFixed(1), '× body weight'], ['Bounce', (P.osc * 100).toFixed(1), 'cm'],
    ];
    $('#readouts').innerHTML = rows.map(([k, v, u]) => `<div><dt>${k}</dt><dd><span class="num">${v}</span> <span class="u">${u}</span></dd></div>`).join('');
    const d = P.duty;
    const seg = (a, b, cls, txt, short) => `<span class="sg ${cls}" style="left:${a * 100}%;width:${(b - a) * 100}%"><span class="sg-long">${txt}</span><span class="sg-short">${short}</span></span>`;
    $('#strip').innerHTML = seg(0, d, 'sg-r', 'Right foot down', 'Right') + seg(d, 0.5, 'sg-f', 'Float', '') + seg(0.5, 0.5 + d, 'sg-l', 'Left foot down', 'Left') + seg(0.5 + d, 1, 'sg-f', 'Float', '');
    $('#calc').innerHTML = `At the lab’s current speed, a step time of <span class="num">${Math.round(P.Tstep * 1000)} ms</span> and a contact of <span class="num">${Math.round(P.tc * 1000)} ms</span> give a smooth-curve peak of about <span class="num">${(PI / 2 * (P.Tstep / P.tc)).toFixed(1)}</span> body weights.${ip ? ` The lab’s heel-landing curve puts part of that push into an impact peak of about <span class="num">${ip.f.toFixed(1)}</span>, so its highest point is <span class="num">${pk.toFixed(1)}</span>.` : ''}`;
    buildPath();
    drawChart();
  }

  // ---- foot path (right ankle, traced over one stride)
  function buildPath() {
    if (!S) return;
    const pts = [], v = new S.THREE.Vector3();
    for (let i = 0; i < 90; i++) {
      const r = G.runPose(i / 90, P, st.strike); S.fig.apply(r.pose);
      S.fig.bones['foot-1'].getWorldPosition(v); pts.push(v.clone());
    }
    S.setPath(pts); S.showPath(st.path);
  }

  // ---- force chart
  const cv = $('#chart'), cx = cv.getContext('2d');
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function drawChart() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w) return;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, w, h);
    const padL = 30, padR = 8, padT = 10, padB = 22, ymax = 3.2;
    const X = f => padL + f * (w - padL - padR), Y = f => padT + (1 - f / ymax) * (h - padT - padB);
    const ink2 = css('--ink-2'), line = css('--line'), force = css('--force'), tint = css('--float-tint');
    const d = P.duty;
    cx.fillStyle = tint; cx.fillRect(X(d), padT, X(0.5) - X(d), h - padT - padB); cx.fillRect(X(0.5 + d), padT, X(1) - X(0.5 + d), h - padT - padB);
    cx.font = '11px "DM Mono", ui-monospace, monospace'; cx.fillStyle = ink2; cx.textAlign = 'right'; cx.textBaseline = 'middle';
    for (let k = 0; k <= 3; k++) { cx.fillText(k, padL - 8, Y(k)); cx.strokeStyle = line; cx.beginPath(); cx.moveTo(padL, Y(k)); cx.lineTo(w - padR, Y(k)); cx.stroke(); }
    cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    for (const f of [0, 0.5, 1]) cx.fillText(`${f * 100}%`, Math.min(w - 18, Math.max(padL + 10, X(f))), h - 6);
    cx.setLineDash([4, 4]); cx.strokeStyle = ink2; cx.beginPath(); cx.moveTo(padL, Y(1)); cx.lineTo(w - padR, Y(1)); cx.stroke(); cx.setLineDash([]);
    const curve = (off, alpha, fill) => {
      cx.beginPath(); cx.moveTo(X(off), Y(0));
      for (let i = 0; i <= 80; i++) { const q = i / 80; cx.lineTo(X(off + q * d), Y(G.grf(q, P, st.strike).fv)); }
      cx.lineTo(X(off + d), Y(0));
      if (fill) { cx.globalAlpha = 0.16 * alpha; cx.fillStyle = force; cx.fill(); }
      cx.globalAlpha = alpha; cx.strokeStyle = force; cx.lineWidth = 2; cx.stroke(); cx.globalAlpha = 1; cx.lineWidth = 1;
    };
    curve(0, 1, true); cx.setLineDash([5, 3]); curve(0.5, 0.75, false); cx.setLineDash([]);
    const ip = G.impactPeak(P, st.strike);
    if (ip) {
      const px = X(ip.q * d), py = Y(ip.f);
      cx.strokeStyle = ink2; cx.beginPath(); cx.moveTo(px, py - 4); cx.lineTo(px, padT + 6); cx.lineTo(px + 8, padT + 6); cx.stroke();
      cx.fillStyle = ink2; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillText('impact peak', px + 12, padT + 6); cx.textBaseline = 'alphabetic';
    }
    const fz = G.forcesAt(st.phi, P, st.strike)[-1];
    cx.strokeStyle = css('--ink'); cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(X(st.phi), padT); cx.lineTo(X(st.phi), h - padB); cx.stroke(); cx.lineWidth = 1;
    if (fz) { cx.fillStyle = force; cx.beginPath(); cx.arc(X(st.phi), Y(fz.fv), 4.5, 0, 2 * PI); cx.fill(); }
  }
  new ResizeObserver(() => drawChart()).observe(cv);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => drawChart());
  new MutationObserver(drawChart).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---- tools
  const taps = [];
  $('#tap').addEventListener('click', () => {
    const now = performance.now(); if (taps.length && now - taps.at(-1) > 2500) taps.length = 0;
    taps.push(now); if (taps.length > 12) taps.shift();
    if (taps.length >= 4) { const span = (taps.at(-1) - taps[0]) / (taps.length - 1); $('#tapOut').textContent = Math.round(60000 / span); }
    else $('#tapOut').textContent = `${4 - taps.length} more`;
  });
  $('#tapReset').addEventListener('click', () => { taps.length = 0; $('#tapOut').textContent = '–'; });
  const slCalc = () => {
    const secs = (+$('#pm').value || 0) * 60 + (+$('#ps').value || 0), cad = +$('#cad').value || 0;
    if (secs < 120 || cad < 100) { $('#slOut').textContent = 'Enter a pace and a cadence to see your step length.'; return; }
    const v = 1000 / secs, step = v / (cad / 60);
    $('#slOut').innerHTML = `Step length <span class="num">${step.toFixed(2)} m</span>, one full stride (two steps) <span class="num">${(2 * step).toFixed(2)} m</span>, at <span class="num">${(v * 3.6).toFixed(1)} km/h</span>.`;
  };
  ['#pm', '#ps', '#cad'].forEach(s => $(s).addEventListener('input', slCalc)); slCalc();

  // ---- moment label
  let lastMoment = '';
  function updateMoment() {
    const m = G.momentAt(st.phi, P);
    if (m === lastMoment) return;
    lastMoment = m;
    $('#moment').textContent = MOMENT_NAME[m];
    $('#momentSub').textContent = m === 'float' ? 'Both feet off the ground' : m === 'swing' ? 'Left foot on the ground' : 'Right foot on the ground';
    $$('.moment').forEach(el => el.classList.toggle('is-now', el.dataset.moment === m));
  }

  // ---- 3D
  const stageEl = $('#stage');
  if (!S) { noGL(stageEl); paramsChanged(); updateMoment(); return; }
  S.attach(stageEl);
  paramsChanged();
  S.camTo(VIEWS.side, true);
  const callouts = makeCallouts($('#callouts'));
  let frameCount = 0;
  S.setDriver(dt => {
    if (st.playing) { st.phi = (st.phi + dt * st.rate / P.Tstride) % 1; st.dist += P.v * dt * st.rate; }
    const r = G.runPose(st.phi, P, st.strike);
    S.fig.apply(r.pose);
    const m = G.muscleLevels(st.phi, P);
    S.fig.updateMuscles(st.muscles ? m.lv : {}, m.md);
    S.scrollLane(st.dist);
    // force arrow at the centre of pressure of the foot on the ground
    const F = G.forcesAt(st.phi, P, st.strike);
    const side = F[-1] ? -1 : F[1] ? 1 : 0;
    if (st.force && side) S.setForce({ x: side * 0.104, z: G.copZ(r.legs[side], st.strike) }, F[side].fv, F[side].fh, 0.22);
    else S.hideForce();
    scrub.value = Math.round(st.phi * 1000);
    updateMoment();
    // labels for the right leg's busiest muscles, when slow enough to read
    if (st.muscles && (!st.playing || st.rate <= 0.25)) {
      const items = [];
      const ranked = ['achilles', 'calves', 'quads', 'glutes', 'hamstrings', 'hipflexors']
        .map(k => ({ k, lv: m.lv[k + 'R'] || 0 })).filter(o => o.lv > 0.5).sort((a, b) => b.lv - a.lv).slice(0, 3);
      for (const o of ranked) {
        const p = musclePos(S, o.k, -1);
        if (p) items.push({ key: o.k, text: MUSCLE_LABEL[o.k], mode: o.k === 'achilles' ? 'spring' : 'work', pos: p, side: (o.k === 'quads' || o.k === 'hipflexors') ? 1 : -1 });
      }
      callouts.set(items);
    } else callouts.clear();
    if ((frameCount++ & 1) === 0) drawChart();
  });
}
