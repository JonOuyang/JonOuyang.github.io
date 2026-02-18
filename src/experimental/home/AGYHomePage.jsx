import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Play, Apple, ArrowRight, Search, Terminal, GitBranch, Layout, FileCode, Cpu, MousePointer2 } from 'lucide-react';

const blinkKeyframes = `@keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }`;

const GoogleAntigravityClone = () => {
  return (
    <div className="font-sans text-white bg-black selection:bg-blue-500/30">
      <style>{blinkKeyframes}</style>
      <Hero />
      <IntroGradient />
      <Toolbelt />
      <StickyFeatureSection />
      <Personas />
      <SplitCTA />
      <BlogSection />
      <StarfieldFooter />
    </div>
  );
};

/* --- 1. Header --- */
const Header = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
    <div className="flex items-center gap-2">
      <span className="text-xl tracking-tight text-gray-500">Google <span className="font-bold text-gray-900">Antigravity</span></span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
      <a href="#" className="hover:text-black transition-colors">Product</a>
      <a href="#" className="hover:text-black transition-colors">Use Cases</a>
      <a href="#" className="hover:text-black transition-colors">Pricing</a>
      <a href="#" className="hover:text-black transition-colors">Blog</a>
      <a href="#" className="hover:text-black transition-colors">Resources</a>
    </div>
    <button className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
      Download
    </button>
  </nav>
);

/* --- 2. Hero Section (Typing & Particles) --- */
const Hero = () => {
  const fullLineOne = "Experience liftoff with the";
  const fullLineTwo = "next-generation IDE";
  const [lineOne, setLineOne] = useState('');
  const [lineTwo, setLineTwo] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showCursor, setShowCursor] = useState({ one: false, two: false });
  const [cursorFading, setCursorFading] = useState(false);
  const [particles, setParticles] = useState([]);
  const heroRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const particleId = useRef(0);
  const hasTyped = useRef(false);

  useEffect(() => {
    if (hasTyped.current) return;
    hasTyped.current = true;

    let indexOne = 0;
    let indexTwo = 0;
    let lineOneInterval;
    let lineTwoInterval;

    // Show cursor first, blink a couple times, then start typing
    const initialCursor = setTimeout(() => {
      setShowCursor({ one: true, two: false });
    }, 600);

    const lineOneStart = setTimeout(() => {
      lineOneInterval = setInterval(() => {
        indexOne += 1;
        setLineOne(fullLineOne.slice(0, indexOne));
        if (indexOne >= fullLineOne.length) {
          clearInterval(lineOneInterval);
          setShowCursor({ one: false, two: true });
          lineTwoInterval = setInterval(() => {
            indexTwo += 1;
            setLineTwo(fullLineTwo.slice(0, indexTwo));
            if (indexTwo >= fullLineTwo.length) {
              clearInterval(lineTwoInterval);
              setCursorFading(true);
              setTimeout(() => {
                setShowCursor({ one: false, two: false });
                setCursorFading(false);
                setShowActions(true);
              }, 800);
            }
          }, 45);
        }
      }, 45);
    }, 1800);

    return () => {
      hasTyped.current = false;
      clearTimeout(initialCursor);
      clearTimeout(lineOneStart);
      clearInterval(lineOneInterval);
      clearInterval(lineTwoInterval);
    };
  }, []);

  // Cursor particle animation
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();

      // Check if mouse is within hero section
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom) {

        mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        // Create new particle
        const newParticle = {
          id: particleId.current++,
          x: mousePos.current.x,
          y: mousePos.current.y,
          life: 1,
        };

        setParticles(prev => [...prev.slice(-20), newParticle]); // Keep last 20 particles
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fade out particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, life: p.life - 0.05 }))
          .filter(p => p.life > 0)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-black">
      {/* Cursor particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.life * 0.6,
            transform: `scale(${particle.life})`,
            transition: 'opacity 0.05s linear',
            backgroundColor: '#2997FF',
            boxShadow: '0 0 4px #2997FF',
          }}
        />
      ))}

      <div className="text-center z-10 max-w-5xl mx-auto px-4 -mt-32">
        <h1 className="text-5xl md:text-7xl font-normal tracking-tight mb-3 text-white">
          {lineOne}
          {showCursor.one && <span className="inline-block w-0 overflow-visible" style={{ animation: 'blink 1s step-end infinite', color: '#2997FF', textShadow: '0 0 8px #2997FF, 0 0 20px rgba(41,151,255,0.4)', transition: 'opacity 0.6s ease', opacity: cursorFading ? 0 : 1 }}>|</span>}
          <span className="invisible">{fullLineOne.slice(lineOne.length)}</span>
        </h1>
        <h2 className="text-5xl md:text-7xl font-normal tracking-tight text-white mb-10">
          {lineTwo}
          {showCursor.two && <span className="inline-block w-0 overflow-visible" style={{ animation: cursorFading ? 'none' : 'blink 1s step-end infinite', color: '#2997FF', textShadow: '0 0 8px #2997FF, 0 0 20px rgba(41,151,255,0.4)', transition: 'opacity 0.6s ease', opacity: cursorFading ? 0 : 1 }}>|</span>}
          <span className="invisible">{fullLineTwo.slice(lineTwo.length)}</span>
        </h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={showActions ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-base font-medium hover:scale-105 transition-transform">
              <Apple size={18} fill="black" /> Download for MacOS
            </button>
            <button className="px-5 py-2.5 rounded-full text-base font-medium text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition-all">
              Explore use cases
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* --- 3. Intro Gradient "A" --- */
const IntroGradient = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);
  
  return (
    <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ scale }}
        className="relative w-[600px] h-[400px]"
      >
        {/* Approximating the "A" Bell Curve Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-400 to-yellow-400 blur-[80px] opacity-40 mask-image" 
             style={{ clipPath: 'path("M300,50 Q450,400 600,400 L0,400 Q150,400 300,50 Z")' }} // Crude bell curve path
        />
        <div className="absolute inset-0 flex items-center justify-center mt-32">
             {/* The glowing shape itself */}
             <div className="w-64 h-64 bg-gradient-to-t from-red-500 via-purple-500 to-blue-500 rounded-full blur-[60px] opacity-60"></div>
        </div>
      </motion.div>
      
      <button className="absolute z-20 flex items-center gap-2 bg-white shadow-xl px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
        <Play size={16} fill="black" /> Play intro
      </button>
    </div>
  );
};

