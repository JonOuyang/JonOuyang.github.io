// Professional Portfolio - Spotlight Bento Grid

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Code,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';
import { projectSlugFromTitle } from '../../utils/projectSlug';

const DEFAULT_HERO = {
  id: 0,
  title: 'Full-Stack Architecture',
  description:
    'JAYU is a computer use agent built using the Google Gemini 1.5 models. It directly interacts with your computer, clicking buttons, typing text, and analyzing context to perform full tasks.',
  image:
    'https://i.ytimg.com/vi/G4RNny8s8Vw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBhEE_8-GHJqjDvT4PZniym9ovniw',
  video: 'https://www.youtube.com/watch?v=G4RNny8s8Vw',
  ranking: 'Winner of the 2024 Google Gemini API Developer Competition'
};
const HERO_PROJECT_TITLE = 'JAYU';

const FULLSTACK_DEFAULT = [
  {
    id: 1,
    title: 'SABRE',
    desc: 'SABRE: Shared Autonomy for Battlefield Responds and Engagement',
    image: 'https://www.flyeye.io/wp-content/uploads/2023/07/Drones-1.jpg',
    glowColor: 'rgba(34, 197, 94, 1)',
    tags: ['Python', 'ROS2', 'Computer Vision']
  },
  {
    id: 2,
    title: 'LEVIATHAN',
    desc: 'Bringing Big Insights No Matter The Crew Size. Your AI Co-Pilot for smart fishing.',
    image: 'https://img.nauticexpo.com/images_ne/photo-g/28032-18598681.webp',
    glowColor: 'rgba(6, 182, 212, 1)',
    tags: ['Python', 'ROS2', 'Computer Vision']
  },
  {
    id: 3,
    title: 'Bruin Bite',
    desc: 'Find and review the best dining hallds and food spots on UCLA campus.',
    image: 'https://wp.dailybruin.com/images/2024/09/web.regissue.quad_.diningplancritiques.file_.jpg',
    glowColor: 'rgba(255, 184, 28, 1)',
    tags: ['Python', 'ROS2', 'Computer Vision']
  },
  {
    id: 4,
    title: 'Sir Syncs A Lot',
    desc: 'Control your computer using your phone. An extension of a computer use agent.',
    image: 'https://plus.unsplash.com/premium_photo-1681288023821-7ae9a9d79474?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    glowColor: 'rgba(168, 85, 247, 1)',
    tags: ['React Native', 'WebSocket', 'Node.js']
  },
  {
    id: 5,
    title: 'Berry Tongue',
    desc: 'An AI-powered language learning Chrome extension to help you learn vocabulary in context.',
    image: 'https://holdenfg.org/wp-content/uploads/2021/03/alex-ushakoff-6MynOBZgig0-unsplash-1920x1280.jpg.webp',
    glowColor: 'rgba(236, 72, 153, 1)',
    tags: ['Python', 'Manim', 'Gemini API']
  },
  {
    id: 6,
    title: 'UCLA Course Planner',
    desc: 'Plan your UCLA courses with ease using this intuitive web app.',
    image: 'https://www.mccormick.northwestern.edu/images/news/2022/02/undergraduate-launches-course-planning-web-application-header.jpg',
    glowColor: 'rgba(45, 127, 198, 1)',
    tags: ['Go', 'JWT', 'Redis']
  },
  {
    id: 7,
    title: 'Project Oliver',
    desc: 'RAG Chatbot to answer questions by citing UCLA Daily Bruin Newspaper articles',
    image: 'https://hips.hearstapps.com/hmg-prod/images/small-fluffy-dog-breeds-maltipoo-663009b6293cc.jpg?crop=0.668xw:1.00xh;0.143xw,0',
    glowColor: 'rgba(251, 207, 157, 1)',
    tags: ['Gemini', 'Pinecone', 'Python']
  },
  {
    id: 8,
    title: 'Persistence',
    desc: 'AI powered to do list, task manager, and reminder web/mobile app.',
    image: 'https://images.squarespace-cdn.com/content/v1/5e6a7ab5992a417f3a08b6a4/c1e0bf5b-3c3b-43cf-8a55-4703e95495a3/iStock-1473980728.jpg',
    glowColor: 'rgba(249, 115, 22, 1)',
    tags: ['Go', 'Redis', 'gRPC']
  },
  {
    id: 9,
    title: 'Project Montgomery',
    desc: 'Math and physics animation generator for students and educators.',
    image: 'https://github.com/JonOuyang/CalHacks-Project/raw/main/display_images/image.png',
    glowColor: 'rgba(34, 211, 238, 1)',
    tags: ['Gemini', 'Manim Animation Engine']
  }
];

