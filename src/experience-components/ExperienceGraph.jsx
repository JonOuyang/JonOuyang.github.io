import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { experienceData } from './experiences';
import './ExperienceGraph.css';

// --- Helper function to determine node style ---
const getNodeStyle = (node, activeBranch, branchesConfig) => {
  const columnOffsets = {
    'swe': 180, // in pixels
    'ai-ml': 360,
  };

  const isShared = node.branches.length > 1;
  const isInactive = activeBranch !== 'main' && !node.branches.includes(activeBranch);

  let style = {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: isShared ? 2 : 1, // Shared nodes on top
  };

  if (activeBranch === 'main') {
    return style;
  }

  if (isInactive) {
    style.opacity = 0.2;
    style.scale = 0.9;
    style.x = -20; // Slightly retract left
    style.zIndex = 0;
  } else if (node.branches.includes(activeBranch)) {
    style.x = columnOffsets[activeBranch] || 0;
  }

  return style;
};

// --- Main Timeline Component ---
const ExperienceGraph = ({ experiences, branches }) => {
  const [activeBranch, setActiveBranch] = useState('main');

  
  if (!experiences.length) {
    return <div>Loading experiences...</div>;
  }

  return (
    <div className="timeline-wrapper">
      <div className="branch-controls">
        {Object.entries(branches).map(([key, { name, color }]) => (
          <button
            key={key}
            onClick={() => setActiveBranch(key)}
            className={`branch-button ${activeBranch === key ? 'active' : ''}`}
            style={{ '--branch-color': color }}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="timeline-container">
        <div className="timeline-line" style={{ '--branch-color': branches[activeBranch]?.color || '#ccc' }}></div>
        {experiences.map((exp, index) => {
          const style = getNodeStyle(exp, activeBranch, branches);
          const isSharedNode = exp.branches.length > 1;
          const isOnlyInBranch = !exp.branches.includes('main');
          const isVisible = !(activeBranch !== 'main' && isOnlyInBranch && !exp.branches.includes(activeBranch));

          return (
            <AnimatePresence key={exp.id}>
              {isVisible && (
                <motion.div
                  className="timeline-item"
                  initial={style}
                  animate={style}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  layout
                >
                  <div className="timeline-dot-wrapper">
                    {/* Render branch connector lines */}
                    {isSharedNode && activeBranch === 'main' && (
                       <div className="branch-connector-preview" />
                    )}
                    <div
                      className={`timeline-dot ${isSharedNode ? 'shared-node' : ''}`}
                      style={{ '--main-branch-color': branches['main']?.color, '--swe-branch-color': branches['swe']?.color, '--ai-ml-branch-color': branches['ai-ml']?.color }}
                    ></div>
                  </div>

                  <motion.div
                    className="timeline-content"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: style.opacity }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="timeline-date">{exp.date}</span>
                    <h3>{exp.title}</h3>
                    <h4>{exp.company}</h4>
                    <p>{exp.description}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
};

export default ExperienceGraph;