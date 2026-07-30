// Professional Portfolio - Spotlight Bento Grid

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Code,
  ChevronDown,
  ArrowUpRight,
  Building2,
  GraduationCap
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

const HeroSection = ({ hero, onScrollHintClick }) => {
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

      <button
        type="button"
        onClick={onScrollHintClick}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer animate-bounce"
        aria-label="Scroll to contents"
      >
        <span className="text-white/70 text-xs uppercase tracking-widest font-medium">Scroll</span>
        <ChevronDown size={20} className="text-white/70" />
      </button>
    </div>
  );
};

// --- Cinematic Sticky Stack ---

const ANTON = '"Anton", "Arial Narrow", sans-serif';
const HOT = '#45C8FF';

const CATEGORY_LABEL = {
  fullstack: 'Fullstack',
  ml: 'Machine Learning',
  research: 'Research',
};

const FEATURED_COUNT = 6;

// One full-bleed cinema panel. Panels are sticky, so each one slides up and
// covers the previous as you scroll — no interaction needed beyond scrolling.
const StackPanel = ({ project, index, total, onOpen }) => (
  <div className="sticky top-0 h-screen overflow-hidden" style={{ zIndex: index + 1 }}>
    <div className="absolute inset-0 bg-black">
      {project.image && (
        <img
          src={project.image}
          alt={project.title}
          loading={index === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* cinema grade, same language as the hero */}
      <div className="absolute inset-0 bg-gradient-to-r from-black from-15% via-black/70 via-45% to-transparent to-90%" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </div>

    <div className="relative h-full max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-center">
      <p className="text-[10px] uppercase tracking-[0.45em] mb-5" style={{ color: HOT }}>
        {String(index + 1).padStart(2, '0')} — {String(total).padStart(2, '0')}
        <span className="text-zinc-600 ml-4">{CATEGORY_LABEL[project.category]}</span>
      </p>

      <h3
        className="uppercase text-white leading-[0.88] mb-6 max-w-3xl"
        style={{ fontFamily: ANTON, fontSize: 'clamp(3rem, 7vw, 6.5rem)' }}
      >
        {project.title}
      </h3>

      <p className="text-zinc-300/90 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
        {project.desc}
      </p>

      <div className="flex items-center gap-6">
        <button
          onClick={onOpen}
          className="flex items-center gap-2.5 px-7 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all duration-200 font-semibold text-sm sm:text-base hover:scale-[1.02]"
        >
          <ArrowUpRight size={17} />
          Open Project
        </button>
        {project.tags?.length > 0 && (
          <div className="hidden sm:flex gap-x-5">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 self-center">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Quiet archive rows for everything that isn't featured
const ArchiveRow = ({ project, index, onOpen, isLast }) => (
  <button
    onClick={onOpen}
    className={`group w-full flex items-center gap-6 py-4 text-left border-t border-white/[0.08] ${isLast ? 'border-b' : ''} transition-colors duration-200 hover:bg-white/[0.03]`}
  >
    <span className="text-[10px] tracking-[0.25em] text-zinc-600 w-8 shrink-0">
      {String(index + 1).padStart(2, '0')}
    </span>
    <span className="flex-1 min-w-0 truncate text-[15px] text-zinc-300 group-hover:text-white transition-colors duration-200">
      {project.title}
    </span>
    <span className="hidden sm:block text-[10px] uppercase tracking-[0.3em] text-zinc-600 shrink-0">
      {CATEGORY_LABEL[project.category]}
    </span>
    <ArrowUpRight
      size={15}
      className="shrink-0 text-zinc-600 group-hover:text-white transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      style={{ color: undefined }}
    />
  </button>
);

// --- Main Layout ---

const ProjectsV2Page = () => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState(DEFAULT_HERO);
  const [fullstackProjects, setFullstackProjects] = useState(FULLSTACK_DEFAULT);
  const [machineLearningProjects, setMachineLearningProjects] = useState(ML_DEFAULT);
  const [researchProjects, setResearchProjects] = useState(RESEARCH_DEFAULT);

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

  // Merge categories; dedupe by title (ML list can share entries with fullstack)
  const all = React.useMemo(() => {
    const tag = (list, category) => list.map((p) => ({ ...p, category }));
    const combined = [
      ...tag(fullstackProjects, 'fullstack'),
      ...tag(machineLearningProjects, 'ml'),
      ...tag(researchProjects, 'research'),
    ];
    const seen = new Set();
    return combined.filter((p) => {
      if (seen.has(p.title)) return false;
      seen.add(p.title);
      return true;
    });
  }, [fullstackProjects, machineLearningProjects, researchProjects]);

  const featured = all.slice(0, FEATURED_COUNT);
  const archive = all.slice(FEATURED_COUNT);

  const openProject = (p) => navigate(`/projects/${projectSlugFromTitle(p.title)}`);

  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-black min-h-screen font-sans text-white">
      <HeroSection hero={heroData} onScrollHintClick={scrollToWork} />

      {/* featured: sticky cinema panels, each covers the last as you scroll */}
      <section id="work">
        {featured.map((project, i) => (
          <StackPanel
            key={`${project.category}-${project.id ?? project.title}`}
            project={project}
            index={i}
            total={featured.length}
            onOpen={() => openProject(project)}
          />
        ))}
      </section>

      {/* archive: everything else, quiet */}
      {archive.length > 0 && (
        <section className="relative z-50 bg-black">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-28">
            <div className="flex items-end justify-between mb-10">
              <h2
                className="uppercase text-white leading-none"
                style={{ fontFamily: ANTON, fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
              >
                Archive<span style={{ color: HOT }}>.</span>
              </h2>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-600 pb-1">
                {archive.length} more
              </p>
            </div>
            <div>
              {archive.map((project, i) => (
                <ArchiveRow
                  key={`${project.category}-${project.id ?? project.title}`}
                  project={project}
                  index={i}
                  onOpen={() => openProject(project)}
                  isLast={i === archive.length - 1}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProjectsV2Page;
