import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import Schedule from '../src/models/Schedule.js';
import Prescription from '../src/models/Prescription.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    // Find or create a dummy prescription to reference
    let prescription = await Prescription.findOne();
    if (!prescription) {
      prescription = new Prescription({
        rawOcrText: 'Test prescription',
        extractedData: {
          patient: { name: 'Sachin Sansare', age: 28, gender: 'M', phone: '918178243681' },
          medications: []
        },
        userVerified: true
      });
      await prescription.save();
    }

    // Deactivate all existing active schedules to avoid multiple reminder dispatches during testing
    await Schedule.updateMany({ isActive: true }, { isActive: false });

    // Calculate next minute's time in IST (current time + 1 minute)
    const now = new Date();
    const testTime = new Date(now.getTime() + 60000);
    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
    const targetTimeStr = testTime.toLocaleTimeString('en-US', options);

    console.log(`Setting up test schedule with reminder time: ${targetTimeStr} IST`);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const schedule = new Schedule({
      prescriptionId: prescription._id,
      patientPhone: '918178243681',
      isActive: true,
      medications: [
        {
          drugName: 'Augmentin 625mg',
          dosage: '1 Tablet',
          scheduledTimes: [targetTimeStr],
          startDate: todayStart,
          endDate: todayEnd
        }
      ]
    });

    await schedule.save();
    console.log('Test schedule saved successfully in MongoDB.');
    console.log(`\nNext step:\n1. Start the API server.\n2. Wait for the clock to hit ${targetTimeStr} (within 1 minute).\n3. Check your terminal output and WhatsApp for the notification!`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error running setup:', error);
    process.exit(1);
  }
};

run();
