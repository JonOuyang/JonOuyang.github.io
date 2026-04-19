const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * CONSOLIDATED NETFLIX INTRO RENDERER
 * 
 * This script handles both the generation of the animation HTML and the rendering of the video.
 * It does NOT overwrite any source files.
 */

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const DURATION = 6;
const TOTAL_FRAMES = DURATION * FPS;
const OUTPUT_VIDEO = 'public/assets/videos/netflix_intro.mp4';
const TEMP_DIR = 'temp_render_frames';
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function generateAnimationHtml() {
    // Logic from fix_lamps.cjs
    const NUM_ATMOSPHERE = 200; // Increased slightly because clustering creates more negative space
    const NUM_LOGO = 350; 
    let lampHtml = '';

    // Define distinct atmosphere clusters
    const numClusters = 20;
    const clusters = [];
    for (let i = 0; i < numClusters; i++) {
        const leftCenter = Math.random() * 100;
        let colorRange;
        if (leftCenter < 35) colorRange = ['#ff0000', '#ff0000', '#8b0000']; 
        else if (leftCenter < 45) colorRange = ['#ff4500', '#ff8c00', '#ffd700']; 
        else if (leftCenter < 55) colorRange = ['#ffffff', '#ffffff', '#ffd700']; 
        else if (leftCenter < 70) colorRange = ['#00ffff', '#00ced1', '#1e90ff']; 
        else colorRange = ['#0000ff', '#0000ff', '#4b0082'];
        
        clusters.push({
            leftCenter,
            colorRange,
            zCenter: -2000 - Math.random() * 8000,
            spread: 2 + Math.random() * 4
        });
    }

    for (let i = 0; i < (NUM_ATMOSPHERE + NUM_LOGO); i++) {
        const isLogo = i < NUM_LOGO;
        let left, top, height, colorRange, zStart;
        const rand = Math.random();
        
        if (isLogo) {
            // ONLY STEM: 42.5-57.5% width, 0-62% height
            left = 42.5 + Math.random() * 15; 
            top = 0; 
            height = 62;
            
            zStart = 0;
            // Center the color spectrum on the stem width (15% total width)
            const relX = (left - 42.5) / 15; // 0 to 1 across the stem
            
            if (relX < 0.2) colorRange = ['#ff0000', '#ff0000', '#8b0000']; 
            else if (relX < 0.4) colorRange = ['#ff4500', '#ff8c00', '#ffd700']; 
            else if (relX < 0.6) colorRange = ['#ffffff', '#ffffff', '#ffd700']; 
            else if (relX < 0.8) colorRange = ['#00ffff', '#00ced1', '#1e90ff']; 
            else colorRange = ['#0000ff', '#0000ff', '#4b0082']; 
        } else {
            // Atmosphere strands are clustered
            const cluster = clusters[Math.floor(Math.random() * clusters.length)];
            left = cluster.leftCenter + (Math.random() - 0.5) * cluster.spread;
            zStart = cluster.zCenter + (Math.random() - 0.5) * 1500;
            colorRange = cluster.colorRange;
            top = -100;
            height = 300;
        }

        const delay = (0.1 + Math.random() * 0.4).toFixed(4);
        const speed = (0.7 + Math.random() * 1.6).toFixed(2);
        
        const hasCore = Math.random() > 0.4;
        const coreClass = hasCore ? 'lamp-core' : 'lamp-no-core';

        lampHtml += `<div class="lamp-container ${isLogo ? 'logo-strand' : 'atmosphere-strand'}" 
            data-left="${left.toFixed(4)}" data-delay="${delay}" data-speed="${speed}" data-zstart="${zStart}"
            style="left: ${left.toFixed(4)}%; top: ${isLogo ? top + '%' : '-100vh'}; height: ${isLogo ? height + '%' : '300vh'}">
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
        .helper { position: absolute; }
        .helper-1 { width: 100%; height: 15%; background: #e40913; top: 0; }
        .helper-2 { width: 15%; height: 62%; left: 42.5%; top: 0; background: #e40913; }
        .helper-3 { left: 0; top: 0; width: 60%; height: 100%; }
        .helper-3 path { stroke: #e40913; stroke-width: 45; stroke-linecap: butt; stroke-linejoin: round; }
        .effect-lumieres { position: absolute; inset: 0; transform-style: preserve-3d; z-index: 20; }
        .lamp-container { position: absolute; width: 1.5px; height: 100%; transform-style: preserve-3d; mix-blend-mode: normal; opacity: 0; }
        .lamp-glow { position: absolute; width: 100%; height: 100%; filter: blur(1.5px) saturate(2); opacity: 0.8; }
        .lamp-core { position: absolute; width: 0.3px; height: 100%; left: 50%; transform: translateX(-50%); background: white; box-shadow: 0 0 3px 0.5px white; opacity: 0.6; }
        .lamp-no-core { display: none; }
    `;

    const driverScript = `window.seekTo = (timeInSeconds) => {
        const n = document.querySelector(".netflix-n");
        const helpers = document.querySelectorAll(".helper");
        const lamps = document.querySelectorAll(".lamp-container");
        let globalZoom = 1;
        if (timeInSeconds > 0.65) {
            const t = Math.max(0, Math.min(1, (timeInSeconds - 0.65) / 1.5)); 
            globalZoom = 1 + Math.pow(t, 3.5) * 12;
        }
        if (n) n.style.transform = "scale(" + globalZoom + ")";

        // FADE SOLID PARTS (Helpers)
        // Fade starts later (0.85s), gone by 0.95s
        const fadeStart = 0.85;
        const fadeEnd = 0.95;
        if (timeInSeconds < fadeStart) {
            helpers.forEach(h => h.style.opacity = "1");
        } else {
            const progress = Math.min(1, (timeInSeconds - fadeStart) / (fadeEnd - fadeStart));
            helpers.forEach(h => h.style.opacity = (1 - progress).toString());
        }

        // FADE AND MOVE FILAMENTS (Lamps)
        const takeoffStart = 0.90; 
        const filamentRevealStart = 0.80; 

        lamps.forEach(lamp => {
            const isLogo = lamp.classList.contains('logo-strand');
            const left = parseFloat(lamp.getAttribute('data-left'));
            const delay = parseFloat(lamp.getAttribute('data-delay'));
            const speed = parseFloat(lamp.getAttribute('data-speed'));
            const zStart = parseFloat(lamp.getAttribute('data-zstart'));
            
            // 1. Atmosphere strands only reveal at/after takeoff
            if (!isLogo && timeInSeconds < takeoffStart) {
                lamp.style.opacity = "0";
                return;
            }

            // 2. Logo strands reveal earlier (static first)
            if (isLogo && timeInSeconds < filamentRevealStart) {
                lamp.style.opacity = "0";
                return;
            }

            // 3. Calculate 3D Motion (only after takeoffStart)
            const motionT = timeInSeconds > takeoffStart ? (timeInSeconds - takeoffStart) / 5.15 : 0;
            const localMotionT = (motionT - (delay * 0.3)) * speed;
            
            if (localMotionT <= 0) {
                // If we haven't started moving, lock to the J
                lamp.style.transform = "translateZ(0px) translateX(0px)";
                // Fade logo filaments in quickly at the splinter start
                if (isLogo) {
                    const opFade = Math.min(1, (timeInSeconds - filamentRevealStart) / 0.1);
                    lamp.style.opacity = opFade.toString();
                } else {
                    lamp.style.opacity = "0";
                }
            } else {
                // Flying through Z space
                const fZ = zStart + (localMotionT * 12000);
                const spreadX = (left - 50) * localMotionT * 2.0;
                lamp.style.transform = "translateZ(" + fZ + "px) translateX(" + spreadX + "px)";
                
                let op = localMotionT < 0.15 ? (localMotionT/0.15) : 1;
                if (fZ > 800) op = Math.min(op, Math.max(0, 1 - (fZ - 800) / 200));
                lamp.style.opacity = op.toString();
            }
        });
    };`;

    return `<!DOCTYPE html>
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
}

async function render() {
    console.log('Starting Netflix Intro Render...');

    let html;
    const inputHtmlFile = process.argv[2];
    if (inputHtmlFile && fs.existsSync(inputHtmlFile)) {
        console.log(`Using input HTML file: ${inputHtmlFile}`);
        html = fs.readFileSync(inputHtmlFile, 'utf8');
    } else {
        console.log('Generating animation HTML from built-in masterpiece logic...');
        html = generateAnimationHtml();
        // We do NOT write this to a file to avoid wiping user code.
    }

    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${WIDTH},${HEIGHT}`]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    await page.setContent(html);

    console.log(`Rendering ${TOTAL_FRAMES} frames...`);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const time = i / FPS;
        await page.evaluate((t) => {
            if (window.seekTo) {
                window.seekTo(t);
            } else {
                // Fallback for animations using CSS animations
                document.getAnimations().forEach(anim => {
                    anim.currentTime = t * 1000;
                });
            }
        }, time);

        const framePath = path.join(TEMP_DIR, `frame_${String(i).padStart(3, '0')}.png`);
        await page.screenshot({ path: framePath });
        if (i % 30 === 0) console.log(`Frame ${i}/${TOTAL_FRAMES}`);
    }

    await browser.close();

    console.log("Encoding video with FFmpeg...");
    try {
        if (!fs.existsSync(path.dirname(OUTPUT_VIDEO))) {
            fs.mkdirSync(path.dirname(OUTPUT_VIDEO), { recursive: true });
        }
        execSync(`ffmpeg -y -framerate ${FPS} -i ${TEMP_DIR}/frame_%03d.png -c:v libx264 -pix_fmt yuv420p -crf 18 ${OUTPUT_VIDEO}`);
        console.log(`Success! Video saved to: ${OUTPUT_VIDEO}`);
    } catch (err) {
        console.error("FFmpeg error:", err.message);
    } finally {
        // Cleanup
        console.log("Cleaning up temporary frames...");
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
}

render().catch(err => {
    console.error('Error during render:', err);
    process.exit(1);
});
