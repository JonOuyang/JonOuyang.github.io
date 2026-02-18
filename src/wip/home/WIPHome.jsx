import React, { useMemo } from 'react';
import './WIPHome.css';

const SIDES = 48;
const RADIUS = 760;
const VIDEO_SRC = '/assets/videos/armfold_6p30_to_7p30.MOV';
const START_ROTATION_DEG = -40;
const STOP_ROTATION_DEG = -10;
const LAST_NAME = 'JONATHAN';
const LETTER_REVEAL_ORDER = [2, 0, 5, 1, 6, 3, 7, 4];

function makeFace(index) {
  if (index === 0) {
    return {
      type: 'name',
      title: 'UCLA',
      subtitle: 'CHRISTOPHER',
    };
  }

  if (index === 1) {
    return {
      type: 'player',
      title: 'SECONDARY PFP',
      video: VIDEO_SRC,
    };
  }

  return { type: 'empty' };
}

export default function WIPHome() {
  const faces = useMemo(() => {
    return Array.from({ length: SIDES }, (_, index) => {
      const angle = (360 / SIDES) * index;
      return {
        id: `face-${index}`,
        index,
        style: {
          transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
        },
        content: makeFace(index),
      };
    });
  }, []);

  const lastNameLetters = useMemo(() => {
    return LAST_NAME.split('').map((char, index) => {
      const order = LETTER_REVEAL_ORDER.indexOf(index);
      const step = order < 0 ? index : order;
      const outlineDelayMs = 180 + step * 30;
      const fillDelayMs = outlineDelayMs + 360;

      return {
        key: `last-name-letter-${index}`,
        char,
        style: {
          '--outline-delay': `${outlineDelayMs}ms`,
          '--fill-delay': `${fillDelayMs}ms`,
        },
      };
    });
  }, []);

  return (
    <main className="viewer-window">
      <svg className="alpha-filter-defs" aria-hidden="true">
        <defs>
          <filter id="white-to-alpha" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
               -1 -1 -1 0 3
              "
            />
            <feComponentTransfer>
              <feFuncA type="gamma" amplitude="1" exponent="1.35" offset="0" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <section className="camera-view">
        <div className="last-name-layer" aria-label="Last name overlay layer">
          {lastNameLetters.map((letter) => (
            <span className="last-name-letter" key={letter.key} style={letter.style}>
              <span className="last-name-outline" aria-hidden="true">
                {letter.char}
              </span>
              <span className="last-name-fill">{letter.char}</span>
            </span>
          ))}
        </div>

        <div
          className="carousel"
          aria-label="3D polygon merry-go-round of flat posters"
          style={{
            '--start-rotation': `${START_ROTATION_DEG}deg`,
            '--stop-rotation': `${STOP_ROTATION_DEG}deg`,
          }}
        >
          {faces.map((face) => (
            <article className="face" key={face.id} style={face.style}>
              <div className={`face-card face-card-${face.content.type}`}>
                {face.content.type === 'player' && (
                  <video
                    src={face.content.video}
                    className="face-image face-video"
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onLoadedData={(event) => {
                      event.currentTarget.playbackRate = 0.4;
                    }}
                  />
                )}

                {face.content.type === 'name' && (
                  <>
                    <p className="name-subtitle">{face.content.subtitle}</p>
                    <h1 className="name-title">{face.content.title}</h1>
                  </>
                )}

                {face.content.type === 'player' && <p className="face-label">{face.content.title}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
