// src/pages/ResearchPage.jsx

import React, { useEffect, useMemo, useState } from 'react';

// A helper function to parse authors and highlight your name
const Author = ({ authors }) => {
  const parts = authors.split('**');
  return (
    <p className="text-[#A1A1AA] text-sm leading-relaxed">
      {parts.map((part, index) =>
        index % 2 === 1 ? <strong key={index} className="text-[#818CF8] font-bold">{part}</strong> : part
      )}
    </p>
  );
};

// A single publication item - UPDATED FOR UNIFORM IMAGES
const PublicationItem = ({ paper, index }) => {
  const pdfHref = paper.pdf && paper.pdf !== "#" ? paper.pdf : null;
  const isTopTwo = index < 2;

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-10">
    {/* Left side: Image */}
    {/* CHANGE 1: Added a fixed height 'h-28' to the container div */}
    <div className="flex-shrink-0 md:w-52 h-28">
      <img
        src={paper.image}
        alt={`Thumbnail for ${paper.title}`}
        // CHANGE 2: Changed 'h-auto' to 'h-full' to make the image fill the container
        className="w-full h-full object-cover rounded-lg border border-[#27272A]"
      />
    </div>

    {/* Right side: Details */}
    <div className="flex-grow">
      <h3 className="text-lg font-semibold text-white mb-1">{paper.title}</h3>
      <Author authors={paper.authors} />
      <p className="text-[#71717A] italic text-sm mt-1">{paper.conference}</p>
      <div className="flex items-center gap-3 mt-3">
        {pdfHref ? (
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-xs sm:text-sm bg-transparent border border-[#3F3F46] text-[#E4E4E7] rounded-full hover:border-[#818CF8] hover:text-[#818CF8] transition-colors"
          >
            PDF
          </a>
        ) : (
          <span className="inline-flex items-center px-3 py-1 text-xs sm:text-sm bg-transparent border border-[#3F3F46] text-[#71717A] rounded-full cursor-not-allowed">
            PDF
          </span>
        )}
        {paper.code && (
          isTopTwo ? (
            <span className="inline-flex items-center px-3 py-1 text-xs sm:text-sm bg-transparent border border-[#3F3F46] text-[#71717A] rounded-full cursor-not-allowed">
              Code
            </span>
          ) : (
            <a
              href={paper.code}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-xs sm:text-sm bg-transparent border border-[#3F3F46] text-[#E4E4E7] rounded-full hover:border-[#818CF8] hover:text-[#818CF8] transition-colors"
            >
              Code
            </a>
          )
        )}
        {paper.website && (
          <a
            href={paper.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-xs sm:text-sm bg-transparent border border-[#3F3F46] text-[#E4E4E7] rounded-full hover:border-[#818CF8] hover:text-[#818CF8] transition-colors"
          >
            Website
          </a>
        )}
      </div>
    </div>
    </div>
  );
};

// The main Research Page component
const ResearchPage = () => {
  const [papers, setPapers] = useState([]);
  const headshotUrl = "/assets/images/mainheadshot.png";

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("/data/researchData.json");
        if (!resp.ok) throw new Error("research fetch failed");
        const json = await resp.json();
        setPapers(json.research || []);
      } catch (err) {
        console.error("Failed to load research data", err);
        setPapers([]);
      }
    };
    load();
  }, []);

  const papersByYear = useMemo(() => {
    return papers.reduce((acc, paper) => {
      const year = paper.year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(paper);
      return acc;
    }, {});
  }, [papers]);

  const sortedYears = Object.keys(papersByYear).sort((a, b) => b - a);

  return (
    <div className="bg-black text-[#A1A1AA] min-h-screen font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col lg:flex-row py-12">
          <div className="hidden lg:block absolute top-12 bottom-12 left-[30%] w-px bg-[#27272A]" />
          <aside className="lg:w-[30%] lg:sticky lg:top-12 self-start lg:pr-12">
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 shadow-md border border-[#27272A]">
                <img
                  src={headshotUrl}
                  alt="Jonathan Ouyang"
                  className="w-full h-full object-cover scale-[1.5] translate-x-[-5px] translate-y-[0px]"
                />
              </div>
              <h1 className="text-2xl font-bold text-white">Jonathan Ouyang</h1>
              <h2 className="text-md text-zinc-400 mb-4">Undergraduate Researcher, UCLA</h2>
              <p className="text-sm text-zinc-400 text-center lg:text-left mb-6">
                I build robots that see, listen, and move with intent.
                At UCLA, I research the intersection of computer vision, language, and human-robot interaction—teaching machines to understand us and act accordingly.
                I care about making intelligence intuitive: gaze-guided control, vision-language agents, real-world deployment.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                <a href="#" className="text-white hover:text-[#818CF8] transition-colors">Google Scholar</a>
                <a href="https://github.com/JonOuyang" className="text-white hover:text-[#818CF8] transition-colors">GitHub</a>
                <a href="#" className="text-white hover:text-[#818CF8] transition-colors">Twitter</a>
                <a href="#" className="text-white hover:text-[#818CF8] transition-colors">Email</a>
              </div>
            </div>
          </aside>
          <main className="lg:w-[70%] lg:pl-12">
            <h1 className="text-4xl font-bold text-white mb-10 pt-10 lg:pt-0">Publications</h1>
            <p className="text-[#A1A1AA] mb-12">
              For a complete list, please see my <a href="#" className="text-[#818CF8] hover:underline">Google Scholar</a> profile.
              Selected publications are listed below.
            </p>
            <div className="space-y-12">
              {sortedYears.map(year => (
                <section key={year} className="relative">
                  <h2 className="absolute -top-4 right-0 text-7xl font-bold text-[#27272A] -z-10 select-none">
                    {year}
                  </h2>
                  {papersByYear[year].map((paper, index) => (
                    <PublicationItem key={paper.title} paper={paper} index={index} />
                  ))}
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;
