// Day / Dusk, shared with Jezero Base. Until the reader picks one, the sky is as it is at Jezero right now ("Now"):
// Day while the Sun is up there. A pick is remembered under the same key as the base, so it carries across the site.
// Base.astro sets the same before the first paint. Pages listen for the `jezero-sky` event to recolour 3D and charts.
import { marsSun } from '../lib/mars.js';
import { JEZERO } from '../data/site.js';

const KEY = 'jezero-sky';
const read = () => { try { const v = localStorage.getItem(KEY); return v === 'day' || v === 'dusk' ? v : null; } catch (e) { return null; } };
const write = v => { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) { /* private mode */ } };

let pick = read();
export const isDusk = () => (pick ? pick === 'dusk' : marsSun(Date.now(), JEZERO.lat, JEZERO.lon) <= 0);

export function initSky() {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('.sky button[data-sky]')];
  let last = null;
  function apply() {
    const dusk = isDusk();
    root.dataset.sky = dusk ? 'dusk' : 'day';
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.sky === (pick ?? 'now')));
    if (dusk !== last) { last = dusk; window.dispatchEvent(new CustomEvent('jezero-sky', { detail: { dusk } })); }
  }
  for (const b of buttons) b.addEventListener('click', () => {
    const v = b.dataset.sky;
    pick = v === 'day' || v === 'dusk' ? v : null;
    write(pick); apply();
  });
  setInterval(() => !pick && apply(), 60000);
  apply();
}
