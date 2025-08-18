from ultralytics import YOLO
import mediapipe as mp
import cv2
import numpy as np

# If your source is a .mov on Windows, convert first (recommended):
# ffmpeg -i input.mov -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k output.mp4
# conda create -n pose python=3.10 -y
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
# pip install ultralytics mediapipe opencv-python

# --- CONFIG ---
VIDEO_PATH = r"prepose1.mp4"          # input video (mp4 recommended on Windows)
OUT_PATH   = r"postpose1.mp4"         # output video path
VERBOSE    = False                    # Ultralytics logging for per-frame inference
DRAW_HAND_CONNECTIONS = False         # set True to draw MediaPipe hand skeleton lines
# ---------------

# Load YOLO body pose model (17 COCO keypoints)
body_model = YOLO("yolo11n-pose.pt")

# Prepare MediaPipe Hands (tuned for video)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,         # video stream (tracking across frames)
    max_num_hands=2,                 # allow multiple hands
    model_complexity=1,              # 0 for speed, 1/2 for accuracy
    min_detection_confidence=0.1,
    min_tracking_confidence=0.1
)
mp_draw = mp.solutions.drawing_utils

# Open input video
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    raise SystemExit(f"Cannot open video: {VIDEO_PATH}")

fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
W   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
H   = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Create writer (MP4)
fourcc = cv2.VideoWriter_fourcc(*"mp4v")   # if playback is an issue, try "avc1"
writer = cv2.VideoWriter(OUT_PATH, fourcc, fps, (W, H))

frame_idx = 0

# Iterate YOLO body pose as a stream (keeps memory steady)
for result in body_model.predict(source=VIDEO_PATH, stream=True, verbose=VERBOSE):
    # base = raw frame (BGR), im = YOLO skeleton (no boxes)
    base = result.orig_img.copy()
    im   = result.plot(boxes=False).copy()   # preserves YOLO body skeleton lines

    # ---- MediaPipe Hands on the same raw frame ----
    # MediaPipe expects RGB
    rgb = cv2.cvtColor(base, cv2.COLOR_BGR2RGB)
    hres = hands.process(rgb)

    if hres.multi_hand_landmarks:
        for hand_landmarks in hres.multi_hand_landmarks:
            # Draw hand keypoints (red dots) — matches your earlier style
            for lm in hand_landmarks.landmark:
                x = int(lm.x * W)
                y = int(lm.y * H)
                if 0 <= x < W and 0 <= y < H:
                    cv2.circle(im, (x, y), 2, (0, 0, 255), -1)

            # Optional: draw MediaPipe hand skeleton connections
            if DRAW_HAND_CONNECTIONS:
                mp_draw.draw_landmarks(
                    im, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                    landmark_drawing_spec=mp_draw.DrawingSpec(color=(0,0,255), thickness=1, circle_radius=1),
                    connection_drawing_spec=mp_draw.DrawingSpec(color=(0,0,255), thickness=1)
                )

    writer.write(im)
    frame_idx += 1
    if frame_idx % 50 == 0:
        print(f"Processed {frame_idx} frames...")

cap.release()
writer.release()
hands.close()
print(f"Saved video: {OUT_PATH}")
