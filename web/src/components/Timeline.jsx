import React from 'react';
import { Calendar } from 'lucide-react';
import './Timeline.css';

const Timeline = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="timeline-container">
      {events.map((event, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-marker">
            <div className="timeline-dot"></div>
            {index < events.length - 1 && <div className="timeline-line"></div>}
          </div>
          <div className="timeline-content">
            <div className="timeline-date">
              <Calendar size={14} />
              <span>{event.date}</span>
            </div>
            <h4>{event.title}</h4>
            <p>{event.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
