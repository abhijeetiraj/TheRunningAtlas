// The plan builder's rule of thumb (claim P6, a model). Plain functions, no DOM.
// Weekly distance rises by at most about 10% a week from what you run now, and every fourth week is easier. The long
// run grows by about a kilometre or 10% a week, up to a cap by race distance and to no more than about half the week.
// The taper is the last week or two: about 30% then 50% below the biggest week, or 40% for a one-week taper (claim T4).
// Typical plan lengths and long runs come from the coaching ranges on the plans page (claim T8). Weekly caps only stop
// the rule growing without limit; they are not targets.

export const PLAN_RACES = {
  '5k': { label: '5K', km: 5, weeks: [6, 8], long: [6, 8], longCap: 8, cap: 45, taper: 1 },
  '10k': { label: '10K', km: 10, weeks: [8, 10], long: [10, 14], longCap: 14, cap: 55, taper: 1 },
  half: { label: 'half marathon', km: 21.1, weeks: [10, 14], long: [16, 20], longCap: 20, cap: 65, taper: 2 },
  marathon: { label: 'marathon', km: 42.2, weeks: [16, 20], long: [28, 35], longCap: 32, cap: 90, taper: 2 },
};

const r1 = x => Math.round(x);

/** { race, weeks, now (weekly km), long (km) } → { rows: [{ week, km, long, note, kind }], peak, peakLong } */
export function buildOutline({ race, weeks, now, long }) {
  const R = PLAN_RACES[race];
  const tw = weeks < 6 ? 1 : R.taper;
  const build = Math.max(1, weeks - tw);
  const rows = [];
  let km = now, lg = Math.min(long, R.longCap), peak = now, peakLong = lg;
  for (let w = 1; w <= build; w++) {
    if (w > 1 && w % 4 === 0) {
      rows.push({ week: w, km: r1(peak * 0.75), long: r1(peakLong * 0.75), note: 'Easier week', kind: 'easy' });
      continue;
    }
    if (w > 1) {
      km = Math.min(R.cap, Math.max(km, peak * 1.1));
      lg = Math.min(R.longCap, peakLong + Math.max(1, peakLong * 0.1), Math.max(peakLong, km * 0.5));
      lg = Math.max(peakLong, lg);
    }
    peak = Math.max(peak, km); peakLong = Math.max(peakLong, lg);
    rows.push({ week: w, km: r1(km), long: r1(lg), note: w === 1 ? 'Where you are now' : 'Build', kind: 'build' });
  }
  if (tw === 2) rows.push({ week: build + 1, km: r1(peak * 0.7), long: r1(peakLong * 0.6), note: 'Taper', kind: 'taper' });
  rows.push({ week: weeks, km: r1(peak * (tw === 2 ? 0.5 : 0.6)), long: 'Race', note: `Race week: easy runs, plus the race (${R.km} km)`, kind: 'race' });
  return { rows, peak: r1(peak), peakLong: r1(peakLong) };
}
