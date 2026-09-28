# /notes — conventions (how to add notes)

## Purpose
Personal learning notes section of a React 18 + Vite 5.4 + react-router-dom 7 + Tailwind 3 site.
Route: `/notes` and `/notes/*`. Unlisted (no nav link). Standalone layout (NO site Navbar/MobileDock).
Feel: Obsidian Publish — compact nested folder tree on the left, article in the middle, minimalist + techy.
Theme (light only): calm off-white with a soft peach tint.

## Content location + tree rules
- Markdown files live in `src/notes/content/**/*.md`.
- Loaded via `import.meta.glob('./content/**/*.md', { query: '?raw', import: 'default' })` (lazy; each file is its own chunk). Also an eager `import.meta.glob(..., { eager: true })` is NOT wanted for bodies — only paths are needed eagerly. Frontmatter for titles: read lazily OR derive titles from filenames; keep the initial tree build synchronous from paths (filename-derived titles), then upgrade titles from frontmatter once a file loads. Simpler alternative allowed: a second eager glob with `query: '?raw'` for a tiny `index`-style approach is NOT allowed (would bundle all bodies). Filename-derived titles are the source of truth for the sidebar; frontmatter `title` overrides the article H1 only.
- Folder + file names use a numeric prefix for ordering: `01-machine-learning/02-optimization/01-gradient-descent.md`.
  - Strip `^\d+-` for the slug: `machine-learning/optimization/gradient-descent`.
  - Display title = slug with `-` → space, Title Case (e.g. "Gradient Descent"), unless overridden.
  - A folder may contain `index.md` → that is the folder's own page (clicking the folder label opens it). Folder without index.md just toggles.
- URL: `/notes/<slug/path>`; `/notes` alone shows a landing page (short intro + the tree flattened as links, or redirects to first page — landing page preferred).
- Unknown path → small "not found" state inside the same layout.

## Frontmatter (simple `key: value` lines between `---` fences; hand-parsed, NO gray-matter)
```
---
title: Gradient Descent
description: one-line summary (optional)
updated: 2026-09-26 (optional)
tags: optimization, ml (optional, comma-separated)
---
```

## Markdown features (react-markdown 10 + remark-gfm + remark-math + rehype-katex + rehype-slug + rehype-highlight)
- GFM tables, task lists, strikethrough, footnotes.
- Math: inline `$...$`, display `$$...$$`. KaTeX CSS from `katex/dist/katex.min.css`.
- Code blocks with language → highlighted (highlight.js via rehype-highlight). Pick a light theme that fits off-white (e.g. a custom small theme or `highlight.js/styles/github.css` overridden with peach-tinted tokens).
- Headings get ids (rehype-slug) → right-side "On this page" TOC (h2/h3) on wide screens, active heading tracked via IntersectionObserver.
- Relative links between notes: `[Quicksort](../sorting/quicksort)` or absolute `/notes/algorithms/sorting/quicksort` — both should route client-side.
- Images: `![caption](/assets/notes/foo.png)` → figure with caption.

## Manim animation convention (nothing rendered yet — placeholder must look intentional)
Fenced block with language `manim`:
```manim
scene: GradientDescentScene
src: /assets/manim/gradient-descent.mp4
caption: Gradient descent on a 2D quadratic bowl
```
Render: `<figure>` with `<video autoplay loop muted playsinline controls>` pointing at `src`. If the video fails to load (onError / 404), swap to a placeholder card: dashed border, peach tint, a small "film" icon, text "Animation pending — `GradientDescentScene`", and the caption below. Lines are `key: value`; all three keys optional.

