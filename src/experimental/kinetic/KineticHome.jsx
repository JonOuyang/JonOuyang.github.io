import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const INK = "#D7DCE2"; // silver
const BG = "#000000"; // vanta black
const HOT = "#45C8FF"; // brilliant light blue
const ANTON = '"Anton", "Arial Narrow", sans-serif';
const GS = '"Google Sans", sans-serif';

const ROLES = ["ENGINEER", "MOTION", "RESEARCH", "BUILDER"];

const INTRO_BEATS = [
  { text: "HELLO.", bg: BG, color: INK },
  { text: "I MAKE", bg: HOT, color: BG },
  { text: "THINGS", bg: BG, color: HOT },
  { text: "MOVE.", bg: INK, color: BG },
];

const SLABS = [
  { n: "01", word: "WORK", sub: "where i've been", path: "/work-history" },
  { n: "02", word: "PROJECTS", sub: "what i've built", path: "/projects" },
  { n: "03", word: "RESEARCH", sub: "what i've studied", path: "/research" },
  { n: "04", word: "LABS", sub: "experiments & toys", path: "/labs" },
];

const TICKER = "JONATHAN OUYANG ✦ PORTFOLIO 2026 ✦ ENGINEER ✦ MOTION ✦ RESEARCH ✦ ";

// Split a word into per-char spans inside an overflow-hidden line so the
// chars can slam up from below the baseline.
const SlamWord = ({ text, className }) => (
  <span className={`kh-line ${className || ""}`} aria-label={text}>
    {text.split("").map((ch, i) => (
      <span className="kh-ch" key={i} aria-hidden="true">
        {ch === " " ? " " : ch}
      </span>
    ))}
  </span>
);

