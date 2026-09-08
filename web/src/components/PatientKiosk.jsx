import React, { useState, useEffect, useRef } from "react";
import {
  HeartPulse, Globe, User, FileText, ShieldCheck, CheckCircle2,
  ArrowRight, ArrowLeft, Mic, MicOff, Volume2, Activity,
  AlertCircle, Clock, Check, Stethoscope, BadgeCheck, X, Sparkles, VolumeX, RefreshCw
} from "lucide-react";
import "./PatientKiosk.css";

const LANGUAGES = [
  { code: "en", speechCode: "en-IN", name: "English", native: "English", flag: "EN", region: "International" },
  { code: "hi", speechCode: "hi-IN", name: "Hindi", native: "हिन्दी", flag: "HI", region: "North India" },
  { code: "bn", speechCode: "bn-IN", name: "Bengali", native: "বাংলা", flag: "BN", region: "East India" },
  { code: "ta", speechCode: "ta-IN", name: "Tamil", native: "தமிழ்", flag: "TA", region: "South India" },
  { code: "te", speechCode: "te-IN", name: "Telugu", native: "తెలుగు", flag: "TE", region: "South India" },
  { code: "mr", speechCode: "mr-IN", name: "Marathi", native: "मराठी", flag: "MR", region: "West India" },
  { code: "gu", speechCode: "gu-IN", name: "Gujarati", native: "ગુજરાતી", flag: "GU", region: "West India" },
  { code: "kn", speechCode: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", flag: "KN", region: "South India" },
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

// Keyword symptom detection map for English & Hindi
const KEYWORD_SYMPTOM_MAP = [
  { id: "s1", keywords: ["chest pain", "chest", "heart pain", "छाती में दर्द", "सीने में दर्द", "छाती दर्द", "चेस्ट पेन"] },
  { id: "s2", keywords: ["headache", "head pain", "head ache", "सर दर्द", "सिरदर्द", "सिर में दर्द", "माथा दर्द"] },
  { id: "s3", keywords: ["fever", "temperature", "hot body", "बुखार", "तापमान", "तेज़ बुखार", "फिवर्स"] },
  { id: "s4", keywords: ["breathlessness", "breathing", "short of breath", "सांस", "सांस फूलना", "सांस की तकलीफ", "दम फूलना"] },
  { id: "s5", keywords: ["body ache", "body pain", "शरीर में दर्द", "बदन दर्द", "शरीर दर्द"] },
  { id: "s6", keywords: ["stomach pain", "stomach", "belly pain", "पेट दर्द", "पेट में दर्द", "पेट की समस्या"] },
  { id: "s7", keywords: ["cough", "coughing", "खांसी", "कफ", "सूखी खांसी"] },
  { id: "s8", keywords: ["vomiting", "vomit", "nausea", "उल्टी", "मितली", "जी मिचलाना"] },
  { id: "s9", keywords: ["dizziness", "dizzy", "giddy", "चक्कर", "चक्कर आना", "सिर घूमना"] },
  { id: "s10", keywords: ["joint pain", "knee pain", "joints", "जोड़ों का दर्द", "घुटने का दर्द", "जोड़ दर्द"] },
  { id: "s11", keywords: ["back pain", "backache", "पीठ दर्द", "कमर दर्द", "पीठ में दर्द"] },
  { id: "s12", keywords: ["weakness", "weak", "tired", "fatigue", "कमजोरी", "थकान", "सुस्ती"] },
];

const FALLBACK_SPEECH_PHRASES = {
  hi: [
    "मुझे पिछले दो दिनों से बहुत तेज़ सिरदर्द है और थोड़ा बुखार महसूस हो रहा है।",
    "छाती में हल्का दर्द है और सांस लेने में भी थोड़ी दिक्कत हो रही है।",
    "पेट में दर्द है और सुबह से दो बार उल्टी भी हुई है।"
  ],
  en: [
    "I have been having a severe throbbing headache for the past two days along with mild fever.",
    "I feel chest tightness and slight breathlessness when walking upstairs.",
    "Severe stomach cramps since yesterday night with nausea and dizziness."
  ],
  bn: [
    "আমার গত দুদিন ধরে খুব মাথা ব্যথা এবং হালকা জ্বর আছে।",
    "বুকে সামান্য ব্যথা এবং শ্বাস নিতে কষ্ট হচ্ছে।",
    "পেটে ব্যথা এবং সকাল থেকে বমি বমি ভাব হচ্ছে।"
  ],
  ta: [
    "எனக்கு இரண்டு நாட்களாக கடுமையான தலைவலியும் லேசான காய்ச்சலும் உள்ளது.",
    "நெஞ்சில் லேசான வலியும் மூச்சு விடுவதில் சிரமமும் உள்ளது.",
    "வயிற்று வலியும் தலைச்சுற்றலும் உள்ளது."
  ],
  te: [
    "నాకు రెండు రోజులుగా తీవ్రమైన తలనొప్పి మరియు తేలికపాటి జ్వరం ఉంది.",
    "రొమ్ము నొప్పి మరియు శ్వాస తీసుకోవడంలో ఇబ్బంది ఉంది.",
    "కడుపు నొప్పి మరియు మైకముగా ఉంది."
  ]
};

export default function PatientKiosk({ onExit }) {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState({
    name: "", age: "", gender: "", phone: "", abhaId: "", department: "", visitReason: "",
  });
  const [consents, setConsents] = useState({ dataShare: false, aiAnalysis: false, digital: false });
  const [symptoms, setSymptoms] = useState([]);
  const [voiceText, setVoiceText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [autoExtracted, setAutoExtracted] = useState([]);
  const [speechError, setSpeechError] = useState("");
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);  // source-of-truth flag to avoid stale-closure bugs
  const simulIntervalRef = useRef(null);  // for cleanup of fallback simulation

  const selectedLang = LANGUAGES.find(l => l.code === lang);

  useEffect(() => {
    if (step === 5 && !tokenNumber) {
      setTokenNumber("B-" + (Math.floor(40 + Math.random() * 20)));
    }
  }, [step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
      if (simulIntervalRef.current) {
        clearInterval(simulIntervalRef.current);
        simulIntervalRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSymptom = (id) =>
    setSymptoms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const extractSymptomsFromText = (text) => {
    const lower = text.toLowerCase();
    const detected = [];
    KEYWORD_SYMPTOM_MAP.forEach(({ id, keywords }) => {
      if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
        detected.push(id);
      }
    });
    if (detected.length > 0) {
      setAutoExtracted(prev => Array.from(new Set([...prev, ...detected])));
      setSymptoms(prev => Array.from(new Set([...prev, ...detected])));
    }
  };

  const runSimulatedVoiceInput = (langCode) => {
    // Stop any existing simulation
    if (simulIntervalRef.current) {
      clearInterval(simulIntervalRef.current);
      simulIntervalRef.current = null;
    }
    isListeningRef.current = true;
    setIsListening(true);
    setInterimText("");
    setSpeechError("");

    const phrases = FALLBACK_SPEECH_PHRASES[langCode] || FALLBACK_SPEECH_PHRASES.en;
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    let charIdx = 0;

    simulIntervalRef.current = setInterval(() => {
      charIdx += 3;
      if (charIdx <= phrase.length) {
        setInterimText(phrase.substring(0, charIdx));
      } else {
        clearInterval(simulIntervalRef.current);
        simulIntervalRef.current = null;
        setVoiceText(prev => {
          const updated = (prev ? prev.trim() + " " : "") + phrase;
          extractSymptomsFromText(updated);
          return updated;
        });
        setInterimText("");
        isListeningRef.current = false;
        setIsListening(false);
      }
    }, 80);
  };

  const startListening = () => {
    if (isListeningRef.current) return;  // already listening

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const currentLang = lang;  // capture in closure
    const speechCode = selectedLang?.speechCode || "en-IN";

    if (!SpeechRecognition) {
      runSimulatedVoiceInput(currentLang);
      return;
    }

    // Tear down any existing instance first
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = speechCode;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setSpeechError("");
        setInterimText("");
      };

      recognition.onresult = (event) => {
        let finalStr = "";
        let interimStr = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript + " ";
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }
        if (finalStr.trim()) {
          setVoiceText(prev => {
            const updated = (prev ? prev.trim() + " " : "") + finalStr.trim();
            extractSymptomsFromText(updated);
            return updated;
          });
        }
        setInterimText(interimStr);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        const fatalErrors = ['not-allowed', 'service-not-allowed', 'no-default-microphone'];
        const networkErrors = ['network', 'audio-capture', 'aborted'];
        isListeningRef.current = false;
        setIsListening(false);
        setInterimText("");
        if (fatalErrors.includes(event.error)) {
          setSpeechError("Mic access denied. Tap mic to use voice simulation instead.");
          recognitionRef.current = null;
        } else if (networkErrors.includes(event.error)) {
          setSpeechError("Voice network error — switching to offline simulation.");
          recognitionRef.current = null;
          // Auto-run simulation after short delay
          setTimeout(() => runSimulatedVoiceInput(currentLang), 300);
        } else if (event.error === 'no-speech') {
          // Ignore no-speech — just clear interim, stay ready
          setInterimText("");
          isListeningRef.current = false;
          setIsListening(false);
        } else {
          setSpeechError(`Voice error: ${event.error} — tap mic to retry.`);
          recognitionRef.current = null;
        }
      };

      recognition.onend = () => {
        // Only flip state if we haven't been explicitly stopped
        if (isListeningRef.current) {
          isListeningRef.current = false;
        }
        setIsListening(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech start failed:", err);
      isListeningRef.current = false;
      setIsListening(false);
      setSpeechError("Browser voice API unavailable — using simulation.");
      setTimeout(() => runSimulatedVoiceInput(currentLang), 200);
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    // Stop real recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    // Stop simulation
    if (simulIntervalRef.current) {
      clearInterval(simulIntervalRef.current);
      simulIntervalRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  };

  const toggleVoice = () => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  };

  const playTTS = (textToSpeak) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak || voiceText);
    utterance.lang = selectedLang?.speechCode || "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeakingTTS(true);
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  const clearVoiceText = () => {
    setVoiceText("");
    setInterimText("");
  };

  const canProceed = () => {
    if (step === 1) return !!lang;
    if (step === 2) return form.name && form.age && form.gender && form.phone;
    if (step === 3) return consents.dataShare && consents.aiAnalysis && consents.digital;
    if (step === 4) return symptoms.length > 0 || voiceText.trim();
    return true;
  };

  const allConsents = consents.dataShare && consents.aiAnalysis && consents.digital;
  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  const renderStep1 = () => (
    <div className="kiosk-step-content">
      <div className="kiosk-step-header">
        <div className="step-icon-wrap"><Globe size={26} /></div>
        <h2>Choose Your Language</h2>
        <p>Select your preferred language for this session. Voice recognition and audio guide will adapt automatically.</p>
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
        <Volume2 size={14} /> Voice recognition &amp; guidance ready in <strong>&nbsp;{selectedLang?.name} ({selectedLang?.native})</strong>
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
        <p>Select your symptoms or describe your condition using voice in <strong>{selectedLang?.name}</strong>.</p>
      </div>
      <div className="assessment-grid">
        <div className="assessment-pane">
          <div className="pane-label">Quick Symptom Selection</div>
          <div className="symptom-chips">
            {SYMPTOM_CHIPS.map(({ id, label, severity }) => {
              const isSelected = symptoms.includes(id);
              const isAuto = autoExtracted.includes(id);
              return (
                <button
                  key={id}
                  className={"symptom-chip severity-" + severity + (isSelected ? " selected" : "") + (isAuto ? " auto-detected" : "")}
                  onClick={() => toggleSymptom(id)}
                >
                  {label}
                  {isAuto && <Sparkles size={11} className="chip-auto-icon" title="AI Auto-detected from voice" />}
                  {isSelected && <Check size={11} className="chip-check" />}
                </button>
              );
            })}
          </div>
          {symptoms.length > 0 && (
            <div className="selected-count">
              <AlertCircle size={13} /> {symptoms.length} symptom{symptoms.length > 1 ? "s" : ""} selected
              {autoExtracted.length > 0 && (
                <span className="auto-detect-count-tag">
                  <Sparkles size={11} /> {autoExtracted.length} auto-extracted from voice
                </span>
              )}
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
          <div className="pane-label-row">
            <span className="pane-label">Voice Symptom Input ({selectedLang?.native})</span>
            <span className="lang-active-badge">
              <Globe size={11} /> {selectedLang?.speechCode}
            </span>
          </div>

          <button type="button" className={"voice-record-btn" + (isListening ? " listening" : "")} onClick={toggleVoice}>
            <div className="voice-btn-inner">
              {isListening ? (
                <>
                  <div className="mic-pulse-rings"><span /><span /><span /></div>
                  <MicOff size={22} className="mic-listening-icon" />
                  <span className="mic-status-text">Listening in {selectedLang?.name}... Tap to stop</span>
                </>
              ) : (
                <>
                  <Mic size={22} />
                  <span className="mic-status-text">Tap mic &amp; speak your symptoms</span>
                  <span className="mic-subtext">Works in Hindi, English &amp; 6 more languages</span>
                </>
              )}
            </div>
            {isListening && (
              <div className="soundwave">
                {[...Array(11)].map((_, i) => (
                  <span key={i} className="sw-bar" style={{ animationDelay: (i * 0.07) + "s" }} />
                ))}
              </div>
            )}
          </button>

          {speechError && (
            <div className="speech-error-banner">
              <AlertCircle size={13} /> {speechError}
            </div>
          )}

          <div className="voice-transcript-area">
            {/* Live interim speech shown as a separate overlay so controlled input isn't blocked */}
            {interimText && (
              <div className="interim-text-preview">
                <span className="interim-icon"><Mic size={11} /></span>
                <span className="interim-words">{interimText}</span>
                <span className="interim-blink" />
              </div>
            )}
            <textarea
              placeholder={`Your spoken words in ${selectedLang?.name} will appear here... or type directly`}
              value={voiceText}
              onChange={e => {
                setVoiceText(e.target.value);
                extractSymptomsFromText(e.target.value);
              }}
              rows={5}
            />
            <div className="transcript-actions-bar">
              {voiceText && (
                <div className="transcript-actions-left">
                  <button
                    type="button"
                    className={"tts-btn" + (isSpeakingTTS ? " speaking" : "")}
                    onClick={() => playTTS(voiceText)}
                    title="Read aloud transcript"
                  >
                    {isSpeakingTTS ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    {isSpeakingTTS ? "Stop Reading" : "Read Aloud"}
                  </button>
                  <button type="button" className="clear-text-btn" onClick={clearVoiceText} title="Clear transcript">
                    <X size={12} /> Clear
                  </button>
                </div>
              )}
              {(voiceText || isListening) && (
                <div className="transcript-pill">
                  <Volume2 size={11} /> {isListening ? "Live Transcribing" : "AI Transcribed"} &middot; {selectedLang?.name}
                </div>
              )}
            </div>
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