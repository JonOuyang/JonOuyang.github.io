// src/hidden/projects/NetflixProjectsPage.jsx
// Professional Portfolio - Spotlight Bento Grid

import React, { useState, useEffect, useRef } from 'react';
import { projectsData } from './netflixProjectsData';
import {
  Play,
  Code,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';

// --- Hero Section with Auto-play Video ---

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const HeroSection = ({ hero }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef(null);

  const youtubeId = getYouTubeVideoId(hero.video);

  const resetIdleTimer = () => {
    setIsIdle(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 1000);
  };

  useEffect(() => {
    if (isIdle && hero.video) {
      setShowVideo(true);
    }
  }, [isIdle, hero.video]);

  useEffect(() => {
    resetIdleTimer();
    const handleMovement = () => resetIdleTimer();
    window.addEventListener('mousemove', handleMovement);
    window.addEventListener('touchmove', handleMovement);
    window.addEventListener('scroll', handleMovement);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('mousemove', handleMovement);
      window.removeEventListener('touchmove', handleMovement);
      window.removeEventListener('scroll', handleMovement);
    };
  }, []);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute inset-0">
        <img
          src={hero.image}
          alt="Hero Background"
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
          style={{ objectPosition: '70% center' }}
        />

        {youtubeId && showVideo && (
          <div className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${showVideo ? 'opacity-100' : 'opacity-0'}`}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              title="Hero Video"
              className="w-full h-full object-cover"
              style={{
                position: 'absolute',
                top: '0',
                left: '60%',
                width: '177.77vh',
                height: 'calc(100% + 100px)',
                minWidth: '100%',
                minHeight: '56.25vw',
                transform: 'translateX(-50%)'
              }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black from-30% via-black/80 via-50% to-transparent to-85% w-full z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-70% to-[#0a0a0a] h-full z-10" />
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-6 sm:left-12 lg:left-20 max-w-2xl z-20">
        <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-6">
          <span className="mr-2">🏆</span>
          Winner: 2024 Google Gemini API Developer Competition
        </p>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[0.95]">
          JAYU
          <br />
          <span className="text-white/90">Computer Use Agent</span>
        </h1>

        <p className="text-[#CCCCCC] text-base sm:text-lg mb-10 font-normal leading-relaxed max-w-[600px]">
          {hero.description}
        </p>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2.5 px-7 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02]">
            <Play fill="currentColor" size={18} />
            Watch Documentary
          </button>

          <button className="flex items-center gap-2.5 px-7 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 font-semibold text-base backdrop-blur-sm border border-white/20">
            <Code size={18} />
            View Source
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer animate-bounce">
        <span className="text-white/70 text-xs uppercase tracking-widest font-medium">Scroll</span>
        <ChevronDown size={20} className="text-white/70" />
      </div>
    </div>
  );
};

// --- High-Contrast Glass Card with Mouse Tracking Edge Glow ---

const SpotlightCard = ({ project, globalMousePos }) => {
  const cardRef = useRef(null);
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });

  const glowColor = project.glowColor || 'rgba(147, 51, 234, 1)';

  useEffect(() => {
    if (!cardRef.current || !globalMousePos) return;

    const rect = cardRef.current.getBoundingClientRect();

    // Calculate local mouse position relative to card
    setLocalMousePos({
      x: globalMousePos.x - rect.left,
      y: globalMousePos.y - rect.top
    });
  }, [globalMousePos]);

  return (
    <div
      ref={cardRef}
      className="relative rounded-3xl cursor-pointer group"
      style={{
        '--mouse-x': `${localMousePos.x}px`,
        '--mouse-y': `${localMousePos.y}px`,
        '--glow-color': glowColor,
      }}
    >
      {/* Outer Glow Layer 1 - Wide soft ambient */}
      <div
        className="absolute -inset-[5px] rounded-3xl pointer-events-none blur-2xl opacity-100"
        style={{
          background: `radial-gradient(490px circle at var(--mouse-x) var(--mouse-y), var(--glow-color), transparent 50%)`,
        }}
      />

      {/* Outer Glow Layer 2 - Tighter, brighter */}
      <div
        className="absolute -inset-[3px] rounded-3xl pointer-events-none blur-lg opacity-100"
        style={{
          background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), var(--glow-color), transparent 40%)`,
        }}
      />

      {/* Outer Glow Layer 3 - Sharp edge bleed */}
      <div
        className="absolute -inset-[1px] rounded-3xl pointer-events-none blur-sm opacity-100"
        style={{
          background: `radial-gradient(280px circle at var(--mouse-x) var(--mouse-y), var(--glow-color) 0%, var(--glow-color) 30%, transparent 60%)`,
        }}
      />

      {/* Inner card container - Split Dashboard */}
      <div
        className="relative rounded-3xl overflow-hidden border border-white/10 group-hover:border-white/30 bg-[#050505] transition-colors duration-300 flex flex-col"
      >
        {/* Border Glow Layer 1 - Thick bright edge */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none z-50"
          style={{
            background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), var(--glow-color) 0%, var(--glow-color) 40%, transparent 70%)`,
            padding: '3.5px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
          }}
        />

        {/* Border Glow Layer 2 - Inner hot edge */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none z-50"
          style={{
            background: `radial-gradient(245px circle at var(--mouse-x) var(--mouse-y), var(--glow-color) 0%, transparent 50%)`,
            padding: '1.5px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
          }}
        />

        {/* TOP SECTION - Image Window (60%) */}
        <div className="relative h-[200px] m-3 mb-0 rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/25 transition-colors duration-300">
          {project.image && (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          )}
          {/* Subtle inner shadow for depth */}
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)' }} />
        </div>

        {/* BOTTOM SECTION - Text Console (40%) */}
        <div className="relative z-10 p-5 pt-4 flex flex-col flex-1 bg-[#050505]">
          {/* Title - Bright White */}
          <h3 className="text-white font-bold text-lg sm:text-xl mb-1.5 tracking-tight">
            {project.title}
          </h3>

          {/* Description - Light Grey */}
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-3">
            {project.desc}
          </p>

          {/* Tech Stack Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/60 border border-white/20 rounded-md bg-white/5 transition-colors duration-200 hover:border-white/40 hover:text-white/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow Button - Bottom Right */}
        <div className="absolute bottom-5 right-5 z-10">
          <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-white/5 border border-white/20 group-hover:bg-white/10 group-hover:border-white/40">
            <ArrowUpRight
              size={16}
              className="text-white/70 group-hover:text-white transition-colors duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Spotlight Bento Grid ---

const SpotlightBentoGrid = ({ projects }) => {
  const [globalMousePos, setGlobalMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setGlobalMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section
      className="relative py-24 px-6 sm:px-12 lg:px-20 bg-[#0a0a0a]"
      onMouseMove={handleMouseMove}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
          Featured Work
        </h2>
        <p className="text-white/50 text-lg max-w-xl">
          A collection of projects spanning AI, web development, and systems engineering.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <SpotlightCard
            key={project.id}
            project={project}
            globalMousePos={globalMousePos}
          />
        ))}
      </div>
    </section>
  );
};

// --- Main Layout ---

const ProjectsPage = () => {
  const { hero, rows } = projectsData;
  const projects = rows[0]?.items.slice(0, 6) || [];

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans text-white overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection hero={hero} />

      {/* Spotlight Bento Grid */}
      <SpotlightBentoGrid projects={projects} />
    </div>
  );
};

export default ProjectsPage;