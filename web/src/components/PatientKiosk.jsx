import React, { useState, useEffect } from "react";
import {
  HeartPulse, Globe, User, FileText, ShieldCheck, CheckCircle2,
  ArrowRight, ArrowLeft, Mic, MicOff, Volume2, Activity,
  AlertCircle, Clock, Check, Stethoscope, BadgeCheck, X
} from "lucide-react";
import "./PatientKiosk.css";

const LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "EN", region: "International" },
  { code: "hi", name: "Hindi", native: "\u0939\u093f\u0928\u094d\u0926\u0940", flag: "HI", region: "North India" },
  { code: "bn", name: "Bengali", native: "\u09ac\u09be\u0982\u09b2\u09be", flag: "BN", region: "East India" },
  { code: "ta", name: "Tamil", native: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd", flag: "TA", region: "South India" },
  { code: "te", name: "Telugu", native: "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41", flag: "TE", region: "South India" },
  { code: "mr", name: "Marathi", native: "\u092e\u0930\u093e\u0920\u0940", flag: "MR", region: "West India" },
  { code: "gu", name: "Gujarati", native: "\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0", flag: "GU", region: "West India" },
  { code: "kn", name: "Kannada", native: "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1", flag: "KN", region: "South India" },
];

const SYMPTOM_CHIPS = [
  { id: "s1", label: "Chest Pain", severity: "high" },
  { id: "s2", label: "Headache", severity: "medium" },
  { id: "s3", label: "Fever", severity: "medium" },
  { id: "s4", label: "Breathlessness", severity: "high" },
  { id: "s5", label: "Body Ache", severity: "low" },
  { id: "s6", label: "Stomach Pain", severity: "medium" },
  { id: "s7", label: "Cough", severity: "low" },
  { id: "s8", label: "Vomiting", severity: "medium" },
  { id: "s9", label: "Dizziness", severity: "medium" },
  { id: "s10", label: "Joint Pain", severity: "low" },
  { id: "s11", label: "Back Pain", severity: "low" },
  { id: "s12", label: "Weakness", severity: "medium" },
];

const DEPARTMENTS = [
  "General Medicine", "Cardiology", "Neurology", "Orthopaedics",
  "Pulmonology", "Gastroenterology", "Endocrinology", "Rheumatology",
];

const STEPS = [
  { id: 1, title: "Language", icon: Globe },
  { id: 2, title: "Your Details", icon: User },
  { id: 3, title: "Consent", icon: ShieldCheck },
  { id: 4, title: "Assessment", icon: Activity },
  { id: 5, title: "Review", icon: CheckCircle2 },
];

