from ultralytics import YOLO
import mediapipe as mp
import cv2
import numpy as np
import json

# If your source is a .mov on Windows, convert first (recommended):
# ffmpeg -i input.mov -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k output.mp4
# conda create -n pose python=3.10 -y
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
# pip install ultralytics mediapipe opencv-python

# --- CONFIG ---
VIDEO_PATH = r"prepose1.mp4"          # input video (mp4 recommended on Windows)
OUT_PATH   = r"postpose1.mp4"         # output video path
KEYPOINTS_JSONL = r"prepose1_keypoints.jsonl"  # raw keypoints dump (one JSON per frame)
VERBOSE    = False                    # Ultralytics logging for per-frame inference
DRAW_HAND_CONNECTIONS = False         # True = draw MediaPipe hand skeleton lines

# Wrist-crop tuning:
CROP_SCALE = 2.2                      # side ~ CROP_SCALE * forearm length
CROP_HALF_MIN, CROP_HALF_MAX = 48, 192  # clamp half-size in pixels

# MediaPipe thresholds:
MP_MIN_DET_CONF = 0.15
MP_MIN_TRK_CONF = 0.15
MP_MODEL_COMPLEXITY = 1               # 0 fast / 1 default / 2 accurate
# ---------------

# COCO body kpt indices
L_ELBOW, R_ELBOW = 7, 8
L_WRIST, R_WRIST = 9, 10

# Load YOLO body pose (17 kpts) – uses GPU if available
body_model = YOLO("yolo11n-pose.pt")

# MediaPipe Hands for crops (static_image_mode=True forces detection each call)
mp_hands = mp.solutions.hands
hands_crop = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,  # per-wrist crop usually has one hand
    model_complexity=MP_MODEL_COMPLEXITY,
    min_detection_confidence=MP_MIN_DET_CONF,
    min_tracking_confidence=MP_MIN_TRK_CONF
)
mp_draw = mp.solutions.drawing_utils

def crop_box_from_wrist(img_w, img_h, person_kpts, wrist_idx, elbow_idx):
    """Square crop centered on wrist. Size ~ CROP_SCALE * forearm length, clamped."""
    wx, wy = person_kpts[wrist_idx]
    ex, ey = person_kpts[elbow_idx]
    if np.isnan(wx) or np.isnan(wy) or np.isnan(ex) or np.isnan(ey):
        return None
    forearm = float(np.hypot(wx - ex, wy - ey))
    half = int(np.clip(CROP_SCALE * forearm * 0.5, CROP_HALF_MIN, CROP_HALF_MAX))
    cx, cy = int(round(wx)), int(round(wy))
    x1, y1 = max(0, cx - half), max(0, cy - half)
    x2, y2 = min(img_w, cx + half), min(img_h, cy + half)
    if x2 <= x1 or y2 <= y1:
        return None
    return (x1, y1, x2, y2)

# Open input video
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    raise SystemExit(f"Cannot open video: {VIDEO_PATH}")

fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
W   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
H   = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Writer (MP4)
fourcc = cv2.VideoWriter_fourcc(*"mp4v")  # use "avc1" if mp4v won't play
writer = cv2.VideoWriter(OUT_PATH, fourcc, fps, (W, H))

# Open keypoints JSONL for streaming writes
kp_out = open(KEYPOINTS_JSONL, "w", encoding="utf-8")

frame_idx = 0

