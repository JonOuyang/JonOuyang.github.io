// src/projects-components/projectsData.js

export const projectsData = {
  hero: {
    id: 0,
    title: "Full-Stack Architecture",
    description: "JAYU is a computer use agent built using the Google Gemini 1.5 models. It directly interacts with your computer, clicking buttons, typing text, and analyzing context to perform full tasks.",
    image: "https://i.ytimg.com/vi/G4RNny8s8Vw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBhEE_8-GHJqjDvT4PZniym9ovniw",
    video: "https://www.youtube.com/watch?v=G4RNny8s8Vw",
    ranking: "Winner of the 2024 Google Gemini API Developer Competition"
  },
  rows: [
    {
      title: "See My Other Projects",
      items: [
        {
          id: 1,
          title: "SABRE",
          desc: "SABRE: Shared Autonomy for Battlefield Responds and Engagement",
          image: "https://www.flyeye.io/wp-content/uploads/2023/07/Drones-1.jpg",
          glowColor: "rgba(234, 179, 8, 1)", // Gold
          tags: ["Python", "ROS2", "Computer Vision"]
        },
        {
          id: 2,
          title: "Sir Syncs A Lot",
          desc: "Control your computer using your phone. An extension of a computer use agent.",
          image: "https://plus.unsplash.com/premium_photo-1681288023821-7ae9a9d79474?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          glowColor: "rgba(147, 51, 234, 1)", // Purple
          tags: ["React Native", "WebSocket", "Node.js"]
        },
        {
          id: 3,
          title: "Project Montgomery",
          desc: "Physics and math animation generator using Manim and Gemini",
          image: "https://www.flyeye.io/wp-content/uploads/2023/07/Drones-1.jpg",
          glowColor: "rgba(59, 130, 246, 1)", // Blue
          tags: ["Python", "Manim", "Gemini API"]
        },
        {
          id: 4,
          title: "Auth System",
          desc: "JWT-based multi-factor authentication microservice.",
          image: "https://www.flyeye.io/wp-content/uploads/2023/07/Drones-1.jpg",
          glowColor: "rgba(34, 197, 94, 1)", // Green
          tags: ["Go", "JWT", "Redis"]
        },
        {
          id: 5,
          title: "Cloud Manager",
          desc: "AWS wrapper for managing EC2 instances effortlessly.",
          image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
          glowColor: "rgba(236, 72, 153, 1)", // Pink
          tags: ["AWS", "Terraform", "Python"]
        },
        {
          id: 6,
          title: "Task Scheduler",
          desc: "Distributed task queue with priority scheduling and retries.",
          image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&q=80",
          glowColor: "rgba(249, 115, 22, 1)", // Orange
          tags: ["Go", "Redis", "gRPC"]
        },
        {
          id: 7,
          ranking: 7,
          title: "GraphQL Gateway",
          desc: "Unified API gateway aggregating multiple microservices.",
          image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80"
        },
        {
          id: 8,
          ranking: 8,
          title: "ML Pipeline",
          desc: "End-to-end machine learning pipeline with automated training.",
          image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&q=80"
        },
        {
          id: 9,
          ranking: 9,
          title: "Chat Platform",
          desc: "Real-time messaging app with WebSocket and Redis pub/sub.",
          image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&q=80"
        },
        {
          id: 10,
          ranking: 10,
          title: "CI/CD Pipeline",
          desc: "Automated deployment pipeline with Docker and Kubernetes.",
          image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80"
        },
      ]
    },
    {
      title: "Research & Experiments",
      items: [
        { id: 11, title: "Python Automation", desc: "Scripts for daily workflow automation.", image: "https://images.unsplash.com/photo-1629904853716-633c64b4c36e?w=800&q=80" },
        { id: 12, title: "Rust Compiler", desc: "Toy compiler built in Rust.", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80" },
        { id: 13, title: "Unity Game", desc: "2D Platformer mechanics prototype.", image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80" },
        { id: 14, title: "WebGL Shaders", desc: "Custom GLSL shaders for visual effects.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" },
        { id: 15, title: "NLP Sentiment", desc: "Sentiment analysis using transformer models.", image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80" },
        { id: 16, title: "Blockchain Demo", desc: "Simple blockchain implementation from scratch.", image: "https://images.unsplash.com/photo-1644143379190-08a5f055de1d?w=800&q=80" },
        { id: 17, title: "Ray Tracer", desc: "CPU-based ray tracing renderer in C++.", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80" },
        { id: 18, title: "Voice Assistant", desc: "Local voice recognition and command system.", image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&q=80" },
        { id: 19, title: "AR Prototype", desc: "Augmented reality experiment with ARKit.", image: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&q=80" },
        { id: 20, title: "IoT Dashboard", desc: "Sensor data visualization for smart devices.", image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80" },
      ]
    }
  ]
};
