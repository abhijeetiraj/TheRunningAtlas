// Claims for Section 7, Injuries and health. Ids start with I. See src/data/claims.js for the rules.
// Every page in this section is a clinician-review draft. No full text has been read for these yet: every sourced
// claim is "unchecked" until its passage is recorded. Several were found only through abstracts and summaries; the
// passages must be checked in the full source before any is graded higher.

export const CLAIMS = [
  // Soreness or pain? (with the Injury body map)
  { id: 'I1', page: 'injuries-health/soreness-or-pain', grade: 'unchecked', claim: 'Pooling 8 studies of about 3,500 runners, the most common running injuries were medial tibial stress syndrome (shin splints, in about 14 to 20% of runners during follow-up), Achilles tendinopathy (about 9 to 11%) and plantar fasciitis (about 5 to 10%). In ultramarathon runners, Achilles tendinopathy and patellofemoral pain were the most common.', src: 'Lopes et al. 2012, Sports Med 42:891-905' },
  { id: 'I2', page: 'injuries-health/soreness-or-pain', grade: 'unchecked', claim: 'In a trial of 38 people with Achilles tendinopathy, those who kept running and jumping using a pain-monitoring model (pain allowed up to 5 on a 0 to 10 scale during and after activity, settling by the next morning, and not rising from week to week) did as well as those who rested from running and jumping for 6 weeks.', src: 'Silbernagel et al. 2007, Am J Sports Med 35:897-906' },
  { id: 'I3', page: 'injuries-health/soreness-or-pain', grade: 'unchecked', claim: 'Delayed onset muscle soreness usually starts within a day of unaccustomed exercise, peaks around 24 to 72 hours, and fades within about a week.', src: 'Cheung, Hume and Maxwell 2003, Sports Med 33:145-164' },
  { id: 'I4', page: 'injuries-health/soreness-or-pain', grade: 'model', claim: 'The Injury body map is an illustration on a generic 3D runner. It marks where common running injuries are usually felt, so you can read about them; it cannot tell you what is causing your pain.', src: 'Illustration' },

  // Runner's knee
  { id: 'I5', page: 'injuries-health/runners-knee', grade: 'unchecked', claim: 'Patellofemoral pain is diffuse pain at the front of the knee, around or behind the kneecap, usually brought on by activities such as squatting, running and going up or down stairs. Pain on squatting is the most useful test.', src: 'Crossley et al. 2016, Br J Sports Med 50:839-843 (International Patellofemoral Pain Research Retreat consensus, part 1)' },
  { id: 'I6', page: 'injuries-health/runners-knee', grade: 'unchecked', claim: 'Exercise therapy is recommended for patellofemoral pain to reduce pain in the short, medium and long term and improve function, with combined hip- and knee-focused exercise preferred. Foot orthoses and patellar taping may help in the short term.', src: 'Crossley et al. 2016, Br J Sports Med 50:844-852 (consensus, part 2)' },

  // Shin pain
  { id: 'I7', page: 'injuries-health/shin-pain', grade: 'unchecked', claim: 'Reviewing 11 trials, none of the treatments tested for medial tibial stress syndrome (including laser, stretching and strengthening, compression stockings, braces and electromagnetic fields) was proven effective. All the randomised trials had a high risk of bias.', src: 'Winters et al. 2013, Sports Med 43:1315-1333' },
  { id: 'I8', page: 'injuries-health/shin-pain', grade: 'unchecked', claim: 'Pooling studies of runners, factors linked with medial tibial stress syndrome included being female, a previous episode, higher body mass index, a larger navicular drop (arch flattening), previous use of orthotics and fewer years of running. Links, not proof of cause.', src: 'Newman et al. 2013, Open Access J Sports Med 4:229-241' },

  // Achilles pain
  { id: 'I9', page: 'injuries-health/achilles-pain', grade: 'unchecked', claim: 'Signs of an Achilles tendon rupture include a snap or pop, sudden severe pain at the back of the ankle or calf, not being able to carry on, and not being able to rise up on the toes of that leg. It is often mistaken for a sprain.', src: 'NHS Ayrshire and Arran, Achilles tendon rupture (RefHelp, rightdecisions.scot.nhs.uk)' },

  { id: 'I17', page: 'injuries-health/achilles-pain', grade: 'unchecked', claim: 'In 15 recreational runners with long-standing Achilles tendon pain, 12 weeks of heavy-load eccentric calf training (slowly lowering the heel under load) let all of them return to running, in a small study without a randomised control group.', src: 'Alfredson et al. 1998, Am J Sports Med 26:360-366' },

  // Heel pain
  { id: 'I10', page: 'injuries-health/heel-pain', grade: 'unchecked', claim: 'Plantar heel pain (plantar fasciitis) is felt under the heel or in the arch, and is typically worst with the first steps in the morning or after rest. Most cases improve, though some last a long time.', src: 'NHS patient information on plantar fasciitis (nhs.uk and NHS trust leaflets)' },
  { id: 'I11', page: 'injuries-health/heel-pain', grade: 'unchecked', claim: 'In 48 people with plantar fasciitis, adding high-load strength training (single-leg heel raises with a towel under the toes, every other day) to shoe inserts gave better foot function at 3 months than adding daily stretching. There was no difference at 1, 6 or 12 months.', src: 'Rathleff et al. 2015, Scand J Med Sci Sports 25:e292-e300' },

  // Outer knee (ITB) pain
  { id: 'I12', page: 'injuries-health/outer-knee-itb', grade: 'unchecked', claim: 'A systematic review of iliotibial band syndrome in runners found that the hip, knee and foot appear to move differently in runners with the condition, but research on its treatment was of poor quality and its results conflicted.', src: 'van der Worp et al. 2012, Sports Med 42:969-992' },

  // Bone stress injuries
  { id: 'I13', page: 'injuries-health/bone-stress', grade: 'unchecked', claim: 'A bone stress injury is bone failing to withstand repeated loading, causing localised bone pain and tenderness. It sits on a continuum from a stress reaction to a stress fracture and, ultimately, a complete fracture.', src: 'Warden, Davis and Fredericson 2014, J Orthop Sports Phys Ther 44:749-765' },
  { id: 'I14', page: 'injuries-health/bone-stress', grade: 'unchecked', claim: 'Bone stress injuries at low-risk sites generally heal with reduced activity followed by gradually increasing load. Non-weight-bearing, medicines or surgery are usually reserved for high-risk sites, such as the neck of the thigh bone (femoral neck) and the navicular bone in the foot. Diagnosis rests on history and examination, with imaging to confirm.', src: 'Hoenig et al. 2022, Nat Rev Dis Primers 8:26' },
  { id: 'I15', page: 'injuries-health/bone-stress', grade: 'unchecked', claim: 'The IOC describes relative energy deficiency in sport, from eating too little for the energy used, as including effects on bone health and menstrual function, in men as well as women.', src: 'Mountjoy et al. 2018, Br J Sports Med 52:687-697 (IOC consensus statement)' },

  // Red flags
  { id: 'I16', page: 'injuries-health/red-flags', grade: 'unchecked', claim: 'Among 10.9 million runners in US marathons and half marathons from 2000 to 2010, 59 had a cardiac arrest during the race or within an hour after. Most were men in marathons. Bystander CPR was the strongest predictor of survival.', src: 'Kim et al. 2012, N Engl J Med 366:130-140' },
];
