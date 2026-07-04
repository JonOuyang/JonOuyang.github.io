# `/walk` — dark-figure walking silhouette

A landscape wordmark of the name on white, with a **transparent dark silhouette** of
me walking, centered *in front of* the letters so the body hides the middle of the
word (you read the visible edges and your eye completes it — the figure becomes part
of the typography). The figure plays a **standing→walking intro once**, then loops the
walk **forever, seamlessly**.

That "seamlessly" is the whole story. The source footage is a one-off handheld clip —
me walking toward a backing-up camera — so the gait is **not periodic** and there is no
clean hard-cut loop. Getting it to loop without a visible pop, freeze, blur, or
lighting flicker took a long chain of fixes, recorded below so we never re-derive them.

> The heavy image/video pipeline (Python, SAM, RIFE, the grade) lives in the
> **gitignored** `hidden-local/` dir — see `hidden-local/PIPELINE.md` for the canonical
> stage-by-stage reference and the exact scripts/knobs. This README is the committed,
> web-side + high-level record.

---

## Files that ship

```
public/assets/walk/
  loop.webm        VP9 + alpha (yuva420p)   — the seamless walk cycle (Chrome/Firefox)
  loop.mov         HEVC + alpha (hvc1)      — same, for Safari (can't decode VP9-alpha)
  intro.webm/.mov  standing → begins walking, plays ONCE
  intro_poster.webp first-frame still, covers the white gap before the video paints
src/experimental/walk/WalkPage.jsx          the page + playback engine
```

Everything is a **straight-alpha transparent silhouette composited over the white
page** — only the alpha *shape* and the crushed-dark figure color matter, so the page
color is what all edge-bleed pulls toward (invisible by construction).

---

## The pipeline (source → shipped loop)

Source `new_walk.MOV` (2160×3840 portrait, 60fps). Loop window = source frames
**161–263** (best pose-matched gait window); intro = source **0–160**. One unified
stabilize/crop pass over 0–263 so the intro→loop junction is continuous for free.

1. **Matte** (`refine_matte.py`) — full-frame SAM2 mask (robust, never loses the body)
   then a **guided-filter color-edge snap**: alpha is snapped to the source *luminance*
   edge, which is sub-pixel sharper than any SAM mask and flicker-stable (it follows the
   stable color, not SAM's per-frame wiggle). Crop-SAM upscaling was a trap (~18% of
   frames lost the whole body); vertical banding maximized flicker. Both rejected.
2. **Hole fill** (`fix_holes.py`) — fills enclosed matte dropouts (distressed-denim) and
   trims bright background bleed on the lower-body edge, with a **leg-gap guard** that
   skips the tall thin between-leg channel so the real gap survives.
3. **Stabilize + frame** (`virtcam.py`) — anchors the **torso centroid** (not the head,
   so head/feet bob naturally), landscape 1280×720, `BODY_FRAC=0.90 NOSE_Y=0.52`
   (head→below-knee with headroom above).
4. **Grade** (`render_final.py`, `TRANSPARENT=1`) — the crushed-dark "shadow" look.
   **Normalization is PINNED** in `config_final.json` so a regenerated frame set keeps
   the exact look (regenerating without the pin washes the grade out).
5. **Seam bridge + close** — the loop closure (see fixes below).
6. **Whiten bg** (`whiten_bg.py`) — force every alpha==0 pixel to pure white, last pass
   before encode, so edge bleed pulls toward the page color.
7. **Encode** — VP9-alpha webm + HEVC-alpha mov.

---

## The fixes (why each exists — do not re-open these)

**Crisp edge, not a mask edge.** For a dark figure on bright ground the razor edge is
in the *color*, not the segmentation. The guided-filter snap (step 1) is the win; every
edge-"perfection" experiment (defringe aura, GrabCut, hi-res re-SAM, Canny) made it
worse and was rejected. The thin grey halo at real scale is not worth chasing.

**Leg "static".** The flicker between the legs is a **matte** problem coupled to
shading, not figure noise: SAM kept a strip of bright background along the inner thigh,
and small gaps showed through. Fixed in the matte (bg-bleed trim + morphological close +
leg-region temporal/spatial median in `leg_destatic.py`), *not* by darkening. Over a
true white page the gap is a clean see-through; the old off-white preview exaggerated it.

**Face/torso halo.** A premultiplied **dark fringe** — the soft anti-aliased alpha ring
carries near-black figure color, which over white renders grey. Steepened the edge alpha
on the upper body (`edge_clean.py`); most residual shimmer is 720p staircase.

**The seam "jump" = a velocity discontinuity, not a position pop.** The old bridge eased
the geometry with a **smoothstep**, which has *zero* velocity at both endpoints, so the
figure decelerated to a stall at the seam while the real walk on either side moved at
constant speed — that velocity *step* is the jump. Fix: make the bridge's upper-body
morph progress **linear** in time (constant velocity), matching the real frames. The
bridge is a hybrid — **RIFE** (learned interpolation) for the fast lower body + **DIS
optical-flow morph** for the upper body (`rife_loop_bridge_geom.py`, `GEOM=linear`).

