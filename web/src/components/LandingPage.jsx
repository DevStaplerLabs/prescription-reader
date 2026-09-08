import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, ArrowRight, CheckCircle2, UserCircle, 
  Mic, FileText, CheckSquare, ShieldCheck, Activity, Globe, LayoutDashboard,
  Stethoscope, ScanLine, Volume2, Sparkles, ChevronRight, ChevronLeft, Check,
  AlertCircle, Clock, Bot, FileCheck, Layers, Play, Pause, Languages, Cpu
} from 'lucide-react';
import './LandingPage.css';

const journeyPhases = [
  {
    num: '01',
    title: 'Patient Check-in',
    subtitle: 'Frictionless multilingual kiosk onboarding in under 60 seconds.',
    icon: UserCircle,
    badge: 'Phase 01: Patient Intake',
    category: 'Kiosk Terminal',
    tagline: 'Frictionless ABHA Onboarding and Queue Token Allocation',
    narrative: 'Patients arrive at the OPD kiosk and begin with a single tap. Designed for high accessibility across all age groups, it offers instant language switching, ABHA Health ID biometric linking, and digital token issuance.',
    capabilities: [
      { label: 'ABHA and UHID Integration', desc: 'Instant fetch of existing medical profile' },
      { label: 'Multilingual Audio Prompts', desc: 'Voice guidance in Hindi, English and regional dialects' },
      { label: 'Digital Token Generation', desc: 'Syncs directly with hospital OPD queue' }
    ],
    highlightStat: '< 45s',
    highlightLabel: 'Average Check-in Time'
  },
  {
    num: '02',
    title: 'Guided Conversation',
    subtitle: 'Conversational AI capturing natural patient narratives with clinical depth.',
    icon: Mic,
    badge: 'Phase 02: Ambient Triage',
    category: 'Acoustic AI',
    tagline: 'Empathetic Clinical Dialogue in Hindi and English',
    narrative: 'Instead of confusing touchscreen questionnaires, an empathetic voice assistant conducts a structured clinical interview. It follows clinical triage protocols, asking intelligent follow up questions regarding duration, pain severity, and accompanying symptoms.',
    capabilities: [
      { label: 'Whisper AI Speech to Text', desc: 'Acoustic noise cancellation for crowded OPDs' },
      { label: 'Colloquial Hinglish NLP', desc: 'Interprets everyday idioms and symptoms' },
      { label: 'Adaptive Follow Up Probing', desc: 'Probes severity, duration and red flags' }
    ],
    highlightStat: '98.8%',
    highlightLabel: 'Speech Recognition Accuracy'
  },
  {
    num: '03',
    title: 'Voice & Documents',
    subtitle: 'Real-time optical scanner digitizing physical prescriptions and reports.',
    icon: FileText,
    badge: 'Phase 03: Multimodal OCR',
    category: 'Vision Engine',
    tagline: 'Laser Scanning of Handwritten Prescriptions and Lab Slips',
    narrative: 'Patients place past doctor prescriptions, lab slips, or discharge summaries on the kiosk optical scanner. Our fine-tuned vision OCR detects handwritten medical abbreviations, dosages, and abnormal lab parameters with bounding box certainty.',
    capabilities: [
      { label: 'Handwriting OCR Engine', desc: 'Deciphers physician cursive and abbreviations' },
      { label: 'Medicine and Dosage Parser', desc: 'Maps to national formulary database' },
      { label: 'Abnormal Lab Flagging', desc: 'Instantly identifies out of range biomarkers' }
    ],
    highlightStat: '1.2s',
    highlightLabel: 'Per Page OCR Processing'
  },
  {
    num: '04',
    title: 'AI Structuring',
    subtitle: 'Transforming conversational speech and documents into FHIR clinical data.',
    icon: Activity,
    badge: 'Phase 04: Clinical Reasoning',
    category: 'Synthesizer',
    tagline: 'Translating Conversational Notes into Structured FHIR Records',
    narrative: 'Raw conversational inputs and OCR text flow into our clinical synthesis engine. Information is organized into standard clinical categories: Chief Complaint, History of Present Illness, Medications, Vitals, and Emergency Triage Level.',
    capabilities: [
      { label: 'FHIR HL7 Standard Schema', desc: 'Interoperable across hospital EHR systems' },
      { label: 'Red Flag Triage Detection', desc: 'Automatic alert for chest pain and breathlessness' },
      { label: 'Differential Insight Support', desc: 'Surfaces pertinent clinical positives and negatives' }
    ],
    highlightStat: '100%',
    highlightLabel: 'FHIR Schema Compliance'
  },
  {
    num: '05',
    title: 'Doctor Review',
    subtitle: 'Structured pre-consultation summary ready before the patient sits down.',
    icon: Stethoscope,
    badge: 'Phase 05: Clinical Decision',
    category: 'Doctor Dashboard',
    tagline: 'Giving Doctors Their Time Back to Focus on Human Care',
    narrative: 'When the patient enters the consultation room, the physician already has an executive clinical briefing on their tablet. No typing repetitive notes, no deciphering crinkled papers—just review, clinical judgment, and one-click verification.',
    capabilities: [
      { label: '45 Second Case Briefing', desc: 'Saves 10 to 15 minutes of routine note taking' },
      { label: 'Direct EHR Export', desc: 'One click sign off, order tests, or print Rx' },
      { label: 'Human in the Loop', desc: 'Doctor retains complete clinical authority' }
    ],
    highlightStat: '12 min',
    highlightLabel: 'Saved Per Consultation'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);
  const [kioskLang, setKioskLang] = useState('hi');
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Auto-play timer if enabled
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveJourneyStep(prev => (prev + 1) % journeyPhases.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  // Subtle scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const currentPhase = journeyPhases[activeJourneyStep];

  return (
    <div className="landing-page-strict">
      
      {/* Navigation */}
      <nav className="strict-nav">
        <div className="nav-logo">
          <div className="logo-icon-mark">
            <HeartPulse size={20} color="white" />
          </div>
          <h2 className="logo-text">
            <span className="text-ink">Medi</span><span className="logo-serif text-teal">Kiosk</span><span className="logo-brand-dot">.</span>
          </h2>
        </div>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#for-doctors">For doctors</a>
          <a href="#about">About</a>
        </div>
        <div className="nav-actions">
          <button className="text-link" onClick={() => navigate('/login')}>Doctor login</button>
          <button className="btn-primary" onClick={() => navigate('/kiosk')}>
            Start check-in <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-strict section-padding">
        {/* Luminous Animated Aurora Gradient Meshes */}
        <div className="hero-aurora-blob blob-1"></div>
        <div className="hero-aurora-blob blob-2"></div>
        <div className="hero-aurora-blob blob-3"></div>

        <div className="hero-grid">
          <div className="hero-content fade-up">
            <div className="pill-badge light-teal">
              <span className="badge-sparkle">✨</span>
              <span>Intelligent Outpatient Check-in Platform</span>
            </div>
            
            <h1>
              <span className="text-ink">Smarter patient case&#8209;taking.</span><br/>
              <span className="hero-gradient-text">Better clinical conversations.</span>
            </h1>
            
            <p className="hero-subtext">
              Autonomous clinical intake workflows that empower patients to speak naturally, automatically digitize handwritten prescriptions, and present doctors with structured case summaries before the consultation begins.
            </p>
            
            <div className="hero-buttons">
              <button className="btn-primary large" onClick={() => navigate('/kiosk')}>
                Start patient check-in <ArrowRight size={18} />
              </button>
              <button className="btn-outline large" onClick={() => navigate('/login')}>
                <Stethoscope size={18} /> Doctor login
              </button>
            </div>
            
            <div className="hero-trust-marks">
              <span className="trust-chip"><CheckCircle2 size={15} color="var(--primary-teal)"/> ABDM & ABHA Integrated</span>
              <span className="trust-chip"><CheckCircle2 size={15} color="var(--primary-teal)"/> Doctor Controlled</span>
              <span className="trust-chip"><CheckCircle2 size={15} color="var(--primary-teal)"/> HIPAA & DPDP Compliant</span>
            </div>
          </div>

          <div className="hero-visual fade-up">
            <div className="hero-mockup-wrapper">
              {/* Soft ambient gradient glow */}
              <div className="hero-mockup-glow"></div>

              {/* The Interactive Mockup Card — badges are children so they position off this card */}
              <div className="flat-mockup-card">

                {/* Floating Badge 1 - Top Right of card */}
                <div className="hero-floating-badge badge-top-right">
                  <div className="pulse-beacon">
                    <span className="beacon-ping"></span>
                    <span className="beacon-dot"></span>
                  </div>
                  <div className="badge-text-group">
                    <span className="badge-label">Clinical Triage Engine</span>
                    <span className="badge-val">Active · Non-Urgent (Level 4)</span>
                  </div>
                </div>

                {/* Floating Badge 2 - Bottom Left of card */}
                <div className="hero-floating-badge badge-bottom-left">
                  <div className="badge-icon-wrap">
                    <ShieldCheck size={16} color="var(--primary-teal)" />
                  </div>
                  <div className="badge-text-group">
                    <span className="badge-label">ABHA Identity Verified</span>
                    <span className="badge-val">Queue Token #B-42 · Dr. Sharma</span>
                  </div>
                </div>


                <div className="mockup-header">
                  <div className="mockup-brand">
                    <HeartPulse size={16} color="var(--primary-teal)" /> <span>Medi</span><span className="logo-serif" style={{color:'var(--primary-teal)'}}>Kiosk</span> Terminal
                  </div>
                  <div className="live-status">
                    <div className="status-radar-ring"></div>
                    <div className="status-dot"></div>
                    <span>Live check-in</span>
                  </div>
                </div>

                <div className="mockup-body">
                  <div className="mockup-side">
                    <div className="avatar-box">
                      <div className="avatar-circle-wrap">
                        <div className="avatar-circle">AS</div>
                        <span className="avatar-online-dot"></span>
                      </div>
                      <div>
                        <strong>Ananya Sharma</strong>
                        <span>Patient · English / Hindi</span>
                      </div>
                    </div>

                    <div className="skeleton-group">
                      <div className="skel-line shimmer"></div>
                      <div className="skel-line shimmer"></div>
                      <div className="skel-line short shimmer"></div>
                    </div>

                    <div className="progress-box">
                      <div className="progress-top-label">
                        <span>Intake Progress</span>
                        <span className="progress-percent">75%</span>
                      </div>
                      <strong>Clinical assessment</strong>
                      <div className="progress-track">
                        <div className="progress-fill shimmer-bar"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mockup-chat">
                    <div className="chat-bot-tag">
                      <Activity size={13} /> MediKiosk Clinical Assistant
                    </div>
                    <div className="chat-bubble left">
                      What is the primary concern that brought you to the clinic today?
                    </div>
                    <div className="chat-bubble right">
                      <p>I have a persistent throbbing headache and mild nausea for the past 2 days.</p>
                      <div className="bubble-transcription-pill">
                        <Volume2 size={11} /> Voice transcribed · 99.4% confidence
                      </div>
                    </div>

                    <div className="voice-btn active-state">
                      <div className="voice-icon-pulsing">
                        <Mic size={14} color="white" />
                        <span className="mic-halo-ring"></span>
                      </div>
                      <span className="voice-state-text">Listening to patient speech...</span>
                      <div className="mini-soundwave-bars">
                        <span className="mini-sw-bar sw-1"></span>
                        <span className="mini-sw-bar sw-2"></span>
                        <span className="mini-sw-bar sw-3"></span>
                        <span className="mini-sw-bar sw-4"></span>
                        <span className="mini-sw-bar sw-5"></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mockup-footer">
                  <div className="footer-compliance">
                    <ShieldCheck size={14} color="var(--primary-teal)" />
                    <span>ABDM FHIR R4 Compliant • End-to-End Encrypted</span>
                  </div>
                  <span className="footer-verified-badge">Physician Review Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Guided Journey - Living Diagnostic Pipeline */}
      <section id="how-it-works" className="journey-strict section-padding fade-up">
        <div className="section-heading center">
          <div className="eyebrow">INTERACTIVE CLINICAL PIPELINE</div>
          <h2>From patient story to clinical context</h2>
          <p>Experience how MediKiosk transforms raw patient speech and physical prescriptions into an actionable physician case sheet in 5 intelligent phases.</p>
        </div>

        {/* Top Interactive Stepper / Pipeline Ribbon */}
        <div className="pipeline-stepper-container">
          <div className="pipeline-stepper-track">
            <div 
              className="pipeline-stepper-progress" 
              style={{ width: `${(activeJourneyStep / 4) * 100}%` }}
            ></div>
          </div>

          <div className="pipeline-stepper-nodes">
            {journeyPhases.map((phase, idx) => {
              const IconComponent = phase.icon;
              const isActive = activeJourneyStep === idx;
              const isPast = activeJourneyStep > idx;
              return (
                <button
                  key={phase.num}
                  className={`pipeline-node-btn ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => setActiveJourneyStep(idx)}
                  aria-label={`Jump to ${phase.title}`}
                >
                  <div className="pipeline-node-badge">
                    {isPast ? <Check size={14} /> : phase.num}
                  </div>
                  <div className="pipeline-node-meta">
                    <span className="pipeline-node-title">{phase.title}</span>
                    <span className="pipeline-node-category">{phase.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* The Living Diagnostic Stage */}
        <div className="pipeline-stage-wrapper">
          <div className="pipeline-stage-card">
            
            {/* Left Console: Clinical Context & Architecture */}
            <div className="pipeline-console-pane">
              <div className="pipeline-pane-header">
                <span className="pipeline-phase-tag">{currentPhase.badge}</span>
                <span className="pipeline-live-indicator">
                  <span className="live-pulse-dot"></span> Live Simulation
                </span>
              </div>

              <h3 className="pipeline-phase-heading">{currentPhase.tagline}</h3>
              <p className="pipeline-phase-narrative">{currentPhase.narrative}</p>

              {/* Key Capabilities List */}
              <div className="pipeline-capabilities-list">
                {currentPhase.capabilities.map((cap, i) => (
                  <div key={i} className="pipeline-cap-item">
                    <div className="pipeline-cap-bullet">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div className="pipeline-cap-label">{cap.label}</div>
                      <div className="pipeline-cap-desc">{cap.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stat callout & Navigation Controls */}
              <div className="pipeline-console-footer">
                <div className="pipeline-stat-box">
                  <div className="pipeline-stat-num">{currentPhase.highlightStat}</div>
                  <div className="pipeline-stat-label">{currentPhase.highlightLabel}</div>
                </div>

                <div className="pipeline-nav-controls">
                  <button 
                    className="pipeline-ctrl-btn"
                    disabled={activeJourneyStep === 0}
                    onClick={() => setActiveJourneyStep(prev => Math.max(0, prev - 1))}
                    title="Previous Phase"
                  >
                    <ChevronLeft size={18} /> Prev
                  </button>

                  <button
                    className="pipeline-ctrl-btn auto-toggle"
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    title={isAutoPlay ? "Pause Auto-Tour" : "Start Auto-Tour"}
                  >
                    {isAutoPlay ? <Pause size={15} /> : <Play size={15} />}
                    <span>{isAutoPlay ? 'Pause Tour' : 'Auto Tour'}</span>
                  </button>

                  <button 
                    className="pipeline-ctrl-btn next-btn"
                    disabled={activeJourneyStep === 4}
                    onClick={() => setActiveJourneyStep(prev => Math.min(4, prev + 1))}
                    title="Next Phase"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Stage: Interactive Medical Graphic Simulator */}
            <div className="pipeline-simulator-pane">

              {/* SIMULATION 01: KIOSK CHECK-IN */}
              {activeJourneyStep === 0 && (
                <div className="sim-module sim-kiosk">
                  <div className="sim-terminal-bar">
                    <div className="sim-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="sim-terminal-title">MediKiosk Terminal 04, OPD Block B</div>
                    <div className="sim-terminal-status"><span className="status-online"></span> ONLINE</div>
                  </div>

                  <div className="sim-kiosk-body">
                    <div className="kiosk-lang-switcher">
                      <span className="lang-label"><Languages size={15} /> Select Language or भाषा चुनें:</span>
                      <div className="lang-btns">
                        <button 
                          className={`lang-btn ${kioskLang === 'hi' ? 'active' : ''}`}
                          onClick={() => setKioskLang('hi')}
                        >
                          हिंदी
                        </button>
                        <button 
                          className={`lang-btn ${kioskLang === 'en' ? 'active' : ''}`}
                          onClick={() => setKioskLang('en')}
                        >
                          English
                        </button>
                      </div>
                    </div>

                    <div className="kiosk-main-screen">
                      <div className="kiosk-screen-head">
                        <h4>{kioskLang === 'hi' ? 'नमस्ते! आपका स्वागत है' : 'Welcome to MediKiosk'}</h4>
                        <p>{kioskLang === 'hi' ? 'कृपया अपना आभा (ABHA) कार्ड टैप करें या टोकन प्राप्त करें' : 'Tap your ABHA card or verify with mobile number'}</p>
                      </div>

                      <div className="kiosk-patient-ticket">
                        <div className="ticket-avatar">
                          <UserCircle size={36} />
                        </div>
                        <div className="ticket-details">
                          <div className="ticket-name">
                            {kioskLang === 'hi' ? 'रमेश कुमार' : 'Ramesh Kumar'}
                            <span className="ticket-tag">48 Yrs, Male</span>
                          </div>
                          <div className="ticket-id">
                            <strong>ABHA ID:</strong> 91-4829-1092-3810
                          </div>
                          <div className="ticket-opd">
                            <strong>OPD Token:</strong> <span className="token-highlight">B-42</span> (General Medicine)
                          </div>
                        </div>
                      </div>

                      {/* Interactive Tap Animation */}
                      <div className="kiosk-nfc-zone">
                        <div className="nfc-radar-pulse">
                          <div className="nfc-ring ring-1"></div>
                          <div className="nfc-ring ring-2"></div>
                          <div className="nfc-icon-center">
                            <Activity size={20} />
                          </div>
                        </div>
                        <div className="nfc-caption">
                          {kioskLang === 'hi' ? 'ABHA कार्ड या QR कोड टैप करें' : 'Contactless ABHA RFID and QR Tap Zone'}
                        </div>
                      </div>

                      <div className="kiosk-status-badge">
                        <ShieldCheck size={14} /> ABHA Digital Health Locker Synced
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATION 02: GUIDED AI VOICE CONVERSATION */}
              {activeJourneyStep === 1 && (
                <div className="sim-module sim-voice">
                  <div className="sim-terminal-bar">
                    <div className="sim-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="sim-terminal-title">Whisper AI Voice Studio, Acoustic NLP Active</div>
                    <div className="sim-terminal-status"><span className="status-listening"></span> LISTENING</div>
                  </div>

                  <div className="sim-voice-body">
                    {/* Living Soundwave Equalizer */}
                    <div className="voice-equalizer-stage">
                      <div className="equalizer-bars">
                        {[35, 70, 50, 85, 55, 95, 65, 80, 40, 90, 75, 60, 85, 45, 70, 30].map((h, i) => (
                          <div 
                            key={i} 
                            className="eq-bar" 
                            style={{ '--bar-h': `${h}%`, animationDelay: `${(i * 0.08).toFixed(2)}s` }}
                          ></div>
                        ))}
                      </div>
                      <div className="mic-pulse-node">
                        <div className="mic-halo"></div>
                        <div className="mic-icon-circle">
                          <Mic size={20} />
                        </div>
                      </div>
                      <div className="voice-metrics">
                        <span className="metric-pill"><Volume2 size={12} /> 48 kHz Clean Audio</span>
                        <span className="metric-pill highlight"><Sparkles size={12} /> 99.2% NLP Confidence</span>
                      </div>
                    </div>

                    {/* Dialogue Transcript */}
                    <div className="voice-chat-stream">
                      <div className="voice-bubble bot">
                        <div className="bubble-icon"><Bot size={15} /></div>
                        <div className="bubble-content">
                          <div className="bubble-speaker">MediKiosk Voice Assistant</div>
                          <div className="bubble-text">"नमस्ते रमेश जी, आपको क्या परेशानी हो रही है और यह कब से है?"</div>
                          <div className="bubble-sub">"Namaste Ramesh ji, what symptoms are you having and since when?"</div>
                        </div>
                      </div>

                      <div className="voice-bubble patient">
                        <div className="bubble-content">
                          <div className="bubble-speaker">Patient (Voice Input in Hindi)</div>
                          <div className="bubble-text">"मुझे 3 दिन से बहुत तेज बुखार है और सीने में थोड़ा भारीपन लग रहा है..."</div>
                          <div className="bubble-sub">"I have had high fever for 3 days and feel a heaviness in my chest..."</div>
                          
                          <div className="voice-tags-detected">
                            <span className="detect-tag symptom">Fever (3 days)</span>
                            <span className="detect-tag warning">Chest Heaviness (Key Flag)</span>
                          </div>
                        </div>
                        <div className="bubble-icon patient-icon"><UserCircle size={15} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATION 03: PRESCRIPTION & REPORT OCR SCANNER */}
              {activeJourneyStep === 2 && (
                <div className="sim-module sim-ocr">
                  <div className="sim-terminal-bar">
                    <div className="sim-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="sim-terminal-title">MediVision Optical AI, Laser Prescription Scanner</div>
                    <div className="sim-terminal-status"><span className="status-scanning"></span> SCANNING</div>
                  </div>

                  <div className="sim-ocr-body">
                    <div className="ocr-scanner-bed">
                      {/* Sweeping Laser Beam */}
                      <div className="laser-scan-beam"></div>

                      {/* Mock Prescription Sheet */}
                      <div className="ocr-paper-document">
                        <div className="paper-header">
                          <div className="paper-hospital">
                            <HeartPulse size={15} color="var(--primary-teal)" /> AIIMS New Delhi, OPD Prescription
                          </div>
                          <div className="paper-date">Date: 04/09/2026</div>
                        </div>

                        <div className="paper-body">
                          <div className="paper-rx-mark">Rx</div>
                          
                          {/* Medicine Box 1 (Detected) */}
                          <div className="ocr-detected-box box-1">
                            <div className="ocr-raw-text">Tab. Paracetamol 650mg TDS x 3d</div>
                            <span className="ocr-conf-badge">99.4% Match, Antipyretic</span>
                          </div>

                          {/* Medicine Box 2 (Detected) */}
                          <div className="ocr-detected-box box-2">
                            <div className="ocr-raw-text">Tab. Azithromycin 500mg OD x 3d</div>
                            <span className="ocr-conf-badge">98.1% Match, Antibiotic</span>
                          </div>

                          {/* Lab slip line */}
                          <div className="ocr-detected-box box-3">
                            <div className="ocr-raw-text">Lab Note: CBC advised, Platelet 1.8 Lakhs (Normal)</div>
                            <span className="ocr-conf-badge">97.5% Match, Biomarker</span>
                          </div>
                        </div>

                        <div className="paper-signature">
                          <span>Dr. S. K. Mehta (MBBS, MD)</span>
                        </div>
                      </div>
                    </div>

                    <div className="ocr-results-bar">
                      <div className="ocr-result-item">
                        <ScanLine size={15} /> <strong>3 Items Extracted</strong>
                      </div>
                      <div className="ocr-result-item">
                        <Check size={15} /> Verified Against Drug Formulary
                      </div>
                      <div className="ocr-result-item">
                        <FileCheck size={15} /> Added to Case Dossier
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATION 04: AI CLINICAL STRUCTURING */}
              {activeJourneyStep === 3 && (
                <div className="sim-module sim-structuring">
                  <div className="sim-terminal-bar">
                    <div className="sim-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="sim-terminal-title">Clinical Knowledge Engine, FHIR Synthesizer</div>
                    <div className="sim-terminal-status"><span className="status-ai"></span> PROCESSING</div>
                  </div>

                  <div className="sim-structuring-body">
                    {/* Pipeline Graphic */}
                    <div className="ai-pipeline-flow">
                      <div className="flow-input-pill">
                        <span className="flow-label">Raw Inputs</span>
                        <span>Hindi Voice and Scanned Rx</span>
                      </div>
                      <div className="flow-connector">
                        <div className="flow-dot-stream"></div>
                      </div>
                      <div className="flow-ai-core">
                        <div className="core-orbit"></div>
                        <Cpu size={20} color="var(--amber)" />
                        <span className="core-title">MediKiosk AI Core</span>
                      </div>
                      <div className="flow-connector">
                        <div className="flow-dot-stream"></div>
                      </div>
                      <div className="flow-output-pill">
                        <span className="flow-label">Standard</span>
                        <span>FHIR v4.0.1</span>
                      </div>
                    </div>

                    {/* Structured Cards Matrix */}
                    <div className="fhir-card-matrix">
                      <div className="fhir-field-card">
                        <div className="fhir-field-tag">CHIEF COMPLAINT</div>
                        <div className="fhir-field-val">Acute Febrile Illness (Fever for 3 days)</div>
                        <div className="fhir-field-sub">Gradual onset, responsive to antipyretics</div>
                      </div>

                      <div className="fhir-field-card warning-border">
                        <div className="fhir-field-tag warning-tag">RED FLAG SYMPTOM</div>
                        <div className="fhir-field-val">Substernal Chest Heaviness</div>
                        <div className="fhir-field-sub">Reported in voice conversation, priority flag</div>
                      </div>

                      <div className="fhir-field-card">
                        <div className="fhir-field-tag">CURRENT MEDICATIONS FROM OCR</div>
                        <div className="fhir-field-val">Paracetamol 650mg TDS, Azithromycin 500mg</div>
                        <div className="fhir-field-sub">Completed 2 days of self-medication</div>
                      </div>

                      <div className="fhir-field-card triage-priority">
                        <div className="fhir-field-tag">TRIAGE CLASSIFICATION</div>
                        <div className="triage-status-pill yellow">
                          <AlertCircle size={14} /> Priority 2 Yellow, Urgent Review
                        </div>
                        <div className="fhir-field-sub">Recommendation: Baseline 12-lead ECG before discharge</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATION 05: DOCTOR CLINICAL REVIEW */}
              {activeJourneyStep === 4 && (
                <div className="sim-module sim-doctor">
                  <div className="sim-terminal-bar">
                    <div className="sim-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="sim-terminal-title">Dr. Ananya Sharma, MD, OPD Station</div>
                    <div className="sim-terminal-status"><span className="status-doctor"></span> READY FOR REVIEW</div>
                  </div>

                  <div className="sim-doctor-body">
                    {/* Patient Header Banner */}
                    <div className="doc-patient-strip">
                      <div className="doc-patient-info">
                        <strong>Ramesh Kumar</strong> (48 Yrs, Male), <span className="doc-opd-badge">OPD Token B-42</span>
                      </div>
                      <div className="doc-vitals-pills">
                        <span>BP: <strong>130/85 mmHg</strong></span>
                        <span>Pulse: <strong>88 bpm</strong></span>
                        <span>SpO2: <strong>98%</strong></span>
                        <span>Temp: <strong className="temp-alert">101.4 °F</strong></span>
                      </div>
                    </div>

                    {/* Pre-Consult Clinical Briefing */}
                    <div className="doc-summary-card">
                      <div className="doc-summary-head">
                        <Activity size={15} color="var(--primary-teal)" />
                        <span>AI Pre-Consultation Synthesis (Read time: 30s)</span>
                      </div>
                      <ul className="doc-summary-points">
                        <li><strong>History:</strong> 3 day history of acute fever. Self-administered Paracetamol 650mg with transient relief.</li>
                        <li><strong className="text-warning">Alert Flag:</strong> Patient voiced mild chest heaviness during kiosk voice dialogue. No prior cardiac history.</li>
                        <li><strong>Medication Reconciliation:</strong> Ongoing Tab Azithromycin 500mg (Day 2).</li>
                      </ul>
                    </div>

                    {/* 1-Click Action Bar */}
                    <div className="doc-actions-matrix">
                      <button className="doc-action-btn primary" onClick={() => navigate('/login')}>
                        <Check size={15} /> Approve & Call Patient
                      </button>
                      <button className="doc-action-btn secondary" onClick={() => navigate('/login')}>
                        <Activity size={15} /> Order 12-Lead ECG
                      </button>
                      <button className="doc-action-btn outline" onClick={() => navigate('/login')}>
                        <FileText size={15} /> View Scanned Rx
                      </button>
                    </div>

                    {/* Impact Proof Footer */}
                    <div className="doc-roi-footer">
                      <Clock size={13} /> <strong>Saved 12 minutes</strong> of manual typing. Doctor retains complete diagnostic authority
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Modern Bento Grid */}
      <section id="features" className="features-strict section-padding fade-up">
        <div className="section-heading split">
          <div>
            <div className="eyebrow">INTELLIGENT CLINICAL INFRASTRUCTURE</div>
            <h2>Everything needed for a better visit</h2>
          </div>
          <p className="split-desc">Helpful artificial intelligence in the background. Complete physician authority at the center.</p>
        </div>

        <div className="bento-features-grid">
          {/* Card 1 - Span 2: AI Clinical Dialogue */}
          <div className="bento-feat-card span-2 theme-patient hover-glow">
            <div className="feat-card-top">
              <div className="feat-icon-badge patient">
                <Activity size={20} />
              </div>
              <span className="feat-pill-tag">Ambient AI Triage</span>
              <div className="feat-arrow-link"><ArrowRight size={15} /></div>
            </div>
            <div className="bento-card-text">
              <h4>AI-Assisted Guided Conversation</h4>
              <p>Adaptive clinical dialogue capturing pain levels, timelines, and red-flag risk factors.</p>
            </div>
            {/* Visual Widget */}
            <div className="feat-mini-widget dialogue-widget">
              <div className="mini-chat-line bot">
                <span className="mini-actor">MediKiosk:</span>
                <span className="mini-msg">Does the headache worsen with bright light or nausea?</span>
              </div>
              <div className="mini-chat-line user">
                <span className="mini-actor">Patient:</span>
                <span className="mini-msg">Yes, especially looking at screens for the past 48 hours.</span>
              </div>
              <div className="mini-tag-row">
                <span className="widget-badge emerald">⚡ Photophobia Identified</span>
                <span className="widget-badge muted">Duration: 48h</span>
                <span className="widget-badge amber">Triage: Level 4 Non-Urgent</span>
              </div>
            </div>
          </div>

          {/* Card 2 - Span 1: Acoustic Voice AI */}
          <div className="bento-feat-card span-1 theme-patient hover-glow">
            <div className="feat-card-top">
              <div className="feat-icon-badge patient">
                <Mic size={20} />
              </div>
              <span className="feat-pill-tag">Speech Engine</span>
              <div className="feat-arrow-link"><ArrowRight size={15} /></div>
            </div>
            <div className="bento-card-text">
              <h4>Voice Interaction</h4>
              <p>Noise-filtering acoustic AI tuned for crowded OPD waiting rooms.</p>
            </div>
            {/* Visual Widget */}
            <div className="feat-mini-widget voice-widget">
              <div className="mini-voice-equalizer">
                <span className="mv-bar mv-1"></span>
                <span className="mv-bar mv-2"></span>
                <span className="mv-bar mv-3"></span>
                <span className="mv-bar mv-4"></span>
                <span className="mv-bar mv-5"></span>
              </div>
              <div className="mini-voice-stat">
                <strong>98.8%</strong>
                <span>Acoustic Accuracy</span>
              </div>
            </div>
          </div>

          {/* Card 3 - Span 1: Multilingual Native */}
          <div className="bento-feat-card span-1 theme-patient hover-glow">
            <div className="feat-card-top">
              <div className="feat-icon-badge patient">
                <Globe size={20} />
              </div>
              <span className="feat-pill-tag">Bilingual</span>
              <div className="feat-arrow-link"><ArrowRight size={15} /></div>
            </div>
            <div className="bento-card-text">
              <h4>Hindi + English</h4>
              <p>Fluid bilingual intake supporting everyday idioms and regional phrasing.</p>
            </div>
            {/* Visual Widget */}
            <div className="feat-mini-widget lang-widget">
              <div className="mini-lang-chips">
                <span className="m-chip active">EN English</span>
                <span className="m-chip active">HI हिन्दी</span>
                <span className="m-chip">MR मराठी</span>
              </div>
              <div className="mini-sub-caption">Instant voice dialect toggle</div>
            </div>
          </div>

          {/* Card 4 - Span 1: Prescription OCR */}
          <div className="bento-feat-card span-1 theme-patient hover-glow">
            <div className="feat-card-top">
              <div className="feat-icon-badge patient">
                <FileText size={20} />
              </div>
              <span className="feat-pill-tag">Vision OCR</span>
              <div className="feat-arrow-link"><ArrowRight size={15} /></div>
            </div>
            <div className="bento-card-text">
              <h4>Prescription OCR</h4>
              <p>Deciphers physician cursive, drug dosages, and abnormal lab biomarkers.</p>
            </div>
            {/* Visual Widget */}
            <div className="feat-mini-widget ocr-widget">
              <div className="mini-ocr-scan-line"></div>
              <div className="mini-ocr-text">Rx: Paracetamol 650mg TDS</div>
              <span className="widget-badge cyan">Matched Formulary</span>
            </div>
          </div>

          {/* Card 5 - Span 1: Structured Case Sheet */}
          <div className="bento-feat-card span-1 theme-patient hover-glow">
            <div className="feat-card-top">
              <div className="feat-icon-badge patient">
                <CheckSquare size={20} />
              </div>
              <span className="feat-pill-tag">FHIR R4</span>
              <div className="feat-arrow-link"><ArrowRight size={15} /></div>
            </div>
            <div className="bento-card-text">
              <h4>Structured Case Sheet</h4>
              <p>Standardizes voice and prescription scans into ABDM-ready FHIR records.</p>
            </div>
            {/* Visual Widget */}
            <div className="feat-mini-widget schema-widget">
              <div className="mini-code-tag">SNOMED CT: 25064002</div>
              <div className="mini-code-tag">ICD-10: G44.209</div>
              <span className="widget-badge emerald">100% ABDM Valid</span>
            </div>
          </div>

          {/* Card 6 - Span 2: Patient Verification */}
          <div className="bento-feat-card span-2 theme-patient hover-glow">
            <div className="feat-card-top">
              <div className="feat-icon-badge patient">
                <UserCircle size={20} />
              </div>
              <span className="feat-pill-tag">Human in the Loop</span>
              <div className="feat-arrow-link"><ArrowRight size={15} /></div>
            </div>
            <div className="bento-card-text">
              <h4>Patient Verification & Consent</h4>
              <p>Touchscreen symptom review with ABHA OTP authentication before physician handoff.</p>
            </div>
            {/* Visual Widget */}
            <div className="feat-mini-widget verify-widget">
              <div className="mini-verify-step">
                <span className="mini-v-check">✓</span>
                <span>Patient verified 4 symptoms & vital baseline</span>
              </div>
              <div className="mini-verify-audit">
                <span>ABHA ID: 91-8472-9182-3491</span>
                <span className="widget-badge emerald">OTP Signed</span>
              </div>
            </div>
          </div>

          {/* Card 7 - Span 2: Doctor Dashboard */}
          <div className="bento-feat-card span-2 theme-doctor hover-glow">
            <div className="feat-card-top">
              <div className="feat-icon-badge doctor">
                <LayoutDashboard size={20} />
              </div>
              <span className="feat-pill-tag doctor">Doctor Workstation</span>
              <div className="feat-arrow-link doctor"><ArrowRight size={15} /></div>
            </div>
            <div className="bento-card-text">
              <h4>Physician Clinical Console</h4>
              <p>45-second executive case summary with symptom trends, Rx history, and differential cues.</p>
            </div>
            {/* Visual Widget */}
            <div className="feat-mini-widget doctor-widget">
              <div className="mini-doc-banner">
                <div className="mini-doc-pulse"></div>
                <strong>Dr. R. K. Sharma · Room 4B</strong>
                <span className="mini-doc-time">Ready for consultation</span>
              </div>
              <div className="mini-metrics-row">
                <div className="mini-m-item"><strong>12m</strong><span>Saved per Patient</span></div>
                <div className="mini-m-item"><strong>0</strong><span>Manual Typing</span></div>
                <div className="mini-m-item"><strong>100%</strong><span>Doctor Autonomy</span></div>
              </div>
            </div>
          </div>

          {/* Card 8 - Span 2: Secure Records */}
          <div className="bento-feat-card span-2 theme-doctor hover-glow">
            <div className="feat-card-top">
              <div className="feat-icon-badge doctor">
                <ShieldCheck size={20} />
              </div>
              <span className="feat-pill-tag doctor">Enterprise Trust</span>
              <div className="feat-arrow-link doctor"><ArrowRight size={15} /></div>
            </div>
            <div className="bento-card-text">
              <h4>Zero-Trust Security & Compliance</h4>
              <p>AES-256 encrypted health data vault strictly compliant with ABDM and DPDP Act.</p>
            </div>
            {/* Visual Widget */}
            <div className="feat-mini-widget security-widget">
              <div className="mini-sec-badges">
                <span className="sec-chip"><ShieldCheck size={12} /> DPDP Act 2023</span>
                <span className="sec-chip"><ShieldCheck size={12} /> HIPAA Compatible</span>
                <span className="sec-chip"><ShieldCheck size={12} /> ABDM Milestone 1-3</span>
              </div>
              <div className="mini-sec-status">
                <span className="sec-status-dot"></span> All Health Data Tokenized and Encrypted
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Teal Banner */}
      <section id="for-doctors" className="cta-strict section-padding fade-up">
        <div className="banner-card">
          <div className="banner-content">
            <h2>Start every consultation with the full story.</h2>
            <p>Review patient-verified information, conversation context, and AI-assisted summaries in one calm clinical workspace.</p>
            <button className="btn-dark-outline" onClick={() => navigate('/dashboard')}>
              Explore doctor portal <ArrowRight size={16} />
            </button>
          </div>
          <div className="banner-stats">
            <div className="stats-group">
              <div className="stat-item">
                <div className="stat-num">24</div>
                <div className="stat-label">patients today</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">85%</div>
                <div className="stat-label">case confidence</div>
              </div>
            </div>
            <div className="ai-badge">
              ✨ AI-assisted · Doctor-reviewed
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="strict-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-icon-mark">
              <HeartPulse size={20} color="white" />
            </div>
            <h2 className="logo-text">
              <span className="text-ink">Medi</span><span className="logo-serif text-teal">Kiosk</span><span className="logo-brand-dot">.</span>
            </h2>
          </div>
          <div className="footer-credit">
            <ShieldCheck size={16} /> Built by CodeBit
          </div>
        </div>
        <div className="footer-desc">
          MediKiosk helps patients share their story and helps doctors spend<br/>more time on the conversation that matters.
        </div>
        <div className="footer-bottom">
          <span>© 2026 MediKiosk. For demonstration purposes.</span>
          <span>AI assists the doctor; AI does not replace the doctor.</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
