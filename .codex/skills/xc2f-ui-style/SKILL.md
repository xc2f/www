# XC2F UI Style System

## Description

This skill defines the visual language and interaction style for XC2F.

XC2F is not a corporate website, SaaS landing page, or marketing product page.

It should feel like:

- a personal technical lab
- an experimental space
- a future-oriented notebook
- calm and restrained
- technical but artistic
- a quiet dark-room interface where code, signal, and identity coexist

The atmosphere should communicate:

Explore unknown. Create future.

The current homepage is the primary atmospheric reference for the brand,
not a strict layout template.

Current atmospheric references include:

- near-black immersive background
- subtle grid, haze, noise, and vignette
- oversized expressive XC2F wordmark
- restrained coral and soft cyan signal accents
- quiet terminal/code panel
- sparse navigation and footer chrome
- slow breathing motion rather than showy animation

---

# Core Design Principles

- restrained
- technical
- minimal
- exploratory
- calm
- futuristic
- personal
- clear hierarchy
- spacious layout
- atmospheric, but not decorative
- expressive identity, restrained interface

Avoid:

- corporate SaaS feeling
- over-marketing visuals
- template-style AI websites
- excessive cyberpunk aesthetics
- overly decorative UI
- noisy gradients
- visual clutter
- generic shadcn dashboard styling
- boxed product-feature layouts
- bright neon-on-black sci-fi clichés

Design should feel like:

"a personal future lab"
instead of
"a startup landing page".

Artistic expression should emerge from:

- atmosphere
- typography
- spacing
- restraint

—not from excessive visual experimentation.

The expressive identity treatment is reserved primarily for:

- homepage hero sections
- branding moments
- major landing visuals

The rest of the interface should remain restrained and minimal.

---

# Theme System

All UI must support both Light Theme and Dark Theme.

Dark theme is the primary visual language.
Light theme must preserve the same atmosphere without becoming a generic white SaaS interface.

## Dark Theme

Use:

- near-black foundation close to `#06080A`
- dark gray, slate, and blue-black layers
- soft glow
- subtle grid, haze, noise texture, and vignette
- low contrast surfaces
- restrained coral highlights
- soft cyan signal light

Avoid:

- pure black everywhere
- high saturation neon
- aggressive cyberpunk effects
- large saturated gradients
- high contrast panels that fight the atmosphere

The interface should feel calm, breathable, and low-lit.

## Light Theme

Use:

- cool white
- soft gray
- fog-like background tones
- subtle layering
- clean spacing
- muted slate text
- very soft cyan/coral accents

Avoid:

- traditional admin dashboard white
- enterprise SaaS style
- overly flat sterile layouts
- warm cream editorial styling

Light theme should still feel technical and experimental.

Atmospheric effects must never reduce readability or interaction clarity.

Content, navigation, and usability always take priority over visual atmosphere.

---

# Layout Rules

- generous whitespace
- clear visual hierarchy
- avoid crowded sections
- content should breathe
- prefer asymmetrical balance when appropriate
- avoid overly boxed layouts
- use strong first-screen identity moments when appropriate
- keep navigation and footer quiet, sparse, and lightly integrated into the atmosphere

Sections should feel modular and lightweight.

Modular does not mean dashboard-like.

Sections should blend into the surrounding atmosphere rather than feel isolated as separate blocks.

For homepage and identity-led pages:

- preserve the immersive single-scene feeling
- avoid turning the page into stacked marketing sections
- keep the main composition focused on identity plus one technical artifact
- let background atmosphere bridge areas instead of using heavy section dividers

For reading-heavy detail pages such as article/post pages:

- preserve a clear relationship between the hero area and the reading area
- avoid making the body feel like a detached floating card dropped onto the page
- align the reading column with the hero information column whenever possible
- prefer overlap and continuity over hard section breaks
- use atmosphere at the top, then taper gently into a calm reading surface
- keep the main reading width practical and slightly generous, not narrow-editorial and not full-width
- avoid large empty side gutters that make the content feel undersized
- article pages should feel composed, not dramatic

Hero-to-body transitions on detail pages should feel:

- continuous
- lightly layered
- structurally intentional

Avoid:

- abrupt dark-to-light breaks
- heavy bottom shadows under the hero image
- fog bands or gray transition strips between hero and content
- centered body blocks that ignore the hero alignment
- oversized overlap that feels decorative rather than structural

