import React, { useState } from 'react';
import { Settings, ShieldCheck, Cpu, Bell, Globe, Check, Save } from 'lucide-react';
import './SettingsView.css';

const SettingsView = () => {
  const [sensitivity, setSensitivity] = useState('High');
  const [autoSync, setAutoSync] = useState(true);
  const [voiceLang, setVoiceLang] = useState('Hindi + English (Hinglish)');
  const [notifications, setNotifications] = useState({
    cardiacAlerts: true,
    strokeAlerts: true,
    soundChime: true
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="sv-root">
      <div className="sv-header">
        <div>
          <h1 className="sv-title">Settings & Preferences</h1>
          <p className="sv-subtitle">Manage Doctor OPD profile, AI Triage models, ABHA integration & notifications</p>
        </div>
        <button className="sv-btn-save" onClick={handleSave}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          <span>{saved ? 'Saved Successfully!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="sv-grid">
        {/* Profile Card */}
        <div className="sv-card">
          <div className="sv-card-header">
            <ShieldCheck size={18} color="#0E7C66" />
            <h3 className="sv-card-title">Doctor Profile & Medical License</h3>
          </div>
          <div className="sv-card-body">
            <div className="sv-field-group">
              <label className="sv-label">Full Name</label>
              <input type="text" className="sv-input" defaultValue="Dr. Aditya Rao" />
            </div>

            <div className="sv-field-row">
              <div className="sv-field-group">
                <label className="sv-label">Specialization</label>
                <input type="text" className="sv-input" defaultValue="General Medicine & OPD Lead" />
              </div>
              <div className="sv-field-group">
                <label className="sv-label">MCI License Number</label>
                <input type="text" className="sv-input" defaultValue="MCI-2021-9842" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Triage Engine Card */}
        <div className="sv-card">
          <div className="sv-card-header">
            <Cpu size={18} color="#0E7C66" />
            <h3 className="sv-card-title">AI Clinical Triage Engine</h3>
          </div>
          <div className="sv-card-body">
            <div className="sv-field-group">
              <label className="sv-label">Clinical Risk Sensitivity</label>
              <div className="sv-radio-group">
                {['High (Flag ACS/Stroke Aggressively)', 'Standard (Balanced)', 'Strict'].map(opt => (
                  <label key={opt} className={`sv-radio-item ${sensitivity === opt.split(' ')[0] ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="sens"
                      checked={sensitivity === opt.split(' ')[0]}
                      onChange={() => setSensitivity(opt.split(' ')[0])}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sv-toggle-row">
              <div>
                <div className="sv-toggle-title">ABHA Auto-Sync Engine</div>
                <div className="sv-toggle-desc">Automatically fetch latest patient prescriptions upon check-in</div>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={e => setAutoSync(e.target.checked)}
                className="sv-toggle-input"
              />
            </div>
          </div>
        </div>

        {/* Voice & Speech Language */}
        <div className="sv-card">
          <div className="sv-card-header">
            <Globe size={18} color="#0E7C66" />
            <h3 className="sv-card-title">Voice Prescription & Language</h3>
          </div>
          <div className="sv-card-body">
            <div className="sv-field-group">
              <label className="sv-label">Primary Audio Input Language</label>
              <select
                className="sv-select"
                value={voiceLang}
                onChange={e => setVoiceLang(e.target.value)}
              >
                <option>Hindi + English (Hinglish)</option>
                <option>English (India)</option>
                <option>Hindi (Pure)</option>
                <option>Tamil / Telugu / Malayalam</option>
              </select>
            </div>
          </div>
        </div>

        {/* OPD Alert Notifications */}
        <div className="sv-card">
          <div className="sv-card-header">
            <Bell size={18} color="#0E7C66" />
            <h3 className="sv-card-title">Emergency Alert Notifications</h3>
          </div>
          <div className="sv-card-body">
            <div className="sv-toggle-row">
              <div>
                <div className="sv-toggle-title">ACS & Chest Pain Alerts</div>
                <div className="sv-toggle-desc">Pop-up immediate alert when severe chest pain patient checks in</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.cardiacAlerts}
                onChange={e => setNotifications({...notifications, cardiacAlerts: e.target.checked})}
                className="sv-toggle-input"
              />
            </div>

            <div className="sv-toggle-row">
              <div>
                <div className="sv-toggle-title">Stroke Protocol Sound Chime</div>
                <div className="sv-toggle-desc">Audible chime when FAST stroke patient enters triage queue</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.soundChime}
                onChange={e => setNotifications({...notifications, soundChime: e.target.checked})}
                className="sv-toggle-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
