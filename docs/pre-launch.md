# Pre launch checklist

Order matters: back up first, then build, then delete.

## 1. Secure the old installation, before anything is switched off

- [ ] Full backup: file system plus database dump, stored locally, kept for at least six
      months after launch
- [ ] Complete media library downloaded, including images not currently in use
- [ ] All page texts exported as Markdown, crawled from the front end and converted, not
      retyped
- [ ] URL inventory from all three sources: full crawl, WordPress sitemap, Search Console
      export (pages report over 16 months plus "Links to your site")
- [ ] Inventory merged into `docs/redirect-map.csv`: old URL, impressions, clicks,
      external links yes or no, new target
- [ ] `contacto@softdentalcare.com` checked. If the mailbox sits with the current host,
      the MX records must not be moved or deleted during the migration

## 2. Content and legal

- [ ] Every item from `npm run todos` either filled in or consciously signed off
- [ ] Second opinion wording reviewed by a lawyer
- [ ] Privacy policy covers the x ray upload, its retention period and access
- [ ] Before and after images only with documented written consent

## 3. Acceptance criteria

- [ ] No resource loaded from a third party domain
- [ ] No broken internal link, verified with a crawler over the whole site
- [ ] Every old URL 301s to a matching new page, no blanket redirect to the homepage,
      sample of at least ten old URLs documented
- [ ] Full backup secured before anything is deleted, email delivery tested after the move
- [ ] Lighthouse mobile: performance and accessibility at least 90 each
- [ ] Structured data passes the Rich Results Test without errors
- [ ] The positioning statement sits above the fold on the homepage and is picked up on at
      least three further pages
- [ ] No placeholder image and no TODO left at launch, or a signed off remainder list
- [ ] Address, phone number and opening hours match the Google Business Profile character
      for character
