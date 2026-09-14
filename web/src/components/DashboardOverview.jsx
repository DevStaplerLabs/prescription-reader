import React, { useState } from 'react';
import {
  Users,
  Clock,
  Stethoscope,
  CheckCircle2,
  Plus,
  BarChart2,
  Activity,
  Search,
  ChevronRight,
  Sparkles,
  FileText,
  X,
  RefreshCw
} from 'lucide-react';
import { PATIENT_VOLUME_DATA } from '../data/patientsData';
import './DashboardOverview.css';

const DashboardOverview = ({ patients, onSelectPatient, onNewPatient, onResetCohort }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsModalPatient, setRecordsModalPatient] = useState(null);

  // Dynamic stats calculation
  const totalCount = patients.length;
  const waitingCount = patients.filter(p => p.status === 'Waiting').length;
  const inConsultCount = patients.filter(p => p.status === 'In consultation').length;
  const completedCount = patients.filter(p => p.status === 'Completed').length;
  const urgentCount = patients.filter(p => p.flagged).length;

  // Filtered patients for bottom table
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.abhaId.includes(searchTerm) ||
      p.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'priority') return matchesSearch && p.flagged;
    if (activeFilter === 'waiting') return matchesSearch && p.status === 'Waiting';
    if (activeFilter === 'in-consult') return matchesSearch && p.status === 'In consultation';
    if (activeFilter === 'completed') return matchesSearch && p.status === 'Completed';
    return matchesSearch;
  });

  return (
    <div className="dov-root">
      {/* ── TOP BANNER ────────────────────────────────────────── */}
      <div className="dov-header-row">
        <div>
          <div className="dov-date">MONDAY, 7 SEPTEMBER 2026</div>
          <h1 className="dov-title">Good morning, Doctor</h1>
          <p className="dov-subtitle">Here's today's patient overview.</p>
        </div>
        <button className="dov-btn-new" onClick={onNewPatient}>
          <Plus size={18} strokeWidth={2.5} />
          <span>New patient</span>
        </button>
      </div>

      {/* ── STAT CARDS ROW (4 CARDS) ───────────────────────────── */}
      <div className="dov-stats-grid">
        {/* Stat Card 1 */}
        <div className="dov-stat-card">
          <div className="dov-stat-top">
            <span className="dov-stat-label">Today's patients</span>
            <div className="dov-stat-icon-bg teal">
              <Users size={18} color="#0E7C66" />
            </div>
          </div>
          <div className="dov-stat-value">{totalCount}</div>
          <div className="dov-stat-sub positive">+12% from yesterday</div>
        </div>

        {/* Stat Card 2 */}
        <div className="dov-stat-card">
          <div className="dov-stat-top">
            <span className="dov-stat-label">Waiting</span>
            <div className="dov-stat-icon-bg amber">
              <Clock size={18} color="#D97706" />
            </div>
          </div>
          <div className="dov-stat-value">{waitingCount}</div>
          <div className="dov-stat-sub warning">{urgentCount} urgent priority</div>
        </div>

        {/* Stat Card 3 */}
        <div className="dov-stat-card">
          <div className="dov-stat-top">
            <span className="dov-stat-label">In consultation</span>
            <div className="dov-stat-icon-bg blue">
              <Stethoscope size={18} color="#2563EB" />
            </div>
          </div>
          <div className="dov-stat-value">{inConsultCount}</div>
          <div className="dov-stat-sub live">● Live now in OPD 1 & 3</div>
        </div>

        {/* Stat Card 4 */}
        <div className="dov-stat-card">
          <div className="dov-stat-top">
            <span className="dov-stat-label">Completed</span>
            <div className="dov-stat-icon-bg green">
              <CheckCircle2 size={18} color="#10B981" />
            </div>
          </div>
          <div className="dov-stat-value">{completedCount}</div>
          <div className="dov-stat-sub muted">62% of total daily queue</div>
        </div>
      </div>

      {/* ── CHARTS ROW (PATIENT VOLUME + CONSULTATION STATUS) ─── */}
      <div className="dov-charts-grid">
        {/* Left Card: Patient Volume Bar Chart */}
        <div className="dov-card">
          <div className="dov-card-header">
            <div>
              <div className="dov-card-title-wrap">
                <BarChart2 size={16} color="#0E7C66" />
                <h3 className="dov-card-title">Patient volume</h3>
              </div>
              <p className="dov-card-sub">This week</p>
            </div>
            <select className="dov-select-filter">
              <option>This week</option>
              <option>Last week</option>
              <option>This month</option>
            </select>
          </div>

          <div className="dov-bar-chart-wrap">
            <div className="dov-bar-chart">
              {PATIENT_VOLUME_DATA.map((item, idx) => {
                const maxCount = 30;
                const heightPct = Math.round((item.count / maxCount) * 100);
                const isToday = item.day === 'Mon';

                return (
                  <div key={idx} className="dov-bar-col">
                    <div className="dov-bar-track">
                      <div
                        className={`dov-bar-fill ${isToday ? 'highlight' : ''}`}
                        style={{ height: `${heightPct}%` }}
                      >
                        <span className="dov-bar-tooltip">{item.count} patients</span>
                      </div>
                    </div>
                    <span className="dov-bar-day">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Card: Consultation Status Donut Chart */}
        <div className="dov-card">
          <div className="dov-card-header">
            <div>
              <div className="dov-card-title-wrap">
                <Activity size={16} color="#0E7C66" />
                <h3 className="dov-card-title">Consultation status</h3>
              </div>
              <p className="dov-card-sub">Today</p>
            </div>
          </div>

          <div className="dov-donut-content">
            {/* SVG Donut Chart */}
            <div className="dov-donut-svg-wrap">
              <svg viewBox="0 0 160 160" className="dov-donut-svg">
                {/* Background circle */}
                <circle cx="80" cy="80" r="60" stroke="#E2E8F0" strokeWidth="22" fill="transparent" />
                
                {/* Completed (15/24 = 62.5% -> stroke-dasharray 235.6, offset) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#0E7C66"
                  strokeWidth="22"
                  fill="transparent"
                  strokeDasharray="235.6 141.4"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                
                {/* In consultation (2/24 = 8.3% -> stroke-dasharray 31.4) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#2563EB"
                  strokeWidth="22"
                  fill="transparent"
                  strokeDasharray="31.4 345.6"
                  strokeDashoffset="-235.6"
                  strokeLinecap="round"
                />

                {/* Waiting (7/24 = 29.1% -> stroke-dasharray 109.8) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#F59E0B"
                  strokeWidth="22"
                  fill="transparent"
                  strokeDasharray="109.8 267.2"
                  strokeDashoffset="-267.0"
                  strokeLinecap="round"
                />
              </svg>
              <div className="dov-donut-center">
                <span className="dov-donut-number">{totalCount}</span>
                <span className="dov-donut-label">total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="dov-donut-legend">
              <div className="dov-legend-item">
                <span className="dov-legend-dot teal" />
                <div className="dov-legend-info">
                  <span className="dov-legend-name">Completed</span>
                  <span className="dov-legend-val">{completedCount}</span>
                </div>
              </div>

              <div className="dov-legend-item">
                <span className="dov-legend-dot blue" />
                <div className="dov-legend-info">
                  <span className="dov-legend-name">In consultation</span>
                  <span className="dov-legend-val">{inConsultCount}</span>
                </div>
              </div>

              <div className="dov-legend-item">
                <span className="dov-legend-dot amber" />
                <div className="dov-legend-info">
                  <span className="dov-legend-name">Waiting</span>
                  <span className="dov-legend-val">{waitingCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM PATIENT QUEUE TABLE ───────────────────────────── */}
      <div className="dov-card queue-table-card">
        <div className="dov-table-toolbar">
          <div>
            <h3 className="dov-card-title">Patient Queue</h3>
            <p className="dov-card-sub">Active waiting room list & priority triage</p>
          </div>

          <div className="dov-toolbar-right">
            {/* Search */}
            <div className="dov-search-input-wrap">
              <Search size={14} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search patient, ABHA or complaint..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div className="dov-filter-pills">
              <button
                className={`dov-pill ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All ({totalCount})
              </button>
              <button
                className={`dov-pill ${activeFilter === 'priority' ? 'active' : ''}`}
                onClick={() => setActiveFilter('priority')}
              >
                Priority ({urgentCount})
              </button>
              <button
                className={`dov-pill ${activeFilter === 'waiting' ? 'active' : ''}`}
                onClick={() => setActiveFilter('waiting')}
              >
                Waiting ({waitingCount})
              </button>
              <button
                className={`dov-pill ${activeFilter === 'in-consult' ? 'active' : ''}`}
                onClick={() => setActiveFilter('in-consult')}
              >
                In Consult ({inConsultCount})
              </button>
              <button
                className={`dov-pill ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                Completed ({completedCount})
              </button>
              {onResetCohort && (
                <button
                  className="dov-pill"
                  onClick={onResetCohort}
                  title="Reload complete demonstration cohort (9 patients)"
                  style={{ background: '#f8fafc', color: '#0E7C66', borderColor: '#cbd5e1' }}
                >
                  <RefreshCw size={11} />
                  <span>Reset Demo Cohort</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="dov-table-responsive">
          <table className="dov-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>ABHA ID</th>
                <th>Triage / Risk</th>
                <th>Check-in</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr
                  key={patient.id}
                  className={`dov-tr ${patient.flagged ? 'flagged-row' : ''}`}
                  onClick={() => onSelectPatient(patient)}
                >
                  {/* Patient Name & CC */}
                  <td>
                    <div className="dov-td-patient">
                      <div className={`dov-td-avatar ${patient.avatarColor}`}>
                        {patient.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div className="dov-patient-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{patient.name}</span>
                          {patient.tokenNumber && <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{patient.tokenNumber}</span>}
                          {(patient.pastRecords || patient.documents) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecordsModalPatient(patient);
                              }}
                              style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '3px 7px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                              title="View Attached Prescription & Records"
                            >
                              <FileText size={12} />
                              <span>Rx Records</span>
                            </button>
                          )}
                        </div>
                        <div className="dov-patient-cc">{patient.chiefComplaint}</div>
                      </div>
                    </div>
                  </td>

                  {/* ABHA ID */}
                  <td>
                    <span className="dov-td-abha">{patient.abhaId}</span>
                  </td>

                  {/* Triage Level / Flag */}
                  <td>
                    {patient.flagged ? (
                      <span className="dov-badge-priority">
                        ⚠ {patient.triageLevel}
                      </span>
                    ) : (
                      <span className="dov-badge-normal">
                        {patient.triageLevel}
                      </span>
                    )}
                  </td>

                  {/* Check-in time */}
                  <td>
                    <div className="dov-td-time">
                      <span>{patient.checkInTime}</span>
                      <span className="dov-wait-tag">({patient.waitMins}m wait)</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`dov-status-tag ${patient.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {patient.status === 'In consultation' ? '● In consultation' : patient.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    <button
                      className="dov-btn-inspect"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(patient);
                      }}
                    >
                      <Sparkles size={13} color="#0E7C66" />
                      <span>View AI Summary</span>
                      <ChevronRight size={13} color="#94A3B8" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Records Modal with Digitized Medicines Table */}
      {recordsModalPatient && (() => {
        const doc = recordsModalPatient.pastRecords || recordsModalPatient.documents || {};
        const medicines = doc.medicines || [];
        const insights = doc.insights || [];
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setRecordsModalPatient(null)}>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', width: '560px', maxWidth: '92%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 'bold', fontSize: '1.05rem' }}>
                  <FileText size={20} color="#0E7C66" />
                  <span>Digitized Prescription Records: {recordsModalPatient.name}</span>
                </div>
                <button onClick={() => setRecordsModalPatient(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.84rem' }}>
                <div><strong>Document:</strong> {doc.type || doc.documentType || 'OPD Prescription'}</div>
                <div><strong>Date:</strong> {doc.date || doc.documentDate || 'Recent'}</div>
              </div>

              {(doc.doctor || doc.prescribingDoctor) && (
                <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '12px' }}>
                  <strong>Prescribing Physician:</strong> {doc.doctor || doc.prescribingDoctor}
                </div>
              )}

              {medicines.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#0E7C66" />
                    <span>AI Extracted Medications ({medicines.length} Detected)</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', borderBottom: '1.5px solid #cbd5e1' }}>Medicine</th>
                        <th style={{ padding: '8px 10px', borderBottom: '1.5px solid #cbd5e1' }}>Dosage</th>
                        <th style={{ padding: '8px 10px', borderBottom: '1.5px solid #cbd5e1' }}>Frequency</th>
                        <th style={{ padding: '8px 10px', borderBottom: '1.5px solid #cbd5e1' }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0f172a' }}>{m.name}</td>
                          <td style={{ padding: '8px 10px', color: '#475569' }}>{m.dosage}</td>
                          <td style={{ padding: '8px 10px', color: '#475569' }}>{m.frequency}</td>
                          <td style={{ padding: '8px 10px', color: '#475569' }}>{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {insights.length > 0 && (
                <div style={{ fontSize: '0.84rem', color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <strong style={{ color: '#1e293b' }}>Clinical Notes & Observations:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                    {insights.map((ins, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default DashboardOverview;
