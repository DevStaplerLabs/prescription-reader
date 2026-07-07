import fs from 'fs';
import path from 'path';

const API = 'https://prescription-reader-production.up.railway.app/api';
const IMG = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\4614b97a-7657-4e67-8091-94d5d113d38d\\media__1783432806669.png';

async function testParse() {
  console.log('--- TEST 1: Prescription Parse (simulates gallery upload) ---');
  
  // Read file as Buffer
  const buffer = fs.readFileSync(IMG);
  // Using native FormData and Blob in Node 24
  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  formData.append('image', blob, 'prescription.jpg');

  const res = await fetch(`${API}/prescriptions/parse`, {
    method: 'POST',
    body: formData
  });
  
  const json = await res.json();

  if (json.status === 'success') {
    const meds = json.data?.parsedData?.medications ?? [];
    console.log(`✅ Parsed ${meds.length} medication(s):`);
    meds.forEach((m, i) => {
      const freq = m.frequency;
      console.log(`  ${i+1}. ${m.drugName} ${m.dosage || ''} | ${freq.morning}-${freq.afternoon}-${freq.night} | ${m.duration?.value ?? 3} ${m.duration?.unit ?? 'days'}`);
    });
    console.log('\nDoctor:', json.data?.parsedData?.doctorName);
    console.log('Clinic:', json.data?.parsedData?.clinicName);
    console.log('Patient:', json.data?.parsedData?.patient?.name);
  } else {
    console.log('❌ Parse failed:', JSON.stringify(json, null, 2));
  }
}

async function testActiveSchedules() {
  console.log('\n--- TEST 2: Active Schedules ---');
  const res = await fetch(`${API}/schedules/active`);
  const json = await res.json();
  if (json.status === 'success') {
    const meds = json.data?.schedule?.medications ?? [];
    console.log(`✅ Active schedule has ${meds.length} medication(s):`);
    meds.forEach(m => console.log(`  - ${m.drugName} at ${m.scheduledTimes?.join(', ')}`));
  } else {
    console.log('ℹ️ No active schedule:', json.message);
  }
}

async function testHistory() {
  console.log('\n--- TEST 3: Schedule History (after discontinue) ---');
  const res = await fetch(`${API}/schedules/history?patientPhone=919818549572`);
  const json = await res.json();
  if (json.status === 'success') {
    const history = json.data?.history ?? [];
    console.log(`✅ Found ${history.length} past schedule(s) in history`);
    history.forEach((h, i) => {
      const meds = h.medications ?? [];
      console.log(`  ${i+1}. ${meds.length} med(s) | active=${h.isActive} | created=${h.createdAt}`);
    });
  } else {
    console.log('❌ History failed:', json.message);
  }
}

(async () => {
  try {
    await testParse();
    await testActiveSchedules();
    await testHistory();
  } catch(e) {
    console.error('Test error:', e.message);
  }
})();
