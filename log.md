# Development Log

## Session: 2026-09-26 — `/notes` personal learning section (NEW)
- **Brief**: article-style personal notes (ML + algorithms), markdown + KaTeX math, pointers to future manim animations, left sidebar as a directory tree. Minimal/techy, off-white with peach tint. User picked: **unlisted** (no nav link), **standalone** chrome (no Navbar/MobileDock), **Obsidian Publish** as the visual reference, route **`/notes`**, tree derived from folders.
- **Spec** (canonical, copy of the scratchpad one): content in `src/notes/content/**/*.md`, numeric prefixes (`01-machine-learning/02-optimization/01-gradient-descent.md`) give order and are stripped for slugs/titles; optional `index.md` = folder landing page. Frontmatter is plain `key: value` (hand-parsed, no gray-matter — Node Buffer assumptions). Bodies loaded lazily via `import.meta.glob(..., { query: '?raw', import: 'default' })`. Manim convention: fenced ```manim block with `scene:`/`src:`/`caption:` lines → `<video>` if the file exists, styled "Animation pending" card otherwise.
- **Stack added**: react-markdown 10, remark-gfm, remark-math, rehype-katex + katex 0.16 (see bug below), rehype-slug, rehype-highlight. Existing `articleParser.js` deliberately NOT extended (only handles ##/paragraph/image/bold).
- **Gotcha**: `src/index.css` sets `body { color:white; background:#000; user-select:none }` globally — `.notes-root` must override all three.
- **Process**: UI built by a Sonnet subagent from the spec; 5 seed notes written by parallel `gem -m high` calls (~30–110s each, all SUCCESS, content quality good on review: correct math, proper voice, manim blocks placed as asked).
- **BUG (fixed): KaTeX subscripts/superscripts rendered full-size and unlowered** (`θt+1`). Cause: rehype-katex 7 depends on `katex ^0.16` and got a *nested* copy while the top-level `katex` was 0.18; 0.18's CSS renamed `.sizing` → `.katex-sizing`, so 0.16's HTML classes matched nothing. Fix: pinned top-level `katex@^0.16` (now 0.16.47, nested copy deduped away). Diagnosis via `scratchpad/katex-probe2.mjs` (measures base vs subscript computed font-size — 19.3px vs 13.5px after fix). Lesson: when adding katex, match the version rehype-katex wants; the agent's `.katex-error` check can't catch this.
- **Verification harness**: `scratchpad/notes-shot.mjs` boots vite on :5199, screenshots `/notes` + gradient-descent at 1400×900 and 390×844 into `scratchpad/notes-shots/`, asserts 0 `.katex-error` / console / page errors, checks relative-link resolution. Chrome at `/usr/bin/google-chrome`.
- **Repo note**: `npm run lint` fails repo-wide (no eslint config exists) — pre-existing, not from this work.
- **Conventions doc**: `src/notes/README.md` (how to add notes, frontmatter, manim block).

### 2026-09-27 — round 2 feedback: flush sidebar, smooth section jumps, Insights/Sources
- **User feedback** (specific, good): sidebar not flush left; section jumps not smooth; "placements fine, microinteractions need work — look at the articles portion" (= `src/hidden/projects/ProjectDetailPage2.jsx`: smooth `scrollIntoView` + `isScrollingRef` 800ms scroll-spy lock + `rootMargin -20%/-70%` observer + 200ms border/color transitions). Every note must have **Insights** and **Sources** sections.
- **Flush cause**: `.n-layout { max-width:1400px; margin:0 auto }` floated the whole grid on wide screens. Removed; article+TOC now center as a unit (`minmax(0,720px) 200px`, `justify-content:center`) in the remaining space. Asserted `sidebar.left === 0` at 1920 and 2560 in `scratchpad/notes-shot.mjs`.
- **Microinteractions** (all 150–250ms ease-out, zeroed under `prefers-reduced-motion`): TOC ported to the article-page pattern (+ hash via `history.replaceState`, hash scroll on load); sidebar folders animate via `grid-template-rows 0fr→1fr` (children always mounted; ancestors seeded into initial state so first paint doesn't animate); article fades/slides in keyed on slug; drawer scrim fades.
- **Insights/Sources**: convention = last two `## ` sections of every note. `Markdown.jsx` has a tiny hand-rolled rehype transform grouping each into `<section data-note-section>`; Insights = peach callout w/ uppercase mono label, Sources = muted 14px reference block. Enforced by `npm run check:notes` (`scripts/check-notes.mjs`: title + Insights before Sources; 5/5 pass). Sections were appended by 5 parallel `gem -m high` runs; content reviewed, the two cited URLs curl 200.
- **Known/intentional**: landing + not-found pages sit ~100px left of true center at ≥1100px (empty TOC track reserved so article x doesn't shift between landing and notes).
- **2026-09-27 shipped**: commit `ba6b825` pushed to origin/main = notes UI + pipeline only (App.jsx staged as HEAD+notes hunks via `git hash-object`/`update-index --cacheinfo`; schedule/api work still uncommitted). **All 5 seed notes deleted at user's request** ("start fresh") — recoverable from this conversation's gem outputs only, not git. `src/notes/content/` now holds just `.gitkeep`; `check:notes` exits 0 on an empty tree; empty landing shows "No notes yet". Verified the staged tree builds in isolation (`git write-tree` → `git archive` → vite build).

## Session: 2026-08-22
- **Task**: Homepage visual overhaul - text masking with background video.
- **ChatPage Layout**: Supercell 3x3 monogram style:
  - **Grid**: 3x3 block containing `JON`, `OUY`, `ANG`.
  - **Background**: Pure `#000` pitch black background with hidden Navbar on root.
  - **Video Zoom**: Increased video scale to `transform: scale(1.9)` (+50% larger) with `object-position: 56% center` in [ChatPage.jsx](src/experimental/chat/ChatPage.jsx).
- **Way-thicker letters (round 2)**: user wanted "almost TOO thick" — base stroke now `clamp(7px, 1.35vw, 18px)`, U `clamp(10px, 1.9vw, 26px)`. At 1.7vw base the A's counter closed and O/U fused; 1.35vw keeps every counter a visible sliver.
- **Floating home nav**: no navbar chrome on `/` — bare uppercase Space Grotesk words (`.cv-nav`, fixed top, WORK HISTORY / PROJECTS / RESEARCH / RESUME) rendered inside ChatPage. Hover gleam via `background-clip: text` + 300%-wide gradient whose white band sweeps through on `background-position` transition; text settles lit (#b9c0ca) while hovered, dims (#494f58) on leave. Video also recentered (`object-position/transform-origin: center`); face sits near the JON/OUY row-gap junction — acceptable per user.
- **Letter thickness fix (face blocked by U counter)**: base stroke `clamp(4px, 0.75vw, 10px)`, U only (`.cv-grid span:nth-child(5)`) `clamp(9px, 1.6vw, 22px)` — shrinks the U's black counter so the face shows through. Verified via playwright screenshots (scratchpad/shot.mjs, pauses video at T seconds). Headless Chrome `--virtual-time-budget` was flaky at rendering the video; use playwright instead.
- **Letter size & spacing alignment**: Kept U at native scale with its 45px stroke, scaled all other letters up via `.cv-grid span:not(:nth-child(5)) { transform: scale(1.135); }`, and dialed in a tighter responsive grid gap `gap: clamp(4px, 0.6vw, 8px)` with `line-height: 0.88` for razor-thin black separation between letters.
- **Vertical centering & clipping fix**: Positioned `.cv-sub` absolutely below `.cv-logo-box` so the subtitle doesn't bias the flex layout (monogram centered at Y offset = 0). Added `padding: clamp(12px, 1.8vw, 24px)` to `.cv-grid` to prevent `.cv-logo-box`'s `overflow: hidden` from clipping the top of the scaled `O` and perimeter letters.
- **Seamless Video Looping Fix**: The original `merged_output.mp4` had an AAC audio track that was 55ms longer than the video stream (causing the decoder to wait on loop), along with B-frame reordering delay (`-bf 2`) that caused mobile hardware decoders (iOS/Android) to flush buffers and flash black on loop. Re-encoded with `-an` (stripped unused audio), `-bf 0` (zero-latency B-frame seek), `-g 15` keyframes, and `+faststart`. Added `preload="auto"` in [ChatPage.jsx](src/experimental/chat/ChatPage.jsx) for seamless zero-flicker looping.

## Session: 2026-09-20
- **Rectangle Prototype**: Added `/rectangle` experimental page with semantic 3-panel video clumping, Option B co-moving sliding window parallax, 5-tier blue/silver gradients, and on-demand video mounting to prevent crashes. Added "rectangle" tab to experimental navbar.
- **Repository Cleanup**: Untracked `.DS_Store` and `dist/index.html`. Pruned redundant `public/models/` (canonical delorean model kept in `public/assets/delorean/model/delorean.glb`) and test screenshot dumps from `scratchpad/`. Preserved irreplaceable photos in `hidden-local/` and updated `.gitignore`.

## Historical Log (July 2026)


### `/marvel` + `/chat` both scrapped (2026-07-29)

Built both, user's verdict: "both awful." Scrapped wholesale. Route wiring removed from
`App.jsx`, `Navbar.jsx` (`isExperimentalRoute`), `public/data/nav.json`,
`src/constants/index.js`. Source dirs `src/experimental/{marvel,chat}/` deleted.
**Recoverable: `~/scrapped-marvel-chat-20260729.tar.gz`** (24K, both dirs, nothing was ever
committed). Build clean, no dangling refs.

`public/assets/marvel/` KEPT — it holds his only copy of `hero.jpg` / `portrait.jpg` + two
generated depth maps (originally from the delorean page, never committed to git, so deleting
them is unrecoverable). Nothing references them. Dir name is now meaningless; rename if a
new page wants them.

What they were, in one line each, in case direction returns:
- `/marvel` — 8.6s title sequence: camera flies through giant extruded 3D letters (JOUYANG)
  with video/imagery on the faces, page-flip cards, white flash cut, resolve to aligned
  white letters, cross-fade to a flat 2D wordmark.
- `/chat` — LaTeX source types out char-by-char and snaps to the rendered glyph on each
  closing brace, spelling "Jonathan", each letter in a different math alphabet; below it a
  token/inference-themed mock page (tokenizer strip, attention heatmap, top-k, API footer).

No diagnosis of *why* they were awful — feedback was one line. If a third attempt happens,
**get a reference or a much tighter brief before building**; two full builds were discarded
on taste, which is expensive. Ask what specifically failed: concept, execution, or both.

### Screenshot harness for animated pages — WORKS, KEEP THIS (2026-07-29)

`scratchpad/shoot.js` — the single most reusable artifact from this work. Survives the scrap.
Usage: `node scratchpad/shoot.js [--out d] [--url u] [--size 1280x800] <t...>`
Loads `<url>?paused=1&t=<t>`, waits for `window.__intro.ready`, calls `seek(t)`, waits
3 frames + 250ms, screenshots. Writes a summary table to `<out>/summary.txt`.

Works on any page implementing `window.__intro = { ready, duration, seek(seconds) }` plus
`?t=` / `?paused=1`. **Design new animated pages to expose that hook from the start** — it's
what makes frames reproducible and it doubles as a dev scrub handle.

Working chrome flags (verified, renderer = ANGLE/Vulkan/SwiftShader):
`--no-sandbox --disable-dev-shm-usage --autoplay-policy=no-user-gesture-required --mute-audio
--window-size=1280,800 --enable-gpu-rasterization --use-gl=angle --use-angle=swiftshader`

- puppeteer-core is **scratchpad-local only** (`npm install puppeteer-core --prefix scratchpad
  --no-save`). Root `package.json` deliberately untouched — keep it that way.
- `scratchpad/package.json` = `{"type":"commonjs"}` shim is REQUIRED; root is `"type":"module"`
  so `.js` there parses as ESM and breaks `require()`.
- Gotcha: `cd scratchpad && npm install X` **without `--prefix`** installs into the project
  root (npm anchors to the nearest package.json). Always `--prefix`.
- `scratchpad/selftest.html` — hand-rolled WebGL2 page implementing the same hook. Shoot it
  first to sanity-check the harness before trusting any "the page renders black" verdict.
- `page.goto(..., waitUntil:'networkidle0')` times out on video-heavy pages; use
  `domcontentloaded` + wait on `__intro.ready`.
- Byte size is a **coarse** smoke test only: ~18KB = black, but a legitimately mostly-black
  or flat-colour frame also lands small (a white flash frame was 19KB, a flat wordmark 38KB).
  Above ~18KB, open the PNG. Don't trust the number.
- Determinism must be tested **within one page session** (seek 3.2 → 7.0 → 3.2, no reload).
  Cross-process shots differ by ~3px from font-rasteriser warm-state noise, not app bugs.

### Reusable technique notes (both pages, may save time later)

**three.js / extruded-text title sequences.**
- `new THREE.Texture(videoEl)` **never uploads a paused video frame** — `needsUpdate` has no
  effect. Must be `THREE.VideoTexture`. A plain Texture wrapping a video is not a working path.
- Sampling media by world-XY across the letters (so footage reads as one continuous image
  behind cut-out glyphs) works well, but the sample box must be ~1.5 letters wide. Sized to
  the whole word spread, each letter gets a ~10% crop → flat colour patches. Use
  `RepeatWrapping`, never `MirroredRepeatWrapping` (renders footage text backwards).
- Camera framing rules; violating any one produced a dead frame: z strictly decreasing;
  camera always *in front* of the letter it looks at (else you frame a dark side wall — the
  single biggest source of black frames); dz ≥ dx/dy or the face is edge-on.
- 3D→2D handoff: generate the 2D wordmark as an **SVG path from the same font outlines**
  (`font.generateShapes` → `getPoints`). Matching a system font to Helvetiker leaves inner
  letters visibly doubled no matter how well the box is aligned. Also: finish the camera
  push-in *before* the crossfade (else a ~4px fringe), and let the overlay reach full opacity
  *before* fading the canvas (else the frame darkens mid-crossfade).
- Face imagery needs mid-brightness AND high *local* contrast. Screen candidates with
  `convert -crop` 3x3 tile std-dev; dark or blown images read as dead panels. Shader tone
  chain needs a black *lift* (`col*0.85 + 0.15`), not just contrast.
- Keep a white flash covering a hard cut **narrow** (~0.08s). Wider and any parked/scrubbed
  frame is a blank white page.

**CSS/DOM animation.**
- `opacity:0` does NOT remove an element from flow. A faded-out trailing caret still occupied
  ~101px in a `justify-content:center` row, so the row centred itself including the invisible
  box and shoved visible glyphs ~52px left. Fix: `width:0; overflow:visible`, and move any
  gap from `margin-*` (layout) to `transform` (paint-only). Diagnose by dumping
  `getBoundingClientRect()` in-browser, not by reading CSS.
- Faking blackboard-bold with `WebkitTextStroke` + offset `textShadow` reads as a blurred
  ghost stem, i.e. as a bug. A hollow outline (`color:transparent` + crisp stroke) reads as
  deliberate.
- For a deterministic, scrubbable typing effect, drive everything as a pure function of `t`
  and take per-character jitter from a **seeded hash of the char index**, not `Math.random()`.
  Retrofitting determinism onto a `setTimeout` chain is painful — design it in.

**Broken `npm run dev` (2026-07-28).** `ERR_MODULE_NOT_FOUND: node_modules/dist/node/cli.js`.
Cause: `node_modules/.bin/vite` was a *regular file* (copy of `vite/bin/vite.js`), not a
symlink — its `import('../dist/node/cli.js')` resolves wrong from `.bin/`. Fix:
`rm -rf node_modules && npm ci`. Gotcha: grepping the shim for the bad path is **not** a
valid check (the symlink target contains the same line) — check file *type* with `ls -la`,
want `l` not `-`.

**Free CC 3D models without a Sketchfab login.** Objaverse (HF `allenai/objaverse`) mirrors
Sketchfab CC models as direct glb downloads. Pipeline: Sketchfab public search API
(`api.sketchfab.com/v3/search?downloadable=true`, no auth) → uid → look up path in
`object-paths.json.gz` (19MB) → `huggingface.co/datasets/allenai/objaverse/resolve/main/<path>`.
poly.pizza also works but needs the real URL from page HTML (`static.poly.pizza/<uuid>.glb`;
guessing `/<model-id>.glb` 403s).

**r3f gotchas (cost hours, will recur).**
- `<primitive>` unmount auto-disposes GPU buffers while `useGLTF` keeps the cached scene →
  black canvas on revisit. Fix: `dispose={null}`.
- On suspend, React hides the outgoing tree via `visible=false` and only unhides the *new*
  one, so the cached old scene stays invisible forever. Fix:
  `useEffect(() => { scene.visible = true }, [scene])`.
- Mutating loaded geometry (re-centering, re-origining wheels) double-applies under strict
  mode — guard with `userData.prepped`.

**Route-wiring checklist** (adding/removing an experimental page touches 4 places):
`src/App.jsx` (lazy import + `<Route>`), `src/components/Navbar.jsx`
(`isExperimentalRoute`), `public/data/nav.json`, `src/constants/index.js`.

### `/delorean` — name on the door → 3D garage → real DeLorean (2026-07-29, rev 2)

Route `/delorean`, wired into App.jsx + nav.json + constants + Navbar `isExperimentalRoute`.
Files: `src/experimental/delorean/{DeloreanPage,Garage,DeloreanModel,doorTexture,timeline}`.
`GarageDoor.jsx` (the old DOM door) is DELETED — rev 1 was DOM overlay + a small WebGL inset;
rev 2 is **one WebGL scene for everything**. Verified frames: `scratchpad/g5*/`.

**THE MODEL — resolved.** There was never a DeLorean on this machine: searched all of git
history and all of `/home/jonathan`; the only `.glb` ever committed was the **iPhone**
`scene.glb` from the Apple-clone template (removed in c3454e9). Pulled a real one instead:
`public/models/delorean.glb`, 6.5MB, from `Santein/Vesuvio-88` via `gh api`. It is
**"DMC DeLorean (BTTF Part II)" by blair2819, CC BY-NC 4.0 — attribution required,
NON-COMMERCIAL ONLY.** Visible credit link is in DeloreanPage.jsx and must stay. If this site
ever becomes commercial, swap the model. Model facts (`scratchpad/{inspect_glb,nose}.cjs`):
7 meshes, 25 images, skinned (Armature), gullwing doors are named nodes (`Door_L_07`,
`Door_R_012` — a future beat). **Front wheel joints z=+66.6, rears z=-40.8, so the nose points
+Z**, i.e. straight at the camera. That's measured, not guessed — don't re-derive it.

Timeline (`timeline.js`, 8.9s, single source of truth): nameIn 0–1.55, hold 1.55–2.55,
frameIn 2.55–3.35, seamsIn 3.10–4.20, settle → doorUp 4.55–7.05, outro. Every visual is a
**pure function of t**; `window.__intro {ready,duration,seek}` + `?paused=1&t=`. `?font=` picks
the wordmark (`cormorant` default serif, or `outfit`).

ARCHITECTURE, and why:
- **Name is painted into the door's own CanvasTexture** (`doorTexture.js`), not overlaid in DOM.
  That's what makes it ride up, foreshorten and get occluded by the wall for free. DOM would
  need re-projecting every frame and would still be wrong at the edges.
- **The street wall is one ShapeGeometry with a rectangular hole**, sitting in FRONT of the door.
  The door is a plane translated up behind it, so the wall swallows it. Zero clipping maths.
- The door is `meshBasicMaterial` + `toneMapped={false}`: ALL its shading is painted in the
  canvas. As a lit `meshStandardMaterial` the white name went grey and a fill light bloomed a
  hotspot across the middle of it.
- Bay is 7.8 x 3.35 x 8.0m, wider/taller than the 5.4 x 2.72m opening, so its side walls
  converge — that convergence is what reads as "room" instead of "white backdrop".

WORKS / DOESN'T (all measured off screenshots, in this order):
- **Door must OVERLAP the wall opening** (`DOOR_OVERLAP = 0.10`) and sit nearly flush
  (`DOOR_Z = -0.035`). At -0.09 with an exact-size door you saw past its edges into the lit
  bay: a bright white outline framing the shut door that gave the reveal away completely.
- **Every bay surface must start BEHIND the door plane.** Floor/ceiling/walls at z=0 put their
  front edges 3.5cm in front of the shut door → a hairline of brilliant white floor under the
  door that read as a deliberate drawn line. They now live in a `group position-z={-0.07}`.
- **The cyan bumper is in the TEXTURE, not material.color.** Desaturating materials did nothing.
  Fix: `greyscaleMap()` rewrites each colour/emissive map's pixels on the CPU once, cached by
  uuid. Copy `flipY/wrapS/wrapT/repeat/offset/colorSpace` across or the car comes out
  inside-out (glTF maps are flipY:false, CanvasTexture defaults true).
- **Bare point lights blew a hotspot on the ceiling** that looked like a bug. Now two visible
  flush fixtures (emissive planes) with the lights tucked below them at 4.2 intensity.
- **doorCurve was cubic in-out over 3.05s → the door loitered near the floor for ~1s** with
  nothing revealed. Now quadratic in-out over 2.5s. Much better pacing.
- **Holding the seams at full white made the door look like a wireframe.** `graphicFade()` in
  timeline.js settles them from bright-white-line to glint-on-steel as the door starts moving —
  keeps the "white lines appear" trick AND ends up looking like steel.
- **Outer wall AND outer ground are now pure #000, by explicit request.** Earlier revs gave the
  wall a gradient + grain + siding joints and threw a pool of white light onto the driveway;
  both are DELETED, not disabled (facadeTexture, spillTexture, the spill mesh and its plumbing
  are all gone). So the only thing selling "real" on the exterior is the door's own painted
  steel — if the wall ever looks like a void again, that's the tradeoff, not a regression.
  (For the record, the spill at 1.75x door width had read as a flat grey shelf across the whole
  viewport; 1.06x growing out of the gap looked right, if it's ever wanted back.)
- Wordmark centred at H*0.46 straddled a seam. Now centred in the 3rd section
  (`H - 2.5*panelH + cap/2`, size 0.195) so the seams frame it — reads as real signage.
- Rev-1 text animation was per-letter blur+fade+rise; user called it "super sloppy". Replaced
  with a **hard-edged clip wipe from below the descender, no blur at all**. Crisp reads as
  deliberate. Include `actualBoundingBoxDescent` in the wipe or Cormorant's J pops in whole.
- shoot.js KB verdicts are useless here — grain makes every frame ~440KB and "OK". Open the PNGs.

### rev 3 — typing reveal, dolly, tighter framing (2026-07-29)

- **Text reveal, 3rd attempt.** Blur-fade (rev1) and per-letter clip-wipe (rev2) were both
  rejected as sloppy/fussy. Now a **typewriter with a block cursor**: nothing about a letter
  animates, characters land whole one at a time, all the motion is the caret. `TYPE` in
  doorTexture.js = `{lead: 0.34, per: 0.125, blink: 0.44}`. Two details that matter — the caret
  holds SOLID while typing and only blinks when idle (blinking mid-word is what makes fake
  typing look fake), and text grows rightward from a fixed left origin so the FINISHED word is
  what's centred, not each frame. Cursor is hidden from `BEATS.frameIn[0]` on.
- Type is now big and blocky: **Archivo Black** default, `?font=anton` alternate. The serif and
  Outfit are gone. At size 0.26 the wordmark + cursor ran the door's full width; 0.215 leaves
  margin.
- Opening 5.4 → **4.65m**, room 7.8 → **6.5m** wide (was too wide).
- **CAR_Z: never forward of -2.25.** Setting it to -1.85 put the 4.5m car's front bumper at
  z=+0.40 — straight through the shut door and out of the wall, visible in the very first
  screenshot. Now -2.60 (bumper at -0.35, just inside).
- **Apparent car size is locked to apparent DOOR size** (~0.3-0.4x its on-screen width,
  whatever the lens — it's just geometry). So "bigger car" and "narrower garage in frame" cannot
  both be had from one static camera. Resolved with a **dolly**: hold wide at z=9.5 (door ~79%
  of frame width, black margin all round) and push to z=5.2 from t=5.6, ending inside the
  doorway with the car ~38% of frame height. fov 22, x=0.12 (near head-on), y=1.24 → 1.06 (low,
  about waist height on the car). Aim drops to 0.74 as it pushes — aiming lower lifts the car in
  frame and kills the dead white wall above it.
- **Navbar is now hidden on /delorean** (App.jsx). Asked twice with no answer; its grey glass
  pill breaks the palette and looks worst over the final white-bay frames. MobileDock kept.
  One-line revert if wanted.

### rev 4 — static centred camera, plain thick type (2026-07-29)

- **The dolly is GONE.** No zoom, no drift, no push — `CameraRig` sets the same transform every
  frame. It takes no `tRef` any more.
- **Dead-centre rule (keep this):** `CAM_START = {x: 0, y: OPENING.h/2, z: 9.5}` and the aim is
  `(0, CAM_START.y, -2)`. x=0 **and** eye height == aim height == the opening's own centre is
  what makes the doorway render as a true axis-aligned rectangle, exactly centred both ways with
  no keystone. Verified on the 1280x800 shot: door spans x 136-1143 (centre 639.5 vs 640) and
  y 106-693 (centre 399.5 vs 400). **Any x offset, or eye != aim height, visibly skews it** —
  that was the "looks tilted" complaint in earlier revs.
- Camera height went 1.24 → 1.36 (= OPENING.h/2); 1.24 read as too low.
- **Type: Archivo Black was rejected as too blocky.** Now plain thick Helvetica —
  `"Helvetica Neue", Helvetica, Arial, sans-serif` at weight 700, size 0.25. FONTS entries now
  carry a full `stack` string used verbatim (not a single family name) plus a `webfont` field;
  `webfont: null` means system font, so DeloreanPage skips the `document.fonts.load` wait
  entirely. `?font=grotesk` is the alternate (Space Grotesk 700, already loaded site-wide).
  Caret narrowed 0.44 → 0.38em to suit the lighter face.
- Removing the dolly shrank the car again. With the camera frozen the only lever left is the car
  itself: `TARGET_LENGTH` 4.5 → **5.0m** (a deliberate ~17% oversize vs a real 4.27m DMC-12) with
  `CAR_Z = -2.85`. **Rule: CAR_Z must be <= -(TARGET_LENGTH/2 + 0.3)** or the bumper punches
  through the shut door and out of the wall.

### rev 5 — pitch-black door, Claude-style stream, deep hall (2026-07-29)

- **Door face is now PURE #000**, same as the wall and the page. Everything that painted steel on
  it is DELETED: section gradients, streetlight falloff, edge falloff, the grain plate,
  the rubber seal. The door is now white LINE-WORK only — seams, stamping, name — so it reads as
  a white wireframe door rolling up out of a void.
  **Consequence: `graphicFade` had to stop being applied.** With no steel to imitate, dimming the
  lines to a "realistic glint" just made the door vanish. Seams and the opening trim are full
  white now, permanently. (`graphicFade` still exists in timeline.js but is unused — delete it if
  it's still unused next time.) Recess boxes sit at 0.30 alpha so the seams stay dominant, and
  the section carrying the name (`NAME_PANEL = 2`) gets no stamping at all — the boxes crowded
  the letters.
- **Text reveal, 4th and current version: Claude's own UI streaming.** Characters arrive in order
  and each FADES UP in place; opacity is the only animated property. No blur, no slide, no scale.
  `TYPE = {lead: 0.30, per: 0.072, fade: 0.19, blink: 0.46}` — **fade > per on purpose**, so
  several characters are mid-fade at once and it looks continuous rather than clacky.
  Caret is a skinny rule (`size * 0.055`, min 2px), not the old block (was 0.38em — "way too
  big"). Still solid while streaming, blinking only when idle.
  History so we don't loop: blur-fade+rise = "super sloppy"; per-letter clip-wipe = still
  disliked; typewriter with block caret = right idea, cursor far too heavy; this = approved shape.
- **Room: deep, not wide.** 26x9x28 → **12 x 6 x 36**. The number that matters: the view cone
  through a 4x2.7m opening from 9.5m back widens ~0.21m per metre of depth, so it only clips the
  side walls past ~19m and the ceiling past ~23m. **Depth is what makes walls converge and read
  as a hall; width just pushes them out of shot and it goes back to looking like a white void.**
  A 26m-wide room never showed a single corner.
- Opening 4.65 → **4.05m** wide (skinnier). Height unchanged at 2.72.
- `CAR_YAW` 0.05 → **0**. On a head-on shot any yaw at all reads as the car being off-centre.
- **`scratchpad/check_center.py`** — verification script, decodes a PNG with zlib only (no Pillow
  on this box) and measures the bay's bounding box plus a darkness-weighted centroid for the car.
  Current numbers on 1280x800: bay centre x 639.5 (off -0.5), y 398.5 (off -1.5), car centroid
  x 638.3 (off -1.7, and part of that is the cast shadow falling left). Gotcha: inset the search
  box hard — the bay's own dark inner wall returns swamp the car and make it look centred no
  matter where it is.

### rev 6 — portrait door, seams only (2026-07-29)

- Opening is now **3.5w x 3.2h** — taller than wide, deliberately not real garage-door
  proportions. Camera pulled to z=9.8 so the taller door still has margin (door ends up ~58% of
  frame width, ~84% of height). CAM y follows OPENING.h/2 automatically, so it rose to 1.6.
- **Stamped recess rectangles deleted.** The door is horizontal section seams and nothing else.
- **Font size is now a fraction of the door's WIDTH, not its height.** With a portrait door the
  texture is taller than it is wide, so the old H-relative size (0.215) blew the wordmark
  straight past both edges. Now 0.155 of W → ~73% of the door's width.
- The taller opening reveals the CEILING for the first time, which exposed the nearest lamp as a
  hard elliptical hotspot on it. Lamps moved deeper and lower (y 3.9, z -8/-18/-28) and softened,
  ambient up to 1.08.
- Re-verified with check_center.py: bay centre x 639.5 / y 398.5 on 1280x800, car centroid 636.2
  (off -3.8px, i.e. 0.3% — the cast shadow falls left and drags the centroid with it).

### rev 7 — the reveal became an EVENT (2026-07-29, 2 sonnet agents + integration)

Diagnosis that drove it: the reveal was occlusion-driven — fully-lit room just sitting there,
door the only moving thing ("opening a fridge"). Now light-driven, four stacked reactions:
1. **Car wakes first** (DeloreanModel.jsx): headlights flare over BEATS.headlights [4.35,4.8],
   BEFORE the door moves. Emissive quads + additive radial-glow sprites (no postprocessing
   bloom — CanvasTexture sprites) + two spotlights (targets z=+4, x=±0.25, intensity 60*on)
   + an additive beam-pool on the floor.
2. **Crack of light** (Garage.jsx): doorCurve now cracks 9cm and HOLDS [p 0.05–0.20] while the
   headlights blaze through; a camera-facing additive quad sits IN the gap, height tracking
   gap*1.3+0.10, fading out once the gap passes ~0.5–1.2m.
3. **Room bangs on row-by-row** (timeline.js rowLight/bayAmbient): bay starts at 5% light;
   3 ceiling rows (deepest first, z -28/-18/-8) slam on over [5.0,6.3] with ~0.22s of hashed
   deterministic fluorescent stutter; visible flush fixtures lerp black→white (color.setScalar,
   NOT opacity — a grey fixture at 0 would show).
4. **The clunk** (timeline doorCurve overshoots to 1.016, settles over last 10%): CLUNK_T
   exported; clunkShudder(t) = damped sine (exp(-9dt)·sin(46dt)·0.011m) shakes the frame
   hairlines + underShadow. Floor is now drei MeshReflectorMaterial (mirror 0.45, blur
   [400,120], mixStrength 0.6) — showroom reflection of the car.

Timeline retimed: doorUp [4.55,7.35], roomLights [5.0,6.3], DURATION 9.3. graphicFade deleted.

Integration bugs caught on screenshots (agents can't see renders — expect this class of bug):
- Agent A put the headlight beam-pool at z=+0.6 — OUTSIDE the wall, a grey stain on the
  pure-#000 driveway. Moved to z=-0.75 (inside, where the beams physically land).
- Agent B's crack glow lay FLAT on the threshold — from camera height (y1.6) a floor decal is
  edge-on and invisible. Replaced with the vertical in-gap quad above. **Rule: glow effects
  aimed at this camera must be camera-facing quads, not floor decals.**
- Both agents' work verified frame-by-frame in scratchpad/g19/: crack blaze at 4.85–5.35,
  stutter mid-swing 5.9, final 9.2 with lit headlights + floor reflection. All good.

### rev 8 — scroll sections: garage exit, turntable, gullwings, robot (2026-07-29, in progress)

Page becomes 3 sections (300vh). ARCHITECTURE — one virtual timeline: scroll maps to virtual
seconds after the intro. T 0–9.3 = time-driven intro; T 9.3–13.3 = section 2; 13.3–17.3 =
section 3 (SECTION_SPAN=4.0/section, TOTAL_DURATION=17.3). `__intro.seek(T)` covers the WHOLE
range (seek past 9.3 = a scroll state), so shoot.js needs zero changes to photograph any scroll
position. Scrolling during the intro skips it (introDone pins at INTRO_END). ?paused=1&t=15
renders mid-section-3 without any scrolling (seekT bypasses scrollY, which headless pages
don't have).

DECISIONS (mine, user delegated):
- **Background after the garage leaves: BLACK.** The garage interior was the white; car+robot
  on black is more dramatic, matches the site's black pages for the overlay text, and needs no
  bg transition at all.
- **The "cool transition I haven't thought of": the garage exits the way it arrived** — the
  whole room lifts straight up like its own door did, hairlines and all. Floor stays put and
  crossfades white → near-black (reflector kept), so the car ends standing in a black void on a
  dark mirror.
- **Robot = three.js example asset Xbot** (`public/models/robot.glb`, 2.9MB, MIT, from
  mrdoob/three.js dev branch examples/models/gltf/Xbot.glb): 1.81m skinned humanoid, baked
  clips include 'walk'. Path: slow arc BEHIND the car (orbit centre = car, r 4.6, angle swings
  ~200°–340° so it never blocks the camera). Whisk-out = clockwise sweep + radius growth +
  fade over [13.3,14.3].

New timeline exports: SCROLL beats, garageOut, carYaw (0 → -0.62 → -π; negative = clockwise
from above), gullwing, robotFade, robotWhisk, camThroughScroll (cam eases down/in as the
garage leaves, x stays 0). Gullwing door nodes exist in the glb (`Door_L_07`, `Door_R_012`).

Robot determinism caveat (deliberate contract break, documented): when NOT paused, the robot
walks on its own wall-clock (scroll T is static while the user reads — a frozen robot would be
worse). When ?paused=1, path + mixer time derive purely from T so screenshots reproduce.

3 sonnet agents dispatched, one file each: Garage.jsx (room lift + floor fade + void light
rig), DeloreanModel.jsx (turntable + gullwing quaternions with a tunable GULL const + reparent
headlights INTO the rotating holder — they were world-space and would detach) and new
Robot.jsx. DeloreanPage/timeline foundation was laid first by hand so agents share one contract.

Rev 8 verification + fixes (2026-07-30, screenshots scratchpad/s1–s5):
- Garage lift-away, floor-to-black, void rig, turntable, rear view: all worked first try.
- **Gullwing doors: bone-local axis rotation is WRONG for this rig, twice over.** Local z spun
  them like suicide doors (yaw); local y looked hinged-ish but detached — the bones' origins are
  at the door SILLS, not the hinge. Real DMC-12 doors hinge along the ROOF SPINE (nose-to-tail
  line at the top). Fix in DeloreanModel.jsx: hinge-LINE rotation composed in the bone's parent
  space: local' = T(hinge)·R(axis,θ)·T(-hinge)·rest, with the hinge (0, 1.17, 0)+axis (0,0,1)
  given in car space and converted per-door at prep (holder.updateMatrixWorld(true) on the
  detached holder makes matrixWorld car-space). Swing sign auto-derived from the door's rest
  world x. **Correction (2026-07-30, user pushed back — rightly):** the shared x=0 spine hinge
  was still wrong; each door's roof flap swept ACROSS the centreline. Measured the glb: door
  bones sit at car-space x ±0.196, y 1.147 — i.e. the bones ARE the two real roof-edge hinge
  points. Final fix: hinge each door about ITS OWN bone origin (hinge = node.position in parent
  space), axis = car-longitudinal in parent space, maxAngle 1.32 (~76°). **Verified from 3/4 and
  rear: the iconic wings-up V.** So all three earlier theories in one line: local axes ≠ car
  axes; a shared centreline hinge ≠ two roof-edge hinges; the bones were correct all along —
  only the AXIS needed converting into their space.
- Robot: arc end at 200° parked it inside the left headlight beam (intensity 60 spot) → white
  ghost blob. Arc narrowed to 225°–315° + materials darkened (l*0.52) → reads as gunmetal
  machine. NOTE for future: screenshots freeze the walk mid-stride at whatever pose t maps to;
  judge gait in the browser, not from stills.
- "Snappy" (user): all SCROLL windows tightened to ~0.7–1.2 virtual s (garageOut 9.45–10.30,
  doors 10.45–11.35, robotOut 13.30–14.10 etc.). 1 virtual s ≈ 25vh of scroll.

STILL OPEN: section overlay copy is placeholder. Both glbs unoptimised. Robot whisk direction
unverified against "clockwise" reading (stills can't show it — check live).

## 2026-09-23 — /schedule Apple-style polish + lag fix
- **Dull bg = the overlays, not the video.** Proved it by hiding the 2 gradient divs in a headless snap: the noon frame is vivid. Replaced with a light left-only scrim (black/30→0) + thin top scrim.
- **Lag causes:** (1) 4K 3840x2160 24fps 63MB source being played at up to 6x and seeked backward every frame; (2) wheel did setState per pointermove/wheel event → React re-render of the whole page + the video target; (3) stacked backdrop-blur layers over a playing video; (4) video rAF loop ran forever. Fixes: re-encoded to `sf_timelapse_scrub.mp4` (1920w, GOP 6 for cheap reverse seeks, no audio, faststart, 20MB; via `uvx --from imageio-ffmpeg`, no system ffmpeg); wheel now writes the DOM imperatively in rAF (zero React renders while spinning); scrub only moves a ref + big-clock textContent; video chase loop stops once it arrives. Old 4K file left in place, unused.
- **Wheel (AppleWheelColumn):** real cylinder (20°/row, radius from row height), hours+minutes loop infinitely, AM/PM doesn't, 5-min minute steps (`MINUTE_STEP` in AppleTimePicker), fling w/ projection, tap-to-row, arrow keys, trackpad wheel w/ debounced snap. Two drums (dim + bright clipped to band) = iOS "lights up in the band". Note: clip-path flattens 3D, so `perspective` must sit on the rows' direct parent, not an ancestor.
- Fixed old bug: parent's scrub → setState → wheel resynced to integer mid-scroll (jitter).
- Fixed: .ics used selectedSlot.hour/minute which never existed (NaN date), and used the visitor's local tz. Now TZID=America/Los_Angeles. "PST" → "PT" everywhere (it's PDT in Sept).
- Deleted unused IPhoneTimeWheel.jsx + generateTimeSlots/TIME_PRESETS/formatTimeOnly.
- Gemini (`gem`) worked well for both tasks it got (video re-encode: low, 26s; modal rewrite: high, 136s, clean + caught the hour/minute bug).
- STILL OPEN: booking is simulated (no backend/email). Can pick a time earlier today that has already passed.
- (later same day) Fixed AM/PM parity across 12: wheel's onChange now passes `laps` (floor(unwrapped/n)); odd laps flip period. Scrub on hours = mod(p*12+v,24) so rolling 11PM→12 shows midnight not noon. Fling velocity now uses only samples from the last 100ms (stale samples gave +1 row overshoot). Verified in headless: 12PM→10PM→1AM→10PM→full lap 10AM→arrow keys 12PM all correct; 60 wheel events → 0 frames >50ms, avg 16.7ms (swiftshader: says nothing about GPU/backdrop-blur cost).

## 2026-09-23 (later) — /schedule free/busy + details step
- User asked: wheels cap at ends (no loop) → removed `loop` on hour/minute columns (AppleWheelColumn still supports it).
- User picks (AskUserQuestion): FAKE data for now, wheel + timeline BOTH linked, 8 AM–10 PM in 30-min slots, bottom sheet on phones.
- `availability.js` = the data contract (getBusy/getDaySlots/isFree/earliestStart, PT decimal hours). Fake busy = seeded per date, deterministic. To go live: replace `getBusy` with a Google Calendar free/busy fetch (Vercel fn; site is on Vercel). Verified by scratchpad/verify_avail.mjs.
- Desktop: timeline is NOT a separate sidebar; user wanted it to "grow out of" the booking card's right edge → one glass shell, `<aside>` width 0→360 (EASE 560ms), content fades in with 140ms delay; last date kept during collapse. Phones: bottom sheet (72dvh) + "Jonathan's day · N open" row to reopen it.
- Hovering a free slot scrubs the sky (onPreview → handleScrub, no React state); leaving returns to the chosen time. Wheel on a busy/out-of-hours time → Continue disabled + reason label. Out-of-range times draw no block on the timeline (was misleadingly pinned at 8 AM).
- Form: BookingModal deleted → `DetailsStep` pushes in inside the left card (iOS push/pop keyframes in schedule.css). Card min-height locked to the pick step's height so the shell doesn't jump.
- Calendar disables fully booked days (freeCount===0), which also means "today" greys out after 9:30 PM PT.
- Agents: Sonnet built DayTimeline.jsx (good, self-fixed 2 visual bugs); gem high built DetailsStep.jsx + ics.js (clean). Both verified via puppeteer flow (scratchpad/flow.cjs, details.cjs).

## 2026-09-23 (late) — wheel removed, smooth scrub, fit-to-window
- Wheel picker DELETED (user: doesn't make sense next to the timeline). AppleTimePicker/AppleWheelColumn gone. Flow: day → timeline → hover previews sky → click picks → card shows "Thu, Sep 24 / 9:00 – 9:30 AM" + Continue. Nothing picked = sky + big clock show SF's real current time (re-synced on the 15s tick, skipped while hovering).
- Whole track scrubs the sky under the mouse, busy blocks included (only free slots clickable). Cursor line + 5-min time label, DOM-written (no renders). Mouse wheel over the track scrubs live (timeline never scrolls: scrolling moved content under a still cursor = sky didn't update, which is what the user called "not live").
- **Backward choppiness fix:** old engine played forward natively but stepped back via seeks on a GOP-6 file (up to 6 decodes/seek). Now: video re-encoded ALL-INTRA (-g 1, 1920w crf 23, 22MB, same filename sf_timelapse_scrub.mp4) + the video never plays, only seeks, driven by a SmoothDamp spring (SPRING_TIME 0.2s; ease-in-out that retargets mid-flight without jerk — better than a fixed bezier for a moving target). Headless: ~46 seeks/s both directions; sweep test backward 78 frames/1.4s vs forward 40 (symmetric or better). Old 4K file still in public/, unused.
- Fit: open shell height = min(760px, 100dvh-120px); side timeline rows = measured height / 28 (ResizeObserver). Verified 1280x720 / 1440x900 / 1920x1080: no overflow, no page scroll. Phone sheet keeps 40px rows + scroll, scrollbar hidden (.sch-noscrollbar).

## 2026-09-24 — sky = preloaded frames on a canvas (video element removed)
- User: still laggy / not real-time even with all-intra seeking. Root cause: <video> scrubbing is always seek→decode→present, latency you can feel. **Fix: no video at all.** Frames extracted once: `ffmpeg -ss 2.2 -to 9.9 -i sf_timelapse.mp4 -vf fps=12,scale=1600:-2 -c:v libwebp -quality 78` → public/assets/videos/sf_frames/001–093.webp (11 MB). `skyFrames.js`: fetches all (nearest-first, 6 parallel), decodes off-thread with createImageBitmap (LRU 56 bitmaps ≈300MB cap), draws with cover-fit + cross-fade between neighbouring frames so 12fps reads continuous. FIRST_SEC/FPS/COUNT constants must match the extraction.
- Spring kept but shortened (SPRING_TIME 0.09s) — just de-jitters the mouse.
- Measured (headless swiftshader, worst case): all frames loaded in ~2.2s; sky visibly changes 11–46ms after a jump; sweeps both directions 60fps, 0 frames >33ms.
- Deleted sf_timelapse_scrub.mp4 (my intermediate). Original 4K sf_timelapse.mp4 still in public/ (source for re-extraction; not loaded by the page).

## 2026-09-24 (b) — "still laggy": two real bugs + Bézier easing
- **Bug 1 (stale frames):** skyFrames only decoded ±3 frames around the current one (LRU). A fast sweep hit undecoded frames → drew the *nearest decoded* one (could be far away) → "catches up" late = perceived lag. My earlier latency test only checked "pixels changed", not "right frame". Fix: fetch+decode ALL 93 frames up front via createImageBitmap(resizeWidth 1280, 800 on phones) ≈ 343 MB / 1080p-class; decoded in ~0.8 s headless. Canvas backing store now 1x (soft photo behind glass).
- **Bug 2 (loop never restarts):** new chase() guards on `raf.current` ("loop already running"). React StrictMode dev double-mount: cleanup cancelled the rAF but left raf.current non-zero → no loop ever started again → sky frozen. Caught by tracing `__sky.stats().pos` after a jump (stayed 0%). Fix: cleanup resets raf.current=0, curve=null. LESSON: any "is running" ref must be reset in effect cleanup.
- **Easing:** replaced spring with cubic Hermite (= cubic Bézier in time) from (current pos, current velocity) → (goal, 0). Ramps up from rest, ramps down to zero, and retargets mid-move with velocity continuity (no restart/jerk). Duration = min(0.55, 0.22 + 0.05·|Δvideo-sec|) s — knobs EASE_MIN/EASE_PER_SEC/EASE_MAX in SchedulePage. Traced 9AM→8PM: 0→5→14→27→42→58→73→86→95→100% in ~500 ms.
- Verified 1920x1080@2x and 1440x900@1x: sweeps fwd/back/fast 60fps, 0 frames >33ms (scratchpad/live2.cjs; window.__sky exposed in DEV only).

## 2026-09-24 (c) — sharper sky + camera move removed
- **Two-tier frames** (user: quality visibly lower, asked about the 340 MB): LO 960w (all 93 preloaded+decoded ≈190 MB, 4 MB download) drawn on a 1x canvas while moving; HI 2560w fetched on demand (Image.decode, LRU 6) when the sky rests ≥90 ms, shown in two <img>s over the canvas (pair blended via CSS opacity) and faded in 220 ms; hidden instantly on motion. Tried first: HI drawn into a 2x canvas → 3840x2160 redraw per frame = ~13 fps at 1920@2x. The DOM/compositor layer keeps 60 fps. Sharp in ~480 ms after stopping (includes the ease).
- **Pan removal** (user noticed): clip slowly pulls back ~7% zoom + tilts up. `scripts/stabilize_sky.py` (uv run --with opencv-python-headless --with numpy) reads 4K source at 12 fps from 2.2 s, ORB+RANSAC similarity from EVERY frame DIRECTLY to the middle frame, light smoothing, re-bases on the reference needing least crop (frame 40), crop 1.1187x, Lanczos warp, writes sf_frames_hi (2560, q84, 22 MB) + sf_frames_lo (960, q72, 4 MB). FAILED first: chaining consecutive-frame transforms — each ~0.08% zoom step drowned in noise, 90% of the zoom survived (measured). Verified with scratchpad/measure_pan.py: residual ≤0.2 px, scale 0.9996–1.0000, rot ≤0.01°. Old sf_frames/ (1600w) deleted.
- (d) User saw "zoom when hovering vs not" + "pan still there": NOT a code bug — verified on-screen HI vs LO alignment in a fresh browser = scale 1.0000, 0 px offset. Cause: frames regenerated in place under the same URLs while the tab was open → old (unstabilized, uncropped) LO bitmaps in memory + new HI fetched later. Fix: `?v=FRAMES_VERSION` on frame URLs (bump after re-running stabilize_sky.py). User needs one hard reload.

## 2026-09-24 (e) — full day to midnight, earlier morning, faster dark
- Clip map (contact sheet, 0.4 s steps): 0–1.6 sunset→deep night (moon), 1.6–2.4 dawn, 2.4–4 morning, 4–6.4 midday, 7.2–8.4 golden/sunset, 8.8–9.6 dusk→night, 9.6–10 night.
- DAY_END 22→24 (timeline 8 AM–12 AM, 32 rows). hourToVideoTime rewritten as keyframes (KEYS in timeVideoMapping.js): 8→2.3 (low sun), 12→4.6, 18.5→8.0 (sun on horizon), 20→9.3 twilight, 21→9.65 night, 24→9.9. 0–5 AM holds end-of-clip night, 5–8 AM uses 1.9–2.3 (only seen as idle "now" sky). Removed unused VIDEO_DURATION.
- Frames re-extracted 1.9–9.95 s → 97 frames (stabilize_sky.py FIRST_SEC/LAST_SEC; skyFrames FIRST_SEC=1.9, COUNT=97, FRAMES_VERSION=4). Ref frame 43, crop 1.1207; residual ≤0.3 px (last night frame ~1 px).
- Test gotcha: puppeteer clip screenshots (captureBeyondViewport default) resize the page → fires pointerleave → clock/sky snap back to "now". Looked like a bug; wasn't. Use captureBeyondViewport:false.

## 2026-09-24 (f) — real Google Calendar hookup (awaiting user credentials)
- Design: ONE OAuth refresh token for the personal gmail (scopes calendar.freebusy + calendar.events). ucla.edu + google.com calendars share "free/busy only" with gmail → FreeBusy API as gmail sees all 3. Server only calls token, freeBusy, events.insert — never events.list/get (user: no details may leak). Verified by grep.
- api/_lib/google.js (token cache, DST-correct PT day bounds, merge/split busy per PT day; ANY calendar error → throw, never silently treat as free), api/freebusy.js (GET ?start&days≤62, s-maxage=60), api/book.js (honeypot `website`, validation, ≥30 min lead, server re-check → 409, event on gmail primary w/ Meet + sendUpdates=all, attendees guest + JONATHAN_INVITE_EMAIL=jonsouyang@ucla.edu per user). vite.config.js dev middleware runs /api/* locally (ssrLoadModule + loadEnv). Sonnet agent, 24/24 mocked tests (scratchpad/api-tests).
- scripts/google-auth.mjs (gem): loopback OAuth on 127.0.0.1:53682, upserts GOOGLE_REFRESH_TOKEN into .env.local. .gitignore now ignores .env/.env.local/.env.*.local (it didn't before!). vercel.json rewrite excludes /api/. .env.example committed as template.
- Frontend: availability.js is now a cached store (loadRange/refreshDay/useAvailability via useSyncExternalStore). Unknown day = nothing bookable + pulse; error → "Couldn't load… Try again". DEV + 503 not_configured → fake data + simulated booking (never in prod). earliestStart now ≥30 min ahead (matches server).
- GOTCHA for setup: OAuth consent screen in "Testing" → refresh tokens expire after 7 days. Must set publishing status "In production" (unverified is fine for own account; click through warning).

## 2026-09-25 — less noticeable sharpen swap; copy
- LO tier 960→1152w + unsharp (addWeighted 1.45/-0.45, σ1.1) in stabilize_sky.py → on-screen LO vs HI mean abs diff 1.16/255 at 1440x900@2x (visually near-identical). ~280 MB bitmaps, 7 MB download. FRAMES_VERSION=5.
- Swap: FADE_IN 480ms cubic-bezier(0.45,0,0.25,1); FADE_OUT 200ms on motion start (was instant → visible drop to soft); REST_MS 60; SchedulePage.chase() calls sky.prefetch(goal) when a curve starts so the HI frame is decoded before arrival. Still 60 fps @1920x1080@2x.
- Removed "The sky follows." subtitle (user). Big clock = Jonathan's PT time (idle = SF now, hover = slot in PT), NOT the visitor's zone — offered a local-time hint, pending answer.

## 2026-09-26 — visitor time zones + clock layout
- Before: every label was PT (a NY visitor would've shown up 3h late). Now `tz.js`: internal data stays (PT day, decimal PT hour); only labels convert. makeFormatter(tz).time/hour/range/date, ptInstant (DST-safe, two-pass offset), zoneAbbr (tries en-US/GB/IN/AU so London=BST, India=IST; else "London time"), sameAsPT (Vancouver counts as PT → no extra UI). Context TimeFormatContext {…fmt, visitorIsPT, showPT, setShowPT}. ?tz=Area/City overrides detection for testing. 20 unit tests (scratchpad/tz_test.mjs).
- Days stay Jonathan's PT days (decided with user). Timeline labels get "+1" when they fall on the viewer's next day; the summary card + details show the viewer's own date so they use noDay (no "+1"). A slot ending exactly at midnight never gets "+1". Gutter widens for :30-offset zones.
- Timeline header: "Times in EDT · Show in PT" toggle (hidden for PT visitors).
- Big clock stays PT (user's call: it's Jonathan's sky). 112→156px; date above; "● San Francisco" + "2:30 AM +1 your time" (visitor zone, live on hover via hintRef) below. Top "San Francisco" pill removed (user). Idle clock date now uses PT today (was browser-local date).
- Verified in page for LA / New York / London (scratchpad/tzpage.cjs).
- (2026-09-26 later) User: jonsouyang@ucla.edu is the MAIN account → it's now the OAuth hub (refresh token signed in as UCLA), bookings created on UCLA primary (Jonathan = organizer, invites from/to UCLA), gmail + google.com share free/busy WITH UCLA. JONATHAN_INVITE_EMAIL now optional/blank (was defaulting to ucla as an extra attendee). Cloud project itself can live under gmail (avoids UCLA org restrictions). RISK: UCLA Workspace admin may block unverified 3rd-party OAuth apps ("blocked by your admin") → fallback = gmail hub + JONATHAN_INVITE_EMAIL=jonsouyang@ucla.edu (old setup, code supports both).
- (2026-09-26) /privacy + /tos added (src/legal/LegalPage.jsx, routes in App.jsx) — REQUIRED by the Google OAuth app registration for /schedule; marked "don't remove" in code. Contact = jonsouyang@ucla.edu.

## 2026-09-26 (b) — email check + anti-abuse
- Visitors never log in (Calendly-style); only Jonathan's one-time OAuth.
- Email: no free way to verify a mailbox exists (providers hide it). api/_lib/email.js: syntax, popular-domain typo suggestion (Levenshtein ≤2), disposable blocklist, domain receives mail (MX, fallback A/AAAA, 2.5 s timeout → don't block). GET /api/check-email + re-check in /api/book (400 bad_email). Form: check on blur + on Confirm; red #FF453A message; "Did you mean …?" one-tap fix. Verified in browser. Test gotcha: puppeteer clickCount:3 does NOT select-all in an <input> → use el.select() + Backspace.
- Anti-abuse (Sonnet agent, in progress): no DB — bookings tagged with extendedProperties.private {src, eh, ih} (salted sha256 of email/IP); caps via events.list privateExtendedProperty=… fields=items(id,status) (server never sees event details): 1 upcoming per email (409 already_booked), 2 per IP (429 too_many_bookings); in-memory burst limiter (429 rate_limited, best-effort). Form messages added for all three.
- Anti-abuse DONE (Sonnet): api/_lib/limits.js burst (book 5/min+20/h, check-email 30/min, freebusy 60/min → 429 rate_limited + Retry-After, in-memory best-effort); caps via tagged events.list fields=items(id,status): MAX_UPCOMING_PER_EMAIL=1 (409 already_booked), MAX_UPCOMING_PER_IP=2 (429 too_many_bookings, skipped if IP unknown); cap-check failure fails CLOSED (502). BOOKING_SALT env (optional). Tests 15+12+24 pass. Frontend: check-email non-200 → skip live check (was wrongly blocking submit).
- (2026-09-27) vercel.json: frames get `Cache-Control: public, max-age=31536000, immutable` (safe: URLs carry ?v=FRAMES_VERSION). CDN caching doesn't reduce Vercel bandwidth for NEW visitors (edge-served bytes still count); this makes repeat visits ~0 bytes. Cost watch-item = ~7 MB/new visitor vs Hobby 100 GB/mo.

## 2026-09-27 — security pass (user asked: no exposed keys/sensitive info)
- Mechanical: no secret patterns in working tree or ANY git history; .env/.env.local git-ignored; prod bundle has no env names/OAuth endpoints/calendar IDs/dev-only code; api/ not served statically. Scrubbed the work email from .env.example (placeholders) and log.md (both tracked/public repo). Invite title now "Jonathan / {name}", note in description.
- Sonnet review (read-only) found, fixed: [high] getClientIp trusted FIRST XFF entry (client-spoofable → bypass per-IP cap + burst limit) → now x-real-ip / x-vercel-forwarded-for, else LAST XFF entry. [med] check→insert race → in-memory per-slot lockSlot() (best-effort; residual cross-instance race accepted, near-zero for a personal site). [low] invalid ?tz= crashed the tab → validated with Intl, falls back.
- Accepted/flagged to user: third-party invite spam (anyone can enter someone else's email; same as Calendly; bounded by caps now that IP can't be spoofed) — optional fix = email confirmation link before inviting. MUST set BOOKING_SALT in Vercel (else hashes use a public fallback salt).

## 2026-09-27 — /notes TOC (user request; src/notes was untouched ~9h, no other session active)
- TOC moved right: `.n-article-col` column-gap clamp(40px, 6vw, 120px) (gap 77px @1280, 115px @1920). Kept justify-content:center on purpose (original comment: don't fling TOC to the window edge).
- Math in TOC: Toc.jsx used textContent → KaTeX MathML + visual copies concatenated ("O(n2)O(n^2)"). Now clones the heading, strips .katex-mathml + links, renders innerHTML (trusted own markdown); title=plain text. `.n-toc .katex {font-size:1.05em}`. Verified on /notes/algorithms/sorting/quicksort.

## Session: 2026-09-28 — site cohesion + Netflix projects variants
- **Direction** (user): vibe = "my life is a movie, but techy". Pages keep their own looks; cohesion via shared "film layer" (title cards, nav, transitions) — not yet decided. **/research is off-limits** (must stay plain academic for real researchers). Focus: home + projects.
- **Projects**: user loves Netflix banner (`HeroSection`), but below-fold card grid + "Contents" sidebar breaks theme; past Netflix-row attempts "looked like shit".
- Exported `HeroSection` from `src/hidden/projects/ProjectsPage.jsx`. Added routes `/projects-a|b|c` → `src/experimental/cine/Variant{A,B,C}.jsx`: A = browse rows + Top10 + title modal, B = "The Series" episode list w/ season selector, C = key-art posters. Built by workflow (build → 2 judges → polish). Screenshot harness: `.cine-shot.mjs <route> <port> <outdir>` (run from repo root; puppeteer-core only resolves there).
- Note: `/notes` rendered "No notes yet" in a screenshot — unverified, possibly a bug.

## 2026-09-28 — /schedule shipped
- Google OAuth done (hub = UCLA account, CALENDAR_IDS = ucla+gmail+google.com, all 3 verified via /api/freebusy: 19 busy days/30). Vercel env vars set by user (client id/secret/refresh token/CALENDAR_IDS/BOOKING_CALENDAR_ID/BOOKING_SALT).
- Committed schedule + api + sky frames only. LEFT OUT (still uncommitted): cine Variant A/B/C routes in App.jsx, ChatPage.jsx homepage changes, HeroSection export. App.jsx staged via hash-object/update-index (same trick as notes). 4K sf_timelapse.mp4 now gitignored.
- GOTCHA: vite dev middleware only sets env vars that are undefined → restart dev server after editing .env.local (a stale CALENDAR_IDS showed 3 busy days instead of 19).
- TODO: live test booking; enter live /privacy + /tos URLs in Google Auth Platform → Branding; optional rotate client secret (pasted in chat).
- 2026-09-28 result: all 3 variants built+polished, 0 console errors (only favicon 404, pre-existing — public/ has no favicon). Judges (Netflix-designer lens + recruiter lens) both ranked **C (key-art posters) first, 7.5/10**; A/B split 2nd/3rd. Common language that emerged across all 3 and worked: Anton condensed titles, mono "STARRING python · react" credit lines from real tags, amber as sole accent, no Netflix red. Awaiting user pick. Screens: scratchpad/final/{A,B,C}.
- 2026-09-28 round 2: user picked C but called it "boring and AI sloppy"; wants **genuinely minimal/majestic, iPhone/apple.com style**, open to bento. Deleted A/B. New routes `/projects-d` (bento), `-e` (apple.com chapters), `-f` (typographic index w/ cursor preview), `-g` (bold bento + expanding cards). Brief has explicit anti-slop rules (no mono letter-spaced labels, no gimmick copy, no pills/glows, one type family, whitespace). Dev server for user: **port 5280** (5173 is a different project — don't use it).

## 2026-09-28 (b) — /schedule mobile
- Phone (<lg) layout: card fades away when a day's sheet is open; sky + big clock (64–92px, centered) show above a 52dvh sheet (61dvh if <700px tall). Sheet = iOS-picker style: fixed reading line at list middle, passive scroll listener maps scrollTop→time→onPreview (sky follows, 0 React renders — verified 390/360/430/320 widths, clock 8:00→11:14→8:00). Tap free slot = pick + smooth-scroll under the line; sticky footer w/ picked time + Continue. Rows 44px, inputs 16px (no iOS zoom), no autofocus on touch, no horizontal scroll at 320.
- Desktop pixel-identical (hover shot before/after). Built by Sonnet agent; I reviewed screenshots. UNVERIFIED on a real phone: scroll momentum/feel on iOS, keyboard on details form. Small screens (≤640 tall): card's Continue is below the fold (sheet's is always visible). Landscape not designed for.

## 2026-09-28 (c) — iPhone: sky frozen for the morning hours
- **Symptom** (real iPhone only; PC phone-emulation fine): moving through the first hours of the morning didn't change the scene.
- **Cause (mechanism reproduced, iOS itself NOT testable here — no WebKit)**: LO frames load nearest-to-"now" first (night ≈ frame 96 → morning frames 0..~50 load LAST). All 97 full LO bitmaps ≈ 290 MB; if iOS refuses/exhausts decode memory part-way, the catch{} swallowed it and `nearest()` served the closest decoded frame → the whole undecoded range showed ONE frame. Simulated by making createImageBitmap reject after 45 calls: canvas hash for sky @1.9/2.3/2.6/3.0/3.4/4.0/4.6/6.2s all identical (1353205927) = frozen; 8.0s and 9.9s (decoded end) differed.
- **Fix (skyFrames.js)**: (1) coverage-first load order (every 12th, 4th, 2nd, then all; nearest-to-now within each pass) so the whole day has frames early; (2) draw() blends the nearest DECODED frames on either side (bracket) instead of nearest-one → sparse set still dissolves smoothly; redraw only when a landing frame is inside the on-screen bracket; (3) phones (coarse pointer + viewport aspect ≤0.78) load new `sf_frames_md/` = hi frames cropped to centre 46% × 576px tall (470×576, 3.7 MB, ≈105 MB decoded vs 290) — identical framing since both are centre-cover (verified min mean-abs-diff at 0px shift vs HI layer); HI_KEEP 6→3 on phones. vercel.json cache header covers md.
- **Verified**: same 45-failure simulation now → 10 distinct hashes across the morning (was frozen); no-failure run distinct too; desktop still uses 'lo'. If it's STILL wrong on the iPhone, next suspects: HI (2560w) decode on iOS, or iOS scroll events on the sheet — ask for a screen recording / Safari Web Inspector console.
