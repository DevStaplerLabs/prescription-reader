import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="lp-root">

      {/* ── LEFT PANEL ── */}
      <aside className="lp-left">
        {/* Logo */}
        <div className="lp-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
          <div className="lp-logo-icon">
            <HeartPulse size={20} color="white" />
          </div>
          <span className="lp-logo-text">
            <span className="lp-logo-sans">Medi</span><span className="lp-logo-serif">Kiosk</span>
          </span>
        </div>

        {/* Hero copy */}
        <div className="lp-left-body">
          <div className="lp-steth-ring">
            <Stethoscope size={26} color="rgba(255,255,255,0.85)" strokeWidth={1.5} />
          </div>

          <h2 className="lp-left-heading">
            A clearer view of every<br />patient story.
          </h2>
          <p className="lp-left-sub">
            MediKiosk helps you review structured patient information
            before the consultation, so every conversation starts with context.
          </p>

          <div className="lp-left-badge">
            <ShieldCheck size={16} strokeWidth={1.8} />
            <span>AI-assisted. Doctor-controlled.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="lp-left-footer">
          <span className="lp-footer-brand">MediKiosk</span>
          <span className="lp-footer-sep">·</span>
          <span>Built by CodeBit</span>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="lp-right">
        <div className="lp-form-wrap">
          <div className="lp-eyebrow">DOCTOR PORTAL</div>
          <h1 className="lp-form-heading">Welcome back, Doctor</h1>
          <p className="lp-form-sub">
            Sign in to access your <span className="lp-sub-accent">clinical</span> workspace.
          </p>

          <div className="lp-card">
            <form onSubmit={handleLogin} className="lp-form">
              <div className="lp-field">
                <label htmlFor="lp-email">Email or username</label>
                <input
                  id="lp-email"
                  type="text"
                  placeholder="doctor@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="lp-field">
                <label htmlFor="lp-password">Password</label>
                <input
                  id="lp-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <div className="lp-form-options">
                <label className="lp-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="lp-forgot">Forgot password?</a>
              </div>

              <button type="submit" className="lp-submit-btn">
                Login to portal
              </button>
            </form>
          </div>

          <p className="lp-demo-note">Demo mode · Use any credentials to continue</p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
