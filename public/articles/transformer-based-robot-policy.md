---
{
  "id": 11,
  "slug": "transformer-based-robot-policy",
  "title": "Transformer Based Robot Policy",
  "subtitle": "Action Chunking Transformers for bimanual manipulation policies on a custom ALOHA setup.",
  "date": "Mar 2025",
  "readTime": "8 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Researcher",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Yuchen Cui",
      "role": "Advisor, UCLA Robot Intelligence Lab",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {},
  "heroImage": "/assets/images/ACT.jpg",
  "heroCaption": "Figure 1: Action Chunking Transformer policies evaluated on bimanual manipulation tasks."
}
---

## Introduction

Robotic manipulation remains one of the hardest problems in autonomy because it demands precise, continuous control across long horizons. Transformer-based policies bring sequence modeling to control, allowing robots to predict meaningful action chunks rather than single-step commands. This project explores Action Chunking Transformers (ACT) for bimanual manipulation on a custom ALOHA setup.

## Background and Motivation

Traditional behavior cloning often struggles with compounding error because small deviations in one step can cascade into failure. ACT addresses this by predicting short action segments, improving stability and enabling the policy to reason over short-term temporal structure. For bimanual manipulation, this is especially valuable because coordination between two arms is highly sensitive to timing and subtle motion cues.

## System Overview

The policy ingests robot state, gripper feedback, and visual observations, and produces action chunks that are executed in a low-latency loop. The ALOHA platform provides a realistic bimanual manipulation environment with real hardware constraints, making it a strong testbed for robustness and deployability.

## Our Work

I adapted ACT to our lab hardware stack, reengineering core PyTorch code to match the ALOHA control loop and improving compatibility with the robot interface. This included tuning the data pipeline, aligning action representations with the robot controller, and stabilizing inference for real-time execution. I also helped curate demonstrations and refine evaluation procedures to ensure repeatability across tasks.

## Results and Impact

The adapted policy achieved strong bimanual manipulation performance, reaching around 90 percent success on key tasks in the lab setting. The project demonstrates that transformer policies can be made practical on real hardware when the system integration is carefully engineered.

## Future Work

Next steps include scaling the dataset, exploring multimodal conditioning for richer task context, and extending to more complex multi-stage manipulation where temporal reasoning and coordination are critical.
