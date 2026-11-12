// Claims for Section 4, Training. Ids start with T. See src/data/claims.js for the rules.
// No full text has been read for these yet: every sourced claim is "unchecked" until its passage is recorded.

export const CLAIMS = [
  // Easy running and the intensity mix
  { id: 'T1', page: 'training/intensity-mix', grade: 'unchecked', claim: 'In 12 sub-elite runners trained for about 5 months, a programme with more low-intensity running (below the first ventilatory threshold) improved a simulated 10.4 km cross-country race by more, about 157 s against 121 s, than one with more moderately hard running. Both had a similar, small share of high-intensity work.', src: 'Esteve-Lanao et al. 2007, J Strength Cond Res 21:943-949' },
  { id: 'T2', page: 'training/intensity-mix', grade: 'unchecked', claim: 'In 48 well-trained runners, cyclists, triathletes and skiers over 9 weeks, a "polarised" programme (mostly low intensity, some high intensity, little in between) raised peak oxygen uptake by about 12%, more than threshold, high-intensity or high-volume programmes. Groups were small.', src: 'Stöggl and Sperlich 2014, Front Physiol 5:33' },
  { id: 'T3', page: 'training/intensity-mix', grade: 'model', claim: 'The intensity mix calculator is arithmetic: each kind of running as a share of your total running time.', src: 'Arithmetic' },

  // Workouts explained
  { id: 'T9', page: 'training/workouts', grade: 'model', claim: 'The workout examples and the talk-test efforts on this page are common coaching practice, not tested prescriptions.', src: 'Coaching practice' },

  // Plans from 5K to marathon
  { id: 'T4', page: 'training/plans', grade: 'unchecked', claim: 'Pooling studies of tapering, the largest performance gains came from a taper of about 2 weeks in which training volume was cut by roughly 41 to 60% while intensity and frequency were kept.', src: 'Bosquet et al. 2007, Med Sci Sports Exerc 39:1358-1365' },

  { id: 'T8', page: 'training/plans', grade: 'model', claim: 'The example weeks on this page are illustrations of a common pattern (mostly easy running, one or two harder sessions and a long run), not tested plans.', src: 'Illustration' },

  // Cross-training
  { id: 'T5', page: 'training/cross-training', grade: 'unchecked', claim: 'In highly trained athletes, less than 4 weeks of stopped or much reduced training brings a rapid fall in VO2max and blood volume.', src: 'Mujika and Padilla 2000, Sports Med 30:79-87' },
  { id: 'T6', page: 'training/cross-training', grade: 'unchecked', claim: 'A review found that trained endurance athletes kept their aerobic performance with deep-water running for up to 6 weeks. In the water, peak heart rate and oxygen uptake are lower than on land.', src: 'Reilly, Dowzer and Cable 2003, J Sports Sci 21:959-972' },

  // What your watch metrics mean
  { id: 'T7', page: 'training/watch-metrics', grade: 'unchecked', claim: 'Pooling 14 validation studies, wearables that estimate VO2max from resting data overestimated it by about 2 ml/kg/min on average, with wide errors for individuals. Estimates made from exercise data were unbiased on average, but an individual reading could still be off by roughly 10 ml/kg/min either way.', src: 'Molina-Garcia et al. 2022, Sports Med 52:1577-1597' },
];
