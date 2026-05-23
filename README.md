<div align="center">

```
   ___  ____   ___  ____  ____  __    ____  ____
  ( _ \(  _ \ / _ \(  __)/ _  \(  )  (_  _)/ _  \
   ) __/ )   /( (_) )) _)( (_/ // (_/\ )( ( (_/ /
  (__)  (_)\_) \___/(__)  \____/\____/(__) \____/
```

### `jackylailai/profolio`

**A futuristic single-page portfolio — vanilla HTML / CSS / JS, deployed to GitHub Pages.**

[![Live Site](https://img.shields.io/badge/live-jackylailai.github.io%2Fprofolio-22d3ee?style=for-the-badge&labelColor=060912)](https://jackylailai.github.io/profolio)
[![Built with vanilla](https://img.shields.io/badge/built%20with-vanilla%20JS-a78bfa?style=for-the-badge&labelColor=060912)](#stack)
[![No build step](https://img.shields.io/badge/build-none-67e8f9?style=for-the-badge&labelColor=060912)](#deploy)
[![Pages](https://img.shields.io/badge/host-GitHub%20Pages-f472b6?style=for-the-badge&labelColor=060912)](.github/workflows)

</div>

---

## TL;DR

| | |
|---|---|
| **What** | One-page personal portfolio with two anchor blocks: **About Me** and **Resume Helper** (AI workflow side project). |
| **Why** | Show that I can ship a maintainable, design-led page without reaching for a framework. |
| **Stack** | HTML · CSS · vanilla JS · CDN libraries (no bundler, no node, no transpile). |
| **Style** | Dark futuristic — deep navy base, neon cyan & violet glow, glassmorphism, animated conic-gradient border, particle-network backdrop. |
| **Live** | https://jackylailai.github.io/profolio |

---

## Sections

```
┌──────────────────────────────────────────────────────────┐
│  HERO          status badge · gradient headline · CTAs   │
├──────────────────────────────────────────────────────────┤
│  ABOUT         narrative (radiography → backend → AI)    │
│                + 6 signature highlight cards             │
├──────────────────────────────────────────────────────────┤
│  RESUME HELPER featured block, conic-gradient border     │
│                architecture diagram + 6 pillars + CTAs   │
├──────────────────────────────────────────────────────────┤
│  SKILLS        6 panels · backend / data / cloud / obs   │
│                / AI / quality                            │
├──────────────────────────────────────────────────────────┤
│  EXPERIENCE    timeline · momo → Tengtz → WeHelp          │
├──────────────────────────────────────────────────────────┤
│  CREDENTIALS   medical radiographer · RPO < 10% · TOEIC  │
├──────────────────────────────────────────────────────────┤
│  CONTACT       email · github · copy-to-clipboard        │
└──────────────────────────────────────────────────────────┘
```

---

## Stack

| Layer | Tools |
|---|---|
| Markup & style | HTML5 · modern CSS (custom properties, `backdrop-filter`, conic gradients, `prefers-reduced-motion`) |
| Behavior | Vanilla ES modules — no framework, no bundler, no transpiler |
| Backdrop | **tsParticles** — cyber particle network pinned behind content |
| Motion | **GSAP** + **ScrollTrigger** — scroll-driven reveals & timeline animations |
| Smooth scroll | **Lenis** — bridged into ScrollTrigger via `gsap.ticker` |
| Typing effect | **Typed.js** — hero tagline cycles 3 strings |
| Typography | Space Grotesk (display) · Inter (body) · JetBrains Mono (mono accents) — Google Fonts |
| Hosting | GitHub Pages via `.github/workflows/` |

Every motion-heavy integration is gated behind `prefers-reduced-motion: reduce` and falls back to a plain `IntersectionObserver` reveal.

---

## Design tokens

```css
--bg            #060912    /* deep navy near-black */
--accent        #22d3ee    /* neon cyan */
--accent-strong #67e8f9
--violet        #a78bfa
--magenta       #f472b6
--ink-strong    #f7fbff
--muted         #8a93a8
```

Surfaces: `rgba(255,255,255,0.04)` with `backdrop-filter: blur(10px)` for glassmorphism.
Featured block: `conic-gradient(from 140deg, cyan, violet, magenta, cyan)` animated at 18s, masked through a 1px border.

---

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

No install. No `node_modules`. No watchers. It just opens.

## Editing copy

All page copy lives in [`content/content.json`](content/content.json). `index.html` is a template — text fields are placeholders (`data-copy`, `data-text`, `data-attr`) and repeated sections (cards, timeline items, panels) are `<template>` elements expanded by [`content/render.js`](content/render.js).

To change wording, edit `content.json` in any text editor and reload the page. The renderer fetches the JSON, hydrates the template, then unhides `<main>` with a 220 ms fade-in.

Markdown subset supported in any string field:

| Syntax | Renders as |
|---|---|
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `==text==` | `<span class="accent">text</span>` |
| `\n` | `<br>` |

For very small text tweaks the [`wording-editor.html`](wording-editor.html) tool still works on the rendered HTML, but editing `content.json` directly is now the primary workflow.

## Local wording editor

Open [`wording-editor.html`](wording-editor.html) when you want to edit portfolio copy like a text editor.

- In Chrome or Edge, click **Open HTML**, choose `index.html`, edit wording fields, then click **Save file** to write back to the static file.
- In browsers without direct file-write support, use **Download** and replace `index.html` with the downloaded file.
- The editor only changes extracted text fields and text-like attributes; it leaves classes, layout markup, scripts, and styles alone.
- Block-text containers (`<p>`, `<li>`, `<h1>`–`<h6>`, `<blockquote>`, `<figcaption>`, `<dt>`, `<dd>`) that mix text with inline formatting (`<strong>`, `<em>`, `<span>`, …) are exposed as a single editable paragraph. Saving rewrites the whole paragraph, so inline formatting tags inside that paragraph are stripped. Containers with `<a>`, `<br>`, or other non-formatting children fall back to per-text-node editing so links and breaks survive.

---

## Deploy

Pushing to `main` triggers the GitHub Pages workflow under [`.github/workflows/`](.github/workflows). The site auto-deploys to https://jackylailai.github.io/profolio.

---

## For AI coding agents

Read [`AGENTS.md`](AGENTS.md) **before** editing. It is the source of truth for:

- Project purpose & repo layout
- Design system (palette, type, motion principles)
- Section anchors (About Me & Resume Helper) and what each must contain
- Authoring rules (no secrets, no internal employer specifics)
- Quality bar before merging

For human collaborators, `AGENTS.md` is still the shortest path to understanding the design intent — read it after the README.

---

## Quality bar

- No console errors on load · current Chrome / Safari
- Lighthouse local run: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90
- Keyboard navigable · visible focus rings against the dark palette
- Renders cleanly at 360 / 768 / 1280 px
- Print stylesheet flattens to a readable single-color resume view
- `prefers-reduced-motion: reduce` disables non-essential motion

---

<div align="center">

`crafted with vanilla JS · zero dependencies installed · zero bundlers spawned`

</div>
