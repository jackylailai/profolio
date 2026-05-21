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
index.html      — markup; section order matches the nav
styles.css      — design tokens + all visual rules
script.js       — minimal vanilla JS: theme, nav, scroll observers, copy-to-clipboard
assets/         — images and static media referenced by index.html
README.md       — short user-facing notes about deploying to GitHub Pages
AGENTS.md       — this file
.github/        — Pages deployment workflow
```

Do not introduce build tooling, package managers, or transpilers. If a feature needs more than vanilla JS, reconsider the feature.

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

Deploy: pushing to `main` triggers the GitHub Pages workflow under `.github/workflows/`. No manual step needed.

## 7. Quality bar before merging

- No console errors on load in current Chrome / Safari.
- Lighthouse local run: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90.
- Keyboard navigable; visible focus ring on every interactive element against the dark palette.
- Renders cleanly at 360px / 768px / 1280px widths.
- Print stylesheet still produces a readable single-color resume view.
- `prefers-reduced-motion: reduce` disables non-essential motion.

## 8. When in doubt

Ask the owner before:

- Introducing a new dependency or external script.
- Changing the section order or removing a section.
- Replacing the chosen accent color.
- Publishing any new contact handle or external link.

Otherwise, ship clean diffs that match the design direction above.
