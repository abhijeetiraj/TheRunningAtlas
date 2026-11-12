// The evidence ledger: every factual claim on the site, its source and how well it has been checked.
// Pages cite a claim with <Cite id="R5" />; each page shows its own claims in a ledger table,
// and /library/evidence/ lists them all. The build fails if a claim is malformed or a cited id is unknown.
//
// Claims for the hand-built pages (the stride lab and the warm-up studio) are here. Claims for topic pages live in
// src/data/claims/<section>.js, with `page` set to the topic's id, such as 'start-running/first-run'.
// Each section has its own id letter: S start running, H how running works, E the engine, T training,
// M strength and mobility, F fuel, I injuries, D different runners, C racing, P tools, L library.
import { SECTIONS } from './site.js';
import { CLAIMS as START } from './claims/start-running.js';
import { CLAIMS as HOW } from './claims/how-running-works.js';
import { CLAIMS as ENGINE } from './claims/the-engine.js';
import { CLAIMS as TOOLS } from './claims/tools.js';

export const GRADES = {
  checked: { label: 'Checked', text: 'The exact supporting passage was read in the full source and recorded with its limits.' },
  abstract: { label: 'Abstract only', text: 'Only the summary of the source has been read so far.' },
  unchecked: { label: 'Not yet checked', text: 'The source is named, but no passage has been read and recorded yet.' },
  model: { label: 'Model', text: 'A simplified model or a physics rule, labelled as such. It shows how something works, not a measurement.' },
};

/** The hand-built pages that carry claims. Topic pages are keyed by their id, such as 'start-running/first-run'. */
export const LEDGER_PAGES = {
  stride: { title: 'The running stride', href: '/how-running-works/stride/' },
  warmup: { title: 'Warm-up studio', href: '/strength-mobility-drills/warm-up/' },
};

/** Path of a ledger page key, or null if no such page is listed in the site map. */
export function pageHref(key) {
  if (LEDGER_PAGES[key]) return LEDGER_PAGES[key].href;
  const [sec, topic, extra] = String(key).split('/');
  if (extra !== undefined) return null;
  const s = SECTIONS.find(x => x.slug === sec);
  return s && s.topics.some(t => t.slug === topic && !t.page) ? `/${sec}/${topic}/` : null;
}

/*
 * A claim: { id, page, claim, src, grade }.
 * A "checked" claim must also carry `passage: { quote, where, limits, checkedOn }`:
 * the exact supporting text, where it sits in the source (page, section or table), its limits, and the date it was read.
 * Agreement between search summaries does not count as checked.
 */
const CORE = [
  { id: 'R1', page: 'stride', grade: 'model', claim: 'Cadence, step length, contact time and bounce in the lab follow a simple model of a typical recreational runner.', src: 'Model tuned to typical published ranges' },
  { id: 'R2', page: 'stride', grade: 'model', claim: 'Over a whole step the ground pushes up with an average of one body weight, so a shorter contact means a higher peak.', src: "Newton's second law (physics)" },
  { id: 'R3', page: 'stride', grade: 'unchecked', claim: 'Heel landings usually show a sharp early impact peak; forefoot landings usually do not.', src: 'Cavanagh and Lafortune 1980, J Biomech 13:397-406; Lieberman et al. 2010, Nature 463:531-535' },
  { id: 'R4', page: 'stride', grade: 'unchecked', claim: 'Timing of the working muscles through the stride, including activity just before landing.', src: 'Novacheck 1998, Gait & Posture 7:77-95' },
  { id: 'R5', page: 'stride', grade: 'unchecked', claim: 'The Achilles tendon and the arch of the foot store energy on landing and return part of it.', src: 'Ker et al. 1987, Nature 325:147-149' },
  { id: 'R6', page: 'stride', grade: 'unchecked', claim: '19 female forefoot strikers had lower knee loading but higher Achilles tendon force than 19 matched heel strikers, at 4 m/s.', src: 'Kulmala et al. 2013, Med Sci Sports Exerc 45:2306-2313' },
  { id: 'R7', page: 'stride', grade: 'unchecked', claim: 'A review of 53 studies could not tell whether strike pattern changes injury risk; switching to a forefoot strike lowered economy in the short term.', src: 'Anderson et al. 2020, Sports Med 50:885-917' },
  { id: 'R8', page: 'stride', grade: 'unchecked', claim: 'Raising step rate by 5 to 10% at the same speed reduced loading at the knee and hip.', src: 'Heiderscheit et al. 2011, Med Sci Sports Exerc 43:296-302' },
  { id: 'R9', page: 'stride', grade: 'unchecked', claim: 'In one road race, about 89% of 936 runners filmed at the 10 km mark landed heel first.', src: 'Larson et al. 2011, J Sports Sci 29:1665-1673' },

  { id: 'W1', page: 'warmup', grade: 'abstract', claim: 'In more than 1,500 army recruits, adding short static stretches to the warm-up made no meaningful difference to injury risk.', src: 'Pope et al. 2000, Med Sci Sports Exerc' },
  { id: 'W2', page: 'warmup', grade: 'abstract', claim: 'In more than 2,700 runners, a 3 to 5 minute stretch before running neither prevented nor caused injury; runners who switched routines had more injuries (a link, not proof).', src: 'Pereles et al. 2011, AAOS annual meeting (conference report, not a journal paper)' },
  { id: 'W3', page: 'warmup', grade: 'abstract', claim: 'Holds of 60 s or more per muscle just before testing cut performance by about 4.6%, shorter holds by about 1.1%; dynamic stretching gave about +1.3%.', src: 'Behm et al. 2016, Appl Physiol Nutr Metab 41:1-11' },
  { id: 'W4', page: 'warmup', grade: 'abstract', claim: 'A review of 5 trials leaned towards fewer injuries with a warm-up, but the evidence was not conclusive.', src: 'Fradkin et al. 2006, J Sci Med Sport' },
  { id: 'W5', page: 'warmup', grade: 'abstract', claim: 'Pooling 25 trials (26,610 people), stretching programmes showed no clear protective effect; strength training programmes were linked with the biggest drop in injuries.', src: 'Lauersen et al. 2014, Br J Sports Med 48:871-877' },
];

export const CLAIMS = [...CORE, ...START, ...HOW, ...ENGINE, ...TOOLS];


// ---- build-time checks
(function validate() {
  const seen = new Set();
  for (const c of CLAIMS) {
    const where = `claim ${c.id || '(no id)'}`;
    if (!/^[A-Z][0-9]+$/.test(c.id || '')) throw new Error(`${where}: id must look like R5`);
    if (seen.has(c.id)) throw new Error(`${where}: duplicate id`);
    seen.add(c.id);
    if (!GRADES[c.grade]) throw new Error(`${where}: unknown grade "${c.grade}"`);
    if (!pageHref(c.page)) throw new Error(`${where}: unknown page "${c.page}"`);
    if (!c.claim || !c.src) throw new Error(`${where}: needs claim and src`);
    if (c.grade === 'checked') {
      const p = c.passage || {};
      for (const k of ['quote', 'where', 'limits', 'checkedOn']) if (!p[k]) throw new Error(`${where}: a checked claim needs passage.${k}`);
    }
  }
})();

export function claimById(id) {
  const c = CLAIMS.find(x => x.id === id);
  if (!c) throw new Error(`Unknown claim id "${id}". Add it to src/data/claims.js first.`);
  return c;
}

export const claimsFor = page => CLAIMS.filter(c => c.page === page);

/** The path of the page a claim belongs to (its ledger table is there). */
export function claimPage(id) {
  return pageHref(claimById(id).page);
}
