# Search Console exports

Raw exports, kept unchanged so every target in `docs/redirect-map.csv` can be traced
back to a number.

| File | What it is |
| --- | --- |
| `pages-16months.csv` | Pages report, 16 months, the basis of the redirect map |
| `queries-16months.csv` | Queries, 16 months |
| `pages-3months.csv`, `queries-3months.csv` | The same reports over 3 months, kept for comparison |
| `external-links-sample.csv` | Sample of linking pages from the links report |
| `filters*.csv` | The filter settings each export was taken with |

## What the 16 month export added

Four URLs that the 3 month export did not show, because they had almost no
impressions left this summer:

- `/index.php/privacy-policy-2/`
- `/index.php/dental-implants/`, which exists next to `/index.php/dentalimplants/`
- `/index.php/appointment/`
- `/index.php/price-list/`

That last one matters: the old site did have a price list page at some point. It is
the reason `/prices/` gets a redirect target rather than being a brand new URL.

## External links

Three linking pages are known so far:

- `medicaltourismchat.com/providers/mexico/los-algodones/softdental`
- `vicente-guerrero-bcn.ncamexico.com/softdental/`
- `wheelingit.us`, a 2013 article about dental work in Mexico

The export lists the linking pages but not which URL on softdentalcare.com they point
to. That second half of the report, "Top linked pages", is still needed. Without it we
cannot tell which old URL carries the links, and that is exactly the case where the old
URL takes priority and needs the closest possible content match.

## Still missing

- The "Top linked pages" half of the links report
- A full crawl of the live site and the WordPress sitemap. Pages with zero impressions
  never appear in Search Console, so the inventory is not complete without them.
