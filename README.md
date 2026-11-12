# The Running Atlas

*Working title.* A visual, in-depth guide to running, from a first run to the science underneath it, with 3D you can turn, slow down and explore. Every factual claim on the site is graded by how well it has been checked.

This is the **preview edition**. Pages carry `noindex`, nothing is deployed, and the name, domain and hosting are not decided yet.

## What is here now

| Page | Path | What it has |
| --- | --- | --- |
| Atlas (home) | `/` | Hero runner on the trail, routes by experience, the 11 plates of the atlas |
| The running stride | `/how-running-works/stride/` | 3D stride lab: scrub, slow motion, speed, foot strike, views, ground force chart, cadence tools |
| Warm-up studio | `/strength-mobility-drills/warm-up/` | Nine dynamic warm-up moves in 3D with the muscles they move |
| Evidence ledger | `/library/evidence/` | Every claim on the site, its source and its grade |

## Run it

Needs Node 22.23.4 or newer (see `.nvmrc`).

```sh
npm ci
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run preview  # serve dist/
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
- **MDX** for long prose (`src/articles/`), so articles can use components such as `<Cite />`.
- Dependencies are pinned to exact versions.

```
src/
  pages/         one file per URL
  layouts/       Base.astro: head, header, footer
  components/    Cite, Ledger, Grades
  articles/      MDX prose for each page
  data/          site.js (sections, nav), claims.js (evidence ledger), warmup-moves.js
  scripts/       client code for each page (home, stride, warmup), shared ui.js and sky.js (Day/Dusk)
  lib/mars.js    the Sun at Jezero (from the base), for Day/Dusk
  lib/3d/        rig.js (the figure), gait.js (running model), motion.js (warm-up moves),
                 stage.js (renderer, camera, floor, force arrow), theme.js (Mars colours for Day and Dusk)
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

Every factual claim sits in `src/data/claims.js` and is cited in the page with `<Cite id="R5" />`. The build fails on an unknown id, a duplicate id or a malformed claim.

| Grade | Meaning |
| --- | --- |
| Checked | The exact supporting passage was read in the full source and recorded with its limits |
| Abstract only | Only the summary of the source has been read |
| Not yet checked | The source is named, but no passage has been read and recorded |
| Model | A simplified model or physics rule, labelled as such, not a measurement |

A claim is only **Checked** when it carries `passage: { quote, where, limits, checkedOn }`. Agreement between search results or summaries does not count.

For health and safety content: say plainly when to stop and get checked, give numbers with their study size and limits, and say "a link, not proof" for associations. Pages end with "General information, not medical advice."

### Add a claim

1. Add `{ id, page, grade, claim, src }` to `CLAIMS` in `src/data/claims.js`. Ids are a letter plus a number (R for the stride page, W for warm-up).
2. Cite it in the page or article: `text<Cite id="R10" />` (no space before the tag).
3. The page's ledger and `/library/evidence/` pick it up automatically.

### Add a page

1. Create `src/pages/<section>/<page>.astro` using `Base.astro`.
2. If it has claims, add the page to `LEDGER_PAGES` in `claims.js` and render `<Ledger claims={claimsFor('<page>')} />`.
3. Link it from its section in `SECTIONS` (and `LABS` if it has 3D) in `src/data/site.js`.

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
