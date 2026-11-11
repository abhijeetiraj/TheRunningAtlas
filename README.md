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

To build for a sub-path, such as GitHub Pages at `/TheRunningAtlas/`, set `BASE_PATH` and `SITE_URL`:

```sh
BASE_PATH=/TheRunningAtlas/ SITE_URL=https://abhijeetiraj.github.io npm run build
```

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
  components/    Cite, Ledger, Grades, Contours, Compass
  articles/      MDX prose for each page
  data/          site.js (sections, nav), claims.js (evidence ledger), warmup-moves.js
  scripts/       client code for each page (home, stride, warmup) and shared ui.js
  lib/3d/        rig.js (the figure), gait.js (running model), motion.js (warm-up moves),
                 stage.js (renderer, camera, floor, force arrow), theme.js (Trail atlas colours)
  styles/        global.css: the Trail atlas look, light and dark
```

## The look: Trail atlas

Paper, ink and a trail blaze, like a printed atlas. Sections are numbered plates; contour lines and a map legend carry the theme.

| Token | Light | Use |
| --- | --- | --- |
| `--paper` | `#f5f3ec` | Page |
| `--ink` | `#15241f` | Text |
| `--blaze` | `#d9480f` | Accent, the trail |
| `--forest` | `#1f4d3a` | Buttons, live links |
| `--lake` | `#2b6cb0` | Ground force, model grade |

Fonts are Fraunces (display), Source Serif 4 (text) and DM Mono (labels), loaded from Google Fonts. Before launch, consider self-hosting them so visitors' browsers do not contact Google.

A dark "night map" theme follows the system setting. The 3D stage always stays on paper so the muscle colours read the same in both themes. 3D colours live in `src/lib/3d/theme.js`.

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
- Hosting (GitHub Pages or Cloudflare Pages both work for a static site). There is no deploy workflow; the CI only builds.
- Clinician and physiologist reviewers for health content
