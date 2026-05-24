# XC2F UI Style System

## Description

This skill defines XC2F's long-term visual language, interaction style, and copy tone.

XC2F is not a corporate website, SaaS landing page, admin dashboard, or marketing product page.

It should feel like:

- a personal technical lab
- an experimental notebook
- a quiet future-facing archive
- calm, restrained, and exploratory
- technical, but not cold
- atmospheric, but not decorative
- personal, but not diaristic in a sentimental way

The guiding phrase is:

Explore unknown. Create future.

The current homepage, posts archive, post detail, search, and moments pages are the primary visual references. Preserve their shared atmosphere before introducing new UI patterns.

---

## Current Page References

### Homepage

The homepage is the strongest identity moment.

Current traits:

- immersive single-scene composition
- near-black dark-room foundation around `#06080A`
- foggy cool-white light mode around `#f8fbfc`
- oversized expressive `XC2F` wordmark
- subtle letter rotation, offsets, channel ghosts, grain, and soft stroke treatment
- coral signal on `C`, cyan signal on `F`, subdued or outlined `2`
- restrained technical subtitle and status line
- one quiet terminal/code artifact beside the identity
- sparse header and footer integrated into the atmosphere
- radial haze, grid, noise, vignette, and slow breathing motion

Use the homepage treatment selectively. It is an identity scene, not a general component recipe.

### Posts Archive

The posts archive establishes the listing-page pattern.

Current traits:

- short atmospheric archive hero, not a landing-page hero
- light theme uses fog-like white, cool gray, and low-contrast slate text
- dark theme uses black-to-blue-black gradients with the same restrained signal haze
- grid, noise, vignette, top fade, and bottom fade bridge the hero into the list
- mono uppercase eyebrow such as `XC2F / POSTS`
- large but controlled title, around `clamp(2.35rem, 6vw, 4.25rem)`
- concise two-line description
- quiet pagination/range note aligned with the first card column
- card grid in 4/8/12-column structure
- cards are stable, image-led, softly layered, and only gently interactive

Archive pages should feel like a calm catalog of signals, not a marketing index.

### Post Detail

Post detail pages establish the reading pattern.

Current traits:

- dark immersive image hero begins behind the transparent header
- hero uses grid, noise, vignette, coral/cyan radial signal, and image overlays
- category chips are quiet mono capsules, not loud tags
- title is large, expressive, and low-tight in tracking
- summary and published metadata are secondary and soft
- body overlaps the hero slightly and continues the hero column
- reading layer is translucent and calm, not a detached card
- reading width is generous but practical
- related posts and discussion areas use thin separators and soft closing-note surfaces

Detail pages should feel composed and continuous: atmosphere above, readable layer below.

### Search

Search shares the archive-page atmosphere, with the search field embedded in the hero.

Current traits:

- same fog/black atmospheric archive hero system as posts
- title and helper copy align to a grid column
- search input sits below intro copy in the same column structure
- input is a translucent rounded surface with a tiny icon and quiet focus state
- results range appears close to the list and aligned with the search column
- results use the same card archive language as posts

Search should feel like querying the archive, not like a utility page bolted onto the site.

### Moments

Moments shares the archive intro but uses a feed/timeline body instead of cards.

Current traits:

- same atmospheric archive hero as posts/search
- feed begins close to the hero with minimal transition
- timeline rail appears only from medium screens upward
- entries use time, mood, title, rich text, and optional image grid
- text content stays quiet and readable
- images use rounded, compact mosaic tiles
- image hover is limited to a very slight scale
- separators are fine gradient rules rather than heavy cards

Moments should feel like field notes from the lab: temporal, lightweight, and observational.

---

## Core Principles

- restrained
- technical
- minimal
- exploratory
- calm
- future-oriented
- personal
- readable
- spacious
- atmospheric with purpose
- expressive identity, restrained interface

Avoid:

- corporate SaaS feeling
- startup landing-page tropes
- generic shadcn dashboard styling
- template-like AI website patterns
- loud cyberpunk aesthetics
- bright neon-on-black clichés
- noisy gradients
- excessive cards, chips, badges, and counters
- boxed product-feature layouts
- decorative UI that does not clarify structure

Design should feel like:

"a personal future lab"

not:

"a startup landing page".

