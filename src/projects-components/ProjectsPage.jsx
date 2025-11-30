// Linear.app Dark Mode Aesthetic - "Magical Software" vibe

import React, { useState } from 'react';
import { Play } from 'lucide-react';
const projects = [
  {
    id: 1,
    title: "E-Commerce API",
    description: "Scalable RESTful API with Redis caching",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    tech: ["Node.js", "Redis", "PostgreSQL"]
  },
  {
    id: 2,
    title: "Neural Net Visualizer",
    description: "Interactive 3D neural network visualization",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    tech: ["Three.js", "WebGL", "React"]
  },
  {
    id: 3,
    title: "Crypto Dashboard",
    description: "Real-time cryptocurrency tracking",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    tech: ["WebSocket", "D3.js", "Node.js"]
  },
  {
    id: 4,
    title: "Auth Microservice",
    description: "JWT-based multi-factor authentication",
    image: "https://images.unsplash.com/photo-1510915361402-280e1553e5bc?w=800&q=80",
    tech: ["Go", "JWT", "Redis"]
  },
  {
    id: 5,
    title: "ML Pipeline",
    description: "End-to-end machine learning pipeline",
    image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&q=80",
    tech: ["Python", "TensorFlow", "Kubernetes"]
  },
  {
    id: 6,
    title: "GraphQL Gateway",
    description: "Unified API gateway for microservices",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    tech: ["GraphQL", "Apollo", "TypeScript"]
  },
];

const glassBorder = "border border-white/[0.15]";
const ProjectCard = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden bg-[#0F0F0F] ${glassBorder}
        transition-all duration-500 ease-out
        ${isHovered ? 'scale-[1.02] shadow-2xl' : ''}
      `}
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, #0F0F0F 0%, #1a1a2e 100%)'
          : '#0F0F0F',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          absolute inset-0 rounded-xl transition-opacity duration-500
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
          padding: '1px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMaskComposite: 'xor',
        }}
      />

      <div className="relative h-48 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2">{project.title}</h3>
        <p className="text-gray-400 text-sm mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-xs font-medium text-gray-300 bg-white/[0.08] rounded-full border border-white/[0.1]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">

        {/* ============ SECTION 1: HERO (The Agent) ============ */}
        <section className="mb-32">
          {/* Video Container with 3D Tilt and Glow */}
          <div
            className="relative mx-auto max-w-4xl"
            style={{ perspective: '1000px' }}
          >
            <div
              className={`
                relative rounded-2xl overflow-hidden ${glassBorder}
                shadow-[0_0_80px_rgba(99,102,241,0.3)]
              `}
              style={{
                transform: 'rotateX(5deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="aspect-video bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-white/20 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white/60 ml-1" />
                  </div>
                  <p className="text-gray-500 text-sm">Agent Demo Video</p>
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 60px rgba(99, 102, 241, 0.1)'
                }}
              />
            </div>
          </div>

          {/* Hero Title */}
          <div className="text-center mt-12">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                JAYU Gemini Agent
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              An AI-powered computer use agent that won the 2024 Google Gemini API Developer Competition
            </p>
          </div>
        </section>

        {/* ============ SECTION 2: SPOTLIGHT (Google Documentary) ============ */}
        <section className="mb-32">
          <div className={`relative rounded-2xl overflow-hidden ${glassBorder} group cursor-pointer`}>
            <div className="relative aspect-[21/9] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2070&auto=format&fit=crop"
                alt="Google Documentary"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute top-6 right-6">
                <div
                  className="px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-md"
                  style={{
                    background: 'rgba(99, 102, 241, 0.3)',
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  Featured by Google
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-24 h-24 rounded-full border-2 border-white/30 flex items-center justify-center
                             transition-all duration-300 group-hover:scale-110 group-hover:border-white/50"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <Play className="w-10 h-10 text-white/80 ml-1" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  The Story Behind JAYU
                </h2>
                <p className="text-gray-300 text-lg">
                  Watch the official Google documentary about the winning project
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ SECTION 3: PROJECT GRID ============ */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">More Projects</h2>
            <p className="text-gray-400">A collection of software engineering experiments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ProjectsPage;
