import React, { useState, useEffect, useRef, useCallback } from 'react';

const COLS_PER_SET = 5;
const TOTAL_SETS = 2; // 2 sets cover full 100vw seamless loop without decoder overload

// Video sources: each clump has its OWN unique video so NO video is ever duplicated
const TRIPTYCH_VIDEOS = {
  v1: '/assets/videos/personal-website-highlight5.mp4', // Stanford robotics (2.6MB)
  v2: '/assets/videos/personal-website-highlight2.mp4', // Bookshelf interview (2.3MB)
};

const WIDE_VIDEOS = {
  v1: '/assets/videos/hero.mp4', // Abstract geometric loop (2.8MB)
};

const ACCENT_VIDEOS = {
  v1: '/assets/videos/explore.mp4', // Micro detail (4.6MB)
};

// Refined palette of blue-ish silver gradients (metallic silver-platinum with cool icy blue sheens)
const BLUE_SILVER_GRADIENTS = [
  // 0: Liquid Silver-Blue (bright silver face, soft steel blue falloff)
  'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #93c5fd 80%, #64748b 100%)',
  // 1: Platinum Ice Blue (high-key crisp metallic shimmer)
  'linear-gradient(150deg, #ffffff 0%, #f1f5f9 25%, #dbeafe 55%, #94a3b8 80%, #3b82f6 100%)',
  // 2: Metallic Steel Blue (modern automotive brushed steel with azure tint)
  'linear-gradient(140deg, #e2e8f0 0%, #cbd5e1 30%, #94a3b8 65%, #60a5fa 90%, #475569 100%)',
  // 3: Brushed Titanium Mist (subtle satin silver with sky-blue specular)
  'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 35%, #94a3b8 65%, #38bdf8 85%, #64748b 100%)',
  // 4: Frosted Cobalt Silver (luminous white silver with cool cobalt reflection)
  'linear-gradient(160deg, #ffffff 0%, #e2e8f0 30%, #bfdbfe 60%, #94a3b8 85%, #475569 100%)',
];

// Initial state inspired directly by the reference video:
// A rich mosaic of multi-panel video window + blue-silver gradient panels
const INITIAL_CARD_STATES = {
  // Triptych (2&7, 3&8, 4&9): 2 video panels + 1 blue-silver gradient panel
  '2_7': 'v1',
  '3_8': 'v1',
  '4_9': 'gradient',

  // Bottom row (12, 13, 14): tasteful mix of blue-silver gradients and dark panels
  '12': 'gradient',
  '13': 'black',
  '14': 'v_accent',

  // Right block (5, 1, 10, 6, 15&11)
  '5': 'gradient',
  '1': 'black',
  '10': 'black',
  '6': 'gradient',
  '15_11': 'v1',
};

// Specific gradient preset mapping for each card key to create harmonious visual rhythm
const CARD_GRADIENT_MAP = {
  '2_7': 1,
  '3_8': 2,
  '4_9': 0,
  '12': 3,
  '13': 2,
  '14': 4,
  '5': 4,
  '1': 0,
  '10': 3,
  '6': 1,
  '15_11': 2,
};

