---
{
  "id": 19,
  "slug": "exercise-recognition-with-pose-estimation-on-edge-devices",
  "title": "Exercise Recognition with Pose Estimation on Edge Devices",
  "subtitle": "Benchmarking CNN pipelines across GPUs and FPGAs for pose-based action recognition.",
  "date": "Nov 2023",
  "readTime": "8 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Author",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Derrick Trinh",
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
  "heroImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4c5607NEUOjao7dZey6VFKyWzs-Sq1lOU_w&s",
  "heroCaption": "Figure 1: Pose-based exercise recognition on edge devices."
}
---

## Introduction

Exercise recognition is a practical benchmark for edge AI because it combines pose estimation, temporal modeling, and strict latency constraints. This project evaluates pose-based action recognition pipelines across GPUs and FPGAs to understand accuracy, throughput, and deployment tradeoffs.

## Background and Importance

Edge devices enable real-time feedback without cloud dependence, but hardware constraints make model selection and optimization critical. Comparing GPUs like NVIDIA GeForce and Jetson Nano with FPGA platforms such as AMD Kria helps inform which architectures best balance latency, power, and accuracy for practical deployment.

## System Overview

The pipeline uses pose estimation to extract keypoints, then feeds structured representations into CNN-based classifiers. Standardized testing procedures ensure consistent evaluation across hardware platforms, enabling fair comparisons of inference speed and accuracy.

## Our Work

I contributed to benchmarking design and implementation, building scripts and evaluation procedures to measure performance across 20+ deep learning models. I also advised a graduate thesis on GAN-based pose estimation action recognition and supported troubleshooting for model training and evaluation.

## Results and Impact

The benchmarking showed that NVIDIA GPUs achieved around 5 percent higher accuracy on average compared to AMD FPGA setups, while highlighting tradeoffs in deployment complexity. These findings informed hardware recommendations for future edge AI deployments in human motion analysis.

## Future Work

Future directions include tighter hardware-aware optimization, expanded datasets for exercise categories, and more power-efficient architectures for long-duration edge deployments.
