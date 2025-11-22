// src/projects-components/ProjectsPage.jsx

import React, { useState, useEffect } from 'react';
import { projectsData } from './projectsData';
import {
  Play,
  Info,
  ChevronRight,
  Search,
  Home,
  Monitor,
  Film,
  Plus
} from 'lucide-react';

// --- Helper Components ---

const SidebarIcon = ({ icon: Icon, active = false }) => (
  <div className={`w-full h-16 flex items-center justify-center cursor-pointer transition-colors ${active ? 'text-white border-r-4 border-[#E50914]' : 'text-gray-400 hover:text-white'}`}>
    <Icon size={24} strokeWidth={2} />
  </div>
);

// The Complex Card Component
const ExpandableCard = ({ item, rank }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex-shrink-0 group z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* If Ranked, show the big SVG Number behind */}
      {rank && (
        <div className="absolute right-full bottom-0 h-full flex items-end justify-end mr-[-20px] z-0 pointer-events-none">
             <svg 
              width="140" 
              height="160" 
              viewBox="0 0 100 100" 
              className="fill-black stroke-gray-600 stroke-2"
              style={{ overflow: 'visible' }}
             >
              <text 
                x="50" 
                y="100" 
                fontSize="130" 
                fontWeight="bold" 
                textAnchor="end"
                stroke="#595959"
                strokeWidth="3px"
                className="drop-shadow-lg"
              >
                {rank}
              </text>
            </svg>
        </div>
      )}

      {/* The Card Container - Animates Width */}
      <div 
        className={`
          relative bg-[#141414] rounded-md overflow-hidden shadow-xl cursor-pointer
          transition-all duration-500 ease-in-out transform origin-left
          ${isHovered ? 'w-[20rem] scale-110 z-50' : 'w-40 sm:w-48 z-10'}
          h-60 sm:h-72
        `}
      >
        {/* Image Container */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={item.image} 
            alt={item.title} 
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        </div>

        {/* Gradient Overlay - Only visible on hover, slides in */}
        <div 
          className={`
            absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent
            transition-opacity duration-500
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `} 
        />

        {/* Content - Visible on hover */}
        <div className={`
            absolute inset-0 p-4 flex flex-col justify-center
            transition-all duration-500 delay-100
            ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        `}>
            <h3 className="text-white font-bold text-lg mb-2 drop-shadow-md">{item.title}</h3>
            <p className="text-gray-300 text-xs leading-relaxed line-clamp-3 mb-3">
              {item.desc}
            </p>
            
            {/* Tech tags or mini stats */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-semibold text-green-400">98% Match</span>
              <span className="text-[10px] border border-gray-500 px-1 rounded text-gray-300">HD</span>
            </div>
        </div>
      </div>
    </div>
  );
};


const ContentRow = ({ title, items, isRanked = false }) => (
  <div className="mb-10 pl-4 sm:pl-12 lg:pl-20 z-20 relative">
    <h2 className="text-[#e5e5e5] text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 group cursor-pointer">
      {title}
      <span className="text-xs text-cyan-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center -ml-2 group-hover:ml-2 duration-300">
        Explore All <ChevronRight size={14} />
      </span>
    </h2>
    
    {/* Scrollable Row */}
    <div className={`flex gap-4 ${isRanked ? 'gap-x-16 pl-12' : 'gap-4'} overflow-x-auto scrollbar-hide pb-12 pt-4 px-4 -ml-4`}>
      {items.map((item) => (
        <ExpandableCard 
          key={item.id} 
          item={item} 
          rank={isRanked ? item.ranking : null} 
        />
      ))}
    </div>
  </div>
);


// --- Main Layout ---

const ProjectsPage = () => {
  const { hero, rows } = projectsData;

  return (
    <div className="bg-[#141414] min-h-screen font-sans text-white overflow-x-hidden">

      {/* Left Sidebar Navigation (Fixed) */}
      <div className="fixed left-0 top-0 h-full w-16 sm:w-20 z-40 bg-black flex flex-col items-center py-20 border-r border-white/5 hidden lg:flex">
        <div className="flex flex-col gap-6 w-full mt-4">
          <SidebarIcon icon={Search} />
          <SidebarIcon icon={Home} active />
          <SidebarIcon icon={Monitor} />
          <SidebarIcon icon={Film} />
          <SidebarIcon icon={Plus} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full relative lg:pl-20">
        
        {/* Hero Section */}
        <div className="relative h-[90vh] w-full">
          {/* Hero Background Image */}
          <div className="absolute inset-0">
            <img 
              src={hero.image} 
              alt="Hero Background" 
              className="w-full h-full object-cover object-center"
            />
            
            {/* FIX: Stronger Gradients matching the requested reference */}
            {/* 1. Left vignette for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent w-2/3" />
            {/* 2. Bottom fade to merge with content */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent h-full" />
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-[25%] left-4 sm:left-12 lg:left-16 max-w-xl z-10">
            
            {/* "N Series" Label equivalent */}
            <div className="flex items-center gap-1 mb-4">
               <div className="h-6 w-4 bg-[#E50914] flex flex-col justify-center items-center">
                   <span className="text-[6px] font-bold text-white leading-tight">P</span>
               </div>
               <span className="tracking-[4px] text-gray-400 text-xs font-bold">PROJECT</span>
            </div>

            {/* Title (Using text since user screenshot had text, not logo) */}
            <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter leading-none">
                STRANGER<br/>CODE
            </h1>

            {/* Ranking Badge */}
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#E50914] text-white text-xs font-bold px-1 py-0.5 rounded-sm">TOP 10</div>
                <span className="text-xl font-bold text-white drop-shadow-md">{hero.ranking}</span>
            </div>

            {/* Description */}
            <p className="text-white text-base sm:text-lg mb-8 font-normal drop-shadow-md leading-snug max-w-lg">
              {hero.description}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-8 py-2.5 bg-white text-black rounded hover:bg-white/90 transition font-bold text-lg">
                <Play fill="currentColor" size={24} /> Play
              </button>
              <button className="flex items-center gap-2 px-8 py-2.5 bg-gray-500/40 text-white rounded hover:bg-gray-500/30 transition font-bold text-lg backdrop-blur-sm">
                <Info size={24} /> More info
              </button>
            </div>
          </div>
           
           {/* Maturity Rating (Right Side) */}
           <div className="absolute right-0 bottom-[35%] bg-[#333]/60 border-l-2 border-[#dcdcdc] py-1 pl-3 pr-10 backdrop-blur-md">
             <span className="text-white font-medium text-sm uppercase">{hero.rating}</span>
           </div>
        </div>

        {/* Rows Section */}
        <div className="-mt-32 relative z-20 pb-24 space-y-8">
          {rows.map((row, index) => (
            <ContentRow 
              key={index} 
              title={row.title} 
              items={row.items} 
              isRanked={row.title.includes('Top 10')}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProjectsPage;