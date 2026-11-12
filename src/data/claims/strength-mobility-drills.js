// Claims for Section 5, Strength, mobility and drills (topic pages). Ids start with M. The warm-up studio's own
// claims (W1 to W5) are in src/data/claims.js; pages here cite them too.
// No full text has been read for these yet: every sourced claim is "unchecked" until its passage is recorded.

export const CLAIMS = [
  // Strength training (Strength library)
  { id: 'M1', page: 'strength-mobility-drills/strength-training', grade: 'unchecked', claim: 'A review of 24 studies in middle- and long-distance runners found that adding strength training generally improved running economy, by about 2 to 8% against running alone, and tended to improve time-trial performance over 1.5 to 10 km. VO2max and body composition were usually unchanged.', src: 'Blagrove, Howatson and Hayes 2018, Sports Med 48:1117-1149' },
  { id: 'M2', page: 'strength-mobility-drills/strength-training', grade: 'unchecked', claim: 'The American College of Sports Medicine advises adults to do resistance exercise for each major muscle group on 2 to 3 days a week.', src: 'Garber et al. 2011, Med Sci Sports Exerc 43:1334-1359 (ACSM position stand)' },
  { id: 'M5', page: 'strength-mobility-drills/strength-training', grade: 'model', claim: 'The Strength library shows each exercise on a generic 3D runner, with the main muscles it works lit. The movements and the doses (sets and repetitions) are common starting points from coaching practice, not tested prescriptions.', src: 'Illustration' },

  // Stretching after runs
  { id: 'M3', page: 'strength-mobility-drills/stretching', grade: 'unchecked', claim: 'Pooling 11 trials (452 people), strength training and stretching improved range of motion by similar amounts. The trials differed a lot from one another.', src: 'Afonso et al. 2021, Healthcare 9:427' },

  { id: 'M6', page: 'strength-mobility-drills/stretching', grade: 'unchecked', claim: 'A Cochrane review of randomised trials found that stretching before, after, or before and after exercise did not produce clinically important reductions in delayed muscle soreness in healthy adults. Stretching after exercise lowered soreness a day later by about 1 point on a 100-point scale.', src: 'Herbert, de Noronha and Kamper 2011, Cochrane Database Syst Rev (7):CD004577' },

  { id: 'M8', page: 'strength-mobility-drills/stretching', grade: 'unchecked', claim: 'The ACSM advises flexibility exercises for the major muscle groups on at least 2 to 3 days a week, holding static stretches for 10 to 30 s to the point of tightness or slight discomfort, for about 60 s in total per exercise. Daily stretching gives bigger gains in range of motion.', src: 'Garber et al. 2011, Med Sci Sports Exerc 43:1334-1359 (ACSM position stand)' },

  // Running drills
  { id: 'M7', page: 'strength-mobility-drills/drills', grade: 'unchecked', claim: 'Pooling 16 studies of endurance athletes, adding explosive training or heavy weight training to endurance training improved running economy by similar small amounts, about 4.8% and 3.7%. Longer programmes went with bigger gains.', src: 'Denadai et al. 2017, Sports Med 47:545-554' },

  // Foam rolling
  { id: 'M4', page: 'strength-mobility-drills/foam-rolling', grade: 'unchecked', claim: 'Pooling 21 studies, foam rolling before exercise slightly improved sprint performance (about 0.7%) and flexibility (about 4%). After exercise it slightly reduced muscle pain (about 6%) and the drop in sprint performance. The authors judged the effects small.', src: 'Wiewelhove et al. 2019, Front Physiol 10:376' },
];
