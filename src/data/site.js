// Site map: the eleven sections, the four ways in, the 3D labs and the build roadmap.
// A topic becomes a link on the home page as soon as it has a `live` entry here.

/** While true, every page carries a "Preview" badge and asks search engines not to index it. */
export const PREVIEW = true;

export const SITE = {
  name: 'The Running Atlas',
  tagline: 'Every stride, explained.',
  description: 'A running guide from first run to the science of the stride, with interactive 3D.',
  footnote: 'The Running Atlas (working title) · preview build',
};

export const SECTIONS = [
  { n: 1, slug: 'start-running', title: 'Start running', who: 'New runners', topics: ['Your first run, with run-walk', 'How often and how far', 'How easy is easy: the talk test', 'Shoes and kit that matter', 'Where to run: road, trail, treadmill', 'Side stitch and breathlessness', 'Soreness: what is normal', 'Staying motivated', 'When to see a doctor before starting'] },
  { n: 2, slug: 'how-running-works', title: 'How running works', who: 'Everyone, and the curious', topics: ['The running stride', 'Springs and tendons', 'Foot strike', 'Cadence and step length', 'Forces and impact', 'Arms, posture and trunk', 'Running economy', 'Uphill and downhill', 'Shoe science: foam, drop, plates'], live: [{ label: 'The running stride', href: '/how-running-works/stride/' }] },
  { n: 3, slug: 'the-engine', title: 'The engine', who: 'Curious runners', topics: ['Energy systems', 'Heart, lungs and oxygen', 'VO2max', 'Lactate and thresholds', 'Heart-rate zones', 'Muscle fibre types', 'Carbs and fat as fuel', 'Heat and sweat', 'Altitude', 'Why humans can run far'] },
  { n: 4, slug: 'training', title: 'Training', who: 'Regular runners', topics: ['Easy running and the intensity mix', 'Workouts explained', 'Building up gradually', 'Plans from 5K to marathon', 'Cross-training', 'What your watch metrics mean'] },
  { n: 5, slug: 'strength-mobility-drills', title: 'Strength, mobility and drills', who: 'Everyone', topics: ['Warm-up studio', 'Strength training for runners', 'Running drills', 'Stretching after runs', 'Foam rolling'], live: [{ label: 'Warm-up studio', href: '/strength-mobility-drills/warm-up/' }] },
  { n: 6, slug: 'fuel-recovery', title: 'Fuel and recovery', who: 'Regular and racing runners', topics: ['Everyday eating', 'Before and during runs', 'Fluids and sodium', 'Sleep', 'Rest days', 'Caffeine and supplements'] },
  { n: 7, slug: 'injuries-health', title: 'Injuries and health', who: 'Everyone', topics: ['Soreness or pain?', "Runner's knee", 'Shin pain', 'Achilles pain', 'Heel pain', 'Outer knee (ITB) pain', 'Bone stress injuries', 'When to stop and get checked', 'Red flags: heat illness, rhabdo, low sodium, chest pain', 'Coming back after injury'] },
  { n: 8, slug: 'different-runners', title: 'Different runners', who: 'Specific groups', topics: ["Women's health: cycle, pregnancy, menopause", 'Low energy availability (RED-S)', 'Runners over 40', 'Teen runners', 'Running in a bigger body', 'Running with asthma or diabetes'] },
  { n: 9, slug: 'racing', title: 'Racing', who: 'Racing runners', topics: ['Choosing a race', 'Half or full?', 'Taper and race week', 'Pacing', 'Race-day fuel', 'Course and weather', 'After the finish'] },
  { n: 10, slug: 'tools', title: 'Tools', who: 'Everyone', topics: ['Pace calculator', 'Race-time estimator', 'Heart-rate zones', 'Cadence counter', 'Plan builder', 'Fuel planner'] },
  { n: 11, slug: 'library', title: 'Library', who: 'Everyone', topics: ['Glossary', 'Evidence ledger', 'Myths and evidence', 'Videos from the channel'], live: [{ label: 'Evidence ledger', href: '/library/evidence/' }] },
];

export const PATHS = [
  { title: "I'm new to running", line: 'Your first run, how easy is easy, shoes, and what soreness means.', go: [1, 7] },
  { title: 'I run regularly', line: 'Build your training, add strength, and fuel and recover well.', go: [4, 5, 6] },
  { title: "I'm training for a race", line: 'Plans from 5K to marathon, pacing, race week and race day.', go: [9, 4] },
  { title: 'I want the science', line: 'Strides and springs, heart and lungs, and how fitness changes you.', go: [2, 3] },
];

export const LABS = [
  { name: 'Running stride', what: 'Slow a runner down, change speed and foot strike, see forces and working muscles.', href: '/how-running-works/stride/' },
  { name: 'Warm-up studio', what: 'Nine warm-up moves you can watch from any angle, with muscles lit.', href: '/strength-mobility-drills/warm-up/' },
  { name: 'Spring lab', what: 'Watch the Achilles tendon and foot arch store and return energy.' },
  { name: 'Oxygen journey', what: 'Follow oxygen from the lungs to the heart to a working muscle.' },
  { name: 'Muscle fibres', what: 'Zoom into a calf muscle and compare slow and fast fibres.' },
  { name: 'Strength library', what: 'Every strength exercise on the 3D runner, with the muscles it trains.' },
  { name: 'Injury body map', what: 'Tap a sore area for common causes and when to get checked.' },
  { name: 'Shoe cut-away', what: 'Slice a running shoe to see foam, drop and plates.' },
  { name: 'Course fly-over', what: 'Fly over a race course with its hills and a pacing plan.' },
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
  { label: 'Stride lab', href: '/how-running-works/stride/' },
  { label: 'Warm-up studio', href: '/strength-mobility-drills/warm-up/' },
  { label: 'Evidence', href: '/library/evidence/' },
];

/** Prefix a site path with the configured base (for hosting under a sub-path, such as GitHub Pages). */
export function href(path) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + path;
}
