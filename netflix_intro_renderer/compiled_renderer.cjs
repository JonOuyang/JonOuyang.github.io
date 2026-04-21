const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, 'compiled_netflix_intro.html');
const TEMP_DIR = path.join(__dirname, 'temp_frames');
const OUTPUT_VIDEO = path.join(__dirname, '..', 'public', 'assets', 'videos', 'netflix_intro.mp4');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  await page.goto('file://' + HTML_PATH);

  const duration = 6;
  const fps = 30;
  const totalFrames = duration * fps;

  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TEMP_DIR);

  console.log(`Rendering ${totalFrames} frames...`);

  for (let i = 0; i < totalFrames; i++) {
    const time = i / fps;
    await page.evaluate((t) => window.seekTo(t), time);
    const framePath = path.join(TEMP_DIR, `frame_${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: framePath });
    if (i % 30 === 0) console.log(`Frame ${i}/${totalFrames}`);
  }

  await browser.close();

  console.log("Encoding video with FFmpeg...");
  try {
    execSync(`ffmpeg -y -framerate ${fps} -i "${path.join(TEMP_DIR, 'frame_%03d.png')}" -c:v libx264 -pix_fmt yuv420p -crf 18 "${OUTPUT_VIDEO}"`);
    console.log(`Success! Video saved to: ${OUTPUT_VIDEO}`);
  } catch (err) {
    console.error("FFmpeg error:", err.message);
    process.exit(1);
  }

  // Clean up frame scratch directory — it's regenerated on every run.
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
})();
