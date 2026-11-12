// Claims for Section 10, Tools. Ids start with P. See src/data/claims.js for the rules.

export const CLAIMS = [
  // Cadence counter
  { id: 'P1', page: 'tools/cadence-counter', grade: 'unchecked', claim: "The often-quoted 180 steps per minute comes from coach Jack Daniels' count of elite runners' cadence at the 1984 Olympics, not from a study of what suits each runner.", src: "Daniels, Daniels' Running Formula (book)" },
  { id: 'P2', page: 'tools/cadence-counter', grade: 'model', claim: 'Step length is speed divided by steps per second: at 6:00 per km (2.78 m/s) and 165 steps per minute, each step is about 1.01 m.', src: 'Arithmetic' },

  // Race-time estimator
  { id: 'P3', page: 'tools/race-time-estimator', grade: 'unchecked', claim: 'The Riegel formula predicts a time at a new distance from a known one: new time = known time × (new distance ÷ known distance) to the power 1.06. It came from a power law fitted to world-record performances lasting about 3.5 to 230 minutes.', src: 'Riegel 1981, Am Sci 69:285-290' },
  { id: 'P4', page: 'tools/race-time-estimator', grade: 'unchecked', claim: 'In a survey of 2,303 recreational runners, the Riegel formula predicted times well up to the half marathon, but predicted marathon times that were too fast: by at least 10 minutes for half of the runners.', src: 'Vickers and Vertosick 2016, BMC Sports Sci Med Rehabil 8:1' },
  { id: 'P5', page: 'tools/race-time-estimator', grade: 'model', claim: 'The race-time estimator is arithmetic: the Riegel formula (P3) applied to the race you enter, with the pace for each distance.', src: 'Arithmetic' },

  // Heart-rate zones
  { id: 'P8', page: 'tools/heart-rate-zones', grade: 'model', claim: 'The heart-rate tool is arithmetic: your measured maximum, or 208 − 0.7 × age (E15) if you have none, and your resting heart rate give your heart rate reserve (E16), which is split into the ACSM ranges (E17).', src: 'Arithmetic' },

  // Plan builder
  { id: 'P6', page: 'tools/plan-builder', grade: 'model', claim: 'The plan builder is a rule of thumb, not a tested plan. It starts from your current week, raises weekly distance by at most about 10% a week, makes every fourth week easier (about three quarters of the biggest week so far), grows the long run by about a kilometre or 10% a week up to a cap by race distance, and keeps it to about half the week or less. With a two-week taper, the last two weeks are about 30% and 50% below the biggest week; with a one-week taper, race week is about 40% below. Typical lengths and long runs come from T8, the taper from T4.', src: 'Arithmetic on common coaching patterns' },

  // Fuel planner
  { id: 'P7', page: 'tools/fuel-planner', grade: 'model', claim: 'The fuel planner is arithmetic on the carbohydrate ranges in F4: a target per hour for your expected finishing time, how many of your gels or drinks that is, and when to take each one.', src: 'Arithmetic' },
];
