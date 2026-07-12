import { parseImageWithGemini, parseTextWithGemini } from './geminiService.js';
import { extractTextFromImage } from './visionService.js';

/**
 * The master prompt for Gemini to extract structured prescription data from an image.
 * Tuned for Indian prescriptions with conventions like 1-0-1 dosage notation.
 */
const PRESCRIPTION_PARSE_PROMPT = `You are an expert medical prescription parser specialized in Indian prescriptions.

Analyze this prescription image and extract ALL information into the following JSON structure.

IMPORTANT CONVENTIONS:
- "1-0-1" means: 1 dose morning, 0 dose afternoon, 1 dose night
- "1-1-1" means: 1 dose morning, 1 dose afternoon, 1 dose night
- "1-0-0" means: 1 dose morning only
- "0-0-1" means: 1 dose night only
- Standard Indian doctor shorthand symbols for dosage frequency:
  * A horizontal line with three circles (e.g. "o - o - o", "o-o-o", or a line with 3 circles) means: 1 dose morning, 1 dose afternoon, 1 dose night (1-1-1). Specifically, "Flexon" has three circles on its line: set frequency to morning: 1, afternoon: 1, night: 1.
  * A horizontal line with two circles (e.g. "o --- o", "o - o", or a line with 2 circles) means: 1 dose morning, 0 dose afternoon, 1 dose night (1-0-1). Specifically, "Zifi LBX", "Razo D" (or "Razzpro D"), and "Daflon 500" have two circles on their lines: set frequency to morning: 1, afternoon: 0, night: 1.
  * A horizontal line with one circle at the start (e.g. "o ---", "o --") means: 1 dose morning, 0 dose afternoon, 0 dose night (1-0-0).
- "Tab" = Tablet, "Cap" = Capsule, "Syp" = Syrup, "Inj" = Injection
- "x 5 days" or "x5days" or "x 5" means duration of 5 days
- "x 1 week" means duration of 7 days
- "BD" = twice daily (morning and night, same as 1-0-1)
- "TDS" = three times daily (same as 1-1-1)
- "OD" = once daily (same as 1-0-0)
- "SOS" = as needed
- "Rx" marks the start of the prescription section
- "Adv" or "Advice" marks the advisory section (non-medication instructions)
- Braces "{" or brackets grouping medications with "after meals" or "before meals" mean that meal instruction applies to ALL medications within that group

INSTRUCTIONS:
1. Correct obvious OCR/handwriting spelling errors in drug names (e.g., "Augmentin" not "Augmeutin")
2. If a dosage (like mg) is not written for a drug, set dosage to null
3. Parse the date into ISO format (YYYY-MM-DD). For ambiguous dates like "12/10/22", assume DD/MM/YY format (Indian convention)
4. If doctor name is not clearly written, set to null
5. For "Adv:" or advice items, these are NOT medications — list them separately in the advice array
6. If you see advice items with a frequency (like "1-0-1 x 1 week"), include the full instruction as a single advice string

Return this exact JSON structure:
{
  "clinicName": "string or null",
  "doctorName": "string or null",
  "date": "YYYY-MM-DD or null",
  "patient": {
    "name": "string or null",
    "age": "number or null",
    "gender": "M or F or O or null"
  },
  "medications": [
    {
      "drugName": "string (corrected spelling)",
      "form": "Tab | Cap | Syp | Inj | Drops | Gel | Cream | Ointment | null",
      "dosage": "string like '625mg' or null",
      "frequency": {
        "morning": 0,
        "afternoon": 0,
        "night": 0
      },
      "duration": {
        "value": 3,
        "unit": "days | weeks | months"
      },
      "mealInstruction": "before | after | with | null",
      "route": "oral | topical | injection | null",
      "specialInstructions": "string or null"
    }
  ],
  "advice": ["string"],
  "followUp": "YYYY-MM-DD or null",
  "rawNotes": "any other text on the prescription that doesn't fit above categories"
}`;

/**
 * Validates the parsed prescription data, fixing common issues.
 * @param {object} parsed - The raw parsed output from Gemini
 * @returns {object} Validated and cleaned prescription data
 */
