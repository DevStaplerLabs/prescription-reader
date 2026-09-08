import React, { useState } from 'react';
import { Search, Filter, Sparkles, CheckCircle2, UserCheck, HeartPulse, FileText, ChevronRight } from 'lucide-react';
import './PatientsView.css';

const PatientsView = ({ patients, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const departments = ['All', 'Cardiology', 'Neurology', 'Pulmonology', 'Rheumatology', 'Endocrinology'];

  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.abhaId.includes(searchTerm) ||
      p.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.caseId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'All' || p.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="pv-root">
      {/* Top Header */}
      <div className="pv-header">
        <div>
          <h1 className="pv-title">Patients Directory</h1>
          <p className="pv-subtitle">Complete registry of OPD patients, ABHA profiles & medical histories</p>
        </div>
        <div className="pv-count-badge">
          <UserCheck size={16} color="#0E7C66" />
          <span>{filteredPatients.length} Active Records</span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="pv-toolbar">
        <div className="pv-search-box">
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by Patient name, ABHA ID, Case ID or Diagnosis..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="pv-dept-filters">
          <Filter size={14} color="#64748B" />
          {departments.map(dept => (
            <button
              key={dept}
              className={`pv-dept-chip ${departmentFilter === dept ? 'active' : ''}`}
              onClick={() => setDepartmentFilter(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Grid */}
      <div className="pv-grid">
        {filteredPatients.map(patient => (
          <div
            key={patient.id}
            className={`pv-card ${patient.flagged ? 'flagged' : ''}`}
            onClick={() => onSelectPatient(patient)}
          >
            <div className="pv-card-header">
              <div className="pv-user-info">
                <div className={`pv-avatar ${patient.avatarColor}`}>
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="pv-name">{patient.name}</h3>
                  <div className="pv-meta">{patient.age} yrs · {patient.gender} · {patient.department}</div>
                </div>
              </div>
              {patient.flagged && (
                <span className="pv-tag-urgent">URGENT</span>
              )}
            </div>

            <div className="pv-abha-row">
              <CheckCircle2 size={12} color="#0E7C66" />
              <span className="pv-abha">{patient.abhaId}</span>
              <span className="pv-case">{patient.caseId}</span>
            </div>

            <div className="pv-cc-box">
              <span className="pv-cc-title">Chief Complaint:</span>
              <p className="pv-cc-text">{patient.chiefComplaint}</p>
            </div>

            {/* Vitals summary */}
            <div className="pv-vitals-row">
              <div className="pv-vital-item">
                <span className="pv-vital-lbl">BP</span>
                <span className="pv-vital-val">{patient.vitals?.bp || '120/80'}</span>
              </div>
              <div className="pv-vital-item">
                <span className="pv-vital-lbl">HR</span>
                <span className="pv-vital-val">{patient.vitals?.hr || '78 bpm'}</span>
              </div>
              <div className="pv-vital-item">
                <span className="pv-vital-lbl">SpO2</span>
                <span className="pv-vital-val">{patient.vitals?.spo2 || '98%'}</span>
              </div>
            </div>

            <div className="pv-card-footer">
              <span className="pv-ai-conf">
                <Sparkles size={13} color="#0E7C66" /> {patient.aiConfidence}% AI Confidence
              </span>
              <button
                className="pv-btn-summary"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPatient(patient);
                }}
              >
                <span>View Summary</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientsView;
