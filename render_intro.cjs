const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * RENDER_INTRO.CJS
 *
 * Alternative renderer that uses the source CSS directly.
 * For the primary renderer, use compiled_renderer.cjs which renders compiled_netflix_intro.html.
 */

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const DURATION = 5.0;
const TOTAL_FRAMES = Math.ceil(FPS * DURATION);
const OUTPUT_DIR = 'temp_frames';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MP4_OUTPUT = 'public/assets/videos/netflix_intro.mp4';

async function run() {
    console.log('Starting render of Netflix J animation from source CSS...');

    if (fs.existsSync(OUTPUT_DIR)) {
        fs.rmSync(OUTPUT_DIR, { recursive: true });
    }
    fs.mkdirSync(OUTPUT_DIR);

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${WIDTH},${HEIGHT}`]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });

    const css = fs.readFileSync('src/experimental/netflix/NetflixIntro.css', 'utf8');
    const lampColors = [
        '#ff0100', '#ffde01', '#ff00cc', '#04fd8f', '#ff0100',
        '#ff9600', '#0084ff', '#f84006', '#ffc601', '#ff4800',
        '#fd0100', '#01ffff', '#ffc601', '#ffc601', '#0078fe',
        '#0080ff', '#ffae01', '#ff00bf', '#a601f4', '#f30b34',
        '#ff00bf', '#04fd8f', '#01ffff', '#a201ff', '#ec0014',
        '#0078fe', '#ff0036', '#06f98c'
    ];

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { margin: 0; padding: 0; background: black; overflow: hidden; width: ${WIDTH}px; height: ${HEIGHT}px; display: flex; align-items: center; justify-content: center; }
            ${css}
            * { animation-play-state: paused !important; }
        </style>
    </head>
    <body>
        <div class="netflix-intro-wrapper">
            <div class="netflix-n">
                <!-- Top Bar -->
                <div class="helper helper-1"></div>
                <!-- Stem with effects -->
                <div class="helper helper-2">
                    <div class="effect-brush">
                        ${Array.from({length:31}, (_, i) => `<span class="fur-${31-i}"></span>`).join('')}
                    </div>
                    <div class="effect-lumieres">
                        ${lampColors.map((c, i) => `<span class="lamp-${i+1}" style="--color: ${c}"></span>`).join('')}
                    </div>
                </div>
                <!-- Hook -->
                <div class="helper helper-3"></div>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html);

    console.log(`Capturing ${TOTAL_FRAMES} frames...`);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const time = i / FPS;
        await page.evaluate((t) => {
            document.getAnimations().forEach(anim => {
                anim.currentTime = t * 1000;
            });
        }, time);

        await page.screenshot({
            path: path.join(OUTPUT_DIR, `frame_${String(i).padStart(3, '0')}.png`)
        });
        if (i % 10 === 0) console.log(`Frame ${i}/${TOTAL_FRAMES}`);
    }

    await browser.close();

    console.log('Encoding video with FFmpeg...');
    execSync(`ffmpeg -y -r ${FPS} -i ${OUTPUT_DIR}/frame_%03d.png -c:v libx264 -pix_fmt yuv420p -crf 18 ${MP4_OUTPUT}`);

    fs.rmSync(OUTPUT_DIR, { recursive: true });
    console.log(`Success! Video saved to ${MP4_OUTPUT}`);
}

run().catch(err => {
    console.error('Error during render:', err);
    process.exit(1);
});
