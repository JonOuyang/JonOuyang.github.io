import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
import { useEffect, useRef, useState } from "react";

import { hightlightsSlides } from "../constants";
import { pauseImg, playImg, replayImg } from "../utils";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);
  const sliderContainerRef = useRef(null);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  const [loadedData, setLoadedData] = useState([]);
  const { isLastVideo, startPlay, videoId, isPlaying } = video;

  const prevVideoId = usePrevious(videoId);

  const getProgressBarWidth = () => {
    if (typeof window === "undefined") return "4vw";
    return window.innerWidth < 760 ? "10vw" : "4vw";
  };

  useGSAP(() => {
  const row = sliderContainerRef.current;          // the strip that slides left/right
  if (!row) return;

  /* 1. figure out sizes ----------------------------------------------------- */
  const slide     = row.children[videoId];         // currently-active slide element
  if (!slide) return;

  const slideW    = slide.offsetWidth;             // full width of that slide
  const gap       = parseFloat(
                      getComputedStyle(row).columnGap || "0"
                    );                             // flex gap in px
  const viewportW = row.parentElement.offsetWidth; // width of the visible area

  /* 2. pixel offset that puts this slide dead-centre ----------------------- */
  const leftEdge  = (slideW + gap) * videoId;      // where that slide starts
  const centerX   = leftEdge - (viewportW - slideW) / 2;

  /* 3. animate the row ------------------------------------------------------ */
  gsap.to(row, {
    x: -centerX,                  // negative because we move the row left
    duration: 0.8,
    ease: "power2.inOut",
  });

  /* 4. autoplay once the row is in view ------------------------------------ */
  ScrollTrigger.create({
    trigger: slide,               // watch the active slide itself
    start: "top center+=200",
    once: true,
    onEnter: () =>
      setVideo((prev) => ({ ...prev, startPlay: true, isPlaying: true })),
  });
}, [videoId]);

  useEffect(() => {
    if (prevVideoId !== undefined && prevVideoId !== videoId) {
      const prevVideo = videoRef.current[prevVideoId];
      if (prevVideo) {
        prevVideo.pause();
      }
    }

    if (loadedData.length > videoId) {
      const currentVideo = videoRef.current[videoId];
      if (!currentVideo) return;

      if (startPlay) {
        if (isPlaying) {
          currentVideo.play().catch(error => console.error("Video play failed:", error));
        } else {
          currentVideo.pause();
        }
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData, prevVideoId]);

  // --- PROGRESS BAR EFFECT ---
  useEffect(() => {
    videoRef.current.forEach((_, i) => {
      if (i !== videoId) {
        const span = videoSpanRef.current[i];
        const div = videoDivRef.current[i];
        if (span && div) {
          gsap.to(span, { width: '0%', backgroundColor: '#afafaf', duration: 0.3 });
          gsap.to(div, { width: '12px', duration: 0.3 });
        }
      }
    });

    const currentVideo = videoRef.current[videoId];
    const currentSpan = videoSpanRef.current[videoId];
    if (!currentVideo || !currentSpan) return;
    
    const updateProgress = () => {
      if (currentVideo.duration) {
        const progress = (currentVideo.currentTime / currentVideo.duration);
        const progressPercentage = Math.max(0, Math.min(1, progress)) * 100;
        gsap.to(currentSpan, {
            width: `${progressPercentage}%`,
            ease: "none",
        });
      }
    };

    if (isPlaying) {
      gsap.to(videoDivRef.current[videoId], {
        width: getProgressBarWidth(),
        duration: 0.3,
      });
      gsap.to(currentSpan, { backgroundColor: 'white', duration: 0.3 });
      gsap.ticker.add(updateProgress);
    } else {
      gsap.ticker.remove(updateProgress);
    }
    
    return () => {
      gsap.ticker.remove(updateProgress);
    };

  }, [videoId, isPlaying]);

  const handleProcess = (type, i) => {
    switch (type) {
      case "video-end":
        setVideo((pre) => ({ ...pre, videoId: i + 1 }));
        break;
      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true, isPlaying: false }));
        break;
      case "video-reset":
        videoRef.current[0].currentTime = 0;
        setVideo({
          videoId: 0,
          isLastVideo: false,
          isPlaying: true,
          startPlay: true,
        });
        break;
      case "toggle-play-pause":
        if (isLastVideo) {
          handleProcess("video-reset");
        } else {
          setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        }
        break;
      case "video-select":
        const targetVideo = videoRef.current[i];
        if (targetVideo) {
          targetVideo.currentTime = 0;
        }
        setVideo((pre) => ({
          ...pre,
          videoId: i,
          isLastVideo: i === hightlightsSlides.length - 1,
          isPlaying: true,
        }));
        break;
      default:
        return video;
    }
  };

  const handleLoadedMetaData = (i) => {
    if (!loadedData.includes(i)) {
      setLoadedData((prev) => [...prev, i]);
    }
  };

  const lastVideoIndex = hightlightsSlides.length - 1;

  return (
    <>
      <div className="flex items-center">
        <div
          ref={sliderContainerRef}
          className="flex w-full gap-4 sm:gap-8"   /* ← visible space (8 px / 16 px) */
        >
          {hightlightsSlides.map((list, i) => (
            <div key={list.id} className="w-full flex-shrink-0">
              <div className="video-carousel_container relative pb-16">
                <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                  <video
                    id={`video-${i}`}
                    playsInline={true}
                    className={`${list.id === 2 ? "translate-x-44" : ""} pointer-events-none w-full h-full object-cover`}
                    preload="auto"
                    muted
                    ref={(el) => (videoRef.current[i] = el)}
                    onEnded={() =>
                      i !== lastVideoIndex
                        ? handleProcess("video-end", i)
                        : handleProcess("video-last")
                    }
                    onPlay={() => {
                      if (!isPlaying) setVideo((pre) => ({ ...pre, isPlaying: true }));
                    }}
                    onLoadedMetadata={() => handleLoadedMetaData(i)}
                  >
                    <source src={list.video} type="video/mp4" />
                  </video>
                </div>

                <div className="absolute bottom-0 left-0 w-full flex-center flex-col text-center">
                  {list.textLists.map((text, idx) => (
                    <p key={idx} className="text-gray-400 text-xl font-normal">
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {hightlightsSlides.map((_, i) => (
            <span
              key={`dot-${i}`}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
              ref={(el) => (videoDivRef.current[i] = el)}
              onClick={() => handleProcess("video-select", i)}
            >
              <span
                className="absolute top-0 left-0 h-full w-0 rounded-full bg-gray-400"
                ref={(el) => (videoSpanRef.current[i] = el)}
              />
            </span>
          ))}
        </div>

        <button className="control-btn" onClick={() => handleProcess("toggle-play-pause")}>
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;