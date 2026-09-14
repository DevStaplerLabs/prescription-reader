import React, { useState, useEffect, useRef } from "react";
import {
  HeartPulse, Globe, User, FileText, ShieldCheck, CheckCircle2,
  ArrowRight, ArrowLeft, Mic, MicOff, Volume2, Activity,
  AlertCircle, Clock, Check, Stethoscope, BadgeCheck, X, Sparkles, VolumeX, RefreshCw, Send, UserRound,
  Camera, FileUp, Pill
} from "lucide-react";
import "./PatientKiosk.css";
import { requestAiTriageQuestions } from "../services/aiTriageService";
import { generateSpokenPrescriptionSummary } from "../services/prescriptionVoiceSummary";

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


const DISEASE_CATEGORIES = [
  {
    category: "Cardiovascular & Thoracic",
    items: [
      {
        id: "d_angina",
        name: "Acute Coronary Syndrome / Angina",
        risk: "critical",
        badge: "Critical Cardiac",
        keywords: [
          "crushing", "left arm", "radiat", "jaw", "neck", "profuse sweat", "cold sweat", "heart attack", "angina", "left hand",
          "दिल का दौरा", "एंजाइना", "बाएं हाथ", "जबड़ा", "गर्दन", "पसीना", "भारी दबाव", "जकड़न"
        ]
      },
      {
        id: "d_costo",
        name: "Costochondritis (Chest Wall Strain)",
        risk: "low",
        badge: "Musculoskeletal",
        keywords: [
          "touch", "press", "pressing", "movement", "rib", "muscle", "strain", "sharp", "bone",
          "दबाने पर", "मांसपेशी", "हड्डी", "हिलने पर", "दबाने"
        ]
      },
      {
        id: "d_gerd",
        name: "GERD / Gastric Acid Reflux",
        risk: "low",
        badge: "Gastric (Benign)",
        keywords: [
          "acid", "acidity", "gas", "burning", "heartburn", "after eating", "food", "burp", "belch", "antacid", "eno", "spicy",
          "जलन", "गैस", "एसिडिटी", "खट्टी डकार", "खाना खाने के बाद", "सीने में जलन"
        ]
      }
    ]
  },
  {
    category: "Respiratory & Infectious",
    items: [
      {
        id: "d_asthma",
        name: "Bronchial Asthma / COPD",
        risk: "urgent",
        badge: "Pulmonary",
        keywords: [
          "asthma", "wheezing", "inhaler", "breathless", "short of breath", "chest tightness",
          "दमा", "अस्थमा", "सांस फूलना", "सीटी जैसी आवाज", "दम घुटना"
        ]
      },
      {
        id: "d_flu",
        name: "Viral Pyrexia / Influenza",
        risk: "moderate",
        badge: "Viral Syndrome",
        keywords: [
          "fever", "chills", "body ache", "shivering", "temperature", "flu", "cold", "viral",
          "बुखार", "ठंड", "कंपकंपी", "बदन दर्द", "फ्लू", "वायरल"
        ]
      },
      {
        id: "d_bronchitis",
        name: "Acute Bronchitis",
        risk: "moderate",
        badge: "Lower Airway",
        keywords: [
          "cough", "phlegm", "mucus", "yellow cough", "congestion",
          "खांसी", "बलगम", "कफ", "छाती में जकड़न"
        ]
      }
    ]
  },
  {
    category: "Gastrointestinal & Neurological",
    items: [
      {
        id: "d_ge",
        name: "Acute Gastroenteritis",
        risk: "urgent",
        badge: "Gastrointestinal",
        keywords: [
          "vomit", "nausea", "diarrhea", "loose motion", "stomach cramp", "food poisoning", "stomach pain",
          "उल्टी", "दस्त", "पतले दस्त", "पेट मरोड़", "जी मिचलाना", "पेट दर्द"
        ]
      },
      {
        id: "d_migraine",
        name: "Migraine / Vascular Headache",
        risk: "moderate",
        badge: "Neurological",
        keywords: [
          "headache", "throbbing", "one side", "light sensitivity", "migraine", "aura", "sound sensitivity",
          "आधा सिर दर्द", "माइग्रेन", "तेज सिरदर्द", "रोशनी से परेशानी", "सिरदर्द"
        ]
      },
      {
        id: "d_spondylosis",
        name: "Lumbar / Cervical Spondylosis",
        risk: "low",
        badge: "Orthopaedic",
        keywords: [
          "back pain", "spine", "neck stiffness", "lower back", "sciatica", "joint pain",
          "कमर दर्द", "रीढ़ की हड्डी", "गर्दन में अकड़न", "पीठ दर्द", "जोड़ों का दर्द"
        ]
      }
    ]
  }
];

const SYMPTOM_CHIPS = [
  { id: "s1", label: "Chest Pain", severity: "adaptive" },
  { id: "s2", label: "Headache", severity: "medium" },
  { id: "s3", label: "Fever", severity: "medium" },
  { id: "s4", label: "Breathlessness", severity: "adaptive" },
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
  { id: 4, title: "Records", icon: FileText },
  { id: 5, title: "Assessment", icon: Activity },
  { id: 6, title: "Review", icon: CheckCircle2 },
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
  { id: "s10", keywords: ["joint pain", "knee pain", "joints", "जोड़ों का दर्द", "घुटने का दर्द", "जोड़ दर्द", "जोड़ों", "घुटनों", "घुटने", "जोड़"] },
  { id: "s11", keywords: ["back pain", "backache", "पीठ दर्द", "कमर दर्द", "पीठ में दर्द"] },
  { id: "s12", keywords: ["weakness", "weak", "tired", "fatigue", "कमजोरी", "थकान", "सुस्ती"] },
];

