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
  Sparkles
} from 'lucide-react';
import { PATIENT_VOLUME_DATA } from '../data/patientsData';
import './DashboardOverview.css';

const DashboardOverview = ({ patients, onSelectPatient, onNewPatient }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Stats calculation
  const totalCount = 24;
  const waitingCount = patients.filter(p => p.status === 'Waiting').length + 2;
  const inConsultCount = patients.filter(p => p.status === 'In consultation').length + 1;
  const completedCount = 15;

  const urgentCount = patients.filter(p => p.flagged).length;

  // Filtered patients for bottom table
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.abhaId.includes(searchTerm) ||
      p.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'priority') return matchesSearch && p.flagged;
    if (activeFilter === 'waiting') return matchesSearch && p.status === 'Waiting';
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
                All
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
                Waiting
              </button>
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
                        <div className="dov-patient-name">{patient.name}</div>
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
    </div>
  );
};

export default DashboardOverview;
