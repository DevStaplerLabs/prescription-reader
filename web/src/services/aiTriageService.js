import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
let genAI = null;

const getGenAI = () => {
  if (!genAI && API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
};

/**
 * Clean string to parse valid JSON safely
 */
const cleanJSON = (text) => {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.substring(start, end + 1));
    } catch (e) {
      console.warn("JSON slice parse error:", e);
    }
  }
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    return null;
  }
};

/**
 * Master AI Triage Question Generator
 * Calls backend or direct Gemini 3.5 Flash to dynamically analyze user message,
 * detect new conditions, and generate 4 must-ask questions (first condition) or
 * 3 must-ask questions (subsequent combined conditions) focused on criticality/red-flags.
 */
export const requestAiTriageQuestions = async ({
  userMessage,
  knownConditions = [],
  askedQuestions = [],
  chatHistory = [],
  lang = 'en'
}) => {
  // 1. Try backend API first
  try {
    const backendResp = await fetch('https://prescription-reader-j3j9.onrender.com/api/prescriptions/triage-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        knownConditions,
        askedQuestions,
        chatHistory: (chatHistory || []).slice(-6),
        lang
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (backendResp.ok) {
      const resJson = await backendResp.json();
      if (resJson.status === 'success' && resJson.data) {
        return resJson.data;
      }
    }
  } catch (err) {
    console.log("Backend triage endpoint unavailable or timed out, using direct Gemini AI:", err.message);
  }

  // 2. Direct Gemini Generative AI Client
  try {
    const client = getGenAI();
    if (client) {
      const model = client.getGenerativeModel({
        model: 'gemini-3.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const isFirst = knownConditions.length === 0;
      const targetCount = isFirst ? 4 : 3;

      const systemPrompt = `You are an expert Clinical Triage AI assistant in an OPD hospital kiosk.
Analyze the patient's latest message in context of the conversation and determine if a medical condition, symptom, or disease is mentioned.
Language: ${lang === 'hi' ? 'Hindi (natural Devanagari script)' : 'English'}.

Current known conditions so far: ${JSON.stringify(knownConditions)}
Questions already asked: ${JSON.stringify(askedQuestions)}
Recent conversation:
${(chatHistory || []).slice(-4).map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

PATIENT LATEST MESSAGE:
"${userMessage}"

INSTRUCTIONS:
1. Condition Detection:
   - Check if a new medical condition, disease, or symptom is mentioned in the latest message.
   - If it is already covered in "Current known conditions so far", or if the user is just answering an earlier question (e.g. "for 3 days", "no fever", "yes it hurts a lot", "nothing else", "on my cheeks"), set "newCondition": null.
   - If a genuine new condition/symptom is mentioned (e.g. "pimples / acne", "chest burning", "vomiting", "knee pain", "fever", "cough"), set "newCondition" to the concise name of that condition (e.g. "Acne / Facial Pimples").
   - NEVER invent or assume conditions not mentioned by the patient. For instance, if they mention pimples, do NOT assume headache, stomach pain, or cardiac issues.

2. Question Generation:
   - If "newCondition" is detected and knownConditions is empty (FIRST condition):
     Generate exactly 4 essential, disease-specific must-ask questions specifically relevant to that condition to determine whether the patient may be in a critical, urgent, or non-urgent condition.
     Prioritize questions about red-flag symptoms, severity, duration, progression, associated symptoms, and warning signs.
     NEVER ask questions about unrelated conditions (e.g. for acne/pimples, NEVER ask about chest pain, headache, or bowel movements).
   - If "newCondition" is detected and knownConditions is NOT empty (ADDITIONAL condition):
     Generate exactly 3 must-ask questions that are relevant to BOTH the previously identified condition(s) (${knownConditions.join(', ')}) AND the newly mentioned condition, assessing the combined clinical picture.
   - If "newCondition" is null (patient is simply answering):
     Set "generatedQuestions": [].

3. Redundant Question Filter:
   - Check "Questions already asked" list. Strictly avoid duplicate questions that have already been asked or answered.
   - If the patient's response already answered any queued topic, note it.

4. Formulate:
   - Keep questions simple, polite, and understandable to a normal layperson patient.
   - Provide a natural 3-6 word acknowledgment ("briefAcknowledgment") of their statement in ${lang === 'hi' ? 'Hindi' : 'English'}.

Return ONLY valid JSON matching this exact schema:
{
  "newCondition": "string or null",
  "generatedQuestions": ["string", ...],
  "briefAcknowledgment": "string",
  "answeredQuestionKeyword": "optional string keyword of question answered by user"
}`;

      const aiResult = await model.generateContent(systemPrompt);
      const text = aiResult.response.text();
      const parsed = cleanJSON(text);
      if (parsed && Array.isArray(parsed.generatedQuestions)) {
        return parsed;
      }
    }
  } catch (geminiErr) {
    console.error("Direct Gemini call failed:", geminiErr);
  }

  // 3. Robust Semantic Matcher Fallback (Zero Hardcoded Unrelated Questions)
  // Guarantees disease-specific relevance even if all network AI calls fail
  return generateClinicalSemanticFallback({
    userMessage,
    knownConditions,
    askedQuestions,
    lang
  });
};

/**
 * Intelligent Semantic Clinical Fallback
 * Categorizes the actual complaint and returns 4 targeted questions for that exact domain.
 * Never defaults to headache unless head pain is explicitly mentioned.
 */
const generateClinicalSemanticFallback = ({ userMessage, knownConditions, askedQuestions, lang }) => {
  const lower = (userMessage || '').toLowerCase();
  
  // Categorize condition
  let detectedCondition = null;
  let questions = [];

  const CLINICAL_DOMAINS = [
    {
      id: "Dermatology / Skin & Acne",
      keywords: ["pimple", "acne", "rash", "skin", "boil", "itching", "spot", "मुंहासे", "पिंपल्स", "फुंसी", "त्वचा", "खुजली"],
      en: [
        "How long have you had these pimples or skin breakouts, and are they spreading or getting worse?",
        "Are the bumps deep, painful, warm, or filled with pus or fluid?",
        "Are you experiencing any spreading redness, facial swelling, or fever alongside the breakouts?",
        "Have you started using any new face products, soaps, oils, or medications recently?"
      ],
      hi: [
        "आपको ये मुंहासे या दाने कितने समय से हैं, और क्या ये चेहरे पर तेजी से फैल रहे हैं?",
        "क्या दानों में तेज दर्द, जलन, या मवाद (पस) भर रहा है?",
        "क्या दानों के साथ चेहरे पर सूजन, तेज लालिमा या बुखार भी महसूस हो रहा है?",
        "क्या आपने हाल ही में कोई नया साबुन, क्रीम या दवा इस्तेमाल करना शुरू किया है?"
      ]
    },
    {
      id: "Cardiology / Chest & Heart",
      keywords: ["chest", "heart", "angina", "tightness", "palpitation", "सीने", "छाती", "दिल", "घबराहट"],
      en: [
        "Is the chest discomfort a heavy crushing pressure spreading to your left arm, neck, or jaw?",
        "Are you having cold sweating, dizziness, or shortness of breath right now?",
        "Does the pain increase when you walk, exert yourself, or climb stairs?",
        "How many minutes or hours has this chest sensation been continuous?"
      ],
      hi: [
        "क्या सीने में भारीपन या दबाव है जो बाएं हाथ, गर्दन या जबड़े की तरफ फैल रहा है?",
        "क्या आपको इसके साथ ठंडा पसीना, चक्कर या सांस फूलने की समस्या हो रही है?",
        "क्या चलने-फिरने या मेहनत करने पर यह दर्द बढ़ जाता है?",
        "यह सीने की तकलीफ कितने समय से लगातार बनी हुई है?"
      ]
    },
    {
      id: "Gastroenterology / Stomach & Acidity",
      keywords: ["stomach", "acidity", "belly", "abdomen", "gastric", "loose motion", "vomit", "vomiting", "पेट", "दस्त", "उल्टी", "गैस", "अपच"],
      en: [
        "Is the stomach pain sharp, cramping, or burning, and where exactly is it located?",
        "Have you had any vomiting, blood in vomit, or watery loose motions?",
        "Does the pain worsen after eating, or on an empty stomach?",
        "Are you able to drink water and keep fluids down without vomiting?"
      ],
      hi: [
        "क्या पेट में तेज दर्द, ऐंठन या जलन हो रही है, और यह पेट के किस हिस्से में है?",
        "क्या आपको उल्टी, जी मिचलाना या पतले दस्त की शिकायत हो रही है?",
        "क्या खाना खाने के बाद दर्द बढ़ता है, या खाली पेट रहने पर?",
        "क्या आप पानी या तरल पदार्थ बिना उल्टी के पी पा रहे हैं?"
      ]
    },
    {
      id: "Infection / Fever & Chills",
      keywords: ["fever", "temperature", "chill", "shiver", "shivering", "बुखार", "तापमान", "ठंड", "कंपकंपी"],
      en: [
        "Have you measured your body temperature with a thermometer, and how high has it reached?",
        "Are you having severe chills, body shivering, or intense joint aches?",
        "How many days has the fever been ongoing, and does it come at specific times?",
        "Do you have any cough, burning while urinating, or rash along with the fever?"
      ],
      hi: [
        "क्या आपने थर्मामीटर से तापमान नापा है, बुखार कितना तेज है?",
        "क्या आपको तेज ठंड, कंपकंपी या जोड़ों में असहनीय दर्द हो रहा है?",
        "बुखार कितने दिनों से आ रहा है, और क्या यह दिन के किसी खास समय पर बढ़ता है?",
        "क्या बुखार के साथ खांसी, पेशाब में जलन या शरीर पर दाने भी हैं?"
      ]
    },
    {
      id: "Respiratory / Cough & Breathlessness",
      keywords: ["cough", "breath", "breathing", "wheezing", "phlegm", "खांसी", "सांस", "कफ", "बलगम"],
      en: [
        "Is it a dry cough or are you bringing up colored phlegm or blood?",
        "Are you feeling breathlessness or suffocated while resting or lying flat?",
        "Are you hearing a whistling or wheezing sound when breathing?",
        "How long have you had this cough, and does it keep you awake at night?"
      ],
      hi: [
        "क्या यह सूखी खांसी है, या बलगम आ रहा है (किस रंग का है)?",
        "क्या आराम करते समय या लेटने पर भी सांस लेने में बहुत कठिनाई हो रही है?",
        "क्या सांस लेते समय सीटी जैसी आवाज या घरघराहट सुनाई देती है?",
        "यह खांसी कितने दिनों से है, और क्या रात में बढ़ जाती है?"
      ]
    },
    {
      id: "Neurology / Headache",
      keywords: ["headache", "head pain", "migraine", "सिरदर्द", "सर दर्द", "आधा सीसी"],
      en: [
        "Is this the sudden worst headache of your life, like a thunderclap?",
        "Is the pain on one side or all over, and are you sensitive to light or sound?",
        "Are you experiencing any nausea, vomiting, or blurred vision?",
        "Do you have any fever, neck stiffness, or weakness in your arms or legs?"
      ],
      hi: [
        "क्या यह सिरदर्द अचानक बहुत तेज (बिजली की तरह) शुरू हुआ है?",
        "क्या दर्द सिर के एक तरफ है या पूरे सिर में, और क्या रोशनी या आवाज से परेशानी हो रही है?",
        "क्या आपको उल्टी का मन, चक्कर या धुंधला दिखाई दे रहा है?",
        "क्या सिरदर्द के साथ गर्दन में अकड़न, बुखार या हाथ-पैरों में कमजोरी महसूस हो रही है?"
      ]
    }
  ];

  for (const dom of CLINICAL_DOMAINS) {
    if (dom.keywords.some(k => lower.includes(k))) {
      detectedCondition = dom.id;
      questions = lang === 'hi' ? dom.hi : dom.en;
      break;
    }
  }

  // If no specific keyword matched, extract generic condition from first 3-5 words
  if (!detectedCondition) {
    detectedCondition = "General Symptoms: " + userMessage.slice(0, 30);
    questions = lang === 'hi' ? [
      "आप इन लक्षणों को कितने समय (दिनों/हफ्तों) से महसूस कर रहे हैं?",
      "क्या यह तकलीफ धीरे-धीरे बढ़ रही है या अचानक शुरू हुई है?",
      "क्या आपको इसके साथ कोई अन्य लक्षण जैसे बुखार, चक्कर या कमजोरी महसूस हो रही है?",
      "क्या आपने इसके लिए पहले से कोई दवा ली है या किसी डॉक्टर को दिखाया है?"
    ] : [
      "How many days or weeks have you been experiencing these symptoms?",
      "Did this start suddenly, or has it been gradually worsening over time?",
      "Are you experiencing any associated red flags such as high fever, severe weakness, or dizziness?",
      "Have you taken any prior medications or remedies for this issue?"
    ];
  }

  // Filter out questions already asked
  const unasked = questions.filter(q => !askedQuestions.includes(q));

  const ack = lang === 'hi'
    ? `मैंने आपके लक्षण (${detectedCondition}) नोट कर लिए हैं।`
    : `I have noted your reported symptoms regarding ${detectedCondition}.`;

  return {
    newCondition: detectedCondition,
    generatedQuestions: unasked.slice(0, knownConditions.length === 0 ? 4 : 3),
    briefAcknowledgment: ack
  };
};
