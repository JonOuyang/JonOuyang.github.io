import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Play, Apple, ArrowRight, Search, Terminal, GitBranch, Layout, FileCode, Cpu, MousePointer2 } from 'lucide-react';
import RobotArmSection from './RobotArmSection';

const blinkKeyframes = `@keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }`;

const GoogleAntigravityClone = () => {
  return (
    <div className="font-sans text-white bg-black selection:bg-blue-500/30">
      <style>{blinkKeyframes}</style>
      <Hero />
      <ExpandingVideo />
      <Toolbelt />
      <StickyFeatureSection />

      <SplitCTA />
      <BlogSection />
      <RobotArmSection />
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
  const fullLineOne = "Jonathan Ouyang";
  const fullLineTwo = "Computer Science at UCLA";
  const [lineOne, setLineOne] = useState('');
  const [lineTwo, setLineTwo] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showCursor, setShowCursor] = useState({ one: false, two: false });
  const [cursorFading, setCursorFading] = useState(false);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let indexOne = 0;
    let indexTwo = 0;
    let lineOneInterval;
    let lineTwoInterval;
    let fadeTimeout;

    // Reset state on mount
    setLineOne('');
    setLineTwo('');
    setShowActions(false);
    setShowCursor({ one: false, two: false });
    setCursorFading(false);

    // Show cursor, then start typing
    const initialCursor = setTimeout(() => {
      setShowCursor({ one: true, two: false });
    }, 200);

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
              fadeTimeout = setTimeout(() => {
                setShowCursor({ one: false, two: false });
                setCursorFading(false);
                setShowActions(true);
              }, 800);
            }
          }, 45);
        }
      }, 45);
    }, 800);

    return () => {
      clearTimeout(initialCursor);
      clearTimeout(lineOneStart);
      clearTimeout(fadeTimeout);
      clearInterval(lineOneInterval);
      clearInterval(lineTwoInterval);
    };
  }, []);

  // Water cursor effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    let mouse = { x: -1000, y: -1000 };
    let prevMouse = { x: -1000, y: -1000 };
    let isInHero = false;
    const ripples = [];
    const droplets = [];
    let animId;

    const resize = () => {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Ambient floating particles (shared across all modes)
    const ambientParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.35 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }));

    // Mode 3: bioluminescent jellyfish creatures
    const jellies = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.3 - 0.1,
      size: 6 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02,
      hue: [198, 206, 214, 222, 230][Math.floor(Math.random() * 5)],
      tentacleLen: 3 + Math.floor(Math.random() * 3),
    }));

    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        prevMouse.x = mouse.x;
        prevMouse.y = mouse.y;
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        isInHero = true;

        const speed = Math.sqrt((mouse.x - prevMouse.x) ** 2 + (mouse.y - prevMouse.y) ** 2);

        // Bioluminescence — plankton bloom on cursor disturbance
        if (droplets.length < 120) {
          const count = Math.min(4, 2 + Math.floor(speed * 0.15));
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 18;
            droplets.push({
              x: mouse.x + Math.cos(angle) * dist,
              y: mouse.y + Math.sin(angle) * dist,
              vx: (Math.random() - 0.5) * 1.5 + (mouse.x - prevMouse.x) * 0.1,
              vy: (Math.random() - 0.5) * 1.5 + (mouse.y - prevMouse.y) * 0.1,
              radius: Math.random() * 3 + 1,
              life: 1,
              decay: 0.005 + Math.random() * 0.008,
              hue: [198, 206, 214, 222][Math.floor(Math.random() * 4)],
              mode: 'bio',
            });
          }
        }
      } else {
        isInHero = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const drawAmbient = () => {
      ambientParticles.forEach(p => {
        p.x += p.vx + Math.sin(Date.now() * 0.001 + p.phase) * 0.2;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(41, 151, 255, ${p.opacity})`;
        ctx.fill();
      });
    };

    const drawCursorGlow = () => {
      if (!isInHero) return;
      const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
      cursorGlow.addColorStop(0, 'rgba(100, 200, 255, 0.15)');
      cursorGlow.addColorStop(0.3, 'rgba(41, 151, 255, 0.08)');
      cursorGlow.addColorStop(0.7, 'rgba(41, 151, 255, 0.02)');
      cursorGlow.addColorStop(1, 'rgba(41, 151, 255, 0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
      ctx.fillStyle = cursorGlow;
      ctx.fill();
    };

    // === MODE 1: Ripples + Droplets ===
    const drawMode0 = () => {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        const progress = r.radius / r.maxRadius;
        const alpha = r.opacity * (1 - progress);
        if (alpha <= 0.001) { ripples.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
        ctx.lineWidth = 2.5 - progress * 1.5;
        ctx.shadowColor = 'rgba(41, 151, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(150, 220, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const grad = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.radius);
        grad.addColorStop(0, `rgba(100, 200, 255, ${alpha * 0.25})`);
        grad.addColorStop(0.4, `rgba(41, 151, 255, ${alpha * 0.1})`);
        grad.addColorStop(1, 'rgba(41, 151, 255, 0)');
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.x += d.vx; d.y += d.vy;
        d.vy += 0.02; d.vx *= 0.98; d.vy *= 0.98;
        d.life -= d.decay;
        if (d.life <= 0) { droplets.splice(i, 1); continue; }

        const alpha = d.life * 0.9;
        const dGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.radius * 4);
        dGrad.addColorStop(0, `hsla(${d.hue}, 100%, 85%, ${alpha})`);
        dGrad.addColorStop(0.3, `hsla(${d.hue}, 95%, 70%, ${alpha * 0.7})`);
        dGrad.addColorStop(0.6, `hsla(${d.hue}, 85%, 55%, ${alpha * 0.3})`);
        dGrad.addColorStop(1, `hsla(${d.hue}, 80%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = dGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue}, 100%, 95%, ${alpha})`;
        ctx.shadowColor = `hsla(${d.hue}, 100%, 70%, 0.8)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    // === MODE 2: Chinese New Year — Fireworks + Lantern Glow ===
    const cnyLanterns = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 10 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      swaySpeed: 0.003 + Math.random() * 0.004,
      driftY: -0.5 - Math.random() * 0.4,
    }));

    // Pre-create a single offscreen lantern glow image to stamp instead of drawing gradients each frame
    const lanternGlowCanvas = document.createElement('canvas');
    lanternGlowCanvas.width = 100;
    lanternGlowCanvas.height = 100;
    const lgCtx = lanternGlowCanvas.getContext('2d');
    const lgGrad = lgCtx.createRadialGradient(50, 50, 0, 50, 50, 50);
    lgGrad.addColorStop(0, 'rgba(255, 60, 20, 0.25)');
    lgGrad.addColorStop(0.5, 'rgba(255, 150, 0, 0.08)');
    lgGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
    lgCtx.fillStyle = lgGrad;
    lgCtx.fillRect(0, 0, 100, 100);

    const drawMode1 = () => {
      const t = Date.now();

      // Floating lanterns — stamp pre-rendered glow + simple shapes
      cnyLanterns.forEach(l => {
        l.x += Math.sin(t * l.swaySpeed + l.phase) * 0.4;
        l.y += l.driftY;
        if (l.y < -40) { l.y = canvas.height + 40; l.x = Math.random() * canvas.width; }

        // Stamp pre-rendered glow
        const glowSize = l.size * 8;
        ctx.drawImage(lanternGlowCanvas, l.x - glowSize / 2, l.y - glowSize / 2, glowSize, glowSize);

        // Lantern body — simple ellipse, no shadow
        ctx.beginPath();
        ctx.ellipse(l.x, l.y, l.size * 0.7, l.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 30, 10, 0.85)';
        ctx.fill();

        // Lantern highlight
        ctx.beginPath();
        ctx.ellipse(l.x, l.y - l.size * 0.2, l.size * 0.4, l.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 180, 50, 0.3)';
        ctx.fill();

        // Top knob
        ctx.beginPath();
        ctx.arc(l.x, l.y - l.size, l.size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 200, 50, 0.9)';
        ctx.fill();

        // Tassel
        ctx.beginPath();
        ctx.moveTo(l.x, l.y + l.size);
        ctx.lineTo(l.x, l.y + l.size + 8);
        ctx.strokeStyle = 'rgba(255, 200, 50, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw CNY sparks — brilliant fireworks
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        if (d.mode !== 'cny') continue;
        d.x += d.vx; d.y += d.vy;
        d.vy += 0.025;
        d.vx *= 0.988; d.vy *= 0.988;
        d.life -= d.decay;
        if (d.life <= 0) { droplets.splice(i, 1); continue; }

        const alpha = d.life;

        // Wide outer bloom
        ctx.globalAlpha = alpha * 0.2;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 8, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${d.hue}, 100%, 55%)`;
        ctx.fill();

        // Mid glow
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${d.hue}, 100%, 70%)`;
        ctx.fill();

        // Bright core
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${d.hue}, 100%, 95%)`;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Cursor glow — big warm red/gold
      if (isInHero) {
        const cGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        cGrad.addColorStop(0, 'rgba(255, 150, 30, 0.2)');
        cGrad.addColorStop(0.3, 'rgba(255, 80, 0, 0.1)');
        cGrad.addColorStop(0.6, 'rgba(255, 50, 0, 0.03)');
        cGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2);
        ctx.fillStyle = cGrad;
        ctx.fill();
      }
    };

    // === MODE 3: Bioluminescence ===
    const drawMode2 = () => {
      const t = Date.now() * 0.001;

      // Floating jellyfish creatures
      jellies.forEach(j => {
        const pulse = Math.sin(t * j.pulseSpeed * 60 + j.phase) * 0.5 + 0.5; // 0-1 pulsing
        const dx = isInHero ? (mouse.x - j.x) : 0;
        const dy = isInHero ? (mouse.y - j.y) : 0;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Gently flee from cursor when close
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 0.15;
          j.vx -= (dx / dist) * force;
          j.vy -= (dy / dist) * force;
        }

        // Drift + gentle sway
        j.vx += Math.sin(t * 0.5 + j.phase) * 0.005;
        j.vy += -0.008 + Math.cos(t * 0.3 + j.phase) * 0.003;
        j.vx *= 0.98;
        j.vy *= 0.98;
        j.x += j.vx;
        j.y += j.vy;

        // Wrap
        if (j.y < -j.size * 3) { j.y = canvas.height + j.size * 3; j.x = Math.random() * canvas.width; }
        if (j.x < -50) j.x = canvas.width + 50;
        if (j.x > canvas.width + 50) j.x = -50;

        const bodyAlpha = 0.5 + pulse * 0.4;

        // Outer glow
        ctx.globalAlpha = bodyAlpha * 0.15;
        ctx.beginPath();
        ctx.arc(j.x, j.y, j.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${j.hue}, 100%, 60%)`;
        ctx.fill();

        // Bell body (dome)
        ctx.globalAlpha = bodyAlpha * 0.6;
        ctx.beginPath();
        ctx.arc(j.x, j.y, j.size, 0, Math.PI, true);
        ctx.fillStyle = `hsl(${j.hue}, 80%, 65%)`;
        ctx.fill();

        // Inner glow core
        ctx.globalAlpha = bodyAlpha * 0.9;
        ctx.beginPath();
        ctx.arc(j.x, j.y - j.size * 0.2, j.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${j.hue}, 100%, 85%)`;
        ctx.fill();

        // Tentacles — simple wavy lines
        ctx.globalAlpha = bodyAlpha * 0.4;
        ctx.strokeStyle = `hsl(${j.hue}, 90%, 70%)`;
        ctx.lineWidth = 1;
        for (let ti = 0; ti < j.tentacleLen; ti++) {
          const offsetX = (ti - (j.tentacleLen - 1) / 2) * (j.size * 0.4);
          ctx.beginPath();
          ctx.moveTo(j.x + offsetX, j.y);
          const len = j.size * 1.8;
          const segments = 4;
          for (let s = 1; s <= segments; s++) {
            const sy = j.y + (len / segments) * s;
            const sx = j.x + offsetX + Math.sin(t * 2 + j.phase + ti + s * 0.8) * (j.size * 0.3);
            ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      });

      // Draw bioluminescent plankton particles
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        if (d.mode !== 'bio') continue;
        d.x += d.vx; d.y += d.vy;
        // Slow float with slight upward drift
        d.vy -= 0.005;
        d.vx *= 0.995; d.vy *= 0.995;
        // Gentle wander
        d.vx += (Math.random() - 0.5) * 0.05;
        d.vy += (Math.random() - 0.5) * 0.05;
        d.life -= d.decay;
        if (d.life <= 0) { droplets.splice(i, 1); continue; }

        const alpha = d.life;

        // Soft outer bloom
        ctx.globalAlpha = alpha * 0.25;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${d.hue}, 100%, 55%)`;
        ctx.fill();

        // Mid glow
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${d.hue}, 100%, 70%)`;
        ctx.fill();

        // Bright core
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${d.hue}, 100%, 92%)`;
        ctx.fill();

        ctx.globalAlpha = 1;
      }

      // Cursor glow — bright electric blue
      if (isInHero) {
        const cGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 110);
        cGrad.addColorStop(0, 'rgba(120, 210, 255, 0.2)');
        cGrad.addColorStop(0.3, 'rgba(70, 170, 255, 0.1)');
        cGrad.addColorStop(1, 'rgba(50, 140, 255, 0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 110, 0, Math.PI * 2);
        ctx.fillStyle = cGrad;
        ctx.fill();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawAmbient();
      drawMode2();
      drawCursorGlow();
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-black">
      {/* Water cursor canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />

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

/* --- 2.5 Expanding Video Section --- */
const ExpandingVideo = () => {
  const containerRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
  const videoUrl = 'https://www.youtube.com/watch?v=shnW3VerkiM';
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Animation completes right as the full video is in view
  const scale = useTransform(scrollYProgress, [0, 0.35], [0.6, 0.97]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.35], [32, 16]);

  useEffect(() => {
    const canvas = backgroundCanvasRef.current;
    const section = containerRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    let animId;
    const ambientParticles = [];
    const jellies = [];

    const seedScene = () => {
      ambientParticles.length = 0;
      jellies.length = 0;

      for (let i = 0; i < 45; i += 1) {
        ambientParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2.2 + 0.5,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -Math.random() * 0.3 - 0.05,
          opacity: Math.random() * 0.25 + 0.08,
          phase: Math.random() * Math.PI * 2,
        });
      }

      for (let i = 0; i < 10; i += 1) {
        jellies.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: -Math.random() * 0.22 - 0.06,
          size: 8 + Math.random() * 14,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
          hue: [198, 206, 214, 222, 230][Math.floor(Math.random() * 5)],
          tentacleLen: 3 + Math.floor(Math.random() * 3),
        });
      }
    };

    const resize = () => {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
      canvas.style.width = `${section.offsetWidth}px`;
      canvas.style.height = `${section.offsetHeight}px`;
      seedScene();
    };

    const draw = () => {
      const t = Date.now() * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ambientParticles.forEach((p) => {
        p.x += p.vx + Math.sin(t + p.phase) * 0.16;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(41, 151, 255, ${p.opacity})`;
        ctx.fill();
      });

      jellies.forEach((j) => {
        const pulse = Math.sin(t * j.pulseSpeed * 60 + j.phase) * 0.5 + 0.5;

        j.vx += Math.sin(t * 0.55 + j.phase) * 0.004;
        j.vy += -0.007 + Math.cos(t * 0.35 + j.phase) * 0.002;
        j.vx *= 0.986;
        j.vy *= 0.986;
        j.x += j.vx;
        j.y += j.vy;

        if (j.y < -j.size * 3) {
          j.y = canvas.height + j.size * 3;
          j.x = Math.random() * canvas.width;
        }
        if (j.x < -50) j.x = canvas.width + 50;
        if (j.x > canvas.width + 50) j.x = -50;

        const bodyAlpha = 0.45 + pulse * 0.35;

        ctx.globalAlpha = bodyAlpha * 0.12;
        ctx.beginPath();
        ctx.arc(j.x, j.y, j.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${j.hue}, 100%, 60%)`;
        ctx.fill();

        ctx.globalAlpha = bodyAlpha * 0.55;
        ctx.beginPath();
        ctx.arc(j.x, j.y, j.size, 0, Math.PI, true);
        ctx.fillStyle = `hsl(${j.hue}, 80%, 65%)`;
        ctx.fill();

        ctx.globalAlpha = bodyAlpha * 0.85;
        ctx.beginPath();
        ctx.arc(j.x, j.y - j.size * 0.2, j.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${j.hue}, 100%, 85%)`;
        ctx.fill();

        ctx.globalAlpha = bodyAlpha * 0.36;
        ctx.strokeStyle = `hsl(${j.hue}, 90%, 70%)`;
        ctx.lineWidth = 1;
        for (let ti = 0; ti < j.tentacleLen; ti += 1) {
          const offsetX = (ti - (j.tentacleLen - 1) / 2) * (j.size * 0.4);
          ctx.beginPath();
          ctx.moveTo(j.x + offsetX, j.y);
          const len = j.size * 1.8;
          const segments = 4;
          for (let s = 1; s <= segments; s += 1) {
            const sy = j.y + (len / segments) * s;
            const sx = j.x + offsetX + Math.sin(t * 2 + j.phase + ti + s * 0.8) * (j.size * 0.3);
            ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section ref={containerRef} className="relative bg-black">
      <canvas ref={backgroundCanvasRef} className="absolute inset-0 pointer-events-none z-0" />
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.16) 28%, rgba(0,0,0,0.38) 46%, rgba(0,0,0,0.66) 60%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 100%)',
        }}
      />
      <div className="relative z-10 flex items-center justify-center px-3">
        <motion.div
          style={{ scale, borderRadius }}
          className="overflow-hidden aspect-video w-full relative cursor-none"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <video
            src="/assets/videos/jayu-gemini-winner.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 z-10"
            aria-label="Open video on YouTube"
          />
          <motion.div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-[140%] rounded-2xl bg-white px-5 py-2.5 text-base font-semibold text-black shadow-xl"
            animate={{
              left: cursorPos.x,
              top: cursorPos.y,
              opacity: isHovering ? 1 : 0,
              scale: isHovering ? 1 : 0.85,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.35 }}
          >
            See Video
          </motion.div>
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
  const bubbleSlot = 104; // 80px bubble + 24px gap
  const [bubbleCount, setBubbleCount] = useState(16);

  useEffect(() => {
    const updateBubbleCount = () => {
      const viewportWidth = window.innerWidth;
      setBubbleCount(Math.max(10, Math.ceil(viewportWidth / bubbleSlot) + 2));
    };

    updateBubbleCount();
    window.addEventListener('resize', updateBubbleCount);
    return () => window.removeEventListener('resize', updateBubbleCount);
  }, []);

  return (
    <div className="pt-32 pb-20 flex flex-col items-center">
      <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-x-hidden overflow-y-visible mb-16 py-8">
        <div className="flex flex-nowrap items-center" style={{ gap: '24px', marginLeft: '-52px' }}>
          {Array.from({ length: bubbleCount }).map((_, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={i}
                initial={{ y: 0 }}
                animate={{ y: [0, -30, 0] }}
                transition={{ duration: 2.5, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0 w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400"
              >
                <Icon size={30} />
              </motion.div>
            );
          })}
        </div>
      </div>
      <ToolbeltTyping />
    </div>
  );
};

const ToolbeltTyping = () => {
  const fullText = "For the love of the game\nFor the future of intelligent systems\nFor better, more human AI";
  const [typed, setTyped] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [cursorFading, setCursorFading] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    let index = 0;
    let typingInterval;

    const cursorTimeout = setTimeout(() => {
      setShowCursor(true);
    }, 200);

    const typingStart = setTimeout(() => {
      typingInterval = setInterval(() => {
        index += 1;
        setTyped(fullText.slice(0, index));
        if (index >= fullText.length) {
          clearInterval(typingInterval);
          setCursorFading(true);
          setTimeout(() => {
            setShowCursor(false);
            setCursorFading(false);
          }, 800);
        }
      }, 18);
    }, 600);

    return () => {
      clearTimeout(cursorTimeout);
      clearTimeout(typingStart);
      clearInterval(typingInterval);
    };
  }, [isInView]);

  return (
    <p ref={ref} className="text-4xl md:text-6xl w-screen max-w-none text-left leading-tight font-medium px-6 md:px-8 mr-auto ml-8 md:ml-16 whitespace-pre-line">
      {typed}
      {showCursor && <span className="inline-block w-0 overflow-visible" style={{ animation: cursorFading ? 'none' : 'blink 1s step-end infinite', color: '#2997FF', textShadow: '0 0 8px #2997FF, 0 0 20px rgba(41,151,255,0.4)', transition: 'opacity 0.6s ease', opacity: cursorFading ? 0 : 1 }}>|</span>}
      <span className="invisible">{fullText.slice(typed.length)}</span>
    </p>
  );
};

/* --- 5. Feature Section --- */
const FeatureTypingText = ({ text }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!isInView) return;
    setTyped('');
    const charDelay = 8;
    const startDelay = 50;
    let i = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setTyped(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, charDelay);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(startTimeout);
  }, [isInView, text]);

  return (
    <p ref={ref} className="text-xl text-zinc-300 max-w-md">
      <span>{typed}</span>
      <span className="invisible">{text.slice(typed.length)}</span>
    </p>
  );
};

const StickyFeatureSection = () => {
  const features = [
    { title: "Agentic Systems", desc: "I build computer-use and multimodal agents that plan, act, and adapt in real workflows, from prototype to production.", color: "59, 130, 246" },
    { title: "Robotics Research", desc: "My research spans shared autonomy, gaze-conditioned control, and robot learning, with work across UCLA, Stanford, and SJSU labs.", color: "139, 92, 246" },
    { title: "Production Code at Scale", desc: "I ship reliable software systems that handle real traffic, improve developer velocity, and hold up under production constraints.", color: "34, 197, 94" },
    { title: "Outside of Work", desc: "I lead communities, mentor builders, and explore side projects that blend creativity, engineering, and practical impact.", color: "234, 179, 8" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 space-y-10">
      {features.map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-center gap-12 md:gap-y-12 md:gap-x-0"
        >
          <div className="w-full md:w-1/2 md:pr-4">
            <div className="md:-translate-x-[180px]">
              <h3 className="text-4xl font-semibold mb-4 bg-gradient-to-r from-white via-white to-zinc-300 bg-clip-text text-transparent">{feature.title}</h3>
              <FeatureTypingText text={feature.desc} />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div
              className="w-full md:w-[122%] md:max-w-none aspect-square rounded-2xl overflow-hidden border border-white/[0.008] flex items-center justify-center p-6 origin-left relative isolate"
              style={{
                background: `
                  radial-gradient(130% 120% at 12% 16%, rgba(${feature.color}, 0.018) 0%, rgba(${feature.color}, 0.004) 32%, rgba(0, 0, 0, 0) 56%),
                  radial-gradient(110% 95% at 86% 24%, rgba(56, 189, 248, 0.01) 0%, rgba(0, 0, 0, 0) 50%),
                  radial-gradient(120% 120% at 24% 86%, rgba(16, 185, 129, 0.008) 0%, rgba(0, 0, 0, 0) 48%),
                  linear-gradient(155deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 52%, rgb(0, 0, 0) 100%)
                `,
              }}
            >
              {/* Video-driven ambient glow behind the main frame */}
              <video
                src="/assets/videos/frame.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-[0.02] blur-3xl scale-105 saturate-125 contrast-110 pointer-events-none"
              />

              {/* Watercolor dye layers */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(42% 34% at 18% 22%, rgba(${feature.color}, 0.03) 0%, rgba(${feature.color}, 0.007) 58%, rgba(0, 0, 0, 0) 100%),
                    radial-gradient(36% 30% at 76% 28%, rgba(96, 165, 250, 0.025) 0%, rgba(0, 0, 0, 0) 100%),
                    radial-gradient(44% 36% at 34% 84%, rgba(52, 211, 153, 0.02) 0%, rgba(0, 0, 0, 0) 100%)
                  `,
                  mixBlendMode: 'screen',
                  opacity: 0.035,
                }}
              />

              <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  src="/assets/videos/frame.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Color response layer that reacts to frame-to-frame video color changes */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(120% 100% at 10% 8%, rgba(${feature.color}, 0.035) 0%, rgba(0, 0, 0, 0) 58%),
                      radial-gradient(95% 90% at 88% 78%, rgba(34, 211, 238, 0.03) 0%, rgba(0, 0, 0, 0) 60%)
                    `,
                    mixBlendMode: 'soft-light',
                    opacity: 0.045,
                  }}
                />

                <div className="absolute inset-0 pointer-events-none border border-white/[0.008] rounded-xl" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </section>
  );
};


/* --- 7. Split CTA --- */
const SplitCTA = () => {
  return (
    <div className="border-t border-b border-zinc-800 grid md:grid-cols-2 min-h-[400px]">
      <div className="p-16 flex flex-col justify-center border-r border-zinc-800 relative overflow-hidden group">
        <div className="relative z-10">
            <span className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Available at no charge</span>
            <h3 className="text-4xl font-medium mt-2 mb-8 bg-gradient-to-r from-white via-white to-zinc-300 bg-clip-text text-transparent">For developers<br/>Achieve new heights</h3>
            <button className="bg-white text-black px-8 py-3 rounded-full hover:bg-zinc-200 transition">Download</button>
        </div>
        {/* Decorative BG */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-zinc-900 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
      </div>

      <div className="p-16 flex flex-col justify-center relative overflow-hidden group">
        <div className="relative z-10">
            <span className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Coming soon</span>
            <h3 className="text-4xl font-medium mt-2 mb-8 bg-gradient-to-r from-white via-white to-zinc-300 bg-clip-text text-transparent">For organizations<br/>Level up your entire team</h3>
            <button className="border border-zinc-700 px-8 py-3 rounded-full hover:bg-zinc-900 transition text-white">Notify me</button>
        </div>
        {/* Decorative BG */}
         <div className="absolute right-0 bottom-0 w-64 h-64 border border-dashed border-zinc-800 rounded-full animate-spin-slow"></div>
      </div>
    </div>
  );
};

/* --- 8. Blog Section --- */
const BlogSection = () => {
  // Add new posts here. `image` is optional:
  // - with image: card shows image + text overlay
  // - without image: card shows a text-first gradient header
  const socialPosts = [
    {
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7427449842383196161/",
      embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7427449538019409920?collapsed=1",
      embedHeight: 470,
      title: "Building agentic systems with strong product instincts and practical deployment focus.",
      date: "LinkedIn",
    },
    {
      url: "https://www.linkedin.com/posts/googleaidevs_developed-using-geminis-advanced-vision-ugcPost-7328449152445489153-zXKL?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEAze44B7770Sfnvaz-6R9-fzahVG5WmyVE",
      embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7328449152445489153?collapsed=1",
      embedHeight: 470,
      title: "Featured by Google AI Developers for work built with Gemini vision capabilities.",
      date: "LinkedIn",
    },
    {
      url: "https://www.linkedin.com/feed/update/urn:li:share:7265418644434690052/",
      embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:share:7265418644434690052?collapsed=1",
      embedHeight: 470,
      title: "Additional project update and milestone highlight.",
      date: "LinkedIn",
    },
  ];

  const platformFromUrl = (url) => {
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('x.com') || url.includes('twitter.com')) return 'X / Twitter';
    return 'Social';
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-medium bg-gradient-to-r from-white via-white to-zinc-300 bg-clip-text text-transparent">Latest Social Posts</h2>
        <a
          href="https://www.linkedin.com/in/jon-ouyang/"
          target="_blank"
          rel="noreferrer"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          View all posts
        </a>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {socialPosts.map((post, i) => (
          <div key={i} className="group w-full max-w-[504px] mx-auto">
            <div className="rounded-2xl mb-4 overflow-hidden relative transition-transform group-hover:-translate-y-2">
              {post.embedUrl ? (
                <iframe
                  src={post.embedUrl}
                  className="block w-full max-w-[504px] mx-auto"
                  style={{ height: post.embedHeight || 500 }}
                  frameBorder="0"
                  allowFullScreen
                  title={`Embedded social post ${i + 1}`}
                />
              ) : post.image ? (
                <>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex items-end">
                    <h3 className="text-xl font-medium text-white">{post.title}</h3>
                  </div>
                </>
              ) : (
                <div className="aspect-square w-full h-full p-7 flex flex-col justify-end bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
                  <h3 className="text-2xl font-medium leading-snug text-white">{post.title}</h3>
                </div>
              )}
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>{post.date}</span>
              <span>{platformFromUrl(post.url)}</span>
            </div>
            <a href={post.url} target="_blank" rel="noreferrer" className="mt-2 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Open post <ArrowRight size={14} />
            </a>
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
