import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { heroVideo, smallHeroVideo } from '../utils';
import { useEffect, useState } from 'react';

const Hero = () => {
  const [videoSrc, setVideoSrc] = useState(
    window.innerWidth < 760 ? smallHeroVideo : heroVideo
  );

  const handleVideoSrcSet = () => {
    if (window.innerWidth < 760) {
      setVideoSrc(smallHeroVideo);
    } else {
      setVideoSrc(heroVideo);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleVideoSrcSet);

    return () => {
      window.removeEventListener('resize', handleVideoSrcSet);
    };
  }, []);

  useGSAP(() => {
    gsap.to('#hero-video', { opacity: 1, duration: 0.5, delay: 0.3 });
    gsap.to('#hero', { opacity: 1, delay: 2 });
    gsap.to('#cta', { opacity: 1, y: 70, delay: 5 });
  }, []);

  return (
    <section className="w-full nav-height bg-black relative">
      <div className="h-5/6 w-full flex-center flex-col">
        {/* <p id="hero" className="px-10 mb-4 text-center text-sm md:text-base text-gray-400">Gemini Competition Winner | Research @ Stanford, UCLA | SWE @ Amazon | CS @ UCLA</p> */}
        <div className="md:w-10/12 w-9/12">
            <video
              id="hero-video"
              className="pointer-events-none opacity-0 w-full"
              autoPlay
              muted
              playsInline
              key={videoSrc}
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse closest-side, white 95%, transparent 100%)',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                WebkitMaskSize: '100% 100%',
                maskImage: 'radial-gradient(ellipse closest-side, white 80%, transparent 100%)',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: '100% 100%',
              }}
            >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>

      <div id="cta" className="flex flex-col items-center opacity-0 translate-y-20">
        {/* <a href="#highlights" className="btn">See Career Highlights</a> */}
        <p className="font-normal text-xl text-gray-500">
          Scroll Down or Use the Navigation Bar!
        </p>
      </div>
    </section>
  );
};

export default Hero;
