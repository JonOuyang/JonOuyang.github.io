import cv2
import numpy as np
import argparse

def get_mean_and_std(x):
    x_mean, x_std = cv2.meanStdDev(x)
    x_mean = np.hstack(np.around(x_mean, 2))
    x_std = np.hstack(np.around(x_std, 2))
    return x_mean, x_std

def color_transfer(source, target):
    # Convert images from BGR to LAB color space
    # LAB separates "Lightness" (L) from "Color" (A and B)
    source_lab = cv2.cvtColor(source, cv2.COLOR_BGR2LAB).astype("float32")
    target_lab = cv2.cvtColor(target, cv2.COLOR_BGR2LAB).astype("float32")

    # Compute color statistics for both images
    (l_mean_src, l_std_src) = get_mean_and_std(source_lab)
    (l_mean_tar, l_std_tar) = get_mean_and_std(target_lab)

    # Split the LAB channels
    (l, a, b) = cv2.split(target_lab)

    # Subtract the means from the target image
    l -= l_mean_tar[0]
    a -= l_mean_tar[1]
    b -= l_mean_tar[2]

    # Scale by the standard deviations (this creates the "Vibe Match")
    # If the anime image has low contrast (low std dev), this will lower your contrast.
    l = (l_std_src[0] / l_std_tar[0]) * l
    a = (l_std_src[1] / l_std_tar[1]) * a
    b = (l_std_src[2] / l_std_tar[2]) * b

    # Add the source mean
    l += l_mean_src[0]
    a += l_mean_src[1]
    b += l_mean_src[2]

    # Clip values to valid range [0, 255]
    l = np.clip(l, 0, 255)
    a = np.clip(a, 0, 255)
    b = np.clip(b, 0, 255)

    # Merge channels back and convert to BGR
    transfer = cv2.merge([l, a, b])
    transfer = cv2.cvtColor(transfer.astype("uint8"), cv2.COLOR_LAB2BGR)
    
    return transfer

# --- MAIN EXECUTION ---
# CHANGE THESE FILENAMES TO MATCH YOURS
# Treat the home hero alt as the ground truth reference.
reference_image_path = "public/assets/images/home-hero-alt.jpg"
target_image_path = "public/assets/images/mainheadshot.png"
output_path = "public/assets/images/mainheadshot_color_corrected.jpg"

try:
    print(f"Reading {reference_image_path}...")
    src = cv2.imread(reference_image_path)
    print(f"Reading {target_image_path}...")
    tgt = cv2.imread(target_image_path)

    if src is None or tgt is None:
        print("Error: Could not find one of the images. Check filenames!")
    else:
        print("Calculating color statistics and applying transfer...")
        # Apply the transfer
        result = color_transfer(src, tgt)
        
        # Save the result
        cv2.imwrite(output_path, result)
        print(f"Success! Saved as {output_path}")
        print("Use this new image on your website and remove the CSS filters.")

except Exception as e:
    print(f"An error occurred: {e}")
