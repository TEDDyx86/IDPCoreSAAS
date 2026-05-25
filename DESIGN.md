---
name: IDP Core
description: Autonomous academic intelligence dashboard for high-performing students
colors:
  plasma: "#00d4ff"
  violet-current: "#a347ff"
  cerulean: "#1a8cff"
  success: "#00ff95"
  error: "#ff3333"
  bg-onyx-deep: "#020203"
  bg-onyx: "#050506"
  bg-onyx-soft: "#09090b"
  text-main: "#fafeff"
  text-dim: "#bcbcc2"
  text-ghost: "#6d6d78"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 600
    letterSpacing: "0.02em"
rounded:
  xs: "8px"
  sm: "14px"
  md: "24px"
  lg: "36px"
  full: "100px"
  quiz: "40px"
spacing:
  sm: "1.5rem"
  md: "2.5rem"
  lg: "3.5rem"
components:
  button-primary:
    backgroundColor: "rgba(255,255,255,0.05)"
    textColor: "{colors.text-main}"
    rounded: "{rounded.full}"
    padding: "0.8rem 1.8rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.text-main}"
    textColor: "{colors.bg-onyx-deep}"
    rounded: "{rounded.full}"
    padding: "0.8rem 1.8rem"
  button-quiz-confirm:
    backgroundColor: "{colors.text-main}"
    textColor: "{colors.bg-onyx-deep}"
    rounded: "18px"
    padding: "1.25rem 3rem"
  button-quiz-primary:
    backgroundColor: "#2563eb"
    textColor: "{colors.text-main}"
    rounded: "18px"
    padding: "1.25rem 3rem"
  input-default:
    backgroundColor: "rgba(255,255,255,0.02)"
    textColor: "{colors.text-main}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.25rem"
  badge-plasma:
    backgroundColor: "rgba(0,212,255,0.10)"
    textColor: "{colors.plasma}"
    rounded: "20px"
    padding: "6px 14px"
    typography: "{typography.label}"
  badge-violet:
    backgroundColor: "rgba(163,71,255,0.10)"
    textColor: "{colors.violet-current}"
    rounded: "20px"
    padding: "6px 14px"
    typography: "{typography.label}"
  badge-cerulean:
    backgroundColor: "rgba(26,140,255,0.10)"
    textColor: "{colors.cerulean}"
    rounded: "20px"
    padding: "6px 14px"
    typography: "{typography.label}"
---

# Design System: IDP Core

## 1. Overview

**Creative North Star: "The Intelligence Forge"**

Raw academic material enters; distilled intelligence exits. The dashboard is not the process, it is the output surface. The system has already done its work in the background, monitoring platforms, parsing documents, generating summaries. When the student opens IDP Core, the hard part is done. The interface exists to make that truth visible.

This means surfaces are restrained almost to the point of disappearance. Near-void backgrounds (lightness 1–4%) make every lit element intentional. Three precision accents — Plasma, Violet Current, Cerulean — operate as semantic signals: they mark interaction, categorization, and information, never decoration. Glass cards earn their transparency by revealing the aurora beneath, not by being stylistically interesting on their own terms.

The system explicitly rejects two failure modes. The first is the institutional LMS aesthetic: Moodle beige, Canvas blue, dense tables, no visual hierarchy, educational-software dated look. That aesthetic insults the intelligence of an ambitious student. The second is the crypto dashboard mode: neon on black with no restraint, purple gradients saturating every surface, stat panels stacked with glowing numbers for their own sake. High energy does not mean visual noise. Restraint is the difference between premium and chaotic.

