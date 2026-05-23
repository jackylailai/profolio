# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor, etc.) working on this repository.
This file is the source of truth for design intent and house rules. Read it before editing.

---

## 1. Project purpose

A single-page personal portfolio, deployed to GitHub Pages. Vanilla HTML / CSS / JS — no framework, no bundler, no build step. The site has **two anchor sections** that carry the weight of the page:

1. **About Me** — career narrative and signature highlights.
2. **Resume Helper showcase** — a deep showcase of the owner's primary side project.

Everything else (skills grid, experience timeline, certifications, contact) is supporting cast.

## 2. Repository layout

```
index.html      — template; section order matches the nav. Copy is hydrated at runtime.
content/
  content.json  — all page copy (meta, nav, hero, about, resume helper, …) — edit this for wording changes
  render.js     — fetches content.json, walks the template, fills placeholders, then dynamically injects script.js
styles.css      — design tokens + all visual rules
script.js       — minimal vanilla JS: theme, nav, scroll observers, typed.js, copy-to-clipboard. Loaded by render.js after hydration.
wording-editor.html / .css / .js — local-only browser editor for copy changes (legacy; prefer editing content.json)
life/           — /life/ subpage (blog + photos + now). Self-contained: index.html + life.css. Shares ../styles.css design tokens.
assets/         — images and static media referenced by index.html
scripts/        — CI / dev scripts. Currently: smoke.mjs (Playwright visual smoke test). Not loaded by the site.
README.md       — short user-facing notes about deploying to GitHub Pages
AGENTS.md       — this file
.github/workflows/smoke.yml — post-deploy smoke test workflow (the rest of Pages deploy is GitHub's auto workflow, not file-tracked)
```

### Editing copy

For wording changes, edit `content/content.json` directly. The renderer supports a tiny markdown subset in any string: `**bold**`, `*italic*`, `==accent==` (cyan span), `\n` (line break). Token `{year}` is interpolated to the current year.

For structural changes (new section, new card type) you need to add a `<template>` to `index.html` and a corresponding key to `content.json`. The renderer recognises these directives:

- `data-copy="path.to.field"` — element innerHTML, markdown-rendered
- `data-text="path"` — element textContent (no HTML)
- `data-attr="attr=path,attr2=path2"` — element attributes
- `data-list="path" data-item-template="template-id"` — clone template per array item
- Inside a template: `data-bind`, `data-bind-text`, `data-bind-html`, `data-bind-attr`, `data-class-from`, `data-if`

Do not introduce build tooling, package managers, or transpilers. Vanilla JS only — but **CDN-loaded libraries via `<script src="https://cdn...">` are allowed** for visual effects. Current set:

- `@tsparticles/slim` — cyber-network particle backdrop
- `gsap` + `ScrollTrigger` — scroll-driven reveals and timeline animations
- `lenis` — smooth scroll (integrates with ScrollTrigger via `gsap.ticker`)
- `typed.js` — typing effect on the hero tagline
- `Google Fonts` — Space Grotesk, Inter, JetBrains Mono

Add a new CDN dependency only if it materially raises the visual bar; prefer one well-loved library over three small ones. Always gate motion-heavy effects behind `prefers-reduced-motion`.

## 3. Design direction — modern + futuristic

The site should feel like a control panel from a near-future product, not a resume printout.

### Palette

- Base: deep neutral, near-black with a faint cool tint. Avoid pure `#000`.
- Surfaces: layered translucent panels (glassmorphism). Use `backdrop-filter: blur(...)` for cards.
- Accent: one primary neon glow (electric cyan / violet / magenta — pick one and commit). A second muted accent is acceptable for differentiation.
- Text: high-contrast off-white on dark; soft muted gray for secondary copy. Maintain WCAG AA on body text.

### Typography

- Headings: geometric / display sans (Space Grotesk, Inter Tight, or similar). Tight tracking on large sizes.
- Body: Inter or system sans, 1.55–1.7 line-height.
- Code / metric tags / eyebrows: monospace (JetBrains Mono, IBM Plex Mono, ui-monospace).
- Always include `font-display: swap` when loading web fonts.

### Motion

- Default to motion. Scroll-triggered fade/translate reveals on section entry. Soft hover lifts and glow pulses on interactive cards.
- Animated gradient borders or subtle conic-gradient sweeps are welcome on hero / featured cards — use them sparingly so they read as accent, not noise.
- **Always** respect `@media (prefers-reduced-motion: reduce)` and disable non-essential motion there.

### Structure / layout primitives

