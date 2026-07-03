import { sendWhatsAppTemplate } from '../src/services/notificationService.js';

const runTest = async () => {
  const recipient = process.argv[2];

  if (!recipient) {
    console.error('Error: Please provide a recipient phone number with country code.');
    console.error('Usage: node scratch/test-whatsapp.js <country_code><phone_number>');
    console.error('Example: node scratch/test-whatsapp.js 919876543210');
    process.exit(1);
  }

  console.log(`Starting WhatsApp notification test targeting: ${recipient}...`);

  try {
    // Send the default "hello_world" template which has no parameters and works instantly in sandbox
    const response = await sendWhatsAppTemplate(recipient, 'hello_world');
    console.log('\n--- Success! ---');
    console.log(JSON.stringify(response, null, 2));
    console.log('Check your WhatsApp app on your phone. You should have received a hello world message.');
  } catch (error) {
    console.error('\n--- Test Failed ---');
    console.error(error.message);
    process.exit(1);
  }
};

runTest();
