# Gary's Gutter Cleaning — Perth

Astro 5 static site served by a Cloudflare Worker, with a D1-backed enquiry inbox.
Its own domain, Worker, database, keys and Search Console property — nothing is
shared with any other site, and it links to no other site.

## Where things live

| What | File |
|---|---|
| Business details, phone, prices, reviews, domain | `site.config.mjs` (one place; empty values simply don't render — Call/Text buttons appear once `phone` is set) |
| Suburb pages (one entry = one page) | `src/data/suburbs.ts` |
| Council fire-notice wording | `src/data/councils.ts` — **re-check every spring** |
| Enquiry API, away mode, push, Places proxy | `worker/index.js` |
| Database schema | `worker/schema.sql` |
| Enquiry form / photo hero | `src/components/EnquiryForm.astro`, `src/components/PageHero.astro` |
| Enquiries inbox (admin) | `src/pages/quote-admin.astro` at `/quote-admin/` |

Suburb URL shape is `/gutter-cleaning-{slug}/`. There is no other suburb URL.
Never add a second page for the same suburb and service.

## Before launch

1. Fill the `TODO`s in `site.config.mjs` (domain, phone/email if any, ABN, legal name, GA id).
2. `npm install`
3. `npm run deploy` once, so the Worker exists.
4. `npm run setup:quotes` — creates the D1 database, applies the schema, sets the
   admin password (saved to `.admin-password.txt`), alert email, Resend key, Places key.
5. `npm run setup:push` — creates this site's own VAPID keys.
6. `npm run deploy` again.
7. Attach the custom domain to the Worker in Cloudflare.
8. **Test on the live domain, end to end:** send an enquiry from a suburb page,
   check the phone alert and the email arrive, find it in `/quote-admin/` and
   move it to Contacted and Booked. Tap Call and Text on a phone. Turn away mode
   on and off from the admin and reload a public page each time (Call/Text
   should disappear and reappear). Send a test alert with the screen off.
9. Search Console: add the domain property, submit `/sitemap-index.xml`.

## Local testing

```bash
npm run build
npx wrangler d1 execute garys-gutter-cleaning-perth-quotes --local --file worker/schema.sql
npx wrangler dev --local
```

Put a local-only `ADMIN_PASSWORD=...` in `.dev.vars` (gitignored). Restart
`wrangler dev` after each `npm run build` — it loses track of `dist/` when Astro
rebuilds it.

## Notes

- The address-only quick quote (live price page, accept flow) was removed on
  the owner's decision in November 2026 and replaced with the enquiry form.
  Melbourne's quick quote booked 154 quotes and 60 jobs, so if enquiry
  numbers disappoint, that system is the first thing to bring back.
- Suburb pages follow the Melbourne layout on purpose (owner's decision,
  November 2026): the logo opens an on-page menu, there is no breadcrumb and
  no homepage link. Because no breadcrumb is shown, no BreadcrumbList schema
  is emitted on those pages — never hide a breadcrumb and keep its schema.
- `public/gutter-cleaning-background.webp` is the Melbourne site's homepage
  photo. Replace it with a Perth job photo when one exists.
- The "What's included" list on suburb pages (`included` in
  `src/pages/gutter-cleaning-[suburb].astro`) must match what the contractor
  actually does on every job.

- All times shown to the operator or customer are Perth time (`Australia/Perth`),
  never the device's zone. WA has no daylight saving; the eastern states do.
- Away mode is CSS keyed off `<html data-away="on">`, stamped by the Worker. It
  hides Call/Text and the phone number and makes every form say when you're
  back; enquiries still come in. It never rewrites or renames anything, so it
  cannot lock the admin out. The away
  state is folded into each page's ETag so browsers don't keep a stale copy.
- Places Autocomplete is biased with a rectangle (Two Rocks to Mandurah, coast
  to Mundaring), because a circle caps at 50 km and Perth is ~150 km long.
