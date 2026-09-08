import React, { useState } from 'react';
import { Moon, Sun, Bell, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';
import './TopNavbar.css';

const TopNavbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="tn-root">
      {/* Left: Synced status indicator pill */}
      <div className="tn-left">
        <div className="tn-synced-pill" title="Real-time ABHA & Hospital Network Sync Active">
          <span className="tn-synced-dot" />
          <span className="tn-synced-text">Synced</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="tn-right">
        {/* Dark Mode Toggle */}
        <button
          className="tn-icon-btn"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#64748B" />}
        </button>

        {/* Notifications Bell */}
        <div className="tn-notif-wrap">
          <button
            className="tn-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} color="#64748B" />
            <span className="tn-notif-dot" />
          </button>

          {showNotifications && (
            <div className="tn-dropdown-card notif-popover">
              <div className="tn-popover-header">
                <span>Notifications</span>
                <span className="tn-pill-small">3 New</span>
              </div>
              <div className="tn-notif-item unread">
                <span className="tn-notif-icon emergency">🚨</span>
                <div>
                  <div className="tn-notif-title">ACS Priority Alert</div>
                  <div className="tn-notif-desc">Ramesh Kumar (58M) flagged for urgent ECG</div>
                  <div className="tn-notif-time">2 mins ago</div>
                </div>
              </div>
              <div className="tn-notif-item unread">
                <span className="tn-notif-icon stroke">⚡</span>
                <div>
                  <div className="tn-notif-title">Stroke Protocol Triggered</div>
                  <div className="tn-notif-desc">Sunita Devi (71F) fast track CT Brain clearance</div>
                  <div className="tn-notif-time">15 mins ago</div>
                </div>
              </div>
              <div className="tn-notif-item">
                <span className="tn-notif-icon sync">🔄</span>
                <div>
                  <div className="tn-notif-title">ABHA Records Synced</div>
                  <div className="tn-notif-desc">7 patient records updated from central registry</div>
                  <div className="tn-notif-time">1 hour ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Doctor Avatar Profile Menu */}
        <div className="tn-profile-wrap">
          <button
            className="tn-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="tn-avatar-circle">AR</div>
            <span className="tn-doc-name">Dr. Aditya Rao</span>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {showProfileMenu && (
            <div className="tn-dropdown-card profile-popover">
              <div className="tn-profile-popover-header">
                <div className="tn-avatar-circle lg">AR</div>
                <div>
                  <div className="tn-profile-name">Dr. Aditya Rao</div>
                  <div className="tn-profile-spec">MBBS, MD (General OPD Lead)</div>
                  <div className="tn-profile-reg"><ShieldCheck size={12} color="#0E7C66" /> Reg No: MCI-2021-9842</div>
                </div>
              </div>
              <div className="tn-popover-divider" />
              <button className="tn-popover-item">My Profile & Clinical License</button>
              <button className="tn-popover-item">OPD Schedule & Shift Timings</button>
              <button className="tn-popover-item danger" onClick={() => window.location.href = '/login'}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
