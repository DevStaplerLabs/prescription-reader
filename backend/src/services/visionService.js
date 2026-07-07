import vision from '@google-cloud/vision';

let client;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.GOOGLE_VISION_API;
    if (!apiKey || apiKey === 'your_google_vision_api_key_here' || apiKey.trim() === '') {
      console.warn('[visionService] GOOGLE_VISION_API is not set or empty. Skipping OCR initialization.');
      return null;
    }
    client = new vision.ImageAnnotatorClient({
      fallback: true,
      apiKey: apiKey,
    });
  }
  return client;
};

/**
 * Extracts raw text from an image buffer using Google Cloud Vision API (DOCUMENT_TEXT_DETECTION)
 * @param {Buffer} imageBuffer - The buffer of the uploaded image
 * @returns {Promise<string>} The extracted text
 */
export const extractTextFromImage = async (imageBuffer) => {
  try {
    if (!imageBuffer) {
      throw new Error('No image buffer provided');
    }
    
    const visionClient = getClient();
    if (!visionClient) {
      throw new Error('Vision API client not initialized due to missing or invalid API key.');
    }
    const [result] = await visionClient.documentTextDetection({
      image: { content: imageBuffer },
    });
    
    const fullTextAnnotation = result.fullTextAnnotation;
    return fullTextAnnotation ? fullTextAnnotation.text : '';
  } catch (error) {
    console.error('Vision API error:', error);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};
