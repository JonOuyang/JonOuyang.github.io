import React from 'react';
import './ExperienceTimeline.css'; // We'll create this CSS file next

const Timeline = ({ experiences }) => {
  return (
    <div className="timeline-container">
      <div className="timeline-line"></div> {/* The line with the glow */}
      {experiences.map((exp, index) => (
        <div key={exp.id || index} className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-content">
            <span className="timeline-date">{exp.date}</span>
            <h3>{exp.title}</h3>
            <h4>{exp.company}</h4>
            <p>{exp.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;