Artistic expression should come from atmosphere, typography, spacing, and restraint, not from adding more components.

---

## Theme System

All UI must support both light and dark themes.

Dark theme is the primary emotional reference. Light theme must preserve the same foggy technical atmosphere without becoming a generic white SaaS interface.

### Dark Theme

Use:

- near-black foundations close to `#06080A`
- black, slate, zinc, and blue-black layers
- soft glow and radial haze
- subtle grid, noise, and vignette
- restrained coral highlights
- soft cyan signal light
- low-contrast translucent surfaces

Avoid:

- pure flat black everywhere
- high-saturation neon
- aggressive cyberpunk effects
- large loud gradients
- high-contrast panels that fight the atmosphere

Dark theme should feel low-lit, breathable, and precise.

### Light Theme

Use:

- cool white and fog-like gray
- soft slate text
- subtle layering
- low-contrast shadows and borders
- muted cyan/coral signal accents
- atmospheric gradients that taper into white

Avoid:

- plain white enterprise dashboard styling
- sterile flat UI
- warm cream editorial styling
- copying dark-theme contrast rules directly into light mode

Light theme should feel like a bright lab fog, not a product dashboard.

Theme parity does not require identical visuals. It requires equivalent atmosphere, hierarchy, and usability.

---

## Layout Rules

Use:

- generous but purposeful whitespace
- clear visual hierarchy
- asymmetrical balance where it improves atmosphere
- quiet navigation and footer chrome
- modular sections that blend into the surrounding field
- direct transitions from hero to content

Avoid:

- crowded sections
- oversized empty gaps
- heavy standalone panels
- hard section breaks unless the content truly needs them
- center-aligned blocks that ignore the page's grid logic
- decorative counters or archive stats unless they add real value

Homepage layout:

- preserve the immersive single-scene feeling
- keep the composition focused on identity plus one technical artifact
- avoid stacking generic marketing sections
- let background atmosphere bridge the whole viewport

Archive/search/moments layout:

- keep the hero shorter and calmer than the homepage
- align intro copy, search controls, range notes, and first content column intentionally
- keep helper text close to the content it describes
- transition from hero to list/feed with continuity, not a strong divider

Post detail layout:

- keep the hero image visible through the header
- align reading content with the hero information column
- prefer slight overlap and continuity over detached cards
- keep reading width practical and slightly generous
- taper atmosphere into readability rather than abruptly switching modes

---

## Typography & Copy

Typography should feel:

- technical
- modern
- readable
- understated
- human without becoming chatty

Use:

- large clean headings for page identity
- expressive display treatment only for major identity moments
- medium-weight titles with tight negative tracking
- mono uppercase microcopy for labels, metadata, status, category chips, and terminal chrome
- concise descriptions, often one or two short lines
- English where it strengthens identity or signal language
- Chinese copy that remains short, calm, and precise

Avoid:

- hype marketing language
- startup buzzwords
- verbose explanations of the interface
- overly emotional CTA copy
- metadata presented as boxed widgets

Article detail copy:

- let the title be expressive, then calm the hierarchy quickly
- keep metadata secondary
- make discussion prompts feel like invitations, not conversion banners

Moments copy:

- treat entries as field notes
- preserve directness and observation
- avoid over-polishing into marketing prose

---

## Color System

Prefer semantic tokens in reusable components. Page-specific atmospheric layers may use explicit values when precision matters.

Primary palette direction:

- black
- slate
- zinc
- cool gray
- fog white
- soft cyan
- restrained coral / warm signal orange
- occasional code green and amber in terminal/code contexts

Reference values:

- base dark: `#06080A`
- coral signal: `#ff8f72`
- cyan signal: `#7dd7ff`
- code green: `#9fe870`
- code amber: `#ffd479`

Use these as signal references, not permission to make the UI colorful.

Prefer:

- radial haze
- low-opacity glow
- thin light traces
- subtle translucent overlays

Avoid:

- loud gradient fills
- saturated rainbow accents
- strong color-coded UI unless it communicates state

---

## Surfaces & Components

Surfaces should feel lightweight, layered, and quiet.

Use:

- moderate-to-large radius where it already exists
- thin borders
- low-opacity backgrounds
- soft shadows
- subtle backdrop blur when useful
- inset rings or top highlights sparingly

Avoid:

