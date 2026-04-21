const fs = require('fs');
const path = require('path');

// FINAL MASTERPIECE: THE PERFECT SYNTHESIS
const NUM_ATMOSPHERE = 400;
const NUM_LOGO = 800; 
let lampHtml = '';

for (let i = 0; i < (NUM_ATMOSPHERE + NUM_LOGO); i++) {
    const isLogo = i < NUM_LOGO;
    let left, top, height, colorRange;
    const rand = Math.random();
    
    if (isLogo) {
        // Stem only — top bar and hook are zoomed off-screen before fade, so no strands there.
        left = 42.5 + Math.random() * 15;
        top = 0;
        height = 62;
    } else {
        left = Math.random() * 100; top = -100; height = 300;
    }

    // SPATIAL COLOR MAPPING
    if (left < 38) colorRange = ['#ff0000', '#ff0000', '#8b0000']; 
    else if (left < 48) colorRange = ['#ff4500', '#ff8c00', '#ffd700']; 
    else if (left < 52) colorRange = ['#ffffff', '#ffffff', '#ffd700']; 
    else if (left < 62) colorRange = ['#00ffff', '#00ced1', '#1e90ff']; 
    else colorRange = ['#0000ff', '#0000ff', '#4b0082']; 

    // Stagger delays to prevent initial flash
    const delay = (0.1 + Math.random() * 0.4).toFixed(4);
    const speed = (0.7 + Math.random() * 1.6).toFixed(2);
    const zStart = isLogo ? 0 : (-2000 - Math.random() * 8000);
    
    const hasCore = Math.random() > 0.4;
    const coreClass = hasCore ? 'lamp-core' : 'lamp-no-core';

    // All strands span -100vh..+200vh so there is never a visible vertical cutoff inside
    // the viewport at any scale. The fade regions of glow/core land well outside the screen.
    lampHtml += `<div class="lamp-container ${isLogo ? 'logo-strand' : 'atmosphere-strand'}"
        data-left="${left.toFixed(4)}" data-delay="${delay}" data-speed="${speed}" data-zstart="${zStart}"
        style="left: ${left.toFixed(4)}%; top: -100vh; height: 300vh">
        <div class="lamp-glow" style="background: linear-gradient(to bottom, transparent 0%, ${colorRange[0]} 15%, ${colorRange[1]} 50%, ${colorRange[2]} 85%, transparent 100%)"></div>
        <div class="${coreClass}"></div>
    </div>`;
}

const finalStyles = `
    body { margin: 0; padding: 0; background: black; overflow: hidden; width: 1920px; height: 1080px; }
    .netflix-intro-wrapper { 
        position: fixed; inset: 0; background: black; 
        display: flex; justify-content: center; align-items: center;
        perspective: 1200px; perspective-origin: 50% 40%; 
    }
    
    .netflix-n { 
        position: relative; width: 300px; height: 370px; 
        z-index: 10; transform-origin: 50% 50%; transform-style: preserve-3d;
    }
    
    /* PERFECT V1 J GEOMETRY */
    .helper { position: absolute; }
    .helper-1 { width: 100%; height: 15%; background: #e40913; top: 0; }
    .helper-2 { width: 15%; height: 62%; left: 42.5%; top: 0; background: #e40913; }
    .helper-3 { left: 0; top: 0; width: 60%; height: 100%; }
    .helper-3 path { stroke: #e40913; stroke-width: 45; stroke-linecap: butt; stroke-linejoin: round; }

    /* FILAMENTS CONTAINER */
    .effect-lumieres { 
        position: absolute; inset: 0; 
        transform-style: preserve-3d; z-index: 20; 
        --red-ratio: 1; /* Controlled globally via JS for 0-lag color transition */
    }

    .lamp-container {
        position: absolute; width: 1.5px; height: 100%; transform-style: preserve-3d;
        mix-blend-mode: normal; opacity: 0;
    }

    /* No filter: a blur + saturate computed at pre-scale resolution produced visible blocky
       bands when scaled 6×+ during the perspective fly-through. Drop it. */
    .lamp-glow {
        position: absolute; width: 100%; height: 100%;
        opacity: 0.8;
    }
    
    /* Performance trick: Overlay a red gradient using pseudo-element instead of adding 1200 DOM nodes */
    .lamp-glow::after {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(to bottom, transparent 0%, #e40913 15%, #e40913 50%, #8b0000 85%, transparent 100%);
        opacity: var(--red-ratio);
    }
    
    /* Core fades to transparent at top and bottom (mirrors the glow gradient). This kills the
       sharp white end-caps that previously showed as a bright line across the lower viewport. */
    .lamp-core {
        position: absolute; width: 0.3px; height: 100%; left: 50%; transform: translateX(-50%);
        background: linear-gradient(to bottom, transparent 0%, white 15%, white 85%, transparent 100%);
        opacity: 0.6;
        -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
        mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
    }
    .lamp-no-core { display: none; }
`;

