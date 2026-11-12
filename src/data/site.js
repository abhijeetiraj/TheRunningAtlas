// Site map: the eleven sections, the four ways in, the 3D labs and the build roadmap.
// A topic becomes a link as soon as its page exists (see src/lib/atlas.js).

/** While true, every page carries a "Preview" badge and asks search engines not to index it. */
export const PREVIEW = true;

export const SITE = {
  name: 'The Running Atlas',
  tagline: 'Every stride, explained.',
  description: 'A running guide from first run to the science of the stride, with interactive 3D.',
  footnote: 'The Running Atlas (working title) · preview build',
};

/**
 * The atlas lives on Jezero Base, Abhijeet I.'s portfolio, and is reached from Olympus Gym.
 * PUBLIC_HOME_URL is the base's address. Leave it unset for abhijeeti.dev; set it to an empty string when the atlas
 * is served from the base's own domain, so links stay on whatever host (or preview URL) is serving the page.
 */
const HOME_URL = (import.meta.env.PUBLIC_HOME_URL ?? 'https://abhijeeti.dev').replace(/\/$/, '');
export const BASE = {
  owner: 'Abhijeet I.',
  name: 'Jezero Base',
  home: HOME_URL + '/',
  gym: HOME_URL + '/gym/',
  gymName: 'Olympus Gym',
};

/** Jezero Crater, where the base stands: Day and Dusk follow the Sun there (see src/lib/mars.js). */
export const JEZERO = { lat: 18.4447, lon: 77.4508 };

/**
 * The eleven sections and their topics, in reading order. A topic's page is
 * src/content/topics/<section>/<topic>.mdx, served at /<section>/<topic>/. Topics with `page` are hand-built pages
 * (3D labs and the ledger) at that path instead. A topic with neither is still being written and shows as "Coming".
 */