- heavy glassmorphism
- bright opaque white panels in atmospheric contexts
- generic dashboard cards
- excessive badges, pills, and stat blocks
- nested surfaces that make the page feel busy

### Homepage Panels

Homepage panels may be more atmospheric:

- larger radii
- thin inner outlines
- terminal-like chrome
- soft cyan/coral ambient glow
- scanline or noise texture only when subtle

They should remain quieter than the `XC2F` identity mark.

### Archive Cards

Archive cards should be stable and image-led:

- rounded card around `1.4rem`
- thin light/dark border
- gradient surface instead of flat fill
- image or generated atmospheric placeholder
- subtle image scale on hover
- border/shadow/text-color hover changes over spatial movement
- compact mono metadata row at the bottom

Avoid hover lift by default on archive cards.

### Reading Surfaces

Reading surfaces may use a light translucent container for rhythm and readability:

- softer radius
- thinner borders
- lighter shadows
- lower contrast than homepage panels
- visually connected to the hero

They should not feel like a random centered card dropped onto the page.

### Search Inputs

Search inputs should feel like archive instrumentation:

- rounded translucent surface
- quiet search icon
- no heavy button chrome
- soft focus border and shadow
- no aggressive autocomplete or command-palette styling unless explicitly required

### Moments Feed

Moments feed should stay lighter than archive cards:

- timeline rail on wider screens
- fine gradient separators
- no enclosing card around each entry by default
- image mosaic tiles with compact gaps and rounded corners
- minimal hover motion

---

## Motion & Interaction

Animation should be subtle and slow enough to feel atmospheric.

Use:

- smooth hover transitions
- soft opacity changes
- slight glow
- slow breathing atmosphere
- tiny image scale
- gentle terminal cursor or signal pulse
- reduced-motion fallbacks

Avoid:

- large animated effects
- excessive parallax
- bouncy product animations
- fast kinetic hero effects
- hover motion that makes lists feel unstable

Interaction should feel quiet, refined, and grounded.

---

## Code / Terminal Areas

Code and terminal areas should resemble real developer tooling without fake clutter.

Use:

- low-contrast chrome
- tiny uppercase metadata
- restrained syntax colors
- readable monospace code
- soft scanline or line texture only when subtle
- minimal cursor/signal pulse

Avoid:

- excessive fake decorations
- too many badges/icons
- fake window traffic lights unless context truly needs them
- novelty terminal styling

---

## Branding

Brand symbols:

- `XC2F`
- `XC@F`

Both may coexist.

`XC2F` is the primary readable site identity. `XC@F` may be used as a symbolic/logo-style element.

The homepage wordmark establishes the expressive `XC2F` treatment:

- very large scale
- slight letter rotation and offset
- ghosted color channels
- grain/noise overlay
- coral on `C`
- cyan on `F`
- subdued or outlined `2`
- soft white and low-opacity shadows

Use this treatment only for identity moments, branding scenes, or major landing visuals. Do not repeat it as routine UI decoration.

---

## Implementation Guidance

When optimizing UI:

1. Preserve usability and readability.
2. Preserve the existing atmosphere.
3. Preserve simplicity.
4. Refine before replacing.

When uncertain:

less, calmer, cleaner.

Practical guidance:

- prefer removing optional UI before adding new decoration
- fix alignment and hierarchy before adding surface styling
- fix background continuity before adding hero decoration
- keep copy short, signal-like, and thoughtful
- use theme-specific contrast rules when needed
- do not force one text color strategy to work for both themes
- avoid replacing atmospheric CSS with generic component-library defaults
- preserve transparent header behavior on immersive homepage and post detail pages
- regenerate import maps after adding or modifying Payload admin components
- run `tsc --noEmit` after TypeScript changes
- run Payload type generation after schema changes

For archive/search/moments pages:

- reuse the established atmospheric archive hero pattern unless there is a strong reason not to
- keep pagination/range/helper text quiet and close to the content
- keep cards/feed entries stable and grounded
- do not add summary cards, counters, or extra chips by default

For post detail pages:

- solve header/hero contrast with overlays and text treatment before adding solid header blocks
- keep the reading layer visually connected to the hero
- avoid abrupt dark-to-light breaks
- use fewer cards than your first instinct suggests
- make tail sections feel like soft continuation, not CTA modules
