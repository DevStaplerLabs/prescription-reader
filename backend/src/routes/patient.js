import express from 'express';
import Patient from '../models/Patient.js';
import { sendOnboardingMessage } from '../services/notificationService.js';

const router = express.Router();

// POST /api/patients/onboard - Save patient details and send a WhatsApp welcome message
router.post('/onboard', async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required.',
      });
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number is required.',
      });
    }

    // Clean phone number (keep only digits)
    let cleanPhone = phone.replace(/[^0-9]/g, '');

    // Prepend standard Indian country code if standard 10-digit number
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    if (cleanPhone.length < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid phone number.',
      });
    }

    console.log(`[Patient Onboard] Processing registration for: ${name.trim()} (${cleanPhone})...`);

    // Upsert the Patient document
    const patient = await Patient.findOneAndUpdate(
      { phone: cleanPhone },
      { name: name.trim() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send onboarding welcome message via WhatsApp
    // We run it with try/catch to ensure WhatsApp failures do not block successful onboarding.
    try {
      console.log(`[Patient Onboard] Sending welcome onboarding WhatsApp message to ${cleanPhone}...`);
      await sendOnboardingMessage(cleanPhone, patient.name);
    } catch (wpError) {
      console.error(`[Patient Onboard] Optional WhatsApp onboarding welcome message failed:`, wpError.message);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Patient registered/updated successfully.',
      data: {
        patient: {
          id: patient._id,
          name: patient.name,
          phone: patient.phone,
          onboardedAt: patient.onboardedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
