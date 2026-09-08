import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  Clock,
  Briefcase,
  FileText,
  Stethoscope,
  Settings
} from 'lucide-react';
import './Sidebar.css';

const WORKSPACE_NAV = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'patients', icon: Users, label: 'Patients' },
  { id: 'queue', icon: Clock, label: "Today's queue", badge: 7, badgeVariant: 'warning' },
  { id: 'cases', icon: Briefcase, label: 'Cases' },
  { id: 'documents', icon: FileText, label: 'Documents' },
  { id: 'consultations', icon: Stethoscope, label: 'Consultations' },
];

const MANAGE_NAV = [
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  return (
    <aside className="sb-root">
      {/* Brand Header */}
      <div className="sb-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
        <div className="sb-logo-icon">
          <HeartPulse size={19} color="white" strokeWidth={2.2} />
        </div>
        <span className="sb-logo-text">
          <span className="sb-logo-medi">Medi</span>
          <span className="sb-logo-kiosk">Kiosk</span>
        </span>
      </div>

      {/* Navigation Links */}
      <div className="sb-nav-scroll">
        {/* WORKSPACE SECTION */}
        <div className="sb-section">
          <div className="sb-section-title">WORKSPACE</div>
          <nav className="sb-nav-group">
            {WORKSPACE_NAV.map(({ id, icon: Icon, label, badge, badgeVariant }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  className={`sb-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onTabChange && onTabChange(id)}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="sb-item-icon" />
                  <span className="sb-item-label">{label}</span>
                  {badge !== undefined && (
                    <span className={`sb-badge ${badgeVariant || 'default'}`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* MANAGE SECTION */}
        <div className="sb-section">
          <div className="sb-section-title">MANAGE</div>
          <nav className="sb-nav-group">
            {MANAGE_NAV.map(({ id, icon: Icon, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  className={`sb-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onTabChange && onTabChange(id)}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="sb-item-icon" />
                  <span className="sb-item-label">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Doctor Footer */}
      <div className="sb-footer">
        <div className="sb-doctor-pill">
          <div className="sb-avatar">AR</div>
          <div className="sb-doctor-info">
            <div className="sb-doctor-name">Dr. Aditya Rao</div>
            <div className="sb-doctor-role">Chief Medical Officer</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