const RectanglePage = () => {
  const [cardStates, setCardStates] = useState(INITIAL_CARD_STATES);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const scheduleTimeout = useCallback((fn, delayMs) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delayMs);
    timersRef.current.push(id);
    return id;
  }, []);

  // Frame-by-frame staggered choreography matching the reference video:
  // In the reference, the 3 tall panels alternate between:
  // - 2 panels video + 1 panel gradient
  // - occasional full 3-panel video reveal
  // - single panel transitions into gradient, then into the next video
  useEffect(() => {
    let active = true;

    // Ordered sequence of organic choreographies modeled after the reference video
    const choreoSteps = [
      // Step 0: Panels 2&7 and 3&8 show Video 1, 4&9 is blue-silver gradient
      { '2_7': 'v1', '3_8': 'v1', '4_9': 'gradient', '12': 'gradient', '6': 'gradient' },
      // Step 1: Panel 2&7 stays Video 1, 3&8 turns to gradient, 4&9 reveals Video 2
      { '2_7': 'v1', '3_8': 'gradient', '4_9': 'v2', '12': 'black', '6': 'gradient' },
      // Step 2: FULL REVEAL of Video 2 across all 3 panels (satisfying alignment moment)
      { '2_7': 'v2', '3_8': 'v2', '4_9': 'v2', '12': 'gradient', '6': 'black' },
      // Step 3: Panel 2&7 turns to blue-silver gradient, 3&8 and 4&9 stay on Video 2
      { '2_7': 'gradient', '3_8': 'v2', '4_9': 'v2', '12': 'gradient', '6': 'gradient' },
      // Step 4: Panel 2&7 reveals Video 1, 3&8 stays Video 2, 4&9 turns to gradient
      { '2_7': 'v1', '3_8': 'v2', '4_9': 'gradient', '12': 'black', '6': 'gradient' },
      // Step 5: FULL REVEAL of Video 1 across all 3 panels
      { '2_7': 'v1', '3_8': 'v1', '4_9': 'v1', '12': 'gradient', '6': 'black' },
    ];

    let stepIdx = 0;

    const runChoreography = () => {
      if (!active) return;

      const currentStep = choreoSteps[stepIdx];
      setCardStates((prev) => ({
        ...prev,
        ...currentStep,
      }));

      // If this step is a full 3-panel reveal, hold it longer (4.5s) for the viewer to enjoy
      const isFullReveal =
        currentStep['2_7'] === currentStep['3_8'] &&
        currentStep['3_8'] === currentStep['4_9'] &&
        currentStep['2_7'] !== 'gradient';

      const holdDuration = isFullReveal ? 4500 : 2800 + Math.random() * 800;

      stepIdx = (stepIdx + 1) % choreoSteps.length;

      scheduleTimeout(runChoreography, holdDuration);
    };

    scheduleTimeout(runChoreography, 3000);

    return () => {
      active = false;
    };
  }, [scheduleTimeout]);

  // Click handler to manually toggle any card state for instant testing
  const toggleCard = (cardKey) => {
    setCardStates((prev) => {
      const current = prev[cardKey];
      let next;
      if (current === 'v1') next = 'gradient';
      else if (current === 'gradient') next = 'v2';
      else if (current === 'v2') next = 'v1';
      else if (current === 'black') next = 'gradient';
      else next = 'gradient';
      return { ...prev, [cardKey]: next };
    });
  };

  /**
   * Triptych Card Component:
   * Shares one contiguous spatial window across columns 0, 1, 2.
   * Only mounts active videos to guarantee zero crash and zero duplicate decoders.
   */
  const TriptychCard = ({ cardKey, offsetX, label }) => {
    const state = cardStates[cardKey] || 'v1';
    const isGradient = state === 'gradient';
    const isV1 = state === 'v1';
    const isV2 = state === 'v2';
    const gradientIdx = CARD_GRADIENT_MAP[cardKey] ?? 0;

    return (
      <div
        onClick={() => toggleCard(cardKey)}
        className="relative w-full h-full overflow-hidden cursor-pointer select-none bg-black group"
      >
        {/* Video 1 slice */}
        {isV1 && (
          <div className="absolute inset-0 pointer-events-none animate-fadeIn">
            <div
              className="absolute top-0"
              style={{
                width: 'var(--triptych-w)',
                height: '100%',
                left: offsetX,
              }}
            >
              <div className="parallax-inner w-full h-full">
                <video
                  src={TRIPTYCH_VIDEOS.v1}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Video 2 slice */}
        {isV2 && (
          <div className="absolute inset-0 pointer-events-none animate-fadeIn">
            <div
              className="absolute top-0"
              style={{
                width: 'var(--triptych-w)',
                height: '100%',
                left: offsetX,
              }}
            >
              <div className="parallax-inner w-full h-full">
                <video
                  src={TRIPTYCH_VIDEOS.v2}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Blue-ish Silver Gradient Layer */}
        <div
          className="absolute inset-0 blue-silver-gradient transition-opacity duration-700 ease-in-out pointer-events-none"
          style={{
            backgroundImage: BLUE_SILVER_GRADIENTS[gradientIdx],
            opacity: isGradient ? 1 : 0,
          }}
        />

        {/* Subtle hover label */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200 pointer-events-none flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-80 transition-opacity duration-200 text-[11px] font-mono tracking-widest text-slate-900 bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
            {label} · {state.toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  /**
   * Wide Merged Card (15 & 11) with its own unique video or blue-silver gradient
   */
  const WideCard = ({ cardKey, label }) => {
    const state = cardStates[cardKey] || 'v1';
    const isGradient = state === 'gradient';
    const isV1 = state === 'v1';
    const gradientIdx = CARD_GRADIENT_MAP[cardKey] ?? 2;

    return (
      <div
        onClick={() => toggleCard(cardKey)}
        className="relative w-full h-full overflow-hidden cursor-pointer select-none bg-black group"
      >
        {isV1 && (
          <div className="absolute inset-0 pointer-events-none animate-fadeIn">
            <div className="parallax-inner w-full h-full">
              <video
                src={WIDE_VIDEOS.v1}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Blue-ish Silver Gradient Layer */}
        <div
          className="absolute inset-0 blue-silver-gradient transition-opacity duration-700 ease-in-out pointer-events-none"
          style={{
            backgroundImage: BLUE_SILVER_GRADIENTS[gradientIdx],
            opacity: isGradient ? 1 : 0,
          }}
        />

        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200 pointer-events-none flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-80 transition-opacity duration-200 text-[11px] font-mono tracking-widest text-slate-900 bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
            {label} · {state.toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  /**
   * Single Cell Component:
   * Displays blue-silver gradient, subtle black card, or accent video slice
   */
  const SingleCard = ({ cardKey, label }) => {
    const state = cardStates[cardKey] || 'black';
    const isGradient = state === 'gradient';
    const isAccentVideo = state === 'v_accent';
    const gradientIdx = CARD_GRADIENT_MAP[cardKey] ?? 0;

    return (
      <div
        onClick={() => toggleCard(cardKey)}
        className="relative w-full h-full overflow-hidden cursor-pointer select-none bg-black group flex items-center justify-center"
      >
        {/* Accent video if active */}
        {isAccentVideo && (
          <div className="absolute inset-0 pointer-events-none animate-fadeIn">
            <div className="parallax-inner w-full h-full">
              <video
                src={ACCENT_VIDEOS.v1}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Blue-ish Silver Gradient */}
        <div
          className="absolute inset-0 blue-silver-gradient transition-opacity duration-700 ease-in-out pointer-events-none"
          style={{
            backgroundImage: BLUE_SILVER_GRADIENTS[gradientIdx],
            opacity: isGradient ? 1 : 0,
          }}
        />

        <span
          className={`text-xs font-mono transition-colors duration-200 z-10 ${
            isGradient
              ? 'text-slate-600/60 group-hover:text-slate-900'
              : 'text-white/20 group-hover:text-white/60'
          }`}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden z-0 select-none">
      <style>{`
        :root {
          --gap: 6px;
          --col-w: calc((100vw - 4 * var(--gap)) / 5);
          --step: calc(var(--col-w) + var(--gap));
          --set-w: calc(${COLS_PER_SET} * var(--step));
          --row-h: calc((100vh - 2 * var(--gap)) / 3);
          --merged-h: calc(2 * var(--row-h) + var(--gap));
          --double-w: calc(2 * var(--col-w) + var(--gap));
          --triptych-w: calc(3 * var(--col-w) + 2 * var(--gap));
        }

        /* Lateral carousel track movement (80s rightward linear) */
        @keyframes rotateRight {
          0% {
            transform: translate3d(calc(-1 * var(--set-w)), 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .loop-track {
          animation: rotateRight 80s linear infinite;
          will-change: transform;
        }

        /* Option B: Co-moving sliding window parallax */
        @keyframes parallaxOptionB {
          0% {
            transform: translate3d(calc(0.05 * var(--set-w)), 0, 0) scale(1.08);
          }
          50% {
            transform: translate3d(calc(-0.05 * var(--set-w)), 0, 0) scale(1.08);
          }
          100% {
            transform: translate3d(calc(0.05 * var(--set-w)), 0, 0) scale(1.08);
          }
        }

        .parallax-inner {
          animation: parallaxOptionB 40s ease-in-out infinite;
          will-change: transform;
        }

        /* Shimmering blue-ish silver gradient animation */
        .blue-silver-gradient {
          background-size: 200% 200%;
          animation: silverShimmer 12s ease infinite alternate;
        }

        @keyframes silverShimmer {
          0% {
            background-position: 0% 40%;
          }
          50% {
            background-position: 100% 60%;
          }
          100% {
            background-position: 0% 40%;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out forwards;
        }
      `}</style>

      {/* Looping carousel track */}
      <div className="loop-track flex h-full" style={{ gap: 'var(--gap)' }}>
        {Array.from({ length: TOTAL_SETS }).map((_, setIdx) => (
          <React.Fragment key={setIdx}>
            {/* Column 1: Merged (Box 2 & 7), Box 12 */}
            <div
              className="flex flex-col h-full shrink-0"
              style={{ width: 'var(--col-w)', gap: 'var(--gap)' }}
            >
              {/* Box 2 & 7: Clump 1 (Triptych Col 0) */}
              <div
                style={{ height: 'var(--merged-h)' }}
                className="bg-black rounded-t-none rounded-b-xl overflow-hidden"
              >
                <TriptychCard
                  cardKey="2_7"
                  offsetX="0px"
                  label="2 & 7"
                />
              </div>

              {/* Box 12: Bottom single cell */}
              <div
                style={{ height: 'var(--row-h)' }}
                className="bg-black rounded-b-none rounded-t-xl overflow-hidden"
              >
                <SingleCard cardKey="12" label="12" />
              </div>
            </div>

            {/* Column 2: Merged (Box 3 & 8), Box 13 */}
            <div
              className="flex flex-col h-full shrink-0"
              style={{ width: 'var(--col-w)', gap: 'var(--gap)' }}
            >
              {/* Box 3 & 8: Clump 1 (Triptych Col 1) */}
              <div
                style={{ height: 'var(--merged-h)' }}
                className="bg-black rounded-t-none rounded-b-xl overflow-hidden"
              >
                <TriptychCard
                  cardKey="3_8"
                  offsetX="calc(-1 * var(--step))"
                  label="3 & 8"
                />
              </div>

              {/* Box 13: Bottom single cell */}
              <div
                style={{ height: 'var(--row-h)' }}
                className="bg-black rounded-b-none rounded-t-xl overflow-hidden"
              >
                <SingleCard cardKey="13" label="13" />
              </div>
            </div>

            {/* Column 3: Merged (Box 4 & 9), Box 14 */}
            <div
              className="flex flex-col h-full shrink-0"
              style={{ width: 'var(--col-w)', gap: 'var(--gap)' }}
            >
              {/* Box 4 & 9: Clump 1 (Triptych Col 2) */}
              <div
                style={{ height: 'var(--merged-h)' }}
                className="bg-black rounded-t-none rounded-b-xl overflow-hidden"
              >
                <TriptychCard
                  cardKey="4_9"
                  offsetX="calc(-2 * var(--step))"
                  label="4 & 9"
                />
              </div>

              {/* Box 14: Bottom single cell */}
              <div
                style={{ height: 'var(--row-h)' }}
                className="bg-black rounded-b-none rounded-t-xl overflow-hidden"
              >
                <SingleCard cardKey="14" label="14" />
              </div>
            </div>

            {/* Block 4 & 0 (Columns 3 & 4): Top (Box 5 & 1), Mid (Box 10 & 6), Bottom Merged (Box 15 & 11) */}
            <div
              className="flex flex-col h-full shrink-0"
              style={{ width: 'var(--double-w)', gap: 'var(--gap)' }}
            >
              {/* Row 0: Box 5 and Box 1 */}
              <div className="flex w-full" style={{ height: 'var(--row-h)', gap: 'var(--gap)' }}>
                <div
                  style={{ width: 'var(--col-w)' }}
                  className="bg-black rounded-t-none rounded-b-xl overflow-hidden"
                >
                  <SingleCard cardKey="5" label="5" />
                </div>
                <div
                  style={{ width: 'var(--col-w)' }}
                  className="bg-black rounded-t-none rounded-b-xl overflow-hidden"
                >
                  <SingleCard cardKey="1" label="1" />
                </div>
              </div>

              {/* Row 1: Box 10 and Box 6 */}
              <div className="flex w-full" style={{ height: 'var(--row-h)', gap: 'var(--gap)' }}>
                <div
                  style={{ width: 'var(--col-w)' }}
                  className="bg-black rounded-xl overflow-hidden"
                >
                  <SingleCard cardKey="10" label="10" />
                </div>
                <div
                  style={{ width: 'var(--col-w)' }}
                  className="bg-black rounded-xl overflow-hidden"
                >
                  <SingleCard cardKey="6" label="6" />
                </div>
              </div>

              {/* Row 2: Merged Box 15 & 11 (horizontal wide box spanning both columns) */}
              <div
                style={{ height: 'var(--row-h)' }}
                className="w-full bg-black rounded-b-none rounded-t-xl overflow-hidden"
              >
                <WideCard cardKey="15_11" label="15 & 11" />
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RectanglePage;