export default function PatientKiosk({ onExit }) {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState({
    name: "", age: "", gender: "", phone: "", abhaId: "", department: "", visitReason: "",
  });
  const [consents, setConsents] = useState({ dataShare: false, aiAnalysis: false, digital: false });
  const [symptoms, setSymptoms] = useState([]);
  const [voiceText, setVoiceText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (step === 5 && !tokenNumber) {
      setTokenNumber("B-" + (Math.floor(40 + Math.random() * 20)));
    }
  }, [step]);

  const toggleSymptom = (id) =>
    setSymptoms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setVoiceText(prev => prev
          ? prev + " I also have mild dizziness since morning."
          : "I have been having a throbbing headache for the past two days and mild nausea. The pain starts from the back of my head and radiates forward."
        );
        setIsListening(false);
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!lang;
    if (step === 2) return form.name && form.age && form.gender && form.phone;
    if (step === 3) return consents.dataShare && consents.aiAnalysis && consents.digital;
    if (step === 4) return symptoms.length > 0 || voiceText.trim();
    return true;
  };

  const allConsents = consents.dataShare && consents.aiAnalysis && consents.digital;
  const selectedLang = LANGUAGES.find(l => l.code === lang);
  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  const renderStep1 = () => (
    <div className="kiosk-step-content">
      <div className="kiosk-step-header">
        <div className="step-icon-wrap"><Globe size={26} /></div>
        <h2>Choose Your Language</h2>
        <p>Select your preferred language for this session. Voice and text will adapt accordingly.</p>
      </div>
      <div className="lang-grid">
        {LANGUAGES.map(l => (
          <button key={l.code} className={"lang-card" + (lang === l.code ? " selected" : "")} onClick={() => setLang(l.code)}>
            <span className="lang-flag-abbr">{l.flag}</span>
            <span className="lang-native">{l.native}</span>
            <span className="lang-name">{l.name}</span>
            <span className="lang-region">{l.region}</span>
            {lang === l.code && <span className="lang-check"><Check size={13} /></span>}
          </button>
        ))}
      </div>
      <div className="lang-selected-pill">
        <Volume2 size={14} /> Audio guidance will play in <strong>&nbsp;{selectedLang?.name}</strong>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="kiosk-step-content">
      <div className="kiosk-step-header">
        <div className="step-icon-wrap"><User size={26} /></div>
        <h2>Your Details</h2>
        <p>Fill in your basic information. Your ABHA ID helps fetch your existing health records instantly.</p>
      </div>
      <div className="form-grid">
        <div className="form-group span-2">
          <label>Full Name <span className="req">*</span></label>
          <input type="text" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Age <span className="req">*</span></label>
          <input type="number" placeholder="Years" min="1" max="120" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Gender <span className="req">*</span></label>
          <div className="gender-toggle">
            {["Male","Female","Other"].map(g => (
              <button key={g} className={form.gender === g ? "active" : ""} onClick={() => setForm({...form, gender: g})}>{g}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Mobile Number <span className="req">*</span></label>
          <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div className="form-group">
          <label>ABHA Health ID <span className="opt">optional</span></label>
          <input type="text" placeholder="XX-XXXX-XXXX-XXXX" value={form.abhaId} onChange={e => setForm({...form, abhaId: e.target.value})} />
        </div>
        <div className="form-group span-2">
          <label>Department / Speciality</label>
          <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
            <option value="">Select department (optional)</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      {form.abhaId && (
        <div className="abha-verify-strip">
          <BadgeCheck size={15} /> ABHA ID detected -- health records will be fetched automatically
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="kiosk-step-content">
      <div className="kiosk-step-header">
        <div className="step-icon-wrap"><ShieldCheck size={26} /></div>
        <h2>Data Consent</h2>
        <p>MediKiosk is fully compliant with ABDM, DPDP Act 2023, and HIPAA. Your data is never sold or shared.</p>
      </div>
      <div className="consent-list">
        {[
          { key: "dataShare", title: "Health Data Sharing", desc: "Allow MediKiosk to securely share your clinical summary with the consulting doctor during this visit only.", Icon: ShieldCheck },
          { key: "aiAnalysis", title: "AI-Assisted Clinical Analysis", desc: "Allow our AI engine to analyse your symptoms and generate a structured pre-consultation summary for the physician.", Icon: Activity },
          { key: "digital", title: "Digital Health Records", desc: "Allow this session's records to be stored in your ABHA-linked digital health locker for future reference.", Icon: FileText },
        ].map(({ key, title, desc, Icon }) => (
          <div key={key} className={"consent-card" + (consents[key] ? " agreed" : "")} onClick={() => setConsents(p => ({...p, [key]: !p[key]}))}>
            <div className="consent-icon-wrap"><Icon size={19} /></div>
            <div className="consent-body">
              <div className="consent-title">{title}</div>
              <div className="consent-desc">{desc}</div>
            </div>
            <div className={"consent-toggle" + (consents[key] ? " on" : "")}>
              <div className="toggle-thumb" />
            </div>
          </div>
        ))}
      </div>
      {allConsents && (
        <div className="consent-success-strip">
          <CheckCircle2 size={15} /> All consents granted. You are ready for the clinical assessment.
        </div>
      )}
      <div className="consent-legal">
        By proceeding you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>. ABDM compliant. DPDP Act 2023. HIPAA.
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="kiosk-step-content">
      <div className="kiosk-step-header">
        <div className="step-icon-wrap"><Activity size={26} /></div>
        <h2>Clinical Assessment</h2>
        <p>Select your symptoms and describe your condition using voice or text.</p>
      </div>
      <div className="assessment-grid">
        <div className="assessment-pane">
          <div className="pane-label">Quick Symptom Selection</div>
          <div className="symptom-chips">
            {SYMPTOM_CHIPS.map(({ id, label, severity }) => (
              <button key={id} className={"symptom-chip severity-" + severity + (symptoms.includes(id) ? " selected" : "")} onClick={() => toggleSymptom(id)}>
                {label}
                {symptoms.includes(id) && <Check size={11} className="chip-check" />}
              </button>
            ))}
          </div>
          {symptoms.length > 0 && (
            <div className="selected-count">
              <AlertCircle size={13} /> {symptoms.length} symptom{symptoms.length > 1 ? "s" : ""} selected
            </div>
          )}
          <div className="duration-label-row"><Clock size={13} /> Duration of symptoms</div>
          <div className="duration-chips">
            {["Today","2-3 Days","Past Week","1-4 Weeks","Over a Month"].map(d => (
              <button key={d} className={"dur-chip" + (form.visitReason === d ? " selected" : "")} onClick={() => setForm({...form, visitReason: d})}>{d}</button>
            ))}
          </div>
        </div>
        <div className="assessment-pane">
          <div className="pane-label">Describe in Your Own Words</div>
          <button className={"voice-record-btn" + (isListening ? " listening" : "")} onClick={toggleVoice}>
            <div className="voice-btn-inner">
              {isListening ? (
                <>
                  <div className="mic-pulse-rings"><span /><span /><span /></div>
                  <MicOff size={20} />
                  <span>Listening... tap to stop</span>
                </>
              ) : (
                <>
                  <Mic size={20} />
                  <span>Tap to speak your symptoms</span>
                </>
              )}
            </div>
            {isListening && (
              <div className="soundwave">
                {[...Array(9)].map((_, i) => (
                  <span key={i} className="sw-bar" style={{ animationDelay: i * 0.08 + "s" }} />
                ))}
              </div>
            )}
          </button>
          <div className="voice-transcript-area">
            <textarea
              placeholder="Your spoken words will appear here, or type directly..."
              value={voiceText}
              onChange={e => setVoiceText(e.target.value)}
              rows={6}
            />
            {voiceText && (
              <div className="transcript-pill">
                <Volume2 size={11} /> AI Transcribed &middot; {selectedLang?.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => {
    const selectedSymptomLabels = SYMPTOM_CHIPS.filter(s => symptoms.includes(s.id)).map(s => s.label);
    const isEmergency = symptoms.includes("s1") || symptoms.includes("s4");
    return (
      <div className="kiosk-step-content review-step">
        <div className="kiosk-step-header">
          <div className={"step-icon-wrap" + (submitted ? " teal" : "")}><CheckCircle2 size={26} /></div>
          <h2>Review &amp; Confirm</h2>
          <p>Check your information before submitting. Your details go directly to the doctor.</p>
        </div>
        {!submitted ? (
          <>
            <div className="review-grid">
              <div className="review-card">
                <div className="review-card-header"><User size={14} /> Personal Details</div>
                <div className="review-rows">
                  <div className="review-row"><span>Name</span><strong>{form.name || "---"}</strong></div>
                  <div className="review-row"><span>Age</span><strong>{form.age ? form.age + " yrs" : "---"}</strong></div>
                  <div className="review-row"><span>Gender</span><strong>{form.gender || "---"}</strong></div>
                  <div className="review-row"><span>Phone</span><strong>{form.phone || "---"}</strong></div>
                  {form.abhaId && <div className="review-row"><span>ABHA ID</span><strong>{form.abhaId}</strong></div>}
                </div>
              </div>
              <div className="review-card">
                <div className="review-card-header"><Activity size={14} /> Clinical Summary</div>
                <div className="review-rows">
                  <div className="review-row"><span>Department</span><strong>{form.department || "General Medicine"}</strong></div>
                  <div className="review-row"><span>Duration</span><strong>{form.visitReason || "---"}</strong></div>
                  <div className="review-row">
                    <span>Symptoms</span>
                    <div className="review-symptom-tags">
                      {selectedSymptomLabels.length > 0
                        ? selectedSymptomLabels.map(s => <span key={s} className="sym-tag">{s}</span>)
                        : <span>---</span>}
                    </div>
                  </div>
                </div>
                {voiceText && (
                  <div className="review-voice-box">
                    <Volume2 size={12} />
                    <p>"{voiceText}"</p>
                  </div>
                )}
              </div>
              <div className="review-card">
                <div className="review-card-header"><ShieldCheck size={14} /> Consents Granted</div>
                <div className="review-rows">
                  {[
                    { key: "dataShare", label: "Health Data Sharing" },
                    { key: "aiAnalysis", label: "AI Clinical Analysis" },
                    { key: "digital", label: "Digital Health Records" },
                  ].map(({ key, label }) => (
                    <div key={key} className="review-row">
                      <span>{label}</span>
                      <strong className={consents[key] ? "consent-yes" : "consent-no"}>
                        {consents[key] ? "Agreed" : "Declined"}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="review-card">
                <div className="review-card-header"><Globe size={14} /> Session Language</div>
                <div className="lang-review-display">
                  <div className="lang-flag-abbr-big">{selectedLang?.flag}</div>
                  <div>
                    <div className="lang-review-name">{selectedLang?.name}</div>
                    <div className="lang-review-native">{selectedLang?.native}</div>
                  </div>
                </div>
              </div>
            </div>
            <button className="kiosk-submit-btn" onClick={() => setSubmitted(true)}>
              <CheckCircle2 size={18} /> Confirm &amp; Submit Check-In
            </button>
          </>
        ) : (
          <div className="token-issued-screen">
            <div className="token-success-icon"><CheckCircle2 size={52} /></div>
            <h3>Check-in Successful!</h3>
            <p className="token-sub">Your clinical summary has been sent to the doctor dashboard.</p>
            <div className="token-card">
              <div className="token-label">Your Queue Token</div>
              <div className="token-number">{tokenNumber}</div>
              <div className="token-meta"><Clock size={13} /> Estimated wait: <strong>15-20 min</strong></div>
            </div>
            <div className="token-info-grid">
              <div className="token-info-item">
                <Stethoscope size={15} />
                <span>Department</span>
                <strong>{form.department || "General Medicine"}</strong>
              </div>
              <div className="token-info-item">
                <User size={15} />
                <span>Patient</span>
                <strong>{form.name}</strong>
              </div>
              <div className="token-info-item">
                <Activity size={15} />
                <span>AI Triage</span>
                <strong className={"triage-badge " + (isEmergency ? "emergency" : "urgent")}>
                  {isEmergency ? "ESI-2 Emergent" : "ESI-3 Urgent"}
                </strong>
              </div>
            </div>
            <div className="token-footer-note">
              <ShieldCheck size={13} /> Data is encrypted and visible only to your consulting physician. ABDM compliant.
            </div>
            <button className="token-back-btn" onClick={onExit}>
              Return to Home <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch(step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <div className="kiosk-brand">
          <div className="kiosk-logo-mark"><HeartPulse size={17} color="white" /></div>
          <span className="kiosk-logo-text"><span>Medi</span><span className="logo-teal">Kiosk</span></span>
          <span className="kiosk-terminal-tag">Patient Portal</span>
        </div>
        <div className="kiosk-header-center">
          <div className="kiosk-progress-bar-wrap">
            <div className="kiosk-progress-bar-fill" style={{ width: progressPct + "%" }} />
          </div>
          <div className="kiosk-progress-label">
            <span>{STEPS[step-1].title}</span>
            <span className="kiosk-step-count">Step {step} of {STEPS.length}</span>
          </div>
        </div>
        <button className="kiosk-exit-btn" onClick={onExit}><X size={17} /> Exit</button>
      </header>
      <div className="kiosk-step-dots">
        {STEPS.map(s => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone = s.id < step;
          return (
            <div key={s.id} className={"step-dot" + (isActive ? " active" : "") + (isDone ? " done" : "")}>
              <div className="step-dot-circle">
                {isDone ? <Check size={12} /> : <Icon size={12} />}
              </div>
              <span className="step-dot-label">{s.title}</span>
              {s.id < STEPS.length && <div className="step-dot-connector" />}
            </div>
          );
        })}
      </div>
      <main className="kiosk-body">
        <div className="kiosk-card">{renderStep()}</div>
      </main>
      {!submitted && (
        <footer className="kiosk-footer-nav">
          <button className="kiosk-back-btn" onClick={() => step > 1 ? setStep(s => s-1) : onExit()}>
            <ArrowLeft size={15} /> {step === 1 ? "Back to Home" : "Back"}
          </button>
          {step < 5 && (
            <button
              className={"kiosk-next-btn" + (!canProceed() ? " disabled" : "")}
              disabled={!canProceed()}
              onClick={() => setStep(s => s+1)}
            >
              Continue <ArrowRight size={15} />
            </button>
          )}
        </footer>
      )}
    </div>
  );
}