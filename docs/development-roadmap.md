# Mageus development roadmap

Last updated: 13 October 2026

Mageus is an ecommerce + publishing platform: profiles/channels, articles, magazines and groups, audience-building, shops, and direct sales of products and services. Mageus already has shops; this roadmap improves the existing product rather than replacing it with a blank storefront template.

## Product boundaries

- Mageus owns the customer-facing experience: public channels, publishing, articles, moods, magazines/groups, discovery, and storefront presentation.
- Dollareus is the operational commerce engine. When integration begins, Mageus must use authorized Dollareus APIs for products, prices, inventory, orders, and business workflows; it must not access Dollareus tables directly.
- Preserve the existing article and shop experiences while adding improvements incrementally.
- Avoid Tailwind CSS. Prefer the project's existing Angular components and styling conventions unless a specific migration is justified.
- Keep Arabic UI sections RTL-safe: begin Arabic section labels with Arabic text, and ensure mixed Arabic/Latin labels do not flip reading order.

## Phase 1 — stabilize the existing app (current)

- [x] Inspect existing routes and article reader implementation before replacing anything.
- [x] Fix article reading overflow so long articles can scroll inside the reader.
- [x] Add a right-to-left slide-in reader transition and an animated close action returning to the article list.
- [x] Add a keyboard Escape close action, accessible dialog labels, and a reduced-motion fallback.
- [ ] Establish a repeatable production build in CI and fix baseline build errors.
- [ ] Inventory existing shops, profile/channel views, article blocks, and visual moods before redesigning them.

## Phase 2 — improve the article reading and writing system

- [ ] Keep the article list and open article as two states of one navigation experience; preserve the list context when opening and returning.
- [ ] Audit every article block type for reliable rendering, responsive media, accessibility, and stable ordering.
- [ ] Make step-based tutorials (for example recipes and guides) first-class through explicit ordered steps, without assuming every block ID must be globally unique across articles.
- [ ] Improve the editor's add/reorder/preview flow without exposing JSON to creators.
- [ ] Treat product embeds as rich, linked product cards backed by the shop/catalog source of truth.

## Phase 3 — make profiles work like channels

- [ ] Refactor profile sections around a configurable channel identity and clear content/store navigation.
- [ ] Preserve existing profile, article, magazine, and shop routes during migration.
- [ ] Remove the old publication concept only after confirming all its current responsibilities have a replacement.
- [ ] Ensure users can combine publishing and commerce without duplicate product records.

## Phase 4 — magazines, groups, and moods

- [ ] Make magazines/groups feel like purposeful destinations with a clear identity, content structure, membership/audience actions, and useful navigation.
- [ ] Treat moods as reader experiences, not just background themes: examples include glass, stars, and aurora, with readable typography and accessible contrast.
- [ ] Keep mood selection optional and preserve a calm, readable default.
- [ ] Audit mobile behavior and reduced-motion preferences for animated moods.

## Phase 5 — discovery and audience building

- [ ] Improve article discovery, creator/channel navigation, sharing, and follow/subscribe actions.
- [ ] Make loading, empty, error, and unavailable states honest and useful.
- [ ] Avoid fabricated views, sales, or engagement metrics.

## Phase 6 — Dollareus integration

- [ ] Define scoped API connections and authorization for each Mageus shop/channel.
- [ ] Render Dollareus-backed products, menus, prices, and availability in Mageus without duplicating the operational catalog.
- [ ] Send order and booking actions through Dollareus APIs and show their real status.
- [ ] Add integration contract and tenant-isolation checks before enabling customer commerce.

## Working rule

Ship small, coherent changes directly to `main`, keep existing working features intact, and verify the production build before broad refactors. Do not label a phase complete merely because documentation exists; mark implementation and verification separately.
