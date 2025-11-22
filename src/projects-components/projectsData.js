// src/projects-components/projectsData.js

export const projectsData = {
  hero: {
    id: 0,
    title: "Full-Stack Architecture", // Replaces the Image Logo if image is missing
    description: "Explore my portfolio of software engineering projects, from AI-powered applications to full-stack web development. Dive into the code that powers scalable solutions.",
    image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2070&auto=format&fit=crop", // High res code background
    ranking: "#1 in Projects Today",
    match: "98% Match",
    year: "2024",
    rating: "TV-14",
    duration: "Senior Level"
  },
  rows: [
    {
      title: "Top 10 Projects",
      items: [
        { 
          id: 1, 
          ranking: 1, 
          title: "E-Commerce API", 
          desc: "A scalable RESTful API built with Node.js and Redis caching.",
          image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" 
        },
        { 
          id: 2, 
          ranking: 2, 
          title: "Neural Net Viz", 
          desc: "Interactive 3D visualization of neural networks using Three.js.",
          image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80" 
        },
        { 
          id: 3, 
          ranking: 3, 
          title: "Crypto Dashboard", 
          desc: "Real-time websocket data tracking for major cryptocurrencies.",
          image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80" 
        },
        { 
          id: 4, 
          ranking: 4, 
          title: "Auth System", 
          desc: "JWT-based multi-factor authentication microservice.",
          image: "https://images.unsplash.com/photo-1510915361402-280e1553e5bc?w=800&q=80" 
        },
        { 
          id: 5, 
          ranking: 5, 
          title: "Cloud Manager", 
          desc: "AWS wrapper for managing EC2 instances effortlessly.",
          image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" 
        },
      ]
    },
    {
      title: "Research & Experiments",
      items: [
        { id: 6, title: "Python Automation", desc: "Scripts for daily workflow.", image: "https://images.unsplash.com/photo-1629904853716-633c64b4c36e?w=800&q=80" },
        { id: 7, title: "Rust Compiler", desc: "Toy compiler built in Rust.", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80" },
        { id: 8, title: "Unity Game", desc: "2D Platformer mechanics.", image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80" },
      ]
    }
  ]
};