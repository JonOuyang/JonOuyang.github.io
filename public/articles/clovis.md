---
{
  "id": 0,
  "slug": "clovis",
  "title": "CLOVIS: AI Annotates Your Screen",
  "subtitle": "A vision-language agent that overlays structured annotations on desktop environments, synchronizing reasoning with timed, on-screen guidance.",
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
  "heroImage": "/assets/images/clovis.png",
  "heroCaption": "Figure 1: CLOVIS overlaying live annotations to guide a multi-step task."
}
---

## Introduction

CLOVIS (Computer Linked Overlay Vision Interface System) is my approach to making computer-use agents feel visible, legible, and reliable. Instead of hiding agent reasoning in chat bubbles, CLOVIS projects that reasoning directly onto the screen as timed boxes, labels, and cues. The core idea is simple: if an agent is going to act inside a GUI, it should be able to point, highlight, and explain directly on top of the interface it sees.

This project is designed to merge with JAYU, the broader computer-use agent backend. CLOVIS focuses on the interaction layer: it captures the current screen, runs a vision-language model to plan actions, and renders those actions as an overlay. The result is a system where an AI assistant can guide a user through complex tasks with visual grounding and human-friendly pacing.

## System Architecture

CLOVIS is a two-part system: a Python backend that drives perception and planning, and an Electron frontend that renders the overlay.

The Python core (`app.py`) orchestrates the agent loop, captures a screenshot with PIL `ImageGrab`, feeds it into a Gemini model wrapper, and listens for function calls that describe what to draw and when to draw it. The tooling layer (`model/function_calls.py`) defines a tool schema for actions like `draw_bounding_box`, `create_text`, `create_text_for_box`, `destroy_box`, `destroy_text`, and `clear_screen`, each with a `time` field to schedule a sequence of visual steps. The visualization API (`ui/visualization_api`) translates tool calls into WebSocket messages formatted as simple draw commands (box, text, clear) sent to the UI layer. The Electron overlay (`ui/main.js`) creates a transparent, always-on-top window that spans the entire virtual desktop, remaining non-interactive by default but able to pass through input or capture clicks when needed.

## Vision-Language Integration

CLOVIS uses a Gemini model configured for tool calling only. The Python wrapper (`model/models.py`) defines a `GenerateContentConfig` with a list of tool declarations and `function_calling_config` set to `ANY`, so the model emits structured tool calls rather than free-form text.

Inside `app.py`, the system prompt frames the model as a "next generation computer use agent" and emphasizes time-based sequencing. The prompt encourages the model to:

Detect UI elements directly from the screenshot, compute bounding boxes and place labels relative to those boxes, and schedule annotations in time order to simulate a guided walkthrough rather than a single static overlay.

This time-based instruction is essential to CLOVIS: it lets the model create a narrative flow on-screen, where each highlight or label appears at the right moment, then disappears when the user is ready to move on.

## Overlay Pipeline

The overlay pipeline is designed to be low-latency and local:

The backend grabs a screenshot of the current desktop, the model receives the screenshot plus the user request and produces tool calls, each tool call is enqueued with a scheduled timestamp, and the queued actions are streamed via WebSocket to the Electron renderer and painted on a full-screen canvas.

Because the UI layer is local and the WebSocket runs on `127.0.0.1`, CLOVIS keeps the rendering loop fast and avoids unnecessary network hops. The overlay reuses a single HTML canvas and redraws all active elements whenever a change occurs, which keeps the render logic simple and deterministic.

## Action Scheduling and Timing

One of the most distinctive parts of CLOVIS is its timed action queue. In `model/function_calls.py`, every tool call wraps its action in `queue_action(time, func, ...)`. The queue is drained by a background thread that respects the time offsets and executes each draw or remove in order.

This scheduling system enables:

Boxes and labels can appear one by one, synchronized with a spoken or written explanation, elements can be removed after a delay to avoid clutter, and the model can wait without emitting extra tokens by advancing the `time` value.

The approach turns annotations into a timeline rather than a static snapshot, which makes the system feel more like an instructor than a screenshot analyzer.

## Coordinate Normalization

To make model outputs resolution-independent, CLOVIS supports a 0-1000 coordinate space. The `denormalize` function converts normalized coordinates into actual pixel locations based on either the current viewport size or the full screen size.

The viewport dimensions are reported from the Electron renderer whenever the window resizes, and stored in `settings.json`. This means CLOVIS can adapt to multi-monitor layouts and different display configurations without forcing the model to learn absolute pixel coordinates.

## Electron Overlay and Interaction

The Electron frontend is built to be visually present but physically unobtrusive:

The overlay sits above all applications without stealing focus, ignores mouse input by default but can become interactive when a user needs to click a highlighted element, receives cursor positions on macOS to detect hover states and enable click-through logic, and ships with a tray icon plus a global shortcut (`Command+Shift+Space`) for quick toggling of overlay states.

These interaction design choices keep CLOVIS lightweight while still enabling future extensions like clickable guidance, inline forms, or interactive tutorials.

## Visualization API Protocol

The Python-to-UI protocol is intentionally small. The backend emits JSON commands such as:

`draw_box` with coordinates, stroke color, and opacity, `draw_text` with font, alignment, and color, and `remove_box`, `remove_text`, plus `clear`.

This keeps the overlay flexible and makes it easy to add new visual primitives later. The UI tracks boxes and text in maps, redraws them on every update, and does simple hit-testing to detect clicks on overlay elements.

## Why CLOVIS Matters

Traditional AI assistants often feel like black boxes: they can answer a question, but they do not show how they arrived at that answer inside a live desktop environment. CLOVIS shifts that dynamic. It makes reasoning visible and contextual by anchoring it directly to the user interface. The overlay is not just a UI trick; it is a feedback loop that makes AI decisions inspectable, teachable, and easier to trust.

This is the core of my dream for CLOVIS: a system where agents do not just act on your behalf, but instead guide you with clarity, structure, and timing that feels human.

## Future Work

CLOVIS is intentionally modular, so the roadmap is about deepening capability rather than rewriting the system:

Future work includes expanding the toolset beyond boxes and text to include arrows, heatmaps, and multi-step visual narratives, tightening the overlay input loop so the agent can react to user corrections in real time, integrating with the broader JAYU backend to close the loop between planning, execution, and verification, and exploring multimodal narration by coupling the timed overlay with synchronized voice output.

CLOVIS is already a functioning system, but its real impact will come as these pieces align into a cohesive, interactive agent experience.
