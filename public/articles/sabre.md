---
{
  "id": 1,
  "slug": "sabre",
  "title": "SABRE: Shared Autonomy for Battlefield Response",
  "subtitle": "Redefining drone warfare through a commander-centric swarm architecture that bridges the gap between manual piloting and full AI autonomy.",
  "date": "Oct 2024",
  "readTime": "10 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Lead Developer",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Silvio Kempf",
      "role": "Co-Presenter",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {
    "github": "#",
    "youtube": "#"
  },
  "heroImage": "/assets/images/sabre.jpg",
  "heroCaption": "Figure 1: SABRE swarm visualizing formation vectors relative to the Commander drone."
}
---

## Introduction

Modern drone warfare faces a critical dilemma. On one end of the spectrum is One Operator, One Drone, a model that requires significant manpower and lacks synchronization. On the other end is Full Autonomy, which offers scale but suffers from brittleness, lack of accountability, and susceptibility to edge-case failures.

SABRE (Shared Autonomy for Battlefield Response & Engagement) targets the "sweet middle ground" of Shared Autonomy.

SABRE is a hierarchical swarm coordination system. Instead of replacing the human pilot, it empowers them. By leveraging ROS2 and advanced computer vision, we created a system where a single human operator flies a "Commander" drone, while a swarm of autonomous agents proactively adapts to the commander’s intent—flanking, defending, and scouting without requiring explicit micromanagement.

## The Monolith Architecture

The core innovation of SABRE is the Monolith Commander Concept. In traditional swarm robotics, agents often operate as a decentralized collective or follow waypoints. In SABRE, the swarm is anchored to a specific, human-controlled entity: the Commander.

The system relies on a high-speed inference engine where follower drones do not just mimic the commander, but *interpret* the commander's movement to determine the tactical context.

Intent Inference centers on the swarm continuously analyzing the telemetry and vector of the Commander drone. If the Commander accelerates toward a target, the swarm identifies an attack vector. If the Commander initiates a rapid reverse or evasive maneuver, the swarm switches to protection protocols.

The Smart Wingman concept means follower drones are not passive observers. They utilize local computer vision to detect threats before the Commander does. If a follower detects an enemy on the periphery, it transmits that data to the network and immediately adjusts its formation to intercept, effectively buying time for the human pilot to react.

## Tactical Formations & Behaviors

SABRE’s swarm intelligence is defined by fluid, non-rigid formation capabilities. The drones don't just fly in a V-shape; they bend and curl dynamically based on the battlefield geometry.

The Flanking Maneuver begins when the Commander engages a target and the swarm autonomously calculates the optimal angles of attack. The swarm bends its formation, curling around the target to flank it from the sides or rear. This overwhelms the target's ability to focus fire, as the threat is now omnidirectional, all while the human pilot focuses solely on the primary engagement.

Retreat and Sacrifice behavior prioritizes the survival of the Commander (and by extension, the human link). If a retreat is signaled, the swarm forms a defensive screen between the threat and the Commander, follower drones execute suppressing maneuvers to cover the retreat, and a sacrificial protocol can trigger in calculated worst-case scenarios where followers intercept projectiles or engage in high-risk diversionary tactics to ensure the Commander escapes to safety.

## Human-in-the-Loop: The "Permission" Model

A common fear regarding autonomous swarms is the "runaway AI." SABRE addresses this through a strict Permission-Based Execution model.

While the swarm is highly autonomous regarding positioning, it possesses zero autonomy regarding engagement without human consent. The swarm can identify a target, lock onto it, and move into a lethal flanking position entirely on its own, but it will not fire or commit to the final strike until the Commander explicitly authorizes the action.

This maintains the accountability of a human operator while utilizing the reaction speed of a machine. The AI handles the "how" (getting into position), but the human decides the "if" (engaging the target).

## Technical Implementation

ROS2 and Networking are central to the architecture. Given that drone swarms can be spread widely—up to a mile apart—latency and bandwidth are significant constraints. SABRE utilizes ROS2 (Robot Operating System 2) for its robust distributed messaging system (DDS). This allows the drones to share state vectors and target data with minimal latency, ensuring that the curl of the formation remains synchronized even when communication is degraded.

Computer Vision runs on each node in the swarm as a lightweight stack capable of object detection and depth estimation. This allows individual drones to navigate complex terrain and identify targets independently of the Commander, feeding that situational awareness back into the shared knowledge graph.

## Conclusion

SABRE represents the future of tactical robotics. It solves the cognitive load problem of controlling multiple assets by treating the swarm as an extension of the pilot's will. By combining the intuition and accountability of a human pilot with the precision and self-preservation of autonomous agents, SABRE provides a decisive advantage on the modern battlefield.
