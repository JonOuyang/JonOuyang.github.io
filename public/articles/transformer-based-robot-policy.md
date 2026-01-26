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

## How the Model Works

![Action Chunking Transformer architecture diagram](/assets/images/act-architecture.jpg)

ACT frames robot control as sequence modeling. Instead of emitting a single action at every timestep, the policy predicts a short horizon of actions as a chunk. Each chunk captures a local motion primitive and gives the controller a structured plan to execute, which reduces jitter and makes the policy more stable when observations are noisy.

On each timestep, the model tokenizes observations into a sequence. Visual features from camera frames are embedded into tokens, while proprioceptive signals such as joint angles, gripper states, and end-effector pose are embedded into separate tokens. These tokens are concatenated in time order to form a short context window that represents what the robot is seeing and feeling.

The transformer encoder processes the token sequence and builds a contextual representation of the recent trajectory. The decoder then generates an action chunk, which is a fixed-length sequence of joint-space deltas or end-effector commands. During execution, the controller steps through this chunk while the policy continuously refreshes its predictions, enabling it to re-plan at high frequency if the task deviates.

Because the action chunk length is shorter than the task horizon, the model effectively decomposes long tasks into overlapping local plans. This makes training more data-efficient than long-horizon imitation and reduces compounding error compared to single-step policies. It also aligns with human demonstrations, where short bursts of coordinated motion are easier to capture and learn from.

## Our Work

I adapted ACT to our lab hardware stack, reengineering core PyTorch code to match the ALOHA control loop and improving compatibility with the robot interface. This included tuning the data pipeline, aligning action representations with the robot controller, and stabilizing inference for real-time execution. I also helped curate demonstrations and refine evaluation procedures to ensure repeatability across tasks.

## Results and Impact

The adapted policy achieved strong bimanual manipulation performance, reaching around 90 percent success on key tasks in the lab setting. The project demonstrates that transformer policies can be made practical on real hardware when the system integration is carefully engineered.

## Future Work

Next steps include scaling the dataset, exploring multimodal conditioning for richer task context, and extending to more complex multi-stage manipulation where temporal reasoning and coordination are critical.
