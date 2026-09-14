import { extractTextFromImage } from '../services/visionService.js';
import { parsePrescriptionImage, generateScheduleFromParsed } from '../services/nlpService.js';
import { parseTextWithGemini } from '../services/geminiService.js';
import Prescription from '../models/Prescription.js';
import Schedule from '../models/Schedule.js';
import Patient from '../models/Patient.js';

/**
 * Uploads prescription image and returns raw OCR text
 * POST /api/prescriptions/upload
 */
export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload an image file.'
      });
    }

    const rawText = await extractTextFromImage(req.file.buffer);

    return res.status(200).json({
      status: 'success',
      message: 'Prescription text extracted successfully.',
      data: {
        rawText: rawText
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Parses a prescription image using Gemini Vision.
 * Returns structured JSON for the client to verify — does NOT save to DB.
 * POST /api/prescriptions/parse
 */
export const parsePrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload an image file.',
      });
    }

    // Determine MIME type from the uploaded file
    const mimeType = req.file.mimetype || 'image/jpeg';

    // Step 1: Parse the image directly with Gemini Vision (Very fast!)
    const { data: parsedData, warnings } = await parsePrescriptionImage(
      req.file.buffer,
      mimeType
    );

    // Step 2: Set rawOcrText from parsed rawNotes, or optionally run OCR if configured
    let rawOcrText = parsedData.rawNotes || '';
    if (!rawOcrText && process.env.GOOGLE_VISION_API && process.env.GOOGLE_VISION_API !== 'your_google_vision_api_key_here') {
      try {
        rawOcrText = await extractTextFromImage(req.file.buffer);
      } catch (ocrErr) {
        console.warn('[prescriptionController] Optional Vision OCR failed:', ocrErr.message);
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Prescription parsed successfully. Please verify the data.',
      data: {
        rawOcrText,
        parsedData,
        warnings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Saves a user-verified prescription and generates the medication schedule.
 * POST /api/prescriptions/confirm
 */
export const confirmPrescription = async (req, res, next) => {
  try {
    const { rawOcrText, parsedData } = req.body;

    if (!parsedData || !parsedData.medications || parsedData.medications.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No medication data provided. Cannot create schedule.',
      });
    }

    // Resolve patientId relationship using the phone number
    let patientId = null;
    const patientPhone = parsedData.patient?.phone;
    if (patientPhone) {
      let cleanPhone = patientPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
      }
      const patient = await Patient.findOne({ phone: cleanPhone });
      if (patient) {
        patientId = patient._id;
      }
    }

    // Save the prescription record
    const prescription = new Prescription({
      patientId: patientId,
      rawOcrText: rawOcrText || '',
      extractedData: {
        clinicName: parsedData.clinicName || null,
        doctorName: parsedData.doctorName || null,
        date: parsedData.date ? new Date(parsedData.date) : null,
        patient: parsedData.patient || {},
        medications: parsedData.medications,
        advice: parsedData.advice || [],
        followUp: parsedData.followUp ? new Date(parsedData.followUp) : null,
        rawNotes: parsedData.rawNotes || null,
      },
      userVerified: true,
    });

    await prescription.save();

    // Generate the schedule from the parsed data
    const scheduleData = generateScheduleFromParsed(parsedData);

    // Deactivate existing active schedules for this patient only
    const deactivateQuery = { isActive: true };
    if (patientId) {
      deactivateQuery.patientId = patientId;
    } else if (patientPhone) {
      deactivateQuery.patientPhone = patientPhone;
    }
    await Schedule.updateMany(deactivateQuery, { isActive: false });

    // Create the new schedule
    const schedule = new Schedule({
      prescriptionId: prescription._id,
      patientId: patientId,
      patientPhone: patientPhone || null,
      medications: scheduleData.medications,
      advice: scheduleData.advice,
      followUp: scheduleData.followUp,
      isActive: true,
    });

    await schedule.save();

    return res.status(201).json({
      status: 'success',
      message: 'Prescription confirmed and schedule created.',
      data: {
        prescriptionId: prescription._id,
        scheduleId: schedule._id,
        schedule: schedule,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generates dynamic disease-specific triage questions to assess criticality.
 * POST /api/prescriptions/triage-questions
 */
export const generateTriageQuestions = async (req, res, next) => {
  try {
    const {
      userMessage,
      knownConditions = [],
      askedQuestions = [],
      chatHistory = [],
      lang = 'en'
    } = req.body;

    if (!userMessage) {
      return res.status(400).json({ status: 'error', message: 'userMessage is required' });
    }

    const isFirst = knownConditions.length === 0;
    const prompt = `You are an expert Clinical Triage AI assistant in an OPD hospital kiosk.
Analyze the patient's latest message in context of the conversation and determine if a medical condition, symptom, or disease is mentioned.
Language for questions and acknowledgment: ${lang === 'hi' ? 'Hindi (Devanagari script)' : 'English'}.

Current known conditions so far: ${JSON.stringify(knownConditions)}
Questions already asked: ${JSON.stringify(askedQuestions)}

INSTRUCTIONS:
1. Detect if a medical condition, disease, or symptom is mentioned in the latest message.
   - If it is already covered in known conditions, or if the user is just answering a question (e.g. "since 3 days", "no fever", "yes it hurts", "nothing else"), set "newCondition": null.
   - If a new condition/symptom is mentioned (e.g. "pimples on face", "chest burning", "vomiting", "knee pain"), set "newCondition" to the concise name of that condition (e.g. "Acne / Facial Pimples").
2. Question Generation:
   - If "newCondition" is detected and knownConditions is empty (FIRST condition):
     Generate exactly 4 essential, disease-specific must-ask questions for that condition to determine whether the patient is in a critical, urgent, or non-urgent condition. Prioritize questions about red-flag symptoms, severity, duration, progression, associated symptoms, and other factors that could indicate a potentially serious condition. Do NOT ask unrelated questions.
   - If "newCondition" is detected and knownConditions is NOT empty (ADDITIONAL condition):
     Generate exactly 3 must-ask questions that are relevant to BOTH the previously identified conditions (${knownConditions.join(', ')}) AND the newly mentioned condition, assessing the combined clinical situation.
   - If "newCondition" is null (patient is answering):
     Set "generatedQuestions": [].
3. Ensure questions are simple, compassionate, and understandable to a normal patient, not overly technical.
4. Strictly avoid duplicate questions that have already been asked in Questions already asked.

Return valid JSON:
{
  "newCondition": "string or null",
  "generatedQuestions": ["string", ...],
  "briefAcknowledgment": "Short natural 3-6 word acknowledgment in ${lang === 'hi' ? 'Hindi' : 'English'}"
}`;

    const parsed = await parseTextWithGemini(prompt, userMessage);
    return res.status(200).json({
      status: 'success',
      data: parsed
    });
  } catch (error) {
    next(error);
  }
};
