import express from 'express';
import upload from '../middleware/upload.js';
import {
  uploadPrescription,
  parsePrescription,
  confirmPrescription,
} from '../controllers/prescriptionController.js';

const router = express.Router();

// POST /api/prescriptions/upload - Returns raw OCR text only
router.post('/upload', upload.single('image'), uploadPrescription);

// POST /api/prescriptions/parse - OCR + Gemini Vision parsing → structured JSON for verification
router.post('/parse', upload.single('image'), parsePrescription);

// POST /api/prescriptions/confirm - Save verified prescription + generate schedule
router.post('/confirm', confirmPrescription);

export default router;
