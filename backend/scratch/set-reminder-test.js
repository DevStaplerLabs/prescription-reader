import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Prescription from '../src/models/Prescription.js';
import Schedule from '../src/models/Schedule.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    // Get current time in Indian Standard Time (IST)
    const now = new Date();
    // Add 1 minute to get the "next minute"
    const nextMin = new Date(now.getTime() + 60 * 1000);

    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
    const nextTimeStr = nextMin.toLocaleTimeString('en-US', options);

    console.log(`Current time (UTC): ${now.toISOString()}`);
    console.log(`Setting schedule for next minute (IST): ${nextTimeStr}`);

    // Create a mock prescription first
    const prescription = new Prescription({
      rawOcrText: 'Test prescription text',
      extractedData: {
        clinicName: 'Test Clinic',
        patient: {
          name: 'Rudra',
          phone: '918178243681',
        },
        medications: [
          {
            drugName: 'Amoxicillin',
            form: 'Cap',
            dosage: '500mg',
          }
        ]
      },
      userVerified: true,
    });
    await prescription.save();

    // Deactivate previous active schedules
    await Schedule.updateMany({ isActive: true }, { isActive: false });

    // Set date boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Create schedule
    const schedule = new Schedule({
      prescriptionId: prescription._id,
      patientPhone: '918178243681',
      medications: [
        {
          drugName: 'Amoxicillin 500mg',
          form: 'Cap',
          dosage: '1 capsule',
          scheduledTimes: [nextTimeStr],
          startDate: todayStart,
          endDate: todayEnd,
        }
      ],
      isActive: true,
    });

    await schedule.save();
    console.log(`Successfully created active schedule in DB for phone: 918178243681 at time: ${nextTimeStr}`);
    process.exit(0);
  } catch (err) {
    console.error('Error setting reminder test:', err);
    process.exit(1);
  }
};

run();
