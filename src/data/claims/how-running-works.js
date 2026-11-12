// Claims for Section 2, How running works. Ids start with H. See src/data/claims.js for the rules.
// The stride lab's own claims (R1 to R9) are in src/data/claims.js; pages here cite them too.
// No full text has been read for these yet: every sourced claim is "unchecked" until its passage is recorded.

export const CLAIMS = [
  // Springs and tendons (Spring lab)
  { id: 'H1', page: 'how-running-works/springs-and-tendons', grade: 'model', claim: 'The Spring lab treats the runner as a body bouncing on one leg spring: the spring-mass model of running and hopping.', src: 'Blickhan 1989, J Biomech 22:1217-1227; McMahon and Cheng 1990, J Biomech 23 Suppl 1:65-78' },
  { id: 'H2', page: 'how-running-works/springs-and-tendons', grade: 'model', claim: "The lab works out peak force, how far the body drops while the foot is down, and the spring's stiffness from contact time, flight time, speed, leg length and body mass, with the sine-wave method of Morin and colleagues.", src: 'Morin et al. 2005, J Appl Biomech 21:167-180' },
  { id: 'H3', page: 'how-running-works/springs-and-tendons', grade: 'unchecked', claim: 'Tendons tested in the lab return most of the energy used to stretch them when they recoil; only a small share is lost as heat.', src: 'Bennett et al. 1986, J Zool 209:537-548' },
  { id: 'H4', page: 'how-running-works/springs-and-tendons', grade: 'unchecked', claim: 'A review proposed that more leg stiffness helps performance, and that there may be a best range for avoiding injury: some evidence links high stiffness with bone injuries and low stiffness with soft-tissue injuries. The authors called for studies that follow runners forward in time.', src: 'Butler, Crowell and Davis 2003, Clin Biomech 18:511-517' },

  // Foot strike
  { id: 'H5', page: 'how-running-works/foot-strike', grade: 'unchecked', claim: 'Of 283 runners filmed at the 15 km point of an elite-level half marathon, about 75% landed heel first, 24% on the midfoot and 1% on the forefoot. Midfoot landings were more common among the faster runners.', src: 'Hasegawa, Yamauchi and Kraemer 2007, J Strength Cond Res 21:888-893' },
  { id: 'H6', page: 'how-running-works/foot-strike', grade: 'unchecked', claim: 'In 52 runners from one college cross-country team, those who mostly landed heel first had about twice the rate of repetitive stress injuries of those who mostly landed on the forefoot. A small study looking back: a link, not proof.', src: 'Daoud et al. 2012, Med Sci Sports Exerc 44:1325-1334' },

  // Cadence and step length
  { id: 'H7', page: 'how-running-works/cadence-step-length', grade: 'unchecked', claim: 'In 10 recreational runners on a treadmill, the stride length each chose freely was close to the one that used the least oxygen; much longer or shorter strides cost more.', src: 'Cavanagh and Williams 1982, Med Sci Sports Exerc 14:30-35' },
  { id: 'H8', page: 'how-running-works/cadence-step-length', grade: 'unchecked', claim: 'A systematic review found that a higher step rate at the same speed went with less vertical bounce, lower ground forces and less energy absorbed at the knee.', src: 'Schubert, Kempf and Heiderscheit 2014, Sports Health 6:210-217' },

  // Forces and impact
  { id: 'H9', page: 'how-running-works/forces-impact', grade: 'model', claim: 'If the force under the foot rises and falls as a smooth half-sine, its peak is about π/2 times the step time divided by the contact time, in body weights.', src: 'Physics: the impulse over one step (as in Morin et al. 2005, J Appl Biomech 21:167-180)' },
  { id: 'H10', page: 'how-running-works/forces-impact', grade: 'unchecked', claim: 'Faster top running speeds come from pushing on the ground with more force, not from swinging the legs through the air more quickly.', src: 'Weyand et al. 2000, J Appl Physiol 89:1991-1999' },
  { id: 'H11', page: 'how-running-works/forces-impact', grade: 'unchecked', claim: 'A review of 18 studies found no difference in peak vertical ground forces between injured runners and controls. Loading rate was higher in runners with a history of stress fractures, mostly in studies looking back.', src: 'van der Worp et al. 2016, Br J Sports Med 50:450-457' },

  // Arms, posture and trunk
  { id: 'H12', page: 'how-running-works/arms-posture', grade: 'unchecked', claim: 'Running with the arms held behind the back, across the chest or on top of the head took about 3%, 9% and 13% more energy than running with a normal arm swing. Without arm swing, runners twisted their shoulders and pelvis more.', src: 'Arellano and Kram 2014, J Exp Biol 217:2456-2461' },
  { id: 'H13', page: 'how-running-works/arms-posture', grade: 'unchecked', claim: 'Running with the trunk leaning further forward lowered the stress at the joint behind the kneecap and shifted work towards the hip.', src: 'Teng and Powers 2014, J Orthop Sports Phys Ther 44:785-792' },

  // Running economy
  { id: 'H14', page: 'how-running-works/running-economy', grade: 'unchecked', claim: 'In 12 well-trained men with similar VO2max, all among the first 19 finishers of a 10 km race, running economy explained about 65% of the differences in their race times.', src: 'Conley and Krahenbuhl 1980, Med Sci Sports Exerc 12:357-360' },
  { id: 'H15', page: 'how-running-works/running-economy', grade: 'unchecked', claim: 'A meta-analysis found that strength training programmes improved running economy in middle- and long-distance runners.', src: 'Balsalobre-Fernández, Santos-Concejero and Grivas 2016, J Strength Cond Res 30:2361-2368' },
  { id: 'H16', page: 'how-running-works/running-economy', grade: 'unchecked', claim: 'Running economy in trained runners depends on many things at once: physiology, biomechanics, training and the environment.', src: 'Saunders et al. 2004, Sports Med 34:465-485' },

  // Uphill and downhill
  { id: 'H17', page: 'how-running-works/hills', grade: 'model', claim: 'The hill widget uses a curve fitted to the measured energy cost of running on treadmill slopes from −45% to +45%. On it, cost rises steeply uphill and is lowest on downhills of roughly 10 to 20%. The coefficients are as widely quoted and have not yet been checked against the paper.', src: 'Minetti et al. 2002, J Appl Physiol 93:1039-1046' },
  { id: 'H24', page: 'how-running-works/hills', grade: 'unchecked', claim: 'Exercise in which muscles work while lengthening, such as running downhill, causes the most delayed muscle soreness.', src: 'Cheung, Hume and Maxwell 2003, Sports Med 33:145-164' },
  { id: 'H25', page: 'how-running-works/hills', grade: 'unchecked', claim: 'After one bout of unaccustomed exercise, repeating it causes less soreness and muscle damage: the "repeated bout effect".', src: 'McHugh 2003, Scand J Med Sci Sports 13:88-97' },

  // Shoe science (Shoe cut-away)
  { id: 'H18', page: 'how-running-works/shoe-science', grade: 'unchecked', claim: 'In 18 high-calibre runners, a prototype racing shoe with a curved carbon plate and a new foam lowered the energy cost of running by about 4% on average against two established racing shoes, and lowered it in all 18.', src: 'Hoogkamer et al. 2018, Sports Med 48:1009-1019' },
  { id: 'H19', page: 'how-running-works/shoe-science', grade: 'unchecked', claim: 'In 553 leisure-time runners given shoes with a 10, 6 or 0 mm drop and followed for 6 months, overall injury risk did not differ by drop. In an exploratory split, low-drop shoes went with fewer injuries in occasional runners and more in regular runners.', src: 'Malisoux et al. 2016, Am J Sports Med 44:2933-2940' },
  { id: 'H20', page: 'how-running-works/shoe-science', grade: 'unchecked', claim: 'In 848 recreational runners given a softer or a harder version of the same shoe, the harder shoe went with a higher injury risk. Split by body mass, the difference showed only in the lighter runners.', src: 'Malisoux et al. 2020, Am J Sports Med 48:473-480' },
  { id: 'H21', page: 'how-running-works/shoe-science', grade: 'unchecked', claim: 'In 264 recreational runners followed for 22 weeks, those who used more than one pair of running shoes in turn had a lower injury risk (hazard ratio 0.61). A link, not proof.', src: 'Malisoux et al. 2015, Scand J Med Sci Sports 25:110-115' },
  { id: 'H22', page: 'how-running-works/shoe-science', grade: 'unchecked', claim: 'For road races, World Athletics rules limit the sole of a shoe to 40 mm thick and allow no more than one rigid plate inside it.', src: 'World Athletics Technical Rules, Rule 5 (athletic shoes)' },
  { id: 'H23', page: 'how-running-works/shoe-science', grade: 'model', claim: 'The Shoe cut-away is a generic shoe built for the lab, not any brand or model. Its foam squash is an illustration, not a measurement.', src: 'Illustration' },
];
