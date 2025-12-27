import React from 'react';
import { Github, Linkedin, Twitter } from 'lucide-react';

const CompactHero = () => {
  const headshotUrl = "/assets/images/researchheadshot.jpg";
  return (
    <section className="w-full max-w-3xl mx-auto pt-32 pb-16 px-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {/* Left: Profile Photo */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-zinc-800 shadow-2xl">
            <img 
              src={headshotUrl} 
              alt="Jonathan Ouyang" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400 mb-3 tracking-tight">
            Jonathan Ouyang
          </h1>
          
          <p className="text-secondary-text leading-relaxed mb-4 max-w-lg mx-auto sm:mx-0">
            CS Undergrad at UCLA. Research at Stanford & UCLA. <br className="hidden sm:block" />
            Building <span className="text-accent-blue font-medium">Agents</span>.
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-4">
            <a 
              href="https://github.com/JonOuyang" 
              target="_blank" 
              rel="noreferrer"
              className="text-zinc-500 hover:text-white transition-colors p-2 -ml-2 rounded-md hover:bg-zinc-900"
            >
              <Github size={20} strokeWidth={1.5} />
            </a>
            <a 
              href="https://twitter.com/JonOuyang" 
              target="_blank" 
              rel="noreferrer"
              className="text-zinc-500 hover:text-white transition-colors p-2 rounded-md hover:bg-zinc-900"
            >
              <Twitter size={20} strokeWidth={1.5} />
            </a>
            <a 
              href="https://linkedin.com/in/jonathanouyang" 
              target="_blank" 
              rel="noreferrer"
              className="text-zinc-500 hover:text-white transition-colors p-2 rounded-md hover:bg-zinc-900"
            >
              <Linkedin size={20} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompactHero;
