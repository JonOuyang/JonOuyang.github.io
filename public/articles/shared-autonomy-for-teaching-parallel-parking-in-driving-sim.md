---
{
  "id": 16,
  "slug": "shared-autonomy-for-teaching-parallel-parking-in-driving-sim",
  "title": "Shared Autonomy for Teaching Parallel Parking in Driving Sim",
  "subtitle": "ZPD-based shared autonomy with a two-phase NMPC expert in CARLA for robust parallel parking.",
  "date": "Mar 2025",
  "readTime": "9 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Visiting Researcher",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Dorsa Sadigh",
      "role": "Advisor, Stanford ILIAD Group",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {},
  "heroImage": "https://media.licdn.com/dms/image/v2/C4D33AQEDVBUBtBDz9g/productpage-image_1128_635/productpage-image_1128_635/0/1663775950406/carla_simulator_image?e=1767596400&v=beta&t=DnbkHurcqXU-KjDT_3zV3fR21vDc3LPeaQvVQ90XQVY",
  "heroCaption": "Figure 1: Shared autonomy training and evaluation in CARLA."
}
---

## Introduction

Parallel parking is a precise, multi-stage maneuver that is difficult to teach and even harder for novice drivers to execute consistently. This research explores shared autonomy that blends user control with an expert planner, allowing learners to stay in the loop while receiving structured assistance in simulation.

## Background and Importance

Fully autonomous parking can succeed in narrow conditions, but it removes the driver from the decision loop and offers little educational value. Shared autonomy grounded in the Zone of Proximal Development (ZPD) aims to provide just enough assistance to keep the user successful without taking over entirely. This framing is important for building systems that teach rather than replace human skill.

## System Overview

The system runs inside CARLA with a two-phase NMPC expert policy for parallel parking. The expert handles the fine-grained trajectory planning and safety constraints, while the user provides directional intent. A blending policy modulates the contribution of the expert based on performance, keeping the user in the ZPD and gradually reducing intervention as skill improves.

## Our Work

I implemented and refined the two-phase NMPC expert and helped integrate it into the shared autonomy pipeline. I also supported evaluation using simulation data, trajectory analysis, and user study feedback to tune how assistance is applied across the maneuver phases.

## Results and Impact

The shared autonomy system achieved around 96 percent success in simulation by combining expert planning with user intent. This demonstrates that ZPD-informed assistance can improve task success while maintaining user agency and learning.

## Future Work

Next steps include richer user modeling, expanded maneuver types beyond parallel parking, and longitudinal studies to quantify skill transfer from simulation to real-world driving scenarios.
