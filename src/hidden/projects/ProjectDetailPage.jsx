import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Github,
  Youtube,
  Share2,
  Code2,
  Award,
  ArrowLeft,
  PlayCircle
} from 'lucide-react';
import { getProjectDetail } from './projectDetailData';
import { renderInlineMarkdown } from '../../utils/inlineMarkdown';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = getProjectDetail(parseInt(projectId));
  const [activeSection, setActiveSection] = useState("");
  const isScrollingRef = useRef(false);

  // Scroll Spy Logic
  useEffect(() => {
    if (!project?.sections?.length) return;
    setActiveSection(project.sections[0].id);

    let observer = null;
    const rafId = requestAnimationFrame(() => {
      const sectionEls = project.sections
        .map((section) => document.getElementById(section.id))
        .filter(Boolean);

      if (!sectionEls.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          if (isScrollingRef.current) return;
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (!visible.length) return;
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topEntry = visible[0];
          if (topEntry?.target?.id) {
            setActiveSection(topEntry.target.id);
          }
        },
        {
          rootMargin: "-20% 0px -70% 0px",
          threshold: [0, 0.1, 0.25, 0.5]
        }
      );

      sectionEls.forEach((el) => observer.observe(el));
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
    };
  }, [project?.sections]);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Disable scroll spy temporarily
      isScrollingRef.current = true;
      setActiveSection(sectionId);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Re-enable scroll spy after animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  if (!project) return <div className="bg-[#0a0a0a] min-h-screen" />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e3e3e3] font-sans selection:bg-blue-500/30">

      <main className="max-w-[1100px] mx-auto px-8 pt-12 pb-32">

        {/* 2. TITLE (Large, Tight Tracking, Thin Weight) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-thin text-white mb-12 leading-[1.0] tracking-tight">
          {project.title}
        </h1>

        {/* 3. THE "GEMINI GRID" (Date | Description) */}
        <div className="mb-16 flex flex-col md:flex-row md:items-start gap-4 md:gap-6">

          {/* Left Column: Date & Read Time */}
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-sm font-medium text-white/60">{project.date}</span>
            <span className="text-sm text-white/40">{project.readTime}</span>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px h-auto self-stretch bg-blue-500/30"></div>

          {/* Right Column: The Lead Paragraph */}
          <div>
            <p className="text-base sm:text-lg md:text-xl text-[#c0c0c0] font-light leading-relaxed antialiased">
              {project.subtitle}
            </p>
          </div>
        </div>

        {/* 4. AUTHORS */}
        <div className="flex flex-wrap items-center gap-10 mb-8">
          {project.authors?.map((author, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full border border-white/10" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-blue-400">{author.name}</span>
                <span className="text-xs text-white/50">{author.role}</span>
              </div>
            </div>
          ))}
          <button className="p-2.5 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5 ml-auto">
            <Share2 size={20} />
          </button>
        </div>

        {/* 5. ACTION PILLS */}
        <div className="flex items-center gap-3 mb-12">
          {project.links?.article && (
            <a href={project.links.article} target="_blank" rel="noreferrer"
               className="group flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm font-medium hover:bg-blue-500/20 transition-colors">
              <ArrowLeft size={16} className="group-hover:scale-110 transition-transform rotate-[135deg]" />
              <span>Read More</span>
            </a>
          )}
          {project.links?.youtube && (
            <a href={project.links.youtube} target="_blank" rel="noreferrer"
               className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/70 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 hover:text-white transition-colors">
              <PlayCircle size={16} className="group-hover:scale-110 transition-transform" />
              <span>Watch Demo</span>
            </a>
          )}
          {project.links?.github && (
            <a href={project.links.github} target="_blank" rel="noreferrer"
               className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/70 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 hover:text-white transition-colors">
              <Github size={16} className="group-hover:scale-110 transition-transform" />
              <span>Code</span>
            </a>
          )}
        </div>

        {/* 6. HERO ASSET (Cropped to rectangular portrait) */}
        <div className="w-full mb-20 overflow-hidden rounded-md border border-white/5 shadow-2xl shadow-black/50">
          <img src={project.heroImage} alt="Hero" className="w-full h-[400px] object-cover object-center" />
        </div>

        {/* 6. CONTENT LAYOUT (Sticky Sidebar + Article) */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-16 relative">

          {/* Sidebar */}
          <aside className="hidden lg:block h-fit sticky top-24">
            <h3 className="text-sm font-bold text-white mb-6 pl-5 border-l-2 border-transparent">In this story</h3>
            <div className="flex flex-col space-y-0 relative border-l border-white/10">
              {project.sections?.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`pl-5 py-2 text-sm transition-all duration-200 border-l-2 -ml-[2px] block text-left ${
                    activeSection === section.id
                    ? 'border-blue-500 text-blue-400 font-medium'
                    : 'border-transparent text-white/50 hover:text-white hover:border-white/30'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
            
            {/* Resources (Devpost, etc) */}
            <div className="mt-12 pt-8">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 pl-5">Resources</h4>
               <ul className="space-y-4 pl-5 border-l border-transparent">
                   {project.links?.github && (
                    <li><a href={project.links.github} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"><Github size={14}/> Repository</a></li>
                  )}
               </ul>
            </div>
          </aside>

          {/* Article Content */}
          <article className="prose prose-invert prose-lg max-w-none prose-headings:font-medium prose-headings:tracking-tight prose-p:text-[#b0b0b0] prose-p:leading-8 prose-p:font-light">
            {project.sections?.map((section) => (
              <section key={section.id} id={section.id} className="mb-24 scroll-mt-24">
                <h2 className="text-4xl text-white mb-8">{section.title}</h2>
                
                {/* Paragraphs */}
                {project.content?.[section.id]?.paragraphs?.map((para, i) => (
                  <p key={i} className="mb-6">
                    {renderInlineMarkdown(para, (text, index) => (
                      <span key={`b-${i}-${index}`} className="text-blue-400 font-semibold">
                        {text}
                      </span>
                    ))}
                  </p>
                ))}

                {/* Figures */}
                {project.content?.[section.id]?.figures?.map((figure, i) => (
                  <div key={i} className="my-12">
                    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111]">
                       {figure.type === 'placeholder' ? (
                        <div className="w-full h-64 flex items-center justify-center text-white/20">{figure.placeholder}</div>
                      ) : (
                        <img src={figure.src} alt="" className="w-full m-0" />
                      )}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </article>
        </div>

        {/* Footer Nav */}
        <div className="border-t border-white/10 mt-20 pt-10">
          <button onClick={() => navigate('/projects')} className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to all projects
          </button>
        </div>

      </main>
    </div>
  );
};

export default ProjectDetailPage;
