---
{
  "id": 12,
  "slug": "diffusion-based-robot-policy",
  "title": "Diffusion Based Robot Policy",
  "subtitle": "Exploring diffusion policies for smooth, coordinated bimanual manipulation on ALOHA.",
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
  "heroCaption": "Figure 1: Diffusion policy rollout on bimanual manipulation trajectories."
}
---

## Introduction

Diffusion policies have emerged as a compelling alternative to autoregressive control, offering smooth trajectory generation through iterative denoising. This project evaluates diffusion-based robot policies on a custom ALOHA setup to understand their strengths and limitations for bimanual manipulation.

## Background and Motivation

Bimanual tasks often require coordinated trajectories that are difficult to model with single-step policies. Diffusion models can represent complex, multi-step distributions and generate coherent action sequences that reduce jitter and improve temporal consistency. The tradeoff is increased computational complexity, making real-time deployment a key challenge.

## System Overview

The policy models action sequences conditioned on robot state and observations, then iteratively refines a noisy trajectory into a final action chunk. This allows the controller to plan smooth motions that are difficult to achieve with stepwise regression alone. The ALOHA platform provides the real-world constraints needed to validate whether these policies are viable outside simulation.

## Our Work

I focused on adapting diffusion policies to the lab control loop, improving compatibility with hardware constraints, and building a training pipeline that could handle the dataset format used for bimanual demonstrations. I also supported evaluation design to compare qualitative behavior against transformer policies in similar tasks.

## Results and Impact

The diffusion approach produced notably smooth trajectories and strong coordination between arms, highlighting its potential for tasks where continuous, consistent motion is critical. The work establishes a foundation for further exploration of diffusion policies on physical robots.

## Future Work

Next steps include reducing inference latency, experimenting with hybrid policies that combine diffusion sampling with reactive corrections, and expanding to more complex task families that require long-horizon planning.
