import express from 'express';
import upload from '../middleware/upload.js';
import { uploadPrescription } from '../controllers/prescriptionController.js';

const router = express.Router();

// POST /api/prescriptions/upload - Public endpoint to process image and return OCR text
router.post('/upload', upload.single('image'), uploadPrescription);

export default router;