const FALLBACK_SPEECH_PHRASES = {
  hi: [
    "सीने में जलन और एसिडिटी हो रही है, खाना खाने के बाद दर्द बढ़ता है पर पसीना या हाथ में दर्द बिल्कुल नहीं है।",
    "सीने में बहुत तेज भारी दबाव है जो बाएं हाथ और जबड़े तक फैल रहा है और बहुत ठंडा पसीना आ रहा है।",
    "सीने की पसली पर दबाने से दर्द होता है, सांस लेने में कोई परेशानी नहीं है।",
    "मुझे पिछले दो दिनों से तेज़ सिरदर्द और थोड़ा बुखार महसूस हो रहा है।"
  ],
  en: [
    "I have mild chest burning and acidity since lunch, but no sweating and pain does not go to my arm.",
    "I have sharp pain in my chest that hurts only when I press on the rib bone, no breathlessness.",
    "Severe substernal crushing chest pain radiating down my left arm with cold sweats.",
    "I have been having a severe throbbing headache for the past two days along with mild fever."
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



// Negation-aware keyword detection to prevent marking negated symptoms/red-flags as positive
export const hasAffirmedKeyword = (text, kw) => {
  if (!text || !kw) return false;
  const lowerText = text.toLowerCase();
  const lowerKw = kw.toLowerCase();
  let searchPos = 0;
  
  while ((searchPos = lowerText.indexOf(lowerKw, searchPos)) !== -1) {
    const start = Math.max(0, searchPos - 35);
    const preceding = lowerText.substring(start, searchPos);
    const isNegated = [
      /\bno\b/i, /\bnot\b/i, /\bwithout\b/i, /\bdenies\b/i, /\bnever\b/i, 
      /\bno\s+pain\b/i, /\bno\s+difficulty\b/i, /\bdont\b/i, /\bdon't\b/i,
      /नहीं/u, /ना\b/u, /बिल्कुल\s*नहीं/u, /कोई\s*नहीं/u
    ].some(rx => rx.test(preceding));

    if (!isNegated) {
      return true;
    }
    searchPos += lowerKw.length;
  }
  return false;
};

const evaluateClinicalTriage = (chatHistory, symptoms, selectedDiseases = []) => {
  const userText = chatHistory
    .filter(m => m.sender === 'user')
    .map(m => m.text.toLowerCase())
    .join(" ");

  // Cardiac red flags
  const cardiacRedFlags = [
    "left arm", "to the arm", "radiat", "jaw", "neck", "shoulder", 
    "crushing", "heavy pressure", "elephant", "squeeze", "sweat", "cold sweat", 
    "profuse sweat", "diaphoresis", "faint", "blackout",
    "बाएं हाथ", "हाथ में", "जबड़ा", "जबड़े", "गर्दन", "पसीना", "ठंडा पसीना", "भारी दबाव", "जकड़न", "चक्कर"
  ];

  // Benign non-cardiac indicators
  const benignIndicators = [
    "acid", "acidity", "gas", "burning", "heartburn", "after food", "after meal", 
    "antacid", "eno", "burp", "belch", "muscle", "press", "touch", "sharp", "movement",
    "no radiation", "no sweat", "not radiating", "no sweating", "mild", "nahi",
    "जलन", "गैस", "एसिडिटी", "खट्टी डकार", "खाना खाने के बाद", "दबाने पर", "मांसपेशी", "नहीं फैल रहा", "पसीना नहीं"
  ];

  const hasChestComplaint = hasAffirmedKeyword(userText, "chest") || hasAffirmedKeyword(userText, "heart") || 
                           hasAffirmedKeyword(userText, "सीने") || hasAffirmedKeyword(userText, "छाती") || 
                           symptoms.includes("s1");

  // Only trigger cardiac red flag if an affirmed (NON-NEGATED) cardiac symptom was stated
  const hasCardiacRedFlags = cardiacRedFlags.some(kw => hasAffirmedKeyword(userText, kw)) ||
                            selectedDiseases.includes("d_angina");

  const hasBenignGastricOrMuscular = benignIndicators.some(kw => hasAffirmedKeyword(userText, kw)) ||
                                     selectedDiseases.includes("d_gerd") || 
                                     selectedDiseases.includes("d_costo");

  if (hasChestComplaint) {
    if (hasCardiacRedFlags) {
      return {
        level: "high",
        label: "ESI-2 Emergent",
        color: "#DC2626",
        flagged: true,
        reason: "Cardiac Red Flag: Chest pain radiating to left arm/jaw or accompanied by diaphoresis & crushing pressure.",
        clinicalFrame: "High suspicion of Acute Coronary Syndrome. Stat ECG, cardiac enzymes, and urgent cardiology consult indicated."
      };
    } else if (hasBenignGastricOrMuscular) {
      return {
        level: "low",
        label: "ESI-4 Non-Urgent",
        color: "#059669",
        flagged: false,
        reason: "Atypical Non-Cardiac Chest Discomfort: Symptoms consistent with GERD / Gastric reflux or chest wall strain. No cardiac red flags reported.",
        clinicalFrame: "Atypical non-anginal chest discomfort. Stable hemodynamics, likely gastrointestinal/musculoskeletal origin. Routine OPD review."
      };
    } else {
      return {
        level: "medium",
        label: "ESI-3 Urgent",
        color: "#D97706",
        flagged: false,
        reason: "Undifferentiated Chest Discomfort: Moderate severity without overt cardiac red flags. Requires routine ECG.",
        clinicalFrame: "Chest discomfort of moderate acuity. Rule out ischemic etiology via baseline ECG."
      };
    }
  }

  const isSevereBreath = (userText.includes("breath") || userText.includes("सांस")) && 
                         (userText.includes("severe") || userText.includes("gasp") || userText.includes("बहुत ज्यादा"));
  if (isSevereBreath) {
    return {
      level: "high",
      label: "ESI-2 Emergent",
      color: "#DC2626",
      flagged: true,
      reason: "Respiratory Distress: Severe shortness of breath reported.",
      clinicalFrame: "Acute Respiratory Distress requiring urgent physician review."
    };
  }

  if (userText.includes("fever") || userText.includes("बुखार") || 
      userText.includes("pain") || userText.includes("दर्द") || 
      userText.includes("vomit") || userText.includes("उल्टी")) {
    return {
      level: "medium",
      label: "ESI-3 Urgent",
      color: "#D97706",
      flagged: false,
      reason: "Acute Symptom Presentation: Moderate urgency requiring standard OPD consultation.",
      clinicalFrame: "Standard symptomatic presentation with stable vitals."
    };
  }

  return {
    level: "low",
    label: "ESI-4 Non-Urgent",
    color: "#059669",
    flagged: false,
    reason: "Routine OPD Visit: Stable presentation.",
    clinicalFrame: "Standard non-urgent consultation."
  };
};

const calculateMedicationDuration = (prescriptionDateStr) => {
  if (!prescriptionDateStr) {
    const todayFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return {
      elapsedDays: 0,
      takingDurationText: "Patient started taking this medicine today",
      prescriptionDateFormatted: todayFormatted
    };
  }

  const rxDate = new Date(prescriptionDateStr);
  const now = new Date();

  const formattedDate = !isNaN(rxDate.getTime()) 
    ? rxDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : prescriptionDateStr;

  if (isNaN(rxDate.getTime())) {
    return {
      elapsedDays: 0,
      takingDurationText: "Active prescription regimen",
      prescriptionDateFormatted: formattedDate
    };
  }

  const diffMs = now.getTime() - rxDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  let durationText = "";
  if (diffDays === 0) {
    durationText = "Patient started taking this medicine today";
  } else if (diffDays === 1) {
    durationText = "Patient is taking this medicine for 1 day";
  } else if (diffDays < 30) {
    durationText = `Patient is taking this medicine for ${diffDays} days`;
  } else {
    const months = Math.floor(diffDays / 30);
    const remDays = diffDays % 30;
    if (remDays === 0) {
      durationText = `Patient is taking this medicine for ${months} month${months > 1 ? 's' : ''}`;
    } else {
      durationText = `Patient is taking this medicine for ${months} month${months > 1 ? 's' : ''} and ${remDays} day${remDays > 1 ? 's' : ''} (${diffDays} days total)`;
    }
  }

  return {
    elapsedDays: diffDays,
    takingDurationText: durationText,
    prescriptionDateFormatted: formattedDate
  };
};

const SAMPLE_PRESCRIPTIONS = [
  {
    id: 'rx_gerd',
    title: 'Gastroenterology Rx',
    doctor: 'Dr. A. K. Verma (MBBS, MD - Gastro)',
    date: '10/09/2026',
    dateIso: '2026-09-10',
    type: 'Handwritten OPD Prescription (Digitized)',
    preview: 'Pantocid DSR, Mucaine Gel, Ganaton',
    medicines: [
      { name: 'Tab. Pantocid DSR', dosage: '40 mg', frequency: 'OD (Before Breakfast)', duration: '14 Days' },
      { name: 'Syp. Mucaine Gel', dosage: '10 ml', frequency: 'TDS (Post Meals SOS)', duration: '7 Days' },
      { name: 'Tab. Ganaton Total', dosage: '50 mg', frequency: 'BD (Before Meals)', duration: '10 Days' }
    ],
    insights: [
      'Active GERD & Acid-Peptic Disorder maintenance regimen',
      'No adverse drug-drug contraindications with acute triage'
    ]
  },
  {
    id: 'rx_cardiac',
    title: 'Cardiology Maintenance Rx',
    doctor: 'Dr. P. K. Singh (MBBS, MD - Cardiology)',
    date: '15/08/2026',
    dateIso: '2026-08-15',
    type: 'Handwritten Cardiology Prescription (Digitized)',
    preview: 'Ecosprin 75, Telma 40, Rosuvas 10',
    medicines: [
      { name: 'Tab. Ecosprin 75', dosage: '75 mg', frequency: 'OD (Post Lunch)', duration: '30 Days' },
      { name: 'Tab. Telma 40', dosage: '40 mg', frequency: 'OD (Morning)', duration: '30 Days' },
      { name: 'Tab. Rosuvas 10', dosage: '10 mg', frequency: 'HS (Bedtime)', duration: '30 Days' }
    ],
    insights: [
      'Hypertension & Post-ACS Secondary Prevention therapy',
      'Regular BP and lipid profile tracking indicated'
    ]
  },
  {
    id: 'rx_general',
    title: 'General Medicine Rx',
    doctor: 'Dr. Neha Gupta (MBBS, DNB - Medicine)',
    date: '12/09/2026',
    dateIso: '2026-09-12',
    type: 'Handwritten OPD Prescription (Digitized)',
    preview: 'Augmentin 625, Dolo 650, Montair-LC',
    medicines: [
      { name: 'Tab. Augmentin 625', dosage: '625 mg', frequency: 'BD (After Food)', duration: '5 Days' },
      { name: 'Tab. Dolo 650', dosage: '650 mg', frequency: 'TDS (SOS Fever)', duration: '3 Days' },
      { name: 'Tab. Montair-LC', dosage: '10 mg', frequency: 'HS (Night)', duration: '7 Days' }
    ],
    insights: [
      'Acute Upper Respiratory Infection antibiotic course',
      'Ensure 5-day antibiotic completion'
    ]
  }
];

export default function PatientKiosk({ onExit }) {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState({
    name: "", age: "", gender: "", phone: "", abhaId: "", department: "", visitReason: "",
  });
  const [consents, setConsents] = useState({ dataShare: false, aiAnalysis: false, digital: false });
  const [symptoms, setSymptoms] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [autoDetectedDiseases, setAutoDetectedDiseases] = useState([]);

  const toggleDisease = (id) => {
    setSelectedDiseases(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const extractDiseasesFromText = (text) => {
    const lower = text.toLowerCase();
    const detected = [];
    DISEASE_CATEGORIES.forEach(cat => {
      cat.items.forEach(item => {
        if (item.keywords.some(kw => hasAffirmedKeyword(lower, kw))) {
          detected.push(item.id);
        }
      });
    });
    if (detected.length > 0) {
      setAutoDetectedDiseases(prev => Array.from(new Set([...prev, ...detected])));
      setSelectedDiseases(prev => Array.from(new Set([...prev, ...detected])));
    }
  };
  const [voiceText, setVoiceText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [autoExtracted, setAutoExtracted] = useState([]);
  const [speechError, setSpeechError] = useState("");
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [docUploadState, setDocUploadState] = useState('idle'); // idle, scanning, complete, error
  const [uploadError, setUploadError] = useState("");
  const [extractedDocData, setExtractedDocData] = useState(null);
  const [tokenNumber, setTokenNumber] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // New Chat & AYUSH states
  const [systemMode, setSystemMode] = useState("allopathy"); 
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", text: "What symptoms are you experiencing today? You can type or use the mic." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [questionQueue, setQuestionQueue] = useState([]);
  const [identifiedConditions, setIdentifiedConditions] = useState([]);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [activeBranch, setActiveBranch] = useState(null);
  
  useEffect(() => {
    setChatHistory(prev => {
      if (prev.length === 1 && prev[0].sender === "ai") {
         return [{ sender: "ai", text: lang === "hi" ? "आज आपको क्या लक्षण महसूस हो रहे हैं? आप टाइप कर सकते हैं या माइक का उपयोग कर सकते हैं।" : "What symptoms are you experiencing today? You can type or use the mic." }];
      }
      return prev;
    });
  }, [lang]);
  
  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const simulIntervalRef = useRef(null);
  const activeTtsTimeoutRef = useRef(null);
  const activeUtteranceRef = useRef(null);
  const ttsQueueRef = useRef([]);
  
  // Refs for state accessed inside closures (Web Speech API)
  const chatHistoryRef = useRef(chatHistory);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);
  
  const interimTextRef = useRef("");
  const voiceTextRef = useRef("");
  useEffect(() => { interimTextRef.current = interimText; }, [interimText]);
  useEffect(() => { voiceTextRef.current = voiceText; }, [voiceText]);
  const questionQueueRef = useRef(questionQueue);
  useEffect(() => { questionQueueRef.current = questionQueue; }, [questionQueue]);
  const identifiedConditionsRef = useRef(identifiedConditions);
  useEffect(() => { identifiedConditionsRef.current = identifiedConditions; }, [identifiedConditions]);
  const askedQuestionsRef = useRef(askedQuestions);
  useEffect(() => { askedQuestionsRef.current = askedQuestions; }, [askedQuestions]);
  const activeBranchRef = useRef(activeBranch);
  useEffect(() => { activeBranchRef.current = activeBranch; }, [activeBranch]);
  const systemModeRef = useRef(systemMode);
  useEffect(() => { systemModeRef.current = systemMode; }, [systemMode]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, interimText, isAiTyping]);

  const handleSendChat = async (text = chatInput) => {
    stopTTS();
    if (!text.trim()) return;
    const msgText = text.trim();
    
    setChatHistory(prev => [...prev, { sender: "user", text: msgText }]);
    setChatInput("");
    extractSymptomsFromText(msgText);
    extractDiseasesFromText(msgText);
    
    setIsAiTyping(true);

    try {
      const currentQueue = [...questionQueueRef.current];
      const prevConditions = [...identifiedConditionsRef.current];
      const prevAsked = [...askedQuestionsRef.current];

      // Request dynamic disease-specific questions from AI
      const aiData = await requestAiTriageQuestions({
        userMessage: msgText,
        knownConditions: prevConditions,
        askedQuestions: prevAsked,
        chatHistory: chatHistoryRef.current,
        lang
      });

      let updatedConditions = [...prevConditions];
      if (aiData && aiData.newCondition && !prevConditions.includes(aiData.newCondition)) {
        updatedConditions = [...prevConditions, aiData.newCondition];
        setIdentifiedConditions(updatedConditions);

        // Queue logic:
        // 1. First condition: AI generated 4 essential questions specifically for that condition.
        // 2. Additional condition: AI generated 3 questions relevant to BOTH previous & new conditions.
        if (Array.isArray(aiData.generatedQuestions) && aiData.generatedQuestions.length > 0) {
          currentQueue.push(...aiData.generatedQuestions);
        }
      }

      // If user answer already provided information for a queued question, filter it out
      if (aiData && aiData.answeredQuestionKeyword) {
        const kw = aiData.answeredQuestionKeyword.toLowerCase();
        const filteredQueue = currentQueue.filter(q => !q.toLowerCase().includes(kw));
        currentQueue.length = 0;
        currentQueue.push(...filteredQueue);
      }

      let aiResponse = "";
      if (currentQueue.length > 0) {
        // Pop next question from queue in order
        const nextQ = currentQueue.shift();
        setAskedQuestions(prev => [...prev, nextQ]);

        // Formulate response with polite acknowledgment if available
        if (aiData?.briefAcknowledgment && (aiData?.newCondition || chatHistoryRef.current.length <= 2)) {
          aiResponse = `${aiData.briefAcknowledgment} ${nextQ}`;
        } else if (aiData?.briefAcknowledgment && Math.random() > 0.5) {
          aiResponse = `${aiData.briefAcknowledgment} ${nextQ}`;
        } else {
          aiResponse = nextQ;
        }
      } else {
        // Queue completed
        aiResponse = lang === "hi"
          ? "विस्तृत जानकारी के लिए धन्यवाद। मैंने आपकी सभी स्वास्थ्य जानकारी डॉक्टर के लिए संकलित कर ली है। अब आप अपना सारांश देखने के लिए 'Continue' पर क्लिक कर सकते हैं।"
          : "Thank you for providing these details. I have compiled your complete symptom assessment and triage summary for the consulting physician. Please click Continue to review.";
      }

      setQuestionQueue(currentQueue);
      setIsAiTyping(false);
      if (aiResponse) {
        setChatHistory(prev => [...prev, { sender: "ai", text: aiResponse }]);
        if (!speechError) playTTS(aiResponse, true);
      }
    } catch (err) {
      console.error("AI Triage Queue Error:", err);
      setIsAiTyping(false);
      const fallbackQ = lang === "hi"
        ? "क्या आप बता सकते हैं कि यह तकलीफ कितने दिनों से है और क्या यह बढ़ रही है?"
        : "Could you describe how many days you have had these symptoms and whether they are worsening?";
      setChatHistory(prev => [...prev, { sender: "ai", text: fallbackQ }]);
      if (!speechError) playTTS(fallbackQ, true);
    }
  };

  const selectedLang = LANGUAGES.find(l => l.code === lang);

  useEffect(() => {
    if (step === 6 && !tokenNumber) {
      setTokenNumber("B-" + (Math.floor(40 + Math.random() * 20)));
    }
  }, [step]);

  // Read aloud the initial greeting ONLY when user arrives on Step 5 (Assessment / Conversation)
  useEffect(() => {
    // If not on step 5 (e.g. on Step 4 Records/Upload Docs or Step 3 Consent), immediately silence any audio
    if (step !== 5) {
      stopTTS();
      return;
    }

    // When explicitly arriving on Step 5: Clinical Assessment & Conversation
    if (step === 5) {
      const timer = setTimeout(() => {
        if (chatHistoryRef.current && chatHistoryRef.current.length >= 1) {
          const firstMessage = chatHistoryRef.current[0]?.text;
          if (firstMessage) {
            playTTS(firstMessage, true);
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Pre-load voices on mount to ensure they are available for playTTS
  useEffect(() => {
    if (window.speechSynthesis) {
       window.speechSynthesis.getVoices();
       window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

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
      stopTTS();
    };
  }, []);

  const toggleSymptom = (id) =>
    setSymptoms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const extractSymptomsFromText = (text) => {
    extractDiseasesFromText(text);
    const lower = text.toLowerCase();
    const detected = [];
    KEYWORD_SYMPTOM_MAP.forEach(({ id, keywords }) => {
      if (keywords.some(kw => hasAffirmedKeyword(lower, kw))) {
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
        isListeningRef.current = false;
        setIsListening(false);
        setInterimText("");
        setVoiceText("");
        handleSendChat(phrase);
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
          setInterimText("");
          isListeningRef.current = false;
          setIsListening(false);
        } else {
          setSpeechError(`Voice error: ${event.error} — tap mic to retry.`);
          recognitionRef.current = null;
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          // If ended unexpectedly
          isListeningRef.current = false;
          setIsListening(false);
        }
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
    
    // Capture the text we have right now using the refs
    const finalSpoken = (voiceTextRef.current + " " + interimTextRef.current).trim();

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (simulIntervalRef.current) {
      clearInterval(simulIntervalRef.current);
      simulIntervalRef.current = null;
    }
    
    setIsListening(false);
    setInterimText("");
    setVoiceText("");
    
    if (finalSpoken) {
      handleSendChat(finalSpoken);
    }
  };

  const toggleVoice = () => {
    stopTTS();
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  };

  const stopTTS = () => {
    if (activeTtsTimeoutRef.current) {
      clearTimeout(activeTtsTimeoutRef.current);
      activeTtsTimeoutRef.current = null;
    }
    ttsQueueRef.current = [];
    activeUtteranceRef.current = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsSpeakingTTS(false);
  };

  /**
   * Fast, natural, sentence-level streaming TTS.
   * Splits text into sentences, immediately dispatches the 1st sentence (< 40ms onset),
   * and queues subsequent sentences with a natural 70ms conversational cadence.
   */
  const playTTS = (textToSpeak, forceSpeak = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeakingTTS && !forceSpeak) {
      stopTTS();
      return;
    }

    stopTTS();

    const fullText = (textToSpeak || voiceText || "").trim();
    if (!fullText) return;

    // Sentence splitter keeping punctuation
    const rawSentences = fullText
      .replace(/([.!?।])\s+/g, "$1|SPLIT|")
      .split("|SPLIT|")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const sentences = rawSentences.length > 0 ? rawSentences : [fullText];
    ttsQueueRef.current = [...sentences];

    const targetLangCode = selectedLang?.speechCode || (lang === 'hi' ? "hi-IN" : "en-IN");
    
    // Choose the best regional or natural voice
    const availableVoices = window.speechSynthesis.getVoices() || [];
    let bestVoice = null;

    if (lang === 'hi') {
      bestVoice = availableVoices.find(v => v.lang?.startsWith('hi') && (v.name?.includes('Natural') || v.name?.includes('Google') || v.name?.includes('हिन्दी')))
        || availableVoices.find(v => v.lang?.startsWith('hi'));
    } else {
      bestVoice = availableVoices.find(v => (v.lang === 'en-IN' || v.lang === 'en-GB' || v.lang === 'en-US') && (v.name?.includes('Natural') || v.name?.includes('Female') || v.name?.includes('Google')))
        || availableVoices.find(v => v.lang?.startsWith('en'));
    }

    let sentenceIdx = 0;

    const speakNextSentence = () => {
      if (sentenceIdx >= sentences.length) {
        setIsSpeakingTTS(false);
        activeUtteranceRef.current = null;
        return;
      }

      const currentSentence = sentences[sentenceIdx];
      sentenceIdx++;

      try {
        const utterance = new SpeechSynthesisUtterance(currentSentence);
        if (bestVoice) utterance.voice = bestVoice;
        utterance.lang = targetLangCode;
        utterance.rate = lang === 'hi' ? 1.02 : 1.05;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeakingTTS(true);
        };

        utterance.onend = () => {
          if (sentenceIdx < sentences.length) {
            // Conversational pause between sentences (70ms)
            activeTtsTimeoutRef.current = setTimeout(speakNextSentence, 70);
          } else {
            setIsSpeakingTTS(false);
            activeUtteranceRef.current = null;
          }
        };

        utterance.onerror = (e) => {
          console.warn("TTS sentence playback error:", e);
          if (sentenceIdx < sentences.length) {
            speakNextSentence();
          } else {
            setIsSpeakingTTS(false);
            activeUtteranceRef.current = null;
          }
        };

        activeUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("SpeechSynthesis error:", err);
        setIsSpeakingTTS(false);
      }
    };

    // Immediate start on sentence 0
    speakNextSentence();
  };

  const clearVoiceText = () => {
    setVoiceText("");
    setInterimText("");
  };

  const canProceed = () => {
    if (step === 1) return !!lang;
    if (step === 2) return form.name && form.age && form.gender && form.phone;
    if (step === 3) return consents.dataShare && consents.aiAnalysis && consents.digital;
    if (step === 4) return true;
    if (step === 5) return chatHistory.length > 1;
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

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleSimulateScan = (presetRx = null) => {
    setDocUploadState('scanning');
    setUploadError('');
    const rx = presetRx || SAMPLE_PRESCRIPTIONS[0];
    const durationInfo = calculateMedicationDuration(rx.dateIso || '2026-09-10');

    setTimeout(() => {
      const enrichedMeds = (rx.medicines || []).map(m => ({
        ...m,
        prescriptionDate: durationInfo.prescriptionDateFormatted,
        takingDurationText: durationInfo.takingDurationText,
        elapsedDays: durationInfo.elapsedDays
      }));

      const enrichedDoc = {
        ...rx,
        date: durationInfo.prescriptionDateFormatted,
        prescriptionDate: durationInfo.prescriptionDateFormatted,
        prescriptionDateIso: rx.dateIso || '2026-09-10',
        takingDurationText: durationInfo.takingDurationText,
        elapsedDays: durationInfo.elapsedDays,
        medicines: enrichedMeds,
        insights: [
          durationInfo.takingDurationText,
          ...(rx.insights || [])
        ]
      };

      setExtractedDocData(enrichedDoc);
      setDocUploadState('complete');

      const naturalGreeting = generateSpokenPrescriptionSummary(enrichedDoc, {
        lang,
        hasPriorSymptoms: symptoms.length > 0 || autoExtracted.length > 0 || selectedDiseases.length > 0,
        priorSymptomNames: [
          ...symptoms.map(s => KEYWORD_SYMPTOM_MAP.find(k => k.id === s)?.keywords?.[0] || s),
          ...identifiedConditions
        ].filter(Boolean)
      });

      setChatHistory([
        { 
          sender: "ai", 
          text: naturalGreeting
        }
      ]);
    }, 1500);
  };

  const handleCustomFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';
    if (!file) return;

    setDocUploadState('scanning');
    setUploadError('');

    // Call live Render backend (same as mobile app) with 60s timeout
    try {
      const formData = new FormData();
      formData.append('image', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('https://prescription-reader-j3j9.onrender.com/api/prescriptions/parse', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const json = await response.json();
      if (json.status !== 'success' || !json.data?.parsedData) {
        throw new Error(json.message || "Could not parse prescription document");
      }

      const parsed = json.data.parsedData;
      const backendMeds = parsed.medications || [];

      if (backendMeds.length === 0) {
        const reason = json.data.rawOcrText || parsed.rawNotes || "No readable medicine names detected in this image. Please upload a clear photo of your prescription.";
        setUploadError(reason);
        setDocUploadState('error');
        return;
      }

      // Calculate prescription date and duration elapsed
      const rawDate = parsed.date;
      const durationInfo = calculateMedicationDuration(rawDate);

      // Map to frontend structure replicating mobile/lib/core/services/api_service.dart
      const mappedMeds = backendMeds.map(med => {
        const drugName = med.drugName || med.name || 'Prescribed Medicine';
        const form = med.form ? `${med.form}. ` : '';
        const fullName = drugName.startsWith(form) ? drugName : `${form}${drugName}`.trim();
        const dosage = med.dosage || 'Standard dose';

        // Format frequency map like mobile app (e.g. 1-0-1)
        const freq = med.frequency;
        let freqStr = '1-0-1';
        if (freq && typeof freq === 'object') {
          freqStr = `${freq.morning ?? 0}-${freq.afternoon ?? 0}-${freq.night ?? 0}`;
        } else if (typeof freq === 'string') {
          freqStr = freq;
        }

        // Meal instruction formatting matching mobile app
        const meal = (med.mealInstruction || '').toLowerCase();
        let instruction = 'After food';
        if (meal === 'before') {
          instruction = 'Before food';
        } else if (meal === 'with') {
          instruction = 'With food';
        } else if (meal) {
          instruction = meal;
        }

        const fullFreqWithMeal = `${freqStr} (${instruction})`;

        // Duration parsing matching mobile app
        const dur = med.duration;
        let durationStr = '5 Days';
        let durationDays = 5;
        if (dur && typeof dur === 'object') {
          const val = parseInt(dur.value) || 1;
          const unit = (dur.unit || 'days').toLowerCase();
          if (unit.includes('week')) {
            durationDays = val * 7;
            durationStr = `${val} Week${val > 1 ? 's' : ''} (${durationDays} Days)`;
          } else if (unit.includes('month')) {
            durationDays = val * 30;
            durationStr = `${val} Month${val > 1 ? 's' : ''} (${durationDays} Days)`;
          } else {
            durationDays = val;
            durationStr = `${val} Day${val > 1 ? 's' : ''}`;
          }
        } else if (typeof dur === 'string' && dur.trim()) {
          durationStr = dur;
        }

        return {
          name: fullName,
          dosage: dosage,
          frequency: fullFreqWithMeal,
          freqRaw: freqStr,
          instruction: instruction,
          duration: durationStr,
          durationDays: durationDays,
          specialInstructions: med.specialInstructions || null,
          prescriptionDate: durationInfo.prescriptionDateFormatted,
          takingDurationText: durationInfo.takingDurationText,
          elapsedDays: durationInfo.elapsedDays
        };
      });

      const extracted = {
        id: 'uploaded_' + Date.now(),
        title: 'Uploaded Prescription: ' + file.name,
        doctor: parsed.doctorName || parsed.clinicName || 'Consulting Physician (AI Verified)',
        clinic: parsed.clinicName || 'Clinical OPD',
        date: durationInfo.prescriptionDateFormatted,
        prescriptionDate: durationInfo.prescriptionDateFormatted,
        prescriptionDateIso: rawDate || new Date().toISOString().split('T')[0],
        takingDurationText: durationInfo.takingDurationText,
        elapsedDays: durationInfo.elapsedDays,
        type: 'Handwritten Prescription (Backend Gemini Vision 2.0 AI)',
        preview: mappedMeds.map(m => m.name).join(', '),
        medicines: mappedMeds,
        advice: (parsed.advice && parsed.advice.length > 0)
          ? parsed.advice
          : [
              `Extracted ${mappedMeds.length} verified medications`,
              durationInfo.takingDurationText
            ],
        insights: [
          durationInfo.takingDurationText,
          ...(parsed.advice || [])
        ],
        rawOcrText: json.data.rawOcrText || parsed.rawNotes || ''
      };

      setExtractedDocData(extracted);
      setDocUploadState('complete');

      const naturalGreeting = generateSpokenPrescriptionSummary(extracted, {
        lang,
        hasPriorSymptoms: symptoms.length > 0 || autoExtracted.length > 0 || selectedDiseases.length > 0,
        priorSymptomNames: [
          ...symptoms.map(s => KEYWORD_SYMPTOM_MAP.find(k => k.id === s)?.keywords?.[0] || s),
          ...identifiedConditions
        ].filter(Boolean)
      });

      setChatHistory([
        { 
          sender: "ai", 
          text: naturalGreeting
        }
      ]);
    } catch (err) {
      console.error("Prescription parsing error:", err);
      setUploadError(
        err.name === 'AbortError'
          ? "Request timed out while analyzing the prescription. Please check your internet connection and try a clearer image."
          : `Could not extract prescription details: ${err.message || 'Please try a clearer image'}`
      );
      setDocUploadState('error');
    }
  };

  const renderStep4 = () => (
    <div className="kiosk-step-content">
      <div className="kiosk-step-header">
        <div className="step-icon-wrap"><FileText size={26} /></div>
        <h2>Past Records (Optional)</h2>
        <p>Upload or scan your previous prescriptions, lab reports, or discharge summaries for a better AI assessment.</p>
      </div>

      <div className="doc-upload-container">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*,.pdf" 
          onChange={handleCustomFileUpload} 
        />
        <input 
          type="file" 
          ref={cameraInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          capture="environment" 
          onChange={handleCustomFileUpload} 
        />

        {docUploadState === 'idle' && (
          <>
            <div className="doc-upload-grid">
              <div className="doc-upload-card" onClick={() => fileInputRef.current?.click()}>
                <div className="doc-icon"><FileUp size={32} /></div>
                <h4>Upload Handwritten Prescription</h4>
                <p>Browse image or PDF from device to analyze via Gemini Vision 2.0</p>
              </div>
              <div className="doc-upload-card" onClick={() => (cameraInputRef.current || fileInputRef.current)?.click()}>
                <div className="doc-icon"><Camera size={32} /></div>
                <h4>Scan Physical Prescription</h4>
                <p>Take photo with camera to read doctor handwriting via Gemini Vision 2.0</p>
              </div>
            </div>

            <div className="rx-sample-presets">
              <div className="rx-sample-presets-title">
                <Sparkles size={13} color="#94a3b8" />
                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Or test with pre-loaded demo prescription:</span>
              </div>
              <div className="rx-sample-grid">
                {SAMPLE_PRESCRIPTIONS.map(rx => (
                  <div 
                    key={rx.id} 
                    className="rx-sample-card"
                    onClick={() => handleSimulateScan(rx)}
                  >
                    <h5>{rx.title}</h5>
                    <p>{rx.preview}</p>
                    <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                      📋 Demo Sample
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {docUploadState === 'scanning' && (
          <div className="doc-scanning-box">
            <div className="scanner-line"></div>
            <FileText size={48} className="scanning-icon" />
            <h3>Analyzing Prescription via Gemini Vision 2.0 AI...</h3>
            <p>Reading doctor handwriting, active medicine names, dosages, frequency &amp; dates</p>
          </div>
        )}

        {docUploadState === 'error' && (
          <div className="doc-error-box" style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#ffe4e6', color: '#e11d48', marginBottom: '12px' }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ color: '#9f1239', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Prescription Reading Notice</h3>
            <p style={{ color: '#be123c', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 16px auto', lineHeight: '1.4' }}>
              {uploadError || "No legible medication details detected in this image. Please ensure the prescription photo is clear, well-lit, and unblurred."}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setDocUploadState('idle'); fileInputRef.current?.click(); }}
                style={{ background: '#0E7C66', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileUp size={16} /> Choose Clearer Photo
              </button>
              <button
                type="button"
                onClick={() => handleSimulateScan(SAMPLE_PRESCRIPTIONS[0])}
                style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 16px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Use Demonstration Rx
              </button>
            </div>
          </div>
        )}

        {docUploadState === 'complete' && extractedDocData && (
          <div className="doc-success-box">
            <div className="doc-success-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} color="#059669" />
                <h3>Prescription Digitized Successfully</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  type="button"
                  className={"rx-voice-play-btn " + (isSpeakingTTS ? "playing" : "")}
                  onClick={() => {
                    if (isSpeakingTTS) {
                      stopTTS();
                    } else {
                      const summary = generateSpokenPrescriptionSummary(extractedDocData, {
                        lang,
                        hasPriorSymptoms: symptoms.length > 0 || autoExtracted.length > 0 || selectedDiseases.length > 0,
                        priorSymptomNames: [
                          ...symptoms.map(s => KEYWORD_SYMPTOM_MAP.find(k => k.id === s)?.keywords?.[0] || s),
                          ...identifiedConditions
                        ].filter(Boolean)
                      });
                      playTTS(summary, true);
                    }
                  }}
                  title="Listen to smart prescription voice summary"
                >
                  {isSpeakingTTS ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isSpeakingTTS ? "Stop Audio" : "Voice Summary"}</span>
                </button>
                <button 
                  onClick={() => { stopTTS(); setDocUploadState('idle'); }}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', color: '#475569' }}
                >
                  Scan Another
                </button>
              </div>
            </div>

            <div className="rx-meta-row">
              <div><strong>Physician:</strong> {extractedDocData.doctor}</div>
              <div><strong>Prescription Date:</strong> {extractedDocData.date}</div>
              <div className="rx-meta-badge">Gemini Vision 2.0 AI</div>
            </div>

            {extractedDocData.takingDurationText && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', margin: '12px 0', fontSize: '0.86rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#16a34a" />
                <span>⏱️ {extractedDocData.takingDurationText}</span>
              </div>
            )}

            {extractedDocData.medicines && (
              <table className="digitized-meds-table">
                <thead>
                  <tr>
                    <th>Extracted Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency / Timing</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedDocData.medicines.map((m, idx) => (
                    <tr key={idx}>
                      <td className="med-name-cell">
                        <Pill size={14} color="#0E7C66" />
                        <span>{m.name}</span>
                      </td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency}</td>
                      <td>
                        <div>{m.duration}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="doc-extracted-data" style={{ marginTop: '12px' }}>
              <div className="extracted-type" style={{ paddingBottom: '6px' }}><strong>Clinical Findings:</strong></div>
              <div className="extracted-list">
                {extractedDocData.insights.map((ins, i) => (
                  <div key={i} className="extracted-item"><Check size={14} /> {ins}</div>
                ))}
              </div>
            </div>

            <p className="doc-helper-text">These medications and duration tracking have been attached to your report and will be sent directly to the doctor dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );

const renderStep5 = () => (
    <div className="kiosk-step-content">
      <div className="kiosk-step-header">
        <div className="step-icon-wrap"><Activity size={26} /></div>
        <h2>Clinical Assessment</h2>
        <p>Chat with our AI assistant in <strong>{selectedLang?.name}</strong> to detail your condition.</p>
      </div>
      
      <div className="system-toggle-wrap">
        <div className="system-toggle">
          <button className={"sys-btn " + (systemMode === 'allopathy' ? 'active' : '')} onClick={() => setSystemMode('allopathy')}>Allopathy (Standard)</button>
          <button className={"sys-btn " + (systemMode === 'ayush' ? 'active ayush' : '')} onClick={() => setSystemMode('ayush')}>AYUSH (Ayurveda)</button>
        </div>
      </div>

      <div className="assessment-grid">
        <div className="assessment-pane">
          <div className="assessment-scroll-pane">
            <div>
              <div className="pane-label-row">
                <span className="pane-label">Symptom Checklist (Auto-detected)</span>
                {autoExtracted.length > 0 && (
                  <span className="auto-detect-count-tag">
                    <Sparkles size={11} /> {autoExtracted.length} Detected
                  </span>
                )}
              </div>
              <div className="symptom-chips" style={{ marginTop: '8px' }}>
                {(() => {
                  const liveTriage = evaluateClinicalTriage(chatHistory, symptoms, selectedDiseases);
                  const userMessages = chatHistory.filter(m => m.sender === 'user');
                  return SYMPTOM_CHIPS.map(({ id, label, severity }) => {
                    const isSelected = symptoms.includes(id);
                    const isAuto = autoExtracted.includes(id);
                    const isActive = isSelected || isAuto;

                    let chipStatus = "normal";
                    let chipSubLabel = null;

                    if (id === "s1" && isActive) {
                      // Dynamic evaluation for chest pain based on conversation proof
                      if (liveTriage.level === "high") {
                        chipStatus = "critical";
                        chipSubLabel = "Cardiac Red Alert";
                      } else if (liveTriage.level === "low" && (selectedDiseases.includes("d_gerd") || selectedDiseases.includes("d_costo") || liveTriage.reason.toLowerCase().includes("non-cardiac"))) {
                        chipStatus = "benign";
                        chipSubLabel = "Non-Cardiac (Gastric)";
                      } else {
                        chipStatus = "evaluating";
                        chipSubLabel = "Evaluating...";
                      }
                    } else if (id === "s4" && isActive) {
                      if (liveTriage.level === "high" && liveTriage.reason.toLowerCase().includes("respiratory")) {
                        chipStatus = "critical";
                        chipSubLabel = "Severe Distress";
                      } else {
                        chipStatus = "evaluating";
                        chipSubLabel = userMessages.length > 0 ? "Assessed" : "Evaluating...";
                      }
                    } else if (isActive) {
                      chipStatus = "standard";
                    }

                    return (
                      <button
                        key={id}
                        type="button"
                        className={"symptom-chip status-" + chipStatus + " severity-" + severity + (isSelected ? " selected" : "") + (isAuto ? " auto-detected" : "")}
                        style={{ opacity: isActive ? 1 : 0.65 }}
                        onClick={() => toggleSymptom(id)}
                      >
                        {label}
                        {chipSubLabel && <span className={"chip-sub-tag " + chipStatus}>{chipSubLabel}</span>}
                        {isAuto && <Sparkles size={11} className="chip-auto-icon" title="AI Auto-detected from voice" />}
                        {isActive && <Check size={11} className="chip-check" />}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            <div>
              <div className="pane-label-row">
                <span className="pane-label">Potential Conditions / Differential Triage</span>
                {selectedDiseases.length > 0 && (
                  <span className="auto-detect-count-tag">
                    <Sparkles size={11} /> {selectedDiseases.length} Mapped
                  </span>
                )}
              </div>
              <div className="disease-categories-container">
                {DISEASE_CATEGORIES.map(cat => (
                  <div key={cat.category} className="disease-category-block">
                    <div className="disease-category-title">{cat.category}</div>
                    <div className="disease-chips-grid">
                      {cat.items.map(item => {
                        const isSelected = selectedDiseases.includes(item.id);
                        const isAuto = autoDetectedDiseases.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`disease-chip ${isSelected ? "selected" : ""} ${isAuto ? "auto-detected" : ""} ${item.risk === 'critical' ? 'risk-critical' : ''}`}
                            onClick={() => toggleDisease(item.id)}
                          >
                            <div className="disease-chip-main">
                              <span className="disease-name">{item.name}</span>
                              {isAuto && <Sparkles size={12} className="disease-auto-sparkle" title="AI Auto-detected from conversation" />}
                            </div>
                            <div className="disease-chip-meta">
                              <span className={`disease-risk-tag ${item.risk}`}>{item.badge}</span>
                              {(isSelected || isAuto) && <Check size={12} style={{ color: item.risk === 'critical' ? '#DC2626' : 'var(--k-teal)' }} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="assessment-pane">
          <div className="pane-label-row">
            <span className="pane-label">AI Conversation ({selectedLang?.native})</span>
            <span className="lang-active-badge">
              <Globe size={11} /> {selectedLang?.speechCode}
            </span>
          </div>

          <div className="chat-interface">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={"chat-message " + msg.sender}>
                <div className="chat-avatar">
                  {msg.sender === 'ai' ? <Sparkles size={16} /> : <UserRound size={16} />}
                </div>
                <div className="chat-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isListening && interimText && (
              <div className="chat-message user">
                <div className="chat-avatar"><UserRound size={16} /></div>
                <div className="chat-bubble" style={{ opacity: 0.7 }}>
                  {interimText} <span className="interim-blink" />
                </div>
              </div>
            )}
            
            
            {isAiTyping && (
              <div className="chat-message ai">
                <div className="chat-avatar"><Sparkles size={16} /></div>
                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
          
          {speechError && (
            <div className="speech-error-banner">
              <AlertCircle size={13} /> {speechError}
            </div>
          )}

          <div className="chat-input-area">
            {isListening ? (
              <div className="voice-note-active">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mic className="mic-listening-icon" size={18} />
                  <span>Recording Voice Note...</span>
                </div>
                <div className="vn-live-waves">
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className="vn-bar" style={{ animationDelay: (i * 0.1) + "s" }} />
                  ))}
                </div>
              </div>
            ) : (
              <input 
                type="text" 
                placeholder={`Type your answer in ${selectedLang?.name}...`}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                disabled={isAiTyping}
              />
            )}
            
            {!isListening && (
              <button 
                className="chat-mic-btn"
                onClick={toggleVoice}
                title="Record Voice Note"
                disabled={isAiTyping}
              >
                <Mic size={20} />
              </button>
            )}
            {isListening ? (
              <button className="chat-send-btn" onClick={toggleVoice} style={{ background: '#DC2626' }}>
                <Send size={18} />
              </button>
            ) : (
              <button className="chat-send-btn" onClick={() => handleSendChat()} disabled={isAiTyping || !chatInput.trim()}>
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );


  const handleFinalSubmit = () => {
    const triageResult = evaluateClinicalTriage(chatHistory, symptoms, selectedDiseases);
    const selectedDiseaseNames = DISEASE_CATEGORIES.flatMap(c => c.items)
      .filter(d => selectedDiseases.includes(d.id))
      .map(d => d.name);

    const newPatient = {
      id: 'P0' + Math.floor(10 + Math.random() * 90),
      caseId: 'CS-2026-' + Math.floor(1000 + Math.random() * 9000),
      tokenNumber: tokenNumber,
      name: form.name || 'Anonymous Patient',
      abhaId: form.abhaId || '-',
      age: form.age || 30,
      gender: form.gender || 'Unknown',
      chiefComplaint: form.visitReason || 'General Checkup',
      flagged: triageResult.flagged,
      flagReason: triageResult.flagged ? 'AI Triage Alert: ' + triageResult.reason : '',
      status: 'Waiting',
      triageLevel: triageResult.label,
      department: form.department || 'General Medicine',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitMins: 0,
      avatarColor: 'teal',
      pastRecords: extractedDocData ? {
        type: extractedDocData.type,
        doctor: extractedDocData.doctor,
        clinic: extractedDocData.clinic,
        date: extractedDocData.date,
        prescriptionDate: extractedDocData.date,
        prescriptionDateIso: extractedDocData.prescriptionDateIso,
        takingDurationText: extractedDocData.takingDurationText,
        elapsedDays: extractedDocData.elapsedDays,
        medicines: extractedDocData.medicines,
        insights: extractedDocData.insights
      } : null,
      documents: extractedDocData ? {
        documentType: extractedDocData.type,
        documentDate: extractedDocData.date,
        prescriptionDate: extractedDocData.date,
        prescriptionDateIso: extractedDocData.prescriptionDateIso,
        takingDurationText: extractedDocData.takingDurationText,
        elapsedDays: extractedDocData.elapsedDays,
        prescribingDoctor: extractedDocData.doctor,
        clinic: extractedDocData.clinic,
        medicines: extractedDocData.medicines,
        insights: extractedDocData.insights
      } : null,
      aiSummary: "AI Clinical Assessment & Differentials:\n" +
        "- Triage Severity: " + triageResult.label + " (" + triageResult.reason + ")\n" +
        (selectedDiseaseNames.length > 0 ? "- Suspected Differentials: " + selectedDiseaseNames.join(", ") + "\n" : "") +
        "- Patient Transcript:\n" + chatHistory.filter(m => m.sender === 'user').map(m => "  • " + m.text).join('\n'),
      aiConfidence: 85,
      patientWords: '"' + chatHistory.filter(m => m.sender === 'user').map(m => m.text).join(' ') + '"',
      clinicalFrame: triageResult.clinicalFrame,
      vitals: { bp: '120/80 mmHg', hr: '80 bpm', spo2: '98%', temp: '98.6 °F' },
      ayush: systemMode === 'ayush' ? {
        prakriti: { vata: 33, pitta: 33, kapha: 34 },
        vikriti: { vata: 33, pitta: 33, kapha: 34 }
      } : null
    };

    const saved = localStorage.getItem('app_patients');
    const patientsList = saved ? JSON.parse(saved) : []; 
    patientsList.unshift(newPatient);
    localStorage.setItem('app_patients', JSON.stringify(patientsList));

    setSubmitted(true);
  };

  const renderStep6 = () => {
    const selectedSymptomLabels = SYMPTOM_CHIPS.filter(s => symptoms.includes(s.id)).map(s => s.label);

    const triageResult = evaluateClinicalTriage(chatHistory, symptoms, selectedDiseases);
    const selectedDiseaseNames = DISEASE_CATEGORIES.flatMap(c => c.items)
      .filter(d => selectedDiseases.includes(d.id))
      .map(d => d.name);

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
                  <div className="review-row"><span>Name</span><strong>{form.name || "-"}</strong></div>
                  <div className="review-row"><span>Age / Gender</span><strong>{form.age ? form.age + " yrs" : "-"} · {form.gender || "-"}</strong></div>
                  <div className="review-row"><span>Phone</span><strong>{form.phone || "-"}</strong></div>
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
                  <div className="review-row">
                    <span>Suspected Conditions</span>
                    <div className="review-symptom-tags">
                      {selectedDiseaseNames.length > 0
                        ? selectedDiseaseNames.map(d => <span key={d} className="sym-tag" style={{ background: '#F3E8FF', color: '#6D28D9' }}>{d}</span>)
                        : <span>---</span>}
                    </div>
                  </div>
                  <div className="review-row">
                    <span>Calculated Triage</span>
                    <strong style={{ color: triageResult.color }}>{triageResult.label}</strong>
                  </div>
                </div>
                <div className="review-voice-box">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                    <strong style={{ fontSize: '0.8rem' }}>AI Conversation Summary ({systemMode === 'ayush' ? 'AYUSH' : 'Allopathy'}):</strong>
                    {chatHistory.filter(m => m.sender === 'user').map((msg, idx) => (
                      <p key={idx} style={{ fontStyle: 'italic', margin: 0, fontSize: '0.8rem', color: '#4B5563' }}>- "{msg.text}"</p>
                    ))}
                    <div className={`triage-rationale-box ${triageResult.level}`}>
                      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>Triage Rationale ({triageResult.label}):</strong> {triageResult.reason}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                            {extractedDocData && extractedDocData.medicines && (
                <div className="review-card" style={{ gridColumn: 'span 2' }}>
                  <div className="review-card-header" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Pill size={14} color="#0E7C66" />
                      <span>Digitized Prescription Medications</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {extractedDocData.doctor} · Prescribed: {extractedDocData.date}
                    </span>
                  </div>
                  {extractedDocData.takingDurationText && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 12px', margin: '8px 16px 0 16px', borderRadius: '6px', fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                      ⏱️ {extractedDocData.takingDurationText}
                    </div>
                  )}
                  <div style={{ padding: '10px 16px' }}>
                    <table className="digitized-meds-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedDocData.medicines.map((m, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{m.name}</td>
                            <td>{m.dosage}</td>
                            <td>{m.frequency}</td>
                            <td>{m.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
            <button className="kiosk-submit-btn" onClick={handleFinalSubmit}>
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
                <strong className={"triage-badge " + (triageLevel === 'high' ? "emergency" : (triageLevel === 'medium' ? "urgent" : ""))}>
                  {triageLabel}
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
      case 6: return renderStep6();
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
          {step < 6 && (
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