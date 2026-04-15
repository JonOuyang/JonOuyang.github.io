import os
import shutil
import random
import math
import subprocess
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

# Configuration
WIDTH, HEIGHT = 1280, 720
FPS = 30
DURATION = 4.0
TOTAL_FRAMES = int(FPS * DURATION)
OUTPUT_DIR = "intro_frames"
MP4_OUTPUT = "public/assets/videos/netflix_intro.mp4"

# N Geometry Specs (Relative to a 1000x1000 square)
# Netflix N proportions are approximately:
N_WIDTH = 240
N_HEIGHT = 360
BAR_W = N_WIDTH / 3.0

# Colors
NETFLIX_RED = (228, 9, 19)
DARK_RED = (177, 6, 15) # For diagonal
BLACK = (0, 0, 0, 255)

# Light Strand Colors (from the original JSX)
LAMP_COLORS_HEX = [
    '#ff0100', '#ffde01', '#ff00cc', '#04fd8f', '#ff0100',
    '#ff9600', '#0084ff', '#f84006', '#ffc601', '#ff4800',
    '#fd0100', '#01ffff', '#ffc601', '#ffc601', '#0078fe',
    '#0080ff', '#ffae01', '#ff00bf', '#a601f4', '#f30b34',
    '#ff00bf', '#04fd8f', '#01ffff', '#a201ff', '#ec0014',
    '#0078fe', '#ff0036', '#06f98c'
]

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

LAMP_COLORS = [hex_to_rgb(c) for c in LAMP_COLORS_HEX]

def get_strands(count=150):
    strands = []
    for _ in range(count):
        # Position in the bar (0.0 to 1.0)
        x = random.uniform(0, 1)
        # Width of strand
        w = random.uniform(0.005, 0.03)
        # Random vertical offsets
        y_top = random.uniform(-0.5, 0.0)
        y_bot = random.uniform(1.0, 1.5)
        # Choose a color from the lamp list
        color = random.choice(LAMP_COLORS)
        # Alpha/Brightness
        alpha = random.randint(150, 255)
        strands.append({'x': x, 'w': w, 'yt': y_top, 'yb': y_bot, 'color': color, 'alpha': alpha})
    return strands

STRANDS = get_strands(200)

