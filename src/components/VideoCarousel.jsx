import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
import { useEffect, useRef, useState } from "react";

import { hightlightsSlides } from "../constants";
import { pauseImg, playImg, replayImg } from "../utils";

const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  // State for video playback and carousel position
  const [video, setVideo] = useState({
    isEnd: false, // Not strictly needed now, but kept for potential future use
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  const [loadedData, setLoadedData] = useState([]);
  const { isLastVideo, startPlay, videoId, isPlaying } = video;

  // Utility function to get target width for the expanded progress bar div
  const getProgressBarWidth = () => {
    if (typeof window === 'undefined') return '4vw'; // Default for SSR or environments without window
    return window.innerWidth < 760
      ? "10vw" // mobile
      : window.innerWidth < 1200
      ? "10vw" // tablet
      : "4vw"; // laptop
  };

  // GSAP hook for slider animation and initial play trigger
  useGSAP(() => {
    // Animate the slider container translateX based on the current videoId
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut",
    });

    // Use ScrollTrigger to trigger the start of playback when the video comes into view
    // Note: This might need adjustment depending on the exact trigger point desired
    if (videoRef.current[videoId]) {
        gsap.to(videoRef.current[videoId], { // Target the specific video element
            scrollTrigger: {
                trigger: videoRef.current[videoId], // Trigger based on the video element itself
                start: "top center+=200", // Adjust trigger point as needed
                // markers: true, // Uncomment for debugging ScrollTrigger
                toggleActions: "play pause resume pause", // Play when entering, pause when leaving
                onEnter: () => { // Force play when entering viewport if not already playing
                    if (!isPlaying) {
                        setVideo((pre) => ({ ...pre, startPlay: true, isPlaying: true }));
                    }
                },
                onLeaveBack: () => { // Pause when scrolling back up past the trigger
                     setVideo((pre) => ({ ...pre, isPlaying: false }));
                }
            },
            // No onComplete here, handle playback state via ScrollTrigger toggleActions and state
        });
    }

  }, [videoId]); // Rerun only when videoId changes

  // Effect for controlling the progress bar appearance and updates
  useEffect(() => {
    let tickerCallback = null; // To store the ticker function for removal

    // Reset all progress bars *except* the current one
    videoRef.current.forEach((_, i) => {
      const span = videoSpanRef.current[i];
      const div = videoDivRef.current[i];
      if (i !== videoId) {
        if (span) {
          gsap.to(span, {
            width: '0%',
            backgroundColor: '#afafaf',
            duration: 0.3, // Smooth transition back
          });
        }
        if (div) {
          gsap.to(div, {
            width: '12px', // Reset to dot size
            duration: 0.3, // Smooth transition back
          });
        }
      }
    });

    // Handle the *current* video's progress bar
    if (videoRef.current[videoId]) {
      const currentVideo = videoRef.current[videoId];
      const currentSpan = videoSpanRef.current[videoId];
      const currentDiv = videoDivRef.current[videoId];

      // Get duration safely after metadata is loaded
      // Using a default or checking loadedData might be needed for robustness
      const duration = currentVideo.duration || hightlightsSlides[videoId]?.videoDuration || 1; // Use optional chaining and default

      // Define the function to update progress
      tickerCallback = () => {
        if (currentVideo && currentSpan && currentDiv && currentVideo.readyState > 2) { // Check if video is ready
          const currentTime = currentVideo.currentTime;
          const progress = currentTime / duration;
          // Clamp progress between 0 and 1 to avoid visual glitches
          const progressPercentage = Math.max(0, Math.min(1, progress)) * 100;

          // Update progress bar span width and color
          gsap.to(currentSpan, {
            width: `${progressPercentage}%`,
            backgroundColor: "white", // Active color
            ease: 'none', // Linear update
            // Use a very small duration for smoother visual update if needed, or 0
            duration: 0.05
          });

          // Ensure the container div is expanded while playing/progressing
          gsap.to(currentDiv, {
            width: getProgressBarWidth(),
            ease: 'none',
             duration: 0.05
          });
        }
      };

      if (isPlaying && startPlay) {
         // Expand the div immediately when starting to play
         gsap.to(currentDiv, {
             width: getProgressBarWidth(),
             duration: 0.3
         });
         // Add the ticker function to GSAP's ticker
        gsap.ticker.add(tickerCallback);
      } else {
        // If paused or not started, remove the ticker
        gsap.ticker.remove(tickerCallback);
        // Optional: If paused, visually indicate it (e.g., change color slightly)
        // if (!isPlaying && startPlay && currentSpan) {
        //   gsap.to(currentSpan, { backgroundColor: '#ddd', duration: 0.3 });
        // }
        // If paused or not started, remove the ticker and collapse the progress bar container
        gsap.ticker.remove(tickerCallback);
        gsap.to(currentDiv, {
          width: "12px",
          duration: 0.3
        });
      }
    }

    // Cleanup function for the effect
    return () => {
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback); // Ensure ticker is removed on cleanup
      }
      // Optional: Explicitly reset the bar when component unmounts or videoId changes
      // The reset logic at the beginning of the effect handles videoId changes well.
    };

  }, [videoId, isPlaying, startPlay, loadedData]); // Dependencies that affect progress bar

  // Effect for handling video element play/pause based on state
  useEffect(() => {
    // Ensure metadata for all videos is potentially loaded before controlling playback
    // You might adjust this condition based on when you want playback control to be active
    if (loadedData.length >= hightlightsSlides.length) {
      const currentVideo = videoRef.current[videoId];
      if (!currentVideo) return;

      if (startPlay) {
        if (isPlaying) {
          // Attempt to play, handle potential promise rejection (autoplay restrictions)
          currentVideo.play().catch(error => {
            console.error("Video play failed:", error);
            // Optionally set isPlaying back to false if autoplay fails
            // setVideo(pre => ({ ...pre, isPlaying: false }));
          });
        } else {
          currentVideo.pause();
        }
      } else {
        // If startPlay is false, ensure video is paused
        currentVideo.pause();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]); // Dependencies that affect playback

  // Handler for video events and button clicks
  const handleProcess = (type, i) => {
     const currentVideoIndex = videoId; // Capture index before potential state change

    switch (type) {
      case "video-end":
        // Move to the next video
        setVideo((pre) => ({ ...pre, videoId: i + 1, isPlaying: true })); // Assume autoplay next
        break;

      case "video-last":
        // Last video finished playing
        setVideo((pre) => ({ ...pre, isLastVideo: true, isPlaying: false }));
        // Reset the last video's progress bar visually
         if (videoSpanRef.current[currentVideoIndex] && videoDivRef.current[currentVideoIndex]) {
             gsap.to(videoSpanRef.current[currentVideoIndex], { width: '0%', backgroundColor: '#afafaf', duration: 0.3 });
             gsap.to(videoDivRef.current[currentVideoIndex], { width: '12px', duration: 0.3 });
         }
        break;

      case "video-reset":
         // Reset to the first video and play
         const firstVideo = videoRef.current[0];
         if (firstVideo) {
            firstVideo.currentTime = 0; // Reset video time
         }
         setVideo((pre) => ({
           ...pre,
           videoId: 0,
           isLastVideo: false,
           isPlaying: true,
           startPlay: true, // Ensure startPlay is true
         }));
         // Explicitly play if needed, though state change should trigger effect
         // firstVideo?.play();
        break;

      case "toggle-play-pause":
          // If it's the last video and paused, replay from start
          if (isLastVideo && !isPlaying) {
              handleProcess("video-reset");
          } else {
              // Toggle playing state
              setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying, startPlay: true })); // Ensure startPlay is true when toggling play
          }
          break;

      case "video-select": // Handle clicking on a dot
        const targetVideo = videoRef.current[i];
        if (targetVideo) {
            targetVideo.currentTime = 0; // Reset time of the selected video
        }
        setVideo((pre) => ({
            ...pre,
            videoId: i, // Set the selected video index
            isLastVideo: false, // Not the last video unless it is the last index
            isPlaying: true, // Start playing the selected video
            startPlay: true,
        }));
        break;


      default:
        return video;
    }
  };

  // Handler for loadedmetadata event
  const handleLoadedMetaData = (i, e) => {
    // Avoid duplicates if event fires multiple times
    setLoadedData((prev) => {
        if (prev.some(data => data.id === i)) {
            return prev; // Already exists
        }
        return [...prev, { id: i, event: e }];
    });
  };

  // Calculate last video index dynamically
  const lastVideoIndex = hightlightsSlides.length - 1;

  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((list, i) => (
          <div key={list.id} id="slider" className="sm:pr-20 pr-10 w-full flex-shrink-0"> {/* Added w-full and flex-shrink-0 */}
            <div className="video-carousel_container">
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                <video
                  // Consider unique IDs if needed, e.g., id={`video-player-${i}`}
                  id="video" // Keep original ID if GSAP targets it generically, otherwise make unique
                  playsInline={true}
                  className={`${
                    list.id === 2 ? "translate-x-44" : "" // Example conditional style
                  } pointer-events-none w-full h-full object-cover`} // Ensure video covers container
                  preload="auto"
                  muted // Keep muted for autoplay compatibility
                  ref={(el) => (videoRef.current[i] = el)}
                  onEnded={() =>
                    // Check if it's the last video based on index
                    i !== lastVideoIndex
                      ? handleProcess("video-end", i)
                      : handleProcess("video-last")
                  }
                  onPlay={() => {
                    // Sync state if video plays due to external factors (like ScrollTrigger)
                    if (!isPlaying) {
                        setVideo((pre) => ({ ...pre, isPlaying: true, startPlay: true }));
                    }
                  }}
                  onPause={() => {
                     // Sync state if video pauses due to external factors
                    // Avoid infinite loops by checking current state
                    if (isPlaying) {
                        // setVideo((pre) => ({ ...pre, isPlaying: false })); // Be cautious with this
                    }
                  }}
                  onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                  // Add key to force re-render if src changes, though not changing here
                  key={list.video}
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>

              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text, idx) => ( // Changed key variable name
                  <p key={idx} className="md:text-2xl text-xl font-medium">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {/* Ensure map length matches the number of videos */}
          {hightlightsSlides.map((_, i) => (
            <span
              key={`dot-${i}`} // Unique key for dots
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
              ref={(el) => (videoDivRef.current[i] = el)}
              onClick={() => handleProcess("video-select", i)} // Use new handler case
            >
              <span
                className="absolute top-0 left-0 h-full w-0 rounded-full bg-gray-400" // Start with width 0
                ref={(el) => (videoSpanRef.current[i] = el)}
                // No direct onClick needed on the inner span
              />
            </span>
          ))}
        </div>

        <button className="control-btn">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={() => handleProcess("toggle-play-pause")} // Simplified toggle handler
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;