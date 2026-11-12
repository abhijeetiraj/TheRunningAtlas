// Claims for Section 1, Start running. Ids start with S. See src/data/claims.js for the rules.
// None of these sources has been read in full yet, so every claim is "unchecked" until its passage is recorded.

export const CLAIMS = [
  // Your first run, with run-walk
  { id: 'S1', page: 'start-running/first-run', grade: 'unchecked', claim: 'Beginner plans such as the NHS Couch to 5K start with short runs between walks and build to about 30 minutes of running over nine weeks, with three runs a week.', src: 'NHS, Couch to 5K running plan (nhs.uk)' },
  { id: 'S2', page: 'start-running/first-run', grade: 'unchecked', claim: 'Pooling 14 studies from six cohorts (232,149 people), any amount of running was linked with a lower risk of death from any cause during follow-up than no running, including amounts under 50 minutes a week. A link, not proof of cause.', src: 'Pedisic et al. 2020, Br J Sports Med 54:898-905' },

  // How often and how far
  { id: 'S3', page: 'start-running/how-often-how-far', grade: 'unchecked', claim: "The World Health Organization's 2020 guidelines advise adults to get 150 to 300 minutes of moderate activity, or 75 to 150 minutes of vigorous activity, each week.", src: 'Bull et al. 2020, Br J Sports Med 54:1451-1462 (WHO 2020 guidelines)' },
  { id: 'S4', page: 'start-running/how-often-how-far', grade: 'unchecked', claim: 'In 532 novice runners training for a 4-mile race, a slower 13-week programme built on the "10% rule" had about as many injuries as a standard 8-week programme: roughly one runner in five in each group.', src: 'Buist et al. 2008, Am J Sports Med 36:33-39' },
  { id: 'S5', page: 'start-running/how-often-how-far', grade: 'unchecked', claim: 'In 873 novice runners, those whose weekly distance rose by more than 30% had more of some overuse injuries than those whose distance rose by less than 10%. A link, not proof of cause.', src: 'Nielsen et al. 2014, J Orthop Sports Phys Ther 44:739-747' },
  { id: 'S6', page: 'start-running/how-often-how-far', grade: 'unchecked', claim: 'Pooling studies, novice runners had about 17.8 injuries per 1,000 hours of running, against about 7.7 for recreational runners.', src: 'Videbæk et al. 2015, Sports Med 45:1017-1026' },

  // How easy is easy: the talk test
  { id: 'S7', page: 'start-running/talk-test', grade: 'unchecked', claim: 'In lab tests, the effort at which talking stops being comfortable sat close to the ventilatory threshold, a marker between moderate and hard exercise.', src: 'Persinger et al. 2004, Med Sci Sports Exerc 36:1632-1636' },
  { id: 'S8', page: 'start-running/talk-test', grade: 'unchecked', claim: "Borg's scale of perceived exertion rates effort from 6 (no exertion at all) to 20 (maximal exertion).", src: 'Borg 1982, Med Sci Sports Exerc 14:377-381' },
  { id: 'S9', page: 'start-running/talk-test', grade: 'unchecked', claim: 'Well-trained endurance athletes in several sports do about 80% of their training sessions at low intensity.', src: 'Seiler 2010, Int J Sports Physiol Perform 5:276-291' },

  // Shoes and kit that matter
  { id: 'S10', page: 'start-running/shoes-and-kit', grade: 'unchecked', claim: 'A review of running shoe research argued that matching shoes to impact or to foot rolling has little support, and proposed choosing the shoe that feels most comfortable (a "comfort filter").', src: 'Nigg et al. 2015, Br J Sports Med 49:1290-1294' },
  { id: 'S11', page: 'start-running/shoes-and-kit', grade: 'unchecked', claim: 'In 927 novice runners given the same neutral shoe and followed for a year, runners whose feet rolled inwards (pronated) did not have more injuries than runners with neutral feet.', src: 'Nielsen et al. 2014, Br J Sports Med 48:440-447' },
  { id: 'S12', page: 'start-running/shoes-and-kit', grade: 'unchecked', claim: 'Across trials in army, air force and marine recruits, assigning running shoes by the height of the foot arch did not reduce injuries.', src: 'Knapik et al. 2014, J Orthop Sports Phys Ther 44:805-812' },

  // Where to run: road, trail, treadmill
  { id: 'S13', page: 'start-running/where-to-run', grade: 'unchecked', claim: 'For trained runners at moderate to fast speeds, setting the treadmill to a 1% incline best matched the energy cost of running outdoors.', src: 'Jones and Doust 1996, J Sports Sci 14:321-327' },
  { id: 'S14', page: 'start-running/where-to-run', grade: 'unchecked', claim: 'A review of studies comparing the two found running on a motorised treadmill broadly similar to running overground in how people move, with some differences.', src: 'Van Hooren et al. 2020, Sports Med 50:785-813' },
  { id: 'S15', page: 'start-running/where-to-run', grade: 'unchecked', claim: 'Runners adjust the stiffness of their legs to the surface, softer on hard ground and stiffer on soft ground, so the body bounces about the same on both.', src: 'Ferris, Louie and Farley 1998, Proc R Soc Lond B 265:989-994' },

  // Side stitch and breathlessness (clinician review)
  { id: 'S16', page: 'start-running/side-stitch-breathlessness', grade: 'unchecked', claim: 'A stitch (exercise-related transient abdominal pain) is common in activities with repeated movement of the torso, such as running and horse riding. Its cause is not known for certain.', src: 'Morton and Callister 2015, Sports Med 45:23-35' },
  { id: 'S17', page: 'start-running/side-stitch-breathlessness', grade: 'unchecked', claim: 'Eating, or drinking large amounts (especially of sugary drinks), shortly before exercise seems to make a stitch more likely.', src: 'Morton and Callister 2015, Sports Med 45:23-35' },

  // Soreness: what is normal (clinician review)
  { id: 'S18', page: 'start-running/soreness', grade: 'unchecked', claim: 'Delayed onset muscle soreness usually starts within a day of unaccustomed exercise, peaks around 24 to 72 hours, and fades within about a week.', src: 'Cheung, Hume and Maxwell 2003, Sports Med 33:145-164' },
  { id: 'S19', page: 'start-running/soreness', grade: 'unchecked', claim: 'Exercise in which muscles work while lengthening, such as running downhill, causes the most delayed soreness.', src: 'Cheung, Hume and Maxwell 2003, Sports Med 33:145-164' },
  { id: 'S20', page: 'start-running/soreness', grade: 'unchecked', claim: 'After one bout of unaccustomed exercise, repeating it causes less soreness and muscle damage: the "repeated bout effect".', src: 'McHugh 2003, Scand J Med Sci Sports 13:88-97' },
  { id: 'S21', page: 'start-running/soreness', grade: 'unchecked', claim: 'Warning signs of exertional rhabdomyolysis include muscle pain or weakness out of proportion to the exercise, swelling, and tea- or cola-coloured urine.', src: 'CDC NIOSH, Rhabdomyolysis (cdc.gov/niosh)' },

  // Staying motivated
  { id: 'S22', page: 'start-running/staying-motivated', grade: 'unchecked', claim: 'In a study of 96 volunteers each building one new daily habit, it took a median of 66 days for the habit to feel automatic, with a range of 18 to 254 days.', src: 'Lally et al. 2010, Eur J Soc Psychol 40:998-1009' },
  { id: 'S27', page: 'start-running/staying-motivated', grade: 'unchecked', claim: 'parkrun is a free, weekly, timed 5 km event held in parks in many countries, open to walkers, joggers and runners.', src: 'parkrun (parkrun.com)' },
  { id: 'S23', page: 'start-running/staying-motivated', grade: 'unchecked', claim: 'A meta-analysis of 94 studies found that "if-then" plans, which name when and where you will act, had a medium-to-large effect on reaching goals.', src: 'Gollwitzer and Sheeran 2006, Adv Exp Soc Psychol 38:69-119' },

  // When to see a doctor before starting (clinician review)
  { id: 'S24', page: 'start-running/see-a-doctor-first', grade: 'unchecked', claim: "The American College of Sports Medicine's screening advice: inactive people with no known heart, metabolic or kidney disease and no symptoms can start light to moderate exercise without medical clearance and build up gradually; anyone with symptoms should get medical clearance first.", src: 'Riebe et al. 2015, Med Sci Sports Exerc 47:2473-2479' },
  { id: 'S25', page: 'start-running/see-a-doctor-first', grade: 'unchecked', claim: 'Symptoms that call for medical clearance include pain or discomfort in the chest, neck, jaw or arms; breathlessness at rest or with mild effort; dizziness or fainting; ankle swelling; palpitations; calf pain on walking; a known heart murmur; and unusual tiredness.', src: 'Riebe et al. 2015, Med Sci Sports Exerc 47:2473-2479' },
  { id: 'S26', page: 'start-running/see-a-doctor-first', grade: 'unchecked', claim: 'The PAR-Q+ is a free questionnaire, with follow-up questions, for deciding who should get advice before becoming more physically active.', src: 'Warburton et al. 2011, Health Fit J Can 4(2):3-23' },
];
