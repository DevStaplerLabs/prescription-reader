import fs from 'fs';

const API = 'https://doc-api.staplerlabs.com/api';
const IMG = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\4614b97a-7657-4e67-8091-94d5d113d38d\\media__1783432806669.png';

async function testFullFlow() {
  console.log('--- TEST: End-To-End Parse & Confirm ---');
  
  // 1. Parse Image
  const buffer = fs.readFileSync(IMG);
  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'image/png' });
  formData.append('image', blob, 'prescription.png');

  console.log('Sending parse request...');
  const parseRes = await fetch(`${API}/prescriptions/parse`, {
    method: 'POST',
    body: formData
  });
  
  const parseJson = await parseRes.json();
  if (parseJson.status !== 'success') {
    console.error('❌ Parse failed:', parseJson);
    return;
  }
  
  console.log('✅ Parse succeeded!');
  const parsedData = parseJson.data.parsedData;
  const rawOcrText = parseJson.data.rawOcrText;

  // Let's modify parsedData.patient.phone to match a test phone number
  const testPhone = '919818549572';
  if (!parsedData.patient) parsedData.patient = {};
  parsedData.patient.phone = testPhone;

  // 2. Confirm Schedule
  const confirmPayload = {
    rawOcrText: rawOcrText || '',
    parsedData: parsedData
  };

  console.log('Sending confirm request with payload:', JSON.stringify(confirmPayload, null, 2));
  const confirmRes = await fetch(`${API}/prescriptions/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(confirmPayload)
  });
  
  const confirmJson = await confirmRes.json();
  console.log('Response Status:', confirmRes.status);
  console.log('Response Body:', JSON.stringify(confirmJson, null, 2));
}

testFullFlow();
