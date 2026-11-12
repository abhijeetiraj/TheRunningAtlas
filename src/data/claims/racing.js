// Claims for Section 9, Racing. Ids start with C. See src/data/claims.js for the rules.
// No full text has been read for these yet: every sourced claim is "unchecked" until its passage is recorded. Several
// were found only through abstracts and summaries. Course and weather, and After the finish, are clinician drafts.

export const CLAIMS = [
  // Choosing a race
  { id: 'C2', page: 'racing/choosing-a-race', grade: 'unchecked', claim: 'In results from several big-city marathons over many years, finishing times slowed progressively as heat stress (the wet-bulb globe temperature) rose from about 5 to 25 °C, and slower runners were slowed more than the fastest.', src: 'Ely et al. 2007, Med Sci Sports Exerc 39:487-493' },

  // Pacing (with the Course fly-over)
  { id: 'C1', page: 'racing/pacing', grade: 'unchecked', claim: 'In about 92,000 performances in 14 US marathons, men slowed more than women in the second half, and were about three times as likely to slow markedly (a second half more than 30% slower than the first), even allowing for age, experience and finishing time.', src: 'Deaner et al. 2015, Med Sci Sports Exerc 47:607-616' },
  { id: 'C5', page: 'racing/pacing', grade: 'model', claim: 'The Course fly-over is an illustration on made-up courses, with the hills drawn taller than they are so you can see them. Its pacing plan keeps the energy cost per minute steady using the hill curve in H17, limits how much faster it lets you run downhill, and ignores wind, heat, turns and tiredness.', src: 'Illustration and arithmetic' },

  // Race-day fuel
  { id: 'C3', page: 'racing/race-day-fuel', grade: 'unchecked', claim: 'For events longer than about 90 minutes, the statement suggests carbohydrate loading: about 10 to 12 g of carbohydrate per kg of body mass a day for the 36 to 48 hours before.', src: 'Thomas, Erdman and Burke 2016, Med Sci Sports Exerc 48:543-568' },
  { id: 'C4', page: 'racing/race-day-fuel', grade: 'unchecked', claim: 'The consensus statement advises using thirst to guide how much to drink. Drinking more than is lost, over hours, is the main cause of exercise-associated hyponatraemia (low blood sodium).', src: 'Hew-Butler et al. 2015, Clin J Sport Med 25:303-320' },

  // After the finish (clinician review)
  { id: 'C6', page: 'racing/after-the-finish', grade: 'unchecked', claim: 'Collapse after crossing the finish line is now thought to come mainly from a brief drop in blood pressure once running stops, as blood pools in the legs, rather than from dehydration or overheating. Collapse during the race, before the finish, is more likely to be from a serious cause.', src: 'Asplund, O\'Connor and Noakes 2011, Br J Sports Med 45:1157-1162' },
];