const ML_DEFAULT = [
  FULLSTACK_DEFAULT[0],
  FULLSTACK_DEFAULT[1],
  FULLSTACK_DEFAULT[3],
  FULLSTACK_DEFAULT[4],
  FULLSTACK_DEFAULT[6]
];

const RESEARCH_DEFAULT = [
  { id: 11, title: 'Python Automation', desc: 'Scripts for daily workflow automation.', image: 'https://images.unsplash.com/photo-1629904853716-633c64b4c36e?w=800&q=80' },
  { id: 12, title: 'Rust Compiler', desc: 'Toy compiler built in Rust.', image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80' },
  { id: 13, title: 'Unity Game', desc: '2D Platformer mechanics prototype.', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80' },
  { id: 14, title: 'WebGL Shaders', desc: 'Custom GLSL shaders for visual effects.', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80' },
  { id: 15, title: 'NLP Sentiment', desc: 'Sentiment analysis using transformer models.', image: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80' },
  { id: 16, title: 'Blockchain Demo', desc: 'Simple blockchain implementation from scratch.', image: 'https://images.unsplash.com/photo-1644143379190-08a5f055de1d?w=800&q=80' },
  { id: 17, title: 'Ray Tracer', desc: 'CPU-based ray tracing renderer in C++.', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80' },
  { id: 18, title: 'Voice Assistant', desc: 'Local voice recognition and command system.', image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&q=80' },
  { id: 19, title: 'AR Prototype', desc: 'Augmented reality experiment with ARKit.', image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&q=80' },
  { id: 20, title: 'IoT Dashboard', desc: 'Sensor data visualization for smart devices.', image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80' }
];
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
        <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t from-black to-transparent z-10" />
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
            onClick={() => navigate(`/projects/${projectSlugFromTitle(HERO_PROJECT_TITLE)}`)}
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

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer animate-bounce">
        <span className="text-white/70 text-xs uppercase tracking-widest font-medium">Scroll</span>
        <ChevronDown size={20} className="text-white/70" />
      </div>
    </div>
  );
};

// --- High-Contrast Glass Card with Mouse Tracking Edge Glow ---

const SpotlightCard = ({ project, globalMousePos, horizontal = false }) => {
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
    navigate(`/projects/${projectSlugFromTitle(project.title)}`);
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
        className={`relative rounded-3xl overflow-hidden border border-white/10 group-hover:border-white/30 bg-[#050505] transition-colors duration-300 flex ${horizontal ? 'flex-col md:flex-row' : 'flex-col'}`}
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

        {/* TOP/LEFT SECTION - Image Window (Recessed Screen) */}
        <div
          className={`relative h-[200px] ${horizontal ? 'm-3 md:m-4 md:mr-0 md:w-[320px] flex-shrink-0' : 'm-3 mb-0'} rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/25 transition-colors duration-300`}
        >
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

        {/* BOTTOM/RIGHT SECTION - Text Console */}
        <div
          className={`relative z-10 p-5 pt-4 flex flex-col flex-1 bg-[#050505] ${horizontal ? 'md:pl-6' : ''}`}
        >
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

const ProjectSection = ({ sectionId, title, projects, globalMousePos, singleColumn = false }) => (
  <section id={sectionId} className="scroll-mt-28 space-y-4">
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 mb-1">Collection</p>
      <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
        {title}
      </h2>
    </div>
    <div className="h-px w-full bg-white/10" />
    <div
      className={`grid grid-cols-1 ${singleColumn ? '' : 'md:grid-cols-2'} gap-6 lg:gap-8 overflow-visible`}
    >
      {projects.map((project) => (
        <SpotlightCard
          key={project.id}
          project={project}
          globalMousePos={globalMousePos}
          horizontal={singleColumn}
        />
      ))}
    </div>
  </section>
);

// --- Main Layout ---

const ProjectsPage = () => {
  const [heroData, setHeroData] = useState(DEFAULT_HERO);
  const [fullstackProjects, setFullstackProjects] = useState(FULLSTACK_DEFAULT);
  const [machineLearningProjects, setMachineLearningProjects] = useState(ML_DEFAULT);
  const [researchProjects, setResearchProjects] = useState(RESEARCH_DEFAULT);

  const fullstackGlow = 'rgba(59, 130, 246, 1)'; // blue
  const mlGlow = 'rgba(251, 146, 60, 1)'; // orange

  const [activeSection, setActiveSection] = useState('fullstack');
  const isScrollingRef = useRef(false);
  const [globalMousePos, setGlobalMousePos] = useState({ x: 0, y: 0 });

  const sections = [
    { id: 'fullstack', label: 'Fullstack Projects' },
    { id: 'machine-learning', label: 'Machine Learning Projects' },
    { id: 'research', label: 'Research Projects' },
  ];

  // Load data from public/project-data on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [fullstackResp, mlResp, researchResp] = await Promise.all([
          fetch('/project-data/FullstackProjects.json'),
          fetch('/project-data/MachineLearningProjects.json'),
          fetch('/project-data/ResearchProjects.json')
        ]);

        if (!isMounted) return;

        if (!fullstackResp.ok || !mlResp.ok || !researchResp.ok) {
          throw new Error('Failed to fetch project data');
        }

        const [fullstackJson, mlJson, researchJson] = await Promise.all([
          fullstackResp.json(),
          mlResp.json(),
          researchResp.json()
        ]);

        setHeroData(fullstackJson.hero || DEFAULT_HERO);
        setFullstackProjects(fullstackJson.fullstackProjects?.length ? fullstackJson.fullstackProjects : FULLSTACK_DEFAULT);
        setMachineLearningProjects(mlJson.machineLearningProjects?.length ? mlJson.machineLearningProjects : ML_DEFAULT);
        setResearchProjects(researchJson.researchProjects?.length ? researchJson.researchProjects : RESEARCH_DEFAULT);
      } catch (error) {
        console.error('Failed to load project data from public/project-data', error);
        if (isMounted) {
          // Fallback to defaults if something goes wrong
          setHeroData(DEFAULT_HERO);
          setFullstackProjects(FULLSTACK_DEFAULT);
          setMachineLearningProjects(ML_DEFAULT);
          setResearchProjects(RESEARCH_DEFAULT);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      const scrollPosition = window.scrollY + 280;
      let current = sections[0].id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollPosition) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      isScrollingRef.current = true;
      setActiveSection(sectionId);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans text-white">
      {/* Hero Section */}
      <HeroSection hero={heroData} />

      {/* Sticky Sidebar + Project Grid */}
      <section
        className="relative bg-black text-white overflow-visible"
        onMouseMove={(e) => setGlobalMousePos({ x: e.clientX, y: e.clientY })}
      >
        <div className="relative max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-14">
          <div className="grid lg:grid-cols-[220px_1fr] gap-10 items-start">
            {/* Sidebar */}
            <aside
              className="hidden lg:block h-max sticky top-24 self-start"
            >
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.4em] mb-6 pl-4">
                Contents
              </h3>
              <div className="flex flex-col space-y-1 relative border-l border-white/10">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`relative pl-4 py-2 text-sm text-left transition-colors duration-200 border-l-2 -ml-[2px] ${
                      activeSection === section.id
                        ? 'border-blue-400 text-white font-medium'
                        : 'border-transparent text-zinc-400 hover:text-white/80'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Project Sections */}
            <div className="space-y-20">
              <ProjectSection
                sectionId="fullstack"
                title="Fullstack Projects"
                projects={fullstackProjects.map((p) => ({ ...p, glowColor: fullstackGlow }))}
                globalMousePos={globalMousePos}
              />
              <ProjectSection
                sectionId="machine-learning"
                title="Machine Learning Projects"
                projects={machineLearningProjects.map((p) => ({ ...p, glowColor: mlGlow }))}
                globalMousePos={globalMousePos}
              />
              <ProjectSection
                sectionId="research"
                title="Research Projects"
                projects={researchProjects}
                globalMousePos={globalMousePos}
                singleColumn
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
