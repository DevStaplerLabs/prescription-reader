import React, { useState } from 'react';
import { Stethoscope, CheckCircle2, Clock, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import './ConsultationsView.css';

const ConsultationsView = ({ patients, onSelectPatient }) => {
  const [filter, setFilter] = useState('All');

  const list = patients.map(p => ({
    ...p,
    room: p.status === 'In consultation' ? 'OPD Room 1' : 'OPD Room 3',
    consultDate: 'Today, 08 Sep 2026',
    duration: p.status === 'Completed' ? '12 mins' : 'Ongoing (8 mins)',
    prescribedMedsCount: p.documents?.medicines?.length || 2
  }));

  const filtered = list.filter(item => {
    if (filter === 'Live Now') return item.status === 'In consultation';
    if (filter === 'Completed') return item.status === 'Completed';
    return true;
  });

  return (
    <div className="cov-root">
      <div className="cov-header">
        <div>
          <h1 className="cov-title">Consultations Log</h1>
          <p className="cov-subtitle">Live OPD consultations, AI triage voice transcripts & clinical notes</p>
        </div>
        <div className="cov-badge">
          <Stethoscope size={16} color="#0E7C66" />
          <span>{filtered.length} Consultations</span>
        </div>
      </div>

      <div className="cov-filter-bar">
        {['All', 'Live Now', 'Completed'].map(f => (
          <button
            key={f}
            className={`cov-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="cov-grid">
        {filtered.map(item => (
          <div
            key={item.id}
            className={`cov-card ${item.status === 'In consultation' ? 'live-card' : ''}`}
            onClick={() => onSelectPatient(item)}
          >
            <div className="cov-card-header">
              <span className={`cov-room-badge ${item.status === 'In consultation' ? 'live' : ''}`}>
                {item.status === 'In consultation' ? '● Live — ' + item.room : item.room}
              </span>
              <span className="cov-time-mono">{item.checkInTime}</span>
            </div>

            <div className="cov-patient-block">
              <h3 className="cov-name">{item.name}</h3>
              <div className="cov-meta">{item.age} yrs · {item.gender} · ABHA: <span className="cov-mono">{item.abhaId}</span></div>
            </div>

            <div className="cov-words-box">
              <div className="cov-words-title">
                <MessageSquare size={13} color="#0E7C66" />
                <span>Patient Transcript / Voice Input:</span>
              </div>
              <p className="cov-words-text">{item.patientWords}</p>
            </div>

            <div className="cov-footer">
              <div className="cov-stats">
                <span className="cov-stat-item">
                  <Clock size={12} /> {item.duration}
                </span>
                <span className="cov-stat-item">
                  <Sparkles size={12} color="#0E7C66" /> {item.prescribedMedsCount} Rx Meds
                </span>
              </div>

              <button
                className="cov-btn-summary"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPatient(item);
                }}
              >
                <span>Clinical Summary</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsultationsView;
