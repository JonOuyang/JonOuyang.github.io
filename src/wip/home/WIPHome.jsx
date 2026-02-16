import React, { useMemo } from 'react';
import './WIPHome.css';

const SIDES = 20;
const RADIUS = 760;
const IMAGE_SRC = '/assets/images/carouselpfp.png';
const START_ROTATION_DEG = -27;
const ROTATION_PIXELS = 140;

function pixelsToDegrees(px, radius) {
  return (px / (2 * Math.PI * radius)) * 360;
}

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
      image: IMAGE_SRC,
    };
  }

  return { type: 'empty' };
}

export default function WIPHome() {
  const stopRotationDeg = START_ROTATION_DEG + pixelsToDegrees(ROTATION_PIXELS, RADIUS);

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

  return (
    <main className="viewer-window">
      <section className="camera-view">
        <div className="annotation annotation-top-left">
          VIEWPORT CENTERED
          <br />
          POLYGON SIDES: {SIDES}
        </div>
        <div className="annotation annotation-top-right">ROTATION: COUNTERCLOCKWISE</div>
        <div className="guide guide-horizontal" aria-hidden="true" />
        <div className="guide guide-vertical" aria-hidden="true" />

        <div
          className="carousel"
          aria-label="3D polygon merry-go-round of flat posters"
          style={{
            '--start-rotation': `${START_ROTATION_DEG}deg`,
            '--stop-rotation': `${stopRotationDeg}deg`,
          }}
        >
          {faces.map((face) => (
            <article className="face" key={face.id} style={face.style}>
              <div className={`face-card face-card-${face.content.type}`}>
                <span className="face-index">#{face.index}</span>

                {face.content.type === 'player' && (
                  <img
                    src={face.content.image}
                    alt={face.content.title}
                    className="face-image"
                    loading="eager"
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