# Stream YOLO pose over the video
for result in body_model.predict(source=VIDEO_PATH, stream=True, verbose=VERBOSE):
    base = result.orig_img.copy()            # raw BGR frame
    im   = result.plot(boxes=False).copy()   # YOLO skeleton (lines kept, no boxes)

    # Prepare per-frame data structure for saving
    frame_rec = {
        "frame_index": int(frame_idx),
        "timestamp_sec": float(frame_idx / fps),
        "size": {"width": W, "height": H},
        "people": []
    }

    if result.keypoints is not None:
        all_xy  = result.keypoints.xy.cpu().numpy()             # (N,17,2)
        all_conf = None
        try:
            if result.keypoints.conf is not None:
                all_conf = result.keypoints.conf.cpu().numpy()  # (N,17)
        except Exception:
            all_conf = None

        for p_idx, person in enumerate(all_xy):
            # --- save body keypoints (COCO-17) ---
            body = []
            for j, (x, y) in enumerate(person):
                conf = float(all_conf[p_idx, j]) if all_conf is not None else None
                body.append({"x": float(x), "y": float(y), "conf": conf})

            person_rec = {"id": int(p_idx), "body": {"format": "coco17", "keypoints": body}, "hands": []}

            # --- left hand crop ---
            box = crop_box_from_wrist(W, H, person, L_WRIST, L_ELBOW)
            if box:
                x1, y1, x2, y2 = box
                crop = base[y1:y2, x1:x2]
                if crop.size:
                    rgb_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
                    hres = hands_crop.process(rgb_crop)

                    if hres.multi_hand_landmarks:
                        # If available, MediaPipe also returns handedness per hand
                        handed = hres.multi_handedness or []
                        for idx_h, hand_lms in enumerate(hres.multi_hand_landmarks):
                            # draw (red dots) + optional connections
                            keypoints = []
                            for lm in hand_lms.landmark:
                                px = x1 + lm.x * (x2 - x1)
                                py = y1 + lm.y * (y2 - y1)
                                keypoints.append({"x": float(px), "y": float(py), "z": float(lm.z)})

                                cv2.circle(im, (int(px), int(py)), 2, (0, 0, 255), -1)

                            if DRAW_HAND_CONNECTIONS:
                                for a, b in mp_hands.HAND_CONNECTIONS:
                                    la, lb = hand_lms.landmark[a], hand_lms.landmark[b]
                                    ax = int(x1 + la.x * (x2 - x1)); ay = int(y1 + la.y * (y2 - y1))
                                    bx = int(x1 + lb.x * (x2 - x1)); by = int(y1 + lb.y * (y2 - y1))
                                    cv2.line(im, (ax, ay), (bx, by), (0, 0, 255), 1, cv2.LINE_AA)

                            # save
                            label = None
                            score = None
                            if idx_h < len(handed):
                                c = handed[idx_h].classification[0]
                                label = c.label
                                score = float(c.score)
                            person_rec["hands"].append({
                                "side_from_crop": "left",
                                "mp_handedness_label": label,
                                "mp_handedness_score": score,
                                "box": [int(x1), int(y1), int(x2), int(y2)],
                                "keypoints_21": keypoints
                            })

            # --- right hand crop ---
            box = crop_box_from_wrist(W, H, person, R_WRIST, R_ELBOW)
            if box:
                x1, y1, x2, y2 = box
                crop = base[y1:y2, x1:x2]
                if crop.size:
                    rgb_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
                    hres = hands_crop.process(rgb_crop)

                    if hres.multi_hand_landmarks:
                        handed = hres.multi_handedness or []
                        for idx_h, hand_lms in enumerate(hres.multi_hand_landmarks):
                            keypoints = []
                            for lm in hand_lms.landmark:
                                px = x1 + lm.x * (x2 - x1)
                                py = y1 + lm.y * (y2 - y1)
                                keypoints.append({"x": float(px), "y": float(py), "z": float(lm.z)})
                                cv2.circle(im, (int(px), int(py)), 2, (0, 0, 255), -1)

                            if DRAW_HAND_CONNECTIONS:
                                for a, b in mp_hands.HAND_CONNECTIONS:
                                    la, lb = hand_lms.landmark[a], hand_lms.landmark[b]
                                    ax = int(x1 + la.x * (x2 - x1)); ay = int(y1 + la.y * (y2 - y1))
                                    bx = int(x1 + lb.x * (x2 - x1)); by = int(y1 + lb.y * (y2 - y1))
                                    cv2.line(im, (ax, ay), (bx, by), (0, 0, 255), 1, cv2.LINE_AA)

                            label = None
                            score = None
                            if idx_h < len(handed):
                                c = handed[idx_h].classification[0]
                                label = c.label
                                score = float(c.score)
                            person_rec["hands"].append({
                                "side_from_crop": "right",
                                "mp_handedness_label": label,
                                "mp_handedness_score": score,
                                "box": [int(x1), int(y1), int(x2), int(y2)],
                                "keypoints_21": keypoints
                            })

            frame_rec["people"].append(person_rec)

    # write frame’s record to JSONL
    json.dump(frame_rec, kp_out, ensure_ascii=False, separators=(",", ":"))
    kp_out.write("\n")

    # write video frame
    writer.write(im)
    frame_idx += 1
    if frame_idx % 50 == 0:
        print(f"Processed {frame_idx} frames...")

cap.release()
writer.release()
hands_crop.close()
kp_out.close()
print(f"Saved video: {OUT_PATH}")
print(f"Saved keypoints (JSONL): {KEYPOINTS_JSONL}")
