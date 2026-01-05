---
{
  "id": 15,
  "slug": "gaze-conditioned-robotic-bimanual-manipulation-policy",
  "title": "Gaze Conditioned Robotic Bimanual Manipulation Policy",
  "subtitle": "Fusing Action Chunking Transformers with gaze and vision-language signals for coordinated bimanual control on ALOHA.",
  "date": "Apr 2025",
  "readTime": "9 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Author",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Yike Shi",
      "role": "Author",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Yuchen Cui",
      "role": "Author",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {},
  "heroImage": "https://i.ytimg.com/vi/9d6hiqLtml8/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGUgYChVMA8=&rs=AOn4CLBvB2Ms3OU7rQGeA2_-OUY7G1bkhg",
  "heroCaption": "Figure 1: Bimanual manipulation policy conditioned on gaze and visual context."
}
---

## Introduction

Robotic bimanual manipulation remains difficult because success depends on tight temporal coordination between two arms and a clear understanding of user intent. This project explores gaze-conditioned policies that blend Action Chunking Transformers with vision-language signals to make bimanual control more intuitive, faster to execute, and easier to supervise.

## Background and Importance

Traditional teleoperation can be slow and cognitively demanding because the human must continuously provide low-level control. In many tasks, the operator already communicates intent through gaze, attention, and subtle motion cues. By integrating gaze streams with model-based control, the system can infer intent earlier and reduce the burden on the operator, enabling shared autonomy without sacrificing precision.

## System Overview

The policy runs on a custom ALOHA setup, taking in robot state, camera observations, and gaze signals from wearable devices. The model predicts short action sequences rather than isolated commands, enabling robust execution under hardware constraints. A vision-language layer helps contextualize gaze by grounding it in the observed scene, reducing ambiguity and enabling more reliable intent inference.

## Our Work

I adapted the Action Chunking Transformer pipeline for our lab hardware, reworking the PyTorch implementation for stable real-time inference. I also built gaze streaming infrastructure and integrated it with the robot control loop, aligning gaze signals with camera frames and action chunks. This fusion significantly improved task speed and reduced the need for continuous teleoperation during bimanual tasks.

## Results and Impact

The gaze-conditioned system achieved around 90 percent success on bimanual manipulation tasks and accelerated execution by roughly 250 percent compared to manual teleoperation baselines. These results show that gaze can act as a high-bandwidth intent signal when paired with robust action-chunked policies.

## Future Work

Next steps include richer multimodal grounding, expanded task diversity, and user studies to quantify how gaze-conditioned autonomy affects cognitive load and trust during extended robot interactions.
