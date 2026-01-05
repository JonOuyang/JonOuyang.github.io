---
{
  "id": 17,
  "slug": "gamma-gaze-based-vlm-control-for-single-arm-manipulation",
  "title": "GAMMA: Gaze Based VLM Control for Single Arm Manipulation",
  "subtitle": "Gaze-assisted manipulation with foundation models for intent prediction and modular autonomy.",
  "date": "Feb 2025",
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
  "heroImage": "https://cdn.prod.website-files.com/5f2b1efb0f881760ffdc5c96/618e8f82651aa5f1f58c9bfd_Ads%C4%B1z%20tasar%C4%B1m%20-%202021-11-12T190600.023.png",
  "heroCaption": "Figure 1: GAMMA concept for gaze-assisted manipulation with VLM grounding."
}
---

## Introduction

GAMMA is a gaze-assisted manipulation system that combines wearable eye-tracking with vision-language models to infer user intent during single-arm robotic tasks. The goal is to enable modular autonomy where the robot can interpret where the user is looking and respond with context-aware assistance.

## Background and Importance

In many manipulation tasks, the user’s gaze reveals intent before any explicit command is given. Foundation models can provide semantic understanding of a scene, but without intent they can act too broadly. GAMMA bridges this gap by linking gaze to visual context, creating a control signal that is both precise and interpretable.

## System Overview

The pipeline streams gaze data, aligns it with camera observations, and uses a VLM to interpret the object of interest. The system then proposes or executes actions in a modular way, allowing the user to remain in control while reducing low-level effort. This framing supports shared autonomy that is transparent and responsive.

## Our Work

I contributed to building the gaze streaming and alignment infrastructure and integrating it with the VLM reasoning layer. I also worked on system evaluation and task benchmarks to validate that gaze-conditioned intent prediction improves speed and reduces teleoperation burden.

## Results and Impact

GAMMA provides faster task completion and more reliable intent inference in single-arm manipulation. The work contributed to a peer-reviewed publication at Robotics: Science and Systems (RSS) 2025, highlighting the role of gaze as a powerful signal for modular autonomy.

## Future Work

Future directions include richer language grounding, multi-object disambiguation, and expanded evaluation across broader manipulation tasks and user populations.
