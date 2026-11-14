# Build prompt for Grok 4.7 (Cursor)

Paste this entire file into a **new Cursor Agent chat** with the model set to **Grok 4.7**. Workspace must be this folder (`itws06`). You implement and publish. Do not ask the user to redesign the brand.

---

## Role

You are Grok 4.7 in Cursor, building the **ITWS06 final brand portfolio website** for **Pages & Pour** — an educational bookstore with a coffee shop and study spot.

Build a **fresh one-page interactive portfolio** that is shareable on **Vercel**. Reuse assets and real copy already in this folder. Do not invent business facts.

Before writing UI, read:

1. `ITWS06-Final Requirement (1).docx` — instructor rubric. Self-check against it.
2. Existing sections under `sections/` — source of truth for wording.
3. `site-data.js` — menu and contact. Empty fields stay empty.
4. Visual references: `assets/brand/`, `assets/logos/`, `assets/owners/`, `presentation/`, `_inspo-pages-pour/`.

## Hard rules

- **Never invent** mission, vision, history, products, prices, hours, phone, email, socials, addresses, or owner roles. If a field is empty in `site-data.js` (phone, email, hours, socials), omit it. Address that is already written may be used: **34 Kape St., Brgy. Bookelya**.
- **Summarize** long PT#1 paragraphs. Do not paste walls of text.
- **Do not** use purple-on-white, purple-indigo gradients, Inter/Roboto/Arial as the brand fonts, cream-and-terracotta “AI brochure” layouts, dashboards, pill clusters, or stat strips.
- **Do not** replace the brand with a generic café template. The first screen must read as **Pages & Pour** even if the nav is removed.
- **Do not** depend on `file://`. The live site must work as static files on Vercel (no `fetch()` of local HTML includes unless you compile them into one `index.html` at build time).
- Honor `prefers-reduced-motion: reduce` — disable smooth-scroll inertia and big motion; keep content usable.
- Desktop and mobile must both work. No horizontal page scroll.

## What “done” means (grading)

Score yourself against the instructor rubric before you stop:

| Criteria | Points | What graders look for |
|---|---|---|
| Integration of PTs and CTs | 30 | PT#1, CT#1, CT#2, and CT#3 all present and feel like one brand |
| Layout | 25 | Clean, organized, not cluttered |
| Visual appeal | 25 | Palette, type, and images used on purpose |
| Design flow | 20 | A visitor can tell how the page is ordered |

Submission is **only the published URL**.

## Brand facts you may use (already in the folder)

- Name: **Pages & Pour**
- Description: A bookstore, study spot, and coffee shop. Also: “An Educational Bookstore with a Coffee Shop.”
- Name meaning: **Pages** = books, reading, and learning. **Pour** = coffee, tea, and other drinks.
- Tagline: **One Place. Every Page. Every Pour.**
- Est. **2026**
- Address: **34 Kape St., Brgy. Bookelya**
- Owners (photos only, no invented titles):
  - John Ruzzel V. Sansait — `assets/owners/john.png`
  - Stephanie Claire M. Caingcoy — `assets/owners/stephanie.png`
  - Mark Ian Mudlong — `assets/owners/mark.png`
  - Carlos Aurelius Gervacio — `assets/owners/carlos.png`
- History (summarize, do not expand): students and readers needed one place to buy books, drink coffee, and study, instead of traveling between a bookstore, a café, and a library.
- Mission (keep the meaning, shorten if needed): a comfortable place to read, study, work, and relax with coffee and access to books and learning materials in one visit.
- Vision (keep the meaning, shorten if needed): the neighborhood hub beyond home and school, known for books, brews, and a productive, welcoming atmosphere.
- Facilities already stated: Wi-Fi, charging outlets, printing, photocopying.
- Logo idea already written: a mug on a book, steam like a turning chapter; badge with EST. 2026 and the tagline; coffee-ring seal as the frame.
- First brand post caption (use this text, do not rewrite the offer):

```
One place. Every page. Every pour.

Pages & Pour is open for long chapters and longer sips — coffee, books, and a study space in one room.

Offers you: Coffee | Books | Study Space
Visit us at 34 Kape St., Brgy. Bookelya

#PagesAndPour #ReadSipCreate #StudySpot
```

- Poster: platter promo — buy any book and get an iced drink plus croissant pairing at 20% off for a week. Show palette and typography. **No long explanation.**
- Menu names and PHP prices only from `site-data.js`. Book titles that exist there:
  - Roast & Reason — A Philosophy of Coffee — ₱299
  - Terroir & Tales — A Cultural Journey of Coffee and Lore — ₱320
  - Steeped in Stories — ₱289
  - Sip & Scroll — An Anthology of Café Writing — ₱275
  - Cultivate & Brew — A Journal of Growth and Coffee — ₱249
  - Plus coffee, non-coffee, and pastry rows already listed in that file.

## Design system

Use these tokens. Do not invent a new palette.

```css
:root {
  --coffee: #6b3e2e;
  --mocha: #8b5a3c;
  --caramel: #b8794a;
  --beige: #d8bfa5;
  --cream: #f5ebdd;
  --paper: #f7f0e6;
  --ink: #2b1a14;
  --rust: #8a3f38;
  --wine: #6e3330;
  --steam: #c4a484;
  --white: #fffaf4;
}
```

