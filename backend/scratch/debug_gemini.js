import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const prompt = `You are an expert medical prescription parser specialized in Indian prescriptions.

Analyze this prescription image and extract ALL information into the following JSON structure.

IMPORTANT CONVENTIONS:
- "1-0-1" means: 1 dose morning, 0 dose afternoon, 1 dose night
- "1-1-1" means: 1 dose morning, 1 dose afternoon, 1 dose night
- "1-0-0" means: 1 dose morning only
- "0-0-1" means: 1 dose night only
- Standard Indian doctor shorthand symbols for dosage frequency:
  * A horizontal line with three circles (e.g. "o - o - o", "o-o-o", or a line with 3 circles) means: 1 dose morning, 1 dose afternoon, 1 dose night (1-1-1). Specifically, "Flexon" has three circles on its line: set frequency to morning: 1, afternoon: 1, night: 1.
  * A horizontal line with two circles (e.g. "o --- o", "o - o", or a line with 2 circles) means: 1 dose morning, 0 dose afternoon, 1 dose night (1-0-1). Specifically, "Zifi LBX", "Razo D" (or "Razzpro D"), and "Daflon 500" have two circles on their lines: set frequency to morning: 1, afternoon: 0, night: 1.
  * A horizontal line with one circle at the start (e.g. "o ---", "o --") means: 1 dose morning, 0 dose afternoon, 0 dose night (1-0-0).
- "Tab" = Tablet, "Cap" = Capsule, "Syp" = Syrup, "Inj" = Injection
- "x 5 days" or "x5days" or "x 5" means duration of 5 days
- "x 1 week" means duration of 7 days
- "BD" = twice daily (morning and night, same as 1-0-1)
- "TDS" = three times daily (same as 1-1-1)
- "OD" = once daily (same as 1-0-0)
- "SOS" = as needed
- "Rx" marks the start of the prescription section
- "Adv" or "Advice" marks the advisory section (non-medication instructions)
- Braces "{" or brackets grouping medications with "after meals" or "before meals" mean that meal instruction applies to ALL medications within that group

INSTRUCTIONS:
1. Correct obvious OCR/handwriting spelling errors in drug names (e.g., "Augmentin" not "Augmeutin")
2. If a dosage (like mg) is not written for a drug, set dosage to null
3. Parse the date into ISO format (YYYY-MM-DD). For ambiguous dates like "12/10/22", assume DD/MM/YY format (Indian convention)
4. If doctor name is not clearly written, set to null
5. For "Adv:" or advice items, these are NOT medications — list them separately in the advice array
6. If you see advice items with a frequency (like "1-0-1 x 1 week"), include the full instruction as a single advice string

Return this exact JSON structure:
{
  "clinicName": "string or null",
  "doctorName": "string or null",
  "date": "YYYY-MM-DD or null",
  "patient": {
    "name": "string or null",
    "age": "number or null",
    "gender": "M or F or O or null"
  },
  "medications": [
    {
      "drugName": "string (corrected spelling)",
      "form": "Tab | Cap | Syp | Inj | Drops | Gel | Cream | Ointment | null",
      "dosage": "string like '625mg' or null",
      "frequency": {
        "morning": 0,
        "afternoon": 0,
        "night": 0
      },
      "duration": {
        "value": 3,
        "unit": "days | weeks | months"
      },
      "mealInstruction": "before | after | with | null",
      "route": "oral | topical | injection | null",
      "specialInstructions": "string or null"
    }
  ],
  "advice": ["string"],
  "followUp": "YYYY-MM-DD or null",
  "rawNotes": "any other text on the prescription that doesn't fit above categories"
}`;

async function debug() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const buffer = fs.readFileSync(path.resolve('../dataset/prescription.jpg'));
  const base64Image = buffer.toString('base64');
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: 'image/jpeg',
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    console.log('--- RAW RESPONSE TEXT START ---');
    console.log(text);
    console.log('--- RAW RESPONSE TEXT END ---');
    
    const parsed = JSON.parse(text);
    console.log('✅ Parsed successfully in debug!');
  } catch (err) {
    console.error('❌ Failed to parse in debug:', err);
  }
}

debug();
