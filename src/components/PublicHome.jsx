import React from "react";

const PublicHome = () => {
  return (
    <main className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">
      
      {/* MAIN CONTENT GRID */}
      <div className="max-w-5xl w-full grid gap-12 md:grid-cols-[1.2fr_0.8fr] items-center z-10 pb-20">
        
        {/* TEXT SECTION */}
        <div className="space-y-8">
          
          {/* 1. The "Eyebrow" */}
          <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-indigo-500"></div>
             <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
               My name is
             </p>
          </div>

          {/* 2. The Name */}
          <div className="space-y-2">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
                Jonathan
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
                Ouyang
              </span>
            </h1>
            
            {/* 3. The Action */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-zinc-600">
              and I build <span className="text-indigo-400">Agents</span>.
            </h2>
          </div>

          {/* Description */}
          <p className="text-zinc-400 text-lg leading-relaxed max-w-xl font-light border-l-2 border-zinc-800 pl-6">
            A UCLA computer science student building practical, human-centered AI tools. 
            Research at <span className="text-white/90 font-medium">Stanford</span>, <span className="text-white/90 font-medium">UCLA</span>, and <span className="text-white/90 font-medium">SJSU</span>. 
            Previously at <span className="text-white/90 font-medium">Amazon</span> & <span className="text-white/90 font-medium">Google</span>.
          </p>

        </div>

        {/* IMAGE SECTION */}
        <div className="mx-auto md:order-last order-first relative">
          {/* Back Glow */}
          <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full"></div>
          
          {/* Profile Image - Full Color */}
          <img
            src="https://static0.cbrimages.com/wordpress/wp-content/uploads/2024/09/frieren-the-elf-stands-with-a-row-of-people-around-her.jpg?q=49&fit=crop&w=825&dpr=2"
            alt="Jonathan Ouyang"
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full object-cover border border-zinc-800 shadow-2xl transition-transform duration-700 ease-out hover:scale-105"
          />
        </div>

      </div>

      {/* BOTTOM AREA CONTAINER */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10">
        
        {/* Scroll Indicator */}
        <div className="text-zinc-700 text-[10px] tracking-widest uppercase animate-pulse">
          Scroll to explore ↓
        </div>

        {/* WIP Notice */}
        <div className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-600 text-[10px] font-mono flex items-center gap-2 hover:bg-zinc-900 transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Work in progress, check here later!
        </div>

      </div>

    </main>
  );
};

export default PublicHome;