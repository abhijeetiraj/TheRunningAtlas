# The Running Atlas

*Working title.* A visual, in-depth guide to running, from a first run to the science underneath it, with 3D you can turn, slow down and explore. Every factual claim on the site is graded by how well it has been checked.

This is the **preview edition**. Pages carry `noindex`, nothing is deployed, and the name, domain and hosting are not decided yet.

## What is here now

| Page | Path | What it has |
| --- | --- | --- |
| Atlas (home) | `/` | Hero runner on Mars ground, routes by experience, the 11 sections with their topics, the 3D labs |
| Section pages | `/<section>/` | One per section: what it covers, its topics in reading order (open, in clinician review, or coming), its labs |
| Topic pages | `/<section>/<topic>/` | One per written topic, from `src/content/topics/`: summary, "In short", the article with its tools, the section's other topics, and the page's evidence ledger |
| The running stride | `/how-running-works/stride/` | 3D stride lab: scrub, slow motion, speed, foot strike, views, ground force chart, cadence tools |
| Warm-up studio | `/strength-mobility-drills/warm-up/` | Nine dynamic warm-up moves in 3D with the muscles they move |
| Evidence ledger | `/library/evidence/` | Every claim on the site, its source and its grade |
| Search | `/search/` | Searches every live page (Pagefind); `?q=` fills the box, so a search can be shared |

Written so far: every topic in all eleven sections (74 topic pages), except **Videos from the channel**, which waits
for the channel's links. 25 of them are health pages in clinician review: they are built only by `npm run build:review`
and show as "In clinician review" on the live site. Nine 3D labs: the stride lab and warm-up studio (hand-built pages),
and the Spring lab, Shoe cut-away, Oxygen journey, Muscle fibres, Strength library, Injury body map and Course fly-over
(embedded in their topic pages).

## Run it

Needs Node 22.23.4 or newer (see `.nvmrc`).

```sh
npm ci
npm run dev           # http://localhost:4321
npm run build         # static site in dist/, the search index (dist/pagefind/), then a check that every internal
                      # link and #anchor resolves
npm run build:review  # the same, plus the health pages still in clinician review (for the review preview)
npm run preview       # serve dist/
```

On Jezero Base the atlas is served at `/running/`, from the base repository's `public/running/`. Its door on the
base is the Running Atlas building (`/atlas/`). To build the atlas for that sub-path and copy it in:

```sh
npm run publish:jezero -- /path/to/mywebsite   # build:jezero, then copy dist/ to public/running/ (without 404.html)
```

`npm run build:jezero` alone builds it (`BASE_PATH=/running/ SITE_URL=https://abhijeeti.dev PUBLIC_HOME_URL=`). The
base's build then checks every link, the canonical and share tags on each page, and that the sections its building
lists still exist. Commit the copy in the base repository; only its default branch deploys.

Always build links with `href('/path/')` from `src/data/site.js` so they follow the base path.

## How it is built

- **[Astro](https://astro.build)** makes static HTML. Each page has one small client script; Vite bundles it.
- **[three.js](https://threejs.org)** draws the 3D runner. It loads only on pages with a 3D stage and is shared between them.
- **MDX** for long prose, so articles can use components such as `<Cite />`. Topic pages are an Astro content
  collection (`src/content.config.js`): one `.mdx` file per topic in `src/content/topics/<section>/<topic>.mdx`.
- **The site map** is `SECTIONS` in `src/data/site.js`: sections and topics in reading order. A topic's page appears
  as soon as its `.mdx` file exists; `src/lib/atlas.js` joins the two and works out each topic's state.
- **[Pagefind](https://pagefind.app)** builds the search index after `astro build` (settings in `pagefind.yml`). It
  indexes each page's `<main data-pagefind-body>`; pass `search={false}` to `Base.astro` to leave a page out. The
  search page finds the index relative to itself, so it works at the root, under `/running/` and in a relinked preview.
- Dependencies are pinned to exact versions.

```
src/
  content/topics/  one MDX file per topic, by section (frontmatter: title, summary, description, inShort, read,
                   kind, lab, review, cleared, updated)
  pages/         [section]/index.astro (section pages), [section]/[topic].astro (topic pages), and the hand-built pages
  layouts/       Base.astro: head, header, footer
  components/    Cite, Ledger, Grades, Box (care / try / model asides), TopicLink (links that appear once a page is
                 live), widgets/ (calculators, planners and timers used in articles), labs/ (3D labs embedded in topic pages)
  articles/      MDX prose for each page
  data/          site.js (sections, nav), claims.js + claims/<section>.js (evidence ledger), runwalk.js
                 (the example run-walk plan), warmup-moves.js, courses.js (the Course fly-over's made-up courses)
  lib/atlas.js   the site map joined with the topic pages that exist
  scripts/       client code for each page (home, stride, warmup) and each embedded lab (labs/), shared ui.js and
                 sky.js (Day/Dusk)
  lib/mars.js    the Sun at Jezero (from the base), for Day/Dusk
  lib/3d/        rig.js (the figure), gait.js (running model), motion.js (warm-up moves),
                 stage.js (renderer, camera, floor, force arrow), theme.js (Mars colours for Day and Dusk),
                 mini.js (a small studio stage for the embedded labs)
  lib/springmass.js  the spring-mass model behind the Spring lab
  lib/course.js  the Course fly-over's even-effort pacing plan (scripts/plan.js is the plan builder's rule)
  styles/        global.css: the Jezero Base look, Day and Dusk
```

## The look: Jezero Base

The atlas is part of Abhijeet I.'s portfolio, **Jezero Base** (https://abhijeeti.dev/), a 3D Mars base. It uses the base's look so moving between them feels like one site:

- **Type:** Barlow Condensed (display, uppercase), Barlow (text) and IBM Plex Mono (labels and data), self-hosted from `@fontsource` packages, as on the base.
- **Day and Dusk:** Mars sand and teal by Day, navy and cyan by Dusk. Until the reader picks, the sky follows the Sun at Jezero Crater, worked out with the base's Mars24 code (`src/lib/mars.js`). A pick is stored under the base's own key (`jezero-sky`), so it carries across the whole site. `Base.astro` sets it before the first paint; `src/scripts/sky.js` runs the switch.
- **3D:** the stage is a window onto Jezero. Its sky is a CSS gradient; the runner jogs along rover tracks on red ground with scattered rocks, hazed into the sky by fog. Colours for Day and Dusk live in `src/lib/3d/theme.js`, and the stage recolours when the sky changes.
- **Header:** the base's brand badge links back to the base, and "Olympus Gym" leads back to the gym building.

`PUBLIC_HOME_URL` sets the base's address for those links (default `https://abhijeeti.dev`). Set it to an empty string when the atlas is built into the base itself, so links stay on whichever host serves the page.

## Evidence rules

Every factual claim sits in the ledger (`src/data/claims.js` for the hand-built pages, `src/data/claims/<section>.js` for topic pages) and is cited in the page with `<Cite id="R5" />`. The build fails on an unknown id, a duplicate id, a malformed claim or a claim whose page is not in the site map.

| Grade | Meaning |
| --- | --- |
| Checked | The exact supporting passage was read in the full source and recorded with its limits |
| Abstract only | Only the summary of the source has been read |
| Not yet checked | The source is named, but no passage has been read and recorded |
| Model | A simplified model or physics rule, labelled as such, not a measurement |

A claim is only **Checked** when it carries `passage: { quote, where, limits, checkedOn }`. Agreement between search results or summaries does not count.

For health and safety content: say plainly when to stop and get checked, give numbers with their study size and limits, and say "a link, not proof" for associations. Pages end with "General information, not medical advice."

**Clinician review.** A topic with `review: clinician` in its frontmatter is a draft until a clinician has checked it and `cleared: true` is set. Drafts are built only by `npm run build:review` (for the review preview), with a "Draft for clinician review" note. On the live site they are listed as "In clinician review", links to them (`<TopicLink>`) show as plain text, and their claims stay out of the evidence ledger.

### Add a claim

1. Add `{ id, page, grade, claim, src }` to the section's file in `src/data/claims/` (or to `claims.js` for the stride and warm-up pages). `page` is the topic id, such as `start-running/first-run`. Ids are a letter plus a number: R stride, W warm-up, S start running, H how running works, E the engine, T training, M strength and mobility, F fuel, I injuries, D different runners, C racing, P tools, L library.
2. Cite it in the page or article: `text<Cite id="R10" />` (no space before the tag).
3. The page's ledger and `/library/evidence/` pick it up automatically.

### Add a topic page

1. Check the topic is listed under its section in `SECTIONS` in `src/data/site.js` (that sets its slug and place).
2. Create `src/content/topics/<section>/<slug>.mdx` with the frontmatter in `src/content.config.js`. Health pages get
   `review: clinician`.
3. Write the article. Link other topics with `<TopicLink to="<section>/<slug>" />`, never a bare path, so links to
   unwritten or unreviewed pages stay plain text. Put asides in `<Box kind="care|try|model|note">`.
4. Add its claims to `src/data/claims/<section>.js` and cite them. The page's ledger is added automatically.

Smaller 3D labs sit at the top of a topic page: put the component in `src/components/labs/`, add it to `LAB` in `src/pages/[section]/[topic].astro`, set `kind: lab` and `lab: <name>` in the page's frontmatter (the names are listed in `src/content.config.js`), and give its entry in `LABS` (`src/data/site.js`) a `topic`. Its claims go in the section's claims file like any other.

Hand-built pages (big 3D labs with a page of their own) go in `src/pages/<section>/<page>.astro` with `page: '/path/'` on their topic in `SECTIONS`; if they have claims, add them to `LEDGER_PAGES` in `claims.js`.

## The running model

The stride lab uses a simple model of a typical recreational runner, not measurements. For speed `v` in m/s:

- cadence = 146 + 8v steps per minute
- ground contact = 0.09 + 0.5 / v seconds
- step length = v × step time; float = step time − contact
- vertical bounce = 0.095 − 0.006v metres

At 3.3 m/s that gives 5:03 per km, 172 steps per minute, a 1.15 m step, 242 ms contact and 107 ms float. Peak ground force follows from the fact that average force over a step is one body weight: for a smooth curve, peak ≈ π/2 × (step time ÷ contact time) × body weight.

## Not decided yet

- Name and domain
- Launch: the atlas is ready to sit at abhijeeti.dev/running/ inside Jezero Base, but stays a preview (`PREVIEW` in
  `src/data/site.js`: a Preview badge and `noindex`) until the name and reviewers are settled. There is no deploy
  workflow here; the CI only builds.
- Clinician and physiologist reviewers for health content
