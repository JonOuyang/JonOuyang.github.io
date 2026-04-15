const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * COMPILED_RENDERER.CJS
 * 
 * This script renders YOUR existing 'compiled_netflix_intro.html' 
 * frame-by-frame using Puppeteer and encodes it to MP4.
 */

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const DURATION = 4.0;
const TOTAL_FRAMES = Math.ceil(FPS * DURATION);
const OUTPUT_DIR = 'temp_frames';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MP4_OUTPUT = 'public/assets/videos/netflix_intro.mp4';
const SOURCE_HTML = 'compiled_netflix_intro.html';

async function run() {
    if (!fs.existsSync(SOURCE_HTML)) {
        console.error('Error: ' + SOURCE_HTML + ' not found!');
        process.exit(1);
    }

    console.log('Rendering frames from ' + SOURCE_HTML + '...');

    if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
    fs.mkdirSync(OUTPUT_DIR);

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=' + WIDTH + ',' + HEIGHT]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    
    // Load your local file
    await page.goto('file://' + path.resolve(SOURCE_HTML));
    
    console.log('Capturing ' + TOTAL_FRAMES + ' frames...');
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        const time = i / FPS;
        // This calls the seekTo function you have in your HTML
        await page.evaluate((t) => window.seekTo(t), time);

        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'frame_' + String(i).padStart(3, '0') + '.png')
        });
        if (i % 15 === 0) console.log('Frame ' + i + '/' + TOTAL_FRAMES);
    }

    await browser.close();

    console.log('Encoding video with FFmpeg...');
    execSync('ffmpeg -y -r ' + FPS + ' -i ' + OUTPUT_DIR + '/frame_%03d.png -c:v libx264 -pix_fmt yuv420p -crf 18 ' + MP4_OUTPUT);
    
    fs.rmSync(OUTPUT_DIR, { recursive: true });
    console.log('Success! Video saved to: ' + MP4_OUTPUT);
}

run().catch(err => {
    console.error('Error during render:', err);
    process.exit(1);
});
