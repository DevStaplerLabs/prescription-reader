import { sendMedicationReminder } from '../src/services/notificationService.js';

const runTest = async () => {
  const recipient = process.argv[2];

  if (!recipient) {
    console.error('Error: Please provide a recipient phone number with country code.');
    console.error('Usage: node scratch/test-whatsapp.js <country_code><phone_number>');
    console.error('Example: node scratch/test-whatsapp.js 919876543210');
    process.exit(1);
  }

  console.log(`Starting WhatsApp medication reminder test targeting: ${recipient}...`);

  try {
    const response = await sendMedicationReminder(
      recipient,
      'John Doe',          // patientName ({{1}})
      '08:00 AM',          // scheduledTime ({{2}})
      [
        { drugName: 'Amoxicillin 500mg', dosage: '1 capsule' },
        { drugName: 'Vitamin D3', dosage: '1 tablet' },
      ],                  // newline-separated medicine list ({{3}})
      'medication_reminder_v3',
    );
    console.log('\n--- Success! ---');
    console.log(JSON.stringify(response, null, 2));
    console.log('Check your WhatsApp app on your phone. You should have received the medication reminder.');
  } catch (error) {
    console.error('\n--- Test Failed ---');
    console.error(error.message);
    process.exit(1);
  }
};

runTest();
