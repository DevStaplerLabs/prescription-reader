/**
 * Prescription Voice Summary Generator
 * Creates fast, natural, intelligent spoken summaries from structured prescription data.
 * Adheres strictly to:
 * - Zero hardcoded clinical facts: all names, counts, dates, durations, dosages are dynamic.
 * - Human conversational medical assistant tone (no "I have digitized" or "I note that").
 * - Highlights key details while leaving full tables to the screen.
 * - Suppresses redundant symptom inquiries if symptoms were already provided.
 */

const cleanDoctorName = (rawDoc) => {
  if (!rawDoc || typeof rawDoc !== 'string') return "your consulting doctor";
  // Remove degrees in parentheses, e.g. "Dr. P. K. Singh (MBBS, MD - Cardiology)" -> "Dr. P. K. Singh"
  let cleaned = rawDoc.replace(/\s*\([^)]*\)/g, '').trim();
  // Remove trailing comma-separated credentials, e.g. "Dr. Sharma, MD, MBBS" -> "Dr. Sharma"
  cleaned = cleaned.replace(/,\s*(MD|MBBS|MS|DNB|DM|MCh|BAMS|BHMS|BDS|FRCS|MRCP).*$/i, '').trim();
  
  if (!cleaned) return "your consulting doctor";
  if (!/^dr\.?\s+/i.test(cleaned) && !/^doctor\s+/i.test(cleaned)) {
    cleaned = `Dr. ${cleaned}`;
  }
  return cleaned;
};

const cleanMedicineName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return "Prescribed Medication";
  // Strip dosage forms like Tab., Cap., Syp., Inj. for fluent speech synthesis
  return rawName.replace(/^(tab\.?|cap\.?|syp\.?|inj\.?|oint\.?|drops\.?)\s+/i, '').trim();
};

