import { extractTextFromImage } from '../services/visionService.js';

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
