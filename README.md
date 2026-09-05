# softdentalcare.com

Static rebuild of softdentalcare.com. Astro, Tailwind, content in the repo, no CMS,
no WordPress, no database.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the build |
| `npm run check` | Astro type and template check |
| `npm run todos` | Lists every open `TODO-MELANIE` and `TODO-REAL-PHOTO` |
| `npm run redirects:netlify` | Builds `_redirects` from `docs/redirect-map.csv` |
| `npm run redirects:vercel` | Same map as `vercel.json` |
| `npm run redirects:htaccess` | Same map as `.htaccess` |

## Where things live

- `src/data/site.ts` is the single source of truth for address, phone, opening hours and
  the Google Place ID. The footer, the contact page and the structured data all read from
  it. Anything still unknown is `null` there and shows up as a visible TODO in the build.
- `src/pages/` holds one file per URL from the briefing sitemap.
- `src/lib/schema.ts` builds the JSON-LD. Fields that are still `null` are dropped, so no
  placeholder ever reaches the structured data. `aggregateRating` is only emitted when a
  real Google rating has been entered.
- `docs/redirect-map.csv` is the source of truth for the 301 map.
- `docs/pre-launch.md` is the checklist that has to be done before the old site is deleted.

## Ground rules from the briefing

- No invented prices, warranty periods, case numbers, certificates or memberships. Open
  items stay as visible `TODO-MELANIE` markers.
- No medical claims or success rates without a cited source.
- Patient reviews are quoted or embedded, never written or reworded.
- Stock photography is fine for abstract and illustrative subjects. It is not allowed
  anywhere a visitor would read it as the practice, the team or a patient. Those slots use
  `PlaceholderImage` with a `TODO-REAL-PHOTO` marker until real photos exist.
- No dashes in body copy, and no advertising tone. The audience is 55 plus and skeptical.
- No resource may be loaded from another domain, `seconddentalopinion.net` included.

## Still open

- Hosting target, which also decides the redirect format, the contact form endpoint and
  the encrypted x-ray upload for `/second-opinion/`
- Price display: ranges, fixed prices or none
- Photo shoot yes or no
- Self hosted web fonts. Until the font files are in `public/fonts/` with
  `font-display: swap`, the site falls back to the system font stack. No font may be
  loaded from a third party domain.
