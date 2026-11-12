// The example nine-week run-walk plan used on "Your first run" and by the calendar on "Staying motivated".
// It is an example, not a prescription: each session is a 5-minute brisk walk, the run-walk block, and a 5-minute walk.
// Repeat any week until it feels comfortable before moving on.

export const WARM = 5, COOL = 5;

export const WEEKS = [
  { n: 1, reps: 8, run: 1, walk: 2 },
  { n: 2, reps: 7, run: 1.5, walk: 2 },
  { n: 3, reps: 6, run: 2, walk: 2 },
  { n: 4, reps: 5, run: 3, walk: 2 },
  { n: 5, reps: 4, run: 5, walk: 2 },
  { n: 6, reps: 3, run: 8, walk: 2 },
  { n: 7, segs: [['run', 12], ['walk', 2], ['run', 12]] },
  { n: 8, segs: [['run', 20], ['walk', 1], ['run', 8]] },
  { n: 9, segs: [['run', 30]] },
];

const mins = m => (m === 1 ? '1 minute' : m === 1.5 ? '90 seconds' : `${m} minutes`);

/** The whole session as segments: [kind, minutes, label]. */
export function segments(w) {
  const out = [['walk', WARM, 'Warm-up walk']];
  if (w.reps) {
    for (let i = 0; i < w.reps; i++) {
      out.push(['run', w.run, `Run ${i + 1} of ${w.reps}`]);
      if (i < w.reps - 1) out.push(['walk', w.walk, 'Walk']);
    }
  } else {
    const runs = w.segs.filter(s => s[0] === 'run').length;
    let k = 0;
    for (const [kind, m] of w.segs) out.push([kind, m, kind === 'run' ? `Run ${++k} of ${runs}` : 'Walk']);
  }
  out.push(['walk', COOL, 'Cool-down walk']);
  return out;
}

export const runMinutes = w => segments(w).filter(s => s[0] === 'run').reduce((a, s) => a + s[1], 0);
export const totalMinutes = w => segments(w).reduce((a, s) => a + s[1], 0);

/** One sentence that describes the session. */
export function describe(w) {
  const block = w.reps
    ? `${w.reps} rounds of running for ${mins(w.run)} and walking for ${mins(w.walk)}`
    : w.segs.map(([k, m]) => `${k} ${mins(m)}`).join(', ');
  return `Walk briskly for ${WARM} minutes. Then ${block}. Finish with a ${COOL}-minute walk.`;
}