def render_frame(frame_idx):
    t = frame_idx / TOTAL_FRAMES
    
    # Timing
    # 0.0 - 0.1s: Black screen / Intro
    # 0.1 - 0.6s: Reveal of the 3 bars
    # 0.6 - 1.2s: Logo Pause
    # 1.2 - 4.0s: Zoom into left bar
    
    # Zoom logic
    zoom_t = 0
    if t > 0.3:
        # Logistic curve for zoom - starts slow, then very fast
        zoom_t = (t - 0.3) / 0.7
    
    # Scale formula
    scale = 1.0 + (zoom_t**3.5) * 80.0
    
    # Canvas
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
    
    # Origin for zoom is center of the left bar
    lx1 = (WIDTH/2) - (N_WIDTH/2)
    lx2 = lx1 + BAR_W
    origin_x = lx1 + (BAR_W / 2)
    origin_y = HEIGHT / 2

    def transform(x, y):
        # Apply scale around origin_x, origin_y
        nx = (x - origin_x) * scale + origin_x
        ny = (y - origin_y) * scale + origin_y
        return (nx, ny)

    # N Coordinates (original size)
    rx1 = (WIDTH/2) + (N_WIDTH/2) - BAR_W
    rx2 = rx1 + BAR_W
    top = (HEIGHT/2) - (N_HEIGHT/2)
    bot = (HEIGHT/2) + (N_HEIGHT/2)

    # N Reveal logic (0.1 to 0.6s)
    reveal_t = min(1.0, max(0.0, (t - 0.1) / 0.5))
    r1 = min(1.0, reveal_t * 3.0)
    r_diag = min(1.0, max(0.0, reveal_t * 3.0 - 1.0))
    r2 = min(1.0, max(0.0, reveal_t * 3.0 - 2.0))

    # Strand mix (fades from red to multicolored as we zoom)
    strand_mix = min(1.0, max(0.0, (zoom_t - 0.1) * 4.0))

    # Temporary layer for N
    n_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(n_layer)

    # 1. Left Bar
    if r1 > 0:
        y1 = top
        y2 = top + (bot - top) * r1
        
        if strand_mix > 0:
            # Draw strands
            for s in STRANDS:
                sx1 = lx1 + s['x'] * BAR_W
                sx2 = sx1 + s['w'] * BAR_W
                sy1 = top + s['yt'] * (bot - top)
                sy2 = top + s['yb'] * (bot - top)
                
                # Blend color from red to strand color
                c = s['color']
                final_c = (
                    int(NETFLIX_RED[0] * (1-strand_mix) + c[0] * strand_mix),
                    int(NETFLIX_RED[1] * (1-strand_mix) + c[1] * strand_mix),
                    int(NETFLIX_RED[2] * (1-strand_mix) + c[2] * strand_mix),
                    int(255 * strand_mix + 255 * (1-strand_mix)) # Keep solid
                )
                
                p = [transform(sx1, sy1), transform(sx2, sy1), transform(sx2, sy2), transform(sx1, sy2)]
                draw.polygon(p, fill=final_c)
        
        if strand_mix < 1.0:
            # Solid red part
            p = [transform(lx1, y1), transform(lx2, y1), transform(lx2, y2), transform(lx1, y2)]
            draw.polygon(p, fill=NETFLIX_RED + (int(255 * (1-strand_mix)),))

    # 2. Diagonal Bar
    if r_diag > 0:
        # Diagonal reveal: Top connects to Top of Left, Bottom moves towards Bottom of Right
        dx1 = lx1 + (rx1 - lx1) * r_diag
        dx2 = lx2 + (rx2 - lx2) * r_diag
        dy = top + (bot - top) * r_diag
        
        p = [transform(lx1, top), transform(lx2, top), transform(dx2, dy), transform(dx1, dy)]
        # We can also add a drop shadow here by drawing it first
        draw.polygon(p, fill=DARK_RED + (255,))

    # 3. Right Bar
    if r2 > 0:
        y1 = top
        y2 = top + (bot - top) * r2
        p = [transform(rx1, y1), transform(rx2, y1), transform(rx2, y2), transform(rx1, y2)]
        draw.polygon(p, fill=NETFLIX_RED + (255,))

    # Mask for the bottom curve (Ribbon effect)
    # We'll use a black ellipse centered below the N
    if scale < 50:
        mask_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        m_draw = ImageDraw.Draw(mask_layer)
        # Ellipse at bottom of N
        ell_y = bot + 10
        ell_rx = N_WIDTH * 0.7
        ell_ry = 35
        m_p1 = transform((WIDTH/2) - ell_rx, ell_y - ell_ry)
        m_p2 = transform((WIDTH/2) + ell_rx, ell_y + ell_ry)
        m_draw.ellipse([m_p1, m_p2], fill=(0,0,0,255))
        n_layer.paste((0,0,0,0), (0,0), mask=mask_layer.convert("L"))

    # Apply Glow as we zoom
    if zoom_t > 0.4:
        # Bloom effect
        bloom = n_layer.filter(ImageFilter.GaussianBlur(radius=(zoom_t-0.4)*15.0))
        img.alpha_composite(bloom) # Background glow
        
    img.alpha_composite(n_layer)

    # Final Image Post-processing
    res = img.convert("RGB")
    if zoom_t > 0.5:
        # Increase saturation and brightness
        enhancer = ImageEnhance.Color(res)
        res = enhancer.enhance(1.0 + (zoom_t - 0.5) * 1.5)
        enhancer = ImageEnhance.Brightness(res)
        res = enhancer.enhance(1.0 + (zoom_t - 0.5) * 1.2)
        
    return res

def main():
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)
    
    print(f"Generating {TOTAL_FRAMES} frames...")
    for i in range(TOTAL_FRAMES):
        if i % 10 == 0:
            print(f"Frame {i}/{TOTAL_FRAMES}")
        img = render_frame(i)
        img.save(os.path.join(OUTPUT_DIR, f"frame_{i:03d}.png"))
    
    print("Encoding video with ffmpeg...")
    subprocess.run([
        "ffmpeg", "-y", "-r", str(FPS),
        "-i", os.path.join(OUTPUT_DIR, "frame_%03d.png"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16",
        MP4_OUTPUT
    ], check=True)
    
    print(f"Done! Video saved to {MP4_OUTPUT}")
    shutil.rmtree(OUTPUT_DIR)

if __name__ == "__main__":
    main()