For archive/listing pages such as post indexes:

- keep the page header simpler and shorter than the homepage hero
- preserve atmosphere, but reduce drama
- the listing hero should feel like a page header, not a promotional banner
- align listing metadata and helper text with the first card column
- keep the transition from hero to list direct and calm
- prefer continuity with the page background over strong hero separation

Archive/listing hero-to-list transitions should feel:

- integrated
- lightly atmospheric
- structurally aligned
- quiet

Avoid:

- a large standalone dark panel dropped onto a light page
- a hero that looks detached from the list below it
- floating summary bars that feel like external widgets
- decorative counters or archive stats unless they add real value
- multiple competing metadata rows above the list

---

# Density & Information Balance

Interfaces should feel spacious, but never empty.

Avoid:

- oversized empty gaps
- excessive vertical spacing
- ultra-minimal layouts with weak information density

Balance:

- atmosphere
- usability
- information clarity

The interface should remain expressive while still feeling practical and usable.

---

# Typography

Typography should feel:

- technical
- modern
- readable
- understated

Rules:

- large clean headings for page identity
- expressive display treatment is allowed for XC2F itself
- concise copywriting
- avoid long marketing paragraphs
- use short statements when possible
- English copy may be preferred for hero sections
- uppercase microcopy may be used for labels, status, navigation, and terminal metadata
- monospace is appropriate for code, signal, system, and terminal areas

Preferred tone:

- exploratory
- calm
- thoughtful
- engineering-oriented

Avoid:

- hype marketing language
- startup buzzwords
- overly emotional wording
- verbose explanations of the interface itself

For article detail pages:

- the title may be expressive in scale, but the rest of the text hierarchy should calm down quickly
- metadata should be quiet and secondary
- avoid boxed metadata cards
- prefer a single lightweight metadata row or a minimal inline treatment
- discussion prompts and tail sections should sound like an invitation, not a CTA banner
- supporting copy should be concise, human, and low-pressure

---

# Color System

Prefer semantic color tokens.

Avoid hardcoded colors whenever possible in reusable components.

Homepage-specific atmospheric layers may use carefully chosen values when tokens would reduce precision.

Primary palette direction:

- black
- slate
- zinc
- cool gray
- soft cyan
- muted blue-purple accents
- restrained coral / warm signal orange

Accent colors should remain subtle.

Current homepage atmosphere references:

- base dark: `#06080A`
- coral signal: `#ff8f72`
- cyan signal: `#7dd7ff`
- code green: `#9fe870`
- code amber: `#ffd479`

Use these as atmosphere references,
not as a license to make the UI colorful.

Do not overuse gradients.

Prefer:

- radial haze
- low-opacity glow
- thin light traces

over loud gradient fills.

---

# Cards & Surfaces

Cards should feel:

- lightweight
- subtle
- slightly transparent when appropriate

Rules:

- moderate border radius
- thin borders
- soft shadows only
- subtle glass effect allowed
- avoid heavy glassmorphism
- low contrast against the dark field
- transparent or translucent surfaces are preferred over opaque blocks when readability allows

Homepage-style panels:

- may use larger radius panels
- may include thin inner outlines
- may include soft cyan/coral ambient glow
- should remain quieter than the XC2F identity mark
- should not resemble generic dashboard cards

Reading surfaces for article/detail pages:

- may use a very light container to preserve rhythm and readability
- should feel more like a reading layer than a component card
- should use softer radius, thinner borders, lighter shadows, and lower contrast than homepage panels
- should never appear as a random centered card unrelated to the hero composition
- should avoid thick glassmorphism, strong blur, bright white fills, or obvious panel chrome
- when possible, let the reading surface visually continue the hero column instead of floating independently

Metadata surfaces on article/detail pages:

- default to no background card
- use spacing, microcopy, and fine separators before adding a container
- if a surface is truly needed, it should be extremely quiet

Archive/listing surfaces:

- prefer fewer surfaces than on article pages
- hero support information should usually be text-only
- avoid summary cards, stat cards, or floating info pills by default
- if pagination context is shown above a list, it should read like a quiet note, not a component
- list chrome should not compete with the cards themselves

Discussion / participation surfaces:

- should read like a soft closing note
- should be lighter than cards used in archives or listings
- should invite continuation, not conversion
- avoid button-like blocks unless the page specifically needs strong action emphasis

---

# Motion & Interaction