const KineticHome = () => {
  const rootRef = useRef(null);
  const introRef = useRef(null);
  const introWordRef = useRef(null);
  const roleRef = useRef(null);
  const flashRef = useRef(null);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const heroChars = rootRef.current.querySelectorAll(".kh-hero .kh-ch");
      const bar = rootRef.current.querySelector(".kh-bar");
      const meta = rootRef.current.querySelectorAll(".kh-meta");

      if (reduced) {
        gsap.set(introRef.current, { display: "none" });
        gsap.set([heroChars, bar, meta], { clearProps: "all" });
        return;
      }

      const master = gsap.timeline();

      // --- intro: four hard cuts, no tweens between beats ---
      INTRO_BEATS.forEach((b, i) => {
        master.set(introRef.current, { backgroundColor: b.bg }, i * 0.3);
        master.set(introWordRef.current, { textContent: b.text, color: b.color }, i * 0.3);
      });

      // --- wipe the intro up off-screen ---
      master.to(
        introRef.current,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.55,
          ease: "power4.inOut",
        },
        INTRO_BEATS.length * 0.3 + 0.15
      );
      master.set(introRef.current, { display: "none" });

      // --- hero name slams in under the wipe ---
      const heroStart = INTRO_BEATS.length * 0.3 + 0.3;
      master.fromTo(
        heroChars,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.75, ease: "power4.out", stagger: 0.032 },
        heroStart
      );
      master.fromTo(
        bar,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, ease: "power4.inOut" },
        heroStart + 0.35
      );
      master.fromTo(
        flashRef.current,
        { opacity: 0.85 },
        { opacity: 0, duration: 0.5, ease: "power2.out" },
        heroStart + 0.25
      );
      master.fromTo(
        meta,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.08 },
        heroStart + 0.5
      );

      // --- rotating role word: slam up, hold, cut out ---
      const roleTl = gsap.timeline({ repeat: -1, delay: heroStart + 0.9 });
      ROLES.forEach((word) => {
        roleTl
          .call(() => {
            roleRef.current.textContent = word;
          })
          .fromTo(
            roleRef.current,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.34, ease: "power4.out" }
          )
          .to(roleRef.current, {
            yPercent: -120,
            duration: 0.26,
            ease: "power4.in",
            delay: 1.05,
          });
      });

      // --- delorean interlude: image parallax + caption slam ---
      const dmc = rootRef.current.querySelector(".kh-dmc");
      if (dmc) {
        gsap.fromTo(
          dmc.querySelector(".kh-dmc-img"),
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: "none",
            scrollTrigger: { trigger: dmc, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
        gsap.fromTo(
          dmc.querySelectorAll(".kh-dmc-title .kh-ch"),
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.7,
            ease: "power4.out",
            stagger: 0.045,
            scrollTrigger: { trigger: dmc, start: "top 62%", toggleActions: "play none none reverse" },
          }
        );
        gsap.fromTo(
          dmc.querySelectorAll(".kh-dmc-meta"),
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: dmc, start: "top 55%", toggleActions: "play none none reverse" },
          }
        );
      }

      // --- scroll slabs: chars slam in as each section enters ---
      rootRef.current.querySelectorAll(".kh-slab").forEach((slab) => {
        const chars = slab.querySelectorAll(".kh-ch");
        gsap.fromTo(
          chars,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.65,
            ease: "power4.out",
            stagger: 0.03,
            scrollTrigger: {
              trigger: slab,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          }
        );
        gsap.fromTo(
          slab.querySelector(".kh-slab-meta"),
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: slab,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="kh-root">
      <style>{`
        .kh-root {
          background: ${BG};
          color: ${INK};
          min-height: 100vh;
          overflow: hidden;
          cursor: default;
        }
        .kh-line { display: inline-flex; overflow: hidden; vertical-align: bottom; }
        .kh-ch { display: inline-block; will-change: transform; }

        /* intro overlay */
        .kh-intro {
          position: fixed; inset: 0; z-index: 60;
          display: flex; align-items: center; justify-content: center;
          clip-path: inset(0% 0% 0% 0%);
          background: ${BG};
        }
        .kh-intro-word {
          font-family: ${ANTON};
          font-size: clamp(3.5rem, 14vw, 12rem);
          letter-spacing: 0.01em;
          line-height: 1;
        }

        /* hero */
        .kh-hero {
          position: relative;
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: center;
          padding: 0 clamp(1.25rem, 5vw, 4.5rem);
        }
        .kh-flash { position: absolute; inset: 0; background: ${HOT}; pointer-events: none; opacity: 0; }
        .kh-name {
          font-family: ${ANTON};
          font-size: clamp(4rem, 16.5vw, 15rem);
          line-height: 0.92;
          letter-spacing: 0.005em;
          margin: 0;
        }
        .kh-name .kh-hot { color: ${HOT}; }
        .kh-bar {
          height: clamp(8px, 1.2vw, 16px);
          background: ${HOT};
          transform-origin: left center;
          margin: clamp(0.9rem, 2vw, 1.6rem) 0;
          width: min(46vw, 520px);
        }
        .kh-roleline {
          display: flex; align-items: baseline; gap: 0.75rem;
          font-family: ${GS};
        }
        .kh-role-label { font-size: clamp(0.7rem, 1.1vw, 0.85rem); font-weight: 600; letter-spacing: 0.28em; color: #8a95a3; }
        .kh-role-mask { overflow: hidden; display: inline-block; }
        .kh-role {
          display: inline-block;
          font-family: ${ANTON};
          font-size: clamp(1.6rem, 3.6vw, 3.2rem);
          line-height: 1.05;
          color: ${INK};
        }
        .kh-meta {
          position: absolute;
          font-family: ${GS};
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.24em; color: #8a95a3;
        }
        .kh-meta.tl { top: clamp(4.5rem, 9vh, 6rem); left: clamp(1.25rem, 5vw, 4.5rem); }
        .kh-meta.tr { top: clamp(4.5rem, 9vh, 6rem); right: clamp(1.25rem, 5vw, 4.5rem); text-align: right; }
        .kh-meta.bl { bottom: clamp(5.5rem, 10vh, 4rem); left: clamp(1.25rem, 5vw, 4.5rem); }

        /* ticker */
        .kh-ticker {
          background: ${HOT}; color: ${BG};
          transform: rotate(-1.5deg) scale(1.02);
          padding: 0.55rem 0;
          overflow: hidden; white-space: nowrap;
          font-family: ${ANTON};
          font-size: clamp(1.1rem, 2.2vw, 1.8rem);
          user-select: none;
        }
        .kh-ticker-track { display: inline-block; animation: kh-marquee 22s linear infinite; }
        @keyframes kh-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .kh-ticker-track { animation: none; } }

        /* delorean interlude */
        .kh-dmc {
          position: relative;
          height: min(92vh, 860px);
          overflow: hidden;
          display: flex; align-items: flex-end;
        }
        .kh-dmc-img {
          position: absolute; inset: -12% 0;
          width: 100%; height: 124%;
          object-fit: cover;
          filter: grayscale(1) contrast(1.1) brightness(0.78);
          will-change: transform;
        }
        .kh-dmc-tint {
          position: absolute; inset: 0;
          background: ${HOT};
          mix-blend-mode: soft-light;
          opacity: 0.45;
          pointer-events: none;
        }
        .kh-dmc-fade {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, ${BG} 0%, transparent 22%, transparent 62%, ${BG} 100%);
          pointer-events: none;
        }
        .kh-dmc-copy {
          position: relative; z-index: 1;
          padding: 0 clamp(1.25rem, 5vw, 4.5rem) clamp(2rem, 6vh, 3.5rem);
        }
        .kh-dmc-title {
          font-family: ${ANTON};
          font-size: clamp(4rem, 14vw, 13rem);
          line-height: 0.92;
          color: ${INK};
          text-shadow: 0 0 60px rgba(0, 0, 0, 0.65);
        }
        .kh-dmc-title .kh-hot { color: ${HOT}; }
        .kh-dmc-meta {
          font-family: ${GS}; font-weight: 600;
          font-size: 0.72rem; letter-spacing: 0.24em; color: #b9c2cc;
          margin-bottom: 0.6rem;
        }
        .kh-dmc-meta.after { margin: 0.9rem 0 0; color: ${HOT}; }

        /* nav slabs */
        .kh-slabs { padding: clamp(3rem, 8vh, 6rem) 0 0; }
        .kh-slab {
          display: block; text-decoration: none; color: inherit;
          position: relative;
          padding: clamp(1.6rem, 4.5vh, 3.2rem) clamp(1.25rem, 5vw, 4.5rem);
          border-top: 1px solid #1d232b;
        }
        .kh-slab:last-of-type { border-bottom: 1px solid #1d232b; }
        .kh-slab-word {
          font-family: ${ANTON};
          font-size: clamp(3.2rem, 11.5vw, 10rem);
          line-height: 0.95;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(242, 240, 234, 0.55);
          transition: color 0.22s ease, -webkit-text-stroke-color 0.22s ease;
        }
        .kh-slab:hover .kh-slab-word { color: ${INK}; -webkit-text-stroke-color: transparent; }
        .kh-slab-meta {
          display: flex; align-items: center; gap: 1rem;
          font-family: ${GS}; font-weight: 600;
          font-size: 0.72rem; letter-spacing: 0.24em; color: #8a95a3;
          margin-bottom: 0.6rem;
        }
        .kh-slab-n { color: ${HOT}; font-weight: 700; }
        .kh-slab-arrow {
          position: absolute; right: clamp(1.25rem, 5vw, 4.5rem); top: 50%;
          transform: translate(-14px, -50%);
          font-family: ${ANTON};
          font-size: clamp(1.6rem, 3.5vw, 3rem);
          color: ${HOT};
          opacity: 0; transition: opacity 0.22s ease, transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .kh-slab:hover .kh-slab-arrow { opacity: 1; transform: translate(0, -50%); }

        /* footer */
        .kh-footer {
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;
          padding: clamp(2rem, 6vh, 4rem) clamp(1.25rem, 5vw, 4.5rem) calc(clamp(2rem, 6vh, 4rem) + 84px);
          font-family: ${GS}; font-weight: 600;
          font-size: 0.72rem; letter-spacing: 0.24em; color: #8a95a3;
        }
        .kh-footer a { color: ${INK}; text-decoration: none; }
        .kh-footer a:hover { color: ${HOT}; }
      `}</style>

      {/* intro slam overlay */}
      <div className="kh-intro" ref={introRef}>
        <div className="kh-intro-word" ref={introWordRef}>
          HELLO.
        </div>
      </div>

      {/* hero */}
      <section className="kh-hero">
        <div className="kh-flash" ref={flashRef} />
        <div className="kh-meta tl">PORTFOLIO — 2026</div>
        <div className="kh-meta tr">
          LOS ANGELES, CA
          <br />
          UCLA
        </div>
        <h1 className="kh-name">
          <SlamWord text="JONATHAN" />
          <br />
          <SlamWord text="OUYANG" className="kh-hot" />
        </h1>
        <div className="kh-bar" />
        <div className="kh-roleline">
          <span className="kh-role-label">CURRENTLY /</span>
          <span className="kh-role-mask">
            <span className="kh-role" ref={roleRef}>
              ENGINEER
            </span>
          </span>
        </div>
        <div className="kh-meta bl">SCROLL ↓</div>
      </section>

      {/* ticker */}
      <div className="kh-ticker" aria-hidden="true">
        <div className="kh-ticker-track">
          {TICKER.repeat(4)}
          {TICKER.repeat(4)}
        </div>
      </div>

      {/* delorean interlude */}
      <section className="kh-dmc">
        <img className="kh-dmc-img" src="/assets/delorean/hero.jpg" alt="DeLorean with gullwing doors open" />
        <div className="kh-dmc-tint" />
        <div className="kh-dmc-fade" />
        <div className="kh-dmc-copy">
          <div className="kh-dmc-meta">INTERLUDE / TIME CIRCUITS ON</div>
          <div className="kh-dmc-title">
            <SlamWord text="88" className="kh-hot" /> <SlamWord text="MPH" />
          </div>
          <div className="kh-dmc-meta after">WHERE WE'RE GOING, WE DON'T NEED ROADS</div>
        </div>
      </section>

      {/* nav slabs */}
      <nav className="kh-slabs">
        {SLABS.map((s) => (
          <Link className="kh-slab" to={s.path} key={s.n}>
            <div className="kh-slab-meta">
              <span className="kh-slab-n">{s.n}</span>
              <span>{s.sub.toUpperCase()}</span>
            </div>
            <div className="kh-slab-word">
              <SlamWord text={s.word} />
            </div>
            <span className="kh-slab-arrow">→</span>
          </Link>
        ))}
      </nav>

      <footer className="kh-footer">
        <span>© 2026 JONATHAN OUYANG</span>
        <a href="mailto:jonsouyang@g.ucla.edu">JONSOUYANG@G.UCLA.EDU</a>
      </footer>
    </div>
  );
};

export default KineticHome;
