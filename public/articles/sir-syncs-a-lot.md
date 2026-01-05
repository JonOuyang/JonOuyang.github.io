---
{
  "id": 2,
  "slug": "sir-syncs-a-lot",
  "title": "Sir Syncs-a-Lot: Unifying Productivity Across Devices",
  "subtitle": "An AI-powered bridge that reclaims lost time by allowing students to control their high-performance desktops entirely from a mobile interface.",
  "date": "Apr 27, 2025",
  "readTime": "8 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Lead Developer",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Sunny Vinay",
      "role": "Full Stack Developer",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Eric Zhou Ziyang",
      "role": "Frontend Developer",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "William Jiang",
      "role": "Developer",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {
    "github": "https://github.com/JonOuyang/lahacks",
    "devpost": "https://devpost.com/software/sir-syncs-a-lot",
    "youtube": "#"
  },
  "heroImage": "/assets/images/sir-syncs-a-lot.png",
  "heroCaption": "Figure 1: The Sir Syncs-a-Lot dashboard, showing the seamless handoff between mobile Telegram commands and desktop execution."
}
---

## Introduction

For university students, the "commuter gap" is a silent productivity killer. At UCLA, students routinely spend over 20 minutes walking between dorms and classes—totaling over an hour of "dead time" every day. This is time where high-performance tasks (like training ML models or compiling heavy codebases) are impossible because they require a desktop environment.

Sir Syncs-a-Lot was built at LA Hacks 2025 to solve this specific problem. It is a unified AI agent that bridges the gap between a student's phone and their dorm room desktop. It empowers users to access, control, and orchestrate complex desktop computing tasks remotely via a lightweight mobile interface, effectively turning a walk across campus into a productive work session.

## System Architecture

The project utilizes a modular, three-pronged architecture designed for low-latency communication and robust remote execution.

The Neural Core (Python Backend) is the heart of the system, running a local AI agent on the host machine. It uses Google Gemini to interpret natural language commands and decide which local tool to deploy. The backend includes specialized modules in the `agent_functions/` directory for tasks like running shell commands, solving homework problems, or managing file systems. Integrated with ElevenLabs, the agent supports a two-way audio channel so the user can talk to their computer while walking and receive verbal confirmation of task completion.

The Mobile Gateway (Telegram Bot) provides a chat-first interface for on-the-go control. Sir Syncs-a-Lot includes a dedicated Telegram bot at `/teleBot` where users can text instructions like "Run the training script on my latest commit" or "Read me the summary of this PDF." The bot relays these commands securely to the desktop agent and pushes notifications back to the user's wrist or phone.

The Visual Dashboard (Next.js Frontend) supports richer interactions through a responsive Next.js app. Written in TypeScript, the dashboard shows machine status, current task queues, and a history of agent interactions, all accessible from any browser.

## Key Capabilities

Remote Orchestration sends intent rather than pixels. Instead of streaming video like traditional remote desktop tools, Sir Syncs-a-Lot translates commands into actions. A user can message, "Fix the bug in line 40 of my main script," and the agent will open the file, apply the fix using Gemini's coding capabilities, and run the test suite, reporting the results back via text. Students can also start long-running training jobs from their phone while walking to class and receive a notification the moment an epoch finishes.

Academic Support Agent features are tuned for student workflows. The system includes Quiz Master and Homework Solver modules. Users can upload a photo of a problem or describe it via voice, and the desktop agent—leveraging the higher compute power of the main machine—processes the query and reads the solution back through the user's headphones.

## Technical Implementation

The project is built on a modern stack emphasizing type safety and AI integration. The backend uses Python 3.10+ with FastAPI or Flask for the API layer. The frontend uses Next.js 14, TypeScript, and TailwindCSS. AI and ML features rely on the Google Gemini API for reasoning and ElevenLabs for TTS. Deployment is designed for localhost with a secure tunnel (like ngrok) to expose the API to the Telegram webhook and mobile web frontend.

## Vision & Future Work

Sir Syncs-a-Lot reimagines the definition of a "workstation." By decoupling the *control* of the computer from the *location* of the computer, it creates a future where productivity follows the user.

Future roadmap items include multi-device session syncing to hand off state between the phone, a library laptop, and the dorm desktop. It also includes a secure auth layer with strict OAuth flows to prevent unauthorized remote access, plus a cloud-hosted relay that keeps connectivity even if the desktop enters sleep mode through Wake-on-LAN integration.