const formatSpokenDate = (rawDate, lang = 'en') => {
  if (!rawDate) return lang === 'hi' ? 'हाल ही में' : 'recently';
  
  try {
    // Check if ISO format YYYY-MM-DD or parseable
    let d = new Date(rawDate);
    if (isNaN(d.getTime()) && typeof rawDate === 'string') {
      // Try DD/MM/YYYY
      const parts = rawDate.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 2 && parts[2].length === 4) {
          d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
    }
    
    if (!isNaN(d.getTime())) {
      if (lang === 'hi') {
        const day = d.getDate();
        const monthsHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
        return `${day} ${monthsHi[d.getMonth()]} ${d.getFullYear()}`;
      } else {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    }
  } catch (e) {
    // fallback to raw
  }
  return rawDate;
};

/**
 * Generates natural assistant spoken text for a prescription.
 */
export const generateSpokenPrescriptionSummary = (rxData, options = {}) => {
  if (!rxData) return "";

  const {
    lang = 'en',
    hasPriorSymptoms = false,
    priorSymptomNames = []
  } = options;

  const doctorDisplay = cleanDoctorName(rxData.doctor);
  const dateDisplay = formatSpokenDate(rxData.date || rxData.prescriptionDate, lang);
  const medicines = Array.isArray(rxData.medicines) ? rxData.medicines : [];
  const medCount = medicines.length;

  // Dynamic duration context
  const elapsedDays = typeof rxData.elapsedDays === 'number' 
    ? rxData.elapsedDays 
    : 0;

  let durationTextEn = "today";
  let durationTextHi = "आज";

  if (elapsedDays === 0) {
    durationTextEn = "today";
    durationTextHi = "आज से";
  } else if (elapsedDays === 1) {
    durationTextEn = "yesterday";
    durationTextHi = "कल से";
  } else if (elapsedDays < 30) {
    durationTextEn = `about ${elapsedDays} day${elapsedDays > 1 ? 's' : ''} ago`;
    durationTextHi = `लगभग ${elapsedDays} दिनों से`;
  } else {
    const months = Math.floor(elapsedDays / 30);
    durationTextEn = `about ${months === 1 ? 'a month' : `${months} months`} ago`;
    durationTextHi = `लगभग ${months} महीने से`;
  }

  // Symptom inquiry phrasing (avoid repeating if symptoms already provided)
  let followUpEn = "How are you feeling today?";
  let followUpHi = "आज आपकी तबीयत कैसी है?";

  const symptomsList = (priorSymptomNames || []).filter(Boolean);
  if (hasPriorSymptoms && symptomsList.length > 0) {
    const symptomLead = symptomsList.slice(0, 2).join(' and ');
    followUpEn = `Regarding the ${symptomLead} you mentioned, how are you feeling right now?`;
    followUpHi = `आपने जो ${symptomLead} के लक्षण बताए हैं, अभी आप कैसा महसूस कर रहे हैं?`;
  } else if (hasPriorSymptoms) {
    followUpEn = "Regarding the symptoms you reported, how are you feeling right now?";
    followUpHi = "आपके बताए लक्षणों के साथ अभी आप कैसा महसूस कर रहे हैं?";
  }

  const docHindi = doctorDisplay.replace(/^Dr\.\s*/i, 'डॉ. ');

  // Hindi Natural Phrasing
  if (lang === 'hi') {
    if (medCount === 0) {
      return `मैंने आपका पर्चा देख लिया है, जो ${docHindi} द्वारा ${dateDisplay} को लिखा गया था। मैंने विवरण स्क्रीन पर प्रदर्शित कर दिया है। ${followUpHi}`;
    } else if (medCount === 1) {
      const med = cleanMedicineName(medicines[0].name);
      const doseStr = medicines[0].dosage && medicines[0].dosage !== 'Standard dose' ? ` (${medicines[0].dosage})` : '';
      return `मैंने आपका पर्चा सफलतापूर्वक पढ़ लिया है। यह ${docHindi} द्वारा ${dateDisplay} को लिखा गया था। मुझे इसमें 1 दवा, ${med}${doseStr} मिली है, जिसे मैंने स्क्रीन पर दिखा दिया है। आप इसे ${durationTextHi} ले रहे हैं। ${followUpHi}`;
    } else if (medCount === 2) {
      const m1 = cleanMedicineName(medicines[0].name);
      const m2 = cleanMedicineName(medicines[1].name);
      return `मैंने आपका पर्चा सफलतापूर्वक पढ़ लिया है। यह ${docHindi} द्वारा ${dateDisplay} को लिखा गया था। मुझे इसमें 2 दवाएं, ${m1} और ${m2} मिली हैं। मैंने पूरी जानकारी स्क्रीन पर प्रदर्शित कर दी है। आप इन्हें ${durationTextHi} ले रहे हैं। ${followUpHi}`;
    } else {
      const m1 = cleanMedicineName(medicines[0].name);
      const m2 = cleanMedicineName(medicines[1].name);
      return `मैंने आपका पर्चा सफलतापूर्वक पढ़ लिया है। यह ${docHindi} द्वारा ${dateDisplay} को लिखा गया था। मुझे इसमें कुल ${medCount} दवाएं मिली हैं, जिनमें ${m1} और ${m2} शामिल हैं। मैंने सभी दवाओं का पूरा विवरण स्क्रीन पर दिखा दिया है। आप इन्हें ${durationTextHi} ले रहे हैं। ${followUpHi}`;
    }
  }

  // English Natural Assistant Phrasing
  if (medCount === 0) {
    return `I've read your prescription successfully. It was prescribed by ${doctorDisplay} on ${dateDisplay}. I've displayed the clinical notes on screen. ${followUpEn}`;
  } else if (medCount === 1) {
    const med = cleanMedicineName(medicines[0].name);
    const doseStr = medicines[0].dosage && medicines[0].dosage !== 'Standard dose' ? ` at ${medicines[0].dosage}` : '';
    return `I've read your prescription successfully. It was prescribed by ${doctorDisplay} on ${dateDisplay}. I found 1 medicine, ${med}${doseStr}. I've displayed the complete medication details on screen. You started taking them ${durationTextEn}. ${followUpEn}`;
  } else if (medCount === 2) {
    const m1 = cleanMedicineName(medicines[0].name);
    const m2 = cleanMedicineName(medicines[1].name);
    return `I've read your prescription successfully. It was prescribed by ${doctorDisplay} on ${dateDisplay}. I found 2 medicines, ${m1} and ${m2}. I've displayed the complete medication details on screen. You started taking them ${durationTextEn}. ${followUpEn}`;
  } else {
    const m1 = cleanMedicineName(medicines[0].name);
    const m2 = cleanMedicineName(medicines[1].name);
    return `I've read your prescription successfully. It was prescribed by ${doctorDisplay} on ${dateDisplay}. I found ${medCount} medicines, including ${m1} and ${m2}. I've displayed the complete medication details on screen. You started taking them ${durationTextEn}. ${followUpEn}`;
  }
};
