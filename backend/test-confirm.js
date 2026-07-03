import http from 'http';

// This is the exact parsedData + rawOcrText we got back from the /parse test
const payload = JSON.stringify({
  rawOcrText: "Smile Designing | Teeth Whitening\nDental Implants | General Dentistry\n12/10/22\nafte\nmeals\nRx,\nTHE WHITE TUSK\n0/whitetuskdental\nMr. Sachin Sansare.\n28/m\nTab. Augmentin 625mg\n1 - e\nTab Enzflam\n1- 0-1 x\nbefore {Tab. PanD 40mg\nmeals\n1-0-0\nx 5 days\n5 days\nx 5 days\nAdv: Hexigel gum paint\nmassage\n1-0\nX1week\nCenite\nPh: +91 8108112511 | Web: www.thewhitetusk.com | Email: info@thewhitetusk.com",
  parsedData: {
    clinicName: "THE WHITE TUSK",
    doctorName: null,
    date: "2022-10-12",
    patient: {
      name: "Sachin Sansare",
      age: 28,
      gender: "M",
      phone: "918178243681"
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
      },
      {
        drugName: "Enzoflam",
        form: "Tab",
        dosage: null,
        frequency: { morning: 1, afternoon: 0, night: 1 },
        duration: { value: 5, unit: "days" },
        mealInstruction: "after",
        route: "oral",
        specialInstructions: null
      },
      {
        drugName: "Pan D",
        form: "Tab",
        dosage: "40mg",
        frequency: { morning: 1, afternoon: 0, night: 0 },
        duration: { value: 5, unit: "days" },
        mealInstruction: "before",
        route: "oral",
        specialInstructions: null
      }
    ],
    advice: ["Hexigel gum paint massage 1-0-1 x 1 week"],
    followUp: null,
    rawNotes: "Smile Designing | Teeth Whitening | Dental Implants | General Dentistry. Ph: +91 8108112511 | Web: www.thewhitetusk.com | Email: info@thewhitetusk.com"
  }
});

console.log('Sending confirmed prescription data to POST /api/prescriptions/confirm ...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/prescriptions/confirm',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('\n=== RESPONSE ===\n');
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log('Raw response:', data.substring(0, 1000));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(payload);
req.end();
