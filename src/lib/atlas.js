// The atlas as built: the site map from src/data/site.js joined with the topic pages that exist.
// Use it from page frontmatter (it reads the content collection, so it runs at build time only).
import { getCollection } from 'astro:content';
import { SECTIONS, LABS } from '../data/site.js';

/** Drafts (health pages awaiting clinician review) are built only for the review preview. */
export const SHOW_DRAFTS = process.env.ATLAS_DRAFTS === '1';

export const isDraft = entry => entry.data.review === 'clinician' && !entry.data.cleared;

let cache = null;

/**
 * Every section with its topics resolved. Each topic gets:
 *   state: 'open' (a page anyone can read), 'review' (written, waiting for a clinician) or 'coming' (not written yet)
 *   href:  the page's path when it is built (always for open topics; for review topics only in the review preview)
 *   entry: the content entry, for topic pages
 */
export async function atlas() {
  if (cache) return cache;
  const entries = await getCollection('topics');
  const byId = new Map(entries.map(e => [e.id, e]));
  const known = new Set();
  const sections = SECTIONS.map(s => {
    const topics = s.topics.map((t, i) => {
      const id = `${s.slug}/${t.slug}`;
      known.add(id);
      const entry = byId.get(id) || null;
      if (t.page) return { ...t, id, n: i + 1, section: s, state: 'open', href: t.page, entry: null, summary: t.summary };
      if (!entry) return { ...t, id, n: i + 1, section: s, state: 'coming', href: null, entry: null, summary: null };
      const draft = isDraft(entry);
      return {
        ...t, id, n: i + 1, section: s, entry,
        title: entry.data.title,
        summary: entry.data.summary,
        kind: entry.data.kind,
        state: draft ? 'review' : 'open',
        href: !draft || SHOW_DRAFTS ? `/${id}/` : null,
      };
    });
    const open = topics.filter(t => t.state === 'open').length;
    return { ...s, topics, open, labs: LABS.filter(l => l.section === s.n) };
  });
  for (const e of entries) {
    if (!known.has(e.id)) throw new Error(`src/content/topics/${e.id}.mdx is not listed in SECTIONS in src/data/site.js`);
  }
  const topics = sections.flatMap(s => s.topics);
  cache = { sections, topics };
  return cache;
}

/** The topics that get a page in this build. */
export async function builtTopics() {
  const { topics } = await atlas();
  return topics.filter(t => t.entry && t.href);
}

/** Title and path for each ledger page key: the hand-built pages and every topic page. */
export async function ledgerPages() {
  const { topics } = await atlas();
  const pages = {
    stride: { title: 'The running stride', href: '/how-running-works/stride/' },
    warmup: { title: 'Warm-up studio', href: '/strength-mobility-drills/warm-up/' },
  };
  for (const t of topics) if (t.entry) pages[t.id] = { title: t.title, href: t.href, state: t.state };
  return pages;
}
