import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { parsePrescriptionImage } from './src/services/nlpService.js';

const IMG = path.resolve('../dataset/prescription.jpg');

async function testLocal() {
  console.log('--- LOCAL TEST START ---');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set (starts with ' + process.env.GEMINI_API_KEY.substring(0, 8) + ')' : 'Not Set');
  console.log('GOOGLE_VISION_API:', process.env.GOOGLE_VISION_API ? 'Set (starts with ' + process.env.GOOGLE_VISION_API.substring(0, 8) + ')' : 'Not Set');

  const buffer = fs.readFileSync(IMG);
  try {
    const { data, warnings } = await parsePrescriptionImage(buffer, 'image/png');
    console.log('✅ Parse Succeeded!');
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Warnings:', warnings);
  } catch (err) {
    console.error('❌ Parse Failed:', err);
  }
}

testLocal();