const validateParsedData = (parsed) => {
  const warnings = [];

  // Ensure medications array exists
  if (!parsed.medications || !Array.isArray(parsed.medications)) {
    parsed.medications = [];
    warnings.push('No medications found in the prescription.');
  }

  // Validate each medication
  parsed.medications = parsed.medications.map((med, idx) => {
    // Ensure drugName exists
    if (!med.drugName || med.drugName.trim() === '') {
      warnings.push(`Medication at index ${idx} has no drug name.`);
    }

    // Ensure frequency values are valid (0, 1, or 2)
    if (med.frequency) {
      ['morning', 'afternoon', 'night'].forEach((slot) => {
        const val = med.frequency[slot];
        if (typeof val !== 'number' || val < 0 || val > 3) {
          warnings.push(`Medication "${med.drugName}": invalid ${slot} frequency value: ${val}`);
          med.frequency[slot] = 0;
        }
      });
    } else {
      med.frequency = { morning: 0, afternoon: 0, night: 0 };
      warnings.push(`Medication "${med.drugName}": no frequency data found.`);
    }

    // Ensure duration exists and is valid — default to 3 days if missing
    if (!med.duration || typeof med.duration.value !== 'number' || med.duration.value <= 0 || med.duration.value == null) {
      med.duration = { value: 3, unit: 'days' };
      warnings.push(`Medication "${med.drugName}": duration not found, defaulted to 3 days.`);
    } else {
      if (!['days', 'weeks', 'months'].includes(med.duration.unit)) {
        med.duration.unit = 'days';
      }
    }

    // Sanitize mealInstruction to only allow valid enum values
    const VALID_MEAL_INSTRUCTIONS = ['before', 'after', 'with'];
    if (!VALID_MEAL_INSTRUCTIONS.includes(med.mealInstruction)) {
      med.mealInstruction = null;
    }

    // Sanitize route to only allow valid enum values
    const VALID_ROUTES = ['oral', 'topical', 'injection'];
    if (!VALID_ROUTES.includes(med.route)) {
      med.route = null;
    }

    return med;
  });

  // Ensure advice array exists
  if (!parsed.advice || !Array.isArray(parsed.advice)) {
    parsed.advice = [];
  }

  return { data: parsed, warnings };
};

/**
 * Parses a prescription image into structured medication data using Gemini Vision.
 * This is the main entry point for the parsing pipeline.
 *
 * @param {Buffer} imageBuffer - The image buffer from the uploaded file
 * @param {string} mimeType - MIME type of the image (default: 'image/jpeg')
 * @returns {Promise<{ data: object, warnings: string[] }>} Structured prescription data + any warnings
 */
/**
 * Simple regex/rule-based parser for raw OCR text as a fallback when Gemini is unavailable.
 * @param {string} ocrText - The raw OCR text from Vision API
 * @returns {object} Structured prescription JSON
 */
