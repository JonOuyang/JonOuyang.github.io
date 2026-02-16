import React, { useMemo } from 'react';
import './WIPHome.css';

const PANELS = 48;
const RADIUS = 780;
const WORD = 'CYLINDER';
const REPEATS_PER_PANEL = 16;

export default function WIPHome() {
  const panelData = useMemo(() => {
    return Array.from({ length: PANELS }, (_, index) => {
      const angle = (360 / PANELS) * index;
      return {
        id: `panel-${index}`,
        style: {
          transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
        },
      };
    });
  }, []);

  const repeatedWords = useMemo(() => {
    return Array.from({ length: REPEATS_PER_PANEL }, () => `${WORD} ${WORD} ${WORD}`);
  }, []);

  return (
    <main className="viewer-window">
      <section className="scene">
        <div className="cylinder" aria-label="Tall transparent 3D rotating cylinder">
          <div className="cylinder-cap cylinder-cap-top" aria-hidden="true" />
          <div className="cylinder-cap cylinder-cap-bottom" aria-hidden="true" />

          {panelData.map((panel) => (
            <div className="panel" key={panel.id} style={panel.style}>
              <div className="panel-text-stack">
                {repeatedWords.map((line, idx) => (
                  <p className="panel-word" key={`${panel.id}-line-${idx}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
