import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB directly to verify records
import Patient from '../src/models/Patient.js';
import Prescription from '../src/models/Prescription.js';
import Schedule from '../src/models/Schedule.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function cleanDB(phone) {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  await Patient.deleteMany({ phone: cleanPhone });
  console.log(`🧹 Cleaned up existing Patient records for: ${cleanPhone}`);
}

async function runE2ETest() {
  console.log('--- STARTING E2E INTEGRATION TEST ---');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected directly to MongoDB.');

  const testPhone = '918178243681';
  await cleanDB(testPhone);

  // Step 1: Onboard patient
  const onboardUrl = `${BASE_URL}/patients/onboard`;
  console.log(`\n[Step 1] Onboarding patient at: ${onboardUrl}`);
  const onboardRes = await fetch(onboardUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Sachin Sansare', phone: testPhone })
  });
  
  const onboardData = await onboardRes.json();
  console.log('Onboard Status:', onboardRes.status);
  console.log('Onboard Data:', JSON.stringify(onboardData, null, 2));

  if (!onboardRes.ok || onboardData.status !== 'success') {
    throw new Error('Onboarding failed.');
  }

  const patientId = onboardData.data.patient.id;
  console.log(`✅ Onboarded patient has ID: ${patientId}`);

  // Step 2: Confirm prescription
  const confirmUrl = `${BASE_URL}/prescriptions/confirm`;
  console.log(`\n[Step 2] Confirming prescription at: ${confirmUrl}`);
  const confirmPayload = {
    rawOcrText: "Mock Prescription OCR Text",
    parsedData: {
      clinicName: "THE WHITE TUSK",
      doctorName: null,
      date: "2022-10-12",
      patient: {
        name: "Sachin Sansare",
        age: 28,
        gender: "M",
        phone: testPhone
      },
      medications: [
        {
          drugName: "Augmentin",
          form: "Tab",
          dosage: "625mg",
          frequency: { morning: 1, afternoon: 0, night: 1 },
          duration: { value: 5, unit: "days" },
          mealInstruction: "after",
          route: "oral",
          specialInstructions: null
        }
      ],
      advice: ["Hexigel gum paint massage"],
      followUp: null,
      rawNotes: "Some raw notes"
    }
  };

  const confirmRes = await fetch(confirmUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(confirmPayload)
  });

  const confirmData = await confirmRes.json();
  console.log('Confirm Status:', confirmRes.status);
  console.log('Confirm Data:', JSON.stringify(confirmData, null, 2));

  if (!confirmRes.ok || confirmData.status !== 'success') {
    throw new Error('Confirm failed.');
  }

  console.log('✅ Prescription confirmed.');

  // Step 3: Verify records in Database directly
  console.log('\n[Step 3] Verifying relationships directly in Database...');
  const prescriptionId = confirmData.data.prescriptionId;
  const scheduleId = confirmData.data.scheduleId;

  const dbPrescription = await Prescription.findById(prescriptionId);
  const dbSchedule = await Schedule.findById(scheduleId);

  console.log('Database Prescription patientId:', dbPrescription.patientId?.toString());
  console.log('Database Schedule patientId:', dbSchedule.patientId?.toString());

  if (dbPrescription.patientId?.toString() === patientId && dbSchedule.patientId?.toString() === patientId) {
    console.log('✅ PatientId relationship verified successfully in DB!');
  } else {
    throw new Error('❌ PatientId mismatch in DB.');
  }

  // Step 4: Fetch Active Schedules via API
  const activeUrl = `${BASE_URL}/schedules/active?patientPhone=${testPhone}`;
  console.log(`\n[Step 4] Fetching active schedule via API at: ${activeUrl}`);
  const activeRes = await fetch(activeUrl);
  const activeData = await activeRes.json();

  console.log('Active Schedule Status:', activeRes.status);
  console.log('Active Schedule Data:', JSON.stringify(activeData, null, 2));

  if (activeRes.ok && activeData.status === 'success' && activeData.data.schedule.patientId === patientId) {
    console.log('✅ Active Schedule query using patientId relationship works perfectly!');
  } else {
    throw new Error('❌ Active Schedule verification failed.');
  }

  console.log('\n🎉 ALL E2E INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
  await mongoose.disconnect();
}

runE2ETest().catch(async (err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  await mongoose.disconnect();
});
