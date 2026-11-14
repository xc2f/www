---
name: xc2f-ui-style
description: Guide UI design, visual styling, interaction, and Chinese or English copy for the public XC2F website. Apply when evolving the homepage, content archives, article detail, navigation, or shared public components.
---

# XC2F UI Style

XC2F is a personal archive for technical notes, everyday observations, and projects. Aim for a simple, quiet, carefully aligned interface with a playful hand-drawn detail on the homepage. Favor readable type, spacing, thin rules, and selective blue accents. The public site should feel personal through the work and observations it contains.

## Visual system

- Use the current homepage and the article, moments, search, and project pages as references. Their palette lives in `src/app/(frontend)/[locale]/home/home.css`. Reuse the semantic paper, ink, muted, rule, accent, and hover tokens in that file.
- Light theme uses cool near-white paper and dark ink. Dark theme uses deep blue-gray paper and light ink. Reserve blue for links, focus, current navigation, and linework. Check contrast separately in both themes.
- Use the layout's Geist typography and localized fallback fonts. Keep title and supporting text distinct through weight, scale, and spacing. Reserve monospace for code and technical data.
- Use thin dividers and modest corner radii. Use whitespace to group content, and keep visible chrome sparse.
- Write short, concrete Chinese and English copy in `messages/zh.json` and `messages/en.json`. Include a description when it explains what the reader will find or do. Show status and recovery guidance where the action happens.

## Homepage

- Keep the brand in the masthead Logo. The homepage body pairs a small animated line drawing with three entries in order: articles, moments, and projects. The drawing takes the left column on desktop and follows the links on mobile.
- Preserve the homepage's open space and simple structure. Use concise descriptions, thin line icons, and rounded chevrons for the three links. The homepage entries are defined in code and serve a distinct role from the CMS-managed masthead.
- `src/app/(frontend)/[locale]/home/HomeInk.client.tsx` draws recognizable small objects from a rotating selection. Pick a different drawing in adjacent rounds. Vary the speed through curves, let most strokes follow directly, and use occasional short pauses between strokes.
- Keep completed strokes visible during drawing. Once the last stroke lands, give the subject a small movement suited to it, wait for the motion to settle, then clear the whole drawing in one step. When reduced motion is enabled, show a static drawing. Treat the illustration as decorative so links and headings stay usable on their own.

## Content pages

- Prefer `ContentArchive` and `content-archive.css` in `src/app/(frontend)/[locale]/` for single-column indexes. Align the title, description or form, and first item on one edge. Use semantic section headings and lists.
- **Articles:** Start the list close to the page title. Show titles and dates when available, with short summaries and small cover images when the source has them. Keep text-only and illustrated rows in the same rhythm. Use real links for pagination.
- **Article detail:** Use the shared reading column. Place the title, optional summary, date, and category before the cover. Keep the cover shallow on small screens. Render rich text directly in the reading column. Use simple sections for related articles and the GitHub discussion link.
- **Moments:** Keep a short introduction. Use a date column on desktop and place the date above the entry on phones. Keep images with the entry they belong to. Offer a keyboard-operable Load more control alongside automatic loading, with visible loading and retry states.
- **Search:** Place a labeled search field and submit button directly below the heading. Use a GET form and keep the query in the URL. The initial state explains that articles and videos are searchable. Results identify the content type and show the result count or a clear empty state. The clear button clears a committed query and its results and returns focus to the field. Keep form submission and pagination available without JavaScript.
- **Projects:** Use the same reading width and list style. Each entry has a name, a short explanation of its use, and an outward arrow for its external link.

## Shared navigation

- Keep `XC@F` stable on hover. Use subtle color feedback and a visible keyboard focus outline. The masthead Logo links to the localized homepage. Content indexes share this way back.
- Read primary navigation from the localized Payload `Header` global on the server. Keep search as a fixed entry. Use the same short blue line for an active link and active search. The Articles marker also applies to detail and pagination routes. Let hover change color independently of the current marker.
- Keep the footer compact, with a thin divider, configured Payload `Footer` links, language selection, and theme selection. Let controls wrap on narrow screens.
- Preserve real URLs, localized links, semantic landmarks, accessible icon names, and visible keyboard focus. Keep the core pathways readable in server-rendered HTML for browsers and agents.

## Working with existing pages

- Follow the existing page family's requirements and choose a narrow change for each iteration. Video archives and video detail currently still use `ArchiveHero` and `DetailHero`. Use their actual implementation when working on them and the new content pages as references for any redesign.
- Check changed pages in both themes and at narrow and wide widths. Use actual content to verify title wrapping, optional media, hierarchy, keyboard focus, and links. For motion changes, also verify reduced motion. Follow the repository's Payload and TypeScript validation rules in `AGENTS.md`.
