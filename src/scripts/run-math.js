// Arithmetic shared by the calculators: times, paces and distances. Plain functions, no DOM.

export const KM_PER_MI = 1.609344;

export const RACES = [
  { id: '5k', label: '5K', km: 5 },
  { id: '10k', label: '10K', km: 10 },
  { id: 'half', label: 'Half marathon', km: 21.0975 },
  { id: 'marathon', label: 'Marathon', km: 42.195 },
];

/** "1:05:30", "25:00", "25" (minutes) or "25:00.5" → seconds; NaN when it can't be read. */
export function parseClock(str) {
  const s = String(str ?? '').trim().replace(/[^\d:.]/g, '');
  if (!s) return NaN;
  const parts = s.split(':').map(Number);
  if (parts.some(p => !Number.isFinite(p) || p < 0)) return NaN;
  if (parts.length === 1) return parts[0] * 60;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return NaN;
}

/** Seconds → "h:mm:ss" (or "m:ss" under an hour). */
export function fmtClock(sec, { tenths = false } = {}) {
  if (!Number.isFinite(sec) || sec < 0) return '–';
  const r = tenths ? Math.round(sec * 10) / 10 : Math.round(sec);
  const h = Math.floor(r / 3600), m = Math.floor((r % 3600) / 60), s = r % 60;
  const ss = tenths ? s.toFixed(1).padStart(4, '0') : String(Math.floor(s)).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Seconds per km or mile → "m:ss". */
export const fmtPace = sec => fmtClock(sec);

/** km/h from seconds per km. */
export const kmh = secPerKm => 3600 / secPerKm;

export const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
