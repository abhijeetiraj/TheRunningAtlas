// Warm-up studio: pick one of nine moves, or play the routine, and watch it in 3D with the muscles it moves lit.
import { createStage } from '../lib/3d/stage.js';
import * as MV from '../lib/3d/motion.js';
import { MOVES } from '../data/warmup-moves.js';
import { $, $$, ICON, noGL, makeCallouts, musclePos, flashOnHash } from './ui.js';

const PI = Math.PI;
const CAM = {
  jog: { az: -0.7, el: 0.1, dist: 4.4 }, swingfb: { az: PI / 2 + 0.45, el: 0.08, dist: 4.4 }, swingside: { az: PI - 0.5, el: 0.1, dist: 4.4 },
  lunge: { az: PI / 2 + 0.55, el: 0.1, dist: 4.6, target: [0, 0.7, 0.15] }, knees: { az: PI / 2 + 0.35, el: 0.08, dist: 4.4 }, kicks: { az: PI / 2 + 0.35, el: 0.08, dist: 4.4 },
  calves: { az: PI / 2 - 0.25, el: 0.06, dist: 4.2, target: [0, 0.6, 0.05] }, gate: { az: 0.55, el: 0.12, dist: 4.4 }, strides: { az: -PI / 2 + 0.25, el: 0.08, dist: 4.6 },
};
const LBL = {
  swingfb: [['hamstrings', 1, 'Hamstrings'], ['hipflexors', 1, 'Hip flexors']],
  swingside: [['adductors', 1, 'Inner thigh'], ['abductors', 1, 'Outer hip']],
  knees: [['hipflexors', 1, 'Hip flexors'], ['glutes', 1, 'Glutes']],
  kicks: [['hamstrings', 1, 'Hamstrings'], ['quads', 1, 'Quads']],
  calves: [['calves', 1, 'Calf'], ['achilles', 1, 'Achilles tendon']],
  gate: [['rotators', 1, 'Deep hip rotators'], ['adductors', 1, 'Groin']],
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function initWarmup() {
  flashOnHash();
  let idx = 1, t = 0, routine = false, sinceSwitch = 0;
  let S = null;
  try { S = createStage(); } catch (e) { console.warn('3D unavailable', e); }

  const card = $('#moveCard');
  const showCard = () => {
    const m = MOVES[idx];
    card.innerHTML = `<div class="mc-head"><span class="mc-no">${idx + 1}/${MOVES.length}</span><h2 class="mc-name">${esc(m.name)}</h2><span class="mc-dose">${esc(m.dose)}</span></div>
      <dl class="mc-grid"><div><dt>How</dt><dd>${esc(m.how)}</dd></div><div><dt>What it moves</dt><dd>${esc(m.moves)}</dd></div><div><dt>Why it helps</dt><dd>${esc(m.why)}</dd></div></dl>`;
  };
  function select(i, instant = false) {
    idx = i; t = 0; sinceSwitch = 0;
    $$('[data-move]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.move === i)));
    showCard();
    if (S) S.camTo({ target: [0, 0.85, 0], ...CAM[MOVES[i].id] }, instant);
  }
  const rBtn = $('#routine');
  function setRoutine(on) { routine = on; rBtn.innerHTML = `${on ? ICON.pause : ICON.play}<span>${on ? 'Pause the routine' : 'Play the routine'}</span>`; }
  $$('[data-move]').forEach(b => b.addEventListener('click', () => { setRoutine(false); select(+b.dataset.move); }));
  rBtn.addEventListener('click', () => { const on = !routine; setRoutine(on); if (on) select(0); });

  const stageEl = $('#stage');
  if (!S) { noGL(stageEl); rBtn.hidden = true; return; }
  S.attach(stageEl);
  select(1, true);
  const callouts = makeCallouts($('#callouts'));
  const md0 = {};
  S.setDriver(dt => {
    t += dt; sinceSwitch += dt;
    if (routine && sinceSwitch > 9) select((idx + 1) % MOVES.length);
    const id = MOVES[idx].id;
    let r;
    switch (id) {
      case 'jog': r = MV.drill(t, { kind: 'jog' }); r.lv = {}; break;
      case 'swingfb': r = MV.swingFB(t, { start: 0.3 }); break;
      case 'swingside': r = MV.swingSide(t, { start: 0.3 }); break;
      case 'lunge': r = MV.lunge(t); break;
      case 'knees': r = MV.drill(t, { kind: 'knees', amp: Math.min(1, 0.45 + t / 2) }); r.lv = { hipflexorsL: 1, hipflexorsR: 1, glutesL: 1, glutesR: 1 }; r.md = { hipflexorsL: 'work', hipflexorsR: 'work' }; break;
      case 'kicks': r = MV.drill(t, { kind: 'kicks', amp: Math.min(1, 0.5 + t / 2) }); r.lv = { hamstringsL: 1, hamstringsR: 1, quadsL: 1, quadsR: 1 }; r.md = { hamstringsL: 'work', hamstringsR: 'work' }; break;
      case 'calves': r = MV.calves(t % 11.8, { raises: 2 }); break;
      case 'gate': r = MV.gate(t % 16.8, { closeAfter: 3 }); break;
      case 'strides': r = MV.drill(t, { kind: 'stride', v: 3.6 }); r.lv = {}; break;
    }
    S.fig.apply(r.pose);
    const fade = Math.min(1, t / 0.6), lv = {};
    for (const k in r.lv) lv[k] = r.lv[k] * fade;
    S.fig.updateMuscles(lv, r.md || md0);
    S.fig.skin.emissive.set('#ff7a3c');
    S.fig.skin.emissiveIntensity = id === 'jog' ? 0.14 * Math.min(1, Math.max(0, (t - 1) / 3)) : 0;
    S.post.visible = id === 'swingfb' || id === 'swingside';
    if (id === 'swingfb') S.post.position.set(-0.52, 0, 0.02); else if (id === 'swingside') S.post.position.set(-0.02, 0, 0.5);
    S.lane.visible = id === 'strides';
    S.scrollLane(id === 'strides' ? t * 3.6 : 0);
    let defs = LBL[id] || [];
    if (id === 'lunge') { const lead = r.side > 0 ? 1 : -1; defs = [['hipflexors', -lead, 'Hip flexors (back leg)'], ['glutes', lead, 'Glutes'], ['quads', lead, 'Quads']]; }
    const items = [];
    for (const [k, side, text] of defs) {
      const p = musclePos(S, k, side); if (!p) continue;
      const mode = k === 'achilles' ? 'spring' : ((r.md || {})[k + (side > 0 ? 'L' : 'R')] || 'stretch');
      items.push({ key: k + side, text, mode, pos: p, side: p.x > S.size().W / 2 ? 1 : -1 });
    }
    callouts.set(t > 0.4 ? items : []);
  });
}
