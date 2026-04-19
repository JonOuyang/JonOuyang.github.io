from PIL import Image
import glob
import os

frames = sorted(glob.glob("gt_frames/*.png"))
print(f"Total frames: {len(frames)}")

# Analyze frame 80 (about 3.3 seconds in)
if len(frames) > 80:
    img = Image.open(frames[80])
    w, h = img.size
    print(f"Frame 80 size: {w}x{h}")
    # Sample a horizontal line across the middle
    y = h // 2
    pixels = img.load()
    row = [pixels[x, y] for x in range(w)]
    
    # Just print the R,G,B values down-sampled to see the structure
    sampled = [row[x] for x in range(0, w, 5)]
    # print(sampled)
