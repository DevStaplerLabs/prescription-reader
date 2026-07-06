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
      'Amoxicillin 500mg', // drugName ({{2}})
      '1 capsule',         // dosage ({{3}})
      '08:00 AM'           // scheduledTime ({{4}})
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