**Key Characteristics:**
- Extreme dark ground: backgrounds between Onyx Deep (#020203) and Onyx Soft (#09090b)
- Three-accent discipline: each color assigned one semantic role and held to it
- Precision minimal: every surface earns its opacity; rest state is near-invisible
- Typographic authority: Outfit at display sizes, Inter for legible body prose
- Motion communicates system state, not aesthetic intent
- Gamification delivered with restraint: feedback through color shift, not fanfare

## 2. Colors: The Void and the Signal

Three precision signals against a near-void ground. The palette is not minimal by accident; it is minimal because the student's attention belongs on the content, not the chrome.

### Primary
- **Plasma** (`#00d4ff`, OKLCH ~83% 0.18 195): The neon cyan that marks primary interactive surfaces. Appears on hover borders (`.glass-hover`), input focus rings, primary call-to-action states, and timeline glow dots. Rarity is the point: Plasma at rest means something is wrong. Every screen should read mostly dark until the eye needs to act.

### Secondary
- **Violet Current** (`#a347ff`, OKLCH ~57% 0.26 296): Category and secondary content signal. Used for module-type badges, the secondary aurora radial gradient, and second-tier interactive elements. Never used as a primary action color.

### Tertiary
- **Cerulean** (`#1a8cff`, OKLCH ~61% 0.19 246): Informational state color. Carries the "system is telling you something" semantic: quiz selection state, meta labels (`.quiz-meta-label`), the third aurora radial gradient. Appears in explicit information contexts only.

### Neutral
- **Onyx Deep** (`#020203`): Page background. The deepest layer. Near-void.
- **Onyx** (`#050506`): Raised surface background. Cards and containers at rest.
- **Onyx Soft** (`#09090b`): Elevated surface. Used for hover states and active container backgrounds.
- **Pure Signal** (`#fafeff`): Primary text. Near-white with the faintest cool tint.
- **Dim Signal** (`#bcbcc2`): Secondary text: metadata, timestamps, section subtitles.
- **Ghost Signal** (`#6d6d78`): Tertiary text: placeholders, disabled, decorative labels. Not for body copy.

### Semantic
- **Confirm** (`#00ff95`): Quiz correct state. System success feedback. Appears only on positive outcome states.
- **Reject** (`#ff3333`): Quiz wrong state. Error feedback. Appears only on negative outcome states.

### Named Rules

**The Precision Accent Rule.** Plasma, Violet Current, and Cerulean are semantic signals, not fills. Using any of them as a surface background, decorative border, or gradient ingredient contradicts the system. When in doubt, no accent.

**The Void Foundation Rule.** Backgrounds live between Onyx Deep (#020203) and Onyx Soft (#09090b). No lighter dark tones. Brightness is reserved for text and accent signals only.

**The Aurora Rule.** The three accents exist in the background aurora at opacity 0.03–0.08, providing atmospheric color that leaks through glass surfaces. This is their only decorative use. On any rendered surface, they are interactive or informational.

## 3. Typography

**Display Font:** Outfit (Google Fonts; weights 300, 400, 600, 700, 800)
**Body Font:** Inter (Google Fonts; weights 300, 400, 500, 600, 700)

**Character:** Outfit carries authority and scale. Its geometric letterforms read as purposeful and sharp at large sizes, fitting for a system that has done serious computational work. Inter provides legibility at body scale; its humanist proportions prevent the cold machine-feel a geometric face produces at small sizes. Together they describe a tool with editorial ambitions.

### Hierarchy

- **Display** (Outfit 700, `clamp(2.5rem, 6vw, 4rem)`, line-height 1.1, letter-spacing -0.02em): Page-level identity. The dashboard's section hero headings, login title, lesson title. One Display heading per view maximum.
- **Headline** (Outfit 600, 1.35rem, line-height 1.3, letter-spacing -0.02em): Section headings within a view: course section labels, config panel titles, summary section headers.
- **Title** (Outfit 600, ~1.1rem, line-height 1.3): Card-level headings, quiz question labels. Not used in global CSS directly; emerges from component-level type decisions.
- **Body** (Inter 400, 0.95rem, line-height 1.6): All prose content including AI-generated summaries. Max line length 65–75ch. The `.prose-custom` class adds 1.8 line-height for long-form reading contexts.
- **Label** (Inter 600, 0.7rem, letter-spacing 0.02–0.30em, uppercase): Badges, status chips, quiz meta labels. The `.quiz-meta-label` class pushes tracking to 0.30em for maximum micro-label authority.

### Named Rules

**The Display-Only Rule.** Outfit appears at 1.35rem and above. Below that, Inter handles everything. Outfit at caption or body sizes produces the generic SaaS tool feel the system rejects.

**The Prose Max-Width Rule.** AI-generated summary text (`.prose-custom`) must be constrained to 65–75ch. Running full-column width breaks legibility and makes the summary feel machine-dumped rather than curated.

## 4. Elevation

This system is dark-tonal: depth comes from opacity layering, not shadow stacking. Surfaces are semi-transparent glass planes hovering over the Onyx Deep void. The aurora background radiates through each glass plane, creating a sense that surfaces float rather than sit. This is the only reason glassmorphism is used here; it is structural, not stylistic.

Two shadow exceptions exist. The ambient drop adds physical weight to major card surfaces. The Plasma glow appears exclusively on hover as a colored radiance, confirming interaction. Neither appears at rest for decorative purposes.

### Shadow Vocabulary

- **Ambient Drop** (`box-shadow: 0 20px 50px -15px rgba(0,0,0,0.5)`): Applied to all `.glass-card` surfaces at rest. Provides structural depth without calling attention to itself.
- **Plasma Glow** (`box-shadow: 0 0 40px -10px rgba(0,212,255,0.20)`): Hover state only on interactive glass cards. Communicates "this surface responds." Never at rest.
- **Quiz Vault** (`box-shadow: 0 40px 120px rgba(0,0,0,0.90)`): Quiz overlay container exclusively. Maximum depth for the focus-mode interface, signaling that the user has entered a dedicated cognitive task.

### Named Rules

**The Glow-On-Hover Rule.** The Plasma glow shadow appears only on hover, never at rest. A glowing surface at rest means accent is doing decorative work it must not do.

**The Aurora-Or-Nothing Rule.** Backdrop-filter blur (`40px`) is justified only where the aurora gradient layer is visible underneath. On opaque or off-screen surfaces, apply no blur.

## 5. Components

### Buttons

Pill-shaped containers (100px border-radius), near-invisible at rest, white-inverted on hover. The inversion communicates binary confirmation: you asked the system to act, and it will.

- **Shape:** Full pill (`border-radius: 100px`)
- **Primary at rest (`.premium-btn`):** background `rgba(255,255,255,0.05)`, border `1px solid rgba(255,255,255,0.10)`, white text, padding 0.8rem 1.8rem, Inter 500, 0.85rem
- **Hover:** background white, text black, `scale(1.03)`, transition `cubic-bezier(0.16,1,0.3,1) 0.4s`
- **Disabled:** `opacity: 0.2`, cursor not-allowed implied
- **Quiz Confirm (`.quiz-main-btn`):** white fill, black text, `border-radius: 18px`, uppercase, 0.05em tracking. More squared than the pill — signals a definitive action, not a navigation choice.
- **Quiz Primary (`.quiz-main-btn.primary`):** `#2563eb` fill, white text, same 18px radius, with `0 10px 40px rgba(37,99,235,0.3)` glow shadow.

### Cards / Containers

Glass planes over the void. Every surface earns its opacity. At rest: near-invisible. On hover: slightly more present, with Plasma border shift and glow.

- **Corner Style:** Gently curved (24px, `--radius-md`)
- **Background:** `rgba(255,255,255,0.02)` with 40px backdrop blur
- **Border:** `1px solid rgba(255,255,255,0.05)` with an inset top-edge highlight: `linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)` at 1px height
- **Shadow at rest:** Ambient Drop
- **Hover:** border shifts to `rgba(0,212,255,0.25)`, `translateY(-5px)`, Plasma Glow shadow, transition `cubic-bezier(0.16,1,0.3,1) 0.6s`
- **Internal Padding:** 2.5rem (`--spacing-md`)

### Inputs / Fields

Deep minimal. Nearly invisible at rest. Plasma border glow on focus makes the active state unmistakable.

- **Style:** background `rgba(255,255,255,0.02)`, border `1px solid rgba(255,255,255,0.05)`, 14px radius, padding 1rem 1.25rem
- **Focus:** `border-color: rgba(0,212,255,0.5)`, background shifts to `rgba(255,255,255,0.04)`, no outline
- **Error:** border-color `rgba(255,51,51,0.5)` (Reject tinted; not defined in global CSS, inferred from color system)

### Badges

Semantic tags for content category. Tinted background at 10% opacity, solid text in the matching accent color. Never use badges for more than category/state signaling.

- **Shape:** 20px border-radius, padding 6px 14px
- **Typography:** Inter 600, 0.7rem, letter-spacing 0.02em
- **Plasma:** background `rgba(0,212,255,0.10)`, border `rgba(0,212,255,0.10)`, text `#00d4ff`
- **Violet:** background `rgba(163,71,255,0.10)`, border `rgba(163,71,255,0.10)`, text `#a347ff`
- **Cerulean:** background `rgba(26,140,255,0.10)`, border `rgba(26,140,255,0.10)`, text `#1a8cff`

### Navigation

Circular icon buttons in the top user bar. Restrained at rest, slightly present on hover. Icon-only, no labels.

- **Style:** 38×38px circle, background `rgba(255,255,255,0.03)`, border `rgba(255,255,255,0.05)`, icon color `rgba(255,255,255,0.8)`
- **Hover:** background `rgba(255,255,255,0.08)`, icon white, `scale(1.05)`, transition 0.3s

### Timeline (Signature Component)

The activity timeline is the editorial backbone of the feed view. A vertical line with glowing white dots marks each event in time. The aesthetic is closer to a printed publication than a data table.

- **Structure:** Left-offset `padding-left: 3rem`, vertical line via `::before` pseudo-element
- **Vertical line:** `1px` wide, `linear-gradient(to bottom, rgba(110,110,120,0.20), transparent)`, runs the full item height
- **Glow dot:** 9px circle, white fill, `box-shadow: 0 0 15px white`, positioned at left edge
- **Date label:** Outfit 500, 0.75rem, Ghost Signal, letter-spacing 0.02em
- **Content:** Body text in Inter, summary beneath date label

### Quiz Vessel (Signature Component)

The most distinctive surface in the system. A two-column focus-mode panel that occupies the full viewport with maximum depth signaling. The sidebar carries course context; the content area carries the question and answer grid.

- **Outer container:** Fixed inset-0, background `rgba(0,0,0,0.75)`, `backdrop-filter: blur(32px)`. The blur here is intentional: the student has entered a focus task and the rest of the UI should recede.
- **Vessel:** max-width 1000px, `border-radius: 40px`, background `hsla(240,10%,2%,0.8)`, Quiz Vault shadow, min-height 600px
- **Sidebar (320px):** Gradient-to-bottom subtle overlay, right border `rgba(255,255,255,0.05)`, padding 3rem
- **Content area:** Cerulean radial gradient in top-right at 5% opacity, padding 4rem
- **Option cards:** 24px radius, near-void resting state; on selection, background and border shift to the appropriate semantic color: Cerulean selected, Confirm correct, Reject wrong; unchosen options desaturate and fade to 0.2 opacity
- **Entrance animation:** `translateY(40px) → translateY(0)` + `scale(0.95) → scale(1)` at 0.6s `cubic-bezier(0.16,1,0.3,1)`

## 6. Do's and Don'ts

### Do:

- **Do** use Plasma (`#00d4ff`) exclusively on interactive states, hover borders, input focus rings, and the single primary accent per screen. Its rarity is what makes it work.
- **Do** set AI-generated summary prose (`.prose-custom`) to a max-width of 65–75ch. Unconstrained prose reads as machine output; constrained prose reads as curated intelligence.
- **Do** use `cubic-bezier(0.16, 1, 0.3, 1)` for all entrances and state transitions. This is the house easing curve: fast exit, ease into rest.
- **Do** honor `prefers-reduced-motion`. The aurora animation, quiz vessel entrance, and card hover lift must be disabled for users with vestibular sensitivity. Provide a `@media (prefers-reduced-motion: reduce)` block for each.
- **Do** maintain WCAG 2.1 AA contrast. Dim Signal (`#bcbcc2`) on Onyx Deep (`#020203`) passes AA for UI components. Ghost Signal (`#6d6d78`) does not pass for body text; use it only for tertiary and non-essential labels.
- **Do** treat the quiz vessel's two-panel split as the template for all focus-mode overlays (lesson detail, config page). Sidebar for context, content area for the task.
- **Do** animate `transform` and `opacity` only. Layout properties (`height`, `width`, `margin`, `padding`) must not be animated.

### Don't:

- **Don't** build screens with light/white backgrounds, pastel accent buttons, or metric cards. IDP Core explicitly rejects the generic SaaS product aesthetic: Notion clones, flat whites, gradient-text hero stats.
- **Don't** saturate surfaces with all three accents simultaneously as fills, borders, and backgrounds. That is the crypto/NFT failure mode: neon on black with no restraint. Plasma, Violet Current, and Cerulean are signals; stacking them produces noise.
- **Don't** use gradient text (`background-clip: text` with a gradient `background`). The `.text-gradient` class exists in the codebase but is an anti-pattern; do not extend its use. Weight and size convey emphasis. A solid color conveys accent.
- **Don't** use `border-left` or `border-right` wider than 1px as a colored stripe on cards, list items, or callouts.
- **Don't** apply `backdrop-filter: blur()` to surfaces that don't sit over the aurora gradient layer. The blur exists to reveal the atmosphere beneath, not as a stylistic choice. Off-screen modals, opaque panels, and elements without the aurora layer behind them must use no blur.
- **Don't** animate the quiz correct/wrong state with bounces, particle effects, or celebration sequences. The color shift to Confirm green is the acknowledgment. Nothing more. Cartoonish gamification is the Duolingo failure mode this system rejects.
- **Don't** use Outfit below 1.35rem. At small sizes it becomes a generic geometric sans, indistinguishable from any SaaS tool.
- **Don't** use Ghost Signal (`#6d6d78`) for body text or any text that carries meaning. It fails AA contrast on the Onyx Deep background. Reserve it for decorative labels and placeholders only.