const driverScript = `window.seekTo = (timeInSeconds) => {
    const n = document.querySelector(".netflix-n");
    const helpers = document.querySelectorAll(".helper");
    const lamps = document.querySelectorAll(".lamp-container");
    const lumieres = document.querySelector(".effect-lumieres");
    
    // 1. ZOOM — two phases:
    //    Fast phase (0.15s → 0.65s): scale 1 → 6. By fade start, the top bar and hook are
    //    pushed off the viewport so only the stem remains on screen.
    //    Slow phase (0.65s → 2.15s): scale 6 → 16, sustains the fly-through feel during takeoff.
    const zoomStart = 0.15;
    const fastZoomEnd = 0.65;
    const slowZoomEnd = 2.15;
    let globalZoom = 1;
    if (timeInSeconds > zoomStart) {
        if (timeInSeconds < fastZoomEnd) {
            const t = (timeInSeconds - zoomStart) / (fastZoomEnd - zoomStart);
            globalZoom = 1 + Math.pow(t, 1.3) * 5;
        } else {
            const t = Math.min(1, (timeInSeconds - fastZoomEnd) / (slowZoomEnd - fastZoomEnd));
            globalZoom = 6 + Math.pow(t, 1.5) * 10;
        }
    }
    if (n) n.style.transform = "scale(" + globalZoom + ")";

    // 2. THE REALLY NICE FADE (Solid J to Filaments)
    // J dissolves into strands in the 0.15s window right before takeoff so strands are
    // fully opaque at t=takeoffStart.
    const fadeStart = 0.65;
    const fadeEnd = 0.8;
    
    let solidOpacity = 1;
    let strandOpacity = 0;
    if (timeInSeconds > fadeStart) {
        const progress = Math.min(1, (timeInSeconds - fadeStart) / (fadeEnd - fadeStart));
        solidOpacity = 1 - progress;
        strandOpacity = progress;
    }
    helpers.forEach(h => h.style.opacity = solidOpacity.toString());

    // 3. PERFECT FILAMENT PHYSICS & COLOR REVEAL
    // Takeoff begins the moment J finishes dissolving. Red overlay lingers for 200ms of
    // pure red strands before colors emerge — this is the "J split into fine red lines" beat.
    const takeoffStart = 0.8;
    const colorRevealStart = 1.0;
    const colorRevealDuration = 0.5;

    if (timeInSeconds > colorRevealStart) {
        const colorProgress = Math.min(1, (timeInSeconds - colorRevealStart) / colorRevealDuration);
        if (lumieres) lumieres.style.setProperty('--red-ratio', (1 - colorProgress).toString());
    } else {
        if (lumieres) lumieres.style.setProperty('--red-ratio', "1");
    }

    lamps.forEach(lamp => {
        const isLogo = lamp.classList.contains('logo-strand');
        const left = parseFloat(lamp.getAttribute('data-left'));
        const delay = parseFloat(lamp.getAttribute('data-delay'));
        const speed = parseFloat(lamp.getAttribute('data-speed'));
        const zStart = parseFloat(lamp.getAttribute('data-zstart'));
        
        // Before takeoff, logo strands crossfade in smoothly (they are pure red thanks to --red-ratio)
        if (timeInSeconds < takeoffStart) {
            lamp.style.transform = "translateZ(0px) translateX(0px)";
            lamp.style.opacity = isLogo ? strandOpacity.toString() : "0";
            return;
        }

        // Takeoff physics
        const globalT = (timeInSeconds - takeoffStart) / 5.2; 
        const localT = (globalT - (delay * 0.3)) * speed;
        
        if (localT <= 0) {
            // Still locked in place on the J plane
            lamp.style.transform = "translateZ(0px) translateX(0px)";
            lamp.style.opacity = isLogo ? "1" : "0";
        } else {
            // Fly through Z space independently 
            const fZ = zStart + (localT * 12000);
            
            // Bloom: Filaments spread outwards
            const spreadX = (left - 50) * localT * 2.0;
            lamp.style.transform = "translateZ(" + fZ + "px) translateX(" + spreadX + "px)";
            
            // Opacity envelope on both logo and atmosphere — ramp in over 120ms of their own
            // local time. Previously logo strands skipped this and popped at full opacity, which
            // stacked 800 sudden-ons into a visible flash right after takeoff.
            let op = localT < 0.12 ? (localT/0.12) : 1;
            
            // Proximity Culling: Fades out nicely as it hits the camera
            if (fZ > 800) op = Math.min(op, Math.max(0, 1 - (fZ - 800) / 200));
            
            lamp.style.opacity = op.toString();
        }
    });
};`;

const html = `<!DOCTYPE html>
<html>
<head><style>${finalStyles}</style></head>
<body>
    <div class="netflix-intro-wrapper">
        <div class="netflix-n">
            <div class="helper helper-1"></div>
            <div class="helper helper-2"></div>
            <svg class="helper helper-3" viewBox="0 0 180 370">
                <path d="M 150 0 V 250 Q 150 350 25 350" fill="none" />
            </svg>
            <div class="effect-lumieres">${lampHtml}</div>
        </div>
    </div>
    <script>${driverScript}</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'compiled_netflix_intro.html'), html);
console.log('FINAL MASTERPIECE applied: 0 lag red strands, precise zoom, and perfect color transition.');
