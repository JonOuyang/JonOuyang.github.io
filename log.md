# Development Log

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
