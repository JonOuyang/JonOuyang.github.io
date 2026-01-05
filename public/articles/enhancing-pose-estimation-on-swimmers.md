---
{
  "id": 18,
  "slug": "enhancing-pose-estimation-on-swimmers",
  "title": "Enhancing Pose Estimation on Swimmers",
  "subtitle": "Optimizing underwater pose estimation and swimmer action recognition for real-time feedback.",
  "date": "Jan 2024",
  "readTime": "8 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Author",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Austin Adams",
      "role": "Author",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Chang Choo",
      "role": "Author",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {},
  "heroImage": "https://www.popphoto.com/uploads/2019/01/17/WBLB2DJBGPSKJH5LEDSJ2JVHHE.jpg?auto=webp&width=785&height=523.00625",
  "heroCaption": "Figure 1: Pose estimation for underwater swimmer analysis."
}
---

## Introduction

Swimmer technique feedback relies on subtle posture cues that are hard to capture manually, especially underwater. This project improves pose estimation and action recognition to enable accurate, real-time feedback for competitive swimming.

## Background and Importance

Underwater footage introduces blur, refraction, and occlusion that degrade standard pose estimators. For swimming, the value is not just detection but consistent temporal tracking to detect technique drift, stroke timing, and symmetry. Improving robustness in this setting can make automated coaching viable and scalable.

## System Overview

The pipeline combines YOLOv7 for swimmer localization and CMU OpenPose for keypoint extraction. Temporal smoothing and preprocessing align swimmers perpendicular to the camera frame, improving keypoint stability. The extracted sequences feed into classification models to recognize stroke patterns and identify errors.

## Our Work

I led a small research team to build and deploy the end-to-end system in TensorFlow, designed preprocessing algorithms for alignment, and created scripts to process over 13 hours of underwater footage. We applied data augmentation to improve robustness and validated gains through extensive testing.

## Results and Impact

The system improved accuracy and real-time performance by roughly 30 percent compared to earlier baselines. The results were presented at IEEE SSIAI 2024, demonstrating the viability of automated technique feedback for swimming training.

## Future Work

Next steps include broader coverage across swim styles, more granular phase segmentation, and on-device deployment to support feedback in pool environments without specialized hardware.
