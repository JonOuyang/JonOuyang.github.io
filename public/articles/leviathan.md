---
{
  "id": 3,
  "slug": "leviathan",
  "title": "LEVIATHAN: The Ocean’s First AI Copilot",
  "subtitle": "Bringing big-fleet insights to owner-operator crews via a hybrid edge-AI architecture capable of assessing catch quality and environmental data miles offshore without internet.",
  "date": "Feb 09, 2025",
  "readTime": "10 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Frontend / Integration",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Anish Kamatam",
      "role": "AI Engineer",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Anirudh Sivakumar",
      "role": "Backend Developer",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Eric Zhou",
      "role": "UX / Research",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {
    "github": "https://github.com/AnishKamatam/sushi-glitch",
    "devpost": "#",
    "youtube": "#"
  },
  "heroImage": "/assets/images/leviathan.jpg",
  "heroCaption": "Figure 1: Leviathan mobile interface analyzing catch freshness in an offline environment."
}
---

## Introduction

In the commercial fishing industry, technology is usually reserved for the "Big Fleet"—massive industrial vessels with satellite uplinks and dedicated data centers. The "Underserved Middle"—the owner-operator fishermen running crews of 1 to 5 people—are left navigating with little more than a smartphone and basic sonar.

LEVIATHAN, built by Team GLITCH for Sushi Hacks 2025, bridges this gap. It is an end-to-end AI copilot designed specifically for the edge. Recognizing that fishing crews work offshore where connectivity is nonexistent, Leviathan utilizes a novel hybrid architecture that switches between powerful cloud models (when docked) and highly optimized local models (at sea) to provide real-time decision support, weather analysis, and catch quality control.

## The Challenge: Operations in the Dark

Small crew operations face unique challenges that industrial fleets do not. Crews need to analyze currents and weather patterns pre-dawn without cellular signal, time net deployment based on real-time fish behavior rather than intuition alone, and manage market value where fish prices depend entirely on visual condition and freshness. A small difference in appearance (eye clarity, scale integrity) can create dramatic price variations.

Leviathan solves these by prioritizing speed, precision, and reliability, ensuring that inferences happen day or night, rain or shine, WiFi or not.

## System Architecture: The Hybrid Model

The core innovation of Leviathan is its ability to run sophisticated Vision Language Models (VLMs) directly on consumer hardware (iPhones and Androids) without an internet connection.

Cloud Mode (Dockside) activates when the vessel is within range of shore towers or WiFi. The app leverages Google Gemini 2.5 Flash for low-latency multimodal reasoning and handles heavy data lifting, such as downloading updated lunar calendars, weather manifests, and syncing historical catch data to the cloud.

Edge Mode (Offshore) activates once the boat leaves the dock and Leviathan switches to a local inference engine. The model is Google PaliGemma-3B-FT-224, a smaller VLM fine-tuned for this use case. The architecture uses a SigLIP (400M parameters) vision encoder that feeds into a Gemma 2B language model via a linear projection layer. This setup lets users point their camera at a fish or a sonar screen and ask natural language questions like "What is the condition of this fish?" or "Interpret this sonar cluster," receiving an answer instantly without sending data over the network.

## Technical Deep Dive: Optimization & Fine-Tuning

Running a Vision Language Model on a phone is a significant engineering challenge due to RAM constraints. While modern Androids have 8-16GB of RAM, many iPhones range from 4-8GB. Standard models simply won't load.

To solve this, we employed PEFT (Parameter Efficient Fine Tuning) and QLoRA (Quantized Low Rank Adaptation).

Quantization and Training relied on the Mendeley Data "Dataset for Fish's Freshness Problems" with ~2,500 annotated samples. Instead of retraining all 2.92 billion parameters of PaliGemma, we kept 99% of them frozen and only updated 1% during training. By using INT4 quantization, we compressed the model's memory footprint to approximately 1.5GB of RAM.

This optimization allows Leviathan to run smoothly on older devices, ensuring that the tool is accessible to fishermen who may not have the latest flagship phones. The fine-tuning was performed on an NVIDIA L40S GPU Server to ensure high-speed convergence.

## Features & Capabilities

Pre-Departure Planning lets the captain synthesize tidal data, lunar phases, and weather reports into a strategic game plan. The AI suggests optimal fishing spots based on historical yield data relative to the current conditions.

Live Sonar Analysis connects to the boat's existing sonar hardware or analyzes screens via camera. Leviathan interprets complex sonar returns, distinguishing between bait balls and target species and advising the crew on when to deploy nets to maximize yield and minimize bycatch.

Fish Quality Control (the "Cash" feature) starts the moment a fish is hauled aboard, as the user scans it with Leviathan. The local PaliGemma model analyzes visual features—eye cloudiness, gill color, and skin texture—to assign a real-time freshness grade. This allows the crew to separate premium sashimi-grade catches from standard stock immediately, employing special processing like bleeding and chilling for the high-value items to preserve their market price.

## Conclusion

Leviathan transforms the fisherman's smartphone from a passive communication device into a potent industrial tool. By successfully shrinking state-of-the-art Vision Language Models to fit in a pocket, Team GLITCH has proven that high-end AI isn't just for tech giants—it can be deployed to the roughest, most remote edges of the workforce.
