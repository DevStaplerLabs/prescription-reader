import dotenv from 'dotenv';
dotenv.config();

// Define a test runner
async function runTest() {
  const PORT = process.env.PORT || 5000;
  const url = `http://localhost:${PORT}/api/patients/onboard`;
  
  const payload = {
    name: 'Test Onboard User',
    phone: '9876543210'
  };

  console.log(`Sending POST request to ${url} with payload:`, payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok && data.status === 'success') {
      console.log('✅ Onboarding test passed!');
    } else {
      console.log('❌ Onboarding test failed.');
    }
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
}

runTest();
