---
{
  "id": 14,
  "slug": "pose-estimation-for-automated-swimmer-technique-feedback",
  "title": "Pose Estimation for Automated Swimmer Technique Feedback",
  "subtitle": "Real-time swimmer action recognition using pose estimation to deliver technique feedback.",
  "date": "Feb 2024",
  "readTime": "7 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Lead Researcher",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Chang Choo",
      "role": "Advisor, SJSU AI/DL FPGA/DSP Lab",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {},
  "heroImage": "/assets/images/sjsu.jpg",
  "heroCaption": "Figure 1: Pose-driven technique feedback for swimmer performance analysis."
}
---

## Introduction

Coaching swimmers requires detailed observation of body posture, stroke timing, and subtle technique errors that are difficult to track consistently. This project builds a real-time pose estimation system to automate swimmer technique feedback using video-based analysis.

## Background and Motivation

Most swimmers receive feedback through manual coaching, which is time-intensive and subjective. Pose estimation enables objective, repeatable analysis by converting video frames into structured keypoints that can be analyzed at scale. This approach can surface measurable signals like joint angles, tempo, and symmetry, making technique assessment more accessible.

## System Overview

The system combines person detection with keypoint estimation to isolate swimmers and track body joints across time. Temporal smoothing improves stability under motion blur and water splash, while action recognition models classify technique patterns and identify deviations from expected form.

## Our Work

I led a small team to build a TensorFlow-based swimmer action recognition pipeline using CMU OpenPose for keypoints and YOLOv7 for detection. We designed data augmentation strategies to improve robustness and optimized the model for real-time performance. The work resulted in a significant accuracy and speed improvement, and we presented the findings at IEEE SSIAI 2024.

## Results and Impact

The pipeline achieved roughly a 30 percent improvement in both accuracy and real-time performance compared to earlier baselines. This makes automated feedback viable for training environments where immediate guidance can change outcomes during practice.

## Future Work

Future directions include more fine-grained feedback on stroke phase timing, broader coverage across swim styles, and on-device deployment to make the system accessible poolside without specialized hardware.
