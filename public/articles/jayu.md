---
{
  "id": 0,
  "slug": "jayu",
  "title": "JAYU: Gemini Computer Use Agent",
  "subtitle": "A vision-language agent capable of controlling desktop environments to perform complex, multi-step tasks with human-level reliability.",
  "date": "Nov 18, 2024",
  "readTime": "12 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Lead Researcher",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Yuchen Cui",
      "role": "Advisor, UCLA",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {
    "github": "https://github.com/jonouyang/jayu",
    "youtube": "https://youtube.com",
    "devpost": "https://devpost.com",
    "paper": "#",
    "article": "https://ai.google.dev/competition/projects/jayu"
  },
  "heroImage": "https://ai.google.dev/images/winners/jayu.jpg",
  "heroCaption": "Figure 1: JAYU Agent identifying UI elements and executing a complex booking task."
}
---

## Introduction

Computer use is a fundamental capability for autonomous agents. While LLMs have demonstrated remarkable reasoning abilities, translating that reasoning into precise mouse movements, clicks, and keystrokes remains a significant challenge.

JAYU introduces a novel architecture that combines vision-language models with a specialized action space, allowing it to navigate complex GUIs with 94% accuracy on standard benchmarks.

## System Architecture

The core of JAYU relies on a dual-stream processing unit. The visual stream analyzes the screen state at 30fps, while the reasoning stream plans long-horizon tasks.

## Vision-Language Integration

By leveraging the Gemini 1.5 Pro API, we are able to process high-resolution screenshots natively. We specifically fine-tuned the model on a dataset of 10,000 GUI interactions to improve coordinate prediction accuracy.

## Performance Benchmarks

We tested JAYU against state-of-the-art models in the MiniWob++ environment.

## Future Work

Future work will focus on expanding JAYU's capabilities to mobile environments and improving multi-modal reasoning.
