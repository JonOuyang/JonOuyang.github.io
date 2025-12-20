import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Github,
  Twitter,
  Mail,
  ArrowUpRight,
  BookOpen,
  Linkedin,
  Youtube,
  Phone,
} from "lucide-react";
import { projectDetails } from "../hidden/projects/projectDetailData";
import { researchData } from "../research-components/researchData";
import { experienceData } from "../experience-components/experiences";
import researchHeadshot from "../assets/images/researchheadshot.jpg";

const PublicHome = () => {
  const navigate = useNavigate();
  const [useResearchPhoto, setUseResearchPhoto] = useState(false);
  const [activeSection, setActiveSection] = useState("projects");
  const isScrollingRef = useRef(false);
  const contactRef = useRef(null);
  const [contactMouse, setContactMouse] = useState({ x: 0, y: 0 });
  const [contactHover, setContactHover] = useState(false);

  const handleDoubleClick = () => {
    setUseResearchPhoto(!useResearchPhoto);
  };

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + 400; // Offset
      const sections = ["projects", "research", "experience", "contact"];
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
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 pb-32">
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-32 w-[48rem] h-[48rem] opacity-20 blur-[120px] bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.35),transparent_50%)]" />
      </div>
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-soft-light -z-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
        }}
      />
      
        <div className="relative z-10 max-w-5xl mx-auto px-6">
        
        {/* --- HERO SECTION (RESTORED) --- */}
        <div className="pt-32 pb-32">
          <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] items-center">
            
            {/* Left: Text */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-6xl md:text-7xl lg:text-6xl font-bold leading-[0.9] tracking-tighter whitespace-nowrap">
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-400 drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                    Jonathan Ouyang
                  </span>
                </h1>
              </div>

                <p className="relative text-zinc-400 text-lg leading-relaxed max-w-xl font-light pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-[1.5px] before:bg-white before:rounded-full">
                  I am an undergraduate at UCLA studying Computer Science, specializing in building practical, human-centered <span className="text-indigo-400 font-medium">AI Agents</span>.{" "}
                  Robotics and Computer Vision research at <span className="text-white/90 font-medium">Stanford</span>, <span className="text-white/90 font-medium">UCLA</span>, and <span className="text-white/90 font-medium">SJSU</span>.{" "}
                  Previously interned at <span className="text-white/90 font-medium">Amazon</span> & <span className="text-white/90 font-medium">Google</span>.
                </p>
                
                <div className="flex items-center gap-6 pl-6">
                    <a href="https://github.com/jonouyang" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors"><Github size={24} /></a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors"><Twitter size={24} /></a>
                    <a href="mailto:jonathanouyang@ucla.edu" className="text-zinc-400 hover:text-white transition-colors"><Mail size={24} /></a>
                </div>
              </div>

              {/* Right: Image */}
              <div className="mx-auto md:order-last order-first relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full"></div>
                <div
                  className="relative w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden border border-zinc shadow-2xl transition-transform duration-700 ease-out hover:scale-105 cursor-pointer"
                  onDoubleClick={handleDoubleClick}
                >
                  <img
                    src={useResearchPhoto ? researchHeadshot : "https://static0.cbrimages.com/wordpress/wp-content/uploads/2024/09/frieren-the-elf-stands-with-a-row-of-people-around-her.jpg?q=49&fit=crop&w=825&dpr=2"}
                    alt="Jonathan Ouyang"
                    className={`w-full h-full object-cover ${useResearchPhoto ? 'scale-[3.5] translate-x-[-5px] translate-y-[-20px]' : ''}`}
                  />
                </div>
              </div>

            </div>
          </div>
        {/* --- MAIN BODY (SIDEBAR + CONTENT) --- */}
        <div className="grid lg:grid-cols-[200px_1fr] gap-6 pt-20">
          
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block h-fit sticky top-24 self-start">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 pl-4">
              Contents
            </h3>
            <div className="flex flex-col space-y-1 relative border-l border-white/10">
               {["projects", "research", "experience", "contact"].map((section) => (
                 <button
                   key={section}
                   onClick={() => scrollToSection(section)}
                   className={`relative pl-4 py-2 text-sm text-left transition-colors duration-200 border-l-2 -ml-[2px] capitalize ${
                     activeSection === section
                       ? "border-indigo-400 text-white font-medium"
                       : "border-transparent text-zinc-400 hover:text-white/80"
                   }`}
                 >
                   {section}
                 </button>
               ))}
            </div>
          </aside>

          {/* Scrollable Content (Glass Rows) */}
          <div className="space-y-20">

            {/* PROJECTS */}
            <section id="projects" className="scroll-mt-24">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Selected Work</h2>
              <div className="space-y-8">
                {Object.entries(projectDetails).map(([id, project]) => {
                  const codeLink = project.links?.github && { type: "code", href: project.links.github };
                  const paperHref = project.links?.paper || project.links?.article;
                  const paperLink = paperHref && { type: "paper", href: paperHref };
                  const fallbackMore =
                    project.links?.devpost ||
                    project.links?.website ||
                    project.links?.youtube ||
                    (project.links?.article && project.links?.article !== paperHref ? project.links.article : null);
                  const moreLink = fallbackMore && { type: "more", href: fallbackMore };
                  const links = [codeLink, paperLink, moreLink].filter(Boolean);

                  return (
                    <div
                      key={id}
                      onClick={() => navigate(`/projects/${id}`)}
                      className="group flex flex-col md:flex-row gap-6 items-start py-8 cursor-pointer"
                    >
                        <div className="w-full md:w-72 aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition duration-500">
                        {project.heroImage ? (
                          <img
                            src={project.heroImage}
                            alt={project.title}
                            className="h-full w-full object-cover transition duration-500 ease-out brightness-90 group-hover:brightness-110 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="text-xs font-mono text-zinc-500">
                          {project.date || "2024"}
                        </div>
                        <h3 className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]">
                          {project.title}
                        </h3>
                        <p className="text-zinc-400 leading-relaxed">
                          {project.subtitle}
                        </p>
                        {links.length > 0 && (
                          <div className="flex flex-wrap gap-3 text-sm">
                            {links.map((link) => {
                              const icon =
                                link.type === "code"
                                  ? <Github size={18} />
                                  : link.type === "paper"
                                  ? <BookOpen size={18} />
                                  : <ArrowUpRight size={18} />;
                              return (
                                <a
                                  key={link.href}
                                  href={link.href}
                                  className="inline-flex items-center text-blue-400 hover:underline hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label={link.type}
                                >
                                  {icon}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center pt-1.5">
                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                >
                  View all <ArrowUpRight size={16} />
                </button>
              </div>
            </section>

            {/* RESEARCH */}
            <section
              id="research"
              className="scroll-mt-24 relative pt-16 before:content-[''] before:absolute before:-top-10 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-indigo-400/30 before:to-transparent before:opacity-80"
            >
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Research</h2>
              <div className="space-y-8">
                {researchData.map((paper, idx) => {
                  const codeLink = paper.code && { type: "code", href: paper.code };
                  const paperLink = paper.pdf && { type: "paper", href: paper.pdf };
                  const moreLink = paper.website && { type: "more", href: paper.website };
                  const links = [codeLink, paperLink, moreLink].filter(Boolean);

                  return (
                    <div
                      key={idx}
                      className="group flex flex-col md:flex-row gap-6 items-start py-8"
                    >
                        <div className="w-full md:w-72 aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition duration-500">
                        {paper.image ? (
                          <img
                            src={paper.image}
                            alt={paper.title}
                            className="h-full w-full object-cover transition duration-500 ease-out brightness-90 group-hover:brightness-110 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="text-xs font-mono text-zinc-500">{paper.year}</div>
                        <h3 className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]">
                          {paper.title}
                        </h3>
                        <div className="text-zinc-400 leading-relaxed text-sm">
                          {paper.authors.split(',').map((author, i) => {
                            const cleanAuthor = author.replace(/\*/g, "").trim();
                            const highlight = cleanAuthor.includes("Jonathan") || cleanAuthor.includes("Ouyang");
                            return (
                              <span
                                key={i}
                                className={highlight ? "text-white font-medium" : ""}
                              >
                                {cleanAuthor}{i < paper.authors.split(',').length - 1 ? ", " : ""}
                              </span>
                            );
                          })}
                        </div>
                        <div className="text-sm italic text-zinc-400">{paper.conference || "Preprint"}</div>
                        {links.length > 0 && (
                          <div className="flex flex-wrap gap-3 text-sm">
                            {links.map((link) => {
                              const icon =
                                link.type === "code"
                                  ? <Github size={18} />
                                  : link.type === "paper"
                                  ? <BookOpen size={18} />
                                  : <ArrowUpRight size={18} />;
                              return (
                                <a
                                  key={link.href}
                                  href={link.href}
                                  className="inline-flex items-center text-blue-400 hover:underline hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                                  aria-label={link.type}
                                >
                                  {icon}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center pt-1.5">
                <button
                  type="button"
                  onClick={() => navigate("/research")}
                  className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                >
                  View all <ArrowUpRight size={16} />
                </button>
              </div>
            </section>

            {/* EXPERIENCE */}
            <section
              id="experience"
              className="scroll-mt-24 relative pt-16 before:content-[''] before:absolute before:-top-10 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-indigo-400/30 before:to-transparent before:opacity-80"
            >
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Experience</h2>
              <div className="space-y-8">
                {experienceData.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="group flex flex-col md:flex-row gap-6 items-start py-8"
                  >
                      <div className="w-full md:w-72 aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition duration-500">
                      {exp.image ? (
                        <img
                          src={exp.image}
                          alt={exp.company}
                          className="h-full w-full object-cover transition duration-500 ease-out brightness-90 group-hover:brightness-110 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center text-lg font-semibold text-white/80">
                          {exp.company}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="text-xs font-mono text-zinc-500">{exp.date}</div>
                      <h3 className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]">
                        {exp.title} <span className="text-zinc-400 font-normal">@</span> <span className="text-indigo-400">{exp.company}</span>
                      </h3>
                      <p className="text-zinc-400 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-1.5">
                <button
                  type="button"
                  onClick={() => navigate("/experience")}
                  className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                >
                  View all <ArrowUpRight size={16} />
                </button>
              </div>
            </section>

            {/* CONTACT */}
            <section
              id="contact"
              className="scroll-mt-24 relative pt-16 before:content-[''] before:absolute before:-top-10 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-indigo-400/30 before:to-transparent before:opacity-80"
            >
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Contact</h2>
              <div
                ref={contactRef}
                onMouseMove={(e) => {
                  if (!contactRef.current) return;
                  const rect = contactRef.current.getBoundingClientRect();
                  setContactMouse({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
                onMouseEnter={() => setContactHover(true)}
                onMouseLeave={() => {
                  setContactHover(false);
                  setContactMouse({ x: 0, y: 0 });
                }}
                className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-900/70 to-zinc-950/70 p-10 shadow-[0_25px_80px_rgba(0,0,0,0.35)] space-y-6 min-h-[320px]"
                style={{
                  '--mouse-x': `${contactMouse.x}px`,
                  '--mouse-y': `${contactMouse.y}px`,
                }}
              >
                <div
                  className={`pointer-events-none absolute -inset-[8px] rounded-2xl blur-2xl transition-opacity duration-200 ${contactHover ? 'opacity-30' : 'opacity-0'}`}
                  style={{
                    background:
                      'radial-gradient(360px circle at var(--mouse-x) var(--mouse-y), rgba(59,130,246,0.18), transparent 55%)',
                  }}
                />
                <div
                  className={`pointer-events-none absolute -inset-[3px] rounded-2xl blur-xl transition-opacity duration-200 ${contactHover ? 'opacity-30' : 'opacity-0'}`}
                  style={{
                    background:
                      'radial-gradient(260px circle at var(--mouse-x) var(--mouse-y), rgba(59,130,246,0.24), transparent 50%)',
                  }}
                />
                <p className="text-zinc-400 leading-relaxed">
                  I love meeting people building practical AI, robotics, and products with polish. Drop me a line and I’ll get back soon.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <a
                    href="mailto:jonathanouyang@ucla.edu"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-blue-400 transition hover:border-indigo-400/70 hover:bg-indigo-500/10 hover:drop-shadow-[0_12px_30px_rgba(59,130,246,0.25)]"
                  >
                    <Mail size={18} />
                    <div className="flex flex-col text-left">
                      <span className="text-sm text-white">Email</span>
                      <span className="text-xs text-zinc-400">jonathanouyang@ucla.edu</span>
                    </div>
                  </a>
                  <a
                    href="https://www.linkedin.com"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-blue-400 transition hover:border-indigo-400/70 hover:bg-indigo-500/10 hover:drop-shadow-[0_12px_30px_rgba(59,130,246,0.25)]"
                  >
                    <Linkedin size={18} />
                    <div className="flex flex-col text-left">
                      <span className="text-sm text-white">LinkedIn</span>
                      <span className="text-xs text-zinc-400">Profile link</span>
                    </div>
                  </a>
                  <a
                    href="https://twitter.com"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-blue-400 transition hover:border-indigo-400/70 hover:bg-indigo-500/10 hover:drop-shadow-[0_12px_30px_rgba(59,130,246,0.25)]"
                  >
                    <Twitter size={18} />
                    <div className="flex flex-col text-left">
                      <span className="text-sm text-white">Twitter / X</span>
                      <span className="text-xs text-zinc-400">@handle</span>
                    </div>
                  </a>
                  <a
                    href="https://www.youtube.com"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-blue-400 transition hover:border-indigo-400/70 hover:bg-indigo-500/10 hover:drop-shadow-[0_12px_30px_rgba(59,130,246,0.25)]"
                  >
                    <Youtube size={18} />
                    <div className="flex flex-col text-left">
                      <span className="text-sm text-white">YouTube</span>
                      <span className="text-xs text-zinc-400">Channel</span>
                    </div>
                  </a>
                  <a
                    href="https://github.com/jonouyang"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-blue-400 transition hover:border-indigo-400/70 hover:bg-indigo-500/10 hover:drop-shadow-[0_12px_30px_rgba(59,130,246,0.25)]"
                  >
                    <Github size={18} />
                    <div className="flex flex-col text-left">
                      <span className="text-sm text-white">GitHub</span>
                      <span className="text-xs text-zinc-400">jonouyang</span>
                    </div>
                  </a>
                  <a
                    href="tel:+1-000-000-0000"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-blue-400 transition hover:border-indigo-400/70 hover:bg-indigo-500/10 hover:drop-shadow-[0_12px_30px_rgba(59,130,246,0.25)]"
                  >
                    <Phone size={18} />
                    <div className="flex flex-col text-left">
                      <span className="text-sm text-white">Phone</span>
                      <span className="text-xs text-zinc-400">+1 (000) 000-0000</span>
                    </div>
                  </a>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicHome;