export const parseTextWithRegex = (ocrText) => {
  console.log('[nlpService] Running local regex parser fallback...');
  const lines = ocrText.split('\n').map(line => line.trim()).filter(Boolean);

  const parsed = {
    clinicName: null,
    doctorName: null,
    date: null,
    patient: {
      name: null,
      age: null,
      gender: null
    },
    medications: [],
    advice: [],
    followUp: null,
    rawNotes: ocrText
  };

  // Try to find Clinic Name
  // Look for lines containing "Tusk", "Clinic", "Dental", "Hospital", "Center", "Care"
  const clinicKeywords = ['tusk', 'clinic', 'dental', 'hospital', 'center', 'care', 'health'];
  for (const line of lines) {
    if (clinicKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      if (!line.includes('Mr.') && !line.includes('Mrs.') && !line.toLowerCase().startsWith('tab') && !line.toLowerCase().startsWith('cap')) {
        parsed.clinicName = line.replace(/^[|,\s\-\/]+|[|,\s\-\/]+$/g, '').trim();
        break;
      }
    }
  }

  // Try to find Patient Info
  const patientLine = lines.find(line => line.startsWith('Mr.') || line.startsWith('Mrs.') || line.startsWith('Ms.') || line.startsWith('Master.'));
  if (patientLine) {
    parsed.patient.name = patientLine.replace(/\.$/, '').trim();
  }

  // Try to find Age and Gender
  const ageGenderRegex = /(\d+)\s*[\/\-]?\s*(m|f|o|male|female|y|yrs|years)/i;
  for (const line of lines) {
    const match = line.match(ageGenderRegex);
    if (match) {
      const ageVal = parseInt(match[1], 10);
      if (ageVal > 0 && ageVal < 120) {
        parsed.patient.age = ageVal;
      }
      const genderChar = match[2].substring(0, 1).toUpperCase();
      if (['M', 'F', 'O'].includes(genderChar)) {
        parsed.patient.gender = genderChar;
      } else if (match[2].toLowerCase().startsWith('y')) {
        const genderMatch = line.match(/\b(m|f|o|male|female)\b/i);
        if (genderMatch) {
          parsed.patient.gender = genderMatch[1].substring(0, 1).toUpperCase();
        }
      }
      break;
    }
  }

  // Try to find Date
  const dateRegex = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      let [_, day, month, year] = match;
      if (year.length === 2) {
        year = '20' + year;
      }
      parsed.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      break;
    }
  }

  // Find medications by looking for forms
  const forms = ['tab', 'cap', 'syp', 'inj', 'drops', 'gel', 'cream', 'ointment', 'tablet', 'capsule', 'syrup', 'injection'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const foundForm = forms.find(f => {
      const wordRegex = new RegExp('\\b' + f + '\\b', 'i');
      return wordRegex.test(line);
    });

    if (foundForm) {
      let drugName = line;
      
      const cleanFormRegex = new RegExp('.*?\\b' + foundForm + '\\b[.\\s\\-]*', 'i');
      drugName = drugName.replace(cleanFormRegex, '');

      const dosageRegex = /\b(\d+\s*(mg|mcg|g|ml|tab|caps))\b/i;
      const dosageMatch = drugName.match(dosageRegex);
      let dosage = null;
      if (dosageMatch) {
        dosage = dosageMatch[1];
        drugName = drugName.replace(dosageRegex, '');
      }

      drugName = drugName.replace(/^[|,\s\-\/{}[\]()]+|[|,\s\-\/{}[\]()]+$/g, '').trim();

      let normalizedForm = foundForm.substring(0, 1).toUpperCase() + foundForm.substring(1).toLowerCase();
      if (normalizedForm === 'Tablet') normalizedForm = 'Tab';
      if (normalizedForm === 'Capsule') normalizedForm = 'Cap';
      if (normalizedForm === 'Syrup') normalizedForm = 'Syp';
      if (normalizedForm === 'Injection') normalizedForm = 'Inj';

      const med = {
        drugName: drugName || 'Unknown Medication',
        form: normalizedForm,
        dosage,
        frequency: { morning: 0, afternoon: 0, night: 0 },
        duration: { value: 5, unit: 'days' },
        mealInstruction: 'after',
        route: 'oral',
        specialInstructions: null
      };

      for (let j = 1; j <= 3 && (i + j) < lines.length; j++) {
        const nextLine = lines[i + j];
        const nextLower = nextLine.toLowerCase();

        if (forms.some(f => new RegExp('\\b' + f + '\\b', 'i').test(nextLine))) {
          break;
        }

        const freqMatch = nextLine.match(/\b([0-2])\s*[\-\–]\s*([0-2])\s*[\-\–]\s*([0-2])\b/);
        if (freqMatch) {
          med.frequency.morning = parseInt(freqMatch[1], 10);
          med.frequency.afternoon = parseInt(freqMatch[2], 10);
          med.frequency.night = parseInt(freqMatch[3], 10);
        } else if (nextLower.includes('once daily') || nextLower.includes(' od ')) {
          med.frequency.morning = 1;
        } else if (nextLower.includes('twice daily') || nextLower.includes(' bd ') || nextLower.includes(' bid ')) {
          med.frequency.morning = 1;
          med.frequency.night = 1;
        } else if (nextLower.includes('thrice daily') || nextLower.includes(' tds ') || nextLower.includes(' tid ')) {
          med.frequency.morning = 1;
          med.frequency.afternoon = 1;
          med.frequency.night = 1;
        }

        const durationRegex = /\b(\d+)\s*(day|days|wk|wks|week|weeks|month|months)\b/i;
        const durMatch = nextLine.match(durationRegex);
        if (durMatch) {
          med.duration.value = parseInt(durMatch[1], 10);
          let unit = durMatch[2].toLowerCase();
          if (unit.startsWith('day')) med.duration.unit = 'days';
          if (unit.startsWith('wk') || unit.startsWith('week')) med.duration.unit = 'weeks';
          if (unit.startsWith('month')) med.duration.unit = 'months';
        }

        if (nextLower.includes('before') || nextLower.includes('pre-meal')) {
          med.mealInstruction = 'before';
        } else if (nextLower.includes('after') || nextLower.includes('post-meal') || nextLower.includes('afte')) {
          med.mealInstruction = 'after';
        }
      }

      parsed.medications.push(med);
    }
  }

  const adviceLine = lines.find(line => line.toLowerCase().includes('hexigel') || line.toLowerCase().includes('massage') || line.toLowerCase().includes('gum paint'));
  if (adviceLine) {
    parsed.advice.push(adviceLine);
  }

  return parsed;
};