export const SECTIONS = [
  { n: 1, slug: 'start-running', title: 'Start running', who: 'New runners',
    intro: 'Everything for your first weeks: how to start with run-walk, how hard and how often to go, what to wear, and what your body is telling you.',
    topics: [
      { slug: 'first-run', title: 'Your first run, with run-walk' },
      { slug: 'how-often-how-far', title: 'How often and how far' },
      { slug: 'talk-test', title: 'How easy is easy: the talk test' },
      { slug: 'shoes-and-kit', title: 'Shoes and kit that matter' },
      { slug: 'where-to-run', title: 'Where to run: road, trail, treadmill' },
      { slug: 'side-stitch-breathlessness', title: 'Side stitch and breathlessness' },
      { slug: 'soreness', title: 'Soreness: what is normal' },
      { slug: 'staying-motivated', title: 'Staying motivated' },
      { slug: 'see-a-doctor-first', title: 'When to see a doctor before starting' },
    ] },
  { n: 2, slug: 'how-running-works', title: 'How running works', who: 'Everyone, and the curious',
    intro: 'The mechanics of the stride: springs and tendons, how your foot lands, cadence, the forces involved, and what makes one runner more economical than another.',
    topics: [
      { slug: 'stride', title: 'The running stride', page: '/how-running-works/stride/', summary: 'A 3D runner you can slow down, turn and change: speed, foot strike, forces and working muscles.' },
      { slug: 'springs-and-tendons', title: 'Springs and tendons' },
      { slug: 'foot-strike', title: 'Foot strike' },
      { slug: 'cadence-step-length', title: 'Cadence and step length' },
      { slug: 'forces-impact', title: 'Forces and impact' },
      { slug: 'arms-posture', title: 'Arms, posture and trunk' },
      { slug: 'running-economy', title: 'Running economy' },
      { slug: 'hills', title: 'Uphill and downhill' },
      { slug: 'shoe-science', title: 'Shoe science: foam, drop, plates' },
    ] },
  { n: 3, slug: 'the-engine', title: 'The engine', who: 'Curious runners',
    intro: 'How your body makes and spends energy on the run: heart, lungs and oxygen, thresholds, fuel, heat, altitude, and why humans can run so far.',
    topics: [
      { slug: 'energy-systems', title: 'Energy systems' },
      { slug: 'heart-lungs-oxygen', title: 'Heart, lungs and oxygen' },
      { slug: 'vo2max', title: 'VO2max' },
      { slug: 'lactate-thresholds', title: 'Lactate and thresholds' },
      { slug: 'heart-rate-zones', title: 'Heart-rate zones' },
      { slug: 'muscle-fibres', title: 'Muscle fibre types' },
      { slug: 'carbs-and-fat', title: 'Carbs and fat as fuel' },
      { slug: 'heat-and-sweat', title: 'Heat and sweat' },
      { slug: 'altitude', title: 'Altitude' },
      { slug: 'why-humans-run-far', title: 'Why humans can run far' },
    ] },
  { n: 4, slug: 'training', title: 'Training', who: 'Regular runners',
    intro: 'How training works and how to plan it: mostly easy running, a few hard sessions, gradual build-ups and plans from 5K to the marathon.',
    topics: [
      { slug: 'intensity-mix', title: 'Easy running and the intensity mix' },
      { slug: 'workouts', title: 'Workouts explained' },
      { slug: 'building-up', title: 'Building up gradually' },
      { slug: 'plans', title: 'Plans from 5K to marathon' },
      { slug: 'cross-training', title: 'Cross-training' },
      { slug: 'watch-metrics', title: 'What your watch metrics mean' },
    ] },
  { n: 5, slug: 'strength-mobility-drills', title: 'Strength, mobility and drills', who: 'Everyone',
    intro: 'The work around the running: warming up, strength training, running drills, stretching and foam rolling, and what each one does and does not do.',
    topics: [
      { slug: 'warm-up', title: 'Warm-up studio', page: '/strength-mobility-drills/warm-up/', summary: 'Nine warm-up moves in 3D, with the muscles each one moves lit up, and what the evidence says about stretching.' },
      { slug: 'strength-training', title: 'Strength training for runners' },
      { slug: 'drills', title: 'Running drills' },
      { slug: 'stretching', title: 'Stretching after runs' },
      { slug: 'foam-rolling', title: 'Foam rolling' },
    ] },
  { n: 6, slug: 'fuel-recovery', title: 'Fuel and recovery', who: 'Regular and racing runners',
    intro: 'Eating and drinking for running, and the recovery that lets training work: sleep, rest days, caffeine and supplements.',
    topics: [
      { slug: 'everyday-eating', title: 'Everyday eating' },
      { slug: 'before-during', title: 'Before and during runs' },
      { slug: 'fluids-sodium', title: 'Fluids and sodium' },
      { slug: 'sleep', title: 'Sleep' },
      { slug: 'rest-days', title: 'Rest days' },
      { slug: 'caffeine-supplements', title: 'Caffeine and supplements' },
    ] },
  { n: 7, slug: 'injuries-health', title: 'Injuries and health', who: 'Everyone',
    intro: 'Common running injuries, when to stop and get checked, and the red flags that need care now. Reviewed by a clinician before it goes live.',
    topics: [
      { slug: 'soreness-or-pain', title: 'Soreness or pain?' },
      { slug: 'runners-knee', title: "Runner's knee" },
      { slug: 'shin-pain', title: 'Shin pain' },
      { slug: 'achilles-pain', title: 'Achilles pain' },
      { slug: 'heel-pain', title: 'Heel pain' },
      { slug: 'outer-knee-itb', title: 'Outer knee (ITB) pain' },
      { slug: 'bone-stress', title: 'Bone stress injuries' },
      { slug: 'when-to-get-checked', title: 'When to stop and get checked' },
      { slug: 'red-flags', title: 'Red flags: heat illness, rhabdo, low sodium, chest pain' },
      { slug: 'coming-back', title: 'Coming back after injury' },
    ] },
  { n: 8, slug: 'different-runners', title: 'Different runners', who: 'Specific groups',
    intro: "Running through life's stages and with health conditions: women's health, energy availability, older and younger runners, bigger bodies, asthma and diabetes.",
    topics: [
      { slug: 'womens-health', title: "Women's health: cycle, pregnancy, menopause" },
      { slug: 'red-s', title: 'Low energy availability (RED-S)' },
      { slug: 'over-40', title: 'Runners over 40' },
      { slug: 'teens', title: 'Teen runners' },
      { slug: 'bigger-body', title: 'Running in a bigger body' },
      { slug: 'asthma-diabetes', title: 'Running with asthma or diabetes' },
    ] },
  { n: 9, slug: 'racing', title: 'Racing', who: 'Racing runners',
    intro: 'From choosing a race to the finish line and the days after: taper, pacing, race-day fuel, course and weather.',
    topics: [
      { slug: 'choosing-a-race', title: 'Choosing a race' },
      { slug: 'half-or-full', title: 'Half or full?' },
      { slug: 'taper', title: 'Taper and race week' },
      { slug: 'pacing', title: 'Pacing' },
      { slug: 'race-day-fuel', title: 'Race-day fuel' },
      { slug: 'course-weather', title: 'Course and weather' },
      { slug: 'after-the-finish', title: 'After the finish' },
    ] },
  { n: 10, slug: 'tools', title: 'Tools', who: 'Everyone',
    intro: 'Calculators and counters for your own numbers. Each one shows its working and says where its formula comes from.',
    topics: [
      { slug: 'pace-calculator', title: 'Pace calculator' },
      { slug: 'race-time-estimator', title: 'Race-time estimator' },
      { slug: 'heart-rate-zones', title: 'Heart-rate zones' },
      { slug: 'cadence-counter', title: 'Cadence counter' },
      { slug: 'plan-builder', title: 'Plan builder' },
      { slug: 'fuel-planner', title: 'Fuel planner' },
    ] },
  { n: 11, slug: 'library', title: 'Library', who: 'Everyone',
    intro: 'The reference shelf: running words explained, every source and its grade, common myths, and the videos from the channel.',
    topics: [
      { slug: 'glossary', title: 'Glossary' },
      { slug: 'evidence', title: 'Evidence ledger', page: '/library/evidence/', summary: 'Every claim on the site, where it comes from, and how well it has been checked.' },
      { slug: 'myths', title: 'Myths and evidence' },
      { slug: 'videos', title: 'Videos from the channel' },
    ] },
];