- CSS custom properties for color, spacing, radius, glow, and motion duration.
- A container shell (`.shell`) caps content width.
- A faint grid or dot background may sit behind the hero — keep it low-contrast.
- Section rhythm: generous vertical padding (≥80px desktop), full-bleed accent backgrounds welcome.

## 4. Section anchors

### About Me

- Narrative pacing: who they are now, how they got here, where they're heading.
- Pair the narrative with three to five **signature highlight cards** — short phrases or numbers that represent capability, not employer-internal metrics.
- Include a forward-looking line that bridges into the Resume Helper showcase.

### Resume Helper showcase

This is the second weighted block. It must be visually heavier than the supporting project cards.

- Hero tagline + short positioning sentence.
- A diagram or visual that conveys: **input → bounded LLM steps → deterministic state routing → output**, with the application owning state.
- Feature pillars — pick the strongest four:
  - Explicit LLM I/O contracts + schema validation
  - Prompt / model versioning + audit log
  - Deterministic eval harness with golden fixtures
  - Cost / quota / privacy guardrails
  - Pluggable LLM backend (fake / Claude CLI / Anthropic API)
- Prominent external link to the public Resume Helper repository. Use `target="_blank" rel="noopener"`.

## 5. Authoring rules — what NOT to put in this repo

This portfolio is public. Every commit and every file ships to GitHub Pages.

- **No** internal employer metrics, internal project codenames, or non-public deployment details.
- **No** secrets, API keys, tokens, internal URLs, environment variables, or `.env` files.
- **No** screenshots that reveal internal dashboards, customer data, or proprietary UI.
- Contact fields (`mailto:`, GitHub URL, LinkedIn URL) are placeholders by default — change only when the owner explicitly says so.
- When the owner pastes narrative copy, transcribe it faithfully but do not echo it into commit messages, issue bodies, or PR descriptions.

If the owner provides sensitive content inline, place it in the rendered HTML only and keep PR/issue prose generic.

## 6. Local preview and deploy

Local:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Copy editing:

```text
Open wording-editor.html in Chrome / Edge, choose index.html, edit wording, save.
```

The wording editor is a local helper for the owner. Do not add it to the public navigation unless explicitly asked.

Deploy: GitHub Pages source is the **`pages-release`** branch (root path). Pushing to `pages-release` triggers the auto-generated `pages build and deployment` workflow. `main` is the integration branch — merge into `pages-release` (fast-forward when possible) to ship.

After deploy the **post-deploy smoke** workflow (`.github/workflows/smoke.yml`) runs Playwright against the live URL and auto-files an issue labelled `smoke-failure` if the page renders blank or throws JS errors. See §7.1 for what it guards against.

## 7. Quality bar before merging

- No console errors on load in current Chrome / Safari.
- Lighthouse local run: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90.
- Keyboard navigable; visible focus ring on every interactive element against the dark palette.
- Renders cleanly at 360px / 768px / 1280px widths.
- Print stylesheet still produces a readable single-color resume view.
- `prefers-reduced-motion: reduce` disables non-essential motion.
- **Smoke test passes** against the live or local URL — see §7.1.

### 7.1 The silent-blank-page failure mode

`.reveal` elements start at `opacity: 0` and are revealed by `script.js` (either via GSAP+ScrollTrigger or, as a fallback, IntersectionObserver). If `script.js` throws **anywhere** before that reveal logic runs, every `.reveal` element stays at opacity 0 and the page looks completely blank to a human — but `view-source`, `curl`, and headless-DOM dumps will all show the populated HTML and lie to you.

Past incident: removing `[data-year]` from the DOM during the content.json refactor left `script.js` line 22 (`year.textContent = ...`) dereferencing `null` and crashing the rest of the file. Fixed by null-guarding (`if (year) ...`).

**Required guards going forward**:

1. Any DOM query in `script.js` whose result is used without `?.` or an `if (el)` check must point at an element that absolutely exists. When in doubt, optional-chain.
2. Run the smoke test before pushing:
   ```bash
   python3 -m http.server 8080 &
   npx --yes playwright@1 install --with-deps chromium
   node scripts/smoke.mjs http://localhost:8080
   ```
3. CI runs the same smoke against the live URL after every Pages deploy. A failure opens a GitHub issue tagged `smoke-failure` so it never goes unnoticed.

**Do not rely on DOM-only verification** (`curl | grep`, `--dump-dom`, jsdom) for visual regressions. Use a real browser screenshot or the smoke test. They are the only signals that catch this class of bug.

## 8. When in doubt

Ask the owner before:

- Introducing a new dependency or external script.
- Changing the section order or removing a section.
- Replacing the chosen accent color.
- Publishing any new contact handle or external link.

Otherwise, ship clean diffs that match the design direction above.
