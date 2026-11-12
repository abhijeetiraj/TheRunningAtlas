// Topic pages: one MDX file per topic in src/content/topics/<section>/<topic>.mdx, served at /<section>/<topic>/.
// The section and topic must be listed in src/data/site.js, which sets the reading order.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const topics = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    /** The lede under the title: what the page is about, in a sentence or two. */
    summary: z.string(),
    /** Meta description for search and sharing. */
    description: z.string(),
    /** "In short": the page's main points, for a reader who stops at the top. */
    inShort: z.array(z.string()).min(2).max(4),
    /** Reading time in minutes. */
    read: z.number().int().positive(),
    kind: z.enum(['article', 'tool', 'lab']).default('article'),
    /** A 3D lab shown above the article (see LAB in src/pages/[section]/[topic].astro). */
    lab: z.enum(['spring', 'oxygen', 'fibres', 'shoe', 'strength', 'bodymap']).optional(),
    /**
     * Health pages need a clinician's review before they go live. Until `cleared` is true they are drafts:
     * built only when ATLAS_DRAFTS=1 (the preview for review), and listed elsewhere as "In review".
     */
    review: z.enum(['clinician']).optional(),
    cleared: z.boolean().default(false),
    /** The date the page's content was last revised (YYYY-MM-DD). */
    updated: z.coerce.date(),
  }),
});

export const collections = { topics };