**The whole-body "pause/freeze" = the bridge was too long.** Bridge frames sit between
pose-matched endpoints, so they advance the gait *less* than a real frame → the figure
dwells. Longer bridge = longer freeze. Fix: **shorten it.** Shipped **K=7** (`?v=15`):
holds at natural walking speed with no dwell and no super-natural speed-up (K=6 darts
slightly fast; K≥8 the pause returns).

**The neck "light blip" at the wrap.** The grade applies a directional face shade with
an **ambient step at the neck** that follows the (non-periodic) head motion, so the face
dims ~6 levels over the last ~8 frames and resets at the wrap — a ~30× lighting step,
the biggest in the loop. Fixed at the source with `loop_face_relight.py` (`MODE=flat`):
measures figure-masked luminance in three bands relative to the per-frame neck row
(face / upper-neck / lower-neck — they drift in *opposite* directions, so they must be
measured **separately** or the correction cancels) and holds each band's brightness
constant across the loop. Face wrap-step 5.9 → ~1.3.

**The per-loop freeze from a frame-count mismatch.** `WalkPage`'s `TOTAL` constant must
equal the loop's actual frame count. If it's off by even one, the capture duplicates or
drops a frame at the wrap → a freeze/jump *every* loop, independent of content. Keep
`TOTAL` in sync with `ffprobe -count_frames public/assets/walk/loop.webm`.

**Measure, don't eyeball.** Every one of these was found with an objective metric
(dense optical-flow velocity/acceleration masked to the figure; per-band luminance;
Laplacian sharpness), not by asking "does it look smoother?" A *pause* is a velocity
**dip**, not an acceleration spike — a smooth glide into a freeze has low acceleration,
so accel metrics missed it. Always mask flow to figure pixels (alpha>20); a whole-frame
mask dilutes with background noise and gives false spikes.

---

## Web playback architecture (`WalkPage.jsx`)

Native `<video loop>` has a **seek-stall at the wrap** (a visible hitch every loop). So
the primary playback path does **not** use it:

- **Primary — canvas rAF of pre-captured frames.** During the intro, we capture all
  `TOTAL` loop frames from the shipped webm into cropped alpha `ImageBitmap`s (cropped to
  the figure bbox `CROP` to cut memory ~78%), then play them on a `<canvas>` with a
  time-accumulator (`idx = (idx+1) % TOTAL`) that advances one media-frame per `1000/FPS`
  ms independent of display refresh (120 Hz-safe). The wrap is just a modulo — **no seek,
  no stall.**
- **Fallback — native `<video loop>`.** Runs until frames are captured, or if
  `createImageBitmap`/`requestVideoFrameCallback` are unsupported, or if the alpha sanity
  check fails (some HEVC readback paths drop alpha — we detect a non-transparent crop
  corner and keep the native video, which composites alpha correctly).
- **Safari** can't decode VP9-alpha (it would show the raw video, background and all), so
  it's served the HEVC-alpha `.mov` via a UA sniff.
- **No white flash on load:** the intro is revealed only on its *first presented frame*
  (a visible-but-undecoded `<video>` paints nothing), with `intro_poster.webp` held under
  it to cover the gap and dropped the instant that frame paints.

Because the canvas holds every frame in memory, playback is locked to **720p** — a 4K
loop would be ~3.6 GB of bitmaps (tab crash) for zero gain, since the canvas is 1280×720.
4K is only worth rendering as an **external** ProRes deliverable, not for the site.

### Debug modes (query-param gated; harmless in prod)
- `/walk?step` — frame-stepper over lossless PNGs in `/_stepframes/` (gitignored).
- `/walk?diag` — paints the biggest frame-to-frame light change red + a per-loop metric.
- `/walk?probe` — live HUD of the active playback path, frame dt, skips, and wrap timing.

---

## Regenerating the loop

Run the pipeline from `hidden-local/` (see `PIPELINE.md` for exact envs), current order:

```
pristine reals (loop_bak_jul3)
  → loop_face_relight.py  MODE=flat        # neck light-blip fix
  → rife_loop_bridge_geom.py  GEOM=linear K=7   # seam: linear velocity, short dwell
  → whiten_bg.py
  → encode  webm (VP9 yuva420p) + mov (HEVC hvc1 alpha)
```

Then in `WalkPage.jsx`:
1. Set **`TOTAL`** = `ffprobe -count_frames public/assets/walk/loop.webm` (103 real + K bridge).
2. Bump **`ASSET_V`** (`?v=N`) to bust the browser cache.

### Key constants (`WalkPage.jsx`)
| const | value | meaning |
|-------|-------|---------|
| `TOTAL` | `110` | loop frame count (103 real + 7 bridge) — **must match the webm** |
| `FPS` | `60` | playback rate |
| `LAST_REAL` | `102` | last real frame; `103..109` are the RIFE bridge |
| `ASSET_V` | `?v=15` | cache-bust token; bump on every re-render |
| `CROP` | `{478,68,318,652}` | figure bbox the capture crops to |
