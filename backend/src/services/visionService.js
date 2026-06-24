import vision from '@google-cloud/vision';

let client;

const getClient = () => {
  if (!client) {
    client = new vision.ImageAnnotatorClient({
      fallback: true,
      apiKey: process.env.GOOGLE_VISION_API,
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