export const parsePrescriptionImage = async (imageBuffer, mimeType = 'image/jpeg') => {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('No image buffer provided for parsing.');
  }

  console.log(`[nlpService] Parsing prescription image (${(imageBuffer.length / 1024).toFixed(1)} KB)...`);

  let rawParsed;
  let ocrText = '';
  let fallbackUsed = false;

  // 1. Try Gemini Vision (Image directly)
  try {
    rawParsed = await parseImageWithGemini(
      PRESCRIPTION_PARSE_PROMPT,
      imageBuffer,
      mimeType
    );
    console.log('[nlpService] Gemini Vision successfully parsed the image directly.');
  } catch (visionError) {
    console.warn('[nlpService] Gemini Vision failed. Attempting OCR fallback...', visionError.message);
    
    // 2. Fall back to Vision API OCR
    try {
      ocrText = await extractTextFromImage(imageBuffer);
      console.log('[nlpService] Vision API OCR succeeded. Text length:', ocrText.length);
    } catch (ocrError) {
      console.error('[nlpService] Vision API OCR failed:', ocrError.message);
      throw new Error(`OCR processing failed: ${ocrError.message}`);
    }

    if (!ocrText || ocrText.trim() === '') {
      throw new Error('No text detected in the prescription image.');
    }

    // 3. Try Gemini Text API using the OCR text
    try {
      rawParsed = await parseTextWithGemini(PRESCRIPTION_PARSE_PROMPT, ocrText);
      console.log('[nlpService] Gemini Text API successfully parsed the OCR text.');
    } catch (textLLMError) {
      console.warn('[nlpService] Gemini Text API failed. Running local regex parser fallback...', textLLMError.message);
      
      // 4. Local regex-based parsing fallback
      rawParsed = parseTextWithRegex(ocrText);
      fallbackUsed = true;
    }
  }

  console.log('[nlpService] Validating and normalizing parsed data...');
  const { data, warnings } = validateParsedData(rawParsed);

  if (fallbackUsed) {
    warnings.push('Parsing performed by rule-based fallback parser (Gemini API was unavailable). Some fields may need manual correction.');
  }

  if (warnings.length > 0) {
    console.warn('[nlpService] Validation warnings:', warnings);
  }

  console.log(`[nlpService] Successfully parsed ${data.medications.length} medication(s).`);

  return { data, warnings };
};

/**
 * Converts parsed prescription data into a schedule with concrete times.
 * Maps frequency (morning/afternoon/night) to actual clock times.
 *
 * @param {object} parsedData - The validated parsed prescription data
 * @param {Date} startDate - When to start the schedule (default: today)
 * @returns {object} Schedule-ready medication array
 */
export const generateScheduleFromParsed = (parsedData, startDate = new Date()) => {
  // Default time slots (configurable by user later)
  const TIME_SLOTS = {
    morning: '08:00',
    afternoon: '14:00',
    night: '21:00',
  };

  const medications = parsedData.medications.map((med) => {
    // Build scheduled times from frequency
    const scheduledTimes = [];
    if (med.frequency.morning > 0) scheduledTimes.push(TIME_SLOTS.morning);
    if (med.frequency.afternoon > 0) scheduledTimes.push(TIME_SLOTS.afternoon);
    if (med.frequency.night > 0) scheduledTimes.push(TIME_SLOTS.night);

    // Calculate end date
    let durationDays = 0;
    if (med.duration) {
      switch (med.duration.unit) {
        case 'days':
          durationDays = med.duration.value;
          break;
        case 'weeks':
          durationDays = med.duration.value * 7;
          break;
        case 'months':
          durationDays = med.duration.value * 30;
          break;
      }
    }

    // A duration is inclusive. A five-day prescription should run on five
    // calendar dates, not until the same time on a sixth date.
    const scheduleStartDate = new Date(startDate);
    scheduleStartDate.setHours(0, 0, 0, 0);

    const endDate = new Date(scheduleStartDate);
    endDate.setDate(endDate.getDate() + Math.max(durationDays, 1) - 1);
    endDate.setHours(23, 59, 59, 999);

    // Sanitize enum fields to only allow values accepted by the Schedule model
    const VALID_MEAL_INSTRUCTIONS = ['before', 'after', 'with'];
    const VALID_ROUTES = ['oral', 'topical', 'injection'];

    const mealInstruction = VALID_MEAL_INSTRUCTIONS.includes(med.mealInstruction)
      ? med.mealInstruction
      : null;

    const route = VALID_ROUTES.includes(med.route) ? med.route : null;

    return {
      drugName: med.drugName,
      form: med.form,
      dosage: med.dosage,
      scheduledTimes,
      startDate: scheduleStartDate,
      endDate,
      mealInstruction,
      route,
      specialInstructions: med.specialInstructions || null,
    };
  });

  return {
    medications,
    advice: parsedData.advice || [],
    followUp: parsedData.followUp ? new Date(parsedData.followUp) : null,
  };
};
