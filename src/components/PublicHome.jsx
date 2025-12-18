import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Github, Twitter, Mail, ArrowUpRight } from "lucide-react";
import { projectDetails } from "../hidden/projects/projectDetailData";
import { researchData } from "../research-components/researchData";
import { experienceData } from "../experience-components/experiences";

const PublicHome = () => {
  const navigate = useNavigate();
  const [useResearchPhoto, setUseResearchPhoto] = useState(false);
  const [activeSection, setActiveSection] = useState("projects");
  const isScrollingRef = useRef(false);

  const handleDoubleClick = () => {
    setUseResearchPhoto(!useResearchPhoto);
  };

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + 400; // Offset
      const sections = ["projects", "research", "experience"];
      let current = sections[0];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      isScrollingRef.current = true;
      setActiveSection(sectionId);
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 pb-32">
      
      <div className="max-w-5xl mx-auto px-6">
        
        {/* --- HERO SECTION (RESTORED) --- */}
        <div className="pt-32 pb-32 border-b border-zinc">
          <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] items-center">
            
            {/* Left: Text */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tighter whitespace-nowrap">
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
                    Jonathan Ouyang
                  </span>
                </h1>
              </div>

              <p className="relative text-gray text-lg leading-relaxed max-w-xl font-light pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-[1.5px] before:bg-white before:rounded-full">
                I am an Undergraduate at UCLA studying Computer Science, specializing in building practical, human centered <span className="text-indigo-400 font-medium">AI Agents</span> 
                Robotics and Computer Vision Research at <span className="text-white/90 font-medium">Stanford</span>, <span className="text-white/90 font-medium">UCLA</span>, and <span className="text-white/90 font-medium">SJSU</span>. 
                Previously Interned at <span className="text-white/90 font-medium">Amazon</span> & <span className="text-white/90 font-medium">Google</span>.
              </p>
              
              <div className="flex items-center gap-6 pl-6">
                  <a href="https://github.com/jonouyang" target="_blank" rel="noreferrer" className="text-gray hover:text-white transition-colors"><Github size={24} /></a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray hover:text-white transition-colors"><Twitter size={24} /></a>
                  <a href="mailto:jonathanouyang@ucla.edu" className="text-gray hover:text-white transition-colors"><Mail size={24} /></a>
              </div>
            </div>

            {/* Right: Image */}
            <div className="mx-auto md:order-last order-first relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full"></div>
              <div
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border border-zinc shadow-2xl transition-transform duration-700 ease-out hover:scale-105 cursor-pointer"
                onDoubleClick={handleDoubleClick}
              >
                <img
                  src={useResearchPhoto ? "/researchheadshot.JPG" : "https://static0.cbrimages.com/wordpress/wp-content/uploads/2024/09/frieren-the-elf-stands-with-a-row-of-people-around-her.jpg?q=49&fit=crop&w=825&dpr=2"}
                  alt="Jonathan Ouyang"
                  className={`w-full h-full object-cover ${useResearchPhoto ? 'scale-[3.5] translate-x-[-5px] translate-y-[-20px]' : ''}`}
                />
              </div>
            </div>

          </div>
        </div>

        {/* --- MAIN BODY (SIDEBAR + CONTENT) --- */}
        <div className="grid lg:grid-cols-[200px_1fr] gap-12 pt-20">
          
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block h-fit sticky top-24">
            <h3 className="text-xs font-bold text-gray uppercase tracking-widest mb-6 pl-4">
              Contents
            </h3>
            <div className="flex flex-col space-y-1 relative border-l border-zinc">
               {["projects", "research", "experience"].map((section) => (
                 <button
                   key={section}
                   onClick={() => scrollToSection(section)}
                   className={`pl-4 py-2 text-sm text-left transition-colors border-l-2 -ml-[2px] capitalize ${
                     activeSection === section
                       ? "border-indigo-400 text-indigo-400 font-medium"
                       : "border-transparent text-gray hover:text-gray-100"
                   }`}
                 >
                   {section}
                 </button>
               ))}
            </div>
          </aside>

          {/* Scrollable Content (Glass Rows) */}
          <div className="space-y-32">

            {/* PROJECTS */}
            <section id="projects" className="scroll-mt-24">
              <h2 className="text-sm font-bold text-gray uppercase tracking-widest mb-8">
                Selected Work
              </h2>
              <div className="grid gap-4">
                {Object.entries(projectDetails).map(([id, project]) => (
                  <div 
                    key={id}
                    onClick={() => navigate(`/projects/${id}`)}
                    className="group relative bg-white/5 border border-white/5 rounded-xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer"
                  >
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {project.title}
                        </h3>
                        <span className="font-mono text-xs text-gray pt-1">
                          {project.date?.split(' ')[1] || '2024'}
                        </span>
                     </div>
                     <p className="text-gray text-sm leading-relaxed max-w-2xl">
                       {project.subtitle}
                     </p>
                     <div className="flex flex-wrap gap-2 mt-4">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/10">
                          {project.links?.github ? 'Open Source' : 'Product'}
                        </span>
                     </div>
                  </div>
                ))}
              </div>
            </section>

            {/* RESEARCH */}
            <section id="research" className="scroll-mt-24">
              <h2 className="text-sm font-bold text-gray uppercase tracking-widest mb-8">
                Research
              </h2>
              <div className="grid gap-4">
                {researchData.map((paper, idx) => (
                   <div 
                     key={idx}
                     className="group relative bg-white/5 border border-white/5 rounded-xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/10"
                   >
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                           {paper.title}
                         </h3>
                         <span className="font-mono text-xs text-gray pt-1 shrink-0 ml-4">
                           {paper.year}
                         </span>
                      </div>
                      <div className="text-sm text-gray mt-2">
                         {paper.authors.split(',').map((author, i) => (
                          <span key={i} className={author.includes("Jonathan") || author.includes("Ouyang") ? "text-gray-100 font-medium" : ""}>
                            {author}{i < paper.authors.split(',').length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                         <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
                            {paper.conference || "Preprint"}
                         </span>
                         {paper.pdf && (
                           <a href={paper.pdf} className="flex items-center gap-1 text-xs text-gray hover:text-white transition-colors">
                             PDF <ArrowUpRight size={12} />
                           </a>
                         )}
                      </div>
                   </div>
                ))}
              </div>
            </section>

            {/* EXPERIENCE */}
            <section id="experience" className="scroll-mt-24">
              <h2 className="text-sm font-bold text-gray uppercase tracking-widest mb-8">
                Experience
              </h2>
              <div className="grid gap-4">
                {experienceData.experiences.map((exp) => (
                   <div 
                     key={exp.id}
                     className="group relative bg-white/5 border border-white/5 rounded-xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/10"
                   >
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-lg font-bold text-white">
                           {exp.title} <span className="text-gray font-normal">@</span> <span className="text-indigo-400">{exp.company}</span>
                         </h3>
                         <span className="font-mono text-xs text-gray pt-1 shrink-0 ml-4">
                           {exp.date}
                         </span>
                      </div>
                      <p className="text-gray text-sm mt-2 leading-relaxed">
                        {exp.description}
                      </p>
                   </div>
                ))}
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicHome;