Animation should be subtle.

Use:

- smooth hover transitions
- soft opacity changes
- slight glow
- lightweight motion
- slow breathing atmosphere
- tiny vertical lift on hover
- gentle terminal cursor or signal pulse
- reduced-motion fallbacks

Avoid:

- large animated effects
- excessive parallax
- distracting transitions
- over-designed interactions
- fast kinetic hero effects
- bouncy product animations

For archive/listing cards:

- avoid hover lift by default
- prefer subtle border, shadow, image-scale, or text-color changes over spatial movement
- cards should feel stable and grounded in the list

Interaction should feel quiet and refined.

---

# Code / Terminal Areas

Code blocks should resemble:

- real editors
- terminal interfaces
- developer tooling

Avoid:

- excessive fake decorations
- too many badges/icons
- cluttered chrome

The code area should remain readable and elegant.

Homepage terminal language:

- low-contrast chrome
- tiny uppercase metadata
- soft scanline or line texture only when subtle
- restrained syntax colors based on existing cyan, coral, green, amber, and cool white
- no fake window traffic lights unless context truly requires them

---

# Branding

Brand symbols:

- XC2F
- XC@F

Both may coexist.

XC@F may be used as a symbolic/logo-style element.
XC2F remains the primary readable site identity.

The homepage wordmark establishes an expressive XC2F treatment:

- very large scale
- slight letter rotation and offset
- ghosted color channels
- grain/noise overlay
- coral on C
- cyan on F
- subdued or outlined treatment for 2
- soft white and low-opacity shadows

Use this treatment selectively.

It is an identity moment,
not a repeating UI pattern.

---

# Implementation Guidance

When optimizing UI:

- preserve existing atmosphere first
- preserve simplicity second
- preserve readability third

Do not redesign sections unnecessarily.

Prefer refinement over replacement.

When uncertain:

less, calmer, cleaner.

When working from the homepage atmosphere:

- keep the low-lit immersive scene
- preserve identity-focused composition unless the task explicitly changes structure
- refine opacity, spacing, hierarchy, and motion before introducing new components
- avoid replacing atmospheric CSS with generic component-library defaults
- preserve transparent header/footer behavior on immersive pages
- keep copy short, signal-like, and thoughtful

When working on article/detail pages:

- keep the hero image visible through the header when the page uses an immersive hero
- solve contrast with light overlays and text treatment before adding solid header blocks
- refine the relationship between title, metadata, reading column, and tail sections as one composition
- prefer removing decoration rather than adding more layers when something feels unnatural
- if a section feels randomly placed, fix alignment and hierarchy first, not surface styling first
- use fewer cards than your first instinct suggests

When working on archive/listing pages:

- start by fixing background continuity before adding more hero decoration
- if the hero feels too visible, reduce contrast before reducing content
- if pagination feels awkward, simplify it before styling it
- keep pagination and archive helper text close to the list they describe
- align helper text with the list column, not merely with the outer container
- bright-page and dark-page versions must use different text contrast rules when needed
- do not force one text color strategy to work for both themes
- if a theme-specific visual treatment feels detached, theme parity does not require visual sameness
- remove optional UI first: counters, chips, separators, and decorative panels should justify themselves

Conflict resolution for future decisions:

- if a design choice improves atmosphere but weakens reading continuity, continuity wins on detail pages
- if a card/surface makes structure clearer but feels detached from the page flow, reduce the card treatment
- if metadata, discussion links, or helper blocks compete with the article body, simplify them until the article remains dominant
- homepage expressiveness is a reference, not a template to copy directly onto post pages

---

# Technical Preferences

Preferred stack assumptions:

- Next.js
- React
- Tailwind CSS
- shadcn/ui
- Framer Motion (minimal usage)

Preferred styling direction:

- semantic tokens
- reusable UI primitives
- responsive by default
- accessible interactions
- dark/light theme parity
- CSS variables for repeated atmospheric values
- `prefers-reduced-motion` support for all ambient animation

---

# Output Behavior

For future UI optimization tasks:

- first evaluate whether the design matches XC2F style
- preserve existing good atmosphere
- improve consistency instead of redesigning everything
- avoid introducing generic SaaS aesthetics
- avoid visual overengineering
- treat the homepage atmosphere as the canonical emotional reference
- make small, intentional refinements before larger redesigns

Every design decision should feel intentional and restrained.
