---
{
  "id": 4,
  "slug": "bruin-bite",
  "title": "Bruin Bite: The Modern UCLA Dining Companion",
  "subtitle": "A high-performance dining analytics platform capable of handling campus-scale traffic with sub-35ms latency.",
  "date": "May 24, 2025",
  "readTime": "6 min read",
  "authors": [
    {
      "name": "Gavin Sonntag",
      "role": "Lead Full Stack Engineer",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {
    "github": "https://github.com/gsonntag/bruinbite",
    "youtube": "/assets/videos/BruinBite%20Launch%20Video.mp4",
    "demo": "#",
    "devpost": "#"
  },
  "heroImage": "/assets/images/bruinbite2.png",
  "heroCaption": "Figure 1: Bruin Bite dashboard displaying real-time menu popularity and dining hall crowd metrics."
}
---

## Introduction

For the thousands of students living on "The Hill" at UCLA, dining is a daily logistical challenge. With multiple dining halls, rotating menus, and unpredictable crowd surges, finding the right meal at the right time is often a guessing game. Existing solutions were often slow, outdated, or lacked community interaction.

Bruin Bite is a modern, full-stack dining analytics platform designed to solve this information asymmetry. It provides a fault-tolerant, real-time interface for students to view menus, vote on their favorite dishes, and gauge dining hall popularity, serving as the digital pulse of campus nutrition.

![Bruin Bite Launch Video](/assets/videos/BruinBite%20Launch%20Video.mp4)

## System Architecture

The project was engineered with a focus on high availability and low latency, utilizing a decoupled microservices architecture to handle the potential load of the entire undergraduate population.

The Ingestion Pipeline (Python) keeps data fresh. A specialized Python scraper runs on a scheduled cron job, parsing the complex, unstructured HTML from the official UCLA dining websites. It normalizes this data—handling edge cases like sudden menu changes or holiday hours—and upserts it into the central database.

The Backend Core (Go) powers the low-latency API. The service is written in Go for responsiveness, with a p95 read latency around 35ms that keeps the app feeling instant even on spotty campus WiFi. Endpoints are secured via JWT authentication for user sessions and vote integrity without sacrificing speed. Leveraging Go's goroutines, the system handles concurrent requests for menu data and voting transactions efficiently, maintaining 99.9% uptime during stress tests.

The Frontend (Next.js) delivers a responsive UI with server-side rendering. This ensures that menu content is SEO-friendly and loads immediately, while React handles interactive elements like voting buttons and live status updates.

## Key Features

Community Sentiment Tracking adds a crowdsourced voting system so students can upvote or downvote specific menu items. In its first month of beta testing, the platform processed over 1,000 unique votes, creating a reliable dataset of student favorites that helps users decide between B-Plate salmon or De Neve chicken tenders.

Infrastructure as Code keeps the system reproducible. The entire application ecosystem—including the Go backend, Postgres database, and frontend service—is containerized using Docker. This eliminates the "it works on my machine" problem and makes scaling straightforward.

## Technical Highlights

The database uses a highly optimized PostgreSQL schema designed to handle complex relationships between dining halls, meal periods, food items, and user votes. The stateless nature of the Go backend allows for horizontal scaling, meaning the system can easily absorb the traffic spike that occurs right before lunch and dinner hours.

## Future Work

The roadmap for Bruin Bite focuses on deepening the social aspect of dining. Planned work includes predictive analytics using historical voting data to predict when popular items will return to the menu, friend activity features to see which dining hall your friends are planning to visit, and a mobile native experience that ports the efficient backend to React Native with push notifications for fresh cookies or low crowd alerts.