/* --- 4. Toolbelt Icons --- */
const Toolbelt = () => {
  const icons = [Layout, Search, GitBranch, Terminal, FileCode, Cpu, MousePointer2];
  
  return (
    <div className="py-20 flex flex-col items-center">
      <div className="flex gap-8 mb-16 overflow-x-auto px-4 w-full justify-center">
        {icons.map((Icon, i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400"
          >
            <Icon size={24} />
          </motion.div>
        ))}
      </div>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-3xl md:text-5xl max-w-4xl text-center leading-tight font-medium px-6"
      >
        Google Antigravity is our agentic development platform, evolving the IDE into the agent-first era.
      </motion.p>
    </div>
  );
};

/* --- 5. Sticky Feature Section --- */
const StickyFeatureSection = () => {
  const [activeCard, setActiveCard] = useState(0);
  const refs = useRef([]);

  const features = [
    { title: "An AI IDE Core", desc: "Google Antigravity's Editor view offers tab autocompletion, natural language code commands, and a configurable agent." },
    { title: "Higher-level Abstractions", desc: "A more intuitive task-based approach to monitoring agent activity, presenting you with essential artifacts." },
    { title: "Cross-surface Agents", desc: "Synchronized agentic control across your editor, terminal, and browser for powerful development workflows." },
    { title: "User Feedback", desc: "Intuitively integrate feedback across surfaces and artifacts to guide and refine the agent's work." },
  ];

  // Logic to detect which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      refs.current.forEach((ref, index) => {
        if (ref && ref.offsetTop <= scrollPosition && ref.offsetTop + ref.offsetHeight > scrollPosition) {
          setActiveCard(index);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative flex flex-col md:flex-row max-w-7xl mx-auto px-6 py-20">
      {/* Left Column (Scrolls) */}
      <div className="w-full md:w-1/2 py-20">
        {features.map((feature, i) => (
          <div 
            key={i} 
            ref={el => refs.current[i] = el}
            className={`min-h-[80vh] flex flex-col justify-center transition-opacity duration-500 ${activeCard === i ? 'opacity-100' : 'opacity-30'}`}
          >
            <h3 className="text-4xl font-semibold mb-4">{feature.title}</h3>
            <p className="text-xl text-gray-600 max-w-md">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Right Column (Sticky) */}
      <div className="hidden md:block w-1/2 sticky top-0 h-screen flex items-center justify-center">
        <div className="bg-gray-50 w-full max-w-lg aspect-square rounded-3xl shadow-2xl p-6 overflow-hidden relative border border-gray-200">
           {/* Render different visuals based on activeCard */}
           
           {/* Visual 1: Code Editor */}
           <motion.div 
             className="absolute inset-0 bg-white p-8 font-mono text-sm"
             initial={{ opacity: 0 }} animate={{ opacity: activeCard === 0 ? 1 : 0 }}
           >
             <div className="flex gap-2 mb-4"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
             <div className="text-gray-400 mb-2">app &gt; components &gt; LoginButton.tsx</div>
             <div className="space-y-1">
                <div className="text-purple-600">import <span className="text-black">React</span> from <span className="text-green-600">'react'</span>;</div>
                <div className="mt-4">export default function <span className="text-blue-600">LoginButton</span>() {'{'}</div>
                <div className="pl-4">return (</div>
                <div className="pl-8 text-blue-600">&lt;button&gt;</div>
                <div className="pl-12 bg-blue-100 inline-block w-full">Implements<span className="animate-pulse">|</span></div>
             </div>
             <div className="absolute top-1/2 left-1/2 bg-white shadow-lg border border-gray-200 rounded p-2">
                 <div className="text-xs text-gray-500">Auto-complete</div>
                 <div className="font-bold">Implements</div>
                 <div>Import</div>
             </div>
           </motion.div>

           {/* Visual 2: Chat UI */}
           <motion.div 
             className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-8"
             initial={{ opacity: 0 }} animate={{ opacity: activeCard === 1 ? 1 : 0 }}
           >
              <div className="bg-white p-6 rounded-2xl shadow-sm w-full">
                  <p className="text-lg font-medium text-gray-800">Build a Next.js dashboard with an activity graph using Recharts.</p>
              </div>
           </motion.div>

           {/* Visual 3: Planning Pills */}
           <motion.div 
             className="absolute inset-0 bg-white flex flex-col items-center justify-center"
             initial={{ opacity: 0 }} animate={{ opacity: activeCard === 2 ? 1 : 0 }}
           >
              <div className="flex gap-4">
                  <div className="px-4 py-2 bg-gray-100 rounded-full flex items-center gap-2 font-medium">+ Planning</div>
                  <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full flex items-center gap-2 font-medium">Gemini Model</div>
              </div>
           </motion.div>

           {/* Visual 4: Feedback */}
           <motion.div 
             className="absolute inset-0 bg-white p-8 flex items-center justify-center"
             initial={{ opacity: 0 }} animate={{ opacity: activeCard === 3 ? 1 : 0 }}
           >
              <div className="border border-blue-500 p-4 rounded-lg relative w-full">
                  <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded">Changes applied</div>
                  <h4 className="font-bold text-xl">The hero section</h4>
              </div>
           </motion.div>

        </div>
      </div>
    </section>
  );
};

/* --- 6. Personas / Carousel --- */
const Personas = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-5xl font-medium mb-4">Built for developers<br />for the agent-first era</h2>
        <p className="text-gray-600 max-w-2xl text-lg">Google Antigravity is built for user trust, whether you're a professional developer or a hobbyist.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {['Frontend developer', 'Backend Engineer'].map((role, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 0.98 }}
            className="group relative aspect-[3/4] bg-gray-200 rounded-3xl overflow-hidden cursor-pointer"
          >
            {/* Placeholder for video/image */}
            <div className={`absolute inset-0 ${i === 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                {/* Simulated Person Image */}
                <img 
                    src={i === 0 
                        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
                        : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                    }
                    alt={role}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
            </div>
            <div className="absolute bottom-8 left-8 text-white z-10">
              <h3 className="text-3xl font-medium">{role}</h3>
              <p className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">Streamline UI development...</p>
            </div>
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 text-white font-medium">
                    <Play size={16} fill="white" /> Watch case
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* --- 7. Split CTA --- */
const SplitCTA = () => {
  return (
    <div className="border-t border-b border-gray-200 grid md:grid-cols-2 min-h-[400px]">
      <div className="p-16 flex flex-col justify-center border-r border-gray-100 relative overflow-hidden group">
        <div className="relative z-10">
            <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">Available at no charge</span>
            <h3 className="text-4xl font-medium mt-2 mb-8">For developers<br/>Achieve new heights</h3>
            <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition">Download</button>
        </div>
        {/* Decorative BG */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
      </div>

      <div className="p-16 flex flex-col justify-center relative overflow-hidden group">
        <div className="relative z-10">
            <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">Coming soon</span>
            <h3 className="text-4xl font-medium mt-2 mb-8">For organizations<br/>Level up your entire team</h3>
            <button className="border border-gray-300 px-8 py-3 rounded-full hover:bg-gray-50 transition">Notify me</button>
        </div>
        {/* Decorative BG */}
         <div className="absolute right-0 bottom-0 w-64 h-64 border border-dashed border-gray-200 rounded-full animate-spin-slow"></div>
      </div>
    </div>
  );
};

/* --- 8. Blog Section --- */
const BlogSection = () => {
  const blogs = [
    { title: "Gemini 3 Flash in Google Antigravity", date: "Dec 17, 2025", type: "Product", color: "bg-black text-white" },
    { title: "Nano Banana Pro in Google Antigravity", date: "Nov 20, 2025", type: "Product", color: "bg-yellow-100" },
    { title: "Introducing Google Antigravity", date: "Nov 18, 2025", type: "Product", color: "bg-gray-900 text-white" },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-medium">Latest Blogs</h2>
        <button className="text-gray-500 hover:text-black transition-colors">View blog</button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {blogs.map((blog, i) => (
          <div key={i} className="group cursor-pointer">
            <div className={`aspect-square rounded-2xl mb-4 p-8 flex flex-col justify-end ${blog.color} transition-transform group-hover:-translate-y-2`}>
                <h3 className="text-2xl font-medium">{blog.title}</h3>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
                <span>{blog.date}</span>
                <span>{blog.type}</span>
            </div>
            <div className="mt-2 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Read blog <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* --- 9. Starfield Footer --- */
const StarfieldFooter = () => {
  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0.8, 1], [200, -100]); // Parallax text effect

  // Starfield Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 400 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
    }));

    const animate = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      stars.forEach(star => {
        star.z -= 2; // Speed
        if (star.z <= 0) {
            star.z = canvas.width;
            star.x = Math.random() * canvas.width;
            star.y = Math.random() * canvas.height;
        }
        
        const x = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2;
        const size = (1 - star.z / canvas.width) * 3;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <footer className="relative bg-black text-white min-h-screen overflow-hidden flex flex-col items-center justify-center pt-20">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
      
      <div className="relative z-10 text-center space-y-8">
        <h2 className="text-5xl md:text-7xl font-medium tracking-tight">Download Google<br/>Antigravity for MacOS</h2>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          <button className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:scale-105 transition-transform">
            Download for Apple Silicon
          </button>
          <button className="border border-white/30 px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 transition-colors">
            Download for Intel
          </button>
        </div>
      </div>

      <motion.div style={{ y }} className="mt-auto pointer-events-none">
        <h1 className="text-[15vw] leading-none font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 opacity-20">
          Antigravity
        </h1>
      </motion.div>

      <div className="absolute bottom-10 flex gap-8 text-sm text-gray-400 z-20">
        <a href="#" className="hover:text-white">About Google</a>
        <a href="#" className="hover:text-white">Google Products</a>
        <a href="#" className="hover:text-white">Privacy</a>
        <a href="#" className="hover:text-white">Terms</a>
      </div>
    </footer>
  );
};

export default GoogleAntigravityClone;
