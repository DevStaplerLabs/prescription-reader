import { extractTextFromImage } from '../services/visionService.js';
import { parsePrescriptionImage, generateScheduleFromParsed } from '../services/nlpService.js';
import Prescription from '../models/Prescription.js';
import Schedule from '../models/Schedule.js';

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

    // Step 1: Extract raw OCR text (for storage and fallback)
    const rawOcrText = await extractTextFromImage(req.file.buffer);

    // Step 2: Parse the image directly with Gemini Vision
    const { data: parsedData, warnings } = await parsePrescriptionImage(
      req.file.buffer,
      mimeType
    );

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

    // Save the prescription record
    const prescription = new Prescription({
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

    // Deactivate any existing active schedules
    await Schedule.updateMany({ isActive: true }, { isActive: false });

    // Create the new schedule
    const schedule = new Schedule({
      prescriptionId: prescription._id,
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
