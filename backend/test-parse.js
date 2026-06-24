import fs from 'fs';
import path from 'path';
import http from 'http';

const imagePath = path.resolve('../dataset/prescription.jpg');
const imageBuffer = fs.readFileSync(imagePath);

const boundary = '----FormBoundary' + Date.now();
const CRLF = '\r\n';

// Build the multipart body properly
const header = `--${boundary}${CRLF}Content-Disposition: form-data; name="image"; filename="prescription.jpg"${CRLF}Content-Type: image/jpeg${CRLF}${CRLF}`;
const footer = `${CRLF}--${boundary}--${CRLF}`;

const bodyParts = [Buffer.from(header), imageBuffer, Buffer.from(footer)];
const body = Buffer.concat(bodyParts);

console.log(`Sending ${(imageBuffer.length / 1024).toFixed(1)} KB image to POST /api/prescriptions/parse ...`);
console.log('Waiting for response (this may take 10-30s)...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/prescriptions/parse',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': body.length,
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
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(body);
req.end();
