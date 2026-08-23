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
