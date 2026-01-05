---
{
  "id": 5,
  "slug": "oliver",
  "title": "Oliver: The Daily Bruin's AI Assistant",
  "subtitle": "Modernizing a century of student journalism with a RAG-powered research assistant that allows readers to query the archives in plain English.",
  "date": "Aug 15, 2025",
  "readTime": "6 min read",
  "authors": [
    {
      "name": "Jonathan Ouyang",
      "role": "Lead Software Engineer",
      "avatar": "/api/placeholder/40/40"
    },
    {
      "name": "Narek Germirlian",
      "role": "Main Site Director",
      "avatar": "/api/placeholder/40/40"
    }
  ],
  "links": {
    "github": "https://github.com/dailybruin/dbLLM",
    "demo": "https://oliver.dailybruin.com/",
    "article": "https://dailybruin.com"
  },
  "heroImage": "/assets/images/oliver2.png",
  "heroCaption": "Figure 1: Oliver interface providing a sourced summary of campus events from the Daily Bruin archives."
}
---

## Introduction

The *Daily Bruin* has served as UCLA's paper of record since 1919, amassing an archive of over 100,000 articles. However, accessing this wealth of history has traditionally relied on keyword searches that often fail to capture context or nuance.

Oliver (internally `dbLLM`) is the Daily Bruin's first generative AI product—a newsroom RAG (Retrieval-Augmented Generation) agent designed to bridge the gap between static archives and modern, conversational discovery. Live at `oliver.dailybruin.com`, it allows readers and reporters to ask complex questions like "How has student sentiment on tuition hikes changed since 2010?" and receive a cited, synthesized answer drawn directly from the paper's history.

![Oliver UI screenshot](/assets/images/dbllm.png)

## System Architecture

Oliver was built with a clear separation of concerns to ensure scalability and data security. The system operates on a decoupled architecture where the frontend and backend scale independently.

The Backend (Python & Flask) hosts the core logic and orchestrates the RAG pipeline. It uses Pinecone to store high-dimensional vector embeddings of articles, enabling semantic search that finds meaning rather than just keyword matches. The system integrates the Google Gemini API (`google-generativeai`) for the reasoning layer: when a user asks a question, the backend retrieves relevant context chunks from Pinecone and feeds them into Gemini 1.5 to generate a natural language response rooted in the provided facts. A custom script (`store.py`) handles the ETL process, scraping articles, chunking them into digestible tokens, and upserting them to the vector index.

The Frontend (React) is a responsive React application built with Vite. It features a chat-centric UI that mimics a conversation with a librarian. Access is currently gated to Daily Bruin staff via an internal authentication flow to ensure rigorous beta testing before a full public rollout. Unlike standard chatbots, Oliver is programmed to be journalistically responsible, with every claim hyperlinked to the original Daily Bruin article to maintain source integrity.

## Technical Implementation

The project emphasizes ease of deployment and reproducibility for future staff developers. The repository includes a `quick_install.sh` script that automates the setup of Conda environments and dependency installation, lowering the barrier to entry for student developers. The application is containerized with a `Dockerfile`, allowing it to be deployed consistently across development machines and the production server.

## Recognition & Impact

Oliver represents a significant step in the *Daily Bruin's* digital transformation strategy. By integrating AI directly into the newsroom's workflow, the tool reduces the time required for background research on breaking stories from hours to seconds.

This initiative is part of the broader engineering effort that helped the *Daily Bruin* secure the **Best College News Website** award from the Southern California Journalism Awards, highlighting the organization's commitment to technical innovation alongside editorial excellence.

## Future Work

The roadmap for Oliver includes expanding its multimodal capabilities. Planned work includes integrating image metadata so users can search for photos by visual description, moving from the beta staff-only tier to a public-facing tool for the entire UCLA community, and automating the `update.py` pipeline to ingest new articles the moment they are published to the CMS for a truly real-time news assistant.
