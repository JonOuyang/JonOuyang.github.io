// Experimental Netflix-style Projects Rail

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';

const DEFAULT_DATA = {
  hero: {
    id: 0,
    title: "Full-Stack Architecture",
    description: "JAYU is a computer use agent built using the Google Gemini 1.5 models. It directly interacts with your computer, clicking buttons, typing text, and analyzing context to perform full tasks.",
    image: "https://i.ytimg.com/vi/G4RNny8s8Vw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBhEE_8-GHJqjDvT4PZniym9ovniw",
    video: "https://www.youtube.com/watch?v=G4RNny8s8Vw",
    ranking: "Winner of the 2024 Google Gemini API Developer Competition"
  },
  rows: []
};

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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 via-70% to-[#000000] h-full z-10" />
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
            onClick={() => navigate('/experimental-projects/0')}
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

// --- Netflix-style Horizontal Rail ---

const TrendingRow = ({ title, items, railPadding, rowIndex = 0 }) => {
  const navigate = useNavigate();
  const scrollClass = 'trending-scroll';

  return (
    <section
      className="relative mb-5 overflow-visible"
      style={{ zIndex: 20 - rowIndex }}
    >
      <style>{`
        .${scrollClass}::-webkit-scrollbar { display: none; }
        .${scrollClass} { scrollbar-width: none; }
      `}</style>

      <h3
        className="row-title text-[1.2vw] sm:text-lg md:text-xl font-bold text-[#f5f5f5] mb-[2px]"
        style={{
          textShadow: '0 3px 10px rgba(0,0,0,0.9)',
          marginLeft: railPadding
        }}
      >
        {title}
      </h3>

      <div
        className={`${scrollClass} scrollbar-hide flex overflow-x-auto overflow-y-visible gap-3 pt-2 pb-10`}
        style={{
          paddingLeft: railPadding,
          paddingRight: railPadding,
          scrollBehavior: 'smooth',
          scrollPaddingLeft: railPadding,
          msOverflowStyle: 'none',
          overflowY: 'visible'
        }}
      >
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className="relative flex-shrink-0 cursor-pointer transition-transform duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 hover:z-50 origin-center group will-change-transform"
              style={{
                width: 'clamp(260px, 25vw, 320px)',
                aspectRatio: '16 / 9',
                borderRadius: '6px',
                zIndex: 1
              }}
              onClick={() => navigate(`/experimental-projects/${item.id}`)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                style={{ borderRadius: '6px', filter: 'brightness(1.3) contrast(1.05) saturate(0.95)' }}
              />

              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent pointer-events-none" style={{ borderRadius: '6px' }} />

              <div
                className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ boxShadow: '0 12px 28px rgba(59,130,246,0.6), 0 0 18px rgba(59,130,246,0.55)' }}
              />

              {/* Title + metadata */}
              <div
                className="absolute bottom-3 left-3 right-3 text-white font-bold text-sm sm:text-base leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] uppercase transition-transform duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5"
                style={{ letterSpacing: '0.5px' }}
              >
                {item.title}
                <div className="mt-1 text-[10px] sm:text-xs text-zinc-100 font-semibold opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
                  {(item.tags && item.tags.length > 0) ? item.tags.slice(0, 2).join(' • ') : 'Project'}
                </div>
              </div>

              <div className="absolute inset-0 rounded-md border border-white/25 group-hover:border-blue-400/70 transition-colors duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none" />
            </div>
          );
        })}
      </div>
    </section>
  );
};

// --- Main Layout ---

const ProjectsPage = () => {
  const [data, setData] = useState(DEFAULT_DATA);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("/data/experimentalProjectsData.json");
        if (!resp.ok) throw new Error("exp projects fetch failed");
        const json = await resp.json();
        setData(json.experimentalProjectsData || DEFAULT_DATA);
      } catch (err) {
        console.error("Failed to load experimental projects data", err);
        setData(DEFAULT_DATA);
      }
    };
    load();
  }, []);

  const { hero, rows } = data;
  const projects = rows?.[0]?.items || [];
  const randomRowA = useMemo(() => [...projects].sort(() => Math.random() - 0.5), [projects]);
  const randomRowB = useMemo(() => [...projects].sort(() => Math.random() - 0.5), [projects]);
  const railPadding = '5%';

  return (
    <div className="bg-[#000000] min-h-screen font-sans text-white overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection hero={hero} />

      <div className="bg-gradient-to-b from-transparent via-[#000000] to-[#000000] pt-4 pb-12">
        <div className="max-w-[1700px] w-[96vw] mx-auto">
          <TrendingRow title="Fullstack Projects" items={projects} railPadding={railPadding} rowIndex={0} />
          <TrendingRow title="Machine Learning Projects" items={randomRowA} railPadding={railPadding} rowIndex={1} />
          <TrendingRow title="Research Projects" items={randomRowB} railPadding={railPadding} rowIndex={2} />
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
