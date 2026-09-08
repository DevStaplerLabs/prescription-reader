import React, { useState } from 'react';
import { Briefcase, Sparkles, AlertTriangle, CheckCircle, ChevronRight, Filter } from 'lucide-react';
import './CasesView.css';

const CasesView = ({ patients, onSelectPatient }) => {
  const [filterStatus, setFilterStatus] = useState('All');

  const casesList = patients.map(p => ({
    ...p,
    primaryDoctor: p.documents?.prescribingDoctor || 'Dr. Aditya Rao',
    aiRiskScore: p.flagged ? 'High Risk' : 'Moderate',
    caseStatus: p.flagged ? 'Active Emergency' : p.status === 'Completed' ? 'Closed' : 'Under Review'
  }));

  const filteredCases = casesList.filter(c => {
    if (filterStatus === 'Emergency') return c.flagged;
    if (filterStatus === 'Under Review') return c.status === 'Waiting' || c.status === 'In consultation';
    if (filterStatus === 'Closed') return c.status === 'Completed';
    return true;
  });

  return (
    <div className="cv-root">
      <div className="cv-header">
        <div>
          <h1 className="cv-title">Active Cases</h1>
          <p className="cv-subtitle">Clinical case history tracking, diagnostic records & attending physician assignments</p>
        </div>
        <div className="cv-badge">
          <Briefcase size={16} color="#0E7C66" />
          <span>{filteredCases.length} Cases Active</span>
        </div>
      </div>

      {/* Filters */}
      <div className="cv-filter-bar">
        {['All', 'Emergency', 'Under Review', 'Closed'].map(st => (
          <button
            key={st}
            className={`cv-filter-btn ${filterStatus === st ? 'active' : ''}`}
            onClick={() => setFilterStatus(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Cases List */}
      <div className="cv-list">
        {filteredCases.map(c => (
          <div
            key={c.id}
            className={`cv-card ${c.flagged ? 'emergency' : ''}`}
            onClick={() => onSelectPatient(c)}
          >
            <div className="cv-card-top">
              <div className="cv-case-id">{c.caseId}</div>
              <span className={`cv-status-chip ${c.caseStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                {c.caseStatus}
              </span>
            </div>

            <div className="cv-card-main">
              <h3 className="cv-patient-name">{c.name}</h3>
              <div className="cv-meta">{c.age} yrs · {c.gender} · ABHA: <span className="cv-mono">{c.abhaId}</span></div>
            </div>

            <div className="cv-complaint-box">
              <span className="cv-lbl">Clinical Impression:</span>
              <p className="cv-text">{c.clinicalFrame}</p>
            </div>

            <div className="cv-doc-info">
              <span className="cv-lbl">Attending Physician:</span>
              <span className="cv-doc-name">{c.primaryDoctor}</span>
            </div>

            <div className="cv-card-footer">
              <span className="cv-ai-badge">
                <Sparkles size={13} color="#0E7C66" /> {c.aiConfidence}% AI Clinical Confidence
              </span>
              <button
                className="cv-btn-details"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPatient(c);
                }}
              >
                <span>Inspect Case</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CasesView;