- Display: **Fraunces** (Google Fonts)
- UI / body: **Outfit**
- Logo CT palette chips (copy-to-clipboard is good): `#6B3E2E` Coffee Brown, `#8B5A3C` Mocha, `#B8794A` Caramel Latte, `#D8BFA5` Warm Beige, `#F5EBDD` Cream Paper
- Brand post palette: `#8A3F38`, `#6E3330`, `#C4A484`, `#F3E6D4`, `#2B1A14`
- Poster palette: `#C47A3A`, `#8B5A3C`, `#D4A574`, `#F5EBDD`, `#2B1A14`
- Paper texture or a quiet grain is fine. Flat single-color pages are not.
- Hero is one composition: brand name as the hero signal, one short line, one CTA group, one dominant visual (seal or a real brand photo). No stats row in the first viewport.

## Information architecture (one page, this order)

1. **Hero** — Pages & Pour, tagline or name meaning, seal `assets/logos/seal-clear.png` or `assets/logos/seal.png`
2. **PT#1 Business concept** — short history, mission, vision. Visual: `assets/products/books/branded-book.png` (do not swap this for a pastry mockup)
3. **Spaces** (supports the concept, keep short) — photos in `assets/spaces/` (`pages.jpg`, `pour.jpg`, `study-spot.jpg`, `counter.jpg`, `creative-corner.jpg`, `printing.jpg`)
4. **Sample products / services** — books, drinks, food, bags from `assets/products/` and menu data. Five transparent book PNGs:
   - `assets/products/books/roast-and-reason.png`
   - `assets/products/books/terroir-and-tales.png`
   - `assets/products/books/steeped-in-stories.png`
   - `assets/products/books/sip-and-scroll.png`
   - `assets/products/books/cultivate-and-brew.png`
5. **Owners** — four portraits, names only
6. **CT#1 Logo** — process in four steps (already written in `sections/logo.html`), show `assets/logos/seal.png`, `pictorial-mark.png`, `badge-lockup.png`, sketches `sketch-mark.png` / `sketch-badge.png` if useful, plus `assets/brand/color-scheme.png`, palette, typography
7. **CT#2 First brand post** — `assets/brand/post.png`, palette, typography, caption with a **Copy caption** button
8. **Engagement** (supporting, not a substitute for CT#2) — `assets/brand/engagement.png`, plus membership cards `assets/brand/membership-card-dark.png` and `assets/brand/membership-card-light.png`
9. **CT#3 Poster** — `assets/brand/poster.png`, palette, typography, almost no copy
10. **Visit** — address and map embed only if contact fields exist. Do not show blank phone/email. A short contact form may store nothing (client-side confirmation only). Do not pretend messages are sent to a server.

Sticky nav with section links. A **coffee-ring / dial scroll progress** indicator (needle or arc driven by scroll) fits the brand. Image lightbox for brand and product photos.

## Motion (required, brand-specific)

Motion should feel like **paper, steam, and a slow pour** — not a tech product landing page.

Implement:

1. **Smooth scroll** with [Lenis](https://github.com/darkroomengineering/lenis) (CDN is fine).
2. **Scroll-linked reveals** with [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/). Three signature moments only:
   - Hero: brand name and seal settle in (seal can rotate a few degrees, like setting a cup down).
   - Logo process: steps reveal in order as the section enters; clicking a step still swaps the active mark.
   - Brand post and poster: the artwork eases up and the spec column fades in after it.
3. **Light parallax** on the hero seal and one story photo. Small movement only.
4. **Coffee dial** in the nav: `--scroll` from 0 to 1 updates an SVG arc or needle. CSS scroll-driven animations are acceptable: [MDN scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations).
5. Hover on owners, books, and logo cards: slight lift, no bounce spam.
6. Lightbox opens centered and does not jump the page to the top.

Skip pin-scroll storytelling, horizontal scroll hijacks, and autoplay video.

## Stack

- Static **HTML + CSS + JS**. One production `index.html` (inline the sections or bundle them). Vite is allowed only if `npm run build` outputs static files Vercel can host with zero config.
- Keep images in the existing `assets/` tree. Do not re-download stock photos.
- No React, no database, no auth.
- Cache-bust is unnecessary on Vercel; clean asset paths are enough.

## Inspiration links (mood and technique only — do not copy another brand)

- Course samples: https://tinyurl.com/5ffwux6m and https://tinyurl.com/2zvsdfb4
- Smooth scroll: https://github.com/darkroomengineering/lenis
- Scroll triggers: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Scroll-driven CSS: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations
- Editorial / café motion mood (do not clone layout or colors): https://www.awwwards.com/websites/sites_of_the_day/
- Deploy: https://vercel.com/docs/deployments/overview and https://vercel.com/docs/cli

Local design files outrank those links when they conflict.

## Publish on Vercel

1. Confirm the site is static and opens correctly via a local static server (`npx serve` or `python -m http.server`), not only `file://`.
2. From the project root, deploy:

```bash
npx vercel --yes --prod
```

If the CLI needs a login, use `npx vercel login` and tell the user to finish it, then rerun the prod deploy.

3. Reply with the **production URL only** as the submission link, plus a one-line note that PT#1, CT#1, CT#2, and CT#3 are on that page.

Do not commit secrets. Do not change git config. Commit only if the user asks.

## Build order

1. Read the docx and the section files listed above.
2. Assemble copy and image paths. Delete nothing in `assets/` that the new page still needs.
3. Build the one-page site and motion.
4. Check desktop and a ~390px mobile width: nav, hero, owners, poster, lightbox.
5. Deploy and return the URL.

## Stop conditions

Stop and ask only if a required image file is missing from disk. Otherwise decide and ship. Do not add sections the rubric does not need if they make the page crowded. Spaces, menu, gallery, engagement, and visit stay only as short supporting bands under the four graded blocks.
