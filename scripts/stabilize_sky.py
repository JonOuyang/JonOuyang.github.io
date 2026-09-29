"""
Build the /schedule sky frames from the 4K timelapse with the camera move removed.

The source clip slowly pulls back (~7% zoom) and tilts up. We estimate a similarity
transform from every frame directly to the middle frame (ORB + RANSAC), smooth the
path, re-base on the reference frame that needs the least crop, and zoom in just
enough that no warped frame shows a border.

Outputs (overwrites):
  public/assets/videos/sf_frames_hi/NNN.webp  2560w  (sharp resting frames)
  public/assets/videos/sf_frames_lo/NNN.webp  1152w  (preloaded, used while moving; lightly sharpened)

Run:  uv run --with opencv-python-headless --with numpy python scripts/stabilize_sky.py
Constants must match src/schedule/skyFrames.js (FPS, FIRST_SEC, COUNT); bump FRAMES_VERSION there after re-running.
"""
import sys, cv2, numpy as np
from pathlib import Path

SRC = 'public/assets/videos/sf_timelapse.mp4'
OUT = Path('public/assets/videos')
FIRST_SEC, LAST_SEC, FPS = 1.9, 9.95, 12
LIMIT = int(sys.argv[1]) if len(sys.argv) > 1 else None  # e.g. 5 for a quick test run

# ── 1. read the frames we need (source is 24 fps; take every 2nd from FIRST_SEC) ──
cap = cv2.VideoCapture(SRC)
src_fps = cap.get(cv2.CAP_PROP_FPS)
frames, idx = [], 0
want = [round((FIRST_SEC + k / FPS) * src_fps) for k in range(int((LAST_SEC - FIRST_SEC) * FPS) + 1)]
want_set = set(want)
while True:
    ok, f = cap.read()
    if not ok or idx > want[-1]:
        break
    if idx in want_set:
        frames.append(f)
        if LIMIT and len(frames) >= LIMIT:
            break
    idx += 1
n = len(frames)
H, W = frames[0].shape[:2]
print(f'{n} frames at {W}x{H} (source {src_fps:.0f} fps)')

# ── 2. consecutive similarity transforms on a 1280w grayscale copy ──
S = 1280 / W
small = [cv2.cvtColor(cv2.resize(f, None, fx=S, fy=S, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY) for f in frames]
orb = cv2.ORB_create(5000)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
feats = [orb.detectAndCompute(g, None) for g in small]

def to3(M):
    return np.vstack([M, [0, 0, 1]])

# T[i] maps frame i (full-res pixels) into the middle frame's pixel space. Matched DIRECTLY
# against that one anchor: chaining tiny frame-to-frame steps under-counted the slow zoom
# (each step's ~0.08% scale drowned in estimation noise; measured 90% of the zoom left).
mid = n // 2
km, dm = feats[mid]
T = []
for i in range(n):
    if i == mid:
        T.append(np.eye(3))
        continue
    k1, d1 = feats[i]
    m = sorted(bf.match(d1, dm), key=lambda x: x.distance)[:1500]
    a = np.float32([k1[x.queryIdx].pt for x in m]) / S
    b = np.float32([km[x.trainIdx].pt for x in m]) / S
    M, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=3)
    if M is None or inl.sum() < 30:
        print(f'  frame {i + 1}: weak match, copying neighbour')
        T.append(T[-1] if T else np.eye(3))
        continue
    T.append(to3(M))

# light temporal smoothing of the chained path (kills per-frame estimation jitter)
params = np.array([[np.hypot(t[0, 0], t[1, 0]), np.arctan2(t[1, 0], t[0, 0]), t[0, 2], t[1, 2]] for t in T])
k = np.array([1, 2, 3, 2, 1], float); k /= k.sum()
padded = np.pad(params, ((2, 2), (0, 0)), mode='edge')
params = np.stack([np.convolve(padded[:, j], k, mode='valid') for j in range(4)], 1)
def mat(p):
    s, r, tx, ty = p
    return np.array([[s * np.cos(r), -s * np.sin(r), tx], [s * np.sin(r), s * np.cos(r), ty], [0, 0, 1]])
T = [mat(p) for p in params]

# ── 3. pick the reference frame that needs the least crop, and that crop ──
corners = np.array([[0, 0, 1], [W, 0, 1], [W, H, 1], [0, H, 1]], float).T
cx, cy = W / 2, H / 2

def crop_for(Ts):
    need = 1.0
    for t in Ts:
        c = t @ corners  # frame corners in reference space
        xs, ys = c[0], c[1]
        left, right = max(xs[0], xs[3]), min(xs[1], xs[2])
        top, bot = max(ys[0], ys[1]), min(ys[2], ys[3])
        need = max(need, (W / 2) / min(cx - left, right - cx), (H / 2) / min(cy - top, bot - cy))
    return need

best = min(range(n), key=lambda r: crop_for([np.linalg.inv(T[r]) @ t for t in T]))
T = [np.linalg.inv(T[best]) @ t for t in T]
crop = crop_for(T) * 1.002
print(f'reference frame {best + 1}, safety crop zoom: {crop:.4f}')
C = np.array([[crop, 0, cx - crop * cx], [0, crop, cy - crop * cy], [0, 0, 1]])

# ── 4. warp + write ──
for tier in ('hi', 'lo'):
    (OUT / f'sf_frames_{tier}').mkdir(parents=True, exist_ok=True)
for i, (f, t) in enumerate(zip(frames, T)):
    warped = cv2.warpAffine(f, (C @ t)[:2], (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    for tier, w, q in (('hi', 2560, 84), ('lo', 1152, 76)):
        img = cv2.resize(warped, (w, round(H * w / W / 2) * 2), interpolation=cv2.INTER_AREA)
        if tier == 'lo':
            # light unsharp mask so the moving frames sit closer to the sharp resting ones
            img = cv2.addWeighted(img, 1.45, cv2.GaussianBlur(img, (0, 0), 1.1), -0.45, 0)
        cv2.imwrite(str(OUT / f'sf_frames_{tier}' / f'{i + 1:03d}.webp'), img, [cv2.IMWRITE_WEBP_QUALITY, q])
    if i % 20 == 0:
        print(f'  wrote {i + 1}/{n}')
print('done')