## Required ending sections (Insights / Sources)
Every note, including folder `index.md` pages, ends with, in this order:
```
## Insights
- ...

## Sources
- ...
```
`Markdown.jsx` groups each of these two headings (case-insensitive match) plus its following siblings — up to the next h1/h2 — into a `<section data-note-section="insights">` / `<section data-note-section="sources">` via a small hand-rolled rehype plugin (`rehypeNoteSections`), and `notes.css` gives them distinct restrained styling (Insights = soft peach callout with a left accent bar; Sources = compact muted reference list). Both remain plain `h2`s in the DOM, so they still show up in the right-hand TOC like any other section.

Run `npm run check:notes` to verify every file under `src/notes/content/**/*.md` has frontmatter with a `title`, and both headings present with Insights before Sources. It walks the tree, prints a pass/fail table, and exits 1 on any failure — run it after adding or editing a note.

## Layout
- Three columns on ≥1100px: sidebar (260px, sticky, own scroll) | article (max-width ~720px, centered) | TOC (200px, sticky). On 768–1100: hide TOC. On <768: sidebar becomes a slide-in drawer opened by a top-left button; article full width.
- Sidebar: tiny header with "notes" wordmark + `← home` link (to `/`). Tree with chevrons; folders collapsible; expanded state persisted in localStorage (`notes.sidebar.open`); the folder containing the current page auto-expands. Active file highlighted with a peach pill. Keyboard: nothing fancy.
- Top of article: breadcrumb (Machine Learning / Optimization), H1, optional description + updated date. Bottom: prev / next note links (in tree order).
- Fonts: Inter (body/UI) + JetBrains Mono (code, sidebar labels can be sans). Add the Google Fonts link to index.html.
- IMPORTANT global CSS overrides: `src/index.css` sets `body { color: white; background: #000; user-select: none }`. The notes root must set its own background/color and `user-select: text`, and `min-height: 100vh`.

## Color tokens (CSS variables on `.notes-root`)
```
--n-bg: #faf5f0;        /* page off-white w/ peach tint */
--n-bg-sidebar: #f5ede6;
--n-surface: #fffaf6;   /* code blocks, cards */
--n-border: #e9dcd2;
--n-text: #2b2521;
--n-text-muted: #7d6f66;
--n-accent: #e0875a;    /* peach accent for links/active */
--n-accent-soft: #f7dccb; /* active pill bg */
--n-code-text: #3b332e;
```
Links: accent color, underline on hover only. Selection color: accent-soft.
No dark mode in v1.

## Files (UI)
- `src/notes/NotesApp.jsx` — routes (`<Routes>` inside, index + `*`), layout shell
- `src/notes/contentTree.js` — glob → tree + flat ordered list + slug lookup + loader
- `src/notes/frontmatter.js` — parser
- `src/notes/Sidebar.jsx`, `src/notes/NotePage.jsx`, `src/notes/Toc.jsx`, `src/notes/Manim.jsx`, `src/notes/Markdown.jsx`
- `src/notes/notes.css` — all styling (plain CSS, scoped under `.notes-root`; Tailwind classes OK but the theme tokens live here)
- Wire into `src/App.jsx`: `<Route path="/notes/*" element={<Suspense><NotesApp/></Suspense>} />` — no Navbar, no MobileDock. Do NOT touch nav.json / constants / Navbar (unlisted).

## Seed content (content agent) — 5 files
```
src/notes/content/01-machine-learning/index.md
src/notes/content/01-machine-learning/01-foundations/01-linear-algebra.md
src/notes/content/01-machine-learning/02-optimization/01-gradient-descent.md
src/notes/content/02-algorithms/01-sorting/01-quicksort.md
src/notes/content/02-algorithms/02-graphs/01-dijkstra.md
```
Each: frontmatter (title, description, updated: 2026-09-26), real explanatory prose written in first person / personal-notes voice ("the way I think about this…"), h2/h3 sections, at least one display-math block and inline math, one fenced code block (python), and gradient-descent + quicksort each include one ```manim block per the convention. index.md is a short overview of the ML section with links to the sub-notes (relative links like `foundations/linear-algebra`). Keep each note 60–120 lines. No HTML tags.
