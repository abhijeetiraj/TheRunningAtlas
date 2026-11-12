// Small client helpers shared by the lab scripts.

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const ICON = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4.5" width="4.2" height="15" fill="currentColor"/><rect x="13.8" y="4.5" width="4.2" height="15" fill="currentColor"/></svg>',
};

/** Mark one button in a segmented group as pressed. */
export function segPress(b) {
  $$('button', b.parentElement).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
}

/** Show the text-only fallback inside a stage when WebGL is missing. */
export function noGL(el) {
  el.classList.add('is-nogl');
  el.insertAdjacentHTML('beforeend', '<div class="nogl"><p><strong>3D is not available in this browser.</strong> Everything the lab shows is also explained in the text below.</p></div>');
}

export const MUSCLE_LABEL = { hamstrings: 'Hamstrings', quads: 'Quads', hipflexors: 'Hip flexors', glutes: 'Glutes', adductors: 'Inner thigh', abductors: 'Outer hip', rotators: 'Deep hip rotators', calves: 'Calf', achilles: 'Achilles tendon' };

/** Screen position of a lit muscle, or null when it is off or behind the camera. */
export function musclePos(S, key, side) {
  const m = S.fig.muscle(key, side);
  if (!m || m.level < 0.05) return null;
  const p = S.project(m.mid);
  return p.behind ? null : p;
}

/** Labels with leader lines that follow muscles on the 3D figure. */
export function makeCallouts(layer) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'callout-lines'); svg.setAttribute('aria-hidden', 'true');
  layer.appendChild(svg);
  const pool = new Map();
  return {
    set(items) { // items: [{ key, text, mode, pos: { x, y }, side: +1 | -1 }]
      const keep = new Set(items.map(i => i.key));
      for (const [k, o] of pool) if (!keep.has(k)) { o.el.remove(); o.line.remove(); pool.delete(k); }
      const placed = [];
      const W = layer.clientWidth;
      items.sort((a, b) => a.pos.y - b.pos.y);
      for (const it of items) {
        let o = pool.get(it.key);
        if (!o) {
          const el = document.createElement('div'); el.className = 'callout'; layer.appendChild(el);
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); svg.appendChild(line);
          o = { el, line }; pool.set(it.key, o);
        }
        o.el.dataset.mode = it.mode; o.line.setAttribute('class', 'cl-' + it.mode);
        if (o.el.textContent !== it.text) o.el.textContent = it.text;
        const dx = it.side * Math.min(110, W * 0.16);
        const x = it.pos.x + dx; let y = it.pos.y - 26;
        for (const p of placed) if (Math.abs(p.y - y) < 30 && Math.abs(p.x - x) < 150) y = p.y + 32;
        placed.push({ x, y });
        const w = o.el.offsetWidth || 90;
        let left = it.side > 0 ? x : x - w;
        left = Math.max(6, Math.min(W - w - 6, left));
        o.el.style.transform = `translate(${left}px, ${y - 12}px)`;
        o.line.setAttribute('x1', it.pos.x); o.line.setAttribute('y1', it.pos.y);
        o.line.setAttribute('x2', it.side > 0 ? left : left + w); o.line.setAttribute('y2', y);
      }
    },
    clear() { this.set([]); },
  };
}

/** Briefly highlight an element (used when jumping to a row or card). */
export function flash(el) {
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}

/** Highlight the ledger row or section a hash link points to, after the browser scrolls to it. */
export function flashOnHash() {
  const run = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id && document.getElementById(id);
    if (el && (el.matches('tr') || el.matches('.sec-plate'))) flash(el);
  };
  window.addEventListener('hashchange', run);
}
