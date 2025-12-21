// Professional Portfolio - Spotlight Bento Grid

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsData } from './netflixProjectsData';
import {
  Play,
  Code,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';

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

const VIDEO_OFFSET_CONFIG = {
  // Adjust these to pin the video at specific times (seconds into playback)
  keyframes: [
    { timeSeconds: 0, percent: 80 },
    { timeSeconds: 6.5, percent: 58 },
    { timeSeconds: 10.5, percent: 80 },
    { timeSeconds: 28, percent: 60 },
    { timeSeconds: 30.3, percent: 80 }
  ],
  defaultPercent: 55, // fallback if no keyframe has fired yet
  timerIntervalMs: 500 // how often to recalc position
};

const HeroSection = ({ hero }) => {
  const navigate = useNavigate();
  const youtubeId = getYouTubeVideoId(hero.video);
  const [showVideo, setShowVideo] = useState(!!youtubeId);
  const [videoOffsetPercent, setVideoOffsetPercent] = useState(VIDEO_OFFSET_CONFIG.basePercent);

  // Load the video immediately on page load
  useEffect(() => {
    setShowVideo(!!youtubeId);
  }, [youtubeId]);

  // Set the video position based on elapsed playback time and explicit keyframes
  useEffect(() => {
    if (!showVideo) return;

    const { keyframes = [], defaultPercent = 50, timerIntervalMs = 1000 } = VIDEO_OFFSET_CONFIG;
    const startTime = performance.now();
    const sortedFrames = [...keyframes].sort((a, b) => a.timeSeconds - b.timeSeconds);

    const updateOffset = () => {
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      // Find the last keyframe at or before the current time
      let currentPercent = defaultPercent;
      for (const frame of sortedFrames) {
        if (elapsedSeconds >= frame.timeSeconds) {
          currentPercent = frame.percent;
        } else {
          break;
        }
      }
      setVideoOffsetPercent(currentPercent);
    };

    updateOffset(); // set initial position on mount
    const intervalId = setInterval(updateOffset, timerIntervalMs);
    return () => clearInterval(intervalId);
  }, [showVideo]);

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
                top: '-40px',
                left: `${videoOffsetPercent}%`,
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
          <button
            onClick={() => navigate('/projects/0')}
            className="flex items-center gap-2.5 px-7 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            <ArrowUpRight size={18} />
            Read More
          </button>

          <a
            href="https://ai.google.dev/competition/projects/jayu"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-7 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 font-semibold text-base backdrop-blur-sm border border-white/20"
          >
            <Play fill="currentColor" size={18} />
            Watch Demo
          </a>
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
  const navigate = useNavigate();
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

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div
      ref={cardRef}
      className="relative rounded-3xl cursor-pointer group"
      onClick={handleClick}
      style={{
        '--mouse-x': `${localMousePos.x}px`,
        '--mouse-y': `${localMousePos.y}px`,
        '--glow-color': glowColor,
      }}
    >
      {/* Outer Glow Layer 1 - Wide soft ambient */}
      <div
        className="absolute -inset-[8px] rounded-3xl pointer-events-none blur-2xl opacity-100"
        style={{
          background: `radial-gradient(550px circle at var(--mouse-x) var(--mouse-y), var(--glow-color), transparent 45%)`,
        }}
      />

      {/* Outer Glow Layer 2 - Tighter, brighter */}
      <div
        className="absolute -inset-[5px] rounded-3xl pointer-events-none blur-xl opacity-100"
        style={{
          background: `radial-gradient(420px circle at var(--mouse-x) var(--mouse-y), var(--glow-color), transparent 35%)`,
        }}
      />

      {/* Outer Glow Layer 3 - Sharp edge bleed */}
      <div
        className="absolute -inset-[2px] rounded-3xl pointer-events-none blur-md opacity-100"
        style={{
          background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), var(--glow-color) 0%, var(--glow-color) 35%, transparent 55%)`,
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
            background: `radial-gradient(420px circle at var(--mouse-x) var(--mouse-y), var(--glow-color) 0%, var(--glow-color) 45%, transparent 65%)`,
            padding: '4.5px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
          }}
        />

        {/* Border Glow Layer 2 - Inner hot edge */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none z-50"
          style={{
            background: `radial-gradient(320px circle at var(--mouse-x) var(--mouse-y), var(--glow-color) 0%, transparent 45%)`,
            padding: '2px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
          }}
        />

        {/* TOP SECTION - Image Window (Recessed Screen) */}
        <div className="relative h-[200px] m-3 mb-0 rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/25 transition-colors duration-300">
          {project.image && (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          )}
          {/* Recessed Screen Bezel - Inner ring for embedded look */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none z-20" />
          {/* Seamless Vignette - Blends into console body */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
          {/* Subtle inner shadow for depth */}
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)' }} />
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

          {/* Tech Stack Tags - Dynamic Color Sync */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50 border border-white/15 rounded-md bg-white/5 transition-all duration-300"
                  style={{
                    '--tag-glow': glowColor.replace('1)', '0.6)'),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = glowColor.replace('1)', '0.5)');
                    e.currentTarget.style.color = glowColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.color = '';
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow Button - Dynamic Color Sync */}
        <div className="absolute bottom-5 right-5 z-10">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-white/5 border border-white/20"
            style={{
              '--btn-glow': glowColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = glowColor;
              e.currentTarget.style.borderColor = glowColor;
              e.currentTarget.querySelector('svg').style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.borderColor = '';
              e.currentTarget.querySelector('svg').style.color = '';
            }}
          >
            <ArrowUpRight
              size={16}
              className="text-white/70 transition-colors duration-300"
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
  const projects = rows[0]?.items || [];

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
