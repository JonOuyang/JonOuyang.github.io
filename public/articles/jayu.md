---
{
  "id": 0,
  "slug": "jayu",
  "title": "JAYU: The Gemini-Powered Computer Use Agent",
  "subtitle": "The Grand Prize winner of the 2024 Google Gemini API Developer Competition—a vision-language agent capable of seamless desktop automation and 'Real Life JARVIS' interaction.",
  "date": "Nov 21, 2024",
  "readTime": "12 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Lead Researcher & Developer",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Yuchen Cui",
      "role": "Advisor, UCLA Robot Intelligence Lab",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {
    "github": "https://github.com/JonOuyang/Gemini-API-Competition-Submission",
    "youtube": "https://www.youtube.com/watch?v=S8lJgI8KjIA",
    "devpost": "https://devpost.com/software/jayu",
    "paper": "#",
    "article": "https://ai.google.dev/competition/projects/jayu"
  },
  "heroImage": "https://ai.google.dev/images/winners/jayu.jpg",
  "heroCaption": "Figure 1: JAYU Agent interface overlays, demonstrating its ability to analyze screen context and perform tasks across different applications."
}
---

## Introduction

Computer use is a fundamental capability for autonomous agents. While Large Language Models (LLMs) have demonstrated remarkable reasoning abilities, translating that reasoning into precise mouse movements, clicks, and keystrokes remains a significant challenge. Traditional approaches often rely on brittle DOM parsing or heavy Dockerized environments that isolate the agent from the user's actual workflow.

JAYU is a pure Python desktop assistant built for the Google Gemini API Competition. It runs in the background, watches the active window when prompted, and manipulates the current application with mouse movement, clicks, and typing, acting like a "Real Life JARVIS" that can work across any on-screen app without containerization or special app integrations.

## System Architecture

The core of JAYU relies on a hierarchical dual-model architecture designed to balance latency with reasoning depth. The system operates entirely in the background, interacting with the Operating System (OS) rather than a simulated sandbox.

![JAYU system architecture diagram](/assets/images/jayu-architecture.png)

The Command Center (Gemini 1.5 Flash) is the primary orchestrator, continuously listening to user voice commands, invoking tools with function calling, and routing queries that need visual analysis of the screen. This model is optimized for high-speed, low-latency decision-making.

The Vision Engine (Gemini 1.5 Pro) activates when visual context is required—such as "Write code based on this diagram" or "Find the play button on Spotify". Leveraging its multimodal capabilities, JAYU captures high-resolution screenshots, identifies UI elements (buttons, text fields, icons), and predicts their precise screen coordinates (x, y) for interaction.

## Vision-Language Integration

JAYU’s distinct advantage lies in its seamless integration of vision and action, bypassing the need for accessibility trees or DOM access which are often unavailable in desktop apps (like games or legacy software).

The agent maps natural language instructions to a specialized action space that includes mouse control (absolute coordinate positioning and clicking), keyboard input (typing, shortcuts, and modifier keys), and system audio (Text-to-Speech for verbal feedback and Speech-to-Text for listening to commands). It can also memorize short-lived context for later commands, providing a more continuous assistant experience.

Beyond standard keyboard and mouse inputs, JAYU incorporates a computer vision pipeline for gesture recognition. Using state-of-the-art pose estimation, the system can track the user's hand movements via the webcam. This allows users to perform actions like scrolling through a webpage or document simply by waving their hand up or down, creating a truly hands-free experience.

## Prize and Recognition

JAYU was recognized as the **Grand Prize Winner** (Best Overall App) of the **2024 Google Gemini API Developer Competition**.

Selected from over **3,000 submissions** representing 119 countries, JAYU was identified by Google's judging panel as the premier example of multimodal AI integration. The project was celebrated for successfully bridging the gap between language models and practical, real-world execution.

**The "DeLorean" Prize**
As the Grand Prize winner, the project was awarded a bespoke, electric-converted **1981 DeLorean**. This prize—symbolizing a bridge between retro iconography and future technology—mirrors the architecture of JAYU itself: applying futuristic AI reasoning to existing, legacy desktop environments.

![JAYU Grand Prize DeLorean](/assets/images/delorean15.JPEG)

**Developer Community Impact**
Following the victory, JAYU was featured on the official Google AI Developers blog and highlighted across Google’s developer channels. The project serves as a reference implementation for the community, demonstrating how to:
1.  Utilize **Gemini 1.5 Pro’s** native vision capabilities for coordinate detection without external OCR tools.
2.  Implement **Gemini 1.5 Flash** for low-latency routing and function calling.
3.  Build a "computer-use" agent that remains lightweight and user-centric.

## Performance & Capabilities

Demonstrations highlight cross-application interactivity (navigating Spotify and controlling *Minecraft* by interpreting the 3D game environment), context-aware coding (observing a diagram and generating the corresponding PyTorch or TensorFlow code in a separate IDE window), and live translation (watching foreign-language content and providing real-time, read-aloud translations).

## Safety & Security

JAYU is designed with strict scoping. It only sees the active window, does not access other windows or processes, and cannot read files or command line tools unless the user opens them and asks for help. Screenshots are captured only after explicit prompts and are held in memory for analysis rather than saved to disk, and no information persists between sessions. Speech is processed locally with wakeword-triggered capture, and gesture recognition runs on-device via mediapipe/opencv without sending camera footage to Gemini.

## How to Run

The project is optimized for x86 environments, so Windows or Linux is the recommended starting point. Install dependencies from `requirements.txt`, set your Gemini and ElevenLabs credentials in `.env`, and run `python main.py`. First boot can take around 40 seconds due to audio and vision pipelines loading.

## APIs

JAYU relies on two APIs. Google Gemini powers text prompts with Gemini 1.5 Flash and image prompts with Gemini 1.5 Pro. ElevenLabs provides optional text-to-speech; it is not required for core functionality.

Reliability comes from prompt engineering rather than training a new model. Gemini 1.5's native object detection helps identify clickable elements with pixel-level precision, avoiding the brittle heuristics used in older computer vision pipelines.

## Future Work

Future development for JAYU is focused on expanding its autonomy and integration depth. Work is aimed at long-horizon planning for multi-step tasks that span hours or days, mobile environment adaptation to allow cross-device automation, and shared autonomy improvements from the UCLA Robot Intelligence Lab to reduce the need for explicit step-by-step commands.
