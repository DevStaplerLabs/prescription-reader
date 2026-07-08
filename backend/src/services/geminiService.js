import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

const getClient = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * Sends an image to Gemini 3.5 Flash for structured extraction.
 * @param {string} prompt - The system/user prompt describing what to extract
 * @param {Buffer} imageBuffer - The image buffer to analyze
 * @param {string} mimeType - The MIME type of the image (e.g., 'image/jpeg')
 * @returns {Promise<object>} Parsed JSON object from Gemini's response
 */
export const parseImageWithGemini = async (prompt, imageBuffer, mimeType = 'image/jpeg') => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const base64Image = imageBuffer.toString('base64');

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  // Attempt with retry (1 retry on failure)
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();

      // Parse the JSON response
      const parsed = JSON.parse(text);
      return parsed;
    } catch (error) {
      lastError = error;
      console.error(`Gemini attempt ${attempt + 1} failed:`, error.message);
      if (attempt < 1) {
        // Wait 1 second before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw new Error(`Gemini parsing failed after 2 attempts: ${lastError.message}`);
};

/**
 * Sends raw OCR text to Gemini for structured extraction (text-only fallback).
 * @param {string} prompt - The prompt describing what to extract
 * @param {string} ocrText - The raw OCR text to parse
 * @returns {Promise<object>} Parsed JSON object
 */
export const parseTextWithGemini = async (prompt, ocrText) => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  try {
    const result = await model.generateContent([
      `${prompt}\n\n--- RAW OCR TEXT ---\n${ocrText}`,
    ]);
    const response = result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini text parsing failed:', error.message);
    throw new Error(`Gemini text parsing failed: ${error.message}`);
  }
};