export const sectionBySlug = slug => SECTIONS.find(s => s.slug === slug);

export const PATHS = [
  { title: "I'm new to running", line: 'Your first run, how easy is easy, shoes, and what soreness means.', go: [1, 7] },
  { title: 'I run regularly', line: 'Build your training, add strength, and fuel and recover well.', go: [4, 5, 6] },
  { title: "I'm training for a race", line: 'Plans from 5K to marathon, pacing, race week and race day.', go: [9, 4] },
  { title: 'I want the science', line: 'Strides and springs, heart and lungs, and how fitness changes you.', go: [2, 3] },
];

export const LABS = [
  { name: 'Running stride', what: 'Slow a runner down, change speed and foot strike, see forces and working muscles.', href: '/how-running-works/stride/', section: 2 },
  { name: 'Warm-up studio', what: 'Nine warm-up moves you can watch from any angle, with muscles lit.', href: '/strength-mobility-drills/warm-up/', section: 5 },
  { name: 'Spring lab', what: 'Watch the Achilles tendon and foot arch store and return energy.', section: 2 },
  { name: 'Oxygen journey', what: 'Follow oxygen from the lungs to the heart to a working muscle.', section: 3 },
  { name: 'Muscle fibres', what: 'Zoom into a calf muscle and compare slow and fast fibres.', section: 3 },
  { name: 'Strength library', what: 'Every strength exercise on the 3D runner, with the muscles it trains.', section: 5 },
  { name: 'Injury body map', what: 'Tap a sore area for common causes and when to get checked.', section: 7 },
  { name: 'Shoe cut-away', what: 'Slice a running shoe to see foam, drop and plates.', section: 2 },
  { name: 'Course fly-over', what: 'Fly over a race course with its hills and a pacing plan.', section: 9 },
];

export const ROADMAP = [
  'This preview and the plan',
  'Start running, tools, real hosting',
  'How running works, the engine',
  'Training, strength, fuel',
  'Injuries and health, after clinician review',
  'Racing, then public launch',
];

/** Main navigation. */
export const NAV = [
  { label: 'Atlas', href: '/' },
  { label: 'Start running', href: '/start-running/' },
  { label: 'Stride lab', href: '/how-running-works/stride/' },
  { label: 'Warm-up studio', href: '/strength-mobility-drills/warm-up/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'Evidence', href: '/library/evidence/' },
];

/** Prefix a site path with the configured base (for hosting under a sub-path, such as GitHub Pages). */
export function href(path) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + path;
}
