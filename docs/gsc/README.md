# Search Console exports

Raw exports, kept unchanged so every target in `docs/redirect-map.csv` can be traced
back to a number.

- `pages-3months.csv`, `queries-3months.csv`, `filters.csv`
  Performance report, search type Web, exported 2026-09-07, **last 3 months only**.

## Still missing

The briefing asks for two exports that are not in here yet:

1. **Pages report over 16 months.** Three months only shows what still ranked this
   summer. A URL that had traffic a year ago and nothing since is invisible here and
   would silently lose its redirect.
2. **The "Links to your site" report.** Without it we cannot tell which old URL carries
   external backlinks, and that is the one case where an old URL gets priority and the
   closest possible content match.

Even both together are not the full inventory. Pages with zero impressions never appear
in Search Console, so the crawl of the live site and the WordPress sitemap are still
needed before the map is complete.
